
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
        if (pixels[i+3] > 0) { pixels[i]=255; pixels[i+1]=255; pixels[i+2]=255; }
      }
      ctx.putImageData(imageData, 0, 0);
      setProcessedLogo(canvas.toDataURL());
    };
  }, [data.logoUrl, isWhiteMode]);

  const currentBg = side === 'front' ? data.frontBackgroundColor : data.backBackgroundColor;
  const currentText = data.autoTextColor ? getContrastColor(currentBg) : data.textColor;

  // زخارف الخلفية لكل نمط
  const Decoration = useMemo(() => {
    const color = data.primaryColor;
    switch (data.layout) {
      case 'corporate':
        return <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10" style={{ backgroundColor: color }}></div>
          <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: color }}></div>
        </div>;
      case 'creative':
        return <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: color }}></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: data.secondaryColor }}></div>
        </div>;
      case 'luxury':
        return <div className="absolute inset-0 overflow-hidden pointer-events-none border-[12px]" style={{ borderColor: `${color}15` }}>
          <div className="absolute inset-4 border border-current opacity-20"></div>
        </div>;
      case 'modern':
        return <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full skew-x-12 origin-top-left opacity-5" style={{ backgroundColor: color }}></div>
        </div>;
      case 'tech':
        return <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10" style={{ backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>;
      case 'eco':
        return <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: color }}></div>
          <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full opacity-30" style={{ backgroundColor: data.secondaryColor }}></div>
        </div>;
      case 'royal':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-6 border-2" style={{ borderColor: `${color}40`, borderRadius: '4px' }}></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1" style={{ backgroundColor: color }}></div>
        </div>;
      case 'gradient':
        return <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: `linear-gradient(135deg, ${color} 0%, ${data.secondaryColor} 100%)` }}></div>;
      case 'glass':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-10 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-2xl"></div>
        </div>;
      case 'neon':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ borderColor: color }}></div>
        </div>;
      case 'grid':
        return <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>;
      case 'retro':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: color }}></div>
          <div className="absolute top-6 left-0 w-full h-4 opacity-50" style={{ backgroundColor: data.secondaryColor }}></div>
        </div>;
      case 'flat':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-32 h-32 rotate-45 translate-x-16 translate-y-16" style={{ backgroundColor: color }}></div>
        </div>;
      case 'abstract':
        return <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-10" style={{ 
              width: 100 + i * 50, height: 100 + i * 50, 
              top: `${Math.sin(i) * 50}%`, left: `${Math.cos(i) * 50}%`,
              backgroundColor: i % 2 === 0 ? color : data.secondaryColor 
            }}></div>
          ))}
        </div>;
      case 'brutalist':
        return <div className="absolute inset-0 pointer-events-none border-[8px] border-black">
          <div className="absolute top-0 left-12 w-4 h-full bg-black opacity-10"></div>
        </div>;
      case 'origami':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', backgroundColor: color, opacity: 0.05 }}></div>
        </div>;
      case 'circuit':
        return <div className="absolute inset-0 pointer-events-none opacity-10">
           <svg width="100%" height="100%"><pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M0 50h50v50M50 0v50" fill="none" stroke={color} strokeWidth="2"/></pattern><rect width="100%" height="100%" fill="url(#circuit)"/></svg>
        </div>;
      case 'waves':
        return <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10" style={{ borderRadius: '100% 100% 0 0', backgroundColor: color, transform: 'scaleX(1.5)' }}></div>
        </div>;
      case 'blueprint':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
          <div className="absolute bottom-4 right-4 text-[10px] opacity-30 font-mono">DRAWING NO. 0025-A</div>
        </div>;
      case 'duotone':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 w-1/2 h-full opacity-20" style={{ backgroundColor: color }}></div>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-20" style={{ backgroundColor: data.secondaryColor }}></div>
        </div>;
      case 'stellar':
        return <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full" style={{ 
              width: Math.random() * 3, height: Math.random() * 3,
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              opacity: Math.random()
            }}></div>
          ))}
        </div>;
      case 'mosaic':
        return <div className="absolute inset-0 pointer-events-none opacity-10 grid grid-cols-8 grid-rows-6">
          {[...Array(48)].map((_, i) => (
            <div key={i} className="border-r border-b" style={{ borderColor: color, backgroundColor: i % 7 === 0 ? color : 'transparent' }}></div>
          ))}
        </div>;
      case 'minimal-dark':
        return <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-10 top-0 bottom-0 w-px bg-white/10"></div>
        </div>;
      default: return null;
    }
  }, [data.layout, data.primaryColor, data.secondaryColor]);

  const commonStyles = {
    backgroundColor: currentBg,
    color: currentText,
    borderColor: data.primaryColor,
    fontFamily: data.fontFamily,
  };

  const FlatIcon = ({ id, size = 12 }: { id: string, size?: number }) => {
    const path = FLAT_ICONS[id] || FLAT_ICONS['info'];
    return (
      <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
          className="absolute z-20 pointer-events-none"
          style={{ 
            left: `${logoX}%`, top: `${logoY}%`,
            transform: `translate(-50%, -50%) scale(${logoScale})`,
            maxWidth: '300px', maxHeight: '300px', objectFit: 'contain'
          }} 
        />
      );
    }
    return null;
  };

  if (side === 'front') {
    return (
      <div className={`relative w-[500px] h-[300px] overflow-hidden rounded-xl flex flex-col justify-center p-14 shadow-2xl transition-all duration-500`} style={commonStyles}>
        {Decoration}
        <LogoComponent />
        <div className="z-10 text-right relative">
          <h1 className="text-4xl font-black mb-1.5 leading-tight" style={{ color: data.autoTextColor ? currentText : data.primaryColor }}>{data.name}</h1>
          <p className="text-lg font-bold opacity-80 tracking-wide">{data.title}</p>
          <div className="mt-8 pt-6 border-t flex flex-col gap-2.5 opacity-85" style={{ borderColor: `${currentText}30` }}>
            {data.phone && <div className="flex items-center justify-end gap-2 text-xs font-bold"><span>{data.phone}</span><FlatIcon id={data.icons.phone} /></div>}
            {data.email && <div className="flex items-center justify-end gap-2 text-xs font-bold"><span>{data.email}</span><FlatIcon id={data.icons.email} /></div>}
            {data.website && <div className="flex items-center justify-end gap-2 text-xs font-bold"><span>{data.website}</span><FlatIcon id={data.icons.website} /></div>}
            {data.extraFields.map((f) => <div key={f.id} className="flex items-center justify-end gap-2 text-xs font-bold"><span>{f.value}</span><FlatIcon id={f.iconId} /></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-[500px] h-[300px] overflow-hidden rounded-xl flex flex-col items-center justify-center p-12 shadow-2xl transition-all duration-500`} style={commonStyles}>
        {Decoration}
        <LogoComponent />
        <div className="mt-auto z-10 text-center relative">
            <h2 className="text-3xl font-black mb-1" style={{ color: data.autoTextColor ? currentText : data.primaryColor }}>{data.company}</h2>
            <p className="text-[11px] font-black tracking-[0.2em] uppercase opacity-70 mb-4">{data.tagline}</p>
            {data.address && <div className="text-[9px] opacity-60 font-bold flex items-center justify-center gap-1.5"><FlatIcon id={data.icons.address} size={10} /><span>{data.address}</span></div>}
        </div>
    </div>
  );
};

export default CardPreview;
