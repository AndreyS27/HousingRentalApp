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
  ActionIcon,
} from '@mantine/core';
import { IconCalendar, IconMessageCircle, IconEdit, IconTrash } from '@tabler/icons-react';
import { RootState } from '../../store';
import { bookingsApi } from '../../api/bookingsApi';
import { reviewsApi } from '../../api/reviewsApi';
import { notifications } from '@mantine/notifications';

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
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Модальное окно для создания отзыва
  const [reviewModalOpened, setReviewModalOpened] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Модальное окно для редактирования отзыва
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  
  // Модальное окно для подтверждения удаления
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  useEffect(() => {
    fetchRenterData();
  }, []);

  const fetchRenterData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [activeRes, historyRes, reviewsRes] = await Promise.all([
        bookingsApi.getMyActiveBookings(),
        bookingsApi.getMyHistoryBookings(),
        reviewsApi.getMyReviews(),
      ]);
      setActiveBookings(activeRes.data);
      setHistoryBookings(historyRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error('Ошибка загрузки данных арендатора:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Вы уверены, что хотите отменить бронирование?')) return;
    try {
      await bookingsApi.cancelBooking(bookingId);
      await fetchRenterData();
      notifications.show({
        title: 'Успешно',
        message: 'Бронирование отменено',
        color: 'green',
      });
    } catch (err) {
      console.error('Ошибка отмены бронирования:', err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось отменить бронирование',
        color: 'red',
      });
    }
  };

  // Создание отзыва
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
      notifications.show({
        title: 'Успешно',
        message: 'Отзыв успешно создан',
        color: 'green',
      });
    } catch (err) {
      console.error('Ошибка отправки отзыва:', err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось отправить отзыв',
        color: 'red',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Редактирование отзыва
  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
    setEditModalOpened(true);
  };

  const submitEdit = async () => {
    if (!editingReview) return;
    setSubmittingEdit(true);
    try {
      await reviewsApi.updateReview(editingReview.reviewId, {
        rating: editRating,
        comment: editComment,
      });
      setEditModalOpened(false);
      await fetchRenterData();
      notifications.show({
        title: 'Успешно',
        message: 'Отзыв успешно обновлён',
        color: 'green',
      });
    } catch (err) {
      console.error('Ошибка обновления отзыва:', err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить отзыв',
        color: 'red',
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Удаление отзыва
  const openDeleteModal = (review: Review) => {
    setDeletingReview(review);
    setDeleteModalOpened(true);
  };

  const submitDelete = async () => {
    if (!deletingReview) return;
    setSubmittingDelete(true);
    try {
      await reviewsApi.deleteReview(deletingReview.reviewId);
      setDeleteModalOpened(false);
      await fetchRenterData();
      notifications.show({
        title: 'Успешно',
        message: 'Отзыв успешно удалён',
        color: 'green',
      });
    } catch (err) {
      console.error('Ошибка удаления отзыва:', err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить отзыв',
        color: 'red',
      });
    } finally {
      setSubmittingDelete(false);
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
      case 'rejected':
        return <Badge color="orange">Отклонено</Badge>;
      case 'completed':
        return <Badge color="gray">Завершено</Badge>;
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
        <Accordion.Item value="historyBookings">
          <Accordion.Control>
            <Group>
              <IconCalendar size={20} />
              <Text fw={500}>История бронирований ({historyBookings.length})</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {historyBookings.length === 0 ? (
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
                  {historyBookings.map((booking) => (
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
                        {booking.status === 'Завершено' && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => openReviewModal(booking)}
                          >
                            Оставить отзыв
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
                        <Group gap="xs">
                          <ActionIcon
                            size="sm"
                            color="blue"
                            variant="outline"
                            onClick={() => openEditModal(review)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            color="red"
                            variant="outline"
                            onClick={() => openDeleteModal(review)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Модальное окно для создания отзыва */}
      <Modal
        opened={reviewModalOpened}
        onClose={() => setReviewModalOpened(false)}
        title="Оставить отзыв"
        size="md"
      >
        <Stack gap="md">
          <Text fw={500}>{selectedBooking?.propertyTitle}</Text>
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

      {/* Модальное окно для редактирования отзыва */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Редактировать отзыв"
        size="md"
      >
        <Stack gap="md">
          <Text fw={500}>{editingReview?.propertyTitle}</Text>
          <Rating value={editRating} onChange={setEditRating} size="lg" />
          <Textarea
            label="Ваш отзыв"
            placeholder="Расскажите о вашем опыте..."
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            minRows={4}
          />
          <Button onClick={submitEdit} loading={submittingEdit} fullWidth>
            Сохранить изменения
          </Button>
        </Stack>
      </Modal>

      {/* Модальное окно для подтверждения удаления */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Удаление отзыва"
        size="sm"
      >
        <Stack gap="md">
          <Text>Вы уверены, что хотите удалить отзыв на объект "{deletingReview?.propertyTitle}"?</Text>
          <Text size="sm" c="dimmed">Это действие нельзя отменить.</Text>
          <Group justify="space-between">
            <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
              Отмена
            </Button>
            <Button color="red" onClick={submitDelete} loading={submittingDelete}>
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};