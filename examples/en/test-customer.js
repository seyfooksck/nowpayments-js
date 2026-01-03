/**
 * Customer (Sub-Partner) Module Test File
 * 
 * This file tests customer management operations:
 * - Customer list
 * - Create new customer
 * - Customer details
 * - Customer balance
 * - Deposit address for customer
 */

require('dotenv').config();
const { NowPayments } = require('../../src');

const seyfo = new NowPayments({
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
    email: process.env.NOWPAYMENTS_EMAIL,
    password: process.env.NOWPAYMENTS_PASSWORD,
    sandbox: process.env.SANDBOX_MODE === 'true'
});

async function testCustomerModule() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     CUSTOMER (SUB-PARTNER) TESTS       ║');
    console.log('╚════════════════════════════════════════╝\n');

    let testCustomerId = null;

    // ─────────────────────────────────────────
    // TEST 1: Customer List
    // ─────────────────────────────────────────
    console.log('📋 TEST 1: Customer List');
    console.log('─'.repeat(40));
    try {
        const customers = await seyfo.customers.list();
        console.log(`✅ ${customers.customers.length} customers found`);
        customers.customers.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.name} (ID: ${c.id})`);
        });
        
        // Save first customer for testing
        if (customers.customers.length > 0) {
            testCustomerId = customers.customers[0].id;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Create New Customer
    // ─────────────────────────────────────────
    console.log('\n➕ TEST 2: Create New Customer');
    console.log('─'.repeat(40));
    try {
        const newName = `test_${Date.now()}`;
        const newCustomer = await seyfo.customers.create({ name: newName });
        console.log(`✅ Customer created`);
        console.log(`   ID: ${newCustomer.id}`);
        console.log(`   Name: ${newCustomer.name}`);
        console.log(`   Date: ${newCustomer.createdAt}`);
        
        testCustomerId = newCustomer.id;
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Customer Details
    // ─────────────────────────────────────────
    console.log('\n🔍 TEST 3: Customer Details');
    console.log('─'.repeat(40));
    if (testCustomerId) {
        try {
            const customer = await seyfo.customers.get(testCustomerId);
            console.log(`✅ Customer info retrieved`);
            console.log(`   ID: ${customer.id}`);
            console.log(`   Name: ${customer.name}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    } else {
        console.log('⚠️  No customer to test');
    }

    // ─────────────────────────────────────────
    // TEST 4: Customer Balance
    // ─────────────────────────────────────────
    console.log('\n💰 TEST 4: Customer Balance');
    console.log('─'.repeat(40));
    if (testCustomerId) {
        try {
            const balance = await seyfo.customers.getBalance(testCustomerId);
            console.log(`✅ Balance info retrieved`);
            if (balance.balances && balance.balances.length > 0) {
                balance.balances.forEach(b => {
                    console.log(`   ${b.currency}: ${b.amount}`);
                });
            } else {
                console.log('   Balance: 0 (no deposits yet)');
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    } else {
        console.log('⚠️  No customer to test');
    }

    // ─────────────────────────────────────────
    // TEST 5: Deposit Address for Customer
    // ─────────────────────────────────────────
    console.log('\n💳 TEST 5: Deposit Address for Customer');
    console.log('─'.repeat(40));
    if (testCustomerId) {
        try {
            const deposit = await seyfo.customers.createDepositAddress(testCustomerId, {
                currency: 'btc',
                amount: 0.001
            });
            console.log(`✅ Deposit address created`);
            console.log(`   Address: ${deposit.depositAddress}`);
            console.log(`   Amount: ${deposit.amount} ${deposit.currency}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    } else {
        console.log('⚠️  No customer to test');
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Customer tests completed!');
}

testCustomerModule().catch(console.error);
