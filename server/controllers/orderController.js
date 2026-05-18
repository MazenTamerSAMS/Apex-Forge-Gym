const Cart = require('../models/Cart');
const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
  const items = cart?.products || [];
  const purchasedProducts = items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity
  }));
  const total = purchasedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({
    user: req.user._id,
    userInfo: { fullName: req.user.fullName, email: req.user.email },
    purchasedProducts,
    selectedPlan: req.user.selectedMembershipPlan,
    paymentStatus: req.body.paymentStatus || 'pending',
    total
  });
  if (cart) {
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();
  }
  res.status(201).json(order);
};

exports.history = async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).populate('selectedPlan').sort({ createdAt: -1 }));
};
