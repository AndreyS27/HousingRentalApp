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
  Stack,
  Modal,
} from '@mantine/core';
import { IconLogout, IconDashboard, IconChevronDown } from '@tabler/icons-react';
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
  const [faqOpened, setFaqOpened] = useState(false);
  const [aboutOpened, setAboutOpened] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  };

  return (
    <>
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
                  Здесь будет логотип
                </Text>
              </Group>
              <Group>
                <Text
                  onClick={() => setFaqOpened(true)}
                  size="xl"
                  fw={700}
                  style={{ color: '#0e2b44', cursor: 'pointer', textDecoration: 'none' }}
                >
                  FAQ
                </Text>
              </Group>
              <Group>
                <Text
                  onClick={() => setAboutOpened(true)}
                  size="xl"
                  fw={700}
                  style={{ color: '#0e2b44', cursor: 'pointer', textDecoration: 'none' }}
                >
                  О проекте
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

      {/* Модальное окно FAQ */}
      <Modal
        opened={faqOpened}
        onClose={() => setFaqOpened(false)}
        title="Часто задаваемые вопросы"
        centered
        zIndex={1000}
        size="xl"
      >
        <h3>Как найти жильё?</h3>
        <ol>
          <li>На главной странице или на странице поиска введите название города;</li>
          <li>Выберите даты для бронирования;</li>
          <li>Введите количество гостей;</li>
          <li>При необходимости на странице поиска выберите фильтры;</li>
          <li>Нажмите кнопку "Найти";</li>
        </ol>

        <h3>Как забронировать жильё?</h3>
        <ol>
          <li>Нажмите на карточку нужного жилья на странице поиска, откроется страница с подробной информацией об объекте недвижимости;</li>
          <li>На странице с подробной информацией о жилье укажите даты и количество гостей, если не указали ранее;</li>
          <li>Нажмите на кнопку "Забронировать";</li>
          <li>Если вы авторизованы откроется страница с оплатой, проверьте выбранные даты и количество гостей, заполните платёжную информацию и нажмите "Оплатить";</li>
          <li>Бронирование будет создано, теперь нужно ждать подтверждения от арендодателя;</li>
          <li>Если вы не авторизованы вам будет предложено авторизоваться или зарегистрироваться;</li>
          <li>Выберите нужное действие, страница регистрации или авторизации откроется в новой вкладке;</li>
          <li>После авторизации или регистрации вернитесь на страницу подробной информации и обновите ёё, вернитесь к шагу 3.</li>
        </ol>

        <h3>Как сдать жильё?</h3>
        <ol>
          <li>Зарегистрируйтесь или авторизуйтесь;</li>
          <li>В правом верхнем углу, в шапке веб-приложения нажмите на свою почту;</li>
          <li>В выпадающем меню нажмите "Личный кабинет";</li>
          <li>Выберите таб "Арендодатель";</li>
          <li>Разверните выпадающее меню "Мои объекты" и нажмите на нопку "Добавить объект", откроется форма для заполнения;</li>
          <li>Заполните обязательные поля формы, загрузите фотографии, нажмите "Добавить" - объявление создано и опубликовано;</li>
        </ol>
      </Modal>
      
      <Modal
        opened={aboutOpened}
        onClose={() => setAboutOpened(false)}
        title="О проекте"
        centered
        zIndex={1000}
        size="xl"
      >
        <Stack gap="md">
          <Text>
            Данное веб-приложение создано в рамках выполнения дипломной работы
            по теме «Разработка веб-приложения для аренды жилья».
          </Text>
          <Text>
            Проект является учебно-демонстрационным и <strong>не предназначен
              для осуществления реальных сделок</strong> между арендодателями и арендаторами.
            Все объявления об аренде, а также данные о пользователях, объектах
            недвижимости и отзывах являются <strong>вымышленными</strong>. Любые совпадения
            с реальными людьми, организациями, адресами или событиями случайны.
          </Text>
          <Text>
            Приложение не преследует коммерческих целей и не несёт ответственности
            за какие-либо последствия, связанные с его использованием для заключения
            реальных сделок.
          </Text>
          <Text>
            Целью дальнейшего развития приложения является отработка автором навыков fullstack разработки с использованием C#, ASP.NET Core, TypeScript, React, Mantine и др.
          </Text>
        </Stack>
      </Modal>
    </>
  );
};