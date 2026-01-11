import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CreditCard,
    Calendar,
    DollarSign,
    CheckCircle,
    AlertTriangle,
    Calculator,
    Clock,
    Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/api';

interface BNPLPlan {
    id: string;
    name: string;
    installments: number;
    interestRate: number;
    monthlyPayment: number;
    totalAmount: number;
    processingFee: number;
}

interface TripBooking {
    id: string;
    tripId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'paid';
}

export const BNPLTripPayment: React.FC<{
    tripAmount: number;
    currency: string;
    onPaymentComplete: (plan: BNPLPlan) => void;
}> = ({ tripAmount, currency, onPaymentComplete }) => {
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<BNPLPlan | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [creditScore, setCreditScore] = useState<number>(750);
    const [availablePlans, setAvailablePlans] = useState<BNPLPlan[]>([]);

    useEffect(() => {
        generateBNPLPlans();
        loadCreditScore();
    }, [tripAmount]);

    const generateBNPLPlans = () => {
        const plans: BNPLPlan[] = [
            {
                id: '3-months',
                name: '3 Months - No Interest',
                installments: 3,
                interestRate: 0,
                monthlyPayment: tripAmount / 3,
                totalAmount: tripAmount,
                processingFee: 0
            },
            {
                id: '6-months',
                name: '6 Months - Low Interest',
                installments: 6,
                interestRate: 0.05,
                monthlyPayment: (tripAmount * 1.05) / 6,
                totalAmount: tripAmount * 1.05,
                processingFee: tripAmount * 0.02
            },
            {
                id: '12-months',
                name: '12 Months - Flexible',
                installments: 12,
                interestRate: 0.08,
                monthlyPayment: (tripAmount * 1.08) / 12,
                totalAmount: tripAmount * 1.08,
                processingFee: tripAmount * 0.03
            }
        ];
        setAvailablePlans(plans);
    };

    const loadCreditScore = async () => {
        // Mock credit score - in production, integrate with credit bureau
        const mockScore = Math.floor(Math.random() * 300) + 550; // 550-850
        setCreditScore(mockScore);
    };

    const getCreditTier = (score: number) => {
        if (score >= 750) return { tier: 'excellent', color: 'text-green-600', plans: 3 };
        if (score >= 650) return { tier: 'good', color: 'text-blue-600', plans: 3 };
        if (score >= 550) return { tier: 'fair', color: 'text-yellow-600', plans: 2 };
        return { tier: 'limited', color: 'text-red-600', plans: 1 };
    };

    const creditTier = getCreditTier(creditScore);

    const handlePlanSelection = async (plan: BNPLPlan) => {
        setIsProcessing(true);
        try {
            // Create BNPL agreement
            const agreement = {
                userId: user?.id,
                planId: plan.id,
                amount: tripAmount,
                totalPayable: plan.totalAmount,
                installments: plan.installments,
                monthlyPayment: plan.monthlyPayment,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // In production, save to database
            console.log('BNPL Agreement:', agreement);

            setSelectedPlan(plan);
            onPaymentComplete(plan);
        } catch (error) {
            console.error('Error creating BNPL agreement:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">Buy Now, Pay Later</h1>
                </div>
                <p className="text-muted-foreground">
                    Split your trip payment into easy installments
                </p>
            </div>

            {/* Credit Score Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Your Credit Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{creditScore}</div>
                            <div className="text-sm text-muted-foreground">Credit Score</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${creditTier.color}`}>
                                {creditTier.tier.toUpperCase()}
                            </div>
                            <div className="text-sm text-muted-foreground">Credit Tier</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{creditTier.plans}</div>
                            <div className="text-sm text-muted-foreground">Plans Available</div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Credit Utilization</span>
                            <span>25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* BNPL Plans */}
            <Card>
                <CardHeader>
                    <CardTitle>Choose Your Payment Plan</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Trip Amount: {currency} {tripAmount.toFixed(2)}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {availablePlans.slice(0, creditTier.plans).map((plan) => (
                            <Card
                                key={plan.id}
                                className={`cursor-pointer transition-all ${selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                                    }`}
                                onClick={() => setSelectedPlan(plan)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {plan.installments} monthly payments
                                            </p>
                                        </div>
                                        {plan.interestRate === 0 && (
                                            <Badge className="bg-green-100 text-green-800">
                                                No Interest
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Monthly</div>
                                            <div className="text-lg font-bold">
                                                {currency} {plan.monthlyPayment.toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Total</div>
                                            <div className="text-lg font-bold">
                                                {currency} {plan.totalAmount.toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Interest</div>
                                            <div className="text-lg font-bold">
                                                {(plan.interestRate * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Fee</div>
                                            <div className="text-lg font-bold">
                                                {currency} {plan.processingFee.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlanSelection(plan);
                                        }}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : 'Select This Plan'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
                <CardHeader>
                    <CardTitle>Why Choose BNPL?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium">Flexible Payments</div>
                                <div className="text-sm text-muted-foreground">
                                    Spread your trip cost over multiple months
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium">No Hidden Fees</div>
                                <div className="text-sm text-muted-foreground">
                                    Transparent pricing with clear terms
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium">Instant Approval</div>
                                <div className="text-sm text-muted-foreground">
                                    Quick credit decision for qualified users
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium">Travel Now</div>
                                <div className="text-sm text-muted-foreground">
                                    Book your trip immediately, pay over time
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BNPLTripPayment;