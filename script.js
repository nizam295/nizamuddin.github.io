(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Self-healing demo (simulation only)
  var services = Array.prototype.slice.call(document.querySelectorAll(".service"));
  var button = document.getElementById("break-btn");
  var log = document.getElementById("log");
  var mttrEl = document.getElementById("mttr");
  if (!services.length || !button || !log) return;

  var labels = { ok: "Healthy", down: "Down", heal: "Restarting" };

  function setState(el, state) {
    el.setAttribute("data-state", state);
    el.querySelector(".svc-state").textContent = labels[state];
  }

  function addLog(text) {
    var li = document.createElement("li");
    li.textContent = text;
    log.appendChild(li);
    while (log.children.length > 6) log.removeChild(log.firstChild);
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  var running = false;

  button.addEventListener("click", function () {
    if (running) return;
    running = true;
    button.disabled = true;
    mttrEl.hidden = true;

    var target = services[Math.floor(Math.random() * services.length)];
    var name = target.getAttribute("data-name");
    var start = performance.now();

    setState(target, "down");
    addLog("Container " + name + " stopped responding.");

    wait(1200)
      .then(function () {
        addLog("Prometheus: probe on " + name + " failing. Alert firing in Grafana.");
        return wait(1000);
      })
      .then(function () {
        addLog("Alertmanager sent a webhook. Python handler restarting " + name + ".");
        setState(target, "heal");
        return wait(1300);
      })
      .then(function () {
        setState(target, "ok");
        var seconds = ((performance.now() - start) / 1000).toFixed(1);
        addLog(name + " is healthy again.");
        mttrEl.textContent = "Recovered in " + seconds + " seconds, with no human involved.";
        mttrEl.hidden = false;
        running = false;
        button.disabled = false;
      });
  });
})();
