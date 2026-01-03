/**
 * Tüm Modüllerin Test Dosyası
 * 
 * Bu dosya tüm modülleri sırayla test eder:
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
    console.log('║        NOWPAYMENTS MODÜLÜ - TÜM TESTLER          ║');
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
    await runTest('API durumu kontrol', async () => {
        const status = await seyfo.getStatus();
        if (status.message !== 'OK') throw new Error('API yanıt vermiyor');
    });

    // ═══════════════════════════════════════════
    // CUSTOMER MODÜLÜ
    // ═══════════════════════════════════════════
    console.log('\n👥 CUSTOMER MODÜLÜ');
    console.log('─'.repeat(50));
    
    let testCustomerId = null;
    
    await runTest('Müşteri listesi', async () => {
        const result = await seyfo.customers.list();
        if (!result.customers) throw new Error('Müşteri listesi alınamadı');
        if (result.customers.length > 0) testCustomerId = result.customers[0].id;
    });

    await runTest('Yeni müşteri oluştur', async () => {
        const result = await seyfo.customers.create({ name: `test_${Date.now()}` });
        if (!result.id) throw new Error('Müşteri oluşturulamadı');
        testCustomerId = result.id;
    });

    await runTest('Müşteri detayı', async () => {
        if (!testCustomerId) throw new Error('Test müşterisi yok');
        const result = await seyfo.customers.get(testCustomerId);
        if (!result.id) throw new Error('Müşteri detayı alınamadı');
    });

    await runTest('Müşteri bakiyesi', async () => {
        if (!testCustomerId) throw new Error('Test müşterisi yok');
        await seyfo.customers.getBalance(testCustomerId);
    });

    // ═══════════════════════════════════════════
    // DEPOSIT MODÜLÜ
    // ═══════════════════════════════════════════
    console.log('\n💳 DEPOSIT MODÜLÜ');
    console.log('─'.repeat(50));

    await runTest('Minimum ödeme miktarı', async () => {
        const result = await seyfo.deposit.getMinimumAmount('btc', 'usd');
        if (!result.min_amount) throw new Error('Minimum miktar alınamadı');
    });

    await runTest('Fiyat tahmini', async () => {
        const result = await seyfo.deposit.getEstimate(100, 'usd', 'btc');
        if (!result.estimated_amount) throw new Error('Tahmin alınamadı');
    });

    await runTest('Ödeme oluştur', async () => {
        const result = await seyfo.deposit.createDepositAddress({
            userId: `test_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd'
        });
        if (!result.paymentId) throw new Error('Ödeme oluşturulamadı');
    });

    await runTest('Fatura oluştur', async () => {
        const result = await seyfo.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `inv_${Date.now()}`
        });
        if (!result.id) throw new Error('Fatura oluşturulamadı');
    });

    // ═══════════════════════════════════════════
    // CURRENCY MODÜLÜ
    // ═══════════════════════════════════════════
    console.log('\n💱 CURRENCY MODÜLÜ');
    console.log('─'.repeat(50));

    await runTest('Para birimi listesi', async () => {
        const result = await seyfo.currency.getCurrencies();
        if (!result || result.length === 0) {
            throw new Error('Para birimleri alınamadı');
        }
    });

    await runTest('Detaylı para birimi', async () => {
        const result = await seyfo.currency.getFullCurrencies();
        if (!result || result.length === 0) throw new Error('Detaylı liste alınamadı');
    });

    await runTest('Merchant coinleri', async () => {
        const result = await seyfo.currency.getMerchantCurrencies();
        if (!result) {
            throw new Error('Merchant coinleri alınamadı');
        }
    });

    // ═══════════════════════════════════════════
    // CUSTODY MODÜLÜ
    // ═══════════════════════════════════════════
    console.log('\n🏦 CUSTODY MODÜLÜ');
    console.log('─'.repeat(50));

    await runTest('Custody bakiyesi', async () => {
        await seyfo.custody.getBalance();
    });

    await runTest('Dönüşüm tahmini', async () => {
        const result = await seyfo.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        if (!result) throw new Error('Tahmin alınamadı');
    });

    // ═══════════════════════════════════════════
    // PAYOUT MODÜLÜ
    // ═══════════════════════════════════════════
    console.log('\n💸 PAYOUT MODÜLÜ');
    console.log('─'.repeat(50));

    await runTest('Payout listesi', async () => {
        await seyfo.payout.getPayouts({ limit: 5 });
    });

    // ═══════════════════════════════════════════
    // IPN MODÜLÜ
    // ═══════════════════════════════════════════
    console.log('\n🔐 IPN MODÜLÜ');
    console.log('─'.repeat(50));

    await runTest('İmza oluşturma', () => {
        const testPayload = { payment_id: 123, status: 'finished' };
        // IPN handler sortObject + HMAC ile imza oluşturur
        const crypto = require('crypto');
        const sortedPayload = JSON.stringify(testPayload);
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sortedPayload);
        const signature = hmac.digest('hex');
        if (!signature || signature.length < 10) throw new Error('İmza oluşturulamadı');
    });

    await runTest('İmza doğrulama', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        // Doğru imza oluştur
        const crypto = require('crypto');
        const sorted = JSON.stringify({ payment_id: 123, payment_status: 'finished' });
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sorted);
        const signature = hmac.digest('hex');
        // verifySignature metodu ile doğrula
        const isValid = seyfo.ipn.verifySignature(testPayload, signature);
        if (!isValid) throw new Error('İmza doğrulanamadı');
    });

    await runTest('Sahte imza reddi', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        const isValid = seyfo.ipn.verifySignature(testPayload, 'fake_signature_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678');
        if (isValid) throw new Error('Sahte imza kabul edildi!');
    });

    // ═══════════════════════════════════════════
    // SONUÇLAR
    // ═══════════════════════════════════════════
    console.log('\n' + '═'.repeat(50));
    console.log('📊 TEST SONUÇLARI');
    console.log('═'.repeat(50));
    console.log(`   ✅ Başarılı: ${results.passed}`);
    console.log(`   ❌ Başarısız: ${results.failed}`);
    console.log(`   📈 Başarı Oranı: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
        console.log('\n   Başarısız Testler:');
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`   - ${t.name}: ${t.error}`);
        });
    }
    
    console.log('\n' + '═'.repeat(50));
}

runAllTests().catch(console.error);
