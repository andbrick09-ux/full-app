import os
import re

sidebar_html = """
<!-- Global Sidebar Menu -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
<div class="global-sidebar" id="globalSidebar">
  <div class="sidebar-header">
    <div class="sidebar-brand">Dom Sub Hub</div>
  </div>
  <div class="sidebar-nav">
    <a href="index.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">home</span> Home</a>
    <a href="scene-menu.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">theater_comedy</span> Scene Menu</a>
    <a href="training-menu.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">fitness_center</span> Training Programs</a>
    <a href="assessment-menu.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">assignment</span> Assessments & Ratings</a>
    <a href="public-game.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">casino</span> Sir's Public Tasks</a>
    <a href="bdsm-checklist.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">settings</span> Profile & Settings</a>
    <a href="help.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">help</span> Help & Info</a>
  </div>
</div>
<script>
  function openSidebar() {
    document.getElementById('sidebarOverlay').classList.add('open');
    document.getElementById('globalSidebar').classList.add('open');
  }
  function closeSidebar() {
    document.getElementById('sidebarOverlay').classList.remove('open');
    document.getElementById('globalSidebar').classList.remove('open');
  }
</script>
</body>
"""

floating_btn = """<button class="back-btn floating-menu-btn" onclick="openSidebar()" aria-label="Menu">
      <span class="material-symbols-rounded">menu</span>
    </button>"""

directory = "."

files_changed = 0

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Inject sidebar HTML if not present
        if "id=\"globalSidebar\"" not in content:
            content = content.replace("</body>", sidebar_html)
        
        # 2. Replace top-left back button
        # Example pattern:
        # <a href="index.html" class="back-btn" aria-label="Back">
        #   <span class="material-symbols-rounded">arrow_back</span>
        # </a>
        pattern = re.compile(r'<a\s+href="[^"]*"\s+class="back-btn"[^>]*>\s*<span class="material-symbols-rounded">arrow_back</span>\s*</a>', re.IGNORECASE)
        replacement = """<button class="back-btn" onclick="openSidebar()" aria-label="Menu">
    <span class="material-symbols-rounded">menu</span>
  </button>"""
        content = pattern.sub(replacement, content)
        
        # 3. For index.html, inject floating button if it doesn't have a topbar
        if filename == "index.html" and "floating-menu-btn" not in content:
            # Put it right after <div class="glow-orb"></div>
            content = content.replace('<div class="glow-orb"></div>', f'<div class="glow-orb"></div>\n  {floating_btn}')

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            files_changed += 1
            print(f"Updated {filename}")

print(f"Update complete. Changed {files_changed} files.")
