// types/exam-types.ts



export interface IQuestionPopulated {
  _id: string;
  text: string;
  options: string[];
  correctOption: number;
  department: 'Science' | 'Art' | 'Commercial' | 'General';
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdBy: string;
  createdAt: Date;
}

export interface IExamPopulated {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  department: 'Science' | 'Art' | 'Commercial';
  questions: IQuestionPopulated[];
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}






