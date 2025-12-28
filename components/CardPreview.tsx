
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

  const Decoration = useMemo(() => {
    const safeId = (id: string) => `${side}-${id}`;
    
    switch (data.layout) {
      case 'corporate':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full opacity-100" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-0 left-0 w-full h-1 opacity-10" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-10 right-2 w-24 h-px opacity-30" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-10 left-10 w-12 h-px opacity-30" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'luxury':
        return (
          <div className="absolute inset-0 pointer-events-none p-8">
            <div className="absolute inset-4 border border-current opacity-10"></div>
            <div className="absolute inset-6 border-[0.5px] border-current opacity-5"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 opacity-20" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-12 opacity-20" style={{ backgroundColor: primary }}></div>
          </div>
        );
      case 'modern':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-100/10 -skew-x-6 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-full h-px opacity-20" style={{ backgroundColor: secondary }}></div>
            <div className="absolute top-0 right-0 w-1 h-24 opacity-50" style={{ backgroundColor: secondary }}></div>
          </div>
        );
      case 'glass':
        return (
          <div className="absolute inset-0 pointer-events-none p-10 flex items-center justify-center">
            <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full opacity-10 blur-3xl" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full opacity-10 blur-3xl" style={{ backgroundColor: secondary }}></div>
            <div className="w-full h-full backdrop-blur-md bg-white/5 border border-white/20 rounded-[30px] shadow-sm"></div>
          </div>
        );
      case 'tech':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <svg width="100%" height="100%"><pattern id={safeId("tech-dot")} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill={primary}/></pattern><rect width="100%" height="100%" fill={`url(#${safeId("tech-dot")})`}/></svg>
          </div>
        );
      case 'architect':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full h-px opacity-5 bg-current"></div>
            <div className="absolute top-0 left-1/2 w-px h-full opacity-5 bg-current"></div>
            <div className="absolute top-10 left-10 w-2 h-2 border-t border-l border-current opacity-20"></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 border-b border-r border-current opacity-20"></div>
          </div>
        );
      case 'stellar':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02]" style={{ background: `radial-gradient(circle at 100% 0%, ${primary}, transparent)` }}></div>
            <div className="absolute bottom-4 left-4 flex gap-1 opacity-20">
              <div className="w-1 h-1 rounded-full bg-current"></div>
              <div className="w-1 h-1 rounded-full bg-current"></div>
              <div className="w-1 h-1 rounded-full bg-current"></div>
            </div>
          </div>
        );
      case 'minimal':
      default:
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-8 w-4 h-px opacity-20 bg-current"></div>
            <div className="absolute top-8 left-8 w-px h-4 opacity-20 bg-current"></div>
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
        className={`absolute z-20 cursor-move transition-shadow hover:ring-1 hover:ring-blue-400 hover:ring-offset-2 rounded ${dragging === 'logo' ? 'opacity-50 grayscale' : ''}`}
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
      <div 
        ref={cardRef}
        className="relative w-[500px] h-[300px] overflow-hidden rounded-xl flex flex-col p-14 shadow-xl bg-white select-none border border-slate-200/50" 
        style={commonStyles}
      >
        {Decoration}
        <LogoComponent />
        
        <div 
          onMouseDown={handleMouseDown('name')}
          className={`absolute z-10 text-right cursor-move group p-2 border border-transparent hover:border-blue-200 hover:border-dashed rounded-lg transition-colors ${dragging === 'name' ? 'opacity-50' : ''}`}
          style={{ left: `${data.frontNameX}%`, top: `${data.frontNameY}%`, transform: 'translate(-50%, -50%)', minWidth: '200px' }}
        >
          <h1 className="font-bold mb-0.5 tracking-tight leading-none" style={{ fontSize: `${data.nameFontSize}px`, color: data.autoTextColor ? currentText : primary }}>{data.name}</h1>
          <p className="font-medium opacity-50 leading-tight" style={{ fontSize: `${data.titleFontSize}px` }}>{data.title}</p>
        </div>

        <div 
          onMouseDown={handleMouseDown('contact')}
          className={`absolute z-10 text-right cursor-move group p-3 border border-transparent hover:border-blue-200 hover:border-dashed rounded-lg transition-colors ${dragging === 'contact' ? 'opacity-50' : ''}`}
          style={{ 
            left: `${data.frontContactX}%`, top: `${data.frontContactY}%`, 
            transform: 'translate(-50%, -50%)',
            minWidth: '240px'
          }}
        >
          <div className="flex flex-col gap-1.5 opacity-80">
            {data.phone && (
              <div className="flex items-center justify-end gap-2 font-bold tracking-wide" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{data.phone}</span>
                <FlatIcon id={data.icons.phone} size={data.contactFontSize + 2} />
              </div>
            )}
            {data.email && (
              <div className="flex items-center justify-end gap-2 font-bold tracking-wide" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{data.email}</span>
                <FlatIcon id={data.icons.email} size={data.contactFontSize + 2} />
              </div>
            )}
            {data.website && (
              <div className="flex items-center justify-end gap-2 font-bold tracking-wide" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{data.website}</span>
                <FlatIcon id={data.icons.website} size={data.contactFontSize + 2} />
              </div>
            )}
            {data.address && (
              <div className="flex items-center justify-end gap-2 font-bold tracking-wide" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{data.address}</span>
                <FlatIcon id={data.icons.address} size={data.contactFontSize + 2} />
              </div>
            )}
            {data.extraFields.map((f) => (
              <div key={f.id} className="flex items-center justify-end gap-2 font-bold tracking-wide" style={{ fontSize: `${data.contactFontSize}px` }}>
                <span>{f.value}</span>
                <FlatIcon id={f.iconId} size={data.contactFontSize + 2} />
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
      className="relative w-[500px] h-[300px] overflow-hidden rounded-xl flex flex-col items-center justify-center p-12 shadow-xl bg-white select-none border border-slate-200/50" 
      style={commonStyles}
    >
        {Decoration}
        <LogoComponent />
        <div 
          onMouseDown={handleMouseDown('company')}
          className={`absolute z-10 text-center cursor-move group p-4 border border-transparent hover:border-blue-200 hover:border-dashed rounded-xl transition-colors ${dragging === 'company' ? 'opacity-50' : ''}`}
          style={{ left: `${data.backCompanyX}%`, top: `${data.backCompanyY}%`, transform: 'translate(-50%, -50%)', minWidth: '300px' }}
        >
            <h2 className="font-bold mb-1 tracking-tight" style={{ fontSize: `${data.companyFontSize}px`, color: data.autoTextColor ? currentText : primary }}>{data.company}</h2>
            <div className="h-0.5 w-10 bg-current mx-auto mb-3 opacity-20"></div>
            <p className="font-bold tracking-widest uppercase opacity-40" style={{ fontSize: `${data.taglineFontSize}px` }}>{data.tagline}</p>
        </div>
    </div>
  );
};

export default CardPreview;
