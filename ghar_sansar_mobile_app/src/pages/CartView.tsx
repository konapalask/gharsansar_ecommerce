import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMobileApp } from '../context/MobileAppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumImage } from '../components/PremiumImage';

const CartView: React.FC = () => {
  const { cart, updateCartQuantity, toggleCartSelection, toggleAllCartSelections } = useMobileApp();
  const insets = useSafeAreaInsets();

  const allSelected = cart.length > 0 && cart.every((item) => item.selected);
  const selectedCount = cart.filter((item) => item.selected).length;

  const handleSelectAllToggle = () => {
    toggleAllCartSelections(!allSelected);
  };

  const totalPrice = cart
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (selectedCount === 0) {
      Alert.alert('Error', 'Please select at least one item to checkout.');
      return;
    }
    Alert.alert('Checkout', `Processing secure checkout for ${selectedCount} items. Total: ₹${totalPrice.toLocaleString()}`);
  };

  const handleShareCart = () => {
    Alert.alert('Share Cart', 'Cart share link copied to clipboard!');
  };

  return (
    <View style={styles.screen}>
      {/* Header Clear of Notch / Dynamic Island */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <Text style={styles.title}>S H O P P I N G  B A G</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name="more-vertical" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Delivery Bar */}
      <View style={styles.deliveryBar}>
        <View style={styles.deliveryLeft}>
          <View style={styles.pinDot} />
          <Text style={styles.deliveryText}>DELIVER TO: 92 HIGH STREET, LONDON</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#8E8E93" />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Feather name="shopping-bag" size={48} color="#2A2A2A" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>YOUR BAG IS EMPTY</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Scrollable list container */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {/* Bulk Selection Actions Bar */}
            <View style={styles.actionsBar}>
              <TouchableOpacity
                style={styles.selectAllWrapper}
                activeOpacity={0.7}
                onPress={handleSelectAllToggle}
              >
                <View style={[
                  styles.checkbox,
                  allSelected ? styles.checkboxChecked : styles.checkboxUnchecked
                ]}>
                  {allSelected && <Feather name="check" size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.selectAllLabel}>SELECT ALL</Text>
              </TouchableOpacity>
              <View style={styles.actionIcons}>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleShareCart}>
                  <Feather name="share-2" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <Feather name="edit-3" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Cart List */}
            <View style={styles.itemsList}>
              {cart.map((item) => (
                <View key={item.product.id} style={styles.cartItemCard}>
                  {/* Custom Checkbox */}
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.selected ? styles.checkboxChecked : styles.checkboxUnchecked
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleCartSelection(item.product.id)}
                  >
                    {item.selected && <Feather name="check" size={12} color="#FFFFFF" />}
                  </TouchableOpacity>

                  {/* Product Thumbnail */}
                  <View style={styles.thumbnailContainer}>
                    <PremiumImage uri={item.product.image} style={styles.thumbnail} product={item.product} contentFit="contain" />
                  </View>

                  {/* Product details info & quantity adjustments */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {item.product.title.toUpperCase()}
                    </Text>
                    <View style={styles.itemBottomRow}>
                      <Text style={styles.itemPrice}>₹{item.product.price.toLocaleString()}</Text>
                      {/* Stepper controls */}
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateCartQuantity(item.product.id, -1)}
                        >
                          <Text style={styles.stepperBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepperVal}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateCartQuantity(item.product.id, 1)}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Checkout Footer Bar */}
          <View style={styles.checkoutBar}>
            <View style={styles.checkoutDetails}>
              <Text style={styles.checkoutSubLabel}>TOTAL EXCL. TAXES</Text>
              <Text style={styles.checkoutTotal}>₹{totalPrice.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.8} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>SECURE CHECKOUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505', // Deep Matte Black
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 130, // offsets checkout bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#050505',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  iconBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  deliveryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5001C', // Porsche Red accent
  },
  deliveryText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 1,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontWeight: '600',
    color: '#8E8E93',
    fontSize: 13,
    letterSpacing: 2,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  selectAllWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4, // Sharper corners for a structured look
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#D5001C', // Porsche Red
    borderColor: '#D5001C',
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
    borderColor: '#333333',
  },
  selectAllLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  cartItemCard: {
    backgroundColor: '#111111', // Titanium Carbon
    borderRadius: 12, // Subtle curves
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#050505',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222222',
  },
  thumbnail: {
    width: '90%',
    height: '90%',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 70,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E0E0',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  stepperBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  stepperBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepperVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 20,
    textAlign: 'center',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  checkoutDetails: {
    flex: 1,
  },
  checkoutSubLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  checkoutBtn: {
    backgroundColor: '#D5001C', // Premium Red
    borderRadius: 8, // Sharper structural shape
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D5001C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.5,
  },
});

export default CartView;
