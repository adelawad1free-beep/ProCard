
import React from 'react';
import { CardData, CardSide } from '../types';

interface CardPreviewProps {
  data: CardData;
  side: CardSide;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, side }) => {
  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#1e293b' : '#ffffff';
  };

  const getLayoutStyles = () => {
    switch (data.layout) {
      case 'minimal': return { container: "border", accent: "h-2 w-full absolute top-0" };
      case 'creative': return { container: "", accent: "absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20" };
      case 'luxury': return { container: "shadow-2xl", accent: "absolute border border-current opacity-20 inset-4 rounded-sm" };
      case 'modern': return { container: "", accent: "absolute right-0 top-0 bottom-0 w-24 clip-path-slant opacity-10" };
      case 'tech': return { container: "border", accent: "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" };
      case 'eco': return { container: "", accent: "absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-2xl opacity-20" };
      case 'neon': return { container: "border-2 border-white/10", accent: "absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]" };
      case 'minimal-dark': return { container: "", accent: "absolute left-6 top-6 bottom-6 w-1" };
      default: return { container: "shadow-xl", accent: "absolute left-0 top-0 bottom-0 w-8" };
    }
  };

  const styles = getLayoutStyles();
  const currentBg = side === 'front' ? data.frontBackgroundColor : data.backBackgroundColor;
  const currentText = data.autoTextColor ? getContrastColor(currentBg) : data.textColor;

  const logoVisible = side === 'front' ? data.frontLogoVisible : data.backLogoVisible;
  const logoScale = side === 'front' ? data.frontLogoScale : data.backLogoScale;
  const logoX = side === 'front' ? data.frontLogoX : data.backLogoX;
  const logoY = side === 'front' ? data.frontLogoY : data.backLogoY;
  const isWhiteMode = side === 'front' ? data.frontLogoWhite : data.backLogoWhite;

  const commonStyles = {
    backgroundColor: currentBg,
    color: currentText,
    borderColor: data.primaryColor,
    fontFamily: data.fontFamily,
  };

  const LogoComponent = () => {
    if (!logoVisible) return null;

    if (data.logoUrl) {
      return (
        <img 
          src={data.logoUrl} 
          alt="Logo" 
          className="absolute z-20 pointer-events-none transition-all duration-300"
          style={{ 
            left: `${logoX}%`,
            top: `${logoY}%`,
            transform: `translate(-50%, -50%) scale(${logoScale})`,
            maxWidth: '300px',
            maxHeight: '300px',
            objectFit: 'contain',
            // الفلتر السحري: يحول أي لون لأسود ثم يعكسه للأبيض الكامل
            filter: isWhiteMode ? 'brightness(0) invert(1)' : 'none'
          }} 
        />
      );
    }
    
    return (
      <div 
        className="absolute z-20 w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg pointer-events-none" 
        style={{ 
          backgroundColor: isWhiteMode ? '#fff' : data.primaryColor, 
          color: isWhiteMode ? '#000' : '#fff',
          left: `${logoX}%`,
          top: `${logoY}%`,
          transform: `translate(-50%, -50%) scale(${logoScale})`,
        }}
      >
        {data.logoText ? data.logoText.substring(0,2).toUpperCase() : 'P'}
      </div>
    );
  };

  if (side === 'front') {
    return (
      <div className={`relative w-[500px] h-[300px] overflow-hidden transition-all duration-500 rounded-xl flex flex-col justify-center p-14 ${styles.container}`} style={commonStyles}>
        {styles.accent && <div className={styles.accent} style={{ backgroundColor: data.primaryColor }}></div>}
        <LogoComponent />
        <div className="z-10 text-right">
          <h1 className="text-4xl font-black mb-1.5" style={{ color: data.autoTextColor ? currentText : data.primaryColor }}>{data.name}</h1>
          <p className="text-lg font-bold opacity-80">{data.title}</p>
          <div className="mt-10 pt-6 border-t flex flex-col gap-2 opacity-70" style={{ borderColor: `${currentText}30` }}>
            <p className="text-xs font-bold">{data.phone} 📱</p>
            <p className="text-xs font-bold">{data.email} ✉️</p>
            <p className="text-xs font-bold">{data.website} 🌐</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-[500px] h-[300px] overflow-hidden transition-all duration-500 rounded-xl flex flex-col items-center justify-center p-12 ${styles.container}`} style={commonStyles}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(${data.primaryColor} 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>
        <LogoComponent />
        <div className="mt-auto z-10 text-center">
            <h2 className="text-2xl font-black mb-1" style={{ color: data.autoTextColor ? currentText : data.primaryColor }}>{data.company}</h2>
            <p className="text-[10px] font-black tracking-widest uppercase opacity-70">{data.tagline}</p>
            <div className="mt-4 text-[8px] opacity-40 font-bold">{data.address}</div>
        </div>
    </div>
  );
};

export default CardPreview;
