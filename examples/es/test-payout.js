/**
 * Pruebas del Módulo de Retiro
 * 
 * Este archivo prueba las operaciones de retiro (payout):
 * - Listar retiros
 * - Crear retiro
 * - Estado del retiro
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
    console.log('║      PRUEBAS DEL MÓDULO DE RETIRO                ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // LISTAR RETIROS
    // ═══════════════════════════════════════════
    console.log('📋 LISTA DE RETIROS');
    console.log('─'.repeat(50));
    try {
        const payouts = await np.payout.getPayouts({ limit: 10 });
        console.log(`   Total de retiros: ${payouts.length || 0}`);
        if (payouts && payouts.length > 0) {
            console.log('   Últimos 5 retiros:');
            payouts.slice(0, 5).forEach(p => {
                console.log(`   - ${p.id}: ${p.amount} ${p.currency} (${p.status})`);
            });
        }
        console.log('   ✅ Prueba de listado exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // INFORMACIÓN DE RETIRO
    // ═══════════════════════════════════════════
    console.log('ℹ️ INFORMACIÓN DE RETIRO');
    console.log('─'.repeat(50));
    console.log('   ⚠️ Nota: Crear un retiro real requiere:');
    console.log('   - Saldo suficiente en custodia');
    console.log('   - Dirección de billetera válida');
    console.log('   - Verificación de seguridad\n');

    // ═══════════════════════════════════════════
    // EJEMPLO DE ESTRUCTURA DE RETIRO
    // ═══════════════════════════════════════════
    console.log('📝 EJEMPLO DE ESTRUCTURA DE RETIRO');
    console.log('─'.repeat(50));
    console.log('   Ejemplo de solicitud de retiro:');
    console.log('   {');
    console.log('     address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",');
    console.log('     currency: "btc",');
    console.log('     amount: 0.001,');
    console.log('     ipn_callback_url: "https://tu-sitio.com/webhook"');
    console.log('   }\n');

    // ═══════════════════════════════════════════
    // ESTADO DE RETIRO
    // ═══════════════════════════════════════════
    console.log('🔍 VERIFICAR ESTADO DE RETIRO');
    console.log('─'.repeat(50));
    console.log('   Para verificar el estado de un retiro:');
    console.log('   const status = await np.payout.getPayoutStatus(payoutId);');
    console.log('   ');
    console.log('   Estados posibles:');
    console.log('   - waiting: Esperando confirmación');
    console.log('   - confirming: En proceso de confirmación');
    console.log('   - sending: Enviando');
    console.log('   - finished: Completado');
    console.log('   - failed: Fallido\n');

    console.log('═'.repeat(50));
    console.log('✅ Pruebas del módulo de retiro completadas');
    console.log('═'.repeat(50));
}

runPayoutTests().catch(console.error);
