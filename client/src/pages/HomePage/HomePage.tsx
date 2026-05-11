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
  Text,
} from '@mantine/core';
import { IconSearch, IconFilter, IconCalendar, IconUsers } from '@tabler/icons-react';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import { PropertyCard } from '../../components/PropertyCard/PropertyCard';
import { PropertyMap } from '../../components/Map/PropertyMap';
import { FiltersModal } from '../../components/FiltersModal/FiltersModal';
import { propertiesApi } from '../../api/propertiesApi';
import { geocodeCity } from '../../api/geocodingApi';
import { PropertySummary, SearchParams } from '../../types';
import dayjs from 'dayjs';

export const HomePage: React.FC = () => {
  const [city, setCity] = useState('Москва');
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const [guestsCount, setGuestsCount] = useState<number | null>(null);
  
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [bedroomsCount, setBedroomsCount] = useState<number | null>(null);
  const [bedsCount, setBedsCount] = useState<number | null>(null);
  
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [cityCoordinates, setCityCoordinates] = useState<[number, number] | null>(null);
  
  const performSearch = useCallback(async () => {
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
        page: 1,
        pageSize: 10,
      };
      
      const response = await propertiesApi.search(params);
      setProperties(response.data.properties || []);
      setTotalCount(response.data.totalCount || 0);
      
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setLoading(false);
    }
  }, [city, dateRange, guestsCount, bedroomsCount, bedsCount]);
  
  useEffect(() => {
    performSearch();
  }, []);
  
  const handlePropertySelect = (propertyId: number) => {
    console.log('Выбран объект:', propertyId);
  };
  
  const handleApplyFilters = () => {
    performSearch();
  };
  
  const handleResetFilters = () => {
    setBedroomsCount(null);
    setBedsCount(null);
    performSearch();
  };
  
  return (
    <Stack gap={0}>
      <Paper shadow="xs" p="md" radius={0}>
        <Container size="xl">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3} style={{ color: '#339af0' }}>
                HousingRental
              </Title>
              <Button variant="default">Войти / Зарегистрироваться</Button>
            </Group>
            
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
      
      <Container size="xl" py="md">
        <Grid>
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
          
          <Grid.Col span={6}>
            <Paper shadow="sm" p="sm" radius="md" style={{ height: '100%' }}>
              <PropertyMap
                properties={properties}
                cityCoordinates={cityCoordinates}
                onPropertySelect={handlePropertySelect}
              />
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
      
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