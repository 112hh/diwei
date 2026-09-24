
  (() => {
    if (window.__TWOD_DEMO_MATERIALS_SUPPORT_READY__) return;
    window.__TWOD_DEMO_MATERIALS_SUPPORT_READY__ = true;

    const DEMO_SOURCE = "平台演示数据集";
    const DEMO_UPDATED_AT = "2026-08-13";

    function parseDemoElements(formula) {
      const found = String(formula || "").match(/[A-Z][a-z]?/g) || [];
      return [...new Set(found)];
    }

    function demoAtomCoordinates(formula) {
      const elements = parseDemoElements(formula);
      const primary = elements[0] || "X";
      const secondary = elements[1] || primary;
      return [
        { atom: primary, element: primary, x: 0.33333, y: 0.66667, z: 0.50000 },
        { atom: secondary, element: secondary, x: 0.66667, y: 0.33333, z: 0.56250 },
        { atom: secondary, element: secondary, x: 0.66667, y: 0.33333, z: 0.43750 }
      ];
    }

    function demoBandType(gap) {
      if (gap <= 0.05) return "metal";
      if (gap >= 3) return "insulator";
      return "semiconductor";
    }

    function makeDemoMaterial(row) {
      const [id, name, formula, bandGap, formation, crystalSystem, spaceGroup, latticeA, latticeB, latticeC, latticeGamma, layerThickness, bondLength, bondAngle, density, volume, magneticOrder, transitionTemp, elasticConstants, young, poisson, dielectric, absorption, reflectance, refractive, extinction, defectType, defectEnergy, vacancyDefect, antisiteDefect, ferroelectric, piezo, conductivity] = row;
      const elements = parseDemoElements(formula);
      return {
        id,
        trueMaterialId: id,
        materialId: id,
        name,
        displayName: name,
        formula,
        displayFormula: formula,
        elements,
        bandGap,
        formation,
        formationEnergy: formation,
        spaceGroup,
        pointGroup: crystalSystem === "六方晶系" ? "6/mmm" : crystalSystem === "四方晶系" ? "4/mmm" : "mmm",
        crystalSystem,
        type: demoBandType(bandGap),
        status: "稳定",
        latticeA,
        latticeB,
        latticeC,
        latticeAlpha: 90,
        latticeBeta: 90,
        latticeGamma,
        layerThickness,
        layerThicknessNm: Number((layerThickness / 10).toFixed(3)),
        interlayer: layerThickness,
        bondLength,
        bondAngle,
        density,
        density_g_cm3: density,
        volume,
        volume_ang3: volume,
        surfaceArea: Number((latticeA * latticeB * (latticeGamma === 120 ? 0.866 : 1)).toFixed(3)),
        coordination: 6,
        source: DEMO_SOURCE,
        dataSource: DEMO_SOURCE,
        updatedAt: DEMO_UPDATED_AT,
        quality: "演示数据",
        sampleImported: true,
        sampleSourceFile: "二维材料演示数据",
        bandStructure: `${name} 能带结构：${bandGap <= 0.05 ? "金属" : bandGap >= 3 ? "绝缘体" : "半导体"}，带隙 ${bandGap.toFixed(2)} eV`,
        densityOfStates: `${name} 态密度样例，电子态数目 ${Number((bandGap + 1.2).toFixed(2))} states/eV`,
        dos: Number((bandGap + 1.2).toFixed(2)),
        effectiveMass: bandGap <= 0.05 ? 0.12 : Number((0.28 + bandGap * 0.12).toFixed(2)),
        mobility: bandGap <= 0.05 ? 680 : Number((240 / Math.max(bandGap, 0.3)).toFixed(2)),
        ferroelectric,
        piezo,
        conductivity,
        magneticOrder,
        transitionTemp,
        magnetization: magneticOrder === "非磁性" ? 0 : magneticOrder === "反铁磁" ? 1.6 : 2.4,
        thermalConductivity: Number((36 + young / 10).toFixed(2)),
        thermalExpansion: Number((3.2 + bandGap).toFixed(2)),
        phononSpectrum: "声学支3条，光学支6条，未观察到虚频",
        phononDensityOfStates: elements.join("、"),
        elasticConstants,
        young,
        poisson,
        hardness: Number((8 + young / 40).toFixed(2)),
        dielectric,
        absorption,
        reflectance,
        refractive,
        extinction,
        defectType,
        defectEnergy,
        defectConcentration: Number((1.2e12 + defectEnergy * 1e11).toExponential(2)),
        defectCharge: defectEnergy > 2 ? 0 : -1,
        vacancyDefect,
        antisiteDefect,
        atomicCoordinates: demoAtomCoordinates(formula),
        atomCoordinates: demoAtomCoordinates(formula),
        structureFile: `${formula}_${id}.cif`,
        sourceCif: `${formula}_${id}.cif`,
        localCifName: `${id}.cif`,
        structureFileName: `${formula}_${id}.cif`,
        dataPack: {
          source: DEMO_SOURCE,
          searchable: true,
          detailReady: true
        }
      };
    }

    const DEMO_ROWS = [
      ["demo-2d-001","Nb2C","Nb2C",0.18,-1.86,"六方晶系","P-6m2",3.12,3.12,20.10,120,6.42,2.20,119,6.21,169.34,"非磁性",0,"C11=258.40 N/m，C12=72.10 N/m，C66=93.15 N/m",221.6,0.24,9.8,68000,14.2,2.74,0.16,"C空位",1.46,"C空位缺陷；形成能1.46 eV；构型文件Nb2C_VC.cif","Nb_C反位缺陷；形成能2.88 eV；构型文件Nb2C_NbC.cif",0,2.2,120000],
      ["demo-2d-002","CrI3","CrI3",1.21,-0.63,"三方晶系","R-3",6.87,6.87,19.82,120,6.74,2.73,95,5.01,811.25,"铁磁",45,"C11=42.30 N/m，C12=12.80 N/m，C66=14.75 N/m",38.6,0.31,6.1,35600,9.4,2.48,0.08,"I空位",1.42,"I空位缺陷；形成能1.42 eV；构型文件CrI3_VI.cif","Cr_I反位缺陷；形成能3.12 eV；构型文件CrI3_CrI.cif",0,0.4,0.002],
      ["demo-2d-003","FePS3","FePS3",1.53,-0.92,"单斜晶系","C2/m",5.95,10.32,14.10,90,6.88,2.36,101,4.32,865.72,"反铁磁",118,"C11=96.20 N/m，C12=22.40 N/m，C66=34.80 N/m",78.4,0.28,7.4,42000,11.2,2.92,0.11,"S空位",1.78,"S空位缺陷；形成能1.78 eV；构型文件FePS3_VS.cif","P_Fe反位缺陷；形成能2.96 eV；构型文件FePS3_PFe.cif",0,0.9,0.004],
      ["demo-2d-004","Bi2O2Se","Bi2O2Se",0.82,-1.32,"四方晶系","I4/mmm",3.88,3.88,12.22,90,6.12,2.31,90,7.82,183.94,"非磁性",0,"C11=118.60 N/m，C12=36.40 N/m，C66=41.10 N/m",96.8,0.22,18.7,92000,19.6,3.84,0.24,"Se空位",1.16,"Se空位缺陷；形成能1.16 eV；构型文件Bi2O2Se_VSe.cif","Bi_Se反位缺陷；形成能2.54 eV；构型文件Bi2O2Se_BiSe.cif",0,1.1,0.036],
      ["demo-2d-005","SnS2","SnS2",2.26,-1.05,"六方晶系","P-3m1",3.65,3.65,11.84,120,5.92,2.55,118,4.50,136.68,"非磁性",0,"C11=82.40 N/m，C12=24.30 N/m，C66=29.05 N/m",64.3,0.26,11.3,76000,15.8,3.21,0.14,"S空位",1.33,"S空位缺陷；形成能1.33 eV；构型文件SnS2_VS.cif","Sn_S反位缺陷；形成能2.71 eV；构型文件SnS2_SnS.cif",0,1.8,0.006],
      ["demo-2d-006","GaN","GaN",3.35,-1.74,"六方晶系","P6mm",3.19,3.19,15.60,120,4.96,1.95,120,3.24,137.60,"非磁性",0,"C11=245.20 N/m，C12=68.30 N/m，C66=88.45 N/m",212.5,0.21,8.6,52000,12.7,2.36,0.05,"N空位",2.44,"N空位缺陷；形成能2.44 eV；构型文件GaN_VN.cif","Ga_N反位缺陷；形成能3.42 eV；构型文件GaN_GaN.cif",0,2.6,0.0002],
      ["demo-2d-007","BlueP","P",2.02,-0.58,"六方晶系","P-3m1",3.28,3.28,14.80,120,4.72,2.24,96,2.33,137.99,"非磁性",0,"C11=94.80 N/m，C12=28.60 N/m，C66=33.10 N/m",83.7,0.29,5.2,41000,10.4,2.18,0.07,"P空位",1.95,"P空位缺陷；形成能1.95 eV；构型文件BlueP_VP.cif","P_P反位缺陷；形成能暂无；构型文件BlueP_AP.cif",0,0.7,0.001],
      ["demo-2d-008","In2Se3","In2Se3",1.34,-0.88,"三方晶系","R3m",4.05,4.05,19.40,120,8.62,2.66,109,5.68,275.91,"非磁性",0,"C11=71.50 N/m，C12=18.70 N/m，C66=26.40 N/m",58.9,0.33,16.4,103000,21.8,4.12,0.22,"Se空位",1.27,"Se空位缺陷；形成能1.27 eV；构型文件In2Se3_VSe.cif","In_Se反位缺陷；形成能2.49 eV；构型文件In2Se3_InSe.cif",4.2,2.9,0.018],
      ["demo-2d-009","TiS2","TiS2",0.04,-1.48,"六方晶系","P-3m1",3.41,3.41,12.05,120,6.10,2.43,118,4.12,121.44,"非磁性",0,"C11=136.20 N/m，C12=42.40 N/m，C66=46.90 N/m",118.4,0.25,13.9,86000,18.1,3.62,0.44,"S空位",1.08,"S空位缺陷；形成能1.08 eV；构型文件TiS2_VS.cif","Ti_S反位缺陷；形成能2.31 eV；构型文件TiS2_TiS.cif",0,1.4,220000],
      ["demo-2d-010","NiCl2","NiCl2",2.74,-0.77,"三方晶系","R-3m",3.48,3.48,17.20,120,5.78,2.38,92,3.86,180.19,"反铁磁",52,"C11=58.40 N/m，C12=16.90 N/m，C66=20.75 N/m",46.2,0.30,7.8,39000,8.8,2.44,0.06,"Cl空位",1.62,"Cl空位缺陷；形成能1.62 eV；构型文件NiCl2_VCl.cif","Ni_Cl反位缺陷；形成能3.06 eV；构型文件NiCl2_NiCl.cif",0,0.5,0.0008],
      ["demo-2d-011","ZrS2","ZrS2",1.72,-1.18,"六方晶系","P-3m1",3.66,3.66,12.30,120,6.24,2.58,118,4.92,142.54,"非磁性",0,"C11=112.60 N/m，C12=31.80 N/m，C66=40.40 N/m",95.6,0.27,10.6,71000,13.9,3.05,0.13,"S空位",1.51,"S空位缺陷；形成能1.51 eV；构型文件ZrS2_VS.cif","Zr_S反位缺陷；形成能2.68 eV；构型文件ZrS2_ZrS.cif",0,1.5,0.009],
      ["demo-2d-012","SiC","SiC",2.58,-1.64,"六方晶系","P-6m2",3.08,3.08,16.00,120,4.12,1.78,120,3.12,131.36,"非磁性",0,"C11=302.40 N/m，C12=78.90 N/m，C66=111.75 N/m",278.8,0.18,6.7,64000,11.5,2.62,0.04,"C空位",2.05,"C空位缺陷；形成能2.05 eV；构型文件SiC_VC.cif","Si_C反位缺陷；形成能3.55 eV；构型文件SiC_SiC.cif",0,1.9,0.0005]
    ];

    function upsertDemoMaterial(record) {
      if (typeof twodMaterials === "undefined" || !Array.isArray(twodMaterials)) return;
      const index = twodMaterials.findIndex((item) => item.id === record.id || item.trueMaterialId === record.id);
      if (index >= 0) twodMaterials[index] = Object.assign({}, twodMaterials[index], record);
      else twodMaterials.push(record);
    }

    function installDemoMaterials() {
      DEMO_ROWS.map(makeDemoMaterial).forEach(upsertDemoMaterial);
      window.LOW_DIM_TWOD_DEMO_MATERIAL_COUNT = DEMO_ROWS.length;
    }

    function refreshTwodDemoPage() {
      try {
        if (state?.page === "twod" && typeof refreshTwodResults === "function") refreshTwodResults();
        if (state?.page === "twod-detail") {
          const material = typeof getCurrentMaterial === "function" ? getCurrentMaterial() : null;
          if (material && typeof renderTwodDetailPage === "function") renderTwodDetailPage(material);
        }
      } catch (error) {
        console.warn("Twod demo materials installed, active page refresh skipped.", error);
      }
    }

    installDemoMaterials();
    setTimeout(refreshTwodDemoPage, 0);
  })();
  