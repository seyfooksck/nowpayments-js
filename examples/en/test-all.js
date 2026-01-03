/**
 * All Modules Test File
 * 
 * This file tests all modules in sequence:
 * - API Status
 * - Customer (Sub-Partner)
 * - Deposit
 * - Payout
 * - Custody
 * - Currency
 * - IPN
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

async function runAllTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        NOWPAYMENTS MODULE - ALL TESTS            ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    async function runTest(name, testFn) {
        process.stdout.write(`   ${name}... `);
        try {
            await testFn();
            console.log('✅');
            results.passed++;
            results.tests.push({ name, status: 'passed' });
        } catch (error) {
            console.log(`❌ ${error.message}`);
            results.failed++;
            results.tests.push({ name, status: 'failed', error: error.message });
        }
    }

    // ═══════════════════════════════════════════
    // API STATUS
    // ═══════════════════════════════════════════
    console.log('📡 API STATUS');
    console.log('─'.repeat(50));
    await runTest('Check API status', async () => {
        const status = await seyfo.getStatus();
        if (status.message !== 'OK') throw new Error('API not responding');
    });

    // ═══════════════════════════════════════════
    // CUSTOMER MODULE
    // ═══════════════════════════════════════════
    console.log('\n👥 CUSTOMER MODULE');
    console.log('─'.repeat(50));
    
    let testCustomerId = null;
    
    await runTest('Customer list', async () => {
        const result = await seyfo.customers.list();
        if (!result.customers) throw new Error('Could not get customer list');
        if (result.customers.length > 0) testCustomerId = result.customers[0].id;
    });

    await runTest('Create new customer', async () => {
        const result = await seyfo.customers.create({ name: `test_${Date.now()}` });
        if (!result.id) throw new Error('Could not create customer');
        testCustomerId = result.id;
    });

    await runTest('Customer details', async () => {
        if (!testCustomerId) throw new Error('No test customer');
        const result = await seyfo.customers.get(testCustomerId);
        if (!result.id) throw new Error('Could not get customer details');
    });

    await runTest('Customer balance', async () => {
        if (!testCustomerId) throw new Error('No test customer');
        await seyfo.customers.getBalance(testCustomerId);
    });

    // ═══════════════════════════════════════════
    // DEPOSIT MODULE
    // ═══════════════════════════════════════════
    console.log('\n💳 DEPOSIT MODULE');
    console.log('─'.repeat(50));

    await runTest('Minimum payment amount', async () => {
        const result = await seyfo.deposit.getMinimumAmount('btc', 'usd');
        if (!result.min_amount) throw new Error('Could not get minimum amount');
    });

    await runTest('Price estimate', async () => {
        const result = await seyfo.deposit.getEstimate(100, 'usd', 'btc');
        if (!result.estimated_amount) throw new Error('Could not get estimate');
    });

    await runTest('Create payment', async () => {
        const result = await seyfo.deposit.createDepositAddress({
            userId: `test_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd'
        });
        if (!result.paymentId) throw new Error('Could not create payment');
    });

    await runTest('Create invoice', async () => {
        const result = await seyfo.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `inv_${Date.now()}`
        });
        if (!result.id) throw new Error('Could not create invoice');
    });

    // ═══════════════════════════════════════════
    // CURRENCY MODULE
    // ═══════════════════════════════════════════
    console.log('\n💱 CURRENCY MODULE');
    console.log('─'.repeat(50));

    await runTest('Currency list', async () => {
        const result = await seyfo.currency.getCurrencies();
        if (!result || result.length === 0) {
            throw new Error('Could not get currencies');
        }
    });

    await runTest('Detailed currencies', async () => {
        const result = await seyfo.currency.getFullCurrencies();
        if (!result || result.length === 0) throw new Error('Could not get detailed list');
    });

    await runTest('Merchant coins', async () => {
        const result = await seyfo.currency.getMerchantCurrencies();
        if (!result) {
            throw new Error('Could not get merchant coins');
        }
    });

    // ═══════════════════════════════════════════
    // CUSTODY MODULE
    // ═══════════════════════════════════════════
    console.log('\n🏦 CUSTODY MODULE');
    console.log('─'.repeat(50));

    await runTest('Custody balance', async () => {
        await seyfo.custody.getBalance();
    });

    await runTest('Conversion estimate', async () => {
        const result = await seyfo.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        if (!result) throw new Error('Could not get estimate');
    });

    // ═══════════════════════════════════════════
    // PAYOUT MODULE
    // ═══════════════════════════════════════════
    console.log('\n💸 PAYOUT MODULE');
    console.log('─'.repeat(50));

    await runTest('Payout list', async () => {
        await seyfo.payout.getPayouts({ limit: 5 });
    });

    // ═══════════════════════════════════════════
    // IPN MODULE
    // ═══════════════════════════════════════════
    console.log('\n🔐 IPN MODULE');
    console.log('─'.repeat(50));

    await runTest('Signature creation', () => {
        const testPayload = { payment_id: 123, status: 'finished' };
        // IPN handler creates signature with sortObject + HMAC
        const crypto = require('crypto');
        const sortedPayload = JSON.stringify(testPayload);
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sortedPayload);
        const signature = hmac.digest('hex');
        if (!signature || signature.length < 10) throw new Error('Could not create signature');
    });

    await runTest('Signature verification', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        // Create valid signature
        const crypto = require('crypto');
        const sorted = JSON.stringify({ payment_id: 123, payment_status: 'finished' });
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sorted);
        const signature = hmac.digest('hex');
        // Verify with verifySignature method
        const isValid = seyfo.ipn.verifySignature(testPayload, signature);
        if (!isValid) throw new Error('Could not verify signature');
    });

    await runTest('Fake signature rejection', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        const isValid = seyfo.ipn.verifySignature(testPayload, 'fake_signature_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678');
        if (isValid) throw new Error('Fake signature was accepted!');
    });

    // ═══════════════════════════════════════════
    // RESULTS
    // ═══════════════════════════════════════════
    console.log('\n' + '═'.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('═'.repeat(50));
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
        console.log('\n   Failed Tests:');
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`   - ${t.name}: ${t.error}`);
        });
    }
    
    console.log('\n' + '═'.repeat(50));
}

runAllTests().catch(console.error);
