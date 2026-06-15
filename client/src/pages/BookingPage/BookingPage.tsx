import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Title,
    Text,
    Button,
    Group,
    Stack,
    Divider,
    Image,
    Loader,
    Center,
    Alert,
    NumberInput,
    TextInput,
    SimpleGrid,
    Card,
} from '@mantine/core';
import { IconArrowLeft, IconCreditCard, IconLock, IconCalendar, IconUsers } from '@tabler/icons-react';
import { Header } from '../../components/Layout/Header/Header';
import { propertiesApi } from '../../api/propertiesApi';
import { bookingsApi } from '../../api/bookingsApi';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { DatePickerInput } from '@mantine/dates';

interface PropertyInfo {
    propertyId: number;
    title: string;
    mainPhotoUrl: string;
    pricePerNight: number;
    averageRating: number | null;
    guestsCount: number;
}

export const BookingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const propertyId = parseInt(searchParams.get('propertyId') || '0');
    const initialCheckIn = searchParams.get('checkIn');
    const initialCheckOut = searchParams.get('checkOut');
    const initialGuests = parseInt(searchParams.get('guests') || '1');

    const [blockedDates, setBlockedDates] = useState<string[]>([]);

    const [property, setProperty] = useState<PropertyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    const [checkInDate, setCheckInDate] = useState<Date | null>(
        initialCheckIn ? new Date(initialCheckIn) : null
    );
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(
        initialCheckOut ? new Date(initialCheckOut) : null
    );
    const [guestsCount, setGuestsCount] = useState<number>(initialGuests);

    // Платёжная форма
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');

    useEffect(() => {
        const fetchProperty = async () => {
            if (!propertyId) {
                setError('Объект не указан');
                setLoading(false);
                return;
            }

            try {
                const response = await propertiesApi.getById(propertyId);
                const data = response.data;
                setProperty({
                    propertyId: data.propertyId,
                    title: data.title,
                    mainPhotoUrl: data.photos?.[0]?.photoUrl || '',
                    pricePerNight: data.pricePerNight,
                    averageRating: data.averageRating,
                    guestsCount: data.guestsCount,
                });
                setBlockedDates(data.blockedDates || []);
            } catch (err) {
                console.error('Ошибка загрузки объекта:', err);
                setError('Не удалось загрузить информацию об объекте');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    const calculateTotalPrice = () => {
        if (!checkInDate || !checkOutDate || !property) return 0;
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        return nights * property.pricePerNight;
    };

    const calculateNights = () => {
        if (!checkInDate || !checkOutDate) return 0;
        return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const handlePayment = async () => {
        if (!checkInDate || !checkOutDate) {
            notifications.show({
                title: 'Ошибка',
                message: 'Выберите даты бронирования',
                color: 'red',
            });
            return;
        }

        if (guestsCount < 1) {
            notifications.show({
                title: 'Ошибка',
                message: 'Укажите количество гостей',
                color: 'red',
            });
            return;
        }

        // Простая валидация карты (только для имитации)
        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
            notifications.show({
                title: 'Ошибка',
                message: 'Введите корректный номер карты',
                color: 'red',
            });
            return;
        }

        setProcessingPayment(true);

        try {
            // 1. Создаём бронирование
            const createResponse = await bookingsApi.create({
                propertyId: propertyId,
                checkInDate: dayjs(checkInDate).format('YYYY-MM-DD'),
                checkOutDate: dayjs(checkOutDate).format('YYYY-MM-DD'),
                guestsCount: guestsCount,
            });

            const bookingId = createResponse.data.bookingId;

            // 2. Оплачиваем бронирование
            await bookingsApi.pay(bookingId, { paymentMethod: 'card' });

            // 3. Переход на страницу успеха
            navigate(`/booking-success?bookingId=${bookingId}`);

        } catch (err: any) {
            console.error('Ошибка при бронировании:', err);
            notifications.show({
                title: 'Ошибка',
                message: err.response?.data?.message || 'Не удалось завершить бронирование',
                color: 'red',
            });
        } finally {
            setProcessingPayment(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '').slice(0, 16);
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const formatExpiryDate = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 3) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        return cleaned;
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

    const totalPrice = calculateTotalPrice();
    const nights = calculateNights();

    return (
        <>
            <Header />
            <Container size="xl" style={{ marginTop: '2vh', marginBottom: '2vh' }}>
                {/* Кнопка назад */}
                <Button
                    variant="subtle"
                    component={Link}
                    to={`/property/${propertyId}${location.search}`}
                    leftSection={<IconArrowLeft size={16} />}
                    mb="md"
                >
                    Назад к объекту
                </Button>

                <Title order={2} mb="lg">Бронирование и оплата</Title>

                <Grid gutter="xl">
                    {/* Левая колонка — платёжная форма */}
                    <Grid.Col span={7}>
                        <Paper shadow="sm" p="xl" radius="md" withBorder>
                            <Title order={3} mb="md">Способ оплаты</Title>
                            <Text size="sm" c="dimmed" mb="lg">
                                Оплата возможна только банковской картой
                            </Text>

                            <Stack gap="md">
                                <TextInput
                                    label="Номер карты"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    leftSection={<IconCreditCard size={18} />}
                                    required
                                />

                                <SimpleGrid cols={2}>
                                    <TextInput
                                        label="Срок действия"
                                        placeholder="MM/YY"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                        required
                                    />
                                    <TextInput
                                        label="CVC / CVV"
                                        placeholder="123"
                                        type="password"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.slice(0, 4))}
                                        required
                                    />
                                </SimpleGrid>

                                <Divider />

                                <Group justify="space-between" align="center">
                                    <Group gap="xs">
                                        <IconLock size={16} />
                                        <Text size="xs" c="dimmed">
                                            Платёж защищён и безопасен
                                        </Text>
                                    </Group>
                                    <Button
                                        size="lg"
                                        color="blue"
                                        onClick={handlePayment}
                                        loading={processingPayment}
                                    >
                                        Оплатить {totalPrice.toLocaleString()} ₽
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    {/* Правая колонка — информация о бронировании */}
                    <Grid.Col span={5}>
                        <Paper shadow="sm" p="xl" radius="md" withBorder>
                            <Stack gap="md">
                                <Card shadow="none" p={0} withBorder>
                                    <Group align="flex-start" wrap="nowrap">
                                        <Image
                                            src={property.mainPhotoUrl || 'https://placehold.co/100x100?text=No+Image'}
                                            width={80}
                                            height={80}
                                            radius="md"
                                            fit="cover"
                                        />
                                        <Stack gap={4} style={{ flex: 1 }}>
                                            <Text fw={600} lineClamp={2}>{property.title}</Text>
                                            {property.averageRating && (
                                                <Text size="sm">★ {property.averageRating.toFixed(1)}</Text>
                                            )}
                                        </Stack>
                                    </Group>
                                </Card>

                                <Divider />

                                <Stack gap="xs">
                                    <Text fw={500} size="sm">Даты поездки</Text>
                                    <DatePickerInput
                                        type="range"
                                        placeholder="Выберите даты"
                                        value={[checkInDate, checkOutDate]}
                                        onChange={(value) => {
                                            setCheckInDate(value[0]);
                                            setCheckOutDate(value[1]);
                                        }}
                                        minDate={new Date()}
                                        locale="ru"
                                        excludeDate={(date) => {
                                            // Форматируем дату в строку для сравнения
                                            const dateStr = dayjs(date).format('YYYY-MM-DD');
                                            // Блокируем дату, если она есть в списке заблокированных
                                            return blockedDates.includes(dateStr);
                                        }}
                                    />
                                </Stack>

                                <Stack gap="xs">
                                    <Text fw={500} size="sm">Количество гостей</Text>
                                    <NumberInput
                                        placeholder="Гости"
                                        min={1}
                                        max={property.guestsCount}
                                        value={guestsCount}
                                        onChange={(value) => setGuestsCount(Number(value))}
                                    />
                                </Stack>

                                <Divider />

                                <Stack gap="xs">
                                    <Text fw={500}>Детали оплаты</Text>
                                    <Group justify="space-between">
                                        <Text size="sm">
                                            {nights} ночь × {property.pricePerNight.toLocaleString()} ₽
                                        </Text>
                                        <Text size="sm">{totalPrice.toLocaleString()} ₽</Text>
                                    </Group>
                                    <Divider />
                                    <Group justify="space-between">
                                        <Text fw={600}>Итого</Text>
                                        <Text fw={700} size="lg">{totalPrice.toLocaleString()} ₽</Text>
                                    </Group>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Container>
        </>
    );
};