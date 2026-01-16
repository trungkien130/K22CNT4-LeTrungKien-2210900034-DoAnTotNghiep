import axiosClient from "./axiosClient";
import type { Role } from "../types";
const roleToApi = (role: Role) => role.toLowerCase();
const api = {
  /* ================= AUTH ================= */
  login(data: { UserName: string; password: string }) {
    return axiosClient.post("/login", data);
  },

  logout() {
    localStorage.removeItem("user");
  },
  register(data: any) {
    return axiosClient.post("/auth/register", data);
  },

  /* ============ ACCOUNT ============ */
  getAccountsByRole(role: Role) {
    return axiosClient.get(`/Account/${role}`);
  },

  importExcel(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/auth/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateAccount(role: Role, id: number, data: any) {
    return axiosClient.put(`/account/${roleToApi(role)}/${id}`, data);
  },

  deleteAccount(role: Role, id: number) {
    return axiosClient.delete(`/account/${role}/${id}`);
  },

  changePassword(role: Role, id: string | number, newPassword: string) {
    return axiosClient.put(
      `/account/${role}/${id}/change-password`,
      { newPassword }
    );
  },

  /* ================= USER INFO ================= */
  getUserInfo(role: Role, userId: string | number) {
    return axiosClient.get(`/user/info/${role}/${userId}`);
  },

  /* ================= USER ADMIN CRUD ================= */
  getAllUsers() {
    return axiosClient.get("/user/all");
  },

  getClasses() {
    return axiosClient.get("/user/classes");
  },

  updateUser(role: Role, id: string | number, data: any) {
    return axiosClient.put(`/user/${role}/${id}`, data);
  },

  deleteUser(role: Role, id: string | number) {
    return axiosClient.delete(`/user/${role}/${id}`);
  },

  /* ================= QUESTION ================= */
  getQuestions() {
    return axiosClient.get("/questions");
  },

  createQuestion(data: any) {
    return axiosClient.post("/questions", data);
  },

  updateQuestion(id: number, data: any) {
    return axiosClient.put(`/questions/${id}`, data);
  },

  deleteQuestion(id: number) {
    return axiosClient.delete(`/questions/${id}`);
  },

  /* ================= ANSWER ================= */
  getAnswers() {
    return axiosClient.get("/AnswerList");
  },

  getAnswersByQuestion(questionId: number) {
    return axiosClient.get(`/AnswerList/question/${questionId}`);
  },

  createAnswer(data: any) {
    return axiosClient.post("/AnswerList", data);
  },

  updateAnswer(id: number, data: any) {
    return axiosClient.put(`/AnswerList/${id}`, data);
  },

  deleteAnswer(id: number) {
    return axiosClient.delete(`/AnswerList/${id}`);
  },
  /* ================= SEMESTERS ================= */
  getSemesters() {
    return axiosClient.get("/semesters");
  },
  createSemester(data: any) {
    return axiosClient.post("/semesters", data);
  },
  updateSemester(id: number, data: any) {
    return axiosClient.put(`/semesters/${id}`, data);
  },
  deleteSemester(id: number) {
    return axiosClient.delete(`/semesters/${id}`);
  },

  /* ================= DEPARTMENTS ================= */
  getDepartments() {
    return axiosClient.get("/departments");
  },
  createDepartment(data: any) {
    return axiosClient.post("/departments", data);
  },
  updateDepartment(id: number, data: any) {
    return axiosClient.put(`/departments/${id}`, data);
  },
  deleteDepartment(id: number) {
    return axiosClient.delete(`/departments/${id}`);
  },

  /* ================= CLASSES ================= */
  getClassesList() { // Renamed slightly to avoid conflict if any
    return axiosClient.get("/classes");
  },
  createClass(data: any) {
    return axiosClient.post("/classes", data);
  },
  updateClass(id: number, data: any) {
    return axiosClient.put(`/classes/${id}`, data);
  },
  deleteClass(id: number) {
    return axiosClient.delete(`/classes/${id}`);
  },

  /* ================= EVALUATION ================= */
  createEvaluation(data: any) {
    return axiosClient.post("/evaluations", data);
  },
  getEvaluation(studentId: string | number, semesterId: number) {
    return axiosClient.get(`/evaluations/student/${studentId}/semester/${semesterId}`);
  },
  getEvaluationHistory(studentId: string | number) {
    return axiosClient.get(`/evaluations/history/${studentId}`);
  },
};


export default api;
