/**
 * Custody Module Test File
 * 
 * This file tests custody (storage) operations:
 * - Balance query
 * - Transfer creation
 * - Crypto conversion
 * - Conversion estimate
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

// Test mode - if true, no real transfers will be made
const DRY_RUN = true;

async function testCustodyModule() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║          CUSTODY TESTS                 ║');
    console.log('╚════════════════════════════════════════╝\n');

    if (DRY_RUN) {
        console.log('⚠️  DRY_RUN mode active - No real transfers will be made\n');
    }

    // ─────────────────────────────────────────
    // TEST 1: Custody Balance
    // ─────────────────────────────────────────
    console.log('💰 TEST 1: Custody Balance');
    console.log('─'.repeat(40));
    try {
        const balance = await seyfo.custody.getBalance();
        console.log(`✅ Balance retrieved`);
        
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
            console.log('   Custody balance is empty');
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Conversion Estimate
    // ─────────────────────────────────────────
    console.log('\n💱 TEST 2: Conversion Estimate');
    console.log('─'.repeat(40));
    try {
        const estimate = await seyfo.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        console.log(`✅ Conversion estimate retrieved`);
        console.log(`   0.001 BTC = ${estimate.to_amount || estimate.estimated_amount} USDT`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Custody Transfer (DRY RUN)
    // ─────────────────────────────────────────
    console.log('\n🔄 TEST 3: Custody Transfer');
    console.log('─'.repeat(40));
    
    const transferData = {
        currency: 'usdttrc20',
        amount: 10,
        address: 'TXYZabc123...'  // Test address
    };
    
    console.log('   Transfer data:');
    console.log(`   - Currency: ${transferData.currency}`);
    console.log(`   - Amount: ${transferData.amount}`);
    console.log(`   - Address: ${transferData.address}`);
    
    if (DRY_RUN) {
        console.log('   ⏸️  DRY_RUN: Transfer not executed');
    } else {
        try {
            const transfer = await seyfo.custody.createTransfer(transferData);
            console.log(`✅ Transfer created`);
            console.log(`   ID: ${transfer.id}`);
            console.log(`   Status: ${transfer.status}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 4: Crypto Conversion (DRY RUN)
    // ─────────────────────────────────────────
    console.log('\n🔀 TEST 4: Crypto Conversion');
    console.log('─'.repeat(40));
    
    const conversionData = {
        fromCurrency: 'btc',
        toCurrency: 'usdttrc20',
        fromAmount: 0.001
    };
    
    console.log('   Conversion data:');
    console.log(`   - Source: ${conversionData.fromAmount} ${conversionData.fromCurrency}`);
    console.log(`   - Target: ${conversionData.toCurrency}`);
    
    if (DRY_RUN) {
        console.log('   ⏸️  DRY_RUN: Conversion not executed');
    } else {
        try {
            const conversion = await seyfo.custody.createConversion(conversionData);
            console.log(`✅ Conversion created`);
            console.log(`   ID: ${conversion.id}`);
            console.log(`   Status: ${conversion.status}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    // ─────────────────────────────────────────
    // TEST 5: Balance Summary
    // ─────────────────────────────────────────
    console.log('\n📊 TEST 5: Balance Summary');
    console.log('─'.repeat(40));
    try {
        const summary = await seyfo.custody.getBalanceSummary();
        console.log(`✅ Balance summary retrieved`);
        console.log(`   Total USD Value: $${summary.totalUsdValue?.toFixed(2) || '0.00'}`);
        console.log(`   Last Updated: ${summary.lastUpdated}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Custody tests completed!');
}

testCustodyModule().catch(console.error);
