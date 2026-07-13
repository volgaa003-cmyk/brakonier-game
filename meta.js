// ================================================
// meta.js
// Движок обустройства Убежища и менеджер заданий
// ================================================

(function() {
    // 1. ДЕФОЛТНЫЕ СТАРТОВЫЕ НАЗВАНИЯ ПРЕДМЕТОВ (Нужны для проверки выполнения задач)
    const DEFAULT_DECOR_NAMES = {
        floor: "Гнилые доски",
        walls: "Осыпающаяся штукатурка",
        bed: "Пыльный матрас",
        table: "Шатающийся верстак",
        cabinet: "Сломанный комод",
        windows: "Забиты фанерой"
    };

    // 2. ПОЛНАЯ БАЗА ДАННЫХ ЗАДАНИЙ ПО РЕМОНТУ (Все зоны, которые ты просил)
    const hideoutTasks = [
        { 
            id: "floor", 
            title: "Заменить гнилой деревянный пол на прочный дубовый паркет", 
            cost: 1, 
            dialog: "task_floor", 
            targetKey: "floor", 
            newValue: "🪵 Крепкий дубовый паркет" 
        },
        { 
            id: "walls", 
            title: "Укрепить осыпающиеся стены стальными листами и бетоном", 
            cost: 1, 
            dialog: "task_walls", 
            targetKey: "walls", 
            newValue: "🧱 Бронированные стены" 
        },
        { 
            id: "bed", 
            title: "Собрать удобную армейскую койку вместо старого матраса", 
            cost: 1, 
            dialog: "task_bed", 
            targetKey: "bed", 
            newValue: "🛏️ Надежная армейская койка" 
        },
        { 
            id: "table", 
            title: "Заменить шатающийся стол на тяжелый стальной верстак", 
            cost: 1, 
            dialog: "task_table", 
            targetKey: "table", 
            newValue: "🛠️ Стальной верстак браконьера" 
        },
        { 
            id: "cabinet", 
            title: "Починить старый шкаф и превратить его в сейф для патронов", 
            cost: 2, 
            dialog: "task_cabinet", 
            targetKey: "cabinet", 
            newValue: "🚪 Стальной сейф-оружейный шкаф" 
        },
        { 
            id: "windows", 
            title: "Установить на окна тяжелые бронированные ставни от вурдалаков", 
            cost: 2, 
            dialog: "task_windows", 
            targetKey: "windows", 
            newValue: "🪟 Бронированные ставни" 
        }
    ];

    // Находим элементы на странице
    const overlayTasks = document.getElementById('overlayTasks');
    const tasksListContainer = document.getElementById('tasksListContainer');
    const btnOpenTasks = document.getElementById('btnOpenTasks');
    const btnCloseTasks = document.getElementById('btnCloseTasks');

    // 3. ОТРИСОВКА СПИСКА ЗАДАНИЙ В МЕНЮ
    function renderTasksList() {
        if (!tasksListContainer) return;
        
        // Очищаем прошлый список перед новой отрисовкой
        tasksListContainer.innerHTML = "";

        hideoutTasks.forEach(task => {
            // Проверяем статус выполнения: если текст мебели в GameState НЕ равен дефолтному — значит ремонт выполнен!
            const currentDecorValue = window.GameState ? window.GameState.getDecor(task.targetKey) : "";
            const isCompleted = currentDecorValue !== DEFAULT_DECOR_NAMES[task.targetKey];

            // Создаем визуальную карточку для каждого дела
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';

            let buttonContent = "";
            if (isCompleted) {
                // Если задание уже выполнено
                buttonContent = `<span style="color: var(--toxic); font-weight: 800; font-size: 13px;">Выполнено ✔</span>`;
            } else {
                // Если задание доступно для выполнения
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

        // Навешиваем слушатели событий на все кнопки покупки
        const actionButtons = tasksListContainer.querySelectorAll('.task-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.getAttribute('data-task-id');
                executeTask(taskId);
            });
        });
    }

    // 4. ПРОЦЕСС ВЫПОЛНЕНИЯ ЗАДАНИЯ (ТРАТА ЗВЕЗД И РЕМОНТ)
    function executeTask(taskId) {
        const task = hideoutTasks.find(t => t.id === taskId);
        if (!task) return;

        // Пытаемся списать звезды через GameState
        if (window.GameState && window.GameState.spendStars(task.cost)) {
            // Успешно списано! Обновляем предмет интерьера
            window.GameState.updateDecorItem(task.targetKey, task.newValue);

            // Закрываем оверлей списка задач
            if (overlayTasks) {
                overlayTasks.classList.add('hidden');
            }

            // Пытаемся запустить связанную сюжетную сцену через движок новеллы
            const storyDialog = window.gameDialogs ? window.gameDialogs[task.dialog] : null;
            
            if (window.NovelEngine && storyDialog) {
                // Запускаем сюжетный диалог, после которого обновляем экран
                window.NovelEngine.run(storyDialog, () => {
                    showToast("Обустройство завершено!");
                    renderTasksList();
                });
            } else {
                // Если диалога нет (или файл dialogs.js не подгрузился) — просто пишем тост
                showToast("Убежище улучшено!");
                renderTasksList();
            }
        } else {
            // Если звезд не хватило
            showToast("Недостаточно звезд! Сделайте вылазку на КПП.");
        }
    }

    // Вспомогательный всплывающий тост для предупреждений
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 1500);
        }
    }

    // 5. НАСТРОЙКА КНОПОК ОТКРЫТИЯ/ЗАКРЫТИЯ МЕНЮ ЗАДАЧ
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

    // Экспортируем модуль ремонта глобально для использования при старте игры
    window.HideoutUpgradeEngine = {
        render: renderTasksList,
        tasks: hideoutTasks
    };

    console.log("meta.js: Модуль ремонта Убежища успешно подключен!");
})();
