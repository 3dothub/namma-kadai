import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../store/slices/productSlice';
import { getProductVendorId } from '../../store/api/vendorApi';

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
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.checkoutModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Checkout</Text>
            <TouchableOpacity onPress={onClose}>
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
              onPress={onPlaceOrder}
            >
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  checkoutModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
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
});
