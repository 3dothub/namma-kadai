import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import { useDispatch } from 'react-redux';
import { useGetVendorProductsQuery } from '@/store/api/vendorApi';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '@/store/api/favoritesApi';
import { Product, getProductMainImage } from '@/store/api/vendorApi';
import { showSnackbar } from '@/store/slices/snackbarSlice';

const { width: screenWidth } = Dimensions.get('window');

interface ScheduleTime {
  id: string;
  label: string;
  time: string;
  available: boolean;
}

const scheduleOptions: ScheduleTime[] = [
  { id: 'immediate', label: 'Now', time: '20-30 mins', available: true },
  { id: 'slot1', label: 'Later Today', time: '6:00 PM - 7:00 PM', available: true },
  { id: 'slot2', label: 'Tomorrow Morning', time: '9:00 AM - 10:00 AM', available: true },
  { id: 'slot3', label: 'Tomorrow Evening', time: '6:00 PM - 7:00 PM', available: false },
];

// Mock rating data - replace with actual API call
const mockRatings = [
  { id: 1, user: 'John D.', rating: 5, comment: 'Excellent quality product!', date: '2024-03-15' },
  { id: 2, user: 'Sarah M.', rating: 4, comment: 'Good value for money', date: '2024-03-10' },
  { id: 3, user: 'Mike R.', rating: 5, comment: 'Fast delivery and fresh products', date: '2024-03-08' },
];

export default function ProductDetailPage() {
  const { id: productId, vendorId } = useLocalSearchParams<{ id: string; vendorId: string }>();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState('immediate');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [isProductFavorite, setIsProductFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Get product data
  const { data: productsData } = useGetVendorProductsQuery(
    { vendorId: vendorId! },
    { skip: !vendorId }
  );

  const product = productsData?.products?.find((p: Product) => p._id === productId);
  const vendor = productsData?.vendor;

  // Favorites mutations
  const [addToFavorites, { isLoading: isAddingToFavorites }] = useAddToFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemovingFromFavorites }] = useRemoveFromFavoritesMutation();


  useEffect(() => {
    if (!product) {
      router.back();
    }
  }, [product, router]);

  useEffect(() => {
    if (vendor?.serviceTypes) {
      if (vendor.serviceTypes.takeaway && !vendor.serviceTypes.delivery) {
        setOrderType('takeaway');
      }
      else if (vendor.serviceTypes.delivery && !vendor.serviceTypes.takeaway) {
        setOrderType('delivery');
      }
      else if (vendor.serviceTypes.delivery) {
        setOrderType('delivery');
      }
      else {
        setOrderType('takeaway');
      }
    }
  }, [vendor]);

  const isOrderTypeAvailable = (type: 'delivery' | 'takeaway') => {
    if (!vendor?.serviceTypes) return true; // Default to available if no vendor info
    return vendor.serviceTypes[type];
  };

  if (!product) {
    return null;
  }

  const handleToggleFavorite = async () => {
    try {
      if (isProductFavorite) {
        await removeFromFavorites(product._id);
        setIsProductFavorite(false);
      } else {
        await addToFavorites(product._id);
        setIsProductFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    dispatch(showSnackbar({
      message: `${quantity} ${product.name} added to cart!`,
      type: 'success',
    }));
  };

  const handleSubmitRating = () => {
    if (userRating === 0) {
      dispatch(showSnackbar({
        message: 'Please select a rating',
        type: 'error',
      }));
      return;
    }
    
    // Submit rating logic here
    dispatch(showSnackbar({
      message: 'Thank you for your rating!',
      type: 'success',
    }));
    setShowRatingForm(false);
    setUserRating(0);
    setUserComment('');
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && setUserRating(i)}
          disabled={!interactive}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={size}
            color={i <= rating ? '#FFD700' : '#D1D5DB'}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderImageCarousel = () => (
    <View style={styles.imageCarouselContainer}>
      <FlatList
        ref={flatListRef}
        data={product.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event: any) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 40));
          setCurrentImageIndex(index);
        }}
        renderItem={({ item }: { item: string }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover"/>
          </View>
        )}
        keyExtractor={(item: string, index: number) => index.toString()}
      />
      
      {/* Image indicators */}
      <View style={styles.imageIndicators}>
        {product.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentImageIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      {/* Favorite button */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={handleToggleFavorite}
        disabled={isAddingToFavorites || isRemovingFromFavorites}
      >
        {isAddingToFavorites || isRemovingFromFavorites ? (
          <Ionicons name="ellipsis-horizontal" size={24} color="#FF6B6B" />
        ) : (
          <Ionicons
            name={isProductFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color="#FF6B6B"
          />
        )}
      </TouchableOpacity>
    </View>
  );

  const totalPrice = (product.offerPrice || product.price) * quantity;
  const averageRating = mockRatings.reduce((sum, rating) => sum + rating.rating, 0) / mockRatings.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#10B981" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        {renderImageCarousel()}

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {/* Rating */}
          <View style={styles.ratingSection}>
            {renderStars(Math.round(averageRating), 20)}
            <Text style={styles.ratingText}>
              {averageRating.toFixed(1)} ({mockRatings.length} reviews)
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              {product.offerPrice && (
                <Text style={styles.originalPrice}>₹{product.price}</Text>
              )}
              <Text style={styles.currentPrice}>₹{product.offerPrice || product.price}</Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>{product.stock} in stock</Text>
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
            </View>
          )}

          {/* Order Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Type</Text>
            {vendor && (
              <Text style={styles.vendorInfo}>
                Available: {vendor.serviceTypes.delivery && 'Delivery'}{vendor.serviceTypes.delivery && vendor.serviceTypes.takeaway && ' • '}
                {vendor.serviceTypes.takeaway && 'Takeaway'}
              </Text>
            )}
            <View style={styles.orderTypeContainer}>
              {/* Only show delivery option if vendor supports it */}
              {isOrderTypeAvailable('delivery') && (
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton, 
                    orderType === 'delivery' && styles.orderTypeActive,
                    !vendor?.serviceTypes.takeaway && styles.orderTypeFullWidth, // Full width if only option
                  ]}
                  onPress={() => setOrderType('delivery')}
                >
                  {orderType !== 'delivery' && (
                    <Ionicons name="bicycle-outline" size={16} color="#64748B" />
                  )}
                  <View style={styles.orderTypeTextContainer}>
                    <Text style={[styles.orderTypeText, orderType === 'delivery' && styles.orderTypeActiveText]}>
                      Delivery
                    </Text>
                    {vendor?.deliverySettings && (
                      <Text style={[styles.orderTypeSubtext, orderType === 'delivery' && styles.orderTypeActiveSubtext]}>
                        ₹{vendor.deliverySettings.deliveryCharge || 0} fee
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              
              {/* Only show takeaway option if vendor supports it */}
              {isOrderTypeAvailable('takeaway') && (
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton, 
                    orderType === 'takeaway' && styles.orderTypeActive,
                    !vendor?.serviceTypes.delivery && styles.orderTypeFullWidth, // Full width if only option
                  ]}
                  onPress={() => setOrderType('takeaway')}
                >
                  {orderType !== 'takeaway' && (
                    <Ionicons name="bag-handle-outline" size={16} color="#64748B" />
                  )}
                  <View style={styles.orderTypeTextContainer}>
                    <Text style={[styles.orderTypeText, orderType === 'takeaway' && styles.orderTypeActiveText]}>
                      Takeaway
                    </Text>
                    <Text style={[styles.orderTypeSubtext, orderType === 'takeaway' && styles.orderTypeActiveSubtext]}>
                      Pickup at store
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Show message if vendor has limited service types */}
            {vendor && (!vendor.serviceTypes.delivery || !vendor.serviceTypes.takeaway) && (
              <Text style={styles.serviceNote}>
                {!vendor.serviceTypes.delivery && vendor.serviceTypes.takeaway && "⚠️ This vendor only offers takeaway service"}
                {vendor.serviceTypes.delivery && !vendor.serviceTypes.takeaway && "ℹ️ This vendor only offers delivery service"}
              </Text>
            )}
          </View>

          {/* Compact Schedule Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Time</Text>
            <View style={styles.scheduleCompact}>
              <TouchableOpacity 
                style={[styles.scheduleCompactOption, selectedSchedule === 'immediate' && styles.scheduleCompactSelected]}
                onPress={() => setSelectedSchedule('immediate')}
              >
                <Ionicons name="time-outline" size={16} color={selectedSchedule === 'immediate' ? '#10B981' : '#6B7280'} />
                <Text style={[styles.scheduleCompactText, selectedSchedule === 'immediate' && styles.scheduleCompactTextSelected]}>
                  ASAP (20-30 mins)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.scheduleCompactOption, selectedSchedule === 'later' && styles.scheduleCompactSelected]}
                onPress={() => {
                  setSelectedSchedule('later');
                  dispatch(showSnackbar({
                    message: 'Schedule order feature coming soon!',
                    type: 'info',
                  }));
                }}
              >
                <Ionicons name="calendar-outline" size={16} color={selectedSchedule === 'later' ? '#10B981' : '#6B7280'} />
                <Text style={[styles.scheduleCompactText, selectedSchedule === 'later' && styles.scheduleCompactTextSelected]}>
                  Schedule Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={18} color={quantity <= 1 ? '#CBD5E1' : '#10B981'} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                <Ionicons name="add" size={18} color={quantity >= product.stock ? '#CBD5E1' : '#10B981'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Ratings and Reviews */}
          <View style={styles.section}>
            <View style={styles.ratingHeader}>
              <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
              <TouchableOpacity
                style={styles.addRatingButton}
                onPress={() => setShowRatingForm(!showRatingForm)}
              >
                <Ionicons name="add" size={16} color="#10B981" />
                <Text style={styles.addRatingText}>Add Review</Text>
              </TouchableOpacity>
            </View>

            {showRatingForm && (
              <View style={styles.ratingForm}>
                <Text style={styles.ratingFormTitle}>Rate this product</Text>
                {renderStars(userRating, 28, true)}
                <Text style={styles.commentLabel}>Add a comment (optional)</Text>
                <View style={styles.commentInput}>
                  <Text
                    style={styles.commentText}
                    onPress={() => {
                      // In a real app, you'd open a text input modal or navigate to a review page
                      dispatch(showSnackbar({
                        message: 'Review feature coming soon!',
                        type: 'info',
                      }));
                    }}
                  >
                    {userComment || 'Tap to add a comment...'}
                  </Text>
                </View>
                <View style={styles.ratingFormButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowRatingForm(false);
                      setUserRating(0);
                      setUserComment('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitRating}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Reviews List */}
            <View style={styles.reviewsList}>
              {mockRatings.map((rating) => (
                <View key={rating.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>{rating.user}</Text>
                    <Text style={styles.reviewDate}>{rating.date}</Text>
                  </View>
                  {renderStars(rating.rating, 14)}
                  <Text style={styles.reviewComment}>{rating.comment}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{totalPrice}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFFFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  imageCarouselContainer: {
    height: 'auto',
    position: 'relative',
    backgroundColor: '#F8FFF8',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    aspectRatio: 1,
  },
  imageWrapper: {
    width: screenWidth - 40,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  activeIndicator: {
    backgroundColor: '#10B981',
    width: 20,
    height: 6,
    borderRadius: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productInfo: {
    padding: 24,
    paddingTop: 20,
  },
  productName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: 24,
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  originalPrice: {
    fontSize: 14,
    color: '#64748B',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -1,
  },
  priceRow: {
    marginBottom: 8,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stockText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 4,
    borderRadius: 16,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  orderTypeActive: {
    backgroundColor: '#10B981',
  },
  orderTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderTypeActiveText: {
    color: '#FFFFFF',
  },
  orderTypeTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  orderTypeSubtext: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  orderTypeActiveSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  orderTypeFullWidth: {
    flex: 1,
  },
  vendorInfo: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  serviceNote: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scheduleCompact: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 4,
    borderRadius: 12,
  },
  scheduleCompactOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
    gap: 4,
  },
  scheduleCompactSelected: {
    backgroundColor: '#10B981',
  },
  scheduleCompactText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleCompactTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scheduleContainer: {
    gap: 12,
  },
  scheduleOption: {
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
  scheduleOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  scheduleOptionDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  scheduleOptionContent: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scheduleLabelActive: {
    color: '#10B981',
  },
  scheduleLabelDisabled: {
    color: '#9CA3AF',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  scheduleTimeActive: {
    color: '#059669',
  },
  scheduleTimeDisabled: {
    color: '#D1D5DB',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  quantityText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    minWidth: 40,
    textAlign: 'center',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addRatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addRatingText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  ratingForm: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  ratingFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  commentLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
  commentText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  ratingFormButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
  },
  bottomAction: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    backgroundColor: '#FAFFFE',
    borderTopWidth: 0,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -1,
  },
  addToCartButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});