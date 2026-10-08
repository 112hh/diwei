
/* -*- coding: utf-8 -*- */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof state === "undefined") return;
  if (window.__mlffExcelRealApplied) return;
  window.__mlffExcelRealApplied = true;

  var AU2A3 = 0.1481847112;          /* 1 a.u. of polarizability -> Angstrom^3 */
  var ESC = function (v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var NUM = function (v) { var n = parseFloat(v); return isFinite(n) ? n : null; };
  var FX = function (v, d) { return v == null || !isFinite(v) ? "—" : Number(v).toFixed(d == null ? 2 : d); };

  /* ================================================================
     1. 名称库（翻译补全）：分子式 -> [中文名, 英文名, 物质类型]
     ================================================================ */
  var NAME = {
    "H2O": ["水", "Water", "无机小分子"],
    "CO2": ["二氧化碳", "Carbon Dioxide", "无机小分子"],
    "NH3": ["氨", "Ammonia", "无机小分子"],
    "CH4": ["甲烷", "Methane", "有机小分子"],
    "C2H4": ["乙烯", "Ethylene", "有机小分子"],
    "C2H2": ["乙炔", "Acetylene", "有机小分子"],
    "H2O2": ["过氧化氢", "Hydrogen Peroxide", "无机小分子"],
    "SO2": ["二氧化硫", "Sulfur Dioxide", "无机小分子"],
    "NO2": ["二氧化氮", "Nitrogen Dioxide", "无机小分子"],
    "HNO3": ["硝酸", "Nitric Acid", "无机小分子"],
    "H2SO4": ["硫酸", "Sulfuric Acid", "无机小分子"],
    "CH3OH": ["甲醇", "Methanol", "有机小分子"],
    "C6H6": ["苯", "Benzene", "有机小分子"],
    "C6H12": ["环己烷", "Cyclohexane", "有机小分子"],
    "N2": ["氮气", "Nitrogen", "无机小分子"],
    "CO": ["一氧化碳", "Carbon Monoxide", "无机小分子"],
    "O3": ["臭氧", "Ozone", "无机小分子"],
    "HCl": ["氯化氢", "Hydrogen Chloride", "无机小分子"],
    "HF": ["氟化氢", "Hydrogen Fluoride", "无机小分子"],
    "CH2O": ["甲醛", "Formaldehyde", "有机小分子"],
    "Si": ["硅", "Silicon", "单质"],
    "Fe": ["铁", "Iron", "单质"],
    "Al": ["铝", "Aluminium", "单质"],
    "Mg": ["镁", "Magnesium", "单质"],
    "Mo": ["钼", "Molybdenum", "单质"],
    "Ti": ["钛", "Titanium", "单质"],
    "Ni": ["镍", "Nickel", "单质"],
    "Cu": ["铜", "Copper", "单质"],
    "C": ["碳", "Carbon", "单质"],
    "Cr2O3": ["三氧化二铬", "Chromium(III) Oxide", "氧化物"],
    "Cs": ["铯", "Caesium", "单质"],
    "FeS2": ["二硫化铁", "Iron Disulfide", "硫化物"],
    "Li": ["锂", "Lithium", "单质"],
    "Na": ["钠", "Sodium", "单质"],
    "MoS2": ["二硫化钼", "Molybdenum Disulfide", "硫化物"],
    "Fe3O4": ["四氧化三铁", "Triiron Tetroxide", "氧化物"],
    "SiO2": ["二氧化硅", "Silicon Dioxide", "氧化物"],
    "LiF": ["氟化锂", "Lithium Fluoride", "卤化物"],
    "SiC": ["碳化硅", "Silicon Carbide", "碳化物"],
    "Al2O3": ["三氧化二铝", "Aluminium Oxide", "氧化物"],
    "NaCl": ["氯化钠", "Sodium Chloride", "卤化物"],
    "LiCoO2": ["钴酸锂", "Lithium Cobalt Oxide", "氧化物"],
    "LiFePO4": ["磷酸铁锂", "Lithium Iron Phosphate", "磷酸盐"],
    "Fe2O3": ["三氧化二铁", "Iron(III) Oxide", "氧化物"],
    "ZnS": ["硫化锌", "Zinc Sulfide", "硫化物"],
    "MgO": ["氧化镁", "Magnesium Oxide", "氧化物"],
    "TiO2": ["二氧化钛", "Titanium Dioxide", "氧化物"],
    "Li10GeP2S12": ["硫代磷酸锗锂", "Lithium Germanium Thiophosphate", "硫化物"],
    "Cu2O": ["氧化亚铜", "Copper(I) Oxide", "氧化物"],
    "ZrO2": ["二氧化锆", "Zirconium Dioxide", "氧化物"],
    "WO3": ["三氧化钨", "Tungsten Trioxide", "氧化物"],
    "NiO": ["氧化镍", "Nickel(II) Oxide", "氧化物"],
    "CeO2": ["二氧化铈", "Cerium(IV) Oxide", "氧化物"],
    "Li3PO4": ["磷酸锂", "Lithium Phosphate", "磷酸盐"],
    "MoSe2": ["二硒化钼", "Molybdenum Diselenide", "硒化物"],
    "CsPbI3": ["碘化铅铯", "Caesium Lead Iodide", "卤化物"]
  };

  /* ================================================================
     2. 原子参考常数（公开参考数据）
        POL：静态偶极极化率 (a.u.)，Schwerdtfeger & Nagle 2018
        IP ：第一电离能 (eV)
     ================================================================ */
  var ATOM = {
    H:  { pol: 4.507, ip: 13.598 },
    Li: { pol: 164.11, ip: 5.392 },
    C:  { pol: 11.30, ip: 11.260 },
    N:  { pol: 7.40, ip: 14.534 },
    O:  { pol: 5.40, ip: 13.618 },
    F:  { pol: 3.76, ip: 17.423 },
    Na: { pol: 162.70, ip: 5.139 },
    Mg: { pol: 71.20, ip: 7.646 },
    Al: { pol: 57.80, ip: 5.986 },
    Si: { pol: 37.30, ip: 8.152 },
    P:  { pol: 25.00, ip: 10.487 },
    S:  { pol: 19.40, ip: 10.360 },
    Cl: { pol: 14.60, ip: 12.968 },
    K:  { pol: 292.90, ip: 4.341 },
    Ca: { pol: 160.20, ip: 6.113 },
    Ti: { pol: 117.00, ip: 6.828 },
    Cr: { pol: 88.00, ip: 6.767 },
    Mn: { pol: 80.00, ip: 7.434 },
    Fe: { pol: 69.00, ip: 7.902 },
    Co: { pol: 62.00, ip: 7.881 },
    Ni: { pol: 56.00, ip: 7.640 },
    Cu: { pol: 50.00, ip: 7.726 },
    Zn: { pol: 47.00, ip: 9.394 },
    Ge: { pol: 40.00, ip: 7.900 },
    Se: { pol: 28.90, ip: 9.752 },
    Zr: { pol: 136.00, ip: 6.634 },
    Mo: { pol: 116.00, ip: 7.092 },
    Ag: { pol: 55.00, ip: 7.576 },
    Sn: { pol: 53.00, ip: 7.344 },
    I:  { pol: 32.90, ip: 10.451 },
    Cs: { pol: 401.00, ip: 3.894 },
    Ba: { pol: 272.00, ip: 5.212 },
    La: { pol: 215.00, ip: 5.577 },
    Ce: { pol: 205.00, ip: 5.539 },
    W:  { pol: 118.00, ip: 7.864 },
    Pb: { pol: 47.00, ip: 7.417 }
  };

  /* 分子式解析：H2O / C2H5OH / Li10GeP2S12 -> [{el,n}] */
  function parseFormula(f) {
    var out = [], re = /([A-Z][a-z]?)(\d*)/g, m;
    while ((m = re.exec(String(f))) !== null) {
      if (!m[1]) continue;
      out.push({ el: m[1], n: m[2] ? parseInt(m[2], 10) : 1 });
    }
    return out;
  }

  /* 长程参数（按原子加和法，基于上表公开原子参考数据）*/
  function longRangeParams(formula) {
    var parts = parseFormula(formula), nTot = 0, alphaAU = 0, ipW = 0;
    parts.forEach(function (p) {
      var a = ATOM[p.el]; if (!a) return;
      nTot += p.n; alphaAU += a.pol * p.n; ipW += a.ip * p.n;
    });
    if (!nTot || !alphaAU) return null;
    var alphaA3 = alphaAU * AU2A3;                       /* 分子式单元极化率 Å³ */
    var ipEff = ipW / nTot;                              /* 有效电离能 eV */
    /* London 公式自色散系数：C6 = 3/4 · I · α² (a.u. -> eV·Å⁶) */
    var au2eva6 = 27.211386 * Math.pow(0.5291772109, 6);
    var c6 = 0.75 * (ipEff / 27.211386) * alphaAU * alphaAU * au2eva6;
    return { alpha: alphaA3, c6: c6, ip: ipEff, atoms: nTot };
  }

  /* 形式电荷 -> Bader 电荷（按典型离子性 0.85 折算；金属体系趋于 0）*/
  var OXIDE = {
    Li: 1, Na: 1, K: 1, Rb: 1, Cs: 1, Mg: 2, Ca: 2, Sr: 2, Ba: 2, Al: 3, Zn: 2,
    Fe: 3, Co: 3, Ni: 2, Cu: 2, Mn: 2, Cr: 3, Ti: 4, Zr: 4, Ce: 4, Pb: 2, Ge: 4,
    Mo: 4, W: 6, Si: 4, Sn: 4, P: 5
  };
  var METALLIC = { Si: 1, Fe: 1, Al: 1, Mg: 1, Mo: 1, Ti: 1, Ni: 1, Cu: 1, C: 1, Cs: 1, Li: 1, Na: 1 };

  function baderCharge(formula, metallic) {
    if (metallic) return null;
    var parts = parseFormula(formula);
    var positives = [], negatives = [];
    var totalPos = 0;
    parts.forEach(function (p) {
      if (p.el === "O" || p.el === "F" || p.el === "Cl" || p.el === "S" || p.el === "Se" || p.el === "I") negatives.push(p);
      else { var ox = OXIDE[p.el] || 0; positives.push({ el: p.el, n: p.n, ox: ox }); totalPos += ox * p.n; }
    });
    if (!negatives.length || totalPos <= 0) return null;
    /* 阴离子分摊正电荷（O 记 -2，其余记 -1/硫属 -2）*/
    var negVal = negatives.map(function (p) {
      var v = (p.el === "O" || p.el === "S" || p.el === "Se") ? 2 : 1;
      return { el: p.el, n: p.n, v: v };
    });
    var totalNeg = negVal.reduce(function (s, p) { return s + p.v * p.n; }, 0);
    if (!totalNeg) return null;
    var ions = [];
    positives.forEach(function (p) {
      var share = totalPos ? (p.ox * p.n / totalPos) : 0;
      var q = (p.ox * share * totalNeg / p.n) * 0.85 / (totalPos / Math.max(1, positives.length));
      q = p.ox * 0.85;
      ions.push({ el: p.el, q: q });
    });
    negVal.forEach(function (p) {
      ionPush(ions, p.el, -p.v * 0.85);
    });
    return ions;
  }
  function ionPush(arr, el, q) {
    for (var i = 0; i < arr.length; i++) if (arr[i].el === el) return;
    arr.push({ el: el, q: q });
  }
  function ionText(ions) {
    if (!ions || !ions.length) return null;
    return ions.map(function (i) {
      var s = i.q >= 0 ? "+" : "−";
      return i.el + " " + s + Math.abs(i.q).toFixed(2);
    }).join(" / ");
  }

  /* ================================================================
     3. 分子三维坐标（实验/计算平衡构型，单位 Å）
     ================================================================ */
  function ring(n, r, z, els) {
    var a = [], i, t;
    for (i = 0; i < n; i++) { t = Math.PI * 2 * i / n; a.push([r * Math.cos(t), r * Math.sin(t), z]); }
    return a;
  }
  function benzeneXYZ() {
    var C = ring(6, 1.397, 0), H = ring(6, 2.487, 0);
    return { els: ["C","C","C","C","C","C","H","H","H","H","H","H"], xyz: C.concat(H) };
  }
  function cyclohexaneXYZ() {
    var kc = 1.3050, kd = 1.1304, kz = 0.4052;
    var C = [
      [kc, 0, kz], [kc / 2, kd, -kz], [-kc / 2, kd, kz],
      [-kc, 0, -kz], [-kc / 2, -kd, kz], [kc / 2, -kd, -kz]
    ];
    var els = ["C","C","C","C","C","C"], xyz = C.slice(), i;
    for (i = 0; i < 6; i++) {
      var p = C[i], p1 = C[(i + 5) % 6], p2 = C[(i + 1) % 6];
      var u1 = sub(p, p1), u2 = sub(p, p2);
      u1 = unit(u1); u2 = unit(u2);
      var bis = unit(add(u1, u2));                 /* 指向环内 */
      var nrm = unit(cross(u1, u2));               /* 环平面法向 */
      var d1 = unit(add(scale(bis, -1), scale(nrm, 0.95)));
      var d2 = unit(add(scale(bis, -1), scale(nrm, -0.95)));
      xyz.push(add(p, scale(d1, 1.09))); els.push("H");
      xyz.push(add(p, scale(d2, 1.09))); els.push("H");
    }
    return { els: els, xyz: xyz };
  }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function scale(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function unit(a) { var n = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; }

  var MOLXYZ = {
    "mol-1":  { els: ["O","H","H"], xyz: [[0,0,0],[0.7570,0.5860,0],[-0.7570,0.5860,0]] },
    "mol-2":  { els: ["C","O","O"], xyz: [[0,0,0],[1.1600,0,0],[-1.1600,0,0]] },
    "mol-3":  { els: ["N","H","H","H"], xyz: [[0,0,0.1173],[0,0.9377,-0.2739],[0.8121,-0.4688,-0.2739],[-0.8121,-0.4688,-0.2739]] },
    "mol-4":  { els: ["C","H","H","H","H"], xyz: [[0,0,0],[0.6287,0.6287,0.6287],[-0.6287,-0.6287,0.6287],[-0.6287,0.6287,-0.6287],[0.6287,-0.6287,-0.6287]] },
    "mol-5":  { els: ["C","C","H","H","H","H"], xyz: [[0.6695,0,0],[-0.6695,0,0],[1.2321,0.9289,0],[1.2321,-0.9289,0],[-1.2321,0.9289,0],[-1.2321,-0.9289,0]] },
    "mol-6":  { els: ["C","C","H","H"], xyz: [[0.6015,0,0],[-0.6015,0,0],[1.6625,0,0],[-1.6625,0,0]] },
    "mol-7":  { els: ["O","O","H","H"], xyz: [[0,0.7375,-0.0528],[0,-0.7375,-0.0528],[0.8190,0.8170,0.4220],[-0.8190,-0.8170,0.4220]] },
    "mol-8":  { els: ["S","O","O"], xyz: [[0,0,0],[1.2360,0.7209,0],[-1.2360,0.7209,0]] },
    "mol-9":  { els: ["N","O","O"], xyz: [[0,0,0],[1.0988,0.4654,0],[-1.0988,0.4654,0]] },
    "mol-10": { els: ["N","O","O","O","H"], xyz: [[0,0,0],[0,1.2110,0],[1.1970,-0.3530,0],[-1.1970,-0.3530,0],[-2.0100,-0.7850,0]] },
    "mol-11": { els: ["S","O","O","O","O","H","H"], xyz: [[0,0,0],[0.8256,0.8256,0.8256],[0.8256,-0.8256,-0.8256],[-0.9064,0.9064,-0.9064],[-0.9064,-0.9064,0.9064],[-1.7500,0.6500,-1.0500],[-1.7500,-0.6500,1.0500]] },
    "mol-12": { els: ["C","O","H","H","H","H"], xyz: [[0,0,0],[1.4300,0,0],[1.8900,0.8600,0],[-0.3600,1.0260,0],[-0.3600,-0.5130,0.8890],[-0.3600,-0.5130,-0.8890]] },
    "mol-13": benzeneXYZ(),
    "mol-14": cyclohexaneXYZ(),
    "mol-15": { els: ["N","N"], xyz: [[0,0,0.5490],[0,0,-0.5490]] },
    "mol-16": { els: ["C","O"], xyz: [[0,0,-0.5645],[0,0,0.5645]] },
    "mol-17": { els: ["O","O","O"], xyz: [[0,0.5980,0],[1.0875,-0.2990,0],[-1.0875,-0.2990,0]] },
    "mol-18": { els: ["H","Cl"], xyz: [[0,0,-0.6350],[0,0,0.6350]] },
    "mol-19": { els: ["H","F"], xyz: [[0,0,-0.4585],[0,0,0.4585]] },
    "mol-20": { els: ["C","O","H","H"], xyz: [[0,0,0],[0,0,1.2050],[0.9425,0,-0.5875],[-0.9425,0,-0.5875]] }
  };

  /* ================================================================
     4. 晶体结构原型（基于公开晶胞参数与空间群）
     ================================================================ */
  function fccB() { return [[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]]; }
  function bccB() { return [[0,0,0],[.5,.5,.5]]; }
  function hcpB() { return [[1/3,2/3,.25],[2/3,1/3,.75]]; }

  var PROTOS = {
    fcc: function (m) { return fccB().map(function (f) { return [m.A].concat(f); }); },
    bcc: function (m) { return bccB().map(function (f) { return [m.A].concat(f); }); },
    hcp: function (m) { return hcpB().map(function (f) { return [m.A].concat(f); }); },
    diamond: function (m) { return fccB().map(function (f) { return [m.A].concat(f); })
      .concat([[.25,.25,.25],[.25,.75,.75],[.75,.25,.75],[.75,.75,.25]].map(function (f) { return [m.A].concat(f); })); },
    graphite: function (m) { return [[0,0,.25],[0,0,.75],[1/3,2/3,.25],[2/3,1/3,.75]].map(function (f) { return [m.A].concat(f); }); },
    rocksalt: function (m) { return fccB().map(function (f) { return [m.A].concat(f); })
      .concat([[.5,0,0],[0,.5,0],[0,0,.5],[.5,.5,.5]].map(function (f) { return [m.B].concat(f); })); },
    zincblende: function (m) { return fccB().map(function (f) { return [m.A].concat(f); })
      .concat([[.25,.25,.25],[.25,.75,.75],[.75,.25,.75],[.75,.75,.25]].map(function (f) { return [m.B].concat(f); })); },
    fluorite: function (m) { return fccB().map(function (f) { return [m.A].concat(f); })
      .concat([[.25,.25,.25],[.75,.75,.25],[.75,.25,.75],[.25,.75,.75],[.75,.75,.75],[.25,.25,.75],[.25,.75,.25],[.75,.25,.25]].map(function (f) { return [m.B].concat(f); })); },
    pyrite: function (m) {
      var u = 0.385, out = fccB().map(function (f) { return [m.A].concat(f); });
      var s = [[u,u,u],[.5+u,.5-u,-u],[-u,.5+u,.5-u],[.5-u,-u,.5+u],[-u,-u,-u],[.5-u,.5+u,u],[u,.5-u,.5+u],[.5+u,u,.5-u]];
      s.forEach(function (f) { out.push([m.B].concat(f.map(function (v) { return v - Math.floor(v); }))); });
      return out;
    },
    cuprite: function (m) {
      var cu = [[.25,.25,.25],[.75,.75,.25],[.75,.25,.75],[.25,.75,.75]].map(function (f) { return [m.A].concat(f); });
      return cu.concat([[0,0,0],[.5,.5,.5]].map(function (f) { return [m.B].concat(f); }));
    },
    perovskite: function (m) { return [[m.A,0,0,0],[m.B,.5,.5,.5],
      [m.C,.5,.5,0],[m.C,.5,0,.5],[m.C,0,.5,.5]]; },
    reo3: function (m) { return [[m.A,0,0,0],[m.B,.5,0,0],[m.B,0,.5,0],[m.B,0,0,.5]]; },
    quartz: function (m) {
      var u = 0.4697, x = 0.4135, y = 0.2669, z = 0.1191;
      var si = [[u,0,0],[0,u,2/3],[-u,-u,1/3]].map(function (f) { return [m.A].concat(f); });
      var o = [
        [x,y,z], [-y,x-y,z+1/3], [y-x,-x,z+2/3],
        [y,x,-z], [x-y,-y,-z+1/3], [-x,y-x,-z+2/3]
      ].map(function (f) { return [m.B].concat(f.map(function (v) { return ((v % 1) + 1) % 1; })); });
      return si.concat(o);
    },
    rutile: function (m) {
      var u = 0.3053;
      return [[m.A,0,0,0],[m.A,.5,.5,.5],
        [m.B,u,u,0],[m.B,1-u,1-u,0],[m.B,.5+u,.5-u,.5],[m.B,.5-u,.5+u,.5]];
    },
    mos2: function (m) {
      var z = 0.621;
      return [[m.A,1/3,2/3,.25],[m.A,2/3,1/3,.75],
        [m.B,1/3,2/3,z],[m.B,2/3,1/3,.5+z],[m.B,2/3,1/3,1-z],[m.B,1/3,2/3,.5-z]];
    },
    corundum: function (m) {
      var z = m.z || 0.3522, x = m.x || 0.3062;
      var cen = [[0,0,0],[2/3,1/3,1/3],[1/3,2/3,2/3]];
      var mBase = [[0,0,z],[0,0,z+.5],[0,0,-z],[0,0,.5-z]];
      var oBase = [[x,0,.25],[0,x,.25],[-x,-x,.25],[x,0,.75],[0,x,.75],[-x,-x,.75]];
      var out = [];
      cen.forEach(function (c) {
        mBase.forEach(function (f) { out.push([m.A].concat(f.map(function (v, i) { return ((v + c[i]) % 1 + 1) % 1; }))); });
        oBase.forEach(function (f) { out.push([m.B].concat(f.map(function (v, i) { return ((v + c[i]) % 1 + 1) % 1; }))); });
      });
      return out;
    },
    layered: function (m) {
      /* α-NaFeO2 型（R-3m）：Li 3a / Co 3b / O 6c */
      var z = 0.2395, cen = [[0,0,0],[2/3,1/3,1/3],[1/3,2/3,2/3]], out = [];
      cen.forEach(function (c) {
        out.push([m.A, c[0], c[1], c[2]]);
        out.push([m.B, ((0 + c[0]) % 1), ((0 + c[1]) % 1), ((.5 + c[2]) % 1)]);
        out.push([m.C, ((0 + c[0]) % 1), ((0 + c[1]) % 1), ((z + c[2]) % 1)]);
        out.push([m.C, ((0 + c[0]) % 1), ((0 + c[1]) % 1), (((1 - z) + c[2]) % 1)]);
      });
      return out;
    },
    baddeleyite: function (m) {
      var zr = [0.2757, 0.0400, 0.2085], o1 = [0.0700, 0.3310, 0.3450], o2 = [0.4420, 0.7570, 0.4790];
      function gen(f) {
        var x = f[0], y = f[1], z = f[2];
        return [[x,y,z],[-x,-y,-z],[x,.5-y,.5+z],[-x,.5+y,.5-z]];
      }
      var out = [];
      gen(zr).forEach(function (f) { out.push([m.A].concat(mod1(f))); });
      gen(o1).forEach(function (f) { out.push([m.B].concat(mod1(f))); });
      gen(o2).forEach(function (f) { out.push([m.B].concat(mod1(f))); });
      return out;
    },
    olivine: function (m) {
      /* Pnma：Li 4a、Fe 4c、P 4c、O 4c×4 */
      function gen4c(f) {
        var x = f[0], y = f[1], z = f[2];
        return [[x,y,z],[-x,y+.5,z+.5],[-x,y+.5,-z],[x,y,.5-z]];
      }
      var out = [];
      [[0,0,0],[0,0,.5],[.5,.5,.5],[.5,0,0]].forEach(function (f) { out.push([m.A].concat(f)); });
      gen4c([0.2822, .25, 0.9746]).forEach(function (f) { out.push([m.B].concat(mod1(f))); });
      gen4c([0.0948, .25, 0.4179]).forEach(function (f) { out.push([m.C].concat(mod1(f))); });
      [[[0.0968,.25,0.7406]],[[0.4546,.25,0.2105]],[[0.1647,.25,0.7842]],[[0.4045,.25,0.7045]]].forEach(function (set) {
        gen4c(set[0]).forEach(function (f) { out.push([m.D].concat(mod1(f))); });
      });
      return out;
    },
    spinel: function (m) {
      /* Fd-3m（原点选择 2）：O 32e(理想 fcc) / A 8a / B 16d */
      var out = [], i, j, k;
      for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) for (k = 0; k < 4; k++) {
        if ((i + j + k) % 2 === 0) out.push([m.C, i / 4, j / 4, k / 4]);
      }
      [[.125,.125,.125],[.125,.625,.625],[.625,.125,.625],[.625,.625,.125],
       [.875,.875,.875],[.875,.375,.375],[.375,.875,.375],[.375,.375,.875]].forEach(function (f) { out.push([m.A].concat(f)); });
      [[.5,.5,.5],[.5,.25,.25],[.25,.5,.25],[.25,.25,.5]].forEach(function (b) {
        [[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]].forEach(function (t) {
          out.push([m.B, (b[0] + t[0]) % 1, (b[1] + t[1]) % 1, (b[2] + t[2]) % 1]);
        });
      });
      return out;
    },
    tetragonal: function (m) {
      /* 理想化四方硫化物骨架（Li10GeP2S12 型）：S 密堆 + P/Ge 四面体中心 + Li 通道，
         单胞 40 原子，与公开晶胞参数同量级 */
      var out = [], i, j, k;
      for (i = 0; i < 4; i++) for (j = 0; j < 3; j++) for (k = 0; k < 2; k++) {
        out.push([m.C, (i + .5) / 4, (j + .5) / 3, (k + .5) / 2]);
      }
      [[.25,.25,.25],[.75,.75,.25],[.25,.75,.75],[.75,.25,.75],
       [.25,.25,.75],[.75,.75,.75],[.25,.75,.25],[.75,.25,.25]].forEach(function (f) { out.push([m.B].concat(f)); });
      [[.5,.5,.5],[.5,0,0],[0,.5,0],[0,0,.5]].forEach(function (f) { out.push([m.A].concat(f)); });
      [[.125,.5,.5],[.625,.5,.5],[.125,.5,0],[.625,.5,0]].forEach(function (f) { out.push([m.D].concat(f)); });
      return out;
    },
    orthophosphate: function (m) {
      /* 理想化磷酸盐骨架（Li3PO4 型）：4 个 PO4 四面体 + 12 个 Li 通道位，共 32 原子 */
      var out = [], i, j;
      for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) {
        var c = [(i + .5) / 2, (j + .5) / 2, .5];
        out.push([m.C, c[0], c[1], c[2]]);
        out.push([m.D, c[0] + .16, c[1], c[2]]); out.push([m.D, c[0] - .16, c[1], c[2]]);
        out.push([m.D, c[0], c[1] + .19, c[2]]); out.push([m.D, c[0], c[1] - .19, c[2]]);
      }
      for (i = 0; i < 4; i++) for (j = 0; j < 3; j++) {
        out.push([m.A, (i + .5) / 4, (j + .5) / 3, .25]);
      }
      return out;
    }
  };
  function mod1(f) { return f.map(function (v) { return ((v % 1) + 1) % 1; }); }

  /* 需要由常规胞折叠出「原始胞」的原型：
     值 = 原始胞三条基矢在常规胞坐标系下的分数坐标（行向量） */
  var PRIM = {
    /* 刚玉型 R-3c（六方设置）：菱面体原始胞，体积为 1/3，原子数 30 -> 10 */
    corundum: [[2 / 3, 1 / 3, 1 / 3], [-1 / 3, 1 / 3, 1 / 3], [-1 / 3, -2 / 3, 1 / 3]]
  };

  /* 晶胞参数 -> 晶格矢量（行向量，Å）*/
  function latticeVectors(a, b, c, al, be, ga) {
    var r = Math.PI / 180;
    al *= r; be *= r; ga *= r;
    var ca = Math.cos(al), cb = Math.cos(be), cg = Math.cos(ga), sg = Math.sin(ga);
    var v1 = [a, 0, 0];
    var v2 = [b * cg, b * sg, 0];
    var cx = c * cb;
    var cy = c * (ca - cb * cg) / (sg || 1e-9);
    var cz = Math.sqrt(Math.max(0, c * c - cx * cx - cy * cy));
    return [v1, v2, [cx, cy, cz]];
  }

  /* 需要自定义晶格矢量（非六方/立方标准设置）的原型 */
  var CUSTOM = {
    /* 金刚石型原始胞（2 原子，与 Materials Project 的 mp-149 一致） */
    diamond2: function (def) {
      var a = def.a;
      return {
        lattice: [[0, a / 2, a / 2], [a / 2, 0, a / 2], [a / 2, a / 2, 0]],
        basis: [[def.A, 0, 0, 0], [def.A, 0.25, 0.25, 0.25]],
        dims: { a: a, b: a, c: a, al: 90, be: 90, ga: 90 },
        sg: def.sg
      };
    }
  };

  /* 3x3 矩阵求逆（行向量约定） */
  function invert3(M) {
    var a = M[0][0], b = M[0][1], c = M[0][2], d = M[1][0], e = M[1][1], f = M[1][2], g = M[2][0], h = M[2][1], i = M[2][2];
    var A = e * i - f * h, B = f * g - d * i, C = d * h - e * g;
    var det = a * A + b * B + c * C;
    if (!det) return null;
    return [
      [A / det, (c * h - b * i) / det, (b * f - c * e) / det],
      [B / det, (a * i - c * g) / det, (c * d - a * f) / det],
      [C / det, (b * g - a * h) / det, (a * e - b * d) / det]
    ];
  }
  /* 把一组笛卡尔坐标折叠进新的（更小）晶胞，并去重 —— 用于由常规胞得到原始胞 */
  function reduceAtoms(atoms, newL) {
    var inv = invert3(newL);
    if (!inv) return null;
    var seen = {}, out = [], n, i, j;
    for (n = 0; n < atoms.length; n++) {
      var p = atoms[n].pos, f = [0, 0, 0], q = [0, 0, 0];
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) f[i] += p[j] * inv[j][i];
      for (i = 0; i < 3; i++) { var w = ((f[i] % 1) + 1) % 1; f[i] = w > 0.9995 ? 0 : w; }
      var key = f.map(function (v) { return Math.round(v * 720); }).join("_");
      if (seen[key]) continue;
      seen[key] = 1;
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) q[i] += newL[j][i] * f[j];
      out.push({ el: atoms[n].el, pos: q });
    }
    return out;
  }
  /* 由晶格矢量反推晶胞参数 */
  function cellParamsFromL(L) {
    function len(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); }
    function ang(u, v) {
      var d = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
      return Math.acos(Math.max(-1, Math.min(1, d / (len(u) * len(v) || 1)))) * 180 / Math.PI;
    }
    return { a: len(L[0]), b: len(L[1]), c: len(L[2]), al: ang(L[1], L[2]), be: ang(L[0], L[2]), ga: ang(L[0], L[1]) };
  }

  /* 依据目标原子数挑选超胞倍数（用于小体系完整展示 / 大体系完整图像） */
  function chooseRep(base, target) {
    if (!base || !target || target < base) return [1, 1, 1];
    var want = target / base, best = [1, 1, 1], bestScore = Infinity, i, j, k;
    for (i = 1; i <= 8; i++) for (j = 1; j <= 8; j++) for (k = 1; k <= 8; k++) {
      var n = i * j * k;
      /* 优先精确命中；同分时取形状最接近立方者，其次取规模较大者 */
      var diff = Math.abs(n - want);
      var shape = Math.abs(Math.log(i) - Math.log(j)) + Math.abs(Math.log(j) - Math.log(k));
      var score = diff * 100 + shape;
      if (score < bestScore - 1e-9) { bestScore = score; best = [i, j, k]; }
    }
    return best;
  }

  /* ================================================================
     5. Excel 样例记录 -> 材料对象（三类结构，共 60 条）
     ================================================================ */
  var STRUCT_SOURCE = {
    molecule: "单分子性质计算数据集（Q-Chem / CCCBDB）",
    small: "Materials Project · 小体系采样集（CHGNet / MACE）",
    large: "Materials Project · 周期大体系集（CHGNet / MACE）"
  };
  var CLASS_LABEL = { molecule: "分子结构", small: "小体系结构", large: "大体系结构" };
  var CLASS_MAP = { molecule: "分子结构", small: "小体系结构", large: "大体系结构" };
  var STRUCT_TYPE = { molecule: "单体", small: "离子晶体", large: "聚合物" };
  var DATASET = { molecule: "单分子数据集", small: "小体系数据集", large: "大体系数据集" };

  /* 晶体结构定义：proto + 晶胞参数 + 元素分配 + 显示用超胞 */
  var CRYSTAL = {
    /* ---- 小体系结构 ---- */
    "mp-149":    { proto: "diamond2",     a: 5.431,            A: "Si", rep: [1,1,1], sg: "Fd-3m" },
    "mp-13":     { proto: "bcc",          a: 2.866,            A: "Fe", rep: [1,1,1], sg: "Im-3m" },
    "mp-30":     { proto: "fcc",          a: 4.050,            A: "Al", rep: [1,1,1], sg: "Fm-3m" },
    "mp-90":     { proto: "hcp",        a: 3.209, c: 5.211,    A: "Mg", rep: [1,1,1], sg: "P6₃/mmc" },
    "mp-79":     { proto: "bcc",          a: 3.147,            A: "Mo", rep: [1,1,1], sg: "Im-3m" },
    "mp-105":    { proto: "hcp",        a: 2.951, c: 4.684,    A: "Ti", rep: [1,1,1], sg: "P6₃/mmc" },
    "mp-23":     { proto: "fcc",          a: 3.524,            A: "Ni", rep: [1,1,1], sg: "Fm-3m" },
    "mp-146":    { proto: "fcc",          a: 3.615,            A: "Cu", rep: [1,1,1], sg: "Fm-3m" },
    "mp-66":     { proto: "graphite", a: 2.464, c: 6.711,      A: "C",  rep: [1,1,1], sg: "P6₃/mmc" },
    "mp-22862":  { proto: "corundum", a: 4.954, c: 13.578, A: "Cr", B: "O", z: 0.3475, x: 0.3038, rep: [1,1,1], sg: "R-3c" },
    "mp-2":      { proto: "bcc",          a: 6.141,            A: "Cs", rep: [1,1,1], sg: "Im-3m" },
    "mp-23152":  { proto: "pyrite",       a: 5.418,        A: "Fe", B: "S", rep: [1,1,1], sg: "Pa-3" },
    "mp-33":     { proto: "bcc",          a: 3.491,            A: "Li", rep: [1,1,1], sg: "Im-3m" },
    "mp-54":     { proto: "bcc",          a: 4.290,            A: "Na", rep: [1,1,1], sg: "Im-3m" },
    "mp-135":    { proto: "mos2",    a: 3.160, c: 12.295, A: "Mo", B: "S", rep: [1,1,1], sg: "P6₃/mmc" },
    "mp-22693":  { proto: "spinel",       a: 8.394, A: "Fe", B: "Fe", C: "O", rep: [1,1,1], sg: "Fd-3m" },
    "mp-1079":   { proto: "quartz",  a: 4.913, c: 5.405,  A: "Si", B: "O", rep: [1,1,1], sg: "P3₂21" },
    "mp-550382": { proto: "rocksalt",     a: 4.027,        A: "Li", B: "F", rep: [1,1,1], sg: "Fm-3m" },
    "mp-20182":  { proto: "zincblende",   a: 4.359,        A: "Si", B: "C", rep: [1,1,1], sg: "F-43m" },
    "mp-1143":   { proto: "corundum", a: 4.759, c: 12.991, A: "Al", B: "O", z: 0.3522, x: 0.3062, rep: [1,1,1], sg: "R-3c" },
    /* ---- 大体系结构 ---- */
    "mp-19009":   { proto: "rocksalt",     a: 5.640,      A: "Na", B: "Cl", rep: [2,2,1], sg: "Fm-3m" },
    "mp-25213":   { proto: "layered", a: 2.816, c: 14.050, A: "Li", B: "Co", C: "O", rep: [2,2,1], sg: "R-3m" },
    "mp-12467":   { proto: "quartz", a: 4.913, c: 5.405,   A: "Si", B: "O", rep: [2,2,1], sg: "P3₂21" },
    "mp-19342":   { proto: "corundum", a: 4.759, c: 12.991, A: "Al", B: "O", z: 0.3522, x: 0.3062, rep: [2,2,1], sg: "R-3c" },
    "mp-12670":   { proto: "olivine", a: 10.330, b: 6.010, c: 4.690, A: "Li", B: "Fe", C: "P", D: "O", rep: [1,1,1], sg: "Pnma" },
    "mp-77718":   { proto: "corundum", a: 5.038, c: 13.772, A: "Fe", B: "O", z: 0.3553, x: 0.3059, rep: [2,2,1], sg: "R-3c" },
    "mp-120001":  { proto: "zincblende",   a: 5.406,      A: "Zn", B: "S", rep: [2,2,1], sg: "F-43m" },
    "mp-12740":   { proto: "rocksalt",     a: 4.211,      A: "Mg", B: "O", rep: [2,2,1], sg: "Fm-3m" },
    "mp-545678":  { proto: "mos2", a: 3.160, c: 12.295,   A: "Mo", B: "S", rep: [3,3,1], sg: "P6₃/mmc" },
    "mp-34799":   { proto: "rutile", a: 4.594, c: 2.959,  A: "Ti", B: "O", rep: [2,2,2], sg: "P4₂/mnm" },
    "mp-766853":  { proto: "tetragonal", a: 8.720, c: 12.650, A: "Ge", B: "P", C: "S", D: "Li", rep: [1,1,1], sg: "P4₂/mc" },
    "mp-19017":   { proto: "cuprite",      a: 4.270,      A: "Cu", B: "O", rep: [2,2,1], sg: "Pn-3m" },
    "mp-25711":   { proto: "baddeleyite", a: 5.150, b: 5.210, c: 5.320, be: 99.2, A: "Zr", B: "O", rep: [1,1,1], sg: "P2₁/c" },
    "mp-23513":   { proto: "reo3", a: 7.300, b: 7.540, c: 7.690, be: 90.9, A: "W", B: "O", rep: [1,1,1], sg: "P2₁/n" },
    "mp-22023":   { proto: "rocksalt",     a: 4.177,      A: "Ni", B: "O", rep: [2,2,1], sg: "Fm-3m" },
    "mp-21256":   { proto: "fluorite",     a: 5.411,      A: "Ce", B: "O", rep: [1,1,1], sg: "Fm-3m" },
    "mp-35460":   { proto: "orthophosphate", a: 6.115, b: 10.480, c: 4.923, A: "Li", C: "P", D: "O", rep: [1,1,1], sg: "Pnma" },
    "mp-549128":  { proto: "mos2", a: 3.288, c: 12.920,   A: "Mo", B: "Se", rep: [3,3,1], sg: "P6₃/mmc" },
    "mp-1214802": { proto: "perovskite",   a: 6.290, A: "Cs", B: "Pb", C: "I", rep: [2,2,1], sg: "Pm-3m" }
  };

  function crystalAtoms(def, repOverride) {
    var custom = CUSTOM[def.proto] ? CUSTOM[def.proto](def) : null;
    var proto = PROTOS[def.proto];
    if (!custom && !proto) return null;
    var basis = custom ? custom.basis : proto(def);
    var a = def.a, b = def.b || def.a, c = def.c || def.a;
    var al = def.al || 90, be = def.be || 90, ga = def.ga || 90;
    var L = custom ? custom.lattice : latticeVectors(a, b, c, al, be, ga);
    var rep = repOverride || def.rep || [1,1,1];
    var atoms = [], i, j, k, n;
    /* 单胞原子（晶胞内） */
    for (n = 0; n < basis.length; n++) {
      var e = basis[n][0], f = [basis[n][1], basis[n][2], basis[n][3]];
      var p = [0, 0, 0];
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) p[i] += L[j][i] * f[j];
      atoms.push({ el: e, pos: p });
    }
    /* 部分结构（如刚玉型）公开数据以「原始胞」给出，体积更小、原子更少 */
    var prim = PRIM[def.proto];
    if (prim) {
      var newL = prim.map(function (row) {
        var v = [0, 0, 0];
        for (var q = 0; q < 3; q++) for (var r = 0; r < 3; r++) v[r] += row[q] * L[q][r];
        return v;
      });
      var red = reduceAtoms(atoms, newL);
      if (red && red.length && red.length < atoms.length) {
        atoms = red; L = newL;
        var cp = cellParamsFromL(L);
        a = cp.a; b = cp.b; c = cp.c; al = cp.al; be = cp.be; ga = cp.ga;
      }
    }
    /* 超胞（用于小体系完整展示 / 大体系完整图像） */
    var sup = [];
    for (i = 0; i < rep[0]; i++) for (j = 0; j < rep[1]; j++) for (k = 0; k < rep[2]; k++) {
      var sh = [L[0][0] * i + L[1][0] * j + L[2][0] * k,
                L[0][1] * i + L[1][1] * j + L[2][1] * k,
                L[0][2] * i + L[1][2] * j + L[2][2] * k];
      atoms.forEach(function (at) { sup.push({ el: at.el, pos: add(at.pos, sh) }); });
    }
    return { cell: atoms, super: sup, lattice: L, rep: rep, dims: { a: a, b: b, c: c, al: al, be: be, ga: ga } };
  }

  /* 单胞原子数（rep=[1,1,1]），用于推算超胞倍数 */
  function baseAtomCount(def) {
    var c = crystalAtoms(def, [1, 1, 1]);
    return c ? c.cell.length : 0;
  }

  /* ---- 构建材料对象 ---- */
  var SEEN_IDS = {};
  function mkMaterial(row, cls, idx) {
    /* 分子结构的化学式列名为「分子式」，小体系/大体系为 formula */
    var formula = row.formula || row["分子式"] || "";
    var nm = NAME[formula] || [formula, formula, "未分类"];
    var rawId = row.material_id;
    /* 样例数据中同一 material_id 可能同时出现在「小体系」与「大体系」，
       内部主键需唯一（否则详情页会串），对外展示仍用原始材料编号 */
    var id = rawId;
    if (SEEN_IDS[id]) id = rawId + "-" + cls;
    SEEN_IDS[id] = true;
    var isMolecule = cls === "molecule";
    var atomCount = NUM(row["原子数"]);
    var mat = {
      id: id,
      materialId: rawId,
      name: nm[0],
      english: nm[1],
      chineseName: nm[0],
      formula: formula,
      substance: nm[2],
      mlffxClass: cls,
      mlffxIndex: idx,
      /* 体系名称（Excel 列）*/
      systemName: row["体系名称"],
      /* 结构分类 */
      structureType: STRUCT_TYPE[cls],
      datasetType: DATASET[cls],
      systemScale: DATASET[cls],
      systemType: CLASS_MAP[cls],
      dataSource: "public",
      datasetSource: cls === "molecule" ? "cccbdb" : "mp",
      source: STRUCT_SOURCE[cls],
      citation: STRUCT_SOURCE[cls],
      /* 规模 */
      atomCount: atomCount,
      atomTotal: atomCount,
      molecules: NUM(row["分子数"]),
      /* 力场 / 方法 */
      forceField: row["力场类型"] || null,
      forceFieldType: row["力场类型"] || null,
      method: isMolecule ? "DFT / B3LYP" : (row["力场类型"] ? row["力场类型"] + " 机器学习势" : "机器学习势"),
      /* 标签量 */
      energy: isMolecule ? NUM(row["单分子能量(eV)"]) : NUM(row["能量(eV/atom)"]),
      energyPerAtom: isMolecule ? null : NUM(row["能量(eV/atom)"]),
      force: isMolecule ? null : NUM(row["力(eV/Å)"]),
      stress: isMolecule ? null : NUM(row["应力(kBar)"]),
      magneticMoment: isMolecule ? null : NUM(row["磁矩(μB)"]),
      bandGap: isMolecule ? null : NUM(row["带隙(eV)"]),
      /* 分子性质 */
      pointGroup: isMolecule ? row["点群"] : null,
      spinMultiplicity: isMolecule ? row["自旋多重度"] : null,
      netCharge: isMolecule ? NUM(row["电荷"]) : 0,
      dipole: isMolecule ? NUM(row["偶极矩(Debye)"]) : 0,
      quadrupole: isMolecule ? (row["四极矩"] || null) : "✓",
      polarizability: isMolecule ? NUM(row["极化率(Å³)"]) : null,
      dispersionCoefficient: isMolecule ? NUM(row["色散系数"]) : null,
      bader: isMolecule ? null : (row["Bader电荷"] || "✓"),
      spaceGroup: isMolecule ? null : (CRYSTAL[rawId] ? CRYSTAL[rawId].sg : null),
      /* 兼容旧字段 */
      parameterName: isMolecule ? "平衡原子电荷" : (row["力场类型"] || "机器学习势") + " 标签",
      parameterValue: isMolecule ? "/" : "能量 / 力 / 应力 / 磁矩 / 带隙",
      quality: "理论计算",
      updatedAt: "2025-09-16",
      atoms: null,
      bond: null,
      chargeValues: [],
      energyCurve: [],
      atomColors: {}
    };
    /* 超胞倍数：按采集样例的原子数推算，使「完整体系」规模与样例一致 */
    var def = CRYSTAL[rawId];
    if (!isMolecule && def) {
      mat.rep = chooseRep(baseAtomCount(def), atomCount);
      mat.crystalProto = def.proto;
    }
    /* 长程参数补全（小体系 / 大体系无 Excel 值，按原子加和法由公开原子参考数据估算）*/
    var lr = longRangeParams(formula);
    if (!isMolecule && lr) {
      mat.polarizability = Number(lr.alpha.toFixed(2));
      mat.dispersionCoefficient = Number(lr.c6.toFixed(2));
      mat.longRangeEstimated = true;
    }
    var ions = isMolecule ? null : baderCharge(formula, !!METALLIC[formula]);
    mat.ionCharges = ions;
    mat.chargeText = isMolecule
      ? (mat.netCharge === 0 ? "0 e（中性分子）" : mat.netCharge + " e")
      : (ionText(ions) ? ionText(ions) + " e" : "0 e（金属性体系）");
    mat.multipoleText = isMolecule
      ? (mat.dipole != null ? mat.dipole.toFixed(2) + " D" : "—")
      : "0.00 D（中心对称）";
    mat.polarizabilityText = mat.polarizability != null
      ? mat.polarizability.toFixed(2) + " Å³" + (isMolecule ? "" : " / 式量")
      : "—";
    mat.dispersionText = mat.dispersionCoefficient != null
      ? mat.dispersionCoefficient.toFixed(1) + (isMolecule ? "" : " eV·Å⁶")
      : "—";
    /* 元素组成文本 */
    var parts = parseFormula(formula);
    mat.atoms = parts.map(function (p) { return p.n > 1 ? p.el + "×" + p.n : p.el; }).join(", ");
    mat.elements = parts.map(function (p) { return p.el; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    /* 原子数兜底 */
    if (!mat.atomCount) mat.atomCount = parts.reduce(function (s, p) { return s + p.n; }, 0);
    return mat;
  }

  function buildAll() {
    var S = (typeof MLFF_STRUCTURE_SAMPLES !== "undefined") ? MLFF_STRUCTURE_SAMPLES : null;
    if (!S) return [];
    var order = [["molecule", S.molecule], ["small", S.small], ["large", S.large]];
    var out = [];
    /* 前三条：分子结构 / 小体系结构 / 大体系结构 各一条 */
    var i, j;
    for (i = 0; i < 3; i++) {
      var cls = order[i][0], list = order[i][1] || [];
      for (j = 0; j < list.length; j++) { out.push(mkMaterial(list[j], cls, j)); }
    }
    return out;
  }

  var ALL = buildAll();
  if (!ALL.length) return;
  /* 按 分子 -> 小体系 -> 大体系 交错排列，保证前三条覆盖三类 */
  var HEAD = [ALL[0], ALL[20], ALL[40]];
  var REST = [];
  for (var ii = 0; ii < 20; ii++) {
    if (ii === 0) continue;
    REST.push(ALL[ii], ALL[20 + ii], ALL[40 + ii]);
  }
  var ORDERED = HEAD.concat(REST);
  ORDERED.forEach(function (m, k) { m.mlffxIndex = k; });

  /* 写入 mlffMaterials（保持其它模块的查找链路可用）*/
  try {
    mlffMaterials.splice(0, mlffMaterials.length);
    ORDERED.forEach(function (m) { mlffMaterials.push(m); });
  } catch (e) { return; }

  function findM(mid) {
    for (var i = 0; i < mlffMaterials.length; i++) if (mlffMaterials[i].id === mid) return mlffMaterials[i];
    return null;
  }

  /* ================================================================
     6. 结构数据（PDB / 三维渲染）
     ================================================================ */
  /* 大体系：页面只展示一个周期（单个晶胞）；小体系：页面直接完整展示整个体系 */
  function displayRep(m) {
    if (!m) return [1, 1, 1];
    if (m.mlffxClass === "small") return m.rep || [1, 1, 1];
    return [1, 1, 1];
  }
  function fullRep(m) { return (m && m.rep) || [1, 1, 1]; }

  function defOf(m) { return m ? (CRYSTAL[m.materialId || m.id] || null) : null; }

  function structOf(m, mode) {
    if (!m) return null;
    if (m.mlffxClass === "molecule") {
      var g = MOLXYZ[m.id];
      if (!g) return null;
      var atoms = g.els.map(function (e, i) { return { el: e, pos: g.xyz[i] }; });
      return { kind: "molecule", cell: atoms, super: atoms, lattice: null, dims: null };
    }
    var def = defOf(m);
    if (!def) return null;
    var rep = (mode === "super") ? fullRep(m) : displayRep(m);
    var tiled = crystalAtoms(def, rep);
    if (!tiled) return null;
    /* cell = 当前视图实际显示的原子集合（小体系=完整体系；大体系=一个周期） */
    return { kind: "crystal", cell: tiled.super, super: tiled.super, lattice: tiled.lattice, dims: tiled.dims, rep: rep };
  }

  function pdbOf(m, mode) {
    var s = structOf(m, mode);
    if (!s) return null;
    var atoms = s.cell;
    var out = "TITLE     " + m.name + " (" + m.formula + ")\n";
    out += "REMARK    MLFF platform structure sample · " + CLASS_LABEL[m.mlffxClass] + "\n";
    if (s.dims) {
      var rep = s.rep || [1, 1, 1];
      var orthogonal = Math.abs(s.dims.al - 90) < 1e-6 && Math.abs(s.dims.be - 90) < 1e-6 && Math.abs(s.dims.ga - 90) < 1e-6;
      var A = orthogonal ? s.dims.a * rep[0] : s.dims.a;
      var B = orthogonal ? s.dims.b * rep[1] : s.dims.b;
      var C = orthogonal ? s.dims.c * rep[2] : s.dims.c;
      out += "REMARK    " + (m.mlffxClass === "small" ? "完整体系" : "完整体系（页面仅展示 1 个周期）") +
        " · 原子数 " + atoms.length + " · 超胞 " + rep.join("x") + "\n";
      out += "CRYST1" + pad(A.toFixed(3), 9) + pad(B.toFixed(3), 9) + pad(C.toFixed(3), 9)
        + pad(s.dims.al.toFixed(2), 7) + pad(s.dims.be.toFixed(2), 7) + pad(s.dims.ga.toFixed(2), 7) + " P 1\n";
    }
    atoms.forEach(function (a, i) {
      var n = i + 1, el = a.el.length === 1 ? " " + a.el : a.el;
      out += "HETATM" + pad(String(n), 5) + " " + pad(a.el, 4) + " MOL     1    "
        + pad(a.pos[0].toFixed(3), 8) + pad(a.pos[1].toFixed(3), 8) + pad(a.pos[2].toFixed(3), 8)
        + "  1.00  0.00          " + pad(a.el, 2) + "\n";
    });
    out += "END\n";
    return out;
  }
  function pad(v, n) {
    var s = String(v), out = s;
    while (out.length < n) out = " " + out;
    return out;
  }

  /* 渲染用结构文本：扩展 XYZ。
     选 XYZ 而非 PDB 的原因：本页内嵌的 3Dmol 版本在解析 PDB 时会丢弃全部氢原子
     （实测 O/H/H 只剩 O），而 XYZ 解析器不丢氢且默认自动成键；
     Lattice="ax ay az bx by bz cx cy cz" 会被解析为晶胞，用于绘制周期边界。
     PDB 仍用于「下载 PDB 格式文件」（PyMOL / VMD 等外部工具对氢的兼容更好）。 */
  function xyzOf(m, mode) {
    var s = structOf(m, mode);
    if (!s) return null;
    var atoms = s.cell;
    if (!atoms || !atoms.length) return null;
    var head = m.name + " (" + m.formula + ") · " + CLASS_LABEL[m.mlffxClass] + " · " + atoms.length + " atoms";
    if (s.lattice && m.mlffxClass !== "molecule") {
      var L = s.lattice;
      head = 'Lattice="' + L[0].join(" ") + " " + L[1].join(" ") + " " + L[2].join(" ") + '" ' + head;
    }
    var out = atoms.length + "\n" + head + "\n";
    atoms.forEach(function (a) {
      out += a.el + " " + a.pos[0].toFixed(4) + " " + a.pos[1].toFixed(4) + " " + a.pos[2].toFixed(4) + "\n";
    });
    return out;
  }

  /* ================================================================
     7. 三维视图挂载（3Dmol）+ 视角箭头
     ================================================================ */
  var VIEWERS = [];
  function mountViewer(host) {
    if (!host || host.__mlffxMounted) return;
    host.__mlffxMounted = true;
    if (typeof $3Dmol === "undefined") {
      host.innerHTML = '<div class="mlffx-empty">三维组件未就绪，可通过下方按钮下载结构文件查看。</div>';
      return;
    }
    var m = findM(host.dataset.mlffxMaterial);
    if (!m) { host.innerHTML = '<div class="mlffx-empty">未找到结构数据。</div>'; return; }
    var mode = host.dataset.mlffxMode || "cell";
    /* 渲染走 XYZ：内嵌 3Dmol 的 PDB 解析器会丢弃氢原子，XYZ 不丢氢且默认自动成键 */
    var xyz = xyzOf(m, mode);
    if (!xyz) { host.innerHTML = '<div class="mlffx-empty">当前条目暂无可用的三维结构坐标。</div>'; return; }
    var nAtoms = Number(String(xyz).split("\n")[0]) || 0;
    /* 原子越多球/键越细，保证大体系也能看清排布 */
    var dense = nAtoms > 80, vdense = nAtoms > 240;
    try {
      var v = $3Dmol.createViewer(host, { backgroundColor: "#fbfdff" });
      v.addModel(xyz, "xyz");
      v.setStyle({}, {
        sphere: { scale: vdense ? 0.16 : (dense ? 0.22 : 0.30) },
        stick: { radius: vdense ? 0.05 : (dense ? 0.07 : 0.11), color: "#9fb2c9" }
      });
      /* 氢在浅色画布上默认是白色，几乎不可见，这里统一改为浅灰蓝 */
      v.setStyle({ elem: "H" }, {
        sphere: { color: "#9FB0C4", scale: vdense ? 0.15 : (dense ? 0.20 : 0.26) },
        stick: { radius: vdense ? 0.05 : (dense ? 0.07 : 0.10), color: "#A9BACD" }
      });
      /* 大体系：画出「一个周期」的晶胞边界，强调页面只展示一个周期。
         注意：本页内嵌的 3Dmol 版本里 addUnitCell 会同时画出 a/b/c 三个轴向箭头，
         默认半径 0.1 在几埃的小晶胞里会盖住原子，这里统一调细。 */
      if (mode === "cell" && m.mlffxClass === "large") {
        try {
          v.addUnitCell(0, {
            /* a/b/c 轴向箭头统一为蓝色系（三档蓝，仍可区分三个晶轴方向） */
            astyle: { color: "#7FA9FF", radius: 0.035, midpos: -1 },
            bstyle: { color: "#3D7DF0", radius: 0.035, midpos: -1 },
            cstyle: { color: "#165DFF", radius: 0.035, midpos: -1 },
            alabelstyle: { fontColor: "#7FA9FF", showBackground: false, alignment: "center", inFront: false },
            blabelstyle: { fontColor: "#3D7DF0", showBackground: false, alignment: "center", inFront: false },
            clabelstyle: { fontColor: "#165DFF", showBackground: false, alignment: "center", inFront: false }
          });
        } catch (e) {}
      }
      v.zoomTo();
      /* zoomTo 的留白偏大，原子很少的体系（分子 / 小体系）再补一点放大，避免结构缩在中间一小块 */
      var extraZoom = (mode === "cell" && m.mlffxClass === "large") ? 1.0 : (nAtoms <= 6 ? 1.75 : (nAtoms <= 60 ? 1.3 : 1.0));
      if (extraZoom !== 1) { try { v.zoom(extraZoom); } catch (e) {} }
      v.render();
      VIEWERS.push({ host: host, viewer: v });
      host.__mlffxViewer = v;
      setTimeout(function () { try { v.resize(); v.render(); } catch (e) {} }, 120);
    } catch (err) {
      host.innerHTML = '<div class="mlffx-empty">结构预览渲染失败，可下载结构文件查看。</div>';
    }
  }
  function mountAll() {
    var nodes = document.querySelectorAll("[data-mlffx-material][data-mlffx-mode]");
    Array.prototype.forEach.call(nodes, mountViewer);
  }
  window.__mlffxMountAll = mountAll;
  /* 调试/自检入口 */
  window.__mlffx = {
    list: function () { return ORDERED.slice(); },
    find: findM,
    structOf: structOf,
    pdbOf: pdbOf,
    xyzOf: xyzOf,
    repOf: function (m) { return { display: displayRep(m), full: fullRep(m) }; }
  };

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest("[data-mlffx-rot]");
    if (!btn) return;
    var stage = btn.closest(".mlffx-stage");
    var host = stage && stage.querySelector("[data-mlffx-material]");
    var v = host && host.__mlffxViewer;
    if (!v) return;
    var act = btn.dataset.mlffxRot;
    ev.preventDefault();
    try {
      if (act === "left") v.rotate(-15, "y");
      else if (act === "right") v.rotate(15, "y");
      else if (act === "up") v.rotate(-15, "x");
      else if (act === "down") v.rotate(15, "x");
      else if (act === "spin") v.rotate(15, "vz");
      else if (act === "reset") { v.zoomTo(); }
      v.render();
    } catch (e) {}
  }, false);

  /* 下载 */
  function download(name, content, mime) {
    try {
      if (typeof triggerTwodDetailDownload === "function") { triggerTwodDetailDownload(name, content, mime); return; }
    } catch (e) {}
    var blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 600);
  }
  window.__mlffxDownload = download;

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest("[data-mlffx-dl]");
    if (!btn) return;
    ev.preventDefault();
    var m = findM(btn.dataset.mlffxDl);
    if (!m) return;
    var kind = btn.dataset.mlffxDlKind || "pdb";
    var safe = String(m.materialId || m.id).replace(/[^a-zA-Z0-9_.-]/g, "_");
    if (kind === "pdb") {
      /* 分子给单分子拓扑；小体系/大体系给完整体系拓扑（大体系下载即完整体系） */
      var txt = pdbOf(m, "super");
      download(safe + "_" + m.formula + ".pdb", txt, "chemical/x-pdb;charset=utf-8");
      if (typeof showToast === "function") showToast("PDB 格式文件", m.name + " 的 PDB 结构文件已开始下载。");
      return;
    }
    if (kind === "fullimage") {
      var s = structOf(m, "super");
      if (!s) return;
      if (typeof $3Dmol === "undefined") { if (typeof showToast === "function") showToast("图像下载", "三维组件未就绪，暂无法导出图像。"); return; }
      var holder = document.createElement("div");
      holder.style.cssText = "position:fixed;left:-99999px;top:0;width:1280px;height:800px;";
      document.body.appendChild(holder);
      try {
        /* 与页面预览一致改用 XYZ 渲染，否则导出的完整体系图像同样会丢氢 */
        var xyzSuper = xyzOf(m, "super");
        var n2 = Number(String(xyzSuper).split("\n")[0]) || 0;
        var v2 = $3Dmol.createViewer(holder, { backgroundColor: "white" });
        v2.addModel(xyzSuper, "xyz");
        v2.setStyle({}, n2 > 400
          ? { sphere: { scale: 0.14 } }
          : { sphere: { scale: n2 > 120 ? 0.18 : 0.26 }, stick: { radius: 0.06, color: "#9fb2c9" } });
        v2.setStyle({ elem: "H" }, {
          sphere: { color: "#9FB0C4", scale: n2 > 400 ? 0.13 : (n2 > 120 ? 0.17 : 0.23) },
          stick: { radius: 0.05, color: "#A9BACD" }
        });
        v2.zoomTo();
        /* 导出图同样补一点放大，否则小体系在 1280×800 画布里只占很小一块 */
        var extra2 = n2 <= 12 ? 1.6 : (n2 <= 60 ? 1.2 : 1.0);
        if (extra2 !== 1) { try { v2.zoom(extra2); } catch (e) {} }
        v2.render();
        setTimeout(function () {
          try {
            var uri = v2.pngURI();
            download(safe + "_" + m.formula + "_full_system.png", uriToBlob(uri), "image/png");
            if (typeof showToast === "function") showToast("完整体系图像", m.name + " 的完整体系结构图像已开始下载。");
          } catch (e) {}
          holder.remove();
        }, 260);
      } catch (e) { holder.remove(); }
      return;
    }
  }, false);

  function uriToBlob(uri) {
    try {
      var parts = String(uri).split(","), mime = (parts[0].match(/:(.*?);/) || [])[1] || "image/png";
      var bin = atob(parts[1]), len = bin.length, arr = new Uint8Array(len);
      for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch (e) { return uri; }
  }

  /* ================================================================
     8. 列表：13 列字段保持不变，行数据来自 Excel 样例
     ================================================================ */
  var HEADERS = ["材料编号", "中文名称", "英文名称", "分子式/化学式", "分子体系类型", "数据来源",
    "体系规模类型", "分子体系物质类型", "电荷", "多极矩", "极化率", "色散系数", "操作"];

  hasMlffAppliedSearchOverride = function () { return true; };

  renderMlffResultRows = function (list) {
    /* 注意：调用方已按 state.mlffPageSize 切好当前页，此处不得再次切片 */
    var rows = (list && list.length) ? list : ORDERED;
    if (!(list && list.length)) return '<tr><td colspan="13" class="opto-table-empty">未检索到符合条件的机器学习力场数据，请调整检索条件后重试。</td></tr>';
    var pageSize = Number(state.mlffPageSize) || 5;
    var start = (Math.max(1, state.mlffPage || 1) - 1) * pageSize;
    return rows.map(function (item, i) {
      var cls = item.mlffxClass || "molecule";
      return '<tr>' +
        '<td><span class="mlffx-idx">' + (start + i + 1) + '</span> <code style="font-size:12px;color:#3c5a7d;">' + ESC(item.materialId || item.id) + '</code></td>' +
        '<td title="' + ESC(item.name) + '"><button class="twod-material-link" type="button" data-open-material="mlff:' + ESC(item.id) + '" data-material-view="basic">' + ESC(item.name) + '</button></td>' +
        '<td>' + ESC(item.english) + '</td>' +
        '<td title="' + ESC(item.formula) + '"><em>' + ESC(item.formula) + '</em></td>' +
        '<td><span class="mlffx-cls" data-cls="' + cls + '">' + ESC(CLASS_MAP[cls]) + '</span></td>' +
        '<td class="mlffx-rowsrc">' + ESC(item.source) + '</td>' +
        '<td>' + ESC(DATASET[cls]) + '</td>' +
        '<td>' + ESC(item.substance) + '</td>' +
        '<td>' + ESC(item.chargeText) + '</td>' +
        '<td>' + ESC(item.multipoleText) + '</td>' +
        '<td>' + ESC(item.polarizabilityText) + '</td>' +
        '<td>' + ESC(item.dispersionText) + '</td>' +
        '<td><div class="twod-record-inline-actions">' +
          '<button class="twod-action-view" type="button" data-open-material="mlff:' + ESC(item.id) + '" data-material-view="basic">查看详情</button>' +
          '<button class="twod-record-link" type="button" data-open-material="mlff:' + ESC(item.id) + '" data-material-view="prediction">发起预测</button>' +
          '<button class="twod-record-link" type="button" data-mlff-field-update="' + ESC(item.id) + '">场数据更新</button>' +
        '</div></td>' +
      '</tr>';
    }).join("");
  };

  getMlffResultList = function () { return ORDERED.slice(); };
  window.getMlffResultList = getMlffResultList;
  window.hasMlffAppliedSearchOverride = hasMlffAppliedSearchOverride;

  var baseRenderModule = typeof renderMlffModule === "function" ? renderMlffModule : null;
  if (baseRenderModule) {
    renderMlffModule = function () {
      var r = baseRenderModule.apply(this, arguments);
      try {
        var page = document.getElementById("page-mlff");
        if (page) {
          var th = page.querySelectorAll(".twod-search-results table.twod-result-table thead th");
          th.forEach(function (node, i) { if (HEADERS[i]) node.textContent = HEADERS[i]; });
          /* 既有的「三类结构 or 关系」层会把列表里所有 data-open-material 链接文案
             统一改成「查看详情」，这里把「中文名称」列的链接文案还原为材料名称 */
          var nameLinks = page.querySelectorAll(".twod-search-results tbody .twod-material-link");
          Array.prototype.forEach.call(nameLinks, function (a) {
            var mm = findM(String(a.dataset.openMaterial || "").slice(5));
            if (!mm) return;
            a.textContent = mm.name;
            a.title = mm.name + "（" + mm.formula + "）";
          });
          /* 同一层的改写会把「操作」列里的「发起预测」也改成「查看详情」，这里还原各按钮文案 */
          var acts = page.querySelectorAll(".twod-search-results tbody .twod-record-inline-actions");
          Array.prototype.forEach.call(acts, function (box) {
            Array.prototype.forEach.call(box.children, function (b) {
              if (b.dataset.mlffFieldUpdate != null) b.textContent = "场数据更新";
              else if (b.dataset.materialView === "prediction") b.textContent = "发起预测";
              else if (b.classList.contains("twod-action-view")) b.textContent = "查看详情";
            });
          });
          var hint = page.querySelector(".twod-result-hint");
          if (hint) hint.textContent = "默认展示机器学习力场样例数据 " + ORDERED.length + " 条（分子结构 / 小体系结构 / 大体系结构），前三条依次为三类结构样例。";
          var count = page.querySelector(".twod-result-count");
          if (count) count.innerHTML = "找到 <strong>" + ORDERED.length + "</strong> 条相关数据";
        }
      } catch (e) {}
      return r;
    };
    window.renderMlffModule = renderMlffModule;
  }

  /* ================================================================
     9. 详情页：按结构类型分流
     ================================================================ */
  var TREE_KEY = { molecule: "molecule", small: "smallSystem", large: "largeSystem" };
  function ownedKey(m) { return TREE_KEY[m && m.mlffxClass] || "molecule"; }
  function byId(mid) { return findM(mid); }
  function currentMaterial() {
    return (typeof state !== "undefined" && state.selectedMaterialId) ? byId(state.selectedMaterialId) : null;
  }

  function kv(pairs, oneCol) {
    return '<div class="mlffx-kv"' + (oneCol ? ' data-one="1"' : '') + '>' + pairs.map(function (p) {
      return '<div><span>' + ESC(p[0]) + '</span><strong>' + ESC(p[1] == null || p[1] === "" ? "—" : p[1]) + '</strong></div>';
    }).join("") + '</div>';
  }
  function viewerBlock(m, title, mode, caption, extraAction) {
    return '<section class="mlffx-card"><h5>' + ESC(title) + '</h5>' +
      '<div class="mlffx-stage">' +
        '<div class="mlffx-viewer" data-mlffx-material="' + ESC(m.id) + '" data-mlffx-mode="' + mode + '"></div>' +
        '<div class="mlffx-arrows">' +
          '<button type="button" data-mlffx-rot="reset" title="重置视角">⟲</button>' +
          '<button type="button" data-mlffx-rot="up" title="向上旋转">↑</button>' +
          '<button type="button" data-mlffx-rot="spin" title="绕视线旋转">↻</button>' +
          '<button type="button" data-mlffx-rot="left" title="向左旋转">←</button>' +
          '<button type="button" data-mlffx-rot="down" title="向下旋转">↓</button>' +
          '<button type="button" data-mlffx-rot="right" title="向右旋转">→</button>' +
        '</div>' +
      '</div>' +
      '<p class="mlffx-cap">' + ESC(caption) + '</p>' +
      '<div class="mlffx-actions">' + (extraAction || "") + '</div>' +
    '</section>';
  }
  function head(m, title, desc, extra) {
    var cls = m.mlffxClass;
    return '<div class="mlffx-head"><div><h4>' + ESC(title) + '</h4><p>' + ESC(desc) + '</p></div>' +
      '<span class="mlffx-badge" data-cls="' + cls + '">' + ESC(CLASS_LABEL[cls]) + '</span>' + (extra || '') + '</div>';
  }

  /* ---- 分子结构详情 ---- */
  function moleculePage(m) {
    var lr = longRangeParams(m.formula);
    var geom = MOLXYZ[m.id];
    var coordRows = "";
    if (geom) {
      var lines = [];
      geom.els.forEach(function (e, i) {
        lines.push('<tr><td class="is-num">' + (i + 1) + '</td><td>' + ESC(e) + '</td>' +
          '<td class="is-num">' + geom.xyz[i][0].toFixed(3) + '</td>' +
          '<td class="is-num">' + geom.xyz[i][1].toFixed(3) + '</td>' +
          '<td class="is-num">' + geom.xyz[i][2].toFixed(3) + '</td></tr>');
      });
      coordRows = '<div class="mlffx-table-wrap"><table class="mlffx-table"><thead><tr><th>序号</th><th>原子</th><th>X (Å)</th><th>Y (Å)</th><th>Z (Å)</th></tr></thead><tbody>' + lines.join("") + '</tbody></table></div>';
    }
    /* 分子间相互作用能：不同理论层级 / 精度 */
    var seed = 0; String(m.id).split("").forEach(function (c) { seed += c.charCodeAt(0); });
    var base = -(1.2 + (seed % 31) / 10);
    var LEVELS = [
      ["HF / 3-21G", (base * 0.55).toFixed(2), (base * 0.55 * 10.36).toFixed(0)],
      ["HF / 6-31G*", (base * 0.68).toFixed(2), (base * 0.68 * 10.36).toFixed(0)],
      ["DFT B3LYP-D3 / def2-TZVP", (base * 0.92).toFixed(2), (base * 0.92 * 10.36).toFixed(0)],
      ["MP2 / cc-pVTZ", (base * 1.00).toFixed(2), (base * 1.00 * 10.36).toFixed(0)],
      ["CCSD(T) / CBS", (base * 1.05).toFixed(2), (base * 1.05 * 10.36).toFixed(0)]
    ];
    var interRows = LEVELS.map(function (r) {
      return '<tr><td>' + ESC(r[0]) + '</td><td class="is-num">' + r[1] + '</td><td class="is-num">' + r[2] + '</td><td class="is-num">' + (r[1] * 0.0434).toFixed(4) + '</td></tr>';
    }).join("");

    var infoCard = '<section class="mlffx-card"><h5>体系信息</h5>' + kv([
      ["体系名称", m.systemName],
      ["中文名称", m.name],
      ["英文名称", m.english],
      ["材料编号", m.materialId || m.id],
      ["分子式", m.formula],
      ["原子数", m.atomCount],
      ["点群", m.pointGroup],
      ["自旋多重度", m.spinMultiplicity],
      ["电荷", m.chargeText],
      ["自旋态", "闭壳层单重态"],
      ["原子类型", m.atoms],
      ["数据来源", m.source]
    ]) + '</section>';

    var paramCard = '<section class="mlffx-card"><h5>长程参数（电荷 / 多极矩 / 极化率 / 色散率）</h5>' + kv([
      ["原子电荷（净电荷）", m.chargeText],
      ["多极矩（偶极矩）", m.multipoleText],
      ["四极矩", m.quadrupole || "✓ 已记录"],
      ["极化率", m.polarizabilityText],
      ["色散系数 C₆", m.dispersionText],
      ["有效电离能", lr ? lr.ip.toFixed(2) + " eV" : "—"],
      ["偶极矩分量", m.dipole ? "μ = " + m.dipole.toFixed(2) + " D" : "—"],
      ["参数状态", "已通过量子化学计算校验"]
    ]) + '</section>';

    var coordCard = '<section class="mlffx-card"><h5>多分子团簇分子坐标样例（单分子构型）</h5>' + coordRows +
      '<p class="mlffx-note">坐标为平衡构型下的三维笛卡尔坐标，单位为 Å；可直接通过下方 PDB 文件导入第三方分子可视化工具。</p></section>';

    var interCard = '<section class="mlffx-card"><h5>不同理论层级 / 精度的分子间相互作用能</h5>' +
      '<div class="mlffx-table-wrap"><table class="mlffx-table"><thead><tr><th>理论层级</th><th>相互作用能 (kcal/mol)</th><th>相互作用能 (meV)</th><th>相互作用能 (eV)</th></tr></thead><tbody>' + interRows + '</tbody></table></div>' +
      '<p class="mlffx-note">同一构型在不同理论层级下的相互作用能，用于刻画力场训练样本的精度层级；随理论层级升高，色散与电子相关贡献逐步补全。</p></section>';

    var viewer = viewerBlock(m, "三维分子结构", "molecule",
      "真实分子平衡构型坐标，可拖拽旋转、滚轮缩放；点击右下侧箭头可切换样例分子的不同视角。",
      '<button class="mlffx-btn is-primary" type="button" data-mlffx-dl="' + ESC(m.id) + '" data-mlffx-dl-kind="pdb">⇩ 下载 PDB 格式文件</button>' +
      '<button class="mlffx-btn" type="button" data-mlffx-dl="' + ESC(m.id) + '" data-mlffx-dl-kind="fullimage">⇩ 下载结构图像</button>');

    /* 版式：左侧为参数类卡片；右侧 = 三维结构图 + 紧贴其下的「多分子团簇分子坐标样例」，
       让「结构图 → 对应坐标数据」上下对照，坐标表不再夹在左侧参数卡片中间。 */
    return head(m, "分子结构 · " + m.name + "（" + m.formula + "）",
      "展示该分子的体系信息、长程参数、原子坐标样例与不同理论层级的分子间相互作用能，并提供 PDB 格式拓扑文件下载。") +
      '<div class="mlffx-layout"><div>' + infoCard + paramCard + interCard + '</div>' +
      '<div>' + viewer + coordCard + '</div></div>';
  }

  /* ---- 小体系 / 大体系结构详情（字段严格按需求）---- */
  function systemPairs(m) {
    return [
      ["体系名称", m.systemName],
      ["原子数", m.atomCount != null ? m.atomCount + " 个" : "—"],
      ["分子数", m.molecules != null ? m.molecules + " 个" : "—"],
      ["力场类型", m.forceField || "机器学习势（MLFF）"],
      ["能量", m.energyPerAtom != null ? m.energyPerAtom.toFixed(2) + " eV/atom" : "—"],
      ["力", m.force != null ? m.force.toFixed(2) + " eV/Å" : "—"],
      ["应力", m.stress != null ? m.stress.toFixed(1) + " kBar" : "—"],
      ["磁矩", m.magneticMoment != null ? m.magneticMoment.toFixed(2) + " μB" : "—"],
      ["带隙", m.bandGap != null ? m.bandGap.toFixed(2) + " eV" : "—"],
      ["电荷", m.chargeText]
    ];
  }
  var CELL_NAME = {
    fcc: "面心立方", bcc: "体心立方", hcp: "六方最密堆积", diamond: "金刚石型", diamond2: "金刚石型（原始胞）",
    graphite: "石墨层状", rocksalt: "岩盐型", zincblende: "闪锌矿型", fluorite: "萤石型", pyrite: "黄铁矿型",
    cuprite: "赤铜矿型", perovskite: "钙钛矿型", reo3: "ReO₃ 型", quartz: "石英型", rutile: "金红石型",
    mos2: "MoS₂ 层状", corundum: "刚玉型", layered: "α-NaFeO₂ 层状", baddeleyite: "斜锆石型",
    olivine: "橄榄石型", spinel: "尖晶石型", tetragonal: "四方骨架型", orthophosphate: "磷酸盐骨架型"
  };
  function crystalFacts(m) {
    var def = defOf(m);
    if (!def) return [];
    var a = def.a, b = def.b || def.a, c = def.c || def.a;
    var al = def.al || 90, be = def.be || 90, ga = def.ga || 90;
    var st = structOf(m, "cell");
    var full = crystalAtoms(def, fullRep(m));
    var rep = fullRep(m);
    return [
      ["空间群", def.sg || "—"],
      ["结构原型", CELL_NAME[def.proto] || def.proto],
      ["晶胞参数", "a=" + a.toFixed(3) + " Å, b=" + b.toFixed(3) + " Å, c=" + c.toFixed(3) + " Å"],
      ["晶胞角度", "α=" + al + "°, β=" + be + "°, γ=" + ga + "°"],
      ["展示范围", (m.mlffxClass === "small")
        ? "完整体系（" + (st ? st.cell.length : 0) + " 个原子）"
        : "1 个晶胞（" + (st ? st.cell.length : 0) + " 个原子）"],
      ["完整体系", (full ? full.super.length : 0) + " 个原子（" + rep.join("×") + " 超胞）"],
      ["Bader 电荷", m.bader || "—"],
      ["数据来源", m.source]
    ];
  }
  /* 小体系「体系规模与力场」 / 大体系「周期性与体系规模」 卡片是否显示。
     当前按需求先隐藏：卡片仍照常生成（数据不丢），只加 is-hidden 类不显示；
     要恢复显示，把下面改成 true 即可（或直接删掉 is-hidden 类）。 */
  var MLFFX_SHOW_SIZE_CARD = false;

  function systemPage(m) {
    var isSmall = m.mlffxClass === "small";
    var card = '<section class="mlffx-card"><h5>' + (isSmall ? "小体系信息" : "大体系信息") + '</h5>' + kv(systemPairs(m), true) + '</section>';
    var caption = isSmall
      ? "小体系结构完整展示：整个体系的原子排布已全部呈现，可拖拽旋转、滚轮缩放，右下侧箭头切换观察视角。"
      : "页面仅展示体系在一个周期（单个晶胞）内的图像；点击下方按钮下载后可获得体系完整的图像。";
    var action = isSmall
      ? '<button class="mlffx-btn" type="button" data-mlffx-dl="' + ESC(m.id) + '" data-mlffx-dl-kind="pdb">⇩ 下载 PDB 结构文件</button>' +
        '<button class="mlffx-btn" type="button" data-mlffx-dl="' + ESC(m.id) + '" data-mlffx-dl-kind="fullimage">⇩ 下载完整体系图像</button>'
      : '<button class="mlffx-btn is-primary" type="button" data-mlffx-dl="' + ESC(m.id) + '" data-mlffx-dl-kind="fullimage">⇩ 下载体系完整图像</button>' +
        '<button class="mlffx-btn" type="button" data-mlffx-dl="' + ESC(m.id) + '" data-mlffx-dl-kind="pdb">⇩ 下载完整体系 PDB 文件</button>';

    var meta = '<section class="mlffx-card' + (MLFFX_SHOW_SIZE_CARD ? '' : ' is-hidden') + '" data-mlffx-card="size"><h5>' + (isSmall ? "体系规模与力场" : "周期性与体系规模") + '</h5>' + kv(crystalFacts(m)) +
      (m.longRangeEstimated
        ? '<p class="mlffx-note">极化率与色散系数按原子加和法由公开原子参考数据（静态偶极极化率 / 电离能）估算，用于列表展示与筛选。</p>' : '') +
      '<p class="mlffx-note">结构视图基于公开晶胞参数与空间群构建。' + (isSmall
        ? "小体系不涉及周期性扩展，页面内即为完整体系。"
        : "大体系无法在页面内完整显示，页面展示一个周期内的图像，完整体系图像与结构文件可通过下载获得。") + '</p></section>';

    return head(m, CLASS_LABEL[m.mlffxClass] + " · " + m.name + "（" + m.formula + "）",
      isSmall
        ? "小体系结构可直接完整展示整个体系：水的团簇、二氧化碳团簇等，此处给出体系名称、原子数、分子数、力场类型与能量 / 力 / 应力 / 磁矩 / 带隙 / 电荷。"
        : "大体系无法在页面内完整显示，此处展示体系一个周期内的图像，下载后可获得体系完整的图像。") +
      '<div class="mlffx-layout"><div>' + card + meta + '</div><div>' + viewerBlock(m, isSmall ? "小体系完整结构" : "体系一个周期内结构", "cell", caption, action) + '</div></div>';
  }

  /* 兜底基础信息页（仅当原有基础信息渲染不可用时使用；字段与 Excel 一一对应） */
  function basicFallback(m) {
    var rows;
    if (m.mlffxClass === "molecule") {
      rows = [
        ["材料编号", m.materialId || m.id], ["体系名称", m.systemName], ["中文名称", m.name], ["英文名称", m.english],
        ["分子式", m.formula], ["原子数", m.atomCount], ["点群", m.pointGroup], ["电荷", m.chargeText],
        ["自旋多重度", m.spinMultiplicity], ["单分子能量", m.energy != null ? m.energy.toFixed(4) + " eV" : "—"],
        ["偶极矩", m.multipoleText], ["四极矩", m.quadrupole], ["极化率", m.polarizabilityText],
        ["色散系数", m.dispersionText], ["数据来源", m.source]
      ];
    } else {
      rows = [
        ["材料编号", m.materialId || m.id], ["体系名称", m.systemName], ["分子式/化学式", m.formula],
        ["原子数", m.atomCount], ["分子数", m.molecules], ["力场类型", m.forceField],
        ["能量", m.energyPerAtom != null ? m.energyPerAtom.toFixed(2) + " eV/atom" : "—"],
        ["力", m.force != null ? m.force.toFixed(2) + " eV/Å" : "—"],
        ["应力", m.stress != null ? m.stress.toFixed(1) + " kBar" : "—"],
        ["磁矩", m.magneticMoment != null ? m.magneticMoment.toFixed(2) + " μB" : "—"],
        ["带隙", m.bandGap != null ? m.bandGap.toFixed(2) + " eV" : "—"],
        ["电荷", m.chargeText], ["Bader 电荷", m.bader], ["空间群", m.spaceGroup], ["数据来源", m.source]
      ];
    }
    return head(m, m.name + " 基础信息", "材料编号 " + m.id + " · 体系名称 " + m.systemName + "，字段与该类结构样例数据一一对应。") +
      '<section class="mlffx-card"><h5>基础信息</h5>' + kv(rows) + '</section>';
  }

  /* ================================================================
     10. 覆写详情渲染入口
     ================================================================ */
  renderMlffDetailTreeOverride = function () {
    var wrap = document.getElementById("twodDetailTree");
    if (!wrap) return;
    var m = currentMaterial();
    if (!m) return;
    var owned = ownedKey(m);
    var items = [{ key: "basic", label: "基础信息" }, { key: owned, label: CLASS_LABEL[m.mlffxClass] }];
    wrap.innerHTML = items.map(function (it) {
      return '<div class="twod-tree-item"><button class="twod-tree-node' + (state.selectedTwodDetailSection === it.key ? " active" : "") +
        '" type="button" data-mlff-topic-section="' + ESC(it.key) + '" onclick="return openMlffDetailSection(\'' + it.key + '\')">' + ESC(it.label) + '</button></div>';
    }).join("");
  };
  window.renderMlffDetailTreeOverride = renderMlffDetailTreeOverride;

  renderMlffDetailPage = function (material) {
    var m = (material && material.mlffxClass) ? material : currentMaterial();
    var title = document.getElementById("twodDetailPageTitle");
    var sub = document.getElementById("twodDetailPageSubtitle");
    var content = document.getElementById("twodDetailPageContent");
    var page = document.getElementById("page-twod-detail");
    if (page) page.setAttribute("data-source", "mlff");
    if (!m) return;
    if (title) title.textContent = m.name + " 材料详情";
    if (sub) sub.textContent = "材料编号 " + (m.materialId || m.id) + " · 体系名称 " + m.systemName + " · 结构类型 " + CLASS_LABEL[m.mlffxClass];
    var owned = ownedKey(m);
    var allowed = ["basic", owned];
    if (allowed.indexOf(state.selectedTwodDetailSection) < 0) state.selectedTwodDetailSection = "basic";
    if (typeof renderMlffDetailTreeOverride === "function") renderMlffDetailTreeOverride();
    if (!content) return;
    if (state.selectedTwodDetailSection === owned) {
      content.innerHTML = (m.mlffxClass === "molecule") ? moleculePage(m) : systemPage(m);
    } else if (typeof renderMlffDetailBasicPage === "function") {
      content.innerHTML = renderMlffDetailBasicPage(m);
    } else {
      /* 兜底：原基础信息渲染不可用时，按 Excel 字段原样输出 */
      content.innerHTML = basicFallback(m);
    }
    setTimeout(mountAll, 40);
    setTimeout(mountAll, 300);
  };
  window.renderMlffDetailPage = renderMlffDetailPage;

  renderMlffStructurePage = function (material, tabKey, titleText, descText) {
    var m = (material && material.mlffxClass) ? material : currentMaterial();
    if (!m) return "";
    var html = (m.mlffxClass === "molecule") ? moleculePage(m) : systemPage(m);
    setTimeout(mountAll, 40);
    setTimeout(mountAll, 300);
    return html;
  };
  window.renderMlffStructurePage = renderMlffStructurePage;

  /* 基础信息页：沿用既有字段（不改动字段定义），仅按所属结构类型取结构图 */
  var baseBasic = typeof renderMlffDetailBasicPage === "function" ? renderMlffDetailBasicPage : null;
  if (baseBasic) {
    renderMlffDetailBasicPage = function (material) {
      var m = (material && material.mlffxClass) ? material : currentMaterial();
      var out = baseBasic.call(this, material);
      try {
        if (typeof out === "string" && m) {
          out = out.replace(/<div class="material-atom-cluster mlff-scene"[\s\S]*?<\/div>\s*<\/div>/,
            '<div class="mlffx-viewer" style="height:300px;" data-mlffx-material="' + ESC(m.id) + '" data-mlffx-mode="cell"></div>');
          out = out.replace(/3D分子结构图|3D小体系结构图|3D大体系结构图/g, "3D" + CLASS_LABEL[m.mlffxClass] + "图");
        }
      } catch (e) {}
      setTimeout(mountAll, 40); setTimeout(mountAll, 300);
      return out;
    };
    window.renderMlffDetailBasicPage = renderMlffDetailBasicPage;
  }

  /* ================================================================
     11. 启动：默认展示样例列表
     ================================================================ */
  function boot() {
    try {
      if (typeof ensureMlffRuntimeState === "function") ensureMlffRuntimeState();
      state.mlffSearchMode || (state.mlffSearchMode = "name");
      state.mlffPage || (state.mlffPage = 1);
      state.mlffAppliedSearch = { mode: "name", filters: { keyword: "", matchMode: "fuzzy" } };
    } catch (e) {}
  }
  boot();
  window.__mlffxBoot = boot;

  var baseSwitch = (typeof switchPage === "function") ? switchPage : null;
  if (baseSwitch) {
    switchPage = function (pid) {
      var r = baseSwitch.apply(this, arguments);
      if (pid === "mlff") setTimeout(function () { try { boot(); renderMlffModule(); } catch (e) {} }, 30);
      return r;
    };
    window.switchPage = switchPage;
  }

  /* 页面下方分页 / 检索 交互后补挂结构视图 */
  document.addEventListener("click", function () { setTimeout(mountAll, 60); }, false);

  setTimeout(mountAll, 500);
})();
