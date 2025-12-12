import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import useAccessToken from "../hooks/use-access-token";
import { refreshAccessToken } from "../utils/auth-query-functions";
import { clearRefreshTokenCookie } from "../utils/cookie-utils";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});

// Token refresh queue to prevent race conditions
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const isTokenExpiredError = (error: AxiosError<{ message: string }>) =>
  error.response?.data.message === "Access token has expired";

axiosInstance.interceptors.request.use(async (config) => {
  const { accessToken } = useAccessToken.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message: string }>) => {
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 errors and ensure config exists
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      isTokenExpiredError(error)
    ) {
      if (isRefreshing) {
        // Queue this request until token refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }

            return axiosInstance.request(originalRequest);
          })
          .catch((error) => {
            throw error;
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await refreshAccessToken();

        useAccessToken.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);

        if (originalRequest.headers && accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return axiosInstance.request(originalRequest);
      } catch (error) {
        processQueue(error, null);

        // Clear the invalid refresh token cookie
        await clearRefreshTokenCookie();

        // Only redirect on auth failures (401 after refresh failed)
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (
            !currentPath.startsWith("/auth/sign-in") &&
            !currentPath.startsWith("/auth/sign-up")
          ) {
            window.location.href = "/auth/sign-in";
          }
        }

        throw error;
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors, reject normally without redirect
    throw error;
  }
);

export default axiosInstance;
