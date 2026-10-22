/* D-COINS Mini App UI. API calls are intentionally isolated for binding to the bot backend. */
function applyTheme(theme) {
  const selected = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = selected;
  try { localStorage.setItem("dcoins-theme", selected); } catch {}
  const toggle = document.querySelector("#theme-toggle");
  if (toggle) {
    toggle.textContent = selected === "dark" ? "☀️" : "🌙";
    toggle.setAttribute("aria-label", selected === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
    toggle.setAttribute("title", selected === "dark" ? "Светлая тема" : "Тёмная тема");
    toggle.setAttribute("aria-pressed", String(selected === "dark"));
  }
}
try {
  document.documentElement.dataset.theme = localStorage.getItem("dcoins-theme") === "dark" ? "dark" : "light";
} catch {
  document.documentElement.dataset.theme = "light";
}

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
  miniEvent: null,
  miniEventLoaded: false,
  duels: [],
  duelsLoaded: false,
  top: [],
  stats: null,
  initData: "",
  activeGame: null,
  minesGame: null,
  crashGame: null,
};

const icon = (value) => `<span class="row-icon">${value}</span>`;
const HOME_SLOGANS = [
  ["Есть стиль.", "Будет победа."],
  ["Разогрей азарт.", "Собери куш."],
  ["Делай ставку.", "Лови удачу."],
  ["Смелым везёт.", "Сегодня твой день."],
  ["Один шаг до джекпота.", "Не упусти шанс."],
  ["Крути барабаны.", "Забирай выигрыш."],
  ["Удача любит смелых.", "Проверь себя."],
  ["Твоя игра начинается.", "Действуй дерзко."],
  ["Фортуна ждёт.", "Не заставляй её скучать."],
  ["Каждый раунд — шанс.", "Используй свой."],
  ["Ставь с умом.", "Выигрывай с размахом."],
  ["Риск — это стиль.", "Победа — результат."],
  ["Сегодня в ударе ты.", "Покажи класс."],
  ["Монеты любят смелых.", "Забирай свою удачу."],
  ["Готов к победе?", "Тогда вперёд."],
];
const HOME_SLOGAN = HOME_SLOGANS[Math.floor(Math.random() * HOME_SLOGANS.length)];
const CASES = { blood: { title: "BLOOD" }, pantera: { title: "PANTERA" }, spider_man: { title: "SPIDER MAN" } };
const BOOSTERS = { double: ["×2"], insurance: ["Страховка"], free: ["Бесплатная игра"], bonus25: ["+25%"], repeat: ["Повтор"], roulette: ["Повтор рулетки"] };
const btn = (label, view, style = "secondary") => `<button class="button ${style}" type="button" data-view="${view}">${label}</button>`;
const card = (iconText, title, text, view) => `<button class="game-card" type="button" data-view="${view}"><span class="game-icon">${iconText}</span><h3>${title}</h3><p>${text}</p></button>`;

const views = {
  home: () => `
    <div class="page-head home-head"><div class="eyebrow">ТВОЯ ИГРА. ТВОИ ПРАВИЛА.</div><h1>${HOME_SLOGAN[0]}<br><span>${HOME_SLOGAN[1]}</span></h1><p class="lead">Привет, ${state.displayName}! Выбирай, во что сыграть сегодня.</p></div>
    <section class="balance-card"><div class="balance-label">Текущий баланс</div><div class="balance-number">${state.hiddenBalance ? "••••••" : `${format(state.balance)} <small>DC</small>`}</div><div class="balance-actions">${btn("Купить DC", "buy", "primary")}${btn("Баланс", "profile")}</div></section>
    <section class="section"><div class="section-title"><h2>Быстрый доступ</h2></div><div class="grid two">
      <button class="tile quick-card" type="button" data-view="games"><span class="icon">◈</span><strong>Игры</strong><small>8 игр</small></button>
      <button class="tile quick-card" type="button" data-view="cases"><span class="icon">▣</span><strong>Кейсы</strong><small>Подарки и бустеры</small></button>
      <button class="tile quick-card" type="button" data-view="jackpot"><span class="icon">⌾</span><strong>Джекпот дня</strong><small>Розыгрыш в 00:00 МСК</small></button>
      <button class="tile quick-card" type="button" data-view="boosters"><span class="icon">⚡</span><strong>Бустеры</strong><small>Усиления для игр</small></button>
    </div></section>
    <section class="section"><div class="notice"><b>i</b><span>Используй кнопки ниже, чтобы открыть игры, кейсы, инвентарь или принять участие в джекпоте.</span></div></section>`,
  games: () => page("Игровая", "Выбирай, во что сыграть.", `<div class="games-balance"><span>ИГРОВОЙ БАЛАНС</span><strong>${state.hiddenBalance ? "••••••" : format(state.balance)}</strong><small>DC · минимальная ставка 5</small></div><div class="section-title"><h2>Игры</h2></div><div class="grid two">
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
  top: () => page("Топ игроков", "Баланс скрытых игроков не раскрывается.", `<div class="list">${state.top.length ? state.top.map((player, i) => `<div class="list-row">${icon(i + 1)}<span class="row-main"><strong>${escapeHtml(player.name)}</strong><span>${player.hidden && player.balance === null ? "🔒 Скрыто" : `${format(player.balance)} DC`}</span></span>${i === 0 ? '<span class="tag amber">Лидер</span>' : ""}</div>`).join("") : '<div class="notice"><b>⌁</b><span>Загружаем рейтинг…</span></div>'}</div>`),
  stats: () => {
    const personal = state.stats?.personal;
    const rankings = state.stats?.rankings;
    const rows = (title, items, label) => `<section class="section"><div class="section-title"><h2>${title}</h2></div><div class="list">${items?.length ? items.map((item, index) => `<div class="list-row">${icon(index + 1)}<span class="row-main"><strong>${escapeHtml(item.name)}</strong><span>${label(item)}</span></span></div>`).join("") : '<div class="notice"><b>⌁</b><span>Пока нет данных.</span></div>'}</div></section>`;
    return page("Статистика и рейтинги", "Все показатели, которые раньше открывались командами /stats, /top, /winstop и /daytop.", personal ? `<div class="stat-row"><div class="stat"><b>${Number(personal.chance).toFixed(3)}</b><small>Шанс</small></div><div class="stat"><b>${format(personal.messages)}</b><small>Сообщений</small></div><div class="stat"><b>${format(personal.wins)}</b><small>Побед</small></div></div>${rows("Топ по шансу", rankings.chance, item => `${Number(item.chance).toFixed(3)} балл. · ${format(item.messages)} сообщ.`)}${rows("Топ победителей", rankings.wins, item => `${format(item.wins)} побед`)}${rows("Активные сегодня", rankings.daily, item => `${format(item.messages)} сообщений`)}` : '<div class="notice"><b>⌁</b><span>Загружаем статистику…</span></div>');
  },
  promo: () => page("Промокод", "Введи код, который получил в канале или у администрации.", `<div class="modal"><h2>Активация промокода</h2><p>Код можно активировать один раз, если его лимит ещё не исчерпан.</p><div class="section"><input class="input" id="promo-code" placeholder="Введите код" autocomplete="off" maxlength="32" /></div><div class="modal-actions">${btn("Активировать", "promo-activate", "primary")}</div></div>`),
  support: () => page("Чат с администратором", state.supportAccess ? "Напиши сообщение — оно попадёт администратору в боте." : "Для доступа к диалогу требуется разрешение администрации.", state.supportAccess ? `<div class="modal"><h2>Диалог с поддержкой</h2><p>Не отправляй коды входа Telegram, пароль 2FA или строку сессии.</p><div class="section"><textarea class="input" id="support-message" rows="4" maxlength="2000" placeholder="Напиши сообщение..."></textarea></div><div class="modal-actions"><button class="button primary" data-action="support-send">Отправить</button><button class="button secondary" data-action="support-close">Закрыть диалог</button></div></div>` : `<div class="notice"><b>i</b><span>Доступ пока не выдан. Обратись к администратору через бота.</span></div>`),
  duels: () => page("Дуэли", "Создавай вызов или принимай открытую дуэль. Победитель получает банк.", `<div class="modal"><h2>Создать дуэль</h2><p>Ставка каждого игрока: от 5 до 100 000 DC. Победитель получает сумму двух ставок.</p><div class="section"><input class="input" id="duel-bet" type="number" min="5" max="100000" step="1" placeholder="Твоя ставка" /></div><div class="modal-actions"><button class="button primary" data-action="duel-create">Создать вызов</button><button class="button secondary" data-action="duel-refresh">Обновить список</button></div></div><div class="section-title"><h2>Открытые дуэли</h2></div><div class="list">${state.duels.map(d => `<div class="list-row">${icon("⚔")}<span class="row-main"><strong>${escapeHtml(d.challenger_name)}</strong><span>Ставка ${format(d.bet)} DC · осталось ${formatDuration(d.expires_in)}</span></span>${d.mine ? `<button class="button secondary" data-action="duel-cancel" data-duel-id="${d.id}">Отменить</button>` : `<button class="button primary" data-action="duel-accept" data-duel-id="${d.id}" ${state.duels.some(x => x.mine) ? "disabled" : ""}>Принять</button>`}</div>`).join("") || '<div class="notice"><b>⚔</b><span>Открытых дуэлей пока нет.</span></div>'}</div>`),
  "mini-events": () => state.miniEvent ? page("Мини-ивенты", "Активное событие из канала D-COINS.", `<div class="modal"><h2>${({first:"Первый участник",first_n:"Первые участники",ticket:"Счастливый билет"})[state.miniEvent.kind] || "Мини-ивент"}</h2><div class="stat-row"><div class="stat"><b>${format(state.miniEvent.reward)}</b><small>Награда DC</small></div><div class="stat"><b>${state.miniEvent.participants}</b><small>Участников</small></div><div class="stat"><b>${formatDuration(state.miniEvent.ends_in)}</b><small>Осталось</small></div></div><p class="lead">${state.miniEvent.kind === "ticket" ? "После завершения система выберет победителя случайным образом." : `Награда начисляется первым ${state.miniEvent.max_participants} участникам.`}</p><div class="modal-actions"><button class="button primary" data-action="mini-event-join" data-event-id="${state.miniEvent.id}" ${state.miniEvent.joined ? "disabled" : ""}>${state.miniEvent.joined ? "Ты уже участвуешь" : "Участвовать"}</button><button class="button secondary" data-action="mini-event-refresh">Обновить</button></div></div>`) : page("Мини-ивенты", "Активные события из канала D-COINS.", `<div class="notice"><b>⚡</b><span>${state.miniEventLoaded ? "Сейчас активных мини-ивентов нет. Новые события появятся здесь автоматически после обновления." : "Загружаем активные события..."}</span></div><div class="section"><button class="button secondary wide" data-action="mini-event-refresh">Обновить</button></div>`),
  help: () => page("Как играть", "Короткие правила без лишнего.", `<div class="list">${["Игры","Кейсы","Бустеры","Джекпот дня","Промокоды"].map((x,i)=>`<div class="list-row">${icon(i+1)}<span class="row-main"><strong>${x}</strong><span>${helpText(x)}</span></span></div>`).join("")}</div>`),
  "jackpot-top": () => page("Топ билетов", "Участники сегодняшнего джекпота.", `<div class="list">${state.jackpotTop?.length ? state.jackpotTop.map((p,i) => `<div class="list-row">${icon(i+1)}<span class="row-main"><strong>${escapeHtml(p.name)}</strong><span>Билеты за сегодня</span></span><span class="tag amber">${p.tickets}</span></div>`).join("") : '<div class="notice"><b>⌾</b><span>Пока нет участников с билетами.</span></div>'}</div>`),
  "jackpot-winners": () => page("Победители", "Последние выигрыши джекпота.", `<div class="list">${state.jackpotWinners?.length ? state.jackpotWinners.map(p => `<div class="list-row">${icon("★")}<span class="row-main"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.date)}</span></span><span class="tag amber">${format(p.prize)} DC</span></div>`).join("") : '<div class="notice"><b>★</b><span>История выигрышей пока пуста.</span></div>'}</div>`),
  "admin-users": () => page("Пользователи", "Действия доступны только владельцу бота.", `<div class="modal"><h2>Управление аккаунтом</h2><div class="section"><input class="input" id="admin-user-id" type="number" min="1" placeholder="Telegram ID пользователя" /></div><div class="section"><input class="input" id="admin-amount" type="number" min="1" placeholder="Сумма DC (для изменения баланса)" /></div><div class="section list"><button class="button primary" data-action="admin-do" data-admin-action="add_coins">Начислить DC</button><button class="button secondary" data-action="admin-do" data-admin-action="remove_coins">Снять DC</button><button class="button secondary" data-action="admin-do" data-admin-action="grant_support">Выдать доступ к поддержке</button><button class="button secondary" data-action="admin-do" data-admin-action="revoke_support">Забрать доступ к поддержке</button><button class="button danger" data-action="admin-do" data-admin-action="ban">Заблокировать</button><button class="button secondary" data-action="admin-do" data-admin-action="unban">Разблокировать</button><button class="button primary" data-action="admin-do" data-admin-action="vip">Выдать VIP</button><button class="button secondary" data-action="admin-do" data-admin-action="unvip">Снять VIP</button></div></div>`),
  "admin-economy": () => page("Экономика", "Состояние экономических функций бота.", `<div class="notice"><b>i</b><span>Обмен DC на шанс, подарки и Premium сейчас отключён в конфигурации бота. Я не включаю его из Mini App, чтобы не менять экономику без отдельной проверки.</span></div><div class="section"><div class="list-row">${icon("⭐")}<span class="row-main"><strong>Покупка DC за Stars</strong><span>Доступна в разделе «Купить DC» и использует серверные счета Telegram.</span></span></div></div>`),
  "admin-promos": () => page("Промокоды и раздачи", "Создавай DC-промокоды и управляй существующими.", `<div class="stat-row"><div class="stat"><b>${state.adminOverview?.players ?? "—"}</b><small>Игроков</small></div><div class="stat"><b>${state.adminOverview?.pending_gifts ?? "—"}</b><small>Подарков в очереди</small></div><div class="stat"><b>${state.adminOverview?.premium_orders ?? "—"}</b><small>Premium-заявок</small></div></div><div class="modal"><h2>Создать DC-промокод</h2><div class="section"><input class="input" id="promo-new-code" maxlength="32" placeholder="Код, например WELCOME" /></div><div class="section"><input class="input" id="promo-new-reward" type="number" min="1" step="1" placeholder="Награда в DC" /></div><div class="section"><input class="input" id="promo-new-limit" type="number" min="1" step="1" placeholder="Лимит активаций (необязательно)" /></div><button class="button primary wide" data-action="admin-create-promo">Создать и опубликовать</button></div><div class="section list">${(state.adminOverview?.promos || []).map(p => `<div class="list-row">${icon("⌁")}<span class="row-main"><strong>${escapeHtml(p.code)}</strong><span>${escapeHtml(String(p.reward))} · ${escapeHtml(p.type)} · ${p.uses}/${p.max_uses == null ? "∞" : p.max_uses}</span></span><button class="button danger" data-action="admin-delete-promo" data-promo-code="${p.code}">Удалить</button></div>`).join("") || '<div class="notice"><b>⌁</b><span>Промокодов пока нет.</span></div>'}</div><div class="section"><button class="button secondary wide" data-action="admin-refresh">Обновить сводку</button></div>`),
  "admin-settings": () => page("Заявки и подарки", "Обработка очереди подарков и Premium-заявок.", `<div class="section-title"><h2>Подарки в очереди</h2></div><div class="list">${(state.adminOverview?.pending_gift_items || []).map(item => `<div class="list-row"><span class="row-main"><strong>#${item.id} · ${escapeHtml(item.user_name)} (${item.user_id})</strong><span>${escapeHtml(item.gift_id)} · ${escapeHtml(item.reason || "")}</span></span><button class="button primary" data-action="admin-do" data-admin-action="deliver_pending_gift" data-item-id="${item.id}">Выдать</button><button class="button secondary" data-action="admin-do" data-admin-action="delete_pending_gift" data-item-id="${item.id}">Удалить</button></div>`).join("") || '<div class="notice"><b>✓</b><span>Нет подарков в очереди.</span></div>'}</div><div class="section-title"><h2>Premium-заявки</h2></div><div class="list">${(state.adminOverview?.premium_order_items || []).map(item => `<div class="list-row"><span class="row-main"><strong>#${item.id} · ${escapeHtml(item.user_name)} (${item.user_id})</strong><span>${format(item.cost)} DC</span></span><button class="button primary" data-action="admin-do" data-admin-action="premium_done" data-item-id="${item.id}">Выдан</button><button class="button secondary" data-action="admin-do" data-admin-action="premium_refund" data-item-id="${item.id}">Возврат</button></div>`).join("") || '<div class="notice"><b>✓</b><span>Нет Premium-заявок.</span></div>'}</div><div class="section"><button class="button secondary wide" data-action="admin-refresh">Обновить заявки</button></div>`),
};

function page(title, lead, content) { return `<div class="page-head"><div class="eyebrow">D-COINS</div><h1>${title}</h1><p class="lead">${lead}</p></div>${content}`; }

views.admin = () => page("Админ-панель", "Управление ботом.", `<div class="stat-row"><div class="stat"><b>${state.adminOverview?.players ?? "—"}</b><small>Игроков</small></div><div class="stat"><b>${state.adminOverview?.star_balance ?? "—"}</b><small>Stars</small></div><div class="stat"><b>${state.adminOverview?.banned_users?.length ?? "—"}</b><small>Банов</small></div></div><div class="list"><button class="list-row" data-view="admin-users">${icon("♙")}<span class="row-main"><strong>Пользователи</strong><span>Баланс, счётчики, бан, VIP, подарок</span></span><span class="row-side">›</span></button><button class="list-row" data-view="admin-promos">${icon("⌁")}<span class="row-main"><strong>Промокоды</strong><span>DC, ключи кейсов, бустеры</span></span><span class="row-side">›</span></button><button class="list-row" data-view="admin-settings">${icon("⚙")}<span class="row-main"><strong>Очереди и раздачи</strong><span>Подарки, Premium, массовые операции</span></span><span class="row-side">›</span></button></div><section class="section"><div class="modal"><h2>Золотой час</h2><div class="modal-actions"><button class="button primary" data-action="golden-start">Запустить</button><button class="button secondary" data-action="golden-stop">Остановить</button></div></div></section><section class="section"><div class="modal"><h2>Мини-ивент в канале</h2><select id="mini-event-kind" class="input"><option value="first">Первый участник</option><option value="first_n">Первые N участников</option><option value="ticket">Счастливый билет</option></select><input id="mini-event-reward" class="input" type="number" min="1" placeholder="Награда DC" /><input id="mini-event-duration" class="input" type="number" min="10" max="3600" value="300" placeholder="Секунды" /><input id="mini-event-count" class="input" type="number" min="1" max="100" value="10" placeholder="Количество участников (N)" /><div class="modal-actions"><button class="button primary" data-action="mini-event-create">Опубликовать</button><button class="button danger" data-action="mini-event-cancel">Отменить активный</button></div></div></section><section class="section"><div class="modal"><h2>Массовая раздача</h2><input id="broadcast-amount" class="input" type="number" min="1" placeholder="Количество" /><select id="broadcast-kind" class="input"><option value="coins">D-COINS</option><option value="case">Ключи кейса</option><option value="booster">Бустеры</option></select><select id="broadcast-item" class="input">${Object.entries(CASES).map(([id,c])=>`<option value="case:${id}">Кейс ${escapeHtml(c.title)}</option>`).join("")}${Object.entries(BOOSTERS).map(([id,b])=>`<option value="booster:${id}">Бустер ${escapeHtml(b[0])}</option>`).join("")}</select><div class="modal-actions"><button class="button primary" data-action="broadcast-send">Раздать всем</button><button class="button danger" data-action="reset-all">Сбросить игровые данные</button></div></div></section>`);

const renderAdminHome = views.admin;
views.admin = () => `${renderAdminHome()}<button class="button secondary wide" data-view="admin-economy">Экономика · цены и шансы</button>`;

views["admin-economy"] = () => page("Экономика", "Цены сохраняются в настройках бота и применяются сразу.", `<div class="section-title"><h2>Покупка DC за Stars</h2></div><div class="list">${Object.entries(state.adminOverview?.star_packages||{}).map(([dc,stars])=>`<div class="list-row"><span class="row-main"><strong>${format(dc)} DC</strong><span>${stars} Stars</span></span><input class="input compact" id="star-price-${dc}" type="number" min="1" value="${stars}" /><button class="button primary" data-action="save-star-price" data-dc="${dc}">Сохранить</button></div>`).join("")}</div><div class="section-title"><h2>Обменные цены</h2></div><div class="list">${Object.entries(state.adminOverview?.exchange_prices||{}).map(([key,value])=>`<div class="list-row"><span class="row-main"><strong>${escapeHtml(key)}</strong></span><input class="input compact" id="exchange-price-${key}" type="number" min="1" value="${value}" /><button class="button primary" data-action="save-exchange-price" data-key="${key}">Сохранить</button></div>`).join("")}</div><div class="notice"><b>i</b><span>Обмен в пользовательском меню остаётся отключённой настройкой бота.</span></div><div class="section-title"><h2>Шансы наград кейса</h2></div><div class="modal"><select id="chance-case" class="input">${Object.keys(state.adminOverview?.case_chances||{}).map(id=>`<option value="${id}">${escapeHtml(CASES[id]?.title||id)}</option>`).join("")}</select><input id="chance-index" class="input" type="number" min="0" placeholder="Номер награды (с нуля)" /><input id="chance-value" class="input" type="number" min="0" step="0.01" placeholder="Новый вес" /><button class="button primary" data-action="save-case-chance">Сохранить шанс</button></div>`);

views["admin-settings"] = () => page("Очереди и публикации", "Подарки, Premium и сообщения в каналы.", `<div class="section-title"><h2>Подарки в очереди</h2></div><div class="list">${(state.adminOverview?.pending_gift_items||[]).map(item=>`<div class="list-row"><span class="row-main"><strong>#${item.id} · ${escapeHtml(item.user_name)} (${item.user_id})</strong><span>${escapeHtml(item.gift_id)} · ${escapeHtml(item.reason||"")}</span></span><button class="button primary" data-action="admin-do" data-admin-action="deliver_pending_gift" data-item-id="${item.id}">Выдать</button><button class="button danger" data-action="admin-do" data-admin-action="delete_pending_gift" data-item-id="${item.id}">Удалить</button></div>`).join("")||'<div class="notice"><b>✓</b><span>Очередь подарков пуста.</span></div>'}</div><div class="section-title"><h2>Premium</h2></div><div class="list">${(state.adminOverview?.premium_order_items||[]).map(item=>`<div class="list-row"><span class="row-main"><strong>#${item.id} · ${escapeHtml(item.user_name)} (${item.user_id})</strong><span>${format(item.cost)} DC</span></span><button class="button primary" data-action="admin-do" data-admin-action="premium_done" data-item-id="${item.id}">Выдан</button><button class="button secondary" data-action="admin-do" data-admin-action="premium_refund" data-item-id="${item.id}">Возврат</button></div>`).join("")||'<div class="notice"><b>✓</b><span>Заявок нет.</span></div>'}</div><div class="section"><div class="modal"><h2>Публикация</h2><textarea class="input" id="admin-message" rows="4" maxlength="4000" placeholder="Текст публикации"></textarea><div class="modal-actions"><button class="button primary" data-action="publish-channel">В канал</button><button class="button secondary" data-action="send-group">В основную группу</button></div></div></div>`);

const renderAdminSettings = views["admin-settings"];
views["admin-settings"] = () => `${renderAdminSettings()}<button class="button secondary wide" data-action="admin-topup-stars">Пополнить Stars бота</button><section class="section"><div class="section-title"><h2>Поддержка</h2></div><div class="list">${(state.adminOverview?.support_users||[]).map(u=>`<div class="modal"><strong>${escapeHtml(u.name)} · ${u.user_id}</strong><p>${u.active?"Диалог открыт":"Диалог закрыт"}</p><textarea class="input" id="support-reply-${u.user_id}" rows="2" maxlength="2000" placeholder="Ответ пользователю"></textarea><div class="modal-actions"><button class="button primary" data-action="support-reply" data-user-id="${u.user_id}">Ответить</button><button class="button secondary" data-action="support-close-user" data-user-id="${u.user_id}">Закрыть диалог</button><button class="button danger" data-action="support-revoke-user" data-user-id="${u.user_id}">Отозвать доступ</button></div></div>`).join("")||'<div class="notice"><b>✓</b><span>Доступ к поддержке не выдан.</span></div>'}</div></section>`;

views["admin-users"] = () => page("Управление пользователями", "Все действия проверяются сервером.", `<div class="modal"><input class="input" id="admin-user-id" type="number" min="1" placeholder="Telegram ID" /><input class="input" id="admin-amount" type="number" min="1" placeholder="Количество / сумма" /><input class="input" id="admin-reason" maxlength="300" placeholder="Причина блокировки" /><input class="input" id="admin-gift-id" maxlength="128" placeholder="Gift ID для ручной выдачи" /><div class="section list">${[["add_coins","Начислить DC"],["remove_coins","Снять DC"],["add_visual","Начислить визуальные DC"],["remove_visual","Снять визуальные DC"],["add_messages","Добавить сообщения"],["remove_messages","Убрать сообщения"],["add_daily","Добавить сообщения за сегодня"],["remove_daily","Убрать сообщения за сегодня"],["grant_support","Выдать доступ к поддержке"],["revoke_support","Забрать доступ к поддержке"],["ban","Заблокировать"],["unban","Разблокировать"],["vip","Выдать VIP"],["unvip","Снять VIP"],["send_gift","Поставить подарок в очередь"]].map(([action,title])=>`<button class="button secondary" data-action="admin-do" data-admin-action="${action}">${title}</button>`).join("")}</div></div><div class="section-title"><h2>Заблокированные</h2></div><div class="list">${(state.adminOverview?.banned_users||[]).map(u=>`<div class="list-row"><span class="row-main"><strong>${escapeHtml(u.name)} (${u.user_id})</strong><span>${escapeHtml(u.reason)}</span></span><button class="button secondary" data-action="admin-unban" data-user-id="${u.user_id}">Снять бан</button></div>`).join("")||'<div class="notice"><b>✓</b><span>Заблокированных нет.</span></div>'}</div>`);

const renderAdminUserControls = views["admin-users"];
views["admin-users"] = () => `${renderAdminUserControls()}<section class="section"><div class="section-title"><h2>Пользователи и балансы</h2></div><div class="list">${(state.adminOverview?.users||[]).map(u=>`<div class="list-row"><span class="row-main"><strong>${escapeHtml(u.name)} · ${u.user_id}</strong><span>${u.username?`@${escapeHtml(u.username)} · `:""}${format(u.balance)} DC + ${format(u.visual_balance)} визуальных</span></span></div>`).join("")}</div><div class="section-title"><h2>VIP</h2></div><div class="list">${(state.adminOverview?.vip_users||[]).map(u=>`<div class="list-row"><span class="row-main"><strong>${escapeHtml(u.name)} · ${u.user_id}</strong><span>${format(u.messages)} сообщений</span></span><button class="button secondary" data-action="admin-unvip" data-user-id="${u.user_id}">Снять VIP</button></div>`).join("")||'<div class="notice"><b>✓</b><span>VIP-игроков нет.</span></div>'}</div></section>`;

views["admin-promos"] = () => page("Промокоды", "Создавай DC, кейсовые и бустерные промокоды.", `<div class="stat-row"><div class="stat"><b>${state.adminOverview?.players??"—"}</b><small>Игроков</small></div><div class="stat"><b>${state.adminOverview?.promos?.length??"—"}</b><small>Промокодов</small></div><div class="stat"><b>${state.adminOverview?.star_balance??"—"}</b><small>Stars</small></div></div><div class="modal"><select class="input" id="promo-kind"><option value="coins">D-COINS</option><option value="case">Ключи кейса</option><option value="booster">Бустер</option></select><input class="input" id="promo-new-code" maxlength="32" placeholder="Код" /><input class="input" id="promo-new-reward" type="number" min="1" placeholder="Награда DC" /><input class="input" id="promo-new-count" type="number" min="1" value="1" placeholder="Количество предметов" /><select class="input" id="promo-item">${Object.entries(CASES).map(([id,c])=>`<option value="case:${id}">Кейс ${escapeHtml(c.title)}</option>`).join("")}${Object.entries(BOOSTERS).map(([id,b])=>`<option value="booster:${id}">Бустер ${escapeHtml(b[0])}</option>`).join("")}</select><input class="input" id="promo-new-limit" type="number" min="1" placeholder="Лимит (пусто = без лимита)" /><label class="pill"><input type="checkbox" id="promo-hidden" /> Не публиковать в канале</label><button class="button primary wide" data-action="admin-create-promo">Создать</button></div><div class="section list">${(state.adminOverview?.promos||[]).map(p=>`<div class="list-row">${icon("⌁")}<span class="row-main"><strong>${escapeHtml(p.code)}</strong><span>${escapeHtml(String(p.reward))} ${escapeHtml(p.type)} · ${p.uses}/${p.max_uses??"∞"}</span></span><button class="button danger" data-action="admin-delete-promo" data-promo-code="${escapeHtml(p.code)}">Удалить</button></div>`).join("")}</div>`);
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
  updateShell();
  const section = view.startsWith("play:") || ["mines-active", "crash-active"].includes(view) ? "games" : view.startsWith("case:") || view === "pandora" ? "cases" : view;
  const navItems = [...document.querySelectorAll(".nav-item")];
  navItems.forEach((node) => node.classList.toggle("active", node.dataset.view === section));
  const activeIndex = navItems.findIndex((node) => node.dataset.view === section);
  if (activeIndex >= 0) document.querySelector(".bottom-nav").style.setProperty("--active-index", activeIndex);
  if (view.startsWith("admin") && !state.isAdmin) { state.view = "home"; return render(); }
  if (view === "mines-active") return renderMines();
  if (view === "crash-active") return renderCrash();
  if (view.startsWith("play:")) return renderGame(view.split(":")[1]);
  if (view.startsWith("case:")) return renderCase(view.split(":")[1]);
  if (view === "pandora") return renderPandora();
  document.querySelector("#screen").innerHTML = views[view] ? views[view]() : views.home();
  if (view === "top" && !state.top.length) loadTop();
  if (view === "stats" && !state.stats) loadStats();
  if (["jackpot", "jackpot-top", "jackpot-winners"].includes(view) && state.jackpotTop === null) loadJackpot();
  if (view.startsWith("admin") && state.isAdmin && !state.adminOverview) loadAdminOverview();
  if (view === "mini-events" && !state.miniEventLoaded) loadMiniEvent();
  if (view === "duels" && !state.duelsLoaded) loadDuels();
}
function updateShell() {
  document.querySelector("#header-name").innerHTML = state.displayName;
  document.querySelector("#header-balance").textContent = state.hiddenBalance ? "•••" : format(state.balance);
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
  if (game === "roulette") {
    document.querySelector("#screen").innerHTML = page(names[game], "Выбери цвет и запусти колесо рулетки.", `<div class="roulette-game">
      <div class="roulette-stage"><div class="roulette-pointer" aria-hidden="true"></div><div class="roulette-wheel" data-roulette-wheel aria-label="Колесо рулетки"><div class="roulette-wheel-center">D</div></div></div>
      <p class="roulette-caption">Колесо остановится на цвете, выпавшем на сервере.</p>
      <div class="roulette-options" role="group" aria-label="Цвет ставки"><button type="button" class="roulette-choice selected" data-roulette-choice="red">🔴 Красное</button><button type="button" class="roulette-choice" data-roulette-choice="black">⚫ Чёрное</button><button type="button" class="roulette-choice" data-roulette-choice="green">🟢 Зелёное · ×3</button></div>
      <input id="game-option" type="hidden" value="red" />
      <div class="section"><label for="game-bet">Твоя ставка</label><input id="game-bet" class="input" type="number" min="5" step="1" inputmode="numeric" placeholder="Сумма ставки в DC" /></div>
      <div class="modal-actions"><button class="button primary wide" data-action="roulette-spin">Запустить рулетку</button>${btn("К играм", "games")}</div>
    </div>`);
    return;
  }
  if (game === "dice") {
    document.querySelector("#screen").innerHTML = page(names[game], "Угадай число от 1 до 6 и брось кубик.", `<div class="dice-game">
      <div class="dice-stage"><div class="dice-cube" data-dice-face aria-live="polite">⚄</div></div>
      <p class="dice-caption">Угадай результат броска · выплата ×2</p>
      <div class="section"><label for="game-option">Твоё число</label><select id="game-option" class="input">${Array.from({length:6},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join("")}</select></div>
      <div class="section"><label for="game-bet">Твоя ставка</label><input id="game-bet" class="input" type="number" min="5" step="1" inputmode="numeric" placeholder="Сумма ставки в DC" /></div>
      <div class="modal-actions"><button class="button primary wide" data-action="dice-roll">Бросить кубик</button>${btn("К играм", "games")}</div>
    </div>`);
    return;
  }
  if (game === "coinflip") {
    document.querySelector("#screen").innerHTML = page(names[game], "Выбери сторону и подбрось фишку.", `<div class="coin-game">
      <div class="coin-stage"><div class="coin-3d" data-coin><div class="coin-face coin-heads">D</div><div class="coin-face coin-tails"><svg class="coin-emblem" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="5"/><path d="M34 39h32M34 50h24M34 61h32" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg></div></div></div>
      <p class="coin-caption">Точное попадание · выплата ×1.9</p>
      <div class="section"><label for="game-option">Сторона фишки</label><select id="game-option" class="input"><option value="heads">Орёл</option><option value="tails">Решка</option></select></div>
      <div class="section"><label for="game-bet">Твоя ставка</label><input id="game-bet" class="input" type="number" min="5" step="1" inputmode="numeric" placeholder="Сумма ставки в DC" /></div>
      <div class="modal-actions"><button class="button primary wide" data-action="coin-flip">Подбросить фишку</button>${btn("К играм", "games")}</div>
    </div>`);
    return;
  }
  if (game === "slots") {
    document.querySelector("#screen").innerHTML = page(names[game], "Три барабана. Один шанс.", `<div class="slot-machine">
      <div class="slot-machine-head"><strong>D-COINS / 03</strong><span>Три знака. Одна линия.</span></div>
      <div class="slot-reels" aria-label="Игровые барабаны">
        <div class="slot-reel"><span data-slot-reel="0">🍋</span></div>
        <div class="slot-reel"><span data-slot-reel="1">7️⃣</span></div>
        <div class="slot-reel"><span data-slot-reel="2">🍇</span></div>
      </div>
      <p class="slot-caption">Собери три одинаковых символа. Три семёрки дают самую большую выплату.</p>
      <div class="section"><label for="game-bet">Твоя ставка</label><input id="game-bet" class="input" type="number" min="5" step="1" inputmode="numeric" placeholder="Сумма ставки в DC" /></div>
      <div class="modal-actions"><button class="button primary wide" data-action="slot-spin">Запустить барабаны</button>${btn("К играм", "games")}</div>
    </div>`);
    return;
  }
  const options={slots:[["spin","Крутить барабаны"]],roulette:[["red","🔴 Красное"],["black","⚫ Чёрное"],["green","🟢 Зелёное · ×3"]],dice:[["1","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"]],coinflip:[["heads","🦅 Орёл"],["tails","🔵 Решка"]],scratch:[["reveal","Открыть скретч-карту"]],lottery:Array.from({length:25},(_,i)=>[String(i),`Билет ${i+1}`])}[game];
  if (!options) { document.querySelector("#screen").innerHTML = page(names[game], "Этот режим переносится следующим — остальные игры уже доступны в боте.", `${btn("К играм", "games")}`); return; }
  document.querySelector("#screen").innerHTML = page(names[game], "Минимальная ставка — 5 DC.", `<div class="modal"><h2>${names[game]}</h2><p>${state.booster ? `Активный бустер: ${state.booster}.` : "Бустер не выбран."}</p><div class="section"><select id="game-option" class="input">${options.map(([value,label])=>`<option value="${value}">${label}</option>`).join("")}</select></div><div class="section"><input id="game-bet" class="input" inputmode="numeric" placeholder="Сумма ставки" /></div><div class="modal-actions"><button class="button primary" data-action="play-game" data-game="${game}">Начать игру</button>${btn("К играм", "games")}</div></div>`);
}
function renderCase(id) { const data={blood:["BLOOD","5 000 DC"],pantera:["PANTERA","10 000 DC"],spider_man:["SPIDER MAN","7 500 DC"]}[id]; document.querySelector("#screen").innerHTML = page(data[0], "Награды определяются шансами, настроенными в боте.", `<div class="modal"><h2>${data[0]}</h2><p>Стоимость: ${data[1]}. Среди наград — D-COINS, подарки и бустеры.</p><div class="modal-actions">${btn("Открыть кейс", "case-open", "primary")}${btn("Все кейсы", "cases")}</div></div>`); }
function renderPandora() { document.querySelector("#screen").innerHTML = page("Ящик Пандоры", "Бесплатный ящик можно открыть раз в 5 дней.", `<div class="modal"><h2>Ящик Пандоры</h2><p>Внутри могут быть D-COINS, ключи кейсов, подарки и бустеры.</p><div class="modal-actions">${btn("Открыть бесплатно", "pandora-open", "primary")}${btn("К кейсам", "cases")}</div></div>`); }

let navigationTimer;
function animateNavigation() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelector("#screen").animate?.(
    [{ opacity: 0.45, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 270, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-view], [data-action], [data-roulette-choice]");
  if (!target) return;
  if (target.dataset.action === "theme-toggle") {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    return;
  }
  if (target.dataset.view === "toggle-privacy") { setPrivacy(!state.hiddenBalance); return; }
  if (target.dataset.view === "case-open") { openCase(); return; }
  if (target.dataset.view === "pandora-open") { openPandora(); return; }
  if (target.dataset.view === "promo-activate") { redeemPromo(); return; }

  if (target.dataset.action === "transfer-send") { transferCoins(); return; }
  if (target.dataset.action === "support-send") { sendSupportMessage(); return; }
  if (target.dataset.action === "support-close") { closeSupportChat(); return; }
  if (target.dataset.action === "mini-event-join") { joinMiniEvent(Number(target.dataset.eventId)); return; }
  if (target.dataset.action === "mini-event-refresh") { state.miniEventLoaded = false; loadMiniEvent(); return; }
  if (target.dataset.action === "duel-create") { createDuel(); return; }
  if (target.dataset.action === "duel-refresh") { state.duelsLoaded = false; loadDuels(); return; }
  if (target.dataset.action === "duel-cancel") { cancelDuel(target.dataset.duelId); return; }
  if (target.dataset.action === "duel-accept") { acceptDuel(target.dataset.duelId); return; }
  if (target.dataset.action === "daily-bonus") { claimDailyBonus(); return; }
  if (target.dataset.action === "mines-start") { startMines(); return; }
  if (target.dataset.action === "crash-mode") { state.crashMode = target.dataset.mode; document.querySelectorAll("[data-action='crash-mode']").forEach(node => node.classList.toggle("primary", node.dataset.mode === state.crashMode)); return; }
  if (target.dataset.action === "crash-start") { startCrash(); return; }
  if (target.dataset.action === "crash-forward") { crashAction("forward"); return; }
  if (target.dataset.action === "crash-cashout") { crashAction("cashout"); return; }
  if (target.dataset.action === "mines-cell") { minesAction("cell", Number(target.dataset.cell)); return; }
  if (target.dataset.action === "mines-cashout") { minesAction("cashout"); return; }
  if (target.dataset.action === "slot-spin") { playGame("slots"); return; }
  if (target.dataset.action === "coin-flip") { playGame("coinflip"); return; }
  if (target.dataset.action === "dice-roll") { playGame("dice"); return; }
  if (target.dataset.action === "roulette-spin") { playGame("roulette"); return; }
  if (target.dataset.rouletteChoice) { const option = document.querySelector("#game-option"); if (option) option.value = target.dataset.rouletteChoice; document.querySelectorAll("[data-roulette-choice]").forEach(el => el.classList.toggle("selected", el === target)); return; }
  if (target.dataset.action === "play-game") { playGame(target.dataset.game); return; }
  if (target.dataset.action === "booster") { selectBooster(target.dataset.boosterId, target.dataset.booster); return; }
  if (target.dataset.action === "buy") { purchaseStars(Number(target.dataset.amount)); return; }
  if (target.dataset.action === "admin-refresh") { loadAdminOverview(); return; }
  if (target.dataset.action === "admin-create-promo") { const kind = document.querySelector("#promo-kind")?.value; runAdminAction(kind === "case" ? "create_case_promo" : kind === "booster" ? "create_booster_promo" : "create_promo"); return; }
  if (target.dataset.action === "admin-delete-promo") { runAdminAction("delete_promo", undefined, target.dataset.promoCode); return; }
  if (target.dataset.action === "admin-do") { runAdminAction(target.dataset.adminAction, target.dataset.itemId); return; }
  if (target.dataset.action === "golden-start") { runAdminAction("golden_hour_start"); return; }
  if (target.dataset.action === "golden-stop") { runAdminAction("golden_hour_stop"); return; }
  if (target.dataset.action === "reset-all") { if (confirm("Сбросить игровые данные всех пользователей?")) runAdminAction("reset_all"); return; }
  if (target.dataset.action === "broadcast-send") { const kind = document.querySelector("#broadcast-kind")?.value; runAdminAction(kind === "case" ? "broadcast_case" : kind === "booster" ? "broadcast_booster" : "broadcast_coins"); return; }
  if (target.dataset.action === "admin-unban") { runAdminAction("unban", undefined, undefined, Number(target.dataset.userId)); return; }
  if (target.dataset.action === "admin-unvip") { runAdminAction("unvip", undefined, undefined, Number(target.dataset.userId)); return; }
  if (target.dataset.action === "mini-event-create") { runAdminAction("mini_event_create"); return; }
  if (target.dataset.action === "mini-event-cancel") { if (confirm("Отменить текущий мини-ивент?")) runAdminAction("mini_event_cancel"); return; }
  if (target.dataset.action === "save-star-price") { runAdminAction("set_star_price", target.dataset.dc); return; }
  if (target.dataset.action === "save-exchange-price") { runAdminAction("set_exchange_price", target.dataset.key); return; }
  if (target.dataset.action === "save-case-chance") { runAdminAction("set_case_chance"); return; }
  if (target.dataset.action === "publish-channel") { runAdminAction("publish_channel"); return; }
  if (target.dataset.action === "send-group") { runAdminAction("send_group"); return; }
  if (target.dataset.action === "admin-topup-stars") { runAdminAction("topup_stars_invoice"); return; }
  if (target.dataset.action === "support-reply") { runAdminAction("support_reply", undefined, undefined, Number(target.dataset.userId)); return; }
  if (target.dataset.action === "support-close-user") { runAdminAction("support_close", undefined, undefined, Number(target.dataset.userId)); return; }
  if (target.dataset.action === "support-revoke-user") { runAdminAction("revoke_support", undefined, undefined, Number(target.dataset.userId)); return; }
  if (target.dataset.view) {
    const nextView = target.dataset.view;
    // Разрешаем перезагрузку окна для игр и кейсов
    if (nextView === state.view && !nextView.startsWith("play:") && !nextView.startsWith("case:")) return;
    clearTimeout(navigationTimer);
    const navigate = () => {
      state.view = nextView;
      render();
      window.scrollTo(0, 0);
      animateNavigation();
    };
    if (event.detail && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      navigationTimer = setTimeout(navigate, 95);
    } else {
      navigate();
    }
    return;
  }
});

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "X-Telegram-Init-Data": state.initData, "Content-Type": "application/json", ...(options.headers || {}) } });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
async function syncProfile() {
  if (!state.initData) return;
  try {
    const data = await api("/api/me");
    if (data.is_banned) {
      showBanScreen();
      throw new Error("Banned");
    }
    state.displayName = escapeHtml(data.user.name);
    state.balance = data.balance.shown;
    state.hiddenBalance = data.balance.hidden;
    state.isAdmin = Boolean(data.is_admin);
    state.boosters = data.boosters || [];
    state.caseKeys = data.case_keys || {};
    state.pandoraRemaining = Number(data.pandora_remaining || 0);
    state.jackpot = data.jackpot || null;
    state.supportAccess = Boolean(data.support_access);
    state.booster = data.active_booster ? (state.boosters.find((x) => x.id === data.active_booster)?.title || BOOSTERS[data.active_booster]?.[0] || data.active_booster) : null;
    updateShell();
  } catch (error) {
    if (error.message.includes("403") || error.message.includes("Banned")) {
      showBanScreen();
      throw new Error("Banned");
    }
    throw error;
  }
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
  const flightProgress = Math.max(8, Math.min(88, (Number(game.multiplier || 1) - 1) * 18 + 8));
  const crashed = game.finished && !game.won;
  document.querySelector("#screen").innerHTML = page("Crash", `Режим: ${game.mode === "turbo" ? "Турбо" : "Обычный"} · ставка ${format(game.bet)} DC`, `<div class="crash-flight ${crashed ? "crash-burst" : ""} ${game.finished && game.won ? "crash-success" : ""}"><div class="crash-sky"><span class="crash-star star-one">✦</span><span class="crash-star star-two">·</span><span class="crash-star star-three">✧</span><div class="crash-trail" style="width:${flightProgress}%"></div><div class="crash-rocket" style="left:${flightProgress}%">${crashed ? "💥" : "🚀"}</div></div><div class="crash-flight-label"><span>СТАРТ</span><span>${crashed ? "ВЗРЫВ" : game.finished ? "УСПЕШНЫЙ ПОЛЁТ" : "ПОЛЁТ ПРОДОЛЖАЕТСЯ"}</span></div></div><div class="balance-card crash-multiplier"><div class="balance-label">Текущий коэффициент</div><div class="balance-number">×${multiplier}</div><p class="lead">Чем дальше летит ракета, тем выше потенциальный выигрыш.</p></div><div class="section">${summary}</div><div class="modal-actions">${game.finished ? `<button class="button primary" data-view="play:crash">Играть ещё</button>${btn("Все игры", "games")}` : `<button class="button primary" data-action="crash-forward">🚀 Вперёд</button><button class="button secondary" data-action="crash-cashout">Забрать ${format(game.current_prize)} DC</button>`}</div>`);
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

async function loadDuels() {
  try {
    const data = await api("/api/duels");
    state.duels = data.duels || [];
    state.duelsLoaded = true;
    if (state.view === "duels") render();
  } catch (error) {
    state.duelsLoaded = true;
    if (state.view === "duels") render();
    alert(error.message || "Не удалось загрузить дуэли.");
  }
}
async function createDuel() {
  const bet = Number(document.querySelector("#duel-bet")?.value);
  if (!Number.isSafeInteger(bet) || bet < 5 || bet > 100000) { alert("Ставка должна быть от 5 до 100 000 DC."); return; }
  try {
    await api("/api/duels/create", { method: "POST", body: JSON.stringify({ bet }) });
    state.duelsLoaded = false;
    await loadDuels();
    alert("Дуэль создана. Другие игроки могут принять её в Mini App.");
  } catch (error) { alert(error.message || "Не удалось создать дуэль."); }
}
async function acceptDuel(duelId) {
  try {
    const data = await api("/api/duels/accept", { method: "POST", body: JSON.stringify({ duel_id: duelId }) });
    state.balance = data.balance;
    state.duelsLoaded = false;
    await syncProfile().catch(() => {});
    showNotice("Дуэль завершена", data.result || `Победитель: ${data.winner_name}. Выигрыш: ${format(data.prize)} DC.`, btn("К дуэлям", "duels", "primary"));
  } catch (error) { alert(error.message || "Не удалось принять дуэль."); }
}
async function cancelDuel(duelId) {
  try {
    await api("/api/duels/cancel", { method: "POST", body: JSON.stringify({ duel_id: duelId }) });
    state.duelsLoaded = false;
    await loadDuels();
  } catch (error) { alert(error.message || "Не удалось отменить дуэль."); }
}

async function loadMiniEvent() {
  try {
    const data = await api("/api/mini-events");
    state.miniEvent = data.event || null;
    state.miniEventLoaded = true;
    if (state.view === "mini-events") render();
  } catch (error) {
    state.miniEventLoaded = true;
    if (state.view === "mini-events") render();
    alert(error.message || "Не удалось загрузить мини-ивенты.");
  }
}
async function joinMiniEvent(eventId) {
  if (!Number.isSafeInteger(eventId) || eventId <= 0) { alert("Некорректный ивент."); return; }
  try {
    const data = await api("/api/mini-events/join", { method: "POST", body: JSON.stringify({ event_id: eventId }) });
    state.balance = data.balance;
    if (state.miniEvent && data.count !== undefined) {
      state.miniEvent.participants = data.count;
      state.miniEvent.joined = true;
    }
    if (data.complete) {
      state.miniEvent = null;
      state.miniEventLoaded = true;
      showNotice("Мини-ивент завершён", `Награда: +${format(data.reward || 0)} DC. Все награды уже забраны. Баланс: ${format(state.balance)} DC.`, btn("К мини-ивентам", "mini-events", "primary"));
      return;
    }
    if (data.kind === "ticket") {
      state.miniEvent.joined = true;
      render();
      alert("Ты участвуешь в розыгрыше счастливого билета.");
      return;
    }
    await syncProfile().catch(() => {});
    showNotice("Награда получена", `Начислено ${format(data.reward)} DC. Баланс: ${format(state.balance)} DC.`, btn("К мини-ивентам", "mini-events", "primary"));
  } catch (error) { alert(error.message || "Не удалось присоединиться к ивенту."); }
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
    if (state.initData) {
      await api("/api/booster/select", { method: "POST", body: JSON.stringify({ booster_id: boosterId }) });
      await syncProfile();
    } else {
      state.booster = title;
    }
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
async function animateSlotReels(result) {
  const reels = [...document.querySelectorAll("[data-slot-reel]")];
  if (reels.length !== 3) return;
  const symbols = String(result || "").trim().split(/\s+/).slice(0, 3);
  const fallback = ["🍋", "🍇", "🍒", "7️⃣", "🔔", "⭐"];
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const durations = reducedMotion ? [120, 180, 240] : [850, 1250, 1650];
  document.querySelector(".slot-machine")?.classList.add("is-spinning");
  const button = document.querySelector('[data-action="slot-spin"]');
  if (button) { button.disabled = true; button.textContent = "Барабаны вращаются…"; }
  await Promise.all(reels.map((reel, index) => new Promise(resolve => {
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= durations[index]) {
        reel.textContent = symbols[index] || fallback[index];
        reel.closest(".slot-reel")?.classList.add("slot-stopped");
        resolve();
        return;
      }
      reel.textContent = fallback[Math.floor(Math.random() * fallback.length)];
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })));
  document.querySelector(".slot-machine")?.classList.remove("is-spinning");
}
async function animateRoulette(result) {
  const wheel = document.querySelector("[data-roulette-wheel]");
  const button = document.querySelector('[data-action="roulette-spin"]');
  if (!wheel) return;
  const text = String(result || "").toLowerCase();
  const color = text.includes("зелёное") || text.includes("зеленое") ? "green" : text.includes("чёрное") || text.includes("черное") ? "black" : "red";
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const sectors = {red: 0, black: 1, green: 2};
  if (button) { button.disabled = true; button.textContent = "Колесо вращается…"; }
  wheel.classList.remove("roulette-spinning", "roulette-landed");
  const current = Number(wheel.dataset.rotation || 0);
  const target = current + 360 * 6 + ((270 - (sectors[color] * 30 + 15) + 360) % 360);
  if (reducedMotion) { wheel.style.transform = `rotate(${target}deg)`; wheel.dataset.rotation = String(target); wheel.classList.add("roulette-landed"); return; }
  wheel.classList.add("roulette-spinning");
  wheel.style.transform = `rotate(${target}deg)`;
  await new Promise(resolve => { wheel.addEventListener("transitionend", resolve, {once:true}); window.setTimeout(resolve, 4200); });
  wheel.classList.remove("roulette-spinning"); wheel.classList.add("roulette-landed"); wheel.dataset.rotation = String(target);
}
async function animateDiceRoll(result) {
  const die = document.querySelector("[data-dice-face]");
  const button = document.querySelector('[data-action="dice-roll"]');
  if (!die) return;
  const match = String(result || "").match(/([1-6])/);
  const value = match ? Number(match[1]) : 1;
  const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (button) { button.disabled = true; button.textContent = "Кубик катится…"; }
  if (reducedMotion) { die.textContent = faces[value - 1]; die.classList.add("dice-landed"); return; }
  die.classList.remove("dice-landed");
  die.classList.add("dice-rolling");
  const endAt = performance.now() + 1250;
  await new Promise(resolve => {
    const tick = now => {
      die.textContent = faces[Math.floor(Math.random() * faces.length)];
      if (now >= endAt) { resolve(); return; }
      window.setTimeout(() => requestAnimationFrame(tick), 65);
    };
    requestAnimationFrame(tick);
  });
  die.textContent = faces[value - 1];
  die.classList.remove("dice-rolling");
  die.classList.add("dice-landed");
}
async function animateCoinFlip(result) {
  const coin = document.querySelector("[data-coin]");
  const button = document.querySelector('[data-action="coin-flip"]');
  if (!coin) return;
  const heads = String(result || "").includes("Орёл");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  coin.classList.remove("coin-landed", "coin-heads-result", "coin-tails-result");
  if (button) { button.disabled = true; button.textContent = "Фишка вращается…"; }
  if (reducedMotion) {
    coin.classList.add(heads ? "coin-heads-result" : "coin-tails-result");
    return;
  }
  coin.classList.add("coin-flipping");
  await new Promise(resolve => {
    coin.addEventListener("animationend", resolve, { once: true });
    window.setTimeout(resolve, 1500);
  });
  coin.classList.remove("coin-flipping");
  coin.classList.add(heads ? "coin-heads-result" : "coin-tails-result", "coin-landed");
}
async function playGame(game) {
  const bet = Number(document.querySelector("#game-bet")?.value);
  const option = document.querySelector("#game-option")?.value || (game === "slots" ? "spin" : undefined);
  if (!Number.isInteger(bet) || bet < 5) { alert("Минимальная ставка — 5 DC."); return; }
  const slotButton = document.querySelector('[data-action="slot-spin"]');
  if (slotButton) slotButton.disabled = true;
  try {
    const data = await api("/api/game/play", { method: "POST", body: JSON.stringify({ game, bet, option }) });
    if (game === "slots") await animateSlotReels(data.result);
    if (game === "coinflip") await animateCoinFlip(data.result);
    if (game === "dice") await animateDiceRoll(data.result);
    if (game === "roulette") await animateRoulette(data.result);
    await syncProfile().catch(() => {});
    state.balance = data.balance;
    document.querySelector("#screen").innerHTML = page(data.won ? "Выигрыш" : "Раунд завершён", "Результат игры", `<div class="modal"><h2>${data.result}</h2><p>${data.won ? `✅ Выигрыш: ${format(data.prize)} DC` : `❌ Ставка проиграна${data.refund ? `. Возврат по страховке: ${format(data.refund)} DC` : ""}`}</p><p class="lead">Баланс: ${format(data.balance)} DC</p><div class="modal-actions">${btn("Играть ещё", `play:${game}`, "primary")}${btn("Все игры", "games")}</div></div>`);
  } catch (error) {
    if (slotButton) slotButton.disabled = false;
    alert(error.message || "Не удалось завершить игру.");
  }
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
    if (state.view.startsWith("admin")) render();
  } catch (error) { alert(error.message || "Не удалось загрузить админ-сводку."); }
}
async function runAdminAction(action, itemId, promoCode, selectedUserId) {
  if (!state.isAdmin) { alert("Нет доступа."); return; }
  const userId = Number(selectedUserId || document.querySelector("#admin-user-id")?.value);
  const amount = Number(document.querySelector("#admin-amount")?.value);
  const payload = { action };
  if (action.startsWith("broadcast_")) {
    const broadcastAmount = Number(document.querySelector("#broadcast-amount")?.value);
    if (!Number.isSafeInteger(broadcastAmount) || broadcastAmount <= 0) { alert("Укажи положительное целое количество."); return; }
    payload.amount = broadcastAmount;
    const item = document.querySelector("#broadcast-item")?.value || "case:blood";
    if (action === "broadcast_case") payload.case_id = item.startsWith("case:") ? item.slice(5) : "blood";
    if (action === "broadcast_booster") payload.booster_id = item.startsWith("booster:") ? item.slice(8) : "double";
  }
  if (action === "mini_event_create") {
    payload.kind = document.querySelector("#mini-event-kind")?.value;
    payload.reward = Number(document.querySelector("#mini-event-reward")?.value);
    payload.duration = Number(document.querySelector("#mini-event-duration")?.value);
    payload.max_participants = Number(document.querySelector("#mini-event-count")?.value);
    if (!Number.isSafeInteger(payload.reward) || payload.reward <= 0 || !Number.isSafeInteger(payload.duration)) { alert("Проверь награду и длительность мини-ивента."); return; }
  }
  if (action === "set_star_price") { payload.key = String(itemId); payload.value = Number(document.querySelector(`#star-price-${itemId}`)?.value); }
  if (action === "set_exchange_price") { payload.key = String(itemId); payload.value = Number(document.querySelector(`#exchange-price-${itemId}`)?.value); }
  if (action === "set_case_chance") {
    const index = document.querySelector("#chance-index")?.value?.trim();
    const chance = document.querySelector("#chance-value")?.value?.trim();
    if (!index || !chance || !Number.isInteger(Number(index)) || !Number.isFinite(Number(chance))) { alert("Укажи номер награды и числовой шанс."); return; }
    payload.case_id = document.querySelector("#chance-case")?.value; payload.index = Number(index); payload.chance = Number(chance);
  }
  if (action === "publish_channel" || action === "send_group") payload.text = document.querySelector("#admin-message")?.value?.trim() || "";
  if (action === "support_reply") payload.text = document.querySelector(`#support-reply-${userId}`)?.value?.trim() || "";
  if (itemId !== undefined) payload.item_id = Number(itemId);
  if (["create_promo", "create_case_promo", "create_booster_promo"].includes(action)) {
    const code = document.querySelector("#promo-new-code")?.value?.trim().toUpperCase();
    const limitText = document.querySelector("#promo-new-limit")?.value?.trim();
    const limit = limitText ? Number(limitText) : null;
    if (!code || !/^[A-Z0-9_-]{3,32}$/.test(code)) { alert("Код: 3–32 символа, латинские буквы, цифры, _ или -."); return; }
    if (limit !== null && (!Number.isSafeInteger(limit) || limit <= 0)) { alert("Лимит должен быть положительным целым числом."); return; }
    payload.code = code; payload.max_uses = limit; payload.hidden = Boolean(document.querySelector("#promo-hidden")?.checked);
    if (action === "create_promo") {
      const reward = Number(document.querySelector("#promo-new-reward")?.value);
      if (!Number.isSafeInteger(reward) || reward <= 0) { alert("Награда DC должна быть положительным целым числом."); return; }
      payload.reward = reward;
    } else {
      const [kind, id] = (document.querySelector("#promo-item")?.value || "").split(":");
      payload.count = Number(document.querySelector("#promo-new-count")?.value);
      if (!Number.isSafeInteger(payload.count) || payload.count < 1) { alert("Количество должно быть положительным целым числом."); return; }
      payload[action === "create_case_promo" ? "case_id" : "booster_id"] = id;
    }
  }
  if (action === "delete_promo") {
    if (!promoCode) { alert("Промокод не указан."); return; }
    payload.code = promoCode;
  }
  if (["add_coins", "remove_coins", "add_visual", "remove_visual", "add_messages", "remove_messages", "add_daily", "remove_daily", "grant_support", "revoke_support", "ban", "unban", "vip", "unvip", "send_gift", "support_reply", "support_close"].includes(action)) {
    if (!Number.isInteger(userId) || userId <= 0) { alert("Укажи корректный Telegram ID."); return; }
    payload.user_id = userId;
  }
  if (["add_coins", "remove_coins", "add_visual", "remove_visual", "add_messages", "remove_messages", "add_daily", "remove_daily"].includes(action)) {
    if (!Number.isInteger(amount) || amount <= 0) { alert("Укажи положительную сумму DC."); return; }
    payload.amount = amount;
  }
  if (action === "ban") payload.reason = document.querySelector("#admin-reason")?.value?.trim() || "";
  if (action === "send_gift") payload.gift_id = document.querySelector("#admin-gift-id")?.value?.trim() || "";
  try {
    const result = await api("/api/admin/action", { method: "POST", body: JSON.stringify(payload) });
    if (action === "topup_stars_invoice") {
      const webApp = window.Telegram?.WebApp;
      if (!webApp?.openInvoice) throw new Error("Открой Mini App внутри Telegram для оплаты.");
      webApp.openInvoice(result.invoice_link);
      return;
    }
    if (action.startsWith("create_") && result.published === false && !result.hidden) alert("Промокод создан, но не опубликован в канале. Проверь права бота.");
    else if (action === "reset_all") alert(`Игровые данные сброшены. Пользователей обработано: ${result.players}.`);
    else if (action.startsWith("broadcast_")) alert(`Раздача создана. Получателей: ${result.players}.`);
    else alert("Действие выполнено.");
    state.adminOverview = null;
    if (state.view.startsWith("admin")) await loadAdminOverview();
  } catch (error) { alert(error.message || "Админ-действие не выполнено."); }
}

async function loadTop() {
  try {
    if (!state.initData) return;
    state.top = (await api("/api/top")).players;
    if (state.view === "top") render();
  } catch { /* the empty state remains visible until the next refresh */ }
}
async function loadStats() {
  try {
    if (!state.initData) return;
    state.stats = await api("/api/stats");
    if (state.view === "stats") render();
  } catch (error) {
    if (state.view === "stats") alert(error.message || "Не удалось загрузить статистику.");
  }
}
async function bootstrap() {
  applyTheme(document.documentElement.dataset.theme || "light");
  const webApp = window.Telegram?.WebApp;
  state.initData = webApp?.initData || "";
  webApp?.ready();
  webApp?.expand();
  try { 
    await syncProfile(); 
  } catch (error) { 
    if (error.message === "Banned") return;
    /* local design preview stays usable without Telegram */ 
  }
  render();
}

function showBanScreen() {
  document.body.innerHTML = `
    <div style="display:grid; place-items:center; height:100vh; text-align:center; padding:20px; background: var(--bg); color: var(--text);">
      <div>
        <div style="font-size: 56px; margin-bottom: 16px;">🚫</div>
        <h2 style="margin-bottom: 8px;">Доступ закрыт</h2>
        <p style="color: var(--muted); line-height: 1.5;">Ваш аккаунт заблокирован. Игровые функции недоступны.</p>
      </div>
    </div>
  `;
}

bootstrap();
