// ================================================
// map.js
// Модуль управления картой, перемещениями и разблокировкой зон
// ================================================

(function() {
    // Находим кнопки на экранах (ИСПРАВЛЕННЫЕ ID ПОД INDEX.HTML)
    const btnGoToMap = document.getElementById('btnGoToMap'); // Кнопка "На охоту" в Убежище
    const btnBackToHideout = document.getElementById('btnBackToHideout'); // Кнопка "Назад" на Карте
    
    // Элементы путей (нод) на карте
    const nodeCheckpoint = document.getElementById('nodeCheckpoint'); // Узел КПП
    const nodeLevelBtn = document.getElementById('nodeLevelBtn'); // Узел обычного уровня

    // 1. ГЛОБАЛЬНЫЙ ПЕРЕКЛЮЧАТЕЛЬ ЭКРАНОВ
    window.showScreen = function(screenId) {
        const screens = document.querySelectorAll('.game-screen');
        screens.forEach(screen => {
            screen.classList.add('hidden');
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            
            // Если переключились на Убежище, обновляем список задач
            if (screenId === 'screenHideout' && window.HideoutUpgradeEngine) {
                window.HideoutUpgradeEngine.render();
            }
            
            // Если переключились на Карту, обновляем прогресс локаций
            if (screenId === 'screenMap') {
                updateMapNodesUI();
            }
        }
    };

    // 2. ОБНОВЛЕНИЕ СТАТУСА ЛОКАЦИЙ НА КАРТЕ
    function updateMapNodesUI() {
        if (!window.GameState) return;

        const currentLevel = window.GameState.getCurrentLevel();

        const kppStatusText = nodeCheckpoint ? nodeCheckpoint.querySelector('.node-status') : null;
        const levelTitleText = nodeLevelBtn ? nodeLevelBtn.querySelector('.node-title') : null;

        // Логика КПП (🚧): Открывается только на 5-м уровне
        if (currentLevel < 5) {
            if (nodeCheckpoint) {
                nodeCheckpoint.className = "map-node node-checkpoint locked";
            }
            if (kppStatusText) {
                kppStatusText.textContent = "Доступно с 5 уровня";
            }

            if (nodeLevelBtn) {
                nodeLevelBtn.className = "map-node node-level active";
            }
            if (levelTitleText) {
                levelTitleText.textContent = `Уровень ${currentLevel}`;
            }
        } 
        else if (currentLevel === 5) {
            if (nodeCheckpoint) {
                nodeCheckpoint.className = "map-node node-checkpoint active";
            }
            if (kppStatusText) {
                kppStatusText.innerHTML = `Уровень 5 <span style="color:var(--blood); font-weight:800;">(ШТУРМ КПП)</span>`;
            }

            if (nodeLevelBtn) {
                nodeLevelBtn.className = "map-node node-level locked";
            }
            if (levelTitleText) {
                levelTitleText.textContent = `Ждите зачистки КПП`;
            }
        } 
        else {
            if (nodeCheckpoint) {
                nodeCheckpoint.className = "map-node node-checkpoint";
            }
            if (kppStatusText) {
                kppStatusText.innerHTML = `Зачищено ✔ <span style="color:var(--toxic); font-weight:800;">(ПРОЙДЕНО)</span>`;
            }

            if (nodeLevelBtn) {
                nodeLevelBtn.className = "map-node node-level active";
            }
            if (levelTitleText) {
                levelTitleText.textContent = `Охота: Уровень ${currentLevel}`;
            }
        }
    }

    // 3. НАСТРОЙКА КЛИКОВ НА КНОПКИ НАВИГАЦИИ
    
    // Кнопка "На охоту" (Убежище ➔ Карта)
    if (btnGoToMap) {
        btnGoToMap.addEventListener('click', () => {
            window.showScreen('screenMap');
        });
    }

    // Кнопка "Назад" (Карта ➔ Убежище)
    if (btnBackToHideout) {
        btnBackToHideout.addEventListener('click', () => {
            window.showScreen('screenHideout');
        });
    }

    // Клик по узлу уровня на карте запускает игру три в ряд
    if (nodeLevelBtn) {
        nodeLevelBtn.addEventListener('click', () => {
            const isActive = nodeLevelBtn.classList.contains('active');
            if (isActive && window.openPreLevelScreen) {
                const currentLevel = window.GameState.getCurrentLevel();
                window.openPreLevelScreen(currentLevel);
            }
        });
    }

    // Клик по узлу КПП
    if (nodeCheckpoint) {
        nodeCheckpoint.addEventListener('click', () => {
            if (nodeCheckpoint.classList.contains('active') && window.openPreLevelScreen) {
                const currentLevel = window.GameState.getCurrentLevel();
                window.openPreLevelScreen(currentLevel);
            }
        });
    }

    // Экспортируем модуль карты глобально
    window.MapEngine = {
        updateUI: updateMapNodesUI
    };

    console.log("map.js: Карта запущена в рабочем режиме!");
})();
