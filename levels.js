// ================================================
// levels.js (БИБЛИОТЕКА КРАСИВЫХ ПОЛЕЙ HOMESCAPES)
// Генератор разнообразных геометрических масок полей
// ================================================

(function() {
    const LEVELS = [];
    const TOTAL_LEVELS = 10050;

    console.log("levels.js: Запуск генератора красивых геометрических полей...");

    // БИБЛИОТЕКА ШАБЛОНОВ ГЕОМЕТРИИ ПОЛЯ (0 - пустота, 1 - фишка, 2 - ящик)
    const LAYOUTS = {
        // 1. Квадрат (Обычный)
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
        // 2. Дыра в центре
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
        // 3. Форма креста (вырезы по углам)
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
        // 4. Два независимых Острова (Левый и Правый, разделены бездной)
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
        // 5. Силуэт Сердца (Вырезы по бокам)
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
        // 6. Замок с башнями и воротами из ящиков 📦
        fortress: [
            [1, 0, 1, 0, 0, 1, 0, 1], // Зубцы башен на самом верху
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 2, 2, 1, 1, 1], // Ворота завалены ящиками!
            [1, 1, 1, 2, 2, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0]
        ],
        // 7. Песочные часы (Бабочка)
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

    // ФУНКЦИЯ РАСПРЕДЕЛЕНИЯ КРАСИВЫХ ГЕОМЕТРИЙ ПО УРОВНЯМ
    function generateLayout(levelId) {
        // Уровни 1 - 5: Простые квадратные поля для обучения
        if (levelId <= 5) {
            return JSON.parse(JSON.stringify(LAYOUTS.square));
        }

        // Уровни 6 - 10: Поля с красивой геометрией, но БЕЗ ЯЩИКОВ (учимся облетать пустоты)
        if (levelId <= 10) {
            if (levelId === 6) return JSON.parse(JSON.stringify(LAYOUTS.centerHole));
            if (levelId === 7) return JSON.parse(JSON.stringify(LAYOUTS.heart));
            if (levelId === 8) return JSON.parse(JSON.stringify(LAYOUTS.cross));
            if (levelId === 9) return JSON.parse(JSON.stringify(LAYOUTS.islands));
            return JSON.parse(JSON.stringify(LAYOUTS.butterfly));
        }

        // Уровни 11+: Смешиваем геометрию и добавляем ящики-препятствия
        const cycle = levelId % 6; // Чередуем 6 сложных шаблонов по кругу!

        if (cycle === 0) {
            // Форма замка с воротами из ящиков
            return JSON.parse(JSON.stringify(LAYOUTS.fortress));
        }
        if (cycle === 1) {
            // Острова. Добавляем по 2 ящика на каждый остров
            let layout = JSON.parse(JSON.stringify(LAYOUTS.islands));
            layout[3][1] = 2;
            layout[3][6] = 2;
            return layout;
        }
        if (cycle === 2) {
            // Форма сердца с ящиками в самом центре
            let layout = JSON.parse(JSON.stringify(LAYOUTS.heart));
            layout[3][3] = 2;
            layout[3][4] = 2;
            return layout;
        }
        if (cycle === 3) {
            // Песочные часы с перегородкой из ящиков
            let layout = JSON.parse(JSON.stringify(LAYOUTS.butterfly));
            layout[3][2] = 2;
            layout[3][3] = 2;
            layout[3][4] = 2;
            layout[3][5] = 2;
            return layout;
        }
        if (cycle === 4) {
            // Крест с ящиками на входе в тупики
            let layout = JSON.parse(JSON.stringify(LAYOUTS.cross));
            layout[2][0] = 2;
            layout[2][7] = 2;
            return layout;
        }
        
        // По умолчанию — дыра в центре с ящиками по бокам
        let layout = JSON.parse(JSON.stringify(LAYOUTS.centerHole));
        layout[2][3] = 2;
        layout[2][4] = 2;
        layout[5][3] = 2;
        layout[5][4] = 2;
        return layout;
    }

    // Генерация базы на 10 000 уровней
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let heartsGoal = 12;
        let moves = 22;
        let difficulty = "normal";
        let layout = generateLayout(i); // Генерируем красивую маску поля!

        // Растущая кривая сложности
        if (i <= 20) {
            heartsGoal = 10 + Math.floor(i * 1.0);
            moves = 24 - Math.floor(i / 10);
        } else {
            heartsGoal = 30 + Math.floor((i - 20) * 0.8);
            moves = 22 - Math.floor((i - 20) / 15);
        }

        // Погрешность для разнообразия целей
        let randomVariation = Math.floor(Math.random() * 5) - 2; 
        heartsGoal = Math.max(10, heartsGoal + randomVariation);

        let randomMoves = Math.floor(Math.random() * 3) - 1; 
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

    // Ручная настройка первых 3-х уровней для идеального старта
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
    console.log(`levels.js: Успешно загружено ${LEVELS.length} красивых Homescapes полей!`);
})();
