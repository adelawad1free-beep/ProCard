
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CardPreview from './components/CardPreview';
import { CardData } from './types';
import { INITIAL_CARD_DATA_AR, INITIAL_CARD_DATA_EN, TRANSLATIONS } from './constants';

const App: React.FC = () => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [cardData, setCardData] = useState<CardData>(INITIAL_CARD_DATA_AR);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    
    // منطق تبديل المحتوى تلقائياً إذا لم يقم المستخدم بتعديله جذرياً
    // نقارن القيم الحالية بالقيم الأولية للغة الحالية
    const isDefault = (
      cardData.name === (lang === 'ar' ? INITIAL_CARD_DATA_AR.name : INITIAL_CARD_DATA_EN.name) &&
      cardData.title === (lang === 'ar' ? INITIAL_CARD_DATA_AR.title : INITIAL_CARD_DATA_EN.title) &&
      cardData.company === (lang === 'ar' ? INITIAL_CARD_DATA_AR.company : INITIAL_CARD_DATA_EN.company)
    );

    if (isDefault) {
      setCardData(nextLang === 'ar' ? INITIAL_CARD_DATA_AR : INITIAL_CARD_DATA_EN);
    }

    setLang(nextLang);
  };

  return (
    <div className={`flex flex-col lg:flex-row h-screen w-full bg-[#f8fafc] overflow-hidden ${lang === 'ar' ? "font-['Tajawal']" : "font-sans"}`}>
      <Sidebar data={cardData} setData={setCardData} lang={lang} />

      <main className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[#f1f5f9]">
        <header className="p-6 flex justify-between items-center sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-slate-200 no-print">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">C</div>
             <div>
                <h1 className="text-lg font-black text-slate-900 leading-none">{t.appName}</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'تصميم هوية' : 'Branding Hub'}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-full text-xs font-black transition-all border border-slate-200 shadow-sm active:scale-95"
            >
              {t.langToggle}
            </button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
               <span className="text-xs font-black text-slate-700">{t.previewHighRes}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 min-h-fit">
          <div className="w-full max-w-6xl space-y-16 py-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 justify-items-center">
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full shadow-lg no-print">
                  <span className="text-xs font-black opacity-50">{t.sideA}</span>
                  <div className="w-px h-3 bg-white/20"></div>
                  <span className="text-sm font-bold">{t.frontSide}</span>
                </div>
                <div id="card-front" className="transform transition-all duration-700 hover:scale-[1.02]">
                  <CardPreview data={cardData} side="front" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full shadow-lg no-print">
                  <span className="text-xs font-black opacity-50">{t.sideB}</span>
                  <div className="w-px h-3 bg-white/20"></div>
                  <span className="text-sm font-bold">{t.backSide}</span>
                </div>
                <div id="card-back" className="transform transition-all duration-700 hover:scale-[1.02]">
                  <CardPreview data={cardData} side="back" />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-200 flex flex-col items-center no-print">
               <div className="flex gap-8 opacity-40 grayscale">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-32 h-1 bg-slate-400 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase">85mm</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-1 w-32 bg-slate-400 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase">55mm</span>
                  </div>
               </div>
               <p className="mt-8 text-slate-400 text-xs font-medium max-w-md text-center leading-relaxed">
                  {t.exportEngineMsg}
               </p>
            </div>
          </div>
        </div>

        <footer className="mt-auto py-8 text-center no-print">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm transition-all hover:bg-white/60">
            <span className="text-xs font-bold text-slate-500 tracking-tight">{t.allRightsReserved}</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <a href="mailto:adelawad1@gmail.com" className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2">
              adelawad1@gmail.com
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
