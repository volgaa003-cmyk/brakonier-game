// ================================================
// levels.js (ОБНОВЛЕННЫЙ — С ЦЕПЯМИ, ПОРТАЛАМИ И ПОНЧИКАМИ)
// Процедурный генератор Homescapes-полей
// ================================================

(function() {
    const SIZE = 8; 
    const LEVELS = [];
    const TOTAL_LEVELS = 10050;

    console.log("levels.js: Инициализация новых механик...");

    const LAYOUTS = {
        square: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        centerHole: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        islands: [
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1]
        ],
        fortress: [
            [1, 0, 1, 0, 0, 1, 0, 1], 
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 2, 2, 1, 1, 1], 
            [1, 1, 1, 2, 2, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0]
        ],
        cross: [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0]
        ]
    };

    function getLayoutForLevel(levelId) {
        if (levelId <= 5) return JSON.parse(JSON.stringify(LAYOUTS.square));
        const cycle = levelId % 5;
        if (cycle === 0) return JSON.parse(JSON.stringify(LAYOUTS.fortress));
        if (cycle === 1) return JSON.parse(JSON.stringify(LAYOUTS.islands));
        if (cycle === 2) return JSON.parse(JSON.stringify(LAYOUTS.centerHole));
        return JSON.parse(JSON.stringify(LAYOUTS.cross));
    }

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let heartsGoal = 12;
        let moves = 22;
        let difficulty = "normal";
        let layout = getLayoutForLevel(i);
        
        let iceLayout = [];
        let carpetLayout = [];
        let chainLayout = [];
        let portals = {};

        for (let r = 0; r < SIZE; r++) {
            iceLayout.push(new Array(SIZE).fill(0));
            carpetLayout.push(new Array(SIZE).fill(0));
            chainLayout.push(new Array(SIZE).fill(0));
        }

        // Базовые параметры сложности
        if (i <= 20) {
            heartsGoal = 10 + Math.floor(i * 1.1);
            moves = 24 - Math.floor(i / 10);
        } else {
            heartsGoal = 32 + Math.floor((i - 20) * 0.8);
            moves = 22 - Math.floor((i - 20) / 15);
        }

        heartsGoal = Math.max(10, heartsGoal + Math.floor(Math.random() * 5) - 2);
        moves = Math.max(10, moves + Math.floor(Math.random() * 3) - 1);

        // Распределение типов целей
        let targetType = "heart";
        
        if (i === 3) {
            // Обучающий уровень 3: Цепи 🔗
            targetType = "heart";
            chainLayout[3][2] = 1;
            chainLayout[3][5] = 1;
            chainLayout[4][3] = 1;
            chainLayout[4][4] = 1;
        } else if (i === 4) {
            // Обучающий уровень 4: Порталы 🌌
            targetType = "heart";
            portals = { "7,1": "0,6", "7,6": "0,1" }; // Снизу уходим наверх по диагонали
        } else if (i === 6 || (i > 5 && i % 4 === 1)) {
            // Уровни с пончиками 🍩
            targetType = "donut";
            heartsGoal = i < 15 ? 2 : 3; 
        } else if (i >= 20 && i % 12 === 0) {
            // ИСПРАВЛЕНО: Раньше это условие (i % 5 === 0) было практически недостижимо — оно стояло
            // ПОСЛЕ веток "ice" (нечетные i>=15) и "box" (все четные i>5), которые перехватывали
            // почти все номера уровней раньше, чем до него доходила очередь. Теперь у ковров
            // есть свой зарезервированный слот, до которого ветки ice/box не добираются.
            targetType = "carpet";
            heartsGoal = 14 + Math.floor(Math.random() * 8);
            carpetLayout[3][3] = 1;
            carpetLayout[3][4] = 1;
            carpetLayout[4][3] = 1;
            carpetLayout[4][4] = 1;
        } else if (i >= 22 && i % 12 === 3) {
            // Уровни с вазами 🏺 (2 слоя прочности каждая, разбиваются как ящики)
            targetType = "vase";
            heartsGoal = 6 + Math.floor(Math.random() * 5);
        } else if (i >= 24 && i % 12 === 6) {
            // Уровни с печеньем 🍪 (3 слоя прочности)
            targetType = "cookie";
            heartsGoal = 6 + Math.floor(Math.random() * 5);
        } else if (i >= 26 && i % 12 === 8) {
            // Уровни с орехами 🌰 (иммунитет к обычным матчам — только взрывы бонусов!)
            // ИСПРАВЛЕНО: остаток 9 всегда означал i % 4 === 1, что уже перехватывалось
            // веткой "donut" выше — орехи были математически недостижимы.
            targetType = "nut";
            heartsGoal = 5 + Math.floor(Math.random() * 4);
        } else if (i >= 28 && i % 18 === 5) {
            // Уровни с футлярами колец 💍
            targetType = "ring";
            heartsGoal = 4 + Math.floor(Math.random() * 4);
        } else if (i >= 30 && i % 18 === 11) {
            // Уровни с каменными фигурками 🗿 (иммунитет к обычным матчам — только 3 взрыва бонусов!)
            targetType = "stone";
            heartsGoal = 4 + Math.floor(Math.random() * 3);
        } else if (i >= 32 && i % 18 === 17) {
            // Уровни с пледами 🛏️ (4 слоя прочности)
            targetType = "plaid";
            heartsGoal = 4 + Math.floor(Math.random() * 3);
        } else if (i >= 34 && i % 15 === 7) {
            // Уровни с плющом 🥀 (растет и расползается по полю каждый ход!)
            targetType = "ivy";
            heartsGoal = 5 + Math.floor(Math.random() * 4);
} else if (i >= 15 && i % 2 === 1) {
            targetType = "ice";
            // Постепенно увеличиваем количество льда от 8 до 16 блоков в зависимости от уровня
            let targetIceCount = Math.min(16, 8 + Math.floor(i / 15));
            let frozenCount = 0, safety = 0;
            while (frozenCount < targetIceCount && safety < 150) {
                safety++;
                const r = Math.floor(Math.random() * SIZE);
                const c = Math.floor(Math.random() * SIZE);
                if (layout[r][c] === 1) {
                    iceLayout[r][c] = 1;
                    frozenCount++;
                }
            }
        }else if (i > 5 && i % 2 === 0) {
            targetType = "box";
        }

        // Случайный спавн цепей на высоких уровнях
        if (i >= 8 && i % 3 === 0) {
            chainLayout[Math.floor(Math.random()*3)+2][Math.floor(Math.random()*4)+2] = 1;
        }

        LEVELS.push({
            id: i,
            heartsGoal: Math.min(130, heartsGoal),
            moves: moves,
            difficulty: difficulty,
            layout: layout,
            iceLayout: iceLayout,         
            carpetLayout: carpetLayout,     
            chainLayout: chainLayout,
            portals: portals,
            targetType: targetType,       
            completed: false,
            bestScore: 0,
            stars: 0
        });
    }

    // Первые фиксированные обучающие уровни
    LEVELS[0] = {
        id: 1,
        heartsGoal: 8,
        moves: 20,
        difficulty: "normal",
        layout: LAYOUTS.square,
        iceLayout: [], carpetLayout: [], chainLayout: [], portals: {},
        targetType: "heart",
        completed: false, bestScore: 0, stars: 0
    };

    LEVELS[1] = {
        id: 2,
        heartsGoal: 10,
        moves: 18,
        difficulty: "normal",
        layout: LAYOUTS.square,
        iceLayout: [], carpetLayout: [], chainLayout: [], portals: {},
        targetType: "heart",
        completed: false, bestScore: 0, stars: 0
    };

    window.LEVELS = LEVELS;
    console.log(`levels.js: База уровней успешно переработана под цепи, порталы и пончики!`);
})();
