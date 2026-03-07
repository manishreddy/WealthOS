#!/usr/bin/env python3
"""
Script to add user avatar HTML to remaining pages
"""

import os
import re

# Pages that still need user avatar HTML
PAGES = {
    'goals.html': {
        'search': r'(<div class="top-actions">)',
        'replacement': r'<div class="user-avatar">M\n                        <div class="user-menu-dropdown" id="userMenuDropdown">\n                            <div class="user-menu-header">\n                                <div class="user-menu-name" id="userMenuName">Loading...</div>\n                                <div class="user-menu-email" id="userMenuEmail">Loading...</div>\n                            </div>\n                            <div class="user-menu-items">\n                                <a href="settings.html" class="user-menu-item">\n                                    <span class="user-menu-item-icon">⚙️</span>\n                                    <span>Settings</span>\n                                </a>\n                                <a href="demo-account.html" target="_blank" class="user-menu-item">\n                                    <span class="user-menu-item-icon">👁️</span>\n                                    <span>View Demo Account</span>\n                                </a>\n                                <div class="user-menu-item logout" onclick="handleLogout()">\n                                    <span class="user-menu-item-icon">🚪</span>\n                                    <span>Logout</span>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    \1'
    },
    'financial-planning.html': {
        'search': r'(<div class="top-actions">)',
        'replacement': r'<div class="user-avatar">M\n                        <div class="user-menu-dropdown" id="userMenuDropdown">\n                            <div class="user-menu-header">\n                                <div class="user-menu-name" id="userMenuName">Loading...</div>\n                                <div class="user-menu-email" id="userMenuEmail">Loading...</div>\n                            </div>\n                            <div class="user-menu-items">\n                                <a href="settings.html" class="user-menu-item">\n                                    <span class="user-menu-item-icon">⚙️</span>\n                                    <span>Settings</span>\n                                </a>\n                                <a href="demo-account.html" target="_blank" class="user-menu-item">\n                                    <span class="user-menu-item-icon">👁️</span>\n                                    <span>View Demo Account</span>\n                                </a>\n                                <div class="user-menu-item logout" onclick="handleLogout()">\n                                    <span class="user-menu-item-icon">🚪</span>\n                                    <span>Logout</span>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    \1'
    }
}

USER_AVATAR_CSS = '''
        /* User Avatar */
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.875rem;
            color: #ffffff;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .user-avatar:hover {
            transform: scale(1.05);
        }
'''

def add_user_avatar_css(content):
    """Add user avatar CSS if not present"""
    if '.user-avatar {' in content:
        print("  ✓ CSS already added")
        return content

    # Find .top-actions and add CSS before it
    pattern = r'(\.top-actions \{)'
    replacement = USER_AVATAR_CSS + r'\n        \1'

    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        print("  ✓ Added CSS")
        return new_content

    print("  ⚠ Could not add CSS")
    return content

def add_user_avatar_html(content, page_config):
    """Add user avatar HTML"""
    if 'userMenuDropdown' in content:
        print("  ✓ HTML already added")
        return content

    new_content = re.sub(page_config['search'], page_config['replacement'], content, count=1)
    if new_content != content:
        print("  ✓ Added HTML")
        return new_content

    print("  ⚠ Could not add HTML")
    return content

def process_file(filepath, page_config):
    """Process a single file"""
    print(f"\nProcessing {os.path.basename(filepath)}...")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Add CSS
        content = add_user_avatar_css(content)

        # Add HTML
        content = add_user_avatar_html(content, page_config)

        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Updated successfully")
            return True
        else:
            print(f"  ℹ️  No changes needed")
            return False

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("Adding User Avatar to Remaining Pages")
    print("=" * 60)

    script_dir = os.path.dirname(os.path.abspath(__file__))

    for page, config in PAGES.items():
        filepath = os.path.join(script_dir, page)
        if os.path.exists(filepath):
            process_file(filepath, config)
        else:
            print(f"\n⚠️  {page} not found")

    print("\n" + "=" * 60)
    print("Completed")
    print("=" * 60)

if __name__ == '__main__':
    main()
