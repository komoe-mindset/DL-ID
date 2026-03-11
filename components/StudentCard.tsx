
import React, { useState } from 'react';
import { Student } from '../types';
import { translations } from '../constants';

interface StudentCardProps {
  student: Student;
  index: number;
  searchTerm?: string;
  lang: 'my' | 'en';
}

const StudentCard: React.FC<StudentCardProps> = ({ student, index, searchTerm = '', lang }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);

  const t = (key: keyof typeof translations['en']): string => {
    return (translations[lang] as any)[key] || (translations['en'] as any)[key];
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(student.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `ဓမ္မလမ်း Zoom Class ကျောင်းသားအချက်အလက်\nအမည်: ${student.name}\nStudent ID: ${student.id}\nနေရပ်: ${student.city}\n\nအသေးစိတ်ကြည့်ရန်: ${window.location.href}`;
    navigator.clipboard.writeText(shareText);
    setShareStatus(true);
    setTimeout(() => setShareStatus(false), 2000);
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const highlightText = (text: string, highlight: string) => {
    const cleanHighlight = highlight.trim().replace(/\s+/g, ' ');
    if (!cleanHighlight) return text;
    const escapedHighlight = cleanHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === cleanHighlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-blue-900 px-0.5 rounded-sm font-bold shadow-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const detailKeys = Object.keys(student.originalData).filter(key => {
    const k = key.trim().toLowerCase();
    return !['student id', 'id', 'full name', 'name', 'city'].includes(k);
  });

  return (
    <div 
      onClick={toggleExpand}
      className={`glass-morphism rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 cursor-pointer group ${
        isExpanded ? 'border-blue-500 shadow-xl ring-2 ring-blue-50' : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
      }`}
      style={{ animationDelay: `${Math.min(index * 40, 600)}ms`, animationFillMode: 'both' }}
    >
      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 text-xl group-hover:text-blue-700 transition-colors">
              {highlightText(student.name, searchTerm)}
            </h4>
            <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>
          </div>
          <div className="text-sm text-slate-500 flex items-center mt-2 font-medium">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2">
               <svg className="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            {highlightText(student.city, searchTerm)}
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex flex-col items-start sm:items-end">
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">{t('studentId')}</div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white px-5 py-2 rounded-xl font-mono font-bold text-xl shadow-lg shadow-blue-200 border border-blue-500 min-w-[120px] text-center">
                {student.id}
              </span>
              <button 
                onClick={handleCopy} 
                className={`p-2.5 rounded-xl transition-all duration-200 ${copied ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100'}`}
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`bg-slate-50/50 border-t border-slate-100 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
            {t('details')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailItem label={t('fullName')} value={student.name} highlight={searchTerm} />
            <DetailItem label={t('city')} value={student.city} highlight={searchTerm} />
            {detailKeys.map((key) => (
              <DetailItem key={key} label={key} value={student.originalData[key]} highlight={searchTerm} />
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200/50 flex flex-col items-center">
             <button 
               onClick={(e) => { e.stopPropagation(); handleShare(e); }}
               className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 bg-white px-4 py-2 rounded-full border border-blue-100 shadow-sm transition-all active:scale-95"
             >
               {shareStatus ? t('copied') : t('copyShare')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; highlight?: string }> = ({ label, value, highlight = '' }) => {
  const highlightText = (text: string, h: string) => {
    if (!h.trim()) return text;
    const parts = text.split(new RegExp(`(${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === h.toLowerCase() ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
        )}
      </span>
    );
  };
  return (
    <div className="flex flex-col group/item animate-in fade-in slide-in-from-left-2 duration-300">
      <span className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wide group-hover/item:text-blue-500 transition-colors">{label}</span>
      <span className="text-sm text-slate-700 bg-white/80 px-4 py-3 rounded-xl border border-slate-100 shadow-sm font-medium group-hover/item:border-blue-200 transition-all">{highlight ? highlightText(value, highlight) : (value || '-')}</span>
    </div>
  );
};

export default StudentCard;
