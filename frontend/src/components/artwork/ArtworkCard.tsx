import React, { useCallback, memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, ZoomIn } from 'lucide-react';
import { Artwork } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { getFullImageUrl } from '../../services/api';
import { toast } from 'react-toastify';
import ArtworkPreviewModal from './preview/ArtworkPreviewModal';

interface ArtworkCardProps {
  artwork: Artwork;
  onAddToCart?: (artwork: Artwork) => void;
  onAddToWishlist?: (artwork: Artwork) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ 
  artwork, 
  onAddToCart, 
  onAddToWishlist 
}) => {
  const { state, dispatch } = useAppContext();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const isInWishlist = state.wishlist.some(item => item.artwork.id === artwork.id);
  const isInCart = state.cart.some(item => item.artwork.id === artwork.id);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!state.auth.isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    if (isInCart) {
      toast.info('Item already in cart');
      return;
    }

    const cartItem = {
      id: `cart_${artwork.id}_${Date.now()}`,
      artwork,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    toast.success('Added to cart!');
    
    if (onAddToCart) {
      onAddToCart(artwork);
    }
  }, [artwork, isInCart, state.auth.isAuthenticated, dispatch, onAddToCart]);

  const handleAddToWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!state.auth.isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    if (isInWishlist) {
      const itemToRemove = state.wishlist.find(item => item.artwork.id === artwork.id);
      if (itemToRemove) {
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemToRemove.id });
        toast.success('Removed from wishlist');
      }
    } else {
      const wishlistItem = {
        id: `wishlist_${artwork.id}_${Date.now()}`,
        artwork,
        addedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });
      toast.success('Added to wishlist!');
    }

    if (onAddToWishlist) {
      onAddToWishlist(artwork);
    }
  }, [artwork, isInWishlist, state.auth.isAuthenticated, dispatch, onAddToWishlist, state.wishlist]);

  // Handle potentially incomplete data
  const safeArtwork = {
    ...artwork,
    images: artwork.images || [],
    reviews: artwork.reviews || [],
    averageRating: artwork.averageRating || 0,
    totalReviews: artwork.totalReviews || 0,
    dimensions: artwork.dimensions || { width: 0, height: 0 }
  };
  
  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getFullImageUrl(safeArtwork.images[0]) || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg'}
          alt={safeArtwork.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPreviewOpen(true);
          }}
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <Link
              to={`/artworks/${safeArtwork.id}`}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Eye className="h-5 w-5" />
            </Link>
            <button
              onClick={handleAddToWishlist}
              className={`p-2 rounded-full transition-colors ${
                isInWishlist
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-sm font-semibold text-gray-800">
            ${artwork.price.toLocaleString()}
          </span>
        </div>

        {/* Availability Badge */}
        {!artwork.isAvailable && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Sold Out
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/artworks/${artwork.id}`}>
          <h3 className="font-semibold text-lg text-gray-800 hover:text-blue-600 transition-colors mb-1 line-clamp-1">
            {artwork.title}
          </h3>
        </Link>
        
        <Link to={`/artists/${artwork.artist.id}`}>
          <p className="text-sm text-gray-600 hover:text-blue-600 transition-colors mb-2">
            by {artwork.artist.firstName} {artwork.artist.lastName}
          </p>
        </Link>

        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {artwork.description}
        </p>

        {/* Rating */}
        {artwork.averageRating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= artwork.averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({artwork.totalReviews})
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {artwork.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {artwork.tags.length > 2 && (
            <span className="text-xs text-gray-500">
              +{artwork.tags.length - 2} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={!artwork.isAvailable || isInCart}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              !artwork.isAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">
              {!artwork.isAvailable
                ? 'Sold Out'
                : isInCart
                ? 'In Cart'
                : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Image Preview Modal */}
      <ArtworkPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={safeArtwork.images.map(img => getFullImageUrl(img) || '')}
        title={safeArtwork.title}
        artist={safeArtwork.artist ? `${safeArtwork.artist.firstName} ${safeArtwork.artist.lastName}` : 'Artist'}
      />
    </div>
  );
};

// Using memo to prevent unnecessary re-renders when props don't change
export default memo(ArtworkCard, (prevProps, nextProps) => {
  // Custom comparison to determine if the component should re-render
  // Only re-render if artwork id changes or the artwork details themselves change
  return prevProps.artwork.id === nextProps.artwork.id && 
         prevProps.artwork.updatedAt === nextProps.artwork.updatedAt;
});