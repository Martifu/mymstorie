import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CaretLeft, CaretRight, Plus, Minus } from 'phosphor-react';

interface ImageViewerProps {
    images: Array<{ url: string; type: 'image' | 'video' }>;
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export function ImageViewer({ images, initialIndex, isOpen, onClose, title = '' }: ImageViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const imageImages = images.filter(img => img.type === 'image');

    // Resetear estado cuando cambia la imagen
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [currentIndex]);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevImage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextImage();
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    zoomOut();
                    break;
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, currentIndex]);

    const prevImage = useCallback(() => {
        if (imageImages.length <= 1) return;
        const newIndex = currentIndex === 0 ? imageImages.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, imageImages.length]);

    const nextImage = useCallback(() => {
        if (imageImages.length <= 1) return;
        const newIndex = currentIndex === imageImages.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, imageImages.length]);

    const zoomIn = useCallback(() => {
        setScale(prev => Math.min(prev * 1.5, 5));
    }, []);

    const zoomOut = useCallback(() => {
        if (scale <= 1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        } else {
            setScale(prev => Math.max(prev / 1.5, 1));
        }
    }, [scale]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;

        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return;

        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    };

    const handleDoubleClick = () => {
        if (scale === 1) {
            zoomIn();
        } else {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    };

    if (!isOpen || imageImages.length === 0) return null;

    const currentImage = imageImages[currentIndex];

    const modal = (
        <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[999999]"
            style={{ zIndex: 999999 }}
            onClick={onClose}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={24} className="text-white" weight="bold" />
                    </button>
                    {title && (
                        <h3 className="text-white font-medium truncate max-w-md">{title}</h3>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={zoomOut}
                        className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                        aria-label="Reducir zoom"
                    >
                        <Minus size={20} className="text-white" weight="bold" />
                    </button>
                    <span className="text-white text-sm font-medium min-w-[3rem] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                        aria-label="Aumentar zoom"
                    >
                        <Plus size={20} className="text-white" weight="bold" />
                    </button>
                </div>
            </div>

            {/* Navigation arrows */}
            {imageImages.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Imagen anterior"
                    >
                        <CaretLeft size={24} className="text-white" weight="bold" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Imagen siguiente"
                    >
                        <CaretRight size={24} className="text-white" weight="bold" />
                    </button>
                </>
            )}

            {/* Image container */}
            <div
                ref={containerRef}
                className="flex-1 flex items-center justify-center p-8 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onWheel={handleWheel}
            >
                <img
                    ref={imageRef}
                    src={currentImage.url}
                    alt={`${title} - imagen ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onDoubleClick={handleDoubleClick}
                    draggable={false}
                />
            </div>

            {/* Bottom info */}
            {imageImages.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-4 flex items-center justify-center">
                    <div className="flex space-x-1">
                        {imageImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(index);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Ir a imagen ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(modal, document.body);
}
