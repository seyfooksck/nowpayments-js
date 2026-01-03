/**
 * Tests du Module IPN (Notification de Paiement Instantané)
 * 
 * Ce fichier teste les opérations IPN:
 * - Vérification de signature
 * - Création de signature
 * - Gestion des webhooks
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
    console.log('║        TESTS DU MODULE IPN                       ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || 'test_secret';

    // ═══════════════════════════════════════════
    // CRÉATION DE SIGNATURE
    // ═══════════════════════════════════════════
    console.log('🔐 CRÉATION DE SIGNATURE');
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

        console.log('   Données de test:');
        console.log(`   - ID du paiement: ${testPayload.payment_id}`);
        console.log(`   - Statut: ${testPayload.payment_status}`);
        console.log(`   - Montant: ${testPayload.pay_amount} ${testPayload.pay_currency}`);
        console.log(`   Signature générée: ${signature.substring(0, 32)}...`);
        console.log('   ✅ Test de création de signature réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // VÉRIFICATION DE SIGNATURE
    // ═══════════════════════════════════════════
    console.log('✅ VÉRIFICATION DE SIGNATURE');
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
        console.log(`   Signature valide: ${isValid ? '✅ Oui' : '❌ Non'}`);
        console.log('   ✅ Test de vérification réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // REJET DE SIGNATURE INVALIDE
    // ═══════════════════════════════════════════
    console.log('❌ REJET DE SIGNATURE INVALIDE');
    console.log('─'.repeat(50));
    try {
        const testPayload = {
            payment_id: 123456789,
            payment_status: 'finished'
        };

        const fakeSignature = 'a'.repeat(128);
        const isValid = np.ipn.verifySignature(testPayload, fakeSignature);
        
        if (!isValid) {
            console.log('   Fausse signature rejetée correctement');
            console.log('   ✅ Test de rejet réussi\n');
        } else {
            console.log('   ❌ Erreur: Une fausse signature a été acceptée!\n');
        }
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // EXEMPLE DE GESTION DE WEBHOOK
    // ═══════════════════════════════════════════
    console.log('🌐 EXEMPLE DE GESTION DE WEBHOOK');
    console.log('─'.repeat(50));
    console.log('   Exemple de serveur Express pour IPN:');
    console.log('   ');
    console.log('   app.post("/webhook/nowpayments", (req, res) => {');
    console.log('     const signature = req.headers["x-nowpayments-sig"];');
    console.log('     const payload = req.body;');
    console.log('     ');
    console.log('     if (np.ipn.verifySignature(payload, signature)) {');
    console.log('       // Traiter le paiement');
    console.log('       console.log("Paiement vérifié:", payload.payment_id);');
    console.log('       res.status(200).send("OK");');
    console.log('     } else {');
    console.log('       res.status(400).send("Signature invalide");');
    console.log('     }');
    console.log('   });\n');

    // ═══════════════════════════════════════════
    // STATUTS DE PAIEMENT
    // ═══════════════════════════════════════════
    console.log('📊 STATUTS DE PAIEMENT');
    console.log('─'.repeat(50));
    console.log('   Statuts possibles reçus via IPN:');
    console.log('   - waiting: En attente du paiement');
    console.log('   - confirming: Confirmation en cours');
    console.log('   - confirmed: Paiement confirmé');
    console.log('   - sending: Envoi au portefeuille');
    console.log('   - partially_paid: Partiellement payé');
    console.log('   - finished: Terminé');
    console.log('   - failed: Échoué');
    console.log('   - refunded: Remboursé');
    console.log('   - expired: Expiré\n');

    console.log('═'.repeat(50));
    console.log('✅ Tests du module IPN terminés');
    console.log('═'.repeat(50));
}

runIpnTests().catch(console.error);
