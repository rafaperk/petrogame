/**
 * Propriedades termodinâmicas simplificadas para as bancadas: água (vapor) e R-134a.
 *
 * - Água: tabelas de saturação (por temperatura e por pressão, intercaladas) e de vapor superaquecido de
 *   10 kPa a 15 MPa, com valores de livro-texto (referência: líquido saturado a 0,01 °C com u = s = 0).
 * - R-134a: tabela de saturação (referência: líquido saturado a −40 °C com h = s = 0). Acima de 60 °C as linhas
 *   são só uma estimativa para desenhar a cúpula. O vapor superaquecido usa um cp médio (bom para a descarga
 *   do compressor, a poucos graus da saturação).
 *
 * Interpolação: P de saturação em ln P × 1/T (Clausius–Clapeyron); h, s e v lineares em T; no superaquecido,
 * pelo grau de superaquecimento entre as isobaras vizinhas (em ln P). Erro típico de tabela de prova (≈ 0,1 %).
 * Unidades: T em °C, P em kPa, h em kJ/kg, s em kJ/kg·K, v em m³/kg.
 */

/** Linha de saturação: T (°C), P (kPa), v_l (m³/kg), h_l, h_v (kJ/kg), s_l, s_v (kJ/kg·K). */
export type SatRow = readonly [number, number, number, number, number, number, number];
/** Isobara de vapor superaquecido: P (kPa) e linhas [T (°C), h, s] acima da saturação. */
export interface Isobar {
  readonly P: number;
  readonly rows: readonly (readonly [number, number, number])[];
}

// Tabelas geradas e conferidas (s_lv = h_lv/T; dh = T·ds nas isobaras; h e s caem com P).
const WATER_SAT: readonly SatRow[] = [
  [0.01, 0.6117, 0.001, 0.001, 2500.9, 0, 9.1556],
  [5, 0.8725, 0.001, 21.02, 2510.1, 0.0763, 9.0249],
  [10, 1.2281, 0.001, 42.022, 2519.2, 0.1511, 8.8999],
  [15, 1.7057, 0.001001, 62.982, 2528.4, 0.2245, 8.7803],
  [20, 2.3392, 0.001002, 83.915, 2537.4, 0.2965, 8.6661],
  [25, 3.1698, 0.001003, 104.83, 2546.5, 0.3672, 8.5567],
  [30, 4.2469, 0.001004, 125.74, 2555.6, 0.4368, 8.452],
  [32.87, 5, 0.001005, 137.75, 2560.7, 0.4762, 8.3938],
  [35, 5.6291, 0.001006, 146.64, 2564.6, 0.5051, 8.3517],
  [40.29, 7.5, 0.001008, 168.75, 2574, 0.5763, 8.2501],
  [45, 9.5953, 0.00101, 188.44, 2582.4, 0.6386, 8.1633],
  [45.81, 10, 0.00101, 191.81, 2583.9, 0.6492, 8.1488],
  [50, 12.352, 0.001012, 209.34, 2591.3, 0.7038, 8.0748],
  [53.97, 15, 0.001014, 225.94, 2598.3, 0.7549, 8.0071],
  [60.06, 20, 0.001017, 251.42, 2608.9, 0.832, 7.9073],
  [64.96, 25, 0.00102, 271.96, 2617.5, 0.8932, 7.8302],
  [69.09, 30, 0.001022, 289.27, 2624.6, 0.9441, 7.7675],
  [70, 31.202, 0.001023, 293.07, 2626.1, 0.9551, 7.754],
  [75.86, 40, 0.001026, 317.62, 2636.1, 1.0261, 7.6691],
  [80, 47.416, 0.001029, 335.02, 2643, 1.0756, 7.6111],
  [81.32, 50, 0.00103, 340.54, 2645.2, 1.0912, 7.5931],
  [90, 70.183, 0.001036, 377.04, 2659.6, 1.1929, 7.4781],
  [91.76, 75, 0.001037, 384.44, 2662.4, 1.2132, 7.4558],
  [99.61, 100, 0.001043, 417.51, 2675, 1.3028, 7.3589],
  [100, 101.42, 0.001043, 419.17, 2675.6, 1.3072, 7.3541],
  [105.97, 125, 0.001048, 444.36, 2684.9, 1.3741, 7.2841],
  [110, 143.38, 0.001052, 461.42, 2691.1, 1.4188, 7.2381],
  [111.35, 150, 0.001053, 467.13, 2693.1, 1.4337, 7.2231],
  [120.21, 200, 0.001061, 504.7, 2706.3, 1.5302, 7.127],
  [127.41, 250, 0.001067, 535.08, 2716.5, 1.6072, 7.0524],
  [130, 270.28, 0.00107, 546.38, 2720.1, 1.6346, 7.0264],
  [133.52, 300, 0.001073, 561.43, 2724.9, 1.6717, 6.9917],
  [140, 361.53, 0.00108, 589.16, 2733.5, 1.7392, 6.9293],
  [143.61, 400, 0.001084, 604.66, 2738.1, 1.7765, 6.8955],
  [150, 476.16, 0.001091, 632.18, 2746.2, 1.8418, 6.8371],
  [151.83, 500, 0.001093, 640.09, 2748.1, 1.8604, 6.8207],
  [158.83, 600, 0.001101, 670.38, 2756.2, 1.9308, 6.7593],
  [160, 618.23, 0.001102, 675.47, 2757.9, 1.9426, 6.7491],
  [170, 792.18, 0.001114, 719.08, 2768.4, 2.0417, 6.665],
  [170.41, 800, 0.001115, 720.87, 2768.3, 2.0457, 6.6616],
  [179.88, 1000, 0.001127, 762.51, 2777.1, 2.1381, 6.585],
  [187.96, 1200, 0.001138, 798.33, 2783.8, 2.2159, 6.5217],
  [190, 1255.2, 0.001141, 807.43, 2784.3, 2.2355, 6.5059],
  [195.04, 1400, 0.001149, 830.08, 2788.9, 2.2835, 6.4675],
  [200, 1554.9, 0.001157, 852.26, 2792, 2.3305, 6.4302],
  [201.37, 1600, 0.001159, 858.46, 2792.8, 2.3435, 6.4199],
  [207.11, 1800, 0.001168, 884.47, 2795.9, 2.3975, 6.3775],
  [210, 1907.7, 0.001173, 897.61, 2796.9, 2.4245, 6.3563],
  [212.38, 2000, 0.001177, 908.47, 2798.3, 2.4467, 6.339],
  [220, 2319.6, 0.00119, 943.55, 2801, 2.5177, 6.284],
  [223.95, 2500, 0.001197, 961.91, 2801.9, 2.5543, 6.2558],
  [230, 2797.1, 0.001209, 990.14, 2803, 2.6101, 6.2126],
  [233.85, 3000, 0.001217, 1008.3, 2803.2, 2.6454, 6.1856],
  [240, 3346.9, 0.001229, 1037.5, 2803, 2.702, 6.1423],
  [242.56, 3500, 0.001235, 1049.8, 2802.7, 2.7253, 6.1244],
  [250, 3976.2, 0.001252, 1085.7, 2800.9, 2.7935, 6.0722],
  [250.35, 4000, 0.001253, 1087.4, 2800.8, 2.7966, 6.0696],
  [260, 4692.3, 0.001276, 1135, 2796.6, 2.8849, 6.0016],
  [263.94, 5000, 0.001286, 1154.5, 2794.2, 2.9207, 5.9737],
  [270, 5503, 0.001303, 1185.3, 2789.7, 2.9765, 5.9304],
  [275.59, 6000, 0.001319, 1213.9, 2784.6, 3.0275, 5.8902],
  [280, 6416.6, 0.001333, 1236.9, 2779.9, 3.0685, 5.8579],
  [285.83, 7000, 0.001352, 1267.5, 2772.6, 3.122, 5.8148],
  [290, 7441.8, 0.001366, 1290, 2766.7, 3.1612, 5.7834],
  [295.01, 8000, 0.001385, 1317.1, 2758.7, 3.2077, 5.7446],
  [300, 8587.9, 0.001404, 1345, 2749.6, 3.2552, 5.7059],
  [303.35, 9000, 0.001418, 1363.7, 2742.9, 3.2866, 5.6791],
  [310, 9865, 0.001447, 1402.2, 2727.9, 3.351, 5.6244],
  [311, 10000, 0.001453, 1408, 2725.5, 3.3603, 5.6159],
  [320, 11284, 0.001499, 1462.2, 2700.6, 3.4494, 5.5372],
  [324.68, 12000, 0.001526, 1491.5, 2685.4, 3.4964, 5.4939],
  [330, 12858, 0.001561, 1525.9, 2666, 3.5518, 5.4422],
  [336.67, 14000, 0.001611, 1571.6, 2638.3, 3.6232, 5.3727],
  [340, 14601, 0.001638, 1594.5, 2621.8, 3.6601, 5.3356],
  [342.16, 15000, 0.001657, 1610.3, 2610.8, 3.6848, 5.3108],
  [350, 16529, 0.00174, 1670.9, 2563.6, 3.7784, 5.211],
  [360, 18666, 0.001895, 1761.7, 2481.5, 3.9167, 5.0536],
  [370, 21044, 0.002217, 1890.7, 2334.5, 4.1137, 4.8012],
  [373.95, 22064, 0.003106, 2084.3, 2084.3, 4.407, 4.407],
];
const WATER_SUP: readonly Isobar[] = [
  { P: 10, rows: [[50, 2592, 8.1741], [100, 2687.5, 8.4489], [150, 2783, 8.6893], [200, 2879.6, 8.9049], [250, 2977.5, 9.1015], [300, 3076.7, 9.2827], [400, 3279.9, 9.6094], [500, 3489.7, 9.8998], [600, 3705.6, 10.1631]] },
  { P: 50, rows: [[100, 2682.4, 7.6953], [150, 2780.2, 7.9413], [200, 2877.8, 8.1592], [250, 2976.2, 8.3568], [300, 3075.8, 8.5387], [400, 3279.3, 8.8659], [500, 3489.3, 9.1566], [600, 3705.6, 9.4201]] },
  { P: 100, rows: [[100, 2675.8, 7.3611], [150, 2776.6, 7.6148], [200, 2875.5, 7.8356], [250, 2974.5, 8.0346], [300, 3074.5, 8.2172], [400, 3278.6, 8.5452], [500, 3488.7, 8.8362], [600, 3705.6, 9.1004]] },
  { P: 200, rows: [[150, 2769.1, 7.281], [200, 2870.7, 7.5081], [250, 2971.2, 7.71], [300, 3072.1, 7.8941], [400, 3277, 8.2236], [500, 3487.7, 8.5153], [600, 3704.8, 8.7793]] },
  { P: 500, rows: [[200, 2855.8, 7.061], [250, 2961, 7.2725], [300, 3064.6, 7.4614], [350, 3168.1, 7.6346], [400, 3272.4, 7.7956], [500, 3484.5, 8.0893], [600, 3702.5, 8.3544]] },
  { P: 1000, rows: [[200, 2828.3, 6.6956], [250, 2943.1, 6.9265], [300, 3051.6, 7.1246], [350, 3158.2, 7.3029], [400, 3264.5, 7.467], [450, 3371.3, 7.6198], [500, 3479.1, 7.7642], [600, 3698.6, 8.0311]] },
  { P: 2000, rows: [[250, 2903.3, 6.5475], [300, 3024.2, 6.7684], [350, 3137.7, 6.9583], [400, 3248.4, 7.1292], [450, 3358.2, 7.2866], [500, 3468.3, 7.4337], [600, 3690.7, 7.7043]] },
  { P: 3000, rows: [[250, 2856.5, 6.2893], [300, 2994.3, 6.5412], [350, 3116.1, 6.745], [400, 3231.7, 6.9235], [450, 3344.9, 7.0856], [500, 3457.2, 7.2359], [600, 3682.8, 7.5103]] },
  { P: 4000, rows: [[275, 2886.9, 6.2312], [300, 2961.7, 6.3639], [350, 3093.3, 6.5843], [400, 3214.5, 6.7714], [450, 3331.2, 6.9386], [500, 3446, 7.0922], [600, 3674.9, 7.3706]] },
  { P: 5000, rows: [[300, 2925.7, 6.2111], [350, 3069.3, 6.4516], [400, 3196.7, 6.6483], [450, 3317.2, 6.821], [500, 3434.7, 6.9781], [600, 3666.9, 7.2605]] },
  { P: 6000, rows: [[300, 2885.6, 6.0703], [350, 3043.9, 6.3357], [400, 3178.3, 6.5432], [450, 3302.9, 6.7219], [500, 3423.1, 6.8826], [600, 3658.8, 7.1693]] },
  { P: 8000, rows: [[300, 2786.5, 5.7937], [350, 2988.1, 6.1321], [400, 3139.4, 6.3658], [450, 3273.3, 6.5579], [500, 3399.5, 6.7266], [600, 3642.4, 7.0221]] },
  { P: 10000, rows: [[325, 2810.3, 5.7596], [350, 2924, 5.9459], [400, 3097.5, 6.2141], [450, 3242.4, 6.4219], [500, 3375.1, 6.5995], [600, 3625.8, 6.9045]] },
  { P: 12500, rows: [[350, 2826.6, 5.7131], [400, 3040, 6.0433], [450, 3201.5, 6.2749], [500, 3343.6, 6.4651], [600, 3604.6, 6.7828]] },
  { P: 15000, rows: [[350, 2693.1, 5.4438], [400, 2975.7, 5.8819], [450, 3157.9, 6.1434], [500, 3310.8, 6.348], [600, 3583.1, 6.6796]] },
];
const R134A_SAT: readonly SatRow[] = [
  [-40, 51.25, 0, 0, 225.86, 0, 0.96866],
  [-36.95, 60, 0, 3.83, 227.8, 0.01633, 0.96498],
  [-26.37, 100, 0, 17.28, 234.44, 0.07188, 0.95209],
  [-22.32, 120, 0, 22.49, 236.97, 0.09275, 0.94798],
  [-18.77, 140, 0, 27.08, 239.16, 0.11087, 0.94456],
  [-15.6, 160, 0, 31.21, 241.11, 0.12693, 0.9419],
  [-12.73, 180, 0, 34.98, 242.86, 0.14139, 0.9395],
  [-10.09, 200, 0, 38.43, 244.46, 0.15457, 0.93773],
  [-5.38, 240, 0, 44.66, 247.28, 0.17794, 0.93487],
  [0, 293.01, 0, 51.63, 250.45, 0.20439, 0.93139],
  [8.91, 400, 0, 63.94, 255.55, 0.24761, 0.92691],
  [15.71, 500, 0, 73.33, 259.3, 0.28023, 0.924],
  [21.55, 600, 0, 81.51, 262.4, 0.30808, 0.9218],
  [26.69, 700, 0, 88.82, 265.03, 0.3323, 0.92],
  [31.31, 800, 0, 95.47, 267.29, 0.35404, 0.91835],
  [35.51, 900, 0, 101.61, 269.25, 0.37377, 0.91686],
  [39.37, 1000, 0, 107.32, 270.99, 0.39189, 0.91558],
  [46.29, 1200, 0, 117.77, 273.87, 0.42441, 0.91303],
  [52.4, 1400, 0, 127.22, 276.08, 0.45315, 0.9105],
  [57.88, 1600, 0, 135.93, 277.86, 0.47911, 0.90784],
  [60, 1681.8, 0, 139.36, 278.47, 0.48939, 0.90695],
  [70, 2116.8, 0, 155.2, 279, 0.5376, 0.901],
  [80, 2633.2, 0, 173.9, 277.6, 0.5886, 0.8822],
  [90, 3244.2, 0, 194.5, 273.6, 0.6436, 0.8614],
  [100, 3972.4, 0, 222.2, 263.6, 0.7168, 0.8277],
  [101.06, 4059.3, 0, 241.2, 241.2, 0.7665, 0.7665],
];

export const K0 = 273.15;

export interface Fluid {
  name: string;
  /** Saturação em ordem crescente de T; a última linha é o ponto crítico. */
  sat: readonly SatRow[];
  /** Vapor superaquecido tabelado (ou null: usa `cpv`). */
  sup: readonly Isobar[] | null;
  /** cp médio do vapor logo acima da saturação (kJ/kg·K), em função de T_sat (°C). */
  cpv: (Tsat: number) => number;
}

export interface Sat {
  T: number;
  P: number;
  vf: number;
  hf: number;
  hg: number;
  sf: number;
  sg: number;
  hfg: number;
  sfg: number;
}

/** Estado do fluido. x = título (0 no líquido, 1 no vapor saturado ou superaquecido). */
export interface FState {
  P: number;
  T: number;
  h: number;
  s: number;
  x: number;
  phase: 'liq' | 'mix' | 'vap';
}

/** Índice i com linha[i][col] ≤ v ≤ linha[i + 1][col] (nas pontas, o trecho da ponta, para extrapolar). */
function bracket(rows: readonly SatRow[], col: number, v: number): number {
  let lo = 0;
  let hi = rows.length - 1;
  if (v <= rows[0][col]) return 0;
  if (v >= rows[hi][col]) return hi - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (rows[m][col] <= v) lo = m;
    else hi = m;
  }
  return lo;
}

/** Saturação à temperatura T (°C). */
export function satT(f: Fluid, T: number): Sat {
  const i = bracket(f.sat, 0, T);
  const a = f.sat[i];
  const b = f.sat[i + 1];
  const u = (T - a[0]) / (b[0] - a[0]);
  const w = (1 / (a[0] + K0) - 1 / (T + K0)) / (1 / (a[0] + K0) - 1 / (b[0] + K0));
  const P = Math.exp(Math.log(a[1]) + w * (Math.log(b[1]) - Math.log(a[1])));
  const L = (k: number) => a[k] + u * (b[k] - a[k]);
  const hf = L(3);
  const hg = L(4);
  const sf = L(5);
  const sg = L(6);
  return { T, P, vf: L(2), hf, hg, sf, sg, hfg: hg - hf, sfg: sg - sf };
}

/** Saturação à pressão P (kPa). */
export function satP(f: Fluid, P: number): Sat {
  const i = bracket(f.sat, 1, P);
  const a = f.sat[i];
  const b = f.sat[i + 1];
  const w = (Math.log(P) - Math.log(a[1])) / (Math.log(b[1]) - Math.log(a[1]));
  const invT = 1 / (a[0] + K0) + w * (1 / (b[0] + K0) - 1 / (a[0] + K0));
  return { ...satT(f, 1 / invT - K0), P };
}

/** T (°C) do líquido saturado com o valor v na coluna col (3 = h_l, 5 = s_l). */
function liquidT(f: Fluid, col: number, v: number): number {
  const i = bracket(f.sat, col, v);
  const a = f.sat[i];
  const b = f.sat[i + 1];
  return a[0] + ((v - a[col]) / (b[col] - a[col])) * (b[0] - a[0]);
}

/** Isobaras com a linha de vapor saturado na frente: [T, h, s][]. Calculadas uma vez por isobara. */
const fullRows = new Map<Isobar, number[][]>();
function isobarRows(f: Fluid, iso: Isobar): number[][] {
  let rows = fullRows.get(iso);
  if (!rows) {
    const s = satP(f, iso.P);
    rows = [[s.T, s.hg, s.sg], ...iso.rows.map((r) => [...r])];
    fullRows.set(iso, rows);
  }
  return rows;
}

/** Afastamento da saturação (Δh, Δs) numa isobara tabelada, com superaquecimento dT. */
function departure(rows: number[][], dT: number): { dh: number; ds: number } {
  const T = rows[0][0] + dT;
  let k = 1;
  while (k < rows.length - 1 && rows[k][0] < T) k++;
  const a = rows[k - 1];
  const b = rows[k];
  const u = (T - a[0]) / (b[0] - a[0]);
  return { dh: a[1] + u * (b[1] - a[1]) - rows[0][1], ds: a[2] + u * (b[2] - a[2]) - rows[0][2] };
}

/** Vapor superaquecido com saturação `sat` já calculada e superaquecimento dT ≥ 0 (K). */
function vapor(f: Fluid, sat: Sat, dT: number): { h: number; s: number } {
  if (!f.sup) {
    const cp = f.cpv(sat.T);
    return { h: sat.hg + cp * dT, s: sat.sg + cp * Math.log((sat.T + dT + K0) / (sat.T + K0)) };
  }
  const isos = f.sup;
  let j = 0;
  while (j < isos.length - 2 && isos[j + 1].P < sat.P) j++;
  const A = departure(isobarRows(f, isos[j]), dT);
  const B = departure(isobarRows(f, isos[j + 1]), dT);
  const w = (Math.log(sat.P) - Math.log(isos[j].P)) / (Math.log(isos[j + 1].P) - Math.log(isos[j].P));
  return { h: sat.hg + A.dh + w * (B.dh - A.dh), s: sat.sg + A.ds + w * (B.ds - A.ds) };
}

/** Superaquecimento dT com prop(dT) = alvo (prop cresce com dT). */
function solveDT(prop: (dT: number) => number, target: number): number {
  let lo = 0;
  let hi = 1200;
  if (prop(lo) >= target) return 0;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (prop(m) < target) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/** Líquido comprimido (ou saturado) a P e T: aproximado pelo líquido saturado à mesma T, com h corrigido por v·ΔP. */
export function liquidAt(f: Fluid, P: number, T: number): FState {
  const s = satT(f, T);
  return { P, T, h: s.hf + s.vf * Math.max(0, P - s.P), s: s.sf, x: 0, phase: 'liq' };
}

/** Vapor (superaquecido, ou saturado se T ≤ T_sat) a P e T. */
export function vaporAt(f: Fluid, P: number, T: number): FState {
  const sat = satP(f, P);
  const dT = Math.max(0, T - sat.T);
  const v = vapor(f, sat, dT);
  return { P, T: sat.T + dT, h: v.h, s: v.s, x: 1, phase: 'vap' };
}

/** Estado a partir de P e T: líquido abaixo da saturação; vapor na saturação ou acima. */
export function stateFromPT(f: Fluid, P: number, T: number): FState {
  const sat = satP(f, P);
  return T < sat.T - 1e-9 ? liquidAt(f, P, T) : vaporAt(f, P, T);
}

/** Estado a partir de P e h. */
export function stateFromPh(f: Fluid, P: number, h: number): FState {
  const sat = satP(f, P);
  if (h <= sat.hf) {
    // líquido comprimido: h = h_l(T) + v·(P − P_sat(T)); uma correção basta
    const T0 = liquidT(f, 3, h);
    const s0 = satT(f, T0);
    const T = Math.min(sat.T, liquidT(f, 3, h - s0.vf * Math.max(0, P - s0.P)));
    return { P, T, h, s: satT(f, T).sf, x: 0, phase: 'liq' };
  }
  if (h <= sat.hg) {
    const x = (h - sat.hf) / sat.hfg;
    return { P, T: sat.T, h, s: sat.sf + x * sat.sfg, x, phase: 'mix' };
  }
  const dT = solveDT((d) => vapor(f, sat, d).h, h);
  return { P, T: sat.T + dT, h, s: vapor(f, sat, dT).s, x: 1, phase: 'vap' };
}

/** Estado a partir de P e s. */
export function stateFromPs(f: Fluid, P: number, s: number): FState {
  const sat = satP(f, P);
  if (s <= sat.sf) {
    const T = Math.min(sat.T, liquidT(f, 5, s));
    const l = satT(f, T);
    return { P, T, h: l.hf + l.vf * Math.max(0, P - l.P), s, x: 0, phase: 'liq' };
  }
  if (s <= sat.sg) {
    const x = (s - sat.sf) / sat.sfg;
    return { P, T: sat.T, h: sat.hf + x * sat.hfg, s, x, phase: 'mix' };
  }
  const dT = solveDT((d) => vapor(f, sat, d).s, s);
  return { P, T: sat.T + dT, h: vapor(f, sat, dT).h, s, x: 1, phase: 'vap' };
}

/** Cúpula de saturação no diagrama T–s: líquido saturado subindo até o ponto crítico e vapor saturado descendo. */
export function domeTs(f: Fluid): [number, number][] {
  return [...f.sat.map((r) => [r[5], r[0]] as [number, number]), ...[...f.sat].reverse().map((r) => [r[6], r[0]] as [number, number])];
}

/** Cúpula no diagrama P–h (P em kPa). */
export function domePh(f: Fluid): [number, number][] {
  return [...f.sat.map((r) => [r[3], r[1]] as [number, number]), ...[...f.sat].reverse().map((r) => [r[4], r[1]] as [number, number])];
}

/** cp médio do vapor de R-134a logo acima da saturação, em função de T_sat (°C). */
const R134A_CPV: [number, number][] = [
  [-40, 0.74],
  [-20, 0.8],
  [0, 0.88],
  [20, 0.97],
  [30, 1.03],
  [40, 1.1],
  [50, 1.19],
  [60, 1.31],
];
function cpR134a(Tsat: number): number {
  const t = R134A_CPV;
  if (Tsat <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) if (Tsat <= t[i][0]) return t[i - 1][1] + ((Tsat - t[i - 1][0]) / (t[i][0] - t[i - 1][0])) * (t[i][1] - t[i - 1][1]);
  return t[t.length - 1][1];
}

export const WATER: Fluid = { name: 'água', sat: WATER_SAT, sup: WATER_SUP, cpv: () => 2 };
export const R134A: Fluid = { name: 'R-134a', sat: R134A_SAT, sup: null, cpv: cpR134a };
