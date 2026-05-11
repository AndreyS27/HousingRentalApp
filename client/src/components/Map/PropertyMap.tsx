import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { PropertySummary } from '../../types';
import { Button, Loader, Center, Paper } from '@mantine/core';

// Простая иконка маркера через URL
const DEFAULT_ICON = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface PropertyMapProps {
  properties: PropertySummary[];
  cityCoordinates: [number, number] | null;
  onPropertySelect: (propertyId: number) => void;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  cityCoordinates,
  onPropertySelect,
}) => {
  if (!cityCoordinates) {
    return (
      <Center style={{ height: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Paper shadow="sm" p={0} radius="md" style={{ overflow: 'hidden', height: '100%' }}>
      <MapContainer
        center={cityCoordinates}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;
          
          return (
            <Marker
              key={property.propertyId}
              position={[property.latitude, property.longitude]}
              icon={DEFAULT_ICON}
              eventHandlers={{
                click: () => onPropertySelect(property.propertyId),
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong>{property.title}</strong>
                  <br />
                  {property.pricePerNight} ₽ / ночь
                  <br />
                  <Button size="xs" mt="xs" onClick={() => onPropertySelect(property.propertyId)}>
                    Подробнее
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Paper>
  );
};