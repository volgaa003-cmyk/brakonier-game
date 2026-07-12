// ================================================
// levels.js
// Все уровни игры "Браконьер — Охота на сердца"
// ================================================

const LEVELS = [];

// Заполняем 300 уровней
for (let i = 1; i <= 300; i++) {
    
    let heartsGoal = 12;        // базовое количество сердец
    let moves = 22;             // базовое количество ходов
    let difficulty = "normal";  // сложность уровня

    // Увеличиваем сложность постепенно
    if (i <= 30) {
        heartsGoal = 12 + Math.floor(i * 1.2);
        moves = 22 - Math.floor(i / 8);
    } 
    else if (i <= 80) {
        heartsGoal = 25 + Math.floor((i - 30) * 1.8);
        moves = 19 - Math.floor((i - 30) / 12);
        difficulty = "medium";
    } 
    else if (i <= 150) {
        heartsGoal = 60 + Math.floor((i - 80) * 2.3);
        moves = 17 - Math.floor((i - 80) / 15);
        difficulty = "hard";
    } 
    else {
        heartsGoal = 100 + Math.floor((i - 150) * 3.1);
        moves = 15 - Math.floor((i - 150) / 20);
        difficulty = "extreme";
    }

    // Ограничиваем минимальное количество ходов
    if (moves < 10) moves = 10;

    LEVELS.push({
        id: i,                          // Номер уровня
        heartsGoal: heartsGoal,         // Сколько сердец нужно собрать
        moves: moves,                   // Сколько ходов даётся
        difficulty: difficulty,         // Сложность (для будущего расширения)
        completed: false,               // Пройден ли уровень
        bestScore: 0,                   // Лучший результат (выручка)
        stars: 0                        // Количество звёзд (0-3)
    });
}

// Пример ручной настройки отдельных уровней (можно менять)
LEVELS[0] = {   // Уровень 1
    id: 1,
    heartsGoal: 12,
    moves: 22,
    difficulty: "easy",
    completed: false,
    bestScore: 0,
    stars: 0
};

LEVELS[9] = {   // Уровень 10
    id: 10,
    heartsGoal: 35,
    moves: 18,
    difficulty: "medium",
    completed: false,
    bestScore: 0,
    stars: 0
};

LEVELS[299] = { // Уровень 300 (финальный)
    id: 300,
    heartsGoal: 250,
    moves: 12,
    difficulty: "extreme",
    completed: false,
    bestScore: 0,
    stars: 0
};

// Экспорт для использования в других файлах
// (в браузере просто window.LEVELS)
window.LEVELS = LEVELS;

console.log(`Загружено ${LEVELS.length} уровней. Готово к игре!`);
