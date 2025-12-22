
import React, { useState, useRef } from 'react';
import { CardData, CardLayout } from '../types';
import { TEMPLATES, ARABIC_FONTS } from '../constants';
import { generateProfessionalContent } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface SidebarProps {
  data: CardData;
  setData: React.Dispatch<React.SetStateAction<CardData>>;
}

const Sidebar: React.FC<SidebarProps> = ({ data, setData }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [activeLogoTab, setActiveLogoTab] = useState<'front' | 'back'>('back');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'range' || type === 'number' ? parseFloat(value) : value);
    setData(prev => ({ ...prev, [name]: val }));
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

  const removeLogo = () => {
    setData(prev => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAIHelp = async () => {
    setLoadingAI(true);
    const suggestions = await generateProfessionalContent(data.title, data.company);
    if (suggestions && suggestions.length > 0) {
      setData(prev => ({ ...prev, tagline: suggestions[0] }));
    }
    setLoadingAI(false);
  };

  const captureCard = async (id: string) => {
    const element = document.getElementById(id);
    if (!element) return null;
    return await html2canvas(element, { scale: 4, useCORS: true, backgroundColor: null, logging: false });
  };

  const downloadPDF = async () => {
    setExporting('pdf');
    try {
      const frontCanvas = await captureCard('card-front');
      const backCanvas = await captureCard('card-back');
      if (!frontCanvas || !backCanvas) return;
      const pdf = new jsPDF('l', 'mm', [85, 55]);
      pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, 85, 55);
      pdf.addPage([85, 55], 'l');
      pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, 85, 55);
      pdf.save(`ProCard_${data.name}.pdf`);
    } catch (err) { console.error(err); }
    setExporting(null);
  };

  const downloadImages = async () => {
    setExporting('img');
    try {
      const frontCanvas = await captureCard('card-front');
      const backCanvas = await captureCard('card-back');
      if (frontCanvas) {
        const link = document.createElement('a');
        link.download = `Front_${data.name}.png`;
        link.href = frontCanvas.toDataURL('image/png');
        link.click();
      }
      if (backCanvas) {
        const link = document.createElement('a');
        link.download = `Back_${data.name}.png`;
        link.href = backCanvas.toDataURL('image/png');
        link.click();
      }
    } catch (err) { console.error(err); }
    setExporting(null);
  };

  const inputClass = "w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-right shadow-sm text-slate-900 appearance-none";
  const labelClass = "block text-sm font-extrabold text-slate-800 mb-1.5 mr-1";
  const colorLabelClass = "text-[10px] font-black text-slate-500 text-center mb-1 block";
  const sliderClass = "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600";

  return (
    <div className="w-full lg:w-[480px] bg-white border-l border-slate-200 h-full overflow-y-auto p-5 scrollbar-hide shadow-2xl z-30 flex flex-col no-print">
      <div className="mb-4 sticky top-0 bg-white z-10 pb-3 border-b border-slate-100 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-none mb-1">محرك التصميم الإبداعي</h2>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Advanced Branding Suite</p>
        </div>
      </div>

      <div className="space-y-6 flex-1 pb-10">
        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className={labelClass}>النمط</label>
                <select name="layout" value={data.layout} onChange={handleChange} className={inputClass}>
                  {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
             </div>
             <div>
                <label className={labelClass}>الخط العربي</label>
                <select name="fontFamily" value={data.fontFamily} onChange={handleChange} className={inputClass} style={{ fontFamily: data.fontFamily }}>
                  {ARABIC_FONTS.map(f => <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>{f.name}</option>)}
                </select>
             </div>
          </div>
        </section>

        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm border-t-4 border-t-blue-500">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-[11px] font-black text-slate-900 uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                إدارة الشعار والعلامة
             </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 p-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-black text-xs hover:border-blue-500 transition-all">
                {data.logoUrl ? 'تحديث ملف الشعار' : 'تحميل شعار الشركة'}
              </button>
              {data.logoUrl && (
                <button onClick={removeLogo} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              )}
            </div>

            {data.logoUrl && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex border-b">
                   <button onClick={() => setActiveLogoTab('front')} className={`flex-1 p-2 text-[10px] font-black uppercase ${activeLogoTab === 'front' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>الوجه الأمامي</button>
                   <button onClick={() => setActiveLogoTab('back')} className={`flex-1 p-2 text-[10px] font-black uppercase ${activeLogoTab === 'back' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>الوجه الخلفي</button>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500">خيارات العرض</span>
                    <div className="flex items-center gap-3">
                      {!data.logoBgRemoved && (
                        <button onClick={removeBackground} className="text-[8px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-black hover:bg-blue-200 transition-all">
                           ✨ حذف الخلفية
                        </button>
                      )}
                      <label className="flex items-center gap-1 cursor-pointer">
                        <span className="text-[9px] font-black text-slate-400 uppercase">إظهار</span>
                        <input type="checkbox" name={activeLogoTab === 'front' ? "frontLogoVisible" : "backLogoVisible"} checked={activeLogoTab === 'front' ? data.frontLogoVisible : data.backLogoVisible} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <span className="text-[9px] font-black text-blue-600 uppercase">أبيض</span>
                        <input type="checkbox" name={activeLogoTab === 'front' ? "frontLogoWhite" : "backLogoWhite"} checked={activeLogoTab === 'front' ? data.frontLogoWhite : data.backLogoWhite} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500">حجم الشعار</span>
                      <span className="text-[10px] font-black text-blue-600">{( (activeLogoTab === 'front' ? data.frontLogoScale : data.backLogoScale) * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" name={activeLogoTab === 'front' ? "frontLogoScale" : "backLogoScale"} min="0.1" max="4" step="0.1" value={activeLogoTab === 'front' ? data.frontLogoScale : data.backLogoScale} onChange={handleChange} className={sliderClass} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1 text-center">أفقي (X)</span>
                      <input type="range" name={activeLogoTab === 'front' ? "frontLogoX" : "backLogoX"} min="0" max="100" value={activeLogoTab === 'front' ? data.frontLogoX : data.backLogoX} onChange={handleChange} className={sliderClass} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1 text-center">رأسي (Y)</span>
                      <input type="range" name={activeLogoTab === 'front' ? "frontLogoY" : "backLogoY"} min="0" max="100" value={activeLogoTab === 'front' ? data.frontLogoY : data.backLogoY} onChange={handleChange} className={sliderClass} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-[10px] font-black text-pink-500 uppercase flex items-center gap-2">لوحة الألوان</h3>
             <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[9px] font-black text-slate-500">تباين ذكي</span>
                <input type="checkbox" name="autoTextColor" checked={data.autoTextColor} onChange={handleChange} className="w-4 h-4 rounded accent-pink-500" />
             </label>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><span className={colorLabelClass}>خلفية الأمام</span><input type="color" name="frontBackgroundColor" value={data.frontBackgroundColor} onChange={handleChange} className="w-full h-10 rounded-lg cursor-pointer bg-white p-1 border border-slate-200" /></div>
            <div><span className={colorLabelClass}>خلفية الخلف</span><input type="color" name="backBackgroundColor" value={data.backBackgroundColor} onChange={handleChange} className="w-full h-10 rounded-lg cursor-pointer bg-white p-1 border border-slate-200" /></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="color" name="primaryColor" value={data.primaryColor} onChange={handleChange} className="w-full h-8 rounded" />
            <input type="color" name="secondaryColor" value={data.secondaryColor} onChange={handleChange} className="w-full h-8 rounded" />
            <input type="color" name="textColor" value={data.textColor} onChange={handleChange} className="w-full h-8 rounded" disabled={data.autoTextColor} />
          </div>
        </section>

        <div className="space-y-4">
          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-[9px] font-black text-indigo-600 mb-3 uppercase">البيانات الشخصية والعنوان</h3>
            <div className="space-y-3">
              <input name="name" value={data.name} onChange={handleChange} className={inputClass} placeholder="الاسم الكامل" />
              <input name="title" value={data.title} onChange={handleChange} className={inputClass} placeholder="المسمى الوظيفي" />
              <input name="address" value={data.address} onChange={handleChange} className={inputClass} placeholder="العنوان (المدينة، الدولة)" />
            </div>
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-[9px] font-black text-orange-600 mb-3 uppercase">بيانات التواصل</h3>
            <div className="space-y-3">
              <input name="phone" value={data.phone} onChange={handleChange} className={inputClass} placeholder="رقم الهاتف" />
              <input name="email" value={data.email} onChange={handleChange} className={inputClass} placeholder="البريد الإلكتروني" />
              <input name="website" value={data.website} onChange={handleChange} className={inputClass} placeholder="الموقع الإلكتروني" />
            </div>
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-[9px] font-black text-emerald-600 mb-3 flex justify-between items-center">
              <span>الهوية المؤسسية</span>
              <button 
                onClick={handleAIHelp} 
                disabled={loadingAI}
                className="text-[9px] bg-[#1a1c1e] text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 hover:bg-black transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loadingAI ? 'جاري التوليد...' : 'ذكاء اصطناعي ✨'}
              </button>
            </h3>
            <div className="space-y-3">
              <input name="company" value={data.company} onChange={handleChange} className={inputClass} placeholder="اسم الشركة" />
              <input name="tagline" value={data.tagline} onChange={handleChange} className={inputClass} placeholder="الشعار اللفظي" />
            </div>
          </section>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
          <button onClick={downloadPDF} disabled={!!exporting} className={`p-3 bg-blue-600 text-white rounded-xl font-black text-sm ${exporting === 'pdf' ? 'opacity-50 animate-pulse' : ''}`}>تحميل PDF</button>
          <button onClick={downloadImages} disabled={!!exporting} className={`p-3 bg-slate-800 text-white rounded-xl font-black text-sm ${exporting === 'img' ? 'opacity-50 animate-pulse' : ''}`}>تحميل صور</button>
      </div>
    </div>
  );
};

export default Sidebar;
