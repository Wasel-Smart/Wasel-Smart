import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Send,
    ArrowRightLeft,
    Globe,
    Clock,
    Shield,
    Calculator,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/api';

interface TransferRecipient {
    id: string;
    name: string;
    phone: string;
    country: string;
    currency: string;
    bankDetails?: {
        accountNumber: string;
        bankName: string;
        swiftCode: string;
    };
}

interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    fee: number;
    estimatedTime: string;
}

export const MoneyTransfer: React.FC = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('AED');
    const [toCurrency, setToCurrency] = useState('INR');
    const [recipient, setRecipient] = useState<TransferRecipient | null>(null);
    const [recipients, setRecipients] = useState<TransferRecipient[]>([]);
    const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transferHistory, setTransferHistory] = useState<any[]>([]);

    useEffect(() => {
        loadRecipients();
        loadTransferHistory();
    }, [user?.id]);

    useEffect(() => {
        if (amount && fromCurrency && toCurrency) {
            calculateExchangeRate();
        }
    }, [amount, fromCurrency, toCurrency]);

    const loadRecipients = async () => {
        // Mock recipients - in production, load from database
        const mockRecipients: TransferRecipient[] = [
            {
                id: '1',
                name: 'Ahmed Hassan',
                phone: '+971501234567',
                country: 'UAE',
                currency: 'AED'
            },
            {
                id: '2',
                name: 'Priya Sharma',
                phone: '+919876543210',
                country: 'India',
                currency: 'INR'
            },
            {
                id: '3',
                name: 'Mohammed Ali',
                phone: '+201234567890',
                country: 'Egypt',
                currency: 'EGP'
            }
        ];
        setRecipients(mockRecipients);
    };

    const loadTransferHistory = async () => {
        // Mock transfer history
        const mockHistory = [
            {
                id: '1',
                amount: 1000,
                fromCurrency: 'AED',
                toCurrency: 'INR',
                recipient: 'Priya Sharma',
                status: 'completed',
                date: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: '2',
                amount: 500,
                fromCurrency: 'AED',
                toCurrency: 'EGP',
                recipient: 'Mohammed Ali',
                status: 'pending',
                date: new Date(Date.now() - 3600000).toISOString()
            }
        ];
        setTransferHistory(mockHistory);
    };

    const calculateExchangeRate = async () => {
        // Mock exchange rate calculation
        const rates: Record<string, Record<string, number>> = {
            AED: { INR: 22.5, EGP: 8.2, USD: 0.27 },
            INR: { AED: 0.044, EGP: 0.36, USD: 0.012 },
            EGP: { AED: 0.12, INR: 2.75, USD: 0.033 },
            USD: { AED: 3.67, INR: 83.5, EGP: 30.5 }
        };

        const rate = rates[fromCurrency]?.[toCurrency] || 1;
        const fee = Math.max(5, parseFloat(amount) * 0.005); // 0.5% fee, min $5

        setExchangeRate({
            from: fromCurrency,
            to: toCurrency,
            rate,
            fee,
            estimatedTime: '2-5 minutes'
        });
    };

    const handleTransfer = async () => {
        if (!amount || !recipient || !exchangeRate) return;

        setIsProcessing(true);
        try {
            const transferData = {
                userId: user?.id,
                amount: parseFloat(amount),
                fromCurrency,
                toCurrency,
                recipientId: recipient.id,
                exchangeRate: exchangeRate.rate,
                fee: exchangeRate.fee,
                totalAmount: parseFloat(amount) + exchangeRate.fee,
                status: 'processing',
                createdAt: new Date().toISOString()
            };

            // In production, save to database and initiate transfer
            console.log('Transfer initiated:', transferData);

            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update history
            const newTransfer = {
                ...transferData,
                recipient: recipient.name,
                status: 'completed'
            };
            setTransferHistory(prev => [newTransfer, ...prev]);

            // Reset form
            setAmount('');
            setRecipient(null);

            alert('Transfer completed successfully!');
        } catch (error) {
            console.error('Transfer failed:', error);
            alert('Transfer failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const receivedAmount = amount && exchangeRate ?
        (parseFloat(amount) * exchangeRate.rate).toFixed(2) : '0.00';

    const totalCost = amount && exchangeRate ?
        (parseFloat(amount) + exchangeRate.fee).toFixed(2) : '0.00';

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <Send className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">Money Transfer</h1>
                </div>
                <p className="text-muted-foreground">
                    Send money internationally with competitive rates
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transfer Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Money</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Amount Input */}
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount to Send</Label>
                                <div className="flex gap-2">
                                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AED">AED</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="INR">INR</SelectItem>
                                            <SelectItem value="EGP">EGP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {/* Recipient Selection */}
                            <div className="space-y-2">
                                <Label>Send To</Label>
                                <Select value={recipient?.id || ''} onValueChange={(id) => {
                                    const selected = recipients.find(r => r.id === id);
                                    setRecipient(selected || null);
                                    if (selected) setToCurrency(selected.currency);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select recipient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipients.map((rec) => (
                                            <SelectItem key={rec.id} value={rec.id}>
                                                {rec.name} - {rec.country} ({rec.currency})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Exchange Rate Display */}
                            {exchangeRate && amount && (
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Exchange Rate</span>
                                            <Badge variant="outline">
                                                1 {fromCurrency} = {exchangeRate.rate.toFixed(4)} {toCurrency}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-muted-foreground">You send</div>
                                                <div className="font-bold">{fromCurrency} {amount}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">They receive</div>
                                                <div className="font-bold">{toCurrency} {receivedAmount}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                                            Transfer fee: {fromCurrency} {exchangeRate.fee.toFixed(2)} |
                                            Total cost: {fromCurrency} {totalCost} |
                                            Estimated time: {exchangeRate.estimatedTime}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Transfer Button */}
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleTransfer}
                                disabled={!amount || !recipient || isProcessing}
                            >
                                {isProcessing ? 'Processing...' : `Send ${fromCurrency} ${amount || '0'}`}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Transfer History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transfers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {transferHistory.map((transfer) => (
                                    <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {transfer.fromCurrency} {transfer.amount} → {transfer.toCurrency}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    To {transfer.recipient}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={
                                                transfer.status === 'completed' ? 'default' :
                                                    transfer.status === 'pending' ? 'secondary' : 'destructive'
                                            }>
                                                {transfer.status}
                                            </Badge>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(transfer.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Benefits */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Why Choose Us?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <div className="font-medium">Global Reach</div>
                                    <div className="text-sm text-muted-foreground">
                                        Send to 50+ countries
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <div className="font-medium">Fast Transfers</div>
                                    <div className="text-sm text-muted-foreground">
                                        Most transfers complete in minutes
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <div className="font-medium">Secure & Regulated</div>
                                    <div className="text-sm text-muted-foreground">
                                        Licensed and fully compliant
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calculator className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <div className="font-medium">Competitive Rates</div>
                                    <div className="text-sm text-muted-foreground">
                                        Better than banks and Western Union
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Transfer Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Sent</span>
                                <span className="font-bold">AED 2,450</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Received</span>
                                <span className="font-bold">AED 1,200</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Success Rate</span>
                                <span className="font-bold text-green-600">99.8%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Avg. Transfer Time</span>
                                <span className="font-bold">3.2 min</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MoneyTransfer;