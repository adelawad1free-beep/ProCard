
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CardPreview from './components/CardPreview';
import { CardData } from './types';
import { INITIAL_CARD_DATA } from './constants';

const App: React.FC = () => {
  const [cardData, setCardData] = useState<CardData>(INITIAL_CARD_DATA);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#f8fafc] overflow-hidden font-['Tajawal']">
      {/* Sidebar - Right Side */}
      <Sidebar data={cardData} setData={setCardData} />

      {/* Main Canvas - Left Side */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[#f1f5f9]">
        {/* Top Floating Header */}
        <header className="p-6 flex justify-between items-center sticky top-0 z-20 bg-white/60 backdrop-blur-lg border-b border-slate-200 no-print">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">C</div>
             <div>
                <h1 className="text-lg font-black text-slate-900 leading-none">مصمم الكروت</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Professional Design Hub</p>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
             <span className="text-xs font-black text-slate-700">مُعاينة فائقة الدقة</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 min-h-fit">
          <div className="w-full max-w-6xl space-y-16 py-10">
            {/* Front and Back Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 justify-items-center">
              {/* Front Side */}
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full shadow-lg no-print">
                  <span className="text-xs font-black opacity-50">SIDE A</span>
                  <div className="w-px h-3 bg-white/20"></div>
                  <span className="text-sm font-bold">الوجه الأمامي</span>
                </div>
                <div id="card-front" className="transform transition-all duration-700 hover:scale-[1.03]">
                  <CardPreview data={cardData} side="front" />
                </div>
              </div>

              {/* Back Side */}
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full shadow-lg no-print">
                  <span className="text-xs font-black opacity-50">SIDE B</span>
                  <div className="w-px h-3 bg-white/20"></div>
                  <span className="text-sm font-bold">الوجه الخلفي</span>
                </div>
                <div id="card-back" className="transform transition-all duration-700 hover:scale-[1.03]">
                  <CardPreview data={cardData} side="back" />
                </div>
              </div>
            </div>

            {/* Bottom Decoration */}
            <div className="pt-10 border-t border-slate-200 flex flex-col items-center no-print">
               <div className="flex gap-8 opacity-40 grayscale">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-32 h-1 bg-slate-400 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase">Standard Width (85mm)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-1 w-32 bg-slate-400 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase">Standard Height (55mm)</span>
                  </div>
               </div>
               <p className="mt-8 text-slate-400 text-xs font-medium max-w-md text-center leading-relaxed">
                  هذه المعاينة توضح الشكل النهائي لبطاقتك. تم إعداد محرك التصدير ليمنحك جودة طباعية احترافية تتناسب مع كافة مكائن الطباعة.
               </p>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <footer className="mt-auto py-8 text-center no-print">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm transition-all hover:bg-white/60">
            <span className="text-xs font-bold text-slate-500 tracking-tight">
              كافة الحقوق محفوظة 2025
            </span>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <a 
              href="mailto:adelawad1@gmail.com" 
              className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              adelawad1@gmail.com
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
