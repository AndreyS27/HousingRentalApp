import React from 'react';
import { Container, Group, Text, Divider, Stack } from '@mantine/core';

export const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#f8f9fa', paddingTop: '32px', paddingBottom: '32px', marginTop: 'auto' }}>
      <Container size="xl">
        <Stack gap="md">
          <Group justify="center" gap="xl">
            <Text size="sm" c="dimmed" style={{ cursor: 'default' }}>
              О сервисе
            </Text>
            <Text size="sm" c="dimmed" style={{ cursor: 'default' }}>
              Политика конфиденциальности
            </Text>
            <Text size="sm" c="dimmed" style={{ cursor: 'default' }}>
              Контакты
            </Text>
          </Group>
          
          <Divider />
          
          <Text size="xs" c="dimmed" ta="center">
            © {new Date().getFullYear()} HousingRental. Все права защищены.
          </Text>
        </Stack>
      </Container>
    </footer>
  );
};