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
  Textarea,
  Rating,
} from '@mantine/core';
import { IconCalendar, IconCurrencyRubel, IconMessageCircle, IconEdit } from '@tabler/icons-react';
import { RootState } from '../../store';
import { bookingsApi } from '../../api/bookingsApi';
import { reviewsApi } from '../../api/reviewsApi';

interface Booking {
  bookingId: number;
  propertyId: number;
  propertyTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
}

interface Review {
  reviewId: number;
  propertyId: number;
  propertyTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const RenterPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpened, setReviewModalOpened] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchRenterData();
  }, []);

  const fetchRenterData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [activeRes, pastRes, reviewsRes] = await Promise.all([
        bookingsApi.getMyBookings(),
        bookingsApi.getMyPastBookings(),
        reviewsApi.getMyReviews(),
      ]);
      setActiveBookings(activeRes.data);
      setPastBookings(pastRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error('Ошибка загрузки данных арендатора:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Вы уверены, что хотите отменить бронирование?')) return;
    try {
      await bookingsApi.cancelBooking(bookingId);
      await fetchRenterData(); // Обновляем данные
    } catch (err) {
      console.error('Ошибка отмены бронирования:', err);
    }
  };

  const openReviewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpened(true);
  };

  const submitReview = async () => {
    if (!selectedBooking) return;
    setSubmittingReview(true);
    try {
      await reviewsApi.createReview({
        bookingId: selectedBooking.bookingId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewModalOpened(false);
      await fetchRenterData();
    } catch (err) {
      console.error('Ошибка отправки отзыва:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge color="green">Подтверждено</Badge>;
      case 'awaiting_confirmation':
        return <Badge color="yellow">Ожидает подтверждения</Badge>;
      case 'cancelled':
        return <Badge color="red">Отменено</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
      {/* Активные бронирования */}
      <Accordion variant="separated">
        <Accordion.Item value="activeBookings">
          <Accordion.Control>
            <Group>
              <IconCalendar size={20} />
              <Text fw={500}>Мои бронирования ({activeBookings.length})</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {activeBookings.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">Список пуст</Text>
            ) : (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название объекта</Table.Th>
                    <Table.Th>Даты бронирования</Table.Th>
                    <Table.Th>Общая сумма</Table.Th>
                    <Table.Th>Статус</Table.Th>
                    <Table.Th>Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {activeBookings.map((booking) => (
                    <Table.Tr key={booking.bookingId}>
                      <Table.Td>
                        <Text
                          style={{ cursor: 'pointer', color: '#339af0' }}
                          onClick={() => navigate(`/property/${booking.propertyId}`)}
                        >
                          {booking.propertyTitle}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                      </Table.Td>
                      <Table.Td>{booking.totalPrice.toLocaleString()} ₽</Table.Td>
                      <Table.Td>{getStatusBadge(booking.status)}</Table.Td>
                      <Table.Td>
                        {booking.status === 'awaiting_confirmation' && (
                          <Button
                            size="xs"
                            color="red"
                            onClick={() => handleCancelBooking(booking.bookingId)}
                          >
                            Отменить
                          </Button>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Accordion.Panel>
        </Accordion.Item>

        {/* История бронирований */}
        <Accordion.Item value="pastBookings">
          <Accordion.Control>
            <Group>
              <IconCalendar size={20} />
              <Text fw={500}>История бронирований ({pastBookings.length})</Text>
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
                    <Table.Th>Общая сумма</Table.Th>
                    <Table.Th>Действия</Table.Th>
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
                      <Table.Td>
                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                      </Table.Td>
                      <Table.Td>{booking.totalPrice.toLocaleString()} ₽</Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openReviewModal(booking)}
                        >
                          Оставить отзыв
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Accordion.Panel>
        </Accordion.Item>

        {/* Мои отзывы */}
        <Accordion.Item value="myReviews">
          <Accordion.Control>
            <Group>
              <IconMessageCircle size={20} />
              <Text fw={500}>Мои отзывы ({reviews.length})</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {reviews.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">Список пуст</Text>
            ) : (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название объекта</Table.Th>
                    <Table.Th>Оценка</Table.Th>
                    <Table.Th>Отзыв</Table.Th>
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
                        <Rating value={review.rating} readOnly size="sm" />
                      </Table.Td>
                      <Table.Td>{review.comment?.substring(0, 50)}...</Table.Td>
                      <Table.Td>
                        <Button size="xs" variant="outline" leftSection={<IconEdit size={14} />}>
                          Редактировать
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

      {/* Модальное окно для отзыва */}
      <Modal
        opened={reviewModalOpened}
        onClose={() => setReviewModalOpened(false)}
        title="Оставить отзыв"
        size="md"
      >
        <Stack gap="md">
          <Text fw={500}>
            {selectedBooking?.propertyTitle}
          </Text>
          <Rating value={reviewRating} onChange={setReviewRating} size="lg" />
          <Textarea
            label="Ваш отзыв"
            placeholder="Расскажите о вашем опыте..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            minRows={4}
          />
          <Button onClick={submitReview} loading={submittingReview} fullWidth>
            Отправить отзыв
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
};