/**
 * Payout Module Test File
 * 
 * This file tests withdrawal (payout) operations:
 * - Single payout creation
 * - Batch payout creation
 * - Payout status check
 * - Payout list
 * 
 * ⚠️ WARNING: These operations transfer real money!
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

// Test mode - if true, no real payouts will be made
const DRY_RUN = true;

async function testPayoutModule() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║           PAYOUT TESTS                 ║');
    console.log('╚════════════════════════════════════════╝\n');

    if (DRY_RUN) {
        console.log('⚠️  DRY_RUN mode active - No real payouts will be made\n');
    }

    // ─────────────────────────────────────────
    // TEST 1: Payout List
    // ─────────────────────────────────────────
    console.log('📜 TEST 1: Payout List');
    console.log('─'.repeat(40));
    try {
        const payouts = await seyfo.payout.getPayouts({ limit: 5 });
        console.log(`✅ Payout list retrieved`);
        if (payouts.data && payouts.data.length > 0) {
            console.log(`   ${payouts.data.length} payouts found`);
            payouts.data.slice(0, 3).forEach((p, i) => {
                console.log(`   ${i + 1}. ID: ${p.id} - ${p.status} - ${p.amount} ${p.currency}`);
            });
        } else {
            console.log('   No payouts yet');
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Single Payout (DRY RUN)
    // ─────────────────────────────────────────
    console.log('\n💸 TEST 2: Single Payout Creation');
    console.log('─'.repeat(40));
    
    const payoutData = {
        address: 'TXYZabc123...',  // Test address
        currency: 'usdttrc20',
        amount: 10,
        ipnCallbackUrl: 'https://example.com/payout-callback'
    };
    
    console.log('   Payout data:');
    console.log(`   - Address: ${payoutData.address}`);
    console.log(`   - Amount: ${payoutData.amount} ${payoutData.currency}`);
    
    if (DRY_RUN) {
        console.log('   ⏸️  DRY_RUN: Payout not created');
    } else {
        try {
            const payout = await seyfo.payout.createPayout(payoutData);
            console.log(`✅ Payout created`);
            console.log(`   ID: ${payout.id}`);
            console.log(`   Status: ${payout.status}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 3: Batch Payout (DRY RUN)
    // ─────────────────────────────────────────
    console.log('\n📦 TEST 3: Batch Payout Creation');
    console.log('─'.repeat(40));
    
    const batchData = {
        withdrawals: [
            { address: 'TXYZabc123...', currency: 'usdttrc20', amount: 10 },
            { address: 'TXYZdef456...', currency: 'usdttrc20', amount: 20 }
        ],
        ipnCallbackUrl: 'https://example.com/batch-callback'
    };
    
    console.log(`   ${batchData.withdrawals.length} payouts prepared`);
    
    if (DRY_RUN) {
        console.log('   ⏸️  DRY_RUN: Batch payout not created');
    } else {
        try {
            const batch = await seyfo.payout.createBatchPayout(
                batchData.withdrawals,
                batchData.ipnCallbackUrl
            );
            console.log(`✅ Batch payout created`);
            console.log(`   Batch ID: ${batch.batchId}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 4: Balance Check
    // ─────────────────────────────────────────
    console.log('\n💰 TEST 4: Balance Check');
    console.log('─'.repeat(40));
    try {
        const balanceCheck = await seyfo.payout.checkBalance('usdttrc20', 100);
        console.log(`✅ Balance check completed`);
        console.log(`   Available: ${balanceCheck.available} USDT`);
        console.log(`   Requested: ${balanceCheck.requested} USDT`);
        console.log(`   Sufficient: ${balanceCheck.sufficient ? 'Yes' : 'No'}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 5: Minimum Payout Amount
    // ─────────────────────────────────────────
    console.log('\n📊 TEST 5: Minimum Payout Amount');
    console.log('─'.repeat(40));
    try {
        const minAmount = await seyfo.payout.getMinimumPayoutAmount('usdttrc20');
        console.log(`✅ Minimum amount retrieved`);
        console.log(`   USDT (TRC20): ${minAmount.min_amount}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Payout tests completed!');
}

testPayoutModule().catch(console.error);
