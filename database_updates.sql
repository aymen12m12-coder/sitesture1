-- ملف تحديثات قاعدة البيانات لـ طمطوم ماركت
-- تاريخ التحديث: 2026-03-02

-- 1. تحديث جدول المستخدمين (العملاء)
-- إضافة حقل الدولة وتبسيط القيود
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" VARCHAR(100);
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;
-- ملاحظة: تم استخدام رقم الهاتف كـ username لتبسيط تسجيل الدخول

-- 2. تحديث جدول السائقين
-- إضافة حقل كلمة المرور والأرباح إذا لم تكن موجودة
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "earnings" DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;

-- 3. تحديث جدول العروض الخاصة
-- التأكد من وجود حقل الصورة والحالة وربطها بالتصنيفات
ALTER TABLE "special_offers" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "special_offers" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;
ALTER TABLE "special_offers" ADD COLUMN IF NOT EXISTS "category_id" UUID REFERENCES "categories"("id");

-- 4. تحديث جدول الطلبات
-- إضافة حقول الأرباح التفصيلية للسائق والمطعم والشركة
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "driver_earnings" DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "restaurant_earnings" DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "company_earnings" DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "distance" DECIMAL(10, 2) DEFAULT 0;

-- 5. إنشاء جدول تتبع الطلبات (إذا لم يكن موجوداً)
CREATE TABLE IF NOT EXISTS "order_tracking" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL REFERENCES "orders"("id"),
    "status" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "created_by_type" VARCHAR(50) NOT NULL, -- 'system', 'admin', 'driver'
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- 6. إنشاء تصنيف "العروض" تلقائياً (اختياري عبر SQL)
-- سيتم التعامل معه برمجياً في السيرفر لضمان المرونة
