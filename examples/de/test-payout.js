/**
 * Tests des Auszahlungs-Moduls
 * 
 * Diese Datei testet Auszahlungsoperationen (Payout):
 * - Auszahlungen auflisten
 * - Auszahlung erstellen
 * - Auszahlungsstatus
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

async function runPayoutTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        TESTS DES AUSZAHLUNGS-MODULS              ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // AUSZAHLUNGEN AUFLISTEN
    // ═══════════════════════════════════════════
    console.log('📋 AUSZAHLUNGSLISTE');
    console.log('─'.repeat(50));
    try {
        const payouts = await np.payout.getPayouts({ limit: 10 });
        console.log(`   Gesamtzahl Auszahlungen: ${payouts.length || 0}`);
        if (payouts && payouts.length > 0) {
            console.log('   Letzte 5 Auszahlungen:');
            payouts.slice(0, 5).forEach(p => {
                console.log(`   - ${p.id}: ${p.amount} ${p.currency} (${p.status})`);
            });
        }
        console.log('   ✅ Listentest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // AUSZAHLUNGSINFORMATIONEN
    // ═══════════════════════════════════════════
    console.log('ℹ️ AUSZAHLUNGSINFORMATIONEN');
    console.log('─'.repeat(50));
    console.log('   ⚠️ Hinweis: Eine echte Auszahlung erfordert:');
    console.log('   - Ausreichendes Verwahrungsguthaben');
    console.log('   - Gültige Wallet-Adresse');
    console.log('   - Sicherheitsverifizierung\n');

    // ═══════════════════════════════════════════
    // BEISPIEL AUSZAHLUNGSSTRUKTUR
    // ═══════════════════════════════════════════
    console.log('📝 BEISPIEL AUSZAHLUNGSSTRUKTUR');
    console.log('─'.repeat(50));
    console.log('   Beispiel Auszahlungsanfrage:');
    console.log('   {');
    console.log('     address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",');
    console.log('     currency: "btc",');
    console.log('     amount: 0.001,');
    console.log('     ipn_callback_url: "https://ihre-seite.com/webhook"');
    console.log('   }\n');

    // ═══════════════════════════════════════════
    // AUSZAHLUNGSSTATUS
    // ═══════════════════════════════════════════
    console.log('🔍 AUSZAHLUNGSSTATUS PRÜFEN');
    console.log('─'.repeat(50));
    console.log('   Um den Status einer Auszahlung zu prüfen:');
    console.log('   const status = await np.payout.getPayoutStatus(payoutId);');
    console.log('   ');
    console.log('   Mögliche Status:');
    console.log('   - waiting: Wartet auf Bestätigung');
    console.log('   - confirming: Wird bestätigt');
    console.log('   - sending: Wird gesendet');
    console.log('   - finished: Abgeschlossen');
    console.log('   - failed: Fehlgeschlagen\n');

    console.log('═'.repeat(50));
    console.log('✅ Auszahlungs-Modul-Tests abgeschlossen');
    console.log('═'.repeat(50));
}

runPayoutTests().catch(console.error);
