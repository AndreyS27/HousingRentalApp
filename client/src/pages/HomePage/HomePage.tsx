import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  TextInput,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  Title,
  Alert,
} from '@mantine/core';
import { IconSearch, IconFilter, IconCalendar, IconUsers } from '@tabler/icons-react';
import { DatePicker } from '@mantine/dates';
import { PropertyCard } from '../../components/PropertyCard/PropertyCard';
import { PropertyMap } from '../../components/Map/PropertyMap';
import { FiltersModal } from '../../components/FiltersModal/FiltersModal';
import { propertiesApi } from '../../api/propertiesApi';
import { geocodeCity } from '../../api/geocodingApi';
import { PropertySummary, SearchParams } from '../../types';
import dayjs from 'dayjs';

export const HomePage: React.FC = () => {
  // Состояния для формы поиска
  const [city, setCity] = useState('Москва');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [guestsCount, setGuestsCount] = useState<number | null>(null);
  
  // Состояния для фильтров
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [bedroomsCount, setBedroomsCount] = useState<number | null>(null);
  const [bedsCount, setBedsCount] = useState<number | null>(null);
  
  // Состояния для данных
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [cityCoordinates, setCityCoordinates] = useState<[number, number] | null>(null);
  
  // Функция поиска
  const performSearch = useCallback(async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    
    try {
      // 1. Получаем координаты города для карты
      const coords = await geocodeCity(city);
      setCityCoordinates(coords);
      
      // 2. Формируем параметры запроса
      const params: SearchParams = {
        city: city,
        checkInDate: dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
        checkOutDate: dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
        guestsCount: guestsCount || undefined,
        bedroomsCount: bedroomsCount || undefined,
        bedsCount: bedsCount || undefined,
        page: 1,
        pageSize: 10,
      };
      
      // 3. Запрашиваем объекты
      const response = await propertiesApi.search(params);
      setProperties(response.data.properties);
      setTotalCount(response.data.totalCount);
      
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setLoading(false);
    }
  }, [city, dateRange, guestsCount, bedroomsCount, bedsCount]);
  
  // Первоначальная загрузка при монтировании компонента
  useEffect(() => {
    performSearch();
  }, []);
  
  // Обработчик клика по карточке объекта
  const handlePropertySelect = (propertyId: number) => {
    // TODO: переход на страницу деталей объекта
    console.log('Выбран объект:', propertyId);
  };
  
  // Применение фильтров
  const handleApplyFilters = () => {
    performSearch();
  };
  
  // Сброс фильтров
  const handleResetFilters = () => {
    setBedroomsCount(null);
    setBedsCount(null);
    performSearch();
  };
  
  return (
    <Stack gap={0}>
      {/* Шапка с поиском */}
      <Paper shadow="xs" p="md" radius={0}>
        <Container size="xl">
          <Stack gap="md">
            {/* Верхняя строка шапки */}
            <Group justify="space-between">
              <Title order={3} style={{ color: '#339af0' }}>
                HousingRental
              </Title>
              <Button variant="default">Войти / Зарегистрироваться</Button>
            </Group>
            
            {/* Блок поиска */}
            <Grid gutter="md" align="flex-end">
              <Grid.Col span={3}>
                <TextInput
                  label="Город"
                  placeholder="Введите город"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  leftSection={<IconSearch size={16} />}
                />
              </Grid.Col>
              
              <Grid.Col span={4}>
                <DatePicker
                  type="range"
                  label="Даты"
                  placeholder="Выберите даты"
                  value={dateRange}
                  onChange={setDateRange}
                  leftSection={<IconCalendar size={16} />}
                />
              </Grid.Col>
              
              <Grid.Col span={3}>
                <TextInput
                  label="Количество гостей"
                  placeholder="1-10"
                  type="number"
                  value={guestsCount || ''}
                  onChange={(e) => setGuestsCount(e.target.value ? Number(e.target.value) : null)}
                  leftSection={<IconUsers size={16} />}
                />
              </Grid.Col>
              
              <Grid.Col span={2}>
                <Button fullWidth onClick={performSearch} loading={loading}>
                  Найти
                </Button>
              </Grid.Col>
              
              <Grid.Col span={1}>
                <Button
                  variant="light"
                  fullWidth
                  onClick={() => setFiltersOpened(true)}
                  leftSection={<IconFilter size={16} />}
                >
                  Фильтры
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Paper>
      
      {/* Основной контент */}
      <Container size="xl" py="md">
        <Grid gutter="md">
          {/* Левая колонка: список объектов */}
          <Grid.Col span={6}>
            {loading ? (
              <Center style={{ height: 400 }}>
                <Loader size="xl" />
              </Center>
            ) : properties.length === 0 ? (
              <Center style={{ height: 400 }}>
                <Alert color="yellow" title="Ничего не найдено">
                  Попробуйте изменить параметры поиска или город
                </Alert>
              </Center>
            ) : (
              <>
                <Text mb="md">Найдено: {totalCount} объектов</Text>
                <Stack gap="md">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.propertyId}
                      property={property}
                      onClick={() => handlePropertySelect(property.propertyId)}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Grid.Col>
          
          {/* Правая колонка: карта */}
          <Grid.Col span={6}>
            <Paper shadow="sm" p="sm" radius="md" style={{ height: '100%' }}>
              <PropertyMap
                properties={properties}
                selectedCity={city}
                cityCoordinates={cityCoordinates}
                onPropertySelect={handlePropertySelect}
              />
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
      
      {/* Модальное окно фильтров */}
      <FiltersModal
        opened={filtersOpened}
        onClose={() => setFiltersOpened(false)}
        bedroomsCount={bedroomsCount}
        setBedroomsCount={setBedroomsCount}
        bedsCount={bedsCount}
        setBedsCount={setBedsCount}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </Stack>
  );
};