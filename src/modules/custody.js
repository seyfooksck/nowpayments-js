/**
 * Custody Manager
 * Balance management and crypto conversion operations
 */

class CustodyManager {
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }

    /**
     * Gets custody balances
     * @returns {Promise<Object>} Balance information
     */
    async getBalances() {
        const response = await this.client.getCustodyBalance();
        
        return {
            balances: (response.balances || []).map(balance => ({
                currency: balance.currency,
                amount: balance.amount,
                pendingAmount: balance.pending_amount || 0
            })),
            raw: response
        };
    }

    /**
     * Gets balance for a specific currency
     * @param {string} currency - Currency
     * @returns {Promise<Object>}
     */
    async getBalance(currency) {
        const { balances } = await this.getBalances();
        
        const balance = balances.find(
            b => b.currency.toLowerCase() === currency.toLowerCase()
        );

        return {
            currency: currency,
            amount: balance?.amount || 0,
            pendingAmount: balance?.pendingAmount || 0,
            found: !!balance
        };
    }

    /**
     * Transfers from custody to external wallet
     * @param {Object} options - Transfer options
     * @param {string} options.address - Destination wallet address
     * @param {number} options.amount - Transfer amount
     * @param {string} options.currency - Currency
     * @param {string} [options.extraId] - Extra ID (memo, tag, etc.)
     * @returns {Promise<Object>}
     */
    async transfer(options) {
        const { address, amount, currency, extraId } = options;

        if (!address || !amount || !currency) {
            throw new Error('address, amount and currency are required');
        }

        const payload = {
            address,
            amount,
            currency: currency.toLowerCase()
        };

        if (extraId) {
            payload.extra_id = extraId;
        }

        const response = await this.client.createCustodyTransfer(payload);

        return {
            success: true,
            transferId: response.id,
            status: response.status,
            address: response.address,
            amount: response.amount,
            currency: response.currency,
            hash: response.hash,
            raw: response
        };
    }

    /**
     * Performs cryptocurrency conversion
     * @param {Object} options - Conversion options
     * @param {string} options.fromCurrency - Source currency
     * @param {string} options.toCurrency - Target currency
     * @param {number} options.amount - Amount to convert
     * @returns {Promise<Object>}
     */
    async convert(options) {
        const { fromCurrency, toCurrency, amount } = options;

        if (!fromCurrency || !toCurrency || !amount) {
            throw new Error('fromCurrency, toCurrency and amount are required');
        }

        const payload = {
            currency_from: fromCurrency.toLowerCase(),
            currency_to: toCurrency.toLowerCase(),
            amount: amount
        };

        const response = await this.client.createConversion(payload);

        return {
            success: true,
            conversionId: response.id,
            status: response.status,
            fromCurrency: response.currency_from,
            toCurrency: response.currency_to,
            amountFrom: response.amount_from,
            amountTo: response.amount_to,
            rate: response.rate,
            raw: response
        };
    }

    /**
     * Gets conversion estimate
     * @param {Object} options - Estimate options
     * @param {string} options.fromCurrency - Source currency
     * @param {string} options.toCurrency - Target currency
     * @param {number} options.amount - Amount
     * @returns {Promise<Object>}
     */
    async getConversionEstimate(options) {
        const { fromCurrency, toCurrency, amount } = options;

        const response = await this.client.getConversionEstimate({
            currency_from: fromCurrency.toLowerCase(),
            currency_to: toCurrency.toLowerCase(),
            amount: amount
        });

        return {
            fromCurrency: response.currency_from,
            toCurrency: response.currency_to,
            amountFrom: response.amount_from,
            estimatedAmount: response.estimated_amount,
            rate: response.rate,
            fee: response.fee,
            raw: response
        };
    }

    /**
     * Converts all balances to USDT
     * @param {string} [targetCurrency='usdt'] - Target currency
     * @param {number} [minAmount=0] - Minimum amount to convert
     * @returns {Promise<Array>} Conversion results
     */
    async consolidateBalances(targetCurrency = 'usdt', minAmount = 0) {
        const { balances } = await this.getBalances();
        const results = [];

        for (const balance of balances) {
            // Check target currency and minimum amount
            if (
                balance.currency.toLowerCase() === targetCurrency.toLowerCase() ||
                balance.amount <= minAmount
            ) {
                continue;
            }

            try {
                const result = await this.convert({
                    fromCurrency: balance.currency,
                    toCurrency: targetCurrency,
                    amount: balance.amount
                });
                results.push({
                    success: true,
                    currency: balance.currency,
                    ...result
                });
            } catch (error) {
                results.push({
                    success: false,
                    currency: balance.currency,
                    amount: balance.amount,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Creates balance summary (with USD equivalents)
     * @returns {Promise<Object>}
     */
    async getBalanceSummary() {
        const { balances } = await this.getBalances();
        let totalUsdValue = 0;
        const detailedBalances = [];

        for (const balance of balances) {
            if (balance.amount > 0) {
                try {
                    // Calculate USD equivalent
                    const estimate = await this.client.getEstimatedPrice(
                        balance.amount,
                        balance.currency,
                        'usd'
                    );

                    const usdValue = estimate.estimated_amount || 0;
                    totalUsdValue += usdValue;

                    detailedBalances.push({
                        currency: balance.currency,
                        amount: balance.amount,
                        pendingAmount: balance.pendingAmount,
                        usdValue: usdValue
                    });
                } catch (e) {
                    detailedBalances.push({
                        currency: balance.currency,
                        amount: balance.amount,
                        pendingAmount: balance.pendingAmount,
                        usdValue: null,
                        error: 'Price could not be calculated'
                    });
                }
            }
        }

        return {
            balances: detailedBalances,
            totalUsdValue: totalUsdValue,
            lastUpdated: new Date().toISOString()
        };
    }
}

module.exports = CustodyManager;
