export interface PropertySummary {
  propertyId: number;
  title: string;
  city: string;
  mainPhotoUrl: string;
  pricePerNight: number;
  averageRating: number | null;
  guestsCount: number;
  bedroomsCount: number;
  bedsCount: number;
  latitude: number | null;
  longitude: number | null;
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