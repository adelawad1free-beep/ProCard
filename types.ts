
export type CardSide = 'front' | 'back';
export type TextAlign = 'left' | 'center' | 'right';

export type CardLayout = 
  | 'modern' | 'classic' | 'creative' | 'minimal' | 'elegant' | 'tech' 
  | 'corporate' | 'startup' | 'geometric' | 'mini-plus' | 'gradient' | 'linear' 
  | 'luxury' | 'swiss' | 'abstract' | 'grid-layout' | 'signature' | 'circular' 
  | 'lines-layout' | 'glass' | 'neon' | 'x-layout';

export type CardPattern = 
  | 'none' | 'dots' | 'grid' | 'stripes' | 'topography' | 'polygons' 
  | 'waves' | 'circuit' | 'lines' | 'bauhaus' | 'bubbles' | 'blueprint' | 'stellar' | 'mosaic' | 'abstract' | 'prism';

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
  frontCustomBgUrl: string | null; // خلفية مخصصة للأمام
  backCustomBgUrl: string | null;  // خلفية مخصصة للخلف
  textColor: string;
  layout: CardLayout;
  pattern: CardPattern;
  fontFamily: string;
  logoText: string;
  tagline: string;
  autoTextColor: boolean;
  logoUrl: string | null;
  // Logo Positions
  frontLogoScale: number;
  frontLogoX: number;
  frontLogoY: number;
  frontLogoVisible: boolean;
  frontLogoWhite: boolean; 
  backLogoScale: number;
  backLogoX: number;
  backLogoY: number;
  backLogoVisible: boolean;
  backLogoWhite: boolean; 
  logoBgRemoved: boolean;
  // Text Positions & Alignment
  frontNameX: number;
  frontNameY: number;
  frontNameAlign: TextAlign;
  frontContactX: number;
  frontContactY: number;
  frontContactAlign: TextAlign;
  backCompanyX: number;
  backCompanyY: number;
  backCompanyAlign: TextAlign;
  // Font Sizes
  nameFontSize: number;
  titleFontSize: number;
  contactFontSize: number;
  companyFontSize: number;
  taglineFontSize: number;
  
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

export interface Pattern {
  id: CardPattern;
  name: string;
  nameEn: string;
}
