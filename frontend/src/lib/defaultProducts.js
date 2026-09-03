export const DEFAULT_PRODUCTS = [
  {
    id: "prod_1",
    name: "Aashirvaad Shudh Chakki Atta 5kg",
    category: "Kirana & Grains",
    selling_price: 245,
    purchase_price: 210,
    stock: 24,
    min_stock: 5,
    unlimited_stock: false
  },
  {
    id: "prod_2",
    name: "Fortune Sunlite Sunflower Oil 1L",
    category: "Edible Oil & Ghee",
    selling_price: 145,
    purchase_price: 128,
    stock: 18,
    min_stock: 6,
    unlimited_stock: false
  },
  {
    id: "prod_3",
    name: "Amul Taaza Toned Fresh Milk 500ml",
    category: "Dairy & Eggs",
    selling_price: 27,
    purchase_price: 24,
    stock: 35,
    min_stock: 10,
    unlimited_stock: false
  },
  {
    id: "prod_4",
    name: "Tata Salt Vacuum Evaporated 1kg",
    category: "Kirana & Grains",
    selling_price: 28,
    purchase_price: 22,
    stock: 40,
    min_stock: 8,
    unlimited_stock: false
  },
  {
    id: "prod_5",
    name: "Parle-G Gold Glucose Biscuit 250g",
    category: "Biscuits & Snacks",
    selling_price: 30,
    purchase_price: 25,
    stock: 50,
    min_stock: 10,
    unlimited_stock: false
  },
  {
    id: "prod_6",
    name: "Maggi 2-Minute Masala Noodles 70g",
    category: "Biscuits & Snacks",
    selling_price: 14,
    purchase_price: 11,
    stock: 60,
    min_stock: 15,
    unlimited_stock: false
  },
  {
    id: "prod_7",
    name: "MDH Deggi Mirch Powder 100g",
    category: "Spices & Masala",
    selling_price: 88,
    purchase_price: 72,
    stock: 15,
    min_stock: 4,
    unlimited_stock: false
  },
  {
    id: "prod_8",
    name: "Wagh Bakri Premium CTC Tea 500g",
    category: "Beverages & Tea",
    selling_price: 260,
    purchase_price: 225,
    stock: 12,
    min_stock: 5,
    unlimited_stock: false
  },
  {
    id: "prod_9",
    name: "Dettol Original Bathing Soap 75g",
    category: "Household & Soaps",
    selling_price: 40,
    purchase_price: 32,
    stock: 22,
    min_stock: 5,
    unlimited_stock: false
  },
  {
    id: "prod_10",
    name: "Fresh Cutting Chai (Hot)",
    category: "Beverages & Tea",
    selling_price: 10,
    purchase_price: 4,
    stock: 0,
    min_stock: 0,
    unlimited_stock: true
  }
];

export const getStoredProducts = () => {
  try {
    const raw = localStorage.getItem("dukaan_products");
    if (!raw) {
      localStorage.setItem("dukaan_products", JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    localStorage.setItem("dukaan_products", JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

export const saveStoredProducts = (products) => {
  try {
    if (Array.isArray(products)) {
      localStorage.setItem("dukaan_products", JSON.stringify(products));
    }
  } catch {}
};
