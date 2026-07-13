// ================================================
// meta.js (РАЗДЕЛЕННЫЙ РЕМОНТ И СЮЖЕТ)
// Движок обустройства Убежища и покупки сюжета
// ================================================

(function() {
    const DEFAULT_DECOR_NAMES = {
        floor: "Гнилые доски",
        walls: "Осыпающаяся штукатурка",
        bed: "Пыльный матрас",
        table: "Шатающийся верстак",
        cabinet: "Сломанный комод",
        windows: "Забиты фанерой"
    };

    // 1. СПИСОК СЮЖЕТНЫХ ГЛАВ КНИГИ (Покупаются за звезды в меню "Сюжет")
    const storyChapters = [
        { 
            id: "story_prologue", 
            title: "📖 Пролог: Охота на измененного и штурм КПП", 
            cost: 1, 
            dialog: "story_prologue" 
        },
        { 
            id: "story_chapter1", 
            title: "📖 Глава 1: Пир в Зажопинске и страшное убийство", 
            cost: 2, 
            dialog: "story_chapter1" 
        },
        { 
            id: "story_chapter2", 
            title: "📖 Глава 2: Спасение брата и горькая правда", 
            cost: 2, 
            dialog: "story_chapter2" 
        }
    ];

    // 2. СПИСОК ЗАДАЧ ПО РЕМОНТУ И СТРОИТЕЛЬСТВУ (Меню "Ремонт")
    const hideoutTasks = [
        { 
            id: "floor", 
            title: "🪵 Отремонтировать гнилой пол в жилом блоке", 
            cost: 1, 
            dialog: "task_floor", 
            targetKey: "floor", 
            newValue: "🪵 Крепкий дубовый паркет"
        },
        { 
            id: "walls", 
            title: "🧱 Укрепить осыпающиеся бетонные стены", 
            cost: 1, 
            dialog: "task_walls", 
            targetKey: "walls", 
            newValue: "🧱 Бронированные стены"
        },
        { 
            id: "bed", 
            title: "🛏️ Заменить старый матрас на армейскую койку", 
            cost: 1, 
            dialog: "task_bed", 
            targetKey: "bed", 
            newValue: "🛏️ Надежная армейская койка"
        },
        { 
            id: "table", 
            title: "🛠️ Собрать тяжелый стальной верстак браконьера", 
            cost: 1, 
            dialog: "task_table", 
            targetKey: "table", 
            newValue: "🛠️ Стальной верстак браконьера"
        },
        { 
            id: "cabinet", 
            title: "🚪 Переделать шкаф под сейф для патронов", 
            cost: 2, 
            dialog: "task_cabinet", 
            targetKey: "cabinet", 
            newValue: "🚪 Стальной сейф-шкаф"
        },
        { 
            id: "windows", 
            title: "🪟 Установить бронированные ставни от вурдалаков", 
            cost: 2, 
            dialog: "task_windows", 
            targetKey: "windows", 
            newValue: "🪟 Бронированные ставни"
        }
    ];

    // Элементы разметки
    const overlayTasks = document.getElementById('overlayTasks');
    const overlayStory = document.getElementById('overlayStory');
    const tasksListContainer = document.getElementById('tasksListContainer');
    const storyListContainer = document.getElementById('storyListContainer');

    const btnOpenTasks = document.getElementById('btnOpenTasks');
    const btnCloseTasks = document.getElementById('btnCloseTasks');
    const btnOpenStory = document.getElementById('btnOpenStory');
    const btnCloseStory = document.getElementById('btnCloseStory');

    // 3. ОТРИСОВКА СПИСКА СТРОИТЕЛЬНЫХ ЗАДАЧ
    function renderTasksList() {
        if (!tasksListContainer) return;
        tasksListContainer.innerHTML = "";

        hideoutTasks.forEach(task => {
            const isCompleted = window.GameState ? window.GameState.isTaskCompleted(task.id) : false;

            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';

            let buttonContent = "";
            if (isCompleted) {
                buttonContent = `<span style="color: var(--toxic); font-weight: 800; font-size: 12px;">Выполнено ✔</span>`;
            } else {
                buttonContent = `<button class="task-btn" data-task-id="${task.id}">⭐ ${task.cost}</button>`;
            }

            taskEl.innerHTML = `
                <div class="task-info">
                  <div class="task-title">${task.title}</div>
                </div>
                <div class="task-action-box">${buttonContent}</div>
            `;
            tasksListContainer.appendChild(taskEl);
        });

        const actionButtons = tasksListContainer.querySelectorAll('.task-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.getAttribute('data-task-id');
                executeUpgrade(taskId);
            });
        });
    }

    // ВЫПОЛНЕНИЕ РЕМОНТА
    function executeUpgrade(taskId) {
        const task = hideoutTasks.find(t => t.id === taskId);
        if (!task) return;

        if (window.GameState && window.GameState.spendStars(task.cost)) {
            window.GameState.completeTask(task.id);
            window.GameState.updateDecorItem(task.targetKey, task.newValue);

            if (overlayTasks) overlayTasks.classList.add('hidden');

            const storyDialog = window.gameDialogs ? window.gameDialogs[task.dialog] : null;
            if (window.NovelEngine && storyDialog) {
                window.NovelEngine.run(storyDialog, () => {
                    showToast("Убежище отремонтировано!");
                    renderTasksList();
                });
            } else {
                showToast("Убежище отремонтировано!");
                renderTasksList();
            }
        } else {
            showToast("Недостаточно звезд! Пройдите уровень на охоте.");
        }
    }

    // 4. ОТРИСОВКА СПИСКА СЮЖЕТНЫХ ГЛАВ КНИГИ
    function renderStoryList() {
        if (!storyListContainer) return;
        storyListContainer.innerHTML = "";

        storyChapters.forEach(chapter => {
            const isCompleted = window.GameState ? window.GameState.isTaskCompleted(chapter.id) : false;

            const chapterEl = document.createElement('div');
            chapterEl.className = 'task-item';

            let buttonContent = "";
            if (isCompleted) {
                buttonContent = `<button class="task-btn" style="background:var(--sky);" data-story-id="${chapter.id}">Читать 📖</button>`;
            } else {
                buttonContent = `<button class="task-btn" data-story-id="${chapter.id}">⭐ ${chapter.cost}</button>`;
            }

            chapterEl.innerHTML = `
                <div class="task-info">
                  <div class="task-title" style="font-weight: 800;">${chapter.title}</div>
                </div>
                <div class="task-action-box">${buttonContent}</div>
            `;
            storyListContainer.appendChild(chapterEl);
        });

        const actionButtons = storyListContainer.querySelectorAll('.task-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const storyId = e.currentTarget.getAttribute('data-story-id');
                executeStoryBuy(storyId);
            });
        });
    }

    // ПОКУПКА / ЧТЕНИЕ ГЛАВЫ
    function executeStoryBuy(storyId) {
        const chapter = storyChapters.find(c => c.id === storyId);
        if (!chapter) return;

        const isAlreadyBought = window.GameState ? window.GameState.isTaskCompleted(chapter.id) : false;

        if (isAlreadyBought) {
            // Если глава уже куплена — читаем её бесплатно!
            if (overlayStory) overlayStory.classList.add('hidden');
            const storyDialog = window.gameDialogs ? window.gameDialogs[chapter.dialog] : null;
            if (window.NovelEngine && storyDialog) {
                window.NovelEngine.run(storyDialog, () => {
                    renderStoryList();
                });
            }
        } else {
            // Если еще не куплена — покупаем за звезды
            if (window.GameState && window.GameState.spendStars(chapter.cost)) {
                window.GameState.completeTask(chapter.id);
                if (overlayStory) overlayStory.classList.add('hidden');

                const storyDialog = window.gameDialogs ? window.gameDialogs[chapter.dialog] : null;
                if (window.NovelEngine && storyDialog) {
                    window.NovelEngine.run(storyDialog, () => {
                        showToast("Глава разблокирована!");
                        renderStoryList();
                    });
                } else {
                    showToast("Глава разблокирована!");
                    renderStoryList();
                }
            } else {
                showToast("Недостаточно звезд! Пройдите уровень на охоте.");
            }
        }
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 1500);
        }
    }

    // Слушатели кнопок
    if (btnOpenTasks) {
        btnOpenTasks.addEventListener('click', () => {
            renderTasksList();
            if (overlayTasks) overlayTasks.classList.remove('hidden');
        });
    }
    if (btnCloseTasks) {
        btnCloseTasks.addEventListener('click', () => {
            if (overlayTasks) overlayTasks.classList.add('hidden');
        });
    }

    if (btnOpenStory) {
        btnOpenStory.addEventListener('click', () => {
            renderStoryList();
            if (overlayStory) overlayStory.classList.remove('hidden');
        });
    }
    if (btnCloseStory) {
        btnCloseStory.addEventListener('click', () => {
            if (overlayStory) overlayStory.classList.add('hidden');
        });
    }

    window.HideoutUpgradeEngine = {
        render: renderTasksList,
        tasks: hideoutTasks
    };

    console.log("meta.js: Квартира и Книга Сюжетов успешно разделены!");
})();
