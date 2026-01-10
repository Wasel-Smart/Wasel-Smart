import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Car, DollarSign, Shield, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface DriverAgreementProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export function DriverAgreement({ onAccept, onDecline }: DriverAgreementProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Car className="w-6 h-6 text-blue-500" />
          <CardTitle className="text-2xl font-bold">Driver Partner Agreement</CardTitle>
        </div>
        <CardDescription>
          Agreement between Wassel and Independent Driver Partners
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <section>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Introduction
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              This Driver Partner Agreement ("Agreement") is entered into between Wassel Inc.
              ("Wassel") and you ("Driver" or "Partner"). By accepting rides through the Wassel
              platform, you agree to be bound by the terms of this Agreement.
            </p>
            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                ⚠️ Important: This is an independent contractor relationship. Drivers are not
                employees of Wassel.
              </p>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">1. Driver Requirements</h3>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Eligibility Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Must be at least 21 years of age</li>
                  <li>Valid driver's license with at least 1 year of driving experience</li>
                  <li>Clean driving record (no major violations in past 3 years)</li>
                  <li>Vehicle model year 2010 or newer</li>
                  <li>Valid vehicle registration and insurance</li>
                  <li>Background check clearance</li>
                  <li>Smartphone with compatible OS</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">2. Vehicle Requirements</h3>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Vehicle Standards</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>4-door sedan, SUV, or minivan in good condition</li>
                  <li>Working air conditioning</li>
                  <li>No cosmetic damage or excessive wear</li>
                  <li>Passes annual vehicle inspection</li>
                  <li>Valid registration and insurance in driver's name</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              3. Fare Structure & Earnings
            </h3>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">How You Earn</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Base fare + Time + Distance for each completed ride</li>
                  <li>100% of tips from passengers</li>
                  <li>Promotional bonuses and surge pricing</li>
                  <li>Waiting time fees for delays超过 2 minutes</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                  Current Platform Fee
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Wassel retains a platform fee of 15-25% of the ride fare (varies by region).
                  This fee covers payment processing, app maintenance, and customer support.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Payout Schedule</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Instant cashout available (fees may apply)</li>
                  <li>Standard weekly payout every Monday</li>
                  <li>Minimum payout: $25</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">4. Your Responsibilities</h3>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Maintain high-quality service standards</li>
                  <li>Keep vehicle clean and in safe operating condition</li>
                  <li>Accept rides within your service area</li>
                  <li>Communicate professionally with passengers</li>
                  <li>Follow all traffic laws and regulations</li>
                  <li>Report accidents or incidents within 24 hours</li>
                  <li>Maintain accurate and updated profile information</li>
                  <li>Complete required training modules</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              5. Insurance & Liability
            </h3>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                  ⚠️ Insurance Requirement
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drivers must maintain personal auto insurance that meets or exceeds their
                  state's minimum requirements. Commercial insurance is recommended but not
                  required.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Wassel Coverage</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Contingent liability coverage during active trips</li>
                  <li>Comprehensive and collision coverage (subject to deductible)</li>
                  <li>Uninsured/underinsured motorist protection</li>
                  <li>Medical expense coverage up to $1 million</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">6. Termination</h3>
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Either party may terminate this Agreement at any time. Wassel may terminate or
                suspend your account for violations of this Agreement, safety incidents, fraud,
                or poor customer ratings. Drivers may deactivate their account through the app.
              </p>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">7. Tax Information</h3>
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                As an independent contractor, you are responsible for paying all applicable
                taxes on your earnings. Wassel will provide a 1099-NEC form if you earn $600
                or more in a calendar year. We recommend consulting with a tax professional.
              </p>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Agreement Confirmation</h3>
            <div className="mt-3 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I have read and agree to the Driver Partner Agreement
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I understand this is an independent contractor relationship
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I meet all eligibility and vehicle requirements
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to receive communications from Wassel regarding my partnership
                  </span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-gray-700">
          <Button onClick={onAccept} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            I Agree and Accept
          </Button>
          <Button onClick={onDecline} variant="outline" className="flex-1">
            <AlertCircle className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
