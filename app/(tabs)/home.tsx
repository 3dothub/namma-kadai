import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Ionicons } from '@expo/vector-icons';

import { AddProductModal } from '../../components/AddProductModal';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { Vendor, Product, getVendorMainCategory, isVendorOpen, getVendorImage, getProductMainImage, isProductAvailable, formatProductUnit, getProductVendorId } from '../../store/api/vendorApi';
import { CartItem } from '../../store/slices/productSlice';
import { 
  addProductToCart, 
  removeProductFromCart, 
  updateCartItemQuantity, 
  clearCart,
  toggleFavorite 
} from '../../store/slices/productSlice';
import { showSnackbar } from '../../store/slices/snackbarSlice';
import { subscribeToAddProduct } from './_layout';
import { useLocationBasedVendors } from '../../hooks/useLocationBasedVendors';
import { useVendorProducts } from '../../hooks/useVendorProducts';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const cart = useSelector((state: RootState) => state.products.cart);
  const { vendors, nearbyVendors, isLoading, hasLocation } = useLocationBasedVendors();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  
  const { products: vendorProducts, isLoading: isLoadingProducts } = useVendorProducts(selectedVendor?._id || null);
  
  // Auto-select first vendor when vendors change
  useEffect(() => {
    console.log('Vendors updated:', vendors);
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors, selectedVendor]);

  // Listen for add product button press from tab layout
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = subscribeToAddProduct(() => {
        setShowAddProductModal(true);
      });

      return unsubscribe;
    }, [])
  );

  const addToCartHandler = (product: Product) => {
    dispatch(addProductToCart({ product, quantity: 1 }));
    dispatch(showSnackbar({ message: `${product.name} added to cart!`, type: 'success' }));
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
    const favorites = useSelector((state: RootState) => state.products.favorites);
    const isFavorite = favorites.some(fav => fav._id === productId);
    
    dispatch(showSnackbar({
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
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
    setShowCheckoutModal(true);
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading nearby vendors...</Text>
          <Text style={styles.loadingSubtext}>Please allow location access to see vendors in your area</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome {user?.name || 'Anonymous'}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#22C55E" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors, products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Vendors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorsScroll}>
            {filteredVendors.map((vendor: Vendor, id) => (
              <TouchableOpacity
                key={id}
                style={[styles.vendorCard, selectedVendor?._id === vendor._id && styles.selectedVendorCard]}
                onPress={() => setSelectedVendor(selectedVendor?._id === vendor._id ? null : vendor)}
              >
                <View style={styles.vendorIconContainer}>
                  <Image
                    source={{ uri: getVendorImage(vendor) }}
                    style={styles.vendorIcon}
                    resizeMode="cover"
                    defaultSource={require('../../assets/icon.png')}
                  />
                  {isVendorOpen(vendor) && (
                    <View style={styles.openIndicator}>
                      <Text style={styles.openText}>OPEN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.vendorName}>{vendor.name}</Text>
                <Text style={styles.vendorCategory}>{getVendorMainCategory(vendor)}</Text>
                {vendor.deliverySettings.freeDeliveryAbove === 0 ? (
                  <Text style={styles.freeDelivery}>Free Delivery</Text>
                ) : (
                  <Text style={styles.deliveryInfo}>
                    Free delivery above ₹{vendor.deliverySettings.freeDeliveryAbove}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Section */}
        {selectedVendor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{selectedVendor.name} - Products</Text>
            <View style={styles.productsGrid}>
              {vendorProducts.map((product) => (
                <View key={product._id} style={styles.productCard}>
                  <TouchableOpacity 
                    onPress={() => {
                      setSelectedProduct(product);
                      setShowProductDetail(true);
                    }}
                  >
                    <View style={styles.productIconContainer}>
                      <Image
                        source={{ uri: getProductMainImage(product) }}
                        style={styles.productIcon}
                        resizeMode="cover"
                        defaultSource={require('../../assets/icon.png')}
                      />
                      {!isProductAvailable(product) && (
                        <View style={styles.unavailableOverlay}>
                          <Text style={styles.unavailableText}>
                            {product.stock === 0 ? 'Out of Stock' : 'Unavailable'}
                          </Text>
                        </View>
                      )}
                      {product.stock > 0 && product.stock <= 10 && (
                        <View style={styles.lowStockIndicator}>
                          <Text style={styles.lowStockText}>Only {product.stock} left</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productUnit}>{formatProductUnit(product)}</Text>
                      <View style={styles.priceContainer}>
                        {product.offerPrice && (
                          <Text style={styles.originalPrice}>₹{product.price}</Text>
                        )}
                        <Text style={styles.productPrice}>₹{product.offerPrice || product.price}</Text>
                      </View>
                      <Text style={styles.deliveryTimeProduct}>30-45 mins</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleToggleFavorite(product._id)}
                  >
                    <Ionicons 
                      name="heart-outline"
                      size={16} 
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addToCartButton, !isProductAvailable(product) && styles.addToCartButtonDisabled]}
                    onPress={() => isProductAvailable(product) && addToCartHandler(product)}
                    disabled={!isProductAvailable(product)}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {vendorProducts.length === 0 && !isLoadingProducts && (
                <View style={styles.emptyProducts}>
                  <Text style={styles.emptyProductsText}>No products available</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Cart Bottom Section */}
      {cart.length > 0 && (
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Cart ({getTotalItems()} items)</Text>
            <Text style={styles.cartTotal}>₹{getTotalPrice()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewCartButton}
            onPress={() => setShowCartModal(true)}
          >
            <Text style={styles.viewCartButtonText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product Detail Modal */}
      <Modal
        visible={showProductDetail}
        animationType="none"
        transparent={true}
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowProductDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View 
            style={styles.productDetailModal}
            animation="slideInUp"
            duration={300}
            easing="ease-out"
          >
            {selectedProduct && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <View style={styles.modalHeaderButtons}>
                    <TouchableOpacity 
                      style={styles.favoriteButtonLarge}
                      onPress={() => handleToggleFavorite(selectedProduct._id)}
                    >
                      <Ionicons 
                        name="heart-outline"
                        size={24} 
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowProductDetail(false)}>
                      <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                  </View>
                </View>
              <View style={styles.productDetailIconContainer}>
                <Image
                  source={{ uri: getProductMainImage(selectedProduct) }}
                  style={styles.productDetailImage}
                  resizeMode="cover"
                  defaultSource={require('../../assets/icon.png')}
                />
              </View>
              <View style={styles.productDetailInfo}>
                <View style={styles.productStockInfo}>
                  <Text style={styles.productUnit}>{formatProductUnit(selectedProduct)}</Text>
                  <Text style={styles.stockText}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  {selectedProduct.offerPrice && (
                    <Text style={styles.originalPriceLarge}>₹{selectedProduct.price}</Text>
                  )}
                  <Text style={styles.productDetailPrice}>₹{selectedProduct.offerPrice || selectedProduct.price}</Text>
                </View>
                <Text style={styles.productDetailDescription}>
                  {selectedProduct.description}
                </Text>
                <Text style={styles.deliveryTime}>
                  <Ionicons name="time-outline" size={16} color="#22C55E" /> 30-45 mins
                </Text>
                <TouchableOpacity
                  style={styles.addToCartButtonLarge}
                  onPress={() => {
                    addToCartHandler(selectedProduct);
                    setShowProductDetail(false);
                  }}
                >
                  <Text style={styles.addToCartTextLarge}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          </Animatable.View>
        </View>
      </Modal>

      {/* Cart Modal */}
      <Modal
        visible={showCartModal}
        animationType="none"
        transparent={true}
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowCartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View 
            style={styles.cartModal}
            animation="slideInUp"
            duration={300}
            easing="ease-out"
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setShowCartModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          <ScrollView style={styles.cartModalContent}>
            {cart.map((item) => (
              <View key={item._id} style={styles.cartModalItem}>
                <View style={styles.cartModalItemIcon}>
                  <Ionicons name="cube-outline" size={30} color="#22C55E" />
                </View>
                <View style={styles.cartModalItemInfo}>
                  <Text style={styles.cartModalItemName}>{item.name}</Text>
                  <Text style={styles.cartModalItemPrice}>₹{item.offerPrice || item.price}</Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => removeFromCartHandler(item._id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.cartModalFooter}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: ₹{getTotalPrice()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
          </Animatable.View>
        </View>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        visible={showCheckoutModal}
        animationType="slide"
        transparent={true}
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowCheckoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout</Text>
              <TouchableOpacity onPress={() => setShowCheckoutModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.checkoutContent}>
              <View style={styles.paymentOption}>
                <Ionicons name="cash-outline" size={30} color="#22C55E" />
                <Text style={styles.paymentText}>Cash on Delivery</Text>
              </View>
              <View style={styles.orderSummary}>
                <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                
                {/* List all products in cart */}
                <ScrollView style={styles.checkoutItemsList}>
                  {cart.map((item) => (
                    <View key={item._id} style={styles.checkoutItem}>
                      <View style={styles.checkoutItemInfo}>
                        <Text style={styles.checkoutItemName}>{item.name}</Text>
                        <Text style={styles.checkoutItemVendor}>{getProductVendorId(item)}</Text>
                      </View>
                      <View style={styles.checkoutItemQuantity}>
                        <Text style={styles.checkoutQuantityText}>x{item.quantity}</Text>
                        <Text style={styles.checkoutItemPrice}>₹{(item.offerPrice || item.price) * item.quantity}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>Free</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{getTotalPrice()}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.placeOrderButton}
                onPress={() => {
                  dispatch(showSnackbar({ message: 'Order placed successfully!', type: 'success' }));
                  dispatch(clearCart());
                  setShowCheckoutModal(false);
                }}
              >
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={(message) => dispatch(showSnackbar({ message, type: 'success' }))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22C55E',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  vendorsScroll: {
    marginTop: 8,
  },
  vendorCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 16,
  },
  selectedVendorCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
  },
  vendorIconContainer: {
    marginBottom: 8,
  },
  vendorIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  vendorCategory: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  productIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  productIcon: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#22C55E',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22C55E',
  },
  viewCartButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  productDetailModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteButtonLarge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  productDetailIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productDetailImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  productDetailInfo: {
    alignItems: 'center',
  },
  originalPriceLarge: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productDetailPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 16,
  },
  productDetailDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#22C55E',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartButtonLarge: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  addToCartTextLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  cartModalContent: {
    maxHeight: 300,
  },
  cartModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartModalItemIcon: {
    marginRight: 12,
  },
  cartModalItemInfo: {
    flex: 1,
  },
  cartModalItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  cartModalItemPrice: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    backgroundColor: '#22C55E',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  cartModalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 16,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  checkoutButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  checkoutContent: {
    paddingTop: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  orderSummary: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  checkoutItemsList: {
    maxHeight: 150,
    marginBottom: 12,
  },
  checkoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  checkoutItemInfo: {
    flex: 1,
  },
  checkoutItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  checkoutItemVendor: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkoutItemQuantity: {
    alignItems: 'flex-end',
  },
  checkoutQuantityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkoutItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  placeOrderButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addProductModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  addProductContent: {
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addProductButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addProductButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  openIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
  freeDelivery: {
    fontSize: 10,
    color: '#22C55E',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  deliveryInfo: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  lowStockIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
  },
  productUnit: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  deliveryTimeProduct: {
    fontSize: 12,
    color: '#22C55E',
    textAlign: 'center',
    marginTop: 4,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  unavailableText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  emptyProducts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  productStockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
