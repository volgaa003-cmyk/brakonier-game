// ================================================
// meta.js (С СЮЖЕТНЫМИ ГЛАВАМИ ЗА ЗВЕЗДЫ)
// Движок обустройства Убежища и покупки сюжета
// ================================================

(function() {
    // ПОЛНАЯ БАЗА ДАННЫХ ЗАДАЧ (Сюжетные главы + Ремонт мебели)
    const hideoutTasks = [
        // Сюжетные главы (Покупка истории за звезды)
        { 
            id: "story_prologue", 
            title: "📖 Читать Пролог: Поездка к кочегарке Митрича", 
            cost: 1, 
            dialog: "1", // ID диалога Пролога из dialogs.js
            isStory: true 
        },
        
        // Ремонт комнат (Покупка мебели за звезды)
        { 
            id: "floor", 
            title: "🛠️ Отремонтировать гнилой пол в жилом блоке", 
            cost: 1, 
            dialog: "task_floor", 
            targetKey: "floor", 
            newValue: "杜 дубовый паркет",
            isStory: false
        },
        { 
            id: "walls", 
            title: "🧱 Укрепить стены стальными листами", 
            cost: 1, 
            dialog: "task_walls", 
            targetKey: "walls", 
            newValue: "🧱 Бронированные стены",
            isStory: false
        },
        { 
            id: "bed", 
            title: "🛏️ Заменить старый матрас на армейскую койку", 
            cost: 1, 
            dialog: "task_bed", 
            targetKey: "bed", 
            newValue: "🛏️ Надежная армейская койка",
            isStory: false
        },
        { 
            id: "table", 
            title: "🛠️ Поставить тяжелый стальной верстак", 
            cost: 1, 
            dialog: "task_table", 
            targetKey: "table", 
            newValue: "🛠️ Стальной верстак браконьера",
            isStory: false
        },
        { 
            id: "cabinet", 
            title: "🚪 Переделать шкаф в оружейный сейф", 
            cost: 2, 
            dialog: "task_cabinet", 
            targetKey: "cabinet", 
            newValue: "🚪 Стальной сейф-шкаф",
            isStory: false
        },
        { 
            id: "windows", 
            title: "🪟 Установить бронированные ставни на окна", 
            cost: 2, 
            dialog: "task_windows", 
            targetKey: "windows", 
            newValue: "🪟 Бронированные ставни",
            isStory: false
        }
    ];

    const overlayTasks = document.getElementById('overlayTasks');
    const tasksListContainer = document.getElementById('tasksListContainer');
    const btnOpenTasks = document.getElementById('btnOpenTasks');
    const btnCloseTasks = document.getElementById('btnCloseTasks');

    // ОТРИСОВКА СПИСКА ЗАДАНИЙ В МЕНЮ
    function renderTasksList() {
        if (!tasksListContainer) return;
        
        tasksListContainer.innerHTML = "";

        hideoutTasks.forEach(task => {
            // Проверяем, выполнена ли задача через GameState
            const isCompleted = window.GameState ? window.GameState.isTaskCompleted(task.id) : false;

            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';

            let buttonContent = "";
            if (isCompleted) {
                buttonContent = `<span style="color: var(--toxic); font-weight: 800; font-size: 13px;">Куплено ✔</span>`;
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

        // Слушатели на кнопки покупки
        const actionButtons = tasksListContainer.querySelectorAll('.task-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.getAttribute('data-task-id');
                executeTask(taskId);
            });
        });
    }

    // ПРОЦЕСС ВЫПОЛНЕНИЯ ЗАДАНИЯ
    function executeTask(taskId) {
        const task = hideoutTasks.find(t => t.id === taskId);
        if (!task) return;

        // Списываем звезды
        if (window.GameState && window.GameState.spendStars(task.cost)) {
            
            // Записываем задачу как выполненную
            window.GameState.completeTask(task.id);

            // Если это ремонт мебели — обновляем ее вид в Убежище
            if (!task.isStory && task.targetKey && task.newValue) {
                window.GameState.updateDecorItem(task.targetKey, task.newValue);
            }

            // Закрываем оверлей списка задач
            if (overlayTasks) {
                overlayTasks.classList.add('hidden');
            }

            // Запускаем сюжетный диалог (Новеллу Клуба Романтики)
            const storyDialog = window.gameDialogs ? window.gameDialogs[task.dialog] : null;
            
            if (window.NovelEngine && storyDialog) {
                window.NovelEngine.run(storyDialog, () => {
                    showToast("Успешно!");
                    renderTasksList();
                    if (window.showScreen) window.showScreen('screenHideout');
                });
            } else {
                showToast("Успешно!");
                renderTasksList();
                if (window.showScreen) window.showScreen('screenHideout');
            }
        } else {
            showToast("Недостаточно звезд! Пройдите уровень на КПП.");
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

    if (btnOpenTasks) {
        btnOpenTasks.addEventListener('click', () => {
            renderTasksList();
            if (overlayTasks) {
                overlayTasks.classList.remove('hidden');
            }
        });
    }

    if (btnCloseTasks) {
        btnCloseTasks.addEventListener('click', () => {
            if (overlayTasks) {
                overlayTasks.classList.add('hidden');
            }
        });
    }

    window.HideoutUpgradeEngine = {
        render: renderTasksList,
        tasks: hideoutTasks
    };

    console.log("meta.js: Сюжетные главы за звезды успешно подключены!");
})();
