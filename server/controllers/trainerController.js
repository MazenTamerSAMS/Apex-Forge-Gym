const Trainer = require('../models/Trainer');
const User = require('../models/User');

const defaultCheckPlans = {
  'Weight Loss': {
    title: 'Lean Reset Check Plan',
    summary: 'A machine-led plan for steady fat loss with simple protein-forward meals.',
    machines: [
      { machine: 'Curved Treadmill', exercise: 'Incline interval walk', sets: '8 rounds', reps: '45 sec fast / 75 sec easy', focus: 'Cardio base and calorie burn' },
      { machine: 'Cable Crossover Station', exercise: 'Cable squat to row', sets: '3 sets', reps: '12 reps', focus: 'Full-body strength circuit' },
      { machine: 'Assault Air Bike', exercise: 'Sprint finisher', sets: '6 rounds', reps: '20 sec sprint / 70 sec easy', focus: 'Conditioning' }
    ],
    foods: [
      { meal: 'Breakfast', items: ['Greek yogurt', 'berries', 'oats'], note: 'Start with protein and fiber.' },
      { meal: 'Lunch', items: ['Grilled chicken', 'brown rice', 'mixed greens'], note: 'Keep the plate balanced and filling.' },
      { meal: 'Dinner', items: ['Salmon', 'roasted vegetables', 'sweet potato'], note: 'Lean protein with slow carbs after training.' }
    ]
  },
  Bodybuilding: {
    title: 'Hypertrophy Builder Check Plan',
    summary: 'Progressive machine work and high-protein meals for muscle gain.',
    machines: [
      { machine: 'Competition Power Rack', exercise: 'Back squat or bench press', sets: '4 sets', reps: '6-8 reps', focus: 'Heavy compound strength' },
      { machine: 'Plate-Loaded Leg Press', exercise: 'Controlled leg press', sets: '4 sets', reps: '10-12 reps', focus: 'Quad and glute volume' },
      { machine: 'Cable Crossover Station', exercise: 'Cable fly and triceps pressdown', sets: '3 sets', reps: '12-15 reps', focus: 'Accessory hypertrophy' }
    ],
    foods: [
      { meal: 'Breakfast', items: ['Eggs', 'whole-grain toast', 'banana'], note: 'Protein plus training fuel.' },
      { meal: 'Lunch', items: ['Lean beef', 'rice', 'avocado'], note: 'Higher-calorie meal for growth.' },
      { meal: 'Snack', items: ['Whey shake', 'peanut butter', 'fruit'], note: 'Easy calories between meals.' }
    ]
  },
  CrossFit: {
    title: 'Engine and Strength Check Plan',
    summary: 'Functional machines, mixed intervals, and meals that support repeated effort.',
    machines: [
      { machine: 'Concept RowErg', exercise: 'Row intervals', sets: '5 rounds', reps: '500m row / 2 min rest', focus: 'Power endurance' },
      { machine: 'Sled Track', exercise: 'Heavy sled push', sets: '6 trips', reps: '20m each', focus: 'Leg drive and conditioning' },
      { machine: 'Battle Rope Bay', exercise: 'Alternating rope waves', sets: '4 sets', reps: '40 sec work', focus: 'Shoulders and core stamina' }
    ],
    foods: [
      { meal: 'Pre-workout', items: ['Banana', 'Greek yogurt'], note: 'Light carbs and protein 60-90 minutes before class.' },
      { meal: 'Post-workout', items: ['Turkey wrap', 'fruit', 'water'], note: 'Recover with carbs, protein, and hydration.' },
      { meal: 'Dinner', items: ['Chicken bowl', 'quinoa', 'vegetables'], note: 'Rebuild with a complete meal.' }
    ]
  },
  Nutrition: {
    title: 'Nutrition Reset Check Plan',
    summary: 'Low-impact movement paired with a practical meal structure.',
    machines: [
      { machine: 'Curved Treadmill', exercise: 'Zone 2 walk', sets: '1 session', reps: '25-35 min', focus: 'Sustainable daily movement' },
      { machine: 'Cable Crossover Station', exercise: 'Cable pull-through and row', sets: '3 sets', reps: '12 reps each', focus: 'Posterior chain and posture' },
      { machine: 'Recovery Compression Chair', exercise: 'Guided recovery block', sets: '1 session', reps: '10 min', focus: 'Recovery and consistency' }
    ],
    foods: [
      { meal: 'Breakfast', items: ['Omelet', 'spinach', 'whole-grain toast'], note: 'Anchor the day with protein.' },
      { meal: 'Lunch', items: ['Tuna or tofu salad', 'beans', 'olive oil dressing'], note: 'Protein, fiber, and healthy fats.' },
      { meal: 'Dinner', items: ['Chicken or lentils', 'vegetables', 'rice'], note: 'Simple portions that are easy to repeat.' }
    ]
  }
};

function normalizePlan(plan) {
  return {
    title: plan.title || 'Trainer Check Plan',
    summary: plan.summary || '',
    machines: (plan.machines || []).map((item) => ({
      machine: item.machine,
      exercise: item.exercise,
      sets: item.sets,
      reps: item.reps,
      focus: item.focus
    })),
    foods: (plan.foods || []).map((item) => ({
      meal: item.meal,
      items: item.items || [],
      note: item.note
    }))
  };
}

function trainerCheckPlan(trainer) {
  const storedPlan = trainer.checkPlan?.toObject ? trainer.checkPlan.toObject() : trainer.checkPlan;
  if (storedPlan?.title && ((storedPlan.machines || []).length || (storedPlan.foods || []).length)) {
    return normalizePlan(storedPlan);
  }
  return normalizePlan(defaultCheckPlans[trainer.specialty] || defaultCheckPlans.Bodybuilding);
}

exports.listTrainers = async (req, res) => {
  const filter = req.query.specialty ? { specialty: req.query.specialty } : {};
  const trainers = await Trainer.find(filter).sort({ rating: -1 });
  res.json(trainers.map((trainer) => ({
    ...trainer.toObject(),
    checkPlan: trainerCheckPlan(trainer)
  })));
};

exports.bookTrainer = async (req, res) => {
  const { trainerId, date, notes } = req.body;
  const trainer = await Trainer.findById(trainerId);
  if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
  const checkPlan = trainerCheckPlan(trainer);

  trainer.bookings.push({ user: req.user._id, date, notes });
  await trainer.save();

  req.user.trainerSubscriptions = (req.user.trainerSubscriptions || [])
    .filter((subscription) => subscription.trainer?.toString() !== trainer._id.toString());
  req.user.trainerSubscriptions.unshift({
    trainer: trainer._id,
    trainerName: trainer.name,
    specialty: trainer.specialty,
    date,
    notes,
    plan: checkPlan
  });
  await req.user.save();

  res.status(201).json({
    message: `Subscribed to ${trainer.name}. Your check plan is now in your profile.`,
    trainer,
    trainerPlan: checkPlan
  });
};

exports.favoriteTrainer = async (req, res) => {
  const { trainerId } = req.body;
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { favoriteTrainers: trainerId } });
  res.json({ message: 'Trainer saved to favorites' });
};
