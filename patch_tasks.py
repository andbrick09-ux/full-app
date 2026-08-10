import os

file_path = "tasks.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. CSS Additions (Sub-switcher, pills)
css_add = """
.sub-switcher-wrap{display:flex;align-items:center;background:rgba(212,175,55,.08);border:1px solid var(--gold-b);border-radius:16px;padding:2px 8px;}
.sub-select-dropdown{background:none;border:none;color:var(--gold);font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;outline:none;cursor:pointer;}
.sub-select-dropdown option{background:#051024;color:var(--text);}
.sub-filter-row{display:flex;gap:6px;padding:12px 16px 4px;overflow-x:auto;scrollbar-width:none;}
.sub-filter-row::-webkit-scrollbar{display:none;}
.sub-filter-pill{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:6px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:var(--dim);cursor:pointer;white-space:nowrap;transition:all .15s;}
.sub-filter-pill.active{border-color:var(--gold);background:rgba(212,175,55,.12);color:var(--gold);}
"""
if ".sub-switcher-wrap" not in content:
    content = content.replace("/* ── Header ── */", css_add + "\n/* ── Header ── */")

# 2. Header and Tabs
old_header = """  <div class="app-header">
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
  </div>"""

new_header = """  <div class="app-header">
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
  </div>"""

content = content.replace(old_header, new_header)

# 3. Task Sheet (Add targetRole selector)
old_task_sheet_header = """  <div class="sheet-header">
    <div class="sheet-title">New Task</div>
    <div class="sheet-sub">Assign a task for Becca</div>
  </div>
  <div class="sheet-body">
    <div class="fg"><label class="fl">Task Title</label>"""

new_task_sheet_header = """  <div class="sheet-header">
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
    <div class="fg"><label class="fl">Task Title</label>"""

content = content.replace(old_task_sheet_header, new_task_sheet_header)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Applied Python patches.")
