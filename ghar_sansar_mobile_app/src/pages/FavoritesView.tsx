import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useMobileApp } from '../context/MobileAppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumImage } from '../components/PremiumImage';

const FavoritesView: React.FC = () => {
  const { products, favorites, toggleFavorite, addToCart, setSelectedProductId } = useMobileApp();
  const insets = useSafeAreaInsets();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const handleAddToCart = (product: any) => {
    addToCart(product);
    Alert.alert('Success', `${product.title} added to cart!`);
  };

  return (
    <View style={styles.screen}>
      {/* Header Clear of Notch / Dynamic Island */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <Text style={styles.title}>Wishlist</Text>
      </View>

      {favoriteProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.list}>
            {favoriteProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => setSelectedProductId(product.id)}
              >
                {/* Product Thumbnail */}
                <View style={styles.thumbnailContainer}>
                  <PremiumImage uri={product.image} style={styles.thumbnail} product={product} contentFit="contain" />
                </View>

                {/* Info Column */}
                <View style={styles.info}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{product.price}</Text>
                    <Text style={styles.mrp}>₹{product.actPrice}</Text>
                  </View>
                </View>

                {/* Actions Column */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(product.id)}
                    style={styles.actionBtn}
                  >
                    <FontAwesome name="heart" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAddToCart(product)}
                    style={styles.cartCircleBtn}
                  >
                    <Feather name="shopping-cart" size={14} color="#121212" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F5F6',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#121212',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontWeight: 'bold',
    color: '#8E8E93',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  thumbnailContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#F4F5F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '85%',
    height: '85%',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121212',
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#121212',
  },
  mrp: {
    fontSize: 11,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCircleBtn: {
    backgroundColor: '#C0E800',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C0E800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
});

export default FavoritesView;
