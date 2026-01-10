eimport { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPWA } from './components/InstallPWA';
import { DemoBanner } from './components/DemoBanner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AIProvider } from './contexts/AIContext';
import { Toaster } from './components/ui/sonner';
import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { FindRide } from './components/FindRide';
import { OfferRide } from './components/OfferRide';
import { MyTrips } from './components/MyTrips';
import { RecurringTrips } from './components/RecurringTrips';
import { Messages } from './components/Messages';
import { Favorites } from './components/Favorites';
import { Payments } from './components/Payments';
import { TripAnalytics } from './components/TripAnalytics';
import { SafetyCenter } from './components/SafetyCenter';
import { VerificationCenter } from './components/VerificationCenter';
import { Settings } from './components/Settings';
import { NotificationCenter } from './components/NotificationCenter';
import { UserProfile } from './components/UserProfile';
import { ReferralProgram } from './components/ReferralProgram';
import { BusinessAccounts } from './components/BusinessAccounts';
import { PackageDelivery } from './components/PackageDelivery';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
// Driver components
import { DriverEconomySystem } from './components/driver/DriverEconomySystem';
// Missing components
import { LiveTrip } from './components/LiveTrip';
import { TripExport } from './components/TripExport';
import { CancelTrip } from './components/CancelTrip';
import { PromoCodesManager } from './components/PromoCodesManager';
import { PopularRoutes } from './components/PopularRoutes';
import { WorkflowGuide } from './components/WorkflowGuide';
import { DriverEarnings } from './components/DriverEarnings';
import { DisputeCenter } from './components/DisputeCenter';
import { PaymentMethods } from './components/PaymentMethods';
import { ScheduledTrips } from './components/ScheduledTrips';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TermsOfService } from './components/legal/TermsOfService';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { CookiePolicy } from './components/legal/CookiePolicy';
import { RefundPolicy } from './components/legal/RefundPolicy';
import { DriverAgreement } from './components/legal/DriverAgreement';
// New components
import { CurrencySelector } from './components/CurrencySelector';
import { EnhancedRating } from './components/EnhancedRating';
import { SafetyReport } from './components/SafetyReport';
import { DriverBadges } from './components/DriverBadges';
import { CancellationPolicy } from './components/CancellationPolicy';
import { RefundStatus } from './components/RefundStatus';
import { TripInsurance } from './components/TripInsurance';
import { AccidentReport } from './components/AccidentReport';
import { InsuranceClaim } from './components/InsuranceClaim';
// Premium components
import { SplashScreen } from './components/premium/SplashScreen';
import { FloatingActionButton } from './components/premium/FloatingActionButton';
import { EnhancedDashboard } from './components/premium/EnhancedDashboard';
// Advanced features
import { VoiceAssistant } from './components/advanced/VoiceAssistant';
import { RideSocial } from './components/social/RideSocial';
// New Service components
import { ScooterRentals } from './components/ScooterRentals';
import { FreightShipping } from './components/FreightShipping';
import { PetTransport } from './components/PetTransport';
import { SchoolTransport } from './components/SchoolTransport';
import { MedicalTransport } from './components/MedicalTransport';
import { CarRentals } from './components/CarRentals';
import { ShuttleService } from './components/ShuttleService';
import { LuxuryRides } from './components/LuxuryRides';
import { ThinkingCoach } from './components/ThinkingCoach';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, show Landing Page or Auth Page
  if (!user) {
    if (showAuthPage) {
      return (
        <>
          <Toaster />
          <AuthPage 
            initialTab={authTab} 
            onBack={() => setShowAuthPage(false)} 
            onSuccess={() => {
              // AuthContext will automatically update user state
              // No need to manually navigate
            }} 
          />
        </>
      );
    }

    return (
      <>
        <Toaster />
        <LandingPage 
          onLogin={() => {
            setAuthTab('login');
            setShowAuthPage(true);
          }}
          onGetStarted={() => {
            setAuthTab('signup');
            setShowAuthPage(true);
          }}
        />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <EnhancedDashboard onNavigate={setCurrentPage} />;
      case 'find-ride':
        return <FindRide />;
      case 'carpool': // Alias for find-ride
        return <FindRide />;
      case 'offer-ride':
        return <OfferRide />;
      case 'my-trips':
        return <MyTrips />;
      case 'recurring':
        return <RecurringTrips />;
      case 'messages':
        return <Messages />;
      case 'favorites':
        return <Favorites />;
      case 'payments':
        return <Payments />;
      case 'analytics':
        return <TripAnalytics />;
      case 'safety':
        return <SafetyCenter />;
      case 'verification':
        return <VerificationCenter />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <NotificationCenter />;
      case 'profile':
        return <UserProfile />;
      case 'referrals':
        return <ReferralProgram />;
      case 'business':
        return <BusinessAccounts />;
      case 'package-delivery': // Delivery
        return <PackageDelivery />;
      case 'scooters': // Scooters
        return <ScooterRentals />;
      case 'freight': // Freight
        return <FreightShipping />;
      case 'pets': // Pets
        return <PetTransport />;
      case 'school': // School
        return <SchoolTransport />;
      case 'medical': // Medical
        return <MedicalTransport />;
      case 'car-rentals': // Car Rentals
        return <CarRentals />;
      case 'shuttle': // Shuttle Service
        return <ShuttleService />;
      case 'luxury': // Luxury Rides
        return <LuxuryRides />;
      case 'driver-earnings':
        return <DriverEarnings />;
      case 'dispute-center':
        return <DisputeCenter />;
      case 'payment-methods':
        return <PaymentMethods />;
      case 'scheduled-trips':
        return <ScheduledTrips />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'terms-of-service':
        return <TermsOfService />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'cookie-policy':
        return <CookiePolicy />;
      case 'refund-policy':
        return <RefundPolicy />;
      case 'driver-agreement':
        return <DriverAgreement />;
      case 'currency-selector':
        return <CurrencySelector />;
      case 'enhanced-rating':
        return <EnhancedRating />;
      case 'safety-report':
        return <SafetyReport />;
      case 'driver-badges':
        return <DriverBadges />;
      case 'cancellation-policy':
        return <CancellationPolicy />;
      case 'refund-status':
        return <RefundStatus />;
      case 'trip-insurance':
        return <TripInsurance />;
      case 'accident-report':
        return <AccidentReport />;
      case 'insurance-claim':
        return <InsuranceClaim />;
      case 'ride-social':
        return <RideSocial />;
      case 'driver-dashboard':
        return <DriverEconomySystem />;
      case 'live-trip':
        return <LiveTrip 
          tripId="demo-trip-id"
          driverId="demo-driver-id"
          driverInfo={{ 
            name: 'Ahmed Khan', 
            photo: '', 
            rating: 4.8, 
            vehicleModel: 'Toyota Camry', 
            vehiclePlate: 'ABC 1234', 
            vehicleColor: 'Silver'
          }}
          pickupLocation={{ 
            address: '123 Main Street, Amman', 
            coordinates: { lat: 31.9539, lng: 35.9106 }
          }}
          dropoffLocation={{ 
            address: '456 Queen Alia Street, Amman', 
            coordinates: { lat: 31.9731, lng: 35.8433 }
          }}
        />;
      case 'trip-export':
        return <TripExport />;
      case 'cancel-trip':
        return <CancelTrip 
          tripId="demo-trip-id"
          tripStatus="waiting"
          fare={25.00}
          onCancel={() => {
            console.log('Trip cancelled');
            setCurrentPage('my-trips');
          }}
          onClose={() => setCurrentPage('my-trips')}
        />;
      case 'promo-codes':
        return <PromoCodesManager />;
      case 'popular-routes':
        return <PopularRoutes onGetStarted={() => setCurrentPage('find-ride')} />;
      case 'workflow-guide':
        return <WorkflowGuide steps={[]} />;
      case 'thinking-coach':
        return <ThinkingCoach />;
      default:
        return <EnhancedDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <InstallPWA />
      <Toaster />
      
      {/* Voice Assistant */}
      <VoiceAssistant />
      
      {/* Floating Action Button */}
      <FloatingActionButton
        onBookRide={() => setCurrentPage('find-ride')}
        onBookDelivery={() => setCurrentPage('package-delivery')}
        onScheduleTrip={() => setCurrentPage('scheduled-trips')}
        onCorporateBooking={() => setCurrentPage('business')}
      />
      
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onNavigate={setCurrentPage}
          />

          <main className="flex-1 overflow-y-auto p-3 sm:p-6">
            <DemoBanner />
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LanguageProvider>
          <AuthProvider>
            <AIProvider>
              <AppContent />
            </AIProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}