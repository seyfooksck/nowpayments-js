/**
 * Tests des Verwahrungs-Moduls
 * 
 * Diese Datei testet Verwahrungsoperationen:
 * - Verwahrungssaldo
 * - Konvertierungsschätzung
 * - Währungskonvertierung
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

async function runCustodyTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        TESTS DES VERWAHRUNGS-MODULS              ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // VERWAHRUNGSSALDO
    // ═══════════════════════════════════════════
    console.log('💰 VERWAHRUNGSSALDO');
    console.log('─'.repeat(50));
    try {
        const balance = await np.custody.getBalance();
        console.log('   Verfügbare Salden:');
        if (balance && typeof balance === 'object') {
            const currencies = Object.keys(balance);
            if (currencies.length > 0) {
                currencies.forEach(currency => {
                    console.log(`   - ${currency}: ${balance[currency]}`);
                });
            } else {
                console.log('   - Keine Salden verfügbar');
            }
        }
        console.log('   ✅ Saldotest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // KONVERTIERUNGSSCHÄTZUNG
    // ═══════════════════════════════════════════
    console.log('💱 KONVERTIERUNGSSCHÄTZUNG');
    console.log('─'.repeat(50));
    try {
        const estimate = await np.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        console.log(`   Von: 0.001 BTC`);
        console.log(`   Nach: USDT (TRC20)`);
        console.log(`   Geschätzter Betrag: ${estimate.to_amount || estimate.estimated_amount} USDT`);
        console.log('   ✅ Schätzungstest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // KONVERTIERUNGSINFORMATIONEN
    // ═══════════════════════════════════════════
    console.log('📝 KONVERTIERUNGSINFORMATIONEN');
    console.log('─'.repeat(50));
    console.log('   ⚠️ Hinweis: Echte Konvertierung erfordert:');
    console.log('   - Ausreichendes Guthaben in der Quellwährung');
    console.log('   - Kompatible Konvertierungspaare');
    console.log('   - Kontoverifizierung\n');

    // ═══════════════════════════════════════════
    // KONVERTIERUNGSBEISPIEL
    // ═══════════════════════════════════════════
    console.log('🔄 KONVERTIERUNGSBEISPIEL');
    console.log('─'.repeat(50));
    console.log('   Beispiel Konvertierungsanfrage:');
    console.log('   {');
    console.log('     fromCurrency: "btc",');
    console.log('     toCurrency: "usdttrc20",');
    console.log('     fromAmount: 0.001');
    console.log('   }');
    console.log('   ');
    console.log('   Verwendung:');
    console.log('   const result = await np.custody.convert({');
    console.log('     fromCurrency: "btc",');
    console.log('     toCurrency: "usdttrc20",');
    console.log('     fromAmount: 0.001');
    console.log('   });\n');

    console.log('═'.repeat(50));
    console.log('✅ Verwahrungs-Modul-Tests abgeschlossen');
    console.log('═'.repeat(50));
}

runCustodyTests().catch(console.error);
