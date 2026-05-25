// Сервис для преобразования названия города в координаты
import api from "./client";

interface GeocodeResponse {
  lat: string;
  lon: string;
  displayName: string;
}

export const geocodeCity = async (cityName: string): Promise<[number, number] | null> => {
  if (!cityName) return null;
  
  try {
    // Nominatim API OpenStreetMap
    const response = await api.get<GeocodeResponse>('/geocode/city', {
      params: {city: cityName}
    })
    
    const { lat, lon} = response.data;
    return [parseFloat(lat), parseFloat(lon)];

  } catch (error) {
    console.error('Ошибка геокодинга:', error);
    return null;
  }
};

export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address) return null;
  
  try {
    const response = await api.get('/geocode/address', {
      params: { address }
    });
    
    const { lat, lon } = response.data;
    return [parseFloat(lat), parseFloat(lon)];
  } catch (error) {
    console.error('Ошибка геокодинга адреса:', error);
    return null;
  }
};