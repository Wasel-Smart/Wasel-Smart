import { useState } from 'react';
import { Star, Award, Clock, Shield, Heart, Zap, TrendingUp, Medal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface DriverBadgesProps {
  driverId?: string;
  driverName?: string;
  rating?: number;
  totalTrips?: number;
  badges?: DriverBadge[];
  onBadgeClick?: (badge: DriverBadge) => void;
}

interface DriverBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'excellence' | 'milestone' | 'special' | 'premium';
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
  isLocked?: boolean;
}

const allBadges: DriverBadge[] = [
  // Excellence badges
  { id: '5-star', name: '5-Star Driver', description: 'Maintain a 5.0 rating for 50 trips', icon: '⭐', category: 'excellence', maxProgress: 50 },
  { id: 'safety-champion', name: 'Safety Champion', description: 'Zero safety incidents for 100 trips', icon: '🛡️', category: 'excellence', maxProgress: 100 },
  { id: 'super-clean', name: 'Super Clean', description: 'Receive "Clean Vehicle" feedback 50 times', icon: '✨', category: 'excellence', maxProgress: 50 },
  { id: 'punctual-pro', name: 'Punctual Pro', description: 'Arrive on time for 200 trips', icon: '⏰', category: 'excellence', maxProgress: 200 },

  // Milestone badges
  { id: 'first-ride', name: 'First Ride', description: 'Complete your first trip', icon: '🚗', category: 'milestone' },
  { id: 'century-club', name: 'Century Club', description: 'Complete 100 trips', icon: '💯', category: 'milestone', maxProgress: 100 },
  { id: 'half-millennium', name: 'Half Millennium', description: 'Complete 500 trips', icon: '5️⃣0️⃣0️⃣', category: 'milestone', maxProgress: 500 },
  { id: 'thousand-rider', name: 'Thousand Rider', description: 'Complete 1,000 trips', icon: '🎯', category: 'milestone', maxProgress: 1000 },

  // Special badges
  { id: 'community-hero', name: 'Community Hero', description: 'Help 10 passengers with special needs', icon: '❤️', category: 'special', maxProgress: 10 },
  { id: 'night-owl', name: 'Night Owl', description: 'Complete 50 late-night trips (11PM-5AM)', icon: '🦉', category: 'special', maxProgress: 50 },
  { id: 'airport-pro', name: 'Airport Pro', description: 'Complete 100 airport trips', icon: '✈️', category: 'special', maxProgress: 100 },
  { id: 'long-distance', name: 'Road Warrior', description: 'Complete 25 trips over 50 miles', icon: '🛣️', category: 'special', maxProgress: 25 },

  // Premium badges
  { id: 'gold-driver', name: 'Gold Driver', description: 'Top 10% of drivers in your city', icon: '🥇', category: 'premium' },
  { id: 'platinum', name: 'Platinum', description: 'Top 5% of drivers in your region', icon: '💎', category: 'premium' },
  { id: 'mentor', name: 'Driver Mentor', description: 'Successfully mentor 5 new drivers', icon: '🎓', category: 'premium', maxProgress: 5 },
  { id: 'elite', name: 'Elite Driver', description: 'Exclusive badge for top performers', icon: '👑', category: 'premium' },
];

export function DriverBadges({
  driverId,
  driverName,
  rating = 4.8,
  totalTrips = 156,
  badges = [],
  onBadgeClick,
}: DriverBadgesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<DriverBadge | null>(null);

  // Mock earned badges with progress
  const earnedBadges: DriverBadge[] = [
    { ...allBadges[0], progress: 45 },
    { ...allBadges[1], progress: 78 },
    { ...allBadges[4], earnedAt: '2024-01-15' },
    { ...allBadges[5], progress: 100, earnedAt: '2024-01-10' },
    { ...allBadges[7], earnedAt: '2024-01-05' },
    { ...allBadges[8], progress: 23 },
  ];

  const categories = ['all', 'excellence', 'milestone', 'special', 'premium'];

  const filteredBadges = selectedCategory === 'all'
    ? earnedBadges
    : earnedBadges.filter((b) => b.category === selectedCategory);

  const lockedBadges = allBadges.filter(
    (badge) => !earnedBadges.some((eb) => eb.id === badge.id)
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'excellence':
        return <Award className="w-4 h-4" />;
      case 'milestone':
        return <TrendingUp className="w-4 h-4" />;
      case 'special':
        return <Star className="w-4 h-4" />;
      case 'premium':
        return <Medal className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const stats = {
    totalEarned: earnedBadges.length,
    totalAvailable: allBadges.length,
    completionRate: Math.round((earnedBadges.length / allBadges.length) * 100),
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                Driver Badges
              </CardTitle>
              <CardDescription>
                {driverName && `Badges earned by ${driverName}`}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {stats.totalEarned}/{stats.totalAvailable}
              </p>
              <p className="text-xs text-gray-500">Badges Earned</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {getCategoryIcon(category)}
                <span className="ml-1">{category}</span>
              </Button>
            ))}
          </div>

          {/* Earned Badges */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Earned Badges ({earnedBadges.length})
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {filteredBadges.map((badge) => (
                <TooltipProvider key={badge.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setShowDetails(badge);
                          onBadgeClick?.(badge);
                        }}
                      >
                        <span className="text-3xl mb-1">{badge.icon}</span>
                        <span className="text-xs text-center font-medium line-clamp-2">
                          {badge.name}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-sm text-gray-400">{badge.description}</p>
                      {badge.earnedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Earned: {badge.earnedAt}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Locked Badges Preview */}
          {lockedBadges.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2 text-gray-500">
                <Shield className="w-4 h-4" />
                Locked Badges ({lockedBadges.length})
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {lockedBadges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex-shrink-0 flex flex-col items-center p-2 border border-dashed rounded-lg opacity-50"
                  >
                    <span className="text-2xl grayscale">{badge.icon}</span>
                    <span className="text-xs text-center mt-1 line-clamp-1">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge Details Dialog */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent>
          {showDetails && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{showDetails.icon}</span>
                  <div>
                    <DialogTitle>{showDetails.name}</DialogTitle>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {showDetails.category}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {showDetails.description}
                </p>

                {showDetails.progress !== undefined && showDetails.maxProgress && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">
                        {showDetails.progress}/{showDetails.maxProgress}
                      </span>
                    </div>
                    <Progress
                      value={(showDetails.progress / showDetails.maxProgress) * 100}
                      className="h-2"
                    />
                  </div>
                )}

                {showDetails.earnedAt && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ Earned on {showDetails.earnedAt}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-2">How to Earn</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {showDetails.category === 'excellence' && (
                      <>
                        <li>• Maintain high ratings consistently</li>
                        <li>• Receive positive feedback from passengers</li>
                        <li>• Follow all safety guidelines</li>
                      </>
                    )}
                    {showDetails.category === 'milestone' && (
                      <>
                        <li>• Complete more trips on the platform</li>
                        <li>• Stay active and available</li>
                        <li>• Provide excellent service every time</li>
                      </>
                    )}
                    {showDetails.category === 'special' && (
                      <>
                        <li>• Complete trips in specific conditions</li>
                        <li>• Help passengers with unique needs</li>
                        <li>• Provide specialized services</li>
                      </>
                    )}
                    {showDetails.category === 'premium' && (
                      <>
                        <li>• Maintain top-tier performance metrics</li>
                        <li>• Be among the best in your region</li>
                        <li>• Inspire other drivers</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetails(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
