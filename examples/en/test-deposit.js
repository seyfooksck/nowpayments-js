/**
 * Deposit Module Test File
 * 
 * This file tests deposit operations:
 * - Create payment
 * - Create invoice
 * - Check payment status
 * - Payment list
 * - Minimum amount check
 * - Price estimate
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

async function testDepositModule() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║           DEPOSIT TESTS                ║');
    console.log('╚════════════════════════════════════════╝\n');

    let testPaymentId = null;
    let testInvoiceId = null;

    // ─────────────────────────────────────────
    // TEST 1: Minimum Payment Amount
    // ─────────────────────────────────────────
    console.log('📊 TEST 1: Minimum Payment Amount');
    console.log('─'.repeat(40));
    try {
        const minAmount = await seyfo.deposit.getMinimumAmount('btc', 'usd');
        console.log(`✅ Minimum amount retrieved`);
        console.log(`   BTC -> USD: ${minAmount.min_amount} BTC`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Price Estimate
    // ─────────────────────────────────────────
    console.log('\n💱 TEST 2: Price Estimate');
    console.log('─'.repeat(40));
    try {
        const estimate = await seyfo.deposit.getEstimate(100, 'usd', 'btc');
        console.log(`✅ Price estimate retrieved`);
        console.log(`   100 USD = ${estimate.estimated_amount} BTC`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Create Payment
    // ─────────────────────────────────────────
    console.log('\n💳 TEST 3: Create Payment');
    console.log('─'.repeat(40));
    try {
        const payment = await seyfo.deposit.createDepositAddress({
            userId: `user_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd',
            orderDescription: 'Test deposit'
        });
        console.log(`✅ Payment created`);
        console.log(`   Payment ID: ${payment.paymentId}`);
        console.log(`   Address: ${payment.depositAddress}`);
        console.log(`   Amount: ${payment.payAmount} ${payment.payCurrency}`);
        
        testPaymentId = payment.paymentId;
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 4: Create Invoice
    // ─────────────────────────────────────────
    console.log('\n📄 TEST 4: Create Invoice');
    console.log('─'.repeat(40));
    try {
        const invoice = await seyfo.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `invoice_${Date.now()}`,
            order_description: 'Test invoice'
        });
        console.log(`✅ Invoice created`);
        console.log(`   Invoice ID: ${invoice.id}`);
        console.log(`   URL: ${invoice.invoice_url}`);
        
        testInvoiceId = invoice.id;
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 5: Check Payment Status
    // ─────────────────────────────────────────
    console.log('\n🔍 TEST 5: Check Payment Status');
    console.log('─'.repeat(40));
    if (testPaymentId) {
        try {
            const status = await seyfo.deposit.checkPaymentStatus(testPaymentId);
            console.log(`✅ Payment status retrieved`);
            console.log(`   Status: ${status.status}`);
            console.log(`   Amount: ${status.payAmount} ${status.payCurrency}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    } else {
        console.log('⚠️  No payment to check');
    }

    // ─────────────────────────────────────────
    // TEST 6: Multiple Currency Estimates
    // ─────────────────────────────────────────
    console.log('\n💰 TEST 6: Multiple Currency Estimates');
    console.log('─'.repeat(40));
    
    const currencies = ['btc', 'eth', 'ltc', 'usdttrc20'];
    for (const currency of currencies) {
        try {
            const estimate = await seyfo.deposit.getEstimate(100, 'usd', currency);
            console.log(`   100 USD = ${estimate.estimated_amount} ${currency.toUpperCase()}`);
        } catch (error) {
            console.log(`   ${currency.toUpperCase()}: ❌ ${error.message}`);
        }
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Deposit tests completed!');
}

testDepositModule().catch(console.error);
