/* app.js — main application controller */

const Toast = (() => {
  function show(msg, type = 'info', duration = 3500) {
    const icons = { success:'ti-circle-check', error:'ti-alert-circle', warning:'ti-alert-triangle', info:'ti-info-circle' };
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<i class="ti ${icons[type]||icons.info}"></i><span>${msg}</span>`;
    const container = document.getElementById('toastContainer');
    container.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; el.style.transform='translateX(20px)'; el.style.transition='all 0.3s'; setTimeout(()=>el.remove(), 350); }, duration);
  }
  return { show };
})();

const App = (() => {
  let currentView = 'home';
  let currentRole = 'deal_owner';
  const viewTitles = {
    home:'Command centre', deal:'Deal governance', estimator:'ADM estimator',
    resources:'myISP resources', timeline:'Timeline & phases',
    deliverables:'Deliverables', dsp:'DSP portal', agents:'AI agents',
  };

  function navigate(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    const el = document.getElementById('view-' + view);
    if (el) el.classList.add('active');
    const bc = document.getElementById('bcCurrent');
    if (bc) bc.textContent = viewTitles[view] || view;

    // Lazy init views
    if (view === 'estimator') ADMAgent.init();
    if (view === 'resources') ISPAgent.init();
    if (view === 'dsp') DSPAgent.init();
    if (view === 'timeline') TimelineAgent.init();
    if (view === 'deliverables') DeliverablesAgent.init();
    if (view === 'agents') renderAgentsView();
    if (view === 'deal') DealAgent.init();

    // Close sidebar on mobile
    if (window.innerWidth < 900) {
      document.getElementById('sidebar').classList.remove('open');
    }
  }

  function setRole(role) {
    currentRole = role;
    const cfg = DATA.roleViews[role] || DATA.roleViews.deal_owner;
    const nameEl = document.getElementById('roleName');
    if (nameEl) nameEl.textContent = cfg.label;
    renderStats(role);
    AgentOrchestrator.log('App', 'Role switched to: ' + cfg.label, 'info');
  }

  function startNewDeal() {
    navigate('deal');
    Toast.show('Start by entering your deal details', 'info');
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  function toggleNotifications() {
    const panel = document.getElementById('notifPanel');
    panel.classList.toggle('open');
  }

  function clearNotifications() {
    document.getElementById('notifList').innerHTML = '<div style="padding:16px;font-size:13px;color:var(--ink-400);text-align:center;">No notifications</div>';
    document.getElementById('notifBadge').style.display = 'none';
    document.getElementById('notifPanel').classList.remove('open');
    Toast.show('Notifications cleared', 'info');
  }

  function openModal(title, bodyHtml, footerHtml = '') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml;
    document.getElementById('modalOverlay').classList.add('open');
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  }

  function renderStats(role) {
    const el = document.getElementById('statRow');
    if (!el) return;
    const statSets = {
      deal_owner:       [{ label:'Active deals', value:'3', sub:'↑ 1 this month', cls:'stat-up' },{ label:'Pending approvals', value:'2', sub:'DSP submissions', cls:'' },{ label:'Total pipeline', value:'$25.8M', sub:'3 deals', cls:'stat-up' },{ label:'Deals won', value:'12', sub:'YTD 2025', cls:'stat-up' }],
      solution_lead:    [{ label:'Active deals', value:'3', sub:'Requiring HLD', cls:'' },{ label:'HLD reviews due', value:'1', sub:'Overdue 2d', cls:'stat-down' },{ label:'Deliverables due', value:'3', sub:'This sprint', cls:'' },{ label:'Team FTEs', value:'24', sub:'Across 4 phases', cls:'' }],
      resource_manager: [{ label:'Open requests', value:'2', sub:'myISP queue', cls:'' },{ label:'FTEs deployed', value:'18', sub:'Of 24 planned', cls:'stat-up' },{ label:'Mobilisation due', value:'Wk 3', sub:'Next milestone', cls:'' },{ label:'Skill gaps', value:'1', sub:'Network Architect', cls:'stat-down' }],
      dcso:             [{ label:'Pending approvals', value:'2', sub:'Awaiting review', cls:'stat-down' },{ label:'Security reviews', value:'5', sub:'Completed YTD', cls:'stat-up' },{ label:'Risk flags', value:'1', sub:'T3 deal flagged', cls:'stat-down' },{ label:'Deals reviewed', value:'8', sub:'2025', cls:'stat-up' }],
      delivery_manager: [{ label:'Active projects', value:'3', sub:'Landing zones', cls:'' },{ label:'Milestones due', value:'2', sub:'This week', cls:'' },{ label:'Deliverables done', value:'1', sub:'Of 8 total', cls:'stat-down' },{ label:'Days to go-live', value:'62', sub:'Earliest deal', cls:'' }],
    };
    const stats = statSets[role] || statSets.deal_owner;
    el.innerHTML = stats.map(s => `
      <div class="stat-card">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-sub"><span class="${s.cls}">${s.sub}</span></div>
      </div>
    `).join('');
  }

  function renderWorkflowStepper() {
    const el = document.getElementById('workflowStepper');
    if (!el) return;
    const steps = [
      { icon:'ti-file-text', state:'done', title:'Deal details entered', sub:'Deal name, client and value set', action:null },
      { icon:'ti-shield-check', state:'active', title:'Governance classification', sub:'Tier assessment and approval routing — pending', action:'<button class="btn-secondary" style="font-size:12px;" onclick="App.navigate(\'deal\')"><i class="ti ti-arrow-right"></i> Go to deal governance</button>' },
      { icon:'ti-calculator', state:'todo', title:'ADM estimation', sub:'Generate effort and cost estimate', action:'<button class="btn-ghost" style="font-size:12px;" onclick="App.navigate(\'estimator\')">Open estimator ↗</button>' },
      { icon:'ti-users', state:'todo', title:'myISP resource request', sub:'Raise FTE demand plan', action:null },
      { icon:'ti-route', state:'todo', title:'DSP submission', sub:'Submit deal through DSP approval workflow', action:null },
      { icon:'ti-rocket', state:'todo', title:'Deal activation & mobilisation', sub:'Begin Phase 1 delivery', action:null },
    ];
    el.innerHTML = steps.map(s => `
      <div class="workflow-step">
        <div class="step-icon-col">
          <div class="step-icon ${s.state}"><i class="ti ${s.icon}"></i></div>
        </div>
        <div class="step-body">
          <div class="step-title">${s.title}</div>
          <div class="step-sub">${s.sub}</div>
          ${s.action ? '<div class="step-action">' + s.action + '</div>' : ''}
        </div>
      </div>
    `).join('');
  }

  function renderQuickActions() {
    const el = document.getElementById('quickActions');
    if (!el) return;
    const actions = [
      { icon:'ti-plus', title:'New deal', sub:'Start deal governance workflow', view:'deal' },
      { icon:'ti-calculator', title:'Run ADM estimate', sub:'Calculate effort and cost', view:'estimator' },
      { icon:'ti-users', title:'Raise resource request', sub:'Generate myISP FTE plan', view:'resources' },
      { icon:'ti-robot', title:'Run all agents', sub:'Automate full governance cycle', fn:'AgentOrchestrator' },
    ];
    el.innerHTML = actions.map(a => `
      <button class="qa-btn" onclick="${a.view ? "App.navigate('"+a.view+"')" : 'App.runAllAgents()'}">
        <i class="ti ${a.icon}"></i>
        <div class="qa-btn-text">
          <div class="qa-title">${a.title}</div>
          <div class="qa-sub">${a.sub}</div>
        </div>
        <i class="ti ti-chevron-right qa-arrow"></i>
      </button>
    `).join('');
  }

  function renderIntegrationStatus() {
    const el = document.getElementById('integrationStatus');
    if (!el) return;
    el.innerHTML = DATA.integrations.map(i => `
      <div class="int-status-row">
        <div class="int-logo" style="background:${i.iconBg};"><i class="ti ${i.icon}" style="color:${i.iconColor};font-size:17px;"></i></div>
        <div class="int-name">${i.fullName}</div>
        <span class="int-badge mock">${i.label}</span>
      </div>
    `).join('');
  }

  function renderNotifications() {
    const el = document.getElementById('notifList');
    if (!el) return;
    el.innerHTML = DATA.notifications.map(n => `
      <div class="notif-item">
        <div class="notif-item-icon" style="background:${n.iconBg};"><i class="ti ${n.icon}" style="color:${n.iconColor};font-size:16px;"></i></div>
        <div class="notif-item-body">
          <div class="notif-item-title">${n.title}</div>
          <div class="notif-item-sub">${n.sub} · ${n.time}</div>
        </div>
      </div>
    `).join('');
  }

  function renderAgentsView() {
    const el = document.getElementById('agentsGrid');
    if (!el || el.children.length > 0) return;
    el.innerHTML = DATA.agentDefs.map(a => `
      <div class="agent-card">
        <div class="agent-card-top">
          <div class="agent-header">
            <div class="agent-avatar" style="background:${a.avatarBg};">
              <i class="ti ${a.icon}" style="color:var(--ac-purple);font-size:22px;"></i>
              <span class="agent-status-dot ready" id="agentDot_${a.id}"></span>
            </div>
            <div>
              <div class="agent-name">${a.name}</div>
              <div class="agent-role">${a.role}</div>
            </div>
          </div>
          <div class="agent-desc">${a.desc}</div>
          <div class="agent-caps">
            ${a.caps.map(c => `<div class="agent-cap"><i class="ti ti-check"></i>${c}</div>`).join('')}
          </div>
        </div>
        <div class="agent-card-footer">
          <button class="agent-run-btn" id="agentBtn_${a.id}" onclick="${a.id}.trigger ? ${a.id}.trigger() : App.runAgent('${a.id}')">
            <i class="ti ti-player-play"></i> Run agent
          </button>
          <button class="agent-config-btn" onclick="App.configAgent('${a.id}')" title="Configure"><i class="ti ti-settings"></i></button>
        </div>
      </div>
    `).join('');
  }

  function runAgent(id) {
    const def = DATA.agentDefs.find(a => a.id === id);
    if (def) def.trigger();
  }

  async function runAllAgents() {
    Toast.show('Running all agents in sequence...', 'info');
    navigate('agents');
    const agents = [DealAgent, ADMAgent, ISPAgent, DSPAgent, TimelineAgent, DeliverablesAgent];
    for (const agent of agents) {
      if (agent.runAgent) await agent.runAgent();
    }
    Toast.show('All agents completed', 'success');
  }

  function configAgent(id) {
    App.openModal('Configure agent — ' + id, `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Trigger mode</label>
          <select class="form-input"><option>Manual</option><option>On deal submit</option><option>Scheduled</option></select>
        </div>
        <div class="form-group"><label class="form-label">Notification</label>
          <select class="form-input"><option>Email</option><option>In-app</option><option>Both</option></select>
        </div>
        <div class="form-group"><label class="form-label">Log level</label>
          <select class="form-input"><option>Info</option><option>Debug</option><option>Errors only</option></select>
        </div>
      </div>
    `, `<button class="btn-secondary" onclick="App.closeModal()">Cancel</button><button class="btn-primary" onclick="App.closeModal();Toast.show('Agent config saved','success')">Save config</button>`);
  }

  function setConnectionStatus(status) {
    const dot = document.getElementById('connDot');
    const txt = document.getElementById('connText');
    if (!dot || !txt) return;
    if (status === 'connected') { dot.className='conn-dot'; txt.textContent='All systems connected'; }
    else if (status === 'sandbox') { dot.className='conn-dot warning'; txt.textContent='Sandbox mode active'; }
    else { dot.className='conn-dot offline'; txt.textContent='Offline'; }
  }

  function init() {
    // Simulate async connection
    setTimeout(() => setConnectionStatus('sandbox'), 1200);

    // Render home elements
    renderStats(currentRole);
    renderWorkflowStepper();
    renderQuickActions();
    renderIntegrationStatus();
    renderNotifications();
    DealAgent.init();

    // Log startup
    AgentOrchestrator.log('App', 'Solution Governance Hub v2.0 initialised', 'success');
    AgentOrchestrator.log('App', 'DSP, myISP, ADM running in sandbox mode — provide API endpoints to go live', 'warning');
    AgentOrchestrator.log('App', 'All 6 AI agents ready and standing by', 'info');

    // Click outside notifications to close
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('notifPanel');
      if (panel && !panel.contains(e.target) && !e.target.closest('.icon-btn')) {
        panel.classList.remove('open');
      }
    });
  }

  return { navigate, setRole, startNewDeal, toggleSidebar, toggleNotifications, clearNotifications, openModal, closeModal, runAllAgents, runAgent, configAgent, init };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
