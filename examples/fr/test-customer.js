/**
 * Tests du Module Client (Sub-Partner)
 * 
 * Ce fichier teste les opérations sub-partner:
 * - Lister les clients
 * - Créer un client
 * - Obtenir les détails du client
 * - Obtenir le solde du client
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
    console.log('║         TESTS DU MODULE CLIENT                   ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    let testCustomerId = null;

    // ═══════════════════════════════════════════
    // LISTER LES CLIENTS
    // ═══════════════════════════════════════════
    console.log('📋 LISTE DES CLIENTS');
    console.log('─'.repeat(50));
    try {
        const result = await np.customers.list();
        console.log(`   Total de clients: ${result.customers?.length || 0}`);
        if (result.customers && result.customers.length > 0) {
            console.log('   5 premiers clients:');
            result.customers.slice(0, 5).forEach(c => {
                console.log(`   - ${c.id}: ${c.name || 'Sans nom'}`);
            });
            testCustomerId = result.customers[0].id;
        }
        console.log('   ✅ Test de listage réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // CRÉER UN CLIENT
    // ═══════════════════════════════════════════
    console.log('➕ CRÉER NOUVEAU CLIENT');
    console.log('─'.repeat(50));
    try {
        const newCustomer = await np.customers.create({
            name: `test_customer_${Date.now()}`
        });
        console.log(`   ID du client: ${newCustomer.id}`);
        console.log(`   Nom du client: ${newCustomer.name}`);
        testCustomerId = newCustomer.id;
        console.log('   ✅ Test de création réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // DÉTAILS DU CLIENT
    // ═══════════════════════════════════════════
    console.log('🔍 DÉTAILS DU CLIENT');
    console.log('─'.repeat(50));
    if (testCustomerId) {
        try {
            const details = await np.customers.get(testCustomerId);
            console.log(`   ID: ${details.id}`);
            console.log(`   Nom: ${details.name || 'Non défini'}`);
            console.log(`   Créé: ${details.created_at || 'Non disponible'}`);
            console.log('   ✅ Test des détails réussi\n');
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ Pas d\'ID de client pour tester\n');
    }

    // ═══════════════════════════════════════════
    // SOLDE DU CLIENT
    // ═══════════════════════════════════════════
    console.log('💰 SOLDE DU CLIENT');
    console.log('─'.repeat(50));
    if (testCustomerId) {
        try {
            const balance = await np.customers.getBalance(testCustomerId);
            console.log('   Soldes:');
            if (balance && typeof balance === 'object') {
                Object.keys(balance).forEach(currency => {
                    console.log(`   - ${currency}: ${balance[currency]}`);
                });
            }
            console.log('   ✅ Test de solde réussi\n');
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ Pas d\'ID de client pour tester\n');
    }

    console.log('═'.repeat(50));
    console.log('✅ Tests du module client terminés');
    console.log('═'.repeat(50));
}

runCustomerTests().catch(console.error);
