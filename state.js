// ================================================
// state.js (ОБНОВЛЕННЫЙ)
// Модуль управления сохранениями, ресурсами и задачами
// ================================================

(function() {
    const DEFAULT_STATE = {
        lives: 5,               
        stars: 1,               // Даем 1 звезду на старт, чтобы можно было сразу купить Пролог!
        cash: 250,              
        reputation: 10,         
        currentLevel: 1,        
        decor: {
            floor: "Гнилые доски",
            walls: "Осыпающаяся штукатурка",
            bed: "Пыльный матрас",
            table: "Шатающийся верстак",
            cabinet: "Сломанный комод",
            windows: "Забиты фанерой"
        },
        completedTasks: []      // Список ID купленных сюжетных глав и выполненных задач
    };

    let state = {};

    function saveGame() {
        try {
            localStorage.setItem('poacher_game_save', JSON.stringify(state));
        } catch (e) {
            console.error("Не удалось сохранить игру:", e);
        }
    }

    function loadGame() {
        const savedData = localStorage.getItem('poacher_game_save');
        if (savedData) {
            try {
                state = JSON.parse(savedData);
                // Защита: если у старого игрока нет этого поля, создаем его
                if (!state.completedTasks) {
                    state.completedTasks = [];
                }
            } catch (e) {
                state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            }
        } else {
            state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
        
        updateHUD();
        updateHideoutInterior();
    }

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

    const GameState = {
        getStars: () => state.stars,
        getLives: () => state.lives,
        getCash: () => state.cash,
        getReputation: () => state.reputation,
        getCurrentLevel: () => state.currentLevel,
        getDecor: (item) => state.decor[item],
        
        // Проверка: куплена ли задача/глава
        isTaskCompleted: (taskId) => state.completedTasks.includes(taskId),

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
                return true; 
            }
            return false; 
        },

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

        addReputation: (amount) => {
            state.reputation += amount;
            updateHUD();
            saveGame();
        },

        loseLife: () => {
            if (state.lives > 0) {
                state.lives--;
                updateHUD();
                saveGame();
            }
        },

        addLife: () => {
            if (state.lives < 5) {
                state.lives++;
                updateHUD();
                saveGame();
            }
        },

        nextLevel: () => {
            state.currentLevel++;
            saveGame();
        },

        updateDecorItem: (item, newValue) => {
            if (state.decor.hasOwnProperty(item)) {
                state.decor[item] = newValue;
                updateHideoutInterior();
                saveGame();
            }
        },

        // Помечаем сюжет или ремонт как выполненный/купленный
        completeTask: (taskId) => {
            if (!state.completedTasks.includes(taskId)) {
                state.completedTasks.push(taskId);
                saveGame();
            }
        },

        resetAll: () => {
            state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            updateHUD();
            updateHideoutInterior();
            saveGame();
        }
    };

    window.GameState = GameState;

    document.addEventListener("DOMContentLoaded", () => {
        loadGame();
        console.log("state.js: Сохранения обновлены!");
    });
})();
