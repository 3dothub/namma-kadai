import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetMyOrdersQuery } from '@/store/api/orderApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { router } from 'expo-router';

export default function OrderScreen() {
  const [selectedTab, setSelectedTab] = useState('active');
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { 
    data: ordersResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetMyOrdersQuery();

  const orders = ordersResponse?.orders || [];
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'dispatched'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#22C55E';
      case 'pending':
        return '#F59E0B';
      case 'dispatched':
        return '#3B82F6';
      case 'delivered':
        return '#8B5CF6';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'pending':
        return 'time-outline';
      case 'dispatched':
        return 'car-outline';
      case 'delivered':
        return 'bag-check-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'time-outline';
    }
  };

  const formatOrderTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case 'pending':
        return '15-30 mins';
      case 'confirmed':
        return '20-35 mins';
      case 'dispatched':
        return '10-15 mins';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  };

  const handleProceedToCheckout = () => {
    router.push('/checkout');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>Please Login</Text>
          <Text style={styles.emptyStateText}>
            You need to login to view your orders
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Completed ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {isLoading && orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>Loading Orders...</Text>
            <Text style={styles.emptyStateText}>Please wait while we fetch your orders</Text>
          </View>
        ) : (
          (selectedTab === 'active' ? activeOrders : completedOrders).map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Image 
                    source={require('@/assets/icon.png')} 
                    style={styles.orderImage} 
                  />
                  <View style={styles.orderBasicInfo}>
                    <Text style={styles.orderVendor}>Order #{order._id.slice(-6)}</Text>
                    <Text style={styles.orderTime}>{formatOrderTime(order.createdAt)}</Text>
                  </View>
                </View>
                <View style={styles.orderStatus}>
                  <Ionicons 
                    name={getStatusIcon(order.status) as any} 
                    size={16} 
                    color={getStatusColor(order.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderItems}>
                  {order.items.map(item => `${item.name} x ${item.quantity}`).join(', ')}
                </Text>
                {order.deliveryAddress && (
                  <Text style={styles.orderAddress}>
                    <Ionicons name="location-outline" size={12} color="#6B7280" />
                    {' '}{order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </Text>
                )}
                {order.orderType === 'takeaway' && (
                  <Text style={styles.orderAddress}>
                    <Ionicons name="bag-outline" size={12} color="#6B7280" />
                    {' '}Takeaway Order
                  </Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>Total: ₹{order.totalAmount}</Text>
                {!['delivered', 'cancelled'].includes(order.status) && (
                  <TouchableOpacity style={styles.trackButton}>
                    <Ionicons name="navigate-outline" size={16} color="#fff" />
                    <Text style={styles.trackButtonText}>Track Order</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'delivered' && (
                  <TouchableOpacity style={styles.reorderButton}>
                    <Ionicons name="refresh-outline" size={16} color="#22C55E" />
                    <Text style={styles.reorderButtonText}>Reorder</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!['delivered', 'cancelled'].includes(order.status) && (
                <View style={styles.estimatedTime}>
                  <Ionicons name="time-outline" size={14} color="#22C55E" />
                  <Text style={styles.estimatedTimeText}>
                    Estimated delivery: {getEstimatedTime(order.status)}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        {(selectedTab === 'active' ? activeOrders : completedOrders).length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons 
              name={selectedTab === 'active' ? 'receipt-outline' : 'checkmark-done-outline'} 
              size={64} 
              color="#D1D5DB" 
            />
            <Text style={styles.emptyStateTitle}>
              {selectedTab === 'active' ? 'No Active Orders' : 'No Completed Orders'}
            </Text>
            <Text style={styles.emptyStateText}>
              {selectedTab === 'active' 
                ? 'Start shopping to see your orders here' 
                : 'Your completed orders will appear here'
              }
            </Text>
            {selectedTab === 'active' && (
              <TouchableOpacity 
                style={styles.shopNowButton}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Text style={styles.shopNowButtonText}>Shop Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#22C55E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#22C55E',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'contain',
  },
  orderBasicInfo: {
    flex: 1,
  },
  orderVendor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderItems: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  orderAddress: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reorderButtonText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  estimatedTimeText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  shopNowButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
