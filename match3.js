// ================================================
// match3.js (ХРОНОЛОГИЧЕСКИ УПОРЯДОЧЕННАЯ СБОРКА)
// Полная совместимость со всеми браузерами и WebApp Telegram
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

    // Состояние фаз перекатки
    let isMultiPhase = false;
    let currentPhaseIndex = 0;

    // Состояние игровых слоев
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

    // Режим бустера
    let activeBooster = null; 
    let activePlanesCount = 0;

    // Таймер подсказок (Idle Hint)
    let hintTimeout = null;

    let dragStartX = 0, dragStartY = 0;
    let dragActiveTile = null;

    const boardEl = document.getElementById('board');
    const m3GoalText = document.getElementById('m3GoalText');
    const m3MovesText = document.getElementById('m3MovesText');
    const toastEl = document.getElementById('toast');

    const btnHammer = document.getElementById('btnHammer');
    const btnBroom = document.getElementById('btnBroom');

    const overlayResults = document.getElementById('overlayResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsText = document.getElementById('resultsText');
    const overlayPreLevel = document.getElementById('overlayPreLevel');

    // ИНЖЕКТОР ПРЕМИАЛЬНЫХ ВИЗУАЛЬНЫХ ЭФФЕКТОВ HOMESCAPES
    (function injectPremiumStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Эластичная гравитация - пружинящий эффект при приземлении */
            .tile {
              position: absolute;
              width: calc(100% / var(--size));
              height: calc(100% / var(--size));
              transition: left .24s cubic-bezier(.25,1,.5,1), top .28s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              cursor: pointer;
              z-index: 1;
              will-change: left, top;
            }
            /* Частицы VFX-взрыва */
            .m3-spark {
              position: absolute;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              pointer-events: none;
              z-index: 99;
              transform: scale(1);
              transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out;
              will-change: transform, opacity;
            }
            /* Отдача поля при сильном взрыве */
            @keyframes boardShakeMild {
              0%, 100% { transform: translate(0, 0); }
              20%, 60% { transform: translate(-3px, 2px); }
              40%, 80% { transform: translate(3px, -2px); }
            }
            @keyframes boardShakeIntense {
              0%, 100% { transform: translate(0, 0); }
              10%, 90% { transform: translate(-6px, 4px) rotate(-0.5deg); }
              30%, 70% { transform: translate(6px, -4px) rotate(0.5deg); }
              50% { transform: translate(-2px, 5px) rotate(-1deg); }
            }
            .shake-mild { animation: boardShakeMild 0.3s ease-out; }
            .shake-intense { animation: boardShakeIntense 0.35s ease-out; }

            /* Подсказка - мягкое покачивание фишек */
            @keyframes hintPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1) rotate(3deg); box-shadow: 0 0 8px var(--gold); }
            }
            .match-hint .tile-inner {
              animation: hintPulse 0.8s infinite ease-in-out;
              z-index: 8;
            }

            .tile.chained .tile-inner::after {
              content: "🔗";
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              background: rgba(13, 11, 15, 0.45);
              border-radius: 8px;
              z-index: 7;
              animation: chainPulse 1.2s infinite alternate;
            }
            @keyframes chainPulse {
              from { filter: drop-shadow(0 0 2px #fff); }
              to { filter: drop-shadow(0 0 6px var(--blood)); }
            }
            .grid-cell.portal-entrance {
              border: 2px dashed #00e5ff !important;
              box-shadow: inset 0 0 8px rgba(0, 229, 255, 0.4);
            }
            .grid-cell.portal-exit {
              border: 2px dashed #d500f9 !important;
              box-shadow: inset 0 0 8px rgba(213, 0, 249, 0.4);
            }
        `;
        document.head.appendChild(style);
    })();

    // Хелперы вычислений
    const isSpecial = t => SPECIALS.includes(t);
    const randType = () => TYPES[Math.floor(Math.random()*TYPES.length)].id;
    const key = (r,c) => r+','+c;
    const getType = (r,c) => grid[r] && grid[r][c] ? grid[r][c].type : null;

    // РАСЧЕТ НАГРАД ЗА УРОВЕНЬ
    function getRewards(diff) {
        let starsGained = 1;
        let baseCoins = 100;

        if (diff === "medium") {
            baseCoins = 150;
        } else if (diff === "hard") {
            baseCoins = 250;
        } else if (diff === "extreme") {
            baseCoins = 400;
        } else if (diff === "challenge") {
            starsGained = 3;
            baseCoins = 300;
        }

        let bonusCoins = moves * 10; 
        let totalCoins = baseCoins + bonusCoins;

        return { stars: starsGained, coins: totalCoins, base: baseCoins, bonus: bonusCoins };
    }

    // ТРЯСКА ПОЛЯ (SCREEN SHAKE)
    function triggerBoardShake(intensityClass = 'shake-mild') {
        boardEl.classList.remove('shake-mild', 'shake-intense');
        void boardEl.offsetWidth; 
        boardEl.classList.add(intensityClass);
        setTimeout(() => {
            boardEl.classList.remove('shake-mild', 'shake-intense');
        }, 350);
    }

    // СПАВН ЧАСТИЦ (VFX SPARKS)
    function spawnMatchParticles(r, c, type) {
        const count = 6;
        const colorPalette = {
            heart: '#ff2e93',
            bullet: '#2ecc71',
            garlic: '#f1c40f',
            stake: '#3498db',
            vial: '#9b59b6',
            coin: '#f39c12',
            donut: '#ff85a2'
        };
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

            const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4 - 0.2);
            const force = 30 + Math.random() * 35;
            const targetX = Math.cos(angle) * force;
            const targetY = Math.sin(angle) * force;

            setTimeout(() => {
                spark.style.transform = `translate(${targetX}px, ${targetY}px) scale(0)`;
                spark.style.opacity = '0';
            }, 20);

            setTimeout(() => spark.remove(), 420);
        }
    }

    function iconFor(type){
        switch(type){
            case 'bomb': return '💣';
            case 'rocketRow': return '🚀';
            case 'rocketCol': return '🚀';
            case 'plane': return '✈️';
            case 'rainbow': return '🌈';
            case 'box': return '📦';
            case 'donut': return '🍩';
            // Блокирующие препятствия
            case 'vase': return '🏺';       
            case 'brick': return '🧱';      
            // Цели сбора
            case 'apple': return '🍎';      
            case 'cherry': return '🍒';     
            case 'nut': return '🥜';        
            case 'ring': return '💍';       
            case 'cheese': return '🧀';     
            case 'book': return '📖';       
            // Интерактивные элементы
            case 'compass': return '🧭';    
            case 'pinata': return '🪅';     
            case 'capsule': return '💊';    
            case 'jester': return '🃏';     
            // Угрозы
            case 'foam': return '🧼';       
            case 'ivy': return '🌿';        
            case 'steam': return '💨';      
            case 'parrot': return '🦜';     
            default: return TYPES.find(t=>t.id===type).icon;
        }
    }

    function applySpecialClass(t){
        t.el.classList.remove('bomb','rocket-row','rocket-col','plane','rainbow', 'box', 'frozen', 'chained', 'webbed', 'steam-layer');
        if(t.type==='bomb') t.el.classList.add('bomb');
        else if(t.type==='rocketRow') t.el.classList.add('rocket-row');
        else if(t.type==='rocketCol') t.el.classList.add('rocket-col');
        else if(t.type==='plane') t.el.classList.add('plane');
        else if(t.type==='rainbow') t.el.classList.add('rainbow');
        else if(t.type==='box') t.el.classList.add('box');
        
        if(t.type==='brick') t.el.classList.add('brick-obstacle');
        if(t.type==='foam') t.el.classList.add('foam-threat');
        if(t.type==='ivy') t.el.classList.add('ivy-threat');
        
        if(t.frozen) t.el.classList.add('frozen');
        if(t.chained) t.el.classList.add('chained');
        if(t.webbed) t.el.classList.add('webbed'); 
        if(t.steam) t.el.classList.add('steam-layer'); 
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

    // ТАЙМЕРЫ ИСКУССТВЕННЫХ ПОДСКАЗОК
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
        for (let r = 0; r < SIZE - 1; r++) {
            for (let c = 0; c < SIZE; c++) {
                const a = grid[r][c];
                const b = grid[r+1][c];
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

    function handleDragEnd() {
        dragActiveTile = null;
    }

    function createTile(row, col, type, spawnRow){
        const id = 'tile'+(tileIdCounter++);
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.id = id;
        const inner = document.createElement('div');
        inner.className = 'tile-inner';
        inner.textContent = iconFor(type);
        el.appendChild(inner);

        const isFrozen = iceGrid[row] && iceGrid[row][col] === 1;
        const isChained = chainGrid[row] && chainGrid[row][col] === 1;

        const tile = {id, type, row, col, el, inner, frozen: isFrozen, chained: isChained};

        el.addEventListener('mousedown', (e) => handleDragStart(e, tile));
        el.addEventListener('touchstart', (e) => handleDragStart(e, tile), {passive: true});
        el.addEventListener('click', onTileClick);

        if(spawnRow !== undefined && spawnRow !== row){
            el.style.transition = 'none';
            setTilePos(el, spawnRow, col);
        } else {
            setTilePos(el, row, col);
        }

        boardEl.appendChild(el);

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

    function footprintFor(tile){
        const cells = [];
        if(tile.type==='bomb'){
            for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
                const rr=tile.row+dr, cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
            }
        } else if(tile.type==='rocketRow'){
            for(let c=0;c<SIZE;c++) cells.push([tile.row,c]);
        } else if(tile.type==='rocketCol'){
            for(let r=0;r<SIZE;r++) cells.push([r,tile.col]);
        } else if(tile.type==='plane'){
            cells.push([tile.row,tile.col]);
            [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{
                const rr=tile.row+dr, cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
            });
            const candidates = [];
            for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
                if(grid[r][c] && !(r===tile.row && c===tile.col) && grid[r][c].type !== 'box') candidates.push([r,c]);
            }
            if(candidates.length) cells.push(candidates[Math.floor(Math.random()*candidates.length)]);
        } else if(tile.type==='rainbow'){
            cells.push([tile.row,tile.col]);
        }
        return cells;
    }

    function computeActivationFootprint(startTile){
        const visited = new Set([startTile.id]);
        const footprint = new Set();
        const queue = [startTile];
        while(queue.length){
            const t = queue.shift();
            footprintFor(t).forEach(([r,c]) => {
                footprint.add(key(r, c));
                const other = grid[r] && grid[r][c];
                if(other && isSpecial(other.type) && !visited.has(other.id)){
                    visited.add(other.id);
                    queue.push(other);
                }
            });
        }
        return footprint;
    }

    function checkAndBreakBoxes(clearSet) {
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
                levelLayout[br][bc] = 1;
                boxTile.el.classList.add('clearing');
                
                if (targetType === "box") {
                    boxesBroken++;
                }

                setTimeout(() => {
                    if (grid[br][bc] === boxTile) {
                        boxTile.el.remove();
                        grid[br][bc] = null;
                    }
                }, CLEAR_MS);
            }
        });
        return boxesToBreak;
    }

    function spreadCarpetAt(r, c) {
        if (levelLayout[r] && levelLayout[r][c] === 1 && !carpetGrid[r][c]) {
            carpetGrid[r][c] = true;
            const cellEl = document.querySelector(`.grid-cell[data-pos="${r},${c}"]`);
            if (cellEl) {
                cellEl.classList.add('carpet');
            }
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
                
                setTimeout(((tileToKill) => {
                    return () => {
                        tileToKill.el.remove();
                    };
                })(t), CLEAR_MS);
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

        // Поведение попугая (Parrot) - взлетает на 1 клетку вверх, если над ним пусто
        for (let r = 1; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && t.type === 'parrot' && grid[r-1][c] === null) {
                    grid[r-1][c] = t;
                    grid[r][c] = null;
                    moveTileTo(t, r - 1, c);
                }
            }
        }

        // Логика растекания мыльной пены (Foam) и плюща (Ivy)
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && (t.type === 'foam' || t.type === 'ivy') && !spawnedFoam) {
                    const neighbors = [
                        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
                    ];
                    for (const [nr, nc] of neighbors) {
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr][nc] !== null && !isSpecial(grid[nr][nc].type) && grid[nr][nc].type !== 'box' && grid[nr][nc].type !== 'donut') {
                            const victim = grid[nr][nc];
                            victim.el.remove();
                            grid[nr][nc] = createTile(nr, nc, t.type, nr);
                            spawnedFoam = true;
                            pulseToast(t.type === 'foam' ? "🧼 Мыльная пена растекается!" : "🌿 Плющ прорастает!");
                            break;
                        }
                    }
                }
            }
        }

        // Поведение Шута (Jester) - прыгает на случайную пустую клетку
        let jesterTile = null;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] && grid[r][c].type === 'jester') {
                    jesterTile = grid[r][c];
                    break;
                }
            }
        }
        if (jesterTile) {
            const emptyCells = [];
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (levelLayout[r][c] === 1 && grid[r][c] === null) {
                        emptyCells.push({r, c});
                    }
                }
            }
            if (emptyCells.length > 0) {
                const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                grid[jesterTile.row][jesterTile.col] = null;
                grid[target.r][target.c] = jesterTile;
                moveTileTo(jesterTile, target.r, target.c);
                pulseToast("🃏 Шут переместился!");
            }
        }
    }

    function buildInitialGrid(){
        boardEl.innerHTML = '';
        grid = [];
        for(let r=0;r<SIZE;r++) grid.push(new Array(SIZE).fill(null));

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (levelLayout[r][c] !== 0) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.dataset.pos = `${r},${c}`; 

                    if (carpetGrid[r] && carpetGrid[r][c]) {
                        cell.classList.add('carpet');
                    }

                    // Визуализация порталов
                    const cellKey = key(r, c);
                    if (portals[cellKey]) {
                        cell.classList.add('portal-exit');
                        const entranceKey = portals[cellKey];
                        setTimeout(() => {
                            const entCell = document.querySelector(`.grid-cell[data-pos="${entranceKey}"]`);
                            if (entCell) entCell.classList.add('portal-entrance');
                        }, 50);
                    }

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
                    grid[r][c] = createTile(r, c, t, r - SIZE - Math.floor(Math.random()*4));
                }
            }
        }
    }

    // ПОШАГОВЫЙ СИМУЛЯТОР ГРАВИТАЦИИ С ПОРТАЛАМИ И ПОНЧИКАМИ
   // ПОШАГОВЫЙ СИМУЛЯТОР ГРАВИТАЦИИ С ДИАГОНАЛЬНЫМ ЗАТЕКАНИЕМ (HOMESCAPES STYLE)
    function applyGravityAndRefill(){
        let moved = true;
        let loops = 0;
        const maxLoops = 25; // Увеличили лимит циклов для плавного затекания

        while (moved && loops < maxLoops) {
            moved = false;
            loops++;

            for (let r = SIZE - 1; r >= 0; r--) {
                for (let c = 0; c < SIZE; c++) {
                    if (levelLayout[r][c] === 1 && grid[r][c] === null) {
                        
                        let sourceRow = -1;
                        let sourceCol = c;

                        // 1. Попытка вертикального падения (Приоритет)
                        const cellKey = key(r, c);
                        if (portals[cellKey]) {
                            const [ep_r, ep_c] = portals[cellKey].split(',').map(Number);
                            sourceRow = ep_r;
                            sourceCol = ep_c;
                        } else {
                            for (let checkR = r - 1; checkR >= 0; checkR--) {
                                if (levelLayout[checkR][c] === 2) {
                                    break; // Заблокировано ящиком сверху
                                }
                                if (levelLayout[checkR][c] === 1) {
                                    sourceRow = checkR;
                                    break;
                                }
                            }
                        }

                        if (sourceRow >= 0 && sourceRow < SIZE && sourceCol >= 0 && sourceCol < SIZE) {
                            const t = grid[sourceRow][sourceCol];
                            if (t && t.type !== 'box' && !t.frozen && !t.chained) {
                                grid[r][c] = t;
                                grid[sourceRow][sourceCol] = null;
                                moveTileTo(t, r, c);
                                moved = true;
                                continue; // Успешно заполнили клетку вертикально
                            }
                        }

                        // 2. Диагональный затек по бокам (если вертикальный путь заблокирован льдом/ящиком)
                        if (grid[r][c] === null && !portals[cellKey]) {
                            const sideDirections = [-1, 1]; // Влево-вверх и Вправо-вверх
                            if (Math.random() < 0.5) sideDirections.reverse(); // Рандомизируем направления

                            for (const dc of sideDirections) {
                                const diagCol = c + dc;
                                const diagRow = r - 1;

                                if (diagRow >= 0 && diagCol >= 0 && diagCol < SIZE) {
                                    if (levelLayout[diagRow][diagCol] === 1) {
                                        const t = grid[diagRow][diagCol];
                                        // Переливаться могут только свободные фишки
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

            // Наполнение колонок из спавнеров
            for (let c = 0; c < SIZE; c++) {
                let topRow = -1;
                for (let r = 0; r < SIZE; r++) {
                    if (levelLayout[r][c] === 1) {
                        topRow = r;
                        break;
                    }
                }
                
                if (topRow !== -1 && grid[topRow][c] === null) {
                    let spawnType = randType();
                    if (targetType === "donut" && countActiveDonuts() < 2 && Math.random() < 0.20) {
                        spawnType = "donut";
                    }
                    grid[topRow][c] = createTile(topRow, c, spawnType, topRow - 1);
                    moved = true;
                }
            }
        }

        collectDoughnuts();
        processThreatsAndJesters();
        resetHintTimer(); 
    }
            // Динамический спавн фишек в наивысшей доступной точке каждой колонки
            for (let c = 0; c < SIZE; c++) {
                let topRow = -1;
                for (let r = 0; r < SIZE; r++) {
                    if (levelLayout[r][c] === 1) {
                        topRow = r;
                        break;
                    }
                }
                
                if (topRow !== -1 && grid[topRow][c] === null) {
                    let spawnType = randType();
                    if (targetType === "donut" && countActiveDonuts() < 2 && Math.random() < 0.20) {
                        spawnType = "donut";
                    }
                    grid[topRow][c] = createTile(topRow, c, spawnType, topRow - 1);
                    moved = true;
                }
            }
        }

        collectDoughnuts();
        processThreatsAndJesters();
        resetHintTimer(); 
    }

    function hasPossibleMoves() {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && isSpecial(t.type)) return true;
            }
        }

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (!t || t.type === 'box' || t.type === 'donut') continue;

                const neighbors = [[r + 1, c], [r, c + 1]];
                for (const [nr, nc] of neighbors) {
                    if (nr < SIZE && nc < SIZE) {
                        const nt = grid[nr][nc];
                        if (nt && nt.type !== 'box' && nt.type !== 'donut') {
                            
                            grid[r][c] = nt;
                            grid[nr][nc] = t;

                            const runs = collectRuns();
                            const hasMatch = runs.length > 0;

                            grid[r][c] = t;
                            grid[nr][nc] = nt;

                            if (hasMatch) return true; 
                        }
                    }
                }
            }
        }
        return false; 
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
        } else if (targetType === "donut") {
            m3GoalText.textContent = `${donutsCollected}/${GOAL_HEARTS} 🍩`;
        } else if (["vase", "apple", "cherry", "nut", "ring", "cheese", "book", "pinata", "capsule"].includes(targetType)) {
            m3GoalText.textContent = `${hearts}/${GOAL_HEARTS} ${iconFor(targetType)}`;
        } else {
            m3GoalText.textContent = `${hearts}/${GOAL_HEARTS} ❤️`;
        }
    }

    function checkEndConditions(){
        let isVictory = false;
        if (targetType === "carpet") {
            let currentCarpetCount = 0;
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (carpetGrid[r][c]) currentCarpetCount++;
                }
            }
            isVictory = currentCarpetCount >= GOAL_HEARTS;
        } else if (targetType === "box") {
            isVictory = boxesBroken >= GOAL_HEARTS;
        } else if (targetType === "ice") {
            isVictory = iceMelted >= GOAL_HEARTS;
        } else if (targetType === "donut") {
            isVictory = donutsCollected >= GOAL_HEARTS;
        } else if (["vase", "apple", "cherry", "nut", "ring", "cheese", "book", "pinata", "capsule"].includes(targetType)) {
            isVictory = hearts >= GOAL_HEARTS;
        } else {
            isVictory = hearts >= GOAL_HEARTS;
        }

        if(isVictory){
            clearTimeout(hintTimeout); // Отключаем подсказки при победе
            const rewards = getRewards(levelDifficulty);
            
            if (window.GameState) {
                window.GameState.addStars(rewards.stars);
                window.GameState.addCash(rewards.coins);
            }

            const winText = `Заказ выполнен!\n\nВы получили: ⭐ +${rewards.stars}\nБазовая награда: 💰 +${rewards.base}₽\nБонус за ходы (${moves} шт.): 💰 +${rewards.bonus}₽\nИтого: +${rewards.coins}₽`;

            const dialogueWin = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].win : null;
            if (window.NovelEngine && dialogueWin) {
                window.NovelEngine.run(dialogueWin, () => {
                    showOverlay('Успешный улов!', winText);
                });
            } else {
                showOverlay('Успешный улов!', winText);
            }
            return;
        }

        if(moves <= 0){
            clearTimeout(hintTimeout); // Отключаем подсказки при проигрыше
            if (window.GameState) {
                window.GameState.loseLife(); 
            }

            const dialogueLose = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].lose : null;
            const loseText = `Тебе не хватило ходов.\n\nЖизнь: -1 ❤️`;

            if (window.NovelEngine && dialogueLose) {
                window.NovelEngine.run(dialogueLose, () => {
                    showOverlay('Слитый бой...', loseText);
                });
            } else {
                showOverlay('Слитый бой...', loseText);
            }
            return;
        }

        if (!hasPossibleMoves()) {
            shuffleBoard();
        }
    }

    function clearAndContinue(clearSet, specialSpawns, scoreSet, onComplete, preventCarpet, forceCarpet, isExplosion){
        specialSpawns = specialSpawns || [];
        const scoring = scoreSet || clearSet;
        let heartsGained=0;
        scoring.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(!t) return;
            if(t.type==='heart') heartsGained++;
        });

        // 1. Проверяем наличие ковра в текущей зоне очистки
        let hasCarpetInMatch = forceCarpet || false;
        if (!preventCarpet && !hasCarpetInMatch) {
            clearSet.forEach(k => {
                const [r, c] = k.split(',').map(Number);
                if (carpetGrid[r] && carpetGrid[r][c]) {
                    hasCarpetInMatch = true;
                }
            });
        }

        const finalClearSet = new Set();
        const brokenBoxes = new Set();

        // 2. Раскол льда, снятие цепей, взлом ящиков, спавн искр-частиц и сложных механизмов
        clearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if (t) {
                // Вызываем сочные искры при уничтожении
                spawnMatchParticles(r, c, t.type);

                // Паутина (Web) - рвется при любом матче/взрыве
                if (t.webbed) {
                    t.webbed = false;
                    t.el.classList.remove('webbed');
                    return;
                }

                // Пар (Steam) - убирается при воздействии
                if (t.steam) {
                    t.steam = false;
                    t.el.classList.remove('steam-layer');
                }

                if (t.frozen) {
                    t.frozen = false;
                    iceGrid[r][c] = 0;
                    t.el.classList.remove('frozen');
                    if (targetType === "ice") {
                        iceMelted++;
                    }
                } else if (t.chained) {
                    const isRegular = !isSpecial(t.type) && t.type !== 'donut';
                    if (isRegular || isExplosion) {
                        t.chained = false;
                        chainGrid[r][c] = 0;
                        t.el.classList.remove('chained');
                        pulseToast("🔗 Цепь разбита!");
                    }
                } else if (t.type === 'box' || t.type === 'vase') {
                    levelLayout[r][c] = 1; 
                    t.el.classList.add('clearing');
                    if (targetType === t.type) hearts++;
                    setTimeout(() => {
                        if (grid[r][c] === t) {
                            t.el.remove();
                            grid[r][c] = null;
                        }
                    }, CLEAR_MS);
                } else if (t.type === 'brick') {
                    // Кирпич: убирается ТОЛЬКО при взрывах (isExplosion)
                    if (isExplosion) {
                        levelLayout[r][c] = 1;
                        t.el.classList.add('clearing');
                        setTimeout(() => {
                            if (grid[r][c] === t) { t.el.remove(); grid[r][c] = null; }
                        }, CLEAR_MS);
                    }
                } else if (t.type === 'capsule') {
                    // Капсула: при разрушении спавнит 2 случайных бонуса
                    levelLayout[r][c] = 1;
                    t.el.classList.add('clearing');
                    setTimeout(() => {
                        if (grid[r][c] === t) {
                            t.el.remove();
                            grid[r][c] = null;
                            spawnBonusAt(r, c, 'bomb');
                            spawnBonusAt(Math.max(0, r - 1), c, 'plane');
                        }
                    }, CLEAR_MS);
                } else {
                    finalClearSet.add(k);
                    if (targetType === t.type) {
                        hearts++;
                    }
                }
            }
        });

        // Вспомогательная функция спавна бонуса на поле при взрыве капсулы
        function spawnBonusAt(row, col, bonusType) {
            if (grid[row] && grid[row][col] === null) {
                grid[row][col] = createTile(row, col, bonusType, row);
            }
        }

        // 3. Обработка соседних Homescapes-элементов (собираются матчами рядом)
        finalClearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const neighbors = [
                [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
            ];

            neighbors.forEach(([nr, nc]) => {
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                    const t = grid[nr][nc];
                    if (t) {
                        // Собираемые рядом фрукты/предметы: Яблоки, Вишни, Сыр, Книги
                        if (['apple', 'cherry', 'cheese', 'book'].includes(t.type)) {
                            t.el.classList.add('clearing');
                            if (targetType === t.type) hearts++;
                            setTimeout(() => {
                                if (grid[nr][nc] === t) { t.el.remove(); grid[nr][nc] = null; }
                            }, CLEAR_MS);
                        }
                        // Орехи - собираются ТОЛЬКО бонусами
                        else if (t.type === 'nut' && isExplosion) {
                            t.el.classList.add('clearing');
                            if (targetType === 'nut') hearts++;
                            setTimeout(() => {
                                if (grid[nr][nc] === t) { t.el.remove(); grid[nr][nc] = null; }
                            }, CLEAR_MS);
                        }
                        // Кольцо в футляре (Ring) - требует 2 хита
                        else if (t.type === 'ring') {
                            if (!t.damagedOnce) {
                                t.damagedOnce = true;
                                t.inner.textContent = '💍✨'; // Открываем футляр
                            } else {
                                t.el.classList.add('clearing');
                                if (targetType === 'ring') hearts++;
                                setTimeout(() => {
                                    if (grid[nr][nc] === t) { t.el.remove(); grid[nr][nc] = null; }
                                }, CLEAR_MS);
                            }
                        }
                    }
                }
            });
        });

        const activeBrokenBoxes = checkAndBreakBoxes(finalClearSet);

        finalClearSet.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t) t.el.classList.add('clearing');
        });

        if (targetType === "heart") {
            hearts += heartsGained;
        }

        // 4. Покрытие коврами
        if (!preventCarpet && hasCarpetInMatch) {
            clearSet.forEach(k => {
                const [r, c] = k.split(',').map(Number);
                spreadCarpetAt(r, c);
            });
            activeBrokenBoxes.forEach(k => {
                const [r, c] = k.split(',').map(Number);
                spreadCarpetAt(r, c);
            });
        }
        
        updateMatch3HUD();
        
        if(heartsGained > 0 && targetType === "heart") {
            pulseToast('+' + heartsGained + ' ❤️');
        }
        
        setTimeout(()=>{
            finalClearSet.forEach(k=>{
                const [r,c] = k.split(',').map(Number);
                const t = grid[r] && grid[r][c];
                if(t){ t.el.remove(); grid[r][c]=null; }
            });
            specialSpawns.forEach(s=>{
                const [r,c] = s.at;
                if(!grid[r]) return;
                let t = grid[r][c];
                if(!t){
                    t = createTile(r,c,s.type,r);
                    grid[r][c] = t;
                } else {
                    t.type = s.type;
                    t.inner.textContent = iconFor(s.type);
                    applySpecialClass(t);
                }
            });
            applyGravityAndRefill();
            
            setTimeout(()=>{
                const result = analyzeMatches();
                const hasMore = result.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.size;
                
                if (onComplete) {
                    onComplete();
                }

                if(!hasMore){
                    if (activePlanesCount === 0) {
                        busy = false;
                        checkEndConditions();
                    }
                } else {
                    applyResolutionFull(result);
                }
            }, FALL_MS + 20); 
        }, CLEAR_MS);
    }

    function applyResolutionFull(result){
        const specialSpawns = [];
        const scoreSet = new Set();
        result.bombs.forEach(b=>{ b.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:b.at, type:'bomb'}); });
        result.rockets.forEach(rk=>{ rk.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:rk.at, type:rk.type}); });
        result.rainbows.forEach(rb=>{ rb.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:rb.at, type:'rainbow'}); });
        result.squares.forEach(sq=>{ sq.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:sq.at, type:'plane'}); });
        result.normalCells.forEach(k=>scoreSet.add(k));
        
        const atKeys = new Set(specialSpawns.map(s=>key(s.at[0], s.at[1])));
        const clearSet = new Set();
        scoreSet.forEach(k=>{ if(!atKeys.has(k)) clearSet.add(k); });
        
        if(specialSpawns.length) {
            pulseToast(specialSpawns.length>1 ? 'Комбо бонусов!' : 'Новый бонус!');
            triggerBoardShake('shake-mild');
        }
        clearAndContinue(clearSet, specialSpawns, scoreSet);
    }

    function comboFootprint(a, b){
        let cells = new Set();
        const kinds = [a.type, b.type];
        const has = t => kinds.includes(t);
        const isRocket = t => t === 'rocketRow' || t === 'rocketCol';
        
        if (has('rainbow') && (has('bomb') || has('rocketRow') || has('rocketCol') || has('plane'))) {
            const boosterType = a.type === 'rainbow' ? b.type : a.type;
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random() * colors.length)] : null;
            
            if (color) {
                const targets = [];
                for (let r = 0; r < SIZE; r++) {
                    for (let c = 0; c < SIZE; c++) {
                        if (grid[r][c] && grid[r][c].type === color) {
                            targets.push({ r, c });
                        }
                    }
                }

                animateRainbowTentacles(a.row, a.col, targets, color);

                setTimeout(() => {
                    targets.forEach(({r, c}) => {
                        const tile = grid[r][c];
                        if (tile) {
                            tile.type = boosterType;
                            tile.inner.textContent = iconFor(boosterType);
                            applySpecialClass(tile);

                            setTimeout(() => {
                                activateStandalone(tile);
                            }, Math.random() * 200 + 50);
                        }
                    });
                }, 350);
            }

            cells.add(key(a.row, a.col));
            cells.add(key(b.row, b.col));
            pulseToast('🌈 СУПЕР-КОМБО: Парад бонусов!');
            return cells;
        }

        if (has('plane') && has('plane')) {
            cells = computeActivationFootprint(a); 
            
            const comboCarpet = (carpetGrid[a.row] && carpetGrid[a.row][a.col]) || (carpetGrid[b.row] && carpetGrid[b.row][b.col]);
            activePlanesCount += 3;

            clearAndContinue(cells, [], null, () => {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const target = findBestTargetForPlane(a.row, a.col);
                        if (target) {
                            animatePlaneEffect(a.row, a.col, target.r, target.c, () => {
                                const targetCell = new Set([key(target.r, target.c)]);
                                if (comboCarpet) {
                                    spreadCarpetAt(target.r, target.c);
                                }
                                clearAndContinue(targetCell, [], null, () => {
                                    activePlanesCount--;
                                    if (activePlanesCount === 0) {
                                        busy = false;
                                        checkEndConditions();
                                    }
                                }, false, comboCarpet, true);
                            });
                        } else {
                            activePlanesCount--;
                            if (activePlanesCount === 0) {
                                busy = false;
                                checkEndConditions();
                            }
                        }
                    }, i * 120);
                }
            }, false, comboCarpet, true);

            pulseToast('✈️ Эскадрилья самолётиков!');
            return new Set(); 
        }

        if (has('plane') && (has('bomb') || has('rocketRow') || has('rocketCol'))) {
            const boosterType = a.type === 'plane' ? b.type : a.type;
            const plane = a.type === 'plane' ? a : b;

            const comboCarpet = (carpetGrid[a.row] && carpetGrid[a.row][a.col]) || (carpetGrid[b.row] && carpetGrid[b.row][b.col]);
            cells = computeActivationFootprint(plane); 
            
            activePlanesCount++;

            clearAndContinue(cells, [], null, () => {
                const target = findBestTargetForPlane(plane.row, plane.col);
                if (target) {
                    animatePlaneEffect(plane.row, plane.col, target.r, target.c, () => {
                        const dummyTile = { type: boosterType, row: target.r, col: target.c, id: 'dummy' };
                        let blastCells = new Set();

                        if (boosterType === 'bomb') {
                            animateBombEffect(target.r, target.c);
                            footprintFor(dummyTile).forEach(([r,c]) => blastCells.add(key(r,c)));
                        } else if (boosterType === 'rocketRow') {
                            animateRocketEffect(target.r, target.c, true);
                            footprintFor(dummyTile).forEach(([r,c]) => blastCells.add(key(r,c)));
                        } else {
                            animateRocketEffect(target.r, target.c, false);
                            footprintFor(dummyTile).forEach(([r,c]) => blastCells.add(key(r,c)));
                        }
                        
                        if (comboCarpet) {
                            spreadCarpetAt(target.r, target.c);
                        }

                        clearAndContinue(blastCells, [], null, () => {
                            activePlanesCount--;
                            if (activePlanesCount === 0) {
                                busy = false;
                                checkEndConditions();
                            }
                        }, false, comboCarpet, true);
                    });
                } else {
                    activePlanesCount--;
                    if (activePlanesCount === 0) {
                        busy = false;
                        checkEndConditions();
                    }
                }
            }, false, comboCarpet, true);

            pulseToast('📦 Доставка взрывчатки!');
            return new Set();
        }

        if(has('bomb') && has('bomb')){
            const center = a;
            animateBombEffect(center.row, center.col);
            for(let dr=-3;dr<=3;dr++) for(let dc=-3;dc<=3;dc++){
                const rr=center.row+dr, cc=center.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.add(key(rr,cc));
            }
            pulseToast('💥 Ультра-бомба 7×7!');
            return cells;
        }
        if(has('bomb') && (has('rocketRow')||has('rocketCol'))){
            const rocket = isRocket(a.type) ? a : b;
            animateRocketEffect(rocket.row, rocket.col, true);
            animateRocketEffect(rocket.row, rocket.col, false);
            for(let dr=-1;dr<=1;dr++){ 
                const rr=rocket.row+dr; 
                if(rr>=0&&rr<SIZE) for(let c=0;c<SIZE;c++) cells.add(key(rr,c)); 
            }
            for(let dc=-1;dc<=1;dc++){ 
                const cc=rocket.col+dc; 
                if(cc>=0&&cc<SIZE) for(let r=0;r<SIZE;r++) cells.add(key(r,cc)); 
            }
            pulseToast('🧨 Тройные полосы!');
            return cells;
        }
        if(has('rocketRow') || has('rocketCol')){
            animateRocketEffect(a.row, a.col, true);
            animateRocketEffect(a.row, a.col, false);
            for(let i=0; i<SIZE; i++){
                cells.add(key(a.row, i));
                cells.add(key(i, a.col));
            }
            pulseToast('🚀 Крестообразный удар!');
            return cells;
        }
        if(has('rainbow') && has('rainbow')){
            for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(grid[r][c]) cells.add(key(r,c));
            pulseToast('🌈 Полная зачистка!');
            return cells;
        }

        footprintFor(a).forEach(([r,c])=>cells.add(key(r,c)));
        footprintFor(b).forEach(([r,c])=>cells.add(key(r,c)));
        return cells;
    }

    function transitionToNextPhase() {
        busy = true;
        currentPhaseIndex++;
        pulseToast(`➔ Фаза ${currentPhaseIndex + 1}!`);

        boardEl.classList.add('scroll-out');

        setTimeout(() => {
            const phaseData = window.LEVELS[currentLevelId - 1].phases[currentPhaseIndex];
            GOAL_HEARTS = phaseData.heartsGoal;
            levelLayout = JSON.parse(JSON.stringify(phaseData.layout));
            hearts = 0; 
            boxesBroken = 0;
            iceMelted = 0;
            donutsCollected = 0;

            targetType = phaseData.targetType || "heart";
            
            carpetGrid = [];
            iceGrid = [];
            chainGrid = [];
            portals = {};
            for (let r = 0; r < SIZE; r++) {
                carpetGrid.push(new Array(SIZE).fill(false));
                iceGrid.push(new Array(SIZE).fill(0));
                chainGrid.push(new Array(SIZE).fill(0));
            }

            if (phaseData.carpetLayout) carpetGrid = JSON.parse(JSON.stringify(phaseData.carpetLayout));
            if (phaseData.iceLayout) iceGrid = JSON.parse(JSON.stringify(phaseData.iceLayout));
            if (phaseData.chainLayout) chainGrid = JSON.parse(JSON.stringify(phaseData.chainLayout));
            if (phaseData.portals) portals = JSON.parse(JSON.stringify(phaseData.portals));

            boardEl.classList.remove('scroll-out');
            boardEl.classList.add('scroll-in');

            buildInitialGrid();
            updateMatch3HUD();

            setTimeout(() => {
                boardEl.classList.remove('scroll-in');
                
                if (!hasPossibleMoves()) {
                    shuffleBoard();
                } else {
                    busy = false;
                }
            }, 50);
        }, 250);
    }

    function openPreLevelScreen(levelId) {
        const levelData = window.LEVELS ? window.LEVELS[levelId - 1] : null;
        if (!levelData) {
            console.error("Не удалось найти данные уровня в window.LEVELS:", levelId);
            return;
        }

        currentLevelId = levelId;
        levelDifficulty = levelData.difficulty;
        targetType = levelData.targetType || "heart";
        
        carpetGrid = [];
        iceGrid = [];
        chainGrid = [];
        portals = {};
        for (let r = 0; r < SIZE; r++) {
            carpetGrid.push(new Array(SIZE).fill(false));
            iceGrid.push(new Array(SIZE).fill(0));
            chainGrid.push(new Array(SIZE).fill(0));
        }

        if (levelData.carpetLayout && levelData.carpetLayout.length > 0) {
            carpetGrid = JSON.parse(JSON.stringify(levelData.carpetLayout));
        }
        if (levelData.iceLayout && levelData.iceLayout.length > 0) {
            iceGrid = JSON.parse(JSON.stringify(levelData.iceLayout));
        }
        if (levelData.chainLayout && levelData.chainLayout.length > 0) {
            chainGrid = JSON.parse(JSON.stringify(levelData.chainLayout));
        }
        if (levelData.portals) {
            portals = JSON.parse(JSON.stringify(levelData.portals));
        }

        if (levelData.phases && levelData.phases.length > 0) {
            isMultiPhase = true;
            currentPhaseIndex = 0;
            GOAL_HEARTS = levelData.phases[0].heartsGoal;
            levelLayout = JSON.parse(JSON.stringify(levelData.phases[0].layout));
            
            const firstPhase = levelData.phases[0];
            targetType = firstPhase.targetType || "heart";
            if (firstPhase.carpetLayout) carpetGrid = JSON.parse(JSON.stringify(firstPhase.carpetLayout));
            if (firstPhase.iceLayout) iceGrid = JSON.parse(JSON.stringify(firstPhase.iceLayout));
            if (firstPhase.chainLayout) chainGrid = JSON.parse(JSON.stringify(firstPhase.chainLayout));
            if (firstPhase.portals) portals = JSON.parse(JSON.stringify(firstPhase.portals));
        } else {
            isMultiPhase = false;
            GOAL_HEARTS = levelData.heartsGoal;
            levelLayout = JSON.parse(JSON.stringify(levelData.layout));
        }

        START_MOVES = levelData.moves;

        const preCard = document.getElementById('preLevelCard');
        if (preCard) {
            preCard.className = 'pre-card';
            let diffClass = 'diff-normal';
            let diffName = 'Обычная сложность 🟡';
            if (levelDifficulty === 'medium') { diffClass = 'diff-medium'; diffName = 'Сложная охота 🔵'; }
            else if (levelDifficulty === 'hard') { diffClass = 'diff-hard'; diffName = 'Опасный бой 🔴'; }
            else if (levelDifficulty === 'extreme') { diffClass = 'diff-extreme'; diffName = 'Ультра-сложная чистка 🟢'; }
            else if (levelDifficulty === 'challenge') { diffClass = 'diff-challenge'; diffName = 'Сюжетное испытание! 🟠'; }

            preCard.classList.add(diffClass);
            
            const badge = document.getElementById('preLevelDiffBadge');
            if (badge) badge.textContent = diffName;
        }

        const title = document.getElementById('preLevelTitle');
        if (title) title.textContent = `Уровень ${currentLevelId}`;

        const goalVal = document.getElementById('preLevelGoalVal');
        if (goalVal) {
            if (targetType === "carpet") {
                goalVal.textContent = `${GOAL_HEARTS} 🌿 Зеленых Ковров`;
            } else if (targetType === "box") {
                goalVal.textContent = `${GOAL_HEARTS} 📦 Деревянных Ящиков`;
            } else if (targetType === "ice") {
                goalVal.textContent = `${GOAL_HEARTS} 🧊 Клеток со Льдом`;
            } else if (targetType === "donut") {
                goalVal.textContent = `${GOAL_HEARTS} 🍩 Пончиков в самый низ`;
            } else if (["vase", "apple", "cherry", "nut", "ring", "cheese", "book", "pinata", "capsule"].includes(targetType)) {
                goalVal.textContent = `${GOAL_HEARTS} ${iconFor(targetType)} целей сбора`;
            } else {
                goalVal.textContent = `${GOAL_HEARTS} ❤️ Вампирских Сердец`;
            }
        }

        const rewards = getRewards(levelDifficulty);
        const preStars = document.getElementById('preRewardStars');
        if (preStars) preStars.textContent = `⭐ +${rewards.stars}`;

        const preCoins = document.getElementById('preRewardCoins');
        if (preCoins) preCoins.textContent = `💰 +${rewards.base}₽`;

        if (overlayPreLevel) overlayPreLevel.classList.remove('hidden');
    }

    const btnCancelPreLevel = document.getElementById('btnCancelPreLevel');
    if (btnCancelPreLevel) {
        btnCancelPreLevel.addEventListener('click', () => {
            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            if (window.showScreen) window.showScreen('screenMap');
        });
    }

    const btnStartMatch3 = document.getElementById('btnStartMatch3');
    if (btnStartMatch3) {
        btnStartMatch3.addEventListener('click', () => {
            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            
            if (window.showScreen) {
                window.showScreen('screenMatch3');
            }

            hearts = 0;
            boxesBroken = 0;
            iceMelted = 0;
            donutsCollected = 0;
            activeBooster = null;
            boardEl.classList.remove('aiming');
            if (btnHammer) btnHammer.classList.remove('active');
            if (btnBroom) btnBroom.classList.remove('active');

            moves = START_MOVES;
            
            buildInitialGrid();
            updateMatch3HUD();

            if (!hasPossibleMoves()) {
                shuffleBoard();
            }

            const dialogueIntro = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].intro : null;
            if (window.NovelEngine && dialogueIntro) {
                if (boardEl) boardEl.style.opacity = "0.2"; 
                window.NovelEngine.run(dialogueIntro, () => {
                    if (boardEl) boardEl.style.opacity = "1"; 
                });
            } else {
                if (boardEl) boardEl.style.opacity = "1";
            }
        });
    }

    window.openPreLevelScreen = openPreLevelScreen;
    console.log("match3.js: Все асинхронные авиа-полеты, комбо-эффекты и бустеры синхронизированы!");
})();
