/**
 * Tests des Kunden-Moduls (Sub-Partner)
 * 
 * Diese Datei testet Sub-Partner-Operationen:
 * - Kunden auflisten
 * - Kunde erstellen
 * - Kundendetails abrufen
 * - Kundensaldo abrufen
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

async function runCustomerTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║           TESTS DES KUNDEN-MODULS                ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    let testCustomerId = null;

    // ═══════════════════════════════════════════
    // KUNDEN AUFLISTEN
    // ═══════════════════════════════════════════
    console.log('📋 KUNDENLISTE');
    console.log('─'.repeat(50));
    try {
        const result = await np.customers.list();
        console.log(`   Gesamtzahl Kunden: ${result.customers?.length || 0}`);
        if (result.customers && result.customers.length > 0) {
            console.log('   Erste 5 Kunden:');
            result.customers.slice(0, 5).forEach(c => {
                console.log(`   - ${c.id}: ${c.name || 'Ohne Name'}`);
            });
            testCustomerId = result.customers[0].id;
        }
        console.log('   ✅ Listentest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // KUNDE ERSTELLEN
    // ═══════════════════════════════════════════
    console.log('➕ NEUEN KUNDEN ERSTELLEN');
    console.log('─'.repeat(50));
    try {
        const newCustomer = await np.customers.create({
            name: `test_customer_${Date.now()}`
        });
        console.log(`   Kunden-ID: ${newCustomer.id}`);
        console.log(`   Kundenname: ${newCustomer.name}`);
        testCustomerId = newCustomer.id;
        console.log('   ✅ Erstellungstest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // KUNDENDETAILS
    // ═══════════════════════════════════════════
    console.log('🔍 KUNDENDETAILS');
    console.log('─'.repeat(50));
    if (testCustomerId) {
        try {
            const details = await np.customers.get(testCustomerId);
            console.log(`   ID: ${details.id}`);
            console.log(`   Name: ${details.name || 'Nicht definiert'}`);
            console.log(`   Erstellt: ${details.created_at || 'Nicht verfügbar'}`);
            console.log('   ✅ Detailtest erfolgreich\n');
        } catch (error) {
            console.log(`   ❌ Fehler: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ Keine Kunden-ID zum Testen\n');
    }

    // ═══════════════════════════════════════════
    // KUNDENSALDO
    // ═══════════════════════════════════════════
    console.log('💰 KUNDENSALDO');
    console.log('─'.repeat(50));
    if (testCustomerId) {
        try {
            const balance = await np.customers.getBalance(testCustomerId);
            console.log('   Salden:');
            if (balance && typeof balance === 'object') {
                Object.keys(balance).forEach(currency => {
                    console.log(`   - ${currency}: ${balance[currency]}`);
                });
            }
            console.log('   ✅ Saldotest erfolgreich\n');
        } catch (error) {
            console.log(`   ❌ Fehler: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ Keine Kunden-ID zum Testen\n');
    }

    console.log('═'.repeat(50));
    console.log('✅ Kunden-Modul-Tests abgeschlossen');
    console.log('═'.repeat(50));
}

runCustomerTests().catch(console.error);
