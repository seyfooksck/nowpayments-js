/**
 * Currency Manager
 * Currency management and information queries
 */

class CurrencyManager {
    constructor(client) {
        this.client = client;
        this.cachedCurrencies = null;
        this.cacheTimestamp = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Lists all supported currencies
     * @param {boolean} [forceRefresh=false] - To refresh cache
     * @returns {Promise<Array>}
     */
    async getCurrencies(forceRefresh = false) {
        // Cache check
        if (
            !forceRefresh &&
            this.cachedCurrencies &&
            this.cacheTimestamp &&
            Date.now() - this.cacheTimestamp < this.cacheDuration
        ) {
            return this.cachedCurrencies;
        }

        const response = await this.client.getCurrencies();
        this.cachedCurrencies = response.currencies || [];
        this.cacheTimestamp = Date.now();

        return this.cachedCurrencies;
    }

    /**
     * Gets detailed currency information
     * @returns {Promise<Array>}
     */
    async getFullCurrencies() {
        const response = await this.client.getFullCurrencies();
        return response.currencies || [];
    }

    /**
     * Lists currencies accepted by the merchant
     * @param {boolean} [fixedRate=false] - Fixed rate support
     * @returns {Promise<Array>}
     */
    async getMerchantCurrencies(fixedRate = false) {
        const response = await this.client.getMerchantCoins(fixedRate);
        return response.currencies || [];
    }

    /**
     * Checks if a specific currency is supported
     * @param {string} currency - Currency code
     * @returns {Promise<boolean>}
     */
    async isCurrencySupported(currency) {
        const currencies = await this.getCurrencies();
        return currencies.some(
            c => c.toLowerCase() === currency.toLowerCase()
        );
    }

    /**
     * Gets minimum payment amount
     * @param {string} payCurrency - Payment currency
     * @param {string} [receiveCurrency='usdt'] - Received currency
     * @returns {Promise<Object>}
     */
    async getMinimumAmount(payCurrency, receiveCurrency = 'usdt') {
        const response = await this.client.getMinimumPaymentAmount(
            payCurrency,
            receiveCurrency
        );

        return {
            currency: payCurrency,
            minAmount: response.min_amount,
            fiatEquivalent: response.fiat_equivalent
        };
    }

    /**
     * Gets minimum amounts for all currencies
     * @param {string} [receiveCurrency='usdt'] - Target currency
     * @returns {Promise<Array>}
     */
    async getAllMinimumAmounts(receiveCurrency = 'usdt') {
        const currencies = await this.getMerchantCurrencies();
        const results = [];

        for (const currency of currencies) {
            try {
                const min = await this.getMinimumAmount(currency, receiveCurrency);
                results.push(min);
            } catch (e) {
                results.push({
                    currency: currency,
                    minAmount: null,
                    error: e.message
                });
            }
        }

        return results;
    }

    /**
     * Calculates estimated price
     * @param {number} amount - Amount
     * @param {string} fromCurrency - Source currency
     * @param {string} toCurrency - Target currency
     * @returns {Promise<Object>}
     */
    async getEstimate(amount, fromCurrency, toCurrency) {
        const response = await this.client.getEstimatedPrice(
            amount,
            fromCurrency,
            toCurrency
        );

        return {
            fromCurrency: response.currency_from,
            toCurrency: response.currency_to,
            amount: amount,
            estimatedAmount: response.estimated_amount,
            rate: amount > 0 ? response.estimated_amount / amount : 0
        };
    }

    /**
     * Gets network information for a currency
     * @param {string} currency - Currency
     * @returns {Promise<Object|null>}
     */
    async getCurrencyInfo(currency) {
        const fullCurrencies = await this.getFullCurrencies();
        
        const found = fullCurrencies.find(
            c => c.code?.toLowerCase() === currency.toLowerCase() ||
                 c.name?.toLowerCase() === currency.toLowerCase()
        );

        if (!found) {
            return null;
        }

        return {
            code: found.code,
            name: found.name,
            network: found.network,
            isStableCoin: found.is_stable,
            logoUrl: found.logo_url,
            minConfirmations: found.min_confirmations
        };
    }

    /**
     * Returns popular currencies
     * @returns {Array}
     */
    getPopularCurrencies() {
        return [
            { code: 'btc', name: 'Bitcoin', category: 'crypto' },
            { code: 'eth', name: 'Ethereum', category: 'crypto' },
            { code: 'ltc', name: 'Litecoin', category: 'crypto' },
            { code: 'doge', name: 'Dogecoin', category: 'crypto' },
            { code: 'usdt', name: 'Tether (USDT)', category: 'stablecoin' },
            { code: 'usdc', name: 'USD Coin', category: 'stablecoin' },
            { code: 'trx', name: 'TRON', category: 'crypto' },
            { code: 'bnb', name: 'Binance Coin', category: 'crypto' },
            { code: 'xrp', name: 'Ripple', category: 'crypto' },
            { code: 'sol', name: 'Solana', category: 'crypto' }
        ];
    }

    /**
     * Returns currencies requiring extra ID
     * @returns {Object}
     */
    getCurrenciesRequiringExtraId() {
        return {
            xrp: { name: 'Destination Tag', description: 'Destination tag is required for XRP' },
            xlm: { name: 'Memo', description: 'Memo is required for XLM' },
            eos: { name: 'Memo', description: 'Memo is required for EOS' },
            bnb: { name: 'Memo', description: 'Memo may be required for BNB (BEP2)' },
            xmr: { name: 'Payment ID', description: 'Payment ID may be required for Monero' },
            atom: { name: 'Memo', description: 'Memo is required for Cosmos' }
        };
    }

    /**
     * Checks if a currency requires extra ID
     * @param {string} currency - Currency
     * @returns {Object|null}
     */
    requiresExtraId(currency) {
        const requirements = this.getCurrenciesRequiringExtraId();
        return requirements[currency.toLowerCase()] || null;
    }
}

module.exports = CurrencyManager;
