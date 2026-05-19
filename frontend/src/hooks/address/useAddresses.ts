import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
export interface Address {
  id: number;
  flat_no: string;
  floor: string | null;
  apartment_name: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  location: string;
  latitude: number;
  longitude: number;
  label: string;
  status: string;
  isDefault: boolean;
  special_instructions: string | null;
}

export interface AddressesApiResponse {
  data: Address[];
}

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async (): Promise<Address[]> => {
      const res = await axiosInstance.get<AddressesApiResponse>(
        '/addresses/list'
      );
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
