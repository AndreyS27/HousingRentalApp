// Сервис для преобразования названия города в координаты
export const geocodeCity = async (cityName: string): Promise<[number, number] | null> => {
  if (!cityName) return null;
  
  try {
    // Nominatim API OpenStreetMap
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      return [lat, lon];
    }
    return null;
  } catch (error) {
    console.error('Ошибка геокодинга:', error);
    return null;
  }
};