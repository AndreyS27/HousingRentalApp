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
} from '@mantine/core';
import { IconMail, IconUser, IconUserCircle } from '@tabler/icons-react';
import { Header } from '../../components/Layout/Header/Header';
import { RootState } from '../../store';

export const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
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

            <Group justify="center">
              <Avatar size={120} color="blue" radius="xl">
                {getInitials()}
              </Avatar>
            </Group>

            <Divider />

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
        </Paper>
      </Container>
    </>
  );
};