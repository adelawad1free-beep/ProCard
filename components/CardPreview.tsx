
import React, { useState, useEffect, useMemo } from 'react';
import { CardData, CardSide } from '../types';
import { FLAT_ICONS } from '../constants';

interface CardPreviewProps {
  data: CardData;
  side: CardSide;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, side }) => {
  const [processedLogo, setProcessedLogo] = useState<string | null>(null);

  const getContrastColor = (hex: string) => {
    if (!hex) return '#ffffff';
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
  const primary = data.primaryColor || '#3b82f6';
  const secondary = data.secondaryColor || '#10b981';

  // توليد زخارف خلفية فريدة لكل نمط مع معالجة آمنة للـ IDs
  const Decoration = useMemo(() => {
    const safeId = (id: string) => `${side}-${id}`;
    
    switch (data.layout) {
      case 'corporate':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-10 right-0 w-1/4 h-1.5" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'luxury':
        return (
          <div className="absolute inset-0 pointer-events-none border-[12px]" style={{ borderColor: `${primary}20` }}>
            <div className="absolute inset-4 border border-current opacity-20"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'creative':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: primary }}></div>
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-15 blur-[80px]" style={{ backgroundColor: secondary }}></div>
            <div className="absolute top-1/4 right-0 w-3 h-1/2 rounded-l-2xl" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'tech':
        return (
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
            backgroundImage: `radial-gradient(${primary} 1.5px, transparent 1.5px)`, 
            backgroundSize: '20px 20px' 
          }}>
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${primary}10 1px, transparent 1px), linear-gradient(90deg, ${primary}10 1px, transparent 1px)`, backgroundSize: '80px 80px' }}></div>
          </div>
        );
      case 'modern':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full skew-x-[-25deg] origin-top-right opacity-5 translate-x-1/3" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-2" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'eco':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-15" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-12 right-12 opacity-10">
              <svg width="120" height="120" viewBox="0 0 100 100" fill={primary}><path d="M50 0C50 0 50 40 10 50C50 60 50 100 50 100C50 100 50 60 90 50C50 40 50 0 50 0Z"/></svg>
            </div>
          </div>
        );
      case 'royal':
        return (
          <div className="absolute inset-0 pointer-events-none p-5">
            <div className="w-full h-full border-4 border-double opacity-25" style={{ borderColor: primary }}></div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-6 bg-inherit text-[10px] font-black tracking-[0.4em]" style={{ color: primary }}>PREMIUM</div>
          </div>
        );
      case 'gradient':
        return <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}></div>;
      case 'glass':
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-10">
            <div className="w-full h-full backdrop-blur-xl bg-white/10 rounded-[40px] border border-white/20 shadow-2xl"></div>
          </div>
        );
      case 'neon':
        return (
          <div className="absolute inset-0 pointer-events-none border-4 opacity-50 shadow-[inset_0_0_30px_rgba(255,255,255,0.1)]" style={{ borderColor: primary }}>
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-transparent"></div>
          </div>
        );
      case 'grid':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ 
            backgroundImage: `linear-gradient(${primary} 1.5px, transparent 1.5px), linear-gradient(90deg, ${primary} 1.5px, transparent 1.5px)`, 
            backgroundSize: '40px 40px' 
          }}></div>
        );
      case 'retro':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col">
            {[primary, secondary, primary].map((c, i) => (
              <div key={i} className="h-4 w-full opacity-15 mb-2" style={{ backgroundColor: c }}></div>
            ))}
          </div>
        );
      case 'flat':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-56 h-56 rotate-[30deg] translate-x-24 translate-y-24 rounded-3xl" style={{ backgroundColor: `${primary}15` }}></div>
            <div className="absolute top-10 left-10 w-16 h-16 rounded-full" style={{ backgroundColor: `${secondary}10` }}></div>
          </div>
        );
      case 'abstract':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-10 rotate-12" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[20%] rounded-full opacity-10 -rotate-12" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'brutalist':
        return (
          <div className="absolute inset-0 pointer-events-none border-[12px] border-black">
            <div className="absolute top-20 left-0 w-full h-[3px] bg-black opacity-10"></div>
            <div className="absolute top-0 left-20 w-[3px] h-full bg-black opacity-10"></div>
          </div>
        );
      case 'origami':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ 
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)', 
              backgroundColor: primary, opacity: 0.05 
            }}></div>
          </div>
        );
      case 'circuit':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-15">
            <svg width="100%" height="100%">
              <defs>
                <pattern id={safeId("circuit")} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0 50h50v50M50 0v50M25 25h50v50" fill="none" stroke={primary} strokeWidth="1.5"/>
                  <circle cx="50" cy="50" r="4" fill={primary} opacity="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${safeId("circuit")})`}/>
            </svg>
          </div>
        );
      case 'waves':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[120%] h-40 opacity-10" style={{ 
              borderRadius: '100% 100% 0 0', backgroundColor: primary, transform: 'scaleX(1.4) translateY(20%)'
            }}></div>
            <div className="absolute bottom-4 left-0 w-[120%] h-32 opacity-15" style={{ 
              borderRadius: '100% 100% 0 0', backgroundColor: secondary, transform: 'scaleX(1.6) translateY(20%)'
            }}></div>
          </div>
        );
      case 'blueprint':
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: '#002b5c' }}>
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, 
              backgroundSize: '25px 25px' 
            }}></div>
            <div className="absolute bottom-4 right-4 text-[9px] text-white/40 font-mono border border-white/20 p-2">DRAWING_V25.A</div>
          </div>
        );
      case 'duotone':
        return (
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/2 h-full opacity-10" style={{ backgroundColor: primary }}></div>
            <div className="w-1/2 h-full opacity-10" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'stellar':
        return (
          <div className="absolute inset-0 pointer-events-none bg-slate-950 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="absolute bg-white rounded-full opacity-40" style={{ 
                width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              }}></div>
            ))}
          </div>
        );
      case 'mosaic':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-10 grid grid-cols-12 grid-rows-8">
            {[...Array(96)].map((_, i) => (
              <div key={i} className="border-[0.2px]" style={{ 
                borderColor: primary, 
                backgroundColor: i % 11 === 0 ? primary : (i % 7 === 0 ? secondary : 'transparent') 
              }}></div>
            ))}
          </div>
        );
      case 'minimal-dark':
        return (
          <div className="absolute inset-0 pointer-events-none bg-slate-900">
            <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-white/5"></div>
            <div className="absolute top-0 right-24 w-[0.5px] h-full bg-white/5"></div>
          </div>
        );
      case 'minimal':
      default:
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 opacity-15" style={{ borderColor: primary }}></div>
            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 opacity-15" style={{ borderColor: primary }}></div>
          </div>
        );
    }
  }, [data.layout, primary, secondary, side]);

  const commonStyles = {
    backgroundColor: currentBg,
    color: currentText,
    fontFamily: data.fontFamily,
    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
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
        src={processedLogo} 
        alt="Logo" 
        className="absolute z-20 pointer-events-none transition-all duration-700 ease-out"
        style={{ 
          left: `${logoX}%`, top: `${logoY}%`,
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          maxWidth: '400px', maxHeight: '400px', objectFit: 'contain'
        }} 
      />
    );
  };

  if (side === 'front') {
    return (
      <div className="relative w-[500px] h-[300px] overflow-hidden rounded-3xl flex flex-col justify-center p-14 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] bg-white" style={commonStyles}>
        {Decoration}
        <LogoComponent />
        <div className="z-10 text-right relative space-y-1.5">
          <h1 className="text-4xl font-black leading-none mb-1 tracking-tight" style={{ color: data.autoTextColor ? currentText : primary }}>{data.name}</h1>
          <p className="text-lg font-bold opacity-75 mb-8">{data.title}</p>
          
          <div className="pt-8 border-t flex flex-col gap-3.5 opacity-90" style={{ borderColor: `${currentText}15` }}>
            {data.phone && (
              <div className="flex items-center justify-end gap-3.5 text-[11px] font-black uppercase tracking-wider">
                <span>{data.phone}</span>
                <div className="p-2 rounded-xl bg-current/5 shadow-sm"><FlatIcon id={data.icons.phone} size={14} /></div>
              </div>
            )}
            {data.email && (
              <div className="flex items-center justify-end gap-3.5 text-[11px] font-black uppercase tracking-wider">
                <span>{data.email}</span>
                <div className="p-2 rounded-xl bg-current/5 shadow-sm"><FlatIcon id={data.icons.email} size={14} /></div>
              </div>
            )}
            {data.website && (
              <div className="flex items-center justify-end gap-3.5 text-[11px] font-black uppercase tracking-wider">
                <span>{data.website}</span>
                <div className="p-2 rounded-xl bg-current/5 shadow-sm"><FlatIcon id={data.icons.website} size={14} /></div>
              </div>
            )}
            {data.extraFields.map((f) => (
              <div key={f.id} className="flex items-center justify-end gap-3.5 text-[11px] font-black uppercase tracking-wider">
                <span>{f.value}</span>
                <div className="p-2 rounded-xl bg-current/5 shadow-sm"><FlatIcon id={f.iconId} size={14} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[500px] h-[300px] overflow-hidden rounded-3xl flex flex-col items-center justify-center p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] bg-white" style={commonStyles}>
        {Decoration}
        <LogoComponent />
        <div className="mt-auto z-10 text-center relative group">
            <h2 className="text-3xl font-black mb-1 drop-shadow-sm tracking-tight" style={{ color: data.autoTextColor ? currentText : primary }}>{data.company}</h2>
            <div className="h-1.5 w-16 bg-current mx-auto mb-4 rounded-full opacity-30 shadow-inner"></div>
            <p className="text-[12px] font-black tracking-[0.4em] uppercase opacity-60 mb-8">{data.tagline}</p>
            {data.address && (
              <div className="px-5 py-2.5 bg-current/5 rounded-2xl backdrop-blur-md border border-current/5 shadow-sm">
                <div className="text-[10px] font-black flex items-center justify-center gap-3">
                  <FlatIcon id={data.icons.address} size={12} />
                  <span>{data.address}</span>
                </div>
              </div>
            )}
        </div>
    </div>
  );
};

export default CardPreview;
