# WealthOS Authentication - Quick Reference Card

## 🚀 Start Here

**Open**: `/Prototype/index.html` in your browser

## 📍 Key File Locations

| File | Location | Purpose |
|------|----------|---------|
| Landing Page | `/Prototype/index.html` | Entry point |
| Login | `/Prototype/login.html` | User login |
| Sign Up | `/Prototype/signup.html` | Registration |
| Onboarding | `/Prototype/onboarding.html` | Setup wizard |
| Auth Library | `/Prototype/auth.js` | Auth functions |
| Dashboard | `/code/dashboard.html` | Protected page |

## 🔑 Auth Functions (auth.js)

```javascript
// Check if logged in
isLoggedIn() → boolean

// Login user
login(email, password, rememberMe) → { success, message, user }

// Sign up new user
signup(userData) → { success, message, user }

// Logout user
logout() → redirects to login

// Get current user
getCurrentUser() → user object or null

// Update user data
updateUser(updates) → boolean

// Complete onboarding
completeOnboarding(data) → boolean
```

## 💾 localStorage Keys

```javascript
// All users
localStorage.getItem('wealthos_user')

// Current session
localStorage.getItem('wealthos_session')

// Clear everything
localStorage.clear()
```

## 🔒 Protected Pages

- `/code/dashboard.html`
- `/code/portfolio.html`
- `/code/goals.html`
- `/code/settings.html`
- `/code/wealthbot.html`

**All auto-redirect to login if not authenticated**

## 🎨 Design Theme

**Colors**:
- Primary: `#0066ff → #00d4ff`
- Background: `#e3e7f5 → #f0f4ff`
- Text: `#1a1a1a`, `#666`
- Error: `#ff3b30`
- Success: `#00C805`

**Fonts**:
- Headings: Space Grotesk
- Body: DM Sans

## 🧪 Quick Test

1. Open `/Prototype/index.html`
2. Click "Get Started"
3. Create account:
   - Family: "Test Family"
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Complete onboarding or skip
5. Access dashboard
6. Test protected pages

## 🔍 Debug in Browser

**Open DevTools** (F12):
```
Application → Local Storage

View users:
  → wealthos_user

View session:
  → wealthos_session

Clear data:
  → Right-click → Clear
```

## ⏱️ Session Duration

- Default: **24 hours**
- With "Remember me": **30 days**
- Auto-expires and redirects to login

## 📝 User Data Structure

```json
{
  "id": "user_1234567890",
  "familyName": "Smith Family",
  "userName": "John Smith",
  "email": "john@example.com",
  "password": "********",
  "onboardingComplete": true,
  "familyMembers": [
    { "name": "Jane", "relation": "spouse" }
  ],
  "riskProfile": "moderate",
  "financialGoals": ["retirement", "education"]
}
```

## 🛠️ Common Tasks

### Add logout button to a page:
```html
<button onclick="logout()">Logout</button>
<script src="auth.js"></script>
```

### Display current user name:
```javascript
const user = getCurrentUser();
if (user) {
  console.log('Logged in as:', user.userName);
}
```

### Check if user completed onboarding:
```javascript
const user = getCurrentUser();
if (user && !user.onboardingComplete) {
  window.location.href = 'onboarding.html';
}
```

### Manually expire session:
```javascript
// In DevTools Console
localStorage.removeItem('wealthos_session');
location.reload(); // Will redirect to login
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Check email exists in localStorage |
| Redirect loop | Clear localStorage and start fresh |
| Session expired | Login again |
| Protected page access | Must be logged in |
| Onboarding skips | Normal - it's optional |

## 📚 Documentation Files

- **AUTH_IMPLEMENTATION_SUMMARY.md** - Complete overview
- **AUTH_SYSTEM_README.md** - Technical documentation
- **AUTHENTICATION_SETUP.md** - Setup guide
- **FILE_STRUCTURE.txt** - File organization
- **QUICK_REFERENCE.md** - This card

## ✅ Implementation Checklist

- [x] Landing page
- [x] Login page
- [x] Sign up page
- [x] Onboarding wizard
- [x] Auth library (auth.js)
- [x] Protected pages (5 pages)
- [x] Session management
- [x] Auto-redirects
- [x] Form validation
- [x] Password strength
- [x] Error handling
- [x] Mobile responsive
- [x] Documentation

## 🎯 Features

### Landing Page
- Call-to-action buttons
- Feature highlights
- Auto-redirect if logged in

### Sign Up
- Family & user names
- Email validation
- Password strength meter
- Real-time validation

### Login
- Email/password
- Remember me (30 days)
- Error messages

### Onboarding
- 3-step wizard
- Add family members
- Risk profile
- Financial goals
- Skip option

### Auth System
- Session management
- Auto-expiration
- Protected pages
- User data storage

## 🔐 Security Notes

**Current (Demo)**:
- localStorage storage
- Plain text passwords
- Client-side only

**For Production**:
- Hash passwords (bcrypt)
- Backend database
- JWT tokens
- HTTPS only
- Email verification
- 2FA option

## 📱 Mobile Support

All pages are mobile responsive:
- Breakpoint: 600px
- Touch-friendly buttons
- Readable fonts
- Proper spacing

## ⚡ Performance

- No external dependencies
- Inline CSS
- Fast localStorage
- Smooth animations
- Preconnected fonts

---

## 🎉 Status

**✅ Complete and Ready to Use**

**Last Updated**: February 17, 2024

**Questions?** See full documentation files.
