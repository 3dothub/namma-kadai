import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock Orders Data
const mockOrders = [
  {
    id: 1,
    vendor: 'Bags Minerals',
    estimatedTime: '20 mins',
    image: require('../../assets/icon.png'),
    status: 'preparing',
    items: ['20L Water Can x 1'],
    total: 40,
    orderTime: '2 hours ago',
    deliveryAddress: '123 Main Street, Bangalore'
  },
  {
    id: 2,
    vendor: 'A1 Cake Shop',
    estimatedTime: '35 mins',
    image: require('../../assets/icon.png'),
    status: 'confirmed',
    items: ['Chocolate Cake x 1'],
    total: 450,
    orderTime: '1 hour ago',
    deliveryAddress: '123 Main Street, Bangalore'
  },
  {
    id: 3,
    vendor: "Komala's Kitchen",
    estimatedTime: 'Delivered',
    image: require('../../assets/icon.png'),
    status: 'delivered',
    items: ['South Indian Thali x 2'],
    total: 240,
    orderTime: 'Yesterday',
    deliveryAddress: '123 Main Street, Bangalore'
  }
];

export default function OrderScreen() {
  const [selectedTab, setSelectedTab] = useState('active');

  const activeOrders = mockOrders.filter(order => order.status !== 'delivered');
  const completedOrders = mockOrders.filter(order => order.status === 'delivered');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#22C55E';
      case 'preparing':
        return '#F59E0B';
      case 'delivered':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'preparing':
        return 'restaurant-outline';
      case 'delivered':
        return 'bag-check-outline';
      default:
        return 'time-outline';
    }
  };

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {(selectedTab === 'active' ? activeOrders : completedOrders).map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <Image source={order.image} style={styles.orderImage} />
                <View style={styles.orderBasicInfo}>
                  <Text style={styles.orderVendor}>{order.vendor}</Text>
                  <Text style={styles.orderTime}>{order.orderTime}</Text>
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
                {order.items.join(', ')}
              </Text>
              <Text style={styles.orderAddress}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                {' '}{order.deliveryAddress}
              </Text>
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>Total: ₹{order.total}</Text>
              {order.status !== 'delivered' && (
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

            {order.status !== 'delivered' && (
              <View style={styles.estimatedTime}>
                <Ionicons name="time-outline" size={14} color="#22C55E" />
                <Text style={styles.estimatedTimeText}>
                  Estimated delivery: {order.estimatedTime}
                </Text>
              </View>
            )}
          </View>
        ))}

        {(selectedTab === 'active' ? activeOrders : completedOrders).length === 0 && (
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
});
