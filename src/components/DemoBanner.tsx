import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Demo Mode:</strong> This app is running with mock data. All bookings and trips are simulated for demonstration purposes.
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-orange-600 hover:text-orange-800 p-1 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}