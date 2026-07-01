import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

// Mapping of category fallback images using high-quality premium Unsplash assets
const CATEGORY_FALLBACKS: { [key: string]: string } = {
  'Kitchen & Steel': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400',
  'Cello': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400',
  'Garden & Birds': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400',
  'Garden Essentials': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400',
  'Kondapalli Toys': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
  'Handicrafts & Gifts': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
  'Bottles & Jars': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
  'Bottles & Flasks': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
  'Wallpaper Rolls': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
  'Wallpaper': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
  'Rajasthan Decor': 'https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?auto=format&fit=crop&q=80&w=400',
  'Water Fountains': 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400',
  'Aquarium & Accessories': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=400',
  'Aquarium': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=400',
  'Premium Mats': 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=400',
};

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=400';

interface PremiumImageProps {
  uri: string;
  style: any;
  product?: {
    id: string;
    title: string;
    category?: string;
  };
  contentFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  simulateError?: boolean;
}

export const PremiumImage: React.FC<PremiumImageProps> = React.memo(({
  uri,
  style,
  product,
  contentFit = 'contain',
  simulateError = false
}) => {
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<{
    id: string;
    url: string;
    status: string;
    message: string;
  } | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Reset state if URI changes
  useEffect(() => {
    setCurrentLevel(simulateError ? 4 : 1);
    setLoading(true);
    if (simulateError) {
      setErrorDetails({
        id: product?.id || 'ERR_SIM',
        url: uri || 'N/A',
        status: 'HTTP 404 (Simulated)',
        message: 'Simulated image loading failure for audit validation.'
      });
      setShowDiagnostics(true);
    } else {
      setErrorDetails(null);
      setShowDiagnostics(false);
    }
  }, [uri, simulateError, product]);

  // Determine current URI based on fallback levels
  const getSourceUri = () => {
    if (simulateError) {
      return DEFAULT_PLACEHOLDER;
    }

    if (!uri) return '';

    // Decode the URI first to work with a clean, unencoded path
    let decoded = uri;
    try {
      decoded = decodeURIComponent(uri);
    } catch (e) {
      // fallback if decoding fails
    }

    // Normalize folder name double-space discrepancies (e.g. from old AsyncStorage cache)
    decoded = decoded.replace(/aquarium\s+and\s+accesories/gi, 'aquarium and accesories');

    // Re-encode cleanly
    const encodedPrimary = encodeURI(decoded);

    switch (currentLevel) {
      case 1:
        return encodedPrimary;
      case 2:
        // Level 2 - Product Thumbnail (if product object contains any secondary source, else skip to Category)
        return encodedPrimary;
      case 3:
        // Level 3 - Category Image fallback
        const cat = product?.category || '';
        return CATEGORY_FALLBACKS[cat] || DEFAULT_PLACEHOLDER;
      case 4:
      default:
        return DEFAULT_PLACEHOLDER;
    }
  };

  const currentUri = getSourceUri();

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (err: any) => {
    const errorMsg = err?.error || err?.nativeEvent?.error || 'Unknown image loading error';
    
    // Store error on primary failure
    if (currentLevel === 1) {
      let status = 'HTTP 404 / Failed';
      if (errorMsg.includes('Connection refused') || errorMsg.includes('Network')) {
        status = 'Network Error / Unreachable';
      }
      setErrorDetails({
        id: product?.id || 'Unknown',
        url: uri || 'N/A',
        status,
        message: errorMsg
      });
    }

    // Progress fallback level
    if (currentLevel < 4) {
      setCurrentLevel((prev) => (prev + 1) as any);
    } else {
      setLoading(false);
    }
  };

  // Determine if styling border radius is set
  const containerStyle = [
    styles.container,
    style,
    style?.borderRadius ? { borderRadius: style.borderRadius } : null
  ];

  return (
    <View style={containerStyle}>
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loaderContainer]}>
          <ActivityIndicator size="small" color="#C5A880" />
        </View>
      )}

      {currentUri ? (
        <Image
          source={{ uri: currentUri }}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          cachePolicy="disk"
          transition={200}
          onLoadStart={handleLoadStart}
          onLoad={handleLoadEnd}
          onError={handleError}
        />
      ) : null}

      {/* Audit Diagnostic Trigger & Glass Overlay */}
      {errorDetails && (
        <>
          <TouchableOpacity
            style={styles.diagTrigger}
            activeOpacity={0.8}
            onPress={() => setShowDiagnostics(!showDiagnostics)}
          >
            <Ionicons name="warning" size={16} color="#FF3B30" />
          </TouchableOpacity>

          {showDiagnostics && (
            <View style={StyleSheet.absoluteFill}>
              <View style={[StyleSheet.absoluteFill, styles.diagGlass]} />
              <View style={styles.diagContent}>
                <View style={styles.diagHeader}>
                  <Text style={styles.diagTitle}>Audit Diagnosis</Text>
                  <TouchableOpacity onPress={() => setShowDiagnostics(false)}>
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.diagLabel}>Product ID:</Text>
                <Text style={styles.diagVal} numberOfLines={1}>{errorDetails.id}</Text>
                
                <Text style={styles.diagLabel}>Image URL:</Text>
                <Text style={styles.diagVal} numberOfLines={2}>{errorDetails.url}</Text>

                <Text style={styles.diagLabel}>HTTP Status:</Text>
                <Text style={[styles.diagVal, { color: '#FF453A' }]}>{errorDetails.status}</Text>

                <Text style={styles.diagLabel}>Error Details:</Text>
                <Text style={styles.diagVal} numberOfLines={2}>{errorDetails.message}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 1,
  },
  diagTrigger: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  diagGlass: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 20,
  },
  diagContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 10,
    zIndex: 21,
    justifyContent: 'center',
  },
  diagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 2,
  },
  diagTitle: {
    color: '#FF453A',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diagLabel: {
    color: '#8E8E93',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 3,
  },
  diagVal: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
});
