import React from 'react';
import { Modal, NumberInput, Button, Group, Stack, Checkbox, Divider, Title } from '@mantine/core';

interface FiltersModalProps {
  opened: boolean;
  onClose: () => void;
  bedroomsCount: number | null;
  setBedroomsCount: (value: number | null) => void;
  bedsCount: number | null;
  setBedsCount: (value: number | null) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (value: string[]) => void;
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
  onApply,
  onReset,
}) => {
  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleReset = () => {
    setBedroomsCount(null);
    setBedsCount(null);
    setSelectedAmenities([]);
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
      <Stack gap="md">
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