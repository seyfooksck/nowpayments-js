/**
 * Currency Modülü Test Dosyası
 * 
 * Bu dosya para birimi işlemlerini test eder:
 * - Kullanılabilir para birimleri
 * - Detaylı para birimi bilgileri
 * - Minimum ödeme miktarları
 * - Fiyat tahminleri
 * - Merchant coinleri
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

async function testCurrencyModule() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║        CURRENCY TESTLERİ               ║');
    console.log('╚════════════════════════════════════════╝\n');

    // ─────────────────────────────────────────
    // TEST 1: Kullanılabilir Para Birimleri
    // ─────────────────────────────────────────
    console.log('💱 TEST 1: Kullanılabilir Para Birimleri');
    console.log('─'.repeat(40));
    try {
        const currencies = await seyfo.currency.getCurrencies();
        console.log(`✅ ${currencies.length || 0} para birimi mevcut`);
        
        // İlk 10 tanesini göster
        const sample = currencies.slice(0, 10) || [];
        console.log(`   İlk 10: ${sample.join(', ')}`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Detaylı Para Birimi Bilgileri
    // ─────────────────────────────────────────
    console.log('\n📋 TEST 2: Detaylı Para Birimi Bilgileri');
    console.log('─'.repeat(40));
    try {
        const fullCurrencies = await seyfo.currency.getFullCurrencies();
        console.log(`✅ ${fullCurrencies.length} para birimi detayı alındı`);
        
        // BTC, ETH, USDT bilgilerini göster
        const popular = ['btc', 'eth', 'usdttrc20'];
        popular.forEach(code => {
            const curr = fullCurrencies.find(c => c.code?.toLowerCase() === code || c.currency?.toLowerCase() === code);
            if (curr) {
                console.log(`   ${code.toUpperCase()}:`);
                console.log(`      İsim: ${curr.name || curr.currency}`);
                console.log(`      Network: ${curr.network || 'N/A'}`);
            }
        });
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Merchant Coinleri
    // ─────────────────────────────────────────
    console.log('\n🏪 TEST 3: Merchant Coinleri');
    console.log('─'.repeat(40));
    try {
        const merchantCoins = await seyfo.currency.getMerchantCurrencies();
        console.log(`✅ ${merchantCoins.length} coin aktif`);
        console.log(`   Coinler: ${merchantCoins.slice(0, 10).join(', ')}...`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 4: Minimum Ödeme Miktarları
    // ─────────────────────────────────────────
    console.log('\n📊 TEST 4: Minimum Ödeme Miktarları');
    console.log('─'.repeat(40));
    
    const pairs = [
        { from: 'btc', to: 'usd' },
        { from: 'eth', to: 'usd' },
        { from: 'usdttrc20', to: 'usd' }
    ];
    
    for (const pair of pairs) {
        try {
            const minAmount = await seyfo.currency.getMinimumAmount(pair.from, pair.to);
            console.log(`   ${pair.from.toUpperCase()} -> ${pair.to.toUpperCase()}: ${minAmount.min_amount} ${pair.from.toUpperCase()}`);
        } catch (error) {
            console.log(`   ${pair.from.toUpperCase()} -> ${pair.to.toUpperCase()}: ❌ ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 5: Fiyat Tahminleri
    // ─────────────────────────────────────────
    console.log('\n💰 TEST 5: Fiyat Tahminleri');
    console.log('─'.repeat(40));
    
    const estimates = [
        { amount: 100, from: 'usd', to: 'btc' },
        { amount: 100, from: 'usd', to: 'eth' },
        { amount: 100, from: 'usd', to: 'usdttrc20' }
    ];
    
    for (const est of estimates) {
        try {
            const price = await seyfo.currency.getEstimate(est.amount, est.from, est.to);
            console.log(`   ${est.amount} ${est.from.toUpperCase()} = ${price.estimatedAmount} ${est.to.toUpperCase()}`);
        } catch (error) {
            console.log(`   ${est.amount} ${est.from.toUpperCase()} -> ${est.to.toUpperCase()}: ❌ ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 6: Belirli Para Birimi Detayı
    // ─────────────────────────────────────────
    console.log('\n🔍 TEST 6: Para Birimi Detayı (BTC)');
    console.log('─'.repeat(40));
    try {
        const btcInfo = await seyfo.currency.getCurrencyInfo('btc');
        console.log(`✅ BTC bilgisi alındı`);
        console.log(`   İsim: ${btcInfo.name || 'Bitcoin'}`);
        console.log(`   Kod: ${btcInfo.code || btcInfo.currency || 'BTC'}`);
        console.log(`   Min Miktar: ${btcInfo.min_amount || 'N/A'}`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Currency testleri tamamlandı!');
    console.log('═'.repeat(40));
}

testCurrencyModule().catch(console.error);
