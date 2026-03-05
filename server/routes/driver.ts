import express from "express";
import { storage } from "../storage";
import { z } from "zod";
import { coerceRequestData } from "../utils/coercion";
import { requireDriverAuth, AuthenticatedRequest } from "../utils/auth-middleware";

const router = express.Router();

// تطبيق ميدل وير المصادقة على جميع مسارات السائق
router.use(requireDriverAuth);

// لوحة معلومات السائق مع تفاصيل الرصيد
router.get("/dashboard", async (req: AuthenticatedRequest, res) => {
  try {
    const driverId = req.driverId!;
    
    // التحقق من وجود السائق
    const driver = await storage.getDriver(driverId);
    if (!driver) {
      return res.status(404).json({ error: "السائق غير موجود" });
    }

    // جلب جميع الطلبات وفلترتها
    const allOrders = await storage.getOrders();
    const driverOrders = allOrders.filter(order => order.driverId === driverId);
    
    // جلب معلومات الرصيد
    const driverBalance = await storage.getDriverBalance(driverId);
    const driverTransactions = await storage.getDriverTransactions(driverId);
    const driverCommissions = await storage.getDriverCommissions(driverId);
    
    // حساب الإحصائيات
    const today = new Date().toDateString();
    const todayOrders = driverOrders.filter(order => 
      order.createdAt.toDateString() === today
    );
    const completedToday = todayOrders.filter(order => order.status === "delivered");
    
    // حساب الأرباح من العمولات
    const commissionsToday = driverCommissions.filter(commission => 
      new Date(commission.createdAt).toDateString() === today
    );
    const todayEarnings = commissionsToday.reduce((sum, commission) => 
      sum + (parseFloat(commission.commissionAmount.toString()) || 0), 0
    );
    
    const totalEarnings = driverCommissions.reduce((sum, commission) => 
      sum + (parseFloat(commission.commissionAmount.toString()) || 0), 0
    );

    // الطلبات المتاحة (المُعيَّنة لهذا السائق ولكن لم يقبلها بعد)
    const availableOrders = allOrders
      .filter(order => order.status === "confirmed" && (order.driverId === driverId || !order.driverId))
      .slice(0, 10);

    // الطلبات الحالية للسائق
    const currentOrders = driverOrders.filter(order => 
      order.status === "picked_up" || order.status === "ready" || order.status === "on_way"
    );

    // الطلبات المعلقة التي تحتوي على عمولات
    const pendingOrders = allOrders.filter(order => 
      order.status === "delivered" && 
      order.driverId === driverId &&
      !order.commissionProcessed
    );

    res.json({
      stats: {
        todayOrders: todayOrders.length,
        todayEarnings,
        completedToday: completedToday.length,
        totalOrders: driverOrders.length,
        totalEarnings,
        availableBalance: driverBalance?.availableBalance || 0,
        withdrawnAmount: driverBalance?.withdrawnAmount || 0,
        totalCommissions: driverCommissions.length,
        averageRating: driver.averageRating || 4.5
      },
      availableOrders,
      currentOrders,
      pendingOrders,
      recentTransactions: driverTransactions.slice(0, 5),
      recentCommissions: driverCommissions.slice(0, 5)
    });
  } catch (error) {
    console.error("خطأ في لوحة معلومات السائق:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// قبول طلب مع احتساب العمولة تلقائيًا
router.post("/orders/:id/accept", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driverId!;
    
    // التحقق من وجود السائق
    const driver = await storage.getDriver(driverId);
    if (!driver) {
      return res.status(404).json({ error: "السائق غير موجود" });
    }

    // جلب الطلب
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }

    // التحقق من إمكانية قبول الطلب
    if (order.status !== "confirmed" || (order.driverId && order.driverId !== driverId)) {
      return res.status(400).json({ error: "لا يمكن قبول هذا الطلب" });
    }

    // حساب العمولة
    const commissionRate = driver.commissionRate || 70; // نسبة العمولة الافتراضية
    const orderAmount = parseFloat(order.totalAmount) || 0;
    const commissionAmount = (orderAmount * commissionRate) / 100;

    // تحديث الطلب
    const updatedOrder = await storage.updateOrder(id, {
      driverId,
      status: "ready",
      driverCommissionRate: commissionRate,
      driverCommissionAmount: commissionAmount.toString(),
      commissionProcessed: false
    });

    res.json({ 
      success: true, 
      order: updatedOrder,
      commissionAmount,
      commissionRate 
    });
  } catch (error) {
    console.error("خطأ في قبول الطلب:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// تحديث حالة الطلب مع معالجة العمولة عند التسليم
router.put("/orders/:id/status", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;
    const driverId = req.driverId!;
    
    if (!status) {
      return res.status(400).json({ error: "الحالة مطلوبة" });
    }

    // جلب الطلب والتحقق من صلاحية السائق
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }

    if (order.driverId !== driverId) {
      return res.status(403).json({ error: "غير مصرح بتحديث هذا الطلب" });
    }

    // التحقق من الحالات المسموحة
    const allowedStatuses = ["ready", "picked_up", "on_way", "delivered"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "حالة غير صحيحة" });
    }

    // إعداد بيانات التحديث
    const updateData: any = { status };
    if (location) {
      updateData.currentLocation = location;
    }
    
    if (status === "delivered") {
      updateData.actualDeliveryTime = new Date();
      
      // إذا كان هناك عمولة ولم تتم معالجتها
      if (order.driverCommissionAmount && !order.commissionProcessed) {
        // إنشاء سجل العمولة
        const commission = await storage.createDriverCommission({
          driverId,
          orderId: id,
          orderAmount: parseFloat(order.totalAmount) || 0,
          commissionRate: order.driverCommissionRate || 70,
          commissionAmount: parseFloat(order.driverCommissionAmount) || 0,
          status: 'approved'
        });
        
        // تحديث الرصيد
        await storage.updateDriverBalance(driverId, {
          amount: parseFloat(order.driverCommissionAmount) || 0,
          type: 'commission',
          description: `عمولة توصيل الطلب رقم: ${order.orderNumber}`,
          orderId: order.id
        });
        
        // تحديث الطلب لتمييز أن العمولة تمت معالجتها
        updateData.commissionProcessed = true;
      }
    }

    const updatedOrder = await storage.updateOrder(id, updateData);
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("خطأ في تحديث حالة الطلب:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// جلب تفاصيل طلب محدد مع معلومات العمولة
router.get("/orders/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driverId!;
    
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }

    // التحقق من صلاحية السائق
    if (order.driverId !== driverId) {
      return res.status(403).json({ error: "غير مصرح بعرض هذا الطلب" });
    }

    // جلب معلومات العمولة إن وجدت
    let commissionInfo = null;
    if (order.driverCommissionAmount) {
      commissionInfo = {
        rate: order.driverCommissionRate || 70,
        amount: order.driverCommissionAmount,
        processed: order.commissionProcessed || false
      };
    }

    res.json({
      ...order,
      commissionInfo
    });
  } catch (error) {
    console.error("خطأ في جلب تفاصيل الطلب:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// جلب طلبات السائق مع تفاصيل العمولة
router.get("/orders", async (req: AuthenticatedRequest, res) => {
  try {
    const driverId = req.driverId!;
    const { status } = req.query;
    
    // جلب جميع الطلبات وفلترتها
    const allOrders = await storage.getOrders();
    let driverOrders = allOrders.filter(order => order.driverId === driverId);
    
    // فلترة حسب الحالة إذا تم توفيرها
    if (status && typeof status === 'string') {
      driverOrders = driverOrders.filter(order => order.status === status);
    }
    
    // ترتيب حسب تاريخ الإنشاء
    driverOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // إضافة معلومات العمولة لكل طلب
    const ordersWithCommissions = driverOrders.map(order => ({
      ...order,
      commission: order.driverCommissionAmount ? {
        rate: order.driverCommissionRate,
        amount: order.driverCommissionAmount,
        processed: order.commissionProcessed
      } : null
    }));

    res.json(ordersWithCommissions);
  } catch (error) {
    console.error("خطأ في جلب طلبات السائق:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// جلب إحصائيات السائق مع تفاصيل الرصيد
router.get("/stats", async (req: AuthenticatedRequest, res) => {
  try {
    const driverId = req.driverId!;
    
    // التحقق من وجود السائق
    const driver = await storage.getDriver(driverId);
    if (!driver) {
      return res.status(404).json({ error: "السائق غير موجود" });
    }

    // جلب معلومات الرصيد والعمولات
    const driverBalance = await storage.getDriverBalance(driverId);
    const driverCommissions = await storage.getDriverCommissions(driverId);
    const driverTransactions = await storage.getDriverTransactions(driverId);
    
    // جلب طلبات السائق
    const allOrders = await storage.getOrders();
    const driverOrders = allOrders.filter(order => order.driverId === driverId);
    const deliveredOrders = driverOrders.filter(order => order.status === "delivered");
    
    // حساب الإحصائيات
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyCommissions = driverCommissions.filter(commission => 
      new Date(commission.createdAt) >= thisMonth
    );
    
    const totalEarnings = driverCommissions.reduce((sum, commission) => 
      sum + (parseFloat(commission.commissionAmount.toString()) || 0), 0
    );
    
    const monthlyEarnings = monthlyCommissions.reduce((sum, commission) => 
      sum + (parseFloat(commission.commissionAmount.toString()) || 0), 0
    );

    // المعاملات الحديثة
    const recentTransactions = driverTransactions.slice(0, 10);

    res.json({
      totalOrders: driverOrders.length,
      completedOrders: deliveredOrders.length,
      totalEarnings,
      monthlyOrders: monthlyCommissions.length,
      monthlyEarnings,
      availableBalance: driverBalance?.availableBalance || 0,
      withdrawnAmount: driverBalance?.withdrawnAmount || 0,
      totalBalance: driverBalance?.totalBalance || 0,
      pendingWithdrawal: driverBalance?.pendingAmount || 0,
      averageRating: driver.averageRating || 4.5,
      successRate: driverOrders.length > 0 ? 
        Math.round((deliveredOrders.length / driverOrders.length) * 100) : 0,
      commissionRate: driver.commissionRate || 70,
      recentTransactions
    });
  } catch (error) {
    console.error("خطأ في جلب إحصائيات السائق:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// تحديث الملف الشخصي للسائق
router.put("/profile", async (req: AuthenticatedRequest, res) => {
  try {
    const coercedData = coerceRequestData(req.body);
    const driverId = req.driverId!;
    const updateData = coercedData;
    
    // إزالة أي حقول غير مسموحة
    const allowedFields = ['name', 'phone', 'email', 'currentLocation', 'isAvailable'];
    const sanitizedData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    }

    const updatedDriver = await storage.updateDriver(driverId, sanitizedData);
    
    if (!updatedDriver) {
      return res.status(404).json({ error: "السائق غير موجود" });
    }

    res.json({ success: true, driver: updatedDriver });
  } catch (error) {
    console.error("خطأ في تحديث الملف الشخصي:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// جلب تفاصيل الرصيد والمعاملات
router.get("/balance", async (req: AuthenticatedRequest, res) => {
  try {
    const driverId = req.driverId!;
    
    // التحقق من وجود السائق
    const driver = await storage.getDriver(driverId);
    if (!driver) {
      return res.status(404).json({ error: "السائق غير موجود" });
    }

    const driverBalance = await storage.getDriverBalance(driverId);
    const driverTransactions = await storage.getDriverTransactions(driverId);
    const driverCommissions = await storage.getDriverCommissions(driverId);
    const driverWithdrawals = await storage.getDriverWithdrawals(driverId);

    res.json({
      balance: driverBalance || {
        availableBalance: "0",
        totalBalance: "0",
        withdrawnAmount: "0",
        pendingAmount: "0"
      },
      transactions: driverTransactions,
      commissions: driverCommissions,
      withdrawals: driverWithdrawals
    });
  } catch (error) {
    console.error("خطأ في جلب بيانات الرصيد:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// طلب سحب رصيد
router.post("/withdraw", async (req: AuthenticatedRequest, res) => {
  try {
    const driverId = req.driverId!;
    const { amount, method, details } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "مبلغ غير صحيح" });
    }

    // التحقق من الرصيد المتاح
    const balance = await storage.getDriverBalance(driverId);
    const available = parseFloat(balance?.availableBalance || "0");

    if (amount > available) {
      return res.status(400).json({ error: "الرصيد غير كافٍ" });
    }

    const withdrawal = await storage.createDriverWithdrawal({
      driverId,
      amount: amount.toString(),
      status: 'pending',
      paymentMethod: method || 'cash',
      paymentDetails: details || ''
    });

    res.json({ success: true, withdrawal });
  } catch (error) {
    console.error("خطأ في طلب السحب:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
