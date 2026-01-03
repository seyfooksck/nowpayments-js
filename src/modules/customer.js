/**
 * Customer Manager (Sub-Partner)
 * Customer/user account management
 */

class CustomerManager {
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }

    /**
     * Lists all customers (sub-partners)
     * @param {Object} [options] - Filter options
     * @param {number} [options.limit] - Records per page
     * @param {number} [options.page] - Page number
     * @returns {Promise<Object>}
     */
    async list(options = {}) {
        const response = await this.client.getSubPartners(options);

        // API response formatı: { result: [...] }
        const customers = response.result || response.data || response || [];
        const customerList = Array.isArray(customers) ? customers : [];

        return {
            customers: customerList.map(customer => this.formatCustomer(customer)),
            pagination: {
                total: response.total || customerList.length,
                page: response.page || 1,
                limit: response.limit || 10
            },
            raw: response
        };
    }

    /**
     * Gets a specific customer
     * @param {string} customerId - Customer ID
     * @returns {Promise<Object>}
     */
    async get(customerId) {
        if (!customerId) {
            throw new Error('customerId is required');
        }

        const response = await this.client.getSubPartner(customerId);
        return this.formatCustomer(response);
    }

    /**
     * Creates new customer (sub-partner) account
     * Uses POST /sub-partner/balance endpoint
     * 
     * @param {Object} options - Customer information
     * @param {string} options.name - Unique user identifier (max 30 chars, CANNOT be email)
     * @returns {Promise<Object>} Created customer information
     * 
     * @example
     * const customer = await nowpayments.customers.create({
     *     name: 'user123'
     * });
     * // { id: '1515573197', name: 'user123', createdAt: '2022-10-09T21:56:33.754Z' }
     */
    async create(options) {
        if (!options || !options.name) {
            throw new Error('name parameter is required');
        }

        if (options.name.length > 30) {
            throw new Error('name parameter cannot exceed 30 characters');
        }

        // Email check - API does not accept email
        if (options.name.includes('@')) {
            throw new Error('name parameter cannot contain email address');
        }

        const payload = {
            name: options.name
        };

        const response = await this.client.createSubPartner(payload);
        
        // Response formatı: { result: { id, name, created_at, updated_at } }
        const customerData = response.result || response;
        return this.formatCustomer(customerData);
    }

    /**
     * Updates customer information
     * @param {string} customerId - Customer ID
     * @param {Object} options - Information to update
     * @returns {Promise<Object>}
     */
    async update(customerId, options) {
        if (!customerId) {
            throw new Error('customerId is required');
        }

        const payload = {};
        
        if (options.name) payload.name = options.name;
        if (options.email) payload.email = options.email;
        if (options.ipnCallbackUrl) payload.ipn_callback_url = options.ipnCallbackUrl;

        const response = await this.client.updateSubPartner(customerId, payload);
        return this.formatCustomer(response);
    }

    /**
     * Gets customer balance
     * @param {string} customerId - Customer ID
     * @returns {Promise<Object>}
     */
    async getBalance(customerId) {
        if (!customerId) {
            throw new Error('customerId is required');
        }

        const response = await this.client.getSubPartnerBalance(customerId);

        return {
            customerId: customerId,
            balances: (response.balances || []).map(b => ({
                currency: b.currency,
                amount: b.amount,
                pendingAmount: b.pending_amount || 0
            })),
            raw: response
        };
    }

    /**
     * Lists customer's payments
     * @param {string} customerId - Customer ID
     * @param {Object} [options] - Filter options
     * @returns {Promise<Object>}
     */
    async getPayments(customerId, options = {}) {
        if (!customerId) {
            throw new Error('customerId is required');
        }

        const response = await this.client.getSubPartnerPayments(customerId, options);

        return {
            customerId: customerId,
            payments: (response.data || response || []).map(payment => ({
                paymentId: payment.payment_id,
                status: payment.payment_status,
                payCurrency: payment.pay_currency,
                payAmount: payment.pay_amount,
                actuallyPaid: payment.actually_paid,
                depositAddress: payment.pay_address,
                createdAt: payment.created_at,
                updatedAt: payment.updated_at
            })),
            raw: response
        };
    }

    /**
     * Creates deposit address for customer
     * @param {string} customerId - Customer ID
     * @param {Object} options - Deposit options
     * @param {string} options.currency - Cryptocurrency (btc, eth, usdt, etc.)
     * @param {number} options.amount - Expected amount (in crypto)
     * @param {string} [options.ipnCallbackUrl] - IPN callback URL
     * @returns {Promise<Object>}
     */
    async createDepositAddress(customerId, options) {
        if (!customerId) {
            throw new Error('customerId is required');
        }
        if (!options.currency) {
            throw new Error('currency is required');
        }
        if (!options.amount) {
            throw new Error('amount is required');
        }

        const payload = {
            sub_partner_id: customerId,
            currency: options.currency.toLowerCase(),
            amount: options.amount
        };

        if (options.ipnCallbackUrl || this.config.ipnCallbackUrl) {
            payload.ipn_callback_url = options.ipnCallbackUrl || this.config.ipnCallbackUrl;
        }

        const response = await this.client.createSubPartnerPayment(payload);
        const result = response.result || response;

        return {
            customerId: customerId,
            paymentId: result.payment_id,
            depositAddress: result.pay_address,
            currency: result.pay_currency,
            amount: result.pay_amount,
            priceAmount: result.price_amount,
            priceCurrency: result.price_currency,
            status: result.payment_status,
            network: result.network,
            expiresAt: result.expiration_estimate_date,
            validUntil: result.valid_until,
            invoiceId: result.invoice_id,
            purchaseId: result.purchase_id,
            createdAt: result.created_at,
            raw: result
        };
    }

    /**
     * Formats customer data
     * @private
     */
    formatCustomer(data) {
        return {
            id: data.id || data.sub_partner_id,
            name: data.name,
            email: data.email,
            ipnCallbackUrl: data.ipn_callback_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            raw: data
        };
    }
}

module.exports = CustomerManager;
