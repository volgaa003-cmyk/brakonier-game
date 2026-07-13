// ================================================
// novel.js
// Движок визуальной новеллы (в стиле Клуба Романтики)
// ================================================

(function() {
    // Внутреннее состояние движка новеллы
    let dialogLines = [];           // Массив текущих реплик сцены
    let currentLineIndex = 0;       // Номер текущей реплики
    let onEndCallback = null;        // Функция, которая сработает после окончания диалога
    
    let isTyping = false;           // Печатается ли текст прямо сейчас
    let typingTimeoutId = null;     // ID таймера печати (нужен для пропуска)
    let currentText = "";           // Полный текст текущей реплики

    // Находим HTML-элементы
    const overlayDialogue = document.getElementById('dialogueOverlay');
    const dialogueBox = document.getElementById('dialogueBox');
    const speakerNameEl = document.getElementById('dialogueSpeaker');
    const dialogueTextEl = document.getElementById('dialogueText');
    const dialogueChoicesEl = document.getElementById('dialogueChoices');
    const dialogueHintEl = document.getElementById('dialogueHint');

    // 1. ЗАПУСК СЦЕНЫ ДИАЛОГА
    // Метод принимает массив реплик (или сцену) и функцию обратного вызова после финала
    function startDialogue(lines, onEnd) {
        if (!lines || lines.length === 0) {
            if (onEnd) onEnd();
            return;
        }

        dialogLines = lines;
        currentLineIndex = 0;
        onEndCallback = onEnd;

        // Показываем оверлей новеллы
        if (overlayDialogue) {
            overlayDialogue.classList.remove('hidden');
        }

        // Показываем первую реплику
        showLine();
    }

    // 2. ОТОБРАЖЕНИЕ ТЕКУЩЕЙ РЕПЛИКИ
    function showLine() {
        // Очищаем старые кнопки выбора
        if (dialogueChoicesEl) {
            dialogueChoicesEl.classList.add('hidden');
            dialogueChoicesEl.innerHTML = "";
        }
        if (dialogueHintEl) {
            dialogueHintEl.classList.remove('hidden');
        }

        const line = dialogLines[currentLineIndex];
        if (!line) {
            endDialogue();
            return;
        }

        // Выводим имя персонажа
        if (speakerNameEl) {
            speakerNameEl.textContent = line.name || "???";
        }

        // Запускаем печатную машинку для текста реплики
        currentText = line.text || "";
        typewriteText(currentText);
    }

    // 3. ЭФФЕКТ ПЕЧАТНОЙ МАШИНКИ
    function typewriteText(text) {
        // Если уже шел процесс печати — сбрасываем старый таймер
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
                // Скорость печати: 25 миллисекунд на один символ
                typingTimeoutId = setTimeout(printChar, 25);
            } else {
                isTyping = false;
                typingTimeoutId = null;
                // Если у этой реплики есть выборы ответов — выводим их
                checkAndShowChoices();
            }
        }

        printChar();
    }

    // Функция мгновенного показа текста (пропуск анимации при клике)
    function skipTyping() {
        if (typingTimeoutId) {
            clearTimeout(typingTimeoutId);
        }
        dialogueTextEl.textContent = currentText;
        isTyping = false;
        typingTimeoutId = null;
        checkAndShowChoices();
    }

    // 4. ПРОВЕРКА НАЛИЧИЯ ВЫБОРОВ НА ЭТОМ ШАГЕ
    function checkAndShowChoices() {
        const line = dialogLines[currentLineIndex];
        
        // Если у этой реплики прописан массив выборов "choices"
        if (line && line.choices && line.choices.length > 0) {
            // Скрываем подсказку "Нажмите на окно", чтобы игрок не кликал мимо кнопок
            if (dialogueHintEl) dialogueHintEl.classList.add('hidden');
            
            if (dialogueChoicesEl) {
                dialogueChoicesEl.innerHTML = "";
                dialogueChoicesEl.classList.remove('hidden');

                // Создаем кнопку для каждого выбора на экране
                line.choices.forEach(choice => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    
                    // Узнаем, является ли выбор платным или требует репутации
                    let hasResource = true;
                    let prefixText = "";

                    if (choice.costRep) {
                        prefixText += `[👑 Репутация: ${choice.costRep}] `;
                        if (window.GameState && window.GameState.getReputation() < choice.costRep) {
                            hasResource = false;
                        }
                    }
                    if (choice.costCoins) {
                        prefixText += `[💰 ${choice.costCoins}₽] `;
                        if (window.GameState && window.GameState.getCash() < choice.costCoins) {
                            hasResource = false;
                        }
                    }

                    btn.textContent = prefixText + choice.text;

                    // Если выбор платный, подсвечиваем его золотой рамкой Клуба Романтики
                    if (choice.costRep || choice.costCoins) {
                        btn.classList.add('premium');
                    }

                    // Если ресурсов не хватает — блокируем кнопку
                    if (!hasResource) {
                        btn.disabled = true;
                        btn.style.opacity = "0.45";
                        btn.style.cursor = "not-allowed";
                    } else {
                        // Если всё ок — вешаем обработчик нажатия на выбор
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation(); // Предотвращаем клик по самому окну диалога
                            handleChoiceSelection(choice);
                        });
                    }

                    dialogueChoicesEl.appendChild(btn);
                });
            }
        }
    }

    // 5. ОБРАБОТКА ВЫБРАННОГО ОТВЕТА
    function handleChoiceSelection(choice) {
        // 1. Списываем ресурсы, если выбор был платным
        if (choice.costCoins && window.GameState) {
            window.GameState.spendCash(choice.costCoins);
        }
        
        // 2. Начисляем награды/последствия выбора (Репутацию, монеты и т.д.)
        if (choice.rewardRep && window.GameState) {
            window.GameState.addReputation(choice.rewardRep);
            showToast(`Репутация: +${choice.rewardRep} 👑`);
        }
        if (choice.rewardCoins && window.GameState) {
            window.GameState.addCash(choice.rewardCoins);
            showToast(`Валюта: +${choice.rewardCoins}₽ 💰`);
        }

        // 3. Перенаправляем сюжет в зависимости от выбора
        if (choice.nextScene && window.gameDialogs && window.gameDialogs[choice.nextScene]) {
            // Если выбор ведет на другую сцену (ветку), запускаем её
            startDialogue(window.gameDialogs[choice.nextScene], onEndCallback);
        } else if (choice.nextDialogueLines) {
            // Если реплики прописаны прямо внутри выбора — переключаемся на них
            startDialogue(choice.nextDialogueLines, onEndCallback);
        } else {
            // Иначе просто идем дальше по текущему массиву диалога
            advanceLine();
        }
    }

    // 6. ПЕРЕХОД К СЛЕДУЮЩЕЙ РЕПЛИКЕ
    function advanceLine() {
        currentLineIndex++;
        if (currentLineIndex < dialogLines.length) {
            showLine();
        } else {
            endDialogue();
        }
    }

    // 7. КОНЕЦ СЦЕНЫ
    function endDialogue() {
        if (overlayDialogue) {
            overlayDialogue.classList.add('hidden');
        }
        
        // Очищаем состояние
        dialogLines = [];
        currentLineIndex = 0;

        // Запускаем финальный колбэк (например, запуск три в ряд или возврат в хаб)
        if (onEndCallback) {
            onEndCallback();
        }
    }

    // Вспомогательный всплывающий тост для наград в новелле
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 1500);
        }
    }

    // Клик на саму плашку диалога продвигает текст вперед
    if (dialogueBox) {
        dialogueBox.addEventListener('click', () => {
            // Если текст еще печатается — мгновенно показываем его полностью
            if (isTyping) {
                skipTyping();
                return;
            }

            // Если на экране висят выборы ответов — клик мимо кнопок не работает
            const line = dialogLines[currentLineIndex];
            if (line && line.choices && line.choices.length > 0) {
                return;
            }

            // Иначе просто переключаем на следующую реплику
            advanceLine();
        });
    }

    // Экспортируем движок новеллы глобально во все файлы игры
    window.NovelEngine = {
        run: startDialogue
    };

    console.log("novel.js: Движок диалогов Клуба Романтики успешно инициализирован!");
})();
