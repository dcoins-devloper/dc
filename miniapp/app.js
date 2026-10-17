/* D-COINS Mini App UI. API calls are intentionally isolated for binding to the bot backend. */
const state = {
  view: "home",
  balance: 0,
  displayName: "Игрок",
  hiddenBalance: false,
  isAdmin: false,
  booster: null,
  boosters: [],
  caseKeys: {},
  pandoraRemaining: 0,
  jackpot: null,
  jackpotTop: null,
  jackpotWinners: null,
  supportAccess: false,
  adminOverview: null,
  top: [],
  initData: "",
  activeGame: null,
  minesGame: null,
  crashGame: null,
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
  inventory: () => page("Инвентарь", "Твои полученные бустеры и ключи кейсов.", `<div class="stat-row"><div class="stat"><b>${state.boosters.reduce((sum, b) => sum + Number(b.amount || 0), 0)}</b><small>Бустеров</small></div><div class="stat"><b>${Object.values(state.caseKeys).reduce((sum, n) => sum + Number(n || 0), 0)}</b><small>Ключей кейсов</small></div><div class="stat"><b>${escapeHtml(state.booster || "—")}</b><small>Активный</small></div></div><div class="section list">${state.boosters.map(b => `<div class="list-row">${icon("⚡")}<span class="row-main"><strong>${escapeHtml(b.title)} ×${b.amount}</strong><span>${escapeHtml(b.description)}</span></span><span class="tag amber">${b.amount}</span></div>`).join("") || '<div class="notice"><b>⌁</b><span>Бустеров пока нет.</span></div>'}${Object.entries(state.caseKeys).filter(([,n]) => Number(n) > 0).map(([id,n]) => `<div class="list-row">${icon("▣")}<span class="row-main"><strong>${escapeHtml(({blood:"BLOOD",pantera:"PANTERA",spider_man:"SPIDER MAN"})[id] || id)}</strong><span>Ключи кейса</span></span><span class="tag amber">×${n}</span></div>`).join("")}</div>`),
  jackpot: () => page("Джекпот дня", "Розыгрыш проходит каждый день в 00:00 по Москве.", `<div class="balance-card"><div class="balance-label">Твои билеты сегодня</div><div class="balance-number">${format(state.jackpot?.tickets ?? 0)} <small>из 20</small></div><p class="lead">Призовой фонд: ${format(state.jackpot?.pool ?? 0)} DC · участников: ${format(state.jackpot?.players ?? 0)}</p></div><div class="section list"><button class="list-row" data-view="jackpot-top">${icon("#")}<span class="row-main"><strong>Топ билетов</strong><span>Участники сегодняшнего розыгрыша</span></span><span class="row-side">›</span></button><button class="list-row" data-view="jackpot-winners">${icon("★")}<span class="row-main"><strong>Победители</strong><span>История последних выигрышей</span></span><span class="row-side">›</span></button></div>`),
  buy: () => page("Купить D-COINS", "Покупка за Telegram Stars.", `<div class="list">${[100,200,300,400,500,600,700,800,900,1000].map(n => `<button class="list-row" data-action="buy" data-amount="${n * 1000}">${icon("✦")}<span class="row-main"><strong>${n} 000 DC</strong><span>Пополнение баланса</span></span><span class="tag amber">${n * 2} ⭐</span></button>`).join("")}</div>`),
  transfer: () => page("Перевод D-COINS", "Переводи DC игрокам, которых бот знает по @username или Telegram ID.", `<div class="modal"><h2>Новый перевод</h2><div class="section"><input class="input" id="transfer-recipient" placeholder="@username или Telegram ID" autocomplete="off" maxlength="64" /></div><div class="section"><input class="input" id="transfer-amount" type="number" min="1" step="1" placeholder="Сумма в DC" /></div><p class="lead">Твой баланс: ${format(state.balance)} DC. Перевод нельзя отправить самому себе; сумма проверяется сервером.</p><div class="modal-actions"><button class="button primary" data-action="transfer-send">Перевести</button>${btn("Назад в профиль","profile")}</div></div>`),
  profile: () => page("Профиль", "Управление балансом и игровым аккаунтом.", `<div class="balance-card"><div class="balance-label">Текущий баланс</div><div class="balance-number">${state.hiddenBalance ? "••••••" : `${format(state.balance)} <small>DC</small>`}</div><div class="balance-actions">${btn(state.hiddenBalance ? "Показать в топе" : "Скрыть в топе", "toggle-privacy")}</div></div><div class="section list"><button class="list-row" data-view="top">${icon("#")}<span class="row-main"><strong>Топ игроков</strong><span>Рейтинг по D-COINS</span></span><span class="row-side">›</span></button><button class="list-row" data-view="transfer">${icon("⇄")}<span class="row-main"><strong>Перевести DC</strong><span>Отправить монеты другому игроку</span></span><span class="row-side">›</span></button><button class="list-row" data-action="daily-bonus">${icon("🎁")}<span class="row-main"><strong>Ежедневный бонус</strong><span>Получить монеты и шанс, если доступно</span></span><span class="row-side">›</span></button><button class="list-row" data-view="promo">${icon("⌁")}<span class="row-main"><strong>Промокод</strong><span>Активировать код</span></span><span class="row-side">›</span></button><button class="list-row" data-view="support">${icon("?")}<span class="row-main"><strong>Чат с администратором</strong><span>Доступен при разрешении</span></span><span class="row-side">›</span></button></div>`),
  more: () => page("Ещё", "Дополнительные разделы D-COINS.", `<div class="list"><button class="list-row" data-view="inventory">${icon("▦")}<span class="row-main"><strong>Инвентарь</strong><span>Бустеры и ключи кейсов</span></span><span class="row-side">›</span></button><button class="list-row" data-view="duels">${icon("⚔")}<span class="row-main"><strong>Дуэли</strong><span>Игры с другими участниками</span></span><span class="row-side">›</span></button><button class="list-row" data-view="mini-events">${icon("⚡")}<span class="row-main"><strong>Мини-ивенты</strong><span>Активности из канала</span></span><span class="row-side">›</span></button><button class="list-row" data-view="help">${icon("i")}<span class="row-main"><strong>Как играть</strong><span>Короткие правила</span></span><span class="row-side">›</span></button>${state.isAdmin ? `<button class="list-row" data-view="admin">${icon("⚙")}<span class="row-main"><strong>Админ-панель</strong><span>Управление ботом</span></span><span class="row-side">›</span></button>` : ""}</div>`),
  admin: () => page("Админ-панель", "Управление доступно только владельцу бота.", `<div class="list"><button class="list-row" data-view="admin-users">${icon("♙")}<span class="row-main"><strong>Пользователи</strong><span>Баланс, блокировки и VIP</span></span><span class="row-side">›</span></button><button class="list-row" data-view="admin-economy">${icon("◈")}<span class="row-main"><strong>Экономика</strong><span>Цены Stars и шансы кейсов</span></span><span class="row-side">›</span></button><button class="list-row" data-view="admin-promos">${icon("⌁")}<span class="row-main"><strong>Промокоды и раздачи</strong><span>Создание и управление</span></span><span class="row-side">›</span></button><button class="list-row" data-view="admin-settings">${icon("⚙")}<span class="row-main"><strong>Настройки</strong><span>Сервисные действия</span></span><span class="row-side">›</span></button></div>`),
  top: () => page("Топ игроков", "Баланс скрытых игроков не раскрывается.", `<div class="list">${state.top.length ? state.top.map((player, i) => `<div class="list-row">${icon(i + 1)}<span class="row-main"><strong>${escapeHtml(player.name)}</strong><span>${player.hidden && player.balance === null ? "🔒 Скрыто" : `${format(player.balance)} DC`}</span></span>${i === 0 ? '<span class="tag amber">Лидер</span>' : ""}</div>`).join("") : '<div class="notice"><b>⌁</b><span>Загружаем рейтинг…</span></div>'}</div>`),
  promo: () => page("Промокод", "Введи код, который получил в канале или у администрации.", `<div class="modal"><h2>Активация промокода</h2><p>Код можно активировать один раз, если его лимит ещё не исчерпан.</p><div class="section"><input class="input" id="promo-code" placeholder="Введите код" autocomplete="off" maxlength="32" /></div><div class="modal-actions">${btn("Активировать", "promo-activate", "primary")}</div></div>`),
  support: () => page("Чат с администратором", state.supportAccess ? "Напиши сообщение — оно попадёт администратору в боте." : "Для доступа к диалогу требуется разрешение администрации.", state.supportAccess ? `<div class="modal"><h2>Диалог с поддержкой</h2><p>Не отправляй коды входа Telegram, пароль 2FA или строку сессии.</p><div class="section"><textarea class="input" id="support-message" rows="4" maxlength="2000" placeholder="Напиши сообщение..."></textarea></div><div class="modal-actions"><button class="button primary" data-action="support-send">Отправить</button><button class="button secondary" data-action="support-close">Закрыть диалог</button></div></div>` : `<div class="notice"><b>i</b><span>Доступ пока не выдан. Обратись к администратору через бота.</span></div>`),
  duels: () => page("Дуэли", "Дуэли проводятся в разрешённых чатах D-COINS.", `<div class="notice"><b>⚔</b><span>Минимальная ставка — 5 DC, максимальная — 100 000 DC. Комиссии нет.</span></div>`),
  "mini-events": () => page("Мини-ивенты", "Активные мини-ивенты публикуются в новостном канале.", `<div class="notice"><b>⚡</b><span>Когда ивент начнётся, здесь появится его карточка и кнопка участия.</span></div>`),
  help: () => page("Как играть", "Короткие правила без лишнего.", `<div class="list">${["Игры","Кейсы","Бустеры","Джекпот дня","Промокоды"].map((x,i)=>`<div class="list-row">${icon(i+1)}<span class="row-main"><strong>${x}</strong><span>${helpText(x)}</span></span></div>`).join("")}</div>`),
  "jackpot-top": () => page("Топ билетов", "Участники сегодняшнего джекпота.", `<div class="list">${state.jackpotTop?.length ? state.jackpotTop.map((p,i) => `<div class="list-row">${icon(i+1)}<span class="row-main"><strong>${escapeHtml(p.name)}</strong><span>Билеты за сегодня</span></span><span class="tag amber">${p.tickets}</span></div>`).join("") : '<div class="notice"><b>⌾</b><span>Пока нет участников с билетами.</span></div>'}</div>`),
  "jackpot-winners": () => page("Победители", "Последние выигрыши джекпота.", `<div class="list">${state.jackpotWinners?.length ? state.jackpotWinners.map(p => `<div class="list-row">${icon("★")}<span class="row-main"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.date)}</span></span><span class="tag amber">${format(p.prize)} DC</span></div>`).join("") : '<div class="notice"><b>★</b><span>История выигрышей пока пуста.</span></div>'}</div>`),
  "admin-users": () => page("Пользователи", "Действия доступны только владельцу бота.", `<div class="modal"><h2>Управление аккаунтом</h2><div class="section"><input class="input" id="admin-user-id" type="number" min="1" placeholder="Telegram ID пользователя" /></div><div class="section"><input class="input" id="admin-amount" type="number" min="1" placeholder="Сумма DC (для изменения баланса)" /></div><div class="section list"><button class="button primary" data-action="admin-do" data-admin-action="add_coins">Начислить DC</button><button class="button secondary" data-action="admin-do" data-admin-action="remove_coins">Снять DC</button><button class="button secondary" data-action="admin-do" data-admin-action="grant_support">Выдать доступ к поддержке</button><button class="button secondary" data-action="admin-do" data-admin-action="revoke_support">Забрать доступ к поддержке</button><button class="button danger" data-action="admin-do" data-admin-action="ban">Заблокировать</button><button class="button secondary" data-action="admin-do" data-admin-action="unban">Разблокировать</button><button class="button primary" data-action="admin-do" data-admin-action="vip">Выдать VIP</button><button class="button secondary" data-action="admin-do" data-admin-action="unvip">Снять VIP</button></div></div>`),
  "admin-economy": () => page("Экономика", "Управление ценами и шансами.", `<div class="notice"><b>◈</b><span>Изменения будут защищены проверкой администратора.</span></div>`),
  "admin-promos": () => page("Промокоды и раздачи", "Сводка активных промокодов из базы бота.", `<div class="stat-row"><div class="stat"><b>${state.adminOverview?.players ?? "—"}</b><small>Игроков</small></div><div class="stat"><b>${state.adminOverview?.pending_gifts ?? "—"}</b><small>Подарков в очереди</small></div><div class="stat"><b>${state.adminOverview?.premium_orders ?? "—"}</b><small>Premium-заявок</small></div></div><div class="section list">${(state.adminOverview?.promos || []).map(p => `<div class="list-row">${icon("⌁")}<span class="row-main"><strong>${escapeHtml(p.code)}</strong><span>${escapeHtml(String(p.reward))} · ${escapeHtml(p.type)} · ${p.uses}/${p.max_uses}</span></span></div>`).join("") || '<div class="notice"><b>⌁</b><span>Нет данных. Открой раздел, будучи администратором, и обнови страницу.</span></div>'}</div><div class="section"><button class="button secondary wide" data-action="admin-refresh">Обновить сводку</button></div>`),
  "admin-settings": () => page("Заявки и подарки", "Обработка очереди подарков и Premium-заявок.", `<div class="section-title"><h2>Подарки в очереди</h2></div><div class="list">${(state.adminOverview?.pending_gift_items || []).map(item => `<div class="list-row"><span class="row-main"><strong>#${item.id} · ${escapeHtml(item.user_name)} (${item.user_id})</strong><span>${escapeHtml(item.gift_id)} · ${escapeHtml(item.reason || "")}</span></span><button class="button primary" data-action="admin-do" data-admin-action="deliver_pending_gift" data-item-id="${item.id}">Выдать</button><button class="button secondary" data-action="admin-do" data-admin-action="delete_pending_gift" data-item-id="${item.id}">Удалить</button></div>`).join("") || '<div class="notice"><b>✓</b><span>Нет подарков в очереди.</span></div>'}</div><div class="section-title"><h2>Premium-заявки</h2></div><div class="list">${(state.adminOverview?.premium_order_items || []).map(item => `<div class="list-row"><span class="row-main"><strong>#${item.id} · ${escapeHtml(item.user_name)} (${item.user_id})</strong><span>${format(item.cost)} DC</span></span><button class="button primary" data-action="admin-do" data-admin-action="premium_done" data-item-id="${item.id}">Выдан</button><button class="button secondary" data-action="admin-do" data-admin-action="premium_refund" data-item-id="${item.id}">Возврат</button></div>`).join("") || '<div class="notice"><b>✓</b><span>Нет Premium-заявок.</span></div>'}</div><div class="section"><button class="button secondary wide" data-action="admin-refresh">Обновить заявки</button></div>`),
};

function page(title, lead, content) { return `<div class="page-head"><div class="eyebrow">D-COINS</div><h1>${title}</h1><p class="lead">${lead}</p></div>${content}`; }
function caseCard(letter, title, price, view) { return `<button class="case-card" type="button" data-view="${view}"><span class="case-icon">${letter}</span><h3>${title}</h3><p>Награды, подарки и бустеры</p><span class="price">${price}</span></button>`; }
function boosters() {
  if (!state.boosters.length) return '<div class="notice"><b>⌁</b><span>В инвентаре пока нет бустеров.</span></div>';
  return state.boosters.map((b) => `<button class="list-row" type="button" data-action="booster" data-booster-id="${b.id}" data-booster="${b.title}">${icon("⚡")}<span class="row-main"><strong>${b.title} ×${b.amount}</strong><span>${b.description}</span></span><span class="row-side">Выбрать</span></button>`).join("");
}
function helpText(name) { return ({"Игры":"Ставка списывается с реального баланса.","Кейсы":"Открывай кейсы и получай награды.","Бустеры":"Выбери один бустер перед игрой.","Джекпот дня":"Билеты выдаются за проигрыши в играх.","Промокоды":"Активируй код в разделе профиля."})[name]; }
function format(value) { return new Intl.NumberFormat("ru-RU").format(value); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"})[char]); }

function render() {
  const view = state.view;
  if (view === "mines-active") return renderMines();
  if (view === "crash-active") return renderCrash();
  if (view.startsWith("play:")) return renderGame(view.split(":")[1]);
  if (view.startsWith("case:")) return renderCase(view.split(":")[1]);
  if (view === "pandora") return renderPandora();
  document.querySelector("#screen").innerHTML = views[view] ? views[view]() : views.home();
  document.querySelectorAll(".nav-item").forEach((node) => node.classList.toggle("active", node.dataset.view === view));
  if (view === "top" && !state.top.length) loadTop();
  if (["jackpot", "jackpot-top", "jackpot-winners"].includes(view) && state.jackpotTop === null) loadJackpot();
  if (["admin-promos", "admin-settings"].includes(view) && state.isAdmin && !state.adminOverview) loadAdminOverview();
}
function renderGame(game) {
  const names={slots:"Слоты",roulette:"Рулетка",dice:"Кубик",mines:"Мины",coinflip:"Орёл и решка",scratch:"Скретч-карты",lottery:"Лотерея 5×5",crash:"Crash"};
  if (game === "crash") {
    document.querySelector("#screen").innerHTML = page(names[game], "Выбери режим, ставку и решай, когда забрать выигрыш.", `<div class="modal"><h2>Crash</h2><div class="grid two"><button class="button secondary" data-action="crash-mode" data-mode="normal">🚀 Обычный полёт</button><button class="button secondary" data-action="crash-mode" data-mode="turbo">⚡ Турбо</button></div><div class="section"><input id="game-bet" class="input" type="number" min="5" step="1" inputmode="numeric" placeholder="Сумма ставки" /></div><div class="modal-actions"><button class="button primary" data-action="crash-start">Начать Crash</button>${btn("К играм", "games")}</div></div>`);
    return;
  }
  if (game === "mines") {
    document.querySelector("#screen").innerHTML = page(names[game], "Открывай безопасные клетки и забирай выигрыш в любой момент.", `<div class="modal"><h2>Минное поле 5×5</h2><p>На поле ${8} мин. Минимальная ставка — ${format(5)} DC.</p><div class="section"><input id="game-bet" class="input" type="number" min="5" step="1" inputmode="numeric" placeholder="Сумма ставки" /></div><div class="modal-actions"><button class="button primary" data-action="mines-start">Начать игру</button>${btn("К играм", "games")}</div></div>`);
    return;
  }
  const options={slots:[["spin","Крутить барабаны"]],roulette:[["red","🔴 Красное"],["black","⚫ Чёрное"],["green","🟢 Зелёное · ×3"]],dice:[["1","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"]],coinflip:[["heads","🦅 Орёл"],["tails","🔵 Решка"]],scratch:[["reveal","Открыть скретч-карту"]],lottery:Array.from({length:25},(_,i)=>[String(i),`Билет ${i+1}`])}[game];
  if (!options) { document.querySelector("#screen").innerHTML = page(names[game], "Этот режим переносится следующим — остальные игры уже доступны в боте.", `${btn("К играм", "games")}`); return; }
  document.querySelector("#screen").innerHTML = page(names[game], "Минимальная ставка — 5 DC.", `<div class="modal"><h2>${names[game]}</h2><p>${state.booster ? `Активный бустер: ${state.booster}.` : "Бустер не выбран."}</p><div class="section"><select id="game-option" class="input">${options.map(([value,label])=>`<option value="${value}">${label}</option>`).join("")}</select></div><div class="section"><input id="game-bet" class="input" inputmode="numeric" placeholder="Сумма ставки" /></div><div class="modal-actions"><button class="button primary" data-action="play-game" data-game="${game}">Начать игру</button>${btn("К играм", "games")}</div></div>`);
}
function renderCase(id) { const data={blood:["BLOOD","5 000 DC"],pantera:["PANTERA","10 000 DC"],spider_man:["SPIDER MAN","7 500 DC"]}[id]; document.querySelector("#screen").innerHTML = page(data[0], "Награды определяются шансами, настроенными в боте.", `<div class="modal"><h2>${data[0]}</h2><p>Стоимость: ${data[1]}. Среди наград — D-COINS, подарки и бустеры.</p><div class="modal-actions">${btn("Открыть кейс", "case-open", "primary")}${btn("Все кейсы", "cases")}</div></div>`); }
function renderPandora() { document.querySelector("#screen").innerHTML = page("Ящик Пандоры", "Бесплатный ящик можно открыть раз в 5 дней.", `<div class="modal"><h2>Ящик Пандоры</h2><p>Внутри могут быть D-COINS, ключи кейсов, подарки и бустеры.</p><div class="modal-actions">${btn("Открыть бесплатно", "pandora-open", "primary")}${btn("К кейсам", "cases")}</div></div>`); }

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-view], [data-action]");
  if (!target) return;
  if (target.dataset.view === "toggle-privacy") { setPrivacy(!state.hiddenBalance); return; }
  if (target.dataset.view === "case-open") { openCase(); return; }
  if (target.dataset.view === "pandora-open") { openPandora(); return; }
  if (target.dataset.view === "promo-activate") { redeemPromo(); return; }

  if (target.dataset.action === "transfer-send") { transferCoins(); return; }
  if (target.dataset.action === "support-send") { sendSupportMessage(); return; }
  if (target.dataset.action === "support-close") { closeSupportChat(); return; }
  if (target.dataset.action === "daily-bonus") { claimDailyBonus(); return; }
  if (target.dataset.action === "mines-start") { startMines(); return; }
  if (target.dataset.action === "crash-mode") { state.crashMode = target.dataset.mode; document.querySelectorAll("[data-action='crash-mode']").forEach(node => node.classList.toggle("primary", node.dataset.mode === state.crashMode)); return; }
  if (target.dataset.action === "crash-start") { startCrash(); return; }
  if (target.dataset.action === "crash-forward") { crashAction("forward"); return; }
  if (target.dataset.action === "crash-cashout") { crashAction("cashout"); return; }
  if (target.dataset.action === "mines-cell") { minesAction("cell", Number(target.dataset.cell)); return; }
  if (target.dataset.action === "mines-cashout") { minesAction("cashout"); return; }
  if (target.dataset.action === "play-game") { playGame(target.dataset.game); return; }
  if (target.dataset.action === "booster") { selectBooster(target.dataset.boosterId, target.dataset.booster); return; }
  if (target.dataset.action === "buy") { purchaseStars(Number(target.dataset.amount)); return; }
  if (target.dataset.action === "admin-refresh") { loadAdminOverview(); return; }
  if (target.dataset.action === "admin-do") { runAdminAction(target.dataset.adminAction, target.dataset.itemId); return; }
  if (target.dataset.view) { state.view = target.dataset.view; render(); return; }
});

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "X-Telegram-Init-Data": state.initData, "Content-Type": "application/json", ...(options.headers || {}) } });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
async function syncProfile() {
  if (!state.initData) return;
  const data = await api("/api/me");
  state.displayName = escapeHtml(data.user.name);
  state.balance = data.balance.shown;
  state.hiddenBalance = data.balance.hidden;
  state.isAdmin = Boolean(data.is_admin);
  state.boosters = data.boosters || [];
  state.caseKeys = data.case_keys || {};
  state.pandoraRemaining = Number(data.pandora_remaining || 0);
  state.jackpot = data.jackpot || null;
  state.supportAccess = Boolean(data.support_access);
  state.booster = data.active_booster ? (state.boosters.find((x) => x.id === data.active_booster)?.title || data.active_booster) : null;
}
function showNotice(title, message, actions = `${btn("На главную", "home", "primary")}`) {
  document.querySelector("#screen").innerHTML = page(title, message, `<div class="modal"><div class="modal-actions">${actions}</div></div>`);
}
function describePrize(prize) {
  if (!prize) return "Награда не указана.";
  const amount = Number(prize.amount || 0);
  if (prize.kind === "coins") return `Награда: ${format(amount)} DC.`;
  if (prize.kind === "booster") return `Бустер: ${prize.booster || amount}.`;
  if (prize.kind === "key") return `Ключ от кейса: ${prize.case || amount}.`;
  if (prize.kind === "chance") return `Шанс обновлён: ${prize.chance ?? amount}.`;
  if (prize.kind === "gift") return prize.delivery === "pending" ? "Подарок сохранён в очереди на выдачу." : "Подарок отправлен или поставлен в очередь на выдачу.";
  if (prize.kind === "premium") return `Создана заявка на Premium №${prize.order_id}.`;
  return `Награда: ${amount}.`;
}
async function openCase() {
  const id = state.view.startsWith("case:") ? state.view.split(":")[1] : "";
  try {
    const data = await api("/api/case/open", { method: "POST", body: JSON.stringify({ case_id: id }) });
    state.balance = data.balance;
    await syncProfile();
    showNotice("Кейс открыт!", `${({blood:"BLOOD",pantera:"PANTERA",spider_man:"SPIDER MAN"})[id] || id}: ${describePrize(data.prize)} Баланс: ${format(data.balance)} DC.`, `${btn("Открыть ещё", `case:${id}`, "primary")}${btn("Все кейсы", "cases")}`);
  } catch (error) { alert(error.message || "Не удалось открыть кейс."); }
}
async function openPandora() {
  try {
    const data = await api("/api/pandora/open", { method: "POST" });
    state.balance = data.balance;
    state.pandoraRemaining = Number(data.remaining || 0);
    await syncProfile();
    showNotice("Ящик Пандоры открыт!", `${describePrize(data.prize)} Баланс: ${format(data.balance)} DC.`, btn("К кейсам", "cases", "primary"));
  } catch (error) { alert(error.message || "Не удалось открыть ящик Пандоры."); }
}
async function redeemPromo() {
  const input = document.querySelector("#screen input");
  const code = input?.value?.trim();
  if (!code) { alert("Введи промокод."); return; }
  try {
    const data = await api("/api/promo/redeem", { method: "POST", body: JSON.stringify({ code }) });
    state.balance = data.balance;
    await syncProfile();
    const reward = data.reward_type === "coins" ? `${format(Number(data.reward || 0))} DC` : data.reward_type === "case" ? `${data.case_count} кейс(а): ${data.case_id}` : String(data.reward || data.reward_type);
    showNotice("Промокод активирован", `Код ${data.code} принят. Награда: ${reward}. Баланс: ${format(data.balance)} DC.`, btn("В профиль", "profile", "primary"));
  } catch (error) { alert(error.message || "Не удалось активировать промокод."); }
}

function renderCrash() {
  const game = state.crashGame;
  if (!game) { state.view = "play:crash"; render(); return; }
  const multiplier = Number(game.multiplier || 1).toFixed(2);
  const summary = game.finished
    ? `<div class="notice"><b>${game.won ? "✓" : "×"}</b><span>${game.won ? `Выигрыш: ${format(game.prize || 0)} DC` : "Взрыв! Ставка проиграна."} Баланс: ${format(game.balance)} DC.</span></div>`
    : `<div class="notice"><b>🚀</b><span>Высота: ${game.height} м · коэффициент ×${multiplier} · можно забрать ${format(game.current_prize)} DC.</span></div>`;
  document.querySelector("#screen").innerHTML = page("Crash", `Режим: ${game.mode === "turbo" ? "Турбо" : "Обычный"} · ставка ${format(game.bet)} DC`, `<div class="balance-card"><div class="balance-label">Текущий коэффициент</div><div class="balance-number">×${multiplier}</div><p class="lead">Чем дальше летит ракета, тем выше потенциальный выигрыш.</p></div><div class="section">${summary}</div><div class="modal-actions">${game.finished ? `<button class="button primary" data-view="play:crash">Играть ещё</button>${btn("Все игры", "games")}` : `<button class="button primary" data-action="crash-forward">🚀 Вперёд</button><button class="button secondary" data-action="crash-cashout">Забрать ${format(game.current_prize)} DC</button>`}</div>`);
}
async function startCrash() {
  const bet = Number(document.querySelector("#game-bet")?.value);
  const mode = state.crashMode || "normal";
  if (!Number.isSafeInteger(bet) || bet < 5) { alert("Минимальная ставка — 5 DC."); return; }
  try {
    state.crashGame = await api("/api/crash/start", { method: "POST", body: JSON.stringify({ bet, mode }) });
    await syncProfile().catch(() => {});
    state.balance = state.crashGame.balance;
    state.view = "crash-active";
    render();
  } catch (error) { alert(error.message || "Не удалось начать Crash."); }
}
async function crashAction(action) {
  if (!state.crashGame) return;
  try {
    const data = await api("/api/crash/action", { method: "POST", body: JSON.stringify({ token: state.crashGame.token, action }) });
    state.crashGame = data;
    state.balance = data.balance;
    if (data.finished) await syncProfile().catch(() => {});
    if (data.continued_by_booster) alert("Бустер «Повтор» спас игру. Продолжай!");
    render();
  } catch (error) { alert(error.message || "Не удалось выполнить действие Crash."); }
}

function renderMines() {
  const game = state.minesGame;
  if (!game) { state.view = "play:mines"; render(); return; }
  const cells = (game.cells || []).map((cell, index) => {
    const label = cell === "mine" ? "💣" : cell === "safe" ? "✓" : cell === "opened" ? "✓" : "❔";
    const disabled = game.finished || cell !== "hidden";
    const cellClass = cell === "hidden" ? "covered" : cell;
    return `<button class="mine-cell ${cellClass}" type="button" data-action="mines-cell" data-cell="${index}" ${disabled ? "disabled" : ""} aria-label="Клетка ${index + 1}">${label}</button>`;
  }).join("");
  const result = game.finished
    ? `<div class="notice"><b>${game.won ? "✓" : "×"}</b><span>${game.won ? `Выигрыш: ${format(game.prize || 0)} DC` : `Ставка проиграна${game.refund ? `. Возврат: ${format(game.refund)} DC` : ""}`}. Баланс: ${format(game.balance)} DC.</span></div>`
    : `<div class="notice"><b>💰</b><span>Открыто безопасных клеток: ${game.safe_opened}. Потенциальный выигрыш: ${format(game.current_prize)} DC.</span></div>`;
  document.querySelector("#screen").innerHTML = page("Мины", `Ставка: ${format(game.bet)} DC`, `<div class="mines-grid">${cells}</div><div class="section">${result}</div><div class="modal-actions">${game.finished ? `<button class="button primary" data-view="play:mines">Играть ещё</button>${btn("Все игры", "games")}` : `<button class="button primary" data-action="mines-cashout" ${game.safe_opened < 1 ? "disabled" : ""}>Забрать ${format(game.current_prize)} DC</button>`}</div>`);
}
async function startMines() {
  const bet = Number(document.querySelector("#game-bet")?.value);
  if (!Number.isSafeInteger(bet) || bet < 5) { alert("Минимальная ставка — 5 DC."); return; }
  try {
    state.minesGame = await api("/api/mines/start", { method: "POST", body: JSON.stringify({ bet }) });
    await syncProfile().catch(() => {});
    state.balance = state.minesGame.balance;
    state.view = "mines-active";
    render();
  } catch (error) { alert(error.message || "Не удалось начать игру."); }
}
async function minesAction(action, cell) {
  if (!state.minesGame) return;
  try {
    const data = await api("/api/mines/action", { method: "POST", body: JSON.stringify({ token: state.minesGame.token, action, ...(cell === undefined ? {} : { cell }) }) });
    state.minesGame = data;
    state.balance = data.balance;
    if (data.finished) await syncProfile();
    render();
  } catch (error) { alert(error.message || "Не удалось выполнить ход."); }
}

async function sendSupportMessage() {
  const field = document.querySelector("#support-message");
  const message = field?.value?.trim();
  if (!message) { alert("Напиши сообщение."); return; }
  if (message.length > 2000) { alert("Сообщение слишком длинное."); return; }
  try {
    await api("/api/support/send", { method: "POST", body: JSON.stringify({ message }) });
    field.value = "";
    showNotice("Сообщение отправлено", "Администратор получил твоё сообщение. Ответ придёт в Telegram.", btn("Назад", "support", "primary"));
  } catch (error) { alert(error.message || "Не удалось отправить сообщение."); }
}
async function closeSupportChat() {
  try {
    await api("/api/support/close", { method: "POST", body: JSON.stringify({}) });
    showNotice("Диалог закрыт", "Диалог с администратором закрыт.", btn("В профиль", "profile", "primary"));
  } catch (error) { alert(error.message || "Не удалось закрыть диалог."); }
}

async function purchaseStars(amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) { alert("Некорректный пакет."); return; }
  const webApp = window.Telegram?.WebApp;
  if (!webApp?.openInvoice) {
    alert("Покупка Stars доступна только внутри Telegram Mini App.");
    return;
  }
  try {
    const data = await api("/api/purchase/invoice", { method: "POST", body: JSON.stringify({ amount }) });
    webApp.openInvoice(data.invoice_link, async (status) => {
      if (status === "paid") {
        try {
          await syncProfile();
          state.view = "profile";
          render();
          showNotice("Оплата принята", `Покупка на ${format(data.amount)} DC за ${data.stars} ⭐ подтверждена Telegram. Если баланс обновился не сразу, подожди несколько секунд и открой профиль снова.`, btn("В профиль", "profile", "primary"));
        } catch {
          alert("Оплата прошла. Открой профиль через несколько секунд, чтобы обновить баланс.");
        }
      } else if (status === "failed") {
        alert("Telegram не смог завершить оплату. Попробуй ещё раз.");
      }
    });
  } catch (error) {
    alert(error.message || "Не удалось создать счёт на оплату.");
  }
}

async function claimDailyBonus() {
  try {
    const data = await api("/api/bonus", { method: "POST", body: JSON.stringify({}) });
    state.balance = data.balance;
    await syncProfile();
    const details = [];
    if (data.coins_awarded) details.push(`+${format(data.coins_awarded)} DC`);
    if (data.chance_awarded) details.push(`+${Number(data.chance_awarded).toFixed(3)} к шансу`);
    if (!details.length) {
      const waits = [];
      if (data.coin_remaining) waits.push(`монеты: ${formatDuration(data.coin_remaining)}`);
      if (data.chance_remaining) waits.push(`шанс: ${formatDuration(data.chance_remaining)}`);
      showNotice("Бонус пока недоступен", waits.length ? `Следующий бонус: ${waits.join("; ")}.` : "Бонусы уже получены.", btn("В профиль", "profile", "primary"));
      return;
    }
    showNotice("Бонус получен!", `${details.join(" · ")}. Твой баланс: ${format(data.balance)} DC.`, btn("В профиль", "profile", "primary"));
  } catch (error) { alert(error.message || "Не удалось получить бонус."); }
}
function formatDuration(seconds) {
  const h = Math.floor(Number(seconds || 0) / 3600);
  const m = Math.floor((Number(seconds || 0) % 3600) / 60);
  return h ? `${h} ч. ${m} мин.` : `${m} мин.`;
}

async function transferCoins() {
  const recipient = document.querySelector("#transfer-recipient")?.value?.trim();
  const amount = Number(document.querySelector("#transfer-amount")?.value);
  if (!recipient) { alert("Укажи @username или Telegram ID получателя."); return; }
  if (!Number.isSafeInteger(amount) || amount <= 0) { alert("Сумма должна быть положительным целым числом."); return; }
  try {
    const data = await api("/api/transfer", { method: "POST", body: JSON.stringify({ recipient, amount }) });
    state.balance = data.balance;
    await syncProfile();
    showNotice("Перевод выполнен", `Отправлено ${format(data.amount)} DC пользователю ${escapeHtml(data.recipient)}. Новый баланс: ${format(data.balance)} DC.`, btn("В профиль", "profile", "primary"));
  } catch (error) { alert(error.message || "Не удалось выполнить перевод."); }
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
async function playGame(game) {
  const bet = Number(document.querySelector("#game-bet")?.value);
  const option = document.querySelector("#game-option")?.value;
  if (!Number.isInteger(bet) || bet < 5) { alert("Минимальная ставка — 5 DC."); return; }
  try {
    const data = await api("/api/game/play", { method: "POST", body: JSON.stringify({ game, bet, option }) });
    await syncProfile().catch(() => {});
    state.balance = data.balance;
    document.querySelector("#screen").innerHTML = page(data.won ? "Выигрыш" : "Раунд завершён", "Результат игры", `<div class="modal"><h2>${data.result}</h2><p>${data.won ? `✅ Выигрыш: ${format(data.prize)} DC` : `❌ Ставка проиграна${data.refund ? `. Возврат по страховке: ${format(data.refund)} DC` : ""}`}</p><p class="lead">Баланс: ${format(data.balance)} DC</p><div class="modal-actions">${btn("Играть ещё", `play:${game}`, "primary")}${btn("Все игры", "games")}</div></div>`);
  } catch (error) { alert(error.message || "Не удалось завершить игру."); }
}
async function loadJackpot() {
  try {
    const data = await api("/api/jackpot");
    state.jackpot = data.summary || state.jackpot;
    state.jackpotTop = data.top || [];
    state.jackpotWinners = data.winners || [];
    if (["jackpot", "jackpot-top", "jackpot-winners"].includes(state.view)) render();
  } catch (error) { alert(error.message || "Не удалось загрузить данные джекпота."); }
}
async function loadAdminOverview() {
  try {
    state.adminOverview = await api("/api/admin/overview");
    if (["admin-promos", "admin-settings"].includes(state.view)) render();
  } catch (error) { alert(error.message || "Не удалось загрузить админ-сводку."); }
}
async function runAdminAction(action, itemId) {
  if (!state.isAdmin) { alert("Нет доступа."); return; }
  const userId = Number(document.querySelector("#admin-user-id")?.value);
  const amount = Number(document.querySelector("#admin-amount")?.value);
  const payload = { action };
  if (itemId !== undefined) payload.item_id = Number(itemId);
  if (["add_coins", "remove_coins", "grant_support", "revoke_support", "ban", "unban", "vip", "unvip"].includes(action)) {
    if (!Number.isInteger(userId) || userId <= 0) { alert("Укажи корректный Telegram ID."); return; }
    payload.user_id = userId;
  }
  if (["add_coins", "remove_coins"].includes(action)) {
    if (!Number.isInteger(amount) || amount <= 0) { alert("Укажи положительную сумму DC."); return; }
    payload.amount = amount;
  }
  try {
    await api("/api/admin/action", { method: "POST", body: JSON.stringify(payload) });
    alert("Действие выполнено.");
    if (["admin-promos", "admin-settings"].includes(state.view)) await loadAdminOverview();
  } catch (error) { alert(error.message || "Админ-действие не выполнено."); }
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
