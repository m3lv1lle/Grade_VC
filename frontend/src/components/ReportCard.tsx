import { FileSpreadsheet } from 'lucide-react';
import { Grade, Semester } from '../types';

interface ReportCardProps {
  grades: Grade[];
}

const SEMESTERS: Semester[] = ['12/1', '12/2', '13/1', '13/2'];

const getGradeColor = (score: number) => {
  if (score >= 13) return 'bg-emerald-500 dark:bg-emerald-600';
  if (score >= 10) return 'bg-green-500 dark:bg-green-600';
  if (score >= 7) return 'bg-yellow-400 dark:bg-yellow-600';
  if (score >= 4) return 'bg-orange-400 dark:bg-orange-600';
  if (score >= 1) return 'bg-red-500 dark:bg-red-600';
  return 'bg-red-800 dark:bg-red-900';
};

export default function ReportCard({ grades }: ReportCardProps) {
  // Calculate stats
  const subjectsMap = new Map<string, any>();
  
  grades.forEach(g => {
    if (!subjectsMap.has(g.subject)) {
        subjectsMap.set(g.subject, { 
            subject: g.subject, 
            semesters: { '12/1': [], '12/2': [], '13/1': [], '13/2': [] } 
        });
    }
    const entry = subjectsMap.get(g.subject);
    entry.semesters[g.semester].push(g);
  });

  const rows = Array.from(subjectsMap.values()).map(subj => {
    const semAverages: any = {};
    let totalScore = 0;
    let validSems = 0;

    SEMESTERS.forEach(sem => {
        const gList = subj.semesters[sem];
        if (gList.length === 0) {
            semAverages[sem] = null;
            return;
        }
        const bigs = gList.filter((g: Grade) => g.type === 'big').map((g: Grade) => g.score);
        const smalls = gList.filter((g: Grade) => g.type === 'small').map((g: Grade) => g.score);
        
        let avg = 0;
        const avgBig = bigs.length ? bigs.reduce((a: number, b: number) => a + b, 0) / bigs.length : null;
        const avgSmall = smalls.length ? smalls.reduce((a: number, b: number) => a + b, 0) / smalls.length : null;

        if (avgBig !== null && avgSmall !== null) avg = (avgBig + avgSmall) / 2;
        else if (avgBig !== null) avg = avgBig!;
        else if (avgSmall !== null) avg = avgSmall!;

        semAverages[sem] = Math.round(avg); // Report cards round to integer
        totalScore += avg; // For overall average we keep precision
        validSems++;
    });

    return {
        subject: subj.subject,
        semAverages,
        overall: validSems ? (totalScore / validSems).toFixed(1) : '-'
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Report Card Matrix</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Calculated averages (rounded)</p>
          </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 uppercase tracking-wider">Subject</th>
              {SEMESTERS.map(sem => <th key={sem} className="p-4 text-center uppercase tracking-wider">{sem}</th>)}
              <th className="p-4 text-center uppercase tracking-wider bg-slate-100/50 dark:bg-slate-800/80">Avg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">No grades yet</td></tr>}
             {rows.map(row => (
               <tr key={row.subject} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                 <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{row.subject}</td>
                 {SEMESTERS.map(sem => {
                   const val = row.semAverages[sem];
                   return (
                     <td key={sem} className="p-4 text-center">
                       {val !== null ? (
                         <span className={`inline-flex w-9 h-9 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm ${getGradeColor(val)}`}>
                           {val}
                         </span>
                       ) : (
                         <span className="text-slate-200 dark:text-slate-700 text-2xl font-light">-</span>
                       )}
                     </td>
                   );
                 })}
                 <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-800/30">
                   {row.overall}
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}