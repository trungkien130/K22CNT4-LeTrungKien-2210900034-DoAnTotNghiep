import axiosClient from "./axiosClient";

const api = {
  /* ========== AUTH ========== */
  login(data: { UserName: string; password: string }) {
    return axiosClient.post("/login", data);
  },

  logout() {
    localStorage.removeItem("user");
  },

  /* ========== USER INFO ========== */
  /**
   * Lấy thông tin cá nhân của người dùng hiện tại
   * @param role - "ADMIN" | "LECTURER" | "STUDENT"
   * @param userId - ID tương ứng (int cho admin, string cho lecturer/student)
   */
  getUserInfo(role: "ADMIN" | "LECTURER" | "STUDENT", userId: string) {
    return axiosClient.get(`/user/info/${role}/${userId}`);
  },

  /* ========== EVALUATION ========== */
  getEvaluations() {
    return axiosClient.get("/evaluations");
  },

  getEvaluationById(id: number) {
    return axiosClient.get(`/evaluations/${id}`);
  },

  createEvaluation(data: any) {
    return axiosClient.post("/evaluations", data);
  },

  updateEvaluation(id: number, data: any) {
    return axiosClient.put(`/evaluations/${id}`, data);
  },

  deleteEvaluation(id: number) {
    return axiosClient.delete(`/evaluations/${id}`);
  },

  /* ========== USER / ADMIN MANAGEMENT ========== */
  getUsers() {
    return axiosClient.get("/users");
  },

  deleteUser(id: number) {
    return axiosClient.delete(`/users/${id}`);
  },
/* ========== Question ========== */

getQuestions() {
  return axiosClient.get(`/questions`);
},

getQuestionsById(id: number) {
  return axiosClient.get(`/questions/${id}`);
},

createQuestion(data: any) {
  return axiosClient.post(`/questions`, data);
},

updateQuestion(id: number, data: any) {
  return axiosClient.put(`/questions/${id}`, data);
},

deleteQuestion(id: number) {
  return axiosClient.delete(`/questions/${id}`);
},

};

export default api;