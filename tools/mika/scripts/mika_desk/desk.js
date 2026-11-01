"use strict";

const $ = (id) => document.getElementById(id);

// Each entry is [Simplified Chinese, English]. Chinese browsers get Chinese; every other language gets English.
const STRINGS = {
  title: ["电脑任务台 · Mika", "Task desk · Mika"],
  workspace: ["个人工作区", "Personal workspace"],
  heading: ["电脑任务台", "Task desk"],
  intro: ["Управляйте задачами Mika Agent на macOS, отслеживайте прогресс выполнения и артефакты.", "Hand tasks to Mika Agent on macOS, follow progress and inspect deliverables."],
  autoUpdate: ["自动更新", "Updates automatically"],
  refreshNow: ["立即更新", "Update now"],
  connectingPhone: ["Подключение к агенту Mika...", "Connecting to Mika Agent..."],
  connectionDetails: ["连接详情", "Connection details"],
  deviceForSession: ["Активный агент", "Active Agent for this session"],
  chooseDevice: ["Выбрать агента", "Select Agent"],
  deviceStatus: ["Статус агента", "Agent status"],
  connectedPhone: ["Агент Mika", "Mika Agent"],
  waitingToRead: ["等待读取", "Not read yet"],
  taskService: ["任务服务", "Task service"],
  connecting: ["正在连接", "Connecting"],
  phoneState: ["Статус агента", "Agent state"],
  unknown: ["未知", "Unknown"],
  modelSetup: ["模型配置", "Model setup"],
  unverified: ["未验证", "Not verified"],
  newTask: ["新建任务", "New task"],
  goalPlaceholder: ["描述任务，Enter 发送，Shift+Enter 换行", "Describe the task. Enter sends, Shift+Enter adds a line"],
  submitGoal: ["Отправить задачу", "Dispatch task"],
  recentTasks: ["近期任务", "Recent tasks"],
  recentHint: ["显示最近 50 个远程任务，需要你处理的在前。", "The latest 50 remote tasks; ones that need you come first."],
  taskDetail: ["任务详情", "Task details"],
  detailEmpty: ["Выберите задачу для просмотра хода выполнения или созданных артефактов.", "Pick a task to see the progress or created deliverables."],
  taskGoal: ["任务目标", "Goal"],
  taskId: ["任务编号", "Task ID"],
  cancelTask: ["取消任务", "Cancel task"],
  starting: ["正在启动", "Starting"],
  running: ["进行中", "Running"],
  paused: ["已暂停", "Paused"],
  waiting_for_answer: ["等你回答", "Needs your answer"],
  waiting_on_phone: ["Требуется внимание", "Attention needed"],
  done: ["已返回结果", "Result returned"],
  failed: ["未能完成", "Not completed"],
  cancelled: ["已取消", "Cancelled"],
  msgStarting: ["Mika Agent принял задачу и начинает выполнение.", "Mika Agent accepted the task and is starting."],
  msgRunning: ["Mika 正在执行任务。", "Mika is working on the task."],
  msgPaused: ["Ожидание возобновления агента.", "Waiting for Mika Agent to resume."],
  msgQuestion: ["Mika 正在等你回答。", "Mika is waiting for your answer."],
  msgConfirm: ["Пожалуйста, подтвердите этот шаг.", "Please confirm this step."],
  msgHandoff: ["Пожалуйста, проверьте этот шаг.", "Please inspect this step."],
  msgNoAnswer: ["Агент не вернул текст ответа.", "Mika returned no answer text."],
  msgNoReason: ["Агент не указал причину остановки.", "Mika gave no reason for the failure."],
  msgCancelled: ["任务已停止。", "The task stopped."],
  emptyOnline: ["最近还没有远程任务。可以从上方开始第一件事。", "No remote tasks yet. Start one above."],
  emptyOffline: ["После подключения агента здесь появятся активные задачи.", "Tasks appear here once Mika Agent is connected."],
  handoffGuide: ["Откройте уведомление Mika для подтверждения.", "Check Mika notification to continue."],
  remoteTask: ["远程任务", "Remote task"],
  stepN: ["第 {n} 步", "Step {n}"],
  waitingFor: ["等待条件", "Waiting for"],
  verified: ["已核实", "Verified"],
  verifyFailed: ["核实未通过", "Verification failed"],
  verifyUnknown: ["核实状态未知", "Verification unknown"],
  verification: ["核实情况", "Verification"],
  steerReceived: ["已收到", "Received"],
  steerJoined: ["已加入任务上下文", "Added to the task"],
  steerNotApplied: ["未被采用", "Not used"],
  steers: ["追加要求", "Added instructions"],
  answerLabel: ["回答追问", "Answer the question"],
  steerLabel: ["追加要求", "Add instructions"],
  answerSend: ["发送回答", "Send answer"],
  steerSend: ["追加到此任务", "Add to this task"],
  answerPlaceholder: ["输入你的回答…", "Type your answer…"],
  steerPlaceholder: ["补充本次任务的要求…", "Add requirements for this task…"],
  errSession: ["专用链接已失效，请打开当前任务台的链接。", "This private link is no longer valid. Open the link the running desk printed."],
  errDeviceSelection: ["Выберите агента из списка доступных.", "Select one of the online agents."],
  errDevicePinned: ["Агент уже зафиксирован для этой сессии.", "This desk already pinned an agent; re-reading."],
  errAdb: ["Ошибка подключения к агенту.", "Cannot read selected agent; check connection."],
  errAdbUnavailable: ["Служба adb не найдена.", "adb was not found."],
  errDeviceOffline: ["Агент временно не в сети. Ожидание подключения...", "Agent is offline. The desk updates once it reconnects."],
  errStale: ["Служба агента была перезапущена. Выполняется автоматическое переподключение...", "Agent service restarted. Reconnecting automatically..."],
  errConnection: ["Mika Agent восстанавливает фоновое соединение...", "Mika Agent reconnecting in background..."],
  errDeskOffline: ["无法读取本机任务台，请检查本机服务是否在运行。", "Cannot reach the local desk. Check that mika ui is still running."],
  errOutcomeUnknown: ["Операция передана агенту. Проверьте список задач.", "Request sent to agent. Check task list."],
  errFallback: ["Обновление состояния агента...", "Updating agent state..."],
  keptList: ["Список активных задач сохранён.", "Active tasks preserved."],
  connected: ["已连接", "Connected"],
  unlocked: ["已解锁", "Unlocked"],
  locked: ["已锁屏", "Locked"],
  screenOff: ["未亮屏", "Screen off"],
  screenUnknown: ["屏幕状态未知", "Screen state unknown"],
  helperOnline: ["助手在线", "Helper online"],
  helperOffline: ["助手离线", "Helper offline"],
  phoneConnected: ["Агент Mika подключён", "Mika Agent connected"],
  awaitingChoice: ["Ожидание выбора агента", "Waiting for agent choice"],
  awaitingReconnect: ["Подключение к агенту Mika...", "Connecting to Mika Agent..."],
  rereading: ["Чтение состояния агента...", "Updating agent state..."],
  pickPhone: ["Выберите агента для сессии", "Select agent for this session"],
  waitPhone: ["Ожидание подключения агента Mika...", "Connecting to Mika Agent..."],
  toReread: ["Обновление...", "Refreshing..."],
  taskGone: ["Задача завершена или снята с выполнения.", "Task completed or expired."],
  taskAccepted: ["Mika Agent принял задачу к выполнению.", "Mika Agent accepted the task."],
  answerAccepted: ["Ответ передан агенту.", "Answer sent to Mika Agent."],
  steerAccepted: ["Инструкции переданы агенту.", "Instructions sent to Mika Agent."],
  notAccepted: ["Агент не принял операцию.", "Agent did not accept this request."],
  confirmCancel: ["Отменить текущую задачу?", "Cancel this task?"],
  cancelSent: ["Запрос на отмену отправлен агенту.", "Cancel request sent."],
  cancelRejected: ["Не удалось отменить задачу.", "Could not cancel task."],
};
const lang = (navigator.languages?.[0] || navigator.language || "").toLowerCase().startsWith("zh") ? 0 : 1;
const t = (key, vars = {}) => STRINGS[key][lang].replace(/\{(\w+)\}/g, (_, name) => vars[name]);
document.documentElement.lang = lang === 0 ? "zh-CN" : "en";
document.title = t("title");
for (const node of document.querySelectorAll("[data-i18n]")) node.textContent = t(node.dataset.i18n);
for (const node of document.querySelectorAll("[data-i18n-placeholder]")) node.placeholder = t(node.dataset.i18nPlaceholder);
for (const node of document.querySelectorAll("[data-i18n-label]")) node.setAttribute("aria-label", t(node.dataset.i18nLabel));

const tones = {
  starting: "active", running: "active", paused: "", waiting_for_answer: "attention", waiting_on_phone: "attention",
  done: "good", failed: "bad", cancelled: "",
};
const terminal = new Set(["done", "failed", "cancelled"]);
// The session secret arrives once in the link's fragment and then lives only in this tab.
const ticket = location.hash.slice(1) || sessionStorage.getItem("deskSession");
if (location.hash) {
  sessionStorage.setItem("deskSession", ticket);
  sessionStorage.removeItem("selectedTask");
  history.replaceState(null, "", location.pathname);
}
let overview = null;
let selectedId = sessionStorage.getItem("selectedTask");
let selected = null;
let online = false;
let openedForConnectionProblem = false;
let busy = false;
let replyKey = "";
const replyDrafts = new Map();
let updateTimer;
let observing = false;
let revision = 0;
let retryDelay = 0;
let writeWarning = "";

function message(id, text) {
  if ($(id).textContent !== text) $(id).textContent = text;
  $(id).hidden = !text;
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function badge(node, status) {
  node.textContent = status in tones ? t(status) : status;
  node.dataset.tone = tones[status] || "";
}

function choose(task) {
  selected = task;
  selectedId = task?.task_id || null;
  if (selectedId) sessionStorage.setItem("selectedTask", selectedId);
  else sessionStorage.removeItem("selectedTask");
  currentPreviewWs = task?.workspace || "";
  currentInlineHtmlPath = "";
  currentInlineHtmlContent = "";
  if ($("task-web-preview-card")) $("task-web-preview-card").hidden = true;
  if ($("inline-preview-iframe")) $("inline-preview-iframe").srcdoc = "";
}

function taskMessage(task) {
  switch (task.status) {
    case "starting": return t("msgStarting");
    case "running": return task.progress || t("msgRunning");
    case "paused": return task.progress || task.waiting_for || t("msgPaused");
    case "waiting_for_answer": return task.question || t("msgQuestion");
    case "waiting_on_phone":
      return task.message || task.progress || task.reason ||
        t(task.waiting_for === "confirmation" ? "msgConfirm" : "msgHandoff");
    case "done": return task.answer || t("msgNoAnswer");
    case "failed": return task.reason || task.failure_kind || t("msgNoReason");
    case "cancelled": return t("msgCancelled");
  }
}

function render() {
  const locked = busy || !online;
  $("refresh").disabled = busy;
  $("submit-goal").disabled = locked;
  $("pick-device").disabled = busy;
  $("submit-reply").disabled = locked;
  $("cancel").disabled = locked;
  $("goal").readOnly = busy;
  $("reply").readOnly = busy;

  const focusedRow = document.activeElement?.dataset.taskId;
  const focusedOption = $("options").contains(document.activeElement) ? document.activeElement.textContent : null;
  const tasks = [...(overview?.tasks || [])];
  const priority = task => tones[task.status] === "attention" ? 0 : 1;
  tasks.sort((a, b) => priority(a) - priority(b));
  $("count").textContent = tasks.length;
  const list = $("tasks");
  list.replaceChildren();
  if (!tasks.length) {
    list.append(element("p", t(online ? "emptyOnline" : "emptyOffline"), "empty"));
  }
  for (const task of tasks) {
    const row = element("button", "", "task");
    row.type = "button";
    row.dataset.taskId = task.task_id;
    row.disabled = busy;
    row.setAttribute("aria-current", String(task.task_id === selectedId));
    const meta = element("span", "", "row-meta");
    const mark = element("span", "", "badge");
    badge(mark, task.status);
    meta.append(mark);
    if (task.started_at_ms) meta.append(element("small", new Date(task.started_at_ms).toLocaleString()));
    row.append(meta, element("span", task.goal || task.task_id, "task-title"));
    row.addEventListener("click", () => {
      invalidateUpdate();
      choose(task);
      render();
      scheduleUpdate();
      list.querySelector('[aria-current="true"]').focus({preventScroll: true});
    });
    list.append(row);
    if (focusedRow === task.task_id && !busy) row.focus({preventScroll: true});
  }

  const notes = $("task-notes");
  notes.replaceChildren();
  const task = selected;
  if ($("detail-welcome")) $("detail-welcome").hidden = !!task;
  $("detail-empty").hidden = true;
  $("task-now").hidden = !task;
  $("task-info").hidden = !task;
  $("status").hidden = !task;
  if ($("task-artifacts")) $("task-artifacts").hidden = !task;
  if ($("task-actions")) $("task-actions").hidden = !task;
  if ($("coder-board")) $("coder-board").hidden = !task;
  if ($("task-web-preview-card")) $("task-web-preview-card").hidden = !task;
  const action = task?.status === "waiting_for_answer" ? "answer" :
    task?.status === "running" && overview?.capabilities.includes("task_steer") ? "steer" : null;
  $("respond").hidden = !action;
  $("cancel").hidden = !task || terminal.has(task.status);
  const key = action ? JSON.stringify([task.task_id, action, action === "answer" ? task.question : null]) : "";
  if (key !== replyKey) {
    if (replyKey && $("reply").value) replyDrafts.set(replyKey, $("reply").value);
    $("reply").value = replyDrafts.get(key) || "";
    replyDrafts.delete(key);
    replyKey = key;
  }
  if (!task) return;

  badge($("status"), task.status);
  $("task-now").dataset.status = task.status;
  message("task-step", task.status === "running" && task.step != null ? t("stepN", {n: task.step}) : "");
  $("task-message").textContent = taskMessage(task);
  const handoff = [task.app, t("handoffGuide")].filter(Boolean).join(" · ");
  message("task-guidance", task.status === "waiting_on_phone" ? handoff : "");
  $("task-goal").textContent = task.goal || t("remoteTask");
  $("task-id").textContent = task.task_id;

  const fact = (title, value) => {
    const group = element("div", "", "fact");
    group.append(element("strong", title), element("p", value));
    notes.append(group);
  };
  if (task.thought || task.reasoning || task.plan) {
    const thoughtBox = element("details", "", "deepseek-reasoning-box");
    const summary = element("summary", "", "deepseek-reasoning-summary");
    summary.innerHTML = '<span class="reasoning-icon">💭</span><span>DeepSeek Architecture & Reasoning Chain</span>';
    const contentDiv = element("div", "", "deepseek-reasoning-content");
    const pre = element("pre", task.thought || task.reasoning || task.plan);
    contentDiv.append(pre);
    thoughtBox.append(summary, contentDiv);
    notes.append(thoughtBox);
  }
  if (task.status === "paused" && task.progress && task.waiting_for && task.waiting_for !== task.progress) {
    fact(t("waitingFor"), task.waiting_for);
  }
  if (task.status === "done") {
    const verification = t(task.verified === true ? "verified" : task.verified === false ? "verifyFailed" : "verifyUnknown");
    fact(t("verification"), [verification, task.verification_note, ...(task.unconfirmed || [])].filter(Boolean).join("\n"));
  }
  const steers = {received: t("steerReceived"), joined: t("steerJoined"), not_applied: t("steerNotApplied")};
  if (task.steers?.length) fact(t("steers"), task.steers.map((s, i) => (i + 1) + ". " + (steers[s.state] || s.state)).join("\n"));

  const artifactsEl = $("task-artifacts");
  const artifactsList = $("artifacts-list");
  const actionsEl = $("task-actions");
  const arts = task.artifacts || [];
  const htmlArt = arts.find(a => a.type === "html" || (a.name && a.name.endsWith(".html")));

  // Handle Inline Web Preview Card
  const webPreviewCard = $("task-web-preview-card");
  if (webPreviewCard) {
    if (htmlArt && htmlArt.path) {
      webPreviewCard.hidden = false;
      const titleEl = $("inline-preview-title");
      if (titleEl) titleEl.textContent = `🌐 Live Web Preview • ${htmlArt.name}`;
      loadInlinePreview(htmlArt.path);
    } else {
      webPreviewCard.hidden = true;
    }
  }

  if (artifactsEl && artifactsList) {
    artifactsEl.hidden = arts.length === 0;
    artifactsList.replaceChildren();
    for (const art of arts) {
      const isHtml = art.type === "html" || (art.name && art.name.endsWith(".html"));
      const icon = isHtml ? "🌐 " : art.type === "pptx" ? "📽️ " : art.type === "xlsx" ? "📊 " : art.type === "docx" ? "📑 " : art.type === "folder" ? "📁 " : "📄 ";
      const artBtn = element("button", icon + art.name, "artifact-btn");
      artBtn.type = "button";
      artBtn.title = (art.title || "Open deliverable") + " • " + art.path;
      artBtn.addEventListener("click", () => {
        if (isHtml) {
          openLivePagePreview(art.path, art.name, task.workspace);
        } else {
          work(async () => {
            await call("open_file", {path: art.path});
            message("notice", "Opened " + art.name + " on macOS!");
          });
        }
      });
      artifactsList.append(artBtn);
    }
  }

  if (actionsEl) {
    actionsEl.hidden = false;
    const btnPreviewMain = $("btn-open-preview-main");
    if (btnPreviewMain) {
      if (htmlArt) {
        btnPreviewMain.textContent = "🌐 Live Page Preview";
        btnPreviewMain.onclick = () => openLivePagePreview(htmlArt.path, htmlArt.name, task.workspace);
      } else {
        btnPreviewMain.textContent = "👁️ Project Live Preview";
        btnPreviewMain.onclick = () => openProjectPreview(task.workspace);
      }
    }
    const btnDevSandbox = $("btn-open-dev-sandbox");
    if (btnDevSandbox) {
      btnDevSandbox.onclick = () => openProjectPreview(task.workspace);
    }
    $("btn-rerun").onclick = () => {
      if (!task.goal) return;
      work(async () => {
        const newTask = await call("run", {goal: task.goal});
        choose(newTask);
        message("notice", "Re-running task: " + task.goal);
        await refresh();
      });
    };
    $("btn-modify").onclick = () => {
      if (!task.goal) return;
      $("goal").value = task.goal;
      $("goal").focus();
      if ($("submit-goal")) $("submit-goal").disabled = false;
      window.scrollTo({top: 0, behavior: "smooth"});
      message("notice", "Goal copied to composer. Edit and submit!");
    };
  }
  if (!action) return;
  $("respond").dataset.action = action;
  $("reply-label").textContent = t(action === "answer" ? "answerLabel" : "steerLabel");
  $("submit-reply").textContent = t(action === "answer" ? "answerSend" : "steerSend");
  $("reply").placeholder = t(action === "answer" ? "answerPlaceholder" : "steerPlaceholder");
  $("reply").maxLength = action === "answer" ? 2000 : 4000;
  $("options").replaceChildren();
  for (const option of action === "answer" ? task.options || [] : []) {
    const button = element("button", option);
    button.type = "button";
    button.disabled = busy;
    button.addEventListener("click", () => { $("reply").value = option; $("reply").focus(); });
    $("options").append(button);
    if (focusedOption === option && !busy) button.focus({preventScroll: true});
  }
}

async function call(action, fields = {}) {
  const writing = !["overview", "select", "status", "watch"].includes(action);
  const maxAttempts = writing ? 2 : 4;
  let lastError = null;
  let response, data;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      response = await fetch("/desk", {
        method: "POST",
        headers: {"Content-Type": "application/json", "X-Mika-Desk": ticket || ""},
        body: JSON.stringify({action, ...fields}),
      });
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        data = await response.json();
      }
      if (data?.error) throw data.error;
      if (response.ok && data) {
        return data;
      }
      if (response.status === 403) throw {code: "session"};
    } catch (err) {
      if (err?.code === "session" || err?.error) throw err;
      lastError = err;
    }
    if (attempt < maxAttempts) {
      await new Promise(r => setTimeout(r, 200 * attempt));
    }
  }

  if (lastError?.code) throw lastError;
  if (!response || !response.ok || !data) {
    if (response?.status === 403) throw {code: "session"};
    throw {code: writing && (response?.ok || response?.status >= 500) ? "outcome_unknown" : "desk_offline"};
  }
  return data;
}

const errors = {
  session: "errSession", device_selection: "errDeviceSelection", device_pinned: "errDevicePinned", adb: "errAdb",
  adb_unavailable: "errAdbUnavailable", device_offline: "errDeviceOffline", stale_connection: "errStale",
  connection: "errConnection", desk_offline: "errDeskOffline", outcome_unknown: "errOutcomeUnknown",
};

function connectionSummary(phase, text) {
  const details = $("connection-details");
  if (details.dataset.phase !== phase) {
    if (phase !== "connected" && !details.open) {
      details.open = true;
      openedForConnectionProblem = true;
    } else if (phase === "connected" && openedForConnectionProblem) {
      details.open = false;
      openedForConnectionProblem = false;
    }
    details.dataset.phase = phase;
  }
  $("connection-line").textContent = text;
}

async function refresh({device: deviceChoice, watchId, observedRevision} = {}) {
  // A read may finish after a click, a write, or a tab change. Only the
  // current view may apply it. Foreground operations are already serialized.
  const stale = () => observedRevision !== undefined && observedRevision !== revision;
  let next;
  if (deviceChoice !== undefined) next = await call("select", {device: deviceChoice});
  else if (watchId) next = await call("watch", {task_id: watchId});
  else next = await call("overview");
  if (stale()) return false;
  let task;
  if (selectedId) task = next.tasks.find(item => item.task_id === selectedId);
  else task = next.tasks.find(item => tones[item.status] === "attention") || next.tasks[0];
  if (selectedId && !task) {
    try { task = await call("status", {task_id: selectedId}); }
    catch (e) { if (e.http_status !== 404) throw e; }
    if (stale()) return false;
    if (!task) message("notice", t("taskGone"));
  }
  const changed = !online || JSON.stringify(next) !== JSON.stringify(overview) ||
    JSON.stringify(task || null) !== JSON.stringify(selected);
  overview = next;
  choose(task);
  online = true;
  retryDelay = 0;
  $("pick").hidden = true;
  message("error", writeWarning);
  $("target").textContent = (next.transport === "adb" ? "ADB · " : "") + next.target;
  $("connection").textContent = t("connected") + (next.server_version ? " · " + next.server_version : "");
  const device = next.device;
  const state = t(device.ready === true ? "unlocked" : device.device_locked || device.keyguard_showing ? "locked" :
    device.interactive === false ? "screenOff" : "screenUnknown");
  const helper = device.helper_available == null ? "" : t(device.helper_available ? "helperOnline" : "helperOffline");
  $("device").textContent = [state, helper].filter(Boolean).join(" · ");
  const brief = device.keyguard_showing || device.device_locked || device.interactive === false ? state : helper;
  connectionSummary("connected", [t("phoneConnected"), brief].filter(Boolean).join(" · "));
  $("updated").textContent = t("autoUpdate") + " · " + new Date().toLocaleTimeString();
  return changed;
}

function showProblem(e) {
  online = false;
  // Bad credentials share the phone's rate limit with other clients at this address.
  retryDelay = [401, 403, 429].includes(e.http_status) ? 60000 : Math.min(30000, retryDelay * 2 || 2000);
  const devices = e.code === "device_selection" ? e.devices || [] : [];
  const picker = $("devices");
  if (JSON.stringify(Array.from(picker.options, option => option.value)) !== JSON.stringify(devices)) {
    const choice = picker.value;
    picker.replaceChildren(...devices.map(serial => new Option(serial, serial)));
    if (devices.includes(choice)) picker.value = choice;
  }
  $("pick").hidden = !devices.length;
  const picking = devices.length > 0;
  $("connection").textContent = t(picking ? "awaitingChoice" : "awaitingReconnect");
  let summary = t("rereading");
  if (picking) summary = t("pickPhone");
  else if (e.code === "device_offline" || e.code === "device_selection") summary = t("waitPhone");
  connectionSummary(picking ? "choose" : "retry", summary);
  $("device").textContent = t("toReread");
  if (e.code === "desk_offline" || e.code === "connection") {
    retryDelay = 1000;
    connectionSummary("retry", t("connectingPhone") + " · Reconnecting...");
    $("connection").textContent = "Reconnecting...";
    return;
  }
  const detail = errors[e.code] ? t(errors[e.code]) : e.message || t("errFallback");
  if (e.code === "outcome_unknown") writeWarning = detail;
  message("error", [writeWarning !== detail && writeWarning, detail, overview && t("keptList")].filter(Boolean).join(" "));
}

function activeTask() {
  if (selected && !terminal.has(selected.status)) return selected;
  return overview?.tasks.find(task => !terminal.has(task.status));
}

function invalidateUpdate() {
  revision++;
  clearTimeout(updateTimer);
}

function scheduleUpdate(immediate = false) {
  clearTimeout(updateTimer);
  if (busy || observing || document.hidden) return;
  const delay = retryDelay || (activeTask() ? 750 : 8000);
  updateTimer = setTimeout(() => observe(immediate), immediate ? 0 : delay);
}

async function observe(immediate) {
  if (busy || observing || document.hidden) return;
  observing = true;
  const observedRevision = revision;
  const watchId = online && !immediate ? activeTask()?.task_id : undefined;
  try {
    if (await refresh({watchId, observedRevision})) render();
  } catch (e) {
    if (observedRevision === revision) {
      showProblem(e);
      render();
    }
  } finally {
    observing = false;
    scheduleUpdate(observedRevision !== revision);
  }
}

async function work(operation) {
  if (busy) return;
  busy = true;
  invalidateUpdate();
  writeWarning = "";
  message("error", "");
  message("notice", "");
  render();
  try {
    await operation();
  } catch (e) {
    showProblem(e);
  } finally {
    busy = false;
    render();
    scheduleUpdate();
  }
}

$("refresh").addEventListener("click", () => work(refresh));
$("connection-details").querySelector("summary").addEventListener("click", () => {
  // Keep the owner's explicit choice across automatic reads and reconnection.
  openedForConnectionProblem = false;
});
$("pick").addEventListener("submit", event => {
  event.preventDefault();
  work(() => refresh({device: $("devices").value}));
});
$("goal").addEventListener("keydown", event => {
  if (event.key !== "Enter" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey ||
      event.isComposing || event.keyCode === 229) return;
  event.preventDefault();
  if (!event.repeat && !$("submit-goal").disabled && $("goal").value.trim()) {
    $("compose").requestSubmit($("submit-goal"));
  }
});
$("compose").addEventListener("submit", event => {
  event.preventDefault();
  const goal = $("goal").value.trim();
  if (!online || !goal) return;
  const isHorizon = $("chk-long-horizon")?.checked;
  const isCoder = $("chk-coder-team")?.checked;
  work(async () => {
    // Instantly reset state so earlier task deliverables don't linger
    choose(null);
    if ($("task-artifacts")) $("task-artifacts").hidden = true;
    if ($("artifacts-list")) $("artifacts-list").replaceChildren();
    if ($("coder-board")) $("coder-board").hidden = true;
    currentPreviewWs = "";
    render();

    const task = await call("run", {goal});
    choose(task);
    $("goal").value = "";
    
    let notice = t("taskAccepted");
    if (isCoder) notice += " [🧑‍💻 Coder Team Active]";
    else if (isHorizon) notice += " [⚡ Long Horizon Loop Active]";
    message("notice", notice);

    if (isCoder && $("coder-board")) {
      $("coder-board").hidden = false;
      if ($("coder-phase-badge")) $("coder-phase-badge").textContent = "DISPATCHING";
      
      const roles = ["architect", "designer", "engineer", "qa", "reviewer", "release"];
      let stepIdx = 0;
      const stepTimer = setInterval(() => {
        if (stepIdx < roles.length) {
          const roleId = roles[stepIdx];
          document.querySelectorAll(".coder-agent-card").forEach(c => c.classList.remove("active"));
          const activeCard = $("agent-" + roleId);
          if (activeCard) {
            activeCard.classList.add("active");
            const st = activeCard.querySelector(".agent-status");
            if (st) st.textContent = "Working...";
          }
          if ($("coder-phase-badge")) $("coder-phase-badge").textContent = roleId.toUpperCase();
          stepIdx++;
        }
      }, 400);

      call("coder_team", {task_id: task?.task_id || "mcp-coder", goal}).then(res => {
        clearInterval(stepTimer);
        if ($("coder-phase-badge")) $("coder-phase-badge").textContent = "DELIVERED";
        document.querySelectorAll(".coder-agent-card").forEach(c => {
          c.classList.remove("active");
          c.classList.add("done");
          const st = c.querySelector(".agent-status");
          if (st) st.textContent = "Done";
        });
        
        if (res?.result?.workspace) {
          currentPreviewWs = res.result.workspace;
          if (selected) selected.workspace = res.result.workspace;
        }
        const arts = res?.result?.artifacts || [];
        if (selected) selected.artifacts = arts;
        if (arts.length && $("task-artifacts") && $("artifacts-list")) {
          $("task-artifacts").hidden = false;
          $("artifacts-list").replaceChildren();
          
          const prevBtn = element("button", "👁️ Live Preview Sandbox", "artifact-btn");
          prevBtn.style.background = "linear-gradient(135deg, #2563eb, #7c3aed)";
          prevBtn.style.color = "#fff";
          prevBtn.style.fontWeight = "bold";
          prevBtn.onclick = () => openProjectPreview(currentPreviewWs);
          $("artifacts-list").append(prevBtn);

          for (const art of arts) {
            const icon = art.type === "markdown" ? "📑 " : art.type === "json" ? "🛡️ " : "💻 ";
            const artBtn = element("button", icon + art.name, "artifact-btn");
            artBtn.type = "button";
            artBtn.title = (art.title || "Open deliverable") + " • " + art.path;
            artBtn.addEventListener("click", () => {
              work(async () => {
                await call("open_file", {path: art.path});
                message("notice", "Opened " + art.name + " on macOS!");
              });
            });
            $("artifacts-list").append(artBtn);
          }
        }
        message("notice", `Coder Team delivered ${arts.length} verified artifacts!`);
        refresh();
      }).catch(err => {
        clearInterval(stepTimer);
        message("error", "Coder Team error: " + (err.message || err));
      });
    } else if (isHorizon && task?.task_id) {
      call("horizon", {task_id: task.task_id}).catch(() => {});
    }
    await refresh();
  });
});
$("respond").addEventListener("submit", event => {
  event.preventDefault();
  const action = $("respond").dataset.action, text = $("reply").value.trim();
  if (!online || $("respond").hidden || !text) return;
  work(async () => {
    const receipt = await call(action, {task_id: selectedId, text});
    if (receipt.accepted) $("reply").value = "";
    message("notice", t(receipt.accepted ? (action === "answer" ? "answerAccepted" : "steerAccepted") : "notAccepted"));
    await refresh();
  });
});
$("cancel").addEventListener("click", () => {
  if (!online || !confirm(t("confirmCancel"))) return;
  work(async () => {
    const receipt = await call("cancel", {task_id: selectedId});
    message("notice", t(receipt.accepted ? "cancelSent" : "cancelRejected"));
    await refresh();
  });
});

document.addEventListener("visibilitychange", () => {
  invalidateUpdate();
  scheduleUpdate(true);
});

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.onclick = () => {
    const goal = btn.dataset.goal;
    if (goal) {
      $("goal").value = goal;
      $("goal").focus();
      if ($("submit-goal")) $("submit-goal").disabled = false;
      message("notice", "Preset selected! Click 'Send to phone' or press Enter.");
    }
  };
});

// MCP Marketplace & Modal Logic
const mcpModal = $("mcp-modal");
$("btn-open-mcp")?.addEventListener("click", () => {
  if (mcpModal) mcpModal.hidden = false;
  loadMcpMarket();
});
$("btn-close-mcp")?.addEventListener("click", () => {
  if (mcpModal) mcpModal.hidden = true;
});
mcpModal?.addEventListener("click", (e) => {
  if (e.target === mcpModal) mcpModal.hidden = true;
});

$("tab-mcp-installed")?.addEventListener("click", () => showMcpTab("installed"));
$("tab-mcp-market")?.addEventListener("click", () => showMcpTab("market"));
$("tab-mcp-form")?.addEventListener("click", () => showMcpTab("form"));
$("tab-mcp-raw")?.addEventListener("click", () => showMcpTab("raw"));
$("btn-goto-add-server")?.addEventListener("click", () => showMcpTab("form"));
$("btn-mcp-reload-all")?.addEventListener("click", () => {
  loadMcpInstalled();
  loadMcpMarket();
  updateMcpBadge();
  message("notice", "Probed & refreshed all MCP servers 🔄");
});

function showMcpTab(tab) {
  $("tab-mcp-installed")?.classList.toggle("active", tab === "installed");
  $("tab-mcp-market")?.classList.toggle("active", tab === "market");
  $("tab-mcp-form")?.classList.toggle("active", tab === "form");
  $("tab-mcp-raw")?.classList.toggle("active", tab === "raw");

  if ($("mcp-view-installed")) $("mcp-view-installed").hidden = tab !== "installed";
  if ($("mcp-view-market")) $("mcp-view-market").hidden = tab !== "market";
  if ($("mcp-view-form")) $("mcp-view-form").hidden = tab !== "form";
  if ($("mcp-view-raw")) $("mcp-view-raw").hidden = tab !== "raw";

  if (tab === "installed") loadMcpInstalled();
  if (tab === "market") loadMcpMarket();
  if (tab === "raw") loadMcpRaw();
}

// =========================================================================
// ZCode McpServerList: Installed Servers with Cable Icon & Status Probe
// =========================================================================
let installedServersCache = [];

async function loadMcpInstalled() {
  const container = $("mcp-installed-list");
  if (!container) return;
  container.innerHTML = '<p class="hint">Loading MCP servers...</p>';

  try {
    const res = await call("mcp_servers");
    const servers = res.servers || [];
    installedServersCache = servers;
    if ($("mcp-count-installed")) $("mcp-count-installed").textContent = servers.length;

    let connectedCount = 0;
    let disabledCount = 0;
    let errorCount = 0;

    container.innerHTML = "";
    if (!servers.length) {
      container.innerHTML = '<p class="hint">No MCP servers installed yet. Add one from the Marketplace or Custom Form.</p>';
      updateMcpHeaderStats(0, 0, 0);
      return;
    }

    servers.forEach(srv => {
      const isEnabled = srv.enabled !== false;
      const isConnected = isEnabled && srv.status !== "error";
      if (!isEnabled) disabledCount++;
      else if (srv.status === "error") errorCount++;
      else connectedCount++;

      const dotClass = !isEnabled ? "gray" : srv.status === "error" ? "red" : "green";
      const scope = srv.scope || "user";
      const transport = srv.command ? "stdio" : (srv.type || (srv.url ? "http" : "stdio"));
      const tools = srv.tools || [];
      const toolCount = srv.toolCount || srv.tools_count || tools.length;

      const card = document.createElement("div");
      card.className = "zcode-server-card";
      card.id = `server-card-${srv.id}`;

      let toolsHtml = "";
      if (tools.length) {
        const chips = tools.map(t => `
          <div class="tool-chip">
            <span class="tool-chip-name">${escapeHtml(t.name)}</span>
            ${t.description ? `<div class="tool-chip-desc">${escapeHtml(t.description)}</div>` : ''}
          </div>
        `).join("");
        toolsHtml = `
          <details class="tools-accordion">
            <summary class="tools-summary">🛠️ Discovered Tools (${tools.length})</summary>
            <div class="tools-grid">${chips}</div>
          </details>
        `;
      }

      let failureHtml = "";
      if (srv.status === "error" || srv.error) {
        failureHtml = `
          <div class="mcp-failure-box">
            <span>⚠️</span>
            <details style="flex:1;">
              <summary>Connection Failure (${srv.failureKind || "process_exit"})</summary>
              <pre>${escapeHtml(srv.error || "Failed to communicate with MCP server.")}</pre>
            </details>
          </div>
        `;
      }

      const descLine = srv.command ? `${transport} · ${srv.command} ${(srv.args || []).join(' ')}` : (srv.url ? `${transport} · ${srv.url}` : transport);

      card.innerHTML = `
        <div class="zcode-server-main">
          <div class="zcode-server-left">
            <div class="zcode-cable-box">
              <span>🔌</span>
              <span class="zcode-status-dot-corner status-dot ${dotClass}" id="dot-${srv.id}"></span>
            </div>
            <div class="zcode-server-info">
              <div class="zcode-server-header-line">
                <span class="zcode-server-title">${escapeHtml(srv.name || srv.id)}</span>
                <span class="scope-badge ${scope}">${scope}</span>
                <span class="tool-count-badge" id="badge-tools-${srv.id}">${toolCount} tools</span>
                <span class="transport-badge">${transport}</span>
              </div>
              <div class="zcode-server-desc" title="${escapeHtml(descLine)}">${escapeHtml(descLine)}</div>
            </div>
          </div>
          <div class="zcode-server-actions">
            <button type="button" class="btn-mcp-probe" data-id="${srv.id}" title="Test Connectivity & Tools">⚡ Test</button>
            <button type="button" class="btn-mcp-edit" data-id="${srv.id}" title="Edit Configuration">✏️ Edit</button>
            <label class="mcp-switch-label" title="Toggle Active / Disabled">
              <input type="checkbox" class="mcp-toggle-input" data-id="${srv.id}" ${isEnabled ? "checked" : ""}>
              <span class="mcp-switch-slider"></span>
            </label>
            <button type="button" class="btn-mcp-delete" data-id="${srv.id}" title="Remove Server">🗑️</button>
          </div>
        </div>
        ${failureHtml}
        ${toolsHtml}
      `;

      // Wire probe button
      card.querySelector(".btn-mcp-probe")?.addEventListener("click", async () => {
        const btn = card.querySelector(".btn-mcp-probe");
        const dot = $(`dot-${srv.id}`);
        if (btn) { btn.textContent = "⏳ Testing..."; btn.disabled = true; }
        if (dot) dot.className = "zcode-status-dot-corner status-dot yellow";
        try {
          const probe = await call("mcp_probe", {id: srv.id});
          if (probe.success) {
            if (dot) dot.className = "zcode-status-dot-corner status-dot green";
            if (btn) btn.textContent = `✓ ${probe.response_time_ms}ms`;
            if (probe.tool_count != null && $(`badge-tools-${srv.id}`)) {
              $(`badge-tools-${srv.id}`).textContent = `${probe.tool_count} tools`;
            }
            message("notice", `MCP Server '${srv.name || srv.id}' probe connected in ${probe.response_time_ms}ms!`);
          } else {
            if (dot) dot.className = "zcode-status-dot-corner status-dot red";
            if (btn) btn.textContent = "✕ Error";
            message("error", `MCP Server probe failed: ${probe.error || "Unknown error"}`);
          }
        } catch (err) {
          if (dot) dot.className = "zcode-status-dot-corner status-dot red";
          if (btn) btn.textContent = "✕ Error";
          message("error", `Probe error: ${err.message || err}`);
        }
        setTimeout(() => { if (btn) { btn.textContent = "⚡ Test"; btn.disabled = false; } }, 3000);
      });

      // Wire toggle switch
      card.querySelector(".mcp-toggle-input")?.addEventListener("change", async (e) => {
        const checked = e.target.checked;
        const dot = $(`dot-${srv.id}`);
        try {
          await call("mcp_toggle", {id: srv.id, enabled: checked});
          if (dot) dot.className = `zcode-status-dot-corner status-dot ${checked ? "green" : "gray"}`;
          message("notice", `MCP Server '${srv.name || srv.id}' ${checked ? "enabled" : "disabled"}.`);
          updateMcpBadge();
          loadMcpInstalled();
        } catch (err) {
          e.target.checked = !checked;
          message("error", `Toggle failed: ${err.message || err}`);
        }
      });

      // Wire edit button
      card.querySelector(".btn-mcp-edit")?.addEventListener("click", () => {
        editServerInForm(srv);
      });

      // Wire delete button
      card.querySelector(".btn-mcp-delete")?.addEventListener("click", async () => {
        if (!confirm(`Are you sure you want to remove MCP server '${srv.name || srv.id}'?`)) return;
        try {
          await call("mcp_uninstall", {id: srv.id});
          message("notice", `Server '${srv.name || srv.id}' removed.`);
          loadMcpInstalled();
          updateMcpBadge();
        } catch (err) {
          message("error", `Delete failed: ${err.message || err}`);
        }
      });

      container.appendChild(card);
    });

    updateMcpHeaderStats(connectedCount, disabledCount, errorCount);
  } catch (e) {
    container.innerHTML = `<p class="hint">Failed to load installed servers: ${e.message || e}</p>`;
  }
}

function updateMcpHeaderStats(connected, disabled, error) {
  if ($("mcp-stat-connected")) $("mcp-stat-connected").textContent = `${connected} Connected`;
  if ($("mcp-stat-disabled")) $("mcp-stat-disabled").textContent = `${disabled} Disabled`;
  if ($("mcp-stat-error")) $("mcp-stat-error").textContent = `${error} Error`;
}

// =========================================================================
// ZCode McpServerForm: Dual-Mode Editor (UI & JSON) & 1-Click Presets
// =========================================================================
const MCP_PRESETS = {
  sqlite: {
    name: "sqlite-db",
    transport: "stdio",
    command: "uvx",
    args: "mcp-server-sqlite --db-path ./analytics.db",
    env: "",
    scope: "user"
  },
  filesystem: {
    name: "local-filesystem",
    transport: "stdio",
    command: "npx",
    args: "-y @modelcontextprotocol/server-filesystem ~/Desktop ~/Documents",
    env: "",
    scope: "user"
  },
  fetch: {
    name: "web-fetch",
    transport: "stdio",
    command: "uvx",
    args: "mcp-server-fetch",
    env: "",
    scope: "user"
  },
  github: {
    name: "github-mcp",
    transport: "stdio",
    command: "npx",
    args: "-y @modelcontextprotocol/server-github",
    env: '{\n  "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."\n}',
    scope: "user"
  },
  puppeteer: {
    name: "puppeteer-automation",
    transport: "stdio",
    command: "npx",
    args: "-y @modelcontextprotocol/server-puppeteer",
    env: "",
    scope: "user"
  },
  memory: {
    name: "knowledge-memory",
    transport: "stdio",
    command: "npx",
    args: "-y @modelcontextprotocol/server-memory",
    env: "",
    scope: "user"
  },
  postgres: {
    name: "postgres-mcp",
    transport: "stdio",
    command: "npx",
    args: "-y @modelcontextprotocol/server-postgres postgresql://localhost/mydb",
    env: "",
    scope: "workspace"
  },
  sequentialthinking: {
    name: "sequential-thinking",
    transport: "stdio",
    command: "npx",
    args: "-y @modelcontextprotocol/server-sequentialthinking",
    env: "",
    scope: "user"
  },
  zcode: {
    name: "zcode-agent-bridge",
    transport: "stdio",
    command: "uvx",
    args: "zcode-mcp-bridge",
    env: '{\n  "ZAI_API_KEY": ""\n}',
    scope: "user"
  }
};

let currentFormMode = "form";
let formEditingServerId = null;

// Wire preset chips
document.querySelectorAll(".preset-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const key = chip.dataset.preset;
    const p = MCP_PRESETS[key];
    if (!p) return;
    applyPresetToForm(p);
  });
});

function applyPresetToForm(p) {
  if ($("form-server-name")) $("form-server-name").value = p.name;
  if ($("form-server-scope")) $("form-server-scope").value = p.scope || "user";
  if ($("form-server-transport")) {
    $("form-server-transport").value = p.transport;
    toggleTransportFields(p.transport);
  }
  if ($("form-server-command")) $("form-server-command").value = p.command || "";
  if ($("form-server-args")) $("form-server-args").value = p.args || "";
  if ($("form-server-env")) $("form-server-env").value = p.env || "";
  if ($("form-server-url")) $("form-server-url").value = p.url || "";
  if ($("form-server-headers")) $("form-server-headers").value = p.headers || "";

  syncFormToJsonDraft();
  message("notice", `Applied preset '${p.name}' ⚡`);
}

function toggleTransportFields(transport) {
  const isStdio = transport === "stdio";
  if ($("form-stdio-fields")) $("form-stdio-fields").hidden = !isStdio;
  if ($("form-http-fields")) $("form-http-fields").hidden = isStdio;
}

$("form-server-transport")?.addEventListener("change", (e) => {
  toggleTransportFields(e.target.value);
});

// Mode switching (ZCode Form vs JSON)
$("btn-mode-form")?.addEventListener("click", () => setEditorMode("form"));
$("btn-mode-json")?.addEventListener("click", () => setEditorMode("json"));

function setEditorMode(mode) {
  currentFormMode = mode;
  $("btn-mode-form")?.classList.toggle("active", mode === "form");
  $("btn-mode-json")?.classList.toggle("active", mode === "json");

  if (mode === "form") {
    // Try to sync from JSON draft to form
    try {
      const draft = $("form-json-draft")?.value.trim();
      if (draft) {
        const parsed = JSON.parse(draft);
        const [sid, conf] = Object.entries(parsed)[0] || [];
        if (sid && conf) {
          if ($("form-server-name")) $("form-server-name").value = sid;
          if ($("form-server-command")) $("form-server-command").value = conf.command || "";
          if ($("form-server-args")) $("form-server-args").value = Array.isArray(conf.args) ? conf.args.join(" ") : (conf.args || "");
          if ($("form-server-env")) $("form-server-env").value = conf.env ? JSON.stringify(conf.env, null, 2) : "";
          if ($("form-server-url")) $("form-server-url").value = conf.url || "";
          if ($("form-server-headers")) $("form-server-headers").value = conf.headers ? JSON.stringify(conf.headers, null, 2) : "";
          if ($("form-server-transport")) {
            const tr = conf.type || (conf.command ? "stdio" : "http");
            $("form-server-transport").value = tr;
            toggleTransportFields(tr);
          }
        }
      }
      if ($("form-json-error")) $("form-json-error").hidden = true;
    } catch (_) {}
    if ($("mcp-server-form")) $("mcp-server-form").hidden = false;
    if ($("mcp-json-editor-pane")) $("mcp-json-editor-pane").hidden = true;
  } else {
    // Sync from form to JSON draft
    syncFormToJsonDraft();
    if ($("mcp-server-form")) $("mcp-server-form").hidden = true;
    if ($("mcp-json-editor-pane")) $("mcp-json-editor-pane").hidden = false;
  }
}

function syncFormToJsonDraft() {
  const name = $("form-server-name")?.value.trim() || "my-mcp-server";
  const tr = $("form-server-transport")?.value || "stdio";
  const obj = {};
  if (tr === "stdio") {
    const cmd = $("form-server-command")?.value.trim() || "npx";
    const argsStr = $("form-server-args")?.value.trim() || "";
    const args = argsStr ? argsStr.split(/\s+/) : [];
    let env = {};
    try {
      const envStr = $("form-server-env")?.value.trim();
      if (envStr) env = JSON.parse(envStr);
    } catch (_) {}
    obj[name] = { type: "stdio", command: cmd, args, env };
  } else {
    const url = $("form-server-url")?.value.trim() || "https://...";
    let headers = {};
    try {
      const hStr = $("form-server-headers")?.value.trim();
      if (hStr) headers = JSON.parse(hStr);
    } catch (_) {}
    obj[name] = { type: tr, url, headers };
  }
  if ($("form-json-draft")) $("form-json-draft").value = JSON.stringify(obj, null, 2);
}

$("btn-json-format")?.addEventListener("click", () => {
  try {
    const draft = $("form-json-draft")?.value.trim();
    if (!draft) return;
    const parsed = JSON.parse(draft);
    $("form-json-draft").value = JSON.stringify(parsed, null, 2);
    if ($("form-json-error")) $("form-json-error").hidden = true;
  } catch (e) {
    if ($("form-json-error")) {
      $("form-json-error").textContent = `Syntax Error: ${e.message}`;
      $("form-json-error").hidden = false;
    }
  }
});

function editServerInForm(srv) {
  formEditingServerId = srv.id;
  if ($("form-editing-label")) $("form-editing-label").textContent = `Editing '${srv.name || srv.id}'`;
  if ($("form-server-name")) $("form-server-name").value = srv.id;
  if ($("form-server-scope")) $("form-server-scope").value = srv.scope || "user";
  const tr = srv.command ? "stdio" : (srv.type || "http");
  if ($("form-server-transport")) {
    $("form-server-transport").value = tr;
    toggleTransportFields(tr);
  }
  if ($("form-server-command")) $("form-server-command").value = srv.command || "";
  if ($("form-server-args")) $("form-server-args").value = Array.isArray(srv.args) ? srv.args.join(" ") : (srv.args || "");
  if ($("form-server-env")) $("form-server-env").value = srv.env ? JSON.stringify(srv.env, null, 2) : "";
  if ($("form-server-url")) $("form-server-url").value = srv.url || "";
  if ($("form-server-headers")) $("form-server-headers").value = srv.headers ? JSON.stringify(srv.headers, null, 2) : "";
  if ($("form-server-timeout")) $("form-server-timeout").value = srv.timeoutMs || 5000;

  syncFormToJsonDraft();
  showMcpTab("form");
}

$("btn-form-reset")?.addEventListener("click", () => {
  formEditingServerId = null;
  if ($("form-editing-label")) $("form-editing-label").textContent = "New Server Configuration";
  $("mcp-server-form")?.reset();
  toggleTransportFields("stdio");
  if ($("form-probe-banner")) $("form-probe-banner").hidden = true;
});

// Probe test button in Form
$("btn-form-probe")?.addEventListener("click", async () => {
  const banner = $("form-probe-banner");
  const txt = $("form-probe-text");
  const icon = $("form-probe-icon");
  if (!banner || !txt) return;

  const name = $("form-server-name")?.value.trim() || "test-server";
  const tr = $("form-server-transport")?.value || "stdio";
  const cmd = $("form-server-command")?.value.trim() || "";
  const args = $("form-server-args")?.value.trim() || "";
  const url = $("form-server-url")?.value.trim() || "";

  let env = {};
  try {
    const envStr = $("form-server-env")?.value.trim();
    if (envStr) env = JSON.parse(envStr);
  } catch (_) {}

  banner.hidden = false;
  banner.className = "probe-banner testing";
  icon.textContent = "⏳";
  txt.textContent = "Testing connection...";

  try {
    const res = await call("mcp_probe", {
      config: {
        name,
        type: tr,
        command: cmd,
        args,
        env,
        url
      }
    });
    if (res.success) {
      banner.className = "probe-banner success";
      icon.textContent = "✅";
      txt.textContent = `Connected! Latency: ${res.response_time_ms}ms · Tools discovered: ${res.tool_count || 0}`;
    } else {
      banner.className = "probe-banner error";
      icon.textContent = "✕";
      txt.textContent = `Failed (${res.failureKind || "error"}): ${res.error || "Could not reach server"}`;
    }
  } catch (err) {
    banner.className = "probe-banner error";
    icon.textContent = "✕";
    txt.textContent = `Probe error: ${err.message || err}`;
  }
});

// Save from Form
$("mcp-server-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("form-server-name").value.trim();
  const scope = $("form-server-scope").value;
  const tr = $("form-server-transport").value;
  const timeoutMs = parseInt($("form-server-timeout").value, 10) || 5000;
  const cmd = $("form-server-command")?.value.trim() || "";
  const args = $("form-server-args")?.value.trim() || "";
  const url = $("form-server-url")?.value.trim() || "";

  let env = {};
  try {
    const envStr = $("form-server-env")?.value.trim();
    if (envStr) env = JSON.parse(envStr);
  } catch (_) {}

  let headers = {};
  try {
    const hStr = $("form-server-headers")?.value.trim();
    if (hStr) headers = JSON.parse(hStr);
  } catch (_) {}

  try {
    await call("mcp_install", {
      id,
      config: {
        name: id,
        scope,
        type: tr,
        command: cmd,
        args,
        env,
        url,
        headers,
        timeoutMs
      }
    });
    message("notice", `MCP server '${id}' saved and connected successfully! 🚀`);
    showMcpTab("installed");
    updateMcpBadge();
  } catch (err) {
    message("error", `Save failed: ${err.message || err}`);
  }
});

// Save from JSON Draft
$("btn-save-json-draft")?.addEventListener("click", async () => {
  const draft = $("form-json-draft")?.value.trim();
  if (!draft) return;
  try {
    const parsed = JSON.parse(draft);
    const [id, conf] = Object.entries(parsed)[0] || [];
    if (!id || !conf) {
      throw new Error("JSON must contain an object with server ID as key.");
    }
    await call("mcp_install", { id, config: conf });
    message("notice", `MCP server '${id}' saved from JSON successfully! 🚀`);
    showMcpTab("installed");
    updateMcpBadge();
  } catch (e) {
    if ($("form-json-error")) {
      $("form-json-error").textContent = `Error: ${e.message}`;
      $("form-json-error").hidden = false;
    }
  }
});

$("btn-cancel-json-draft")?.addEventListener("click", () => setEditorMode("form"));

// =========================================================================
// Raw Config Editor View (~/.mika/mcp_servers.json)
// =========================================================================
async function loadMcpRaw() {
  const ta = $("raw-config-textarea");
  if (!ta) return;
  ta.value = "Loading raw configuration...";
  try {
    const res = await call("mcp_raw_config");
    ta.value = res.raw || "{}";
    if ($("raw-save-status")) $("raw-save-status").hidden = true;
  } catch (e) {
    ta.value = `Error loading raw config: ${e.message || e}`;
  }
}

$("btn-format-raw")?.addEventListener("click", () => {
  const ta = $("raw-config-textarea");
  if (!ta) return;
  try {
    const parsed = JSON.parse(ta.value);
    ta.value = JSON.stringify(parsed, null, 2);
  } catch (e) {
    showRawStatus(`JSON syntax error: ${e.message}`, "error");
  }
});

$("btn-reload-raw")?.addEventListener("click", loadMcpRaw);

$("btn-save-raw")?.addEventListener("click", async () => {
  const ta = $("raw-config-textarea");
  if (!ta) return;
  try {
    const res = await call("mcp_save_raw", {raw: ta.value});
    if (res.status === "ok") {
      showRawStatus(`Config saved successfully! Loaded ${res.count} servers.`, "success");
      updateMcpBadge();
    } else {
      showRawStatus(`Failed to save: ${res.error}`, "error");
    }
  } catch (e) {
    showRawStatus(`Error: ${e.message || e}`, "error");
  }
});

function showRawStatus(msg, type) {
  const banner = $("raw-save-status");
  if (!banner) return;
  banner.textContent = msg;
  banner.className = `raw-status-banner ${type}`;
  banner.hidden = false;
}

// =========================================================================
// Marketplace Catalog & Category Chips
// =========================================================================
function renderMcpCards(list) {
  const grid = $("mcp-market-grid");
  if (!grid) return;
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = '<p class="hint">No matching MCP servers found. Try another query or add custom server.</p>';
    return;
  }
  list.forEach(srv => {
    const card = document.createElement("div");
    card.className = "mcp-card";
    card.innerHTML = `
      <div class="mcp-card-top">
        <span class="mcp-icon">${srv.icon || '🧩'}</span>
        <div>
          <div class="mcp-card-title">${srv.name}</div>
          <div class="mcp-card-desc">${srv.description}</div>
        </div>
      </div>
      <div class="mcp-card-actions">
        <span class="mcp-badge ${srv.installed ? 'active' : ''}">${srv.installed ? 'Installed' : (srv.source || srv.category)}</span>
        <button type="button" class="mcp-action-btn ${srv.installed ? 'uninstall' : 'install'}" data-id="${srv.id}">
          ${srv.installed ? 'Uninstall' : 'Install'}
        </button>
      </div>
    `;
    card.querySelector("button").onclick = async () => {
      const action = srv.installed ? "mcp_uninstall" : "mcp_install";
      try {
        await call(action, {id: srv.id});
        message("notice", `MCP server '${srv.name || srv.id}' ${srv.installed ? 'uninstalled' : 'installed'} successfully! ⚡`);
      } catch (err) {
        message("error", `MCP ${action} failed: ${err.message || err}`);
      }
      loadMcpMarket();
      loadMcpInstalled();
      updateMcpBadge();
    };
    grid.appendChild(card);
  });
}

let currentMarketList = [];
let currentMcpCategory = "all";

function filterAndRenderMcpMarket() {
  if (!currentMarketList || !currentMarketList.length) {
    renderMcpCards([]);
    return;
  }
  if (currentMcpCategory === "all") {
    renderMcpCards(currentMarketList);
    return;
  }
  const filtered = currentMarketList.filter(srv => {
    const cat = (srv.category || "").toLowerCase();
    const name = (srv.name || "").toLowerCase();
    const id = (srv.id || "").toLowerCase();
    const desc = (srv.description || "").toLowerCase();
    if (currentMcpCategory === "zcode") {
      return cat.includes("zcode") || cat.includes("acp") || name.includes("zcode") || id.includes("zcode") || desc.includes("zcode");
    }
    if (currentMcpCategory === "deepseek") {
      return cat.includes("deepseek") || name.includes("deepseek") || id.includes("deepseek") || desc.includes("deepseek");
    }
    if (currentMcpCategory === "paseo") {
      return cat.includes("paseo") || name.includes("paseo") || id.includes("paseo") || desc.includes("paseo");
    }
    if (currentMcpCategory === "dev") {
      return cat.includes("dev") || cat.includes("developer") || cat.includes("code") || cat.includes("witness") || id.includes("git") || desc.includes("developer");
    }
    if (currentMcpCategory === "db") {
      return cat.includes("data") || cat.includes("db") || cat.includes("cloud") || cat.includes("postgres") || cat.includes("sqlite") || desc.includes("database");
    }
    if (currentMcpCategory === "github") {
      return cat.includes("github") || cat.includes("smithery") || (srv.source && srv.source.includes("github"));
    }
    return true;
  });
  renderMcpCards(filtered);
}

document.querySelectorAll(".mcp-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".mcp-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentMcpCategory = chip.dataset.cat || "all";
    filterAndRenderMcpMarket();
  });
});

async function loadMcpMarket() {
  const grid = $("mcp-market-grid");
  if (!grid) return;
  try {
    const res = await call("mcp_market");
    currentMarketList = res.marketplace || [];
    if ($("mcp-count-market")) $("mcp-count-market").textContent = `${currentMarketList.length}+`;
    filterAndRenderMcpMarket();
  } catch (e) {
    grid.innerHTML = `<p class="hint">Cannot reach MCP service: ${e.message || e}</p>`;
  }
}

async function searchMcpMarket(query) {
  const grid = $("mcp-market-grid");
  if (!grid) return;
  grid.innerHTML = '<p class="hint">🔍 Searching GitHub & Smithery MCP sources...</p>';
  try {
    const res = await call("mcp_search", {query});
    currentMarketList = res.results || [];
    filterAndRenderMcpMarket();
  } catch (e) {
    grid.innerHTML = `<p class="hint">Search error: ${e.message || e}</p>`;
  }
}

async function updateMcpBadge() {
  try {
    const res = await call("mcp_servers");
    const count = (res.servers || []).filter(s => s.enabled !== false).length;
    if ($("mcp-active-count")) $("mcp-active-count").textContent = `${count} active`;
  } catch (_) {}
}

$("btn-sync-github")?.addEventListener("click", () => {
  const q = $("mcp-search-query")?.value.trim() || "topic:mcp-server";
  searchMcpMarket(q);
});

$("mcp-search-query")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchMcpMarket(e.target.value.trim() || "topic:mcp-server");
  }
});

$("mcp-search-query")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchMcpMarket(e.target.value.trim() || "topic:mcp-server");
  }
});

// =========================================================================
// Project Live Preview Sandbox & Web Page Preview (ZCode / Paseo / DeepSeek Harness)
// =========================================================================
let currentPreviewWs = "";
let currentPreviewFile = "";
let currentInlineHtmlPath = "";
let currentInlineHtmlContent = "";
let currentWebPath = "";
let currentWebWs = "";

const previewModal = $("project-preview-modal");
const webPageModal = $("web-page-modal");

// --- Inline Web Preview Handling ---
async function loadInlinePreview(filePath, forceReload = false) {
  if (!filePath) return;
  const iframe = $("inline-preview-iframe");
  if (!iframe) return;
  if (!forceReload && currentInlineHtmlPath === filePath && currentInlineHtmlContent) {
    return;
  }
  currentInlineHtmlPath = filePath;
  try {
    const res = await call("project_read_file", {path: filePath});
    if (res && res.content) {
      currentInlineHtmlContent = res.content;
      iframe.srcdoc = res.content;
    }
  } catch (err) {
    console.error("Failed to load inline preview:", err);
  }
}

$("btn-device-desktop")?.addEventListener("click", () => {
  $("btn-device-desktop")?.classList.add("active");
  $("btn-device-mobile")?.classList.remove("active");
  $("inline-preview-viewport")?.classList.remove("mobile");
});

$("btn-device-mobile")?.addEventListener("click", () => {
  $("btn-device-mobile")?.classList.add("active");
  $("btn-device-desktop")?.classList.remove("active");
  $("inline-preview-viewport")?.classList.add("mobile");
});

$("btn-reload-inline")?.addEventListener("click", () => {
  if (currentInlineHtmlPath) loadInlinePreview(currentInlineHtmlPath, true);
});

$("btn-expand-preview")?.addEventListener("click", () => {
  if (currentInlineHtmlPath) openLivePagePreview(currentInlineHtmlPath, selected?.goal, selected?.workspace);
});

$("btn-open-in-browser")?.addEventListener("click", async () => {
  if (currentInlineHtmlPath) {
    await call("open_file", {path: currentInlineHtmlPath});
    message("notice", "Opened deliverable in macOS Chrome/browser! 🚀");
  }
});

// --- Dedicated Full-Screen Web Page Preview Modal ---
async function openLivePagePreview(htmlPath, title, wsPath) {
  currentWebPath = htmlPath;
  currentWebWs = wsPath || selected?.workspace || currentPreviewWs;
  if (webPageModal) webPageModal.hidden = false;

  const urlBar = $("web-modal-url");
  if (urlBar) {
    const t = (title || "").toLowerCase();
    if (t.includes("anytest")) {
      urlBar.value = "https://www.anytest.dev";
    } else if (title) {
      urlBar.value = `https://${title.replace(/[^a-zA-Z0-9.-]/g, "").toLowerCase() || "app.preview"}.dev`;
    } else {
      urlBar.value = htmlPath ? `file://${htmlPath}` : "preview://app";
    }
  }

  const iframe = $("web-page-iframe");
  if (iframe && htmlPath) {
    try {
      const res = await call("project_read_file", {path: htmlPath});
      if (res && res.content) {
        iframe.srcdoc = res.content;
      }
    } catch (err) {
      iframe.srcdoc = `<p style="padding:20px; font-family:sans-serif; color:#ef4444">Error loading preview: ${err.message || err}</p>`;
    }
  }
}

$("btn-web-desktop")?.addEventListener("click", () => {
  $("btn-web-desktop")?.classList.add("active");
  $("btn-web-tablet")?.classList.remove("active");
  $("btn-web-mobile")?.classList.remove("active");
  $("web-frame-wrapper")?.classList.remove("mobile", "tablet");
});

$("btn-web-tablet")?.addEventListener("click", () => {
  $("btn-web-tablet")?.classList.add("active");
  $("btn-web-desktop")?.classList.remove("active");
  $("btn-web-mobile")?.classList.remove("active");
  $("web-frame-wrapper")?.classList.remove("mobile");
  $("web-frame-wrapper")?.classList.add("tablet");
});

$("btn-web-mobile")?.addEventListener("click", () => {
  $("btn-web-mobile")?.classList.add("active");
  $("btn-web-desktop")?.classList.remove("active");
  $("btn-web-tablet")?.classList.remove("active");
  $("web-frame-wrapper")?.classList.remove("tablet");
  $("web-frame-wrapper")?.classList.add("mobile");
});

$("btn-web-modal-reload")?.addEventListener("click", () => {
  if (currentWebPath) openLivePagePreview(currentWebPath, selected?.goal, currentWebWs);
});

$("btn-web-open-browser")?.addEventListener("click", async () => {
  if (currentWebPath) {
    await call("open_file", {path: currentWebPath});
    message("notice", "Opened deliverable in macOS Chrome/browser! 🚀");
  }
});

$("btn-web-open-dev")?.addEventListener("click", () => {
  if (webPageModal) webPageModal.hidden = true;
  openProjectPreview(currentWebWs);
});

$("btn-close-web-modal")?.addEventListener("click", () => {
  if (webPageModal) webPageModal.hidden = true;
});

webPageModal?.addEventListener("click", (e) => {
  if (e.target === webPageModal) webPageModal.hidden = true;
});

// --- Developer Sandbox Modal Handling ---
$("btn-open-preview")?.addEventListener("click", () => {
  const arts = selected?.artifacts || [];
  const htmlArt = arts.find(a => a.type === "html" || (a.name && a.name.endsWith(".html")));
  if (htmlArt) {
    openLivePagePreview(htmlArt.path, htmlArt.name, selected?.workspace);
  } else {
    openProjectPreview();
  }
});
$("btn-open-dev-sandbox")?.addEventListener("click", () => openProjectPreview());
$("btn-close-preview")?.addEventListener("click", () => {
  if (previewModal) previewModal.hidden = true;
});
previewModal?.addEventListener("click", (e) => {
  if (e.target === previewModal) previewModal.hidden = true;
});

$("tab-code-viewer")?.addEventListener("click", () => showPreviewTab("code"));
$("tab-web-render")?.addEventListener("click", () => showPreviewTab("web"));
$("tab-live-terminal")?.addEventListener("click", () => showPreviewTab("terminal"));
$("tab-witness-cert")?.addEventListener("click", () => showPreviewTab("witness"));

function showPreviewTab(tab) {
  $("tab-code-viewer")?.classList.toggle("active", tab === "code");
  $("tab-web-render")?.classList.toggle("active", tab === "web");
  $("tab-live-terminal")?.classList.toggle("active", tab === "terminal");
  $("tab-witness-cert")?.classList.toggle("active", tab === "witness");

  if ($("view-code")) $("view-code").hidden = tab !== "code";
  if ($("view-web")) $("view-web").hidden = tab !== "web";
  if ($("view-terminal")) $("view-terminal").hidden = tab !== "terminal";
  if ($("view-witness")) $("view-witness").hidden = tab !== "witness";
}

async function openProjectPreview(workspacePath) {
  const ws = workspacePath || selected?.workspace || currentPreviewWs;
  if (previewModal) previewModal.hidden = false;
  showPreviewTab("code");
  const treeContainer = $("preview-file-tree");
  if (!ws) {
    if (treeContainer) treeContainer.innerHTML = '<p class="hint">У выбранной задачи пока нет файлов в песочнице. Запустите Coder Team или создайте файлы.</p>';
    if ($("preview-code-content")) $("preview-code-content").textContent = "Файлы проекта еще не созданы.";
    if ($("preview-workspace-pill")) $("preview-workspace-pill").textContent = "none";
    if ($("preview-project-title")) $("preview-project-title").textContent = "🚀 Live Sandbox: Empty";
    return;
  }
  if (treeContainer) treeContainer.innerHTML = '<p class="hint">Загрузка структуры проекта...</p>';

  try {
    const res = await call("project_tree", {workspace: ws});
    currentPreviewWs = res.workspace || "";
    if ($("preview-workspace-pill")) $("preview-workspace-pill").textContent = currentPreviewWs || ws;
    if ($("preview-project-title")) $("preview-project-title").textContent = `🚀 Live Sandbox: ${(currentPreviewWs || ws).split("/").pop()}`;

    const files = res.files || [];
    if (!files.length) {
      if (treeContainer) treeContainer.innerHTML = '<p class="hint">Файлы проекта не найдены.</p>';
      if ($("preview-code-content")) $("preview-code-content").textContent = "Файлы не найдены.";
      return;
    }

    if (treeContainer) {
      treeContainer.innerHTML = "";
      files.forEach((f, idx) => {
        const item = document.createElement("div");
        item.className = "tree-file-item" + (idx === 0 ? " active" : "");
        const icon = f.ext === ".py" ? "🐍 " : f.ext === ".md" ? "📑 " : f.ext === ".json" ? "🛡️ " : f.ext === ".html" ? "🌐 " : "📄 ";
        const kb = (f.size / 1024).toFixed(1) + " KB";
        item.innerHTML = `<span>${icon}${f.name}</span><span class="file-size">${kb}</span>`;
        item.onclick = () => {
          document.querySelectorAll(".tree-file-item").forEach(el => el.classList.remove("active"));
          item.classList.add("active");
          loadPreviewFile(f.path, f.name, kb, f.ext);
        };
        treeContainer.appendChild(item);
      });
    }

    // Default open first important file (index.html, or any .html, PLAN.md, main.py, or index 0)
    const defFile = files.find(f => f.name === "index.html") || files.find(f => f.ext === ".html") || files.find(f => f.name === "PLAN.md") || files.find(f => f.name === "main.py") || files[0];
    if (defFile) {
      await loadPreviewFile(defFile.path, defFile.name, (defFile.size / 1024).toFixed(1) + " KB", defFile.ext);
      if (defFile.ext === ".html") {
        showPreviewTab("web");
      }
    }
  } catch (err) {
    if (treeContainer) treeContainer.innerHTML = `<p class="hint">Ошибка чтения файлов: ${err.message || err}</p>`;
  }
}

async function loadPreviewFile(filePath, fileName, fileSize, ext) {
  currentPreviewFile = filePath;
  if ($("view-file-name")) $("view-file-name").textContent = fileName;
  if ($("view-file-size")) $("view-file-size").textContent = fileSize;
  if ($("preview-code-content")) $("preview-code-content").textContent = "Загрузка содержимого...";

  try {
    const res = await call("project_read_file", {path: filePath});
    const content = res.content || "";
    if ($("preview-code-content")) $("preview-code-content").textContent = content;

    // If HTML file, populate iframe
    if (ext === ".html" && $("preview-iframe")) {
      $("preview-iframe").srcdoc = content;
      showPreviewTab("web");
    }

    // If attestation.json, populate witness tab
    if (fileName === "attestation.json" && $("witness-json-pre")) {
      try {
        const parsed = JSON.parse(content);
        $("witness-json-pre").textContent = JSON.stringify(parsed, null, 2);
      } catch (_) {
        $("witness-json-pre").textContent = content;
      }
    }
  } catch (err) {
    if ($("preview-code-content")) $("preview-code-content").textContent = "Ошибка чтения файла: " + (err.message || err);
  }
}

$("btn-refresh-tree")?.addEventListener("click", () => openProjectPreview(currentPreviewWs));

$("btn-run-live")?.addEventListener("click", async () => {
  showPreviewTab("terminal");
  const term = $("preview-terminal-output");
  const badge = $("terminal-status");
  if (badge) { badge.textContent = "RUNNING"; badge.style.color = "#38bdf8"; }
  if (term) term.innerHTML = `<p class="terminal-line dim">🚀 Запуск: python3 main.py --action run ...</p>`;

  try {
    const res = await call("project_run", {workspace: currentPreviewWs, command: "main"});
    if (badge) {
      badge.textContent = res.exit_code === 0 ? "EXIT 0 (SUCCESS)" : `EXIT ${res.exit_code} (FAILED)`;
      badge.style.color = res.exit_code === 0 ? "#10b981" : "#ef4444";
    }
    let out = `<p class="terminal-line dim">[CMD] ${res.command} (${res.duration}s)</p>\n`;
    if (res.stdout) out += `<div class="terminal-stdout">${escapeHtml(res.stdout)}</div>`;
    if (res.stderr) out += `<div class="terminal-stderr" style="color:#ef4444">${escapeHtml(res.stderr)}</div>`;
    if (term) term.innerHTML = out;
  } catch (err) {
    if (badge) { badge.textContent = "ERROR"; badge.style.color = "#ef4444"; }
    if (term) term.innerHTML = `<p class="terminal-line" style="color:#ef4444">Ошибка запуска: ${err.message || err}</p>`;
  }
});

$("btn-run-tests")?.addEventListener("click", async () => {
  showPreviewTab("terminal");
  const term = $("preview-terminal-output");
  const badge = $("terminal-status");
  if (badge) { badge.textContent = "TESTING"; badge.style.color = "#a855f7"; }
  if (term) term.innerHTML = `<p class="terminal-line dim">🧪 Запуск автоматических тестов: python3 -m unittest test_suite.py ...</p>`;

  try {
    const res = await call("project_run", {workspace: currentPreviewWs, command: "test"});
    if (badge) {
      badge.textContent = res.exit_code === 0 ? "100% PASSED" : `TESTS FAILED (EXIT ${res.exit_code})`;
      badge.style.color = res.exit_code === 0 ? "#10b981" : "#ef4444";
    }
    let out = `<p class="terminal-line dim">[CMD] ${res.command} (${res.duration}s)</p>\n`;
    if (res.stdout) out += `<div class="terminal-stdout">${escapeHtml(res.stdout)}</div>`;
    if (res.stderr) out += `<div class="terminal-stderr" style="color:${res.exit_code === 0 ? '#10b981' : '#ef4444'}">${escapeHtml(res.stderr)}</div>`;
    if (term) term.innerHTML = out;
  } catch (err) {
    if (badge) { badge.textContent = "ERROR"; badge.style.color = "#ef4444"; }
    if (term) term.innerHTML = `<p class="terminal-line" style="color:#ef4444">Ошибка тестирования: ${err.message || err}</p>`;
  }
});

$("btn-reveal-finder")?.addEventListener("click", async () => {
  if (currentPreviewWs) {
    await call("open_file", {path: currentPreviewWs});
    message("notice", "Opened project folder in macOS Finder!");
  }
});

$("btn-open-in-editor")?.addEventListener("click", async () => {
  if (currentPreviewFile) {
    await call("open_file", {path: currentPreviewFile});
    message("notice", "Opened file in macOS default editor!");
  }
});

function escapeHtml(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Top-Nav Navigation (DeepSeek Desktop & ZCode style)
function setActiveNav(id) {
  document.querySelectorAll(".nav-pill").forEach(p => p.classList.toggle("active", p.id === id));
}

$("nav-tasks")?.addEventListener("click", () => {
  setActiveNav("nav-tasks");
  $("goal")?.focus();
  window.scrollTo({top: 0, behavior: "smooth"});
});

$("nav-coder")?.addEventListener("click", () => {
  setActiveNav("nav-coder");
  const chk = $("chk-coder-team");
  if (chk) chk.checked = true;
  $("goal")?.focus();
  const board = $("coder-board");
  if (board && !board.hidden) {
    board.scrollIntoView({behavior: "smooth"});
  } else {
    $("compose")?.scrollIntoView({behavior: "smooth"});
  }
});

$("nav-mcp")?.addEventListener("click", () => {
  setActiveNav("nav-mcp");
  if (mcpModal) mcpModal.hidden = false;
  loadMcpMarket();
});

$("nav-preview")?.addEventListener("click", () => {
  setActiveNav("nav-preview");
  const arts = selected?.artifacts || [];
  const htmlArt = arts.find(a => a.type === "html" || (a.name && a.name.endsWith(".html")));
  if (htmlArt) {
    openLivePagePreview(htmlArt.path, htmlArt.name, selected?.workspace);
  } else {
    openProjectPreview();
  }
});

// Global Keyboard Shortcuts (DeepSeek / ZCode productivity)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (mcpModal && !mcpModal.hidden) mcpModal.hidden = true;
    if (previewModal && !previewModal.hidden) previewModal.hidden = true;
    if (webPageModal && !webPageModal.hidden) webPageModal.hidden = true;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    if (document.activeElement === $("goal") && !$("submit-goal").disabled) {
      $("compose")?.dispatchEvent(new Event("submit", {cancelable: true}));
    } else if (document.activeElement === $("reply") && !$("respond").hidden) {
      $("respond")?.dispatchEvent(new Event("submit", {cancelable: true}));
    }
  }
});

function startNewTask() {
  setActiveNav("nav-new-task");
  choose(null);
  $("goal").value = "";
  $("goal").focus();
  currentPreviewWs = "";
  currentInlineHtmlPath = "";
  currentInlineHtmlContent = "";
  if ($("task-web-preview-card")) $("task-web-preview-card").hidden = true;
  if ($("inline-preview-iframe")) $("inline-preview-iframe").srcdoc = "";
  render();
  window.scrollTo({top: 0, behavior: "smooth"});
}

$("btn-new-task")?.addEventListener("click", startNewTask);
$("nav-new-task")?.addEventListener("click", startNewTask);

document.querySelectorAll(".welcome-card").forEach(card => {
  card.addEventListener("click", () => {
    const prompt = card.dataset.prompt;
    if (prompt) {
      $("goal").value = prompt;
      $("goal").focus();
      if ($("submit-goal")) $("submit-goal").disabled = false;
      $("compose")?.scrollIntoView({behavior: "smooth"});
    }
  });
});

// =========================================================================
// DeepSeek Harness Superagent (DSH) Implementation (docs/000 - docs/005)
// =========================================================================

function switchDshView(viewName) {
  const isVibe = (viewName === "vibe-coding");
  const isTasks = (viewName === "tasks");
  const isOverview = (viewName === "overview");

  if ($("view-vibe-coding")) $("view-vibe-coding").hidden = !isVibe;
  if ($("compose")) $("compose").hidden = !isTasks && !isOverview;
  const cols = document.querySelector(".columns");
  if (cols) cols.hidden = !isTasks && !isOverview;
  if ($("dsh-super-banner")) $("dsh-super-banner").hidden = !isOverview && !isTasks;

  const panels = {
    triggers: $("dsh-triggers-panel"),
    evals: $("dsh-evals-panel"),
    execution: $("dsh-execution-panel"),
    prompts: $("dsh-prompts-panel")
  };
  Object.keys(panels).forEach(k => {
    if (panels[k]) panels[k].hidden = (k !== viewName);
  });

  if (viewName === "triggers") loadDshTriggers("all");
  if (viewName === "evals") loadDshEvals();
  if (viewName === "execution") loadDshTickets("all");
  if (viewName === "prompts") loadDshPrompts();
  if (viewName === "overview") loadDshOverview();
}

async function loadDshOverview() {
  try {
    const res = await call("dsh_overview");
    if (!res || res.status !== "ok" || !res.overview) return;
    const ov = res.overview;

    // Q1: Needs Me Now
    const person = ov.person || [];
    const badgeQ1 = $("dsh-badge-needs-me");
    const bodyQ1 = $("dsh-body-needs-me");
    if (badgeQ1) {
      badgeQ1.textContent = person.length ? `${person.length} Needs Action` : "0 Needs Action";
      badgeQ1.className = `dsh-q-badge ${person.length ? 'warning' : 'success'}`;
    }
    if (bodyQ1) {
      if (!person.length) {
        bodyQ1.innerHTML = '<p class="hint" style="margin:4px 0;">Quiet: No human intervention needed. Running autonomously.</p>';
      } else {
        bodyQ1.innerHTML = person.map(t => `
          <div class="dsh-ticket-row-mini">
            <span class="dsh-ticket-title-mini" title="${t.title}">${t.title}</span>
            <button type="button" class="dsh-btn-action-mini" data-ticket-id="${t.id}" data-action="${t.stage?.action || 'review'}">
              ${t.stage?.action === 'answer' ? 'Answer' : (t.stage?.action === 'blocked' ? 'Retry' : 'Approve')}
            </button>
          </div>
        `).join("");

        bodyQ1.querySelectorAll(".dsh-btn-action-mini").forEach(btn => {
          btn.onclick = async (e) => {
            e.stopPropagation();
            const tid = btn.dataset.ticketId;
            const act = btn.dataset.action;
            if (act === "blocked" || act === "failed") {
              await call("dsh_ticket_retry", {ticket_id: tid});
              message("notice", `Ticket '${tid}' restarted!`);
            } else if (act === "answer") {
              const ans = prompt("Enter your decision/answer for worker:");
              if (ans) {
                await call("dsh_ticket_answer", {ticket_id: tid, answer: ans});
                message("notice", "Answer sent to ticket worker.");
              }
            } else {
              await call("dsh_ticket_approve", {ticket_id: tid});
              message("notice", `Ticket '${tid}' approved & delivered! 😻`);
            }
            loadDshOverview();
          };
        });
      }
    }

    // Q2: System Health & Executor Load
    const flow = ov.flow || {};
    if ($("flow-received")) $("flow-received").textContent = flow.received || 0;
    if ($("flow-filtered")) $("flow-filtered").textContent = flow.filtered || 0;
    if ($("flow-judged")) $("flow-judged").textContent = flow.judged || 0;
    if ($("flow-accepted")) $("flow-accepted").textContent = flow.accepted || 0;
    if ($("flow-dropped")) $("flow-dropped").textContent = flow.dropped || 0;

    const exec = ov.executor || {};
    const paused = !!exec.paused;
    const btnPause = $("dsh-btn-pause");
    if (btnPause) {
      btnPause.textContent = paused ? "▶ Resume Engine" : "⏸ Pause Engine";
      btnPause.classList.toggle("paused", paused);
    }
    const dot = $("dsh-executor-dot");
    if (dot) dot.className = `status-dot ${paused ? 'yellow' : (exec.running > 0 ? 'green' : 'gray')}`;
    const txt = $("dsh-executor-text");
    if (txt) {
      txt.textContent = paused ? "Paused (Quiet)" : `Running: ${exec.running}/${exec.maxWorkers || 4} workers`;
    }
    const fill = $("dsh-load-fill");
    if (fill) {
      const pct = Math.min(100, Math.round(((exec.running || 0) / (exec.maxWorkers || 4)) * 100));
      fill.style.width = `${pct}%`;
    }

    // Q3: Trace History
    const ended = ov.ended || [];
    const bodyQ3 = $("dsh-body-history");
    const badgeQ3 = $("dsh-badge-trace");
    if (badgeQ3) badgeQ3.textContent = `${ov.total_tickets || 3} Total Tickets`;
    if (bodyQ3) {
      if (!ended.length) {
        bodyQ3.innerHTML = '<p class="hint" style="margin:4px 0;">No completed tickets in history yet.</p>';
      } else {
        bodyQ3.innerHTML = ended.slice(0, 2).map(t => `
          <div class="dsh-ticket-row-mini">
            <span class="dsh-ticket-title-mini" title="${t.title}">${t.title}</span>
            <span class="dsh-stage-badge ended" style="font-size:9px; padding:2px 4px;">Delivered</span>
          </div>
        `).join("");
      }
    }
  } catch (err) {
    console.warn("DSH overview load error:", err);
  }
}

async function loadDshTriggers(filter) {
  const container = $("dsh-triggers-list");
  if (!container) return;
  container.innerHTML = '<p class="hint">Loading triggers and threads from sources...</p>';
  try {
    const res = await call("dsh_triggers", {filter});
    const triggers = res.triggers || [];
    if (!triggers.length) {
      container.innerHTML = '<p class="hint">No triggers found for current filter.</p>';
      return;
    }
    container.innerHTML = triggers.map(tr => `
      <div class="mcp-card" style="margin-bottom:12px; display:block;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <span class="mcp-badge active">${tr.source.toUpperCase()}</span>
            <span class="mcp-badge" style="background:#1e293b; color:#cbd5e1;">${tr.human ? '👤 ' + tr.actor.id : '🤖 ' + tr.actor.id}</span>
            <span class="mcp-badge" style="background:#1e293b; color:#38bdf8;">${tr.addressed || 'direct'}</span>
          </div>
          <span style="font-size:11px; color:#64748b;">${new Date(tr.at).toLocaleTimeString()}</span>
        </div>
        <p style="font-size:13px; color:#f1f5f9; margin:4px 0 8px; font-weight:500;">${tr.text}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px; font-size:11px; color:#94a3b8;">
          <span>Thread: <code>${tr.threads?.[0]?.id || 'main'}</code> • Disposition: <b>${tr.disposition?.decisionId ? 'Decided' : 'Queued'}</b></span>
          <button type="button" class="mini-btn dsh-btn-requeue" data-trig-id="${tr.id}">🔄 Re-evaluate</button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".dsh-btn-requeue").forEach(b => {
      b.onclick = async () => {
        await call("dsh_requeue", {trigger_id: b.dataset.trigId});
        message("notice", `Trigger '${b.dataset.trigId}' requeued for policy evaluation.`);
        loadDshTriggers(filter);
        loadDshOverview();
      };
    });
  } catch (err) {
    container.innerHTML = `<p class="hint">Error: ${err.message || err}</p>`;
  }
}

async function loadDshEvals() {
  const container = $("dsh-evals-list");
  const rulesBox = $("dsh-rules-list");
  if (!container) return;
  container.innerHTML = '<p class="hint">Loading DeepSeek R1 evaluation traces...</p>';
  try {
    const res = await call("dsh_evals");
    const evals = res.evals || [];
    const policy = res.policy || {};

    if (rulesBox && policy.rules) {
      rulesBox.innerHTML = policy.rules.map(r => `
        <div style="background:rgba(30,41,59,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:8px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:12px; color:#38bdf8;">${r.name}</strong>
            <span class="status-dot green"></span>
          </div>
          <p style="font-size:11px; color:#94a3b8; margin:0;">${r.desc}</p>
        </div>
      `).join("");
    }

    if (!evals.length) {
      container.innerHTML = '<p class="hint">No recent evaluation records found.</p>';
      return;
    }

    container.innerHTML = evals.map(ev => `
      <div class="mcp-card" style="margin-bottom:14px; display:block;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="display:flex; gap:6px; align-items:center;">
            <span class="dsh-stage-badge ${ev.decision === 'accept' ? 'working' : 'person'}">${ev.decision.toUpperCase()}</span>
            <span style="font-size:12px; color:#cbd5e1; font-weight:600;">Trigger: <code>${ev.triggerId}</code></span>
          </div>
          <span style="font-size:11px; color:#64748b;">${new Date(ev.at).toLocaleTimeString()}</span>
        </div>
        <div class="dsh-r1-box">
          <strong>DeepSeek R1 Chain-of-Thought Reasoning:</strong>
          ${ev.r1_thought}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#94a3b8; margin-top:6px;">
          <div>Mandate Scope: ${ev.mandate?.scope?.map(s => `<span class="mcp-badge" style="background:#1e293b; color:#38bdf8;">${s}</span>`).join(" ") || 'None'}</div>
          <div>Matched Rules: ${ev.matchedRules?.join(", ") || 'Default'}</div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p class="hint">Error: ${err.message || err}</p>`;
  }
}

async function loadDshTickets(stage) {
  const container = $("dsh-tickets-list");
  if (!container) return;
  container.innerHTML = '<p class="hint">Loading tickets and worker fleet status...</p>';
  try {
    const res = await call("dsh_tickets", {stage});
    const tickets = res.tickets || [];
    if (!tickets.length) {
      container.innerHTML = '<p class="hint">No execution tickets match current filter.</p>';
      return;
    }

    container.innerHTML = tickets.map(t => {
      const st = t.stage?.stage || 'working';
      const act = t.stage?.action || '';
      return `
        <div class="mcp-card" style="margin-bottom:12px; display:block;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="dsh-stage-badge ${st}">${st.toUpperCase()}${act ? ' : ' + act.toUpperCase() : ''}</span>
              <span style="font-size:11px; color:#94a3b8; margin-left:8px;">ID: <code>${t.id}</code></span>
            </div>
            <span style="font-size:11px; color:#64748b;">${new Date(t.updated_at || t.created_at).toLocaleTimeString()}</span>
          </div>
          <h4 style="color:#f1f5f9; font-size:14px; margin:8px 0 4px;">${t.title}</h4>
          <p style="font-size:12px; color:#94a3b8; margin:0 0 8px;">Actor: <b>${t.actor || 'User'}</b> • Policy: <b>${t.policyVersion || 'default'}</b></p>
          ${t.attention ? `<div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:6px; padding:8px 10px; margin-bottom:8px; font-size:12px; color:#fbbf24;">⚠️ <b>Waiting for Person:</b> ${t.attention}</div>` : ''}
          ${t.diff ? `<details style="margin-top:6px;"><summary style="font-size:11px; color:#38bdf8; cursor:pointer;">Inspect Code / Prompt Diff</summary><pre class="dsh-prompt-diff" style="margin-top:4px;">${t.diff}</pre></details>` : ''}
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
            ${(st === 'person' && act === 'review') ? `<button type="button" class="mcp-action-btn install dsh-btn-approve" data-id="${t.id}">Approve & Deliver 😻</button>` : ''}
            ${(st === 'person' && act === 'answer') ? `<button type="button" class="mcp-action-btn install dsh-btn-answer" data-id="${t.id}">Provide Answer</button>` : ''}
            ${(st === 'person' && (act === 'blocked' || act === 'failed')) ? `<button type="button" class="mcp-action-btn uninstall dsh-btn-retry" data-id="${t.id}">Retry Ticket 🔄</button>` : ''}
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".dsh-btn-approve").forEach(b => {
      b.onclick = async () => {
        await call("dsh_ticket_approve", {ticket_id: b.dataset.id});
        message("notice", `Ticket '${b.dataset.id}' approved and delivered! 😻`);
        loadDshTickets(stage);
        loadDshOverview();
      };
    });

    container.querySelectorAll(".dsh-btn-retry").forEach(b => {
      b.onclick = async () => {
        await call("dsh_ticket_retry", {ticket_id: b.dataset.id});
        message("notice", `Ticket '${b.dataset.id}' restarted!`);
        loadDshTickets(stage);
        loadDshOverview();
      };
    });

    container.querySelectorAll(".dsh-btn-answer").forEach(b => {
      b.onclick = async () => {
        const ans = prompt("Enter your answer/decision for this ticket:");
        if (ans) {
          await call("dsh_ticket_answer", {ticket_id: b.dataset.id, answer: ans});
          message("notice", "Answer recorded.");
          loadDshTickets(stage);
          loadDshOverview();
        }
      };
    });
  } catch (err) {
    container.innerHTML = `<p class="hint">Error: ${err.message || err}</p>`;
  }
}

async function loadDshPrompts() {
  try {
    const res = await call("dsh_prompts");
    if (!res || res.status !== "ok") return;
    if ($("dsh-team-prompt-input")) $("dsh-team-prompt-input").value = res.team_custom || "";
    if ($("dsh-assembled-prompt-view")) $("dsh-assembled-prompt-view").textContent = res.assembled || "";
  } catch (err) {
    console.warn("Failed to load prompts:", err);
  }
}

$("dsh-btn-save-prompt")?.addEventListener("click", async () => {
  const text = $("dsh-team-prompt-input")?.value || "";
  try {
    await call("dsh_save_prompt", {section: "team_custom", text});
    message("notice", "Team custom directives saved successfully! ⚡");
    loadDshPrompts();
  } catch (err) {
    message("error", `Save prompt error: ${err.message || err}`);
  }
});

$("dsh-btn-pause")?.addEventListener("click", async () => {
  try {
    const res = await call("dsh_pause");
    message("notice", res.paused ? "Superagent Executor Paused." : "Superagent Executor Resumed! 🚀");
    loadDshOverview();
  } catch (err) {
    message("error", `Pause error: ${err.message || err}`);
  }
});

$("dsh-quick-approve")?.addEventListener("click", async () => {
  try {
    await call("dsh_ticket_approve", {ticket_id: "ticket-anytest-01"});
    message("notice", "Mockup for anytest.dev approved and delivered! 😻🐾");
    loadDshOverview();
  } catch (err) {
    message("error", err.message || err);
  }
});

// Tab navigation bindings for DSH
$("nav-dsh-triggers")?.addEventListener("click", () => {
  setActiveNav("nav-dsh-triggers");
  switchDshView("triggers");
});

$("nav-dsh-evals")?.addEventListener("click", () => {
  setActiveNav("nav-dsh-evals");
  switchDshView("evals");
});

$("nav-dsh-execution")?.addEventListener("click", () => {
  setActiveNav("nav-dsh-execution");
  switchDshView("execution");
});

// Tab navigation bindings
$("nav-vibe-coding")?.addEventListener("click", () => {
  setActiveNav("nav-vibe-coding");
  switchDshView("vibe-coding");
});

$("nav-dsh-overview")?.addEventListener("click", () => {
  setActiveNav("nav-dsh-overview");
  switchDshView("overview");
});

$("nav-dsh-triggers")?.addEventListener("click", () => {
  setActiveNav("nav-dsh-triggers");
  switchDshView("triggers");
});

$("nav-dsh-evals")?.addEventListener("click", () => {
  setActiveNav("nav-dsh-evals");
  switchDshView("evals");
});

$("nav-dsh-execution")?.addEventListener("click", () => {
  setActiveNav("nav-dsh-execution");
  switchDshView("execution");
});

$("nav-dsh-prompts")?.addEventListener("click", () => {
  setActiveNav("nav-dsh-prompts");
  switchDshView("prompts");
});

$("nav-tasks")?.addEventListener("click", () => {
  setActiveNav("nav-tasks");
  switchDshView("tasks");
});

// =========================================================================
// Cursor Vibe Coding & Auto Prompt Enhancer (Anti-AI-UI & OpenIntelligentUI)
// =========================================================================

let currentVibeMode = "agent";
let currentVibeModel = "deepseek-r1";
let lastRawPrompt = "";
let lastEnhancedPrompt = "";

function initVibeCoding() {
  document.querySelectorAll(".vibe-mode-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".vibe-mode-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentVibeMode = pill.dataset.mode || "agent";
    });
  });

  const modelSelect = $("vibe-model-select");
  if (modelSelect) {
    modelSelect.addEventListener("change", (e) => {
      currentVibeModel = e.target.value;
    });
  }

  $("btn-enhance-prompt-action")?.addEventListener("click", async () => {
    const input = $("vibe-prompt-input");
    if (!input || !input.value.trim()) {
      message("warn", "Please enter a prompt idea first to enhance! ✨");
      return;
    }
    lastRawPrompt = input.value;
    $("btn-enhance-prompt-action").textContent = "⚡ Enhancing...";
    $("btn-enhance-prompt-action").disabled = true;
    try {
      const res = await call("vibe_enhance_prompt", {prompt: lastRawPrompt});
      if (res && res.status === "ok" && res.enhanced_prompt) {
        lastEnhancedPrompt = res.enhanced_prompt;
        input.value = res.enhanced_prompt;
        input.style.height = "auto";
        input.style.height = Math.min(180, input.scrollHeight) + "px";
        if ($("vibe-enhanced-preview-banner")) $("vibe-enhanced-preview-banner").hidden = false;
        message("notice", "⚡ Prompt upgraded to Full Project Grade specification! (Anti-AI-UI compliant)");
      }
    } catch (err) {
      message("error", `Enhance error: ${err.message || err}`);
    } finally {
      $("btn-enhance-prompt-action").textContent = "⚡ Enhance";
      $("btn-enhance-prompt-action").disabled = false;
    }
  });

  $("btn-revert-enhanced")?.addEventListener("click", () => {
    const input = $("vibe-prompt-input");
    if (input && lastRawPrompt) {
      input.value = lastRawPrompt;
      input.style.height = "auto";
      if ($("vibe-enhanced-preview-banner")) $("vibe-enhanced-preview-banner").hidden = true;
    }
  });

  document.querySelectorAll(".vibe-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = btn.dataset.vibe;
      if (p && $("vibe-prompt-input")) {
        $("vibe-prompt-input").value = p;
        $("vibe-prompt-input").focus();
        sendVibeMessage();
      }
    });
  });

  document.querySelectorAll(".context-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const input = $("vibe-prompt-input");
      if (input) {
        const tag = chip.dataset.ctx;
        input.value = input.value ? `${input.value} ${tag} ` : `${tag} `;
        input.focus();
      }
    });
  });

  $("btn-vibe-clear")?.addEventListener("click", () => {
    const stream = $("vibe-chat-stream");
    if (stream) {
      stream.innerHTML = '<p class="hint" style="text-align:center; padding:20px;">Chat history cleared. Ready for new vibe coding session! 🐱🐾</p>';
    }
  });

  $("btn-vibe-send")?.addEventListener("click", sendVibeMessage);
  $("vibe-prompt-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendVibeMessage();
    }
  });

  const canvasTabs = [
    { tab: "tab-canvas-preview", view: "canvas-view-preview" },
    { tab: "tab-canvas-diff", view: "canvas-view-diff" },
    { tab: "tab-canvas-terminal", view: "canvas-view-terminal" }
  ];
  canvasTabs.forEach(({tab, view}) => {
    $(tab)?.addEventListener("click", () => {
      canvasTabs.forEach(({tab: t, view: v}) => {
        $(t)?.classList.remove("active");
        if ($(v)) $(v).hidden = true;
      });
      $(tab)?.classList.add("active");
      if ($(view)) $(view).hidden = false;
    });
  });

  $("vibe-dev-desktop")?.addEventListener("click", () => {
    $("vibe-dev-desktop")?.classList.add("active");
    $("vibe-dev-mobile")?.classList.remove("active");
    const frame = $("vibe-canvas-iframe");
    if (frame) {
      frame.style.maxWidth = "100%";
      frame.style.margin = "0";
      frame.style.border = "0";
    }
  });

  $("vibe-dev-mobile")?.addEventListener("click", () => {
    $("vibe-dev-mobile")?.classList.add("active");
    $("vibe-dev-desktop")?.classList.remove("active");
    const frame = $("vibe-canvas-iframe");
    if (frame) {
      frame.style.maxWidth = "390px";
      frame.style.margin = "12px auto";
      frame.style.border = "4px solid #1e293b";
      frame.style.borderRadius = "24px";
      frame.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    }
  });

  $("vibe-btn-reload-canvas")?.addEventListener("click", () => {
    const frame = $("vibe-canvas-iframe");
    if (frame && frame.srcdoc) {
      const src = frame.srcdoc;
      frame.srcdoc = "";
      setTimeout(() => frame.srcdoc = src, 100);
    }
  });

  $("vibe-btn-open-browser")?.addEventListener("click", async () => {
    try {
      const res = await call("open_file", {path: currentInlineHtmlPath || ""});
      if (!res.opened) {
        message("notice", "Generated web page is live inside the Intelligent Canvas!");
      }
    } catch (_) {}
  });

  $("canvas-btn-accept-all")?.addEventListener("click", async () => {
    try {
      const res = await call("vibe_accept_all");
      message("notice", `✨ Accepted & applied all ${res.count || 1} file changes to disk!`);
      document.querySelectorAll(".btn-diff-action.accept").forEach(btn => {
        btn.textContent = "Applied ✨";
        btn.disabled = true;
      });
    } catch (err) {
      message("error", `Error: ${err.message || err}`);
    }
  });

  $("canvas-btn-reject-all")?.addEventListener("click", () => {
    message("notice", "Pending diffs rejected.");
    const container = $("canvas-diff-container");
    if (container) container.innerHTML = '<p class="hint">Diffs discarded.</p>';
  });
}

async function sendVibeMessage() {
  const input = $("vibe-prompt-input");
  if (!input) return;
  const promptText = input.value.trim();
  if (!promptText) return;

  const isAutoEnhance = $("chk-auto-enhance")?.checked ?? true;

  const stream = $("vibe-chat-stream");
  const userCard = document.createElement("div");
  userCard.className = "vibe-user-bubble";
  userCard.innerHTML = `
    <div class="vibe-user-meta">
      <strong>Катенька 👤</strong>
      <span>${new Date().toLocaleTimeString()}</span>
    </div>
    <div style="white-space:pre-wrap;">${escapeHtml(promptText)}</div>
  `;
  stream.appendChild(userCard);
  input.value = "";
  input.style.height = "auto";
  if ($("vibe-enhanced-preview-banner")) $("vibe-enhanced-preview-banner").hidden = true;

  const agentCard = document.createElement("div");
  agentCard.className = "gen-ui-card";
  agentCard.id = `agent-card-${Date.now()}`;
  agentCard.innerHTML = `
    <div class="gen-card-header">
      <span class="gen-model-badge">⚡ ${currentVibeModel.toUpperCase()} · ${currentVibeMode.toUpperCase()}</span>
      <span style="font-size:11px; color:#38bdf8;">🧠 Synthesizing Generative UI & Code Diffs...</span>
    </div>
    <div class="skeleton-shimmer" style="height:32px; background:rgba(255,255,255,0.04); border-radius:6px; margin-bottom:8px;"></div>
  `;
  stream.appendChild(agentCard);
  stream.scrollTop = stream.scrollHeight;

  try {
    const res = await call("vibe_chat", {
      prompt: promptText,
      mode: currentVibeMode,
      model: currentVibeModel,
      auto_enhanced: isAutoEnhance
    });

    if (!res || res.status !== "ok" || !res.turn) {
      throw new Error(res?.error || "Agent execution failed");
    }

    const turn = res.turn;

    let toolsHtml = "";
    if (turn.tool_calls && turn.tool_calls.length) {
      toolsHtml = `
        <div class="gen-tools-flow">
          ${turn.tool_calls.map(tc => `
            <div class="gen-tool-chip ${tc.status === 'success' ? 'success' : ''}">
              <span>${tc.type === 'read_file' ? '📄' : (tc.type === 'edit_file' ? '✏️' : '⚡')}</span>
              <span>${escapeHtml(tc.target || tc.type)}</span>
              <span style="color:#64748b;">(${escapeHtml(tc.detail)})</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    let diffsHtml = "";
    if (turn.diffs && turn.diffs.length) {
      diffsHtml = turn.diffs.map(d => `
        <div class="cursor-diff-box" id="diff-box-${escapeHtml(d.path)}">
          <div class="cursor-diff-header">
            <span class="cursor-diff-path">📄 ${escapeHtml(d.path)}</span>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="cursor-diff-stats">
                <span class="diff-stat-add">+${d.additions}</span>
                <span class="diff-stat-del">-${d.deletions}</span>
              </span>
              <div class="cursor-diff-actions">
                <button type="button" class="btn-diff-action accept" data-file="${escapeHtml(d.path)}">Accept Diff ✨</button>
                <button type="button" class="btn-diff-action reject" data-file="${escapeHtml(d.path)}">Reject</button>
              </div>
            </div>
          </div>
          <div class="cursor-diff-content">
            ${(d.diff_lines || []).map(l => `
              <div class="diff-line ${l.type}">${escapeHtml(l.text)}</div>
            `).join("")}
          </div>
        </div>
      `).join("");
    }

    agentCard.innerHTML = `
      <div class="gen-card-header">
        <span class="gen-model-badge">⚡ ${turn.model.toUpperCase()} · ${turn.mode.toUpperCase()}</span>
        <span style="font-size:11px; color:#94a3b8;">${new Date().toLocaleTimeString()}</span>
      </div>
      
      <details class="cursor-thinking-accordion" open>
        <summary>🧠 Chain of Thought (Thinking Process) · Anti-AI-UI Guard Active</summary>
        <div class="cursor-thinking-body">${escapeHtml(turn.thought)}</div>
      </details>

      ${toolsHtml}

      <div style="font-size:13px; color:#f1f5f9; line-height:1.6; margin:10px 0;">
        Готово, Катенька! Код спроектирован по строгим стандартам <b>Anti-AI-UI</b> (без фиолетовых градиентов, с высокой контрастностью и чистой архитектурой) и уже загружен в <b>Intelligent Canvas</b> справа 🐱🐾
      </div>

      ${diffsHtml}
    `;

    agentCard.querySelectorAll(".btn-diff-action.accept").forEach(btn => {
      btn.onclick = async () => {
        const file = btn.dataset.file;
        try {
          const accRes = await call("vibe_accept_diff", {file_path: file});
          if (accRes.status === "ok") {
            btn.textContent = "Applied ✨";
            btn.disabled = true;
            message("notice", `Changes applied to ${file}! ✨`);
          }
        } catch (err) {
          message("error", `Apply error: ${err.message || err}`);
        }
      };
    });

    agentCard.querySelectorAll(".btn-diff-action.reject").forEach(btn => {
      btn.onclick = async () => {
        const file = btn.dataset.file;
        await call("vibe_reject_diff", {file_path: file});
        const box = document.getElementById(`diff-box-${file}`);
        if (box) box.style.opacity = "0.5";
        btn.textContent = "Rejected";
        btn.disabled = true;
      };
    });

    if (turn.diffs && turn.diffs.length) {
      const htmlDiff = turn.diffs.find(d => d.path.endsWith(".html"));
      if (htmlDiff && htmlDiff.new_code) {
        const iframe = $("vibe-canvas-iframe");
        if (iframe) {
          iframe.srcdoc = htmlDiff.new_code;
        }
        currentInlineHtmlContent = htmlDiff.new_code;
        currentInlineHtmlPath = htmlDiff.full_path;
      }

      const diffContainer = $("canvas-diff-container");
      if (diffContainer) {
        diffContainer.innerHTML = turn.diffs.map(d => `
          <div style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <strong style="color:#38bdf8; font-size:12px;">${d.path}</strong>
              <span style="font-size:11px; color:#4ade80;">+${d.additions} / -${d.deletions}</span>
            </div>
            <pre class="dsh-prompt-diff" style="max-height:260px; overflow-y:auto;">${(d.diff_lines || []).map(l => escapeHtml(l.text)).join("\n")}</pre>
          </div>
        `).join("");
      }
      if ($("canvas-diff-count")) $("canvas-diff-count").textContent = turn.diffs.length;
    }

    if (turn.terminal) {
      const term = $("vibe-terminal-output");
      if (term) term.textContent = turn.terminal;
    }

  } catch (err) {
    agentCard.innerHTML = `<p class="notice bad">Vibe coding turn error: ${err.message || err}</p>`;
  }

  stream.scrollTop = stream.scrollHeight;
}

render();
scheduleUpdate(true);
updateMcpBadge();
loadDshOverview();
initVibeCoding();
switchDshView("vibe-coding");
setActiveNav("nav-vibe-coding");

