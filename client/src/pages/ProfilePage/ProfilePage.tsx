import React, { useState } from 'react';
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
  Grid,
  Tabs,
} from '@mantine/core';
import { IconUser, IconCalendar, IconHome, IconMail, IconUserCircle } from '@tabler/icons-react';
import { Header } from '../../components/Layout/Header/Header';
import { RootState } from '../../store';
import { RenterPanel } from '../../components/Profile/RenterPanel';
import { LandlordPanel } from '../../components/Profile/LandlordPanel';

export const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<string | null>('profile');

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
      <Container size="xl" style={{ marginTop: '2vh', marginBottom: '2vh' }}>
        <Paper shadow="lg" p="xl" radius="md" withBorder>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List grow mb="md">
              <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
                Мой профиль
              </Tabs.Tab>
              <Tabs.Tab value="renter" leftSection={<IconCalendar size={16} />}>
                Арендатор
              </Tabs.Tab>
              <Tabs.Tab value="landlord" leftSection={<IconHome size={16} />}>
                Арендодатель
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="profile">
              <Grid gutter="xl" align="center">
                <Grid.Col span={4} style={{ textAlign: 'center' }}>
                  <Avatar size={150} radius="xl" color="blue">
                    {!user.avatarUrl && getInitials()}
                  </Avatar>
                </Grid.Col>

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
            </Tabs.Panel>

            <Tabs.Panel value="renter">
              <RenterPanel />
            </Tabs.Panel>

            <Tabs.Panel value="landlord">
              <LandlordPanel />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Container>
    </>
  );
};