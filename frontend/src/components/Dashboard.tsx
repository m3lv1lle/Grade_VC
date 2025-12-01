import { Award, FileText, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DashboardProps {
  stats: {
    overall: number;
    subjects: { subject: string; average: number }[];
  };
  gradeCount: number;
  bigCount: number;
  smallCount: number;
  darkMode: boolean;
}

export default function Dashboard({ stats, gradeCount, bigCount, smallCount, darkMode }: DashboardProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Average</p>
              <h3 className="text-4xl font-bold mt-2 dark:text-white">{stats.overall.toFixed(1)}</h3>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Total Entries</p>
              <h3 className="text-4xl font-bold mt-2 dark:text-white">{gradeCount}</h3>
              <div className="flex gap-3 mt-2 text-xs font-medium text-slate-400">
                <span>Big: {bigCount}</span>
                <span>Small: {smallCount}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <FileText className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Best Subject</p>
              <h3 className="text-2xl font-bold mt-2 truncate dark:text-white">{stats.subjects[0]?.subject || '-'}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-80 transition-colors">
        <h3 className="font-bold mb-4 dark:text-white">Subject Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.subjects}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
            <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
            <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 15]} />
            <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: darkMode ? '#fff' : '#000' }} 
            />
            <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                {stats.subjects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.average >= 10 ? '#10b981' : entry.average >= 5 ? '#f59e0b' : '#ef4444'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}