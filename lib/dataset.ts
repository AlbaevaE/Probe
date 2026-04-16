function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng: () => number, mean: number, std: number): number {
  const u = 1 - rng();
  const v = rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * std;
}

export type Dataset = {
  xs: number[];
  ys: number[];
};

export function generateHousingDataset(seed: number): {
  train: Dataset;
  test: Dataset;
} {
  const rng = mulberry32(seed);
  const xsTrain: number[] = [];
  const ysTrain: number[] = [];
  const xsTest: number[] = [];
  const ysTest: number[] = [];

  const truth = (x: number) => 2.5 * x + 20;
  const noise = 28;

  const xTrainFixed = [28, 45, 62, 80, 98, 115, 135, 155, 182, 210];
  for (const x of xTrainFixed) {
    xsTrain.push(x);
    ysTrain.push(truth(x) + gauss(rng, 0, noise));
  }

  for (let i = 0; i < 10; i++) {
    const x = 25 + rng() * 195;
    xsTest.push(x);
    ysTest.push(truth(x) + gauss(rng, 0, noise));
  }
  xsTest.sort((a, b) => a - b);
  const ysTestSorted: number[] = [];
  for (const x of xsTest) {
    ysTestSorted.push(truth(x) + gauss(rng, 0, noise));
  }

  return {
    train: { xs: xsTrain, ys: ysTrain },
    test: { xs: xsTest, ys: ysTestSorted },
  };
}
