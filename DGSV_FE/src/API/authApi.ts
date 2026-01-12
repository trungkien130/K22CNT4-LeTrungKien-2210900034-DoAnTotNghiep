import axiosClient from "./axiosClient";

export const loginApi = (UserName: string, Password: string) => {
  return axiosClient.post("/login", {
    UserName,
    Password, 
  });
};
