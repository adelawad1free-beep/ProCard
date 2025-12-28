
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
  const primary = data.primaryColor || '#3b82f6';
  const secondary = data.secondaryColor || '#10b981';

  // Drag and Drop Logic
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

      // Constrain within 0-100
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

  const Decoration = useMemo(() => {
    const safeId = (id: string) => `${side}-${id}`;
    
    switch (data.layout) {
      case 'luxury':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-900/5 -skew-x-12 translate-x-1/4"></div>
            <div className="absolute inset-8 border border-current opacity-10"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4" style={{ borderColor: primary, opacity: 0.3 }}></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4" style={{ borderColor: secondary, opacity: 0.3 }}></div>
          </div>
        );
      case 'corporate':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full shadow-2xl" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-0 right-2 w-1.5 h-full opacity-50" style={{ backgroundColor: secondary }}></div>
            <div className="absolute bottom-0 left-0 w-full h-12 opacity-[0.05]" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${primary}, ${primary} 5px, transparent 5px, transparent 15px)` }}></div>
          </div>
        );
      case 'glass':
        return (
          <div className="absolute inset-0 pointer-events-none p-10 flex items-center justify-center">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-3xl" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-3xl" style={{ backgroundColor: secondary }}></div>
            <div className="w-full h-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-[40px] shadow-2xl"></div>
          </div>
        );
      case 'prism':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 50%, ${primary}, ${secondary}, transparent)` }}></div>
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${primary}15 1px, transparent 0)`, backgroundSize: '30px 30px' }}></div>
          </div>
        );
      case 'tech':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg width="100%" height="100%"><pattern id={safeId("tech-grid")} width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke={primary} strokeWidth="1"/><circle cx="0" cy="0" r="2" fill={secondary}/></pattern><rect width="100%" height="100%" fill={`url(#${safeId("tech-grid")})`}/></svg>
            <div className="absolute bottom-4 left-4 font-mono text-[8px] opacity-40">SYSTEM_ACTIVE // {new Date().getFullYear()}</div>
          </div>
        );
      case 'brutalist':
        return (
          <div className="absolute inset-0 pointer-events-none border-[20px] border-current opacity-5">
            <div className="absolute top-1/4 left-0 w-full h-1.5 bg-current opacity-10"></div>
            <div className="absolute top-0 right-1/4 w-1.5 h-full bg-current opacity-10"></div>
          </div>
        );
      case 'origami':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 70%)', backgroundColor: primary }}></div>
            <div className="absolute bottom-0 right-0 w-full h-2/3 opacity-5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 20% 100%)', backgroundColor: secondary }}></div>
          </div>
        );
      case 'waves':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[150%] h-48 opacity-10 -translate-x-1/4 translate-y-1/4" style={{ borderRadius: '100% 100% 0 0', backgroundColor: primary }}></div>
            <div className="absolute bottom-0 left-0 w-[150%] h-36 opacity-10 -translate-x-1/4 translate-y-1/4 rotate-3" style={{ borderRadius: '100% 100% 0 0', backgroundColor: secondary }}></div>
          </div>
        );
      case 'blueprint':
        return (
          <div className="absolute inset-0 pointer-events-none bg-[#003366] opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
            <div className="absolute bottom-4 right-4 border border-white/20 p-2 text-[8px] text-white/40 font-mono">LAYOUT_V2.0</div>
          </div>
        );
      case 'stellar':
        return (
          <div className="absolute inset-0 pointer-events-none bg-slate-950 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white opacity-40 blur-[0.5px]" style={{ width: Math.random() * 3, height: Math.random() * 3, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}></div>
            ))}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'mosaic':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 grid grid-cols-12 grid-rows-8">
            {[...Array(96)].map((_, i) => (
              <div key={i} className="border-[0.1px] border-current" style={{ backgroundColor: i % 7 === 0 ? primary : 'transparent' }}></div>
            ))}
          </div>
        );
      case 'neon':
        return (
          <div className="absolute inset-0 pointer-events-none border-[3px] opacity-40 shadow-[0_0_20px_rgba(255,255,255,0.1)]" style={{ borderColor: primary }}>
            <div className="absolute top-0 left-0 w-full h-full animate-pulse opacity-20" style={{ boxShadow: `inset 0 0 50px ${primary}` }}></div>
          </div>
        );
      case 'abstract':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-[40%_60%_70%_30%] opacity-10 blur-2xl" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-[70%_30%_40%_60%] opacity-10 blur-2xl" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'eco':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden bg-emerald-50/10">
            <div className="absolute top-10 right-10 opacity-5">
              <svg width="150" height="150" viewBox="0 0 24 24" fill={primary}><path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,11 17,8 17,8Z"/></svg>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600/20"></div>
          </div>
        );
      case 'retro':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col gap-1">
            <div className="h-6 w-full opacity-10" style={{ backgroundColor: '#ff0080' }}></div>
            <div className="h-6 w-full opacity-10" style={{ backgroundColor: '#00ffff' }}></div>
            <div className="h-6 w-full opacity-10" style={{ backgroundColor: '#ffff00' }}></div>
          </div>
        );
      case 'circuit':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-10">
             <svg width="100%" height="100%"><pattern id={safeId("circuit-bg")} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M0 50 L50 50 L50 100 M50 0 L50 50 L100 50" fill="none" stroke={primary} strokeWidth="2"/><circle cx="50" cy="50" r="4" fill={primary}/></pattern><rect width="100%" height="100%" fill={`url(#${safeId("circuit-bg")})`}/></svg>
          </div>
        );
      case 'duotone':
        return (
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="flex-1 opacity-5" style={{ backgroundColor: primary }}></div>
            <div className="flex-1 opacity-5" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'royal':
        return (
          <div className="absolute inset-0 pointer-events-none border-[15px] border-double opacity-20" style={{ borderColor: primary }}>
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: primary }}></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: primary }}></div>
          </div>
        );
      case 'modern':
      case 'minimal':
      default:
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute top-1/2 left-10 right-10 h-px bg-current"></div>
            <div className="absolute top-10 bottom-10 left-1/2 w-px bg-current"></div>
          </div>
        );
    }
  }, [data.layout, primary, secondary, side]);

  const commonStyles = {
    backgroundColor: currentBg,
    color: currentText,
    fontFamily: data.fontFamily,
    transition: dragging ? 'none' : 'background-color 0.4s ease, color 0.4s ease'
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
        className={`absolute z-20 cursor-move transition-shadow hover:ring-2 hover:ring-blue-400 hover:ring-offset-4 rounded-lg ${dragging === 'logo' ? 'opacity-50 grayscale' : ''}`}
        style={{ 
          left: `${logoX}%`, top: `${logoY}%`,
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          maxWidth: '450px', maxHeight: '450px', objectFit: 'contain'
        }} 
      />
    );
  };

  if (side === 'front') {
    return (
      <div 
        ref={cardRef}
        className="relative w-[500px] h-[300px] overflow-hidden rounded-3xl flex flex-col p-14 shadow-2xl bg-white select-none" 
        style={commonStyles}
      >
        {Decoration}
        <LogoComponent />
        
        <div 
          onMouseDown={handleMouseDown('name')}
          className={`absolute z-10 text-right cursor-move group p-2 border border-transparent hover:border-blue-300 hover:border-dashed rounded-xl transition-colors ${dragging === 'name' ? 'opacity-50' : ''}`}
          style={{ left: `${data.frontNameX}%`, top: `${data.frontNameY}%`, transform: 'translate(-50%, -50%)', minWidth: '200px' }}
        >
          <h1 className="font-black mb-1 tracking-tight leading-tight" style={{ fontSize: `${data.nameFontSize}px`, color: data.autoTextColor ? currentText : primary }}>{data.name}</h1>
          <p className="font-bold opacity-60 leading-tight" style={{ fontSize: `${data.titleFontSize}px` }}>{data.title}</p>
        </div>

        <div 
          onMouseDown={handleMouseDown('contact')}
          className={`absolute z-10 text-right cursor-move group p-3 border border-transparent hover:border-blue-300 hover:border-dashed rounded-xl transition-colors ${dragging === 'contact' ? 'opacity-50' : ''}`}
          style={{ 
            left: `${data.frontContactX}%`, top: `${data.frontContactY}%`, 
            transform: 'translate(-50%, -50%)',
            borderColor: `${currentText}15`,
            minWidth: '240px'
          }}
        >
          <div className="flex flex-col gap-2 opacity-90">
            {data.phone && (
              <div className="flex items-center justify-end gap-3 font-bold uppercase tracking-widest" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{data.phone}</span>
                <div className="p-1 rounded bg-current/5"><FlatIcon id={data.icons.phone} size={data.contactFontSize + 1} /></div>
              </div>
            )}
            {data.email && (
              <div className="flex items-center justify-end gap-3 font-bold uppercase tracking-widest" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{data.email}</span>
                <div className="p-1 rounded bg-current/5"><FlatIcon id={data.icons.email} size={data.contactFontSize + 1} /></div>
              </div>
            )}
            {data.website && (
              <div className="flex items-center justify-end gap-3 font-bold uppercase tracking-widest" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{data.website}</span>
                <div className="p-1 rounded bg-current/5"><FlatIcon id={data.icons.website} size={data.contactFontSize + 1} /></div>
              </div>
            )}
            {data.address && (
              <div className="flex items-center justify-end gap-3 font-bold uppercase tracking-widest" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{data.address}</span>
                <div className="p-1 rounded bg-current/5"><FlatIcon id={data.icons.address} size={data.contactFontSize + 1} /></div>
              </div>
            )}
            {data.extraFields.map((f) => (
              <div key={f.id} className="flex items-center justify-end gap-3 font-bold uppercase tracking-widest" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{f.value}</span>
                <div className="p-1 rounded bg-current/5"><FlatIcon id={f.iconId} size={data.contactFontSize + 1} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className="relative w-[500px] h-[300px] overflow-hidden rounded-3xl flex flex-col items-center justify-center p-12 shadow-2xl bg-white select-none" 
      style={commonStyles}
    >
        {Decoration}
        <LogoComponent />
        <div 
          onMouseDown={handleMouseDown('company')}
          className={`absolute z-10 text-center cursor-move group p-4 border border-transparent hover:border-blue-300 hover:border-dashed rounded-2xl transition-colors ${dragging === 'company' ? 'opacity-50' : ''}`}
          style={{ left: `${data.backCompanyX}%`, top: `${data.backCompanyY}%`, transform: 'translate(-50%, -50%)', minWidth: '300px' }}
        >
            <h2 className="font-black mb-1 tracking-tighter" style={{ fontSize: `${data.companyFontSize}px`, color: data.autoTextColor ? currentText : primary }}>{data.company}</h2>
            <div className="h-1 w-12 bg-current mx-auto mb-4 rounded-full opacity-20"></div>
            <p className="font-black tracking-[0.3em] uppercase opacity-50" style={{ fontSize: `${data.taglineFontSize}px` }}>{data.tagline}</p>
        </div>
    </div>
  );
};

export default CardPreview;
