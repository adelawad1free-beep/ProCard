
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CardData, CardSide } from '../types';
import { FLAT_ICONS } from '../constants';

interface CardPreviewProps {
  data: CardData;
  setData?: (data: CardData) => void;
  side: CardSide;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, setData, side }) => {
  const [processedLogo, setProcessedLogo] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  // تحديد ما إذا كان المحتوى عربياً بناءً على فحص بسيط للاسم أو الشركة
  const isArabic = useMemo(() => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(data.name) || arabicPattern.test(data.company) || arabicPattern.test(data.title);
  }, [data.name, data.company, data.title]);

  const getContrastColor = (hex: string) => {
    if (!hex) return '#ffffff';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#0f172a' : '#ffffff';
  };

  const logoVisible = side === 'front' ? data.frontLogoVisible : data.backLogoVisible;
  const logoScale = side === 'front' ? data.frontLogoScale : data.backLogoScale;
  const logoX = side === 'front' ? data.frontLogoX : data.backLogoX;
  const logoY = side === 'front' ? data.frontLogoY : data.backLogoY;
  const isWhiteMode = side === 'front' ? data.frontLogoWhite : data.backLogoWhite;

  useEffect(() => {
    if (!data.logoUrl) { setProcessedLogo(null); return; }
    if (!isWhiteMode) { setProcessedLogo(data.logoUrl); return; }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = data.logoUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i+3] > 0) {
          pixels[i] = 255; pixels[i+1] = 255; pixels[i+2] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setProcessedLogo(canvas.toDataURL());
    };
    img.onerror = () => setProcessedLogo(data.logoUrl);
  }, [data.logoUrl, isWhiteMode]);

  const currentBg = side === 'front' ? data.frontBackgroundColor : data.backBackgroundColor;
  const currentText = data.autoTextColor ? getContrastColor(currentBg) : data.textColor;
  const primary = data.primaryColor || '#0f172a';
  const secondary = data.secondaryColor || '#3b82f6';

  const handleMouseDown = (element: string) => (e: React.MouseEvent) => {
    if (!setData) return;
    e.preventDefault();
    setDragging(element);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !cardRef.current || !setData) return;
      const rect = cardRef.current.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      const update: Partial<CardData> = {};
      if (dragging === 'logo') {
        if (side === 'front') { update.frontLogoX = x; update.frontLogoY = y; }
        else { update.backLogoX = x; update.backLogoY = y; }
      } else if (dragging === 'name') {
        update.frontNameX = x; update.frontNameY = y;
      } else if (dragging === 'contact') {
        update.frontContactX = x; update.frontContactY = y;
      } else if (dragging === 'company') {
        update.backCompanyX = x; update.backCompanyY = y;
      }
      setData({ ...data, ...update });
    };
    const handleMouseUp = () => setDragging(null);
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, side, data, setData]);

  const PatternDecoration = useMemo(() => {
    const patternId = `${side}-pattern-${data.pattern}`;
    const patternColor = currentText;

    switch (data.pattern) {
      case 'dots':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
             <svg width="100%" height="100%"><pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill={patternColor}/></pattern><rect width="100%" height="100%" fill={`url(#${patternId})`}/></svg>
          </div>
        );
      case 'grid':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
             <svg width="100%" height="100%"><pattern id={patternId} width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke={patternColor} strokeWidth="0.5"/></pattern><rect width="100%" height="100%" fill={`url(#${patternId})`}/></svg>
          </div>
        );
      case 'stripes':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
             <svg width="100%" height="100%"><pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="40" stroke={patternColor} strokeWidth="8"/></pattern><rect width="100%" height="100%" fill={`url(#${patternId})`}/></svg>
          </div>
        );
      case 'topography':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
            <svg width="100%" height="100%" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,100 Q125,50 250,100 T500,100 M0,150 Q125,100 250,150 T500,150 M0,200 Q125,150 250,200 T500,200" stroke={patternColor} fill="none" strokeWidth="1" />
            </svg>
          </div>
        );
      case 'polygons':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <svg width="100%" height="100%" viewBox="0 0 500 300">
              <polygon points="0,0 150,0 75,100" fill={patternColor} />
              <polygon points="500,300 350,300 425,200" fill={patternColor} />
              <polygon points="250,150 300,100 350,150" fill={patternColor} />
            </svg>
          </div>
        );
      case 'circuit':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
             <svg width="100%" height="100%"><pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse"><path d="M0 50 L50 50 L50 100 M50 0 L50 50 L100 50" fill="none" stroke={patternColor} strokeWidth="1"/><circle cx="50" cy="50" r="3" fill={patternColor}/></pattern><rect width="100%" height="100%" fill={`url(#${patternId})`}/></svg>
          </div>
        );
      case 'bubbles':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
             <svg width="100%" height="100%"><circle cx="10%" cy="10%" r="50" fill={patternColor}/><circle cx="90%" cy="90%" r="80" fill={patternColor}/><circle cx="50%" cy="50%" r="30" fill={patternColor}/></svg>
          </div>
        );
      case 'bauhaus':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            <svg width="100%" height="100%" viewBox="0 0 500 300">
              <rect x="20" y="20" width="40" height="40" fill={patternColor} />
              <circle cx="460" cy="260" r="30" fill={patternColor} />
              <path d="M400,20 L480,100" stroke={patternColor} strokeWidth="10" />
            </svg>
          </div>
        );
      case 'none':
      default:
        return null;
    }
  }, [data.pattern, currentText, side]);

  const LayoutDecoration = useMemo(() => {
    switch (data.layout) {
      case 'corporate':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className={`absolute top-0 ${isArabic ? 'left-0' : 'right-0'} w-2 h-full`} style={{ backgroundColor: primary }}></div>
            <div className={`absolute top-10 ${isArabic ? 'left-2' : 'right-2'} w-24 h-px opacity-30`} style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'luxury':
        return (
          <div className="absolute inset-0 pointer-events-none p-8">
            <div className="absolute inset-4 border border-current opacity-10"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 opacity-20" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'architect':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-10 ${isArabic ? 'right-10' : 'left-10'} w-2 h-2 border-t ${isArabic ? 'border-r' : 'border-l'} border-current opacity-20`}></div>
            <div className={`absolute bottom-10 ${isArabic ? 'left-10' : 'right-10'} w-2 h-2 border-b ${isArabic ? 'border-l' : 'border-r'} border-current opacity-20`}></div>
          </div>
        );
      case 'glass':
        return (
          <div className="absolute inset-0 pointer-events-none p-10 flex items-center justify-center">
            <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full opacity-10 blur-3xl" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full opacity-10 blur-3xl" style={{ backgroundColor: secondary }}></div>
            <div className="w-full h-full backdrop-blur-md bg-white/5 border border-white/20 rounded-none shadow-sm"></div>
          </div>
        );
      default:
        return null;
    }
  }, [data.layout, primary, secondary, isArabic]);

  const commonStyles = {
    backgroundColor: currentBg,
    color: currentText,
    fontFamily: data.fontFamily,
    direction: isArabic ? 'rtl' : 'ltr' as any,
    transition: dragging ? 'none' : 'background-color 0.4s ease, color 0.4s ease',
    // لضمان اتصال الحروف العربية ومنع تقطعها
    letterSpacing: isArabic ? '0' : 'normal',
    fontFeatureSettings: isArabic ? '"kern" 1, "liga" 1, "clig" 1, "calt" 1' : 'normal'
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
    if (!logoVisible || !processedLogo) return null;
    return (
      <img 
        onMouseDown={handleMouseDown('logo')}
        src={processedLogo} 
        alt="Logo" 
        className={`absolute z-20 cursor-move transition-shadow hover:ring-1 hover:ring-blue-400 hover:ring-offset-2 rounded-none ${dragging === 'logo' ? 'opacity-50 grayscale' : ''}`}
        style={{ 
          left: `${logoX}%`, top: `${logoY}%`,
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          maxWidth: '400px', maxHeight: '400px', objectFit: 'contain'
        }} 
      />
    );
  };

  return (
    <div 
      ref={cardRef}
      dir={isArabic ? 'rtl' : 'ltr'}
      className="relative w-[500px] h-[300px] overflow-hidden rounded-none flex flex-col p-14 shadow-2xl bg-white select-none border border-slate-200/50" 
      style={commonStyles}
    >
        {PatternDecoration}
        {LayoutDecoration}
        <LogoComponent />
        
        {side === 'front' ? (
          <>
            <div 
              onMouseDown={handleMouseDown('name')}
              className={`absolute z-10 ${isArabic ? 'text-right' : 'text-left'} cursor-move group p-2 border border-transparent hover:border-blue-200 hover:border-dashed rounded-none transition-colors ${dragging === 'name' ? 'opacity-50' : ''}`}
              style={{ left: `${data.frontNameX}%`, top: `${data.frontNameY}%`, transform: 'translate(-50%, -50%)', minWidth: '200px' }}
            >
              <h1 className={`font-bold mb-0.5 leading-none ${isArabic ? '' : 'tracking-tight'}`} style={{ fontSize: `${data.nameFontSize}px`, color: data.autoTextColor ? currentText : primary, letterSpacing: isArabic ? '0' : 'inherit' }}>{data.name}</h1>
              <p className="font-medium opacity-50 leading-tight" style={{ fontSize: `${data.titleFontSize}px`, letterSpacing: isArabic ? '0' : 'inherit' }}>{data.title}</p>
            </div>

            <div 
              onMouseDown={handleMouseDown('contact')}
              className={`absolute z-10 ${isArabic ? 'text-right' : 'text-left'} cursor-move group p-3 border border-transparent hover:border-blue-200 hover:border-dashed rounded-none transition-colors ${dragging === 'contact' ? 'opacity-50' : ''}`}
              style={{ 
                left: `${data.frontContactX}%`, top: `${data.frontContactY}%`, 
                transform: 'translate(-50%, -50%)',
                minWidth: '240px'
              }}
            >
              <div className="flex flex-col gap-1.5 opacity-80">
                {['phone', 'email', 'website', 'address'].map(field => {
                   const val = (data as any)[field];
                   if(!val) return null;
                   return (
                     <div key={field} className={`flex items-center gap-2 font-bold`} style={{ fontSize: `${data.contactFontSize}px`, letterSpacing: isArabic ? '0' : '0.025em' }}>
                       <FlatIcon id={(data.icons as any)[field]} size={data.contactFontSize + 2} />
                       <span>{val}</span>
                     </div>
                   );
                })}
                {data.extraFields.map((f) => (
                  <div key={f.id} className={`flex items-center gap-2 font-bold`} style={{ fontSize: `${data.contactFontSize}px`, letterSpacing: isArabic ? '0' : '0.025em' }}>
                    <FlatIcon id={f.iconId} size={data.contactFontSize + 2} />
                    <span>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div 
            onMouseDown={handleMouseDown('company')}
            className={`absolute z-10 text-center cursor-move group p-4 border border-transparent hover:border-blue-200 hover:border-dashed rounded-none transition-colors ${dragging === 'company' ? 'opacity-50' : ''}`}
            style={{ left: `${data.backCompanyX}%`, top: `${data.backCompanyY}%`, transform: 'translate(-50%, -50%)', minWidth: '300px' }}
          >
              <h2 className={`font-bold mb-1 ${isArabic ? '' : 'tracking-tight'}`} style={{ fontSize: `${data.companyFontSize}px`, color: data.autoTextColor ? currentText : primary, letterSpacing: isArabic ? '0' : 'inherit' }}>{data.company}</h2>
              <div className="h-0.5 w-10 bg-current mx-auto mb-3 opacity-20"></div>
              <p className={`font-bold uppercase opacity-40 ${isArabic ? '' : 'tracking-widest'}`} style={{ fontSize: `${data.taglineFontSize}px`, letterSpacing: isArabic ? '0' : 'inherit' }}>{data.tagline}</p>
          </div>
        )}
    </div>
  );
};

export default CardPreview;
