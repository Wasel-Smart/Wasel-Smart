import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Search } from 'lucide-react';
import { currencies, getCurrency, getAllCurrencies, formatCurrency, Currency } from '../utils/currency';

interface CurrencySelectorProps {
  value?: string;
  onChange?: (currencyCode: string) => void;
  className?: string;
  showName?: boolean;
}

export function CurrencySelector({
  value = 'USD',
  onChange,
  className,
  showName = false,
}: CurrencySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currencies] = useState(() => getAllCurrencies());

  const selectedCurrency = getCurrency(value);

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (currency: Currency) => {
    onChange?.(currency.code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <span className="mr-1">{selectedCurrency.symbol}</span>
          <span>{selectedCurrency.code}</span>
          {showName && (
            <span className="ml-1 text-gray-500 hidden sm:inline">- {selectedCurrency.name}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search currency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredCurrencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => handleSelect(currency)}
              className={`flex items-center justify-between py-2 ${
                value === currency.code ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg w-8">{currency.symbol}</span>
                <div>
                  <p className="font-medium">{currency.code}</p>
                  <p className="text-xs text-gray-500">{currency.name}</p>
                </div>
              </div>
              {value === currency.code && (
                <span className="text-xs text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Currency display component for showing formatted prices
interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  baseCurrency?: string;
  showOriginal?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  baseCurrency = 'USD',
  showOriginal = false,
  className,
}: CurrencyDisplayProps) {
  const [targetCurrency, setTargetCurrency] = useState(currency);

  useEffect(() => {
    setTargetCurrency(currency);
  }, [currency]);

  const formattedAmount = formatCurrency(amount, targetCurrency);

  if (!showOriginal) {
    return <span className={className}>{formattedAmount}</span>;
  }

  return (
    <span className={className}>
      <span className="line-through text-gray-400 mr-2">
        {formatCurrency(amount, baseCurrency)}
      </span>
      {formattedAmount}
    </span>
  );
}

// Currency converter widget
interface CurrencyConverterProps {
  amount: number;
  fromCurrency: string;
  toCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

export function CurrencyConverter({
  amount,
  fromCurrency,
  toCurrency = 'USD',
  onCurrencyChange,
}: CurrencyConverterProps) {
  const [targetCurrency, setTargetCurrency] = useState(toCurrency);

  const convertedAmount = (() => {
    if (fromCurrency === targetCurrency) return amount;
    // Simple conversion (in production, use API)
    const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 150.5,
    };
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[targetCurrency] || 1;
    return (amount / fromRate) * toRate;
  })();

  const formattedFrom = formatCurrency(amount, fromCurrency);
  const formattedTo = formatCurrency(convertedAmount, targetCurrency);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Converted Amount</span>
        <CurrencySelector
          value={targetCurrency}
          onChange={(code) => {
            setTargetCurrency(code);
            onCurrencyChange?.(code);
          }}
        />
      </div>
      <div className="text-center py-2">
        <p className="text-2xl font-bold">{formattedTo}</p>
        <p className="text-sm text-gray-500">
          ≈ {formattedFrom}
        </p>
      </div>
    </div>
  );
}
