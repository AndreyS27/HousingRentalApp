import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Avatar,
  Card,
  ActionIcon,
  Modal,
} from '@mantine/core';
import { IconMapPin, IconUsers, IconBed, IconBath, IconCalendar, IconHeart, IconShare, IconX } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { NumberInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Header } from '../../components/Layout/Header/Header';
import { PropertyMap } from '../../components/Map/PropertyMap';
import { propertiesApi } from '../../api/propertiesApi';
import { reviewsApi } from '../../api/reviewsApi';
import { PropertyDetails, Review } from '../../types';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import '@mantine/carousel/styles.css';
import { Carousel } from '@mantine/carousel';

dayjs.locale('ru');

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Читаем searchParams из state (при переходе с SearchPage)
  const state = location.state as { searchParams?: any };
  const searchParamsFromState = state?.searchParams;

  // Читаем параметры из URL (если открыта новая вкладка)
  const urlParams = new URLSearchParams(location.search);
  const checkInParam = urlParams.get('checkIn');
  const checkOutParam = urlParams.get('checkOut');
  const guestsParam = urlParams.get('guests');

  const initialCheckIn = checkInParam || searchParamsFromState?.checkInDate || null;
  const initialCheckOut = checkOutParam || searchParamsFromState?.checkOutDate || null;
  const initialGuests = guestsParam
    ? parseInt(guestsParam)
    : searchParamsFromState?.guestsCount || 1;

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    initialCheckIn ? new Date(initialCheckIn) : null,
    initialCheckOut ? new Date(initialCheckOut) : null,
  ]);
  const [guestsCount, setGuestsCount] = useState<number>(initialGuests);

  // Состояние для галереи
  const [galleryOpened, setGalleryOpened] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const photos = property?.photos || [];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [propertyRes, reviewsRes] = await Promise.all([
          propertiesApi.getById(parseInt(id)),
          reviewsApi.getReviewsByPropertyId(parseInt(id)),
        ]);
        setProperty(propertyRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить информацию об объекте');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBookNow = () => {
    if (!dateRange[0] || !dateRange[1]) {
      notifications.show({
        title: 'Ошибка',
        message: 'Выберите даты бронирования',
        color: 'red',
      });
      return;
    }

    const params = new URLSearchParams();
    params.set('propertyId', id!);
    params.set('checkIn', dayjs(dateRange[0]).format('YYYY-MM-DD'));
    params.set('checkOut', dayjs(dateRange[1]).format('YYYY-MM-DD'));
    params.set('guests', guestsCount.toString());

    navigate(`/booking?${params.toString()}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // --- Вспомогательная функция для открытия модального окна с выбранным фото ---
  const openGallery = (index: number) => {
    setSelectedPhotoIndex(index);
    setGalleryOpened(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Center style={{ height: '80vh' }}>
          <Loader size="xl" />
        </Center>
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Header />
        <Container size="md" style={{ marginTop: '10vh' }}>
          <Alert color="red" title="Ошибка">
            {error || 'Объект не найден'}
          </Alert>
        </Container>
      </>
    );
  }

  const cityCoordinates: [number, number] | null =
    property.latitude && property.longitude
      ? [property.latitude, property.longitude]
      : null;

  // --- Блок с рендерингом галереи ---
  const renderGallery = () => {
    // Если фотографий нет, показываем заглушку
    if (photos.length === 0) {
      return (
        <Paper shadow="sm" radius="md" mb="xl">
          <Image
            src="https://placehold.co/1200x600?text=Нет+фотографий"
            height={400}
            radius="md"
            fit="cover"
          />
        </Paper>
      );
    }

    // --- Случай 1: Одна фотография ---
    if (photos.length === 1) {
      return (
        <Paper shadow="sm" radius="md" mb="xl">
          <Image
            src={photos[0].photoUrl}
            height={400}
            radius="md"
            style={{ objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => openGallery(0)}
          />
        </Paper>
      );
    }

    // --- Случай 2: Две фотографии ---
    if (photos.length === 2) {
      return (
        <Paper shadow="sm" radius="md" mb="xl">
          <Grid gutter={8}>
            <Grid.Col span={6}>
              <Image
                src={photos[0].photoUrl}
                height={400}
                radius="md"
                style={{ objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => openGallery(0)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Image
                src={photos[1].photoUrl}
                height={400}
                radius="md"
                style={{ objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => openGallery(1)}
              />
            </Grid.Col>
          </Grid>
        </Paper>
      );
    }

    // --- Случай 3: Три или более фотографий ---
    // Показываем первую большую, а справа две маленькие и кнопку "Показать все"
    const remainingPhotosCount = photos.length - 3;

    return (
      <Paper shadow="sm" radius="md" mb="xl">
        <Grid gutter={8}>
          <Grid.Col span={8}>
            <Image
              src={photos[0].photoUrl}
              height={400}
              radius="md"
              style={{ objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => openGallery(0)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap={8}>
              <div style={{ position: 'relative' }}>
                <Image
                  src={photos[1].photoUrl}
                  height={195}
                  radius="md"
                  style={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => openGallery(1)}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Image
                  src={photos[2].photoUrl}
                  height={195}
                  radius="md"
                  style={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => openGallery(2)}
                />
                {remainingPhotosCount > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => openGallery(2)}
                  >
                    <Text c="white" fw={700} size="lg">
                      +{remainingPhotosCount}
                    </Text>
                  </div>
                )}
              </div>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>
    );
  };

  // --- Модальное окно для просмотра всех фотографий ---
  const renderGalleryModal = () => {
    if (photos.length === 0) return null;

    return (
      <Modal
        opened={galleryOpened}
        onClose={() => setGalleryOpened(false)}
        fullScreen
        withCloseButton={false}
        padding={0}
        zIndex={1000}
      >
        <div style={{ position: 'relative', height: '100vh' }}>
          <ActionIcon
            size="lg"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            radius="xl"
            onClick={() => setGalleryOpened(false)}
          >
            <IconX size={24} color="white" />
          </ActionIcon>
          <Carousel
            loop
            withIndicators
            initialSlide={selectedPhotoIndex}
            height="100vh"
            styles={{
              root: { height: '100vh' },
              slide: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
              indicator: { backgroundColor: 'white' },
            }}
          >
            {photos.map((photo, index) => (
              <Carousel.Slide key={index}>
                <Image
                  src={photo.photoUrl}
                  fit="contain"
                  height="100vh"
                  alt={`Фото ${index + 1}`}
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        </div>
      </Modal>
    );
  };

  return (
    <>
      <Header />

      <Container size="xl" py="xl">
        {/* Галерея фотографий */}
        {renderGallery()}
        {renderGalleryModal()}

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
                  <Text>Заселение после 12:00</Text>
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
                <Title order={3} mb="sm">Отзывы ({reviews.length})</Title>
                {reviews.length === 0 ? (
                  <Text c="dimmed">Отзывов пока нет. Будьте первым!</Text>
                ) : (
                  <Stack gap="md">
                    {reviews.map((review) => (
                      <Card key={review.reviewId} shadow="sm" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                          <Group gap="sm">
                            <Avatar
                              size="md"
                              radius="xl"
                              color="blue"
                            >
                              {!review.reviewerAvatarUrl && getInitials(review.reviewerName)}
                            </Avatar>
                            <Stack gap={2}>
                              <Text fw={500}>{review.reviewerName}</Text>
                              <Rating value={review.rating} readOnly size="xs" />
                            </Stack>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {dayjs(review.createdAt).format('D MMMM YYYY')}
                          </Text>
                        </Group>
                        <Text size="sm" mt="xs" style={{ whiteSpace: 'pre-wrap' }}>
                          {review.comment || ''}
                        </Text>
                      </Card>
                    ))}
                  </Stack>
                )}
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
                  <DatePickerInput
                    type="range"
                    placeholder="Выберите даты"
                    value={dateRange}
                    onChange={setDateRange}
                    minDate={new Date()}
                    popoverProps={{ zIndex: 1000 }}
                    locale="ru"
                  />
                </Stack>

                <Stack gap="xs">
                  <Text fw={500} size="sm">Гости</Text>
                  <NumberInput
                    placeholder="Количество гостей"
                    min={1}
                    max={property.guestsCount}
                    value={guestsCount}
                    onChange={(value) => setGuestsCount(Number(value))}
                  />
                </Stack>

                <Divider />

                <Button size="lg" fullWidth color="blue" onClick={handleBookNow}>
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