// ================================================
// meta.js (ИНТЕРАКТИВНЫЙ Point-and-Click ДВИЖОК КВАРТИРЫ)
// ================================================

(function() {
    // 1. БАЗА ДАННЫХ КОМНАТ, МЕБЕЛИ И ПРЕДМЕТОВ
    // 1. БАЗА ДАННЫХ 6 КОМНАТ КВАРТИРЫ, ИХ МЕБЕЛИ, ПОРТАЛОВ И НАХОДОК
    const ROOMS_DATABASE = {
        "main_room": {
            title: "Основная комната (Прихожая Гены)",
            background: "room_main_room.jpg",
            hotspots: [
                // Портал в Спальню (слева)
                {
                    id: "portal_to_bedroom",
                    type: "portal",
                    x: 5, y: 35, w: 10, h: 50,
                    targetRoom: "bedroom"
                },
                // Портал на Кухню
                {
                    id: "portal_to_kitchen",
                    type: "portal",
                    x: 20, y: 35, w: 10, h: 50,
                    targetRoom: "kitchen"
                },
                // Портал в Ванную
                {
                    id: "portal_to_bathroom",
                    type: "portal",
                    x: 65, y: 35, w: 10, h: 50,
                    targetRoom: "bathroom"
                },
                // Портал в Кладовку
                {
                    id: "portal_to_pantry",
                    type: "portal",
                    x: 80, y: 35, w: 10, h: 50,
                    targetRoom: "pantry"
                },
                // Портал в Мастерскую (вниз, в подвал)
                {
                    id: "portal_to_workshop",
                    type: "portal",
                    x: 45, y: 75, w: 10, h: 20,
                    targetRoom: "workshop"
                },
                // Улучшение: Входная дверь в подъезд
                {
                    id: "upgrade_entrance_door",
                    type: "upgrade",
                    itemKey: "entrance_door",
                    x: 43, y: 22, w: 14, h: 50,
                    title: "Входная дверь в подъезд",
                    options: [
                        { name: "Деревянная дверь", desc: "Хлипкое полотно с простым замком.", cost: 1 },
                        { name: "Стальная сейфовая дверь", desc: "Толстая сталь и два надежных замка.", cost: 2 },
                        { name: "Бронированный гермозатвор", desc: "Сейфовая дверь высшего класса защиты.", cost: 3 }
                    ]
                },
                // Находка: Обрывок старой газеты
                {
                    id: "collectible_newspaper",
                    type: "collectible",
                    x: 35, y: 70, w: 5, h: 6,
                    itemName: "📰 Обрывок газеты",
                    toastMsg: "Найден кусок газеты пятилетней давности с хрониками эпидемии..."
                }
            ]
        },
        "bedroom": {
            title: "Убежище: Спальня Гены",
            background: "room_bedroom.jpg",
            hotspots: [
                // Назад в Прихожую
                {
                    id: "portal_bedroom_to_main",
                    type: "portal",
                    x: 3, y: 40, w: 8, h: 45,
                    targetRoom: "main_room"
                },
                // Улучшение: Кровать
                {
                    id: "upgrade_bed",
                    type: "upgrade",
                    itemKey: "bed",
                    x: 25, y: 50, w: 25, h: 40,
                    title: "Спальное место",
                    options: [
                        { name: "Армейская раскладушка", desc: "Простой брезент на алюминиевой раме.", cost: 1 },
                        { name: "Крепкая дубовая кровать", desc: "Удобная постель с теплым одеялом.", cost: 2 },
                        { name: "Тактический спальный бокс", desc: "Капсула с климатической вентиляцией.", cost: 3 }
                    ]
                },
                // Улучшение: Шкаф
                {
                    id: "upgrade_wardrobe",
                    type: "upgrade",
                    itemKey: "wardrobe",
                    x: 70, y: 25, w: 15, h: 60,
                    title: "Платяной шкаф",
                    options: [
                        { name: "Вешалка-стойка", desc: "Просто пара крючков на металлической трубе.", cost: 1 },
                        { name: "Вместительный шкаф-купе", desc: "Шкаф с зеркальной раздвижной дверью.", cost: 2 },
                        { name: "Гардеробная ниша с подсветкой", desc: "Множество полок для экипировки и одежды.", cost: 3 }
                    ]
                },
                // Находка: Фонарик Гены
                {
                    id: "collectible_flashlight",
                    type: "collectible",
                    x: 55, y: 78, w: 4, h: 6,
                    itemName: "🔦 Старый фонарик",
                    toastMsg: "Найден старый батарейный фонарик! Светит тускло, но надежно."
                }
            ]
        },
        "kitchen": {
            title: "Убежище: Кухня",
            background: "room_kitchen.jpg",
            hotspots: [
                // Назад в Прихожую
                {
                    id: "portal_kitchen_to_main",
                    type: "portal",
                    x: 3, y: 40, w: 8, h: 45,
                    targetRoom: "main_room"
                },
                // Улучшение: Кухонный гарнитур
                {
                    id: "upgrade_kitchen_set",
                    type: "upgrade",
                    itemKey: "kitchen_set",
                    x: 40, y: 40, w: 35, h: 45,
                    title: "Кухонный уголок",
                    options: [
                        { name: "Советский кухонный стол", desc: "Пара ящиков для ложек и старая клеенка.", cost: 1 },
                        { name: "Современный модульный гарнитур", desc: "Удобные навесные шкафы и чистая раковина.", cost: 2 },
                        { name: "Профессиональный блок готовки", desc: "Электроплита, вытяжка и система очистки воды.", cost: 3 }
                    ]
                },
                // Находка: Тушенка
                {
                    id: "collectible_canned_food",
                    type: "collectible",
                    x: 82, y: 62, w: 5, h: 6,
                    itemName: "🥫 Банка тушенки",
                    toastMsg: "Найдена запылившаяся банка армейской тушенки. Завтрак обеспечен!"
                }
            ]
        },
        "pantry": {
            title: "Убежище: Кладовка",
            background: "room_pantry.jpg",
            hotspots: [
                // Назад в Прихожую
                {
                    id: "portal_pantry_to_main",
                    type: "portal",
                    x: 3, y: 40, w: 8, h: 45,
                    targetRoom: "main_room"
                },
                // Улучшение: Стеллажи припасов
                {
                    id: "upgrade_shelves",
                    type: "upgrade",
                    itemKey: "shelves",
                    x: 30, y: 25, w: 45, h: 65,
                    title: "Система хранения припасов",
                    options: [
                        { name: "Дощатые хлипкие полки", desc: "Простые деревянные перекрытия.", cost: 1 },
                        { name: "Стальные прочные стеллажи", desc: "Выдержат сотни килограмм тушенки и воды.", cost: 2 },
                        { name: "Герметичные оружейные боксы", desc: "Шкафы с климат-контролем против влаги.", cost: 3 }
                    ]
                },
                // Находка: Медный кабель
                {
                    id: "collectible_copper_wire",
                    type: "collectible",
                    x: 85, y: 75, w: 4, h: 6,
                    itemName: "🔌 Медный кабель",
                    toastMsg: "Найден медный кабель! Медь пригодится для заземления генератора."
                }
            ]
        },
        "bathroom": {
            title: "Убежище: Ванная комната",
            background: "room_bathroom.jpg",
            hotspots: [
                // Назад в Прихожую
                {
                    id: "portal_bathroom_to_main",
                    type: "portal",
                    x: 3, y: 40, w: 8, h: 45,
                    targetRoom: "main_room"
                },
                // Улучшение: Сантехника Гены
                {
                    id: "upgrade_plumbing",
                    type: "upgrade",
                    itemKey: "plumbing",
                    x: 35, y: 45, w: 30, h: 45,
                    title: "Сантехника и водоснабжение",
                    options: [
                        { name: "Простая раковина", desc: "Вода течет ржавая, но умыться можно.", cost: 1 },
                        { name: "Чугунная отмытая ванна", desc: "Вода нагревается через бойлер.", cost: 2 },
                        { name: "Душевая кабина с фильтром", desc: "Автономный замкнутый цикл очистки воды.", cost: 3 }
                    ]
                },
                // Находка: Стерильный бинт
                {
                    id: "collectible_medkit",
                    type: "collectible",
                    x: 75, y: 55, w: 5, h: 6,
                    itemName: "🩹 Стерильный бинт",
                    toastMsg: "Найден чистый стерильный бинт. Отличный перевязочный материал."
                }
            ]
        },
        "workshop": {
            title: "Мастерская: Оружейный бокс Гены",
            background: "room_workshop.jpg",
            hotspots: [
                // Назад в Прихожую (подъем наверх)
                {
                    id: "portal_workshop_to_main",
                    type: "portal",
                    x: 45, y: 5, w: 10, h: 15,
                    targetRoom: "main_room"
                },
                // Улучшение: Верстак
                {
                    id: "upgrade_workbench",
                    type: "upgrade",
                    itemKey: "workbench",
                    x: 10, y: 50, w: 30, h: 40,
                    title: "Слесарный верстак",
                    options: [
                        { name: "Деревянный стол с тисками", desc: "Удобен для мелкого ручного ремонта.", cost: 1 },
                        { name: "Тяжелый стальной верстак", desc: "Выдержит сверлильный станок и тяжелые детали.", cost: 2 },
                        { name: "Электронная сборочная станция", desc: "Для работы с точной механикой и оптикой.", cost: 3 }
                    ]
                },
                // Улучшение: Станок для патронов
                {
                    id: "upgrade_ammo_press",
                    type: "upgrade",
                    itemKey: "ammo_press",
                    x: 65, y: 40, w: 25, h: 50,
                    title: "Патронный пресс",
                    options: [
                        { name: "Ручной пресс Lee Precision", desc: "Качественная, но медленная ручная сборка патронов.", cost: 1 },
                        { name: "Полуавтоматический прогрессивный станок", desc: "Снаряжает до 100 патронов в час.", cost: 2 },
                        { name: "Электронная станция дозирования пороха", desc: "Высочайшая точность навески для снайперских выстрелов.", cost: 3 }
                    ]
                },
                // Находка: Оружейное масло
                {
                    id: "collectible_oil",
                    type: "collectible",
                    x: 47, y: 72, w: 4, h: 6,
                    itemName: "🛢️ Оружейное масло",
                    toastMsg: "Найдена масленка с нейтральным маслом для смазки затворов."
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
