import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface RatingCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface EnhancedRatingProps {
  driverName?: string;
  driverPhoto?: string;
  vehicleInfo?: string;
  tripId?: string;
  onSubmit?: (ratings: RatingData) => void;
  onSkip?: () => void;
}

interface RatingData {
  overall: number;
  categories: Record<string, number>;
  comment?: string;
  wouldRecommend: boolean;
  tags: string[];
}

const ratingCategories: RatingCategory[] = [
  { id: 'safety', label: 'Safety', icon: '🛡️', description: 'Driving safely and following traffic rules' },
  { id: 'cleanliness', label: 'Cleanliness', icon: '✨', description: 'Vehicle was clean and tidy' },
  { id: 'communication', label: 'Communication', icon: '💬', description: 'Easy to communicate with' },
  { id: 'punctuality', label: 'Punctuality', icon: '⏰', description: 'Arrived on time' },
  { id: 'navigation', label: 'Navigation', icon: '🗺️', description: 'Took efficient route' },
  { id: 'friendliness', label: 'Friendliness', icon: '😊', description: 'Friendly and courteous' },
];

const positiveTags = [
  'Great conversation', 'Clean vehicle', 'Safe driver', 'Good music',
  'Helpful', 'Polite', 'Smooth ride', 'Fast arrival', 'Great route',
];

const negativeTags = [
  'Rude', 'Dirty vehicle', 'Speeding', 'Wrong route',
  'Late arrival', 'Bad music', 'No conversation', 'Rough driving',
];

export function EnhancedRating({
  driverName = 'Driver',
  driverPhoto,
  vehicleInfo,
  tripId,
  onSubmit,
  onSkip,
}: EnhancedRatingProps) {
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState<RatingData>({
    overall: 0,
    categories: {},
    comment: '',
    wouldRecommend: true,
    tags: [],
  });

  const [hoveredStar, setHoveredStar] = useState(0);

  const handleCategoryRating = (categoryId: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      categories: { ...prev.categories, [categoryId]: value },
    }));
  };

  const handleTagToggle = (tag: string) => {
    setRatings((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = () => {
    onSubmit?.(ratings);
  };

  const averageCategoryRating = Object.values(ratings.categories).length > 0
    ? Object.values(ratings.categories).reduce((a, b) => a + b, 0) /
      Object.values(ratings.categories).length
    : 0;

  const canProceed = step === 1 && ratings.overall > 0;

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800">
      <CardHeader className="text-center">
        <CardTitle>Rate Your Trip</CardTitle>
        <CardDescription>
          {step === 1 && 'How was your overall experience?'}
          {step === 2 && 'Rate specific aspects of your trip'}
          {step === 3 && 'What went well or could be improved?'}
          {step === 4 && 'Review and submit'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Indicator */}
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                step >= s ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Overall Rating */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <Avatar className="w-20 h-20 mx-auto">
              <AvatarImage src={driverPhoto} />
              <AvatarFallback className="text-2xl">
                {driverName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{driverName}</h3>
              {vehicleInfo && (
                <p className="text-sm text-gray-500">{vehicleInfo}</p>
              )}
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRatings((prev) => ({ ...prev, overall: star }))}
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredStar || ratings.overall)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {ratings.overall > 0 && (
              <p className="text-sm text-gray-500">
                {ratings.overall === 5 && 'Excellent! ⭐⭐⭐⭐⭐'}
                {ratings.overall === 4 && 'Very Good! ⭐⭐⭐⭐'}
                {ratings.overall === 3 && 'Good! ⭐⭐⭐'}
                {ratings.overall === 2 && 'Fair! ⭐⭐'}
                {ratings.overall === 1 && 'Poor! ⭐'}
              </p>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Category Ratings */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Rate specific aspects</p>
              <p className="text-lg font-semibold">
                Average: {averageCategoryRating.toFixed(1)} / 5
              </p>
            </div>

            {ratingCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{category.label}</p>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleCategoryRating(category.id, star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (ratings.categories[category.id] || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Comments & Tags */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Would you recommend this driver?</label>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant={ratings.wouldRecommend ? 'default' : 'outline'}
                  onClick={() => setRatings((prev) => ({ ...prev, wouldRecommend: true }))}
                  className="flex-1"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!ratings.wouldRecommend ? 'destructive' : 'outline'}
                  onClick={() => setRatings((prev) => ({ ...prev, wouldRecommend: false }))}
                  className="flex-1"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  No
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">What was great? (optional)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {positiveTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={ratings.tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {!ratings.wouldRecommend && (
              <div>
                <label className="text-sm font-medium">What could be improved? (optional)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {negativeTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={ratings.tags.includes(tag) ? 'destructive' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Additional comments (optional)</label>
              <Textarea
                placeholder="Share more details about your experience..."
                className="mt-2"
                value={ratings.comment}
                onChange={(e) =>
                  setRatings((prev) => ({ ...prev, comment: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Overall Rating</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= ratings.overall
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Categories Rated</span>
                <span>{Object.keys(ratings.categories).length}/{ratingCategories.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Would Recommend</span>
                <span>{ratings.wouldRecommend ? 'Yes' : 'No'}</span>
              </div>
              {ratings.tags.length > 0 && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tags</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ratings.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {ratings.comment && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Comment</span>
                  <p className="text-sm mt-1">{ratings.comment}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Rating
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
