#!/usr/bin/env python3
"""
Script to add user menu to all WealthOS pages
"""

import os
import re

# List of pages to update
PAGES = [
    'portfolio.html',
    'monthly-tracker.html',
    'savings-plan.html',
    'goals.html',
    'financial-planning.html',
    'settings.html',
    'demo-account.html'
]

USER_MENU_HTML = '''
                        <div class="user-menu-dropdown" id="userMenuDropdown">
                            <div class="user-menu-header">
                                <div class="user-menu-name" id="userMenuName">Loading...</div>
                                <div class="user-menu-email" id="userMenuEmail">Loading...</div>
                            </div>
                            <div class="user-menu-items">
                                <a href="settings.html" class="user-menu-item">
                                    <span class="user-menu-item-icon">⚙️</span>
                                    <span>Settings</span>
                                </a>
                                <a href="demo-account.html" target="_blank" class="user-menu-item">
                                    <span class="user-menu-item-icon">👁️</span>
                                    <span>View Demo Account</span>
                                </a>
                                <div class="user-menu-item logout" onclick="handleLogout()">
                                    <span class="user-menu-item-icon">🚪</span>
                                    <span>Logout</span>
                                </div>
                            </div>
                        </div>'''

USER_MENU_SCRIPT = '''    <script src="user-menu.js"></script>
    <script>
        // Initialize user menu with user data
        document.addEventListener('DOMContentLoaded', () => {
            const user = getCurrentUser();
            if (user) {
                const nameEl = document.getElementById('userMenuName');
                const emailEl = document.getElementById('userMenuEmail');
                if (nameEl) nameEl.textContent = user.userName || user.familyName || 'User';
                if (emailEl) emailEl.textContent = user.email || '';

                // Update user avatar initial
                const avatarEl = document.querySelector('.user-avatar');
                if (avatarEl) {
                    const initial = user.userName ? user.userName.charAt(0).toUpperCase() :
                                   user.email ? user.email.charAt(0).toUpperCase() : 'U';
                    const firstChild = avatarEl.childNodes[0];
                    if (firstChild && firstChild.nodeType === 3) {
                        firstChild.textContent = initial;
                    }
                }
            }
        });
    </script>'''

def add_css_link(content):
    """Add user-menu.css link to head"""
    # Check if already added
    if 'user-menu.css' in content:
        print("  ✓ CSS already added")
        return content

    # Find the fonts.googleapis link and add after it
    pattern = r'(<link href="https://fonts\.googleapis\.com/css2.*?rel="stylesheet">)'
    replacement = r'\1\n    <link rel="stylesheet" href="user-menu.css">'

    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        print("  ✓ Added CSS link")
        return new_content

    print("  ⚠ Could not add CSS link")
    return content

def add_user_menu_html(content):
    """Add user menu HTML to user avatar"""
    # Check if already added
    if 'userMenuDropdown' in content:
        print("  ✓ User menu HTML already added")
        return content

    # Find user-avatar and add menu dropdown
    # Look for pattern: <div class="user-avatar">M</div>
    pattern = r'(<div class="user-avatar">)(M|U)(<\/div>)'
    replacement = r'\1\2' + USER_MENU_HTML + r'\n                    \3'

    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        print("  ✓ Added user menu HTML")
        return new_content

    print("  ⚠ Could not add user menu HTML - user-avatar not found")
    return content

def add_user_menu_scripts(content):
    """Add user menu scripts before </body>"""
    # Check if already added
    if 'user-menu.js' in content:
        print("  ✓ Scripts already added")
        return content

    # Find </body> and add scripts before it
    pattern = r'(<\/body>)'
    replacement = USER_MENU_SCRIPT + r'\n\1'

    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        print("  ✓ Added scripts")
        return new_content

    print("  ⚠ Could not add scripts")
    return content

def process_file(filepath):
    """Process a single HTML file"""
    print(f"\nProcessing {os.path.basename(filepath)}...")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Add CSS link
        content = add_css_link(content)

        # Add user menu HTML
        content = add_user_menu_html(content)

        # Add scripts
        content = add_user_menu_scripts(content)

        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Updated successfully")
        else:
            print(f"  ℹ️  No changes needed")

        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("Adding User Menu to WealthOS Pages")
    print("=" * 60)

    script_dir = os.path.dirname(os.path.abspath(__file__))

    success_count = 0
    for page in PAGES:
        filepath = os.path.join(script_dir, page)
        if os.path.exists(filepath):
            if process_file(filepath):
                success_count += 1
        else:
            print(f"\n⚠️  {page} not found")

    print("\n" + "=" * 60)
    print(f"Completed: {success_count}/{len(PAGES)} files updated")
    print("=" * 60)

if __name__ == '__main__':
    main()
