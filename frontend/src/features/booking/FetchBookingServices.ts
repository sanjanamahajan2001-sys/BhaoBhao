// utils/bookingApi.ts

import axiosInstance from '@/utils/axiosInstance';

// API functions using axios
export const fetchCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

export const fetchSubCategoriesWithServices = async (categoryId: number) => {
  try {
    const response = await axiosInstance.get(
      `/subCategories/listWithServices/${categoryId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategories with services:', error);
    throw new Error('Failed to fetch subcategories with services');
  }
};
