import React, { useState } from 'react';
import { User, PencilLine, Upload, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';

const CustomerProfile: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(state.auth.user?.profileImage || null);
  const [formValues, setFormValues] = useState({
    firstName: state.auth.user?.firstName || '',
    lastName: state.auth.user?.lastName || '',
    email: state.auth.user?.email || '',
    address: state.auth.user?.address || '',
    city: state.auth.user?.city || '',
    state: state.auth.user?.state || '',
    zipCode: state.auth.user?.zipCode || '',
    country: state.auth.user?.country || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5000000) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      toast.info('Saving profile changes...');

      // In a real app, you would:
      // 1. Upload the image if there's a new one
      // 2. Send the form data to the server
      // 3. Update the local state after success

      // Simulating success for now
      setTimeout(() => {
        // Update local state - using AUTH_SUCCESS as we don't have a specific UPDATE_USER action
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: {
              ...state.auth.user!,
              firstName: formValues.firstName,
              lastName: formValues.lastName,
              // Customer-specific fields
              address: formValues.address,
              city: formValues.city,
              state: formValues.state,
              zipCode: formValues.zipCode,
              country: formValues.country,
              ...(previewImage && { profileImage: previewImage })
            },
            token: state.auth.token || ''
          }
        });

        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Profile Settings</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PencilLine className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <button
            type="submit"
            form="profile-form"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="h-40 w-40 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Profile" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <User size={64} className="text-blue-600" />
              )}
            </div>
            
            {isEditing && (
              <label className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
                <input 
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </label>
            )}
          </div>
          
          {/* Profile Details */}
          <div className="flex-1">
            <form id="profile-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  disabled={true} // Email changes typically require verification
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Contact customer support to change your email address
                  </p>
                )}
              </div>
              
              <h3 className="font-medium text-lg mb-3 mt-6">Shipping Address</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formValues.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formValues.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formValues.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formValues.zipCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formValues.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
