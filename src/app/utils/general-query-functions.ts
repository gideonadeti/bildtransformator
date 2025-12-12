import axios from "../libs/axios-instance";

export const uploadImage = async (image: File) => {
  try {
    const formData = new FormData();
    formData.append("image", image);

    const response = await axios.post("/images", formData);

    return response.data;
  } catch (error) {
    console.error("Error from `uploadImage`:", error);

    throw error;
  }
};

export const fetchImages = async () => {
  try {
    const response = await axios.get("/images");

    return response.data;
  } catch (error) {
    console.error("Error from `fetchImages`:", error);

    throw error;
  }
};
