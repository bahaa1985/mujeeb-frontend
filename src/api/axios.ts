import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  withCredentials: true, // Enable cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized - clear auth and redirect to login
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
