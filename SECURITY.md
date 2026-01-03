# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to the repository owner
3. Include detailed description of the vulnerability
4. Allow reasonable time for response before public disclosure

## Security Best Practices

When using this module:

- **Never commit API keys** to version control
- Use environment variables for sensitive data
- Always verify IPN signatures before processing payments
- Use HTTPS for all webhook endpoints
- Regularly rotate your API keys
- Monitor your NOWPayments dashboard for suspicious activity

## IPN Security

Always verify webhook signatures:

```javascript
app.post('/webhook', (req, res) => {
    const signature = req.headers['x-nowpayments-sig'];
    
    if (!np.ipn.verifySignature(req.body, signature)) {
        return res.status(400).send('Invalid signature');
    }
    
    // Process payment...
});
```
