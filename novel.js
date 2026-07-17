// ================================================
// novel.js (ИСПРАВЛЕННЫЙ, ИНТЕРАКТИВНЫЙ И СТАБИЛЬНЫЙ)
// ================================================

(function() {
    // Внутреннее состояние движка новеллы
    let activeStoryData = null;     // Данные текущей истории (массив или граф)
    let currentSceneId = null;      // ID текущей сцены (для графа)
    let currentSlideIndex = 0;      // Номер текущего слайда внутри сцены или линейного массива
    let onEndCallback = null;       // Функция обратного вызова после завершения новеллы
    
    let isTyping = false;           // Идет ли анимация печати текста
    let typingTimeoutId = null;     // ID таймера печатной машинки
    let currentText = "";           // Полный текст текущей строки

    // HTML-элементы
    const overlayDialogue = document.getElementById('overlayDialogue');
    const dialogueBox = document.getElementById('dialogueBox');
    const speakerNameEl = document.getElementById('dialogueSpeaker');
    const dialogueTextEl = document.getElementById('dialogueText');
    const dialogueChoicesEl = document.getElementById('dialogueChoices');
    const dialogueHintEl = document.getElementById('dialogueHint');
    
    // Новые элементы для графики
    const dialogueBg = document.getElementById('dialogueBg');
    const dialogueSprite = document.getElementById('dialogueSprite');

    // Имена персонажей, у которых есть графические спрайты
    const AVAILABLE_SPRITES = ["Брак", "Привратник", "Мужик в камуфляже", "Митрич"];

    // 1. ЗАПУСК ДИАЛОГА (Универсальная точка входа)
    function startDialogue(storyData, onEnd) {
        if (!storyData) {
            if (onEnd) onEnd();
            return;
        }

        activeStoryData = storyData;
        onEndCallback = onEnd;

        // Показываем оверлей новеллы
        if (overlayDialogue) {
            overlayDialogue.classList.remove('hidden');
        }

        // Проверяем тип данных диалога: ветвящийся граф или простой массив
        if (storyData.isGraph) {
            // Режим графа (пролог)
            currentSceneId = storyData.startSceneId;
            currentSlideIndex = 0;
            playScene(currentSceneId);
        } else {
            // Линейный режим (старый формат массива)
            currentSceneId = null;
            currentSlideIndex = 0;
            
            // Сбрасываем фоны и спрайты
            if (dialogueBg) dialogueBg.style.backgroundImage = "none";
            if (dialogueSprite) dialogueSprite.classList.remove('active');
            
            showLinearLine();
        }
    }

// 2. ВОСПРОИЗВЕДЕНИЕ СЦЕНЫ ИЗ ГРАФА
    function playScene(sceneId) {
        // Ищем сцену СТРОГО внутри запущенного в данный момент графа
        if (!activeStoryData || !activeStoryData.isGraph || !activeStoryData.scenes || !activeStoryData.scenes[sceneId]) {
            console.error(`novel.js: Сцена ${sceneId} не найдена в текущей главе.`);
            endDialogue();
            return;
        }

        currentSceneId = sceneId;
        currentSlideIndex = 0;

        const scene = activeStoryData.scenes[sceneId];

        // Установка фонового изображения сцены
        if (dialogueBg && scene.background) {
            dialogueBg.style.backgroundImage = `url('images/${scene.background}')`;
        }

        showGraphSlide();
    }

    // 3. ОТОБРАЖЕНИЕ СЛАЙДА В СЦЕНЕ ГРАФА
    function showGraphSlide() {
        const scene = activeStoryData.scenes[currentSceneId];
        const slide = scene.slides[currentSlideIndex];

        // Очищаем старые кнопки выбора
        if (dialogueChoicesEl) {
            dialogueChoicesEl.classList.add('hidden');
            dialogueChoicesEl.innerHTML = "";
        }
        if (dialogueHintEl) {
            dialogueHintEl.classList.remove('hidden');
        }

        // Имя говорящего
        if (speakerNameEl) {
            speakerNameEl.textContent = slide.name ? slide.name : "";
        }

        // Управление отображением спрайтов персонажей
        updateCharacterSprite(slide.name);

        currentText = slide.text || "";
        typewriteText(currentText, () => {
            // Если слайды закончились, проверяем наличие развилок
            if (currentSlideIndex === scene.slides.length - 1) {
                showSceneChoices(scene);
            }
        });
    }

    // 4. ОТОБРАЖЕНИЕ РЕПЛИКИ ДЛЯ ЛИНЕЙНОГО СЮЖЕТА
    function showLinearLine() {
        const slide = activeStoryData[currentSlideIndex];
        if (!slide) {
            endDialogue();
            return;
        }

        if (speakerNameEl) {
            speakerNameEl.textContent = slide.name ? slide.name : "";
        }

        updateCharacterSprite(slide.name);

        currentText = slide.text || "";
        typewriteText(currentText, null);
    }

    // 5. ЭФФЕКТ ПЕЧАТНОЙ МАШИНКИ
    function typewriteText(text, callback) {
        if (typingTimeoutId) {
            clearTimeout(typingTimeoutId);
        }

        isTyping = true;
        dialogueTextEl.textContent = "";
        let charIndex = 0;

        function printChar() {
            if (charIndex < text.length) {
                dialogueTextEl.textContent += text.charAt(charIndex);
                charIndex++;
                typingTimeoutId = setTimeout(printChar, 18); // Скорость печати
            } else {
                isTyping = false;
                typingTimeoutId = null;
                if (callback) callback();
            }
        }

        printChar();
    }

    // Мгновенный пропуск вывода букв
    function skipTyping() {
        if (typingTimeoutId) {
            clearTimeout(typingTimeoutId);
        }
        dialogueTextEl.textContent = currentText;
        isTyping = false;
        typingTimeoutId = null;

        // Если это граф и слайды закончились — выводим кнопки
        if (activeStoryData.isGraph) {
            const scene = activeStoryData.scenes[currentSceneId];
            if (currentSlideIndex === scene.slides.length - 1) {
                showSceneChoices(scene);
            }
        }
    }

    // 6. УПРАВЛЕНИЕ СПРАЙТОМ ПЕРСОНАЖА
    function updateCharacterSprite(speakerName) {
        if (!dialogueSprite) return;

        // Нормализуем имя для сопоставления с именами файлов
        let normalizedSpeaker = speakerName ? speakerName.trim() : null;

        if (normalizedSpeaker === "Голос из темноты") {
            normalizedSpeaker = "Mitrich";
        }

        const hasSprite = normalizedSpeaker && AVAILABLE_SPRITES.includes(normalizedSpeaker);

        if (hasSprite) {
            // Переключаем картинку спрайта
            dialogueSprite.src = `images/char_${normalizedSpeaker}.png`;
            dialogueSprite.classList.add('active');
        } else {
            // Если говорит диктор (null) или фоновый персонаж — скрываем спрайт
            dialogueSprite.classList.remove('active');
        }
    }

    // 7. ВЫВОД ВАРИАНТОВ ВЫБОРА НА ЭКРАН
    function showSceneChoices(scene) {
        // Если это терминальный конец (нет выборов)
        if (!scene.choices || scene.choices.length === 0) {
            if (dialogueHintEl) {
                dialogueHintEl.textContent = "Нажмите на экран для завершения пролога...";
                dialogueHintEl.classList.remove('hidden');
            }
            return;
        }

        if (dialogueHintEl) {
            dialogueHintEl.classList.add('hidden');
        }

        if (dialogueChoicesEl) {
            dialogueChoicesEl.innerHTML = "";
            dialogueChoicesEl.classList.remove('hidden');

            scene.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice.text;

                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Блокируем клик по самому окну
                    handleChoiceSelection(choice);
                });

                dialogueChoicesEl.appendChild(btn);
            });
        }
    }

    // 8. ОБРАБОТКА ВЫБРАННОГО ВАРИАНТА ОТВЕТА
    function handleChoiceSelection(choice) {
        // Начисление фракционной репутации
        if (choice.effects && window.GameState) {
            let changesText = [];
            if (choice.effects.people) {
                window.GameState.addFactionRep('people', choice.effects.people);
                changesText.push(`Люди: ${choice.effects.people > 0 ? '+' : ''}${choice.effects.people} 📈`);
            }
            if (choice.effects.underground) {
                window.GameState.addFactionRep('underground', choice.effects.underground);
                changesText.push(`Подполье: ${choice.effects.underground > 0 ? '+' : ''}${choice.effects.underground} 📈`);
            }
            if (choice.effects.changed) {
                window.GameState.addFactionRep('changed', choice.effects.changed);
                changesText.push(`Измененные: ${choice.effects.changed > 0 ? '+' : ''}${choice.effects.changed} 📈`);
            }
            if (changesText.length > 0) {
                showToast(changesText.join('\n'));
            }
        }

        // Переход к следующей сцене
        if (choice.nextScene) {
            playScene(choice.nextScene);
        } else {
            endDialogue();
        }
    }

    // 9. ПРОДВИЖЕНИЕ СЮЖЕТА ПО КЛИКУ НА ЭКРАН
    function advanceDialogue() {
        if (isTyping) {
            skipTyping();
            return;
        }

        if (activeStoryData.isGraph) {
            // Режим графа
            const scene = activeStoryData.scenes[currentSceneId];
            if (currentSlideIndex < scene.slides.length - 1) {
                currentSlideIndex++;
                showGraphSlide();
            } else {
                // Если слайды закончились и выборов нет — это финал
                if (!scene.choices || scene.choices.length === 0) {
                    endDialogue();
                }
            }
        } else {
            // Линейный режим
            if (currentSlideIndex < activeStoryData.length - 1) {
                currentSlideIndex++;
                showLinearLine();
            } else {
                endDialogue();
            }
        }
    }

    // 10. ЗАВЕРШЕНИЕ ДИЛОГА И ВОЗВРАТ НА КАРТУ
    function endDialogue() {
        if (overlayDialogue) {
            overlayDialogue.classList.add('hidden');
        }

        // Сбрасываем состояние
        activeStoryData = null;
        currentSceneId = null;
        currentSlideIndex = 0;

        if (onEndCallback) {
            onEndCallback();
        }
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
    }

    // Вешаем клик на окно диалога для продвижения по сюжету
    if (dialogueBox) {
        dialogueBox.addEventListener('click', (e) => {
            // Если открыты кнопки развилок — клик мимо них не должен продвигать слайд
            if (activeStoryData && activeStoryData.isGraph) {
                const scene = activeStoryData.scenes[currentSceneId];
                if (currentSlideIndex === scene.slides.length - 1 && scene.choices && scene.choices.length > 0) {
                    return;
                }
            }
            advanceDialogue();
        });
    }

    // Экспортируем новый движок в глобальную видимость
    window.NovelEngine = {
        run: startDialogue
    };

    console.log("novel.js: Графовый движок интерактивной новеллы с поддержкой спрайтов запущен!");
})();
