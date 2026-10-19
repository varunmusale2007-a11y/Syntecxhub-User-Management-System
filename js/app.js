/**
 * UserHub - Main Application Controller
 * Handles user management table, CRUD modals, pagination, search, filters, and analytics.
 */

// Application State
const state = {
  currentUser: null,
  users: [],
  totalUsers: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
  search: '',
  role: 'all',
  status: 'all',
  department: 'all',
  sortBy: 'createdAt',
  order: 'desc',
  selectedUserForDelete: null,
  selectedUserForEdit: null,
  searchDebounceTimer: null,
};

// ==============================================================
// DOM Ready Entry Point
// ==============================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Guard route: require authentication
  const user = await window.UserHubAuth.requireAuth();
  if (!user) return;
  state.currentUser = user;

  // Initialize UI components
  renderTopNavUser(user);
  setupNavigationEvents();
  setupModalEvents();
  setupFilterEvents();
  setupSortingEvents();
  setupApiSettingsModal();

  // Load initial data
  checkApiHealth();
  await Promise.all([loadStats(), loadUsers()]);
});

// ==============================================================
// Header & Navigation Setup
// ==============================================================
function renderTopNavUser(user) {
  const avatarEl = document.getElementById('topNavAvatar');
  const nameEl = document.getElementById('topNavName');
  const roleEl = document.getElementById('topNavRole');
  const dropdownName = document.getElementById('dropdownFullName');
  const dropdownEmail = document.getElementById('dropdownEmail');

  const avatarUrl =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=128&bold=true`;

  if (avatarEl) avatarEl.src = avatarUrl;
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;
  if (dropdownName) dropdownName.textContent = user.name;
  if (dropdownEmail) dropdownEmail.textContent = user.email;
}

function setupNavigationEvents() {
  // Mobile sidebar toggle
  const mobileToggle = document.getElementById('mobileSidebarToggle');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (mobileToggle && sidebar && backdrop) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }

  // User Profile Pill Dropdown Toggle
  const profileBtn = document.getElementById('userProfileBtn');
  const dropdownMenu = document.getElementById('userDropdownMenu');

  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  }

  // Dropdown Items
  document.getElementById('dropdownLogoutBtn')?.addEventListener('click', () => {
    window.UserHubAuth.logout();
  });

  document.getElementById('dropdownMyProfileBtn')?.addEventListener('click', () => {
    if (state.currentUser) {
      openViewDetailsModal(state.currentUser);
    }
  });

  // Sidebar navigation actions
  document.getElementById('navUsers')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('navAnalytics')?.addEventListener('click', () => {
    const statsGrid = document.getElementById('statsGrid');
    if (statsGrid) {
      statsGrid.scrollIntoView({ behavior: 'smooth' });
    }
  });

  document.getElementById('navApiSettings')?.addEventListener('click', () => {
    openApiModal();
  });

  document.getElementById('quickRefreshApiStatusBtn')?.addEventListener('click', () => {
    checkApiHealth();
  });
}

// ==============================================================
// Live API Health Check
// ==============================================================
async function checkApiHealth() {
  const pulseEl = document.getElementById('apiStatusPulse');
  const textEl = document.getElementById('apiStatusText');

  if (!pulseEl || !textEl) return;

  pulseEl.className = 'status-dot-pulse';
  textEl.textContent = 'Checking...';

  try {
    const res = await window.UserHubAPI.HealthAPI.check();
    if (res && res.status === 'healthy') {
      pulseEl.className = 'status-dot-pulse';
      textEl.textContent = 'API Online';
    } else {
      pulseEl.className = 'status-dot-pulse offline';
      textEl.textContent = 'API Degraded';
    }
  } catch (err) {
    pulseEl.className = 'status-dot-pulse offline';
    textEl.textContent = 'API Offline';
  }
}

// ==============================================================
// Dashboard Analytics & Stats Loader
// ==============================================================
async function loadStats() {
  try {
    const res = await window.UserHubAPI.UserAPI.getStats();
    if (res && res.stats) {
      const {
        totalUsers,
        activeUsers,
        adminCount,
        managerCount,
        newUsersThisMonth,
      } = res.stats;

      document.getElementById('statTotalUsers').textContent = totalUsers.toLocaleString();
      document.getElementById('statActiveUsers').textContent = activeUsers.toLocaleString();
      document.getElementById('statPrivilegedUsers').textContent = (
        adminCount + managerCount
      ).toLocaleString();
      document.getElementById('statNewThisMonth').textContent = newUsersThisMonth.toLocaleString();

      const activeRatio = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 100;
      const ratioEl = document.getElementById('statActiveRatio');
      if (ratioEl) {
        ratioEl.innerHTML = `
          <i class="fa-solid fa-circle-check" style="color: var(--success);"></i>
          <span>${activeRatio}% of total accounts</span>
        `;
      }
    }
  } catch (err) {
    console.warn('Could not load stats from API:', err.message);
  }
}

// ==============================================================
// Users List & Table Rendering
// ==============================================================
async function loadUsers() {
  const tableBody = document.getElementById('usersTableBody');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');
  const paginationBar = document.getElementById('tablePagination');

  // Show Skeleton loading rows
  renderSkeletonRows(tableBody, state.limit);
  emptyState.style.display = 'none';
  errorState.style.display = 'none';

  try {
    const params = {
      search: state.search,
      role: state.role,
      status: state.status,
      department: state.department,
      page: state.currentPage,
      limit: state.limit,
      sortBy: state.sortBy,
      order: state.order,
    };

    const res = await window.UserHubAPI.UserAPI.getUsers(params);

    if (res && res.success) {
      state.users = res.users || [];
      state.totalUsers = res.totalUsers || 0;
      state.totalPages = res.totalPages || 1;
      state.currentPage = res.currentPage || 1;

      if (state.users.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'flex';
        paginationBar.style.display = 'none';
      } else {
        renderUsersTable(tableBody, state.users);
        paginationBar.style.display = 'flex';
        renderPagination();
      }
    }
  } catch (err) {
    console.error('Failed to load users:', err);
    tableBody.innerHTML = '';
    paginationBar.style.display = 'none';
    errorState.style.display = 'flex';
    document.getElementById('errorDesc').textContent =
      err.message || 'Unable to connect to the backend API.';
  }
}

function renderSkeletonRows(tbody, count) {
  let html = '';
  const rowCount = Math.min(count, 5);
  for (let i = 0; i < rowCount; i++) {
    html += `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="skeleton-line" style="width: 38px; height: 38px; border-radius: 50%;"></div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem; width: 120px;">
              <div class="skeleton-line" style="width: 100%; height: 14px;"></div>
              <div class="skeleton-line" style="width: 60%; height: 10px;"></div>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0.35rem; width: 140px;">
            <div class="skeleton-line" style="width: 100%; height: 14px;"></div>
            <div class="skeleton-line" style="width: 70%; height: 10px;"></div>
          </div>
        </td>
        <td><div class="skeleton-line" style="width: 65px; height: 22px; border-radius: 12px;"></div></td>
        <td><div class="skeleton-line" style="width: 75px; height: 22px; border-radius: 12px;"></div></td>
        <td><div class="skeleton-line" style="width: 90px; height: 14px;"></div></td>
        <td style="text-align: right;"><div class="skeleton-line" style="width: 90px; height: 28px; display: inline-block;"></div></td>
      </tr>
    `;
  }
  tbody.innerHTML = html;
}

function renderUsersTable(tbody, users) {
  let html = '';

  users.forEach((u) => {
    const avatar =
      u.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4f46e5&color=fff&size=128&bold=true`;

    const joinedDate = u.createdAt
      ? new Date(u.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

    const isSelf = state.currentUser && state.currentUser.id === u._id;

    html += `
      <tr data-user-id="${u._id}">
        <td>
          <div class="user-cell">
            <img src="${avatar}" alt="${escapeHtml(u.name)}" class="table-avatar" loading="lazy" />
            <div class="user-cell-info">
              <span class="user-cell-name">
                ${escapeHtml(u.name)}
                ${isSelf ? '<span class="badge badge-admin" style="font-size: 0.65rem; margin-left: 4px;">You</span>' : ''}
              </span>
              <span class="user-cell-sub">${escapeHtml(u.department || 'General')}</span>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 500; color: var(--text-primary);">${escapeHtml(u.email)}</span>
            <span style="font-size: 0.75rem; color: var(--text-light);">${escapeHtml(u.phone || 'No phone')}</span>
          </div>
        </td>
        <td>
          <span class="badge badge-${escapeHtml(u.role)}">
            ${escapeHtml(u.role)}
          </span>
        </td>
        <td>
          <span class="status-indicator status-${escapeHtml(u.status)}">
            <span class="status-dot"></span>
            ${escapeHtml(u.status)}
          </span>
        </td>
        <td>
          <span style="font-size: 0.85rem; color: var(--text-muted);">${joinedDate}</span>
        </td>
        <td style="text-align: right;">
          <div class="action-btn-group" style="justify-content: flex-end;">
            <button class="action-btn view" title="View Profile" onclick="window.handleViewUser('${u._id}')">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="action-btn edit" title="Edit User" onclick="window.handleEditUser('${u._id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button
              class="action-btn delete"
              title="${isSelf ? 'Cannot delete yourself' : 'Delete User'}"
              ${isSelf ? 'disabled' : ''}
              onclick="window.handleDeleteUser('${u._id}')"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==============================================================
// Pagination Controls
// ==============================================================
function renderPagination() {
  const infoEl = document.getElementById('paginationInfo');
  const controlsEl = document.getElementById('paginationControls');

  const start = (state.currentPage - 1) * state.limit + 1;
  const end = Math.min(state.currentPage * state.limit, state.totalUsers);

  infoEl.textContent = `Showing ${start.toLocaleString()} to ${end.toLocaleString()} of ${state.totalUsers.toLocaleString()} users`;

  let html = '';

  // Previous Button
  html += `
    <button class="page-btn" ${state.currentPage <= 1 ? 'disabled' : ''} onclick="window.changePage(${state.currentPage - 1})">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;

  // Page Numbers
  const maxButtons = 5;
  let startPage = Math.max(1, state.currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(state.totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  if (startPage > 1) {
    html += `<button class="page-btn" onclick="window.changePage(1)">1</button>`;
    if (startPage > 2) {
      html += `<span style="padding: 0 4px; color: var(--text-light);">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button class="page-btn ${i === state.currentPage ? 'active' : ''}" onclick="window.changePage(${i})">
        ${i}
      </button>
    `;
  }

  if (endPage < state.totalPages) {
    if (endPage < state.totalPages - 1) {
      html += `<span style="padding: 0 4px; color: var(--text-light);">...</span>`;
    }
    html += `<button class="page-btn" onclick="window.changePage(${state.totalPages})">${state.totalPages}</button>`;
  }

  // Next Button
  html += `
    <button class="page-btn" ${state.currentPage >= state.totalPages ? 'disabled' : ''} onclick="window.changePage(${state.currentPage + 1})">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  controlsEl.innerHTML = html;
}

window.changePage = function (newPage) {
  if (newPage < 1 || newPage > state.totalPages || newPage === state.currentPage) return;
  state.currentPage = newPage;
  loadUsers();
  window.scrollTo({ top: 300, behavior: 'smooth' });
};

// ==============================================================
// Search & Filter Events
// ==============================================================
function setupFilterEvents() {
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const roleFilter = document.getElementById('roleFilter');
  const statusFilter = document.getElementById('statusFilter');
  const deptFilter = document.getElementById('deptFilter');
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');
  const refreshTableBtn = document.getElementById('refreshTableBtn');
  const retryLoadBtn = document.getElementById('retryLoadBtn');

  // Debounced Search Input
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    searchClearBtn.classList.toggle('visible', val.length > 0);

    clearTimeout(state.searchDebounceTimer);
    state.searchDebounceTimer = setTimeout(() => {
      state.search = val;
      state.currentPage = 1;
      loadUsers();
    }, 300);
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.classList.remove('visible');
    state.search = '';
    state.currentPage = 1;
    loadUsers();
  });

  // Dropdown Filters
  roleFilter.addEventListener('change', (e) => {
    state.role = e.target.value;
    state.currentPage = 1;
    loadUsers();
  });

  statusFilter.addEventListener('change', (e) => {
    state.status = e.target.value;
    state.currentPage = 1;
    loadUsers();
  });

  deptFilter.addEventListener('change', (e) => {
    state.department = e.target.value;
    state.currentPage = 1;
    loadUsers();
  });

  pageSizeSelect.addEventListener('change', (e) => {
    state.limit = parseInt(e.target.value, 10);
    state.currentPage = 1;
    loadUsers();
  });

  // Reset Filters Function
  const resetAllFilters = () => {
    searchInput.value = '';
    searchClearBtn.classList.remove('visible');
    roleFilter.value = 'all';
    statusFilter.value = 'all';
    deptFilter.value = 'all';

    state.search = '';
    state.role = 'all';
    state.status = 'all';
    state.department = 'all';
    state.currentPage = 1;

    loadUsers();
    window.UserHubAuth.showToast('Filters Cleared', 'Displaying all users.', 'info', 2000);
  };

  resetFiltersBtn.addEventListener('click', resetAllFilters);
  emptyResetBtn.addEventListener('click', resetAllFilters);

  // Refresh Table Button with rotation animation
  refreshTableBtn.addEventListener('click', () => {
    const icon = refreshTableBtn.querySelector('i');
    icon.classList.add('fa-spin');
    Promise.all([loadStats(), loadUsers()]).finally(() => {
      setTimeout(() => icon.classList.remove('fa-spin'), 600);
    });
  });

  retryLoadBtn.addEventListener('click', () => {
    Promise.all([loadStats(), loadUsers(), checkApiHealth()]);
  });
}

function setupSortingEvents() {
  const headers = document.querySelectorAll('.data-table th.sortable');
  headers.forEach((th) => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (state.sortBy === field) {
        state.order = state.order === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = field;
        state.order = 'asc';
      }

      // Update header icons
      headers.forEach((h) => {
        const icon = h.querySelector('i');
        if (h === th) {
          icon.className = state.order === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
        } else {
          icon.className = 'fa-solid fa-sort';
        }
      });

      loadUsers();
    });
  });
}

// ==============================================================
// Modal Controllers & CRUD Operations
// ==============================================================
function setupModalEvents() {
  // Generic close triggers
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    });
  });

  // Close modals on overlay backdrop click
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Open Add User Modal
  document.getElementById('openAddUserModalBtn')?.addEventListener('click', () => {
    const form = document.getElementById('addUserForm');
    form.reset();
    clearFormErrors(form);
    document.getElementById('addUserModal').classList.add('active');
  });

  // Add User Form Submission
  const addForm = document.getElementById('addUserForm');
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('addUserName').value.trim();
    const email = document.getElementById('addUserEmail').value.trim();
    const password = document.getElementById('addUserPassword').value;
    const role = document.getElementById('addUserRole').value;
    const status = document.getElementById('addUserStatus').value;
    const department = document.getElementById('addUserDept').value;
    const phone = document.getElementById('addUserPhone').value.trim();

    clearFormErrors(addForm);

    let isValid = true;
    if (name.length < 2) {
      showInputError('addUserName', 'addNameError');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showInputError('addUserEmail', 'addEmailError');
      isValid = false;
    }

    if (!password || password.length < 6) {
      showInputError('addUserPassword', 'addPasswordError');
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = document.getElementById('submitAddUserBtn');
    submitBtn.disabled = true;

    try {
      const res = await window.UserHubAPI.UserAPI.createUser({
        name,
        email,
        password,
        role,
        status,
        department,
        phone,
      });

      if (res && res.success) {
        document.getElementById('addUserModal').classList.remove('active');
        window.UserHubAuth.showToast(
          'User Created',
          `Account for ${res.user.name} created successfully!`,
          'success'
        );
        loadStats();
        loadUsers();
      }
    } catch (err) {
      window.UserHubAuth.showToast('Creation Failed', err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Edit User Form Submission
  const editForm = document.getElementById('editUserForm');
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const role = document.getElementById('editUserRole').value;
    const status = document.getElementById('editUserStatus').value;
    const department = document.getElementById('editUserDept').value;
    const phone = document.getElementById('editUserPhone').value.trim();
    const password = document.getElementById('editUserPassword').value;

    clearFormErrors(editForm);

    let isValid = true;
    if (name.length < 2) {
      showInputError('editUserName', 'editNameError');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showInputError('editUserEmail', 'editEmailError');
      isValid = false;
    }

    if (password && password.length < 6) {
      showInputError('editUserPassword', 'editPasswordError');
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = document.getElementById('submitEditUserBtn');
    submitBtn.disabled = true;

    try {
      const payload = { name, email, role, status, department, phone };
      if (password) payload.password = password;

      const res = await window.UserHubAPI.UserAPI.updateUser(id, payload);

      if (res && res.success) {
        document.getElementById('editUserModal').classList.remove('active');
        window.UserHubAuth.showToast(
          'User Updated',
          `Changes for ${res.user.name} saved successfully!`,
          'success'
        );

        // If updated logged-in user, refresh profile header
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = res.user;
          localStorage.setItem('userhub_user', JSON.stringify(res.user));
          renderTopNavUser(res.user);
        }

        loadStats();
        loadUsers();
      }
    } catch (err) {
      window.UserHubAuth.showToast('Update Failed', err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Delete User Confirmation
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
    if (!state.selectedUserForDelete) return;

    const user = state.selectedUserForDelete;
    const btn = document.getElementById('confirmDeleteBtn');
    const btnText = document.getElementById('deleteBtnText');

    btn.disabled = true;
    btnText.textContent = 'Deleting...';

    try {
      const res = await window.UserHubAPI.UserAPI.deleteUser(user._id);
      if (res && res.success) {
        document.getElementById('deleteConfirmModal').classList.remove('active');
        window.UserHubAuth.showToast('Deleted', res.message, 'success');
        state.selectedUserForDelete = null;
        loadStats();
        loadUsers();
      }
    } catch (err) {
      window.UserHubAuth.showToast('Delete Failed', err.message, 'error');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Delete Account';
    }
  });

  // Switch from View modal to Edit modal
  document.getElementById('viewEditTriggerBtn')?.addEventListener('click', () => {
    const modal = document.getElementById('viewDetailsModal');
    modal.classList.remove('active');
    if (state.selectedUserForEdit) {
      window.handleEditUser(state.selectedUserForEdit._id);
    }
  });
}

// Global Handlers attached to window for inline HTML onclick attributes
window.handleViewUser = function (id) {
  const user = state.users.find((u) => u._id === id);
  if (!user) return;
  openViewDetailsModal(user);
};

window.handleEditUser = function (id) {
  const user = state.users.find((u) => u._id === id) || (state.currentUser && state.currentUser.id === id ? state.currentUser : null);
  if (!user) return;

  state.selectedUserForEdit = user;
  const form = document.getElementById('editUserForm');
  form.reset();
  clearFormErrors(form);

  document.getElementById('editUserId').value = user._id || user.id;
  document.getElementById('editUserName').value = user.name;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserRole').value = user.role;
  document.getElementById('editUserStatus').value = user.status;
  document.getElementById('editUserDept').value = user.department || 'General';
  document.getElementById('editUserPhone').value = user.phone || '';

  // Safeguard: Demoting self is blocked in backend, let's also disable role dropdown if editing self
  const roleSelect = document.getElementById('editUserRole');
  const isSelf = state.currentUser && (state.currentUser.id === user._id || state.currentUser.id === user.id);
  roleSelect.disabled = isSelf;

  document.getElementById('editUserModal').classList.add('active');
};

window.handleDeleteUser = function (id) {
  const user = state.users.find((u) => u._id === id);
  if (!user) return;

  if (state.currentUser && (state.currentUser.id === id || state.currentUser._id === id)) {
    window.UserHubAuth.showToast(
      'Security Action Blocked',
      'You cannot delete your own admin account.',
      'warning'
    );
    return;
  }

  state.selectedUserForDelete = user;
  document.getElementById('deleteUserNameTarget').textContent = user.name;
  document.getElementById('deleteConfirmModal').classList.add('active');
};

function openViewDetailsModal(user) {
  state.selectedUserForEdit = user;

  const avatar =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=128&bold=true`;

  document.getElementById('viewAvatar').src = avatar;
  document.getElementById('viewName').textContent = user.name;
  document.getElementById('viewEmail').textContent = user.email;
  document.getElementById('viewPhone').textContent = user.phone || 'Not provided';
  document.getElementById('viewDepartment').textContent = user.department || 'General';
  document.getElementById('viewId').textContent = user._id || user.id || '—';

  const roleBadge = document.getElementById('viewRoleBadge');
  roleBadge.className = `badge badge-${user.role}`;
  roleBadge.textContent = user.role;

  const statusBadge = document.getElementById('viewStatusBadge');
  statusBadge.className = `status-indicator status-${user.status}`;
  statusBadge.innerHTML = `<span class="status-dot"></span> ${user.status}`;

  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';
  document.getElementById('viewCreatedAt').textContent = createdDate;

  const lastLogin = user.lastLogin
    ? new Date(user.lastLogin).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Never logged in';
  document.getElementById('viewLastLogin').textContent = lastLogin;

  document.getElementById('viewDetailsModal').classList.add('active');
}

// ==============================================================
// API Settings Modal Handlers
// ==============================================================
function setupApiSettingsModal() {
  const modal = document.getElementById('dashboardApiModal');
  const input = document.getElementById('dashCustomApiInput');

  window.openApiModal = function () {
    input.value = window.UserHubAPI.getApiBaseUrl();
    modal.classList.add('active');
  };

  document.getElementById('dropdownApiBtn')?.addEventListener('click', openApiModal);
  document.getElementById('openApiFromErrorBtn')?.addEventListener('click', openApiModal);

  document.getElementById('dashSetLocalBtn')?.addEventListener('click', () => {
    input.value = 'http://127.0.0.1:5000/api';
  });

  document.getElementById('dashSetRenderBtn')?.addEventListener('click', () => {
    input.value = 'https://userhub-api.onrender.com/api';
  });

  document.getElementById('dashSaveApiBtn')?.addEventListener('click', () => {
    const newUrl = input.value.trim();
    window.UserHubAPI.setApiBaseUrl(newUrl);
    modal.classList.remove('active');
    window.UserHubAuth.showToast('API Updated', 'Reconnecting to new endpoint...', 'info');
    checkApiHealth();
    loadStats();
    loadUsers();
  });
}

// ==============================================================
// Utility Functions
// ==============================================================
function showInputError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) error.classList.add('visible');
}

function clearFormErrors(form) {
  form.querySelectorAll('.form-control').forEach((el) => el.classList.remove('error'));
  form.querySelectorAll('.form-error-msg').forEach((el) => el.classList.remove('visible'));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
