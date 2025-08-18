import { useState, useRef, useEffect } from 'react';
import { CaretLeft, CaretRight } from 'phosphor-react';
import { ImageViewer } from './ImageViewer';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

interface MediaCarouselProps {
    media: MediaItem[];
    title: string;
    className?: string;
}

export function MediaCarousel({ media, title, className = '' }: MediaCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [imageViewerIndex, setImageViewerIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    if (!media || media.length === 0) return null;

    const goToSlide = (slideIndex: number) => {
        if (slideIndex < 0 || slideIndex >= media.length || isTransitioning) return;

        setIsTransitioning(true);
        setCurrentSlide(slideIndex);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const nextSlide = () => {
        const next = currentSlide === media.length - 1 ? 0 : currentSlide + 1;
        goToSlide(next);
    };

    const prevSlide = () => {
        const prev = currentSlide === 0 ? media.length - 1 : currentSlide - 1;
        goToSlide(prev);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (distance > minSwipeDistance) {
            nextSlide();
        } else if (distance < -minSwipeDistance) {
            prevSlide();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide]);

    const openImageViewer = (index: number) => {
        if (media[index].type === 'image') {
            setImageViewerIndex(index);
            setShowImageViewer(true);
        }
    };

    const hasMultipleSlides = media.length > 1;

    return (
        <div className={`relative mx-3 mt-4 mb-6 ${className}`}>
            {/* Main carousel container */}
            <div
                className="relative h-[28rem] bg-gray-100 overflow-hidden rounded-2xl group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Slides */}
                <div
                    className="flex h-full transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {media.map((item, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0">
                            {item.type === 'image' ? (
                                <img
                                    src={item.url}
                                    alt={`${title} - imagen ${index + 1}`}
                                    className="h-full w-full object-cover cursor-pointer"
                                    style={{
                                        minHeight: '100%',
                                        minWidth: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onClick={() => openImageViewer(index)}
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            ) : (
                                <video
                                    src={item.url}
                                    controls
                                    className="h-full w-full object-cover"
                                    preload="metadata"
                                    onError={(e) => {
                                        console.error('Error loading video:', item.url, e);
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation arrows - only show if multiple slides */}
                {hasMultipleSlides && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white/90 active:scale-95 transition-all duration-200"
                            disabled={isTransitioning}
                            aria-label="Imagen anterior"
                        >
                            <CaretLeft size={16} className="text-gray-700" weight="bold" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white/90 active:scale-95 transition-all duration-200"
                            disabled={isTransitioning}
                            aria-label="Imagen siguiente"
                        >
                            <CaretRight size={16} className="text-gray-700" weight="bold" />
                        </button>
                    </>
                )}

                {/* Slide counter */}
                {hasMultipleSlides && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-pill text-white text-xs font-medium">
                        {currentSlide + 1} / {media.length}
                    </div>
                )}
            </div>

            {/* Dots indicator - only show if multiple slides */}
            {hasMultipleSlides && (
                <div className="flex justify-center mt-3 space-x-1">
                    {media.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentSlide
                                ? 'bg-brand-purple w-6'
                                : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            disabled={isTransitioning}
                            aria-label={`Ir a imagen ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image Viewer Modal */}
            <ImageViewer
                images={media}
                initialIndex={imageViewerIndex}
                isOpen={showImageViewer}
                onClose={() => setShowImageViewer(false)}
                title={title}
            />
        </div>
    );
}
