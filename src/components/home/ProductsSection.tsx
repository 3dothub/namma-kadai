import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { Vendor, Product } from '@/store/api/vendorApi';

interface ProductsSectionProps {
  selectedVendor: Vendor | null;
  products: Product[];
  isLoading: boolean;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  selectedVendor,
  products,
  isLoading,
  onToggleFavorite,
  onAddToCart,
}) => {
  if (!selectedVendor) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{selectedVendor.name}</Text>
      {isLoading ? (
        <ProductGridSkeleton />
      ) : (
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              vendorId={selectedVendor._id}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
            />
          ))}
          
          {products.length === 0 && !isLoading && (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyProductsText}>No products available</Text>
            </View>
          )}
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
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyProducts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
