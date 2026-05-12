/* agents/timeline-agent.js */
const TimelineAgent = (() => {

  function render() {
    renderPhases();
    renderGantt();
  }

  function renderPhases() {
    const el = document.getElementById('phasesContainer');
    if (!el) return;
    el.innerHTML = DATA.phases.map(p => `
      <div class="phase-block">
        <button class="phase-hdr" onclick="TimelineAgent.togglePhase('${p.id}')" aria-expanded="false">
          <div class="ph-icon" style="background:${p.iconBg};">
            <i class="ti ${p.iconClass}" style="color:${p.iconColor};"></i>
          </div>
          <div class="ph-info">
            <div class="ph-name">${p.name}</div>
            <div class="ph-sub">${p.sub}</div>
          </div>
          <span class="ph-wks">${p.weeks}</span>
          <span class="badge badge-purple" style="margin-right:8px;">${p.ftes} FTE</span>
          <i class="ti ti-chevron-down ph-chev" id="chev-${p.id}"></i>
        </button>
        <div class="phase-body" id="body-${p.id}">
          ${p.activities.map(a => `
            <div class="act-row">
              <span class="act-num">${a.num}</span>
              <span class="act-name">${a.name}</span>
              <span class="act-fte">${a.fte}</span>
              <span class="act-dur">${a.dur}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function togglePhase(id) {
    const body = document.getElementById('body-' + id);
    const chev = document.getElementById('chev-' + id);
    if (!body) return;
    const open = body.classList.toggle('open');
    if (chev) chev.classList.toggle('open', open);
  }

  function renderGantt() {
    const el = document.getElementById('ganttWrap');
    if (!el) return;
    el.innerHTML = `
      <div class="gantt-hd">
        <div class="gantt-hd-cell">Phase</div>
        <div class="gantt-hd-cell">FTEs</div>
        <div class="gantt-hd-cell gantt-bar-col">
          <div class="gantt-weeks">
            <span class="gantt-wk-label">Wk 1</span>
            <span class="gantt-wk-label">Wk 5</span>
            <span class="gantt-wk-label">Wk 10</span>
            <span class="gantt-wk-label">Wk 15</span>
            <span class="gantt-wk-label">Wk 20</span>
          </div>
        </div>
      </div>
      ${DATA.phases.map(p => `
        <div class="gantt-row">
          <div class="gantt-row-label">${p.name.replace(/Phase \d — /,'')}</div>
          <div class="gantt-row-fte">${p.ftes} FTE</div>
          <div class="gantt-bar-bg">
            <div class="gantt-fill" style="left:${p.ganttStart}%;width:${p.ganttEnd-p.ganttStart}%;background:${p.ganttColor};">
              ${(p.ganttEnd-p.ganttStart) > 18 ? p.name.replace(/Phase \d — /,'').split(' ')[0] : ''}
            </div>
          </div>
        </div>
      `).join('')}
    `;
  }

  function exportGantt() {
    const rows = [['Phase','Weeks','FTEs','Start %','End %'],
      ...DATA.phases.map(p=>[p.name,p.weeks,p.ftes,p.ganttStart,p.ganttEnd])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='gantt-timeline.csv'; a.click();
    URL.revokeObjectURL(url);
    Toast.show('Gantt exported', 'success');
  }

  async function runAgent() {
    await AgentOrchestrator.runWithDelay('timeline_agent', 'TimelineAgent', [
      { msg:'Reading deal scope and type...', delay:500 },
      { msg:'Generating 20-week standard landing zone programme...', delay:700 },
      { msg:'Phase 1 (Wk 1–4): Mobilisation — 6 FTE allocated', delay:600 },
      { msg:'Phase 2 (Wk 5–10): Deployment — 5 FTE allocated', delay:600 },
      { msg:'Phase 3 (Wk 11–15): Testing — 4 FTE allocated', delay:600 },
      { msg:'Phase 4 (Wk 16–20): Go-live & hypercare — 6 FTE allocated', delay:600 },
      { msg:'Schedule risk check: No critical path conflicts detected', delay:500, level:'success' },
    ]);
    Toast.show('Timeline generated', 'success');
  }

  function init() { render(); }
  return { init, render, togglePhase, exportGantt, runAgent };
})();

/* agents/deliverables-agent.js */
const DeliverablesAgent = (() => {

  let currentFilter = 'all';
  const statusMap = { in_progress:'ds-inprogress', pending:'ds-pending', complete:'ds-complete' };
  const statusLabels = { in_progress:'In progress', pending:'Pending', complete:'Complete' };

  function render(filter) {
    const el = document.getElementById('delivGrid');
    if (!el) return;
    const items = filter === 'all' ? DATA.deliverables : DATA.deliverables.filter(d => d.status === filter);
    if (!items.length) {
      el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--ink-400);">No deliverables matching this filter.</div>';
      return;
    }
    el.innerHTML = items.map(d => `
      <div class="deliv-card" onclick="DeliverablesAgent.editDeliverable('${d.id}')">
        <div class="deliv-icon" style="background:${d.iconBg};">
          <i class="ti ${d.icon}" style="color:${d.iconColor};"></i>
        </div>
        <div class="deliv-body">
          <div class="deliv-name">${d.name}</div>
          <div class="deliv-owner">${d.owner}</div>
          <div class="deliv-footer">
            <span class="deliv-phase">${d.phase}</span>
            <span class="deliv-status ${statusMap[d.status]}">${statusLabels[d.status]}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function filter(f, btn) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    render(f);
  }

  function editDeliverable(id) {
    const d = DATA.deliverables.find(x => x.id === id);
    if (!d) return;
    App.openModal('Update deliverable', `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Deliverable</label><input class="form-input" value="${d.name}" readonly></div>
        <div class="form-group"><label class="form-label">Owner</label><input class="form-input" value="${d.owner}" id="deOwner"></div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-input" id="deStatus">
            <option value="pending" ${d.status==='pending'?'selected':''}>Pending</option>
            <option value="in_progress" ${d.status==='in_progress'?'selected':''}>In progress</option>
            <option value="complete" ${d.status==='complete'?'selected':''}>Complete</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-input" rows="3" placeholder="Add review notes..."></textarea></div>
      </div>
    `, `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary" onclick="DeliverablesAgent.saveDeliverable('${id}')">Save changes</button>
    `);
  }

  function saveDeliverable(id) {
    const d = DATA.deliverables.find(x => x.id === id);
    if (!d) return;
    d.status = document.getElementById('deStatus')?.value || d.status;
    d.statusLabel = statusLabels[d.status];
    d.owner = document.getElementById('deOwner')?.value || d.owner;
    App.closeModal();
    render(currentFilter);
    Toast.show('Deliverable updated', 'success');
    AgentOrchestrator.log('DelivAgent', 'Deliverable updated: "' + d.name + '" → ' + d.statusLabel, 'success');
  }

  async function runAgent() {
    const inProgress = DATA.deliverables.filter(d => d.status === 'in_progress').length;
    const pending = DATA.deliverables.filter(d => d.status === 'pending').length;
    const complete = DATA.deliverables.filter(d => d.status === 'complete').length;
    await AgentOrchestrator.runWithDelay('deliv_agent', 'DelivAgent', [
      { msg:'Scanning ' + DATA.deliverables.length + ' deliverables...', delay:500 },
      { msg:'In progress: ' + inProgress + ' | Pending: ' + pending + ' | Complete: ' + complete, delay:600 },
      { msg:'Checking gate criteria for Phase 2 sign-off...', delay:700 },
      { msg:'HLD review due — sending reminder to Solution Lead...', delay:600, level:'warning' },
      { msg:'Test evidence pack flagged as in-progress — QA sign-off pending', delay:500, level:'warning' },
      { msg:'Deliverables health check complete', delay:400, level:'success' },
    ]);
    Toast.show('Deliverables health check complete', 'success');
  }

  function init() { render('all'); }
  return { init, filter, editDeliverable, saveDeliverable, runAgent };
})();
