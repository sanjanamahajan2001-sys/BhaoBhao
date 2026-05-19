import { Trash2 } from 'lucide-react';
import { GroomerData } from '../../types';
interface DeleteModalProps {
  showModal: boolean;
  hideModal: () => void;
  confirmDelete: () => void;
  groomer: GroomerData | null;
  isDeleting: boolean;
}
const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  showModal,
  hideModal,
  confirmDelete,
  groomer,
  isDeleting,
}) => {
  if (!showModal || !groomer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Groomer
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{groomer.groomer_name}</span>? This
            will permanently remove their profile and cannot be undone.
          </p>
        </div>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={hideModal}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Groomer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
