// ================================================
// levels.js (ИСПРАВЛЕННЫЙ — РАЗДЕЛЕНИЕ ЛЬДА И ЯЩИКОВ)
// Процедурный генератор Homescapes-полей с разделением препятствий
// ================================================

(function() {
    const SIZE = 8; 
    const LEVELS = [];
    const TOTAL_LEVELS = 10050;

    console.log("levels.js: Расчет разделения льда и коробок...");

    // БАЗОВЫЕ ШАБЛОНЫ ПОЛЕЙ
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
        butterflyWithBoxes: [
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 2, 2, 2, 2, 1, 1], 
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 2, 2, 2, 2, 1, 1], 
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1]
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
        heart: [
            [0, 1, 1, 0, 0, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
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
        ],
        butterfly: [
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1]
        ]
    };

    // ФУНКЦИЯ УМНОЙ ГЕНЕРАЦИИ ГЕОМЕТРИИ
    function getLayoutForLevel(levelId) {
        let layout;

        if (levelId <= 5) {
            layout = JSON.parse(JSON.stringify(LAYOUTS.square));
        } else if (levelId <= 10) {
            if (levelId === 6) layout = JSON.parse(JSON.stringify(LAYOUTS.centerHole));
            else if (levelId === 7) layout = JSON.parse(JSON.stringify(LAYOUTS.heart));
            else if (levelId === 8) layout = JSON.parse(JSON.stringify(LAYOUTS.cross));
            else if (levelId === 9) layout = JSON.parse(JSON.stringify(LAYOUTS.islands));
            else layout = JSON.parse(JSON.stringify(LAYOUTS.square));
        } else {
            const cycle = levelId % 6;
            // ИСПРАВЛЕНИЕ: Если уровень ЧЕТНЫЙ — это уровень с Коробками (без Льда)
            const isBoxLevel = levelId % 2 === 0;

            if (isBoxLevel) {
                if (cycle === 0) layout = JSON.parse(JSON.stringify(LAYOUTS.fortress));
                else if (cycle === 2) {
                    layout = JSON.parse(JSON.stringify(LAYOUTS.heart));
                    layout[3][3] = 2;
                    layout[3][4] = 2;
                } else {
                    layout = JSON.parse(JSON.stringify(LAYOUTS.islands));
                    layout[3][1] = 2;
                    layout[3][6] = 2;
                }
            } else {
                // Если уровень НЕЧЕТНЫЙ — это чистый уровень со Льдом (Ящиков 2 здесь НЕТ!)
                if (cycle === 1) layout = JSON.parse(JSON.stringify(LAYOUTS.islands));
                else if (cycle === 3) layout = JSON.parse(JSON.stringify(LAYOUTS.butterfly));
                else if (cycle === 5) layout = JSON.parse(JSON.stringify(LAYOUTS.cross));
                else layout = JSON.parse(JSON.stringify(LAYOUTS.centerHole));
            }
        }

        // Спавним стартовые бустеры на каждом 5-м уровне
        if (levelId >= 10 && levelId % 5 === 0) {
            const boostersCount = Math.min(5, 2 + Math.floor(levelId / 100));
            let placed = 0;
            let safetyGuard = 0;
            while (placed < boostersCount && safetyGuard < 100) {
                safetyGuard++;
                const r = Math.floor(Math.random() * 8);
                const c = Math.floor(Math.random() * 8);
                if (layout[r][c] === 1) {
                    layout[r][c] = Math.floor(Math.random() * 5) + 3; // Бонусы
                    placed++;
                }
            }
        }

        return layout;
    }

    // Генерация базы на 10 000 уровней
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let heartsGoal = 12;
        let moves = 22;
        let difficulty = "normal";
        let layout = getLayoutForLevel(i);
        
        let iceLayout = [];
        let carpetLayout = [];

        // Создаем пустые сетки 8х8
        for (let r = 0; r < SIZE; r++) {
            iceLayout.push(new Array(SIZE).fill(0));
            carpetLayout.push(new Array(SIZE).fill(0));
        }

        // Сложность по умолчанию
        if (i <= 20) {
            heartsGoal = 10 + Math.floor(i * 1.1);
            moves = 24 - Math.floor(i / 10);
        } else {
            heartsGoal = 32 + Math.floor((i - 20) * 0.8);
            moves = 22 - Math.floor((i - 20) / 15);
        }

        let randomVariation = Math.floor(Math.random() * 5) - 2; 
        heartsGoal = Math.max(10, heartsGoal + randomVariation);

        let randomMoves = Math.floor(Math.random() * 3) - 1; 
        moves = Math.max(10, moves + randomMoves);

        if (i % 10 === 0) {
            difficulty = "challenge";
            heartsGoal = Math.floor(heartsGoal * 1.25);
        } else if (i % 5 === 0) {
            difficulty = (i % 2 === 0) ? "extreme" : "hard";
            heartsGoal = Math.floor(heartsGoal * 1.3);
        } else if (i % 3 === 0) {
            difficulty = "medium";
        }

        if (heartsGoal > 130) heartsGoal = 130;

        // --- ЛОГИКА СПАВНА ЛЬДА 🧊 (С 15 УРОВНЯ И ТОЛЬКО НА НЕЧЕТНЫХ УРОВНЯХ!) ---
        const isIceLevel = i >= 15 && i % 2 === 1;
        if (isIceLevel) {
            let frozenCount = 0;
            let safety = 0;
            while (frozenCount < 5 && safety < 100) {
                safety++;
                const r = Math.floor(Math.random() * 8);
                const c = Math.floor(Math.random() * 8);
                // ИСПРАВЛЕНИЕ: Замораживаем ТОЛЬКО разрешенные обычные фишки (1)!
                // Ни в коем случае не трогаем пустоту (0) или коробки (2)!
                if (layout[r][c] === 1 && iceLayout[r][c] === 0) {
                    iceLayout[r][c] = 1; 
                    frozenCount++;
                }
            }
        }

        // --- ЛОГИКА РАСТЕКАНИЯ КОВРА 🌿 (С 25 УРОВНЯ) ---
        let targetType = "heart"; 
        if (i >= 25 && i % 5 === 0) {
            targetType = "carpet"; 
            
            let totalAvailableCells = 0;
            for (let r=0; r<SIZE; r++) {
                for (let c=0; c<SIZE; c++) {
                    if (layout[r][c] !== 0) totalAvailableCells++;
                }
            }
            heartsGoal = totalAvailableCells;

            carpetLayout[3][3] = 1;
            carpetLayout[3][4] = 1;
            carpetLayout[4][3] = 1;
            carpetLayout[4][4] = 1;
        }

        // Запись обычного уровня
        if (i >= 20 && i % 20 === 0) {
            const phase1Goal = Math.floor(heartsGoal * 0.55);
            const phase2Goal = Math.floor(heartsGoal * 0.65);
            
            // На двухфазных уровнях пусть всегда будут коробки
            let phase1Layout = JSON.parse(JSON.stringify(LAYOUTS.islands));
            phase1Layout[3][1] = 2;
            phase1Layout[3][6] = 2;

            let phase2Layout = JSON.parse(JSON.stringify(LAYOUTS.fortress));

            LEVELS.push({
                id: i,
                moves: Math.max(15, moves + 4),
                difficulty: "challenge",
                targetType: "heart",
                completed: false,
                bestScore: 0,
                stars: 0,
                phases: [
                    { heartsGoal: phase1Goal, layout: phase1Layout },
                    { heartsGoal: phase2Goal, layout: phase2Layout }
                ]
            });
        } 
        else {
            LEVELS.push({
                id: i,
                heartsGoal: heartsGoal,
                moves: moves,
                difficulty: difficulty,
                layout: layout,
                iceLayout: iceLayout,         
                carpetLayout: carpetLayout,     
                targetType: targetType,       
                completed: false,
                bestScore: 0,
                stars: 0
            });
        }
    }

    // Обучающие первые уровни (Гарантированно без льда и ковров)
    LEVELS[0] = {
        id: 1,
        heartsGoal: 8,
        moves: 20,
        difficulty: "normal",
        layout: LAYOUTS.square,
        iceLayout: [],
        carpetLayout: [],
        targetType: "heart",
        completed: false,
        bestScore: 0,
        stars: 0
    };

    LEVELS[1] = {
        id: 2,
        heartsGoal: 10,
        moves: 18,
        difficulty: "normal",
        layout: LAYOUTS.square,
        iceLayout: [],
        carpetLayout: [],
        targetType: "heart",
        completed: false,
        bestScore: 0,
        stars: 0
    };

    LEVELS[2] = {
        id: 3,
        heartsGoal: 12,
        moves: 18,
        difficulty: "medium",
        layout: LAYOUTS.square,
        iceLayout: [],
        carpetLayout: [],
        targetType: "heart",
        completed: false,
        bestScore: 0,
        stars: 0
    };

    window.LEVELS = LEVELS;
    console.log(`levels.js: Уровни разделены: ящики отдельно 📦, лед отдельно 🧊!`);
})();
