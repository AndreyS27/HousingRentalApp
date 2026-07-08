import React from 'react';
import { Container, Paper, Title, Text, Stack } from '@mantine/core';
import { Header } from '../../components/Layout/Header/Header';

export const ContactsPage: React.FC = () => {
    return (
        <>
            <Header />
            <Container size="md" style={{ marginTop: '10vh'}}>
                <Paper shadow="lg" p="xl" radius="md" withBorder>
                    <Stack gap="md">
                        <Title order={2} ta="center">Контакты</Title>
                        <Text ta="center" size="lg">
                            Email: salihov.andrey1@yandex.ru
                        </Text>
                    </Stack>
                </Paper>
            </Container>
        </>
    )
}