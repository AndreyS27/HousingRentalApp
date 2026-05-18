import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Paper,
  Container,
  Group,
  Button,
  Text,
  Menu,
  Avatar,
  Box,
  Stack
} from '@mantine/core';
import { IconUser, IconLogout, IconDashboard, IconChevronDown } from '@tabler/icons-react';
import { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';

interface HeaderProps {
  withSearch?: boolean;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ withSearch = false, children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  };

  return (
    <Paper shadow="xs" p="md" radius={0} style={{ flexShrink: 0 }}>
      <Container size="xl">
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <Text
                component={Link}
                to="/"
                size="xl"
                fw={700}
                style={{ color: '#339af0', cursor: 'pointer', textDecoration: 'none' }}
              >
                HousingRental
              </Text>
            </Group>

            {isAuthenticated ? (
              <Group gap="sm">
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <Group gap="xs" style={{ cursor: 'pointer' }}>
                      <Avatar size="sm" color="blue" radius="xl">
                        {getInitials()}
                      </Avatar>
                      <Text size="sm" fw={500}>
                        {user?.email}
                      </Text>
                      <IconChevronDown size={14} />
                    </Group>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconDashboard size={16} />}
                      onClick={() => navigate('/profile')}
                    >
                      Личный кабинет
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconLogout size={16} />}
                      color="red"
                      onClick={handleLogout}
                    >
                      Выйти
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            ) : (
              <Button variant="default" onClick={() => navigate('/login')}>
                Войти / Зарегистрироваться
              </Button>
            )}
          </Group>

          {/* Дополнительный контент (например, форма поиска) */}
          {children}
        </Stack>
      </Container>
    </Paper>
  );
};