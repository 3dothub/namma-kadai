import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: number;
  name: string;
  price: number;
  offerPrice?: number;
  image: string;
  description: string;
  deliveryTime: string;
  vendorName: string;
  isFavorite?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Vendor {
  id: number;
  name: string;
  category: string;
  image: string;
  products: Product[];
}

interface ProductState {
  vendors: Vendor[];
  products: Product[];
  favorites: Product[];
  cart: CartItem[];
}

// Mock initial data
const initialVendors: Vendor[] = [
  {
    id: 1,
    name: 'Bags Minerals',
    category: 'Water Supply',
    image: 'assets/icon.png',
    products: [
      { 
        id: 1, 
        name: '20 Litre Can', 
        price: 40, 
        offerPrice: 35,
        image: 'assets/icon.png',
        description: 'Fresh and pure 20L water can',
        deliveryTime: '30 mins',
        vendorName: 'Bags Minerals',
        isFavorite: false
      },
      { 
        id: 2, 
        name: '5 Litre Can', 
        price: 20, 
        offerPrice: 18,
        image: 'assets/icon.png',
        description: 'Fresh and pure 5L water can',
        deliveryTime: '30 mins',
        vendorName: 'Bags Minerals',
        isFavorite: false
      },
      { 
        id: 3, 
        name: '1 Litre Bottle', 
        price: 15, 
        offerPrice: 12,
        image: 'assets/icon.png',
        description: 'Fresh and pure 1L water bottle',
        deliveryTime: '30 mins',
        vendorName: 'Bags Minerals',
        isFavorite: false
      },
      { 
        id: 4, 
        name: '500ml Bottle Pack', 
        price: 120, 
        offerPrice: 100,
        image: 'assets/icon.png',
        description: 'Pack of 12 500ml water bottles',
        deliveryTime: '30 mins',
        vendorName: 'Bags Minerals',
        isFavorite: false
      }
    ]
  },
  {
    id: 2,
    name: 'A1 Cake Shop',
    category: 'Bakery',
    image: 'assets/icon.png',
    products: [
      { 
        id: 5, 
        name: 'Chocolate Cake', 
        price: 450, 
        offerPrice: 400,
        image: 'assets/icon.png',
        description: 'Delicious chocolate cake',
        deliveryTime: '45 mins',
        vendorName: 'A1 Cake Shop',
        isFavorite: false
      },
      { 
        id: 6, 
        name: 'Vanilla Cake', 
        price: 400, 
        offerPrice: 350,
        image: 'assets/icon.png',
        description: 'Fresh vanilla cake',
        deliveryTime: '45 mins',
        vendorName: 'A1 Cake Shop',
        isFavorite: false
      },
      { 
        id: 7, 
        name: 'Red Velvet Cake', 
        price: 600, 
        offerPrice: 550,
        image: 'assets/icon.png',
        description: 'Premium red velvet cake',
        deliveryTime: '45 mins',
        vendorName: 'A1 Cake Shop',
        isFavorite: false
      },
      { 
        id: 8, 
        name: 'Fruit Cake', 
        price: 500, 
        offerPrice: 450,
        image: 'assets/icon.png',
        description: 'Fresh fruit cake with seasonal fruits',
        deliveryTime: '45 mins',
        vendorName: 'A1 Cake Shop',
        isFavorite: false
      },
      { 
        id: 9, 
        name: 'Black Forest', 
        price: 550, 
        offerPrice: 500,
        image: 'assets/icon.png',
        description: 'Classic black forest cake',
        deliveryTime: '45 mins',
        vendorName: 'A1 Cake Shop',
        isFavorite: false
      }
    ]
  },
  {
    id: 3,
    name: "Komala's Kitchen",
    category: 'Home Food',
    image: 'assets/icon.png',
    products: [
      { 
        id: 10, 
        name: 'South Indian Thali', 
        price: 120, 
        offerPrice: 100,
        image: 'assets/icon.png',
        description: 'Traditional South Indian thali',
        deliveryTime: '25 mins',
        vendorName: "Komala's Kitchen",
        isFavorite: false
      },
      { 
        id: 11, 
        name: 'Sambar Rice', 
        price: 80, 
        offerPrice: 70,
        image: 'assets/icon.png',
        description: 'Homemade sambar rice',
        deliveryTime: '20 mins',
        vendorName: "Komala's Kitchen",
        isFavorite: false
      },
      { 
        id: 12, 
        name: 'Curd Rice', 
        price: 70, 
        offerPrice: 60,
        image: 'assets/icon.png',
        description: 'Fresh curd rice with tempering',
        deliveryTime: '20 mins',
        vendorName: "Komala's Kitchen",
        isFavorite: false
      },
      { 
        id: 13, 
        name: 'Veg Biryani', 
        price: 140, 
        offerPrice: 120,
        image: 'assets/icon.png',
        description: 'Fragrant vegetable biryani',
        deliveryTime: '30 mins',
        vendorName: "Komala's Kitchen",
        isFavorite: false
      },
      { 
        id: 14, 
        name: 'Chapati Set', 
        price: 90, 
        offerPrice: 80,
        image: 'assets/icon.png',
        description: '4 chapatis with curry',
        deliveryTime: '25 mins',
        vendorName: "Komala's Kitchen",
        isFavorite: false
      }
    ]
  },
  {
    id: 4,
    name: "Fresh Juice Bar",
    category: 'Beverages',
    image: 'assets/icon.png',
    products: [
      { 
        id: 15, 
        name: 'Fresh Orange Juice', 
        price: 60, 
        offerPrice: 50,
        image: 'assets/icon.png',
        description: 'Fresh squeezed orange juice',
        deliveryTime: '20 mins',
        vendorName: "Fresh Juice Bar",
        isFavorite: false
      },
      { 
        id: 16, 
        name: 'Watermelon Juice', 
        price: 50, 
        offerPrice: 40,
        image: 'assets/icon.png',
        description: 'Refreshing watermelon juice',
        deliveryTime: '20 mins',
        vendorName: "Fresh Juice Bar",
        isFavorite: false
      },
      { 
        id: 17, 
        name: 'Mixed Fruit Juice', 
        price: 70, 
        offerPrice: 60,
        image: 'assets/icon.png',
        description: 'Blend of seasonal fruits',
        deliveryTime: '20 mins',
        vendorName: "Fresh Juice Bar",
        isFavorite: false
      }
    ]
  }
];

const initialState: ProductState = {
  vendors: initialVendors,
  products: initialVendors.flatMap(vendor => vendor.products),
  favorites: [],
  cart: [],
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      const newProduct = action.payload;
      
      // Add to products array
      state.products.push(newProduct);
      
      // Find or create vendor
      let vendor = state.vendors.find(v => v.name === newProduct.vendorName);
      
      if (!vendor) {
        // Create new vendor
        vendor = {
          id: Date.now(),
          name: newProduct.vendorName,
          category: 'General',
          image: 'assets/icon.png',
          products: []
        };
        state.vendors.push(vendor);
      }
      
      // Add product to vendor
      vendor.products.push(newProduct);
    },
    
    updateProduct: (state, action: PayloadAction<Product>) => {
      const updatedProduct = action.payload;
      
      // Update in products array
      const productIndex = state.products.findIndex(p => p.id === updatedProduct.id);
      if (productIndex !== -1) {
        state.products[productIndex] = updatedProduct;
      }
      
      // Update in vendor's products
      const vendor = state.vendors.find(v => v.name === updatedProduct.vendorName);
      if (vendor) {
        const vendorProductIndex = vendor.products.findIndex(p => p.id === updatedProduct.id);
        if (vendorProductIndex !== -1) {
          vendor.products[vendorProductIndex] = updatedProduct;
        }
      }
    },
    
    removeProduct: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      
      // Remove from products array
      state.products = state.products.filter(p => p.id !== productId);
      
      // Remove from vendor's products
      state.vendors.forEach(vendor => {
        vendor.products = vendor.products.filter(p => p.id !== productId);
      });
    },
    
    addVendor: (state, action: PayloadAction<Omit<Vendor, 'id'>>) => {
      const newVendor = {
        ...action.payload,
        id: Date.now(),
      };
      state.vendors.push(newVendor);
    },
    
    updateVendor: (state, action: PayloadAction<Vendor>) => {
      const vendorIndex = state.vendors.findIndex(v => v.id === action.payload.id);
      if (vendorIndex !== -1) {
        state.vendors[vendorIndex] = action.payload;
      }
    },
    
    removeVendor: (state, action: PayloadAction<number>) => {
      const vendorId = action.payload;
      const vendor = state.vendors.find(v => v.id === vendorId);
      
      if (vendor) {
        // Remove vendor's products from products array
        state.products = state.products.filter(
          p => p.vendorName !== vendor.name
        );
        
        // Remove vendor
        state.vendors = state.vendors.filter(v => v.id !== vendorId);
      }
    },
    
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const product = state.products.find(p => p.id === productId);
      
      if (product) {
        product.isFavorite = !product.isFavorite;
        
        // Update in vendor's products
        const vendor = state.vendors.find(v => v.name === product.vendorName);
        if (vendor) {
          const vendorProduct = vendor.products.find(p => p.id === productId);
          if (vendorProduct) {
            vendorProduct.isFavorite = product.isFavorite;
          }
        }
        
        // Ensure favorites array exists
        if (!state.favorites) {
          state.favorites = [];
        }
        
        // Update favorites array
        if (product.isFavorite) {
          state.favorites.push(product);
        } else {
          state.favorites = state.favorites.filter(p => p.id !== productId);
        }
      }
    },
    
    addToFavorites: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      
      // Ensure favorites array exists
      if (!state.favorites) {
        state.favorites = [];
      }
      
      const existingFavorite = state.favorites.find(p => p.id === product.id);
      
      if (!existingFavorite) {
        state.favorites.push({ ...product, isFavorite: true });
      }
    },
    
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      
      // Ensure favorites array exists
      if (!state.favorites) {
        state.favorites = [];
        return;
      }
      
      state.favorites = state.favorites.filter(p => p.id !== productId);
      
      // Update product favorite status
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.isFavorite = false;
      }
    },

    // Cart Actions
    addToCart: (state, action: PayloadAction<Product>) => {
      if (!state.cart) {
        state.cart = [];
      }
      
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      if (!state.cart) {
        state.cart = [];
        return;
      }
      
      state.cart = state.cart.filter(item => item.id !== action.payload);
    },

    updateCartItemQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      if (!state.cart) {
        state.cart = [];
        return;
      }
      
      const { id, quantity } = action.payload;
      const item = state.cart.find(item => item.id === id);
      if (item) {
        if (quantity <= 0) {
          state.cart = state.cart.filter(item => item.id !== id);
        } else {
          item.quantity = quantity;
        }
      }
    },

    clearCart: (state) => {
      if (!state.cart) {
        state.cart = [];
      } else {
        state.cart = [];
      }
    },
  },
});

export const {
  addProduct,
  updateProduct,
  removeProduct,
  addVendor,
  updateVendor,
  removeVendor,
  toggleFavorite,
  addToFavorites,
  removeFromFavorites,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} = productSlice.actions;

export default productSlice.reducer;
