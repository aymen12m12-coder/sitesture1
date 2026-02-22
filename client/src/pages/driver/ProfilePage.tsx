import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, MapPin, Truck, LogOut, Save, Settings } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle?: string;
  licenseNumber?: string;
  isAvailable: boolean;
}

interface ProfilePageProps {
  driverId: string;
  onLogout: () => void;
}

export default function ProfilePage({ driverId, onLogout }: ProfilePageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Driver>>({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    licenseNumber: '',
    isAvailable: false
  });

  React.useEffect(() => {
    const driverData = localStorage.getItem('driverUser');
    if (driverData) {
      try {
        const driver = JSON.parse(driverData);
        setFormData({
          name: driver.name || '',
          email: driver.email || '',
          phone: driver.phone || '',
          vehicle: driver.vehicle || '',
          licenseNumber: driver.licenseNumber || '',
          isAvailable: driver.isAvailable || false
        });
      } catch (error) {
        console.error('Error parsing driver data:', error);
      }
    }
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Driver>) => {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('driverToken')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('driverUser', JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setIsEditing(false);
      toast({
        title: "تم التحديث ✅",
        description: "تم تحديث بيانات الملف الشخصي بنجاح"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('driverToken')}`
        },
        body: JSON.stringify({ isAvailable }),
      });

      if (!response.ok) throw new Error('Failed to update availability');
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('driverUser', JSON.stringify(data));
      setFormData(prev => ({ ...prev, isAvailable: data.isAvailable }));
      toast({
        title: "تم التحديث",
        description: data.isAvailable ? "أنت متاح الآن 🟢" : "أنت غير متاح 🔴"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">الملف الشخصي</h1>

        {/* Profile Header */}
        <Card className="mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm opacity-90">معرف السائق</p>
                <p className="text-xl font-bold">{driverId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                حالة التوفر
              </span>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isAvailable || false}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, isAvailable: checked }));
                    updateAvailabilityMutation.mutate(checked);
                  }}
                  disabled={updateAvailabilityMutation.isPending}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${formData.isAvailable ? 'bg-green-600' : 'bg-gray-400'}`} />
              <p className="text-sm text-gray-600">
                {formData.isAvailable ? 'أنت متاح لاستقبال طلبات جديدة 🟢' : 'أنت غير متاح الآن 🔴'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              معلومات الملف الشخصي
            </CardTitle>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'إلغاء' : 'تعديل'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2">الاسم</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                placeholder="اسم السائق"
              />
            </div>

            <div>
              <Label className="mb-2">البريد الإلكتروني</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                placeholder="البريد الإلكتروني"
              />
            </div>

            <div>
              <Label className="mb-2">رقم الهاتف</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="رقم الهاتف"
                />
                {formData.phone && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`tel:${formData.phone}`)}
                    title="اتصال"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isEditing && (
              <Button
                onClick={() => updateProfileMutation.mutate(formData)}
                disabled={updateProfileMutation.isPending}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card className="mb-6">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              معلومات المركبة
            </CardTitle>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'إلغاء' : 'تعديل'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2">نوع المركبة</Label>
              <Input
                value={formData.vehicle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
                disabled={!isEditing}
                placeholder="مثال: دراجة نارية، سيارة صغيرة"
              />
            </div>

            <div>
              <Label className="mb-2">رقم الترخيص</Label>
              <Input
                value={formData.licenseNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                disabled={!isEditing}
                placeholder="رقم الترخيص"
              />
            </div>

            {isEditing && (
              <Button
                onClick={() => updateProfileMutation.mutate({
                  vehicle: formData.vehicle,
                  licenseNumber: formData.licenseNumber
                })}
                disabled={updateProfileMutation.isPending}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <Button
              onClick={onLogout}
              className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
