# NOWPayments Integration Module

Her kullanıcıya ayrı cüzdan adresi ve ödeme sistemi sağlayan Node.js modülü.

## 🚀 Özellikler

- ✅ **Deposit (Yatırım)**: Her kullanıcı için benzersiz kripto cüzdan adresi
- ✅ **Payout (Çekim)**: Kullanıcılara kripto ödemesi gönderme
- ✅ **Custody**: Bakiye yönetimi ve kripto dönüşümü
- ✅ **IPN Handler**: Webhook callback doğrulama ve işleme
- ✅ **Currency Manager**: Para birimi bilgileri ve dönüşüm tahmini
- ✅ **Sandbox Desteği**: Test ortamında geliştirme

## 📦 Kurulum

```bash
npm install
```

## ⚙️ Yapılandırma

```javascript
const NowPayments = require('./src');

const np = new NowPayments({
    apiKey: 'YOUR_API_KEY',           // Zorunlu
    ipnSecret: 'YOUR_IPN_SECRET',     // Zorunlu (webhook için)
    email: 'your@email.com',          // Opsiyonel (payout için)
    password: 'your_password',        // Opsiyonel (payout için)
    sandbox: true,                    // Test modu
    ipnCallbackUrl: 'https://yourdomain.com/webhooks/nowpayments'
});
```

## 📝 Kullanım

### Deposit (Yatırım)

```javascript
// Kullanıcı için BTC deposit adresi oluştur
const deposit = await np.createUserDepositAddress({
    userId: 'user_12345',
    payCurrency: 'btc'
});

console.log('Deposit Adresi:', deposit.depositAddress);
console.log('QR Kod:', deposit.qrCode);
```

### Payout (Çekim)

```javascript
// Kullanıcıya ödeme gönder
const payout = await np.createUserPayout({
    userId: 'user_12345',
    address: 'bc1q...',
    amount: 0.001,
    currency: 'btc'
});

console.log('Payout ID:', payout.payoutId);
console.log('Durum:', payout.status);
```

### IPN (Webhook) Handler

```javascript
const express = require('express');
const app = express();

app.post('/webhooks/nowpayments', 
    np.ipn.middleware(async (payment, req, res) => {
        console.log('Ödeme durumu:', payment.status);
        console.log('Kullanıcı ID:', payment.userId);
        
        if (payment.isCompleted) {
            // Bakiyeyi güncelle
            await updateUserBalance(payment.userId, payment.outcomeAmount);
        }
    })
);
```

### Custody (Bakiye Yönetimi)

```javascript
// Bakiyeleri görüntüle
const balances = await np.custody.getBalances();

// Kripto dönüşümü
const conversion = await np.custody.convert({
    fromCurrency: 'btc',
    toCurrency: 'usdt',
    amount: 0.01
});
```

## 📚 API Referansı

### NowPayments

| Metod | Açıklama |
|-------|----------|
| `createUserDepositAddress(options)` | Kullanıcı için deposit adresi oluşturur |
| `createUserPayout(options)` | Kullanıcıya payout gönderir |
| `getPaymentStatus(paymentId)` | Ödeme durumunu sorgular |
| `verifyIPNCallback(payload, signature)` | IPN callback'ini doğrular |
| `getStatus()` | API durumunu kontrol eder |

### Deposit Manager

| Metod | Açıklama |
|-------|----------|
| `createDepositAddress(options)` | Deposit adresi oluşturur |
| `createFixedDeposit(options)` | Sabit tutarlı deposit oluşturur |
| `getUserPayments(userId)` | Kullanıcının ödemelerini listeler |
| `checkPaymentStatus(paymentId)` | Ödeme durumunu kontrol eder |
| `getMinimumAmount(currency)` | Minimum deposit miktarını alır |

### Payout Manager

| Metod | Açıklama |
|-------|----------|
| `createPayout(options)` | Payout oluşturur |
| `createBatchPayout(payouts)` | Toplu payout gönderir |
| `getPayoutStatus(payoutId)` | Payout durumunu sorgular |
| `checkBalance(currency, amount)` | Bakiye yeterliliğini kontrol eder |

### Custody Manager

| Metod | Açıklama |
|-------|----------|
| `getBalances()` | Tüm bakiyeleri getirir |
| `getBalance(currency)` | Belirli bir bakiyeyi getirir |
| `transfer(options)` | Dış cüzdana transfer yapar |
| `convert(options)` | Kripto dönüşümü yapar |
| `getBalanceSummary()` | Bakiye özeti (USD ile) |

### IPN Handler

| Metod | Açıklama |
|-------|----------|
| `verifySignature(payload, signature)` | İmza doğrular |
| `parseCallback(body, signature)` | Callback parse eder |
| `middleware(handler)` | Express middleware oluşturur |

## 🔄 Ödeme Durumları

| Durum | Açıklama |
|-------|----------|
| `waiting` | Ödeme bekleniyor |
| `confirming` | Blockchain'de onaylanıyor |
| `confirmed` | Onaylandı |
| `sending` | Gönderiliyor |
| `partially_paid` | Kısmi ödeme yapıldı |
| `finished` | Tamamlandı |
| `failed` | Başarısız |
| `refunded` | İade edildi |
| `expired` | Süresi doldu |

## 💡 Ödeme Akışı

```
1. Kullanıcı deposit isteğinde bulunur
2. Sistem benzersiz cüzdan adresi oluşturur
3. Kullanıcı kripto gönderir
4. NOWPayments IPN callback gönderir
5. Sistem kullanıcı bakiyesini günceller
6. Kullanıcı oynar
7. Kullanıcı çekim isteğinde bulunur
8. Sistem payout oluşturur
9. Kullanıcı kripto alır
```

## 🔒 Güvenlik

- IPN callback'leri mutlaka `x-nowpayments-sig` header'ı ile doğrulayın
- API anahtarlarını environment variable'larda saklayın
- Payout işlemleri için ek güvenlik kontrolleri ekleyin
- Rate limiting uygulayın

## 📁 Proje Yapısı

```
nowpayments/
├── src/
│   ├── index.js          # Ana modül
│   ├── client.js         # API client
│   └── modules/
│       ├── deposit.js    # Deposit yönetimi
│       ├── payout.js     # Payout yönetimi
│       ├── custody.js    # Bakiye yönetimi
│       ├── ipn.js        # Webhook handler
│       └── currency.js   # Para birimi yönetimi
├── examples/
│   ├── basic-usage.js    # Temel kullanım
│   └── express-server.js # Express.js örneği
├── package.json
└── README.md
```

## 🌐 Desteklenen Para Birimleri

Popüler kripto paralar:
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

Ve 200+ diğer kripto para birimi...

## 📞 Destek

- NOWPayments Dokümantasyon: https://documenter.getpostman.com/view/7907941/S1a32n38
- NOWPayments Guide: https://nowpayments.io/doc

## 📄 Lisans

MIT
