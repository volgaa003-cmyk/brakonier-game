// ================================================
// levels.js (ИСПРАВЛЕННЫЙ И ПЛАВНЫЙ)
// Процедурный генератор Homescapes-полей с умным усложнением
// ================================================

((function() {
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
        ]
    };

    // ФУНКЦИЯ УМНОЙ ГЕНЕРАЦИИ МАСКИ ПОЛЯ
    function getLayoutForLevel(levelId) {
        // Уровни 1 - 5: Полный квадрат (учимся играть, собирать фишки)
        if (levelId <= 5) {
            return JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.square));
        }

        // Уровни 6 - 10: Появляется дыра в центре (учимся облетать пустоты, ЯЩИКОВ НЕТ)
        if (levelId <= 10) {
            return JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.centerHole));
        }

        // Уровни 11+: Полноценный Homescapes с ящиками и сложными пустотами
        if (levelId % 10 === 0) {
            // Каждое испытание — сложная бабочка с ящиками
            return JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.butterflyWithBoxes));
        } 
        
        if (levelId % 3 === 0) {
            // Обычный уровень: дыра в центре + 4 защитных ящика по углам дыры
            let layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.centerHole));
            layout[2][3] = 2; // Ставим коробку сверху дыры
            layout[2][4] = 2;
            layout[5][3] = 2; // Ставим коробку снизу дыры
            layout[5][4] = 2;
            return layout;
        }

        // Остальные уровни после 10-го — просто дыра в центре
        return JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.centerHole));
    }

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let heartsGoal = 12;
        let moves = 22;
        let difficulty = "normal";
        let layout = getLayoutForLevel(i); // Рассчитываем форму поля динамически!

        // Растущая кривая сложности
        if (i <= 20) {
            heartsGoal = 10 + Math.floor(i * 1.0);
            moves = 24 - Math.floor(i / 10);
        } else {
            heartsGoal = 30 + Math.floor((i - 20) * 0.8);
            moves = 22 - Math.floor((i - 20) / 15);
        }

        // Легкая погрешность для разнообразия целей
        let randomVariation = Math.floor(Math.random() * 5) - 2; // от -2 до +2
        heartsGoal = Math.max(10, heartsGoal + randomVariation);

        let randomMoves = Math.floor(Math.random() * 3) - 1; // от -1 до +1
        moves = Math.max(10, moves + randomMoves);

        // Расчет типов сложности
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

        LEVELS.push({
            id: i,
            heartsGoal: heartsGoal,
            moves: moves,
            difficulty: difficulty,
            layout: layout,
            completed: false,
            bestScore: 0,
            stars: 0
        });
    }

    // Ручная точечная настройка первых 3-х уровней для идеального обучения
    LEVELS[0] = {
        id: 1,
        heartsGoal: 8,
        moves: 20,
        difficulty: "normal",
        layout: LAYOUT_TEMPLATES.square, // 1 уровень — ровное поле
        completed: false,
        bestScore: 0,
        stars: 0
    };

    LEVELS[1] = {
        id: 2,
        heartsGoal: 10,
        moves: 18,
        difficulty: "normal",
        layout: LAYOUT_TEMPLATES.square, // 2 уровень — тоже ровный, чуть сложнее цель
        completed: false,
        bestScore: 0,
        stars: 0
    };

    LEVELS[2] = {
        id: 3,
        heartsGoal: 12,
        moves: 18,
        difficulty: "medium",
        layout: LAYOUT_TEMPLATES.square, // 3 уровень — ровный, добавляем синюю сложность
        completed: false,
        bestScore: 0,
        stars: 0
    };

    // Уровень 6 — первое появление пустоты в центре (учим игрока облетать дыру)
    LEVELS[5] = {
        id: 6,
        heartsGoal: 15,
        moves: 16,
        difficulty: "medium",
        layout: LAYOUT_TEMPLATES.centerHole,
        completed: false,
        bestScore: 0,
        stars: 0
    };

    window.LEVELS = LEVELS;
    console.log(`levels.js: Плавная кривая Homescapes усложнений запущена!`);
})();
