/**
 * Custody Modülü Test Dosyası
 * 
 * Bu dosya custody (saklama) işlemlerini test eder:
 * - Bakiye sorgulama
 * - Transfer oluşturma
 * - Kripto dönüşümü
 * - Dönüşüm tahmini
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

// Test modu - true ise gerçek transfer yapmaz
const DRY_RUN = true;

async function testCustodyModule() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║         CUSTODY TESTLERİ               ║');
    console.log('╚════════════════════════════════════════╝\n');

    if (DRY_RUN) {
        console.log('⚠️  DRY_RUN modu aktif - Gerçek transfer yapılmayacak\n');
    }

    // ─────────────────────────────────────────
    // TEST 1: Custody Bakiyesi
    // ─────────────────────────────────────────
    console.log('💰 TEST 1: Custody Bakiyesi');
    console.log('─'.repeat(40));
    try {
        const balance = await seyfo.custody.getBalance();
        console.log(`✅ Bakiye alındı`);
        
        if (balance.result && balance.result.length > 0) {
            balance.result.forEach(b => {
                if (parseFloat(b.amount) > 0) {
                    console.log(`   ${b.currency}: ${b.amount}`);
                }
            });
        } else if (balance.balances) {
            balance.balances.forEach(b => {
                console.log(`   ${b.currency}: ${b.amount}`);
            });
        } else {
            console.log('   Custody bakiyesi boş');
        }
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Dönüşüm Tahmini
    // ─────────────────────────────────────────
    console.log('\n💱 TEST 2: Dönüşüm Tahmini');
    console.log('─'.repeat(40));
    try {
        const estimate = await seyfo.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        console.log(`✅ Dönüşüm tahmini alındı`);
        console.log(`   0.001 BTC = ${estimate.to_amount || estimate.estimated_amount} USDT`);
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Transfer (DRY RUN)
    // ─────────────────────────────────────────
    console.log('\n🔄 TEST 3: Custody Transfer');
    console.log('─'.repeat(40));
    
    const transferData = {
        currency: 'usdttrc20',
        amount: 10,
        address: 'TXYZabc123...'  // Test adresi
    };
    
    console.log('   Transfer verileri:');
    console.log(`   - Para Birimi: ${transferData.currency}`);
    console.log(`   - Miktar: ${transferData.amount}`);
    console.log(`   - Adres: ${transferData.address}`);
    
    if (DRY_RUN) {
        console.log('   ⏸️  DRY_RUN: Transfer yapılmadı');
    } else {
        try {
            const transfer = await seyfo.custody.createTransfer(transferData);
            console.log(`✅ Transfer oluşturuldu`);
            console.log(`   ID: ${transfer.id}`);
            console.log(`   Status: ${transfer.status}`);
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 4: Kripto Dönüşümü (DRY RUN)
    // ─────────────────────────────────────────
    console.log('\n🔀 TEST 4: Kripto Dönüşümü');
    console.log('─'.repeat(40));
    
    const conversionData = {
        fromCurrency: 'btc',
        toCurrency: 'usdttrc20',
        fromAmount: 0.001
    };
    
    console.log('   Dönüşüm verileri:');
    console.log(`   - Kaynak: ${conversionData.fromAmount} ${conversionData.fromCurrency}`);
    console.log(`   - Hedef: ${conversionData.toCurrency}`);
    
    if (DRY_RUN) {
        console.log('   ⏸️  DRY_RUN: Dönüşüm yapılmadı');
    } else {
        try {
            const conversion = await seyfo.custody.createConversion(conversionData);
            console.log(`✅ Dönüşüm oluşturuldu`);
            console.log(`   ID: ${conversion.id}`);
            console.log(`   Status: ${conversion.status}`);
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Custody testleri tamamlandı!');
    if (DRY_RUN) {
        console.log('ℹ️  Gerçek test için DRY_RUN = false yapın');
    }
    console.log('═'.repeat(40));
}

testCustodyModule().catch(console.error);
