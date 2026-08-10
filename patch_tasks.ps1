$filePath = "tasks.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

$cssAdd = @"
.sub-switcher-wrap{display:flex;align-items:center;background:rgba(212,175,55,.08);border:1px solid var(--gold-b);border-radius:16px;padding:2px 8px;}
.sub-select-dropdown{background:none;border:none;color:var(--gold);font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;outline:none;cursor:pointer;}
.sub-select-dropdown option{background:#051024;color:var(--text);}
.sub-filter-row{display:flex;gap:6px;padding:12px 16px 4px;overflow-x:auto;scrollbar-width:none;}
.sub-filter-row::-webkit-scrollbar{display:none;}
.sub-filter-pill{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:6px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:var(--dim);cursor:pointer;white-space:nowrap;transition:all .15s;}
.sub-filter-pill.active{border-color:var(--gold);background:rgba(212,175,55,.12);color:var(--gold);}
"@

if (-not $content.Contains(".sub-switcher-wrap")) {
    $content = $content.Replace("/* ── Header ── */", "$cssAdd`n/* ── Header ── */")
}

$oldHeader = @"
  <div class="app-header">
    <a href="index.html" class="header-back">
      <span class="material-symbols-rounded">arrow_back</span>
    </a>
    <div class="header-title">
      <div class="header-title-main">Tasks</div>
      <div class="header-title-sub" id="headerSub">Dom Sub Hub</div>
    </div>
    <div class="header-badge" id="headerBadge">—</div>
  </div>

  <div class="tab-bar">
    <button class="tab-btn active" onclick="switchTab('tasks')" id="tab-tasks">Tasks</button>
    <button class="tab-btn" onclick="switchTab('queue')" id="tab-queue">Queue</button>
    <button class="tab-btn" onclick="switchTab('dashboard')" id="tab-dashboard">Dashboard</button>
    <button class="tab-btn" onclick="switchTab('rewards')" id="tab-rewards">Rewards</button>
    <button class="tab-btn" onclick="switchTab('punishments')" id="tab-punishments">Punishments</button>
    <button class="tab-btn" onclick="switchTab('history')" id="tab-history">History</button>
  </div>
"@

$newHeader = @"
  <div class="app-header">
    <a href="index.html" class="header-back">
      <span class="material-symbols-rounded">arrow_back</span>
    </a>
    <div class="header-title">
      <div class="header-title-main">Tasks &amp; Discipline</div>
      <div class="header-title-sub" id="headerSub">Dom Sub Hub</div>
    </div>
    <div class="sub-switcher-wrap hidden" id="subSwitcherWrap">
      <select class="sub-select-dropdown" id="subSelectDropdown" onchange="onSubSwitch(this.value)">
        <option value="all">👥 All Subs</option>
      </select>
    </div>
    <div class="header-badge" id="headerBadge">—</div>
  </div>

  <div class="tab-bar">
    <button class="tab-btn active" onclick="switchTab('tasks')" id="tab-tasks">📋 Tasks</button>
    <button class="tab-btn" onclick="switchTab('store')" id="tab-store">🏪 Store &amp; Penalties</button>
    <button class="tab-btn" onclick="switchTab('stats')" id="tab-stats">📊 Stats &amp; Mood</button>
  </div>
"@

$content = $content.Replace($oldHeader, $newHeader)

$oldTaskSheetHeader = @"
  <div class="sheet-header">
    <div class="sheet-title">New Task</div>
    <div class="sheet-sub">Assign a task for Becca</div>
  </div>
  <div class="sheet-body">
    <div class="fg"><label class="fl">Task Title</label>
"@

$newTaskSheetHeader = @"
  <div class="sheet-header">
    <div class="sheet-title" id="taskSheetTitle">New Task</div>
    <div class="sheet-sub" id="taskSheetSub">Assign a new task</div>
  </div>
  <div class="sheet-body">
    <div class="fg" id="targetRoleGroup"><label class="fl">Assign Task To</label>
      <div class="chip-group" id="targetChips">
        <div class="chip selected" data-val="sub" onclick="pickChip('targetChips',this)" id="targetChipSub">Submissive</div>
        <div class="chip" data-val="dom" onclick="pickChip('targetChips',this)" id="targetChipDom">Dominant (Dom Task)</div>
      </div>
    </div>
    <div class="fg"><label class="fl">Task Title</label>
"@

$content = $content.Replace($oldTaskSheetHeader, $newTaskSheetHeader)

$oldViews = @"
    <!-- TASKS TAB -->
    <div id="view-tasks">
      <div class="points-bar">
        <div class="pts-icon">⭐</div>
        <div class="pts-info">
          <div class="pts-val" id="ptBal">—</div>
          <div class="pts-lbl">Points Balance</div>
        </div>
        <div class="pts-stats">
          <div class="pts-stat"><div class="pts-stat-val c-green" id="ptEarned">—</div><div class="pts-stat-lbl">Earned</div></div>
          <div class="pts-stat"><div class="pts-stat-val c-rose" id="ptLost">—</div><div class="pts-stat-lbl">Lost</div></div>
        </div>
      </div>
      <div id="punishBanner"></div>
      <div id="demeritsBanner"></div>
      <div id="achievementsStrip" class="achievements-wrap hidden">
        <div class="achievements-head">
          <div class="achievements-lbl">Achievements</div>
        </div>
        <div class="achievements-scroll" id="achievementsList"></div>
      </div>
      <div class="section">
        <div class="section-head">
          <div class="section-lbl">Active Tasks</div>
          <div class="section-action" id="filterToggle" onclick="cycleFilter()">
            <span class="material-symbols-rounded" style="font-size:14px;">filter_list</span> All
          </div>
        </div>
        <div class="task-list" id="taskList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>
    </div>

    <!-- QUEUE TAB -->
    <div id="view-queue" class="hidden">
      <div class="section">
        <div class="section-head"><div class="section-lbl">Awaiting Sir's Attention</div></div>
        <div class="task-list" id="queueList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>
    </div>

    <!-- REWARDS TAB -->
    <div id="view-rewards" class="hidden">
      <div class="section">
        <div class="section-head"><div class="section-lbl">Reward Store</div></div>
        <div class="task-list" id="rewardList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>
    </div>

    <!-- PUNISHMENTS TAB -->
    <div id="view-punishments" class="hidden">
      <div class="section">
        <div class="section-head"><div class="section-lbl">Punishment List</div></div>
        <div class="task-list" id="punishList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>
    </div>

    <!-- DASHBOARD TAB -->
    <div id="view-dashboard" class="hidden">
      <div id="sirDashboard" class="hidden">
        <div class="dash-section-lbl">Overview</div>
        <div class="dash-grid" id="dashGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
        <div class="dash-section-lbl" style="margin-top:6px;">Point Economy</div>
        <div class="chart-wrap">
          <div class="chart-canvas-wrap">
            <canvas id="pointsChart"></canvas>
            <div class="chart-legend">
              <div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--green)"></div>Earned</div>
              <div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--rose)"></div>Lost</div>
            </div>
          </div>
        </div>
        <div class="dash-section-lbl">Alerts</div>
        <div style="padding:0 16px 14px;" id="dashAlerts"></div>
      </div>
      <div id="subDashboard" class="hidden">
        <div class="dash-section-lbl">Your Status</div>
        <div class="dash-grid" id="subDashGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
        <div class="dash-section-lbl" style="margin-top:6px;">Request a Task from Sir</div>
        <div style="padding:0 16px 14px;">
          <div class="fg"><label class="fl">What would you like to do?</label>
            <input class="fi" id="taskReqTitle" placeholder="e.g. Practice a new position" maxlength="80"/>
          </div>
          <div class="fg"><label class="fl">Why / Context</label>
            <textarea class="fi" id="taskReqNote" placeholder="Tell Sir why you're requesting this…" rows="2"></textarea>
          </div>
          <button class="submit-btn" onclick="sendTaskRequest()">Send Request to Sir</button>
        </div>
        <div class="dash-section-lbl">Pending Requests</div>
        <div style="padding:0 16px 14px;" id="taskRequestList"></div>
      </div>
    </div>

    <!-- HISTORY TAB -->
    <div id="view-history" class="hidden">
      <div class="section">
        <div class="section-head"><div class="section-lbl">Activity Log</div></div>
        <div class="task-list" id="historyList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>
    </div>
"@

$newViews = @"
    <!-- 📋 TASKS TAB -->
    <div id="view-tasks">
      <div class="sub-filter-row" id="subFilterRow">
        <button class="sub-filter-pill active" data-filter="all" onclick="setSubFilter('all', this)">All</button>
        <button class="sub-filter-pill" data-filter="sub_tasks" onclick="setSubFilter('sub_tasks', this)" id="pillSubTasks">Sub's Tasks</button>
        <button class="sub-filter-pill" data-filter="dom_tasks" onclick="setSubFilter('dom_tasks', this)" id="pillDomTasks">Dom's Obligations</button>
        <button class="sub-filter-pill" data-filter="habits" onclick="setSubFilter('habits', this)">Daily Habits</button>
        <button class="sub-filter-pill" data-filter="pending_proof" onclick="setSubFilter('pending_proof', this)" id="pillPendingProof">Approvals <span class="tab-count" id="pendingProofBadge">0</span></button>
      </div>

      <div class="section">
        <div class="section-head">
          <div class="section-lbl" id="taskSectionLbl">Active Tasks</div>
          <div style="display:flex;gap:8px;align-items:center;">
            <a href="protocol-daily.html" style="font-size:10px;color:var(--gold);text-decoration:none;font-weight:600;display:flex;align-items:center;gap:2px;">
              <span class="material-symbols-rounded" style="font-size:13px;">menu_book</span> Rulebook
            </a>
            <div class="section-action" id="filterToggle" onclick="cycleFilter()">
              <span class="material-symbols-rounded" style="font-size:14px;">filter_list</span> All
            </div>
          </div>
        </div>
        <div class="task-list" id="taskList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>
    </div>

    <!-- 🏪 STORE & DISCIPLINE TAB -->
    <div id="view-store" class="hidden">
      <div class="points-bar">
        <div class="pts-icon">⭐</div>
        <div class="pts-info">
          <div class="pts-val" id="ptBal">—</div>
          <div class="pts-lbl">Points Balance</div>
        </div>
        <div class="pts-stats">
          <div class="pts-stat"><div class="pts-stat-val c-green" id="ptEarned">—</div><div class="pts-stat-lbl">Earned</div></div>
          <div class="pts-stat"><div class="pts-stat-val c-rose" id="ptLost">—</div><div class="pts-stat-lbl">Lost</div></div>
        </div>
      </div>
      <div id="punishBanner"></div>
      <div id="demeritsBanner"></div>

      <div class="section">
        <div class="section-head"><div class="section-lbl">Reward Store</div></div>
        <div class="task-list" id="rewardList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>

      <div class="section" style="margin-top:14px;">
        <div class="section-head"><div class="section-lbl">Punishments &amp; Redemptions</div></div>
        <div class="task-list" id="punishList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>
    </div>

    <!-- 📊 STATS & MOOD TAB -->
    <div id="view-stats" class="hidden">
      <div id="sirDashboard">
        <div class="dash-section-lbl">Overview</div>
        <div class="dash-grid" id="dashGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
        <div class="dash-section-lbl" style="margin-top:6px;">Point Economy</div>
        <div class="chart-wrap">
          <div class="chart-canvas-wrap">
            <canvas id="pointsChart"></canvas>
            <div class="chart-legend">
              <div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--green)"></div>Earned</div>
              <div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--rose)"></div>Lost</div>
            </div>
          </div>
        </div>
        <div class="dash-section-lbl">Alerts</div>
        <div style="padding:0 16px 14px;" id="dashAlerts"></div>
      </div>
      <div id="subDashboard" class="hidden">
        <div class="dash-section-lbl">Headspace &amp; Mood</div>
        <div class="dash-grid" id="subDashGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
        <div class="dash-section-lbl" style="margin-top:6px;">Task Request for Partner</div>
        <div style="padding:0 16px 14px;">
          <div class="fg"><label class="fl">What would you like to do?</label>
            <input class="fi" id="taskReqTitle" placeholder="e.g. Practice a new position" maxlength="80"/>
          </div>
          <div class="fg"><label class="fl">Why / Context</label>
            <textarea class="fi" id="taskReqNote" placeholder="Tell your partner why you're requesting this…" rows="2"></textarea>
          </div>
          <button class="submit-btn" onclick="sendTaskRequest()">Send Request</button>
        </div>
        <div class="dash-section-lbl">Pending Requests</div>
        <div style="padding:0 16px 14px;" id="taskRequestList"></div>
      </div>

      <div id="achievementsStrip" class="achievements-wrap" style="margin-top:14px;">
        <div class="achievements-head">
          <div class="achievements-lbl">Achievements</div>
        </div>
        <div class="achievements-scroll" id="achievementsList"></div>
      </div>

      <div class="section" style="margin-top:14px;">
        <div class="section-head"><div class="section-lbl">Activity Log</div></div>
        <div class="task-list" id="historyList"><div class="loading"><div class="spinner"></div> Loading…</div></div>
      </div>
    </div>
"@

$content = $content.Replace($oldViews, $newViews)

[System.IO.File]::WriteAllText($filePath, $content)
Write-Output "Successfully patched Phase 1 structural HTML into tasks.html."
