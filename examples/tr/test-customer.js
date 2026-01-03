/**
 * Customer (Sub-Partner) Modülü Test Dosyası
 * 
 * Bu dosya müşteri yönetimi işlemlerini test eder:
 * - Müşteri listesi
 * - Yeni müşteri oluşturma
 * - Müşteri detayları
 * - Müşteri bakiyesi
 * - Müşteri için deposit adresi
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
    console.log('║     CUSTOMER (SUB-PARTNER) TESTLERİ    ║');
    console.log('╚════════════════════════════════════════╝\n');

    let testCustomerId = null;

    // ─────────────────────────────────────────
    // TEST 1: Müşteri Listesi
    // ─────────────────────────────────────────
    console.log('📋 TEST 1: Müşteri Listesi');
    console.log('─'.repeat(40));
    try {
        const customers = await seyfo.customers.list();
        console.log(`✅ ${customers.customers.length} müşteri bulundu`);
        customers.customers.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.name} (ID: ${c.id})`);
        });
        
        // İlk müşteriyi test için sakla
        if (customers.customers.length > 0) {
            testCustomerId = customers.customers[0].id;
        }
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 2: Yeni Müşteri Oluşturma
    // ─────────────────────────────────────────
    console.log('\n➕ TEST 2: Yeni Müşteri Oluşturma');
    console.log('─'.repeat(40));
    try {
        const newName = `test_${Date.now()}`;
        const newCustomer = await seyfo.customers.create({ name: newName });
        console.log(`✅ Müşteri oluşturuldu`);
        console.log(`   ID: ${newCustomer.id}`);
        console.log(`   İsim: ${newCustomer.name}`);
        console.log(`   Tarih: ${newCustomer.createdAt}`);
        
        testCustomerId = newCustomer.id;
    } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
    }

    // ─────────────────────────────────────────
    // TEST 3: Müşteri Detayı
    // ─────────────────────────────────────────
    console.log('\n🔍 TEST 3: Müşteri Detayı');
    console.log('─'.repeat(40));
    if (testCustomerId) {
        try {
            const customer = await seyfo.customers.get(testCustomerId);
            console.log(`✅ Müşteri bilgisi alındı`);
            console.log(`   ID: ${customer.id}`);
            console.log(`   İsim: ${customer.name}`);
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    } else {
        console.log('⚠️  Test edilecek müşteri yok');
    }

    // ─────────────────────────────────────────
    // TEST 4: Müşteri Bakiyesi
    // ─────────────────────────────────────────
    console.log('\n💰 TEST 4: Müşteri Bakiyesi');
    console.log('─'.repeat(40));
    if (testCustomerId) {
        try {
            const balance = await seyfo.customers.getBalance(testCustomerId);
            console.log(`✅ Bakiye bilgisi alındı`);
            if (balance.balances && balance.balances.length > 0) {
                balance.balances.forEach(b => {
                    console.log(`   ${b.currency}: ${b.amount}`);
                });
            } else {
                console.log('   Bakiye: 0 (henüz yatırım yok)');
            }
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    } else {
        console.log('⚠️  Test edilecek müşteri yok');
    }

    // ─────────────────────────────────────────
    // TEST 5: Deposit Adresi Oluşturma
    // ─────────────────────────────────────────
    console.log('\n🏦 TEST 5: Deposit Adresi Oluşturma');
    console.log('─'.repeat(40));
    if (testCustomerId) {
        try {
            const deposit = await seyfo.customers.createDepositAddress(testCustomerId, {
                currency: 'btc',
                amount: 100 // USD cinsinden
            });
            console.log(`✅ BTC Deposit adresi oluşturuldu`);
            console.log(`   Adres: ${deposit.address}`);
            console.log(`   Miktar: ${deposit.payAmount} ${deposit.payCurrency}`);
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    } else {
        console.log('⚠️  Test edilecek müşteri yok');
    }

    // ─────────────────────────────────────────
    // TEST 6: Müşteri Ödemeleri
    // ─────────────────────────────────────────
    console.log('\n📜 TEST 6: Müşteri Ödemeleri');
    console.log('─'.repeat(40));
    if (testCustomerId) {
        try {
            const payments = await seyfo.customers.getPayments(testCustomerId);
            console.log(`✅ ${payments.payments?.length || 0} ödeme bulundu`);
        } catch (error) {
            console.log(`❌ Hata: ${error.message}`);
        }
    } else {
        console.log('⚠️  Test edilecek müşteri yok');
    }

    console.log('\n' + '═'.repeat(40));
    console.log('Customer testleri tamamlandı!');
    console.log('═'.repeat(40));
}

testCustomerModule().catch(console.error);
