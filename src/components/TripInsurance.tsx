import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, CheckCircle, AlertCircle, DollarSign, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface TripInsuranceProps {
  tripId?: string;
  coverageAmount?: number;
  premium?: number;
  status?: 'active' | 'expired' | 'pending';
  onPurchase?: (coverage: number) => void;
  onFileClaim?: () => void;
}

export function TripInsurance({
  tripId,
  coverageAmount = 10000,
  premium = 2.99,
  status = 'pending',
  onPurchase,
  onFileClaim,
}: TripInsuranceProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedCoverage, setSelectedCoverage] = useState(coverageAmount);

  const coverageOptions = [
    { amount: 5000, premium: 1.99 },
    { amount: 10000, premium: 2.99 },
    { amount: 25000, premium: 4.99 },
    { amount: 50000, premium: 7.99 },
  ];

  const handlePurchase = () => {
    onPurchase?.(selectedCoverage);
    setPurchaseDialogOpen(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-500" />
            <CardTitle className="text-lg">Trip Insurance</CardTitle>
          </div>
          <Badge
            variant={status === 'active' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}
          >
            {status === 'active' ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            ) : status === 'pending' ? (
              'Not Purchased'
            ) : (
              'Expired'
            )}
          </Badge>
        </div>
        <CardDescription>
          Protect your trip with comprehensive insurance coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'active' ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Coverage Amount</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  ${coverageAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Policy Number</span>
                <span className="font-mono text-sm">WTI-{tripId?.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Coverage Includes:</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Personal accident coverage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Trip cancellation protection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Baggage & personal items
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Emergency medical expenses
                </li>
              </ul>
            </div>

            <Button onClick={onFileClaim} variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              File a Claim
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <h4 className="font-medium">No Insurance Coverage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add insurance to protect your trip
              </p>
            </div>

            <div className="space-y-2">
              {coverageOptions.map((option) => (
                <div
                  key={option.amount}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCoverage === option.amount
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                  onClick={() => setSelectedCoverage(option.amount)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">${option.amount.toLocaleString()} Coverage</span>
                    <span className="text-green-600 dark:text-green-400">${option.premium}/trip</span>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => setPurchaseDialogOpen(true)} className="w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              Add Insurance - ${coverageOptions.find((o) => o.amount === selectedCoverage)?.premium}/trip
            </Button>

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
            >
              {showDetails ? (
                <>Hide coverage details <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show coverage details <ChevronDown className="w-4 h-4" /></>
              )}
            </button>

            {showDetails && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                <h4 className="font-medium mb-2">What's Covered:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Accidental death or permanent disability</li>
                  <li>• Emergency medical & dental treatment</li>
                  <li>• Trip cancellation (illness/death)</li>
                  <li>• Baggage delay or loss</li>
                  <li>• Personal liability</li>
                </ul>
                <h4 className="font-medium mt-3 mb-1">What's NOT Covered:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Pre-existing medical conditions</li>
                  <li>• Self-inflicted injuries</li>
                  <li>• War or terrorism</li>
                  <li>• Illegal activities</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Trip Insurance</DialogTitle>
            <DialogDescription>
              Confirm your insurance purchase for this trip
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span>Coverage Amount</span>
                <span className="font-bold">${selectedCoverage.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span>Premium</span>
                <span className="font-bold text-green-600">
                  ${coverageOptions.find((o) => o.amount === selectedCoverage)?.premium}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Insurance must be purchased before the trip begins
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase}>Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
