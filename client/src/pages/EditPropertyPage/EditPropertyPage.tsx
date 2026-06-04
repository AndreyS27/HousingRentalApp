import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Paper,
    TextInput,
    Textarea,
    NumberInput,
    Switch,
    Button,
    Group,
    Stack,
    Title,
    Grid,
    FileInput,
    Image,
    Box,
    Alert,
    Text,
    Checkbox,
    Divider,
    Loader,
    Select,
    ActionIcon,
    Badge,
    SimpleGrid,
    Center
} from '@mantine/core';
import { IconUpload, IconX, IconTrash, IconStar } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { Header } from '../../components/Layout/Header/Header';
import { propertiesApi } from '../../api/propertiesApi';
import { amenitiesApi } from '../../api/amenitiesApi';
import { propertyTypesApi } from '../../api/propertyTypesApi';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

interface Amenity {
    amenityId: number;
    amenityName: string;
}

interface PropertyType {
    propertyTypeId: number;
    typeName: string;
}

interface Photo {
    photoId: number;
    photoUrl: string;
    isMain: boolean;
}

interface DateOverride {
    date: Date | null;
    isAvailable: boolean;
    priceOverride: number | null;
}

export const EditPropertyPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Данные из API
    const [property, setProperty] = useState<any>(null);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);

    // Форма
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState<number | null>(null);
    const [guestsCount, setGuestsCount] = useState<number>(1);
    const [bedroomsCount, setBedroomsCount] = useState<number>(0);
    const [bedsCount, setBedsCount] = useState<number>(0);
    const [bathroomsCount, setBathroomsCount] = useState<number>(0);
    const [pricePerNight, setPricePerNight] = useState<number>(0);
    const [isActive, setIsActive] = useState(true);
    const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
    const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);

    // Загрузка данных
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [propertyRes, amenitiesRes, typesRes] = await Promise.all([
                    propertiesApi.getById(parseInt(id)),
                    amenitiesApi.getAll(),
                    propertyTypesApi.getAll(),
                ]);

                const propertyData = propertyRes.data;
                setProperty(propertyData);
                setTitle(propertyData.title);
                setDescription(propertyData.description || '');
                setAddress(propertyData.address);
                setCity(propertyData.city);
                setSelectedPropertyTypeId(propertyData.propertyTypeId);
                setGuestsCount(propertyData.guestsCount);
                setBedroomsCount(propertyData.bedroomsCount);
                setBedsCount(propertyData.bedsCount);
                setBathroomsCount(propertyData.bathroomsCount);
                setPricePerNight(propertyData.pricePerNight);
                setIsActive(propertyData.isActive);
                // setExistingPhotos(propertyData.photos?.map((url: string, index: number) => ({
                //     photoId: index,
                //     photoUrl: url,
                //     isMain: index === 0,
                // })) || []);
                setExistingPhotos(propertyData.photos || []);

                setAmenities(amenitiesRes.data);
                setPropertyTypes(typesRes.data);

                setSelectedAmenities(propertyData.amenityIds || []);

                if (propertyData.dateOverrides && propertyData.dateOverrides.length > 0) {
                    const overrides = propertyData.dateOverrides.map((override: any) => ({
                        date: new Date(override.date),
                        isAvailable: override.isAvailable,
                        priceOverride: override.priceOverride,
                    }));
                    setDateOverrides(overrides);
                }

            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setError('Не удалось загрузить данные объекта');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddPhoto = (files: File[] | null) => {
        if (!files) return;
        const totalPhotos = existingPhotos.length + newPhotos.length;
        const remainingSlots = 9 - totalPhotos;
        const filesToAdd = files.slice(0, remainingSlots);

        const previews = filesToAdd.map(file => URL.createObjectURL(file));
        setNewPhotos([...newPhotos, ...filesToAdd]);
        setNewPhotoPreviews([...newPhotoPreviews, ...previews]);
    };

    const handleRemoveNewPhoto = (index: number) => {
        URL.revokeObjectURL(newPhotoPreviews[index]);
        const updatedNewPhotos = [...newPhotos];
        const updatedPreviews = [...newPhotoPreviews];
        updatedNewPhotos.splice(index, 1);
        updatedPreviews.splice(index, 1);
        setNewPhotos(updatedNewPhotos);
        setNewPhotoPreviews(updatedPreviews);
    };

    const handleRemoveExistingPhoto = (photoId: number) => {
        setPhotosToDelete([...photosToDelete, photoId]);
        setExistingPhotos(existingPhotos.filter(p => p.photoId !== photoId));
    };

    const handleSetMainPhoto = async (photoId: number) => {
        // Находим фотографию
        // const photo = existingPhotos.find(p => p.photoUrl === photoUrl);
        // if (!photo) return;

        try {
            // Отправляем запрос на бэкенд
            await propertiesApi.setMainPhoto(parseInt(id!), photoId);

            // Обновляем локальное состояние
            setExistingPhotos(existingPhotos.map(p => ({
                ...p,
                isMain: p.photoId === photoId
            })));

            notifications.show({
                title: 'Успешно',
                message: 'Главная фотография обновлена',
                color: 'green',
            });
        } catch (err) {
            console.error('Ошибка при установке главной фотографии:', err);
            notifications.show({
                title: 'Ошибка',
                message: 'Не удалось обновить главную фотографию',
                color: 'red',
            });
        }
    };

    const handleAddDateOverride = () => {
        setDateOverrides([...dateOverrides, { date: null, isAvailable: true, priceOverride: null }]);
    };

    const handleRemoveDateOverride = (index: number) => {
        setDateOverrides(dateOverrides.filter((_, i) => i !== index));
    };

    const updateDateOverride = (index: number, field: keyof DateOverride, value: any) => {
        const updated = [...dateOverrides];
        updated[index] = { ...updated[index], [field]: value };
        setDateOverrides(updated);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // 1. Обновляем основную информацию
            const updateData = {
                title,
                description,
                address,
                city,
                propertyTypeId: selectedPropertyTypeId,
                guestsCount,
                bedroomsCount,
                bedsCount,
                bathroomsCount,
                pricePerNight,
                isActive,
                amenityIds: selectedAmenities,
                dateOverrides: dateOverrides
                    .filter(d => d.date)
                    .map(d => ({
                        date: dayjs(d.date).format('YYYY-MM-DD'),
                        isAvailable: d.isAvailable,
                        priceOverride: d.priceOverride
                    })),
                photosToDeleteIds: photosToDelete,
            };

            await propertiesApi.update(parseInt(id!), updateData);

            // 2. Загружаем новые фотографии
            if (newPhotos.length > 0) {
                const formData = new FormData();
                newPhotos.forEach(photo => formData.append('photos', photo));
                await propertiesApi.addPhotos(parseInt(id!), formData);
            }

            notifications.show({
                title: 'Успешно',
                message: 'Объект успешно обновлён',
                color: 'green',
            });

            navigate('/profile');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при обновлении');
            notifications.show({
                title: 'Ошибка',
                message: err.response?.data?.message || 'Не удалось обновить объект',
                color: 'red',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <Center style={{ height: '80vh' }}>
                    <Loader size="xl" />
                </Center>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <Container size="lg" style={{ marginTop: '2vh' }}>
                    <Alert color="red" title="Ошибка">
                        {error}
                    </Alert>
                </Container>
            </>
        );
    }

    return (
        <>
            <Header />
            <Container size="lg" style={{ marginTop: '2vh', marginBottom: '2vh' }}>
                <Paper shadow="lg" p="xl" radius="md" withBorder>
                    <Group justify="space-between" mb="lg">
                        <Title order={2}>Редактирование объекта</Title>
                        <Button variant="default" onClick={() => navigate('/profile')}>
                            В личный кабинет
                        </Button>
                    </Group>

                    <Stack gap="md">
                        {/* Фотографии */}
                        <Box>
                            <Text fw={500} mb="xs">Фотографии (до 9 штук)</Text>

                            {/* Существующие фотографии */}
                            {existingPhotos.length > 0 && (
                                <SimpleGrid cols={4} spacing="md" mb="md">
                                    {existingPhotos.map((photo) => (
                                        <Box key={photo.photoId} style={{ position: 'relative' }}>
                                            <Image
                                                src={photo.photoUrl}
                                                height={150}
                                                fit="cover"
                                                radius="md"
                                            />
                                            {photo.isMain && (
                                                <Badge color="blue" size="sm" style={{ position: 'absolute', top: 5, left: 5 }}>
                                                    Главная
                                                </Badge>
                                            )}
                                            <Group gap="xs" style={{ position: 'absolute', bottom: 5, right: 5 }}>
                                                {!photo.isMain && (
                                                    <ActionIcon size="sm" color="blue" onClick={() => handleSetMainPhoto(photo.photoId)}>
                                                        <IconStar size={14} />
                                                    </ActionIcon>
                                                )}
                                                <ActionIcon size="sm" color="red" onClick={() => handleRemoveExistingPhoto(photo.photoId)}>
                                                    <IconTrash size={14} />
                                                </ActionIcon>
                                            </Group>
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            )}

                            {/* Новые фотографии */}
                            {newPhotoPreviews.length > 0 && (
                                <SimpleGrid cols={4} spacing="md" mb="md">
                                    {newPhotoPreviews.map((preview, index) => (
                                        <Box key={index} style={{ position: 'relative' }}>
                                            <Image
                                                src={preview}
                                                height={150}
                                                fit="cover"
                                                radius="md"
                                            />
                                            <ActionIcon
                                                size="sm"
                                                color="red"
                                                style={{ position: 'absolute', top: 5, right: 5 }}
                                                onClick={() => handleRemoveNewPhoto(index)}
                                            >
                                                <IconX size={14} />
                                            </ActionIcon>
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            )}

                            <FileInput
                                multiple
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                placeholder="Добавить фотографии"
                                leftSection={<IconUpload size={16} />}
                                onChange={handleAddPhoto}
                                disabled={existingPhotos.length + newPhotos.length >= 9}
                            />
                            <Text size="xs" c="dimmed" mt={4}>
                                {existingPhotos.length + newPhotos.length} из 9
                            </Text>
                        </Box>

                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Название объекта"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Город"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                />
                            </Grid.Col>
                        </Grid>

                        <TextInput
                            label="Адрес"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />

                        <Textarea
                            label="Описание"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            minRows={3}
                        />

                        <Select
                            label="Тип объекта"
                            placeholder="Выберите тип"
                            data={propertyTypes.map(pt => ({ value: pt.propertyTypeId.toString(), label: pt.typeName }))}
                            value={selectedPropertyTypeId?.toString()}
                            onChange={(value) => setSelectedPropertyTypeId(value ? parseInt(value) : null)}
                            required
                        />

                        <Grid>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Макс. гостей"
                                    min={1}
                                    max={50}
                                    value={guestsCount}
                                    onChange={(value) => setGuestsCount(Number(value))}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Спальни"
                                    min={0}
                                    value={bedroomsCount}
                                    onChange={(value) => setBedroomsCount(Number(value))}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Кровати"
                                    min={0}
                                    value={bedsCount}
                                    onChange={(value) => setBedsCount(Number(value))}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Ванные комнаты"
                                    min={0}
                                    step={0.5}
                                    value={bathroomsCount}
                                    onChange={(value) => setBathroomsCount(Number(value))}
                                />
                            </Grid.Col>
                        </Grid>

                        <Grid>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Цена за ночь (₽)"
                                    min={1}
                                    value={pricePerNight}
                                    onChange={(value) => setPricePerNight(Number(value))}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Switch
                                    label="Активно"
                                    description="Объект будет отображаться в поиске"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.currentTarget.checked)}
                                    mt="md"
                                />
                            </Grid.Col>
                        </Grid>

                        <Divider label="Удобства" labelPosition="center" />

                        <Grid>
                            {amenities.map((amenity) => (
                                <Grid.Col span={6} sm={4} md={3} key={amenity.amenityId}>
                                    <Checkbox
                                        label={amenity.amenityName}
                                        checked={selectedAmenities.includes(amenity.amenityId)}
                                        onChange={() => {
                                            setSelectedAmenities(prev =>
                                                prev.includes(amenity.amenityId)
                                                    ? prev.filter(id => id !== amenity.amenityId)
                                                    : [...prev, amenity.amenityId]
                                            );
                                        }}
                                    />
                                </Grid.Col>
                            ))}
                        </Grid>

                        <Divider label="Блокировка и переопределение цен" labelPosition="center" />

                        {dateOverrides.map((override, index) => (
                            <Grid key={index} align="flex-end">
                                <Grid.Col span={4}>
                                    <DatePickerInput
                                        label="Дата"
                                        placeholder="Выберите дату"
                                        value={override.date}
                                        onChange={(value) => updateDateOverride(index, 'date', value)}
                                        locale='ru'
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Switch
                                        label="Доступно"
                                        checked={override.isAvailable}
                                        onChange={(e) => updateDateOverride(index, 'isAvailable', e.currentTarget.checked)}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Цена (опционально)"
                                        placeholder="Оставьте пустым для стандартной"
                                        min={1}
                                        value={override.priceOverride || ''}
                                        onChange={(value) => updateDateOverride(index, 'priceOverride', value === '' ? null : Number(value))}
                                    />
                                </Grid.Col>
                                <Grid.Col span={1}>
                                    <ActionIcon color="red" onClick={() => handleRemoveDateOverride(index)}>
                                        <IconX size={16} />
                                    </ActionIcon>
                                </Grid.Col>
                            </Grid>
                        ))}

                        <Button variant="outline" onClick={handleAddDateOverride}>
                            + Добавить переопределение даты
                        </Button>

                        <Divider />

                        <Group justify="space-between" mt="xl">
                            <Button variant="default" onClick={() => navigate('/profile')}>
                                Отмена
                            </Button>
                            <Button color="blue" onClick={handleSubmit} loading={saving}>
                                Сохранить изменения
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Container>
        </>
    );
};