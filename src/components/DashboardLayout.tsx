import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, FileText, BarChart3, LogOut, Home, Settings, UserCircle, ShoppingBag, Store, Activity, Shield } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const navigation = [
    // Common
    { name: 'داشبورد', href: '/dashboard', icon: Home, roles: ['tenant_admin', 'staff', 'client', 'user'] },
    { name: 'پروفایل من', href: '/profile-settings', icon: UserCircle, roles: ['super_admin', 'tenant_admin', 'staff', 'client', 'user'] },

    // Super Admin
    { name: 'داشبورد کل', href: '/admin', icon: BarChart3, roles: ['super_admin'] },
    { name: 'مدیریت فروشگاه‌ها', href: '/admin/tenants', icon: Store, roles: ['super_admin'] },
    { name: 'مدیریت کاربران', href: '/users', icon: Users, roles: ['super_admin'] },
    { name: 'لاگ فعالیت‌ها', href: '/admin/logs', icon: Activity, roles: ['super_admin'] },

    // Tenant Admin & Staff
    { name: 'مشتریان', href: '/clients', icon: Users, roles: ['tenant_admin', 'staff'] },
    { name: 'خدمات', href: '/services', icon: FileText, roles: ['tenant_admin', 'staff'] },
    { name: 'محصولات', href: '/products', icon: ShoppingBag, roles: ['tenant_admin', 'staff'] },
    { name: 'سفارشات', href: '/orders', icon: ShoppingBag, roles: ['tenant_admin', 'staff'] },
    { name: 'گزارشات', href: '/reports', icon: BarChart3, roles: ['tenant_admin'] },
    { name: 'تنظیمات فروشگاه', href: '/settings', icon: Settings, roles: ['tenant_admin'] },
    { name: 'مدیریت پرسنل', href: '/staff', icon: Shield, roles: ['tenant_admin'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-64 bg-white border-l border-gray-200 flex flex-col z-50">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-900">مشتریار</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
          {user?.role === 'super_admin' && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
              مدیر کل سیستم
            </span>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const userRole = user?.role || 'user';
            const effectiveRole = userRole === 'admin' ? 'tenant_admin' : userRole;

            if (!item.roles.includes(effectiveRole)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 mt-auto">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            خروج از حساب
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="mr-64 p-8">
        {children}
      </main>
    </div>
  );
}
