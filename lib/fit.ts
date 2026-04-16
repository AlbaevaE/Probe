export type Model = {
  predict: (x: number) => number;
  degree: number;
};

function solve(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    }
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) continue;
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / pivot;
      for (let j = i; j <= n; j++) M[k][j] -= factor * M[i][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(M[i][i]) < 1e-12) continue;
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) sum -= M[i][j] * x[j];
    x[i] = sum / M[i][i];
  }
  return x;
}

export function fitPolynomial(
  xs: number[],
  ys: number[],
  degree: number,
): Model {
  const n = xs.length;
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const range = xMax - xMin || 1;
  const normalize = (x: number) => (x - xMin) / range;
  const xsNorm = xs.map(normalize);
  const m = degree + 1;

  const V: number[][] = xsNorm.map((x) => {
    const row: number[] = [];
    for (let j = 0; j < m; j++) row.push(Math.pow(x, j));
    return row;
  });

  const VtV: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
  const Vty: number[] = new Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      for (let k = 0; k < n; k++) VtV[i][j] += V[k][i] * V[k][j];
    }
    for (let k = 0; k < n; k++) Vty[i] += V[k][i] * ys[k];
  }

  const coeffs = solve(VtV, Vty);

  const predict = (x: number) => {
    const t = normalize(x);
    let y = 0;
    let tk = 1;
    for (const c of coeffs) {
      y += c * tk;
      tk *= t;
    }
    return y;
  };

  return { predict, degree };
}

export function meanAbsoluteError(
  model: Model,
  xs: number[],
  ys: number[],
): number {
  let s = 0;
  for (let i = 0; i < xs.length; i++) {
    s += Math.abs(model.predict(xs[i]) - ys[i]);
  }
  return s / xs.length;
}
