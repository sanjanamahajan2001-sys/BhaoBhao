import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';

export type PetBreed = { id: number; name: string; pet_type_id: number };
export type PetBreedsApiResponse = { data: PetBreed[] };

function usePetBreeds() {
  return useQuery({
    queryKey: ['petBreeds'],
    queryFn: async (): Promise<PetBreed[]> => {
      const res = await axiosInstance.get<PetBreedsApiResponse>(
        '/petBreeds/list'
      );
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default usePetBreeds;
