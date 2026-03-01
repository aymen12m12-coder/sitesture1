import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, User, Phone, Mail, MapPin, Settings, Shield, Star, Clock, Receipt, Truck, MessageCircle, Share2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { User as UserType, UiSettings } from '@shared/schema';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  
  const userId = currentUser?.id;

  const { data: uiSettings } = useQuery<UiSettings[]>({
    queryKey: ['/api/admin/ui-settings'],
  });
  
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    country: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId && isAuthenticated,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserType>) => {
      if (!userId) throw new Error(t('must_login_first'));
      const response = await apiRequest('PUT', `/api/users/${userId}`, profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      setIsEditing(false);
      toast({
        title: t('data_saved'),
        description: t('profile_updated_success'),
      });
    },
    onError: () => {
      toast({
        title: t('save_error'),
        description: t('update_error_try_again'),
        variant: "destructive",
      });
    },
  });

  const isGuestMode = !isAuthenticated || !userId;

  useEffect(() => {
    if (user && !isGuestMode) {
      setProfile({
        username: (user as UserType).username || '',
        name: (user as UserType).name || '',
        phone: (user as UserType).phone || '',
        email: (user as UserType).email || '',
        address: (user as UserType).address || '',
        country: (user as any).country || '',
      });
    } else if (isGuestMode) {
      const guestProfile = localStorage.getItem('guest_profile');
      if (guestProfile) {
        try {
          const parsedProfile = JSON.parse(guestProfile);
          setProfile(prev => ({ ...prev, ...parsedProfile }));
        } catch (error) {
          console.error('Error loading guest profile:', error);
        }
      }
    }
  }, [user, isGuestMode]);

  const handleSave = () => {
    if (isGuestMode) {
      handleGuestSave();
    } else {
      updateProfileMutation.mutate({
        username: profile.username,
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        country: profile.country,
      } as any);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading_data')}</p>
        </div>
      </div>
    );
  }

  const handleGuestSave = () => {
    try {
      localStorage.setItem('guest_profile', JSON.stringify({
        username: profile.username,
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        country: profile.country,
      }));
      setIsEditing(false);
      toast({
        title: t('data_saved_locally'),
        description: t('guest_save_description'),
      });
    } catch (error) {
      toast({
        title: t('save_error'),
        description: t('local_save_error'),
        variant: "destructive",
      });
    }
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return uiSettings?.find(s => s.key === key)?.value || defaultValue;
  };

  const supportWhatsapp = getSetting('support_whatsapp', '');
  const supportPhone = getSetting('support_phone', '');
  const shareUrl = getSetting('share_url', '');
  const shareText = getSetting('share_text', 'انضم إلى تطبيق طمطوم الآن!');

  const profileStats = [
    { icon: Receipt, label: t('total_orders'), value: '42', color: 'text-primary' },
    { icon: Star, label: t('rating'), value: '4.8', color: 'text-yellow-500' },
    { icon: Clock, label: t('member_since'), value: t('6_months'), color: 'text-green-500' },
  ];

  const menuItems = [
    { icon: Receipt, label: t('orders'), path: '/orders', description: t('view_order_history'), testId: 'profile-orders' },
    { icon: Truck, label: t('delivery_app'), path: '/driver', description: t('switch_to_driver_app'), testId: 'profile-delivery-app', onClick: () => { window.location.href = '/driver'; } },
    { icon: MapPin, label: t('saved_addresses'), path: '/addresses', description: t('manage_delivery_addresses'), testId: 'profile-addresses' },
    { icon: Settings, label: t('settings'), path: '/settings', description: t('app_and_account_settings'), testId: 'profile-settings' },
    ...(supportWhatsapp ? [{
      icon: MessageCircle,
      label: t('whatsapp_support'),
      path: '#',
      description: t('contact_us_via_whatsapp'),
      testId: 'profile-whatsapp',
      onClick: () => { window.open(`https://wa.me/${supportWhatsapp.replace(/\D/g, '')}`, '_blank'); }
    }] : []),
    ...(supportPhone ? [{
      icon: Phone,
      label: t('call_us'),
      path: '#',
      description: t('call_direct_support'),
      testId: 'profile-call',
      onClick: () => { window.open(`tel:${supportPhone}`, '_blank'); }
    }] : []),
    ...(shareUrl ? [{
      icon: Share2,
      label: t('share_app'),
      path: '#',
      description: t('share_with_friends'),
      testId: 'profile-share',
      onClick: () => {
        if (navigator.share) {
          navigator.share({ title: 'طمطوم', text: shareText, url: shareUrl });
        } else {
          toast({ title: t('copy_link'), description: shareUrl });
        }
      }
    }] : []),
    { icon: Shield, label: t('privacy_policy'), path: '/privacy', description: t('privacy_and_terms'), testId: 'profile-privacy' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter border-b pb-4 mb-8">{t('account')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-none border-2">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  {profile.name || (isGuestMode ? t('guest_user') : t('user'))}
                </CardTitle>
                <Badge variant={isGuestMode ? "outline" : "secondary"} className="mx-auto">
                  {isGuestMode ? t('guest_user') : t('premium_member')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">{t('name')}</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username" className="text-foreground">{t('username')}</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-foreground">{t('phone')}</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">{t('email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-foreground">{t('address')}</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-foreground">{t('country')}</Label>
                      <select
                        id="country"
                        value={profile.country}
                        onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="اليمن">اليمن</option>
                        <option value="السعودية">السعودية</option>
                        <option value="الإمارات">الإمارات</option>
                        <option value="مصر">مصر</option>
                        <option value="الأردن">الأردن</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="flex-1" disabled={!isGuestMode && updateProfileMutation.isPending}>
                        {!isGuestMode && updateProfileMutation.isPending ? t('saving') : isGuestMode ? t('save_locally') : t('save_changes')}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="text-foreground">{profile.username}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span className="text-foreground">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span className="text-foreground">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span className="text-foreground">{profile.address}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <span className="text-foreground">{profile.country}</span>
                    </div>
                    <Button onClick={() => setIsEditing(true)} className="w-full">{t('edit_info')}</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              {profileStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4">
                      <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full h-auto p-4 justify-between hover:bg-accent"
                    onClick={() => item.onClick ? item.onClick() : setLocation(item.path)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <div className="text-right">
                        <div className="font-medium text-foreground">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground rotate-180" />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
