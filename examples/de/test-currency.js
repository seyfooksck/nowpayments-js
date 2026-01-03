/**
 * Tests des Währungs-Moduls
 * 
 * Diese Datei testet Währungsoperationen:
 * - Währungsliste
 * - Detaillierte Währungsinformationen
 * - Händler-Währungen
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
    console.log('║        TESTS DES WÄHRUNGS-MODULS                 ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // WÄHRUNGSLISTE
    // ═══════════════════════════════════════════
    console.log('📋 WÄHRUNGSLISTE');
    console.log('─'.repeat(50));
    try {
        const currencies = await np.currency.getCurrencies();
        console.log(`   Gesamtzahl Währungen: ${currencies.length}`);
        console.log('   Erste 10 Währungen:');
        currencies.slice(0, 10).forEach(c => {
            console.log(`   - ${c}`);
        });
        console.log('   ✅ Listentest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // DETAILLIERTE WÄHRUNGEN
    // ═══════════════════════════════════════════
    console.log('📊 DETAILLIERTE WÄHRUNGEN');
    console.log('─'.repeat(50));
    try {
        const fullCurrencies = await np.currency.getFullCurrencies();
        console.log(`   Gesamtzahl mit Details: ${fullCurrencies.length}`);
        console.log('   Währungsbeispiele:');
        fullCurrencies.slice(0, 5).forEach(c => {
            console.log(`   - ${c.code || c.currency}: ${c.name || 'Ohne Name'}`);
            if (c.network) console.log(`     Netzwerk: ${c.network}`);
        });
        console.log('   ✅ Detailtest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // HÄNDLER-WÄHRUNGEN
    // ═══════════════════════════════════════════
    console.log('🏪 HÄNDLER-WÄHRUNGEN');
    console.log('─'.repeat(50));
    try {
        const merchantCoins = await np.currency.getMerchantCurrencies();
        console.log('   Verfügbare Währungen für Ihr Konto:');
        if (merchantCoins && merchantCoins.length > 0) {
            merchantCoins.slice(0, 10).forEach(c => {
                console.log(`   - ${c}`);
            });
            if (merchantCoins.length > 10) {
                console.log(`   ... und ${merchantCoins.length - 10} weitere`);
            }
        } else {
            console.log('   - Währungsliste leer');
        }
        console.log('   ✅ Händlertest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // INFORMATIONEN ZU BELIEBTEN WÄHRUNGEN
    // ═══════════════════════════════════════════
    console.log('💎 BELIEBTE WÄHRUNGEN');
    console.log('─'.repeat(50));
    console.log('   Meistgenutzte Währungen in Crypto:');
    console.log('   - BTC (Bitcoin)');
    console.log('   - ETH (Ethereum)');
    console.log('   - USDT (Tether)');
    console.log('   - LTC (Litecoin)');
    console.log('   - DOGE (Dogecoin)');
    console.log('   - TRX (TRON)');
    console.log('   - XRP (Ripple)');
    console.log('   - BNB (Binance Coin)\n');

    console.log('═'.repeat(50));
    console.log('✅ Währungs-Modul-Tests abgeschlossen');
    console.log('═'.repeat(50));
}

runCurrencyTests().catch(console.error);
