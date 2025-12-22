
import React from 'react';
import { CardData, CardSide } from '../types';

interface CardPreviewProps {
  data: CardData;
  side: CardSide;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, side }) => {
  const getLayoutStyles = () => {
    switch (data.layout) {
      case 'minimal': return { container: "border", accent: "h-2 w-full absolute top-0", textPrimary: "", textSecondary: "opacity-60" };
      case 'creative': return { container: "", accent: "absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20", textPrimary: "", textSecondary: "opacity-70" };
      case 'luxury': return { container: "shadow-[0_20px_50px_rgba(0,0,0,0.3)]", accent: "absolute border border-current opacity-20 inset-4 rounded-sm", textPrimary: "", textSecondary: "opacity-50" };
      case 'modern': return { container: "", accent: "absolute right-0 top-0 bottom-0 w-24 clip-path-slant opacity-10", textPrimary: "", textSecondary: "opacity-60" };
      case 'tech': return { container: "border", accent: "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]", textPrimary: "", textSecondary: "opacity-50" };
      case 'eco': return { container: "", accent: "absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-2xl opacity-20", textPrimary: "", textSecondary: "opacity-70" };
      case 'royal': return { container: "", accent: "absolute inset-2 border-2 border-current opacity-20 rounded-md", textPrimary: "", textSecondary: "opacity-60" };
      case 'gradient': return { container: "", accent: "", textPrimary: "text-white", textSecondary: "text-white/70" };
      case 'glass': return { container: "backdrop-blur-xl border border-white/30 shadow-inner", accent: "", textPrimary: "", textSecondary: "opacity-60" };
      case 'neon': return { container: "border-2 border-white/10", accent: "absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]", textPrimary: "", textSecondary: "opacity-60" };
      case 'grid': return { container: "border-2 opacity-95", accent: "absolute inset-0 opacity-[0.05] [background:radial-gradient(#000_1px,transparent_0)] [background-size:15px_15px]", textPrimary: "", textSecondary: "opacity-60" };
      case 'retro': return { container: "border-[8px] border-[#333]", accent: "", textPrimary: "", textSecondary: "opacity-70" };
      case 'flat': return { container: "", accent: "absolute bottom-0 left-0 right-0 h-4", textPrimary: "", textSecondary: "opacity-60" };
      case 'abstract': return { container: "", accent: "absolute -right-20 -top-20 w-64 h-64 rotate-45 opacity-20", textPrimary: "", textSecondary: "opacity-60" };
      case 'brutalist': return { container: "border-[10px] border-black", accent: "absolute left-4 top-4 w-12 h-12 -z-0 opacity-50", textPrimary: "text-black", textSecondary: "font-black" };
      case 'origami': return { container: "", accent: "absolute right-0 top-0 w-full h-full clip-path-origami opacity-10", textPrimary: "", textSecondary: "opacity-60" };
      case 'circuit': return { container: "", accent: "absolute inset-0 opacity-10 pointer-events-none", textPrimary: "", textSecondary: "opacity-50" };
      case 'waves': return { container: "overflow-hidden", accent: "absolute -bottom-20 -right-20 w-80 h-80 rounded-[40%] animate-slow-spin opacity-20", textPrimary: "", textSecondary: "opacity-60" };
      case 'blueprint': return { container: "border-2 border-white/20", accent: "absolute inset-0 opacity-[0.1] [background:linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(white_1px,transparent_1px)] [background-size:20px_20px]", textPrimary: "font-mono", textSecondary: "font-mono opacity-60" };
      case 'duotone': return { container: "", accent: "absolute right-0 top-0 bottom-0 w-1/3 opacity-80", textPrimary: "", textSecondary: "opacity-80" };
      case 'stellar': return { container: "", accent: "absolute top-10 right-10 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]", textPrimary: "", textSecondary: "opacity-60" };
      case 'mosaic': return { container: "", accent: "absolute right-0 top-0 bottom-0 w-32 grid grid-cols-4 opacity-10", textPrimary: "", textSecondary: "opacity-60" };
      case 'minimal-dark': return { container: "", accent: "absolute left-6 top-6 bottom-6 w-1", textPrimary: "", textSecondary: "opacity-40" };
      default: return { container: "shadow-xl", accent: "absolute left-0 top-0 bottom-0 w-8", textPrimary: "", textSecondary: "opacity-60" };
    }
  };

  const styles = getLayoutStyles();

  const commonStyles = {
    backgroundColor: data.backgroundColor,
    color: data.textColor,
    borderColor: data.primaryColor,
    fontFamily: data.fontFamily, // تطبيق الخط المختار
  };

  if (side === 'front') {
    return (
      <div className={`relative w-[500px] h-[300px] overflow-hidden transition-all duration-500 rounded-xl flex flex-col justify-center p-14 ${styles.container}`} style={commonStyles}>
        {/* العناصر الجمالية */}
        {styles.accent && (
          <div className={styles.accent} style={{ 
            backgroundColor: ['corporate', 'minimal', 'modern', 'abstract', 'flat', 'minimal-dark', 'brutalist', 'eco', 'waves'].includes(data.layout) ? data.primaryColor : (data.layout === 'tech' ? undefined : data.secondaryColor),
            borderColor: ['luxury', 'royal', 'blueprint', 'grid', 'neon'].includes(data.layout) ? data.secondaryColor : undefined
          }}></div>
        )}
        
        {data.layout === 'duotone' && <div className="absolute right-0 top-0 bottom-0 w-1/3 z-0" style={{ backgroundColor: data.secondaryColor }}></div>}
        
        {data.layout === 'circuit' && (
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 10px 10px, ${data.primaryColor} 1px, transparent 0)`, backgroundSize: '30px 30px' }}></div>
        )}

        <div className="z-10 text-right">
          <h1 className={`text-4xl font-black mb-1.5 ${styles.textPrimary}`} style={{ color: data.primaryColor }}>
            {data.name}
          </h1>
          <p className={`text-lg font-bold ${styles.textSecondary}`} style={{ color: data.secondaryColor }}>
            {data.title}
          </p>
          <div className={`mt-10 pt-8 border-t flex flex-col gap-2.5 opacity-80`} style={{ borderColor: `${data.textColor}20` }}>
            <p className={`text-sm font-medium flex items-center justify-end gap-3`}>
              {data.phone} <span className="opacity-50">📱</span>
            </p>
            <p className={`text-sm font-medium flex items-center justify-end gap-3`}>
              {data.email} <span className="opacity-50">✉️</span>
            </p>
            <p className={`text-sm font-medium flex items-center justify-end gap-3`}>
              {data.website} <span className="opacity-50">🌐</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // الوجه الخلفي
  return (
    <div className={`relative w-[500px] h-[300px] overflow-hidden transition-all duration-500 rounded-xl flex flex-col items-center justify-center p-12 ${styles.container}`} style={commonStyles}>
        {data.layout === 'neon' && <div className="absolute inset-0 border-[2px]" style={{ borderColor: data.primaryColor, boxShadow: `inset 0 0 10px ${data.primaryColor}, 0 0 10px ${data.primaryColor}` }}></div>}
        
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(${data.primaryColor} 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>
        
        <div className="z-10 text-center flex flex-col items-center">
            <div className={`w-20 h-20 mb-5 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg transition-transform hover:rotate-6 ${['retro', 'brutalist'].includes(data.layout) ? 'rounded-none border-4' : ''}`} style={{ backgroundColor: data.primaryColor, color: '#fff' }}>
                {data.logoText ? data.logoText.substring(0,2).toUpperCase() : 'B'}
            </div>
            <h2 className={`text-2xl font-black mb-3 ${styles.textPrimary}`} style={{ color: data.primaryColor }}>
                {data.company}
            </h2>
            <div className={`h-0.5 w-12 opacity-30 mb-3 bg-current`} style={{ backgroundColor: data.secondaryColor }}></div>
            <p className={`text-sm tracking-[0.1em] font-bold ${styles.textSecondary}`} style={{ color: data.secondaryColor }}>
                {data.tagline}
            </p>
            <div className="mt-10 text-[10px] opacity-40 font-bold tracking-tighter">
                {data.address}
            </div>
        </div>
    </div>
  );
};

export default CardPreview;
