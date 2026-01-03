/**
 * NOWPayments np Integration - Test Suite
 */

const NowPayments = require('../../src');
const IPNHandler = require('../src/modules/ipn');

// Test yapılandırması
const testConfig = {
    apiKey: 'TEST_API_KEY',
    ipnSecret: 'TEST_IPN_SECRET',
    sandbox: true
};

// Test sayacı
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        failed++;
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message} Expected: ${expected}, Got: ${actual}`);
    }
}

function assertTrue(value, message = '') {
    if (!value) {
        throw new Error(`${message} Expected true, got ${value}`);
    }
}

function assertFalse(value, message = '') {
    if (value) {
        throw new Error(`${message} Expected false, got ${value}`);
    }
}

function assertThrows(fn, message = '') {
    try {
        fn();
        throw new Error(`${message} Expected function to throw`);
    } catch (e) {
        if (e.message.includes('Expected function to throw')) {
            throw e;
        }
        // Success - function threw as expected
    }
}

console.log('====================================');
console.log('NOWPayments np - Test Suite');
console.log('====================================\n');

// =====================================================
// INITIALIZATION TESTS
// =====================================================

console.log('📦 Initialization Tests\n');

test('Should create NowPayments instance with valid config', () => {
    const np = new NowPayments(testConfig);
    assertTrue(np !== null);
    assertTrue(np.deposit !== undefined);
    assertTrue(np.payout !== undefined);
    assertTrue(np.custody !== undefined);
    assertTrue(np.ipn !== undefined);
    assertTrue(np.currency !== undefined);
});

test('Should throw error without API key', () => {
    assertThrows(() => {
        new NowPayments({ ipnSecret: 'secret' });
    });
});

test('Should default sandbox to false', () => {
    const np = new NowPayments({ apiKey: 'test', ipnSecret: 'secret' });
    assertEqual(np.config.sandbox, false);
});

test('Should enable sandbox mode when specified', () => {
    const np = new NowPayments({ ...testConfig, sandbox: true });
    assertEqual(np.config.sandbox, true);
});

// =====================================================
// IPN HANDLER TESTS
// =====================================================

console.log('\n📨 IPN Handler Tests\n');

test('Should create IPN handler instance', () => {
    const ipn = new IPNHandler({ ipnSecret: 'test_secret' });
    assertTrue(ipn !== null);
});

test('Should verify valid signature', () => {
    const ipn = new IPNHandler({ ipnSecret: 'test_secret_key' });
    
    const payload = {
        payment_id: 123456,
        payment_status: 'finished',
        pay_address: '0x123...',
        pay_currency: 'btc',
        actually_paid: 0.001
    };
    
    // Doğru imza oluştur
    const crypto = require('crypto');
    const sorted = JSON.stringify(payload, Object.keys(payload).sort());
    const hmac = crypto.createHmac('sha512', 'test_secret_key');
    hmac.update(sorted);
    const validSignature = hmac.digest('hex');
    
    const isValid = ipn.verifySignature(payload, validSignature);
    assertTrue(isValid, 'Signature should be valid');
});

test('Should reject invalid signature', () => {
    const ipn = new IPNHandler({ ipnSecret: 'test_secret_key' });
    
    const payload = {
        payment_id: 123456,
        payment_status: 'finished'
    };
    
    const isValid = ipn.verifySignature(payload, 'invalid_signature');
    assertFalse(isValid, 'Invalid signature should be rejected');
});

test('Should throw error when IPN secret is not configured', () => {
    const ipn = new IPNHandler({});
    
    assertThrows(() => {
        ipn.verifySignature({}, 'signature');
    });
});

test('Should extract userId from order_id', () => {
    const ipn = new IPNHandler({ ipnSecret: 'secret' });
    
    // Private method test via parseCallback
    const crypto = require('crypto');
    const payload = {
        payment_id: 123,
        payment_status: 'finished',
        order_id: 'user_12345',
        pay_currency: 'btc'
    };
    
    const sorted = JSON.stringify(payload, Object.keys(payload).sort());
    const hmac = crypto.createHmac('sha512', 'secret');
    hmac.update(sorted);
    const signature = hmac.digest('hex');
    
    const result = ipn.parseCallback(payload, signature);
    assertEqual(result.userId, '12345');
});

test('Should correctly identify payment statuses', () => {
    assertTrue(IPNHandler.isPaymentCompleted('finished'));
    assertTrue(IPNHandler.isPaymentCompleted('confirmed'));
    assertFalse(IPNHandler.isPaymentCompleted('waiting'));
    
    assertTrue(IPNHandler.isPaymentPending('waiting'));
    assertTrue(IPNHandler.isPaymentPending('confirming'));
    assertFalse(IPNHandler.isPaymentPending('finished'));
    
    assertTrue(IPNHandler.isPaymentFailed('failed'));
    assertTrue(IPNHandler.isPaymentFailed('expired'));
    assertFalse(IPNHandler.isPaymentFailed('finished'));
    
    assertTrue(IPNHandler.isPaymentPartial('partially_paid'));
    assertFalse(IPNHandler.isPaymentPartial('finished'));
});

// =====================================================
// CURRENCY MANAGER TESTS
// =====================================================

console.log('\n💱 Currency Manager Tests\n');

test('Should return popular np currencies', () => {
    const np = new NowPayments(testConfig);
    const popular = np.currency.getPopularnpCurrencies();
    
    assertTrue(Array.isArray(popular));
    assertTrue(popular.length > 0);
    assertTrue(popular.some(c => c.code === 'btc'));
    assertTrue(popular.some(c => c.code === 'eth'));
    assertTrue(popular.some(c => c.code === 'usdt'));
});

test('Should return currencies requiring extra ID', () => {
    const np = new NowPayments(testConfig);
    const extraIdCurrencies = np.currency.getCurrenciesRequiringExtraId();
    
    assertTrue(typeof extraIdCurrencies === 'object');
    assertTrue(extraIdCurrencies.xrp !== undefined);
    assertTrue(extraIdCurrencies.xlm !== undefined);
});

test('Should check if currency requires extra ID', () => {
    const np = new NowPayments(testConfig);
    
    const xrpRequirement = np.currency.requiresExtraId('xrp');
    assertTrue(xrpRequirement !== null);
    assertTrue(xrpRequirement.name === 'Destination Tag');
    
    const btcRequirement = np.currency.requiresExtraId('btc');
    assertTrue(btcRequirement === null);
});

// =====================================================
// STATIC CONSTANTS TESTS
// =====================================================

console.log('\n📋 Static Constants Tests\n');

test('Should have PAYMENT_STATUS constants', () => {
    assertTrue(NowPayments.PAYMENT_STATUS.WAITING === 'waiting');
    assertTrue(NowPayments.PAYMENT_STATUS.FINISHED === 'finished');
    assertTrue(NowPayments.PAYMENT_STATUS.FAILED === 'failed');
});

test('Should have PAYOUT_STATUS constants', () => {
    assertTrue(NowPayments.PAYOUT_STATUS.WAITING === 'WAITING');
    assertTrue(NowPayments.PAYOUT_STATUS.FINISHED === 'FINISHED');
    assertTrue(NowPayments.PAYOUT_STATUS.FAILED === 'FAILED');
});

// =====================================================
// MODULE EXPORTS TESTS
// =====================================================

console.log('\n📤 Module Exports Tests\n');

test('Should export NowPayments as default', () => {
    const Module = require('../../src');
    assertTrue(typeof Module === 'function');
});

test('Should export all sub-modules', () => {
    const Module = require('../../src');
    assertTrue(Module.NowPayments !== undefined);
    assertTrue(Module.NowPaymentsClient !== undefined);
    assertTrue(Module.DepositManager !== undefined);
    assertTrue(Module.PayoutManager !== undefined);
    assertTrue(Module.CustodyManager !== undefined);
    assertTrue(Module.IPNHandler !== undefined);
    assertTrue(Module.CurrencyManager !== undefined);
});

// =====================================================
// VALIDATION TESTS
// =====================================================

console.log('\n✔️ Validation Tests\n');

test('Deposit should require userId', async () => {
    const np = new NowPayments(testConfig);
    
    try {
        await np.deposit.createDepositAddress({ payCurrency: 'btc' });
        throw new Error('Should have thrown');
    } catch (e) {
        assertTrue(e.message.includes('userId'));
    }
});

test('Deposit should require payCurrency', async () => {
    const np = new NowPayments(testConfig);
    
    try {
        await np.deposit.createDepositAddress({ userId: 'test' });
        throw new Error('Should have thrown');
    } catch (e) {
        assertTrue(e.message.includes('payCurrency'));
    }
});

test('Payout should require address', async () => {
    const np = new NowPayments(testConfig);
    
    try {
        await np.payout.createPayout({ 
            userId: 'test',
            amount: 1,
            currency: 'btc'
        });
        throw new Error('Should have thrown');
    } catch (e) {
        assertTrue(e.message.includes('adres'));
    }
});

test('Payout should require valid amount', async () => {
    const np = new NowPayments(testConfig);
    
    try {
        await np.payout.createPayout({ 
            userId: 'test',
            address: 'bc1...',
            amount: 0,
            currency: 'btc'
        });
        throw new Error('Should have thrown');
    } catch (e) {
        assertTrue(e.message.includes('miktar'));
    }
});

test('Batch payout should require at least one payout', async () => {
    const np = new NowPayments(testConfig);
    
    try {
        await np.payout.createBatchPayout([]);
        throw new Error('Should have thrown');
    } catch (e) {
        assertTrue(e.message.includes('payout'));
    }
});

// =====================================================
// SUMMARY
// =====================================================

console.log('\n====================================');
console.log('Test Results');
console.log('====================================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total:  ${passed + failed}`);
console.log('====================================\n');

// Exit with error code if tests failed
if (failed > 0) {
    process.exit(1);
}
