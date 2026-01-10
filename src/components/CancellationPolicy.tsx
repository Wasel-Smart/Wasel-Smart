import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Clock,
  DollarSign,
  Car,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
} from 'lucide-react';

interface CancellationPolicyProps {
  onViewRates?: () => void;
  onContactSupport?: () => void;
}

export function CancellationPolicy({ onViewRates, onContactSupport }: CancellationPolicyProps) {
  const cancellationRules = [
    {
      timeframe: 'More than 5 minutes before pickup',
      refund: '100%',
      fee: '$0',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      timeframe: '2-5 minutes before pickup',
      refund: '90%',
      fee: '10% of fare (min $3)',
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      timeframe: 'Less than 2 minutes before pickup',
      refund: '50%',
      fee: '50% of fare (min $5)',
      icon: AlertCircle,
      color: 'text-orange-500',
    },
    {
      timeframe: 'After driver arrives',
      refund: '25%',
      fee: '75% of fare (min $8)',
      icon: Car,
      color: 'text-red-500',
    },
    {
      timeframe: 'Driver waits more than 5 minutes',
      refund: '0%',
      fee: '100% of fare + wait fee',
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  const specialCircumstances = [
    {
      title: 'Driver No-Show',
      description: 'If driver doesn\'t arrive within 10 minutes of ETA',
      refund: '100% + $10 credit',
    },
    {
      title: 'Vehicle Unacceptable',
      description: 'Vehicle is unsafe, dirty, or doesn\'t match description',
      refund: '100%',
    },
    {
      title: 'Wrong Driver',
      description: 'Assigned driver is different from who arrives',
      refund: '100%',
    },
    {
      title: 'Safety Concern',
      description: 'Any safety issue during the trip',
      refund: '100%',
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <XCircle className="w-6 h-6 text-blue-500" />
          <CardTitle>Cancellation Policy</CardTitle>
        </div>
        <CardDescription>
          Understand our cancellation fees and refund policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cancellation Timeline */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Cancellation Timeline
          </h3>
          <div className="space-y-2">
            {cancellationRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <rule.icon className={`w-5 h-5 ${rule.color}`} />
                  <span className="text-sm">{rule.timeframe}</span>
                </div>
                <div className="text-right">
                  <Badge variant={rule.refund === '100%' ? 'default' : 'secondary'}>
                    {rule.refund} refund
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{rule.fee} fee</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Trips */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300">
                Scheduled Trips
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Cancellations made more than 2 hours before scheduled pickup: No fee
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cancellations made 1-2 hours before: 50% of estimated fare
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cancellations made less than 1 hour before: 75% of estimated fare
              </p>
            </div>
          </div>
        </div>

        {/* Special Circumstances */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Info className="w-5 h-5" />
            Special Circumstances (Full Refund)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialCircumstances.map((item, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                <p className="text-xs text-green-600 font-medium mt-1">{item.refund}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="font-medium text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Important Notes
          </h4>
          <ul className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 space-y-1 list-disc list-inside">
            <li>Cancellation fees help compensate drivers for their time</li>
            <li>Refunds are processed to your original payment method</li>
            <li>Processing time: 5-10 business days for cards, 3-5 days for wallets</li>
            <li>Repeated cancellations may affect your account standing</li>
            <li>Emergency cancellations are reviewed case by case</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-gray-700">
          <Button onClick={onViewRates} variant="outline" className="flex-1">
            <DollarSign className="w-4 h-4 mr-2" />
            View My Rates
          </Button>
          <Button onClick={onContactSupport} className="flex-1">
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
