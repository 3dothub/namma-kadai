import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vendor, isVendorOpen, getVendorImage } from '../../src/store/api/vendorApi';

interface VendorCardProps {
  vendor: Vendor;
  isSelected: boolean;
  onPress: (vendor: Vendor) => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.vendorCard, isSelected && styles.selectedVendorCard]}
      onPress={() => onPress(vendor)}
    >
      <View style={styles.vendorIconContainer}>
        <Image
          source={{ uri: getVendorImage(vendor) }}
          style={styles.vendorIcon}
          resizeMode="cover"
          defaultSource={require('../../assets/icon.png')}
        />
        {isVendorOpen(vendor) && (
          <View style={styles.openIndicator}>
            <Text style={styles.openText}>•</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  vendorCard: {
    alignItems: 'center',
    padding: 4,
    borderRadius: 50,
    backgroundColor: 'transparent',
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 12,
  },
  selectedVendorCard: {
    borderColor: '#22C55E',
  },
  vendorIconContainer: {
    position: 'relative',
  },
  vendorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  openIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#22C55E',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openText: {
    color: '#fff',
    fontSize: 6,
    fontWeight: '700',
  },
});
