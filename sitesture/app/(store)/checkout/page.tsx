import { MapPin, CreditCard, Truck, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">إتمام الشراء</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-blue-600" size={24} />
              <h2 className="text-lg font-bold">1. عنوان التوصيل</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50 relative">
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">افتراضي</span>
                <p className="font-bold mb-1">المنزل</p>
                <p className="text-sm text-gray-600">شارع الملك فهد، حي الملقا</p>
                <p className="text-sm text-gray-600">الرياض، المملكة العربية السعودية</p>
                <p className="text-sm mt-2 font-medium">+966 50 123 4567</p>
              </div>
              <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-500">
                <Plus size={24} />
                <span className="text-sm font-bold">إضافة عنوان جديد</span>
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-blue-600" size={24} />
              <h2 className="text-lg font-bold">2. طريقة الدفع</h2>
            </div>
            <div className="space-y-3">
              {[
                { id: "card", label: "البطاقة الائتمانية / مدى", desc: "دفع آمن عبر الإنترنت" },
                { id: "valu", label: "تقسيط valU", desc: "قسط مشترياتك حتى 36 شهر" },
                { id: "cod", label: "الدفع عند الاستلام", desc: "رسوم إضافية بقيمة 15 ريال" },
              ].map((method) => (
                <label key={method.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-blue-600 transition-colors">
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment" className="w-5 h-5 text-blue-600" defaultChecked={method.id === "card"} />
                    <div>
                      <p className="font-bold text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {method.id === "card" && <div className="w-8 h-5 bg-gray-200 rounded"></div>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="font-bold mb-4">ملخص الطلب</h2>
            <div className="space-y-3 text-sm border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">قيمة المنتجات</span>
                <span className="font-medium">SAR 5,699</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">رسوم التوصيل</span>
                <span className="text-green-600 font-bold">مجاني</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ضريبة القيمة المضافة</span>
                <span className="font-medium">SAR 854.85</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>الإجمالي (شاملاً الضريبة)</span>
              <span className="text-blue-600">SAR 6,553.85</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <span>تأكيد الطلب</span>
              <ShieldCheck size={20} />
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-4">بإتمامك للطلب، أنت توافق على شروط وأحكام نون</p>
          </div>

          {/* Shipping Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
             <Truck className="text-blue-600 flex-shrink-0" size={20} />
             <div>
               <p className="text-xs font-bold text-blue-900">توصيل سريع مجاني</p>
               <p className="text-[10px] text-blue-700">سيتم توصيل طلبك بحلول الغد، 14 فبراير</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Plus } from "lucide-react";
