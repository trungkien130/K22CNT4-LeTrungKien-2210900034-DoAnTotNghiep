import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://localhost:7076/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false
});

/* ===================== REQUEST ===================== */
axiosClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");

    if (user) {
      const token = JSON.parse(user).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===================== RESPONSE ===================== */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginApi = error.config?.url?.includes("/login");

    if (error.response?.status === 401 && !isLoginApi) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


export default axiosClient;
