import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileApp } from '../context/MobileAppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumImage } from '../components/PremiumImage';
import { BACKEND_URL } from '../config';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CartView: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    toggleCartSelection,
    toggleAllCartSelections,
    favorites,
    toggleFavorite,
    setSelectedProductId,
    setActiveTab,
    products
  } = useMobileApp();

  const insets = useSafeAreaInsets();

  // Promo code & Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent?: number;
    discountAmount?: number;
    title?: string;
    discountType?: string;
    discountValue?: number;
    maxDiscount?: number;
    minOrderValue?: number;
    savingsMessage?: string;
  } | null>({
    code: 'GHARLUXE',
    discountPercent: 10,
    title: '10% Luxury Home Discount',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 1000
  });
  const [couponError, setCouponError] = useState('');

  // Fetch live coupons from backend API on mount
  useEffect(() => {
    let isMounted = true;
    const loadCoupons = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/coupons`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.coupons)) {
            setAvailableCoupons(data.coupons);
          }
        }
      } catch (e) {
        // Fallback gracefully
      }
    };
    loadCoupons();
    return () => { isMounted = false; };
  }, []);

  // Checkout Modal State
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'cod'>('upi');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Royale Crest, Jubilee Hills, Hyderabad 500033');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Cart Calculations
  const allSelected = cart.length > 0 && cart.every((item) => item.selected);
  const selectedItems = useMemo(() => cart.filter((item) => item.selected), [cart]);
  const selectedCount = selectedItems.length;

  const rawSubtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  }, [selectedItems]);

  const rawMrpTotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const mrp = item.product.actPrice && item.product.actPrice > item.product.price
        ? item.product.actPrice
        : item.product.price * 1.25;
      return sum + mrp * item.quantity;
    }, 0);
  }, [selectedItems]);

  // Free delivery threshold: ₹999
  const FREE_DELIVERY_THRESHOLD = 999;
  const isFreeDelivery = rawSubtotal >= FREE_DELIVERY_THRESHOLD || rawSubtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : 99;
  const deliveryProgress = Math.min(1, rawSubtotal / FREE_DELIVERY_THRESHOLD);

  // Discount calculations
  const productSavings = Math.max(0, rawMrpTotal - rawSubtotal);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || selectedCount === 0) return 0;
    if (appliedCoupon.discountType === 'percentage' || appliedCoupon.discountPercent) {
      const pct = appliedCoupon.discountValue || appliedCoupon.discountPercent || 0;
      let disc = Math.round((rawSubtotal * pct) / 100);
      if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
        disc = appliedCoupon.maxDiscount;
      }
      return disc;
    }
    if (appliedCoupon.discountType === 'flat') {
      return Math.min(rawSubtotal, appliedCoupon.discountValue || appliedCoupon.discountAmount || 0);
    }
    if (appliedCoupon.discountType === 'free_shipping') {
      return isFreeDelivery ? 0 : deliveryFee;
    }
    return appliedCoupon.discountAmount || 0;
  }, [appliedCoupon, rawSubtotal, selectedCount, isFreeDelivery, deliveryFee]);

  const packagingFee = 0; // Complimentary festive packaging
  const grandTotal = Math.max(0, rawSubtotal - couponDiscount + deliveryFee);
  const totalSavings = productSavings + couponDiscount + (isFreeDelivery && rawSubtotal > 0 ? 99 : 0);

  // Haptic feedback trigger
  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    try {
      Haptics.impactAsync(style);
    } catch (e) {}
  };

  // Selection handlers
  const handleSelectAllToggle = () => {
    triggerHaptic();
    toggleAllCartSelections(!allSelected);
  };

  const handleItemCheck = (id: string) => {
    triggerHaptic();
    toggleCartSelection(id);
  };

  const handleQuantityChange = (id: string, delta: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    updateCartQuantity(id, delta);
  };

  const handleRemoveItem = (id: string, title: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${title}" from your shopping bag?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const item = cart.find(c => c.product.id === id);
            if (item) {
              updateCartQuantity(id, -item.quantity);
            }
          }
        }
      ]
    );
  };

  const handleMoveToWishlist = (product: any) => {
    triggerHaptic();
    if (!favorites.includes(product.id)) {
      toggleFavorite(product.id);
    }
    const item = cart.find(c => c.product.id === product.id);
    if (item) {
      updateCartQuantity(product.id, -item.quantity);
    }
    Alert.alert('Saved to Wishlist', `${product.title} has been moved to your wishlist.`);
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    triggerHaptic();

    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (rawSubtotal <= 0) {
      setCouponError('Please select items in bag first');
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: rawSubtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          title: data.title || data.coupon?.title,
          discountType: data.coupon?.discountType || 'percentage',
          discountValue: data.coupon?.discountValue,
          maxDiscount: data.coupon?.maxDiscount,
          minOrderValue: data.coupon?.minOrderValue,
          discountAmount: data.discount,
          savingsMessage: data.savingsMessage
        });
        setCouponCode('');
        Alert.alert('Coupon Applied 🎉', data.savingsMessage || `Code ${data.code} applied!`);
      } else {
        setCouponError(data.message || 'Invalid or expired coupon code');
      }
    } catch (e) {
      // Offline fallback
      if (code === 'GHARLUXE') {
        setAppliedCoupon({
          code: 'GHARLUXE',
          title: '10% Luxury Home Discount',
          discountPercent: 10,
          discountType: 'percentage',
          discountValue: 10,
          maxDiscount: 1000
        });
        setCouponCode('');
      } else if (code === 'FESTIVE500') {
        if (rawSubtotal < 2499) {
          setCouponError('FESTIVE500 requires a minimum order of ₹2,499');
        } else {
          setAppliedCoupon({
            code: 'FESTIVE500',
            title: 'Flat ₹500 Mega Festive Savings',
            discountType: 'flat',
            discountValue: 500,
            discountAmount: 500
          });
          setCouponCode('');
        }
      } else if (code === 'WELCOME15') {
        if (rawSubtotal < 499) {
          setCouponError('WELCOME15 requires a minimum order of ₹499');
        } else {
          setAppliedCoupon({
            code: 'WELCOME15',
            title: '15% First Order Welcome Gift',
            discountType: 'percentage',
            discountValue: 15,
            maxDiscount: 750
          });
          setCouponCode('');
        }
      } else if (code === 'FREESHIP') {
        setAppliedCoupon({
          code: 'FREESHIP',
          title: '100% Free Express Delivery',
          discountType: 'free_shipping',
          discountAmount: 99
        });
        setCouponCode('');
      } else {
        setCouponError('Invalid coupon code. Try GHARLUXE, FESTIVE500 or WELCOME15');
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    triggerHaptic();
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleProceedCheckout = () => {
    if (selectedCount === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item from your bag to proceed with checkout.');
      return;
    }
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setCheckoutModalVisible(true);
  };

  const handleConfirmOrder = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setOrderPlaced(true);
    setTimeout(() => {
      // Remove ordered items from cart
      selectedItems.forEach(item => {
        updateCartQuantity(item.product.id, -item.quantity);
      });
      setOrderPlaced(false);
      setCheckoutModalVisible(false);
      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Thank you for shopping with Ghar Sansar! Your luxury pieces are being carefully packaged for delivery to ${deliveryAddress.split(',')[0]}. Track your order in the Profile tab.`,
        [
          { text: 'View Orders', onPress: () => setActiveTab('account') },
          { text: 'Continue Shopping', onPress: () => setActiveTab('home') }
        ]
      );
    }, 1500);
  };

  // Recommended products for empty state or footer upsell
  const recommendedUpsell = useMemo(() => {
    const cartIds = new Set(cart.map(c => c.product.id));
    return products.filter(p => !cartIds.has(p.id)).slice(0, 4);
  }, [products, cart]);

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            activeOpacity={0.7}
            onPress={() => setActiveTab('wishlist')}
          >
            <Feather name="heart" size={20} color="#121212" />
            {favorites.length > 0 && (
              <View style={styles.headerBadgeDot} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* DELIVERY LOCATION BAR */}
      <View style={styles.deliveryBar}>
        <View style={styles.deliveryIconCircle}>
          <Feather name="map-pin" size={15} color="#C5A880" />
        </View>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryLabel}>DELIVERING TO</Text>
          <Text style={styles.deliveryAddress} numberOfLines={1}>
            {deliveryAddress}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.changeAddressBtn}
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic();
            setIsEditingAddress(true);
            setCheckoutModalVisible(true);
          }}
        >
          <Text style={styles.changeAddressText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* FREE DELIVERY PROGRESS THRESHOLD */}
      {cart.length > 0 && (
        <View style={styles.thresholdBanner}>
          <View style={styles.thresholdTopRow}>
            <View style={styles.truckIconBadge}>
              <Feather name="truck" size={14} color={isFreeDelivery ? '#2E7D32' : '#C5A880'} />
            </View>
            <Text style={styles.thresholdText}>
              {isFreeDelivery
                ? '🎉 You have unlocked FREE Express Luxury Delivery!'
                : `Add ₹${(FREE_DELIVERY_THRESHOLD - rawSubtotal).toLocaleString()} more for FREE Delivery`}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(deliveryProgress * 100)}%`,
                  backgroundColor: isFreeDelivery ? '#34C759' : '#C5A880'
                }
              ]}
            />
          </View>
        </View>
      )}

      {/* BODY CONTENT */}
      {cart.length === 0 ? (
        /* EMPTY STATE */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.emptyContainer, { paddingBottom: 160 }]}
        >
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="shopping-bag" size={44} color="#C5A880" />
            </View>
            <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Explore our curated collections of artisanal dinner sets, handcrafted decor, and kitchen essentials to elevate your home.
            </Text>
            <TouchableOpacity
              style={styles.exploreCtaBtn}
              activeOpacity={0.85}
              onPress={() => {
                triggerHaptic();
                setActiveTab('explore');
              }}
            >
              <Text style={styles.exploreCtaText}>Explore Collections</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Recommendations when Empty */}
          {recommendedUpsell.length > 0 && (
            <View style={styles.emptyUpsellSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Pieces You May Love</Text>
              </View>
              <View style={styles.upsellGrid}>
                {recommendedUpsell.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.upsellCard}
                    activeOpacity={0.9}
                    onPress={() => setSelectedProductId(item.id)}
                  >
                    <View style={styles.upsellImgWrapper}>
                      <PremiumImage uri={item.image} style={styles.upsellImg} product={item} />
                    </View>
                    <Text style={styles.upsellTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.upsellPriceRow}>
                      <Text style={styles.upsellPrice}>₹{item.price.toLocaleString()}</Text>
                      <TouchableOpacity
                        style={styles.quickAddBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          triggerHaptic();
                          updateCartQuantity(item.id, 1);
                        }}
                      >
                        <Feather name="plus" size={14} color="#121212" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        /* CART WITH ITEMS */
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {/* BULK SELECTION ACTIONS BAR */}
            <View style={styles.bulkActionsRow}>
              <TouchableOpacity
                style={styles.selectAllToggle}
                activeOpacity={0.7}
                onPress={handleSelectAllToggle}
              >
                <View
                  style={[
                    styles.checkbox,
                    allSelected ? styles.checkboxChecked : styles.checkboxUnchecked
                  ]}
                >
                  {allSelected && <Feather name="check" size={13} color="#FFFFFF" />}
                </View>
                <Text style={styles.selectAllText}>
                  Select All ({selectedCount}/{cart.length})
                </Text>
              </TouchableOpacity>

              <View style={styles.bulkRightActions}>
                {selectedCount > 0 && (
                  <TouchableOpacity
                    style={styles.bulkDeleteBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      triggerHaptic();
                      Alert.alert(
                        'Remove Selected',
                        `Remove ${selectedCount} selected items from your bag?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () => {
                              selectedItems.forEach(item => updateCartQuantity(item.product.id, -item.quantity));
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Feather name="trash-2" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* CART ITEMS LIST */}
            <View style={styles.itemsList}>
              {cart.map((item) => {
                const p = item.product;
                const mrp = p.actPrice && p.actPrice > p.price ? p.actPrice : Math.round(p.price * 1.25);
                const discountPct = Math.round(((mrp - p.price) / mrp) * 100);
                const isItemFav = favorites.includes(p.id);

                return (
                  <View key={p.id} style={styles.cartCard}>
                    {/* Item Top Row: Checkbox, Thumbnail, Details */}
                    <View style={styles.cardMainRow}>
                      {/* Checkbox */}
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          item.selected ? styles.checkboxChecked : styles.checkboxUnchecked
                        ]}
                        activeOpacity={0.8}
                        onPress={() => handleItemCheck(p.id)}
                      >
                        {item.selected && <Feather name="check" size={13} color="#FFFFFF" />}
                      </TouchableOpacity>

                      {/* Product Thumbnail */}
                      <TouchableOpacity
                        style={styles.thumbnailContainer}
                        activeOpacity={0.85}
                        onPress={() => setSelectedProductId(p.id)}
                      >
                        <PremiumImage
                          uri={p.image}
                          style={styles.thumbnail}
                          product={p}
                          contentFit="contain"
                        />
                      </TouchableOpacity>

                      {/* Info Body */}
                      <View style={styles.itemDetailsCol}>
                        <View style={styles.itemCategoryRow}>
                          <Text style={styles.categoryBadgeText} numberOfLines={1}>
                            {p.category || 'Luxury Decor'}
                          </Text>
                          {discountPct > 0 && (
                            <View style={styles.discountBadge}>
                              <Text style={styles.discountBadgeText}>{discountPct}% OFF</Text>
                            </View>
                          )}
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => setSelectedProductId(p.id)}
                        >
                          <Text style={styles.itemTitle} numberOfLines={2}>
                            {p.title}
                          </Text>
                        </TouchableOpacity>

                        {/* Price Row */}
                        <View style={styles.priceRow}>
                          <Text style={styles.itemPrice}>₹{p.price.toLocaleString()}</Text>
                          {mrp > p.price && (
                            <Text style={styles.mrpText}>₹{mrp.toLocaleString()}</Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.cardDivider} />

                    {/* Item Bottom Actions: Stepper + Wishlist + Remove */}
                    <View style={styles.cardFooterRow}>
                      <View style={styles.itemQuickActions}>
                        <TouchableOpacity
                          style={styles.wishlistToggleBtn}
                          activeOpacity={0.7}
                          onPress={() => handleMoveToWishlist(p)}
                        >
                          <Feather
                            name="heart"
                            size={16}
                            color={isItemFav ? '#FF3B30' : '#8E8E93'}
                          />
                          <Text style={[styles.actionBtnLabel, isItemFav && { color: '#FF3B30' }]}>
                            {isItemFav ? 'Wishlisted' : 'Save for later'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.removeBtn}
                          activeOpacity={0.7}
                          onPress={() => handleRemoveItem(p.id, p.title)}
                        >
                          <Feather name="trash-2" size={15} color="#8E8E93" />
                          <Text style={styles.actionBtnLabel}>Remove</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Stepper Controls */}
                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          activeOpacity={0.7}
                          onPress={() => handleQuantityChange(p.id, -1)}
                        >
                          <Feather
                            name={item.quantity === 1 ? 'trash-2' : 'minus'}
                            size={14}
                            color={item.quantity === 1 ? '#FF3B30' : '#121212'}
                          />
                        </TouchableOpacity>

                        <Text style={styles.stepperQuantity}>{item.quantity}</Text>

                        <TouchableOpacity
                          style={styles.stepperBtn}
                          activeOpacity={0.7}
                          onPress={() => handleQuantityChange(p.id, 1)}
                        >
                          <Feather name="plus" size={14} color="#121212" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* COUPONS & PROMO CODES */}
            <View style={styles.couponSection}>
              <View style={styles.couponCard}>
                <View style={styles.couponHeader}>
                  <View style={styles.couponIconPill}>
                    <Ionicons name="pricetag-outline" size={16} color="#C5A880" />
                  </View>
                  <Text style={styles.couponSectionTitle}>Coupons & Exclusive Offers</Text>
                </View>

                {appliedCoupon ? (
                  <View style={styles.appliedCouponBanner}>
                    <View style={styles.appliedCouponLeft}>
                      <Feather name="check-circle" size={18} color="#34C759" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.appliedCodeName}>{appliedCoupon.code} Applied</Text>
                        <Text style={styles.appliedCodeDesc} numberOfLines={1}>
                          {appliedCoupon.title ||
                            (appliedCoupon.discountType === 'percentage'
                              ? `${appliedCoupon.discountValue || appliedCoupon.discountPercent}% luxury discount applied`
                              : `₹${appliedCoupon.discountAmount || appliedCoupon.discountValue} savings applied`)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleRemoveCoupon}
                      style={styles.removeCouponBtn}
                    >
                      <Text style={styles.removeCouponText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.couponInputRow}>
                      <TextInput
                        placeholder="Enter coupon code (e.g. GHARLUXE)"
                        placeholderTextColor="#A0A0A5"
                        value={couponCode}
                        onChangeText={(t) => {
                          setCouponCode(t);
                          if (couponError) setCouponError('');
                        }}
                        autoCapitalize="characters"
                        style={styles.couponInput}
                      />
                      <TouchableOpacity
                        style={[styles.applyCouponBtn, (!couponCode.trim() || validatingCoupon) && styles.applyCouponBtnDisabled]}
                        disabled={!couponCode.trim() || validatingCoupon}
                        onPress={() => handleApplyCoupon()}
                      >
                        {validatingCoupon ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.applyCouponText}>Apply</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    {couponError ? (
                      <Text style={styles.couponErrorText}>{couponError}</Text>
                    ) : null}
                  </>
                )}

                {/* Flipkart & Amazon Style Available Coupons Carousel */}
                <View style={{ marginTop: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                    Available Exclusive Offers
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.couponChipsRow}
                  >
                    {(availableCoupons.length > 0 ? availableCoupons : [
                      { code: 'GHARLUXE', discountType: 'percentage', discountValue: 10, badge: 'BESTSELLER' },
                      { code: 'FESTIVE500', discountType: 'flat', discountValue: 500, badge: 'FESTIVE' },
                      { code: 'WELCOME15', discountType: 'percentage', discountValue: 15, badge: 'NEW USER' },
                      { code: 'FREESHIP', discountType: 'free_shipping', discountValue: 99, badge: 'FREE DEL' },
                      { code: 'AMAZON50', discountType: 'flat', discountValue: 50, badge: 'UPI SPECIAL' },
                      { code: 'VIPCLUB20', discountType: 'percentage', discountValue: 20, badge: 'VIP ELITE' }
                    ]).map((c: any) => {
                      const isApplied = Boolean(appliedCoupon && appliedCoupon.code === c.code);
                      return (
                        <TouchableOpacity
                          key={c.code}
                          activeOpacity={0.7}
                          style={[styles.couponChip, isApplied && styles.couponChipActive]}
                          onPress={() => isApplied ? handleRemoveCoupon() : handleApplyCoupon(c.code)}
                        >
                          <Ionicons
                            name={isApplied ? "checkmark-circle" : "pricetag"}
                            size={12}
                            color={isApplied ? "#34C759" : "#C5A880"}
                          />
                          <Text style={[styles.couponChipTitle, isApplied && { color: '#34C759' }]}>
                            {c.code}
                          </Text>
                          <Text style={styles.couponChipDesc}>
                            {c.discountType === 'percentage'
                              ? `${c.discountValue}% OFF`
                              : c.discountType === 'free_shipping'
                              ? 'FREE DEL'
                              : `₹${c.discountValue} OFF`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* ORDER BILL SUMMARY */}
            <View style={styles.billSection}>
              <View style={styles.billCard}>
                <Text style={styles.billSectionTitle}>Price Details</Text>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Bag Total ({selectedCount} items)</Text>
                  <Text style={styles.billValue}>₹{rawMrpTotal.toLocaleString()}</Text>
                </View>

                {productSavings > 0 && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Product Discount</Text>
                    <Text style={styles.billSavingsText}>-₹{productSavings.toLocaleString()}</Text>
                  </View>
                )}

                {appliedCoupon && couponDiscount > 0 && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Coupon Discount ({appliedCoupon.code})</Text>
                    <Text style={styles.billSavingsText}>-₹{couponDiscount.toLocaleString()}</Text>
                  </View>
                )}

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  <Text style={isFreeDelivery ? styles.billFreeText : styles.billValue}>
                    {isFreeDelivery ? 'FREE' : `₹${deliveryFee}`}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Festive Luxury Gift Packaging</Text>
                  <View style={styles.packagingRow}>
                    <Text style={styles.mrpSmallStrikethrough}>₹150</Text>
                    <Text style={styles.billFreeText}>FREE</Text>
                  </View>
                </View>

                <View style={styles.billDivider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Payable</Text>
                  <Text style={styles.totalAmount}>₹{grandTotal.toLocaleString()}</Text>
                </View>

                {totalSavings > 0 && (
                  <View style={styles.savingsBanner}>
                    <Ionicons name="sparkles" size={14} color="#2E7D32" />
                    <Text style={styles.savingsBannerText}>
                      You will save ₹{totalSavings.toLocaleString()} on this order!
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* TRUST GUARANTEES BADGES */}
            <View style={styles.trustBadgesRow}>
              <View style={styles.trustBadgeItem}>
                <Feather name="shield" size={18} color="#C5A880" />
                <Text style={styles.trustBadgeTitle}>Authentic</Text>
                <Text style={styles.trustBadgeSubtitle}>100% Handcrafted</Text>
              </View>
              <View style={styles.trustBadgeDivider} />
              <View style={styles.trustBadgeItem}>
                <Feather name="refresh-cw" size={18} color="#C5A880" />
                <Text style={styles.trustBadgeTitle}>Easy Returns</Text>
                <Text style={styles.trustBadgeSubtitle}>7 Days Window</Text>
              </View>
              <View style={styles.trustBadgeDivider} />
              <View style={styles.trustBadgeItem}>
                <Feather name="lock" size={18} color="#C5A880" />
                <Text style={styles.trustBadgeTitle}>Secure</Text>
                <Text style={styles.trustBadgeSubtitle}>256-Bit Encrypted</Text>
              </View>
            </View>
          </ScrollView>

          {/* FLOATING CHECKOUT BAR (Docked precisely above App bottom nav bar) */}
          <View style={styles.floatingCheckoutBar}>
            <View style={styles.checkoutPriceCol}>
              <Text style={styles.checkoutSubText}>TOTAL PAYABLE</Text>
              <Text style={styles.checkoutFinalPrice}>₹{grandTotal.toLocaleString()}</Text>
              {totalSavings > 0 && (
                <Text style={styles.checkoutSavedNote}>Saved ₹{totalSavings.toLocaleString()}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.proceedCheckoutBtn,
                selectedCount === 0 && styles.proceedCheckoutBtnDisabled
              ]}
              activeOpacity={0.85}
              onPress={handleProceedCheckout}
            >
              <Text style={styles.proceedCheckoutText}>
                {selectedCount > 0 ? `Checkout (${selectedCount})` : 'Select Items'}
              </Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* CHECKOUT & ORDER CONFIRMATION MODAL */}
      <Modal
        visible={checkoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Confirmation</Text>
              <TouchableOpacity
                onPress={() => setCheckoutModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={20} color="#121212" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {/* Delivery Address Section */}
              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Feather name="map-pin" size={16} color="#C5A880" />
                  <Text style={styles.modalSectionTitle}>Delivery Destination</Text>
                </View>
                {isEditingAddress ? (
                  <View style={styles.addressEditBox}>
                    <TextInput
                      value={deliveryAddress}
                      onChangeText={setDeliveryAddress}
                      multiline
                      style={styles.addressInput}
                      placeholder="Enter delivery address..."
                    />
                    <TouchableOpacity
                      style={styles.saveAddressBtn}
                      onPress={() => {
                        triggerHaptic();
                        setIsEditingAddress(false);
                      }}
                    >
                      <Text style={styles.saveAddressText}>Save Address</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.addressDisplayBox}>
                    <Text style={styles.addressDisplayRecipient}>Sharmila Konapala</Text>
                    <Text style={styles.addressDisplayText}>{deliveryAddress}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic();
                        setIsEditingAddress(true);
                      }}
                    >
                      <Text style={styles.editAddressLink}>Edit Address</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Items Summary in Modal */}
              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Feather name="shopping-bag" size={16} color="#C5A880" />
                  <Text style={styles.modalSectionTitle}>Order Items ({selectedCount})</Text>
                </View>
                <View style={styles.modalItemsSummary}>
                  {selectedItems.map((item) => (
                    <View key={item.product.id} style={styles.modalItemRow}>
                      <Text style={styles.modalItemTitle} numberOfLines={1}>
                        {item.product.title} × {item.quantity}
                      </Text>
                      <Text style={styles.modalItemPrice}>
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Payment Methods */}
              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Feather name="credit-card" size={16} color="#C5A880" />
                  <Text style={styles.modalSectionTitle}>Payment Method</Text>
                </View>
                <View style={styles.paymentMethodsCol}>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      selectedPayment === 'upi' && styles.paymentOptionSelected
                    ]}
                    onPress={() => setSelectedPayment('upi')}
                  >
                    <MaterialCommunityIcons name="integrated-circuit-chip" size={20} color="#C5A880" />
                    <View style={styles.paymentOptionInfo}>
                      <Text style={styles.paymentOptionTitle}>UPI Instant Pay</Text>
                      <Text style={styles.paymentOptionSubtitle}>GPay, PhonePe, Paytm, BHIM</Text>
                    </View>
                    <View style={styles.radioCircle}>
                      {selectedPayment === 'upi' && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      selectedPayment === 'card' && styles.paymentOptionSelected
                    ]}
                    onPress={() => setSelectedPayment('card')}
                  >
                    <Feather name="credit-card" size={18} color="#C5A880" />
                    <View style={styles.paymentOptionInfo}>
                      <Text style={styles.paymentOptionTitle}>Credit / Debit Card</Text>
                      <Text style={styles.paymentOptionSubtitle}>Visa, MasterCard, RuPay, Amex</Text>
                    </View>
                    <View style={styles.radioCircle}>
                      {selectedPayment === 'card' && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      selectedPayment === 'cod' && styles.paymentOptionSelected
                    ]}
                    onPress={() => setSelectedPayment('cod')}
                  >
                    <Feather name="dollar-sign" size={18} color="#C5A880" />
                    <View style={styles.paymentOptionInfo}>
                      <Text style={styles.paymentOptionTitle}>Cash On Delivery</Text>
                      <Text style={styles.paymentOptionSubtitle}>Pay at doorstep upon delivery</Text>
                    </View>
                    <View style={styles.radioCircle}>
                      {selectedPayment === 'cod' && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom CTA */}
            <View style={styles.modalBottomBar}>
              <View>
                <Text style={styles.modalTotalLabel}>TOTAL AMOUNT</Text>
                <Text style={styles.modalTotalAmount}>₹{grandTotal.toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={[styles.confirmOrderBtn, orderPlaced && { backgroundColor: '#34C759' }]}
                activeOpacity={0.85}
                disabled={orderPlaced}
                onPress={handleConfirmOrder}
              >
                <Text style={styles.confirmOrderText}>
                  {orderPlaced ? 'Processing...' : 'Place Secure Order'}
                </Text>
                {!orderPlaced && <Feather name="lock" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Matching the luxury off-white canvas of HomeView
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 190, // Clears floating checkout bar and bottom tab bar
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#121212',
    letterSpacing: -0.3,
  },
  itemCountBadge: {
    backgroundColor: '#F4F5F6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
  },

  /* DELIVERY BAR */
  deliveryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
  },
  deliveryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 168, 128, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  deliveryAddress: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#121212',
    marginTop: 1,
  },
  changeAddressBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  changeAddressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C5A880',
  },

  /* FREE DELIVERY PROGRESS */
  thresholdBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
  },
  thresholdTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  truckIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thresholdText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C2C2E',
    flex: 1,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#F0F0F2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* BULK ACTIONS ROW */
  bulkActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  selectAllToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
  },
  bulkRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulkDeleteBtn: {
    padding: 6,
    borderRadius: 8,
  },

  /* CHECKBOX STYLING */
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11, // Smooth rounded luxury circle checkbox
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C5A880', // Gold accent
    borderColor: '#C5A880',
  },
  checkboxUnchecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D1D6',
  },

  /* CART ITEMS */
  itemsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnailContainer: {
    width: 76,
    height: 76,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  thumbnail: {
    width: '90%',
    height: '90%',
  },
  itemDetailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  itemCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2E7D32',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#121212',
    lineHeight: 18,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#121212',
  },
  mrpText: {
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F4F5F6',
    marginVertical: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  wishlistToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },

  /* STEPPER */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperQuantity: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
    minWidth: 26,
    textAlign: 'center',
  },

  /* COUPONS SECTION */
  couponSection: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  couponCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  couponIconPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(197, 168, 128, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121212',
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#121212',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  applyCouponBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponBtnDisabled: {
    backgroundColor: '#C8C8CC',
  },
  applyCouponText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  couponErrorText: {
    color: '#FF3B30',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  appliedCouponBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F9F3',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4EDDA',
  },
  appliedCouponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  appliedCodeName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B5E20',
  },
  appliedCodeDesc: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
    marginTop: 1,
  },
  removeCouponBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeCouponText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
  },
  couponChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  couponChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: 'rgba(197, 168, 128, 0.4)',
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  couponChipActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#34C759',
    borderStyle: 'solid',
  },
  couponChipTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#846337',
  },
  couponChipDesc: {
    fontSize: 10,
    color: '#636366',
    fontWeight: '600',
  },

  /* BILL SUMMARY */
  billSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F0F2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  billSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#121212',
    marginBottom: 14,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  billLabel: {
    fontSize: 13,
    color: '#636366',
    fontWeight: '500',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
  },
  billSavingsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34C759',
  },
  billFreeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34C759',
  },
  packagingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mrpSmallStrikethrough: {
    fontSize: 11,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#F0F0F2',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#121212',
  },
  totalAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#121212',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  savingsBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },

  /* TRUST BADGES */
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  trustBadgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustBadgeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#121212',
    marginTop: 6,
  },
  trustBadgeSubtitle: {
    fontSize: 9.5,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 1,
  },
  trustBadgeDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F0F0F2',
  },

  /* FLOATING CHECKOUT BAR */
  floatingCheckoutBar: {
    position: 'absolute',
    bottom: 94, // Docked directly above the bottom tab navigation bar from App.tsx
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  checkoutPriceCol: {
    justifyContent: 'center',
  },
  checkoutSubText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  checkoutFinalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#121212',
    marginTop: 1,
  },
  checkoutSavedNote: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34C759',
  },
  proceedCheckoutBtn: {
    backgroundColor: '#121212',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedCheckoutBtnDisabled: {
    backgroundColor: '#C8C8CC',
    shadowOpacity: 0,
  },
  proceedCheckoutText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },

  /* EMPTY STATE STYLES */
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F0F0F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 168, 128, 0.25)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#121212',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  exploreCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121212',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 16,
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreCtaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  emptyUpsellSection: {
    width: '100%',
    marginTop: 28,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#121212',
  },
  upsellGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  upsellCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  upsellImgWrapper: {
    width: '100%',
    height: 110,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  upsellImg: {
    width: '90%',
    height: '90%',
  },
  upsellTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121212',
    marginBottom: 6,
  },
  upsellPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upsellPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#121212',
  },
  quickAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F4F5F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* MODAL STYLING */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#121212',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressDisplayBox: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  addressDisplayRecipient: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
    marginBottom: 2,
  },
  addressDisplayText: {
    fontSize: 12.5,
    color: '#636366',
    lineHeight: 18,
    marginBottom: 8,
  },
  editAddressLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C5A880',
  },
  addressEditBox: {
    gap: 10,
  },
  addressInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 12,
    fontSize: 13,
    color: '#121212',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveAddressBtn: {
    backgroundColor: '#121212',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveAddressText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  modalItemsSummary: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemTitle: {
    fontSize: 12.5,
    color: '#2C2C2E',
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  modalItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
  },

  paymentMethodsCol: {
    gap: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
  },
  paymentOptionSelected: {
    borderColor: '#C5A880',
    backgroundColor: '#FAF7F2',
  },
  paymentOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
  },
  paymentOptionSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C5A880',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C5A880',
  },

  modalBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F2',
  },
  modalTotalLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  modalTotalAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#121212',
    marginTop: 1,
  },
  confirmOrderBtn: {
    backgroundColor: '#121212',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmOrderText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default CartView;
