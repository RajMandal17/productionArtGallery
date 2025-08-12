export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ARTIST' | 'ADMIN';
  profileImage?: string;
  createdAt: string;
  // Address fields
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Artist extends User {
  bio?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  artworkCount?: number;
  averageRating?: number;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  artistId: string;
  artist: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  medium: string;
  isAvailable: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  customerId: string;
  customer: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  artworkId: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  artwork: Artwork;
  quantity: number;
  addedAt: string;
}

export interface WishlistItem {
  id: string;
  artwork: Artwork;
  addedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  artwork: Artwork;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  cart: CartItem[];
  wishlist: WishlistItem[];
  artworks: Artwork[];
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  redirectUrl: string;
  success: boolean;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ARTIST';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}