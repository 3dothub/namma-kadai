import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLazyGetVendorsQuery } from '../store/api/vendorApi';
import { setVendors, setLoadingVendors, loadLocationBasedData } from '../store/slices/productSlice';
import { RootState } from '../store';

export const useLocationBasedVendors = () => {
  const dispatch = useDispatch();
  const { userLocation, isLoadingVendors, vendors, nearbyVendors } = useSelector(
    (state: RootState) => state.products
  );
  
  const [getVendors, { isLoading, error }] = useLazyGetVendorsQuery();

  const loadVendorsByLocation = async (location: { lat: number; lng: number }) => {
    try {
      dispatch(setLoadingVendors(true));
      
      const result = await getVendors({
        lat: location.lat,
        lng: location.lng,
        radius: 10, // 10km radius
        isActive: true,
      });

      if (result.data?.vendors) {
        dispatch(loadLocationBasedData({
          vendors: result.data.vendors,
          location,
        }));
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      dispatch(setLoadingVendors(false));
    }
  };

  // Auto-load vendors when location changes
  useEffect(() => {
    if (userLocation) {
      loadVendorsByLocation(userLocation);
    }
  }, [userLocation]);

  return {
    vendors,
    nearbyVendors,
    isLoading: isLoadingVendors || isLoading,
    error,
    loadVendorsByLocation,
    hasLocation: !!userLocation,
  };
};
