import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { artworkAPI } from '../../../services/api';
import AuthDebugger from '../../../components/debug/AuthDebugger';
import TokenDebugger from '../../../components/debug/TokenDebugger';
import runAuthDiagnostics from '../../../utils/authDebug';

const CreateArtwork: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    medium: '',
    width: '',
    height: '',
    depth: '',
    tags: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const categories = [
    'Painting', 'Drawing', 'Photography', 'Digital Art', 
    'Sculpture', 'Mixed Media', 'Prints', 'Abstract',
    'Portrait', 'Landscape', 'Still Life', 'Other'
  ];
  
  const media = [
    'Oil on Canvas', 'Acrylic on Canvas', 'Watercolor', 'Charcoal', 
    'Pencil', 'Digital', 'Photography', 'Bronze', 'Clay',
    'Marble', 'Wood', 'Mixed Media', 'Other'
  ];
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Validate files (only images, max 5MB each)
      const validFiles = newFiles.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          return false;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB size limit`);
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length > 0) {
        // Add to selected images
        setImages(prev => [...prev, ...validFiles]);
        
        // Generate previews
        validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = () => {
            setImagePreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    
    try {
      setLoading(true);
      
      // Parse tags
      const tagsList = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Create FormData for API
      const apiFormData = new FormData();
      apiFormData.append('title', formData.title);
      apiFormData.append('description', formData.description);
      apiFormData.append('price', formData.price);
      apiFormData.append('category', formData.category);
      apiFormData.append('medium', formData.medium);
      apiFormData.append('width', formData.width);
      apiFormData.append('height', formData.height);
      
      if (formData.depth) {
        apiFormData.append('depth', formData.depth);
      }
      
      // Add tags
      tagsList.forEach(tag => {
        apiFormData.append('tags', tag);
      });
      
      // Add images
      images.forEach(image => {
        apiFormData.append('images', image);
      });
      
      // Submit to API
      const response = await artworkAPI.create(apiFormData);
      
      toast.success('Artwork created successfully!');
      navigate('/dashboard/artist/artworks');
    } catch (error) {
      console.error('Error creating artwork:', error);
      toast.error('Failed to create artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Run auth diagnostics when component mounts
    runAuthDiagnostics();
  }, []);
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Upload New Artwork</h1>
      <AuthDebugger />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artwork Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        {/* Category & Medium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium *
            </label>
            <select
              name="medium"
              value={formData.medium}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a medium</option>
              {media.map((medium) => (
                <option key={medium} value={medium}>
                  {medium}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (cm) *
            </label>
            <input
              type="number"
              name="width"
              min="0"
              step="0.1"
              value={formData.width}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) *
            </label>
            <input
              type="number"
              name="height"
              min="0"
              step="0.1"
              value={formData.height}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depth (cm) <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="number"
              name="depth"
              min="0"
              step="0.1"
              value={formData.depth}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>
        
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags <span className="text-gray-400">(comma separated)</span>
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. abstract, colorful, landscape"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Artwork Images * <span className="text-gray-400">(max 5 images, 5MB each)</span>
          </label>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Image previews */}
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-32 h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
            
            {/* Upload button */}
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Upload Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          
          {images.length === 0 && (
            <p className="text-sm text-red-500">At least one image is required</p>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Artwork'
            )}
          </button>
        </div>
      </form>

      {/* Debug tools */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Debug Tools</h3>
        <AuthDebugger />
        <TokenDebugger />
      </div>
    </div>
  );
};

export default CreateArtwork;
