export type CreateHotelFormData = {
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  pricePerNight: number;
  starRating: number;
  facilities: string[];
  imageUrls: string | string[];
};

export interface Hotel extends Omit<CreateHotelFormData, 'imageUrls'> {
  _id: string;
  userId: string;
  imageUrls: string[];
  lastUpdated: Date;
}
