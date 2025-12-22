
import React, { useState, useEffect, useMemo } from 'react';
import { CardData, CardSide, ExtraField } from '../types';
import { FLAT_ICONS } from '../constants';

interface CardPreviewProps {
  data: CardData;
  side: CardSide;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, side }) => {
  const [processedLogo, setProcessedLogo] = useState<string | null>(null);

  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#1e293b' : '#ffffff';
  };

  const logoVisible = side === 'front' ? data.frontLogoVisible : data.backLogoVisible;
  const logoScale = side === 'front' ? data.frontLogoScale : data.backLogoScale;
  const logoX = side === 'front' ? data.frontLogoX : data.backLogoX;
  const logoY = side === 'front' ? data.frontLogoY : data.backLogoY;
  const isWhiteMode = side === 'front' ? data.frontLogoWhite : data.backLogoWhite;

  // تأثير لمعالجة الشعار وجعله أبيض برمجياً لضمان الجودة عند التصدير
  useEffect(() => {
    if (!data.logoUrl) {
      setProcessedLogo(null);
      return;
    }

    if (!isWhiteMode) {
      setProcessedLogo(data.logoUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = data.logoUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // تحويل كافة الألوان إلى الأبيض مع الحفاظ على الشفافية
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] > 0) { // إذا كان البكسل غير شفاف
          pixels[i] = 255;   // R
          pixels[i + 1] = 255; // G
          pixels[i + 2] = 255; // B
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setProcessedLogo(canvas.toDataURL());
    };
  }, [data.logoUrl, isWhiteMode]);

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

  const commonStyles = {
    backgroundColor: currentBg,
    color: currentText,
    borderColor: data.primaryColor,
    fontFamily: data.fontFamily,
  };

  const FlatIcon = ({ id, size = 12 }: { id: string, size?: number }) => {
    const path = FLAT_ICONS[id] || FLAT_ICONS['info'];
    return (
      <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    );
  };

  const LogoComponent = () => {
    if (!logoVisible) return null;

    if (processedLogo) {
      return (
        <img 
          src={processedLogo} 
          alt="Logo" 
          className="absolute z-20 pointer-events-none transition-all duration-300"
          style={{ 
            left: `${logoX}%`,
            top: `${logoY}%`,
            transform: `translate(-50%, -50%) scale(${logoScale})`,
            maxWidth: '300px',
            maxHeight: '300px',
            objectFit: 'contain'
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
          
          <div className="mt-8 pt-6 border-t flex flex-col gap-2.5 opacity-85" style={{ borderColor: `${currentText}30` }}>
            {data.phone && (
              <div className="flex items-center justify-end gap-2 text-xs font-bold">
                <span>{data.phone}</span>
                <FlatIcon id={data.icons.phone} />
              </div>
            )}
            {data.email && (
              <div className="flex items-center justify-end gap-2 text-xs font-bold">
                <span>{data.email}</span>
                <FlatIcon id={data.icons.email} />
              </div>
            )}
            {data.website && (
              <div className="flex items-center justify-end gap-2 text-xs font-bold">
                <span>{data.website}</span>
                <FlatIcon id={data.icons.website} />
              </div>
            )}
            {/* الحقول الإضافية */}
            {data.extraFields.map((field) => (
              <div key={field.id} className="flex items-center justify-end gap-2 text-xs font-bold">
                <span>{field.value}</span>
                <FlatIcon id={field.iconId} />
              </div>
            ))}
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
            {data.address && (
              <div className="mt-4 text-[8px] opacity-60 font-bold flex items-center justify-center gap-1.5">
                <FlatIcon id={data.icons.address} size={10} />
                <span>{data.address}</span>
              </div>
            )}
        </div>
    </div>
  );
};

export default CardPreview;
