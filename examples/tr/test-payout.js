/**
 * Payout Modülü Test Dosyası
 * 
 * Bu dosya çekim (payout) işlemlerini test eder:
 * - Tekli payout oluşturma
 * - Toplu payout oluşturma
 * - Payout durumu sorgulama
 * - Payout listesi
 * 
 * ⚠️ DİKKAT: Bu işlemler gerçek para transferi yapar!
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

// Test modu - true ise gerçek payout oluşturmaz
const DRY_RUN = true;

async function testPayoutModule() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║          PAYOUT TESTLERİ               ║');
    console.log('╚════════════════════════════════════════╝\n');

    if (DRY_RUN) {
        console.log('⚠️  DRY_RUN modu aktif - Gerçek payout yapılmayacak\n');
    }

    // ─────────────────────────────────────────
    // TEST 1: Payout Listesi
    // ─────────────────────────────────────────
    console.log('📜 TEST 1: Payout Listesi');
    console.log('─'.repeat(40));
    try {
        const payouts = await seyfo.payout.getPayouts({ limit: 5 });
        console.log(`✅ Payout listesi alındı`);
        if (payouts.data && payouts.data.length > 0) {
            console.log(`   ${payouts.data.length} payout bulundu`);
            payouts.data.slice(0, 3).forEach((p, i) => {
                console.log(`   ${i + 1}. ID: ${p.id} - ${p.status} - ${p.amount} ${p.currency}`);
            });
        } else {
            console.log('   Henüz payout yok');
        }
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Tekli Payout (DRY RUN)
    // ─────────────────────────────────────────
    console.log('\n💸 TEST 2: Tekli Payout Oluşturma');
    console.log('─'.repeat(40));
    
    const payoutData = {
        address: 'TXYZabc123...',  // Test adresi
        currency: 'usdttrc20',
        amount: 10,
        ipnCallbackUrl: 'https://example.com/payout-callback'
    };
    
    console.log('   Payout verileri:');
    console.log(`   - Adres: ${payoutData.address}`);
    console.log(`   - Miktar: ${payoutData.amount} ${payoutData.currency}`);
    
    if (DRY_RUN) {
        console.log('   ⏸️  DRY_RUN: Payout oluşturulmadı');
    } else {
        try {
            const payout = await seyfo.payout.createPayout(payoutData);
            console.log(`✅ Payout oluşturuldu`);
            console.log(`   ID: ${payout.id}`);
            console.log(`   Status: ${payout.status}`);
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 3: Toplu Payout (DRY RUN)
    // ─────────────────────────────────────────
    console.log('\n📦 TEST 3: Toplu Payout Oluşturma');
    console.log('─'.repeat(40));
    
    const batchData = {
        withdrawals: [
            { address: 'TXYZabc123...', currency: 'usdttrc20', amount: 10 },
            { address: 'TXYZdef456...', currency: 'usdttrc20', amount: 20 }
        ],
        ipnCallbackUrl: 'https://example.com/batch-callback'
    };
    
    console.log(`   ${batchData.withdrawals.length} adet payout hazırlandı`);
    
    if (DRY_RUN) {
        console.log('   ⏸️  DRY_RUN: Toplu payout oluşturulmadı');
    } else {
        try {
            const batch = await seyfo.payout.createBatchPayout(
                batchData.withdrawals,
                batchData.ipnCallbackUrl
            );
            console.log(`✅ Toplu payout oluşturuldu`);
            console.log(`   Batch ID: ${batch.id}`);
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 4: Payout Durumu
    // ─────────────────────────────────────────
    console.log('\n🔍 TEST 4: Payout Durumu Sorgulama');
    console.log('─'.repeat(40));
    
    // Önceki payoutlardan bir ID varsa kontrol et
    try {
        const payouts = await seyfo.payout.getPayouts({ limit: 1 });
        if (payouts.data && payouts.data.length > 0) {
            const payoutId = payouts.data[0].id;
            const status = await seyfo.payout.getPayoutStatus(payoutId);
            console.log(`✅ Payout durumu alındı`);
            console.log(`   ID: ${status.id}`);
            console.log(`   Status: ${status.status}`);
            console.log(`   Miktar: ${status.amount} ${status.currency}`);
        } else {
            console.log('⚠️  Test edilecek payout yok');
        }
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Payout testleri tamamlandı!');
    if (DRY_RUN) {
        console.log('ℹ️  Gerçek test için DRY_RUN = false yapın');
    }
    console.log('═'.repeat(40));
}

testPayoutModule().catch(console.error);
