import type { Allergen, Macros, ProductCategory } from '@/types'

export interface BaseProduct {
  slug: string
  name: string
  /** Real brand name, or 'OWN_BRAND' to use the supermarket's own name. */
  brand: string
  category: ProductCategory
  size: string
  unitQuantity: number
  unit: 'g' | 'ml' | 'each'
  /** Baseline price (Tesco-equivalent) in GBP before the supermarket's multiplier. */
  basePrice: number
  /** Nutrition per 100g/100ml, or per item for unit === 'each'. */
  macros: Macros
  ingredientTags: string[]
  allergens: Allergen[]
}

const m = (calories: number, protein: number, carbs: number, fat: number): Macros => ({
  calories,
  protein,
  carbs,
  fat,
})

export const BASE_PRODUCTS: BaseProduct[] = [
  // ---- Meat & Fish ----
  { slug: 'chicken-breast', name: 'Chicken Breast Fillets', brand: 'OWN_BRAND', category: 'meat_fish', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 8.5, macros: m(165, 31, 0, 3.6), ingredientTags: ['chicken breast', 'chicken'], allergens: [] },
  { slug: 'chicken-thighs', name: 'Boneless Chicken Thighs', brand: 'OWN_BRAND', category: 'meat_fish', size: '650g', unitQuantity: 650, unit: 'g', basePrice: 5.2, macros: m(209, 26, 0, 10.9), ingredientTags: ['chicken thigh', 'chicken'], allergens: [] },
  { slug: 'beef-mince-5', name: 'British Beef Mince 5% Fat', brand: 'OWN_BRAND', category: 'meat_fish', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 5.0, macros: m(137, 21, 0, 5), ingredientTags: ['beef mince', 'mince', 'ground beef'], allergens: [] },
  { slug: 'turkey-mince', name: 'Turkey Breast Mince', brand: 'OWN_BRAND', category: 'meat_fish', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 4.3, macros: m(120, 27, 0, 1.5), ingredientTags: ['turkey mince', 'turkey'], allergens: [] },
  { slug: 'salmon-fillets', name: 'Scottish Salmon Fillets', brand: 'OWN_BRAND', category: 'meat_fish', size: '2 fillets, 240g', unitQuantity: 240, unit: 'g', basePrice: 6.5, macros: m(208, 20, 0, 13), ingredientTags: ['salmon'], allergens: ['fish'] },
  { slug: 'cod-fillets', name: 'Cod Fillets', brand: 'OWN_BRAND', category: 'meat_fish', size: '2 fillets, 260g', unitQuantity: 260, unit: 'g', basePrice: 5.8, macros: m(82, 18, 0, 0.7), ingredientTags: ['cod', 'white fish'], allergens: ['fish'] },
  { slug: 'tuna-steaks', name: 'Tuna Steaks', brand: 'OWN_BRAND', category: 'meat_fish', size: '2 steaks, 240g', unitQuantity: 240, unit: 'g', basePrice: 7.0, macros: m(144, 30, 0, 1), ingredientTags: ['tuna steak', 'tuna'], allergens: ['fish'] },
  { slug: 'tinned-tuna', name: 'Tuna Chunks in Spring Water', brand: 'John West', category: 'cupboard', size: '145g', unitQuantity: 145, unit: 'g', basePrice: 1.6, macros: m(116, 26, 0, 1), ingredientTags: ['tinned tuna', 'tuna'], allergens: ['fish'] },
  { slug: 'king-prawns', name: 'Raw King Prawns', brand: 'OWN_BRAND', category: 'meat_fish', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 4.5, macros: m(99, 20, 1, 1.4), ingredientTags: ['prawns', 'king prawns'], allergens: ['shellfish'] },
  { slug: 'bacon-medallions', name: 'Smoked Bacon Medallions', brand: 'OWN_BRAND', category: 'meat_fish', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 2.5, macros: m(145, 24, 0.5, 5), ingredientTags: ['bacon'], allergens: [] },
  { slug: 'pork-sausages', name: 'Pork Sausages', brand: 'OWN_BRAND', category: 'meat_fish', size: '6 pack, 400g', unitQuantity: 400, unit: 'g', basePrice: 2.8, macros: m(240, 13, 8, 18), ingredientTags: ['sausages', 'pork sausages'], allergens: ['wheat_gluten'] },
  { slug: 'lean-steak', name: 'Lean Rump Steak', brand: 'OWN_BRAND', category: 'meat_fish', size: '2 steaks, 280g', unitQuantity: 280, unit: 'g', basePrice: 7.5, macros: m(182, 27, 0, 8), ingredientTags: ['steak', 'beef steak'], allergens: [] },
  { slug: 'firm-tofu', name: 'Firm Tofu', brand: 'Cauldron', category: 'meat_fish', size: '396g', unitQuantity: 396, unit: 'g', basePrice: 2.2, macros: m(145, 15, 2, 9), ingredientTags: ['tofu'], allergens: ['soy'] },

  // ---- Dairy & Eggs ----
  { slug: 'free-range-eggs', name: 'British Free Range Eggs (6)', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '6 eggs', unitQuantity: 6, unit: 'each', basePrice: 2.1, macros: m(78, 6.5, 0.6, 5.3), ingredientTags: ['eggs', 'egg'], allergens: ['eggs'] },
  { slug: 'free-range-eggs-12', name: 'British Free Range Eggs (12)', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '12 eggs', unitQuantity: 12, unit: 'each', basePrice: 3.7, macros: m(78, 6.5, 0.6, 5.3), ingredientTags: ['eggs', 'egg'], allergens: ['eggs'] },
  { slug: 'greek-yoghurt', name: '0% Fat Greek Style Yoghurt', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 1.8, macros: m(57, 10, 3.6, 0.2), ingredientTags: ['greek yoghurt', 'yoghurt'], allergens: ['milk'] },
  { slug: 'natural-yoghurt', name: 'Natural Yoghurt', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 1.2, macros: m(61, 4.8, 4.7, 3.2), ingredientTags: ['natural yoghurt', 'yoghurt'], allergens: ['milk'] },
  { slug: 'semi-skimmed-milk', name: 'Semi Skimmed Milk', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '2 pint / 1.1L', unitQuantity: 1136, unit: 'ml', basePrice: 1.3, macros: m(46, 3.4, 4.8, 1.7), ingredientTags: ['milk'], allergens: ['milk'] },
  { slug: 'almond-milk', name: 'Unsweetened Almond Milk', brand: 'Alpro', category: 'dairy_eggs', size: '1L', unitQuantity: 1000, unit: 'ml', basePrice: 1.7, macros: m(13, 0.4, 0.1, 1.1), ingredientTags: ['almond milk', 'milk'], allergens: ['tree_nuts'] },
  { slug: 'oat-milk', name: 'Oat Drink', brand: 'Oatly', category: 'dairy_eggs', size: '1L', unitQuantity: 1000, unit: 'ml', basePrice: 1.9, macros: m(45, 1, 6.6, 1.5), ingredientTags: ['oat milk', 'milk'], allergens: [] },
  { slug: 'mature-cheddar', name: 'Mature Cheddar', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '400g', unitQuantity: 400, unit: 'g', basePrice: 3.4, macros: m(416, 25, 0.1, 35), ingredientTags: ['cheddar', 'cheese'], allergens: ['milk'] },
  { slug: 'mozzarella', name: 'Mozzarella', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '250g', unitQuantity: 250, unit: 'g', basePrice: 1.9, macros: m(280, 22, 2, 21), ingredientTags: ['mozzarella', 'cheese'], allergens: ['milk'] },
  { slug: 'feta', name: 'Feta Cheese', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 2.1, macros: m(264, 14, 4, 21), ingredientTags: ['feta', 'cheese'], allergens: ['milk'] },
  { slug: 'cottage-cheese', name: 'Cottage Cheese', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '300g', unitQuantity: 300, unit: 'g', basePrice: 1.6, macros: m(98, 11, 3.1, 4.3), ingredientTags: ['cottage cheese'], allergens: ['milk'] },
  { slug: 'butter', name: 'Salted Butter', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '250g', unitQuantity: 250, unit: 'g', basePrice: 2.3, macros: m(744, 0.6, 0.6, 82), ingredientTags: ['butter'], allergens: ['milk'] },
  { slug: 'halloumi', name: 'Halloumi', brand: 'OWN_BRAND', category: 'dairy_eggs', size: '225g', unitQuantity: 225, unit: 'g', basePrice: 2.6, macros: m(320, 22, 2, 25), ingredientTags: ['halloumi'], allergens: ['milk'] },

  // ---- Carbohydrates ----
  { slug: 'basmati-rice', name: 'Basmati Rice', brand: 'OWN_BRAND', category: 'carbohydrates', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 2.1, macros: m(349, 7.5, 78, 0.6), ingredientTags: ['rice', 'basmati rice'], allergens: [] },
  { slug: 'brown-rice', name: 'Wholegrain Brown Rice', brand: 'OWN_BRAND', category: 'carbohydrates', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 1.9, macros: m(357, 7.9, 76, 2.8), ingredientTags: ['brown rice', 'rice'], allergens: [] },
  { slug: 'fusilli-pasta', name: 'Fusilli Pasta', brand: 'OWN_BRAND', category: 'carbohydrates', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 1.0, macros: m(353, 12, 71, 1.5), ingredientTags: ['pasta', 'fusilli'], allergens: ['wheat_gluten'] },
  { slug: 'wholewheat-pasta', name: 'Wholewheat Penne', brand: 'OWN_BRAND', category: 'carbohydrates', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 1.1, macros: m(348, 13, 66, 2.5), ingredientTags: ['pasta', 'penne'], allergens: ['wheat_gluten'] },
  { slug: 'wholemeal-bread', name: 'Wholemeal Bread', brand: 'Warburtons', category: 'carbohydrates', size: '800g', unitQuantity: 800, unit: 'g', basePrice: 1.5, macros: m(219, 10, 39, 2), ingredientTags: ['bread', 'wholemeal bread'], allergens: ['wheat_gluten'] },
  { slug: 'seeded-bread', name: 'Seeded Batch Bread', brand: 'Warburtons', category: 'carbohydrates', size: '800g', unitQuantity: 800, unit: 'g', basePrice: 1.7, macros: m(245, 11, 37, 5), ingredientTags: ['bread', 'seeded bread'], allergens: ['wheat_gluten', 'sesame'] },
  { slug: 'porridge-oats', name: 'Porridge Oats', brand: 'Quaker', category: 'carbohydrates', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 1.9, macros: m(367, 11, 60, 7), ingredientTags: ['oats', 'porridge oats'], allergens: [] },
  { slug: 'sweet-potato', name: 'Sweet Potatoes', brand: 'OWN_BRAND', category: 'produce', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 1.6, macros: m(86, 1.6, 20, 0.1), ingredientTags: ['sweet potato'], allergens: [] },
  { slug: 'white-potatoes', name: 'White Potatoes', brand: 'OWN_BRAND', category: 'produce', size: '2.5kg', unitQuantity: 2500, unit: 'g', basePrice: 2.0, macros: m(77, 2, 17, 0.1), ingredientTags: ['potato', 'potatoes'], allergens: [] },
  { slug: 'quinoa', name: 'Quinoa', brand: 'OWN_BRAND', category: 'carbohydrates', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 2.6, macros: m(368, 14, 64, 6), ingredientTags: ['quinoa'], allergens: [] },
  { slug: 'tortilla-wraps', name: 'Tortilla Wraps (8)', brand: 'OWN_BRAND', category: 'carbohydrates', size: '8 wraps', unitQuantity: 8, unit: 'each', basePrice: 1.3, macros: m(280, 8, 46, 6), ingredientTags: ['tortilla', 'wrap', 'tortilla wraps'], allergens: ['wheat_gluten'] },
  { slug: 'wholemeal-wraps', name: 'Wholemeal Tortilla Wraps (8)', brand: 'OWN_BRAND', category: 'carbohydrates', size: '8 wraps', unitQuantity: 8, unit: 'each', basePrice: 1.5, macros: m(260, 9, 42, 5), ingredientTags: ['wholemeal wrap', 'tortilla', 'wrap'], allergens: ['wheat_gluten'] },
  { slug: 'gluten-free-bread', name: 'Gluten Free Bread', brand: 'Genius', category: 'carbohydrates', size: '400g', unitQuantity: 400, unit: 'g', basePrice: 2.8, macros: m(230, 4, 45, 3), ingredientTags: ['gluten free bread', 'bread'], allergens: [] },
  { slug: 'gluten-free-pasta', name: 'Gluten Free Fusilli', brand: 'OWN_BRAND', category: 'carbohydrates', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 1.6, macros: m(360, 7, 79, 1.6), ingredientTags: ['gluten free pasta', 'pasta'], allergens: [] },
  { slug: 'couscous', name: 'Couscous', brand: 'OWN_BRAND', category: 'carbohydrates', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 1.1, macros: m(376, 13, 77, 1.1), ingredientTags: ['couscous'], allergens: ['wheat_gluten'] },

  // ---- Produce ----
  { slug: 'bananas', name: 'Bananas (5)', brand: 'OWN_BRAND', category: 'produce', size: '5 pack', unitQuantity: 5, unit: 'each', basePrice: 0.9, macros: m(89, 1.1, 23, 0.3), ingredientTags: ['banana', 'bananas'], allergens: [] },
  { slug: 'apples', name: 'Gala Apples (6)', brand: 'OWN_BRAND', category: 'produce', size: '6 pack', unitQuantity: 6, unit: 'each', basePrice: 1.8, macros: m(52, 0.3, 14, 0.2), ingredientTags: ['apple', 'apples'], allergens: [] },
  { slug: 'spinach', name: 'Baby Spinach', brand: 'OWN_BRAND', category: 'produce', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 1.3, macros: m(23, 2.9, 3.6, 0.4), ingredientTags: ['spinach'], allergens: [] },
  { slug: 'broccoli', name: 'Broccoli', brand: 'OWN_BRAND', category: 'produce', size: '350g', unitQuantity: 350, unit: 'g', basePrice: 1.1, macros: m(34, 2.8, 7, 0.4), ingredientTags: ['broccoli'], allergens: [] },
  { slug: 'peppers', name: 'Mixed Peppers (3)', brand: 'OWN_BRAND', category: 'produce', size: '3 pack', unitQuantity: 3, unit: 'each', basePrice: 1.5, macros: m(31, 1, 6, 0.3), ingredientTags: ['pepper', 'peppers'], allergens: [] },
  { slug: 'onions', name: 'Onions (1kg)', brand: 'OWN_BRAND', category: 'produce', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 1.0, macros: m(40, 1.1, 9, 0.1), ingredientTags: ['onion', 'onions'], allergens: [] },
  { slug: 'garlic', name: 'Garlic Bulbs (3)', brand: 'OWN_BRAND', category: 'produce', size: '3 pack', unitQuantity: 3, unit: 'each', basePrice: 0.7, macros: m(149, 6.4, 33, 0.5), ingredientTags: ['garlic'], allergens: [] },
  { slug: 'tomatoes', name: 'Salad Tomatoes', brand: 'OWN_BRAND', category: 'produce', size: '6 pack', unitQuantity: 6, unit: 'each', basePrice: 1.4, macros: m(18, 0.9, 3.9, 0.2), ingredientTags: ['tomato', 'tomatoes'], allergens: [] },
  { slug: 'avocado', name: 'Avocados (2)', brand: 'OWN_BRAND', category: 'produce', size: '2 pack', unitQuantity: 2, unit: 'each', basePrice: 2.0, macros: m(160, 2, 8.5, 15), ingredientTags: ['avocado'], allergens: [] },
  { slug: 'mixed-berries', name: 'Mixed Berries', brand: 'OWN_BRAND', category: 'produce', size: '300g', unitQuantity: 300, unit: 'g', basePrice: 2.5, macros: m(48, 0.8, 11, 0.3), ingredientTags: ['berries', 'mixed berries'], allergens: [] },
  { slug: 'carrots', name: 'Carrots (1kg)', brand: 'OWN_BRAND', category: 'produce', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 0.7, macros: m(41, 0.9, 10, 0.2), ingredientTags: ['carrot', 'carrots'], allergens: [] },
  { slug: 'cucumber', name: 'Cucumber', brand: 'OWN_BRAND', category: 'produce', size: 'each', unitQuantity: 1, unit: 'each', basePrice: 0.6, macros: m(15, 0.7, 3.6, 0.1), ingredientTags: ['cucumber'], allergens: [] },
  { slug: 'mushrooms', name: 'Chestnut Mushrooms', brand: 'OWN_BRAND', category: 'produce', size: '300g', unitQuantity: 300, unit: 'g', basePrice: 1.2, macros: m(22, 3.1, 3.3, 0.3), ingredientTags: ['mushroom', 'mushrooms'], allergens: [] },
  { slug: 'lemons', name: 'Lemons (4)', brand: 'OWN_BRAND', category: 'produce', size: '4 pack', unitQuantity: 4, unit: 'each', basePrice: 1.2, macros: m(29, 1.1, 9, 0.3), ingredientTags: ['lemon', 'lemons'], allergens: [] },
  { slug: 'salad-bag', name: 'Mixed Salad Leaves', brand: 'OWN_BRAND', category: 'produce', size: '150g', unitQuantity: 150, unit: 'g', basePrice: 1.2, macros: m(15, 1.4, 2.1, 0.2), ingredientTags: ['salad', 'mixed leaves'], allergens: [] },

  // ---- Cupboard ----
  { slug: 'olive-oil', name: 'Extra Virgin Olive Oil', brand: 'OWN_BRAND', category: 'cupboard', size: '500ml', unitQuantity: 500, unit: 'ml', basePrice: 4.5, macros: m(884, 0, 0, 100), ingredientTags: ['olive oil'], allergens: [] },
  { slug: 'peanut-butter', name: 'Smooth Peanut Butter', brand: 'OWN_BRAND', category: 'cupboard', size: '340g', unitQuantity: 340, unit: 'g', basePrice: 2.0, macros: m(597, 25, 13, 50), ingredientTags: ['peanut butter'], allergens: ['peanuts'] },
  { slug: 'almond-butter', name: 'Almond Butter', brand: 'Meridian', category: 'cupboard', size: '170g', unitQuantity: 170, unit: 'g', basePrice: 3.2, macros: m(614, 21, 12, 56), ingredientTags: ['almond butter'], allergens: ['tree_nuts'] },
  { slug: 'honey', name: 'Clear Honey', brand: 'OWN_BRAND', category: 'cupboard', size: '340g', unitQuantity: 340, unit: 'g', basePrice: 2.1, macros: m(304, 0.3, 76, 0), ingredientTags: ['honey'], allergens: [] },
  { slug: 'soy-sauce', name: 'Soy Sauce', brand: 'Kikkoman', category: 'cupboard', size: '250ml', unitQuantity: 250, unit: 'ml', basePrice: 2.4, macros: m(53, 8, 6, 0), ingredientTags: ['soy sauce'], allergens: ['soy', 'wheat_gluten'] },
  { slug: 'mixed-nuts', name: 'Mixed Nuts', brand: 'OWN_BRAND', category: 'snacks', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 2.6, macros: m(607, 20, 15, 53), ingredientTags: ['mixed nuts', 'nuts'], allergens: ['tree_nuts', 'peanuts'] },
  { slug: 'almonds', name: 'Whole Almonds', brand: 'OWN_BRAND', category: 'snacks', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 2.4, macros: m(579, 21, 22, 50), ingredientTags: ['almonds'], allergens: ['tree_nuts'] },
  { slug: 'chia-seeds', name: 'Chia Seeds', brand: 'OWN_BRAND', category: 'cupboard', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 2.3, macros: m(486, 17, 42, 31), ingredientTags: ['chia seeds', 'chia'], allergens: [] },
  { slug: 'whey-protein', name: 'Whey Protein Powder Vanilla', brand: 'OWN_BRAND', category: 'cupboard', size: '900g', unitQuantity: 900, unit: 'g', basePrice: 19.99, macros: m(380, 76, 8, 6), ingredientTags: ['protein powder', 'whey protein'], allergens: ['milk'] },
  { slug: 'chickpeas-tin', name: 'Chickpeas in Water', brand: 'OWN_BRAND', category: 'cupboard', size: '400g', unitQuantity: 400, unit: 'g', basePrice: 0.55, macros: m(115, 7.6, 18, 2), ingredientTags: ['chickpeas'], allergens: [] },
  { slug: 'kidney-beans-tin', name: 'Red Kidney Beans in Water', brand: 'OWN_BRAND', category: 'cupboard', size: '400g', unitQuantity: 400, unit: 'g', basePrice: 0.55, macros: m(127, 8.7, 17, 0.5), ingredientTags: ['kidney beans'], allergens: [] },
  { slug: 'chopped-tomatoes', name: 'Chopped Tomatoes', brand: 'OWN_BRAND', category: 'cupboard', size: '400g', unitQuantity: 400, unit: 'g', basePrice: 0.45, macros: m(32, 1.6, 5.3, 0.3), ingredientTags: ['tinned tomatoes', 'chopped tomatoes'], allergens: [] },
  { slug: 'sweetcorn-tin', name: 'Sweetcorn', brand: 'OWN_BRAND', category: 'cupboard', size: '325g', unitQuantity: 325, unit: 'g', basePrice: 0.6, macros: m(86, 2.9, 19, 1.2), ingredientTags: ['sweetcorn'], allergens: [] },
  { slug: 'stock-cubes', name: 'Chicken Stock Cubes', brand: 'Knorr', category: 'cupboard', size: '10 cubes', unitQuantity: 10, unit: 'each', basePrice: 1.2, macros: m(238, 8, 25, 12), ingredientTags: ['stock cube', 'chicken stock'], allergens: ['wheat_gluten'] },
  { slug: 'mixed-herbs', name: 'Dried Mixed Herbs', brand: 'Schwartz', category: 'cupboard', size: '11g', unitQuantity: 11, unit: 'g', basePrice: 1.0, macros: m(300, 10, 50, 5), ingredientTags: ['mixed herbs', 'herbs'], allergens: [] },
  { slug: 'paprika', name: 'Smoked Paprika', brand: 'Schwartz', category: 'cupboard', size: '38g', unitQuantity: 38, unit: 'g', basePrice: 1.3, macros: m(282, 14, 54, 13), ingredientTags: ['paprika'], allergens: [] },
  { slug: 'cumin', name: 'Ground Cumin', brand: 'Schwartz', category: 'cupboard', size: '43g', unitQuantity: 43, unit: 'g', basePrice: 1.3, macros: m(375, 18, 44, 22), ingredientTags: ['cumin'], allergens: [] },
  { slug: 'curry-powder', name: 'Medium Curry Powder', brand: 'Schwartz', category: 'cupboard', size: '75g', unitQuantity: 75, unit: 'g', basePrice: 1.4, macros: m(325, 14, 40, 14), ingredientTags: ['curry powder'], allergens: [] },
  { slug: 'balsamic-vinegar', name: 'Balsamic Vinegar', brand: 'OWN_BRAND', category: 'cupboard', size: '250ml', unitQuantity: 250, unit: 'ml', basePrice: 1.6, macros: m(88, 0.5, 17, 0), ingredientTags: ['balsamic vinegar', 'vinegar'], allergens: [] },
  { slug: 'dijon-mustard', name: 'Dijon Mustard', brand: 'OWN_BRAND', category: 'cupboard', size: '190g', unitQuantity: 190, unit: 'g', basePrice: 1.1, macros: m(66, 4.4, 4, 3.7), ingredientTags: ['mustard'], allergens: [] },
  { slug: 'hummus', name: 'Original Hummus', brand: 'OWN_BRAND', category: 'cupboard', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 1.3, macros: m(280, 7, 12, 24), ingredientTags: ['hummus'], allergens: ['sesame'] },
  { slug: 'lentils-red', name: 'Dried Red Split Lentils', brand: 'OWN_BRAND', category: 'cupboard', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 1.3, macros: m(352, 25, 60, 1.5), ingredientTags: ['lentils', 'red lentils'], allergens: [] },

  // ---- Frozen ----
  { slug: 'frozen-peas', name: 'Garden Peas', brand: 'OWN_BRAND', category: 'frozen', size: '900g', unitQuantity: 900, unit: 'g', basePrice: 1.4, macros: m(79, 5.4, 11, 0.9), ingredientTags: ['peas', 'frozen peas'], allergens: [] },
  { slug: 'frozen-mixed-veg', name: 'Mixed Vegetables', brand: 'OWN_BRAND', category: 'frozen', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 1.6, macros: m(58, 3, 10, 0.5), ingredientTags: ['mixed vegetables', 'frozen veg'], allergens: [] },
  { slug: 'frozen-berries', name: 'Frozen Mixed Berries', brand: 'OWN_BRAND', category: 'frozen', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 2.2, macros: m(45, 0.8, 10, 0.3), ingredientTags: ['frozen berries', 'berries'], allergens: [] },
  { slug: 'frozen-chicken-breast', name: 'Frozen Chicken Breast Fillets', brand: 'OWN_BRAND', category: 'frozen', size: '1kg', unitQuantity: 1000, unit: 'g', basePrice: 6.8, macros: m(165, 31, 0, 3.6), ingredientTags: ['chicken breast', 'chicken'], allergens: [] },
  { slug: 'frozen-prawns', name: 'Frozen King Prawns', brand: 'OWN_BRAND', category: 'frozen', size: '300g', unitQuantity: 300, unit: 'g', basePrice: 4.8, macros: m(99, 20, 1, 1.4), ingredientTags: ['prawns'], allergens: ['shellfish'] },
  { slug: 'ice-cream', name: 'Vanilla Ice Cream', brand: 'OWN_BRAND', category: 'frozen', size: '900ml', unitQuantity: 900, unit: 'ml', basePrice: 2.5, macros: m(207, 3.5, 24, 11), ingredientTags: ['ice cream'], allergens: ['milk', 'eggs'] },
  { slug: 'frozen-sweet-potato-fries', name: 'Sweet Potato Fries', brand: 'OWN_BRAND', category: 'frozen', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 2.2, macros: m(155, 1.8, 24, 5.5), ingredientTags: ['sweet potato fries'], allergens: [] },

  // ---- Snacks ----
  { slug: 'protein-bar', name: 'Protein Bar Chocolate', brand: 'OWN_BRAND', category: 'snacks', size: '60g', unitQuantity: 60, unit: 'g', basePrice: 1.5, macros: m(375, 30, 33, 13), ingredientTags: ['protein bar'], allergens: ['milk', 'soy'] },
  { slug: 'rice-cakes', name: 'Thin Rice Cakes', brand: 'OWN_BRAND', category: 'snacks', size: '130g', unitQuantity: 130, unit: 'g', basePrice: 0.85, macros: m(387, 8, 82, 3), ingredientTags: ['rice cakes'], allergens: [] },
  { slug: 'dark-chocolate', name: 'Dark Chocolate 70%', brand: 'OWN_BRAND', category: 'snacks', size: '100g', unitQuantity: 100, unit: 'g', basePrice: 1.6, macros: m(598, 7.8, 45, 42), ingredientTags: ['dark chocolate', 'chocolate'], allergens: ['milk'] },
  { slug: 'granola', name: 'Fruit & Nut Granola', brand: 'OWN_BRAND', category: 'snacks', size: '500g', unitQuantity: 500, unit: 'g', basePrice: 2.4, macros: m(451, 10, 64, 17), ingredientTags: ['granola'], allergens: ['tree_nuts', 'wheat_gluten'] },
  { slug: 'tortilla-chips', name: 'Lightly Salted Tortilla Chips', brand: 'OWN_BRAND', category: 'snacks', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 1.4, macros: m(489, 7, 63, 24), ingredientTags: ['tortilla chips'], allergens: [] },
  { slug: 'salsa', name: 'Medium Salsa Dip', brand: 'OWN_BRAND', category: 'cupboard', size: '300g', unitQuantity: 300, unit: 'g', basePrice: 1.5, macros: m(45, 1.4, 9, 0.3), ingredientTags: ['salsa'], allergens: [] },
  { slug: 'edamame', name: 'Frozen Edamame Beans', brand: 'OWN_BRAND', category: 'frozen', size: '300g', unitQuantity: 300, unit: 'g', basePrice: 1.8, macros: m(121, 11, 9, 5), ingredientTags: ['edamame'], allergens: ['soy'] },
  { slug: 'popcorn', name: 'Lightly Salted Popcorn', brand: 'OWN_BRAND', category: 'snacks', size: '80g', unitQuantity: 80, unit: 'g', basePrice: 1.2, macros: m(487, 7, 58, 25), ingredientTags: ['popcorn'], allergens: [] },
  { slug: 'green-beans', name: 'Fine Green Beans', brand: 'OWN_BRAND', category: 'produce', size: '200g', unitQuantity: 200, unit: 'g', basePrice: 1.3, macros: m(31, 1.8, 7, 0.2), ingredientTags: ['green beans'], allergens: [] },

  // ---- Drinks ----
  { slug: 'orange-juice', name: 'Smooth Orange Juice', brand: 'OWN_BRAND', category: 'drinks', size: '1L', unitQuantity: 1000, unit: 'ml', basePrice: 1.6, macros: m(45, 0.7, 10, 0.1), ingredientTags: ['orange juice'], allergens: [] },
  { slug: 'sparkling-water', name: 'Sparkling Water', brand: 'OWN_BRAND', category: 'drinks', size: '6x500ml', unitQuantity: 3000, unit: 'ml', basePrice: 1.8, macros: m(0, 0, 0, 0), ingredientTags: ['sparkling water'], allergens: [] },
  { slug: 'coconut-water', name: 'Coconut Water', brand: 'Vita Coco', category: 'drinks', size: '1L', unitQuantity: 1000, unit: 'ml', basePrice: 2.6, macros: m(19, 0.2, 4, 0.1), ingredientTags: ['coconut water'], allergens: [] },
]
