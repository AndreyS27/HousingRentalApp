import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Title, Text, Button, Stack, ThemeIcon } from '@mantine/core';
import { IconCheck, IconHome } from '@tabler/icons-react';
import { Header } from '../../components/Layout/Header/Header';

export const BookingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  return (
    <>
      <Header />
      <Container size="md" style={{ marginTop: '10vh' }}>
        <Paper shadow="lg" p="xl" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <ThemeIcon size={80} radius="xl" color="green">
              <IconCheck size={50} />
            </ThemeIcon>
            
            <Title order={2} ta="center">Оплата прошла успешно!</Title>
            
            <Text ta="center" size="lg">
              Бронирование #{bookingId} создано.
            </Text>
            
            <Text ta="center" c="dimmed">
              Арендодатель должен подтвердить бронирование в течение суток,<br />
              иначе деньги будут возвращены на вашу карту.
            </Text>
            
            <Button
              size="lg"
              onClick={() => navigate('/')}
              leftSection={<IconHome size={18} />}
              mt="md"
            >
              На главную
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};