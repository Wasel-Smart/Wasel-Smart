/**
 * Enhanced Premium Dashboard
 * 
 * Ultra-modern glassmorphic dashboard with animations
 * Updated with Wassel Brand Identity (Teal/Sage/Maroon) and new services
 */

import { motion, AnimatePresence } from 'framer-motion';
import { VisualRoute } from '../VisualRoute';
import {
  Car,
  Package,
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Zap,
  Award,
  Bike,
  Truck,
  Users,
  PawPrint,
  School,
  Stethoscope,
  Key,
  Bus,
  Crown,
  Brain,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Loader2
} from 'lucide-react';
import { PremiumCard, PremiumCardContent } from './PremiumCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mentalModels } from '../../data/mentalModels';
import { useConversationAI } from '../../hooks/useAIFeatures';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsAPI } from '../../services/api';

interface EnhancedDashboardProps {
  onNavigate: (page: string) => void;
}

export function EnhancedDashboard({ onNavigate }: EnhancedDashboardProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [currentModel, setCurrentModel] = useState(mentalModels[0]);
  const { suggestions: feedback, getSuggestions, loading: feedbackLoading } = useConversationAI();
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    // Systems Thinking: Auto-select model based on day of month for diversity
    const day = new Date().getDate();
    const model = mentalModels[day % mentalModels.length];
    setCurrentModel(model);

    // Exponential Feedback: Analyze current state vs mental model
    const history = [
      { sender: 'system', message: `Current mental model: ${model.title}. User: ${profile?.full_name}. Trips: ${profile?.total_trips || 0}`, timestamp: new Date().toISOString() }
    ];
    getSuggestions(history, 'dashboard-thinking-nudge');

    // Fetch recent trips
    const fetchRecent = async () => {
      try {
        const { bookings } = await bookingsAPI.getUserBookings();
        setRecentTrips(bookings.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTrips(false);
      }
    };
    fetchRecent();
  }, [profile]);

  const stats = [
    {
      label: 'System Growth',
      value: (profile?.trips_as_driver || 0) + (profile?.trips_as_passenger || 0),
      change: '+12%',
      icon: Car,
      color: 'from-teal-500 to-teal-700'
    },
    {
      label: 'Wallet Balance',
      value: `AED ${profile?.wallet_balance || 0}`,
      change: '+8%',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Avg Rating',
      value: profile?.rating_as_driver || profile?.rating_as_passenger || '5.0',
      change: '+0.2',
      icon: Star,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      label: 'Saved CO₂',
      value: `${((profile?.trips_as_passenger || 0) * 1.2).toFixed(1)}kg`,
      change: '+15%',
      icon: Zap,
      color: 'from-teal-400 to-cyan-500'
    },
  ];

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  const services = [
    { id: 'delivery', name: 'Delivery', icon: Package, color: 'from-blue-500 to-cyan-500' },
    { id: 'scooters', name: 'Scooters', icon: Bike, color: 'from-green-400 to-emerald-600' },
    { id: 'freight', name: 'Freight', icon: Truck, color: 'from-slate-600 to-slate-800' },
    { id: 'carpool', name: 'Carpool', icon: Users, color: 'from-teal-500 to-teal-700' },
    { id: 'pets', name: 'Pets', icon: PawPrint, color: 'from-orange-400 to-red-500' },
    { id: 'school', name: 'School', icon: School, color: 'from-yellow-400 to-amber-600' },
    { id: 'medical', name: 'Medical', icon: Stethoscope, color: 'from-red-500 to-rose-700' },
    { id: 'rentals', name: 'Rentals', icon: Key, color: 'from-indigo-500 to-purple-600' },
    { id: 'shuttles', name: 'Shuttles', icon: Bus, color: 'from-blue-600 to-indigo-700' },
    { id: 'luxury', name: 'Luxury', icon: Crown, color: 'from-amber-500 to-yellow-600' }
  ];

  const getRouteForService = (serviceId: string) => {
    switch (serviceId) {
      case 'delivery': return 'package-delivery';
      case 'scooters': return 'scooters';
      case 'freight': return 'freight';
      case 'carpool': return 'carpool';
      case 'pets': return 'pets';
      case 'school': return 'school';
      case 'medical': return 'medical';
      case 'rentals': return 'car-rentals';
      case 'shuttles': return 'shuttle';
      case 'luxury': return 'luxury';
      default: return 'find-ride';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#008080] via-teal-700 to-[#607D4B] p-8 md:p-12 text-white shadow-2xl"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-4 bg-white/20 backdrop-blur-xl border-white/30 text-white">
              <Award className="w-4 h-4 mr-2" />
              Premium Member
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              Welcome back! 👋
            </h1>
            <p className="text-xl text-white/90 mb-6 font-light">
              Where would you like to go today?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Button
              size="lg"
              className="bg-white text-[#008080] hover:bg-white/90 font-bold border-0 shadow-lg"
              onClick={() => onNavigate('find-ride')}
            >
              <Car className="w-5 h-5 mr-2" />
              Book Ride
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 font-medium"
              onClick={() => onNavigate('scheduled-trips')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Billionaire Thinking Nudge - The Soul of Feedback */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
      >
        <PremiumCard className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white" hover>
          <PremiumCardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:w-2/3 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Brain className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Billionaire Mindset • Day {currentModel.day}</span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {currentModel.title}
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h2>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{currentModel.description}"
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {feedback.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-start"
                    >
                      <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-indigo-100">Visionary Insight:</p>
                        <p className="text-xs text-slate-400 mt-1">{feedback[0]}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-white/5 p-6 md:w-1/3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-400 uppercase font-bold">Asymmetric Lever</span>
                    <span className="text-xs font-mono text-indigo-400">High Upside</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">System alignment with {currentModel.inspiration}</p>
                </div>

                <Button
                  onClick={() => onNavigate('thinking-coach')}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                >
                  Master Model
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-md dark:bg-slate-800/80" hover>
              <PremiumCardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold mb-1 text-gray-800 dark:text-white">{stat.value}</h3>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Services Grid (Horizontal Scroll on Mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Services</h2>
          <Button variant="ghost" className="text-[#008080]">View All</Button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => onNavigate(getRouteForService(service.id))}
            >
              <div className={`
                w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${service.color} 
                flex items-center justify-center text-white shadow-lg 
                group-hover:shadow-xl group-hover:scale-110 transition-all duration-300
              `}>
                <service.icon className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-[#008080] transition-colors">
                {service.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Trips</h2>
          <Button variant="ghost" onClick={() => onNavigate('my-trips')}>
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {loadingTrips ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            </div>
          ) : recentTrips.length === 0 ? (
            <div className="p-12 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No trips yet. Start your journey today!</p>
              <Button variant="link" className="text-teal-600 mt-2" onClick={() => onNavigate('find-ride')}>Find Your First Ride</Button>
            </div>
          ) : (
            recentTrips.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <PremiumCard hover onClick={() => onNavigate('my-trips')} className="border-0 shadow-md bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
                  <PremiumCardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#008080] to-[#607D4B] rounded-2xl flex items-center justify-center text-white shadow-md">
                          <MapPin className="w-6 h-6" />
                        </div>

                        <div>
                          <VisualRoute from={booking.trip?.from_location} to={booking.trip?.to_location} compact className="mb-1" />
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-8">
                            <Clock className="w-4 h-4" />
                            {booking.trip?.departure_date} • {booking.trip?.departure_time}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-extrabold text-[#008080]">AED {booking.total_price}</p>
                        <Badge variant="outline" className={`
                            ${booking.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'} 
                            dark:bg-slate-900 border-0 pointer-events-none capitalize
                        `}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}