/**
 * Testdatei für Alle Module
 * 
 * Diese Datei testet alle Module der Reihe nach:
 * - API-Status
 * - Kunde (Sub-Partner)
 * - Einzahlung
 * - Auszahlung
 * - Verwahrung
 * - Währung
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
    console.log('║    NOWPAYMENTS MODUL - ALLE TESTS                ║');
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
    // API-STATUS
    // ═══════════════════════════════════════════
    console.log('📡 API-STATUS');
    console.log('─'.repeat(50));
    await runTest('API-Status prüfen', async () => {
        const status = await np.getStatus();
        if (status.message !== 'OK') throw new Error('API antwortet nicht');
    });

    // ═══════════════════════════════════════════
    // KUNDEN-MODUL
    // ═══════════════════════════════════════════
    console.log('\n👥 KUNDEN-MODUL');
    console.log('─'.repeat(50));
    
    let testCustomerId = null;
    
    await runTest('Kundenliste', async () => {
        const result = await np.customers.list();
        if (!result.customers) throw new Error('Kundenliste konnte nicht abgerufen werden');
        if (result.customers.length > 0) testCustomerId = result.customers[0].id;
    });

    await runTest('Neuen Kunden erstellen', async () => {
        const result = await np.customers.create({ name: `test_${Date.now()}` });
        if (!result.id) throw new Error('Kunde konnte nicht erstellt werden');
        testCustomerId = result.id;
    });

    await runTest('Kundendetails', async () => {
        if (!testCustomerId) throw new Error('Kein Testkunde vorhanden');
        const result = await np.customers.get(testCustomerId);
        if (!result.id) throw new Error('Kundendetails konnten nicht abgerufen werden');
    });

    await runTest('Kundensaldo', async () => {
        if (!testCustomerId) throw new Error('Kein Testkunde vorhanden');
        await np.customers.getBalance(testCustomerId);
    });

    // ═══════════════════════════════════════════
    // EINZAHLUNGS-MODUL
    // ═══════════════════════════════════════════
    console.log('\n💳 EINZAHLUNGS-MODUL');
    console.log('─'.repeat(50));

    await runTest('Mindesteinzahlungsbetrag', async () => {
        const result = await np.deposit.getMinimumAmount('btc', 'usd');
        if (!result.min_amount) throw new Error('Mindestbetrag konnte nicht abgerufen werden');
    });

    await runTest('Preisschätzung', async () => {
        const result = await np.deposit.getEstimate(100, 'usd', 'btc');
        if (!result.estimated_amount) throw new Error('Schätzung konnte nicht abgerufen werden');
    });

    await runTest('Zahlung erstellen', async () => {
        const result = await np.deposit.createDepositAddress({
            userId: `test_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd'
        });
        if (!result.paymentId) throw new Error('Zahlung konnte nicht erstellt werden');
    });

    await runTest('Rechnung erstellen', async () => {
        const result = await np.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `inv_${Date.now()}`
        });
        if (!result.id) throw new Error('Rechnung konnte nicht erstellt werden');
    });

    // ═══════════════════════════════════════════
    // WÄHRUNGS-MODUL
    // ═══════════════════════════════════════════
    console.log('\n💱 WÄHRUNGS-MODUL');
    console.log('─'.repeat(50));

    await runTest('Währungsliste', async () => {
        const result = await np.currency.getCurrencies();
        if (!result || result.length === 0) {
            throw new Error('Währungen konnten nicht abgerufen werden');
        }
    });

    await runTest('Detaillierte Währungen', async () => {
        const result = await np.currency.getFullCurrencies();
        if (!result || result.length === 0) throw new Error('Detailliste konnte nicht abgerufen werden');
    });

    await runTest('Händler-Coins', async () => {
        const result = await np.currency.getMerchantCurrencies();
        if (!result) {
            throw new Error('Händler-Coins konnten nicht abgerufen werden');
        }
    });

    // ═══════════════════════════════════════════
    // VERWAHRUNGS-MODUL
    // ═══════════════════════════════════════════
    console.log('\n🏦 VERWAHRUNGS-MODUL');
    console.log('─'.repeat(50));

    await runTest('Verwahrungssaldo', async () => {
        await np.custody.getBalance();
    });

    await runTest('Konvertierungsschätzung', async () => {
        const result = await np.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        if (!result) throw new Error('Schätzung konnte nicht abgerufen werden');
    });

    // ═══════════════════════════════════════════
    // AUSZAHLUNGS-MODUL
    // ═══════════════════════════════════════════
    console.log('\n💸 AUSZAHLUNGS-MODUL');
    console.log('─'.repeat(50));

    await runTest('Auszahlungsliste', async () => {
        await np.payout.getPayouts({ limit: 5 });
    });

    // ═══════════════════════════════════════════
    // IPN-MODUL
    // ═══════════════════════════════════════════
    console.log('\n🔐 IPN-MODUL');
    console.log('─'.repeat(50));

    await runTest('Signaturerstellung', () => {
        const testPayload = { payment_id: 123, status: 'finished' };
        const crypto = require('crypto');
        const sortedPayload = JSON.stringify(testPayload);
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sortedPayload);
        const signature = hmac.digest('hex');
        if (!signature || signature.length < 10) throw new Error('Signatur konnte nicht erstellt werden');
    });

    await runTest('Signaturverifizierung', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        const crypto = require('crypto');
        const sorted = JSON.stringify({ payment_id: 123, payment_status: 'finished' });
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sorted);
        const signature = hmac.digest('hex');
        const isValid = np.ipn.verifySignature(testPayload, signature);
        if (!isValid) throw new Error('Signatur konnte nicht verifiziert werden');
    });

    await runTest('Ablehnung falscher Signatur', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        const isValid = np.ipn.verifySignature(testPayload, 'fake_signature_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678');
        if (isValid) throw new Error('Eine falsche Signatur wurde akzeptiert!');
    });

    // ═══════════════════════════════════════════
    // ERGEBNISSE
    // ═══════════════════════════════════════════
    console.log('\n' + '═'.repeat(50));
    console.log('📊 TESTERGEBNISSE');
    console.log('═'.repeat(50));
    console.log(`   ✅ Bestanden: ${results.passed}`);
    console.log(`   ❌ Fehlgeschlagen: ${results.failed}`);
    console.log(`   📈 Erfolgsrate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
        console.log('\n   Fehlgeschlagene Tests:');
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`   - ${t.name}: ${t.error}`);
        });
    }
    
    console.log('\n' + '═'.repeat(50));
}

runAllTests().catch(console.error);
