
import React, { useState, useEffect, useMemo } from 'react';
import { fetchStudents } from './services/dataService';
import { findStudentsWithAI } from './services/aiService';
import { Student } from './types';
import { APP_TITLE, APP_SUBTITLE, translations } from './constants';
import StudentCard from './components/StudentCard';
import Insights from './components/Insights';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [view, setView] = useState<'search' | 'insights'>('search');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResults, setAiResults] = useState<string[] | null>(null);
  const [lang, setLang] = useState<'my' | 'en'>('my');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await fetchStudents();
      setStudents(result.students);
      setLoading(false);
    };
    loadData();
  }, []);

  const t = (key: keyof typeof translations['en']): string => {
    return (translations[lang] as any)[key] || (translations['en'] as any)[key];
  };

  const handleSmartSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsAiThinking(true);
    try {
      const ids = await findStudentsWithAI(searchTerm, students);
      setAiResults(ids);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return students.sort((a, b) => a.name.localeCompare(b.name));

    if (aiResults && aiResults.length > 0) {
      return students.filter(s => aiResults.includes(s.id));
    }
    
    return students
      .filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.id.toLowerCase().includes(term) || 
        s.city.toLowerCase().includes(term)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchTerm, aiResults]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 text-white pt-10 pb-24 px-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-5%] w-64 h-64 bg-blue-400 rounded-full blur-[100px]"></div>
        </div>

        {/* Improved Language Switcher Toggle */}
        <div className="max-w-4xl mx-auto flex justify-end mb-6 relative z-30">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-lg flex items-center">
             <button 
               onClick={() => setLang('my')}
               className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest transition-all duration-300 ${lang === 'my' ? 'bg-white text-blue-700 shadow-md scale-105' : 'text-white/70 hover:text-white'}`}
             >
               မြန်မာ
             </button>
             <button 
               onClick={() => setLang('en')}
               className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest transition-all duration-300 ${lang === 'en' ? 'bg-white text-blue-700 shadow-md scale-105' : 'text-white/70 hover:text-white'}`}
             >
               ENGLISH
             </button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md animate-in fade-in slide-in-from-top-4 duration-700">
            {APP_TITLE}
          </h1>
          <p className="text-blue-100 text-lg font-medium opacity-90 mb-10 animate-in fade-in slide-in-from-top-6 duration-700 delay-100">
            {APP_SUBTITLE}
          </p>

          <div className="flex items-center justify-center p-1 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 max-w-xs mx-auto shadow-inner animate-in fade-in zoom-in duration-700 delay-200">
             <button 
               onClick={() => setView('search')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-bold transition-all ${view === 'search' ? 'bg-white text-blue-700 shadow-xl' : 'text-white/70 hover:text-white'}`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
               {t('findId')}
             </button>

             <button 
               onClick={() => setView('insights')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-bold transition-all ${view === 'insights' ? 'bg-white text-blue-700 shadow-xl' : 'text-white/70 hover:text-white'}`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6"/><path d="M6 20V10"/><path d="M18 20V4"/></svg>
               {t('insights')}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 -mt-12 mb-32 flex-1 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 glass-morphism rounded-[3rem] shadow-xl">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">{t('syncing')}</p>
          </div>
        ) : view === 'search' ? (
          <>
            <div className="sticky top-4 z-30 mb-8">
              <div className="glass-morphism rounded-[2.5rem] p-5 shadow-2xl border border-white ring-1 ring-slate-200/50">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-14 pr-32 py-4 rounded-[1.8rem] border-none ring-4 ring-slate-50 focus:ring-blue-500 bg-white shadow-inner outline-none transition-all text-lg font-medium text-slate-900 placeholder:text-slate-300"
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {searchTerm && (
                      <button 
                        onClick={handleSmartSearch}
                        disabled={isAiThinking}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${isAiThinking ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg active:scale-95'}`}
                      >
                        {isAiThinking ? <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div> : t('idSearch')}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <div>{filteredStudents.length} {t('recordsFound')}</div>
                   <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                     <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                     {t('supabaseLinked')}
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-20">
              {filteredStudents.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[3rem] text-center">
                  <h3 className="text-xl font-black text-slate-800 mb-2">{t('noResults')}</h3>
                  <p className="text-slate-400 text-sm mb-4">{t('adjustSearch')}</p>
                </div>
              ) : (
                filteredStudents.map((student, index) => (
                  <StudentCard key={student.id} student={student} index={index} searchTerm={searchTerm} lang={lang} />
                ))
              )}
            </div>
          </>
        ) : (
          <Insights students={students} lang={lang} />
        )}
      </main>

      <footer className="py-12 text-center opacity-30">
        <p className="text-slate-400 text-[9px] uppercase tracking-[0.3em] font-black">{t('communityFooter')}</p>
      </footer>
    </div>
  );
};

export default App;
