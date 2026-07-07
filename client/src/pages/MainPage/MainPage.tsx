import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  Button,
  Stack,
  Title,
  Box,
  Modal,
  Text,
} from '@mantine/core';
import { IconSearch, IconCalendar, IconUsers } from '@tabler/icons-react';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { Header } from '../../components/Layout/Header/Header';

dayjs.locale('ru');

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const [guestsCount, setGuestsCount] = useState<number | null>(null);
  const [disclaimerOpened, setDisclaimerOpened] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setDisclaimerOpened(true);
      localStorage.setItem('hasSeenDisclaimer', 'true');
    }
  }, []);

  const handleSearch = () => {
    if (!city.trim()) return;

    const params = new URLSearchParams();
    params.set('city', city);

    if (dateRange[0]) {
      params.set('checkIn', dayjs(dateRange[0]).format('YYYY-MM-DD'));
    }
    if (dateRange[1]) {
      params.set('checkOut', dayjs(dateRange[1]).format('YYYY-MM-DD'));
    }
    if (guestsCount) {
      params.set('guests', guestsCount.toString());
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <Box style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />

      <Container size="md" style={{ marginTop: '15vh' }}>
        <Paper shadow="lg" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Title order={2} ta="center" mb="md">
              Найдите идеальное жильё
            </Title>

            <TextInput
              size="lg"
              label="Город"
              placeholder="Куда едем?"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              leftSection={<IconSearch size={20} />}
            />

            <DatePickerInput
              size="lg"
              type="range"
              label="Даты"
              placeholder="Выберите даты"
              value={dateRange}
              onChange={setDateRange}
              leftSection={<IconCalendar size={20} />}
              minDate={new Date()}
              locale="ru"
            />

            <TextInput
              size="lg"
              label="Количество гостей"
              placeholder="1-10"
              type="number"
              value={guestsCount || ''}
              onChange={(e) => setGuestsCount(e.target.value ? Number(e.target.value) : null)}
              leftSection={<IconUsers size={20} />}
            />

            <Button size="lg" onClick={handleSearch} mt="md">
              Найти
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* Модальное окно-дисклеймер */}
      <Modal
        opened={disclaimerOpened}
        onClose={() => setDisclaimerOpened(false)}
        title="О проекте"
        centered
        size="lg"
        zIndex={1000}
      >
        <Stack gap="md">
          <Text>
            Данное веб-приложение создано в рамках выполнения дипломной работы
            по теме «Разработка веб-приложения для аренды жилья».
          </Text>
          <Text>
            Проект является учебно-демонстрационным и <strong>не предназначен
              для осуществления реальных сделок</strong> между арендодателями и арендаторами.
            Все объявления об аренде, а также данные о пользователях, объектах
            недвижимости и отзывах являются <strong>вымышленными</strong>. Любые совпадения
            с реальными людьми, организациями, адресами или событиями случайны.
          </Text>
          <Text>
            Приложение не преследует коммерческих целей и не несёт ответственности
            за какие-либо последствия, связанные с его использованием для заключения
            реальных сделок.
          </Text>
        </Stack>
      </Modal>
    </Box>
  );
};