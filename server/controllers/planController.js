const Plan = require('../models/Plan');
const User = require('../models/User');

exports.listPlans = async (req, res) => {
  res.json(await Plan.find().sort({ price: 1 }));
};

exports.subscribe = async (req, res) => {
  const { planId } = req.body;
  const plan = await Plan.findById(planId);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });

  const oldPlanId = req.user.selectedMembershipPlan?.toString();
  if (oldPlanId && oldPlanId !== planId) {
    await Plan.findByIdAndUpdate(oldPlanId, { $inc: { activeSubscribersCount: -1 } });
  }

  req.user.selectedMembershipPlan = plan._id;
  req.user.subscriptionStatus = 'active';
  await req.user.save();
  await Plan.findByIdAndUpdate(plan._id, { $inc: { activeSubscribersCount: oldPlanId === planId ? 0 : 1 } });
  res.json({ message: `Subscribed to ${plan.name}`, plan });
};

exports.cancel = async (req, res) => {
  if (req.user.selectedMembershipPlan) {
    await Plan.findByIdAndUpdate(req.user.selectedMembershipPlan, { $inc: { activeSubscribersCount: -1 } });
  }
  await User.findByIdAndUpdate(req.user._id, { selectedMembershipPlan: null, subscriptionStatus: 'cancelled' });
  res.json({ message: 'Subscription cancelled' });
};
