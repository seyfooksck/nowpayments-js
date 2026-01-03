/**
 * Tests du Module Dépôt
 * 
 * Ce fichier teste les opérations de dépôt:
 * - Montant minimum de paiement
 * - Estimation de prix
 * - Créer une adresse de dépôt
 * - Créer une facture
 * - Statut du paiement
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
    console.log('║        TESTS DU MODULE DÉPÔT                     ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    let paymentId = null;

    // ═══════════════════════════════════════════
    // MONTANT MINIMUM DE PAIEMENT
    // ═══════════════════════════════════════════
    console.log('📊 MONTANT MINIMUM DE PAIEMENT');
    console.log('─'.repeat(50));
    try {
        const minAmount = await np.deposit.getMinimumAmount('btc', 'usd');
        console.log(`   Devise de paiement: BTC`);
        console.log(`   Devise fiat: USD`);
        console.log(`   Montant minimum: ${minAmount.min_amount} BTC`);
        console.log('   ✅ Test du montant minimum réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // ESTIMATION DE PRIX
    // ═══════════════════════════════════════════
    console.log('💱 ESTIMATION DE PRIX');
    console.log('─'.repeat(50));
    try {
        const estimate = await np.deposit.getEstimate(100, 'usd', 'btc');
        console.log(`   Montant: 100 USD`);
        console.log(`   Équivalent estimé: ${estimate.estimated_amount} BTC`);
        console.log('   ✅ Test d\'estimation réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // CRÉER UNE ADRESSE DE DÉPÔT
    // ═══════════════════════════════════════════
    console.log('🏦 CRÉER UNE ADRESSE DE DÉPÔT');
    console.log('─'.repeat(50));
    try {
        const deposit = await np.deposit.createDepositAddress({
            userId: `user_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd',
            orderId: `order_${Date.now()}`
        });
        console.log(`   ID du paiement: ${deposit.paymentId}`);
        console.log(`   Adresse: ${deposit.payAddress}`);
        console.log(`   Montant attendu: ${deposit.payAmount} ${deposit.payCurrency}`);
        paymentId = deposit.paymentId;
        console.log('   ✅ Test de création réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // CRÉER UNE FACTURE
    // ═══════════════════════════════════════════
    console.log('📄 CRÉER UNE FACTURE');
    console.log('─'.repeat(50));
    try {
        const invoice = await np.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `invoice_${Date.now()}`,
            order_description: 'Facture de test'
        });
        console.log(`   ID de facture: ${invoice.id}`);
        console.log(`   Montant: ${invoice.price_amount} ${invoice.price_currency}`);
        console.log(`   URL de facture: ${invoice.invoice_url}`);
        console.log('   ✅ Test de facture réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // STATUT DU PAIEMENT
    // ═══════════════════════════════════════════
    console.log('🔍 STATUT DU PAIEMENT');
    console.log('─'.repeat(50));
    if (paymentId) {
        try {
            const status = await np.deposit.getPaymentStatus(paymentId);
            console.log(`   ID du paiement: ${status.payment_id}`);
            console.log(`   Statut: ${status.payment_status}`);
            console.log(`   Montant: ${status.pay_amount} ${status.pay_currency}`);
            console.log('   ✅ Test de statut réussi\n');
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ Pas d\'ID de paiement pour tester\n');
    }

    console.log('═'.repeat(50));
    console.log('✅ Tests du module dépôt terminés');
    console.log('═'.repeat(50));
}

runDepositTests().catch(console.error);
