// ================================================
// levels.js (УЛУЧШЕННЫЙ — СО СТАРТОВЫМИ БУСТЕРАМИ)
// Генератор сложных Homescapes-полей со спавном бонусов
// ================================================

(function() {
    const LEVELS = [];
    const TOTAL_LEVELS = 10050;

    console.log("levels.js: Расчет плавной кривой сложности и стартовых бустеров...");

    // БАЗОВЫЕ ШАБЛОНЫ ПОЛЕЙ
    const LAYOUT_TEMPLATES = {
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

    // ФУНКЦИЯ УМНОЙ ГЕНЕРАЦИИ МАСКИ ПОЛЯ
    function getLayoutForLevel(levelId) {
        let layout;

        if (levelId <= 5) {
            layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.square));
        } else if (levelId <= 10) {
            if (levelId === 6) layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.centerHole));
            else if (levelId === 7) layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.heart));
            else if (levelId === 8) layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.cross));
            else if (levelId === 9) layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.islands));
            else layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.square));
        } else {
            const cycle = levelId % 6;
            if (cycle === 0) layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.fortress));
            else if (cycle === 1) {
                layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.islands));
                layout[3][1] = 2;
                layout[3][6] = 2;
            } else if (cycle === 2) {
                layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.heart));
                layout[3][3] = 2;
                layout[3][4] = 2;
            } else if (cycle === 3) {
                layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.butterflyWithBoxes));
            } else if (cycle === 4) {
                layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.cross));
                layout[2][0] = 2;
                layout[2][7] = 2;
            } else {
                layout = JSON.parse(JSON.stringify(LAYOUT_TEMPLATES.centerHole));
                layout[2][3] = 2;
                layout[2][4] = 2;
                layout[5][3] = 2;
                layout[5][4] = 2;
            }
        }

        // КРИТИЧЕСКИЙ ШАГ: Спавним бустеры на каждом 5-м уровне начиная с 10-го!
        if (levelId >= 10 && levelId % 5 === 0) {
            // Количество бустеров плавно растет от 2 до 6 в зависимости от уровня
            const boostersCount = Math.min(6, 2 + Math.floor(levelId / 50));
            let placed = 0;

            // Пытаемся случайно распределить бустеры на свободные клетки (цифры 1)
            let safetyGuard = 0;
            while (placed < boostersCount && safetyGuard < 100) {
                safetyGuard++;
                const r = Math.floor(Math.random() * 8);
                const c = Math.floor(Math.random() * 8);

                if (layout[r][c] === 1) {
                    // Случайно выбираем тип бустера:
                    // 3 - Бомба, 4 - Гор. Ракета, 5 - Верт. Ракета, 6 - Самолет, 7 - Радуга
                    layout[r][c] = Math.floor(Math.random() * 5) + 3; 
                    placed++;
                }
            }
        }

        return layout;
    }

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let heartsGoal = 12;
        let moves = 22;
        let difficulty = "normal";
        let layout = getLayoutForLevel(i);

        if (i <= 20) {
            heartsGoal = 10 + Math.floor(i * 1.0);
            moves = 24 - Math.floor(i / 10);
        } else {
            heartsGoal = 30 + Math.floor((i - 20) * 0.8);
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

    // Ручная настройка первых 3-х уровней для идеального старта
    LEVELS[0] = {
        id: 1,
        heartsGoal: 8,
        moves: 20,
        difficulty: "normal",
        layout: LAYOUT_TEMPLATES.square, 
        completed: false,
        bestScore: 0,
        stars: 0
    };

    LEVELS[1] = {
        id: 2,
        heartsGoal: 10,
        moves: 18,
        difficulty: "normal",
        layout: LAYOUT_TEMPLATES.square, 
        completed: false,
        bestScore: 0,
        stars: 0
    };

    LEVELS[2] = {
        id: 3,
        heartsGoal: 15,
        moves: 18,
        difficulty: "medium",
        layout: LAYOUT_TEMPLATES.square, 
        completed: false,
        bestScore: 0,
        stars: 0
    };

    window.LEVELS = LEVELS;
    console.log(`levels.js: Начисление стартовых бустеров на сложные уровни завершено!`);
})();
