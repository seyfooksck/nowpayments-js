/**
 * NOWPayments API Client
 * Manages basic HTTP requests
 */

const axios = require('axios');

class NowPaymentsClient {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.sandbox = config.sandbox || false;
        this.email = config.email;
        this.password = config.password;
        this.jwtToken = null;

        // API URLs
        this.baseUrl = this.sandbox 
            ? 'https://api-sandbox.nowpayments.io/v1'
            : 'https://api.nowpayments.io/v1';

        // Create Axios instance
        this.http = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            },
            timeout: 30000
        });

        // Response interceptor - error handling
        this.http.interceptors.response.use(
            response => response.data,
            error => {
                const errorData = error.response?.data || {};
                const customError = new Error(errorData.message || error.message);
                customError.code = errorData.code || error.code;
                customError.statusCode = error.response?.status;
                customError.details = errorData;
                throw customError;
            }
        );
    }

    /**
     * JWT Token authentication (required for Payout operations)
     * @returns {Promise<string>} JWT Token
     */
    async authenticate() {
        if (!this.email || !this.password) {
            throw new Error('Email and password are required for payout operations');
        }

        const response = await this.http.post('/auth', {
            email: this.email,
            password: this.password
        });

        this.jwtToken = response.token;
        return this.jwtToken;
    }

    /**
     * Sends request with JWT Token
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body or params
     * @returns {Promise<Object>} Response
     */
    async authenticatedRequest(method, endpoint, data = null) {
        if (!this.jwtToken) {
            await this.authenticate();
        }

        const config = {
            method,
            url: endpoint,
            headers: {
                'Authorization': `Bearer ${this.jwtToken}`
            }
        };

        if (data) {
            if (method === 'get' || method === 'delete') {
                // Send as params for GET and DELETE
                config.params = data.params || data;
            } else {
                // Send as body for POST, PUT, PATCH
                config.data = data;
            }
        }

        return this.http.request(config);
    }

    /**
     * Checks API status
     * @returns {Promise<Object>}
     */
    async getStatus() {
        return this.http.get('/status');
    }

    // ==================== PAYMENT OPERATIONS ======================================

    /**
     * Creates new payment (gets deposit address)
     * @param {Object} params - Payment parameters
     * @returns {Promise<Object>}
     */
    async createPayment(params) {
        return this.http.post('/payment', params);
    }

    /**
     * Creates invoice
     * @param {Object} params - Invoice parameters
     * @returns {Promise<Object>}
     */
    async createInvoice(params) {
        return this.http.post('/invoice', params);
    }

    /**
     * Queries payment status
     * @param {string|number} paymentId - Payment ID
     * @returns {Promise<Object>}
     */
    async getPaymentStatus(paymentId) {
        return this.http.get(`/payment/${paymentId}`);
    }

    /**
     * Lists all payments
     * @param {Object} params - Filter parameters
     * @returns {Promise<Object>}
     */
    async getPayments(params = {}) {
        return this.http.get('/payment/', { params });
    }

    // ==================== CURRENCY OPERATIONS ======================================

    /**
     * Lists available currencies
     * @returns {Promise<Object>}
     */
    async getCurrencies() {
        return this.http.get('/currencies');
    }

    /**
     * Gets details of all currencies
     * @returns {Promise<Object>}
     */
    async getFullCurrencies() {
        return this.http.get('/full-currencies');
    }

    /**
     * Lists currencies available for payment
     * @param {boolean} fixedRate - Fixed rate support filter
     * @returns {Promise<Object>}
     */
    async getMerchantCoins(fixedRate = false) {
        return this.http.get('/merchant/coins', { params: { fixed_rate: fixedRate } });
    }

    /**
     * Gets minimum payment amount
     * @param {string} currencyFrom - Source currency
     * @param {string} currencyTo - Target currency
     * @param {string} [fiatEquivalent] - Fiat equivalent
     * @returns {Promise<Object>}
     */
    async getMinimumPaymentAmount(currencyFrom, currencyTo, fiatEquivalent = null) {
        const params = {
            currency_from: currencyFrom,
            currency_to: currencyTo
        };
        if (fiatEquivalent) {
            params.fiat_equivalent = fiatEquivalent;
        }
        return this.http.get('/min-amount', { params });
    }

    /**
     * Calculates estimated price
     * @param {number} amount - Amount
     * @param {string} currencyFrom - Source currency
     * @param {string} currencyTo - Target currency
     * @returns {Promise<Object>}
     */
    async getEstimatedPrice(amount, currencyFrom, currencyTo) {
        return this.http.get('/estimate', {
            params: {
                amount,
                currency_from: currencyFrom,
                currency_to: currencyTo
            }
        });
    }

    // ==================== CUSTODY OPERATIONS ======================================

    /**
     * Gets custody balances
     * @returns {Promise<Object>}
     */
    async getCustodyBalance() {
        return this.authenticatedRequest('get', '/custody/balance');
    }

    /**
     * Creates transfer from custody
     * @param {Object} params - Transfer parameters
     * @returns {Promise<Object>}
     */
    async createCustodyTransfer(params) {
        return this.authenticatedRequest('post', '/custody/transfer', params);
    }

    /**
     * Creates crypto conversion
     * @param {Object} params - Conversion parameters
     * @returns {Promise<Object>}
     */
    async createConversion(params) {
        return this.authenticatedRequest('post', '/conversion', params);
    }

    /**
     * Gets conversion estimate
     * @param {Object} params - Estimate parameters
     * @returns {Promise<Object>}
     */
    async getConversionEstimate(params) {
        return this.http.get('/conversion/estimate', { params });
    }

    // ==================== PAYOUT OPERATIONS ======================================

    /**
     * Creates payout
     * @param {Object} params - Payout parameters
     * @returns {Promise<Object>}
     */
    async createPayout(params) {
        return this.authenticatedRequest('post', '/payout', params);
    }

    /**
     * Creates batch payout
     * @param {Array} withdrawals - Payout list
     * @param {string} ipnCallbackUrl - Callback URL
     * @returns {Promise<Object>}
     */
    async createBatchPayout(withdrawals, ipnCallbackUrl) {
        return this.authenticatedRequest('post', '/payout', {
            withdrawals,
            ipn_callback_url: ipnCallbackUrl
        });
    }

    /**
     * Queries payout status
     * @param {string|number} payoutId - Payout ID
     * @returns {Promise<Object>}
     */
    async getPayoutStatus(payoutId) {
        return this.authenticatedRequest('get', `/payout/${payoutId}`);
    }

    /**
     * Lists all payouts
     * @param {Object} params - Filter parameters
     * @returns {Promise<Object>}
     */
    async getPayouts(params = {}) {
        return this.authenticatedRequest('get', '/payout', { params });
    }

    // ==================== SUB-PARTNER / BILLING OPERATIONS ======================================

    /**
     * Creates new sub-partner (customer) account
     * Uses POST /sub-partner/balance endpoint
     * @param {Object} params - User parameters
     * @param {string} params.name - Unique user identifier (max 30 chars, CANNOT be email)
     * @returns {Promise<Object>}
     */
    async createSubPartner(params) {
        return this.authenticatedRequest('post', '/sub-partner/balance', params);
    }

    /**
     * Creates payment for sub-partner
     * @param {Object} params - Payment parameters
     * @returns {Promise<Object>}
     */
    async createSubPartnerPayment(params) {
        return this.http.post('/sub-partner/payment', params);
    }

    /**
     * Gets sub-partner balance
     * @param {string} subPartnerId - Sub-partner ID
     * @returns {Promise<Object>}
     */
    async getSubPartnerBalance(subPartnerId) {
        return this.authenticatedRequest('get', `/sub-partner/${subPartnerId}/balance`);
    }

    /**
     * Lists all sub-partners (customers)
     * @param {Object} params - Filter parameters
     * @returns {Promise<Object>}
     */
    async getSubPartners(params = {}) {
        return this.authenticatedRequest('get', '/sub-partner', { params });
    }

    /**
     * Gets specific sub-partner information
     * @param {string} subPartnerId - Sub-partner ID
     * @returns {Promise<Object>}
     */
    async getSubPartner(subPartnerId) {
        return this.authenticatedRequest('get', `/sub-partner/${subPartnerId}`);
    }

    /**
     * Lists sub-partner's payments
     * @param {string} subPartnerId - Sub-partner ID
     * @param {Object} params - Filter parameters
     * @returns {Promise<Object>}
     */
    async getSubPartnerPayments(subPartnerId, params = {}) {
        return this.authenticatedRequest('get', `/sub-partner/${subPartnerId}/payment`, { params });
    }

    /**
     * Updates sub-partner
     * @param {string} subPartnerId - Sub-partner ID
     * @param {Object} params - Parameters to update
     * @returns {Promise<Object>}
     */
    async updateSubPartner(subPartnerId, params) {
        return this.authenticatedRequest('patch', `/sub-partner/${subPartnerId}`, params);
    }
}

module.exports = NowPaymentsClient;
