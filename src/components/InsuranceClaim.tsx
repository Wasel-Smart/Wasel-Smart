import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  ChevronRight,
  Search,
  Eye,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface Claim {
  id: string;
  tripId: string;
  type: 'accident' | 'cancellation' | 'damage' | 'medical';
  amount: number;
  status: 'pending' | 'approved' | 'denied' | 'processing';
  date: string;
  description: string;
}

interface InsuranceClaimProps {
  existingClaims?: Claim[];
  onNewClaim?: (claim: Partial<Claim>) => void;
}

export function InsuranceClaim({ existingClaims = [], onNewClaim }: InsuranceClaimProps) {
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [newClaim, setNewClaim] = useState<{
    type: Claim['type'] | '';
    amount: string;
    description: string;
    tripId: string;
  }>({
    type: '',
    amount: '',
    description: '',
    tripId: '',
  });

  const mockClaims: Claim[] = [
    {
      id: 'WCL-001234',
      tripId: 'TR-782934',
      type: 'accident',
      amount: 2500,
      status: 'pending',
      date: '2024-01-15',
      description: 'Vehicle damage from collision at intersection',
    },
    {
      id: 'WCL-001233',
      tripId: 'TR-778291',
      type: 'cancellation',
      amount: 45,
      status: 'approved',
      date: '2024-01-10',
      description: 'Driver no-show after 15 minute wait',
    },
    {
      id: 'WCL-001232',
      tripId: 'TR-765432',
      type: 'damage',
      amount: 150,
      status: 'denied',
      date: '2024-01-05',
      description: 'Lost baggage during trip',
    },
  ];

  const claims = existingClaims.length > 0 ? existingClaims : mockClaims;

  const handleSubmitClaim = () => {
    if (!newClaim.type || !newClaim.amount) return;
    const claimData: Partial<Claim> = {
      type: newClaim.type as Claim['type'],
      amount: parseFloat(newClaim.amount),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      description: newClaim.description,
      tripId: newClaim.tripId,
    };
    onNewClaim?.(claimData);
    setShowNewClaim(false);
    setNewClaim({ type: '', amount: '', description: '', tripId: '' });
  };

  const getStatusBadge = (status: Claim['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      denied: 'bg-red-100 text-red-700',
      processing: 'bg-blue-100 text-blue-700',
    };
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      denied: AlertCircle,
      processing: FileText,
    };
    const Icon = icons[status];

    return (
      <Badge className={variants[status]}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: Claim['type']) => {
    const icons = {
      accident: AlertCircle,
      cancellation: X,
      damage: FileText,
      medical: DollarSign,
    };
    return icons[type];
  };

  const totalApproved = claims
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalPending = claims
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Insurance Claims
              </CardTitle>
              <CardDescription>
                View and manage your insurance claims
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewClaim(true)}>
              <FileText className="w-4 h-4 mr-2" />
              New Claim
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Claims</p>
              <p className="text-2xl font-bold">{claims.length}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-600">${totalApproved.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString()}</p>
            </div>
          </div>

          {/* Claims List */}
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => setSelectedClaim(claim)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{claim.id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {claim.type.charAt(0).toUpperCase() + claim.type.slice(1)} - {claim.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">${claim.amount.toLocaleString()}</span>
                    {getStatusBadge(claim.status)}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Claim Dialog */}
      <Dialog open={showNewClaim} onOpenChange={setShowNewClaim}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>File an Insurance Claim</DialogTitle>
            <DialogDescription>
              Submit a claim for insurance coverage related to your trip
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="claimTripId">Trip ID</Label>
              <Input
                id="claimTripId"
                placeholder="Enter trip ID (e.g., TR-123456)"
                value={newClaim.tripId}
                onChange={(e) => setNewClaim({ ...newClaim, tripId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="claimType">Claim Type</Label>
              <Select
                value={newClaim.type}
                  onValueChange={(value: string) =>
                    setNewClaim({ ...newClaim, type: value as Claim['type'] })
                  }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select claim type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="cancellation">Cancellation</SelectItem>
                  <SelectItem value="damage">Property Damage</SelectItem>
                  <SelectItem value="medical">Medical Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="claimAmount">Claim Amount ($)</Label>
              <Input
                id="claimAmount"
                type="number"
                placeholder="Enter amount you're claiming"
                value={newClaim.amount}
                onChange={(e) => setNewClaim({ ...newClaim, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="claimDescription">Description</Label>
              <Textarea
                id="claimDescription"
                placeholder="Describe the incident in detail..."
                className="min-h-[100px]"
                value={newClaim.description}
                onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Documents</Label>
              <div className="mt-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload photos, receipts, or police reports
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Select Files
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewClaim(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitClaim} disabled={!newClaim.type || !newClaim.amount}>
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Details Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Claim Details
            </DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Claim ID</p>
                  <p className="font-mono font-bold text-lg">{selectedClaim.id}</p>
                </div>
                {getStatusBadge(selectedClaim.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Trip ID</p>
                  <p className="font-mono">{selectedClaim.tripId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Claim Amount</p>
                  <p className="font-bold text-xl text-green-600">
                    ${selectedClaim.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="capitalize">{selectedClaim.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date Filed</p>
                  <p>{selectedClaim.date}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {selectedClaim.description}
                </p>
              </div>

              {selectedClaim.status === 'pending' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your claim is currently being reviewed. We typically process claims within
                    5-7 business days.
                  </p>
                </div>
              )}

              {selectedClaim.status === 'denied' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This claim was denied. Reason: Coverage does not apply to this incident.
                    You may appeal this decision by contacting support.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedClaim(null)}>
              Close
            </Button>
            {selectedClaim?.status === 'denied' && (
              <Button>Appeal Decision</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
