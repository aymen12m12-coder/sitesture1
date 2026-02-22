import { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Clock, CheckCircle, Bell, Package, DollarSign, User, 
  BarChart3, Navigation, LogOut, Wallet, Menu, X, ChevronRight,
  TrendingUp, Award, Calendar, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  totalAmount: string;
  estimatedTime: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
  deliveryFee?: string;
  subtotal?: string;
  customerLocationLat?: string;
  customerLocationLng?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  earnings: string;
  isAvailable: boolean;
  todayEarnings?: string;
  todayOrders?: number;
  weeklyEarnings?: string;
  rating?: number;
  vehicle?: string;
  licenseNumber?: string;
}

interface DriverStats {
  today: {
    orders: number;
    earnings: number;
    deliveries: number;
  };
  week: {
    orders: number;
    earnings: number;
  };
  total: {
    orders: number;
    earnings: number;
    rating: number;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

interface Wallet {
  balance: number;
  totalEarnings: number;
  withdrawn: number;
  pending: number;
}

const STEPS = [
  { id: 'available', label: 'الطلبات المتاحة', icon: Package },
  { id: 'accepted', label: 'طلباتي', icon: Navigation },
  { id: 'stats', label: 'الإحصائيات', icon: BarChart3 },
  { id: 'wallet', label: 'المحفظة', icon: Wallet },
  { id: 'profile', label: 'الملف الشخصي', icon: User },
];

export const DriverDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('available');
  const [isLoading, setIsLoading] = useState(false);
  const [driverId, setDriverId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('driver_token');
    const driverData = localStorage.getItem('driver_user');
    
    if (token && driverData) {
      try {
        const user = JSON.parse(driverData);
        setDriverId(user.id);
        setDriver(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing driver data:', error);
        onLogout();
      }
    } else {
      window.location.href = '/driver-login';
    }
  }, [onLogout]);

  useEffect(() => {
    if (!isAuthenticated || !driverId) return;

    fetchAllData();
    
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, driverId]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchDriverInfo(),
      fetchAvailableOrders(),
      fetchMyOrders(),
      fetchNotifications(),
      fetchDriverStats(),
      fetchDriverWallet()
    ]);
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('driver_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      onLogout();
      throw new Error('Authentication failed');
    }
    
    return response;
  };

  const fetchDriverInfo = async () => {
    try {
      const response = await fetchWithAuth(`/api/drivers/${driverId}`);
      const data = await response.json();
      setDriver(data);
    } catch (error) {
      console.error('Error fetching driver info:', error);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const response = await fetchWithAuth(`/api/orders?status=confirmed`);
      const data = await response.json();
      setAvailableOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await fetchWithAuth(`/api/orders?driverId=${driverId}`);
      const data = await response.json();
      setMyOrders(Array.isArray(data) ? data.filter((o: Order) => ['assigned', 'picked_up', 'on_way'].includes(o.status)) : []);
    } catch (error) {
      console.error('Error fetching my orders:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetchWithAuth(`/api/notifications?recipientType=driver&recipientId=${driverId}`);
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchDriverStats = async () => {
    try {
      const response = await fetchWithAuth(`/api/drivers/${driverId}/stats`);
      const data = await response.json();
      setStats(data.stats || data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDriverWallet = async () => {
    try {
      const response = await fetchWithAuth(`/api/drivers/${driverId}/wallet`);
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const acceptOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`/api/orders/${orderId}/assign-driver`, {
        method: 'PUT',
        body: JSON.stringify({ driverId })
      });
      
      if (response.ok) {
        toast({
          title: "✅ تم قبول الطلب",
          description: "تم إضافة الطلب إلى قائمة طلباتك",
        });
        await fetchAllData();
      }
    } catch (error) {
      toast({
        title: "❌ خطأ",
        description: "فشل في قبول الطلب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetchWithAuth(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast({
          title: "✅ تم التحديث",
          description: `تم تحديث حالة الطلب إلى: ${getStatusText(status)}`,
        });
        await fetchAllData();
      }
    } catch (error) {
      toast({
        title: "❌ خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async () => {
    if (!driver) return;
    
    try {
      const response = await fetchWithAuth(`/api/drivers/${driverId}`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable: !driver.isAvailable })
      });
      
      if (response.ok) {
        setDriver({ ...driver, isAvailable: !driver.isAvailable });
        toast({
          title: driver.isAvailable ? "🔴 تم تعطيل الحالة" : "🟢 تم تفعيل الحالة",
        });
      }
    } catch (error) {
      toast({
        title: "❌ خطأ",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'assigned': '✓ تم التكليف',
      'picked_up': '📦 تم الاستلام',
      'on_way': '🚗 في الطريق',
      'delivered': '✅ تم التسليم',
      'confirmed': '⏳ قيد الانتظار',
    };
    return statusMap[status] || status;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} hidden lg:block bg-white shadow-lg transition-all duration-300 overflow-hidden`}>
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} availableOrders={availableOrders} myOrders={myOrders} stats={stats} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <SidebarContent activeTab={activeTab} setActiveTab={() => setSidebarOpen(false)} availableOrders={availableOrders} myOrders={myOrders} stats={stats} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  مرحباً {driver?.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {driver?.isAvailable ? '🟢 متاح حالياً' : '🔴 غير متاح'}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                  <Bell className="text-gray-600 cursor-pointer" size={20} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </div>

                <button
                  onClick={toggleAvailability}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    driver?.isAvailable
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {driver?.isAvailable ? '✓ متاح' : 'غير متاح'}
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            {activeTab === 'available' && (
              <AvailableOrdersSection orders={availableOrders} isLoading={isLoading} onAccept={acceptOrder} driver={driver} />
            )}
            {activeTab === 'accepted' && (
              <MyOrdersSection orders={myOrders} onStatusUpdate={updateOrderStatus} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
            )}
            {activeTab === 'stats' && (
              <StatsSection stats={stats} driver={driver} />
            )}
            {activeTab === 'wallet' && (
              <WalletSection wallet={wallet} withdrawalAmount={withdrawalAmount} setWithdrawalAmount={setWithdrawalAmount} driverId={driverId} fetchWallet={fetchDriverWallet} />
            )}
            {activeTab === 'profile' && (
              <ProfileSection driver={driver} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function SidebarContent({ activeTab, setActiveTab, availableOrders, myOrders, stats }: any) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-bold text-gray-900">📍 تطبيق السائق</h2>
        <p className="text-sm text-gray-600">طمطوم للتوصيل</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;
          return (
            <button
              key={step.id}
              onClick={() => {
                setActiveTab(step.id);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-right ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronRight size={18} className={isActive ? 'translate-x-1' : ''} />
              <Icon size={20} />
              <span className="flex-1">{step.label}</span>
              {step.id === 'available' && availableOrders?.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                  {availableOrders.length}
                </span>
              )}
              {step.id === 'accepted' && myOrders?.length > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                  {myOrders.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">أرباح اليوم:</span>
            <span className="font-bold text-green-600">{formatCurrency(stats?.today?.earnings || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">الطلبات اليوم:</span>
            <span className="font-bold text-blue-600">{stats?.today?.orders || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">التقييم:</span>
            <span className="font-bold text-yellow-600">⭐ {stats?.total?.rating?.toFixed(1) || '0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvailableOrdersSection({ orders, isLoading, onAccept, driver }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📦 الطلبات المتاحة</h2>
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-sm">
          {orders.length} طلب
        </span>
      </div>

      {!driver?.isAvailable && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <p className="text-yellow-800">
              <strong>تنبيه:</strong> يجب تفعيل حالة "متاح" لرؤية الطلبات الجديدة
            </p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">لا توجد طلبات متاحة حالياً</p>
          <p className="text-gray-400 text-sm">تحقق لاحقاً من الطلبات الجديدة</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {orders.map((order: Order) => (
            <OrderCard key={order.id} order={order} isLoading={isLoading} onAccept={onAccept} actionType="accept" />
          ))}
        </div>
      )}
    </div>
  );
}

function MyOrdersSection({ orders, onStatusUpdate, selectedOrder, setSelectedOrder }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">🚗 طلباتي الحالية</h2>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold text-sm">
          {orders.length} طلب
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Navigation className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">لا توجد طلبات حالية</p>
          <p className="text-gray-400 text-sm">اقبل طلباً من قسم الطلبات المتاحة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusUpdate={onStatusUpdate} 
              actionType="status"
              isSelected={selectedOrder?.id === order.id}
              onSelect={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, isLoading, onAccept, onStatusUpdate, actionType, isSelected, onSelect }: any) {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
  const nextAction = actionType === 'status' ? getNextAction(order.status) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'text-blue-600';
      case 'picked_up': return 'text-yellow-600';
      case 'on_way': return 'text-orange-600';
      case 'delivered': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'assigned': '✓ تم التكليف',
      'picked_up': '📦 تم الاستلام',
      'on_way': '🚗 في الطريق',
      'delivered': '✅ تم التسليم',
      'confirmed': '⏳ قيد الانتظار',
    };
    return statusMap[status] || status;
  };

  return (
    <div className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
      isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4" onClick={onSelect}>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{order.customerName}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Phone size={16} />
              <a href={`tel:${order.customerPhone}`} className="hover:text-blue-600">
                {order.customerPhone}
              </a>
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</div>
            {actionType === 'status' && (
              <span className={`text-sm font-bold mt-2 block ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <div className="flex gap-3">
            <MapPin className="text-red-500 flex-shrink-0 mt-1" size={18} />
            <div className="flex-1">
              <p className="text-gray-700 font-medium">{order.deliveryAddress}</p>
              {order.notes && (
                <p className="text-sm text-gray-600 mt-2">📝 {order.notes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        {isSelected && items.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3">📋 تفاصيل الطلب:</h4>
            <div className="space-y-2">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} × <span className="font-bold">{item.quantity}</span>
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(parseFloat(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {actionType === 'accept' ? (
            <button
              onClick={() => onAccept(order.id)}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              {isLoading ? 'جاري...' : 'قبول الطلب'}
            </button>
          ) : nextAction ? (
            <>
              <button
                onClick={() => onStatusUpdate(order.id, nextAction.action)}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
              >
                {nextAction.label}
              </button>
              <a
                href={`tel:${order.customerPhone}`}
                className="bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Phone size={18} />
                اتصال
              </a>
            </>
          ) : (
            <div className="w-full bg-green-50 border-2 border-green-300 rounded-lg p-3 text-center">
              <p className="text-green-800 font-bold">✅ تم تسليم الطلب</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsSection({ stats, driver }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">📊 الإحصائيات والأرباح</h2>

      {/* Today Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="طلبات اليوم"
          value={stats?.today?.orders || 0}
          icon={<Package className="text-blue-600" size={28} />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="أرباح اليوم"
          value={formatCurrency(stats?.today?.earnings || 0)}
          icon={<DollarSign className="text-green-600" size={28} />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="التقييم"
          value={`⭐ ${stats?.total?.rating?.toFixed(1) || 0}`}
          icon={<Award className="text-yellow-600" size={28} />}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Weekly Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          إحصائيات الأسبوع
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-600 text-sm">الطلبات</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.week?.orders || 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-600 text-sm">الأرباح</p>
            <p className="text-3xl font-bold text-green-600">{stats?.week?.earnings?.toFixed(2) || 0}</p>
          </div>
        </div>
      </div>

      {/* Total Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-6">
        <h3 className="font-bold mb-4 text-lg">📈 الإجمالي</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-blue-100 text-sm">الطلبات</p>
            <p className="text-2xl font-bold">{stats?.total?.orders || 0}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">الأرباح</p>
            <p className="text-2xl font-bold">{formatCurrency(stats?.total?.earnings || 0)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">التقييم</p>
            <p className="text-2xl font-bold">⭐ {stats?.total?.rating?.toFixed(1) || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }: any) {
  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function WalletSection({ wallet, withdrawalAmount, setWithdrawalAmount, driverId, fetchWallet }: any) {
  const { toast } = useToast();

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      toast({
        title: "❌ خطأ",
        description: "الرجاء إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    if (wallet && parseFloat(withdrawalAmount) > wallet.balance) {
      toast({
        title: "❌ خطأ",
        description: "الرصيد غير كافي",
        variant: "destructive",
      });
      return;
    }

    try {
      const accountNumber = prompt('أدخل رقم الحساب البنكي:');
      const bankName = prompt('أدخل اسم البنك:');
      const accountHolder = prompt('أدخل اسم صاحب الحساب:');

      if (!accountNumber || !bankName || !accountHolder) {
        return;
      }

      const response = await fetch(`/api/drivers/${driverId}/withdrawal-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          accountNumber,
          bankName,
          accountHolder
        })
      });

      if (response.ok) {
        toast({
          title: "✅ نجاح",
          description: "تم تقديم طلب السحب بنجاح",
        });
        setWithdrawalAmount('');
        await fetchWallet();
      }
    } catch (error) {
      toast({
        title: "❌ خطأ",
        description: "فشل في تقديم طلب السحب",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">💰 المحفظة</h2>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="الرصيد الحالي"
          value={formatCurrency(wallet?.balance || 0)}
          icon={<Wallet className="text-blue-600" size={28} />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="إجمالي الأرباح"
          value={formatCurrency(wallet?.totalEarnings || 0)}
          icon={<TrendingUp className="text-green-600" size={28} />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="المسحوب"
          value={formatCurrency(wallet?.withdrawn || 0)}
          icon={<Eye className="text-orange-600" size={28} />}
          bgColor="bg-orange-50"
        />
        <StatCard
          title="المعلق"
          value={formatCurrency(wallet?.pending || 0)}
          icon={<Clock className="text-yellow-600" size={28} />}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-bold text-gray-900 mb-4">🏦 طلب السحب</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
            <input
              type="number"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              max={wallet?.balance || 0}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="أدخل المبلغ المراد سحبه"
            />
            <p className="text-xs text-gray-500 mt-1">الحد الأقصى: {formatCurrency(wallet?.balance || 0)}</p>
          </div>
          <button
            onClick={handleWithdrawal}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            طلب السحب
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ driver }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">👤 الملف الشخصي</h2>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">الاسم</label>
          <p className="text-lg font-bold text-gray-900">{driver?.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">رقم الهاتف</label>
          <a href={`tel:${driver?.phone}`} className="text-blue-600 hover:underline font-medium">
            {driver?.phone}
          </a>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">المركبة</label>
          <p className="text-gray-900">{driver?.vehicle || 'غير محدد'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">رقم الرخصة</label>
          <p className="text-gray-900">{driver?.licenseNumber || 'غير محدد'}</p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            <strong>حالة الحساب:</strong> {driver?.isAvailable ? '🟢 نشط' : '🔴 معطل'}
          </p>
        </div>
      </div>
    </div>
  );
}

function getNextAction(status: string) {
  switch (status) {
    case 'assigned': return { action: 'picked_up', label: '📦 تم الاستلام من المطعم' };
    case 'picked_up': return { action: 'on_way', label: '🚗 في الطريق للعميل' };
    case 'on_way': return { action: 'delivered', label: '✅ تم التسليم' };
    default: return null;
  }
}
