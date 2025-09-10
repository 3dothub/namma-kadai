import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Image, 
  ScrollView,
  TouchableWithoutFeedback,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Product, getProductMainImage } from '../../src/store/api/vendorApi';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '../../src/store/api/favoritesApi';

interface ProductDetailModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onToggleFavorite?: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  isFavorite?: boolean;
}

interface ScheduleTime {
  id: string;
  label: string;
  time: string;
  available: boolean;
}

const scheduleOptions: ScheduleTime[] = [
  { id: 'immediate', label: 'Now', time: '20-30 mins', available: true },
  { id: 'slot1', label: 'Later Today', time: '6:00 PM - 7:00 PM', available: true },
  { id: 'slot2', label: 'Tomorrow Morning', time: '9:00 AM - 10:00 AM', available: true },
  { id: 'slot3', label: 'Tomorrow Evening', time: '6:00 PM - 7:00 PM', available: false },
];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  onClose,
  onToggleFavorite,
  onAddToCart,
  isFavorite = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState('immediate');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [isProductFavorite, setIsProductFavorite] = useState(isFavorite);

  // Favorites mutations
  const [addToFavorites, { isLoading: isAddingToFavorites }] = useAddToFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemovingFromFavorites }] = useRemoveFromFavoritesMutation();

  // Update favorite state when product or isFavorite prop changes
  useEffect(() => {
    if (isFavorite !== undefined) {
      setIsProductFavorite(isFavorite);
    }
  }, [isFavorite, product]);

  if (!product) return null;

  const handleBackdropPress = () => {
    onClose();
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    
    try {
      if (isProductFavorite) {
        await removeFromFavorites(product._id);
        setIsProductFavorite(false);
      } else {
        await addToFavorites(product._id);
        setIsProductFavorite(true);
      }
      
      // Call the parent callback if provided
      if (onToggleFavorite) {
        onToggleFavorite(product._id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleCreateOrder = () => {
    // Add to cart with quantity
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    onClose();
    // Here you can navigate to checkout or show order confirmation
  };

  const totalPrice = (product.offerPrice || product.price) * quantity;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animatable.View 
              style={styles.modalContainer}
              animation="slideInUp"
              duration={400}
              easing="ease-out"
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.dragIndicator} />
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Product Image */}
                <View style={styles.imageSection}>
                  <Image
                    source={{ uri: getProductMainImage(product) }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={handleToggleFavorite}
                    disabled={isAddingToFavorites || isRemovingFromFavorites}
                  >
                    {isAddingToFavorites || isRemovingFromFavorites ? (
                      <Ionicons name="ellipsis-horizontal" size={20} color="#FF6B6B" />
                    ) : (
                      <Ionicons 
                        name={isProductFavorite ? "heart" : "heart-outline"} 
                        size={20} 
                        color="#FF6B6B" 
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.description && (
                    <Text style={styles.productDescription}>{product.description}</Text>
                  )}
                  
                  <View style={styles.priceSection}>
                    {product.offerPrice && (
                      <Text style={styles.originalPrice}>₹{product.price}</Text>
                    )}
                    <Text style={styles.currentPrice}>₹{product.offerPrice || product.price}</Text>
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockText}>{product.stock} left</Text>
                    </View>
                  </View>
                </View>

                {/* Order Type Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Type</Text>
                  <View style={styles.orderTypeContainer}>
                    <TouchableOpacity
                      style={[styles.orderTypeButton, orderType === 'delivery' && styles.orderTypeActive]}
                      onPress={() => setOrderType('delivery')}
                    >
                      <Ionicons name="bicycle-outline" size={20} color={orderType === 'delivery' ? '#10B981' : '#6B7280'} />
                      <Text style={[styles.orderTypeText, orderType === 'delivery' && styles.orderTypeActiveText]}>
                        Delivery
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.orderTypeButton, orderType === 'takeaway' && styles.orderTypeActive]}
                      onPress={() => setOrderType('takeaway')}
                    >
                      <Ionicons name="bag-handle-outline" size={20} color={orderType === 'takeaway' ? '#10B981' : '#6B7280'} />
                      <Text style={[styles.orderTypeText, orderType === 'takeaway' && styles.orderTypeActiveText]}>
                        Takeaway
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Schedule Time */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Schedule Time</Text>
                  <View style={styles.scheduleContainer}>
                    {scheduleOptions.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.scheduleOption,
                          selectedSchedule === option.id && styles.scheduleOptionActive,
                          !option.available && styles.scheduleOptionDisabled
                        ]}
                        onPress={() => option.available && setSelectedSchedule(option.id)}
                        disabled={!option.available}
                      >
                        <View style={styles.scheduleOptionContent}>
                          <Text style={[
                            styles.scheduleLabel,
                            selectedSchedule === option.id && styles.scheduleLabelActive,
                            !option.available && styles.scheduleLabelDisabled
                          ]}>
                            {option.label}
                          </Text>
                          <Text style={[
                            styles.scheduleTime,
                            selectedSchedule === option.id && styles.scheduleTimeActive,
                            !option.available && styles.scheduleTimeDisabled
                          ]}>
                            {option.time}
                          </Text>
                        </View>
                        {selectedSchedule === option.id && (
                          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Quantity Selector */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Quantity</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                      onPress={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Ionicons name="remove" size={20} color={quantity <= 1 ? '#D1D5DB' : '#6B7280'} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
                      onPress={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                    >
                      <Ionicons name="add" size={20} color={quantity >= product.stock ? '#D1D5DB' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Action */}
              <View style={styles.bottomAction}>
                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalPrice}>₹{totalPrice}</Text>
                </View>
                <TouchableOpacity style={styles.createOrderButton} onPress={handleCreateOrder}>
                  <Text style={styles.createOrderText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productInfo: {
    marginBottom: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
  },
  stockBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  orderTypeActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  orderTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  orderTypeActiveText: {
    color: '#10B981',
  },
  scheduleContainer: {
    gap: 12,
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  scheduleOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  scheduleOptionDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  scheduleOptionContent: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scheduleLabelActive: {
    color: '#10B981',
  },
  scheduleLabelDisabled: {
    color: '#9CA3AF',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  scheduleTimeActive: {
    color: '#059669',
  },
  scheduleTimeDisabled: {
    color: '#D1D5DB',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 40,
    textAlign: 'center',
  },
  bottomAction: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  createOrderButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createOrderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
