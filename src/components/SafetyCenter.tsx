import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import {
  Shield,
  AlertTriangle,
  Phone,
  Users,
  Share2,
  PhoneCall,
  MessageSquare,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface SafetySettings {
  autoShareLocation: boolean;
  emergencyAlerts: boolean;
  nightModeAlert: boolean;
  tripSharing: boolean;
}

export function SafetyCenter() {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Sarah Ahmed',
      phone: '+971501234567',
      relationship: 'Sister'
    },
    {
      id: '2',
      name: 'Mohammed Ali',
      phone: '+971559876543',
      relationship: 'Brother'
    }
  ]);

  const [settings, setSettings] = useState<SafetySettings>({
    autoShareLocation: true,
    emergencyAlerts: true,
    nightModeAlert: true,
    tripSharing: true
  });

  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id'>>({
    name: '',
    phone: '',
    relationship: ''
  });

  const isValidPhone = (phone: string) =>
    /^\+?[0-9]{7,15}$/.test(phone.replace(/\s/g, ''));

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isValidPhone(newContact.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const contact: EmergencyContact = {
      id: crypto.randomUUID(),
      ...newContact
    };

    setEmergencyContacts(prev => [...prev, contact]);
    setNewContact({ name: '', phone: '', relationship: '' });
    toast.success('Emergency contact added');
  };

  const handleRemoveContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    toast.success('Contact removed');
  };

  const handleSOS = () => {
    toast.error(
      'Emergency SOS activated! Alerting your emergency contacts and sharing your location.',
      { duration: 5000 }
    );

    console.log('SOS sent to:', emergencyContacts);
  };

  const handleShareTrip = async () => {
    const link = `https://wassel.app/track/trip-${Date.now()}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success('Trip link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="size-8 text-primary" />
        <div>
          <h1>Safety Center</h1>
          <p className="text-muted-foreground">
            Manage your safety features and emergency contacts
          </p>
        </div>
      </div>

      {/* SOS */}
      <Card className="p-6 border-destructive bg-destructive/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" /> Emergency SOS
            </h3>
            <p className="text-sm text-muted-foreground">
              Instantly alert contacts and share your location
            </p>
          </div>
          <Button
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleSOS}
          >
            Activate SOS
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card
          className="p-4 text-center cursor-pointer hover:shadow-md"
          onClick={handleShareTrip}
        >
          <Share2 className="mx-auto mb-2 text-primary" />
          <h4>Share Trip</h4>
          <p className="text-sm text-muted-foreground">
            Share your trip with trusted contacts
          </p>
        </Card>

        <Card className="p-4 text-center hover:shadow-md">
          <PhoneCall className="mx-auto mb-2 text-secondary" />
          <h4>Emergency Call</h4>
          <p className="text-sm text-muted-foreground">
            Call emergency services
          </p>
        </Card>

        <Card className="p-4 text-center hover:shadow-md">
          <MessageSquare className="mx-auto mb-2 text-accent" />
          <h4>Safety Tips</h4>
          <p className="text-sm text-muted-foreground">
            Learn how to stay safe
          </p>
        </Card>
      </div>

      {/* Emergency Contacts */}
      <Card className="p-6">
        <h3 className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-primary" /> Emergency Contacts
        </h3>

        <div className="space-y-3 mb-4">
          {emergencyContacts.map(contact => (
            <div
              key={contact.id}
              className="flex items-center gap-3 bg-muted p-3 rounded-lg"
            >
              <Phone className="text-primary" />
              <div className="flex-1">
                <p className="font-semibold">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {contact.relationship}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveContact(contact.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-3 mt-4">
          <Input
            placeholder="Name *"
            value={newContact.name}
            onChange={e =>
              setNewContact(prev => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            placeholder="Phone *"
            value={newContact.phone}
            onChange={e =>
              setNewContact(prev => ({ ...prev, phone: e.target.value }))
            }
          />
          <Input
            placeholder="Relationship"
            value={newContact.relationship}
            onChange={e =>
              setNewContact(prev => ({ ...prev, relationship: e.target.value }))
            }
          />

          <Button onClick={handleAddContact}>
            <Plus className="mr-2 size-4" /> Add Contact
          </Button>
        </div>
      </Card>

      {/* Safety Settings */}
      <Card className="p-6">
        <h3 className="flex items-center gap-2 mb-4">
          <CheckCircle className="size-5 text-primary" /> Safety Settings
        </h3>

        {(Object.entries(settings) as Array<
          [keyof SafetySettings, boolean]
        >).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between py-2"
          >
            <span className="capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </span>

            <Switch
              checked={value}
              onCheckedChange={(checked: boolean) =>
                setSettings(prev => ({ ...prev, [key]: checked }))
              }
            />
          </div>
        ))}
      </Card>
    </div>
  );
}
