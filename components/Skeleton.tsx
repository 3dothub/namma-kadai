import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  children,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (children) {
    return (
      <View style={style}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width,
          height: height,
          borderRadius,
          opacity,
        } as ViewStyle,
        style,
      ]}
    />
  );
};

// Vendor Card Skeleton
export const VendorCardSkeleton: React.FC = () => {
  return (
    <View style={styles.vendorCardSkeleton}>
      <Skeleton
        width={60}
        height={60}
        borderRadius={30}
        style={styles.vendorIconSkeleton}
      />
    </View>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.productCardSkeleton}>
      <Skeleton
        width="100%"
        height={120}
        borderRadius={8}
        style={styles.productImageSkeleton}
      />
      <View style={styles.productInfoSkeleton}>
        <Skeleton width="80%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
};

// Vendor List Skeleton
export const VendorListSkeleton: React.FC = () => {
  return (
    <View style={styles.vendorListSkeleton}>
      {Array.from({ length: 5 }).map((_, index) => (
        <VendorCardSkeleton key={index} />
      ))}
    </View>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC = () => {
  return (
    <View style={styles.productGridSkeleton}>
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  vendorCardSkeleton: {
    alignItems: 'center',
    padding: 4,
    minWidth: 70,
    marginRight: 12,
  },
  vendorIconSkeleton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  vendorListSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  productCardSkeleton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImageSkeleton: {
    marginBottom: 8,
  },
  productInfoSkeleton: {
    alignItems: 'center',
  },
  productGridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
