/* ============================================================
   Chrono — Calendar OS
   A local-first, keyboard-first calendar workspace.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Constants ---------- */

  const HOUR_H = 56;
  const MIN = 60000;
  const DAY = 86400000;
  const STORAGE_KEY = 'chrono.workspace.v1';

  const TYPES = {
    meeting: { label: 'Meeting', rgb: '139 156 255' },
    focus: { label: 'Focus', rgb: '201 245 109' },
    personal: { label: 'Personal', rgb: '255 183 107' },
    break: { label: 'Break', rgb: '111 227 211' }
  };

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const WD_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const ICONS = {
    day: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/><circle cx="12" cy="15" r="1.7" fill="currentColor" stroke="none"/>',
    week: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M9 14h1M14 14h1M9 17.5h1M14 17.5h1"/>',
    month: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01"/>',
    insights: '<path d="M4 19V10M10 19V5M16 19v-6M22 19H2"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3"/>',
    command: '<path d="M9 6a2 2 0 1 0-2 2h2V6Zm0 0v12m0 0a2 2 0 1 1-2-2h2Zm6-12a2 2 0 1 1 2 2h-2V6Zm0 0v12m0 0a2 2 0 1 0 2-2h-2Z"/>',
    chevronLeft: '<path d="m14.5 6-6 6 6 6"/>',
    chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M15 4v16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    check: '<path d="m5 12 4.4 4.4L19 6.8"/>',
    play: '<path d="M8 5.3v13.4L18.5 12 8 5.3Z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
    pin: '<path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    users: '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M15.8 4.8a3.4 3.4 0 0 1 0 6.4M18.2 20a6.2 6.2 0 0 0-2-4.6"/>',
    coffee: '<path d="M5 8h11v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z"/><path d="M16 9h1.4a2.4 2.4 0 0 1 0 4.8H16M4 22h14"/>',
    sparkles: '<path d="m12 3 1.7 4.7L18.5 9.5l-4.8 1.8L12 16l-1.7-4.7L5.5 9.5l4.8-1.8L12 3Z"/><path d="M19 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/>',
    schedule: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M12 13v6M9 16h6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    rotate: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    bolt: '<path d="M13 2 4.5 13.5H11l-1 8.5 8.5-12H12l1-8Z"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>'
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function icon(name, size = 18) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'e' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Date helpers ---------- */

  function pad(n) { return String(n).padStart(2, '0'); }

  function startOfDay(value) {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function addDays(value, n) {
    const d = new Date(value);
    d.setDate(d.getDate() + n);
    return d.getTime();
  }

  function addMonths(value, n) {
    const d = new Date(value);
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    return d.getTime();
  }

  function startOfWeek(value) {
    const d = new Date(startOfDay(value));
    const offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset);
    return d.getTime();
  }

  function startOfMonth(value) {
    const d = new Date(value);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function dayKey(value) {
    const d = new Date(value);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function atTime(key, hours, minutes = 0) {
    const parts = key.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], hours, minutes, 0, 0).getTime();
  }

  function isSameDay(a, b) { return dayKey(a) === dayKey(b); }
  function weekdayIndex(value) { return (new Date(value).getDay() + 6) % 7; }
  function minutesOfDay(value) { const d = new Date(value); return d.getHours() * 60 + d.getMinutes(); }

  function isoWeek(value) {
    const d = new Date(Date.UTC(new Date(value).getFullYear(), new Date(value).getMonth(), new Date(value).getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function toDateInput(ts) { return dayKey(ts); }
  function toTimeInput(ts) { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }

  function monthName(ts) { return MONTHS[new Date(ts).getMonth()]; }
  function monthShort(ts) { return MONTHS_SHORT[new Date(ts).getMonth()]; }

  function shortTime(ts) {
    const d = new Date(ts);
    return `${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`;
  }
  function meridiem(ts) { return new Date(ts).getHours() < 12 ? 'AM' : 'PM'; }
  function time12(ts) { return `${shortTime(ts)} ${meridiem(ts)}`; }
  function timeRange(a, b) { return `${shortTime(a)} – ${shortTime(b)}`; }

  function formatDuration(mins) {
    mins = Math.max(0, Math.round(mins));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }

  function shortDuration(mins) {
    mins = Math.max(0, Math.round(mins));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h${m}`;
    if (h) return `${h}h`;
    return `${m}m`;
  }

  function dateLabel(ts) {
    return `${MONTHS_SHORT[new Date(ts).getMonth()]} ${new Date(ts).getDate()}`;
  }

  /* ---------- State ---------- */

  const state = {
    events: [],
    tasks: [],
    focusSessions: [],
    settings: { workStart: 7, workEnd: 21, focusGoal: 480 },
    ui: { view: 'week', cursor: startOfDay(Date.now()), panelHidden: false, panelOpen: false }
  };

  /* ---------- Persistence ---------- */

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        events: state.events,
        tasks: state.tasks,
        focusSessions: state.focusSessions,
        settings: state.settings,
        ui: state.ui
      }));
    } catch (err) { /* storage may be unavailable */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.events) && data.ui) {
          state.events = data.events;
          state.tasks = Array.isArray(data.tasks) ? data.tasks : [];
          state.focusSessions = Array.isArray(data.focusSessions) ? data.focusSessions : [];
          state.settings = Object.assign({}, state.settings, data.settings);
          state.ui = Object.assign({}, state.ui, data.ui);
          state.ui.cursor = Number(state.ui.cursor) || startOfDay(Date.now());
          state.ui.panelOpen = Boolean(state.ui.panelOpen);
          return;
        }
      }
    } catch (err) { /* corrupt state falls through to seed */ }
    seedDemo();
    save();
  }

  function seedDemo() {
    const monday = startOfWeek(Date.now());
    let seq = 0;

    const makeEvent = (offset, time, duration, title, type, location, notes) => {
      const parts = time.split(':').map(Number);
      const date = addDays(monday, offset);
      const start = atTime(dayKey(date), parts[0], parts[1]);
      return {
        id: 'seed-' + (++seq),
        title,
        start,
        end: start + duration * MIN,
        type,
        location: location || '',
        notes: notes || ''
      };
    };

    state.events = [
      makeEvent(0, '09:00', 15, 'Daily standup', 'meeting', 'Studio 2', 'Quick round of updates. Keep it to fifteen.'),
      makeEvent(0, '09:30', 90, 'Q4 roadmap — deep work', 'focus', '', 'Draft the narrative before touching the deck.'),
      makeEvent(0, '11:30', 30, '1:1 with Priya', 'meeting', 'Room 4B', 'Career path, roadmap handoff, feedback.'),
      makeEvent(0, '12:30', 45, 'Lunch away from desk', 'break', 'Rooftop'),
      makeEvent(0, '14:00', 60, 'Design review — Chrono', 'meeting', 'Figma room', 'Bring the empty-state explorations.'),
      makeEvent(0, '15:30', 60, 'Focus: pricing model', 'focus', '', 'Model the three tiers and sanity-check margins.'),

      makeEvent(1, '09:00', 15, 'Daily standup', 'meeting', 'Studio 2'),
      makeEvent(1, '10:00', 90, 'Sprint 24 planning', 'meeting', 'Big table', 'Capacity, cut line, and the one risky bet.'),
      makeEvent(1, '13:00', 60, 'Northwind customer call', 'meeting', 'Zoom', 'Listen more than you talk.'),
      makeEvent(1, '15:00', 90, 'Deep work — narrative', 'focus', '', 'Turn the outline into three sharp paragraphs.'),
      makeEvent(1, '17:00', 60, 'Climbing session', 'personal', 'East gym'),

      makeEvent(2, '09:00', 15, 'Daily standup', 'meeting', 'Studio 2'),
      makeEvent(2, '09:30', 150, 'Maker morning', 'focus', '', 'No meetings. No slack. One hard problem.'),
      makeEvent(2, '13:00', 30, 'Lunch & learn', 'meeting', 'Kitchen', 'Sam on local-first sync.'),
      makeEvent(2, '15:00', 60, '1:1 with Sam', 'meeting', 'Room 4B'),
      makeEvent(2, '16:30', 30, 'Inbox zero', 'personal', 'Desk'),

      makeEvent(3, '09:00', 15, 'Daily standup', 'meeting', 'Studio 2'),
      makeEvent(3, '10:00', 60, 'Metrics review', 'meeting', 'Big table'),
      makeEvent(3, '11:30', 60, 'Focus: review PR #482', 'focus', '', 'The sync engine refactor. Leave it better.'),
      makeEvent(3, '14:00', 90, 'Roadmap workshop', 'meeting', 'Studio 2', 'Cut scope until it hurts, then cut once more.'),
      makeEvent(3, '16:00', 60, 'Interview — product engineer', 'meeting', 'Room 2A'),

      makeEvent(4, '09:00', 15, 'Daily standup', 'meeting', 'Studio 2'),
      makeEvent(4, '09:30', 90, 'Deep work — board narrative', 'focus', '', 'The story only you can tell.'),
      makeEvent(4, '12:00', 60, 'Team lunch', 'break', 'Tamale spot'),
      makeEvent(4, '14:00', 30, 'Weekly review', 'personal', 'Desk', 'Wins, open loops, next week’s one thing.'),
      makeEvent(4, '15:00', 60, 'Demo Friday', 'meeting', 'Big table', 'Show the satisfying bits.'),

      makeEvent(7, '09:00', 30, 'Sprint kickoff', 'meeting', 'Studio 2'),
      makeEvent(7, '10:00', 120, 'Quarterly planning — part one', 'focus', '', 'Start with the customer, not the deck.')
    ];

    state.tasks = [
      { id: 'task-1', title: 'Draft Q4 roadmap narrative', est: 90, done: false, priority: 'high', createdAt: Date.now() - 9000 },
      { id: 'task-2', title: 'Reply to Anna about pricing', est: 15, done: false, priority: 'high', createdAt: Date.now() - 8000 },
      { id: 'task-3', title: 'Review PR #482', est: 30, done: false, priority: 'normal', createdAt: Date.now() - 7000 },
      { id: 'task-4', title: 'Prep board deck outline', est: 60, done: false, priority: 'normal', createdAt: Date.now() - 6000 },
      { id: 'task-5', title: 'Book flights for the offsite', est: 15, done: false, priority: 'normal', createdAt: Date.now() - 5000 },
      { id: 'task-6', title: 'Send design critique notes', est: 20, done: true, priority: 'normal', createdAt: Date.now() - 4000 }
    ];

    state.focusSessions = [];
  }

  /* ---------- Queries ---------- */

  function findEvent(id) { return state.events.find((e) => e.id === id); }

  function eventsInRange(start, end) {
    return state.events
      .filter((e) => e.start < end && e.end > start)
      .sort((a, b) => a.start - b.start || b.end - a.end);
  }

  function eventsOn(ts) {
    return eventsInRange(startOfDay(ts), addDays(startOfDay(ts), 1));
  }

  function openTasks() {
    return state.tasks.filter((t) => !t.done);
  }

  function clippedMinutes(ev, dayTs) {
    const s = state.settings;
    const day = startOfDay(dayTs);
    const a = Math.max(ev.start, atTime(dayKey(day), s.workStart, 0));
    const b = Math.min(ev.end, atTime(dayKey(day), s.workEnd, 0));
    return Math.max(0, (b - a) / MIN);
  }

  function dayTypeMinutes(dayTs) {
    const out = { focus: 0, meeting: 0, personal: 0, break: 0 };
    eventsOn(dayTs).forEach((ev) => {
      if (out[ev.type] != null) out[ev.type] += clippedMinutes(ev, dayTs);
    });
    state.focusSessions.forEach((session) => {
      if (isSameDay(session.at, dayTs)) out.focus += session.minutes || 0;
    });
    return out;
  }

  function weekFocusMinutes(anchor) {
    const start = startOfWeek(anchor || Date.now());
    const end = addDays(start, 7);
    let mins = 0;
    eventsInRange(start, end).forEach((ev) => {
      if (ev.type === 'focus') {
        const a = Math.max(ev.start, start);
        const b = Math.min(ev.end, end);
        mins += Math.max(0, (b - a) / MIN);
      }
    });
    state.focusSessions.forEach((session) => {
      if (session.at >= start && session.at < end) mins += session.minutes || 0;
    });
    return mins;
  }

  function eventsForView() {
    const view = state.ui.view;
    if (view === 'day') return eventsOn(state.ui.cursor);
    if (view === 'week') {
      const start = startOfWeek(state.ui.cursor);
      return eventsInRange(start, addDays(start, 7));
    }
    if (view === 'month') {
      const start = startOfMonth(state.ui.cursor);
      const end = addMonths(start, 1);
      return eventsInRange(start, end);
    }
    const start = startOfWeek(state.ui.cursor);
    return eventsInRange(start, addDays(start, 7));
  }

  function isTodayView() {
    const view = state.ui.view;
    const now = Date.now();
    if (view === 'day') return isSameDay(state.ui.cursor, now);
    if (view === 'week') return startOfWeek(state.ui.cursor) === startOfWeek(now);
    if (view === 'month') return startOfMonth(state.ui.cursor) === startOfMonth(now);
    return true;
  }

  /* ---------- Topbar / rail ---------- */

  function viewTitle() {
    const view = state.ui.view;
    const cursor = state.ui.cursor;

    if (view === 'week') {
      const start = startOfWeek(cursor);
      const end = addDays(start, 4);
      const a = new Date(start);
      const b = new Date(end);
      if (a.getFullYear() !== b.getFullYear()) {
        return `${MONTHS_SHORT[a.getMonth()]} ${a.getFullYear()} – ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`;
      }
      if (a.getMonth() !== b.getMonth()) {
        return `${MONTHS_SHORT[a.getMonth()]} – ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`;
      }
      return `${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
    }

    if (view === 'day') {
      const d = new Date(cursor);
      return `${WEEKDAYS[weekdayIndex(cursor)]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
    }

    if (view === 'month') {
      const d = new Date(cursor);
      return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }

    return 'Weekly insights';
  }

  function eyebrowText() {
    const view = state.ui.view;
    const cursor = state.ui.cursor;

    if (view === 'week') {
      const start = startOfWeek(cursor);
      const end = addDays(start, 4);
      const d1 = new Date(start);
      const d2 = new Date(end);
      const range = d1.getMonth() === d2.getMonth()
        ? `${MONTHS_SHORT[d1.getMonth()]} ${d1.getDate()} – ${d2.getDate()}`
        : `${MONTHS_SHORT[d1.getMonth()]} ${d1.getDate()} – ${MONTHS_SHORT[d2.getMonth()]} ${d2.getDate()}`;
      return `Week ${isoWeek(start)} · ${range}`;
    }

    if (view === 'day') {
      return `Day plan · ${WEEKDAYS[weekdayIndex(cursor)]} · ${MONTHS_SHORT[new Date(cursor).getMonth()]} ${new Date(cursor).getDate()}`;
    }

    if (view === 'month') return 'Month at a glance · protect your time';

    const start = startOfWeek(cursor);
    return `Week ${isoWeek(start)} · in review`;
  }

  function metaText() {
    const view = state.ui.view;
    const evs = eventsForView();
    const total = evs.reduce((sum, ev) => {
      const a = ev.start;
      const b = ev.end;
      return sum + Math.max(0, (b - a) / MIN);
    }, 0);

    if (view === 'week') {
      const meetings = evs.filter((e) => e.type === 'meeting').length;
      const focus = evs.filter((e) => e.type === 'focus')
        .reduce((sum, e) => sum + Math.max(0, (e.end - e.start) / MIN), 0);
      return `${evs.length} events · ${formatDuration(total)} booked · ${formatDuration(focus)} deep work${meetings ? ` · ${meetings} meetings` : ''}`;
    }

    if (view === 'day') {
      const booked = evs.reduce((sum, ev) => sum + clippedMinutes(ev, state.ui.cursor), 0);
      const span = (state.settings.workEnd - state.settings.workStart) * 60;
      return `${evs.length} events · ${formatDuration(booked)} booked · ${formatDuration(Math.max(0, span - booked))} free`;
    }

    if (view === 'month') {
      return `${evs.length} events · ${formatDuration(total)} booked · click any day to zoom in`;
    }

    const start = startOfWeek(state.ui.cursor);
    const end = addDays(start, 6);
    return `${monthShort(start)} ${new Date(start).getDate()} – ${monthShort(end)} ${new Date(end).getDate()} · a calmer way to see the week`;
  }

  function renderTopbar() {
    $('#viewTitle').textContent = viewTitle();
    $('#eyebrow').textContent = eyebrowText();
    $('#viewMeta').textContent = metaText();
    $('#todayBadge').hidden = !isTodayView() || state.ui.view === 'insights';
    $('#panelClock').textContent = time12(Date.now());
  }

  function renderRail() {
    $$('.rail-btn[data-view]').forEach((btn) => {
      const active = btn.dataset.view === state.ui.view;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  /* ---------- Shared calendar rendering ---------- */

  function layoutEvents(evs) {
    const result = new Map();
    const sorted = evs.slice().sort((a, b) => a.start - b.start || b.end - a.end);
    let group = [];
    let groupEnd = 0;

    const flush = () => {
      if (!group.length) return;
      const columns = [];
      group.forEach((ev) => {
        let idx = columns.findIndex((end) => ev.start >= end);
        if (idx < 0) {
          idx = columns.length;
          columns.push(ev.end);
        } else {
          columns[idx] = ev.end;
        }
        result.set(ev.id, { col: idx, cols: columns.length });
      });
      const total = columns.length;
      group.forEach((ev) => { result.get(ev.id).cols = total; });
      group = [];
      groupEnd = 0;
    };

    sorted.forEach((ev) => {
      if (group.length && ev.start >= groupEnd) flush();
      group.push(ev);
      groupEnd = Math.max(groupEnd, ev.end);
    });
    flush();
    return result;
  }

  function eventHTML(ev, layout) {
    const s = state.settings;
    const day = startOfDay(ev.start);
    const dayStart = atTime(dayKey(day), s.workStart, 0);
    const dayEnd = atTime(dayKey(day), s.workEnd, 0);
    const a = Math.max(ev.start, dayStart);
    const b = Math.min(ev.end, dayEnd);
    if (b <= a) return '';

    const offsetMin = (a - dayStart) / MIN;
    const durationMin = Math.max(5, (b - a) / MIN);
    const height = Math.max(20, (durationMin / 60) * HOUR_H);
    const compact = height < 47;
    const tiny = height < 28;
    const col = layout ? layout.col : 0;
    const cols = layout ? layout.cols : 1;
    const left = `calc(${(col / cols) * 100}% + 5px)`;
    const width = `calc(${100 / cols}% - 9px)`;

    return `<div class="event type-${ev.type}${compact ? ' compact' : ''}${tiny ? ' tiny' : ''}"
      data-event="${ev.id}" style="top:${(offsetMin / 60) * HOUR_H}px;height:${height}px;left:${left};width:${width}"
      tabindex="0" role="button" aria-label="${esc(ev.title)}, ${timeRange(ev.start, ev.end)}">
      <div class="event-time">${timeRange(ev.start, ev.end)}</div>
      <div class="event-title">${esc(ev.title)}</div>
      ${tiny || !ev.location ? '' : `<div class="event-loc">${esc(ev.location)}</div>`}
      <div class="event-resize" data-resize="1"></div>
    </div>`;
  }

  function dayHeadHTML(ts) {
    const isToday = isSameDay(ts, Date.now());
    return `<button class="day-head${isToday ? ' today' : ''}" data-day="${ts}" aria-label="${WEEKDAYS[weekdayIndex(ts)]} ${new Date(ts).getDate()}">
      <span class="dw">${WD_SHORT[weekdayIndex(ts)]}</span>
      <span class="dn">${new Date(ts).getDate()}</span>
    </button>`;
  }

  function weekHTML() {
    const days = Array.from({ length: 5 }, (_, i) => addDays(startOfWeek(state.ui.cursor), i));
    const s = state.settings;
    const totalH = (s.workEnd - s.workStart) * HOUR_H;
    const today = days.some((d) => isSameDay(d, Date.now()));
    const nowPx = ((minutesOfDay(Date.now()) - s.workStart * 60) / 60) * HOUR_H;
    const showNow = today && nowPx >= 0 && nowPx <= totalH;

    const labels = Array.from({ length: s.workEnd - s.workStart + 1 }, (_, i) => {
      const hour = s.workStart + i;
      const label = `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;
      return `<span class="hour-label" style="top:${i * HOUR_H + 2}px">${label}</span>`;
    }).join('');

    const columns = days.map((day) => {
      const evs = eventsOn(day);
      const layouts = layoutEvents(evs);
      return `<div class="cal-col" data-date="${dayKey(day)}">
        ${evs.map((ev) => eventHTML(ev, layouts.get(ev.id))).join('')}
      </div>`;
    }).join('');

    return `<div class="cal" style="--days:5">
      <div class="cal-head">
        <div class="cal-corner"></div>
        <div class="cal-days">${days.map(dayHeadHTML).join('')}</div>
      </div>
      <div class="cal-body" id="calBody">
        <div class="cal-gutter" style="height:${totalH}px">${labels}</div>
        <div class="cal-cols" id="calCols" style="height:${totalH}px">
          ${columns}
          ${showNow ? `<div class="now-line" id="nowLine" style="top:${nowPx}px"></div>` : ''}
        </div>
      </div>
    </div>`;
  }

  /* ---------- Day plan ---------- */

  function gapHTML(start, end) {
    const mins = Math.round((end - start) / MIN);
    return `<div class="tl-row">
      <div class="tl-time"><strong>${shortTime(start)}</strong><span class="dur">${meridiem(start)}</span></div>
      <button class="tl-gap" data-gap="${start}" data-gap-end="${end}">
        <span class="gap-label">${icon('clock', 13)} ${formatDuration(mins)} of space</span>
        <span class="gap-add">${icon('plus', 12)} Add block</span>
      </button>
    </div>`;
  }

  function dayRowHTML(ev, start, end) {
    const live = Date.now() >= ev.start && Date.now() < ev.end;
    const dur = Math.round((end - start) / MIN);
    return `<div class="tl-row">
      <div class="tl-time"><strong>${shortTime(start)}</strong><span class="dur">${meridiem(start)}</span><span class="dur">${formatDuration(dur)}</span></div>
      <div class="tl-card type-${ev.type}${live ? ' live' : ''}" data-event="${ev.id}" tabindex="0" role="button">
        <div class="tl-head">
          <div class="tl-title">${esc(ev.title)}</div>
          ${live ? `<span class="live-tag"><i></i>Now</span>` : `<span class="tl-kind">${TYPES[ev.type].label}</span>`}
        </div>
        <div class="tl-meta">
          <span>${icon('clock', 12)} ${time12(ev.start)} – ${time12(ev.end)}</span>
          ${ev.location ? `<span>${icon('pin', 12)} ${esc(ev.location)}</span>` : ''}
        </div>
        ${ev.notes ? `<div class="tl-notes">${esc(ev.notes)}</div>` : ''}
      </div>
    </div>`;
  }

  function dayHTML() {
    const day = state.ui.cursor;
    const s = state.settings;
    const evs = eventsOn(day);
    const dk = dayKey(day);
    const workStart = atTime(dk, s.workStart, 0);
    const workEnd = atTime(dk, s.workEnd, 0);
    const booked = evs.reduce((sum, ev) => sum + clippedMinutes(ev, day), 0);
    const span = Math.max(0, (workEnd - workStart) / MIN);
    const free = Math.max(0, span - booked);
    const meeting = evs.filter((e) => e.type === 'meeting').reduce((sum, e) => sum + clippedMinutes(e, day), 0);
    const focus = evs.filter((e) => e.type === 'focus').reduce((sum, e) => sum + clippedMinutes(e, day), 0);

    let rows = '';
    let cursorTs = workStart;

    evs.forEach((ev) => {
      const start = Math.max(ev.start, workStart);
      const end = Math.min(ev.end, workEnd);
      if (end <= start) return;
      if (start - cursorTs >= 40 * MIN) rows += gapHTML(cursorTs, start);
      rows += dayRowHTML(ev, start, end);
      cursorTs = Math.max(cursorTs, end);
    });

    if (evs.length && workEnd - cursorTs >= 40 * MIN) rows += gapHTML(cursorTs, workEnd);

    const summary = `<div class="day-summary">
      <span class="chip-stat">${icon('calendar', 13)} <strong>${evs.length}</strong> events</span>
      <span class="chip-stat">${icon('users', 13)} <strong>${formatDuration(meeting)}</strong> meetings</span>
      <span class="chip-stat accent">${icon('target', 13)} <strong>${formatDuration(focus)}</strong> focus</span>
      <span class="chip-stat">${icon('clock', 13)} <strong>${formatDuration(free)}</strong> free</span>
    </div>`;

    const empty = `<div class="day-empty">
      <strong>A clean slate.</strong>
      Nothing is booked between ${time12(workStart)} and ${time12(workEnd)}. That’s ${formatDuration(span)} you get to shape.
    </div>`;

    return `<div class="day-view">
      ${summary}
      <div class="day-timeline">
        ${evs.length ? rows : empty}
        <button class="day-add" id="dayAddBtn">${icon('plus', 13)} Add a block on this day</button>
      </div>
    </div>`;
  }

  /* ---------- Month ---------- */

  function monthHTML() {
    const first = startOfMonth(state.ui.cursor);
    const gridStart = startOfWeek(first);
    const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
    const month = new Date(first).getMonth();
    const today = Date.now();

    const weekdays = WD_SHORT.map((d, i) => `<span>${i === 5 || i === 6 ? d : d}</span>`).join('');

    const cellHTML = cells.map((ts) => {
      const evs = eventsOn(ts);
      const out = new Date(ts).getMonth() !== month;
      const isToday = isSameDay(ts, today);
      const shown = evs.slice(0, 3);
      const more = evs.length - shown.length;

      const pills = shown.map((ev) => `<button class="month-pill type-${ev.type}" data-event="${ev.id}" title="${esc(ev.title)} · ${timeRange(ev.start, ev.end)}">
        <span class="m-time">${shortTime(ev.start)}</span>
        <span class="m-title">${esc(ev.title)}</span>
      </button>`).join('');

      return `<div class="month-cell${out ? ' out' : ''}${isToday ? ' today' : ''}" data-day="${ts}">
        <span class="month-date">${new Date(ts).getDate()}</span>
        <div class="month-events">
          ${pills}
          ${more > 0 ? `<button class="month-more" data-day="${ts}">+${more} more</button>` : ''}
        </div>
      </div>`;
    }).join('');

    return `<div class="month-view">
      <div class="month-weekdays">${weekdays}</div>
      <div class="month-grid">${cellHTML}</div>
    </div>`;
  }

  /* ---------- Insights ---------- */

  function insightsHTML() {
    const weekStart = startOfWeek(state.ui.cursor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const dayStats = days.map((d) => dayTypeMinutes(d));
    const sums = { focus: 0, meeting: 0, personal: 0, break: 0 };
    dayStats.forEach((s) => Object.keys(sums).forEach((k) => { sums[k] += s[k]; }));

    const prevStart = addDays(weekStart, -7);
    let prevFocus = 0;
    for (let i = 0; i < 7; i++) prevFocus += dayTypeMinutes(addDays(prevStart, i)).focus;

    const goal = state.settings.focusGoal;
    const score = clamp(Math.round((sums.focus / goal) * 100), 0, 100);
    const booked = sums.focus + sums.meeting + sums.personal + sums.break;
    const meetingLoad = Math.round((sums.meeting / (5 * 8 * 60)) * 100);
    const sessions = state.focusSessions.filter((s) => s.at >= weekStart && s.at < addDays(weekStart, 7)).length;
    const focusDelta = Math.round(sums.focus - prevFocus);

    const maxTotal = Math.max(60, ...dayStats.map((s) => s.focus + s.meeting + s.personal + s.break));
    const order = ['focus', 'meeting', 'personal', 'break'];
    const maxBarPx = 142;

    const bars = days.map((d, i) => {
      const s = dayStats[i];
      const total = s.focus + s.meeting + s.personal + s.break;
      const segs = order.map((key) => {
        const mins = s[key];
        if (!mins) return '';
        const h = Math.max(2, (mins / maxTotal) * maxBarPx);
        return `<div class="chart-seg ${key}" style="height:${h}px" title="${TYPES[key].label}: ${formatDuration(mins)}"></div>`;
      }).join('');
      const isToday = isSameDay(d, Date.now());
      return `<div class="chart-col${isToday ? ' today' : ''}">
        <div class="chart-total">${total ? shortDuration(total) : '—'}</div>
        <div class="chart-stack">${segs || '<div class="chart-seg" style="height:2px;background:rgba(255,255,255,.06)"></div>'}</div>
        <div class="chart-day">${WD_SHORT[i].slice(0, 2)}</div>
      </div>`;
    }).join('');

    const busiestIndex = dayStats.reduce((best, s, i) => (s.meeting > dayStats[best].meeting ? i : best), 0);

    const suggestions = [];
    if (sums.meeting > sums.focus) {
      suggestions.push('Meetings outweigh deep work this week. Try stacking calls on Tuesday and Thursday afternoons.');
    } else {
      suggestions.push('Your focus-to-meeting ratio is healthy. Keep the mornings boring and protected.');
    }
    if (dayStats[busiestIndex].meeting > 0) {
      suggestions.push(`${WEEKDAYS[busiestIndex]} is your densest day. Guard the hour before it — no new commitments.`);
    }
    if (sums.focus < 120) {
      suggestions.push('Less than two hours of deep work is blocked. Put one 90-minute maker block on the calendar now.');
    } else if (booked > 0 && sums.break / booked < 0.06) {
      suggestions.push('You have almost no breaks booked. A 15-minute walk counts as work infrastructure.');
    } else {
      suggestions.push('You have room for one more meaningful thing. Choose it deliberately, not by default.');
    }

    const deltaLabel = focusDelta === 0
      ? 'same as last week'
      : `${focusDelta > 0 ? '↑' : '↓'} ${formatDuration(Math.abs(focusDelta))} vs last week`;

    const focusHours = Math.floor(sums.focus / 60);
    const focusMins = Math.round(sums.focus % 60);

    const balanceRows = order.map((key) => {
      const mins = sums[key];
      const pct = booked ? Math.round((mins / booked) * 100) : 0;
      return `<div class="balance-row">
        <span class="balance-label">${TYPES[key].label}</span>
        <div class="balance-track"><span class="b-${key}" style="width:${Math.max(mins ? 2 : 0, pct)}%"></span></div>
        <span class="balance-val">${formatDuration(mins)}</span>
      </div>`;
    }).join('');

    return `<div class="insights">
      <div class="insights-inner">
        <div class="insight-grid">
          <div class="stat-card">
            <div class="stat-label">${icon('target', 13)} Deep work</div>
            <div class="stat-value">${focusHours}<small>h</small> ${focusMins}<small>m</small></div>
            <div class="stat-foot"><span class="${focusDelta >= 0 ? 'up' : 'down'}">${deltaLabel}</span></div>
            <div class="stat-bar"><span style="width:${score}%"></span></div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${icon('users', 13)} Meeting load</div>
            <div class="stat-value">${Math.floor(sums.meeting / 60)}<small>h</small> ${Math.round(sums.meeting % 60)}<small>m</small></div>
            <div class="stat-foot">${meetingLoad}% of a 40-hour week</div>
            <div class="stat-bar"><span style="width:${clamp(meetingLoad, 0, 100)}%;background:linear-gradient(90deg,rgba(139,156,255,.6),#8b9cff)"></span></div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${icon('sparkles', 13)} Focus score</div>
            <div class="stat-value">${score}<small>/100</small></div>
            <div class="stat-foot">${formatDuration(sums.focus)} toward an ${formatDuration(goal)} target</div>
            <div class="stat-bar"><span style="width:${score}%"></span></div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-head">
            <div>
              <h2>Week rhythm</h2>
              <p>Where your hours went${sessions ? ` · ${sessions} focus session${sessions === 1 ? '' : 's'} completed` : ''}</p>
            </div>
            <div class="legend">
              <span><i class="l-focus"></i>Focus</span>
              <span><i class="l-meeting"></i>Meetings</span>
              <span><i class="l-personal"></i>Personal</span>
              <span><i class="l-break"></i>Break</span>
            </div>
          </div>
          <div class="chart">${bars}</div>
        </div>

        <div class="insights-lower">
          <div class="insight-list">
            <h2>${icon('bolt', 14)} Make it a better week</h2>
            ${suggestions.slice(0, 3).map((s) => `<div class="suggestion"><i></i><span>${s}</span></div>`).join('')}
          </div>
          <div class="insight-list">
            <h2>${icon('list', 14)} The balance</h2>
            ${balanceRows}
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ---------- Stage ---------- */

  let lastStageKey = '';

  function autoScrollWeek() {
    const body = $('#calBody');
    if (!body) return;
    const s = state.settings;
    const days = Array.from({ length: 5 }, (_, i) => addDays(startOfWeek(state.ui.cursor), i));
    const containsToday = days.some((d) => isSameDay(d, Date.now()));
    const totalH = (s.workEnd - s.workStart) * HOUR_H;
    let targetMin = 9 * 60;
    if (containsToday) {
      const nowMin = minutesOfDay(Date.now());
      if (nowMin >= s.workStart * 60 && nowMin <= s.workEnd * 60) targetMin = nowMin;
    }
    const top = ((targetMin - s.workStart * 60) / 60) * HOUR_H;
    body.scrollTop = clamp(top - body.clientHeight * 0.24, 0, totalH);
  }

  function renderStage() {
    const stage = $('#stage');
    const key = `${state.ui.view}:${dayKey(state.ui.cursor)}`;
    const changed = key !== lastStageKey;
    const previous = $('#calBody');
    const previousScroll = previous ? previous.scrollTop : null;

    if (state.ui.view === 'week') stage.innerHTML = weekHTML();
    else if (state.ui.view === 'day') stage.innerHTML = dayHTML();
    else if (state.ui.view === 'month') stage.innerHTML = monthHTML();
    else stage.innerHTML = insightsHTML();

    lastStageKey = key;

    const body = $('#calBody');
    if (body) {
      if (changed || previousScroll == null) autoScrollWeek();
      else body.scrollTop = previousScroll;
    }
    updateNowLine();
  }

  /* ---------- Render root ---------- */

  function render() {
    renderTopbar();
    renderRail();
    renderStage();
    renderPanel();
    applyPanelState();
    save();
  }

  /* ---------- Panel ---------- */

  function countdownLabel(ts) {
    const diff = ts - Date.now();
    const mins = Math.max(0, Math.round(diff / MIN));
    if (mins < 60) return `in ${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `in ${h}h ${m}m` : `in ${h}h`;
  }

  function nextEventAfter(now) {
    return state.events
      .filter((e) => e.start > now)
      .sort((a, b) => a.start - b.start)[0];
  }

  function nowCardHTML() {
    const now = Date.now();
    const live = eventsOn(now).find((e) => e.start <= now && e.end > now);
    const next = nextEventAfter(now);

    if (live) {
      const progress = clamp(((now - live.start) / (live.end - live.start)) * 100, 0, 100);
      return `<div class="now-card live" data-event="${live.id}">
        <span class="now-glow"></span>
        <div class="now-kicker"><i></i>Happening now</div>
        <div class="now-title">${esc(live.title)}</div>
        <div class="now-meta">
          <span>${icon('clock', 11)} ${timeRange(live.start, live.end)}</span>
          ${live.location ? `<span>${icon('pin', 11)} ${esc(live.location)}</span>` : ''}
        </div>
        <div class="now-progress"><span style="width:${progress}%"></span></div>
        <div class="now-countdown"><strong>${Math.max(1, Math.round((live.end - now) / MIN))} min left</strong><span>${TYPES[live.type].label}</span></div>
      </div>`;
    }

    if (next) {
      const when = isSameDay(next.start, now) ? countdownLabel(next.start) : `${WD_SHORT[weekdayIndex(next.start)]} · ${time12(next.start)}`;
      return `<div class="now-card" data-event="${next.id}">
        <span class="now-glow"></span>
        <div class="now-kicker"><i></i>Up next</div>
        <div class="now-title">${esc(next.title)}</div>
        <div class="now-meta">
          <span>${icon('clock', 11)} ${time12(next.start)} – ${time12(next.end)}</span>
          ${next.location ? `<span>${icon('pin', 11)} ${esc(next.location)}</span>` : ''}
        </div>
        <div class="now-countdown"><strong>${when}</strong><span>${TYPES[next.type].label}</span></div>
      </div>`;
    }

    return `<div class="now-card calm">
      <span class="now-glow"></span>
      <div class="now-kicker"><i></i>Clear runway</div>
      <div class="now-title">Nothing on the books</div>
      <div class="now-meta">A rare gift. Protect it.</div>
      <button class="subtle-btn" data-action="start-focus">${icon('play', 11)} Start a focus block</button>
    </div>`;
  }

  function taskHTML(task) {
    const meta = [];
    if (task.priority === 'high' && !task.done) meta.push('<span class="priority">High</span>');
    meta.push(`<span>${task.est || 30}m</span>`);
    if (task.scheduledFor) {
      const when = isSameDay(task.scheduledFor, Date.now()) ? 'Today' : dateLabel(task.scheduledFor);
      meta.push(`<span class="scheduled">${when} ${shortTime(task.scheduledFor)}</span>`);
    }

    return `<div class="task${task.done ? ' done' : ''}" data-task="${task.id}">
      <button class="task-check" data-action="toggle" aria-label="${task.done ? 'Mark incomplete' : 'Complete task'}">${icon('check', 11)}</button>
      <div class="task-body">
        <div class="task-title">${esc(task.title)}</div>
        <div class="task-meta">${meta.join('')}</div>
      </div>
      <div class="task-actions">
        <button class="mini-btn" data-action="focus" title="Start a focus session">${icon('target', 13)}</button>
        <button class="mini-btn" data-action="schedule" title="Find a slot on the calendar">${icon('schedule', 13)}</button>
      </div>
    </div>`;
  }

  function renderPanel() {
    $('#nowCard').innerHTML = nowCardHTML();

    const open = openTasks();
    $('#taskCount').textContent = String(open.length);

    const sorted = state.tasks.slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

    $('#taskList').innerHTML = sorted.length
      ? sorted.map(taskHTML).join('')
      : `<div class="empty-note"><strong>No open loops.</strong>Add the first thing on your mind.</div>`;

    const today = eventsOn(Date.now());
    const booked = today.reduce((sum, ev) => sum + clippedMinutes(ev, Date.now()), 0);
    const span = (state.settings.workEnd - state.settings.workStart) * 60;
    const free = Math.max(0, span - booked);
    const statsEl = $('#panelStats');
    if (statsEl) {
      statsEl.innerHTML = `<span><strong>${formatDuration(booked)}</strong> booked</span><span class="dot"></span><span><strong>${formatDuration(free)}</strong> free</span>`;
    }

    const focusMins = weekFocusMinutes();
    $('#focusWeek').textContent = formatDuration(focusMins);
    $('#focusWeekBar').style.width = `${clamp((focusMins / state.settings.focusGoal) * 100, 0, 100)}%`;
  }

  /* ---------- Focus ---------- */

  const RING_C = 2 * Math.PI * 98;

  const focusState = {
    running: false,
    active: false,
    completed: false,
    duration: 25 * MIN,
    remaining: 25 * MIN,
    endsAt: 0,
    label: ''
  };

  let audioCtx = null;

  function ensureAudio() {
    try {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtx = new Ctx();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    } catch (err) { /* audio is a nice-to-have */ }
  }

  function chime() {
    ensureAudio();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = now + i * 0.13;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
      });
    } catch (err) { /* ignore */ }
  }

  function burst(x, y, count = 18) {
    if (reducedMotion) return;
    const colors = ['#c9f56d', '#8b9cff', '#ffb76b', '#6fe3d3', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'spark';
      const size = 3 + Math.random() * 4;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background = colors[i % colors.length];
      document.body.appendChild(el);
      const angle = Math.random() * Math.PI * 2;
      const dist = 28 + Math.random() * 96;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 24;
      const rot = (Math.random() * 360) | 0;
      el.animate([
        { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2) rotate(${rot}deg)`, opacity: 0 }
      ], {
        duration: 620 + Math.random() * 420,
        easing: 'cubic-bezier(.16,.8,.3,1)'
      }).onfinish = () => el.remove();
    }
  }

  function focusRemaining() {
    return Math.max(0, focusState.running ? focusState.endsAt - Date.now() : focusState.remaining);
  }

  function updateFocusUI() {
    const rem = focusRemaining();
    const secs = Math.ceil(rem / 1000);
    const mm = Math.floor(secs / 60);
    const ss = secs % 60;
    const total = focusState.duration || 1;
    const fraction = focusState.completed ? 0 : clamp(rem / total, 0, 1);

    $('#focusTime').textContent = `${pad(mm)}:${pad(ss)}`;
    $('#focusRing').style.strokeDasharray = String(RING_C);
    $('#focusRing').style.strokeDashoffset = String(RING_C * (1 - fraction));

    const sub = $('#focusSub');
    if (focusState.completed) sub.textContent = 'session complete · beautifully done';
    else if (focusState.running) sub.textContent = 'in flow · notifications muted';
    else if (focusState.active) sub.textContent = 'paused · the thread is still here';
    else sub.textContent = 'ready when you are';

    const panel = $('#focusPanel');
    panel.classList.toggle('running', focusState.running);
    panel.classList.toggle('complete', focusState.completed);

    const startBtn = $('#focusStart');
    if (focusState.running) startBtn.textContent = 'Pause';
    else if (focusState.completed) startBtn.textContent = 'Go again';
    else if (focusState.active) startBtn.textContent = 'Resume';
    else startBtn.textContent = `Start ${Math.round(focusState.duration / MIN)}`;

    $$('#focusChips button').forEach((btn) => {
      const mins = Number(btn.dataset.min) * MIN;
      btn.classList.toggle('active', mins === focusState.duration);
      btn.disabled = focusState.running;
    });

    const labelInput = $('#focusLabel');
    if (document.activeElement !== labelInput && labelInput.value !== focusState.label) {
      labelInput.value = focusState.label;
    }

    const showChip = focusState.running || (focusState.active && !focusState.completed);
    const chip = $('#focusChip');
    chip.hidden = !showChip;
    chip.classList.toggle('paused', !focusState.running && focusState.active);
    if (showChip) {
      $('#focusChipTime').textContent = `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
      $('#focusChipLabel').textContent = focusState.label || 'Focus';
    }
  }

  function setFocusDuration(mins) {
    if (focusState.running) return;
    focusState.duration = mins * MIN;
    focusState.remaining = focusState.duration;
    focusState.active = false;
    focusState.completed = false;
    focusState.endsAt = 0;
    updateFocusUI();
  }

  function startFocusTimer() {
    ensureAudio();
    if (focusState.running) {
      focusState.remaining = focusRemaining();
      focusState.running = false;
      focusState.active = true;
      updateFocusUI();
      return;
    }
    if (focusState.completed || focusState.remaining <= 0) {
      focusState.completed = false;
      focusState.remaining = focusState.duration;
    }
    if (!focusState.label) focusState.label = 'Deep work';
    focusState.active = true;
    focusState.running = true;
    focusState.endsAt = Date.now() + focusState.remaining;
    updateFocusUI();
  }

  function resetFocus() {
    focusState.running = false;
    focusState.active = false;
    focusState.completed = false;
    focusState.endsAt = 0;
    focusState.remaining = focusState.duration;
    updateFocusUI();
  }

  function completeFocus() {
    focusState.running = false;
    focusState.active = false;
    focusState.completed = true;
    focusState.remaining = 0;
    const mins = Math.max(1, Math.round(focusState.duration / MIN));
    state.focusSessions.push({
      id: uid(),
      label: focusState.label || 'Focus',
      minutes: mins,
      at: Date.now()
    });
    save();
    chime();
    const ring = $('.focus-ring-wrap');
    if (ring) {
      const rect = ring.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
    }
    updateFocusUI();
    renderPanel();
    if (state.ui.view === 'insights') renderStage();
    toast('Focus complete', `${mins} minutes banked. That’s how it’s done.`, { icon: 'sparkles' });
  }

  function tickFocus() {
    if (!focusState.running) return;
    const rem = focusState.endsAt - Date.now();
    if (rem <= 0) {
      completeFocus();
    } else {
      focusState.remaining = rem;
      updateFocusUI();
    }
  }

  function openFocus(presetLabel) {
    if (focusState.completed) resetFocus();
    if (presetLabel && !focusState.running) focusState.label = presetLabel;
    if (!focusState.active && !focusState.completed) focusState.remaining = focusState.duration;
    updateFocusUI();
    openLayer($('#focusLayer'));
    setTimeout(() => {
      $('#focusStart').focus({ preventScroll: true });
    }, 140);
  }

  function closeFocus() {
    closeLayer($('#focusLayer'));
    if (focusState.completed) resetFocus();
  }

  /* ---------- Overlays ---------- */

  const layerTimers = new WeakMap();

  function openLayer(el) {
    const timer = layerTimers.get(el);
    if (timer) clearTimeout(timer);
    el.hidden = false;
    // Force a layout read so the browser paints the closed state first, then
    // open synchronously. This keeps the transition reliable even when frames
    // are throttled (background tabs, headless, reduced-motion environments).
    void el.offsetWidth;
    el.classList.add('is-open');
  }

  function closeLayer(el) {
    el.classList.remove('is-open');
    const timer = setTimeout(() => {
      if (!el.classList.contains('is-open')) el.hidden = true;
    }, 210);
    layerTimers.set(el, timer);
  }

  function anyOverlayOpen() {
    return ['#paletteLayer', '#modalLayer', '#focusLayer'].some((sel) => {
      const el = $(sel);
      return el && !el.hidden;
    });
  }

  /* ---------- Toasts ---------- */

  function toast(title, meta, opts = {}) {
    const wrap = $('#toasts');
    while (wrap.children.length >= 3) wrap.firstElementChild.remove();

    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast-icon">${icon(opts.icon || 'check', 15)}</span>
      <div class="toast-text"><strong>${esc(title)}</strong>${meta ? `<small>${esc(meta)}</small>` : ''}</div>
      ${opts.action ? `<button class="toast-action">${esc(opts.action)}</button>` : ''}`;
    wrap.appendChild(el);

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 220);
    };
    const timer = setTimeout(dismiss, opts.action ? 5200 : 3400);

    const actionBtn = el.querySelector('.toast-action');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        clearTimeout(timer);
        dismiss();
        if (opts.onAction) opts.onAction();
      });
    }
  }

  /* ---------- Editor ---------- */

  const editing = { id: null, type: 'focus', confirmDelete: false, confirmTimer: null };

  function setEditorType(type) {
    editing.type = type;
    $$('#typeChips .type-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.type === type);
    });
  }

  function defaultSlot() {
    const s = state.settings;
    let day = startOfDay(Date.now());
    const idx = weekdayIndex(day);
    if (idx >= 5) day = addDays(day, (7 - idx) % 7);

    let startMin = minutesOfDay(Date.now());
    if (idx >= 5 || !isSameDay(day, Date.now())) startMin = 9 * 60;
    if (startMin < s.workStart * 60) startMin = s.workStart * 60;
    startMin = Math.ceil(startMin / 15) * 15;

    if (startMin > s.workEnd * 60 - 30) {
      day = addDays(day, 1);
      while (weekdayIndex(day) >= 5) day = addDays(day, 1);
      startMin = 9 * 60;
    }

    const start = atTime(dayKey(day), Math.floor(startMin / 60), startMin % 60);
    return { start, end: start + 60 * MIN };
  }

  function resetDeleteButton() {
    editing.confirmDelete = false;
    if (editing.confirmTimer) clearTimeout(editing.confirmTimer);
    const btn = $('#deleteEvent');
    btn.textContent = 'Delete';
    btn.classList.remove('confirm');
  }

  function openEditor(id, defaults) {
    const s = state.settings;
    let ev = null;
    if (id && typeof id === 'string') ev = findEvent(id);
    if (id && typeof id === 'object') ev = id;

    const slot = defaults || (ev ? { start: ev.start, end: ev.end } : { start: 0, end: 0 });
    const start = slot.start || (ev ? ev.start : defaultSlot().start);
    const end = slot.end || (ev ? ev.end : start + 60 * MIN);
    const type = ev ? ev.type : (slot.type || 'focus');

    editing.id = ev ? ev.id : null;
    resetDeleteButton();

    $('#editorKicker').textContent = ev ? 'Edit event' : 'New event';
    $('#evTitle').value = ev ? ev.title : '';
    $('#evDate').value = toDateInput(start);
    $('#evStart').value = toTimeInput(start);
    $('#evEnd').value = toTimeInput(end);
    $('#evLocation').value = ev ? ev.location || '' : '';
    $('#evNotes').value = ev ? ev.notes || '' : '';
    $('#deleteEvent').hidden = !ev;
    setEditorType(type);

    openLayer($('#modalLayer'));
    setTimeout(() => {
      $('#evTitle').focus({ preventScroll: true });
    }, 170);
  }

  function closeEditor() {
    closeLayer($('#modalLayer'));
    resetDeleteButton();
  }

  function shakeTitle() {
    const input = $('#evTitle');
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    input.focus();
  }

  function submitEditor(event) {
    event.preventDefault();
    const title = $('#evTitle').value.trim();
    if (!title) {
      shakeTitle();
      return;
    }
    const date = $('#evDate').value;
    const startTime = $('#evStart').value;
    const endTime = $('#evEnd').value;
    if (!date || !startTime || !endTime) {
      toast('Check the details', 'A date, start time, and end time are required.', { icon: 'clock' });
      return;
    }

    let start = new Date(`${date}T${startTime}`).getTime();
    let end = new Date(`${date}T${endTime}`).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      toast('That date didn’t parse', 'Try picking it again.', { icon: 'clock' });
      return;
    }
    if (end <= start) end = start + 30 * MIN;

    const payload = {
      title,
      start,
      end,
      type: editing.type,
      location: $('#evLocation').value.trim(),
      notes: $('#evNotes').value.trim()
    };

    if (editing.id) {
      const existing = findEvent(editing.id);
      if (existing) Object.assign(existing, payload);
      toast('Event updated', `${dateLabel(start)} · ${timeRange(start, end)}`, { icon: 'check' });
    } else {
      state.events.push({ id: uid(), ...payload });
      toast('Block added', `${dateLabel(start)} · ${timeRange(start, end)}`, { icon: 'plus' });
    }

    closeEditor();
    render();
  }

  function deleteFromEditor() {
    if (!editing.id) return;
    const btn = $('#deleteEvent');
    if (!editing.confirmDelete) {
      editing.confirmDelete = true;
      btn.textContent = 'Confirm delete';
      btn.classList.add('confirm');
      editing.confirmTimer = setTimeout(resetDeleteButton, 3000);
      return;
    }

    const idx = state.events.findIndex((e) => e.id === editing.id);
    if (idx < 0) { closeEditor(); return; }
    const removed = state.events.splice(idx, 1)[0];
    closeEditor();
    render();
    toast('Event deleted', removed.title, {
      icon: 'trash',
      action: 'Undo',
      onAction: () => {
        state.events.push(removed);
        render();
      }
    });
  }

  /* ---------- Command palette ---------- */

  let paletteItems = [];
  let paletteIndex = 0;

  function goToday() {
    state.ui.cursor = startOfDay(Date.now());
    render();
  }

  function setView(view) {
    state.ui.view = view;
    render();
  }

  function scheduleNextTask() {
    const task = openTasks()[0];
    if (!task) {
      toast('Nothing to schedule', 'Add a task first, then give it a home.', { icon: 'list' });
      return;
    }
    scheduleTask(task);
  }

  function buildPalette() {
    const items = [];
    const now = Date.now();

    items.push(
      { group: 'Navigate', icon: 'today', title: 'Go to today', sub: 'Back to the present moment', hint: 'T', run: goToday },
      { group: 'Navigate', icon: 'day', title: 'Day plan', sub: weekdayIndex(now) === 0 ? 'A single, spacious day' : 'Zoom into one day', hint: 'D', run: () => { state.ui.cursor = startOfDay(now); setView('day'); } },
      { group: 'Navigate', icon: 'week', title: 'Week view', sub: 'The whole shape of the week', hint: 'W', run: () => setView('week') },
      { group: 'Navigate', icon: 'month', title: 'Month view', sub: 'Step back and see the season', hint: 'M', run: () => setView('month') },
      { group: 'Navigate', icon: 'insights', title: 'Weekly insights', sub: 'Hours, balance, and gentle suggestions', hint: 'I', run: () => setView('insights') }
    );

    items.push(
      { group: 'Actions', icon: 'plus', title: 'New event', sub: 'Block time on the calendar', hint: 'N', run: () => openEditor(null, defaultSlot()) },
      { group: 'Actions', icon: 'target', title: 'Start a focus session', sub: 'One thing, twenty-five minutes', hint: 'F', run: () => openFocus() },
      { group: 'Actions', icon: 'schedule', title: 'Schedule the next task', sub: 'Find the next honest free slot', hint: '', run: scheduleNextTask },
      { group: 'Actions', icon: 'panel', title: 'Toggle task panel', sub: 'More room, or more context', hint: '', run: togglePanel }
    );

    const upcoming = state.events
      .filter((e) => e.end > now)
      .sort((a, b) => a.start - b.start)
      .slice(0, 7);
    upcoming.forEach((ev) => {
      items.push({
        group: 'Events',
        icon: 'calendar',
        title: ev.title,
        sub: `${WD_SHORT[weekdayIndex(ev.start)]} ${dateLabel(ev.start)} · ${time12(ev.start)} – ${time12(ev.end)}`,
        hint: '',
        run: () => openEditor(ev.id)
      });
    });

    openTasks().slice(0, 5).forEach((task) => {
      items.push({
        group: 'Tasks',
        icon: 'target',
        title: task.title,
        sub: `${task.est || 30} minutes · find it a slot`,
        hint: '',
        run: () => scheduleTask(task)
      });
    });

    return items;
  }

  function filteredPalette() {
    const q = $('#paletteInput').value.trim().toLowerCase();
    if (!q) return paletteItems;
    return paletteItems.filter((item) => `${item.title} ${item.sub} ${item.group}`.toLowerCase().includes(q));
  }

  function renderPalette() {
    const results = $('#paletteResults');
    const items = filteredPalette();
    paletteIndex = clamp(paletteIndex, 0, Math.max(0, items.length - 1));

    if (!items.length) {
      results.innerHTML = `<div class="palette-empty">No matches. Try “focus”, “today”, or the name of an event.</div>`;
      return;
    }

    let lastGroup = '';
    results.innerHTML = items.map((item, i) => {
      const header = item.group !== lastGroup ? `<div class="palette-group-label">${item.group}</div>` : '';
      lastGroup = item.group;
      return `${header}<button class="palette-item${i === paletteIndex ? ' selected' : ''}" data-index="${i}">
        <span class="pi-icon">${icon(item.icon, 15)}</span>
        <span class="pi-text"><strong>${esc(item.title)}</strong><small>${esc(item.sub)}</small></span>
        ${item.hint ? `<kbd>${item.hint}</kbd>` : ''}
      </button>`;
    }).join('');

    const selected = results.querySelector('.palette-item.selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  function openPalette() {
    paletteItems = buildPalette();
    paletteIndex = 0;
    $('#paletteInput').value = '';
    renderPalette();
    openLayer($('#paletteLayer'));
    setTimeout(() => {
      $('#paletteInput').focus({ preventScroll: true });
    }, 120);
  }

  function closePalette() {
    closeLayer($('#paletteLayer'));
  }

  function runPaletteItem(index) {
    const items = filteredPalette();
    const item = items[index];
    if (!item) return;
    closePalette();
    setTimeout(() => item.run(), 80);
  }

  function movePaletteSelection(delta) {
    const items = filteredPalette();
    if (!items.length) return;
    paletteIndex = (paletteIndex + delta + items.length) % items.length;
    renderPalette();
  }

  /* ---------- Panel state ---------- */

  function isNarrowScreen() {
    return window.matchMedia('(max-width: 1120px)').matches;
  }

  function applyPanelState() {
    const app = $('#app');
    const narrow = isNarrowScreen();
    app.classList.toggle('panel-hidden', !narrow && state.ui.panelHidden);
    app.classList.toggle('panel-open', narrow && state.ui.panelOpen);
    $('#panelScrim').hidden = !(narrow && state.ui.panelOpen);
    $('#panelBtn').setAttribute('aria-expanded', String(narrow ? state.ui.panelOpen : !state.ui.panelHidden));
  }

  function togglePanel() {
    if (isNarrowScreen()) state.ui.panelOpen = !state.ui.panelOpen;
    else state.ui.panelHidden = !state.ui.panelHidden;
    applyPanelState();
    save();
  }

  /* ---------- Navigation ---------- */

  function navigate(dir) {
    const view = state.ui.view;
    if (view === 'day') state.ui.cursor = addDays(state.ui.cursor, dir);
    else if (view === 'month') state.ui.cursor = addMonths(state.ui.cursor, dir);
    else state.ui.cursor = addDays(state.ui.cursor, dir * 7);
    render();
  }

  function viewContains(ts) {
    const view = state.ui.view;
    if (view === 'day') return isSameDay(ts, state.ui.cursor);
    if (view === 'week') {
      const start = startOfWeek(state.ui.cursor);
      return ts >= start && ts < addDays(start, 7);
    }
    if (view === 'month') return startOfMonth(ts) === startOfMonth(state.ui.cursor);
    return false;
  }

  /* ---------- Scheduling ---------- */

  function findFreeSlot(minutes) {
    const s = state.settings;
    const duration = Math.max(15, minutes || 30);
    let day = startOfDay(Date.now());

    for (let i = 0; i < 14; i++) {
      if (weekdayIndex(day) < 5) {
        const key = dayKey(day);
        const dayStart = atTime(key, s.workStart, 0);
        const dayEnd = atTime(key, s.workEnd, 0);
        let startMin = s.workStart * 60;

        if (isSameDay(day, Date.now())) {
          startMin = Math.ceil((minutesOfDay(Date.now()) + 5) / 15) * 15;
          startMin = Math.max(startMin, s.workStart * 60);
        }

        let cursor = atTime(key, Math.floor(startMin / 60), startMin % 60);
        if (cursor >= dayEnd) { day = addDays(day, 1); continue; }

        const evs = eventsOn(day);
        for (const ev of evs) {
          if (ev.end <= cursor) continue;
          if (ev.start - cursor >= duration * MIN) break;
          cursor = Math.max(cursor, ev.end);
        }

        if (dayEnd - cursor >= duration * MIN) return cursor;
      }
      day = addDays(day, 1);
    }
    return null;
  }

  function scheduleTask(task) {
    if (!task) return;
    const slot = findFreeSlot(task.est || 30);
    if (slot == null) {
      toast('No honest slot found', 'The next two weeks are full. Something has to give.', { icon: 'clock' });
      return;
    }

    const duration = Math.max(15, task.est || 30);
    const end = slot + duration * MIN;
    const ev = {
      id: uid(),
      title: task.title,
      start: slot,
      end,
      type: 'focus',
      location: '',
      notes: 'Scheduled from your task list.'
    };

    state.events.push(ev);
    task.scheduledFor = slot;
    task.scheduledEventId = ev.id;

    if (!viewContains(slot) && state.ui.view !== 'insights') {
      state.ui.cursor = startOfDay(slot);
    }

    save();
    render();
    toast('Time blocked', `${WD_SHORT[weekdayIndex(slot)]} · ${timeRange(slot, end)} · ${task.title}`, { icon: 'schedule' });
  }

  /* ---------- Task actions ---------- */

  function toggleTask(id, sourceEl) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;

    if (task.done) {
      if (sourceEl) {
        const rect = sourceEl.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
      }
      const left = openTasks().length;
      if (left === 0) {
        const appRect = $('#app').getBoundingClientRect();
        setTimeout(() => burst(appRect.left + appRect.width / 2, appRect.top + appRect.height * 0.55, 34), 160);
        toast('Everything is clear', 'Every open loop closed. Go take the walk.', { icon: 'sparkles' });
      } else {
        toast('Task cleared', `${left} left. Keep the momentum.`, { icon: 'check' });
      }
    }

    save();
    renderPanel();
  }

  function addTask(event) {
    event.preventDefault();
    const input = $('#taskInput');
    const title = input.value.trim();
    if (!title) return;
    state.tasks.push({
      id: uid(),
      title,
      est: 30,
      done: false,
      priority: 'normal',
      createdAt: Date.now()
    });
    input.value = '';
    save();
    renderPanel();
    input.focus();
  }

  /* ---------- Drag interactions ---------- */

  let dragState = null;

  function snapMinute(clientY, col) {
    const rect = col.getBoundingClientRect();
    const raw = state.settings.workStart * 60 + ((clientY - rect.top) / HOUR_H) * 60;
    return Math.round(raw / 15) * 15;
  }

  function minuteLabel(min) {
    const h = Math.floor(min / 60) % 24;
    const m = ((min % 60) + 60) % 60;
    return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
  }

  function addDragListeners() {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function removeDragListeners() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  }

  function updateDragTip(x, y, text) {
    if (!dragState) return;
    if (!dragState.tip) {
      dragState.tip = document.createElement('div');
      dragState.tip.className = 'drag-tip';
      document.body.appendChild(dragState.tip);
    }
    dragState.tip.textContent = text;
    dragState.tip.style.left = `${x + 14}px`;
    dragState.tip.style.top = `${y + 18}px`;
  }

  function startCreate(e, col) {
    const s = state.settings;
    const startMin = clamp(snapMinute(e.clientY, col), s.workStart * 60, s.workEnd * 60 - 15);
    const ghost = document.createElement('div');
    ghost.className = 'create-ghost';
    ghost.innerHTML = '<span></span>';
    col.appendChild(ghost);

    dragState = {
      kind: 'create',
      col,
      startMin,
      endMin: Math.min(startMin + 60, s.workEnd * 60),
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      ghost,
      tip: null,
      newStart: 0,
      newEnd: 0
    };

    e.preventDefault();
    document.body.classList.add('is-creating');
    renderCreateGhost();
    addDragListeners();
  }

  function renderCreateGhost() {
    if (!dragState || dragState.kind !== 'create') return;
    const s = state.settings;
    const top = ((dragState.startMin - s.workStart * 60) / 60) * HOUR_H;
    const height = Math.max(20, ((dragState.endMin - dragState.startMin) / 60) * HOUR_H);
    dragState.ghost.style.top = `${top}px`;
    dragState.ghost.style.height = `${height}px`;
    dragState.ghost.querySelector('span').textContent = `${minuteLabel(dragState.startMin)} – ${minuteLabel(dragState.endMin)}`;
  }

  function startEventDrag(e, eventEl) {
    const ev = findEvent(eventEl.dataset.event);
    if (!ev) return;
    const resize = Boolean(e.target.closest('.event-resize'));
    const rect = eventEl.getBoundingClientRect();

    dragState = {
      kind: resize ? 'resize' : 'move',
      id: ev.id,
      ev: { start: ev.start, end: ev.end },
      el: eventEl,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      grabMin: resize ? 0 : clamp(((e.clientY - rect.top) / HOUR_H) * 60, 0, (ev.end - ev.start) / MIN),
      durationMin: (ev.end - ev.start) / MIN,
      newStart: ev.start,
      newEnd: ev.end,
      targetCol: eventEl.closest('.cal-col'),
      ghost: null,
      tip: null
    };

    e.preventDefault();
    addDragListeners();
  }

  function onPointerMove(e) {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    if (!dragState.moved && Math.abs(dx) + Math.abs(dy) > 4) {
      dragState.moved = true;
      document.body.classList.add('is-dragging');

      if (dragState.kind === 'move') {
        const rect = dragState.el.getBoundingClientRect();
        const ghost = dragState.el.cloneNode(true);
        ghost.classList.add('drag-ghost');
        ghost.classList.remove('is-dragging');
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        document.body.appendChild(ghost);
        dragState.ghost = ghost;
        dragState.grabX = e.clientX - rect.left;
        dragState.grabY = e.clientY - rect.top;
        dragState.el.classList.add('is-dragging');
      }
    }

    if (!dragState.moved) return;

    const s = state.settings;

    if (dragState.kind === 'create') {
      const endMin = clamp(snapMinute(e.clientY, dragState.col), dragState.startMin + 15, s.workEnd * 60);
      dragState.endMin = endMin;
      renderCreateGhost();
      updateDragTip(e.clientX, e.clientY, `${minuteLabel(dragState.startMin)} – ${minuteLabel(endMin)}`);
      return;
    }

    if (dragState.kind === 'move') {
      const ghost = dragState.ghost;
      if (ghost) {
        ghost.style.left = `${e.clientX - dragState.grabX}px`;
        ghost.style.top = `${e.clientY - dragState.grabY}px`;
      }

      const under = document.elementFromPoint(e.clientX, e.clientY);
      const col = under ? under.closest('.cal-col') : null;
      if (!col) return;

      if (dragState.targetCol && dragState.targetCol !== col) {
        dragState.targetCol.classList.remove('drop-target');
      }
      dragState.targetCol = col;
      col.classList.add('drop-target');

      const rect = col.getBoundingClientRect();
      const rawMin = s.workStart * 60 + ((e.clientY - dragState.grabY - rect.top) / HOUR_H) * 60;
      const startMin = clamp(
        Math.round(rawMin / 15) * 15,
        s.workStart * 60,
        s.workEnd * 60 - dragState.durationMin
      );
      const key = col.dataset.date;
      const startTs = atTime(key, Math.floor(startMin / 60), startMin % 60);

      dragState.newStart = startTs;
      dragState.newEnd = startTs + dragState.durationMin * MIN;
      updateDragTip(e.clientX, e.clientY, `${time12(dragState.newStart)} – ${time12(dragState.newEnd)}`);
      return;
    }

    if (dragState.kind === 'resize') {
      const col = dragState.el.closest('.cal-col');
      if (!col) return;
      const origin = startOfDay(dragState.ev.start);
      const key = dayKey(origin);
      const rawMin = snapMinute(e.clientY, col);
      const startMin = (dragState.ev.start - atTime(key, 0, 0)) / MIN;
      const endMin = clamp(rawMin, startMin + 15, s.workEnd * 60);

      dragState.newStart = dragState.ev.start;
      dragState.newEnd = atTime(key, Math.floor(endMin / 60), endMin % 60);
      const height = Math.max(20, ((dragState.newEnd - dragState.ev.start) / MIN / 60) * HOUR_H);
      dragState.el.style.transition = 'none';
      dragState.el.style.height = `${height}px`;
      updateDragTip(e.clientX, e.clientY, `${time12(dragState.ev.start)} – ${time12(dragState.newEnd)}`);
    }
  }

  function cleanupDrag() {
    if (dragState) {
      if (dragState.ghost) dragState.ghost.remove();
      if (dragState.tip) dragState.tip.remove();
      if (dragState.el) {
        dragState.el.classList.remove('is-dragging');
        dragState.el.style.transition = '';
        dragState.el.style.height = '';
      }
    }
    $$('.drop-target').forEach((col) => col.classList.remove('drop-target'));
    dragState = null;
    document.body.classList.remove('is-dragging', 'is-creating');
    removeDragListeners();
  }

  function onPointerUp(e) {
    if (!dragState) return;
    const d = dragState;
    const s = state.settings;

    if (d.kind === 'create') {
      let startMin = d.startMin;
      let endMin = d.moved ? d.endMin : Math.min(startMin + 60, s.workEnd * 60);
      if (!d.moved && startMin + 60 > s.workEnd * 60) startMin = s.workEnd * 60 - 60;
      if (endMin - startMin < 15) endMin = Math.min(startMin + 30, s.workEnd * 60);

      const key = d.col.dataset.date;
      const start = atTime(key, Math.floor(startMin / 60), startMin % 60);
      const end = atTime(key, Math.floor(endMin / 60), endMin % 60);

      cleanupDrag();
      openEditor(null, { start, end, type: 'focus' });
      return;
    }

    if (!d.moved) {
      cleanupDrag();
      openEditor(d.id);
      return;
    }

    cleanupDrag();

    if (d.kind === 'move') {
      const ev = findEvent(d.id);
      if (ev && (ev.start !== d.newStart || ev.end !== d.newEnd)) {
        ev.start = d.newStart;
        ev.end = d.newEnd;
        save();
        render();
        toast('Event moved', `${WD_SHORT[weekdayIndex(d.newStart)]} · ${timeRange(d.newStart, d.newEnd)}`, { icon: 'arrowUpRight' });
      }
      return;
    }

    if (d.kind === 'resize') {
      const ev = findEvent(d.id);
      if (ev && ev.end !== d.newEnd) {
        ev.end = d.newEnd;
        save();
        render();
        toast('Duration updated', `${formatDuration((d.newEnd - d.newStart) / MIN)} blocked`, { icon: 'clock' });
      }
    }
  }

  function onStagePointerDown(e) {
    if (e.button !== 0) return;
    const eventEl = e.target.closest('.event');
    if (eventEl) {
      startEventDrag(e, eventEl);
      return;
    }
    if (e.pointerType === 'touch') return;
    const col = e.target.closest('.cal-col');
    if (col) startCreate(e, col);
  }

  /* ---------- Event handlers ---------- */

  function handleStageClick(e) {
    const head = e.target.closest('.day-head');
    if (head) {
      state.ui.cursor = startOfDay(Number(head.dataset.day));
      setView('day');
      return;
    }

    const pill = e.target.closest('.month-pill');
    if (pill) {
      openEditor(pill.dataset.event);
      return;
    }

    const more = e.target.closest('.month-more');
    if (more) {
      e.stopPropagation();
      state.ui.cursor = startOfDay(Number(more.dataset.day));
      setView('day');
      return;
    }

    const cell = e.target.closest('.month-cell');
    if (cell) {
      state.ui.cursor = startOfDay(Number(cell.dataset.day));
      setView('day');
      return;
    }

    const gap = e.target.closest('[data-gap]');
    if (gap) {
      const start = Number(gap.dataset.gap);
      const end = Number(gap.dataset.gapEnd) || start + 60 * MIN;
      const dur = Math.min(60, Math.round((end - start) / MIN)) * MIN;
      openEditor(null, { start, end: start + dur, type: 'focus' });
      return;
    }

    if (e.target.closest('#dayAddBtn')) {
      const day = state.ui.cursor;
      const start = atTime(dayKey(day), 9, 0);
      openEditor(null, { start, end: start + 60 * MIN, type: 'focus' });
      return;
    }

    const card = e.target.closest('.tl-card');
    if (card) {
      openEditor(card.dataset.event);
    }
  }

  function handleStageKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.event, .tl-card');
    if (!card || !card.dataset.event) return;
    e.preventDefault();
    openEditor(card.dataset.event);
  }

  function handlePanelClick(e) {
    const nowCard = e.target.closest('.now-card[data-event]');
    if (nowCard) {
      if (!e.target.closest('[data-action="start-focus"]')) {
        openEditor(nowCard.dataset.event);
        return;
      }
    }

    const focusAction = e.target.closest('[data-action="start-focus"]');
    if (focusAction) { openFocus(openTasks()[0] ? openTasks()[0].title : ''); return; }

    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const taskEl = actionBtn.closest('.task');
      if (taskEl) {
        const task = state.tasks.find((t) => t.id === taskEl.dataset.task);
        if (!task) return;
        const action = actionBtn.dataset.action;
        if (action === 'toggle') toggleTask(task.id, actionBtn);
        else if (action === 'focus') openFocus(task.title);
        else if (action === 'schedule') scheduleTask(task);
        return;
      }
    }
  }

  function onKeyDown(e) {
    const paletteLayer = $('#paletteLayer');
    const paletteOpen = !paletteLayer.hidden;
    const modalLayer = $('#modalLayer');
    const focusLayer = $('#focusLayer');
    const key = e.key;

    if ((e.metaKey || e.ctrlKey) && key.toLowerCase() === 'k') {
      e.preventDefault();
      if (paletteOpen) closePalette();
      else openPalette();
      return;
    }

    if (key === 'Escape') {
      if (paletteOpen) { e.preventDefault(); closePalette(); return; }
      if (!modalLayer.hidden) { e.preventDefault(); closeEditor(); return; }
      if (!focusLayer.hidden) { e.preventDefault(); closeFocus(); return; }
      if ($('#app').classList.contains('panel-open')) {
        state.ui.panelOpen = false;
        applyPanelState();
        save();
      }
      return;
    }

    if (paletteOpen) {
      if (key === 'ArrowDown') { e.preventDefault(); movePaletteSelection(1); }
      else if (key === 'ArrowUp') { e.preventDefault(); movePaletteSelection(-1); }
      else if (key === 'Enter') { e.preventDefault(); runPaletteItem(paletteIndex); }
      return;
    }

    if (!modalLayer.hidden || !focusLayer.hidden) return;

    const active = document.activeElement;
    const typing = active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable);
    if (typing) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const k = key.toLowerCase();
    if (k === 't') { e.preventDefault(); goToday(); }
    else if (k === 'd') { e.preventDefault(); setView('day'); }
    else if (k === 'w') { e.preventDefault(); setView('week'); }
    else if (k === 'm') { e.preventDefault(); setView('month'); }
    else if (k === 'i') { e.preventDefault(); setView('insights'); }
    else if (k === 'n') { e.preventDefault(); openEditor(null, defaultSlot()); }
    else if (k === 'f') { e.preventDefault(); openFocus(); }
    else if (k === '/') { e.preventDefault(); openPalette(); }
    else if (key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
    else if (key === 'ArrowRight') { e.preventDefault(); navigate(1); }
  }

  function updateNowLine() {
    const line = $('#nowLine');
    if (!line) return;
    const s = state.settings;
    const top = ((minutesOfDay(Date.now()) - s.workStart * 60) / 60) * HOUR_H;
    const total = (s.workEnd - s.workStart) * HOUR_H;
    if (top < 0 || top > total) {
      line.style.display = 'none';
    } else {
      line.style.display = '';
      line.style.top = `${top}px`;
    }
  }

  let renderedDayKey = dayKey(Date.now());

  function updateClock() {
    $('#panelClock').textContent = time12(Date.now());
    updateNowLine();

    if (!anyOverlayOpen()) {
      const card = $('#nowCard');
      if (card) card.innerHTML = nowCardHTML();
    }

    const todayKey = dayKey(Date.now());
    if (todayKey !== renderedDayKey) {
      renderedDayKey = todayKey;
      render();
    }
  }

  function attachEvents() {
    $('#prevBtn').addEventListener('click', () => navigate(-1));
    $('#nextBtn').addEventListener('click', () => navigate(1));
    $('#todayBtn').addEventListener('click', goToday);
    $('#brandBtn').addEventListener('click', goToday);
    $('#newEventBtn').addEventListener('click', () => openEditor(null, defaultSlot()));
    $('#searchBtn').addEventListener('click', openPalette);
    $('#paletteRail').addEventListener('click', openPalette);
    $('#focusRail').addEventListener('click', () => openFocus());
    $('#panelBtn').addEventListener('click', togglePanel);
    $('#panelScrim').addEventListener('click', () => {
      state.ui.panelOpen = false;
      applyPanelState();
      save();
    });

    $$('.rail-btn[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    $('#stage').addEventListener('click', handleStageClick);
    $('#stage').addEventListener('keydown', handleStageKeyDown);
    $('#stage').addEventListener('pointerdown', onStagePointerDown);

    $('#panel').addEventListener('click', handlePanelClick);
    $('#taskForm').addEventListener('submit', addTask);
    $('#startFocusBtn').addEventListener('click', () => openFocus(openTasks()[0] ? openTasks()[0].title : ''));
    $('#focusChip').addEventListener('click', () => openFocus());

    $('#focusStart').addEventListener('click', startFocusTimer);
    $('#focusReset').addEventListener('click', resetFocus);
    $('#focusClose').addEventListener('click', closeFocus);
    $('#focusLayer').addEventListener('pointerdown', (e) => {
      if (e.target === $('#focusLayer')) closeFocus();
    });
    $('#focusLabel').addEventListener('input', (e) => {
      focusState.label = e.target.value;
    });
    $$('#focusChips button').forEach((btn) => {
      btn.addEventListener('click', () => setFocusDuration(Number(btn.dataset.min)));
    });
    if (focusState.label === '') focusState.label = '';

    $('#eventForm').addEventListener('submit', submitEditor);
    $('#modalClose').addEventListener('click', closeEditor);
    $('#cancelEvent').addEventListener('click', closeEditor);
    $('#deleteEvent').addEventListener('click', deleteFromEditor);
    $('#modalLayer').addEventListener('pointerdown', (e) => {
      if (e.target === $('#modalLayer')) closeEditor();
    });
    $$('#typeChips .type-chip').forEach((chip) => {
      chip.addEventListener('click', () => setEditorType(chip.dataset.type));
    });
    $('#evTitle').addEventListener('input', (e) => e.target.classList.remove('shake'));

    $('#paletteInput').addEventListener('input', () => {
      paletteIndex = 0;
      renderPalette();
    });
    $('#paletteResults').addEventListener('click', (e) => {
      const item = e.target.closest('.palette-item');
      if (item) runPaletteItem(Number(item.dataset.index));
    });
    $('#paletteLayer').addEventListener('pointerdown', (e) => {
      if (e.target === $('#paletteLayer')) closePalette();
    });

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', () => {
      if (isNarrowScreen()) {
        $('#app').classList.remove('panel-hidden');
      } else {
        $('#app').classList.remove('panel-open');
        $('#panelScrim').hidden = true;
      }
      applyPanelState();
    });
  }

  /* ---------- Init ---------- */

  function hydrateIcons() {
    $$('[data-icon]').forEach((el) => {
      el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 18);
    });
  }

  function init() {
    hydrateIcons();
    loadState();
    applyPanelState();
    attachEvents();
    render();
    updateFocusUI();

    setInterval(tickFocus, 500);
    setInterval(updateClock, 30000);
  }

  init();



})();
