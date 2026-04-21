$newSidebarHtml = @'
<!-- Global Sidebar Menu -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
<div class="global-sidebar" id="globalSidebar">
  <div class="sidebar-header">
    <div class="sidebar-brand">Becca's Surrender</div>
  </div>
  <div class="sidebar-nav">
    <a href="index.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">home</span> Home</a>
    <a href="scene-menu.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">theater_comedy</span> Scene Menu</a>
    <a href="training-menu.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">fitness_center</span> Training Programs</a>
    <a href="assessment-menu.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">assignment</span> Assessments & Ratings</a>
    <a href="public-game.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">casino</span> Sir's Public Tasks</a>
    <a href="bdsm-checklist.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">fact_check</span> BDSM Checklists</a>
    <a href="help.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon">help</span> Help & Info</a>
    <a href="settings.html" class="sidebar-link"><span class="material-symbols-rounded sidebar-icon" style="color:var(--gold);">settings</span> Settings</a>
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
'@

$utf8NoBom = New-Object System.Text.UTF8Encoding($False)

Get-ChildItem -Filter *.html | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)

    if ($content -match '(?s)<!-- Global Sidebar Menu -->.*</body>') {
        $content = $content -replace '(?s)<!-- Global Sidebar Menu -->.*</body>', $newSidebarHtml
    } else {
        $content = $content -replace '</body>', $newSidebarHtml
    }
    
    # Just in case settings.html doesn't have the button replaced yet:
    $content = [regex]::Replace($content, '(?i)<a\s+href="[^"]*"\s+class="back-btn"[^>]*>\s*<span class="material-symbols-rounded">arrow_back</span>\s*</a>', '<button class="back-btn" onclick="openSidebar()" aria-label="Menu"><span class="material-symbols-rounded">menu</span></button>')

    [System.IO.File]::WriteAllText($_.FullName, $content, $utf8NoBom)
}

Write-Host "Replaced all Sidebars successfully."
