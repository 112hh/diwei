
  (() => {
    const SAMPLE_MATERIAL_IDS = new Set(["2d:mp-dbrqd", "mp-dbrqd"]);
    const SAMPLE_VISUALS = {
      bandStructure: ["01_MoS2_band_structure.png", "单层 MoS₂ 能带结构图，包含 Mo-d / S-p 轨道投影。"],
      dosPlot: ["02_MoS2_projected_DOS.png", "单层 MoS₂ 总态密度与投影态密度图。"],
      magneticGroundState: ["03_CrI3_magnetic_ground_state.png", "单层 CrI₃ 铁磁基态构型图，显示 Cr 原子自旋排列。"],
      phononDispersion: ["04_graphene_phonon_dispersion.png", "单层石墨烯声子谱图，显示无虚频的稳定声子分支。"],
      phononDOS: ["05_MoS2_phonon_DOS.png", "单层 MoS₂ 声子态密度图，区分 Mo 和 S 的振动贡献。"],
      dielectricFunction: ["06_hBN_dielectric_function.png", "单层 h-BN 介电函数实部与虚部。"],
      opticalAbsorption: ["07_MoS2_absorption_coefficient.png", "单层 MoS₂ 光吸收系数谱，标注可见光区吸收峰。"],
      reflectance: ["08_WS2_reflectivity.png", "单层 WS₂ 反射率谱。"],
      refractiveIndex: ["09_MoS2_refractive_index.png", "单层 MoS₂ 折射率谱。"],
      extinctionCoefficient: ["10_WS2_extinction_coefficient.png", "单层 WS₂ 消光系数谱。"],
      defectFormationEnergy: ["11_hBN_defect_formation_energy.png", "单层 h-BN 中典型缺陷形成能对比图。"],
      defectStructure: ["12_hBN_N_vacancy_structure.png", "单层 h-BN 氮空位 V_N 缺陷结构图。"]
    };

    const originalBuildTwodVisuals = buildTwodVisuals;
    buildTwodVisuals = function buildTwodVisualsWithMpDbrqdSamples(material) {
      const visuals = originalBuildTwodVisuals(material);
      const materialIds = [material?.id, material?.trueMaterialId, material?.materialId, material?.name];
      if (!materialIds.some((id) => SAMPLE_MATERIAL_IDS.has(String(id || "")))) return visuals;
      Object.entries(SAMPLE_VISUALS).forEach(([key, [filename, caption]]) => {
        visuals[key] = {
          type: "image",
          src: `assets/twod-visualizations/`,
          alt: caption,
          caption
        };
        visuals[key].src = `assets/twod-visualizations/` + filename;
      });
      return visuals;
    };
  })();
  