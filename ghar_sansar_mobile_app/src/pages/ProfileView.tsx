import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMobileApp } from '../context/MobileAppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_ORDERS = [
  {
    id: 'GS-89240',
    date: '18 June 2026',
    status: 'In Transit',
    total: 2198,
    awb: '98765432101',
    items: 'Cello 12 Pcs Soup Set x1, Cello Stella Mug 2 Pcs x1'
  },
  {
    id: 'GS-88129',
    date: '10 June 2026',
    status: 'Delivered',
    total: 749,
    awb: '128539103940',
    items: 'Cello Breakfast Set 4 Pcs x1'
  }
];

const ProfileView: React.FC = () => {
  const { favorites } = useMobileApp();
  const insets = useSafeAreaInsets();
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [trackingAwb, setTrackingAwb] = useState<string | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any | null>(null);

  const handleActionClick = (actionName: string) => {
    if (actionName === 'My Orders') {
      setShowOrdersModal(true);
      return;
    }
    Alert.alert('Action', `Opening ${actionName}...`);
  };

  const handleTrackShipment = async (awb: string) => {
    setTrackingAwb(awb);
    setLoadingTracking(true);
    setTrackingInfo(null);
    try {
      const response = await fetch(`http://192.168.0.106:5001/api/shipping/track/${awb}`);
      if (!response.ok) throw new Error('Tracking failed');
      const data = await response.json();
      setTrackingInfo(data);
    } catch (error) {
      setTrackingInfo({
        status: 'In Transit',
        expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        checkpoints: [
          {
            status: 'In Transit',
            location: 'Gurgaon Hub',
            timestamp: new Date().toISOString(),
            description: 'Shipment has left Gurgaon Hub'
          },
          {
            status: 'Package Picked Up',
            location: 'Delhi Hub',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            description: 'Shipment picked up by Courier partner'
          },
          {
            status: 'Manifested',
            location: 'Ghar Sansar Warehouse',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            description: 'Shipping label created'
          }
        ]
      });
    } finally {
      setLoadingTracking(false);
    }
  };

  const menuItems = [
    { label: 'My Orders', icon: 'credit-card' as const, count: '3 active' },
    { label: 'Shipping Address', icon: 'map-pin' as const, detail: '92 High Street, London' },
    { label: 'Wishlist', icon: 'heart' as const, count: `${favorites.length} items` },
    { label: 'Notifications', icon: 'bell' as const, count: 'New alert' },
    { label: 'Vouchers & Offers', icon: 'gift' as const, detail: '50% cheaper delivery' },
    { label: 'Security & Privacy', icon: 'shield' as const },
    { label: 'App Settings', icon: 'settings' as const },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Clear of Notch / Dynamic Island */}
        <View style={[styles.profileHeader, { paddingTop: Math.max(insets.top, 12) + 16 }]}>
          <View style={styles.avatar}>
            <Feather name="user" size={32} color="#121212" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => handleActionClick('Coins')}>
            <Text style={styles.statValue}>1,250</Text>
            <Text style={styles.statLabel}>Ghar Coins</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => handleActionClick('Coupons')}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Active Coupons</Text>
          </TouchableOpacity>
        </View>

        {/* Menu list Options */}
        <View style={styles.menuList}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleActionClick(item.label)}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconCircle}>
                  <Feather name={item.icon} size={18} color="#121212" />
                </View>
                <View style={styles.menuItemLabels}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.detail && <Text style={styles.menuSubLabel} numberOfLines={1}>{item.detail}</Text>}
                </View>
              </View>
              <View style={styles.menuItemRight}>
                {item.count && (
                  <View style={styles.menuCountBadge}>
                    <Text style={styles.menuCountText}>{item.count}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={16} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            onPress={() => handleActionClick('Log Out')}
            style={styles.logoutBtn}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={16} color="#FF3B30" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* My Orders Modal */}
      <Modal
        visible={showOrdersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrdersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginTop: insets.top + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Orders</Text>
              <TouchableOpacity onPress={() => setShowOrdersModal(false)} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#121212" />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {MOCK_ORDERS.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeaderRow}>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  <Text style={styles.orderItems} numberOfLines={2}>{order.items}</Text>
                  <View style={styles.orderFooterRow}>
                    <Text style={styles.orderTotal}>Total: ₹{order.total}</Text>
                    <Text style={[
                      styles.orderStatus,
                      { color: order.status === 'Delivered' ? '#4CD964' : '#007AFF' }
                    ]}>{order.status}</Text>
                  </View>
                  <View style={styles.orderActions}>
                    <Text style={styles.awbText}>AWB: {order.awb}</Text>
                    <TouchableOpacity
                      style={styles.trackBtn}
                      activeOpacity={0.7}
                      onPress={() => handleTrackShipment(order.awb)}
                    >
                      <Feather name="truck" size={12} color="#121212" style={{ marginRight: 4 }} />
                      <Text style={styles.trackBtnText}>Track</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Express Shipment Tracking Modal */}
      <Modal
        visible={!!trackingAwb}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setTrackingAwb(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.trackingContent, { marginTop: insets.top + 60 }]}>
            <View style={styles.trackingHeader}>
              <View style={styles.trackingHeaderTitleRow}>
                <Feather name="truck" size={16} color="#C0E800" style={{ marginRight: 6 }} />
                <Text style={styles.trackingTitle}>Express Tracking</Text>
              </View>
              <TouchableOpacity onPress={() => setTrackingAwb(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.awbSummary}>
              <View>
                <Text style={styles.awbLabel}>AWB NUMBER</Text>
                <Text style={styles.awbVal}>{trackingAwb}</Text>
              </View>
              {trackingInfo && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.awbLabel}>STATUS</Text>
                  <Text style={styles.statusVal}>{trackingInfo.status}</Text>
                </View>
              )}
            </View>

            <View style={styles.trackingBody}>
              {loadingTracking ? (
                <View style={styles.loadingTrack}>
                  <ActivityIndicator size="large" color="#121212" />
                  <Text style={styles.loadingTrackText}>Connecting to Shipping Server...</Text>
                </View>
              ) : trackingInfo ? (
                <ScrollView contentContainerStyle={styles.timelineScroll}>
                  {trackingInfo.expectedDate && (
                    <View style={styles.expectedCard}>
                      <Feather name="clock" size={14} color="#007AFF" style={{ marginRight: 6 }} />
                      <Text style={styles.expectedText}>
                        Expected Delivery: {new Date(trackingInfo.expectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  )}

                  <View style={styles.timeline}>
                    {trackingInfo.checkpoints.map((cp: any, idx: number) => {
                      const isLatest = idx === 0;
                      return (
                        <View key={idx} style={styles.timelineNode}>
                          <View style={styles.timelineLineWrapper}>
                            <View style={[
                              styles.timelineDot,
                              isLatest ? styles.timelineDotActive : styles.timelineDotInactive
                            ]} />
                            {idx < trackingInfo.checkpoints.length - 1 && (
                              <View style={styles.timelineLine} />
                            )}
                          </View>
                          <View style={styles.timelineInfo}>
                            <View style={styles.timelineTitleRow}>
                              <Text style={[
                                  styles.timelineStatus,
                                  isLatest ? styles.timelineStatusActive : styles.timelineStatusInactive
                                ]}>
                                {cp.status}
                              </Text>
                              <Text style={styles.timelineLoc}>{cp.location}</Text>
                            </View>
                            <Text style={styles.timelineDesc}>{cp.description}</Text>
                            <Text style={styles.timelineTime}>
                              {new Date(cp.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              ) : null}
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
    backgroundColor: '#F4F5F6',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#C0E800',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C0E800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  profileInfo: {
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#121212',
  },
  profileEmail: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#121212',
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  menuList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F5F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabels: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
  },
  menuSubLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuCountBadge: {
    backgroundColor: '#121212',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuCountText: {
    fontSize: 11,
    color: '#C0E800',
    fontWeight: '700',
  },
  logoutSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutIcon: {
    marginRight: 2,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#121212',
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#F4F5F6',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#121212',
  },
  orderDate: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  orderItems: {
    fontSize: 12,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    paddingTop: 10,
  },
  orderTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  awbText: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: '700',
    color: '#007AFF',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C0E800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trackBtnText: {
    fontSize: 11,
    color: '#121212',
    fontWeight: '800',
  },
  trackingContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    maxHeight: '75%',
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#121212',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  trackingHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  awbSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  awbLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  awbVal: {
    fontSize: 13,
    fontFamily: 'Courier',
    fontWeight: '700',
    color: '#121212',
  },
  statusVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  trackingBody: {
    flex: 1,
  },
  loadingTrack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingTrackText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  timelineScroll: {
    padding: 24,
  },
  expectedCard: {
    backgroundColor: '#E8F5FF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  expectedText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '700',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineNode: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineLineWrapper: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  timelineDotActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  timelineDotInactive: {
    borderColor: '#C4C4C6',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E6E6E6',
    minHeight: 48,
  },
  timelineInfo: {
    flex: 1,
    paddingBottom: 24,
    gap: 4,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  timelineStatus: {
    fontSize: 13,
    fontWeight: '800',
  },
  timelineStatusActive: {
    color: '#007AFF',
  },
  timelineStatusInactive: {
    color: '#4A4A4A',
  },
  timelineLoc: {
    fontSize: 10,
    backgroundColor: '#F4F5F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#4A4A4A',
    fontWeight: '700',
  },
  timelineDesc: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: 10,
    color: '#C4C4C6',
    fontWeight: '600',
  },
});

export default ProfileView;
