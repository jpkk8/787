(() => {
  // --- DOM refs
  const sizeEl = document.getElementById('size');
  const precEl = document.getElementById('prec');
  const showStepsEl = document.getElementById('showSteps');
  const pivotingEl = document.getElementById('pivoting');

  const grid = document.getElementById('grid');
  const stepsBox = document.getElementById('stepsBox');
  const stepsList = document.getElementById('steps');
  const detEl = document.getElementById('det');
  const detApproxEl = document.getElementById('detApprox');
  const copyBtn = document.getElementById('copy');

  // --- Helpers
  const fmt = (x, p=6) => {
    if (!Number.isFinite(x)) return 'NaN';
    if (Math.abs(x) < 1e-12) x = 0;
    return x.toLocaleString('ru-RU', { maximumFractionDigits: p });
  };

  const buildGrid = (n) => {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${n}, minmax(68px, 1fr))`;
    for (let i=0;i<n*n;i++){
      const inp = document.createElement('input');
      inp.className = 'cell';
      inp.type = 'text';
      inp.placeholder = '0';
      inp.value = '0';
      grid.appendChild(inp);
    }
  };

  const readMatrix = () => {
    const n = Math.sqrt(grid.children.length) | 0;
    const A = Array.from({length: n}, () => Array(n).fill(0));
    [...grid.children].forEach((inp, idx) => {
      const i = Math.floor(idx / n), j = idx % n;
      const v = String(inp.value).trim().replace(',', '.');
      A[i][j] = v ? Number(v) : 0;
    });
    return A;
  };

  // Determinant via Gaussian elimination with partial pivoting (optional).
  const detGauss = (A, usePivot, log) => {
    const n = A.length;
    const M = A.map(r => r.slice());
    let det = 1;
    let sign = 1;

    for (let col=0; col<n; col++){
      // pivot search
      let pivot = col;
      if (usePivot){
        for (let r=col+1; r<n; r++){
          if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
        }
      }
      if (Math.abs(M[pivot][col]) < 1e-12){
        log && log(`Столбец ${col+1}: ведущий элемент ≈ 0 ⇒ det = 0`);
        return 0;
      }
      if (pivot !== col){
        [M[pivot], M[col]] = [M[col], M[pivot]];
        sign *= -1;
        log && log(`Поменяли строки R${pivot+1} ↔ R${col+1} (меняет знак det)`);
      }

      const pivotVal = M[col][col];
      det *= pivotVal;
      log && log(`Опорный элемент (${col+1},${col+1}) = ${fmt(pivotVal)}`);

      for (let r=col+1; r<n; r++){
        const f = M[r][col] / pivotVal;
        if (Math.abs(f) < 1e-14) continue;
        for (let k=col; k<n; k++){
          M[r][k] -= f * M[col][k];
        }
        log && log(`R${r+1} ← R${r+1} − (${fmt(f)})·R${col+1}`);
      }
    }
    return sign * det;
  };

  // --- UI handlers
  const renderSteps = (lines) => {
    stepsList.innerHTML = '';
    lines.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      stepsList.appendChild(li);
    });
    if (lines.length) stepsBox.open = true;
  };

  const compute = () => {
    const A = readMatrix();
    const steps = [];
    const log = showStepsEl.checked ? (s) => steps.push(s) : null;
    const usePivot = pivotingEl.checked;
    const det = detGauss(A, usePivot, log);
    const p = Number(precEl.value);

    detEl.textContent = fmt(det, p);
    detApproxEl.textContent = fmt(det, p);
    renderSteps(steps);
    copyBtn.disabled = steps.length === 0;
  };

  const fillRandom = () => {
    [...grid.children].forEach(inp => {
      const v = (Math.random()*10 - 5);
      inp.value = (Math.round(v*10)/10).toString().replace('.', ',');
    });
  };

  const clearAll = () => {
    [...grid.children].forEach(inp => inp.value = '0');
    detEl.textContent = '—';
    detApproxEl.textContent = '—';
    renderSteps([]);
    copyBtn.disabled = true;
  };

  const copySteps = () => {
    const lines = [...stepsList.querySelectorAll('li')].map(li => li.textContent).join('\\n');
    navigator.clipboard.writeText(lines).then(() => {
      const btn = document.getElementById('copy');
      const old = btn.textContent;
      btn.textContent = 'Скопировано!';
      setTimeout(() => btn.textContent = old, 1500);
    });
  };

  // --- Bindings
  document.getElementById('regen').addEventListener('click', () => {
    const n = Math.max(2, Math.min(10, Number(sizeEl.value)));
    sizeEl.value = n;
    buildGrid(n);
  });
  document.getElementById('fillRand').addEventListener('click', fillRandom);
  document.getElementById('clear').addEventListener('click', clearAll);
  document.getElementById('solve').addEventListener('click', compute);
  document.getElementById('copy').addEventListener('click', copySteps);

  // init
  buildGrid(3);
})();