import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

// Components (keep most imports static for clarity)
const EnhancedDashboard = lazy(() => import('./components/premium/EnhancedDashboard'));
const FindRide = lazy(() => import('./components/FindRide'));
const OfferRide = lazy(() => import('./components/OfferRide'));
import { MyTrips } from './components/MyTrips';
import { RecurringTrips } from './components/RecurringTrips';
const Messages = lazy(() => import('./components/Messages'));
const Favorites = lazy(() => import('./components/Favorites'));
const Payments = lazy(() => import('./components/Payments'));
const Settings = lazy(() => import('./components/Settings'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const VerificationCenter = lazy(() => import('./components/VerificationCenter'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));
const ReferralProgram = lazy(() => import('./components/ReferralProgram'));
const BusinessAccounts = lazy(() => import('./components/BusinessAccounts'));
import { Favorites } from './components/Favorites';
import { Payments } from './components/Payments';
const TripAnalytics = lazy(() => import('./components/TripAnalytics'));
import { SafetyCenter } from './components/SafetyCenter';
import { VerificationCenter } from './components/VerificationCenter';
import { Settings } from './components/Settings';
import { NotificationCenter } from './components/NotificationCenter';
import { UserProfile } from './components/UserProfile';
import { ReferralProgram } from './components/ReferralProgram';
import { BusinessAccounts } from './components/BusinessAccounts';
const PackageDelivery = lazy(() => import('./components/PackageDelivery'));
const ScooterRentals = lazy(() => import('./components/ScooterRentals'));
const FreightShipping = lazy(() => import('./components/FreightShipping'));
import { PetTransport } from './components/PetTransport';
import { SchoolTransport } from './components/SchoolTransport';
const MedicalTransport = lazy(() => import('./components/MedicalTransport'));
const CarRentals = lazy(() => import('./components/CarRentals'));
const ShuttleService = lazy(() => import('./components/ShuttleService'));
const LuxuryRides = lazy(() => import('./components/LuxuryRides'));
const DriverEarnings = lazy(() => import('./components/DriverEarnings'));
import { DisputeCenter } from './components/DisputeCenter';
import { PaymentMethods } from './components/PaymentMethods';
import { ScheduledTrips } from './components/ScheduledTrips';
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
import { TermsOfService } from './components/legal/TermsOfService';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { CookiePolicy } from './components/legal/CookiePolicy';
import { RefundPolicy } from './components/legal/RefundPolicy';
import { DriverAgreement } from './components/legal/DriverAgreement';
import { CurrencySelector } from './components/CurrencySelector';
import { EnhancedRating } from './components/EnhancedRating';
import { SafetyReport } from './components/SafetyReport';
import { DriverBadges } from './components/DriverBadges';
import { CancellationPolicy } from './components/CancellationPolicy';
import { RefundStatus } from './components/RefundStatus';
import { TripInsurance } from './components/TripInsurance';
import { AccidentReport } from './components/AccidentReport';
import { InsuranceClaim } from './components/InsuranceClaim';
import { RideSocial } from './components/social/RideSocial';
const DriverEconomySystem = lazy(() => import('./components/driver/DriverEconomySystem'));
const LiveTrip = lazy(() => import('./components/LiveTrip'));
const TripExport = lazy(() => import('./components/TripExport'));
import { CancelTrip } from './components/CancelTrip';
const PromoCodesManager = lazy(() => import('./components/PromoCodesManager'));
const PopularRoutes = lazy(() => import('./components/PopularRoutes'));
import { WorkflowGuide } from './components/WorkflowGuide';
import { ThinkingCoach } from './components/ThinkingCoach';
import withNavigation from './utils/withNavigation';

export function AppRouter() {
    // Wrap components that need onNavigate
    const Dashboard = withNavigation(EnhancedDashboard) as React.ComponentType;
    const PopularRoutesWrapped = withNavigation(PopularRoutes) as React.ComponentType;

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />

                {/* Core Features */}
                <Route path="/find-ride" element={<Suspense fallback={<div>Loading…</div>}><FindRide /></Suspense>} />
                <Route path="/carpool" element={<Navigate to="/find-ride" replace />} />
                <Route path="/offer-ride" element={<Suspense fallback={<div>Loading…</div>}><OfferRide /></Suspense>} />
                <Route path="/my-trips" element={<MyTrips />} />
                <Route path="/recurring" element={<RecurringTrips />} />
                <Route path="/messages" element={<Suspense fallback={<div>Loading messages…</div>}><Messages /></Suspense>} />
                <Route path="/messages/:id" element={<Suspense fallback={<div>Loading messages…</div>}><Messages /></Suspense>} />
                <Route path="/trips/:id" element={<Navigate to="/my-trips" replace />} /> {/* Todo: Direct trip details */}

                {/* Account & Settings */}
                <Route path="/favorites" element={<Suspense fallback={<div>Loading…</div>}><Favorites /></Suspense>} />
                <Route path="/payments" element={<Suspense fallback={<div>Loading…</div>}><Payments /></Suspense>} />
                <Route path="/payment-methods" element={<PaymentMethods />} />
                <Route path="/analytics" element={<Suspense fallback={<div>Loading analytics…</div>}><TripAnalytics /></Suspense>} />
                <Route path="/safety" element={<SafetyCenter />} />
                <Route path="/verification" element={<Suspense fallback={<div>Loading…</div>}><VerificationCenter /></Suspense>} />
                <Route path="/settings" element={<Suspense fallback={<div>Loading…</div>}><Settings /></Suspense>} />
                <Route path="/notifications" element={<Suspense fallback={<div>Loading…</div>}><NotificationCenter /></Suspense>} />
                <Route path="/profile" element={<Suspense fallback={<div>Loading profile…</div>}><UserProfile /></Suspense>} />
                <Route path="/profile/:id" element={<Suspense fallback={<div>Loading profile…</div>}><UserProfile /></Suspense>} />
                <Route path="/referrals" element={<Suspense fallback={<div>Loading…</div>}><ReferralProgram /></Suspense>} />
                <Route path="/business" element={<Suspense fallback={<div>Loading…</div>}><BusinessAccounts /></Suspense>} />

                {/* Services */}
                <Route path="/package-delivery" element={<Suspense fallback={<div>Loading service…</div>}><PackageDelivery /></Suspense>} />
                <Route path="/scooters" element={<Suspense fallback={<div>Loading service…</div>}><ScooterRentals /></Suspense>} />
                <Route path="/freight" element={<Suspense fallback={<div>Loading service…</div>}><FreightShipping /></Suspense>} />
                <Route path="/pets" element={<PetTransport />} />
                <Route path="/school" element={<SchoolTransport />} />
                <Route path="/medical" element={<Suspense fallback={<div>Loading service…</div>}><MedicalTransport /></Suspense>} />
                <Route path="/car-rentals" element={<Suspense fallback={<div>Loading service…</div>}><CarRentals /></Suspense>} />
                <Route path="/shuttle" element={<Suspense fallback={<div>Loading service…</div>}><ShuttleService /></Suspense>} />
                <Route path="/luxury" element={<Suspense fallback={<div>Loading service…</div>}><LuxuryRides /></Suspense>} />

                {/* Driver */}
                <Route path="/driver-earnings" element={<Suspense fallback={<div>Loading earnings…</div>}><DriverEarnings /></Suspense>} />
                <Route path="/dispute-center" element={<DisputeCenter />} />
                <Route path="/scheduled-trips" element={<ScheduledTrips />} />
                <Route path="/driver-dashboard" element={<Suspense fallback={<div>Loading driver dashboard…</div>}><DriverEconomySystem /></Suspense>} />
                <Route path="/driver-badges" element={<DriverBadges />} />
                <Route path="/start-trip" element={<Navigate to="/live-trip" />} />
                <Route
                    path="/live-trip"
                    element={
                        <Suspense fallback={<div>Loading trip…</div>}>
                            <LiveTrip
                                tripId="demo-trip-id"
                                driverId="demo-driver-id"
                                driverInfo={{
                                    name: 'Ahmed Khan',
                                    photo: '',
                                    rating: 4.8,
                                    vehicleModel: 'Toyota Camry',
                                    vehiclePlate: 'ABC 1234',
                                    vehicleColor: 'Silver',
                                }}
                                pickupLocation={{
                                    address: '123 Main Street, Amman',
                                    coordinates: { lat: 31.9539, lng: 35.9106 },
                                }}
                                dropoffLocation={{
                                    address: '456 Queen Alia Street, Amman',
                                    coordinates: { lat: 31.9731, lng: 35.8433 },
                                }}
                            />
                        </Suspense>
                    }
                />

                {/* Admin */}
                <Route path="/admin-dashboard" element={<Suspense fallback={<div>Loading admin…</div>}><AdminDashboard /></Suspense>} />

                {/* Legal */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/driver-agreement" element={<DriverAgreement />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />

                {/* Misc */}
                <Route path="/currency-selector" element={<CurrencySelector />} />
                <Route path="/enhanced-rating" element={<EnhancedRating />} />
                <Route path="/safety-report" element={<SafetyReport />} />
                <Route path="/refund-status" element={<RefundStatus />} />
                <Route path="/trip-insurance" element={<TripInsurance />} />
                <Route path="/accident-report" element={<AccidentReport />} />
                <Route path="/insurance-claim" element={<InsuranceClaim />} />
                <Route path="/ride-social" element={<RideSocial />} />
                <Route path="/trip-export" element={<Suspense fallback={<div>Loading…</div>}><TripExport /></Suspense>} />
                <Route
                    path="/cancel-trip"
                    element={withNavigation(CancelTrip, {
                        tripId: 'demo-trip-id',
                        tripStatus: 'waiting',
                        fare: 25.0,
                        onCancel: () => console.log('Cancelled'),
                        onClose: () => {},
                    })}
                />
                <Route path="/promo-codes" element={<Suspense fallback={<div>Loading…</div>}><PromoCodesManager /></Suspense>} />
                <Route path="/popular-routes" element={<Suspense fallback={<div>Loading…</div>}><PopularRoutesWrapped /></Suspense>} />
                <Route path="/workflow-guide" element={<WorkflowGuide steps={[]} />} />
                <Route path="/thinking-coach" element={<ThinkingCoach />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
