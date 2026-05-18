const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Trainer = require('./models/Trainer');
const Supplement = require('./models/Supplement');
const Machine = require('./models/Machine');

dotenv.config();

const images = {
  hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  trainer1: 'https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=800&q=80',
  trainer2: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
  trainer3: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=800&q=80',
  trainer4: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
  product: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80',
  rack: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?auto=format&fit=crop&w=900&q=82',
  legPress: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=82',
  cable: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=82',
  hackSquat: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=82',
  airBike: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=82',
  treadmill: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=82',
  rower: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=82',
  sled: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=82',
  ropes: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?auto=format&fit=crop&w=900&q=82',
  recovery: 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?auto=format&fit=crop&w=900&q=82'
};

const trainerCheckPlans = {
  weightLoss: {
    title: 'Lean Reset Check Plan',
    summary: 'Machine-led conditioning with simple protein-forward meals.',
    machines: [
      { machine: 'Curved Treadmill', exercise: 'Incline interval walk', sets: '8 rounds', reps: '45 sec fast / 75 sec easy', focus: 'Cardio base' },
      { machine: 'Cable Crossover Station', exercise: 'Cable squat to row', sets: '3 sets', reps: '12 reps', focus: 'Full-body strength' },
      { machine: 'Assault Air Bike', exercise: 'Sprint finisher', sets: '6 rounds', reps: '20 sec sprint / 70 sec easy', focus: 'Conditioning' }
    ],
    foods: [
      { meal: 'Breakfast', items: ['Greek yogurt', 'berries', 'oats'], note: 'Protein and fiber first.' },
      { meal: 'Lunch', items: ['Grilled chicken', 'brown rice', 'mixed greens'], note: 'Balanced and filling.' },
      { meal: 'Dinner', items: ['Salmon', 'vegetables', 'sweet potato'], note: 'Lean protein after training.' }
    ]
  },
  bodybuilding: {
    title: 'Hypertrophy Builder Check Plan',
    summary: 'Progressive machine work and high-protein meals for muscle gain.',
    machines: [
      { machine: 'Competition Power Rack', exercise: 'Back squat or bench press', sets: '4 sets', reps: '6-8 reps', focus: 'Compound strength' },
      { machine: 'Plate-Loaded Leg Press', exercise: 'Controlled leg press', sets: '4 sets', reps: '10-12 reps', focus: 'Leg volume' },
      { machine: 'Cable Crossover Station', exercise: 'Cable fly and pressdown', sets: '3 sets', reps: '12-15 reps', focus: 'Accessory hypertrophy' }
    ],
    foods: [
      { meal: 'Breakfast', items: ['Eggs', 'whole-grain toast', 'banana'], note: 'Protein plus training fuel.' },
      { meal: 'Lunch', items: ['Lean beef', 'rice', 'avocado'], note: 'Growth-focused calories.' },
      { meal: 'Snack', items: ['Whey shake', 'peanut butter', 'fruit'], note: 'Easy calories between meals.' }
    ]
  },
  crossfit: {
    title: 'Engine and Strength Check Plan',
    summary: 'Functional machines, mixed intervals, and recovery meals.',
    machines: [
      { machine: 'Concept RowErg', exercise: 'Row intervals', sets: '5 rounds', reps: '500m row / 2 min rest', focus: 'Power endurance' },
      { machine: 'Sled Track', exercise: 'Heavy sled push', sets: '6 trips', reps: '20m each', focus: 'Leg drive' },
      { machine: 'Battle Rope Bay', exercise: 'Alternating rope waves', sets: '4 sets', reps: '40 sec work', focus: 'Shoulders and core' }
    ],
    foods: [
      { meal: 'Pre-workout', items: ['Banana', 'Greek yogurt'], note: 'Light fuel before class.' },
      { meal: 'Post-workout', items: ['Turkey wrap', 'fruit', 'water'], note: 'Recover carbs and protein.' },
      { meal: 'Dinner', items: ['Chicken bowl', 'quinoa', 'vegetables'], note: 'Complete meal for rebuild.' }
    ]
  },
  nutrition: {
    title: 'Nutrition Reset Check Plan',
    summary: 'Low-impact movement paired with a practical meal structure.',
    machines: [
      { machine: 'Curved Treadmill', exercise: 'Zone 2 walk', sets: '1 session', reps: '25-35 min', focus: 'Daily movement' },
      { machine: 'Cable Crossover Station', exercise: 'Cable pull-through and row', sets: '3 sets', reps: '12 reps each', focus: 'Posture and strength' },
      { machine: 'Recovery Compression Chair', exercise: 'Guided recovery block', sets: '1 session', reps: '10 min', focus: 'Recovery' }
    ],
    foods: [
      { meal: 'Breakfast', items: ['Omelet', 'spinach', 'whole-grain toast'], note: 'Protein anchor.' },
      { meal: 'Lunch', items: ['Tuna or tofu salad', 'beans', 'olive oil dressing'], note: 'Protein, fiber, fats.' },
      { meal: 'Dinner', items: ['Chicken or lentils', 'vegetables', 'rice'], note: 'Simple repeatable portions.' }
    ]
  }
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/apexforge_gym');
  await Promise.all([Plan.deleteMany(), Trainer.deleteMany(), Supplement.deleteMany(), Machine.deleteMany()]);

  await Plan.insertMany([
    { name: 'Basic', price: 29, duration: 'Monthly', features: ['Access to gym equipment', '1 group class/week', 'Limited support'] },
    { name: 'Standard', price: 59, duration: 'Monthly', features: ['Full gym access', '3 group classes/week', 'Basic nutrition plan', 'Email support'] },
    { name: 'Premium', price: 99, duration: 'Monthly', highlighted: true, features: ['Unlimited gym access', 'Personal trainer', 'Custom diet plan', 'Priority support', 'Access to VIP area'] }
  ]);

  await Trainer.insertMany([
    { name: 'Maya Stone', specialty: 'Weight Loss', experience: 8, rating: 4.9, availableSchedule: ['Mon 8:00', 'Wed 18:00', 'Sat 10:00'], imageUrl: images.trainer1, description: 'HIIT specialist focused on sustainable fat loss and confidence.', checkPlan: trainerCheckPlans.weightLoss },
    { name: 'Leo Grant', specialty: 'Bodybuilding', experience: 11, rating: 4.8, availableSchedule: ['Tue 9:00', 'Thu 17:00'], imageUrl: images.trainer2, description: 'Strength coach for hypertrophy, power, and competition prep.', checkPlan: trainerCheckPlans.bodybuilding },
    { name: 'Nora Vale', specialty: 'CrossFit', experience: 6, rating: 4.7, availableSchedule: ['Mon 19:00', 'Fri 7:00'], imageUrl: images.trainer3, description: 'Functional fitness coach blending mobility, speed, and conditioning.', checkPlan: trainerCheckPlans.crossfit },
    { name: 'Adam Cruz', specialty: 'Nutrition', experience: 9, rating: 4.9, availableSchedule: ['Wed 12:00', 'Sun 11:00'], imageUrl: images.trainer4, description: 'Sports nutrition coach creating realistic meal systems.', checkPlan: trainerCheckPlans.nutrition }
  ]);

  await Supplement.insertMany([
    { name: 'Forge Whey Isolate', category: 'Protein', price: 54, rating: 4.9, stockQuantity: 42, productImage: images.product, description: 'Fast-digesting whey isolate with 25g protein per scoop.' },
    { name: 'Plant Power Protein', category: 'Protein', price: 48, rating: 4.6, stockQuantity: 31, productImage: images.product, description: 'Vegan protein blend with smooth cocoa flavor.' },
    { name: 'Creatine Monohydrate', category: 'Creatine', price: 28, rating: 4.8, stockQuantity: 65, productImage: images.product, description: 'Micronized creatine for strength, power, and recovery.' },
    { name: 'Neon Rush Pre', category: 'Pre-workout', price: 39, rating: 4.7, stockQuantity: 24, productImage: images.product, description: 'High-energy pre-workout with focus support.' },
    { name: 'Hydro Pump Pre', category: 'Pre-workout', price: 44, rating: 4.8, stockQuantity: 19, productImage: images.product, description: 'Pump-focused formula with citrulline and electrolytes.' }
  ]);

  await Machine.insertMany([
    { name: 'Competition Power Rack', category: 'Strength', muscleGroup: 'Full Body', quantity: 6, imageUrl: images.rack, description: 'Heavy-duty racks for squats, bench, overhead work, and pull-ups.', specs: ['Calibrated plates', 'Safety arms', 'Band pegs'] },
    { name: 'Plate-Loaded Leg Press', category: 'Strength', muscleGroup: 'Quads, Glutes', quantity: 3, imageUrl: images.legPress, description: 'Angled leg press stations built for controlled heavy lower-body work.', specs: ['Wide foot platform', 'Smooth sled track', 'High load capacity'] },
    { name: 'Cable Crossover Station', category: 'Strength', muscleGroup: 'Chest, Back, Arms', quantity: 4, imageUrl: images.cable, description: 'Dual adjustable pulleys for isolation work, rows, presses, and rehab patterns.', specs: ['Adjustable pulleys', 'Multiple handles', 'Dual stacks'] },
    { name: 'Hack Squat Machine', category: 'Strength', muscleGroup: 'Quads, Glutes', quantity: 2, imageUrl: images.hackSquat, description: 'Guided squat path for high-output leg training with stable mechanics.', specs: ['Shoulder pads', 'Deep range track', 'Safety stops'] },
    { name: 'Assault Air Bike', category: 'Cardio', muscleGroup: 'Conditioning', quantity: 8, imageUrl: images.airBike, description: 'Fan-resistance bikes for intervals, finishers, and conditioning tests.', specs: ['Fan resistance', 'Interval console', 'Full-body drive'] },
    { name: 'Curved Treadmill', category: 'Cardio', muscleGroup: 'Running, HIIT', quantity: 5, imageUrl: images.treadmill, description: 'Self-powered treadmills for sprint mechanics and low-friction conditioning.', specs: ['Manual belt', 'Sprint friendly', 'No speed cap'] },
    { name: 'Concept RowErg', category: 'Cardio', muscleGroup: 'Back, Legs, Conditioning', quantity: 6, imageUrl: images.rower, description: 'Performance rowing machines for aerobic base work and interval blocks.', specs: ['PM monitor', 'Damper control', 'Low-impact pull'] },
    { name: 'Sled Track', category: 'Functional', muscleGroup: 'Legs, Core, Conditioning', quantity: 2, imageUrl: images.sled, description: 'Turf lanes for sled pushes, pulls, carries, and loaded movement work.', specs: ['25m turf lanes', 'Push sleds', 'Harness pulls'] },
    { name: 'Battle Rope Bay', category: 'Functional', muscleGroup: 'Shoulders, Core', quantity: 4, imageUrl: images.ropes, description: 'Dedicated rope stations for power endurance and metabolic conditioning.', specs: ['Anchored ropes', 'Rubber flooring', 'Timed intervals'] },
    { name: 'Recovery Compression Chair', category: 'Recovery', muscleGroup: 'Recovery', quantity: 3, imageUrl: images.recovery, description: 'Post-session compression stations for legs, circulation, and recovery.', specs: ['Leg compression', 'Adjustable pressure', 'Quiet lounge area'] }
  ]);

  const adminEmail = 'admin@apexforge.test';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({ fullName: 'ApexForge Admin', email: adminEmail, password: 'Admin123!', role: 'admin', age: 30, gender: 'other' });
  }

  console.log('Seed data created');
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
