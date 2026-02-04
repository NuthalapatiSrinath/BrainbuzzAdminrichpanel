import api from "./axiosInstance";

export const authService = {
  // Admin Login
  login: async (credentials) => {
    // Backend mount: app.use('/api/admin', adminAuthRoutes);
    // Route: router.post('/login', loginAdmin);
    // Full Path: /api/admin/login
    const response = await api.post("/admin/login", credentials);
    return response.data;
  },

  // Get Profile
  getCurrentUser: async () => {
    const response = await api.get("/admin/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
