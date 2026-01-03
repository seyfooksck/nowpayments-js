/**
 * Pruebas del Módulo de Depósito
 * 
 * Este archivo prueba las operaciones de depósito:
 * - Monto mínimo de pago
 * - Estimación de precios
 * - Crear dirección de depósito
 * - Crear factura
 * - Estado del pago
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
    console.log('║      PRUEBAS DEL MÓDULO DE DEPÓSITO              ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    let paymentId = null;

    // ═══════════════════════════════════════════
    // MONTO MÍNIMO DE PAGO
    // ═══════════════════════════════════════════
    console.log('📊 MONTO MÍNIMO DE PAGO');
    console.log('─'.repeat(50));
    try {
        const minAmount = await np.deposit.getMinimumAmount('btc', 'usd');
        console.log(`   Moneda de pago: BTC`);
        console.log(`   Moneda fiat: USD`);
        console.log(`   Monto mínimo: ${minAmount.min_amount} BTC`);
        console.log('   ✅ Prueba de monto mínimo exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // ESTIMACIÓN DE PRECIOS
    // ═══════════════════════════════════════════
    console.log('💱 ESTIMACIÓN DE PRECIOS');
    console.log('─'.repeat(50));
    try {
        const estimate = await np.deposit.getEstimate(100, 'usd', 'btc');
        console.log(`   Monto: 100 USD`);
        console.log(`   Equivalente estimado: ${estimate.estimated_amount} BTC`);
        console.log('   ✅ Prueba de estimación exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // CREAR DIRECCIÓN DE DEPÓSITO
    // ═══════════════════════════════════════════
    console.log('🏦 CREAR DIRECCIÓN DE DEPÓSITO');
    console.log('─'.repeat(50));
    try {
        const deposit = await np.deposit.createDepositAddress({
            userId: `user_${Date.now()}`,
            payCurrency: 'btc',
            priceAmount: 100,
            priceCurrency: 'usd',
            orderId: `order_${Date.now()}`
        });
        console.log(`   ID del pago: ${deposit.paymentId}`);
        console.log(`   Dirección: ${deposit.payAddress}`);
        console.log(`   Monto esperado: ${deposit.payAmount} ${deposit.payCurrency}`);
        paymentId = deposit.paymentId;
        console.log('   ✅ Prueba de creación exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // CREAR FACTURA
    // ═══════════════════════════════════════════
    console.log('📄 CREAR FACTURA');
    console.log('─'.repeat(50));
    try {
        const invoice = await np.client.createInvoice({
            price_amount: 50,
            price_currency: 'usd',
            order_id: `invoice_${Date.now()}`,
            order_description: 'Factura de prueba'
        });
        console.log(`   ID de factura: ${invoice.id}`);
        console.log(`   Monto: ${invoice.price_amount} ${invoice.price_currency}`);
        console.log(`   URL de factura: ${invoice.invoice_url}`);
        console.log('   ✅ Prueba de factura exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // ESTADO DEL PAGO
    // ═══════════════════════════════════════════
    console.log('🔍 ESTADO DEL PAGO');
    console.log('─'.repeat(50));
    if (paymentId) {
        try {
            const status = await np.deposit.getPaymentStatus(paymentId);
            console.log(`   ID del pago: ${status.payment_id}`);
            console.log(`   Estado: ${status.payment_status}`);
            console.log(`   Monto: ${status.pay_amount} ${status.pay_currency}`);
            console.log('   ✅ Prueba de estado exitosa\n');
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ No hay ID de pago para probar\n');
    }

    console.log('═'.repeat(50));
    console.log('✅ Pruebas del módulo de depósito completadas');
    console.log('═'.repeat(50));
}

runDepositTests().catch(console.error);
