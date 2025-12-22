
import React, { useState, useRef } from 'react';
import { CardData, ExtraField } from '../types';
import { TEMPLATES, ARABIC_FONTS, FLAT_ICONS, TRANSLATIONS } from '../constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface SidebarProps {
  data: CardData;
  setData: React.Dispatch<React.SetStateAction<CardData>>;
  lang: 'ar' | 'en';
}

const Sidebar: React.FC<SidebarProps> = ({ data, setData, lang }) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [activeLogoTab, setActiveLogoTab] = useState<'front' | 'back'>('back');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'range' || type === 'number' ? parseFloat(value) : value);
    setData(prev => ({ ...prev, [name]: val }));
  };

  const handleIconChange = (field: string, iconId: string) => {
    setData(prev => ({
      ...prev,
      icons: { ...prev.icons, [field]: iconId }
    }));
  };

  const addExtraField = () => {
    const newField: ExtraField = {
      id: Math.random().toString(36).substr(2, 9),
      label: t.extraFields,
      value: '',
      iconId: 'info'
    };
    setData(prev => ({ ...prev, extraFields: [...prev.extraFields, newField] }));
  };

  const removeExtraField = (id: string) => {
    setData(prev => ({ ...prev, extraFields: prev.extraFields.filter(f => f.id !== id) }));
  };

  const updateExtraField = (id: string, updates: Partial<ExtraField>) => {
    setData(prev => ({
      ...prev,
      extraFields: prev.extraFields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, logoUrl: reader.result as string, logoBgRemoved: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = () => {
    if (!data.logoUrl) return;
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
      const r = pixels[0], g = pixels[1], b = pixels[2];
      const threshold = 30;
      for (let i = 0; i < pixels.length; i += 4) {
        const pr = pixels[i], pg = pixels[i+1], pb = pixels[i+2];
        if (Math.abs(pr - r) < threshold && Math.abs(pg - g) < threshold && Math.abs(pb - b) < threshold) {
          pixels[i+3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setData(prev => ({ ...prev, logoUrl: canvas.toDataURL(), logoBgRemoved: true }));
    };
  };

  const captureCard = async (id: string) => {
    const element = document.getElementById(id);
    if (!element) return null;
    return await html2canvas(element, { 
      scale: 5, 
      useCORS: true, 
      backgroundColor: null, 
      logging: false,
      allowTaint: true
    });
  };

  const downloadPDF = async () => {
    setExporting('pdf');
    try {
      const frontCanvas = await captureCard('card-front');
      const backCanvas = await captureCard('card-back');
      if (!frontCanvas || !backCanvas) return;
      const pdf = new jsPDF('l', 'mm', [85, 55]);
      pdf.addImage(frontCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, 85, 55);
      pdf.addPage([85, 55], 'l');
      pdf.addImage(backCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, 85, 55);
      pdf.save(`Card_${data.name}.pdf`);
    } catch (err) { console.error(err); }
    setExporting(null);
  };

  const downloadImages = async () => {
    setExporting('img');
    try {
      const front = await captureCard('card-front');
      const back = await captureCard('card-back');
      const save = (canvas: HTMLCanvasElement | null, n: string) => {
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `${n}_${data.name}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      };
      save(front, t.frontSide);
      setTimeout(() => save(back, t.backSide), 300);
    } catch (err) { console.error(err); }
    setExporting(null);
  };

  const downloadSVG = async () => {
    setExporting('svg');
    try {
      const ids = ['card-front', 'card-back'];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        const width = 500;
        const height = 300;
        const cleanInnerHtml = element.innerHTML
          .replace(/<img([^>]+)>/g, '<img$1 />')
          .replace(/<br([^>]+)>/g, '<br$1 />');
        const styleText = Array.from(document.styleSheets)
          .filter(sheet => { try { return !!sheet.cssRules; } catch { return false; } })
          .map(sheet => Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'))
          .join('\n');
        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <defs>
              <style type="text/css">
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
                ${styleText}
              </style>
            </defs>
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="width: ${width}px; height: ${height}px; box-sizing: border-box;">
                ${cleanInnerHtml}
              </div>
            </foreignObject>
          </svg>
        `;
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${id}_${data.name}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        await new Promise(r => setTimeout(r, 400));
      }
    } catch (err) { console.error(err); }
    setExporting(null);
  };

  const inputClass = `w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold ${lang === 'ar' ? 'text-right' : 'text-left'} shadow-sm text-slate-900 appearance-none transition-all`;
  const labelClass = `block text-sm font-extrabold text-slate-800 mb-1.5 ${lang === 'ar' ? 'mr-1' : 'ml-1'}`;
  const sliderClass = "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600";

  const IconSelector = ({ value, onChange }: { value: string, onChange: (id: string) => void }) => (
    <div className="flex flex-wrap gap-1 mt-1 bg-white p-2 rounded-lg border border-slate-200">
      {Object.keys(FLAT_ICONS).map(iconId => (
        <button
          key={iconId}
          type="button"
          onClick={() => onChange(iconId)}
          className={`p-1.5 rounded-md border transition-all ${value === iconId ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={FLAT_ICONS[iconId]} />
          </svg>
        </button>
      ))}
    </div>
  );

  return (
    <div className={`w-full lg:w-[480px] bg-white ${lang === 'ar' ? 'border-l' : 'border-r'} border-slate-200 h-full overflow-y-auto p-5 scrollbar-hide shadow-2xl z-30 flex flex-col no-print`}>
      <div className="mb-4 sticky top-0 bg-white z-10 pb-3 border-b border-slate-100 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-none mb-1">{t.designHub}</h2>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{t.brandingSuite}</p>
        </div>
      </div>

      <div className="space-y-6 flex-1 pb-10">
        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className={labelClass}>{t.layout}</label>
                <select name="layout" value={data.layout} onChange={handleChange} className={inputClass}>
                  {TEMPLATES.map(tmp => <option key={tmp.id} value={tmp.id}>{tmp.name}</option>)}
                </select>
             </div>
             <div>
                <label className={labelClass}>{t.font}</label>
                <select name="fontFamily" value={data.fontFamily} onChange={handleChange} className={inputClass} style={{ fontFamily: data.fontFamily }}>
                  {ARABIC_FONTS.map(f => <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>{f.name}</option>)}
                </select>
             </div>
          </div>
        </section>

        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm border-t-4 border-t-blue-500 space-y-4">
          <h3 className="text-[11px] font-black text-slate-900 uppercase flex items-center gap-2">{t.logoManagement}</h3>
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 p-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-black text-xs hover:border-blue-500 transition-all">
              {data.logoUrl ? t.updateLogo : t.uploadLogo}
            </button>
          </div>

          {data.logoUrl && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex border-b">
                 <button onClick={() => setActiveLogoTab('front')} className={`flex-1 p-2 text-[10px] font-black uppercase ${activeLogoTab === 'front' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{t.frontSide}</button>
                 <button onClick={() => setActiveLogoTab('back')} className={`flex-1 p-2 text-[10px] font-black uppercase ${activeLogoTab === 'back' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{t.backSide}</button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500">OPTIONS</span>
                  <div className="flex items-center gap-3">
                    {!data.logoBgRemoved && <button onClick={removeBackground} className="text-[8px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-black hover:bg-blue-200">{t.removeBg}</button>}
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[9px] font-black text-slate-400">{t.show}</span>
                      <input type="checkbox" name={activeLogoTab === 'front' ? "frontLogoVisible" : "backLogoVisible"} checked={activeLogoTab === 'front' ? data.frontLogoVisible : data.backLogoVisible} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[9px] font-black text-blue-600">{t.white}</span>
                      <input type="checkbox" name={activeLogoTab === 'front' ? "frontLogoWhite" : "backLogoWhite"} checked={activeLogoTab === 'front' ? data.frontLogoWhite : data.backLogoWhite} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                    </label>
                  </div>
                </div>
                <input type="range" name={activeLogoTab === 'front' ? "frontLogoScale" : "backLogoScale"} min="0.1" max="4" step="0.1" value={activeLogoTab === 'front' ? data.frontLogoScale : data.backLogoScale} onChange={handleChange} className={sliderClass} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="range" name={activeLogoTab === 'front' ? "frontLogoX" : "backLogoX"} min="0" max="100" value={activeLogoTab === 'front' ? data.frontLogoX : data.backLogoX} onChange={handleChange} className={sliderClass} />
                  <input type="range" name={activeLogoTab === 'front' ? "frontLogoY" : "backLogoY"} min="0" max="100" value={activeLogoTab === 'front' ? data.frontLogoY : data.backLogoY} onChange={handleChange} className={sliderClass} />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex justify-between items-center"><h3 className="text-[10px] font-black text-pink-500 uppercase">{t.colorPanel}</h3></div>
          <div className="grid grid-cols-2 gap-4">
            <input type="color" name="frontBackgroundColor" value={data.frontBackgroundColor} onChange={handleChange} className="w-full h-10 rounded-lg cursor-pointer bg-white p-1 border border-slate-200" />
            <input type="color" name="backBackgroundColor" value={data.backBackgroundColor} onChange={handleChange} className="w-full h-10 rounded-lg cursor-pointer bg-white p-1 border border-slate-200" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="color" name="primaryColor" value={data.primaryColor} onChange={handleChange} className="w-full h-8 rounded" />
            <input type="color" name="secondaryColor" value={data.secondaryColor} onChange={handleChange} className="w-full h-8 rounded" />
            <input type="color" name="textColor" value={data.textColor} onChange={handleChange} className="w-full h-8 rounded" />
          </div>
        </section>

        <div className="space-y-4">
          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <h3 className="text-[9px] font-black text-indigo-600 uppercase">{t.personalData}</h3>
            <input name="name" value={data.name} onChange={handleChange} className={inputClass} placeholder={t.fullName} />
            <input name="title" value={data.title} onChange={handleChange} className={inputClass} placeholder={t.jobTitle} />
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-[9px] font-black text-orange-600 uppercase">{t.contactData}</h3>
            <div>
              <input name="phone" value={data.phone} onChange={handleChange} className={inputClass} placeholder={t.phone} />
              <IconSelector value={data.icons.phone} onChange={(id) => handleIconChange('phone', id)} />
            </div>
            <div>
              <input name="email" value={data.email} onChange={handleChange} className={inputClass} placeholder={t.email} />
              <IconSelector value={data.icons.email} onChange={(id) => handleIconChange('email', id)} />
            </div>
            <div>
              <input name="website" value={data.website} onChange={handleChange} className={inputClass} placeholder={t.website} />
              <IconSelector value={data.icons.website} onChange={(id) => handleIconChange('website', id)} />
            </div>
            <div>
              <input name="address" value={data.address} onChange={handleChange} className={inputClass} placeholder={t.address} />
              <IconSelector value={data.icons.address} onChange={(id) => handleIconChange('address', id)} />
            </div>
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center"><h3 className="text-[9px] font-black text-purple-600 uppercase">{t.extraFields}</h3><button onClick={addExtraField} className="text-[9px] bg-purple-600 text-white px-2 py-1 rounded-md font-bold">{t.addLine}</button></div>
            {data.extraFields.map((f) => (
              <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200 relative group">
                <button onClick={() => removeExtraField(f.id)} className={`absolute ${lang === 'ar' ? '-left-2' : '-right-2'} -top-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center shadow-lg`}>×</button>
                <input value={f.value} onChange={(e) => updateExtraField(f.id, { value: e.target.value })} className={`w-full p-2 text-xs font-bold ${lang === 'ar' ? 'text-right' : 'text-left'} border-b border-slate-100 focus:border-purple-500 outline-none mb-2`} placeholder="..." />
                <IconSelector value={f.iconId} onChange={(id) => updateExtraField(f.id, { iconId: id })} />
              </div>
            ))}
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <h3 className="text-[9px] font-black text-emerald-600 uppercase">{t.corporateIdentity}</h3>
            <input name="company" value={data.company} onChange={handleChange} className={inputClass} placeholder={t.companyName} />
            <input name="tagline" value={data.tagline} onChange={handleChange} className={inputClass} placeholder={t.tagline} />
          </section>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
          <button onClick={downloadPDF} disabled={!!exporting} className={`p-3 bg-blue-600 text-white rounded-xl font-black text-sm transition-all hover:bg-blue-700 active:scale-95`}>{t.downloadPDF}</button>
          <button onClick={downloadImages} disabled={!!exporting} className={`p-3 bg-slate-800 text-white rounded-xl font-black text-sm transition-all hover:bg-black active:scale-95`}>{t.downloadPNG}</button>
          <button onClick={downloadSVG} disabled={!!exporting} className={`col-span-2 p-3 bg-emerald-600 text-white rounded-xl font-black text-sm transition-all hover:bg-emerald-700 active:scale-95`}>{t.downloadSVG}</button>
      </div>
    </div>
  );
};

export default Sidebar;
