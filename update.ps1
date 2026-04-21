$sidebarHtml = @'
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
'@

$menuBtn = '<button class="back-btn floating-menu-btn" onclick="openSidebar()" aria-label="Menu"><span class="material-symbols-rounded">menu</span></button>'
$replacementBtn = '<button class="back-btn" onclick="openSidebar()" aria-label="Menu"><span class="material-symbols-rounded">menu</span></button>'

$regexPattern = '(?i)<a\s+href="[^"]*"\s+class="back-btn"[^>]*>\s*<span class="material-symbols-rounded">arrow_back</span>\s*</a>'

Get-ChildItem -Filter *.html | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)

    # 1. Inject Sidebar
    if ($content -notmatch 'id="globalSidebar"') {
        $content = $content -replace "</body>", $sidebarHtml
    }

    # 2. Replace existing back buttons
    $content = [regex]::Replace($content, $regexPattern, $replacementBtn)

    # 3. Add floating button explicitly for index.html if no topbar
    if ($_.Name -eq "index.html" -and $content -notmatch "floating-menu-btn") {
        $content = $content -replace '<div class="glow-orb"></div>', "<div class=`"glow-orb`"></div>`t$menuBtn"
    }

    [System.IO.File]::WriteAllText($_.FullName, $content, [System.Text.Encoding]::UTF8)
}

Write-Host "Updated all HTML files"
