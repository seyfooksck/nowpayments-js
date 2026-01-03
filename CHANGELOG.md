# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-03

### Added
- Initial release
- Customer (Sub-Partner) management
  - Create new customers via API
  - List all customers
  - Get customer details and balance
  - Create deposit addresses for customers
- Deposit management
  - Create unique wallet addresses per user
  - Fixed and dynamic deposit amounts
  - QR code generation
  - Payment status tracking
- Payout management
  - Single payouts
  - Batch payouts
  - Payout status tracking
- Custody management
  - Balance queries
  - Crypto conversions
  - External transfers
- IPN (Webhook) handling
  - HMAC-SHA512 signature verification
  - Express middleware
  - Payload parsing and validation
- Currency management
  - Available currencies list
  - Minimum amounts
  - Price estimates
  - Currency details

### Security
- Secure signature comparison (timing-safe)
- Environment variable configuration
- IPN callback verification

## [Unreleased]

### Planned
- TypeScript definitions
- WebSocket support for real-time updates
- Additional payment providers
