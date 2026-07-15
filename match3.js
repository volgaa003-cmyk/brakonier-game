// ================================================
// match3.js (ПОЛНАЯ, АБСОЛЮТНО РАБОЧАЯ СБОРКА)
// ================================================

(function() {
    const SIZE = 8;
    const TYPES = [
        {id:'heart', icon:'🫀'},
        {id:'bullet', icon:'🔫'},
        {id:'garlic', icon:'🧄'},
        {id:'stake', icon:'🗡️'},
        {id:'vial', icon:'🧪'},
        {id:'coin', icon:'💰'}
    ];
    const SPECIALS = ['rocketRow','rocketCol','bomb','plane','rainbow'];

    const SWAP_MS = 240;  
    const CLEAR_MS = 260; 
    const FALL_MS = 300;  

    let currentLevelId = 1;
    let GOAL_HEARTS = 12;
    let START_MOVES = 20;
    let levelDifficulty = "normal";
    let levelLayout = []; 

    let targetType = "heart"; 
    let carpetGrid = [];      
    let iceGrid = [];         
    let chainGrid = [];
    let portals = {};

    let grid = [];
    let selected = null;
    let hearts = 0, moves = 20;
    let boxesBroken = 0;
    let iceMelted = 0;
    let donutsCollected = 0;
    let busy = false;
    let tileIdCounter = 0;

    let activeBooster = null; 
    let activePlanesCount = 0;
    let doublePlanesActive = false; 

    let selectedPreBoosters = {
        rainbow: false,
        combo: false,
        doublePlanes: false
    };

    let hintTimeout = null;
    let dragStartX = 0, dragStartY = 0;
    let dragActiveTile = null;

    // Ссылки на HTML-элементы
    const boardEl = document.getElementById('board');
    const m3GoalText = document.getElementById('m3GoalText');
    const m3MovesText = document.getElementById('m3MovesText');
    const toastEl = document.getElementById('toast');

    const btnHammer = document.getElementById('btnHammer');
    const btnGlove = document.getElementById('btnGlove');
    const btnBroom = document.getElementById('btnBroom');
    const btnWeight = document.getElementById('btnWeight');
    const btnFan = document.getElementById('btnFan');

    const overlayResults = document.getElementById('overlayResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsText = document.getElementById('resultsText');
    const overlayPreLevel = document.getElementById('overlayPreLevel');

    // ==========================================================================
    // СИСТЕМНЫЕ ФУНКЦИИ И ХЕЛПЕРЫ (Безопасное объявление)
    // ==========================================================================
    let pendingResultIsWin = null;

    const showOverlay = function(title, text, isWin) {
        pendingResultIsWin = !!isWin;
        if (resultsTitle) resultsTitle.textContent = title;
        if (resultsText) resultsText.textContent = text;
        if (overlayResults) overlayResults.classList.remove('hidden');
        busy = false;
    };

    if (btnResultsClose) {
        btnResultsClose.addEventListener('click', () => {
            if (overlayResults) overlayResults.classList.add('hidden');
            if (pendingResultIsWin && window.GameState) {
                window.GameState.nextLevel();
            }
            pendingResultIsWin = null;
            if (window.showScreen) window.showScreen('screenMap');
        });
    }

    const getRewards = function(diff) {
        let starsGained = 1;
        let baseCoins = 100;
        if (diff === "medium") baseCoins = 150;
        else if (diff === "hard") baseCoins = 250;
        else if (diff === "extreme") baseCoins = 400;
        else if (diff === "challenge") { starsGained = 3; baseCoins = 300; }
        return { stars: starsGained, coins: baseCoins + moves * 10, base: baseCoins, bonus: moves * 10 };
    };

    // Внедрение Homescapes-стилей
    (function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tile.layer-3 .tile-inner { background: linear-gradient(135deg, #4d2b12, #2b1404); border-color: #ffd700; box-shadow: inset 0 0 12px #000; }
            .tile.layer-2 .tile-inner { background: linear-gradient(135deg, #82431a, #59290a); border-color: #c0c0c0; }
            .tile.layer-1 .tile-inner { background: linear-gradient(135deg, #b06530, #80441b); }
            
            .tile.frozen-2 .tile-inner::after { border-color: #00b0ff; background: rgba(0, 176, 255, 0.45); box-shadow: inset 0 0 10px #fff; }
            .tile.frozen-1 .tile-inner::after { border-color: #80deea; background: rgba(128, 222, 234, 0.25); }

            .tile.chain-2 .tile-inner::after { content: "⛓️" !important; font-size: 30px !important; }
            .tile.chain-1 .tile-inner::after { content: "🔗" !important; font-size: 24px !important; }

            .pre-boosters-selection { margin: 15px 0; background: rgba(0,0,0,0.15); padding: 12px; border-radius: 12px; border: 2px solid var(--ink); }
            .pre-booster-title { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: var(--ink); }
            .pre-boosters-row { display: flex; justify-content: center; gap: 14px; }
            .pre-booster-btn { background: var(--paper); border: 2px solid var(--ink); border-radius: 50%; width: 50px; height: 50px; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0 var(--ink); transition: 0.1s; }
            .pre-booster-btn.selected { background: var(--gold); transform: scale(1.1); box-shadow: 0 0 10px var(--gold), 2px 2px 0 var(--ink); }
            .pre-booster-btn .b-icon { font-size: 24px; }
            .pre-booster-btn .b-tag { position: absolute; bottom: -4px; right: -4px; background: var(--blood); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; border: 1.5px solid var(--ink); font-weight: bold; }
            
            .booster-btn { position: relative; }
            .booster-btn .b-count { position: absolute; top: -5px; right: -5px; background: var(--blood); color: #fff; font-size: 10px; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; border: 1.5px solid var(--ink); font-weight: bold; }
        `;
        document.head.appendChild(style);
    })();

    // Хелперы вычислений
    const isSpecial = t => SPECIALS.includes(t);
    const randType = () => TYPES[Math.floor(Math.random()*TYPES.length)].id;
    const key = (r,c) => r+','+c;
    const getType = (r,c) => grid[r] && grid[r][c] ? grid[r][c].type : null;

    function triggerBoardShake(intensityClass = 'shake-mild') {
        if (!boardEl) return;
        boardEl.classList.remove('shake-mild', 'shake-intense');
        void boardEl.offsetWidth; 
        boardEl.classList.add(intensityClass);
        setTimeout(() => boardEl.classList.remove('shake-mild', 'shake-intense'), 350);
    }

    function spawnMatchParticles(r, c, type) {
        if (!boardEl) return;
        const count = 6;
        const colorPalette = { heart: '#ff2e93', bullet: '#2ecc71', garlic: '#f1c40f', stake: '#3498db', vial: '#9b59b6', coin: '#f39c12' };
        const pColor = colorPalette[type] || '#ffffff';
        const cellWidth = boardEl.offsetWidth / SIZE;
        const startX = (c + 0.5) * cellWidth;
        const startY = (r + 0.5) * cellWidth;

        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'm3-spark';
            spark.style.backgroundColor = pColor;
            spark.style.left = startX + 'px';
            spark.style.top = startY + 'px';
            boardEl.appendChild(spark);

            const angle = (Math.PI * 2 / count) * i;
            const force = 30 + Math.random() * 30;
            setTimeout(() => {
                spark.style.transform = `translate(${Math.cos(angle)*force}px, ${Math.sin(angle)*force}px) scale(0)`;
                spark.style.opacity = '0';
            }, 20);
            setTimeout(() => spark.remove(), 420);
        }
    }

    function iconFor(type, extraState){
        if (type === 'box') {
            const layers = extraState || 1;
            if (layers === 3) return '📦🔒';
            if (layers === 2) return '📦💥';
            return '🪵';
        }
        switch(type){
            case 'bomb': return '💣';
            case 'rocketRow': return '🚀';
            case 'rocketCol': return '🚀';
            case 'plane': return '✈️';
            case 'rainbow': return '🌈';
            case 'donut': return '🍩';
            default: return (TYPES.find(t=>t.id===type) || {icon: '❓'}).icon;
        }
    }

    function applySpecialClass(t){
        t.el.className = 'tile';
        if(t.type==='bomb') t.el.classList.add('bomb');
        else if(t.type==='rocketRow') t.el.classList.add('rocket-row');
        else if(t.type==='rocketCol') t.el.classList.add('rocket-col');
        else if(t.type==='plane') t.el.classList.add('plane');
        else if(t.type==='rainbow') t.el.classList.add('rainbow');
        else if(t.type==='box') {
            t.el.classList.add('box', `layer-${t.boxLayers}`);
        }
        if(t.frozen) t.el.classList.add('frozen', `frozen-${t.frozenLayers}`);
        if(t.chained) t.el.classList.add('chained', `chain-${t.chainedLayers}`);
    }

    function setTilePos(el, row, col){
        el.style.left = (col*100/SIZE)+'%';
        el.style.top = (row*100/SIZE)+'%';
    }

    function findTileById(id){
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            const t = grid[r][c];
            if(t && t.id===id) return t;
        }
        return null;
    }

    function resetHintTimer() {
        clearTimeout(hintTimeout);
        removeCurrentHints();
        hintTimeout = setTimeout(highlightPossibleMove, 4500); 
    }

    function removeCurrentHints() {
        document.querySelectorAll('.match-hint').forEach(el => el.classList.remove('match-hint'));
    }

    function highlightPossibleMove() {
        if (busy || activeBooster) return;
        const move = findValidSwapMove();
        if (move) {
            move.a.el.classList.add('match-hint');
            move.b.el.classList.add('match-hint');
        }
    }

    function findValidSwapMove() {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE - 1; c++) {
                const a = grid[r][c];
                const b = grid[r][c+1];
                if (a && b && a.type !== 'box' && b.type !== 'box' && !a.frozen && !b.frozen && !a.chained && !b.chained) {
                    swapInGrid(a, b);
                    const hasMatch = collectRuns().length > 0;
                    swapInGrid(a, b); 
                    if (hasMatch) return { a, b };
                }
            }
        }
        return null;
    }

    function handleDragStart(e, tile) {
        if (busy || activeBooster || tile.type === 'box' || tile.frozen || tile.chained) return;
        dragActiveTile = tile;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartX = clientX;
        dragStartY = clientY;
        resetHintTimer();
    }

    function handleDragMove(e) {
        if (!dragActiveTile || busy) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 30) { 
            let targetRow = dragActiveTile.row;
            let targetCol = dragActiveTile.col;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) targetCol++; else targetCol--;
            } else {
                if (dy > 0) targetRow++; else targetRow--;
            }

            if (targetRow >= 0 && targetRow < SIZE && targetCol >= 0 && targetCol < SIZE) {
                const partner = grid[targetRow][targetCol];
                if (partner && partner.type !== 'box' && !partner.frozen && !partner.chained) {
                    dragActiveTile.el.classList.remove('selected');
                    selected = null;
                    performSwap(dragActiveTile, partner);
                }
            }
            dragActiveTile = null; 
        }
    }

    function handleDragEnd() { dragActiveTile = null; }

    function createTile(row, col, type, spawnRow){
        const id = 'tile'+(tileIdCounter++);
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.id = id;
        
        const initBoxLayers = (type === 'box') ? (Math.random() < 0.4 ? 3 : (Math.random() < 0.5 ? 2 : 1)) : 0;
        const initFrozenLayers = (iceGrid[row] && iceGrid[row][col] === 1) ? (Math.random() < 0.5 ? 2 : 1) : 0;
        const initChainedLayers = (chainGrid[row] && chainGrid[row][col] === 1) ? (Math.random() < 0.5 ? 2 : 1) : 0;

        const inner = document.createElement('div');
        inner.className = 'tile-inner';
        inner.textContent = iconFor(type, initBoxLayers);
        el.appendChild(inner);

        const tile = {
            id, 
            type, 
            row, 
            col, 
            el, 
            inner, 
            frozen: initFrozenLayers > 0, 
            frozenLayers: initFrozenLayers,
            chained: initChainedLayers > 0,
            chainedLayers: initChainedLayers,
            boxLayers: initBoxLayers
        };

        el.addEventListener('mousedown', (e) => handleDragStart(e, tile));
        el.addEventListener('touchstart', (e) => handleDragStart(e, tile), {passive: true});
        el.addEventListener('click', onTileClick);

        if(spawnRow !== undefined && spawnRow !== row){
            el.style.transition = 'none';
            setTilePos(el, spawnRow, col);
        } else {
            setTilePos(el, row, col);
        }

        if (boardEl) boardEl.appendChild(el);

        if(spawnRow !== undefined && spawnRow !== row){
            setTimeout(() => {
                el.style.transition = '';
                setTilePos(el, row, col);
            }, 16); 
        }
        
        applySpecialClass(tile);
        return tile;
    }

    function moveTileTo(tile, row, col){
        tile.row = row; tile.col = col;
        setTilePos(tile.el, row, col);
    }

    function findBestTargetForPlane(excludeRow, excludeCol) {
        let targetRow = excludeRow, targetCol = excludeCol;
        let foundTarget = false;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] && grid[r][c].type === 'box') {
                    targetRow = r; targetCol = c;
                    foundTarget = true;
                    break;
                }
            }
            if (foundTarget) break;
        }

        if (!foundTarget) {
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (grid[r][c] && grid[r][c].type === 'heart') {
                        targetRow = r; targetCol = c;
                        foundTarget = true;
                        break;
                    }
                }
                if (foundTarget) break;
            }
        }

        if (!foundTarget) {
            const candidates = [];
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (grid[r][c] && grid[r][c].type !== 'box' && grid[r][c].type !== 'donut' && !(r === excludeRow && c === excludeCol)) {
                        candidates.push([r, c]);
                    }
                }
            }
            if (candidates.length) {
                const rnd = candidates[Math.floor(Math.random() * candidates.length)];
                targetRow = rnd[0]; targetCol = rnd[1];
                foundTarget = true;
            }
        }

        return foundTarget ? { r: targetRow, c: targetCol } : null;
    }

    function checkAndBreakBoxes(clearSet, isExplosion) {
        const boxesToBreak = new Set();

        clearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const neighbors = [
                [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
            ];

            neighbors.forEach(([nr, nc]) => {
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                    const tile = grid[nr][nc];
                    if (tile && tile.type === 'box') {
                        boxesToBreak.add(key(nr, nc));
                    }
                }
            });
        });

        boxesToBreak.forEach(k => {
            const [br, bc] = k.split(',').map(Number);
            const boxTile = grid[br][bc];
            if (boxTile) {
                damageObstacle(boxTile, br, bc, isExplosion);
            }
        });
        return boxesToBreak;
    }

    function damageObstacle(tile, r, c, isExplosion) {
        const damage = isExplosion ? 2 : 1; 
        
        if (tile.type === 'box') {
            tile.boxLayers -= damage;
            if (tile.boxLayers > 0) {
                tile.inner.textContent = iconFor('box', tile.boxLayers);
                applySpecialClass(tile);
                spawnMatchParticles(r, c, 'coin');
            } else {
                levelLayout[r][c] = 1;
                tile.el.classList.add('clearing');
                if (targetType === "box") boxesBroken++;
                setTimeout(() => {
                    if (grid[r][c] === tile) {
                        tile.el.remove();
                        grid[r][c] = null;
                    }
                }, CLEAR_MS);
            }
        }
        
        if (tile.frozen) {
            tile.frozenLayers -= damage;
            if (tile.frozenLayers > 0) {
                applySpecialClass(tile);
            } else {
                tile.frozen = false;
                tile.frozenLayers = 0;
                iceGrid[r][c] = 0;
                applySpecialClass(tile);
                if (targetType === "ice") iceMelted++;
            }
        }

        if (tile.chained) {
            tile.chainedLayers -= damage;
            if (tile.chainedLayers > 0) {
                applySpecialClass(tile);
            } else {
                tile.chained = false;
                tile.chainedLayers = 0;
                chainGrid[r][c] = 0;
                applySpecialClass(tile);
                pulseToast("🔗 Цепь полностью снята!");
            }
        }
    }

    function spreadCarpetAt(r, c) {
        if (levelLayout[r] && levelLayout[r][c] === 1 && !carpetGrid[r][c]) {
            carpetGrid[r][c] = true;
            const cellEl = document.querySelector(`.grid-cell[data-pos="${r},${c}"]`);
            if (cellEl) cellEl.classList.add('carpet');
        }
    }

    function countActiveDonuts() {
        let count = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] && grid[r][c].type === 'donut') count++;
            }
        }
        return count;
    }

    function collectDoughnuts() {
        let collectedThisTurn = 0;
        for (let c = 0; c < SIZE; c++) {
            const t = grid[SIZE - 1][c];
            if (t && t.type === 'donut') {
                t.el.classList.add('clearing');
                grid[SIZE - 1][c] = null;
                donutsCollected++;
                collectedThisTurn++;
                setTimeout(((tileToKill) => () => tileToKill.el.remove())(t), CLEAR_MS);
            }
        }
        if (collectedThisTurn > 0) {
            updateMatch3HUD();
            pulseToast(`🍩 Собрано пончиков: ${donutsCollected}!`);
            applyGravityAndRefill();
        }
    }

    function processThreatsAndJesters() {
        let spawnedFoam = false;

        for (let r = 1; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && t.type === 'parrot' && levelLayout[r-1][c] === 1 && grid[r-1][c] === null) {
                    grid[r-1][c] = t;
                    grid[r][c] = null;
                    moveTileTo(t, r - 1, c);
                }
            }
        }

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && (t.type === 'foam' || t.type === 'ivy') && !spawnedFoam) {
                    const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
                    for (const [nr, nc] of neighbors) {
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && levelLayout[nr][nc] === 1 && grid[nr][nc] !== null && !isSpecial(grid[nr][nc].type) && grid[nr][nc].type !== 'box' && grid[nr][nc].type !== 'donut') {
                            const victim = grid[nr][nc];
                            victim.el.remove();
                            grid[nr][nc] = createTile(nr, nc, t.type, nr);
                            spawnedFoam = true;
                            pulseToast(t.type === 'foam' ? "🧼 Мыло затекает!" : "🌿 Плющ наступает!");
                            break;
                        }
                    }
                }
            }
        }
    }

    function synchronizeObstaclesAndGoals() {
        let playableCells = [];
        let currentBoxes = 0;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (levelLayout[r][c] === 1) {
                    playableCells.push({r, c});
                } else if (levelLayout[r][c] === 2) {
                    currentBoxes++;
                }
            }
        }

        if (targetType === "box") {
            let targetBoxCount = Math.min(GOAL_HEARTS, 18);
            while (currentBoxes < targetBoxCount && playableCells.length > 0) {
                const rndIdx = Math.floor(Math.random() * playableCells.length);
                const cell = playableCells.splice(rndIdx, 1)[0];
                levelLayout[cell.r][cell.c] = 2; 
                currentBoxes++;
            }
            GOAL_HEARTS = currentBoxes; 
        }

        if (selectedPreBoosters.rainbow) {
            const cell = playableCells.splice(Math.floor(Math.random()*playableCells.length), 1)[0];
            if (cell) levelLayout[cell.r][cell.c] = 7; 
        }
        if (selectedPreBoosters.combo) {
            if (playableCells.length > 1) {
                const cell1 = playableCells.splice(Math.floor(Math.random()*playableCells.length), 1)[0];
                const cell2 = playableCells.splice(Math.floor(Math.random()*playableCells.length), 1)[0];
                levelLayout[cell1.r][cell1.c] = 3; 
                levelLayout[cell2.r][cell2.c] = 4; 
            }
        }
        doublePlanesActive = selectedPreBoosters.doublePlanes;
    }

// ================================================
// match3.js — ЧАСТЬ 2: ДВИЖОК ГРАВИТАЦИИ И МАТЧИНГА (ИСПРАВЛЕНО)
// ================================================

    function buildInitialGrid(){
        if (!boardEl) return;
        boardEl.innerHTML = '';
        grid = [];
        for(let r=0;r<SIZE;r++) grid.push(new Array(SIZE).fill(null));

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (levelLayout[r][c] !== 0) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.dataset.pos = `${r},${c}`; 
                    if (carpetGrid[r] && carpetGrid[r][c]) cell.classList.add('carpet');
                    boardEl.appendChild(cell);
                }
            }
        }
        
        for(let r=0;r<SIZE;r++){
            for(let c=0;c<SIZE;c++){
                const cellType = levelLayout[r][c];
                if (cellType === 0) {
                    grid[r][c] = null;
                } else if (cellType === 2) {
                    grid[r][c] = createTile(r, c, 'box', r);
                } else if (cellType === 3) {
                    grid[r][c] = createTile(r, c, 'bomb', r);
                } else if (cellType === 4) {
                    grid[r][c] = createTile(r, c, 'rocketRow', r);
                } else if (cellType === 5) {
                    grid[r][c] = createTile(r, c, 'rocketCol', r);
                } else if (cellType === 6) {
                    grid[r][c] = createTile(r, c, 'plane', r);
                } else if (cellType === 7) {
                    grid[r][c] = createTile(r, c, 'rainbow', r);
                } else {
                    let t, guard=0;
                    do{ t=randType(); guard++; } 
                    while(guard<30 && (
                        (c>=2 && grid[r][c-1] && grid[r][c-2] && grid[r][c-1].type===t && grid[r][c-2].type===t) ||
                        (r>=2 && grid[r-1][c] && grid[r-2][c] && grid[r-1][c].type===t && grid[r-2][c].type===t)
                    ));
                    grid[r][c] = createTile(r, c, t, r - SIZE);
                }
            }
        }
    }

    // Алгоритм гравитации с диагональным огибанием препятствий
    function applyGravityAndRefill(){
        let moved = true;
        let loops = 0;
        const maxLoops = 25;

        while (moved && loops < maxLoops) {
            moved = false; loops++;
            for (let r = SIZE - 1; r >= 0; r--) {
                for (let c = 0; c < SIZE; c++) {
                    if (levelLayout[r][c] !== 0 && grid[r][c] === null) {
                        let sourceRow = -1;
                        let sourceCol = c;
                        const cellKey = key(r, c);

                        if (portals[cellKey]) {
                            const [ep_r, ep_c] = portals[cellKey].split(',').map(Number);
                            sourceRow = ep_r;
                            sourceCol = ep_c;
                        } else {
                            for (let checkR = r - 1; checkR >= 0; checkR--) {
                                if (levelLayout[checkR][c] === 0) break;
                                if (levelLayout[checkR][c] !== 0) { sourceRow = checkR; break; }
                            }
                        }

                        // 1. Вертикальное падение
                        if (sourceRow >= 0 && sourceCol >= 0 && sourceCol < SIZE) {
                            const t = grid[sourceRow][sourceCol];
                            if (t && t.type !== 'box' && !t.frozen && !t.chained) {
                                grid[r][c] = t; 
                                grid[sourceRow][sourceCol] = null;
                                moveTileTo(t, r, c); 
                                moved = true;
                                continue;
                            }
                        }

                        // 2. Диагональное сползание (огибание препятствий)
                        if (grid[r][c] === null && !portals[cellKey]) {
                            const sideDirections = [-1, 1];
                            if (Math.random() < 0.5) sideDirections.reverse();

                            for (const dc of sideDirections) {
                                const diagCol = c + dc;
                                const diagRow = r - 1;

                                if (diagRow >= 0 && diagCol >= 0 && diagCol < SIZE) {
                                    if (levelLayout[diagRow][diagCol] !== 0) {
                                        const t = grid[diagRow][diagCol];
                                        if (t && t.type !== 'box' && !t.frozen && !t.chained) {
                                            grid[r][c] = t;
                                            grid[diagRow][diagCol] = null;
                                            moveTileTo(t, r, c);
                                            moved = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Заполнение пустых мест сверху
            for (let c = 0; c < SIZE; c++) {
                for (let r = 0; r < SIZE; r++) {
                    const isSegmentTop = levelLayout[r][c] !== 0 && (r === 0 || levelLayout[r - 1][c] === 0);
                    if (isSegmentTop && grid[r][c] === null) {
                        grid[r][c] = createTile(r, c, randType(), r - 1);
                        moved = true;
                    }
                }
            }
        }
        collectDoughnuts();
        processThreatsAndJesters();
        resetHintTimer(); 
    }

    function pulseToast(msg) {
        if (toastEl) {
            toastEl.textContent = msg;
            toastEl.classList.add('show');
            clearTimeout(pulseToast._t);
            pulseToast._t = setTimeout(() => toastEl.classList.remove('show'), 1200);
        }
    }

    function updateMatch3HUD() {
        if (m3MovesText) m3MovesText.textContent = moves;
        if (!m3GoalText) return;

        if (targetType === "carpet") {
            let currentCarpetCount = 0;
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (carpetGrid[r][c]) currentCarpetCount++;
                }
            }
            m3GoalText.textContent = `${currentCarpetCount}/${GOAL_HEARTS} 🌿`;
        } else if (targetType === "box") {
            m3GoalText.textContent = `${boxesBroken}/${GOAL_HEARTS} 📦`;
        } else if (targetType === "ice") {
            m3GoalText.textContent = `${iceMelted}/${GOAL_HEARTS} 🧊`;
        } else {
            m3GoalText.textContent = `${hearts}/${GOAL_HEARTS} ❤️`;
        }
    }

    function checkEndConditions(){
        let isVictory = (targetType === "box" && boxesBroken >= GOAL_HEARTS) ||
                        (targetType === "ice" && iceMelted >= GOAL_HEARTS) ||
                        (targetType === "heart" && hearts >= GOAL_HEARTS);

        if(isVictory){
            clearTimeout(hintTimeout);
            const rewards = getRewards(levelDifficulty);
            if (window.GameState) {
                window.GameState.addStars(rewards.stars);
                window.GameState.addCash(rewards.coins);
            }
            showOverlay('Успешная вылазка!', `Заказ закрыт!\nБаза: +${rewards.base}₽\nБонус за ходы: +${rewards.bonus}₽`, true);
            return;
        }

        if(moves <= 0){
            clearTimeout(hintTimeout);
            if (window.GameState) window.GameState.loseLife();
            showOverlay('Вурдалаки победили!', `Тебе не хватило ходов. Жизнь -1.`, false);
        }
    }

    // Детектор совпадений (Поиск комбинаций)
    const isNotMatchable = type => isSpecial(type) || ['box', 'donut', 'vase', 'brick', 'ring', 'capsule', 'jester', 'foam', 'ivy', 'steam', 'parrot', 'pinata'].includes(type);

    function collectRuns(){
        const runs = [];
        for(let r=0;r<SIZE;r++){
            let runStart=0;
            for(let c=1;c<=SIZE;c++){
                const cur = c<SIZE ? getType(r,c) : null;
                const prev = getType(r,c-1);
                if(cur!==null && cur===prev && !isNotMatchable(cur)) continue;
                const len = c - runStart;
                if(len>=3 && prev !== null && !isNotMatchable(prev)){
                    const cells=[]; 
                    for(let k=runStart;k<c;k++) cells.push([r,k]);
                    runs.push({cells, dir:'h', length:len, type:prev, used:false});
                }
                runStart = c;
            }
        }
        for(let c=0;c<SIZE;c++){
            let runStart=0;
            for(let r=1;r<=SIZE;r++){
                const cur = r<SIZE ? getType(r,c) : null;
                const prev = getType(r-1,c);
                if(cur!==null && cur===prev && !isNotMatchable(cur)) continue;
                const len = r - runStart;
                if(len>=3 && prev !== null && !isNotMatchable(prev)){
                    const cells=[]; 
                    for(let k=runStart;k<r;k++) cells.push([k,c]);
                    runs.push({cells, dir:'v', length:len, type:prev, used:false});
                }
                runStart = r;
            }
        }
        return runs;
    }

    function dedupeCells(cells){
        const seen = new Set(); 
        const out=[];
        cells.forEach(c=>{ 
            const k=key(c[0],c[1]); 
            if(!seen.has(k)){ seen.add(k); out.push(c); } 
        });
        return out;
    }

    function analyzeMatches(){
        const runs = collectRuns();
        const matchedByLine = new Set();
        runs.forEach(r=> r.cells.forEach(c=> matchedByLine.add(key(c[0],c[1]))));

        const squares = [];
        const usedSquareCells = new Set();
        for(let r=0;r<SIZE-1;r++){
            for(let c=0;c<SIZE-1;c++){
                const cells = [[r,c],[r,c+1],[r+1,c],[r+1,c+1]];
                if(cells.some(cc=> matchedByLine.has(key(cc[0],cc[1])) || usedSquareCells.has(key(cc[0],cc[1])))) continue;
                const t0 = getType(r,c);
                if(!t0 || isNotMatchable(t0)) continue;
                if(cells.every(cc=> getType(cc[0],cc[1])===t0)){
                    squares.push({type:'plane', at:[r,c], cells});
                    cells.forEach(cc=> usedSquareCells.add(key(cc[0],cc[1])));
                }
            }
        }

        const hRuns = runs.filter(r=>r.dir==='h');
        const vRuns = runs.filter(r=>r.dir==='v');
        const bombs = [];
        hRuns.forEach(h=>{
            if(h.used) return;
            for(const v of vRuns){
                if(v.used || v.type!==h.type) continue;
                const shared = h.cells.find(hc=> v.cells.some(vc=> vc[0]===hc[0] && vc[1]===hc[1]));
                if(shared){
                    h.used=true; v.used=true;
                    bombs.push({type:'bomb', at:shared, cells: dedupeCells(h.cells.concat(v.cells))});
                    break;
                }
            }
        });

        const rockets = [], rainbows = [];
        const normalCells = new Set();
        runs.forEach(run=>{
            if(run.used) return;
            if(run.length>=5){
                rainbows.push({type:'rainbow', at: run.cells[Math.floor(run.cells.length/2)], cells: run.cells});
            } else if(run.length===4){
                const spType = run.dir==='h' ? 'rocketCol' : 'rocketRow';
                rockets.push({type: spType, at: run.cells[Math.floor(run.cells.length/2)], cells: run.cells});
            } else {
                run.cells.forEach(c=> normalCells.add(key(c[0],c[1])));
            }
        });

        return {bombs, rockets, rainbows, squares, normalCells};
    }

    // Очистка клеток и продолжение комбо
    function clearAndContinue(clearSet, specialSpawns, scoreSet, onComplete, preventCarpet, forceCarpet, isExplosion){
        specialSpawns = specialSpawns || [];
        const scoring = scoreSet || clearSet;
        let heartsGained=0;
        scoring.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t && t.type==='heart') heartsGained++;
        });

        const finalClearSet = new Set();
        clearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if (t) {
                spawnMatchParticles(r, c, t.type);

                if (t.type === 'box' || t.frozen || t.chained) {
                    damageObstacle(t, r, c, isExplosion);
                } else {
                    finalClearSet.add(k);
                    if (targetType === t.type) hearts++;
                }
            }
        });

        checkAndBreakBoxes(finalClearSet, isExplosion);

        finalClearSet.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t) t.el.classList.add('clearing');
        });

        updateMatch3HUD();
        
        setTimeout(()=>{
            // 1. Очистка уничтоженных фишек во встроенной памяти
            finalClearSet.forEach(k=>{
                const [r,c] = k.split(',').map(Number);
                const t = grid[r][c]; 
                if(t){ t.el.remove(); grid[r][c] = null; }
            });

            // 2. ВОССТАНОВЛЕННЫЙ БЛОК: Рождение бустеров на поле на месте совпадений!
            specialSpawns.forEach(s => {
                const [r, c] = s.at;
                if (!grid[r]) return;
                let t = grid[r][c];
                if (t) {
                    t.el.remove(); // Убираем фишку, которая там была
                }
                grid[r][c] = createTile(r, c, s.type, r); // Спавним новенький бустер
            });

            applyGravityAndRefill();
            setTimeout(()=>{
                const result = analyzeMatches();
                if(!result.normalCells.size && onComplete) onComplete();
                else if(result.normalCells.size) applyResolutionFull(result);
                else { busy = false; checkEndConditions(); }
            }, FALL_MS + 20);
        }, CLEAR_MS);
    }

    function applyResolutionFull(result){
        const specialSpawns = [];
        const scoreSet = new Set();
        result.bombs.forEach(b=>{ b.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:b.at, type:'bomb'}); });
        result.rockets.forEach(rk=>{ rk.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:rk.at, type:rk.type}); });
        result.squares.forEach(sq=>{ sq.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:sq.at, type:'plane'}); });
        result.normalCells.forEach(k=>scoreSet.add(k));
        
        const atKeys = new Set(specialSpawns.map(s=>key(s.at[0], s.at[1])));
        const clearSet = new Set();
        scoreSet.forEach(k=>{ if(!atKeys.has(k)) clearSet.add(k); });
        
        clearAndContinue(clearSet, specialSpawns, scoreSet);
    }

    function comboFootprint(a, b){
        let cells = new Set();
        const kinds = [a.type, b.type];
        const has = t => kinds.includes(t);
        
        if (has('plane') && has('plane')) {
            cells = computeActivationFootprint(a);
            activePlanesCount += doublePlanesActive ? 6 : 3;
            clearAndContinue(cells, [], null, () => {
                for (let i = 0; i < (doublePlanesActive ? 6 : 3); i++) {
                    const target = findBestTargetForPlane(a.row, a.col);
                    if (target) {
                        animatePlaneEffect(a.row, a.col, target.r, target.c, () => {
                            clearAndContinue(new Set([key(target.r, target.c)]), [], null, () => {
                                activePlanesCount--; if(activePlanesCount===0){ busy=false; checkEndConditions(); }
                            }, false, false, true);
                        });
                    }
                }
            }, false, false, true);
            return new Set();
        }

        footprintFor(a).forEach(([r,c])=>cells.add(key(r,c)));
        footprintFor(b).forEach(([r,c])=>cells.add(key(r,c)));
        return cells;
    }

    // Логика активных внутриигровых бустеров
    const ACTIVE_BOOSTER_COSTS = { hammer: 150, glove: 200, broom: 300, weight: 300, fan: 100 };
    let gloveSelectedTile = null;

    function refreshActiveBoostersHUD() {
        if (!window.GameState) return;
        const bTypes = ['hammer', 'glove', 'broom', 'weight', 'fan'];
        bTypes.forEach(type => {
            const elCount = document.getElementById(`count${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (elCount) {
                elCount.textContent = window.GameState.getActiveBoosterCount(type);
            }
        });
    }

    function toggleActiveBooster(type) {
        if (busy) return;
        
        if (type === 'fan') {
            if (window.GameState && window.GameState.useOrBuyActiveBooster('fan', ACTIVE_BOOSTER_COSTS.fan)) {
                shuffleBoard();
                refreshActiveBoostersHUD();
            } else {
                pulseToast("Недостаточно монет!");
            }
            return;
        }

        if (activeBooster === type) {
            activeBooster = null;
            gloveSelectedTile = null;
            setBoosterUI(null);
            return;
        }

        activeBooster = type;
        setBoosterUI(type);
        pulseToast(`Активирован инструмент. Выберите цель!`);
    }

    function setBoosterUI(type) {
        ['Hammer', 'Glove', 'Broom', 'Weight', 'Fan'].forEach(t => {
            const btn = document.getElementById(`btn${t}`);
            if (btn) btn.classList.toggle('active', type === t.toLowerCase());
        });
        if (boardEl) {
            if (type) boardEl.classList.add('aiming');
            else boardEl.classList.remove('aiming');
        }
    }

    function executeBoosterAction(tile) {
        const type = activeBooster;
        const cost = ACTIVE_BOOSTER_COSTS[type];

        if (type === 'glove') {
            if (!gloveSelectedTile) {
                gloveSelectedTile = tile;
                tile.el.classList.add('selected');
                pulseToast("Теперь выберите соседнюю фишку для обмена!");
                return;
            } else {
                const adjacent = Math.abs(gloveSelectedTile.row - tile.row) + Math.abs(gloveSelectedTile.col - tile.col) === 1;
                gloveSelectedTile.el.classList.remove('selected');
                
                if (adjacent && window.GameState && window.GameState.useOrBuyActiveBooster('glove', cost)) {
                    busy = true;
                    swapInGrid(gloveSelectedTile, tile);
                    moveTileTo(gloveSelectedTile, gloveSelectedTile.row, gloveSelectedTile.col);
                    moveTileTo(tile, tile.row, tile.col);
                    
                    setTimeout(() => {
                        applyGravityAndRefill();
                        busy = false;
                    }, SWAP_MS);
                    
                    activeBooster = null;
                    gloveSelectedTile = null;
                    setBoosterUI(null);
                    refreshActiveBoostersHUD();
                } else {
                    gloveSelectedTile = null;
                    pulseToast("Обмен отменен!");
                }
            }
            return;
        }

        if (window.GameState && window.GameState.useOrBuyActiveBooster(type, cost)) {
            activeBooster = null;
            setBoosterUI(null);
            busy = true;
            let cells = new Set();

            if (type === 'hammer') {
                cells.add(key(tile.row, tile.col));
                pulseToast("🔨 Нанесен точечный удар!");
            } else if (type === 'broom') {
                for (let c = 0; c < SIZE; c++) cells.add(key(tile.row, c));
                pulseToast("🧹 Горизонтальный ряд сметен!");
            } else if (type === 'weight') {
                for (let r = 0; r < SIZE; r++) cells.add(key(r, tile.col));
                pulseToast("🥌 Вертикальный ряд раздавлен!");
            }

            clearAndContinue(cells, [], null, null, false, false, true);
            refreshActiveBoostersHUD();
        } else {
            pulseToast("Недостаточно монет!");
            activeBooster = null;
            setBoosterUI(null);
        }
    }

    if (btnHammer) btnHammer.addEventListener('click', () => toggleActiveBooster('hammer'));
    if (btnGlove) btnGlove.addEventListener('click', () => toggleActiveBooster('glove'));
    if (btnBroom) btnBroom.addEventListener('click', () => toggleActiveBooster('broom'));
    if (btnWeight) btnWeight.addEventListener('click', () => toggleActiveBooster('weight'));
    if (btnFan) btnFan.addEventListener('click', () => toggleActiveBooster('fan'));

    // Обработка обычного клика по фишкам
    function onTileClick(e){
        if(busy) return;
        const tile = findTileById(e.currentTarget.dataset.id);
        if(!tile) return;

        resetHintTimer();

        if (activeBooster) {
            executeBoosterAction(tile);
            return;
        }

        if(tile.type === 'box' || tile.frozen || tile.chained) return;

        if(selected === null){
            if(isSpecial(tile.type)) { activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList.add('selected');
            return;
        }
        if(selected === tile){
            selected = null;
            tile.el.classList.remove('selected');
            return;
        }
        const adjacent = Math.abs(selected.row-tile.row) + Math.abs(selected.col-tile.col) === 1;
        selected.el.classList.remove('selected');
        if(!adjacent){
            if(isSpecial(tile.type)){ selected=null; activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList.add('selected');
            return;
        }
        const a = selected, b = tile;
        selected = null;
        performSwap(a,b);
    }

    function swapInGrid(a,b){
        const ar=a.row, ac=a.col, br=b.row, bc=b.col;
        grid[ar][ac]=b; grid[br][bc]=a;
        a.row=br; a.col=bc;
        b.row=ar; b.col=ac;
    }

    function performSwap(a,b){
        busy = true;
        swapInGrid(a,b);
        moveTileTo(a, a.row, a.col);
        moveTileTo(b, b.row, b.col);
        
        setTimeout(()=>{
            const aSpecial = isSpecial(a.type), bSpecial = isSpecial(b.type);
            if(aSpecial && bSpecial){
                moves--; updateMatch3HUD();
                const cells = comboFootprint(a,b);
                clearAndContinue(cells, []);
                return;
            }
            if(aSpecial || bSpecial){
                const special = aSpecial ? a : b;
                const partner = aSpecial ? b : a;
                moves--; updateMatch3HUD();
                let cells;
                if(special.type === 'rainbow'){
                    cells = cellsOfColor(partner.type);
                    cells.add(key(special.row, special.col));
                } else {
                    cells = computeActivationFootprint(special);
                }
                clearAndContinue(cells, [], null, null, false, false, true);
                return;
            }
            const result = analyzeMatches();
            const hasMatch = result.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.size;
            if(!hasMatch){
                swapInGrid(a,b);
                moveTileTo(a, a.row, a.col);
                moveTileTo(b, b.row, b.col);
                a.el.classList.add('shake');
                b.el.classList.add('shake');
                setTimeout(()=>{
                    a.el.classList.remove('shake');
                    b.el.classList.remove('shake');
                    busy = false;
                }, 220);
                pulseToast('Нет совпадения');
                return;
            }
            moves--; updateMatch3HUD();
            applyResolutionFull(result);
        }, SWAP_MS);
    }

    function presentColors() {
        const normalTypes = TYPES.map(t => t.id);
        const colors = new Set();
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && normalTypes.includes(t.type)) colors.add(t.type);
            }
        }
        return Array.from(colors);
    }

    function cellsOfColor(type) {
        const cells = new Set();
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && t.type === type) cells.add(key(r, c));
            }
        }
        return cells;
    }

    function shuffleBoard() {
        const movableTiles = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (levelLayout[r][c] === 1 && t && t.type !== 'box' && t.type !== 'donut' && !t.frozen && !t.chained && !isSpecial(t.type)) {
                    movableTiles.push(t);
                }
            }
        }
        if (movableTiles.length < 2) return;
        const types = movableTiles.map(t => t.type);
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        movableTiles.forEach((tile, idx) => {
            tile.type = types[idx];
            tile.inner.textContent = iconFor(tile.type, tile.boxLayers);
            applySpecialClass(tile);
        });
        triggerBoardShake('shake-mild');
        pulseToast("🌪️ Вентилятор перемешал фишки!");
    }

    function openPreLevelScreen(levelId) {
        const levelData = window.LEVELS ? window.LEVELS[levelId - 1] : null;
        if (!levelData) return;

        currentLevelId = levelId;
        levelDifficulty = levelData.difficulty;
        targetType = levelData.targetType || "heart";
        
        selectedPreBoosters = { rainbow: false, combo: false, doublePlanes: false };
        updatePreBoostersUI();

        carpetGrid = []; iceGrid = []; chainGrid = [];
        for (let r = 0; r < SIZE; r++) {
            carpetGrid.push(new Array(SIZE).fill(false));
            iceGrid.push(new Array(SIZE).fill(0));
            chainGrid.push(new Array(SIZE).fill(0));
        }

        if (levelData.carpetLayout) carpetGrid = JSON.parse(JSON.stringify(levelData.carpetLayout));
        if (levelData.iceLayout) iceGrid = JSON.parse(JSON.stringify(levelData.iceLayout));
        if (levelData.chainLayout) chainGrid = JSON.parse(JSON.stringify(levelData.chainLayout));
        levelLayout = JSON.parse(JSON.stringify(levelData.layout));

        synchronizeObstaclesAndGoals();

        START_MOVES = levelData.moves;

        const title = document.getElementById('preLevelTitle');
        if (title) title.textContent = `Уровень ${currentLevelId}`;

        const goalVal = document.getElementById('preLevelGoalVal');
        if (goalVal) {
            if (targetType === "box") goalVal.textContent = `${GOAL_HEARTS} 📦 Многослойных Ящиков`;
            else if (targetType === "ice") goalVal.textContent = `${GOAL_HEARTS} 🧊 Клеток со Льдом`;
            else goalVal.textContent = `${GOAL_HEARTS} ❤️ Вампирских Сердец`;
        }

        const rewards = getRewards(levelDifficulty);
        const preStars = document.getElementById('preRewardStars');
        if (preStars) preStars.textContent = `⭐ +${rewards.stars}`;
        const preCoins = document.getElementById('preRewardCoins');
        if (preCoins) preCoins.textContent = `💰 +${rewards.base}₽`;

        if (overlayPreLevel) overlayPreLevel.classList.remove('hidden');
    }

    function updatePreBoostersUI() {
        if (!window.GameState) return;
        ['rainbow', 'combo', 'doublePlanes'].forEach(type => {
            const btn = document.getElementById(`preBtn${type.charAt(0).toUpperCase() + type.slice(1)}`);
            const label = document.getElementById(`label${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (btn && label) {
                const count = window.GameState.getPreBoosterCount(type);
                label.textContent = count > 0 ? count : "500₽";
                btn.classList.toggle('selected', selectedPreBoosters[type]);
            }
        });
    }

    ['rainbow', 'combo', 'doublePlanes'].forEach(type => {
        const btn = document.getElementById(`preBtn${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (btn) {
            btn.addEventListener('click', () => {
                const cost = 500;
                if (selectedPreBoosters[type]) {
                    selectedPreBoosters[type] = false;
                } else {
                    if (window.GameState.getPreBoosterCount(type) > 0 || window.GameState.getCash() >= cost) {
                        selectedPreBoosters[type] = true;
                    } else {
                        pulseToast("Недостаточно монет для покупки бустера!");
                    }
                }
                updatePreBoostersUI();
            });
        }
    });

    if (btnStartMatch3) {
        btnStartMatch3.addEventListener('click', () => {
            ['rainbow', 'combo', 'doublePlanes'].forEach(type => {
                if (selectedPreBoosters[type]) {
                    window.GameState.useOrBuyPreBooster(type, 500);
                }
            });

            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            if (window.showScreen) window.showScreen('screenMatch3');

            hearts = 0; boxesBroken = 0; iceMelted = 0; donutsCollected = 0;
            activeBooster = null; gloveSelectedTile = null;
            if (boardEl) boardEl.classList.remove('aiming');
            
            refreshActiveBoostersHUD();

            moves = START_MOVES;
            buildInitialGrid();
            updateMatch3HUD();
        });
    }

    window.openPreLevelScreen = openPreLevelScreen;
    console.log("match3.js: Все модули игры успешно запущены в едином пространстве!");
})();
