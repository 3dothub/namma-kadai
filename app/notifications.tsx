import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'promotion' | 'system';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Order Confirmed',
    message: 'Your order #1234 has been confirmed and is being prepared.',
    time: '2 min ago',
    read: false,
    type: 'order',
  },
  {
    id: '2',
    title: 'Special Offer',
    message: 'Get 20% off on your next order. Limited time offer!',
    time: '1 hour ago',
    read: false,
    type: 'promotion',
  },
  {
    id: '3',
    title: 'Order Delivered',
    message: 'Your order #1233 has been successfully delivered.',
    time: '2 hours ago',
    read: true,
    type: 'order',
  },
  {
    id: '4',
    title: 'New Vendor Added',
    message: 'Check out new dishes from "Tasty Treats" near you.',
    time: '1 day ago',
    read: true,
    type: 'system',
  },
];

const getIconForType = (type: string) => {
  switch (type) {
    case 'order':
      return 'receipt-outline';
    case 'promotion':
      return 'gift-outline';
    case 'system':
      return 'information-circle-outline';
    default:
      return 'notifications-outline';
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case 'order':
      return '#22C55E';
    case 'promotion':
      return '#F59E0B';
    case 'system':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
};

export default function NotificationScreen() {
  const router = useRouter();

  const handleNotificationPress = (notification: Notification) => {
    // Handle notification press - could navigate to relevant screen
    console.log('Notification pressed:', notification);
  };

  const handleMarkAllRead = () => {
    // Handle mark all as read
    console.log('Mark all as read');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mockNotifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard,
            ]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={getIconForType(notification.type) as any}
                    size={20}
                    color={getColorForType(notification.type)}
                  />
                </View>
                <View style={styles.notificationText}>
                  <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Balance the back button
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unreadCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginLeft: 8,
    marginTop: 4,
  },
});
