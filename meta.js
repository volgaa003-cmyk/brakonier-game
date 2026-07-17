// ================================================
// meta.js (ИНТЕРАКТИВНЫЙ Point-and-Click ДВИЖОК КВАРТИРЫ)
// ================================================

(function() {
    // 1. БАЗА ДАННЫХ КОМНАТ, МЕБЕЛИ И ПРЕДМЕТОВ
    const ROOMS_DATABASE = {
        "living_room": {
            title: "Комната: Жилой блок Гены",
            background: "bg_hotel_dawn.jpg", // Используем фоны из вашей графической базы
            hotspots: [
                // Портал в Оружейную мастерскую
                {
                    id: "portal_to_workshop",
                    type: "portal",
                    x: 82, y: 35, w: 12, h: 50,
                    targetRoom: "workshop"
                },
                // Улучшение: Дверь
                {
                    id: "upgrade_door",
                    type: "upgrade",
                    itemKey: "door",
                    x: 48, y: 30, w: 14, h: 52,
                    title: "Входная дверь",
                    options: [
                        { name: "Простая деревянная дверь", desc: "Защитит разве что от сквозняка.", cost: 1 },
                        { name: "Стальная сейфовая дверь", desc: "Усиленные петли и надежный замок.", cost: 2 },
                        { name: "Бронированный гермозатвор", desc: "Выдержит прямой выстрел из гранатомета.", cost: 3 }
                    ]
                },
                // Улучшение: Кровать
                {
                    id: "upgrade_bed",
                    type: "upgrade",
                    itemKey: "bed",
                    x: 12, y: 55, w: 25, h: 35,
                    title: "Спальное место",
                    options: [
                        { name: "Армейская раскладушка", desc: "Жестко, но спина больше не на полу.", cost: 1 },
                        { name: "Крепкая дубовая кровать", desc: "Удобный чистый матрас и теплое одеяло.", cost: 2 },
                        { name: "Тактический спальный бокс", desc: "Капсула с климат-контролем и шумоизоляцией.", cost: 3 }
                    ]
                },
                // Скрытый предмет: Серебряный слиток Гены
                {
                    id: "collectible_silver",
                    type: "collectible",
                    x: 39, y: 76, w: 6, h: 8,
                    itemName: "🥈 Серебряный провод",
                    toastMsg: "Найден кусок серебряного провода! Пригодится для плавки пуль."
                }
            ]
        },
        "workshop": {
            title: "Комната: Оружейная мастерская Гены",
            background: "bg_boiler_room.jpg",
            hotspots: [
                // Портал обратно в Жилой блок
                {
                    id: "portal_to_living",
                    type: "portal",
                    x: 5, y: 35, w: 12, h: 50,
                    targetRoom: "living_room"
                },
                // Улучшение: Рабочий Стол/Верстак
                {
                    id: "upgrade_table",
                    type: "upgrade",
                    itemKey: "table",
                    x: 35, y: 50, w: 30, h: 40,
                    title: "Верстак браконьера",
                    options: [
                        { name: "Стол из толстых досок", desc: "Для простой чистки оружия.", cost: 1 },
                        { name: "Тяжелый верстак из швеллеров", desc: "Выдержит тиски и сверлильный станок.", cost: 2 },
                        { name: "Лабораторный химический стол", desc: "Для дистилляции кислот и плавки серебра.", cost: 3 }
                    ]
                },
                // Улучшение: Оружейный Шкаф
                {
                    id: "upgrade_cabinet",
                    type: "upgrade",
                    itemKey: "cabinet",
                    x: 72, y: 25, w: 18, h: 60,
                    title: "Сейф для патронов",
                    options: [
                        { name: "Простой деревянный шкаф", desc: "Просто вешалки и полки.", cost: 1 },
                        { name: "Стальной шкаф для патронов", desc: "Запирается на надежный навесной замок.", cost: 2 },
                        { name: "Электронный сейф с кодом", desc: "Огнеупорный сейф высшего класса защиты.", cost: 3 }
                    ]
                },
                // Скрытый предмет: Банка бездымного пороха
                {
                    id: "collectible_powder",
                    type: "collectible",
                    x: 67, y: 44, w: 4, h: 8,
                    itemName: "🔥 Банка пороха",
                    toastMsg: "Найдена банка бездымного пороха!"
                }
            ]
        }
    };

    // DOM-элементы вьюпорта комнат
    const hideoutRoomTitle = document.getElementById('hideoutRoomTitle');
    const roomBgLayer = document.getElementById('roomBgLayer');
    const hotspotsContainer = document.getElementById('hotspotsContainer');
    const inventorySlots = document.getElementById('inventorySlots');

    // Окна улучшений мебели
    const overlayUpgradeSelector = document.getElementById('overlayUpgradeSelector');
    const upgradeItemTitle = document.getElementById('upgradeItemTitle');
    const upgradeOptionsList = document.getElementById('upgradeOptionsList');
    const btnCancelUpgrade = document.getElementById('btnCancelUpgrade');

    let pendingUpgradeHotspot = null; // Хотспот, выбранный для улучшения

    // 2. ОТРИСОВКА КОМНАТЫ И ХОТСПУТОВ
    function renderRoom() {
        if (!window.GameState) return;

        const currentRoomId = window.GameState.getActiveRoom() || "living_room";
        const roomData = ROOMS_DATABASE[currentRoomId];

        if (!roomData) return;

        // Обновляем заголовок и фон комнаты
        if (hideoutRoomTitle) hideoutRoomTitle.textContent = roomData.title;
        if (roomBgLayer) {
            roomBgLayer.style.backgroundImage = `url('images/${roomData.background}')`;
        }

        // Очищаем и заново создаем интерактивные точки на экране
        if (hotspotsContainer) {
            hotspotsContainer.innerHTML = "";

            roomData.hotspots.forEach(hs => {
                // Если предмет коллекционный и уже был подобран — не выводим его
                if (hs.type === "collectible" && window.GameState.isCollectibleCollected(hs.id)) {
                    return;
                }

                const hsEl = document.createElement('div');
                hsEl.className = `hotspot type-${hs.type}`;
                hsEl.style.left = hs.x + "%";
                hsEl.style.top = hs.y + "%";
                hsEl.style.width = hs.w + "%";
                hsEl.style.height = hs.h + "%";

                // Подписываемся на клик по хотспоту
                hsEl.addEventListener('click', () => {
                    handleHotspotClick(hs);
                });

                hotspotsContainer.appendChild(hsEl);
            });
        }

        // Перерисовываем рюкзак-инвентарь
        renderInventory();
    }

    // 3. РЕАКЦИЯ НА КЛИК ПО ТОЧКЕ ИНТЕРЕСА
    function handleHotspotClick(hs) {
        if (hs.type === "portal") {
            // ПЕРЕХОД: Меняем комнату во вьюпорте
            window.GameState.setActiveRoom(hs.targetRoom);
            renderRoom();
            showToast("Переход в другую комнату...");
        } 
        else if (hs.type === "collectible") {
            // СБОР ПРЕДМЕТА: Помещаем в рюкзак
            window.GameState.addInventoryItem(hs.id, hs.itemName);
            showToast(hs.toastMsg || "Предмет добавлен в инвентарь!");
            renderRoom(); // Перерисовываем (убираем хотспот)
        } 
        else if (hs.type === "upgrade") {
            // МЕБЕЛЬ: Открываем карточку с 3 вариантами улучшения
            openUpgradeSelector(hs);
        }
    }

    // 4. ОКНО МОДЕРНИЗАЦИИ (Выбор из 3-х вариантов)
    function openUpgradeSelector(hs) {
        pendingUpgradeHotspot = hs;
        if (upgradeItemTitle) upgradeItemTitle.textContent = `Улучшение: ${hs.title}`;

        const currentRoomId = window.GameState.getActiveRoom();
        const currentLevel = window.GameState.getDecorLevel(currentRoomId, hs.itemKey);

        if (upgradeOptionsList) {
            upgradeOptionsList.innerHTML = "";

            hs.options.forEach((opt, index) => {
                const optLevel = index + 1; // Уровень улучшения (1, 2 или 3)
                const isOwned = currentLevel >= optLevel;

                const card = document.createElement('div');
                card.className = `upgrade-option-card ${currentLevel === optLevel ? 'active-decor' : ''}`;

                let actionBox = "";
                if (currentLevel === optLevel) {
                    actionBox = `<span style="color:var(--toxic); font-weight:800; font-size:11px;">Активно ✔</span>`;
                } else if (isOwned) {
                    actionBox = `<span style="color:var(--sky); font-weight:800; font-size:11px;">Приобретено</span>`;
                } else {
                    actionBox = `<button class="opt-btn" data-level="${optLevel}">⭐ ${opt.cost}</button>`;
                }

                card.innerHTML = `
                    <div class="opt-info">
                      <div class="opt-name">${optLevel}. ${opt.name}</div>
                      <div class="opt-desc">${opt.desc}</div>
                    </div>
                    <div class="opt-action">${actionBox}</div>
                `;

                // Покупка апгрейда по кнопке
                const btn = card.querySelector('.opt-btn');
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        buyUpgrade(hs, opt, optLevel);
                    });
                } else if (isOwned) {
                    // Если апгрейд уже куплен ранее, клик по карточке просто делает его активным декором
                    card.addEventListener('click', () => {
                        window.GameState.setDecorLevel(currentRoomId, hs.itemKey, optLevel);
                        showToast("Декор изменен!");
                        closeUpgradeSelector();
                    });
                }

                upgradeOptionsList.appendChild(card);
            });
        }

        if (overlayUpgradeSelector) overlayUpgradeSelector.classList.remove('hidden');
    }

    // ПОКУПКА УЛУЧШЕНИЯ
    function buyUpgrade(hs, opt, level) {
        if (!window.GameState) return;

        if (window.GameState.spendStars(opt.cost)) {
            const currentRoomId = window.GameState.getActiveRoom();
            window.GameState.setDecorLevel(currentRoomId, hs.itemKey, level);
            
            showToast("Мебель модернизирована!");
            closeUpgradeSelector();
        } else {
            showToast("Недостаточно звезд ⭐! Завершайте вылазки на охоте.");
        }
    }

    function closeUpgradeSelector() {
        if (overlayUpgradeSelector) overlayUpgradeSelector.classList.add('hidden');
        pendingUpgradeHotspot = null;
        renderRoom();
    }

    // 5. ПЕРЕРИСОВКА ИНВЕНТАРЯ (РЮКЗАКА НАХОДОК)
    function renderInventory() {
        if (!inventorySlots || !window.GameState) return;
        inventorySlots.innerHTML = "";

        const items = window.GameState.getInventory();
        if (items.length === 0) {
            inventorySlots.innerHTML = `<span style="font-size:11px; opacity:0.4; font-style:italic; padding-top:2px;">пусто</span>`;
            return;
        }

        items.forEach(itemName => {
            const itemEl = document.createElement('div');
            itemEl.className = "inventory-item";
            itemEl.textContent = itemName;
            inventorySlots.appendChild(itemEl);
        });
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 1500);
        }
    }

    // Слушатели кнопок закрытия
    if (btnCancelUpgrade) btnCancelUpgrade.addEventListener('click', closeUpgradeSelector);

    // Экспортируем движок комнат глобально
    window.HideoutUpgradeEngine = {
        render: renderRoom
    };

    // Запуск инициализации при открытии
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(renderRoom, 100);
    });
})();
