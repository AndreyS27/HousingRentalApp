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
  amenities: string[];
  photos: string[];
  reviewsCount: number;
  createdAt: string;
}