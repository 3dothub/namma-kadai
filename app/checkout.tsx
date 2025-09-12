import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { clearCart } from '@/store/slices/productSlice';
import { showSnackbar } from '@/store/slices/snackbarSlice';
import { useGetVendorProductsQuery, getProductVendorId } from '@/store/api/vendorApi';
import { useUpdateLocationMutation } from '@/store/api/userApi';
import { setLocationAccess, addUserAddress } from '@/store/slices/authSlice';
import { getCurrentLocation, requestLocationPermission } from '@/services/locationService';

export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const { cart, vendors, userLocation } = useSelector((state: RootState) => state.products);
  const { user, hasLocationAccess } = useSelector((state: RootState) => state.auth);
  
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateLocation, { isLoading: isUpdatingLocation }] = useUpdateLocationMutation();
  
  // Get vendor information for service type restrictions
  const vendorId = cart.length > 0 ? getProductVendorId(cart[0]) : null;
  const currentVendor = vendors.find(v => v._id === vendorId);
  
  // Get vendor details if not available in vendors list
  const { data: vendorData } = useGetVendorProductsQuery(
    { vendorId: vendorId! },
    { skip: !vendorId || !!currentVendor }
  );
  
  const vendor = currentVendor || vendorData?.vendor;
  
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  console.log('Checkout component state:', {
    cartLength: cart.length,
    isCreatingOrder,
    vendor: vendor?.name,
    userAddresses: user?.addresses?.length || 0,
    hasLocationAccess,
  });

  // Check if user needs location setup
  const needsLocationSetup = () => {
    return !user?.addresses?.length && !hasLocationAccess && !userLocation;
  };

  // Show location prompt for new users without location data
  useEffect(() => {
    if (needsLocationSetup() && orderType === 'delivery') {
      setShowLocationPrompt(true);
    } else {
      setShowLocationPrompt(false);
    }
  }, [user, hasLocationAccess, userLocation, orderType]);

  // Set default order type based on vendor service types
  useEffect(() => {
    if (vendor?.serviceTypes) {
      // If vendor only supports takeaway, set it as default
      if (vendor.serviceTypes.takeaway && !vendor.serviceTypes.delivery) {
        setOrderType('takeaway');
      }
      // If vendor only supports delivery, set it as default
      else if (vendor.serviceTypes.delivery && !vendor.serviceTypes.takeaway) {
        setOrderType('delivery');
      }
      // If vendor supports both, default to delivery
      else if (vendor.serviceTypes.delivery) {
        setOrderType('delivery');
      }
      // Fallback to takeaway if no delivery
      else {
        setOrderType('takeaway');
      }
    }
  }, [vendor]);

  // Pre-populate with first saved address if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && selectedAddressIndex === -1) {
      setSelectedAddressIndex(0);
      const firstAddress = user.addresses[0];
      setDeliveryAddress({
        street: firstAddress.street,
        city: firstAddress.city,
        state: firstAddress.state,
        pincode: firstAddress.pincode,
      });
    }
  }, [user?.addresses, selectedAddressIndex]);

  // Handle current location request
  const handleUseCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        const location = await getCurrentLocation();
        if (location) {
          setCurrentLocationCoords(location);
          setUseCurrentLocation(true);
          setSelectedAddressIndex(-1);
          
          // Update user's location via API
          if (user) {
            try {
              await updateLocation({
                lat: location.lat,
                lng: location.lng,
              }).unwrap();
              
              dispatch(showSnackbar({
                message: 'Current location updated successfully!',
                type: 'success',
              }));
            } catch (error) {
              console.error('Failed to update location:', error);
            }
          }
        } else {
          dispatch(showSnackbar({
            message: 'Could not get current location. Please try again.',
            type: 'error',
          }));
        }
      } else {
        dispatch(showSnackbar({
          message: 'Location permission is required for delivery.',
          type: 'error',
        }));
      }
    } catch (error) {
      console.error('Location error:', error);
      dispatch(showSnackbar({
        message: 'Failed to get current location.',
        type: 'error',
      }));
    }
  };

  // Handle saved address selection
  const handleSelectAddress = (index: number) => {
    setSelectedAddressIndex(index);
    setUseCurrentLocation(false);
    const address = user?.addresses?.[index];
    if (address) {
      setDeliveryAddress({
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      });
    }
  };

  // Helper function to check if order type is available
  const isOrderTypeAvailable = (type: 'delivery' | 'takeaway') => {
    if (!vendor?.serviceTypes) return true; // Default to available if no vendor info
    return vendor.serviceTypes[type];
  };

  // Calculate totals
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    return orderType === 'delivery' ? 0 : 0;
  };

  const getTaxAmount = () => {
    return Math.round(getTotalPrice() * 0); // 5% tax
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getDeliveryFee() + getTaxAmount();
  };

  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder called');
    
    if (!user) {
      Alert.alert('Error', 'Please login to place an order');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    // Enhanced validation for delivery addresses
    if (orderType === 'delivery') {
      if (useCurrentLocation && !currentLocationCoords) {
        Alert.alert('Error', 'Please get your current location for delivery');
        return;
      }
      
      if (!useCurrentLocation && (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode)) {
        Alert.alert('Error', 'Please fill in all delivery address fields or use current location');
        return;
      }

      // For new users without saved addresses, prompt to save the address
      if (!user.addresses?.length && !useCurrentLocation) {
        Alert.alert(
          'Save Address',
          'Would you like to save this address for future orders?',
          [
            { text: 'Skip', style: 'cancel' },
            {
              text: 'Save',
              onPress: () => {
                const newAddress = {
                  label: 'Home',
                  street: deliveryAddress.street,
                  city: deliveryAddress.city,
                  state: deliveryAddress.state,
                  pincode: deliveryAddress.pincode,
                  location: currentLocationCoords || { lat: 0, lng: 0 },
                };
                dispatch(addUserAddress(newAddress));
              },
            },
          ]
        );
      }
    }

    try {
      console.log('Starting order creation...');
      
      // Get vendor ID from first cart item (assuming all items are from same vendor)
      const firstItem = cart[0];
      const vendorId = typeof firstItem.vendorId === 'string' 
        ? firstItem.vendorId 
        : firstItem.vendorId.$oid;
      
      console.log('Vendor ID:', vendorId);
      
      // Prepare order items
      const orderItems = cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      console.log('Order items:', orderItems);

      // Prepare delivery address with location coordinates
      let finalDeliveryAddress = null;
      if (orderType === 'delivery') {
        if (useCurrentLocation && currentLocationCoords) {
          finalDeliveryAddress = {
            street: 'Current Location',
            city: '',
            state: '',
            pincode: '',
            location: currentLocationCoords,
          };
        } else if (selectedAddressIndex >= 0 && user?.addresses?.[selectedAddressIndex]) {
          const savedAddress = user.addresses[selectedAddressIndex];
          finalDeliveryAddress = {
            ...savedAddress,
          };
        } else {
          finalDeliveryAddress = {
            ...deliveryAddress,
            location: currentLocationCoords || { lat: 0, lng: 0 },
          };
        }
      }

      // Prepare order data
      const orderData = {
        vendorId,
        items: orderItems,
        orderType,
        ...(orderType === 'delivery' && finalDeliveryAddress && {
          deliveryAddress: finalDeliveryAddress,
        }),
        scheduleDetails: {
          isScheduled: false,
          scheduleType: 'immediate' as const,
          ...(specialInstructions && { specialInstructions }),
        },
      };

      console.log('Order data:', orderData);

      const response = await createOrder(orderData).unwrap();
      
      console.log('Order response:', response);
      
      if (response.success) {
        console.log('Order successful, clearing cart...');
        dispatch(clearCart());
        
        // Show enhanced success snackbar with emoji animation
        dispatch(showSnackbar({
          message: ' Order placed successfully!',
          type: 'success',
        }));
        
        // Auto navigate to home after 2 seconds
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 2000);
      } else {
        console.log('Order response not successful:', response);
        Alert.alert('Error', 'Order placement failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      Alert.alert(
        'Order Failed',
        error?.data?.message || 'Failed to place order. Please try again.'
      );
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Please Login</Text>
          <Text style={styles.emptyStateText}>
            You need to login to proceed with checkout
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Cart is Empty</Text>
          <Text style={styles.emptyStateText}>
            Add items to your cart to proceed with checkout
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          {vendor && (
            <Text style={styles.vendorInfo}>
              Available services: {vendor.serviceTypes.delivery && 'Delivery'}{vendor.serviceTypes.delivery && vendor.serviceTypes.takeaway && ', '}
              {vendor.serviceTypes.takeaway && 'Takeaway'}
            </Text>
          )}
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[
                styles.orderTypeOption,
                orderType === 'delivery' && styles.orderTypeSelected,
                !isOrderTypeAvailable('delivery') && styles.orderTypeDisabled,
              ]}
              onPress={() => isOrderTypeAvailable('delivery') && setOrderType('delivery')}
              disabled={!isOrderTypeAvailable('delivery')}
            >
              <Ionicons 
                name="bicycle-outline" 
                size={24} 
                color={
                  !isOrderTypeAvailable('delivery') 
                    ? '#D1D5DB' 
                    : orderType === 'delivery' 
                      ? '#22C55E' 
                      : '#6B7280'
                } 
              />
              <Text style={[
                styles.orderTypeText,
                orderType === 'delivery' && styles.orderTypeTextSelected,
                !isOrderTypeAvailable('delivery') && styles.orderTypeTextDisabled,
              ]}>
                Delivery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderTypeOption,
                orderType === 'takeaway' && styles.orderTypeSelected,
                !isOrderTypeAvailable('takeaway') && styles.orderTypeDisabled,
              ]}
              onPress={() => isOrderTypeAvailable('takeaway') && setOrderType('takeaway')}
              disabled={!isOrderTypeAvailable('takeaway')}
            >
              <Ionicons 
                name="bag-outline" 
                size={24} 
                color={
                  !isOrderTypeAvailable('takeaway') 
                    ? '#D1D5DB' 
                    : orderType === 'takeaway' 
                      ? '#22C55E' 
                      : '#6B7280'
                } 
              />
              <Text style={[
                styles.orderTypeText,
                orderType === 'takeaway' && styles.orderTypeTextSelected,
                !isOrderTypeAvailable('takeaway') && styles.orderTypeTextDisabled,
              ]}>
                Takeaway
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address (if delivery selected) */}
        {orderType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            
            {/* Location Prompt for New Users */}
            {showLocationPrompt && (
              <View style={styles.locationPrompt}>
                <Ionicons name="location-outline" size={24} color="#F59E0B" />
                <View style={styles.locationPromptText}>
                  <Text style={styles.locationPromptTitle}>Get Accurate Location</Text>
                  <Text style={styles.locationPromptDesc}>
                    We need your location for accurate delivery. You can use current location or enter address manually.
                  </Text>
                </View>
              </View>
            )}

            {/* Current Location Option */}
            <TouchableOpacity
              style={[
                styles.locationOption,
                useCurrentLocation && styles.locationOptionSelected,
              ]}
              onPress={handleUseCurrentLocation}
              disabled={isUpdatingLocation}
            >
              <View style={styles.locationOptionContent}>
                <Ionicons 
                  name="location" 
                  size={20} 
                  color={useCurrentLocation ? '#22C55E' : '#6B7280'} 
                />
                <View style={styles.locationOptionText}>
                  <Text style={[
                    styles.locationOptionTitle,
                    useCurrentLocation && styles.locationOptionTitleSelected,
                  ]}>
                    Use Current Location
                  </Text>
                </View>
              </View>
              {isUpdatingLocation && (
                <ActivityIndicator size="small" color="#22C55E" />
              )}
            </TouchableOpacity>

            {/* Saved Addresses */}
            {user?.addresses && user.addresses.length > 0 && (
              <View style={styles.savedAddresses}>
                <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>
                {user.addresses.map((address, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.savedAddressOption,
                      selectedAddressIndex === index && !useCurrentLocation && styles.savedAddressSelected,
                    ]}
                    onPress={() => handleSelectAddress(index)}
                  >
                    <View style={styles.savedAddressContent}>
                      <Ionicons 
                        name="home" 
                        size={18} 
                        color={selectedAddressIndex === index && !useCurrentLocation ? '#22C55E' : '#6B7280'} 
                      />
                      <View style={styles.savedAddressText}>
                        <Text style={[
                          styles.savedAddressLabel,
                          selectedAddressIndex === index && !useCurrentLocation && styles.savedAddressLabelSelected,
                        ]}>
                          {address.label || `Address ${index + 1}`}
                        </Text>
                        <Text style={styles.savedAddressDesc}>
                          {address.street}, {address.city}, {address.state} - {address.pincode}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Manual Address Entry */}
            {!useCurrentLocation && (
              <View style={styles.addressContainer}>
                <Text style={styles.manualAddressTitle}>
                  {selectedAddressIndex >= 0 ? 'Edit Address' : 'Enter New Address'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Street Address"
                  value={deliveryAddress.street}
                  onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, street: text }))}
                />
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="City"
                    value={deliveryAddress.city}
                    onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, city: text }))}
                  />
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="State"
                    value={deliveryAddress.state}
                    onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, state: text }))}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Pincode"
                  value={deliveryAddress.pincode}
                  onChangeText={(text) => setDeliveryAddress(prev => ({ ...prev, pincode: text }))}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            )}
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummary}>
            {cart.map((item) => (
              <View key={item._id} style={styles.orderItem}>
                <Text style={styles.orderItemName}>
                  {item.name} x {item.quantity}
                </Text>
                <Text style={styles.orderItemPrice}>
                  ₹{item.price * item.quantity}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions for your order..."
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentContainer}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                styles.paymentSelected, // Always selected since it's the only option
              ]}
              disabled
            >
              <Ionicons 
                name="cash-outline" 
                size={24} 
                color="#22C55E"
              />
              <Text style={[
                styles.paymentText,
                styles.paymentTextSelected,
              ]}>
                Cash on Delivery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
        <View style={styles.billDetails}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{getTotalPrice()}</Text>
          </View>
          {orderType === 'delivery' && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>₹{getDeliveryFee()}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax (0%)</Text>
            <Text style={styles.billValue}>₹{getTaxAmount()}</Text>
          </View>
          <View style={[styles.billRow, styles.billTotal]}>
            <Text style={styles.billTotalLabel}>Total</Text>
            <Text style={styles.billTotalValue}>₹{getFinalTotal()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, isCreatingOrder && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={isCreatingOrder}
        >
          {isCreatingOrder ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.placeOrderText}>Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  orderTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  orderTypeSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  orderTypeTextSelected: {
    color: '#22C55E',
    fontWeight: '600',
  },
  addressContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  orderSummary: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  paymentContainer: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  paymentSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 12,
  },
  paymentTextSelected: {
    color: '#22C55E',
    fontWeight: '600',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  billDetails: {
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  billValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  billTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  placeOrderButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  vendorInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  orderTypeDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  orderTypeTextDisabled: {
    color: '#9CA3AF',
  },
  unavailableText: {
    fontSize: 10,
    color: '#EF4444',
    marginTop: 2,
    fontWeight: '500',
  },
  paymentNote: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  // Location-related styles
  locationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  locationPromptText: {
    flex: 1,
    marginLeft: 12,
  },
  locationPromptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  locationPromptDesc: {
    fontSize: 12,
    color: '#A16207',
    lineHeight: 16,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  locationOptionSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  locationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  locationOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  locationOptionTitleSelected: {
    color: '#22C55E',
    fontWeight: '600',
  },
  locationOptionDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  savedAddresses: {
    marginBottom: 16,
  },
  savedAddressesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  savedAddressOption: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  savedAddressSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  savedAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedAddressText: {
    flex: 1,
    marginLeft: 12,
  },
  savedAddressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  savedAddressLabelSelected: {
    color: '#22C55E',
    fontWeight: '600',
  },
  savedAddressDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  manualAddressTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
});
