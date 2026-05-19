import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';

export type PetType = { id: number; name: string };
export type PetTypesApiResponse = { data: PetType[] };

function usePetTypes() {
  return useQuery({
    queryKey: ['petTypes'],
    queryFn: async (): Promise<PetType[]> => {
      const res = await axiosInstance.get<PetTypesApiResponse>(
        '/petTypes/list'
      );
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default usePetTypes;
