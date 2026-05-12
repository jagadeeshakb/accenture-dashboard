/* =============================================
   Accenture Solution Governance Dashboard
   app.js
   ============================================= */

'use strict';

// ---- DATA ----

const requirementsData = [
  {
    title: 'Security & compliance',
    icon: 'ti-shield-lock',
    bg: '#EEEDFE', ic: '#534AB7',
    teams: [
      'DCSO — Security architecture review',
      'QA — Compliance validation',
      'Cloud Security SME — Landing zone guardrails',
      'IAM Lead — Identity & access controls',
    ],
  },
  {
    title: 'Infrastructure & platform',
    icon: 'ti-topology-star',
    bg: '#E6F1FB', ic: '#185FA5',
    teams: [
      'Cloud Platform Engineer — Landing zone build',
      'Network Architect — Connectivity design',
      'DevOps Lead — Pipeline & IaC setup',
      'SRE — Monitoring & observability',
    ],
  },
  {
    title: 'Application & deployment',
    icon: 'ti-code',
    bg: '#E1F5EE', ic: '#0F6E56',
    teams: [
      'Application Architect — Solution design',
      'Dev Lead — Application deployment',
      'QA Engineer — E2E & performance testing',
      'Release Manager — Deployment coordination',
    ],
  },
  {
    title: 'Governance & documentation',
    icon: 'ti-file-analytics',
    bg: '#FAEEDA', ic: '#BA7517',
    teams: [
      'Solution Lead — HLD / LLD sign-off',
      'Technical Writer — Ops & design docs',
      'Transition Manager — Transition documents',
      'Delivery Manager — Go-live sign-off',
    ],
  },
  {
    title: 'Resource & mobilisation',
    icon: 'ti-users-group',
    bg: '#FAECE7', ic: '#993C1D',
    teams: [
      'Resource Manager — FTE allocation',
      'Talent Acquisition — Specialist onboarding',
      'Programme Manager — Mobilisation plan',
      'Workforce Planning — Capacity modelling',
    ],
  },
  {
    title: 'Hypercare & operations',
    icon: 'ti-headset',
    bg: '#EAF3DE', ic: '#3B6D11',
    teams: [
      'Operations Lead — Hypercare support',
      'Service Manager — Incident management',
      'Client Lead — Stakeholder engagement',
      'ITSM Team — Run-state handover',
    ],
  },
];

const phasesData = [
  {
    id: 'p1',
    name: 'Phase 1 — Mobilisation & setup',
    sub: 'Resource onboarding, environment setup, baseline',
    weeks: 'Wk 1–4',
    icon: 'ti-flag',
    iconBg: '#EEEDFE', iconColor: '#534AB7',
    activities: [
      { num: 1, name: 'Resource mobilisation & onboarding', fte: '6 FTE', duration: 'Wk 1–2' },
      { num: 2, name: 'Environment strategy definition (Dev / UAT / Prod)', fte: '3 FTE', duration: 'Wk 1–3' },
      { num: 3, name: 'Landing zone provisioning (secured, standard approach)', fte: '5 FTE', duration: 'Wk 2–4' },
      { num: 4, name: 'IAM, network & security baseline configuration', fte: '4 FTE', duration: 'Wk 3–4' },
    ],
  },
  {
    id: 'p2',
    name: 'Phase 2 — Deployment',
    sub: 'Application deployment, pipeline, IaC automation',
    weeks: 'Wk 5–10',
    icon: 'ti-rocket',
    iconBg: '#E6F1FB', iconColor: '#185FA5',
    activities: [
      { num: 5, name: 'CI/CD pipeline build & IaC automation', fte: '4 FTE', duration: 'Wk 5–7' },
      { num: 6, name: 'Application deployment to Dev environment', fte: '5 FTE', duration: 'Wk 6–8' },
      { num: 7, name: 'Application deployment to UAT environment', fte: '5 FTE', duration: 'Wk 8–10' },
      { num: 8, name: 'Monitoring & observability configuration', fte: '3 FTE', duration: 'Wk 7–10' },
    ],
  },
  {
    id: 'p3',
    name: 'Phase 3 — Testing',
    sub: 'E2E, performance, security & UAT sign-off',
    weeks: 'Wk 11–15',
    icon: 'ti-test-pipe',
    iconBg: '#FAEEDA', iconColor: '#BA7517',
    activities: [
      { num: 9,  name: 'End-to-end integration testing', fte: '4 FTE', duration: 'Wk 11–13' },
      { num: 10, name: 'Performance & load testing', fte: '3 FTE', duration: 'Wk 12–14' },
      { num: 11, name: 'Security & penetration testing', fte: '2 FTE', duration: 'Wk 13–15' },
      { num: 12, name: 'UAT execution & defect resolution', fte: '4 FTE', duration: 'Wk 13–15' },
    ],
  },
  {
    id: 'p4',
    name: 'Phase 4 — Go-live & hypercare',
    sub: 'Production deployment, support & client sign-off',
    weeks: 'Wk 16–20',
    icon: 'ti-circle-check',
    iconBg: '#E1F5EE', iconColor: '#0F6E56',
    activities: [
      { num: 13, name: 'Production deployment & cutover', fte: '6 FTE', duration: 'Wk 16–17' },
      { num: 14, name: 'Hypercare support (24×7 war room)', fte: '5 FTE', duration: 'Wk 17–19' },
      { num: 15, name: 'Operations handover to run-state team', fte: '3 FTE', duration: 'Wk 19–20' },
      { num: 16, name: 'Go-live review & client sign-off', fte: '2 FTE', duration: 'Wk 20' },
    ],
  },
];

const ganttData = [
  { label: 'Mobilisation & setup', fte: '6 FTE', start: 0, end: 20, color: '#7F77DD' },
  { label: 'Deployment',           fte: '5 FTE', start: 20, end: 50, color: '#378ADD' },
  { label: 'Testing',              fte: '4 FTE', start: 50, end: 75, color: '#EF9F27' },
  { label: 'Go-live & hypercare',  fte: '6 FTE', start: 75, end: 100, color: '#1D9E75' },
];

const deliverablesData = [
  {
    name: 'High-level design (HLD)',
    owner: 'Solution Lead + Architect',
    phase: 'Phase 1–2',
    icon: 'ti-layout-2',
    iconBg: '#EEEDFE', iconColor: '#534AB7',
    status: 'In progress', statusClass: 'status-inprogress',
  },
  {
    name: 'Low-level design (LLD)',
    owner: 'Platform + App Architect',
    phase: 'Phase 2',
    icon: 'ti-sitemap',
    iconBg: '#E6F1FB', iconColor: '#185FA5',
    status: 'Pending', statusClass: 'status-pending',
  },
  {
    name: 'Operations document',
    owner: 'Operations Lead',
    phase: 'Phase 4',
    icon: 'ti-settings',
    iconBg: '#E1F5EE', iconColor: '#0F6E56',
    status: 'Pending', statusClass: 'status-pending',
  },
  {
    name: 'Design document',
    owner: 'Solution Architect',
    phase: 'Phase 2',
    icon: 'ti-pencil-code',
    iconBg: '#FAEEDA', iconColor: '#BA7517',
    status: 'In progress', statusClass: 'status-inprogress',
  },
  {
    name: 'Transition document',
    owner: 'Transition Manager',
    phase: 'Phase 4',
    icon: 'ti-transfer',
    iconBg: '#FAECE7', iconColor: '#993C1D',
    status: 'Pending', statusClass: 'status-pending',
  },
  {
    name: 'Hypercare support plan',
    owner: 'Operations + Service Lead',
    phase: 'Phase 4',
    icon: 'ti-headset',
    iconBg: '#EAF3DE', iconColor: '#3B6D11',
    status: 'Pending', statusClass: 'status-pending',
  },
  {
    name: 'Go-live sign-off report',
    owner: 'Delivery Manager + Client',
    phase: 'Phase 4',
    icon: 'ti-circle-check',
    iconBg: '#E1F5EE', iconColor: '#0F6E56',
    status: 'Pending', statusClass: 'status-pending',
  },
  {
    name: 'Test evidence pack',
    owner: 'QA Engineer + Release Manager',
    phase: 'Phase 3',
    icon: 'ti-clipboard-check',
    iconBg: '#EEEDFE', iconColor: '#534AB7',
    status: 'In progress', statusClass: 'status-inprogress',
  },
];

const breadcrumbMap = {
  deal: 'Deal Governance',
  req: 'Requirements Mapping',
  timeline: 'Timeline & FTEs',
  deliverables: 'Deliverables',
};

// ---- RENDER FUNCTIONS ----

function renderRequirements() {
  const grid = document.getElementById('req-grid');
  if (!grid) return;
  grid.innerHTML = requirementsData.map(r => `
    <div class="req-card">
      <div class="req-header">
        <div class="req-icon" style="background:${r.bg};">
          <i class="ti ${r.icon}" style="color:${r.ic};" aria-hidden="true"></i>
        </div>
        <div class="req-title">${r.title}</div>
      </div>
      <div class="req-teams">
        ${r.teams.map(t => `<div class="team-tag">${t}</div>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderPhases() {
  const container = document.getElementById('phases-container');
  if (!container) return;
  container.innerHTML = phasesData.map(p => `
    <div class="phase-block">
      <button class="phase-header" onclick="togglePhase('${p.id}')" aria-expanded="false" id="btn-${p.id}">
        <div class="phase-icon" style="background:${p.iconBg};">
          <i class="ti ${p.icon}" style="color:${p.iconColor};" aria-hidden="true"></i>
        </div>
        <div class="phase-info">
          <div class="phase-name">${p.name}</div>
          <div class="phase-sub">${p.sub}</div>
        </div>
        <span class="phase-wks">${p.weeks}</span>
        <i class="ti ti-chevron-down phase-chevron" id="chev-${p.id}" aria-hidden="true"></i>
      </button>
      <div class="phase-body" id="body-${p.id}" role="region" aria-labelledby="btn-${p.id}">
        ${p.activities.map(a => `
          <div class="activity-row">
            <span class="act-num">${a.num}</span>
            <span class="act-name">${a.name}</span>
            <span class="act-fte">${a.fte}</span>
            <span class="act-duration">${a.duration}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderGantt() {
  const container = document.getElementById('gantt-rows');
  if (!container) return;
  container.innerHTML = ganttData.map(g => `
    <div class="gantt-row">
      <div class="gantt-row-label">${g.label}</div>
      <div class="gantt-row-fte">${g.fte}</div>
      <div class="gantt-row-bar">
        <div class="gantt-fill" style="left:${g.start}%;width:${g.end - g.start}%;background:${g.color};">
          ${(g.end - g.start) > 15 ? g.label.split(' ')[0] : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function renderDeliverables() {
  const grid = document.getElementById('deliv-grid');
  if (!grid) return;
  grid.innerHTML = deliverablesData.map(d => `
    <div class="deliv-card">
      <div class="deliv-icon-wrap" style="background:${d.iconBg};">
        <i class="ti ${d.icon}" style="color:${d.iconColor};" aria-hidden="true"></i>
      </div>
      <div class="deliv-body">
        <div class="deliv-name">${d.name}</div>
        <div class="deliv-meta">${d.owner}</div>
        <div class="deliv-footer">
          <span class="deliv-phase">${d.phase}</span>
          <span class="deliv-status ${d.statusClass}">${d.status}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ---- INTERACTIONS ----

function switchTab(id) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === id);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
  const label = document.getElementById('breadcrumb-label');
  if (label) label.textContent = breadcrumbMap[id] || id;
}

function togglePhase(id) {
  const body = document.getElementById('body-' + id);
  const chev = document.getElementById('chev-' + id);
  const btn  = document.getElementById('btn-' + id);
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chev && chev.classList.toggle('open', !isOpen);
  btn && btn.setAttribute('aria-expanded', String(!isOpen));
}

// ---- INIT ----

document.addEventListener('DOMContentLoaded', () => {
  renderRequirements();
  renderPhases();
  renderGantt();
  renderDeliverables();
});
