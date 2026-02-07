import { Metadata } from 'next';
import { GalleryGrid } from '@/components/gallery-grid';

export const metadata: Metadata = {
    title: 'Gallery | World Sports Academy',
    description: 'Explore moments from our training sessions, tournaments, and events at World Sports Academy.',
};

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 bg-primary/5">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Our Gallery
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Capturing the intensity, joy, and dedication of our athletes in action.
                    </p>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-12">
                <GalleryGrid />
            </section>
        </div>
    );
}
