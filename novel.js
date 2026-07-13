// ================================================
// novel.js (ИСПРАВЛЕННЫЙ И СТАБИЛЬНЫЙ)
// Движок визуальной новеллы (в стиле Клуба Романтики)
// ================================================

(function() {
    // Внутреннее состояние движка новеллы (Все переменные приведены к одному имени!)
    let dialogueLines = [];         // Массив текущих реплик сцены
    let currentLineIndex = 0;       // Номер текущей реплики
    let onEndCallback = null;       // Функция, которая сработает после окончания диалога
    
    let isTyping = false;           // Печатается ли текст прямо сейчас
    let typingTimeoutId = null;     // ID таймера печати (нужен для пропуска)
    let currentText = "";           // Полный текст текущей реплики

    // Находим HTML-элементы
    const overlayDialogue = document.getElementById('overlayDialogue');
    const dialogueBox = document.querySelector('.dialogue-window') || document.getElementById('dialogueBox');
    const speakerNameEl = document.getElementById('dialogueSpeaker');
    const dialogueTextEl = document.getElementById('dialogueText');
    const dialogueChoicesEl = document.getElementById('dialogueChoices');
    const dialogueHintEl = document.getElementById('dialogueHint');

    // 1. ЗАПУСК СЦЕНЫ ДИАЛОГА
    function startDialogue(lines, onEnd) {
        if (!lines || lines.length === 0) {
            if (onEnd) onEnd();
            return;
        }

        dialogueLines = lines;
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

        const line = dialogueLines[currentLineIndex];
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
                typingTimeoutId = setTimeout(printChar, 25);
            } else {
                isTyping = false;
                typingTimeoutId = null;
                checkAndShowChoices();
            }
        }

        printChar();
    }

    // Функция мгновенного показа текста
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
        const line = dialogueLines[currentLineIndex];
        
        if (line && line.choices && line.choices.length > 0) {
            if (dialogueHintEl) dialogueHintEl.classList.add('hidden');
            
            if (dialogueChoicesEl) {
                dialogueChoicesEl.innerHTML = "";
                dialogueChoicesEl.classList.remove('hidden');

                line.choices.forEach(choice => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    
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

                    if (choice.costRep || choice.costCoins) {
                        btn.classList.add('premium');
                    }

                    if (!hasResource) {
                        btn.disabled = true;
                        btn.style.opacity = "0.45";
                        btn.style.cursor = "not-allowed";
                    } else {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation(); 
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
        if (choice.costCoins && window.GameState) {
            window.GameState.spendCash(choice.costCoins);
        }
        
        if (choice.rewardRep && window.GameState) {
            window.GameState.addReputation(choice.rewardRep);
            showToast(`Репутация: +${choice.rewardRep} 👑`);
        }
        if (choice.rewardCoins && window.GameState) {
            window.GameState.addCash(choice.rewardCoins);
            showToast(`Валюта: +${choice.rewardCoins}₽ 💰`);
        }

        if (choice.nextScene && window.gameDialogs && window.gameDialogs[choice.nextScene]) {
            startDialogue(window.gameDialogs[choice.nextScene], onEndCallback);
        } else if (choice.nextDialogueLines) {
            startDialogue(choice.nextDialogueLines, onEndCallback);
        } else {
            advanceLine();
        }
    }

    // 6. ПРОВЕРКА ПЕРЕХОДА НА СЛЕДУЮЩУЮ СТРОКУ
    function advanceLine() {
        currentLineIndex++;
        if (currentLineIndex < dialogueLines.length) {
            showLine();
        } else {
            endDialogue();
        }
    }

    // 7. КОНЕЦ СЦЕНЫ ДИАЛОГА
    function endDialogue() {
        if (overlayDialogue) {
            overlayDialogue.classList.add('hidden');
        }
        
        dialogueLines = [];
        currentLineIndex = 0;

        if (onEndCallback) {
            onEndCallback();
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

    // Клик на саму плашку диалога продвигает текст вперед
    if (dialogueBox) {
        dialogueBox.addEventListener('click', () => {
            if (isTyping) {
                skipTyping();
                return;
            }

            const line = dialogueLines[currentLineIndex];
            if (line && line.choices && line.choices.length > 0) {
                return;
            }

            advanceLine();
        });
    }

    // Экспортируем движок новеллы глобально
    window.NovelEngine = {
        run: startDialogue
    };

    console.log("novel.js: Опечатки в имени переменной исправлены!");
})();
