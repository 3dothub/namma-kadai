import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView,
  TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { CartItem } from '../../store/slices/productSlice';

interface CheckoutModalProps {
  visible: boolean;
  cart: CartItem[];
  onClose: () => void;
  onPlaceOrder: () => void;
  getTotalPrice: () => number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  cart,
  onClose,
  onPlaceOrder,
  getTotalPrice,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');

  const handleBackdropPress = () => {
    onClose();
  };

  const handlePlaceOrder = () => {
    onPlaceOrder();
    // The success animation will be handled in the parent component
  };

  const deliveryFee = orderType === 'delivery' ? 20 : 0;
  const finalTotal = getTotalPrice() + deliveryFee;

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
                <View style={styles.headerContent}>
                  <Text style={styles.modalTitle}>Checkout</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

                {/* Payment Method */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                  <TouchableOpacity
                    style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
                    onPress={() => setPaymentMethod('cod')}
                  >
                    <View style={styles.paymentOptionContent}>
                      <Ionicons name="cash-outline" size={24} color="#10B981" />
                      <Text style={styles.paymentText}>Cash on Delivery</Text>
                    </View>
                    {paymentMethod === 'cod' && (
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Summary</Text>
                  <View style={styles.orderSummaryContainer}>
                    {cart.map((item) => (
                      <View key={item._id} style={styles.orderItem}>
                        <View style={styles.orderItemInfo}>
                          <Text style={styles.orderItemName}>{item.name}</Text>
                          <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
                        </View>
                        <Text style={styles.orderItemPrice}>₹{(item.offerPrice || item.price) * item.quantity}</Text>
                      </View>
                    ))}
                    
                    <View style={styles.summaryDivider} />
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>₹{getTotalPrice()}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Delivery Fee</Text>
                      <Text style={styles.summaryValue}>
                        {deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}
                      </Text>
                    </View>
                    
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>₹{finalTotal}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Action */}
              <View style={styles.bottomAction}>
                <View style={styles.finalTotalSection}>
                  <Text style={styles.finalTotalLabel}>Total Amount</Text>
                  <Text style={styles.finalTotalPrice}>₹{finalTotal}</Text>
                </View>
                <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
                  <Text style={styles.placeOrderButtonText}>Place Order</Text>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
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
    maxHeight: '85%',
    minHeight: '60%',
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
  paymentOption: {
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
  paymentOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderSummaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalRow: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  bottomAction: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  finalTotalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  finalTotalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  placeOrderButton: {
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
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
