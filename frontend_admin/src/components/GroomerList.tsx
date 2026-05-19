import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  UserCheck,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Mail,
  Phone,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { groomerAPI } from '../services/api';
import { GroomerData } from '../types';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/commonFunctions';
import DeleteConfirmationModal from './groomer/DeleteConfirmationModal';
import Pagination from './common/Pagination';
import LoadingSpinner from './common/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import Footer from './common/Footer';

interface GroomerListProps {
  onLogout: () => void;
}
const getLevelColor = (level: string) => {
  switch (level) {
    case 'Expert':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Advanced':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Intermediate':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Beginner':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
const GroomerList: React.FC<GroomerListProps> = ({ onLogout }) => {
  const [groomers, setGroomers] = useState<GroomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  // 👇 Debounce searchTerm by 2 seconds
  const debouncedSearch = useDebounce(searchTerm, 2000);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groomerToDelete, setGroomerToDelete] = useState<GroomerData | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, levelFilter]);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadGroomers();
  }, [currentPage, itemsPerPage, levelFilter, debouncedSearch]);
  const loadGroomers = async () => {
    try {
      setLoading(true);
      const response = await groomerAPI.getGroomers(
        currentPage,
        itemsPerPage,
        levelFilter === 'All' ? '' : levelFilter, // backend expects '' for "all"
        debouncedSearch
      );

      if (response.success && response.data) {
        setGroomers(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalRecords(response.data.pagination?.totalRecords || 0);
      } else {
        toast.error('Failed to load groomers');
      }
    } catch (error) {
      console.error('Error loading groomers:', error);
      toast.error('Failed to load groomers');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    onLogout();
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (groomer: GroomerData) => {
    setGroomerToDelete(groomer);
    setShowDeleteModal(true);
  };

  // Hide delete confirmation modal
  const hideDeleteConfirmation = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setShowDeleteModal(false);
    setGroomerToDelete(null);
  };

  // Confirm and execute deletion
  const confirmDelete = async () => {
    if (!groomerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await groomerAPI.deleteGroomer(
        groomerToDelete.id.toString()
      );

      if (response.success) {
        setGroomers((prev) =>
          prev.filter((groomer) => groomer.id !== groomerToDelete.id)
        );
        toast.success(response.message || 'Groomer deleted successfully');
        hideDeleteConfirmation();
      } else {
        toast.error(response.message || 'Failed to delete groomer');
      }
    } catch (error) {
      console.error('Error deleting groomer:', error);
      toast.error('Failed to delete groomer');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered and sorted groomers
  const filteredAndSortedGroomers = useMemo(() => {
    let filtered = groomers.filter((groomer) => {
      const matchesSearch = groomer.groomer_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesLevel =
        levelFilter === 'All' || groomer.level === levelFilter;

      return matchesSearch && matchesLevel;
    });

    return filtered;
  }, [groomers, searchTerm, levelFilter]);
  const currentGroomers = groomers;

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
  //       <LoadingSpinner message="Loading groomers..." />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Groomer Management
            </h1>
            <p className="text-gray-600">Manage your groomer team members</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => navigate('/create-groomer')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Groomer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Groomers',
              value: groomers.length,
              icon: UserCheck,
              color: 'blue',
            },
            {
              title: 'Expert Level',
              value: groomers.filter((g) => g.level === 'Expert').length,
              icon: Award,
              color: 'purple',
            },
            {
              title: 'Advanced',
              value: groomers.filter((g) => g.level === 'Advanced').length,
              icon: Award,
              color: 'blue',
            },
            {
              title: 'Intermediate',
              value: groomers.filter((g) => g.level === 'Intermediate').length,
              icon: Award,
              color: 'green',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${stat.color}-500 hover:shadow-lg transition-shadow duration-200`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${stat.color}-100 mr-4`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search groomers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-3 pl-10 outline-none border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition  `}
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Levels</option>
              <option value="Expert">Expert</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Beginner">Beginner</option>
            </select>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {filteredAndSortedGroomers.length} of {groomers.length} groomers
            </div>
          </div>
        </div>

        {/* Groomers Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs min-w-[200px] font-medium text-gray-500 uppercase tracking-wider">
                    Groomer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs min-w-[150px] font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!loading
                  ? currentGroomers.map((groomer) => (
                    <tr
                      key={groomer.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Groomer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4">
                            {groomer.profile_image ? (
                              <img
                                src={groomer.profile_image}
                                alt="Groomer"
                                className="h-full w-full object-cover rounded-full "
                              />
                            ) : (
                              <UserCheck className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {groomer.groomer_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {groomer.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-3 w-3 mr-2 text-gray-400" />
                            {groomer.email_id || 'N/A'}
                          </div>
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="h-3 w-3 mr-2 text-gray-400" />
                            {groomer?.mobile_number || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(
                            groomer.level
                          )}`}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {groomer.level}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm text-gray-900">
                          <div>Gender: {groomer.gender || 'N/A'}</div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {formatDate(groomer.dob) || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/edit-groomer/${groomer.id}`, {
                                state: { groomerData: groomer },
                              })
                            }
                            className="inline-flex items-center px-3 py-1 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => showDeleteConfirmation(groomer)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  : null}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalRecords}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
          {/* Empty State */}
          {currentGroomers.length === 0 && (
            <div className="text-center py-12">
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {groomers.length === 0
                  ? 'No groomers found'
                  : 'No groomers match your filters'}
              </h3>
              <p className="text-gray-500 mb-4">
                {groomers.length === 0
                  ? 'Get started by adding your first groomer.'
                  : 'Try adjusting your search criteria or filters.'}
              </p>
              {groomers.length === 0 ? (
                <button
                  onClick={() => navigate('/create-groomer')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Groomer
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setLevelFilter('All');
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        showModal={showDeleteModal}
        hideModal={hideDeleteConfirmation}
        confirmDelete={confirmDelete}
        groomer={groomerToDelete}
        isDeleting={isDeleting}
      />
      <Footer />
    </div>
  );
};

export default GroomerList;
