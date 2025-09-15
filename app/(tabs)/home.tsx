import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";

import { useRouter } from "expo-router";
import { Vendor, Product } from "@/store/api/vendorApi";
import {
  addProductToCart,
  removeProductFromCart,
  updateCartItemQuantity,
  toggleFavorite,
} from "@/store/slices/productSlice";
import { setCurrentLocation } from "@/store/slices/userSlice";
import { showSnackbar } from "@/store/slices/snackbarSlice";
import { useLocationBasedVendors } from "@/hooks/useLocationBasedVendors";
import { useVendorProducts } from "@/hooks/useVendorProducts";
import {
  getCurrentLocation,
  getCurrentLocationWithAddress,
  requestLocationPermission,
} from "@/services/locationService";

import {
  ProductDetailModal,
  CartModal,
  CartBottomSection,
  SearchHeader,
  VendorsSection,
  ProductsSection,
} from "@/components/home";
import { OrderSuccessAnimation } from "@/components/OrderSuccessAnimation";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, currentLocation } = useSelector((state: RootState) => state.user);
  const { cart, isLoadingProducts: isLoadingProductsFromStore } = useSelector((state: RootState) => state.products);
  const { vendors, isLoading, loadVendorsByLocation } = useLocationBasedVendors();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isVendorChanging, setIsVendorChanging] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState<boolean>(false);

  const {
    products: vendorProducts,
    isLoading: isLoadingProducts,
    refetch: refetchVendorProducts,
  } = useVendorProducts(selectedVendor?._id || null);

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

  const addToCartHandler = (product: Product) => {
    dispatch(addProductToCart({ product, quantity: 1 }));
    dispatch(showSnackbar({ message: `${product.name} added to cart!`, type: "success" }));
  };

  // Location refresh handler
  const handleLocationRefresh = async () => {
    if (isRequestingLocation) return;

    setIsRequestingLocation(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        const locationData = await getCurrentLocationWithAddress({
          showSnackbar: (message: string, type: "success" | "error" | "info") =>
            dispatch(showSnackbar({ message, type })),
        });
        if (locationData) {
          const locationWithAddress = {
            lat: locationData.lat,
            lng: locationData.lng,
            address: locationData.address || {},
          };
          // Set the location in userSlice - this will trigger the useEffect in useLocationBasedVendors
          dispatch(setCurrentLocation(locationWithAddress));
          dispatch(
            showSnackbar({
              message: "Location updated successfully",
              type: "success",
            })
          );
        }
      } else {
        dispatch(
          showSnackbar({
            message: "Location permission denied",
            type: "error",
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: "Failed to get location",
          type: "error",
        })
      );
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Search page navigation handler
  const handleSearchPress = () => {
    router.push("/search");
  };

  const handleVendorClick = (vendor: Vendor) => {
    if (selectedVendor?._id !== vendor._id) {
      setIsVendorChanging(true);
      setSelectedVendor(vendor);
    }
  };

  const removeFromCartHandler = (productId: string) => {
    dispatch(removeProductFromCart(productId));
    dispatch(showSnackbar({ message: "Item removed from cart", type: "info" }));

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
    return cart.reduce(
      (total: number, item: { offerPrice: any; price: any; quantity: number }) =>
        total + (item.offerPrice || item.price) * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total: any, item: { quantity: any }) => total + item.quantity, 0);
  };

  const handleToggleFavorite = (productId: string) => {
    dispatch(toggleFavorite(productId));
    dispatch(
      showSnackbar({
        message: "Favorite updated",
        type: "success",
      })
    );
  };

  const handleCheckout = () => {
    setShowCartModal(false);
    if (!user) {
      dispatch(showSnackbar({ message: "Please login to proceed", type: "info" }));
      router.push("/(auth)/login");
      return;
    }
    router.push("/checkout");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SearchHeader
        userName={user?.name}
        isAuthenticated={isAuthenticated}
        currentLocation={currentLocation}
        onLocationRefresh={handleLocationRefresh}
        onSearchPress={handleSearchPress}
        onNotificationPress={() => router.push("/notifications")}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Vendors Section */}
        <VendorsSection
          vendors={vendors}
          selectedVendor={selectedVendor}
          isLoading={isLoading}
          searchQuery=""
          onVendorClick={handleVendorClick}
        />

        {/* Products Section */}
        <ProductsSection
          selectedVendor={selectedVendor}
          products={vendorProducts}
          isLoading={isLoadingProducts || isVendorChanging || isLoadingProductsFromStore}
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
          dispatch(showSnackbar({ message: "Order placed successfully!", type: "success" }));
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
