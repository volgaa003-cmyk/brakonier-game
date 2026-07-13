// ================================================
// map.js
// Модуль управления картой, перемещениями и разблокировкой зон
// ================================================

(function() {
    // Находим HTML-элементы экранов и кнопок на карте
    const btnGoToMap = document.getElementById('goToHuntBtn'); // Кнопка "На охоту" в Убежище
    const btnBackToHideout = document.getElementById('backToHideoutBtn'); // Кнопка "Назад" на Карте
    const btnStartLevelFromMap = document.getElementById('startLevelFromMap'); // Кнопка запуска боя
    
    // Элементы путей (нод) на карте
    const mapNodeKPP = document.getElementById('mapNodeKPP');
    const nodeKPPText = document.getElementById('nodeKPPText');
    const mapNodeRuins = document.getElementById('mapNodeRuins');

    // 1. ГЛОБАЛЬНЫЙ ПЕРЕКЛЮЧАТЕЛЬ ЭКРАНОВ
    // Скрывает все экраны и показывает только нужный
    window.showScreen = function(screenId) {
        const screens = document.querySelectorAll('.game-screen');
        screens.forEach(screen => {
            screen.classList.add('hidden');
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            
            // Если мы переключились на Убежище, обновляем там список задач
            if (screenId === 'hideoutScreen' && window.HideoutUpgradeEngine) {
                window.HideoutUpgradeEngine.render();
            }
            
            // Если переключились на Карту, обновляем прогресс локаций
            if (screenId === 'mapScreen') {
                updateMapNodesUI();
            }
        } else {
            console.error(`Экран с ID "${screenId}" не найден в HTML разметке.`);
        }
    };

    // 2. ОБНОВЛЕНИЕ СТАТУСА ЛОКАЦИЙ НА КАРТЕ
    // Зависит от того, какой уровень три в ряд сейчас у игрока в GameState
    function updateMapNodesUI() {
        if (!window.GameState) return;

        const currentLevel = window.GameState.getCurrentLevel();

        // Логика КПП (🚧): Охраняет выход из зоны безопасности
        if (currentLevel <= 5) {
            // КПП активен и штурмуется прямо сейчас
            if (mapNodeKPP) {
                mapNodeKPP.className = "map-node active"; // Возвращаем яркий желтый/оранжевый стиль
            }
            if (nodeKPPText) {
                nodeKPPText.innerHTML = `Уровень ${currentLevel} <span style="font-size:10px; color:var(--blood); font-weight:800;">(ШТУРМ)</span>`;
            }

            // Разрушенный город за КПП пока закрыт для вылазок
            if (mapNodeRuins) {
                mapNodeRuins.className = "map-node locked";
                const ruinsStatus = mapNodeRuins.querySelector('span:last-child');
                if (ruinsStatus) ruinsStatus.textContent = "Требуется зачистка КПП";
            }
        } else {
            // Если текущий уровень больше 5 — КПП успешно зачищен браконьером!
            if (mapNodeKPP) {
                mapNodeKPP.className = "map-node"; // Обычный бумажный стиль
            }
            if (nodeKPPText) {
                nodeKPPText.innerHTML = `Зачищено ✔ <span style="font-size:10px; color:var(--toxic); font-weight:800;">(БЕЗОПАСНО)</span>`;
            }

            // РАЗРУШЕННЫЙ ГОРОД (🏙️) — Теперь открыт для свободной охоты!
            if (mapNodeRuins) {
                mapNodeRuins.className = "map-node active"; // Горит ярким бирюзовым цветом
                const ruinsStatus = mapNodeRuins.querySelector('span:last-child');
                if (ruinsStatus) ruinsStatus.textContent = `Уровень ${currentLevel} (ОХОТА)`;
            }
        }
    }

    // 3. СЛУШАТЕЛИ ПЕРЕМЕЩЕНИЙ
    
    // Переход из Убежища ➔ на Карту
    if (btnGoToMap) {
        btnGoToMap.addEventListener('click', () => {
            window.showScreen('mapScreen');
        });
    }

    // Возврат из Карты ➔ в Убежище
    if (btnBackToHideout) {
        btnBackToHideout.addEventListener('click', () => {
            window.showScreen('hideoutScreen');
        });
    }

    // Клик на кнопку "Пробиться на охоту" (Запуск три в ряд)
    if (btnStartLevelFromMap) {
        btnStartLevelFromMap.addEventListener('click', () => {
            if (!window.GameState) return;
            const currentLevel = window.GameState.getCurrentLevel();
            
            // Вызываем глобальную функцию открытия старта уровня (будет описана в match3.js/levels.js)
            if (window.openPreLevelScreen) {
                window.openPreLevelScreen(currentLevel);
            } else {
                console.error("Функция openPreLevelScreen не найдена. Проверь подключение скриптов.");
            }
        });
    }

    // Также разрешаем запускать карточку уровня при клике непосредственно на активные иконки локаций на карте
    if (mapNodeKPP) {
        mapNodeKPP.addEventListener('click', () => {
            if (mapNodeKPP.classList.contains('active') && window.openPreLevelScreen) {
                const currentLevel = window.GameState.getCurrentLevel();
                window.openPreLevelScreen(currentLevel);
            }
        });
    }

    if (mapNodeRuins) {
        mapNodeRuins.addEventListener('click', () => {
            if (mapNodeRuins.classList.contains('active') && window.openPreLevelScreen) {
                const currentLevel = window.GameState.getCurrentLevel();
                window.openPreLevelScreen(currentLevel);
            }
        });
    }

    // Экспортируем модуль карты глобально
    window.MapEngine = {
        updateUI: updateMapNodesUI
    };

    console.log("map.js: Система переходов и карта успешно подключены!");
})();
