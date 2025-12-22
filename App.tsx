
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
        <header className="p-6 flex justify-between items-center sticky top-0 z-20 bg-white/60 backdrop-blur-lg border-b border-slate-200">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">P</div>
             <div>
                <h1 className="text-lg font-black text-slate-900 leading-none">ProCard</h1>
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
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full shadow-lg">
                  <span className="text-xs font-black opacity-50">SIDE A</span>
                  <div className="w-px h-3 bg-white/20"></div>
                  <span className="text-sm font-bold">الوجه الأمامي للبطاقة</span>
                </div>
                <div className="transform transition-all duration-700 hover:scale-[1.03] hover:rotate-1">
                  <CardPreview data={cardData} side="front" />
                </div>
              </div>

              {/* Back Side */}
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full shadow-lg">
                  <span className="text-xs font-black opacity-50">SIDE B</span>
                  <div className="w-px h-3 bg-white/20"></div>
                  <span className="text-sm font-bold">الوجه الخلفي للبطاقة</span>
                </div>
                <div className="transform transition-all duration-700 hover:scale-[1.03] hover:-rotate-1">
                  <CardPreview data={cardData} side="back" />
                </div>
              </div>
            </div>

            {/* Bottom Decoration / Specs */}
            <div className="pt-10 border-t border-slate-200 flex flex-col items-center">
               <div className="flex gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
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
                  هذه المعاينة توضح الشكل النهائي لبطاقتك. جميع الخطوط والعناصر تم توزيعها بدقة هندسية لتناسب مكائن الطباعة العالمية.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
