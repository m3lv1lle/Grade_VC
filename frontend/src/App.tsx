import { useState, useEffect, useMemo } from 'react';
import { GraduationCap, LogOut, Moon, Plus, Sun, Loader2, LayoutDashboard, FileSpreadsheet, List, Settings as SettingsIcon } from 'lucide-react';
import { DEFAULT_SUBJECTS } from './types';
import type { Grade, Semester, SemesterDateRange } from './types';
import { api } from './lib/api';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import GradeModal from './components/GradeModal';
import Settings from './components/Settings';
import ReportCard from './components/ReportCard';
import GradeList from './components/GradeList';

const DEFAULT_SEMESTER_DATES: SemesterDateRange[] = [
  { id: '12/1', start: '2023-09-12', end: '2024-02-23' },
  { id: '12/2', start: '2024-02-24', end: '2024-07-26' },
  { id: '13/1', start: '2024-09-10', end: '2025-02-14' },
  { id: '13/2', start: '2025-02-15', end: '2025-06-30' },
];

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Navigation & UI
  const [view, setView] = useState<'dashboard' | 'list' | 'report' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  
  // Settings State
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<'de'|'en'>('de');
  const [subjectList, setSubjectList] = useState<string[]>(DEFAULT_SUBJECTS);
  const [semesterConfig, setSemesterConfig] = useState<SemesterDateRange[]>(DEFAULT_SEMESTER_DATES);

  // Initial Load
  useEffect(() => {
    if (token) loadData();
  }, [token]);

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Auto-Save Settings to Backend
  useEffect(() => {
    if (token && user) {
        const timeoutId = setTimeout(() => {
            api('/auth/me', 'PUT', { 
                preferences: { subjects: subjectList, semesters: semesterConfig, theme: darkMode ? 'dark' : 'light', lang } 
            }, token).catch(console.error);
        }, 1000); // Debounce saves by 1s
        return () => clearTimeout(timeoutId);
    }
  }, [subjectList, semesterConfig, darkMode, lang]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gradesData, userData] = await Promise.all([
        api('/grades', 'GET', null, token),
        api('/auth/me', 'GET', null, token)
      ]);
      setGrades(gradesData);
      setUser(userData);
      
      // Restore user settings
      if(userData.preferences) {
        if(userData.preferences.subjects) setSubjectList(userData.preferences.subjects);
        if(userData.preferences.semesters) setSemesterConfig(userData.preferences.semesters);
        if(userData.preferences.lang) setLang(userData.preferences.lang);
        if(userData.preferences.theme) setDarkMode(userData.preferences.theme === 'dark');
      }
    } catch (e: any) {
      if (e.message === 'Unauthorized') handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setGrades([]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eintrag wirklich löschen?")) return;
    try {
      await api(`/grades/${id}`, 'DELETE', null, token);
      setGrades(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      alert("Fehler beim Löschen");
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Bist du sicher? Alle Daten werden unwiderruflich gelöscht.")) return;
    try {
        await api('/auth/me', 'DELETE', null, token);
        handleLogout();
    } catch (e) {
        alert("Fehler beim Löschen des Benutzers");
    }
  };

  const handleSaveGrade = async (gradeData: any) => {
    // Auto-assign semester based on date
    const date = gradeData.date;
    const matchingSem = semesterConfig.find(sem => date >= sem.start && date <= sem.end);
    if (matchingSem) {
        gradeData.semester = matchingSem.id;
    }

    try {
      if (editingGrade) {
        const updated = await api(`/grades/${editingGrade.id}`, 'PUT', gradeData, token);
        setGrades(prev => prev.map(g => g.id === updated.id ? updated : g));
      } else {
        const created = await api('/grades', 'POST', gradeData, token);
        setGrades(prev => [...prev, created]);
      }
      setIsModalOpen(false);
      setEditingGrade(null);
    } catch (e) {
      alert("Fehler beim Speichern");
    }
  };

  const openModal = (grade?: Grade) => {
    setEditingGrade(grade || null);
    setIsModalOpen(true);
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (grades.length === 0) return { overall: 0, subjects: [] };
    const subjectsMap = new Map();
    grades.forEach(g => {
      if(!subjectsMap.has(g.subject)) subjectsMap.set(g.subject, []);
      subjectsMap.get(g.subject).push(g);
    });

    const subjectStats: any[] = [];
    let totalPoints = 0;
    let count = 0;

    subjectsMap.forEach((gList, subject) => {
      const avg = gList.reduce((a: number, b: Grade) => a + b.score, 0) / gList.length;
      subjectStats.push({ subject, average: avg });
      totalPoints += avg;
      count++;
    });

    return { overall: count ? totalPoints / count : 0, subjects: subjectStats.sort((a,b) => b.average - a.average) };
  }, [grades]);

  if (!token) return <Auth onLogin={(t) => { localStorage.setItem('token', t); setToken(t); }} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 dark:bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg hidden sm:block">GradeTracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => openModal()} className="bg-slate-900 dark:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Neu
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
        ) : (
          <div className="space-y-8">
            {/* Nav Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
                { id: 'report', label: 'Zeugnis', icon: FileSpreadsheet },
                { id: 'list', label: 'Alle Noten', icon: List },
                { id: 'settings', label: 'Einstellungen', icon: SettingsIcon },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${view === tab.id ? 'border-slate-900 dark:border-indigo-500 text-slate-900 dark:text-white font-medium' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            {view === 'dashboard' && (
              <Dashboard 
                stats={stats} 
                gradeCount={grades.length}
                bigCount={grades.filter(g => g.type === 'big').length}
                smallCount={grades.filter(g => g.type === 'small').length}
                darkMode={darkMode}
              />
            )}

            {view === 'report' && (
              <ReportCard grades={grades} />
            )}

            {view === 'list' && (
              <GradeList 
                grades={grades} 
                onEdit={openModal} 
                onDelete={handleDelete} 
              />
            )}

            {view === 'settings' && (
              <Settings 
                user={user}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                lang={lang}
                setLang={setLang}
                subjectList={subjectList}
                setSubjectList={setSubjectList}
                semesterConfig={semesterConfig}
                setSemesterConfig={setSemesterConfig}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </div>
        )}
      </main>

      <GradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveGrade} 
        editingGrade={editingGrade} 
        subjectList={subjectList}
      />
    </div>
  );
}