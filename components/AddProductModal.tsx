import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useDispatch } from 'react-redux';
import { addProduct, Product } from '../store/slices/productSlice';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface ProductData {
  vendorName: string;
  name: string;
  basePrice: string;
  offerPrice: string;
  description: string;
  deliveryTime: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [productData, setProductData] = useState<ProductData>({
    vendorName: '',
    name: '',
    basePrice: '',
    offerPrice: '',
    description: '',
    deliveryTime: '',
  });

  const handleInputChange = (field: keyof ProductData, value: string) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!productData.vendorName.trim()) {
      Alert.alert('Error', 'Please enter vendor name');
      return false;
    }
    if (!productData.name.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return false;
    }
    if (!productData.basePrice.trim() || isNaN(Number(productData.basePrice))) {
      Alert.alert('Error', 'Please enter valid base price');
      return false;
    }
    if (productData.offerPrice && isNaN(Number(productData.offerPrice))) {
      Alert.alert('Error', 'Please enter valid offer price');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Create product object
    const newProduct: Product = {
      id: Date.now(), // Simple ID generation
      name: productData.name.trim(),
      price: Number(productData.basePrice),
      offerPrice: productData.offerPrice ? Number(productData.offerPrice) : undefined,
      image: 'assets/icon.png',
      description: productData.description.trim() || `Fresh ${productData.name.toLowerCase()}`,
      deliveryTime: productData.deliveryTime.trim() || '30 mins',
      vendorName: productData.vendorName.trim(),
    };

    // Dispatch to Redux store
    dispatch(addProduct(newProduct));

    // Reset form
    setProductData({
      vendorName: '',
      name: '',
      basePrice: '',
      offerPrice: '',
      description: '',
      deliveryTime: '',
    });

    onSuccess(`${productData.name} added successfully!`);
    onClose();
  };

  const handleClose = () => {
    setProductData({
      vendorName: '',
      name: '',
      basePrice: '',
      offerPrice: '',
      description: '',
      deliveryTime: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          style={styles.modalContainer}
          animation="slideInUp"
          duration={300}
          easing="ease-out"
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Product Image Preview */}
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <Image
                  source={require('../assets/icon.png')}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.imageNote}>Product will use default icon (you can update later)</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vendor Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={productData.vendorName}
                  onChangeText={(value) => handleInputChange('vendorName', value)}
                  placeholder="Enter vendor name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={productData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter product name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Base Price *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productData.basePrice}
                    onChangeText={(value) => handleInputChange('basePrice', value)}
                    placeholder="₹0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Offer Price</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productData.offerPrice}
                    onChangeText={(value) => handleInputChange('offerPrice', value)}
                    placeholder="₹0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Delivery Time</Text>
                <TextInput
                  style={styles.textInput}
                  value={productData.deliveryTime}
                  onChangeText={(value) => handleInputChange('deliveryTime', value)}
                  placeholder="e.g., 30 mins"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={productData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Enter product description"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Add Product</Text>
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
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  modalContent: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#22C55E',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  imageNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
