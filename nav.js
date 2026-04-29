/**
 * ============================================================
 * DOM SUB HUB — nav.js
 * Injects the bottom nav, overlay, and More sheet into every
 * page automatically. Include once before </body>:
 * <script src="nav.js"></script>
 *
 * To set the active tab, add data-nav="X" to <body>:
 * home     → index.html
 * tasks    → tasks.html
 * scenes   → scene-menu.html
 * training → training-menu.html + all training sub-pages
 * more     → everything else
 * ============================================================
 */
(function () {

  /* ── 1. Nav link definitions ─────────────────────────────
     To add/remove/reorder tabs: edit NAV_TABS.
     To add/remove More sheet links: edit MORE_ITEMS.
     ──────────────────────────────────────────────────────── */

  var NAV_TABS = [
    {
      page: 'home',
      href: 'index.html',
      label: 'Home',
      isButton: false,
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"/><path d="M9 21V13h6v8"/></svg>'
    },
    {
      page: 'tasks',
      href: 'tasks.html',
      label: 'Tasks',
      isButton: false,
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>'
    },
    {
      page: 'scenes',
      href: 'scene-menu.html',
      label: 'Scenes',
      isButton: false,
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>'
    },
    {
      page: 'training',
      href: 'training-menu.html',
      label: 'Training',
      isButton: false,
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>'
    },
    {
      page: 'more',
      href: null,
      label: 'More',
      isButton: true,
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>'
    }
  ];

  var MORE_ITEMS = [
    { href: 'toy-vault.html',       icon: '🔒', label: 'Toy Vault' },
    { href: 'assessment-menu.html', icon: '📊', label: 'Assessments &amp; Ratings' },
    { href: 'public-game.html',     icon: '🏛️', label: "Sir&#39;s Public Tasks" },
    { href: 'bdsm-checklist.html',  icon: '✅', label: 'BDSM Checklists' },
    { href: 'sirs-protocol.html',   icon: '📜', label: 'Sir\u2019s Protocol' },
    { href: 'song-vault.html',      icon: '🎵', label: 'Song Vault' },
    { href: 'notes.html',           icon: '📝', label: 'Notes' },
    { href: 'calendar.html',        icon: '📅', label: 'Calendar' },
    { href: 'protocol-daily.html',  icon: '📅', label: 'Daily Protocol' },
    { href: 'help.html',            icon: '❓', label: 'Help &amp; Info' },
    { href: 'settings.html',        icon: '⚙️', label: 'Settings' }
  ];

  /* ── 2. Read active page from <body data-nav="X"> ──────── */
  var activePage = document.body.dataset.nav || 'more';

  /* ── 3. Build HTML strings ──────────────────────────────── */

  // Overlay
  var overlayHTML = '<div class="dsh-overlay" id="dshOverlay"></div>';

  // More sheet
  var moreItemsHTML = MORE_ITEMS.map(function (item) {
    return (
      '<a href="' + item.href + '" class="dsh-more-item">' +
      '<span class="dsh-more-icon">' + item.icon + '</span>' +
      '<span class="dsh-more-lbl">' + item.label + '</span>' +
      '</a>'
    );
  }).join('');

  var sheetHTML =
    '<div class="dsh-more-sheet" id="dshMoreSheet">' +
    '<div class="dsh-sheet-handle"></div>' +
    '<div class="dsh-sheet-title">More</div>' +
    '<div class="dsh-more-grid">' + moreItemsHTML + '</div>' +
    '</div>';

  // Nav bar tabs
  var tabsHTML = NAV_TABS.map(function (tab) {
    var isActive = tab.page === activePage ? ' active' : '';
    var inner =
      '<div class="dsh-nav-icon">' + tab.svg + '</div>' +
      '<span class="dsh-nav-lbl">' + tab.label + '</span>' +
      '<div class="dsh-nav-pip"></div>';

    if (tab.isButton) {
      return (
        '<button class="dsh-nav-btn' + isActive + '" data-page="' + tab.page + '" id="dshMoreBtn">' +
        inner +
        '</button>'
      );
    } else {
      return (
        '<a href="' + tab.href + '" class="dsh-nav-btn' + isActive + '" data-page="' + tab.page + '">' +
        inner +
        '</a>'
      );
    }
  }).join('');

  var navHTML =
    '<nav class="dsh-nav" id="dshNav">' + tabsHTML + '</nav>';

  /* ── 4. Inject into DOM ─────────────────────────────────── */
  function appendHTML(html) {
    document.body.insertAdjacentHTML('beforeend', html);
  }

  appendHTML(overlayHTML);
  appendHTML(sheetHTML);
  appendHTML(navHTML);

  /* ── 5. Wire up More button & overlay ───────────────────── */
  var overlay = document.getElementById('dshOverlay');
  var sheet   = document.getElementById('dshMoreSheet');
  var moreBtn = document.getElementById('dshMoreBtn');
  var allBtns = document.querySelectorAll('.dsh-nav-btn');

  function openMore() {
    sheet.classList.add('open');
    overlay.classList.add('open');
    allBtns.forEach(function (b) { b.classList.remove('active'); });
    if (moreBtn) moreBtn.classList.add('active');
  }

  function closeMore() {
    sheet.classList.remove('open');
    overlay.classList.remove('open');
    allBtns.forEach(function (b) { b.classList.remove('active'); });
    var target = document.querySelector('.dsh-nav-btn[data-page="' + activePage + '"]');
    if (target) target.classList.add('active');
  }

  if (moreBtn) moreBtn.addEventListener('click', function () {
    sheet.classList.contains('open') ? closeMore() : openMore();
  });

  overlay.addEventListener('click', closeMore);

})();
