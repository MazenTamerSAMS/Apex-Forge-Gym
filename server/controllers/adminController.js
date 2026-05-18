const User = require('../models/User');
const Plan = require('../models/Plan');
const Trainer = require('../models/Trainer');
const Supplement = require('../models/Supplement');
const Machine = require('../models/Machine');
const Order = require('../models/Order');

exports.stats = async (req, res) => {
  const [users, plans, trainers, supplements, machines, orders] = await Promise.all([
    User.countDocuments(),
    Plan.countDocuments(),
    Trainer.countDocuments(),
    Supplement.countDocuments(),
    Machine.countDocuments(),
    Order.countDocuments()
  ]);
  res.json({ users, plans, trainers, supplements, machines, orders });
};

exports.users = async (req, res) => res.json(await User.find().select('-password').populate('selectedMembershipPlan'));
exports.orders = async (req, res) => res.json(await Order.find().populate('user selectedPlan').sort({ createdAt: -1 }));

exports.createSupplement = async (req, res) => res.status(201).json(await Supplement.create(req.body));
exports.updateSupplement = async (req, res) => res.json(await Supplement.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteSupplement = async (req, res) => res.json(await Supplement.findByIdAndDelete(req.params.id));

exports.createTrainer = async (req, res) => res.status(201).json(await Trainer.create(req.body));
exports.updateTrainer = async (req, res) => res.json(await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteTrainer = async (req, res) => res.json(await Trainer.findByIdAndDelete(req.params.id));

exports.createMachine = async (req, res) => res.status(201).json(await Machine.create(req.body));
exports.updateMachine = async (req, res) => res.json(await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteMachine = async (req, res) => res.json(await Machine.findByIdAndDelete(req.params.id));

exports.createPlan = async (req, res) => res.status(201).json(await Plan.create(req.body));
exports.updatePlan = async (req, res) => res.json(await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deletePlan = async (req, res) => res.json(await Plan.findByIdAndDelete(req.params.id));
