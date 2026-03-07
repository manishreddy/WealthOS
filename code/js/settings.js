/**
 * WealthOS Settings Page
 * Complete functionality for all settings sections
 */

// Storage keys
const SETTINGS_KEYS = {
    PROFILE: 'wealthos_profile',
    FAMILY_MEMBERS: 'wealthos_family_members',
    PREFERENCES: 'wealthos_preferences',
    SECURITY: 'wealthos_security',
    NOTIFICATIONS: 'wealthos_notifications'
};

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    loadAllSettings();
    attachEventListeners();
});

// ============================================
// PROFILE SECTION
// ============================================

function loadProfileSettings() {
    const user = getCurrentUser();
    if (!user) return;

    const profile = getProfile();

    // Populate profile fields
    document.getElementById('profileUserName').value = profile.userName || user.userName || '';
    document.getElementById('profileFamilyName').value = profile.familyName || user.familyName || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('accountCreatedDate').textContent = formatDate(user.createdAt);
}

function getProfile() {
    const defaultProfile = {
        userName: '',
        familyName: '',
        email: '',
        phone: '',
        address: ''
    };
    return JSON.parse(localStorage.getItem(SETTINGS_KEYS.PROFILE) || JSON.stringify(defaultProfile));
}

function saveProfile() {
    const userName = document.getElementById('profileUserName').value.trim();
    const familyName = document.getElementById('profileFamilyName').value.trim();

    if (!userName || !familyName) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const profile = {
        userName,
        familyName,
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(SETTINGS_KEYS.PROFILE, JSON.stringify(profile));

    // Update user data in auth
    updateUser({ userName, familyName });

    showToast('Profile updated successfully!', 'success');
}

// ============================================
// FAMILY MEMBERS SECTION
// ============================================

function loadFamilyMembers() {
    const members = getFamilyMembers();
    const container = document.getElementById('familyMembersContainer');

    if (!container) return;

    container.innerHTML = members.map((member, index) => `
        <div class="family-member-card" data-member-id="${member.id}">
            <div class="member-avatar" style="${getAvatarStyle(index)}">${getInitials(member.name)}</div>
            <div class="member-name">${member.name}</div>
            <div class="member-role">${member.relationship}</div>
            <div class="member-details">${member.age ? member.age + ' years' : 'Age not specified'}${member.email ? ' • ' + member.email : ''}</div>
            <div class="member-actions">
                <button class="member-btn member-btn-edit" onclick="editMember('${member.id}')">Edit</button>
                ${member.relationship !== 'Self' ? `<button class="member-btn member-btn-remove" onclick="deleteMember('${member.id}')">Remove</button>` : ''}
            </div>
        </div>
    `).join('');

    // Add "Add Member" card
    container.innerHTML += `
        <div class="add-member-card" onclick="openAddMemberModal()">
            <div class="add-member-icon">+</div>
            <div class="add-member-text">Add Family Member</div>
        </div>
    `;
}

function getFamilyMembers() {
    const user = getCurrentUser();
    const storedMembers = JSON.parse(localStorage.getItem(SETTINGS_KEYS.FAMILY_MEMBERS) || '[]');

    // If no members, create default from user
    if (storedMembers.length === 0 && user) {
        const defaultMember = {
            id: 'member_' + Date.now(),
            name: user.userName || 'User',
            relationship: 'Self',
            age: null,
            email: user.email,
            createdAt: new Date().toISOString()
        };
        storedMembers.push(defaultMember);
        saveFamilyMembers(storedMembers);
    }

    return storedMembers;
}

function saveFamilyMembers(members) {
    localStorage.setItem(SETTINGS_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
}

function openAddMemberModal() {
    document.getElementById('memberModalTitle').textContent = 'Add Family Member';
    document.getElementById('memberForm').reset();
    document.getElementById('memberForm').dataset.mode = 'add';
    document.getElementById('memberModal').classList.add('active');
}

function editMember(memberId) {
    const members = getFamilyMembers();
    const member = members.find(m => m.id === memberId);

    if (!member) return;

    document.getElementById('memberModalTitle').textContent = 'Edit Family Member';
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberRelationship').value = member.relationship;
    document.getElementById('memberAge').value = member.age || '';
    document.getElementById('memberEmail').value = member.email || '';

    const form = document.getElementById('memberForm');
    form.dataset.mode = 'edit';
    form.dataset.memberId = memberId;

    document.getElementById('memberModal').classList.add('active');
}

function saveMember() {
    const form = document.getElementById('memberForm');
    const mode = form.dataset.mode;
    const memberId = form.dataset.memberId;

    const name = document.getElementById('memberName').value.trim();
    const relationship = document.getElementById('memberRelationship').value;
    const age = parseInt(document.getElementById('memberAge').value) || null;
    const email = document.getElementById('memberEmail').value.trim();

    if (!name || !relationship) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const members = getFamilyMembers();

    if (mode === 'add') {
        const newMember = {
            id: 'member_' + Date.now(),
            name,
            relationship,
            age,
            email,
            createdAt: new Date().toISOString()
        };
        members.push(newMember);
        showToast('Family member added successfully!', 'success');
    } else {
        const index = members.findIndex(m => m.id === memberId);
        if (index !== -1) {
            members[index] = { ...members[index], name, relationship, age, email, updatedAt: new Date().toISOString() };
            showToast('Family member updated successfully!', 'success');
        }
    }

    saveFamilyMembers(members);
    loadFamilyMembers();
    closeMemberModal();
}

function deleteMember(memberId) {
    if (!confirm('Are you sure you want to remove this family member?')) return;

    const members = getFamilyMembers();
    const filteredMembers = members.filter(m => m.id !== memberId);

    saveFamilyMembers(filteredMembers);
    loadFamilyMembers();
    showToast('Family member removed successfully!', 'success');
}

function closeMemberModal() {
    document.getElementById('memberModal').classList.remove('active');
}

// ============================================
// PREFERENCES SECTION
// ============================================

function loadPreferences() {
    const prefs = getPreferences();

    // Currency
    if (document.getElementById('prefCurrency')) {
        document.getElementById('prefCurrency').value = prefs.currency || 'INR';
    }

    // Date Format
    if (document.getElementById('prefDateFormat')) {
        document.getElementById('prefDateFormat').value = prefs.dateFormat || 'DD/MM/YYYY';
    }

    // Number Format
    if (document.getElementById('prefNumberFormat')) {
        document.getElementById('prefNumberFormat').value = prefs.numberFormat || 'lakhs';
    }

    // Language
    if (document.getElementById('prefLanguage')) {
        document.getElementById('prefLanguage').value = prefs.language || 'en';
    }

    // Default View
    if (document.getElementById('prefDefaultView')) {
        document.getElementById('prefDefaultView').value = prefs.defaultView || 'family';
    }

    // Notifications
    loadNotificationSettings(prefs.notifications || {});
}

function getPreferences() {
    const defaults = {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'lakhs',
        language: 'en',
        defaultView: 'family',
        notifications: {
            email: true,
            transactions: true,
            goals: true,
            monthly: false,
            investment: true
        }
    };
    return JSON.parse(localStorage.getItem(SETTINGS_KEYS.PREFERENCES) || JSON.stringify(defaults));
}

function savePreferences() {
    const prefs = {
        currency: document.getElementById('prefCurrency')?.value || 'INR',
        dateFormat: document.getElementById('prefDateFormat')?.value || 'DD/MM/YYYY',
        numberFormat: document.getElementById('prefNumberFormat')?.value || 'lakhs',
        language: document.getElementById('prefLanguage')?.value || 'en',
        defaultView: document.getElementById('prefDefaultView')?.value || 'family',
        notifications: getNotificationSettings(),
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(SETTINGS_KEYS.PREFERENCES, JSON.stringify(prefs));
    showToast('Preferences saved successfully!', 'success');
}

function loadNotificationSettings(notifications) {
    if (document.getElementById('notifEmail')) {
        document.getElementById('notifEmail').checked = notifications.email !== false;
    }
    if (document.getElementById('notifTransactions')) {
        document.getElementById('notifTransactions').checked = notifications.transactions !== false;
    }
    if (document.getElementById('notifGoals')) {
        document.getElementById('notifGoals').checked = notifications.goals !== false;
    }
    if (document.getElementById('notifMonthly')) {
        document.getElementById('notifMonthly').checked = notifications.monthly === true;
    }
    if (document.getElementById('notifInvestment')) {
        document.getElementById('notifInvestment').checked = notifications.investment !== false;
    }
}

function getNotificationSettings() {
    return {
        email: document.getElementById('notifEmail')?.checked || false,
        transactions: document.getElementById('notifTransactions')?.checked || false,
        goals: document.getElementById('notifGoals')?.checked || false,
        monthly: document.getElementById('notifMonthly')?.checked || false,
        investment: document.getElementById('notifInvestment')?.checked || false
    };
}

// ============================================
// FINANCIAL SETTINGS SECTION
// ============================================

function loadFinancialSettings() {
    const financial = getFinancialSettings();

    if (document.getElementById('finSavingsTarget')) {
        document.getElementById('finSavingsTarget').value = financial.savingsTarget || 30;
    }
    if (document.getElementById('finInvestmentHorizon')) {
        document.getElementById('finInvestmentHorizon').value = financial.investmentHorizon || 20;
    }
    if (document.getElementById('finRetirementAge')) {
        document.getElementById('finRetirementAge').value = financial.retirementAge || 60;
    }
    if (document.getElementById('finEmergencyFund')) {
        document.getElementById('finEmergencyFund').value = financial.emergencyFundMonths || 6;
    }

    // Risk Profile
    selectRiskProfile(financial.riskProfile || 'Moderate');

    // Inflation rates
    loadInflationRates(financial.inflationRates || {});
}

function getFinancialSettings() {
    const defaults = {
        savingsTarget: 30,
        investmentHorizon: 20,
        retirementAge: 60,
        emergencyFundMonths: 6,
        riskProfile: 'Moderate',
        inflationRates: {
            housing: 5.0,
            food: 6.0,
            transportation: 5.5,
            healthcare: 8.0,
            education: 10.0,
            entertainment: 5.0,
            shopping: 4.5,
            utilities: 4.0
        }
    };
    return JSON.parse(localStorage.getItem('wealthos_financial_settings') || JSON.stringify(defaults));
}

function saveFinancialSettings() {
    const financial = {
        savingsTarget: parseInt(document.getElementById('finSavingsTarget')?.value) || 30,
        investmentHorizon: parseInt(document.getElementById('finInvestmentHorizon')?.value) || 20,
        retirementAge: parseInt(document.getElementById('finRetirementAge')?.value) || 60,
        emergencyFundMonths: parseInt(document.getElementById('finEmergencyFund')?.value) || 6,
        riskProfile: getSelectedRiskProfile(),
        inflationRates: getInflationRates(),
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('wealthos_financial_settings', JSON.stringify(financial));
    showToast('Financial settings saved successfully!', 'success');
}

function selectRiskProfile(profile) {
    document.querySelectorAll('.risk-profile-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.profile === profile) {
            card.classList.add('selected');
        }
    });
}

function getSelectedRiskProfile() {
    const selected = document.querySelector('.risk-profile-card.selected');
    return selected?.dataset.profile || 'Moderate';
}

function loadInflationRates(rates) {
    if (document.getElementById('inflationHousing')) {
        document.getElementById('inflationHousing').value = rates.housing || 5.0;
    }
    if (document.getElementById('inflationFood')) {
        document.getElementById('inflationFood').value = rates.food || 6.0;
    }
    if (document.getElementById('inflationTransportation')) {
        document.getElementById('inflationTransportation').value = rates.transportation || 5.5;
    }
    if (document.getElementById('inflationHealthcare')) {
        document.getElementById('inflationHealthcare').value = rates.healthcare || 8.0;
    }
    if (document.getElementById('inflationEducation')) {
        document.getElementById('inflationEducation').value = rates.education || 10.0;
    }
    if (document.getElementById('inflationEntertainment')) {
        document.getElementById('inflationEntertainment').value = rates.entertainment || 5.0;
    }
    if (document.getElementById('inflationShopping')) {
        document.getElementById('inflationShopping').value = rates.shopping || 4.5;
    }
    if (document.getElementById('inflationUtilities')) {
        document.getElementById('inflationUtilities').value = rates.utilities || 4.0;
    }
}

function getInflationRates() {
    return {
        housing: parseFloat(document.getElementById('inflationHousing')?.value) || 5.0,
        food: parseFloat(document.getElementById('inflationFood')?.value) || 6.0,
        transportation: parseFloat(document.getElementById('inflationTransportation')?.value) || 5.5,
        healthcare: parseFloat(document.getElementById('inflationHealthcare')?.value) || 8.0,
        education: parseFloat(document.getElementById('inflationEducation')?.value) || 10.0,
        entertainment: parseFloat(document.getElementById('inflationEntertainment')?.value) || 5.0,
        shopping: parseFloat(document.getElementById('inflationShopping')?.value) || 4.5,
        utilities: parseFloat(document.getElementById('inflationUtilities')?.value) || 4.0
    };
}

function resetFinancialSettings() {
    if (confirm('Reset all financial settings to default values?')) {
        localStorage.removeItem('wealthos_financial_settings');
        loadFinancialSettings();
        showToast('Financial settings reset to defaults!', 'success');
    }
}

// ============================================
// DATA MANAGEMENT SECTION
// ============================================

function exportData(format) {
    try {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `wealthos-export-${timestamp}.${format}`;

        if (format === 'json') {
            const data = {
                profile: getProfile(),
                familyMembers: getFamilyMembers(),
                preferences: getPreferences(),
                financialSettings: getFinancialSettings(),
                user: getCurrentUser(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            downloadBlob(blob, filename);
            showToast('Data exported successfully!', 'success');
        } else if (format === 'csv') {
            // Export family members as CSV
            const members = getFamilyMembers();
            const csv = convertToCSV(members);
            const blob = new Blob([csv], { type: 'text/csv' });
            downloadBlob(blob, `wealthos-family-${timestamp}.csv`);
            showToast('Family data exported as CSV!', 'success');
        }
    } catch (error) {
        console.error('Export error:', error);
        showToast('Error exporting data', 'error');
    }
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(item =>
        headers.map(header => JSON.stringify(item[header] || '')).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (!confirm('This will overwrite your current settings. Continue?')) return;

                if (data.profile) {
                    localStorage.setItem(SETTINGS_KEYS.PROFILE, JSON.stringify(data.profile));
                }
                if (data.familyMembers) {
                    saveFamilyMembers(data.familyMembers);
                }
                if (data.preferences) {
                    localStorage.setItem(SETTINGS_KEYS.PREFERENCES, JSON.stringify(data.preferences));
                }
                if (data.financialSettings) {
                    localStorage.setItem('wealthos_financial_settings', JSON.stringify(data.financialSettings));
                }

                loadAllSettings();
                showToast('Data imported successfully!', 'success');
            } catch (error) {
                console.error('Import error:', error);
                showToast('Error importing data. Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

function downloadBackup() {
    exportData('json');
}

function resetSampleData() {
    if (!confirm('This will replace your current data with sample data. Continue?')) return;

    // Clear existing data
    localStorage.removeItem(SETTINGS_KEYS.PROFILE);
    localStorage.removeItem(SETTINGS_KEYS.FAMILY_MEMBERS);
    localStorage.removeItem(SETTINGS_KEYS.PREFERENCES);
    localStorage.removeItem('wealthos_financial_settings');

    // Reload defaults
    loadAllSettings();
    showToast('Sample data restored successfully!', 'success');
}

function confirmClearData() {
    const confirmed = confirm('WARNING: This will permanently delete all your settings data. This action cannot be undone. Are you absolutely sure?');

    if (!confirmed) return;

    const doubleConfirm = prompt('Type DELETE to confirm:');
    if (doubleConfirm !== 'DELETE') {
        showToast('Data clear cancelled', 'error');
        return;
    }

    // Clear all settings data
    localStorage.removeItem(SETTINGS_KEYS.PROFILE);
    localStorage.removeItem(SETTINGS_KEYS.FAMILY_MEMBERS);
    localStorage.removeItem(SETTINGS_KEYS.PREFERENCES);
    localStorage.removeItem('wealthos_financial_settings');

    showToast('All settings data cleared!', 'success');

    // Reload page after 1 second
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function getStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return {
        used: (total / 1024).toFixed(2),
        usedMB: (total / 1024 / 1024).toFixed(2),
        percentage: ((total / (10 * 1024 * 1024)) * 100).toFixed(1)
    };
}

// ============================================
// SECURITY SECTION
// ============================================

function openChangePasswordModal() {
    document.getElementById('passwordModal').classList.add('active');
}

function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
    document.getElementById('passwordForm').reset();
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters long', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    // Get current user
    const user = getCurrentUser();
    if (!user) {
        showToast('User not found', 'error');
        return;
    }

    // Verify current password
    if (user.password !== currentPassword) {
        showToast('Current password is incorrect', 'error');
        return;
    }

    // Update password
    const users = JSON.parse(localStorage.getItem('wealthos_user') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        users[userIndex].passwordLastChanged = new Date().toISOString();
        localStorage.setItem('wealthos_user', JSON.stringify(users));

        closePasswordModal();
        showToast('Password updated successfully!', 'success');
    } else {
        showToast('Error updating password', 'error');
    }
}

function confirmDeleteAccount() {
    const confirmed = confirm('WARNING: This will permanently delete your account and all data. This action cannot be undone. Are you absolutely sure?');

    if (!confirmed) return;

    const password = prompt('Enter your password to confirm account deletion:');
    if (!password) {
        showToast('Account deletion cancelled', 'error');
        return;
    }

    const user = getCurrentUser();
    if (user.password !== password) {
        showToast('Incorrect password', 'error');
        return;
    }

    // Clear all data
    localStorage.clear();
    showToast('Account deleted successfully. Redirecting...', 'success');

    setTimeout(() => {
        window.location.href = 'signup.html';
    }, 2000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function loadAllSettings() {
    loadProfileSettings();
    loadFamilyMembers();
    loadPreferences();
    loadFinancialSettings();

    // Update storage usage
    const usage = getStorageUsage();
    const usageElement = document.querySelector('.settings-item-description');
    if (usageElement && usageElement.textContent.includes('MB')) {
        usageElement.textContent = `${usage.usedMB} MB of 10 MB available`;
    }
    const percentageElement = document.querySelector('.settings-item-control span[style*="font-weight: 700"]');
    if (percentageElement && percentageElement.textContent.includes('%')) {
        percentageElement.textContent = usage.percentage + '%';

        // Update color based on usage
        if (parseFloat(usage.percentage) > 80) {
            percentageElement.style.color = 'var(--error)';
        } else if (parseFloat(usage.percentage) > 50) {
            percentageElement.style.color = 'var(--warning)';
        } else {
            percentageElement.style.color = 'var(--success)';
        }
    }
}

function attachEventListeners() {
    // Profile save button
    const profileSaveBtn = document.querySelector('#profile-section .btn-primary');
    if (profileSaveBtn) {
        profileSaveBtn.onclick = saveProfile;
    }

    // Preferences save button
    const prefSaveBtn = document.querySelector('#preferences-section .btn-primary');
    if (prefSaveBtn) {
        prefSaveBtn.onclick = savePreferences;
    }

    // Financial settings save button
    const finSaveBtn = document.querySelector('#financial-section .btn-primary');
    if (finSaveBtn) {
        finSaveBtn.onclick = saveFinancialSettings;
    }

    // Risk profile cards
    document.querySelectorAll('.risk-profile-card').forEach(card => {
        card.onclick = function() {
            selectRiskProfile(this.dataset.profile);
        };
    });
}

function getAvatarStyle(index) {
    const gradients = [
        'background: linear-gradient(135deg, #0066ff 0%, #00d4ff 100%);',
        'background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);',
        'background: linear-gradient(135deg, #00C805 0%, #22c55e 100%);',
        'background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);',
        'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);'
    ];
    return gradients[index % gradients.length];
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    toastMessage.textContent = message;
    toastIcon.textContent = type === 'success' ? '✓' : '⚠️';

    toast.className = 'toast ' + type;
    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
