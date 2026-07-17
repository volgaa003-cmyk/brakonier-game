// ================================================
// state.js (ОБНОВЛЕННЫЙ)
// ================================================

(function() {
const DEFAULT_STATE = {
        lives: 5,               
        stars: 3, // Даем 3 звезды на старте для проверки ремонта              
        cash: 1000,             
        reputation: 10,         
        
        reputation_people: 0,       
        reputation_underground: 0,  
        reputation_changed: 0,      

        currentLevel: 1,
        
        // Текущая комната, в которой находится игрок
        activeRoom: "living_room",
        
// Модернизированный реестр мебели по 8 помещениям квартиры Гены
        decor: {
            corridor: {
                entrance_door: 0 // 0 - гнилая дверь, 1 - деревянная, 2 - сейфовая, 3 - гермозатвор
            },
            kitchen: {
                kitchen_set: 0   // 0 - старый стол, 1 - советский стол, 2 - гарнитур, 3 - проф. плита
            },
            living_room: {
                sofa: 0          // 0 - порванный диван, 1 - простой диван, 2 - кожаный диван, 3 - угловой диван-трансформер
            },
            bedroom: {
                bed: 0,          // 0 - матрас, 1 - раскладушка, 2 - дубовая кровать, 3 - спальный бокс
                wardrobe: 0      // 0 - вешалка, 1 - шкаф, 2 - шкаф-купе, 3 - гардеробная
            },
            workshop: {
                workbench: 0,    // 0 - старый стол, 1 - стол для тисков, 2 - стальной верстак, 3 - автоматика
                ammo_press: 0    // 0 - ручные тиски, 1 - ручной пресс, 2 - полуавтомат, 3 - станция дозирования
            },
            pantry: {
                shelves: 0       // 0 - хлипкие полки, 1 - деревянные полки, 2 - стальные стеллажи, 3 - герметичные ящики
            },
            toilet: {
                toilet_plumbing: 0 // 0 - ведро, 1 - простой унитаз, 2 - биотуалет, 3 - био-очистная кабина
            },
            bathroom: {
                shower: 0        // 0 - ржавый таз, 1 - ванна с бойлером, 2 - душевой бокс, 3 - кабина с системой фильтрации
            }
        },

        // Прогресс и инвентарь — раньше отсутствовали в DEFAULT_STATE,
        // из-за чего при первом запуске (без сохранения) или после resetAll()
        // падали методы вроде isTaskCompleted() (state.completedTasks.includes)
        completedTasks: [],
        inventory: [],
        collectedCollectibleIds: [],
        boostersPre: { rainbow: 2, combo: 2, doublePlanes: 2 },
        boostersActive: { hammer: 3, glove: 3, broom: 3, weight: 3, fan: 3 }
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
                if (!state.completedTasks) state.completedTasks = [];
                if (!state.boostersPre) state.boostersPre = { rainbow: 2, combo: 2, doublePlanes: 2 };
                if (!state.boostersActive) state.boostersActive = { hammer: 3, glove: 3, broom: 3, weight: 3, fan: 3 };
                if (state.reputation_people === undefined) state.reputation_people = 0;
                if (state.reputation_underground === undefined) state.reputation_underground = 0;
                if (state.reputation_changed === undefined) state.reputation_changed = 0;
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
        // На HUD выводим сумму репутации или среднее значение
        if (hudRep) hudRep.textContent = state.reputation_people + state.reputation_underground + state.reputation_changed;
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
        getCurrentLevel: () => state.currentLevel,
        getDecor: (item) => state.decor[item],
        
        getReputation: () => state.reputation_people + state.reputation_underground + state.reputation_changed,
        getReputationPeople: () => state.reputation_people,
        getReputationUnderground: () => state.reputation_underground,
        getReputationChanged: () => state.reputation_changed,

        getPreBoosterCount: (type) => state.boostersPre[type] || 0,
        getActiveBoosterCount: (type) => state.boostersActive[type] || 0,

        isTaskCompleted: (taskId) => state.completedTasks.includes(taskId),
        getActiveRoom: () => state.activeRoom,
        setActiveRoom: (room) => {
            state.activeRoom = room;
            saveGame();
        },

        getDecorLevel: (room, item) => {
            return state.decor[room] ? (state.decor[room][item] || 0) : 0;
        },

        setDecorLevel: (room, item, level) => {
            if (state.decor[room]) {
                state.decor[room][item] = level;
                saveGame();
            }
        },

        getInventory: () => state.inventory || [],
        
        addInventoryItem: (itemId, itemName) => {
            if (!state.inventory) state.inventory = [];
            state.inventory.push(itemName);
            if (!state.collectedCollectibleIds) state.collectedCollectibleIds = [];
            state.collectedCollectibleIds.push(itemId);
            saveGame();
        },

        isCollectibleCollected: (itemId) => {
            return state.collectedCollectibleIds ? state.collectedCollectibleIds.includes(itemId) : false;
        },
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

        addFactionRep: (faction, amount) => {
            if (faction === 'people') state.reputation_people += amount;
            else if (faction === 'underground') state.reputation_underground += amount;
            else if (faction === 'changed') state.reputation_changed += amount;
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

        completeTask: (taskId) => {
            if (!state.completedTasks.includes(taskId)) {
                state.completedTasks.push(taskId);
                saveGame();
            }
        },

        useOrBuyPreBooster: (type, cost) => {
            if (state.boostersPre[type] > 0) {
                state.boostersPre[type]--;
                saveGame();
                return true;
            } else if (state.cash >= cost) {
                state.cash -= cost;
                updateHUD();
                saveGame();
                return true;
            }
            return false;
        },

        useOrBuyActiveBooster: (type, cost) => {
            if (state.boostersActive[type] > 0) {
                state.boostersActive[type]--;
                saveGame();
                return true;
            } else if (state.cash >= cost) {
                state.cash -= cost;
                updateHUD();
                saveGame();
                return true;
            }
            return false;
        },

        addPreBooster: (type, amount) => {
            state.boostersPre[type] = (state.boostersPre[type] || 0) + amount;
            saveGame();
        },

        addActiveBooster: (type, amount) => {
            state.boostersActive[type] = (state.boostersActive[type] || 0) + amount;
            saveGame();
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
        console.log("state.js: Система фракционной репутации инициализирована!");
    });
})();
