import React, { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import usePetTypes from '@/hooks/pets/usePetTypes';
import usePetBreeds from '@/hooks/pets/usePetBreeds';
import { Pets } from '@/types/booking.type';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

interface AddPetFormProps {
  onPetAdded: (petData: Pets) => void;
  onCancel: () => void;
  loading?: boolean;
  initialPet?: Pets;
  editingPetId?: string | null;
}

const AddPetForm: React.FC<AddPetFormProps> = ({
  onPetAdded,
  onCancel,
  loading,
  initialPet,
  editingPetId,
}) => {
  console.log('Editing pet ID:', initialPet);
  const [formData, setFormData] = useState({
    IsNew: true,
    PetID: '',
    remove_profile_image: false,
    pet_name: '',
    pet_gender: 'Male',
    pet_type_id: '1',
    breed_id: '',
    owner_name: 'Jon Doe',
    pet_dob: '',
    nature: '',
    health_conditions: '',
    skin_condition: '',
    comments: '',
    pet_pic: null as File | null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState<any[]>([]);
  const [breedSearchTerm, setBreedSearchTerm] = useState('');
  const [popularBreeds, setPopularBreeds] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const listRef = React.useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const activeItem = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);
  const natureOptions = [
    'Friendly',
    'Jumpy',
    'Aggressive',
    'Scared',
    'Submissive',
    'Other',
  ];

  const healthConditionOptions = [
    'Senior dog',
    'Hip injury',
    'Injured from previous grooming',
    'Other',
  ];

  useEffect(() => {
    // We only need initialPet to be available
    if (initialPet && editingPetId) {
      setFormData({
        IsNew: false,
        PetID: initialPet.id?.toString() || '',
        remove_profile_image: false,
        pet_name: initialPet.pet_name || '',
        pet_gender: initialPet.pet_gender || 'Male',
        pet_type_id: initialPet.pet_type_id || '1',
        breed_id: initialPet.breed_id || '1',
        owner_name: initialPet.owner_name || 'Jon Doe',
        nature: initialPet.nature || '',
        health_conditions: initialPet.health_conditions || '',
        skin_condition: initialPet.skin_condition || '',
        comments: initialPet.comments || '',

        // 👇 format DOB (YYYY-MM-DD only)
        pet_dob: initialPet.pet_dob
          ? new Date(initialPet.pet_dob).toISOString().split('T')[0]
          : '',
        pet_pic: null,
      });

      // --- THIS IS THE FIX ---
      // Use the breed_name directly from the initialPet object
      // (The console log confirms it exists!)
      setBreedSearchTerm(initialPet.breed_name || '');
      // --- END FIX ---

      
      setPreviewImage(
        initialPet.pet_pic_url
          ? getImageUrl(initialPet.pet_pic_url)
          : null // ✅ Set to null instead of the old URL
      );
    }
  }, [initialPet, editingPetId]);

  // React Query hooks
  const {
    data: petTypes = [],
    isLoading: petTypesLoading,
    error: petTypesError,
  } = usePetTypes();

  const {
    data: petBreeds = [],
    isLoading: petBreedsLoading,
    error: petBreedsError,
  } = usePetBreeds();
  // ❌ THIS BLOCK IS IN THE WRONG PLACE
  // ✅ Load initial pet if editing
  useEffect(() => {
    // Wait for breeds to load before trying to find the breed name
    if (initialPet && editingPetId && petBreeds.length > 0) {
      setFormData({
        IsNew: false,
        PetID: initialPet.id?.toString() || '',
        remove_profile_image: false,
        pet_name: initialPet.pet_name || '',
        pet_gender: initialPet.pet_gender || 'Male',
        pet_type_id: initialPet.pet_type_id || '1',
        breed_id: initialPet.breed_id || '1',
        owner_name: initialPet.owner_name || 'Jon Doe',
        nature: initialPet.nature || '',
        health_conditions: initialPet.health_conditions || '',
        skin_condition: initialPet.skin_condition || '',
        comments: initialPet.comments || '',
        pet_dob: initialPet.pet_dob
          ? new Date(initialPet.pet_dob).toISOString().split('T')[0]
          : '',
        pet_pic: null,
      });

      // --- THIS IS THE FIX ---
      // Find the breed name from the loaded list using the breed_id
      const initialBreed = petBreeds.find(
        (b) => b.id.toString() === initialPet.breed_id
      );
      if (initialBreed) {
        setBreedSearchTerm(initialBreed.name);
      }
      // --- END FIX ---

      setPreviewImage(
        initialPet.pet_pic_url
          ? getImageUrl(initialPet.pet_pic_url)
          : null // ✅ Set to null instead of the old URL
      );
    }
  }, [initialPet, editingPetId, petBreeds]); // ✅ Add petBreeds

  useEffect(() => {
    const fetchPopularBreeds = async () => {
      try {
        const response = await axiosInstance.get(
          '/breeds/popular'
        );
        const data = response.data || [];

        // Transform data to match petBreeds shape
        const formatted = data.map((item: any) => ({
          id: item.breed_id,
          name: item.breed_name,
        }));

        setPopularBreeds(formatted);
      } catch (err) {
        console.error('Error fetching popular breeds:', err);
      }
    };
    fetchPopularBreeds();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]:
          type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value,
      };

      // ✅ If pet_type_id changes, reset breed_id and search term
      if (name === 'pet_type_id') {
        newData.breed_id = '';
        setBreedSearchTerm('');

        // ==================================================================
        // ✅ START: MODIFIED LOGIC
        // ==================================================================
        // Find the new pet type object based on the selected ID (value)
        const newPetType = petTypes.find(
          (pt) => pt.id.toString() === value
        );
        const isNowDog = newPetType?.name.toLowerCase() === 'dog';

        // If the new type is NOT a dog AND the condition was 'Senior dog', reset it.
        if (!isNowDog && prev.health_conditions === 'Senior dog') {
          newData.health_conditions = '';
        }
        // ==================================================================
        // ✅ END: MODIFIED LOGIC
        // ==================================================================
      }

      return newData;
    });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // ✅ Ensure only images are allowed
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (jpg, png, etc.)');
        e.target.value = ''; // clear the input
        return;
      }

      // (Optional) Limit size, e.g., 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image size should not exceed 5MB');
        e.target.value = '';
        return;
      }

      setFormData((prev) => ({
        ...prev,
        pet_pic: file,
        remove_profile_image: false, // ✅ Mark for addition
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.pet_name.trim() ||
      !formData.pet_dob ||
      // !formData.owner_name.trim() ||
      !formData.nature.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // if (formData.pet_name.length > 30 || formData.owner_name.length > 30) {
    if (formData.pet_name.length > 30) {
      toast.error('Name cannot exceed 30 characters');
      return;
    }
    // Validate date is not in the future
    const selectedDate = new Date(formData.pet_dob);
    if (selectedDate >= new Date()) {
      toast.error('Please select a valid date of birth');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'pet_pic') {
          formDataToSend.append(key, value.toString());
        }
      });

      if (formData.pet_pic) {
        formDataToSend.append('pet_pic', formData.pet_pic);
      }

      const response = await axiosInstance.post('/pets/save', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(
        editingPetId ? 'Pet updated successfully!' : 'Pet added successfully!'
      );

      onPetAdded(response.data);
      onCancel();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save pet:', error);
      toast.error(
        error?.response?.data?.message ||
          'Failed to save pet. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      IsNew: true,
      PetID: '',
      remove_profile_image: false,
      pet_name: '',
      pet_gender: 'Male',
      pet_type_id: '1',
      breed_id: '',
      owner_name: 'Jon Doe',
      pet_dob: '',
      nature: '',
      health_conditions: '',
      skin_condition: '',
      comments: '',
      pet_pic: null,
    });
    setPreviewImage(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.breed-dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Loading state
  if (petTypesLoading || petBreedsLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (petTypesError || petBreedsError) {
    return (
      <div className="bg-red-50 rounded-xl p-6 mb-6">
        <div className="text-red-600">
          Error loading form data. Please try again.
        </div>
      </div>
    );
  }

  // ==================================================================
  // ✅ START: MODIFIED LOGIC
  // ==================================================================
  // Determine if the selected pet is a dog
  const selectedPetType = petTypes.find(
    (pt) => pt.id.toString() === formData.pet_type_id
  );
  const isDog = selectedPetType?.name.toLowerCase() === 'dog';
  // ==================================================================
  // ✅ END: MODIFIED LOGIC
  // ==================================================================

  return (
    <div className="bg-gray-50 rounded-xl p-3 sm:p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        {editingPetId ? 'Edit Pet' : 'Add New Pet'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="sm:col-span-2 mb-4">
          <div className="flex justify-center">
            {previewImage ? (
              <div className="relative inline-block">
                <img
                  src={previewImage}
                  alt="Pet preview"
                  className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData((prev) => ({
                      ...prev,
                      pet_pic: null,
                      remove_profile_image: true, // ✅ Mark for deletion
                    }));
                  }}
                  className="absolute top-1 right-1 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center h-32 w-32 rounded-full border-2 border-dashed border-gray-300 cursor-pointer hover:border-teal-500 transition">
                <span className="text-gray-500 text-sm">Upload</span>
                <input
                  type="file"
                  name="pet_pic"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Pet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pet_name"
              required
              value={formData.pet_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter Pet Name"
            />
          </div>

          {/* Owner Name */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="owner_name"
              required
              value={formData.owner_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter Owner Name"
            />
          </div> */}

          {/* Pet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet Type <span className="text-red-500">*</span>
            </label>
            <select
              name="pet_type_id"
              value={formData.pet_type_id}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {petTypes.map((type) => (
                <option key={type.id} value={type.id.toString()}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Breed */}
          {/* Breed (Autocomplete) */}
          <div className="relative breed-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breed <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="breed_search"
              value={breedSearchTerm}
              onChange={(e) => {
                const searchTerm = e.target.value;
                setBreedSearchTerm(searchTerm);
                setFormData((prev) => ({ ...prev, breed_id: '' }));

                const filteredPopularBreeds = popularBreeds.filter(
                  (b) =>
                    (!formData.pet_type_id ||
                      b.pet_type_id === parseInt(formData.pet_type_id)) &&
                    b.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

                const filteredPetBreeds = petBreeds.filter(
                  (b) =>
                    (!formData.pet_type_id ||
                      b.pet_type_id === parseInt(formData.pet_type_id)) &&
                    b.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !filteredPopularBreeds.some((pb) => pb.id === b.id)
                );

                const combined = [
                  ...filteredPopularBreeds,
                  ...filteredPetBreeds,
                ];
                const allBreeds =
                  combined.length === 0 && searchTerm.trim().length > 0
                    ? [
                        {
                          id: 9999,
                          pet_type_id: parseInt(formData.pet_type_id),
                          name: 'Other',
                        },
                      ]
                    : combined;

                setFilteredBreeds(allBreeds);
                setShowDropdown(true);
                setHighlightedIndex(-1); // reset highlight when typing
              }}
              onKeyDown={(e) => {
                if (!showDropdown || filteredBreeds.length === 0) return;

                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev < filteredBreeds.length - 1 ? prev + 1 : 0
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredBreeds.length - 1
                  );
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (highlightedIndex >= 0) {
                    const breed = filteredBreeds[highlightedIndex];
                    setFormData((prev) => ({
                      ...prev,
                      breed_id: breed.id.toString(),
                    }));
                    setBreedSearchTerm(breed.name);
                    setShowDropdown(false);
                  }
                } else if (e.key === 'Escape') {
                  setShowDropdown(false);
                }
              }}
              onFocus={() => {
                const filteredPopularBreeds = popularBreeds.filter(
                  (b) =>
                    !formData.pet_type_id ||
                    b.pet_type_id === parseInt(formData.pet_type_id)
                );

                const filteredPetBreeds = petBreeds.filter(
                  (b) =>
                    !formData.pet_type_id ||
                    b.pet_type_id === parseInt(formData.pet_type_id)
                );

                const uniquePetBreeds = filteredPetBreeds.filter(
                  (b) => !filteredPopularBreeds.some((pb) => pb.id === b.id)
                );

                const allBreeds = [
                  ...filteredPopularBreeds,
                  ...uniquePetBreeds,
                  {
                    id: 9999,
                    pet_type_id: parseInt(formData.pet_type_id),
                    name: 'Other',
                  },
                ];

                setFilteredBreeds(allBreeds);
                setShowDropdown(true);
                setHighlightedIndex(-1);
              }}
              placeholder="Type to search breed..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              autoComplete="off"
            />

            {/* Dropdown List */}
            {showDropdown && filteredBreeds.length > 0 && (
              <ul
                ref={listRef}
                className="absolute z-10 mt-1 max-h-48 w-full overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg"
              >
                {filteredBreeds
                  .sort((a, b) => {
                    const aPopular = popularBreeds.some((pb) => pb.id === a.id);
                    const bPopular = popularBreeds.some((pb) => pb.id === b.id);
                    return aPopular === bPopular ? 0 : aPopular ? -1 : 1;
                  })
                  .map((breed, index) => {
                    const isPopular = popularBreeds.some(
                      (pb) => pb.id === breed.id
                    );
                    const isHighlighted = index === highlightedIndex;

                    return (
                      <li
                        key={breed.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            breed_id: breed.id.toString(),
                          }));
                          setBreedSearchTerm(breed.name);
                          setShowDropdown(false);
                        }}
                        className={`px-3 py-2 cursor-pointer flex justify-between items-center transition 
              ${
                isHighlighted
                  ? 'bg-teal-100'
                  : isPopular
                  ? 'bg-green-50 hover:bg-green-100'
                  : 'hover:bg-teal-50'
              }
            `}
                      >
                        <span>{breed.name}</span>
                        {isPopular && (
                          <span className="text-xs font-semibold text-green-600">
                            🌿
                          </span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="pet_gender"
              value={formData.pet_gender}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="pet_dob"
                required
                value={formData.pet_dob}
                onChange={handleInputChange}
                min="2000-01-01" // ✅ **FIX 6: Added min date**
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent  "
              />
            </div>
          </div>
          {/* nature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nature during grooming <span className="text-red-500">*</span>
            </label>
            <select
              name="nature"
              value={formData.nature}
              onChange={handleInputChange}
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Nature</option>
              {natureOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* health_conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Condition
            </label>
            <select
              name="health_conditions"
              value={formData.health_conditions}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Condition (optional)</option>
              {/* ================================================================== */}
              {/* ✅ START: MODIFIED LOGIC */}
              {/* ================================================================== */}
              {healthConditionOptions
                .filter((opt) => {
                  if (opt === 'Senior dog') {
                    // Only show 'Senior dog' if isDog is true
                    return isDog;
                  }
                  // Show all other options
                  return true;
                })
                .map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              {/* ================================================================== */}
              {/* ✅ END: MODIFIED LOGIC */}
              {/* ================================================================== */}
            </select>
          </div>
          {/* Skin Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skin Condition
            </label>
            <input
              type="text"
              name="skin_condition"
              value={formData.skin_condition}
              onChange={handleInputChange}
              placeholder="Describe skin condition (optional)"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        {/* Comments */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            placeholder="Any additional information..."
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={
              submitting ||
              loading ||
              !formData.pet_name.trim() ||
              !formData.pet_dob ||
              !formData.breed_id ||
              !formData.nature
              // ||
              // !formData.owner_name.trim()
            }
            className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? editingPetId
                ? 'Saving...'
                : 'Adding...'
              : editingPetId
              ? 'Save Changes'
              : 'Save Pet'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onCancel();
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPetForm;