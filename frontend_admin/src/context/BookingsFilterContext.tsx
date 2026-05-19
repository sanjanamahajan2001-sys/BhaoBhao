import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

export interface FilterState {
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  sortBy: 'date' | 'status' | 'customer';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
}

interface FilterActions {
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  setDateFilter: (filter: string) => void;
  setSortBy: (sort: 'date' | 'status' | 'customer') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  resetFilters: () => void;
}

interface BookingsFilterContextValue extends FilterState, FilterActions {}

const BookingsFilterContext = createContext<BookingsFilterContextValue | null>(
  null
);

const initialState: FilterState = {
  searchTerm: '',
  statusFilter: 'All',
  dateFilter: 'All',
  sortBy: 'date',
  sortOrder: 'asc',
  currentPage: 1,
  itemsPerPage: 10,
};

interface BookingsFilterProviderProps {
  children: ReactNode;
}

export const BookingsFilterProvider: React.FC<BookingsFilterProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<FilterState>(initialState);

  const setSearchTerm = useCallback((searchTerm: string) => {
    setState((prev) => ({ ...prev, searchTerm, currentPage: 1 }));
  }, []);

  const setStatusFilter = useCallback((statusFilter: string) => {
    setState((prev) => ({ ...prev, statusFilter, currentPage: 1 }));
  }, []);

  const setDateFilter = useCallback((dateFilter: string) => {
    setState((prev) => ({ ...prev, dateFilter, currentPage: 1 }));
  }, []);

  const setSortBy = useCallback((sortBy: 'date' | 'status' | 'customer') => {
    setState((prev) => ({ ...prev, sortBy, currentPage: 1 }));
  }, []);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    setState((prev) => ({ ...prev, sortOrder, currentPage: 1 }));
  }, []);

  const setCurrentPage = useCallback((currentPage: number) => {
    setState((prev) => ({ ...prev, currentPage }));
  }, []);

  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    setState((prev) => ({ ...prev, itemsPerPage, currentPage: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(initialState);
  }, []);

  const value: BookingsFilterContextValue = {
    ...state,
    setSearchTerm,
    setStatusFilter,
    setDateFilter,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setItemsPerPage,
    resetFilters,
  };

  return (
    <BookingsFilterContext.Provider value={value}>
      {children}
    </BookingsFilterContext.Provider>
  );
};

export const useBookingsFilter = (): BookingsFilterContextValue => {
  const context = useContext(BookingsFilterContext);
  if (!context) {
    throw new Error(
      'useBookingsFilter must be used within BookingsFilterProvider'
    );
  }
  return context;
};
