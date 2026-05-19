export interface Transaction {
  id: number;
  bookingid: number;
  transactionid: string;
  amount: number;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed';
  notes?: string | null;
  createdat: string;
  updatedat: string;
  delete: boolean;
  deletedat: string | null;
  sync: boolean;
  lastsync: string | null;
}

export interface AddonService {
  pricing_id: number;
  service_name: string;
  price: number; // Assuming this is a number based on your other types
  pet_size: string;
  service_id: number;
}

export interface BookingData {
  booking: {
    id: number;
    orderid: string;
    customerid: number;
    petid: number;
    serviceid: number;
    servicepricingid: number;
    groomerid: number | null;
    addressid: number;
    petsize: string | null;
    appointmenttimeslot: string;
    startotp: string;
    endotp: string;
    amount: number;
    tax: number;
    total: number;
    status: string;
    notes: string;
    paymentmethod: string;
    createdat: string;
    updatedat: string;
  };
  pet: {
    id: number;
    customerid: number;
    petname: string;
    petgender: string;
    pettypeid: number;
    breedid: number;
    ownername: string;
    petdob: string;
    photourl: string;
    status: string;
  };
  service: {
    id: number;
    servicename: string;
    categoryid: number;
    subcategoryid: number;
    pettype: string;
    gender: string;
    breed: string;
    smalldescription: string;
    description: string;
    photos: string;
    rating: number;
    totalratings: number;
    durationminutes: number;
    status: string;
  };
  servicepricing: {
    id: number;
    serviceid: number;
    petsize: string;
    groomerlevel: string;
    mrp: number;
    discountedprice: number;
    status: string;
  };
  address: {
    id: number;
    customerid: number;
    flatno: string;
    floor: string | null;
    apartmentname: string;
    fulladdress: string;
    pincode: string;
    latitude: number | null;
    longitude: number | null;
    label: string;
    status: string;
    isDefault: boolean;
    specialinstructions: string | null;
  };
  transactions: Transaction[] | null;
}
export interface Pagination {
  currentPage: number;
  perPage: number;
  totalRecords: number;
  totalPages: number;
}
export interface BookingApiResponse {
  data: BookingData[];
  pagination: Pagination;
}

export interface BookingFilters {
  searchQuery: string;
  sortBy: 'date' | 'status';
  statusFilter: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  upcomingPast: 'upcoming' | 'past';
  search: string;
  statusFilter: string;
}
