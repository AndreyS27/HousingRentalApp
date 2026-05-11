import React from 'react';
import { Modal, NumberInput, Button, Group, Stack } from '@mantine/core';

interface FiltersModalProps {
  opened: boolean;
  onClose: () => void;
  bedroomsCount: number | null;
  setBedroomsCount: (value: number | null) => void;
  bedsCount: number | null;
  setBedsCount: (value: number | null) => void;
  onApply: () => void;
  onReset: () => void;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  opened,
  onClose,
  bedroomsCount,
  setBedroomsCount,
  bedsCount,
  setBedsCount,
  onApply,
  onReset,
}) => {
  const handleApply = () => {
    onApply();
    onClose();
  };
  
  return (
    <Modal opened={opened} onClose={onClose} title="Фильтры" size="md">
      <Stack gap="md">
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
        
        <Group justify="space-between" mt="md">
          <Button variant="default" onClick={onReset}>
            Сбросить
          </Button>
          <Button onClick={handleApply}>Применить</Button>
        </Group>
      </Stack>
    </Modal>
  );
};