import os
import re

directory = r"c:\Windows\full-app"

for filename in os.listdir(directory):
    if not filename.endswith('.html'):
        continue

    filepath = os.path.join(directory, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Determine data-nav value
    nav_val = 'more'
    if filename == 'index.html':
        nav_val = 'home'
    elif filename in ['scene-menu.html', 'scene-menu-v2.html']:
        nav_val = 'scenes'
    elif filename == 'training-menu.html' or filename.endswith('-training.html'):
        nav_val = 'training'
    elif filename == 'toy-vault.html':
        nav_val = 'vault'

    # 2. Add nav.css to <head> if missing
    if 'href="nav.css"' not in content:
        content = re.sub(r'(?i)(</head>)', r'<link rel="stylesheet" href="nav.css" />\n\1', content, count=1)

    # 3. Add or update data-nav in <body>
    def update_body(match):
        attrs = match.group(1)
        # Remove existing data-nav if present
        attrs = re.sub(r'(?i)\s*data-nav=(["\'])[^\1]*?\1', '', attrs)
        # Add new data-nav
        return f'<body{attrs} data-nav="{nav_val}">'

    content = re.sub(r'(?i)<body([^>]*)>', update_body, content, count=1)

    # 4. Add nav.js before </body> if missing
    if 'src="nav.js"' not in content:
        content = re.sub(r'(?i)(</body>)', r'<!-- nav.js injects the nav bar, overlay and More sheet automatically -->\n<script src="nav.js"></script>\n\1', content, count=1)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Skipped {filename} (already updated)")

print("Done.")
