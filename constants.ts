
import { Template, CardFont } from './types';

export const TEMPLATES: Template[] = [
  { id: 'minimal', name: 'بسيط (Minimal)', description: 'مساحات بيضاء' },
  { id: 'corporate', name: 'رسمي (Corporate)', description: 'احترافي جاد' },
  { id: 'creative', name: 'إبداعي (Creative)', description: 'ألوان حيوية' },
  { id: 'luxury', name: 'فاخر (Luxury)', description: 'أناقة داكنة' },
  { id: 'modern', name: 'عصري (Modern)', description: 'خطوط حادة' },
  { id: 'tech', name: 'تقني (Tech)', description: 'لمسة رقمية' },
  { id: 'eco', name: 'بيئي (Eco)', description: 'طبيعي هادئ' },
  { id: 'royal', name: 'ملكي (Royal)', description: 'فخامة ذهبية' },
  { id: 'gradient', name: 'متدرج (Gradient)', description: 'تدرج عصري' },
  { id: 'glass', name: 'زجاجي (Glass)', description: 'شفافية ضبابية' },
  { id: 'neon', name: 'نيون (Neon)', description: 'إضاءة قوية' },
  { id: 'grid', name: 'شبكي (Grid)', description: 'هندسي منظم' },
  { id: 'retro', name: 'كلاسيكي (Retro)', description: 'طابع السبعينات' },
  { id: 'flat', name: 'مسطح (Flat)', description: 'ألوان صلبة' },
  { id: 'abstract', name: 'تجريدي (Abstract)', description: 'أشكال فنية' },
  { id: 'brutalist', name: 'خام (Brutalist)', description: 'تباين جريء' },
  { id: 'origami', name: 'أوريغامي (Origami)', description: 'طيّات ورقية' },
  { id: 'circuit', name: 'مسارات (Circuit)', description: 'لوحة إلكترونية' },
  { id: 'waves', name: 'أمواج (Waves)', description: 'انحناءات عضوية' },
  { id: 'blueprint', name: 'مخطط (Blueprint)', description: 'رسم هندسي' },
  { id: 'duotone', name: 'ثنائي (Duotone)', description: 'تباين لونين' },
  { id: 'stellar', name: 'نجمي (Stellar)', description: 'فضاء ومجرات' },
  { id: 'mosaic', name: 'فسيفساء (Mosaic)', description: 'مربعات ملونة' },
  { id: 'minimal-dark', name: 'أسود (Minimal Dark)', description: 'بساطة داكنة' }
];

export const ARABIC_FONTS: CardFont[] = [
  { id: 'tajawal', name: 'تجوال (Tajawal)', family: "'Tajawal', sans-serif" },
  { id: 'cairo', name: 'كايرو (Cairo)', family: "'Cairo', sans-serif" },
  { id: 'almarai', name: 'المراعي (Almarai)', family: "'Almarai', sans-serif" },
  { id: 'amiri', name: 'الأميري (Amiri)', family: "'Amiri', serif" },
  { id: 'lalezar', name: 'لاليزار (Lalezar)', family: "'Lalezar', cursive" },
  { id: 'reem', name: 'ريم كوفي (Reem Kufi)', family: "'Reem Kufi', sans-serif" },
  { id: 'changa', name: 'شانغا (Changa)', family: "'Changa', sans-serif" },
  { id: 'messiri', name: 'المسيري (El Messiri)', family: "'El Messiri', sans-serif" },
  { id: 'markazi', name: 'المركزي (Markazi)', family: "'Markazi Text', serif" },
  { id: 'lateef', name: 'لطيف (Lateef)', family: "'Lateef', cursive" }
];

export const INITIAL_CARD_DATA = {
  name: 'محمد أحمد',
  title: 'مدير العمليات الإبداعية',
  company: 'حلول التقنية المتطورة',
  phone: '+966 50 123 4567',
  email: 'm.ahmed@example.com',
  website: 'www.techsolutions.com',
  address: 'الرياض، المملكة العربية السعودية',
  primaryColor: '#1e293b',
  secondaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  layout: 'corporate' as const,
  fontFamily: "'Tajawal', sans-serif",
  logoText: 'TECH',
  tagline: 'نبتكر لمستقبل أفضل'
};
