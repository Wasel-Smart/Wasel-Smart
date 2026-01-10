import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AlertTriangle,
  Shield,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface SafetyReportProps {
  tripId?: string;
  onSubmit?: (report: SafetyReportData) => void;
  onContactSupport?: () => void;
  onEmergencyContact?: () => void;
}

interface SafetyReportData {
  type: SafetyIssueType;
  description: string;
  location?: string;
  time?: string;
  peopleInvolved?: string;
  evidence?: string[];
  contactPreference: 'phone' | 'email' | 'none';
}

type SafetyIssueType =
  | 'harassment'
  | 'unsafe_driving'
  | 'discrimination'
  | 'property_damage'
  | 'medical_emergency'
  | 'theft'
  | 'other';

const issueTypes: { type: SafetyIssueType; label: string; icon: string; severity: 'high' | 'medium' | 'low' }[] = [
  { type: 'harassment', label: 'Harassment or inappropriate behavior', icon: '🚫', severity: 'high' },
  { type: 'unsafe_driving', label: 'Unsafe driving', icon: '🚗', severity: 'high' },
  { type: 'discrimination', label: 'Discrimination', icon: '⚖️', severity: 'high' },
  { type: 'property_damage', label: 'Property damage', icon: '💔', severity: 'medium' },
  { type: 'medical_emergency', label: 'Medical emergency', icon: '🏥', severity: 'high' },
  { type: 'theft', label: 'Theft or lost items', icon: '🔒', severity: 'medium' },
  { type: 'other', label: 'Other safety concern', icon: '⚠️', severity: 'low' },
];

export function SafetyReport({
  tripId,
  onSubmit,
  onContactSupport,
  onEmergencyContact,
}: SafetyReportProps) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [report, setReport] = useState<SafetyReportData>({
    type: 'other',
    description: '',
    contactPreference: 'none',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = () => {
    onSubmit?.(report);
    setShowConfirmation(true);
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <>
      <Card className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-600">
            <Shield className="w-6 h-6" />
            <CardTitle>Safety Report</CardTitle>
          </div>
          <CardDescription>
            Report a safety concern from your trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="destructive"
              className="flex-col h-auto py-3"
              onClick={onEmergencyContact}
            >
              <Phone className="w-5 h-5 mb-1" />
              <span className="text-sm">Call 911</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3"
              onClick={onContactSupport}
            >
              <MessageSquare className="w-5 h-5 mb-1" />
              <span className="text-sm">Contact Support</span>
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          {/* Step 1: Issue Type */}
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="font-medium">What type of safety issue occurred?</h3>
              {issueTypes.map((issue) => (
                <button
                  key={issue.type}
                  type="button"
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    report.type === issue.type
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                  onClick={() => setReport({ ...report, type: issue.type })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{issue.icon}</span>
                      <span>{issue.label}</span>
                    </div>
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                  </div>
                </button>
              ))}
              <Button
                onClick={() => setStep(2)}
                disabled={!report.type}
                className="w-full mt-4"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>When did this happen?</Label>
                <Input
                  type="time"
                  value={report.time}
                  onChange={(e) => setReport({ ...report, time: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Where did this happen? (optional)</Label>
                <Input
                  placeholder="Enter location or address"
                  value={report.location}
                  onChange={(e) => setReport({ ...report, location: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Describe what happened</Label>
                <Textarea
                  placeholder="Please provide as much detail as possible..."
                  className="mt-1 min-h-[100px]"
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!report.description}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Would you like us to follow up with you?</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['phone', 'email', 'none'] as const).map((pref) => (
                    <Button
                      key={pref}
                      type="button"
                      variant={report.contactPreference === pref ? 'default' : 'outline'}
                      onClick={() => setReport({ ...report, contactPreference: pref })}
                      className="capitalize"
                    >
                      {pref === 'phone' && <Phone className="w-4 h-4 mr-1" />}
                      {pref === 'email' && <MessageSquare className="w-4 h-4 mr-1" />}
                      {pref}
                    </Button>
                  ))}
                </div>
              </div>

              {report.contactPreference !== 'none' && (
                <div>
                  <Label>
                    {report.contactPreference === 'phone' ? 'Phone number' : 'Email address'}
                  </Label>
                  <Input
                    placeholder={
                      report.contactPreference === 'phone'
                        ? '+1 (555) 000-0000'
                        : 'your@email.com'
                    }
                    className="mt-1"
                  />
                </div>
              )}

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Important
                </h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Your report will be reviewed within 24 hours. If this is an emergency,
                  please call 911 immediately.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Report Submitted
            </DialogTitle>
            <DialogDescription>
              Your safety report has been submitted successfully. Our safety team will
              review it and take appropriate action.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reference Number: <span className="font-mono font-bold">WSR-{Date.now().toString().slice(-8)}</span>
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowConfirmation(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
