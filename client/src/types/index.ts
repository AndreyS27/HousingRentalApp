export interface PropertyPhoto {
  photoId: number;
  photoUrl: string;
  isMain: boolean;
  uploadedAt: string;
}

export interface Review {
  reviewId: number;
  bookingId: number;
  propertyId: number;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerAvatarUrl?: string | null;
  createdAt: string;
}

export interface PropertySummary {
  propertyId: number;
  title: string;
  city: string;
  address: string;
  mainPhotoUrl: string;
  pricePerNight: number;
  averageRating: number | null;
  guestsCount: number;
  bedroomsCount: number;
  bedsCount: number;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  viewCount: number;
  blockedDates?: string[];
}

export interface SearchParams {
  city: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestsCount?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyTypeId?: number;
  bedroomsCount?: number;
  bedsCount?: number;
  amenities?: string[];
  page: number;
  pageSize: number;
}

export interface SearchResponse {
  properties: PropertySummary[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface PropertyDetails extends PropertySummary {
  description: string;
  address: string;
  bathroomsCount: number;
  isActive: boolean;
  ownerName: string;
  propertyType: string;
  propertyTypeId: number;
  amenities: string[];
  amenityIds: number[];
  photos: PropertyPhoto[];
  reviews: Review[];
  reviewsCount: number;
  createdAt: string;
  dateOverrides?: DateOverride[];
}

export interface PropertyType {
  propertyTypeId: number;
  typeName: string;
}

export interface DateOverride {
  date: string;
  isAvailable: boolean;
  priceOverride: number | null;
}