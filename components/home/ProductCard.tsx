import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, getProductMainImage, isProductAvailable } from '../../store/api/vendorApi';

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
    <TouchableOpacity style={styles.productCard} onPress={() => onPress(product)}>
      <View style={styles.cardContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getProductMainImage(product) }}
            style={styles.productImage}
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
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>{product.stock} left</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              {product.offerPrice && (
                <Text style={styles.originalPrice}>₹{product.price}</Text>
              )}
              <Text style={styles.productPrice}>₹{product.offerPrice || product.price}</Text>
            </View>
            
            {/* Add to Cart Button */}
            <TouchableOpacity
              style={[styles.addButton, !isProductAvailable(product) && styles.addButtonDisabled]}
              onPress={() => isProductAvailable(product) && onAddToCart(product)}
              disabled={!isProductAvailable(product)}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lowStockText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    marginBottom: 8,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  addButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowColor: '#D1D5DB',
  },
});
