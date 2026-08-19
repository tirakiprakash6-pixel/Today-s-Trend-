export interface CategoryInfo {
  id: string;
  name: 'Men & woman Fashion' | 'Saree & jewelry' | 'Electronics & sports' | 'Kitchen items' | 'Custom products';
  displayName: string;
  subtitle: string;
  thumbnail: string;
  bannerImage: string;
  subcategories: string[];
  itemCount: number;
  iconName: string;
}

export const MAIN_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-fashion',
    name: 'Men & woman Fashion',
    displayName: 'Men & Woman Fashion',
    subtitle: 'Kurtis, Shirts, Western Wear & Jeans',
    thumbnail: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=80',
    subcategories: ['All', 'Women Ethnic Wear', 'Men Casual Wear', 'Western Wear', 'Men Bottomwear'],
    itemCount: 4,
    iconName: 'Shirt',
  },
  {
    id: 'cat-saree-jewelry',
    name: 'Saree & jewelry',
    displayName: 'Saree & Jewelry',
    subtitle: 'Silk Sarees, Kundan Sets, Organza & Jhumkas',
    thumbnail: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop&q=80',
    subcategories: ['All', 'Silk Sarees', 'Bridal & Festive Jewelry', 'Designer Sarees', 'Earrings & Jhumkas'],
    itemCount: 4,
    iconName: 'Sparkles',
  },
  {
    id: 'cat-electronics-sports',
    name: 'Electronics & sports',
    displayName: 'Electronics & Sports',
    subtitle: 'Earbuds, Smartwatches, Cricket Bats & Yoga Mats',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&auto=format&fit=crop&q=80',
    subcategories: ['All', 'Audio & Accessories', 'Wearables', 'Sports Gear', 'Fitness Equipment'],
    itemCount: 4,
    iconName: 'Headphones',
  },
  {
    id: 'cat-kitchen',
    name: 'Kitchen items',
    displayName: 'Kitchen Items',
    subtitle: 'Granite Cookware, Choppers, Jars & Flasks',
    thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1584990347449-35c91be83533?w=1200&auto=format&fit=crop&q=80',
    subcategories: ['All', 'Cookware Sets', 'Small Appliances', 'Kitchen Storage', 'Bottles & Flasks'],
    itemCount: 4,
    iconName: 'Utensils',
  },
  {
    id: 'cat-custom',
    name: 'Custom products',
    displayName: 'Custom Products',
    subtitle: 'Laser Engraved Gifts, Photo Mugs & Custom Tees',
    thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80',
    subcategories: ['All', 'Personalized Accessories', 'Customized Drinkware', 'Custom Home Decor', 'Personalized Apparel'],
    itemCount: 4,
    iconName: 'Gift',
  },
];
