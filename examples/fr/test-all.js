/**
 * Fichier de Test de Tous les Modules
 * 
 * Ce fichier teste tous les modules en séquence:
 * - Statut API
 * - Client (Sub-Partner)
 * - Dépôt
 * - Retrait
 * - Garde
 * - Devise
 * - IPN
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

async function runAllTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║    MODULE NOWPAYMENTS - TOUS LES TESTS           ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    async function runTest(name, testFn) {
        process.stdout.write(`   ${name}... `);
        try {
            await testFn();
            console.log('✅');
            results.passed++;
            results.tests.push({ name, status: 'passed' });
        } catch (error) {
            console.log(`❌ ${error.message}`);
            results.failed++;
            results.tests.push({ name, status: 'failed', error: error.message });
        }
    }

    // ═══════════════════════════════════════════
    // STATUT API
    // ═══════════════════════════════════════════
    console.log('📡 STATUT API');
    console.log('─'.repeat(50));
    await runTest('Vérifier le statut API', async () => {
        const status = await np.getStatus();
        if (status.message !== 'OK') throw new Error('API ne répond pas');
    });

    // ═══════════════════════════════════════════
    // MODULE CLIENT
    // ═══════════════════════════════════════════
    console.log('\n👥 MODULE CLIENT');
    console.log('─'.repeat(50));
    
    let testCustomerId = null;
    
    await runTest('Liste des clients', async () => {
        const result = await np.customers.list();
        if (!result.customers) throw new Error('Impossible d\'obtenir la liste des clients');
        if (result.customers.length > 0) testCustomerId = result.customers[0].id;
    });

    await runTest('Créer nouveau client', async () => {
        const result = await np.customers.create({ name: `test_${Date.now()}` });
        if (!result.id) throw new Error('Impossible de créer le client');
        testCustomerId = result.id;
    });

    await runTest('Détails du client', async () => {
        if (!testCustomerId) throw new Error('Pas de client de test');
        const result = await np.customers.get(testCustomerId);
        if (!result.id) throw new Error('Impossible d\'obtenir les détails du client');
    });

    await runTest('Solde du client', async () => {
        if (!testCustomerId) throw new Error('Pas de client de test');
        await np.customers.getBalance(testCustomerId);
    });

    // ═══════════════════════════════════════════
    // MODULE DÉPÔT
    // ═══════════════════════════════════════════
    console.log('\n💳 MODULE DÉPÔT');
    console.log('─'.repeat(50));

    await runTest('Montant minimum de paiement', async () => {
        const result = await np.deposit.getMinimumAmount('btc', 'usd');
        if (!result.min_amount) throw new Error('Impossible d\'obtenir le montant minimum');
    });

    await runTest('Estimation de prix', async () => {
        const result = await np.deposit.getEstimate(100, 'usd', 'btc');
        if (!result.estimated_amount) throw new Error('Impossible d\'obtenir l\'estimation');
    });

    await runTest('Créer paiement', async () => {
        const result = await np.deposit.createDepositAddress({
            userId: `test_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd'
        });
        if (!result.paymentId) throw new Error('Impossible de créer le paiement');
    });

    await runTest('Créer facture', async () => {
        const result = await np.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `inv_${Date.now()}`
        });
        if (!result.id) throw new Error('Impossible de créer la facture');
    });

    // ═══════════════════════════════════════════
    // MODULE DEVISE
    // ═══════════════════════════════════════════
    console.log('\n💱 MODULE DEVISE');
    console.log('─'.repeat(50));

    await runTest('Liste des devises', async () => {
        const result = await np.currency.getCurrencies();
        if (!result || result.length === 0) {
            throw new Error('Impossible d\'obtenir les devises');
        }
    });

    await runTest('Devises détaillées', async () => {
        const result = await np.currency.getFullCurrencies();
        if (!result || result.length === 0) throw new Error('Impossible d\'obtenir la liste détaillée');
    });

    await runTest('Devises du marchand', async () => {
        const result = await np.currency.getMerchantCurrencies();
        if (!result) {
            throw new Error('Impossible d\'obtenir les devises du marchand');
        }
    });

    // ═══════════════════════════════════════════
    // MODULE GARDE
    // ═══════════════════════════════════════════
    console.log('\n🏦 MODULE GARDE');
    console.log('─'.repeat(50));

    await runTest('Solde de garde', async () => {
        await np.custody.getBalance();
    });

    await runTest('Estimation de conversion', async () => {
        const result = await np.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        if (!result) throw new Error('Impossible d\'obtenir l\'estimation');
    });

    // ═══════════════════════════════════════════
    // MODULE RETRAIT
    // ═══════════════════════════════════════════
    console.log('\n💸 MODULE RETRAIT');
    console.log('─'.repeat(50));

    await runTest('Liste des retraits', async () => {
        await np.payout.getPayouts({ limit: 5 });
    });

    // ═══════════════════════════════════════════
    // MODULE IPN
    // ═══════════════════════════════════════════
    console.log('\n🔐 MODULE IPN');
    console.log('─'.repeat(50));

    await runTest('Création de signature', () => {
        const testPayload = { payment_id: 123, status: 'finished' };
        const crypto = require('crypto');
        const sortedPayload = JSON.stringify(testPayload);
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sortedPayload);
        const signature = hmac.digest('hex');
        if (!signature || signature.length < 10) throw new Error('Impossible de créer la signature');
    });

    await runTest('Vérification de signature', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        const crypto = require('crypto');
        const sorted = JSON.stringify({ payment_id: 123, payment_status: 'finished' });
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sorted);
        const signature = hmac.digest('hex');
        const isValid = np.ipn.verifySignature(testPayload, signature);
        if (!isValid) throw new Error('Impossible de vérifier la signature');
    });

    await runTest('Rejet de fausse signature', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        const isValid = np.ipn.verifySignature(testPayload, 'fake_signature_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678');
        if (isValid) throw new Error('Une fausse signature a été acceptée!');
    });

    // ═══════════════════════════════════════════
    // RÉSULTATS
    // ═══════════════════════════════════════════
    console.log('\n' + '═'.repeat(50));
    console.log('📊 RÉSULTATS DES TESTS');
    console.log('═'.repeat(50));
    console.log(`   ✅ Réussis: ${results.passed}`);
    console.log(`   ❌ Échoués: ${results.failed}`);
    console.log(`   📈 Taux de Réussite: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
        console.log('\n   Tests Échoués:');
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`   - ${t.name}: ${t.error}`);
        });
    }
    
    console.log('\n' + '═'.repeat(50));
}

runAllTests().catch(console.error);
