/**
 * Deposit Manager
 * Create unique wallet addresses for each user and handle deposit operations
 */

class DepositManager {
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }

    /**
     * Creates deposit address for user
     * This address is unique to the user and can receive multiple payments
     * 
     * @param {Object} options - Deposit options
     * @param {string} options.userId - User unique ID
     * @param {string} options.payCurrency - Cryptocurrency for payment (btc, eth, usdt, etc.)
     * @param {number} [options.priceAmount] - Payment amount (optional)
     * @param {string} [options.priceCurrency] - Price currency (usd, eur, etc.)
     * @param {string} [options.ipnCallbackUrl] - IPN callback URL
     * @param {string} [options.orderId] - Order ID (user ID can be used)
     * @param {string} [options.orderDescription] - Order description
     * @param {boolean} [options.isFixedRate=false] - Use fixed rate
     * @param {boolean} [options.feePaidByUser=false] - Fees paid by user
     * @returns {Promise<Object>} Deposit address information
     */
    async createDepositAddress(options) {
        const {
            userId,
            payCurrency,
            priceAmount,
            priceCurrency = 'usd',
            ipnCallbackUrl,
            orderId,
            orderDescription,
            isFixedRate = false,
            feePaidByUser = false
        } = options;

        if (!userId) {
            throw new Error('userId is required');
        }
        if (!payCurrency) {
            throw new Error('payCurrency is required');
        }

        // Custom payload for deposit flow
        const payload = {
            pay_currency: payCurrency.toLowerCase(),
            order_id: orderId || `user_${userId}`,
            order_description: orderDescription || `Deposit for user ${userId}`,
            is_fixed_rate: isFixedRate,
            is_fee_paid_by_user: feePaidByUser
        };

        // Add amount if specified (usually optional)
        if (priceAmount) {
            payload.price_amount = priceAmount;
            payload.price_currency = priceCurrency;
        }

        // IPN callback URL
        if (ipnCallbackUrl || this.config.ipnCallbackUrl) {
            payload.ipn_callback_url = ipnCallbackUrl || this.config.ipnCallbackUrl;
        }

        // Send API request
        const response = await this.client.createPayment(payload);

        // User-friendly response format
        return {
            success: true,
            userId: userId,
            paymentId: response.payment_id,
            depositAddress: response.pay_address,
            payCurrency: response.pay_currency,
            payAmount: response.pay_amount,
            priceAmount: response.price_amount,
            priceCurrency: response.price_currency,
            status: response.payment_status,
            createdAt: response.created_at,
            expiresAt: response.expiration_estimate_date,
            qrCode: this.generateQRCodeUrl(response.pay_address, response.pay_currency),
            raw: response
        };
    }

    /**
     * Creates deposit address for a specific amount
     * @param {Object} options - Deposit options
     */
    async createFixedDeposit(options) {
        if (!options.priceAmount) {
            throw new Error('priceAmount is required for fixed deposit');
        }
        
        return this.createDepositAddress({
            ...options,
            isFixedRate: true
        });
    }

    /**
     * Lists user's existing payments
     * @param {string} userId - User ID
     * @param {Object} [filters] - Filter options
     * @returns {Promise<Array>} Payment list
     */
    async getUserPayments(userId, filters = {}) {
        const response = await this.client.getPayments({
            order_id: `user_${userId}`,
            ...filters
        });

        return response.data || [];
    }

    /**
     * Checks payment status
     * @param {string|number} paymentId - Payment ID
     * @returns {Promise<Object>} Payment status
     */
    async checkPaymentStatus(paymentId) {
        const response = await this.client.getPaymentStatus(paymentId);

        return {
            paymentId: response.payment_id,
            status: response.payment_status,
            actuallyPaid: response.actually_paid,
            payAmount: response.pay_amount,
            payCurrency: response.pay_currency,
            outcomeAmount: response.outcome_amount,
            outcomeCurrency: response.outcome_currency,
            depositAddress: response.pay_address,
            createdAt: response.created_at,
            updatedAt: response.updated_at,
            isCompleted: ['finished', 'confirmed'].includes(response.payment_status),
            isPartiallyPaid: response.payment_status === 'partially_paid',
            isFailed: ['failed', 'expired', 'refunded'].includes(response.payment_status),
            raw: response
        };
    }

    /**
     * Gets minimum deposit amount
     * @param {string} currency - Currency
     * @param {string} [toCurrency] - Target currency
     * @returns {Promise<Object>}
     */
    async getMinimumAmount(currency, toCurrency = 'usdt') {
        return this.client.getMinimumPaymentAmount(currency, toCurrency);
    }

    /**
     * Calculates estimated conversion amount
     * @param {number} amount - Amount
     * @param {string} fromCurrency - Source currency
     * @param {string} toCurrency - Target currency
     * @returns {Promise<Object>}
     */
    async getEstimate(amount, fromCurrency, toCurrency) {
        return this.client.getEstimatedPrice(amount, fromCurrency, toCurrency);
    }

    /**
     * Generates QR code URL
     * @private
     */
    generateQRCodeUrl(address, currency) {
        // Simple QR code URL - a QR code service should be used in real applications
        const qrData = this.formatPaymentUri(address, currency);
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    }

    /**
     * Formats payment URI
     * @private
     */
    formatPaymentUri(address, currency) {
        const schemes = {
            btc: 'bitcoin',
            eth: 'ethereum',
            ltc: 'litecoin',
            doge: 'dogecoin',
            usdt: 'usdt',
            trx: 'tron'
        };

        const scheme = schemes[currency.toLowerCase()] || currency.toLowerCase();
        return `${scheme}:${address}`;
    }
}

module.exports = DepositManager;
