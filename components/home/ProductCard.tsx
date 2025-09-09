import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, getProductMainImage, isProductAvailable, formatProductUnit } from '../../store/api/vendorApi';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onToggleFavorite,
  onAddToCart,
}) => {
  return (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => onPress(product)}>
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
        onPress={() => onToggleFavorite(product._id)}
      >
        <Ionicons 
          name="heart-outline"
          size={16} 
          color="#6B7280"
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.addToCartButton, !isProductAvailable(product) && styles.addToCartButtonDisabled]}
        onPress={() => isProductAvailable(product) && onAddToCart(product)}
        disabled={!isProductAvailable(product)}
      >
        <Ionicons name="add" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  productUnit: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
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
  deliveryTimeProduct: {
    fontSize: 12,
    color: '#22C55E',
    textAlign: 'center',
    marginTop: 4,
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
  addToCartButtonDisabled: {
    backgroundColor: '#9CA3AF',
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
});
