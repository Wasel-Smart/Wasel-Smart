import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Cookie, Shield, Settings, X } from 'lucide-react';

interface CookiePolicyProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export function CookiePolicy({ onAccept, onReject }: CookiePolicyProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  const handleAcceptAll = () => {
    setPreferences({ necessary: true, functional: true, analytics: true, marketing: true });
    savePreferences();
    onAccept?.();
  };

  const handleRejectAll = () => {
    setPreferences({ necessary: true, functional: false, analytics: false, marketing: false });
    savePreferences();
    onReject?.();
  };

  const handleSavePreferences = () => {
    savePreferences();
    setShowSettings(false);
    onAccept?.();
  };

  const savePreferences = () => {
    // Save to localStorage or send to backend
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
            <Cookie className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Cookie Policy</CardTitle>
        <CardDescription>
          We use cookies to enhance your experience on Wassel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-lg font-semibold">What Are Cookies?</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Cookies are small text files stored on your device when you visit our website.
            They help us provide you with a better experience and understand how you use our services.
          </p>

          <h3 className="text-lg font-semibold mt-4">Types of Cookies We Use</h3>
          <div className="space-y-3 mt-2">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <strong className="block">Necessary Cookies</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Essential for the website to function properly. Cannot be disabled.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <strong className="block">Functional Cookies</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remember your preferences and customize your experience.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <strong className="block">Analytics Cookies</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <strong className="block">Marketing Cookies</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Used to deliver personalized advertisements.
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-4">Managing Your Cookie Preferences</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You can change your cookie preferences at any time by clicking the "Cookie Settings"
            button below or in your account settings.
          </p>

          <h3 className="text-lg font-semibold mt-4">Contact Us</h3>
          <p className="text-gray-600 dark:text-gray-400">
            If you have questions about our Cookie Policy, please contact us at privacy@wassel.com
          </p>
        </div>

        {!showSettings ? (
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleAcceptAll} className="flex-1">
              Accept All Cookies
            </Button>
            <Button onClick={handleRejectAll} variant="outline" className="flex-1">
              Reject Non-Essential
            </Button>
            <Button onClick={() => setShowSettings(true)} variant="secondary">
              Cookie Settings
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold">Cookie Preferences</h4>
            <div className="space-y-3">
              {['necessary', 'functional', 'analytics', 'marketing'].map((cookie) => (
                <div key={cookie} className="flex items-center justify-between">
                  <label className="capitalize">{cookie} Cookies</label>
                  <input
                    type="checkbox"
                    checked={preferences[cookie as keyof typeof preferences]}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        [cookie]: e.target.checked,
                      }))
                    }
                    disabled={cookie === 'necessary'}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSavePreferences} className="flex-1">
                Save Preferences
              </Button>
              <Button onClick={() => setShowSettings(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

// Hook for managing cookie preferences
export function useCookiePreferences() {
  const getPreferences = () => {
    const stored = localStorage.getItem('cookiePreferences');
    return stored
      ? JSON.parse(stored)
      : { necessary: true, functional: true, analytics: false, marketing: false };
  };

  const setPreferences = (prefs: typeof defaultPrefs) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
  };

  return { getPreferences, setPreferences };
}

const defaultPrefs = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
};
