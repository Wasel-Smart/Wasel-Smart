import { useState, useEffect } from 'react';
import { CircleUserRound, BellRing, Globe, ShieldCheck, HelpCircle, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { profile, updateProfile } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.full_name?.split(' ')[0] || '');
      setLastName(profile.full_name?.split(' ').slice(1).join(' ') || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
    }
  }, [profile]);
  
  const [notifications, setNotifications] = useState({
    tripUpdates: true,
    messages: true,
    payments: true,
    promotional: false,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
  });
  
  const [selectedCountry, setSelectedCountry] = useState('United Arab Emirates');

  const handleSaveProfile = async () => {
    try {
      const { error } = await updateProfile({
        full_name: `${firstName} ${lastName}`.trim(),
        phone,
        bio,
      });
      
      if (error) {
        toast.error(language === 'ar' ? 'فشل حفظ التغييرات' : 'Failed to save changes');
      } else {
        toast.success(language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
      }
    } catch (err) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleLanguageChange = (newLang: 'en' | 'ar') => {
    setLanguage(newLang);
    toast.success(newLang === 'ar' ? 'تم تغيير اللغة' : 'Language changed');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div>
        <h1>{t('settings.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('settings.subtitle')}</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleUserRound className="w-5 h-5" />
            {t('settings.profile.title')}
          </CardTitle>
          <CardDescription>{t('settings.profile.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('settings.profile.firstName')}</Label>
              <Input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('settings.profile.lastName')}</Label>
              <Input 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.profile.email')}</Label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.profile.phone')}</Label>
            <Input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 123 4567"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings.profile.bio')}</Label>
            <Input 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('settings.profile.bioPlaceholder')}
            />
          </div>

          <Button 
            onClick={handleSaveProfile}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {t('common.saveChanges')}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5" />
            {t('settings.notifications.title')}
          </CardTitle>
          <CardDescription>{t('settings.notifications.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.notifications.tripUpdates')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.tripUpdatesDesc')}</p>
            </div>
            <Switch 
              checked={notifications.tripUpdates}
              onCheckedChange={(checked) => setNotifications({ ...notifications, tripUpdates: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.notifications.messages')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.messagesDesc')}</p>
            </div>
            <Switch 
              checked={notifications.messages}
              onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.notifications.payments')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.paymentsDesc')}</p>
            </div>
            <Switch 
              checked={notifications.payments}
              onCheckedChange={(checked) => setNotifications({ ...notifications, payments: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.notifications.promotional')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.promotionalDesc')}</p>
            </div>
            <Switch 
              checked={notifications.promotional}
              onCheckedChange={(checked) => setNotifications({ ...notifications, promotional: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            {t('settings.security.title')}
          </CardTitle>
          <CardDescription>{t('settings.security.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.security.twoFactor')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.twoFactorDesc')}</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
            >
              {t('settings.security.enable')}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.security.changePassword')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.changePasswordDesc')}</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
            >
              {t('settings.security.change')}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.security.profileVisibility')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.profileVisibilityDesc')}</p>
            </div>
            <Switch 
              checked={privacy.profileVisibility}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisibility: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            {t('settings.language.title')}
          </CardTitle>
          <CardDescription>{t('settings.language.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.language.language')}</Label>
            <Select value={language} onValueChange={(val) => handleLanguageChange(val as 'en' | 'ar')}>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية (Arabic)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.language.country')}</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                <SelectItem value="Egypt">Egypt</SelectItem>
                <SelectItem value="Qatar">Qatar</SelectItem>
                <SelectItem value="Kuwait">Kuwait</SelectItem>
                <SelectItem value="Jordan">Jordan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => toast.success(language === 'ar' ? 'تم حفظ التفضيلات' : 'Preferences saved')}
          >
            {t('settings.language.savePreferences')}
          </Button>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            {t('settings.help.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
          >
            {t('settings.help.helpCenter')}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
          >
            {t('settings.help.contactSupport')}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
          >
            {t('settings.help.termsOfService')}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
          >
            {t('settings.help.privacyPolicy')}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-500">{t('settings.danger.title')}</CardTitle>
          <CardDescription>{t('settings.danger.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
          >
            {t('settings.danger.deactivate')}
          </Button>
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            onClick={() => toast.info(language === 'ar' ? 'قريباً' : 'Coming soon')}
          >
            {t('settings.danger.deleteAccount')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
