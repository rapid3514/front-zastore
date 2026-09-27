export type FoodCategory = 'Burger' | 'Lavash' | 'Pizza' | 'Ichimlik' | 'Desert' | 'Salat'

export interface FoodProduct {
  id: string
  name: string
  description: string
  category: FoodCategory
  price: number
  availableToday: boolean
  imagePosition: string
}

export const foodCategories = ['Barchasi', 'Burger', 'Lavash', 'Pizza', 'Ichimlik', 'Desert', 'Salat'] as const

export const foodProducts: FoodProduct[] = [
  {
    id: 'cheeseburger',
    name: 'Cheeseburger',
    description: 'Mol go‘shti, cheddar, pomidor va maxsus sous',
    category: 'Burger',
    price: 42_000,
    availableToday: true,
    imagePosition: '0% 0%',
  },
  {
    id: 'chicken-lavash',
    name: 'Tovuqli lavash',
    description: 'Grill tovuq, yangi sabzavotlar va mayin sous',
    category: 'Lavash',
    price: 35_000,
    availableToday: true,
    imagePosition: '50% 0%',
  },
  {
    id: 'pepperoni-pizza',
    name: 'Pepperoni Pizza',
    description: 'Pepperoni, mozzarella va pomidor sousi',
    category: 'Pizza',
    price: 85_000,
    availableToday: false,
    imagePosition: '100% 0%',
  },
  {
    id: 'pepsi-05',
    name: 'Cola 0.5',
    description: 'Muzdek gazlangan ichimlik',
    category: 'Ichimlik',
    price: 10_000,
    availableToday: true,
    imagePosition: '0% 100%',
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    description: 'Mascarpone kremi, qahva va kakao',
    category: 'Desert',
    price: 28_000,
    availableToday: true,
    imagePosition: '50% 100%',
  },
  {
    id: 'caesar-salad',
    name: 'Caesar salati',
    description: 'Salat bargi, parmesan, kruton va Caesar sousi',
    category: 'Salat',
    price: 32_000,
    availableToday: false,
    imagePosition: '100% 100%',
  },
]

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat('uz-UZ').format(price)} so‘m`
}
