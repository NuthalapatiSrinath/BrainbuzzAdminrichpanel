import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "https://brain-buzz-backend.onrender.com/api", // Make sure this matches your backend URL
});

// Helper function to handle logout
const handleSessionExpiry = () => {
  // 1. Remove the token
  localStorage.removeItem("token");
  // 2. Redirect to login page if not already there
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// =========================================================
// 1. REQUEST INTERCEPTOR (Logs what you SEND)
// =========================================================
api.interceptors.request.use(
  (config) => {
    // Add Auth Token if available
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // OPTIONAL: If you want to block requests strictly before they leave
    // if no token exists (excluding login/register endpoints):
    /*
    else if (!config.url.includes("/login") && !config.url.includes("/register")) {
       handleSessionExpiry();
       return Promise.reject(new Error("No token found, redirecting to login"));
    }
    */

    // --- CONSOLE LOGGING START ---
    console.groupCollapsed(
      `%c⬆️ SENDING [${config.method.toUpperCase()}] ${config.url}`,
      "color: #3b82f6; font-weight: bold;",
    );

    console.log(
      "%cFull URL:",
      "color: #94a3b8;",
      `${config.baseURL}${config.url}`,
    );

    if (config.params) {
      console.log(
        "%cQuery Params:",
        "color: #eab308; font-weight: bold;",
        config.params,
      );
    }

    if (config.data) {
      if (config.data instanceof FormData) {
        console.log("%cBody (FormData):", "color: #eab308; font-weight: bold;");
        for (let [key, value] of config.data.entries()) {
          console.log(`  ${key}:`, value);
        }
      } else {
        console.log(
          "%cBody (JSON):",
          "color: #eab308; font-weight: bold;",
          config.data,
        );
      }
    }

    console.groupEnd();
    // --- CONSOLE LOGGING END ---

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// =========================================================
// 2. RESPONSE INTERCEPTOR (Logs what you GET & Handles 401)
// =========================================================
api.interceptors.response.use(
  (response) => {
    // --- CONSOLE LOGGING START ---
    console.groupCollapsed(
      `%c⬇️ RECEIVED [${response.status}] ${response.config.url}`,
      "color: #10b981; font-weight: bold;",
    );

    console.log(
      "%cServer Response Data:",
      "color: #10b981; font-weight: bold;",
      response.data,
    );

    console.groupEnd();
    // --- CONSOLE LOGGING END ---

    return response;
  },
  (error) => {
    // --- CONSOLE LOGGING ERROR ---
    console.groupCollapsed(
      `%c🚨 FAILED [${error.response?.status || "Unknown"}] ${error.config?.url}`,
      "color: #ef4444; font-weight: bold;",
    );

    let errorMessage = "Something went wrong. Please try again.";

    if (error.response) {
      // ✅ CHECK FOR 401 UNAUTHORIZED HERE
      // If the token is missing or invalid, the server typically returns 401.
      if (error.response.status === 401) {
        console.warn("⚠️ Unauthorized! Redirecting to Login...");
        errorMessage = "Session expired. Please login again.";
        toast.error(errorMessage, { duration: 3000 });
        handleSessionExpiry();
      } else {
        // Extract error message from backend response
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          error.response.data?.errors?.[0]?.msg ||
          `Error ${error.response.status}: ${error.response.statusText}`;

        // Show toast for all other errors (except 401 which we handled above)
        toast.error(errorMessage, {
          duration: 4000,
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
            padding: "16px",
            borderRadius: "8px",
          },
        });
      }

      console.log(
        "%cError Message:",
        "color: #ef4444; font-weight: bold;",
        errorMessage,
      );
      console.log("Full Error Response:", error.response);
    } else if (error.request) {
      // Network error - no response received
      errorMessage = "Network error. Please check your internet connection.";
      toast.error(errorMessage, { duration: 4000 });
      console.log("%cNo Response Received:", "color: #f97316;", error.request);
    } else {
      // Something else happened
      errorMessage = error.message || "An unexpected error occurred.";
      toast.error(errorMessage, { duration: 4000 });
      console.log("Error Config:", error.message);
    }

    console.groupEnd();
    // --- CONSOLE LOGGING END ---

    return Promise.reject(error);
  },
);

export default api;
