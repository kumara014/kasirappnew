import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../config';

// Global cache to store blob URLs and prevent re-fetching/re-creating
const blobCache = new Map();

// Standardize path keys to avoid duplicates like "/image.jpg" vs "image.jpg"
const normalizePath = (p) => {
    if (!p) return "";
    return p.replace('storage/', '').replace(/^\//, '');
};

/**
 * Pre-fetches an image blob and stores its object URL in the global cache.
 * Call this when data loads to prevent "loading shimmers" later.
 */
export const preloadImage = async (src) => {
    if (!src || src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) return;

    const key = normalizePath(src);
    if (blobCache.has(key)) return blobCache.get(key);

    try {
        const endpoint = `/storage/${key}`;
        const response = await apiFetch(endpoint);
        if (!response.ok) return null;

        const blob = await response.blob();
        if (blob.size < 100 || !blob.type.startsWith('image/')) return null;

        const internalUrl = URL.createObjectURL(blob);
        blobCache.set(key, internalUrl);
        return internalUrl;
    } catch (e) {
        console.warn("Preload failed for:", src, e);
        return null;
    }
};

const SafeImage = ({ src, alt, className, style, fallback = '🍽️', onLoad }) => {
    const normSrc = normalizePath(src);
    const [imageUrl, setImageUrl] = useState(blobCache.get(normSrc) || null);
    const [loading, setLoading] = useState(!blobCache.has(normSrc) && !!src);

    useEffect(() => {
        if (!src) {
            setLoading(false);
            if (onLoad) onLoad();
            return;
        }

        const key = normalizePath(src);

        // If already in cache, just use it
        if (blobCache.has(key)) {
            setImageUrl(blobCache.get(key));
            setLoading(false);
            if (onLoad) onLoad();
            return;
        }

        let isMounted = true;

        const loadImage = async () => {
            try {
                const isExternal = src.startsWith('http') ||
                    src.startsWith('blob:') ||
                    src.startsWith('data:');

                if (isExternal) {
                    setImageUrl(src);
                    setLoading(false);
                    return;
                }

                const internalUrl = await preloadImage(src);

                if (isMounted && internalUrl) {
                    setImageUrl(internalUrl);
                    setLoading(false);
                } else if (isMounted) {
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    setLoading(false);
                    if (onLoad) onLoad();
                }
            }
        };

        loadImage();

        return () => {
            isMounted = false;
        };
    }, [src, onLoad]);

    if (loading) {
        return <div className={`${className} loading-shimmer`} style={style}></div>;
    }

    if (!imageUrl) {
        return <div className={className} style={style}>{fallback}</div>;
    }

    return <img src={imageUrl} alt={alt} className={className} style={style} onLoad={onLoad} loading="lazy" />;
};

export default SafeImage;
