const dataSets = {
  today: {
    multipliers: { all: 1, voice: .54, digital: .29, retention: .17 },
    contacts: [214, 286, 338, 402, 451, 398, 315],
    sla: [87, 85, 84, 81, 80, 83, 86],
    kpis: { answerRate: 95.8, serviceLevel: 84.9, asa: 16, aht: 3.5, qaScore: 89.1, csat: 92.6 }
  },
  "7d": {
    multipliers: { all: 1, voice: .56, digital: .27, retention: .17 },
    contacts: [1820, 2140, 2385, 2610, 2470, 1965, 1725],
    sla: [86, 85, 83, 82, 84, 86, 87],
    kpis: { answerRate: 95.4, serviceLevel: 84.7, asa: 17, aht: 3.6, qaScore: 88.6, csat: 92.1 }
  },
  "30d": {
    multipliers: { all: 1, voice: .55, digital: .28, retention: .17 },
    contacts: [7220, 8040, 8710, 9180, 8890, 7630, 7040],
    sla: [84, 83, 82, 81, 83, 85, 86],
    kpis: { answerRate: 94.8, serviceLevel: 83.4, asa: 19, aht: 3.7, qaScore: 87.9, csat: 91.4 }
  }
};

const teams = [
  { id: "voice", name: "Voice", initials: "VO", contacts: 9634, answer: 95.7, aht: 3.8, qa: 89.2, csat: 92.7, status: "Healthy" },
  { id: "digital", name: "Digital Care", initials: "DC", contacts: 4652, answer: 97.2, aht: 3.1, qa: 91.4, csat: 94.1, status: "Healthy" },
  { id: "retention", name: "Retention", initials: "RT", contacts: 2921, answer: 92.8, aht: 4.4, qa: 84.9, csat: 87.8, status: "Watch" }
];

const channels = [
  { name: "Voice", value: 56 },
  { name: "WhatsApp", value: 21 },
  { name: "Email", value: 12 },
  { name: "Chat", value: 11 }
];

const qaDimensions = [
  ["Greeting & verification", 94],
  ["Needs discovery", 90],
  ["Accuracy & compliance", 92],
  ["Empathy", 87],
  ["Objection handling", 82],
  ["Closing & next steps", 86]
];

const signals = [
  { level: "warn", icon: "!", title: "Retention AHT above target", body: "Average handle time is 4.4m. Review call drivers and hold-time patterns." },
  { level: "good", icon: "✓", title: "Digital CSAT leading", body: "Digital Care is sustaining 94.1% CSAT with the strongest QA score." },
  { level: "danger", icon: "↑", title: "Peak-hour pressure", body: "Service level softens during the highest demand window. Consider intraday reallocation." }
];

const fmt = new Intl.NumberFormat("en-US");
const css = getComputedStyle(document.documentElement);

Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
Chart.defaults.color = css.getPropertyValue("--muted").trim();

const ctxVolume = document.getElementById("volumeChart");
const ctxChannel = document.getElementById("channelChart");

const volumeChart = new Chart(ctxVolume, {
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        type: "bar",
        label: "Contacts",
        data: dataSets["7d"].contacts,
        yAxisID: "y",
        borderRadius: 7,
        backgroundColor: "rgba(37, 99, 235, .78)",
        maxBarThickness: 30
      },
      {
        type: "line",
        label: "Service level",
        data: dataSets["7d"].sla,
        yAxisID: "y1",
        borderColor: "#0f9f8f",
        backgroundColor: "#0f9f8f",
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: .38,
        borderWidth: 2.5
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => context.dataset.label === "Service level"
            ? `${context.dataset.label}: ${context.raw}%`
            : `${context.dataset.label}: ${fmt.format(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, .13)" },
        ticks: { font: { size: 9 } }
      },
      y1: {
        position: "right",
        min: 70,
        max: 100,
        grid: { display: false },
        ticks: { callback: v => v + "%", font: { size: 9 } }
      }
    }
  }
});

const channelChart = new Chart(ctxChannel, {
  type: "doughnut",
  data: {
    labels: channels.map(c => c.name),
    datasets: [{
      data: channels.map(c => c.value),
      backgroundColor: ["#2563eb", "#0f9f8f", "#7c3aed", "#94a3b8"],
      borderWidth: 0,
      hoverOffset: 4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => `${c.label}: ${c.raw}%` } }
    }
  }
});

function renderChannelSummary() {
  document.getElementById("channelSummary").innerHTML = channels.map(c => `
    <div class="channel-row">
      <span>${c.name}</span>
      <strong>${c.value}%</strong>
    </div>
  `).join("");
}

function renderQa() {
  document.getElementById("qaList").innerHTML = qaDimensions.map(([name, score]) => `
    <div class="qa-item">
      <div class="qa-meta"><span>${name}</span><strong>${score}%</strong></div>
      <div class="bar"><span style="width:${score}%"></span></div>
    </div>
  `).join("");
}

let sortDesc = true;
function renderTeams(filter = "all") {
  let rows = teams.filter(t => filter === "all" || t.id === filter);
  rows = [...rows].sort((a, b) => sortDesc ? b.qa - a.qa : a.qa - b.qa);

  document.getElementById("teamTable").innerHTML = rows.map(t => `
    <tr>
      <td><div class="team-name"><span class="team-avatar">${t.initials}</span>${t.name}</div></td>
      <td>${fmt.format(t.contacts)}</td>
      <td>${t.answer.toFixed(1)}%</td>
      <td>${t.aht.toFixed(1)}m</td>
      <td><strong>${t.qa.toFixed(1)}%</strong></td>
      <td>${t.csat.toFixed(1)}%</td>
      <td><span class="status ${t.status.toLowerCase()}">${t.status}</span></td>
    </tr>
  `).join("");
}

function renderSignals() {
  document.getElementById("signals").innerHTML = signals.map(s => `
    <div class="signal">
      <div class="signal-top">
        <span class="signal-icon ${s.level}">${s.icon}</span>
        <span>${s.title}</span>
      </div>
      <p>${s.body}</p>
    </div>
  `).join("");
}

function updateKpis(period) {
  const k = dataSets[period].kpis;
  document.getElementById("answerRate").textContent = k.answerRate.toFixed(1) + "%";
  document.getElementById("serviceLevel").textContent = k.serviceLevel.toFixed(1) + "%";
  document.getElementById("asa").textContent = k.asa + "s";
  document.getElementById("aht").textContent = k.aht.toFixed(1) + "m";
  document.getElementById("qaScore").textContent = k.qaScore.toFixed(1) + "%";
  document.getElementById("csat").textContent = k.csat.toFixed(1) + "%";
}

function updateDashboard() {
  const period = document.getElementById("periodFilter").value;
  const team = document.getElementById("teamFilter").value;
  const current = dataSets[period];
  const multiplier = current.multipliers[team];

  volumeChart.data.datasets[0].data = current.contacts.map(v => Math.round(v * multiplier));
  volumeChart.data.datasets[1].data = current.sla.map(v => team === "retention" ? Math.max(70, v - 4) : team === "digital" ? Math.min(99, v + 3) : v);
  volumeChart.update();

  updateKpis(period);
  renderTeams(team);
  document.getElementById("lastUpdated").textContent = "Updated " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

document.getElementById("periodFilter").addEventListener("change", updateDashboard);
document.getElementById("teamFilter").addEventListener("change", updateDashboard);

document.getElementById("sortButton").addEventListener("click", () => {
  sortDesc = !sortDesc;
  document.getElementById("sortButton").textContent = sortDesc ? "Sort by QA ↓" : "Sort by QA ↑";
  renderTeams(document.getElementById("teamFilter").value);
});

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
    button.classList.add("active");

    const targets = {
      overview: ".kpi-grid",
      channels: "#channelChart",
      quality: ".qa-list",
      workforce: "#teamTable"
    };
    document.querySelector(targets[button.dataset.view])?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("cx-theme", dark ? "dark" : "light");
});

if (localStorage.getItem("cx-theme") === "dark") {
  document.body.classList.add("dark");
}

renderChannelSummary();
renderQa();
renderTeams();
renderSignals();
updateDashboard();