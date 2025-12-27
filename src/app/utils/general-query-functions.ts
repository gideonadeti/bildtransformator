import axios from "../libs/axios-instance";
import type { TransformImageFormValues } from "../types/general";

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

export const fetchTransformedImages = async () => {
  try {
    const response = await axios.get("/transformed-images");

    return response.data;
  } catch (error) {
    console.error("Error from `fetchTransformedImages`:", error);

    throw error;
  }
};

export const fetchTransformedImage = async (id: string) => {
  try {
    const response = await axios.get(`/transformed-images/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error from `fetchTransformedImage`:", error);

    throw error;
  }
};

export const transformImage = async (
  id: string,
  formValues: TransformImageFormValues
) => {
  try {
    const response = await axios.post(`/images/${id}/transform`, formValues);

    return response.data;
  } catch (error) {
    console.error("Error from `transformImage`:", error);

    throw error;
  }
};

export const transformTransformedImage = async (
  id: string,
  formValues: TransformImageFormValues
) => {
  try {
    const response = await axios.post(
      `/transformed-images/${id}/transform`,
      formValues
    );

    return response.data;
  } catch (error) {
    console.error("Error from `transformTransformedImage`:", error);

    throw error;
  }
};

export const deleteImage = async (id: string) => {
  try {
    const response = await axios.delete(`/images/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error from `deleteImage`:", error);

    throw error;
  }
};

export const deleteTransformedImage = async (id: string) => {
  try {
    const response = await axios.delete(`/transformed-images/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error from `deleteTransformedImage`:", error);

    throw error;
  }
};
