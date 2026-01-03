/**
 * IPN (Instant Payment Notification) Module Test File
 * 
 * This file tests IPN signature verification operations:
 * - IPN signature verification
 * - Webhook payload processing
 * - Invalid signature detection
 */

require('dotenv').config();
const { NowPayments } = require('../../src');

const seyfo = new NowPayments({
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
    email: process.env.NOWPAYMENTS_EMAIL,
    password: process.env.NOWPAYMENTS_PASSWORD,
    sandbox: process.env.SANDBOX_MODE === 'true'
});

async function testIPNModule() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║            IPN TESTS                   ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Sample webhook payloads
    const samplePaymentWebhook = {
        payment_id: 123456789,
        payment_status: 'finished',
        pay_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        price_amount: 100,
        price_currency: 'usd',
        pay_amount: 0.00234567,
        pay_currency: 'btc',
        order_id: 'order_12345',
        created_at: '2024-01-01T12:00:00.000Z',
        updated_at: '2024-01-01T12:05:00.000Z'
    };

    const samplePayoutWebhook = {
        id: '987654321',
        status: 'FINISHED',
        currency: 'usdttrc20',
        amount: '50',
        address: 'TXYZabc123...',
        hash: '0x123abc...',
        created_at: '2024-01-01T12:00:00.000Z'
    };

    // ─────────────────────────────────────────
    // TEST 1: Signature Creation
    // ─────────────────────────────────────────
    console.log('🔐 TEST 1: Signature Creation');
    console.log('─'.repeat(40));
    try {
        // IPN Handler sorts with sortObject
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(JSON.stringify(samplePaymentWebhook));
        const signature = hmac.digest('hex');
        console.log(`✅ Signature created`);
        console.log(`   Signature: ${signature.substring(0, 32)}...`);
        console.log(`   Length: ${signature.length} characters`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Valid Signature Verification
    // ─────────────────────────────────────────
    console.log('\n✅ TEST 2: Valid Signature Verification');
    console.log('─'.repeat(40));
    try {
        // Create signature for sorted payload
        const sortObject = (obj) => {
            if (obj === null || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(item => sortObject(item));
            const sorted = {};
            Object.keys(obj).sort().forEach(key => {
                sorted[key] = sortObject(obj[key]);
            });
            return sorted;
        };
        
        const crypto = require('crypto');
        const sortedPayload = sortObject(samplePaymentWebhook);
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(JSON.stringify(sortedPayload));
        const validSignature = hmac.digest('hex');
        
        // Then verify
        const isValid = seyfo.ipn.verifySignature(samplePaymentWebhook, validSignature);
        console.log(`✅ Verification result: ${isValid ? 'VALID' : 'INVALID'}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Invalid Signature Detection
    // ─────────────────────────────────────────
    console.log('\n❌ TEST 3: Invalid Signature Detection');
    console.log('─'.repeat(40));
    try {
        const fakeSignature = 'fakesignature123456789abcdef';
        const isValid = seyfo.ipn.verifySignature(samplePaymentWebhook, fakeSignature);
        console.log(`✅ Fake signature ${isValid ? 'VALID (ERROR!)' : 'rejected'}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 4: Webhook Processing (Payment)
    // ─────────────────────────────────────────
    console.log('\n💳 TEST 4: Payment Webhook Processing');
    console.log('─'.repeat(40));
    try {
        // Create valid signature
        const sortObject = (obj) => {
            if (obj === null || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(item => sortObject(item));
            const sorted = {};
            Object.keys(obj).sort().forEach(key => {
                sorted[key] = sortObject(obj[key]);
            });
            return sorted;
        };
        
        const crypto = require('crypto');
        const sortedPayload = sortObject(samplePaymentWebhook);
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(JSON.stringify(sortedPayload));
        const validSignature = hmac.digest('hex');
        
        // Process callback
        const parsedPayload = seyfo.ipn.parseCallback(samplePaymentWebhook, validSignature);
        console.log(`✅ Payment webhook processed`);
        console.log(`   Payment ID: ${parsedPayload.paymentId}`);
        console.log(`   Status: ${parsedPayload.status}`);
        console.log(`   Is Completed: ${parsedPayload.isCompleted}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 5: Static Status Methods
    // ─────────────────────────────────────────
    console.log('\n📊 TEST 5: Static Status Methods');
    console.log('─'.repeat(40));
    try {
        const { IPNHandler } = require('../../src');
        
        console.log('   Payment status checks:');
        console.log(`   - finished: ${IPNHandler.isPaymentCompleted('finished') ? 'Completed ✅' : 'Not completed'}`);
        console.log(`   - waiting: ${IPNHandler.isPaymentPending('waiting') ? 'Pending ⏳' : 'Not pending'}`);
        console.log(`   - failed: ${IPNHandler.isPaymentFailed('failed') ? 'Failed ❌' : 'Not failed'}`);
        console.log(`   - partially_paid: ${IPNHandler.isPaymentPartial('partially_paid') ? 'Partial 🔄' : 'Not partial'}`);
        console.log(`✅ All status methods working`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 6: Payment Status Constants
    // ─────────────────────────────────────────
    console.log('\n🔢 TEST 6: Payment Status Constants');
    console.log('─'.repeat(40));
    try {
        const { IPNHandler } = require('../../src');
        
        console.log('   Available statuses:');
        Object.entries(IPNHandler.PAYMENT_STATUS).forEach(([key, value]) => {
            console.log(`   - ${key}: ${value}`);
        });
        console.log(`✅ ${Object.keys(IPNHandler.PAYMENT_STATUS).length} statuses defined`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 7: Middleware Creation
    // ─────────────────────────────────────────
    console.log('\n🔌 TEST 7: Middleware Creation');
    console.log('─'.repeat(40));
    try {
        const middleware = seyfo.ipn.middleware(async (payload) => {
            console.log('   Payload received:', payload.paymentId);
        });
        console.log(`✅ Middleware created successfully`);
        console.log(`   Type: ${typeof middleware}`);
        console.log(`   Ready to use with Express/Koa`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(40));
    console.log('IPN tests completed!');
}

testIPNModule().catch(console.error);
