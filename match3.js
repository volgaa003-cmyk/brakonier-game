// ================================================
// match3.js (ИСПРАВЛЕННЫЙ — ОШИБКА GETREWARDS УСТРАНЕНА)
// Премиальный движок три в ряд с частицами, отдачей и подсказками
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

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, {passive: false});
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);

    const isSpecial = t => SPECIALS.includes(t);
    const randType = () => TYPES[Math.floor(Math.random()*TYPES.length)].id;
    const key = (r,c) => r+','+c;
    const getType = (r,c) => grid[r] && grid[r][c] ? grid[r][c].type : null;

    if (btnHammer) btnHammer.addEventListener('click', () => selectBooster('hammer'));
    if (btnBroom) btnBroom.addEventListener('click', () => selectBooster('broom'));

    function selectBooster(type) {
        if (busy) return;
        const cost = type === 'hammer' ? 150 : 300;
        if (window.GameState && window.GameState.getCash() < cost) {
            pulseToast("Недостаточно рублей! 💰");
            return;
        }

        if (activeBooster === type) {
            activeBooster = null;
            boardEl.classList.remove('aiming');
            if (btnHammer) btnHammer.classList.remove('active');
            if (btnBroom) btnBroom.classList.remove('active');
        } else {
            activeBooster = type;
            boardEl.classList.add('aiming');
            if (btnHammer) btnHammer.classList.toggle('active', type === 'hammer');
            if (btnBroom) btnBroom.classList.toggle('active', type === 'broom');
            pulseToast(type === 'hammer' ? "Молоток: выберите любую клетку" : "Метла: выберите центр перекрестка");
        }
        resetHintTimer();
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
            default: return TYPES.find(t=>t.id===type).icon;
        }
    }

    function applySpecialClass(t){
        t.el.classList.remove('bomb','rocket-row','rocket-col','plane','rainbow', 'box', 'frozen', 'chained');
        if(t.type==='bomb') t.el.classList.add('bomb');
        else if(t.type==='rocketRow') t.el.classList.add('rocket-row');
        else if(t.type==='rocketCol') t.el.classList.add('rocket-col');
        else if(t.type==='plane') t.el.classList.add('plane');
        else if(t.type==='rainbow') t.el.classList.add('rainbow');
        else if(t.type==='box') t.el.classList.add('box');
        
        if(t.frozen) t.el.classList.add('frozen');
        if(t.chained) t.el.classList.add('chained');
    }

    function setTilePos(el, row, col){
        el.style.left = (col*100/SIZE)+'%';
        el.style.top = (row*100/SIZE)+'%';
    }

    // ТРЯСКА ПОЛЯ (SCREEN SHAKE)
    function triggerBoardShake(intensityClass = 'shake-mild') {
        boardEl.classList.remove('shake-mild', 'shake-intense');
        void boardEl.offsetWidth; // Триггер перерисовки
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

    // ТАЙМЕРЫ ИСКУССТВЕННЫХ ПОДСКАЗОК
    function resetHintTimer() {
        clearTimeout(hintTimeout);
        removeCurrentHints();
        hintTimeout = setTimeout(highlightPossibleMove, 4500); // 4.5 секунды бездействия
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
        // Проверяем все горизонтальные свапы
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE - 1; c++) {
                const a = grid[r][c];
                const b = grid[r][c+1];
                if (a && b && a.type !== 'box' && b.type !== 'box' && !a.frozen && !b.frozen && !a.chained && !b.chained) {
                    swapInGrid(a, b);
                    const hasMatch = collectRuns().length > 0;
                    swapInGrid(a, b); // возвращаем обратно
                    if (hasMatch) return { a, b };
                }
            }
        }
        // Проверяем все вертикальные свапы
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

    function findTileById(id){
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            const t = grid[r][c];
            if(t && t.id===id) return t;
        }
        return null;
    }

    function onTileClick(e){
        if(busy) return;
        const tile = findTileById(e.currentTarget.dataset.id);
        if(!tile) return;

        resetHintTimer();

        // Если активирован бустер
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

    function collectRuns(){
        const runs = [];
        for(let r=0;r<SIZE;r++){
            let runStart=0;
            for(let c=1;c<=SIZE;c++){
                const cur = c<SIZE ? getType(r,c) : null;
                const prev = getType(r,c-1);
                if(cur!==null && cur===prev && !isSpecial(cur) && cur !== 'box' && cur !== 'donut') continue;
                const len = c - runStart;
                if(len>=3 && prev !== null && !isSpecial(prev) && prev !== 'box' && prev !== 'donut'){
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
                if(cur!==null && cur===prev && !isSpecial(cur) && cur !== 'box' && cur !== 'donut') continue;
                const len = r - runStart;
                if(len>=3 && prev !== null && !isSpecial(prev) && prev !== 'box' && prev !== 'donut'){
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
                if(!t0 || isSpecial(t0) || t0 === 'box' || t0 === 'donut') continue;
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

    // ==================== СУПЕР-КОМБИНАЦИИ БУСТЕРОВ ====================

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

    function activateStandalone(tile){
        busy = true;
        moves--; updateMatch3HUD();
        let cells;

        if (tile.type === 'bomb') {
            animateBombEffect(tile.row, tile.col);
            triggerBoardShake('shake-mild');
            cells = computeActivationFootprint(tile);
            clearAndContinue(cells, [], null, null, false, false, true);
        } 
        else if (tile.type === 'rocketRow') {
            animateRocketEffect(tile.row, tile.col, true);
            triggerBoardShake('shake-mild');
            cells = computeActivationFootprint(tile);
            clearAndContinue(cells, [], null, null, false, false, true);
        } 
        else if (tile.type === 'rocketCol') {
            animateRocketEffect(tile.row, tile.col, false);
            triggerBoardShake('shake-mild');
            cells = computeActivationFootprint(tile);
            clearAndContinue(cells, [], null, null, false, false, true);
        } 
        else if (tile.type === 'plane') {
            activePlanesCount++;

            const target = findBestTargetForPlane(tile.row, tile.col);
            let targetRow = tile.row, targetCol = tile.col;

            if (target) {
                targetRow = target.r; targetCol = target.c;
            }

            const planeTookOffFromCarpet = carpetGrid[tile.row] && carpetGrid[tile.row][tile.col];

            cells = computeActivationFootprint(tile);
            cells.delete(key(targetRow, targetCol)); 

            clearAndContinue(cells, [], null, () => {
                animatePlaneEffect(tile.row, tile.col, targetRow, targetCol, () => {
                    const finalCell = new Set([key(targetRow, targetCol)]);
                    
                    if (planeTookOffFromCarpet) {
                        spreadCarpetAt(targetRow, targetCol);
                    }

                    clearAndContinue(finalCell, [], null, () => {
                        activePlanesCount--;
                        if (activePlanesCount === 0) {
                            busy = false;
                            checkEndConditions();
                        }
                    }, false, planeTookOffFromCarpet, true); 
                });
            }, false, false, true);
        } 
        else if(tile.type === 'rainbow'){
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random()*colors.length)] : null;
            cells = color ? cellsOfColor(color) : new Set();
            
            const targetsArray = [];
            cells.forEach(k => {
                const [r, c] = k.split(',').map(Number);
                targetsArray.push({r, c});
            });
            animateRainbowTentacles(tile.row, tile.col, targetsArray, color);
            triggerBoardShake('shake-intense');

            setTimeout(() => {
                cells.add(key(tile.row, tile.col));
                clearAndContinue(cells, [], null, null, false, false, true);
            }, 350);
        }
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

        // 2. Раскол льда, снятие цепей, взлом ящиков, спавн искр-частиц
        clearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if (t) {
                // Вызываем сочные искры при уничтожении
                spawnMatchParticles(r, c, t.type);

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
                } else if (t.type === 'box') {
                    levelLayout[r][c] = 1; 
                    t.el.classList.add('clearing');
                    if (targetType === "box") {
                        boxesBroken++;
                    }
                    setTimeout(() => {
                        if (grid[r][c] === t) {
                            t.el.remove();
                            grid[r][c] = null;
                        }
                    }, CLEAR_MS);
                } else {
                    finalClearSet.add(k);
                }
            }
        });

        // 3. Соседние деревянные ящики
        const brokenBoxes = checkAndBreakBoxes(finalClearSet);

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
            brokenBoxes.forEach(k => {
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

    // ПОШАГОВЫЙ СИМУЛЯТОР ГРАВИТАЦИИ С ПОРТАЛАМИ И ПОНЧИКАМИ
    function applyGravityAndRefill(){
        let moved = true;
        let loops = 0;
        const maxLoops = 20; 

        while (moved && loops < maxLoops) {
            moved = false;
            loops++;

            for (let r = SIZE - 1; r >= 0; r--) {
                for (let c = 0; c < SIZE; c++) {
                    if (levelLayout[r][c] === 1 && grid[r][c] === null) {
                        
                        let sourceRow = r - 1;
                        let sourceCol = c;

                        const cellKey = key(r, c);
                        if (portals[cellKey]) {
                            const [ep_r, ep_c] = portals[cellKey].split(',').map(Number);
                            sourceRow = ep_r;
                            sourceCol = ep_c;
                        }

                        if (sourceRow >= 0 && sourceRow < SIZE && sourceCol >= 0 && sourceCol < SIZE) {
                            const t = grid[sourceRow][sourceCol];
                            if (t && t.type !== 'box' && !t.frozen && !t.chained) {
                                grid[r][c] = t;
                                grid[sourceRow][sourceCol] = null;
                                moveTileTo(t, r, c);
                                moved = true;
                            }
                        }
                    }
                }
            }

            for (let c = 0; c < SIZE; c++) {
                if (levelLayout[0][c] === 1 && grid[0][c] === null) {
                    let spawnType = randType();
                    if (targetType === "donut" && countActiveDonuts() < 2 && Math.random() < 0.20) {
                        spawnType = "donut";
                    }
                    grid[0][c] = createTile(0, c, spawnType, -1);
                    moved = true;
                }
            }
        }

        collectDoughnuts();
        resetHintTimer(); // Сброс таймера подсказок после каждого падения фишек
    }

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

    // ==================== СИСТЕМА УРОВНЕЙ И ЗАПУСКА ====================

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

    function showOverlay(title, text) {
        if (overlayResults) {
            if (resultsTitle) resultsTitle.textContent = title;
            if (resultsText) resultsText.textContent = text;
            overlayResults.classList.remove('hidden');
        }
    }

    function pulseToast(msg) {
        if (toastEl) {
            toastEl.textContent = msg;
            toastEl.classList.add('show');
            clearTimeout(pulseToast._t);
            pulseToast._t = setTimeout(() => toastEl.classList.remove('show'), 1200);
        }
    }

    const btnResultsClose = document.getElementById('btnResultsClose');
    if (btnResultsClose) {
        btnResultsClose.addEventListener('click', () => {
            if (overlayResults) overlayResults.classList.add('hidden');
            
            const isCompleted = hearts >= GOAL_HEARTS || 
                                (targetType === "carpet" && document.querySelectorAll('.grid-cell.carpet').length >= GOAL_HEARTS) ||
                                (targetType === "box" && boxesBroken >= GOAL_HEARTS) ||
                                (targetType === "ice" && iceMelted >= GOAL_HEARTS) ||
                                (targetType === "donut" && donutsCollected >= GOAL_HEARTS);

            if (isCompleted) {
                if (window.GameState) {
                    window.GameState.nextLevel(); 
                }
            }

            if (window.showScreen) {
                window.showScreen('screenMap'); 
            }
        });
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
        } else {
            m3GoalText.textContent = `${hearts}/${GOAL_HEARTS} ❤️`;
        }
    }
    window.openPreLevelScreen = openPreLevelScreen;
    console.log("match3.js: Все асинхронные авиа-полеты, комбо-эффекты и бустеры синхронизированы!");
})();
