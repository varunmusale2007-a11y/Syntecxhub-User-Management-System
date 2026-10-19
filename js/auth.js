/**
 * UserHub - Authentication & Session Controller
 * Manages user logins, registrations, token persistence, route protection, and theme switching.
 */

// ==============================================================
// Global Toast Notification Helper
// ==============================================================
function showToast(title, message, type = 'info', duration = 4000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="toast-icon ${icons[type] || icons.info}"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close-btn" aria-label="Close notification">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  const closeBtn = toast.querySelector('.toast-close-btn');
  closeBtn.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  });

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }
}

// ==============================================================
// Dark / Light Theme Manager
// ==============================================================
function initTheme() {
  const savedTheme = localStorage.getItem('userhub_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('userhub_theme', next);
      updateThemeIcons(next);
    });
  });
}

function updateThemeIcons(theme) {
  const icons = document.querySelectorAll('.theme-toggle-btn i');
  icons.forEach((icon) => {
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  });
}

// ==============================================================
// Route Guards
// ==============================================================

/**
 * For protected pages (e.g., index.html)
 * Ensures user is authenticated. If not, redirects to login.html.
 */
async function requireAuth() {
  const token = localStorage.getItem('userhub_token');
  const user = window.UserHubAPI.getCurrentUser();

  if (!token || !user) {
    window.location.href = 'login.html';
    return null;
  }

  // Validate session with backend asynchronously
  try {
    const res = await window.UserHubAPI.AuthAPI.getMe();
    if (res && res.user) {
      localStorage.setItem('userhub_user', JSON.stringify(res.user));
      return res.user;
    }
  } catch (error) {
    // If token invalid or expired, user is redirected by apiRequest 401 handler
    console.warn('Session verification error:', error.message);
  }

  return user;
}

/**
 * For guest pages (login.html, register.html)
 * If user is already logged in, redirects to index.html.
 */
function redirectIfLoggedIn() {
  const token = localStorage.getItem('userhub_token');
  if (token) {
    window.location.href = 'index.html';
  }
}

/**
 * Logout user: clears storage and redirects to login
 */
function logout() {
  localStorage.removeItem('userhub_token');
  localStorage.removeItem('userhub_user');
  showToast('Logged Out', 'You have been successfully logged out.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 400);
}

// Export auth functions to window object
window.UserHubAuth = {
  showToast,
  initTheme,
  requireAuth,
  redirectIfLoggedIn,
  logout,
};

// Initialize theme on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
});
