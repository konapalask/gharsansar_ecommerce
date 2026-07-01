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
    Alert.alert('Checkout', `Checking out ${selectedCount} items for ₹${totalPrice}!`);
  };

  const handleShareCart = () => {
    Alert.alert('Share Cart', 'Cart share link copied to clipboard!');
  };

  return (
    <View style={styles.screen}>
      {/* Header Clear of Notch / Dynamic Island */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <Text style={styles.title}>Cart</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name="more-horizontal" size={22} color="#121212" />
        </TouchableOpacity>
      </View>

      {/* Delivery Bar */}
      <View style={styles.deliveryBar}>
        <View style={styles.deliveryLeft}>
          <View style={styles.pinDot} />
          <Text style={styles.deliveryText}>92 High Street, London</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#8E8E93" />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
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
                <Text style={styles.selectAllLabel}>Select all</Text>
              </TouchableOpacity>
              <View style={styles.actionIcons}>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleShareCart}>
                  <Feather name="share-2" size={18} color="#121212" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <Feather name="edit-3" size={18} color="#121212" />
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
                      {item.product.title}
                    </Text>
                    <View style={styles.itemBottomRow}>
                      <Text style={styles.itemPrice}>₹{item.product.price}</Text>
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
            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.8} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Checkout</Text>
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
    backgroundColor: '#F4F5F6',
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 110, // offsets checkout bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#121212',
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  deliveryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8E8E93',
  },
  deliveryText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontWeight: 'bold',
    color: '#8E8E93',
    fontSize: 14,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  selectAllWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CD964',
    borderColor: '#4CD964',
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
    borderColor: '#C4C4C6',
  },
  selectAllLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121212',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cartItemCard: {
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
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 60,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121212',
    lineHeight: 16,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#121212',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 8,
    gap: 8,
  },
  stepperBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  stepperBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#121212',
  },
  stepperVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#121212',
    minWidth: 12,
    textAlign: 'center',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  checkoutBtn: {
    backgroundColor: '#C0E800',
    borderRadius: 24,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#C0E800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 3,
  },
  checkoutText: {
    color: '#121212',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default CartView;
