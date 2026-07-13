// ================================================
// levels.js
// Процедурный генератор баланса на 10 000+ уровней
// ================================================

(function() {
    const LEVELS = [];
    const TOTAL_LEVELS = 10050; // Генерируем с запасом чуть больше 10 тысяч

    console.log("levels.js: Начинаем расчет баланса уровней...");

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let heartsGoal = 12;        // Базовая цель по сердцам
        let moves = 22;             // Базовое количество ходов
        let difficulty = "normal";  // Сложность по умолчанию

        // 1. ОПРЕДЕЛЯЕМ СЛОЖНОСТЬ УРОВНЯ (Homescapes паттерн)
        if (i % 10 === 0) {
            difficulty = "challenge"; // Каждые 10 уровней — сюжетное испытание (Оранжевое)
        } else if (i % 5 === 0) {
            // Каждые 5 уровней чередуем Очень Сложные (Красные) и Ультра-Сложные (Бирюзовые)
            difficulty = (i % 2 === 0) ? "extreme" : "hard";
        } else if (i % 3 === 0) {
            difficulty = "medium";    // Каждый 3-й уровень — Сложный (Синий)
        } else {
            difficulty = "normal";    // Все остальные — Обычные (Желтые)
        }

        // 2. МАТЕМАТИЧЕСКАЯ ФОРМУЛА РОСТА ЦЕЛИ (Зависит от номера уровня i)
        if (i <= 20) {
            // Обучающие уровни (Очень плавный старт)
            heartsGoal = 10 + Math.floor(i * 1.0); // От 11 до 30 сердец
            moves = 24 - Math.floor(i / 10);      // 24-22 ходов
        } 
        else if (i <= 100) {
            // Начальная игра
            heartsGoal = 30 + Math.floor((i - 20) * 0.8); // От 30 до 94 сердец
            moves = 22 - Math.floor((i - 20) / 15);       // От 22 до 17 ходов
        } 
        else if (i <= 1000) {
            // Средняя игра
            heartsGoal = 60 + Math.floor((i - 100) * 0.25); // Постепенный рост
            moves = 18 - Math.floor((i - 100) / 200);       // От 18 до 14 ходов
        } 
        else {
            // Поздняя бесконечная игра (Уровни от 1000 до 10000+)
            heartsGoal = 80 + Math.floor(Math.sin(i) * 15) + Math.floor(i / 250); 
            moves = 15 - Math.floor((i - 1000) / 2000); 
        }

        // 3. КОРРЕКЦИЯ СЛОЖНОСТИ (Коэффициенты-множители)
        if (difficulty === "medium") {
            heartsGoal = Math.floor(heartsGoal * 1.15); // +15% к цели
            moves = Math.max(12, moves - 1);
        } else if (difficulty === "hard") {
            heartsGoal = Math.floor(heartsGoal * 1.3);  // +30% к цели
            moves = Math.max(11, moves - 2);
        } else if (difficulty === "extreme") {
            heartsGoal = Math.floor(heartsGoal * 1.45); // +45% к цели
            moves = Math.max(10, moves - 3);
        } else if (difficulty === "challenge") {
            heartsGoal = Math.floor(heartsGoal * 1.25); // +25% к цели для испытания
            moves = Math.max(12, moves - 1);
        }

        // 4. ЖЕСТКИЕ ПРЕДЕЛЫ БАЛАНСА (Капы для играбельности)
        // Гарантируем, что цель по сердцам никогда не превысит 150 (иначе уровень физически невозможно пройти)
        if (heartsGoal > 150) {
            heartsGoal = 150 - (i % 20); // Слегка колеблем цель около 130-150 для разнообразия
        }
        if (heartsGoal < 10) heartsGoal = 10;

        // Гарантируем, что у игрока всегда будет минимум 10 ходов
        if (moves < 10) moves = 10;

        // Добавляем готовый уровень в общую базу данных
        LEVELS.push({
            id: i,
            heartsGoal: heartsGoal,
            moves: moves,
            difficulty: difficulty,
            completed: false,
            bestScore: 0,
            stars: 0
        });
    }

    // Ручная точечная настройка первых трех уровней (для идеального обучения игрока)
    LEVELS[0] = {
        id: 1,
        heartsGoal: 10,
        moves: 22,
        difficulty: "normal",
        completed: false,
        bestScore: 0,
        stars: 0
    };

    LEVELS[1] = {
        id: 2,
        heartsGoal: 12,
        moves: 20,
        difficulty: "normal",
        completed: false,
        bestScore: 0,
        stars: 0
    };

    LEVELS[2] = {
        id: 3,
        heartsGoal: 15,
        moves: 18,
        difficulty: "medium", // Первый сложный уровень
        completed: false,
        bestScore: 0,
        stars: 0
    };

    // Экспортируем готовую базу данных в глобальную систему игры
    window.LEVELS = LEVELS;

    console.log(`levels.js: Успешно просчитан баланс для ${LEVELS.length} уровней. Игра готова!`);
})();
