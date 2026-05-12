# Accenture Solution Governance Hub v2.0

A full-featured, out-of-the-box deal governance dashboard with AI agents and integration-ready connectors for DSP, myISP and ADM Estimator.

---

## What's included

| Feature | Description |
|---|---|
| **Deal governance** | Auto-classifies deals into Tier 1/2/3, sets approvers, routes to DSP |
| **ADM Estimator** | Live effort & cost estimation with CSV/JSON export |
| **myISP resources** | FTE demand planning, mobilisation chart, resource request builder |
| **DSP portal** | Submission tracking, approval status, escalation management |
| **Timeline & phases** | 20-week delivery programme with expandable phases and Gantt |
| **Deliverables tracker** | 8 key artefacts with status management and sign-off workflow |
| **6 AI Agents** | Specialised agents for each domain — run manually or trigger automatically |
| **Role-based views** | Deal Owner, Solution Lead, Resource Manager, DCSO, Delivery Manager |
| **Notification system** | In-app alerts for approvals, reviews and escalations |

---

## File structure

```
accenture-v2/
├── index.html              # Main HTML shell
├── app.js                  # App controller, navigation, toast, modal
├── data/
│   └── data.js             # All static data (phases, deliverables, roles, etc.)
├── agents/
│   ├── orchestrator.js     # Agent coordinator & activity log
│   ├── deal-agent.js       # Deal governance & DSP routing agent
│   ├── adm-agent.js        # ADM effort & cost estimation agent
│   ├── dsp-agent.js        # DSP submission & tracking agent
│   ├── isp-agent.js        # myISP resource mobilisation agent
│   ├── timeline-agent.js   # Timeline generation & Gantt agent
│   └── deliverables-agent.js # Deliverables tracking & sign-off agent
└── styles/
    ├── base.css            # Design tokens, resets, buttons, utilities
    ├── layout.css          # Sidebar, topbar, content shell, modal, toast
    ├── components.css      # View-specific component styles
    ├── agents.css          # Agent cards and console
    └── integrations.css    # DSP/myISP integration UI styles
```

---

## Deploy to GitHub Pages (5 minutes)

### Option A — Upload via GitHub web UI (no code required)

1. Go to [github.com](https://github.com) → sign in → **+** → **New repository**
2. Name: `accenture-sgh`, visibility: **Public**, tick "Add a README" → **Create repository**
3. Click **Add file** → **Upload files**
4. Upload the **entire folder** preserving the structure (drag all files and folders)
5. Click **Commit changes**
6. Go to **Settings** → **Pages** → Branch: `main`, folder: `/(root)` → **Save**
7. Live at: `https://YOUR-USERNAME.github.io/accenture-sgh/`

### Option B — Git CLI

```bash
git clone https://github.com/YOUR-USERNAME/accenture-sgh.git
cd accenture-sgh

# Copy all dashboard files here, then:
git add .
git commit -m "feat: Accenture SGH v2.0"
git push origin main
```

Then enable GitHub Pages in Settings → Pages.

---

## Connect live integrations

The dashboard runs in **sandbox mode** by default. To connect real integrations:

### DSP integration
In `agents/dsp-agent.js`, replace the mock submit/fetch functions with calls to your DSP API:
```javascript
// Replace Toast.show('...sandbox...') with:
const res = await fetch('https://your-dsp-endpoint.accenture.com/api/deals', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + DSP_TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify(dealPayload)
});
```

### myISP integration
In `agents/isp-agent.js`, replace `submitToISP()` with a POST to the myISP API:
```javascript
const res = await fetch('https://myisp.accenture.com/api/resource-requests', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + ISP_TOKEN },
  body: JSON.stringify(requestPayload)
});
```

### ADM Estimator integration
In `agents/adm-agent.js`, replace `exportToADM()` with an SSO-initiated deep-link:
```javascript
window.open('https://adm.accenture.com/estimate?payload=' + encodeURIComponent(JSON.stringify(payload)));
```

### SSO / Accenture network
For production deployment on Accenture infrastructure:
- Host on Accenture's internal web server or Azure Static Web Apps
- Add MSAL (Microsoft Authentication Library) for SSO in `index.html`
- Replace all mock `Toast.show('SSO required...')` calls with authenticated fetch calls

---

## Customising data

All data lives in `data/data.js` — edit this file to:
- Add/remove phases and activities
- Change deliverable owners and statuses
- Update FTE demand plan roles and rates
- Modify DSP deal submissions

---

## Local preview

Open `index.html` in any browser — no server or install required.

---

Built for Accenture internal use · Solution Governance Hub v2.0 · May 2025
