
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
  const customBgUrl = side === 'front' ? data.frontCustomBgUrl : data.backCustomBgUrl;
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

  // استبدال أنماط الخلفية الجاهزة بالخلفية المرفوعة
  const CustomBgLayer = useMemo(() => {
    if (!customBgUrl) return null;
    return (
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center" 
        style={{ backgroundImage: `url(${customBgUrl})` }}
      />
    );
  }, [customBgUrl]);

  const LayoutDecoration = useMemo(() => {
    const accent = primary;
    switch (data.layout) {
      case 'modern':
        return (
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className={`absolute top-0 ${isArabic ? 'left-0' : 'right-0'} w-32 h-32 opacity-10 rounded-full blur-3xl`} style={{ backgroundColor: accent }}></div>
            <div className={`absolute bottom-0 ${isArabic ? 'right-0' : 'left-0'} w-48 h-4 bg-current opacity-5`}></div>
          </div>
        );
      case 'classic':
        return (
          <div className="absolute inset-4 border border-current opacity-10 pointer-events-none z-[1]"></div>
        );
      case 'creative':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
            <div className="absolute -top-20 -left-20 w-64 h-64 rotate-12 opacity-5 rounded-3xl" style={{ backgroundColor: accent }}></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 -rotate-12 opacity-5 rounded-3xl" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'elegant':
        return (
          <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between items-center z-[1]">
            <div className="w-1/2 h-px opacity-20" style={{ backgroundColor: accent }}></div>
            <div className="w-1/2 h-px opacity-20" style={{ backgroundColor: accent }}></div>
          </div>
        );
      case 'neon':
        return (
          <div className="absolute inset-0 border-2 border-current shadow-[inset_0_0_30px_rgba(255,255,255,0.2),0_0_15px_rgba(0,0,0,0.1)] opacity-20 pointer-events-none z-[1]"></div>
        );
      case 'glass':
        return (
          <div className="absolute inset-0 backdrop-blur-md bg-white/10 border border-white/20 pointer-events-none z-[1]"></div>
        );
      case 'corporate':
        return (
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className={`absolute top-0 ${isArabic ? 'left-0' : 'right-0'} w-2.5 h-full`} style={{ backgroundColor: accent }}></div>
            <div className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'left-2.5' : 'right-2.5'} w-12 h-px opacity-30`} style={{ backgroundColor: accent }}></div>
          </div>
        );
      case 'startup':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
            <div className={`absolute top-0 ${isArabic ? 'left-0' : 'right-0'} w-[120%] h-24 -rotate-3 opacity-[0.07]`} style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'geometric':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[1]">
            <svg width="100%" height="100%"><polygon points="0,0 200,0 0,200" fill="currentColor"/><polygon points="500,300 300,300 500,100" fill="currentColor"/></svg>
          </div>
        );
      case 'linear':
        return (
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className="absolute top-1/4 w-full h-px opacity-5 bg-current"></div>
            <div className="absolute bottom-1/4 w-full h-px opacity-5 bg-current"></div>
          </div>
        );
      case 'luxury':
        return (
          <div className="absolute inset-0 pointer-events-none p-6 z-[1]">
            <div className="absolute inset-0 border border-current opacity-[0.05]"></div>
            <div className="absolute inset-2 border border-current opacity-[0.08]"></div>
          </div>
        );
      case 'swiss':
        return (
          <div className="absolute inset-0 pointer-events-none p-8 opacity-[0.04] z-[1]">
             <div className="grid grid-cols-4 grid-rows-4 h-full w-full border border-current">
                {Array(16).fill(0).map((_,i) => <div key={i} className="border border-current"></div>)}
             </div>
          </div>
        );
      case 'abstract':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] blur-2xl z-[1]">
            <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-current"></div>
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-blue-500"></div>
          </div>
        );
      case 'grid-layout':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[1]">
            <svg width="100%" height="100%"><defs><pattern id="preview-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#preview-grid)"/></svg>
          </div>
        );
      case 'signature':
        return (
          <div className="absolute bottom-10 left-10 right-10 h-px bg-current opacity-10 pointer-events-none z-[1]"></div>
        );
      case 'circular':
        return (
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-[0.03] border-[20px] border-current pointer-events-none animate-pulse z-[1]"></div>
        );
      case 'lines-layout':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[1]">
            <svg width="100%" height="100%"><defs><pattern id="preview-lines" width="100%" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#preview-lines)"/></svg>
          </div>
        );
      case 'gradient':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-gradient-to-br from-current to-transparent z-[1]"></div>
        );
      case 'mini-plus':
        return (
          <div className={`absolute top-8 ${isArabic ? 'left-8' : 'right-8'} w-12 h-1.5 opacity-20 rounded-full z-[1]`} style={{ backgroundColor: accent }}></div>
        );
      case 'tech':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-[1]">
             <svg width="100%" height="100%"><pattern id="preview-tech" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1.5" fill="currentColor"/><path d="M 25 0 L 25 50 M 0 25 L 50 25" fill="none" stroke="currentColor" strokeWidth="0.2"/></pattern><rect width="100%" height="100%" fill="url(#preview-tech)"/></svg>
          </div>
        );
      case 'x-layout':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-[1]">
            <svg width="100%" height="100%"><line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="4"/><line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="4"/></svg>
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
    letterSpacing: isArabic ? '0' : 'normal'
  };

  const FlatIcon = ({ id, size = 12 }: { id: string, size?: number }) => {
    const path = FLAT_ICONS[id] || FLAT_ICONS['info'];
    return (
      <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    );
  };

  const getAlignClass = (align: string) => {
    if (align === 'center') return 'text-center items-center';
    if (align === 'right') return 'text-right items-end';
    return 'text-left items-start';
  };

  return (
    <div 
      ref={cardRef}
      dir={isArabic ? 'rtl' : 'ltr'}
      className="relative w-[500px] h-[300px] overflow-hidden rounded-none flex flex-col p-14 shadow-2xl select-none border border-slate-200/50" 
      style={commonStyles}
    >
        {CustomBgLayer}
        {LayoutDecoration}
        
        {logoVisible && processedLogo && (
          <img 
            onMouseDown={handleMouseDown('logo')}
            src={processedLogo} 
            alt="Logo" 
            className={`absolute z-20 cursor-move transition-shadow hover:ring-1 hover:ring-blue-400 rounded-none ${dragging === 'logo' ? 'opacity-50 grayscale scale-95' : 'hover:scale-105'}`}
            style={{ 
              left: `${logoX}%`, top: `${logoY}%`,
              transform: `translate(-50%, -50%) scale(${logoScale})`,
              maxWidth: '350px', maxHeight: '350px', objectFit: 'contain'
            }} 
          />
        )}
        
        {side === 'front' ? (
          <>
            <div 
              onMouseDown={handleMouseDown('name')}
              className={`absolute z-10 cursor-move group p-2 border border-transparent hover:border-blue-200 hover:border-dashed transition-all ${dragging === 'name' ? 'opacity-50 scale-95' : 'hover:bg-slate-500/5'} flex flex-col ${getAlignClass(data.frontNameAlign)}`}
              style={{ left: `${data.frontNameX}%`, top: `${data.frontNameY}%`, transform: 'translate(-50%, -50%)', minWidth: '350px' }}
            >
              <h1 className="font-bold mb-0.5 leading-none transition-colors" style={{ fontSize: `${data.nameFontSize}px`, color: data.autoTextColor ? currentText : primary }}>{data.name}</h1>
              <p className="font-medium opacity-50 leading-tight" style={{ fontSize: `${data.titleFontSize}px` }}>{data.title}</p>
            </div>

            <div 
              onMouseDown={handleMouseDown('contact')}
              className={`absolute z-10 cursor-move group p-3 border border-transparent hover:border-blue-200 hover:border-dashed transition-all ${dragging === 'contact' ? 'opacity-50 scale-95' : 'hover:bg-slate-500/5'} flex flex-col ${getAlignClass(data.frontContactAlign)}`}
              style={{ left: `${data.frontContactX}%`, top: `${data.frontContactY}%`, transform: 'translate(-50%, -50%)', minWidth: '400px' }}
            >
              <div className="flex flex-col gap-1.5 opacity-80">
                {['phone', 'email', 'website', 'address'].map(field => {
                   const val = (data as any)[field];
                   if(!val) return null;
                   return (
                     <div key={field} className={`flex items-center gap-2 font-bold ${data.frontContactAlign === 'right' ? 'flex-row-reverse' : 'flex-row'}`} style={{ fontSize: `${data.contactFontSize}px` }}>
                       <FlatIcon id={(data.icons as any)[field]} size={data.contactFontSize + 2} />
                       <span className="truncate max-w-[350px]">{val}</span>
                     </div>
                   );
                })}
              </div>
            </div>
          </>
        ) : (
          <div 
            onMouseDown={handleMouseDown('company')}
            className={`absolute z-10 cursor-move group p-4 border border-transparent hover:border-blue-200 hover:border-dashed transition-all ${dragging === 'company' ? 'opacity-50 scale-95' : 'hover:bg-slate-500/5'} flex flex-col ${getAlignClass(data.backCompanyAlign)}`}
            style={{ left: `${data.backCompanyX}%`, top: `${data.backCompanyY}%`, transform: 'translate(-50%, -50%)', minWidth: '300px' }}
          >
              <h2 className="font-bold mb-1 transition-colors" style={{ fontSize: `${data.companyFontSize}px`, color: data.autoTextColor ? currentText : primary }}>{data.company}</h2>
              <div className="h-0.5 w-10 bg-current opacity-20 my-2"></div>
              <p className="font-bold uppercase opacity-40 leading-relaxed" style={{ fontSize: `${data.taglineFontSize}px` }}>{data.tagline}</p>
          </div>
        )}
    </div>
  );
};

export default CardPreview;
