import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';

export type Pet = {
  id: number;
  pet_name: string;
  pet_dob: string;
  breed_name: string | null;
  nature: string;
  health_conditions: string;
  skin_condition: string;
  comments: string;
  photo_url: string[];
  status: string;
  selected?: boolean;
  pet_details: any;
  pet_breed_obj: any;
  pet_type_obj: any;
};

export type PetsApiResponse = { data: Pet[] };

function usePets() {
  return useQuery({
    queryKey: ['pets'],
    queryFn: async (): Promise<Pet[]> => {
      const res = await axiosInstance.get<PetsApiResponse>('/pets/list');
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export default usePets;
