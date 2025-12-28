
export type CardSide = 'front' | 'back';

// Fix: Added 'architect' to the CardLayout union to allow it in templates and match component usage
export type CardLayout = 
  | 'minimal' | 'corporate' | 'luxury' | 'modern' | 'tech' 
  | 'glass' | 'prism' | 'royal' | 'brutalist' | 'origami' 
  | 'waves' | 'blueprint' | 'stellar' | 'mosaic' | 'neon' 
  | 'abstract' | 'eco' | 'retro' | 'circuit' | 'duotone' | 'architect';

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
  // Text Positions
  frontNameX: number;
  frontNameY: number;
  frontContactX: number;
  frontContactY: number;
  backCompanyX: number;
  backCompanyY: number;
  // Font Sizes (New)
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
