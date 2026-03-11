
import React, { useMemo, useState } from 'react';
import { Student } from '../types';
import { VIBER_LINK, TELEGRAM_LINK, FACEBOOK_LINK, YOUTUBE_LINK, PATRON_WEBSITE_LINK, translations } from '../constants';

interface InsightsProps {
  students: Student[];
  lang: 'my' | 'en';
}

const Insights: React.FC<InsightsProps> = ({ students, lang }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'latest' | 'city'>('latest');

  const t = (key: keyof typeof translations['en']): string => {
    return (translations[lang] as any)[key] || (translations['en'] as any)[key];
  };

  const stats = useMemo(() => {
    const locations: Record<string, number> = {};
    students.forEach(s => {
      const city = s.city?.trim().toUpperCase() || 'UNKNOWN';
      locations[city] = (locations[city] || 0) + 1;
    });

    const allLocations = Object.entries(locations).sort(([, a], [, b]) => b - a);

    const latestStudents = [...students]
      .filter(s => !!s.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 20);

    const cityStudents = selectedCity 
      ? students.filter(s => (s.city?.trim().toUpperCase() || 'UNKNOWN') === selectedCity)
      : [];

    return {
      total: students.length,
      allLocations,
      latestStudents,
      cityStudents,
      totalCities: allLocations.length
    };
  }, [students, selectedCity]);

  const displayCities = useMemo(() => {
    if (!citySearchQuery) return stats.allLocations;
    return stats.allLocations.filter(([city]) => 
      city.toLowerCase().includes(citySearchQuery.toLowerCase())
    );
  }, [stats.allLocations, citySearchQuery]);

  const openModal = (type: 'latest' | 'city') => {
    setModalType(type);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const renderModalContent = () => {
    const list = modalType === 'latest' ? stats.latestStudents : stats.cityStudents;
    const title = modalType === 'latest' 
      ? t('latestMembersTitle') 
      : (lang === 'my' ? `${selectedCity} ${t('membersIn')}` : `${t('membersIn')} ${selectedCity}`);

    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-2xl h-[90vh] sm:h-[80vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-20 duration-500">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {list.length} {t('recordsFound')}
              </p>
            </div>
            <button 
              onClick={closeModal}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {list.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-blue-600 text-xs shadow-sm border border-slate-100">{s.name.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm leading-tight">{s.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.city || 'YGN'}</div>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm">
                    {s.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={closeModal}
              className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Overview and City Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-morphism rounded-[2.5rem] p-10 flex flex-col items-center justify-center border border-white shadow-2xl relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
           <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-4">{t('totalParticipants')}</h3>
           <div className="text-7xl font-black text-blue-600 tracking-tighter tabular-nums">{stats.total.toLocaleString()}</div>
           <p className="text-slate-500 text-sm mt-4 font-medium italic">"Learning Dhamma together"</p>
        </div>

        <div className="glass-morphism rounded-[2.5rem] p-8 border border-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">{t('distByCity')} ({stats.totalCities})</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder={t('filterCity')}
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                className="bg-slate-200/60 border border-slate-300/50 text-slate-800 rounded-full px-4 py-1.5 text-[11px] font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none w-40 shadow-inner placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
            {displayCities.map(([city, count], idx) => {
              const percentage = Math.round((count / stats.total) * 100);
              const isActive = selectedCity === city;
              return (
                <button 
                  key={city} 
                  onClick={() => setSelectedCity(isActive ? null : city)}
                  className={`w-full text-left group transition-all p-2 rounded-xl border ${isActive ? 'bg-blue-600 border-blue-500 shadow-lg scale-[1.02]' : 'bg-white/50 border-transparent hover:border-slate-200'}`}
                >
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className={isActive ? 'text-white' : 'text-slate-600'}>{city}</span>
                    <span className={isActive ? 'text-blue-100' : 'text-slate-400'}>{count} ({percentage}%)</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isActive ? 'bg-blue-800/50' : 'bg-slate-100'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isActive ? 'bg-white' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                      style={{ width: `${percentage || 1}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedCity && (
            <button onClick={() => setSelectedCity(null)} className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline text-center w-full bg-blue-50 py-2 rounded-lg border border-blue-100">{t('clearFilter')}</button>
          )}
        </div>
      </div>

      {/* Action Buttons for Mobile Optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Members Button */}
        <button 
          onClick={() => openModal('latest')}
          className="glass-morphism rounded-[2.5rem] p-8 border border-white shadow-xl hover:shadow-2xl transition-all group flex items-center justify-between bg-gradient-to-r from-white to-blue-50/30"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="text-left">
              <h3 className="font-black text-slate-800 text-lg leading-tight">{t('latestMembersTitle')}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t('viewMembers')}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:translate-x-1 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </button>

        {/* City Members Button (Conditional) */}
        <button 
          disabled={!selectedCity}
          onClick={() => openModal('city')}
          className={`glass-morphism rounded-[2.5rem] p-8 border border-white shadow-xl transition-all group flex items-center justify-between ${selectedCity ? 'bg-gradient-to-r from-white to-emerald-50/30 hover:shadow-2xl' : 'opacity-50 grayscale cursor-not-allowed'}`}
        >
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${selectedCity ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className="text-left">
              <h3 className="font-black text-slate-800 text-lg leading-tight">
                {selectedCity ? (lang === 'my' ? `${selectedCity} ${t('membersIn')}` : `${t('membersIn')} ${selectedCity}`) : t('distByCity')}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedCity ? t('viewMembers') : t('filterCity')}</p>
            </div>
          </div>
          {selectedCity && (
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:translate-x-1 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )}
        </button>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && renderModalContent()}

      {/* Patron Section */}
      <div className="glass-morphism rounded-[2.5rem] p-8 border-2 border-amber-100 shadow-2xl relative overflow-hidden group bg-gradient-to-br from-white to-amber-50/30">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{t('leaderPatron')}</div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 leading-relaxed whitespace-pre-line">{t('patronName')}</h2>
          <a href={PATRON_WEBSITE_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-xl shadow-amber-200 transition-all active:scale-95 group">
            {t('visitWebsite')}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>

      {/* Community Links */}
      <div className="glass-morphism rounded-[2.5rem] p-10 border border-white shadow-2xl">
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-8">{t('stayUpdated')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href={VIBER_LINK} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-[#7360f2] hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#7360f2] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className="font-black text-slate-800 text-sm text-center">{t('viberGroup')}</div>
          </a>
          <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-[#24A1DE] hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#24A1DE] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </div>
            <div className="font-black text-slate-800 text-sm text-center">{t('telegramChannel')}</div>
          </a>
          <a href={FACEBOOK_LINK} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-[#1877F2] hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#1877F2] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </div>
            <div className="font-black text-slate-800 text-sm text-center">{t('facebookPage')}</div>
          </a>
          <a href={YOUTUBE_LINK} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-[#FF0000] hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#FF0000] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17Z"/><path d="m10 15 5-3-5-3Z"/></svg>
            </div>
            <div className="font-black text-slate-800 text-sm text-center">{t('youtubeChannel')}</div>
          </a>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.4); border-radius: 10px; border: 1px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.6); }
      `}</style>
    </div>
  );
};

export default Insights;
