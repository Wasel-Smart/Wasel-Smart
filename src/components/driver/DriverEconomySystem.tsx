import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Star, TrendingUp, Users, DollarSign, Award, Target } from 'lucide-react';

interface DriverTier {
  name: string;
  level: number;
  color: string;
  requirements: {
    trips: number;
    rating: number;
    revenue: number;
  };
  benefits: {
    guaranteedEarnings: number;
    revenueShare: number;
    platformOwnership: number;
    bonuses: string[];
  };
}

const driverTiers: DriverTier[] = [
  {
    name: 'Bronze',
    level: 1,
    color: 'bg-amber-600',
    requirements: { trips: 0, rating: 0, revenue: 0 },
    benefits: {
      guaranteedEarnings: 15,
      revenueShare: 5,
      platformOwnership: 0.1,
      bonuses: ['Welcome bonus', 'Basic support']
    }
  },
  {
    name: 'Silver',
    level: 2,
    color: 'bg-gray-400',
    requirements: { trips: 100, rating: 4.5, revenue: 5000 },
    benefits: {
      guaranteedEarnings: 18,
      revenueShare: 8,
      platformOwnership: 0.3,
      bonuses: ['Performance bonus', 'Priority support', 'Training access']
    }
  },
  {
    name: 'Gold',
    level: 3,
    color: 'bg-yellow-500',
    requirements: { trips: 500, rating: 4.7, revenue: 25000 },
    benefits: {
      guaranteedEarnings: 22,
      revenueShare: 12,
      platformOwnership: 0.8,
      bonuses: ['Leadership bonus', 'Mentorship program', 'Advanced analytics']
    }
  },
  {
    name: 'Platinum',
    level: 4,
    color: 'bg-purple-600',
    requirements: { trips: 1500, rating: 4.8, revenue: 75000 },
    benefits: {
      guaranteedEarnings: 28,
      revenueShare: 18,
      platformOwnership: 2.0,
      bonuses: ['Executive bonus', 'Decision voting rights', 'Revenue insights']
    }
  },
  {
    name: 'Diamond',
    level: 5,
    color: 'bg-blue-600',
    requirements: { trips: 3000, rating: 4.9, revenue: 150000 },
    benefits: {
      guaranteedEarnings: 35,
      revenueShare: 25,
      platformOwnership: 5.0,
      bonuses: ['Partner status', 'Board representation', 'Profit sharing']
    }
  }
];

export function DriverEconomySystem() {
  const [currentDriver] = useState({
    name: 'Ahmed Hassan',
    currentTier: 2,
    stats: {
      totalTrips: 342,
      rating: 4.6,
      totalRevenue: 12500,
      monthlyEarnings: 3200,
      platformShares: 0.3
    }
  });

  const currentTierData = driverTiers[currentDriver.currentTier - 1];
  const nextTierData = driverTiers[currentDriver.currentTier] || null;

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Driver Partnership Program</h1>
          <p className="text-muted-foreground">Transform from service provider to platform partner</p>
        </div>
        <Badge className={`${currentTierData.color} text-white text-lg px-4 py-2`}>
          {currentTierData.name} Partner
        </Badge>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Partnership Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentDriver.stats.totalTrips}</div>
              <div className="text-sm text-muted-foreground">Total Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {currentDriver.stats.rating} <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${currentDriver.stats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentDriver.stats.platformShares}%</div>
              <div className="text-sm text-muted-foreground">Platform Ownership</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="progression" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progression">Tier Progression</TabsTrigger>
          <TabsTrigger value="earnings">Earnings Structure</TabsTrigger>
          <TabsTrigger value="ownership">Ownership Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="progression" className="space-y-4">
          {/* Next Tier Progress */}
          {nextTierData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progress to {nextTierData.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Trips</span>
                      <span>{currentDriver.stats.totalTrips} / {nextTierData.requirements.trips}</span>
                    </div>
                    <Progress value={calculateProgress(currentDriver.stats.totalTrips, nextTierData.requirements.trips)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Rating</span>
                      <span>{currentDriver.stats.rating} / {nextTierData.requirements.rating}</span>
                    </div>
                    <Progress value={calculateProgress(currentDriver.stats.rating, nextTierData.requirements.rating)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Revenue</span>
                      <span>${currentDriver.stats.totalRevenue.toLocaleString()} / ${nextTierData.requirements.revenue.toLocaleString()}</span>
                    </div>
                    <Progress value={calculateProgress(currentDriver.stats.totalRevenue, nextTierData.requirements.revenue)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driverTiers.map((tier, index) => (
              <Card key={tier.name} className={`${index + 1 === currentDriver.currentTier ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{tier.name}</span>
                    <Badge className={`${tier.color} text-white`}>Level {tier.level}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div><strong>Requirements:</strong></div>
                    <div>• {tier.requirements.trips} trips</div>
                    <div>• {tier.requirements.rating}+ rating</div>
                    <div>• ${tier.requirements.revenue.toLocaleString()} revenue</div>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Benefits:</strong></div>
                    <div>• ${tier.benefits.guaranteedEarnings}/hr guaranteed</div>
                    <div>• {tier.benefits.revenueShare}% revenue share</div>
                    <div>• {tier.benefits.platformOwnership}% platform ownership</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Earnings Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${currentTierData.benefits.guaranteedEarnings}/hr</div>
                  <div className="text-sm text-green-700">Guaranteed Minimum</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{currentTierData.benefits.revenueShare}%</div>
                  <div className="text-sm text-blue-700">Revenue Share</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${currentDriver.stats.monthlyEarnings}</div>
                  <div className="text-sm text-purple-700">This Month</div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Additional Benefits:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentTierData.benefits.bonuses.map((bonus, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{bonus}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Platform Ownership Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Your Current Ownership</h4>
                  <div className="text-3xl font-bold text-primary">{currentDriver.stats.platformShares}%</div>
                  <p className="text-sm text-muted-foreground">
                    You own {currentDriver.stats.platformShares}% of platform revenue in your region
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Monthly Dividend</h4>
                  <div className="text-3xl font-bold text-green-600">$127</div>
                  <p className="text-sm text-muted-foreground">
                    Based on your ownership stake and platform performance
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Ownership Progression Path</h4>
                <div className="space-y-2">
                  {driverTiers.map((tier, index) => (
                    <div key={tier.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className={`font-medium ${index + 1 === currentDriver.currentTier ? 'text-primary' : ''}`}>
                        {tier.name} Partner
                      </span>
                      <span className={`${index + 1 === currentDriver.currentTier ? 'text-primary font-bold' : ''}`}>
                        {tier.benefits.platformOwnership}% ownership
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Why This Matters</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You're not just a driver - you're a business partner</li>
                  <li>• Higher tiers = more ownership = more passive income</li>
                  <li>• Platform growth directly benefits you through dividends</li>
                  <li>• Voting rights on platform decisions at higher tiers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}