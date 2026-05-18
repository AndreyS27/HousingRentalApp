import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Text,
  Box,
  Group,
  Alert,
} from '@mantine/core';
import { IconMail, IconLock, IconUser, IconUserCircle } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { authApi } from '../../api/authApi';
import { setCredentials } from '../../store/slices/authSlice';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authApi.register({ 
        email, 
        password, 
        firstName, 
        lastName 
      });
      const { token, user } = response.data;
      
      dispatch(setCredentials({ token, user }));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Шапка */}
      <Paper shadow="xs" p="md" radius={0}>
        <Container size="xl">
          <Group justify="space-between">
            <Group>
              <Button
                variant="subtle"
                onClick={() => navigate('/')}
                leftSection={<IconUser size={16} />}
              >
                На главную
              </Button>
            </Group>
          </Group>
        </Container>
      </Paper>

      {/* Форма регистрации */}
      <Container size="xs" style={{ marginTop: '8vh' }}>
        <Paper shadow="lg" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Title order={2} ta="center">
              Регистрация
            </Title>

            {error && (
              <Alert color="red" title="Ошибка">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Имя"
                  placeholder="Введите имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftSection={<IconUserCircle size={16} />}
                  required
                />

                <TextInput
                  label="Фамилия"
                  placeholder="Введите фамилию"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  leftSection={<IconUserCircle size={16} />}
                  required
                />

                <TextInput
                  label="Email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftSection={<IconMail size={16} />}
                  required
                />

                <PasswordInput
                  label="Пароль"
                  placeholder="Введите пароль (минимум 6 символов)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftSection={<IconLock size={16} />}
                  required
                />

                <Button type="submit" fullWidth mt="md" loading={loading}>
                  Зарегистрироваться
                </Button>
              </Stack>
            </form>

            <Text ta="center" size="sm">
              Уже есть аккаунт?{' '}
              <Text
                component={Link}
                to="/login"
                style={{ color: '#339af0', textDecoration: 'underline', cursor: 'pointer' }}
                inherit
              >
                Войти
              </Text>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};