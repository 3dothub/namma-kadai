import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CartBottomSectionProps {
  totalItems: number;
  totalPrice: number;
  onViewCart: () => void;
}

export const CartBottomSection: React.FC<CartBottomSectionProps> = ({
  totalItems,
  totalPrice,
  onViewCart,
}) => {
  return (
    <View style={styles.cartSection}>
      <View style={styles.cartHeader}>
        <Text style={styles.cartTitle}>Cart ({totalItems} items)</Text>
        <Text style={styles.cartTotal}>₹{totalPrice}</Text>
      </View>
      <TouchableOpacity 
        style={styles.viewCartButton}
        onPress={onViewCart}
      >
        <Text style={styles.viewCartButtonText}>View Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
