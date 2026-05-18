const Supplement = require('../models/Supplement');
const User = require('../models/User');

exports.listSupplements = async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
  res.json(await Supplement.find(filter).sort({ category: 1, rating: -1 }));
};

exports.toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  const exists = user.wishlist.some((id) => id.toString() === productId);
  await User.findByIdAndUpdate(req.user._id, exists
    ? { $pull: { wishlist: productId } }
    : { $addToSet: { wishlist: productId } });
  res.json({ message: exists ? 'Removed from wishlist' : 'Added to wishlist' });
};
