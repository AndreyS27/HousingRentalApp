import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { icon } from 'leaflet';
import { PropertySummary } from '../../types';
import { Button, Loader, Center } from '@mantine/core';

// Фикс для иконок Leaflet (без этого маркеры не показываются)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconurl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Компонент для центрирования карты при изменении города
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface PropertyMapProps {
  properties: PropertySummary[];
  selectedCity: string;
  cityCoordinates: [number, number] | null;
  onPropertySelect: (propertyId: number) => void;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedCity,
  cityCoordinates,
  onPropertySelect,
}) => {
  const defaultCenter: [number, number] = [55.751244, 37.618423]; // Москва по умолчанию
  const [zoom, setZoom] = useState(12);

  if (!cityCoordinates) {
    return (
      <Center style={{ height: '100%', minHeight: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <MapContainer
      center={cityCoordinates}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: 500, borderRadius: 8 }}
    >
      <ChangeMapView center={cityCoordinates} zoom={zoom} />
      
      {/* Слой карты OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Маркеры объектов */}
      {properties.map((property) => {
        // Показываем маркер только если есть координаты
        if (!property.latitude || !property.longitude) return null;
        
        const position: [number, number] = [property.latitude, property.longitude];
        
        return (
          <Marker
            key={property.propertyId}
            position={position}
            eventHandlers={{
              click: () => onPropertySelect(property.propertyId),
            }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <img 
                  src={property.mainPhotoUrl || 'https://placehold.co/400x300?text=No+Image'} 
                  alt={property.title}
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }}
                />
                <strong>{property.title}</strong>
                <p>{property.pricePerNight} ₽ / ночь</p>
                <Button size="compact" onClick={() => onPropertySelect(property.propertyId)}>
                  Подробнее
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};