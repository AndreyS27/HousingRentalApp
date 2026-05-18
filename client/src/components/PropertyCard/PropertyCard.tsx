import React from 'react';
import { Card, Image, Text, Badge, Group } from '@mantine/core';
import { IconBed, IconUsers, IconMapPin } from '@tabler/icons-react';
import { PropertySummary } from '../../types';

interface PropertyCardProps {
  property: PropertySummary;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onMouseEnter,
  onMouseLeave
}) => {

  const propertyUrl = `${window.location.origin}/property/${property.propertyId}`;

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(propertyUrl, '_blank');
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={handleOpenInNewTab}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      <Card.Section>
        <Image
          src={property.mainPhotoUrl || 'https://placehold.co/400x300?text=No+Image'}
          height={200}
          alt={property.title}
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} lineClamp={1}>{property.title}</Text>
        {property.averageRating && (
          <Badge color="pink">
            ★ {property.averageRating.toFixed(1)}
          </Badge>
        )}
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
          <IconBed size={16} />
          <Text size="sm">{property.bedroomsCount} спальни</Text>
        </Group>
      </Group>

      <Text fw={700} size="lg">
        {property.pricePerNight.toLocaleString()} ₽
        <Text component="span" size="sm" c="dimmed"> / ночь</Text>
      </Text>
    </Card>
  );
};