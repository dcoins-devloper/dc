/* D-COINS Mini App UI. API calls are intentionally isolated for binding to the bot backend. */
const state = {
  view: "home",
  balance: 0,
  displayName: "Игрок",
  hiddenBalance: false,
  booster: null,
  boosters: [],
  top: [],
  initData: "",
  activeGame: null,
};

const icon = (value) => `<span class="row-icon">${value}</span>`;
const btn = (label, view, style = "secondary") => `<button class="button ${style}" type="button" data-view="${view}">${label}</button>`;
const card = (iconText, title, text, view) => `<button class="game-card" type="button" data-view="${view}"><span class="game-icon">${iconText}</span><h3>${title}</h3><p>${text}</p></button>`;

const views = {
  home: () => `
    <div class="page-head"><div class="eyebrow">D-COINS · игровой центр</div><h1>Привет, ${state.displayName}</h1><p class="lead">Все игровые функции бота — в одном месте.</p></div>
    <section class="balance-card"><div class="balance-label">Текущий баланс</div><div class="balance-number">${state.hiddenBalance ? "••••••" : `${format(state.balance)} <small>DC</small>`}</div><div class="balance-actions">${btn("Купить DC", "buy", "primary")}${btn("Баланс", "profile")}</div></section>
    <section class="section"><div class="section-title"><h2>Быстрый доступ</h2></div><div class="grid two">
      <button class="tile quick-card" type="button" data-view="games"><span class="icon">◈</span><strong>Игры</strong><small>8 игр</small></button>
      <button class="tile quick-card" type="button" data-view="cases"><span class="icon">▣</span><strong>Кейсы</strong><small>Подарки и бустеры</small></button>
      <button class="tile quick-card" type="button" data-view="jackpot"><span class="icon">⌾</span><strong>Джекпот дня</strong><small>Розыгрыш в 00:00 МСК</small></button>
      <button class="tile quick-card" type="button" data-view="boosters"><span class="icon">⚡</span><strong>Бустеры</strong><small>Усиления для игр</small></button>
    </div></section>
    <section class="section"><div class="notice"><b>i</b><span>Используй кнопки ниже, чтобы открыть игры, кейсы, инвентарь или принять участие в джекпоте.</span></div></section>`,
  games: () => page("Игры", "Выбери игру и укажи сумму ставки.", `<div class="grid two">
    ${card("▦", "Слоты", "Классические барабаны", "play:slots")}
    ${card("◉", "Рулетка", "Красное, чёрное или зелёное", "play:roulette")}
    ${card("◆", "Кубик", "Угадай число", "play:dice")}
    ${card("✦", "Мины", "Открывай безопасные клетки", "play:mines")}
    ${card("◐", "Орёл и решка", "Выбери сторону", "play:coinflip")}
    ${card("▤", "Скретч-карты", "Найди три одинаковых", "play:scratch")}
    ${card("▦", "Лотерея 5×5", "Выбери счастливый билет", "play:lottery")}
    ${card("↗", "Crash", "Обычный полёт или турбо", "play:crash")}
  </div>`),
  cases: () => page("Кейсы", "Открывай кейсы за D-COINS. Подарки выдаются через бота.", `<div class="grid two">
    ${caseCard("B", "BLOOD", "5 000 DC", "case:blood")}
    ${caseCard("P", "PANTERA", "10 000 DC", "case:pantera")}
    ${caseCard("S", "SPIDER MAN", "7 500 DC", "case:spider_man")}
    ${caseCard("P", "Ящик Пандоры", "Бесплатно раз в 5 дней", "pandora")}
  </div>`),
  boosters: () => page("Бустеры", "Выбери один бустер для следующей игры.", `<div class="notice"><b>⚡</b><span>${state.booster ? `Активен: ${state.booster}` : "Активный бустер пока не выбран."}</span></div><div class="section list">${boosters()}</div>`),
  inventory: () => page("Инвентарь", "Твои полученные бустеры и кейсы.", `<div class="stat-row"><div class="stat"><b>0</b><small>Бустеров</small></div><div class="stat"><b>0</b><small>Ключей кейсов</small></div><div class="stat"><b>—</b><small>Активный</small></div></div><div class="section"><div class="notice"><b>⌁</b><span>Предметы из инвентаря появляются после выигрыша, промокода или раздачи.</span></div></div>`),
  jackpot: () => page("Джекпот дня", "Розыгрыш проходит каждый день в 00:00 по Москве.", `<div class="balance-card"><div class="balance-label">Текущий призовой фонд</div><div class="balance-number">0 <small>DC</small></div><p class="lead">Билеты начисляются за проигрыши в играх.</p></div><div class="section list"><button class="list-row" data-view="jackpot-top">${icon("#")}<span class="row-main"><strong>Топ билетов</strong><span>Участники сегодняшнего розыгрыша</span></span><span class="row-side">›</span></button><button class="list-row" data-view="jackpot-winners">${icon("★")}<span class="row-main"><strong>Победители</strong><span>История последних выигрышей</span></span><span class="row-side">›</span></button></div>`),
  buy: () => page("Купить D-COINS", "Покупка за Telegram Stars.", `<div class="list">${[100,200,300,400,500,600,700,800,900,1000].map(n => `<button class="list-row" data-action="buy" data-amount="${n * 1000}">${icon("✦")}<span class="row-main"><strong>${n} 000 DC</strong><span>Пополнение баланса</span></span><span class="tag amber">${n * 2} ⭐</span></button>`).join("")}</div>`),
  profile: () => page("Профиль", "Управление балансом и игровым аккаунтом.", `<div class="balance-card"><div class="balance-label">Текущий баланс</div><div class="balance-number">${state.hiddenBalance ? "••••••" : `${format(state.balance)} <small>DC</small>`}</div><div class="balance-actions">${btn(state.hiddenBalance ? "Показать в топе" : "Скрыть в топе", "toggle-privacy")}</div></div><div class="section list"><button class="list-row" data-view="top">${icon("#")}<span class="row-main"><strong>Топ игроков</strong><span>Рейтинг по D-COINS</span></span><span class="row-side">›</span></button><button class="list-row" data-view="promo">${icon("⌁")}<span class="row-main"><strong>Промокод</strong><span>Активировать код</span></span><span class="row-side">›</span></button><button class="list-row" data-view="support">${icon("?")}<span class="row-main"><strong>Чат с администратором</strong><span>Доступен при разрешении</span></span><span class="row-side">›</span></button></div>`),
  more: () => page("Ещё", "Дополнительные разделы D-COINS.", `<div class="list"><button class="list-row" data-view="inventory">${icon("▦")}<span class="row-main"><strong>Инвентарь</strong><span>Бустеры и ключи кейсов</span></span><span class="row-side">›</span></button><button class="list-row" data-view="duels">${icon("⚔")}<span class="row-main"><strong>Дуэли</strong><span>Игры с другими участниками</span></span><span class="row-side">›</span></button><button class="list-row" data-view="mini-events">${icon("⚡")}<span class="row-main"><strong>Мини-ивенты</strong><span>Активности из канала</span></span><span class="row-side">›</span></button><button class="list-row" data-view="help">${icon("i")}<span class="row-main"><strong>Как играть</strong><span>Короткие правила</span></span><span class="row-side">›</span></button></div>`),
  top: () => page("Топ игроков", "Баланс скрытых игроков не раскрывается.", `<div class="list">${state.top.length ? state.top.map((player, i) => `<div class="list-row">${icon(i + 1)}<span class="row-main"><strong>${player.name}</strong><span>${player.hidden && player.balance === null ? "🔒 Скрыто" : `${format(player.balance)} DC`}</span></span>${i === 0 ? '<span class="tag amber">Лидер</span>' : ""}</div>`).join("") : '<div class="notice"><b>⌁</b><span>Загружаем рейтинг…</span></div>'}</div>`),
  promo: () => page("Промокод", "Введи код, который получил в канале или у администрации.", `<div class="modal"><h2>Активация промокода</h2><p>Код можно активировать один раз, если его лимит ещё не исчерпан.</p><div class="section"><input class="input" placeholder="Введите код" autocomplete="off" /></div><div class="modal-actions">${btn("Активировать", "promo-activate", "primary")}</div></div>`),
  support: () => page("Чат с администратором", "Этот раздел доступен только пользователям с разрешением.", `<div class="modal"><h2>Диалог с поддержкой</h2><p>Напиши сообщение — оно попадёт администратору в боте.</p><div class="section"><input class="input" placeholder="Сообщение" /></div><div class="modal-actions">${btn("Отправить", "support-send", "cyan")}</div></div>`),
  duels: () => page("Дуэли", "Дуэли проводятся в разрешённых чатах D-COINS.", `<div class="notice"><b>⚔</b><span>Минимальная ставка — 5 DC, максимальная — 100 000 DC. Комиссии нет.</span></div>`),
  "mini-events": () => page("Мини-ивенты", "Активные мини-ивенты публикуются в новостном канале.", `<div class="notice"><b>⚡</b><span>Когда ивент начнётся, здесь появится его карточка и кнопка участия.</span></div>`),
  help: () => page("Как играть", "Короткие правила без лишнего.", `<div class="list">${["Игры","Кейсы","Бустеры","Джекпот дня","Промокоды"].map((x,i)=>`<div class="list-row">${icon(i+1)}<span class="row-main"><strong>${x}</strong><span>${helpText(x)}</span></span></div>`).join("")}</div>`),
  "jackpot-top": () => page("Топ билетов", "Участники сегодняшнего джекпота.", `<div class="notice"><b>⌾</b><span>Данные появятся после подключения к базе бота.</span></div>`),
  "jackpot-winners": () => page("Победители", "Последние выигрыши джекпота.", `<div class="notice"><b>★</b><span>История появится после подключения к базе бота.</span></div>`),
};

function page(title, lead, content) { return `<div class="page-head"><div class="eyebrow">D-COINS</div><h1>${title}</h1><p class="lead">${lead}</p></div>${content}`; }
function caseCard(letter, title, price, view) { return `<button class="case-card" type="button" data-view="${view}"><span class="case-icon">${letter}</span><h3>${title}</h3><p>Награды, подарки и бустеры</p><span class="price">${price}</span></button>`; }
function boosters() {
  if (!state.boosters.length) return '<div class="notice"><b>⌁</b><span>В инвентаре пока нет бустеров.</span></div>';
  return state.boosters.map((b) => `<button class="list-row" type="button" data-action="booster" data-booster-id="${b.id}" data-booster="${b.title}">${icon("⚡")}<span class="row-main"><strong>${b.title} ×${b.amount}</strong><span>${b.description}</span></span><span class="row-side">Выбрать</span></button>`).join("");
}
function helpText(name) { return ({"Игры":"Ставка списывается с реального баланса.","Кейсы":"Открывай кейсы и получай награды.","Бустеры":"Выбери один бустер перед игрой.","Джекпот дня":"Билеты выдаются за проигрыши в играх.","Промокоды":"Активируй код в разделе профиля."})[name]; }
function format(value) { return new Intl.NumberFormat("ru-RU").format(value); }

function render() {
  const view = state.view;
  if (view.startsWith("play:")) return renderGame(view.split(":")[1]);
  if (view.startsWith("case:")) return renderCase(view.split(":")[1]);
  if (view === "pandora") return renderPandora();
  document.querySelector("#screen").innerHTML = views[view] ? views[view]() : views.home();
  document.querySelectorAll(".nav-item").forEach((node) => node.classList.toggle("active", node.dataset.view === view));
  if (view === "top" && !state.top.length) loadTop();
}
function renderGame(game) { const names={slots:"Слоты",roulette:"Рулетка",dice:"Кубик",mines:"Мины",coinflip:"Орёл и решка",scratch:"Скретч-карты",lottery:"Лотерея 5×5",crash:"Crash"}; document.querySelector("#screen").innerHTML = page(names[game], "Введи любую сумму ставки. Минимум — 5 DC.", `<div class="modal"><h2>${names[game]}</h2><p>${state.booster ? `Активный бустер: ${state.booster}.` : "Бустер не выбран."}</p><div class="section"><input class="input" inputmode="numeric" placeholder="Сумма ставки" /></div><div class="modal-actions">${btn("Начать игру", "game-start", "primary")}${btn("К играм", "games")}</div></div>`); }
function renderCase(id) { const data={blood:["BLOOD","5 000 DC"],pantera:["PANTERA","10 000 DC"],spider_man:["SPIDER MAN","7 500 DC"]}[id]; document.querySelector("#screen").innerHTML = page(data[0], "Награды определяются шансами, настроенными в боте.", `<div class="modal"><h2>${data[0]}</h2><p>Стоимость: ${data[1]}. Среди наград — D-COINS, подарки и бустеры.</p><div class="modal-actions">${btn("Открыть кейс", "case-open", "primary")}${btn("Все кейсы", "cases")}</div></div>`); }
function renderPandora() { document.querySelector("#screen").innerHTML = page("Ящик Пандоры", "Бесплатный ящик можно открыть раз в 5 дней.", `<div class="modal"><h2>Ящик Пандоры</h2><p>Внутри могут быть D-COINS, ключи кейсов, подарки и бустеры.</p><div class="modal-actions">${btn("Открыть бесплатно", "pandora-open", "primary")}${btn("К кейсам", "cases")}</div></div>`); }

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-view], [data-action]");
  if (!target) return;
  if (target.dataset.view === "toggle-privacy") {
    setPrivacy(!state.hiddenBalance);
    return;
  }
  if (["game-start", "case-open", "pandora-open", "promo-activate", "support-send"].includes(target.dataset.view)) {
    alert("Действие будет выполняться через защищённый API бота после подключения Mini App.");
    return;
  }
  if (target.dataset.view) { state.view = target.dataset.view; render(); return; }
  if (target.dataset.action === "booster") { selectBooster(target.dataset.boosterId, target.dataset.booster); return; }
  alert("Действие будет выполняться через защищённый API бота после подключения Mini App.");
});

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "X-Telegram-Init-Data": state.initData, "Content-Type": "application/json", ...(options.headers || {}) } });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
async function syncProfile() {
  if (!state.initData) return;
  const data = await api("/api/me");
  state.displayName = data.user.name;
  state.balance = data.balance.shown;
  state.hiddenBalance = data.balance.hidden;
  state.boosters = data.boosters;
  state.booster = data.active_booster ? (data.boosters.find((x) => x.id === data.active_booster)?.title || data.active_booster) : null;
}
async function selectBooster(boosterId, title) {
  try {
    if (state.initData) await api("/api/booster/select", { method: "POST", body: JSON.stringify({ booster_id: boosterId }) });
    state.booster = title;
    render();
  } catch { alert("Не удалось выбрать бустер."); }
}
async function setPrivacy(hidden) {
  try {
    if (state.initData) await api("/api/privacy", { method: "POST", body: JSON.stringify({ hidden }) });
    state.hiddenBalance = hidden;
    state.view = "profile";
    render();
  } catch { alert("Не удалось изменить настройки баланса."); }
}
async function loadTop() {
  try {
    if (!state.initData) return;
    state.top = (await api("/api/top")).players;
    if (state.view === "top") render();
  } catch { /* the empty state remains visible until the next refresh */ }
}
async function bootstrap() {
  const webApp = window.Telegram?.WebApp;
  state.initData = webApp?.initData || "";
  webApp?.ready();
  webApp?.expand();
  try { await syncProfile(); } catch { /* local design preview stays usable without Telegram */ }
  render();
}
bootstrap();
