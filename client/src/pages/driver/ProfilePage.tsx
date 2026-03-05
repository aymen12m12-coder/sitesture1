import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, MapPin, Truck, LogOut, Save, Settings, RefreshCw } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType?: string;
  vehicleNumber?: string;
  isAvailable: boolean;
}

interface ProfilePageProps {
  onLogout: () => void;
}

export default function ProfilePage({ onLogout }: ProfilePageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Driver>>({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
    isAvailable: false
  });

  const driverToken = localStorage.getItem('driver_token');

  useEffect(() => {
    const driverData = localStorage.getItem('driver_user');
    if (driverData) {
      try {
        const driver = JSON.parse(driverData);
        setFormData({
          id: driver.id,
          name: driver.name || '',
          email: driver.email || '',
          phone: driver.phone || '',
          vehicleType: driver.vehicleType || '',
          vehicleNumber: driver.vehicleNumber || '',
          isAvailable: driver.isAvailable || false
        });
      } catch (error) {
        console.error('Error parsing driver data:', error);
      }
    }
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Driver>) => {
      const response = await fetch(`/api/driver/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driverToken}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('فشل في تحديث الملف الشخصي');
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success && result.driver) {
        localStorage.setItem('driver_user', JSON.stringify(result.driver));
        setFormData(prev => ({ ...prev, ...result.driver }));
      }
      queryClient.invalidateQueries({ queryKey: ['/api/driver/dashboard'] });
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
      const response = await fetch(`/api/driver/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driverToken}`
        },
        body: JSON.stringify({ isAvailable }),
      });

      if (!response.ok) throw new Error('فشل في تحديث حالة التوفر');
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success && result.driver) {
        localStorage.setItem('driver_user', JSON.stringify(result.driver));
        setFormData(prev => ({ ...prev, isAvailable: result.driver.isAvailable }));
      }
      toast({
        title: "تم التحديث",
        description: formData.isAvailable ? "أنت متاح الآن 🟢" : "أنت غير متاح 🔴"
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
        <h1 className="text-2xl font-bold mb-6 text-right">الملف الشخصي</h1>

        {/* Profile Header */}
        <Card className="mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-right">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">السائق</p>
                <p className="text-xl font-bold">{formData.name}</p>
                <p className="text-xs opacity-75">{formData.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-right">
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
          <CardContent className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <p className="text-sm text-gray-600">
                {formData.isAvailable ? 'أنت متاح لاستقبال طلبات جديدة 🟢' : 'أنت غير متاح الآن 🔴'}
              </p>
              <div className={`w-3 h-3 rounded-full ${formData.isAvailable ? 'bg-green-600' : 'bg-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between items-center">
             <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'إلغاء' : 'تعديل'}
            </Button>
            <CardTitle className="flex items-center gap-2 text-right">
              <User className="h-5 w-5" />
              معلومات الملف الشخصي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-right">
            <div>
              <Label className="mb-2 block">الاسم</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                placeholder="اسم السائق"
                className="text-right"
              />
            </div>

            <div>
              <Label className="mb-2 block">البريد الإلكتروني</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                placeholder="البريد الإلكتروني"
                className="text-right"
              />
            </div>

            <div>
              <Label className="mb-2 block">رقم الهاتف</Label>
              <div className="flex gap-2 items-center">
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
                <Input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="رقم الهاتف"
                  className="text-right"
                />
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
          <CardHeader className="flex flex-row justify-between items-center">
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'إلغاء' : 'تعديل'}
            </Button>
            <CardTitle className="flex items-center gap-2 text-right">
              <Truck className="h-5 w-5" />
              معلومات المركبة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-right">
            <div>
              <Label className="mb-2 block">نوع المركبة</Label>
              <Input
                value={formData.vehicleType || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                disabled={!isEditing}
                placeholder="مثال: دراجة نارية، سيارة صغيرة"
                className="text-right"
              />
            </div>

            <div>
              <Label className="mb-2 block">رقم المركبة</Label>
              <Input
                value={formData.vehicleNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                disabled={!isEditing}
                placeholder="رقم اللوحة"
                className="text-right"
              />
            </div>

            {isEditing && (
              <Button
                onClick={() => updateProfileMutation.mutate({
                  vehicleType: formData.vehicleType,
                  vehicleNumber: formData.vehicleNumber
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
        <Card className="border-red-200 bg-red-50 border">
          <CardContent className="p-6">
            <Button
              onClick={onLogout}
              className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white border-none"
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
