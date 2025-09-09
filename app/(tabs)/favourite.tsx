import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { addProductToCart } from '../../store/slices/productSlice';
import { useGetFavoritesQuery, useRemoveFromFavoritesMutation } from '../../store/api/favoritesApi';
import { ProductCard } from '../../components/home/ProductCard';
import { ProductDetailModal } from '../../components/home/ProductDetailModal';
import { CartBottomSection } from '../../components/home/CartBottomSection';
import { CartModal } from '../../components/home/CartModal';
import { Product } from '../../store/api/vendorApi';

export default function FavouriteScreen() {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.products.cart);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use the favorites API
  const { data: favoritesData, error, isLoading, refetch } = useGetFavoritesQuery();
  const [removeFromFavorites] = useRemoveFromFavoritesMutation();

  const favorites = favoritesData?.favorites || [];

  // Convert favorites API product to full Product type
  const convertToFullProduct = (favProduct: any): Product => ({
    _id: favProduct._id,
    name: favProduct.name,
    price: favProduct.price,
    offerPrice: favProduct.offerPrice,
    images: favProduct.images || (favProduct.image ? [favProduct.image] : []),
    description: favProduct.description || '',
    category: favProduct.category || '',
    vendorId: favProduct.vendorId || '',
    stock: 50, // Higher default stock to avoid "left" count
    unit: 'pcs',
    isActive: true,
    createdAt: favProduct.createdAt || new Date().toISOString(),
    updatedAt: favProduct.updatedAt || new Date().toISOString(),
  });

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await removeFromFavorites(productId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addProductToCart({
      product: product,
      quantity: 1,
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.offerPrice || item.price) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favourites</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favourites</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Error Loading Favourites</Text>
          <Text style={styles.emptySubtitle}>
            Please try again later
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!Array.isArray(favorites) || favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favourites</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Favourites Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start adding products to your favourites to see them here
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favourites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} item{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.favoritesGrid}>
          {favorites.map((product) => {
            const fullProduct = convertToFullProduct(product);
            return (
              <ProductCard
                key={product._id}
                product={fullProduct}
                onPress={handleProductPress}
                onToggleFavorite={handleRemoveFavorite}
                onAddToCart={handleAddToCart}
              />
            );
          })}
        </View>
        
        {/* Bottom spacing for cart section */}
        <View style={{ height: cart.length > 0 ? 100 : 20 }} />
      </ScrollView>

      {/* Cart Bottom Section */}
      {cart.length > 0 && (
        <CartBottomSection
          totalItems={getTotalItems()}
          totalPrice={getTotalPrice()}
          onViewCart={() => setShowCartModal(true)}
        />
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={showProductDetail}
        product={selectedProduct}
        onClose={() => {
          setShowProductDetail(false);
          setSelectedProduct(null);
        }}
        onToggleFavorite={handleRemoveFavorite}
        onAddToCart={handleAddToCart}
        isFavorite={true} // Always true since this is favorites tab
      />

      {/* Cart Modal */}
      <CartModal
        visible={showCartModal}
        cart={cart}
        onClose={() => setShowCartModal(false)}
        onUpdateQuantity={(productId: string, quantity: number) => {
          // Add cart update logic here if needed
        }}
        onRemoveItem={(productId: string) => {
          // Add cart remove logic here if needed
        }}
        onCheckout={() => {
          setShowCartModal(false);
          router.push('/checkout');
        }}
        getTotalPrice={getTotalPrice}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
