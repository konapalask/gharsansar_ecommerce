import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMobileApp, Product } from '../context/MobileAppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumImage } from '../components/PremiumImage';

const { width: screenWidth } = Dimensions.get('window');

// ----------------------------------------------------------------------
// MEMOIZED PRODUCT CARD FOR DISCOVERY SLIDES
// ----------------------------------------------------------------------
interface ExploreProductCardProps {
  product: Product;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onPress: (id: string) => void;
  onAddToCart: (product: Product, e: any) => void;
}

const ExploreProductCard: React.FC<ExploreProductCardProps> = React.memo(({
  product,
  isFav,
  onToggleFav,
  onPress,
  onAddToCart
}) => {
  const cardScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(cardScale, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const handleHeartPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    onToggleFav(product.id);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.5, duration: 100, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 3, useNativeDriver: true })
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <TouchableOpacity
        style={styles.exploreItemCard}
        activeOpacity={0.92}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(product.id)}
      >
        <TouchableOpacity style={styles.cardWishlistBtn} onPress={handleHeartPress}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <FontAwesome name={isFav ? "heart" : "heart-o"} size={13} color={isFav ? '#FF3B30' : '#8E8E93'} />
          </Animated.View>
        </TouchableOpacity>

        <PremiumImage
          uri={product.image}
          style={styles.exploreCardImg}
          product={product}
          contentFit="contain"
        />
        
        {/* Verified Rating Badge */}
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={8} color="#C5A880" />
          <Text style={styles.ratingText}>{product.rating} ★</Text>
          <Text style={styles.ratingCount}>({product.reviewsCount || 8})</Text>
        </View>

        <View style={styles.exploreCardInfo}>
          <Text style={styles.exploreCardTitle} numberOfLines={1}>{product.title}</Text>
          <View style={styles.exploreCardBottomRow}>
            <View>
              <Text style={styles.exploreCardPrice}>₹{product.price}</Text>
              {product.actPrice > product.price && (
                <Text style={styles.exploreCardMrp}>₹{product.actPrice}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.exploreCardAddBtn}
              activeOpacity={0.7}
              onPress={(e) => onAddToCart(product, e)}
            >
              <Ionicons name="add" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ----------------------------------------------------------------------
// CATEGORY ICON MAP
// ----------------------------------------------------------------------
const CATEGORY_ICONS: { [key: string]: any } = {
  'All': 'grid-outline',
  'Cello': 'restaurant-outline',
  'Bottles & Flasks': 'wine-outline',
  'Kitchen & Steel': 'flame-outline',
  'Home Decor': 'home-outline',
  'Handicrafts & Gifts': 'gift-outline',
  'Garden & Birds': 'leaf-outline',
  'Aquarium': 'fish-outline',
  'Premium Mats': 'layers-outline'
};

// ----------------------------------------------------------------------
// EXPLORE VIEW COMPONENT
// ----------------------------------------------------------------------
const ExploreView: React.FC = () => {
  const {
    products,
    favorites,
    toggleFavorite,
    setSelectedProductId,
    categories,
    setSelectedCategory,
    addToCart,
    recentlyViewed
  } = useMobileApp();

  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Search Placeholder Rotation
  const placeholders = [
    'Search Kitchen Items...',
    'Search Aquarium Products...',
    'Search Home Decor...',
    'Search Bottles & Flasks...',
    'Search Cello Dinnerware...'
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholderOpacity = useRef(new Animated.Value(1)).current;

  // Staggered Mount Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-15)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const searchTranslateY = useRef(new Animated.Value(10)).current;
  const categoriesOpacity = useRef(new Animated.Value(0)).current;
  const categoriesTranslateY = useRef(new Animated.Value(10)).current;

  // Section staggered reveal opacities
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const trendingOpacity = useRef(new Animated.Value(0)).current;
  const collectionsOpacity = useRef(new Animated.Value(0)).current;
  const popularOpacity = useRef(new Animated.Value(0)).current;
  const arrivalsOpacity = useRef(new Animated.Value(0)).current;
  const topRatedOpacity = useRef(new Animated.Value(0)).current;
  const suggestionsOpacity = useRef(new Animated.Value(0)).current;

  // Flying particle state
  const flyAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const flyScale = useRef(new Animated.Value(1)).current;
  const flyOpacity = useRef(new Animated.Value(0)).current;

  // Placeholder Rotation Cycle
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(placeholderOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        Animated.timing(placeholderOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Run entrance stagger sequence
  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(headerTranslateY, { toValue: 0, duration: 400, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(searchOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(searchTranslateY, { toValue: 0, duration: 400, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(categoriesOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(categoriesTranslateY, { toValue: 0, duration: 400, useNativeDriver: true })
      ]),
      Animated.timing(heroOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(trendingOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(collectionsOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(popularOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(arrivalsOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(topRatedOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(suggestionsOpacity, { toValue: 1, duration: 350, useNativeDriver: true })
    ]).start();
  }, []);

  const handleProductPress = useCallback((id: string) => {
    setSelectedProductId(id);
  }, [setSelectedProductId]);

  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavorite(id);
  }, [toggleFavorite]);

  // Dynamic curves flying particle
  const animateFlyToCart = (startX: number, startY: number) => {
    flyAnim.setValue({ x: startX, y: startY });
    flyScale.setValue(1.4);
    flyOpacity.setValue(1);

    const targetX = screenWidth / 2;
    const { height: screenHeight } = Dimensions.get('window');
    const targetY = screenHeight - 65;

    Animated.parallel([
      Animated.timing(flyAnim.x, { toValue: targetX, duration: 500, useNativeDriver: true }),
      Animated.timing(flyAnim.y, { toValue: targetY, duration: 500, useNativeDriver: true }),
      Animated.timing(flyScale, { toValue: 0.1, duration: 500, useNativeDriver: true }),
      Animated.timing(flyOpacity, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start(() => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err) {}
    });
  };

  const handleAddToCart = useCallback((product: Product, e: any) => {
    addToCart(product);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {}

    let startX = screenWidth / 2;
    let startY = Dimensions.get('window').height / 2;
    if (e && e.nativeEvent) {
      startX = e.nativeEvent.pageX || startX;
      startY = e.nativeEvent.pageY || startY;
    }
    animateFlyToCart(startX, startY);
  }, [addToCart]);

  // Dynamic curated calculations
  const trendingCategories = useMemo(() => {
    return categories.slice(0, 8);
  }, [categories]);

  const popularProducts = useMemo(() => {
    return products.filter(p => p.rating >= 4.6).slice(0, 8);
  }, [products]);

  const newArrivals = useMemo(() => {
    return [...products].reverse().slice(0, 8);
  }, [products]);

  const topRatedProducts = useMemo(() => {
    return products.filter(p => p.rating >= 4.8).slice(0, 8);
  }, [products]);

  // "Just For You" Suggestions
  const justForYouProducts = useMemo(() => {
    // If recently viewed is populated, recommend items from those categories
    if (recentlyViewed.length > 0) {
      const recentCats = Array.from(new Set(recentlyViewed.map(r => r.category)));
      const matches = products.filter(p => recentCats.includes(p.category) && !recentlyViewed.map(r => r.id).includes(p.id));
      if (matches.length > 0) {
        return matches.slice(0, 8);
      }
    }
    // Fallback recommendations based on high rating/match percent
    return products.filter(p => p.matchPercent >= 90).slice(4, 12);
  }, [products, recentlyViewed]);

  // Filtered Search Results
  const searchFilteredProducts = useMemo(() => {
    if (!searchQuery.trim() && activeCategory === 'All') return [];
    
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = !searchQuery.trim() ||
                            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory, products]);

  const showSearchGrid = searchQuery.trim().length > 0 || activeCategory !== 'All';

  // Category selection handler
  const selectCategory = (catName: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setActiveCategory(catName);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
  };

  // Memoized Item Render for Search FlatList
  const renderGridItem = useCallback(({ item }: { item: Product }) => {
    const isFav = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.gridProductCard}
        activeOpacity={0.9}
        onPress={() => handleProductPress(item.id)}
      >
        <View style={styles.gridImageContainer}>
          <PremiumImage
            uri={item.image}
            style={styles.gridProductImage}
            product={item}
            contentFit="contain"
          />
          <TouchableOpacity
            style={styles.gridFavBtn}
            activeOpacity={0.7}
            onPress={() => handleToggleFavorite(item.id)}
          >
            <FontAwesome name={isFav ? "heart" : "heart-o"} size={14} color={isFav ? '#FF3B30' : '#8E8E93'} />
          </TouchableOpacity>

          <View style={styles.gridRatingBadge}>
            <FontAwesome name="star" size={8} color="#C5A880" />
            <Text style={styles.gridRatingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.gridProductInfo}>
          <Text style={styles.gridProductTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.gridPriceRow}>
            <Text style={styles.gridPriceText}>₹{item.price}</Text>
            {item.actPrice > item.price && (
              <Text style={styles.gridMrpText}>₹{item.actPrice}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.gridAddCartBtn}
            activeOpacity={0.8}
            onPress={(e) => handleAddToCart(item, e)}
          >
            <Text style={styles.gridAddCartBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [favorites, handleToggleFavorite, handleProductPress, handleAddToCart]);

  const categoriesFilterList = ['All', 'Cello', 'Bottles & Flasks', 'Kitchen & Steel', 'Home Decor', 'Handicrafts & Gifts', 'Garden & Birds', 'Aquarium'];

  const renderDiscoveryHub = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Curated Living spaces Hero */}
        <Animated.View style={[styles.curatedHero, { opacity: heroOpacity }]}>
          <PremiumImage
            uri="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600"
            style={styles.heroBackground}
            contentFit="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>CURATED SPACES</Text>
            <Text style={styles.heroTitle}>Bespoke Living Collection</Text>
            <Text style={styles.heroDesc}>Explore premium artisanal vessels, insulated flasks and brass works.</Text>
            <TouchableOpacity
              style={styles.heroBtn}
              activeOpacity={0.8}
              onPress={() => selectCategory('Home Decor')}
            >
              <Text style={styles.heroBtnText}>Discover Now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 1. TRENDING CATEGORIES */}
        <Animated.View style={[styles.section, { opacity: trendingOpacity }]}>
          <Text style={styles.sectionTitle}>Trending Categories</Text>
          <View style={styles.categoriesGrid}>
            {trendingCategories.map((cat, index) => {
              const bgColors = ['#F9EDF3', '#EDF5FA', '#FAF7ED', '#EDFAF3', '#F2EDFA', '#FAF2ED', '#EDFAF7', '#F5FAF0'];
              const textColors = ['#C24D85', '#3E769E', '#9E7C3E', '#3E9E67', '#763E9E', '#9E5B3E', '#3E9E8A', '#609E3E'];
              const colorConfig = {
                bg: bgColors[index % bgColors.length],
                text: textColors[index % textColors.length]
              };
              return (
                <TouchableOpacity
                  key={cat.name || index}
                  style={[styles.categoryCardGrid, { backgroundColor: colorConfig.bg }]}
                  activeOpacity={0.85}
                  onPress={() => selectCategory(cat.name)}
                >
                  <Text style={[styles.categoryCardGridLabel, { color: colorConfig.text }]}>{cat.name}</Text>
                  {cat.image ? (
                    <PremiumImage
                      uri={cat.image}
                      style={styles.categoryCardGridImg}
                      contentFit="contain"
                    />
                  ) : (
                    <Feather name="arrow-right-circle" size={16} color={colorConfig.text} style={styles.categoryCardGridIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* 2. CURATED FEATURED COLLECTIONS */}
        <Animated.View style={[styles.section, { opacity: collectionsOpacity }]}>
          <Text style={styles.sectionTitle}>Featured Collections</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.curatedCollectionsScroll}>
            <TouchableOpacity
              style={[styles.collectionBannerCard, { backgroundColor: '#F8F1EB' }]}
              activeOpacity={0.9}
              onPress={() => selectCategory('Cello')}
            >
              <View style={styles.collectionBannerInfo}>
                <Text style={styles.collectionTag}>BRAND SPOTLIGHT</Text>
                <Text style={styles.collectionTitle}>Cello Opalware</Text>
                <Text style={styles.collectionDesc}>Elegant dinner sets, plates and bowls.</Text>
              </View>
              <PremiumImage
                uri="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=200"
                style={styles.collectionImg}
                contentFit="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.collectionBannerCard, { backgroundColor: '#EBF3F5' }]}
              activeOpacity={0.9}
              onPress={() => selectCategory('Kitchen & Steel')}
            >
              <View style={styles.collectionBannerInfo}>
                <Text style={styles.collectionTag}>COOKING ESSENTIALS</Text>
                <Text style={styles.collectionTitle}>Steel Cookware</Text>
                <Text style={styles.collectionDesc}>Triple-ply heavy duty stainless utensils.</Text>
              </View>
              <PremiumImage
                uri="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=200"
                style={styles.collectionImg}
                contentFit="contain"
              />
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* 3. POPULAR PRODUCTS */}
        <Animated.View style={[styles.section, { opacity: popularOpacity }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInline}>Popular Products</Text>
            <TouchableOpacity onPress={() => selectCategory('All')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {popularProducts.map((p) => (
              <ExploreProductCard
                key={p.id}
                product={p}
                isFav={favorites.includes(p.id)}
                onToggleFav={handleToggleFavorite}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* 4. NEW ARRIVALS */}
        <Animated.View style={[styles.section, { opacity: arrivalsOpacity }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInline}>New Arrivals</Text>
            <TouchableOpacity onPress={() => selectCategory('All')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {newArrivals.map((p) => (
              <ExploreProductCard
                key={p.id}
                product={p}
                isFav={favorites.includes(p.id)}
                onToggleFav={handleToggleFavorite}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* 5. TOP RATED PRODUCTS */}
        <Animated.View style={[styles.section, { opacity: topRatedOpacity }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInline}>Top Rated Products</Text>
            <TouchableOpacity onPress={() => selectCategory('All')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {topRatedProducts.map((p) => (
              <ExploreProductCard
                key={p.id}
                product={p}
                isFav={favorites.includes(p.id)}
                onToggleFav={handleToggleFavorite}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* 6. JUST FOR YOU (RECOMMENDATIONS) */}
        <Animated.View style={[styles.section, { opacity: suggestionsOpacity, paddingBottom: 60 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInline}>Just For You</Text>
            <Text style={styles.recommendationSub}>Tailored suggestions</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {justForYouProducts.map((p) => (
              <ExploreProductCard
                key={p.id}
                product={p}
                isFav={favorites.includes(p.id)}
                onToggleFav={handleToggleFavorite}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Premium Welcome Header */}
      <Animated.View style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, 12) + 8,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }
      ]}>
        <Text style={styles.headerSubtitle}>GHAR SANSAR DISCOVERY</Text>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.greetingQuote}>Discover Products You'll Love</Text>
      </Animated.View>

      {/* Rotating Search Input */}
      <Animated.View style={[
        styles.searchSection,
        {
          opacity: searchOpacity,
          transform: [{ translateY: searchTranslateY }]
        }
      ]}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
          
          <View style={styles.searchInputContainer}>
            {searchQuery.length === 0 && (
              <Animated.Text style={[styles.animatedPlaceholder, { opacity: placeholderOpacity }]}>
                {placeholders[placeholderIndex]}
              </Animated.Text>
            )}
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
          
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Feather name="x-circle" size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Custom Glassmorphic Category Pills */}
      <Animated.View style={{
        opacity: categoriesOpacity,
        transform: [{ translateY: categoriesTranslateY }]
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {categoriesFilterList.map((cat) => {
            const isActive = activeCategory === cat;
            const iconName = CATEGORY_ICONS[cat] || 'grid-outline';
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => selectCategory(cat)}
                style={[
                  styles.tab,
                  isActive ? styles.activeTab : styles.inactiveTab
                ]}
                activeOpacity={0.75}
              >
                <Ionicons name={iconName} size={12} color={isActive ? '#C5A880' : '#8E8E93'} style={styles.tabIcon} />
                <Text style={[
                  styles.tabText,
                  isActive ? styles.activeTabText : styles.inactiveTabText
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Main Container: Discovery Hub vs Search Grid */}
      {showSearchGrid ? (
        searchFilteredProducts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color="#D1D1D6" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No matches found</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearFilters}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={searchFilteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.searchGridScroll}
            showsVerticalScrollIndicator={false}
            renderItem={renderGridItem}
            getItemLayout={(data, index) => (
              { length: 250, offset: 250 * index, index }
            )}
          />
        )
      ) : (
        renderDiscoveryHub()
      )}

      {/* Absolute flying dot element */}
      <Animated.View style={[
        styles.flyingDot,
        {
          opacity: flyOpacity,
          transform: [
            { translateX: flyAnim.x },
            { translateY: flyAnim.y },
            { scale: flyScale }
          ]
        }
      ]}>
        <View style={styles.goldDotParticle} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 130, // Clearance for floating bottom navbar
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#C5A880',
    letterSpacing: 2,
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: -0.8,
  },
  greetingQuote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  animatedPlaceholder: {
    position: 'absolute',
    left: 0,
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  searchInput: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#121212',
    width: '100%',
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tabIcon: {
    marginRight: 5,
  },
  activeTab: {
    backgroundColor: '#121212',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
  },
  activeTabText: {
    color: '#C5A880',
  },
  inactiveTabText: {
    color: '#495057',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F8F9FA',
  },
  emptyText: {
    fontWeight: '800',
    color: '#8E8E93',
    fontSize: 14,
  },
  clearBtn: {
    backgroundColor: '#C5A880',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  curatedHero: {
    height: 180,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 20,
    justifyContent: 'center',
  },
  heroSubtitle: {
    color: '#C5A880',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  heroDesc: {
    color: '#E9ECEF',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
    maxWidth: '85%',
  },
  heroBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 12,
    width: 110,
    alignItems: 'center',
  },
  heroBtnText: {
    color: '#121212',
    fontSize: 11,
    fontWeight: '800',
  },
  section: {
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#121212',
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  sectionTitleInline: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 11,
    color: '#C5A880',
    fontWeight: '800',
  },
  recommendationSub: {
    fontSize: 10.5,
    color: '#8E8E93',
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryCardGrid: {
    width: (screenWidth - 40) / 2,
    height: 72,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryCardGridLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    flex: 1,
    paddingRight: 6,
    letterSpacing: -0.2,
  },
  categoryCardGridImg: {
    width: 48,
    height: 48,
    opacity: 0.95,
    borderRadius: 8,
  },
  categoryCardGridIcon: {
    opacity: 0.4,
  },
  curatedCollectionsScroll: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 12,
  },
  collectionBannerCard: {
    width: screenWidth * 0.72,
    height: 110,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  collectionBannerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  collectionTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1.0,
  },
  collectionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#121212',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  collectionDesc: {
    fontSize: 10,
    color: '#636366',
    marginTop: 4,
    lineHeight: 13,
  },
  collectionImg: {
    width: 68,
    height: 68,
    borderRadius: 8,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 12,
  },
  exploreItemCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    marginRight: 4,
  },
  exploreCardImg: {
    width: '100%',
    height: 95,
    borderRadius: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 8,
    gap: 2,
  },
  ratingText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#9E7C3E',
  },
  ratingCount: {
    fontSize: 8,
    color: '#8E8E93',
    fontWeight: '600',
  },
  exploreCardInfo: {
    marginTop: 6,
  },
  exploreCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#121212',
    letterSpacing: -0.1,
  },
  exploreCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  exploreCardPrice: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#121212',
  },
  exploreCardMrp: {
    fontSize: 9,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontWeight: '500',
    marginTop: 1,
  },
  exploreCardAddBtn: {
    backgroundColor: '#C5A880',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchGridScroll: {
    paddingBottom: 130,
    paddingTop: 8,
  },
  gridProductCard: {
    flex: 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 6,
  },
  gridImageContainer: {
    aspectRatio: 1.1,
    backgroundColor: '#F1F3F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gridProductImage: {
    width: '85%',
    height: '85%',
    borderRadius: 8,
  },
  gridFavBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gridRatingBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  gridRatingText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#9E7C3E',
  },
  gridProductInfo: {
    marginTop: 8,
    gap: 2,
  },
  gridProductTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#121212',
    lineHeight: 14,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 1,
  },
  gridPriceText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#121212',
  },
  gridMrpText: {
    fontSize: 9.5,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  gridAddCartBtn: {
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  gridAddCartBtnText: {
    color: '#C5A880',
    fontSize: 9.5,
    fontWeight: '800',
  },
  flyingDot: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99999,
  },
  goldDotParticle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C5A880',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default ExploreView;
