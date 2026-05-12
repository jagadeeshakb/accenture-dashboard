/* agents/orchestrator.js */

const AgentOrchestrator = (() => {
  const state = { agents: {}, logLines: [] };

  function log(agentName, msg, level = 'info') {
    const now = new Date();
    const time = now.toTimeString().slice(0,8);
    const line = { time, agent: agentName, msg, level };
    state.logLines.push(line);
    renderLog();
  }

  function renderLog() {
    const el = document.getElementById('agentLog');
    if (!el) return;
    el.innerHTML = state.logLines.slice(-80).map(l => `
      <div class="log-line ${l.level}">
        <span class="log-time">${l.time}</span>
        <span class="log-agent">[${l.agent}]</span>
        <span class="log-msg">${l.msg}</span>
      </div>
    `).join('');
    el.scrollTop = el.scrollHeight;
  }

  function clearLog() {
    state.logLines = [];
    renderLog();
    Toast.show('Log cleared', 'info');
  }

  function setAgentStatus(id, status) {
    state.agents[id] = status;
    const btn = document.getElementById('agentBtn_' + id);
    const dot = document.getElementById('agentDot_' + id);
    if (btn) {
      if (status === 'running') {
        btn.innerHTML = '<i class="ti ti-loader-2"></i> Running...';
        btn.classList.add('running');
      } else {
        btn.innerHTML = '<i class="ti ti-player-play"></i> Run agent';
        btn.classList.remove('running');
      }
    }
    if (dot) {
      dot.className = 'agent-status-dot ' + status;
    }
    const lastRun = document.getElementById('agentLastRun_' + id);
    if (lastRun && status === 'ready') {
      const t = new Date().toLocaleTimeString();
      lastRun.textContent = 'Last run: ' + t;
    }
  }

  async function runWithDelay(id, agentName, steps) {
    setAgentStatus(id, 'running');
    log(agentName, 'Agent started', 'info');
    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay || 600));
      log(agentName, step.msg, step.level || 'info');
    }
    setAgentStatus(id, 'ready');
    log(agentName, 'Agent completed successfully', 'success');
  }

  return { log, clearLog, setAgentStatus, runWithDelay };
})();
