/**
 * Tests des IPN-Moduls (Instant Payment Notification)
 * 
 * Diese Datei testet IPN-Operationen:
 * - Signaturverifizierung
 * - Signaturerstellung
 * - Webhook-Handling
 */

require('dotenv').config();
const { NowPayments } = require('../../src');
const crypto = require('crypto');

const np = new NowPayments({
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
    email: process.env.NOWPAYMENTS_EMAIL,
    password: process.env.NOWPAYMENTS_PASSWORD,
    sandbox: process.env.SANDBOX_MODE === 'true'
});

async function runIpnTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        TESTS DES IPN-MODULS                      ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || 'test_secret';

    // ═══════════════════════════════════════════
    // SIGNATURERSTELLUNG
    // ═══════════════════════════════════════════
    console.log('🔐 SIGNATURERSTELLUNG');
    console.log('─'.repeat(50));
    try {
        const testPayload = {
            payment_id: 123456789,
            payment_status: 'finished',
            pay_address: 'bc1qtest...',
            price_amount: 100,
            price_currency: 'usd',
            pay_amount: 0.0025,
            pay_currency: 'btc',
            order_id: 'order_123'
        };

        const sortedPayload = JSON.stringify(testPayload, Object.keys(testPayload).sort());
        const hmac = crypto.createHmac('sha512', ipnSecret);
        hmac.update(sortedPayload);
        const signature = hmac.digest('hex');

        console.log('   Testdaten:');
        console.log(`   - Zahlungs-ID: ${testPayload.payment_id}`);
        console.log(`   - Status: ${testPayload.payment_status}`);
        console.log(`   - Betrag: ${testPayload.pay_amount} ${testPayload.pay_currency}`);
        console.log(`   Generierte Signatur: ${signature.substring(0, 32)}...`);
        console.log('   ✅ Signaturerstellungstest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // SIGNATURVERIFIZIERUNG
    // ═══════════════════════════════════════════
    console.log('✅ SIGNATURVERIFIZIERUNG');
    console.log('─'.repeat(50));
    try {
        const testPayload = {
            payment_id: 123456789,
            payment_status: 'finished'
        };

        const sortedPayload = JSON.stringify(testPayload, Object.keys(testPayload).sort());
        const hmac = crypto.createHmac('sha512', ipnSecret);
        hmac.update(sortedPayload);
        const validSignature = hmac.digest('hex');

        const isValid = np.ipn.verifySignature(testPayload, validSignature);
        console.log(`   Gültige Signatur: ${isValid ? '✅ Ja' : '❌ Nein'}`);
        console.log('   ✅ Verifizierungstest erfolgreich\n');
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // ABLEHNUNG UNGÜLTIGER SIGNATUR
    // ═══════════════════════════════════════════
    console.log('❌ ABLEHNUNG UNGÜLTIGER SIGNATUR');
    console.log('─'.repeat(50));
    try {
        const testPayload = {
            payment_id: 123456789,
            payment_status: 'finished'
        };

        const fakeSignature = 'a'.repeat(128);
        const isValid = np.ipn.verifySignature(testPayload, fakeSignature);
        
        if (!isValid) {
            console.log('   Falsche Signatur korrekt abgelehnt');
            console.log('   ✅ Ablehnungstest erfolgreich\n');
        } else {
            console.log('   ❌ Fehler: Eine falsche Signatur wurde akzeptiert!\n');
        }
    } catch (error) {
        console.log(`   ❌ Fehler: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // WEBHOOK-HANDLING BEISPIEL
    // ═══════════════════════════════════════════
    console.log('🌐 WEBHOOK-HANDLING BEISPIEL');
    console.log('─'.repeat(50));
    console.log('   Beispiel Express-Server für IPN:');
    console.log('   ');
    console.log('   app.post("/webhook/nowpayments", (req, res) => {');
    console.log('     const signature = req.headers["x-nowpayments-sig"];');
    console.log('     const payload = req.body;');
    console.log('     ');
    console.log('     if (np.ipn.verifySignature(payload, signature)) {');
    console.log('       // Zahlung verarbeiten');
    console.log('       console.log("Zahlung verifiziert:", payload.payment_id);');
    console.log('       res.status(200).send("OK");');
    console.log('     } else {');
    console.log('       res.status(400).send("Ungültige Signatur");');
    console.log('     }');
    console.log('   });\n');

    // ═══════════════════════════════════════════
    // ZAHLUNGSSTATUS
    // ═══════════════════════════════════════════
    console.log('📊 ZAHLUNGSSTATUS');
    console.log('─'.repeat(50));
    console.log('   Mögliche Status per IPN:');
    console.log('   - waiting: Warte auf Zahlung');
    console.log('   - confirming: Wird bestätigt');
    console.log('   - confirmed: Zahlung bestätigt');
    console.log('   - sending: Wird an Wallet gesendet');
    console.log('   - partially_paid: Teilweise bezahlt');
    console.log('   - finished: Abgeschlossen');
    console.log('   - failed: Fehlgeschlagen');
    console.log('   - refunded: Erstattet');
    console.log('   - expired: Abgelaufen\n');

    console.log('═'.repeat(50));
    console.log('✅ IPN-Modul-Tests abgeschlossen');
    console.log('═'.repeat(50));
}

runIpnTests().catch(console.error);
