import React from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Avatar,
  Group,
  Divider,
  Box,
  Grid,
} from '@mantine/core';
import { IconMail, IconUser, IconUserCircle } from '@tabler/icons-react';
import { Header } from '../../components/Layout/Header/Header';
import { RootState } from '../../store';

export const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Функция для получения URL аватара или заглушки
  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      return user.avatarUrl;
    }
    return 'https://placekitten.com/150/150';
  };

  if (!user) {
    return (
      <>
        <Header />
        <Container size="md" style={{ marginTop: '10vh' }}>
          <Paper shadow="lg" p="xl" radius="md" withBorder>
            <Text ta="center">Пожалуйста, войдите в систему</Text>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container size="md" style={{ marginTop: '5vh' }}>
        <Paper shadow="lg" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Title order={2} ta="center">
              Личный кабинет
            </Title>

            <Divider />

            <Grid gutter="xl" align="center">
              {/* Левая колонка: фото */}
              <Grid.Col span={4} style={{ textAlign: 'center' }}>
                <Avatar
                  src={getAvatarUrl()}
                  size={150}
                  radius="xl"
                  color="blue"
                />
              </Grid.Col>

              {/* Правая колонка: информация о пользователе */}
              <Grid.Col span={8}>
                <Stack gap="md">
                  <Group gap="md">
                    <IconUserCircle size={20} />
                    <Text fw={500}>Имя:</Text>
                    <Text>{user.firstName}</Text>
                  </Group>

                  <Group gap="md">
                    <IconUserCircle size={20} />
                    <Text fw={500}>Фамилия:</Text>
                    <Text>{user.lastName}</Text>
                  </Group>

                  <Group gap="md">
                    <IconMail size={20} />
                    <Text fw={500}>Email:</Text>
                    <Text>{user.email}</Text>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};