import { useState, useRef, useCallback } from 'react';

interface ZoomableImageProps {
    src: string;
    alt: string;
    className?: string;
}

export function ZoomableImage({ src, alt, className = '' }: ZoomableImageProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastTouchDistance, setLastTouchDistance] = useState(0);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    // Calcular distancia entre dos toques
    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return 0;
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    };

    // Manejar zoom con rueda del mouse
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(scale + delta, 1), 3);
        setScale(newScale);

        // Si volvemos a escala 1, resetear posición
        if (newScale === 1) {
            setPosition({ x: 0, y: 0 });
        }
    }, [scale]);

    // Manejar doble tap para zoom
    const handleDoubleClick = useCallback(() => {
        if (scale === 1) {
            setScale(2);
        } else {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [scale]);

    // Manejar inicio de arrastre
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    }, [scale, position]);

    // Manejar movimiento de arrastre
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, scale, dragStart]);

    // Finalizar arrastre
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Manejar inicio de toque
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch to zoom
            const distance = getTouchDistance(e.touches);
            setLastTouchDistance(distance);
        } else if (e.touches.length === 1 && scale > 1) {
            // Single touch drag
            setIsDragging(true);
            const touch = e.touches[0];
            setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
        }
    }, [scale, position]);

    // Manejar movimiento de toque
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();

        if (e.touches.length === 2) {
            // Pinch to zoom
            const distance = getTouchDistance(e.touches);
            if (lastTouchDistance > 0) {
                const ratio = distance / lastTouchDistance;
                const newScale = Math.min(Math.max(scale * ratio, 1), 3);
                setScale(newScale);

                if (newScale === 1) {
                    setPosition({ x: 0, y: 0 });
                }
            }
            setLastTouchDistance(distance);
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            // Single touch drag
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y
            });
        }
    }, [scale, lastTouchDistance, isDragging, dragStart]);

    // Finalizar toque
    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        setLastTouchDistance(0);
    }, []);

    return (
        <div
            ref={imageRef}
            className={`relative overflow-hidden ${className}`}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain transition-transform duration-200 ease-out select-none"
                style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                }}
                draggable={false}
            />

            {/* Indicadores de zoom */}
            {scale > 1 && (
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm">
                    {Math.round(scale * 100)}%
                </div>
            )}

            {scale === 1 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Doble tap para zoom
                    </div>
                </div>
            )}
        </div>
    );
}
