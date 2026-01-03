/**
 * Deposit Modülü Test Dosyası
 * 
 * Bu dosya yatırım (deposit) işlemlerini test eder:
 * - Ödeme oluşturma
 * - Fatura oluşturma
 * - Ödeme durumu sorgulama
 * - Ödeme listesi
 * - Minimum miktar kontrolü
 * - Fiyat tahmini
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
    console.log('║         DEPOSIT TESTLERİ               ║');
    console.log('╚════════════════════════════════════════╝\n');

    let testPaymentId = null;
    let testInvoiceId = null;

    // ─────────────────────────────────────────
    // TEST 1: Minimum Ödeme Miktarı
    // ─────────────────────────────────────────
    console.log('📊 TEST 1: Minimum Ödeme Miktarı');
    console.log('─'.repeat(40));
    try {
        const minAmount = await seyfo.deposit.getMinimumAmount('btc', 'usd');
        console.log(`✅ Minimum miktar alındı`);
        console.log(`   BTC -> USD: ${minAmount.min_amount} BTC`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Fiyat Tahmini
    // ─────────────────────────────────────────
    console.log('\n💱 TEST 2: Fiyat Tahmini');
    console.log('─'.repeat(40));
    try {
        const estimate = await seyfo.deposit.getEstimate(100, 'usd', 'btc');
        console.log(`✅ Fiyat tahmini alındı`);
        console.log(`   100 USD = ${estimate.estimated_amount} BTC`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Ödeme Oluşturma
    // ─────────────────────────────────────────
    console.log('\n💳 TEST 3: Ödeme Oluşturma');
    console.log('─'.repeat(40));
    try {
        const payment = await seyfo.deposit.createDepositAddress({
            userId: `user_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd',
            orderDescription: 'Test deposit'
        });
        console.log(`✅ Ödeme oluşturuldu`);
        console.log(`   Payment ID: ${payment.paymentId}`);
        console.log(`   Adres: ${payment.depositAddress}`);
        console.log(`   Miktar: ${payment.payAmount} ${payment.payCurrency}`);
        
        testPaymentId = payment.paymentId;
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 4: Fatura Oluşturma
    // ─────────────────────────────────────────
    console.log('\n📄 TEST 4: Fatura Oluşturma');
    console.log('─'.repeat(40));
    try {
        const invoice = await seyfo.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `invoice_${Date.now()}`,
            order_description: 'Test invoice'
        });
        console.log(`✅ Fatura oluşturuldu`);
        console.log(`   Invoice ID: ${invoice.id}`);
        console.log(`   URL: ${invoice.invoice_url}`);
        
        testInvoiceId = invoice.id;
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 5: Ödeme Durumu
    // ─────────────────────────────────────────
    console.log('\n🔍 TEST 5: Ödeme Durumu Sorgulama');
    console.log('─'.repeat(40));
    if (testPaymentId) {
        try {
            const status = await seyfo.deposit.checkPaymentStatus(testPaymentId);
            console.log(`✅ Ödeme durumu alındı`);
            console.log(`   Status: ${status.status}`);
            console.log(`   Miktar: ${status.payAmount} ${status.payCurrency}`);
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    } else {
        console.log('⚠️  Test edilecek ödeme yok');
    }

    // ─────────────────────────────────────────
    // TEST 6: Ödeme Listesi
    // ─────────────────────────────────────────
    console.log('\n📜 TEST 6: Ödeme Listesi');
    console.log('─'.repeat(40));
    try {
        const payments = await seyfo.client.getPayments({ limit: 5 });
        console.log(`✅ ${payments.data?.length || 0} ödeme listelendi`);
        if (payments.data) {
            payments.data.slice(0, 3).forEach((p, i) => {
                console.log(`   ${i + 1}. ID: ${p.payment_id} - ${p.payment_status}`);
            });
        }
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Deposit testleri tamamlandı!');
    console.log('═'.repeat(40));
}

testDepositModule().catch(console.error);
