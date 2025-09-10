import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableWithoutFeedback,
  Image,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { CartItem } from '../../src/store/slices/productSlice';

interface CartModalProps {
  visible: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  getTotalPrice: () => number;
}

export const CartModal: React.FC<CartModalProps> = ({
  visible,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  getTotalPrice,
}) => {
  const screenHeight = Dimensions.get('window').height;
  const baseHeight = screenHeight * 0.4; // 40% for minimal size
  const maxHeight = screenHeight * 0.6; // 60% for maximum size
  
  // More conservative height calculation
  const hasCartItems = cart.length > 0;
  const modalHeight = hasCartItems ? maxHeight : baseHeight;

  const handleBackdropPress = () => {
    onClose();
  };

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
              style={[styles.modalContainer, { height: modalHeight }]}
              animation="slideInUp"
              duration={400}
              easing="ease-out"
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.dragIndicator} />
                <View style={styles.headerContent}>
                  <Text style={styles.modalTitle}>Your Cart ({cart.length})</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content Container */}
              <View style={styles.modalBody}>
                {/* Cart Items */}
                <ScrollView 
                  style={styles.content} 
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  scrollEventThrottle={16}
                >
                {cart.map((item) => (
                  <View key={item._id} style={styles.cartItem}>
                    <View style={styles.itemImageContainer}>
                      <Image
                        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/60' }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    </View>
                    
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                      <View style={styles.priceContainer}>
                        {item.offerPrice && (
                          <Text style={styles.originalPrice}>₹{item.price}</Text>
                        )}
                        <Text style={styles.itemPrice}>₹{item.offerPrice || item.price}</Text>
                      </View>
                    </View>

                    <View style={styles.itemActions}>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity 
                          style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                          onPress={() => onUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Ionicons name="remove" size={16} color={item.quantity <= 1 ? '#D1D5DB' : '#FFFFFF'} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => onRemoveItem(item._id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {cart.length === 0 && (
                  <View style={styles.emptyCart}>
                    <Ionicons name="bag-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyCartText}>Your cart is empty</Text>
                    <Text style={styles.emptyCartSubtext}>Add items to get started</Text>
                  </View>
                )}
              </ScrollView>

              {/* Bottom Action */}
              {cart.length > 0 && (
                <View style={styles.bottomAction}>
                  <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalPrice}>₹{getTotalPrice()}</Text>
                  </View>
                  <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
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
    flexDirection: 'column',
  },
  modalBody: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
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
    minHeight: 0,
  },
  contentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginRight: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  itemActions: {
    alignItems: 'center',
    gap: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 24,
    textAlign: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
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
  checkoutButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
