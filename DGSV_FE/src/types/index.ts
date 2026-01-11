import type { ReactNode } from "react";

export type Role = "STUDENT" | "LECTURER" | "ADMIN";

export interface User {
  name: string;
  mssv: string | null;     
  userId: string | number; 
  role: Role;
}

export interface CriteriaItem {
  id: number
  content: string
  maxScore: number
}

export interface CriteriaCategory {
  id: number
  name: string
  items: CriteriaItem[]
}

export interface EvaluationDetail {
  id: number
  studentName: string
  studentMssv: string
  semester: string
  totalScore: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  items: {
    criteriaId: number
    content: string
    score: number
    evidence: string
  }[]
}
export interface Question {
  groupQuestionName: ReactNode;
  typeQuestionName: ReactNode;
  id: number;
  contentQuestion: string;
  level?: string;
  typeQuestionId: number;
  groupQuestionId: number;
  orderBy: number;
  createBy?: string;
  updateBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface UserLocal {
  id: number;
  fullName: string;
  role: string;
}
export interface Answer {
  id: number;
  contentAnswer: string;
  questionId: number;
  answerScore: number;
  updateBy: string;
  createDate: string;
  updateDate: string;
  status: boolean;
  checked: boolean;
}

export interface AnswerForm {
  contentAnswer: string;
  questionId: number;
  answerScore: number;
  updateBy: string;
  status: boolean;
  checked: boolean;
}
export interface UserAdmin {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  role: Role;
  isActive: boolean;
}
export interface UserForm {
  fullName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}