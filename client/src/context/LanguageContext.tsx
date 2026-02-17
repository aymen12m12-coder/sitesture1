import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations = {
  ar: {
    'home': 'الرئيسية',
    'search_placeholder': 'ما الذي تبحث عنه اليوم؟',
    'search_results': 'نتائج البحث',
    'account': 'حسابي',
    'favorites': 'المفضلة',
    'cart': 'الحقيبة',
    'categories': 'الأقسام',
    'browse_categories': 'تصفح حسب التصنيف',
    'new_arrivals': 'وصل حديثاً',
    'shop_now': 'تسوق الآن',
    'support': 'الدعم',
    'share': 'مشاركة',
    'language_country': 'اللغة والبلد',
    'yemen_arabic': 'اليمن / العربية',
    'uae_english': 'الإمارات / English',
    'settings': 'الإعدادات',
    'privacy_policy': 'سياسة الخصوصية',
    'contact_us': 'اتصل بنا',
    'about_tamtom': 'عن طمطوم',
    'orders': 'طلباتي',
    'logout': 'تسجيل الخروج',
    'login': 'دخول',
    'register': 'تسجيل',
    'add_to_cart': 'إضافة للسلة',
    'currency': 'ر.ي',
    'whatsapp': 'واتساب',
    'direct_call': 'اتصال مباشر',
    'how_can_we_help': 'كيف يمكننا مساعدتك؟',
    'we_are_here': 'نحن متواجدون لخدمتك في أي وقت',
    'total': 'الإجمالي',
    'checkout': 'إتمام الطلب',
    'empty_cart': 'سلتك فارغة',
    'empty_favorites': 'قائمة المفضلة فارغة',
  },
  en: {
    'home': 'Home',
    'search_placeholder': 'What are you looking for today?',
    'search_results': 'Search Results',
    'account': 'Account',
    'favorites': 'Favorites',
    'cart': 'Cart',
    'categories': 'Categories',
    'browse_categories': 'Browse by Category',
    'new_arrivals': 'New Arrivals',
    'shop_now': 'Shop Now',
    'support': 'Support',
    'share': 'Share',
    'language_country': 'Language & Country',
    'yemen_arabic': 'Yemen / Arabic',
    'uae_english': 'UAE / English',
    'settings': 'Settings',
    'privacy_policy': 'Privacy Policy',
    'contact_us': 'Contact Us',
    'about_tamtom': 'About Tamtom',
    'orders': 'My Orders',
    'logout': 'Logout',
    'login': 'Login',
    'register': 'Register',
    'add_to_cart': 'Add to Cart',
    'currency': 'YER',
    'whatsapp': 'WhatsApp',
    'direct_call': 'Direct Call',
    'how_can_we_help': 'How can we help?',
    'we_are_here': 'We are here to help you anytime',
    'total': 'Total',
    'checkout': 'Checkout',
    'empty_cart': 'Your cart is empty',
    'empty_favorites': 'Your favorites list is empty',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    // الاتجاه ثابت دائماً لليمين (RTL) بناءً على طلب المستخدم
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  const dir = 'rtl'; // ثابت دائماً لليمين (RTL) بناءً على طلب المستخدم

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
