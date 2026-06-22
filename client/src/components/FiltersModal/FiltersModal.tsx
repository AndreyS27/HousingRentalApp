import React, { useState, useEffect } from 'react';
import { Modal, NumberInput, Button, Group, Stack, Checkbox, Divider, RangeSlider, Text, Box } from '@mantine/core';
import { propertyTypesApi } from '../../api/propertyTypesApi';
import { PropertyType } from '../../types';

interface FiltersModalProps {
  opened: boolean;
  onClose: () => void;
  bedroomsCount: number | null;
  setBedroomsCount: (value: number | null) => void;
  bedsCount: number | null;
  setBedsCount: (value: number | null) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (value: string[]) => void;
  minPrice: number | null;
  setMinPrice: (value: number | null) => void;
  maxPrice: number | null;
  setMaxPrice: (value: number | null) => void;
  propertyTypeId: number | null;
  setPropertyTypeId: (value: number | null) => void;
  onApply: () => void;
  onReset: () => void;
}

// Список доступных удобств
const AMENITIES_LIST = [
  "Wi-Fi",
  "Парковка",
  "Кухня",
  "Кондиционер",
  "Стиральная машина",
  "Телевизор",
  "Фен",
  "Утюг",
  "Домашние животные разрешены",
  "Бассейн"
];

export const FiltersModal: React.FC<FiltersModalProps> = ({
  opened,
  onClose,
  bedroomsCount,
  setBedroomsCount,
  bedsCount,
  setBedsCount,
  selectedAmenities,
  setSelectedAmenities,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  propertyTypeId,
  setPropertyTypeId,
  onApply,
  onReset,
}) => {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await propertyTypesApi.getAll();
        setPropertyTypes(response.data);
      } catch (err) {
        console.error('Ошибка загрузки типов объектов:', err);
      }
    };
    fetchPropertyTypes();
  }, []);

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleReset = () => {
    setBedroomsCount(null);
    setBedsCount(null);
    setSelectedAmenities([]);
    setMinPrice(null);
    setMaxPrice(null);
    setPropertyTypeId(null);
    onReset();
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  return (

    <Modal
      opened={opened}
      onClose={onClose}
      title="Фильтры"
      size="md"
      zIndex={1000}
    >
      <Stack gap="md" m='xs'>
        {/* Фильтр по типу жилья */}
        <Box>
          <Text fw={500} size="sm" mb={4}>
            Тип жилья
          </Text>
          <select
            value={propertyTypeId?.toString() || ''}
            onChange={(e) => setPropertyTypeId(e.target.value ? parseInt(e.target.value) : null)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              backgroundColor: 'white',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="">Любой</option>
            {propertyTypes.map((pt) => (
              <option key={pt.propertyTypeId} value={pt.propertyTypeId.toString()}>
                {pt.typeName}
              </option>
            ))}
          </select>
        </Box>

        {/* Фильтр по цене */}
        <Box>
          <Text fw={500} size="sm" mb="xs">
            Цена за ночь
          </Text>
          <RangeSlider mb='lg'
            min={0}
            max={50000}
            step={500}
            value={[minPrice || 0, maxPrice || 50000]}
            onChange={(value) => {
              setMinPrice(value[0]);
              setMaxPrice(value[1]);
            }}
            marks={[
              { value: 0, label: '0 ₽' },
              { value: 25000, label: '25 000 ₽' },
              { value: 50000, label: '50 000 ₽' },
            ]}
          />
          <Group grow mt="xs">
            <NumberInput
              placeholder="от"
              value={minPrice || ''}
              onChange={(value) => setMinPrice(value === '' ? null : Number(value))}
              min={0}
              max={50000}
            />
            <NumberInput
              placeholder="до"
              value={maxPrice || ''}
              onChange={(value) => setMaxPrice(value === '' ? null : Number(value))}
              min={0}
              max={50000}
            />
          </Group>
        </Box>

        <Divider my="sm" />

        {/* Фильтры по спальням и кроватям */}
        <NumberInput
          label="Количество спален"
          placeholder="Не важно"
          value={bedroomsCount || ''}
          onChange={(value) => setBedroomsCount(value === '' ? null : Number(value))}
          min={0}
          max={20}
        />

        <NumberInput
          label="Количество кроватей"
          placeholder="Не важно"
          value={bedsCount || ''}
          onChange={(value) => setBedsCount(value === '' ? null : Number(value))}
          min={0}
          max={30}
        />

        <Divider my="sm" label="Удобства" labelPosition="center" />

        {/* Сетка с чекбоксами удобств */}
        <Group grow preventGrowOverflow={false}>
          {AMENITIES_LIST.map((amenity) => (
            <Checkbox
              key={amenity}
              label={amenity}
              checked={selectedAmenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
            />
          ))}
        </Group>

        <Divider my="sm" />

        <Group justify="space-between" mt="md">
          <Button variant="default" onClick={handleReset}>
            Сбросить все
          </Button>
          <Button onClick={handleApply}>Применить</Button>
        </Group>
      </Stack>
    </Modal>
  );
};