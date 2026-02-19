/**
 * خدمة حساب رسوم التوصيل
 * Delivery Fee Calculation Service
 * 
 * تدعم طرق متعددة لحساب رسوم التوصيل:
 * 1. رسوم ثابتة (fixed)
 * 2. حسب المسافة (per_km)
 * 3. حسب المناطق (zone_based)
 * 4. إعدادات المطعم الخاصة (restaurant_custom)
 */

import { storage } from "../storage";

// ثوابت افتراضية
const DEFAULT_BASE_FEE = 5; // رسوم أساسية
const DEFAULT_PER_KM_FEE = 2; // رسوم لكل كيلومتر
const DEFAULT_MIN_FEE = 3; // الحد الأدنى
const DEFAULT_MAX_FEE = 50; // الحد الأقصى
const EARTH_RADIUS_KM = 6371; // نصف قطر الأرض بالكيلومتر

export interface DeliveryLocation {
  lat: number;
  lng: number;
}

export interface DeliveryFeeResult {
  fee: number;
  distance: number;
  estimatedTime: string;
  feeBreakdown: {
    baseFee: number;
    distanceFee: number;
    totalBeforeLimit: number;
  };
  isFreeDelivery: boolean;
  freeDeliveryReason?: string;
  appliedRuleId?: string;
  appliedDiscountId?: string;
}

export interface DeliveryFeeSettings {
  type: 'fixed' | 'per_km' | 'zone_based' | 'restaurant_custom';
  baseFee: number;
  perKmFee: number;
  minFee: number;
  maxFee: number;
  freeDeliveryThreshold: number;
  storeLat?: number;
  storeLng?: number;
}

/**
 * حساب المسافة بين نقطتين باستخدام صيغة Haversine
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
  point1: DeliveryLocation,
  point2: DeliveryLocation
): number {
  const lat1Rad = toRadians(point1.lat);
  const lat2Rad = toRadians(point2.lat);
  const deltaLat = toRadians(point2.lat - point1.lat);
  const deltaLng = toRadians(point2.lng - point1.lng);

  const a = 
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = EARTH_RADIUS_KM * c;
  
  // تقريب إلى رقمين عشريين
  return Math.round(distance * 100) / 100;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * التحقق مما إذا كانت النقطة داخل مضلع (Geo-Zone)
 */
export function isPointInPolygon(point: DeliveryLocation, polygon: DeliveryLocation[]): boolean {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = point.lat, yi = point.lng;
    const x1 = polygon[i].lat, y1 = polygon[i].lng;
    const x2 = polygon[j].lat, y2 = polygon[j].lng;
    
    const intersect = ((y1 > yi) !== (y2 > yi)) &&
        (xi < (x2 - x1) * (yi - y1) / (y2 - y1) + x1);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

/**
 * تقدير وقت التوصيل بناءً على المسافة
 * Estimate delivery time based on distance
 */
export function estimateDeliveryTime(distanceKm: number): string {
  // متوسط سرعة التوصيل: 30 كم/ساعة في المدينة
  const avgSpeedKmH = 30;
  // وقت التحضير المتوسط: 15 دقيقة
  const prepTimeMinutes = 15;
  
  const travelTimeMinutes = (distanceKm / avgSpeedKmH) * 60;
  const totalTimeMinutes = Math.ceil(prepTimeMinutes + travelTimeMinutes);
  
  // إضافة هامش زمني
  const minTime = totalTimeMinutes;
  const maxTime = Math.ceil(totalTimeMinutes * 1.3); // +30% هامش
  
  if (maxTime <= 30) {
    return `${minTime}-${maxTime} دقيقة`;
  } else if (maxTime <= 60) {
    return `${minTime}-${maxTime} دقيقة`;
  } else {
    const minHours = Math.floor(minTime / 60);
    const maxHours = Math.ceil(maxTime / 60);
    if (minHours === maxHours) {
      return `حوالي ${minHours} ساعة`;
    }
    return `${minHours}-${maxHours} ساعة`;
  }
}

/**
 * حساب رسوم التوصيل الكاملة
 * Calculate complete delivery fee
 */
export async function calculateDeliveryFee(
  customerLocation: DeliveryLocation,
  restaurantId: string | null,
  orderSubtotal: number
): Promise<DeliveryFeeResult> {
  // 1. جلب المناطق الجغرافية والقواعد والخصومات النشطة
  const [geoZones, deliveryRules, discounts] = await Promise.all([
    storage.getGeoZones(),
    storage.getDeliveryRules(),
    storage.getDeliveryDiscounts()
  ]);

  const activeGeoZones = geoZones.filter(z => z.isActive);
  const activeRules = deliveryRules.filter(r => r.isActive);
  const activeDiscounts = discounts.filter(d => d.isActive);

    // التحقق من الحد الأدنى للتوصيل المجاني من الإعدادات القديمة (للتوافق)
  const feeSettings = await getDeliveryFeeSettings(restaurantId || undefined);
  
  // 2. تحديد موقع المتجر
  let storeLocation: DeliveryLocation = { lat: 0, lng: 0 };
  
  if (feeSettings.storeLat && feeSettings.storeLng) {
    storeLocation = { lat: feeSettings.storeLat, lng: feeSettings.storeLng };
  } else {
    // التوافق مع الإعدادات القديمة
    const storeLat = await storage.getUiSetting('store_lat');
    const storeLng = await storage.getUiSetting('store_lng');
    const restaurant = restaurantId ? await storage.getRestaurant(restaurantId) : null;
    
    storeLocation = {
      lat: storeLat ? parseFloat(storeLat.value) : (restaurant ? parseFloat(restaurant.latitude || '0') : 0),
      lng: storeLng ? parseFloat(storeLng.value) : (restaurant ? parseFloat(restaurant.longitude || '0') : 0)
    };
  }

  // حساب المسافة
  const distance = storeLocation.lat !== 0 ? calculateDistance(customerLocation, storeLocation) : 0;
  const estimatedTime = estimateDeliveryTime(distance);

  // 3. تحديد المنطقة الجغرافية (Geo-Zone)
  let matchingGeoZoneId: string | null = null;
  for (const zone of activeGeoZones) {
    try {
      const polygon = JSON.parse(zone.coordinates);
      if (isPointInPolygon(customerLocation, polygon)) {
        matchingGeoZoneId = zone.id;
        break; // نأخذ أول منطقة مطابقة
      }
    } catch (e) {
      console.error(`Error parsing coordinates for zone ${zone.name}`, e);
    }
  }

  // 4. تطبيق القواعد الديناميكية (Dynamic Rules)
  // القواعد مرتبة حسب الأولوية (Priority) من الأعلى إلى الأقل
  let appliedFee: number | null = null;
  let appliedRuleId: string | undefined;

  for (const rule of activeRules) {
    let matches = false;

    if (rule.ruleType === 'zone' && rule.geoZoneId === matchingGeoZoneId) {
      matches = true;
    } else if (rule.ruleType === 'distance') {
      const minD = rule.minDistance ? parseFloat(rule.minDistance) : 0;
      const maxD = rule.maxDistance ? parseFloat(rule.maxDistance) : Infinity;
      if (distance >= minD && distance <= maxD) matches = true;
    } else if (rule.ruleType === 'order_value') {
      const minV = rule.minOrderValue ? parseFloat(rule.minOrderValue) : 0;
      const maxV = rule.maxOrderValue ? parseFloat(rule.maxOrderValue) : Infinity;
      if (orderSubtotal >= minV && orderSubtotal <= maxV) matches = true;
    }

    if (matches) {
      appliedFee = parseFloat(rule.fee);
      appliedRuleId = rule.id;
      break; // نطبق أول قاعدة مطابقة حسب الأولوية
    }
  }

  // 5. إذا لم تطبق أي قاعدة، نستخدم الحساب الافتراضي
  let baseFee = feeSettings.baseFee;
  let perKmFee = feeSettings.perKmFee;
  
  if (appliedFee === null) {
    appliedFee = baseFee + (distance * perKmFee);
  }

  // 6. تطبيق الخصومات (Discounts)
  let isFreeDelivery = false;
  let freeDeliveryReason: string | undefined;
  let appliedDiscountId: string | undefined;

  // التحقق من الحد الأدنى للتوصيل المجاني من الإعدادات القديمة (للتوافق)
  const feeSettings = await getDeliveryFeeSettings(restaurantId || undefined);
  if (feeSettings.freeDeliveryThreshold > 0 && orderSubtotal >= feeSettings.freeDeliveryThreshold) {
    isFreeDelivery = true;
    freeDeliveryReason = `توصيل مجاني للطلبات فوق ${feeSettings.freeDeliveryThreshold} ريال`;
    appliedFee = 0;
  }

  // تطبيق خصومات التوصيل الجديدة
  const now = new Date();
  for (const discount of activeDiscounts) {
    if (discount.validFrom && new Date(discount.validFrom) > now) continue;
    if (discount.validUntil && new Date(discount.validUntil) < now) continue;
    if (discount.minOrderValue && orderSubtotal < parseFloat(discount.minOrderValue)) continue;

    appliedDiscountId = discount.id;
    if (discount.discountType === 'percentage') {
      const discountAmount = appliedFee * (parseFloat(discount.discountValue) / 100);
      appliedFee -= discountAmount;
      if (parseFloat(discount.discountValue) === 100) {
        isFreeDelivery = true;
        freeDeliveryReason = `خصم توصيل مجاني: ${discount.name}`;
      }
    } else {
      appliedFee -= parseFloat(discount.discountValue);
      if (appliedFee <= 0) {
        appliedFee = 0;
        isFreeDelivery = true;
        freeDeliveryReason = `توصيل مجاني: ${discount.name}`;
      }
    }
    break; // نطبق أول خصم متاح
  }

  // التأكد من أن الرسوم لا تقل عن صفر ولا تتجاوز الحد الأقصى
  appliedFee = Math.max(0, Math.min(feeSettings.maxFee, appliedFee));
  appliedFee = Math.round(appliedFee * 100) / 100;

  return {
    fee: appliedFee,
    distance,
    estimatedTime,
    feeBreakdown: {
      baseFee: appliedFee === 0 && isFreeDelivery ? 0 : appliedFee,
      distanceFee: 0,
      totalBeforeLimit: appliedFee
    },
    isFreeDelivery,
    freeDeliveryReason,
    appliedRuleId,
    appliedDiscountId
  };
}

/**
 * جلب إعدادات رسوم التوصيل
 */
async function getDeliveryFeeSettings(restaurantId?: string): Promise<DeliveryFeeSettings> {
  try {
    // محاولة جلب إعدادات المطعم الخاصة أولاً
    if (restaurantId) {
      const restaurantSettings = await storage.getDeliveryFeeSettings(restaurantId);
      if (restaurantSettings) {
        return {
          type: restaurantSettings.type as DeliveryFeeSettings['type'],
          baseFee: parseFloat(restaurantSettings.baseFee || '0'),
          perKmFee: parseFloat(restaurantSettings.perKmFee || '0'),
          minFee: parseFloat(restaurantSettings.minFee || '0'),
          maxFee: parseFloat(restaurantSettings.maxFee || '100'),
          freeDeliveryThreshold: parseFloat(restaurantSettings.freeDeliveryThreshold || '0'),
          storeLat: restaurantSettings.storeLat ? parseFloat(restaurantSettings.storeLat) : undefined,
          storeLng: restaurantSettings.storeLng ? parseFloat(restaurantSettings.storeLng) : undefined
        };
      }
    }

    // جلب الإعدادات العامة
    const globalSettings = await storage.getDeliveryFeeSettings();
    if (globalSettings) {
      return {
        type: globalSettings.type as DeliveryFeeSettings['type'],
        baseFee: parseFloat(globalSettings.baseFee || '0'),
        perKmFee: parseFloat(globalSettings.perKmFee || '0'),
        minFee: parseFloat(globalSettings.minFee || '0'),
        maxFee: parseFloat(globalSettings.maxFee || '100'),
        freeDeliveryThreshold: parseFloat(globalSettings.freeDeliveryThreshold || '0'),
        storeLat: globalSettings.storeLat ? parseFloat(globalSettings.storeLat) : undefined,
        storeLng: globalSettings.storeLng ? parseFloat(globalSettings.storeLng) : undefined
      };
    }
  } catch (error) {
    console.error('Error fetching delivery fee settings:', error);
  }

  // إعدادات افتراضية
  return {
    type: 'per_km',
    baseFee: DEFAULT_BASE_FEE,
    perKmFee: DEFAULT_PER_KM_FEE,
    minFee: DEFAULT_MIN_FEE,
    maxFee: DEFAULT_MAX_FEE,
    freeDeliveryThreshold: 0
  };
}

/**
 * حساب رسوم التوصيل حسب المناطق
 */
async function getZoneBasedFee(distance: number): Promise<number> {
  try {
    const zones = await storage.getDeliveryZones();
    
    if (zones && zones.length > 0) {
      // البحث عن المنطقة المناسبة
      const matchingZone = zones.find(zone => 
        distance >= parseFloat(zone.minDistance || '0') &&
        distance <= parseFloat(zone.maxDistance || '999')
      );

      if (matchingZone) {
        return parseFloat(matchingZone.deliveryFee || String(DEFAULT_BASE_FEE));
      }
    }
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
  }

  // رسوم افتراضية إذا لم توجد منطقة مطابقة
  return DEFAULT_BASE_FEE + (distance * DEFAULT_PER_KM_FEE);
}

/**
 * حساب رسوم التوصيل السريع
 * Quick delivery fee calculation (simplified)
 */
export function calculateQuickDeliveryFee(
  distanceKm: number,
  baseFee: number = DEFAULT_BASE_FEE,
  perKmFee: number = DEFAULT_PER_KM_FEE
): number {
  const fee = baseFee + (distanceKm * perKmFee);
  return Math.round(Math.max(DEFAULT_MIN_FEE, Math.min(DEFAULT_MAX_FEE, fee)) * 100) / 100;
}

export default {
  calculateDistance,
  calculateDeliveryFee,
  calculateQuickDeliveryFee,
  estimateDeliveryTime
};
