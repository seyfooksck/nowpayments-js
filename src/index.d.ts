/**
 * NOWPayments Integration - TypeScript Definitions
 */

declare module 'nowpayments-js' {
    export interface NowPaymentsConfig {
        apiKey: string;
        ipnSecret: string;
        email?: string;
        password?: string;
        sandbox?: boolean;
        ipnCallbackUrl?: string;
    }

    export interface DepositOptions {
        userId: string;
        payCurrency: string;
        priceAmount?: number;
        priceCurrency?: string;
        ipnCallbackUrl?: string;
        orderId?: string;
        orderDescription?: string;
        isFixedRate?: boolean;
        feePaidByUser?: boolean;
    }

    export interface DepositResult {
        success: boolean;
        userId: string;
        paymentId: string;
        depositAddress: string;
        payCurrency: string;
        payAmount: number;
        priceAmount: number;
        priceCurrency: string;
        status: string;
        createdAt: string;
        expiresAt: string;
        qrCode: string;
        raw: any;
    }

    export interface PayoutOptions {
        userId: string;
        address: string;
        amount: number;
        currency: string;
        ipnCallbackUrl?: string;
        extraId?: string;
        uniqueExternalId?: string;
    }

    export interface PayoutResult {
        success: boolean;
        userId: string;
        payoutId: string;
        status: string;
        address: string;
        amount: number;
        currency: string;
        hash: string;
        createdAt: string;
        raw: any;
    }

    export interface PaymentStatus {
        paymentId: string;
        status: string;
        actuallyPaid: number;
        payAmount: number;
        payCurrency: string;
        outcomeAmount: number;
        outcomeCurrency: string;
        depositAddress: string;
        createdAt: string;
        updatedAt: string;
        isCompleted: boolean;
        isPartiallyPaid: boolean;
        isFailed: boolean;
        raw: any;
    }

    export interface IPNPayload {
        paymentId: string;
        status: string;
        depositAddress: string;
        payCurrency: string;
        payAmount: number;
        actuallyPaid: number;
        priceAmount: number;
        priceCurrency: string;
        outcomeAmount: number;
        outcomeCurrency: string;
        orderId: string;
        orderDescription: string;
        purchaseId: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
        isCompleted: boolean;
        isPartiallyPaid: boolean;
        isFailed: boolean;
        isPending: boolean;
        raw: any;
    }

    export interface Balance {
        currency: string;
        amount: number;
        pendingAmount: number;
    }

    export interface ConversionOptions {
        fromCurrency: string;
        toCurrency: string;
        amount: number;
    }

    export interface ConversionResult {
        success: boolean;
        conversionId: string;
        status: string;
        fromCurrency: string;
        toCurrency: string;
        amountFrom: number;
        amountTo: number;
        rate: number;
        raw: any;
    }

    export interface CurrencyInfo {
        code: string;
        name: string;
        network: string;
        isStableCoin: boolean;
        logoUrl: string;
        minConfirmations: number;
    }

    export class DepositManager {
        createDepositAddress(options: DepositOptions): Promise<DepositResult>;
        createFixedDeposit(options: DepositOptions): Promise<DepositResult>;
        getUserPayments(userId: string, filters?: any): Promise<any[]>;
        checkPaymentStatus(paymentId: string | number): Promise<PaymentStatus>;
        getMinimumAmount(currency: string, toCurrency?: string): Promise<any>;
        getEstimate(amount: number, fromCurrency: string, toCurrency: string): Promise<any>;
    }

    export class PayoutManager {
        createPayout(options: PayoutOptions): Promise<PayoutResult>;
        createBatchPayout(payouts: PayoutOptions[], ipnCallbackUrl?: string): Promise<any>;
        getPayoutStatus(payoutId: string | number): Promise<any>;
        getPayouts(filters?: any): Promise<any>;
        getUserPayouts(userId: string, filters?: any): Promise<any[]>;
        checkBalance(currency: string, amount: number): Promise<any>;
    }

    export class CustodyManager {
        getBalances(): Promise<{ balances: Balance[]; raw: any }>;
        getBalance(currency: string): Promise<Balance & { found: boolean }>;
        transfer(options: { address: string; amount: number; currency: string; extraId?: string }): Promise<any>;
        convert(options: ConversionOptions): Promise<ConversionResult>;
        getConversionEstimate(options: ConversionOptions): Promise<any>;
        consolidateBalances(targetCurrency?: string, minAmount?: number): Promise<any[]>;
        getBalanceSummary(): Promise<any>;
    }

    export class IPNHandler {
        verifySignature(payload: any, signature: string): boolean;
        parseCallback(body: any | string, signature: string): IPNPayload;
        middleware(handler: (payment: IPNPayload, req: any, res: any) => Promise<void>): any;
        
        static isPaymentCompleted(status: string): boolean;
        static isPaymentPending(status: string): boolean;
        static isPaymentFailed(status: string): boolean;
        static isPaymentPartial(status: string): boolean;
        
        static PAYMENT_STATUS: {
            WAITING: string;
            CONFIRMING: string;
            CONFIRMED: string;
            SENDING: string;
            PARTIALLY_PAID: string;
            FINISHED: string;
            FAILED: string;
            REFUNDED: string;
            EXPIRED: string;
        };
    }

    export class CurrencyManager {
        getCurrencies(forceRefresh?: boolean): Promise<string[]>;
        getFullCurrencies(): Promise<any[]>;
        getMerchantCurrencies(fixedRate?: boolean): Promise<string[]>;
        isCurrencySupported(currency: string): Promise<boolean>;
        getMinimumAmount(payCurrency: string, receiveCurrency?: string): Promise<any>;
        getAllMinimumAmounts(receiveCurrency?: string): Promise<any[]>;
        getEstimate(amount: number, fromCurrency: string, toCurrency: string): Promise<any>;
        getCurrencyInfo(currency: string): Promise<CurrencyInfo | null>;
        getPopularCurrencies(): Array<{ code: string; name: string; category: string }>;
        getCurrenciesRequiringExtraId(): Record<string, { name: string; description: string }>;
        requiresExtraId(currency: string): { name: string; description: string } | null;
    }

    export default class NowPayments {
        constructor(config: NowPaymentsConfig);
        
        deposit: DepositManager;
        payout: PayoutManager;
        custody: CustodyManager;
        ipn: IPNHandler;
        currency: CurrencyManager;
        
        getStatus(): Promise<any>;
        createUserDepositAddress(options: DepositOptions): Promise<DepositResult>;
        createUserPayout(options: PayoutOptions): Promise<PayoutResult>;
        getPaymentStatus(paymentId: string | number): Promise<any>;
        verifyIPNCallback(payload: any, signature: string): boolean;
        
        static PAYMENT_STATUS: {
            WAITING: string;
            CONFIRMING: string;
            CONFIRMED: string;
            SENDING: string;
            PARTIALLY_PAID: string;
            FINISHED: string;
            FAILED: string;
            REFUNDED: string;
            EXPIRED: string;
        };
        
        static PAYOUT_STATUS: {
            WAITING: string;
            PENDING: string;
            PROCESSING: string;
            FINISHED: string;
            FAILED: string;
            REJECTED: string;
        };
    }

    export { NowPayments };
}
