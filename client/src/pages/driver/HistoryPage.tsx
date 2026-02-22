import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  status: string;
  totalAmount: string;
  driverEarnings: string;
  restaurantName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HistoryPageProps {
  driverId: string;
  onSelectOrder: (orderId: string) => void;
}

export default function HistoryPage({ driverId, onSelectOrder }: HistoryPageProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'delivered' | 'cancelled'>('all');

  const { data: myOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/history', driverId],
    queryFn: async () => {
      if (!driverId) return [];
      const response = await fetch(`/api/orders?driverId=${driverId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return Array.isArray(await response.json()) ? await response.json() : [];
    },
  });

  const completedOrders = myOrders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    return ['delivered', 'cancelled'].includes(order.status) && statusMatch;
  });

  const totalEarnings = completedOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + parseFloat(order.driverEarnings || '0'), 0);

  const deliveredCount = completedOrders.filter(o => o.status === 'delivered').length;
  const cancelledCount = completedOrders.filter(o => o.status === 'cancelled').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل السجل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">سجل الطلبات</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">المكتملة</p>
              <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">الملغاة</p>
              <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">الأرباح</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalEarnings)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            الكل ({completedOrders.length})
          </Button>
          <Button
            variant={filterStatus === 'delivered' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('delivered')}
            size="sm"
          >
            مكتملة ({deliveredCount})
          </Button>
          <Button
            variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('cancelled')}
            size="sm"
          >
            ملغاة ({cancelledCount})
          </Button>
        </div>

        {completedOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">لا توجد طلبات في السجل</p>
              <p className="text-gray-400 mt-2">الطلبات المكتملة سيظهر هنا</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectOrder(order.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">طلب #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge
                      className={
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {order.status === 'delivered' ? 'مكتمل' : 'ملغي'}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3 border-t pt-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">المبلغ الإجمالي</span>
                      <span className="font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">عمولتك</span>
                      <span className="font-bold text-green-600">{formatCurrency(order.driverEarnings)}</span>
                    </div>
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
