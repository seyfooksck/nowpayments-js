/**
 * Tests du Module Devise
 * 
 * Ce fichier teste les opérations de devise:
 * - Liste des devises
 * - Informations détaillées des devises
 * - Devises du marchand
 */

require('dotenv').config();
const { NowPayments } = require('../../src');

const np = new NowPayments({
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
    email: process.env.NOWPAYMENTS_EMAIL,
    password: process.env.NOWPAYMENTS_PASSWORD,
    sandbox: process.env.SANDBOX_MODE === 'true'
});

async function runCurrencyTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        TESTS DU MODULE DEVISE                    ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // LISTE DES DEVISES
    // ═══════════════════════════════════════════
    console.log('📋 LISTE DES DEVISES');
    console.log('─'.repeat(50));
    try {
        const currencies = await np.currency.getCurrencies();
        console.log(`   Total des devises: ${currencies.length}`);
        console.log('   10 premières devises:');
        currencies.slice(0, 10).forEach(c => {
            console.log(`   - ${c}`);
        });
        console.log('   ✅ Test de listage réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // DEVISES DÉTAILLÉES
    // ═══════════════════════════════════════════
    console.log('📊 DEVISES DÉTAILLÉES');
    console.log('─'.repeat(50));
    try {
        const fullCurrencies = await np.currency.getFullCurrencies();
        console.log(`   Total avec détails: ${fullCurrencies.length}`);
        console.log('   Exemples de devises:');
        fullCurrencies.slice(0, 5).forEach(c => {
            console.log(`   - ${c.code || c.currency}: ${c.name || 'Sans nom'}`);
            if (c.network) console.log(`     Réseau: ${c.network}`);
        });
        console.log('   ✅ Test détaillé réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // DEVISES DU MARCHAND
    // ═══════════════════════════════════════════
    console.log('🏪 DEVISES DU MARCHAND');
    console.log('─'.repeat(50));
    try {
        const merchantCoins = await np.currency.getMerchantCurrencies();
        console.log('   Devises disponibles pour votre compte:');
        if (merchantCoins && merchantCoins.length > 0) {
            merchantCoins.slice(0, 10).forEach(c => {
                console.log(`   - ${c}`);
            });
            if (merchantCoins.length > 10) {
                console.log(`   ... et ${merchantCoins.length - 10} autres`);
            }
        } else {
            console.log('   - Liste des devises vide');
        }
        console.log('   ✅ Test du marchand réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // INFORMATIONS SUR LES DEVISES POPULAIRES
    // ═══════════════════════════════════════════
    console.log('💎 DEVISES POPULAIRES');
    console.log('─'.repeat(50));
    console.log('   Devises les plus utilisées en crypto:');
    console.log('   - BTC (Bitcoin)');
    console.log('   - ETH (Ethereum)');
    console.log('   - USDT (Tether)');
    console.log('   - LTC (Litecoin)');
    console.log('   - DOGE (Dogecoin)');
    console.log('   - TRX (TRON)');
    console.log('   - XRP (Ripple)');
    console.log('   - BNB (Binance Coin)\n');

    console.log('═'.repeat(50));
    console.log('✅ Tests du module devise terminés');
    console.log('═'.repeat(50));
}

runCurrencyTests().catch(console.error);
