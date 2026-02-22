import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, DollarSign, Clock, CheckCircle, Bell } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: string;
  items: string;
  totalAmount: string;
  driverEarnings: string;
  restaurantName?: string;
  createdAt: Date;
  driverId?: string;
}

interface AvailableOrdersPageProps {
  driverId: string;
  onSelectOrder: (orderId: string) => void;
}

export default function AvailableOrdersPage({ driverId, onSelectOrder }: AvailableOrdersPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: availableOrders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['/api/orders/available'],
    queryFn: async () => {
      const response = await fetch('/api/orders?status=confirmed');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      return Array.isArray(data) 
        ? data.filter((order: any) => !order.driverId || order.driverId === driverId)
        : [];
    },
    refetchInterval: 10000,
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/orders/${orderId}/assign-driver`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('driverToken')}`
        },
        body: JSON.stringify({ driverId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to accept order');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/available'] });
      toast({
        title: "تم قبول الطلب ✅",
        description: "تم إضافة الطلب إلى قائمتك"
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({
      title: "تم التحديث",
      description: "تم تحديث قائمة الطلبات"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل الطلبات المتاحة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">الطلبات المتاحة</h1>
            <p className="text-gray-600">{availableOrders.length} طلب متاح</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            {refreshing ? 'جاري...' : 'تحديث'}
          </Button>
        </div>

        {availableOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">لا توجد طلبات متاحة حالياً</p>
              <p className="text-gray-400 mt-2">سيتم إشعارك عند توفر طلبات جديدة</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectOrder(order.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">طلب #{order.orderNumber}</p>
                      <p className="text-sm font-semibold text-primary">{order.restaurantName || 'مطعم'}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">مؤكد</Badge>
                  </div>

                  <div className="space-y-2 mb-4 border-t pt-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-bold text-green-600">
                        عمولة: {formatCurrency(order.driverEarnings)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${order.customerPhone}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      اتصال
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptOrderMutation.mutate(order.id);
                      }}
                      disabled={acceptOrderMutation.isPending}
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700 mr-auto"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {acceptOrderMutation.isPending ? 'جاري...' : 'قبول'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
