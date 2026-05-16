import React from 'react';
import { Card, Image, Text, Badge, Group } from '@mantine/core';
import { IconBed, IconUsers, IconMapPin } from '@tabler/icons-react';
import { PropertySummary } from '../../types';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: PropertySummary;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      component={Link}
      to={`/property/${property.propertyId}`}
      onClick={onClick}
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