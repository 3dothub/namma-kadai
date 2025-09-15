import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLazyGetVendorsQuery } from "../store/api/vendorApi";
import { setVendors, setLoadingVendors, setLoadingProducts } from "../store/slices/productSlice";
import { setCurrentLocation } from "../store/slices/userSlice";
import { RootState } from "../store";
import { AddressData } from "@/services/locationService";

export const useLocationBasedVendors = () => {
  const dispatch = useDispatch();
  const { currentLocation } = useSelector((state: RootState) => state.user);
  const { isLoadingVendors, vendors, nearbyVendors } = useSelector((state: RootState) => state.products);

  const [getVendors, { isLoading, error }] = useLazyGetVendorsQuery();

  const loadVendorsByLocation = async (location: { lat: number; lng: number; address: AddressData }) => {
    try {
      dispatch(setLoadingVendors(true));
      dispatch(setLoadingProducts(true)); // Also set products loading

      // Update current location in user state
      dispatch(setCurrentLocation(location));

      const result = await getVendors({
        lat: location.lat,
        lng: location.lng,
        radius: 10,
        isActive: true,
      });

      if (result.data?.vendors) {
        dispatch(setVendors(result.data.vendors)); // This will also set isLoadingProducts to false
      }
    } catch (error) {
      console.error("Error loading vendors:", error);
      dispatch(setLoadingProducts(false)); // Ensure loading state is cleared on error
    } finally {
      dispatch(setLoadingVendors(false));
    }
  };

  // Auto-load vendors when location changes
  useEffect(() => {
    if (currentLocation) {
      loadVendorsByLocation(currentLocation);
    }
  }, [currentLocation]);

  return {
    vendors,
    nearbyVendors,
    isLoading: isLoadingVendors || isLoading,
    error,
    loadVendorsByLocation,
    hasLocation: !!currentLocation,
  };
};
