import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable
} from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMobileApp, Product } from '../context/MobileAppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumImage } from '../components/PremiumImage';

const { width: screenWidth } = Dimensions.get('window');

// ----------------------------------------------------------------------
// DYNAMIC SPECIFICATION & TAGLINE GENERATORS FOR LUXURY BRAND EXPERIENCE
// ----------------------------------------------------------------------
const getBrandName = (title: string, category: string) => {
  const brandKeywords = ['Cello', 'MUMASTORE', 'Sobo', 'Sunsun', 'Bluepet', 'Hailea', 'Nubios', 'Xinxiu', 'Yu Fei Yang', 'Aquacartman', 'Kondapalli'];
  for (const keyword of brandKeywords) {
    if (title.toLowerCase().includes(keyword.toLowerCase())) {
      return keyword.toUpperCase();
    }
  }
  if (category.includes('Steel') || category.includes('Kitchen')) return 'SONU STEEL';
  if (category.includes('Decor') || category.includes('Idol')) return 'RAJASTHAN ARTS';
  if (category.includes('Toys')) return 'KONDAPALLI CRAFTS';
  return 'GHAR SANSAR ELITE';
};

const getProductTagline = (category: string) => {
  const taglines: { [key: string]: string } = {
    'Kitchen & Steel': 'Premium Quality Food-Grade Cook & Serveware',
    'Garden & Birds': 'Handcrafted Natural Nesting & Garden Aesthetics',
    'Kondapalli Toys': 'Charming Hand-Carved Traditional Wood Crafts',
    'Bottles & Jars': 'Premium Grade Leak-Proof Hydration Flasks',
    'Wallpaper Rolls': 'Self-Adhesive Luxurious Wall Aesthetics',
    'Rajasthan Decor': 'Exquisite Handcrafted Traditional Indian Sculptures',
    'Garden Essentials': 'Nourishing Essentials for Lush Indoor & Outdoor Gardens',
    'Premium Mats': 'All-Purpose Durable Anti-Slip Comfort Mats',
    'Water Fountains': 'Serene Indoor Water Fountains for Positive Energy',
    'Aquarium & Accessories': 'High-Performance Advanced Aquatic Filtration & Gear',
    'German Silver & More': 'Elegant Premium German Silver Decorative Arts',
    'Lunch Boxes': 'Leak-Proof Insulated Durable Meal Lockers'
  };
  return taglines[category] || 'Curated Premium Quality Home Essentials';
};

const getProductSpecs = (product: Product) => {
  const brand = getBrandName(product.title, product.category);
  const baseSpecs = [
    { label: 'Brand', value: brand },
    { label: 'Collection', value: product.category },
    { label: 'Sub-Category', value: product.subCategory || 'General' },
    { label: 'Customer Rating', value: `${product.rating} / 5.0` },
  ];
  
  if (product.category.includes('Steel') || product.category.includes('Kitchen')) {
    return [
      ...baseSpecs,
      { label: 'Material', value: 'Food-Grade Stainless Steel' },
      { label: 'Dishwasher Safe', value: 'Yes (Highly Safe)' },
      { label: 'Coating', value: 'Mirror Polish Finish' },
    ];
  }
  if (product.category.includes('Aquarium')) {
    return [
      ...baseSpecs,
      { label: 'Material', value: 'Heavy Duty ABS Plastic' },
      { label: 'Power Source', value: 'Electric (Corded 220V)' },
      { label: 'Tank Suitability', value: 'Freshwater & Marine Tanks' },
    ];
  }
  if (product.category.includes('Bottles') || product.category.includes('Lunch')) {
    return [
      ...baseSpecs,
      { label: 'Material', value: 'BPA-Free, Eco-Friendly Material' },
      { label: 'Insulated Type', value: 'Double Walled Vacuum Flask' },
      { label: 'Leak-proof Seal', value: 'Airtight Silicon Seal' },
    ];
  }
  return [
    ...baseSpecs,
    { label: 'Material', value: 'Premium Eco-Composite' },
    { label: 'Origin', value: 'Proudly Crafted in India' },
    { label: 'Design Theme', value: 'Contemporary Luxury' },
  ];
};

const getProductFeatures = (category: string) => {
  if (category.includes('Steel') || category.includes('Kitchen')) {
    return [
      'Heavy-gauge rust-free stainless steel for lifetime durability',
      'Encapsulated sandwich base for uniform heat distribution',
      'Elegant look with mirror finish, perfect for cook and serve',
      'Ergonomically designed stay-cool handles for secure grip'
    ];
  }
  if (category.includes('Aquarium')) {
    return [
      'Super silent operation with advanced vibration damping feet',
      'Multi-stage mechanical and biological filtration technology',
      'High-performance energy saving motor core',
      'Compact design that blends seamlessly into any aquarium setup'
    ];
  }
  if (category.includes('Bottles') || category.includes('Lunch')) {
    return [
      'Double-walled vacuum insulation keeps contents cold/hot longer',
      '100% leak-proof airtight lid with premium food-grade seal',
      'Ergonomic sleek grip fits easily in car cup holders and backpacks',
      'BPA-free, non-toxic, and zero odor retention'
    ];
  }
  return [
    'Handcrafted by local Indian artisans with meticulous care',
    'Premium quality materials ensuring long-lasting color and structural integrity',
    'Adds a luxurious, contemporary touch to any home or office space',
    'Eco-friendly process and materials used throughout production'
  ];
};

const getProductCare = (category: string) => {
  if (category.includes('Steel') || category.includes('Kitchen')) {
    return 'Wash with warm soapy water before first use. Avoid metallic scouring pads. Clean immediately after containing acidic or salty food to prevent pitting.';
  }
  if (category.includes('Aquarium')) {
    return 'Disconnect from power supply before placing hands in water. Clean the impeller unit every 3 months. Do not run dry (out of water) to prevent motor burn-out.';
  }
  if (category.includes('Bottles') || category.includes('Lunch')) {
    return 'Wash with warm water and mild detergent. Leave dry and stored with the lid off. Do not microwave, freeze, or use abrasive chemical cleaners.';
  }
  return 'Wipe gently with a clean, dry microfiber cloth. Avoid direct exposure to sunlight or extreme moisture. Do not use harsh chemical sprays or water washing.';
};

const BACKEND_URL = 'https://backend.gharsansar.store';

// Dynamic image parser (handles comma-separated lists and simple urls)
const getProductGalleryImages = (product: Product): string[] => {
  if (!product.image) return [];
  return typeof product.image === 'string'
    ? product.image.split(',').map((img) => img.trim()).filter(Boolean)
    : [product.image];
};

const ProductDetailView: React.FC = () => {
  const {
    products,
    paginatedProducts,
    flashSale,
    selectedProductId,
    setSelectedProductId,
    addToCart,
    toggleFavorite,
    favorites
  } = useMobileApp();

  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const galleryScrollViewRef = useRef<ScrollView>(null);

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');
  const [pincode, setPincode] = useState('');
  const [checking, setChecking] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<{
    checked: boolean;
    serviceable: boolean;
    city?: string;
    state?: string;
    estimatedDays?: number;
  } | null>(null);
  
  // Fullscreen Zoom Gallery State
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [zoomModalImage, setZoomModalImage] = useState<string | null>(null);

  // Reviews dynamic states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ratingAverage, setRatingAverage] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  // Write Review Form states
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Animation values
  const pageRevealOpacity = useRef(new Animated.Value(0)).current;
  const pageRevealTranslateY = useRef(new Animated.Value(24)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const addToCartScale = useRef(new Animated.Value(1)).current;
  const buyNowScale = useRef(new Animated.Value(1)).current;
  
  // Hero Gallery transitions
  const heroImageOpacity = useRef(new Animated.Value(1)).current;
  const heroImageScale = useRef(new Animated.Value(1)).current;

  // Product Lookup
  const product = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) ||
           paginatedProducts.find((p) => p.id === selectedProductId) ||
           (flashSale && flashSale.products.find((p) => p.id === selectedProductId));
  }, [products, paginatedProducts, flashSale, selectedProductId]);

  // Fetch reviews from backend when product changes
  useEffect(() => {
    if (product) {
      const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
          const res = await fetch(`${BACKEND_URL}/api/reviews/${product.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setReviews(data.reviews);
              setRatingAverage(data.rating_average);
              setRatingCount(data.rating_count);
            }
          }
        } catch (err) {
          console.warn("Failed to load reviews:", err);
        } finally {
          setReviewsLoading(false);
        }
      };
      fetchReviews();
    }
  }, [product?.id]);

  // Entrance reveal animation
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setServiceInfo(null);
      setPincode('');
      setActiveAccordion('description');
      
      pageRevealOpacity.setValue(0);
      pageRevealTranslateY.setValue(24);
      Animated.parallel([
        Animated.timing(pageRevealOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(pageRevealTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [selectedProductId]);

  if (!product) {
    return (
      <View style={styles.errorScreen}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>Product Not Found</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => setSelectedProductId(null)}>
          <Text style={styles.errorBtnText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Related products from the same category
  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 6);
  }, [products, product]);

  // Frequently Bought Together Bundle Configuration
  const boughtTogetherProducts = useMemo(() => {
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 2);
  }, [products, product]);

  const [checkedBundleItems, setCheckedBundleItems] = useState<string[]>([product.id]);

  // Sync bundle checkboxes when boughtTogetherProducts updates
  useEffect(() => {
    setCheckedBundleItems([product.id, ...boughtTogetherProducts.map(p => p.id)]);
  }, [boughtTogetherProducts, product.id]);

  const toggleBundleCheckbox = (id: string) => {
    if (id === product.id) return; // Main product cannot be unchecked
    setCheckedBundleItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const bundleTotal = useMemo(() => {
    let total = product.price;
    boughtTogetherProducts.forEach((p) => {
      if (checkedBundleItems.includes(p.id)) {
        total += p.price;
      }
    });
    return total;
  }, [checkedBundleItems, boughtTogetherProducts, product]);

  const bundleMrpTotal = useMemo(() => {
    let total = product.actPrice;
    boughtTogetherProducts.forEach((p) => {
      if (checkedBundleItems.includes(p.id)) {
        total += p.actPrice;
      }
    });
    return total;
  }, [checkedBundleItems, boughtTogetherProducts, product]);

  const handleAddBundleToCart = () => {
    // Add current
    addToCart(product);
    let count = 1;
    // Add selected related ones
    boughtTogetherProducts.forEach((p) => {
      if (checkedBundleItems.includes(p.id)) {
        addToCart(p);
        count++;
      }
    });
    Alert.alert('Success', `Added ${count} items from bundle to your cart!`);
  };

  const images = getProductGalleryImages(product);
  const isFav = favorites.includes(product.id);
  const brandName = getBrandName(product.title, product.category);
  const tagline = getProductTagline(product.category);
  const specifications = useMemo(() => {
    const specs = getProductSpecs(product);
    return specs.map(spec =>
      spec.label === 'Customer Rating'
        ? { ...spec, value: `${ratingAverage} / 5.0` }
        : spec
    );
  }, [product, ratingAverage]);
  const features = getProductFeatures(product.category);
  const careInstructions = getProductCare(product.category);

  // Express shipping check
  const handleCheckServiceability = async () => {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit Indian pincode.');
      return;
    }
    setChecking(true);
    setServiceInfo(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/shipping/serviceability?pincode=${pincode}`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setServiceInfo({
        checked: true,
        serviceable: data.serviceable,
        city: data.city || 'Mock City',
        state: data.state || 'Mock State',
        estimatedDays: data.serviceable ? 2 : undefined
      });
    } catch (error) {
      setServiceInfo({
        checked: true,
        serviceable: true,
        city: 'Vijayawada (Main Hub)',
        state: 'AP',
        estimatedDays: 1
      });
    } finally {
      setChecking(false);
    }
  };

  // Image Switch transition
  const handleImageSelect = (idx: number) => {
    if (idx === activeImageIndex) return;
    setActiveImageIndex(idx);
    galleryScrollViewRef.current?.scrollTo({
      x: idx * screenWidth,
      animated: true
    });
  };

  // Submit Review to Backend
  const handleReviewSubmit = async () => {
    if (!formName.trim() || !formComment.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          rating: formRating,
          comment: formComment.trim(),
          image: ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
          setRatingAverage(data.rating_average);
          setRatingCount(data.rating_count);
          Alert.alert('Success', 'Review submitted successfully!');
          setFormName('');
          setFormRating(5);
          setFormComment('');
        } else {
          Alert.alert('Error', 'Failed to submit review.');
        }
      } else {
        Alert.alert('Error', 'Server error submitting review.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect to backend.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${product.title} on Ghar Sansar: ₹${product.price}. Beautiful home & kitchen styles!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Wishlist Animation Toggle
  const handleWishlistToggle = () => {
    heartScale.setValue(0.6);
    Animated.spring(heartScale, {
      toValue: 1,
      friction: 3,
      tension: 140,
      useNativeDriver: true
    }).start();
    toggleFavorite(product.id);
  };

  // Cart Bounce Animation
  const handleAddToCart = () => {
    addToCartScale.setValue(0.9);
    Animated.spring(addToCartScale, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true
    }).start();
    addToCart(product);
    Alert.alert('Success', `${product.title} added to cart!`);
  };

  const handleBuyNow = () => {
    buyNowScale.setValue(0.9);
    Animated.spring(buyNowScale, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true
    }).start();
    addToCart(product);
    setSelectedProductId(null);
    Alert.alert('Redirecting to checkout', 'Product added to cart. Opening order review!');
  };

  const savingsValue = product.actPrice - product.price;
  const discountPercent = product.actPrice > 0 ? Math.round((savingsValue / product.actPrice) * 100) : 0;

  const scrollToReviews = () => {
    // Basic approximate scroll to bottom reviews section
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const openZoomGallery = (uri: string) => {
    setZoomModalImage(uri);
    setGalleryModalVisible(true);
  };

  return (
    <View style={styles.screen}>
      {/* Top Header Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.headerRoundBtn}
          activeOpacity={0.7}
          onPress={() => setSelectedProductId(null)}
        >
          <Feather name="chevron-left" size={24} color="#121212" />
        </TouchableOpacity>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerRoundBtn}
            activeOpacity={0.7}
            onPress={handleWishlistToggle}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <FontAwesome
                name={isFav ? "heart" : "heart-o"}
                size={20}
                color={isFav ? '#E31B23' : '#121212'}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerRoundBtn}
            activeOpacity={0.7}
            onPress={handleShare}
          >
            <Feather name="share-2" size={20} color="#121212" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: pageRevealOpacity, transform: [{ translateY: pageRevealTranslateY }] }}
      >
        {/* 1. PRODUCT GALLERY SECTION */}
        <View style={styles.galleryWrapper}>
          {images.length > 1 ? (
            <>
              <View style={styles.heroImageContainer}>
                <ScrollView
                  ref={galleryScrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                    setActiveImageIndex(newIndex);
                  }}
                >
                  {images.map((img, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.95}
                      onPress={() => openZoomGallery(img)}
                      style={{ width: screenWidth, height: 290, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Animated.View style={styles.heroImageFrame}>
                        <PremiumImage
                          uri={img}
                          style={styles.heroImage as any}
                          contentFit="contain"
                          product={product}
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.zoomButton}>
                  <Feather name="maximize-2" size={16} color="#555" />
                </View>
                <View style={styles.dotsIndicatorContainer}>
                  {images.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dotIndicator,
                        activeImageIndex === idx ? styles.activeDotIndicator : styles.inactiveDotIndicator
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Gallery Thumbnails List */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailsContainer}
              >
                {images.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => handleImageSelect(idx)}
                    style={[
                      styles.thumbnailCard,
                      activeImageIndex === idx ? styles.activeThumbnailCard : styles.inactiveThumbnailCard
                    ]}
                  >
                    <PremiumImage uri={img} style={styles.thumbnailImage as any} contentFit="contain" product={product} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => openZoomGallery(images[0])}
              style={styles.heroImageContainer}
            >
              <Animated.View style={styles.heroImageFrame}>
                <PremiumImage
                  uri={images[0]}
                  style={styles.heroImage as any}
                  contentFit="contain"
                  product={product}
                />
              </Animated.View>
              <View style={styles.zoomButton}>
                <Feather name="maximize-2" size={16} color="#555" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.detailsContainer}>
          {/* 2. PRODUCT HEADER TITLE */}
          <View style={styles.productHeaderBlock}>
            <Text style={styles.brandBadge}>{brandName}®</Text>
            <Text style={styles.productName}>{product.title}</Text>
            <Text style={styles.productTaglineText}>{tagline}</Text>
          </View>

          {/* 3. PRODUCT HIGHLIGHT CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
            style={styles.chipsContainer}
          >
            <View style={styles.highlightChip}>
              <Text style={styles.highlightChipText}>✨ Premium Quality</Text>
            </View>
            <View style={styles.highlightChip}>
              <Text style={styles.highlightChipText}>⚡ Fast Delivery</Text>
            </View>
            <View style={[styles.highlightChip, styles.noReturnsChip]}>
              <Text style={styles.noReturnsChipText}>🚫 No Returns / Exchange</Text>
            </View>
            {ratingAverage >= 4.4 && (
              <View style={[styles.highlightChip, styles.bestSellerChip]}>
                <Text style={styles.bestSellerChipText}>🔥 Best Seller</Text>
              </View>
            )}

          </ScrollView>

          {/* 4. RATING BRIEF SUMMARY SECTION */}
          <Pressable style={styles.ratingBarSummary} onPress={scrollToReviews}>
            <View style={styles.ratingStarsRow}>
              <FontAwesome name="star" size={16} color="#D1B000" />
              <Text style={styles.ratingSummaryText}>{ratingAverage} ★</Text>
              <Text style={styles.ratingCountText}>({ratingCount} verified reviews)</Text>
            </View>
            <View style={styles.verifiedBuyersLabel}>
              <Ionicons name="checkmark-circle" size={16} color="#00875A" />
              <Text style={styles.verifiedBuyersText}>100% Verified Buyers</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#8E8E93" />
          </Pressable>

          {/* 5. PRICE SECTION (Amazon Style) */}
          <View style={styles.pricingWrapperCard}>
            <View style={styles.mainPriceLine}>
              <Text style={styles.discountLabelPercent}>-{discountPercent}%</Text>
              <Text style={styles.dealPriceValue}>₹{product.price}</Text>
            </View>
            <View style={styles.mrpLine}>
              <Text style={styles.mrpLabel}>M.R.P.: </Text>
              <Text style={styles.mrpValue}>₹{product.actPrice}</Text>
            </View>
            <View style={styles.savingsRowBadge}>
              <Text style={styles.savingsTextBadge}>You Save: ₹{savingsValue} ({discountPercent}% OFF)</Text>
            </View>
            <Text style={styles.taxInfoText}>Inclusive of all taxes</Text>
          </View>

          {/* 6. EXPRESS SHIPPING CARD */}
          <View style={styles.shippingCheckCard}>
            <View style={styles.shippingHeaderRow}>
              <View style={styles.shippingTitleGroup}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=100' }}
                  style={styles.shippingIcon as any}
                />
                <View>
                  <Text style={styles.shippingCardTitle}>Express Shipping Check</Text>
                  <Text style={styles.shippingSubtitle}>Real-time delivery dates</Text>
                </View>
              </View>
              <View style={styles.shippingLocationMarker}>
                <Feather name="map-pin" size={14} color="#00875A" />
                <Text style={styles.locationPinLabel}>Deliver To</Text>
              </View>
            </View>

            <View style={styles.pincodeActionRow}>
              <TextInput
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.pincodeTextInputBox}
              />
              <TouchableOpacity
                style={styles.pincodeSubmitBtn}
                activeOpacity={0.7}
                onPress={handleCheckServiceability}
                disabled={checking}
              >
                {checking ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.pincodeSubmitText}>Check</Text>
                )}
              </TouchableOpacity>
            </View>

            {serviceInfo && (
              <View style={[
                styles.serviceResultContainer,
                serviceInfo.serviceable ? styles.serviceableResultBg : styles.unserviceableResultBg
              ]}>
                <Ionicons
                  name={serviceInfo.serviceable ? "checkmark-circle" : "alert-circle"}
                  size={18}
                  color={serviceInfo.serviceable ? "#00875A" : "#D04242"}
                />
                <View style={styles.serviceResultTextWrap}>
                  <Text style={[
                    styles.serviceResultHeadline,
                    { color: serviceInfo.serviceable ? "#00875A" : "#D04242" }
                  ]}>
                    {serviceInfo.serviceable ? 'Serviceable & Eligible' : 'Standard Shipping Only'}
                  </Text>
                  <Text style={styles.serviceResultDetails}>
                    {serviceInfo.serviceable
                      ? `Express delivery by ${serviceInfo.estimatedDays === 1 ? 'Tomorrow' : '2 days'} (${serviceInfo.city})`
                      : 'Standard shipping takes 4-7 days to your location.'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.shippingFeatureIndicators}>

              <View style={[styles.indicatorBadgeMini, { borderColor: '#F3C6C6', backgroundColor: '#FCF3F3' }]}>
                <Feather name="x" size={12} color="#D04242" />
                <Text style={[styles.indicatorBadgeMiniText, { color: '#D04242' }]}>No Returns / Exchange</Text>
              </View>
              <View style={styles.indicatorBadgeMini}>
                <Feather name="check" size={12} color="#00875A" />
                <Text style={styles.indicatorBadgeMiniText}>Free Shipping &gt; ₹1000</Text>
              </View>
            </View>
          </View>

          {/* 7. TRUST SECTIONS GRID */}
          <View style={styles.trustBannerGrid}>
            <View style={styles.trustItemBlock}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#121212" />
              <Text style={styles.trustItemTitle}>Secure Payments</Text>
            </View>
            <View style={styles.trustItemBlock}>
              <Ionicons name="airplane-outline" size={20} color="#121212" />
              <Text style={styles.trustItemTitle}>Express Shipping</Text>
            </View>
            <View style={styles.trustItemBlock}>
              <Ionicons name="ribbon-outline" size={20} color="#121212" />
              <Text style={styles.trustItemTitle}>Genuine Products</Text>
            </View>
            <View style={styles.trustItemBlock}>
              <Ionicons name="cube-outline" size={20} color="#121212" />
              <Text style={styles.trustItemTitle}>Safe Packaging</Text>
            </View>
            <View style={styles.trustItemBlock}>
              <Ionicons name="headset-outline" size={20} color="#121212" />
              <Text style={styles.trustItemTitle}>Customer Support</Text>
            </View>
          </View>

          {/* 8. EXPANDABLE ACCORDIONS DESCRIPTION */}
          <View style={styles.accordionsSectionContainer}>
            {/* Accordion 1: Description */}
            <View style={styles.accordionBorderRow}>
              <TouchableOpacity
                style={styles.accordionHeaderBtn}
                activeOpacity={0.7}
                onPress={() => setActiveAccordion(activeAccordion === 'description' ? null : 'description')}
              >
                <Text style={styles.accordionHeaderTitle}>Description</Text>
                <Feather
                  name={activeAccordion === 'description' ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#121212"
                />
              </TouchableOpacity>
              {activeAccordion === 'description' && (
                <View style={styles.accordionContentPanel}>
                  <Text style={styles.accordionTextDescription}>{product.description}</Text>
                </View>
              )}
            </View>

            {/* Accordion 2: Specifications */}
            <View style={styles.accordionBorderRow}>
              <TouchableOpacity
                style={styles.accordionHeaderBtn}
                activeOpacity={0.7}
                onPress={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
              >
                <Text style={styles.accordionHeaderTitle}>Specifications</Text>
                <Feather
                  name={activeAccordion === 'specs' ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#121212"
                />
              </TouchableOpacity>
              {activeAccordion === 'specs' && (
                <View style={styles.accordionContentPanel}>
                  {specifications.map((spec, index) => (
                    <View key={index} style={[
                      styles.specRowItem,
                      index % 2 === 0 ? styles.specRowEven : styles.specRowOdd
                    ]}>
                      <Text style={styles.specRowLabel}>{spec.label}</Text>
                      <Text style={styles.specRowValue}>{spec.value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Accordion 3: Features */}
            <View style={styles.accordionBorderRow}>
              <TouchableOpacity
                style={styles.accordionHeaderBtn}
                activeOpacity={0.7}
                onPress={() => setActiveAccordion(activeAccordion === 'features' ? null : 'features')}
              >
                <Text style={styles.accordionHeaderTitle}>Key Features</Text>
                <Feather
                  name={activeAccordion === 'features' ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#121212"
                />
              </TouchableOpacity>
              {activeAccordion === 'features' && (
                <View style={styles.accordionContentPanel}>
                  {features.map((feat, index) => (
                    <View key={index} style={styles.featureItemBulletRow}>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#00875A" style={styles.featureBulletIcon} />
                      <Text style={styles.featureBulletText}>{feat}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Accordion 4: Care Instructions */}
            <View style={styles.accordionBorderRow}>
              <TouchableOpacity
                style={styles.accordionHeaderBtn}
                activeOpacity={0.7}
                onPress={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
              >
                <Text style={styles.accordionHeaderTitle}>Care Instructions</Text>
                <Feather
                  name={activeAccordion === 'care' ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#121212"
                />
              </TouchableOpacity>
              {activeAccordion === 'care' && (
                <View style={styles.accordionContentPanel}>
                  <Text style={styles.accordionTextDescription}>{careInstructions}</Text>
                </View>
              )}
            </View>

            {/* Accordion 5: Shipping Details */}
            <View style={styles.accordionBorderRow}>
              <TouchableOpacity
                style={styles.accordionHeaderBtn}
                activeOpacity={0.7}
                onPress={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
              >
                <Text style={styles.accordionHeaderTitle}>Shipping & Policy Information</Text>
                <Feather
                  name={activeAccordion === 'shipping' ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#121212"
                />
              </TouchableOpacity>
              {activeAccordion === 'shipping' && (
                <View style={styles.accordionContentPanel}>
                  <Text style={styles.accordionTextDescription}>
                    Every order is packed in heavy-duty multi-layer bubble wrap boxes to guarantee safe transport. Orders leave our fulfillment center within 24 hours. Please note: This item is non-returnable and non-exchangeable to maintain high standards of quality and hygiene.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 9. CUSTOMER REVIEWS */}
          <View style={styles.reviewsSectionWrapper}>
            <Text style={styles.sectionHeaderTitle}>Verified Customer Reviews</Text>
            
            <View style={styles.ratingAnalyticsCard}>
              <View style={styles.averageScoreGroup}>
                <Text style={styles.averageScoreVal}>{ratingAverage}</Text>
                <View style={styles.starsRowBadge}>
                  {[...Array(5)].map((_, i) => {
                    const filled = i + 1 <= ratingAverage;
                    const half = !filled && (i + 0.5 <= ratingAverage);
                    return (
                      <FontAwesome
                        key={i}
                        name={filled ? "star" : half ? "star-half-o" : "star-o"}
                        size={14}
                        color="#D1B000"
                        style={{ marginRight: 2 }}
                      />
                    );
                  })}
                </View>
                <Text style={styles.totalReviewsCounter}>based on {ratingCount} reviews</Text>
              </View>

              <View style={styles.percentageIndicatorRow}>
                <Text style={styles.pctHugeText}>
                  {ratingCount > 0
                    ? `${Math.round((reviews.filter(r => r.rating >= 4).length / ratingCount) * 100)}%`
                    : '100%'}
                </Text>
                <Text style={styles.pctSubtext}>of customers recommended this product</Text>
              </View>
            </View>

            {/* Customer Photos Row */}
            {reviews.map((r) => r.image).filter((img) => img && typeof img === 'string' && img.startsWith('data:image')).length > 0 && (
              <>
                <Text style={styles.reviewsSubHeadline}>Photos from Customers</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.reviewPhotosRow}
                >
                  {reviews
                    .map((r) => r.image)
                    .filter((img) => img && typeof img === 'string' && img.startsWith('data:image'))
                    .map((photo, index) => (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        onPress={() => openZoomGallery(photo)}
                        style={styles.reviewPhotoCardFrame}
                      >
                        <Image source={{ uri: photo }} style={styles.reviewPhotoCardImage as any} contentFit="cover" />
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}

            {/* Individual Reviews */}
            <View style={styles.reviewsListContainer}>
              {reviewsLoading ? (
                <ActivityIndicator size="small" color="#121212" style={{ marginVertical: 20 }} />
              ) : reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>No reviews yet. Be the first to review this product!</Text>
              ) : (
                reviews.map((rev) => (
                  <View key={rev.id || rev._id} style={styles.reviewListItemCard}>
                    <View style={styles.reviewListHeaderRow}>
                      <View style={styles.reviewerAvatarFrame}>
                        <FontAwesome name="user-circle" size={32} color="#CCC" />
                        <View>
                          <Text style={styles.reviewerNameText}>{rev.name || rev.author}</Text>
                          <Text style={styles.reviewDateLabel}>{rev.date}</Text>
                        </View>
                      </View>
                      <View style={styles.verifiedCheckBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#00875A" />
                        <Text style={styles.verifiedCheckText}>Verified Buyer</Text>
                      </View>
                    </View>
                    <View style={styles.starsReviewListItem}>
                      {[...Array(5)].map((_, i) => (
                        <FontAwesome
                          key={i}
                          name={i < rev.rating ? "star" : "star-o"}
                          size={12}
                          color="#D1B000"
                          style={{ marginRight: 2 }}
                        />
                      ))}
                      <Text style={styles.reviewListTitle}>
                        {rev.comment ? (rev.comment.substring(0, 30) + (rev.comment.length > 30 ? '...' : '')) : ''}
                      </Text>
                    </View>
                    <Text style={styles.reviewListBodyText}>{rev.comment}</Text>
                    {rev.image ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => openZoomGallery(rev.image)}
                        style={[styles.reviewPhotoCardFrame, { marginTop: 10 }]}
                      >
                        <Image source={{ uri: rev.image }} style={styles.reviewPhotoCardImage as any} contentFit="cover" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))
              )}
            </View>

            {/* Write a Review Form */}
            <View style={styles.writeReviewCard}>
              <Text style={styles.writeReviewHeaderTitle}>Write your Review</Text>
              
              <Text style={styles.formLabel}>Your Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter full name"
                value={formName}
                onChangeText={setFormName}
                placeholderTextColor="#A9A9A9"
              />

              <Text style={styles.formLabel}>Your Rating</Text>
              <View style={styles.formStarsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFormRating(star)}
                    activeOpacity={0.7}
                  >
                    <FontAwesome
                      name={star <= formRating ? "star" : "star-o"}
                      size={28}
                      color={star <= formRating ? "#D1B000" : "#CCCCCC"}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Review Comments</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Share your experience..."
                multiline
                numberOfLines={3}
                value={formComment}
                onChangeText={setFormComment}
                placeholderTextColor="#A9A9A9"
              />

              <TouchableOpacity
                style={styles.submitReviewBtn}
                activeOpacity={0.8}
                onPress={handleReviewSubmit}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitReviewBtnText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* 11. RELATED PRODUCTS SECTION */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSectionWrapper}>
              <Text style={styles.sectionHeaderTitle}>Related Products</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScrollContainer}
              >
                {relatedProducts.map((item) => {
                  const itemBrand = getBrandName(item.title, item.category);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.9}
                      onPress={() => setSelectedProductId(item.id)}
                      style={styles.relatedCard}
                    >
                      <PremiumImage uri={item.image} style={styles.relatedCardImg as any} contentFit="contain" product={item} />
                      <View style={styles.relatedCardMeta}>
                        <Text style={styles.relatedCardBrand}>{itemBrand}</Text>
                        <Text style={styles.relatedCardTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.relatedCardPrice}>₹{item.price}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* 12. STICKY BUY BAR SECTION */}
      <View style={[styles.bottomStickyBuyBar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <View style={styles.bottomBarPriceGroup}>
          <Text style={styles.bottomBarPriceVal}>₹{product.price}</Text>
          <Text style={styles.bottomBarMrpValue}>₹{product.actPrice}</Text>
        </View>
        <View style={styles.bottomBarActionBtns}>
          <Animated.View style={{ flex: 1, transform: [{ scale: addToCartScale }] }}>
            <TouchableOpacity
              style={styles.bottomAddToCartBtn}
              activeOpacity={0.8}
              onPress={handleAddToCart}
            >
              <Text style={styles.bottomAddToCartBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ flex: 1, transform: [{ scale: buyNowScale }] }}>
            <TouchableOpacity
              style={styles.bottomBuyNowBtn}
              activeOpacity={0.8}
              onPress={handleBuyNow}
            >
              <Text style={styles.bottomBuyNowBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* 13. FULLSCREEN ZOOM GALLERY MODAL */}
      <Modal
        visible={galleryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGalleryModalVisible(false)}
      >
        <View style={styles.modalOverlayContainer}>
          <TouchableOpacity
            style={styles.modalCloseBtnOverlay}
            activeOpacity={0.7}
            onPress={() => setGalleryModalVisible(false)}
          >
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zoomModalContentFrame}
          >
            {zoomModalImage && (
              <Image source={{ uri: zoomModalImage }} style={styles.zoomModalImageElement as any} contentFit="contain" />
            )}
          </ScrollView>
          <Text style={styles.zoomModalInstructionText}>Pinch screen to zoom image</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 160, // leaves room for the sticky bottom bar
  },
  errorScreen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#121212',
    letterSpacing: 0.2,
  },
  errorBtn: {
    backgroundColor: '#121212',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    backgroundColor: 'transparent',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerRoundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  galleryWrapper: {
    backgroundColor: '#FAFAFA',
    paddingTop: 100, // clears the header overlay
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#EBEBEB',
  },
  heroImageContainer: {
    width: screenWidth,
    height: 290,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroImageFrame: {
    width: '90%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  zoomButton: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 10,
  },
  thumbnailCard: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  activeThumbnailCard: {
    borderColor: '#121212',
  },
  inactiveThumbnailCard: {
    borderColor: '#EBEBEB',
  },
  thumbnailImage: {
    width: '85%',
    height: '85%',
  },
  detailsContainer: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  productHeaderBlock: {
    marginBottom: 16,
  },
  brandBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8A704C', // premium branding gold
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  productName: {
    fontSize: 23,
    fontWeight: '900',
    color: '#121212',
    lineHeight: 28,
    marginBottom: 6,
  },
  productTaglineText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  chipsContainer: {
    marginBottom: 18,
  },
  chipsScroll: {
    gap: 8,
  },
  highlightChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F4F5F6',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  highlightChipText: {
    fontSize: 11,
    color: '#121212',
    fontWeight: '800',
  },
  bestSellerChip: {
    backgroundColor: '#FFF5E5',
    borderColor: '#FFE0B2',
  },
  bestSellerChipText: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '900',
  },
  ratingBarSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    marginBottom: 18,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingSummaryText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#121212',
  },
  ratingCountText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
  },
  verifiedBuyersLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4EA',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  verifiedBuyersText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00875A',
  },
  pricingWrapperCard: {
    backgroundColor: '#FCFCFD',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  mainPriceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  discountLabelPercent: {
    fontSize: 28,
    fontWeight: '300',
    color: '#D04242', // premium red
  },
  dealPriceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: -0.5,
  },
  mrpLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  mrpLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  mrpValue: {
    fontSize: 13,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  savingsRowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EA',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  savingsTextBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00875A',
  },
  taxInfoText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 10,
  },
  shippingCheckCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    marginBottom: 18,
    gap: 14,
  },
  shippingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shippingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F4F5F6',
  },
  shippingCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#121212',
  },
  shippingSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  shippingLocationMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationPinLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00875A',
  },
  pincodeActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pincodeTextInputBox: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '800',
    color: '#121212',
  },
  pincodeSubmitBtn: {
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pincodeSubmitText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  serviceResultContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  serviceableResultBg: {
    backgroundColor: '#F3FAF5',
    borderColor: '#C6ECCF',
  },
  unserviceableResultBg: {
    backgroundColor: '#FCF3F3',
    borderColor: '#F3C6C6',
  },
  serviceResultTextWrap: {
    flex: 1,
  },
  serviceResultHeadline: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 2,
  },
  serviceResultDetails: {
    fontSize: 11,
    color: '#555555',
    fontWeight: '600',
    lineHeight: 15,
  },
  shippingFeatureIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: '#F4F5F6',
  },
  indicatorBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9F9FB',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  indicatorBadgeMiniText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  trustBannerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    marginBottom: 24,
  },
  trustItemBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  trustItemTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  accordionsSectionContainer: {
    borderTopWidth: 1,
    borderColor: '#EBEBEB',
    marginBottom: 24,
  },
  accordionBorderRow: {
    borderBottomWidth: 1,
    borderColor: '#EBEBEB',
  },
  accordionHeaderBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  accordionHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: 0.1,
  },
  accordionContentPanel: {
    paddingBottom: 16,
    paddingTop: 2,
  },
  accordionTextDescription: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '600',
    lineHeight: 22,
  },
  specRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  specRowEven: {
    backgroundColor: '#FAFAFA',
  },
  specRowOdd: {
    backgroundColor: '#FFFFFF',
  },
  specRowLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
  },
  specRowValue: {
    fontSize: 12,
    color: '#121212',
    fontWeight: '800',
  },
  featureItemBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  featureBulletIcon: {
    marginTop: 2,
  },
  featureBulletText: {
    flex: 1,
    fontSize: 12.5,
    color: '#4A4A4A',
    fontWeight: '700',
    lineHeight: 18,
  },
  reviewsSectionWrapper: {
    marginBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: 0.1,
    marginBottom: 14,
  },
  ratingAnalyticsCard: {
    flexDirection: 'row',
    backgroundColor: '#FCFCFD',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  averageScoreGroup: {
    flex: 1.2,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#EBEBEB',
    paddingRight: 8,
  },
  averageScoreVal: {
    fontSize: 34,
    fontWeight: '900',
    color: '#121212',
  },
  starsRowBadge: {
    flexDirection: 'row',
    gap: 3,
    marginVertical: 4,
  },
  totalReviewsCounter: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
  },
  percentageIndicatorRow: {
    flex: 1.4,
    alignItems: 'center',
    paddingLeft: 8,
  },
  pctHugeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#00875A',
  },
  pctSubtext: {
    fontSize: 10.5,
    color: '#555555',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  reviewsSubHeadline: {
    fontSize: 13,
    fontWeight: '900',
    color: '#121212',
    marginBottom: 10,
  },
  reviewPhotosRow: {
    gap: 10,
    marginBottom: 20,
  },
  reviewPhotoCardFrame: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F4F5F6',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    overflow: 'hidden',
  },
  reviewPhotoCardImage: {
    width: '100%',
    height: '100%',
  },
  reviewsListContainer: {
    gap: 12,
  },
  reviewListItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 16,
    padding: 16,
  },
  reviewListHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerAvatarFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerNameText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#121212',
  },
  reviewDateLabel: {
    fontSize: 10.5,
    color: '#8E8E93',
    fontWeight: '600',
  },
  verifiedCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3FAF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  verifiedCheckText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#00875A',
  },
  starsReviewListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewListTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#121212',
    marginLeft: 6,
  },
  reviewListBodyText: {
    fontSize: 12.5,
    color: '#555555',
    fontWeight: '600',
    lineHeight: 18,
  },
  bundleFbtSectionCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 20,
    marginBottom: 24,
  },
  bundleChainLayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  bundleItemThumbnailFrame: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bundleItemThumbnailImg: {
    width: '75%',
    height: '75%',
  },
  bundleItemLabelPrice: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#121212',
    position: 'absolute',
    bottom: -18,
    textAlign: 'center',
    width: '100%',
  },
  bundleChainPlusDivider: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bundleCheckboxIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  bundleCheckboxChecked: {
    backgroundColor: '#121212',
    borderColor: '#121212',
  },
  bundleCheckboxUnchecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
  },
  bundleChecklistTextGroup: {
    marginTop: 24,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#EBEBEB',
    paddingBottom: 16,
  },
  bundleChecklistItemTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bundleCheckedIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EBEBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bundleChecklistCheckIndicatorBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistCheckChecked: {
    backgroundColor: '#121212',
    borderColor: '#121212',
  },
  checklistCheckUnchecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
  },
  bundleChecklistItemTitle: {
    fontSize: 12,
    color: '#4A4A4A',
    fontWeight: '700',
    flex: 1,
  },
  bundleCheckoutRowSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  bundleCumulativePrices: {
    gap: 2,
  },
  bundleCumulativeTotalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cumulativePriceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
  },
  cumulativePriceVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#121212',
  },
  cumulativeSavingsLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00875A',
  },
  bundleAddToCartBtn: {
    backgroundColor: '#121212',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bundleAddToCartBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12.5,
  },
  relatedScrollContainer: {
    gap: 12,
  },
  relatedCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 16,
    padding: 10,
    overflow: 'hidden',
  },
  relatedCardImg: {
    width: '100%',
    height: 100,
    marginBottom: 8,
  },
  relatedCardMeta: {
    gap: 2,
  },
  relatedCardBrand: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A704C',
    letterSpacing: 0.5,
  },
  relatedCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#121212',
    lineHeight: 15,
    height: 30,
  },
  relatedCardPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#121212',
  },
  relatedSectionWrapper: {
    marginTop: 8,
  },
  bottomStickyBuyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomBarPriceGroup: {
    justifyContent: 'center',
  },
  bottomBarPriceVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#121212',
  },
  bottomBarMrpValue: {
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontWeight: '600',
    marginTop: 1,
  },
  bottomBarActionBtns: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  bottomAddToCartBtn: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#121212',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomAddToCartBtnText: {
    color: '#121212',
    fontWeight: '900',
    fontSize: 14,
  },
  bottomBuyNowBtn: {
    backgroundColor: '#121212',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBuyNowBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  modalOverlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomModalContentFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
  },
  zoomModalImageElement: {
    width: '95%',
    height: '75%',
  },
  zoomModalInstructionText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '800',
    position: 'absolute',
    bottom: 40,
    textAlign: 'center',
    width: '100%',
  },
  noReviewsText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 20,
  },
  writeReviewCard: {
    backgroundColor: '#FCFCFD',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 18,
    marginTop: 20,
  },
  writeReviewHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#121212',
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4A4A4A',
    marginBottom: 6,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 12,
    fontWeight: '700',
    color: '#121212',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  submitReviewBtn: {
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  noReturnsChip: {
    backgroundColor: '#FCF3F3',
    borderColor: '#F3C6C6',
  },
  noReturnsChipText: {
    fontSize: 11,
    color: '#D04242',
    fontWeight: '800',
  },
  dotsIndicatorContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDotIndicator: {
    backgroundColor: '#121212',
    width: 14,
  },
  inactiveDotIndicator: {
    backgroundColor: '#CCCCCC',
  },
});

export default ProductDetailView;
