import { useEffect, useState } from 'react';
import { useGetVendorProductsQuery } from '../store/api/vendorApi';
import { Product } from '../store/api/vendorApi';

export const useVendorProducts = (vendorId: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetVendorProductsQuery(
    { vendorId: vendorId! },
    { skip: !vendorId }
  );

  useEffect(() => {    
    if (data?.products) {
      setProducts(data.products);
    } else {
      setProducts([]);
    }
  }, [data]);

  return {
    products,
    isLoading,
    error,
    refetch,
  };
};
