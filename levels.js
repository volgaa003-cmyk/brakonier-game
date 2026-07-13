// ================================================
// levels.js (ИСПРАВЛЕННЫЙ И ПЛАВНЫЙ)
// Процедурный генератор Homescapes-полей с умным усложнением
// ================================================

(function() {
    const SIZE = 8; // ВАЖНЕЙШЕЕ ИСПРАВЛЕНИЕ: Добавили размер сетки 8х8 на верхний уровень!
    const LEVELS = [];
    const TOTAL_LEVELS = 10050;

    console.log("levels.js: Расчет плавной кривой сложности...");

    // БАЗОВЫЕ ШАБЛОНЫ ПОЛЕЙ
    const LAYOUT_TEMPLATES = {
        // Полный квадрат 8х8
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
        // Дыра в центре (без ящиков)
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
        // Сложная бабочка с ящиками (только для уровней 11+)
        butterflyWithBoxes: [
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 2, 2, 2, 2, 1, 1], // Ящики (2)
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 2, 2, 2, 2, 1, 1], // Ящики (2)
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
            if (cycle === 0) layout = JSON.parse(JSON.stringify(LAYOUTS.fortress));
            else if (cycle === 1) {
                layout = JSON.parse(JSON.stringify(LAYOUTS.islands));
                layout[3][1] = 2;
                layout[3][6] = 2;
            } else if (cycle === 2) {
                layout = JSON.parse(JSON.stringify(LAYOUTS.heart));
                layout[3][3] = 2;
                layout[3][4] = 2;
            } else if (cycle === 3) {
                layout = JSON.parse(JSON.stringify(LAYOUTS.butterflyWithBoxes));
            } else if (cycle === 4) {
                layout = JSON.parse(JSON.stringify(LAYOUTS.cross));
                layout[2][0] = 2;
                layout[2][7] = 2;
            } else {
                layout = JSON.parse(JSON.stringify(LAYOUTS.centerHole));
                layout[2][3] = 2;
                layout[2][4] = 2;
                layout[5][3] = 2;
                layout[5][4] = 2;
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
        
        // Новые массивы под Лёд и Ковер
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

        // --- ЛОГИКА ОБУЧЕНИЯ И СПАВНА ЛЬДА 🧊 (С 15 УРОВНЯ) ---
        if (i >= 15 && i % 5 === 0) {
            // Замораживаем случайные 4-6 клеток в центре
            let frozenCount = 0;
            let safety = 0;
            while (frozenCount < 5 && safety < 100) {
                safety++;
                const r = Math.floor(Math.random() * 4) + 2; // Строки 2-5
                const c = Math.floor(Math.random() * 4) + 2; // Колонки 2-5
                if (layout[r][c] === 1) {
                    iceLayout[r][c] = 1; // Замораживаем эту фишку!
                    frozenCount++;
                }
            }
        }

        // --- ЛОГИКА ОБУЧЕНИЯ И РАСТЕКАНИЯ КОВРА 🌿 (С 25 УРОВНЯ) ---
        let targetType = "heart"; // По умолчанию цель — сердца
        if (i >= 25 && i % 5 === 0) {
            targetType = "carpet"; // Цель уровня меняется на "Постелить ковер"!
            
            // Считаем общее количество доступных ячеек на поле
            let totalAvailableCells = 0;
            for (let r=0; r<SIZE; r++) {
                for (let c=0; c<SIZE; c++) {
                    if (layout[r][c] !== 0) totalAvailableCells++;
                }
            }
            // Цель по ковру — застелить абсолютно все свободные клетки!
            heartsGoal = totalAvailableCells;

            // Кладем стартовый кусочек ковра в самом центре поля (2х2)
            carpetLayout[3][3] = 1;
            carpetLayout[3][4] = 1;
            carpetLayout[4][3] = 1;
            carpetLayout[4][4] = 1;
        }

        // Запись обычного уровня
        if (i >= 20 && i % 20 === 0) {
            // Многофазные уровни имеют свои настройки фаз (сохраняются)
            const phase1Goal = Math.floor(heartsGoal * 0.55);
            const phase2Goal = Math.floor(heartsGoal * 0.65);
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
                iceLayout: iceLayout,         // Добавляем сетку льда
                carpetLayout: carpetLayout,     // Добавляем сетку ковра
                targetType: targetType,       // Добавляем тип цели (heart или carpet)
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
    console.log(`levels.js: Уровни со льдом 🧊 и коврами 🌿 успешно сгенерированы!`);
})();
