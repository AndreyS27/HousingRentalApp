import React from 'react';
import { Card, Image, Text, Badge, Group } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconBed, IconUsers, IconMapPin, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { PropertySummary } from '../../types';

interface PropertyCardProps {
  property: PropertySummary;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  searchParams?: {
    city: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
  };
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onMouseEnter,
  onMouseLeave,
  searchParams,
}) => {
  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();

    const urlParams = new URLSearchParams();
    if (searchParams?.checkInDate) {
      urlParams.set('checkIn', searchParams.checkInDate);
    }
    if (searchParams?.checkOutDate) {
      urlParams.set('checkOut', searchParams.checkOutDate);
    }
    if (searchParams?.guestCount) {
      urlParams.set('guests', searchParams.guestCount.toString());
    }

    const queryString = urlParams.toString();
    const url = `${window.location.origin}/property/${property.propertyId}${queryString ? `?${queryString}` : ''}`;

    window.open(url, '_blank');
  };

  const hasReviews = property.averageRating !== 0 && property.averageRating !== undefined;
  const ratingValue = hasReviews ? property.averageRating : 0;

  const photos = property.photos && property.photos.length > 0
    ? property.photos
    : ['https://placehold.co/400x300?text=No+Image'];

  const handleCarouselClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={handleOpenInNewTab}
      onMouseEnter={() => {
        onMouseEnter();
      }}
      onMouseLeave={() => {
        onMouseLeave();
      }}
      style={{ cursor: 'pointer' }}
    >
      <Card.Section>
        <div onClick={handleCarouselClick} style={{ position: 'relative' }}>
          <Carousel
            height={200}
            loop
            withIndicators={photos.length > 1}
            withControls={photos.length > 1}
            styles={{
              root: { borderRadius: '4px 4px 0 0' },
              indicator: { backgroundColor: '#fff', opacity: 0.7 },
              control: {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'background-color 0.2s ease',
              },
            }}
            nextControlIcon={<IconChevronRight size={24} />}
            previousControlIcon={<IconChevronLeft size={24} />}
          >
            {photos.map((photoUrl, index) => (
              <Carousel.Slide key={index}>
                <Image
                  src={photoUrl}
                  height={200}
                  fit="cover"
                  alt={`${property.title} - фото ${index + 1}`}
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        </div>
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} lineClamp={1}>{property.title}</Text>
        <Badge
          color={hasReviews ? 'pink' : 'gray'}
          variant={hasReviews ? 'filled' : 'light'}
        >
          ★ {ratingValue.toFixed(1)}
        </Badge>
      </Group>

      <Group gap="xs" mb="sm">
        <IconMapPin size={16} />
        <Text size="sm" c="dimmed">{property.city}</Text>
      </Group>

      <Group gap="md" mb="md">
        <Group gap="xs">
          <IconUsers size={16} />
          <Text size="sm">{property.guestsCount} гостей</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm">{property.bedroomsCount} спальни</Text>
        </Group>
        <Group gap="xs">
          <IconBed size={16} />
          <Text size="sm">{property.bedsCount} кроватей</Text>
        </Group>
      </Group>

      <Text fw={700} size="lg">
        {property.pricePerNight.toLocaleString()} ₽
        <Text component="span" size="sm" c="dimmed"> / ночь</Text>
      </Text>
    </Card>
  );
};