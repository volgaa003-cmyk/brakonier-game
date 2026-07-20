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

        // Базовые параметры сложности - УЛЬТРА-ЛЕГКИЙ режим как в Homescapes
        // Игрок должен почти всегда побеждать с запасом ходов
        if (i <= 10) {
            // Первые 10 уровней - максимально легкие для обучения
            heartsGoal = 6 + Math.floor(i * 0.5); // Цели от 6 до 11
            moves = 28 - Math.floor(i / 5); // Ходов от 26 до 28
        } else if (i <= 25) {
            // Ранние уровни - легкие
            heartsGoal = 10 + Math.floor((i - 10) * 0.6); // Цели от 10 до 19
            moves = 27 - Math.floor((i - 10) / 8); // Ходов от 24 до 27
        } else if (i <= 50) {
            // Средние уровни - средней сложности
            heartsGoal = 18 + Math.floor((i - 25) * 0.4); // Цели от 18 до 28
            moves = 25 - Math.floor((i - 25) / 10); // Ходов от 22 до 25
        } else {
            // Поздние уровни - чуть сложнее
            heartsGoal = 26 + Math.floor((i - 50) * 0.3); // Цели от 26+
            moves = 23 - Math.floor((i - 50) / 15); // Ходов от 20+
        }

        // Небольшая вариативность для разнообразия
        heartsGoal = Math.max(6, heartsGoal + Math.floor(Math.random() * 2) - 1);
        moves = Math.max(16, moves + Math.floor(Math.random() * 2));

        // Распределение типов целей с ограничением max 3 препятствия на уровень
        let targetType = "heart";
        
        // ЭТАП 1: Обучающие уровни (1-5) - только простые механики
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
            portals = { "7,1": "0,6", "7,6": "0,1" };
        } 
        // ЭТАП 2: Ранние уровни (6-15) - 1 тип препятствия
        else if (i >= 6 && i <= 15) {
            if (i % 4 === 2) {
                // Пончики 🍩
                targetType = "donut";
                heartsGoal = 2;
            } else if (i % 2 === 0) {
                // Ящики 📦
                targetType = "box";
            } else {
                targetType = "heart";
            }
        }
        // ЭТАП 3: Средние уровни (16-30) - 1-2 типа препятствий
        else if (i >= 16 && i <= 30) {
            const levelMod = i % 8;
            if (levelMod === 0) {
                // Ковры 🟩
                targetType = "carpet";
                heartsGoal = 12 + Math.floor(Math.random() * 4);
                carpetLayout[3][3] = 1;
                carpetLayout[3][4] = 1;
                carpetLayout[4][3] = 1;
                carpetLayout[4][4] = 1;
            } else if (levelMod === 2) {
                // Вазы 🏺
                targetType = "vase";
                heartsGoal = 5 + Math.floor(Math.random() * 3);
            } else if (levelMod === 4) {
                // Печенье 🍪
                targetType = "cookie";
                heartsGoal = 5 + Math.floor(Math.random() * 3);
            } else if (levelMod === 6) {
                // Пончики + легкий лед
                targetType = "donut";
                heartsGoal = 2;
                // Добавляем немного льда (2-3 клетки)
                let iceCount = 0;
                while (iceCount < 2) {
                    const r = Math.floor(Math.random() * SIZE);
                    const c = Math.floor(Math.random() * SIZE);
                    if (layout[r][c] === 1 && !iceLayout[r][c]) {
                        iceLayout[r][c] = 1;
                        iceCount++;
                    }
                }
            } else if (i % 2 === 0) {
                // Ящики + цепи
                targetType = "box";
                chainLayout[3][3] = 1;
            } else {
                targetType = "heart";
            }
        }
        // ЭТАП 4: Поздние уровни (31-60) - 2-3 типа препятствий
        else if (i >= 31 && i <= 60) {
            const levelMod = i % 10;
            if (levelMod === 0) {
                // Орехи 🌰 + лед
                targetType = "nut";
                heartsGoal = 4 + Math.floor(Math.random() * 2);
                let iceCount = 0;
                while (iceCount < 3) {
                    const r = Math.floor(Math.random() * SIZE);
                    const c = Math.floor(Math.random() * SIZE);
                    if (layout[r][c] === 1 && !iceLayout[r][c]) {
                        iceLayout[r][c] = 1;
                        iceCount++;
                    }
                }
            } else if (levelMod === 2) {
                // Футляры колец 💍 + цепи
                targetType = "ring";
                heartsGoal = 3 + Math.floor(Math.random() * 2);
                chainLayout[3][2] = 1;
                chainLayout[4][4] = 1;
            } else if (levelMod === 4) {
                // Каменные фигурки 🗿 + ковер
                targetType = "stone";
                heartsGoal = 3 + Math.floor(Math.random() * 2);
                carpetLayout[3][3] = 1;
                carpetLayout[4][4] = 1;
            } else if (levelMod === 6) {
                // Пледы 🛏️ + лед + цепи (максимум 3 препятствия)
                targetType = "plaid";
                heartsGoal = 3 + Math.floor(Math.random() * 2);
                let iceCount = 0;
                while (iceCount < 2) {
                    const r = Math.floor(Math.random() * SIZE);
                    const c = Math.floor(Math.random() * SIZE);
                    if (layout[r][c] === 1 && !iceLayout[r][c]) {
                        iceLayout[r][c] = 1;
                        iceCount++;
                    }
                }
                chainLayout[3][3] = 1;
            } else if (levelMod === 8) {
                // Плющ 🥀 + ковер + цепи (максимум 3 препятствия)
                targetType = "ivy";
                heartsGoal = 4 + Math.floor(Math.random() * 2);
                carpetLayout[3][4] = 1;
                carpetLayout[4][3] = 1;
                chainLayout[4][4] = 1;
            } else if (i % 2 === 0) {
                // Ящики + лед + ковер (максимум 3 препятствия)
                targetType = "box";
                let iceCount = 0;
                while (iceCount < 3) {
                    const r = Math.floor(Math.random() * SIZE);
                    const c = Math.floor(Math.random() * SIZE);
                    if (layout[r][c] === 1 && !iceLayout[r][c]) {
                        iceLayout[r][c] = 1;
                        iceCount++;
                    }
                }
                carpetLayout[3][3] = 1;
            } else {
                targetType = "heart";
            }
        }
        // ЭТАП 5: Экспертные уровни (61+) - до 3 препятствий, но более сложные комбинации
        else {
            const levelMod = i % 12;
            if (levelMod === 0) {
                // Комбо: орехи + лед + цепи
                targetType = "nut";
                heartsGoal = 5 + Math.floor(Math.random() * 3);
                let iceCount = 0;
                while (iceCount < 4) {
                    const r = Math.floor(Math.random() * SIZE);
                    const c = Math.floor(Math.random() * SIZE);
                    if (layout[r][c] === 1 && !iceLayout[r][c]) {
                        iceLayout[r][c] = 1;
                        iceCount++;
                    }
                }
                chainLayout[3][2] = 1;
                chainLayout[4][4] = 1;
            } else if (levelMod === 3) {
                // Комбо: каменные фигурки + ковер + лед
                targetType = "stone";
                heartsGoal = 4 + Math.floor(Math.random() * 3);
                carpetLayout[3][3] = 1;
                carpetLayout[4][4] = 1;
                let iceCount = 0;
                while (iceCount < 3) {
                    const r = Math.floor(Math.random() * SIZE);
                    const c = Math.floor(Math.random() * SIZE);
                    if (layout[r][c] === 1 && !iceLayout[r][c]) {
                        iceLayout[r][c] = 1;
                        iceCount++;
                    }
                }
            } else if (levelMod === 6) {
                // Комбо: плющ + цепи + лед
                targetType = "ivy";
                heartsGoal = 5 + Math.floor(Math.random() * 3);
                chainLayout[3][3] = 1;
                chainLayout[4][4] = 1;
                let iceCount = 0;
                while (iceCount < 3) {
                    const r = Math.floor(Math.random() * SIZE);
                    const c = Math.floor(Math.random() * SIZE);
                    if (layout[r][c] === 1 && !iceLayout[r][c]) {
                        iceLayout[r][c] = 1;
                        iceCount++;
                    }
                }
            } else if (levelMod === 9) {
                // Комбо: пледы + ковер + цепи
                targetType = "plaid";
                heartsGoal = 4 + Math.floor(Math.random() * 3);
                carpetLayout[3][4] = 1;
                carpetLayout[4][3] = 1;
                chainLayout[3][3] = 1;
            } else if (i % 2 === 0) {
                // Ящики + лед (2 препятствия)
                targetType = "box";
                let iceCount = 0;
                while (iceCount < 4) {
                    const r = Math.floor(Math.random() * SIZE);
                    const c = Math.floor(Math.random() * SIZE);
                    if (layout[r][c] === 1 && !iceLayout[r][c]) {
                        iceLayout[r][c] = 1;
                        iceCount++;
                    }
                }
            } else {
                targetType = "heart";
            }
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

    // ================================================
    // ДОБАВЛЕНО: уровни из НЕСКОЛЬКИХ частей поля.
    // Каждая часть — это отдельный layout/цель/лед/ковры/порталы. Игрок зачищает
    // локальную цель первой части — поле само перекатывается на следующую часть,
    // и так до конца списка zones. Панель бустеров всегда остаётся на месте,
    // так как она не является частью #board.
    // Задействуем это точечно ("на некоторых уровнях"), чтобы не трогать
    // остальные 10000+ уровней и не рисковать балансом всей игры разом.
    // ================================================
    function buildExtraZone(levelId, layoutKey, tType) {
        const zone = {
            layout: JSON.parse(JSON.stringify(LAYOUTS[layoutKey])),
            iceLayout: [], carpetLayout: [], chainLayout: [], portals: {},
            targetType: tType,
            heartsGoal: 8 + Math.floor(Math.random() * 6)
        };
        return zone;
    }

    for (let i = 12; i <= TOTAL_LEVELS; i += 15) {
        if (!LEVELS[i - 1]) continue;
        LEVELS[i - 1].zones = [ buildExtraZone(i, i % 2 === 0 ? "cross" : "centerHole", "heart") ];
    }

    window.LEVELS = LEVELS;
    console.log(`levels.js: База уровней успешно переработана под цепи, порталы и пончики!`);
})();
