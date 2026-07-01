import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  ActivityIndicator,
  FlatList,
  Modal
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMobileApp, Product, mapCategoryLabel } from '../context/MobileAppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumImage } from '../components/PremiumImage';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORY_DESCRIPTIONS: { [key: string]: string } = {
  'Cello': 'Premium Dinnerware & Opalware sets',
  'Kitchen & Steel': 'Premium Stainless Steel Cookware',
  'Bottles & Jars': 'Insulated Water Bottles & Flasks',
  'Water Bottles & Jars': 'Insulated Water Bottles & Flasks',
  'Rajasthan Decor': 'Handcrafted ethnic village musicians',
  'Aquarium & Accessories': 'Suction sponge filters & ornaments',
  'German Silver & More': 'German Silver and Copper storage bowls',
  'Premium Mats': 'Anti-slip liners & cupboard mat rolls',
  'Luxury Home Decor': 'Bespoke Artisanal Luxury Items',
  'Lunch Boxes': 'Durable insulated school & office lunch boxes',
  'Handicrafts & Gifts': 'Idols, Figurines & Decorative Showpieces',
  'Traditional Rajasthan Idols': 'Handcrafted Rajasthani folk figurines',
};

// ----------------------------------------------------------------------
// STAGGER REVEAL WRAPPER FOR NATIVE-DRIVEN SPRING TRANSITIONS
// ----------------------------------------------------------------------
const AnimatedReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
      ])
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

// ----------------------------------------------------------------------
// PULSE SHIMMER PLACEHOLDER
// ----------------------------------------------------------------------
const ShimmerBlock: React.FC<{ style: any }> = ({ style }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.9, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={[style, { backgroundColor: '#E1E9EE', opacity: pulseAnim }]} />;
};

// ----------------------------------------------------------------------
// PRODUCT IMAGE COMPONENT WITH DISK CACHE & SHIMMER
// ----------------------------------------------------------------------
const ProductImage: React.FC<{
  uri: string;
  style: any;
  contentFit?: 'contain' | 'cover' | 'fill';
  product?: any;
}> = React.memo(({ uri, style, contentFit = 'contain', product }) => {
  return (
    <PremiumImage
      uri={uri}
      style={style}
      contentFit={contentFit as any}
      product={product}
    />
  );
});

// ----------------------------------------------------------------------
// FLASH SALE TIMER
// ----------------------------------------------------------------------
const FlashSaleTimer: React.FC<{ expiryTime: string }> = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(expiryTime) - +new Date();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <View style={styles.timerBadge}>
      <Feather name="clock" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
      <Text style={styles.timerText}>
        {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
      </Text>
    </View>
  );
};

// ----------------------------------------------------------------------
// MEMOIZED DISPLAY CATEGORY BADGE
// ----------------------------------------------------------------------
const CategoryCircle: React.FC<{
  cat: any;
  index: number;
  onPress: (name: string) => void;
}> = React.memo(({ cat, index, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  
  const gradients = [
    { bg: '#FFF0F0', text: '#FF6B6B' },
    { bg: '#EBF3FF', text: '#4B7BEC' },
    { bg: '#FFF8EB', text: '#FF9F43' },
    { bg: '#EBFBF5', text: '#1DD1A1' },
    { bg: '#F8EEFF', text: '#A55EEA' },
  ];
  const styleConfig = gradients[index % gradients.length];

  const handlePressIn = () => {
    Animated.timing(scale, { toValue: 0.9, duration: 100, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onPress(cat.name);
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.categoryCardItem}
    >
      <Animated.View style={[styles.categoryCircle, { backgroundColor: styleConfig.bg, transform: [{ scale }] }]}>
        {cat.image ? (
          <ProductImage uri={cat.image} style={styles.categoryThumbnail} contentFit="cover" />
        ) : (
          <Feather name="grid" size={18} color={styleConfig.text} />
        )}
      </Animated.View>
      <Text style={styles.categoryCardLabel} numberOfLines={1}>
        {cat.name}
      </Text>
    </TouchableOpacity>
  );
});

// ----------------------------------------------------------------------
// PREMIUM FEATURED COLLECTION CARD
// ----------------------------------------------------------------------
const FeaturedCollectionCard: React.FC<{
  category: any;
  onPress: (name: string) => void;
  delay: number;
}> = React.memo(({ category, onPress, delay }) => {
  const { products } = useMobileApp();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true })
      ])
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 5,
      tension: 100
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100
    }).start();
  };

  const categoryName = category.name;
  const countText = `${category.count || 0} Products`;

  // Static high-quality Unsplash image URLs mapping for ALL categories to ensure 100% reliable loading
  const getCategoryImage = () => {
    const staticImageMapping: { [key: string]: string } = {
      'Cello': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600',
      'Kitchen & Steel': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600',
      'Bottles & Jars': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
      'Water Bottles & Jars': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
      'Rajasthan Decor': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=600',
      'Aquarium & Accessories': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=600',
      'German Silver & More': 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600',
      'Premium Mats': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600',
      'Luxury Home Decor': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600',
      'Lunch Boxes': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600',
      'Handicrafts & Gifts': 'https://images.unsplash.com/photo-1603539947678-cd3954ed515d?auto=format&fit=crop&q=80&w=600',
      'Traditional Rajasthan Idols': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=600'
    };
    return staticImageMapping[categoryName] || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600';
  };

  const resolvedImage = getCategoryImage();

  return (
    <Animated.View style={{ opacity, transform: [{ scale }, { translateY }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(categoryName)}
        style={styles.colBannerCard}
      >
        <ProductImage uri={resolvedImage} style={styles.colBannerBg} contentFit="cover" />
        <View style={styles.colBannerOverlay} />
        <View style={styles.colBannerContentBottom}>
          <Text style={styles.colBannerCatName}>{categoryName}</Text>
          <Text style={styles.colBannerCount}>{countText}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ----------------------------------------------------------------------
// PREMIUM FLASH SALE PRODUCT CARD
// ----------------------------------------------------------------------
const FlashProductCard: React.FC<{
  product: Product;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onAddCart: (p: Product, e?: any) => void;
  onPress: (id: string) => void;
}> = React.memo(({ product, isFav, onToggleFav, onAddCart, onPress }) => {
  const savings = product.actPrice - product.price;
  const discount = product.actPrice > 0 ? Math.round((savings / product.actPrice) * 100) : 0;
  const heartScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(cardScale, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  const handleHeartPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    onToggleFav(product.id);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.6, duration: 100, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <TouchableOpacity
        style={styles.flashSaleCard}
        activeOpacity={0.92}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(product.id)}
      >
        <TouchableOpacity
          style={styles.flashWishlistBtn}
          activeOpacity={0.7}
          onPress={handleHeartPress}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <FontAwesome
              name={isFav ? "heart" : "heart-o"}
              size={14}
              color={isFav ? '#FF3B30' : '#8E8E93'}
            />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.flashImageWrapper}>
          <ProductImage uri={product.image} style={styles.flashProductImage} />
          {discount > 0 && (
            <View style={styles.flashDiscountBadge}>
              <Text style={styles.flashDiscountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.flashCardDetails}>
          <Text style={styles.flashProductTitle} numberOfLines={2}>
            {product.title}
          </Text>
          
          <View style={styles.flashRatingRow}>
            <View style={styles.starsPill}>
              <FontAwesome name="star" size={9} color="#FF9F43" />
              <Text style={styles.flashRatingText}>{product.rating}</Text>
            </View>
            <Text style={styles.flashReviewsText}>({product.reviewsCount})</Text>
          </View>

          <View style={styles.flashPriceRow}>
            <View>
              <Text style={styles.flashSalePrice}>₹{product.price}</Text>
              {product.actPrice > product.price && (
                <Text style={styles.flashOriginalPrice}>₹{product.actPrice}</Text>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.flashAddCartBtn}
              activeOpacity={0.8}
              onPress={(e) => onAddCart(product, e)}
            >
              <Feather name="shopping-bag" size={11} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ----------------------------------------------------------------------
// PREMIUM GRID PRODUCT CARD (Myntra/Amazon style) - 330px height
// ----------------------------------------------------------------------
const FeedProductCard: React.FC<{
  item: Product;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onAddCart: (p: Product, e?: any) => void;
  onPress: (id: string) => void;
}> = React.memo(({ item, isFav, onToggleFav, onAddCart, onPress }) => {
  const savings = item.actPrice - item.price;
  const discount = item.actPrice > 0 ? Math.round((savings / item.actPrice) * 100) : 0;
  const heartScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(cardScale, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  const handleHeartPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    onToggleFav(item.id);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.6, duration: 100, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }], flex: 0.5 }}>
      <TouchableOpacity
        style={styles.gridProductCard}
        activeOpacity={0.95}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(item.id)}
      >
        <TouchableOpacity
          style={styles.cardWishlistBtn}
          activeOpacity={0.7}
          onPress={handleHeartPress}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <FontAwesome
              name={isFav ? "heart" : "heart-o"}
              size={15}
              color={isFav ? '#FF3B30' : '#8E8E93'}
            />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.cardImageContainer}>
          <ProductImage uri={item.image} style={styles.gridProductImage} />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.gridProductInfo}>
          <Text style={styles.gridProductTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.cardRatingRow}>
            <View style={styles.ratingStars}>
              <FontAwesome name="star" size={10} color="#FF9F43" />
              <Text style={styles.cardRatingText}>{item.rating}</Text>
            </View>
            <Text style={styles.cardReviewsCount}>({item.reviewsCount})</Text>
          </View>

          <View style={styles.gridPriceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.gridSalePrice}>₹{item.price}</Text>
              {item.actPrice > item.price && (
                <Text style={styles.gridOriginalPrice}>₹{item.actPrice}</Text>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.quickAddCartBtn}
              activeOpacity={0.8}
              onPress={(e) => onAddCart(item, e)}
            >
              <Feather name="shopping-bag" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ----------------------------------------------------------------------
// HERO CAROUSEL COMPONENT - MATHEMATICALLY PAGING ALIGNED
// ----------------------------------------------------------------------
interface HeroBannerCarouselProps {
  banners: any[];
  onShopNow: (categoryName: string) => void;
}
const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = React.memo(({ banners, onShopNow }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (banners.length === 0) return;

    const startTimer = () => {
      bannerTimerRef.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % banners.length;
        setActiveIndex(nextIndex);
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * (screenWidth - 32),
          animated: true
        });
      }, 4000);
    };

    startTimer();
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [activeIndex, banners]);

  return (
    <View style={styles.bannerSection}>
      <ScrollView
        ref={bannerScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const xOffset = e.nativeEvent.contentOffset.x;
          const index = Math.round(xOffset / (screenWidth - 32));
          if (index !== activeIndex && index >= 0 && index < banners.length) {
            setActiveIndex(index);
          }
        }}
        scrollEventThrottle={16}
        style={{ width: screenWidth - 32 }}
      >
        {banners.map((banner, index) => (
          <View
            key={banner.id || index}
            style={{ width: screenWidth - 32 }}
          >
            <View style={styles.bannerSlideInner}>
              <View
                style={[
                  styles.bannerGradientBg,
                  {
                    backgroundColor: banner.gradient?.[0] || '#121212'
                  }
                ]}
              />
              <View style={styles.bannerTextContent}>
                {banner.tag && (
                  <View style={styles.bannerTagBadge}>
                    <Text style={styles.bannerTagText}>{banner.tag}</Text>
                  </View>
                )}
                <Text style={styles.bannerTitle} numberOfLines={2}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle} numberOfLines={2}>{banner.subtitle}</Text>
                <TouchableOpacity
                  style={styles.bannerCta}
                  activeOpacity={0.8}
                  onPress={() => onShopNow('All')}
                >
                  <Text style={styles.bannerCtaText}>Shop Now</Text>
                  <Feather name="arrow-right" size={11} color="#121212" />
                </TouchableOpacity>
              </View>
              <View style={styles.bannerImageContainer}>
                <ProductImage uri={banner.image} style={styles.bannerImage} contentFit="contain" />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.carouselDotsContainer}>
        {banners.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.carouselDot,
              activeIndex === idx ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
});

// ----------------------------------------------------------------------
// SKELETON LOADERS
// ----------------------------------------------------------------------
const CategoriesSkeleton = () => (
  <View style={styles.categoriesSection}>
    <View style={styles.sectionTitleRow}>
      <ShimmerBlock style={{ width: 120, height: 16, borderRadius: 4 }} />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRowScroll}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.categoryCardItem}>
          <ShimmerBlock style={styles.categoryCircle} />
          <ShimmerBlock style={{ width: 45, height: 10, borderRadius: 2, marginTop: 8 }} />
        </View>
      ))}
    </ScrollView>
  </View>
);

const BannerSkeleton = () => (
  <View style={styles.bannerSection}>
    <ShimmerBlock style={[styles.bannerSlideInner, { width: screenWidth - 32 }]} />
  </View>
);

const FlashSaleSkeleton = () => (
  <View style={styles.flashSaleSection}>
    <View style={styles.flashSaleHeaderRow}>
      <ShimmerBlock style={{ width: 140, height: 18, borderRadius: 4 }} />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashSaleScrollContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.flashSaleCard, { height: 190 }]}>
          <ShimmerBlock style={styles.flashImageWrapper} />
          <ShimmerBlock style={{ width: '100%', height: 10, borderRadius: 2, marginTop: 8 }} />
          <ShimmerBlock style={{ width: '60%', height: 10, borderRadius: 2, marginTop: 4 }} />
          <ShimmerBlock style={{ width: '40%', height: 12, borderRadius: 2, marginTop: 12 }} />
        </View>
      ))}
    </ScrollView>
  </View>
);

const BestSellersSkeleton = () => (
  <View style={styles.bestSellersSection}>
    <View style={styles.sectionTitleRow}>
      <ShimmerBlock style={{ width: 100, height: 16, borderRadius: 4 }} />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashSaleScrollContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.bestSellerMiniCard, { height: 72, flexDirection: 'row' }]}>
          <ShimmerBlock style={styles.miniCardImageWrapper} />
          <View style={{ flex: 1, padding: 8, gap: 4 }}>
            <ShimmerBlock style={{ width: '100%', height: 10, borderRadius: 2 }} />
            <ShimmerBlock style={{ width: '50%', height: 8, borderRadius: 2 }} />
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

const CollectionsSkeleton = () => (
  <View style={styles.collectionsSection}>
    <ShimmerBlock style={{ width: 150, height: 16, borderRadius: 4, marginLeft: 16, marginBottom: 12 }} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, gap: 12 }}>
      {[1, 2].map((i) => (
        <ShimmerBlock key={i} style={{ width: screenWidth * 0.8, height: 180, borderRadius: 24 }} />
      ))}
    </ScrollView>
  </View>
);

// ----------------------------------------------------------------------
// MAIN VIEW COMPONENT
// ----------------------------------------------------------------------
const HomeView: React.FC = () => {
  const {
    favorites,
    toggleFavorite,
    setSelectedProductId,
    setSelectedCategory,
    setActiveTab,
    cart,
    addToCart,

    // Dynamic states and APIs
    banners,
    categories,
    flashSale,
    paginatedProducts,
    paginatedLoading,
    hasMoreProducts,
    loadMoreProducts,
    refreshProductsFeed,
    searchSuggestions,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    trendingSearches,

    // Loading states
    bannersLoading,
    categoriesLoading,
    flashSaleLoading,
    productsLoading,

    // Notifications
    notifications,
    markNotificationsRead,
    clearNotifications,

    // Recently Viewed
    recentlyViewed
  } = useMobileApp();

  const insets = useSafeAreaInsets();

  // Screen Overlay triggers
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [wishlistVisible, setWishlistVisible] = useState(false);

  // Search states
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState<{ products: Product[]; categories: string[] }>({ products: [], categories: [] });
  const [sugLoading, setSugLoading] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Animated cycling placeholders
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholderOpacity = useRef(new Animated.Value(1)).current;
  const placeholders = [
    'Search Kitchen Items...',
    'Search Bottles & Flasks...',
    'Search Aquarium Products...',
    'Search Home Decor...'
  ];

  // Mount staggered section animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-15)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const categoriesOpacity = useRef(new Animated.Value(0)).current;
  const flashSaleOpacity = useRef(new Animated.Value(0)).current;
  const bestSellersOpacity = useRef(new Animated.Value(0)).current;
  const recommendedOpacity = useRef(new Animated.Value(0)).current;

  // Flying particle state
  const flyAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const flyScale = useRef(new Animated.Value(1)).current;
  const flyOpacity = useRef(new Animated.Value(0)).current;

  const animateFlyToCart = (startX: number, startY: number) => {
    flyAnim.setValue({ x: startX, y: startY });
    flyScale.setValue(1.5);
    flyOpacity.setValue(1);

    const targetX = screenWidth / 2;
    const { height: screenHeight } = Dimensions.get('window');
    const targetY = screenHeight - 60;

    Animated.parallel([
      Animated.timing(flyAnim.x, {
        toValue: targetX,
        duration: 550,
        useNativeDriver: true
      }),
      Animated.timing(flyAnim.y, {
        toValue: targetY,
        duration: 550,
        useNativeDriver: true
      }),
      Animated.timing(flyScale, {
        toValue: 0.2,
        duration: 550,
        useNativeDriver: true
      }),
      Animated.timing(flyOpacity, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true
      })
    ]).start(() => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    });
  };

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(headerTranslateY, { toValue: 0, duration: 300, useNativeDriver: true })
      ]),
      Animated.timing(searchBarOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(bannerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(categoriesOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(flashSaleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(bestSellersOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(recommendedOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  // Cart and badge counts
  const favCount = favorites.length;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifsCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Dynamic categories used directly in render

  // cycling placeholder logic
  useEffect(() => {
    const cycle = setInterval(() => {
      Animated.timing(placeholderOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true
      }).start(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        Animated.timing(placeholderOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true
        }).start();
      });
    }, 3200);

    return () => clearInterval(cycle);
  }, []);

  // debounced query logic
  useEffect(() => {
    if (!searchVal.trim()) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    setSugLoading(true);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      const results = await searchSuggestions(searchVal);
      setSuggestions(results);
      setSugLoading(false);
    }, 300);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchVal]);

  const handleCategoryClick = useCallback((catName: string) => {
    setSelectedCategory(catName);
    setActiveTab('explore');
  }, [setSelectedCategory, setActiveTab]);

  const handleExecuteSearch = useCallback((query: string) => {
    addRecentSearch(query);
    setSearchFocused(false);
    setSelectedCategory('All');
    setActiveTab('explore');
  }, [addRecentSearch, setSelectedCategory, setActiveTab]);

  // Cart add bounce animations
  const cartScaleAnim = useRef(new Animated.Value(1)).current;
  const triggerAddToCart = useCallback((product: Product, e?: any) => {
    addToCart(product);
    Animated.sequence([
      Animated.timing(cartScaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.spring(cartScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true })
    ]).start();

    // Trigger haptic click
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {}

    // Run fly particle animation
    let startX = screenWidth / 2;
    let startY = Dimensions.get('window').height / 2;
    if (e && e.nativeEvent) {
      startX = e.nativeEvent.pageX || startX;
      startY = e.nativeEvent.pageY || startY;
    }
    animateFlyToCart(startX, startY);
  }, [addToCart]);

  // Filter Best Sellers
  const bestSellers = useMemo(() => {
    return paginatedProducts.filter(p => p.rating >= 4.4).slice(0, 8);
  }, [paginatedProducts]);

  const expiryTimeWithOffset = useCallback((isoString: string) => {
    const originalDate = new Date(isoString);
    const now = new Date();
    if (originalDate.getTime() - now.getTime() < 0) {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 18);
      return tomorrow.toISOString();
    }
    return isoString;
  }, []);

  const handleProductCardPress = useCallback((id: string) => {
    setSelectedProductId(id);
  }, [setSelectedProductId]);

  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavorite(id);
  }, [toggleFavorite]);

  const renderProductItem = useCallback(({ item, index }: { item: Product; index: number }) => {
    const isFav = favorites.includes(item.id);
    return (
      <Animated.View style={{ opacity: recommendedOpacity, flex: 0.5 }}>
        <AnimatedReveal delay={(index % 4) * 80}>
          <FeedProductCard
            item={item}
            isFav={isFav}
            onToggleFav={handleToggleFavorite}
            onAddCart={triggerAddToCart}
            onPress={handleProductCardPress}
          />
        </AnimatedReveal>
      </Animated.View>
    );
  }, [favorites, handleToggleFavorite, triggerAddToCart, handleProductCardPress, recommendedOpacity]);

  // Combined header elements
  const renderListHeader = useCallback(() => {
    return (
      <View style={styles.headerContainer}>
        {/* BANNERS SECTION */}
        {bannersLoading ? (
          <BannerSkeleton />
        ) : banners.length > 0 ? (
          <Animated.View style={{ opacity: bannerOpacity }}>
            <HeroBannerCarousel banners={banners} onShopNow={handleCategoryClick} />
          </Animated.View>
        ) : null}

        {/* SHOP CATEGORIES BADGES */}
        {categoriesLoading ? (
          <CategoriesSkeleton />
        ) : categories.length > 0 ? (
          <Animated.View style={{ opacity: categoriesOpacity }}>
            <View style={styles.categoriesSection}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.homeSectionTitle}>Shop Categories</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesRowScroll}
              >
                {categories.map((cat, idx) => (
                  <CategoryCircle
                    key={cat.name || idx}
                    cat={cat}
                    index={idx}
                    onPress={handleCategoryClick}
                  />
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        ) : null}

        {/* FLASH SALE ROW */}
        {flashSaleLoading ? (
          <FlashSaleSkeleton />
        ) : flashSale && flashSale.products && flashSale.products.length > 0 ? (
          <Animated.View style={{ opacity: flashSaleOpacity }}>
            <View style={styles.flashSaleSection}>
              <View style={styles.flashSaleHeaderRow}>
                <View style={styles.flashTitleGroup}>
                  <Text style={styles.flashSaleMainTitle}>FLASH SALE</Text>
                  <Text style={styles.flashSaleIcon}>⚡</Text>
                  <FlashSaleTimer expiryTime={expiryTimeWithOffset(flashSale.expiryTime)} />
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashSaleScrollContainer}
              >
                {flashSale.products.map((p) => {
                  const isFav = favorites.includes(p.id);
                  return (
                    <FlashProductCard
                      key={p.id}
                      product={p}
                      isFav={isFav}
                      onToggleFav={handleToggleFavorite}
                      onAddCart={triggerAddToCart}
                      onPress={handleProductCardPress}
                    />
                  );
                })}
              </ScrollView>
            </View>
          </Animated.View>
        ) : null}

        {/* BEST SELLERS SECTION */}
        {productsLoading ? (
          <BestSellersSkeleton />
        ) : bestSellers.length > 0 ? (
          <Animated.View style={{ opacity: bestSellersOpacity }}>
            <View style={styles.bestSellersSection}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.homeSectionTitle}>Best Sellers</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => handleCategoryClick('All')}>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashSaleScrollContainer}
              >
                {bestSellers.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.bestSellerMiniCard}
                    activeOpacity={0.9}
                    onPress={() => handleProductCardPress(p.id)}
                  >
                    <View style={styles.miniCardImageWrapper}>
                      <ProductImage uri={p.image} style={styles.miniProductImage} />
                    </View>
                    <View style={styles.miniCardDetails}>
                      <Text style={styles.miniProductTitle} numberOfLines={1}>{p.title}</Text>
                      <View style={styles.miniRatingRow}>
                        <FontAwesome name="star" size={9} color="#FFD700" />
                        <Text style={styles.miniRatingText}>{p.rating}</Text>
                      </View>
                      <Text style={styles.miniPriceText}>₹{p.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        ) : null}

        {/* RECENTLY VIEWED ROW */}
        {recentlyViewed.length > 0 && (
          <Animated.View style={{ opacity: bestSellersOpacity }}>
            <View style={styles.recentViewedSection}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.homeSectionTitle}>Recently Viewed</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashSaleScrollContainer}
              >
                {recentlyViewed.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.recentViewedCard}
                    activeOpacity={0.9}
                    onPress={() => handleProductCardPress(p.id)}
                  >
                    <View style={styles.recentViewedImageWrapper}>
                      <ProductImage uri={p.image} style={styles.recentViewedImage} />
                    </View>
                    <Text style={styles.recentViewedTitle} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={styles.recentViewedPrice}>₹{p.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        {/* FEATURED COLLECTIONS COMPLETE REDESIGN */}
        {categoriesLoading ? (
          <CollectionsSkeleton />
        ) : categories.length > 0 ? (
          <Animated.View style={{ opacity: bestSellersOpacity }}>
            <View style={styles.collectionsSection}>
              <Text style={[styles.homeSectionTitle, { marginLeft: 16, marginBottom: 12 }]}>Featured Collections</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={screenWidth * 0.8 + 12} // width + marginRight
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}
              >
                {categories.map((cat, idx) => (
                  <FeaturedCollectionCard
                    key={cat.name || idx}
                    category={cat}
                    onPress={handleCategoryClick}
                    delay={idx * 80}
                  />
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        ) : null}

        {/* JUST FOR YOU FEED HEADER */}
        <Animated.View style={{ opacity: recommendedOpacity }}>
          <View style={styles.feedSplitterRow}>
            <View style={styles.splitterLine} />
            <Text style={styles.splitterTitle}>JUST FOR YOU</Text>
            <View style={styles.splitterLine} />
          </View>
        </Animated.View>
      </View>
    );
  }, [
    banners,
    bannersLoading,
    categories,
    categoriesLoading,
    flashSale,
    flashSaleLoading,
    productsLoading,
    bestSellers,
    recentlyViewed,
    favorites,
    handleCategoryClick,
    handleToggleFavorite,
    handleProductCardPress,
    triggerAddToCart,
    expiryTimeWithOffset,
    bannerOpacity,
    categoriesOpacity,
    flashSaleOpacity,
    bestSellersOpacity,
    recommendedOpacity,
    screenWidth
  ]);

  return (
    <View style={styles.screen}>
      {/* HEADER SECTION WITH REVEAL ANIMATIONS */}
      <Animated.View style={[
        styles.header, 
        { 
          paddingTop: Math.max(insets.top, 12) + 6,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }
      ]}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/logo.png')} style={styles.logo as any} contentFit="contain" />
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoBrandName}>GHAR SANSAR</Text>
            <Text style={styles.brandSlogan}>Luxury Home & Kitchen Store</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            activeOpacity={0.7}
            onPress={() => setWishlistVisible(true)}
          >
            <Feather name="heart" size={19} color="#121212" />
            {favCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{favCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerIconBtn} 
            activeOpacity={0.7}
            onPress={() => setNotificationsVisible(true)}
          >
            <Feather name="bell" size={19} color="#121212" />
            {unreadNotifsCount > 0 && (
              <View style={[styles.headerBadge, { backgroundColor: '#30B0C7' }]}>
                <Text style={styles.headerBadgeText}>{unreadNotifsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            activeOpacity={0.7}
            onPress={() => setActiveTab('account')}
          >
            <View style={styles.avatarBorder}>
              <Feather name="user" size={14} color="#121212" />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* SEARCH BAR SECTION WITH ANIMATED FADE IN */}
      <Animated.View style={[styles.searchContainer, { opacity: searchBarOpacity }]}>
        <TouchableOpacity
          style={styles.searchBarWrapper}
          activeOpacity={0.9}
          onPress={() => setSearchFocused(true)}
        >
          <Feather name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
          
          <Animated.Text
            style={[
              styles.searchPlaceholderText,
              { opacity: placeholderOpacity }
            ]}
          >
            {placeholders[placeholderIndex]}
          </Animated.Text>

          <TouchableOpacity style={styles.voiceSearchBtn} activeOpacity={0.7}>
            <Feather name="mic" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>

      {/* MAIN PRODUCTS GRID LIST */}
      <FlatList
        data={paginatedProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productsGridRow}
        ListHeaderComponent={renderListHeader}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListFooterComponent={
          paginatedLoading ? (
            <View style={styles.feedLoaderContainer}>
              <ActivityIndicator size="small" color="#121212" />
              <Text style={styles.feedLoaderText}>Loading customized offers...</Text>
            </View>
          ) : !hasMoreProducts ? (
            <View style={styles.endOfFeedContainer}>
              <Text style={styles.endOfFeedText}>You have viewed all handcrafted luxury pieces.</Text>
            </View>
          ) : null
        }
      />

      {/* SEARCH SUGGESTIONS OVERLAY */}
      {searchFocused && (
        <View style={[styles.searchOverlayContainer, { paddingTop: Math.max(insets.top, 12) }]}>
          <View style={styles.overlayInputRow}>
            <TouchableOpacity
              style={styles.backOverlayBtn}
              activeOpacity={0.7}
              onPress={() => {
                setSearchFocused(false);
                setSearchVal('');
              }}
            >
              <Feather name="arrow-left" size={20} color="#121212" />
            </TouchableOpacity>

            <View style={styles.overlaySearchField}>
              <Feather name="search" size={16} color="#8E8E93" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search premium pieces..."
                value={searchVal}
                onChangeText={setSearchVal}
                autoFocus
                style={styles.overlayTextInput}
                onSubmitEditing={() => handleExecuteSearch(searchVal)}
              />
              {searchVal.length > 0 && (
                <TouchableOpacity onPress={() => setSearchVal('')}>
                  <Feather name="x-circle" size={16} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.overlayBody} keyboardShouldPersistTaps="handled">
            {sugLoading && (
              <View style={styles.suggestionsSpinner}>
                <ActivityIndicator size="small" color="#121212" />
              </View>
            )}

            {!searchVal.trim() ? (
              <View style={styles.searchGuideBox}>
                {recentSearches.length > 0 && (
                  <View style={styles.recentSearchesSection}>
                    <View style={styles.guideHeaderRow}>
                      <Text style={styles.guideTitle}>Recent Searches</Text>
                      <TouchableOpacity onPress={clearRecentSearches}>
                        <Text style={styles.clearAllBtnText}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.recentList}>
                      {recentSearches.map((term, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.recentSearchItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            setSearchVal(term);
                            handleExecuteSearch(term);
                          }}
                        >
                          <Feather name="clock" size={14} color="#8E8E93" style={{ marginRight: 10 }} />
                          <Text style={styles.recentTermText}>{term}</Text>
                          <Feather name="arrow-up-left" size={14} color="#C4C4C6" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.trendingSection}>
                  <Text style={styles.guideTitle}>Trending Searches</Text>
                  <View style={styles.trendingPillsRow}>
                    {trendingSearches.map((term, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.trendingPill}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSearchVal(term);
                          handleExecuteSearch(term);
                        }}
                      >
                        <Feather name="trending-up" size={12} color="#121212" style={{ marginRight: 4 }} />
                        <Text style={styles.trendingPillText}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.suggestionsBox}>
                {suggestions.categories.length > 0 && (
                  <View style={styles.suggestionGroup}>
                    <Text style={styles.suggestionGroupTitle}>Categories Matching</Text>
                    {suggestions.categories.map((cat, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.categorySuggestionItem}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSearchFocused(false);
                          setSearchVal('');
                          handleCategoryClick(cat);
                        }}
                      >
                        <Feather name="tag" size={14} color="#4B7BEC" style={{ marginRight: 10 }} />
                        <Text style={styles.sugCategoryText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {suggestions.products.length > 0 ? (
                  <View style={styles.suggestionGroup}>
                    <Text style={styles.suggestionGroupTitle}>Suggested Products</Text>
                    {suggestions.products.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.productSuggestionItem}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSearchFocused(false);
                          setSearchVal('');
                          setSelectedProductId(p.id);
                        }}
                      >
                        <ProductImage uri={p.image} style={styles.sugProductThumb} />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.sugProductTitle} numberOfLines={1}>{p.title}</Text>
                          <Text style={styles.sugProductPrice}>₹{p.price}</Text>
                        </View>
                        <Feather name="chevron-right" size={14} color="#8E8E93" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  !sugLoading && (
                    <View style={styles.noSearchSuggestions}>
                      <Text style={styles.noSuggestionsText}>No products matching "{searchVal}" found.</Text>
                    </View>
                  )
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* OVERLAY: NOTIFICATION CENTER MODAL */}
      <Modal
        visible={notificationsVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Math.max(insets.top, 12) }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setNotificationsVisible(false)} style={styles.modalCloseBtn}>
              <Feather name="chevron-left" size={24} color="#121212" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notifications</Text>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={() => clearNotifications()}>
                <Text style={styles.modalHeaderClearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {notifications.length === 0 ? (
            <View style={styles.modalEmptyState}>
              <Feather name="bell-off" size={48} color="#C4C4C6" />
              <Text style={styles.modalEmptyStateText}>No notifications yet</Text>
              <Text style={styles.modalEmptyStateSub}>We'll keep you updated on shipments and offers.</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={styles.markAllReadBtn}
                onPress={() => markNotificationsRead()}
              >
                <Feather name="check-square" size={14} color="#C5A880" style={{ marginRight: 6 }} />
                <Text style={styles.markAllReadBtnText}>Mark all as read</Text>
              </TouchableOpacity>

              {notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notificationCard, !notif.read && styles.notificationUnread]}
                  activeOpacity={0.8}
                  onPress={() => markNotificationsRead(notif.id)}
                >
                  <View style={[
                    styles.notificationIconWrapper,
                    notif.type === 'order' && { backgroundColor: '#EBF3FF' },
                    notif.type === 'offer' && { backgroundColor: '#FFF8EB' },
                    notif.type === 'delivery' && { backgroundColor: '#EBFBF5' }
                  ]}>
                    <Feather
                      name={
                        notif.type === 'order' ? 'package' :
                        notif.type === 'offer' ? 'gift' :
                        notif.type === 'delivery' ? 'truck' : 'info'
                      }
                      size={18}
                      color={
                        notif.type === 'order' ? '#4B7BEC' :
                        notif.type === 'offer' ? '#FF9F43' :
                        notif.type === 'delivery' ? '#1DD1A1' : '#8E8E93'
                      }
                    />
                  </View>
                  <View style={styles.notificationTextWrapper}>
                    <Text style={[styles.notificationTitle, !notif.read && { fontWeight: '700' }]}>
                      {notif.title}
                    </Text>
                    <Text style={styles.notificationBodyText}>{notif.body}</Text>
                    <Text style={styles.notificationTimeText}>
                      {new Date(notif.time).toLocaleDateString()} at {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {!notif.read && <View style={styles.unreadIndicatorDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* OVERLAY: WISHLIST MODAL */}
      <Modal
        visible={wishlistVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setWishlistVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Math.max(insets.top, 12) }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setWishlistVisible(false)} style={styles.modalCloseBtn}>
              <Feather name="chevron-left" size={24} color="#121212" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>My Wishlist ({favCount})</Text>
            <View style={{ width: 40 }} />
          </View>

          {favCount === 0 ? (
            <View style={styles.modalEmptyState}>
              <Feather name="heart" size={48} color="#C4C4C6" />
              <Text style={styles.modalEmptyStateText}>Your wishlist is empty</Text>
              <Text style={styles.modalEmptyStateSub}>Save your favorite products to buy them later.</Text>
              <TouchableOpacity
                style={styles.modalShopNowBtn}
                onPress={() => {
                  setWishlistVisible(false);
                  handleCategoryClick('All');
                }}
              >
                <Text style={styles.modalShopNowBtnText}>Discover Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={paginatedProducts.filter(p => favorites.includes(p.id))}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              renderItem={({ item }) => (
                <View style={styles.wishlistCard}>
                  <TouchableOpacity
                    style={styles.wishlistImageWrapper}
                    onPress={() => {
                      setWishlistVisible(false);
                      handleProductCardPress(item.id);
                    }}
                  >
                    <ProductImage uri={item.image} style={styles.wishlistImage} />
                  </TouchableOpacity>
                  <View style={styles.wishlistDetails}>
                    <Text style={styles.wishlistProductTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.wishlistProductCat}>{item.category}</Text>
                    <Text style={styles.wishlistProductPrice}>₹{item.price}</Text>
                  </View>
                  <View style={styles.wishlistActions}>
                    <TouchableOpacity
                      style={styles.wishlistRemoveBtn}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <Feather name="trash-2" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.wishlistAddCartBtn}
                      onPress={() => triggerAddToCart(item)}
                    >
                      <Feather name="shopping-bag" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.wishlistAddCartText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </Modal>

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
    backgroundColor: '#F4F5F6',
  },
  scrollContent: {
    paddingBottom: 130, // Spacing increased to resolve bottom overlap with navbar
  },
  headerContainer: {
    width: '100%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.02)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 48, // Enlarge logo
    height: 48,
    borderRadius: 8,
  },
  logoTextContainer: {
    flexDirection: 'column',
  },
  logoBrandName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: 0.5,
  },
  brandSlogan: {
    fontSize: 9,
    fontWeight: '700',
    color: '#C5A880', // Premium gold color tagline
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F5F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 7,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  avatarBorder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    position: 'relative',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholderText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#8E8E93',
    flex: 1,
  },
  voiceSearchBtn: {
    padding: 6,
  },
  bannerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    position: 'relative',
    alignItems: 'center',
  },
  bannerSlideInner: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  bannerGradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.84,
  },
  bannerTextContent: {
    flex: 1.3,
    padding: 16,
    justifyContent: 'center',
    zIndex: 10,
  },
  bannerTagBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
  },
  bannerSubtitle: {
    color: '#E6E6E6',
    fontSize: 9.5,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 13,
  },
  bannerCta: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    gap: 4,
  },
  bannerCtaText: {
    color: '#121212',
    fontSize: 9.5,
    fontWeight: '800',
  },
  bannerImageContainer: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingRight: 8,
  },
  bannerImage: {
    width: '100%',
    height: '85%',
  },
  carouselDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  carouselDot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 12,
    backgroundColor: '#121212',
  },
  inactiveDot: {
    width: 4,
    backgroundColor: '#C4C4C6',
  },
  categoriesSection: {
    paddingVertical: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  homeSectionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: -0.15,
  },
  seeAllText: {
    fontSize: 11,
    color: '#C5A880',
    fontWeight: '700',
  },
  categoriesRowScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCardItem: {
    alignItems: 'center',
    width: 64,
  },
  categoryCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  categoryThumbnail: {
    width: '100%',
    height: '100%',
  },
  categoryCardLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
  flashSaleSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    marginVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  flashSaleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  flashTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  flashSaleMainTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF3B30',
    letterSpacing: 0.3,
  },
  flashSaleIcon: {
    fontSize: 13,
    marginRight: 2,
  },
  timerBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  flashSaleScrollContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  flashSaleCard: {
    width: 132,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDEDED',
    padding: 6,
    position: 'relative',
  },
  flashWishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  flashImageWrapper: {
    height: 96,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  flashProductImage: {
    width: '80%',
    height: '80%',
  },
  flashDiscountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  flashDiscountText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
  },
  flashCardDetails: {
    marginTop: 6,
  },
  flashProductTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#121212',
    lineHeight: 13,
    height: 26,
  },
  flashRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  starsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EB',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
    gap: 2,
  },
  flashRatingText: {
    fontSize: 8.5,
    color: '#FF9F43',
    fontWeight: '800',
  },
  flashReviewsText: {
    fontSize: 8.5,
    color: '#8E8E93',
    fontWeight: '600',
  },
  flashPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  flashSalePrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF3B30',
  },
  flashOriginalPrice: {
    fontSize: 9,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  flashAddCartBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestSellersSection: {
    paddingVertical: 10,
  },
  bestSellerMiniCard: {
    flexDirection: 'row',
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDEDED',
    padding: 6,
    alignItems: 'center',
  },
  miniCardImageWrapper: {
    width: 48,
    height: 48,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  miniProductImage: {
    width: '90%',
    height: '90%',
  },
  miniCardDetails: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  miniProductTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#121212',
  },
  miniRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  miniRatingText: {
    fontSize: 8.5,
    color: '#8E8E93',
    fontWeight: '700',
  },
  miniPriceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#121212',
    marginTop: 2,
  },
  recentViewedSection: {
    paddingVertical: 10,
  },
  recentViewedCard: {
    width: 90,
    alignItems: 'center',
  },
  recentViewedImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  recentViewedImage: {
    width: '80%',
    height: '80%',
  },
  recentViewedTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#121212',
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  recentViewedPrice: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C5A880',
    marginTop: 1,
  },
  collectionsSection: {
    paddingVertical: 14,
  },
  colBannerCard: {
    width: screenWidth * 0.8,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    marginRight: 12,
  },
  colBannerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  colBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.42)', // Premium dark backdrop overlay
  },
  colBannerContentBottom: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    right: 20,
    zIndex: 10,
    gap: 2,
  },
  colBannerCatName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  colBannerCount: {
    color: '#C5A880', // Premium gold accent for counts
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  feedSplitterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  splitterLine: {
    flex: 1,
    height: 0.8,
    backgroundColor: '#EBEBEB',
  },
  splitterTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },
  productsGridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  gridProductCard: {
    width: (screenWidth - 44) / 2,
    height: 330, // Premium Myntra card dimensions
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 10,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardWishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImageContainer: {
    height: 200, // 70% image backdrop ratio
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  gridProductImage: {
    width: '90%',
    height: '90%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  gridProductInfo: {
    marginTop: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  gridProductTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#121212',
    lineHeight: 16,
    height: 32,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EB',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  cardRatingText: {
    fontSize: 10,
    color: '#FF9F43',
    fontWeight: '800',
  },
  cardReviewsCount: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  gridPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  gridSalePrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#121212',
  },
  gridOriginalPrice: {
    fontSize: 11,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  quickAddCartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedLoaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  feedLoaderText: {
    fontSize: 11.5,
    color: '#8E8E93',
    fontWeight: '600',
  },
  endOfFeedContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfFeedText: {
    fontSize: 11,
    color: '#C4C4C6',
    fontWeight: '700',
  },
  searchOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 99,
  },
  overlayInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  backOverlayBtn: {
    padding: 6,
    marginRight: 8,
  },
  overlaySearchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    borderRadius: 8,
    height: 38,
    paddingHorizontal: 10,
  },
  overlayTextInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#121212',
    paddingVertical: 0,
  },
  overlayBody: {
    flex: 1,
  },
  suggestionsSpinner: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  searchGuideBox: {
    padding: 16,
  },
  recentSearchesSection: {
    marginBottom: 20,
  },
  guideHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#121212',
    letterSpacing: -0.1,
  },
  clearAllBtnText: {
    fontSize: 11.5,
    color: '#FF3B30',
    fontWeight: '700',
  },
  recentList: {
    gap: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
  },
  recentTermText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2C3E50',
  },
  trendingSection: {
    marginTop: 8,
  },
  trendingPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  trendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendingPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#121212',
  },
  suggestionsBox: {
    padding: 16,
  },
  suggestionGroup: {
    marginBottom: 20,
  },
  suggestionGroupTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categorySuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F4F5F6',
  },
  sugCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#121212',
  },
  productSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F4F5F6',
    gap: 12,
  },
  sugProductThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#F9F9F9',
  },
  sugProductTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#121212',
  },
  sugProductPrice: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '800',
    marginTop: 2,
  },
  noSearchSuggestions: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noSuggestionsText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  imageContainerBox: {
    position: 'relative',
    overflow: 'hidden',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F6',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#121212',
  },
  modalHeaderClearText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '700',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  modalEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalEmptyStateText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#121212',
    marginTop: 16,
  },
  modalEmptyStateSub: {
    fontSize: 11.5,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  modalShopNowBtn: {
    backgroundColor: '#C5A880',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  modalShopNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  markAllReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 14,
  },
  markAllReadBtnText: {
    fontSize: 11,
    color: '#C5A880',
    fontWeight: '700',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 10,
    position: 'relative',
  },
  notificationUnread: {
    backgroundColor: '#F9FBFD',
    borderColor: '#E6EFF9',
  },
  notificationIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F5F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationTextWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  notificationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121212',
  },
  notificationBodyText: {
    fontSize: 11,
    color: '#555555',
    marginTop: 4,
    lineHeight: 15,
  },
  notificationTimeText: {
    fontSize: 9,
    color: '#999999',
    marginTop: 6,
  },
  unreadIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
    position: 'absolute',
    top: 15,
    right: 12,
  },
  wishlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
    gap: 12,
  },
  wishlistImageWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wishlistImage: {
    width: '85%',
    height: '85%',
  },
  wishlistDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  wishlistProductTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#121212',
  },
  wishlistProductCat: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  wishlistProductPrice: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#121212',
    marginTop: 4,
  },
  wishlistActions: {
    alignItems: 'center',
    gap: 10,
  },
  wishlistRemoveBtn: {
    padding: 4,
  },
  wishlistAddCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C5A880',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  wishlistAddCartText: {
    color: '#FFFFFF',
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
    width: 22,
    height: 22,
    borderRadius: 11,
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

export default HomeView;
