import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Store, Palette, Gift, ExternalLink, Copy } from 'lucide-react';

export default function StoreSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    _id: '',
    name: '',
    slug: '',
    address: '',
    phone: '',
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      logo: '',
      banner: ''
    },
    giftSettings: {
      enabled: true,
      percentage: 5,
      expireDays: 30
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/tenants/me');
      const tenant = data.data.tenant;
      
      setSettings({
        _id: tenant._id,
        name: tenant.name,
        slug: tenant.slug || '',
        address: tenant.address || '',
        phone: tenant.phone || '',
        branding: {
          primaryColor: tenant.branding?.primaryColor || '#3B82F6',
          secondaryColor: tenant.branding?.secondaryColor || '#10B981',
          logo: tenant.branding?.logo || '',
          banner: tenant.branding?.banner || ''
        },
        giftSettings: {
          enabled: tenant.giftSettings?.enabled ?? true,
          percentage: tenant.giftSettings?.percentage || 5,
          expireDays: tenant.giftSettings?.expireDays || 30
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('خطا در دریافت تنظیمات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Clean payload
      const payload = {
        name: settings.name,
        slug: settings.slug,
        address: settings.address,
        phone: settings.phone,
        branding: settings.branding,
        giftSettings: settings.giftSettings,
        banner: settings.branding.banner // Send banner at root level too for backward compatibility
      };

      console.log('Saving settings:', payload);
      await api.put('/tenants/me', payload);
      toast.success('تنظیمات با موفقیت ذخیره شد');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const storeUrl = settings.slug ? `${window.location.origin}/s/${settings.slug}` : '';

  const copyToClipboard = () => {
    if (storeUrl) {
      navigator.clipboard.writeText(storeUrl);
      toast.success('لینک فروشگاه کپی شد');
    }
  };

  if (loading) return <div className="p-8 text-center">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">تنظیمات فروشگاه</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* مشخصات عمومی */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              مشخصات عمومی
            </CardTitle>
            <CardDescription>نام و اطلاعات پایه فروشگاه شما</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>نام فروشگاه</Label>
              <Input 
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>نامک فروشگاه (آدرس اینترنتی)</Label>
              <div className="flex items-center gap-2" dir="ltr">
                <span className="text-gray-500 text-sm whitespace-nowrap">/s/</span>
                <Input 
                  value={settings.slug}
                  onChange={(e) => setSettings({ ...settings, slug: e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() })}
                  placeholder="my-shop"
                  className="text-left"
                />
              </div>
              <p className="text-xs text-gray-500">فقط حروف انگلیسی، اعداد و خط تیره مجاز است.</p>
              
              {settings.slug && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <a href={`/s/${settings.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 hover:underline truncate dir-ltr">
                      {storeUrl}
                    </a>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تلفن تماس</Label>
                <Input 
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="021..."
                  dir="ltr"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label>شناسه فروشگاه (جهت اتصال API)</Label>
                <div className="relative">
                  <Input 
                    value={settings._id}
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>آدرس</Label>
              <Input 
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="آدرس کامل فروشگاه..."
              />
            </div>
          </CardContent>
        </Card>

        {/* برندینگ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              ظاهر و برندینگ
            </CardTitle>
            <CardDescription>رنگ‌بندی پنل و کارت‌های مشتریان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>لوگو (لینک تصویر)</Label>
              <Input 
                value={settings.branding.logo}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  branding: { ...settings.branding, logo: e.target.value } 
                })}
                placeholder="https://example.com/logo.png"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>بنر فروشگاه (لینک تصویر)</Label>
              <Input 
                value={settings.branding.banner}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  branding: { ...settings.branding, banner: e.target.value } 
                })}
                placeholder="https://example.com/banner.jpg"
                dir="ltr"
              />
              <p className="text-xs text-gray-500">تصویر عریض برای بالای صفحه فروشگاه (پیشنهادی: 1200x300 پیکسل)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رنگ اصلی</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={settings.branding.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, primaryColor: e.target.value }
                    })}
                  />
                  <Input 
                    value={settings.branding.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, primaryColor: e.target.value }
                    })}
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>رنگ فرعی</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={settings.branding.secondaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, secondaryColor: e.target.value }
                    })}
                  />
                  <Input 
                    value={settings.branding.secondaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, secondaryColor: e.target.value }
                    })}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تنظیمات هدیه */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              سیستم وفاداری و هدیه
            </CardTitle>
            <CardDescription>تنظیمات مربوط به اعتبار هدیه مشتریان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>فعال‌سازی سیستم هدیه</Label>
                <p className="text-sm text-muted-foreground">
                  آیا می‌خواهید به مشتریان اعتبار هدیه دهید؟
                </p>
              </div>
              <Switch 
                checked={settings.giftSettings.enabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  giftSettings: { ...settings.giftSettings, enabled: checked }
                })}
              />
            </div>

            {settings.giftSettings.enabled && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>درصد هدیه</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={settings.giftSettings.percentage}
                      onChange={(e) => setSettings({
                        ...settings,
                        giftSettings: { ...settings.giftSettings, percentage: parseInt(e.target.value) }
                      })}
                    />
                    <span className="absolute left-3 top-2.5 text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">چند درصد از مبلغ خرید به کیف پول برگردد؟</p>
                </div>

                <div className="space-y-2">
                  <Label>مهلت استفاده (روز)</Label>
                  <Input 
                    type="number" 
                    min="1"
                    value={settings.giftSettings.expireDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      giftSettings: { ...settings.giftSettings, expireDays: parseInt(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">اعتبار هدیه بعد از چند روز منقضی شود؟</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
