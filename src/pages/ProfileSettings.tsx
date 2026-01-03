import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, ExternalLink, Upload, Eye, EyeOff } from 'lucide-react';

interface LinkItem {
  title: string;
  url: string;
  icon?: string;
  active: boolean;
}

interface PrivacySettings {
  showPhone: boolean;
  showAddress: boolean;
  showPostalCode: boolean;
}

export default function ProfileSettings() {
  const { user, token, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: '',
    phone: '',
    address: '',
    postalCode: '',
    privacy: {
      showPhone: false,
      showAddress: false,
      showPostalCode: false
    } as PrivacySettings,
    links: [] as LinkItem[]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        phone: user.phone || '',
        address: user.address || '',
        postalCode: user.postalCode || '',
        privacy: {
          showPhone: user.privacy?.showPhone ?? false,
          showAddress: user.privacy?.showAddress ?? false,
          showPostalCode: user.privacy?.showPostalCode ?? false
        },
        links: user.links || []
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrivacyChange = (field: keyof PrivacySettings, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [field]: checked }
    }));
  };

  const handleLinkChange = (index: number, field: keyof LinkItem, value: string) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { title: '', url: '', active: true }]
    }));
  };

  const removeLink = (index: number) => {
    const newLinks = [...formData.links];
    newLinks.splice(index, 1);
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'خطا در بروزرسانی پروفایل');
      }

      toast.success('پروفایل با موفقیت بروزرسانی شد');
      
      // Refresh user context
      if (refreshProfile) {
        await refreshProfile();
      }
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">پروفایل من</h1>
          {user?.username && (
            <a 
              href={`/${user.username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              مشاهده پروفایل عمومی
            </a>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات عمومی</CardTitle>
            <CardDescription>
              اطلاعاتی که در صفحه پروفایل عمومی شما نمایش داده می‌شود
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label>تصویر پروفایل</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full bg-gray-100 overflow-hidden border">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <Upload className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      placeholder="لینک تصویر پروفایل (https://...)"
                      dir="ltr"
                      className="text-left"
                    />
                    <p className="text-xs text-gray-500">
                      لینک مستقیم تصویر پروفایل خود را وارد کنید.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">نام نمایشی</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="نام خود را وارد کنید"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">نام کاربری (لینک اختصاصی)</Label>
                  <div className="flex items-center gap-2" dir="ltr">
                    <span className="text-gray-500 text-sm">yourapp.com/</span>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="text-left"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    فقط حروف انگلیسی، اعداد و زیرخط مجاز است
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">بیوگرافی</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="درباره خودتان بنویسید..."
                  rows={4}
                />
              </div>

              {/* Contact Info with Privacy */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">اطلاعات تماس</h3>
                
                <div className="grid gap-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>شماره تماس</Label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0912..."
                        dir="ltr"
                        className="text-right"
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <Switch
                        checked={formData.privacy.showPhone}
                        onCheckedChange={(c) => handlePrivacyChange('showPhone', c)}
                      />
                      <span className="text-sm text-gray-600">
                        {formData.privacy.showPhone ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                        نمایش عمومی
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>آدرس</Label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="آدرس کامل..."
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <Switch
                        checked={formData.privacy.showAddress}
                        onCheckedChange={(c) => handlePrivacyChange('showAddress', c)}
                      />
                      <span className="text-sm text-gray-600">
                        {formData.privacy.showAddress ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                        نمایش عمومی
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>کد پستی</Label>
                      <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="1234567890"
                        dir="ltr"
                        className="text-right"
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <Switch
                        checked={formData.privacy.showPostalCode}
                        onCheckedChange={(c) => handlePrivacyChange('showPostalCode', c)}
                      />
                      <span className="text-sm text-gray-600">
                        {formData.privacy.showPostalCode ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                        نمایش عمومی
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label>لینک‌های ارتباطی</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLink}>
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن لینک
                  </Button>
                </div>

                {formData.links.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-500">
                    هنوز لینکی اضافه نکرده‌اید
                  </div>
                )}

                {formData.links.map((link, index) => (
                  <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="عنوان (مثلاً: اینستاگرام)"
                          value={link.title}
                          onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="آدرس لینک (https://...)"
                          value={link.url}
                          onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                          dir="ltr"
                          className="text-left"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    'ذخیره تغییرات'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
