const Cart = require('../models/Cart');
const Supplement = require('../models/Supplement');

async function recalc(cart) {
  await cart.populate('products.product');
  cart.totalPrice = cart.products.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  await cart.save();
  return cart.populate('products.product');
}

exports.getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
  if (!cart) cart = await Cart.create({ user: req.user._id, products: [] });
  res.json(cart);
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Supplement.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, products: [] });

  const item = cart.products.find((entry) => entry.product.toString() === productId);
  if (item) item.quantity += Number(quantity);
  else cart.products.push({ product: productId, quantity });
  res.status(201).json(await recalc(cart));
};

exports.updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  const item = cart.products.find((entry) => entry.product.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Cart item not found' });
  item.quantity = Math.max(1, Number(quantity));
  res.json(await recalc(cart));
};

exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.products = cart.products.filter((entry) => entry.product.toString() !== req.params.id);
  res.json(await recalc(cart));
};
