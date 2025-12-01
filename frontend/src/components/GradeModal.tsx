import { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';
// FIX: import type verwenden
import type { Grade, GradeType, Semester } from '../types';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (grade: any) => Promise<void>;
  editingGrade: Grade | null;
  subjectList: string[];
}

export default function GradeModal({ isOpen, onClose, onSave, editingGrade, subjectList }: GradeModalProps) {
  const [form, setForm] = useState({
    subject: '', name: '', score: '', semester: '12/1' as Semester, type: 'small' as GradeType, date: new Date().toISOString().split('T')[0]
  });
  const [attachment, setAttachment] = useState<{data: string, type: 'image'|'pdf', name: string} | null>(null);

  useEffect(() => {
    if (editingGrade) {
      setForm({
        subject: editingGrade.subject,
        name: editingGrade.name,
        score: editingGrade.score.toString(),
        semester: editingGrade.semester,
        type: editingGrade.type,
        date: editingGrade.date
      });
      if (editingGrade.attachment) {
        setAttachment({ 
          data: editingGrade.attachment, 
          type: editingGrade.attachmentType || 'image', 
          name: editingGrade.fileName || 'File' 
        });
      }
    } else {
        setForm({
            subject: '', name: '', score: '', semester: '12/1', type: 'small', date: new Date().toISOString().split('T')[0]
        });
        setAttachment(null);
    }
  }, [editingGrade, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5000000) return alert("File too large (Max 5MB)");
    const reader = new FileReader();
    reader.onloadend = () => {
      const type = file.type.includes('image') ? 'image' : 'pdf';
      setAttachment({ data: reader.result as string, type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      ...form, 
      score: Number(form.score),
      attachment: attachment?.data,
      attachmentType: attachment?.type,
      fileName: attachment?.name 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg dark:text-white">{editingGrade ? 'Edit Grade' : 'New Grade'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <select 
                className="p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                value={form.semester} 
                onChange={e => setForm({...form, semester: e.target.value as Semester})}
              >
                {['12/1', '12/2', '13/1', '13/2'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-1">
                <button type="button" onClick={() => setForm({...form, type: 'big'})} className={`flex-1 rounded text-xs font-bold transition-all ${form.type === 'big' ? 'bg-white shadow dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>Big</button>
                <button type="button" onClick={() => setForm({...form, type: 'small'})} className={`flex-1 rounded text-xs font-bold transition-all ${form.type === 'small' ? 'bg-white shadow dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>Small</button>
              </div>
          </div>
          
          <input 
            required 
            placeholder="Subject (e.g. Math)" 
            className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
            value={form.subject} 
            onChange={e => setForm({...form, subject: e.target.value})} 
            list="subjects" 
          />
          <datalist id="subjects">{subjectList.map(s => <option key={s} value={s}/>)}</datalist>
          
          <input 
            required 
            placeholder="Assignment Name" 
            className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input 
                required 
                type="number" 
                min="0" 
                max="15" 
                className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                value={form.score} 
                onChange={e => setForm({...form, score: e.target.value})} 
            />
            <input 
                required 
                type="date" 
                className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                value={form.date} 
                onChange={e => setForm({...form, date: e.target.value})} 
            />
          </div>
          
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*,.pdf" />
              <div className="flex flex-col items-center text-slate-400">
                {attachment ? <FileText className="w-6 h-6 text-emerald-500" /> : <Upload className="w-6 h-6" />}
                <span className="text-xs mt-1">{attachment ? attachment.name : 'Attach Scan (Optional)'}</span>
              </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}