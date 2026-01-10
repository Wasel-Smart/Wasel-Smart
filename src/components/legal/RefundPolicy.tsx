import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, CreditCard, DollarSign, Clock, Shield, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface RefundPolicyProps {
  onBack?: () => void;
}

export function RefundPolicy({ onBack }: RefundPolicyProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-6 h-6 text-green-500" />
          <CardTitle className="text-2xl font-bold">Refund Policy</CardTitle>
        </div>
        <CardDescription>
          Our commitment to fair and transparent refunds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <section>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Overview
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              At Wassel, we strive to provide fair and transparent refund policies. This document
              outlines our guidelines for refunds on rides, deliveries, and subscriptions.
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Cancellation Timeframes & Refunds
            </h3>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong>Ride Cancellation - More than 5 minutes before pickup</strong>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Full Refund
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If you cancel more than 5 minutes before the scheduled pickup time, you'll
                  receive a full refund to your original payment method.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong>Ride Cancellation - Less than 5 minutes before pickup</strong>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Partial Refund
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cancellations within 5 minutes of pickup may be subject to a cancellation fee
                  of up to $5 or the minimum fare, whichever is higher.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong>Driver No-Show</strong>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Full Refund + Credit
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If a driver doesn't arrive within 10 minutes of the estimated arrival time,
                  you'll receive a full refund plus a $10 credit for your next ride.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong>Package Delivery - Before pickup</strong>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Full Refund
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full refund if the package hasn't been picked up yet.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong>Package Delivery - After pickup but before delivery</strong>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Partial Refund
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Refund of delivery fee only. Minimum fare may apply.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Refund Processing
            </h3>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Processing Timeframes</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Credit/Debit Cards: 5-10 business days</li>
                  <li>Digital Wallets (Apple Pay, Google Pay): 3-5 business days</li>
                  <li>Wassel Credits: Immediate</li>
                  <li>Bank Transfers: 7-14 business days</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Special Circumstances
            </h3>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Quality Issues
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If you experience issues with ride quality, vehicle cleanliness, or driver
                  behavior, you may be eligible for a partial or full refund. Contact our
                  Support team within 48 hours of the trip.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Safety Incidents
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  In the rare event of a safety incident, we conduct a thorough investigation.
                  Eligible refunds will be processed immediately upon confirmation.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Technical Issues
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If you were charged but the ride wasn't completed due to app issues, you'll
                  receive a full refund. Please contact support with your trip details.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">How to Request a Refund</h3>
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Open the Wassel app and go to "My Trips"</li>
                <li>Select the trip you want to request a refund for</li>
                <li>Tap "Help" and then "Report an Issue"</li>
                <li>Select the reason for your refund request</li>
                <li>Provide any relevant details or photos</li>
                <li>Submit your request - our team will respond within 24-48 hours</li>
              </ol>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Subscription Refunds</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Wassel Plus and Wassel Premium subscriptions can be cancelled at any time.
              Refunds for unused portions are calculated on a pro-rated basis for annual plans.
              Monthly plans will not be charged for the next billing cycle upon cancellation.
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              If you have questions about this Refund Policy or need assistance with a refund
              request, please contact us at:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Email: refunds@wassel.com</li>
              <li>Phone: 1-800-WASSEL (927-735)</li>
              <li>In-app: Settings → Help → Contact Support</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-start pt-4 border-t dark:border-gray-700">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Legal
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
