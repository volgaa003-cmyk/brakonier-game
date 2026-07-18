// ================================================
// meta.js (ИНТЕРАКТИВНЫЙ Point-and-Click ДВИЖОК КВАРТИРЫ)
// ================================================

(function() {
// 1. БАЗА ДАННЫХ 8 КОМНАТ КВАРТИРЫ И ИХ ВЗАИМОСВЯЗЕЙ
    const ROOMS_DATABASE = {
        "corridor": {
            title: "Прихожая-коридор квартиры",
            background: "room_corridor.jpg",
            hotspots: [
                // Из коридора -> на Кухню
                { id: "portal_cor_to_kitchen", type: "portal", x: 8, y: 35, w: 9, h: 48, targetRoom: "kitchen" },
                // Из коридора -> в Гостиную
                { id: "portal_cor_to_living", type: "portal", x: 24, y: 35, w: 9, h: 48, targetRoom: "living_room" },
                // Из коридора -> в Туалет
                { id: "portal_cor_to_toilet", type: "portal", x: 42, y: 35, w: 9, h: 48, targetRoom: "toilet" },
                // Из коридора -> в Ванную
                { id: "portal_cor_to_bathroom", type: "portal", x: 58, y: 35, w: 9, h: 48, targetRoom: "bathroom" },
                // Из коридора -> в Кладовую
                { id: "portal_cor_to_pantry", type: "portal", x: 76, y: 35, w: 9, h: 48, targetRoom: "pantry" },
                // Улучшение: Входная дверь в подъезд
                {
                    id: "upgrade_entrance_door",
                    type: "upgrade",
                    itemKey: "entrance_door",
                    x: 90, y: 22, w: 8, h: 60,
                    title: "Входная дверь в подъезд",
                    options: [
                        { name: "Деревянная дверь", desc: "Хлипкое полотно с простым замком.", cost: 1 },
                        { name: "Стальная сейфовая дверь", desc: "Толстая сталь и два надежных замка.", cost: 2 },
                        { name: "Бронированный гермозатвор", desc: "Герметичная дверь высшего класса защиты.", cost: 3 }
                    ]
                },
                // Находка: Карта окрестностей
                {
                    id: "collectible_map",
                    type: "collectible",
                    x: 35, y: 70, w: 5, h: 6,
                    itemName: "🗺️ Схема крепости",
                    toastMsg: "Найдена запылившаяся схема крепости! На ней отмечен мукомольный завод."
                }
            ]
        },
        "kitchen": {
            title: "Кухня Гены",
            background: "room_kitchen.jpg",
            hotspots: [
                // Из кухни -> в Коридор
                { id: "portal_kit_to_corridor", type: "portal", x: 5, y: 40, w: 8, h: 45, targetRoom: "corridor" },
                // Из кухни -> в Гостиную
                { id: "portal_kit_to_living", type: "portal", x: 87, y: 40, w: 8, h: 45, targetRoom: "living_room" },
                // Улучшение: Кухонный гарнитур
                {
                    id: "upgrade_kitchen_set",
                    type: "upgrade",
                    itemKey: "kitchen_set",
                    x: 35, y: 40, w: 35, h: 45,
                    title: "Кухонный гарнитур",
                    options: [
                        { name: "Советский кухонный стол", desc: "Стол с выдвижным ящиком и клеенкой.", cost: 1 },
                        { name: "Современный кухонный шкаф", desc: "Вместительный шкаф с чистой мойкой.", cost: 2 },
                        { name: "Плита и фильтры очистки", desc: "Электроплита и автономный фильтр питьевой воды.", cost: 3 }
                    ]
                },
                // Находка: Тушенка
                {
                    id: "collectible_canned_food",
                    type: "collectible",
                    x: 75, y: 65, w: 4, h: 6,
                    itemName: "🥫 Банка тушенки",
                    toastMsg: "Найдена банка консервированной армейской тушенки!"
                }
            ]
        },
        "living_room": {
            title: "Гостиная Гены",
            background: "room_living_room.jpg",
            hotspots: [
                // Из гостиной -> в Коридор
                { id: "portal_liv_to_corridor", type: "portal", x: 5, y: 40, w: 8, h: 45, targetRoom: "corridor" },
                // Из гостиной -> на Кухню
                { id: "portal_liv_to_kitchen", type: "portal", x: 45, y: 40, w: 8, h: 45, targetRoom: "kitchen" },
                // Из гостиной -> в Спальню
                { id: "portal_liv_to_bedroom", type: "portal", x: 87, y: 40, w: 8, h: 45, targetRoom: "bedroom" },
                // Улучшение: Диван
                {
                    id: "upgrade_sofa",
                    type: "upgrade",
                    itemKey: "sofa",
                    x: 18, y: 55, w: 22, h: 32,
                    title: "Мягкий диван",
                    options: [
                        { name: "Простой чистый диван", desc: "Обычный диван из Икеи, без дыр.", cost: 1 },
                        { name: "Кожаный солидный диван", desc: "Крепкая кожаная обивка, легко мыть.", cost: 2 },
                        { name: "Угловой тактический диван", desc: "Огромное спальное место со скрытым ящиком.", cost: 3 }
                    ]
                },
                // Находка: Серебряный кабель
                {
                    id: "collectible_silver",
                    type: "collectible",
                    x: 60, y: 78, w: 5, h: 6,
                    itemName: "🥈 Серебряный кабель",
                    toastMsg: "Найден моток серебряного провода! Отлично плавится в пули."
                }
            ]
        },
        "bedroom": {
            title: "Спальня Гены",
            background: "room_bedroom.jpg",
            hotspots: [
                // Из спальни -> в Гостиную
                { id: "portal_bed_to_living", type: "portal", x: 5, y: 40, w: 8, h: 45, targetRoom: "living_room" },
                // Из спальни -> в Мастерскую
                { id: "portal_bed_to_workshop", type: "portal", x: 87, y: 40, w: 8, h: 45, targetRoom: "workshop" },
                // Улучшение: Кровать
                {
                    id: "upgrade_bed",
                    type: "upgrade",
                    itemKey: "bed",
                    x: 20, y: 50, w: 22, h: 35,
                    title: "Удобная кровать",
                    options: [
                        { name: "Раскладушка на раме", desc: "Алюминиевый каркас, жестко но спать можно.", cost: 1 },
                        { name: "Крепкая дубовая кровать", desc: "Большое спальное место с мягким матрасом.", cost: 2 },
                        { name: "Капсульный спальный бокс", desc: "Герметичная капсула сна с климат-контролем.", cost: 3 }
                    ]
                },
                // Улучшение: Шкаф
                {
                    id: "upgrade_wardrobe",
                    type: "upgrade",
                    itemKey: "wardrobe",
                    x: 50, y: 25, w: 15, h: 60,
                    title: "Шкаф для одежды",
                    options: [
                        { name: "Обычный платяной шкаф", desc: "Простой шкаф с парой створок.", cost: 1 },
                        { name: "Большой шкаф-купе", desc: "Вместительный шкаф с раздвижными зеркалами.", cost: 2 },
                        { name: "Гардеробная ниша под снаряжение", desc: "Все вешалки и полки подсвечены неоном.", cost: 3 }
                    ]
                },
                // Находка: Старый Фонарик
                {
                    id: "collectible_flashlight",
                    type: "collectible",
                    x: 40, y: 78, w: 4, h: 6,
                    itemName: "🔦 Старый фонарик",
                    toastMsg: "Найден тяжелый металлический фонарик."
                }
            ]
        },
        "workshop": {
            title: "Оружейная мастерская",
            background: "room_workshop.jpg",
            hotspots: [
                // Из мастерской -> в Спальню
                { id: "portal_wrk_to_bedroom", type: "portal", x: 5, y: 40, w: 8, h: 45, targetRoom: "bedroom" },
                // Из мастерской -> в Кладовую
                { id: "portal_wrk_to_pantry", type: "portal", x: 87, y: 40, w: 8, h: 45, targetRoom: "pantry" },
                // Улучшение: Верстак
                {
                    id: "upgrade_workbench",
                    type: "upgrade",
                    itemKey: "workbench",
                    x: 15, y: 50, w: 25, h: 40,
                    title: "Слесарный верстак",
                    options: [
                        { name: "Деревянный стол с тисками", desc: "Крепкая столешница для ручного ремонта.", cost: 1 },
                        { name: "Тяжелый металлический верстак", desc: "Стальной каркас выдержит сверлильный станок.", cost: 2 },
                        { name: "Цифровая рабочая станция", desc: "Для ремонта электроники, оптики и точной механики.", cost: 3 }
                    ]
                },
                // Улучшение: Станок для патронов
                {
                    id: "upgrade_ammo_press",
                    type: "upgrade",
                    itemKey: "ammo_press",
                    x: 50, y: 40, w: 22, h: 45,
                    title: "Патронный пресс",
                    options: [
                        { name: "Ручной пресс для гильз", desc: "Качественная, но долгая сборка патронов вручную.", cost: 1 },
                        { name: "Автоматический патронный станок", desc: "Калибрует, засыпает порох и ставит пулю сам.", cost: 2 },
                        { name: "Высокоточная патронная станция", desc: "Электронный дозатор веса снайперской навески.", cost: 3 }
                    ]
                },
                // Находка: Оружейное Масло
                {
                    id: "collectible_oil",
                    type: "collectible",
                    x: 42, y: 72, w: 4, h: 6,
                    itemName: "🛢️ Оружейное масло",
                    toastMsg: "Найдена масленка с нейтральным маслом для чистки винтовок."
                }
            ]
        },
        "pantry": {
            title: "Кладовая припасов",
            background: "room_pantry.jpg",
            hotspots: [
                // Из кладовой -> в Коридор
                { id: "portal_pan_to_corridor", type: "portal", x: 5, y: 40, w: 8, h: 45, targetRoom: "corridor" },
                // Из кладовой -> в Мастерскую
                { id: "portal_pan_to_workshop", type: "portal", x: 87, y: 40, w: 8, h: 45, targetRoom: "workshop" },
                // Улучшение: Стеллажи припасов
                {
                    id: "upgrade_shelves",
                    type: "upgrade",
                    itemKey: "shelves",
                    x: 25, y: 25, w: 45, h: 65,
                    title: "Система стеллажей",
                    options: [
                        { name: "Простые деревянные полки", desc: "Обычные хвойные доски под грузы.", cost: 1 },
                        { name: "Стальные прочные стеллажи", desc: "Железный каркас под тяжелые консервы.", cost: 2 },
                        { name: "Запираемые герметичные ящики", desc: "Влагостойкие шкафы с кодовыми замками.", cost: 3 }
                    ]
                },
                // Находка: Медный Кабель
                {
                    id: "collectible_copper_wire",
                    type: "collectible",
                    x: 80, y: 75, w: 4, h: 6,
                    itemName: "🔌 Медный кабель",
                    toastMsg: "Найден отрезок толстого медного провода."
                }
            ]
        },
        "toilet": {
            title: "Санузел (Туалет)",
            background: "room_toilet.jpg",
            hotspots: [
                // Из туалета -> назад в Коридор
                { id: "portal_toi_to_corridor", type: "portal", x: 5, y: 40, w: 8, h: 45, targetRoom: "corridor" },
                // Улучшение: Сантехнический узел
                {
                    id: "upgrade_toilet_plumbing",
                    type: "upgrade",
                    itemKey: "toilet_plumbing",
                    x: 35, y: 35, w: 30, h: 55,
                    title: "Санитарный узел",
                    options: [
                        { name: "Простой унитаз", desc: "Подключен к общей трубе, вода течет слабо.", cost: 1 },
                        { name: "Автономный биотуалет с баком", desc: "Работает чисто, не зависит от городской сети.", cost: 2 },
                        { name: "Био-очистная тактическая кабина", desc: "Полное расщепление отходов, датчики запаха.", cost: 3 }
                    ]
                },
                // Находка: Чистая Ветошь
                {
                    id: "collectible_rags",
                    type: "collectible",
                    x: 75, y: 65, w: 5, h: 6,
                    itemName: "🧻 Чистая ветошь",
                    toastMsg: "Найдена упаковка чистых хлопковых тряпок. Пойдет на чистку стволов."
                }
            ]
        },
        "bathroom": {
            title: "Ванная комната Гены",
            background: "room_bathroom.jpg",
            hotspots: [
                // Из ванной -> назад в Коридор
                { id: "portal_bat_to_corridor", type: "portal", x: 5, y: 40, w: 8, h: 45, targetRoom: "corridor" },
                // Улучшение: Ванна и душ
                {
                    id: "upgrade_shower",
                    type: "upgrade",
                    itemKey: "shower",
                    x: 30, y: 45, w: 40, h: 45,
                    title: "Душ и нагрев воды",
                    options: [
                        { name: "Электрический проточный бойлер", desc: "Быстро нагреет воду для умывания.", cost: 1 },
                        { name: "Ванна с баком-накопителем", desc: "Удобно хранить запас чистой горячей воды.", cost: 2 },
                        { name: "Душевой бокс с замкнутым фильтром", desc: "Очищает мыльную воду до питьевой для повторного мытья.", cost: 3 }
                    ]
                },
                // Находка: Бинт
                {
                    id: "collectible_medkit",
                    type: "collectible",
                    x: 80, y: 55, w: 5, h: 6,
                    itemName: "🩹 Стерильный бинт",
                    toastMsg: "Найден чистый бинт в герметичной упаковке."
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
    // ================================================
    // ЛОГИКА ПАНОРАМИРОВАНИЯ (КАТАНИЯ) КВАРТИРЫ ПАЛЬЦЕМ
    // ================================================
    document.addEventListener("DOMContentLoaded", () => {
        const viewport = document.getElementById('hideoutViewport');
        const content = document.getElementById('roomContent');
        const hotspots = document.getElementById('hotspotsContainer');
        if (!viewport || !content) return;

        let isDragging = false;
        let startX = 0;
        let startLeft = 0;
        let dragDistance = 0; // Дистанция сдвига, чтобы отличать клик от таскания

        viewport.addEventListener('mousedown', dragStart);
        viewport.addEventListener('touchstart', dragStart, { passive: true });

        function dragStart(e) {
            isDragging = true;
            dragDistance = 0;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            startX = clientX;
            startLeft = content.offsetLeft;
            
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
        }

        function dragMove(e) {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const dx = clientX - startX;
            dragDistance = Math.abs(dx);

            // Блокируем дефолтный скролл страницы на телефонах
            if (e.cancelable) e.preventDefault();

            let targetLeft = startLeft + dx;

            // Рассчитываем ограничения (чтобы не утащить за края картинки)
            const maxLeft = 0;
            const minLeft = viewport.offsetWidth - content.offsetWidth;

            if (targetLeft > maxLeft) targetLeft = maxLeft;
            if (targetLeft < minLeft) targetLeft = minLeft;

            content.style.left = targetLeft + 'px';
        }

        function dragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        }

        // Защита: блокируем срабатывание кнопок и порталов, если пользователь просто тащил экран
        if (hotspots) {
            hotspots.addEventListener('click', (e) => {
                if (dragDistance > 8) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, true); // true включает перехват на ранней стадии
        }
    });
})();
