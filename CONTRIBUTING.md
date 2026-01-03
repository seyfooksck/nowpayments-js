# Contributing to nowpayments-js

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs
- Use GitHub Issues
- Include Node.js version
- Provide minimal reproducible example

### Suggesting Features
- Open a GitHub Issue with `[Feature]` prefix
- Describe the use case

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Setup

```bash
# Clone the repo
git clone https://github.com/seyfooksck/nowpayments.git
cd nowpayments

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
```

## Code Style
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

## Testing
```bash
# Run all tests
npm test

# Run specific module test
npm run test:deposit
```

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
