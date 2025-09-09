import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Product, getProductMainImage, formatProductUnit } from '../../store/api/vendorApi';

interface ProductDetailModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  onClose,
  onToggleFavorite,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View 
          style={styles.productDetailModal}
          animation="slideInUp"
          duration={300}
          easing="ease-out"
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{product.name}</Text>
            <View style={styles.modalHeaderButtons}>
              <TouchableOpacity 
                style={styles.favoriteButtonLarge}
                onPress={() => onToggleFavorite(product._id)}
              >
                <Ionicons 
                  name="heart-outline"
                  size={24} 
                  color="#6B7280"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.productDetailIconContainer}>
            <Image
              source={{ uri: getProductMainImage(product) }}
              style={styles.productDetailImage}
              resizeMode="cover"
              defaultSource={require('../../assets/icon.png')}
            />
          </View>
          
          <View style={styles.productDetailInfo}>
            <View style={styles.productStockInfo}>
              <Text style={styles.productUnit}>{formatProductUnit(product)}</Text>
              <Text style={styles.stockText}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Text>
            </View>
            
            <View style={styles.priceContainer}>
              {product.offerPrice && (
                <Text style={styles.originalPriceLarge}>₹{product.price}</Text>
              )}
              <Text style={styles.productDetailPrice}>₹{product.offerPrice || product.price}</Text>
            </View>
            
            <Text style={styles.productDetailDescription}>
              {product.description}
            </Text>
            
            <Text style={styles.deliveryTime}>
              <Ionicons name="time-outline" size={16} color="#22C55E" /> 30-45 mins
            </Text>
            
            <TouchableOpacity
              style={styles.addToCartButtonLarge}
              onPress={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              <Text style={styles.addToCartTextLarge}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  productStockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  productUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
});
