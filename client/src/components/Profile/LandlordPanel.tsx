import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Accordion,
  Table,
  Badge,
  Button,
  Group,
  Text,
  Center,
  Loader,
  Alert,
  Modal,
} from '@mantine/core';
import { IconHome, IconCalendar, IconCurrencyRubel, IconMessageCircle, IconEdit, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { RootState } from '../../store';
import { propertiesApi } from '../../api/propertiesApi';
import { bookingsApi } from '../../api/bookingsApi';

interface Property {
  propertyId: number;
  title: string;
  city: string;
  address: string;
  pricePerNight: number;
  isActive: boolean;
}

interface BookingRequest {
  bookingId: number;
  propertyId: number;
  propertyTitle: string;
  renterEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
}

interface PastBooking {
  bookingId: number;
  propertyId: number;
  propertyTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
}

interface PropertyReview {
  reviewId: number;
  propertyId: number;
  propertyTitle: string;
  rating: number;
  comment: string;
  reviewerName: string;
}

export const LandlordPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [pastBookings, setPastBookings] = useState<PastBooking[]>([]);
  const [reviews, setReviews] = useState<PropertyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  useEffect(() => {
    fetchLandlordData();
  }, []);

  const fetchLandlordData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [propsRes, requestsRes, pastRes, reviewsRes] = await Promise.all([
        propertiesApi.getMyProperties(),
        bookingsApi.getBookingRequestsForOwner(),
        bookingsApi.getPastBookingsForOwner(),
        bookingsApi.getReviewsForOwner(),
      ]);
      setProperties(propsRes.data);
      setBookingRequests(requestsRes.data);
      setPastBookings(pastRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error('Ошибка загрузки данных арендодателя:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    try {
      await propertiesApi.delete(selectedProperty.propertyId);
      await fetchLandlordData();
      setDeleteModalOpened(false);
      setSelectedProperty(null);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      await bookingsApi.confirmBooking(bookingId);
      await fetchLandlordData();
    } catch (err) {
      console.error('Ошибка подтверждения:', err);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    if (!window.confirm('Вы уверены, что хотите отклонить заявку?')) return;
    try {
      await bookingsApi.rejectBooking(bookingId);
      await fetchLandlordData();
    } catch (err) {
      console.error('Ошибка отклонения:', err);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: 300 }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Ошибка">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="lg">
      {/* Мои объекты */}
      <Accordion variant="separated">
        <Accordion.Item value="myProperties">
          <Accordion.Control>
            <Group>
              <IconHome size={20} />
              <Text fw={500}>Мои объекты ({properties.length})</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Button fullWidth mt="md" onClick={() => navigate('/create-property')}>
              + Добавить объект
            </Button>
            {properties.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">Список пуст</Text>
            ) : (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название</Table.Th>
                    <Table.Th>Адрес</Table.Th>
                    <Table.Th>Цена за ночь</Table.Th>
                    <Table.Th>Статус</Table.Th>
                    <Table.Th>Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {properties.map((property) => (
                    <Table.Tr key={property.propertyId}>
                      <Table.Td>
                        <Text
                          style={{ cursor: 'pointer', color: '#339af0' }}
                          onClick={() => navigate(`/property/${property.propertyId}`)}
                        >
                          {property.title}
                        </Text>
                      </Table.Td>
                      <Table.Td>{property.city}, {property.address}</Table.Td>
                      <Table.Td>{property.pricePerNight.toLocaleString()} ₽</Table.Td>
                      <Table.Td>
                        <Badge color={property.isActive ? 'green' : 'gray'}>
                          {property.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button size="xs" variant="outline" onClick={() => navigate(`/edit-property/${property.propertyId}`)}>
                            <IconEdit size={14} />
                          </Button>
                          <Button size="xs" color="red" variant="outline" onClick={() => {
                            setSelectedProperty(property);
                            setDeleteModalOpened(true);
                          }}>
                            <IconTrash size={14} />
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
            
          </Accordion.Panel>
        </Accordion.Item>

        {/* Заявки на бронирование */}
        <Accordion.Item value="bookingRequests">
          <Accordion.Control>
            <Group>
              <IconCalendar size={20} />
              <Text fw={500}>Заявки на бронирование ({bookingRequests.length})</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {bookingRequests.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">Нет активных заявок</Text>
            ) : (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название объекта</Table.Th>
                    <Table.Th>Email гостя</Table.Th>
                    <Table.Th>Даты</Table.Th>
                    <Table.Th>Общая стоимость</Table.Th>
                    <Table.Th>Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {bookingRequests.map((request) => (
                    <Table.Tr key={request.bookingId}>
                      <Table.Td>
                        <Text
                          style={{ cursor: 'pointer', color: '#339af0' }}
                          onClick={() => navigate(`/property/${request.propertyId}`)}
                        >
                          {request.propertyTitle}
                        </Text>
                      </Table.Td>
                      <Table.Td>{request.renterEmail}</Table.Td>
                      <Table.Td>
                        {new Date(request.checkInDate).toLocaleDateString()} - {new Date(request.checkOutDate).toLocaleDateString()}
                      </Table.Td>
                      <Table.Td>{request.totalPrice.toLocaleString()} ₽</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button size="xs" color="green" onClick={() => handleConfirmBooking(request.bookingId)}>
                            <IconCheck size={14} />
                          </Button>
                          <Button size="xs" color="red" onClick={() => handleRejectBooking(request.bookingId)}>
                            <IconX size={14} />
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Accordion.Panel>
        </Accordion.Item>

        {/* История бронирований объектов */}
        <Accordion.Item value="pastBookings">
          <Accordion.Control>
            <Group>
              <IconCalendar size={20} />
              <Text fw={500}>История бронирований объектов ({pastBookings.length})</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {pastBookings.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">Список пуст</Text>
            ) : (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название объекта</Table.Th>
                    <Table.Th>Даты бронирования</Table.Th>
                    <Table.Th>Общая стоимость</Table.Th>
                    <Table.Th>Статус</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pastBookings.map((booking) => (
                    <Table.Tr key={booking.bookingId}>
                      <Table.Td>
                        <Text
                          style={{ cursor: 'pointer', color: '#339af0' }}
                          onClick={() => navigate(`/property/${booking.propertyId}`)}
                        >
                          {booking.propertyTitle}
                        </Text>
                      </Table.Td>
                      <Table.Td>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</Table.Td>
                      <Table.Td>{booking.totalPrice.toLocaleString()} ₽</Table.Td>
                      <Table.Td>{booking.status}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Accordion.Panel>
        </Accordion.Item>

        {/* Отзывы на объекты */}
        <Accordion.Item value="reviews">
          <Accordion.Control>
            <Group>
              <IconMessageCircle size={20} />
              <Text fw={500}>Отзывы ({reviews.length})</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {reviews.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">Нет отзывов</Text>
            ) : (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название объекта</Table.Th>
                    <Table.Th>Оценка</Table.Th>
                    <Table.Th>Отзыв</Table.Th>
                    <Table.Th>Автор</Table.Th>
                    <Table.Th>Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reviews.map((review) => (
                    <Table.Tr key={review.reviewId}>
                      <Table.Td>
                        <Text
                          style={{ cursor: 'pointer', color: '#339af0' }}
                          onClick={() => navigate(`/property/${review.propertyId}`)}
                        >
                          {review.propertyTitle}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">★ {review.rating}</Text>
                      </Table.Td>
                      <Table.Td>{review.comment?.substring(0, 50)}...</Table.Td>
                      <Table.Td>{review.reviewerName}</Table.Td>
                      <Table.Td>
                        <Button size="xs" variant="outline">
                          Подробнее
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Модальное окно удаления объекта */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Удаление объекта"
        size="sm"
      >
        <Stack gap="md">
          <Text>Вы уверены, что хотите удалить "{selectedProperty?.title}"?</Text>
          <Text size="sm" c="dimmed">Это действие нельзя отменить.</Text>
          <Group justify="space-between">
            <Button variant="default" onClick={() => setDeleteModalOpened(false)}>Отмена</Button>
            <Button color="red" onClick={handleDeleteProperty}>Удалить</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};