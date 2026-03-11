
import React, { useState } from 'react';
import { Student } from '../types';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../services/supabaseClient';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface RegistrationFormProps {
  onComplete: (student: Student) => void;
  onCancel: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    residence: '',
    viber: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const cleanNameWithAI = async (inputName: string) => {
    if (inputName.length < 3) return;
    setIsAiProcessing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Strip away prefixes like "U, Daw, Ko, Ma, Dr" from this name. Also capitalize it properly for a student ID card. 
        Name: "${inputName}"
        Return ONLY the cleaned name string.`,
      });
      const cleaned = response.text?.trim();
      if (cleaned) {
        setFormData(prev => ({ ...prev, name: cleaned }));
      }
    } catch (e) {
      console.error("AI Formatting error", e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Generate a New ID
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.floor(100 + Math.random() * 900);
      const newId = `DL-S-${timestamp}-${random}`;

      const city = formData.residence.split('/')[1]?.trim() || formData.residence;
      const originalData = {
        "Student ID": newId,
        "Full Name": formData.name,
        "Township and City": formData.residence,
        "Viber": formData.viber,
        "Email": formData.email,
        "Registration Date": new Date().toLocaleDateString()
      };

      // 2. Submit to Supabase using the 'students_id' table
      const { error } = await supabase
        .from('students_id')
        .insert([
          { 
            id: newId, 
            name: formData.name, 
            city: city, 
            viber: formData.viber,
            email: formData.email,
            original_data: originalData 
          }
        ]);

      if (error) throw error;

      // 3. Success Feedback
      const newStudent: Student = {
        id: newId,
        name: formData.name,
        city: city,
        originalData: originalData
      };

      onComplete(newStudent);
    } catch (error) {
      console.error('Supabase Submission Error:', error);
      alert('Registration failed. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-morphism rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/60 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-2">Student Registration</h2>
        <p className="text-slate-500 text-sm font-medium">ဓမ္မလမ်း Zoom Class Student ID လျှောက်ထားခြင်း</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Full Name */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 ml-1">
            1. Full Name / အမည် <span className="text-red-500">*</span>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              U, Daw, Ko နှင့် Ma တို့ကိုမထည့်ဘဲ အင်္ဂလိပ်လို ဖြည့်ပေးပါ။
            </p>
          </label>
          <div className="relative group">
            <input 
              required
              type="text" 
              placeholder="e.g. Aye Aye Aung"
              value={formData.name}
              onBlur={() => cleanNameWithAI(formData.name)}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 bg-white shadow-sm outline-none transition-all text-lg font-semibold placeholder:text-slate-300"
            />
            {isAiProcessing && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-blue-500 text-[10px] font-bold">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                AI Formatting...
              </div>
            )}
          </div>
        </div>

        {/* Residence */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 ml-1">
            2. Township and City / နေရပ် <span className="text-red-500">*</span>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              Eg : North Dagon / Yangon
            </p>
          </label>
          <input 
            required
            type="text" 
            placeholder="မြို့နယ် / မြို့ အမည်"
            value={formData.residence}
            onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 bg-white shadow-sm outline-none transition-all font-medium"
          />
        </div>

        {/* Viber */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 ml-1">
            3. Contact Viber Number <span className="text-red-500">*</span>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              Viber ဖုန်းနံပါတ် ဖြည့်ပေးပါ။
            </p>
          </label>
          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7360f2]">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
             </div>
             <input 
               required
               type="tel" 
               placeholder="09..."
               value={formData.viber}
               onChange={(e) => setFormData({ ...formData, viber: e.target.value })}
               className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 bg-white shadow-sm outline-none transition-all font-mono font-bold"
             />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 ml-1">
            4. Email Address
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              အီးမေးလ်လိပ်စာ ဖြည့်ပေးပါ။ (Optional)
            </p>
          </label>
          <input 
            type="email" 
            placeholder="example@mail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 bg-white shadow-sm outline-none transition-all font-medium"
          />
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                လုံခြုံစွာ ပေးပို့နေသည်...
              </>
            ) : (
              'Submit Registration'
            )}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
