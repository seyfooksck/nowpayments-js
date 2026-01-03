/**
 * Currency Module Test File
 * 
 * This file tests currency operations:
 * - Available currencies
 * - Detailed currency information
 * - Minimum payment amounts
 * - Price estimates
 * - Merchant coins
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
    console.log('║         CURRENCY TESTS                 ║');
    console.log('╚════════════════════════════════════════╝\n');

    // ─────────────────────────────────────────
    // TEST 1: Available Currencies
    // ─────────────────────────────────────────
    console.log('💱 TEST 1: Available Currencies');
    console.log('─'.repeat(40));
    try {
        const currencies = await seyfo.currency.getCurrencies();
        console.log(`✅ ${currencies.length || 0} currencies available`);
        
        // Show first 10
        const sample = currencies.slice(0, 10) || [];
        console.log(`   First 10: ${sample.join(', ')}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Detailed Currency Information
    // ─────────────────────────────────────────
    console.log('\n📋 TEST 2: Detailed Currency Information');
    console.log('─'.repeat(40));
    try {
        const fullCurrencies = await seyfo.currency.getFullCurrencies();
        console.log(`✅ ${fullCurrencies.length} currency details retrieved`);
        
        // Show BTC, ETH, USDT info
        const popular = ['btc', 'eth', 'usdttrc20'];
        popular.forEach(code => {
            const curr = fullCurrencies.find(c => c.code?.toLowerCase() === code || c.currency?.toLowerCase() === code);
            if (curr) {
                console.log(`   ${code.toUpperCase()}:`);
                console.log(`      Name: ${curr.name || curr.currency}`);
                console.log(`      Network: ${curr.network || 'N/A'}`);
            }
        });
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Merchant Coins
    // ─────────────────────────────────────────
    console.log('\n🏪 TEST 3: Merchant Coins');
    console.log('─'.repeat(40));
    try {
        const merchantCoins = await seyfo.currency.getMerchantCurrencies();
        console.log(`✅ ${merchantCoins.length} coins active`);
        console.log(`   Coins: ${merchantCoins.slice(0, 10).join(', ')}...`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 4: Minimum Payment Amounts
    // ─────────────────────────────────────────
    console.log('\n📊 TEST 4: Minimum Payment Amounts');
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
    // TEST 5: Price Estimates
    // ─────────────────────────────────────────
    console.log('\n💰 TEST 5: Price Estimates');
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
    // TEST 6: Specific Currency Detail (BTC)
    // ─────────────────────────────────────────
    console.log('\n🔍 TEST 6: Currency Detail (BTC)');
    console.log('─'.repeat(40));
    try {
        const btcInfo = await seyfo.currency.getCurrencyInfo('btc');
        console.log(`✅ BTC info retrieved`);
        console.log(`   Name: ${btcInfo?.name || 'Bitcoin'}`);
        console.log(`   Network: ${btcInfo?.network || 'N/A'}`);
        console.log(`   Is Stable: ${btcInfo?.isStableCoin || false}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 7: Popular Currencies
    // ─────────────────────────────────────────
    console.log('\n🎰 TEST 7: Popular Currencies');
    console.log('─'.repeat(40));
    try {
        const popular = seyfo.currency.getPopularCurrencies();
        console.log(`✅ ${popular.length} popular currencies`);
        popular.forEach(c => {
            console.log(`   ${c.code.toUpperCase()}: ${c.name} (${c.category})`);
        });
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 8: Currencies Requiring Extra ID
    // ─────────────────────────────────────────
    console.log('\n🏷️ TEST 8: Currencies Requiring Extra ID');
    console.log('─'.repeat(40));
    try {
        const extraIdCurrencies = seyfo.currency.getCurrenciesRequiringExtraId();
        console.log(`✅ Currencies requiring extra ID:`);
        Object.entries(extraIdCurrencies).forEach(([code, info]) => {
            console.log(`   ${code.toUpperCase()}: ${info.name} - ${info.description}`);
        });
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Currency tests completed!');
}

testCurrencyModule().catch(console.error);
