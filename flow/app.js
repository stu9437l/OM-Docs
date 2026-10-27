(function () {
  "use strict";

  const STEP_MS = 1600;

  const tabsEl = document.getElementById("tabs");
  const subtabsEl = document.getElementById("subtabs");
  const canvas = document.getElementById("canvas");
  const wires = document.getElementById("wires");
  const legendEl = document.getElementById("legend");
  const guideEl = document.getElementById("guide");
  const lambdaEl = document.getElementById("lambda");
  const titleEl = document.getElementById("flow-title");
  const summaryEl = document.getElementById("flow-summary");
  const routeEl = document.getElementById("flow-route");
  const statusEl = document.getElementById("status");
  const playBtn = document.getElementById("btn-play");
  const resetBtn = document.getElementById("btn-reset");

  const state = {
    moduleId: MODULES[0].id,
    viewId: MODULES[0].views[0].id,
    index: 0,
    playing: true,
    selected: null,
    timer: null,
    nodeEls: new Map(),
    edgeEls: [],
  };

  const currentModule = () => MODULES.find((m) => m.id === state.moduleId) || MODULES[0];
  const currentView = () => {
    const mod = currentModule();
    return mod.views.find((v) => v.id === state.viewId) || mod.views[0];
  };

  /* ---------------- chrome ---------------- */

  function renderTabs() {
    tabsEl.innerHTML = "";
    MODULES.forEach((mod) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab" + (mod.id === state.moduleId ? " active" : "");
      btn.textContent = mod.tab;
      btn.addEventListener("click", () => open(mod.id));
      tabsEl.appendChild(btn);
    });
  }

  function renderSubtabs() {
    const mod = currentModule();
    subtabsEl.innerHTML = "";
    if (mod.views.length < 2) {
      subtabsEl.hidden = true;
      return;
    }
    subtabsEl.hidden = false;
    mod.views.forEach((view) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "subtab" + (view.id === state.viewId ? " active" : "");
      btn.textContent = view.tab;
      btn.addEventListener("click", () => open(mod.id, view.id));
      subtabsEl.appendChild(btn);
    });
  }

  function renderLegend() {
    legendEl.innerHTML =
      KINDS.map(([, label, color]) => `<span><i style="background:${color}"></i>${label}</span>`).join("") +
      `<span><i class="flag-dot"></i>unverified label or behaviour</span>`;
  }

  /* ---------------- diagram ---------------- */

  function renderFlow() {
    const view = currentView();
    titleEl.textContent = view.title;
    summaryEl.textContent = view.summary;
    if (routeEl) routeEl.textContent = view.route || "";

    canvas.querySelectorAll(".node").forEach((el) => el.remove());
    state.nodeEls.clear();

    let maxCol = 1;
    view.nodes.forEach((node) => {
      const [col, row] = view.layout[node.id];
      maxCol = Math.max(maxCol, col);

      const el = document.createElement("div");
      el.className = "node";
      el.setAttribute("role", "button");
      el.tabIndex = 0;
      el.dataset.kind = node.kind;
      el.dataset.id = node.id;
      el.style.gridColumn = String(col);
      el.style.gridRow = String(row);
      el.innerHTML =
        `<span class="kind">${node.kind}` +
        (node.flag ? `<em class="flag">${node.flag}</em>` : "") +
        `</span>` +
        `<span class="title">${node.title}</span>` +
        (node.meta ? `<span class="meta">${node.meta}</span>` : "") +
        `<span class="detail">${node.detail}</span>`;

      if (node.jump) {
        const target = resolveJump(node.jump);
        if (target) {
          const jump = document.createElement("button");
          jump.type = "button";
          jump.className = "open-flow";
          jump.textContent = `Go to ${target.label}`;
          jump.addEventListener("click", (event) => {
            event.stopPropagation();
            open(target.moduleId, target.viewId);
          });
          el.querySelector(".detail").appendChild(jump);
        }
      }

      el.addEventListener("click", () => selectNode(node.id));
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNode(node.id);
        }
      });

      canvas.appendChild(el);
      state.nodeEls.set(node.id, el);
    });

    canvas.style.gridTemplateColumns = `repeat(${maxCol}, auto)`;
    renderLambda();
    renderGuide();
    requestAnimationFrame(drawEdges);
  }

  function currentGuide() {
    const pack = typeof GUIDES !== "undefined" ? GUIDES[state.moduleId] : null;
    if (!pack) return null;
    const sections = [];
    if (Array.isArray(pack.sections)) sections.push(...pack.sections);
    if (pack.byView && pack.byView[state.viewId]) sections.push(...pack.byView[state.viewId]);
    return { title: pack.title, sources: pack.sources || [], sections };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sectionHtml(section) {
    const parts = [`<article class="guide-section"><h4>${escapeHtml(section.heading)}</h4>`];
    if (section.body) parts.push(`<p>${escapeHtml(section.body)}</p>`);
    if (section.bullets && section.bullets.length) {
      parts.push("<ul>" + section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("") + "</ul>");
    }
    if (section.fields && section.fields.length) {
      parts.push(
        '<ul class="guide-fields">' +
          section.fields.map((item) => `<li>${escapeHtml(item)}</li>`).join("") +
          "</ul>",
      );
    }
    if (section.note) parts.push(`<p class="guide-note">${escapeHtml(section.note)}</p>`);
    parts.push("</article>");
    return parts.join("");
  }

  function stepChip(step) {
    return `<span class="lambda-step kind-${escapeHtml(step.kind || "aws")}">${escapeHtml(step.label)}</span>`;
  }

  function flowCard(flow) {
    const meta = [];
    if (flow.handler) meta.push(`<span>Handler <code>${escapeHtml(flow.handler)}</code></span>`);
    if (flow.trigger) meta.push(`<span>Trigger <code>${escapeHtml(flow.trigger)}</code></span>`);
    if (flow.repo) meta.push(`<span>Source <code>${escapeHtml(flow.repo)}</code></span>`);
    const jump =
      flow.moduleJump && MODULES.some((m) => m.id === flow.moduleJump)
        ? `<button type="button" class="lambda-jump" data-jump="${escapeHtml(flow.moduleJump)}">Open module</button>`
        : "";
    const notes =
      flow.notes && flow.notes.length
        ? `<ul class="lambda-notes">${flow.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>`
        : "";
    const steps = (flow.steps || []).map(stepChip).join('<span class="lambda-arrow" aria-hidden="true">→</span>');
    return (
      `<article class="lambda-card">` +
      `<div class="lambda-card-head"><h4>${escapeHtml(flow.name)}</h4>${jump}</div>` +
      (meta.length ? `<p class="lambda-meta">${meta.join("")}</p>` : "") +
      `<div class="lambda-strip" role="list">${steps}</div>` +
      notes +
      `</article>`
    );
  }

  function renderLambda() {
    if (!lambdaEl) return;
    const pack =
      typeof LAMBDA_FLOWS !== "undefined" ? LAMBDA_FLOWS[state.moduleId] : null;
    if (!pack) {
      lambdaEl.innerHTML = "";
      lambdaEl.hidden = true;
      return;
    }
    lambdaEl.hidden = false;
    const body =
      pack.flows && pack.flows.length
        ? pack.flows.map(flowCard).join("")
        : `<p class="lambda-empty">${escapeHtml(pack.summary || "No Lambda flow mapped for this module.")}</p>`;
    lambdaEl.innerHTML =
      `<div class="lambda-head">` +
      `<div><p class="lambda-kicker">Lambda flow</p><h3>${escapeHtml(pack.title)}</h3></div>` +
      `<p class="lambda-summary">${escapeHtml(pack.summary || "")}</p>` +
      `</div>` +
      `<div class="lambda-body">${body}</div>`;

    lambdaEl.querySelectorAll("[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => open(btn.getAttribute("data-jump")));
    });
  }

  function renderGuide() {
    const pack = currentGuide();
    if (!pack || !pack.sections.length) {
      guideEl.innerHTML = "";
      guideEl.hidden = true;
      return;
    }
    guideEl.hidden = false;
    const sources = pack.sources
      .map((item) => {
        if (item.url && item.url.startsWith("http")) {
          return `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>`;
        }
        return `<span>${escapeHtml(item.title)}</span>`;
      })
      .join(" · ");
    guideEl.innerHTML =
      `<div class="guide-head">` +
      `<div><p class="guide-kicker">User guide</p><h3>${escapeHtml(pack.title)}</h3></div>` +
      `<p class="guide-sources">${sources}</p>` +
      `</div>` +
      `<div class="guide-body">${pack.sections.map(sectionHtml).join("")}</div>`;
  }

  function resolveJump(spec) {
    const [moduleId, viewId] = String(spec).split(":");
    const mod = MODULES.find((m) => m.id === moduleId);
    if (!mod) return null;
    const view = viewId ? mod.views.find((v) => v.id === viewId) : mod.views[0];
    if (!view) return null;
    const name = mod.tab.replace(/^\d+\s·\s/, "");
    return {
      moduleId: mod.id,
      viewId: view.id,
      label: mod.views.length > 1 ? `${name} — ${view.tab}` : name,
    };
  }

  function box(el) {
    const cRect = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - cRect.left, y: r.top - cRect.top, w: r.width, h: r.height };
  }

  function anchors(a, b) {
    if (b.x >= a.x + a.w - 4) {
      return [{ x: a.x + a.w, y: a.y + a.h / 2 }, { x: b.x, y: b.y + b.h / 2 }, "h"];
    }
    if (b.x + b.w <= a.x + 4) {
      return [{ x: a.x, y: a.y + a.h / 2 }, { x: b.x + b.w, y: b.y + b.h / 2 }, "h"];
    }
    if (b.y > a.y) {
      return [{ x: a.x + a.w / 2, y: a.y + a.h }, { x: b.x + b.w / 2, y: b.y }, "v"];
    }
    return [{ x: a.x + a.w / 2, y: a.y }, { x: b.x + b.w / 2, y: b.y + b.h }, "v"];
  }

  function curve(p1, p2, axis) {
    if (axis === "h") {
      const dx = Math.max(26, Math.abs(p2.x - p1.x) * 0.42);
      const dir = p2.x >= p1.x ? 1 : -1;
      return `M ${p1.x} ${p1.y} C ${p1.x + dx * dir} ${p1.y}, ${p2.x - dx * dir} ${p2.y}, ${p2.x} ${p2.y}`;
    }
    const dy = Math.max(18, Math.abs(p2.y - p1.y) * 0.5);
    const dir = p2.y >= p1.y ? 1 : -1;
    return `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + dy * dir}, ${p2.x} ${p2.y - dy * dir}, ${p2.x} ${p2.y}`;
  }

  function drawEdges() {
    const view = currentView();
    wires.querySelectorAll(".wire, .wire-label").forEach((el) => el.remove());
    state.edgeEls = [];

    view.edges.forEach(([from, to, label]) => {
      const fromEl = state.nodeEls.get(from);
      const toEl = state.nodeEls.get(to);
      if (!fromEl || !toEl) return;

      const [p1, p2, axis] = anchors(box(fromEl), box(toEl));
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "wire");
      path.setAttribute("d", curve(p1, p2, axis));
      wires.appendChild(path);
      state.edgeEls.push({ el: path, to });

      if (label) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("class", "wire-label");
        text.setAttribute("x", String((p1.x + p2.x) / 2));
        text.setAttribute("y", String((p1.y + p2.y) / 2 - 7));
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        wires.appendChild(text);
      }
    });

    paint();
  }

  /* ---------------- animation ---------------- */

  function paint() {
    const view = currentView();
    const active = view.nodes[state.index];
    const activeId = active ? active.id : null;

    view.nodes.forEach((node, i) => {
      const el = state.nodeEls.get(node.id);
      if (!el) return;
      el.classList.toggle("live", node.id === activeId);
      el.classList.toggle("done", i < state.index);
      el.classList.toggle("selected", node.id === state.selected);
    });

    state.edgeEls.forEach((edge) => edge.el.classList.toggle("live", edge.to === activeId));

    if (state.selected) {
      const node = view.nodes.find((item) => item.id === state.selected);
      statusEl.textContent = `Paused on “${node.title}”. Click the card again to collapse it, or press Play to resume.`;
    } else if (state.playing) {
      statusEl.textContent = `Step ${state.index + 1} of ${view.nodes.length} — ${active.title}`;
    } else {
      statusEl.textContent = `Paused at step ${state.index + 1} of ${view.nodes.length}. Click any step for detail.`;
    }
  }

  function tick() {
    state.index = (state.index + 1) % currentView().nodes.length;
    paint();
  }

  function schedule() {
    clearInterval(state.timer);
    if (state.playing) state.timer = setInterval(tick, STEP_MS);
  }

  function setPlaying(next) {
    state.playing = next;
    playBtn.textContent = next ? "Pause" : "Play";
    if (next) {
      state.selected = null;
      canvas.querySelectorAll(".node.open").forEach((el) => el.classList.remove("open"));
      requestAnimationFrame(drawEdges);
    }
    schedule();
    paint();
  }

  /* ---------------- interaction ---------------- */

  function selectNode(id) {
    const el = state.nodeEls.get(id);
    if (!el) return;

    const wasOpen = el.classList.contains("open");
    canvas.querySelectorAll(".node.open").forEach((node) => node.classList.remove("open"));

    if (wasOpen) {
      state.selected = null;
    } else {
      el.classList.add("open");
      state.selected = id;
      const idx = currentView().nodes.findIndex((node) => node.id === id);
      if (idx >= 0) state.index = idx;
      setPlaying(false);
    }

    requestAnimationFrame(drawEdges);
  }

  function open(moduleId, viewId) {
    const mod = MODULES.find((m) => m.id === moduleId);
    if (!mod) return;
    state.moduleId = mod.id;
    const view = viewId ? mod.views.find((v) => v.id === viewId) : null;
    state.viewId = (view || mod.views[0]).id;
    state.index = 0;
    state.selected = null;
    renderTabs();
    renderSubtabs();
    renderFlow();
    setPlaying(true);
    document.querySelector(".stage").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  playBtn.addEventListener("click", () => setPlaying(!state.playing));

  resetBtn.addEventListener("click", () => {
    state.index = 0;
    state.selected = null;
    canvas.querySelectorAll(".node.open").forEach((el) => el.classList.remove("open"));
    setPlaying(true);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawEdges, 120);
  });

  renderTabs();
  renderSubtabs();
  renderLegend();
  renderFlow();
  setPlaying(true);
})();
