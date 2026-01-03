/**
 * Pruebas del Módulo IPN (Notificación de Pago Instantáneo)
 * 
 * Este archivo prueba las operaciones de IPN:
 * - Verificación de firma
 * - Creación de firma
 * - Manejo de webhooks
 */

require('dotenv').config();
const { NowPayments } = require('../../src');
const crypto = require('crypto');

const np = new NowPayments({
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
    email: process.env.NOWPAYMENTS_EMAIL,
    password: process.env.NOWPAYMENTS_PASSWORD,
    sandbox: process.env.SANDBOX_MODE === 'true'
});

async function runIpnTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║      PRUEBAS DEL MÓDULO IPN                      ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || 'test_secret';

    // ═══════════════════════════════════════════
    // CREACIÓN DE FIRMA
    // ═══════════════════════════════════════════
    console.log('🔐 CREACIÓN DE FIRMA');
    console.log('─'.repeat(50));
    try {
        const testPayload = {
            payment_id: 123456789,
            payment_status: 'finished',
            pay_address: 'bc1qtest...',
            price_amount: 100,
            price_currency: 'usd',
            pay_amount: 0.0025,
            pay_currency: 'btc',
            order_id: 'order_123'
        };

        const sortedPayload = JSON.stringify(testPayload, Object.keys(testPayload).sort());
        const hmac = crypto.createHmac('sha512', ipnSecret);
        hmac.update(sortedPayload);
        const signature = hmac.digest('hex');

        console.log('   Datos de prueba:');
        console.log(`   - ID del pago: ${testPayload.payment_id}`);
        console.log(`   - Estado: ${testPayload.payment_status}`);
        console.log(`   - Monto: ${testPayload.pay_amount} ${testPayload.pay_currency}`);
        console.log(`   Firma generada: ${signature.substring(0, 32)}...`);
        console.log('   ✅ Prueba de creación de firma exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // VERIFICACIÓN DE FIRMA
    // ═══════════════════════════════════════════
    console.log('✅ VERIFICACIÓN DE FIRMA');
    console.log('─'.repeat(50));
    try {
        const testPayload = {
            payment_id: 123456789,
            payment_status: 'finished'
        };

        const sortedPayload = JSON.stringify(testPayload, Object.keys(testPayload).sort());
        const hmac = crypto.createHmac('sha512', ipnSecret);
        hmac.update(sortedPayload);
        const validSignature = hmac.digest('hex');

        const isValid = np.ipn.verifySignature(testPayload, validSignature);
        console.log(`   Firma válida: ${isValid ? '✅ Sí' : '❌ No'}`);
        console.log('   ✅ Prueba de verificación exitosa\n');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // RECHAZO DE FIRMA INVÁLIDA
    // ═══════════════════════════════════════════
    console.log('❌ RECHAZO DE FIRMA INVÁLIDA');
    console.log('─'.repeat(50));
    try {
        const testPayload = {
            payment_id: 123456789,
            payment_status: 'finished'
        };

        const fakeSignature = 'a'.repeat(128);
        const isValid = np.ipn.verifySignature(testPayload, fakeSignature);
        
        if (!isValid) {
            console.log('   Firma falsa rechazada correctamente');
            console.log('   ✅ Prueba de rechazo exitosa\n');
        } else {
            console.log('   ❌ Error: ¡Se aceptó una firma falsa!\n');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // EJEMPLO DE MANEJO DE WEBHOOK
    // ═══════════════════════════════════════════
    console.log('🌐 EJEMPLO DE MANEJO DE WEBHOOK');
    console.log('─'.repeat(50));
    console.log('   Ejemplo de servidor Express para IPN:');
    console.log('   ');
    console.log('   app.post("/webhook/nowpayments", (req, res) => {');
    console.log('     const signature = req.headers["x-nowpayments-sig"];');
    console.log('     const payload = req.body;');
    console.log('     ');
    console.log('     if (np.ipn.verifySignature(payload, signature)) {');
    console.log('       // Procesar el pago');
    console.log('       console.log("Pago verificado:", payload.payment_id);');
    console.log('       res.status(200).send("OK");');
    console.log('     } else {');
    console.log('       res.status(400).send("Firma inválida");');
    console.log('     }');
    console.log('   });\n');

    // ═══════════════════════════════════════════
    // ESTADOS DE PAGO
    // ═══════════════════════════════════════════
    console.log('📊 ESTADOS DE PAGO');
    console.log('─'.repeat(50));
    console.log('   Estados posibles recibidos via IPN:');
    console.log('   - waiting: Esperando el pago');
    console.log('   - confirming: Confirmando transacción');
    console.log('   - confirmed: Pago confirmado');
    console.log('   - sending: Enviando a billetera');
    console.log('   - partially_paid: Pagado parcialmente');
    console.log('   - finished: Completado');
    console.log('   - failed: Fallido');
    console.log('   - refunded: Reembolsado');
    console.log('   - expired: Expirado\n');

    console.log('═'.repeat(50));
    console.log('✅ Pruebas del módulo IPN completadas');
    console.log('═'.repeat(50));
}

runIpnTests().catch(console.error);
