/* agents/adm-agent.js */

const ADMAgent = (() => {

  let roles = JSON.parse(JSON.stringify(DATA.defaultRoles));
  let params = { contingency: 15, overhead: 10, currency: 'USD', region: 'APAC' };

  function calcTotals() {
    const base = roles.reduce((s, r) => s + (r.fte * r.weeks * r.rate), 0);
    const cont = base * params.contingency / 100;
    const over = base * params.overhead / 100;
    return { base, cont, over, total: base + cont + over, ftes: roles.reduce((s,r) => s + r.fte, 0), weeks: Math.max(...roles.map(r => r.weeks), 0) };
  }

  function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

  function renderParamGrid() {
    const el = document.getElementById('paramGrid');
    if (!el) return;
    el.innerHTML = `
      <div class="form-group">
        <label class="form-label">Contingency (%)</label>
        <input class="form-input" type="number" value="${params.contingency}" min="0" max="50"
          onchange="ADMAgent.setParam('contingency', this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Overhead (%)</label>
        <input class="form-input" type="number" value="${params.overhead}" min="0" max="30"
          onchange="ADMAgent.setParam('overhead', this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Region</label>
        <select class="form-input" onchange="ADMAgent.setParam('region', this.value)">
          <option ${params.region==='APAC'?'selected':''}>APAC</option>
          <option ${params.region==='EMEA'?'selected':''}>EMEA</option>
          <option ${params.region==='NA'?'selected':''}>NA</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Currency</label>
        <select class="form-input" onchange="ADMAgent.setParam('currency', this.value)">
          <option ${params.currency==='USD'?'selected':''}>USD</option>
          <option ${params.currency==='AUD'?'selected':''}>AUD</option>
          <option ${params.currency==='GBP'?'selected':''}>GBP</option>
        </select>
      </div>
    `;
  }

  function renderRoleTable() {
    const el = document.getElementById('roleConfigTable');
    if (!el) return;
    el.innerHTML = `
      <div class="role-config-header">
        <div class="rch-label">Role</div>
        <div class="rch-label">FTEs</div>
        <div class="rch-label">Weeks</div>
        <div class="rch-label">Rate/wk</div>
        <div></div>
      </div>
      ${roles.map((r,i) => `
        <div class="role-config-row">
          <input class="rc-input" type="text" value="${r.role}" onchange="ADMAgent.updateRole(${i},'role',this.value)" style="font-size:12.5px;">
          <input class="rc-input" type="number" value="${r.fte}" min="0.5" step="0.5" onchange="ADMAgent.updateRole(${i},'fte',this.value)">
          <input class="rc-input" type="number" value="${r.weeks}" min="1" onchange="ADMAgent.updateRole(${i},'weeks',this.value)">
          <input class="rc-input" type="number" value="${r.rate}" min="0" step="100" onchange="ADMAgent.updateRole(${i},'rate',this.value)">
          <button class="rc-del" onclick="ADMAgent.removeRole(${i})" aria-label="Remove role"><i class="ti ti-trash"></i></button>
        </div>
      `).join('')}
    `;
  }

  function renderSummary() {
    const el = document.getElementById('estimateSummary');
    if (!el) return;
    const t = calcTotals();
    el.innerHTML = `
      <div class="est-label">Total estimated cost</div>
      <div class="est-big-number">${fmt(t.total)}</div>
      <div class="est-breakdown">
        <div class="est-row"><span class="est-row-label">Base effort cost</span><span class="est-row-value">${fmt(t.base)}</span></div>
        <div class="est-row"><span class="est-row-label">Contingency (${params.contingency}%)</span><span class="est-row-value">${fmt(t.cont)}</span></div>
        <div class="est-row"><span class="est-row-label">Overhead (${params.overhead}%)</span><span class="est-row-value">${fmt(t.over)}</span></div>
        <div class="est-row" style="border-top:1px solid var(--ink-100);padding-top:8px;margin-top:4px;">
          <span class="est-row-label" style="font-weight:600;">Total FTEs</span>
          <span class="est-row-value" style="color:var(--ac-purple);">${t.ftes} FTE</span>
        </div>
        <div class="est-row">
          <span class="est-row-label" style="font-weight:600;">Programme duration</span>
          <span class="est-row-value">${t.weeks} wks</span>
        </div>
      </div>
    `;
  }

  function renderPhaseBars() {
    const el = document.getElementById('phaseBars');
    if (!el) return;
    const t = calcTotals();
    const phases = [
      { name:'Mobilisation', pct:22, color:'#7F77DD' },
      { name:'Deployment',   pct:38, color:'#378ADD' },
      { name:'Testing',      pct:25, color:'#EF9F27' },
      { name:'Go-live',      pct:15, color:'#1D9E75' },
    ];
    el.innerHTML = phases.map(p => `
      <div class="phase-bar-row">
        <div class="phase-bar-label">${p.name}</div>
        <div class="phase-bar-track">
          <div class="phase-bar-fill" style="width:${p.pct}%;background:${p.color};"></div>
        </div>
        <div class="phase-bar-val">${fmt(t.total * p.pct / 100)}</div>
      </div>
    `).join('');
  }

  function render() {
    renderParamGrid();
    renderRoleTable();
    renderSummary();
    renderPhaseBars();
  }

  function setParam(key, val) {
    params[key] = isNaN(+val) ? val : +val;
    render();
  }

  function updateRole(i, key, val) {
    roles[i][key] = isNaN(+val) ? val : +val;
    renderSummary();
    renderPhaseBars();
  }

  function addRole() {
    roles.push({ id: 'r' + Date.now(), role:'New role', fte:1, weeks:8, rate:1500 });
    render();
    Toast.show('Role added', 'info');
  }

  function removeRole(i) {
    roles.splice(i, 1);
    render();
    Toast.show('Role removed', 'warning');
  }

  function exportCSV() {
    const t = calcTotals();
    const rows = [
      ['Role','FTEs','Weeks','Weekly Rate ('+params.currency+')','Total'],
      ...roles.map(r => [r.role, r.fte, r.weeks, r.rate, r.fte*r.weeks*r.rate]),
      ['','','','Base total', Math.round(t.base)],
      ['','','','Contingency', Math.round(t.cont)],
      ['','','','Overhead', Math.round(t.over)],
      ['','','','GRAND TOTAL', Math.round(t.total)],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'adm-estimate.csv'; a.click();
    URL.revokeObjectURL(url);
    Toast.show('ADM CSV exported', 'success');
    AgentOrchestrator.log('ADMAgent', 'CSV exported with ' + roles.length + ' roles, total: ' + fmt(t.total), 'success');
  }

  function exportJSON() {
    const t = calcTotals();
    const payload = {
      metadata: { generated: new Date().toISOString(), region: params.region, currency: params.currency },
      parameters: params,
      roles,
      totals: { base: Math.round(t.base), contingency: Math.round(t.cont), overhead: Math.round(t.over), total: Math.round(t.total), total_ftes: t.ftes },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'adm-payload.json'; a.click();
    URL.revokeObjectURL(url);
    Toast.show('JSON payload exported', 'success');
  }

  function pushToDSP() {
    const t = calcTotals();
    Toast.show('Estimate pushed to DSP — ' + fmt(t.total), 'success');
    AgentOrchestrator.log('ADMAgent', 'Estimate pushed to DSP: ' + fmt(t.total), 'success');
  }

  function exportToADM() {
    Toast.show('Opening ADM tool (SSO required in production)', 'info');
    AgentOrchestrator.log('ADMAgent', 'Opening ADM external tool — in production this opens via SSO', 'warning');
  }

  async function runAgent() {
    const t = calcTotals();
    await AgentOrchestrator.runWithDelay('adm_agent', 'ADMAgent', [
      { msg:'Loading deal parameters and scope...', delay:500 },
      { msg:'Reading role configuration (' + roles.length + ' roles)...', delay:600 },
      { msg:'Calculating base effort: ' + fmt(t.base), delay:700 },
      { msg:'Applying contingency (' + params.contingency + '%) and overhead (' + params.overhead + '%)...', delay:600 },
      { msg:'Total estimate: ' + fmt(t.total) + ' | ' + t.ftes + ' FTEs | ' + t.weeks + ' weeks', delay:500, level:'success' },
      { msg:'Generating ADM-compatible export payload...', delay:700 },
      { msg:'Ready to push to DSP and myISP', delay:400, level:'success' },
    ]);
    Toast.show('ADM estimation complete — ' + fmt(t.total), 'success');
  }

  function init() { render(); }

  return { init, render, setParam, updateRole, addRole, removeRole, exportCSV, exportJSON, pushToDSP, exportToADM, runAgent };
})();
