/**
 * Pruebas del Módulo de Cliente (Sub-Partner)
 * 
 * Este archivo prueba las operaciones de sub-partner:
 * - Listar clientes
 * - Crear cliente
 * - Obtener detalles del cliente
 * - Obtener saldo del cliente
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
    console.log('║      PRUEBAS DEL MÓDULO DE CLIENTE               ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    let testCustomerId = null;

    // ═══════════════════════════════════════════
    // LISTAR CLIENTES
    // ═══════════════════════════════════════════
    console.log('📋 LISTA DE CLIENTES');
    console.log('─'.repeat(50));
    try {
        const result = await np.customers.list();
        console.log(`   Total de clientes: ${result.customers?.length || 0}`);
        if (result.customers && result.customers.length > 0) {
            console.log('   Primeros 5 clientes:');
            result.customers.slice(0, 5).forEach(c => {
                console.log(`   - ${c.id}: ${c.name || 'Sin nombre'}`);
            });
            testCustomerId = result.customers[0].id;
        }
        console.log('   ✅ Prueba de listado exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // CREAR CLIENTE
    // ═══════════════════════════════════════════
    console.log('➕ CREAR NUEVO CLIENTE');
    console.log('─'.repeat(50));
    try {
        const newCustomer = await np.customers.create({
            name: `test_customer_${Date.now()}`
        });
        console.log(`   ID del cliente: ${newCustomer.id}`);
        console.log(`   Nombre del cliente: ${newCustomer.name}`);
        testCustomerId = newCustomer.id;
        console.log('   ✅ Prueba de creación exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // DETALLES DEL CLIENTE
    // ═══════════════════════════════════════════
    console.log('🔍 DETALLES DEL CLIENTE');
    console.log('─'.repeat(50));
    if (testCustomerId) {
        try {
            const details = await np.customers.get(testCustomerId);
            console.log(`   ID: ${details.id}`);
            console.log(`   Nombre: ${details.name || 'No definido'}`);
            console.log(`   Creado: ${details.created_at || 'No disponible'}`);
            console.log('   ✅ Prueba de detalles exitosa\n');
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ No hay ID de cliente para probar\n');
    }

    // ═══════════════════════════════════════════
    // SALDO DEL CLIENTE
    // ═══════════════════════════════════════════
    console.log('💰 SALDO DEL CLIENTE');
    console.log('─'.repeat(50));
    if (testCustomerId) {
        try {
            const balance = await np.customers.getBalance(testCustomerId);
            console.log('   Saldos:');
            if (balance && typeof balance === 'object') {
                Object.keys(balance).forEach(currency => {
                    console.log(`   - ${currency}: ${balance[currency]}`);
                });
            }
            console.log('   ✅ Prueba de saldo exitosa\n');
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    } else {
        console.log('   ⚠️ No hay ID de cliente para probar\n');
    }

    console.log('═'.repeat(50));
    console.log('✅ Pruebas del módulo de cliente completadas');
    console.log('═'.repeat(50));
}

runCustomerTests().catch(console.error);
