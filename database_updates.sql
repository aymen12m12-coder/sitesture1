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

-- 6. تحديث جدول السائقين (إحصائيات)
-- إضافة حقل عدد الطلبات المكتملة للسائق
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "completed_orders" INTEGER DEFAULT 0 NOT NULL;

-- 7. تحديث جدول الطلبات (تعديلات دورة الحياة)
-- ضمان وجود الحقول اللازمة لتعيين السائق وحساب الأرباح
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "driver_id" UUID REFERENCES "drivers"("id");
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "restaurant_id" UUID REFERENCES "restaurants"("id");

-- 8. إنشاء جدول المحفظة للسائقين (إذا لم يكن موجوداً)
CREATE TABLE IF NOT EXISTS "driver_wallets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "driver_id" UUID NOT NULL UNIQUE REFERENCES "drivers"("id"),
    "balance" DECIMAL(10, 2) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 10. تحسين الأداء (Indexing) لسرعة الاستجابة
-- تحسين سرعة البحث عن المنتجات حسب التصنيف والمطعم
CREATE INDEX IF NOT EXISTS "idx_menu_items_category" ON "menu_items" ("category");
CREATE INDEX IF NOT EXISTS "idx_menu_items_restaurant" ON "menu_items" ("restaurant_id");
CREATE INDEX IF NOT EXISTS "idx_menu_items_special" ON "menu_items" ("is_special_offer") WHERE "is_special_offer" = true;

-- تحسين سرعة جلب طلبات العميل (عبر رقم الهاتف)
CREATE INDEX IF NOT EXISTS "idx_orders_customer_phone" ON "orders" ("customer_phone");
CREATE INDEX IF NOT EXISTS "idx_orders_driver_id" ON "orders" ("driver_id");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" ("created_at" DESC);

-- تحسين سرعة البحث عن المطاعم حسب التصنيف
CREATE INDEX IF NOT EXISTS "idx_restaurants_category" ON "restaurants" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_restaurants_active" ON "restaurants" ("is_active") WHERE "is_active" = true;

-- تحسين سرعة الإشعارات
CREATE INDEX IF NOT EXISTS "idx_notifications_recipient" ON "notifications" ("recipient_id", "recipient_type");
CREATE INDEX IF NOT EXISTS "idx_notifications_unread" ON "notifications" ("is_read") WHERE "is_read" = false;

-- 9. إنشاء جدول أرباح السائقين (إحصائيات متقدمة)
CREATE TABLE IF NOT EXISTS "driver_earnings_table" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "driver_id" UUID NOT NULL REFERENCES "drivers"("id"),
    "total_earned" DECIMAL(10, 2) DEFAULT 0,
    "withdrawn" DECIMAL(10, 2) DEFAULT 0,
    "pending" DECIMAL(10, 2) DEFAULT 0,
    "last_paid_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);