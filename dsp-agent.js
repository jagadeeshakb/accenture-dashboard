/* agents/isp-agent.js */
const ISPAgent = (() => {

  const ftePlan = [
    { role:'Cloud Platform Engineer', fte:2, skill:'Cloud / IaC', wk_start:1, wk_end:16, priority:'High' },
    { role:'Application Architect',   fte:1, skill:'Solution design', wk_start:1, wk_end:12, priority:'Critical' },
    { role:'DevOps Lead',             fte:1, skill:'CI/CD', wk_start:3, wk_end:14, priority:'High' },
    { role:'QA Engineer',             fte:2, skill:'Testing', wk_start:8, wk_end:16, priority:'Medium' },
    { role:'Security SME',            fte:1, skill:'Security', wk_start:2, wk_end:8, priority:'High' },
    { role:'Project Manager',         fte:1, skill:'PMO', wk_start:1, wk_end:20, priority:'Critical' },
    { role:'Network Architect',       fte:1, skill:'Networking', wk_start:2, wk_end:6, priority:'Medium' },
    { role:'SRE',                     fte:1, skill:'Observability', wk_start:6, wk_end:18, priority:'Medium' },
  ];

  function renderRequestForm() {
    const el = document.getElementById('ispRequestForm');
    if (!el) return;
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group">
          <label class="form-label">Request title</label>
          <input class="form-input" type="text" value="Landing Zone Delivery — Resource Request" id="ispReqTitle">
        </div>
        <div class="form-group">
          <label class="form-label">Project code</label>
          <input class="form-input" type="text" value="PRJ-2025-LZ-001" id="ispProjCode">
        </div>
        <div class="form-group">
          <label class="form-label">Start date</label>
          <input class="form-input" type="date" id="ispStartDate">
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-input">
            <option>High</option><option selected>Critical</option><option>Medium</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Notes to resource manager</label>
          <textarea class="form-input" rows="3" style="resize:vertical;" placeholder="Any specific skill requirements or constraints..."></textarea>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn-primary" onclick="ISPAgent.submitToISP()"><i class="ti ti-send"></i> Submit to myISP</button>
          <button class="btn-secondary" onclick="ISPAgent.exportFTEPlan()"><i class="ti ti-download"></i> Export FTE plan</button>
        </div>
      </div>
    `;
    // Set default date to today
    const dateEl = document.getElementById('ispStartDate');
    if (dateEl) dateEl.value = new Date().toISOString().slice(0,10);
  }

  function renderDemandTable() {
    const el = document.getElementById('ispDemandTable');
    if (!el) return;
    const priorityColors = { Critical:'badge-red', High:'badge-amber', Medium:'badge-blue' };
    el.innerHTML = `
      <table class="isp-table">
        <thead>
          <tr>
            <th>Role</th><th>FTEs</th><th>Skill area</th>
            <th>Start</th><th>End</th><th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${ftePlan.map(r => `
            <tr>
              <td style="font-weight:500;">${r.role}</td>
              <td>${r.fte}</td>
              <td style="font-size:12px;color:var(--ink-500);">${r.skill}</td>
              <td style="font-family:var(--font-mono);font-size:12px;">Wk ${r.wk_start}</td>
              <td style="font-family:var(--font-mono);font-size:12px;">Wk ${r.wk_end}</td>
              <td><span class="badge ${priorityColors[r.priority]||'badge-gray'}">${r.priority}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top:8px;font-size:12px;color:var(--ink-400);">
        Total: ${ftePlan.reduce((s,r)=>s+r.fte,0)} FTEs across ${ftePlan.length} roles
      </div>
    `;
  }

  function renderMobilisationChart() {
    const el = document.getElementById('ispMobilisationChart');
    if (!el) return;
    // Weekly FTE demand
    const weeks = Array.from({length:20},(_,i)=>i+1);
    const demand = weeks.map(w => ftePlan.filter(r=>w>=r.wk_start&&w<=r.wk_end).reduce((s,r)=>s+r.fte,0));
    const max = Math.max(...demand);
    el.innerHTML = `
      <div style="display:flex;align-items:flex-end;gap:3px;height:80px;">
        ${demand.map((d,i) => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">
            <div style="width:100%;background:var(--ac-purple);border-radius:2px 2px 0 0;
              height:${Math.round(d/max*60)}px;opacity:${d/max>0.7?'0.9':'0.4'};transition:height 0.4s;cursor:pointer;"
              title="Wk${i+1}: ${d} FTEs"></div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:10.5px;font-family:var(--font-mono);color:var(--ink-400);">
        <span>Wk 1</span><span>Wk 5</span><span>Wk 10</span><span>Wk 15</span><span>Wk 20</span>
      </div>
      <div style="margin-top:6px;font-size:12px;color:var(--ink-400);">Peak demand: Wk 5–10 (${max} FTEs)</div>
    `;
  }

  function submitToISP() {
    Toast.show('Request submitted to myISP (sandbox mode)', 'success');
    AgentOrchestrator.log('ISPAgent', 'Resource request submitted to myISP — ' + ftePlan.length + ' roles, ' + ftePlan.reduce((s,r)=>s+r.fte,0) + ' FTEs', 'success');
  }

  function exportFTEPlan() {
    const rows = [['Role','FTEs','Skill Area','Week Start','Week End','Priority'],
      ...ftePlan.map(r=>[r.role,r.fte,r.skill,'Wk '+r.wk_start,'Wk '+r.wk_end,r.priority])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='fte-demand-plan.csv'; a.click();
    URL.revokeObjectURL(url);
    Toast.show('FTE plan exported', 'success');
  }

  function openMyISP() {
    Toast.show('Opening myISP (SSO required in production)', 'info');
    AgentOrchestrator.log('ISPAgent', 'Opening myISP portal — SSO authentication required in production environment', 'warning');
  }

  async function runAgent() {
    const total = ftePlan.reduce((s,r)=>s+r.fte,0);
    await AgentOrchestrator.runWithDelay('isp_agent', 'ISPAgent', [
      { msg:'Pulling FTE requirements from ADM estimator...', delay:500 },
      { msg:'Mapping ' + ftePlan.length + ' roles to skill categories...', delay:600 },
      { msg:'Calculating mobilisation timeline across 20 weeks...', delay:700 },
      { msg:'Peak demand identified: Wk 5–10 (' + total + ' FTEs)...', delay:500 },
      { msg:'Generating myISP-compatible resource request...', delay:800 },
      { msg:'Request ready — ' + total + ' FTEs across ' + ftePlan.length + ' roles', delay:400, level:'success' },
    ]);
    Toast.show('myISP resource plan generated', 'success');
  }

  function init() { renderRequestForm(); renderDemandTable(); renderMobilisationChart(); }
  return { init, submitToISP, exportFTEPlan, openMyISP, runAgent };
})();

/* agents/dsp-agent.js */
const DSPAgent = (() => {

  function renderDSPContent() {
    const el = document.getElementById('dspContent');
    if (!el) return;

    const deals = DATA.dspDeals;
    const statusColors = { 'In review':'badge-amber', 'Approved':'badge-green', 'Pending board':'badge-purple' };

    el.innerHTML = `
      <div class="section-hd">Active submissions</div>
      <div class="dsp-submissions">
        ${deals.map(d => `
          <div class="dsp-card">
            <div class="dsp-card-left">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <div class="dsp-deal-name">${d.name}</div>
                <span class="badge ${statusColors[d.status]||'badge-gray'}">${d.status}</span>
                <span class="badge badge-gray">${d.tier}</span>
              </div>
              <div class="dsp-meta">${d.client} · ${d.value} · ${d.id}</div>
              ${d.approvers.length ? `
                <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
                  ${d.approvers.map(a => `
                    <div style="display:flex;align-items:center;gap:6px;padding:5px 10px;background:var(--ink-50);border-radius:var(--r-md);border:1px solid var(--ink-100);">
                      <div style="width:24px;height:24px;border-radius:50%;background:rgba(161,0,255,0.12);color:var(--ac-purple-dark);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;">${a.initials}</div>
                      <span style="font-size:12px;font-weight:500;">${a.name}</span>
                      <span style="font-size:10.5px;color:var(--ink-400);">${a.role}</span>
                      <span class="reviewer-status rs-${a.status}">${a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              <div class="dsp-progress" style="margin-top:12px;">
                <div class="dsp-progress-track"><div class="dsp-progress-fill" style="width:${d.progress}%;"></div></div>
                <div class="dsp-progress-label"><span>Progress</span><span>${d.progress}%</span></div>
              </div>
            </div>
            <div class="dsp-actions">
              <button class="btn-secondary" style="font-size:12px;" onclick="DSPAgent.viewDeal('${d.id}')"><i class="ti ti-eye"></i> View</button>
              <button class="btn-ghost" style="font-size:12px;" onclick="DSPAgent.escalate('${d.id}')"><i class="ti ti-alert-triangle"></i> Escalate</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="section-hd" style="margin-top:1.75rem;">Submit new deal to DSP</div>
      <div class="card">
        <div style="display:flex;align-items:center;gap:12px;padding:0.5rem 0;">
          <i class="ti ti-info-circle" style="font-size:20px;color:var(--ac-purple);"></i>
          <div>
            <div style="font-size:13.5px;font-weight:500;">Start from deal governance</div>
            <div style="font-size:12.5px;color:var(--ink-400);margin-top:2px;">Fill in deal details in the Deal Governance tab — the system auto-populates the DSP submission form and routes to the correct approvers.</div>
          </div>
          <button class="btn-primary" onclick="App.navigate('deal')"><i class="ti ti-arrow-right"></i> Go to deal governance</button>
        </div>
      </div>
    `;
  }

  function submitDeal() {
    const name = document.getElementById('dealName')?.value || 'New deal';
    const tier = DealAgent.state.tier;
    if (!tier) { Toast.show('Please enter a deal value first', 'warning'); App.navigate('deal'); return; }
    Toast.show('Deal submitted to DSP — routing to approvers', 'success');
    AgentOrchestrator.log('DSPAgent', 'Deal submitted: "' + name + '" (Tier ' + tier + ') — awaiting DCSO/QA approval', 'success');
    App.navigate('dsp');
  }

  function viewDeal(id) {
    const deal = DATA.dspDeals.find(d => d.id === id);
    if (!deal) return;
    App.openModal('DSP deal — ' + deal.id, `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Deal name</label><input class="form-input" value="${deal.name}" readonly></div>
        <div class="form-group"><label class="form-label">Client</label><input class="form-input" value="${deal.client}" readonly></div>
        <div class="form-group"><label class="form-label">Value</label><input class="form-input" value="${deal.value}" readonly></div>
        <div class="form-group"><label class="form-label">Tier</label><input class="form-input" value="${deal.tier}" readonly></div>
        <div class="form-group"><label class="form-label">Status</label><input class="form-input" value="${deal.status}" readonly></div>
        <div class="form-group"><label class="form-label">Approval progress</label><input class="form-input" value="${deal.progress}%" readonly></div>
      </div>
    `, `<button class="btn-secondary" onclick="App.closeModal()">Close</button><button class="btn-primary" onclick="DSPAgent.openDSP()"><i class="ti ti-external-link"></i> Open in DSP</button>`);
  }

  function escalate(id) {
    Toast.show('Escalation raised for ' + id, 'warning');
    AgentOrchestrator.log('DSPAgent', 'Escalation raised for deal ' + id + ' — DCSO notified', 'warning');
  }

  function openDSP() {
    Toast.show('Opening DSP portal (SSO required in production)', 'info');
    AgentOrchestrator.log('DSPAgent', 'Opening DSP portal — SSO authentication required in production', 'warning');
  }

  async function runAgent() {
    await AgentOrchestrator.runWithDelay('dsp_agent', 'DSPAgent', [
      { msg:'Connecting to DSP API endpoint...', delay:600 },
      { msg:'Fetching active submission queue...', delay:700 },
      { msg:'Checking approval status for 3 active deals...', delay:800 },
      { msg:'DSP-2025-001: DCSO approved, Solution Lead pending — sending reminder...', delay:700, level:'warning' },
      { msg:'DSP-2025-003: Board review required — escalation flagged...', delay:600, level:'warning' },
      { msg:'DSP-2025-002: Fully approved — deal activated', delay:500, level:'success' },
    ]);
    Toast.show('DSP status sync complete', 'success');
  }

  function init() { renderDSPContent(); }
  return { init, submitDeal, viewDeal, escalate, openDSP, runAgent };
})();
