# NOWPayments Integration Module

A Node.js module that provides unique wallet addresses and payment system for each user.

[![npm version](https://badge.fury.io/js/nowpayments-js.svg)](https://www.npmjs.com/package/nowpayments-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- ✅ **Deposit**: Unique crypto wallet address for each user
- ✅ **Payout**: Send crypto payments to users
- ✅ **Custody**: Balance management and crypto conversion
- ✅ **IPN Handler**: Webhook callback verification and processing
- ✅ **Currency Manager**: Currency information and conversion estimates
- ✅ **Customer Management**: Create and manage sub-partners (customers)
- ✅ **Sandbox Support**: Development in test environment

## 📦 Installation

```bash
npm install nowpayments-js
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here
NOWPAYMENTS_EMAIL=your_email@example.com
NOWPAYMENTS_PASSWORD=your_password_here
SANDBOX_MODE=false
```

### Initialization

```javascript
const { NowPayments } = require('nowpayments-js');

const np = new NowPayments({
    apiKey: process.env.NOWPAYMENTS_API_KEY,           // Required
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,     // Required (for webhooks)
    email: process.env.NOWPAYMENTS_EMAIL,              // Optional (for payouts)
    password: process.env.NOWPAYMENTS_PASSWORD,        // Optional (for payouts)
    sandbox: false,                                     // Test mode
    ipnCallbackUrl: 'https://yourdomain.com/webhooks/nowpayments'
});
```

## 📝 Usage

### Customer Management (Sub-Partners)

```javascript
// Create a new customer
const customer = await np.customers.create({
    name: 'user_12345'  // Max 30 chars, cannot be email
});
console.log('Customer ID:', customer.id);

// List all customers
const customers = await np.customers.list();
customers.customers.forEach(c => {
    console.log(`${c.name}: ${c.id}`);
});

// Create deposit address for customer
const deposit = await np.customers.createDepositAddress(customer.id, {
    currency: 'btc',
    amount: 100  // USD amount
});
console.log('Deposit Address:', deposit.address);
```

### Deposit

```javascript
// Create BTC deposit address for user
const deposit = await np.deposit.createDepositAddress({
    userId: 'user_12345',
    payCurrency: 'btc',
    priceAmount: 100,        // Optional
    priceCurrency: 'usd'     // Optional
});

console.log('Deposit Address:', deposit.depositAddress);
console.log('QR Code:', deposit.qrCode);
console.log('Amount:', deposit.payAmount, deposit.payCurrency);
```

### Payout

```javascript
// Send payment to user
const payout = await np.payout.createPayout({
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    currency: 'btc',
    amount: 0.001,
    ipnCallbackUrl: 'https://yourdomain.com/webhooks/payout'
});

console.log('Payout ID:', payout.id);
console.log('Status:', payout.status);
```

### Batch Payout

```javascript
// Send multiple payouts at once
const batch = await np.payout.createBatchPayout([
    { address: 'address1...', currency: 'usdttrc20', amount: 50 },
    { address: 'address2...', currency: 'usdttrc20', amount: 100 },
    { address: 'address3...', currency: 'usdttrc20', amount: 75 }
], 'https://yourdomain.com/webhooks/batch');

console.log('Batch ID:', batch.id);
```

### IPN (Webhook) Handler

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhooks/nowpayments', 
    np.ipn.middleware(async (payment, req, res) => {
        console.log('Payment Status:', payment.status);
        console.log('User ID:', payment.userId);
        
        if (payment.isCompleted) {
            // Update user balance
            await updateUserBalance(payment.userId, payment.outcomeAmount);
        }
        
        if (payment.isPartiallyPaid) {
            // Handle partial payment
            console.log('Partial payment received:', payment.actuallyPaid);
        }
    })
);

app.listen(3000);
```

### Manual IPN Verification

```javascript
app.post('/webhooks/nowpayments', (req, res) => {
    const signature = req.headers['x-nowpayments-sig'];
    
    try {
        const payment = np.ipn.parseCallback(req.body, signature);
        console.log('Valid payment:', payment);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Invalid signature:', error.message);
        res.status(400).send('Invalid');
    }
});
```

### Custody (Balance Management)

```javascript
// Get all balances
const balances = await np.custody.getBalance();
console.log('Balances:', balances);

// Crypto conversion estimate
const estimate = await np.custody.getConversionEstimate({
    fromCurrency: 'btc',
    toCurrency: 'usdttrc20',
    fromAmount: 0.01
});
console.log('Estimated:', estimate.to_amount, 'USDT');

// Transfer to external wallet
const transfer = await np.custody.createTransfer({
    currency: 'usdttrc20',
    amount: 100,
    address: 'TXYZabc123...'
});
```

### Currency Information

```javascript
// Get available currencies
const currencies = await np.currency.getCurrencies();
console.log('Available:', currencies.length, 'currencies');

// Get minimum amount
const min = await np.currency.getMinimumAmount('btc', 'usd');
console.log('Minimum BTC:', min.minAmount);

// Get price estimate
const estimate = await np.currency.getEstimate(100, 'usd', 'btc');
console.log('100 USD =', estimate.estimatedAmount, 'BTC');

// Check if currency supported
const isSupported = await np.currency.isCurrencySupported('btc');
console.log('BTC supported:', isSupported);
```

## 📚 API Reference

### NowPayments

| Method | Description |
|--------|-------------|
| `getStatus()` | Check API status |
| `customers` | Customer (sub-partner) manager |
| `deposit` | Deposit manager |
| `payout` | Payout manager |
| `custody` | Custody manager |
| `currency` | Currency manager |
| `ipn` | IPN handler |

### Customer Manager

| Method | Description |
|--------|-------------|
| `create(options)` | Create new customer |
| `list(options)` | List all customers |
| `get(customerId)` | Get customer details |
| `getBalance(customerId)` | Get customer balance |
| `getPayments(customerId)` | List customer payments |
| `createDepositAddress(customerId, options)` | Create deposit address |

### Deposit Manager

| Method | Description |
|--------|-------------|
| `createDepositAddress(options)` | Create deposit address |
| `createFixedDeposit(options)` | Create fixed amount deposit |
| `getUserPayments(userId)` | List user payments |
| `checkPaymentStatus(paymentId)` | Check payment status |
| `getMinimumAmount(currency)` | Get minimum deposit amount |
| `getEstimate(amount, from, to)` | Get conversion estimate |

### Payout Manager

| Method | Description |
|--------|-------------|
| `createPayout(options)` | Create single payout |
| `createBatchPayout(payouts, callbackUrl)` | Create batch payout |
| `getPayoutStatus(payoutId)` | Check payout status |
| `getPayouts(params)` | List all payouts |

### Custody Manager

| Method | Description |
|--------|-------------|
| `getBalance()` | Get all balances |
| `createTransfer(options)` | Transfer to external wallet |
| `createConversion(options)` | Convert between currencies |
| `getConversionEstimate(options)` | Get conversion estimate |

### IPN Handler

| Method | Description |
|--------|-------------|
| `verifySignature(payload, signature)` | Verify callback signature |
| `parseCallback(body, signature)` | Parse and verify callback |
| `middleware(handler)` | Create Express middleware |

### Currency Manager

| Method | Description |
|--------|-------------|
| `getCurrencies()` | List available currencies |
| `getFullCurrencies()` | Get detailed currency info |
| `getMerchantCurrencies()` | Get merchant's accepted currencies |
| `getMinimumAmount(from, to)` | Get minimum payment amount |
| `getEstimate(amount, from, to)` | Get price estimate |
| `isCurrencySupported(currency)` | Check currency support |
| `getCurrencyInfo(currency)` | Get currency details |

## 🔄 Payment Statuses

| Status | Description |
|--------|-------------|
| `waiting` | Waiting for payment |
| `confirming` | Confirming on blockchain |
| `confirmed` | Confirmed |
| `sending` | Sending to merchant |
| `partially_paid` | Partial payment received |
| `finished` | Completed |
| `failed` | Failed |
| `refunded` | Refunded |
| `expired` | Expired |

## 💡 Payment Flow

```
1. User requests deposit
2. System creates unique wallet address
3. User sends crypto
4. NOWPayments sends IPN callback
5. System updates user balance
6. User plays
7. User requests withdrawal
8. System creates payout
9. User receives crypto
```

## 🔒 Security

- Always verify IPN callbacks with `x-nowpayments-sig` header
- Store API keys in environment variables
- Add extra security checks for payout operations
- Implement rate limiting
- Use HTTPS for all endpoints
- Never log sensitive data

## 🌐 Supported Currencies

Popular cryptocurrencies:
- BTC (Bitcoin)
- ETH (Ethereum)
- LTC (Litecoin)
- DOGE (Dogecoin)
- USDT (Tether - ERC20, TRC20, BEP20)
- USDC (USD Coin)
- TRX (TRON)
- BNB (Binance Coin)
- XRP (Ripple)
- SOL (Solana)

And 200+ other cryptocurrencies...

## 📁 Project Structure

```
nowpayments-js/
├── src/
│   ├── index.js          # Main module
│   ├── client.js         # API client
│   └── modules/
│       ├── deposit.js    # Deposit management
│       ├── payout.js     # Payout management
│       ├── custody.js    # Balance management
│       ├── ipn.js        # Webhook handler
│       ├── currency.js   # Currency management
│       └── customer.js   # Customer management
├── examples/
│   ├── test-all.js       # Full test suite
│   ├── test-customer.js  # Customer tests
│   ├── test-deposit.js   # Deposit tests
│   ├── test-payout.js    # Payout tests
│   ├── test-custody.js   # Custody tests
│   ├── test-currency.js  # Currency tests
│   └── test-ipn.js       # IPN tests
├── .env.example
├── package.json
└── README.md
```

## 🧪 Testing

```bash
# Run all tests
node examples/test-all.js

# Run specific module tests
node examples/test-customer.js
node examples/test-deposit.js
node examples/test-payout.js
node examples/test-currency.js
node examples/test-ipn.js
```

## 📞 Support

- NOWPayments Documentation: https://documenter.getpostman.com/view/7907941/2s93JusNJt
- NOWPayments Guide: https://nowpayments.io/doc
- Issues: https://github.com/seyfooksck/nowpayments/issues

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
