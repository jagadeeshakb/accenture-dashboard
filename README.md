# SA Governance Dashboard

A clean, interactive dashboard for Accenture deal governance, requirements mapping, delivery timelines, and key deliverables tracking.

## Features

- **Deal Governance** — Three-tier deal size framework with DSP approval workflow
- **Requirements Mapping** — Workstream-to-team assignment across six domains
- **Timeline & FTEs** — 20-week phased delivery plan with expandable activity details and Gantt view
- **Deliverables Tracker** — Eight key artefacts with owner, phase, and status

## Files

```
accenture-dashboard/
├── index.html    # Main HTML structure
├── styles.css    # Full stylesheet
├── app.js        # Data and interactivity
└── README.md     # This file
```

## Deploy to GitHub Pages

### Option 1 — Upload via GitHub web UI (no Git required)

1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Name it `accenture-dashboard`, set to **Public**, tick "Add a README"
4. Click **Create repository**
5. Click **Add file** → **Upload files**
6. Drag and drop all four files (`index.html`, `styles.css`, `app.js`, `README.md`)
7. Click **Commit changes**
8. Go to **Settings** → **Pages**
9. Under Branch, select `main` and `/ (root)` → click **Save**
10. After ~60 seconds your dashboard is live at:
    ```
    https://YOUR-USERNAME.github.io/accenture-dashboard/
    ```

### Option 2 — Deploy via Git CLI

```bash
# Clone your new (empty) repo
git clone https://github.com/YOUR-USERNAME/accenture-dashboard.git
cd accenture-dashboard

# Copy the dashboard files into the folder, then:
git add .
git commit -m "Initial dashboard release"
git push origin main
```

Then enable GitHub Pages in **Settings → Pages → Branch: main / root → Save**.

## Updating the dashboard

To update any content, edit the relevant file and push/upload again — GitHub Pages redeploys automatically within about a minute.

| What to change | File to edit |
|---|---|
| Panel layout & structure | `index.html` |
| Colors, spacing, fonts | `styles.css` |
| Data (teams, phases, deliverables) | `app.js` |

## Local preview

Open `index.html` directly in any browser — no server needed.

---

Built for Accenture internal use · Solution Governance Framework v1.0
