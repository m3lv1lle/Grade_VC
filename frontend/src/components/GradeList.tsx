import { Edit2, Trash2 } from 'lucide-react';
import type { Grade } from '../types';

interface GradeListProps {
  grades: Grade[];
  onEdit: (grade: Grade) => void;
  onDelete: (id: number) => void;
}

const getGradeColor = (score: number) => {
  if (score >= 13) return 'bg-emerald-500 dark:bg-emerald-600';
  if (score >= 10) return 'bg-green-500 dark:bg-green-600';
  if (score >= 7) return 'bg-yellow-400 dark:bg-yellow-600';
  if (score >= 4) return 'bg-orange-400 dark:bg-orange-600';
  if (score >= 1) return 'bg-red-500 dark:bg-red-600';
  return 'bg-red-800 dark:bg-red-900';
};

export default function GradeList({ grades, onEdit, onDelete }: GradeListProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
                <th className="p-4">Datum</th>
                <th className="p-4">Sem</th>
                <th className="p-4">Fach</th>
                <th className="p-4">Titel</th>
                <th className="p-4 text-center">Punkte</th>
                <th className="p-4 text-right">Aktionen</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {grades.map(g => (
                <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(g.date).toLocaleDateString()}</td>
                <td className="p-4 text-xs font-bold uppercase text-slate-400">{g.semester}</td>
                <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{g.subject}</td>
                <td className="p-4 text-slate-500 dark:text-slate-400">
                    {g.name} 
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border ${g.type === 'big' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'}`}>
                        {g.type === 'big' ? 'KLAUSUR' : 'TEST'}
                    </span>
                </td>
                <td className="p-4 text-center"><span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm ${getGradeColor(g.score)}`}>{g.score}</span></td>
                <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => onEdit(g)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-500 dark:text-indigo-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(g.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 dark:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </td>
                </tr>
            ))}
            {grades.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Keine Noten vorhanden</td></tr>}
            </tbody>
        </table>
    </div>
  );
}