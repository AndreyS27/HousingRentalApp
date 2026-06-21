import React from 'react';
import {
  YMapComponentsProvider,
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapDefaultMarker,
} from 'ymap3-components';
import { PropertySummary } from '../../types';
import { Loader, Center, Paper, Image, Text, Group } from '@mantine/core';
import { IconBed, IconUsers, IconMapPin } from '@tabler/icons-react';

interface YandexMapV3Props {
  properties: PropertySummary[];
  cityCoordinates: [number, number] | null;
  hoveredPropertyId: number | null;
  searchParams?: {
    city: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
  };
}

// API-ключ Яндекс.Карт (лучше хранить в .env)
const YMAPS_API_KEY = process.env.REACT_APP_YMAPS_API_KEY || '44cd1b32-8f57-415a-bf28-f08afd641d9c';

export const YandexMapV3: React.FC<YandexMapV3Props> = ({
  properties,
  cityCoordinates,
  hoveredPropertyId,
  searchParams,
}) => {
  // Функция открытия страницы объекта
  const handleOpenInNewTab = (propertyId: number) => {
    const params = new URLSearchParams();
    if (searchParams?.checkInDate) params.set('checkIn', searchParams.checkInDate);
    if (searchParams?.checkOutDate) params.set('checkOut', searchParams.checkOutDate);
    if (searchParams?.guestCount) params.set('guests', searchParams.guestCount.toString());

    const url = `${window.location.origin}/property/${propertyId}${params.toString() ? `?${params.toString()}` : ''}`;
    window.open(url, '_blank');
  };

  // Функция для создания HTML-контента балуна
  const createPopupContent = (property: PropertySummary) => {
    return `
      <div style="min-width: 200px; padding: 8px;">
        <img 
          src="${property.mainPhotoUrl || 'https://placehold.co/400x300?text=No+Image'}" 
          style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;" 
        />
        <div style="font-weight: 600; margin-top: 8px;">${property.title}</div>
        <div style="display: flex; gap: 4px; margin-top: 4px; color: #666; font-size: 12px;">
          <span>📍 ${property.city}</span>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 4px; font-size: 12px; color: #666;">
          <span>👤 ${property.guestsCount} гостей</span>
          <span>🛏️ ${property.bedroomsCount} спальни</span>
        </div>
        <div style="font-weight: 700; margin-top: 8px;">
          ${property.pricePerNight.toLocaleString()} ₽ 
          <span style="font-weight: 400; font-size: 12px; color: #999;">/ ночь</span>
        </div>
        <button 
          style="
            width: 100%; 
            margin-top: 8px; 
            padding: 6px 0; 
            background: #339af0; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 12px;
          "
          onclick="window.open('/property/${property.propertyId}', '_blank')"
        >
          Подробнее
        </button>
      </div>
    `;
  };

  if (!cityCoordinates) {
    return (
      <Center style={{ height: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  // Определяем цвет маркера (красный — если выделен)
  const getMarkerColor = (propertyId: number) => {
    return hoveredPropertyId === propertyId ? '#ff0000' : '#339af0';
  };

  return (
    <Paper shadow="sm" p={0} radius="md" style={{ overflow: 'hidden', height: '100%' }}>
      <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
        <YMapComponentsProvider apiKey={YMAPS_API_KEY} lang="ru_RU">
          <YMap
            location={{
              center: [cityCoordinates[1], cityCoordinates[0]],
              zoom: 12,
            }}
            mode="vector"
          >
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />

            {properties.map((property) => {
              if (!property.latitude || !property.longitude) return null;

              return (
                <YMapDefaultMarker
                  key={property.propertyId}
                  coordinates={[property.longitude, property.latitude]}
                  color={getMarkerColor(property.propertyId)}
                  onClick={() => handleOpenInNewTab(property.propertyId)}
                  popup={{
                    content: createPopupContent(property),
                    position: 'top',
                  }}
                />
              );
            })}
          </YMap>
        </YMapComponentsProvider>
      </div>
    </Paper>
  );
};