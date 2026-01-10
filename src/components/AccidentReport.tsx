import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  User,
  FileText,
  Upload,
  CheckCircle,
  ChevronRight,
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

interface AccidentReportProps {
  tripId?: string;
  onSubmit?: (report: AccidentReportData) => void;
  onEmergencyServices?: () => void;
}

interface AccidentReportData {
  date: string;
  time: string;
  location: string;
  description: string;
  injuries: boolean;
  injuryDescription?: string;
  policeReportNumber?: string;
  photos: File[];
  partiesInvolved: number;
  vehicleDamage: string;
  witnessPresent: boolean;
  witnessContact?: string;
}

export function AccidentReport({ tripId, onSubmit, onEmergencyServices }: AccidentReportProps) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [report, setReport] = useState<AccidentReportData>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: '',
    description: '',
    injuries: false,
    partiesInvolved: 0,
    vehicleDamage: '',
    witnessPresent: false,
    photos: [],
  });

  const handleSubmit = () => {
    onSubmit?.(report);
    setShowSuccess(true);
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Clock },
    { number: 2, title: 'Location', icon: MapPin },
    { number: 3, title: 'Details', icon: FileText },
    { number: 4, title: 'Review', icon: CheckCircle },
  ];

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <CardTitle>Accident Report</CardTitle>
          </div>
          <CardDescription>
            Report an accident or incident that occurred during your trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    step >= s.number ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= s.number
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Emergency Services
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  If this is an emergency, please call 911 first.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={onEmergencyServices}
                >
                  Call 911
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accidentDate">Date of Accident</Label>
                  <Input
                    id="accidentDate"
                    type="date"
                    value={report.date}
                    onChange={(e) => setReport({ ...report, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="accidentTime">Time</Label>
                  <Input
                    id="accidentTime"
                    type="time"
                    value={report.time}
                    onChange={(e) => setReport({ ...report, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="partiesInvolved">Number of Parties Involved</Label>
                <Input
                  id="partiesInvolved"
                  type="number"
                  min="0"
                  value={report.partiesInvolved}
                  onChange={(e) =>
                    setReport({ ...report, partiesInvolved: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={report.injuries}
                    onChange={(e) => setReport({ ...report, injuries: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  Were there any injuries?
                </Label>
                {report.injuries && (
                  <Textarea
                    className="mt-2"
                    placeholder="Describe the injuries..."
                    value={report.injuryDescription}
                    onChange={(e) =>
                      setReport({ ...report, injuryDescription: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Location of Accident</Label>
                <Input
                  id="location"
                  placeholder="Enter street address or intersection"
                  value={report.location}
                  onChange={(e) => setReport({ ...report, location: e.target.value })}
                />
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Current Location</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Using GPS to get your current location...
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  Use Current Location
                </Button>
              </div>

              <div>
                <Label htmlFor="policeReport">Police Report Number (if filed)</Label>
                <Input
                  id="policeReport"
                  placeholder="Enter police report number"
                  value={report.policeReportNumber}
                  onChange={(e) =>
                    setReport({ ...report, policeReportNumber: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description of Accident</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe what happened in detail..."
                  className="min-h-[120px]"
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="vehicleDamage">Vehicle Damage Description</Label>
                <Textarea
                  id="vehicleDamage"
                  placeholder="Describe the damage to vehicles involved..."
                  value={report.vehicleDamage}
                  onChange={(e) => setReport({ ...report, vehicleDamage: e.target.value })}
                />
              </div>

              <div>
                <Label>Upload Photos (if available)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop photos here or click to upload
                  </p>
                  <input type="file" multiple className="hidden" id="photoUpload" />
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <label htmlFor="photoUpload">Select Files</label>
                  </Button>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={report.witnessPresent}
                    onChange={(e) =>
                      setReport({ ...report, witnessPresent: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  Were there any witnesses?
                </Label>
                {report.witnessPresent && (
                  <Input
                    className="mt-2"
                    placeholder="Witness contact information"
                    value={report.witnessContact}
                    onChange={(e) =>
                      setReport({ ...report, witnessContact: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-3">Review Your Report</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                    <span>{report.date} at {report.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location</span>
                    <span>{report.location || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Injuries</span>
                    <span>{report.injuries ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Parties Involved</span>
                    <span>{report.partiesInvolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Police Report</span>
                    <span>{report.policeReportNumber || 'Not filed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Witnesses</span>
                    <span>{report.witnessPresent ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-300">Important</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  By submitting this report, you confirm that the information provided is
                  accurate to the best of your knowledge. False reporting may result in
                  account termination.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(Math.min(4, step + 1))}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Report Submitted
            </DialogTitle>
            <DialogDescription>
              Your accident report has been submitted successfully. Our team will review it
              and contact you within 24-48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-2">Report Reference Number</h4>
            <p className="font-mono text-lg">WAC-{Date.now().toString().slice(-8)}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
