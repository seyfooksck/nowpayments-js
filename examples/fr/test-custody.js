/**
 * Tests du Module Garde
 * 
 * Ce fichier teste les opérations de garde:
 * - Solde de garde
 * - Estimation de conversion
 * - Conversion de devises
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
    console.log('║        TESTS DU MODULE GARDE                     ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════
    // SOLDE DE GARDE
    // ═══════════════════════════════════════════
    console.log('💰 SOLDE DE GARDE');
    console.log('─'.repeat(50));
    try {
        const balance = await np.custody.getBalance();
        console.log('   Soldes disponibles:');
        if (balance && typeof balance === 'object') {
            const currencies = Object.keys(balance);
            if (currencies.length > 0) {
                currencies.forEach(currency => {
                    console.log(`   - ${currency}: ${balance[currency]}`);
                });
            } else {
                console.log('   - Aucun solde disponible');
            }
        }
        console.log('   ✅ Test de solde réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // ESTIMATION DE CONVERSION
    // ═══════════════════════════════════════════
    console.log('💱 ESTIMATION DE CONVERSION');
    console.log('─'.repeat(50));
    try {
        const estimate = await np.custody.getConversionEstimate({
            fromCurrency: 'btc',
            toCurrency: 'usdttrc20',
            fromAmount: 0.001
        });
        console.log(`   De: 0.001 BTC`);
        console.log(`   Vers: USDT (TRC20)`);
        console.log(`   Montant estimé: ${estimate.to_amount || estimate.estimated_amount} USDT`);
        console.log('   ✅ Test d\'estimation réussi\n');
    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════
    // INFORMATIONS SUR LA CONVERSION
    // ═══════════════════════════════════════════
    console.log('📝 INFORMATIONS SUR LA CONVERSION');
    console.log('─'.repeat(50));
    console.log('   ⚠️ Note: La conversion réelle nécessite:');
    console.log('   - Solde suffisant dans la devise source');
    console.log('   - Paires de conversion compatibles');
    console.log('   - Vérification du compte\n');

    // ═══════════════════════════════════════════
    // EXEMPLE DE CONVERSION
    // ═══════════════════════════════════════════
    console.log('🔄 EXEMPLE DE CONVERSION');
    console.log('─'.repeat(50));
    console.log('   Exemple de demande de conversion:');
    console.log('   {');
    console.log('     fromCurrency: "btc",');
    console.log('     toCurrency: "usdttrc20",');
    console.log('     fromAmount: 0.001');
    console.log('   }');
    console.log('   ');
    console.log('   Utilisation:');
    console.log('   const result = await np.custody.convert({');
    console.log('     fromCurrency: "btc",');
    console.log('     toCurrency: "usdttrc20",');
    console.log('     fromAmount: 0.001');
    console.log('   });\n');

    console.log('═'.repeat(50));
    console.log('✅ Tests du module garde terminés');
    console.log('═'.repeat(50));
}

runCustodyTests().catch(console.error);
