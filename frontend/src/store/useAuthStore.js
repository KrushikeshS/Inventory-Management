import {create} from "zustand";
import {axiosInstance} from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  signup: async (data) => {
    set({isSigningUp: true});
    try {
      const res = await axiosInstance.post("/api/signup", data);
      localStorage.setItem("token", res.data.token);
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      console.log("Error in signup: ", error);
      toast.error(error.response?.data?.message || "Signup failed");
      return false;
    } finally {
      set({isSigningUp: false});
    }
  },

  login: async (data) => {
    set({isLoggingIn: true});
    try {
      const res = await axiosInstance.post("/api/login", data);
      localStorage.setItem("token", res.data.token);
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      console.log("Error in login: ", error);
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({isLoggingIn: false});
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/";
    toast.success("Logged out successfully");
  },

  checkAuth: () => {
    return localStorage.getItem("token") !== null;
  },
}));
