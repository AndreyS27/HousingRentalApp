import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  Button,
  Group,
  Stack,
  Title,
  Box,
} from '@mantine/core';
import { IconSearch, IconCalendar, IconUsers } from '@tabler/icons-react';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import dayjs from 'dayjs';

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const [guestsCount, setGuestsCount] = useState<number | null>(null);

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
      <Paper shadow="xs" p="md" radius={0}>
        <Container size="xl">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3} style={{ color: '#339af0' }}>
                X
              </Title>
              <Button
                variant="default"
                onClick={() => navigate('/login')}
              >
                Войти / Зарегистрироваться
              </Button>
            </Group>
          </Stack>
        </Container>
      </Paper>

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
    </Box>
  );
};