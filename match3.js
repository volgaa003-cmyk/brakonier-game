// ================================================
// match3.js (ИСПРАВЛЕННЫЙ — АВИА-КОНТРОЛЬ ПОЛЕТОВ)
// Движок "Три в ряд" с блокировкой поля во время полета самолетов
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

    const SWAP_MS = 180;  
    const CLEAR_MS = 200; 
    const FALL_MS = 240;  

    let currentLevelId = 1;
    let GOAL_HEARTS = 12;
    let START_MOVES = 20;
    let levelDifficulty = "normal";
    let levelLayout = []; 

    let grid = [];
    let selected = null;
    let hearts = 0, moves = 20;
    let busy = false;
    let tileIdCounter = 0;

    // Счетчик активных самолетов в воздухе для защиты от рассинхрона
    let activePlanesCount = 0;

    let dragStartX = 0, dragStartY = 0;
    let dragActiveTile = null;

    const boardEl = document.getElementById('board');
    const m3GoalText = document.getElementById('m3GoalText');
    const m3MovesText = document.getElementById('m3MovesText');
    const toastEl = document.getElementById('toast');

    const overlayResults = document.getElementById('overlayResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsText = document.getElementById('resultsText');
    const overlayPreLevel = document.getElementById('overlayPreLevel');
    const preCard = document.getElementById('preLevelCard');

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, {passive: false});
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);

    const isSpecial = t => SPECIALS.includes(t);
    const randType = () => TYPES[Math.floor(Math.random()*TYPES.length)].id;
    const key = (r,c) => r+','+c;
    const getType = (r,c) => grid[r] && grid[r][c] ? grid[r][c].type : null;

    function iconFor(type){
        switch(type){
            case 'bomb': return '💣';
            case 'rocketRow': return '🚀';
            case 'rocketCol': return '🚀';
            case 'plane': return '✈️';
            case 'rainbow': return '🌈';
            case 'box': return '📦';
            default: return TYPES.find(t=>t.id===type).icon;
        }
    }

    function applySpecialClass(t){
        t.el.classList.remove('bomb','rocket-row','rocket-col','plane','rainbow', 'box');
        if(t.type==='bomb') t.el.classList.add('bomb');
        else if(t.type==='rocketRow') t.el.classList.add('rocket-row');
        else if(t.type==='rocketCol') t.el.classList.add('rocket-col');
        else if(t.type==='plane') t.el.classList.add('plane');
        else if(t.type==='rainbow') t.el.classList.add('rainbow');
        else if(t.type==='box') t.el.classList.add('box');
    }

    function setTilePos(el, row, col){
        el.style.left = (col*100/SIZE)+'%';
        el.style.top = (row*100/SIZE)+'%';
    }

    // Считывание жестов (СВАЙПОВ)
    function handleDragStart(e, tile) {
        if (busy || tile.type === 'box') return;
        dragActiveTile = tile;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartX = clientX;
        dragStartY = clientY;
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
                if (partner && partner.type !== 'box') {
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

        const tile = {id, type, row, col, el, inner};

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
        if(!tile || tile.type === 'box') return;

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
                clearAndContinue(cells, []);
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
                if(cur!==null && cur===prev && !isSpecial(cur) && cur !== 'box') continue;
                const len = c - runStart;
                if(len>=3 && prev !== null && !isSpecial(prev) && prev !== 'box'){
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
                if(cur!==null && cur===prev && !isSpecial(cur) && cur !== 'box') continue;
                const len = r - runStart;
                if(len>=3 && prev !== null && !isSpecial(prev) && prev !== 'box'){
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
                if(!t0 || isSpecial(t0) || t0 === 'box') continue;
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

    function cellsOfColor(type){
        const s = new Set();
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            if(grid[r][c] && grid[r][c].type===type) s.add(key(r,c));
        }
        return s;
    }

    function presentColors(){
        const set = new Set();
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            if(grid[r][c] && !isSpecial(grid[r][c].type) && grid[r][c].type !== 'box') set.add(grid[r][c].type);
        }
        return Array.from(set);
    }

    // ==================== ДИНАМИЧЕСКИЕ АНИМАЦИИ БОНУСОВ ====================

    function animateRocketEffect(row, col, isRow) {
        const proj1 = document.createElement('div');
        const proj2 = document.createElement('div');
        proj1.className = 'm3-projectile';
        proj2.className = 'm3-projectile';
        proj1.textContent = '🚀';
        proj2.textContent = '🚀';

        proj1.style.left = (col * 100 / SIZE) + '%';
        proj1.style.top = (row * 100 / SIZE) + '%';
        proj2.style.left = (col * 100 / SIZE) + '%';
        proj2.style.top = (row * 100 / SIZE) + '%';

        if (isRow) {
            proj1.style.transform = 'rotate(-90deg)';
            proj2.style.transform = 'rotate(90deg)';
        }

        boardEl.appendChild(proj1);
        boardEl.appendChild(proj2);

        setTimeout(() => {
            if (isRow) {
                proj1.style.left = '-120%';
                proj2.style.left = '120%';
            } else {
                proj1.style.top = '-120%';
                proj1.style.transform = 'rotate(0deg)';
                proj2.style.top = '120%';
                proj2.style.transform = 'rotate(180deg)';
            }
        }, 16);

        setTimeout(() => {
            proj1.remove();
            proj2.remove();
        }, 450);
    }

    function animateBombEffect(row, col) {
        const wave = document.createElement('div');
        wave.className = 'bomb-shockwave';
        wave.style.left = (col * 100 / SIZE) + '%';
        wave.style.top = (row * 100 / SIZE) + '%';

        boardEl.appendChild(wave);

        setTimeout(() => {
            wave.style.transform = 'scale(5.5)'; 
            wave.style.opacity = '0';
        }, 16);

        setTimeout(() => {
            wave.remove();
        }, 350);
    }

    function animatePlaneEffect(startRow, startCol, targetRow, targetCol, onArrive) {
        const plane = document.createElement('div');
        plane.className = 'm3-projectile';
        plane.textContent = '✈️';
        plane.style.left = (startCol * 100 / SIZE) + '%';
        plane.style.top = (startRow * 100 / SIZE) + '%';

        boardEl.appendChild(plane);

        const dx = targetCol - startCol;
        const dy = targetRow - startRow;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI + 45; 

        setTimeout(() => {
            plane.style.transform = `scale(1.4) rotate(${angle - 180}deg)`;
        }, 60);

        setTimeout(() => {
            plane.style.left = (targetCol * 100 / SIZE) + '%';
            plane.style.top = (targetRow * 100 / SIZE) + '%';
            plane.style.transform = `scale(1.1) rotate(${angle}deg)`;
        }, 180);

        setTimeout(() => {
            plane.remove();
            if (onArrive) onArrive();
        }, 500);
    }

    // Умный поиск цели для Самолётика
    function findBestTargetForPlane(excludeRow, excludeCol) {
        let targetRow = excludeRow, targetCol = excludeCol;
        let foundTarget = false;

        for (let r=0; r<SIZE; r++) {
            for (let c=0; c<SIZE; c++) {
                if (grid[r][c] && grid[r][c].type === 'box') {
                    targetRow = r; targetCol = c;
                    foundTarget = true;
                    break;
                }
            }
            if (foundTarget) break;
        }

        if (!foundTarget) {
            for (let r=0; r<SIZE; r++) {
                for (let c=0; c<SIZE; c++) {
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
            for (let r=0; r<SIZE; r++) {
                for (let c=0; c<SIZE; c++) {
                    if (grid[r][c] && grid[r][c].type !== 'box' && !(r === excludeRow && c === excludeCol)) {
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

    // ==================== СУПЕР-КОМБИНАЦИИ БУСТЕРОВ (БЛОКИРОВКА АВИА-КОНТРОЛЕМ) ====================

    function comboFootprint(a, b){
        let cells = new Set();
        const kinds = [a.type, b.type];
        const has = t => kinds.includes(t);
        const isRocket = t => t === 'rocketRow' || t === 'rocketCol';
        
        // КЛАССИКА 1: Радужный шар + любой Бустер (Ракеты, Бомбы, Самолётики)
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

                // Превращаем все плитки этого цвета в данный бустер и последовательно взрываем!
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
            }

            cells.add(key(a.row, a.col));
            cells.add(key(b.row, b.col));
            pulseToast('🌈 СУПЕР-КОМБО: Парад бонусов!');
            return cells;
        }

        // КЛАССИКА 2: Самолётик + Самолётик (Запуск эскадрильи из 3-х птиц!)
        if (has('plane') && has('plane')) {
            cells = computeActivationFootprint(a); // Очищаем крест в точке запуска
            
            // Включаем блокировку: летят 3 самолетика
            activePlanesCount += 3;

            clearAndContinue(cells, [], null, () => {
                // По очереди отправляем 3 самолетика в разные важные цели!
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const target = findBestTargetForPlane(a.row, a.col);
                        if (target) {
                            animatePlaneEffect(a.row, a.col, target.r, target.c, () => {
                                const targetCell = new Set([key(target.r, target.c)]);
                                clearAndContinue(targetCell, [], null, () => {
                                    activePlanesCount--;
                                    if (activePlanesCount === 0) {
                                        busy = false;
                                        checkEndConditions();
                                    }
                                });
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
            });

            pulseToast('✈️ Эскадрилья самолётиков!');
            return new Set(); // Возвращаем пустоту, так как запуск мы обработали вручную
        }

        // КЛАССИКА 3: Самолётик + Бомба / Ракета
        if (has('plane') && (has('bomb') || has('rocketRow') || has('rocketCol'))) {
            const boosterType = a.type === 'plane' ? b.type : a.type;
            const plane = a.type === 'plane' ? a : b;

            cells = computeActivationFootprint(plane); // Очищаем крест на старте
            
            // Включаем блокировку: летит 1 грузовой самолетик
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
                        
                        clearAndContinue(blastCells, [], null, () => {
                            activePlanesCount--;
                            if (activePlanesCount === 0) {
                                busy = false;
                                checkEndConditions();
                            }
                        });
                    });
                } else {
                    activePlanesCount--;
                    if (activePlanesCount === 0) {
                        busy = false;
                        checkEndConditions();
                    }
                }
            });

            pulseToast('📦 Доставка взрывчатки!');
            return new Set();
        }

        // Обычные слияния (Бомба+Бомба, Ракета+Бомба, Ракета+Ракета)
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
            cells = computeActivationFootprint(tile);
            clearAndContinue(cells, []);
        } 
        else if (tile.type === 'rocketRow') {
            animateRocketEffect(tile.row, tile.col, true);
            cells = computeActivationFootprint(tile);
            clearAndContinue(cells, []);
        } 
        else if (tile.type === 'rocketCol') {
            animateRocketEffect(tile.row, tile.col, false);
            cells = computeActivationFootprint(tile);
            clearAndContinue(cells, []);
        } 
        else if (tile.type === 'plane') {
            // Включаем блокировку: летит одиночный самолетик
            activePlanesCount++;

            const target = findBestTargetForPlane(tile.row, tile.col);
            let targetRow = tile.row, targetCol = tile.col;

            if (target) {
                targetRow = target.r; targetCol = target.c;
            }

            cells = computeActivationFootprint(tile);
            cells.delete(key(targetRow, targetCol)); 

            clearAndContinue(cells, [], null, () => {
                // Полет
                animatePlaneEffect(tile.row, tile.col, targetRow, targetCol, () => {
                    const finalCell = new Set([key(targetRow, targetCol)]);
                    clearAndContinue(finalCell, [], null, () => {
                        // Полет завершен, снимаем блокировку
                        activePlanesCount--;
                        if (activePlanesCount === 0) {
                            busy = false;
                            checkEndConditions();
                        }
                    });
                });
            });
        } 
        else if(tile.type === 'rainbow'){
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random()*colors.length)] : null;
            cells = color ? cellsOfColor(color) : new Set();
            cells.add(key(tile.row,tile.col));
            clearAndContinue(cells, []);
        }
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
        
        if(specialSpawns.length) pulseToast(specialSpawns.length>1 ? 'Комбо бонусов!' : 'Новый бонус!');
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
                setTimeout(() => {
                    if (grid[br][bc] === boxTile) {
                        boxTile.el.remove();
                        grid[br][bc] = null;
                    }
                }, CLEAR_MS);
            }
        });
    }

    function clearAndContinue(clearSet, specialSpawns, scoreSet, onComplete){
        specialSpawns = specialSpawns || [];
        const scoring = scoreSet || clearSet;
        let heartsGained=0;
        scoring.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(!t) return;
            if(t.type==='heart') heartsGained++;
        });

        // Напрямую проверяем, не уничтожили ли мы коробку (самолетиком, ракетой или бомбой)
        clearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if (t && t.type === 'box') {
                levelLayout[r][c] = 1; 
            }
        });

        checkAndBreakBoxes(clearSet);

        clearSet.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t) t.el.classList.add('clearing');
        });
        hearts += heartsGained;
        
        if (m3GoalText) m3GoalText.textContent = `${hearts}/${GOAL_HEARTS} ❤️`;
        
        if(heartsGained>0) pulseToast('+'+heartsGained+' ❤️');
        
        setTimeout(()=>{
            clearSet.forEach(k=>{
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
                if(!hasMore){
                    // Запускаем колбэк по окончанию цепочки падений
                    if (onComplete) onComplete();
                    
                    // Блокируем поле ТОЛЬКО если все самолеты закончили полет
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

    // УМНЫЙ АЛГОРИТМ ГРАВИТАЦИИ
    function applyGravityAndRefill(){
        for(let c=0;c<SIZE;c++){
            const movableTiles = [];
            for(let r=0;r<SIZE;r++){
                const t = grid[r][c];
                if(t && t.type !== 'box' && levelLayout[r][c] !== 2){
                    movableTiles.push(t);
                    grid[r][c] = null; 
                }
            }

            let spawnOffset = 1;
            for(let r=SIZE-1;r>=0;r--){
                const cellType = levelLayout[r][c];

                if (cellType === 1) {
                    if (movableTiles.length > 0) {
                        const t = movableTiles.pop();
                        grid[r][c] = t;
                        moveTileTo(t, r, c);
                    } else {
                        grid[r][c] = createTile(r, c, randType(), -spawnOffset);
                        spawnOffset++;
                    }
                } else if (cellType === 2) {
                    // Коробка — стоит на месте
                } else {
                    grid[r][c] = null;
                }
            }
        }
    }

    // ==================== АЛГОРИТМ ПРОВЕРКИ СВОБОДНЫХ ХОДОВ ====================
    
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
                if (!t || t.type === 'box') continue;

                const neighbors = [[r + 1, c], [r, c + 1]];
                for (const [nr, nc] of neighbors) {
                    if (nr < SIZE && nc < SIZE) {
                        const nt = grid[nr][nc];
                        if (nt && nt.type !== 'box') {
                            
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

    // ==================== АЛГОРИТМ УМНОГО ПЕРЕМЕШИВАНИЯ ПОЛЯ ====================
    
    function shuffleBoard() {
        busy = true;
        pulseToast("🌀 Нет ходов! Перемешивание...");

        const normalTiles = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && !isSpecial(t.type) && t.type !== 'box') {
                    normalTiles.push(t);
                }
            }
        }

        let shuffleSafetyGuard = 0;
        do {
            const types = normalTiles.map(t => t.type);
            
            for (let i = types.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = types[i];
                types[i] = types[j];
                types[j] = temp;
            }

            normalTiles.forEach((t, index) => {
                t.type = types[index];
                t.inner.textContent = iconFor(t.type);
                applySpecialClass(t);
                
                t.el.style.transform = 'scale(0.3) rotate(180deg)';
                t.el.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            });

            shuffleSafetyGuard++;
            if (shuffleSafetyGuard > 15) break; 
        } while (!hasPossibleMoves()); 

        setTimeout(() => {
            normalTiles.forEach(t => {
                t.el.style.transform = 'scale(1) rotate(0deg)';
                setTimeout(() => {
                    t.el.style.transition = '';
                }, 300);
            });
            busy = false;

            const result = analyzeMatches();
            const hasMore = result.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.size;
            if (hasMore) {
                applyResolutionFull(result);
            }
        }, 450);
    }

    // ======================================================================================

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

    function updateMatch3HUD() {
        if (m3MovesText) m3MovesText.textContent = moves;
    }

    function openPreLevelScreen(levelId) {
        const levelData = window.LEVELS ? window.LEVELS[levelId - 1] : null;
        if (!levelData) {
            console.error("Не удалось найти данные уровня в window.LEVELS:", levelId);
            return;
        }

        currentLevelId = levelId;
        GOAL_HEARTS = levelData.heartsGoal;
        START_MOVES = levelData.moves;
        levelDifficulty = levelData.difficulty;
        levelLayout = JSON.parse(JSON.stringify(levelData.layout)); 

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

        const goalVal = document.getElementById('preGoalVal');
        if (goalVal) goalVal.textContent = `${GOAL_HEARTS} ❤️ Вампирских Сердец`;

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
            moves = START_MOVES;
            updateMatch3HUD();
            if (m3GoalText) m3GoalText.textContent = `0/${GOAL_HEARTS} ❤️`;

            buildInitialGrid();

            // ВАЖНО: Добавлена принудительная стартовая проверка на тупик!
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
        if(hearts >= GOAL_HEARTS){
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
            if (window.GameState) {
                window.GameState.loseLife(); 
            }

            const dialogueLose = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].lose : null;
            const loseText = `Тебе не хватило ходов. Было собрано всего ${hearts} из ${GOAL_HEARTS} сердец.\n\nЖизнь: -1 ❤️`;

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
            
            if (hearts >= GOAL_HEARTS) {
                if (window.GameState) {
                    window.GameState.nextLevel(); 
                }
            }

            if (window.showScreen) {
                window.showScreen('screenMap'); 
            }
        });
    }

    window.openPreLevelScreen = openPreLevelScreen;
    console.log("match3.js: Физика и гравитация ящиков успешно отлажены!");
})();
