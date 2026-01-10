import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Brain,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  revenue: {
    total: number;
    aiOptimized: number;
    traditional: number;
    growth: number;
  };
  trips: {
    total: number;
    aiNegotiated: number;
    conversion: number;
    avgPrice: number;
  };
  users: {
    total: number;
    active: number;
    premium: number;
    satisfaction: number;
  };
  ai: {
    accuracy: number;
    confidence: number;
    recommendations: number;
    accepted: number;
  };
  timeSeries: Array<{
    date: string;
    revenue: number;
    trips: number;
    aiUsage: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}

interface MarketplaceAnalyticsProps {
  dateRange: '7d' | '30d' | '90d' | '1y';
  onDateRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const MarketplaceAnalytics: React.FC<MarketplaceAnalyticsProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'trips' | 'users'>('revenue');

  // Mock data generation (in production, this would come from APIs)
  const generateMockData = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;

    const timeSeries = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));

      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 2000,
        trips: Math.floor(Math.random() * 200) + 50,
        aiUsage: Math.floor(Math.random() * 80) + 60
      };
    });

    const totalRevenue = timeSeries.reduce((sum, d) => sum + d.revenue, 0);
    const totalTrips = timeSeries.reduce((sum, d) => sum + d.trips, 0);
    const avgAIUsage = timeSeries.reduce((sum, d) => sum + d.aiUsage, 0) / timeSeries.length;

    return {
      revenue: {
        total: totalRevenue,
        aiOptimized: Math.floor(totalRevenue * 0.75),
        traditional: Math.floor(totalRevenue * 0.25),
        growth: 23.5
      },
      trips: {
        total: totalTrips,
        aiNegotiated: Math.floor(totalTrips * 0.65),
        conversion: 34.2,
        avgPrice: 42.50
      },
      users: {
        total: Math.floor(totalTrips * 2.5),
        active: Math.floor(totalTrips * 1.8),
        premium: Math.floor(totalTrips * 0.8),
        satisfaction: 4.7
      },
      ai: {
        accuracy: 87.3,
        confidence: 82.1,
        recommendations: Math.floor(totalTrips * 1.2),
        accepted: Math.floor(totalTrips * 0.8)
      },
      timeSeries,
      categoryBreakdown: [
        { category: 'AI Negotiated', value: Math.floor(totalTrips * 0.65), percentage: 65 },
        { category: 'Direct Bookings', value: Math.floor(totalTrips * 0.25), percentage: 25 },
        { category: 'Premium Trips', value: Math.floor(totalTrips * 0.10), percentage: 10 }
      ]
    };
  }, [dateRange]);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(generateMockData);
      setLoading(false);
    };

    loadData();
  }, [generateMockData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const exportData = () => {
    if (!analyticsData) return;

    const csvContent = [
      ['Date', 'Revenue', 'Trips', 'AI Usage %'],
      ...analyticsData.timeSeries.map(d => [d.date, d.revenue, d.trips, d.aiUsage])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketplace-analytics-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || !analyticsData) {
    return (
      <div className="w-full space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketplace Analytics</h1>
          <p className="text-gray-600">AI-powered marketplace performance insights</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.total)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analyticsData.revenue.growth}% vs last period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI-Optimized Trips</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.trips.aiNegotiated)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {((analyticsData.trips.aiNegotiated / analyticsData.trips.total) * 100).toFixed(1)}% of total trips
                </p>
              </div>
              {/* <Brain className="h-8 w-8 text-blue-600" /> */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{analyticsData.trips.conversion}%</p>
                <p className="text-xs text-purple-600 mt-1">
                  AI-negotiated trips convert 40% better
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold">{analyticsData.ai.accuracy}%</p>
                <Progress value={analyticsData.ai.accuracy} className="mt-2 h-2" />
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trip Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }: { category: string; percentage: number }) => `${category}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI vs Traditional Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>AI vs Traditional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(analyticsData.revenue.aiOptimized)}
                  </div>
                  <div className="text-sm text-gray-600">AI-Optimized Revenue</div>
                  <Progress value={75} className="mt-2" />
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-2">
                    {formatCurrency(analyticsData.revenue.traditional)}
                  </div>
                  <div className="text-sm text-gray-600">Traditional Revenue</div>
                  <Progress value={25} className="mt-2" />
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    +{((analyticsData.revenue.aiOptimized / analyticsData.revenue.traditional - 1) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Revenue Increase</div>
                  <Badge className="mt-2 bg-green-100 text-green-800">AI Advantage</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Trip Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Order Value</span>
                  <span className="font-medium">{formatCurrency(analyticsData.trips.avgPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue per User</span>
                  <span className="font-medium">
                    {formatCurrency(analyticsData.revenue.total / analyticsData.users.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Recurring Revenue</span>
                  <span className="font-medium">
                    {formatCurrency(analyticsData.revenue.total / (dateRange === '30d' ? 1 : dateRange === '7d' ? 4 : dateRange === '90d' ? 0.33 : 0.083))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Gross Margin</span>
                  <span className="font-medium text-green-600">78.5%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Performance Tab */}
        <TabsContent value="ai-performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analyticsData.ai.accuracy}%
                </div>
                <div className="text-sm text-gray-600">Prediction Accuracy</div>
                <Progress value={analyticsData.ai.accuracy} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analyticsData.ai.confidence}%
                </div>
                <div className="text-sm text-gray-600">Average Confidence</div>
                <Progress value={analyticsData.ai.confidence} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {((analyticsData.ai.accepted / analyticsData.ai.recommendations) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Recommendation Acceptance</div>
                <Progress value={(analyticsData.ai.accepted / analyticsData.ai.recommendations) * 100} className="mt-3" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Usage Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line type="monotone" dataKey="aiUsage" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">Revenue Growth</div>
                  <div className="text-sm text-green-700">
                    AI-optimized trips generate 3x more revenue than traditional bookings
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">User Satisfaction</div>
                  <div className="text-sm text-blue-700">
                    AI-negotiated trips have 25% higher user satisfaction ratings
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900">Conversion Optimization</div>
                  <div className="text-sm text-purple-700">
                    Dynamic pricing increases booking conversion by 40%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Increase AI Adoption</div>
                    <div className="text-sm text-gray-600">
                      Expand AI features to 80% of users for maximum revenue impact
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Optimize Peak Hours</div>
                    <div className="text-sm text-gray-600">
                      Focus surge pricing during 8-10 AM and 5-7 PM for best results
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Premium User Targeting</div>
                    <div className="text-sm text-gray-600">
                      Convert 30% more users to premium tier through AI insights
                    </div>
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

export default MarketplaceAnalytics;