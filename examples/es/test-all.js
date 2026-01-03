/**
 * Archivo de Prueba de Todos los Módulos
 * 
 * Este archivo prueba todos los módulos en secuencia:
 * - Estado de API
 * - Cliente (Sub-Partner)
 * - Depósito
 * - Retiro
 * - Custodia
 * - Moneda
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
    console.log('║   MÓDULO NOWPAYMENTS - TODAS LAS PRUEBAS         ║');
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
    // ESTADO DE API
    // ═══════════════════════════════════════════
    console.log('📡 ESTADO DE API');
    console.log('─'.repeat(50));
    await runTest('Verificar estado de API', async () => {
        const status = await np.getStatus();
        if (status.message !== 'OK') throw new Error('API no responde');
    });

    // ═══════════════════════════════════════════
    // MÓDULO DE CLIENTE
    // ═══════════════════════════════════════════
    console.log('\n👥 MÓDULO DE CLIENTE');
    console.log('─'.repeat(50));
    
    let testCustomerId = null;
    
    await runTest('Lista de clientes', async () => {
        const result = await np.customers.list();
        if (!result.customers) throw new Error('No se pudo obtener la lista de clientes');
        if (result.customers.length > 0) testCustomerId = result.customers[0].id;
    });

    await runTest('Crear nuevo cliente', async () => {
        const result = await np.customers.create({ name: `test_${Date.now()}` });
        if (!result.id) throw new Error('No se pudo crear el cliente');
        testCustomerId = result.id;
    });

    await runTest('Detalles del cliente', async () => {
        if (!testCustomerId) throw new Error('No hay cliente de prueba');
        const result = await np.customers.get(testCustomerId);
        if (!result.id) throw new Error('No se pudieron obtener los detalles del cliente');
    });

    await runTest('Saldo del cliente', async () => {
        if (!testCustomerId) throw new Error('No hay cliente de prueba');
        await np.customers.getBalance(testCustomerId);
    });

    // ═══════════════════════════════════════════
    // MÓDULO DE DEPÓSITO
    // ═══════════════════════════════════════════
    console.log('\n💳 MÓDULO DE DEPÓSITO');
    console.log('─'.repeat(50));

    await runTest('Monto mínimo de pago', async () => {
        const result = await np.deposit.getMinimumAmount('btc', 'usd');
        if (!result.min_amount) throw new Error('No se pudo obtener el monto mínimo');
    });

    await runTest('Estimación de precio', async () => {
        const result = await np.deposit.getEstimate(100, 'usd', 'btc');
        if (!result.estimated_amount) throw new Error('No se pudo obtener la estimación');
    });

    await runTest('Crear pago', async () => {
        const result = await np.deposit.createDepositAddress({
            userId: `test_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd'
        });
        if (!result.paymentId) throw new Error('No se pudo crear el pago');
    });

    await runTest('Crear factura', async () => {
        const result = await np.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `inv_${Date.now()}`
        });
        if (!result.id) throw new Error('No se pudo crear la factura');
    });

    // ═══════════════════════════════════════════
    // MÓDULO DE MONEDA
    // ═══════════════════════════════════════════
    console.log('\n💱 MÓDULO DE MONEDA');
    console.log('─'.repeat(50));

    await runTest('Lista de monedas', async () => {
        const result = await np.currency.getCurrencies();
        if (!result || result.length === 0) {
            throw new Error('No se pudieron obtener las monedas');
        }
    });

    await runTest('Monedas detalladas', async () => {
        const result = await np.currency.getFullCurrencies();
        if (!result || result.length === 0) throw new Error('No se pudo obtener la lista detallada');
    });

    await runTest('Monedas del comerciante', async () => {
        const result = await np.currency.getMerchantCurrencies();
        if (!result) {
            throw new Error('No se pudieron obtener las monedas del comerciante');
        }
    });

    // ═══════════════════════════════════════════
    // MÓDULO DE CUSTODIA
    // ═══════════════════════════════════════════
    console.log('\n🏦 MÓDULO DE CUSTODIA');
    console.log('─'.repeat(50));

    await runTest('Saldo de custodia', async () => {
        await np.custody.getBalance();
    });

    await runTest('Estimación de conversión', async () => {
        const result = await np.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        if (!result) throw new Error('No se pudo obtener la estimación');
    });

    // ═══════════════════════════════════════════
    // MÓDULO DE RETIRO
    // ═══════════════════════════════════════════
    console.log('\n💸 MÓDULO DE RETIRO');
    console.log('─'.repeat(50));

    await runTest('Lista de retiros', async () => {
        await np.payout.getPayouts({ limit: 5 });
    });

    // ═══════════════════════════════════════════
    // MÓDULO IPN
    // ═══════════════════════════════════════════
    console.log('\n🔐 MÓDULO IPN');
    console.log('─'.repeat(50));

    await runTest('Creación de firma', () => {
        const testPayload = { payment_id: 123, status: 'finished' };
        const crypto = require('crypto');
        const sortedPayload = JSON.stringify(testPayload);
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sortedPayload);
        const signature = hmac.digest('hex');
        if (!signature || signature.length < 10) throw new Error('No se pudo crear la firma');
    });

    await runTest('Verificación de firma', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        const crypto = require('crypto');
        const sorted = JSON.stringify({ payment_id: 123, payment_status: 'finished' });
        const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || 'test');
        hmac.update(sorted);
        const signature = hmac.digest('hex');
        const isValid = np.ipn.verifySignature(testPayload, signature);
        if (!isValid) throw new Error('No se pudo verificar la firma');
    });

    await runTest('Rechazo de firma falsa', () => {
        const testPayload = { payment_id: 123, payment_status: 'finished' };
        const isValid = np.ipn.verifySignature(testPayload, 'fake_signature_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678');
        if (isValid) throw new Error('¡Se aceptó una firma falsa!');
    });

    // ═══════════════════════════════════════════
    // RESULTADOS
    // ═══════════════════════════════════════════
    console.log('\n' + '═'.repeat(50));
    console.log('📊 RESULTADOS DE PRUEBAS');
    console.log('═'.repeat(50));
    console.log(`   ✅ Aprobadas: ${results.passed}`);
    console.log(`   ❌ Fallidas: ${results.failed}`);
    console.log(`   📈 Tasa de Éxito: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
        console.log('\n   Pruebas Fallidas:');
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`   - ${t.name}: ${t.error}`);
        });
    }
    
    console.log('\n' + '═'.repeat(50));
}

runAllTests().catch(console.error);
