import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { VendorCard } from './VendorCard';
import { VendorListSkeleton } from '../Skeleton';
import { Vendor } from '../../store/api/vendorApi';

interface VendorsSectionProps {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  isLoading: boolean;
  searchQuery: string;
  onVendorClick: (vendor: Vendor) => void;
}

export const VendorsSection: React.FC<VendorsSectionProps> = ({
  vendors,
  selectedVendor,
  isLoading,
  searchQuery,
  onVendorClick,
}) => {
  const filteredVendors = vendors.filter((vendor: Vendor) => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.shopDetails.categories.some(category => 
      category.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    vendor.shopDetails.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.section}>
      {isLoading ? (
        <VendorListSkeleton />
      ) : filteredVendors.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorsScroll}>
          {filteredVendors.map((vendor: Vendor, id) => (
            <VendorCard
              key={id}
              vendor={vendor}
              isSelected={selectedVendor?._id === vendor._id}
              onPress={onVendorClick}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyVendors}>
          <Text style={styles.emptyVendorsText}>
            {searchQuery ? 'No vendors found matching your search' : 'No vendors available in your area'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    paddingBottom: 8
  },
  vendorsScroll: {
    marginTop: 8,
  },
  emptyVendors: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyVendorsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
