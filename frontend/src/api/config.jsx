import axios from "axios";

const envBaseURL = import.meta.env.VITE_API_BASE_URL;

const baseURL = envBaseURL
  ? envBaseURL.replace(/\/+$/, "/")
  : import.meta.env.DEV
    ? "http://localhost:5000/"
    : undefined;

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is required in production builds.");
}

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

export const http = instance;
export default instance;
