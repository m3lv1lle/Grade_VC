import { useState, useEffect, useMemo } from 'react';
import { GraduationCap, LogOut, Moon, Plus, Sun, Loader2, Edit2, Trash2 } from 'lucide-react';
import { DEFAULT_SUBJECTS } from './types';
import type { Grade } from './types';
import { api } from './lib/api';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import GradeModal from './components/GradeModal';

// Helper for color badge
const getGradeColor = (score: number) => {
  if (score >= 13) return 'bg-emerald-500';
  if (score >= 10) return 'bg-green-500';
  if (score >= 7) return 'bg-yellow-400';
  if (score >= 4) return 'bg-orange-400';
  if (score >= 1) return 'bg-red-500';
  return 'bg-red-800';
};

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [subjectList, setSubjectList] = useState<string[]>(DEFAULT_SUBJECTS);

  // --- Effects ---
  useEffect(() => {
    if (token) loadData();
  }, [token]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gradesData, userData] = await Promise.all([
        api('/grades', 'GET', null, token),
        api('/auth/me', 'GET', null, token)
      ]);
      setGrades(gradesData);
      // We don't need to store full user obj in state if unused, just prefs
      if(userData.preferences?.subjects) setSubjectList(userData.preferences.subjects);
    } catch (e: any) {
      if (e.message === 'Unauthorized') handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setGrades([]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this grade?")) return;
    try {
      await api(`/grades/${id}`, 'DELETE', null, token);
      setGrades(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      alert("Failed to delete");
    }
  };

  const handleSaveGrade = async (gradeData: any) => {
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
      alert("Failed to save grade");
    }
  };

  const openModal = (grade?: Grade) => {
    setEditingGrade(grade || null);
    setIsModalOpen(true);
  };

  // --- Analytics Helper ---
  const stats = useMemo(() => {
    if (grades.length === 0) return { overall: 0, subjects: [] };
    const subjectsMap = new Map<string, Grade[]>();
    grades.forEach(g => {
      const list = subjectsMap.get(g.subject) || [];
      subjectsMap.set(g.subject, [...list, g]);
    });

    const subjectStats: any[] = [];
    let totalPoints = 0;
    let count = 0;

    subjectsMap.forEach((gList, subject) => {
      // Simplified weighted calc
      const avg = gList.reduce((a, b) => a + b.score, 0) / gList.length;
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
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => openModal()} className="bg-slate-900 dark:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> New
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500">
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
            <Dashboard 
                stats={stats} 
                gradeCount={grades.length}
                bigCount={grades.filter(g => g.type === 'big').length}
                smallCount={grades.filter(g => g.type === 'small').length}
                darkMode={darkMode}
            />

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Name</th>
                      <th className="p-4 text-center">Score</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {grades.map(g => (
                      <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-4 text-slate-500">{new Date(g.date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium dark:text-white">{g.subject}</td>
                        <td className="p-4 text-slate-500">{g.name}</td>
                        <td className="p-4 text-center"><span className={`inline-block w-8 h-8 rounded-lg leading-8 text-white font-bold ${getGradeColor(g.score)}`}>{g.score}</span></td>
                        <td className="p-4 text-right">
                          <button onClick={() => openModal(g)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded mr-2"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(g.id)} className="p-2 hover:bg-red-50 text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {grades.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No grades yet</td></tr>}
                  </tbody>
                </table>
            </div>
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