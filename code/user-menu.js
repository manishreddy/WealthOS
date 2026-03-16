// WealthOS User Menu Component
// Handles user profile display, dropdown menu, and logout functionality

// Initialize user menu on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeUserMenu();
});

function initializeUserMenu() {
    // Get user data
    const user = (typeof WealthAPI !== 'undefined') ? WealthAPI.auth.getCachedUser() : null;
    if (!user) return;

    // Update avatar with user's initial
    const avatar = document.querySelector('.user-avatar');
    if (avatar) {
        const initial = user.familyName ? user.familyName.charAt(0).toUpperCase() :
                       user.email ? user.email.charAt(0).toUpperCase() : 'U';
        avatar.textContent = initial;

        // Add click handler
        avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleUserMenu();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('userMenuDropdown');
        if (dropdown && !dropdown.contains(e.target) && !avatar.contains(e.target)) {
            closeUserMenu();
        }
    });
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        const isOpen = dropdown.classList.contains('active');
        if (isOpen) {
            closeUserMenu();
        } else {
            openUserMenu();
        }
    }
}

function openUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        dropdown.classList.add('active');
    }
}

function closeUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

function handleLogout() {
    window.onbeforeunload = null;
    WealthAPI.auth.logout();
}

// Export functions if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeUserMenu,
        toggleUserMenu,
        handleLogout
    };
}
