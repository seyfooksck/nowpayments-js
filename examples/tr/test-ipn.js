/**
 * IPN (Instant Payment Notification) Modülü Test Dosyası
 * 
 * Bu dosya IPN imza doğrulama işlemlerini test eder:
 * - IPN imza doğrulama
 * - Webhook payload işleme
 * - Hatalı imza tespiti
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
    console.log('║           IPN TESTLERİ                 ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Örnek webhook payload'ları
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
    // TEST 1: İmza Oluşturma
    // ─────────────────────────────────────────
    console.log('🔐 TEST 1: İmza Oluşturma');
    console.log('─'.repeat(40));
    try {
        // IPN Handler içinde sortObject ile sıralama yapılır
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(JSON.stringify(samplePaymentWebhook));
        const signature = hmac.digest('hex');
        console.log(`✅ İmza oluşturuldu`);
        console.log(`   İmza: ${signature.substring(0, 32)}...`);
        console.log(`   Uzunluk: ${signature.length} karakter`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Geçerli İmza Doğrulama
    // ─────────────────────────────────────────
    console.log('\n✅ TEST 2: Geçerli İmza Doğrulama');
    console.log('─'.repeat(40));
    try {
        // sortObject ile sıralanmış payload için imza oluştur
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
        
        // Sonra doğrula
        const isValid = seyfo.ipn.verifySignature(samplePaymentWebhook, validSignature);
        console.log(`✅ Doğrulama sonucu: ${isValid ? 'GEÇERLİ' : 'GEÇERSİZ'}`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Geçersiz İmza Tespiti
    // ─────────────────────────────────────────
    console.log('\n❌ TEST 3: Geçersiz İmza Tespiti');
    console.log('─'.repeat(40));
    try {
        const fakeSignature = 'fakesignature123456789abcdef';
        const isValid = seyfo.ipn.verifySignature(samplePaymentWebhook, fakeSignature);
        console.log(`✅ Sahte imza ${isValid ? 'GEÇERLİ (HATA!)' : 'reddedildi'}`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 4: Webhook İşleme (Payment)
    // ─────────────────────────────────────────
    console.log('\n💳 TEST 4: Payment Webhook İşleme');
    console.log('─'.repeat(40));
    try {
        // Geçerli imza oluştur
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
        
        const result = seyfo.ipn.parseCallback(samplePaymentWebhook, validSignature);
        
        console.log(`✅ Webhook işlendi`);
        console.log(`   Payment ID: ${result.paymentId}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Miktar: ${result.payAmount} ${result.payCurrency}`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 5: Webhook İşleme (Payout)
    // ─────────────────────────────────────────
    console.log('\n💸 TEST 5: Payout Webhook İşleme');
    console.log('─'.repeat(40));
    try {
        // Geçerli imza oluştur
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
        const sortedPayload = sortObject(samplePayoutWebhook);
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(JSON.stringify(sortedPayload));
        const validSignature = hmac.digest('hex');
        
        const result = seyfo.ipn.parseCallback(samplePayoutWebhook, validSignature);
        
        console.log(`✅ Webhook işlendi`);
        console.log(`   Payout ID: ${result.paymentId || samplePayoutWebhook.id}`);
        console.log(`   Status: ${result.status || samplePayoutWebhook.status}`);
        console.log(`   Miktar: ${samplePayoutWebhook.amount} ${samplePayoutWebhook.currency}`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 6: Manipüle Edilmiş Payload
    // ─────────────────────────────────────────
    console.log('\n🛡️ TEST 6: Manipüle Edilmiş Payload Tespiti');
    console.log('─'.repeat(40));
    try {
        // Orijinal payload ile imza oluştur
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
        const originalSignature = hmac.digest('hex');
        
        // Payload'ı manipüle et
        const manipulatedPayload = { ...samplePaymentWebhook, pay_amount: 999999 };
        
        // Orijinal imza ile manipüle edilmiş payload'ı doğrulamaya çalış
        const isValid = seyfo.ipn.verifySignature(manipulatedPayload, originalSignature);
        console.log(`✅ Manipüle edilmiş payload ${isValid ? 'kabul edildi (HATA!)' : 'reddedildi'}`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 7: Express Middleware Örneği
    // ─────────────────────────────────────────
    console.log('\n🌐 TEST 7: Express Middleware Bilgisi');
    console.log('─'.repeat(40));
    console.log('   Express.js için middleware kullanımı:');
    console.log('');
    console.log('   const middleware = seyfo.ipn.createMiddleware({');
    console.log('       onSuccess: (req, res, payload) => {');
    console.log('           console.log("Ödeme alındı:", payload);');
    console.log('           res.status(200).send("OK");');
    console.log('       },');
    console.log('       onError: (req, res, error) => {');
    console.log('           console.error("IPN hatası:", error);');
    console.log('           res.status(400).send("Invalid");');
    console.log('       }');
    console.log('   });');
    console.log('');
    console.log('   app.post("/webhook", middleware);');

    console.log('\n' + '═'.repeat(40));
    console.log('IPN testleri tamamlandı!');
    console.log('═'.repeat(40));
}

testIPNModule().catch(console.error);
