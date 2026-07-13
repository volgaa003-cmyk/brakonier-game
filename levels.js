// ================================================
// levels.js (ФИНАЛЬНЫЙ С ДВОЙНЫМИ СХЕМАМИ)
// Процедурный генератор полей с постепенным усложнением и перекатками
// ================================================

(function() {
    const LEVELS = [];
    const TOTAL_LEVELS = 10050;

    console.log("levels.js: Расчет плавной кривой сложности и фаз перекатки...");

    // БИБЛИОТЕКА ШАБЛОНОВ ГЕОМЕТРИИ ПОЛЯ (0 - пустота, 1 - фишка, 2 - ящик)
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

    // ФУНКЦИЯ ПОСТЕПЕННОГО УСЛОЖНЕНИЯ ПОЛЕЙ (Уровни 1 - 19)
    function generateProgressiveLayout(levelId) {
        // Копируем базовый квадрат
        let layout = JSON.parse(JSON.stringify(LAYOUTS.square));

        if (levelId <= 3) {
            return layout; // Уровни 1-3: Полный квадрат (🟡 легко)
        }
        if (levelId === 4) {
            layout[0][0] = 0; // Отрезаем один уголок
            return layout;
        }
        if (levelId === 5) {
            // Отрезаем все 4 уголка
            layout[0][0] = 0; layout[0][7] = 0;
            layout[7][0] = 0; layout[7][7] = 0;
            return layout;
        }
        if (levelId === 6) {
            return JSON.parse(JSON.stringify(LAYOUTS.centerHole)); // Появляется дыра
        }
        if (levelId === 7) {
            return JSON.parse(JSON.stringify(LAYOUTS.heart)); // Силуэт Сердца
        }
        if (levelId === 8) {
            return JSON.parse(JSON.stringify(LAYOUTS.cross)); // Форма Креста
        }
        if (levelId === 9) {
            return JSON.parse(JSON.stringify(LAYOUTS.islands)); // Острова
        }
        if (levelId === 10) {
            return JSON.parse(JSON.stringify(LAYOUTS.fortress)); // Замок без ящиков
        }

        // Уровни 11 - 19: Берем сложные геометрии и плавно добавляем 1-3 ящика
        const cycle = levelId % 4;
        if (cycle === 0) {
            layout = JSON.parse(JSON.stringify(LAYOUTS.centerHole));
            layout[2][3] = 2; // Добавляем всего 1 ящик сверху дыры
        } else if (cycle === 1) {
            layout = JSON.parse(JSON.stringify(LAYOUTS.heart));
            layout[3][3] = 2; // 1 ящик в сердце
        } else if (cycle === 2) {
            layout = JSON.parse(JSON.stringify(LAYOUTS.islands));
            layout[3][1] = 2; // Ящики по бокам островов
            layout[3][6] = 2;
        } else {
            layout = JSON.parse(JSON.stringify(LAYOUTS.cross));
            layout[2][2] = 2;
            layout[5][5] = 2;
        }
        return layout;
    }

    // ГЕНЕРАЦИЯ ВСЕХ 10 000 УРОВНЕЙ
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let heartsGoal = 12;
        let moves = 22;
        let difficulty = "normal";

        // Растущая базовая сложность
        if (i <= 20) {
            heartsGoal = 10 + Math.floor(i * 1.1);
            moves = 24 - Math.floor(i / 10);
        } else {
            heartsGoal = 32 + Math.floor((i - 20) * 0.8);
            moves = 22 - Math.floor((i - 20) / 15);
        }

        // Рандом целей и ходов
        let randomVariation = Math.floor(Math.random() * 5) - 2; 
        heartsGoal = Math.max(10, heartsGoal + randomVariation);

        let randomMoves = Math.floor(Math.random() * 3) - 1; 
        moves = Math.max(10, moves + randomMoves);

        if (heartsGoal > 130) heartsGoal = 130;

        // КРИТИЧЕСКИЙ ШАГ: Прописываем ФАЗЫ ПЕРЕКАТКИ для каждого 20-го уровня (20, 40, 60, 80...)
        if (i >= 20 && i % 20 === 0) {
            // Это двухфазный уровень!
            const phase1Goal = Math.floor(heartsGoal * 0.55); // Например, 12 сердец
            const phase2Goal = Math.floor(heartsGoal * 0.65); // Например, 15 сердец
            
            // Назначаем разные маски полей для фаз
            let phase1Layout = JSON.parse(JSON.stringify(LAYOUTS.islands)); // Сначала левый/правый острова
            phase1Layout[3][1] = 2;
            phase1Layout[3][6] = 2;

            let phase2Layout = JSON.parse(JSON.stringify(LAYOUTS.fortress)); // Затем выкатывается замок!

            LEVELS.push({
                id: i,
                moves: Math.max(15, moves + 4), // Даем чуть больше ходов, ведь фаз две!
                difficulty: "challenge",
                completed: false,
                bestScore: 0,
                stars: 0,
                // Массив фаз перекатки
                phases: [
                    { heartsGoal: phase1Goal, layout: phase1Layout },
                    { heartsGoal: phase2Goal, layout: phase2Layout }
                ]
            });
        } 
        else {
            // Обычный однофазный уровень (Генерируем постепенную маску)
            let layout = generateProgressiveLayout(i);

            // Начисляем стартовые бустеры на каждом 5-м уровне (но не на кратных 20!)
            if (i >= 10 && i % 5 === 0) {
                difficulty = (i % 2 === 0) ? "extreme" : "hard";
                heartsGoal = Math.floor(heartsGoal * 1.2);

                const boostersCount = Math.min(5, 2 + Math.floor(i / 100));
                let placed = 0;
                let safetyGuard = 0;
                while (placed < boostersCount && safetyGuard < 100) {
                    safetyGuard++;
                    const r = Math.floor(Math.random() * 8);
                    const c = Math.floor(Math.random() * 8);
                    if (layout[r][c] === 1) {
                        layout[r][c] = Math.floor(Math.random() * 5) + 3; // Случайный бустер
                        placed++;
                    }
                }
            } else if (i % 3 === 0) {
                difficulty = "medium";
            }

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
    }

    // Идеальный ручной баланс обучения для первых 3-х уровней
    LEVELS[0] = {
        id: 1,
        heartsGoal: 8,
        moves: 20,
        difficulty: "normal",
        layout: LAYOUTS.square, 
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
        completed: false,
        bestScore: 0,
        stars: 0
    };

    window.LEVELS = LEVELS;
    console.log(`levels.js: Успешно запущен баланс 10 000 уровней с фазами перекатки на каждом 20-м уровне!`);
})();
