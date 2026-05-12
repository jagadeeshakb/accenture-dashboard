/* agents/deal-agent.js */

const DealAgent = (() => {

  const state = { tier: null, dealData: {} };

  function getTier(value) {
    if (!value || value <= 0) return null;
    if (value < 5000000) return 1;
    if (value < 10000000) return 2;
    return 3;
  }

  function onInput() {
    const name = document.getElementById('dealName')?.value;
    const client = document.getElementById('clientName')?.value;
    const type = document.getElementById('dealType')?.value;
    state.dealData = { name, client, type };
    evaluate();
  }

  function evaluate() {
    const valEl = document.getElementById('dealValue');
    const val = parseFloat(valEl?.value) || 0;
    const tier = getTier(val);
    state.tier = tier;
    state.dealData.value = val;

    renderTierResult(tier, val);
    renderTierCards(tier);
    renderApprovalWorkflow(tier);
    updateDealContext();
  }

  function renderTierResult(tier, val) {
    const el = document.getElementById('tierResult');
    if (!el) return;
    if (!tier) { el.style.display = 'none'; return; }

    const configs = {
      1: { cls:'t1', icon:'✅', title:'Tier 1 — Small deal (< $5M)', sub:'No DCSO/QA or Solution Lead approval required. Route directly via DSP.', col:'var(--green-600)' },
      2: { cls:'t2', icon:'⚡', title:'Tier 2 — Mid deal ($5M – $10M)', sub:'DCSO/QA and Solution Lead approval required. Submit via DSP.', col:'var(--amber-600)' },
      3: { cls:'t3', icon:'🔷', title:'Tier 3 — Large deal (> $10M)', sub:'Full governance board review required. All approvers must sign off via DSP.', col:'var(--ac-purple)' },
    };
    const c = configs[tier];
    el.className = 'tier-result ' + c.cls;
    el.style.display = 'flex';
    el.innerHTML = `
      <div class="tier-result-icon">${c.icon}</div>
      <div class="tier-result-body">
        <div class="tier-result-title" style="color:${c.col};">${c.title}</div>
        <div class="tier-result-sub">${c.sub}</div>
      </div>
      <button class="btn-primary" onclick="App.navigate('dsp')">
        <i class="ti ti-route"></i> Submit to DSP
      </button>
    `;
  }

  function renderTierCards(activeTier) {
    const el = document.getElementById('dealTiersDisplay');
    if (!el) return;

    const tiers = [
      {
        num:1, range:'< $5M', name:'Small deal', stripe:'t1-s',
        approvals:[
          { name:'DCSO / QA', yes:false, tag:'Not required', cls:'no-req' },
          { name:'Solution lead', yes:false, tag:'Not required', cls:'no-req' },
          { name:'DSP routing', yes:true, tag:'Required', cls:'req' },
        ]
      },
      {
        num:2, range:'$5M – $10M', name:'Mid deal', stripe:'t2-s',
        approvals:[
          { name:'DCSO / QA', yes:true, tag:'Required', cls:'req' },
          { name:'Solution lead', yes:true, tag:'Required', cls:'req' },
          { name:'DSP routing', yes:true, tag:'Required', cls:'req' },
        ]
      },
      {
        num:3, range:'> $10M', name:'Large deal', stripe:'t3-s',
        approvals:[
          { name:'DCSO / QA', yes:true, tag:'Mandatory', cls:'mand' },
          { name:'Solution lead', yes:true, tag:'Mandatory', cls:'mand' },
          { name:'Governance board', yes:true, tag:'Mandatory', cls:'mand' },
          { name:'DSP routing', yes:true, tag:'Mandatory', cls:'mand' },
        ]
      },
    ];

    el.innerHTML = tiers.map(t => `
      <div class="dt-card ${activeTier === t.num ? 'highlighted' : ''}">
        <div class="dt-stripe ${t.stripe}"></div>
        <div class="dt-body">
          <div class="dt-tier-label">Tier ${t.num}</div>
          <div class="dt-amount">${t.range}</div>
          <div class="dt-name">${t.name}</div>
          <div class="dt-divider"></div>
          <div class="dt-approvals">
            ${t.approvals.map(a => `
              <div class="dt-appr">
                <div class="dt-appr-dot ${a.yes ? 'yes' : 'no'}">
                  <i class="ti ${a.yes ? 'ti-check' : 'ti-x'}"></i>
                </div>
                <span class="dt-appr-name">${a.name}</span>
                <span class="dt-appr-tag ${a.cls}">${a.tag}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderApprovalWorkflow(tier) {
    const card = document.getElementById('approvalWorkflowCard');
    const track = document.getElementById('approvalTrack');
    if (!card || !track) return;

    if (!tier) { card.style.display = 'none'; return; }
    card.style.display = 'block';

    const baseSteps = [
      { icon:'ti-file-description', name:'Deal intake', sub:'Submission', state:'done' },
      { icon:'ti-filter', name:'Tier assessment', sub:'Deal size check', state:'done' },
    ];

    const approvalSteps = {
      1: [],
      2: [
        { icon:'ti-shield-check', name:'DCSO / QA', sub:'Review', state:'pending' },
        { icon:'ti-user-check', name:'Solution lead', sub:'Sign-off', state:'waiting' },
      ],
      3: [
        { icon:'ti-shield-check', name:'DCSO / QA', sub:'Review', state:'pending' },
        { icon:'ti-user-check', name:'Solution lead', sub:'Sign-off', state:'waiting' },
        { icon:'ti-building', name:'Gov. board', sub:'Full review', state:'waiting' },
      ],
    };

    const endSteps = [
      { icon:'ti-circle-check', name:'DSP sign-off', sub:'Confirmation', state:'waiting' },
      { icon:'ti-rocket', name:'Deal activated', sub:'Mobilise', state:'waiting' },
    ];

    const allSteps = [...baseSteps, ...(approvalSteps[tier] || []), ...endSteps];
    track.innerHTML = allSteps.map((s, i) => `
      ${i > 0 ? '<div class="appr-connector"></div>' : ''}
      <div class="appr-step">
        <div class="appr-step-icon ${s.state}">
          <i class="ti ${s.icon}"></i>
        </div>
        <div class="appr-step-name">${s.name}</div>
        <div class="appr-step-sub">${s.sub}</div>
      </div>
    `).join('');
  }

  function updateDealContext() {
    const pill = document.getElementById('dealContextLabel');
    if (!pill) return;
    const name = state.dealData.name || 'Unnamed deal';
    const val = state.dealData.value ? ' · $' + (state.dealData.value/1e6).toFixed(1) + 'M' : '';
    pill.textContent = name + val;
  }

  function exportDealPack() {
    const d = state.dealData;
    const pack = {
      deal_name: d.name || 'Unnamed',
      client: d.client || '',
      deal_type: d.type || '',
      deal_value_usd: d.value || 0,
      tier: state.tier,
      approvals_required: state.tier === 1 ? ['DSP'] : state.tier === 2 ? ['DCSO','QA','Solution Lead','DSP'] : ['DCSO','QA','Solution Lead','Governance Board','DSP'],
      generated: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'deal-pack.json'; a.click();
    URL.revokeObjectURL(url);
    Toast.show('Deal pack exported', 'success');
    AgentOrchestrator.log('DealAgent', 'Deal pack exported: ' + (d.name || 'Unnamed'), 'success');
  }

  async function runAgent() {
    await AgentOrchestrator.runWithDelay('deal_agent', 'DealAgent', [
      { msg:'Reading deal parameters from form...', delay:500 },
      { msg:'Classifying deal tier based on value threshold...', delay:700 },
      { msg:'Identifying required approvers for tier ' + (state.tier || 'unknown') + '...', delay:600 },
      { msg:'Building DSP submission payload...', delay:800 },
      { msg:'Routing to DSP approval workflow...', delay:700 },
      { msg:'Notifying approvers via email simulation...', delay:500, level:'success' },
    ]);
    Toast.show('Deal governance agent completed', 'success');
    App.navigate('dsp');
  }

  // Initialise tier cards on page load
  function init() { renderTierCards(null); }

  return { evaluate, onInput, exportDealPack, runAgent, init, getTier, state };
})();
