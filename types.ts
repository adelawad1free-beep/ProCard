
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
  backgroundColor: string;
  textColor: string;
  layout: CardLayout;
  fontFamily: string;
  logoText: string;
  tagline: string;
}

export interface Template {
  id: CardLayout;
  name: string;
  description: string;
}
