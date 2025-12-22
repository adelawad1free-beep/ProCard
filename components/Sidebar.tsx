
import React from 'react';
import { CardData, CardLayout } from '../types';
import { TEMPLATES, ARABIC_FONTS } from '../constants';
import { generateProfessionalContent } from '../services/geminiService';

interface SidebarProps {
  data: CardData;
  setData: React.Dispatch<React.SetStateAction<CardData>>;
}

const Sidebar: React.FC<SidebarProps> = ({ data, setData }) => {
  const [loadingAI, setLoadingAI] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleAIHelp = async () => {
    setLoadingAI(true);
    const suggestions = await generateProfessionalContent(data.title, data.company);
    if (suggestions && suggestions.length > 0) {
      setData(prev => ({ ...prev, tagline: suggestions[0] }));
    }
    setLoadingAI(false);
  };

  const inputClass = "w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-right shadow-sm text-slate-900 font-bold placeholder:text-slate-400 appearance-none";
  const labelClass = "block text-sm font-extrabold text-slate-800 mb-1.5 mr-1";
  const colorLabelClass = "text-[10px] font-black text-slate-500 text-center mb-1 block";

  return (
    <div className="w-full lg:w-[480px] bg-white border-l border-slate-200 h-full overflow-y-auto p-5 scrollbar-hide shadow-2xl z-30 flex flex-col">
      <div className="mb-4 sticky top-0 bg-white z-10 pb-3 border-b border-slate-100">
        <h2 className="text-xl font-black text-slate-900">محرك التصميم الإبداعي</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Creative Engine v2.0</p>
      </div>

      <div className="space-y-5 flex-1 pb-10">
        {/* اختيار الأنماط والخطوط - قوائم منسدلة */}
        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <div>
            <label className={labelClass}>نمط التصميم الجمالي</label>
            <div className="relative">
              <select 
                name="layout" 
                value={data.layout} 
                onChange={handleChange} 
                className={inputClass}
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 7.757 8.586 6.343 10z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>خط الكتابة (Google Fonts)</label>
            <div className="relative">
              <select 
                name="fontFamily" 
                value={data.fontFamily} 
                onChange={handleChange} 
                className={inputClass}
                style={{ fontFamily: data.fontFamily }}
              >
                {ARABIC_FONTS.map(f => (
                  <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>{f.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 7.757 8.586 6.343 10z"/></svg>
              </div>
            </div>
          </div>
        </section>

        {/* لوحة الألوان */}
        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <h3 className="text-[9px] font-black text-pink-500 uppercase mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
            تخصيص الألوان
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <span className={colorLabelClass}>الأساسي</span>
              <input type="color" name="primaryColor" value={data.primaryColor} onChange={handleChange} className="w-full h-10 rounded-lg cursor-pointer bg-white p-1 border border-slate-200" />
            </div>
            <div>
              <span className={colorLabelClass}>الثانوي</span>
              <input type="color" name="secondaryColor" value={data.secondaryColor} onChange={handleChange} className="w-full h-10 rounded-lg cursor-pointer bg-white p-1 border border-slate-200" />
            </div>
            <div>
              <span className={colorLabelClass}>الخلفية</span>
              <input type="color" name="backgroundColor" value={data.backgroundColor} onChange={handleChange} className="w-full h-10 rounded-lg cursor-pointer bg-white p-1 border border-slate-200" />
            </div>
            <div>
              <span className={colorLabelClass}>النص</span>
              <input type="color" name="textColor" value={data.textColor} onChange={handleChange} className="w-full h-10 rounded-lg cursor-pointer bg-white p-1 border border-slate-200" />
            </div>
          </div>
        </section>

        {/* حقول البيانات */}
        <div className="space-y-4">
          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-[9px] font-black text-indigo-500 uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              البيانات الشخصية
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className={labelClass}>الاسم الكامل</label>
                <input name="name" value={data.name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>المسمى الوظيفي</label>
                <input name="title" value={data.title} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-[9px] font-black text-emerald-500 uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              الهوية المؤسسية
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>اسم الشركة</label>
                <input name="company" value={data.company} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <button onClick={handleAIHelp} disabled={loadingAI} className="text-[9px] bg-slate-900 text-white px-2 py-1 rounded-md hover:bg-black transition-all font-bold">
                    {loadingAI ? '...' : '✨ ذكاء اصطناعي'}
                  </button>
                  <label className={labelClass}>شعار نصي</label>
                </div>
                <input name="tagline" value={data.tagline} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-[9px] font-black text-orange-500 uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              بيانات الاتصال
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <input name="phone" value={data.phone} onChange={handleChange} className={inputClass} dir="ltr" placeholder="رقم الهاتف" />
              <input name="email" value={data.email} onChange={handleChange} className={inputClass} dir="ltr" placeholder="البريد الإلكتروني" />
              <input name="website" value={data.website} onChange={handleChange} className={inputClass} dir="ltr" placeholder="الموقع الإلكتروني" />
            </div>
          </section>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-100 bg-white">
        <button className="w-full p-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group">
          <span>تصدير التصميم النهائي</span>
          <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
