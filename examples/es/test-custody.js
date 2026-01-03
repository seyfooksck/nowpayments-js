/**
 * Pruebas del Módulo de Custodia
 * 
 * Este archivo prueba las operaciones de custodia:
 * - Saldo de custodia
 * - Estimación de conversión
 * - Conversión de divisas
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

async function runCustodyTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║      PRUEBAS DEL MÓDULO DE CUSTODIA              ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // SALDO DE CUSTODIA
    // ═══════════════════════════════════════════
    console.log('💰 SALDO DE CUSTODIA');
    console.log('─'.repeat(50));
    try {
        const balance = await np.custody.getBalance();
        console.log('   Saldos disponibles:');
        if (balance && typeof balance === 'object') {
            const currencies = Object.keys(balance);
            if (currencies.length > 0) {
                currencies.forEach(currency => {
                    console.log(`   - ${currency}: ${balance[currency]}`);
                });
            } else {
                console.log('   - No hay saldos disponibles');
            }
        }
        console.log('   ✅ Prueba de saldo exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // ESTIMACIÓN DE CONVERSIÓN
    // ═══════════════════════════════════════════
    console.log('💱 ESTIMACIÓN DE CONVERSIÓN');
    console.log('─'.repeat(50));
    try {
        const estimate = await np.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        console.log(`   Desde: 0.001 BTC`);
        console.log(`   Hasta: USDT (TRC20)`);
        console.log(`   Monto estimado: ${estimate.to_amount || estimate.estimated_amount} USDT`);
        console.log('   ✅ Prueba de estimación exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // INFORMACIÓN DE CONVERSIÓN
    // ═══════════════════════════════════════════
    console.log('📝 INFORMACIÓN DE CONVERSIÓN');
    console.log('─'.repeat(50));
    console.log('   ⚠️ Nota: La conversión real requiere:');
    console.log('   - Saldo suficiente en la moneda de origen');
    console.log('   - Pares de conversión compatibles');
    console.log('   - Verificación de cuenta\n');

    // ═══════════════════════════════════════════
    // EJEMPLO DE CONVERSIÓN
    // ═══════════════════════════════════════════
    console.log('🔄 EJEMPLO DE CONVERSIÓN');
    console.log('─'.repeat(50));
    console.log('   Ejemplo de solicitud de conversión:');
    console.log('   {');
    console.log('     fromCurrency: "btc",');
    console.log('     toCurrency: "usdttrc20",');
    console.log('     fromAmount: 0.001');
    console.log('   }');
    console.log('   ');
    console.log('   Uso:');
    console.log('   const result = await np.custody.convert({');
    console.log('     fromCurrency: "btc",');
    console.log('     toCurrency: "usdttrc20",');
    console.log('     fromAmount: 0.001');
    console.log('   });\n');

    console.log('═'.repeat(50));
    console.log('✅ Pruebas del módulo de custodia completadas');
    console.log('═'.repeat(50));
}

runCustodyTests().catch(console.error);
