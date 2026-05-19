import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';

const useGoogleMapsScript = (apiKey: string, libraries: string[]) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if ((window as any).google && (window as any).google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(
      ','
    )}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () =>
      setLoadError(new Error('Google Maps script failed to load'));

    document.head.appendChild(script);

    return () => {
      // Clean up script tag if component unmounts
      document.head.removeChild(script);
    };
  }, [apiKey, libraries]);

  return { isLoaded, loadError };
};
// --- END GOOGLE MAPS SCRIPT LOADER ---

export type AddressPayload = {
  flat_no: string;
  apartment_name: string;
  full_address: string;
  pincode: string;
  label: string;
  isDefault: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  AddressID?: string | number;
  IsNew?: boolean;
  customLabel?: string;
};

interface AddAddressFormProps {
  editingAddressId?: string | null;
  initialData?: Partial<AddressPayload>;
  onAddAddress: (addressData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCYtYYyRozgp0KyZsdCYb4TDYuU9OkvesQ'; // Your key
const libraries: string[] = ['places']; // Google Maps libraries to load

const AddAddressForm: React.FC<AddAddressFormProps> = ({
  editingAddressId,
  initialData,
  onAddAddress,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState<AddressPayload>({
    flat_no: '',
    apartment_name: '',
    full_address: '',
    pincode: '',
    label: 'Home',
    isDefault: false,
    customLabel: '',
    location: '',
    latitude: 19.9975, // Default center (e.g., somewhere in India)
    longitude: 73.7898,
  });

  const [submitting, setSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 19.9975, lng: 73.7898 });
  const [pincodeStatus, setPincodeStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');
  // const [isDragging, setIsDragging] = useState(false); // No longer needed

  // Refs for Google Maps
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const autocompleteInstanceRef =
    useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useGoogleMapsScript(
    GOOGLE_MAPS_API_KEY,
    libraries
  );

  // --- Debounced Pincode Validation ---
  useEffect(() => {
    const pincode = formData.pincode;

    if (pincode.length < 6) {
      setPincodeStatus('idle');
      return;
    }

    // Set status to checking immediately for 6 digits
    setPincodeStatus('checking');

    const handler = setTimeout(() => {
      if (pincode.length === 6) {
        fetch(`https://api.postalpincode.in/pincode/${pincode}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data[0] && data[0].Status === 'Success') {
              setPincodeStatus('valid');
            } else {
              setPincodeStatus('invalid');
            }
          })
          .catch(() => {
            setPincodeStatus('invalid'); // API or network error
          });
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [formData.pincode]);
  // --- END Pincode Validation ---

  // --- NEW: Helper function to pan/zoom map ---
  const panMapTo = (position: { lat: number; lng: number }, zoomIn = false) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(position);
      if (zoomIn) {
        mapInstanceRef.current.setZoom(17);
      }
    }
  };

  // Helper to parse address components
  const parseAddressComponents = (
    components: google.maps.GeocoderAddressComponent[]
  ) => {
    let pincode = '';
    let streetArea = '';
    const streetParts: string[] = [];

    for (const component of components) {
      if (component.types.includes('postal_code')) {
        pincode = component.long_name;
      }
      // Build a street address from most specific to least specific
      if (component.types.includes('route')) {
        streetParts.unshift(component.long_name);
      } else if (
        component.types.includes('sublocality_level_1') ||
        component.types.includes('sublocality')
      ) {
        streetParts.push(component.long_name);
      } else if (component.types.includes('locality')) {
        streetParts.push(component.long_name);
      }
    }

    streetArea = streetParts.join(', ');

    return { pincode, streetArea };
  };

  // --- Initializers for Map and Autocomplete ---
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      // Create Map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 10,
      });

      // Add map click listener
      mapInstanceRef.current.addListener(
        'click',
        (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            // 1. Update state
            setFormData((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              location: 'Custom Pinned Location',
            }));

            // 2. Explicitly pan map
            panMapTo({ lat, lng });
          }
        }
      );
    }
  }, [isLoaded, mapCenter]);

  useEffect(() => {
    if (isLoaded && searchInputRef.current && !autocompleteInstanceRef.current) {
      // Create Autocomplete
      autocompleteInstanceRef.current =
        new window.google.maps.places.Autocomplete(
          searchInputRef.current,
          { componentRestrictions: { country: 'in' } } // Restrict to India
        );
      // Request all fields needed for auto-fill
      autocompleteInstanceRef.current.setFields([
        'place_id',
        'geometry',
        'formatted_address',
        'address_components',
      ]);

      autocompleteInstanceRef.current.addListener('place_changed', () => {
        const place = autocompleteInstanceRef.current?.getPlace();

        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const locationName = place.formatted_address || '';

          // --- AUTO-FILL LOGIC ---
          let pincode = '';
          let streetArea = '';

          if (place.address_components) {
            const parsed = parseAddressComponents(place.address_components);
            pincode = parsed.pincode;
            streetArea = parsed.streetArea;
          }
          // --- END AUTO-FILL LOGIC ---

          // 1. Update state
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location: locationName,
            // ✅ **FIX: Set pincode directly.**
            // This sets it to '' if not found, or the value if found.
            pincode: pincode,
            // ✅ **FIX: Set full_address directly.**
            full_address: streetArea,
          }));

          // Pincode from Google is trusted, set as valid
          if (pincode) {
            setPincodeStatus('valid');
          } else {
            // If Google didn't find one, reset status
            setPincodeStatus('idle');
          }

          // 2. Explicitly pan map
          panMapTo({ lat, lng }, true);
        } else {
          toast.error('Location not found. Please try again.');
        }
      });
    }
  }, [isLoaded]);

  // ✅ If editing, pre-fill form
  useEffect(() => {
    if (editingAddressId && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        AddressID: editingAddressId,
      }));

      // If address has lat/lng, set map center and pan
      if (initialData.latitude && initialData.longitude) {
        const position = {
          lat: initialData.latitude,
          lng: initialData.longitude,
        };
        setMapCenter(position); // Set initial center for map load
        panMapTo(position, true); // Pan to it
      }
    }
  }, [editingAddressId, initialData]);

  // --- NEW: Syncs marker to formData (NO PANNING) ---
  // This effect's ONLY job is to create/move the pin to match state.
  useEffect(() => {
    if (formData.latitude && formData.longitude && mapInstanceRef.current) {
      const position = { lat: formData.latitude, lng: formData.longitude };

      if (!markerInstanceRef.current) {
        // Create new marker
        markerInstanceRef.current = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          draggable: true,
        });

        // Add drag listeners
        markerInstanceRef.current.addListener(
          'drag',
          (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              // ONLY update state. This updates Lat/Lng display in real-time.
              setFormData((prev) => ({
                ...prev,
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng(),
              }));
            }
          }
        );

        markerInstanceRef.current.addListener(
          'dragend',
          (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              // Final state update
              setFormData((prev) => ({
                ...prev,
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng(),
                location: prev.location || 'Custom Pinned Location', // Set location on drop
              }));
            }
          }
        );
      } else {
        // Update existing marker position
        markerInstanceRef.current.setPosition(position);
      }
    }
  }, [formData.latitude, formData.longitude, isLoaded]); // Runs when lat/lng changes

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.flat_no.trim() ||
      !formData.apartment_name.trim() ||
      !formData.full_address.trim() ||
      !formData.pincode.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    // ✅ Pincode validation
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    // --- NEW Pincode API Check ---
    if (pincodeStatus === 'invalid') {
      toast.error('The entered pincode does not seem to be valid or serviceable.');
      return;
    }
    if (pincodeStatus === 'checking') {
      toast.error('Please wait for pincode verification to complete.');
      return;
    }
    // --- END NEW Pincode API Check ---

    setSubmitting(true);

    try {
      const payload: AddressPayload = {
        ...formData,
        label:
          formData.label === 'Other' && formData.customLabel
            ? formData.customLabel
            : formData.label,
        IsNew: !editingAddressId,
        AddressID: editingAddressId || undefined,
      };

      const response = await axiosInstance.post('/addresses/save', payload);

      console.log(editingAddressId ? 'Address updated!' : 'Address added!');
      toast.success(editingAddressId ? 'Address updated!' : 'Address added!');
      onAddAddress(response.data);
      onCancel();

      // Reset only if adding new
      if (!editingAddressId) {
        setFormData({
          flat_no: '',
          apartment_name: '',
          full_address: '',
          pincode: '',
          label: 'Home',
          isDefault: false,
          location: '',
          latitude: 19.9975,
          longitude: 73.7898,
          customLabel: '', // Also reset customLabel
        });
      }
    } catch (error: any) {
      console.error('Failed to save address:', error);
      toast.error(
        error?.response?.data?.message ||
          'Failed to save address. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-xl">
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-3 sm:p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        {editingAddressId ? 'Edit Address' : 'Add New Address'}
      </h3>
      <form onSubmit={handleSubmit}>
        {/* --- Location Search --- */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            ref={searchInputRef}
            name="location"
            value={formData.location || ''}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, location: e.target.value }));
            }}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Search for your address or area"
          />
        </div>

        {/* --- Map Display --- */}
        <div className="mb-4">
          <div
            ref={mapRef}
            className="w-full h-64 bg-gray-200 rounded-xl border border-gray-300"
            style={{ minHeight: '250px' }}
          >
            {!isLoaded && (
              <div className="p-4 text-center">Loading map...</div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Search or click/drag the pin on the map to set your precise location.
          </p>

          {/* --- Coordinate Display --- */}
          <div className="flex justify-center space-x-4 mt-2 p-2 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-800">
              Lat: {formData.latitude?.toFixed(6) || 'N/A'}
            </span>
            <span className="text-sm font-medium text-gray-800">
              Lng: {formData.longitude?.toFixed(6) || 'N/A'}
            </span>
          </div>
          {/* --- END Coordinate Display --- */}
        </div>

        {/* --- Address Fields --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flat No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="flat_no"
              required
              value={formData.flat_no}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="A-101, 2nd Floor, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building/Apartment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="apartment_name"
              required
              value={formData.apartment_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Sunrise Apartments, etc."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street name, area, landmarks{' '}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="full_address"
              required
              value={formData.full_address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Complete address with landmarks (auto-filled on search)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pin Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,6}$/.test(value)) {
                    setFormData((prev) => ({ ...prev, pincode: value }));
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="123456 (auto-filled on search)"
                inputMode="numeric"
                maxLength={6}
              />
              {/* --- Pincode Status Indicator --- */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {pincodeStatus === 'checking' && (
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {pincodeStatus === 'valid' && (
                  <svg
                    className="h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {pincodeStatus === 'invalid' &&
                  formData.pincode.length === 6 && (
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
              </div>
              {/* --- END Status Indicator --- */}
            </div>
            {pincodeStatus === 'invalid' && formData.pincode.length === 6 && (
              <p className="text-xs text-red-600 mt-1">
                This pincode appears to be invalid.
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:col-span-2">
            <input
              type="checkbox"
              name="isDefault"
              id="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isDefault"
              className="text-sm font-medium text-gray-700"
            >
              Set as Default Address
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={
              submitting ||
              loading ||
              !formData.flat_no.trim() ||
              !formData.apartment_name.trim() ||
              !formData.full_address.trim() ||
              !formData.pincode.trim()
            }
            className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? editingAddressId
                ? 'Saving...'
                : 'Adding...'
              : editingAddressId
              ? 'Save Changes'
              : 'Add Address'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddressForm;
