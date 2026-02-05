import type { ReactNode } from "react";

export type Role = "STUDENT" | "LECTURER" | "ADMIN" | "SUPER_ADMIN";

export interface Semester {
  id: number;
  name: string;
  schoolYear: string;
  dateOpenStudent?: string | null;
  dateEndStudent?: string | null;
  dateEndClass?: string | null;
  dateEndLecturer?: string | null;
  isActive: boolean;
}

export interface User {
  name: string;
  mssv: string | null;
  userId: string | number;
  role: Role;
  token?: string;
  permissions?: string[]; // ✅ Added permissions
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
  className?: string; // ✅ Thêm className
  classId?: number; // ✅ Thêm classId
  role: Role;
  isActive: boolean;

  // ✅ Extended Info
  birthday?: string;
  gender?: boolean;
  departmentName?: string;
  position?: string;
}
export interface UserForm {
  fullName: string;
  email?: string;
  phone?: string;
  classId?: number; // ✅ Thêm classId cho form update
  isActive: boolean;
  birthday?: string;
  gender?: boolean;
  // ✅ For Creation
  entityId?: string; // MSSV or MSGV
  userName?: string;
  password?: string;
}
export interface Account {
  id: number;
  userName: string;
  fullName?: string;
  isActive: boolean;

  // ✅ Extended Info
  email?: string;
  phone?: string;
  birthday?: string;
  gender?: boolean;
  className?: string;
  departmentName?: string;
  position?: string;
  role?: string; // Sometimes returned as string in DTO
}


export interface EditForm {
  userName: string;
  fullName: string;
  isActive: boolean;
}

export interface UserInfo {
  id: string;
  fullName: string;
  birthday?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | boolean | null;
  department?: string;
  position?: string;
  className?: string;
  course?: string;
  isActive: boolean;
  role?: Role;
}
export interface RegisterForm {
  userName: string;
  password: string;
  role: Role;
  fullName: string;
  email?: string;
  phone?: string;
  birthday?: string;
  gender?: boolean;
  position?: string;
  classId?: number; // ✅ Add classId
}

