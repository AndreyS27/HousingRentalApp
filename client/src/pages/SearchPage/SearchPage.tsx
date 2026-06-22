import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  TextInput,
  Button,
  Stack,
  Loader,
  Center,
  Alert,
  Text,
  ScrollArea,
  Pagination,
  Group
} from '@mantine/core';
import { IconSearch, IconFilter, IconCalendar, IconUsers } from '@tabler/icons-react';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import { PropertyCard } from '../../components/PropertyCard/PropertyCard';
import { FiltersModal } from '../../components/FiltersModal/FiltersModal';
import { propertiesApi } from '../../api/propertiesApi';
import { geocodeCity } from '../../api/geocodingApi';
import { PropertySummary, SearchParams } from '../../types';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../../components/Layout/Header/Header';
import { YandexMapV3 } from '../../components/Map/YandexMapV3';


export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const initialCity = searchParams.get('city') || 'Москва';
  const initialCheckIn = searchParams.get('checkIn');
  const initialCheckOut = searchParams.get('checkOut');
  const initialGuests = searchParams.get('guests');

  // состояние формы поиска
  const [city, setCity] = useState(initialCity);
  const [dateRange, setDateRange] = useState<DatesRangeValue>([
    initialCheckIn ? new Date(initialCheckIn) : null,
    initialCheckOut ? new Date(initialCheckOut) : null,
  ]);
  const [guestsCount, setGuestsCount] = useState<number | null>(
    initialGuests ? parseInt(initialGuests) : null
  );

  // состояние фильтров
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [bedroomsCount, setBedroomsCount] = useState<number | null>(null);
  const [bedsCount, setBedsCount] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [propertyTypeId, setPropertyTypeId] = useState<number | null>(null);

  // состояние данных
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [cityCoordinates, setCityCoordinates] = useState<[number, number] | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);

  const performSearch = useCallback(async (page: number) => {
    if (!city.trim()) return;

    setLoading(true);

    try {
      const coords = await geocodeCity(city);
      setCityCoordinates(coords);

      const params: SearchParams = {
        city: city,
        checkInDate: dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
        checkOutDate: dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
        guestsCount: guestsCount || undefined,
        bedroomsCount: bedroomsCount || undefined,
        bedsCount: bedsCount || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        propertyTypeId: propertyTypeId || undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        page: page,
        pageSize: 4,
      };

      const response = await propertiesApi.search(params);
      setProperties(response.data.properties || []);
      setTotalCount(response.data.totalCount || 0);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);

      // Прокручиваем страницу к началу списка при смене страницы
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setLoading(false);
    }
  }, [city, dateRange, guestsCount, bedroomsCount, bedsCount, 
    selectedAmenities, minPrice, maxPrice, propertyTypeId]);

  // Обёртка для поиска без параметра страницы (использует текущую страницу)
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    performSearch(1);
  }, [performSearch]);

  // Обработчик смены страницы
  const handlePageChange = (page: number) => {
    performSearch(page);
  };

  useEffect(() => {
    performSearch(1);
  }, [performSearch]);

  const handleApplyFilters = () => {
    performSearch(1);
    setFiltersOpened(false);
  };

  const handleResetFilters = () => {
    setBedroomsCount(null);
    setBedsCount(null);
    setSelectedAmenities([]);
    setMinPrice(null);
    setMaxPrice(null);
    setPropertyTypeId(null);
    setCurrentPage(1);
    performSearch(1);
  };



  return (
    <Stack gap={0} style={{ height: '100vh' }}>
      {/* Шапка */}
      <Header withSearch>
        <Grid grow align="flex-end">
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
            <DatePickerInput
              type="range"
              label="Даты"
              placeholder="Выберите даты"
              value={dateRange}
              onChange={setDateRange}
              leftSection={<IconCalendar size={16} />}
              minDate={new Date()}
              popoverProps={{ zIndex: 1000 }}
              locale="ru"
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
            <Button fullWidth onClick={handleSearch} loading={loading}>
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
      </Header>

      {/* Основной контент */}
      <div style={{ flex: 1, minHeight: 0, padding: '16px' }}>
        <Grid style={{ height: '100%' }}>
          {/* Левая колонка — карточки с использованием ScrollArea */}
          <Grid.Col span={6} style={{ height: '750px' }}>
            {loading ? (
              <Center style={{ height: '100%' }}>
                <Loader size="xl" />
              </Center>
            ) : properties.length === 0 ? (
              <Center style={{ height: '100%' }}>
                <Alert color="yellow" title="Ничего не найдено">
                  Попробуйте изменить параметры поиска или город
                </Alert>
              </Center>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Text mb="md">Найдено: {totalCount} объектов</Text>
                <ScrollArea offsetScrollbars h="100vh">
                  <Grid gutter="md">
                    {properties.map((property) => (
                      <Grid.Col span={6} key={property.propertyId}>
                        <PropertyCard
                          key={property.propertyId}
                          property={property}
                          onMouseEnter={() => setHoveredPropertyId(property.propertyId)}
                          onMouseLeave={() => setHoveredPropertyId(null)}
                          searchParams={{
                            city,
                            checkInDate: dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
                            checkOutDate: dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
                            guestCount: guestsCount || undefined,
                          }}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </ScrollArea>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <Group justify="center" mt="md">
                    <Pagination
                      total={totalPages}
                      value={currentPage}
                      onChange={handlePageChange}
                      color="blue"
                      size="md"
                      withEdges
                    />
                  </Group>
                )}
              </div>
            )}
          </Grid.Col>

          {/* Правая колонка — карта */}
          <Grid.Col span={6} style={{ height: '750px' }}>
            <YandexMapV3
              properties={properties}
              cityCoordinates={cityCoordinates}
              hoveredPropertyId={hoveredPropertyId}
              searchParams={{
                city,
                checkInDate: dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
                checkOutDate: dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
                guestCount: guestsCount || undefined,
              }}
            />
          </Grid.Col>
        </Grid>
      </div>

      <FiltersModal
        opened={filtersOpened}
        onClose={() => setFiltersOpened(false)}
        bedroomsCount={bedroomsCount}
        setBedroomsCount={setBedroomsCount}
        bedsCount={bedsCount}
        setBedsCount={setBedsCount}
        selectedAmenities={selectedAmenities}
        setSelectedAmenities={setSelectedAmenities}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        propertyTypeId={propertyTypeId}
        setPropertyTypeId={setPropertyTypeId}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </Stack>
  );
};