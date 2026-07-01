import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MobileAppProvider, useMobileApp } from './src/context/MobileAppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeView from './src/pages/HomeView';
import ExploreView from './src/pages/ExploreView';
import CartView from './src/pages/CartView';
import FavoritesView from './src/pages/FavoritesView';
import ProfileView from './src/pages/ProfileView';
import ProductDetailView from './src/pages/ProductDetailView';

// ----------------------------------------------------------------------
// PREMIUM STARTUP SPLASH SCREEN COMPONENT (Exactly 1.5 Seconds)
// ----------------------------------------------------------------------
const PremiumSplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo and branding fade-in & scale animation (600ms)
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.04, friction: 6, tension: 40, useNativeDriver: true })
    ]).start();

    // 2. Start container background fade out at 1100ms (duration 400ms)
    const fadeOutTimeout = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      }).start(() => {
        onFinish();
      });
    }, 1100);

    return () => clearTimeout(fadeOutTimeout);
  }, []);

  return (
    <Animated.View style={[styles.splashContainer, { opacity: containerOpacity }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim, alignItems: 'center' }}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.splashLogo}
          contentFit="contain"
        />
        <Text style={styles.splashBrandName}>GHAR SANSAR</Text>
        <Text style={styles.splashTagline}>Luxury Home & Kitchen Store</Text>
      </Animated.View>
    </Animated.View>
  );
};

// ----------------------------------------------------------------------
// ANIMATED TAB BUTTON COMPONENT (Airbnb + Swiggy style with Haptics)
// ----------------------------------------------------------------------
const TabButton: React.FC<{
  tab: any;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.15 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const labelScale = useRef(new Animated.Value(isActive ? 1 : 0.8)).current;
  const pillScaleX = useRef(new Animated.Value(isActive ? 1 : 0.3)).current;
  const pillOpacity = useRef(new Animated.Value(isActive ? 0.12 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.16 : 1.0,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1.0 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(labelScale, {
        toValue: isActive ? 1.0 : 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(pillScaleX, {
        toValue: isActive ? 1.0 : 0.3,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacity, {
        toValue: isActive ? 0.12 : 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [isActive]);

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.tabButton}
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.iconWrapper,
        {
          transform: [
            { scale: scaleAnim }
          ]
        }
      ]}>
        <Animated.View style={[
          styles.activeIndicatorBg,
          {
            opacity: pillOpacity,
            transform: [
              { scaleX: pillScaleX },
              { scaleY: pillScaleX }
            ]
          }
        ]} />
        <Feather
          name={tab.icon}
          size={isActive ? 21 : 19}
          color={isActive ? '#C5A880' : '#7E7E82'}
        />
        {tab.badge && tab.badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tab.badge}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Animated.Text style={[
        styles.label,
        {
          fontWeight: isActive ? '700' : '500',
          color: isActive ? '#C5A880' : '#7E7E82',
          opacity: opacityAnim,
          transform: [{ scale: labelScale }]
        }
      ]}>
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

// ----------------------------------------------------------------------
// MAIN APP CONTENT CONTAINER
// ----------------------------------------------------------------------
const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, cart, selectedProductId, setSelectedProductId } = useMobileApp();
  const [isSplashing, setIsSplashing] = useState(true);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderActiveScreen = () => {
    if (selectedProductId) {
      return <ProductDetailView />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'explore':
        return <ExploreView />;
      case 'cart':
        return <CartView />;
      case 'wishlist':
        return <FavoritesView />;
      case 'account':
        return <ProfileView />;
      default:
        return <HomeView />;
    }
  };

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: 'home' as const },
    { id: 'explore' as const, label: 'Explore', icon: 'compass' as const },
    { id: 'cart' as const, label: 'Cart', icon: 'shopping-bag' as const, badge: cartCount },
    { id: 'wishlist' as const, label: 'Wishlist', icon: 'heart' as const },
    { id: 'account' as const, label: 'Account', icon: 'user' as const },
  ];

  const handleTabClick = (tabId: typeof activeTab) => {
    setSelectedProductId(null); // Pop details screen
    setActiveTab(tabId);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Active Screen */}
      <View style={styles.screenWrapper}>
        {renderActiveScreen()}
      </View>
  
      {/* Floating Bottom Glassmorphic Navigation Bar */}
      {!selectedProductId && !isSplashing && (
        <BlurView intensity={80} tint="light" style={styles.navBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={isActive}
                onPress={() => handleTabClick(tab.id)}
              />
            );
          })}
        </BlurView>
      )}

      {isSplashing && (
        <PremiumSplashScreen onFinish={() => setIsSplashing(false)} />
      )}
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <MobileAppProvider>
        <AppContent />
      </MobileAppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  screenWrapper: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  splashLogo: {
    width: 110,
    height: 110,
    borderRadius: 24,
  },
  splashBrandName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: 1.8,
    marginTop: 20,
  },
  splashTagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C5A880',
    letterSpacing: 1.0,
    marginTop: 8,
  },
  navBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 66,
    backgroundColor: 'rgba(255, 255, 255, 0.76)', // Glassmorphism backdrop
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 999,
    overflow: 'hidden', // Crops the BlurView correctly

    // Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    paddingTop: 4,
  },
  iconWrapper: {
    position: 'relative',
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicatorBg: {
    position: 'absolute',
    width: 38,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#C5A880',
    zIndex: -1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  label: {
    fontSize: 9.5,
    letterSpacing: -0.1,
    marginTop: 2,
  },
});
