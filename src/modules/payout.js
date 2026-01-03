/**
 * Payout Manager
 * Send withdrawals (payouts) to users
 */

class PayoutManager {
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }

    /**
     * Sends payout (withdrawal) to user
     * @param {Object} options - Payout options
     * @param {string} options.userId - User ID (for tracking)
     * @param {string} options.address - Destination wallet address
     * @param {number} options.amount - Amount to send
     * @param {string} options.currency - Cryptocurrency
     * @param {string} [options.ipnCallbackUrl] - IPN callback URL
     * @param {string} [options.extraId] - Extra ID for some coins (memo, tag, etc.)
     * @param {string} [options.uniqueExternalId] - Unique external ID
     * @returns {Promise<Object>} Payout information
     */
    async createPayout(options) {
        const {
            userId,
            address,
            amount,
            currency,
            ipnCallbackUrl,
            extraId,
            uniqueExternalId
        } = options;

        if (!address) {
            throw new Error('Destination wallet address is required');
        }
        if (!amount || amount <= 0) {
            throw new Error('A valid amount is required');
        }
        if (!currency) {
            throw new Error('Currency is required');
        }

        const payload = {
            address: address,
            amount: amount,
            currency: currency.toLowerCase(),
            ipn_callback_url: ipnCallbackUrl || this.config.ipnCallbackUrl
        };

        // extra_id required for some coins (XRP tag, XLM memo, etc.)
        if (extraId) {
            payload.extra_id = extraId;
        }

        // Unique external ID - for duplicate prevention
        if (uniqueExternalId) {
            payload.unique_external_id = uniqueExternalId;
        } else if (userId) {
            // Auto-generate unique ID
            payload.unique_external_id = `payout_${userId}_${Date.now()}`;
        }

        const response = await this.client.createPayout(payload);

        return {
            success: true,
            userId: userId,
            payoutId: response.id,
            status: response.status,
            address: response.address,
            amount: response.amount,
            currency: response.currency,
            hash: response.hash,
            createdAt: response.created_at,
            raw: response
        };
    }

    /**
     * Sends batch payout (to multiple users at once)
     * @param {Array<Object>} payouts - Payout list
     * @param {string} [ipnCallbackUrl] - IPN callback URL
     * @returns {Promise<Object>} Batch payout results
     */
    async createBatchPayout(payouts, ipnCallbackUrl) {
        if (!Array.isArray(payouts) || payouts.length === 0) {
            throw new Error('At least one payout is required');
        }

        const withdrawals = payouts.map((payout, index) => {
            if (!payout.address || !payout.amount || !payout.currency) {
                throw new Error(`Payout ${index + 1}: address, amount and currency are required`);
            }

            const withdrawal = {
                address: payout.address,
                amount: payout.amount,
                currency: payout.currency.toLowerCase()
            };

            if (payout.extraId) {
                withdrawal.extra_id = payout.extraId;
            }

            if (payout.uniqueExternalId || payout.userId) {
                withdrawal.unique_external_id = payout.uniqueExternalId || 
                    `payout_${payout.userId}_${Date.now()}_${index}`;
            }

            return withdrawal;
        });

        const response = await this.client.createBatchPayout(
            withdrawals,
            ipnCallbackUrl || this.config.ipnCallbackUrl
        );

        return {
            success: true,
            batchId: response.id,
            withdrawals: response.withdrawals,
            raw: response
        };
    }

    /**
     * Checks payout status
     * @param {string|number} payoutId - Payout ID
     * @returns {Promise<Object>} Payout status
     */
    async getPayoutStatus(payoutId) {
        const response = await this.client.getPayoutStatus(payoutId);

        return {
            payoutId: response.id,
            status: response.status,
            address: response.address,
            amount: response.amount,
            currency: response.currency,
            hash: response.hash,
            createdAt: response.created_at,
            updatedAt: response.updated_at,
            isCompleted: response.status === 'FINISHED',
            isPending: ['WAITING', 'PENDING', 'PROCESSING'].includes(response.status),
            isFailed: ['FAILED', 'REJECTED'].includes(response.status),
            raw: response
        };
    }

    /**
     * Lists all payouts
     * @param {Object} [filters] - Filter options
     * @param {number} [filters.limit] - Limit
     * @param {number} [filters.page] - Page
     * @param {string} [filters.status] - Status filter
     * @returns {Promise<Object>}
     */
    async getPayouts(filters = {}) {
        const response = await this.client.getPayouts(filters);
        return response;
    }

    /**
     * Lists payouts for a specific user
     * @param {string} userId - User ID
     * @param {Object} [filters] - Filter options
     * @returns {Promise<Array>}
     */
    async getUserPayouts(userId, filters = {}) {
        // Note: NOWPayments API does not support direct filtering by userId
        // A special endpoint may be needed to search by unique_external_id
        // This implementation fetches all payouts and filters client-side
        
        const response = await this.getPayouts(filters);
        
        if (response.data) {
            return response.data.filter(payout => 
                payout.unique_external_id && 
                payout.unique_external_id.startsWith(`payout_${userId}_`)
            );
        }
        
        return [];
    }

    /**
     * Checks minimum amount for payout
     * @param {string} currency - Currency
     * @returns {Promise<Object>}
     */
    async getMinimumPayoutAmount(currency) {
        // Get minimum amounts from client
        return this.client.getMinimumPaymentAmount(currency, currency);
    }

    /**
     * Checks available balance (can payout be made)
     * @param {string} currency - Currency
     * @param {number} amount - Requested amount
     * @returns {Promise<Object>}
     */
    async checkBalance(currency, amount) {
        const balance = await this.client.getCustodyBalance();
        
        const currencyBalance = balance.balances?.find(
            b => b.currency.toLowerCase() === currency.toLowerCase()
        );

        const available = currencyBalance?.amount || 0;

        return {
            currency: currency,
            available: available,
            requested: amount,
            sufficient: available >= amount,
            shortfall: available >= amount ? 0 : amount - available
        };
    }
}

module.exports = PayoutManager;
