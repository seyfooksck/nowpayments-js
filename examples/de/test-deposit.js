/**
 * Tests des Einzahlungs-Moduls
 * 
 * Diese Datei testet Einzahlungsoperationen:
 * - Mindesteinzahlungsbetrag
 * - Preisschätzung
 * - Einzahlungsadresse erstellen
 * - Rechnung erstellen
 * - Zahlungsstatus
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

async function runDepositTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        TESTS DES EINZAHLUNGS-MODULS              ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    let paymentId = null;

    // ═══════════════════════════════════════════
    // MINDESTEINZAHLUNGSBETRAG
    // ═══════════════════════════════════════════
    console.log('📊 MINDESTEINZAHLUNGSBETRAG');
    console.log('─'.repeat(50));
    try {
        const minAmount = await np.deposit.getMinimumAmount('btc', 'usd');
        console.log(`   Zahlungswährung: BTC`);
        console.log(`   Fiat-Währung: USD`);
        console.log(`   Mindestbetrag: ${minAmount.min_amount} BTC`);
        console.log('   ✅ Mindestbetrag-Test erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // PREISSCHÄTZUNG
    // ═══════════════════════════════════════════
    console.log('💱 PREISSCHÄTZUNG');
    console.log('─'.repeat(50));
    try {
        const estimate = await np.deposit.getEstimate(100, 'usd', 'btc');
        console.log(`   Betrag: 100 USD`);
        console.log(`   Geschätzter Gegenwert: ${estimate.estimated_amount} BTC`);
        console.log('   ✅ Schätzungstest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // EINZAHLUNGSADRESSE ERSTELLEN
    // ═══════════════════════════════════════════
    console.log('🏦 EINZAHLUNGSADRESSE ERSTELLEN');
    console.log('─'.repeat(50));
    try {
        const deposit = await np.deposit.createDepositAddress({
            userId: `user_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd',
            orderId: `order_${Date.now()}`
        });
        console.log(`   Zahlungs-ID: ${deposit.paymentId}`);
        console.log(`   Adresse: ${deposit.payAddress}`);
        console.log(`   Erwarteter Betrag: ${deposit.payAmount} ${deposit.payCurrency}`);
        paymentId = deposit.paymentId;
        console.log('   ✅ Erstellungstest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // RECHNUNG ERSTELLEN
    // ═══════════════════════════════════════════
    console.log('📄 RECHNUNG ERSTELLEN');
    console.log('─'.repeat(50));
    try {
        const invoice = await np.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `invoice_${Date.now()}`,
            order_description: 'Testrechnung'
        });
        console.log(`   Rechnungs-ID: ${invoice.id}`);
        console.log(`   Betrag: ${invoice.price_amount} ${invoice.price_currency}`);
        console.log(`   Rechnungs-URL: ${invoice.invoice_url}`);
        console.log('   ✅ Rechnungstest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // ZAHLUNGSSTATUS
    // ═══════════════════════════════════════════
    console.log('🔍 ZAHLUNGSSTATUS');
    console.log('─'.repeat(50));
    if (paymentId) {
        try {
            const status = await np.deposit.getPaymentStatus(paymentId);
            console.log(`   Zahlungs-ID: ${status.payment_id}`);
            console.log(`   Status: ${status.payment_status}`);
            console.log(`   Betrag: ${status.pay_amount} ${status.pay_currency}`);
            console.log('   ✅ Statustest erfolgreich\n');
        } catch (error) {
            console.log(`   ❌ Fehler: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ Keine Zahlungs-ID zum Testen\n');
    }

    console.log('═'.repeat(50));
    console.log('✅ Einzahlungs-Modul-Tests abgeschlossen');
    console.log('═'.repeat(50));
}

runDepositTests().catch(console.error);
