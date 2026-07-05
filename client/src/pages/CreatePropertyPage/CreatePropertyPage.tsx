import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Select
} from '@mantine/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import { Header } from '../../components/Layout/Header/Header';
import { propertiesApi } from '../../api/propertiesApi';
import { amenitiesApi } from '../../api/amenitiesApi';
import { notifications } from '@mantine/notifications';
import { propertyTypesApi } from '../../api/propertyTypesApi';
import { PropertyType } from '../../types';

interface Amenity {
    amenityId: number;
    amenityName: string;
}

interface FormState {
    title: string;
    description: string;
    address: string;
    city: string;
    guestsCount: number;
    bedroomsCount: number;
    bedsCount: number;
    bathroomsCount: number;
    pricePerNight: number;
    isActive: boolean;
}

export const CreatePropertyPage: React.FC = () => {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
    const [loadingAmenities, setLoadingAmenities] = useState(true);
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState<number | null>(null);

    // Состояния формы
    const [form, setForm] = useState<FormState>({
        title: '',
        description: '',
        address: '',
        city: '',
        guestsCount: 1,
        bedroomsCount: 0,
        bedsCount: 0,
        bathroomsCount: 0,
        pricePerNight: 0,
        isActive: true,
    });

    // Валидация полей
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Загрузка типов объектов
    useEffect(() => {
        const fetchPropertyTypes = async () => {
            try {
                const response = await propertyTypesApi.getAll();
                setPropertyTypes(response.data);
            } catch (err) {
                console.error('Ошибка загрузки типов объектов:', err);
            }
        };
        fetchPropertyTypes();
    }, []);

    // Загрузка списка удобств
    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await amenitiesApi.getAll();
                setAmenities(response.data);
            } catch (err) {
                console.error('Ошибка загрузки удобств:', err);
            } finally {
                setLoadingAmenities(false);
            }
        };
        fetchAmenities();
    }, []);

    // Обработчик изменения полей формы
    const handleInputChange = (field: keyof FormState, value: string | number | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        // Очищаем ошибку для этого поля
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Валидация формы
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.title.trim()) {
            newErrors.title = 'Название обязательно';
        } else if (form.title.length < 3) {
            newErrors.title = 'Название должно содержать минимум 3 символа';
        }

        if (!form.address.trim()) {
            newErrors.address = 'Адрес обязателен';
        }

        if (!form.city.trim()) {
            newErrors.city = 'Город обязателен';
        }

        if (form.guestsCount < 1) {
            newErrors.guestsCount = 'Минимум 1 гость';
        }

        if (form.pricePerNight <= 0) {
            newErrors.pricePerNight = 'Цена должна быть больше 0';
        }

        if (!selectedPropertyTypeId) {
            newErrors.propertyTypeId = 'Выберите тип объекта';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePhotoUpload = (files: File[] | null) => {
        if (!files) return;

        const remainingSlots = 9 - photos.length;
        const newFiles = files.slice(0, remainingSlots);

        if (newFiles.length === 0) return;

        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

        setPhotos([...photos, ...newFiles]);
        setPhotoPreviews([...photoPreviews, ...newPreviews]);
    };

    const handleRemovePhoto = (index: number) => {
        URL.revokeObjectURL(photoPreviews[index]);
        const newPhotos = [...photos];
        const newPreviews = [...photoPreviews];
        newPhotos.splice(index, 1);
        newPreviews.splice(index, 1);
        setPhotos(newPhotos);
        setPhotoPreviews(newPreviews);
    };

    const toggleAmenity = (amenityId: number) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenityId)
                ? prev.filter((id) => id !== amenityId)
                : [...prev, amenityId]
        );
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();

            // Добавляем все поля формы
            formData.append('title', form.title);
            if (form.description) formData.append('description', form.description);
            formData.append('address', form.address);
            formData.append('city', form.city);
            formData.append('guestsCount', form.guestsCount.toString());
            formData.append('bedroomsCount', form.bedroomsCount.toString());
            formData.append('bedsCount', form.bedsCount.toString());
            formData.append('bathroomsCount', form.bathroomsCount.toString());
            formData.append('pricePerNight', form.pricePerNight.toString());
            formData.append('isActive', form.isActive.toString());

            // Добавляем удобства
            selectedAmenities.forEach((id) => {
                formData.append('amenityIds', id.toString());
            });

            // Добавляем тип объекта
            if (selectedPropertyTypeId) {
                formData.append('propertyTypeId', selectedPropertyTypeId.toString());
            }

            // Добавляем фотографии
            photos.forEach((photo) => {
                formData.append('photos', photo);
            });

            await propertiesApi.create(formData);

            notifications.show({
                title: 'Успешно',
                message: 'Объект успешно добавлен',
                color: 'green',
            });

            navigate('/profile');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при создании объекта');
            notifications.show({
                title: 'Ошибка',
                message: err.response?.data?.message || 'Не удалось создать объект',
                color: 'red',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setForm({
            title: '',
            description: '',
            address: '',
            city: '',
            guestsCount: 1,
            bedroomsCount: 0,
            bedsCount: 0,
            bathroomsCount: 0,
            pricePerNight: 0,
            isActive: true,
        });
        setSelectedAmenities([]);
        photoPreviews.forEach((url) => URL.revokeObjectURL(url));
        setPhotos([]);
        setPhotoPreviews([]);
        setErrors({});
        setError(null);
    };

    return (
        <>
            <Header />
            <Container size="lg" style={{ marginTop: '2vh', marginBottom: '2vh' }}>
                <Paper shadow="lg" p="xl" radius="md" withBorder>
                    <Title order={2} mb="lg" ta="center">
                        Добавление объекта недвижимости
                    </Title>

                    {error && (
                        <Alert color="red" title="Ошибка" mb="md">
                            {error}
                        </Alert>
                    )}

                    <Stack gap="md">
                        {/* Фотографии */}
                        <Box>
                            <Text fw={500} mb="xs">
                                Фотографии (до 9 штук)
                            </Text>
                            <FileInput
                                multiple
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                placeholder="Выберите фотографии"
                                leftSection={<IconUpload size={16} />}
                                onChange={handlePhotoUpload}
                                disabled={photos.length >= 9}
                            />
                            <Text size="xs" c="dimmed" mt={4}>
                                Выбрано файлов: {photos.length} из 9
                            </Text>

                            {photoPreviews.length > 0 && (
                                <Grid mt="md" gutter="md">
                                    {photoPreviews.map((preview, index) => (
                                        <Grid.Col span={4} key={index}>
                                            <Box style={{ position: 'relative' }}>
                                                <Image
                                                    src={preview}
                                                    height={120}
                                                    fit="cover"
                                                    radius="md"
                                                />
                                                <Button
                                                    size="xs"
                                                    color="red"
                                                    variant="filled"
                                                    style={{ position: 'absolute', top: 5, right: 5 }}
                                                    onClick={() => handleRemovePhoto(index)}
                                                >
                                                    <IconX size={12} />
                                                </Button>
                                            </Box>
                                        </Grid.Col>
                                    ))}
                                </Grid>
                            )}
                        </Box>

                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Название объекта"
                                    placeholder="Квартира в центре"
                                    value={form.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    error={errors.title}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Город"
                                    placeholder="Москва"
                                    value={form.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    error={errors.city}
                                    required
                                />
                            </Grid.Col>
                        </Grid>

                        <TextInput
                            label="Адрес"
                            placeholder="ул. Тверская, д. 10"
                            value={form.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            error={errors.address}
                            required
                        />

                        <Textarea
                            label="Описание"
                            placeholder="Уютная квартира в центре города..."
                            minRows={3}
                            value={form.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />

                        <Select
                            label="Тип объекта"
                            placeholder="Выберите тип"
                            data={propertyTypes.map(pt => ({ value: pt.propertyTypeId.toString(), label: pt.typeName }))}
                            value={selectedPropertyTypeId?.toString()}
                            onChange={(value) => {
                                setSelectedPropertyTypeId(value ? parseInt(value) : null);
                                if (errors.propertyTypeId) {
                                    setErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors.propertyTypeId;
                                        return newErrors;
                                    });
                                }
                            }}
                            required
                            error={errors.propertyTypeId}
                        />

                        <Grid>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Макс. гостей"
                                    placeholder="Количество гостей"
                                    min={1}
                                    max={50}
                                    value={form.guestsCount}
                                    onChange={(value) => handleInputChange('guestsCount', Number(value))}
                                    error={errors.guestsCount}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Спальни"
                                    placeholder="Количество спален"
                                    min={0}
                                    value={form.bedroomsCount}
                                    onChange={(value) => handleInputChange('bedroomsCount', Number(value))}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Кровати"
                                    placeholder="Количество кроватей"
                                    min={0}
                                    value={form.bedsCount}
                                    onChange={(value) => handleInputChange('bedsCount', Number(value))}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Ванные комнаты"
                                    placeholder="Количество ванных"
                                    min={0}
                                    step={0.5}
                                    value={form.bathroomsCount}
                                    onChange={(value) => handleInputChange('bathroomsCount', Number(value))}
                                />
                            </Grid.Col>
                        </Grid>

                        <Grid>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Цена за ночь (₽)"
                                    placeholder="Стоимость"
                                    min={1}
                                    value={form.pricePerNight}
                                    onChange={(value) => handleInputChange('pricePerNight', Number(value))}
                                    error={errors.pricePerNight}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Switch
                                    label="Активно"
                                    description="Объект будет отображаться в поиске"
                                    checked={form.isActive}
                                    onChange={(e) => handleInputChange('isActive', e.currentTarget.checked)}
                                    mt="md"
                                />
                            </Grid.Col>
                        </Grid>

                        <Divider label="Удобства" labelPosition="center" />

                        {loadingAmenities ? (
                            <Loader size="sm" />
                        ) : (
                            <Grid>
                                {amenities.map((amenity) => (
                                    <Grid.Col span={6} sm={4} md={3} key={amenity.amenityId}>
                                        <Checkbox
                                            label={amenity.amenityName}
                                            checked={selectedAmenities.includes(amenity.amenityId)}
                                            onChange={() => toggleAmenity(amenity.amenityId)}
                                        />
                                    </Grid.Col>
                                ))}
                            </Grid>
                        )}

                        <Divider />

                        <Group justify="space-between" mt="xl">
                            <Button variant="default" onClick={() => navigate('/profile')}>
                                Отмена
                            </Button>
                            <Group>
                                <Button variant="outline" color="yellow" onClick={handleClear}>
                                    Очистить всё
                                </Button>
                                <Button color="blue" onClick={handleSubmit} loading={uploading}>
                                    Добавить
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                </Paper>
            </Container>
        </>
    );
};