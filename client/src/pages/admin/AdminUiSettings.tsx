import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Settings, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { UiSettings } from '@shared/schema';

interface SettingItem {
  key: string;
  label: string;
  type: 'boolean' | 'text' | 'textarea' | 'image';
  description: string;
  category: string;
}

const settingsConfig: SettingItem[] = [
  // Branding Settings
  { key: 'header_logo_url', label: 'صورة شعار الهيدر', type: 'image', description: 'يتم عرضه في الشريط العلوي بدلاً من النص', category: 'الهوية البصرية' },
  { key: 'sidebar_image_url', label: 'صورة القائمة الجانبية', type: 'image', description: 'الصورة التي تظهر في أعلى السايد بار', category: 'الهوية البصرية' },
  { key: 'splash_image_url', label: 'صورة شاشة الترحيب', type: 'image', description: 'الصورة التي تظهر عند فتح التطبيق لأول مرة', category: 'شاشة الترحيب' },
  { key: 'splash_title', label: 'عنوان شاشة الترحيب', type: 'text', description: 'العنوان الرئيسي في شاشة السبلاتش', category: 'شاشة الترحيب' },
  { key: 'splash_subtitle', label: 'وصف شاشة الترحيب', type: 'textarea', description: 'الوصف الذي يظهر أسفل العنوان في شاشة السبلاتش', category: 'شاشة الترحيب' },

  // Navigation Settings
  { key: 'show_categories', label: 'عرض التصنيفات', type: 'boolean', description: 'عرض تصنيفات المنتجات في الصفحة الرئيسية', category: 'التنقل' },
  { key: 'show_search_bar', label: 'عرض شريط البحث', type: 'boolean', description: 'عرض شريط البحث في الصفحة الرئيسية', category: 'التنقل' },
  { key: 'show_special_offers', label: 'عرض العروض الخاصة', type: 'boolean', description: 'عرض العروض الخاصة والتخفيضات', category: 'التنقل' },
  { key: 'show_orders_page', label: 'عرض صفحة الطلبات', type: 'boolean', description: 'عرض صفحة الطلبات في التنقل', category: 'التنقل' },
  { key: 'show_track_orders_page', label: 'عرض صفحة تتبع الطلبات', type: 'boolean', description: 'عرض صفحة تتبع الطلبات في التنقل', category: 'التنقل' },
  
  // App Settings
  { key: 'app_name', label: 'اسم التطبيق', type: 'text', description: 'اسم التطبيق الذي يظهر للمستخدمين', category: 'عام' },
  { key: 'app_theme', label: 'لون الموضوع', type: 'text', description: 'اللون الأساسي للتطبيق (hex color)', category: 'عام' },
  { key: 'delivery_fee_default', label: 'رسوم التوصيل الافتراضية', type: 'text', description: 'رسوم التوصيل الافتراضية (ريال)', category: 'عام' },
  { key: 'minimum_order_default', label: 'الحد الأدنى للطلب', type: 'text', description: 'الحد الأدنى لقيمة الطلب (ريال)', category: 'عام' },
  
  // Support & Contact Settings
  { key: 'support_whatsapp', label: 'رقم واتساب الدعم', type: 'text', description: 'رابط واتساب للتواصل المباشر (https://wa.me/...)', category: 'الدعم والمراسلة' },
  { key: 'support_phone', label: 'رقم الهاتف', type: 'text', description: 'رقم الهاتف للاتصال المباشر (tel:+...)', category: 'الدعم والمراسلة' },
  { key: 'share_text', label: 'نص المشاركة', type: 'text', description: 'النص الافتراضي عند مشاركة التطبيق', category: 'الدعم والمراسلة' },
  { key: 'share_url', label: 'رابط المشاركة', type: 'text', description: 'الرابط الذي سيتم مشاركته للتطبيق', category: 'الدعم والمراسلة' },
  
  // Privacy & Legal
  { key: 'privacy_policy_text', label: 'نص سياسة الخصوصية', type: 'textarea', description: 'نص سياسة الخصوصية الذي يظهر للمستخدمين', category: 'قانوني' },
];

export default function AdminUiSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});

  const { data: uiSettings, isLoading } = useQuery<UiSettings[]>({
    queryKey: ['/api/admin/ui-settings'],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest('PUT', `/api/admin/ui-settings/${key}`, { value });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ui-settings'] });
      // Remove from pending changes
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[variables.key];
        return newChanges;
      });
      toast({
        title: "تم حفظ الإعداد",
        description: "تم تحديث الإعداد بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعداد",
        variant: "destructive",
      });
    },
  });

  const getCurrentValue = (key: string): string => {
    // Check pending changes first
    if (pendingChanges[key] !== undefined) {
      return pendingChanges[key];
    }
    
    // Then check existing settings
    const setting = uiSettings?.find(s => s.key === key);
    return setting?.value || '';
  };

  const handleSettingChange = (key: string, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBooleanChange = (key: string, checked: boolean) => {
    handleSettingChange(key, checked ? 'true' : 'false');
  };

  const saveSetting = (key: string) => {
    const value = pendingChanges[key];
    if (value !== undefined) {
      updateSettingMutation.mutate({ key, value });
    }
  };

  const saveAllChanges = () => {
    Object.entries(pendingChanges).forEach(([key, value]) => {
      updateSettingMutation.mutate({ key, value });
    });
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  const getSettingsByCategory = () => {
    const categories: Record<string, SettingItem[]> = {};
    settingsConfig.forEach(setting => {
      if (!categories[setting.category]) {
        categories[setting.category] = [];
      }
      categories[setting.category].push(setting);
    });
    return categories;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">إعدادات الواجهة</h1>
            <p className="text-muted-foreground">إدارة إعدادات التطبيق والواجهة</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-muted rounded" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">إعدادات الواجهة</h1>
            <p className="text-muted-foreground">إدارة إعدادات التطبيق والواجهة</p>
          </div>
        </div>

        {hasChanges && (
          <Button
            onClick={saveAllChanges}
            disabled={updateSettingMutation.isPending}
            className="gap-2"
            data-testid="button-save-all-settings"
          >
            <Save className="h-4 w-4" />
            حفظ جميع التغييرات ({Object.keys(pendingChanges).length})
          </Button>
        )}
      </div>

      {/* Settings by Category */}
      <div className="grid gap-6">
        {Object.entries(getSettingsByCategory()).map(([category, settings]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map((setting, index) => {
                const currentValue = getCurrentValue(setting.key);
                const hasChange = pendingChanges[setting.key] !== undefined;

                return (
                  <div key={setting.key}>
                    {index > 0 && <Separator className="mb-4" />}
                    
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={setting.key} className="font-medium">
                            {setting.label}
                          </Label>
                          {hasChange && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {setting.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {setting.type === 'boolean' ? (
                          <Switch
                            id={setting.key}
                            checked={currentValue === 'true'}
                            onCheckedChange={(checked) => handleBooleanChange(setting.key, checked)}
                            data-testid={`switch-${setting.key}`}
                          />
                        ) : setting.type === 'image' ? (
                          <div className="flex flex-col gap-2 w-80">
                            <ImageUpload
                              label={setting.label}
                              value={currentValue}
                              onChange={(url) => handleSettingChange(setting.key, url)}
                              bucket="ui-settings"
                            />
                          </div>
                        ) : setting.type === 'textarea' ? (
                          <Textarea
                            id={setting.key}
                            value={currentValue}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            className="w-80 min-h-[100px]"
                            placeholder={`ادخل ${setting.label}`}
                          />
                        ) : (
                          <Input
                            id={setting.key}
                            value={currentValue}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            className="w-48"
                            placeholder={`ادخل ${setting.label}`}
                            data-testid={`input-${setting.key}`}
                          />
                        )}

                        {hasChange && (
                          <Button
                            size="sm"
                            onClick={() => saveSetting(setting.key)}
                            disabled={updateSettingMutation.isPending}
                            data-testid={`button-save-${setting.key}`}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            معاينة الإعدادات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">إعدادات التطبيق</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>اسم التطبيق: {getCurrentValue('app_name') || 'طمطوم'}</li>
                <li>لون الموضوع: {getCurrentValue('app_theme') || '#007bff'}</li>
                <li>رسوم التوصيل: {getCurrentValue('delivery_fee_default') || '5'} ريال</li>
                <li>الحد الأدنى للطلب: {getCurrentValue('minimum_order_default') || '25'} ريال</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">إعدادات العرض</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>التصنيفات: {getCurrentValue('show_categories') === 'true' ? '✓ مفعل' : '✗ معطل'}</li>
                <li>شريط البحث: {getCurrentValue('show_search_bar') === 'true' ? '✓ مفعل' : '✗ معطل'}</li>
                <li>العروض الخاصة: {getCurrentValue('show_special_offers') === 'true' ? '✓ مفعل' : '✗ معطل'}</li>
                <li>صفحة الطلبات: {getCurrentValue('show_orders_page') === 'true' ? '✓ مفعل' : '✗ معطل'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}