const API = '/api';
const state = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null')
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : null;
  if (!res.ok) throw new Error(data.message || 'Request failed');
  if (data === null) throw new Error('API returned a non-JSON response');
  return data;
}

function toast(message) {
  const node = document.createElement('div');
  node.className = 'card';
  node.style.cssText = 'position:fixed;left:50%;bottom:24px;z-index:100;transform:translateX(-50%);padding:14px 18px;';
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function setSession(payload) {
  state.token = payload.token;
  state.user = payload.user;
  localStorage.setItem('token', payload.token);
  localStorage.setItem('user', JSON.stringify(payload.user));
  updateNav();
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  state.token = null;
  state.user = null;
  updateNav();
  toast('Logged out');
}

function updateNav() {
  const authLink = $('#authLink');
  const userPill = $('#userPill');
  if (!authLink || !userPill) return;
  if (state.user) {
    authLink.textContent = 'Profile';
    authLink.href = '/profile.html';
    userPill.innerHTML = `<button class="btn small ghost" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>`;
    $('#logoutBtn')?.addEventListener('click', logout);
  } else {
    authLink.textContent = 'Login';
    authLink.href = '/auth.html';
    userPill.innerHTML = '';
  }
}

function getPasswordStrength(password = '') {
  const feedback = [];
  const lower = password.toLowerCase();
  const common = ['password', 'qwerty', 'admin', 'welcome', 'letmein', '123456', '111111'];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('use at least 8 characters');

  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else feedback.push('mix uppercase and lowercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('add a number');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('add a symbol');

  if (common.some((part) => lower.includes(part))) {
    score = Math.max(0, score - 2);
    feedback.push('avoid common words or patterns');
  }

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('avoid repeated characters');
  }

  const level = score >= 5 ? 'strong' : score >= 3 ? 'medium' : 'weak';
  const percent = Math.min(100, Math.max(12, score * 20));
  const label = password
    ? `${level[0].toUpperCase()}${level.slice(1)} password${feedback.length ? `: ${feedback.slice(0, 2).join(', ')}` : ''}`
    : 'Password strength will appear here';

  return { level, percent, label };
}

function initPasswordControls() {
  $$('input[type="password"]').forEach((input) => {
    if (input.closest('.password-field')) return;

    const field = document.createElement('div');
    field.className = 'password-field';
    input.parentNode.insertBefore(field, input);
    field.appendChild(input);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'password-toggle';
    toggle.setAttribute('aria-label', 'Show password');
    toggle.innerHTML = '<i class="fa-regular fa-eye"></i>';
    field.appendChild(toggle);

    toggle.addEventListener('click', () => {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      toggle.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
      toggle.innerHTML = visible ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    });

    if (!input.closest('#registerForm') && !input.closest('#resetPasswordForm')) return;

    const meter = document.createElement('div');
    meter.className = 'password-strength';
    meter.innerHTML = `
      <div class="password-strength-track"><div class="password-strength-fill"></div></div>
      <div class="password-strength-text">Password strength will appear here</div>`;
    field.insertAdjacentElement('afterend', meter);

    const fill = $('.password-strength-fill', meter);
    const text = $('.password-strength-text', meter);
    const update = () => {
      const strength = getPasswordStrength(input.value);
      fill.className = `password-strength-fill ${input.value ? strength.level : ''}`;
      text.className = `password-strength-text ${input.value ? strength.level : ''}`;
      fill.style.width = input.value ? `${strength.percent}%` : '0';
      text.textContent = strength.label;
      input.dataset.strength = input.value ? strength.level : '';
    };
    input.addEventListener('input', update);
    update();
  });
}

function initCommon() {
  setTimeout(() => $('.loader')?.classList.add('hide'), 450);
  updateNav();
  initPasswordControls();
  $('.menu-btn')?.addEventListener('click', () => $('.nav-links')?.classList.toggle('open'));
  $('#themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
  if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');
  const top = $('.to-top');
  window.addEventListener('scroll', () => top?.classList.toggle('show', scrollY > 500));
  top?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible'));
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el) => observer.observe(el));

  $$('.counter').forEach((el) => {
    const target = Number(el.dataset.target || 0);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const tick = () => {
      current = Math.min(target, current + step);
      el.textContent = current.toLocaleString();
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
  });

  $('#newsletterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const email = new FormData(e.target).get('email');
      const data = await api('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
      toast(data.message);
      e.target.reset();
    } catch (error) { toast(error.message); }
  });
}

function renderStars(rating) {
  return `<span class="rating"><i class="fa-solid fa-star"></i> ${Number(rating).toFixed(1)}</span>`;
}

function renderTrainerPlanPreview(plan) {
  const machines = plan?.machines || [];
  const foods = plan?.foods || [];
  return `
    <div class="trainer-plan-preview">
      <span class="badge">Trainer Check Plan</span>
      <h4>${plan?.title || 'Personal Check Plan'}</h4>
      <p>${plan?.summary || 'Your trainer will prepare machines to use and foods to eat for your next block.'}</p>
      <div class="mini-plan-grid">
        <div>
          <strong><i class="fa-solid fa-dumbbell"></i> Machines</strong>
          <ul class="list compact-list">${machines.slice(0, 3).map((item) => `<li><i class="fa-solid fa-check"></i><span>${item.machine} - ${item.exercise}</span></li>`).join('')}</ul>
        </div>
        <div>
          <strong><i class="fa-solid fa-bowl-food"></i> Food</strong>
          <ul class="list compact-list">${foods.slice(0, 3).map((item) => `<li><i class="fa-solid fa-check"></i><span>${item.meal}: ${(item.items || []).join(', ')}</span></li>`).join('')}</ul>
        </div>
      </div>
    </div>`;
}

function renderSavedTrainerPlans(subscriptions = []) {
  if (!subscriptions.length) {
    return '<p class="muted">Subscribe to a trainer to receive a machine and food check plan here.</p>';
  }

  return subscriptions.map((subscription) => {
    const plan = subscription.plan || {};
    const machines = plan.machines || [];
    const foods = plan.foods || [];
    return `
      <article class="saved-plan">
        <div class="saved-plan-head">
          <div>
            <span class="badge">${subscription.specialty || 'Trainer'}</span>
            <h4>${plan.title || 'Trainer Check Plan'}</h4>
            <p>${subscription.trainerName || subscription.trainer?.name || 'Your trainer'}${subscription.date ? ` - ${subscription.date}` : ''}</p>
          </div>
          <span class="badge">${subscription.status || 'active'}</span>
        </div>
        <p>${plan.summary || 'Machine work and food guidance from your trainer.'}</p>
        <div class="mini-plan-grid">
          <div>
            <strong><i class="fa-solid fa-dumbbell"></i> Machines to exercise</strong>
            <ul class="list compact-list">${machines.map((item) => `
              <li><i class="fa-solid fa-check"></i><span><b>${item.machine || 'Machine'}</b> - ${item.exercise || 'Exercise'}${item.sets || item.reps ? `<small>${[item.sets, item.reps].filter(Boolean).join(' - ')}</small>` : ''}</span></li>`).join('')}</ul>
          </div>
          <div>
            <strong><i class="fa-solid fa-utensils"></i> Food to eat</strong>
            <ul class="list compact-list">${foods.map((item) => `
              <li><i class="fa-solid fa-check"></i><span><b>${item.meal || 'Meal'}</b> - ${(item.items || []).join(', ')}${item.note ? `<small>${item.note}</small>` : ''}</span></li>`).join('')}</ul>
          </div>
        </div>
      </article>`;
  }).join('');
}

const fallbackMachines = [
  {
    name: 'Competition Power Rack',
    category: 'Strength',
    muscleGroup: 'Full Body',
    quantity: 6,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?auto=format&fit=crop&w=900&q=82',
    description: 'Heavy-duty racks for squats, bench, overhead work, and pull-ups.',
    specs: ['Calibrated plates', 'Safety arms', 'Band pegs']
  },
  {
    name: 'Plate-Loaded Leg Press',
    category: 'Strength',
    muscleGroup: 'Quads, Glutes',
    quantity: 3,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=82',
    description: 'Angled leg press stations built for controlled heavy lower-body work.',
    specs: ['Wide platform', 'Smooth sled track', 'High load capacity']
  },
  {
    name: 'Cable Crossover Station',
    category: 'Strength',
    muscleGroup: 'Chest, Back, Arms',
    quantity: 4,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=82',
    description: 'Dual adjustable pulleys for isolation work, rows, presses, and rehab patterns.',
    specs: ['Adjustable pulleys', 'Multiple handles', 'Dual stacks']
  },
  {
    name: 'Hack Squat Machine',
    category: 'Strength',
    muscleGroup: 'Quads, Glutes',
    quantity: 2,
    status: 'Limited',
    imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=82',
    description: 'Guided squat path for high-output leg training with stable mechanics.',
    specs: ['Shoulder pads', 'Deep range track', 'Safety stops']
  },
  {
    name: 'Assault Air Bike',
    category: 'Cardio',
    muscleGroup: 'Conditioning',
    quantity: 8,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=82',
    description: 'Fan-resistance bikes for intervals, finishers, and conditioning tests.',
    specs: ['Fan resistance', 'Interval console', 'Full-body drive']
  },
  {
    name: 'Curved Treadmill',
    category: 'Cardio',
    muscleGroup: 'Running, HIIT',
    quantity: 5,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=82',
    description: 'Self-powered treadmills for sprint mechanics and low-friction conditioning.',
    specs: ['Manual belt', 'Sprint friendly', 'No speed cap']
  },
  {
    name: 'Concept RowErg',
    category: 'Cardio',
    muscleGroup: 'Back, Legs, Conditioning',
    quantity: 6,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=82',
    description: 'Performance rowing machines for aerobic base work and interval blocks.',
    specs: ['PM monitor', 'Damper control', 'Low-impact pull']
  },
  {
    name: 'Sled Track',
    category: 'Functional',
    muscleGroup: 'Legs, Core, Conditioning',
    quantity: 2,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=82',
    description: 'Turf lanes for sled pushes, pulls, carries, and loaded movement work.',
    specs: ['25m turf lanes', 'Push sleds', 'Harness pulls']
  },
  {
    name: 'Battle Rope Bay',
    category: 'Functional',
    muscleGroup: 'Shoulders, Core',
    quantity: 4,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?auto=format&fit=crop&w=900&q=82',
    description: 'Dedicated rope stations for power endurance and metabolic conditioning.',
    specs: ['Anchored ropes', 'Rubber flooring', 'Timed intervals']
  },
  {
    name: 'Recovery Compression Chair',
    category: 'Recovery',
    muscleGroup: 'Recovery',
    quantity: 3,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?auto=format&fit=crop&w=900&q=82',
    description: 'Post-session compression stations for legs, circulation, and recovery.',
    specs: ['Leg compression', 'Adjustable pressure', 'Quiet lounge area']
  }
];

function filterMachineCatalog(machines, search, category) {
  const term = search.trim().toLowerCase();
  return machines.filter((machine) => {
    const matchesCategory = !category || machine.category === category;
    const matchesSearch = !term || `${machine.name} ${machine.muscleGroup}`.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
}

async function initPlans() {
  const wrap = $('#plansGrid');
  if (!wrap) return;
  try {
    const plans = await api('/plans');
    wrap.innerHTML = plans.map((plan) => `
      <article class="card ${plan.highlighted ? 'highlight' : ''}">
        ${plan.highlighted ? '<span class="badge">Most Popular</span>' : ''}
        <h3>${plan.name}</h3>
        <div class="price">$${plan.price}<span>/${plan.duration.toLowerCase()}</span></div>
        <ul class="list">${plan.features.map((f) => `<li><i class="fa-solid fa-check"></i>${f}</li>`).join('')}</ul>
        <button class="btn choose-plan" data-id="${plan._id}"><i class="fa-solid fa-bolt"></i> Choose Plan</button>
      </article>`).join('');
    $$('.choose-plan').forEach((btn) => btn.addEventListener('click', async () => {
      if (!state.token) return location.href = '/auth.html';
      const data = await api('/plans/subscribe', { method: 'POST', body: JSON.stringify({ planId: btn.dataset.id }) });
      toast(data.message);
    }));
  } catch (error) {
    wrap.innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

function bmiAdvice(category) {
  const map = {
    Underweight: {
      exercise: 'Strength training 4 days/week, compound lifts, progressive overload.',
      foods: 'Lean proteins, rice, oats, nuts, olive oil, smoothies, Greek yogurt.',
      calories: 'Aim for a controlled surplus of 300-500 calories/day.',
      workout: 'Full-body strength split with recovery days.'
    },
    Normal: {
      exercise: 'Balanced strength training, mobility, and moderate cardio.',
      foods: 'Protein with every meal, colorful vegetables, complex carbs, healthy fats.',
      calories: 'Maintain around your daily energy needs.',
      workout: 'Upper/lower split plus 2 conditioning sessions.'
    },
    Overweight: {
      exercise: 'Cardio intervals, incline walking, strength circuits, core training.',
      foods: 'High-fiber vegetables, lean protein, legumes, lower-sugar meals.',
      calories: 'Use a sustainable 300-500 calorie deficit.',
      workout: '3 strength sessions and 3 cardio sessions per week.'
    },
    Obese: {
      exercise: 'Low-impact cardio, coached resistance training, daily walking.',
      foods: 'Protein-forward meals, vegetables, whole grains, calorie-aware portions.',
      calories: 'Start with a medically sensible deficit and track consistency.',
      workout: 'Low-impact plan with gradual intensity increases.'
    }
  };
  return map[category];
}

function initBMI() {
  const form = $('#bmiForm');
  if (!form) return;
  const result = $('#bmiResult');
  const calculate = async () => {
    const fd = new FormData(form);
    const height = Number(fd.get('height')) / 100;
    const weight = Number(fd.get('weight'));
    if (!height || !weight) return;
    const bmi = weight / (height * height);
    const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    const advice = bmiAdvice(category);
    const position = Math.max(0, Math.min(100, ((bmi - 12) / 28) * 100));
    result.innerHTML = `
      <span class="badge">${category}</span>
      <h3>Your BMI is ${bmi.toFixed(1)}</h3>
      <div class="bmi-meter"><div class="bmi-pointer" style="transform:translateX(calc(${position}% - 6px))"></div></div>
      <p><strong>Exercise:</strong> ${advice.exercise}</p>
      <p><strong>Foods:</strong> ${advice.foods}</p>
      <p><strong>Calories:</strong> ${advice.calories}</p>
      <p><strong>Workout:</strong> ${advice.workout}</p>`;
    if (state.token) {
      await api('/auth/bmi', {
        method: 'POST',
        body: JSON.stringify({ bmi: bmi.toFixed(1), category, height: Number(fd.get('height')), weight, age: fd.get('age'), gender: fd.get('gender') })
      }).catch(() => null);
    }
  };
  form.addEventListener('input', calculate);
  form.addEventListener('submit', (e) => { e.preventDefault(); calculate(); });
}

async function initSupplements() {
  const grid = $('#productsGrid');
  if (!grid) return;
  const render = async () => {
    const search = $('#productSearch').value;
    const category = $('#productFilter').value;
    const products = await api(`/supplements?search=${encodeURIComponent(search)}${category ? `&category=${encodeURIComponent(category)}` : ''}`);
    grid.innerHTML = products.map((p) => `
      <article class="card">
        <img class="product-img" src="${p.productImage}" alt="${p.name}">
        <span class="badge">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p>${renderStars(p.rating)} <strong style="float:right">$${p.price}</strong></p>
        <button class="btn add-cart" data-id="${p._id}"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
        <button class="btn ghost small wish" data-id="${p._id}"><i class="fa-regular fa-heart"></i></button>
      </article>`).join('');
    $$('.add-cart').forEach((btn) => btn.addEventListener('click', () => addCart(btn.dataset.id)));
    $$('.wish').forEach((btn) => btn.addEventListener('click', async () => {
      if (!state.token) return location.href = '/auth.html';
      const data = await api('/supplements/wishlist', { method: 'POST', body: JSON.stringify({ productId: btn.dataset.id }) });
      toast(data.message);
    }));
  };
  $('#productSearch').addEventListener('input', render);
  $('#productFilter').addEventListener('change', render);
  $$('.cart-open').forEach((btn) => btn.addEventListener('click', () => {
    $('.cart-panel').classList.add('open');
    loadCart();
  }));
  $('#cartClose')?.addEventListener('click', () => $('.cart-panel').classList.remove('open'));
  $('#checkoutBtn')?.addEventListener('click', async () => {
    const data = await api('/orders/create', { method: 'POST', body: JSON.stringify({ paymentStatus: 'pending' }) });
    toast(`Order created: $${data.total}`);
    loadCart();
  });
  render();
}

async function addCart(productId) {
  if (!state.token) return location.href = '/auth.html';
  await api('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity: 1 }) });
  toast('Added to cart');
  loadCart();
}

async function loadCart() {
  if (!state.token || !$('#cartItems')) return;
  const cart = await api('/cart');
  $('#cartItems').innerHTML = cart.products.map((item) => `
    <div class="cart-line">
      <div><strong>${item.product.name}</strong><br><span class="muted">$${item.product.price} x ${item.quantity}</span></div>
      <button class="icon-btn remove-cart" data-id="${item.product._id}"><i class="fa-solid fa-xmark"></i></button>
    </div>`).join('') || '<p class="muted">Your cart is empty.</p>';
  $('#cartTotal').textContent = `$${cart.totalPrice.toFixed(2)}`;
  $$('.remove-cart').forEach((btn) => btn.addEventListener('click', async () => {
    await api(`/cart/remove/${btn.dataset.id}`, { method: 'DELETE' });
    loadCart();
  }));
}

async function initTrainers() {
  const grid = $('#trainersGrid');
  if (!grid) return;
  const render = async () => {
    const specialty = $('#trainerFilter').value;
    const trainers = await api(`/trainers${specialty ? `?specialty=${encodeURIComponent(specialty)}` : ''}`);
    grid.innerHTML = trainers.map((t) => `
      <article class="card">
        <img class="trainer-img" src="${t.imageUrl}" alt="${t.name}">
        <span class="badge">${t.specialty}</span>
        <h3>${t.name}</h3>
        <p>${t.experience} years experience - ${renderStars(t.rating)}</p>
        <p>${t.description}</p>
        <div class="trainer-plan-chip"><i class="fa-solid fa-clipboard-check"></i><span>${t.checkPlan?.title || 'Trainer Check Plan'}</span></div>
        <button class="btn details" data-id="${t._id}"><i class="fa-solid fa-calendar-check"></i> Subscribe to Trainer</button>
      </article>`).join('');
    $$('.details').forEach((btn) => btn.addEventListener('click', () => openTrainer(trainers.find((t) => t._id === btn.dataset.id))));
  };
  $('#trainerFilter').addEventListener('change', render);
  render();
}

async function initMachines() {
  const grid = $('#machinesGrid');
  if (!grid) return;

  const render = async () => {
    const search = $('#machineSearch').value;
    const category = $('#machineFilter').value;
    try {
      const response = await api(`/machines?search=${encodeURIComponent(search)}${category ? `&category=${encodeURIComponent(category)}` : ''}`);
      const machines = Array.isArray(response) ? response : filterMachineCatalog(fallbackMachines, search, category);
      grid.innerHTML = machines.map((machine) => `
        <article class="card">
          <img class="machine-img" src="${machine.imageUrl}" alt="${machine.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=82'">
          <span class="badge">${machine.category}</span>
          <h3>${machine.name}</h3>
          <p>${machine.description}</p>
          <p><strong>${machine.muscleGroup}</strong> - ${machine.quantity} unit${machine.quantity > 1 ? 's' : ''} - ${machine.status}</p>
          <ul class="list">${machine.specs.map((spec) => `<li><i class="fa-solid fa-check"></i>${spec}</li>`).join('')}</ul>
        </article>`).join('') || '<p class="muted">No machines match that search.</p>';
    } catch (error) {
      const machines = filterMachineCatalog(fallbackMachines, search, category);
      grid.innerHTML = machines.map((machine) => `
        <article class="card">
          <img class="machine-img" src="${machine.imageUrl}" alt="${machine.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=82'">
          <span class="badge">${machine.category}</span>
          <h3>${machine.name}</h3>
          <p>${machine.description}</p>
          <p><strong>${machine.muscleGroup}</strong> - ${machine.quantity} unit${machine.quantity > 1 ? 's' : ''} - ${machine.status}</p>
          <ul class="list">${machine.specs.map((spec) => `<li><i class="fa-solid fa-check"></i>${spec}</li>`).join('')}</ul>
        </article>`).join('') || '<p class="muted">No machines match that search.</p>';
    }
  };

  $('#machineSearch').addEventListener('input', render);
  $('#machineFilter').addEventListener('change', render);
  render();
}

function openTrainer(trainer) {
  const modal = $('#trainerModal');
  modal.classList.add('open');
  $('.modal-box', modal).innerHTML = `
    <button class="icon-btn modal-close" id="modalClose"><i class="fa-solid fa-xmark"></i></button>
    <h3>${trainer.name}</h3>
    <p class="muted">${trainer.specialty} - ${trainer.experience} years - ${renderStars(trainer.rating)}</p>
    <p>${trainer.description}</p>
    ${renderTrainerPlanPreview(trainer.checkPlan)}
    <form id="bookingForm">
      <select name="date">${trainer.availableSchedule.map((s) => `<option>${s}</option>`).join('')}</select>
      <textarea name="notes" placeholder="Training goal or injury notes"></textarea>
      <button class="btn"><i class="fa-solid fa-clipboard-check"></i> Subscribe and Save Plan</button>
    </form>`;
  $('#modalClose').addEventListener('click', () => modal.classList.remove('open'));
  $('#bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.token) return location.href = '/auth.html';
    const fd = new FormData(e.target);
    const data = await api('/trainers/subscribe', { method: 'POST', body: JSON.stringify({ trainerId: trainer._id, date: fd.get('date'), notes: fd.get('notes') }) });
    toast(data.message);
    modal.classList.remove('open');
  });
}

function initAuth() {
  const authChoice = $('#authChoice');
  const loginPanel = $('#authLoginPanel');
  const registerPanel = $('#authRegisterPanel');
  const forgotPanel = $('#authForgotPanel');
  if (authChoice && loginPanel && registerPanel && forgotPanel) {
    const mode = new URLSearchParams(location.search).get('mode');
    const showLogin = mode === 'login';
    const showRegister = mode === 'register';
    const showForgot = mode === 'forgot';
    authChoice.classList.toggle('is-hidden', showLogin || showRegister || showForgot);
    loginPanel.classList.toggle('is-active', showLogin);
    registerPanel.classList.toggle('is-active', showRegister);
    forgotPanel.classList.toggle('is-active', showForgot);
    if (showLogin || showRegister || showForgot) {
      document.title = `${showLogin ? 'Login' : showRegister ? 'Register' : 'Reset Password'} | ApexForge`;
    }
  }

  $('#registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(e.target));
      const strength = getPasswordStrength(payload.password);
      if (strength.level === 'weak') {
        toast('Please use a stronger password before registering.');
        return;
      }
      const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      setSession(data);
      location.href = '/profile.html';
    } catch (error) { toast(error.message); }
  });
  $('#loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(e.target));
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
      setSession(data);
      location.href = data.user.role === 'admin' ? '/admin.html' : '/profile.html';
    } catch (error) { toast(error.message); }
  });
  $('#forgotPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(e.target));
      const data = await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) });
      toast(data.message);
      const resetForm = $('#resetPasswordForm');
      const resetCodeBox = $('#resetCodeBox');
      if (data.resetCode && resetForm && resetCodeBox) {
        resetForm.hidden = false;
        $('[name="email"]', resetForm).value = payload.email;
        $('[name="resetCode"]', resetForm).value = data.resetCode;
        resetCodeBox.hidden = false;
        resetCodeBox.innerHTML = `
          <strong>Reset code</strong>
          <code>${data.resetCode}</code>
          <span class="muted">Use this code below with your new password.</span>`;
      }
    } catch (error) { toast(error.message); }
  });
  $('#resetPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(e.target));
      const strength = getPasswordStrength(payload.password);
      if (strength.level === 'weak') {
        toast('Please use a stronger password before resetting.');
        return;
      }
      const data = await api('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) });
      setSession(data);
      toast(data.message);
      location.href = '/profile.html';
    } catch (error) { toast(error.message); }
  });
}

async function initProfile() {
  const box = $('#profileBox');
  if (!box) return;
  if (!state.token) return location.href = '/auth.html';
  const user = await api('/auth/profile');
  box.innerHTML = `
    <div class="card"><h3>${user.fullName}</h3><p>${user.email}</p><p class="badge">${user.subscriptionStatus}</p></div>
    <div class="card"><h3>Membership</h3><p>${user.selectedMembershipPlan?.name || 'No active plan'}</p></div>
    <div class="card"><h3>BMI History</h3>${(user.bmiHistory || []).slice(0, 5).map((b) => `<p>${b.bmi} - ${b.category}</p>`).join('') || '<p class="muted">No BMI entries yet.</p>'}</div>
    <div class="card"><h3>Wishlist</h3>${(user.wishlist || []).map((p) => `<p>${p.name}</p>`).join('') || '<p class="muted">No saved products.</p>'}</div>
    <div class="card profile-plan-card"><h3>Trainer Check Plans</h3>${renderSavedTrainerPlans(user.trainerSubscriptions || [])}</div>`;
  const orders = await api('/orders/history');
  $('#orderHistory').innerHTML = orders.map((o) => `<div class="card"><strong>$${o.total}</strong><p>${new Date(o.createdAt).toLocaleDateString()} - ${o.paymentStatus}</p></div>`).join('') || '<p class="muted">No orders yet.</p>';
}

async function initAdmin() {
  const box = $('#adminStats');
  if (!box) return;
  if (!state.token) return location.href = '/auth.html';
  try {
    const stats = await api('/admin/stats');
    box.innerHTML = Object.entries(stats).map(([key, value]) => `<div class="card"><span class="muted">${key}</span><h3>${value}</h3></div>`).join('');
    const [users, orders] = await Promise.all([api('/admin/users'), api('/admin/orders')]);
    $('#adminUsers').innerHTML = users.map((u) => `<tr><td>${u.fullName}</td><td>${u.email}</td><td>${u.role}</td><td>${u.subscriptionStatus}</td></tr>`).join('');
    $('#adminOrders').innerHTML = orders.map((o) => `<tr><td>${o.userInfo?.fullName || 'User'}</td><td>$${o.total}</td><td>${o.paymentStatus}</td></tr>`).join('');
  } catch (error) {
    box.innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

function initContact() {
  $('#contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api('/contact', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
      toast(data.message);
      e.target.reset();
    } catch (error) { toast(error.message); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCommon();
  initPlans();
  initBMI();
  initSupplements();
  initTrainers();
  initMachines();
  initAuth();
  initProfile();
  initAdmin();
  initContact();
});
