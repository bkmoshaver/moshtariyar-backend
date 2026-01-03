import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Instagram, Twitter, Linkedin, Link as LinkIcon, Phone, MapPin, Mail } from 'lucide-react';
import api from '@/lib/api';

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  avatar?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  privacy?: {
    showPhone: boolean;
    showAddress: boolean;
    showPostalCode: boolean;
  };
  links: Array<{
    title: string;
    url: string;
    icon: string;
    _id: string;
  }>;
}

export default function UserProfile() {
  const [, params] = useRoute('/:username');
  const username = params?.username;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/public/profile/${username}`);
        setProfile(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در دریافت اطلاعات پروفایل');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">پروفایل یافت نشد</h1>
        <p className="text-gray-600">{error || 'کاربری با این نام وجود ندارد'}</p>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'linkedin': return <Linkedin className="h-5 w-5" />;
      case 'website': return <Globe className="h-5 w-5" />;
      default: return <LinkIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-sm text-gray-500 mt-1">@{profile.username}</p>
          
          {profile.bio && (
            <p className="mt-4 text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
          )}
        </div>

        {/* Contact Info Section */}
        <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          {profile.privacy?.showPhone && profile.phone && (
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm dir-ltr">{profile.phone}</span>
            </div>
          )}
          
          {profile.privacy?.showAddress && profile.address && (
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
              <span className="text-sm">{profile.address}</span>
            </div>
          )}

          {profile.privacy?.showPostalCode && profile.postalCode && (
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">کد پستی: {profile.postalCode}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 mt-8">
          {profile.links?.map((link) => (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel="nofollow noopener noreferrer" // Added nofollow
              className="block w-full"
            >
              <Button
                variant="outline"
                className="w-full h-14 justify-between px-6 hover:bg-white hover:shadow-md transition-all duration-200 bg-white/50 border-gray-200"
              >
                <span className="flex items-center gap-3">
                  {getIcon(link.icon || 'link')}
                  <span className="font-medium">{link.title}</span>
                </span>
              </Button>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            ساخته شده با <span className="font-bold text-primary">مشتریار</span>
          </p>
        </div>
      </div>
    </div>
  );
}
