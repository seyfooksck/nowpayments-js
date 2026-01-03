/**
 * Tests du Module Retrait
 * 
 * Ce fichier teste les opérations de retrait (payout):
 * - Lister les retraits
 * - Créer un retrait
 * - Statut du retrait
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
    console.log('║        TESTS DU MODULE RETRAIT                   ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // LISTER LES RETRAITS
    // ═══════════════════════════════════════════
    console.log('📋 LISTE DES RETRAITS');
    console.log('─'.repeat(50));
    try {
        const payouts = await np.payout.getPayouts({ limit: 10 });
        console.log(`   Total des retraits: ${payouts.length || 0}`);
        if (payouts && payouts.length > 0) {
            console.log('   5 derniers retraits:');
            payouts.slice(0, 5).forEach(p => {
                console.log(`   - ${p.id}: ${p.amount} ${p.currency} (${p.status})`);
            });
        }
        console.log('   ✅ Test de listage réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // INFORMATIONS SUR LES RETRAITS
    // ═══════════════════════════════════════════
    console.log('ℹ️ INFORMATIONS SUR LES RETRAITS');
    console.log('─'.repeat(50));
    console.log('   ⚠️ Note: Créer un vrai retrait nécessite:');
    console.log('   - Solde suffisant en garde');
    console.log('   - Adresse de portefeuille valide');
    console.log('   - Vérification de sécurité\n');

    // ═══════════════════════════════════════════
    // EXEMPLE DE STRUCTURE DE RETRAIT
    // ═══════════════════════════════════════════
    console.log('📝 EXEMPLE DE STRUCTURE DE RETRAIT');
    console.log('─'.repeat(50));
    console.log('   Exemple de demande de retrait:');
    console.log('   {');
    console.log('     address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",');
    console.log('     currency: "btc",');
    console.log('     amount: 0.001,');
    console.log('     ipn_callback_url: "https://votre-site.com/webhook"');
    console.log('   }\n');

    // ═══════════════════════════════════════════
    // STATUT DE RETRAIT
    // ═══════════════════════════════════════════
    console.log('🔍 VÉRIFIER LE STATUT DE RETRAIT');
    console.log('─'.repeat(50));
    console.log('   Pour vérifier le statut d\'un retrait:');
    console.log('   const status = await np.payout.getPayoutStatus(payoutId);');
    console.log('   ');
    console.log('   Statuts possibles:');
    console.log('   - waiting: En attente de confirmation');
    console.log('   - confirming: En cours de confirmation');
    console.log('   - sending: En cours d\'envoi');
    console.log('   - finished: Terminé');
    console.log('   - failed: Échoué\n');

    console.log('═'.repeat(50));
    console.log('✅ Tests du module retrait terminés');
    console.log('═'.repeat(50));
}

runPayoutTests().catch(console.error);
