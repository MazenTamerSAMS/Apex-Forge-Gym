const Machine = require('../models/Machine');

exports.listMachines = async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { muscleGroup: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  res.json(await Machine.find(filter).sort({ category: 1, name: 1 }));
};
