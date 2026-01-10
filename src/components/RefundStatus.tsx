import { useState } from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface RefundRequest {
  id: string;
  tripId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'denied';
  reason: string;
  requestedAt: string;
  processedAt?: string;
  method: 'original' | 'wallet' | 'new_card';
}

interface RefundStatusProps {
  userId?: string;
  onContactSupport?: () => void;
}

export function RefundStatus({ userId, onContactSupport }: RefundStatusProps) {
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [refundRequests] = useState<RefundRequest[]>([
    {
      id: 'RFD-001234',
      tripId: 'TR-782934',
      amount: 25.50,
      status: 'completed',
      reason: 'Driver no-show',
      requestedAt: '2024-01-15',
      processedAt: '2024-01-17',
      method: 'original',
    },
    {
      id: 'RFD-001235',
      tripId: 'TR-785678',
      amount: 12.00,
      status: 'processing',
      reason: 'Cancellation fee waiver',
      requestedAt: '2024-01-18',
      method: 'original',
    },
    {
      id: 'RFD-001236',
      tripId: 'TR-789012',
      amount: 45.00,
      status: 'pending',
      reason: 'Quality issue',
      requestedAt: '2024-01-19',
      method: 'wallet',
    },
    {
      id: 'RFD-001237',
      tripId: 'TR-791234',
      amount: 8.50,
      status: 'denied',
      reason: 'Late cancellation',
      requestedAt: '2024-01-10',
      processedAt: '2024-01-12',
      method: 'original',
    },
  ]);

  const getStatusIcon = (status: RefundRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: RefundRequest['status']) => {
    const variants: Record<RefundRequest['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      denied: 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMethodIcon = (method: RefundRequest['method']) => {
    switch (method) {
      case 'original':
        return <CreditCard className="w-4 h-4" />;
      case 'wallet':
        return <Wallet className="w-4 h-4" />;
      case 'new_card':
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const totalRefunded = refundRequests
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = refundRequests
    .filter((r) => r.status === 'pending' || r.status === 'processing')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              <CardTitle>Refund Status</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onContactSupport}>
              Request Help
            </Button>
          </div>
          <CardDescription>
            Track your refund requests and payment history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Refunded</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalRefunded.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${pendingAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Processing Timeline */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Processing Timeline
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Refund Requested</span>
                  <span className="text-sm text-gray-500">Day 0</span>
                </div>
                <Progress value={25} className="h-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Under Review</span>
                  <span className="text-sm text-gray-500">1-2 days</span>
                </div>
                <Progress value={50} className="h-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Refund Processed</span>
                  <span className="text-sm text-gray-500">3-5 days</span>
                </div>
                <Progress value={75} className="h-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Funds Received</span>
                  <span className="text-sm text-gray-500">5-10 days</span>
                </div>
                <Progress value={100} className="h-1" />
              </div>
            </div>
          </div>

          {/* Refund Requests List */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Recent Requests
            </h3>
            <div className="space-y-2">
              {refundRequests.map((refund) => (
                <div
                  key={refund.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRefund(refund)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(refund.status)}
                    <div>
                      <p className="font-medium text-sm">{refund.id}</p>
                      <p className="text-xs text-gray-500">{refund.tripId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">${refund.amount.toFixed(2)}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getMethodIcon(refund.method)}
                        <span className="capitalize">{refund.method.replace('_', ' ')}</span>
                      </div>
                    </div>
                    {getStatusBadge(refund.status)}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund Details Dialog */}
      <Dialog open={!!selectedRefund} onOpenChange={() => setSelectedRefund(null)}>
        <DialogContent>
          {selectedRefund && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedRefund.status)}
                  Refund {selectedRefund.id}
                </DialogTitle>
                <DialogDescription>
                  Requested on {selectedRefund.requestedAt}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedRefund.amount.toFixed(2)}
                    </p>
                  </div>
                  {getStatusBadge(selectedRefund.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Trip ID</span>
                    <span className="font-mono text-sm">{selectedRefund.tripId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reason</span>
                    <span className="text-sm">{selectedRefund.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Refund Method</span>
                    <div className="flex items-center gap-1 text-sm">
                      {getMethodIcon(selectedRefund.method)}
                      <span className="capitalize">
                        {selectedRefund.method.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {selectedRefund.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Processed On</span>
                      <span className="text-sm">{selectedRefund.processedAt}</span>
                    </div>
                  )}
                </div>

                {selectedRefund.status === 'denied' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-medium text-red-700 dark:text-red-300">Refund Denied</h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      This refund request was denied because it doesn't meet our refund policy
                      criteria. You can appeal this decision by contacting support.
                    </p>
                  </div>
                )}

                {selectedRefund.status === 'processing' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">
                      Under Review
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Your refund request is being reviewed. We'll notify you once it's processed.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRefund(null)}>
                  Close
                </Button>
                {selectedRefund.status === 'denied' && (
                  <Button onClick={onContactSupport}>Appeal Decision</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
