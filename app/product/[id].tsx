import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  Pressable,
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

  // Mock product images - in real app, get from product.images
  const productImages = product ? [
    getProductMainImage(product),
    getProductMainImage(product), // Add more images if available
    getProductMainImage(product),
  ] : [];

  useEffect(() => {
    if (!product) {
      // Product not found, go back
      router.back();
    }
  }, [product, router]);

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

  // Helper function to check if order type is available
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
        data={productImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event: any) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentImageIndex(index);
        }}
        renderItem={({ item }: { item: string }) => (
          <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="contain" />
        )}
        keyExtractor={(item: string, index: number) => index.toString()}
      />
      
      {/* Image indicators */}
      <View style={styles.imageIndicators}>
        {productImages.map((_, index) => (
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
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
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
            {product.offerPrice && (
              <Text style={styles.originalPrice}>₹{product.price}</Text>
            )}
            <Text style={styles.currentPrice}>₹{product.offerPrice || product.price}</Text>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>{product.stock} left</Text>
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
                  <Ionicons name="bicycle-outline" size={18} color={orderType === 'delivery' ? '#10B981' : '#6B7280'} />
                  <View style={styles.orderTypeTextContainer}>
                    <Text style={[styles.orderTypeText, orderType === 'delivery' && styles.orderTypeActiveText]}>
                      Delivery
                    </Text>
                    {vendor?.deliverySettings && (
                      <Text style={styles.orderTypeSubtext}>
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
                  <Ionicons name="bag-handle-outline" size={18} color={orderType === 'takeaway' ? '#10B981' : '#6B7280'} />
                  <View style={styles.orderTypeTextContainer}>
                    <Text style={[styles.orderTypeText, orderType === 'takeaway' && styles.orderTypeActiveText]}>
                      Takeaway
                    </Text>
                    <Text style={styles.orderTypeSubtext}>
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
                <Ionicons name="remove" size={20} color={quantity <= 1 ? '#D1D5DB' : '#6B7280'} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                <Ionicons name="add" size={20} color={quantity >= product.stock ? '#D1D5DB' : '#6B7280'} />
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  imageCarouselContainer: {
    height: screenWidth * 0.5,
    position: 'relative',
  },
  carouselImage: {
    width: screenWidth,
    height: screenWidth * 0.5,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productInfo: {
    padding: 24,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
  },
  stockBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
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
  orderTypeTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  orderTypeSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  orderTypeFullWidth: {
    flex: 1,
  },
  vendorInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  serviceNote: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scheduleCompact: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleCompactOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  scheduleCompactSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  scheduleCompactText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  scheduleCompactTextSelected: {
    color: '#10B981',
    fontWeight: '600',
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
    gap: 24,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
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
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  addToCartButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});