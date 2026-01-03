/**
 * IPN (Instant Payment Notification) Handler
 * Webhook callback verification and processing
 */

const crypto = require('crypto');

class IPNHandler {
    constructor(config) {
        this.ipnSecret = config.ipnSecret;
    }

    /**
     * Verifies IPN callback signature
     * @param {Object} payload - Callback payload (body)
     * @param {string} signature - x-nowpayments-sig header value
     * @returns {boolean} Verification result
     */
    verifySignature(payload, signature) {
        if (!this.ipnSecret) {
            throw new Error('IPN Secret is not configured');
        }

        if (!signature) {
            return false;
        }

        // Sort parameters alphabetically and convert to JSON string
        const sortedPayload = this.sortObject(payload);
        const payloadString = JSON.stringify(sortedPayload);

        // Create HMAC-SHA512 signature
        const hmac = crypto.createHmac('sha512', this.ipnSecret);
        hmac.update(payloadString);
        const calculatedSignature = hmac.digest('hex');

        // Compare signatures
        return this.secureCompare(calculatedSignature, signature);
    }

    /**
     * Secure string comparison (timing attack prevention)
     * @private
     */
    secureCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    }

    /**
     * Sorts object alphabetically
     * @private
     */
    sortObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObject(item));
        }

        const sorted = {};
        Object.keys(obj)
            .sort()
            .forEach(key => {
                sorted[key] = this.sortObject(obj[key]);
            });

        return sorted;
    }

    /**
     * Parses and verifies IPN callback
     * @param {Object|string} body - Request body
     * @param {string} signature - x-nowpayments-sig header
     * @returns {Object} Parsed and verified payload
     */
    parseCallback(body, signature) {
        let payload;

        // Parse if string
        if (typeof body === 'string') {
            try {
                payload = JSON.parse(body);
            } catch (e) {
                throw new Error('Invalid JSON payload');
            }
        } else {
            payload = body;
        }

        // Verify signature
        const isValid = this.verifySignature(payload, signature);

        if (!isValid) {
            throw new Error('Invalid IPN signature');
        }

        return this.formatPayload(payload);
    }

    /**
     * Converts payload to user-friendly format
     * @private
     */
    formatPayload(payload) {
        return {
            // Basic information
            paymentId: payload.payment_id,
            status: payload.payment_status,
            
            // Payment information
            depositAddress: payload.pay_address,
            payCurrency: payload.pay_currency,
            payAmount: payload.pay_amount,
            actuallyPaid: payload.actually_paid,
            
            // Price information
            priceAmount: payload.price_amount,
            priceCurrency: payload.price_currency,
            
            // Outcome information
            outcomeAmount: payload.outcome_amount,
            outcomeCurrency: payload.outcome_currency,
            
            // Order information
            orderId: payload.order_id,
            orderDescription: payload.order_description,
            purchaseId: payload.purchase_id,
            
            // Extract user ID from order_id
            userId: this.extractUserId(payload.order_id),
            
            // Time information
            createdAt: payload.created_at,
            updatedAt: payload.updated_at,
            
            // Status checks
            isCompleted: ['finished', 'confirmed'].includes(payload.payment_status),
            isPartiallyPaid: payload.payment_status === 'partially_paid',
            isFailed: ['failed', 'expired', 'refunded'].includes(payload.payment_status),
            isPending: ['waiting', 'confirming', 'sending'].includes(payload.payment_status),
            
            // Raw data
            raw: payload
        };
    }

    /**
     * Extracts user ID from order ID
     * @private
     */
    extractUserId(orderId) {
        if (!orderId) return null;
        
        // Extract ID from "user_123" format
        if (orderId.startsWith('user_')) {
            return orderId.substring(5);
        }
        
        return orderId;
    }

    /**
     * Creates Express/Koa middleware
     * @param {Function} handler - Callback handler function
     * @returns {Function} Middleware function
     */
    middleware(handler) {
        return async (req, res, next) => {
            try {
                const signature = req.headers['x-nowpayments-sig'];
                const payload = this.parseCallback(req.body, signature);
                
                // Call handler
                await handler(payload, req, res);
                
                // Successful response
                if (!res.headersSent) {
                    res.status(200).json({ success: true });
                }
            } catch (error) {
                console.error('IPN processing error:', error.message);
                
                if (!res.headersSent) {
                    res.status(400).json({ 
                        success: false, 
                        error: error.message 
                    });
                }
                
                if (next) next(error);
            }
        };
    }

    /**
     * Helper methods to check payment statuses
     */
    static isPaymentCompleted(status) {
        return ['finished', 'confirmed'].includes(status);
    }

    static isPaymentPending(status) {
        return ['waiting', 'confirming', 'sending'].includes(status);
    }

    static isPaymentFailed(status) {
        return ['failed', 'expired', 'refunded'].includes(status);
    }

    static isPaymentPartial(status) {
        return status === 'partially_paid';
    }
}

// Statik durum sabitleri
IPNHandler.PAYMENT_STATUS = {
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

module.exports = IPNHandler;
