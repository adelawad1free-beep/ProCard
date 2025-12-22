
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
  }, [data.logoUrl, isWhiteMode]);

  const currentBg = side === 'front' ? data.frontBackgroundColor : data.backBackgroundColor;
  const currentText = data.autoTextColor ? getContrastColor(currentBg) : data.textColor;
  const primary = data.primaryColor;
  const secondary = data.secondaryColor;

  const Decoration = useMemo(() => {
    switch (data.layout) {
      case 'corporate':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-10 right-0 w-1/4 h-1" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'luxury':
        return (
          <div className="absolute inset-0 pointer-events-none border-[15px]" style={{ borderColor: `${primary}15` }}>
            <div className="absolute inset-4 border border-current opacity-20"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'creative':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: primary }}></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: secondary }}></div>
            <div className="absolute top-1/4 right-0 w-2 h-1/2 rounded-l-full" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'tech':
        return (
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
            backgroundImage: `radial-gradient(${primary} 1.5px, transparent 1.5px)`, 
            backgroundSize: '24px 24px' 
          }}>
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: '100px 100px' }}></div>
          </div>
        );
      case 'modern':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full skew-x-[-20deg] origin-top-right opacity-5 translate-x-1/2" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/5 to-transparent"></div>
          </div>
        );
      case 'eco':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: secondary }}></div>
            <svg className="absolute top-10 right-10 opacity-10" width="100" height="100" viewBox="0 0 100 100" fill={primary}><path d="M50 0C50 0 50 40 10 50C50 60 50 100 50 100C50 100 50 60 90 50C50 40 50 0 50 0Z"/></svg>
          </div>
        );
      case 'royal':
        return (
          <div className="absolute inset-0 pointer-events-none p-6">
            <div className="w-full h-full border-2 border-double opacity-30" style={{ borderColor: primary }}></div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 bg-inherit text-xs uppercase tracking-widest font-black" style={{ color: primary }}>EST. 2025</div>
          </div>
        );
      case 'gradient':
        return <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}></div>;
      case 'glass':
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[85%] h-[75%] backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 shadow-2xl"></div>
          </div>
        );
      case 'neon':
        return (
          <div className="absolute inset-0 pointer-events-none border-2 opacity-60 animate-pulse" style={{ borderColor: primary, boxShadow: `inset 0 0 20px ${primary}, 0 0 20px ${primary}` }}></div>
        );
      case 'grid':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ 
            backgroundImage: `linear-gradient(${primary} 1px, transparent 1px), linear-gradient(90deg, ${primary} 1px, transparent 1px)`, 
            backgroundSize: '30px 30px' 
          }}></div>
        );
      case 'retro':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-8 opacity-20" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-10 left-0 w-full h-6 opacity-15" style={{ backgroundColor: secondary }}></div>
            <div className="absolute top-20 left-0 w-full h-4 opacity-10" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'flat':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-48 h-48 rotate-45 translate-x-24 translate-y-24" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'abstract':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-10 w-32 h-32 rotate-12 opacity-10" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-10 right-20 w-40 h-10 -rotate-12 opacity-10" style={{ backgroundColor: secondary }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 border-4 rounded-full opacity-5" style={{ borderColor: primary }}></div>
          </div>
        );
      case 'brutalist':
        return (
          <div className="absolute inset-0 pointer-events-none border-[10px] border-black">
            <div className="absolute top-12 left-0 w-full h-[2px] bg-black opacity-20"></div>
            <div className="absolute top-0 left-12 w-[2px] h-full bg-black opacity-20"></div>
          </div>
        );
      case 'origami':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ 
              clipPath: 'polygon(0 0, 100% 0, 50% 50%)', 
              backgroundColor: primary, opacity: 0.05 
            }}></div>
            <div className="absolute bottom-0 left-0 w-full h-full" style={{ 
              clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)', 
              backgroundColor: secondary, opacity: 0.05 
            }}></div>
          </div>
        );
      case 'circuit':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg width="100%" height="100%">
              <pattern id="circuit-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M0 40h40v40M40 0v40M20 20h40" fill="none" stroke={primary} strokeWidth="2"/>
                <circle cx="40" cy="40" r="3" fill={primary}/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#circuit-pattern)"/>
            </svg>
          </div>
        );
      case 'waves':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[150%] h-32 opacity-10" style={{ 
              borderRadius: '50% 50% 0 0', 
              backgroundColor: primary,
              transform: 'translateX(-10%)'
            }}></div>
            <div className="absolute bottom-0 left-0 w-[150%] h-24 opacity-15" style={{ 
              borderRadius: '50% 50% 0 0', 
              backgroundColor: secondary,
              transform: 'translateX(-20%)'
            }}></div>
          </div>
        );
      case 'blueprint':
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: '#003366' }}>
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, 
              backgroundSize: '20px 20px' 
            }}></div>
            <div className="absolute top-4 left-4 border border-white/30 p-2 text-[8px] text-white/50 font-mono">
              SPEC_V2.0 / {data.layout.toUpperCase()}
            </div>
          </div>
        );
      case 'duotone':
        return (
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/2 h-full opacity-20" style={{ backgroundColor: primary }}></div>
            <div className="w-1/2 h-full opacity-20" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'stellar':
        return (
          <div className="absolute inset-0 pointer-events-none bg-slate-950 overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="absolute bg-white rounded-full animate-pulse" style={{ 
                width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7,
                animationDelay: `${Math.random() * 2}s`
              }}></div>
            ))}
          </div>
        );
      case 'mosaic':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-10 grid grid-cols-10 grid-rows-6">
            {[...Array(60)].map((_, i) => (
              <div key={i} className="border-[0.5px]" style={{ 
                borderColor: primary, 
                backgroundColor: i % 9 === 0 ? primary : (i % 7 === 0 ? secondary : 'transparent') 
              }}></div>
            ))}
          </div>
        );
      case 'minimal-dark':
        return (
          <div className="absolute inset-0 pointer-events-none bg-slate-900">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/5"></div>
            <div className="absolute top-0 left-20 w-px h-full bg-white/5"></div>
            <div className="absolute top-10 right-10 w-2 h-2 rounded-full" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'minimal':
      default:
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 opacity-20" style={{ borderColor: primary }}></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 opacity-20" style={{ borderColor: primary }}></div>
          </div>
        );
    }
  }, [data.layout, primary, secondary]);

  const commonStyles = {
    backgroundColor: currentBg,
    color: currentText,
    fontFamily: data.fontFamily,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
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
        className="absolute z-20 pointer-events-none transition-transform duration-500"
        style={{ 
          left: `${logoX}%`, top: `${logoY}%`,
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          maxWidth: '350px', maxHeight: '350px', objectFit: 'contain'
        }} 
      />
    );
  };

  if (side === 'front') {
    return (
      <div className="relative w-[500px] h-[300px] overflow-hidden rounded-2xl flex flex-col justify-center p-14 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white" style={commonStyles}>
        {Decoration}
        <LogoComponent />
        <div className="z-10 text-right relative space-y-1">
          <h1 className="text-4xl font-black leading-none mb-1" style={{ color: data.autoTextColor ? currentText : primary }}>{data.name}</h1>
          <p className="text-lg font-bold opacity-70 mb-6">{data.title}</p>
          
          <div className="pt-6 border-t flex flex-col gap-3 opacity-90" style={{ borderColor: `${currentText}20` }}>
            {data.phone && (
              <div className="flex items-center justify-end gap-3 text-[11px] font-black">
                <span>{data.phone}</span>
                <div className="p-1.5 rounded-lg bg-current/5"><FlatIcon id={data.icons.phone} /></div>
              </div>
            )}
            {data.email && (
              <div className="flex items-center justify-end gap-3 text-[11px] font-black">
                <span>{data.email}</span>
                <div className="p-1.5 rounded-lg bg-current/5"><FlatIcon id={data.icons.email} /></div>
              </div>
            )}
            {data.website && (
              <div className="flex items-center justify-end gap-3 text-[11px] font-black">
                <span>{data.website}</span>
                <div className="p-1.5 rounded-lg bg-current/5"><FlatIcon id={data.icons.website} /></div>
              </div>
            )}
            {data.extraFields.map((f) => (
              <div key={f.id} className="flex items-center justify-end gap-3 text-[11px] font-black">
                <span>{f.value}</span>
                <div className="p-1.5 rounded-lg bg-current/5"><FlatIcon id={f.iconId} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // الوجه الخلفي
  return (
    <div className="relative w-[500px] h-[300px] overflow-hidden rounded-2xl flex flex-col items-center justify-center p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white" style={commonStyles}>
        {Decoration}
        <LogoComponent />
        <div className="mt-auto z-10 text-center relative group">
            <h2 className="text-3xl font-black mb-1 drop-shadow-sm" style={{ color: data.autoTextColor ? currentText : primary }}>{data.company}</h2>
            <div className="h-1 w-12 bg-current mx-auto mb-3 rounded-full opacity-50"></div>
            <p className="text-[11px] font-black tracking-[0.3em] uppercase opacity-60 mb-6">{data.tagline}</p>
            {data.address && (
              <div className="px-4 py-2 bg-current/5 rounded-full backdrop-blur-sm border border-current/10">
                <div className="text-[9px] font-bold flex items-center justify-center gap-2">
                  <FlatIcon id={data.icons.address} size={10} />
                  <span>{data.address}</span>
                </div>
              </div>
            )}
        </div>
    </div>
  );
};

export default CardPreview;
