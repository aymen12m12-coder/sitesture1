import { useState, useEffect, useMemo } from 'react';
import { useLocation as useWouterLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, Trash2, MapPin, Calendar, Clock, DollarSign, Plus, Minus, ShoppingCart } from 'lucide-react';
import { LocationPicker, LocationData } from '@/components/LocationPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '../contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { useUserLocation } from '@/context/LocationContext';
import type { InsertOrder, Restaurant } from '@shared/schema';

export default function Cart() {
  const [, setLocation] = useWouterLocation();
  const { state, removeItem, updateQuantity, clearCart, setDeliveryFee } = useCart();
  const { items, subtotal, total, deliveryFee, restaurantId } = state;
  const { toast } = useToast();
  const { location: userLocation } = useUserLocation();

  const [orderForm, setOrderForm] = useState({
    customerName: localStorage.getItem('customer_name') || '',
    customerPhone: localStorage.getItem('customer_phone') || '',
    customerEmail: localStorage.getItem('customer_email') || '',
    deliveryAddress: '',
    notes: '',
    paymentMethod: 'cash',
    deliveryTime: 'now',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTimeSlot: '',
    locationData: null as LocationData | null,
  });

  // حساب الرسوم تلقائياً عند توفر الموقع
  useEffect(() => {
    if (userLocation.position && !orderForm.locationData) {
      const location = {
        lat: userLocation.position.coords.latitude,
        lng: userLocation.position.coords.longitude,
        address: 'موقعي الحالي'
      };
      handleLocationSelect(location);
    }
  }, [userLocation.position]);

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${restaurantId}`],
    enabled: !!restaurantId,
  });

  const { data: settings } = useQuery<any[]>({
    queryKey: ['/api/ui-settings'],
  });

  const handleLocationSelect = async (location: LocationData) => {
    setOrderForm(prev => ({
      ...prev,
      deliveryAddress: location.address,
      locationData: location,
    }));

    if (location.lat && location.lng) {
      try {
        const response = await apiRequest('POST', '/api/delivery-fees/calculate', {
          customerLat: location.lat,
          customerLng: location.lng,
          restaurantId: restaurantId || null,
          orderSubtotal: subtotal
        });
        
        const data = await response.json();
        
        if (data.success) {
          setDeliveryFee(data.fee);
          
          toast({
            title: "تم تحديث رسوم التوصيل",
            description: `المسافة: ${data.distance.toFixed(1)} كم، الرسوم: ${formatCurrency(data.fee)}`,
          });
        }
      } catch (error) {
        console.error('Error calculating delivery fee:', error);
        toast({
          title: "خطأ في حساب رسوم التوصيل",
          description: "حدث خطأ أثناء محاولة حساب رسوم التوصيل، يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      }
    }
  };

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم تأكيد طلبك بنجاح!",
        description: "سيتم التواصل معك قريباً",
      });
      
      localStorage.setItem('customer_phone', orderForm.customerPhone);
      localStorage.setItem('customer_name', orderForm.customerName);
      if (orderForm.customerEmail) {
        localStorage.setItem('customer_email', orderForm.customerEmail);
      }
      
      clearCart();
      setLocation('/orders');
    },
    onError: () => {
      toast({
        title: "خطأ في تأكيد الطلب",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.deliveryAddress) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "أضف بعض العناصر قبل تأكيد الطلب",
        variant: "destructive",
      });
      return;
    }

    const orderData: InsertOrder = {
      ...orderForm,
      items: JSON.stringify(items),
      subtotal: subtotal.toString(),
      deliveryFee: deliveryFee.toString(),
      total: (subtotal + deliveryFee).toString(),
      totalAmount: (subtotal + deliveryFee).toString(),
      restaurantId: restaurantId || null,
      status: 'pending',
      orderNumber: `ORD${Date.now()}`,
      customerLocationLat: orderForm.locationData?.lat.toString(),
      customerLocationLng: orderForm.locationData?.lng.toString(),
      deliveryPreference: orderForm.deliveryTime,
      scheduledDate: orderForm.deliveryTime === 'later' ? orderForm.deliveryDate : undefined,
      scheduledTimeSlot: orderForm.deliveryTime === 'later' ? orderForm.deliveryTimeSlot : undefined,
    };

    placeOrderMutation.mutate(orderData);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black tracking-tighter">
              <span className="text-[#388e3c]">طم</span><span className="text-[#d32f2f]">طوم</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter"> - السلة</h1>
          </div>
          {items.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-black font-bold gap-2"
              onClick={clearCart}
              data-testid="button-clear-cart"
            >
              <Trash2 className="h-5 w-5" /> مسح الحقيبة
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* القسم الأيمن - عناصر السلة والنماذج */}
          <div className="lg:col-span-2 space-y-8">
            {/* عناصر السلة */}
            {items.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900" data-testid={`cart-item-name-${item.id}`}>
                            {item.name}
                          </h4>
                          <p className="text-sm font-bold text-gray-900" data-testid={`cart-item-price-${item.id}`}>
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-6 h-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium" data-testid={`cart-item-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-6 h-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-6 h-6 ml-2 text-black hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* نموذج معلومات العميل */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-4">معلومات العميل</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="الاسم *"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                    data-testid="input-customer-name"
                  />
                  <Input
                    placeholder="رقم الهاتف *"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    data-testid="input-customer-phone"
                  />
                  <Input
                    placeholder="البريد الإلكتروني"
                    value={orderForm.customerEmail}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    data-testid="input-customer-email"
                  />
                </div>
              </CardContent>
            </Card>

            {/* قسم العنوان مع منتقي الموقع */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-black" />
                  <h3 className="font-semibold text-gray-800">عنوان التوصيل</h3>
                </div>
                
                <div className="mb-4">
                  <LocationPicker 
                    onLocationSelect={handleLocationSelect}
                    placeholder="اختر موقع التوصيل من الخريطة"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">أو أدخل العنوان يدوياً:</label>
                  <Textarea
                    placeholder="أدخل عنوان التوصيل بالتفصيل *"
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    rows={3}
                    data-testid="input-delivery-address"
                    className="border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>

                {orderForm.locationData && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">تم تحديد الموقع بدقة</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      📍 الإحداثيات: {orderForm.locationData.lat.toFixed(6)}, {orderForm.locationData.lng.toFixed(6)}
                    </p>
                    <p className="text-xs text-green-700">
                      سيتم توصيل طلبك بدقة للموقع المحدد
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ملاحظات الطلب */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-black" />
                  <h3 className="font-semibold text-gray-800">ملاحظات الطلب</h3>
                </div>
                <Textarea
                  placeholder="أضف ملاحظات للطلب (اختياري)"
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  data-testid="input-order-notes"
                />
              </CardContent>
            </Card>

            {/* وقت التوصيل */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-black" />
                  <h3 className="font-semibold text-gray-800">تحديد وقت الطلب</h3>
                </div>
                <div className="text-sm text-gray-600 mb-3">وقت تنفيذ الطلب</div>
                
                <div className="flex gap-3">
                  <Button 
                    variant={orderForm.deliveryTime === 'now' ? "default" : "outline"}
                    className={`flex-1 ${orderForm.deliveryTime === 'now' ? 'bg-black hover:bg-red-600 text-white' : 'border-gray-300'}`}
                    onClick={() => setOrderForm(prev => ({ ...prev, deliveryTime: 'now' }))}
                  >
                    ✓ الآن
                  </Button>
                  <Button 
                    variant={orderForm.deliveryTime === 'later' ? "default" : "outline"}
                    className={`flex-1 ${orderForm.deliveryTime === 'later' ? 'bg-black hover:bg-red-600 text-white' : 'border-gray-300'}`}
                    onClick={() => setOrderForm(prev => ({ ...prev, deliveryTime: 'later' }))}
                  >
                    في وقت لاحق
                  </Button>
                </div>

                {orderForm.deliveryTime === 'later' && (
                  <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">تاريخ التوصيل</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={orderForm.deliveryDate}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTimeSlot">وقت التوصيل</Label>
                      <select
                        id="deliveryTimeSlot"
                        className="w-full p-2 border border-border rounded-md bg-background"
                        value={orderForm.deliveryTimeSlot}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryTimeSlot: e.target.value }))}
                      >
                        <option value="">اختر وقت التوصيل</option>
                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                        <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                        <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                        <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                        <option value="08:00 PM - 10:00 PM">08:00 PM - 10:00 PM</option>
                      </select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* القسم الأيسر - ملخص الطلب والدفع */}
          <div className="space-y-8">
            {/* طرق الدفع */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-black" />
                  <h3 className="font-semibold text-gray-800">طريقة الدفع</h3>
                </div>

                <RadioGroup 
                  value={orderForm.paymentMethod} 
                  onValueChange={(value) => setOrderForm(prev => ({ ...prev, paymentMethod: value }))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      الدفع عند الاستلام
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                      الدفع من رصيد
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="digital" id="digital" />
                    <Label htmlFor="digital" className="flex-1 cursor-pointer">
                      الدفع باستخدام المحفظة الإلكترونية
                    </Label>
                  </div>
                </RadioGroup>

                <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3">
                  إضافة رصيد
                </Button>
              </CardContent>
            </Card>

            {/* ملخص الطلب النهائي */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">المجموع الفرعي</span>
                    <span className="text-xl font-bold text-gray-900" data-testid="text-subtotal">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">التوصيل</span>
                    <span className="text-gray-900" data-testid="text-delivery-fee">
                      {formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-800 font-semibold">الإجمالي</span>
                    <span className="text-xl font-bold text-black" data-testid="text-total">
                      {formatCurrency(subtotal + deliveryFee)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 text-center">
                    يرجى تحديد عنوان التوصيل لاحتساب سعر التوصيل
                    <Button variant="link" className="text-blue-500 p-0 h-auto text-sm">
                      إعادة المحاولة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* زر تأكيد الطلب */}
            {items.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <Button 
                    className="w-full bg-black hover:bg-red-600 text-white font-semibold py-3 text-lg"
                    onClick={handlePlaceOrder}
                    disabled={placeOrderMutation.isPending || !orderForm.locationData}
                    data-testid="button-place-order"
                  >
                    {placeOrderMutation.isPending ? 'جاري تأكيد الطلب...' : !orderForm.locationData ? 'يرجى تحديد الموقع للمتابعة' : `تأكيد الطلب - ${formatCurrency(total)}`}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* رسالة السلة الفارغة */}
            {items.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">السلة فارغة</h3>
                    <p className="text-sm">أضف بعض العناصر لبدء الطلب</p>
                    <Button 
                      className="mt-4 bg-black hover:bg-red-600 text-white"
                      onClick={() => setLocation('/')}
                      data-testid="button-continue-shopping"
                    >
                      العودة للتسوق
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
