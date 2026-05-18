const commonFragments = ['password', 'qwerty', 'admin', 'welcome', 'letmein', '123456', '111111'];

function getPasswordStrength(password = '') {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push('use at least 8 characters');

  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else feedback.push('mix uppercase and lowercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('add a number');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('add a symbol');

  if (commonFragments.some((fragment) => password.toLowerCase().includes(fragment))) {
    score = Math.max(0, score - 2);
    feedback.push('avoid common words or patterns');
  }

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('avoid repeated characters');
  }

  const level = score >= 5 ? 'strong' : score >= 3 ? 'medium' : 'weak';
  return { score, level, feedback };
}

module.exports = { getPasswordStrength };
