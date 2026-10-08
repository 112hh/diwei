/* =====================================================================
   Catalyst crystallography engine (pure client-side, offline, no deps)
   Real bulk-lattice / slab / adsorbate generation + CIF/POSCAR/XYZ writers
   + geometric descriptors (coordination, GCN) + honest energy estimate.
   Runs in browser (window.CatalystCrystal) and in node (module.exports).
   ===================================================================== */
(function (root) {
  "use strict";

  // ---- vector helpers ----
  const V = {
    add: (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]],
    sub: (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]],
    scale: (a, s) => [a[0]*s, a[1]*s, a[2]*s],
    dot: (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2],
    cross: (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]],
    norm: (a) => Math.hypot(a[0], a[1], a[2]),
    unit: (a) => { const n = Math.hypot(a[0],a[1],a[2]) || 1; return [a[0]/n, a[1]/n, a[2]/n]; }
  };
  // 3x3 matrix (rows) times vector
  function matVec(M, v){ return [
    M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],
    M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],
    M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2] ]; }

  // rotation matrix that maps unit vector `from` onto unit vector `to`
  function rotationBetween(from, to){
    const f = V.unit(from), t = V.unit(to);
    const v = V.cross(f, t);
    const c = V.dot(f, t);
    const s = V.norm(v);
    if (s < 1e-12){
      if (c > 0) return [[1,0,0],[0,1,0],[0,0,1]];
      // 180deg: rotate about any axis perpendicular to f
      let ax = Math.abs(f[0]) < 0.9 ? [1,0,0] : [0,1,0];
      ax = V.unit(V.cross(f, ax));
      const [x,y,z]=ax;
      return [[2*x*x-1,2*x*y,2*x*z],[2*x*y,2*y*y-1,2*y*z],[2*x*z,2*y*z,2*z*z-1]];
    }
    const [vx,vy,vz]=v;
    const K = [[0,-vz,vy],[vz,0,-vx],[-vy,vx,0]];
    const K2 = [
      [K[0][0]*K[0][0]+K[0][1]*K[1][0]+K[0][2]*K[2][0], K[0][0]*K[0][1]+K[0][1]*K[1][1]+K[0][2]*K[2][1], K[0][0]*K[0][2]+K[0][1]*K[1][2]+K[0][2]*K[2][2]],
      [K[1][0]*K[0][0]+K[1][1]*K[1][0]+K[1][2]*K[2][0], K[1][0]*K[0][1]+K[1][1]*K[1][1]+K[1][2]*K[2][1], K[1][0]*K[0][2]+K[1][1]*K[1][2]+K[1][2]*K[2][2]],
      [K[2][0]*K[0][0]+K[2][1]*K[1][0]+K[2][2]*K[2][0], K[2][0]*K[0][1]+K[2][1]*K[1][1]+K[2][2]*K[2][1], K[2][0]*K[0][2]+K[2][1]*K[1][2]+K[2][2]*K[2][2]]
    ];
    const f2 = (1 - c) / (s*s);
    const I = [[1,0,0],[0,1,0],[0,0,1]];
    const R = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i=0;i<3;i++) for (let j=0;j<3;j++) R[i][j] = I[i][j] + K[i][j] + f2*K2[i][j];
    return R;
  }

  // ---- metals database (experimental lattice constants, Angstrom) ----
  const METALS = {
    Pt:{struct:"fcc",a:3.924}, Pd:{struct:"fcc",a:3.891}, Au:{struct:"fcc",a:4.078},
    Cu:{struct:"fcc",a:3.615}, Ag:{struct:"fcc",a:4.085}, Ni:{struct:"fcc",a:3.524},
    Ir:{struct:"fcc",a:3.839}, Rh:{struct:"fcc",a:3.803}, Al:{struct:"fcc",a:4.050},
    Fe:{struct:"bcc",a:2.866}, W:{struct:"bcc",a:3.165}, Mo:{struct:"bcc",a:3.147},
    Cr:{struct:"bcc",a:2.885},
    Co:{struct:"hcp",a:2.507,c:4.070}, Ru:{struct:"hcp",a:2.706,c:4.282},
    Ti:{struct:"hcp",a:2.951,c:4.684}, Zn:{struct:"hcp",a:2.665,c:4.947},
    Mg:{struct:"hcp",a:3.209,c:5.211}, Re:{struct:"hcp",a:2.761,c:4.456},
    Os:{struct:"hcp",a:2.734,c:4.320}
  };

  const CONV_BASIS = {
    fcc: [[0,0,0],[0,0.5,0.5],[0.5,0,0.5],[0.5,0.5,0]],
    bcc: [[0,0,0],[0.5,0.5,0.5]],
    sc:  [[0,0,0]]
  };

  function parseElement(input){
    if (!input) return "Pt";
    const m = String(input).trim().match(/^([A-Z][a-z]?)/);
    return m ? m[1] : String(input).trim();
  }

  // resolve structure/lattice from a metal symbol or explicit params
  function resolveSpec(spec){
    if (typeof spec === "string") spec = { element: spec };
    const el = parseElement(spec.element || spec.formula || "Pt");
    const known = METALS[el];
    const struct = (spec.structure || (known && known.struct) || "fcc").toLowerCase();
    const a = spec.a || (known && known.a) || 3.9;
    const c = spec.c || (known && known.c) || (struct === "hcp" ? a * 1.633 : a);
    return { element: el, structure: struct, a, c };
  }

  // ---- bulk conventional cell ----
  function buildBulk(spec){
    const s = resolveSpec(spec);
    let lattice, atoms;
    if (s.structure === "hcp"){
      const a = s.a, c = s.c;
      lattice = [[a,0,0],[-a/2, a*Math.sqrt(3)/2, 0],[0,0,c]];
      const basis = [[1/3,2/3,0.25],[2/3,1/3,0.75]];
      atoms = basis.map(f => ({ el:s.element, cart: matVec(transpose(lattice), f) }));
    } else {
      const a = s.a;
      lattice = [[a,0,0],[0,a,0],[0,0,a]];
      const basis = CONV_BASIS[s.structure] || CONV_BASIS.fcc;
      atoms = basis.map(f => ({ el:s.element, cart:[f[0]*a, f[1]*a, f[2]*a] }));
    }
    const sc = spec.supercell || [1,1,1];
    const cell = replicate({ lattice, atoms }, sc[0], sc[1], sc[2]);
    cell.spec = s;
    return cell;
  }

  function transpose(M){ return [[M[0][0],M[1][0],M[2][0]],[M[0][1],M[1][1],M[2][1]],[M[0][2],M[1][2],M[2][2]]]; }

  function replicate(cell, nx, ny, nz){
    const L = cell.lattice;
    const atoms = [];
    for (let i=0;i<nx;i++) for (let j=0;j<ny;j++) for (let k=0;k<nz;k++){
      const shift = V.add(V.add(V.scale(L[0],i), V.scale(L[1],j)), V.scale(L[2],k));
      cell.atoms.forEach(at => atoms.push({ el:at.el, cart: V.add(at.cart, shift), fixed: at.fixed }));
    }
    return { lattice: [V.scale(L[0],nx), V.scale(L[1],ny), V.scale(L[2],nz)], atoms };
  }

  // ---- 2D lattice (Gauss) reduction on two in-plane vectors (xy only) ----
  function gaussReduce2D(v1, v2){
    let a = v1.slice(), b = v2.slice();
    const dot2 = (u,w)=>u[0]*w[0]+u[1]*w[1];
    for (let it=0; it<50; it++){
      if (dot2(b,b) < dot2(a,a)){ const t=a; a=b; b=t; }
      const mu = Math.round(dot2(a,b)/dot2(a,a));
      if (mu === 0) break;
      b = [b[0]-mu*a[0], b[1]-mu*a[1], 0];
    }
    return [a, b];
  }

  // ---- slab builder (general cubic Miller cut; hcp(0001) special) ----
  function buildSlab(spec){
    const s = resolveSpec(spec);
    let miller = spec.miller || [1,1,1];
    if (typeof miller === "string"){
      const nums = miller.replace(/[()\[\]\s]/g,"").match(/-?\d/g) || ["1","1","1"];
      miller = nums.slice(0,3).map(Number);
    }
    const layers = Math.max(1, spec.layers || 4);
    const vacuum = spec.vacuum != null ? spec.vacuum : 15;
    const fixedLayers = Math.max(0, spec.fixedLayers || 0);
    const rep = spec.xyRepeat || [1,1];

    let slab;
    if (s.structure === "hcp"){
      slab = buildHcpBasal(s, layers);
    } else {
      slab = cutCubicSlab(s, miller, layers);
    }
    // tile in-plane
    if (rep[0] > 1 || rep[1] > 1) slab = tileInPlane(slab, rep[0], rep[1]);

    // add vacuum along z, mark fixed layers (from the bottom)
    const zs = slab.atoms.map(at => at.cart[2]);
    const zmin = Math.min(...zs);
    const layerZ = uniqueSorted(zs, 0.3);
    const fixZmax = fixedLayers > 0 ? layerZ[Math.min(fixedLayers, layerZ.length) - 1] + 0.2 : -Infinity;
    slab.atoms.forEach(at => {
      at.cart = [at.cart[0], at.cart[1], at.cart[2] - zmin];
      at.fixed = at.cart[2] <= (fixZmax - zmin);
    });
    const thickness = Math.max(...slab.atoms.map(a=>a.cart[2]));
    const c = thickness + vacuum;
    slab.lattice = [slab.lattice[0], slab.lattice[1], [0,0,c]];
    // centre the slab in the vacuum
    const dz = (c - thickness)/2;
    slab.atoms.forEach(at => at.cart = [at.cart[0], at.cart[1], at.cart[2] + dz]);

    slab.meta = { element:s.element, structure:s.structure, a:s.a, c:s.c,
      miller, layers, vacuum, fixedLayers, nLayers: layerZ.length,
      atomsPerLayer: Math.round(slab.atoms.length / layerZ.length),
      interlayer: layerZ.length > 1 ? (layerZ[1]-layerZ[0]) : null };
    return slab;
  }

  function buildHcpBasal(s, layers){
    const a = s.a, c = s.c, d = c/2;
    const A = [a,0,0], B = [-a/2, a*Math.sqrt(3)/2, 0];
    const atoms = [];
    // basal AB stacking: layer0 at (0,0); layer1 shifted to (1/3,2/3)
    for (let i=0;i<layers;i++){
      const frac = (i%2===0) ? [0,0] : [1/3,2/3];
      const xy = [frac[0]*A[0]+frac[1]*B[0], frac[0]*A[1]+frac[1]*B[1], 0];
      atoms.push({ el:s.element, cart:[xy[0], xy[1], i*d] });
    }
    return { lattice:[A,B,[0,0,layers*d]], atoms };
  }

  // primitive lattice vectors (Angstrom) for cubic Bravais types; Miller index is
  // referenced to the CONVENTIONAL cubic axes (= cartesian), so the surface normal
  // is simply [h,k,l]. Using the primitive cell yields clean, minimal surface cells.
  function primitiveCubic(structure, a){
    if (structure === "fcc") return [[0,a/2,a/2],[a/2,0,a/2],[a/2,a/2,0]];
    if (structure === "bcc") return [[-a/2,a/2,a/2],[a/2,-a/2,a/2],[a/2,a/2,-a/2]];
    return [[a,0,0],[0,a,0],[0,0,a]]; // simple cubic
  }

  function cutCubicSlab(s, miller, layers){
    const a = s.a;
    const P = primitiveCubic(s.structure, a);
    const basisCart = [[0,0,0]]; // one atom per primitive cell
    const [h,k,l] = miller;
    const nhat = V.unit([h,k,l]);
    const R = rotationBetween(nhat, [0,0,1]);
    const rot = (v) => matVec(R, v);

    // in-plane lattice vectors: integer combos of primitive vectors with rotated z ~ 0
    const candidates = [];
    const rng = 4;
    for (let i=-rng;i<=rng;i++) for (let j=-rng;j<=rng;j++) for (let m=-rng;m<=rng;m++){
      if (i===0&&j===0&&m===0) continue;
      const t = V.add(V.add(V.scale(P[0],i), V.scale(P[1],j)), V.scale(P[2],m));
      const tr = rot(t);
      if (Math.abs(tr[2]) < 1e-6){
        candidates.push({ xy:[tr[0],tr[1],0], len: Math.hypot(tr[0],tr[1]) });
      }
    }
    candidates.sort((x,y)=>x.len-y.len);
    // pick two shortest independent
    let A2 = candidates[0].xy, B2 = null;
    for (let n=1;n<candidates.length;n++){
      const cand = candidates[n].xy;
      const crossz = A2[0]*cand[1]-A2[1]*cand[0];
      if (Math.abs(crossz) > 1e-4){ B2 = cand; break; }
    }
    [A2, B2] = gaussReduce2D(A2, B2);
    // ensure right-handed (positive area)
    if ((A2[0]*B2[1]-A2[1]*B2[0]) < 0) B2 = [-B2[0],-B2[1],0];

    // generate atoms in a supercell, rotate, group into layers, keep `layers`
    const M = Math.max(4, layers + 3);
    const raw = [];
    for (let i=-M;i<=M;i++) for (let j=-M;j<=M;j++) for (let m=-M;m<=M;m++){
      const lat = V.add(V.add(V.scale(P[0],i), V.scale(P[1],j)), V.scale(P[2],m));
      basisCart.forEach(b => {
        const cart = [lat[0]+b[0], lat[1]+b[1], lat[2]+b[2]];
        const rc = rot(cart);
        raw.push(rc);
      });
    }
    const zvals = uniqueSorted(raw.map(p=>p[2]), 0.25);
    // choose reference layer near z=0 and take `layers` going up
    let startIdx = zvals.findIndex(z => z >= -0.05);
    if (startIdx < 0) startIdx = 0;
    const chosen = zvals.slice(startIdx, startIdx + layers);
    if (chosen.length < layers){
      const need = layers - chosen.length;
      const below = zvals.slice(Math.max(0,startIdx-need), startIdx);
      chosen.unshift(...below);
    }
    const zmin = chosen[0];

    // wrap atoms of chosen layers into the (A2,B2) in-plane cell
    const kept = [];
    const seen = new Set();
    const det = A2[0]*B2[1]-A2[1]*B2[0];
    const wrap01 = (f) => { f = f - Math.floor(f); if (f > 1 - 1e-4 || f < 1e-4) f = 0; return f; };
    const q = (f) => (Math.round(f * 100) / 100 + 0).toFixed(2); // 2-dp key, normalises -0
    for (const p of raw){
      const layerIdx = chosen.findIndex(z => Math.abs(p[2]-z) < 0.25);
      if (layerIdx < 0) continue;
      // fractional in-plane
      let f1 = wrap01((p[0]*B2[1]-p[1]*B2[0])/det);
      let f2 = wrap01((A2[0]*p[1]-A2[1]*p[0])/det);
      const key = layerIdx + "|" + q(f1) + "|" + q(f2);
      if (seen.has(key)) continue;
      seen.add(key);
      const x = f1*A2[0]+f2*B2[0];
      const y = f1*A2[1]+f2*B2[1];
      kept.push({ el:s.element, cart:[x, y, p[2]-zmin] });
    }
    kept.sort((u,w)=>u.cart[2]-w.cart[2]);
    return { lattice:[A2, B2, [0,0,0]], atoms: kept };
  }

  function tileInPlane(slab, rx, ry){
    const [A,B] = slab.lattice;
    const atoms = [];
    for (let i=0;i<rx;i++) for (let j=0;j<ry;j++){
      const sh = [i*A[0]+j*B[0], i*A[1]+j*B[1], 0];
      slab.atoms.forEach(at => atoms.push({ el:at.el, cart:V.add(at.cart, sh), fixed:at.fixed }));
    }
    return { lattice:[V.scale(A,rx), V.scale(B,ry), slab.lattice[2]], atoms };
  }

  function uniqueSorted(vals, tol){
    const s = vals.slice().sort((a,b)=>a-b);
    const out = [];
    for (const v of s){ if (!out.length || Math.abs(v-out[out.length-1])>tol) out.push(v); }
    return out;
  }

  // ---- adsorbate placement ----
  const ADSORBATES = {
    "H":  [["H",[0,0,0]]],
    "O":  [["O",[0,0,0]]],
    "N":  [["N",[0,0,0]]],
    "OH": [["O",[0,0,0]],["H",[0,0,0.97]]],
    "CO": [["C",[0,0,0]],["O",[0,0,1.15]]],
    "OOH":[["O",[0,0,0]],["O",[0.9,0,1.0]],["H",[1.4,0,1.7]]],
    "NO": [["N",[0,0,0]],["O",[0,0,1.15]]],
    "NH": [["N",[0,0,0]],["H",[0,0,1.02]]],
    "N2": [["N",[0,0,0]],["N",[0,0,1.10]]]
  };

  function topLayerAtoms(slab, tol){
    const zmax = Math.max(...slab.atoms.map(a=>a.cart[2]));
    return slab.atoms.filter(a => a.cart[2] > zmax - (tol||0.3));
  }

  function addAdsorbate(slab, opts){
    const species = (opts.species || "O").replace(/[*\s]/g,"");
    const siteType = (opts.site || "top").toLowerCase();
    const height = opts.height != null ? opts.height : 2.0;
    const top = topLayerAtoms(slab, 0.4);
    top.sort((a,b)=> (a.cart[0]-b.cart[0]) || (a.cart[1]-b.cart[1]));
    const ref = top[0] || slab.atoms[slab.atoms.length-1];
    let base;
    if (siteType.indexOf("bridge")>=0 || siteType.indexOf("桥")>=0){
      const nn = nearestInPlane(ref, top, 1)[0] || ref;
      base = [ (ref.cart[0]+nn.cart[0])/2, (ref.cart[1]+nn.cart[1])/2, Math.max(ref.cart[2],nn.cart[2]) ];
    } else if (siteType.indexOf("hollow")>=0 || siteType.indexOf("空穴")>=0 || siteType.indexOf("fcc")>=0 || siteType.indexOf("hcp")>=0){
      const nns = nearestInPlane(ref, top, 2);
      const pts = [ref, ...nns];
      base = [ pts.reduce((s,p)=>s+p.cart[0],0)/pts.length, pts.reduce((s,p)=>s+p.cart[1],0)/pts.length, Math.max(...pts.map(p=>p.cart[2])) ];
    } else { // top
      base = [ref.cart[0], ref.cart[1], ref.cart[2]];
    }
    const anchor = [base[0], base[1], base[2] + height];
    const mol = ADSORBATES[species] || ADSORBATES["O"];
    const newAtoms = slab.atoms.map(a=>({el:a.el, cart:a.cart.slice(), fixed:a.fixed}));
    mol.forEach(([el, off]) => newAtoms.push({ el, cart:[anchor[0]+off[0], anchor[1]+off[1], anchor[2]+off[2]], fixed:false, ads:true }));
    // extend cell height if needed
    const zmax = Math.max(...newAtoms.map(a=>a.cart[2]));
    let c = slab.lattice[2][2];
    if (zmax + 8 > c) c = zmax + 8;
    return { lattice:[slab.lattice[0], slab.lattice[1], [0,0,c]], atoms:newAtoms,
      meta: Object.assign({}, slab.meta, { adsorbate:species, site:siteType, siteBase:base }) };
  }

  function nearestInPlane(ref, list, count){
    return list.filter(a=>a!==ref)
      .map(a=>({a, d: Math.hypot(a.cart[0]-ref.cart[0], a.cart[1]-ref.cart[1])}))
      .filter(o=>o.d>0.1)
      .sort((x,y)=>x.d-y.d)
      .slice(0,count).map(o=>o.a);
  }

  // ---- descriptors ----
  function coordinationNumbers(atoms, cutoff){
    const cn = new Array(atoms.length).fill(0);
    for (let i=0;i<atoms.length;i++){
      for (let j=0;j<atoms.length;j++){
        if (i===j) continue;
        const d = V.norm(V.sub(atoms[i].cart, atoms[j].cart));
        if (d < cutoff && d > 0.1) cn[i]++;
      }
    }
    return cn;
  }

  // generalized coordination number of the adsorption site (Calle-Vallejo descriptor)
  function generalizedCoordination(structure, siteBase, cutoff, cnBulk){
    const atoms = structure.atoms.filter(a=>!a.ads);
    const cn = coordinationNumbers(atoms, cutoff);
    // neighbours of the site position among surface metal atoms
    let gcn = 0, nn = 0;
    atoms.forEach((a, i) => {
      const d = Math.hypot(a.cart[0]-siteBase[0], a.cart[1]-siteBase[1], a.cart[2]-siteBase[2]);
      if (d < cutoff*1.1){ gcn += cn[i]/cnBulk; nn++; }
    });
    return { gcn: Number(gcn.toFixed(3)), neighbours: nn };
  }

  // ---- honest adsorption-energy estimate (labelled, NOT DFT) ----
  // Simple, transparent GCN linear scaling around a reference; clearly flagged.
  function estimateAdsorption(gcn, metal, adsorbate){
    // reference GCN calibrated to this geometric descriptor's scale (~3.2 for a
    // flat terrace site); higher coordination -> weaker (less negative) binding.
    const refGcn = 3.2;
    const base = { "O":-1.0, "OH":-0.6, "OOH":-0.2, "H":-0.3, "CO":-0.8, "N":-0.9, "NO":-0.7, "NH":-0.5, "N2":-0.1 };
    const slope = 0.15; // eV per GCN unit (illustrative scaling, NOT calibrated to DFT)
    const b = base[(adsorbate||"O").replace(/[*\s]/g,"")] != null ? base[(adsorbate||"O").replace(/[*\s]/g,"")] : -0.6;
    const value = b + slope * (gcn - refGcn);
    return {
      value: Number(value.toFixed(2)),
      unit: "eV",
      method: "GCN-scaling-empirical",
      grade: "经验估算(非DFT/非实测)",
      note: "基于广义配位数(GCN)线性标度的示意估算，仅供趋势参考；定量吸附能需后端 MACE-MP/xTB/DFT 计算。"
    };
  }

  // ---- structure-file writers ----
  function cellParams(L){
    const a = V.norm(L[0]), b = V.norm(L[1]), c = V.norm(L[2]);
    const alpha = Math.acos(V.dot(L[1],L[2])/(b*c))*180/Math.PI;
    const beta  = Math.acos(V.dot(L[0],L[2])/(a*c))*180/Math.PI;
    const gamma = Math.acos(V.dot(L[0],L[1])/(a*b))*180/Math.PI;
    return { a,b,c,alpha,beta,gamma };
  }
  function cartToFrac(L, cart){
    // solve frac from L^T * frac = cart  (L rows are lattice vectors)
    const m = [[L[0][0],L[1][0],L[2][0]],[L[0][1],L[1][1],L[2][1]],[L[0][2],L[1][2],L[2][2]]];
    return solve3(m, cart);
  }
  function solve3(m, v){
    const det = m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])
              - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
              + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
    if (Math.abs(det) < 1e-12) return [0,0,0];
    const inv = [
      [(m[1][1]*m[2][2]-m[1][2]*m[2][1]), (m[0][2]*m[2][1]-m[0][1]*m[2][2]), (m[0][1]*m[1][2]-m[0][2]*m[1][1])],
      [(m[1][2]*m[2][0]-m[1][0]*m[2][2]), (m[0][0]*m[2][2]-m[0][2]*m[2][0]), (m[0][2]*m[1][0]-m[0][0]*m[1][2])],
      [(m[1][0]*m[2][1]-m[1][1]*m[2][0]), (m[0][1]*m[2][0]-m[0][0]*m[2][1]), (m[0][0]*m[1][1]-m[0][1]*m[1][0])]
    ];
    return [
      (inv[0][0]*v[0]+inv[0][1]*v[1]+inv[0][2]*v[2])/det,
      (inv[1][0]*v[0]+inv[1][1]*v[1]+inv[1][2]*v[2])/det,
      (inv[2][0]*v[0]+inv[2][1]*v[1]+inv[2][2]*v[2])/det
    ];
  }
  function fmt(x, w){ return (x>=0?" ":"") + x.toFixed(w||8); }

  function toCIF(structure, title){
    const p = cellParams(structure.lattice);
    let out = "";
    out += "data_" + (title || "generated") + "\n";
    out += "_symmetry_space_group_name_H-M   'P 1'\n_symmetry_Int_Tables_number      1\n";
    out += "_cell_length_a    " + p.a.toFixed(6) + "\n_cell_length_b    " + p.b.toFixed(6) + "\n_cell_length_c    " + p.c.toFixed(6) + "\n";
    out += "_cell_angle_alpha " + p.alpha.toFixed(4) + "\n_cell_angle_beta  " + p.beta.toFixed(4) + "\n_cell_angle_gamma " + p.gamma.toFixed(4) + "\n";
    out += "loop_\n _atom_site_label\n _atom_site_type_symbol\n _atom_site_fract_x\n _atom_site_fract_y\n _atom_site_fract_z\n";
    const counts = {};
    structure.atoms.forEach(at => {
      const f = cartToFrac(structure.lattice, at.cart).map(v => ((v%1)+1)%1);
      counts[at.el] = (counts[at.el]||0)+1;
      out += ` ${at.el}${counts[at.el]} ${at.el} ${f[0].toFixed(6)} ${f[1].toFixed(6)} ${f[2].toFixed(6)}\n`;
    });
    return out;
  }

  function toPOSCAR(structure, title){
    const els = [];
    const groups = {};
    structure.atoms.forEach(at => { if(!groups[at.el]){groups[at.el]=[]; els.push(at.el);} groups[at.el].push(at); });
    const hasFixed = structure.atoms.some(a=>a.fixed);
    let out = (title || "generated structure") + "\n1.0\n";
    structure.lattice.forEach(v => out += `  ${fmt(v[0],8)}  ${fmt(v[1],8)}  ${fmt(v[2],8)}\n`);
    out += "  " + els.join("  ") + "\n";
    out += "  " + els.map(e=>groups[e].length).join("  ") + "\n";
    if (hasFixed) out += "Selective dynamics\n";
    out += "Cartesian\n";
    els.forEach(e => groups[e].forEach(at => {
      let line = `  ${fmt(at.cart[0],8)}  ${fmt(at.cart[1],8)}  ${fmt(at.cart[2],8)}`;
      if (hasFixed){ const f = at.fixed ? "F F F" : "T T T"; line += "  " + f; }
      out += line + "\n";
    }));
    return out;
  }

  function toXYZ(structure, title){
    let out = structure.atoms.length + "\n" + (title || "generated") + "\n";
    structure.atoms.forEach(at => out += `${at.el} ${at.cart[0].toFixed(6)} ${at.cart[1].toFixed(6)} ${at.cart[2].toFixed(6)}\n`);
    return out;
  }

  // PDB (for 3Dmol convenience)
  function toPDB(structure, title){
    let out = "TITLE     " + (title||"generated") + "\n";
    const p = cellParams(structure.lattice);
    out += `CRYST1${p.a.toFixed(3).padStart(9)}${p.b.toFixed(3).padStart(9)}${p.c.toFixed(3).padStart(9)}${p.alpha.toFixed(2).padStart(7)}${p.beta.toFixed(2).padStart(7)}${p.gamma.toFixed(2).padStart(7)} P 1\n`;
    structure.atoms.forEach((at,i) => {
      const n = i+1;
      out += "HETATM" + String(n).padStart(5) + " " + at.el.padEnd(4) + " MOL     1    " +
        at.cart[0].toFixed(3).padStart(8) + at.cart[1].toFixed(3).padStart(8) + at.cart[2].toFixed(3).padStart(8) +
        "  1.00  0.00          " + at.el.padStart(2) + "\n";
    });
    out += "END\n";
    return out;
  }

  // ---- geometry summary ----
  function bulkNN(structure, cutoff){
    let min = Infinity;
    const a = structure.atoms;
    for (let i=0;i<a.length;i++) for (let j=i+1;j<a.length;j++){
      const d = V.norm(V.sub(a[i].cart, a[j].cart));
      if (d>0.1 && d<min) min = d;
    }
    return min;
  }

  root.CatalystCrystal = {
    METALS, buildBulk, buildSlab, addAdsorbate,
    coordinationNumbers, generalizedCoordination, estimateAdsorption,
    toCIF, toPOSCAR, toXYZ, toPDB, cellParams, bulkNN, resolveSpec
  };
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));

if (typeof module !== "undefined" && module.exports) module.exports = (typeof globalThis!=="undefined"?globalThis:this).CatalystCrystal;
