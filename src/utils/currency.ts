// Currency data and utilities for multi-currency support

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const currencies: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimals: 2 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR', decimals: 0 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', decimals: 2 },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimals: 2 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH', decimals: 2 },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', locale: 'ar-SA', decimals: 2 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE', decimals: 2 },
  JOD: { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', locale: 'ar-JO', decimals: 3 },
  EGP: { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound', locale: 'ar-EG', decimals: 2 },
};

// Exchange rates (base: USD) - In production, fetch from API
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.5,
  CNY: 7.24,
  INR: 83.12,
  KRW: 1330,
  BRL: 4.97,
  MXN: 17.15,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  SAR: 3.75,
  AED: 3.67,
  JOD: 0.71,
  EGP: 30.9,
};

// Convert amount from one currency to another
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

// Format currency amount
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale?: string
): string {
  const currency = currencies[currencyCode] || currencies.USD;
  const formatLocale = locale || currency.locale;

  try {
    return new Intl.NumberFormat(formatLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount);
  } catch {
    // Fallback formatting
    return `${currency.symbol}${amount.toFixed(currency.decimals)}`;
  }
}

// Get currency by code
export function getCurrency(code: string): Currency {
  return currencies[code] || currencies.USD;
}

// Get all available currencies
export function getAllCurrencies(): Currency[] {
  return Object.values(currencies);
}

// Convert price display in different currencies
export function displayPriceInCurrency(
  basePrice: number,
  baseCurrency: string,
  targetCurrency: string
): string {
  const convertedAmount = convertCurrency(basePrice, baseCurrency, targetCurrency);
  return formatCurrency(convertedAmount, targetCurrency);
}

// Parse formatted currency string to number
export function parseCurrencyString(
  formattedString: string,
  currencyCode: string
): number {
  const currency = currencies[currencyCode] || currencies.USD;
  // Remove currency symbol and spaces
  const cleanedString = formattedString
    .replace(currency.symbol, '')
    .replace(/\s/g, '')
    .replace(/,/g, '');

  const amount = parseFloat(cleanedString);
  return isNaN(amount) ? 0 : amount;
}

// Currency conversion hook helper
export function useCurrencyConversion(fromCurrency: string) {
  return {
    convert: (amount: number, toCurrency: string) =>
      convertCurrency(amount, fromCurrency, toCurrency),
    format: (amount: number, currencyCode: string) =>
      formatCurrency(amount, currencyCode),
    display: (amount: number, targetCurrency: string) =>
      displayPriceInCurrency(amount, fromCurrency, targetCurrency),
  };
}
