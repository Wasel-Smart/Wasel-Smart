import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Brain, ChevronLeft, ChevronRight, CheckCircle, Star, Target, Zap, Users, TrendingUp, Share2, Bell, Trophy, Flame, MessageSquare, Sparkles } from 'lucide-react';
import { mentalModels, MentalModel } from '../data/mentalModels';
import { useConversationAI, useNLPSearch, useAITracking } from '../hooks/useAIFeatures';

const availableBadges: Badge[] = [
  { id: 'first-day', title: 'First Step', description: 'Completed your first day', icon: '🌟', unlocked: false },
  { id: 'week-warrior', title: 'Week Warrior', description: 'Completed 7 days', icon: '⚔️', unlocked: false },
  { id: 'streak-3', title: 'Consistency', description: '3-day streak', icon: '🔥', unlocked: false },
  { id: 'streak-7', title: 'Fire Starter', description: '7-day streak', icon: '🔥🔥', unlocked: false },
  { id: 'streak-14', title: 'Blaze', description: '14-day streak', icon: '🔥🔥🔥', unlocked: false },
  { id: 'streak-30', title: 'Inferno', description: '30-day streak', icon: '🌋', unlocked: false },
  { id: 'reflector', title: 'Deep Thinker', description: 'Wrote 10 reflections', icon: '🧠', unlocked: false },
  { id: 'master', title: 'Billionaire Mind', description: 'Completed all 30 days', icon: '💎', unlocked: false },
];

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface ThinkingCoachProgress {
  completedDays: number[];
  reflections: { [day: number]: string };
  startDate: string;
  streak: number;
  lastCompletionDate: string;
  badges: string[];
  goals: string[];
  notificationsEnabled: boolean;
}

const STORAGE_KEY = 'thinking-coach-progress';

export function ThinkingCoach() {
  const [currentDay, setCurrentDay] = useState(1);
  const [progress, setProgress] = useState<ThinkingCoachProgress>({
    completedDays: [],
    reflections: {},
    startDate: new Date().toISOString().split('T')[0],
    streak: 0,
    lastCompletionDate: '',
    badges: [],
    goals: [],
    notificationsEnabled: false
  });
  const [reflection, setReflection] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [newGoal, setNewGoal] = useState('');
  const [decisionCalc, setDecisionCalc] = useState({
    probability: 50,
    bestCase: 100000,
    worstCase: -10000,
    expectedValue: 0,
    leverageRatio: 1,
    asymmetricScore: 0
  });
  const [compoundCalc, setCompoundCalc] = useState({
    principal: 1000,
    rate: 7,
    years: 30,
    compound: 0
  });

  // Leverage AI Engine
  const { suggestions: aiPrompts, getSuggestions: getAIPrompts, loading: aiLoading } = useConversationAI();
  const { parseQuery, loading: parsingLoading } = useNLPSearch();
  const { trackEvent } = useAITracking();

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Recalculate streak on load
      const currentStreak = calculateStreak(parsed.completedDays, parsed.lastCompletionDate);
      const updatedProgress = { ...parsed, streak: currentStreak };
      setProgress(updatedProgress);
      // Set current day to the next incomplete day or last completed +1
      const lastCompleted = Math.max(...parsed.completedDays, 0);
      setCurrentDay(lastCompleted + 1 > 30 ? 30 : lastCompleted + 1);
    }
  }, []);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Decision Calculator
  useEffect(() => {
    const prob = decisionCalc.probability / 100;
    const expected = (decisionCalc.bestCase * prob) + (decisionCalc.worstCase * (1 - prob));
    const leverage = decisionCalc.bestCase !== 0 ? Math.abs(decisionCalc.worstCase) / decisionCalc.bestCase : 0;
    const asymmetric = decisionCalc.bestCase > 0 && decisionCalc.worstCase < 0 ? (decisionCalc.bestCase / Math.abs(decisionCalc.worstCase)) : 0;
    setDecisionCalc(prev => ({
      ...prev,
      expectedValue: expected,
      leverageRatio: leverage,
      asymmetricScore: asymmetric
    }));
  }, [decisionCalc.probability, decisionCalc.bestCase, decisionCalc.worstCase]);

  // Compound Calculator
  useEffect(() => {
    const compound = compoundCalc.principal * Math.pow(1 + compoundCalc.rate / 100, compoundCalc.years);
    setCompoundCalc(prev => ({ ...prev, compound }));
  }, [compoundCalc.principal, compoundCalc.rate, compoundCalc.years]);

  // Save progress to localStorage
  const saveProgress = (newProgress: ThinkingCoachProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  };

  // Calculate streak
  const calculateStreak = (completedDays: number[], lastDate: string): number => {
    if (!lastDate) return 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastDate === today || lastDate === yesterday) {
      // Count consecutive from lastDate backwards
      let streak = 1;
      let currentDate = new Date(lastDate);
      while (true) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayNumber = Math.floor((new Date(dateStr).getTime() - new Date(progress.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (completedDays.includes(dayNumber)) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    }
    return 0;
  };

  // Check and unlock badges
  const checkBadges = (newProgress: ThinkingCoachProgress): string[] => {
    const badges = [...newProgress.badges];
    const completedCount = newProgress.completedDays.length;
    const reflectionCount = Object.keys(newProgress.reflections).length;
    const streak = newProgress.streak;

    if (completedCount >= 1 && !badges.includes('first-day')) badges.push('first-day');
    if (completedCount >= 7 && !badges.includes('week-warrior')) badges.push('week-warrior');
    if (streak >= 3 && !badges.includes('streak-3')) badges.push('streak-3');
    if (streak >= 7 && !badges.includes('streak-7')) badges.push('streak-7');
    if (streak >= 14 && !badges.includes('streak-14')) badges.push('streak-14');
    if (streak >= 30 && !badges.includes('streak-30')) badges.push('streak-30');
    if (reflectionCount >= 10 && !badges.includes('reflector')) badges.push('reflector');
    if (completedCount >= 30 && !badges.includes('master')) badges.push('master');

    return badges;
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        const newProgress = { ...progress, notificationsEnabled: true };
        saveProgress(newProgress);
        // Schedule daily reminder
        scheduleDailyReminder();
      }
    }
  };

  // Schedule daily reminder
  const scheduleDailyReminder = () => {
    if (progress.notificationsEnabled && notificationPermission === 'granted') {
      // For simplicity, show notification immediately for demo
      // In real app, use service worker for scheduled notifications
      setTimeout(() => {
        new Notification('Billionaire Thinking Coach', {
          body: 'Time for your daily mental model practice!',
          icon: '/icon-192x192.png'
        });
      }, 5000); // 5 seconds for demo
    }
  };

  // Add goal with AI parsing (Leverage principle)
  const addGoal = async () => {
    if (newGoal.trim()) {
      const parsed = await parseQuery(newGoal);
      const goalText = parsed ? `Target: ${parsed.to || parsed.from || newGoal}` : newGoal;

      const newProgress = {
        ...progress,
        goals: [...progress.goals, goalText.trim()]
      };
      saveProgress(newProgress);
      setNewGoal('');

      trackEvent('goal_added', { goal: goalText, ai_parsed: !!parsed });
    }
  };

  // Get personalized recommendations (Exponential AI Upgrade)
  const getRecommendations = () => {
    const recommendations: MentalModel[] = [];
    const completedDaysSet = new Set(progress.completedDays);

    // Filter out completed models first
    const availableModels = mentalModels.filter(m => !completedDaysSet.has(m.day));
    const goalContext = progress.goals.join(' ').toLowerCase();

    if (goalContext) {
      // Billionaire Logic: Rank models by multidimensional relevance
      const scoredModels = availableModels.map(model => {
        let score = 0;
        const text = (model.title + model.description + model.inspiration).toLowerCase();

        if (goalContext.includes('system') || goalContext.includes('leverage')) score += 5;
        if (goalContext.includes('wealth') && (text.includes('buffett') || text.includes('compound'))) score += 3;
        if (goalContext.includes('innovation') && (text.includes('musk') || text.includes('first principles'))) score += 3;
        if (goalContext.includes('vision') && text.includes('bezos')) score += 3;
        if (goalContext.includes('freedom') && text.includes('naval')) score += 3;

        return { model, score };
      }).sort((a, b) => b.score - a.score);

      recommendations.push(...scoredModels.filter(s => s.score > 0).map(s => s.model));
    }

    // System Fallback: Provide progression-based models
    if (recommendations.length < 3) {
      const nextDay = Math.max(...progress.completedDays, 0) + 1;
      const sequential = availableModels.filter(m => m.day >= nextDay).slice(0, 3);

      // Merge unique recommendations
      const combined = Array.from(new Set([...recommendations, ...sequential]));
      return combined.slice(0, 3);
    }

    return recommendations.slice(0, 3);
  };

  // Share progress
  const shareProgress = async () => {
    const text = `I've completed ${progress.completedDays.length} days of the Billionaire Thinking Coach! Current streak: ${progress.streak} days. 🧠💎 #ThinkingCoach`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Thinking Coach Progress',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Progress copied to clipboard!');
    }
  };

  const currentModel = mentalModels.find(m => m.day === currentDay) || mentalModels[0];
  const isCompleted = progress.completedDays.includes(currentDay);
  const progressPercentage = (progress.completedDays.length / 30) * 100;

  const handleMarkComplete = () => {
    if (!isCompleted) {
      const today = new Date().toISOString().split('T')[0];
      const newCompletedDays = [...progress.completedDays, currentDay].sort((a, b) => a - b);
      const newStreak = calculateStreak(newCompletedDays, today);
      const newProgress = {
        ...progress,
        completedDays: newCompletedDays,
        lastCompletionDate: today,
        streak: newStreak,
        badges: checkBadges({ ...progress, completedDays: newCompletedDays, streak: newStreak })
      };
      saveProgress(newProgress);
    }
  };

  const handleSaveReflection = () => {
    const newProgress = {
      ...progress,
      reflections: { ...progress.reflections, [currentDay]: reflection }
    };
    saveProgress(newProgress);
    setReflection('');
    trackEvent('reflection_saved', { day: currentDay });
  };

  // Get AI Coaching Prompts (Feedback Loop principle)
  const handleGetAIPrompts = () => {
    const history = [
      { sender: 'user', message: reflection, timestamp: new Date().toISOString() }
    ];
    getAIPrompts(history, `thinking-coach-day-${currentDay}-math-${JSON.stringify({decisionCalc, compoundCalc})}`);
  };

  const getInspirationIcon = (inspiration: string) => {
    const icons: { [key: string]: any } = {
      'Elon Musk': Zap,
      'Jeff Bezos': TrendingUp,
      'Naval Ravikant': Brain,
      'Charlie Munger': Target,
      'Peter Thiel': Users,
      'Warren Buffett': Star,
      'Ray Dalio': TrendingUp,
      'Howard Marks': Target,
      'Eric Ries': Zap,
      'Weekly Review': CheckCircle,
      'Integration': Brain,
      'Habit Formation': Star
    };
    return icons[inspiration] || Brain;
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDay = direction === 'next' ? currentDay + 1 : currentDay - 1;
    if (newDay >= 1 && newDay <= 30) {
      setCurrentDay(newDay);
      setReflection(progress.reflections[newDay] || '');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Billionaire Thinking Coach</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Reprogram your mind with daily mental models from the world's greatest thinkers.
          Transform from average to billionaire-level thinking.
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Progress
          </CardTitle>
          <CardDescription>
            {progress.completedDays.length} of 30 days completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-medium">Streak: {progress.streak} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Badges: {progress.badges.length}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={requestNotificationPermission}
              disabled={notificationPermission === 'granted' && progress.notificationsEnabled}
            >
              <Bell className="w-4 h-4 mr-2" />
              {progress.notificationsEnabled ? 'Notifications On' : 'Enable Reminders'}
            </Button>
            <Button variant="outline" size="sm" onClick={shareProgress}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Progress
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
              <div
                key={day}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  progress.completedDays.includes(day)
                    ? 'bg-primary text-primary-foreground'
                    : day === currentDay
                    ? 'bg-secondary text-secondary-foreground border-2 border-primary'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            Unlock badges by completing challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableBadges.map(badge => {
              const unlocked = progress.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-lg border text-center ${
                    unlocked ? 'bg-primary/10 border-primary' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <h4 className={`font-semibold ${unlocked ? 'text-primary' : 'text-gray-500'}`}>
                    {badge.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Personalization */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            Set your goals to get AI-powered model suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter your goals (e.g., build wealth, start business, improve decisions)"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              rows={2}
            />
            <Button onClick={addGoal} disabled={!newGoal.trim()}>
              Add Goal
            </Button>
          </div>
          {progress.goals.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Your Goals:</h4>
              <div className="flex flex-wrap gap-2">
                {progress.goals.map((goal, index) => (
                  <Badge key={index} variant="secondary">{goal}</Badge>
                ))}
              </div>
            </div>
          )}
          {progress.goals.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Recommended Models:</h4>
              <div className="space-y-2">
                {getRecommendations().map(model => (
                  <div key={model.day} className="p-3 border rounded-lg">
                    <h5 className="font-medium">Day {model.day}: {model.title}</h5>
                    <p className="text-sm text-muted-foreground">{model.description.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Mathematical Decision Engine
          </CardTitle>
          <CardDescription>
            Calculate expected value, leverage ratios, and asymmetric opportunities using billionaire math
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Success Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={decisionCalc.probability}
                onChange={(e) => setDecisionCalc(prev => ({ ...prev, probability: Number(e.target.value) }))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Best Case Outcome</label>
              <input
                type="number"
                value={decisionCalc.bestCase}
                onChange={(e) => setDecisionCalc(prev => ({ ...prev, bestCase: Number(e.target.value) }))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Worst Case Outcome</label>
              <input
                type="number"
                value={decisionCalc.worstCase}
                onChange={(e) => setDecisionCalc(prev => ({ ...prev, worstCase: Number(e.target.value) }))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Expected Value</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{decisionCalc.expectedValue.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Leverage Ratio</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{decisionCalc.leverageRatio.toFixed(2)}x</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Asymmetric Score</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{decisionCalc.asymmetricScore.toFixed(2)}x</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compound Interest Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Compound Interest Engine
          </CardTitle>
          <CardDescription>
            See how small investments compound into billions over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Initial Investment</label>
              <input
                type="number"
                value={compoundCalc.principal}
                onChange={(e) => setCompoundCalc(prev => ({ ...prev, principal: Number(e.target.value) }))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Annual Return (%)</label>
              <input
                type="number"
                value={compoundCalc.rate}
                onChange={(e) => setCompoundCalc(prev => ({ ...prev, rate: Number(e.target.value) }))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Years</label>
              <input
                type="number"
                value={compoundCalc.years}
                onChange={(e) => setCompoundCalc(prev => ({ ...prev, years: Number(e.target.value) }))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Future Value</div>
              <div className="text-4xl font-bold text-green-600">${compoundCalc.compound.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {((compoundCalc.compound / compoundCalc.principal - 1) * 100).toFixed(1)}% growth
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Day Model */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Day {currentDay}
              </Badge>
              <Badge variant="secondary">
                Week {currentModel.week}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDay('prev')}
                disabled={currentDay === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDay('next')}
                disabled={currentDay === 30}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-2xl">{currentModel.title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            {(() => {
              const Icon = getInspirationIcon(currentModel.inspiration);
              return <Icon className="w-4 h-4" />;
            })()}
            Inspired by {currentModel.inspiration}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed">{currentModel.description}</p>

          {/* Completion Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">Completed</span>
                </>
              ) : (
                <span className="text-muted-foreground">Not completed yet</span>
              )}
            </div>
            {!isCompleted && (
              <Button onClick={handleMarkComplete} className="bg-primary hover:bg-primary/90">
                Mark as Complete
              </Button>
            )}
          </div>

          {/* Reflection with AI Feedback Loop */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Billionaire Reflection
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGetAIPrompts}
                disabled={!reflection.trim() || aiLoading}
                className="text-primary hover:bg-primary/5"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {aiLoading ? 'Analyzing System...' : 'Get AI Coaching'}
              </Button>
            </div>
            
            <Textarea
              placeholder="Deconstruct this model mathematically. Calculate expected value, leverage ratios, and asymmetric opportunities. How does this thinking compound over time?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="bg-muted/20 focus:bg-background transition-all border-primary/10 focus:border-primary/30"
            />

            {aiPrompts.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary">
                  <Brain className="w-4 h-4" />
                  SYSTEMS ANALYSIS PROMPTS
                </h4>
                <ul className="space-y-3">
                  {aiPrompts.map((prompt, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-3 leading-relaxed">
                      <span className="shrink-0 flex items-center justify-center size-5 rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleSaveReflection}
              variant="default"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20"
              disabled={!reflection.trim()}
            >
              Commit to System
            </Button>
            {progress.reflections[currentDay] && (
              <p className="text-sm text-muted-foreground">
                Last saved: {new Date().toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Spend 10 minutes each morning reviewing the daily model</li>
            <li>• Apply the model to at least one decision today</li>
            <li>• Journal your insights and how your thinking is changing</li>
            <li>• Share your progress with an accountability partner</li>
            <li>• Review completed models weekly to reinforce learning</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}