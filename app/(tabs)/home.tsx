import { View, Text, FlatList } from 'react-native';
import { useAppSelector } from '../../hooks/useRedux';
import { useGetProductsQuery } from '../../services/productsApi';

export default function Home() {
  // Using RTK Query hook
  const { data: products, isLoading, error } = useGetProductsQuery();
  
  // Using Redux state
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading products!</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>Welcome {isAuthenticated ? 'User' : 'Guest'}!</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text>${item.price}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}
