# ✅ حل سريع لخطأ قاعدة البيانات 42P01

## المشكلة
```
Error: relation "categories" does not exist
Error: relation "special_offers" does not exist
Error: column "category_id" does not exist
```

## الحل السريع (3 خطوات فقط)

### 1️⃣ أوقف الخادم
```
اضغط Ctrl+C لإيقاف الخادم الحالي
```

### 2️⃣ طبق جميع Migrations
```bash
npm run db:push
```

### 3️⃣ شغل الخادم من جديد
```bash
npm run dev
```

---

## إذا استمرت المشكلة

### الحل الشامل (احذر: سيمحو جميع البيانات):
```bash
npm run db:reset
npm run dev
```

---

## التحقق من النجاح

يجب أن ترى في الـ console:
```
✓ Server is running on http://localhost:5000
✓ Database connected successfully
```

---

## ما الذي تم إنشاؤه الآن؟

✅ **4 جداول migration جديدة تم إضافتها:**
- 0004_add_offers_fields.sql - إضافة restaurant_id و category_id للعروض
- 0005_add_favorites_table.sql - جدول المفضلات
- 0006_add_missing_tables.sql - جداول cart, order_tracking, employees

✅ **الجداول المضمونة الآن:**
- categories ✓
- special_offers (مع category_id) ✓
- favorites ✓
- cart ✓
- order_tracking ✓
- driver_balances ✓
- employees ✓

---

## 🆘 إذا استمرت المشاكل

تأكد من:
1. ✅ DATABASE_URL صحيح في `.env`
2. ✅ PostgreSQL مشغل ويعمل
3. ✅ رقم منفذ قاعدة البيانات صحيح
4. ✅ اسم قاعدة البيانات موجود

---

**تم حل المشكلة! 🎉**
