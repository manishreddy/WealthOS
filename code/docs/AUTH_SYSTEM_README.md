# WealthOS Authentication System

## Overview

The WealthOS authentication system provides a complete user registration, login, and session management solution with a professional onboarding experience.

## Files Created

### 1. **index.html** (Landing Page)
- **Location**: `/Prototype/index.html`
- **Purpose**: Main entry point for WealthOS
- **Features**:
  - Beautiful gradient design with Option 2 light theme
  - WealthOS logo and tagline
  - Brief description of the platform
  - "Get Started" (signup) and "Sign In" (login) buttons
  - Feature highlights (Portfolio, Expenses, Goals, AI)
  - Link to view design prototypes
  - Auto-redirects to dashboard if already logged in

### 2. **login.html**
- **Location**: `/Prototype/login.html`
- **Purpose**: User login page
- **Features**:
  - Email and password inputs
  - "Remember me" checkbox (extends session to 30 days)
  - "Forgot password?" link (placeholder)
  - Form validation with error messages
  - Success message display (after signup)
  - Links to signup page and home
  - Clean centered card design
  - Auto-redirects to dashboard if already logged in

### 3. **signup.html**
- **Location**: `/Prototype/signup.html`
- **Purpose**: New user registration
- **Features**:
  - Family name and user name fields
  - Email address field with validation
  - Password field with strength indicator
  - Confirm password field with match validation
  - Terms & conditions checkbox
  - Real-time form validation
  - Password strength meter (weak/medium/strong)
  - Links to login page and home
  - Auto-redirects to onboarding after successful signup

### 4. **onboarding.html**
- **Location**: `/Prototype/onboarding.html`
- **Purpose**: First-time user setup wizard
- **Features**:
  - **Step 1: Family Members**
    - Add family members with names and relationships
    - Dynamic member list with remove option
    - Member avatars with initials
  - **Step 2: Risk Profile**
    - Choose risk tolerance: Conservative, Moderate, or Aggressive
    - Visual selection cards with descriptions
  - **Step 3: Financial Goals**
    - Select from goal templates (retirement, education, home, emergency, vacation)
    - Multi-select capability
  - Progress indicator showing current step
  - Back/Continue navigation
  - "Skip for now" option to go directly to dashboard
  - Data saved to user profile via localStorage

### 5. **auth.js**
- **Location**: `/code/auth.js` and `/Prototype/auth.js`
- **Purpose**: Authentication utility library
- **Functions**:

#### `isLoggedIn()`
- Checks if user has valid session
- Validates session expiration (24 hours default)
- Returns boolean

#### `login(email, password, rememberMe)`
- Authenticates user credentials
- Creates session token
- Session duration: 24 hours (default) or 30 days (if rememberMe)
- Returns: `{ success: boolean, message: string, user: object }`

#### `signup(userData)`
- Registers new user
- Validates email format and password strength
- Checks for duplicate emails
- Auto-logs in after successful signup
- Returns: `{ success: boolean, message: string, user: object }`

#### `logout()`
- Clears session
- Redirects to login page

#### `getCurrentUser()`
- Returns current logged-in user object
- Returns null if not logged in

#### `updateUser(updates)`
- Updates user data in localStorage
- Returns boolean success status

#### `completeOnboarding(onboardingData)`
- Saves onboarding data to user profile
- Marks onboarding as complete

## Protected Pages

The following pages are protected and require authentication:
- `/code/dashboard.html`
- `/code/portfolio.html`
- `/code/goals.html`
- `/code/settings.html`
- `/code/wealthbot.html`

All protected pages include `<script src="auth.js"></script>` which automatically:
1. Checks if user is logged in on page load
2. Redirects to login page if session is invalid or expired
3. Allows access if user has valid session

## Data Storage

### localStorage Keys:

1. **wealthos_user** (array)
   - Stores all registered users
   - Structure:
   ```javascript
   {
     id: "user_123456789",
     familyName: "Smith Family",
     userName: "John Smith",
     email: "john@example.com",
     password: "********", // In production, should be hashed
     createdAt: "2024-02-17T...",
     onboardingComplete: false,
     familyMembers: [],
     riskProfile: null,
     financialGoals: []
   }
   ```

2. **wealthos_session** (object)
   - Stores current session data
   - Structure:
   ```javascript
   {
     userId: "user_123456789",
     email: "john@example.com",
     loginTime: 1708128000000,
     expiresAt: 1708214400000
   }
   ```

## User Flow

### New User Journey:
1. Visit `index.html`
2. Click "Get Started"
3. Fill signup form at `signup.html`
4. Account created → Auto-login
5. Redirected to `onboarding.html`
6. Complete 3-step onboarding (or skip)
7. Redirected to `dashboard.html`

### Returning User Journey:
1. Visit `index.html`
2. Click "Sign In"
3. Enter credentials at `login.html`
4. Successful login
5. Redirected to `dashboard.html`

### Session Persistence:
- Users remain logged in for 24 hours (default)
- "Remember me" extends to 30 days
- Session automatically expires after duration
- Auto-redirects to login when accessing protected pages

## Security Notes

### Current Implementation (Demo):
- Passwords stored in plain text in localStorage
- No server-side validation
- No HTTPS requirement
- Session tokens are simple JSON objects

### Production Recommendations:
1. **Password Security**:
   - Hash passwords using bcrypt or Argon2
   - Never store plain text passwords
   - Implement password reset functionality

2. **Session Management**:
   - Use JWT tokens or secure session cookies
   - Implement refresh tokens
   - Server-side session validation

3. **Data Storage**:
   - Move user data to backend database
   - Use secure API endpoints
   - Implement proper authentication middleware

4. **Transport Security**:
   - Require HTTPS in production
   - Implement CSRF protection
   - Add rate limiting on auth endpoints

5. **Additional Features**:
   - Email verification
   - Two-factor authentication (2FA)
   - Password recovery via email
   - Account lockout after failed attempts
   - Login activity tracking

## Testing

### Test User Creation:
1. Open `signup.html`
2. Create test account:
   - Family Name: "Test Family"
   - User Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Check "I agree" checkbox
3. Click "Create Account"

### Test Login:
1. Open `login.html`
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
3. Optional: Check "Remember me"
4. Click "Sign In"

### Test Session:
1. After login, verify redirect to dashboard
2. Open browser DevTools → Application → Local Storage
3. Check `wealthos_session` key exists
4. Navigate to other protected pages (should work)
5. Clear `wealthos_session` from localStorage
6. Try to access protected page (should redirect to login)

## File Structure

```
WealthOS/
├── Prototype/
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── signup.html             # Sign up page
│   ├── onboarding.html         # Onboarding wizard
│   ├── auth.js                 # Auth utility
│   ├── index-prototypes.html   # Design prototype selector
│   └── [other prototype files]
├── code/
│   ├── auth.js                 # Auth utility (copy)
│   ├── dashboard.html          # Protected
│   ├── portfolio.html          # Protected
│   ├── goals.html              # Protected
│   ├── settings.html           # Protected
│   └── wealthbot.html          # Protected
└── AUTH_SYSTEM_README.md       # This file
```

## Browser Compatibility

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- localStorage support
- ES6 JavaScript features
- CSS Grid and Flexbox

## Customization

### Change Session Duration:
Edit `auth.js`:
```javascript
const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
// Change to desired duration in milliseconds
```

### Add More Onboarding Steps:
1. Add step to `onboarding.html`
2. Update progress indicator
3. Add step navigation logic
4. Update `completeOnboarding()` to save new data

### Customize Validation:
Edit validation functions in respective pages:
- Email: `isValidEmail(email)`
- Password: `calculatePasswordStrength(password)`
- Add custom rules as needed

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Clear localStorage and try again
4. Check this README for troubleshooting

## Future Enhancements

Planned features:
- [ ] Backend API integration
- [ ] Password reset via email
- [ ] Social login (Google, Apple)
- [ ] Two-factor authentication
- [ ] Account settings page
- [ ] Login history
- [ ] Session management dashboard
- [ ] Multi-device logout
