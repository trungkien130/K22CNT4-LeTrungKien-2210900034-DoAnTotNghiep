import axiosClient from "./axiosClient";

export const loginApi = (UserName: string, password: string) => {
  return axiosClient.post("/login", {
    UserName,
    password, 
  });
};
