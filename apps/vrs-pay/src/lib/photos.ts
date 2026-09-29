/**
 * Photography served from Unsplash's image CDN (imgix). The CDN negotiates
 * AVIF/WebP via `auto=format` and resizes on the fly, so we hand swift-rust's
 * <Image> a custom loader instead of the local optimizer.
 *
 * Photos are free under the Unsplash License. Swap `src` for self-hosted brand
 * photography before launch — the blur placeholders are 16px JPEGs of each.
 */

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL: string;
};

export const unsplashLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 70}`;

export const hills: Photo = {
  src: "https://images.unsplash.com/photo-1634664125468-6583a2cda747",
  alt: "Rolling green hills under a bright blue sky",
  width: 2048,
  height: 1152,
  blurDataURL:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wCEAAgJCQsOCw8QEA8UFhQWFB4bGRkbHiwgIiAiICxDKjEqKjEqQztIOzc7SDtqU0pKU2p6Z2JnepSFhZS6sbrz8/8BCAkJCw4LDxAQDxQWFBYUHhsZGRseLCAiICIgLEMqMSoqMSpDO0g7NztIO2pTSkpTanpnYmd6lIWFlLqxuvPz///AABEIAAkAEAMBIgACEQEDEQH/xABfAAEBAQAAAAAAAAAAAAAAAAADBAUQAAEEAQUBAAAAAAAAAAAAAAEAAgQRAwUhIjEyQQEBAQAAAAAAAAAAAAAAAAAABAURAAEEAwAAAAAAAAAAAAAAAAIAAQQRBRIy/9oADAMBAAIRAxEAPwBI0+LjO7nEV5IJTv1aBxpuVtfG3SwI/lVnoKWedlbcghDGBhq3X//Z",
};

export const meadow: Photo = {
  src: "https://images.unsplash.com/photo-1743220879718-cf018157e48b",
  alt: "A green meadow meeting a soft blue sky with drifting clouds",
  width: 1200,
  height: 800,
  blurDataURL:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wCEAAgJCQsOCw8QEA8UFhQWFB4bGRkbHiwgIiAiICxDKjEqKjEqQztIOzc7SDtqU0pKU2p6Z2JnepSFhZS6sbrz8/8BCAkJCw4LDxAQDxQWFBYUHhsZGRseLCAiICIgLEMqMSoqMSpDO0g7NztIO2pTSkpTanpnYmd6lIWFlLqxuvPz///AABEIAAsAEAMBIgACEQEDEQH/xABgAAEBAQAAAAAAAAAAAAAAAAAHAgQQAAEDBAIDAAAAAAAAAAAAAAIAAQQDERIxBRMzkrEBAQEAAAAAAAAAAAAAAAAAAAEFEQABBQEBAAAAAAAAAAAAAAABAAIDERIVgf/aAAwDAQACEQMRAD8AR6PeI5FpZpbkTWZ3xR4EyTbzH7Ooq8pODVc/qO3C12jEfFG0S2rK/9k=",
};

export const customer: Photo = {
  src: "https://images.unsplash.com/photo-1784881327545-eb6fc8f0c08d",
  alt: "A woman smiling at a payment notification on her phone",
  width: 640,
  height: 800,
  blurDataURL:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wCEAAgJCQsOCw8QEA8UFhQWFB4bGRkbHiwgIiAiICxDKjEqKjEqQztIOzc7SDtqU0pKU2p6Z2JnepSFhZS6sbrz8/8BCAkJCw4LDxAQDxQWFBYUHhsZGRseLCAiICIgLEMqMSoqMSpDO0g7NztIO2pTSkpTanpnYmd6lIWFlLqxuvPz///AABEIABgAEAMBIgACEQEDEQH/xABjAAACAwAAAAAAAAAAAAAAAAAABgMFBxAAAgEEAgIDAAAAAAAAAAAAAQIDAAQRIQUSEzEicXIBAQEBAAAAAAAAAAAAAAAAAAQBAxEAAwEBAQEAAAAAAAAAAAAAAQIDIQAREv/aAAwDAQACEQMRAD8AzC2sTNOI4fmcH0fdTvxz2lxAZkK4kAdTV6/GjjmS6TLorDsoO90x3nFz3k1q627tD0IOjo5ytDarB1zDy0ipizb9DmdYJRMieA4c/ar+qe0Reg3RRW85hT7u9a0ZgBmd/9k=",
};
