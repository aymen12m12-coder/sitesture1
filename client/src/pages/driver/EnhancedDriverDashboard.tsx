import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import DriverMapView from '@/components/maps/DriverMapView';
import OrderDetailsPage from './OrderDetailsPage';
import AvailableOrdersPage from './AvailableOrdersPage';
import ActiveOrdersPage from './ActiveOrdersPage';
import HistoryPage from './HistoryPage';
import StatsPage from './StatsPage';
import ProfilePage from './ProfilePage';
import WalletPage from './WalletPage';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  LogOut,
  Navigation,
  Phone,
  CheckCircle,
  Package,
  TrendingUp,
  Activity,
  Menu,
  User,
  Calendar,
  Bell,
  Settings,
  History,
  MapPinned,
  RefreshCw
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  customerLocationLat?: string;
  customerLocationLng?: string;
  notes?: string;
  paymentMethod: string;
  status: string;
  items: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  totalAmount: string;
  estimatedTime?: string;
  driverEarnings: string;
  restaurantId: string;
  restaurantName?: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
  restaurantImage?: string;
  restaurantLatitude?: string;
  restaurantLongitude?: string;
  driverId?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  todayOrders: number;
  todayEarnings: number;
  completedToday: number;
  totalOrders: number;
  totalEarnings: number;
  averageRating: number;
}

interface EnhancedDriverDashboardProps {
  driverId: string;
  onLogout: () => void;
}

export default function EnhancedDriverDashboard({ driverId, onLogout }: EnhancedDriverDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline'>('available');
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const driverToken = localStorage.getItem('driver_token');

  // WebSocket Connection
  useEffect(() => {
    if (!driverId) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      ws.send(JSON.stringify({
        type: 'auth',
        payload: { userId: driverId }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'order_update') {
          queryClient.invalidateQueries({ queryKey: [`/api/driver/dashboard`] });
          toast({ title: 'تحديث جديد', description: 'تم تحديث حالة أحد الطلبات' });
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [driverId, queryClient, toast]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/driver/dashboard`],
    queryFn: async () => {
      const response = await fetch(`/api/driver/dashboard`, {
        headers: {
          'Authorization': `Bearer ${driverToken}`
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
          throw new Error('انتهت الجلسة');
        }
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    refetchInterval: 15000,
    enabled: !!driverToken
  });

  const { 
    availableOrders = [], 
    currentOrders = [], 
    stats = {} as DashboardStats 
  } = dashboardData || {};

  // Accept order mutation
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/driver/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driverToken}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to accept order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/driver/dashboard`] });
      setAcceptingOrderId(null);
      toast({ title: 'تم قبول الطلب بنجاح', description: 'يمكنك الآن البدء في التوصيل' });
      setActiveTab('active');
    },
    onError: (error: any) => {
      setAcceptingOrderId(null);
      toast({
        title: 'فشل في قبول الطلب',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/driver/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driverToken}`
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update order status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/driver/dashboard`] });
      toast({ title: 'تم تحديث حالة الطلب بنجاح' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'فشل في تحديث حالة الطلب', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation([lat, lng]);
          
          // Send location update to server via WebSocket
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'location_update',
              payload: {
                driverId,
                latitude: lat,
                longitude: lng
              }
            }));
          }
        },
        (error) => {
          console.error('خطأ في الحصول على الموقع:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [socket, driverId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500 text-white';
      case 'busy': return 'bg-orange-500 text-white';
      case 'offline': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'busy': return 'مشغول';
      case 'offline': return 'غير متاح';
      default: return 'غير معروف';
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const config: { [key: string]: { label: string; color: string } } = {
      pending: { label: 'معلق', color: 'bg-yellow-500' },
      confirmed: { label: 'مؤكد', color: 'bg-blue-500' },
      preparing: { label: 'قيد التحضير', color: 'bg-orange-500' },
      ready: { label: 'جاهز', color: 'bg-green-500' },
      picked_up: { label: 'تم الاستلام', color: 'bg-blue-600' },
      on_way: { label: 'في الطريق', color: 'bg-purple-500' },
      delivered: { label: 'تم التوصيل', color: 'bg-green-600' },
      cancelled: { label: 'ملغي', color: 'bg-red-500' },
    };
    const { label, color } = config[status] || config.pending;
    return <Badge className={`${color} text-white border-none`}>{label}</Badge>;
  };

  const dashboardStats: DashboardStats = (stats as DashboardStats) || {
    todayOrders: 0,
    todayEarnings: 0,
    completedToday: 0,
    totalOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
  };

  // Nav Items
  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Activity },
    { id: 'available', label: 'الطلبات المتاحة', icon: Bell },
    { id: 'active', label: 'الطلبات النشطة', icon: Package },
    { id: 'wallet', label: 'المحفظة', icon: DollarSign },
    { id: 'map', label: 'الخريطة', icon: MapPinned },
    { id: 'history', label: 'السجل', icon: History },
    { id: 'stats', label: 'الإحصائيات', icon: TrendingUp },
    { id: 'profile', label: 'الملف الشخصي', icon: User },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-right" dir="rtl">
      <div className="p-6 border-b">
        <div className="flex items-center justify-end gap-3">
          <div className="text-right">
            <h2 className="text-lg font-bold">تطبيق السائق</h2>
            <p className="text-xs text-gray-500">ID: {driverId.slice(-6)}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <Truck className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id && !selectedOrderId ? 'default' : 'ghost'}
              className={`w-full justify-end gap-3 ${activeTab === item.id && !selectedOrderId ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => { setActiveTab(item.id); setSelectedOrderId(null); setSidebarOpen(false); }}
            >
              <span>{item.label}</span>
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          onClick={() => { onLogout(); setSidebarOpen(false); }}
          className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border-red-100"
        >
          <span>تسجيل الخروج</span>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Render correct page content based on activeTab
  const renderContent = () => {
    if (selectedOrderId) {
      return (
        <OrderDetailsPage 
          orderId={selectedOrderId} 
          onBack={() => setSelectedOrderId(null)}
          onStatusUpdate={(status) => updateOrderStatusMutation.mutate({ orderId: selectedOrderId, status })}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 p-4" dir="rtl">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm bg-blue-50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-blue-600 mb-1">أرباح اليوم</p>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(dashboardStats.todayEarnings)}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-green-50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-green-600 mb-1">طلبات اليوم</p>
                  <p className="text-xl font-bold text-green-900">{dashboardStats.todayOrders}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-purple-50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-purple-600 mb-1">المحفظة</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(parseFloat(dashboardData?.balance?.availableBalance || "0"))}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-orange-50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-orange-600 mb-1">التقييم</p>
                  <p className="text-xl font-bold text-orange-900">{dashboardStats.averageRating || '4.8'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Orders Section */}
            {currentOrders.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center justify-end gap-2">
                  <span>الطلبات النشطة</span>
                  <Package className="h-5 w-5 text-green-600" />
                </h3>
                <div className="grid gap-4">
                  {currentOrders.map((order: any) => (
                    <Card key={order.id} className="overflow-hidden border-2 border-green-100">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge className="bg-green-600 text-white border-none">نشط</Badge>
                          <div className="text-right">
                            <p className="font-bold">طلب #{order.orderNumber || order.id.slice(-6)}</p>
                            <p className="text-sm text-gray-500">{order.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-sm text-gray-600 mb-4">
                          <span>{order.deliveryAddress}</span>
                          <MapPin className="h-4 w-4" />
                        </div>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          عرض التفاصيل والمتابعة
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Available Orders Shortcut */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button variant="ghost" className="text-green-600" onClick={() => setActiveTab('available')}>عرض الكل</Button>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>طلبات متاحة بالقرب منك</span>
                  <Bell className="h-5 w-5 text-orange-500" />
                </h3>
              </div>
              
              {availableOrders.length === 0 ? (
                <Card className="bg-gray-50 border-dashed border-2">
                  <CardContent className="p-8 text-center text-gray-500">
                    لا توجد طلبات متاحة حالياً. تأكد من أن حالتك "متاح"
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {availableOrders.slice(0, 3).map((order: any) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-bold text-green-600">{formatCurrency(parseFloat(order.totalAmount))}</p>
                          <p className="font-bold">طلب #{order.orderNumber || order.id.slice(-6)}</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-sm text-gray-600 mb-4">
                          <span className="truncate max-w-[200px]">{order.deliveryAddress}</span>
                          <MapPin className="h-4 w-4" />
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => acceptOrderMutation.mutate(order.id)}
                          disabled={acceptOrderMutation.isPending}
                        >
                          {acceptOrderMutation.isPending ? 'جاري القبول...' : 'قبول الطلب فوراً'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'available':
        return <AvailableOrdersPage onAcceptOrder={(id) => acceptOrderMutation.mutate(id)} />;
      case 'active':
        return <ActiveOrdersPage onSelectOrder={setSelectedOrderId} />;
      case 'wallet':
        return <WalletPage />;
      case 'map':
        return <div className="h-[calc(100vh-120px)] p-4"><DriverMapView currentLocation={currentLocation} orders={ordersForMap} /></div>;
      case 'history':
        return <HistoryPage onSelectOrder={setSelectedOrderId} />;
      case 'stats':
        return <StatsPage />;
      case 'profile':
        return <ProfilePage onLogout={onLogout} />;
      default:
        return <div>قيد التطوير...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Top Nav */}
      <div className="lg:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-green-600" />
          <span className="font-bold text-lg">تطبيق السائق</span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${driverStatus === 'available' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white border-b h-16 items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <Badge className={getStatusColor(driverStatus)}>
              {getStatusText(driverStatus)}
            </Badge>
            <div className="text-sm text-gray-500">
              {currentLocation ? `إحداثياتك: ${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}` : 'جاري جلب موقعك...'}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
              {stats.averageRating || '4.8'}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
          {renderContent()}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden bg-white border-t flex justify-around p-2 sticky bottom-0 z-50">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center gap-1 h-auto py-1 ${activeTab === 'dashboard' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('dashboard'); setSelectedOrderId(null); }}
          >
            <Activity className="h-5 w-5" />
            <span className="text-[10px]">الرئيسية</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center gap-1 h-auto py-1 ${activeTab === 'available' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('available'); setSelectedOrderId(null); }}
          >
            <Bell className="h-5 w-5" />
            <span className="text-[10px]">المتاحة</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center gap-1 h-auto py-1 ${activeTab === 'active' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('active'); setSelectedOrderId(null); }}
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px]">النشطة</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center gap-1 h-auto py-1 ${activeTab === 'wallet' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('wallet'); setSelectedOrderId(null); }}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-[10px]">المحفظة</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center gap-1 h-auto py-1 ${activeTab === 'profile' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('profile'); setSelectedOrderId(null); }}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px]">حسابي</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
