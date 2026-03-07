# Quick Reference: Logout Functionality

## Visual Structure

```
┌─────────────────────────────────────────────┐
│  WealthOS Page Header                   [M] │ ← User Avatar
└─────────────────────────────────────────────┘
                                            │
                                            ▼
                              ┌─────────────────────┐
                              │  Manish Reddy       │
                              │  user@email.com     │
                              ├─────────────────────┤
                              │ ⚙️  Settings        │
                              │ 👁️  View Demo      │
                              │ 🚪  Logout          │
                              └─────────────────────┘
                                 Dropdown Menu
```

## User Flow

1. **Initial State**
   - User avatar visible in top-right
   - Shows first letter of user name
   - Gradient background (blue)

2. **Click Avatar**
   - Dropdown menu slides down
   - Shows user information
   - Displays menu options

3. **Click Logout**
   - Confirmation dialog appears
   - User confirms or cancels

4. **After Confirmation**
   - Session cleared
   - Redirected to login.html

## Key Features

### User Avatar
- **Color**: Blue gradient (#0066ff → #00d4ff)
- **Size**: 40x40px
- **Shape**: Circle
- **Content**: First letter of name (e.g., "M")
- **Position**: Top-right corner

### Dropdown Menu
- **Width**: 240px (desktop), 200px (mobile)
- **Animation**: Slide down + fade in
- **Position**: Below avatar, right-aligned
- **Close**: Click outside or select item

### Menu Items
1. **Settings** → settings.html
2. **View Demo Account** → demo-account.html (new tab)
3. **Logout** → Confirmation → login.html

## Code Snippets

### Get Current User
```javascript
const user = getCurrentUser();
// Returns: { userName, email, ... }
```

### Logout User
```javascript
handleLogout();
// Shows confirmation, then calls logout()
```

### Toggle Menu
```javascript
toggleUserMenu();
// Opens or closes the dropdown
```

## Files Location

```
code/
├── user-menu.js           ← Menu logic
├── user-menu.css          ← Menu styles
├── auth.js                ← Login/logout logic
└── [all main pages].html  ← Include user menu
```

## Quick Test

1. Open any main page (e.g., dashboard.html)
2. Click user avatar (top-right)
3. Verify dropdown opens
4. Click logout
5. Confirm dialog appears
6. Verify redirect to login.html

## Customization

### Change Avatar Color
Edit `user-menu.css`:
```css
.user-avatar {
    background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### Add Menu Item
Add to HTML:
```html
<a href="your-page.html" class="user-menu-item">
    <span class="user-menu-item-icon">🔗</span>
    <span>Your Link</span>
</a>
```

### Modify Confirmation Message
Edit `user-menu.js`:
```javascript
if (confirm('Your custom message here')) {
    logout();
}
```

## Troubleshooting

### Avatar not showing?
- Check if `user-menu.css` is linked
- Verify user avatar CSS exists
- Check console for errors

### Dropdown not opening?
- Verify `user-menu.js` is loaded
- Check if user avatar has correct ID
- Look for JavaScript errors

### User data not displaying?
- Ensure user is logged in
- Check `getCurrentUser()` returns data
- Verify script initialization runs

### Logout not working?
- Check `auth.js` is loaded
- Verify `logout()` function exists
- Check localStorage permissions

## All Pages with Logout

- ✅ dashboard.html
- ✅ portfolio.html
- ✅ monthly-tracker.html
- ✅ savings-plan.html
- ✅ goals.html
- ✅ financial-planning.html
- ✅ settings.html
- ✅ demo-account.html

## Status: ✅ Complete

All functionality implemented and tested!
