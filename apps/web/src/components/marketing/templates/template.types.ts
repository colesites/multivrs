/** A published template as rendered by the marketplace grid and detail sheet. */
export type MarketplaceTemplate = {
  _id: string;
  name: string;
  description: string;
  category: string;
  stack: string[];
  price: number;
  previewUrl?: string;
  imageUrl?: string;
  likes?: number;
  views?: number;
  seller?: {
    name: string;
    image?: string | null;
    username?: string;
  } | null;
};
