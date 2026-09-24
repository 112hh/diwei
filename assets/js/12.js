
  (() => {
    if (window.__LOW_DIM_EXCEL_SAMPLE_DATA_MERGED__) return;
    window.__LOW_DIM_EXCEL_SAMPLE_DATA_MERGED__ = true;

    const EXCEL_SAMPLE_SOURCE = "低维材料-样例数据汇总清单0827.xlsx";
    const EXCEL_SAMPLE_DATE = "2026-08-27";
    const EXCEL_SAMPLE_DATA_SOURCE = "公开数据集";

    const SAMPLE_ROWS = {"twod":[["mp-1018134","MoS2","MoS2",1.68,-1.23,"P6₃/mmc","六方晶系",0.65,3.16,3.16,12.3,6.5,2.41,120,267,0.27,86,0,3.8,0.012,"非磁性","空位缺陷",1.82,4.18,0.21,120000,18,15.6,[0,500,2000,8000,25000,80000,120000,100000,60000,30000],[0,2,4,8,12,18,20,19,15,10],[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6],[0.2,0.5,1.0,1.8,2.5,1.2,0.3,0.8,1.5,2.0,1.8,1.2,0.6],[8.5,9.2,10.1,11.5,13.2,15.6,14.8,12.5,10.2,8.8],[0.5,0.8,1.2,2.1,3.5,4.2,3.8,2.5,1.5,0.8],0.52],["mp-1044134","WS2","WS2",1.91,-1.11,"P6₃/mmc","六方晶系",0.67,3.15,3.15,12.1,6.48,2.42,119,249,0.25,72,0,2.9,0.01,"非磁性","空位缺陷",1.64,4.62,0.29,138000,21.4,17.3,[0,400,1500,6000,20000,70000,138000,115000,70000,35000],[0,1.5,3.5,7,11,16,21,20,16,11],[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6],[0.15,0.4,0.8,1.5,2.2,1.1,0.3,0.7,1.3,1.8,1.6,1.1,0.5],[9.0,10.0,11.2,13.0,15.0,17.3,16.5,14.0,11.5,9.5],[0.4,0.7,1.0,1.8,3.0,3.8,3.5,2.2,1.2,0.7],0.41],["mp-1018135","WSe2","WSe2",1.58,-0.98,"P6₃/mmc","六方晶系",0.69,3.28,3.28,12.96,6.52,2.53,118,206,0.24,54,0,2.6,0.009,"弱铁磁","硒空位",1.57,4.01,0.31,115000,17.3,14.2,[0,300,1000,4000,15000,50000,115000,95000,55000,25000],[0,1,3,6,9,14,17,16,13,9],[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6],[0.12,0.35,0.75,1.4,2.0,1.0,0.25,0.65,1.2,1.7,1.5,1.0,0.45],[8.0,8.8,9.8,11.2,12.8,14.2,13.5,11.8,9.8,8.2],[0.3,0.6,0.9,1.6,2.8,3.5,3.2,2.0,1.1,0.6],0.48],["mp-1018136","MoSe2","MoSe2",1.47,-1.16,"P6₃/mmc","六方晶系",0.69,3.29,3.29,12.95,6.58,2.53,118,184,0.24,54,0,2.4,0.008,"非磁性","硒空位",1.57,3.85,0.28,108000,16.5,13.8,[0,200,800,3000,10000,40000,108000,90000,50000,22000],[0,0.8,2.5,5,8,12,16,15,12,8],[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6],[0.1,0.3,0.7,1.3,1.9,0.95,0.22,0.6,1.1,1.6,1.4,0.95,0.4],[7.5,8.2,9.2,10.5,12.0,13.8,13.0,11.2,9.2,7.8],[0.3,0.5,0.8,1.5,2.5,3.2,2.9,1.8,1.0,0.5],0.48],["mp-1018137","MoTe2","MoTe2",1.03,-0.86,"P6₃/mmc","六方晶系",0.72,3.52,3.52,13.74,6.91,2.73,115,174,0.23,48,0,2.1,0.016,"非磁性","碲空位",1.34,4.84,0.31,145000,23.8,18.9,null,null,null,null,null,null,0.42],["mp-1018138","WTe2","WTe2",0.95,-0.79,"P6₃/mmc","六方晶系",0.74,3.55,3.55,13.82,6.95,2.75,114,168,0.22,42,0,1.8,0.02,"非磁性","碲空位",1.28,5.12,0.34,152000,25.1,20.2,null,null,null,null,null,null,0.38],["mp-1018139","MoSSe","MoSSe",1.45,-0.95,"P6₃/mmc",null,null,3.2,3.2,12.5,null,null,null,null,null,null,null,null,null,"非磁性","空位缺陷",1.5,null,null,null,null,15,null,null,null,null,null,null,0.44],["mp-1018140","WSSe","WSSe",1.65,-0.88,"P6₃/mmc",null,null,3.22,3.22,12.6,null,null,null,null,null,null,null,null,null,"非磁性","空位缺陷",1.45,null,null,null,null,16.5,null,null,null,null,null,null,0.4],["mp-1018141","PtSe2","PtSe3",1.25,-0.72,"P-3m1",null,null,3.72,3.72,5.1,null,null,null,null,null,null,null,null,null,"非磁性","硒空位",1.4,null,null,null,null,12.5,null,null,null,null,null,null,0.5],["mp-1018142","PdSe2","PdSe3",1.15,-0.65,"Pbca",null,null,5.73,5.83,7.69,null,null,null,null,null,null,null,null,null,"非磁性","硒空位",1.35,null,null,null,null,11.8,null,null,null,null,null,null,0.55]],"electrolyte":[["EL-001","碳酸乙烯酯","EC","C3H4O3","96-49-1","有机电解液","有机溶剂","低风险",0.01,-8.72,0.61,4.9,-671,-622,-48,"高介电常数,成膜添加剂"],["EL-002","六氟磷酸锂","LiPF6","LiPF6","21324-40-3","有机电解液","锂盐","中等风险",0.011,-9.15,-0.42,0,-1642,-1581,-136,"锂盐,高导电"],["EL-003","碳酸二甲酯","DMC","C3H6O3","616-38-6","有机电解液","有机溶剂","低风险",0.018,-8.95,0.48,0.9,-643,-593,-36,"低黏度,共溶剂"],["EL-004","氟代碳酸乙烯酯","FEC","C3H3FO3","114435-02-8","有机电解液","有机溶剂","中等风险",0.0086,-8.94,0.42,5.1,-702,-651,-53,"成膜添加剂,高电压"],["EL-005","碳酸丙烯酯","PC","C4H6O3","108-32-7","有机电解液","有机溶剂","低风险",0.0075,-8.65,0.55,4.3,-682,-631,-42,"高介电常数,宽温域"],["EL-006","碳酸甲乙酯","EMC","C4H8O3","623-53-0","有机电解液","有机溶剂","低风险",0.0092,-8.85,0.51,1.8,-658,-608,-39,"低黏度,高倍率"],["EL-007","碳酸二乙酯","DEC","C5H10O3","105-58-8","有机电解液","有机溶剂","低风险",0.0068,-8.35,0.83,3.1,-736,-681,-36,"低黏度,共溶剂"],["EL-008","双氟磺酰亚胺锂","LiFSI","LiF2NO4S2","171611-11-3","有机电解液","锂盐","中等风险",0.013,-9.26,-0.58,0,-1718,-1644,-136,"高导电,热稳定"],["EL-009","二氟草酸硼酸锂","LiDFOB","C2H2BF2LiO4","409071-16-5","有机电解液","锂盐","中等风险",0.008,-8.85,-0.35,2.1,-1380,-1320,-98,"成膜添加剂"],["EL-010","四氟硼酸锂","LiBF4","LiBF4","14283-07-9","有机电解液","锂盐","中等风险",0.007,-8.95,-0.28,0,-1290,-1235,-88,"宽温域"],["EL-SO-021","聚环氧乙烷","PEO","(C2H4O)n","25322-68-3","固态有机","聚合物","低风险",1e-05,-7.42,1.17,2.9,-1240,-1188,-20,"聚合物,固态电解质"],["EL-SO-022","聚偏氟乙烯","PVDF-HFP","(C3H3F3)n","9011-17-0","固态有机","聚合物","低风险",0.00024,-7.15,1.35,3.1,-1120,-1065,-18,"聚合物基体,柔性"],["EL-SO-023","聚丙烯腈","PAN","(C3H3N)n","25014-41-9","固态有机","聚合物","低风险",8.2e-06,-6.95,1.42,4.2,-1080,-1025,-15,"高机械强度"],["EL-SO-024","PEO-LiTFSI复合","PEO-LiTFSI","PEO+LiTFSI","NA","固态有机","复合电解质","低风险",3.5e-05,-7.25,1.25,3.5,-1320,-1265,-28,"高离子电导"],["EL-SO-025","PEO-LLZO复合","PEO-LLZO","PEO+LLZO","NA","固态有机","复合电解质","低风险",4.2e-05,-7.18,1.28,3.2,-1350,-1290,-25,"有机-无机复合"],["EL-SO-026","聚碳酸酯","PPC","(C3H4O3)n","NA","固态有机","聚合物","低风险",1.5e-05,-7.05,1.32,4.5,-1210,-1158,-22,"高电压稳定"],["EL-SI-031","LLZO石榴石","LLZO","Li7La3Zr2O12","NA","固态无机","氧化物","低风险",0.0003,-6.84,1.93,0,-4216,-4068,-12,"石榴石结构,高稳定性"],["EL-SI-032","硫代磷酸锂","LPS","Li3PS4","NA","固态无机","硫化物","中等风险",0.00018,-6.22,1.46,0,-3185,-3040,-8,"硫化物,高导电"],["EL-SI-033","LATP","LATP","Li1.3Al0.3Ti1.7(PO4)3","12031-63-9","固态无机","氧化物","低风险",0.00034,-6.45,1.81,0,-3980,-3820,-10,"NASICON,氧化物"],["EL-SI-034","LGPS","LGPS","Li10GeP2S12","144983-75-9","固态无机","硫化物","中等风险",0.012,-5.98,1.68,0,-3850,-3680,-6,"硫化物,超离子导体"],["EL-SI-035","Li6PS5Cl","Li6PS5Cl","Li6PS5Cl","NA","固态无机","硫化物","中等风险",0.002,-6.08,1.55,0,-3420,-3260,-9,"硫银锗矿型"],["EL-SI-036","Li3N","Li3N","Li3N","NA","固态无机","氮化物","低风险",0.0008,-5.85,2.05,0,-1980,-1880,-15,"氮化物,高离子电导"],["EL-SI-037","LAGP","LAGP","Li1.5Al0.5Ge1.5(PO4)3","NA","固态无机","氧化物","低风险",0.00028,-6.52,1.78,0,-4080,-3910,-11,"NASICON,高稳定性"],["EL-SI-038","Li2S-P2S5","Li2S-P2S5","Li2S-P2S5","NA","固态无机","硫化物","中等风险",0.00025,-6.15,1.52,0,-3350,-3190,-8.5,"硫化物玻璃陶瓷"],["EL-SI-039","LPS","Li3PS4","Li3PS4","NA","固态无机","硫化物",null,null,-6.22,1.46,0,-3185,null,null,"硫化物"]],"opto":[["OP-001","TPD","N,N'-二苯基-N,N'-二(间甲苯基)-1,1'-联苯-4,4'-二胺","C38H32N2",516.7,-5.2,-2.1,3.1,"发光材料","蓝光","OLED",350,450,85,"12.5 ns","空穴传输"],["OP-002","Alq3","三(8-羟基喹啉)合铝","C27H18AlN3O3",459.4,-5.7,-3,2.7,"传输材料","绿光","OLED",380,520,73,"14.1 ns","电子传输"],["OP-005","Ir(ppy)3","三(2-苯基吡啶)合铱","C33H24IrN3",654.8,-5.3,-2.8,2.5,"磷光材料","绿光","OLED",385,512,92,"1.5 μs","磷光发射"],["OP-007","NPB","N,N'-二(1-萘基)-N,N'-二苯基联苯胺","C44H32N2",588.7,-5.4,-2.4,3,"空穴传输","蓝紫","OLED",372,435,21,"3.4 ns","空穴传输"],["OP-009","CBP","4,4'-双(N-咔唑基)-1,1'-联苯","C36H24N2",484.6,-6,-2.6,3.4,"主体材料","深蓝","OLED",345,410,38,"5.1 ns","主体材料"],["OP-010","TCTA","三(4-咔唑基-9-基苯基)胺","C44H30N4",614.7,-5.7,-2.4,3.3,"空穴传输","蓝紫","OLED",365,428,33,"4.7 ns","空穴传输"],["OP-011","BCP","浴铜灵","C36H24N2",484.6,-6.1,-2.9,3.2,"空穴阻挡","蓝紫","OLED",320,400,15,"2.8 ns","空穴阻挡"],["OP-012","F8BT","聚(9,9-二辛基芴-alt-苯并噻二唑)","(C26H26N2S)n",55000,-5.8,-3.1,2.7,"发光聚合物","绿光","OLED",460,540,62,"7.6 ns","聚合物"],["OP-003","C60","富勒烯 C60","C60",720.6,-6.2,-4.5,1.7,"电子受体","深紫","OPV",390,690,3,"1.8 ns","富勒烯"],["OP-006","PDI","苝二酰亚胺衍生物","C24H10N2O4",390.3,-6,-3.8,2.2,"电子受体","红色","OPV",525,620,58,"6.6 ns","非富勒烯"],["OP-008","PCBM","[6,6]-苯基-C61-丁酸甲酯","C72H14O2",910.9,-6.1,-3.9,2.2,"电子受体","棕黑","OPV",335,620,4,"2.1 ns","富勒烯"],["OP-013","ITIC","引达省并二噻吩并[3,2-b]噻吩","C82H86N4O2S2",1299.8,-5.5,-3.9,1.6,"非富勒烯受体","近红外","OPV",705,810,9,"0.9 ns","非富勒烯"],["OP-014","Y6","Y6受体材料","C82H86F4N8O2S5",1523,-5.7,-4.1,1.4,"非富勒烯受体","深红","OPV",825,910,6,"0.7 ns","非富勒烯"],["OP-015","IEICO","茚并噻吩受体","C92H86N4O2S2",1398,-5.6,-4,1.6,"非富勒烯受体","近红外","OPV",750,850,8,"0.8 ns","非富勒烯"],["OP-004","P3HT","聚(3-己基噻吩)","(C10H14S)n",30000,-5,-3.2,1.8,"空穴传输","橙红","OPV",520,650,24,"4.2 ns","聚合物"],["OP-016","Spiro-OMeTAD","螺环-OMeTAD","C81H68N4O8",1225.4,-5.1,-2.2,2.9,"空穴传输","琥珀","钙钛矿",390,605,18,"3.1 ns","螺环"],["OP-017","PTAA","聚[双(4-苯基)(2,4,6-三甲基苯基)胺]","(C21H19N)n",35000,-5.2,-2.3,2.9,"空穴传输","琥珀","钙钛矿",380,590,15,"2.8 ns","聚合物"],["OP-018","PEDOT:PSS","聚(3,4-乙烯二氧噻吩):聚苯乙烯磺酸盐","(C8H8O3S)n",50000,-5,-3.4,1.6,"空穴传输","透明","钙钛矿/OPV",300,500,10,"1.5 ns","导电聚合物"],["OP-019","PtOEP","八乙基卟啉铂","C36H44N4Pt",751.9,-5.1,-3,2.1,"磷光材料","红光","OLED",380,650,85,"10 μs","磷光"],["OP-020","4CzIPN","四咔唑基间苯二甲腈","C42H28N6",616.7,-5.7,-3.2,2.5,"TADF材料","黄绿","OLED",370,540,94,"4.8 μs","TADF"],["OP-021","2CzPN","二咔唑基邻苯二甲腈","C32H20N4",460.5,-5.8,-3.1,2.7,"TADF材料","天蓝","OLED",350,490,88,"3.2 μs","TADF"],["OP-022","Ir(MDQ)2(acac)","二(2-甲基二苯并[f,h]喹喔啉)(乙酰丙酮)合铱","C43H31IrN4O2",851.9,-5.3,-2.9,2.4,"磷光材料","红光","OLED",420,620,88,"2.2 μs","磷光"]],"mlff":[["ML-001","水分子","Water","H2O","962",-74.1,1.85,"TIP3P","DFT/B3LYP","电荷","-0.834 / 0.417 e","小体系","单体","https://github.com/openmm/openmm-forcefields"],["ML-002","苯","Benzene","C6H6","241",-627.5,0,"OPLS-AA","DFT/B3LYP","键角参数","120°, 469 kcal/mol/rad²","小体系","单体","https://github.com/openmm/openmm-forcefields"],["ML-003","乙醇","Ethanol","C2H5OH","702",-154.3,1.69,"GAFF","MP2","多极矩","1.69 D","小体系","单体","https://github.com/openmm/openmm-forcefields"],["ML-004","甲醇","Methanol","CH3OH","887",-96.3,1.7,"OPLS-AA","DFT/B3LYP","极化率","3.29 Å³","小体系","单体","https://github.com/openmm/openmm-forcefields"],["ML-005","甲烷","Methane","CH4","297",-40.5,0,"CHARMM","MP2","范德华参数","σ=3.73 Å","小体系","单体","https://github.com/openmm/openmm-forcefields"],["ML-006","丙酮","Acetone","C3H6O","180",-193.4,2.91,"GAFF2","DFT/M06","电荷模型","RESP","小体系","单体","https://github.com/openmm/openmm-forcefields"],["ML-007","乙腈","Acetonitrile","C2H3N","6342",-132.1,3.92,"AMBER","DFT/B3LYP","多极矩","3.92 D","小体系","单体","https://github.com/openmm/openmm-forcefields"],["ML-008","甲酰胺","Formamide","CH3NO","713",-169.7,3.73,"GAFF","DFT/B3LYP","氢键参数","0.78 kcal/mol, 1.94 Å","小体系","单体","https://github.com/openmm/openmm-forcefields"],["ML-009","氯化钠","Sodium Chloride","NaCl","5234",-98.2,9,"CHARMM","DFT/PBE","离子参数","Na: +1.0, Cl: -1.0","小体系","离子晶体","https://github.com/openmm/openmm-forcefields"],["ML-010","氯化锂","Lithium Chloride","LiCl","4332",-86.5,7.2,"AMBER","DFT/PBE","离子参数","Li: +1.0, Cl: -1.0","小体系","离子晶体","https://github.com/openmm/openmm-forcefields"],["ML-011","四氟硼酸锂","Lithium Tetrafluoroborate","LiBF4","12345",-345.6,0,"GAFF","DFT/B3LYP","离子参数","Li: +1.0, BF4: -1.0","小体系","离子液体","https://github.com/openmm/openmm-forcefields"],["ML-012","1-乙基-3-甲基咪唑","EMIM","C6H11N2","12346",-212.3,12.5,"GAFF2","DFT/B3LYP","离子液体","EMIM+: +1.0","小体系","离子液体","https://github.com/openmm/openmm-forcefields"],["ML-013","聚乙二醇","PEG","(C2H4O)n","N/A",-245.6,2.3,"GAFF","DFT/B3LYP","聚合物参数","重复单元: CH2CH2O","大体系","聚合物","https://github.com/openmm/openmm-forcefields"],["ML-014","聚苯乙烯","Polystyrene","(C8H8)n","N/A",-456.2,0.5,"OPLS-AA","DFT/B3LYP","聚合物参数","重复单元: C8H8","大体系","聚合物","https://github.com/openmm/openmm-forcefields"],["ML-015","丙氨酸二肽","Alanine Dipeptide","C8H14N2O3","12347",-542.1,2.15,"AMBER","DFT/B3LYP","蛋白质参数","标准氨基酸参数","大体系","蛋白质","https://github.com/openmm/openmm-forcefields"],["ML-016","DNA双链","DNA Duplex","C10H12N5O6P","N/A",-892.3,15.6,"CHARMM","DFT/B3LYP","DNA参数","标准核酸参数","大体系","DNA","https://github.com/openmm/openmm-forcefields"],["ML-017","MOF-5","MOF-5","C24H12O13Zn4","N/A",-1256.4,0,"UFF","DFT/PBE","MOF参数","Zn4O(BDC)3","大体系","MOF","https://github.com/openmm/openmm-forcefields"],["ML-018","ZIF-8","ZIF-8","C24H24N12Zn4","N/A",-1189.7,0,"UFF","DFT/PBE","ZIF参数","Zn(MIM)2","大体系","ZIF","https://github.com/openmm/openmm-forcefields"],["ML-019","沸石","Zeolite","SiO2","N/A",-678.9,0,"ClayFF","DFT/PBE","沸石参数","SiO4四面体","大体系","沸石","https://github.com/openmm/openmm-forcefields"],["ML-020","石墨烯","Graphene","C","N/A",-345.6,0,"AIREBO","DFT/PBE","碳材料参数","sp2碳网络","大体系","2D材料","https://github.com/openmm/openmm-forcefields"]],"catalyst":[["CAT-PT-111-001","Pt(111)","铂单晶(111)面","Pt","ORR","金属单晶","Pt","*O, *OH, *OOH",0.45,85,12.5,"顶位",-0.85,-2.45,"high-activity"],["CAT-PTNI-111-007","PtNi(111)","铂镍合金(111)面","PtNi","ORR","合金催化剂","Pt, Ni","*OOH, *OH",0.34,94,18.4,"桥位",-0.74,-2.12,"high-activity"],["CAT-PT3NI-111-008","Pt3Ni(111)","铂三镍合金(111)面","Pt3Ni","ORR","合金催化剂","Pt, Ni","*O, *OH",0.38,92,15.6,"顶位",-0.78,-2.05,"high-selectivity"],["CAT-FENC-002","Fe-N-C","铁氮掺杂碳材料","FeN4-C","ORR","单原子催化剂","Fe, N, C","*OOH, *OH",0.68,92,9.6,"Fe-N4",-1.12,-1.86,"high-selectivity"],["CAT-AU-111-009","Au(111)","金单晶(111)面","Au","ORR","金属单晶","Au","*OOH",0.68,45,2.1,"顶位",-0.42,-1.85,"low-activity"],["CAT-PD-111-010","Pd(111)","钯单晶(111)面","Pd","ORR","金属单晶","Pd","*O, *OH",0.52,78,6.8,"顶位",-0.68,-2.01,"medium-activity"],["CAT-CO3O4-003","Co3O4","四氧化三钴","Co3O4","OER","金属氧化物","Co, O","*O, *OOH",0.52,78,7,"Co位点",-0.73,-1.92,"medium-activity"],["CAT-NIFE-LDH-004","NiFe-LDH","镍铁层状双氢氧化物","NiFe-LDH","OER","层状双金属","Ni, Fe, O, H","*OH, *O",0.38,95,15.2,"Fe位点",-0.66,-1.74,"high-activity"],["CAT-RUO2-110-011","RuO2(110)","二氧化钌(110)面","RuO2","OER","金属氧化物","Ru, O","*OH, *OOH",0.29,91,17.1,"Ru位点",-0.58,-1.68,"high-activity"],["CAT-IRO2-110-012","IrO2(110)","二氧化铱(110)面","IrO2","OER","金属氧化物","Ir, O","*O, *OOH",0.33,93,16.2,"Ir位点",-0.62,-1.72,"high-activity"],["CAT-LAMNO3-013","LaMnO3","镧锰钙钛矿","LaMnO3","OER","钙钛矿","La, Mn, O","*OOH, *O",0.48,82,8.5,"Mn位点",-0.81,-1.95,"medium-activity"],["CAT-MOS2-005","MoS2","二硫化钼纳米片","MoS2","HER","二维硫化物","Mo, S","*H",0.42,88,11.3,"Mo边缘",-0.21,-1.58,"high-selectivity"],["CAT-NI-111-014","Ni(111)","镍单晶(111)面","Ni","HER","金属单晶","Ni","*H",0.61,72,6.9,"顶位",-0.32,-1.94,"medium-activity"],["CAT-NIMO-015","NiMo","镍钼合金纳米片","NiMo","HER","合金催化剂","Ni, Mo","*H",0.27,90,13.8,"Mo富集边缘",-0.11,-1.49,"high-activity"],["CAT-COP-016","CoP","磷化钴纳米片","CoP","HER","金属磷化物","Co, P","*H",0.31,86,10.6,"Co-P桥位",-0.18,-1.61,"high-selectivity"],["CAT-WS2-017","WS2","二硫化钨纳米片","WS2","HER","二维硫化物","W, S","*H",0.48,82,8.2,"W边缘",-0.25,-1.62,"medium-activity"],["CAT-N2P-018","Ni2P","磷化镍","Ni2P","HER","金属磷化物","Ni, P","*H",0.35,84,9.5,"Ni-P位点",-0.15,-1.55,"high-selectivity"],["CAT-CU-111-018","Cu(111)","铜单晶(111)面","Cu","CO2RR","金属单晶","Cu","*CO, *COOH",0.65,55,3.2,"顶位",-0.52,-2.21,"medium-selectivity"],["CAT-AG-111-019","Ag(111)","银单晶(111)面","Ag","CO2RR","金属单晶","Ag","*COOH",0.72,48,2.5,"顶位",-0.38,-2.05,"low-activity"],["CAT-AU-111-020","Au(111)","金单晶(111)面","Au","CO2RR","金属单晶","Au","*COOH",0.58,62,3.8,"顶位",-0.45,-2.15,"medium-selectivity"],["CAT-PT-111","Pt(111)",null,"Pt","ORR","金属单晶","Pt",null,0.45,85,null,"顶位",null,null,null],["CAT-PD-111","Pd(111)",null,"Pd","ORR","金属单晶","Pd",null,0.52,78,null,"顶位",null,null,null],["CAT-AU-111","Au(111)",null,"Au","CO2RR","金属单晶","Au",null,0.58,62,null,"顶位",null,null,null],["CAT-FE-111","Fe(111)",null,"Fe","ORR","金属单晶","Fe",null,0.48,82,null,"顶位",null,null,null],["CAT-CO-0001","Co(0001)",null,"Co","OER","金属单晶","Co",null,0.42,88,null,"顶位",null,null,null],["CAT-NI-111","Ni(111)",null,"Ni","HER","金属单晶","Ni",null,0.61,72,null,"顶位",null,null,null]]};

    const toElements = (value) => {
      const text = String(value || "").replace(/\([^)]*\)n?/g, "").replace(/[^A-Za-z]/g, " ");
      const found = text.match(/[A-Z][a-z]?/g) || [];
      return [...new Set(found)];
    };

    const bandType = (gap) => Number(gap) <= 0.05 ? "metal" : Number(gap) < 3 ? "semiconductor" : "insulator";
    const categoryKey = (value) => String(value || "").includes("固态无机") ? "solidInorganic" : String(value || "").includes("固态有机") ? "solidOrganic" : "organic";
    const routeText = (route) => ({ ORR: "氧还原反应(ORR)", OER: "氧析出反应(OER)", HER: "析氢反应(HER)", CO2RR: "二氧化碳还原反应(CO2RR)" }[route] || route);

    function makeTwod(row) {
      const [id, name, formula, bandGap, formation, spaceGroup, crystalSystem, layerNm, a, b, c, interlayer, bondLength, bondAngle, young, poisson, thermal, ferroelectric, piezo, conductivity, magneticOrder, defectType, defectEnergy, refractive, extinction, absorption, reflectance, dielectric, absorptionCurve, reflectanceCurve, dosEnergy, dosValues, dielectricReal, dielectricImag, effectiveMass] = row;
      const volume = a && b && c ? Number((a * b * c * 0.866).toFixed(3)) : null;
      const density = volume ? Number((Math.max(1.8, 9.2 - Number(layerNm || 0) * 3)).toFixed(4)) : null;
      return {
        id, trueMaterialId: id, materialId: id, name, formula, elements: toElements(formula),
        bandGap, formation, formationEnergy: formation, spaceGroup, pointGroup: "6/mmm", crystalSystem,
        type: bandType(bandGap), status: "稳定", latticeA: a, latticeB: b, latticeC: c,
        latticeAlpha: 90, latticeBeta: 90, latticeGamma: 120, layerThicknessNm: layerNm,
        layerThickness: layerNm ? Number((layerNm * 10).toFixed(3)) : null, interlayer, bondLength, bondAngle,
        density, density_g_cm3: density, volume, volume_ang3: volume, surfaceArea: a && b ? Number((a * b * 0.866).toFixed(3)) : null,
        absorptionCurve, reflectanceCurve, dosEnergy, dosValues, dielectricReal, dielectricImag, effectiveMass,
        hasFerroelectric: Number(ferroelectric || 0) > 0,
        absorptionCurve, reflectanceCurve, dosEnergy, dosValues, dielectricReal, dielectricImag, effectiveMass,
        hasFerroelectric: Number(ferroelectric || 0) > 0,
        source: EXCEL_SAMPLE_DATA_SOURCE, dataSource: EXCEL_SAMPLE_DATA_SOURCE, updatedAt: EXCEL_SAMPLE_DATE,
        quality: "样例数据", sampleImported: true, sampleSourceFile: EXCEL_SAMPLE_SOURCE,
        effectiveMass: name === "MoS2" ? 200 : null, mobility: name === "MoS2" ? 200 : null,
        ferroelectric, piezo, conductivity, magneticOrder, transitionTemp: magneticOrder === "非磁性" ? 0 : 45,
        magnetization: magneticOrder === "非磁性" ? 0 : 0.18, thermalConductivity: thermal,
        young, poisson, refractive, extinction, absorption, reflectance, dielectric,
        defectType, defectEnergy, defectConcentration: null, defectCharge: null,
        atomCoordinates: [
          { atom: toElements(formula)[0] || name, x: 0, y: 0, z: 0.5 },
          { atom: toElements(formula)[1] || "X", x: 0.3333, y: 0.6667, z: 0.585 },
          { atom: toElements(formula)[1] || "X", x: 0.6667, y: 0.3333, z: 0.415 }
        ],
        bandStructure: name === "MoS2" ? "直接带隙半导体，K 点附近带隙约 1.68 eV" : `${bandGap} eV ${bandType(bandGap) === "semiconductor" ? "半导体" : "材料"}`,
        densityOfStates: "态密度随能量分布，可按原子和轨道投影展示。",
        vacancyDefect: `${defectType || "空位缺陷"}，形成能 ${defectEnergy ?? "-"} eV`,
        antisiteDefect: "该材料暂无反位缺陷样例数据"
      };
    }

    function makeElectrolyte(row) {
      const [id, name, alias, formula, cas, category, subtype, safety, conductivity, homo, lumo, dipole, heatForm, gibbs, solvation, keywords] = row;
      const keywordList = String(keywords || "").split(/[，,]/).filter(Boolean);
      return {
        id, code: id, family: "electrolyte", electrolyteCategory: categoryKey(category), name, alias, formula, cas,
        elements: toElements(formula), keywords: [category, subtype, ...keywordList].filter(Boolean),
        typeTag: `${category}${subtype ? " / " + subtype : ""}`, safety, hazardLevel: safety, conductivity,
        conductivityLabel: conductivity == null ? "暂无数据" : `${conductivity} S/cm`,
        homo, lumo, dipole, heatForm, gibbs, solvation, source: EXCEL_SAMPLE_DATA_SOURCE,
        updatedAt: EXCEL_SAMPLE_DATE, quality: "样例数据", status: "可共享", sampleImported: true,
        infoFields: [
          { label: "分子式", value: formula }, { label: "CAS号", value: cas },
          { label: "材料类型", value: `${category} / ${subtype}` }, { label: "安全等级", value: safety }
        ],
        dataFields: [
          { label: "材料编号", value: id }, { label: "数据来源", value: EXCEL_SAMPLE_SOURCE },
          { label: "关键词", value: keywordList.join("、") || "暂无" }
        ],
        detailTabs: {
          basic: [
            { label: "电导率", value: conductivity == null ? "暂无数据" : `${conductivity} S/cm` },
            { label: "HOMO / LUMO", value: `${homo ?? "-"} / ${lumo ?? "-"} eV` },
            { label: "偶极矩", value: `${dipole ?? "-"} D` },
            { label: "溶剂化自由能", value: `${solvation ?? "-"} kJ/mol` }
          ],
          compute: [
            { label: "生成焓", value: `${heatForm ?? "-"} kJ/mol` },
            { label: "吉布斯自由能", value: `${gibbs ?? "-"} kJ/mol` }
          ]
        }
      };
    }

    function makeOpto(row) {
      const [id, name, fullName, formula, molecularWeight, homo, lumo, bandGap, application, emissionColor, category, peakAbsorption, peakEmission, quantumYield, lifetime, materialType] = row;
      return {
        id, code: id, name, fullName, formula, molecularWeight, homo, lumo, bandGap,
        application, applicationTone: category === "OLED" ? "blue" : category === "OPV" ? "purple" : "green",
        emissionColor, category, peakAbsorption, peakEmission, quantumYield, lifetime, materialType,
        source: EXCEL_SAMPLE_DATA_SOURCE, updatedAt: EXCEL_SAMPLE_DATE, quality: "样例数据",
        structureType: materialType, density: "样例数据未提供", externalLinks: [[EXCEL_SAMPLE_SOURCE, "样例数据导入"]]
      };
    }

    function makeMlff(row) {
      const [id, name, english, formula, pubchem, energy, dipole, forceField, method, parameterName, parameterValue, systemSize, systemType, downloadLink] = row;
      return {
        id, name, english, formula, pubchem, energy, dipole, forceField, method, parameterName, parameterValue,
        systemSize, systemType, downloadLink, quality: "样例数据", source: EXCEL_SAMPLE_DATA_SOURCE,
        updatedAt: EXCEL_SAMPLE_DATE, atoms: toElements(formula).join(", ") || "样例结构", bond: parameterValue,
        structureType: systemType, citation: `${EXCEL_SAMPLE_SOURCE}，${name} 力场样例数据`, sampleImported: true,
        chargeValues: [0, Number(dipole) || 0, Number(energy) || 0], energyCurve: [energy, energy, energy, energy].map((item, index) => Number(item || 0) + index * 0.1)
      };
    }

    function makeCatalyst(row) {
      const [id, name, subtitle, formula, route, category, composition, intermediate, activationEnergy, selectivity, tof, site, adsorptionEnergy, dBandCenter, performanceLevel] = row;
      return {
        id, name, subtitle, formula, reactionType: routeText(route), route: String(route || "").toLowerCase(), routeLabel: route,
        catalystCategory: category, composition, intermediate, activationEnergy, selectivity, tof, site,
        adsorptionEnergy, dBandCenter, chargeTransfer: null, surface: name.match(/\(([^)]+)\)/)?.[0] || "样例结构",
        structureFeature: category, systemFeature: subtitle, atomicStructure: `${composition} 活性位点结构`,
        electronicProperty: `d带中心 ${dBandCenter ?? "-"} eV`, condition: performanceLevel, performanceLevel,
        quality: "样例数据", dataSource: EXCEL_SAMPLE_DATA_SOURCE, updatedAt: EXCEL_SAMPLE_DATE,
        elements: toElements(composition || formula), keywords: [name, route, category, composition].filter(Boolean),
        compareTone: performanceLevel?.includes("high") ? "blue" : performanceLevel?.includes("medium") ? "green" : "purple",
        compareTag: "样例", volcanoX: adsorptionEnergy, volcanoY: tof, sampleImported: true
      };
    }

    function upsert(list, record) {
      if (!Array.isArray(list) || !record?.id) return;
      const index = list.findIndex((item) => item.id === record.id || item.code === record.id || item.trueMaterialId === record.id);
      if (index >= 0) list[index] = Object.assign({}, list[index], record);
      else list.push(record);
    }

    function mergeSampleData() {
      if (typeof twodMaterials !== "undefined") SAMPLE_ROWS.twod.map(makeTwod).forEach((item) => upsert(twodMaterials, item));
      if (typeof electrolyteMaterials !== "undefined") SAMPLE_ROWS.electrolyte.map(makeElectrolyte).forEach((item) => upsert(electrolyteMaterials, item));
      if (typeof optoMaterials !== "undefined") SAMPLE_ROWS.opto.map(makeOpto).forEach((item) => upsert(optoMaterials, item));
      if (typeof mlffMaterials !== "undefined") SAMPLE_ROWS.mlff.map(makeMlff).forEach((item) => upsert(mlffMaterials, item));
      if (typeof catalystMaterials !== "undefined") SAMPLE_ROWS.catalyst.map(makeCatalyst).forEach((item) => upsert(catalystMaterials, item));
      window.LOW_DIM_IMPORTED_SAMPLE_COUNTS = {
        twod: SAMPLE_ROWS.twod.length,
        electrolyte: SAMPLE_ROWS.electrolyte.length,
        opto: SAMPLE_ROWS.opto.length,
        mlff: SAMPLE_ROWS.mlff.length,
        catalyst: SAMPLE_ROWS.catalyst.length
      };
    }

    function refreshActivePage() {
      try {
        if (state?.page === "twod" && typeof refreshTwodResults === "function") refreshTwodResults();
        if (state?.page === "electrolyte" && typeof renderElectrolyteModule === "function") renderElectrolyteModule();
        if (state?.page === "opto" && typeof renderOptoModule === "function") renderOptoModule();
        if (state?.page === "mlff" && typeof renderMlffModule === "function") renderMlffModule();
        if (state?.page === "catalyst" && typeof renderCatalystModule === "function") renderCatalystModule();
      } catch (error) {
        console.warn("Excel sample data merged, active page refresh skipped.", error);
      }
    }

    mergeSampleData();
    setTimeout(refreshActivePage, 0);
  })();
  