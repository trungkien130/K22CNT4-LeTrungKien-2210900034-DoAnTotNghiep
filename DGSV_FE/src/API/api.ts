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

  /* ================= USER INFO ================= */
  getUserInfo(role: Role, userId: string | number) {
    return axiosClient.get(`/user/info/${role}/${userId}`);
  },

  /* ================= USER ADMIN CRUD ================= */
  getAllUsers() {
    return axiosClient.get("/user/all");
  },

  updateUser(role: Role, id: number, data: any) {
    return axiosClient.put(`/user/${role}/${id}`, data);
  },

  deleteUser(role: Role, id: number) {
    return axiosClient.delete(`/user/${role}/${id}`);
  },

  /* ================================================= */
  /* ============ 🔹 ADD ACCOUNT API 🔹 ============== */
  /* ================================================= */

  /** GET ALL account theo role (AccountController) */
  getAccountsByRole(role: Role) {
    return axiosClient.get(`/account/${role}`);
  },

  /** GET detail account */
  getAccountDetail(role: Role, id: number) {
    return axiosClient.get(`/account/${role}/${id}`);
  },

  /** UPDATE account (edit) */
updateAccount(role: Role, id: number, data: any) {
  return axiosClient.put(`/account/${roleToApi(role)}/${id}`, data);
},

  /** DELETE account */
  deleteAccount(role: Role, id: number) {
    return axiosClient.delete(`/account/${role}/${id}`);
  },
  
changePassword(role: Role, id: number, newPassword: string) {
  return axiosClient.put(
    `/account/${role}/${id}/change-password`,
    { newPassword }
  );
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
};

export default api;
