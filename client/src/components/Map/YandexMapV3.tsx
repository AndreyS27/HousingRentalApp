// import React, { useState, useEffect } from 'react';
// import {
//   YMapComponentsProvider,
//   YMap,
//   YMapDefaultSchemeLayer,
//   YMapDefaultFeaturesLayer,
//   YMapDefaultMarker,
// } from 'ymap3-components';
// import { PropertySummary } from '../../types';
// import { Loader, Center, Paper } from '@mantine/core';

// interface YandexMapV3Props {
//   properties: PropertySummary[];
//   cityCoordinates: [number, number] | null;
//   hoveredPropertyId: number | null;
//   searchParams?: {
//     city: string;
//     checkInDate?: string;
//     checkOutDate?: string;
//     guestCount?: number;
//   };
// }

// const YMAPS_API_KEY = process.env.REACT_APP_YMAPS_API_KEY;

// // Оборачиваем в React.memo, чтобы избежать лишних ререндеров при изменении состояний в родителе
// export const YandexMapV3 = React.memo<YandexMapV3Props>(({
//   properties,
//   cityCoordinates,
//   hoveredPropertyId,
//   searchParams,
// }) => {

//   const [mapLocation, setMapLocation] = useState<{ center: [number, number]; zoom: number } | null>(null);

//   useEffect(() => {
//     if (cityCoordinates) {
//       setMapLocation({
//         center: [cityCoordinates[1], cityCoordinates[0]],
//         zoom: 12,
//       });
//     }
//   }, [cityCoordinates]);

//   const createPopupContent = (property: PropertySummary) => {
//     // Формируем URL с параметрами поиска
//     const params = new URLSearchParams();
//     if (searchParams?.checkInDate) params.set('checkIn', searchParams.checkInDate);
//     if (searchParams?.checkOutDate) params.set('checkOut', searchParams.checkOutDate);
//     if (searchParams?.guestCount) params.set('guests', searchParams.guestCount.toString());

//     const queryString = params.toString();
//     const url = `${window.location.origin}/property/${property.propertyId}${queryString ? `?${queryString}` : ''}`;

//     return `
//       <div style="min-width: 200px; padding: 8px;">
//         <img 
//           src="${property.mainPhotoUrl || 'https://placehold.co/400x300?text=No+Image'}" 
//           style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;" 
//         />
//         <div style="font-weight: 600; margin-top: 8px;">${property.title}</div>
//         <div style="display: flex; gap: 4px; margin-top: 4px; color: #666; font-size: 12px;">
//           <span>📍 ${property.city}</span>
//         </div>
//         <div style="display: flex; gap: 12px; margin-top: 4px; font-size: 12px; color: #666;">
//           <span>👤 ${property.guestsCount} гостей</span>
//           <span>🛏️ ${property.bedroomsCount} спальни</span>
//         </div>
//         <div style="font-weight: 700; margin-top: 8px;">
//           ${property.pricePerNight.toLocaleString()} ₽ 
//           <span style="font-weight: 400; font-size: 12px; color: #999;">/ ночь</span>
//         </div>
//         <button 
//           style="
//             width: 100%; 
//             margin-top: 8px; 
//             padding: 6px 0; 
//             background: #339af0; 
//             color: white; 
//             border: none; 
//             border-radius: 4px; 
//             cursor: pointer;
//             font-size: 12px;
//           "
//           onclick="window.open('${url}', '_blank')"
//         >
//           Подробнее
//         </button>
//       </div>
//     `;
//   };

//   if (!cityCoordinates || !mapLocation) {
//     return (
//       <Center style={{ height: 400 }}>
//         <Loader size="lg" />
//       </Center>
//     );
//   }

//   const getMarkerColor = (propertyId: number) => {
//     return hoveredPropertyId === propertyId ? '#ff0000' : '#339af0';
//   };

//   return (
//     <Paper shadow="sm" p={0} radius="md" style={{ overflow: 'hidden', height: '100%' }}>
//       <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
//         <YMapComponentsProvider apiKey={YMAPS_API_KEY} lang="ru_RU">
//           <YMap
//             location={mapLocation}
//             mode="vector"
//           >
//             <YMapDefaultSchemeLayer />
//             <YMapDefaultFeaturesLayer />

//             {properties.map((property) => {
//               if (!property.latitude || !property.longitude) return null;

//               return (
//                 <YMapDefaultMarker
//                   key={property.propertyId}
//                   coordinates={[property.longitude, property.latitude]}
//                   color={getMarkerColor(property.propertyId)}
//                   popup={{
//                     content: createPopupContent(property),
//                     position: 'top',
//                   }}
//                 />
//               );
//             })}
//           </YMap>
//         </YMapComponentsProvider>
//       </div>
//     </Paper>
//   );
// });


import React, { useState, useEffect } from 'react';
import {
  YMapComponentsProvider,
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
} from 'ymap3-components';
import { PropertySummary } from '../../types';
import { Loader, Center, Paper } from '@mantine/core';
import './YandexMapV3.css';

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

const YMAPS_API_KEY = process.env.REACT_APP_YMAPS_API_KEY;

export const YandexMapV3 = React.memo<YandexMapV3Props>(({
  properties,
  cityCoordinates,
  hoveredPropertyId,
  searchParams,
}) => {
  const [mapLocation, setMapLocation] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [openPopupId, setOpenPopupId] = useState<number | null>(null);

  useEffect(() => {
    if (cityCoordinates) {
      setMapLocation({
        center: [cityCoordinates[1], cityCoordinates[0]],
        zoom: 12,
      });
    }
  }, [cityCoordinates]);

  useEffect(() => {
    setOpenPopupId(null);
  }, [properties]);

  const getMarkerColor = (propertyId: number) => {
    return hoveredPropertyId === propertyId ? '#ff0000' : '#339af0';
  };

  const handleOpenProperty = (propertyId: number) => {
    const property = properties.find(p => p.propertyId === propertyId);
    if (!property) return;

    const params = new URLSearchParams();
    if (searchParams?.checkInDate) params.set('checkIn', searchParams.checkInDate);
    if (searchParams?.checkOutDate) params.set('checkOut', searchParams.checkOutDate);
    if (searchParams?.guestCount) params.set('guests', searchParams.guestCount.toString());

    const queryString = params.toString();
    const url = `${window.location.origin}/property/${property.propertyId}${queryString ? `?${queryString}` : ''}`;
    window.open(url, '_blank');
  };

  const handleMarkerClick = (e: React.MouseEvent, propertyId: number) => {
    e.stopPropagation();
    setOpenPopupId(openPopupId === propertyId ? null : propertyId);
  };

  const handleMapClick = () => {
    setOpenPopupId(null);
  };

  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!cityCoordinates || !mapLocation) {
    return (
      <Center style={{ height: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Paper shadow="sm" p={0} radius="md" style={{ height: '100%', overflow: 'visible' }}>
      <div className="yandex-map-container" style={{ width: '100%', height: '100%', minHeight: 400, position: 'relative' }}>
        <YMapComponentsProvider apiKey={YMAPS_API_KEY} lang="ru_RU">
          <YMap
            location={mapLocation}
            mode="vector"
            onClick={handleMapClick}
          >
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />

            {properties.map((property) => {
              if (!property.latitude || !property.longitude) return null;

              return (
                <YMapMarker
                  key={property.propertyId}
                  coordinates={[property.longitude, property.latitude]}
                  zIndex={openPopupId === property.propertyId ? 1000 : 100}
                >
                  <div className="custom-marker-wrapper">
                    {/* Маркер-булавка без круга */}
                    <div
                      className="custom-marker"
                      onClick={(e) => handleMarkerClick(e, property.propertyId)}
                    >
                      <svg
                        width="32"
                        height="40"
                        viewBox="0 0 24 30"
                        fill={getMarkerColor(property.propertyId)}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                      >
                        <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 6.5 8.5 16 8.5 16s8.5-9.5 8.5-16C20.5 3.81 16.69 0 12 0zm0 11.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 4.5 12 4.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                      </svg>
                    </div>

                    {/* Попап */}
                    {openPopupId === property.propertyId && (
                      <div className="custom-popup" onClick={handlePopupClick}>
                        <button className="custom-popup-close" onClick={() => setOpenPopupId(null)}>
                          ✕
                        </button>
                        <img
                          src={property.mainPhotoUrl || 'https://placehold.co/400x300?text=No+Image'}
                          alt={property.title}
                        />
                        <div className="custom-popup-title">{property.title}</div>
                        <div className="custom-popup-info">
                          <span>📍 {property.city}</span>
                        </div>
                        <div className="custom-popup-details">
                          <span>👤 {property.guestsCount} гостей</span>
                          <span>🛏️ {property.bedroomsCount} спальни</span>
                        </div>
                        <div className="custom-popup-price">
                          {property.pricePerNight.toLocaleString()} ₽
                          <span className="price-unit">/ ночь</span>
                        </div>
                        <button
                          className="custom-popup-button"
                          onClick={() => handleOpenProperty(property.propertyId)}
                        >
                          Подробнее
                        </button>
                      </div>
                    )}
                  </div>
                </YMapMarker>
              );
            })}
          </YMap>
        </YMapComponentsProvider>
      </div>
    </Paper>
  );
});