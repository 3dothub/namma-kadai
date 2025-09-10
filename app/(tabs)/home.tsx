import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';

import { useRouter } from 'expo-router';
import { Vendor, Product } from '../../src/store/api/vendorApi';
import { 
  addProductToCart, 
  removeProductFromCart, 
  updateCartItemQuantity, 
  clearCart,
  toggleFavorite,
  setUserLocation
} from '../../src/store/slices/productSlice';
import { showSnackbar } from '../../src/store/slices/snackbarSlice';
import { useLocationBasedVendors } from '../../src/hooks/useLocationBasedVendors';
import { useVendorProducts } from '../../src/hooks/useVendorProducts';
import { getCurrentLocation, requestLocationPermission } from '../../src/services/locationService';

// Import the new components
import {
  ProductDetailModal,
  CartModal,
  LocationRequestScreen,
  CartBottomSection,
  SearchHeader,
  VendorsSection,
  ProductsSection,
} from '../../components/home';
import { OrderSuccessAnimation } from '../../components/OrderSuccessAnimation';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cart = useSelector((state: RootState) => state.products.cart);
  const { vendors, isLoading, hasLocation, loadVendorsByLocation } = useLocationBasedVendors();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isVendorChanging, setIsVendorChanging] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState<boolean>(false);
  
  const { products: vendorProducts, isLoading: isLoadingProducts, refetch: refetchVendorProducts } = useVendorProducts(selectedVendor?._id || null);
  
  useEffect(() => {
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors, selectedVendor]);

  useEffect(() => {
    if (selectedVendor) {
      refetchVendorProducts();  
    }
  }, [selectedVendor, refetchVendorProducts]);

  // Reset vendor changing state when products are loaded
  useEffect(() => {
    if (!isLoadingProducts && isVendorChanging) {
      const timer = setTimeout(() => {
        setIsVendorChanging(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProducts, isVendorChanging]);

console.log("selectedVendorId", selectedVendor?._id);
console.log("vendorProducts", vendorProducts);

  const addToCartHandler = (product: Product) => {
    dispatch(addProductToCart({ product, quantity: 1 }));
    dispatch(showSnackbar({ message: `${product.name} added to cart!`, type: 'success' }));
  };

  const handleVendorClick = (vendor: Vendor) => {   
    if (selectedVendor?._id !== vendor._id) {
      setIsVendorChanging(true);
      setSelectedVendor(vendor);
    }
  };

  const removeFromCartHandler = (productId: string) => {
    dispatch(removeProductFromCart(productId));
    dispatch(showSnackbar({ message: 'Item removed from cart', type: 'info' }));

    // Close cart modal if cart becomes empty
    if (cart.length === 1) {
      setShowCartModal(false);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartHandler(productId);
    } else {
      dispatch(updateCartItemQuantity({ productId, quantity }));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.offerPrice || item.price) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleToggleFavorite = (productId: string) => {
    dispatch(toggleFavorite(productId));
    dispatch(showSnackbar({
      message: 'Favorite updated',
      type: 'success'
    }));
  };

  const handleCheckout = () => {
    setShowCartModal(false);
    if (!user) {
      dispatch(showSnackbar({ message: 'Please login to proceed', type: 'info' }));
      router.push('/(auth)/login');
      return;
    }
    router.push('/checkout');
  };

  const handleLocationRequest = async () => {
    setIsRequestingLocation(true);
    try {
      const hasPermission = await requestLocationPermission();
      
      if (hasPermission) {
        const location = await getCurrentLocation();        
        if (location) {
          dispatch(setUserLocation(location));
          
          await loadVendorsByLocation(location);
        }
      }
    } catch (error) {
      console.error('Location error:', error);
      dispatch(showSnackbar({ 
        message: 'Failed to get location. Please try again.', 
        type: 'error' 
      }));
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const filteredVendors = vendors.filter((vendor: Vendor) => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.shopDetails.categories.some(category => 
      category.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    vendor.shopDetails.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state if location is being fetched
  if (!hasLocation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LocationRequestScreen
          isRequestingLocation={isRequestingLocation}
          isAuthenticated={isAuthenticated}
          onLocationRequest={handleLocationRequest}
          onSignIn={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header and Search */}
      <SearchHeader
        userName={user?.name}
        isAuthenticated={isAuthenticated}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNotificationPress={() => router.push('/notifications')}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Vendors Section */}
        <VendorsSection
          vendors={vendors}
          selectedVendor={selectedVendor}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onVendorClick={handleVendorClick}
        />

        {/* Products Section */}
        <ProductsSection
          selectedVendor={selectedVendor}
          products={vendorProducts}
          isLoading={isLoadingProducts || isVendorChanging}
          onProductPress={(product) => {
            setSelectedProduct(product);
            setShowProductDetail(true);
          }}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={addToCartHandler}
        />

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Cart Bottom Section */}
      {cart.length > 0 && (
        <CartBottomSection
          totalItems={getTotalItems()}
          totalPrice={getTotalPrice()}
          onViewCart={() => setShowCartModal(true)}
        />
      )}

      {/* Modals */}
      <ProductDetailModal
        visible={showProductDetail}
        product={selectedProduct}
        onClose={() => setShowProductDetail(false)}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={addToCartHandler}
      />

      <CartModal
        visible={showCartModal}
        cart={cart}
        onClose={() => setShowCartModal(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCartHandler}
        onCheckout={handleCheckout}
        getTotalPrice={getTotalPrice}
      />

      <OrderSuccessAnimation
        visible={showSuccessAnimation}
        onAnimationComplete={() => {
          setShowSuccessAnimation(false);
          dispatch(showSnackbar({ message: 'Order placed successfully!', type: 'success' }));
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 8, 
  },
});
