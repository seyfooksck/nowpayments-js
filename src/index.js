/**
 * NOWPayments Integration Module
 * Provides separate wallet addresses and payment system for each user
 */

const NowPaymentsClient = require('./client');
const DepositManager = require('./modules/deposit');
const PayoutManager = require('./modules/payout');
const CustodyManager = require('./modules/custody');
const IPNHandler = require('./modules/ipn');
const CurrencyManager = require('./modules/currency');
const CustomerManager = require('./modules/customer');

class NowPayments {
    /**
     * Initializes the NOWPayments module
     * @param {Object} config - Configuration options
     * @param {string} config.apiKey - NOWPayments API key
     * @param {string} config.ipnSecret - Secret key for IPN verification
     * @param {string} [config.email] - Account email for payout operations
     * @param {string} [config.password] - Account password for payout operations
     * @param {boolean} [config.sandbox=false] - Enables sandbox mode
     * @param {string} [config.ipnCallbackUrl] - Default IPN callback URL
     */
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('API key is required');
        }

        this.config = {
            sandbox: false,
            ...config
        };

        // Initialize main API client
        this.client = new NowPaymentsClient(this.config);

        // Initialize sub-modules
        this.deposit = new DepositManager(this.client, this.config);
        this.payout = new PayoutManager(this.client, this.config);
        this.custody = new CustodyManager(this.client, this.config);
        this.ipn = new IPNHandler(this.config);
        this.currency = new CurrencyManager(this.client);
        this.customers = new CustomerManager(this.client, this.config);
    }

    /**
     * Checks API status
     * @returns {Promise<Object>} API status information
     */
    async getStatus() {
        return this.client.getStatus();
    }

    /**
     * Creates unique deposit address for user
     * @param {Object} options - Deposit options
     * @param {string} options.userId - User unique ID
     * @param {string} options.payCurrency - Crypto for payment (btc, eth, usdt, etc.)
     * @param {string} [options.ipnCallbackUrl] - IPN callback URL
     * @param {string} [options.orderId] - Order ID
     * @param {string} [options.orderDescription] - Order description
     * @returns {Promise<Object>} Deposit address information
     */
    async createUserDepositAddress(options) {
        return this.deposit.createDepositAddress(options);
    }

    /**
     * Sends payout (withdrawal) to user
     * @param {Object} options - Payout options
     * @param {string} options.userId - User ID
     * @param {string} options.address - Destination wallet address
     * @param {number} options.amount - Amount to send
     * @param {string} options.currency - Cryptocurrency
     * @param {string} [options.ipnCallbackUrl] - IPN callback URL
     * @returns {Promise<Object>} Payout information
     */
    async createUserPayout(options) {
        return this.payout.createPayout(options);
    }

    /**
     * Checks payment status
     * @param {string|number} paymentId - Payment ID
     * @returns {Promise<Object>} Payment status
     */
    async getPaymentStatus(paymentId) {
        return this.client.getPaymentStatus(paymentId);
    }

    /**
     * Verifies IPN callback
     * @param {Object} payload - Callback payload
     * @param {string} signature - x-nowpayments-sig header value
     * @returns {boolean} Verification result
     */
    verifyIPNCallback(payload, signature) {
        return this.ipn.verifySignature(payload, signature);
    }
}

// Statik sabitler
NowPayments.PAYMENT_STATUS = {
    WAITING: 'waiting',
    CONFIRMING: 'confirming',
    CONFIRMED: 'confirmed',
    SENDING: 'sending',
    PARTIALLY_PAID: 'partially_paid',
    FINISHED: 'finished',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    EXPIRED: 'expired'
};

NowPayments.PAYOUT_STATUS = {
    WAITING: 'WAITING',
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    FINISHED: 'FINISHED',
    FAILED: 'FAILED',
    REJECTED: 'REJECTED'
};

module.exports = NowPayments;
module.exports.NowPayments = NowPayments;
module.exports.NowPaymentsClient = NowPaymentsClient;
module.exports.DepositManager = DepositManager;
module.exports.PayoutManager = PayoutManager;
module.exports.CustodyManager = CustodyManager;
module.exports.IPNHandler = IPNHandler;
module.exports.CurrencyManager = CurrencyManager;
module.exports.CustomerManager = CustomerManager;
