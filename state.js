// ================================================
// state.js
// Модуль управления сохранением и ресурсами игры
// ================================================

(function() {
    // Дефолтные настройки новой игры (если игрок зашел в первый раз)
    const DEFAULT_STATE = {
        lives: 5,               // Жизни
        stars: 0,               // Звезды для ремонта
        cash: 250,              // Валюта (монеты)
        reputation: 10,         // Репутация браконьера (для выборов)
        currentLevel: 1,        // Текущий уровень три в ряд
        // Статус ремонта мебели в первой комнате Убежища
        decor: {
            floor: "Гнилые доски",
            walls: "Осыпающаяся штукатурка",
            bed: "Пыльный матрас",
            table: "Шатающийся верстак",
            cabinet: "Сломанный комод",
            windows: "Забиты фанерой"
        }
    };

    // Переменная, где будут храниться текущие данные игрока во время игры
    let state = {};

    // 1. ФУНКЦИЯ СОХРАНЕНИЯ ИГРЫ
    function saveGame() {
        try {
            // Превращаем данные в текст и пишем в память браузера (localStorage)
            localStorage.setItem('poacher_game_save', JSON.stringify(state));
        } catch (e) {
            console.error("Не удалось сохранить игру в localStorage:", e);
        }
    }

    // 2. ФУНКЦИЯ ЗАГРУЗКИ ИГРЫ
    function loadGame() {
        const savedData = localStorage.getItem('poacher_game_save');
        if (savedData) {
            try {
                // Если сохранение есть, читаем его
                state = JSON.parse(savedData);
            } catch (e) {
                // Если сохранение повреждено, берем чистую игру
                console.error("Ошибка чтения сохранения. Начинаем новую игру.");
                state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            }
        } else {
            // Если игрок зашел впервые — даем ему дефолтный профиль
            state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
        
        // Сразу обновляем все показатели на экране после загрузки
        updateHUD();
        updateHideoutInterior();
    }

    // 3. ОБНОВЛЕНИЕ ВЕРХНЕЙ ПАНЕЛИ (HUD) НА ЭКРАНЕ
    function updateHUD() {
        const hudLives = document.getElementById('hudLives');
        const hudStars = document.getElementById('hudStars');
        const hudCash = document.getElementById('hudCash');
        const hudRep = document.getElementById('hudRep');

        if (hudLives) hudLives.textContent = state.lives;
        if (hudStars) hudStars.textContent = state.stars;
        if (hudCash) hudCash.textContent = state.cash + "₽";
        if (hudRep) hudRep.textContent = state.reputation;
    }

    // 4. ОБНОВЛЕНИЕ ТЕКСТА ИНТЕРЬЕРА В УБЕЖИЩЕ
    function updateHideoutInterior() {
        const dFloor = document.getElementById('decorFloor');
        const dWalls = document.getElementById('decorWalls');
        const dBed = document.getElementById('decorBed');
        const dTable = document.getElementById('decorTable');
        const dCabinet = document.getElementById('decorCabinet');
        const dWindows = document.getElementById('decorWindows');

        if (dFloor && state.decor.floor) dFloor.textContent = state.decor.floor;
        if (dWalls && state.decor.walls) dWalls.textContent = state.decor.walls;
        if (dBed && state.decor.bed) dBed.textContent = state.decor.bed;
        if (dTable && state.decor.table) dTable.textContent = state.decor.table;
        if (dCabinet && state.decor.cabinet) dCabinet.textContent = state.decor.cabinet;
        if (dWindows && state.decor.windows) dWindows.textContent = state.decor.windows;
    }

    // 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ДРУГИХ МОДУЛЕЙ (Геттеры и Сеттеры)
    // Чтобы другие JS-файлы могли легко менять баланс и мебель
    const GameState = {
        // Узнать баланс
        getStars: () => state.stars,
        getLives: () => state.lives,
        getCash: () => state.cash,
        getReputation: () => state.reputation,
        getCurrentLevel: () => state.currentLevel,
        getDecor: (item) => state.decor[item],

        // Изменить баланс звезд
        addStars: (amount) => {
            state.stars += amount;
            updateHUD();
            saveGame();
        },
        spendStars: (amount) => {
            if (state.stars >= amount) {
                state.stars -= amount;
                updateHUD();
                saveGame();
                return true; // Успешно потрачено
            }
            return false; // Звезд не хватило
        },

        // Изменить баланс денег
        addCash: (amount) => {
            state.cash += amount;
            updateHUD();
            saveGame();
        },
        spendCash: (amount) => {
            if (state.cash >= amount) {
                state.cash -= amount;
                updateHUD();
                saveGame();
                return true;
            }
            return false;
        },

        // Изменить репутацию
        addReputation: (amount) => {
            state.reputation += amount;
            updateHUD();
            saveGame();
        },

        // Списать одну жизнь при проигрыше
        loseLife: () => {
            if (state.lives > 0) {
                state.lives--;
                updateHUD();
                saveGame();
            }
        },

        // Начислить жизнь
        addLife: () => {
            if (state.lives < 5) {
                state.lives++;
                updateHUD();
                saveGame();
            }
        },

        // Перейти на следующий уровень
        nextLevel: () => {
            state.currentLevel++;
            saveGame();
        },

        // Заменить предмет мебели в Убежище
        updateDecorItem: (item, newValue) => {
            if (state.decor.hasOwnProperty(item)) {
                state.decor[item] = newValue;
                updateHideoutInterior();
                saveGame();
            }
        },

        // Функция сброса сохранения (для тестов)
        resetAll: () => {
            state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            updateHUD();
            updateHideoutInterior();
            saveGame();
        }
    };

    // Экспортируем модуль глобально, чтобы он был виден во всех остальных JS файлах
    window.GameState = GameState;

    // Автоматическая загрузка сохранения при старте игры
    document.addEventListener("DOMContentLoaded", () => {
        loadGame();
        console.log("state.js: Профиль игрока успешно загружен!");
    });
})();
