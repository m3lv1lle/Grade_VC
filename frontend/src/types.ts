export type Semester = '12/1' | '12/2' | '13/1' | '13/2';
export type GradeType = 'big' | 'small';

export interface Grade {
  id: number;
  subject: string;
  name: string;
  score: number;
  semester: Semester;
  type: GradeType;
  date: string;
  attachment?: string; 
  attachmentType?: 'image' | 'pdf';
  fileName?: string;
}

export interface User {
  id: number;
  username: string;
  preferences?: {
    subjects?: string[];
    semesters?: SemesterDateRange[];
  };
}

export interface SemesterDateRange {
  id: Semester;
  start: string;
  end: string;
}

export const DEFAULT_SUBJECTS = [
  'Mathematik', 'Deutsch', 'Englisch', 'Geschichte', 'Sozialkunde', 
  'Biologie', 'Chemie', 'Physik', 'Informatik', 'Religion', 
  'Ethik', 'Sport', 'Kunst', 'Musik', 'Wirtschaft'
];