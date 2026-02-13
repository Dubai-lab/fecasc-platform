import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically and handle FormData
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("fecasc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Don't set Content-Type for FormData, let browser handle it
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  
  return config;
});

export default http;
