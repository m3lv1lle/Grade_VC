import { useState } from 'react';
import { User, Trash2, Settings as SettingsIcon, Moon, Sun, Languages, BookOpen, Calendar, Plus, X, RotateCcw } from 'lucide-react';

// Define types and constants locally to avoid import errors
type Semester = '12/1' | '12/2' | '13/1' | '13/2';

interface SemesterDateRange {
  id: Semester;
  start: string;
  end: string;
}

const DEFAULT_SUBJECTS = [
  'Mathematik', 'Deutsch', 'Englisch', 'Geschichte', 'Sozialkunde', 
  'Biologie', 'Chemie', 'Physik', 'Informatik', 'Religion', 
  'Ethik', 'Sport', 'Kunst', 'Musik', 'Wirtschaft'
];

interface SettingsProps {
  user: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  lang: 'de' | 'en';
  setLang: (val: 'de' | 'en') => void;
  subjectList: string[];
  setSubjectList: (subjects: string[]) => void;
  semesterConfig: SemesterDateRange[];
  setSemesterConfig: (config: SemesterDateRange[]) => void;
  onDeleteUser: () => void;
}

export default function Settings({ 
  user, darkMode, setDarkMode, lang, setLang, 
  subjectList, setSubjectList, semesterConfig, setSemesterConfig, onDeleteUser 
}: SettingsProps) {
  
  const [newSubject, setNewSubject] = useState('');

  const addSubject = () => {
    if (newSubject.trim() && !subjectList.includes(newSubject.trim())) {
      setSubjectList([...subjectList, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (subj: string) => {
    setSubjectList(subjectList.filter(s => s !== subj));
  };

  const updateSemesterDate = (index: number, field: 'start' | 'end', value: string) => {
    const newConfig = [...semesterConfig];
    newConfig[index][field] = value;
    setSemesterConfig(newConfig);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* User Management */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <User className="w-5 h-5" /> Account
        </h3>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg p-4 flex items-center justify-between">
            <div>
                <h4 className="font-bold text-red-900 dark:text-red-200">Delete Profile</h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">Permanently remove {user?.username} and all data.</p>
            </div>
            <button onClick={onDeleteUser} className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
            </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" /> Appearance & Language
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-orange-500" />}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Switch between Light and Dark themes</p>
                    </div>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Languages className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white">Language</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Interface Language</p>
                    </div>
                </div>
                <div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                    <button onClick={() => setLang('de')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${lang === 'de' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}>DE</button>
                    <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${lang === 'en' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}>EN</button>
                </div>
            </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Subjects</h3>
            <button onClick={() => setSubjectList(DEFAULT_SUBJECTS)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600">
                <RotateCcw className="w-3 h-3" /> Reset
            </button>
        </div>
        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                placeholder="Add new subject..." 
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
            <button onClick={addSubject} disabled={!newSubject.trim()} className="bg-slate-900 dark:bg-indigo-600 text-white px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                <Plus className="w-4 h-4" /> Add
            </button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            {subjectList.map(subj => (
                <div key={subj} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm group">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{subj}</span>
                    <button onClick={() => removeSubject(subj)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
            ))}
        </div>
      </div>

      {/* Semester Config */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6"><Calendar className="w-5 h-5" /> Semester Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {semesterConfig.map((config, idx) => (
                <div key={config.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">{idx + 1}</span>
                        {config.id}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Start</label>
                            <input type="date" className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200" 
                                value={config.start} 
                                onChange={(e) => updateSemesterDate(idx, 'start', e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">End</label>
                            <input type="date" className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200" 
                                value={config.end} 
                                onChange={(e) => updateSemesterDate(idx, 'end', e.target.value)} 
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}