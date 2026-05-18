import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { PropertySummary } from '../../types';
import { Button, Loader, Center, Paper, Image, Text, Group } from '@mantine/core';
import { IconBed, IconUsers, IconMapPin } from '@tabler/icons-react';

// Простая иконка маркера через URL
const DEFAULT_ICON = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Красная иконка для выделенного маркера
const HOVERED_ICON = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Компонент для обновления центра карты при изменении координат
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface PropertyMapProps {
  properties: PropertySummary[];
  cityCoordinates: [number, number] | null;
  hoveredPropertyId: number | null;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  cityCoordinates,
  hoveredPropertyId,
}) => {

  const handleOpenInNewTab = (propertyId: number) => {
    const url = `${window.location.origin}/property/${propertyId}`;
    window.open(url, '_blank');
  };

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
        {/* Компонент для обновления центра карты */}
        <ChangeMapView center={cityCoordinates} zoom={12} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;

          // Выбираем иконку: красная если выделен, иначе обычная
          const icon = hoveredPropertyId === property.propertyId ? HOVERED_ICON : DEFAULT_ICON;

          return (
            <Marker
              key={property.propertyId}
              position={[property.latitude, property.longitude]}
              icon={icon}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <Image
                    src={property.mainPhotoUrl || 'https://placehold.co/400x300?text=No+Image'}
                    height={120}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <Text fw={600} mt="sm">{property.title}</Text>
                  <Group gap="xs" mt="xs">
                    <IconMapPin size={14} />
                    <Text size="xs" c="dimmed">{property.city}</Text>
                  </Group>
                  <Group gap="md" mt="xs">
                    <Group gap="xs">
                      <IconUsers size={14} />
                      <Text size="xs">{property.guestsCount} гостей</Text>
                    </Group>
                    <Group gap="xs">
                      <IconBed size={14} />
                      <Text size="xs">{property.bedroomsCount} спальни</Text>
                    </Group>
                  </Group>
                  <Text fw={700} mt="sm">
                    {property.pricePerNight.toLocaleString()} ₽
                    <Text component="span" size="xs" c="dimmed"> / ночь</Text>
                  </Text>
                  <Button
                    size="xs"
                    fullWidth
                    mt="sm"
                    onClick={() => handleOpenInNewTab(property.propertyId)}
                  >
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