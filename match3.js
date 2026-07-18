// ==========================================================================
// match3.js — ПОЛНЫЙ КИНЕМАТОГРАФИЧЕСКИЙ ДВИЖОК ИГРЫ "БРАКОНЬЕР"
// Подробная архитектура с пошаговым комментированием всех процессов
// ==========================================================================

(function() {
    // ----------------------------------------------------------------------
    // РАЗДЕЛ 1: КОНСТАНТЫ И НАСТРОЙКИ СЕТКИ
    // ----------------------------------------------------------------------
    const SIZE = 8; // Размерность игрового поля (сетка 8х8 ячеек)
    
    // Базовая база типов обычных игровых элементов (фишек) и их визуальные иконки
    const TYPES = [
        {id:'heart', icon:'🫀'},  // Вампирское Сердце (основная цель сбора)
        {id:'bullet', icon:'🔫'}, // Патрон / Пистолет
        {id:'garlic', icon:'🧄'}, // Чеснок
        {id:'stake', icon:'🗡️'},  // Серебряный клинок / Орудие
        {id:'vial', icon:'🧪'},   // Колба со святой водой
        {id:'coin', icon:'💰'}    // Монета браконьера
    ];

    // Список уникальных идентификаторов специальных бустеров-суперэлементов
    const SPECIALS = ['rocketRow', 'rocketCol', 'bomb', 'plane', 'rainbow'];
// Вспомогательные хелперы вычислений (Стрелочные математические функции)
    const isSpecial = t => SPECIALS.includes(t); // Проверка: является ли элемент спец-бустером
    const randType = () => TYPES[Math.floor(Math.random() * TYPES.length)].id; // Генерация случайного цвета фишки

    // ДОБАВЛЕНО: "Мягкая гарантия" нужного цвета — применяется ТОЛЬКО при довыпадении новых фишек
    // (не при первичной генерации поля, чтобы старт уровня оставался честным). Чем сильнее игрок
    // отстаёт от темпа по оставшимся ходам, тем выше шанс подложить именно целевой цвет.
    function weightedRandType() {
        const colorGoalTypes = TYPES.map(t => t.id);
        if (colorGoalTypes.includes(targetType)) {
            const remaining = Math.max(0, GOAL_HEARTS - hearts);
            const movesLeft = Math.max(1, moves);
            const pace = remaining / movesLeft; // Сколько целевых фишек нужно собирать за ход в среднем
            const boostChance = Math.min(0.42, 0.16 + pace * 0.12); // Базовый шанс ~1/6, максимум 0.42
            if (Math.random() < boostChance) return targetType;
        }
        return randType();
    }
    const key = (r, c) => r + ',' + c; // Конвертация координат строки и столбца в строковый ключ словаря "row,col"
    const getType = (r, c) => grid[r] && grid[r][c] ? grid[r][c].type : null; // Безопасное получение типа элемента без падения игры
    // Временные задержки (в миллисекундах) для плавной синхронизации анимаций
    const SWAP_MS = 240;  // Продолжительность анимации обмена фишек местами
    const CLEAR_MS = 260; // Время анимации схлопывания/уничтожения элементов
    const FALL_MS = 300;  // Продолжительность падения фишек под действием гравитации
// Проверка: может ли этот элемент падать и передвигаться игроком
    function isMovable(tile) {
    if (!tile) return false;
    if (tile.frozen || tile.chained) return false; // Замороженные и закованные фишки двигаться не могут
    
    // Список абсолютно неподвижных препятствий
    const staticObstacles = [
        'box', 'vase', 'carpetRoll', 'cookie', 'surpriseBox', 
        'nut', 'purpleFoam', 'ringCase', 'ribbon', 'stone', 'plaid', 'ivy'
    ];
    
    if (staticObstacles.includes(tile.type)) return false;
    return true; // Все остальные фишки и спец-бустеры могут двигаться
    }
    // ----------------------------------------------------------------------
    // РАЗДЕЛ 2: ДИНАМИЧЕСКИЕ ПЕРЕМЕННЫЕ СОСТОЯНИЯ ТЕКУЩЕЙ ИГРЫ
    // ----------------------------------------------------------------------
    let currentLevelId = 1;      // Номер текущего запущенного уровня
    let GOAL_HEARTS = 12;         // Цель сбора (количество нужных элементов для победы)
    let START_MOVES = 20;         // Стартовое количество ходов, выданное на уровень
    let levelDifficulty = "normal"; // Сложность уровня (normal, medium, hard, extreme)
    let levelLayout = [];         // Двумерная карта проходимости поля (0 - дыра, 1 - плитка, 2 - ящик)

    let targetType = "heart";     // Тип цели текущего уровня (heart, box, ice и т.д.)
    let carpetGrid = [];          // Двумерная карта уложенных зеленых ковров (true/false)
    let iceGrid = [];             // Двумерная карта ледяных ячеек (0 - нет, 1 - лед)
    let chainGrid = [];           // Двумерная карта скованных ячеек (0 - нет, 1 - цепи)
    let portals = {};             // Словарь связей порталов на поле (ключ: "вход", значение: "выход")

    let grid = [];                // Двумерный массив объектов плиток (основная матрица состояния)
    let selected = null;          // Ссылка на первую выбранную фишку для совершения обмена
    let hearts = 0;               // Текущее собранное количество целевых элементов игроком
    let moves = 20;               // Текущее оставшееся количество ходов у игрока
    let boxesBroken = 0;          // Сколько деревянных коробок уничтожено за уровень
    let iceMelted = 0;            // Сколько блоков льда растоплено за уровень
    let donutsCollected = 0;      // Сколько пончиков доведено до самого низа поля
    let vasesBroken = 0;          // Счетчик разбитых ваз на уровне
    let cookiesBroken = 0;        // ИСПРАВЛЕНО: Счетчик разбитого печенья 🍪
    let cherriesCollected = 0;    // ИСПРАВЛЕНО: Счетчик освобожденных вишен 🍒
    let nutsBroken = 0;           // Разбитые орехи 🌰
    let ringsCollected = 0;       // Собранные кольца из футляров 💍
    let stoneFiguresCreated = 0;  // Собранные каменные фигурки 🗿
    let iviesCleared = 0;         // Срезанные ветки плюща 🥀
    let plaidsCleared = 0;        // Собранные пледы 🛏️

    let jellyGrid = [];           // ИСПРАВЛЕНО: Двумерная сетка слоев желе под фишками (от 6 до 0)
    let busy = false;             // Флаг блокировки интерфейса во время анимаций взрывов/падений
    let tileIdCounter = 0;        // Генератор уникальных ID для DOM-элементов плиток

    // Бустеры и комбо
    let activeBooster = null;     // Имя выбранного активного инструмента (glove, hammer и т.д.)
    let activePlanesCount = 0;    // Счетчик летящих в данный момент самолетиков
    let doublePlanesActive = false; // Флаг удвоения самолетиков (активируется пре-бустером)

    // Выбранные бустеры перед началом раунда (на пре-экране)
    let selectedPreBoosters = {
        rainbow: false,       // Старт с радужным шаром
        combo: false,         // Старт с бомбой и ракетой
        doublePlanes: false   // Удвоение всех самолетиков во время игры
    };

    let hintTimeout = null;       // Таймер ожидания для показа автоматической подсказки
    let dragStartX = 0, dragStartY = 0; // Координаты начала свайпа пальцем/мышкой
    let dragActiveTile = null;    // Ссылка на фишку, которую игрок начал тянуть пальцем

    // Ссылки на DOM-элементы интерфейса
    const boardEl = document.getElementById('board');
    const m3GoalText = document.getElementById('m3GoalText');
    const m3MovesText = document.getElementById('m3MovesText');
    const toastEl = document.getElementById('toast');

    // Кнопки панели активных внутриигровых инструментов
    const btnHammer = document.getElementById('btnHammer');
    const btnGlove = document.getElementById('btnGlove');
    const btnBroom = document.getElementById('btnBroom');
    const btnWeight = document.getElementById('btnWeight');
    const btnFan = document.getElementById('btnFan');

    const overlayResults = document.getElementById('overlayResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsText = document.getElementById('resultsText');
    const overlayPreLevel = document.getElementById('overlayPreLevel');

    // ----------------------------------------------------------------------
    // РАЗДЕЛ 3: ЭКРАН РЕЗУЛЬТАТОВ (ВЫИГРЫШ / ПРОИГРЫШ)
    // ----------------------------------------------------------------------
    let pendingResultIsWin = null; // Флаг, хранящий статус завершения раунда

    // Отображение оверлея победы/поражения
    const showOverlay = function(title, text, isWin) {
        pendingResultIsWin = !!isWin;
        if (resultsTitle) resultsTitle.textContent = title;
        if (resultsText) resultsText.textContent = text;
        if (overlayResults) overlayResults.classList.remove('hidden');
        busy = false;
    };

    // Закрытие экрана результатов и переход на глобальную карту
    if (btnResultsClose) {
        btnResultsClose.addEventListener('click', () => {
            if (overlayResults) overlayResults.classList.add('hidden');
            if (pendingResultIsWin && window.GameState) {
                window.GameState.nextLevel(); // Открываем следующий уровень в прогрессе
            }
            pendingResultIsWin = null;
            if (window.showScreen) window.showScreen('screenMap'); // Показываем экран карты
        });
    }

    // Расчет наград за прохождение уровня на основе его сложности и переданного числа ходов
    const getRewards = function(diff, movesCount) {
        let starsGained = 1;
        let baseCoins = 100;
        if (diff === "medium") baseCoins = 150;
        else if (diff === "hard") baseCoins = 250;
        else if (diff === "extreme") baseCoins = 400;
        else if (diff === "challenge") { starsGained = 3; baseCoins = 300; }
        
        // Если передан конкретный счетчик ходов, используем его, иначе берем текущие ходы
        let currentMoves = (movesCount !== undefined) ? movesCount : moves;
        let bonusCoins = currentMoves * 10;
        return { stars: starsGained, coins: baseCoins + bonusCoins, base: baseCoins, bonus: bonusCoins };
    };
// Функция легкого или сильного встряхивания игрового поля (эффект отдачи при взрывах)
    function triggerBoardShake(intensityClass = 'shake-mild') {
        if (!boardEl) return;
        boardEl.classList.remove('shake-mild', 'shake-intense');
        void boardEl.offsetWidth; // Триггерим перерисовку (Reflow) в браузере для перезапуска анимации
        boardEl.classList.add(intensityClass);
        setTimeout(() => boardEl.classList.remove('shake-mild', 'shake-intense'), 350);
    }
    // Спавнер сочных искр-частиц Homescapes при уничтожении элементов
    function spawnMatchParticles(r, c, type) {
        if (!boardEl) return;
        const count = 6; // Количество искр от одной фишки
        const colorPalette = { 
            heart: '#ff2e93',  // Розовые искры для сердец
            bullet: '#2ecc71', // Зеленые для патронов
            garlic: '#f1c40f', // Желтые для чеснока
            stake: '#3498db',  // Синие для клинков
            vial: '#9b59b6',   // Фиолетовые для колб
            coin: '#f39c12'    // Золотые для монет
        };
        const pColor = colorPalette[type] || '#ffffff';
        const cellWidth = boardEl.offsetWidth / SIZE;
        const cellHeight = boardEl.offsetHeight / SIZE;
        
        // Вычисляем центр ячейки для старта разлета частиц
        const startX = (c + 0.5) * cellWidth;
        const startY = (r + 0.5) * cellHeight;

        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'm3-spark';
            spark.style.backgroundColor = pColor;
            spark.style.left = startX + 'px';
            spark.style.top = startY + 'px';
            boardEl.appendChild(spark);

            // Математически рассчитываем круговой вектор разлета для каждой искры
            const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4 - 0.2);
            const force = 30 + Math.random() * 30; // Случайная сила импульса
            
            setTimeout(() => {
                spark.style.transform = `translate(${Math.cos(angle)*force}px, ${Math.sin(angle)*force}px) scale(0)`;
                spark.style.opacity = '0';
            }, 20);
            
            setTimeout(() => spark.remove(), 420); // Удаляем частицу после завершения анимации
        }
    }
// ----------------------------------------------------------------------
    // РАЗДЕЛ 4: ВНЕДРЕНИЕ СТИЛЕЙ КИНЕМАТОГРАФИЧЕСКИХ АНИМАЦИЙ
    // ----------------------------------------------------------------------
    (function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Стили для визуального изменения ящиков по слоям прочности */
            .tile.layer-3 .tile-inner { background: linear-gradient(135deg, #4d2b12, #2b1404); border-color: #ffd700; box-shadow: inset 0 0 12px #000; }
            .tile.layer-2 .tile-inner { background: linear-gradient(135deg, #82431a, #59290a); border-color: #c0c0c0; }
            .tile.layer-1 .tile-inner { background: linear-gradient(135deg, #b06530, #80441b); }
            
            /* Стили для льда: 2 слоя (толстый) и 1 слой (тонкий треснувший) */
            .tile.frozen-2 .tile-inner::after { border-color: #00b0ff; background: rgba(0, 176, 255, 0.45); box-shadow: inset 0 0 10px #fff; }
            .tile.frozen-1 .tile-inner::after { border-color: #80deea; background: rgba(128, 222, 234, 0.25); }

            /* Стили для цепей: двойные и одинарные */
            .tile.chain-2 .tile-inner::after { content: "⛓️" !important; font-size: 30px !important; }
            .tile.chain-1 .tile-inner::after { content: "🔗" !important; font-size: 24px !important; }

            /* Контейнеры пре-гейм бустеров на экране подготовки */
            .pre-boosters-selection { margin: 15px 0; background: rgba(0,0,0,0.15); padding: 12px; border-radius: 12px; border: 2px solid var(--ink); }
            .pre-booster-title { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: var(--ink); }
            .pre-boosters-row { display: flex; justify-content: center; gap: 14px; }
            .pre-booster-btn { background: var(--paper); border: 2px solid var(--ink); border-radius: 50%; width: 50px; height: 50px; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0 var(--ink); transition: 0.1s; }
            .pre-booster-btn.selected { background: var(--gold); transform: scale(1.1); box-shadow: 0 0 10px var(--gold), 2px 2px 0 var(--ink); }
            .pre-booster-btn .b-icon { font-size: 24px; }
            .pre-booster-btn .b-tag { position: absolute; bottom: -4px; right: -4px; background: var(--blood); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; border: 1.5px solid var(--ink); font-weight: bold; }
            
            .booster-btn { position: relative; }
            .booster-btn .b-count { position: absolute; top: -5px; right: -5px; background: var(--blood); color: #fff; font-size: 10px; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; border: 1.5px solid var(--ink); font-weight: bold; }

            /* Стили для Печенья 🍪 (3 уровня прочности) */
            .tile.cookie.layer-3 .tile-inner { background: #5c4033; border-color: #3d251a; }
            .tile.cookie.layer-2 .tile-inner { background: #8b5a2b; border-color: #5c3a21; }
            .tile.cookie.layer-1 .tile-inner { background: #cd853f; }

            /* Стили для Рулона ковра */
            .tile.carpet-roll .tile-inner { background: linear-gradient(135deg, #e91e63, #c2185b); box-shadow: inset 0 0 8px #fff; }

            /* Стили для малинового Желе под фишками с вишней ::after */
            .grid-cell.jelly {
              background: radial-gradient(circle, rgba(233, 30, 99, 0.7) 0%, rgba(136, 14, 79, 0.5) 100%) !important;
              border: 2px solid #ff4081 !important;
              box-shadow: inset 0 0 8px rgba(255,255,255,0.8);
              position: relative;
            }
            /* Плавное таяние желе по слоям от 6 до 1 */
            .grid-cell.jelly.jelly-6 { filter: brightness(0.6) saturate(1.5); }
            .grid-cell.jelly.jelly-5 { filter: brightness(0.7) saturate(1.4); }
            .grid-cell.jelly.jelly-4 { filter: brightness(0.8) saturate(1.3); }
            .grid-cell.jelly.jelly-3 { filter: brightness(0.9) saturate(1.2); }
            .grid-cell.jelly.jelly-2 { filter: brightness(1.0) saturate(1.1); }
            .grid-cell.jelly.jelly-1 { filter: brightness(1.1) saturate(1.0); }
            
            /* Вишенка внутри желе */
            .grid-cell.jelly::after {
              content: '🍒';
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              animation: jellyWobble 2s infinite alternate ease-in-out;
              z-index: 0;
              pointer-events: none;
            }
            @keyframes jellyWobble {
              from { transform: scale(0.9) rotate(-5deg); }
              to { transform: scale(1.05) rotate(5deg); }
            }

            /* Стили для Коробки-сюрприза 🎁 */
            .tile.surprise-box.layer-5 .tile-inner { background: linear-gradient(135deg, #ffd700, #ff8c00); border-color: #ff4500; }
            .tile.surprise-box.layer-4 .tile-inner { background: linear-gradient(135deg, #ff8c00, #d2691e); border-color: #8b4513; }
            .tile.surprise-box.layer-3 .tile-inner { background: linear-gradient(135deg, #d2691e, #a0522d); }
            .tile.surprise-box.layer-2 .tile-inner { background: #cd853f; }
            .tile.surprise-box.layer-1 .tile-inner { background: #f4a460; }

            /* Стили для Орехов 🌰 */
            .tile.nut.layer-3 .tile-inner { background: #3d251a; border-color: #1a0f0a; box-shadow: inset 0 0 10px #000; }
            .tile.nut.layer-2 .tile-inner { background: #5c3a21; border-color: #3d251a; }
            .tile.nut.layer-1 .tile-inner { background: #8b5a2b; }

            /* Стили для Фиолетовой пены 🧼💜 */
            .tile.purple-foam.layer-2 .tile-inner { background: radial-gradient(circle, #b39ddb 0%, #4a148c 100%); border-color: #7b1fa2; }
            .tile.purple-foam.layer-1 .tile-inner { background: radial-gradient(circle, #e1bee7 0%, #8e24aa 100%); }

            /* Стили для Футляров с Кольцами 💍 */
            .tile.ring-case.layer-3 .tile-inner { background: #4a0000; border-color: #ffd700; }
            .tile.ring-case.layer-2 .tile-inner { background: #800000; border-color: #c0c0c0; }
            .tile.ring-case.layer-1 .tile-inner { background: #c0c0c0; }

            /* Стили для Ленты с бантами 🎀 */
            .tile.ribbon .tile-inner { background: linear-gradient(135deg, #ff4081, #f50057); border-color: #ff4081; box-shadow: 0 0 8px #ff4081; }

            /* Стили для Каменных Фигурок 🗿 */
            .tile.stone.layer-3 .tile-inner { background: #424242; border-color: #212121; }
            .tile.stone.layer-2 .tile-inner { background: #616161; border-color: #424242; }
            .tile.stone.layer-1 .tile-inner { background: #9e9e9e; }

            /* Стили для Плюща 🥀 */
            .tile.ivy .tile-inner { background: linear-gradient(135deg, #2e7d32, #1b5e20); border-color: #00c853; box-shadow: inset 0 0 8px #00c853; }

            /* Стили для Пледа 🛏️ */
            .tile.plaid.layer-4 .tile-inner { background: linear-gradient(135deg, #0d47a1, #1565c0); border-color: #0d47a1; }
            .tile.plaid.layer-3 .tile-inner { background: linear-gradient(135deg, #1976d2, #1e88e5); }
            .tile.plaid.layer-2 .tile-inner { background: linear-gradient(135deg, #2196f3, #42a5f5); }
            .tile.plaid.layer-1 .tile-inner { background: #90caf9; }

            /* 🌈 Радужный шар крутится сам по себе, как диско-шар */
            .tile.rainbow .tile-inner {
                animation: specialGlow .7s ease-in-out infinite, rainbowTileSpin 2.4s linear infinite;
            }
            @keyframes rainbowTileSpin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
            }

            /* ✨ Слияние двух бустеров при свапе: увеличиваются, светятся и крутятся навстречу друг другу */
            .tile.merging { z-index: 60; }
            .tile.merging .tile-inner {
                animation: boosterMergeSpin 0.42s cubic-bezier(.34,1.56,.64,1) forwards;
                box-shadow: 0 0 22px 8px rgba(255,255,255,0.9), 0 0 40px 14px rgba(255,214,90,0.6);
            }
            @keyframes boosterMergeSpin {
                0%   { transform: scale(1) rotate(0deg); filter: brightness(1); }
                55%  { transform: scale(1.55) rotate(200deg); filter: brightness(1.6); }
                100% { transform: scale(1.3) rotate(380deg); filter: brightness(1.3); }
            }

            /* Яркая вспышка в точке слияния двух бустеров */
            .m3-merge-flash {
                position: absolute;
                width: 10px; height: 10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 65;
                background: radial-gradient(circle, #fff 0%, #ffe27a 35%, rgba(255,226,122,0) 70%);
                transform: translate(-50%, -50%) scale(0);
                animation: mergeFlashPop 0.45s ease-out forwards;
            }
            @keyframes mergeFlashPop {
                0%   { transform: translate(-50%, -50%) scale(0);  opacity: 0.9; }
                60%  { transform: translate(-50%, -50%) scale(9);  opacity: 0.7; }
                100% { transform: translate(-50%, -50%) scale(13); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    })();
// ----------------------------------------------------------------------
    // РАЗДЕЛ 5: КИНЕМАТОГРАФИЧЕСКИЕ АНИМАЦИИ И ЭФФЕКТЫ ВЗРЫВОВ
    // ----------------------------------------------------------------------

    // Полет Самолетика по вектору движения с автоматическим разворотом и шлейфом
    function animatePlaneEffect(fromRow, fromCol, toRow, toCol, callback) {
        if (!boardEl) return;
        const cellWidth = boardEl.offsetWidth / SIZE;
        const cellHeight = boardEl.offsetHeight / SIZE;
        const startX = (fromCol + 0.5) * cellWidth;
        const startY = (fromRow + 0.5) * cellHeight;
        const endX = (toCol + 0.5) * cellWidth;
        const endY = (toRow + 0.5) * cellHeight;

        // Создаем DOM-элемент самолетика
        const projectile = document.createElement('div');
        projectile.className = 'm3-projectile';
        projectile.textContent = '✈️';
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        boardEl.appendChild(projectile);

        // Математическое вычисление угла наклона полета
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        projectile.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

        // Запуск плавного полета через CSS-переход
        setTimeout(() => {
            projectile.style.left = endX + 'px';
            projectile.style.top = endY + 'px';
            
            // Генерируем красивый шлейф искр прямо за самолетиком во время движения
            let trailInterval = setInterval(() => {
                const curX = parseFloat(projectile.style.left);
                const curY = parseFloat(projectile.style.top);
                spawnMatchParticles(
                    Math.floor(curY / cellHeight),
                    Math.floor(curX / cellWidth),
                    'coin'
                );
            }, 35);

            // Удаление самолетика по прилету в цель и вызов детонации
            setTimeout(() => {
                clearInterval(trailInterval);
                projectile.remove();
                spawnMatchParticles(toRow, toCol, 'coin');
                if (callback) callback();
            }, 420);
        }, 20);
    }

    // Взрыв Бомбы (надувание + динамическая ударная волна 5х5 с встряхиванием экрана)
    function animateBombEffect(row, col) {
        if (!boardEl) return;
        const cellWidth = boardEl.offsetWidth / SIZE;
        const cellHeight = boardEl.offsetHeight / SIZE;
        const x = (col + 0.5) * cellWidth;
        const y = (row + 0.5) * cellHeight;

        // ЭФФЕКТ НАДУВАНИЯ: Создаем временную бомбу для эффекта предвкушения взрыва
        const tempBomb = document.createElement('div');
        tempBomb.className = 'm3-projectile';
        tempBomb.textContent = '💣';
        tempBomb.style.left = x + 'px';
        tempBomb.style.top = y + 'px';
        tempBomb.style.transition = 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        boardEl.appendChild(tempBomb);

        // Бомба комично надувается
        setTimeout(() => {
            tempBomb.style.transform = 'translate(-50%, -50%) scale(1.4)';
        }, 10);

        // Через 180мс происходит сам взрыв
        setTimeout(() => {
            tempBomb.remove(); // Убираем надувшуюся бомбу
            
            triggerBoardShake('shake-intense'); // Сильно трясем игровое поле

            // Создаем элемент расширяющейся ударной волны
            const shockwave = document.createElement('div');
            shockwave.className = 'bomb-shockwave';
            shockwave.style.left = x + 'px';
            shockwave.style.top = y + 'px';
            boardEl.appendChild(shockwave);

            setTimeout(() => {
                shockwave.style.transform = 'translate(-50%, -50%) scale(4.5)';
                shockwave.style.opacity = '0';
            }, 20);

            setTimeout(() => shockwave.remove(), 350);

            // Круговой спавн большого количества искр вокруг бомбы
            for (let i = 0; i < 12; i++) {
                spawnMatchParticles(row, col, 'coin');
            }
        }, 180);
    }

    // Запуск двух Ракет (сжатие на старте + вылет в разные стороны экрана)
    function animateRocketEffect(row, col, isRowDirection) {
        if (!boardEl) return;
        const cellWidth = boardEl.offsetWidth / SIZE;
        const cellHeight = boardEl.offsetHeight / SIZE;
        const startX = (col + 0.5) * cellWidth;
        const startY = (row + 0.5) * cellHeight;

        // ЭФФЕКТ НАТЯЖЕНИЯ: Создаем временную сжимающуюся ракету перед стартом
        const tempRocket = document.createElement('div');
        tempRocket.className = 'm3-projectile';
        tempRocket.textContent = '🚀';
        tempRocket.style.left = startX + 'px';
        tempRocket.style.top = startY + 'px';
        tempRocket.style.transition = 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        tempRocket.style.transform = `translate(-50%, -50%) rotate(${isRowDirection ? 90 : 0}deg)`;
        boardEl.appendChild(tempRocket);

        // Ракета сжимается по бокам, как бы натягивая тетиву перед выстрелом
        setTimeout(() => {
            tempRocket.style.transform = `translate(-50%, -50%) rotate(${isRowDirection ? 90 : 0}deg) scale(1.4, 0.7)`;
        }, 10);

        // Через 180мс происходит запуск ракет в обе стороны
        setTimeout(() => {
            tempRocket.remove(); // Убираем стартовую ракету

            triggerBoardShake('shake-mild');

            // Вычисляем углы полета: 0 и 180 (влево-вправо) или -90 и 90 (вверх-вниз)
            const angles = isRowDirection ? [0, 180] : [-90, 90];
            
            angles.forEach(angle => {
                const proj = document.createElement('div');
                proj.className = 'm3-projectile';
                proj.textContent = '🚀';
                proj.style.left = startX + 'px';
                proj.style.top = startY + 'px';
                proj.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
                boardEl.appendChild(proj);

                const rad = angle * Math.PI / 180;
                const dist = boardEl.offsetWidth; // Дистанция полета за пределы видимости
                const endX = startX + Math.cos(rad) * dist;
                const endY = startY + Math.sin(rad) * dist;

                setTimeout(() => {
                    proj.style.left = endX + 'px';
                    proj.style.top = endY + 'px';
                    
                    // Шлейф патронов-искр вслед за ракетой
                    let trail = setInterval(() => {
                        const trRow = Math.floor(parseFloat(proj.style.top) / cellHeight);
                        const trCol = Math.floor(parseFloat(proj.style.left) / cellWidth);
                        if (trRow >= 0 && trRow < SIZE && trCol >= 0 && trCol < SIZE) {
                            spawnMatchParticles(trRow, trCol, 'bullet');
                        }
                    }, 30);

                    setTimeout(() => {
                        clearInterval(trail);
                        proj.remove();
                    }, 400);
                }, 20);
            });
        }, 180);
    }

    // Радужные светящиеся щупальца, летящие от Радужного шара к фишкам выбранного цвета
    function animateRainbowTentacles(fromRow, fromCol, targets, color) {
        if (!boardEl) return;
        triggerBoardShake('shake-mild');
        const cellWidth = boardEl.offsetWidth / SIZE;
        const cellHeight = boardEl.offsetHeight / SIZE;
        const startX = (fromCol + 0.5) * cellWidth;
        const startY = (fromRow + 0.5) * cellHeight;

        targets.forEach(({r, c}) => {
            const endX = (c + 0.5) * cellWidth;
            const endY = (r + 0.5) * cellHeight;

            const dx = endX - startX;
            const dy = endY - startY;
            const dist = Math.sqrt(dx*dx + dy*dy); // Теорема Пифагора для расчета длины луча
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            // Создаем элемент неонового лазера
            const laser = document.createElement('div');
            laser.className = 'rainbow-laser';
            laser.style.left = startX + 'px';
            laser.style.top = startY + 'px';
            laser.style.width = '0px';
            laser.style.transform = `rotate(${angle}deg)`;
            
            // Радужный переливающийся градиент
            laser.style.background = `linear-gradient(90deg, #ff5a6e, #ffd15a, #7ee08c, #5ab6ff)`;
            boardEl.appendChild(laser);

            // Выстреливаем лазер наружу до целевой фишки
            setTimeout(() => {
                laser.style.width = dist + 'px';
            }, 20);

            // Растворение лазера и взрыв искр на фишке
            setTimeout(() => {
                laser.style.opacity = '0';
                spawnMatchParticles(r, c, color);
                setTimeout(() => laser.remove(), 200);
            }, 300);
        });
    }

    // Время (мс), на которое включается анимация слияния — должно совпадать с boosterMergeSpin в CSS
    const MERGE_ANIM_MS = 420;

    // Анимация слияния двух бустеров при свапе: оба увеличиваются, светятся
    // и крутятся навстречу друг другу, в точке между ними — яркая вспышка
    function animateBoosterMerge(a, b) {
        if (!boardEl) return;
        triggerBoardShake('shake-mild');
        a.el.classList.add('merging');
        b.el.classList.add('merging');

        const cellWidth = boardEl.offsetWidth / SIZE;
        const cellHeight = boardEl.offsetHeight / SIZE;
        const midX = ((a.col + b.col) / 2 + 0.5) * cellWidth;
        const midY = ((a.row + b.row) / 2 + 0.5) * cellHeight;
        const flash = document.createElement('div');
        flash.className = 'm3-merge-flash';
        flash.style.left = midX + 'px';
        flash.style.top = midY + 'px';
        boardEl.appendChild(flash);

        setTimeout(() => {
            a.el.classList.remove('merging');
            b.el.classList.remove('merging');
            flash.remove();
        }, MERGE_ANIM_MS);
    }

    // Вычисление математической зоны поражения (сетки ячеек) для одного конкретного бустера
    function footprintFor(tile){
        const cells = [];
        if(tile.type==='bomb'){
            // Бомба: радиус взрыва 5х5 ячеек вокруг эпицентра
            for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
                const rr=tile.row+dr, cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
            }
        } else if(tile.type==='rocketRow'){
            // Ракета по строке: поражает весь горизонтальный ряд
            for(let c=0;c<SIZE;c++) cells.push([tile.row,c]);
        } else if(tile.type==='rocketCol'){
            // Ракета по столбцу: поражает весь вертикальный ряд
            for(let r=0;r<SIZE;r++) cells.push([r,tile.col]);
        } else if(tile.type==='plane'){
            // Самолетик: поражает крестом свою ячейку и 4 соседних перед взлетом
            cells.push([tile.row,tile.col]);
            [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{
                const rr=tile.row+dr, cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
            });
        } else if(tile.type==='rainbow'){
            cells.push([tile.row,tile.col]);
        }
        return cells;
    }

    // Рекурсивное вычисление полной зоны детонации (для цепной активации бустеров от взрывов друг друга)
    function computeActivationFootprint(startTile){
        const visited = new Set([startTile.id]);
        const footprint = new Set();
        const queue = [startTile];
        while(queue.length){
            const t = queue.shift();
            footprintFor(t).forEach(([r,c]) => {
                footprint.add(key(r, c));
                const other = grid[r] && grid[r][c];
                // Если в зоне поражения оказался другой бустер — вовлекаем его в цепную реакцию!
                if(other && isSpecial(other.type) && !visited.has(other.id)){
                    visited.add(other.id);
                    queue.push(other);
                }
            });
        }
        return footprint;
    }

// Активация одиночного бустера простым тапом по нему
    function activateStandalone(tile) {
        if (busy) return;
        busy = true;
        moves--; // Расходуем один ход игрока
        updateMatch3HUD();

        let cells;
        if (tile.type === 'rainbow') {
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random() * colors.length)] : null;
            
            if (color) {
                const targets = [];
                for (let r = 0; r < SIZE; r++) {
                    for (let c = 0; c < SIZE; c++) {
                        if (grid[r][c] && grid[r][c].type === color) {
                            targets.push({ r, c });
                        }
                    }
                }
                animateRainbowTentacles(tile.row, tile.col, targets, color);
                cells = cellsOfColor(color);
            } else {
                cells = new Set();
            }
            cells.add(key(tile.row, tile.col));
            pulseToast('🌈 Радуга уничтожает цвет!');
            
            // Задержка удаления фишек, чтобы анимация лазеров успела проиграться
            setTimeout(() => {
                clearAndContinue(cells, [], null, null, false, false, true);
            }, 300);
            return; // Прерываем выполнение, чтобы не вызвать моментальный clearAndContinue ниже
        } else {
            if (tile.type === 'bomb') animateBombEffect(tile.row, tile.col);
            else if (tile.type === 'rocketRow') animateRocketEffect(tile.row, tile.col, true);
            else if (tile.type === 'rocketCol') animateRocketEffect(tile.row, tile.col, false);
            else if (tile.type === 'plane') {
                // ИСПРАВЛЕНО: раньше doublePlanesActive учитывался только при свайпе двух самолётиков
                // друг о друга. Теперь пре-бустер удваивает число летящих самолётиков при ЛЮБОМ запуске.
                const planeCount = doublePlanesActive ? 2 : 1;
                const usedTargets = new Set();
                for (let i = 0; i < planeCount; i++) {
                    const target = findBestTargetForPlane(tile.row, tile.col, usedTargets);
                    if (target) {
                        usedTargets.add(key(target.r, target.c));
                        // 1. Запускаем красивый полет самолетика к далекой цели
                        animatePlaneEffect(tile.row, tile.col, target.r, target.c, () => {
                            // По прилету взрываем далекую цель
                            clearAndContinue(new Set([key(target.r, target.c)]), [], null, null, false, false, true);
                        });
                    }
                }
                
                // 2. В момент взлета мгновенно уничтожаем крест из 5 клеток вокруг самого самолетика
                cells = new Set();
                footprintFor(tile).forEach(([r, c]) => {
                    cells.add(key(r, c));
                });
            }
            
            if (tile.type !== 'plane') {
                cells = computeActivationFootprint(tile);
            }
        }

        clearAndContinue(cells, [], null, null, false, false, true);
    }
// ==========================================================================
    // СИСТЕМА СОЗДАНИЯ ПЛИТОК И DRAG-AND-DROP ОБРАБОТЧИКОВ (Homescapes Physics)
    // ==========================================================================

    function iconFor(type, extraState){
        if (type === 'box') {
            const layers = extraState || 1;
            if (layers === 3) return '📦🔒'; 
            if (layers === 2) return '📦💥'; 
            return '🪵';                      
        }
        if (type === 'vase') {
            const layers = extraState || 1;
            if (layers === 2) return '🏺';   
            return '🏺💥';                    
        }
        // ИСПРАВЛЕНО: Иконка для рулона ковра (имеет 6 слоев прочности)
        if (type === 'carpetRoll') {
            const layers = extraState || 1;
            if (layers >= 5) return '🎀🧻'; // Рулон завязан лентой
            return '🧻'; // Рулон развязан
        }
        // ИСПРАВЛЕНО: Иконка для печенья (3 слоя)
        if (type === 'cookie') {
            const layers = extraState || 1;
            if (layers === 3) return '🍪🍫'; // Шоколадное печенье
            if (layers === 2) return '🍪✨'; // Крошка
            return '🍪'; // Простое печенье
        }
        // ИСПРАВЛЕНО: Иконки для Коробки-сюрприза (5 уровней прочности)
        if (type === 'surpriseBox') {
            const layers = extraState || 1;
            if (layers === 5) return '🎁⭐'; // Золотая лента
            if (layers === 4) return '🎁🔒'; // Замочек
            if (layers === 3) return '🎁💥'; // Трещина
            if (layers === 2) return '📦🎁'; // Полуоткрытая
            return '📦';                     // Обычная коробка
        }
        // ИСПРАВЛЕНО: Иконки для Орехов (3 уровня прочности)
        if (type === 'nut') {
            const layers = extraState || 1;
            if (layers === 3) return '🌰🔒'; // Сверхпрочная скорлупа
            if (layers === 2) return '🌰💥'; // Треснувший орех
            return '🌰';                     // Обычный орех
        }
        // ИСПРАВЛЕНО: Иконки для Пышной фиолетовой мыльной пены (2 уровня)
        if (type === 'purpleFoam') {
            const layers = extraState || 1;
            if (layers === 2) return '🧼💜'; // Плотная пена
            return '🧼';                     // Обычный пузырь
        }
        // ИСПРАВЛЕНО: Иконки для Футляров с Кольцами (3 уровня)
        if (type === 'ringCase') {
            const layers = extraState || 1;
            if (layers === 3) return '💍🔒'; // Закрытый бархатный футляр
            if (layers === 2) return '💍💥'; // Приоткрытый
            return '💍';                     // Сверкающее кольцо
        }
        // ИСПРАВЛЕНО: Иконки для Ленты с бантами (1 уровень)
        if (type === 'ribbon') {
            return '🎀';                     // Красивый бант
        }
        // ИСПРАВЛЕНО: Иконки для Каменных Фигурок (3 уровня)
        if (type === 'stone') {
            const layers = extraState || 1;
            if (layers === 3) return '🗿🔒'; // Необработанный камень
            if (layers === 2) return '🗿💥'; // Треснувший контур фигурки
            return '🗿';                     // Готовая фигурка древнего идола
        }
        // ИСПРАВЛЕНО: Иконки для Плюща (1 уровень)
        if (type === 'ivy') {
            return '🥀';                     // Цепкая ветвь плюща
        }
        // ИСПРАВЛЕНО: Иконки для Пледа (4 уровня сложности)
        if (type === 'plaid') {
            const layers = extraState || 1;
            if (layers === 4) return '🛏️🔒'; // Плотное лоскутное одеяло
            if (layers === 3) return '🛏️💥'; // Распоротый край
            if (layers === 2) return '🛏️✨'; // Нитки
            return '🛏️';                     // Обычное одеялко
        }
        switch(type){
            case 'bomb': return '💣';
            case 'rocketRow': return '🚀';
            case 'rocketCol': return '🚀';
            case 'plane': return '✈️';
            case 'rainbow': return '🌈';
            case 'donut': return '🍩';
            default: return (TYPES.find(t=>t.id===type) || {icon: '❓'}).icon;
        }
    }
// Применение CSS-классов спецэффектов к бустерам, льду, цепям и вазам на основе их текущего здоровья
// Обновленная функция наложения спецэффектов (БЕЗ ЗАТИРАНИЯ КЛАССОВ)
    function applySpecialClass(t){
        // Сохраняем базовый класс фишки, чтобы не пропадали картинки
        t.el.className = 'tile tile-' + t.type;
        
        if(t.type==='bomb') t.el.classList.add('bomb');
        else if(t.type==='rocketRow') t.el.classList.add('rocket-row');
        else if(t.type==='rocketCol') t.el.classList.add('rocket-col');
        else if(t.type==='plane') t.el.classList.add('plane');
        else if(t.type==='rainbow') t.el.classList.add('rainbow');
        else if(t.type==='box') {
            t.el.classList.add('box', `layer-${t.boxLayers}`);
        }
        else if(t.type==='vase') {
            t.el.classList.add('vase', `layer-${t.vaseLayers}`);
        }
        else if(t.type==='carpetRoll') {
            t.el.classList.add('carpet-roll', `layer-${t.boxLayers}`);
        }
        else if(t.type==='cookie') {
            t.el.classList.add('cookie', `layer-${t.boxLayers}`);
        }
        else if(t.type==='surpriseBox') {
            t.el.classList.add('surprise-box', `layer-${t.boxLayers}`);
        }
        else if(t.type==='nut') {
            t.el.classList.add('nut', `layer-${t.boxLayers}`);
        }
        else if(t.type==='purpleFoam') {
            t.el.classList.add('purple-foam', `layer-${t.boxLayers}`);
        }
        else if(t.type==='ringCase') {
            t.el.classList.add('ring-case', `layer-${t.boxLayers}`);
        }
        else if(t.type==='ribbon') {
            t.el.classList.add('ribbon');
        }
        else if(t.type==='stone') {
            t.el.classList.add('stone', `layer-${t.boxLayers}`);
        }
        else if(t.type==='ivy') {
            t.el.classList.add('ivy');
        }
        else if(t.type==='plaid') {
            t.el.classList.add('plaid', `layer-${t.boxLayers}`);
        }
        
        if(t.frozen) t.el.classList.add('frozen', `frozen-${t.frozenLayers}`);
        if(t.chained) t.el.classList.add('chained', `chain-${t.chainedLayers}`);
    }
    // Отрисовка физических координат фишки на экране смартфона (перевод в проценты для адаптивности)
    function setTilePos(el, row, col){
        el.style.left = (col*100/SIZE)+'%';
        el.style.top = (row*100/SIZE)+'%';
    }

    // Поиск объекта фишки в двумерной матрице grid по её строковому ID
    function findTileById(id){
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            const t = grid[r][c];
            if(t && t.id===id) return t;
        }
        return null;
    }
    // ==========================================================================
    // СИСТЕМА ИСКУССТВЕННОГО ИНТЕЛЛЕКТА (АВТОМАТИЧЕСКИЕ ПОДСКАЗКИ ХОДОВ)
    // ==========================================================================

    // Сброс таймера ожидания подсказки при любом действии игрока
    function resetHintTimer() {
        clearTimeout(hintTimeout);
        removeCurrentHints(); // Убираем старую подсветку
        hintTimeout = setTimeout(highlightPossibleMove, 4500); // Запуск таймера на 4.5 секунды
    }

    // Удаление визуального класса покачивания со всех подсказанных ранее фишек
    function removeCurrentHints() {
        document.querySelectorAll('.match-hint').forEach(el => el.classList.remove('match-hint'));
    }

    // Подсветка и запуск анимации покачивания для фишек, составляющих возможный ход
    function highlightPossibleMove() {
        if (busy || activeBooster) return; // Не подсказываем во время анимаций или прицеливания бустером
        const move = findValidSwapMove();
        if (move) {
            move.a.el.classList.add('match-hint');
            move.b.el.classList.add('match-hint');
        }
    }

    // Поиск одного любого математически возможного хода на поле
    function findValidSwapMove() {
        // 1. Проверяем горизонтальные обмены
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE - 1; c++) {
                const a = grid[r][c];
                const b = grid[r][c+1];
                if (a && b && a.type !== 'box' && b.type !== 'box' && !a.frozen && !b.frozen && !a.chained && !b.chained) {
                    swapInGrid(a, b); // Виртуально меняем местами
                    const hasMatch = collectRuns().length > 0; // Проверяем, соберется ли комбо
                    swapInGrid(a, b); // Возвращаем обратно
                    if (hasMatch) return { a, b };
                }
            }
        }
        // 2. Проверяем вертикальные обмены
        for (let r = 0; r < SIZE - 1; r++) {
            for (let c = 0; c < SIZE; c++) {
                const a = grid[r][c];
                const b = grid[r+1][c];
                if (a && b && a.type !== 'box' && b.type !== 'box' && !a.frozen && !b.frozen && !a.chained && !b.chained) {
                    swapInGrid(a, b);
                    const hasMatch = collectRuns().length > 0;
                    swapInGrid(a, b);
                    if (hasMatch) return { a, b };
                }
            }
        }
        return null; // Если возможных ходов вообще нет
    }

    // ДОБАВЛЕНО: Красивое перемешивание поля, когда у игрока не осталось ни одного валидного хода.
    // Фишки не пересоздаются и поле не "ломается" — существующие DOM-элементы физически переставляются
    // на новые клетки через ту же плавную CSS-анимацию left/top, что и при обычном падении.
    function reshuffleBoard() {
        const positions = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                // Перемешиваем только обычные подвижные фишки — препятствия, спецбустеры,
                // лёд и цепи остаются на своих местах
                if (t && !t.frozen && !t.chained && !isNotMatchable(t.type)) {
                    positions.push({ r, c });
                }
            }
        }
        if (positions.length < 4) return; // Перемешивать почти нечего

        busy = true;
        pulseToast('🔀 Нет ходов — перемешиваем поле!');

        let attempts = 0;
        let shuffledTiles;
        do {
            shuffledTiles = positions.map(p => grid[p.r][p.c]);
            // Fisher-Yates перетасовка объектов фишек между собранными позициями
            for (let i = shuffledTiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledTiles[i], shuffledTiles[j]] = [shuffledTiles[j], shuffledTiles[i]];
            }
            positions.forEach((p, idx) => { grid[p.r][p.c] = shuffledTiles[idx]; });
            attempts++;
            // Требуем: сразу после решафла нет готовых совпадений, но хотя бы один ход возможен
        } while (attempts < 40 && (collectRuns().length > 0 || !findValidSwapMove()));

        // Плавно переставляем DOM-элементы фишек на новые места — они буквально меняются местами
        positions.forEach((p, idx) => {
            moveTileTo(shuffledTiles[idx], p.r, p.c);
        });

        triggerBoardShake('shake-mild');

        setTimeout(() => {
            busy = false;
            resetHintTimer();
        }, FALL_MS + 60);
    }

    // Начало перетаскивания фишки пальцем (для мобильных) или мышкой (для ПК)
    function handleDragStart(e, tile) {
        if (busy || activeBooster || tile.type === 'box' || tile.frozen || tile.chained) return;
        dragActiveTile = tile;
        
        // Считываем стартовую позицию нажатия в зависимости от типа устройства
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartX = clientX;
        dragStartY = clientY;

        tile.el.classList.add('dragging');
        resetHintTimer(); // Сбрасываем таймер подсказки при активности игрока
    }

    // ИСПРАВЛЕНО: Движение пальца/мыши во время перетаскивания фишки.
    // Раньше эта функция вообще не была подписана ни на один обработчик событий,
    // из-за чего свайпы физически не работали — игра реагировала только на двойной тап.
    // Теперь функция подписана глобально (см. регистрацию ниже) и добавляет визуальное
    // перетаскивание "призрака" фишки за пальцем до момента пересечения порога свайпа.
    const SWIPE_THRESHOLD = 26; // Порог в пикселях, после которого жест засчитывается как свайп
    const DRAG_VISUAL_CLAMP = 34; // Насколько далеко визуально можно "оттянуть" фишку до порога

    function handleDragMove(e) {
        if (!dragActiveTile || busy) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Блокируем скролл страницы пальцем, пока идёт перетаскивание фишки
        if (dist > 4 && e.cancelable) e.preventDefault();

        // Если сдвиг больше порога — фиксируем направление свайпа и запускаем своп
        if (dist > SWIPE_THRESHOLD) { 
            const tile = dragActiveTile;
            let targetRow = tile.row;
            let targetCol = tile.col;

            // Вычисляем, куда был совершен жест: по горизонтали или вертикали
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) targetCol++; else targetCol--; // Вправо или влево
            } else {
                if (dy > 0) targetRow++; else targetRow--; // Вниз или вверх
            }

            tile.el.classList.remove('dragging');
            tile.el.style.transition = '';
            tile.el.style.transform = '';
            dragActiveTile = null; // Обнуляем активность перетаскивания сразу, чтобы не задвоить своп

            // Если целевая клетка лежит внутри игрового поля
            if (targetRow >= 0 && targetRow < SIZE && targetCol >= 0 && targetCol < SIZE) {
                const partner = grid[targetRow][targetCol];
                // Разрешаем обмен, только если цель не является коробкой, льдом или цепью
                if (partner && isMovable(partner)) {
                    tile.el.classList.remove('selected');
                    if (selected) selected.el.classList.remove('selected');
                    selected = null;
                    performSwap(tile, partner); // Запускаем анимацию обмена
                    return;
                }
            }

            // Некуда свайпать (край поля/препятствие) — упругий отскок фишки на место
            tile.el.classList.add('shake');
            setTimeout(() => tile.el.classList.remove('shake'), 220);
        } else {
            // Визуальное перетаскивание "призрака" фишки за пальцем, ограниченное радиусом ячейки
            const cx = Math.max(-DRAG_VISUAL_CLAMP, Math.min(DRAG_VISUAL_CLAMP, dx));
            const cy = Math.max(-DRAG_VISUAL_CLAMP, Math.min(DRAG_VISUAL_CLAMP, dy));
            dragActiveTile.el.style.transition = 'none';
            dragActiveTile.el.style.transform = `translate(${cx}px, ${cy}px)`;
        }
    }

    // Завершение жеста перетаскивания (отпустили палец/кнопку мыши, не дотянув до порога свайпа)
    function handleDragEnd() {
        if (dragActiveTile) {
            dragActiveTile.el.classList.remove('dragging');
            dragActiveTile.el.style.transition = 'transform .18s cubic-bezier(.34,1.56,.64,1)'; // Упругий отскок
            dragActiveTile.el.style.transform = '';
            dragActiveTile = null;
        }
    }

    // ИСПРАВЛЕНО: Регистрация глобальных обработчиков движения/отпускания — раньше их не было
    // вообще, поэтому handleDragMove/handleDragEnd никогда не вызывались, и свайпы не работали.
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('touchcancel', handleDragEnd);

    // Фабрика создания фишек: генерирует DOM-элемент, рассчитывает слои прочности и вешает обработчики жестов
    function createTile(row, col, type, spawnRow){
        const id = 'tile'+(tileIdCounter++);
        const el = document.createElement('div');
        el.className = `tile tile-${type}`;
        el.dataset.id = id;
        
        // Генерация слоев прочности для ящиков, льда, цепей и новых ваз (2 слоя)
        const initVaseLayers = (type === 'vase') ? 2 : 0; // ИСПРАВЛЕНО: Вазы всегда стартуют с 2 слоями прочности
        let initBoxLayers = 0;
        if (type === 'box') initBoxLayers = Math.random() < 0.4 ? 3 : (Math.random() < 0.5 ? 2 : 1);
        else if (type === 'carpetRoll') initBoxLayers = 6;       // Рулон имеет 6 слоев
        else if (type === 'cookie') initBoxLayers = 3;           // Печенье имеет 3 слоя
        else if (type === 'surpriseBox') initBoxLayers = 5;      // Коробка-сюрприз: 5 слоев
        else if (type === 'nut') initBoxLayers = 3;              // Орехи: 3 слоя
        else if (type === 'purpleFoam') initBoxLayers = 2;       // Фиолетовая пена: 2 слоя
        else if (type === 'ringCase') initBoxLayers = 3;         // Футляр с кольцом: 3 слоя
        else if (type === 'stone') initBoxLayers = 3;            // Идол из камня: 3 слоя
        else if (type === 'plaid') initBoxLayers = 4;            // Плед: 4 слоя
        const initFrozenLayers = (iceGrid[row] && iceGrid[row][col] === 1) ? (Math.random() < 0.5 ? 2 : 1) : 0;
        const initChainedLayers = (chainGrid[row] && chainGrid[row][col] === 1) ? (Math.random() < 0.5 ? 2 : 1) : 0;

        const inner = document.createElement('div');
        inner.className = 'tile-inner';
        
        // Передаем правильный слой в функцию iconFor в зависимости от типа объекта
        const layersState = type === 'box' ? initBoxLayers : (type === 'vase' ? initVaseLayers : 1);
        inner.textContent = iconFor(type, layersState);
        el.appendChild(inner);

        // Объект фишки, хранящий все параметры прочности и физические координаты матрицы
        const tile = {
            id, 
            type, 
            row, 
            col, 
            el, 
            inner, 
            frozen: initFrozenLayers > 0, 
            frozenLayers: initFrozenLayers,
            chained: initChainedLayers > 0,
            chainedLayers: initChainedLayers,
            boxLayers: initBoxLayers,
            vaseLayers: initVaseLayers // ИСПРАВЛЕНО: Добавляем прочность вазы в объект плитки
        };

        // Навешиваем слушатели событий мыши (ПК) и тач-интерфейса (смартфоны)
        el.addEventListener('mousedown', (e) => handleDragStart(e, tile));
        el.addEventListener('touchstart', (e) => handleDragStart(e, tile), {passive: true});
        el.addEventListener('click', onTileClick);

        // Если задана спавн-строка выше поля — фишка упадет плавно сверху
 // Установка стартовой позиции фишки без задержек и наслоений
        if(spawnRow !== undefined && spawnRow !== row){
            el.style.transition = 'none';
            setTilePos(el, spawnRow, col);
            if (boardEl) boardEl.appendChild(el);
            void el.offsetWidth; // Заставляем браузер мгновенно обновить кадр
            el.style.transition = '';
            setTilePos(el, row, col);
        } else {
            setTilePos(el, row, col);
            if (boardEl) boardEl.appendChild(el);
        }
        
        applySpecialClass(tile); // Навешиваем классы спецэффектов
        return tile;
    }

    // Сдвиг фишки на новую позицию в DOM-дереве
    function moveTileTo(tile, row, col){
        tile.row = row; tile.col = col;
        setTilePos(tile.el, row, col);
    }
// Функция послойного разрушения прочных препятствий (коробки, лед, цепи, вазы, печенье, рулоны и т.д.)
    function damageObstacle(tile, r, c, isExplosion) {
        const damage = isExplosion ? 2 : 1; // Взрывы бонусов наносят двойной урон (пробивают сразу 2 слоя)
        
        // 1. Повреждение многослойной коробки (📦)
        if (tile.type === 'box') {
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('box', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null; // Синхронное очищение ячейки в матрице (Исключает баг дыр!)
                if (targetType === "box") boxesBroken++;
                setTimeout(() => {
                    tile.el.remove();
                }, CLEAR_MS);
            }
        }
        
        // 2. Повреждение скованного льда (🧊)
        if (tile.frozen) {
            tile.frozenLayers -= damage;
            if (tile.frozenLayers > 0) {
                applySpecialClass(tile);
            } else {
                tile.frozen = false;
                tile.frozenLayers = 0;
                iceGrid[r][c] = 0;
                applySpecialClass(tile);
                if (targetType === "ice") iceMelted++;
            }
        }

        // 3. Повреждение цепей на фишке (🔗)
        if (tile.chained) {
            tile.chainedLayers -= damage;
            if (tile.chainedLayers > 0) {
                applySpecialClass(tile);
            } else {
                tile.chained = false;
                tile.chainedLayers = 0;
                chainGrid[r][c] = 0;
                applySpecialClass(tile);
                pulseToast("🔗 Цепь полностью снята!");
            }
        }

        // 4. Повреждение многослойной глиняной Вазы (🏺) (2 уровня сложности)
        if (tile.type === 'vase') {
            tile.vaseLayers -= damage;
            if (tile.vaseLayers > 0) {
                tile.inner.textContent = iconFor('vase', tile.vaseLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null;
                if (targetType === "vase") vasesBroken++;
                setTimeout(() => {
                    tile.el.remove();
                }, CLEAR_MS);
            }
        } // Скобка закрывает блок Вазы

        // 5. Повреждение Рулона Ковра (🧻) (6 уровней прочности)
        if (tile.type === 'carpetRoll') {
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('carpetRoll', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                // ДЕТОНАЦИЯ: Рулон раскрывается и стреляет ковровым крестом по всему полю!
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null;
                
                // Стреляем ковром по горизонтали и вертикали
                for (let i = 0; i < SIZE; i++) {
                    spreadCarpetAt(tile.row, i);
                    spreadCarpetAt(i, tile.col);
                }
                
                pulseToast("🌿 Ковровый рулон успешно развернут крестом!");
                triggerBoardShake('shake-intense');
                setTimeout(() => {
                    tile.el.remove();
                }, CLEAR_MS);
            }
        } // Скобка закрывает блок Рулона

        // 6. Повреждение Печенья (🍪) (3 уровня прочности)
        if (tile.type === 'cookie') {
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('cookie', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null;
                if (targetType === "cookie") cookiesBroken++;
                setTimeout(() => {
                    tile.el.remove();
                }, CLEAR_MS);
            }
        } // Скобка закрывает блок Печенья

        // 7. Орехи 🌰 (Иммунитет к обычным матчам, урон только от взрывов бонусов!)
        if (tile.type === 'nut') {
            if (!isExplosion) return; // Обычные матчи фишек рядом полностью игнорируются скорлупой!
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('nut', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null;
                if (targetType === "nut") nutsBroken++;
                setTimeout(() => { tile.el.remove(); }, CLEAR_MS);
            }
        } // Скобка закрывает блок Орехов

        // 8. Коробка-сюрприз 🎁 (При разрушении выплевывает случайный бустер)
        if (tile.type === 'surpriseBox') {
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('surpriseBox', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                
                // Спавним на этой клетке случайный ценный бустер
                const boosterTypes = ['bomb', 'rocketRow', 'rocketCol', 'plane'];
                const randomType = boosterTypes[Math.floor(Math.random() * boosterTypes.length)];
                grid[r][c] = createTile(r, c, randomType, r);
                
                pulseToast("🎁 Коробка-сюрприз открыта! Получен бустер!");
                setTimeout(() => { tile.el.remove(); }, CLEAR_MS);
            }
        } // Скобка закрывает блок Сюрприза

        // 9. Пышная фиолетовая пена 🧼💜 (Требует 2 хита)
        if (tile.type === 'purpleFoam') {
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('purpleFoam', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null;
                setTimeout(() => { tile.el.remove(); }, CLEAR_MS);
            }
        } // Скобка закрывает блок Фиолетовой пены

        // 10. Футляр с Кольцом 💍 (При открытии собирает кольцо)
        if (tile.type === 'ringCase') {
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('ringCase', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null;
                if (targetType === "ring") ringsCollected++;
                pulseToast("💍 Сверкающее кольцо найдено в футляре!");
                setTimeout(() => { tile.el.remove(); }, CLEAR_MS);
            }
        } // Скобка закрывает блок Кольца

        // 11. Лента с бантами 🎀 (При развязывании одного банта сносится вся соединенная лента на поле!)
        if (tile.type === 'ribbon') {
            levelLayout[r][c] = 1;
            tile.el.classList.add('clearing');
            grid[r][c] = null;
            
            // Находим все связанные ячейки ленты на поле и цепной реакцией убираем их
            for (let rowIdx = 0; rowIdx < SIZE; rowIdx++) {
                for (let colIdx = 0; colIdx < SIZE; colIdx++) {
                    const other = grid[rowIdx][colIdx];
                    if (other && other.type === 'ribbon') {
                        levelLayout[rowIdx][colIdx] = 1;
                        other.el.classList.add('clearing');
                        grid[rowIdx][colIdx] = null;
                        setTimeout(((tToKill) => () => tToKill.remove())(other.el), CLEAR_MS);
                    }
                }
            }
            pulseToast("🎀 Лента развязана! Все банты исчезли!");
            setTimeout(() => { tile.el.remove(); }, CLEAR_MS);
        } // Скобка закрывает блок Ленты

        // 12. Каменные Фигурки 🗿 (Иммунитет к матчам, активация только от 3-х взрывов бустеров!)
        if (tile.type === 'stone') {
            if (!isExplosion) return; // Обычные матчи фишек фигуре безразличны!
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('stone', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null;
                if (targetType === "stone") stoneFiguresCreated++;
                setTimeout(() => { tile.el.remove(); }, CLEAR_MS);
            }
        } // Скобка закрывает блок Фигурок

        // 13. Плющ 🥀 (Срезается комбинациями и бустерами)
        if (tile.type === 'ivy') {
            levelLayout[r][c] = 1;
            tile.el.classList.add('clearing');
            grid[r][c] = null;
            if (targetType === "ivy") iviesCleared++;
            setTimeout(() => { tile.el.remove(); }, CLEAR_MS);
        } // Скобка закрывает блок Плюща

        // 14. Плед 🛏️ (4 уровня плотности, лоскутное одеяло)
        if (tile.type === 'plaid') {
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('plaid', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                grid[r][c] = null;
                if (targetType === "plaid") plaidsCleared++;
                setTimeout(() => { tile.el.remove(); }, CLEAR_MS);
            }
        } // Скобка закрывает блок Пледа
    } // Скобка закрывает саму функцию damageObstacle!
// Интеллектуальный алгоритм поиска наилучшей цели для Бумажного самолетика (Homescapes Goal AI)
    function findBestTargetForPlane(excludeRow, excludeCol, usedTargets) {
        let targetRow = excludeRow, targetCol = excludeCol;
        let foundTarget = false;

        // Вспомогательная функция проверки валидности ячейки для удара
        const isValidTarget = (r, c) => {
            if (r === excludeRow && c === excludeCol) return false;
            if (usedTargets && usedTargets.has(key(r, c))) return false; // Не бьём дважды в одну клетку
            const t = grid[r] && grid[r][c];
            if (!t) return false;
            if (t.type === 'donut') return false; // Запрещаем бить по самим пончикам, их нужно только ронять
            return true;
        };

        // ==========================================================================
        // ЭТАП 1: УМНОЕ НАВЕДЕНИЕ НА КЛЮЧЕВУЮ ЦЕЛЬ УРОВНЯ
        // ==========================================================================
        
        // А. Если цель раунда — Лёд 🧊: ищем замороженные ячейки
        if (targetType === "ice") {
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (isValidTarget(r, c) && grid[r][c].frozen) {
                        return { r, c };
                    }
                }
            }
        }

        // Б. Если цель раунда — Коробки 📦: ищем коробки
        if (targetType === "box") {
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (isValidTarget(r, c) && grid[r][c].type === 'box') {
                        return { r, c };
                    }
                }
            }
        }

        // В. Если цель раунда — Пончики 🍩: ищем фишки строго ПОД пончиками, чтобы они покатились вниз!
        if (targetType === "donut") {
            for (let r = 0; r < SIZE - 1; r++) {
                for (let c = 0; c < SIZE; c++) {
                    const t = grid[r][c];
                    if (t && t.type === 'donut') {
                        // Ищем ближайшую преграждающую фишку на вертикали строго под пончиком
                        for (let checkR = r + 1; checkR < SIZE; checkR++) {
                            if (isValidTarget(checkR, c)) {
                                return { r: checkR, c };
                            }
                        }
                    }
                }
            }
        }

        // Г. Если цель раунда — Ковры 🌿: ищем ячейки без коврового покрытия
        if (targetType === "carpet") {
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (isValidTarget(r, c) && levelLayout[r][c] === 1 && !carpetGrid[r][c]) {
                        return { r, c };
                    }
                }
            }
        }

        // Д. Если цель — обычные Сердца: ищем фишки этого типа
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (isValidTarget(r, c) && grid[r][c].type === targetType) {
                    return { r, c };
                }
            }
        }

        // ==========================================================================
        // ЭТАП 2: ФОЛБЕК НА ОБЩИЕ ПРЕПЯТСТВИЯ (если цели уже убраны)
        // ==========================================================================
        
        // Проверяем оставшиеся ящики
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (isValidTarget(r, c) && grid[r][c].type === 'box') {
                    return { r, c };
                }
            }
        }
        
        // Проверяем оставшийся лед или цепи
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (isValidTarget(r, c) && (grid[r][c].frozen || grid[r][c].chained)) {
                    return { r, c };
                }
            }
        }

        // ==========================================================================
        // ЭТАП 3: СЛУЧАЙНАЯ ФИШКА (если поле уже полностью зачищено)
        // ==========================================================================
        const candidates = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (isValidTarget(r, c)) {
                    candidates.push([r, c]);
                }
            }
        }
        if (candidates.length) {
            const rnd = candidates[Math.floor(Math.random() * candidates.length)];
            return { r: rnd[0], c: rnd[1] };
        }

        return null;
    }
    // Алгоритм авто-взлома соседних коробок при матчах или взрывах бонусов рядом с ними
    function checkAndBreakBoxes(clearSet, isExplosion) {
        const boxesToBreak = new Set();

        // Проверяем все соседние ячейки (влево, вправо, вверх, вниз) от уничтожаемых фишек
        clearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const neighbors = [
                [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
            ];

            neighbors.forEach(([nr, nc]) => {
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                    const tile = grid[nr][nc];
                    if (tile && tile.type === 'box') {
                        boxesToBreak.add(key(nr, nc)); // Помечаем коробку под урон
                    }
                }
            });
        });

        // Наносим урон всем найденным соседним коробкам
        boxesToBreak.forEach(k => {
            const [br, bc] = k.split(',').map(Number);
            const boxTile = grid[br][bc];
            if (boxTile) {
                damageObstacle(boxTile, br, bc, isExplosion);
            }
        });
        return boxesToBreak;
    }
   // ----------------------------------------------------------------------
    // РАЗДЕЛ 6: ИНИЦИАЛИЗАЦИЯ И ПОСТРОЕНИЕ ПОЛЯ
    // ----------------------------------------------------------------------
    function buildInitialGrid(){
        if (!boardEl) return;
        boardEl.innerHTML = '';
        grid = [];
        for(let r=0;r<SIZE;r++) grid.push(new Array(SIZE).fill(null));

// 1. Сначала строим визуальные ячейки-подложки на поле (С АВТОМАТИЧЕСКИМ РАСЧЕТОМ КРАЯ ПОЛЯ)
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (levelLayout[r][c] !== 0) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.dataset.pos = `${r},${c}`; 

                    // Умный расчет внешнего ободка поля (определяем пустоту рядом)
                    if (r === 0 || levelLayout[r - 1][c] === 0) cell.classList.add('edge-top');
                    if (r === SIZE - 1 || levelLayout[r + 1][c] === 0) cell.classList.add('edge-bottom');
                    if (c === 0 || levelLayout[r][c - 1] === 0) cell.classList.add('edge-left');
                    if (c === SIZE - 1 || levelLayout[r][c + 1] === 0) cell.classList.add('edge-right');
                    
                    // Рисуем ковер
                    if (carpetGrid[r] && carpetGrid[r][c]) cell.classList.add('carpet');
                    
                    // Рисуем малиновое желе с вишенкой
                    if (jellyGrid[r] && jellyGrid[r][c] > 0) {
                        cell.classList.add('jelly', `jelly-${jellyGrid[r][c]}`);
                    }
                    
                    boardEl.appendChild(cell);
                }
            }
        }
        // 2. Затем генерируем и выставляем на поле все стартовые фишки и коробки
        for(let r=0;r<SIZE;r++){
            for(let c=0;c<SIZE;c++){
                const cellType = levelLayout[r][c];
                if (cellType === 0) {
                    grid[r][c] = null;
                } else if (cellType === 2) {
                    grid[r][c] = createTile(r, c, 'box', r);
                } else if (cellType === 3) {
                    grid[r][c] = createTile(r, c, 'bomb', r);
                } else if (cellType === 4) {
                    grid[r][c] = createTile(r, c, 'rocketRow', r);
                } else if (cellType === 5) {
                    grid[r][c] = createTile(r, c, 'rocketCol', r);
                } else if (cellType === 6) {
                    grid[r][c] = createTile(r, c, 'plane', r);
                } else if (cellType === 7) {
                    grid[r][c] = createTile(r, c, 'rainbow', r);
                } else if (cellType === 8) {
                    grid[r][c] = createTile(r, c, 'vase', r); 
                } else if (cellType === 9) {
                    grid[r][c] = createTile(r, c, 'carpetRoll', r); 
                } else if (cellType === 10) {
                    grid[r][c] = createTile(r, c, 'cookie', r); 
                } else if (cellType === 11) {
                    grid[r][c] = createTile(r, c, 'surpriseBox', r); // ИСПРАВЛЕНО: Коробка-сюрприз (код 11)
                } else if (cellType === 12) {
                    grid[r][c] = createTile(r, c, 'nut', r); // ИСПРАВЛЕНО: Орех (код 12)
                } else if (cellType === 13) {
                    grid[r][c] = createTile(r, c, 'purpleFoam', r); // ИСПРАВЛЕНО: Фиолетовая пена (код 13)
                } else if (cellType === 14) {
                    grid[r][c] = createTile(r, c, 'ringCase', r); // ИСПРАВЛЕНО: Футляр с кольцом (код 14)
                } else if (cellType === 15) {
                    grid[r][c] = createTile(r, c, 'ribbon', r); // ИСПРАВЛЕНО: Лента с бантами (код 15)
                } else if (cellType === 16) {
                    grid[r][c] = createTile(r, c, 'stone', r); // ИСПРАВЛЕНО: Каменная фигура (код 16)
                } else if (cellType === 17) {
                    grid[r][c] = createTile(r, c, 'ivy', r); // ИСПРАВЛЕНО: Плющ (код 17)
                } else if (cellType === 18) {
                    grid[r][c] = createTile(r, c, 'plaid', r); // ИСПРАВЛЕНО: Плед (код 18)
                } else {
                    let t, guard=0;
                    do{ t=randType(); guard++; } 
                    while(guard<30 && (
                        (c>=2 && grid[r][c-1] && grid[r][c-2] && grid[r][c-1].type===t && grid[r][c-2].type===t) ||
                        (r>=2 && grid[r-1][c] && grid[r-2][c] && grid[r-1][c].type===t && grid[r-2][c].type===t)
                    ));
                    grid[r][c] = createTile(r, c, t, r - SIZE);
                }
            }
        }

        // 3. ИСПРАВЛЕНО: Только ПОСЛЕ того как все фишки созданы, заменяем 1-2 верхние на Пончики
        if (targetType === "donut") {
            let spawned = 0;
            for (let c = 0; c < SIZE; c++) {
                if (grid[0][c] && grid[0][c].type !== 'box' && spawned < 2 && Math.random() < 0.3) {
                    grid[0][c].el.remove(); // Безопасно удаляем фишку (так как она уже гарантированно создана)
                    grid[0][c] = createTile(0, c, "donut", 0); // Ставим на её место пончик
                    spawned++;
                }
            }
        }
    } // Конец функции buildInitialGrid

    // ----------------------------------------------------------------------
    // РАЗДЕЛ 7: ГРАВИТАЦИЯ, ПОРТАЛЫ И ДИАГОНАЛЬНОЕ ОГИБАНИЕ ПРЕПЯТСТВИЙ
    // ----------------------------------------------------------------------

    // 1. Функция подсчета пончиков (Самостоятельная, на одном уровне со всеми)
    // ИСПРАВЛЕНО: функция вызывалась в damageObstacle (детонация рулона ковра) и других местах, но нигде не была объявлена — это вызывало ReferenceError и зависание игры при разрушении рулона.
    function spreadCarpetAt(r, c) {
        if (levelLayout[r] && levelLayout[r][c] === 1 && !carpetGrid[r][c]) {
            carpetGrid[r][c] = true;
            const cellEl = document.querySelector(`.grid-cell[data-pos="${r},${c}"]`);
            if (cellEl) cellEl.classList.add('carpet');
        }
    }

    function countActiveDonuts() {
        let count = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] && grid[r][c].type === 'donut') {
                    count++;
                }
            }
        }
        return count;
    }

// Движок пошаговой гравитации (ИСПРАВЛЕННЫЙ БАЛАНС СКОБОК)
    function applyGravityAndRefill(){
        let moved = true;
        let loops = 0;
        const maxLoops = 100; // Предохранитель от бесконечного цикла

        // Этот цикл крутится до тех пор, пока на поле двигается хоть одна фишка
        while (moved && loops < maxLoops) {
            moved = false; 
            loops++;
            
            // 1. Сдвигаем существующие фишки вниз
            for (let r = SIZE - 1; r >= 0; r--) {
                for (let c = 0; c < SIZE; c++) {
                    if (levelLayout[r][c] !== 0 && grid[r][c] === null) {
                        let sourceRow = -1;
                        let sourceCol = c;
                        const cellKey = key(r, c);

                        // Проверяем порталы
                        if (portals[cellKey]) {
                            const [ep_r, ep_c] = portals[cellKey].split(',').map(Number);
                            if (grid[ep_r] && grid[ep_r][ep_c] && isMovable(grid[ep_r][ep_c])) {
                                sourceRow = ep_r;
                                sourceCol = ep_c;
                            }
                        } else {
                            // Ищем ближайшую подвижную фишку СТРОГО выше по вертикали
                            for (let checkR = r - 1; checkR >= 0; checkR--) {
                                if (levelLayout[checkR][c] === 0) break; // Уперлись в пустоту на карте
                                if (grid[checkR][c] !== null) {
                                    if (isMovable(grid[checkR][c])) {
                                        sourceRow = checkR;
                                    }
                                    break; // Нашли объект, дальше вверх не смотрим
                                }
                            }
                        }

                        // Если нашли фишку, которая может упасть на это пустое место
                        if (sourceRow >= 0) {
                            const t = grid[sourceRow][sourceCol];
                            grid[r][c] = t; 
                            grid[sourceRow][sourceCol] = null;
                            moveTileTo(t, r, c); 
                            moved = true;
                            continue;
                        }

                        // Диагональное сползание, если путь вниз прегражден статичным ящиком
                        if (grid[r][c] === null && !portals[cellKey]) {
                            const sideDirections = [-1, 1];
                            if (Math.random() < 0.5) sideDirections.reverse();

                            for (const dc of sideDirections) {
                                const diagCol = c + dc;
                                const diagRow = r - 1;

                                if (diagRow >= 0 && diagCol >= 0 && diagCol < SIZE) {
                                    if (levelLayout[diagRow][diagCol] !== 0) {
                                        const t = grid[diagRow][diagCol];
                                        if (t && isMovable(t)) {
                                            grid[r][c] = t;
                                            grid[diagRow][diagCol] = null;
                                            moveTileTo(t, r, c);
                                            moved = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Генерируем новые фишки на самом верху каждого столбца
        for (let c = 0; c < SIZE; c++) {
            for (let r = 0; r < SIZE; r++) {
                const isSegmentTop = levelLayout[r][c] !== 0 && (r === 0 || levelLayout[r - 1][c] === 0);
                if (isSegmentTop && grid[r][c] === null) {
                    let spawnType = weightedRandType();
                    if (targetType === "donut" && countActiveDonuts() < 2 && Math.random() < 0.25) {
                        spawnType = "donut";
                    }
                    grid[r][c] = createTile(r, c, spawnType, r - 1);
                    moved = true;
                }
            }
        }
        
        collectDoughnuts();
        processThreatsAndJesters();
        resetHintTimer(); 
    } // Конец функции (ровно одна скобка)

// Сбор пончиков у физического низа каждой колонки поля (ИСПРАВЛЕНО ДЛЯ ФИГУРНЫХ КАРТ)
function collectDoughnuts() {
    let collectedThisTurn = 0;
    for (let c = 0; c < SIZE; c++) {
        const lowestR = getLowestPlayableRow(c); // Находим реальный край поля в этой колонке
        if (lowestR >= 0) {
            const t = grid[lowestR][c];
            if (t && t.type === 'donut') {
                t.el.classList.add('clearing');
                grid[lowestR][c] = null;
                donutsCollected++;
                collectedThisTurn++;
                setTimeout(((tileToKill) => () => tileToKill.el.remove())(t), CLEAR_MS);
            }
        }
    }
    if (collectedThisTurn > 0) {
        updateMatch3HUD();
        pulseToast(`🍩 Собрано пончиков: ${donutsCollected}!`);
        applyGravityAndRefill(); // Запуск гравитации на освободившиеся места
    }
    // 4. Обработка движения угроз: перемещение попугаев, рост плюща и мыльной пены
    function processThreatsAndJesters() {
        let spawnedFoam = false;

        // Физика попугая: взлетает вверх, если над ним пусто
        for (let r = 1; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && t.type === 'parrot' && levelLayout[r-1][c] === 1 && grid[r-1][c] === null) {
                    grid[r-1][c] = t;
                    grid[r][c] = null;
                    moveTileTo(t, r - 1, c);
                }
            }
        }

// ИСПРАВЛЕНО: Логика авто-разрастания угроз (Мыло, Фиолетовое мыло, Плющ)
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && (t.type === 'foam' || t.type === 'purpleFoam' || t.type === 'ivy') && !spawnedFoam) {
                    const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
                    for (const [nr, nc] of neighbors) {
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && levelLayout[nr][nc] === 1 && grid[nr][nc] !== null && !isSpecial(grid[nr][nc].type) && grid[nr][nc].type !== 'box' && grid[nr][nc].type !== 'donut') {
                            const victim = grid[nr][nc];
                            victim.el.remove();
                            // Рождаем угрозу соответствующего типа на захваченной ячейке
                            grid[nr][nc] = createTile(nr, nc, t.type, nr);
                            spawnedFoam = true;
                            pulseToast(t.type === 'ivy' ? "🥀 Плющ расползается!" : "🧼 Мыльная пена растекается!");
                            break;
                        }
                    }
                }
            }
        }
    }

    // Показ всплывающих текстовых подсказок по центру поля
    function pulseToast(msg) {
        if (toastEl) {
            toastEl.textContent = msg;
            toastEl.classList.add('show');
            clearTimeout(pulseToast._t);
            pulseToast._t = setTimeout(() => toastEl.classList.remove('show'), 1200);
        }
    }

// Обновление показателей интерфейса HUD во время уровня три в ряд
    function updateMatch3HUD() {
        if (m3MovesText) m3MovesText.textContent = moves;
        if (!m3GoalText) return;

        if (targetType === "carpet") {
            let currentCarpetCount = 0;
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (carpetGrid[r][c]) currentCarpetCount++;
                }
            }
            m3GoalText.textContent = `${currentCarpetCount}/${GOAL_HEARTS} 🌿`;
        } else if (targetType === "box") {
            m3GoalText.textContent = `${boxesBroken}/${GOAL_HEARTS} 📦`;
        } else if (targetType === "ice") {
            m3GoalText.textContent = `${iceMelted}/${GOAL_HEARTS} 🧊`;
        } else if (targetType === "donut") {
            m3GoalText.textContent = `${donutsCollected}/${GOAL_HEARTS} 🍩`;
        } else if (targetType === "vase") {
            m3GoalText.textContent = `${vasesBroken}/${GOAL_HEARTS} 🏺`;
        } else if (targetType === "cookie") {
            m3GoalText.textContent = `${cookiesBroken}/${GOAL_HEARTS} 🍪`; // ИСПРАВЛЕНО: Вывод печенья в HUD
        } else if (targetType === "cherry") {
            m3GoalText.textContent = `${cherriesCollected}/${GOAL_HEARTS} 🍒`;
        } else if (targetType === "nut") {
            m3GoalText.textContent = `${nutsBroken}/${GOAL_HEARTS} 🌰`; // ИСПРАВЛЕНО: Вывод орехов на HUD
        } else if (targetType === "ring") {
            m3GoalText.textContent = `${ringsCollected}/${GOAL_HEARTS} 💍`; // ИСПРАВЛЕНО: Вывод колец на HUD
        } else if (targetType === "stone") {
            m3GoalText.textContent = `${stoneFiguresCreated}/${GOAL_HEARTS} 🗿`; // ИСПРАВЛЕНО: Вывод каменных фигур на HUD
        } else if (targetType === "ivy") {
            m3GoalText.textContent = `${iviesCleared}/${GOAL_HEARTS} 🥀`; // ИСПРАВЛЕНО: Вывод плюща на HUD
        } else if (targetType === "plaid") {
            m3GoalText.textContent = `${plaidsCleared}/${GOAL_HEARTS} 🛏️`; // ИСПРАВЛЕНО: Вывод пледа на HUD
        } else {
            m3GoalText.textContent = `${hearts}/${GOAL_HEARTS} ❤️`;
        }
    }
    function getCarpetCount() {
        let count = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (carpetGrid[r] && carpetGrid[r][c]) count++;
            }
        }
        return count;
    }
    // Проверка условий победы или поражения (завершение раунда)
    function checkEndConditions(){
// ИСПРАВЛЕНО: Добавлены все новые условия победы для ультимативного пака
        let isVictory = (targetType === "box" && boxesBroken >= GOAL_HEARTS) ||
                        (targetType === "ice" && iceMelted >= GOAL_HEARTS) ||
                        (targetType === "donut" && donutsCollected >= GOAL_HEARTS) ||
                        (targetType === "carpet" && getCarpetCount() >= GOAL_HEARTS) || // Добавлено условие для ковра
                        (targetType === "vase" && vasesBroken >= GOAL_HEARTS) ||
                        (targetType === "cookie" && cookiesBroken >= GOAL_HEARTS) ||
                        (targetType === "cherry" && cherriesCollected >= GOAL_HEARTS) ||
                        (targetType === "nut" && nutsBroken >= GOAL_HEARTS) ||
                        (targetType === "ring" && ringsCollected >= GOAL_HEARTS) ||
                        (targetType === "stone" && stoneFiguresCreated >= GOAL_HEARTS) ||
                        (targetType === "ivy" && iviesCleared >= GOAL_HEARTS) ||
                        (targetType === "plaid" && plaidsCleared >= GOAL_HEARTS) ||
                        (targetType === "heart" && hearts >= GOAL_HEARTS);

        if(isVictory){
            clearTimeout(hintTimeout);
            const rewards = getRewards(levelDifficulty, moves);
            if (window.GameState) {
                window.GameState.addStars(rewards.stars);
                window.GameState.addCash(rewards.coins);
            }
            showOverlay('Успешная вылазка!', `Заказ закрыт!\nБаза: +${rewards.base}₽\nБонус за ходы: +${rewards.bonus}₽`, true);
            return;
        }

        // ДОБАВЛЕНО: Если у игрока ещё есть ходы, но на поле нет ни одной валидной комбинации —
        // красиво перемешиваем поле вместо того, чтобы игра зависала без возможных действий.
        if (moves > 0 && !findValidSwapMove()) {
            reshuffleBoard();
            return;
        }

        if(moves <= 0){
            clearTimeout(hintTimeout);
            if (window.GameState) window.GameState.loseLife();
            showOverlay('Вурдалаки победили!', `Тебе не хватило ходов. Жизнь -1.`, false);
        }
    }
    // ----------------------------------------------------------------------
    // РАЗДЕЛ 8: АНАЛИЗАТОР МАТЧЕЙ И ГЕНЕРАЦИЯ СУПЕР-ЭЛЕМЕНТОВ
    // ----------------------------------------------------------------------
    const isNotMatchable = type => isSpecial(type) || ['box', 'donut', 'vase', 'brick', 'ring', 'capsule', 'jester', 'foam', 'ivy', 'steam', 'parrot', 'pinata', 'carpetRoll', 'cookie', 'surpriseBox', 'nut', 'purpleFoam', 'ringCase', 'ribbon', 'stone', 'plaid'].includes(type);

    // Сбор всех горизонтальных и вертикальных линий одинаковых фишек (от 3-х в ряд)
    function collectRuns(){
        const runs = [];
        for(let r=0;r<SIZE;r++){
            let runStart=0;
            for(let c=1;c<=SIZE;c++){
                const cur = c<SIZE ? getType(r,c) : null;
                const prev = getType(r,c-1);
                if(cur!==null && cur===prev && !isNotMatchable(cur)) continue;
                const len = c - runStart;
                if(len>=3 && prev !== null && !isNotMatchable(prev)){
                    const cells=[]; 
                    for(let k=runStart;k<c;k++) cells.push([r,k]);
                    runs.push({cells, dir:'h', length:len, type:prev, used:false});
                }
                runStart = c;
            }
        }
        for(let c=0;c<SIZE;c++){
            let runStart=0;
            for(let r=1;r<=SIZE;r++){
                const cur = r<SIZE ? getType(r,c) : null;
                const prev = getType(r-1,c);
                if(cur!==null && cur===prev && !isNotMatchable(cur)) continue;
                const len = r - runStart;
                if(len>=3 && prev !== null && !isNotMatchable(prev)){
                    const cells=[]; 
                    for(let k=runStart;k<r;k++) cells.push([k,c]);
                    runs.push({cells, dir:'v', length:len, type:prev, used:false});
                }
                runStart = r;
            }
        }
        return runs;
    }

    function dedupeCells(cells){
        const seen = new Set(); 
        const out=[];
        cells.forEach(c=>{ 
            const k=key(c[0],c[1]); 
            if(!seen.has(k)){ seen.add(k); out.push(c); } 
        });
        return out;
    }

// Центральный приоритетный анализатор: вычисляет радуги, бомбы, ракеты, самолетики и тройки по старшинству
    function analyzeMatches(){
        const runs = collectRuns(); // Собираем все базовые непрерывные линии на поле
        
        const rainbows = [];
        const bombs = [];
        const rockets = [];
        const squares = [];
        const normalCells = new Set();

        const usedCells = new Set(); // Клетки, уже зарезервированные под создание мощных бустеров

        // 1. ПРИОРИТЕТ 1: РАДУЖНЫЙ ШАР (Линии длиной 5 и более фишек)
        runs.forEach(run => {
            if (run.length >= 5) {
                const centerCell = run.cells[Math.floor(run.length / 2)];
                rainbows.push({ type: 'rainbow', at: centerCell, cells: run.cells });
                run.cells.forEach(c => usedCells.add(key(c[0], c[1]))); // Блокируем ячейки
                run.used = true;
            }
        });

        // 2. ПРИОРИТЕТ 2: БОМБА (Пересечения горизонтальных и вертикальных линий одного цвета)
        const hRuns = runs.filter(r => !r.used && r.dir === 'h');
        const vRuns = runs.filter(r => !r.used && r.dir === 'v');

        hRuns.forEach(h => {
            for (const v of vRuns) {
                if (v.used || v.type !== h.type) continue;
                // Ищем общую (пересекающуюся) клетку-центр
                const shared = h.cells.find(hc => v.cells.some(vc => vc[0] === hc[0] && vc[1] === hc[1]));
                if (shared) {
                    h.used = true;
                    v.used = true;
                    const combinedCells = dedupeCells(h.cells.concat(v.cells));
                    bombs.push({ type: 'bomb', at: shared, cells: combinedCells });
                    combinedCells.forEach(c => usedCells.add(key(c[0], c[1]))); // Блокируем ячейки
                    break;
                }
            }
        });

        // 3. ПРИОРИТЕТ 3: РАКЕТЫ (Линии длиной ровно 4 фишки)
        runs.forEach(run => {
            if (!run.used && run.length === 4) {
                const centerCell = run.cells[Math.floor(run.length / 2)];
                const spType = run.dir === 'h' ? 'rocketCol' : 'rocketRow'; // Горизонтальный сбор дает вертикальную ракету
                rockets.push({ type: spType, at: centerCell, cells: run.cells });
                run.cells.forEach(c => usedCells.add(key(c[0], c[1]))); // Блокируем ячейки
                run.used = true;
            }
        });

        // 4. ПРИОРИТЕТ 4: БУМАЖНЫЕ САМОЛЕТИКИ (Квадраты 2х2)
        // Ищем их только на тех клетках, которые еще не были заняты Радугами, Бомбами или Ракетами
        for (let r = 0; r < SIZE - 1; r++) {
            for (let c = 0; c < SIZE - 1; c++) {
                const cells = [[r,c], [r,c+1], [r+1,c], [r+1,c+1]];
                // Если хоть одна ячейка квадрата уже занята более сильным бустером — пропускаем квадрат
                if (cells.some(cc => usedCells.has(key(cc[0], cc[1])))) continue;
                
                const t0 = getType(r, c);
                if (!t0 || isNotMatchable(t0)) continue;
                
                if (cells.every(cc => getType(cc[0], cc[1]) === t0)) {
                    squares.push({ type: 'plane', at: [r, c], cells });
                    cells.forEach(cc => usedCells.add(key(cc[0], cc[1]))); // Блокируем ячейки
                }
            }
        }

        // 5. ПРИОРИТЕТ 5: ОБЫЧНЫЕ ТРОЙКИ (Оставшиеся неиспользованные линии)
        runs.forEach(run => {
            if (!run.used) {
                run.cells.forEach(c => {
                    const cellKey = key(c[0], c[1]);
                    // Очищаем ячейку как обычную фишку только если она не вошла в состав бустера
                    if (!usedCells.has(cellKey)) {
                        normalCells.add(cellKey);
                    }
                });
            }
        });

        return { bombs, rockets, rainbows, squares, normalCells };
    }
// ----------------------------------------------------------------------
    // РАЗДЕЛ 9: ОЧИСТКА КЛЕТОК И СИНХРОННЫЙ СПАВН СУПЕР-ЭЛЕМЕНТОВ
    // ----------------------------------------------------------------------

// Функция очистки совпавших фишек, спавна бустеров и запуска цепной реакции
    function clearAndContinue(clearSet, specialSpawns, scoreSet, onComplete, preventCarpet, forceCarpet, isExplosion){
        specialSpawns = specialSpawns || [];
        const scoring = scoreSet || clearSet;
        let heartsGained=0;
        scoring.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t && t.type==='heart') heartsGained++;
        });

        const finalClearSet = new Set();
        clearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if (t) {
                // ИСПРАВЛЕНО: Пончик неуязвим к бомбам/ракетам/самолётикам. Взрыв просто "проходит" мимо
                // него, расчищая клетки вокруг и открывая путь вниз, но сам пончик не уничтожается.
                if (t.type === 'donut') {
                    return;
                }

                spawnMatchParticles(r, c, t.type);

                const isLayeredObstacle = ['box', 'vase', 'carpetRoll', 'cookie', 'surpriseBox', 'nut', 'purpleFoam', 'ringCase', 'ribbon', 'stone', 'ivy', 'plaid'].includes(t.type);
                if (isLayeredObstacle || t.frozen || t.chained) {
                    damageObstacle(t, r, c, isExplosion);
                } else {
                    finalClearSet.add(k);
                    // Бронированная проверка совпадения типа фишки с целью уровня
                    const isTargetMatch = String(targetType).trim().toLowerCase() === String(t.type).trim().toLowerCase();
                    if (isTargetMatch) {
                        hearts++;
                    }
                }
            }
        });

        // ==========================================================
        // ДОБАВЛЕНО: ЛОГИКА РАСТЕКАНИЯ КОВРА ПОД СОВПАВШИМИ ФИШКАМИ
        // ==========================================================
        let hasCarpetInMatch = false;

        // Проверяем, лежала ли хоть одна из уничтожаемых фишек на ковре
        finalClearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            if (carpetGrid[r] && carpetGrid[r][c]) {
                hasCarpetInMatch = true;
            }
        });

        // Если в комбинации или взрыве участвовал ковер — застилаем им все уничтоженные клетки!
        if (hasCarpetInMatch) {
            finalClearSet.forEach(k => {
                const [r, c] = k.split(',').map(Number);
                spreadCarpetAt(r, c);
            });
        }
        // ==========================================================

        // Запуск взлома соседних ящиков
        checkAndBreakBoxes(finalClearSet, isExplosion);

        finalClearSet.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t) t.el.classList.add('clearing');
        });

        updateMatch3HUD();
        
        setTimeout(()=>{
            // Очистка уничтоженных фишек во встроенной памяти
            finalClearSet.forEach(k=>{
                const [r,c] = k.split(',').map(Number);
                const t = grid[r][c]; 
                if(t){ t.el.remove(); grid[r][c]=null; }
                
                // Если фишка лежала поверх желе — топим желе на 1 слой
                if (jellyGrid[r] && jellyGrid[r][c] > 0) {
                    jellyGrid[r][c]--;
                    
                    const cellEl = document.querySelector(`.grid-cell[data-pos="${r},${c}"]`);
                    if (cellEl) {
                        cellEl.className = 'grid-cell';
                        
                        if (carpetGrid[r] && carpetGrid[r][c]) cellEl.classList.add('carpet');
                        
                        if (jellyGrid[r][c] > 0) {
                            cellEl.classList.add('jelly', `jelly-${jellyGrid[r][c]}`);
                        } else {
                            cherriesCollected++;
                            pulseToast("🍒 Вишня освобождена из желе!");
                            spawnMatchParticles(r, c, 'heart');
                            updateMatch3HUD();
                        }
                    }
                }
            });

            // Синхронный спавн новых бустеров на месте совпадений
            specialSpawns.forEach(s => {
                const [r, c] = s.at;
                if (!grid[r]) return;
                let t = grid[r][c];
                if (t) {
                    t.el.remove(); 
                }
                grid[r][c] = createTile(r, c, s.type, r); 
            });

            applyGravityAndRefill();
            setTimeout(()=>{
                const result = analyzeMatches();
                // ИСПРАВЛЕНО: раньше здесь проверялось только result.normalCells.size, из-за чего
                // каскадные совпадения (например 2х2-квадрат, собравшийся сам после падения фишек)
                // теряли своё превращение в бомбу/ракету/самолётик/радугу, если рядом не было ещё и
                // обычной тройки. Теперь учитываем ЛЮБой тип найденного совпадения.
                const hasAnyMatch = result.bombs.length || result.rockets.length ||
                                     result.rainbows.length || result.squares.length ||
                                     result.normalCells.size;
                if (hasAnyMatch) {
                    applyResolutionFull(result);
                } else if (onComplete) {
                    onComplete();
                } else {
                    busy = false;
                    checkEndConditions();
                }
            }, FALL_MS + 20);
        }, CLEAR_MS);
    }
// Сборка карт взрыва по типам бустеров
    function applyResolutionFull(result){
        const specialSpawns = [];
        const scoreSet = new Set();
        
        // ДОБАВЛЕНО: Обработка создания радужных шаров (для комбинаций из 5 и более фишек)
        if (result.rainbows) {
            result.rainbows.forEach(rb => { 
                rb.cells.forEach(c => scoreSet.add(key(c[0], c[1]))); 
                specialSpawns.push({ at: rb.at, type: 'rainbow' }); 
            });
        }

        result.bombs.forEach(b=>{ b.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:b.at, type:'bomb'}); });
        result.rockets.forEach(rk=>{ rk.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:rk.at, type:rk.type}); });
        result.squares.forEach(sq=>{ sq.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:sq.at, type:'plane'}); });
        result.normalCells.forEach(k=>scoreSet.add(k));
        
        const atKeys = new Set(specialSpawns.map(s=>key(s.at[0], s.at[1])));
        const clearSet = new Set();
        scoreSet.forEach(k=>{ if(!atKeys.has(k)) clearSet.add(k); });
        
        clearAndContinue(clearSet, specialSpawns, scoreSet);
    }

    // Совместная активация (свайп) двух соседних бустеров
    function comboFootprint(a, b){
        let cells = new Set();
        const kinds = [a.type, b.type];
        const has = t => kinds.includes(t);
        const isRocketType = t => t === 'rocketRow' || t === 'rocketCol';

        // ДОБАВЛЕНО: Бомба + Бомба — увеличенный вдвое радиус взрыва (7х7 вместо обычных 5х5)
        if (a.type === 'bomb' && b.type === 'bomb') {
            const cx = Math.round((a.row + b.row) / 2);
            const cy = Math.round((a.col + b.col) / 2);
            for (let dr = -3; dr <= 3; dr++) {
                for (let dc = -3; dc <= 3; dc++) {
                    const rr = cx + dr, cc = cy + dc;
                    if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) cells.add(key(rr, cc));
                }
            }
            pulseToast('💥 ДВОЙНОЙ ВЗРЫВ: увеличенный радиус!');
            return cells;
        }

        // ДОБАВЛЕНО: Ракета + Ракета — каждая превращается в крест (и строка, и столбец разом)
        if (isRocketType(a.type) && isRocketType(b.type)) {
            for (let c = 0; c < SIZE; c++) { cells.add(key(a.row, c)); cells.add(key(b.row, c)); }
            for (let r = 0; r < SIZE; r++) { cells.add(key(r, a.col)); cells.add(key(r, b.col)); }
            pulseToast('🚀 ДВОЙНОЙ ЗАЛП: крест на всё поле!');
            return cells;
        }

        // ДОБАВЛЕНО: Бомба + Ракета — три полосы (3 строки и 3 столбца) вокруг эпицентра бомбы
        if ((a.type === 'bomb' && isRocketType(b.type)) || (b.type === 'bomb' && isRocketType(a.type))) {
            const bombTile = a.type === 'bomb' ? a : b;
            for (let dr = -1; dr <= 1; dr++) {
                const rr = bombTile.row + dr;
                if (rr >= 0 && rr < SIZE) for (let c = 0; c < SIZE; c++) cells.add(key(rr, c));
            }
            for (let dc = -1; dc <= 1; dc++) {
                const cc = bombTile.col + dc;
                if (cc >= 0 && cc < SIZE) for (let r = 0; r < SIZE; r++) cells.add(key(r, cc));
            }
            pulseToast('🎯 ТРОЙНОЙ УДАР: 3 полосы!');
            return cells;
        }

        if (has('plane') && has('plane')) {
            cells = computeActivationFootprint(a);
            activePlanesCount += doublePlanesActive ? 6 : 3;
            clearAndContinue(cells, [], null, () => {
                for (let i = 0; i < (doublePlanesActive ? 6 : 3); i++) {
                    const target = findBestTargetForPlane(a.row, a.col);
                    if (target) {
                        animatePlaneEffect(a.row, a.col, target.r, target.c, () => {
                            clearAndContinue(new Set([key(target.r, target.c)]), [], null, () => {
                                activePlanesCount--; if(activePlanesCount===0){ busy=false; checkEndConditions(); }
                            }, false, false, true);
                        });
                    }
                }
            }, false, false, true);
            return new Set();
        }

        footprintFor(a).forEach(([r,c])=>cells.add(key(r,c)));
        footprintFor(b).forEach(([r,c])=>cells.add(key(r,c)));
        return cells;
    }

// Функция автоматической адаптации препятствий под цели уровня и выдачи закрепленных бесплатных бустеров
    function synchronizeObstaclesAndGoals() {
        let playableCells = [];
        let currentBoxes = 0;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (levelLayout[r][c] === 1) {
                    playableCells.push({r, c});
                } else if (levelLayout[r][c] === 2) {
                    currentBoxes++;
                }
            }
        }

        // ИСПРАВЛЕНО: обобщенная система размещения препятствий-целей на карте.
        // Раньше только "box" реально размещался на поле — vase/cookie/nut/ring/stone/plaid/ivy
        // были полностью реализованы в match3.js, но levels.js никогда не выставлял для них
        // targetType, а сама эта функция не умела их расставлять. Теперь любая цель из карты
        // ниже автоматически получает нужное количество фишек-препятствий на поле.
        const OBSTACLE_TARGET_MAP = {
            box:   { code: 2,  max: 18 },
            vase:  { code: 8,  max: 14 },
            cookie:{ code: 10, max: 14 },
            nut:   { code: 12, max: 12 },
            ring:  { code: 14, max: 10 },
            stone: { code: 16, max: 10 },
            plaid: { code: 18, max: 10 },
            ivy:   { code: 17, max: 12 }
        };

        if (OBSTACLE_TARGET_MAP[targetType]) {
            const cfg = OBSTACLE_TARGET_MAP[targetType];
            let currentCount = 0;
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (levelLayout[r][c] === cfg.code) currentCount++;
                }
            }
            let targetCount = Math.min(GOAL_HEARTS, cfg.max);
            while (currentCount < targetCount && playableCells.length > 0) {
                const rndIdx = Math.floor(Math.random() * playableCells.length);
                const cell = playableCells.splice(rndIdx, 1)[0];
                levelLayout[cell.r][cell.c] = cfg.code;
                currentCount++;
            }
            GOAL_HEARTS = currentCount;
            if (cfg.code === 2) currentBoxes = currentCount; // Синхронизируем счетчик для системы бустеров-подарков ниже
        }

        // ИСПРАВЛЕНО: изредка добавляем "бонусные" препятствия без отдельной цели — они просто
        // разнообразят уровень и дают приятные сюрпризы (не были нигде задействованы раньше).
        if (targetType === "carpet") {
            // Рулон ковра (🧻) помогает быстрее раскрыть новые клетки ковра при взрыве крестом
            for (let n = 0; n < 2 && playableCells.length > 0; n++) {
                const rndIdx = Math.floor(Math.random() * playableCells.length);
                const cell = playableCells.splice(rndIdx, 1)[0];
                levelLayout[cell.r][cell.c] = 9; // carpetRoll
            }
        } else if (levelDifficulty === "hard" || levelDifficulty === "extreme" || levelDifficulty === "challenge") {
            // На сложных уровнях изредка добавляем коробку-сюрприз и фиолетовую пену для разнообразия
            if (Math.random() < 0.5 && playableCells.length > 0) {
                const rndIdx = Math.floor(Math.random() * playableCells.length);
                const cell = playableCells.splice(rndIdx, 1)[0];
                levelLayout[cell.r][cell.c] = 11; // surpriseBox
            }
            if (Math.random() < 0.35 && playableCells.length > 0) {
                const rndIdx = Math.floor(Math.random() * playableCells.length);
                const cell = playableCells.splice(rndIdx, 1)[0];
                levelLayout[cell.r][cell.c] = 13; // purpleFoam
            }
        }

        // СИСТЕМА ЗАКРЕПЛЕНИЯ БЕСПЛАТНЫХ БУСТЕРОВ ЗА СЛОЖНЫМИ УРОВНЯМИ
        let boostersToSpawn = []; 

        if (levelDifficulty === "challenge") {
            boostersToSpawn = [6, 6, 3]; // 2 Самолетика и Бомба
            setTimeout(() => pulseToast("🎁 Сюжетное испытание! Дарим 2 Самолетика и Бомбу!"), 900);
        } else if (levelDifficulty === "extreme") {
            boostersToSpawn = [7, 3]; // Радуга и Бомба
            setTimeout(() => pulseToast("🎁 Ультра-сложная чистка! Дарим Радужный шар и Бомбу!"), 900);
        } else if (levelDifficulty === "hard") {
            boostersToSpawn = [3, Math.random() < 0.5 ? 4 : 5]; // Бомба и Ракета
            setTimeout(() => pulseToast("🎁 Опасный бой! Дарим Бомбу и Ракету!"), 900);
        } else {
            if (currentBoxes >= 12) {
                boostersToSpawn = [3, Math.random() < 0.5 ? 4 : 5]; 
                setTimeout(() => pulseToast("🎁 Много коробок! Дарим Бомбу и Ракету для прорыва!"), 900);
            } else if (currentBoxes >= 6) {
                boostersToSpawn = [3]; 
                setTimeout(() => pulseToast("🎁 Сложный завал ящиков! Дарим стартовую Бомбу!"), 900);
            }
        }

        boostersToSpawn.forEach(type => {
            if (playableCells.length > 0) {
                const rndIdx = Math.floor(Math.random() * playableCells.length);
                const cell = playableCells.splice(rndIdx, 1)[0];
                levelLayout[cell.r][cell.c] = type; 
            }
        });

        // ==========================================================
        // ДОБАВЛЕНО: КАЛИБРОВКА ЛЬДА И КОВРОВ ПОД РЕАЛЬНОЕ КОЛИЧЕСТВО НА ПОЛЕ
        // ==========================================================
        if (targetType === "ice") {
            let currentIceCount = 0;
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (iceGrid[r] && iceGrid[r][c] === 1) {
                        currentIceCount++;
                    }
                }
            }
            // Если на поле по какой-то причине нет льда, нанесем его принудительно
            if (currentIceCount === 0) {
                let neededIce = Math.min(GOAL_HEARTS, 12);
                while (currentIceCount < neededIce && playableCells.length > 0) {
                    const rndIdx = Math.floor(Math.random() * playableCells.length);
                    const cell = playableCells.splice(rndIdx, 1)[0];
                    iceGrid[cell.r][cell.c] = 1;
                    currentIceCount++;
                }
            }
            // Корректируем финальную цель под реальное число ледяных ячеек
            GOAL_HEARTS = currentIceCount;
        }

        if (targetType === "carpet") {
            let playableCount = 0;
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (levelLayout[r][c] === 1) playableCount++;
                }
            }
            // Цель по коврам не может превышать количество доступных клеток на поле
            GOAL_HEARTS = Math.min(GOAL_HEARTS, playableCount);
        }
    }
    // Функция спавна дополнительных пре-бустеров, выбранных игроком на старте (плюсуются к базовым)
    function applySelectedPreBoosters() {
        let playableCells = [];
        
        // Находим все оставшиеся свободные ячейки, где нет коробок или других бустеров
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (levelLayout[r][c] === 1) {
                    playableCells.push({r, c});
                }
            }
        }

        // Плюсуем выбранный Радужный шар (код 7)
        if (selectedPreBoosters.rainbow && playableCells.length > 0) {
            const rndIdx = Math.floor(Math.random() * playableCells.length);
            const cell = playableCells.splice(rndIdx, 1)[0];
            levelLayout[cell.r][cell.c] = 7; 
        }

        // Плюсуем выбранное Комбо (Бомба + Ракета)
        if (selectedPreBoosters.combo && playableCells.length > 1) {
            const cell1 = playableCells.splice(Math.floor(Math.random() * playableCells.length), 1)[0];
            const cell2 = playableCells.splice(Math.floor(Math.random() * playableCells.length), 1)[0];
            levelLayout[cell1.r][cell1.c] = 3; 
            levelLayout[cell2.r][cell2.c] = Math.random() < 0.5 ? 4 : 5; 
        }
        
        // Запоминаем статус активации Двойных самолетиков
        doublePlanesActive = selectedPreBoosters.doublePlanes;
    } // Конец функции applySelectedPreBoosters
    // ----------------------------------------------------------------------
    // РАЗДЕЛ 10: ЛОГИКА 5 АКТИВНЫХ ИНСТРУМЕНТОВ БРАКОНЬЕРА
    // ----------------------------------------------------------------------
    const ACTIVE_BOOSTER_COSTS = { hammer: 150, glove: 200, broom: 300, weight: 300, fan: 100 };
    let gloveSelectedTile = null;

    function refreshActiveBoostersHUD() {
        if (!window.GameState) return;
        const bTypes = ['hammer', 'glove', 'broom', 'weight', 'fan'];
        bTypes.forEach(type => {
            const elCount = document.getElementById(`count${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (elCount) {
                elCount.textContent = window.GameState.getActiveBoosterCount(type);
            }
        });
    }

    function toggleActiveBooster(type) {
        if (busy) return;
        
        if (type === 'fan') {
            if (window.GameState && window.GameState.useOrBuyActiveBooster('fan', ACTIVE_BOOSTER_COSTS.fan)) {
                shuffleBoard();
                refreshActiveBoostersHUD();
            } else {
                pulseToast("Недостаточно монет!");
            }
            return;
        }

        if (activeBooster === type) {
            activeBooster = null;
            gloveSelectedTile = null;
            setBoosterUI(null);
            return;
        }

        activeBooster = type;
        setBoosterUI(type);
        pulseToast(`Активирован инструмент. Выберите цель!`);
    }

    function setBoosterUI(type) {
        ['Hammer', 'Glove', 'Broom', 'Weight', 'Fan'].forEach(t => {
            const btn = document.getElementById(`btn${t}`);
            if (btn) btn.classList.toggle('active', type === t.toLowerCase());
        });
        if (boardEl) {
            if (type) boardEl.classList.add('aiming');
            else boardEl.classList.remove('aiming');
        }
    }

    function executeBoosterAction(tile) {
        const type = activeBooster;
        const cost = ACTIVE_BOOSTER_COSTS[type];

        if (type === 'glove') {
            if (!gloveSelectedTile) {
                gloveSelectedTile = tile;
                tile.el.classList.add('selected');
                pulseToast("Теперь выберите соседнюю фишку для обмена!");
                return;
            } else {
                const adjacent = Math.abs(gloveSelectedTile.row - tile.row) + Math.abs(gloveSelectedTile.col - tile.col) === 1;
                gloveSelectedTile.el.classList.remove('selected');
                
                if (adjacent && window.GameState && window.GameState.useOrBuyActiveBooster('glove', cost)) {
                    busy = true;
                    swapInGrid(gloveSelectedTile, tile);
                    moveTileTo(gloveSelectedTile, gloveSelectedTile.row, gloveSelectedTile.col);
                    moveTileTo(tile, tile.row, tile.col);
                    
                    setTimeout(() => {
                        applyGravityAndRefill();
                        busy = false;
                    }, SWAP_MS);
                    
                    activeBooster = null;
                    gloveSelectedTile = null;
                    setBoosterUI(null);
                    refreshActiveBoostersHUD();
                } else {
                    gloveSelectedTile = null;
                    pulseToast("Обмен отменен!");
                }
            }
            return;
        }

        if (window.GameState && window.GameState.useOrBuyActiveBooster(type, cost)) {
            activeBooster = null;
            setBoosterUI(null);
            busy = true;
            let cells = new Set();

            if (type === 'hammer') {
                cells.add(key(tile.row, tile.col));
                pulseToast("🔨 Нанесен точечный удар!");
            } else if (type === 'broom') {
                for (let c = 0; c < SIZE; c++) cells.add(key(tile.row, c));
                pulseToast("🧹 Горизонтальный ряд сметен!");
            } else if (type === 'weight') {
                for (let r = 0; r < SIZE; r++) cells.add(key(r, tile.col));
                pulseToast("🥌 Вертикальный ряд раздавлен!");
            }

            clearAndContinue(cells, [], null, null, false, false, true);
            refreshActiveBoostersHUD();
        } else {
            pulseToast("Недостаточно монет!");
            activeBooster = null;
            setBoosterUI(null);
        }
    }

    if (btnHammer) btnHammer.addEventListener('click', () => toggleActiveBooster('hammer'));
    if (btnGlove) btnGlove.addEventListener('click', () => toggleActiveBooster('glove'));
    if (btnBroom) btnBroom.addEventListener('click', () => toggleActiveBooster('broom'));
    if (btnWeight) btnWeight.addEventListener('click', () => toggleActiveBooster('weight'));
    if (btnFan) btnFan.addEventListener('click', () => toggleActiveBooster('fan'));

    // ----------------------------------------------------------------------
    // РАЗДЕЛ 11: КЛИКИ И СВАЙПЫ (УПРАВЛЕНИЕ)
    // ----------------------------------------------------------------------
    function onTileClick(e){
        if(busy) return;
        const tile = findTileById(e.currentTarget.dataset.id);
        if(!tile) return;

        resetHintTimer();

        if (activeBooster) {
            executeBoosterAction(tile);
            return;
        }

        if(!isMovable(tile)) return;

        if(selected === null){
            if(isSpecial(tile.type)) { activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList.add('selected');
            return;
        }
        if(selected === tile){
            selected = null;
            tile.el.classList.remove('selected');
            return;
        }
        const adjacent = Math.abs(selected.row-tile.row) + Math.abs(selected.col-tile.col) === 1;
        selected.el.classList.remove('selected');
        if(!adjacent){
            if(isSpecial(tile.type)){ selected=null; activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList.add('selected');
            return;
        }
        const a = selected, b = tile;
        selected = null;
        performSwap(a,b);
    }

    function swapInGrid(a,b){
        const ar=a.row, ac=a.col, br=b.row, bc=b.col;
        grid[ar][ac]=b; grid[br][bc]=a;
        a.row=br; a.col=bc;
        b.row=ar; b.col=ac;
    }

    function performSwap(a,b){
        busy = true;
        swapInGrid(a,b);
        moveTileTo(a, a.row, a.col);
        moveTileTo(b, b.row, b.col);
        
        setTimeout(()=>{
            const aSpecial = isSpecial(a.type), bSpecial = isSpecial(b.type);
if(aSpecial && bSpecial){
            moves--; updateMatch3HUD();
            animateBoosterMerge(a, b);
            setTimeout(() => {
            const kinds = [a.type, b.type];
            
            // Если одно из спец-средств — Радужный шар
            if (kinds.includes('rainbow')) {
                const rainbowTile = a.type === 'rainbow' ? a : b;
                const boosterTile = a.type === 'rainbow' ? b : a;
                const boosterType = boosterTile.type;

                // Выбираем случайный цвет для трансформации
                const colors = presentColors();
                const targetColor = colors.length ? colors[Math.floor(Math.random() * colors.length)] : randType();

                const transformCells = [];
                for (let r = 0; r < SIZE; r++) {
                    for (let c = 0; c < SIZE; c++) {
                        if (grid[r][c] && grid[r][c].type === targetColor) {
                            transformCells.push({r, c});
                        }
                    }
                }

                pulseToast(`🌈 РЕАКЦИЯ: Массовый запуск ${boosterType === 'bomb' ? '💣' : boosterType.includes('rocket') ? '🚀' : '✈️'}!`);
                animateRainbowTentacles(rainbowTile.row, rainbowTile.col, transformCells, targetColor);

                setTimeout(() => {
                    // Удаляем сам радужный шар и исходный бустер
                    const clearSet = new Set([key(rainbowTile.row, rainbowTile.col), key(boosterTile.row, boosterTile.col)]);
                    
                    // Создаем новые бустеры на месте фишек выбранного цвета
                    const specialSpawns = transformCells.map(cell => ({
                        at: [cell.r, cell.c],
                        type: boosterType
                    }));

                    clearAndContinue(clearSet, specialSpawns, null, () => {
                        // Активируем все созданные бустеры во второй фазе
                        let cellsToExplode = new Set();
                        for (let r = 0; r < SIZE; r++) {
                            for (let c = 0; c < SIZE; c++) {
                                const t = grid[r][c];
                                if (t && isSpecial(t.type)) {
                                    computeActivationFootprint(t).forEach(k => cellsToExplode.add(k));
                                }
                            }
                        }
                        if (cellsToExplode.size > 0) {
                            setTimeout(() => {
                                clearAndContinue(cellsToExplode, [], null, null, false, false, true);
                            }, 150);
                        }
                    }, false, false, true);
                }, 300);
                return;
            }

            const cells = comboFootprint(a,b);
            if (cells.size > 0) {
                clearAndContinue(cells, []);
            }
            }, MERGE_ANIM_MS);
            return;
            }
            if(aSpecial || bSpecial){
                const special = aSpecial ? a : b;
                const partner = aSpecial ? b : a;
                moves--; updateMatch3HUD();
                let cells;
                if(special.type === 'rainbow'){
                const targets = [];
                for (let r = 0; r < SIZE; r++) {
                    for (let c = 0; c < SIZE; c++) {
                        if (grid[r][c] && grid[r][c].type === partner.type) {
                            targets.push({ r, c });
                        }
                    }
                }
                // Запуск анимации щупалец к фишкам выбранного цвета
                animateRainbowTentacles(special.row, special.col, targets, partner.type);
                
                cells = cellsOfColor(partner.type);
                cells.add(key(special.row, special.col));
                
                // Задержка очищения
                setTimeout(() => {
                    clearAndContinue(cells, [], null, null, false, false, true);
                }, 300);
            } else {
                cells = computeActivationFootprint(special);
                clearAndContinue(cells, [], null, null, false, false, true);
            }
            return;
            }
            const result = analyzeMatches();
            const hasMatch = result.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.size;
            if(!hasMatch){
                swapInGrid(a,b);
                moveTileTo(a, a.row, a.col);
                moveTileTo(b, b.row, b.col);
                a.el.classList.add('shake');
                b.el.classList.add('shake');
                setTimeout(()=>{
                    a.el.classList.remove('shake');
                    b.el.classList.remove('shake');
                    busy = false;
                }, 220);
                pulseToast('Нет совпадения');
                return;
            }
            moves--; updateMatch3HUD();
            applyResolutionFull(result);
        }, SWAP_MS);
    }

    function presentColors() {
        const normalTypes = TYPES.map(t => t.id);
        const colors = new Set();
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && normalTypes.includes(t.type)) colors.add(t.type);
            }
        }
        return Array.from(colors);
    }

    function cellsOfColor(type) {
        const cells = new Set();
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && t.type === type) cells.add(key(r, c));
            }
        }
        return cells;
    }

    function shuffleBoard() {
        const movableTiles = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (levelLayout[r][c] === 1 && t && t.type !== 'box' && t.type !== 'donut' && !t.frozen && !t.chained && !isSpecial(t.type)) {
                    movableTiles.push(t);
                }
            }
        }
        if (movableTiles.length < 2) return;
        const types = movableTiles.map(t => t.type);
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        movableTiles.forEach((tile, idx) => {
            tile.type = types[idx];
            tile.inner.textContent = iconFor(tile.type, tile.boxLayers);
            applySpecialClass(tile);
        });
        triggerBoardShake('shake-mild');
        pulseToast("🌪️ Вентилятор перемешал фишки!");
    }

    // ----------------------------------------------------------------------
    // РАЗДЕЛ 12: КАРТОЧКА ПРЕ-ЛЕВЕЛА И СТАРТ УРОВНЯ
    // ----------------------------------------------------------------------
// Функция подготовки параметров уровня перед показом пре-карточки
    function openPreLevelScreen(levelId) {
        const levelData = window.LEVELS ? window.LEVELS[levelId - 1] : null;
        if (!levelData) return;

        currentLevelId = levelId;
        levelDifficulty = levelData.difficulty;
        targetType = levelData.targetType || "heart";
        GOAL_HEARTS = levelData.heartsGoal || 12; // Синхронизируем цель с базой уровней
        
        selectedPreBoosters = { rainbow: false, combo: false, doublePlanes: false };
        updatePreBoostersUI();

// Инициализируем чистые базовые двумерные сетки 8х8
        carpetGrid = []; iceGrid = []; chainGrid = []; jellyGrid = [];
        for (let r = 0; r < SIZE; r++) {
            carpetGrid.push(new Array(SIZE).fill(false));
            iceGrid.push(new Array(SIZE).fill(0));
            chainGrid.push(new Array(SIZE).fill(0));
            jellyGrid.push(new Array(SIZE).fill(0)); // ИСПРАВЛЕНО: Инициализируем пустую сетку желе 8х8
        }
        // Копируем данные из шаблона уровня ТОЛЬКО если они реально там заполнены (исключает перезапись на пустые [])
        if (levelData.carpetLayout && levelData.carpetLayout.length > 0) {
            carpetGrid = JSON.parse(JSON.stringify(levelData.carpetLayout));
        }
        if (levelData.iceLayout && levelData.iceLayout.length > 0) {
            iceGrid = JSON.parse(JSON.stringify(levelData.iceLayout));
        }
        if (levelData.chainLayout && levelData.chainLayout.length > 0) {
            chainGrid = JSON.parse(JSON.stringify(levelData.chainLayout));
        }
        if (levelData.jellyLayout && levelData.jellyLayout.length > 0) {
            jellyGrid = JSON.parse(JSON.stringify(levelData.jellyLayout));
        }
        levelLayout = JSON.parse(JSON.stringify(levelData.layout));

        // Безопасно адаптируем препятствия и цели
        synchronizeObstaclesAndGoals();

        START_MOVES = levelData.moves;

        const title = document.getElementById('preLevelTitle');
        if (title) title.textContent = `Уровень ${currentLevelId}`;

        const goalVal = document.getElementById('preLevelGoalVal');
        if (goalVal) {
            const GOAL_LABELS = {
                box: "📦 Многослойных Ящиков",
                ice: "🧊 Клеток со Льдом",
                donut: "🍩 Пончиков в самый низ",
                carpet: "🌿 Зеленых Ковров",
                vase: "🏺 Ваз",
                cookie: "🍪 Печенья",
                nut: "🌰 Орехов",
                ring: "💍 Футляров с Кольцами",
                stone: "🗿 Каменных Фигурок",
                plaid: "🛏️ Пледов",
                ivy: "🥀 Побегов Плюща"
            };
            goalVal.textContent = `${GOAL_HEARTS} ${GOAL_LABELS[targetType] || '❤️ Вампирских Сердец'}`;
        }

        const rewards = getRewards(levelDifficulty, START_MOVES);
        const preStars = document.getElementById('preRewardStars');
        if (preStars) preStars.textContent = `⭐ +${rewards.stars}`;
        const preCoins = document.getElementById('preRewardCoins');
        if (preCoins) preCoins.textContent = `💰 +${rewards.base}₽`;

        if (overlayPreLevel) overlayPreLevel.classList.remove('hidden');
    }

    function updatePreBoostersUI() {
        if (!window.GameState) return;
        ['rainbow', 'combo', 'doublePlanes'].forEach(type => {
            const btn = document.getElementById(`preBtn${type.charAt(0).toUpperCase() + type.slice(1)}`);
            const label = document.getElementById(`label${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (btn && label) {
                const count = window.GameState.getPreBoosterCount(type);
                label.textContent = count > 0 ? count : "500₽";
                btn.classList.toggle('selected', selectedPreBoosters[type]);
            }
        });
    }

    ['rainbow', 'combo', 'doublePlanes'].forEach(type => {
        const btn = document.getElementById(`preBtn${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (btn) {
            btn.addEventListener('click', () => {
                const cost = 500;
                if (selectedPreBoosters[type]) {
                    selectedPreBoosters[type] = false;
                } else {
                    if (window.GameState.getPreBoosterCount(type) > 0 || window.GameState.getCash() >= cost) {
                        selectedPreBoosters[type] = true;
                    } else {
                        pulseToast("Недостаточно монет для покупки бустера!");
                    }
                }
                updatePreBoostersUI();
            });
        }
    });

    if (btnCancelPreLevel) {
        btnCancelPreLevel.addEventListener('click', () => {
            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            if (window.showScreen) window.showScreen('screenMap');
        });
    }

// Обработчик нажатия кнопки "В бой" на карточке подготовки к уровню
    if (btnStartMatch3) {
        btnStartMatch3.addEventListener('click', () => {
            // Списываем или покупаем выбранные пре-бустеры перед началом раунда
            ['rainbow', 'combo', 'doublePlanes'].forEach(type => {
                if (selectedPreBoosters[type]) {
                    window.GameState.useOrBuyPreBooster(type, 500);
                }
            });

            // ПРИМЕНЯЕМ И ПЛЮСУЕМ ВЫБРАННЫЕ БУСТЕРЫ К КАРТЕ ПОЛЯ ПЕРЕД СТАРТОМ!
            applySelectedPreBoosters();

            // Закрываем пре-экран и переключаемся на игровое поле
            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            if (window.showScreen) window.showScreen('screenMatch3');

            // Полностью обнуляем все показатели раунда
            hearts = 0; 
            boxesBroken = 0; 
            iceMelted = 0; 
            donutsCollected = 0;
            vasesBroken = 0;
            cookiesBroken = 0;   
            cherriesCollected = 0; 
            nutsBroken = 0;
            ringsCollected = 0;
            stoneFiguresCreated = 0;
            iviesCleared = 0;
            plaidsCleared = 0;
            activeBooster = null; 
            gloveSelectedTile = null;
            if (boardEl) boardEl.classList.remove('aiming');
            
            // Обновляем HUD активных инструментов
            refreshActiveBoostersHUD();

            // Запускаем и отрисовываем уровень
            moves = START_MOVES;
            buildInitialGrid();
            updateMatch3HUD();
        });
    }

    // Находим самую нижнюю активную ячейку для конкретной колонки
    function getLowestPlayableRow(c) {
        for (let r = SIZE - 1; r >= 0; r--) {
            if (levelLayout[r] && levelLayout[r][c] !== 0) {
                return r;
            }
        }
        return -1; // Если вся колонка пустая
    }

    // Экспортируем функцию открытия пре-экрана глобально для карты
    window.openPreLevelScreen = openPreLevelScreen;
    console.log("match3.js: Все модули игры успешно запущены в едином пространстве!");
})();
