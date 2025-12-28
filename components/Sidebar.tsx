
import React, { useState, useRef } from 'react';
import { CardData, ExtraField } from '../types';
import { TEMPLATES, ARABIC_FONTS, FLAT_ICONS, TRANSLATIONS, PATTERNS } from '../constants';
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
      const threshold = 35;
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
    
    // تحسين خيارات الالتقاط لضمان أعلى دقة وسلامة النصوص العربية
    return await html2canvas(element, { 
      scale: 5, // رفع الدقة للطباعة (600DPI تقريباً)
      useCORS: true, 
      backgroundColor: null, 
      logging: false,
      allowTaint: true,
      scrollX: 0,
      scrollY: -window.scrollY,
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById(id);
        if (el) {
          el.style.transform = 'none';
          el.style.borderRadius = '0';
        }
      }
    });
  };

  const downloadPDF = async () => {
    setExporting('pdf');
    try {
      const frontCanvas = await captureCard('card-front');
      const backCanvas = await captureCard('card-back');
      if (!frontCanvas || !backCanvas) return;
      
      const pdf = new jsPDF({
        orientation: 'l',
        unit: 'mm',
        format: [85, 55] // مقاس الكرت القياسي بالملي
      });

      // إضافة الوجه الأمامي كصورة عالية الدقة لضمان بقاء الحروف العربية متصلة
      pdf.addImage(frontCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, 85, 55, undefined, 'FAST');
      
      pdf.addPage([85, 55], 'l');
      pdf.addImage(backCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, 85, 55, undefined, 'FAST');
      
      pdf.save(`Card_${data.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { 
      console.error("PDF Export Error:", err);
      alert("حدث خطأ أثناء تصدير PDF. يرجى تجربة حفظ الصور بدلاً من ذلك.");
    }
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
      setTimeout(() => save(back, t.backSide), 500);
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
        
        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="width: ${width}px; height: ${height}px; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
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
        await new Promise(r => setTimeout(r, 600));
      }
    } catch (err) { console.error(err); }
    setExporting(null);
  };

  const inputClass = `w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold ${lang === 'ar' ? 'text-right' : 'text-left'} shadow-sm text-slate-900 transition-all hover:border-slate-300`;
  const labelClass = `block text-[11px] font-black text-slate-500 uppercase mb-1.5 ${lang === 'ar' ? 'mr-1' : 'ml-1'}`;
  const sliderClass = "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600";

  const IconSelector = ({ value, onChange }: { value: string, onChange: (id: string) => void }) => (
    <div className="flex flex-wrap gap-1 mt-1.5 bg-white p-1.5 rounded-xl border border-slate-100">
      {Object.keys(FLAT_ICONS).map(iconId => (
        <button
          key={iconId}
          type="button"
          onClick={() => onChange(iconId)}
          className={`p-2 rounded-lg border transition-all ${value === iconId ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-110 z-10' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d={FLAT_ICONS[iconId]} />
          </svg>
        </button>
      ))}
    </div>
  );

  const FontSizeControl = ({ name, label, value }: { name: string, label: string, value: number }) => (
    <div className="mt-2 px-1">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] font-black text-slate-400">{label}</span>
        <span className="text-[10px] font-black text-blue-600">{value}px</span>
      </div>
      <input type="range" name={name} min="6" max="100" value={value} onChange={handleChange} className={sliderClass} />
    </div>
  );

  return (
    <div className={`w-full lg:w-[480px] bg-white ${lang === 'ar' ? 'border-l' : 'border-r'} border-slate-200 h-full overflow-y-auto p-6 scrollbar-hide shadow-2xl z-30 flex flex-col no-print`}>
      <div className="mb-6 sticky top-0 bg-white z-20 pb-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.designHub}</h2>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{t.brandingSuite}</p>
        </div>
      </div>

      <div className="space-y-8 flex-1 pb-10">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          <div>
              <label className={labelClass}>{t.bgPattern}</label>
              <div className="grid grid-cols-3 gap-2">
                {PATTERNS.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => setData(prev => ({ ...prev, pattern: p.id }))}
                    className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${data.pattern === p.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                  >
                    {lang === 'ar' ? p.name : p.nameEn}
                  </button>
                ))}
              </div>
          </div>
        </section>

        <section className="bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            {t.logoManagement}
          </h3>
          
          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-600 font-black text-xs hover:border-blue-500 hover:text-blue-600 transition-all group">
              <span className="block mb-1 opacity-40 group-hover:scale-110 transition-transform">📁</span>
              {data.logoUrl ? t.updateLogo : t.uploadLogo}
            </button>
          </div>

          {data.logoUrl && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="flex bg-slate-50 p-1">
                 <button onClick={() => setActiveLogoTab('front')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeLogoTab === 'front' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.frontSide}</button>
                 <button onClick={() => setActiveLogoTab('back')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeLogoTab === 'back' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.backSide}</button>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {!data.logoBgRemoved && (
                      <button onClick={removeBackground} className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-black shadow-md shadow-blue-100 hover:bg-blue-700">{t.removeBg}</button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name={activeLogoTab === 'front' ? "frontLogoVisible" : "backLogoVisible"} checked={activeLogoTab === 'front' ? data.frontLogoVisible : data.backLogoVisible} onChange={handleChange} className="w-4 h-4 rounded accent-blue-600" />
                      <span className="text-[10px] font-black text-slate-600 uppercase">{t.show}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name={activeLogoTab === 'front' ? "frontLogoWhite" : "backLogoWhite"} checked={activeLogoTab === 'front' ? data.frontLogoWhite : data.backLogoWhite} onChange={handleChange} className="w-4 h-4 rounded accent-blue-600" />
                      <span className="text-[10px] font-black text-blue-600 uppercase">{t.white}</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5"><span className="text-[10px] font-black text-slate-400">{t.logoSize}</span><span className="text-[10px] font-black text-blue-600">{(activeLogoTab === 'front' ? data.frontLogoScale : data.backLogoScale).toFixed(1)}x</span></div>
                    <input type="range" name={activeLogoTab === 'front' ? "frontLogoScale" : "backLogoScale"} min="0.1" max="4" step="0.1" value={activeLogoTab === 'front' ? data.frontLogoScale : data.backLogoScale} onChange={handleChange} className={sliderClass} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="text-[11px] font-black text-pink-500 uppercase tracking-widest">{t.colorPanel}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><span className={labelClass}>{t.bgFront}</span><input type="color" name="frontBackgroundColor" value={data.frontBackgroundColor} onChange={handleChange} className="w-full h-12 rounded-xl cursor-pointer bg-white p-1 border border-slate-200 shadow-sm" /></div>
            <div><span className={labelClass}>{t.bgBack}</span><input type="color" name="backBackgroundColor" value={data.backBackgroundColor} onChange={handleChange} className="w-full h-12 rounded-xl cursor-pointer bg-white p-1 border border-slate-200 shadow-sm" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="color" name="primaryColor" value={data.primaryColor} onChange={handleChange} className="w-full h-10 rounded-xl cursor-pointer" title="Primary" />
            <input type="color" name="secondaryColor" value={data.secondaryColor} onChange={handleChange} className="w-full h-10 rounded-xl cursor-pointer" title="Secondary" />
            <input type="color" name="textColor" value={data.textColor} onChange={handleChange} className="w-full h-10 rounded-xl cursor-pointer" title="Text" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
            <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{t.personalData}</h3>
            <div className="space-y-3">
              <div>
                <input name="name" value={data.name} onChange={handleChange} className={inputClass} placeholder={t.fullName} />
                <FontSizeControl name="nameFontSize" label={`${t.fontSize} - ${t.fullName}`} value={data.nameFontSize} />
              </div>
              <div>
                <input name="title" value={data.title} onChange={handleChange} className={inputClass} placeholder={t.jobTitle} />
                <FontSizeControl name="titleFontSize" label={`${t.fontSize} - ${t.jobTitle}`} value={data.titleFontSize} />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-5">
            <h3 className="text-[11px] font-black text-orange-600 uppercase tracking-widest">{t.contactData}</h3>
            <FontSizeControl name="contactFontSize" label={t.fontSize} value={data.contactFontSize} />
            {['phone', 'email', 'website', 'address'].map((field) => (
              <div key={field} className="space-y-1">
                <input name={field} value={(data as any)[field]} onChange={handleChange} className={inputClass} placeholder={(t as any)[field]} />
                <IconSelector value={(data.icons as any)[field]} onChange={(id) => handleIconChange(field, id)} />
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black text-purple-600 uppercase tracking-widest">{t.extraFields}</h3>
              <button onClick={addExtraField} className="text-[10px] bg-purple-600 text-white px-3 py-1.5 rounded-full font-black shadow-lg shadow-purple-100 hover:scale-105 transition-transform">{t.addLine}</button>
            </div>
            {data.extraFields.map((f) => (
              <div key={f.id} className="p-4 bg-white rounded-2xl border border-slate-200 relative group animate-in slide-in-from-top-2">
                <button onClick={() => removeExtraField(f.id)} className={`absolute ${lang === 'ar' ? '-left-2' : '-right-2'} -top-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs items-center justify-center shadow-lg hidden group-hover:flex`}>×</button>
                <input value={f.value} onChange={(e) => updateExtraField(f.id, { value: e.target.value })} className={`w-full p-2 text-sm font-bold ${lang === 'ar' ? 'text-right' : 'text-left'} border-b border-slate-100 focus:border-purple-500 outline-none mb-3`} placeholder="..." />
                <IconSelector value={f.iconId} onChange={(id) => updateExtraField(f.id, { iconId: id })} />
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
            <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{t.corporateIdentity}</h3>
            <div className="space-y-4">
              <div>
                <input name="company" value={data.company} onChange={handleChange} className={inputClass} placeholder={t.companyName} />
                <FontSizeControl name="companyFontSize" label={`${t.fontSize} - ${t.companyName}`} value={data.companyFontSize} />
              </div>
              <div>
                <input name="tagline" value={data.tagline} onChange={handleChange} className={inputClass} placeholder={t.tagline} />
                <FontSizeControl name="taglineFontSize" label={`${t.fontSize} - ${t.tagline}`} value={data.taglineFontSize} />
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <div className="pt-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4 sticky bottom-0 z-20">
          <button onClick={downloadPDF} disabled={!!exporting} className="p-4 bg-blue-600 text-white rounded-2xl font-black text-sm transition-all hover:bg-blue-700 active:scale-95 shadow-xl shadow-blue-100 disabled:opacity-50">
            {exporting === 'pdf' ? '...' : t.downloadPDF}
          </button>
          <button onClick={downloadImages} disabled={!!exporting} className="p-4 bg-slate-900 text-white rounded-2xl font-black text-sm transition-all hover:bg-black active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50">
            {exporting === 'img' ? '...' : t.downloadPNG}
          </button>
          <button onClick={downloadSVG} disabled={!!exporting} className="col-span-2 p-4 bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-100 disabled:opacity-50">
            {exporting === 'svg' ? '...' : t.downloadSVG}
          </button>
      </div>
    </div>
  );
};

export default Sidebar;
