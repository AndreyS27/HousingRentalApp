import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  Divider,
  Image,
  Loader,
  Center,
  Alert,
  Rating,
  Box,
} from '@mantine/core';
import { IconMapPin, IconUsers, IconBed, IconBath, IconCalendar, IconHeart, IconShare, IconArrowLeft } from '@tabler/icons-react';
import { propertiesApi } from '../../api/propertiesApi';
import { PropertyDetails } from '../../types';
import { PropertyMap } from '../../components/Map/PropertyMap';
import { Header } from '../../components/Layout/Header/Header';

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await propertiesApi.getById(parseInt(id));
        setProperty(response.data);
      } catch (err) {
        console.error('Ошибка загрузки объекта:', err);
        setError('Не удалось загрузить информацию об объекте');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <Center style={{ height: '80vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error || !property) {
    return (
      <Center style={{ height: '80vh' }}>
        <Alert color="red" title="Ошибка">
          {error || 'Объект не найден'}
        </Alert>
      </Center>
    );
  }

  const cityCoordinates: [number, number] | null =
    property.latitude && property.longitude
      ? [property.latitude, property.longitude]
      : null;

  return (
    <>
      {/* Шапка */}
      <Header />

      <Container size="xl" py="xl">
        {/* Галерея фотографий */}
        <Paper shadow="sm" radius="md" mb="xl">
          <Grid gutter={8}>
            <Grid.Col span={8}>
              <Image
                src={property.photos?.[0].photoUrl || 'https://placehold.co/800x500?text=No+Image'}
                height={400}
                radius="md"
                style={{ objectFit: 'cover' }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Stack gap={8}>
                <Image
                  src={property.photos?.[1].photoUrl || 'https://placehold.co/400x200?text=No+Image'}
                  height={195}
                  radius="md"
                  style={{ objectFit: 'cover' }}
                />
                <Image
                  src={property.photos?.[2].photoUrl || 'https://placehold.co/400x200?text=No+Image'}
                  height={195}
                  radius="md"
                  style={{ objectFit: 'cover' }}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Основная информация */}
        <Grid gutter="xl">
          <Grid.Col span={8}>
            <Stack gap="md">
              <Group justify="space-between" align="start">
                <Box>
                  <Title order={1}>{property.title}</Title>
                  <Group gap="xs" mt="xs">
                    <IconMapPin size={18} />
                    <Text c="dimmed">{property.address}, {property.city}</Text>
                  </Group>
                </Box>
                <Group>
                  <Button variant="outline" size="sm" leftSection={<IconHeart size={18} />}>
                    В избранное
                  </Button>
                  <Button variant="outline" size="sm" leftSection={<IconShare size={18} />}>
                    Поделиться
                  </Button>
                </Group>
              </Group>

              <Group gap="lg">
                <Group gap="xs">
                  <Rating value={property.averageRating || 0} readOnly fractions={2} />
                  <Text size="sm" fw={500}>
                    {property.averageRating?.toFixed(1) || 'Нет оценок'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    ({property.reviewsCount} отзывов)
                  </Text>
                </Group>
                <Badge size="lg" variant="light" color="green">
                  {property.isActive ? 'Активно' : 'Неактивно'}
                </Badge>
              </Group>

              <Divider />

              <Group gap="xl">
                <Group gap="xs">
                  <IconUsers size={20} />
                  <Text><strong>{property.guestsCount}</strong> гостя</Text>
                </Group>
                <Group gap="xs">
                  <IconBed size={20} />
                  <Text><strong>{property.bedroomsCount}</strong> спальни</Text>
                </Group>
                <Group gap="xs">
                  <IconBath size={20} />
                  <Text><strong>{property.bathroomsCount}</strong> ванные</Text>
                </Group>
                <Group gap="xs">
                  <IconCalendar size={20} />
                  <Text>Заселение после 14:00</Text>
                </Group>
              </Group>

              <Divider />

              <Box>
                <Title order={3} mb="sm">Описание</Title>
                <Text>{property.description || 'Описание отсутствует'}</Text>
              </Box>

              <Divider />

              <Box>
                <Title order={3} mb="sm">Удобства</Title>
                <Group>
                  {property.amenities?.map((amenity) => (
                    <Badge key={amenity} size="lg" variant="light" color="blue">
                      ✓ {amenity}
                    </Badge>
                  ))}
                </Group>
              </Box>

              <Divider />

              <Box>
                <Title order={3} mb="sm">Отзывы</Title>
                <Text c="dimmed">Отзывы появятся после первого бронирования</Text>
              </Box>
            </Stack>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper shadow="lg" p="xl" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="baseline">
                  <Title order={2}>{property.pricePerNight} ₽</Title>
                  <Text> / ночь</Text>
                </Group>

                <Divider />

                <Stack gap="xs">
                  <Text fw={500} size="sm">Даты поездки</Text>
                  <Group grow>
                    <Button variant="default" size="sm">Заезд</Button>
                    <Button variant="default" size="sm">Выезд</Button>
                  </Group>
                </Stack>

                <Stack gap="xs">
                  <Text fw={500} size="sm">Гости</Text>
                  <Button variant="default" size="sm" fullWidth>
                    {property.guestsCount} гостя
                  </Button>
                </Stack>

                <Divider />

                <Button size="lg" fullWidth color="blue">
                  Забронировать
                </Button>

                <Text size="xs" c="dimmed" ta="center">
                  Вы ничем не платите до подтверждения
                </Text>
              </Stack>
            </Paper>

            {cityCoordinates && (
              <Paper shadow="sm" radius="md" mt="md" style={{ height: 300, overflow: 'hidden' }}>
                <PropertyMap
                  properties={[property]}
                  hoveredPropertyId={null}
                  cityCoordinates={cityCoordinates}
                />
              </Paper>
            )}
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
};