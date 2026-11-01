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
  $("detail-empty").hidden = !!task;
  $("task-now").hidden = !task;
  $("task-info").hidden = !task;
  $("status").hidden = !task;
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
  if (artifactsEl && artifactsList) {
    const arts = task.artifacts || [];
    artifactsEl.hidden = arts.length === 0;
    artifactsList.replaceChildren();
    for (const art of arts) {
      const icon = art.type === "pptx" ? "📽️ " : art.type === "xlsx" ? "📊 " : art.type === "docx" ? "📑 " : art.type === "folder" ? "📁 " : "📄 ";
      const artBtn = element("button", icon + art.name, "artifact-btn");
      artBtn.type = "button";
      artBtn.title = (art.title || "Open deliverable") + " • " + art.path;
      artBtn.addEventListener("click", () => {
        work(async () => {
          await call("open_file", {path: art.path});
          message("notice", "Opened " + art.name + " on macOS!");
        });
      });
      artifactsList.append(artBtn);
    }
  }

  if (actionsEl) {
    actionsEl.hidden = false;
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
        
        const arts = res?.result?.artifacts || [];
        if (arts.length && $("task-artifacts") && $("artifacts-list")) {
          $("task-artifacts").hidden = false;
          $("artifacts-list").replaceChildren();
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
      fetch("http://127.0.0.1:8765/api/v1/tasks/" + task.task_id + "/horizon", {
        method: "POST",
        headers: {"Content-Type": "application/json"}
      }).catch(() => {});
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

$("tab-mcp-market")?.addEventListener("click", () => showMcpTab("market"));
$("tab-mcp-installed")?.addEventListener("click", () => showMcpTab("installed"));
$("tab-mcp-manual")?.addEventListener("click", () => showMcpTab("manual"));

function showMcpTab(tab) {
  $("tab-mcp-market")?.classList.toggle("active", tab === "market");
  $("tab-mcp-installed")?.classList.toggle("active", tab === "installed");
  $("tab-mcp-manual")?.classList.toggle("active", tab === "manual");
  if ($("mcp-view-market")) $("mcp-view-market").hidden = tab !== "market";
  if ($("mcp-view-installed")) $("mcp-view-installed").hidden = tab !== "installed";
  if ($("mcp-view-manual")) $("mcp-view-manual").hidden = tab !== "manual";
  if (tab === "market") loadMcpMarket();
  if (tab === "installed") loadMcpInstalled();
}

function renderMcpCards(list) {
  const grid = $("mcp-market-grid");
  if (!grid) return;
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = '<p class="hint">Серверы не найдены. Попробуйте другой запрос или ручную установку.</p>';
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
      } catch (_) {
        await fetch(`http://127.0.0.1:8765/api/v1/mcp/${srv.installed ? 'uninstall' : 'install'}`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({id: srv.id})
        });
      }
      loadMcpMarket();
      updateMcpBadge();
    };
    grid.appendChild(card);
  });
}

async function loadMcpMarket() {
  const grid = $("mcp-market-grid");
  if (!grid) return;
  try {
    let res;
    try {
      res = await call("mcp_market");
    } catch (_) {
      res = await fetch("http://127.0.0.1:8765/api/v1/mcp/market").then(r => r.json());
    }
    renderMcpCards(res.marketplace || []);
  } catch (e) {
    grid.innerHTML = `<p class="hint">Cannot reach MCP service: ${e.message}</p>`;
  }
}

async function searchMcpMarket(query) {
  const grid = $("mcp-market-grid");
  if (!grid) return;
  grid.innerHTML = '<p class="hint">🔍 Поиск по GitHub & Smithery MCP источникам...</p>';
  try {
    const res = await call("mcp_search", {query});
    renderMcpCards(res.results || []);
  } catch (e) {
    grid.innerHTML = `<p class="hint">Ошибка поиска: ${e.message}</p>`;
  }
}

async function loadMcpInstalled() {
  const grid = $("mcp-installed-grid");
  if (!grid) return;
  try {
    let res;
    try {
      res = await call("mcp_servers");
    } catch (_) {
      res = await fetch("http://127.0.0.1:8765/api/v1/mcp/servers").then(r => r.json());
    }
    grid.innerHTML = "";
    const list = res.servers || [];
    if (!list.length) {
      grid.innerHTML = '<p class="hint">No installed MCP servers.</p>';
      return;
    }
    list.forEach(srv => {
      const card = document.createElement("div");
      card.className = "mcp-card";
      card.innerHTML = `
        <div class="mcp-card-top">
          <span class="mcp-icon">⚙️</span>
          <div>
            <div class="mcp-card-title">${srv.name || srv.id}</div>
            <div class="mcp-card-desc">Command: ${srv.command} ${(srv.args || []).join(' ')}</div>
          </div>
        </div>
        <div class="mcp-card-actions">
          <span class="mcp-badge ${srv.enabled ? 'active' : ''}">${srv.enabled ? 'Enabled' : 'Disabled'}</span>
          <button type="button" class="mcp-action-btn uninstall" data-id="${srv.id}">Remove</button>
        </div>
      `;
      card.querySelector("button").onclick = async () => {
        try {
          await call("mcp_uninstall", {id: srv.id});
        } catch (_) {
          await fetch("http://127.0.0.1:8765/api/v1/mcp/uninstall", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: srv.id})
          });
        }
        loadMcpInstalled();
        updateMcpBadge();
      };
      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = `<p class="hint">Error: ${e.message}</p>`;
  }
}

async function updateMcpBadge() {
  try {
    let res;
    try {
      res = await call("mcp_servers");
    } catch (_) {
      res = await fetch("http://127.0.0.1:8765/api/v1/mcp/servers").then(r => r.json());
    }
    const count = (res.servers || []).filter(s => s.enabled).length;
    if ($("mcp-active-count")) $("mcp-active-count").textContent = `${count} active`;
  } catch (_) {}
}

$("mcp-manual-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("mcp-server-id").value.trim();
  const url = $("mcp-server-url").value.trim();
  const cmd = $("mcp-server-cmd").value.trim();
  let env = {};
  try {
    const envStr = $("mcp-server-env").value.trim();
    if (envStr) env = JSON.parse(envStr);
  } catch (_) {}

  try {
    await call("mcp_install", {id, config: {name: id, url, command: cmd, env}});
  } catch (_) {
    await fetch("http://127.0.0.1:8765/api/v1/mcp/install", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({id, config: {name: id, url, command: cmd, env}})
    });
  }
  message("notice", `MCP server '${id}' installed successfully!`);
  showMcpTab("installed");
  updateMcpBadge();
});

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

render();
scheduleUpdate(true);
updateMcpBadge();

