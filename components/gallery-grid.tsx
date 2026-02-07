'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

// Generates an array of image paths based on the renaming script we ran
// We have 48 images based on the file count from list_dir
const images = Array.from({ length: 48 }, (_, i) => ({
    id: i + 1,
    src: `/gallery/image-${i + 1}.jpg`,
    alt: `Gallery Image ${i + 1}`,
}));

export function GalleryGrid() {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {images.map((image, index) => (
                    <motion.div
                        key={image.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={500}
                            height={500}
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ZoomIn className="text-white w-8 h-8 drop-shadow-lg" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 p-2"
                            aria-label="Close lightbox"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 hidden sm:block"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 hidden sm:block"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                        >
                            <Image
                                src={images[selectedImageIndex].src}
                                alt={images[selectedImageIndex].alt}
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </motion.div>

                        {/* Mobile Navigation Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 sm:hidden">
                            <button onClick={prevImage} className="p-3 bg-white/10 rounded-full backdrop-blur-md text-white">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={nextImage} className="p-3 bg-white/10 rounded-full backdrop-blur-md text-white">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
