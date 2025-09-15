import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LocationWithAddress } from "@/services/locationService";

interface SearchHeaderProps {
  userName?: string | null;
  isAuthenticated: boolean;
  currentLocation: LocationWithAddress | null;
  onLocationRefresh: () => void;
  onSearchPress: () => void;
  onNotificationPress: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  userName,
  isAuthenticated,
  currentLocation,
  onLocationRefresh,
  onSearchPress,
  onNotificationPress,
}) => {
  const displayLocation =
    currentLocation?.address?.city ||
    currentLocation?.address?.region ||
    currentLocation?.address?.formattedAddress ||
    "Unknown Location";

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Location Section */}
        <TouchableOpacity style={styles.locationSection} onPress={onLocationRefresh}>
          <Ionicons name="location-outline" size={20} color="#22C55E" />
          <View style={styles.locationText}>
            <Text style={styles.welcomeText}>Hi {userName || (isAuthenticated ? "User" : "Guest")}!</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {displayLocation}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Icons */}
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.actionButton} onPress={onSearchPress}>
            <Ionicons name="search-outline" size={24} color="#22C55E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color="#22C55E" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22C55E",
  },
  locationAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
