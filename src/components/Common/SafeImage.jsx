import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../config';

const SafeImage = ({ src, alt, className, style, fallback = '🍽️', onLoad }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!src) {
            setLoading(false);
            if (onLoad) onLoad(); // Trigger onLoad if no src
            return;
        }

        let isMounted = true;
        let internalUrl = null;

        const loadImage = async () => {
            try {
                // Ensure src is relative to the API base for apiFetch to work
                // Unless it's already a full URL, blob, or data URL
                const isExternal = src.startsWith('http') ||
                    src.startsWith('blob:') ||
                    src.startsWith('data:');

                if (isExternal) {
                    setImageUrl(src);
                    setLoading(false);
                    return;
                }

                const endpoint = `/storage/${src.replace('storage/', '').replace(/^\//, '')}`;
                const response = await apiFetch(endpoint);

                if (!response.ok) {
                    throw new Error(`Failed to load: ${response.status}`);
                }

                const blob = await response.blob();

                // Safety check for empty or non-image blobs
                if (blob.size < 100 || !blob.type.startsWith('image/')) {
                    throw new Error('Invalid image blob');
                }

                internalUrl = URL.createObjectURL(blob);

                if (isMounted) {
                    setImageUrl(internalUrl);
                    setLoading(false);
                    // onLoad will be triggered by img tag
                }
            } catch (error) {
                if (isMounted) {
                    setLoading(false);
                    if (onLoad) onLoad(); // Trigger even on error so it's not stuck
                }
            }
        };

        loadImage();

        return () => {
            isMounted = false;
            if (internalUrl) {
                URL.revokeObjectURL(internalUrl);
            }
        };
    }, [src, onLoad]);

    if (loading) {
        return <div className={`${className} loading-shimmer`} style={style}></div>;
    }

    if (!imageUrl) {
        return <div className={className} style={style}>{fallback}</div>;
    }

    return <img src={imageUrl} alt={alt} className={className} style={style} onLoad={onLoad} />;
};

export default SafeImage;
