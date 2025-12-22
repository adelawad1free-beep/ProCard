
export type CardSide = 'front' | 'back';

export type CardLayout = 
  | 'minimal' | 'corporate' | 'creative' | 'luxury' 
  | 'modern' | 'tech' | 'eco' | 'royal' | 'gradient' 
  | 'glass' | 'neon' | 'grid' | 'retro' | 'flat'
  | 'abstract' | 'brutalist' | 'origami' | 'circuit' | 'waves'
  | 'blueprint' | 'duotone' | 'stellar' | 'mosaic' | 'minimal-dark';

export interface CardFont {
  id: string;
  name: string;
  family: string;
}

export interface ExtraField {
  id: string;
  label: string;
  value: string;
  iconId: string;
}

export interface CardData {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  frontBackgroundColor: string;
  backBackgroundColor: string;
  textColor: string;
  layout: CardLayout;
  fontFamily: string;
  logoText: string;
  tagline: string;
  autoTextColor: boolean;
  logoUrl: string | null;
  // إعدادات الوجه الأمامي
  frontLogoScale: number;
  frontLogoX: number;
  frontLogoY: number;
  frontLogoVisible: boolean;
  frontLogoWhite: boolean; 
  // إعدادات الوجه الخلفي
  backLogoScale: number;
  backLogoX: number;
  backLogoY: number;
  backLogoVisible: boolean;
  backLogoWhite: boolean; 
  // معالجة الشعار
  logoBgRemoved: boolean;
  // الأيقونات والحقول الإضافية
  icons: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  extraFields: ExtraField[];
}

export interface Template {
  id: CardLayout;
  name: string;
  description: string;
}
