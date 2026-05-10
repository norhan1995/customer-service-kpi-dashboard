function animateNumber(id, end, suffix = "", duration = 1200) {
  const element = document.getElementById(id);
  let start = 0;
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = end / steps;

  const counter = setInterval(() => {
    start += increment;
    if (start >= end) {
      start = end;
      clearInterval(counter);
    }
    element.textContent = Math.round(start) + suffix;
  }, stepTime);
}

animateNumber("ticketsCount", 1248);
animateNumber("resolutionCount", 91, "%");
animateNumber("responseCount", 7, "m");
animateNumber("csatCount", 94, "%");

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
});

new Chart(document.getElementById("ticketsChart"), {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Tickets",
      data: [180, 210, 165, 240, 220, 130, 103],
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  }
});

new Chart(document.getElementById("statusChart"), {
  type: "doughnut",
  data: {
    labels: ["Resolved", "Pending", "Escalated"],
    datasets: [{
      data: [68, 22, 10]
    }]
  },
  options: {
    responsive: true
  }
});
