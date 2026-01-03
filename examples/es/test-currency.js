/**
 * Pruebas del Módulo de Moneda
 * 
 * Este archivo prueba las operaciones de moneda:
 * - Lista de monedas
 * - Información detallada de monedas
 * - Monedas del comerciante
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

async function runCurrencyTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║      PRUEBAS DEL MÓDULO DE MONEDA                ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // LISTA DE MONEDAS
    // ═══════════════════════════════════════════
    console.log('📋 LISTA DE MONEDAS');
    console.log('─'.repeat(50));
    try {
        const currencies = await np.currency.getCurrencies();
        console.log(`   Total de monedas: ${currencies.length}`);
        console.log('   Primeras 10 monedas:');
        currencies.slice(0, 10).forEach(c => {
            console.log(`   - ${c}`);
        });
        console.log('   ✅ Prueba de listado exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // MONEDAS DETALLADAS
    // ═══════════════════════════════════════════
    console.log('📊 MONEDAS DETALLADAS');
    console.log('─'.repeat(50));
    try {
        const fullCurrencies = await np.currency.getFullCurrencies();
        console.log(`   Total con detalles: ${fullCurrencies.length}`);
        console.log('   Ejemplos de monedas:');
        fullCurrencies.slice(0, 5).forEach(c => {
            console.log(`   - ${c.code || c.currency}: ${c.name || 'Sin nombre'}`);
            if (c.network) console.log(`     Red: ${c.network}`);
        });
        console.log('   ✅ Prueba detallada exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // MONEDAS DEL COMERCIANTE
    // ═══════════════════════════════════════════
    console.log('🏪 MONEDAS DEL COMERCIANTE');
    console.log('─'.repeat(50));
    try {
        const merchantCoins = await np.currency.getMerchantCurrencies();
        console.log('   Monedas disponibles para su cuenta:');
        if (merchantCoins && merchantCoins.length > 0) {
            merchantCoins.slice(0, 10).forEach(c => {
                console.log(`   - ${c}`);
            });
            if (merchantCoins.length > 10) {
                console.log(`   ... y ${merchantCoins.length - 10} más`);
            }
        } else {
            console.log('   - Lista de monedas vacía');
        }
        console.log('   ✅ Prueba de comerciante exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // INFORMACIÓN DE MONEDAS POPULARES
    // ═══════════════════════════════════════════
    console.log('💎 MONEDAS POPULARES');
    console.log('─'.repeat(50));
    console.log('   Monedas más usadas en crypto:');
    console.log('   - BTC (Bitcoin)');
    console.log('   - ETH (Ethereum)');
    console.log('   - USDT (Tether)');
    console.log('   - LTC (Litecoin)');
    console.log('   - DOGE (Dogecoin)');
    console.log('   - TRX (TRON)');
    console.log('   - XRP (Ripple)');
    console.log('   - BNB (Binance Coin)\n');

    console.log('═'.repeat(50));
    console.log('✅ Pruebas del módulo de moneda completadas');
    console.log('═'.repeat(50));
}

runCurrencyTests().catch(console.error);
