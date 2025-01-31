import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const AccessKey = '6qdnC8BKKLNrSi2STVKyh4j8_M4OBn1YWFaZg-0zBvU';

function Gallery() {
    const [images, setImages] = useState<UnsplashImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastImageRef = useRef<HTMLImageElement | null>(null);

    interface UnsplashImage {
        id: string;
        urls: {
            small: string;
            regular: string;
        };
        alt_description?: string;
    }

    useEffect(() => {
        setLoading(true);
        axios.get(`https://api.unsplash.com/photos/?client_id=${AccessKey}&per_page=12&page=${page}`)
            .then(response => {
                setImages(prevImages => [...prevImages, ...response.data]); // Добавляем новые изображения в список
            })
            .catch(() => {
                setError("Не удалось загрузить изображения");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page]); // Загружаем данные при изменении page

    // Intersection Observer для отслеживания последнего изображения
    useEffect(() => {
        if (loading) return;
        if (observer.current) observer.current.disconnect(); // Очистка старого observer

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prevPage => prevPage + 1); // Увеличиваем страницу при достижении конца списка
            }
        });

        if (lastImageRef.current) observer.current.observe(lastImageRef.current);
    }, [loading]);

    return (
        <div className='gallery'>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {images.map((image, index) => (
                <img
                    className="gallery-image"
                    key={image.id}
                    src={image.urls.small}
                    alt={image.alt_description || "Без описания"}
                    onClick={() => setSelectedImage(image.urls.regular)}
                    ref={index === images.length - 1 ? lastImageRef : null} // Присваиваем ref последнему изображению
                />
            ))}

            {loading && <p>Загрузка...</p>}

            {selectedImage && (
                <div className='modal' onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Большое изображение" />
                </div>
            )}
        </div>
    );
}

export default Gallery;
