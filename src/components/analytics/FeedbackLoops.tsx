import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    Target,
    Zap,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Lightbulb,
    Users,
    Clock,
    DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/api';

interface ABTest {
    id: string;
    name: string;
    description: string;
    status: 'running' | 'completed' | 'paused';
    startDate: string;
    endDate?: string;
    variants: {
        name: string;
        traffic: number;
        conversions: number;
        revenue: number;
    }[];
    winner?: string;
    confidence: number;
}

interface OptimizationRecommendation {
    id: string;
    type: 'pricing' | 'ui' | 'feature' | 'marketing';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    potentialGain: number;
    confidence: number;
    implemented: boolean;
}

interface SystemMetrics {
    userSatisfaction: number;
    conversionRate: number;
    retentionRate: number;
    revenuePerUser: number;
    responseTime: number;
    errorRate: number;
}

export const FeedbackLoops: React.FC = () => {
    const { user } = useAuth();
    const [abTests, setAbTests] = useState<ABTest[]>([]);
    const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
    const [metrics, setMetrics] = useState<SystemMetrics>({
        userSatisfaction: 4.2,
        conversionRate: 3.8,
        retentionRate: 68.5,
        revenuePerUser: 145.50,
        responseTime: 245,
        errorRate: 0.12
    });
    const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
    const [isOptimizing, setIsOptimizing] = useState(false);

    useEffect(() => {
        loadABTests();
        loadRecommendations();
        loadMetrics();
    }, [selectedTimeframe]);

    const loadABTests = async () => {
        // Mock A/B test data
        const mockTests: ABTest[] = [
            {
                id: 'pricing-strategy',
                name: 'Dynamic Pricing Display',
                description: 'Testing different ways to show AI-optimized pricing',
                status: 'running',
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                variants: [
                    { name: 'Control', traffic: 50, conversions: 1250, revenue: 187500 },
                    { name: 'AI Highlighted', traffic: 50, conversions: 1380, revenue: 207000 }
                ],
                confidence: 89
            },
            {
                id: 'onboarding-flow',
                name: 'User Onboarding Experience',
                description: 'Comparing guided vs self-service onboarding',
                status: 'completed',
                startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                variants: [
                    { name: 'Guided', traffic: 50, conversions: 980, revenue: 147000 },
                    { name: 'Self-Service', traffic: 50, conversions: 1120, revenue: 168000 }
                ],
                winner: 'Self-Service',
                confidence: 95
            }
        ];

        setAbTests(mockTests);
    };

    const loadRecommendations = async () => {
        // Mock AI-generated recommendations
        const mockRecommendations: OptimizationRecommendation[] = [
            {
                id: 'rec-1',
                type: 'pricing',
                title: 'Implement Surge Pricing Transparency',
                description: 'Add clear explanations for dynamic pricing changes to improve user trust and conversion rates',
                impact: 'high',
                effort: 'medium',
                potentialGain: 250000,
                confidence: 87,
                implemented: false
            },
            {
                id: 'rec-2',
                type: 'ui',
                title: 'Optimize Mobile Booking Flow',
                description: 'Reduce booking steps from 5 to 3 on mobile devices based on user behavior analysis',
                impact: 'high',
                effort: 'low',
                potentialGain: 180000,
                confidence: 92,
                implemented: false
            },
            {
                id: 'rec-3',
                type: 'feature',
                title: 'Add Trip Sharing Feature',
                description: 'Allow users to share trip details with emergency contacts for safety improvements',
                impact: 'medium',
                effort: 'medium',
                potentialGain: 95000,
                confidence: 78,
                implemented: true
            },
            {
                id: 'rec-4',
                type: 'marketing',
                title: 'Personalized Push Notifications',
                description: 'Implement AI-driven personalized notifications to increase engagement by 35%',
                impact: 'high',
                effort: 'high',
                potentialGain: 320000,
                confidence: 85,
                implemented: false
            }
        ];

        setRecommendations(mockRecommendations);
    };

    const loadMetrics = async () => {
        // Mock real-time metrics
        setMetrics({
            userSatisfaction: 4.2 + Math.random() * 0.4,
            conversionRate: 3.8 + Math.random() * 0.6,
            retentionRate: 68.5 + Math.random() * 2,
            revenuePerUser: 145.50 + Math.random() * 10,
            responseTime: 245 + Math.random() * 20,
            errorRate: 0.12 + Math.random() * 0.02
        });
    };

    const runOptimizationCycle = async () => {
        setIsOptimizing(true);
        try {
            // Mock optimization process
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Generate new recommendations based on latest data
            const newRecs = recommendations.map(rec => ({
                ...rec,
                confidence: Math.min(100, rec.confidence + Math.random() * 5)
            }));

            setRecommendations(newRecs);
            alert('Optimization cycle completed! New recommendations generated.');
        } catch (error) {
            console.error('Optimization failed:', error);
            alert('Optimization cycle failed. Please try again.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const implementRecommendation = async (recId: string) => {
        setRecommendations(prev =>
            prev.map(rec =>
                rec.id === recId ? { ...rec, implemented: true } : rec
            )
        );
        alert('Recommendation marked as implemented!');
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-green-600 bg-green-50';
        }
    };

    const getEffortColor = (effort: string) => {
        switch (effort) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            default: return 'text-green-600';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">Feedback Loops & Optimization</h1>
                </div>
                <p className="text-muted-foreground">
                    AI-driven continuous improvement through data analysis and automated optimization
                </p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex justify-end">
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1d">Last 24h</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-lg font-bold">{metrics.userSatisfaction.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">User Satisfaction</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <div className="text-lg font-bold">{metrics.conversionRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Conversion Rate</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <RefreshCw className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <div className="text-lg font-bold">{metrics.retentionRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Retention Rate</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                        <div className="text-lg font-bold">AED {metrics.revenuePerUser.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">Revenue/User</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <div className="text-lg font-bold">{metrics.responseTime.toFixed(0)}ms</div>
                        <div className="text-xs text-muted-foreground">Response Time</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                        <div className="text-lg font-bold">{(metrics.errorRate * 100).toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">Error Rate</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="recommendations" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                    <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="automation">Automation</TabsTrigger>
                </TabsList>

                {/* AI Recommendations */}
                <TabsContent value="recommendations" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Optimization Recommendations</h2>
                        <Button onClick={runOptimizationCycle} disabled={isOptimizing}>
                            {isOptimizing ? 'Running...' : 'Run Optimization Cycle'}
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {recommendations.map((rec) => (
                            <Card key={rec.id} className={rec.implemented ? 'opacity-60' : ''}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={getImpactColor(rec.impact)}>
                                                    {rec.impact} impact
                                                </Badge>
                                                <Badge variant="outline" className={getEffortColor(rec.effort)}>
                                                    {rec.effort} effort
                                                </Badge>
                                                <Badge variant="outline">
                                                    {rec.confidence}% confidence
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">{rec.title}</h3>
                                            <p className="text-muted-foreground mb-3">{rec.description}</p>
                                            <div className="text-sm text-green-600 font-medium">
                                                Potential Gain: AED {rec.potentialGain.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            {rec.implemented ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Implemented
                                                </Badge>
                                            ) : (
                                                <Button
                                                    onClick={() => implementRecommendation(rec.id)}
                                                    size="sm"
                                                >
                                                    Implement
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* A/B Tests */}
                <TabsContent value="ab-tests" className="space-y-6">
                    <h2 className="text-2xl font-bold">A/B Testing Results</h2>

                    <div className="grid gap-6">
                        {abTests.map((test) => (
                            <Card key={test.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{test.name}</CardTitle>
                                            <p className="text-muted-foreground">{test.description}</p>
                                        </div>
                                        <Badge variant={
                                            test.status === 'running' ? 'default' :
                                                test.status === 'completed' ? 'secondary' : 'outline'
                                        }>
                                            {test.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {test.variants.map((variant, index) => (
                                            <div key={index} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">{variant.name}</h4>
                                                    {test.winner === variant.name && (
                                                        <Badge className="bg-green-100 text-green-800">
                                                            Winner
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Traffic Allocation</span>
                                                        <span>{variant.traffic}%</span>
                                                    </div>
                                                    <Progress value={variant.traffic} className="h-2" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Conversions</span>
                                                        <div className="font-bold">{variant.conversions.toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Revenue</span>
                                                        <div className="font-bold">AED {variant.revenue.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {test.confidence && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Statistical Confidence</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {test.confidence}%
                                                </span>
                                            </div>
                                            <Progress value={test.confidence} className="mt-2 h-2" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Analytics */}
                <TabsContent value="analytics" className="space-y-6">
                    <h2 className="text-2xl font-bold">Performance Analytics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Journey Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Booking Completion</span>
                                            <span>78%</span>
                                        </div>
                                        <Progress value={78} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Profile Completion</span>
                                            <span>65%</span>
                                        </div>
                                        <Progress value={65} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Referral Usage</span>
                                            <span>42%</span>
                                        </div>
                                        <Progress value={42} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Feature Adoption</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>AI Route Suggestions</span>
                                            <span>89%</span>
                                        </div>
                                        <Progress value={89} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Dynamic Pricing</span>
                                            <span>76%</span>
                                        </div>
                                        <Progress value={76} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Safety Features</span>
                                            <span>94%</span>
                                        </div>
                                        <Progress value={94} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Automation */}
                <TabsContent value="automation" className="space-y-6">
                    <h2 className="text-2xl font-bold">Automated Optimization</h2>

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Automations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">Dynamic Pricing Updates</div>
                                            <div className="text-sm text-muted-foreground">
                                                Automatically adjusts prices based on demand patterns
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">User Onboarding Optimization</div>
                                            <div className="text-sm text-muted-foreground">
                                                A/B tests different onboarding flows automatically
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">Content Personalization</div>
                                            <div className="text-sm text-muted-foreground">
                                                AI-driven content recommendations for users
                                            </div>
                                        </div>
                                        <Badge className="bg-yellow-100 text-yellow-800">Learning</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Optimization Impact</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">+23%</div>
                                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">+18%</div>
                                        <div className="text-sm text-muted-foreground">User Satisfaction</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">+31%</div>
                                        <div className="text-sm text-muted-foreground">Revenue Growth</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">-15%</div>
                                        <div className="text-sm text-muted-foreground">Support Tickets</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FeedbackLoops;