import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_APP_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true // ✅ Enable Cookies
});

/* ===================== REQUEST ===================== */
axiosClient.interceptors.request.use(
  (config) => {
    // ❌ No longer manually attaching token from localStorage
    // Browser automatically sends HttpOnly cookies now.
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
