import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Cog, Save, MessageCircle, Share2, PhoneCall, ShieldCheck, Image as ImageIcon, Maximize } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: uiSettings, isLoading } = useQuery<any[]>({
    queryKey: ['/api/ui-settings'],
  });

  const [settings, setSettings] = useState({
    support_whatsapp: '',
    support_phone: '',
    share_text: '',
    share_url: '',
    privacy_policy_text: '',
    header_logo_url: '',
    logo_height_mobile: '40',
    logo_height_desktop: '64',
  });

  useEffect(() => {
    if (uiSettings) {
      const newSettings = { ...settings };
      uiSettings.forEach(s => {
        if (s.key in newSettings) {
          (newSettings as any)[s.key] = s.value;
        }
      });
      setSettings(newSettings);
    }
  }, [uiSettings]);

  const updateSettingMutation = useMutation({
    mutationFn: async (data: { key: string, value: string }) => {
      const res = await apiRequest('PUT', `/api/ui-settings/${data.key}`, { value: data.value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ui-settings'] });
    },
  });

  const handleSave = async () => {
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        updateSettingMutation.mutateAsync({ key, value })
      );
      await Promise.all(promises);
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات النظام بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-5 w-5" />
            إعدادات الروابط والدعم (طمطوم)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-orange-600" />
                <h3 className="font-bold">إعدادات الهوية والشعار</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="header_logo_url">رابط الشعار (URL)</Label>
                <Input 
                  id="header_logo_url" 
                  value={settings.header_logo_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, header_logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_height_mobile">ارتفاع الشعار (جوال) بكسل</Label>
                  <Input 
                    id="logo_height_mobile" 
                    type="number"
                    value={settings.logo_height_mobile}
                    onChange={(e) => setSettings(prev => ({ ...prev, logo_height_mobile: e.target.value }))}
                    placeholder="40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_height_desktop">ارتفاع الشعار (كمبيوتر) بكسل</Label>
                  <Input 
                    id="logo_height_desktop" 
                    type="number"
                    value={settings.logo_height_desktop}
                    onChange={(e) => setSettings(prev => ({ ...prev, logo_height_desktop: e.target.value }))}
                    placeholder="64"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-bold">إعدادات الدعم</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_whatsapp">رابط واتساب (https://wa.me/...)</Label>
                <Input 
                  id="support_whatsapp" 
                  value={settings.support_whatsapp}
                  onChange={(e) => setSettings(prev => ({ ...prev, support_whatsapp: e.target.value }))}
                  placeholder="https://wa.me/967777777777"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_phone">رقم الهاتف (tel:+967...)</Label>
                <Input 
                  id="support_phone" 
                  value={settings.support_phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, support_phone: e.target.value }))}
                  placeholder="tel:+967777777777"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold">إعدادات المشاركة</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="share_text">نص المشاركة</Label>
                <Input 
                  id="share_text" 
                  value={settings.share_text}
                  onChange={(e) => setSettings(prev => ({ ...prev, share_text: e.target.value }))}
                  placeholder="تسوق أفضل الفواكه والخضروات..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="share_url">رابط التطبيق</Label>
                <Input 
                  id="share_url" 
                  value={settings.share_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, share_url: e.target.value }))}
                  placeholder="https://tamtom.app"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold">سياسة الخصوصية</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy_policy_text">نص سياسة الخصوصية</Label>
              <Textarea 
                id="privacy_policy_text" 
                value={settings.privacy_policy_text}
                onChange={(e) => setSettings(prev => ({ ...prev, privacy_policy_text: e.target.value }))}
                placeholder="أدخل نص سياسة الخصوصية هنا..."
                className="min-h-[200px]"
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button onClick={handleSave} className="gap-2" disabled={updateSettingMutation.isPending}>
              <Save className="h-4 w-4" />
              {updateSettingMutation.isPending ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
