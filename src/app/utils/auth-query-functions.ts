import axios from "../libs/axios-instance";

export const refreshAccessToken = async () => {
  try {
    const response = await axios.post("/auth/refresh");

    return response.data;
  } catch (error) {
    console.error("Error from `refreshAccessToken`:", error);

    throw error;
  }
};
