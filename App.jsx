import { useState, useEffect, useRef, Fragment } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, deleteDoc, addDoc, serverTimestamp, deleteField } from "firebase/firestore";

// Expose db for admin import scripts
if (typeof window !== 'undefined') window.__app_db = db;


// ─── LIGA DATA (Excel Import) ───────────────────────────────────────────────
const LIGA_DATA={"AFC Bournemouth":[{"id":"xls_4100545682297730984","name":"Péter Gulácsi","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"HUNGRIA","age":36,"overall":84,"price":{"value":4.7,"unit":"M"},"poolKey":"name_peter_gulacsi"},{"id":"xls_5438217794482998973","name":"Lucas Digne","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"FRANCIA","age":32,"overall":80,"price":{"value":15.5,"unit":"M"},"poolKey":"name_lucas_digne"},{"id":"xls_2139980392539186309","name":"Nicolás Otamendi","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ARGENTINA","age":38,"overall":80,"price":{"value":3.8,"unit":"M"},"poolKey":"name_nicolas_otamendi"},{"id":"xls_2868895643189137399","name":"Alejandro Baena","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"ESPAÑA","age":24,"overall":82,"price":{"value":46.0,"unit":"M"},"poolKey":"name_alejandro_baena"},{"id":"xls_8690004078060988861","name":"Alejandro Jiménez","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"ESPAÑA","age":21,"overall":77,"price":{"value":20.0,"unit":"M"},"poolKey":"name_alejandro_jimenez"},{"id":"xls_1078004893777879072","name":"Jamie Gittens","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"INGLATERRA","age":21,"overall":78,"price":{"value":22.0,"unit":"M"},"poolKey":"name_jamie_gittens"},{"id":"xls_3382244321192909128","name":"Yves Bissouma","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"MALI","age":29,"overall":78,"price":{"value":12.5,"unit":"M"},"poolKey":"name_yves_bissouma"},{"id":"xls_6565929408993412159","name":"Robert Andrich","pos":"CB/CM/CDM","primaryPos":"CB","secondaryPos":"CM/CDM","country":"ALEMANIA","age":31,"overall":79,"price":{"value":14.5,"unit":"M"},"poolKey":"name_robert_andrich"},{"id":"xls_7552792216108141141","name":"Marco Asensio","pos":"CAM/RW/CM","primaryPos":"CAM","secondaryPos":"RW/CM","country":"ESPAÑA","age":30,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_marco_asensio"},{"id":"xls_4143035970401293724","name":"Serhou Guirassy","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"GUINEA","age":30,"overall":85,"price":{"value":54.0,"unit":"M"},"poolKey":"name_serhou_guirassy"},{"id":"xls_8398031149778493375","name":"Francesco Acerbi","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ITALIA","age":38,"overall":83,"price":{"value":6.5,"unit":"M"},"poolKey":"name_francesco_acerbi"},{"id":"xls_5990274503396841945","name":"Gabriel Arias","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"CHILE","age":38,"overall":74,"price":{"value":475.0,"unit":"K"},"poolKey":"name_gabriel_arias"},{"id":"xls_6570099674077389004","name":"Marcos Alonso","pos":"CB/LB/LM","primaryPos":"CB","secondaryPos":"LB/LM","country":"ESPAÑA","age":35,"overall":79,"price":{"value":5.5,"unit":"M"},"poolKey":"name_marcos_alonso"},{"id":"xls_7122782063894437765","name":"Hamari Traoré","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"MALI","age":34,"overall":77,"price":{"value":5.5,"unit":"M"},"poolKey":"name_hamari_traore"},{"id":"xls_2918768636822404302","name":"Toni Fruk","pos":"ST/CAM/CM","primaryPos":"ST","secondaryPos":"CAM/CM","country":"CROACIA","age":25,"overall":77,"price":null,"poolKey":"name_toni_fruk"},{"id":"xls_157463648567522657","name":"Diego Llorente","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":32,"overall":80,"price":{"value":14.5,"unit":"M"},"poolKey":"name_diego_llorente"},{"id":"xls_4721713428366206291","name":"Richarlison","pos":"ST/LW/LM","primaryPos":"ST","secondaryPos":"LW/LM","country":"BRASIL","age":29,"overall":79,"price":{"value":18.0,"unit":"M"},"poolKey":"name_richarlison"},{"id":"xls_414742302953994980","name":"Christoph Baumgartner","pos":"CAM/CM/ST","primaryPos":"CAM","secondaryPos":"CM/ST","country":"AUSTRIA","age":26,"overall":81,"price":{"value":32.5,"unit":"M"},"poolKey":"name_christoph_baumgartner"},{"id":"xls_2773103742111420601","name":"Dejan Kulusevski","pos":"CM/RW/CAM","primaryPos":"CM","secondaryPos":"RW/CAM","country":"SUECIA","age":26,"overall":83,"price":{"value":47.5,"unit":"M"},"poolKey":"name_dejan_kulusevski"},{"id":"xls_1238580551570705511","name":"Lewis Dunk","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":34,"overall":77,"price":{"value":5.0,"unit":"M"},"poolKey":"name_lewis_dunk"},{"id":"xls_8159118683385290500","name":"Brennan Johnson","pos":"RW/RM/LM","primaryPos":"RW","secondaryPos":"RM/LM","country":"INGLATERRA","age":24,"overall":79,"price":{"value":24.0,"unit":"M"},"poolKey":"name_brennan_johnson"},{"id":"xls_4091997031994582099","name":"Joaquin Seys","pos":"LB/RB/LM","primaryPos":"LB","secondaryPos":"RB/LM","country":"BELGICA","age":21,"overall":74,"price":{"value":9.5,"unit":"M"},"poolKey":"name_joaquin_seys"},{"id":"xls_3104051719052138221","name":"Lennon Miller","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"ESCOCIA","age":19,"overall":70,"price":{"value":3.7,"unit":"M"},"poolKey":"name_lennon_miller"},{"id":"xls_4395514384775869751","name":"Jean-Mattéo Bahoya","pos":"LM/CAM/LW","primaryPos":"LM","secondaryPos":"CAM/LW","country":"FRANCIA","age":21,"overall":75,"price":{"value":12.5,"unit":"M"},"poolKey":"name_jean-matteo_bahoya"},{"id":"xls_1659481466961186183","name":"Pablo Torre","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ESPAÑA","age":23,"overall":74,"price":{"value":9.5,"unit":"M"},"poolKey":"name_pablo_torre"},{"id":"xls_3215597343411547850","name":"Arsen Zakharyan","pos":"RM/CM/LM/RW","primaryPos":"RM","secondaryPos":"CM/LM/RW","country":"RUSIA","age":22,"overall":73,"price":{"value":7.0,"unit":"M"},"poolKey":"name_arsen_zakharyan"}],"Inter Miami FC":[{"id":"xls_1403279683994950991","name":"Marco Bizot","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"PAISES BAJOS","age":35,"overall":78,"price":{"value":2.4,"unit":"M"},"poolKey":"name_marco_bizot"},{"id":"xls_5262686811491389855","name":"Patrick Dorgu","pos":"LM/LB/RM/LW","primaryPos":"LM","secondaryPos":"LB/RM/LW","country":"DINAMARCA","age":21,"overall":77,"price":{"value":21.0,"unit":"M"},"poolKey":"name_patrick_dorgu"},{"id":"xls_2035628005376593034","name":"Harry Maguire","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":33,"overall":81,"price":{"value":16.5,"unit":"M"},"poolKey":"name_harry_maguire"},{"id":"xls_8729279547733038697","name":"Maximiliano Falcón","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"URUGUAY","age":29,"overall":69,"price":{"value":1.2,"unit":"M"},"poolKey":"name_maximiliano_falcon"},{"id":"xls_249501042698297765","name":"Milan van Ewijk","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"PAISES BAJOS","age":25,"overall":75,"price":{"value":8.0,"unit":"M"},"poolKey":"name_milan_van_ewijk"},{"id":"xls_4407040171288954966","name":"Gabriel Moscardo","pos":"CDM/CM/CB","primaryPos":"CDM","secondaryPos":"CM/CB","country":"BRASIL","age":20,"overall":72,"price":{"value":4.8,"unit":"M"},"poolKey":"name_gabriel_moscardo"},{"id":"xls_1861903642154836283","name":"Weston McKennie","pos":"CM/CAM/RM","primaryPos":"CM","secondaryPos":"CAM/RM","country":"USA","age":27,"overall":79,"price":{"value":19.0,"unit":"M"},"poolKey":"name_weston_mckennie"},{"id":"xls_109836462454623356","name":"Alejandro Grimaldo","pos":"LM/LB/LW","primaryPos":"LM","secondaryPos":"LB/LW","country":"ESPAÑA","age":30,"overall":85,"price":{"value":53.0,"unit":"M"},"poolKey":"name_alejandro_grimaldo"},{"id":"xls_5843098430863331531","name":"Bernardo Silva","pos":"CM/RW/CAM","primaryPos":"CM","secondaryPos":"RW/CAM","country":"PORTUGAL","age":31,"overall":83,"price":{"value":34.5,"unit":"M"},"poolKey":"name_bernardo_silva"},{"id":"xls_5022120548092292268","name":"Luis Suárez","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"URUGUAY","age":39,"overall":78,"price":{"value":4.8,"unit":"M"},"poolKey":"name_luis_suarez"},{"id":"xls_3699212146752510331","name":"Virgil van Dijk","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PAISES BAJOS","age":34,"overall":88,"price":{"value":43.5,"unit":"M"},"poolKey":"name_virgil_van_dijk"},{"id":"xls_5737166805438728777","name":"Aritz Elustondo","pos":"CB/RB/CDM","primaryPos":"CB","secondaryPos":"RB/CDM","country":"ESPAÑA","age":32,"overall":74,"price":{"value":2.9,"unit":"M"},"poolKey":"name_aritz_elustondo"},{"id":"xls_4708603832376304910","name":"Stefan Savić","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SERBIA","age":35,"overall":77,"price":{"value":3.4,"unit":"M"},"poolKey":"name_stefan_savić"},{"id":"xls_3335234080120848976","name":"Tadeo Allende","pos":"RM/LM/ST/RW","primaryPos":"RM","secondaryPos":"LM/ST/RW","country":"ARGENTINA","age":27,"overall":72,"price":{"value":2.6,"unit":"M"},"poolKey":"name_tadeo_allende"},{"id":"xls_1085406674465707589","name":"Merlin Röhl","pos":"CF/CM/CDM/ST","primaryPos":"CF","secondaryPos":"CM/CDM/ST","country":"ALEMANIA","age":23,"overall":74,"price":{"value":9.5,"unit":"M"},"poolKey":"name_merlin_röhl"},{"id":"xls_4123209453372282759","name":"Fermín López","pos":"CAM/CM/ST","primaryPos":"CAM","secondaryPos":"CM/ST","country":"ESPAÑA","age":23,"overall":83,"price":{"value":53.0,"unit":"M"},"poolKey":"name_fermin_lopez"},{"id":"xls_7233444792619776896","name":"Francesco Camarda","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ITALIA","age":18,"overall":65,"price":{"value":2.3,"unit":"M"},"poolKey":"name_francesco_camarda"},{"id":"xls_1398284315805032957","name":"Christian Pulisic","pos":"RW/RM/ST","primaryPos":"RW","secondaryPos":"RM/ST","country":"USA","age":27,"overall":85,"price":{"value":59.0,"unit":"M"},"poolKey":"name_christian_pulisic"},{"id":"xls_1528332994570966625","name":"Tobías Ramírez","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ARGENTINA","age":19,"overall":68,"price":{"value":2.6,"unit":"M"},"poolKey":"name_tobias_ramirez"},{"id":"xls_8768305229927508429","name":"Ryan Hollingshead","pos":"LB/RB/CM","primaryPos":"LB","secondaryPos":"RB/CM","country":"USA","age":35,"overall":72,"price":{"value":850.0,"unit":"K"},"poolKey":"name_ryan_hollingshead"},{"id":"xls_2246342416308149706","name":"Gerard Martín","pos":"LB/CB/LM","primaryPos":"LB","secondaryPos":"CB/LM","country":"ESPAÑA","age":24,"overall":77,"price":{"value":15.0,"unit":"M"},"poolKey":"name_gerard_martin"},{"id":"xls_6506554860388784357","name":"Tyrell Malacia","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"PAISES BAJOS","age":26,"overall":75,"price":{"value":6.0,"unit":"M"},"poolKey":"name_tyrell_malacia"},{"id":"xls_7501139197180169031","name":"Mateo Silvetti","pos":"RM/LM/ST/RW","primaryPos":"RM","secondaryPos":"LM/ST/RW","country":"ARGENTINA","age":20,"overall":63,"price":{"value":1.2,"unit":"M"},"poolKey":"name_mateo_silvetti"},{"id":"xls_5825257732685384801","name":"Berkay Özcan","pos":"CM/CAM/CDM/ST","primaryPos":"CM","secondaryPos":"CAM/CDM/ST","country":"TURQUIA","age":28,"overall":67,"price":{"value":1.1,"unit":"M"},"poolKey":"name_berkay_özcan"},{"id":"xls_3405267799069009756","name":"Oleksandr Nazarenko","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"UCRANIA","age":26,"overall":72,"price":null,"poolKey":"name_oleksandr_nazarenko"},{"id":"xls_5422112711709338460","name":"Jeremía Recoba","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"URUGUAY","age":22,"overall":70,"price":{"value":3.6,"unit":"M"},"poolKey":"name_jeremia_recoba"}],"Malaga CF":[{"id":"xls_1454148482461998335","name":"Kasper Schmeichel","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"DINAMARCA","age":39,"overall":77,"price":{"value":1.2,"unit":"M"},"poolKey":"name_kasper_schmeichel"},{"id":"xls_4767808666357506182","name":"Dean Huijsen","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":21,"overall":81,"price":{"value":47.5,"unit":"M"},"poolKey":"name_dean_huijsen"},{"id":"xls_286616560828848591","name":"Mika Mármol","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"ESPAÑA","age":24,"overall":74,"price":{"value":8.0,"unit":"M"},"poolKey":"name_mika_marmol"},{"id":"xls_3245454371910410316","name":"Igor Zubeldia","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":29,"overall":77,"price":{"value":10.5,"unit":"M"},"poolKey":"name_igor_zubeldia"},{"id":"xls_2508135776479214929","name":"Brahim Díaz","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"MARRUECOS","age":25,"overall":81,"price":{"value":31.0,"unit":"M"},"poolKey":"name_brahim_diaz"},{"id":"xls_5305499988806359301","name":"Estêvão","pos":"RM/CAM/RW","primaryPos":"RM","secondaryPos":"CAM/RW","country":"BRASIL","age":19,"overall":79,"price":{"value":37.0,"unit":"M"},"poolKey":"name_estêvão"},{"id":"xls_7848902468989952665","name":"Ferland Mendy","pos":"LWB/LM","primaryPos":"LWB","secondaryPos":"LM","country":"FRANCIA","age":30,"overall":81,"price":{"value":22.0,"unit":"M"},"poolKey":"name_ferland_mendy"},{"id":"xls_4205170550759968774","name":"Fred","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"BRASIL","age":33,"overall":78,"price":{"value":11.0,"unit":"M"},"poolKey":"name_fred"},{"id":"xls_3533141254682090366","name":"Adama Traoré","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"ESPAÑA","age":30,"overall":75,"price":{"value":5.5,"unit":"M"},"poolKey":"name_adama_traore"},{"id":"xls_6570531529076830715","name":"Sadio Mané","pos":"LM/RM/ST/LW","primaryPos":"LM","secondaryPos":"RM/ST/LW","country":"SENEGAL","age":34,"overall":83,"price":{"value":22.5,"unit":"M"},"poolKey":"name_sadio_mane"},{"id":"xls_5622445610371000933","name":"Anderson Talisca","pos":"CAM/ST/CM","primaryPos":"CAM","secondaryPos":"ST/CM","country":"BRASIL","age":32,"overall":81,"price":{"value":21.5,"unit":"M"},"poolKey":"name_anderson_talisca"},{"id":"xls_4776900370464125593","name":"Vanja Milinković-Savić","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"SERBIA","age":29,"overall":79,"price":{"value":15.0,"unit":"M"},"poolKey":"name_vanja_milinković-savić"},{"id":"xls_463140514113971035","name":"Eduardo Quaresma","pos":"CB/RB","primaryPos":"CB","secondaryPos":"RB","country":"PORTUGAL","age":24,"overall":77,"price":{"value":19.5,"unit":"M"},"poolKey":"name_eduardo_quaresma"},{"id":"xls_8049257483901875166","name":"Sergiño Dest","pos":"RB/LB/RM","primaryPos":"RB","secondaryPos":"LB/RM","country":"PAISES BAJOS","age":25,"overall":79,"price":{"value":23.5,"unit":"M"},"poolKey":"name_sergino_dest"},{"id":"xls_947233348050928055","name":"Lucas Bergvall","pos":"CM/CAM/RM","primaryPos":"CM","secondaryPos":"CAM/RM","country":"SUECIA","age":20,"overall":78,"price":{"value":30.0,"unit":"M"},"poolKey":"name_lucas_bergvall"},{"id":"xls_6780596232097586960","name":"Erik Lira","pos":"CDM/CM/CB","primaryPos":"CDM","secondaryPos":"CM/CB","country":"MEXICO","age":25,"overall":75,"price":null,"poolKey":"name_erik_lira"},{"id":"xls_6259907212116854858","name":"José Luis Morales","pos":"ST/LM/LW","primaryPos":"ST","secondaryPos":"LM/LW","country":"ESPAÑA","age":38,"overall":73,"price":{"value":1.0,"unit":"M"},"poolKey":"name_jose_luis_morales"},{"id":"xls_1767509684999351019","name":"Mohammed Kudus","pos":"RW/RM/ST","primaryPos":"RW","secondaryPos":"RM/ST","country":"GHANA","age":25,"overall":81,"price":{"value":33.5,"unit":"M"},"poolKey":"name_mohammed_kudus"},{"id":"xls_6997101150648227570","name":"Iván Fresneda","pos":"RB/RM/LB","primaryPos":"RB","secondaryPos":"RM/LB","country":"ESPAÑA","age":21,"overall":75,"price":{"value":12.0,"unit":"M"},"poolKey":"name_ivan_fresneda"},{"id":"xls_9001048309544696728","name":"Jobe Bellingham","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"INGLATERRA","age":20,"overall":77,"price":{"value":16.0,"unit":"M"},"poolKey":"name_jobe_bellingham"},{"id":"xls_1461301013712739172","name":"Franck Yannick Kessié","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"COSTA DE MARFIL","age":29,"overall":79,"price":{"value":15.5,"unit":"M"},"poolKey":"name_franck_yannick_kessie"},{"id":"xls_8699871982874804282","name":"Arda Güler","pos":"RM/CAM/CM/RW","primaryPos":"RM","secondaryPos":"CAM/CM/RW","country":"TURQUIA","age":21,"overall":83,"price":{"value":56.5,"unit":"M"},"poolKey":"name_arda_güler"},{"id":"xls_1840784467992302728","name":"Renato Sanches","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"PORTUGAL","age":28,"overall":75,"price":{"value":6.0,"unit":"M"},"poolKey":"name_renato_sanches"},{"id":"xls_7611428522838224603","name":"Cesinha","pos":"ST/LW/CM/CAM","primaryPos":"ST","secondaryPos":"LW/CM/CAM","country":"BRASIL","age":36,"overall":75,"price":{"value":2.4,"unit":"M"},"poolKey":"name_cesinha"},{"id":"xls_2712227533636974833","name":"Riyad Mahrez","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"ARGELIA","age":35,"overall":84,"price":{"value":20.0,"unit":"M"},"poolKey":"name_riyad_mahrez"},{"id":"xls_5631610974189777263","name":"Endrick","pos":"ST/RW/RM","primaryPos":"ST","secondaryPos":"RW/RM","country":"BRASIL","age":19,"overall":78,"price":{"value":30.0,"unit":"M"},"poolKey":"name_endrick"}],"SV Werder Bremen":[{"id":"xls_5445269384797529530","name":"Dominik Livaković","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"CROACIA","age":31,"overall":78,"price":{"value":9.5,"unit":"M"},"poolKey":"name_dominik_livaković"},{"id":"xls_8620834303241619228","name":"Maxim De Cuyper","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"BELGICA","age":25,"overall":79,"price":{"value":23.5,"unit":"M"},"poolKey":"name_maxim_de_cuyper"},{"id":"xls_7194032758215652728","name":"Niklas Süle","pos":"CB/RB","primaryPos":"CB","secondaryPos":"RB","country":"ALEMANIA","age":30,"overall":78,"price":{"value":12.0,"unit":"M"},"poolKey":"name_niklas_süle"},{"id":"xls_4461839272436285202","name":"Oumar Solet","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"FRANCIA","age":26,"overall":78,"price":{"value":18.5,"unit":"M"},"poolKey":"name_oumar_solet"},{"id":"xls_6449107021656145547","name":"Przemysław Frankowski","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"POLONIA","age":31,"overall":76,"price":{"value":6.5,"unit":"M"},"poolKey":"name_przemysław_frankowski"},{"id":"xls_3945785415523597316","name":"Raíllo","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":34,"overall":79,"price":{"value":8.5,"unit":"M"},"poolKey":"name_raillo"},{"id":"xls_2971500939762322409","name":"Douglas Luiz","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"BRASIL","age":28,"overall":79,"price":{"value":16.5,"unit":"M"},"poolKey":"name_douglas_luiz"},{"id":"xls_6680472215028250811","name":"Jadon Sancho","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"INGLATERRA","age":26,"overall":79,"price":{"value":21.0,"unit":"M"},"poolKey":"name_jadon_sancho"},{"id":"xls_2886159394090193263","name":"Rocco Reitz","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ALEMANIA","age":23,"overall":77,"price":{"value":16.5,"unit":"M"},"poolKey":"name_rocco_reitz"},{"id":"xls_6582077254849587191","name":"Antony","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"BRASIL","age":26,"overall":81,"price":{"value":31.0,"unit":"M"},"poolKey":"name_antony"},{"id":"xls_8378596718443187963","name":"Santiago Giménez","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"MEXICO","age":25,"overall":79,"price":{"value":27.0,"unit":"M"},"poolKey":"name_santiago_gimenez"},{"id":"xls_171513157919011404","name":"Édouard Mendy","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"SENEGAL","age":34,"overall":81,"price":{"value":8.5,"unit":"M"},"poolKey":"name_edouard_mendy"},{"id":"xls_807168189275584532","name":"Pedro Henrique","pos":"LB/LM/RB","primaryPos":"LB","secondaryPos":"LM/RB","country":"BRASIL","age":23,"overall":72,"price":{"value":5.0,"unit":"M"},"poolKey":"name_pedro_henrique"},{"id":"xls_78264231715153974","name":"Kerem Aktürkoğlu","pos":"LW/LM","primaryPos":"LW","secondaryPos":"LM","country":"TURQUIA","age":27,"overall":79,"price":{"value":19.0,"unit":"M"},"poolKey":"name_kerem_aktürkoğlu"},{"id":"xls_3597225767022241458","name":"Igor Jesus","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"BRASIL","age":25,"overall":77,"price":{"value":15.5,"unit":"M"},"poolKey":"name_igor_jesus"},{"id":"xls_3151648156044616294","name":"Marco Reus","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ALEMANIA","age":36,"overall":78,"price":{"value":4.6,"unit":"M"},"poolKey":"name_marco_reus"},{"id":"xls_8870230473960486072","name":"Denis Bouanga","pos":"LW/ST/LM","primaryPos":"LW","secondaryPos":"ST/LM","country":"GABON","age":31,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_denis_bouanga"},{"id":"xls_1706363474040432864","name":"Yannick Carrasco","pos":"LW/LM","primaryPos":"LW","secondaryPos":"LM","country":"BELGICA","age":32,"overall":81,"price":{"value":21.5,"unit":"M"},"poolKey":"name_yannick_carrasco"},{"id":"xls_3687349822753847305","name":"Khéphren Thuram","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"FRANCIA","age":25,"overall":81,"price":{"value":36.5,"unit":"M"},"poolKey":"name_khephren_thuram"},{"id":"xls_7100214606509499135","name":"Timo Becker","pos":"CB/RB/RM","primaryPos":"CB","secondaryPos":"RB/RM","country":"ALEMANIA","age":29,"overall":71,"price":{"value":1.6,"unit":"M"},"poolKey":"name_timo_becker"},{"id":"xls_8974435389333898776","name":"Danilo Pereira","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PORTUGAL","age":34,"overall":81,"price":{"value":12.5,"unit":"M"},"poolKey":"name_danilo_pereira"},{"id":"xls_473218683372548648","name":"Andreas Christensen","pos":"CB/CM/CDM","primaryPos":"CB","secondaryPos":"CM/CDM","country":"DINAMARCA","age":30,"overall":80,"price":{"value":17.5,"unit":"M"},"poolKey":"name_andreas_christensen"},{"id":"xls_2304118423181844839","name":"Luca Netz","pos":"LB/LM/LW","primaryPos":"LB","secondaryPos":"LM/LW","country":"ALEMANIA","age":22,"overall":73,"price":{"value":4.1,"unit":"M"},"poolKey":"name_luca_netz"},{"id":"xls_3701131251616872215","name":"Isco","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ESPAÑA","age":34,"overall":84,"price":{"value":26.5,"unit":"M"},"poolKey":"name_isco"},{"id":"xls_8555001398862612388","name":"Saïd El Mala","pos":"LM/CAM/ST/LW","primaryPos":"LM","secondaryPos":"CAM/ST/LW","country":"ALEMANIA","age":19,"overall":76,"price":{"value":16.0,"unit":"M"},"poolKey":"name_saïd_el_mala"},{"id":"xls_86846283920838096","name":"Aljoscha Kemlein","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ALEMANIA","age":21,"overall":74,"price":{"value":6.0,"unit":"M"},"poolKey":"name_aljoscha_kemlein"}],"Seattle Sounders FC":[{"id":"xls_6715192509277304793","name":"Kevin Trapp","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ALEMANIA","age":35,"overall":79,"price":{"value":3.0,"unit":"M"},"poolKey":"name_kevin_trapp"},{"id":"xls_6019318556295095883","name":"Antonee Robinson","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"USA","age":28,"overall":81,"price":{"value":25.0,"unit":"M"},"poolKey":"name_antonee_robinson"},{"id":"xls_4561689894309628090","name":"João Félix","pos":"CAM/ST/LM","primaryPos":"CAM","secondaryPos":"ST/LM","country":"PORTUGAL","age":26,"overall":81,"price":{"value":34.0,"unit":"M"},"poolKey":"name_joão_felix"},{"id":"xls_1261572394401756559","name":"Chris Richards","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"USA","age":26,"overall":79,"price":{"value":19.5,"unit":"M"},"poolKey":"name_chris_richards"},{"id":"xls_4816753621248081796","name":"Guido Rodríguez","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ARGENTINA","age":32,"overall":76,"price":{"value":5.0,"unit":"M"},"poolKey":"name_guido_rodriguez"},{"id":"xls_9003768757574694181","name":"Martín Zubimendi","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ESPAÑA","age":27,"overall":85,"price":{"value":60.0,"unit":"M"},"poolKey":"name_martin_zubimendi"},{"id":"xls_7776440027922372691","name":"Artem Dovbyk","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"UCRANIA","age":28,"overall":81,"price":{"value":26.5,"unit":"M"},"poolKey":"name_artem_dovbyk"},{"id":"xls_6537711803586641200","name":"Pedro De la Vega","pos":"RM/RW/LW","primaryPos":"RM","secondaryPos":"RW/LW","country":"ARGENTINA","age":25,"overall":73,"price":{"value":4.2,"unit":"M"},"poolKey":"name_pedro_de_la_vega"},{"id":"xls_8048705956341909386","name":"Alexandru Mitriță","pos":"CAM/LW/LM/CM","primaryPos":"CAM","secondaryPos":"LW/LM/CM","country":"RUMANIA","age":31,"overall":75,"price":{"value":5.5,"unit":"M"},"poolKey":"name_alexandru_mitriță"},{"id":"xls_8125261741855350383","name":"Matheus Cunha","pos":"CAM/LW/ST","primaryPos":"CAM","secondaryPos":"LW/ST","country":"BRASIL","age":26,"overall":83,"price":{"value":45.0,"unit":"M"},"poolKey":"name_matheus_cunha"},{"id":"xls_3260652407468193056","name":"Mario Hermoso","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":30,"overall":79,"price":{"value":14.5,"unit":"M"},"poolKey":"name_mario_hermoso"},{"id":"xls_1562273194907008000","name":"Marko Dmitrović","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"SERBIA","age":34,"overall":79,"price":{"value":5.5,"unit":"M"},"poolKey":"name_marko_dmitrović"},{"id":"xls_376191614583654878","name":"Josep María Chavarría","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ESPAÑA","age":28,"overall":78,"price":{"value":13.5,"unit":"M"},"poolKey":"name_josep_maria_chavarria"},{"id":"xls_4946955823835119287","name":"Julian Ryerson","pos":"RB/LB/RM","primaryPos":"RB","secondaryPos":"LB/RM","country":"NORUEGA","age":28,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_julian_ryerson"},{"id":"xls_4384599291853033138","name":"Nicolas Höfler","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ALEMANIA","age":36,"overall":71,"price":{"value":525.0,"unit":"K"},"poolKey":"name_nicolas_höfler"},{"id":"xls_7431868412803554630","name":"Donyell Malen","pos":"RM/RW/LM","primaryPos":"RM","secondaryPos":"RW/LM","country":"PAISES BAJOS","age":27,"overall":80,"price":{"value":23.5,"unit":"M"},"poolKey":"name_donyell_malen"},{"id":"xls_2913760501364220741","name":"Ricky van Wolfswinkel","pos":"ST/RM/RW","primaryPos":"ST","secondaryPos":"RM/RW","country":"PAISES BAJOS","age":37,"overall":71,"price":{"value":650.0,"unit":"K"},"poolKey":"name_ricky_van_wolfswinkel"},{"id":"xls_3775201417424615121","name":"Salem Al Dawsari","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"ARABIA SAUDITA","age":34,"overall":82,"price":{"value":19.0,"unit":"M"},"poolKey":"name_salem_al_dawsari"},{"id":"xls_6370604015833339913","name":"Mohand Mohamedi","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"MARRUECOS","age":36,"overall":72,"price":null,"poolKey":"name_mohand_mohamedi"},{"id":"xls_913734118685113615","name":"Benedict Hollerbach","pos":"ST/CAM/LM","primaryPos":"ST","secondaryPos":"CAM/LM","country":"ALEMANIA","age":24,"overall":75,"price":{"value":8.0,"unit":"M"},"poolKey":"name_benedict_hollerbach"},{"id":"xls_7352936191672591718","name":"Ezequiel Cerutti","pos":"RM/LW/RW","primaryPos":"RM","secondaryPos":"LW/RW","country":"ARGENTINA","age":34,"overall":69,"price":{"value":875.0,"unit":"K"},"poolKey":"name_ezequiel_cerutti"},{"id":"xls_3551500593449360336","name":"Augusto Solari","pos":"RM/RB/RW","primaryPos":"RM","secondaryPos":"RB/RW","country":"ARGENTINA","age":34,"overall":68,"price":{"value":750.0,"unit":"K"},"poolKey":"name_augusto_solari"},{"id":"xls_1286569861034758060","name":"Lucas Castro","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ARGENTINA","age":37,"overall":69,"price":{"value":450.0,"unit":"K"},"poolKey":"name_lucas_castro"},{"id":"xls_7513157137873360457","name":"Amahl Pellegrino","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"NORUEGA","age":35,"overall":71,"price":{"value":775.0,"unit":"K"},"poolKey":"name_amahl_pellegrino"},{"id":"xls_7087650697032028940","name":"Findlay Curtis","pos":"LW/RW/LM","primaryPos":"LW","secondaryPos":"RW/LM","country":"ESCOCIA","age":19,"overall":66,"price":{"value":2.2,"unit":"M"},"poolKey":"name_findlay_curtis"},{"id":"xls_493789111660749542","name":"Lennart Karl","pos":"CAM/RM/ST","primaryPos":"CAM","secondaryPos":"RM/ST","country":"ALEMANIA","age":18,"overall":75,"price":{"value":13.0,"unit":"M"},"poolKey":"name_lennart_karl"}],"AFC Ajax":[{"id":"xls_1306486977518257775","name":"Bart Verbruggen","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"PAISES BAJOS","age":23,"overall":80,"price":{"value":27.5,"unit":"M"},"poolKey":"name_bart_verbruggen"},{"id":"xls_3990216087432680693","name":"Rico Lewis","pos":"RB/LB/CM","primaryPos":"RB","secondaryPos":"LB/CM","country":"INGLATERRA","age":21,"overall":77,"price":{"value":20.0,"unit":"M"},"poolKey":"name_rico_lewis"},{"id":"xls_3550772520053003614","name":"Jan Paul van Hecke","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PAISES BAJOS","age":25,"overall":80,"price":{"value":25.0,"unit":"M"},"poolKey":"name_jan_paul_van_hecke"},{"id":"xls_3253261117771333699","name":"Marc Guéhi","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":25,"overall":84,"price":{"value":48.5,"unit":"M"},"poolKey":"name_marc_guehi"},{"id":"xls_742981256192341295","name":"Jurriën Timber","pos":"RB/LB/CB/RM","primaryPos":"RB","secondaryPos":"LB/CB/RM","country":"PAISES BAJOS","age":24,"overall":84,"price":{"value":53.5,"unit":"M"},"poolKey":"name_jurriën_timber"},{"id":"xls_7355584408508522411","name":"Marten de Roon","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"PAISES BAJOS","age":35,"overall":81,"price":{"value":12.0,"unit":"M"},"poolKey":"name_marten_de_roon"},{"id":"xls_5777748844568949644","name":"Cristian Romero","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ARGENTINA","age":28,"overall":82,"price":{"value":32.5,"unit":"M"},"poolKey":"name_cristian_romero"},{"id":"xls_5638294240525555519","name":"Mikel Merino","pos":"CM/ST/CDM","primaryPos":"CM","secondaryPos":"ST/CDM","country":"ESPAÑA","age":29,"overall":83,"price":{"value":35.5,"unit":"M"},"poolKey":"name_mikel_merino"},{"id":"xls_5789197339387119573","name":"Wilfried Gnonto","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"ITALIA","age":22,"overall":74,"price":{"value":8.5,"unit":"M"},"poolKey":"name_wilfried_gnonto"},{"id":"xls_2756247325155757340","name":"Johan Bakayoko","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"BELGICA","age":23,"overall":77,"price":{"value":21.5,"unit":"M"},"poolKey":"name_johan_bakayoko"},{"id":"xls_925604258019711742","name":"Julian Brandt","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ALEMANIA","age":30,"overall":82,"price":{"value":30.0,"unit":"M"},"poolKey":"name_julian_brandt"},{"id":"xls_4524050660880646243","name":"Mike Penders","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"BELGICA","age":20,"overall":77,"price":{"value":19.5,"unit":"M"},"poolKey":"name_mike_penders"},{"id":"xls_231960446902622561","name":"Ian Maatsen","pos":"RB/LM","primaryPos":"RB","secondaryPos":"LM","country":"PAISES BAJOS","age":24,"overall":79,"price":{"value":24.5,"unit":"M"},"poolKey":"name_ian_maatsen"},{"id":"xls_665885159775105357","name":"Archie Gray","pos":"CDM/CB/RB/CM","primaryPos":"CDM","secondaryPos":"CB/RB/CM","country":"INGLATERRA","age":20,"overall":77,"price":{"value":21.5,"unit":"M"},"poolKey":"name_archie_gray"},{"id":"xls_1064540021834785047","name":"Osame Sahraoui","pos":"LM/CAM/LW","primaryPos":"LM","secondaryPos":"CAM/LW","country":"MARRUECOS","age":24,"overall":76,"price":{"value":11.0,"unit":"M"},"poolKey":"name_osame_sahraoui"},{"id":"xls_2351003957911823982","name":"Xavi Simons","pos":"CAM/LM/ST","primaryPos":"CAM","secondaryPos":"LM/ST","country":"PAISES BAJOS","age":23,"overall":82,"price":{"value":42.5,"unit":"M"},"poolKey":"name_xavi_simons"},{"id":"xls_1476547535457355822","name":"Morgan Rogers","pos":"CAM/RM/LM/CM","primaryPos":"CAM","secondaryPos":"RM/LM/CM","country":"INGLATERRA","age":23,"overall":84,"price":{"value":56.0,"unit":"M"},"poolKey":"name_morgan_rogers"},{"id":"xls_8039694825496023970","name":"Brian Brobbey","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"PAISES BAJOS","age":24,"overall":77,"price":{"value":17.0,"unit":"M"},"poolKey":"name_brian_brobbey"},{"id":"xls_6786809928407632947","name":"Marcus Thuram","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"FRANCIA","age":28,"overall":85,"price":{"value":58.5,"unit":"M"},"poolKey":"name_marcus_thuram"},{"id":"xls_3897356304768730848","name":"Héctor Fort","pos":"RB/LB/CM","primaryPos":"RB","secondaryPos":"LB/CM","country":"ESPAÑA","age":19,"overall":71,"price":{"value":4.2,"unit":"M"},"poolKey":"name_hector_fort"},{"id":"xls_7281284341145377954","name":"Joaquín Panichelli","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ARGENTINA","age":23,"overall":77,"price":{"value":24.0,"unit":"M"},"poolKey":"name_joaquin_panichelli"},{"id":"xls_5889681862996110260","name":"Lamare Bogarde","pos":"CDM/CM/RB","primaryPos":"CDM","secondaryPos":"CM/RB","country":"PAISES BAJOS","age":22,"overall":74,"price":{"value":8.0,"unit":"M"},"poolKey":"name_lamare_bogarde"},{"id":"xls_8582216637370122209","name":"Jhon Solís","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"COLOMBIA","age":21,"overall":71,"price":{"value":3.9,"unit":"M"},"poolKey":"name_jhon_solis"},{"id":"xls_8572454902859784560","name":"Josh King","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"INGLATERRA","age":19,"overall":74,"price":{"value":9.0,"unit":"M"},"poolKey":"name_josh_king"},{"id":"xls_8290031747539742781","name":"Jan Virgili Tenas","pos":"LW/LM/RM","primaryPos":"LW","secondaryPos":"LM/RM","country":"ESPAÑA","age":19,"overall":75,"price":{"value":12.0,"unit":"M"},"poolKey":"name_jan_virgili_tenas"},{"id":"xls_3677176137670757426","name":"Juan Fernando Quintero","pos":"CAM/RW/CM","primaryPos":"CAM","secondaryPos":"RW/CM","country":"COLOMBIA","age":33,"overall":76,"price":{"value":6.0,"unit":"M"},"poolKey":"name_juan_fernando_quintero"}],"Real Sociedad de Fútbol":[{"id":"xls_6884371616001441297","name":"Manuel Neuer","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ALEMANIA","age":40,"overall":82,"price":{"value":3.4,"unit":"M"},"poolKey":"name_manuel_neuer"},{"id":"xls_8227085981495750665","name":"Alphonso Davies","pos":"LB/RM","primaryPos":"LB","secondaryPos":"RM","country":"CANADA","age":25,"overall":83,"price":{"value":46.0,"unit":"M"},"poolKey":"name_alphonso_davies"},{"id":"xls_8014794354997798284","name":"Pau Cubarsí","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":19,"overall":83,"price":{"value":48.0,"unit":"M"},"poolKey":"name_pau_cubarsi"},{"id":"xls_1067012968439186533","name":"Kim Min Jae","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"KOREA DEL SUR","age":29,"overall":82,"price":{"value":26.5,"unit":"M"},"poolKey":"name_kim_min_jae"},{"id":"xls_5605952363139644081","name":"Marcos Llorente","pos":"RB/CM/RM","primaryPos":"RB","secondaryPos":"CM/RM","country":"ESPAÑA","age":31,"overall":85,"price":{"value":46.5,"unit":"M"},"poolKey":"name_marcos_llorente"},{"id":"xls_5720255555522938563","name":"Pablo Maffeo","pos":"RB/RM/RW","primaryPos":"RB","secondaryPos":"RM/RW","country":"ESPAÑA","age":28,"overall":78,"price":{"value":13.5,"unit":"M"},"poolKey":"name_pablo_maffeo"},{"id":"xls_1588138615656183938","name":"Konrad Laimer","pos":"RB/CDM/LB/RM","primaryPos":"RB","secondaryPos":"CDM/LB/RM","country":"AUSTRIA","age":28,"overall":84,"price":{"value":38.0,"unit":"M"},"poolKey":"name_konrad_laimer"},{"id":"xls_391851378266406958","name":"Matias Fernandez-Pardo","pos":"LM/RM/ST/LW","primaryPos":"LM","secondaryPos":"RM/ST/LW","country":"ESPAÑA","age":21,"overall":76,"price":{"value":16.5,"unit":"M"},"poolKey":"name_matias_fernandez-pardo"},{"id":"xls_5301203327830647276","name":"Fabián Ruiz","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ESPAÑA","age":30,"overall":85,"price":{"value":52.5,"unit":"M"},"poolKey":"name_fabian_ruiz"},{"id":"xls_2235656122807686684","name":"Dani Olmo","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ESPAÑA","age":28,"overall":84,"price":{"value":45.0,"unit":"M"},"poolKey":"name_dani_olmo"},{"id":"xls_2433271498795249177","name":"Loïs Openda","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"BELGICA","age":26,"overall":82,"price":{"value":38.5,"unit":"M"},"poolKey":"name_loïs_openda"},{"id":"xls_875272232009215141","name":"Aitor Fernández","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ESPAÑA","age":35,"overall":77,"price":{"value":1.8,"unit":"M"},"poolKey":"name_aitor_fernandez"},{"id":"xls_4696884324152217378","name":"Aleksandar Pavlović","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ALEMANIA","age":22,"overall":82,"price":{"value":43.0,"unit":"M"},"poolKey":"name_aleksandar_pavlović"},{"id":"xls_5070184181490624532","name":"Yuri Berchiche","pos":"LB/RM","primaryPos":"LB","secondaryPos":"RM","country":"ESPAÑA","age":36,"overall":79,"price":{"value":5.5,"unit":"M"},"poolKey":"name_yuri_berchiche"},{"id":"xls_1824099000557158165","name":"Georginio Wijnaldum","pos":"CAM/ST/CM","primaryPos":"CAM","secondaryPos":"ST/CM","country":"PAISES BAJOS","age":35,"overall":79,"price":{"value":8.0,"unit":"M"},"poolKey":"name_georginio_wijnaldum"},{"id":"xls_6250738398323915725","name":"Jorge de Frutos Sebastián","pos":"RM/ST/RW","primaryPos":"RM","secondaryPos":"ST/RW","country":"ESPAÑA","age":29,"overall":81,"price":{"value":26.0,"unit":"M"},"poolKey":"name_jorge_de_frutos_sebastian"},{"id":"xls_9106620449956056394","name":"Sebastián Driussi","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"ARGENTINA","age":30,"overall":75,"price":{"value":5.5,"unit":"M"},"poolKey":"name_sebastian_driussi"},{"id":"xls_3981888112731656411","name":"Karim Adeyemi","pos":"RM/LW/CAM/RW","primaryPos":"RM","secondaryPos":"LW/CAM/RW","country":"ALEMANIA","age":24,"overall":82,"price":{"value":43.5,"unit":"M"},"poolKey":"name_karim_adeyemi"},{"id":"xls_2704049337776757860","name":"Jeremiah St. Juste","pos":"CB/RB/CDM","primaryPos":"CB","secondaryPos":"RB/CDM","country":"PAISES BAJOS","age":29,"overall":75,"price":{"value":4.8,"unit":"M"},"poolKey":"name_jeremiah_st._juste"},{"id":"xls_731593812648313282","name":"Angelo Stiller","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ALEMANIA","age":25,"overall":83,"price":{"value":47.5,"unit":"M"},"poolKey":"name_angelo_stiller"},{"id":"xls_7097743123510731030","name":"Morten Hjulmand","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"DINAMARCA","age":26,"overall":83,"price":{"value":43.0,"unit":"M"},"poolKey":"name_morten_hjulmand"},{"id":"xls_1658088084995065574","name":"Rio Ngumoha","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"INGLATERRA","age":17,"overall":72,"price":{"value":6.0,"unit":"M"},"poolKey":"name_rio_ngumoha"},{"id":"xls_3201195306283274638","name":"Ezri Konsa","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":28,"overall":84,"price":{"value":42.5,"unit":"M"},"poolKey":"name_ezri_konsa"},{"id":"xls_7107835225126996171","name":"Jorge Sánchez","pos":"RB","primaryPos":"RB","secondaryPos":null,"country":"MEXICO","age":28,"overall":73,"price":{"value":2.9,"unit":"M"},"poolKey":"name_jorge_sanchez"},{"id":"xls_9024877644138034796","name":"Bryan Mbeumo","pos":"RW/RM/ST","primaryPos":"RW","secondaryPos":"RM/ST","country":"CAMERÚN","age":26,"overall":85,"price":{"value":64.5,"unit":"M"},"poolKey":"name_bryan_mbeumo"},{"id":"xls_5646510035505048775","name":"Fashion Sakala","pos":"LM/LW/ST","primaryPos":"LM","secondaryPos":"LW/ST","country":"ZAMBIA","age":29,"overall":75,"price":{"value":5.5,"unit":"M"},"poolKey":"name_fashion_sakala"}],"Sporting CP":[{"id":"xls_9074939588575969086","name":"Ederson","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"BRASIL","age":32,"overall":83,"price":{"value":19.0,"unit":"M"},"poolKey":"name_ederson"},{"id":"xls_6294870061673127248","name":"Raphaël Guerreiro","pos":"LB/CM/CB/LM","primaryPos":"LB","secondaryPos":"CM/CB/LM","country":"PORTUGAL","age":32,"overall":79,"price":{"value":12.5,"unit":"M"},"poolKey":"name_raphaël_guerreiro"},{"id":"xls_5187406880538553570","name":"Robin Le Normand","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":29,"overall":81,"price":{"value":24.5,"unit":"M"},"poolKey":"name_robin_le_normand"},{"id":"xls_2413857386638995632","name":"Marquinhos","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"BRASIL","age":31,"overall":87,"price":{"value":54.5,"unit":"M"},"poolKey":"name_marquinhos"},{"id":"xls_4121247010983402299","name":"Pedro Porro","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"ESPAÑA","age":26,"overall":82,"price":{"value":37.0,"unit":"M"},"poolKey":"name_pedro_porro"},{"id":"xls_6081348358328735398","name":"David Alaba","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"AUSTRIA","age":33,"overall":80,"price":{"value":10.0,"unit":"M"},"poolKey":"name_david_alaba"},{"id":"xls_6379012276847753323","name":"Youri Tielemans","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"BELGICA","age":29,"overall":85,"price":{"value":54.0,"unit":"M"},"poolKey":"name_youri_tielemans"},{"id":"xls_9055341501610471102","name":"João Palhinha","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"PORTUGAL","age":30,"overall":82,"price":{"value":26.0,"unit":"M"},"poolKey":"name_joão_palhinha"},{"id":"xls_3398614696153900486","name":"Leon Bailey","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"JAMAICA","age":28,"overall":78,"price":{"value":15.0,"unit":"M"},"poolKey":"name_leon_bailey"},{"id":"xls_1992813985776199254","name":"Giovani Lo Celso","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ARGENTINA","age":30,"overall":81,"price":{"value":25.5,"unit":"M"},"poolKey":"name_giovani_lo_celso"},{"id":"xls_2230716755108359393","name":"Joško Gvardiol","pos":"CB/LB/LM","primaryPos":"CB","secondaryPos":"LB/LM","country":"CROACIA","age":24,"overall":85,"price":{"value":66.0,"unit":"M"},"poolKey":"name_joško_gvardiol"},{"id":"xls_886216168834979855","name":"Paulo Gazzaniga","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ARGENTINA","age":34,"overall":78,"price":{"value":4.6,"unit":"M"},"poolKey":"name_paulo_gazzaniga"},{"id":"xls_4177435170562322076","name":"Fábio Silva","pos":"ST/LW/LM","primaryPos":"ST","secondaryPos":"LW/LM","country":"PORTUGAL","age":23,"overall":79,"price":{"value":28.5,"unit":"M"},"poolKey":"name_fabio_silva"},{"id":"xls_1290071761932229098","name":"Vincenzo Grifo","pos":"LM/RM","primaryPos":"LM","secondaryPos":"RM","country":"ITALIA","age":33,"overall":79,"price":{"value":14.0,"unit":"M"},"poolKey":"name_vincenzo_grifo"},{"id":"xls_6323637931674764016","name":"Vincent Janssen","pos":"ST/CAM/CM","primaryPos":"ST","secondaryPos":"CAM/CM","country":"PAISES BAJOS","age":31,"overall":76,"price":{"value":6.5,"unit":"M"},"poolKey":"name_vincent_janssen"},{"id":"xls_4865739054589579736","name":"Mason Greenwood","pos":"RM/CAM/RW","primaryPos":"RM","secondaryPos":"CAM/RW","country":"INGLATERRA","age":24,"overall":83,"price":{"value":49.5,"unit":"M"},"poolKey":"name_mason_greenwood"},{"id":"xls_1749610804120046600","name":"Pepê","pos":"CAM/RM/RW/CM","primaryPos":"CAM","secondaryPos":"RM/RW/CM","country":"BRASIL","age":29,"overall":77,"price":{"value":10.5,"unit":"M"},"poolKey":"name_pepê"},{"id":"xls_111201568826481926","name":"Filip Kostić","pos":"LM/LB","primaryPos":"LM","secondaryPos":"LB","country":"SERBIA","age":33,"overall":80,"price":{"value":16.5,"unit":"M"},"poolKey":"name_filip_kostić"},{"id":"xls_1504155239178393322","name":"Roger Fernandes","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"PORTUGAL","age":20,"overall":76,"price":{"value":16.0,"unit":"M"},"poolKey":"name_roger_fernandes"},{"id":"xls_3418522187871128999","name":"Daniel Vivian Moreno","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":26,"overall":82,"price":{"value":36.0,"unit":"M"},"poolKey":"name_daniel_vivian_moreno"},{"id":"xls_409043102677482157","name":"Kobbie Mainoo","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"INGLATERRA","age":21,"overall":79,"price":{"value":25.0,"unit":"M"},"poolKey":"name_kobbie_mainoo"},{"id":"xls_3189414398252450591","name":"Nelson Deossa","pos":"CDM/CM/CAM","primaryPos":"CDM","secondaryPos":"CM/CAM","country":"COLOMBIA","age":26,"overall":75,"price":{"value":7.5,"unit":"M"},"poolKey":"name_nelson_deossa"},{"id":"xls_294320624447932757","name":"Thierry Correia","pos":"RB/LB","primaryPos":"RB","secondaryPos":"LB","country":"PORTUGAL","age":27,"overall":74,"price":{"value":4.2,"unit":"M"},"poolKey":"name_thierry_correia"},{"id":"xls_6765230331343773492","name":"Omar Marmoush","pos":"LW/ST/LM","primaryPos":"LW","secondaryPos":"ST/LM","country":"EGIPTO","age":27,"overall":83,"price":{"value":39.5,"unit":"M"},"poolKey":"name_omar_marmoush"},{"id":"xls_5083486477264697117","name":"Maximiliano Meza","pos":"CM/RW/LW/CDM","primaryPos":"CM","secondaryPos":"RW/LW/CDM","country":"ARGENTINA","age":33,"overall":73,"price":{"value":2.4,"unit":"M"},"poolKey":"name_maximiliano_meza"},{"id":"xls_7177735543705837422","name":"Santino Andino","pos":"LM/LW/CAM","primaryPos":"LM","secondaryPos":"LW/CAM","country":"ARGENTINA","age":20,"overall":68,"price":{"value":2.9,"unit":"M"},"poolKey":"name_santino_andino"}],"Feyenord SC":[{"id":"xls_6898432414169596021","name":"Marc-André ter Stegen","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ALEMANIA","age":34,"overall":84,"price":{"value":13.5,"unit":"M"},"poolKey":"name_marc-andre_ter_stegen"},{"id":"xls_101102785583509997","name":"Pervis Estupiñán","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ECUADOR","age":28,"overall":79,"price":{"value":17.0,"unit":"M"},"poolKey":"name_pervis_estupinan"},{"id":"xls_4006837875517708407","name":"Pierre-Emerick Aubameyang","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"GABÓN","age":36,"overall":81,"price":{"value":9.0,"unit":"M"},"poolKey":"name_pierre-emerick_aubameyang"},{"id":"xls_1449828661871137946","name":"Dan Burn","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"INGLATERRA","age":34,"overall":80,"price":{"value":10.0,"unit":"M"},"poolKey":"name_dan_burn"},{"id":"xls_118329823229196219","name":"Jonathan Clauss","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"FRANCIA","age":33,"overall":78,"price":{"value":9.5,"unit":"M"},"poolKey":"name_jonathan_clauss"},{"id":"xls_3519940583443596191","name":"Ander Herrera","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ESPAÑA","age":36,"overall":76,"price":{"value":3.0,"unit":"M"},"poolKey":"name_ander_herrera"},{"id":"xls_3948162950292910659","name":"Teun Koopmeiners","pos":"CAM/CM/CB","primaryPos":"CAM","secondaryPos":"CM/CB","country":"PAISES BAJOS","age":28,"overall":80,"price":{"value":22.5,"unit":"M"},"poolKey":"name_teun_koopmeiners"},{"id":"xls_4814907503490817681","name":"Nathan Aké","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"PAISES BAJOS","age":31,"overall":82,"price":{"value":25.0,"unit":"M"},"poolKey":"name_nathan_ake"},{"id":"xls_471981845009635183","name":"Lionel Messi","pos":"CAM/ST/RW","primaryPos":"CAM","secondaryPos":"ST/RW","country":"ARGENTINA","age":38,"overall":86,"price":{"value":22.0,"unit":"M"},"poolKey":"name_lionel_messi"},{"id":"xls_1610602530687800267","name":"Leroy Sané","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"ALEMANIA","age":30,"overall":81,"price":{"value":25.5,"unit":"M"},"poolKey":"name_leroy_sane"},{"id":"xls_4072987940095071810","name":"Jacob Murphy","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"INGLATERRA","age":31,"overall":79,"price":{"value":17.0,"unit":"M"},"poolKey":"name_jacob_murphy"},{"id":"xls_662860597446057634","name":"Andriy Lunin","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"UCRANIA","age":27,"overall":80,"price":{"value":22.5,"unit":"M"},"poolKey":"name_andriy_lunin"},{"id":"xls_598046654632738561","name":"Micky van de Ven","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"PAISES BAJOS","age":25,"overall":82,"price":{"value":37.0,"unit":"M"},"poolKey":"name_micky_van_de_ven"},{"id":"xls_3905881394700667699","name":"Nicolás Tagliafico","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ARGENTINA","age":33,"overall":78,"price":{"value":9.5,"unit":"M"},"poolKey":"name_nicolas_tagliafico"},{"id":"xls_2777294060446451238","name":"Matty Cash","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"POLONIA","age":28,"overall":81,"price":{"value":25.0,"unit":"M"},"poolKey":"name_matty_cash"},{"id":"xls_1422997479884696397","name":"Ferran Torres","pos":"LW/ST/LM","primaryPos":"LW","secondaryPos":"ST/LM","country":"ESPAÑA","age":26,"overall":84,"price":{"value":53.5,"unit":"M"},"poolKey":"name_ferran_torres"},{"id":"xls_7347531962310567952","name":"Kees Smit","pos":"CAM/CM/CDM","primaryPos":"CAM","secondaryPos":"CM/CDM","country":"PAISES BAJOS","age":20,"overall":74,"price":{"value":10.0,"unit":"M"},"poolKey":"name_kees_smit"},{"id":"xls_539036946405944378","name":"Chris Wood","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"NUEVA ZELANDA","age":34,"overall":81,"price":{"value":16.5,"unit":"M"},"poolKey":"name_chris_wood"},{"id":"xls_5316357938491242282","name":"Ángel Di María","pos":"RW/RM/CAM","primaryPos":"RW","secondaryPos":"RM/CAM","country":"ARGENTINA","age":38,"overall":82,"price":{"value":10.0,"unit":"M"},"poolKey":"name_angel_di_maria"},{"id":"xls_3779479259480312154","name":"Sam Beukema","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PAISES BAJOS","age":27,"overall":78,"price":{"value":15.5,"unit":"M"},"poolKey":"name_sam_beukema"},{"id":"xls_193722421755997351","name":"Mykola Matviienko","pos":"CB/LB/RB","primaryPos":"CB","secondaryPos":"LB/RB","country":"UCRANIA","age":30,"overall":77,"price":{"value":9.0,"unit":"M"},"poolKey":"name_mykola_matviienko"},{"id":"xls_3766064601120180447","name":"Tyrone Mings","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":33,"overall":78,"price":{"value":9.0,"unit":"M"},"poolKey":"name_tyrone_mings"},{"id":"xls_8742047108467495902","name":"Leandro Trossard","pos":"LW/ST/LM","primaryPos":"LW","secondaryPos":"ST/LM","country":"BELGICA","age":31,"overall":83,"price":{"value":35.0,"unit":"M"},"poolKey":"name_leandro_trossard"},{"id":"xls_8145621321820227655","name":"Geovany Quenda","pos":"RM/LM/CAM/RW","primaryPos":"RM","secondaryPos":"LM/CAM/RW","country":"PORTUGAL","age":19,"overall":76,"price":{"value":17.5,"unit":"M"},"poolKey":"name_geovany_quenda"},{"id":"xls_5679622825447238595","name":"Hamed Junior Traoré","pos":"LM/CAM/LW","primaryPos":"LM","secondaryPos":"CAM/LW","country":"COSTA DE MARFIL","age":26,"overall":77,"price":{"value":12.5,"unit":"M"},"poolKey":"name_hamed_junior_traore"},{"id":"xls_2125140236599978806","name":"Mats Wieffer","pos":"CDM/RB/CM","primaryPos":"CDM","secondaryPos":"RB/CM","country":"PAISES BAJOS","age":26,"overall":78,"price":{"value":17.0,"unit":"M"},"poolKey":"name_mats_wieffer"}],"Racing Club":[{"id":"xls_876801905410105755","name":"Thibaut Courtois","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"BELGICA","age":34,"overall":90,"price":{"value":39.0,"unit":"M"},"poolKey":"name_thibaut_courtois"},{"id":"xls_1551971048102933514","name":"Reinildo","pos":"LB/CB","primaryPos":"LB","secondaryPos":"CB","country":"ESCOCIA","age":32,"overall":80,"price":{"value":15.5,"unit":"M"},"poolKey":"name_reinildo"},{"id":"xls_5002977389340278088","name":"Kalidou Koulibaly","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SENEGAL","age":34,"overall":82,"price":{"value":10.0,"unit":"M"},"poolKey":"name_kalidou_koulibaly"},{"id":"xls_5194480047445463698","name":"Nico Paz","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ARGENTINA","age":21,"overall":82,"price":{"value":60.5,"unit":"M"},"poolKey":"name_nico_paz"},{"id":"xls_607464051999356665","name":"Rodinei","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"BRASIL","age":34,"overall":76,"price":{"value":3.9,"unit":"M"},"poolKey":"name_rodinei"},{"id":"xls_8128573015745195001","name":"Rodrigo De Paul","pos":"CM/CDM/RM/CAM","primaryPos":"CM","secondaryPos":"CDM/RM/CAM","country":"ARGENTINA","age":31,"overall":83,"price":{"value":30.0,"unit":"M"},"poolKey":"name_rodrigo_de_paul"},{"id":"xls_6218222009399943691","name":"Remo Freuler","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"SUIZA","age":34,"overall":82,"price":{"value":15.0,"unit":"M"},"poolKey":"name_remo_freuler"},{"id":"xls_696231331652231561","name":"Cody Gakpo","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"PAISES BAJOS","age":27,"overall":83,"price":{"value":39.5,"unit":"M"},"poolKey":"name_cody_gakpo"},{"id":"xls_5345444279051066701","name":"Denzel Dumfries","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"PAISES BAJOS","age":30,"overall":84,"price":{"value":37.0,"unit":"M"},"poolKey":"name_denzel_dumfries"},{"id":"xls_3948587714838022775","name":"Stefan de Vrij","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PAISES BAJOS","age":34,"overall":83,"price":{"value":17.5,"unit":"M"},"poolKey":"name_stefan_de_vrij"},{"id":"xls_6485338906183774592","name":"Karim Benzema","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"FRANCIA","age":38,"overall":85,"price":{"value":18.5,"unit":"M"},"poolKey":"name_karim_benzema"},{"id":"xls_3949359442802362614","name":"Oliver Baumann","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ALEMANIA","age":35,"overall":84,"price":{"value":4.7,"unit":"M"},"poolKey":"name_oliver_baumann"},{"id":"xls_8735653164994626165","name":"Giuliano Simeone","pos":"RM/RW/LM","primaryPos":"RM","secondaryPos":"RW/LM","country":"ARGENTINA","age":23,"overall":82,"price":{"value":44.5,"unit":"M"},"poolKey":"name_giuliano_simeone"},{"id":"xls_7513617372626673700","name":"Mohamed Simakan","pos":"CB/RB","primaryPos":"CB","secondaryPos":"RB","country":"FRANCIA","age":26,"overall":81,"price":{"value":34.0,"unit":"M"},"poolKey":"name_mohamed_simakan"},{"id":"xls_7817690777233537881","name":"Paul Wanner","pos":"CAM/RW/CM","primaryPos":"CAM","secondaryPos":"RW/CM","country":"ALEMANIA","age":20,"overall":75,"price":{"value":12.0,"unit":"M"},"poolKey":"name_paul_wanner"},{"id":"xls_8997838656022842295","name":"Fabinho","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"BRASIL","age":32,"overall":82,"price":{"value":21.5,"unit":"M"},"poolKey":"name_fabinho"},{"id":"xls_971628922116953144","name":"Ángel Correa","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"ARGENTINA","age":31,"overall":79,"price":null,"poolKey":"name_angel_correa"},{"id":"xls_690804918655524221","name":"Nicolas Pépé","pos":"RM/ST/RW","primaryPos":"RM","secondaryPos":"ST/RW","country":"COSTA DE MARFIL","age":30,"overall":81,"price":{"value":25.0,"unit":"M"},"poolKey":"name_nicolas_pepe"},{"id":"xls_7174644064208726369","name":"Jérémy Jacquet","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"FRANCIA","age":20,"overall":76,"price":{"value":15.0,"unit":"M"},"poolKey":"name_jeremy_jacquet"},{"id":"xls_3900600162749822551","name":"Rico Henry","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"JAMAICA","age":28,"overall":76,"price":{"value":7.0,"unit":"M"},"poolKey":"name_rico_henry"},{"id":"xls_5346242020078682872","name":"Kingsley Coman","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"FRANCIA","age":29,"overall":82,"price":{"value":30.0,"unit":"M"},"poolKey":"name_kingsley_coman"},{"id":"xls_2395520699003127884","name":"Rayan","pos":"RM/ST/RW","primaryPos":"RM","secondaryPos":"ST/RW","country":"BRASIL","age":19,"overall":78,"price":{"value":29.5,"unit":"M"},"poolKey":"name_rayan"},{"id":"xls_1740545218787234565","name":"Matías Soulé","pos":"CAM/ST","primaryPos":"CAM","secondaryPos":"ST","country":"ARGENTINA","age":23,"overall":79,"price":{"value":28.0,"unit":"M"},"poolKey":"name_matias_soule"},{"id":"xls_351888437560135852","name":"Kevin Mac Allister","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ARGENTINA","age":28,"overall":78,"price":{"value":13.0,"unit":"M"},"poolKey":"name_kevin_mac_allister"},{"id":"xls_6736597260650629462","name":"Evander","pos":"CAM/CM/ST","primaryPos":"CAM","secondaryPos":"CM/ST","country":"BRASIL","age":27,"overall":79,"price":{"value":20.0,"unit":"M"},"poolKey":"name_evander"},{"id":"xls_152670852425286671","name":"Ricardo Horta","pos":"CAM/LM/RM/CM","primaryPos":"CAM","secondaryPos":"LM/RM/CM","country":"PORTUGAL","age":31,"overall":81,"price":{"value":25.0,"unit":"M"},"poolKey":"name_ricardo_horta"}],"Olympique Lyonnais":[{"id":"xls_8603184126170392686","name":"Ante Budimir","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"CROACIA","age":33,"overall":81,"price":{"value":16.5,"unit":"M"},"poolKey":"name_ante_budimir"},{"id":"xls_8940086697515586124","name":"James Tarkowski","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"POLONIA","age":32,"overall":80,"price":{"value":13.5,"unit":"M"},"poolKey":"name_james_tarkowski"},{"id":"xls_3121344452778593594","name":"Alejandro Catena","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":30,"overall":78,"price":{"value":11.5,"unit":"M"},"poolKey":"name_alejandro_catena"},{"id":"xls_2769094182552532597","name":"Aaron Wan-Bissaka","pos":"RB/RM/RW","primaryPos":"RB","secondaryPos":"RM/RW","country":"R.D. CONGO","age":27,"overall":79,"price":{"value":17.0,"unit":"M"},"poolKey":"name_aaron_wan-bissaka"},{"id":"xls_4390855875874094909","name":"Pablo Fornals","pos":"CDM/CAM/RM/CM","primaryPos":"CDM","secondaryPos":"CAM/RM/CM","country":"ESPAÑA","age":29,"overall":81,"price":{"value":25.0,"unit":"M"},"poolKey":"name_pablo_fornals"},{"id":"xls_3675693873608365907","name":"Jonathan Ikoné","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"FRANCIA","age":27,"overall":75,"price":{"value":6.0,"unit":"M"},"poolKey":"name_jonathan_ikone"},{"id":"xls_9113180744342602306","name":"Aron Dønnum","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"NORUEGA","age":27,"overall":75,"price":{"value":6.0,"unit":"M"},"poolKey":"name_aron_dønnum"},{"id":"xls_3736505808686463877","name":"Jean-Philippe Mateta","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"FRANCIA","age":28,"overall":82,"price":{"value":31.0,"unit":"M"},"poolKey":"name_jean-philippe_mateta"},{"id":"xls_7887762970761605262","name":"André Onana","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"CAMERUN","age":29,"overall":80,"price":{"value":14.5,"unit":"M"},"poolKey":"name_andre_onana"},{"id":"xls_8655819967021798407","name":"Ramy Bensebaini","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"ARGELIA","age":30,"overall":79,"price":{"value":14.5,"unit":"M"},"poolKey":"name_ramy_bensebaini"},{"id":"xls_1389939793182053109","name":"Benjamin Henrichs","pos":"RB/RM/LB","primaryPos":"RB","secondaryPos":"RM/LB","country":"ALEMANIA","age":28,"overall":80,"price":{"value":19.0,"unit":"M"},"poolKey":"name_benjamin_henrichs"},{"id":"xls_2088886414459174019","name":"Rani Khedira","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ALEMANIA","age":31,"overall":76,"price":{"value":5.0,"unit":"M"},"poolKey":"name_rani_khedira"},{"id":"xls_8121982578126733255","name":"Romano Schmid","pos":"CAM/CM/RM","primaryPos":"CAM","secondaryPos":"CM/RM","country":"AUSTRIA","age":25,"overall":78,"price":{"value":18.5,"unit":"M"},"poolKey":"name_romano_schmid"},{"id":"xls_4733503519774066954","name":"Giovanni Reyna","pos":"RM/CAM/LM/RW","primaryPos":"RM","secondaryPos":"CAM/LM/RW","country":"USA","age":22,"overall":73,"price":{"value":4.7,"unit":"M"},"poolKey":"name_giovanni_reyna"},{"id":"xls_4908737293732624024","name":"Matías Dituro","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ARGENTINA","age":38,"overall":75,"price":{"value":625.0,"unit":"K"},"poolKey":"name_matias_dituro"},{"id":"xls_4677196145510410153","name":"Emanuel Mammana","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ARGENTINA","age":29,"overall":74,"price":{"value":3.5,"unit":"M"},"poolKey":"name_emanuel_mammana"},{"id":"xls_2123911904897311212","name":"Brandon Mechele","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"BELGICA","age":32,"overall":78,"price":{"value":9.0,"unit":"M"},"poolKey":"name_brandon_mechele"},{"id":"xls_1259339782850495720","name":"Matteo Gabbia","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ITALIA","age":25,"overall":80,"price":{"value":25.0,"unit":"M"},"poolKey":"name_matteo_gabbia"},{"id":"xls_7766989817802745717","name":"Cristian Roldan","pos":"CDM/RM/CM","primaryPos":"CDM","secondaryPos":"RM/CM","country":"USA","age":30,"overall":74,"price":{"value":3.5,"unit":"M"},"poolKey":"name_cristian_roldan"},{"id":"xls_1087187633596071825","name":"Abdoulaye Touré","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"GUINEA","age":31,"overall":75,"price":{"value":3.9,"unit":"M"},"poolKey":"name_abdoulaye_toure"},{"id":"xls_7478856543508908304","name":"Luke Shaw","pos":"LB/CB/LM","primaryPos":"LB","secondaryPos":"CB/LM","country":"INGLATERRA","age":29,"overall":79,"price":{"value":15.5,"unit":"M"},"poolKey":"name_luke_shaw"},{"id":"xls_3652250411397649928","name":"Adrien Truffert","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"FRANCIA","age":23,"overall":79,"price":{"value":23.5,"unit":"M"},"poolKey":"name_adrien_truffert"}],"Paris FC":[{"id":"xls_5299494741957325890","name":"Hugo Lloris","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"FRANCIA","age":39,"overall":75,"price":{"value":625.0,"unit":"K"},"poolKey":"name_hugo_lloris"},{"id":"xls_7459563624609298847","name":"Valentín Barco","pos":"CM/LM/LB/CDM","primaryPos":"CM","secondaryPos":"LM/LB/CDM","country":"ARGENTINA","age":21,"overall":78,"price":{"value":21.5,"unit":"M"},"poolKey":"name_valentin_barco"},{"id":"xls_6563940157842121733","name":"Lutsharel Geertruida","pos":"CB/RB/CDM/RM","primaryPos":"CB","secondaryPos":"RB/CDM/RM","country":"PAISES BAJOS","age":25,"overall":78,"price":{"value":18.0,"unit":"M"},"poolKey":"name_lutsharel_geertruida"},{"id":"xls_4156150811517793538","name":"Romain Perraud","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"FRANCIA","age":28,"overall":76,"price":{"value":7.0,"unit":"M"},"poolKey":"name_romain_perraud"},{"id":"xls_5894060945031143083","name":"Tino Livramento","pos":"RB/LB/RM","primaryPos":"RB","secondaryPos":"LB/RM","country":"INGLATERRA","age":23,"overall":80,"price":{"value":31.5,"unit":"M"},"poolKey":"name_tino_livramento"},{"id":"xls_6917474663354119577","name":"Evan Ferguson","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"IRLANDA","age":21,"overall":74,"price":{"value":9.5,"unit":"M"},"poolKey":"name_evan_ferguson"},{"id":"xls_1740692637015478013","name":"Dominik Szoboszlai","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"HUNGRIA","age":25,"overall":86,"price":{"value":88.0,"unit":"M"},"poolKey":"name_dominik_szoboszlai"},{"id":"xls_146068675752292281","name":"Warren Zaïre-Emery","pos":"CM/CDM/RB/CAM","primaryPos":"CM","secondaryPos":"CDM/RB/CAM","country":"FRANCIA","age":20,"overall":83,"price":{"value":55.0,"unit":"M"},"poolKey":"name_warren_zaïre-emery"},{"id":"xls_6485427968692898050","name":"Luca Koleosho","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"ITALIA","age":21,"overall":72,"price":{"value":4.6,"unit":"M"},"poolKey":"name_luca_koleosho"},{"id":"xls_5769655301684279648","name":"Vangelis Pavlidis","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"GRECIA","age":27,"overall":83,"price":{"value":43.5,"unit":"M"},"poolKey":"name_vangelis_pavlidis"},{"id":"xls_8323369339957750722","name":"Charalampos Kostoulas","pos":"ST/CAM/RM","primaryPos":"ST","secondaryPos":"CAM/RM","country":"GRECIA","age":18,"overall":73,"price":{"value":7.0,"unit":"M"},"poolKey":"name_charalampos_kostoulas"},{"id":"xls_8710604137858057925","name":"Jonas Urbig","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ALEMANIA","age":22,"overall":77,"price":{"value":20.5,"unit":"M"},"poolKey":"name_jonas_urbig"},{"id":"xls_2949525284805113127","name":"Paul Pogba","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"FRANCIA","age":33,"overall":77,"price":{"value":8.5,"unit":"M"},"poolKey":"name_paul_pogba"},{"id":"xls_8744953225521933033","name":"Leopold Querfeld","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"AUSTRIA","age":22,"overall":77,"price":{"value":20.0,"unit":"M"},"poolKey":"name_leopold_querfeld"},{"id":"xls_2795496949227737012","name":"Sverre Nypan","pos":"CM/CAM/ST","primaryPos":"CM","secondaryPos":"CAM/ST","country":"NORUEGA","age":19,"overall":70,"price":{"value":4.0,"unit":"M"},"poolKey":"name_sverre_nypan"},{"id":"xls_2342125727345628516","name":"Samuele Ricci","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ITALIA","age":24,"overall":79,"price":{"value":25.5,"unit":"M"},"poolKey":"name_samuele_ricci"},{"id":"xls_8562238748761175174","name":"Ayyoub Bouaddi","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"FRANCIA","age":18,"overall":78,"price":{"value":27.0,"unit":"M"},"poolKey":"name_ayyoub_bouaddi"},{"id":"xls_8003869158300945518","name":"Mattia Zaccagni","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"ITALIA","age":30,"overall":83,"price":{"value":35.0,"unit":"M"},"poolKey":"name_mattia_zaccagni"},{"id":"xls_2963085353435589187","name":"Giorgio Scalvini","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ITALIA","age":22,"overall":78,"price":{"value":29.5,"unit":"M"},"poolKey":"name_giorgio_scalvini"},{"id":"xls_8160479816545545994","name":"Matteo Prati","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ITALIA","age":22,"overall":72,"price":{"value":5.0,"unit":"M"},"poolKey":"name_matteo_prati"},{"id":"xls_4445687724517958824","name":"Tygo Land","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"PAISES BAJOS","age":20,"overall":67,"price":{"value":2.6,"unit":"M"},"poolKey":"name_tygo_land"},{"id":"xls_5729083405617900134","name":"Kalvin Phillips","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"INGLATERRA","age":30,"overall":74,"price":{"value":3.6,"unit":"M"},"poolKey":"name_kalvin_phillips"},{"id":"xls_1815483530197387643","name":"Fabio Miretti","pos":"CM/CDM/LM/CAM","primaryPos":"CM","secondaryPos":"CDM/LM/CAM","country":"ITALIA","age":22,"overall":75,"price":{"value":8.5,"unit":"M"},"poolKey":"name_fabio_miretti"},{"id":"xls_334762478949657491","name":"Kendry Páez","pos":"CAM/RW/CM","primaryPos":"CAM","secondaryPos":"RW/CM","country":"ECUADOR","age":19,"overall":73,"price":{"value":6.5,"unit":"M"},"poolKey":"name_kendry_paez"},{"id":"xls_9197395589519723964","name":"Oscar Gloukh","pos":"CAM/LW/RW/CM","primaryPos":"CAM","secondaryPos":"LW/RW/CM","country":"ISRAEL","age":22,"overall":77,"price":{"value":23.5,"unit":"M"},"poolKey":"name_oscar_gloukh"},{"id":"xls_8636108512164625801","name":"Arthur Vermeeren","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"BELGICA","age":21,"overall":77,"price":{"value":23.0,"unit":"M"},"poolKey":"name_arthur_vermeeren"}],"F.C. Porto":[{"id":"xls_747808483550842629","name":"Marco Carnesecchi","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ITALIA","age":25,"overall":85,"price":{"value":55.0,"unit":"M"},"poolKey":"name_marco_carnesecchi"},{"id":"xls_7975006435848420242","name":"Nuno Santos","pos":"LM/LB/LW","primaryPos":"LM","secondaryPos":"LB/LW","country":"PORTUGAL","age":31,"overall":77,"price":{"value":10.0,"unit":"M"},"poolKey":"name_nuno_santos"},{"id":"xls_5499071663144610729","name":"Piero Hincapié","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"ECUADOR","age":24,"overall":83,"price":{"value":48.5,"unit":"M"},"poolKey":"name_piero_hincapie"},{"id":"xls_1618807821034171213","name":"Lucas Hernández","pos":"LB/CB","primaryPos":"LB","secondaryPos":"CB","country":"FRANCIA","age":30,"overall":81,"price":{"value":22.5,"unit":"M"},"poolKey":"name_lucas_hernandez"},{"id":"xls_2166260818774164779","name":"Matheus Nunes","pos":"RB/CM/RM","primaryPos":"RB","secondaryPos":"CM/RM","country":"PORTUGAL","age":27,"overall":82,"price":{"value":33.0,"unit":"M"},"poolKey":"name_matheus_nunes"},{"id":"xls_2381300702421562154","name":"Casemiro","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"BRASIL","age":34,"overall":82,"price":{"value":15.0,"unit":"M"},"poolKey":"name_casemiro"},{"id":"xls_1997872828130893643","name":"Mateo Kovačić","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"CROACIA","age":32,"overall":82,"price":{"value":25.0,"unit":"M"},"poolKey":"name_mateo_kovačić"},{"id":"xls_1719037420218409406","name":"Malcom","pos":"RW/CAM/RM","primaryPos":"RW","secondaryPos":"CAM/RM","country":"BRASIL","age":29,"overall":82,"price":{"value":30.5,"unit":"M"},"poolKey":"name_malcom"},{"id":"xls_7636756062936605184","name":"Serge Gnabry","pos":"LM/RM/CAM/LW","primaryPos":"LM","secondaryPos":"RM/CAM/LW","country":"ALEMANIA","age":30,"overall":83,"price":{"value":35.5,"unit":"M"},"poolKey":"name_serge_gnabry"},{"id":"xls_5837539403752418337","name":"Pedro Neto","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"PORTUGAL","age":26,"overall":82,"price":{"value":36.5,"unit":"M"},"poolKey":"name_pedro_neto"},{"id":"xls_4359374622811833513","name":"Cristiano Ronaldo","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"PORTUGAL","age":41,"overall":85,"price":null,"poolKey":"name_cristiano_ronaldo"},{"id":"xls_4980828750662218162","name":"Koen Casteels","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"BELGICA","age":33,"overall":82,"price":{"value":10.0,"unit":"M"},"poolKey":"name_koen_casteels"},{"id":"xls_8270955591606878767","name":"Ibrahim Maza","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ARGELIA","age":20,"overall":79,"price":{"value":38.0,"unit":"M"},"poolKey":"name_ibrahim_maza"},{"id":"xls_2600295382153950062","name":"Éderson","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"BRASIL","age":26,"overall":82,"price":{"value":40.0,"unit":"M"},"poolKey":"name_ederson"},{"id":"xls_8177640789622550316","name":"Mohamed Amoura","pos":"ST/LW/LM/CAM","primaryPos":"ST","secondaryPos":"LW/LM/CAM","country":"ARGELIA","age":26,"overall":80,"price":{"value":28.5,"unit":"M"},"poolKey":"name_mohamed_amoura"},{"id":"xls_8505396310166014575","name":"Otávio","pos":"CM/CAM/CDM","primaryPos":"CM","secondaryPos":"CAM/CDM","country":"PORTUGAL","age":31,"overall":81,"price":{"value":24.5,"unit":"M"},"poolKey":"name_otavio"},{"id":"xls_5704959413201441630","name":"Musa Barrow","pos":"LW/LM/ST","primaryPos":"LW","secondaryPos":"LM/ST","country":"GAMBIA","age":27,"overall":79,"price":{"value":19.0,"unit":"M"},"poolKey":"name_musa_barrow"},{"id":"xls_3269919861037819278","name":"David Neres","pos":"LW/LM","primaryPos":"LW","secondaryPos":"LM","country":"BRASIL","age":29,"overall":81,"price":{"value":26.0,"unit":"M"},"poolKey":"name_david_neres"},{"id":"xls_4758777634534291524","name":"Jakub Kiwior","pos":"CB/LB/CM","primaryPos":"CB","secondaryPos":"LB/CM","country":"POLONIA","age":26,"overall":80,"price":{"value":28.0,"unit":"M"},"poolKey":"name_jakub_kiwior"},{"id":"xls_6345114851443138505","name":"Ritsu Doan","pos":"RM/CAM/CM/RB","primaryPos":"RM","secondaryPos":"CAM/CM/RB","country":"JAPÓN","age":27,"overall":81,"price":{"value":27.5,"unit":"M"},"poolKey":"name_ritsu_doan"},{"id":"xls_5850014583596406757","name":"Diego Moreira","pos":"RM/LM/LB/RWB","primaryPos":"RM","secondaryPos":"LM/LB/RWB","country":"BELGICA","age":21,"overall":78,"price":{"value":22.0,"unit":"M"},"poolKey":"name_diego_moreira"},{"id":"xls_5461449515254595199","name":"Christos Tzolis","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"GRECIA","age":24,"overall":81,"price":{"value":40.5,"unit":"M"},"poolKey":"name_christos_tzolis"},{"id":"xls_268892258220448856","name":"William Gomes","pos":"RW/LW/RM","primaryPos":"RW","secondaryPos":"LW/RM","country":"PORTUGAL","age":20,"overall":75,"price":{"value":12.0,"unit":"M"},"poolKey":"name_william_gomes"},{"id":"xls_2680880983374421457","name":"Bradley Barcola","pos":"LW/RW/LM","primaryPos":"LW","secondaryPos":"RW/LM","country":"FRANCIA","age":23,"overall":84,"price":{"value":61.5,"unit":"M"},"poolKey":"name_bradley_barcola"},{"id":"xls_5377082254010462497","name":"Milos Kerkez","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"HUNGRIA","age":22,"overall":81,"price":{"value":35.0,"unit":"M"},"poolKey":"name_milos_kerkez"},{"id":"xls_5855462044043198830","name":"Yan Couto","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"BRASIL","age":23,"overall":77,"price":{"value":14.0,"unit":"M"},"poolKey":"name_yan_couto"}],"Wrexham A.F.C.":[{"id":"xls_5987963642007053370","name":"Mile Svilar","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"SERBIA","age":26,"overall":84,"price":{"value":43.0,"unit":"M"},"poolKey":"name_mile_svilar"},{"id":"xls_6648412569826833348","name":"Abdukodir Khusanov","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"UZBEKISTAN","age":22,"overall":80,"price":{"value":31.0,"unit":"M"},"poolKey":"name_abdukodir_khusanov"},{"id":"xls_3134335745352161393","name":"Levi Colwill","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":23,"overall":80,"price":{"value":27.5,"unit":"M"},"poolKey":"name_levi_colwill"},{"id":"xls_8065132966653021466","name":"Ethan Ampadu","pos":"CDM/CB/CM","primaryPos":"CDM","secondaryPos":"CB/CM","country":"GALES","age":25,"overall":78,"price":{"value":17.5,"unit":"M"},"poolKey":"name_ethan_ampadu"},{"id":"xls_6610372829902793365","name":"Daniel Muñoz","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"COLOMBIA","age":29,"overall":82,"price":{"value":27.0,"unit":"M"},"poolKey":"name_daniel_munoz"},{"id":"xls_7239380988809198080","name":"Orkun Kökçü","pos":"CM/CAM/CDM","primaryPos":"CM","secondaryPos":"CAM/CDM","country":"TURQUIA","age":25,"overall":82,"price":{"value":43.5,"unit":"M"},"poolKey":"name_orkun_kökçü"},{"id":"xls_2056852592398306438","name":"Noah Sadiki","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"R.D. CONGO","age":21,"overall":78,"price":{"value":27.5,"unit":"M"},"poolKey":"name_noah_sadiki"},{"id":"xls_9116006726202508796","name":"Curtis Jones","pos":"CAM/CM/CDM","primaryPos":"CAM","secondaryPos":"CM/CDM","country":"INGLATERRA","age":25,"overall":80,"price":{"value":28.5,"unit":"M"},"poolKey":"name_curtis_jones"},{"id":"xls_3873404773595433373","name":"Maximilian Beier","pos":"ST/CAM/LM","primaryPos":"ST","secondaryPos":"CAM/LM","country":"ALEMANIA","age":23,"overall":80,"price":{"value":31.0,"unit":"M"},"poolKey":"name_maximilian_beier"},{"id":"xls_1423237097557729668","name":"Alejandro Garnacho","pos":"LM/LW/CAM","primaryPos":"LM","secondaryPos":"LW/CAM","country":"ARGENTINA","age":21,"overall":78,"price":{"value":22.5,"unit":"M"},"poolKey":"name_alejandro_garnacho"},{"id":"xls_1760880646824055869","name":"Evanilson","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"BRASIL","age":26,"overall":79,"price":{"value":21.5,"unit":"M"},"poolKey":"name_evanilson"},{"id":"xls_7758811890922278814","name":"Nick Pope","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"INGLATERRA","age":34,"overall":79,"price":{"value":5.5,"unit":"M"},"poolKey":"name_nick_pope"},{"id":"xls_5319386571375391939","name":"El Hadji Malick Diouf","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"SENEGAL","age":21,"overall":78,"price":{"value":20.5,"unit":"M"},"poolKey":"name_el_hadji_malick_diouf"},{"id":"xls_3349964228336851288","name":"Tosin Adarabioyo","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":28,"overall":78,"price":{"value":14.0,"unit":"M"},"poolKey":"name_tosin_adarabioyo"},{"id":"xls_6098353361730728811","name":"Jake O'Brien","pos":"RB/CB","primaryPos":"RB","secondaryPos":"CB","country":"IRLANDA","age":24,"overall":76,"price":{"value":10.5,"unit":"M"},"poolKey":"name_jake_o'brien"},{"id":"xls_7849615325940136300","name":"Mamadou Sarr","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SENEGAL","age":20,"overall":77,"price":{"value":19.0,"unit":"M"},"poolKey":"name_mamadou_sarr"},{"id":"xls_6210296833178986726","name":"Michael Kayode","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"ITALIA","age":21,"overall":80,"price":{"value":29.0,"unit":"M"},"poolKey":"name_michael_kayode"},{"id":"xls_223615241177272703","name":"Neco Williams","pos":"LB/RB","primaryPos":"LB","secondaryPos":"RB","country":"GALES","age":25,"overall":80,"price":{"value":25.0,"unit":"M"},"poolKey":"name_neco_williams"},{"id":"xls_4228098315457778204","name":"Adam Wharton","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"INGLATERRA","age":22,"overall":81,"price":{"value":38.0,"unit":"M"},"poolKey":"name_adam_wharton"},{"id":"xls_6801045677790529319","name":"Wesley","pos":"RM/LM/RB/RW","primaryPos":"RM","secondaryPos":"LM/RB/RW","country":"BRASIL","age":22,"overall":79,"price":{"value":28.0,"unit":"M"},"poolKey":"name_wesley"},{"id":"xls_1951168854083323736","name":"Kaishū Sano","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"JAPÓN","age":25,"overall":80,"price":{"value":26.0,"unit":"M"},"poolKey":"name_kaishū_sano"},{"id":"xls_5009308460847078928","name":"Alex Scott","pos":"CDM/CM/CAM","primaryPos":"CDM","secondaryPos":"CM/CAM","country":"INGLATERRA","age":22,"overall":80,"price":{"value":31.0,"unit":"M"},"poolKey":"name_alex_scott"},{"id":"xls_1252941913597738166","name":"Kaoru Mitoma","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"JAPÓN","age":28,"overall":81,"price":{"value":26.0,"unit":"M"},"poolKey":"name_kaoru_mitoma"},{"id":"xls_9111385337334465831","name":"Ronaldo Cabrais","pos":"CAM/RM/CM","primaryPos":"CAM","secondaryPos":"RM/CM","country":"BRASIL","age":29,"overall":83,"price":{"value":35.5,"unit":"M"},"poolKey":"name_ronaldo_cabrais"},{"id":"xls_5645079396799819313","name":"Mikel Oyarzabal","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ESPAÑA","age":29,"overall":83,"price":{"value":37.0,"unit":"M"},"poolKey":"name_mikel_oyarzabal"},{"id":"xls_6820445363429207972","name":"Gabriel Jesus","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"BRASIL","age":29,"overall":80,"price":{"value":21.5,"unit":"M"},"poolKey":"name_gabriel_jesus"}],"Parma Calcio":[{"id":"xls_8354372164487724853","name":"David De Gea","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ESPAÑA","age":34,"overall":84,"price":{"value":7.0,"unit":"M"},"poolKey":"name_david_de_gea"},{"id":"xls_3883765463679728008","name":"Facundo Buonanotte","pos":"CAM/RM/CM","primaryPos":"CAM","secondaryPos":"RM/CM","country":"ARGENTINA","age":21,"overall":74,"price":{"value":6.5,"unit":"M"},"poolKey":"name_facundo_buonanotte"},{"id":"xls_5431982100479041116","name":"Vieirundinho","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"BRASIL","age":33,"overall":78,"price":{"value":6.5,"unit":"M"},"poolKey":"name_vieirundinho"},{"id":"xls_5757535020268776907","name":"Willi Orban","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"HUNGRIA","age":32,"overall":83,"price":{"value":23.5,"unit":"M"},"poolKey":"name_willi_orban"},{"id":"xls_5859348036749066289","name":"Christian Burgess","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":33,"overall":79,"price":{"value":8.5,"unit":"M"},"poolKey":"name_christian_burgess"},{"id":"xls_5404934786095559717","name":"Manuel Lazzari","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"ITALIA","age":31,"overall":76,"price":{"value":5.5,"unit":"M"},"poolKey":"name_manuel_lazzari"},{"id":"xls_7137304437545312688","name":"Maximilian Arnold","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ALEMANIA","age":31,"overall":79,"price":{"value":12.5,"unit":"M"},"poolKey":"name_maximilian_arnold"},{"id":"xls_4706804555793327282","name":"Ruiz de Galarreta","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ESPAÑA","age":31,"overall":80,"price":{"value":15.0,"unit":"M"},"poolKey":"name_ruiz_de_galarreta"},{"id":"xls_7742033237226180504","name":"Joey Veerman","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"PAISES BAJOS","age":26,"overall":81,"price":{"value":30.0,"unit":"M"},"poolKey":"name_joey_veerman"},{"id":"xls_7225441453398119155","name":"Deniz Undav","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"ALEMANIA","age":28,"overall":82,"price":{"value":31.0,"unit":"M"},"poolKey":"name_deniz_undav"},{"id":"xls_4779034285190628121","name":"Romelu Lukaku","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"BELGICA","age":32,"overall":83,"price":{"value":29.5,"unit":"M"},"poolKey":"name_romelu_lukaku"},{"id":"xls_885289197392127054","name":"Frederik Rønnow","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"DINAMARCA","age":32,"overall":79,"price":{"value":8.5,"unit":"M"},"poolKey":"name_frederik_rønnow"},{"id":"xls_7190175388827892549","name":"Moussa Niakhaté","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SENEGAL","age":29,"overall":80,"price":{"value":17.5,"unit":"M"},"poolKey":"name_moussa_niakhate"},{"id":"xls_5474147404932468355","name":"Leonardo Spinazzola","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ITALIA","age":32,"overall":80,"price":{"value":14.5,"unit":"M"},"poolKey":"name_leonardo_spinazzola"},{"id":"xls_6888985671971777350","name":"Hany Mukhtar","pos":"CAM/ST","primaryPos":"CAM","secondaryPos":"ST","country":"ALEMANIA","age":30,"overall":79,"price":{"value":17.0,"unit":"M"},"poolKey":"name_hany_mukhtar"},{"id":"xls_2798834711074250248","name":"Pedro Gonçalves","pos":"LM/CAM/LW","primaryPos":"LM","secondaryPos":"CAM/LW","country":"PORTUGAL","age":27,"overall":82,"price":{"value":32.5,"unit":"M"},"poolKey":"name_pedro_gonçalves"},{"id":"xls_8657187844872435856","name":"Johan Vásquez","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"MEXICO","age":26,"overall":75,"price":{"value":6.5,"unit":"M"},"poolKey":"name_johan_vasquez"},{"id":"xls_4172777238994331983","name":"António Silva","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PORTUGAL","age":21,"overall":77,"price":{"value":22.0,"unit":"M"},"poolKey":"name_antonio_silva"},{"id":"xls_2731822812271181227","name":"Ezequiel Fernández","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ARGENTINA","age":22,"overall":76,"price":{"value":16.0,"unit":"M"},"poolKey":"name_ezequiel_fernandez"},{"id":"xls_5119792606320322850","name":"Ainsley Maitland-Niles","pos":"RWB/RM/CDM","primaryPos":"RWB","secondaryPos":"RM/CDM","country":"INGLATERRA","age":27,"overall":77,"price":{"value":10.0,"unit":"M"},"poolKey":"name_ainsley_maitland-niles"},{"id":"xls_6431263001781836707","name":"Daniel Parejo","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ESPAÑA","age":36,"overall":80,"price":{"value":6.5,"unit":"M"},"poolKey":"name_daniel_parejo"},{"id":"xls_1269944006442924569","name":"Bryan Cristante","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ITALIA","age":30,"overall":81,"price":{"value":24.5,"unit":"M"},"poolKey":"name_bryan_cristante"},{"id":"xls_1774292940049279516","name":"Soufiane Rahimi","pos":"LM/ST/LW","primaryPos":"LM","secondaryPos":"ST/LW","country":"MARRUECOS","age":29,"overall":77,"price":{"value":10.5,"unit":"M"},"poolKey":"name_soufiane_rahimi"},{"id":"xls_6284740383859586495","name":"Nestory Irankunda","pos":"RM/ST/LM/RW","primaryPos":"RM","secondaryPos":"ST/LM/RW","country":"AUSTRALIA","age":20,"overall":69,"price":{"value":3.3,"unit":"M"},"poolKey":"name_nestory_irankunda"},{"id":"xls_6030876420054999789","name":"David Mella Boullón","pos":"RM/RB/LM/RW","primaryPos":"RM","secondaryPos":"RB/LM/RW","country":"ESPAÑA","age":20,"overall":71,"price":{"value":4.1,"unit":"M"},"poolKey":"name_david_mella_boullon"},{"id":"xls_5341524455351552259","name":"Bruma","pos":"LW/LM/CAM","primaryPos":"LW","secondaryPos":"LM/CAM","country":"PORTUGAL","age":30,"overall":77,"price":{"value":10.0,"unit":"M"},"poolKey":"name_bruma"}],"ACF Fiorentina":[{"id":"xls_5546552223669137638","name":"Ivan Provedel","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ITALIA","age":31,"overall":83,"price":{"value":19.0,"unit":"M"},"poolKey":"name_ivan_provedel"},{"id":"xls_4553070383969085333","name":"Riccardo Calafiori","pos":"LB/CB/CM","primaryPos":"LB","secondaryPos":"CB/CM","country":"ITALIA","age":23,"overall":82,"price":{"value":40.5,"unit":"M"},"poolKey":"name_riccardo_calafiori"},{"id":"xls_2945004514851190368","name":"Isak Hien","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SUECIA","age":26,"overall":78,"price":{"value":16.5,"unit":"M"},"poolKey":"name_isak_hien"},{"id":"xls_9025453071446794079","name":"Marcel Sabitzer","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"AUSTRIA","age":31,"overall":81,"price":{"value":18.0,"unit":"M"},"poolKey":"name_marcel_sabitzer"},{"id":"xls_6331171281342619129","name":"Alessandro Buongiorno","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ITALIA","age":26,"overall":82,"price":{"value":37.5,"unit":"M"},"poolKey":"name_alessandro_buongiorno"},{"id":"xls_4223387308837351106","name":"Davide Calabria","pos":"RB/CM","primaryPos":"RB","secondaryPos":"CM","country":"ITALIA","age":28,"overall":77,"price":{"value":9.5,"unit":"M"},"poolKey":"name_davide_calabria"},{"id":"xls_3940886154819638837","name":"Maximilian Mittelstädt","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ALEMANIA","age":28,"overall":83,"price":{"value":33.0,"unit":"M"},"poolKey":"name_maximilian_mittelstädt"},{"id":"xls_8441353452871181875","name":"Rúben Neves","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"PORTUGAL","age":28,"overall":85,"price":{"value":47.5,"unit":"M"},"poolKey":"name_ruben_neves"},{"id":"xls_8744645421417606085","name":"Gavi","pos":"CM/CAM","primaryPos":"CM","secondaryPos":"CAM","country":"ESPAÑA","age":21,"overall":83,"price":{"value":51.0,"unit":"M"},"poolKey":"name_gavi"},{"id":"xls_5497089779744002416","name":"Ciro Immobile","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"ITALIA","age":35,"overall":77,"price":{"value":4.5,"unit":"M"},"poolKey":"name_ciro_immobile"},{"id":"xls_285141056896741131","name":"Luis Díaz","pos":"LM/LW/ST","primaryPos":"LM","secondaryPos":"LW/ST","country":"COLOMBIA","age":28,"overall":87,"price":{"value":80.0,"unit":"M"},"poolKey":"name_luis_diaz"},{"id":"xls_9013626851370763283","name":"Elia Caprile","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ITALIA","age":23,"overall":78,"price":{"value":18.0,"unit":"M"},"poolKey":"name_elia_caprile"},{"id":"xls_1289309148083087242","name":"Axel Disasi","pos":"CB/RB","primaryPos":"CB","secondaryPos":"RB","country":"FRANCIA","age":27,"overall":77,"price":{"value":10.5,"unit":"M"},"poolKey":"name_axel_disasi"},{"id":"xls_6655949407478957890","name":"Noussair Mazraoui","pos":"RB/CB/RM","primaryPos":"RB","secondaryPos":"CB/RM","country":"MARRUECOS","age":27,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_noussair_mazraoui"},{"id":"xls_3426767530780445447","name":"Alessio Romagnoli","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ITALIA","age":30,"overall":82,"price":{"value":25.0,"unit":"M"},"poolKey":"name_alessio_romagnoli"},{"id":"xls_424441980727355448","name":"Angeliño","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ESPAÑA","age":28,"overall":79,"price":{"value":16.0,"unit":"M"},"poolKey":"name_angelino"},{"id":"xls_5258405462202893579","name":"Christian Nørgaard","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"DINAMARCA","age":31,"overall":80,"price":{"value":15.0,"unit":"M"},"poolKey":"name_christian_nørgaard"},{"id":"xls_6634770336896453376","name":"Mattéo Guendouzi","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"FRANCIA","age":26,"overall":82,"price":{"value":35.5,"unit":"M"},"poolKey":"name_matteo_guendouzi"},{"id":"xls_3324168069456161269","name":"Piotr Zieliński","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"POLONIA","age":31,"overall":81,"price":{"value":21.0,"unit":"M"},"poolKey":"name_piotr_zieliński"},{"id":"xls_7713899956198311354","name":"Yoane Wissa","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"R.D. CONGO","age":28,"overall":81,"price":{"value":26.5,"unit":"M"},"poolKey":"name_yoane_wissa"},{"id":"xls_2702611936594406973","name":"Nick Woltemade","pos":"ST/CM","primaryPos":"ST","secondaryPos":"CM","country":"ALEMANIA","age":23,"overall":80,"price":{"value":32.0,"unit":"M"},"poolKey":"name_nick_woltemade"},{"id":"xls_3831215235372160442","name":"Igor Thiago","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"BRASIL","age":24,"overall":81,"price":{"value":37.5,"unit":"M"},"poolKey":"name_igor_thiago"},{"id":"xls_6505049549065865253","name":"Dodi Lukébakio","pos":"RM/RW/LM","primaryPos":"RM","secondaryPos":"RW/LM","country":"BELGICA","age":27,"overall":81,"price":{"value":27.5,"unit":"M"},"poolKey":"name_dodi_lukebakio"},{"id":"xls_1049661262764267068","name":"Yankuba Minteh","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"GAMBIA","age":21,"overall":80,"price":{"value":33.0,"unit":"M"},"poolKey":"name_yankuba_minteh"},{"id":"xls_3673038409900355195","name":"Kosta Nedeljković","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"SERBIA","age":20,"overall":72,"price":{"value":4.8,"unit":"M"},"poolKey":"name_kosta_nedeljković"},{"id":"xls_2249788022724099527","name":"Axel Witsel","pos":"CB/CDM/CM","primaryPos":"CB","secondaryPos":"CDM/CM","country":"BELGICA","age":36,"overall":76,"price":{"value":1.3,"unit":"M"},"poolKey":"name_axel_witsel"}],"Palermo FC":[{"id":"xls_5626813804500107060","name":"Yann Sommer","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"SUIZA","age":37,"overall":86,"price":{"value":7.5,"unit":"M"},"poolKey":"name_yann_sommer"},{"id":"xls_7758885379084985073","name":"N'Golo Kanté","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"FRANCIA","age":35,"overall":84,"price":{"value":14.5,"unit":"M"},"poolKey":"name_n'golo_kante"},{"id":"xls_7882277975795951329","name":"João Cancelo","pos":"RWB/LWB/RM","primaryPos":"RWB","secondaryPos":"LWB/RM","country":"PORTUGAL","age":31,"overall":84,"price":{"value":30.5,"unit":"M"},"poolKey":"name_joão_cancelo"},{"id":"xls_3692322487040231432","name":"Manuel Locatelli","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ITALIA","age":28,"overall":84,"price":{"value":43.0,"unit":"M"},"poolKey":"name_manuel_locatelli"},{"id":"xls_7779657422138203766","name":"Heung Min Son","pos":"ST/LW/CAM","primaryPos":"ST","secondaryPos":"LW/CAM","country":"COREA DEL SUR","age":33,"overall":84,"price":{"value":34.0,"unit":"M"},"poolKey":"name_heung_min_son"},{"id":"xls_3690485121508083999","name":"Jonathan Tah","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ALEMANIA","age":30,"overall":87,"price":{"value":66.5,"unit":"M"},"poolKey":"name_jonathan_tah"},{"id":"xls_2770578741481148148","name":"David Raum","pos":"RWB/RM","primaryPos":"RWB","secondaryPos":"RM","country":"ALEMANIA","age":28,"overall":83,"price":{"value":35.0,"unit":"M"},"poolKey":"name_david_raum"},{"id":"xls_500800673588741061","name":"Dávid Hancko","pos":"LWB/CB/CDM","primaryPos":"LWB","secondaryPos":"CB/CDM","country":"ESLOVAQUIA","age":28,"overall":83,"price":{"value":35.0,"unit":"M"},"poolKey":"name_david_hancko"},{"id":"xls_3160299865249210210","name":"Antoine Semenyo","pos":"RW/LW/RM","primaryPos":"RW","secondaryPos":"LW/RM","country":"GHANA","age":26,"overall":84,"price":{"value":50.5,"unit":"M"},"poolKey":"name_antoine_semenyo"},{"id":"xls_1812156344328601675","name":"Manuel Akanji","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SUIZA","age":30,"overall":83,"price":{"value":30.5,"unit":"M"},"poolKey":"name_manuel_akanji"},{"id":"xls_4012205378283549896","name":"Kai Havertz","pos":"ST/CM/CAM","primaryPos":"ST","secondaryPos":"CM/CAM","country":"ALEMANIA","age":26,"overall":82,"price":{"value":38.0,"unit":"M"},"poolKey":"name_kai_havertz"},{"id":"xls_5294423359028333445","name":"Ivan Perišić","pos":"RW/LW/RM","primaryPos":"RW","secondaryPos":"LW/RM","country":"CROACIA","age":37,"overall":81,"price":{"value":8.5,"unit":"M"},"poolKey":"name_ivan_perišić"},{"id":"xls_3839843085060897057","name":"Quinten Timber","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"PAISES BAJOS","age":24,"overall":80,"price":{"value":31.5,"unit":"M"},"poolKey":"name_quinten_timber"},{"id":"xls_8244184731180449424","name":"Mateo Retegui","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ITALIA","age":27,"overall":82,"price":{"value":36.5,"unit":"M"},"poolKey":"name_mateo_retegui"},{"id":"xls_1766625309481921449","name":"Matteo Darmian","pos":"RWB/CB/RM/CDM","primaryPos":"RWB","secondaryPos":"CB/RM/CDM","country":"ITALIA","age":36,"overall":78,"price":{"value":4.3,"unit":"M"},"poolKey":"name_matteo_darmian"},{"id":"xls_5754615668056868582","name":"Marc Bernal","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ESPAÑA","age":18,"overall":75,"price":{"value":11.0,"unit":"M"},"poolKey":"name_marc_bernal"},{"id":"xls_6745684985668522497","name":"Jordan Pickford","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"INGLATERRA","age":32,"overall":85,"price":{"value":28.5,"unit":"M"},"poolKey":"name_jordan_pickford"},{"id":"xls_793615207961168719","name":"Federico Chiesa","pos":"RM/ST/RW","primaryPos":"RM","secondaryPos":"ST/RW","country":"ITALIA","age":28,"overall":80,"price":{"value":22.5,"unit":"M"},"poolKey":"name_federico_chiesa"},{"id":"xls_3420155676164791143","name":"Franco Mastantuono","pos":"RM/RW/CAM","primaryPos":"RM","secondaryPos":"RW/CAM","country":"ARGENTINA","age":18,"overall":77,"price":{"value":22.0,"unit":"M"},"poolKey":"name_franco_mastantuono"},{"id":"xls_6499259008588826911","name":"Lorenzo Pirola","pos":"CB/LWB","primaryPos":"CB","secondaryPos":"LWB","country":"ITALIA","age":24,"overall":77,"price":{"value":15.0,"unit":"M"},"poolKey":"name_lorenzo_pirola"},{"id":"xls_6766375953900547253","name":"Roberto Alvarado","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"MEXICO","age":27,"overall":76,"price":null,"poolKey":"name_roberto_alvarado"},{"id":"xls_81833295038234318","name":"Jesús Gallardo","pos":"LWB/LM/LW","primaryPos":"LWB","secondaryPos":"LM/LW","country":"MEXICO","age":31,"overall":77,"price":null,"poolKey":"name_jesus_gallardo"},{"id":"xls_5630180045756870691","name":"Leo Sauer","pos":"LW/CAM/LM","primaryPos":"LW","secondaryPos":"CAM/LM","country":"ESLOVAQUIA","age":20,"overall":73,"price":{"value":7.0,"unit":"M"},"poolKey":"name_leo_sauer"},{"id":"xls_5192609550685895286","name":"Filippo Ranocchia","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"ITALIA","age":24,"overall":73,"price":{"value":4.6,"unit":"M"},"poolKey":"name_filippo_ranocchia"},{"id":"xls_5207560155140454511","name":"Kyriani Sabbe","pos":"RWB/LWB/RM","primaryPos":"RWB","secondaryPos":"LWB/RM","country":"BELGICA","age":21,"overall":72,"price":{"value":5.5,"unit":"M"},"poolKey":"name_kyriani_sabbe"},{"id":"xls_7684162646706104960","name":"Marcus Rashford","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"INGLATERRA","age":28,"overall":82,"price":{"value":32.5,"unit":"M"},"poolKey":"name_marcus_rashford"}],"Hull City AFC":[{"id":"xls_3369845260634492755","name":"Rui Silva","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"PORTUGAL","age":32,"overall":81,"price":{"value":13.5,"unit":"M"},"poolKey":"name_rui_silva"},{"id":"xls_658795506116944115","name":"Miguel Gutiérrez","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ESPAÑA","age":24,"overall":81,"price":{"value":34.5,"unit":"M"},"poolKey":"name_miguel_gutierrez"},{"id":"xls_6184709916239716285","name":"Chris Smalling","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":36,"overall":79,"price":{"value":4.6,"unit":"M"},"poolKey":"name_chris_smalling"},{"id":"xls_6261680732196691245","name":"Pau Torres","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":29,"overall":80,"price":{"value":18.0,"unit":"M"},"poolKey":"name_pau_torres"},{"id":"xls_7831496519863931096","name":"Andrei Rațiu","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"RUMANIA","age":27,"overall":80,"price":{"value":22.0,"unit":"M"},"poolKey":"name_andrei_rațiu"},{"id":"xls_3084680052010511970","name":"Marc Cucurella","pos":"LB/CM","primaryPos":"LB","secondaryPos":"CM","country":"ESPAÑA","age":27,"overall":85,"price":{"value":53.5,"unit":"M"},"poolKey":"name_marc_cucurella"},{"id":"xls_559538171017415541","name":"Mario Lemina","pos":"CDM/CM/CB","primaryPos":"CDM","secondaryPos":"CM/CB","country":"GABON","age":32,"overall":78,"price":{"value":10.0,"unit":"M"},"poolKey":"name_mario_lemina"},{"id":"xls_8953013243040882265","name":"Noa Lang","pos":"LW/LM","primaryPos":"LW","secondaryPos":"LM","country":"PAISES BAJOS","age":26,"overall":79,"price":{"value":20.5,"unit":"M"},"poolKey":"name_noa_lang"},{"id":"xls_8423217936710413677","name":"Kevin De Bruyne","pos":"CM/CAM","primaryPos":"CM","secondaryPos":"CAM","country":"BELGICA","age":34,"overall":87,"price":{"value":36.5,"unit":"M"},"poolKey":"name_kevin_de_bruyne"},{"id":"xls_8961621971635339753","name":"Noni Madueke","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"INGLATERRA","age":24,"overall":80,"price":{"value":30.0,"unit":"M"},"poolKey":"name_noni_madueke"},{"id":"xls_3617473184118493384","name":"Ivan Toney","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"INGLATERRA","age":30,"overall":82,"price":{"value":30.5,"unit":"M"},"poolKey":"name_ivan_toney"},{"id":"xls_4351107198703044421","name":"Agustín Marchesín","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ARGENTINA","age":38,"overall":75,"price":{"value":625.0,"unit":"K"},"poolKey":"name_agustin_marchesin"},{"id":"xls_379569962795781826","name":"Diogo Dalot","pos":"RB/LB/RM/CM","primaryPos":"RB","secondaryPos":"LB/RM/CM","country":"PORTUGAL","age":27,"overall":78,"price":{"value":15.0,"unit":"M"},"poolKey":"name_diogo_dalot"},{"id":"xls_417573333604851861","name":"Ayoze Pérez","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"ESPAÑA","age":32,"overall":81,"price":{"value":22.0,"unit":"M"},"poolKey":"name_ayoze_perez"},{"id":"xls_870629581295600619","name":"Cucho Hernández","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"COLOMBIA","age":27,"overall":79,"price":{"value":21.0,"unit":"M"},"poolKey":"name_cucho_hernandez"},{"id":"xls_5864410342493702172","name":"Johan Mojica","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"COLOMBIA","age":33,"overall":77,"price":{"value":7.5,"unit":"M"},"poolKey":"name_johan_mojica"},{"id":"xls_8850258340228973498","name":"Gabri Veiga","pos":"CAM/CM/LM","primaryPos":"CAM","secondaryPos":"CM/LM","country":"ESPAÑA","age":23,"overall":79,"price":{"value":35.0,"unit":"M"},"poolKey":"name_gabri_veiga"},{"id":"xls_5209494582278311595","name":"Federico Viñas","pos":"ST/RM/RW","primaryPos":"ST","secondaryPos":"RM/RW","country":"URUGUAY","age":27,"overall":75,"price":{"value":6.5,"unit":"M"},"poolKey":"name_federico_vinas"},{"id":"xls_7744940482255205614","name":"Nathan Tinsdale","pos":"CM/CAM/LM/CDM","primaryPos":"CM","secondaryPos":"CAM/LM/CDM","country":"INGLATERRA","age":21,"overall":59,"price":{"value":350.0,"unit":"K"},"poolKey":"name_nathan_tinsdale"},{"id":"xls_3667576954216756197","name":"Cathal McCarthy","pos":"CB/CDM","primaryPos":"CB","secondaryPos":"CDM","country":"IRLANDA","age":19,"overall":58,"price":{"value":475.0,"unit":"K"},"poolKey":"name_cathal_mccarthy"},{"id":"xls_6949142795743809649","name":"Dan-Axel Zagadou","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"FRANCIA","age":26,"overall":74,"price":{"value":4.9,"unit":"M"},"poolKey":"name_dan-axel_zagadou"},{"id":"xls_7849030585108733","name":"Julien Duranville","pos":"RM/LM/ST/RW","primaryPos":"RM","secondaryPos":"LM/ST/RW","country":"BELGICA","age":20,"overall":72,"price":{"value":5.5,"unit":"M"},"poolKey":"name_julien_duranville"},{"id":"xls_2475227805980639815","name":"Ivan Ilić","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"SERBIA","age":25,"overall":75,"price":{"value":8.0,"unit":"M"},"poolKey":"name_ivan_ilić"},{"id":"xls_3764049792457064148","name":"Denis Suárez","pos":"CM/LM/CAM/CDM","primaryPos":"CM","secondaryPos":"LM/CAM/CDM","country":"ESPAÑA","age":32,"overall":74,"price":{"value":3.5,"unit":"M"},"poolKey":"name_denis_suarez"},{"id":"xls_3120174010682274603","name":"Caio Henrique","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"BRASIL","age":28,"overall":77,"price":{"value":10.0,"unit":"M"},"poolKey":"name_caio_henrique"},{"id":"xls_5931987229134037572","name":"Aarón Ochoa","pos":"CAM/LM/ST/CM","primaryPos":"CAM","secondaryPos":"LM/ST/CM","country":"IRLANDA","age":19,"overall":65,"price":{"value":1.5,"unit":"M"},"poolKey":"name_aaron_ochoa"}],"Leeds United F.C.":[{"id":"xls_3117759373115494970","name":"Alphonse Areola","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"FRANCIA","age":33,"overall":76,"price":{"value":3.7,"unit":"M"},"poolKey":"name_alphonse_areola"},{"id":"xls_5828815537613673420","name":"Trent Alexander-Arnold","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"INGLATERRA","age":26,"overall":85,"price":{"value":58.0,"unit":"M"},"poolKey":"name_trent_alexander-arnold"},{"id":"xls_8041997978173682485","name":"Pascal Struijk","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PAISES BAJOS","age":26,"overall":76,"price":{"value":8.5,"unit":"M"},"poolKey":"name_pascal_struijk"},{"id":"xls_8763134633164058302","name":"Conor Gallagher","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"INGLATERRA","age":26,"overall":79,"price":{"value":22.0,"unit":"M"},"poolKey":"name_conor_gallagher"},{"id":"xls_4513129235163249636","name":"Jayden Bogle","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"INGLATERRA","age":25,"overall":76,"price":{"value":9.5,"unit":"M"},"poolKey":"name_jayden_bogle"},{"id":"xls_6975381095026241698","name":"Myles Lewis-Skelly","pos":"LB/CM","primaryPos":"LB","secondaryPos":"CM","country":"INGLATERRA","age":19,"overall":78,"price":{"value":28.0,"unit":"M"},"poolKey":"name_myles_lewis-skelly"},{"id":"xls_7964853502282462920","name":"Tyler Adams","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"USA","age":27,"overall":79,"price":{"value":19.5,"unit":"M"},"poolKey":"name_tyler_adams"},{"id":"xls_1904311974570209312","name":"Kevin Schade","pos":"LM/LW/ST","primaryPos":"LM","secondaryPos":"LW/ST","country":"ALEMANIA","age":24,"overall":79,"price":{"value":25.0,"unit":"M"},"poolKey":"name_kevin_schade"},{"id":"xls_4954447891712613012","name":"Dean Henderson","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"INGLATERRA","age":29,"overall":82,"price":{"value":24.0,"unit":"M"},"poolKey":"name_dean_henderson"},{"id":"xls_2120223364414682606","name":"James Maddison","pos":"CM/CAM","primaryPos":"CM","secondaryPos":"CAM","country":"INGLATERRA","age":29,"overall":83,"price":{"value":36.5,"unit":"M"},"poolKey":"name_james_maddison"},{"id":"xls_1712348976578087509","name":"Randal Kolo Muani","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"FRANCIA","age":27,"overall":79,"price":{"value":21.0,"unit":"M"},"poolKey":"name_randal_kolo_muani"},{"id":"xls_7377036993633937712","name":"Sam Johnstone","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"INGLATERRA","age":33,"overall":76,"price":{"value":3.7,"unit":"M"},"poolKey":"name_sam_johnstone"},{"id":"xls_6799854450757804552","name":"Fikayo Tomori","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":28,"overall":81,"price":{"value":27.5,"unit":"M"},"poolKey":"name_fikayo_tomori"},{"id":"xls_8494472813890929045","name":"Nikola Milenković","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SERBIA","age":28,"overall":80,"price":{"value":21.0,"unit":"M"},"poolKey":"name_nikola_milenković"},{"id":"xls_1828737729408422106","name":"Javi Puado","pos":"LW/ST/CAM/LM","primaryPos":"LW","secondaryPos":"ST/CAM/LM","country":"ESPAÑA","age":27,"overall":77,"price":{"value":11.0,"unit":"M"},"poolKey":"name_javi_puado"},{"id":"xls_5159516591173590805","name":"Takumi Minamino","pos":"LM/CAM/LW","primaryPos":"LM","secondaryPos":"CAM/LW","country":"JAPON","age":31,"overall":78,"price":{"value":13.5,"unit":"M"},"poolKey":"name_takumi_minamino"},{"id":"xls_6363996797473682104","name":"Eli Junior Kroupi","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"FRANCIA","age":19,"overall":78,"price":{"value":30.5,"unit":"M"},"poolKey":"name_eli_junior_kroupi"},{"id":"xls_5834191859219805613","name":"Danny Welbeck","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"INGLATERRA","age":35,"overall":80,"price":{"value":10.5,"unit":"M"},"poolKey":"name_danny_welbeck"},{"id":"xls_2798041641426432970","name":"Leif Davis","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"INGLATERRA","age":26,"overall":75,"price":{"value":7.0,"unit":"M"},"poolKey":"name_leif_davis"},{"id":"xls_5968007310236132042","name":"Lucas Martínez Quarta","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ARGENTINA","age":30,"overall":75,"price":{"value":4.7,"unit":"M"},"poolKey":"name_lucas_martinez_quarta"},{"id":"xls_2515781815530378478","name":"Ethan Pinnock","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"JAMAICA","age":32,"overall":75,"price":{"value":3.6,"unit":"M"},"poolKey":"name_ethan_pinnock"},{"id":"xls_42308101298501476","name":"Daniel James","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"GALES","age":28,"overall":76,"price":{"value":8.0,"unit":"M"},"poolKey":"name_daniel_james"},{"id":"xls_6127174625469623572","name":"Elliot Anderson","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"INGLATERRA","age":23,"overall":82,"price":{"value":40.5,"unit":"M"},"poolKey":"name_elliot_anderson"},{"id":"xls_5010728829308174052","name":"Victor Froholdt","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"DINAMARCA","age":20,"overall":79,"price":{"value":38.0,"unit":"M"},"poolKey":"name_victor_froholdt"},{"id":"xls_3428751227772985364","name":"Benjamin White","pos":"RB/CM","primaryPos":"RB","secondaryPos":"CM","country":"INGLATERRA","age":28,"overall":82,"price":{"value":29.5,"unit":"M"},"poolKey":"name_benjamin_white"},{"id":"xls_4730135577548089778","name":"Mason Mount","pos":"CAM/LW/CM","primaryPos":"CAM","secondaryPos":"LW/CM","country":"INGLATERRA","age":27,"overall":78,"price":{"value":16.5,"unit":"M"},"poolKey":"name_mason_mount"}],"FC Schalke 04":[{"id":"xls_2325923966318936377","name":"Wojciech Szczęsny","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"POLONIA","age":35,"overall":83,"price":{"value":4.0,"unit":"M"},"poolKey":"name_wojciech_szczęsny"},{"id":"xls_7341576024395664069","name":"Lucas Torreira","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"URUGUAY","age":29,"overall":82,"price":{"value":26.0,"unit":"M"},"poolKey":"name_lucas_torreira"},{"id":"xls_6999905958687569464","name":"Iliman Ndiaye","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"SENEGAL","age":25,"overall":82,"price":{"value":36.5,"unit":"M"},"poolKey":"name_iliman_ndiaye"},{"id":"xls_6863264419576034967","name":"Murillo","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"BRASIL","age":22,"overall":82,"price":{"value":40.0,"unit":"M"},"poolKey":"name_murillo"},{"id":"xls_8689024965558168147","name":"Andrej Kramarić","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"CROACIA","age":34,"overall":81,"price":{"value":12.0,"unit":"M"},"poolKey":"name_andrej_kramarić"},{"id":"xls_3073146372376105821","name":"Leon Goretzka","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ALEMANIA","age":30,"overall":81,"price":{"value":21.5,"unit":"M"},"poolKey":"name_leon_goretzka"},{"id":"xls_1629210156033015067","name":"Ronald Araujo","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"URUGUAY","age":26,"overall":81,"price":{"value":30.0,"unit":"M"},"poolKey":"name_ronald_araujo"},{"id":"xls_5698176142452755608","name":"Daniel Ceballos","pos":"CDM/CM/CAM","primaryPos":"CDM","secondaryPos":"CM/CAM","country":"ESPAÑA","age":28,"overall":80,"price":{"value":21.0,"unit":"M"},"poolKey":"name_daniel_ceballos"},{"id":"xls_4867247617855676927","name":"Mario Götze","pos":"CM/CAM","primaryPos":"CM","secondaryPos":"CAM","country":"ALEMANIA","age":33,"overall":78,"price":{"value":8.5,"unit":"M"},"poolKey":"name_mario_götze"},{"id":"xls_8004320075395100566","name":"Alexis Vega","pos":"LW/ST/LM","primaryPos":"LW","secondaryPos":"ST/LM","country":"MEXICO","age":27,"overall":78,"price":null,"poolKey":"name_alexis_vega"},{"id":"xls_1702197937332626276","name":"Darwin Núñez","pos":"ST/LW/LM","primaryPos":"ST","secondaryPos":"LW/LM","country":"URUGUAY","age":26,"overall":78,"price":{"value":18.5,"unit":"M"},"poolKey":"name_darwin_nunez"},{"id":"xls_4620443833710626347","name":"Patrik Hrošovský","pos":"CM/CAM/CDM","primaryPos":"CM","secondaryPos":"CAM/CDM","country":"ESLOVAQUIA","age":33,"overall":77,"price":{"value":6.5,"unit":"M"},"poolKey":"name_patrik_hrošovský"},{"id":"xls_7551835483228950289","name":"Miroslav Stevanović","pos":"RM/CAM/RW","primaryPos":"RM","secondaryPos":"CAM/RW","country":"BOSNIA & HERZEGOVINA","age":34,"overall":74,"price":{"value":2.0,"unit":"M"},"poolKey":"name_miroslav_stevanović"},{"id":"xls_8814377874035279653","name":"Leonardo Bittencourt","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ALEMANIA","age":31,"overall":73,"price":{"value":2.5,"unit":"M"},"poolKey":"name_leonardo_bittencourt"},{"id":"xls_5937341812063146147","name":"Ximo Navarro","pos":"RB/LB","primaryPos":"RB","secondaryPos":"LB","country":"ESPAÑA","age":35,"overall":72,"price":{"value":725.0,"unit":"K"},"poolKey":"name_ximo_navarro"},{"id":"xls_1203718384566062227","name":"Anthony Jung","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ALEMANIA","age":33,"overall":71,"price":{"value":900.0,"unit":"K"},"poolKey":"name_anthony_jung"},{"id":"xls_1511970085456853027","name":"Dominique Heintz","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ALEMANIA","age":31,"overall":72,"price":{"value":1.6,"unit":"M"},"poolKey":"name_dominique_heintz"},{"id":"xls_3490970321444288477","name":"Ethan Mbappé","pos":"RM/CM/RW","primaryPos":"RM","secondaryPos":"CM/RW","country":"FRANCIA","age":19,"overall":72,"price":{"value":4.9,"unit":"M"},"poolKey":"name_ethan_mbappe"},{"id":"xls_8463493093668713907","name":"Idrissa Touré","pos":"RM/RB","primaryPos":"RM","secondaryPos":"RB","country":"ALEMANIA","age":27,"overall":71,"price":{"value":2.0,"unit":"M"},"poolKey":"name_idrissa_toure"},{"id":"xls_5722687107574081407","name":"Esteban Andrada","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ARGENTINA","age":34,"overall":69,"price":{"value":240.0,"unit":"K"},"poolKey":"name_esteban_andrada"},{"id":"xls_782323510499267164","name":"Viktor Claesson","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"SUECIA","age":33,"overall":69,"price":{"value":900.0,"unit":"K"},"poolKey":"name_viktor_claesson"},{"id":"xls_3043097432446773150","name":"Robin Knoche","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ALEMANIA","age":33,"overall":70,"price":{"value":750.0,"unit":"K"},"poolKey":"name_robin_knoche"},{"id":"xls_5658987614453009902","name":"Aleksandar Pešić","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"SERBIA","age":33,"overall":70,"price":{"value":1.0,"unit":"M"},"poolKey":"name_aleksandar_pešić"},{"id":"xls_9113434128382522290","name":"Christian Comotto","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ITALIA","age":18,"overall":64,"price":{"value":1.5,"unit":"M"},"poolKey":"name_christian_comotto"},{"id":"xls_6821055391946757644","name":"Louis Page","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"INGLATERRA","age":17,"overall":64,"price":{"value":1.6,"unit":"M"},"poolKey":"name_louis_page"},{"id":"xls_8523015110556702721","name":"Bailey Rice","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ESCOCIA","age":19,"overall":61,"price":{"value":850.0,"unit":"K"},"poolKey":"name_bailey_rice"}],"Wolverhampton Wanderers FC":[{"id":"xls_4662404771340467552","name":"Lucas Chevalier","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"FRANCIA","age":24,"overall":82,"price":{"value":34.5,"unit":"M"},"poolKey":"name_lucas_chevalier"},{"id":"xls_128540123737418913","name":"Álvaro Carreras","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ESPAÑA","age":22,"overall":81,"price":{"value":49.5,"unit":"M"},"poolKey":"name_alvaro_carreras"},{"id":"xls_7036171250512156703","name":"Diogo Leite","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PORTUGAL","age":27,"overall":76,"price":{"value":8.5,"unit":"M"},"poolKey":"name_diogo_leite"},{"id":"xls_112886687107340244","name":"Milan Škriniar","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESLOVAQUIA","age":31,"overall":81,"price":{"value":21.0,"unit":"M"},"poolKey":"name_milan_škriniar"},{"id":"xls_7213096612785115353","name":"Costinha","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"PORTUGAL","age":26,"overall":75,"price":{"value":7.5,"unit":"M"},"poolKey":"name_costinha"},{"id":"xls_4742117480414171463","name":"João Moutinho","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"PORTUGAL","age":39,"overall":77,"price":{"value":3.3,"unit":"M"},"poolKey":"name_joão_moutinho"},{"id":"xls_5823609064769232081","name":"Alexander Djiku","pos":"CB/CDM","primaryPos":"CB","secondaryPos":"CDM","country":"GHANA","age":31,"overall":77,"price":null,"poolKey":"name_alexander_djiku"},{"id":"xls_3625403446748252996","name":"Alex Iwobi","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"NIGERIA","age":30,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_alex_iwobi"},{"id":"xls_178628809470636245","name":"Charles De Ketelaere","pos":"CAM/ST/CM","primaryPos":"CAM","secondaryPos":"ST/CM","country":"BELGICA","age":25,"overall":82,"price":{"value":43.5,"unit":"M"},"poolKey":"name_charles_de_ketelaere"},{"id":"xls_4062613091341843800","name":"Joelinton","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"BRASIL","age":29,"overall":81,"price":{"value":25.5,"unit":"M"},"poolKey":"name_joelinton"},{"id":"xls_4736882093600584122","name":"Jarell Quansah","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"INGLATERRA","age":23,"overall":76,"price":{"value":15.5,"unit":"M"},"poolKey":"name_jarell_quansah"},{"id":"xls_462536523547744067","name":"José Sá","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"PORTUGAL","age":33,"overall":76,"price":{"value":3.7,"unit":"M"},"poolKey":"name_jose_sa"},{"id":"xls_8874126341676799220","name":"Edin Džeko","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"BOSNIA & HERZEGOVINA","age":40,"overall":79,"price":{"value":6.0,"unit":"M"},"poolKey":"name_edin_džeko"},{"id":"xls_2204302475675531653","name":"Luka Vušković","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"CROACIA","age":19,"overall":78,"price":{"value":27.5,"unit":"M"},"poolKey":"name_luka_vušković"},{"id":"xls_8128367568441678111","name":"Jack Grealish","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"INGLATERRA","age":30,"overall":82,"price":{"value":30.0,"unit":"M"},"poolKey":"name_jack_grealish"},{"id":"xls_7077068482678692144","name":"Malik Tillman","pos":"CAM/CM/LW","primaryPos":"CAM","secondaryPos":"CM/LW","country":"USA","age":23,"overall":79,"price":{"value":26.5,"unit":"M"},"poolKey":"name_malik_tillman"},{"id":"xls_4935660419005805580","name":"Jerónimo Domina","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ARGENTINA","age":20,"overall":67,"price":{"value":2.2,"unit":"M"},"poolKey":"name_jeronimo_domina"},{"id":"xls_3566295433925626888","name":"Liam Delap","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"INGLATERRA","age":23,"overall":77,"price":{"value":17.0,"unit":"M"},"poolKey":"name_liam_delap"},{"id":"xls_771157474153708510","name":"Tidiam Gomis","pos":"LM/RM/ST/LW","primaryPos":"LM","secondaryPos":"RM/ST/LW","country":"FRANCIA","age":19,"overall":70,"price":{"value":3.7,"unit":"M"},"poolKey":"name_tidiam_gomis"},{"id":"xls_4870722428748566543","name":"Pablo García","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"ESPAÑA","age":19,"overall":70,"price":{"value":3.8,"unit":"M"},"poolKey":"name_pablo_garcia"},{"id":"xls_2246461128642552821","name":"Maher Carrizo","pos":"RM/RW/CAM","primaryPos":"RM","secondaryPos":"RW/CAM","country":"ARGENTINA","age":20,"overall":74,"price":{"value":9.0,"unit":"M"},"poolKey":"name_maher_carrizo"},{"id":"xls_5557388518585240765","name":"Jota Silva","pos":"RM/LM/ST/RW","primaryPos":"RM","secondaryPos":"LM/ST/RW","country":"PORTUGAL","age":26,"overall":73,"price":{"value":3.6,"unit":"M"},"poolKey":"name_jota_silva"},{"id":"xls_7988732838689425691","name":"Rayan Cherki","pos":"RW/RM/CAM","primaryPos":"RW","secondaryPos":"RM/CAM","country":"FRANCIA","age":22,"overall":84,"price":{"value":61.5,"unit":"M"},"poolKey":"name_rayan_cherki"},{"id":"xls_1728628173399896255","name":"Rodrigo Mora","pos":"CAM/LW/CM/ST","primaryPos":"CAM","secondaryPos":"LW/CM/ST","country":"PORTUGAL","age":19,"overall":77,"price":{"value":24.5,"unit":"M"},"poolKey":"name_rodrigo_mora"},{"id":"xls_2528924961346324660","name":"Kyle Walker","pos":"RB/CM","primaryPos":"RB","secondaryPos":"CM","country":"INGLATERRA","age":35,"overall":77,"price":{"value":3.2,"unit":"M"},"poolKey":"name_kyle_walker"},{"id":"xls_5786904552927738330","name":"Chemsdine Talbi","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"MARRUECOS","age":21,"overall":76,"price":{"value":16.5,"unit":"M"},"poolKey":"name_chemsdine_talbi"}],"Leicester City FC":[{"id":"xls_3318544603013438705","name":"Wladimiro Falcone","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ITALIA","age":30,"overall":82,"price":{"value":20.5,"unit":"M"},"poolKey":"name_wladimiro_falcone"},{"id":"xls_236868458314875182","name":"Ola Aina","pos":"RB/LB/RM","primaryPos":"RB","secondaryPos":"LB/RM","country":"NIGERIA","age":28,"overall":80,"price":{"value":19.0,"unit":"M"},"poolKey":"name_ola_aina"},{"id":"xls_1269840199170875418","name":"Ethan Nwaneri","pos":"RW/CAM/RM","primaryPos":"RW","secondaryPos":"CAM/RM","country":"INGLATERRA","age":19,"overall":76,"price":{"value":16.0,"unit":"M"},"poolKey":"name_ethan_nwaneri"},{"id":"xls_6130701830887115381","name":"John Stones","pos":"CB/RB/CDM","primaryPos":"CB","secondaryPos":"RB/CDM","country":"INGLATERRA","age":31,"overall":82,"price":{"value":21.0,"unit":"M"},"poolKey":"name_john_stones"},{"id":"xls_2294100414868930518","name":"Francisco Trincão","pos":"CAM/RM/RW/ST","primaryPos":"CAM","secondaryPos":"RM/RW/ST","country":"PORTUGAL","age":25,"overall":83,"price":{"value":45.5,"unit":"M"},"poolKey":"name_francisco_trincão"},{"id":"xls_2588522394624201932","name":"Odilon Kossounou","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"COSTA DE MARFIL","age":24,"overall":80,"price":{"value":29.0,"unit":"M"},"poolKey":"name_odilon_kossounou"},{"id":"xls_4842774368418554194","name":"Moïse Bombito","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"CANADA","age":25,"overall":75,"price":{"value":7.5,"unit":"M"},"poolKey":"name_moïse_bombito"},{"id":"xls_4343916753722723491","name":"Christopher Nkunku","pos":"CAM/LM/ST/CM","primaryPos":"CAM","secondaryPos":"LM/ST/CM","country":"FRANCIA","age":27,"overall":81,"price":{"value":27.5,"unit":"M"},"poolKey":"name_christopher_nkunku"},{"id":"xls_6842143731594711927","name":"Sandro Tonali","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ITALIA","age":25,"overall":85,"price":{"value":60.5,"unit":"M"},"poolKey":"name_sandro_tonali"},{"id":"xls_3955229829005048199","name":"Jack Hinshelwood","pos":"CDM/RWB/CM","primaryPos":"CDM","secondaryPos":"RWB/CM","country":"INGLATERRA","age":21,"overall":76,"price":{"value":15.5,"unit":"M"},"poolKey":"name_jack_hinshelwood"},{"id":"xls_7124702251065084221","name":"Georges Mikautadze","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"GEORGIA","age":24,"overall":79,"price":{"value":27.0,"unit":"M"},"poolKey":"name_georges_mikautadze"},{"id":"xls_578985512782207415","name":"Raúl Rangel","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"MEXICO","age":26,"overall":76,"price":null,"poolKey":"name_raul_rangel"},{"id":"xls_7104567596129031193","name":"Nico O'Reilly","pos":"LB/CM","primaryPos":"LB","secondaryPos":"CM","country":"INGLATERRA","age":21,"overall":81,"price":{"value":35.5,"unit":"M"},"poolKey":"name_nico_o'reilly"},{"id":"xls_8537099041310922830","name":"Georgios Vagiannidis","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"GRECIA","age":23,"overall":75,"price":{"value":8.5,"unit":"M"},"poolKey":"name_georgios_vagiannidis"},{"id":"xls_1911845787974055918","name":"Jonathan Rowe","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"INGLATERRA","age":22,"overall":75,"price":{"value":11.5,"unit":"M"},"poolKey":"name_jonathan_rowe"},{"id":"xls_1469742385194477388","name":"Tiago Palacios","pos":"RM/CAM/RW","primaryPos":"RM","secondaryPos":"CAM/RW","country":"URUGUAY","age":24,"overall":75,"price":{"value":7.5,"unit":"M"},"poolKey":"name_tiago_palacios"},{"id":"xls_6132235704024526652","name":"Conrad Harder","pos":"ST/CAM/LW","primaryPos":"ST","secondaryPos":"CAM/LW","country":"DINAMARCA","age":21,"overall":75,"price":{"value":12.5,"unit":"M"},"poolKey":"name_conrad_harder"},{"id":"xls_704552612377528819","name":"Dayro Moreno","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"COLOMBIA","age":39,"overall":75,"price":{"value":1.9,"unit":"M"},"poolKey":"name_dayro_moreno"},{"id":"xls_1442172807331693642","name":"Boulaye Dia","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"SENEGAL","age":28,"overall":78,"price":{"value":14.5,"unit":"M"},"poolKey":"name_boulaye_dia"},{"id":"xls_1744073669592470506","name":"Teden Mengi","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ANGOLA","age":23,"overall":69,"price":{"value":2.9,"unit":"M"},"poolKey":"name_teden_mengi"},{"id":"xls_1178157030659472900","name":"El Chadaille Bitshiabu","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"FRANCIA","age":20,"overall":75,"price":{"value":11.5,"unit":"M"},"poolKey":"name_el_chadaille_bitshiabu"},{"id":"xls_397429055506533066","name":"Givairo Read","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"PAISES BAJOS","age":19,"overall":76,"price":{"value":17.0,"unit":"M"},"poolKey":"name_givairo_read"},{"id":"xls_2533712934501078730","name":"Tim Iroegbunam","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"INGLATERRA","age":22,"overall":76,"price":{"value":10.0,"unit":"M"},"poolKey":"name_tim_iroegbunam"},{"id":"xls_3955229829005048199","name":"Jack Hinshelwood","pos":"CDM/RB/LB/CM","primaryPos":"CDM","secondaryPos":"RB/LB/CM","country":"INGLATERRA","age":21,"overall":76,"price":{"value":15.5,"unit":"M"},"poolKey":"name_jack_hinshelwood"},{"id":"xls_5867405804933406633","name":"Eberechi Eze","pos":"CAM/CM/LW","primaryPos":"CAM","secondaryPos":"CM/LW","country":"INGLATERRA","age":27,"overall":84,"price":{"value":48.5,"unit":"M"},"poolKey":"name_eberechi_eze"},{"id":"xls_4088906936512007347","name":"Lewis Miley","pos":"CM/RWB/CDM","primaryPos":"CM","secondaryPos":"RWB/CDM","country":"INGLATERRA","age":20,"overall":76,"price":{"value":16.0,"unit":"M"},"poolKey":"name_lewis_miley"}],"Lens":[{"id":"xls_6240930379777019357","name":"Mike Maignan","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"FRANCIA","age":29,"overall":87,"price":{"value":61.0,"unit":"M"},"poolKey":"name_mike_maignan"},{"id":"xls_4358004415594613590","name":"Theo Hernández","pos":"LB/LM/CM","primaryPos":"LB","secondaryPos":"LM/CM","country":"FRANCIA","age":27,"overall":84,"price":{"value":40.5,"unit":"M"},"poolKey":"name_theo_hernandez"},{"id":"xls_5758221114083672195","name":"Mathys Tel","pos":"ST/LW/LM/CAM","primaryPos":"ST","secondaryPos":"LW/LM/CAM","country":"FRANCIA","age":21,"overall":77,"price":{"value":23.5,"unit":"M"},"poolKey":"name_mathys_tel"},{"id":"xls_6040105408224161320","name":"Iñigo Martínez","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"ESPAÑA","age":34,"overall":84,"price":{"value":13.5,"unit":"M"},"poolKey":"name_inigo_martinez"},{"id":"xls_2937793610976722326","name":"James Rodríguez","pos":"CAM/RM/CM","primaryPos":"CAM","secondaryPos":"RM/CM","country":"COLOMBIA","age":33,"overall":80,"price":{"value":13.0,"unit":"M"},"poolKey":"name_james_rodriguez"},{"id":"xls_1682949897617666456","name":"Moussa Diaby","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"FRANCIA","age":25,"overall":83,"price":{"value":43.5,"unit":"M"},"poolKey":"name_moussa_diaby"},{"id":"xls_4684355971661193878","name":"Hakan Çalhanoğlu","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"TURQUIA","age":31,"overall":86,"price":{"value":47.5,"unit":"M"},"poolKey":"name_hakan_çalhanoğlu"},{"id":"xls_8957910683293207439","name":"Rafael Leão","pos":"LW/LM/ST","primaryPos":"LW","secondaryPos":"LM/ST","country":"PORTUGAL","age":26,"overall":84,"price":{"value":49.5,"unit":"M"},"poolKey":"name_rafael_leão"},{"id":"xls_3523007300043866043","name":"Daniel Carvajal","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"ESPAÑA","age":33,"overall":84,"price":{"value":22.0,"unit":"M"},"poolKey":"name_daniel_carvajal"},{"id":"xls_2871289815918234067","name":"Robert Lewandowski","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"POLONIA","age":36,"overall":86,"price":{"value":23.0,"unit":"M"},"poolKey":"name_robert_lewandowski"},{"id":"xls_2698507170086059505","name":"Paulo Dybala","pos":"CAM/ST","primaryPos":"CAM","secondaryPos":"ST","country":"ARGENTINA","age":31,"overall":85,"price":{"value":44.5,"unit":"M"},"poolKey":"name_paulo_dybala"},{"id":"xls_1011359384206379771","name":"Martin Dúbravka","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ESLOVAQUIA","age":36,"overall":78,"price":{"value":1.6,"unit":"M"},"poolKey":"name_martin_dubravka"},{"id":"xls_8337276717708962734","name":"Lucas Vázquez","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"ESPAÑA","age":34,"overall":77,"price":{"value":3.9,"unit":"M"},"poolKey":"name_lucas_vazquez"},{"id":"xls_1685622130484247896","name":"Florian Thauvin","pos":"RW/ST/RM","primaryPos":"RW","secondaryPos":"ST/RM","country":"FRANCIA","age":32,"overall":81,"price":{"value":20.5,"unit":"M"},"poolKey":"name_florian_thauvin"},{"id":"xls_1296863195221464990","name":"Ibrahima Konaté","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"FRANCIA","age":26,"overall":84,"price":{"value":43.5,"unit":"M"},"poolKey":"name_ibrahima_konate"},{"id":"xls_5376138304358224842","name":"Dante","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"BRASIL","age":41,"overall":75,"price":null,"poolKey":"name_dante"},{"id":"xls_153363132674447598","name":"Éver Banega","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"ARGENTINA","age":37,"overall":77,"price":{"value":3.3,"unit":"M"},"poolKey":"name_ever_banega"},{"id":"xls_4040246142709897725","name":"Assane Diao","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"SENEGAL","age":20,"overall":76,"price":{"value":16.0,"unit":"M"},"poolKey":"name_assane_diao"},{"id":"xls_2089449841237938546","name":"Pacha Espino","pos":"LB/CM","primaryPos":"LB","secondaryPos":"CM","country":"URUGUAY","age":33,"overall":72,"price":{"value":1.2,"unit":"M"},"poolKey":"name_pacha_espino"},{"id":"xls_2215507484135127758","name":"Mateus Uribe","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"COLOMBIA","age":34,"overall":75,"price":{"value":2.6,"unit":"M"},"poolKey":"name_mateus_uribe"},{"id":"xls_7398980518025191550","name":"Germán Pezzella","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ITALIA","age":34,"overall":73,"price":{"value":1.0,"unit":"M"},"poolKey":"name_german_pezzella"},{"id":"xls_5806495989708012338","name":"Juan Cuadrado","pos":"RM/RWB/RW","primaryPos":"RM","secondaryPos":"RWB/RW","country":"COLOMBIA","age":37,"overall":75,"price":{"value":1.8,"unit":"M"},"poolKey":"name_juan_cuadrado"},{"id":"xls_8693457860870041552","name":"Steven Nzonzi","pos":"CM","primaryPos":"CM","secondaryPos":null,"country":"FRANCIA","age":36,"overall":69,"price":{"value":275.0,"unit":"K"},"poolKey":"name_steven_nzonzi"},{"id":"xls_6308194991344657295","name":"José Fonte","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PORTUGAL","age":41,"overall":71,"price":null,"poolKey":"name_jose_fonte"},{"id":"xls_1655039100526990495","name":"Bogdan Mykhailichenko","pos":"LB/RB","primaryPos":"LB","secondaryPos":"RB","country":"UCRANIA","age":29,"overall":72,"price":null,"poolKey":"name_bogdan_mykhailichenko"},{"id":"xls_147573228843963827","name":"Tijjani Reijnders","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"PAISES BAJOS","age":26,"overall":85,"price":{"value":63.0,"unit":"M"},"poolKey":"name_tijjani_reijnders"}],"Rayo Vallecano de Madrid S.A.D.":[{"id":"xls_4765318983470600022","name":"Giorgi Mamardashvili","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"GEORGIA","age":24,"overall":83,"price":{"value":38.5,"unit":"M"},"poolKey":"name_giorgi_mamardashvili"},{"id":"xls_7155941891634023863","name":"Alejandro Balde","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ESPAÑA","age":21,"overall":83,"price":{"value":49.5,"unit":"M"},"poolKey":"name_alejandro_balde"},{"id":"xls_5843293910461938175","name":"Maxence Lacroix","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"FRANCIA","age":25,"overall":81,"price":{"value":28.5,"unit":"M"},"poolKey":"name_maxence_lacroix"},{"id":"xls_2407070275907693843","name":"Mario Gila","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":24,"overall":81,"price":{"value":31.5,"unit":"M"},"poolKey":"name_mario_gila"},{"id":"xls_23891279678517123","name":"Pierre Kalulu","pos":"CB/RB/RM/CM","primaryPos":"CB","secondaryPos":"RB/RM/CM","country":"FRANCIA","age":25,"overall":80,"price":{"value":28.0,"unit":"M"},"poolKey":"name_pierre_kalulu"},{"id":"xls_218882147428744168","name":"Álvaro García","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"ESPAÑA","age":32,"overall":81,"price":{"value":20.5,"unit":"M"},"poolKey":"name_alvaro_garcia"},{"id":"xls_6631148255625314445","name":"Savinho","pos":"RW/LW/RM","primaryPos":"RW","secondaryPos":"LW/RM","country":"BRASIL","age":21,"overall":81,"price":{"value":39.5,"unit":"M"},"poolKey":"name_savinho"},{"id":"xls_1799325248739751282","name":"Denis Zakaria","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"SUIZA","age":28,"overall":81,"price":{"value":22.5,"unit":"M"},"poolKey":"name_denis_zakaria"},{"id":"xls_916002993862281453","name":"Iñaki Williams","pos":"RM/ST/RW","primaryPos":"RM","secondaryPos":"ST/RW","country":"GHANA","age":31,"overall":81,"price":{"value":21.5,"unit":"M"},"poolKey":"name_inaki_williams"},{"id":"xls_777916713747447827","name":"Justin Kluivert","pos":"CAM/LM/CM","primaryPos":"CAM","secondaryPos":"LM/CM","country":"PAISES BAJOS","age":26,"overall":79,"price":{"value":20.5,"unit":"M"},"poolKey":"name_justin_kluivert"},{"id":"xls_8937447835979535495","name":"Ademola Lookman","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"NIGERIA","age":27,"overall":83,"price":{"value":39.5,"unit":"M"},"poolKey":"name_ademola_lookman"},{"id":"xls_8633807296570524956","name":"Guillermo Ochoa","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"MEXICO","age":39,"overall":74,"price":null,"poolKey":"name_guillermo_ochoa"},{"id":"xls_2676247449827600963","name":"Patrick van Aanholt","pos":"LB/CM","primaryPos":"LB","secondaryPos":"CM","country":"PAISES BAJOS","age":34,"overall":69,"price":{"value":500.0,"unit":"K"},"poolKey":"name_patrick_van_aanholt"},{"id":"xls_1236260288989192868","name":"Alexander Bah","pos":"LB/RM","primaryPos":"LB","secondaryPos":"RM","country":"DINAMARCA","age":27,"overall":77,"price":{"value":10.0,"unit":"M"},"poolKey":"name_alexander_bah"},{"id":"xls_6185723410429776550","name":"Exequiel Palacios","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ARGENTINA","age":26,"overall":83,"price":{"value":39.5,"unit":"M"},"poolKey":"name_exequiel_palacios"},{"id":"xls_2408223673719111685","name":"André-Franck Zambo Anguissa","pos":"CM/CAM","primaryPos":"CM","secondaryPos":"CAM","country":"CAMERUN","age":29,"overall":83,"price":{"value":35.5,"unit":"M"},"poolKey":"name_andre-franck_zambo_anguissa"},{"id":"xls_8821808981911724583","name":"Gerard Moreno","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"ESPAÑA","age":33,"overall":81,"price":{"value":16.5,"unit":"M"},"poolKey":"name_gerard_moreno"},{"id":"xls_5639812413384190829","name":"Jérémy Doku","pos":"LW/RW/LM","primaryPos":"LW","secondaryPos":"RW/LM","country":"BELGICA","age":23,"overall":83,"price":{"value":49.5,"unit":"M"},"poolKey":"name_jeremy_doku"},{"id":"xls_1823807580177049312","name":"Pau Navarro","pos":"LB/CB/CDM","primaryPos":"LB","secondaryPos":"CB/CDM","country":"ESPAÑA","age":21,"overall":73,"price":{"value":6.0,"unit":"M"},"poolKey":"name_pau_navarro"},{"id":"xls_4698032426930295772","name":"Josh Acheampong","pos":"CB/RB/CDM/CM","primaryPos":"CB","secondaryPos":"RB/CDM/CM","country":"INGLATERRA","age":20,"overall":74,"price":{"value":8.5,"unit":"M"},"poolKey":"name_josh_acheampong"},{"id":"xls_5837496804168366028","name":"Pedro Fernández \"Dro\"","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"ESPAÑA","age":18,"overall":70,"price":{"value":3.6,"unit":"M"},"poolKey":"name_pedro_fernández_\"dro\""},{"id":"xls_8119553015768226994","name":"Jorthy Mokio","pos":"CDM/CM/LB/CB","primaryPos":"CDM","secondaryPos":"CM/LB/CB","country":"BELGICA","age":18,"overall":70,"price":{"value":3.8,"unit":"M"},"poolKey":"name_jorthy_mokio"},{"id":"xls_2943377397136835646","name":"Konstantinos Karetsas","pos":"CF/RW/CM","primaryPos":"CF","secondaryPos":"RW/CM","country":"GRECIA","age":18,"overall":74,"price":{"value":9.5,"unit":"M"},"poolKey":"name_konstantinos_karetsas"},{"id":"xls_3243523340496984515","name":"Roony Bardghji","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"SUECIA","age":20,"overall":74,"price":{"value":10.0,"unit":"M"},"poolKey":"name_roony_bardghji"},{"id":"xls_4568596565286976321","name":"Samuel Omorodion","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ESPAÑA","age":21,"overall":79,"price":{"value":39.5,"unit":"M"},"poolKey":"name_samuel_omorodion"},{"id":"xls_1586484512359607130","name":"Almoez Ali","pos":"ST/RW/RM","primaryPos":"ST","secondaryPos":"RW/RM","country":"CATAR","age":29,"overall":73,"price":null,"poolKey":"name_almoez_ali"}],"RB Leipzig":[{"id":"xls_3752572263718277297","name":"Lukáš Hrádecký","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"FINLANDIA","age":35,"overall":80,"price":{"value":2.3,"unit":"M"},"poolKey":"name_lukaš_hradecký"},{"id":"xls_877518912832536325","name":"Yann Aurel Bisseck","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ALEMANIA","age":24,"overall":76,"price":{"value":9.5,"unit":"M"},"poolKey":"name_yann_aurel_bisseck"},{"id":"xls_2637374325598546070","name":"Dominik Kohr","pos":"CB/CDM","primaryPos":"CB","secondaryPos":"CDM","country":"ALEMANIA","age":31,"overall":76,"price":{"value":5.0,"unit":"M"},"poolKey":"name_dominik_kohr"},{"id":"xls_1256108465696916705","name":"Kieran Trippier","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"INGLATERRA","age":34,"overall":79,"price":{"value":6.5,"unit":"M"},"poolKey":"name_kieran_trippier"},{"id":"xls_7455527455300704854","name":"Vanderson","pos":"RB/RM/CM","primaryPos":"RB","secondaryPos":"RM/CM","country":"BRASIL","age":24,"overall":77,"price":{"value":15.5,"unit":"M"},"poolKey":"name_vanderson"},{"id":"xls_2763655840044884666","name":"Jonathan Burkardt","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ALEMANIA","age":24,"overall":82,"price":{"value":42.0,"unit":"M"},"poolKey":"name_jonathan_burkardt"},{"id":"xls_3745755955428735619","name":"Carlos Rodríguez","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"MEXICO","age":29,"overall":75,"price":null,"poolKey":"name_carlos_rodriguez"},{"id":"xls_2754328080319565699","name":"Fabian Schär","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SUIZA","age":33,"overall":82,"price":{"value":14.5,"unit":"M"},"poolKey":"name_fabian_schär"},{"id":"xls_1172634523583552967","name":"Antonio Nusa","pos":"LM/CAM/LW","primaryPos":"LM","secondaryPos":"CAM/LW","country":"NORUEGA","age":21,"overall":78,"price":{"value":31.0,"unit":"M"},"poolKey":"name_antonio_nusa"},{"id":"xls_8241356548644898831","name":"Edin Višća","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"BOSNIA & HERZEGOVINA","age":35,"overall":74,"price":{"value":1.7,"unit":"M"},"poolKey":"name_edin_višća"},{"id":"xls_3340773121307462151","name":"Unai Simón","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ESPAÑA","age":28,"overall":84,"price":{"value":33.5,"unit":"M"},"poolKey":"name_unai_simon"},{"id":"xls_493113284136023099","name":"Thiago Santamaría","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"ARGENTINA","age":22,"overall":68,"price":{"value":2.6,"unit":"M"},"poolKey":"name_thiago_santamaria"},{"id":"xls_7407597657051657885","name":"Víctor Gómez","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"ESPAÑA","age":25,"overall":77,"price":{"value":13.0,"unit":"M"},"poolKey":"name_victor_gomez"},{"id":"xls_8993978072796400482","name":"Omari Hutchinson","pos":"RM/CAM/RW","primaryPos":"RM","secondaryPos":"CAM/RW","country":"INGLATERRA","age":21,"overall":76,"price":{"value":17.0,"unit":"M"},"poolKey":"name_omari_hutchinson"},{"id":"xls_4273498979600866565","name":"Maghnes Akliouche","pos":"RM/CAM/RW","primaryPos":"RM","secondaryPos":"CAM/RW","country":"FRANCIA","age":23,"overall":80,"price":{"value":33.5,"unit":"M"},"poolKey":"name_maghnes_akliouche"},{"id":"xls_8778307212911335997","name":"Jan-Niklas Beste","pos":"RM/LM/RW","primaryPos":"RM","secondaryPos":"LM/RW","country":"ALEMANIA","age":26,"overall":76,"price":{"value":8.0,"unit":"M"},"poolKey":"name_jan-niklas_beste"},{"id":"xls_729240711088060450","name":"André Lacximicant","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"PORTUGAL","age":24,"overall":68,"price":{"value":1.8,"unit":"M"},"poolKey":"name_andre_lacximicant"},{"id":"xls_7593860574026834112","name":"Richard Kone","pos":"ST/CAM/CM","primaryPos":"ST","secondaryPos":"CAM/CM","country":"COSTA DE MARFIL","age":21,"overall":70,"price":{"value":3.6,"unit":"M"},"poolKey":"name_richard_kone"},{"id":"xls_8336990210561448384","name":"Anrie Chase","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"JAPON","age":21,"overall":66,"price":{"value":1.8,"unit":"M"},"poolKey":"name_anrie_chase"},{"id":"xls_5688518242720038820","name":"Luca Martínez Dupuy","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"MEXICO","age":24,"overall":67,"price":{"value":2.1,"unit":"M"},"poolKey":"name_luca_martinez_dupuy"},{"id":"xls_898774131266815040","name":"Alex Douglas","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"SUECIA","age":23,"overall":68,"price":{"value":1.7,"unit":"M"},"poolKey":"name_alex_douglas"},{"id":"xls_1533537590569258674","name":"Folarin Balogun","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"USA","age":23,"overall":79,"price":{"value":25.5,"unit":"M"},"poolKey":"name_folarin_balogun"},{"id":"xls_8661007358922570520","name":"Yaya Fofana","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"COSTA DE MARFIL","age":21,"overall":67,"price":{"value":2.3,"unit":"M"},"poolKey":"name_yaya_fofana"},{"id":"xls_262477223368915963","name":"Amadou Koné","pos":"CDM/CM/CB","primaryPos":"CDM","secondaryPos":"CM/CB","country":"COSTA DE MARFIL","age":20,"overall":70,"price":{"value":3.3,"unit":"M"},"poolKey":"name_amadou_kone"},{"id":"xls_8632304131718700608","name":"Rúben Dias","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PORTUGAL","age":28,"overall":87,"price":{"value":68.5,"unit":"M"},"poolKey":"name_ruben_dias"},{"id":"xls_7669399895762300350","name":"Ian Subiabre","pos":"LW/RW/ST/LM","primaryPos":"LW","secondaryPos":"RW/ST/LM","country":"ARGENTINA","age":19,"overall":70,"price":{"value":3.7,"unit":"M"},"poolKey":"name_ian_subiabre"}],"Club Atlético Independiente":[{"id":"xls_4268150258879631276","name":"Anatoliy Trubin","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"UCRANIA","age":23,"overall":80,"price":{"value":36.0,"unit":"M"},"poolKey":"name_anatoliy_trubin"},{"id":"xls_7880472274089500685","name":"Enaldo Praz","pos":"LB","primaryPos":"LB","secondaryPos":null,"country":"BRASIL","age":37,"overall":75,"price":{"value":1.2,"unit":"M"},"poolKey":"name_enaldo_praz"},{"id":"xls_976488659007939002","name":"Juan Foyth","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ARGENTINA","age":27,"overall":79,"price":{"value":16.0,"unit":"M"},"poolKey":"name_juan_foyth"},{"id":"xls_1223137305188548617","name":"Nico Gonzalez","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"ARGENTINA","age":27,"overall":79,"price":{"value":18.5,"unit":"M"},"poolKey":"name_nico_gonzalez"},{"id":"xls_6955421847300121415","name":"Davidson","pos":"LM/LW","primaryPos":"LM","secondaryPos":"LW","country":"BRASIL","age":34,"overall":74,"price":{"value":2.0,"unit":"M"},"poolKey":"name_davidson"},{"id":"xls_7844953181993146164","name":"Harvey Elliott","pos":"CAM/CM/RW","primaryPos":"CAM","secondaryPos":"CM/RW","country":"INGLATERRA","age":22,"overall":78,"price":{"value":21.5,"unit":"M"},"poolKey":"name_harvey_elliott"},{"id":"xls_2428743899938088650","name":"Aymeric Laporte","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":31,"overall":82,"price":{"value":21.0,"unit":"M"},"poolKey":"name_aymeric_laporte"},{"id":"xls_4693289431264598671","name":"Richard Ríos","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"COLOMBIA","age":25,"overall":78,"price":{"value":19.5,"unit":"M"},"poolKey":"name_richard_rios"},{"id":"xls_5823790661384961347","name":"Dênildo Stein","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"BRASIL","age":37,"overall":75,"price":{"value":1.9,"unit":"M"},"poolKey":"name_dênildo_stein"},{"id":"xls_6659390261137317410","name":"Christantus Uche","pos":"ST/CAM/CM","primaryPos":"ST","secondaryPos":"CAM/CM","country":"NIGERIA","age":22,"overall":76,"price":{"value":12.0,"unit":"M"},"poolKey":"name_christantus_uche"},{"id":"xls_8613691238322263016","name":"Luiz Júnior","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"BRASIL","age":24,"overall":78,"price":{"value":16.0,"unit":"M"},"poolKey":"name_luiz_junior"},{"id":"xls_6638186064035353797","name":"Illia Zabarnyi","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"UCRANIA","age":22,"overall":80,"price":{"value":29.5,"unit":"M"},"poolKey":"name_illia_zabarnyi"},{"id":"xls_5380180063152202751","name":"Yeremy Pino","pos":"LW/RW/CAM/LM","primaryPos":"LW","secondaryPos":"RW/CAM/LM","country":"ESPAÑA","age":22,"overall":89,"price":{"value":35.5,"unit":"M"},"poolKey":"name_yeremy_pino"},{"id":"xls_4371446855597838975","name":"Omar Al Somah","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"SIRIA","age":36,"overall":74,"price":{"value":1.4,"unit":"M"},"poolKey":"name_omar_al_somah"},{"id":"xls_6515564949648867961","name":"Ahmed Hegazi","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"EGIPTO","age":34,"overall":74,"price":{"value":1.4,"unit":"M"},"poolKey":"name_ahmed_hegazi"},{"id":"xls_5985942151133353122","name":"Leandro Paredes","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ARGENTINA","age":31,"overall":81,"price":{"value":21.0,"unit":"M"},"poolKey":"name_leandro_paredes"},{"id":"xls_4854071512565172879","name":"Abdessamad Ezzalzouli","pos":"LW/LM","primaryPos":"LW","secondaryPos":"LM","country":"MARRUECOS","age":23,"overall":80,"price":{"value":30.0,"unit":"M"},"poolKey":"name_abdessamad_ezzalzouli"},{"id":"xls_3886213898655571810","name":"Dani García","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ESPAÑA","age":35,"overall":73,"price":{"value":850.0,"unit":"K"},"poolKey":"name_dani_garcia"},{"id":"xls_8983385540046450232","name":"Anthony Nwakaeme","pos":"LW/ST/LM","primaryPos":"LW","secondaryPos":"ST/LM","country":"NIGERIA","age":36,"overall":71,"price":{"value":600.0,"unit":"K"},"poolKey":"name_anthony_nwakaeme"},{"id":"xls_6749855791256781294","name":"Rodrigo Aliendro","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ARGENTINA","age":34,"overall":74,"price":{"value":1.9,"unit":"M"},"poolKey":"name_rodrigo_aliendro"},{"id":"xls_761817604720718743","name":"Damion Downs","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"USA","age":21,"overall":70,"price":{"value":3.5,"unit":"M"},"poolKey":"name_damion_downs"},{"id":"xls_4693432849811951838","name":"Dmytro Kryskiv","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"UCRANIA","age":24,"overall":72,"price":{"value":2.9,"unit":"M"},"poolKey":"name_dmytro_kryskiv"},{"id":"xls_6104500922679475937","name":"Gabriel Osho","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"NIGERIA","age":26,"overall":70,"price":{"value":1.8,"unit":"M"},"poolKey":"name_gabriel_osho"},{"id":"xls_236488364780690824","name":"Hörður Magnússon","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"ISLANDIA","age":32,"overall":71,"price":null,"poolKey":"name_hörður_magnusson"},{"id":"xls_4593825583029460432","name":"Adam Smith","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"INGLATERRA","age":34,"overall":73,"price":{"value":1.1,"unit":"M"},"poolKey":"name_adam_smith"},{"id":"xls_6405686958917773499","name":"Oleksandr Karavaiev","pos":"RB/RM/LB","primaryPos":"RB","secondaryPos":"RM/LB","country":"UCRANIA","age":33,"overall":73,"price":{"value":1.6,"unit":"M"},"poolKey":"name_oleksandr_karavaiev"}],"Getafe CF":[{"id":"xls_4626630143607034912","name":"Éder Militão","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"BRASIL","age":27,"overall":83,"price":{"value":45.0,"unit":"M"},"poolKey":"name_eder_militão"},{"id":"xls_7855982169272472342","name":"Reece James","pos":"RB/CDM","primaryPos":"RB","secondaryPos":"CDM","country":"INGLATERRA","age":24,"overall":84,"price":{"value":48.5,"unit":"M"},"poolKey":"name_reece_james"},{"id":"xls_7785910408246569578","name":"Gonçalo Inácio","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PORTUGAL","age":23,"overall":81,"price":{"value":35.0,"unit":"M"},"poolKey":"name_gonçalo_inacio"},{"id":"xls_4188056407687042295","name":"Riccardo Orsolini","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"ITALIA","age":28,"overall":83,"price":{"value":36.5,"unit":"M"},"poolKey":"name_riccardo_orsolini"},{"id":"xls_175079576773301165","name":"Isi","pos":"CAM/RM/ST/CM","primaryPos":"CAM","secondaryPos":"RM/ST/CM","country":"ESPAÑA","age":30,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_isi"},{"id":"xls_7278047936293867092","name":"Jonathan David","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"CANADA","age":25,"overall":81,"price":{"value":34.5,"unit":"M"},"poolKey":"name_jonathan_david"},{"id":"xls_7095042240479164287","name":"Gerónimo Rulli","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ARGENTINA","age":33,"overall":81,"price":{"value":8.5,"unit":"M"},"poolKey":"name_geronimo_rulli"},{"id":"xls_4901853707027297073","name":"Rayan Aït-Nouri","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ARGELIA","age":24,"overall":81,"price":{"value":34.5,"unit":"M"},"poolKey":"name_rayan_aït-nouri"},{"id":"xls_3571180618639686134","name":"Gabriel Martinelli","pos":"LW/LM","primaryPos":"LW","secondaryPos":"LM","country":"BRASIL","age":24,"overall":81,"price":{"value":35.0,"unit":"M"},"poolKey":"name_gabriel_martinelli"},{"id":"xls_6922913401818773469","name":"Alan Varela","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ARGENTINA","age":23,"overall":80,"price":{"value":29.0,"unit":"M"},"poolKey":"name_alan_varela"},{"id":"xls_4400455430037983316","name":"Mauro Icardi","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ARGENTINA","age":32,"overall":79,"price":{"value":14.0,"unit":"M"},"poolKey":"name_mauro_icardi"},{"id":"xls_2355645696404961377","name":"Mauro Arambarri","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"URUGUAY","age":29,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_mauro_arambarri"},{"id":"xls_6623588292345263679","name":"Akram Afif","pos":"LW/CAM/ST/LM","primaryPos":"LW","secondaryPos":"CAM/ST/LM","country":"CATAR","age":29,"overall":78,"price":null,"poolKey":"name_akram_afif"},{"id":"xls_6566649037975757985","name":"Hiroki Ito","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"JAPON","age":26,"overall":78,"price":{"value":16.5,"unit":"M"},"poolKey":"name_hiroki_ito"},{"id":"xls_1691967737666532662","name":"Rodrigo Rey","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ARGENTINA","age":28,"overall":76,"price":{"value":1.3,"unit":"M"},"poolKey":"name_rodrigo_rey"},{"id":"xls_8323009505432727590","name":"Carlos Soler","pos":"CM/CAM/LM/CDM","primaryPos":"CM","secondaryPos":"CAM/LM/CDM","country":"ESPAÑA","age":28,"overall":78,"price":{"value":14.0,"unit":"M"},"poolKey":"name_carlos_soler"},{"id":"xls_2184360057027553186","name":"Jota","pos":"LW/RW/LM","primaryPos":"LW","secondaryPos":"RW/LM","country":"PORTUGAL","age":26,"overall":77,"price":{"value":11.5,"unit":"M"},"poolKey":"name_jota"},{"id":"xls_4992187291917400749","name":"Yeremay","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"ESPAÑA","age":22,"overall":76,"price":{"value":17.0,"unit":"M"},"poolKey":"name_yeremay"},{"id":"xls_5354411323456654533","name":"Hwang In Beom","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"KOREA DEL SUR","age":28,"overall":76,"price":{"value":7.5,"unit":"M"},"poolKey":"name_hwang_in_beom"},{"id":"xls_196986701525188217","name":"César Tárrega","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":23,"overall":75,"price":{"value":10.5,"unit":"M"},"poolKey":"name_cesar_tarrega"},{"id":"xls_6990470904313812581","name":"Juan Iglesias","pos":"RB/LB/RM","primaryPos":"RB","secondaryPos":"LB/RM","country":"ESPAÑA","age":26,"overall":75,"price":{"value":6.0,"unit":"M"},"poolKey":"name_juan_iglesias"},{"id":"xls_2564785329882846909","name":"Gonzalo García","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ESPAÑA","age":21,"overall":74,"price":{"value":9.5,"unit":"M"},"poolKey":"name_gonzalo_garcia"},{"id":"xls_8708598240783848751","name":"Jesús Vallejo","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":28,"overall":71,"price":{"value":1.8,"unit":"M"},"poolKey":"name_jesus_vallejo"},{"id":"xls_7609730297014690676","name":"Mario Martín","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ESPAÑA","age":21,"overall":73,"price":{"value":7.0,"unit":"M"},"poolKey":"name_mario_martin"},{"id":"xls_4852902832302499120","name":"Santi Cazorla","pos":"CAM/CM/LM","primaryPos":"CAM","secondaryPos":"CM/LM","country":"ESPAÑA","age":41,"overall":75,"price":null,"poolKey":"name_santi_cazorla"},{"id":"xls_2479140147235321250","name":"Oihan Sancet","pos":"CAM/CM/ST","primaryPos":"CAM","secondaryPos":"CM/ST","country":"ESPAÑA","age":25,"overall":82,"price":{"value":40.5,"unit":"M"},"poolKey":"name_oihan_sancet"}],"Nottingham Forest FC":[{"id":"xls_8997232920682614864","name":"David Soria","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ESPAÑA","age":33,"overall":80,"price":{"value":10.5,"unit":"M"},"poolKey":"name_david_soria"},{"id":"xls_7385103923616512442","name":"Carlos Augusto","pos":"LB/CB/LM","primaryPos":"LB","secondaryPos":"CB/LM","country":"BRASIL","age":27,"overall":81,"price":{"value":27.5,"unit":"M"},"poolKey":"name_carlos_augusto"},{"id":"xls_6223328333242110520","name":"Tomás Araújo","pos":"CB/RB","primaryPos":"CB","secondaryPos":"RB","country":"PORTUGAL","age":23,"overall":78,"price":{"value":29.0,"unit":"M"},"poolKey":"name_tomas_araujo"},{"id":"xls_4809653735086838126","name":"Jaydee Canvot","pos":"CB/CDM/CM","primaryPos":"CB","secondaryPos":"CDM/CM","country":"FRANCIA","age":19,"overall":74,"price":{"value":8.5,"unit":"M"},"poolKey":"name_jaydee_canvot"},{"id":"xls_6713844131321749475","name":"Malo Gusto","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"FRANCIA","age":22,"overall":79,"price":{"value":25.0,"unit":"M"},"poolKey":"name_malo_gusto"},{"id":"xls_1293032826755364472","name":"Claudio Echeverri","pos":"CAM/CM/LM/ST","primaryPos":"CAM","secondaryPos":"CM/LM/ST","country":"ARGENTINA","age":20,"overall":73,"price":{"value":7.0,"unit":"M"},"poolKey":"name_claudio_echeverri"},{"id":"xls_5912729019734863926","name":"Morgan Gibbs-White","pos":"CAM/CM","primaryPos":"CAM","secondaryPos":"CM","country":"INGLATERRA","age":26,"overall":81,"price":{"value":32.5,"unit":"M"},"poolKey":"name_morgan_gibbs-white"},{"id":"xls_7879874152720195925","name":"Harvey Barnes","pos":"LW/LM","primaryPos":"LW","secondaryPos":"LM","country":"INGLATERRA","age":28,"overall":80,"price":{"value":22.5,"unit":"M"},"poolKey":"name_harvey_barnes"},{"id":"xls_3485727982838185635","name":"James Tavernier","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"INGLATERRA","age":34,"overall":77,"price":{"value":5.5,"unit":"M"},"poolKey":"name_james_tavernier"},{"id":"xls_7677742374622204707","name":"Ismaïla Sarr","pos":"RW/CAM/RM","primaryPos":"RW","secondaryPos":"CAM/RM","country":"SENEGAL","age":28,"overall":81,"price":{"value":27.5,"unit":"M"},"poolKey":"name_ismaïla_sarr"},{"id":"xls_6435222056638852353","name":"Álvaro Morata","pos":"ST/CAM/CM","primaryPos":"ST","secondaryPos":"CAM/CM","country":"ESPAÑA","age":33,"overall":79,"price":{"value":14.0,"unit":"M"},"poolKey":"name_alvaro_morata"},{"id":"xls_1176574836699236509","name":"Yassine Bounou","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"MARRUECOS","age":35,"overall":82,"price":{"value":5.0,"unit":"M"},"poolKey":"name_yassine_bounou"},{"id":"xls_2837941720771257418","name":"Marcos López","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"PERU","age":26,"overall":71,"price":{"value":2.2,"unit":"M"},"poolKey":"name_marcos_lopez"},{"id":"xls_5586740388359687633","name":"Jorrel Hato","pos":"LB/CB/CDM","primaryPos":"LB","secondaryPos":"CB/CDM","country":"PAISES BAJOS","age":20,"overall":78,"price":{"value":29.0,"unit":"M"},"poolKey":"name_jorrel_hato"},{"id":"xls_1854788612216314638","name":"Arnaud Kalimuendo","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"FRANCIA","age":24,"overall":78,"price":{"value":20.5,"unit":"M"},"poolKey":"name_arnaud_kalimuendo"},{"id":"xls_9128022329240713191","name":"Ruben Loftus-Cheek","pos":"CM/CAM","primaryPos":"CM","secondaryPos":"CAM","country":"INGLATERRA","age":30,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_ruben_loftus-cheek"},{"id":"xls_5778331968858719544","name":"João Pedro","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"BRASIL","age":24,"overall":82,"price":{"value":44.0,"unit":"M"},"poolKey":"name_joão_pedro"},{"id":"xls_4148926185921316399","name":"Iago Aspas","pos":"RW/ST/RM","primaryPos":"RW","secondaryPos":"ST/RM","country":"ESPAÑA","age":38,"overall":82,"price":{"value":10.0,"unit":"M"},"poolKey":"name_iago_aspas"},{"id":"xls_5706249101440580371","name":"Ibrahim Mbaye","pos":"RW/LW/RM","primaryPos":"RW","secondaryPos":"LW/RM","country":"SENEGAL","age":18,"overall":74,"price":{"value":8.5,"unit":"M"},"poolKey":"name_ibrahim_mbaye"},{"id":"xls_2226022730150172083","name":"Obed Vargas","pos":"CDM/CM/RM","primaryPos":"CDM","secondaryPos":"CM/RM","country":"MEXICO","age":20,"overall":72,"price":{"value":4.8,"unit":"M"},"poolKey":"name_obed_vargas"},{"id":"xls_5959977686135903818","name":"Lewis Hall","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"INGLATERRA","age":21,"overall":81,"price":{"value":35.5,"unit":"M"},"poolKey":"name_lewis_hall"},{"id":"xls_3906015144352093123","name":"Lukas Klostermann","pos":"CB/RB","primaryPos":"CB","secondaryPos":"RB","country":"ALEMANIA","age":29,"overall":76,"price":{"value":7.0,"unit":"M"},"poolKey":"name_lukas_klostermann"},{"id":"xls_5970629976949958215","name":"Anthony Gordon","pos":"LW/RW/LM","primaryPos":"LW","secondaryPos":"RW/LM","country":"INGLATERRA","age":25,"overall":82,"price":{"value":41.5,"unit":"M"},"poolKey":"name_anthony_gordon"},{"id":"xls_5966890553326058929","name":"Luka Modrić","pos":"CM/CAM/CDM","primaryPos":"CM","secondaryPos":"CAM/CDM","country":"CROACIA","age":40,"overall":85,"price":{"value":17.0,"unit":"M"},"poolKey":"name_luka_modrić"},{"id":"xls_7960568098925128906","name":"Thomas Lemar","pos":"CM/LM/CDM","primaryPos":"CM","secondaryPos":"LM/CDM","country":"FRANCIA","age":30,"overall":77,"price":{"value":10.5,"unit":"M"},"poolKey":"name_thomas_lemar"},{"id":"xls_5638279554993606729","name":"Ollie Watkins","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"INGLATERRA","age":30,"overall":82,"price":{"value":30.5,"unit":"M"},"poolKey":"name_ollie_watkins"}],"Rangers":[{"id":"xls_8813255809665710224","name":"Kepa Arrizabalaga","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ESPAÑA","age":31,"overall":79,"price":{"value":11.5,"unit":"M"},"poolKey":"name_kepa_arrizabalaga"},{"id":"xls_852660410457856707","name":"Julio Soler","pos":"LB/RM","primaryPos":"LB","secondaryPos":"RM","country":"ARGENTINA","age":21,"overall":68,"price":{"value":2.5,"unit":"M"},"poolKey":"name_julio_soler"},{"id":"xls_1849033839791931063","name":"Ryan Flamingo","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"PAISES BAJOS","age":23,"overall":76,"price":{"value":11.0,"unit":"M"},"poolKey":"name_ryan_flamingo"},{"id":"xls_8225175601760773437","name":"Luca Ranieri","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ITALIA","age":27,"overall":75,"price":{"value":6.5,"unit":"M"},"poolKey":"name_luca_ranieri"},{"id":"xls_8425285280348096450","name":"Rodrigo Huescas","pos":"LB/RM","primaryPos":"LB","secondaryPos":"RM","country":"MEXICO","age":22,"overall":72,"price":{"value":4.5,"unit":"M"},"poolKey":"name_rodrigo_huescas"},{"id":"xls_4959046800596894142","name":"John McGinn","pos":"RM/LM/CAM/RB","primaryPos":"RM","secondaryPos":"LM/CAM/RB","country":"ESCOCIA","age":31,"overall":81,"price":{"value":25.0,"unit":"M"},"poolKey":"name_john_mcginn"},{"id":"xls_7320597821784968763","name":"Lucas Da Cunha","pos":"CDM/CM/CAM","primaryPos":"CDM","secondaryPos":"CM/CAM","country":"FRANCIA","age":24,"overall":76,"price":{"value":10.0,"unit":"M"},"poolKey":"name_lucas_da_cunha"},{"id":"xls_3703649662660547389","name":"Lewis Ferguson","pos":"CDM/CM/CAM","primaryPos":"CDM","secondaryPos":"CM/CAM","country":"ESCOCIA","age":26,"overall":78,"price":{"value":17.0,"unit":"M"},"poolKey":"name_lewis_ferguson"},{"id":"xls_5937463655190234033","name":"Simone Pafundi","pos":"CAM/ST","primaryPos":"CAM","secondaryPos":"ST","country":"ITALIA","age":20,"overall":69,"price":{"value":3.3,"unit":"M"},"poolKey":"name_simone_pafundi"},{"id":"xls_4031986348221157322","name":"Raúl Jiménez","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"MEXICO","age":35,"overall":78,"price":{"value":7.0,"unit":"M"},"poolKey":"name_raul_jimenez"},{"id":"xls_4056020435585076399","name":"Emiliano Martínez","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ARGENTINA","age":33,"overall":85,"price":{"value":26.5,"unit":"M"},"poolKey":"name_emiliano_martinez"},{"id":"xls_1178599120747064255","name":"Nicolò Zaniolo","pos":"ST/RW/RM/CAM","primaryPos":"ST","secondaryPos":"RW/RM/CAM","country":"ITALIA","age":26,"overall":75,"price":{"value":7.0,"unit":"M"},"poolKey":"name_nicolò_zaniolo"},{"id":"xls_1929638995509719113","name":"Marc Bartra","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ESPAÑA","age":35,"overall":79,"price":{"value":5.5,"unit":"M"},"poolKey":"name_marc_bartra"},{"id":"xls_9127651967561319482","name":"Memphis Depay","pos":"ST/LW/CAM","primaryPos":"ST","secondaryPos":"LW/CAM","country":"PAISES BAJOS","age":32,"overall":81,"price":null,"poolKey":"name_memphis_depay"},{"id":"xls_5007395690563379392","name":"Michael Folorunsho","pos":"CM/CAM/CDM","primaryPos":"CM","secondaryPos":"CAM/CDM","country":"ITALIA","age":28,"overall":74,"price":{"value":4.5,"unit":"M"},"poolKey":"name_michael_folorunsho"},{"id":"xls_3960331640916902484","name":"Thomas Müller","pos":"CAM/ST/RM","primaryPos":"CAM","secondaryPos":"ST/RM","country":"ALEMANIA","age":36,"overall":80,"price":{"value":8.5,"unit":"M"},"poolKey":"name_thomas_müller"},{"id":"xls_8179946380927916799","name":"Edson Álvarez","pos":"CDM/CM/CB","primaryPos":"CDM","secondaryPos":"CM/CB","country":"MEXICO","age":28,"overall":78,"price":{"value":14.5,"unit":"M"},"poolKey":"name_edson_alvarez"},{"id":"xls_276802722834481504","name":"Ermedin Demirović","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"BOSNIA & HERZEGOVINA","age":28,"overall":80,"price":{"value":23.0,"unit":"M"},"poolKey":"name_ermedin_demirović"},{"id":"xls_2770352678405842892","name":"Santiago Mouriño","pos":"RB/CB/CDM","primaryPos":"RB","secondaryPos":"CB/CDM","country":"URUGUAY","age":24,"overall":78,"price":{"value":27.0,"unit":"M"},"poolKey":"name_santiago_mourino"},{"id":"xls_1763170134611067947","name":"Ki-Jana Hoever","pos":"RB/RM","primaryPos":"RB","secondaryPos":"RM","country":"PAISES BAJOS","age":24,"overall":72,"price":{"value":3.1,"unit":"M"},"poolKey":"name_ki-jana_hoever"},{"id":"xls_8471937284353557715","name":"Yannick Gerhardt","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"ALEMANIA","age":32,"overall":74,"price":{"value":3.5,"unit":"M"},"poolKey":"name_yannick_gerhardt"},{"id":"xls_9043649042858527533","name":"Jesper Lindstrøm","pos":"RM/LM/RB","primaryPos":"RM","secondaryPos":"LM/RB","country":"DINAMARCA","age":26,"overall":74,"price":{"value":5.0,"unit":"M"},"poolKey":"name_jesper_lindstrøm"},{"id":"xls_966191414328779922","name":"Matteo Ruggeri","pos":"RB/LM","primaryPos":"RB","secondaryPos":"LM","country":"ITALIA","age":23,"overall":78,"price":{"value":21.0,"unit":"M"},"poolKey":"name_matteo_ruggeri"},{"id":"xls_8806582093979155964","name":"Barış Alper Yılmaz","pos":"LM/RM/ST/LW","primaryPos":"LM","secondaryPos":"RM/ST/LW","country":"TURQUIA","age":25,"overall":80,"price":{"value":25.0,"unit":"M"},"poolKey":"name_barış_alper_yılmaz"},{"id":"xls_8388190726339033133","name":"Alexander Sørloth","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"NORUEGA","age":30,"overall":83,"price":{"value":36.5,"unit":"M"},"poolKey":"name_alexander_sørloth"},{"id":"xls_4387450958684464981","name":"Matteo Politano","pos":"RW/RM/RB","primaryPos":"RW","secondaryPos":"RM/RB","country":"ITALIA","age":32,"overall":81,"price":{"value":21.5,"unit":"M"},"poolKey":"name_matteo_politano"}],"Abeerden FC":[{"id":"xls_4389739364843983108","name":"Alex Meret","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ITALIA","age":29,"overall":82,"price":{"value":26.0,"unit":"M"},"poolKey":"name_alex_meret"},{"id":"xls_5323071597899264186","name":"Youri Baas","pos":"CB/LB/CDM","primaryPos":"CB","secondaryPos":"LB/CDM","country":"PAISES BAJOS","age":23,"overall":77,"price":{"value":20.0,"unit":"M"},"poolKey":"name_youri_baas"},{"id":"xls_3198160118607178804","name":"Antonio Rüdiger","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ALEMANIA","age":33,"overall":84,"price":{"value":27.5,"unit":"M"},"poolKey":"name_antonio_rüdiger"},{"id":"xls_1019220143308095443","name":"Wilfried Singo","pos":"CB/RB","primaryPos":"CB","secondaryPos":"RB","country":"COSTA DE MARFIL","age":25,"overall":78,"price":{"value":20.0,"unit":"M"},"poolKey":"name_wilfried_singo"},{"id":"xls_8987184744710419841","name":"Jesús Rodríguez","pos":"LM/RM/LW","primaryPos":"LM","secondaryPos":"RM/LW","country":"ESPAÑA","age":20,"overall":76,"price":{"value":16.0,"unit":"M"},"poolKey":"name_jesus_rodriguez"},{"id":"xls_7391807672935093307","name":"Hans Vanaken","pos":"CAM/CM/CDM","primaryPos":"CAM","secondaryPos":"CM/CDM","country":"BELGICA","age":33,"overall":81,"price":{"value":20.5,"unit":"M"},"poolKey":"name_hans_vanaken"},{"id":"xls_2230382746082439182","name":"Davide Frattesi","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ITALIA","age":26,"overall":81,"price":{"value":32.0,"unit":"M"},"poolKey":"name_davide_frattesi"},{"id":"xls_4667605419148901572","name":"Takefusa Kubo","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"JAPON","age":24,"overall":81,"price":{"value":37.0,"unit":"M"},"poolKey":"name_takefusa_kubo"},{"id":"xls_4613672979215226229","name":"Benjamin Šeško","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ESLOVENIA","age":22,"overall":80,"price":{"value":43.0,"unit":"M"},"poolKey":"name_benjamin_šeško"},{"id":"xls_3621049337376805125","name":"Hirving Lozano","pos":"LW/RW/LM","primaryPos":"LW","secondaryPos":"RW/LM","country":"MEXICO","age":30,"overall":77,"price":{"value":10.5,"unit":"M"},"poolKey":"name_hirving_lozano"},{"id":"xls_4095654566115322611","name":"Felix Nmecha","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ALEMANIA","age":25,"overall":84,"price":{"value":54.5,"unit":"M"},"poolKey":"name_felix_nmecha"},{"id":"xls_8044040303258473900","name":"Gianluca Mancini","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ITALIA","age":30,"overall":84,"price":{"value":35.5,"unit":"M"},"poolKey":"name_gianluca_mancini"},{"id":"xls_2901474304989938015","name":"Senny Mayulu","pos":"CM/ST/CDM","primaryPos":"CM","secondaryPos":"ST/CDM","country":"FRANCIA","age":19,"overall":77,"price":{"value":22.5,"unit":"M"},"poolKey":"name_senny_mayulu"},{"id":"xls_1143756217640253364","name":"Andrew Robertson","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ESCOCIA","age":32,"overall":81,"price":{"value":18.5,"unit":"M"},"poolKey":"name_andrew_robertson"},{"id":"xls_8210262925029524583","name":"Pablo Barrios","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ESPAÑA","age":22,"overall":83,"price":{"value":52.5,"unit":"M"},"poolKey":"name_pablo_barrios"},{"id":"xls_6373304036608957009","name":"Ryan Christie","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ESCOCIA","age":31,"overall":78,"price":{"value":12.0,"unit":"M"},"poolKey":"name_ryan_christie"},{"id":"xls_5433133051219102902","name":"Rasmus Højlund","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"DINAMARCA","age":23,"overall":78,"price":{"value":22.0,"unit":"M"},"poolKey":"name_rasmus_højlund"},{"id":"xls_5937292203540172506","name":"Granit Xhaka","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"SUIZA","age":33,"overall":85,"price":{"value":36.0,"unit":"M"},"poolKey":"name_granit_xhaka"},{"id":"xls_808824412058657481","name":"Robin Risser","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"FRANCIA","age":21,"overall":78,"price":{"value":23.5,"unit":"M"},"poolKey":"name_robin_risser"},{"id":"xls_2696142239372193281","name":"Waldemar Anton","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"ALEMANIA","age":29,"overall":83,"price":{"value":31.5,"unit":"M"},"poolKey":"name_waldemar_anton"},{"id":"xls_5235143998710628942","name":"Aaron Hickey","pos":"RB/LB/RM","primaryPos":"RB","secondaryPos":"LB/RM","country":"ESCOCIA","age":23,"overall":75,"price":{"value":7.5,"unit":"M"},"poolKey":"name_aaron_hickey"},{"id":"xls_5565170319472995614","name":"Gabriel Gudmundsson","pos":"LB/CB/LM","primaryPos":"LB","secondaryPos":"CB/LM","country":"SUECIA","age":27,"overall":77,"price":{"value":11.5,"unit":"M"},"poolKey":"name_gabriel_gudmundsson"},{"id":"xls_8091769610578912692","name":"Billy Gilmour","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ESCOCIA","age":24,"overall":75,"price":{"value":8.0,"unit":"M"},"poolKey":"name_billy_gilmour"},{"id":"xls_7771050576575623196","name":"Rodrygo Goes","pos":"LM/RM/ST/LW","primaryPos":"LM","secondaryPos":"RM/ST/LW","country":"BRASIL","age":25,"overall":84,"price":{"value":57.5,"unit":"M"},"poolKey":"name_rodrygo_goes"},{"id":"xls_3505614722036053764","name":"Patrik Schick","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"REP. CHECA","age":30,"overall":85,"price":{"value":54.0,"unit":"M"},"poolKey":"name_patrik_schick"},{"id":"xls_8441719099307248522","name":"Oscar Højlund","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"DINAMARCA","age":21,"overall":74,"price":{"value":9.0,"unit":"M"},"poolKey":"name_oscar_højlund"}],"Celtic FC":[{"id":"xls_7372299192720497125","name":"Jan Oblak","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ESLOVENIA","age":33,"overall":88,"price":{"value":45.0,"unit":"M"},"poolKey":"name_jan_oblak"},{"id":"xls_4158054685390616746","name":"Kieran Tierney","pos":"LB","primaryPos":"LB","secondaryPos":null,"country":"ESCOCIA","age":28,"overall":77,"price":{"value":9.5,"unit":"M"},"poolKey":"name_kieran_tierney"},{"id":"xls_3345393644875482190","name":"Leny Yoro","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"FRANCIA","age":20,"overall":78,"price":{"value":28.5,"unit":"M"},"poolKey":"name_leny_yoro"},{"id":"xls_4711628711675759765","name":"Davinson Sánchez","pos":"CB/RB","primaryPos":"CB","secondaryPos":"RB","country":"COLOMBIA","age":29,"overall":81,"price":{"value":21.5,"unit":"M"},"poolKey":"name_davinson_sanchez"},{"id":"xls_5553735801534919337","name":"Eduardo Camavinga","pos":"CM/CDM/LWB","primaryPos":"CM","secondaryPos":"CDM/LWB","country":"FRANCIA","age":23,"overall":81,"price":{"value":37.5,"unit":"M"},"poolKey":"name_eduardo_camavinga"},{"id":"xls_392965796851034815","name":"Eric García Martret","pos":"CB/RB/CDM/RM","primaryPos":"CB","secondaryPos":"RB/CDM/RM","country":"ESPAÑA","age":25,"overall":83,"price":{"value":44.5,"unit":"M"},"poolKey":"name_eric_garcia_martret"},{"id":"xls_1047753203081515223","name":"Scott McTominay","pos":"CM/CAM/LM/CDM","primaryPos":"CM","secondaryPos":"CAM/LM/CDM","country":"ESCOCIA","age":29,"overall":86,"price":{"value":68.0,"unit":"M"},"poolKey":"name_scott_mctominay"},{"id":"xls_3508418409090995813","name":"Callum McGregor","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"ESCOCIA","age":32,"overall":79,"price":{"value":11.5,"unit":"M"},"poolKey":"name_callum_mcgregor"},{"id":"xls_2643593077334830871","name":"Adriano Bertaccini","pos":"ST/CAM/LW/CM","primaryPos":"ST","secondaryPos":"CAM/LW/CM","country":"BELGICA","age":25,"overall":76,"price":{"value":11.0,"unit":"M"},"poolKey":"name_adriano_bertaccini"},{"id":"xls_3193336194990358896","name":"Ryan Gauld","pos":"LW/ST/RW/LM","primaryPos":"LW","secondaryPos":"ST/RW/LM","country":"ESCOCIA","age":30,"overall":77,"price":{"value":10.5,"unit":"M"},"poolKey":"name_ryan_gauld"},{"id":"xls_2105505007071785174","name":"Lamine Camara","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"SENEGAL","age":22,"overall":79,"price":{"value":28.0,"unit":"M"},"poolKey":"name_lamine_camara"},{"id":"xls_9216714551213037947","name":"Łukasz Skorupski","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"POLONIA","age":35,"overall":78,"price":{"value":2.4,"unit":"M"},"poolKey":"name_łukasz_skorupski"},{"id":"xls_4532918752798959141","name":"Bernardo","pos":"LB/CB/CDM","primaryPos":"LB","secondaryPos":"CB/CDM","country":"BRASIL","age":30,"overall":75,"price":{"value":4.8,"unit":"M"},"poolKey":"name_bernardo"},{"id":"xls_1965764046696251948","name":"Jayden Oosterwolde","pos":"CB/LB","primaryPos":"CB","secondaryPos":"LB","country":"PAISES BAJOS","age":25,"overall":76,"price":{"value":10.0,"unit":"M"},"poolKey":"name_jayden_oosterwolde"},{"id":"xls_1447258213217678827","name":"Alexandru Maxim","pos":"CM/CAM/ST","primaryPos":"CM","secondaryPos":"CAM/ST","country":"RUMANIA","age":35,"overall":74,"price":{"value":2.0,"unit":"M"},"poolKey":"name_alexandru_maxim"},{"id":"xls_965165684867532222","name":"Adrien Rabiot","pos":"CM/CAM/CDM","primaryPos":"CM","secondaryPos":"CAM/CDM","country":"FRANCIA","age":31,"overall":85,"price":{"value":51.5,"unit":"M"},"poolKey":"name_adrien_rabiot"},{"id":"xls_2863193905936365859","name":"Boubacar Kamara","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"FRANCIA","age":26,"overall":84,"price":{"value":47.5,"unit":"M"},"poolKey":"name_boubacar_kamara"},{"id":"xls_7586181116152132093","name":"Rafa","pos":"CAM/ST/LM","primaryPos":"CAM","secondaryPos":"ST/LM","country":"PORTUGAL","age":32,"overall":82,"price":{"value":24.0,"unit":"M"},"poolKey":"name_rafa"},{"id":"xls_4255104884908451793","name":"César Montes","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"MEXICO","age":29,"overall":76,"price":null,"poolKey":"name_cesar_montes"},{"id":"xls_2889144799007493671","name":"Ben Gannon-Doak","pos":"RM/RW","primaryPos":"RM","secondaryPos":"RW","country":"ESCOCIA","age":20,"overall":71,"price":{"value":4.4,"unit":"M"},"poolKey":"name_ben_gannon-doak"},{"id":"xls_193803724161993009","name":"Roger Ibañez","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"BRASIL","age":27,"overall":82,"price":{"value":33.5,"unit":"M"},"poolKey":"name_roger_ibanez"},{"id":"xls_4989515826217412673","name":"Silas Katompa Mvumpa","pos":"RM/RW/ST","primaryPos":"RM","secondaryPos":"RW/ST","country":"R.D. CONGO","age":27,"overall":73,"price":{"value":3.3,"unit":"M"},"poolKey":"name_silas_katompa_mvumpa"},{"id":"xls_6200986711952967869","name":"Obinna Nwobodo","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"NIGERIA","age":29,"overall":73,"price":{"value":3.0,"unit":"M"},"poolKey":"name_obinna_nwobodo"},{"id":"xls_9023097501891227869","name":"Yan Diomande","pos":"RW/LW/LM/RM","primaryPos":"RW","secondaryPos":"LW/LM/RM","country":"COSTA DE MARFIL","age":19,"overall":81,"price":{"value":54.5,"unit":"M"},"poolKey":"name_yan_diomande"},{"id":"xls_5959852773160900288","name":"Alejandro Berenguer Remiro","pos":"RM/LM/CAM/RW","primaryPos":"RM","secondaryPos":"LM/CAM/RW","country":"ESPAÑA","age":30,"overall":80,"price":{"value":20.5,"unit":"M"},"poolKey":"name_alejandro_berenguer_remiro"},{"id":"xls_7255291124669593003","name":"Antoine Griezmann","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"FRANCIA","age":35,"overall":84,"price":{"value":20.5,"unit":"M"},"poolKey":"name_antoine_griezmann"}],"Napoli SC":[{"id":"xls_5990102182304978052","name":"Guglielmo Vicario","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ITALIA","age":29,"overall":81,"price":{"value":20.5,"unit":"M"},"poolKey":"name_guglielmo_vicario"},{"id":"xls_7615588332135622142","name":"Federico Dimarco","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ITALIA","age":28,"overall":86,"price":{"value":65.5,"unit":"M"},"poolKey":"name_federico_dimarco"},{"id":"xls_8256835840960242378","name":"Nacho Fernández","pos":"CB/LB/RB","primaryPos":"CB","secondaryPos":"LB/RB","country":"ESPAÑA","age":36,"overall":81,"price":{"value":7.0,"unit":"M"},"poolKey":"name_nacho_fernandez"},{"id":"xls_2548347587420354188","name":"Benjamin André","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"FRANCIA","age":35,"overall":80,"price":{"value":7.0,"unit":"M"},"poolKey":"name_benjamin_andre"},{"id":"xls_6231597176037041371","name":"Giovanni Di Lorenzo","pos":"RB/CB/RM","primaryPos":"RB","secondaryPos":"CB/RM","country":"ITALIA","age":32,"overall":83,"price":{"value":26.5,"unit":"M"},"poolKey":"name_giovanni_di_lorenzo"},{"id":"xls_2361799621373867557","name":"Aurélien Tchouaméni","pos":"CDM/CM/CB","primaryPos":"CDM","secondaryPos":"CM/CB","country":"FRANCIA","age":26,"overall":84,"price":{"value":50.5,"unit":"M"},"poolKey":"name_aurelien_tchouameni"},{"id":"xls_6652325925095358431","name":"Henrikh Mkhitaryan","pos":"CM/CDM","primaryPos":"CM","secondaryPos":"CDM","country":"ARMENIA","age":37,"overall":83,"price":{"value":11.5,"unit":"M"},"poolKey":"name_henrikh_mkhitaryan"},{"id":"xls_5052723804464747605","name":"Sergej Milinković-Savić","pos":"CM/CDM/CAM","primaryPos":"CM","secondaryPos":"CDM/CAM","country":"SERBIA","age":31,"overall":85,"price":{"value":51.5,"unit":"M"},"poolKey":"name_sergej_milinković-savić"},{"id":"xls_302074528382991244","name":"Julian Quiñones","pos":"ST/LW/LM","primaryPos":"ST","secondaryPos":"LW/LM","country":"MEXICO","age":29,"overall":81,"price":{"value":26.5,"unit":"M"},"poolKey":"name_julian_quinones"},{"id":"xls_2058146095807300036","name":"Domenico Berardi","pos":"RW/RM","primaryPos":"RW","secondaryPos":"RM","country":"ITALIA","age":31,"overall":82,"price":{"value":29.5,"unit":"M"},"poolKey":"name_domenico_berardi"},{"id":"xls_5060152388875155107","name":"Moise Kean","pos":"ST","primaryPos":"ST","secondaryPos":null,"country":"ITALIA","age":26,"overall":83,"price":{"value":48.5,"unit":"M"},"poolKey":"name_moise_kean"},{"id":"xls_7595843300785026517","name":"Pietro Terracciano","pos":"GK","primaryPos":"GK","secondaryPos":null,"country":"ITALIA","age":36,"overall":78,"price":{"value":1.6,"unit":"M"},"poolKey":"name_pietro_terracciano"},{"id":"xls_2923368207544306551","name":"Juan Jesus","pos":"CB","primaryPos":"CB","secondaryPos":null,"country":"BRASIL","age":34,"overall":75,"price":{"value":1.8,"unit":"M"},"poolKey":"name_juan_jesus"},{"id":"xls_401852446321086203","name":"José Luís Gayà","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ESPAÑA","age":30,"overall":77,"price":{"value":9.0,"unit":"M"},"poolKey":"name_jose_luis_gayà"},{"id":"xls_1828580826207848638","name":"Sandro Ramírez","pos":"RM/ST/LM/RW","primaryPos":"RM","secondaryPos":"ST/LM/RW","country":"ESPAÑA","age":30,"overall":74,"price":{"value":4.1,"unit":"M"},"poolKey":"name_sandro_ramirez"},{"id":"xls_1873995709681025055","name":"Idrissa Gueye","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"SENEGAL","age":36,"overall":79,"price":{"value":4.9,"unit":"M"},"poolKey":"name_idrissa_gueye"},{"id":"xls_1602539617703972029","name":"Marcelo Brozović","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"CROACIA","age":33,"overall":80,"price":{"value":14.0,"unit":"M"},"poolKey":"name_marcelo_brozović"},{"id":"xls_8532212970246475318","name":"Anssu Fati","pos":"LM/LW/ST","primaryPos":"LM","secondaryPos":"LW/ST","country":"ESPAÑA","age":23,"overall":75,"price":{"value":9.0,"unit":"M"},"poolKey":"name_anssu_fati"},{"id":"xls_398533912978819225","name":"Riqui Puig","pos":"CM/CAM","primaryPos":"CM","secondaryPos":"CAM","country":"ESPAÑA","age":26,"overall":79,"price":{"value":21.0,"unit":"M"},"poolKey":"name_riqui_puig"},{"id":"xls_3097548494322780573","name":"Cristiano Biraghi","pos":"LB/LM","primaryPos":"LB","secondaryPos":"LM","country":"ITALIA","age":33,"overall":77,"price":{"value":7.5,"unit":"M"},"poolKey":"name_cristiano_biraghi"},{"id":"xls_1554562460457569765","name":"Adam Marušić","pos":"RB/LB/RM","primaryPos":"RB","secondaryPos":"LB/RM","country":"PAISES BAJOS","age":33,"overall":77,"price":{"value":7.5,"unit":"M"},"poolKey":"name_adam_marušić"},{"id":"xls_7865222483857752084","name":"Roberto Pereyra","pos":"CM/CAM/CDM","primaryPos":"CM","secondaryPos":"CAM/CDM","country":"ARGENTINA","age":35,"overall":75,"price":{"value":2.6,"unit":"M"},"poolKey":"name_roberto_pereyra"},{"id":"xls_2170323928380391838","name":"Nemanja Matić","pos":"CDM/CM","primaryPos":"CDM","secondaryPos":"CM","country":"SERBIA","age":37,"overall":77,"price":{"value":2.1,"unit":"M"},"poolKey":"name_nemanja_matić"},{"id":"xls_1018267380889813499","name":"Filip Bundgaard","pos":"ST/CAM","primaryPos":"ST","secondaryPos":"CAM","country":"DINAMARCA","age":21,"overall":66,"price":{"value":1.9,"unit":"M"},"poolKey":"name_filip_bundgaard"},{"id":"xls_5440980892439590831","name":"Wilson Odobert","pos":"LW/LM","primaryPos":"LW","secondaryPos":"LM","country":"FRANCIA","age":21,"overall":77,"price":{"value":21.0,"unit":"M"},"poolKey":"name_wilson_odobert"},{"id":"xls_3493976816929293","name":"Almoez Ali","pos":"ST/RW/RM","primaryPos":"ST","secondaryPos":"RW/RM","country":"CATAR","age":29,"overall":73,"price":null,"poolKey":"name_almoez_ali"}]};

// ─── NORMALIZE POSITIONS (English → Spanish) ─────────────────────────────────
const POS_EN_ES={'GK':'POR','CB':'DFC','RB':'DFD','LB':'DFI','CDM':'MCD','CM':'MC','CAM':'MCO','RM':'MD','LM':'MI','RW':'ED','LW':'EI','ST':'DC','CF':'DC','RWB':'DFD','LWB':'DFI','DM':'MCD','AM':'MCO','SW':'DFC','LD':'DFD','LI':'DFI'};
const POS_ES_EN={}; // not needed
function normPos(pos){
  if(!pos) return pos;
  return pos.split(/[\/\-\|]+/).map(p=>{const t=p.trim();return t?POS_EN_ES[t]||t:null;}).filter(Boolean).join('/');
}
function normPlayer(p){
  if(!p) return p;
  const pos=normPos(p.pos);
  const parts=pos?.split('/')||[];
  const primary=POS_EN_ES[p.primaryPos?.trim()]||normPos(p.primaryPos)||parts[0]||'';
  return{...p,pos,primaryPos:primary,secondaryPos:parts.slice(1).join('/')||null};
}

// ─── COLORES ──────────────────────────────────────────────────────────────────
const COLORS_LIGHT = {
  bg:"#f8f8f8",
  card:"#ffffff",
  border:"#e0e0e0",
  borderDark:"#c0c0c0",
  accent:"#F5C518",
  accentDark:"#d4a800",
  accentLight:"rgba(245,197,24,0.15)",
  text:"#1a1a1a",
  textMid:"#3a3a3a",
  textLight:"#707070",
  textFaint:"#a0a0a0",
  inputBg:"#f4f4f4",
  gold:"#F5C518",
  goldLight:"rgba(245,197,24,0.12)",
  dark:false,
};

const COLORS_DARK = {
  bg:"#0d0d0d",
  card:"#161616",
  border:"#2a2a2a",
  borderDark:"#383838",
  accent:"#FFD700",
  accentDark:"#FFC200",
  accentLight:"rgba(255,215,0,0.12)",
  text:"#f0f0f0",
  textMid:"#c0c0c0",
  textLight:"#888888",
  textFaint:"#555555",
  inputBg:"#1e1e1e",
  gold:"#FFD700",
  goldLight:"rgba(255,215,0,0.08)",
  dark:true,
};

const getC = (darkMode) => darkMode ? COLORS_DARK : COLORS_LIGHT;

// Default C for components that don't have access to darkMode state
let C = COLORS_LIGHT;

// ─── FORMACIONES FC26 ─────────────────────────────────────────────────────────
const FORMATIONS = {
  "3-1-4-2":   [{id:"gk",label:"POR",x:50,y:88},{id:"cb1",label:"DFC",x:68,y:74},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:32,y:74},{id:"cdm",label:"MCD",x:50,y:63},{id:"rm",label:"MD",x:82,y:50},{id:"cm1",label:"MC",x:62,y:50},{id:"cm2",label:"MC",x:38,y:50},{id:"lm",label:"MI",x:18,y:50},{id:"st1",label:"DC",x:63,y:22},{id:"st2",label:"DC",x:37,y:22}],
  "3-4-1-2":   [{id:"gk",label:"POR",x:50,y:88},{id:"cb1",label:"DFC",x:68,y:74},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:32,y:74},{id:"rm",label:"MD",x:82,y:56},{id:"cm1",label:"MC",x:62,y:56},{id:"cm2",label:"MC",x:38,y:56},{id:"lm",label:"MI",x:18,y:56},{id:"cam",label:"MCO",x:50,y:38},{id:"st1",label:"DC",x:63,y:22},{id:"st2",label:"DC",x:37,y:22}],
  "3-4-2-1":   [{id:"gk",label:"POR",x:50,y:88},{id:"cb1",label:"DFC",x:68,y:74},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:32,y:74},{id:"rm",label:"MD",x:82,y:56},{id:"cm1",label:"MC",x:62,y:56},{id:"cm2",label:"MC",x:38,y:56},{id:"lm",label:"MI",x:18,y:56},{id:"rf",label:"DC",x:65,y:34},{id:"lf",label:"DC",x:35,y:34},{id:"st",label:"DC",x:50,y:16}],
  "3-4-3":     [{id:"gk",label:"POR",x:50,y:88},{id:"cb1",label:"DFC",x:68,y:74},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:32,y:74},{id:"rm",label:"MD",x:82,y:52},{id:"cm1",label:"MC",x:62,y:52},{id:"cm2",label:"MC",x:38,y:52},{id:"lm",label:"MI",x:18,y:52},{id:"rw",label:"ED",x:78,y:24},{id:"st",label:"DC",x:50,y:17},{id:"lw",label:"EI",x:22,y:24}],
  "3-5-2":     [{id:"gk",label:"POR",x:50,y:88},{id:"cb1",label:"DFC",x:68,y:74},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:32,y:74},{id:"rwb",label:"DFD",x:85,y:52},{id:"cm1",label:"MC",x:67,y:50},{id:"cm2",label:"MC",x:50,y:47},{id:"cm3",label:"MC",x:33,y:50},{id:"lwb",label:"DFI",x:15,y:52},{id:"st1",label:"DC",x:63,y:21},{id:"st2",label:"DC",x:37,y:21}],
  "4-1-2-1-2": [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm",label:"MCD",x:50,y:60},{id:"cm1",label:"MC",x:72,y:48},{id:"cm2",label:"MC",x:28,y:48},{id:"cam",label:"MCO",x:50,y:36},{id:"st1",label:"DC",x:63,y:20},{id:"st2",label:"DC",x:37,y:20}],
  "4-1-2-1-2(2)":[{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm",label:"MCD",x:50,y:61},{id:"rm",label:"MD",x:78,y:46},{id:"lm",label:"MI",x:22,y:46},{id:"cam",label:"MCO",x:50,y:34},{id:"st1",label:"DC",x:63,y:20},{id:"st2",label:"DC",x:37,y:20}],
  "4-1-3-2":   [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm",label:"MCD",x:50,y:61},{id:"rm",label:"MD",x:75,y:47},{id:"cm",label:"MC",x:50,y:47},{id:"lm",label:"MI",x:25,y:47},{id:"st1",label:"DC",x:63,y:22},{id:"st2",label:"DC",x:37,y:22}],
  "4-1-4-1":   [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm",label:"MCD",x:50,y:61},{id:"rm",label:"MD",x:82,y:46},{id:"cm1",label:"MC",x:63,y:47},{id:"cm2",label:"MC",x:37,y:47},{id:"lm",label:"MI",x:18,y:46},{id:"st",label:"DC",x:50,y:17}],
  "4-2-1-3":   [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm1",label:"MCD",x:65,y:59},{id:"cdm2",label:"MCD",x:35,y:59},{id:"cam",label:"MCO",x:50,y:42},{id:"rw",label:"ED",x:78,y:23},{id:"st",label:"DC",x:50,y:17},{id:"lw",label:"EI",x:22,y:23}],
  "4-2-2-2":   [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm1",label:"MCD",x:65,y:59},{id:"cdm2",label:"MCD",x:35,y:59},{id:"ram",label:"MCO",x:70,y:40},{id:"lam",label:"MCO",x:30,y:40},{id:"st1",label:"DC",x:63,y:21},{id:"st2",label:"DC",x:37,y:21}],
  "4-2-3-1":   [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:72},{id:"cb2",label:"DFC",x:38,y:72},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm1",label:"MCD",x:62,y:57},{id:"cdm2",label:"MCD",x:38,y:57},{id:"ram",label:"MCO",x:76,y:36},{id:"cam",label:"MCO",x:50,y:34},{id:"lam",label:"MCO",x:24,y:36},{id:"st",label:"DC",x:50,y:16}],
  "4-2-3-1(2)":[{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:72},{id:"cb2",label:"DFC",x:38,y:72},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm1",label:"MCD",x:65,y:59},{id:"cdm2",label:"MCD",x:35,y:59},{id:"rw",label:"ED",x:78,y:36},{id:"cam",label:"MCO",x:50,y:34},{id:"lw",label:"EI",x:22,y:36},{id:"st",label:"DC",x:50,y:16}],
  "4-2-4":     [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm1",label:"MCD",x:63,y:58},{id:"cdm2",label:"MCD",x:37,y:58},{id:"rw",label:"ED",x:82,y:24},{id:"rf",label:"DC",x:60,y:20},{id:"lf",label:"DC",x:40,y:20},{id:"lw",label:"EI",x:18,y:24}],
  "4-3-1-2":   [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cm1",label:"MC",x:72,y:54},{id:"cm2",label:"MC",x:50,y:54},{id:"cm3",label:"MC",x:28,y:54},{id:"cam",label:"MCO",x:50,y:38},{id:"st1",label:"DC",x:63,y:21},{id:"st2",label:"DC",x:37,y:21}],
  "4-3-2-1":   [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cm1",label:"MC",x:72,y:54},{id:"cm2",label:"MC",x:50,y:54},{id:"cm3",label:"MC",x:28,y:54},{id:"rf",label:"DC",x:65,y:33},{id:"lf",label:"DC",x:35,y:33},{id:"st",label:"DC",x:50,y:16}],
  "4-3-3":     [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:70},{id:"cb1",label:"DFC",x:62,y:71},{id:"cb2",label:"DFC",x:38,y:71},{id:"lb",label:"DFI",x:20,y:70},{id:"cm1",label:"MC",x:74,y:50},{id:"cm2",label:"MC",x:50,y:47},{id:"cm3",label:"MC",x:26,y:50},{id:"rw",label:"ED",x:80,y:26},{id:"st",label:"DC",x:50,y:17},{id:"lw",label:"EI",x:20,y:26}],
  "4-3-3(2)":  [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cm1",label:"MC",x:72,y:53},{id:"cam",label:"MCO",x:50,y:44},{id:"cm2",label:"MC",x:28,y:53},{id:"rw",label:"ED",x:78,y:24},{id:"st",label:"DC",x:50,y:15},{id:"lw",label:"EI",x:22,y:24}],
  "4-3-3(3)":  [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm",label:"MCD",x:50,y:62},{id:"cm1",label:"MC",x:70,y:49},{id:"cm2",label:"MC",x:30,y:49},{id:"rw",label:"ED",x:78,y:24},{id:"st",label:"DC",x:50,y:15},{id:"lw",label:"EI",x:22,y:24}],
  "4-3-3(4)":  [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"cdm1",label:"MCD",x:65,y:60},{id:"cdm2",label:"MCD",x:35,y:60},{id:"cm",label:"MC",x:50,y:48},{id:"rw",label:"ED",x:78,y:24},{id:"st",label:"DC",x:50,y:15},{id:"lw",label:"EI",x:22,y:24}],
  "4-4-1-1(2)":[{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"rm",label:"MD",x:82,y:52},{id:"cm1",label:"MC",x:62,y:52},{id:"cm2",label:"MC",x:38,y:52},{id:"lm",label:"MI",x:18,y:52},{id:"cam",label:"MCO",x:50,y:35},{id:"st",label:"DC",x:50,y:18}],
  "4-4-2":     [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:70},{id:"cb1",label:"DFC",x:62,y:71},{id:"cb2",label:"DFC",x:38,y:71},{id:"lb",label:"DFI",x:20,y:70},{id:"rm",label:"MD",x:80,y:50},{id:"cm1",label:"MC",x:60,y:50},{id:"cm2",label:"MC",x:40,y:50},{id:"lm",label:"MI",x:20,y:50},{id:"st1",label:"DC",x:63,y:22},{id:"st2",label:"DC",x:37,y:22}],
  "4-4-2(2)":  [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"rm",label:"MD",x:82,y:53},{id:"cdm1",label:"MCD",x:62,y:60},{id:"cdm2",label:"MCD",x:38,y:60},{id:"lm",label:"MI",x:18,y:53},{id:"st1",label:"DC",x:63,y:21},{id:"st2",label:"DC",x:37,y:21}],
  "4-5-1":     [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"rm",label:"MD",x:85,y:50},{id:"cm1",label:"MC",x:67,y:50},{id:"cm2",label:"MC",x:50,y:48},{id:"cm3",label:"MC",x:33,y:50},{id:"lm",label:"MI",x:15,y:50},{id:"st",label:"DC",x:50,y:18}],
  "4-5-1(2)":  [{id:"gk",label:"POR",x:50,y:88},{id:"rb",label:"DFD",x:80,y:72},{id:"cb1",label:"DFC",x:62,y:73},{id:"cb2",label:"DFC",x:38,y:73},{id:"lb",label:"DFI",x:20,y:72},{id:"rm",label:"MD",x:85,y:50},{id:"cm1",label:"MC",x:67,y:50},{id:"cam",label:"MCO",x:50,y:38},{id:"cm2",label:"MC",x:33,y:50},{id:"lm",label:"MI",x:15,y:50},{id:"st",label:"DC",x:50,y:18}],
  "5-2-1-2":   [{id:"gk",label:"POR",x:50,y:88},{id:"rwb",label:"DFD",x:86,y:68},{id:"cb1",label:"DFC",x:70,y:74},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:30,y:74},{id:"lwb",label:"DFI",x:14,y:68},{id:"cm1",label:"MC",x:65,y:54},{id:"cm2",label:"MC",x:35,y:54},{id:"cam",label:"MCO",x:50,y:40},{id:"st1",label:"DC",x:63,y:22},{id:"st2",label:"DC",x:37,y:22}],
  "5-2-3":     [{id:"gk",label:"POR",x:50,y:88},{id:"rwb",label:"DFD",x:86,y:68},{id:"cb1",label:"DFC",x:70,y:74},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:30,y:74},{id:"lwb",label:"DFI",x:14,y:68},{id:"cm1",label:"MC",x:65,y:52},{id:"cm2",label:"MC",x:35,y:52},{id:"rw",label:"ED",x:78,y:24},{id:"st",label:"DC",x:50,y:17},{id:"lw",label:"EI",x:22,y:24}],
  "5-3-2":     [{id:"gk",label:"POR",x:50,y:88},{id:"rwb",label:"DFD",x:86,y:68},{id:"cb1",label:"DFC",x:68,y:73},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:32,y:73},{id:"lwb",label:"DFI",x:14,y:68},{id:"cm1",label:"MC",x:70,y:49},{id:"cm2",label:"MC",x:50,y:47},{id:"cm3",label:"MC",x:30,y:49},{id:"st1",label:"DC",x:63,y:22},{id:"st2",label:"DC",x:37,y:22}],
  "5-4-1":     [{id:"gk",label:"POR",x:50,y:88},{id:"rwb",label:"DFD",x:86,y:69},{id:"cb1",label:"DFC",x:68,y:74},{id:"cb2",label:"DFC",x:50,y:75},{id:"cb3",label:"DFC",x:32,y:74},{id:"lwb",label:"DFI",x:14,y:69},{id:"rm",label:"MD",x:80,y:50},{id:"cm1",label:"MC",x:60,y:50},{id:"cm2",label:"MC",x:40,y:50},{id:"lm",label:"MI",x:20,y:50},{id:"st",label:"DC",x:50,y:18}],
};

const POSITIONS_LIST = ["POR","DFC","DFD","DFI","MCD","MC","MCO","MD","MI","ED","EI","DC"];

const FC26_DB = [
  {id:1,name:"T. Courtois",pos:"GK",team:"Real Madrid",age:32},
  {id:2,name:"M. ter Stegen",pos:"GK",team:"FC Barcelona",age:32},
  {id:3,name:"G. Donnarumma",pos:"GK",team:"PSG",age:26},
  {id:4,name:"E. Martínez",pos:"GK",team:"Aston Villa",age:32},
  {id:5,name:"M. Maignan",pos:"GK",team:"AC Milan",age:29},
  {id:6,name:"V. van Dijk",pos:"CB",team:"Liverpool",age:33},
  {id:7,name:"W. Saliba",pos:"CB",team:"Arsenal",age:23},
  {id:8,name:"A. Bastoni",pos:"CB",team:"Inter Milan",age:25},
  {id:9,name:"A. Rüdiger",pos:"CB",team:"Real Madrid",age:31},
  {id:10,name:"C. Romero",pos:"CB",team:"Tottenham",age:26},
  {id:11,name:"T. Alexander-Arnold",pos:"RB",team:"Liverpool",age:25},
  {id:12,name:"D. Carvajal",pos:"RB",team:"Real Madrid",age:32},
  {id:13,name:"A. Robertson",pos:"LB",team:"Liverpool",age:30},
  {id:14,name:"Theo Hernández",pos:"LB",team:"AC Milan",age:26},
  {id:15,name:"R. Grimaldo",pos:"LB",team:"Leverkusen",age:28},
  {id:16,name:"Rodri",pos:"CDM",team:"Man City",age:28},
  {id:17,name:"Casemiro",pos:"CDM",team:"Man United",age:32},
  {id:18,name:"A. Tchouaméni",pos:"CDM",team:"Real Madrid",age:24},
  {id:19,name:"J. Bellingham",pos:"CM",team:"Real Madrid",age:20},
  {id:20,name:"T. Kroos",pos:"CM",team:"Real Madrid",age:34},
  {id:21,name:"K. De Bruyne",pos:"CM",team:"Man City",age:33},
  {id:22,name:"Pedri",pos:"CM",team:"FC Barcelona",age:22},
  {id:23,name:"F. de Jong",pos:"CM",team:"FC Barcelona",age:26},
  {id:24,name:"D. Rice",pos:"CM",team:"Arsenal",age:25},
  {id:25,name:"M. Ødegaard",pos:"CAM",team:"Arsenal",age:25},
  {id:26,name:"B. Silva",pos:"CAM",team:"Man City",age:29},
  {id:27,name:"Vinícius Jr.",pos:"LW",team:"Real Madrid",age:23},
  {id:28,name:"K. Mbappé",pos:"LW",team:"Real Madrid",age:25},
  {id:29,name:"R. Leão",pos:"LW",team:"AC Milan",age:24},
  {id:30,name:"L. Díaz",pos:"LW",team:"Liverpool",age:27},
  {id:31,name:"M. Salah",pos:"RW",team:"Liverpool",age:31},
  {id:32,name:"B. Saka",pos:"RW",team:"Arsenal",age:22},
  {id:33,name:"Lamine Yamal",pos:"RW",team:"FC Barcelona",age:17},
  {id:34,name:"Raphinha",pos:"RW",team:"FC Barcelona",age:27},
  {id:35,name:"E. Haaland",pos:"ST",team:"Man City",age:24},
  {id:36,name:"H. Kane",pos:"ST",team:"Bayern Munich",age:30},
  {id:37,name:"R. Lewandowski",pos:"ST",team:"FC Barcelona",age:35},
  {id:38,name:"V. Osimhen",pos:"ST",team:"Napoli",age:25},
  {id:39,name:"O. Watkins",pos:"ST",team:"Aston Villa",age:28},
  {id:40,name:"A. Isak",pos:"ST",team:"Newcastle",age:24},
];

function searchPlayers(q){
  const low=q.toLowerCase().trim();
  if(!low) return FC26_DB.slice(0,20);
  const posMap={"portero":"GK","gk":"GK","defensa":"CB","cb":"CB","lateral":"RB","rb":"RB","lb":"LB","pivote":"CDM","cdm":"CDM","medio":"CM","cm":"CM","mediapunta":"CAM","cam":"CAM","extremo":"RW","rw":"RW","lw":"LW","delantero":"ST","st":"ST","porteros":"GK","defensas":"CB","extremos":"RW","delanteros":"ST","medios":"CM"};
  const posFilter=posMap[low];
  return FC26_DB.filter(p=>
    p.name.toLowerCase().includes(low)||p.team.toLowerCase().includes(low)||
    p.pos.toLowerCase()===low||(posFilter&&p.pos===posFilter)||
    (low.includes("barca")&&p.team.includes("Barcelona"))||
    (low.includes("barça")&&p.team.includes("Barcelona"))||
    (low.includes("madrid")&&p.team.includes("Real Madrid"))||
    (low.includes("liverpool")&&p.team.includes("Liverpool"))||
    (low.includes("arsenal")&&p.team.includes("Arsenal"))||
    (low.includes("city")&&p.team.includes("Man City"))
  ).slice(0,20);
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({onAuth}){
  const[mode,setMode]=useState("login");
  const[teamName,setTeamName]=useState("");
  const[teamColor,setTeamColor]=useState("blue");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[confirmPw,setConfirmPw]=useState("");
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");

  const handleSubmit=async()=>{
    setError("");setLoading(true);
    try{
      if(mode==="register"){
        if(!teamName.trim()){setError("Escribe el nombre de tu equipo.");setLoading(false);return;}
        if(password!==confirmPw){setError("Las contraseñas no coinciden.");setLoading(false);return;}
        if(password.length<6){setError("Mínimo 6 caracteres.");setLoading(false);return;}
        const cred=await createUserWithEmailAndPassword(auth,email,password);
        await updateProfile(cred.user,{displayName:teamName.trim()});
        // Save color to Firestore teams doc
        await setDoc(doc(db,"teams",cred.user.uid),{uid:cred.user.uid,email:cred.user.email,teamName:teamName.trim(),teamColor,squad:[],lineups:[{id:"a",name:"Liga",formation:"4-3-3",starters:{},subs:Array(7).fill(null)},{id:"b",name:"Copa",formation:"4-3-3",starters:{},subs:Array(7).fill(null)}],createdAt:new Date().toISOString()});
        onAuth(cred.user);
      }else{
        const cred=await signInWithEmailAndPassword(auth,email,password);
        onAuth(cred.user);
      }
    }catch(e){
      const msgs={"auth/email-already-in-use":"Email ya registrado.","auth/invalid-email":"Email inválido.","auth/user-not-found":"Usuario no encontrado.","auth/wrong-password":"Contraseña incorrecta.","auth/invalid-credential":"Email o contraseña incorrectos.","auth/weak-password":"Contraseña muy débil."};
      setError(msgs[e.code]||"Error: "+e.message);
    }
    setLoading(false);
  };

  const inp={width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",marginBottom:12};

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}input::placeholder{color:${C.textFaint}}`}</style>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:24,padding:"36px 32px",width:"100%",maxWidth:400,boxShadow:"0 12px 48px rgba(196,154,42,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src="data:image/png;base64,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" style={{width:110,height:110,marginBottom:10,borderRadius:"50%",objectFit:"cover"}}/>
          <h1 style={{fontSize:22,fontWeight:800,color:C.text,margin:"0 0 8px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>FEDERACIÓN LIGA SIMULADA</h1>
          <p style={{fontSize:12,color:C.textLight,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{mode==="login"?"Inicia sesión para gestionar tu equipo":"Crea tu cuenta y equipo"}</p>
        </div>
        <div style={{display:"flex",background:C.inputBg,borderRadius:12,padding:4,marginBottom:24,border:`1px solid ${C.border}`}}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError("");}}
              style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",background:mode===m?C.accent:"transparent",color:mode===m?"#fff":C.textMid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>
              {m==="login"?"Iniciar sesión":"Registrarse"}
            </button>
          ))}
        </div>
        {mode==="register"&&(
          <><label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Nombre de tu equipo</label>
          <input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="Ej. FC Javier…" style={inp} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
          <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Color del equipo</label>
          <div style={{marginBottom:14}}><ColorPicker selected={teamColor} onChange={setTeamColor}/></div>
          </>
        )}
        <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Correo electrónico</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={inp} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
        <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Contraseña</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
        {mode==="register"&&(
          <><label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Confirmar contraseña</label>
          <input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="Repite la contraseña" style={{...inp,marginBottom:0}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/></>
        )}
        {error&&<p style={{color:"#c0392b",fontSize:12,margin:"10px 0 0",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>⚠ {error}</p>}
        <button onClick={handleSubmit} disabled={loading}
          style={{width:"100%",padding:"14px",background:C.accent,color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:800,cursor:"pointer",marginTop:18,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,opacity:loading?0.6:1,boxShadow:`0 4px 20px ${C.goldLight}`}}>
          {loading?"...":(mode==="login"?"ENTRAR":"CREAR CUENTA")}
        </button>
      </div>
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
// ─── PALETA DE COLORES ────────────────────────────────────────────────────────
const TEAM_COLORS = [
  {id:"blue",    name:"Azul",       bg:"#1a6bb5", dark:"#0f4a8a"},
  {id:"red",     name:"Rojo",       bg:"#c0392b", dark:"#922b21"},
  {id:"green",   name:"Verde",      bg:"#1e8449", dark:"#145a32"},
  {id:"yellow",  name:"Amarillo",   bg:"#d4ac0d", dark:"#9a7d0a"},
  {id:"purple",  name:"Morado",     bg:"#7d3c98", dark:"#5b2c6f"},
  {id:"orange",  name:"Naranja",    bg:"#ca6f1e", dark:"#935116"},
  {id:"black",   name:"Negro",      bg:"#1c1c1c", dark:"#000000"},
  {id:"sky",     name:"Celeste",    bg:"#2e86c1", dark:"#1a5276"},
  {id:"pink",    name:"Rosa",       bg:"#c0498b", dark:"#922b6e"},
  {id:"brown",   name:"Café",       bg:"#7e5109", dark:"#5d3a07"},
  {id:"gray",    name:"Gris",       bg:"#616a6b", dark:"#424949"},
  {id:"lime",    name:"Lima",       bg:"#1d8348", dark:"#196f3d"},
  {id:"navy",    name:"Marino",     bg:"#1b2631", dark:"#0e1626"},
  {id:"maroon",  name:"Granate",    bg:"#7b241c", dark:"#5c1a15"},
  {id:"teal",    name:"Turquesa",   bg:"#148f77", dark:"#0e6655"},
  {id:"gold",    name:"Dorado",     bg:"#c49a2a", dark:"#a07c1a"},
];

function getTeamColor(colorId){
  return TEAM_COLORS.find(c=>c.id===colorId)||TEAM_COLORS[0];
}

function ColorPicker({selected,onChange}){
  return(
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {TEAM_COLORS.map(c=>(
        <button key={c.id} onClick={()=>onChange(c.id)} title={c.name}
          style={{width:28,height:28,borderRadius:"50%",background:c.bg,border:selected===c.id?"3px solid #1a1a1a":"2px solid rgba(0,0,0,0.15)",cursor:"pointer",transition:"transform .1s",transform:selected===c.id?"scale(1.2)":"scale(1)"}}>
        </button>
      ))}
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({name,size=50,colorId,overall}){
  const i=name?name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():"?";
  const color=getTeamColor(colorId);
  const label=overall?String(overall):i;
  const fontSize=overall?size*0.36:size*0.32;
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color.dark},${color.bg})`,border:"2.5px solid rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 10px rgba(0,0,0,0.15)",flexShrink:0}}>
      <span style={{fontSize,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:overall?0:0.5}}>{label}</span>
    </div>
  );
}

// ─── ADD PLAYER MODAL ─────────────────────────────────────────────────────────
function AddPlayerModal({onAdd,onClose,currentCount,pool,teamName,editPlayer,onSaveEdit,isAdmin}){
  const isEdit=!!editPlayer;
  const[tab,setTab]=useState(isEdit?"manual":"search");
  const[query,setQuery]=useState("");
  const[results,setResults]=useState(FC26_DB.slice(0,20));
  const[mName,setMName]=useState(editPlayer?.name||"");
  const[mPos,setMPos]=useState(editPlayer?.pos?.split("/")||[]);
  const[mCountry,setMCountry]=useState(editPlayer?.country||"");
  const[mAge,setMAge]=useState(editPlayer?.age||"");
  const[mOverall,setMOverall]=useState(editPlayer?.overall||"");
  const[mPrice,setMPrice]=useState(editPlayer?.price?.value||"");
  const[mPriceUnit,setMPriceUnit]=useState(editPlayer?.price?.unit||"M");
  const[mErr,setMErr]=useState("");
  const remaining=26-currentCount;

  const TS=a=>({flex:1,padding:"9px 0",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:a?C.text:C.textFaint,borderBottom:a?`2px solid ${C.accent}`:"2px solid transparent",fontFamily:"'DM Sans',sans-serif"});
  const togglePos=(p)=>setMPos(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p]);

  const getTakenBy=(poolKey)=>{
    if(!pool||!poolKey) return null;
    const entry=pool[poolKey];
    if(entry&&entry.teamName!==teamName) return entry.teamName;
    return null;
  };

  const handleManual=()=>{
    if(!mName.trim()){setMErr("Nombre obligatorio.");return;}
    if(mPos.length===0){setMErr("Selecciona al menos una posición preferida.");return;}
    const poolKey=isEdit?(editPlayer?.poolKey||`name_${mName.trim().toLowerCase().replace(/\s+/g,"_")}`): `name_${mName.trim().toLowerCase().replace(/\s+/g,"_")}`;
    if(!isEdit){
      const taken=getTakenBy(poolKey);
      if(taken){setMErr(`Ya registrado por ${taken}.`);return;}
    }
    setMErr("");
    const primaryPos=mPos[0];
    const secondaryPos=mPos.slice(1).join("/");
    const playerData={id:`p_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,name:mName.trim(),pos:mPos.join("/"),primaryPos,secondaryPos:secondaryPos||null,country:mCountry.trim()||null,age:mAge?parseInt(mAge):null,overall:mOverall?parseInt(mOverall):null,price:mPrice?{value:parseFloat(mPrice),unit:mPriceUnit}:null,poolKey};
    if(isEdit) onSaveEdit({...editPlayer,...playerData});
    else onAdd({id:`p_${Date.now()}`,...playerData});
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:440,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(196,154,42,0.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"16px 20px 0",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
            <div>
              <span style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Agregar a plantilla</span>
              <div style={{fontSize:10,color:remaining>0?C.accent:"#c0392b",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{remaining>0?`${remaining} lugares disponibles`:"Plantilla completa (26/26)"}</div>
            </div>
            <button onClick={onClose} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:30,height:30,color:C.textMid,cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          <div style={{display:"flex"}}>{!isEdit&&<button style={TS(tab==="search")} onClick={()=>setTab("search")}>🔍 Buscar FC26</button>}<button style={TS(tab==="manual")} onClick={()=>setTab("manual")}>{isEdit?"✏️ Editar jugador":"✏️ Manual"}</button></div>
        </div>

        {tab==="search"&&!isEdit&&(
          <>
            <div style={{padding:"11px 16px 8px",flexShrink:0}}>
              <input value={query} onChange={e=>{setQuery(e.target.value);setResults(searchPlayers(e.target.value));}} placeholder="Nombre, equipo, posición…"
                style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                {["Porteros","Defensas","Medios","Extremos","Delanteros","Barça","Real Madrid"].map(t=>(
                  <button key={t} onClick={()=>{setQuery(t);setResults(searchPlayers(t));}}
                    style={{fontSize:10,padding:"3px 9px",borderRadius:20,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {results.map((p,i)=>{
                const poolKey=`fc26_${p.id}`;
                const takenBy=getTakenBy(poolKey);
                const canAdd=remaining>0&&!takenBy;
                return(
                  <div key={p.id} onClick={()=>canAdd&&onAdd({...p,id:poolKey,poolKey,primaryPos:p.pos,secondaryPos:null})}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",cursor:canAdd?"pointer":"not-allowed",borderBottom:`1px solid ${C.border}`,transition:"background .1s",opacity:canAdd?1:0.45}}
                    onMouseEnter={e=>canAdd&&(e.currentTarget.style.background=C.inputBg)} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <Avatar name={p.name} size={38}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                      <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.team} · {p.age}a</div>
                      {takenBy&&<span style={{fontSize:9,color:"#c0392b",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>🔒 Tomado por {takenBy}</span>}
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:C.textLight,background:C.inputBg,padding:"3px 8px",borderRadius:6,fontFamily:"monospace",border:`1px solid ${C.border}`}}>{p.pos}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab==="manual"&&(
          <div style={{overflowY:"auto",flex:1,padding:"14px 18px 22px"}}>
            {[["Nombre *",mName,setMName,"Ej. Carlos Ruiz"],["País",mCountry,setMCountry,"Ej. Guatemala"]].map(([label,val,setter,ph])=>(
              <div key={label} style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
                <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                  style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              </div>
            ))}
            <div style={{display:"flex",gap:9,marginBottom:12}}>
              <div style={{flex:1}}>
                <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Edad</label>
                <input value={mAge} onChange={e=>setMAge(e.target.value)} type="number" min="14" max="50" placeholder="25"
                  style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"monospace"}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              </div>
              <div style={{flex:1}}>
                <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Media (0-99)</label>
                <input value={mOverall} onChange={e=>setMOverall(e.target.value)} type="number" min="0" max="99" placeholder="75"
                  style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"monospace"}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              </div>
            </div>
            {/* PRICE - admin only */}
            {isAdmin?(
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>💰 Valor de mercado</label>
                <div style={{display:"flex",gap:6}}>
                  <input value={mPrice} onChange={e=>setMPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="23.5"
                    style={{flex:1,padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"monospace"}}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
                  <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:`1.5px solid ${C.borderDark}`,flexShrink:0}}>
                    {["M","K"].map(u=>(
                      <button key={u} onClick={()=>setMPriceUnit(u)}
                        style={{width:40,padding:"10px 0",border:"none",background:mPriceUnit===u?C.accent:C.inputBg,color:mPriceUnit===u?"#fff":C.textMid,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,borderRight:u==="M"?`1px solid ${C.borderDark}`:"none"}}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{fontSize:9,color:C.textFaint,marginTop:3,fontFamily:"'DM Sans',sans-serif"}}>M = millones · K = miles (ej: 23.5M o 500K)</div>
              </div>
            ):editPlayer?.price?(
              <div style={{marginBottom:12,padding:"10px 13px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.borderDark}`,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13}}>🔒</span>
                <div>
                  <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.5}}>Valor de mercado</div>
                  <div style={{fontSize:13,fontWeight:700,color:"#27ae60",fontFamily:"monospace"}}>💰 {editPlayer.price.value}{editPlayer.price.unit}</div>
                </div>
                <span style={{fontSize:9,color:C.textFaint,marginLeft:"auto",fontFamily:"'DM Sans',sans-serif"}}>Solo admins</span>
              </div>
            ):null}
            <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Posición preferida <span style={{fontSize:9,color:C.textFaint,textTransform:"none"}}>(primera seleccionada)</span></label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {POSITIONS_LIST.map(p=>(
                <button key={p} onClick={()=>togglePos(p)}
                  style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${mPos[0]===p?"#1a1a1a":mPos.includes(p)?C.accent:C.borderDark}`,background:mPos[0]===p?"#1a1a1a":mPos.includes(p)?C.accentLight:C.inputBg,color:mPos[0]===p?"#fff":mPos.includes(p)?C.accent:C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace",transition:"all .15s"}}>
                  {p}{mPos[0]===p?" ★":""}
                </button>
              ))}
            </div>
            {mPos.length>0&&<div style={{fontSize:10,color:C.textLight,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
              Preferida: <strong style={{color:C.text}}>{mPos[0]}</strong>
              {mPos.length>1&&<> · Secundarias: <strong style={{color:C.textLight}}>{mPos.slice(1).join(", ")}</strong></>}
            </div>}
            {mErr&&<p style={{color:"#c0392b",fontSize:12,margin:"0 0 10px",fontFamily:"'DM Sans',sans-serif"}}>⚠ {mErr}</p>}
            <button onClick={handleManual} disabled={!isEdit&&remaining<=0}
              style={{width:"100%",padding:"12px",background:(!isEdit&&remaining<=0)?"#ccc":C.accent,color:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:800,cursor:(!isEdit&&remaining<=0)?"not-allowed":"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
              {isEdit?"GUARDAR CAMBIOS":"AGREGAR A PLANTILLA"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PICK FROM SQUAD ──────────────────────────────────────────────────────────
function PickFromSquad({squad,posLabel,onPick,onClose,usedIds,posFilter,isBench}){
  const[showAll,setShowAll]=useState(isBench||!posFilter);
  const[filter,setFilter]=useState("");

  const norm=s=>String(s||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ");
  const matchP=(a,b)=>
    !!(a&&b&&(
      (a.poolKey&&b.poolKey&&a.poolKey===b.poolKey)||
      (a.id&&b.id&&a.id!==undefined&&a.id===b.id)
    ));
  const toES=pos=>{if(!pos) return "";const t=pos.trim();return POS_EN_ES[t]||t;};
  const splitPos=pos=>(pos||"").split(/[\/\|\-]+/).map(s=>s.trim()).filter(s=>s.length>0&&s.length<6);
  const getPlayerPos=p=>[...new Set([...splitPos(p.pos),...splitPos(p.primaryPos)].map(toES).filter(Boolean))];
  const getPrimaryPos=p=>toES(splitPos(p.primaryPos||p.pos||"")[0]||"");
  const usedPlayers=(usedIds||[]).map(uid=>squad.find(p=>p.poolKey===uid||(p.id&&p.id===uid))).filter(Boolean);
  const available=squad.filter(p=>{
    const pKey=p.poolKey;const pId=p.id;
    return !usedIds?.some(uid=>(pKey&&uid===pKey)||(pId&&uid===pId));
  });
  const inPosition=posFilter?available.filter(p=>getPlayerPos(p).includes(posFilter)||getPrimaryPos(p)===posFilter):available;
  const list=showAll?available.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase())):inPosition.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase()));

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:400,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(196,154,42,0.12)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"14px 20px 11px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:9}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
              {isBench?"Asignar suplente":"Asignar"} <span style={{color:C.accent,fontFamily:"monospace",background:C.goldLight,padding:"1px 7px",borderRadius:6}}>{posLabel}</span>
            </span>
            <button onClick={onClose} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          {posFilter&&!isBench&&(
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <button onClick={()=>setShowAll(false)}
                style={{flex:1,padding:"6px",borderRadius:8,border:`1.5px solid ${!showAll?C.accent:C.borderDark}`,background:!showAll?C.accent:C.inputBg,color:!showAll?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                En posición ({inPosition.length})
              </button>
              <button onClick={()=>setShowAll(true)}
                style={{flex:1,padding:"6px",borderRadius:8,border:`1.5px solid ${showAll?C.accent:C.borderDark}`,background:showAll?C.accentLight:C.inputBg,color:showAll?C.accent:C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                ⚠ Fuera de posición
              </button>
            </div>
          )}
          <input autoFocus value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar…"
            style={{width:"100%",padding:"9px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {available.length===0&&<div style={{padding:"32px",textAlign:"center",color:C.textFaint,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>No hay jugadores disponibles en reservas.</div>}
          {list.length===0&&available.length>0&&<div style={{padding:"16px",textAlign:"center",color:C.textFaint,fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>No hay jugadores en esta posición.<br/><button onClick={()=>setShowAll(true)} style={{marginTop:8,padding:"6px 14px",borderRadius:8,border:`1px solid ${C.accent}`,background:C.goldLight,color:C.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Ver fuera de posición</button></div>}
          {list.map(p=>{
            const playerAllPos=getPlayerPos(p);
            const primary=getPrimaryPos(p);
            const isOutOfPos=posFilter&&!playerAllPos.includes(posFilter)&&primary!==posFilter;
            return(
              <div key={p.id} onClick={()=>onPick(p)}
                style={{display:"flex",alignItems:"center",gap:11,padding:"10px 18px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,transition:"background .1s",background:isOutOfPos?"#fffbf0":"transparent"}}
                onMouseEnter={e=>e.currentTarget.style.background=isOutOfPos?"#fff5dc":C.inputBg} onMouseLeave={e=>e.currentTarget.style.background=isOutOfPos?"#fffbf0":"transparent"}>
                <Avatar name={p.name} size={38}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                    {isOutOfPos&&<span style={{fontSize:10}}>⚠️</span>}
                  </div>
                  <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.country||p.nat||""}{(p.country||p.nat)&&p.age?" · ":""}{p.age?`${p.age}a`:""}{p.overall?` · ${p.overall}⭐`:""}</div>
                </div>
                <span style={{fontSize:10,fontWeight:700,color:isOutOfPos?"#e67e22":C.accent,background:isOutOfPos?"rgba(230,126,34,0.1)":C.goldLight,padding:"3px 8px",borderRadius:6,fontFamily:"monospace",border:`1px solid ${isOutOfPos?"#e67e22":C.border}`}}>{primary}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PLAYER SPOT ──────────────────────────────────────────────────────────────
function PlayerSpot({pos,player,readOnly,onClick,onRemove,isDragOver,onDragOver,onDragLeave,onDrop,onDragStart,teamColor}){
  const[showMenu,setShowMenu]=useState(false);
  return(
    <div style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,transform:"translate(-50%,-50%)",zIndex:showMenu?30:10,cursor:readOnly?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}
      onDragOver={readOnly?undefined:e=>{e.preventDefault();onDragOver(pos.id);}}
      onDragLeave={readOnly?undefined:onDragLeave}
      onDrop={readOnly?undefined:e=>{e.preventDefault();onDrop(pos.id);}}>
      {player?(
        <>
          <div style={{position:"relative"}}
            draggable={!readOnly}
            onDragStart={readOnly?undefined:e=>{e.stopPropagation();onDragStart&&onDragStart(pos.id);}}>
            <div onClick={readOnly?undefined:e=>{e.stopPropagation();setShowMenu(v=>!v);}}>
              <Avatar name={player.name} size={38} colorId={teamColor} overall={player.overall}/>
              {isDragOver&&<div style={{position:"absolute",inset:-2,borderRadius:"50%",border:`2px dashed ${C.accent}`,pointerEvents:"none"}}/>}
            </div>
            {showMenu&&!readOnly&&(
              <div style={{position:"absolute",[pos.y>70?"bottom":"top"]:"110%",left:"50%",transform:"translateX(-50%)",background:C.card,border:`1.5px solid ${C.accent}`,borderRadius:10,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:50,minWidth:120}}>
                <div onClick={e=>{e.stopPropagation();setShowMenu(false);onClick(pos.id,pos.label);}}
                  style={{padding:"11px 16px",fontSize:13,fontWeight:700,color:C.text,cursor:"pointer",borderBottom:`1px solid ${C.border}`,fontFamily:"'DM Sans',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.inputBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  🔄 Cambiar
                </div>
                <div onClick={e=>{e.stopPropagation();setShowMenu(false);onRemove(pos.id);}}
                  style={{padding:"11px 16px",fontSize:13,fontWeight:700,color:"#c0392b",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#fff5f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  ✕ Quitar
                </div>
              </div>
            )}
          </div>
            <div style={{background:"rgba(26,20,8,0.78)",backdropFilter:"blur(4px)",borderRadius:5,padding:"2px 7px",textAlign:"center",maxWidth:72}}
            onClick={readOnly?undefined:e=>{e.stopPropagation();setShowMenu(v=>!v);}}>
            <div style={{color:"#fff",fontSize:8,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:0.3,fontFamily:"'Bebas Neue',sans-serif"}}>{player.name.split(" ").slice(-1)[0].toUpperCase()}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:2}}>
              {(()=>{
                const playerPrimaryPos=player.primaryPos||player.pos?.split("/")?.[0];
                const allPlayerPos=player.pos?.split("/")||[];
                const isOutOfPos=!allPlayerPos.includes(pos.label)&&playerPrimaryPos!==pos.label;
                return(<>
                  {isOutOfPos&&<span style={{fontSize:7,color:"#FFD700"}}>⚠</span>}
                  <span style={{color:isOutOfPos?"#FFD700":C.gold,fontSize:7.5,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{pos.label}</span>
                </>);
              })()}
            </div>
          </div>
        </>
      ):(
        <>
          <div onClick={readOnly?undefined:()=>onClick(pos.id,pos.label)}
            style={{width:38,height:38,borderRadius:"50%",border:`2px dashed ${readOnly?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.55)"}`,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.08)",transition:"all .2s",transform:isDragOver?"scale(1.12)":"scale(1)"}}>
            {!readOnly&&<span style={{color:"rgba(255,255,255,0.65)",fontSize:16}}>+</span>}
          </div>
          <span style={{color:"rgba(255,255,255,0.55)",fontSize:9,fontWeight:700,letterSpacing:0.5,fontFamily:"'Bebas Neue',sans-serif"}}>{pos.label}</span>
        </>
      )}
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
function Field({positions,lineup,readOnly,onClickPos,onRemovePos,dragOverPos,onDragOver,onDragLeave,onDrop,onDragStartPos,teamColor}){
  return(
    <div style={{position:"relative",width:"100%",paddingBottom:"133%",borderRadius:16,overflow:"hidden",boxShadow:"0 16px 48px rgba(0,0,0,0.18)"}}>
      {lineup?.code&&(
        <div style={{position:"absolute",top:8,right:8,zIndex:20,background:"rgba(0,0,0,0.55)",borderRadius:6,padding:"2px 8px",backdropFilter:"blur(4px)"}}>
          <span style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.9)",fontFamily:"monospace",letterSpacing:1}}>{lineup.code}</span>
        </div>
      )}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#1a5c2a 0%,#1e6b30 25%,#1a5c2a 50%,#1e6b30 75%,#1a5c2a 100%)"}}/>
      <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}} viewBox="0 0 100 133" preserveAspectRatio="none">
        {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=><rect key={i} x="0" y={i*10.25} width="100" height="10.25" fill={i%2===0?"rgba(0,0,0,0.06)":"rgba(255,255,255,0.03)"}/>)}
        <rect x="4" y="2.5" width="92" height="128" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
        <line x1="4" y1="66" x2="96" y2="66" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
        <circle cx="50" cy="66" r="13" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
        <circle cx="50" cy="66" r="1" fill="rgba(255,255,255,0.6)"/>
        <rect x="22" y="2.5" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6"/>
        <rect x="36" y="2.5" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
        <rect x="22" y="110.5" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6"/>
        <rect x="36" y="122.5" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
      </svg>
      {positions.map(pos=>(
        <PlayerSpot key={pos.id} pos={pos} player={lineup?.starters?.[pos.id]} readOnly={readOnly}
          onClick={onClickPos||(() =>{})}
          onRemove={onRemovePos||(() =>{})}
          isDragOver={dragOverPos===pos.id}
          onDragOver={onDragOver||(() =>{})}
          onDragLeave={onDragLeave||(() =>{})}
          onDrop={onDrop||(() =>{})}
          onDragStart={onDragStartPos||(() =>{})}
          teamColor={teamColor}/>
      ))}
      {readOnly&&<div style={{position:"absolute",top:8,right:8,background:"rgba(26,20,8,0.72)",color:C.gold,fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:8,fontFamily:"'DM Sans',sans-serif"}}>👁 Solo lectura</div>}
    </div>
  );
}

// ─── BENCH ────────────────────────────────────────────────────────────────────
function Bench({subs,readOnly,onClickSub,onDragStart,teamColor}){
  const color=getTeamColor(teamColor);
  const accent=color.bg;
  const accentDark=color.dark;
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 12px 15px",boxShadow:"0 2px 12px rgba(196,154,42,0.08)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{width:3,height:16,background:C.accent,borderRadius:2}}/>
        <span style={{fontSize:13,fontWeight:800,color:C.text,letterSpacing:1.5,fontFamily:"'Bebas Neue',sans-serif"}}>BANCA</span>
        <span style={{marginLeft:"auto",fontSize:10,color:"#fff",background:accent,padding:"2px 8px",borderRadius:20,fontWeight:700,fontFamily:"'DM Sans',sans-serif",border:`1px solid ${accentDark}`}}>{(subs||[]).filter(Boolean).length}/7</span>
        {!readOnly&&<span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Toca para asignar</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
        {(subs||Array(7).fill(null)).map((sub,i)=>(
          <div key={i} draggable={!!sub&&!readOnly} onDragStart={()=>{onDragStart&&onDragStart(i);}}
            onClick={readOnly?undefined:()=>onClickSub&&onClickSub(i)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",background:sub?C.inputBg:C.bg,border:`1px solid ${sub?C.borderDark:C.border}`,borderRadius:10,padding:"8px 2px 7px",cursor:readOnly?"default":"pointer",transition:"all .15s",userSelect:"none",gap:4}}
            onMouseEnter={e=>{if(!readOnly){e.currentTarget.style.background="#f0e5c0";e.currentTarget.style.borderColor=C.accent;}}}
            onMouseLeave={e=>{e.currentTarget.style.background=sub?C.inputBg:C.bg;e.currentTarget.style.borderColor=sub?C.borderDark:C.border;}}>
            {sub?(
              <>
                <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${color.dark},${color.bg})`,border:"2.5px solid rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.12)",flexShrink:0}}>
                  <span style={{fontSize:sub.overall?11:9,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif"}}>{sub.overall||sub.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
                </div>
                <div style={{textAlign:"center",width:"100%"}}>
                  <div style={{fontSize:7.5,fontWeight:800,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Bebas Neue',sans-serif",padding:"0 2px"}}>{sub.name.split(" ").slice(-1)[0].toUpperCase()}</div>
                </div>
              </>
            ):(
              <>
                <div style={{width:36,height:36,borderRadius:"50%",border:`1.5px dashed ${C.borderDark}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:C.borderDark,fontSize:17}}>+</span>
                </div>
                <div style={{fontSize:7.5,color:C.textFaint,fontWeight:700,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5,marginTop:3}}>SUB {i+1}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN TEAM EDITOR ────────────────────────────────────────────────────────
function AdminTeamEditor({teamData,pool,allTeamsRef}){
  const teamDocId=teamData.id||teamData.uid; // Use doc ID, works for teams with/without president
  const[showAddPlayer,setShowAddPlayer]=useState(false);
  const[pickModal,setPickModal]=useState(null);
  const[saving,setSaving]=useState(false);
  const[localData,setLocalData]=useState(teamData);
  const[showReserves,setShowReserves]=useState(false);
  const[activeAdminLineupId,setActiveAdminLineupId]=useState(null);
  const[newLineupName,setNewLineupName]=useState("");
  const[editingAdminPlayer,setEditingAdminPlayer]=useState(null);
  const[transferAdminPlayer,setTransferAdminPlayer]=useState(null);
  const[transferAllPlayers,setTransferAllPlayers]=useState(false);
  const dragSubIdx=useRef(null);
  const dragFromPosId=useRef(null);
  const[dragOverPos,setDragOverPos]=useState(null);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"teams",teamDocId),snap=>{
      if(snap.exists()){
        const d=snap.data();
        const rawSquad=d.squad||[];
        const seenNames=new Set();
        const squad=rawSquad.map(normPlayer).filter(p=>{
          const name=(p.name||"").trim().toLowerCase();
          if(!name||seenNames.has(name)) return false;
          seenNames.add(name);
          return true;
        });
        const fixP=p=>{
          if(!p) return null;
          const canonical=squad.find(s=>(s.name||"").trim().toLowerCase()===(p.name||"").trim().toLowerCase());
          if(canonical) return{...canonical};
          const sqNames=new Set(squad.map(s=>(s.name||"").trim().toLowerCase()));
          return sqNames.has((p.name||"").trim().toLowerCase())?normPlayer(p):null;
        };
        const lineups=(d.lineups||[]).map(l=>({
          ...l,
          starters:Object.fromEntries(Object.entries(l.starters||{}).map(([k,v])=>[k,fixP(v)]).filter(([,v])=>v)),
          subs:(l.subs||[]).map(s=>fixP(s))
        }));
        const hadDupes=squad.length<rawSquad.length;
        const hadEnglish=rawSquad.some(p=>p.pos&&Object.keys(POS_EN_ES).some(en=>p.pos.split('/').includes(en)));
        if(hadDupes||hadEnglish){
          updateDoc(doc(db,"teams",teamDocId),{squad,lineups}).catch(()=>{});
        }
        setLocalData({id:snap.id,...d,squad,lineups});
      }
    });
    return unsub;
  },[teamDocId]);

  const save=async patch=>{
    setSaving(true);
    await updateDoc(doc(db,"teams",teamDocId),patch);
    // Si cambió el teamName → actualizar todos los jugadores del pool de este equipo
    if(patch.teamName){
      try{
        const pSnap=await getDoc(doc(db,"pool","players"));
        if(pSnap.exists()){
          const pd={...pSnap.data()};
          let changed=false;
          Object.keys(pd).forEach(k=>{
            if(pd[k].teamUid===teamDocId){pd[k]={...pd[k],teamName:patch.teamName};changed=true;}
          });
          if(changed) await setDoc(doc(db,"pool","players"),pd);
        }
      }catch(e){}
    }
    setSaving(false);
  };
  const allLineups=localData.lineups||[{id:"a",name:"Alineación A",formation:"4-3-3",starters:{},subs:Array(7).fill(null)}];
  const lineup=allLineups.find(l=>l.id===activeAdminLineupId)||allLineups[0]||{formation:"4-3-3",starters:{},subs:Array(7).fill(null)};
  const squad=localData.squad||[];
  const positions=FORMATIONS[lineup.formation]||FORMATIONS["4-3-3"];
  const[showAdminRequisitos,setShowAdminRequisitos]=useState(false);

  // ─── Validación de alineación (Liga / Copa) — vista admin ────────────────
  const validarAlineacionAdmin=()=>{
    const lineupName=lineup.name;
    if(lineupName!=="Liga"&&lineupName!=="Copa") return [];
    const starters11=Object.values(lineup.starters||{}).filter(Boolean);
    if(starters11.length<11) return [];
    const teamPais=(localData.pais||"").trim().toLowerCase();
    const getFullPlayer=base=>squad.find(s=>s.name===base?.name)||base||{};
    const apellido=full=>{
      const partes=(full.name||"").trim().split(/\s+/);
      return partes[partes.length-1]||full.name||"";
    };
    const reqs=[];

    const nacionales=starters11.filter(p=>{
      const full=getFullPlayer(p);
      return teamPais&&(full.country||"").trim().toLowerCase()===teamPais;
    });
    reqs.push({
      texto:`Jugadores nacionales (${localData.pais||"país no configurado"})`,
      cumplido:nacionales.length>=2,
      detalle:`${nacionales.length}/2`
    });

    if(lineupName==="Copa"){
      const sub20=starters11.filter(p=>{
        const full=getFullPlayer(p);
        return full.age&&Number(full.age)<=20;
      });
      reqs.push({
        texto:"Jugadores Sub-20",
        cumplido:sub20.length>=2,
        detalle:`${sub20.length}/2`
      });

      const banca=(lineup.subs||[]).filter(Boolean);
      const convocados=[...starters11,...banca];
      const top10Names=[...convocados].map(p=>getFullPlayer(p)).filter(p=>p.overall&&p.name)
        .sort((a,b)=>(b.overall||0)-(a.overall||0)).slice(0,10).map(p=>p.name);
      const enTitular=starters11.filter(p=>top10Names.includes(p.name));
      const cumpleTop10=enTitular.length<=2;
      let detalleTop10=`${enTitular.length}/2 máx`;
      if(enTitular.length>0){
        const nombres=enTitular.map(p=>apellido(getFullPlayer(p)));
        detalleTop10+=` — ${nombres.join(", ")}`;
      }
      reqs.push({
        texto:"Jugadores del Top 10 de su plantilla en el 11 titular (máx. 2)",
        cumplido:cumpleTop10,
        detalle:detalleTop10
      });
    }

    return reqs;
  };
  const erroresAlineacionAdmin=validarAlineacionAdmin();

  const updateLineup=async fn=>{
    const nl=allLineups.map(l=>l.id===lineup.id?{...l,...fn(l)}:l);
    if(!nl.length) nl.push({id:"a",name:"Alineación A",formation:"4-3-3",starters:{},subs:Array(7).fill(null)});
    await save({lineups:nl});
  };

  const matchPlayer=(a,b)=>!!(a&&b&&a.name&&b.name&&
    a.name.trim().toLowerCase()===b.name.trim().toLowerCase());

  const handlePick=async player=>{
    if(!pickModal) return;
    if(pickModal.type==="starter"){
      await updateLineup(l=>{
        const newStarters={...l.starters};
        Object.keys(newStarters).forEach(k=>{if(matchPlayer(newStarters[k],player)) delete newStarters[k];});
        const newSubs=l.subs.map(s=>matchPlayer(s,player)?null:s);
        newStarters[pickModal.posId]=player;
        return{starters:newStarters,subs:newSubs};
      });
    } else {
      await updateLineup(l=>{
        const newStarters={...l.starters};
        Object.keys(newStarters).forEach(k=>{if(matchPlayer(newStarters[k],player)) delete newStarters[k];});
        const newSubs=l.subs.map((s,i)=>i===pickModal.subIdx?player:(matchPlayer(s,player)?null:s));
        return{starters:newStarters,subs:newSubs};
      });
    }
    setPickModal(null);
  };

  const addAdminLineup=async()=>{
    const name=newLineupName.trim()||`Alineación ${allLineups.length+1}`;
    const id=`l_${Date.now()}`;
    await save({lineups:[...allLineups,{id,name,formation:"4-3-3",starters:{},subs:Array(7).fill(null)}]});
    setActiveAdminLineupId(id);
    setNewLineupName("");
  };

  const handleDrop=async posId=>{
    if(dragFromPosId.current!==null){
      const fromId=dragFromPosId.current;
      dragFromPosId.current=null;
      if(fromId===posId){setDragOverPos(null);return;}
      await updateLineup(l=>{
        const s={...l.starters};
        const tmp=s[fromId]||null;
        s[fromId]=s[posId]||null;
        s[posId]=tmp;
        if(!s[fromId]) delete s[fromId];
        if(!s[posId]) delete s[posId];
        return{starters:s};
      });
    } else if(dragSubIdx.current!==null){
      const idx=dragSubIdx.current;
      await updateLineup(l=>{const sub=l.subs[idx];if(!sub) return l;const evicted=l.starters[posId]||null;const s=[...l.subs];s[idx]=evicted;return{starters:{...l.starters,[posId]:sub},subs:s};});
      dragSubIdx.current=null;
    }
    setDragOverPos(null);
  };

  return(
    <div style={{marginTop:12,background:C.card,border:`2px solid ${C.accent}`,borderRadius:16,overflow:"hidden",boxShadow:`0 8px 32px ${C.goldLight}`}}>
      <div style={{padding:"11px 14px",borderBottom:`1px solid ${C.border}`,background:C.goldLight,flexWrap:"wrap",display:"flex",flexDirection:"column",gap:8}}>
        {/* Team name editable */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:3,height:16,background:C.accent,borderRadius:2,flexShrink:0}}/>
          <input value={localData.teamName}
            onChange={e=>setLocalData(d=>({...d,teamName:e.target.value}))}
            onBlur={e=>save({teamName:e.target.value.trim()||localData.teamName})}
            style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,background:"transparent",border:"none",borderBottom:`1.5px solid ${C.borderDark}`,outline:"none",flex:1,minWidth:0}}/>
          {saving&&<span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Guardando…</span>}
          <div style={{display:"flex",alignItems:"center",gap:4,background:C.inputBg,border:`1px solid ${C.borderDark}`,borderRadius:8,padding:"3px 8px",flexShrink:0}}>
            <span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>💰</span>
            <input value={localData.presupuesto||""} onChange={e=>setLocalData(d=>({...d,presupuesto:e.target.value}))}
              onBlur={e=>save({presupuesto:e.target.value})}
              placeholder="Presupuesto…"
              style={{width:80,background:"transparent",border:"none",outline:"none",fontSize:10,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}/>
          </div>
          <button onClick={()=>setShowReserves(true)}
            style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
            Ver reservas
          </button>
          <button onClick={()=>setTransferAllPlayers(true)}
            style={{padding:"4px 10px",borderRadius:7,border:`1px solid #9b59b6`,background:"#f5f0ff",color:"#9b59b6",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
            🔄 Mover plantilla
          </button>
        </div>
        {/* Lineup selector + rename + delete + create */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {allLineups.map(l=>(
            <div key={l.id} style={{display:"flex",alignItems:"center",gap:2}}>
              <button onClick={()=>setActiveAdminLineupId(l.id)}
                style={{padding:"3px 9px",borderRadius:7,border:`1.5px solid ${lineup.id===l.id?C.accent:C.borderDark}`,background:lineup.id===l.id?C.accent:C.inputBg,color:lineup.id===l.id?"#fff":l.locked?C.textFaint:C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:4}}>
                {l.locked&&"🔒"}{l.name}
              </button>
              {lineup.id===l.id&&(
                <>
                  <button onClick={()=>{
                    const nl=allLineups.map(x=>x.id===l.id?{...x,locked:!l.locked}:x);
                    save({lineups:nl});
                  }} title={l.locked?"Desbloquear":"Bloquear alineación"}
                    style={{padding:"2px 6px",borderRadius:5,border:l.locked?`1px solid ${C.accent}`:`1px solid ${C.borderDark}`,background:l.locked?C.goldLight:C.inputBg,color:l.locked?C.accent:C.textFaint,fontSize:11,cursor:"pointer"}}>
                    {l.locked?"🔒":"🔓"}
                  </button>
                  {!l.locked&&<button onClick={()=>{
                    const n=window.prompt("Nuevo nombre:",l.name);
                    if(n?.trim()) save({lineups:allLineups.map(x=>x.id===l.id?{...x,name:n.trim()}:x)});
                  }} style={{padding:"2px 5px",borderRadius:5,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,fontSize:10,cursor:"pointer"}}>✏️</button>}
                  {allLineups.length>1&&!l.locked&&<button onClick={()=>{
                    if(!window.confirm(`¿Borrar "${l.name}"?`)) return;
                    const nl=allLineups.filter(x=>x.id!==l.id);
                    save({lineups:nl});
                    setActiveAdminLineupId(nl[0].id);
                  }} style={{padding:"2px 5px",borderRadius:5,border:"1px solid #ffcccc",background:"#fff5f5",color:"#c0392b",fontSize:10,cursor:"pointer"}}>🗑️</button>}
                </>
              )}
            </div>
          ))}
          <input value={newLineupName} onChange={e=>setNewLineupName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAdminLineup()}
            placeholder="+ Nueva…"
            style={{padding:"3px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:10,outline:"none",fontFamily:"'DM Sans',sans-serif",width:75}}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
          <button onClick={addAdminLineup} style={{padding:"3px 8px",borderRadius:7,background:C.accent,color:"#fff",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>+ Crear</button>
        </div>
        {/* 🏆 Requisitos del desafío (Liga/Copa) — vista admin */}
        {erroresAlineacionAdmin.length>0&&(
          <div style={{border:`1px solid ${C.borderDark}`,borderRadius:8,background:C.inputBg}}>
            <button onClick={()=>setShowAdminRequisitos(v=>!v)}
              style={{width:"100%",padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{fontSize:10,fontWeight:800,color:erroresAlineacionAdmin.every(r=>r.cumplido)?"#27ae60":"#e67e22"}}>
                {erroresAlineacionAdmin.every(r=>r.cumplido)?"✅":"⚠️"} Requisitos {lineup.name} ({erroresAlineacionAdmin.filter(r=>r.cumplido).length}/{erroresAlineacionAdmin.length})
              </span>
              <span style={{fontSize:10,color:C.textLight}}>{showAdminRequisitos?"▲":"▼"}</span>
            </button>
            {showAdminRequisitos&&(
              <div style={{padding:"2px 10px 8px 10px",display:"flex",flexDirection:"column",gap:5}}>
                {erroresAlineacionAdmin.map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6}}>
                    <span style={{fontSize:11,flexShrink:0,marginTop:1}}>{r.cumplido?"✅":"⬜"}</span>
                    <div>
                      <div style={{fontSize:10,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{r.texto}</div>
                      <div style={{fontSize:9,color:r.cumplido?"#27ae60":"#e67e22",fontFamily:"'DM Sans',sans-serif"}}>{r.detalle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Formation selector */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {Object.keys(FORMATIONS).map(f=>(
            <button key={f} onClick={()=>updateLineup(()=>({formation:f,starters:{}}))}
              style={{padding:"2px 6px",borderRadius:5,border:`1.5px solid ${lineup.formation===f?C.accent:C.borderDark}`,background:lineup.formation===f?C.accent:C.inputBg,color:lineup.formation===f?"#fff":C.textMid,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"monospace"}}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 14px 14px",display:"flex",gap:14,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 220px"}}>
          <Field positions={positions} lineup={lineup} readOnly={!!lineup?.locked}
            onClickPos={(id,label)=>setPickModal({type:"starter",posId:id,posLabel:label})}
            onRemovePos={async posId=>{await updateLineup(l=>{const s={...l.starters};delete s[posId];return{starters:s};});}}
            dragOverPos={dragOverPos} onDragOver={setDragOverPos} onDragLeave={()=>setDragOverPos(null)} onDrop={handleDrop}
            onDragStartPos={posId=>{dragFromPosId.current=posId;dragSubIdx.current=null;}}
            teamColor={localData.teamColor}/>
        </div>
        <div style={{flex:"0 0 175px",minWidth:160,display:"flex",flexDirection:"column",gap:10}}>
          <Bench subs={lineup.subs} readOnly={false}
            onClickSub={i=>setPickModal({type:"sub",subIdx:i,posLabel:`Suplente ${i+1}`})}
            onDragStart={i=>{dragSubIdx.current=i;}}/>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <div style={{width:3,height:13,background:C.borderDark,borderRadius:2}}/>
              <span style={{fontSize:10,fontWeight:800,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'Bebas Neue',sans-serif"}}>PLANTILLA</span>
              <span style={{marginLeft:"auto",fontSize:9,color:C.textFaint,fontFamily:"monospace"}}>{squad.length}/26</span>
            </div>
            <button onClick={()=>setShowAddPlayer(true)}
              style={{width:"100%",padding:"7px",background:C.accent,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
              + Agregar jugador
            </button>
            <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
              {squad.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 7px",borderRadius:7,background:p.locked?"#fffbf0":C.inputBg,border:`1px solid ${p.locked?C.accent:C.border}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>
                      {p.locked&&"🔒 "}{p.name}
                    </div>
                    <div style={{fontSize:8,color:C.textLight,fontFamily:"monospace"}}>{p.primaryPos||p.pos?.split("/")?.[0]}</div>
                  </div>
                  <button onClick={async()=>{
                    const ns=squad.map(s=>s.id===p.id?{...s,locked:!p.locked}:s);
                    await save({squad:ns});
                  }} title={p.locked?"Desbloquear":"Bloquear"}
                    style={{background:p.locked?C.goldLight:"none",border:p.locked?`1px solid ${C.accent}`:"1px solid transparent",borderRadius:6,color:p.locked?C.accent:C.textFaint,cursor:"pointer",fontSize:11,padding:"2px 5px",flexShrink:0}}>
                    {p.locked?"🔒":"🔓"}
                  </button>
                  {!p.poolKey?.startsWith("fc26_")&&(
                    <button onClick={()=>setEditingAdminPlayer(p)}
                      style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",fontSize:11,padding:"2px 5px",flexShrink:0}}>✏️</button>
                  )}
                  <button onClick={()=>setTransferAdminPlayer(p)}
                    style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",fontSize:11,padding:"2px 5px",flexShrink:0}}>🔄</button>
                  <button onClick={async()=>{const ns=squad.filter(s=>s.id!==p.id);await save({squad:ns});}}
                    style={{background:"none",border:"none",color:"#d4846a",cursor:"pointer",fontSize:13,padding:0,flexShrink:0}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* TRANSFER ALL PLAYERS MODAL */}
      {transferAllPlayers&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setTransferAllPlayers(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:400,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>🔄 MOVER PLANTILLA COMPLETA</span>
              <button onClick={()=>setTransferAllPlayers(false)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{padding:"8px 14px 6px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>
                Mover <strong style={{color:"#9b59b6"}}>{squad.length} jugadores</strong> de <strong style={{color:C.text}}>{localData.teamName}</strong> a:
              </div>
              <div style={{fontSize:10,color:"#e67e22",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>⚠️ El equipo origen queda vacío.</div>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"8px 14px 14px",display:"flex",flexDirection:"column",gap:6}}>
              {(allTeamsRef||[]).filter(t=>(t.id||t.uid)!==(localData.id||localData.uid)).sort((a,b)=>(a.teamName||"").localeCompare(b.teamName||"")).map(t=>(
                <div key={t.id||t.uid} onClick={async()=>{
                  if(!window.confirm(`¿Mover TODOS los ${squad.length} jugadores a "${t.teamName}"?\nEsta acción vacía "${localData.teamName}".`)) return;
                  const destRef=doc(db,"teams",t.id||t.uid);
                  const destSnap=await getDoc(destRef);
                  if(destSnap.exists()) await updateDoc(destRef,{squad:[...(destSnap.data().squad||[]),...squad]});
                  const pRef=doc(db,"pool","players");const pSnap=await getDoc(pRef);
                  if(pSnap.exists()){const pd={...pSnap.data()};squad.forEach(p=>{if(p.poolKey&&pd[p.poolKey])pd[p.poolKey]={...pd[p.poolKey],teamName:t.teamName,teamUid:t.uid||t.id};});await setDoc(pRef,pd);}
                  await save({squad:[]});
                  setTransferAllPlayers(false);
                  alert(`✅ ${squad.length} jugadores movidos a ${t.teamName}`);
                }}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#9b59b6"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:getTeamColor(t.teamColor).bg,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{t.teamName}</div>
                    <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{(t.squad||[]).length} jug. actuales</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddPlayer&&<AddPlayerModal currentCount={squad.length} pool={pool} teamName={localData.teamName}
        onAdd={async p=>{
          await save({squad:[...squad,p]});
          if(p.poolKey){
            const poolRef=doc(db,"pool","players");
            const snap=await getDoc(poolRef);
            const current=snap.exists()?snap.data():{};
            await setDoc(poolRef,{...current,[p.poolKey]:{name:p.name,pos:p.pos,teamName:localData.teamName,teamUid:localData.uid}});
          }
          setShowAddPlayer(false);
        }} onClose={()=>setShowAddPlayer(false)}/>}

      {editingAdminPlayer&&<AddPlayerModal currentCount={squad.length} pool={pool} teamName={localData.teamName} isAdmin={true}
        editPlayer={editingAdminPlayer}
        onSaveEdit={async updated=>{const ns=squad.map(p=>p.id===updated.id?updated:p);await save({squad:ns});setEditingAdminPlayer(null);}}
        onAdd={()=>{}} onClose={()=>setEditingAdminPlayer(null)}/>}

      {transferAdminPlayer&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setTransferAdminPlayer(null)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:400,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>🔄 TRANSFERIR JUGADOR</span>
              <button onClick={()=>setTransferAdminPlayer(null)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{padding:"10px 14px 6px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{fontSize:12,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>Transferir <strong style={{color:C.text}}>{transferAdminPlayer.name}</strong> de <strong style={{color:C.text}}>{localData.teamName}</strong> a:</div>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"8px 14px 14px",display:"flex",flexDirection:"column",gap:6}}>
              {(allTeamsRef||[]).filter(t=>t.uid&&t.uid!==localData.uid).sort((a,b)=>(a.teamName||"").localeCompare(b.teamName||"")).map(t=>(
                <div key={t.id||t.uid} onClick={async()=>{
                  if(!window.confirm(`¿Transferir a ${transferAdminPlayer.name} a ${t.teamName}?`)) return;
                  await save({squad:squad.filter(p=>p.id!==transferAdminPlayer.id)});
                  const destRef=doc(db,"teams",t.id||t.uid);
                  const destSnap=await getDoc(destRef);
                  if(destSnap.exists()) await updateDoc(destRef,{squad:[...(destSnap.data().squad||[]),transferAdminPlayer]});
                  if(transferAdminPlayer.poolKey){
                    const pRef=doc(db,"pool","players");const pSnap=await getDoc(pRef);
                    if(pSnap.exists()){const pd={...pSnap.data()};if(pd[transferAdminPlayer.poolKey]){pd[transferAdminPlayer.poolKey]={...pd[transferAdminPlayer.poolKey],teamName:t.teamName,teamUid:t.uid};await setDoc(pRef,pd);}}
                  }
                  setTransferAdminPlayer(null);
                  alert(`✅ ${transferAdminPlayer.name} transferido a ${t.teamName}`);
                }}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:getTeamColor(t.teamColor).bg,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{t.teamName}</div>
                    <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{(t.squad||[]).length} jug.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {pickModal&&<PickFromSquad squad={squad} posLabel={pickModal.posLabel} onPick={handlePick} onClose={()=>setPickModal(null)}
        usedIds={pickModal.type==="starter"
          ? Object.entries(lineup.starters||{}).filter(([k,p])=>p&&k!==pickModal.posId).map(([,p])=>p.poolKey||p.id)
          : [...Object.values(lineup.starters||{}).filter(Boolean).map(p=>p.poolKey||p.id),...(lineup.subs||[]).filter((p,i)=>p&&i!==pickModal.subIdx).map(p=>p.poolKey||p.id)]
        }
        posFilter={pickModal.type==="starter"?pickModal.posLabel:null} isBench={pickModal.type==="sub"}/>}
      {showReserves&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setShowReserves(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:400,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>RESERVAS — {localData.teamName}</span>
              <button onClick={()=>setShowReserves(false)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"10px 14px 16px",display:"flex",flexDirection:"column",gap:6}}>
              {(()=>{
                const norm=s=>String(s||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
                const usedNames=new Set([...Object.values(lineup.starters||{}).filter(Boolean).map(p=>norm(p.name)),...(lineup.subs||[]).filter(Boolean).map(p=>norm(p.name))]);
                const usedKeys=new Set([...Object.values(lineup.starters||{}).filter(Boolean).flatMap(p=>[p.poolKey,p.id].filter(Boolean)),...(lineup.subs||[]).filter(Boolean).flatMap(p=>[p.poolKey,p.id].filter(Boolean))]);
                const reserves=squad.filter(p=>!usedKeys.has(p.poolKey)&&!usedKeys.has(p.id)&&!usedNames.has(norm(p.name)));
                if(reserves.length===0) return <div style={{textAlign:"center",color:C.textFaint,fontSize:13,padding:"24px 0",fontFamily:"'DM Sans',sans-serif"}}>No hay reservas — todos los jugadores están convocados.</div>;
                return reserves.map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`}}>
                    <Avatar name={p.name} size={36}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                      <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.team||"—"} · <span style={{fontFamily:"monospace",color:C.accent,fontWeight:700}}>{p.pos}</span></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── IMPORT BUTTON ────────────────────────────────────────────────────────────
const EXCEL_TEAM_COLORS={"AFC Bournemouth":"red","Inter Miami FC":"pink","Malaga CF":"sky","SV Werder Bremen":"green","Seattle Sounders FC":"teal","AFC Ajax":"red","Real Sociedad de Fútbol":"sky","Sporting CP":"green","Feyenord SC":"red","Racing Club":"sky","Olympique Lyonnais":"red","Paris FC":"blue","F.C. Porto":"sky","Wrexham A.F.C.":"red","Parma Calcio":"gold","ACF Fiorentina":"purple","Palermo FC":"pink","Hull City AFC":"orange","Leeds United F.C.":"navy","FC Schalke 04":"sky","Wolverhampton Wanderers FC":"orange","Leicester City FC":"sky","Lens":"gold","Rayo Vallecano de Madrid S.A.D.":"maroon","RB Leipzig":"red","Club Atlético Independiente":"red","Getafe CF":"sky","Nottingham Forest FC":"red","Rangers":"sky","Abeerden FC":"red","Celtic FC":"green","Napoli SC":"sky"};

function ImportButton({allTeams,pool,user,onDone}){
  const[status,setStatus]=useState("idle");
  const[log,setLog]=useState([]);
  const[parsedTeams,setParsedTeams]=useState(null);
  const[importing,setImporting]=useState(false);
  const[selectedTeams,setSelectedTeams]=useState(new Set());
  const fileRef=useRef(null);

  const POS_MAP={'GK':'GK','RB':'RB','CB':'CB','LB':'LB','CDM':'CDM','CM':'CM','CAM':'CAM','RM':'RM','LM':'LM','RW':'RW','LW':'LW','ST':'ST','CF':'ST','RWB':'RB','LWB':'LB','DM':'CDM','AM':'CAM','SS':'CAM'};

  const convertPos=raw=>{
    if(!raw) return 'CM';
    const parts=String(raw).split(/[\s\-]+/).map(p=>p.trim()).filter(Boolean);
    const converted=[...new Set(parts.map(p=>POS_MAP[p]).filter(Boolean))];
    return converted.length?converted.join('/'):raw;
  };

  const formatPrice=val=>{
    if(!val) return null;
    const v=parseFloat(val);
    if(v>=1000000) return{value:Math.round(v/10000)/100,unit:'M'};
    if(v>=1000) return{value:Math.round(v/100)/10,unit:'K'};
    return{value:v,unit:'K'};
  };

  const normalize=s=>String(s||"").toLowerCase().trim().replace(/[.\-_]/g,' ').replace(/\s+/g,' ');

  const handleFile=async e=>{
    const file=e.target.files[0];
    if(!file) return;
    setStatus("parsing");
    setLog(["📖 Leyendo archivo..."]);

    // Load SheetJS from CDN
    await new Promise((res,rej)=>{
      if(window.XLSX){res();return;}
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });

    const buf=await file.arrayBuffer();
    const wb=window.XLSX.read(buf,{type:'array'});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=window.XLSX.utils.sheet_to_json(ws,{header:1});

    // Parse teams
    const teams={};
    let currentTeam=null;
    for(const row of rows){
      if(!row||row.every(v=>!v)) continue;
      if(row[0]==='NOMBRE') continue;
      if(!row[0]&&row[1]&&!row[2]){currentTeam=String(row[1]).trim();teams[currentTeam]=[];continue;}
      if(currentTeam&&row[0]){
        const name=String(row[0]).trim();
        const pos=convertPos(row[3]);
        const parts=pos.split('/');
        teams[currentTeam].push({
          id:`xls_${Math.abs(name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)^Date.now())}`,
          name, pos, primaryPos:parts[0], secondaryPos:parts.slice(1).join('/')||null,
          country:row[5]?String(row[5]).trim():null,
          age:row[2]?parseInt(row[2]):null,
          overall:row[4]?parseInt(row[4]):null,
          price:formatPrice(row[1]),
          poolKey:`name_${name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'').slice(0,50)}`,
        });
      }
    }

    // Match with Firestore teams — include teams without presidents
    const matched={};
    const notFound=[];
    for(const [excelName,players] of Object.entries(teams)){
      let ft=allTeams.find(t=>t.teamName===excelName);
      if(!ft) ft=allTeams.find(t=>normalize(t.teamName)===normalize(excelName));
      if(!ft) ft=allTeams.find(t=>normalize(t.teamName).includes(normalize(excelName).split(' ')[0])||normalize(excelName).includes(normalize(t.teamName).split(' ')[0]));
      if(ft) matched[ft.teamName]={firestoreTeam:ft,players,excelName};
      else notFound.push(excelName);
    }

    setParsedTeams({matched,notFound,totalPlayers:Object.values(teams).flat().length});
    setSelectedTeams(new Set(Object.keys(matched)));
    setLog([]);
    setStatus("preview");
  };

  const runImport=async()=>{
    if(!parsedTeams) return;
    setImporting(true);
    setStatus("running");
    setLog(["🚀 Importando..."]);
    const addLog=msg=>setLog(p=>[...p,msg]);

    let poolData={...pool};
    let ok=0;

    for(const [teamName,{firestoreTeam,players,excelName}] of Object.entries(parsedTeams.matched)){
      // Skip if not selected
      if(!selectedTeams.has(teamName)){addLog(`⏭️ ${teamName} — omitido`);continue;}
      // Skip if squad is locked
      if(firestoreTeam.squadLocked){addLog(`🔒 ${teamName} — bloqueado`);continue;}

      const teamDocId=firestoreTeam.id||firestoreTeam.uid;

      // Clear old pool entries for this team
      Object.keys(poolData).forEach(k=>{
        if(poolData[k].teamName===teamName||poolData[k].teamUid===(firestoreTeam.uid||firestoreTeam.id)) delete poolData[k];
      });
      // Add new pool entries — use player's unique id for guaranteed uniqueness
      players.forEach(p=>{
        const uniqueKey=p.id||`${teamDocId}_${p.poolKey}`;
        poolData[uniqueKey]={name:p.name,pos:p.pos,country:p.country||null,overall:p.overall||null,age:p.age||null,price:p.price||null,teamName,teamUid:firestoreTeam.uid||firestoreTeam.id,originalKey:p.poolKey,playerId:p.id};
      });

      // Build patch
      const patch={squad:players};
      const excelColor=EXCEL_TEAM_COLORS[excelName]||EXCEL_TEAM_COLORS[teamName];
      if(excelColor) patch.teamColor=excelColor;

      try{
        await updateDoc(doc(db,"teams",teamDocId),patch);
        addLog(`✅ ${teamName} (${players.length} jug.)`);
        ok++;
      } catch(err){
        addLog(`❌ ${teamName} — error: ${err.message}`);
      }
    }

    await setDoc(doc(db,"pool","players"),poolData);
    addLog(`🏆 Listo: ${ok} equipos importados.`);
    if(parsedTeams.notFound.length) addLog(`⚠️ Sin coincidencia: ${parsedTeams.notFound.join(", ")}`);
    setStatus("done");
    setImporting(false);
    setSelectedTeams(new Set());
  };

  return(
    <div>
      {status==="idle"&&(
        <div style={{textAlign:"center"}}>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={handleFile}/>
          <button onClick={()=>fileRef.current.click()}
            style={{width:"100%",padding:"13px",background:"#27ae60",color:"#fff",border:"none",borderRadius:11,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
            📁 SELECCIONAR EXCEL
          </button>
          <div style={{fontSize:10,color:C.textFaint,marginTop:6,fontFamily:"'DM Sans',sans-serif"}}>Formato: Plantillas_Liga_Simulada_EAFC26.xlsx</div>
        </div>
      )}

      {status==="parsing"&&(
        <div style={{textAlign:"center",padding:"20px",color:C.textLight,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
          <div style={{width:28,height:28,border:`3px solid ${C.border}`,borderTopColor:"#27ae60",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 10px"}}/>
          Leyendo archivo...
        </div>
      )}

      {status==="preview"&&parsedTeams&&(
        <div>
          <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:11,lineHeight:1.8,marginBottom:10}}>
            <span style={{color:"#27ae60"}}>✅ Archivo leído · {Object.keys(parsedTeams.matched).length} equipos encontrados</span>
            {parsedTeams.notFound.length>0&&<div style={{color:"#e67e22",marginTop:2}}>⚠️ Sin coincidencia: {parsedTeams.notFound.join(", ")}</div>}
          </div>
          {/* Team selector */}
          <div style={{fontSize:11,fontWeight:700,color:C.textLight,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>Elegir equipos a importar</span>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setSelectedTeams(new Set(Object.keys(parsedTeams.matched)))} style={{fontSize:9,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Todos</button>
              <button onClick={()=>setSelectedTeams(new Set())} style={{fontSize:9,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Ninguno</button>
            </div>
          </div>
          <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
            {Object.entries(parsedTeams.matched).sort((a,b)=>a[0].localeCompare(b[0])).map(([teamName,{firestoreTeam,players}])=>{
              const on=selectedTeams.has(teamName);
              const tc=getTeamColor(firestoreTeam.teamColor);
              return(
                <div key={teamName} onClick={()=>setSelectedTeams(prev=>{const n=new Set(prev);on?n.delete(teamName):n.add(teamName);return n;})}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,background:on?tc.bg+"18":C.inputBg,border:`1px solid ${on?tc.bg:C.border}`,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:on?tc.bg:C.borderDark,flexShrink:0,transition:"background .15s"}}/>
                  <div style={{flex:1,fontSize:11,fontWeight:700,color:on?C.text:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{teamName}</div>
                  <span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{players.length} jug.</span>
                  <span style={{fontSize:11}}>{on?"✅":"⬜"}</span>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setStatus("idle");setParsedTeams(null);setLog([]);setSelectedTeams(new Set());}}
              style={{flex:1,padding:"11px",background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Cancelar
            </button>
            <button onClick={runImport} disabled={selectedTeams.size===0}
              style={{flex:2,padding:"11px",background:selectedTeams.size===0?"#ccc":"#27ae60",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:800,cursor:selectedTeams.size===0?"not-allowed":"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
              IMPORTAR {selectedTeams.size} EQUIPOS
            </button>
          </div>
        </div>
      )}

      {status==="running"&&(
        <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",maxHeight:280,overflowY:"auto",fontFamily:"monospace",fontSize:11,color:C.text,lineHeight:1.8}}>
          {log.map((l,i)=><div key={i}>{l}</div>)}
        </div>
      )}

      {status==="done"&&(
        <div>
          <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",maxHeight:250,overflowY:"auto",fontFamily:"monospace",fontSize:11,color:C.text,lineHeight:1.8,marginBottom:10}}>
            {log.map((l,i)=><div key={i}>{l}</div>)}
          </div>
          <button onClick={onDone}
            style={{width:"100%",padding:"11px",background:C.accent,color:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
            CERRAR
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAINTENANCE TOGGLE ───────────────────────────────────────────────────────
function MaintenanceToggle(){
  const[on,setOn]=useState(false);
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","settings"),snap=>{
      setOn(snap.exists()&&snap.data().maintenance===true);
    });
    return unsub;
  },[]);
  const toggle=async()=>{
    const next=!on;
    if(next&&!window.confirm("¿Activar modo mantenimiento? Los usuarios no podrán acceder.")) return;
    await setDoc(doc(db,"config","settings"),{maintenance:next});
  };
  return(
    <button onClick={toggle}
      style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${on?"#c0392b":"#27ae60"}`,background:on?"#fff5f5":"#f0fff4",color:on?"#c0392b":"#27ae60",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
      {on?"🔴 Mantenimiento ON":"🟢 Mantenimiento OFF"}
    </button>
  );
}

function MercadoToggle(){
  const[open,setOpen]=useState(true);
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","settings"),snap=>{
      setOpen(!(snap.exists()&&snap.data().mercadoAbierto===false));
    });
    return unsub;
  },[]);
  const toggle=async()=>{
    const next=!open;
    if(!next&&!window.confirm("¿Cerrar el mercado? Los equipos no podrán acceder hasta que lo reabras.")) return;
    await setDoc(doc(db,"config","settings"),{mercadoAbierto:next},{merge:true});
  };
  return(
    <button onClick={toggle}
      style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${open?"#27ae60":"#c0392b"}`,background:open?"#f0fff4":"#fff5f5",color:open?"#27ae60":"#c0392b",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
      {open?"🟢 Mercado ON":"🔴 Mercado OFF"}
    </button>
  );
}

// ─── EN VIVO + AVISO (compartido: Home y Formaciones) ─────────────────────────
function LiveAndAviso(){
  const[mundial,setMundial]=useState(null);
  const[showTwitch,setShowTwitch]=useState(false);
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"mundial","data"),snap=>{
      setMundial(snap.exists()?snap.data():null);
    });
    return unsub;
  },[]);
  if(!mundial?.aviso?.activo&&!mundial?.twitchChannel) return null;
  return(
    <div style={{flexShrink:0}}>
      {mundial?.aviso?.activo&&(
        <div style={{padding:"8px 16px",background:"#e74c3c",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13}}>🔴</span>
          <span style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'DM Sans',sans-serif",flex:1}}>{mundial.aviso.texto}</span>
          {mundial.aviso.endsAt&&<CountdownTimer endsAt={mundial.aviso.endsAt}/>}
        </div>
      )}
      {mundial?.twitchChannel&&(
        <>
          <button onClick={()=>setShowTwitch(v=>!v)}
            style={{width:"100%",padding:"8px 16px",background:showTwitch?"#e74c3c":"#1a1a2e",border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            🔴 {showTwitch?"Cerrar transmisión":"Ver En Vivo"}
          </button>
          {showTwitch&&(
            <div style={{background:"#000",height:220}}>
              <iframe
                src={`https://player.twitch.tv/?channel=${mundial.twitchChannel}&parent=${window.location.hostname}`}
                height="220" width="100%" allowFullScreen frameBorder="0"
                allow="autoplay; fullscreen"
                style={{display:"block"}}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── ADMIN: Aviso + Canal Twitch (fuera del Mundial) ──────────────────────────
function AvisoTwitchAdmin(){
  const[mundial,setMundial]=useState(null);
  const[avisoText,setAvisoText]=useState("");
  const[avisoMin,setAvisoMin]=useState("");
  const[twitchChannel,setTwitchChannel]=useState("");
  const[msg,setMsg]=useState("");
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"mundial","data"),snap=>{
      const d=snap.exists()?snap.data():{};
      setMundial(d);
      setTwitchChannel(d.twitchChannel||"");
    });
    return unsub;
  },[]);
  const saveM=async patch=>{await setDoc(doc(db,"mundial","data"),{...(mundial||{}),...patch},{merge:true});};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {/* AVISO */}
      <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#e74c3c",fontFamily:"'DM Sans',sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>🔴 Aviso a usuarios</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <input value={avisoText} onChange={e=>setAvisoText(e.target.value)} placeholder="Mensaje (ej: El live inicia pronto)"
            style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
          <div style={{display:"flex",gap:6}}>
            <input type="number" value={avisoMin} onChange={e=>setAvisoMin(e.target.value)} placeholder="Minutos (opcional)"
              style={{flex:1,padding:"7px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:12,fontFamily:"monospace",outline:"none"}}/>
            <button onClick={async()=>{
              const endsAt=avisoMin?Date.now()+(Number(avisoMin)*60*1000):null;
              await saveM({aviso:{texto:avisoText,minutos:avisoMin,endsAt,activo:true}});
              setMsg("✅ Aviso enviado");
            }}
              disabled={!avisoText.trim()}
              style={{padding:"7px 14px",borderRadius:8,background:"#e74c3c",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:avisoText.trim()?1:0.5}}>
              Enviar
            </button>
            {mundial?.aviso?.activo&&<button onClick={async()=>{await saveM({aviso:{...mundial.aviso,activo:false}});setMsg("✅ Aviso desactivado");}}
              style={{padding:"7px 14px",borderRadius:8,background:C.inputBg,color:"#e74c3c",border:"1px solid #e74c3c",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Quitar
            </button>}
          </div>
          {mundial?.aviso?.activo&&<div style={{fontSize:10,color:"#e74c3c",fontFamily:"'DM Sans',sans-serif"}}>🔴 Activo: "{mundial.aviso.texto}"</div>}
        </div>
      </div>
      {/* TWITCH */}
      <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#9147ff",fontFamily:"'DM Sans',sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>📺 Canal de Twitch</div>
        <div style={{display:"flex",gap:6}}>
          <input value={twitchChannel} onChange={e=>setTwitchChannel(e.target.value)} placeholder="Nombre del canal (ej: FederacionLS)"
            style={{flex:1,padding:"7px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
          <button onClick={async()=>{await saveM({twitchChannel:twitchChannel.trim()});setMsg("✅ Canal guardado");}}
            style={{padding:"7px 14px",borderRadius:8,background:"#9147ff",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            Guardar
          </button>
        </div>
        {mundial?.twitchChannel&&<div style={{fontSize:10,color:"#9147ff",fontFamily:"'DM Sans',sans-serif",marginTop:4}}>Canal: {mundial.twitchChannel}</div>}
      </div>
      {msg&&<div style={{fontSize:11,color:"#27ae60",fontFamily:"'DM Sans',sans-serif"}}>{msg}</div>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function PublicPoolModal({pool,allTeams,onClose,setPoolPlayer}){
  const[tab,setTab]=useState("pool"); // pool | clubs
  const[selectedClub,setSelectedClub]=useState(null);
  const[q,setQ]=useState("");
  const[posF,setPosF]=useState("");
  const[sort,setSort]=useState("equipo");
  const POS_ORD=["POR","DFC","DFD","DFI","MCD","MC","MCO","MD","MI","ED","EI","DC"];
  const getP=p=>{const r=(p.pos||"").split("/")?.[0];return POS_EN_ES[r]||r;};
  const entries=Object.entries(pool||{});
  const filtered=entries.filter(([,p])=>{
    const m=!q||(p.name||"").toLowerCase().includes(q.toLowerCase())||(p.teamName||"").toLowerCase().includes(q.toLowerCase())||(p.country||"").toLowerCase().includes(q.toLowerCase());
    return m&&(!posF||getP(p)===posF);
  });
  const sorted=[...filtered].sort((a,b)=>sort==="media"?(b[1].overall||0)-(a[1].overall||0):sort==="pos"?POS_ORD.indexOf(getP(a[1]))-POS_ORD.indexOf(getP(b[1])):(a[1].teamName||"").localeCompare(b[1].teamName||""));
  let lastT=null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:480,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <span style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{tab==="pool"?"🌍 POOL GLOBAL":"🏟️ CLUBES"}</span>
          {tab==="pool"&&<span style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{filtered.length}/{entries.length}</span>}
          <div style={{marginLeft:"auto",display:"flex",gap:5,alignItems:"center"}}>
            <button onClick={()=>{setTab("pool");setSelectedClub(null);}} style={{padding:"4px 10px",borderRadius:7,border:`1.5px solid ${tab==="pool"?C.accent:C.borderDark}`,background:tab==="pool"?C.accent:C.inputBg,color:tab==="pool"?"#fff":C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🌍 Pool</button>
            <button onClick={()=>{setTab("clubs");setSelectedClub(null);}} style={{padding:"4px 10px",borderRadius:7,border:`1.5px solid ${tab==="clubs"?C.accent:C.borderDark}`,background:tab==="clubs"?C.accent:C.inputBg,color:tab==="clubs"?"#fff":C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🏟️ Clubes</button>
            <button onClick={onClose} style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:30,height:30,color:C.textMid,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
        </div>
        {/* CLUBES TAB */}
        {tab==="clubs"&&(
          selectedClub?(
            // Ficha del club
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <button onClick={()=>setSelectedClub(null)} style={{background:"none",border:"none",color:C.textMid,cursor:"pointer",fontSize:18,padding:"0 4px 0 0"}}>←</button>
                <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${getTeamColor(selectedClub.teamColor).dark},${getTeamColor(selectedClub.teamColor).bg})`,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{selectedClub.teamName}</div>
                  <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{(selectedClub.squad||[]).length} jugadores</div>
                </div>
              </div>
              {/* DT */}
              {selectedClub.dt?.name&&(
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:C.goldLight+"33",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>🧑‍💼</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{selectedClub.dt.name}</div>
                    <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif",display:"flex",gap:8}}>
                      {selectedClub.dt.nationality&&<span>{selectedClub.dt.nationality}</span>}
                      {selectedClub.dt.style&&<span>· {selectedClub.dt.style}</span>}
                    </div>
                  </div>
                </div>
              )}
              {/* Plantilla */}
              <div style={{padding:"10px 14px",flex:1}}>
                {(()=>{
                  // Use pool to get full player data for this club
                  const clubUid=selectedClub.uid||selectedClub.id;
                  const poolPlayers=Object.values(pool||{}).filter(p=>p.teamUid===clubUid);
                  // Merge squad + pool — prefer pool data (more complete)
                  const squad=selectedClub.squad||[];
                  const allPlayers=[...poolPlayers,...squad.filter(p=>!poolPlayers.some(pp=>pp.name===p.name))];
                  if(allPlayers.length===0) return <div style={{color:C.textFaint,fontSize:12,textAlign:"center",padding:16,fontFamily:"'DM Sans',sans-serif"}}>Sin jugadores en la plantilla</div>;
                  const POS_ORDER=["GK","CB","RB","LB","CDM","CM","CAM","RM","LM","RW","LW","ST","CF"];
                  const byPos={};
                  allPlayers.forEach(p=>{
                    const pos=(p.primaryPos||p.pos?.split("/")?.[0]||"?").toUpperCase();
                    if(!byPos[pos]) byPos[pos]=[];
                    if(!byPos[pos].some(x=>x.name===p.name)) byPos[pos].push(p);
                  });
                  const sorted=[...POS_ORDER.filter(p=>byPos[p]),...Object.keys(byPos).filter(p=>!POS_ORDER.includes(p))];
                  return sorted.map(pos=>(
                    <div key={pos} style={{marginBottom:8}}>
                      <div style={{fontSize:9,fontWeight:800,color:C.textFaint,fontFamily:"monospace",letterSpacing:1,marginBottom:3}}>{pos}</div>
                      {byPos[pos].sort((a,b)=>(b.overall||0)-(a.overall||0)).map((p,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:8,background:C.inputBg,border:`1px solid ${C.border}`,marginBottom:3}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif",flex:1}}>{p.name}</span>
                          {p.overall&&<span style={{fontSize:12,fontWeight:800,color:C.accent,fontFamily:"monospace"}}>{p.overall}</span>}
                          {p.country&&<span style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{p.country}</span>}
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            </div>
          ):(
            // Lista de clubes
            <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
              {[...allTeams].sort((a,b)=>(a.teamName||"").localeCompare(b.teamName||"")).map(t=>{
                const tc=getTeamColor(t.teamColor);
                return(
                  <div key={t.uid||t.id} onClick={()=>setSelectedClub(t)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`,marginBottom:6,cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${tc.dark},${tc.bg})`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:11,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif"}}>{(t.teamName||"?").slice(0,2).toUpperCase()}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.teamName}</div>
                      <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif",display:"flex",gap:8}}>
                        <span>{(t.squad||[]).length} jugadores</span>
                        {t.dt?.name&&<span>· DT: {t.dt.name}</span>}
                      </div>
                    </div>
                    <span style={{fontSize:16,color:C.textFaint}}>›</span>
                  </div>
                );
              })}
            </div>
          )
        )}
        {tab==="pool"&&<>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0,display:"flex",flexDirection:"column",gap:6}}>
          <input autoFocus placeholder="🔍 Nombre, equipo, país…" value={q} onChange={e=>setQ(e.target.value)}
            style={{width:"100%",padding:"8px 12px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:6}}>
            <select value={posF} onChange={e=>setPosF(e.target.value)} style={{flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
              <option value="">Todas las posiciones</option>
              {POS_ORD.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
              <option value="equipo">Por equipo</option>
              <option value="media">Por media ↓</option>
              <option value="pos">Por posición</option>
            </select>
            {(q||posF)&&<button onClick={()=>{setQ("");setPosF("");}} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:C.inputBg,color:C.textMid,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕</button>}
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"10px 14px 16px"}}>
          {sorted.length===0&&<div style={{textAlign:"center",color:C.textFaint,fontSize:12,marginTop:20,fontFamily:"'DM Sans',sans-serif"}}>Sin resultados</div>}
          {sorted.map(([key,p])=>{
            const sh=sort==="equipo"&&p.teamName!==lastT; if(sort==="equipo") lastT=p.teamName;
            const tc=getTeamColor(allTeams.find(t=>t.teamName===p.teamName)?.teamColor);
            const pos=getP(p);
            return(<div key={key}>
              {sh&&<div style={{padding:"8px 2px 3px",borderBottom:`1px solid ${C.border}`,marginBottom:3,marginTop:8}}><span style={{fontSize:11,fontWeight:800,color:C.textMid,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>⚽ {p.teamName}</span></div>}
              <div onClick={()=>setPoolPlayer({p,key})} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:8,background:C.inputBg,border:`1px solid ${C.border}`,marginBottom:3,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${tc.dark},${tc.bg})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif"}}>{p.overall||p.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name} <span style={{fontWeight:400,color:C.textLight}}>· {p.teamName}</span></div>
                  <div style={{fontSize:9,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{[p.country,p.age?`${p.age}a`:null,p.overall?`${p.overall}⭐`:null].filter(Boolean).join(" · ")}</div>
                </div>
                <span style={{fontSize:8,fontWeight:700,color:C.accent,background:C.goldLight,padding:"2px 6px",borderRadius:5,fontFamily:"monospace",border:`1px solid ${C.border}`,whiteSpace:"nowrap",flexShrink:0}}>{pos}</span>
              </div>
            </div>);
          })}
        </div>
      </>}
      </div>
    </div>
  );
}

// ─── NATIONAL TEAM PICKER (inline combo para admin) ──────────────────────────
function NationalTeamPicker({teamId,current,allSels}){
  const[open,setOpen]=useState(false);
  const[q,setQ]=useState("");
  const ref=useRef(null);

  // close on outside click
  useEffect(()=>{
    if(!open) return;
    const handler=e=>{if(ref.current&&!ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[open]);

  const assign=async(id)=>{
    await updateDoc(doc(db,"teams",teamId),{nationalTeam:id});
    setOpen(false);setQ("");
  };

  const createAndAssign=async()=>{
    const name=q.trim().toUpperCase().replace(/\s+/g,"_");
    if(!name) return;
    await setDoc(doc(db,"selecciones",name),{country:q.trim().toUpperCase(),formation:"4-3-3",starters:{},subs:Array(7).fill(null),image:"",squad:[]});
    await assign(name);
  };

  const label=current?(allSels.find(s=>s.id===current)?.country||current):"🏳️";
  const filtered=allSels.filter(s=>(s.country||"").toLowerCase().includes(q.toLowerCase())).sort((a,b)=>(a.country||"").localeCompare(b.country||""));

  return(
    <div ref={ref} style={{position:"relative",flexShrink:0}} onClick={e=>e.stopPropagation()}>
      <button onClick={()=>{setOpen(v=>!v);setQ("");}}
        style={{padding:"2px 7px",borderRadius:5,border:`1px solid ${current?"#2980b9":C.borderDark}`,background:current?"#ebf5fb":C.inputBg,color:current?"#2980b9":C.textFaint,fontSize:9,fontFamily:"monospace",cursor:"pointer",fontWeight:700,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {label}
      </button>
      {open&&(
        <div style={{position:"absolute",top:"100%",right:0,zIndex:9999,background:C.card,border:`1px solid ${C.borderDark}`,borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",minWidth:180,padding:6,marginTop:3}}>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar o crear…" onKeyDown={e=>e.key==="Enter"&&(filtered.length===1?assign(filtered[0].id):createAndAssign())}
            style={{width:"100%",padding:"5px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:4}}/>
          <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
            {current&&<div onClick={()=>assign("")}
              style={{padding:"5px 8px",borderRadius:6,background:"#fff5f5",color:"#c0392b",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
              ✕ Quitar selección
            </div>}
            {filtered.map(s=>(
              <div key={s.id} onClick={()=>assign(s.id)}
                style={{padding:"5px 8px",borderRadius:6,background:s.id===current?"#ebf5fb":C.inputBg,border:`1px solid ${s.id===current?"#2980b9":C.border}`,color:C.text,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:s.id===current?700:400}}>
                🏳️ {s.country} <span style={{color:C.textFaint}}>({(s.squad||[]).length}j)</span>
              </div>
            ))}
            {q.trim()&&!filtered.some(s=>s.country.toUpperCase()===q.trim().toUpperCase())&&(
              <div onClick={createAndAssign}
                style={{padding:"5px 8px",borderRadius:6,background:"#f0fff4",border:"1px solid #27ae60",color:"#27ae60",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
                + Crear "{q.trim().toUpperCase()}" y asignar
              </div>
            )}
            {filtered.length===0&&!q.trim()&&<div style={{color:C.textFaint,fontSize:10,padding:"6px 8px",fontFamily:"'DM Sans',sans-serif"}}>No hay selecciones aún</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function SeleccionesModal({onClose,lockedCountry,isAdmin,allSels:allSelsProp}){
  const[selPais,setSelPais]=useState(lockedCountry||"");
  const[selList,setSelList]=useState([]);
  const[selFormation,setSelFormation]=useState("4-3-3");
  const[selStarters,setSelStarters]=useState({});
  const[selSubs,setSelSubs]=useState(Array(7).fill(null));
  const[selImg,setSelImg]=useState("");
  const[selImgEdit,setSelImgEdit]=useState(false);
  const[selCode,setSelCode]=useState("");
  const[selPickModal,setSelPickModal]=useState(null);
  const[saving,setSaving]=useState(false);
  const[addMode,setAddMode]=useState(false);
  const[newP,setNewP]=useState({name:"",pos:"",overall:""});
  const[allSelsFb,setAllSelsFb]=useState([]);
  const allSels=allSelsProp||allSelsFb;
  const[selSearch,setSelSearch]=useState("");
  const[playerSearch,setPlayerSearch]=useState("");

  useEffect(()=>{
    if(allSelsProp) return; // already provided
    getDocs(collection(db,"selecciones")).then(snap=>{
      setAllSelsFb(snap.docs.map(d=>({id:d.id,...d.data()})));
    }).catch(()=>{});
  },[allSelsProp]);

  useEffect(()=>{
    if(!selPais) return;
    getDoc(doc(db,"selecciones",selPais)).then(snap=>{
      if(snap.exists()){const d=snap.data();setSelFormation(d.formation||"4-3-3");setSelStarters(d.starters||{});setSelSubs(d.subs||Array(7).fill(null));setSelImg(d.image||"");setSelCode(d.code||"");setSelList(d.squad||[]);}
      else{setSelFormation("4-3-3");setSelStarters({});setSelSubs(Array(7).fill(null));setSelImg("");setSelList([]);}
    }).catch(()=>{});
  },[selPais]);

  const save=async(patch={})=>{
    if(!selPais) return;
    setSaving(true);
    try{await setDoc(doc(db,"selecciones",selPais),{country:selPais,formation:selFormation,starters:selStarters,subs:selSubs,image:selImg,code:selCode,squad:selList,...patch},{merge:true});}catch(e){}
    setSaving(false);
  };
  const addPlayer=async()=>{
    if(!newP.name.trim()) return;
    const p={name:newP.name.trim(),pos:newP.pos||"",overall:newP.overall?parseInt(newP.overall):null,id:`sel_${Date.now()}_${Math.random().toString(36).slice(2,5)}`};
    const sq=[...selList,p];setSelList(sq);setNewP({name:"",pos:"",overall:""});await save({squad:sq});
  };
  const removePlayer=async(id)=>{const sq=selList.filter(p=>p.id!==id);setSelList(sq);await save({squad:sq});};
  const createSel=async()=>{
    if(!selSearch.trim()) return;
    const id=selSearch.trim().toUpperCase().replace(/\s+/g,"_");
    try{await setDoc(doc(db,"selecciones",id),{country:selSearch.trim().toUpperCase(),formation:"4-3-3",starters:{},subs:Array(7).fill(null),image:"",squad:[]});}catch(e){}
    setAllSelsFb(prev=>[...prev,{id,country:selSearch.trim().toUpperCase(),squad:[]}]);setSelPais(id);setSelSearch("");
  };
  const selPos=FORMATIONS[selFormation]||[];
  const usedN=[...Object.values(selStarters).filter(Boolean).map(p=>p.name),...selSubs.filter(Boolean).map(p=>p.name)];
  const avail=selList.filter(p=>!usedN.includes(p.name));
  const filteredList=playerSearch.trim()?selList.filter(p=>(p.name||"").toLowerCase().includes(playerSearch.toLowerCase())||(p.pos||"").toLowerCase().includes(playerSearch.toLowerCase())):selList;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:2000,display:"flex",alignItems:"stretch",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.card,width:"100%",maxWidth:520,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 0 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"12px 16px",background:"#1a3a5c",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{lockedCountry?"🏳️ MI SELECCIÓN":"🏳️ SELECCIONES NACIONALES"}</span>
          {saving&&<span style={{fontSize:10,color:"#f39c12",fontFamily:"'DM Sans',sans-serif"}}>Guardando…</span>}
          <button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {/* Selector de selección — solo admin sin lockedCountry */}
        {!lockedCountry&&(
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0,display:"flex",gap:6,alignItems:"center"}}>
            <select value={selPais} onChange={e=>setSelPais(e.target.value)} style={{flex:1,padding:"7px 10px",borderRadius:9,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
              <option value="">— Selecciona una selección —</option>
              {[...allSels].sort((a,b)=>(a.country||"").localeCompare(b.country||"")).map(s=><option key={s.id} value={s.id}>{s.country} ({(s.squad||[]).length})</option>)}
            </select>
            {selPais&&<select value={selFormation} onChange={e=>{setSelFormation(e.target.value);save({formation:e.target.value});}} style={{width:90,padding:"7px 6px",borderRadius:9,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none"}}>
              {Object.keys(FORMATIONS).map(f=><option key={f} value={f}>{f}</option>)}
            </select>}
            {selPais&&<button title="Renombrar" onClick={async()=>{
              const newName=window.prompt("Nuevo nombre para la selección:",allSels.find(s=>s.id===selPais)?.country||selPais);
              if(!newName||!newName.trim()) return;
              await updateDoc(doc(db,"selecciones",selPais),{country:newName.trim().toUpperCase()});
              setAllSelsFb(prev=>prev.map(s=>s.id===selPais?{...s,country:newName.trim().toUpperCase()}:s));
            }} style={{padding:"6px 8px",borderRadius:8,background:"#ebf5fb",border:"1px solid #2980b9",color:"#2980b9",fontSize:12,cursor:"pointer",flexShrink:0}}>✏️</button>}
            {selPais&&<button title="Eliminar selección" onClick={async()=>{
              const sel=allSels.find(s=>s.id===selPais);
              if(!window.confirm(`¿Eliminar "${sel?.country||selPais}"? Esta acción no se puede deshacer.`)) return;
              await deleteDoc(doc(db,"selecciones",selPais));
              setAllSelsFb(prev=>prev.filter(s=>s.id!==selPais));
              setSelPais("");
            }} style={{padding:"6px 8px",borderRadius:8,background:"#fff5f5",border:"1px solid #e74c3c",color:"#e74c3c",fontSize:12,cursor:"pointer",flexShrink:0}}>🗑️</button>}
          </div>
        )}
        {/* Formación inline cuando el país está fijado */}
        {lockedCountry&&selPais&&(
          <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0,display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif",flex:1}}>Formación</span>
            <select value={selFormation} onChange={e=>{setSelFormation(e.target.value);save({formation:e.target.value});}} style={{width:110,padding:"6px 8px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none"}}>
              {Object.keys(FORMATIONS).map(f=><option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        )}
        {/* Crear selección — solo admin */}
        {!lockedCountry&&(
          <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0,display:"flex",gap:6}}>
            <input value={selSearch} onChange={e=>setSelSearch(e.target.value)} placeholder="Nueva selección (ej: ESPAÑA)…" onKeyDown={e=>e.key==="Enter"&&createSel()}
              style={{flex:1,padding:"6px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
            <button onClick={createSel} style={{padding:"6px 12px",borderRadius:8,background:"#1a3a5c",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Crear</button>
          </div>
        )}
        {!selPais&&!lockedCountry?<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",fontSize:13}}><span style={{fontSize:32}}>🏳️</span><span>Selecciona o crea una selección</span></div>:
        !selPais&&lockedCountry?<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",fontSize:13}}><span style={{fontSize:32}}>⏳</span><span>El admin aún no asignó tu selección.</span></div>:(
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              {selImg&&<img src={selImg} alt="" style={{width:36,height:36,objectFit:"contain",borderRadius:6,border:`1px solid ${C.border}`}} onError={e=>e.target.style.display="none"}/>}
              {selImgEdit?<input autoFocus value={selImg} onChange={e=>setSelImg(e.target.value)} placeholder="URL imagen…" style={{flex:1,padding:"6px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}} onBlur={()=>{setSelImgEdit(false);save({image:selImg});}} onKeyDown={e=>e.key==="Enter"&&(setSelImgEdit(false),save({image:selImg}))}/>:
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'Bebas Neue',sans-serif"}}>{allSels.find(s=>s.id===selPais)?.country||selPais}</div><div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{selList.length} convocados · {Object.values(selStarters).filter(Boolean).length}/11</div></div>}
              <button onClick={()=>setSelImgEdit(v=>!v)} style={{padding:"5px 9px",borderRadius:7,border:`1px solid ${C.border}`,background:C.inputBg,color:C.textMid,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{selImgEdit?"✓":"🖼"}</button>
            </div>
            {/* Código FC26 */}
            <div style={{padding:"6px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <span style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>Código FC26:</span>
              <input value={selCode} maxLength={30} placeholder="Ej: 8A3F-9K2D"
                onChange={e=>setSelCode(e.target.value.slice(0,30))}
                onBlur={()=>save({code:selCode})}
                onKeyDown={e=>e.key==="Enter"&&save({code:selCode})}
                style={{flex:1,padding:"4px 9px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,outline:"none",fontFamily:"monospace",maxWidth:180}}
                onFocus={e=>e.target.style.borderColor="#1a3a5c"} />
              {selCode&&<span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{selCode.length}/30</span>}
            </div>
            <div style={{background:"linear-gradient(180deg,#1a6b2a,#1e7a30,#1a6b2a)",position:"relative",height:270,flexShrink:0}}>
              <div style={{position:"absolute",inset:8,border:"1.5px solid rgba(255,255,255,0.2)",borderRadius:4,pointerEvents:"none"}}/>
              <div style={{position:"absolute",left:"50%",top:8,bottom:8,width:1,background:"rgba(255,255,255,0.15)",transform:"translateX(-50%)",pointerEvents:"none"}}/>
              {selPos.map(pos=>{const pl=selStarters[pos.id]||null;return(
                <div key={pos.id} onClick={()=>setSelPickModal({posId:pos.id,posLabel:pos.label,type:"starter"})} style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",zIndex:2}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:pl?"linear-gradient(135deg,#1a3a5c,#2980b9)":"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.85)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,0.4)"}}>
                    <span style={{fontSize:pl?.overall?10:8,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif"}}>{pl?.overall||pos.label}</span>
                  </div>
                  {pl&&<><div style={{fontSize:7,fontWeight:800,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,0.9)",whiteSpace:"nowrap",maxWidth:44,overflow:"hidden",textOverflow:"ellipsis",fontFamily:"'Bebas Neue',sans-serif"}}>{pl.name.split(" ").slice(-1)[0].toUpperCase()}</div>
                  <div style={{fontSize:6,background:"rgba(26,58,92,0.85)",color:"#fff",padding:"1px 3px",borderRadius:3,fontFamily:"monospace",fontWeight:700}}>{pos.label}</div></>}
                </div>);})}
            </div>
            <div style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,background:"rgba(26,58,92,0.04)",flexShrink:0}}>
              <div style={{fontSize:9,color:C.textLight,fontWeight:700,marginBottom:5,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.5}}>Banca</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{Array(7).fill(0).map((_,i)=>{const sub=selSubs[i]||null;return(<div key={i} onClick={()=>setSelPickModal({type:"sub",subIdx:i})} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",width:38}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:sub?"linear-gradient(135deg,#1a3a5c,#2980b9)":"rgba(26,58,92,0.08)",border:`2px solid ${sub?"#2980b9":C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:sub?.overall?10:12,fontWeight:800,color:sub?"#fff":C.textFaint,fontFamily:"'Bebas Neue',sans-serif"}}>{sub?.overall||"+"}</span>
                </div>
                {sub&&<span style={{fontSize:8,fontWeight:700,color:C.textMid,fontFamily:"'DM Sans',sans-serif",textAlign:"center",lineHeight:1.1,maxWidth:38,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub.name?.split(" ").slice(-1)[0]}</span>}
              </div>);})}</div>
            </div>
            <div style={{padding:"10px 14px",flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:10,fontWeight:700,color:C.textLight,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.5}}>Convocatoria ({selList.length})</span>
                <button onClick={()=>setAddMode(v=>!v)} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:7,background:addMode?"#1a3a5c":"#ebf5fb",color:addMode?"#fff":"#2980b9",border:"1px solid #2980b9",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{addMode?"× Cancelar":"+ Agregar"}</button>
              </div>
              {addMode&&<div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                <input value={newP.name} onChange={e=>setNewP(p=>({...p,name:e.target.value}))} placeholder="Nombre *" onKeyDown={e=>e.key==="Enter"&&addPlayer()} style={{flex:2,minWidth:100,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
                <input value={newP.pos} onChange={e=>setNewP(p=>({...p,pos:e.target.value}))} placeholder="Pos" style={{width:55,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
                <input value={newP.overall} onChange={e=>setNewP(p=>({...p,overall:e.target.value}))} placeholder="OVR" style={{width:44,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
                <button onClick={addPlayer} style={{padding:"6px 12px",borderRadius:7,background:"#1a3a5c",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Añadir</button>
              </div>}
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {selList.length>5&&<input value={playerSearch} onChange={e=>setPlayerSearch(e.target.value)} placeholder="🔍 Buscar…" style={{marginBottom:5,width:"100%",padding:"5px 9px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}}/>}
                {filteredList.map(p=>{const inU=usedN.includes(p.name);return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:8,background:inU?"rgba(41,128,185,0.08)":C.inputBg,border:`1px solid ${inU?"#aed6f1":C.border}`}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#2980b9",background:"#ebf5fb",padding:"2px 5px",borderRadius:4,fontFamily:"monospace",minWidth:24,textAlign:"center"}}>{p.pos||"?"}</span>
                  <span style={{flex:1,fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{p.name}</span>
                  {p.overall&&<span style={{fontSize:11,fontWeight:800,color:"#2980b9",fontFamily:"monospace"}}>{p.overall}</span>}
                  {inU&&<span style={{fontSize:8,color:"#2980b9"}}>✓</span>}
                  <button onClick={()=>removePlayer(p.id)} style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",fontSize:13,padding:"0 2px"}}>×</button>
                </div>);})}
                {filteredList.length===0&&selList.length===0&&<div style={{textAlign:"center",color:C.textFaint,fontSize:11,fontFamily:"'DM Sans',sans-serif",padding:"12px 0"}}>Agrega jugadores arriba</div>}
                {filteredList.length===0&&selList.length>0&&<div style={{textAlign:"center",color:C.textFaint,fontSize:11,fontFamily:"'DM Sans',sans-serif",padding:"12px 0"}}>Sin coincidencias</div>}
              </div>
            </div>
          </div>
        )}
      </div>
      {selPickModal&&<div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setSelPickModal(null)}>
        <div style={{background:C.card,width:"100%",maxWidth:520,maxHeight:"55vh",borderRadius:"14px 14px 0 0",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 -8px 30px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{selPickModal.type==="starter"?`Poner en ${selPickModal.posLabel}`:"Elegir suplente"}</span>
            <button onClick={()=>setSelPickModal(null)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:24,height:24,color:C.textMid,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          <div style={{overflowY:"auto",flex:1,padding:"6px 10px 12px",display:"flex",flexDirection:"column",gap:4}}>
            <div onClick={()=>{if(selPickModal.type==="starter"){const s={...selStarters};delete s[selPickModal.posId];setSelStarters(s);save({starters:s});}else{const sb=[...selSubs];sb[selPickModal.subIdx]=null;setSelSubs(sb);save({subs:sb});}setSelPickModal(null);}}
              style={{padding:"6px 10px",borderRadius:7,background:"#fff5f5",border:"1px solid #ffcccc",cursor:"pointer",fontSize:11,color:"#c0392b",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>× Quitar</div>
            {filteredList.map(p=>{
              // detect where this player is already placed
              const inStarterPos=Object.entries(selStarters).find(([k,v])=>v&&v.name===p.name)?.[0];
              const inSubIdx=selSubs.findIndex(s=>s&&s.name===p.name);
              const inUse=inStarterPos!==undefined||inSubIdx!==-1;
              return(<div key={p.id} onClick={()=>{
                const pl={...p};
                if(selPickModal.type==="starter"){
                  const s={...selStarters};
                  // if player already in another starter spot → swap
                  if(inStarterPos&&inStarterPos!==selPickModal.posId){
                    const displaced=s[selPickModal.posId]||null;
                    s[inStarterPos]=displaced; // put displaced player where picked-from was
                  } else if(inSubIdx!==-1){
                    // player was in bench → free that bench slot
                    const sb=[...selSubs]; sb[inSubIdx]=null; setSelSubs(sb);
                    const newS={...s,[selPickModal.posId]:pl};
                    setSelStarters(newS);save({starters:newS,subs:sb});setSelPickModal(null);return;
                  }
                  s[selPickModal.posId]=pl;
                  setSelStarters(s);save({starters:s});
                } else {
                  const sb=[...selSubs];
                  // if player already in bench → swap slots
                  if(inSubIdx!==-1&&inSubIdx!==selPickModal.subIdx){
                    const displaced=sb[selPickModal.subIdx]||null;
                    sb[inSubIdx]=displaced;
                  } else if(inStarterPos!==undefined){
                    // player was starter → remove from field
                    const s={...selStarters}; delete s[inStarterPos];
                    sb[selPickModal.subIdx]=pl;
                    setSelStarters(s);setSelSubs(sb);save({starters:s,subs:sb});setSelPickModal(null);return;
                  }
                  sb[selPickModal.subIdx]=pl;
                  setSelSubs(sb);save({subs:sb});
                }
                setSelPickModal(null);
              }}
                style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,background:inUse?"rgba(41,128,185,0.07)":C.inputBg,border:`1px solid ${inUse?"#2980b9":C.border}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#2980b9"} onMouseLeave={e=>e.currentTarget.style.borderColor=inUse?"#2980b9":C.border}>
                <span style={{fontSize:9,fontWeight:700,color:"#2980b9",background:"#ebf5fb",padding:"2px 5px",borderRadius:4,fontFamily:"monospace",flexShrink:0,minWidth:24,textAlign:"center"}}>{p.pos||"?"}</span>
                <span style={{flex:1,fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{p.name}</span>
                {inUse&&<span style={{fontSize:9,color:"#2980b9",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{inStarterPos?"✓ campo":"✓ banca"}</span>}
                {p.overall&&<span style={{fontSize:12,fontWeight:800,color:"#2980b9",fontFamily:"monospace"}}>{p.overall}</span>}
              </div>);
            })}
            {filteredList.length===0&&<div style={{color:C.textFaint,fontSize:11,textAlign:"center",padding:"12px",fontFamily:"'DM Sans',sans-serif"}}>Agrega jugadores primero</div>}
          </div>
        </div>
      </div>}
    </div>
  );
}

// ─── TRANSFER CENTER ─────────────────────────────────────────────────────────
// ─── MERCADO CALCULATOR ───────────────────────────────────────────────────────
function MercadoModal({onClose,teamData,saveTeam,allTeams,embedded=false}){
  const slots=teamData?.mercadoSlots||{altas:6,bajas:6};
  const maxAltas=slots.altas||6;
  const maxBajas=slots.bajas||6;
  const teamUid=teamData?.uid||teamData?.id;

  // Cargar transferencias pendientes en tiempo real
  const[pendingTransfers,setPendingTransfers]=useState([]);
  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"transfers"),snap=>{
      const all=snap.docs.map(d=>({id:d.id,...d.data()}));
      const pending=all.filter(t=>
        (t.fromUid===teamUid||t.toUid===teamUid)&&
        ["pending_acceptance","pending_admin"].includes(t.status)
      );
      setPendingTransfers(pending);
    });
    return unsub;
  },[teamUid]);

  const[ignoredTransferIds,setIgnoredTransferIds]=useState(new Set());

  const mercado=teamData?.mercado||{bajas:Array(maxBajas).fill({name:"",price:"",team:""}),altas:Array(maxAltas).fill({name:"",price:"",team:""}),finalizado:false};

  // Merge mercado guardado + transferencias pendientes
  const buildLista=(tipo,max)=>{
    const base=(mercado[tipo]||[]).map(b=>({name:b.name||"",price:b.price||"",team:b.team||"",transferId:b.transferId||""}));
    while(base.length<max) base.push({name:"",price:"",team:"",transferId:""});
    const lista=base.slice(0,max);
    for(const tr of pendingTransfers){
      const esEmisor=tr.fromUid===teamUid;
      const jugadores=tipo==="bajas"
        ?(esEmisor?tr.offeredPlayers:tr.requestedPlayers)
        :(esEmisor?tr.requestedPlayers:tr.offeredPlayers);
      const dinero=tipo==="bajas"
        ?(esEmisor?tr.offeredMoney:tr.requestedMoney)
        :(esEmisor?tr.requestedMoney:tr.offeredMoney);
      const equipoLabel=tipo==="bajas"
        ?(esEmisor?"→ "+tr.toName:"→ "+tr.fromName)
        :(esEmisor?"← "+tr.toName:"← "+tr.fromName);
      if(!jugadores?.length) continue;
      if(ignoredTransferIds.has(tr.id)) continue; // usuario borró esta fila manualmente
      const precioM=dinero>0&&jugadores.length?(dinero/jugadores.length/1000000).toFixed(1):"";
      for(const p of jugadores){
        const yaExiste=lista.findIndex(x=>x.transferId===tr.id&&x.name===p.name);
        if(yaExiste!==-1){
          lista[yaExiste]={...lista[yaExiste],price:precioM||lista[yaExiste].price,team:"⏳ "+equipoLabel};
          continue;
        }
        const emptyIdx=lista.findIndex(x=>!x.name||x.name.trim()==="");
        if(emptyIdx!==-1) lista[emptyIdx]={name:p.name,price:precioM,team:"⏳ "+equipoLabel,transferId:tr.id};
      }
    }
    return lista;
  };

  const[bajas,setBajas]=useState(()=>buildLista("bajas",maxBajas));
  const[altas,setAltas]=useState(()=>buildLista("altas",maxAltas));

  // Re-sincronizar cuando llegan transferencias pendientes — sin pisar precios editados manualmente
  useEffect(()=>{
    setBajas(prev=>{
      const fresh=buildLista("bajas",maxBajas);
      return fresh.map((f,i)=>{
        const existing=prev[i];
        // Si ya existe la fila y tiene precio editado manualmente, lo conservamos
        if(existing&&existing.name===f.name&&existing.transferId===f.transferId&&existing.price&&existing.price!==f.price){
          return {...f,price:existing.price};
        }
        return f;
      });
    });
    setAltas(prev=>{
      const fresh=buildLista("altas",maxAltas);
      return fresh.map((f,i)=>{
        const existing=prev[i];
        if(existing&&existing.name===f.name&&existing.transferId===f.transferId&&existing.price&&existing.price!==f.price){
          return {...f,price:existing.price};
        }
        return f;
      });
    });
  },[pendingTransfers]);
  const[saving,setSaving]=useState(false);
  const[shareText,setShareText]=useState("");

  const parsePresupuesto=v=>{
    if(!v) return 0;
    const s=String(v).trim().replace(/,/g,"");
    if(s.toUpperCase().endsWith("M")) return parseFloat(s)*1000000;
    return Number(s)||0;
  };
  const presupuesto=parsePresupuesto(teamData?.presupuesto);
  // prices stored as millions (e.g. "10.5" = 10.5M), multiply for real value
  const toVal=p=>(Number(p)||0)*1000000;
  const totalBajas=bajas.reduce((s,b)=>s+toVal(b.price),0);
  const totalAltas=altas.reduce((s,a)=>s+toVal(a.price),0);
  // Saldo usa todos los precios ingresados (pendientes incluidos — el usuario los decidió)
  const saldo=presupuesto+totalBajas-totalAltas;

  const fmtM=n=>{
    const m=n/1000000;
    return m===Math.round(m)?`${m}M`:`${m.toFixed(1)}M`;
  };

  const bajasCompletas=bajas.every(b=>b.name.trim()&&b.price!=="");
  const altasCompletas=altas.every(a=>a.name.trim()&&a.price!=="");
  const completo=bajasCompletas&&altasCompletas;

  const autosave=async(newBajas,newAltas)=>{
    await saveTeam({mercado:{bajas:newBajas,altas:newAltas,finalizado:false}});
  };

  const updateBaja=(i,field,val)=>{
    const nb=[...bajas];
    if(field==="clear"){
      if(nb[i].transferId) setIgnoredTransferIds(prev=>new Set([...prev,nb[i].transferId]));
      nb[i]={name:"",price:"",team:"",transferId:""};
    } else nb[i]={...nb[i],[field]:val};
    setBajas(nb);autosave(nb,altas);
  };
  const updateAlta=(i,field,val)=>{
    const na=[...altas];
    if(field==="clear"){
      if(na[i].transferId) setIgnoredTransferIds(prev=>new Set([...prev,na[i].transferId]));
      na[i]={name:"",price:"",team:"",transferId:""};
    } else na[i]={...na[i],[field]:val};
    setAltas(na);autosave(bajas,na);
  };

  const finalizar=async()=>{
    if(!completo) return;
    if(!window.confirm(`¿Confirmar mercado?\n\nSaldo final: ${fmtM(saldo)}\n\nEsta acción aplicará los cambios a tu presupuesto.`)) return;
    setSaving(true);
    await saveTeam({presupuesto:String(saldo),mercado:{bajas,altas,finalizado:true}});
    setSaving(false);
    onClose();
  };

  const done=mercado.finalizado;

  const rowStyle={display:"flex",gap:6,marginBottom:5,alignItems:"center",flexWrap:"wrap"};
  const inp=(val,onChange,placeholder,readonly=false)=>(
    <input value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={done||readonly}
      style={{flex:1,minWidth:100,padding:"6px 9px",borderRadius:7,border:`1px solid ${readonly?"#f39c1244":C.borderDark}`,background:done||readonly?"transparent":C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",opacity:done?0.7:1}}/>
  );
  const priceInp=(val,onChange)=>(
    <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
      <input type="number" value={val} onChange={e=>onChange(e.target.value)} placeholder="0" disabled={done} step="0.5" min="0"
        style={{width:58,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:done?"transparent":C.inputBg,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none",opacity:done?0.7:1}}/>
      <span style={{fontSize:10,fontWeight:700,color:C.textFaint,fontFamily:"monospace"}}>M</span>
    </div>
  );
  const teamSel=(val,onChange,label)=>(
    val?.startsWith("⏳")
      ?<div style={{flex:1,minWidth:90,padding:"6px 7px",borderRadius:7,border:"1px solid #f39c1255",background:"#f39c1211",color:"#f39c12",fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{val}</div>
      :<select value={val} onChange={e=>onChange(e.target.value)} disabled={done}
        style={{flex:1,minWidth:90,padding:"6px 7px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:done?"transparent":C.inputBg,color:val?C.text:C.textFaint,fontSize:10,fontFamily:"'DM Sans',sans-serif",outline:"none",opacity:done?0.7:1}}>
        <option value="">{label}</option>
        <option value="LIBRE">🆓 Agente libre</option>
        {[...allTeams].filter(t=>(t.uid||t.id)!==(teamData?.uid||teamData?.id)).sort((a,b)=>(a.teamName||"").localeCompare(b.teamName||"")).map(t=>(
          <option key={t.uid||t.id} value={t.teamName}>{t.teamName}</option>
        ))}
      </select>
  );

  const InnerMercado=(
    <>
      {/* Header interno solo cuando embedded */}
      {embedded&&(
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0,background:C.card}}>
          <span style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>📊 CALCULADORA DE MERCADO</span>
          {done&&<span style={{fontSize:10,background:"#27ae60",color:"#fff",padding:"2px 8px",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>FINALIZADO</span>}
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>
        {/* BAJAS */}
        <div>
            <div style={{fontSize:11,fontWeight:800,color:"#e74c3c",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>📤 Bajas ({bajas.filter(b=>b.name.trim()).length}/{maxBajas})</span>
              <span style={{fontSize:10,color:C.textFaint}}>Total: +{fmtM(totalBajas)}</span>
            </div>
            {bajas.map((b,i)=>{
              const bloqueado=i>=maxBajas;
              return(
              <div key={i} style={{...rowStyle,opacity:bloqueado?0.3:1,pointerEvents:bloqueado?"none":"auto"}}>
                <span style={{fontSize:10,color:C.textFaint,fontFamily:"monospace",width:14,textAlign:"right",flexShrink:0}}>{i+1}.</span>
                {inp(b.name,v=>updateBaja(i,"name",v),"Jugador")}
                {priceInp(b.price,v=>updateBaja(i,"price",v))}
                {teamSel(b.team,v=>updateBaja(i,"team",v),"→ Destino")}
                {b.name&&<button onClick={()=>updateBaja(i,"clear","")} style={{background:"none",border:"none",color:"#e74c3c",fontSize:14,cursor:"pointer",flexShrink:0,padding:"0 2px"}}>✕</button>}
              </div>
            );})}
          </div>

          {/* ALTAS */}
          <div>
            <div style={{fontSize:11,fontWeight:800,color:"#27ae60",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>📥 Altas ({altas.filter(a=>a.name.trim()).length}/{maxAltas})</span>
              <span style={{fontSize:10,color:C.textFaint}}>Total: -{fmtM(totalAltas)}</span>
            </div>
            {altas.map((a,i)=>{
              const bloqueado=i>=maxAltas;
              return(
              <div key={i} style={{...rowStyle,opacity:bloqueado?0.3:1,pointerEvents:bloqueado?"none":"auto"}}>
                <span style={{fontSize:10,color:C.textFaint,fontFamily:"monospace",width:14,textAlign:"right",flexShrink:0}}>{i+1}.</span>
                {inp(a.name,v=>updateAlta(i,"name",v),"Jugador")}
                {priceInp(a.price,v=>updateAlta(i,"price",v))}
                {teamSel(a.team,v=>updateAlta(i,"team",v),"← Origen")}
                {a.name&&<button onClick={()=>updateAlta(i,"clear","")} style={{background:"none",border:"none",color:"#e74c3c",fontSize:14,cursor:"pointer",flexShrink:0,padding:"0 2px"}}>✕</button>}
              </div>
            );})}
          </div>

          {/* Saldo */}
          <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Presupuesto actual</span>
              <span style={{fontSize:11,fontWeight:700,color:C.text,fontFamily:"monospace"}}>{fmtM(presupuesto)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,color:"#e74c3c",fontFamily:"'DM Sans',sans-serif"}}>+ Ingresos (bajas)</span>
              <span style={{fontSize:11,fontWeight:700,color:"#e74c3c",fontFamily:"monospace"}}>+{fmtM(totalBajas)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,color:"#27ae60",fontFamily:"'DM Sans',sans-serif"}}>- Gasto (altas)</span>
              <span style={{fontSize:11,fontWeight:700,color:"#27ae60",fontFamily:"monospace"}}>-{fmtM(totalAltas)}</span>
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Saldo final</span>
              <span style={{fontSize:16,fontWeight:800,color:saldo>=0?"#27ae60":"#e74c3c",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>{fmtM(saldo)}</span>
            </div>
          </div>

          {/* Estado */}
          {!done&&!completo&&(
            <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textAlign:"center",padding:"4px 0"}}>
              Faltan {6-bajas.filter(b=>b.name.trim()&&b.price!=="").length} bajas y {6-altas.filter(a=>a.name.trim()&&a.price!=="").length} altas por completar
            </div>
          )}

          {!done&&(
            <button onClick={finalizar} disabled={!completo||saving}
              style={{width:"100%",padding:"12px",borderRadius:10,background:completo?"#1a3a5c":"#ccc",color:"#fff",border:"none",fontSize:13,fontWeight:800,cursor:completo?"pointer":"not-allowed",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,opacity:saving?0.6:1}}>
              {saving?"Guardando…":"✅ Finalizar mercado"}
            </button>
          )}
          {/* Compartir — siempre visible */}
          <button onClick={()=>{
            const lines=[
              `📊 MERCADO — ${teamData?.teamName||"Mi equipo"}`,
              `💰 Presupuesto: ${fmtM(presupuesto)}`,
              ``,
              `📤 BAJAS`,
              ...bajas.map((b,i)=>`${i+1}. ${b.name||"—"} ${b.price?`(${b.price}M)`:""} ${b.team?`→ ${b.team}`:""}`),
              ``,
              `📥 ALTAS`,
              ...altas.map((a,i)=>`${i+1}. ${a.name||"—"} ${a.price?`(${a.price}M)`:""} ${a.team?`← ${a.team}`:""}`),
              ``,
              `💵 Saldo final: ${fmtM(saldo)}`,
              done?"✅ Mercado finalizado":"⏳ Pendiente de finalizar",
            ];
            const text=lines.join("\n");
            if(navigator.share){
              navigator.share({text}).catch(()=>setShareText(text));
            } else {
              setShareText(text);
            }
          }}
            style={{width:"100%",padding:"10px",borderRadius:10,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            📤 Compartir mercado
          </button>
          {shareText&&(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <textarea readOnly value={shareText} rows={14}
                style={{width:"100%",padding:"10px",borderRadius:9,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"monospace",resize:"none",outline:"none",boxSizing:"border-box"}}
                onFocus={e=>e.target.select()}
              />
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{
                  const ta=document.createElement("textarea");
                  ta.value=shareText;
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand("copy");
                  document.body.removeChild(ta);
                  alert("✅ Copiado");
                }} style={{flex:1,padding:"8px",borderRadius:8,background:"#1a3a5c",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  📋 Copiar
                </button>
                <button onClick={()=>setShareText("")}
                  style={{padding:"8px 14px",borderRadius:8,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  ✕
                </button>
              </div>
            </div>
          )}
          {done&&(
            <div style={{textAlign:"center",color:"#27ae60",fontWeight:700,fontFamily:"'DM Sans',sans-serif",fontSize:12,padding:"8px 0"}}>
              ✅ Mercado finalizado — presupuesto actualizado
            </div>
          )}
        </div>
      </>
  );

  if(embedded) return <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>{InnerMercado}</div>;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:2000,display:"flex",alignItems:"stretch",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.card,width:"100%",maxWidth:520,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 0 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"12px 16px",background:"#1a3a5c",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>📊 CALCULADORA DE MERCADO</span>
          {done&&<span style={{fontSize:10,background:"#27ae60",color:"#fff",padding:"2px 8px",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>FINALIZADO</span>}
          <button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {InnerMercado}
      </div>
    </div>
  );
}

function TransferCenter({onClose,user,isAdmin,teamData,allTeams,pool,embedded=false}){
  const[tab,setTab]=useState("inbox"); // inbox | outbox | new | admin
  const[transfers,setTransfers]=useState([]);
  const[newT,setNewT]=useState({toUid:"",offeredPlayers:[],requestedPlayers:[],offeredMoney:0,requestedMoney:0,note:""});
  const[step,setStep]=useState(1);
  const[sending,setSending]=useState(false);
  const[pickerMode,setPickerMode]=useState(null); // "offered"|"requested"
  const[playerSearch,setPlayerSearch]=useState("");

  // load transfers realtime
  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"transfers"),snap=>{
      setTransfers(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return unsub;
  },[]);

  const mySquad=teamData?.squad||[];
  const toTeam=allTeams.find(t=>(t.uid||t.id)===newT.toUid);
  const toSquad=toTeam?(toTeam.squad||[]).map(p=>({...p,teamUid:newT.toUid,teamName:toTeam.teamName})):[];

  // filtered
  const inbox=transfers.filter(t=>t.toUid===user.uid&&t.status==="pending_acceptance");
  const outbox=transfers.filter(t=>t.fromUid===user.uid&&["pending_acceptance","pending_admin"].includes(t.status));
  const adminQueue=transfers.filter(t=>t.status==="pending_admin");
  const historial=transfers.filter(t=>t.fromUid===user.uid||t.toUid===user.uid).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const badge=inbox.length+(isAdmin?adminQueue.length:0);

  const addPendienteToMercado=async(teamUid,tData,tipo,jugadores,dinero,transferId)=>{
    if(!jugadores?.length) return; // solo procesamos jugadores, no dinero puro
    const tSnap=await getDoc(doc(db,"teams",teamUid));
    if(!tSnap.exists()) return;
    const tInfo=tSnap.data();
    const slots=tInfo.mercadoSlots||{altas:6,bajas:6};
    const maxSlots=slots[tipo]||6;
    const mercado=tInfo.mercado||{bajas:Array(maxSlots).fill({name:"",price:"",team:""}),altas:Array(maxSlots).fill({name:"",price:"",team:""}),finalizado:false};
    const lista=[...(mercado[tipo]||[])];
    const precioM=dinero>0&&jugadores.length?(dinero/jugadores.length/1000000).toFixed(1):"0";
    for(const p of jugadores){
      const yaExiste=lista.findIndex(x=>x.transferId===transferId&&x.name===p.name);
      if(yaExiste!==-1) continue;
      const emptyIdx=lista.findIndex(x=>!x.name||x.name.trim()==="");
      if(emptyIdx!==-1) lista[emptyIdx]={name:p.name,price:precioM,team:"⏳ Pendiente",transferId};
      else if(lista.length<maxSlots) lista.push({name:p.name,price:precioM,team:"⏳ Pendiente",transferId});
    }
    await updateDoc(doc(db,"teams",teamUid),{mercado:{...mercado,[tipo]:lista}});
  };

  const sendTransfer=async()=>{
    if(!newT.toUid) return;
    setSending(true);
    if(newT.editingId){
      await updateDoc(doc(db,"transfers",newT.editingId),{
        offeredPlayers:newT.offeredPlayers,
        requestedPlayers:newT.requestedPlayers,
        offeredMoney:Number(newT.offeredMoney)||0,
        requestedMoney:Number(newT.requestedMoney)||0,
        note:newT.note,
        editedAt:serverTimestamp(),
      });
    } else {
      const transferRef=await addDoc(collection(db,"transfers"),{
        fromUid:user.uid,
        fromName:teamData.teamName,
        toUid:newT.toUid,
        toName:toTeam?.teamName||"",
        offeredPlayers:newT.offeredPlayers,
        requestedPlayers:newT.requestedPlayers,
        offeredMoney:Number(newT.offeredMoney)||0,
        requestedMoney:Number(newT.requestedMoney)||0,
        note:newT.note,
        status:"pending_acceptance",
        createdAt:serverTimestamp(),
      });
      await addPendienteToMercado(user.uid,teamData,"bajas",newT.offeredPlayers,newT.offeredMoney,transferRef.id);
      await addPendienteToMercado(user.uid,teamData,"altas",newT.requestedPlayers,newT.requestedMoney,transferRef.id);
    }
    setSending(false);
    setNewT({toUid:"",offeredPlayers:[],requestedPlayers:[],offeredMoney:0,requestedMoney:0,note:""});
    setStep(1);
    setTab("outbox");
  };

  const accept=async(tr)=>{
    await updateDoc(doc(db,"transfers",tr.id),{status:"pending_admin",acceptedAt:serverTimestamp()});
    // Agregar al mercado del receptor como pendiente
    const toTeamData=allTeams.find(t=>(t.uid||t.id)===tr.toUid);
    // jugadores pedidos (los que from ofreció) → bajas para to
    await addPendienteToMercado(tr.toUid,toTeamData,"bajas",tr.requestedPlayers,tr.requestedMoney,tr.id);
    // jugadores ofrecidos → altas para to
    await addPendienteToMercado(tr.toUid,toTeamData,"altas",tr.offeredPlayers,tr.offeredMoney,tr.id);
  };

  const reject=async(tr)=>{
    await updateDoc(doc(db,"transfers",tr.id),{status:"rejected",rejectedAt:serverTimestamp(),rejectedBy:"recipient"});
  };

  const adminApprove=async(tr)=>{
    // execute the transfer
    try{
      const pSnap=await getDoc(doc(db,"pool","players"));
      const pd=pSnap.exists()?{...pSnap.data()}:{};

      // move offered players from→to
      for(const p of tr.offeredPlayers){
        const key=Object.keys(pd).find(k=>pd[k].teamUid===tr.fromUid&&pd[k].name===p.name);
        if(key){pd[key]={...pd[key],teamUid:tr.toUid,teamName:tr.toName};}
        // update squad
        const fromSnap=await getDoc(doc(db,"teams",tr.fromUid));
        if(fromSnap.exists()){
          const sq=(fromSnap.data().squad||[]).filter(s=>s.name!==p.name);
          await updateDoc(doc(db,"teams",tr.fromUid),{squad:sq});
        }
        const toSnap=await getDoc(doc(db,"teams",tr.toUid));
        if(toSnap.exists()){
          const sq=[...(toSnap.data().squad||[]),{...p,poolKey:Object.keys(pd).find(k=>pd[k].name===p.name&&pd[k].teamUid===tr.toUid)||p.poolKey}];
          await updateDoc(doc(db,"teams",tr.toUid),{squad:sq});
        }
      }
      // move requested players to→from
      for(const p of tr.requestedPlayers){
        const key=Object.keys(pd).find(k=>pd[k].teamUid===tr.toUid&&pd[k].name===p.name);
        if(key){pd[key]={...pd[key],teamUid:tr.fromUid,teamName:tr.fromName};}
        const toSnap=await getDoc(doc(db,"teams",tr.toUid));
        if(toSnap.exists()){
          const sq=(toSnap.data().squad||[]).filter(s=>s.name!==p.name);
          await updateDoc(doc(db,"teams",tr.toUid),{squad:sq});
        }
        const fromSnap=await getDoc(doc(db,"teams",tr.fromUid));
        if(fromSnap.exists()){
          const sq=[...(fromSnap.data().squad||[]),p];
          await updateDoc(doc(db,"teams",tr.fromUid),{squad:sq});
        }
      }
      // handle money → se mueve al finalizar mercado, no aquí
      await setDoc(doc(db,"pool","players"),pd);

      // ── Auto-poblar mercado ──────────────────────────────────────────────
      const addToMercado=async(teamUid,tipo,jugadores,precio,transferId)=>{
        const tSnap=await getDoc(doc(db,"teams",teamUid));
        if(!tSnap.exists()) return;
        const mercado=tSnap.data().mercado||{bajas:Array(6).fill({name:"",price:"",team:""}),altas:Array(6).fill({name:"",price:"",team:""}),finalizado:false};
        const lista=[...mercado[tipo]];
        const precioM=precio>0?(precio/1000000).toFixed(1):"0";
        for(const p of jugadores){
          const pendIdx=lista.findIndex(x=>x.transferId===transferId&&x.name===p.name);
          if(pendIdx!==-1){
            // Conservar precio editado manualmente si ya tiene uno
            const precioFinal=lista[pendIdx].price&&lista[pendIdx].price!=="0"?lista[pendIdx].price:precioM;
            // Extraer nombre del equipo quitando el "⏳ → " o "⏳ ← "
            const teamClean=(lista[pendIdx].team||"").replace(/^⏳ [→←] /,"").replace(/^⏳ /,"");
            lista[pendIdx]={name:p.name,price:precioFinal,team:teamClean,transferId:""};
          } else {
            const emptyIdx=lista.findIndex(x=>!x.name||x.name.trim()==="");
            if(emptyIdx!==-1) lista[emptyIdx]={name:p.name,price:precioM,team:"",transferId:""};
            else lista.push({name:p.name,price:precioM,team:"",transferId:""});
          }
        }
        await updateDoc(doc(db,"teams",teamUid),{mercado:{...mercado,[tipo]:lista.slice(0,Math.max(6,lista.length))}});
      };
      // jugadores que from vendió → baja para from, alta para to
      if(tr.offeredPlayers?.length>0){
        const precioPorJugador=tr.offeredMoney>0?Math.round(tr.offeredMoney/tr.offeredPlayers.length):0;
        await addToMercado(tr.fromUid,"bajas",tr.offeredPlayers,precioPorJugador,tr.id);
        await addToMercado(tr.toUid,"altas",tr.offeredPlayers,precioPorJugador,tr.id);
      }
      // jugadores que to cedió → baja para to, alta para from
      if(tr.requestedPlayers?.length>0){
        const precioPorJugador=tr.requestedMoney>0?Math.round(tr.requestedMoney/tr.requestedPlayers.length):0;
        await addToMercado(tr.toUid,"bajas",tr.requestedPlayers,precioPorJugador,tr.id);
        await addToMercado(tr.fromUid,"altas",tr.requestedPlayers,precioPorJugador,tr.id);
      }
      // ────────────────────────────────────────────────────────────────────

      await updateDoc(doc(db,"transfers",tr.id),{status:"completed",completedAt:serverTimestamp()});
    }catch(e){alert("Error al aprobar: "+e.message);}
  };

  const adminReject=async(tr)=>{
    await updateDoc(doc(db,"transfers",tr.id),{status:"rejected",rejectedAt:serverTimestamp(),rejectedBy:"admin"});
  };

  const statusLabel={pending_acceptance:"⏳ Esperando respuesta",pending_admin:"🔐 Esperando admin",completed:"✅ Aprobada",approved:"✅ Aprobada",rejected:"❌ Rechazada"};
  const statusColor={pending_acceptance:"#f39c12",pending_admin:"#9b59b6",completed:"#27ae60",approved:"#27ae60",rejected:"#e74c3c"};

  const TCard=({tr,mode})=>{
    const isFrom=tr.fromUid===user.uid;
    const other=isFrom?tr.toName:tr.fromName;
    return(
      <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{color:C.textFaint,fontWeight:400}}>De: </span>{tr.fromName}
            </div>
            <div style={{fontSize:11,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{color:C.textFaint,fontWeight:400}}>A: </span>{tr.toName}
            </div>
          </div>
          <span style={{fontSize:9,fontWeight:700,color:statusColor[tr.status],background:statusColor[tr.status]+"22",padding:"2px 7px",borderRadius:20,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{statusLabel[tr.status]}</span>
        </div>
        <div style={{display:"flex",gap:16,marginBottom:6,flexWrap:"wrap"}}>
          {tr.offeredPlayers?.length>0&&<div style={{fontSize:10,color:C.textMid,fontFamily:"'DM Sans',sans-serif"}}><span style={{color:C.textFaint}}>Ofrece: </span>{tr.offeredPlayers.map(p=>p.name).join(", ")}</div>}
          {tr.offeredMoney>0&&<div style={{fontSize:10,color:"#27ae60",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>+{(tr.offeredMoney/1000000).toLocaleString()}M</div>}
          {(tr.requestedPlayers?.length>0||tr.requestedMoney>0)&&<div style={{fontSize:10,color:C.textMid,fontFamily:"'DM Sans',sans-serif"}}>
            <span style={{color:C.textFaint}}>Pide: </span>
            {tr.requestedPlayers?.map(p=>p.name).join(", ")}
            {tr.requestedMoney>0&&` + ${(tr.requestedMoney/1000000).toLocaleString()}M`}
          </div>}
        </div>
        {tr.note&&<div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",fontStyle:"italic",marginBottom:6}}>"{tr.note}"</div>}
        {mode==="outbox"&&tr.status==="pending_acceptance"&&(
          <div style={{display:"flex",gap:6,marginTop:4}}>
            <button onClick={()=>{
              setNewT({
                toUid:tr.toUid,
                offeredPlayers:tr.offeredPlayers||[],
                requestedPlayers:tr.requestedPlayers||[],
                offeredMoney:tr.offeredMoney||0,
                requestedMoney:tr.requestedMoney||0,
                note:tr.note||"",
                editingId:tr.id,
              });
              setStep(2);
              setTab("new");
            }} style={{flex:1,padding:"6px",borderRadius:7,background:C.inputBg,color:C.textMid,border:`1px solid ${C.borderDark}`,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              ✏️ Editar
            </button>
            <button onClick={async()=>{
              if(!window.confirm("¿Eliminar esta oferta?")) return;
              await updateDoc(doc(db,"transfers",tr.id),{status:"rejected",rejectedAt:serverTimestamp(),rejectedBy:"sender"});
            }} style={{flex:1,padding:"6px",borderRadius:7,background:"#fff5f5",color:"#e74c3c",border:"1px solid #ffcccc",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              🗑️ Eliminar
            </button>
          </div>
        )}
        {tr.toUid===user.uid&&tr.status==="pending_acceptance"&&(
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>accept(tr)} style={{flex:1,padding:"6px",borderRadius:7,background:"#27ae60",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✓ Aceptar</button>
            <button onClick={()=>reject(tr)} style={{flex:1,padding:"6px",borderRadius:7,background:"#e74c3c",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Rechazar</button>
          </div>
        )}
        {mode==="admin"&&tr.status==="pending_admin"&&(
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>adminApprove(tr)} style={{flex:1,padding:"6px",borderRadius:7,background:"#1a3a5c",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✓ Aprobar y ejecutar</button>
            <button onClick={()=>adminReject(tr)} style={{flex:1,padding:"6px",borderRadius:7,background:"#e74c3c",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Rechazar</button>
          </div>
        )}
      </div>
    );
  };

  // picker for players
  const PickerModal=({mode,onClose})=>{
    const src=mode==="offered"?mySquad:toSquad;
    const selected=mode==="offered"?newT.offeredPlayers:newT.requestedPlayers;
    const filtered=playerSearch?src.filter(p=>(p.name||"").toLowerCase().includes(playerSearch.toLowerCase())):src;
    const toggle=p=>{
      const key=mode==="offered"?"offeredPlayers":"requestedPlayers";
      const cur=newT[key];
      if(cur.find(x=>x.name===p.name)) setNewT(n=>({...n,[key]:cur.filter(x=>x.name!==p.name)}));
      else setNewT(n=>({...n,[key]:[...cur,p]}));
    };
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:3100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
        <div style={{background:C.card,borderRadius:14,width:"90%",maxWidth:360,maxHeight:"70vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:"10px 14px",background:"#1a3a5c",display:"flex",alignItems:"center"}}>
            <span style={{color:"#fff",fontWeight:800,fontSize:13,fontFamily:"'DM Sans',sans-serif",flex:1}}>{mode==="offered"?"Jugadores que ofrecés":"Jugadores que pedís"}</span>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#fff",fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <div style={{padding:"8px 12px",borderBottom:`1px solid ${C.border}`}}>
            <input value={playerSearch} onChange={e=>setPlayerSearch(e.target.value)} placeholder="Buscar…" style={{width:"100%",padding:"5px 9px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"}}/>
          </div>
          <div style={{overflowY:"auto",padding:"8px 10px",display:"flex",flexDirection:"column",gap:4}}>
            {filtered.map((p,i)=>{const sel=selected.find(x=>x.name===p.name);return(
              <div key={i} onClick={()=>toggle(p)} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:sel?"#ebf5fb":C.inputBg,border:`1px solid ${sel?"#2980b9":C.border}`,cursor:"pointer"}}>
                <span style={{fontSize:9,fontWeight:700,color:"#2980b9",background:"#ebf5fb",padding:"2px 5px",borderRadius:4,fontFamily:"monospace",minWidth:24,textAlign:"center"}}>{p.pos||p.primaryPos||"?"}</span>
                <span style={{flex:1,fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{p.name}</span>
                {p.overall&&<span style={{fontSize:11,fontWeight:800,color:"#2980b9",fontFamily:"monospace"}}>{p.overall}</span>}
                {sel&&<span style={{fontSize:12,color:"#2980b9"}}>✓</span>}
              </div>
            );})}
            {filtered.length===0&&<div style={{color:C.textFaint,fontSize:11,textAlign:"center",padding:12,fontFamily:"'DM Sans',sans-serif"}}>Sin jugadores</div>}
          </div>
          <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`}}>
            <button onClick={onClose} style={{width:"100%",padding:"7px",borderRadius:8,background:"#1a3a5c",color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Confirmar selección</button>
          </div>
        </div>
      </div>
    );
  };

  const tabBtn=(id,label,cnt)=>(
    <button onClick={()=>setTab(id)} style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${tab===id?"#1a3a5c":C.borderDark}`,background:tab===id?"#1a3a5c":C.inputBg,color:tab===id?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",position:"relative"}}>
      {label}{cnt>0&&<span style={{position:"absolute",top:-5,right:-5,background:"#e74c3c",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>{cnt}</span>}
    </button>
  );

  const InnerContent=(
    <>
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>
        {tabBtn("inbox","📥 Recibidas",inbox.length)}
        {tabBtn("outbox","📤 Enviadas",0)}
        {tabBtn("new","➕ Nueva",0)}
        {tabBtn("historial","📋 Historial",0)}
        {isAdmin&&tabBtn("admin","🔐 Admin",adminQueue.length)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>

          {/* INBOX */}
          {tab==="inbox"&&(
            inbox.length===0
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:"24px 0",fontFamily:"'DM Sans',sans-serif"}}>No tenés transferencias pendientes</div>
              :inbox.map(tr=><TCard key={tr.id} tr={tr} mode="inbox"/>)
          )}

          {/* OUTBOX */}
          {tab==="outbox"&&(
            outbox.length===0
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:"24px 0",fontFamily:"'DM Sans',sans-serif"}}>No tenés propuestas enviadas</div>
              :outbox.map(tr=><TCard key={tr.id} tr={tr} mode="outbox"/>)
          )}

          {/* HISTORIAL */}
          {tab==="historial"&&(
            historial.length===0
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:"24px 0",fontFamily:"'DM Sans',sans-serif"}}>Sin historial aún</div>
              :historial.map(tr=>{
                const esEmisor=tr.fromUid===user.uid;
                const sc=statusColor[tr.status]||"#888";
                const sl=statusLabel[tr.status]||tr.status;
                return(
                  <div key={tr.id} style={{background:C.inputBg,border:`1px solid ${sc}44`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                    {/* Header: status + fecha */}
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                      <span style={{fontSize:10,fontWeight:800,color:sc,fontFamily:"'DM Sans',sans-serif",background:sc+"18",padding:"2px 8px",borderRadius:20}}>{sl}</span>
                      <span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginLeft:"auto"}}>{tr.createdAt?.toDate?.()?.toLocaleDateString("es-GT")||""}</span>
                    </div>
                    {/* Equipos */}
                    <div style={{fontSize:12,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif",marginBottom:5}}>
                      {tr.fromName} <span style={{color:C.textFaint,fontWeight:400}}>→</span> {tr.toName}
                    </div>
                    {/* Lo que ofrece from */}
                    {(tr.offeredPlayers?.length>0||tr.offeredMoney>0)&&(
                      <div style={{fontSize:10,color:C.textMid,fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>
                        <span style={{color:C.textFaint}}>Ofrece: </span>
                        {tr.offeredPlayers?.map(p=>p.name).join(", ")}
                        {tr.offeredMoney>0&&<span style={{color:"#27ae60",fontWeight:700}}>{tr.offeredPlayers?.length>0?" + ":""}{(tr.offeredMoney/1000000).toLocaleString()}M</span>}
                      </div>
                    )}
                    {/* Lo que pide from */}
                    {(tr.requestedPlayers?.length>0||tr.requestedMoney>0)&&(
                      <div style={{fontSize:10,color:C.textMid,fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>
                        <span style={{color:C.textFaint}}>A cambio: </span>
                        {tr.requestedPlayers?.map(p=>p.name).join(", ")}
                        {tr.requestedMoney>0&&<span style={{color:"#e74c3c",fontWeight:700}}>{tr.requestedPlayers?.length>0?" + ":""}{(tr.requestedMoney/1000000).toLocaleString()}M</span>}
                      </div>
                    )}
                    {tr.note&&<div style={{fontSize:10,color:C.textFaint,fontStyle:"italic",marginTop:3,fontFamily:"'DM Sans',sans-serif"}}>"{tr.note}"</div>}
                    {/* Estado detallado */}
                    <div style={{marginTop:5,display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",background:C.card,padding:"2px 6px",borderRadius:6}}>
                        {tr.status==="pending_acceptance"?"⏳ Esperando que acepte "+tr.toName:
                         tr.status==="pending_admin"?"✅ "+tr.toName+" aceptó · 🔐 Esperando admin":
                         tr.status==="completed"||tr.status==="approved"?"✅ Admin aprobó":
                         tr.status==="rejected"?`❌ Rechazada${tr.rejectedBy==="admin"?" por admin":" por "+tr.toName}`:""}
                      </span>
                    </div>
                  </div>
                );
              })
          )}

          {/* ADMIN */}
          {tab==="admin"&&isAdmin&&(
            adminQueue.length===0
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:"24px 0",fontFamily:"'DM Sans',sans-serif"}}>No hay transferencias para aprobar</div>
              :adminQueue.map(tr=><TCard key={tr.id} tr={tr} mode="admin"/>)
          )}

          {/* NEW TRANSFER */}
          {tab==="new"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Step 1 — elegir equipo destino */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>1. Equipo destinatario</div>
                <select value={newT.toUid} onChange={e=>setNewT(n=>({...n,toUid:e.target.value,requestedPlayers:[],offeredPlayers:[]}))}
                  style={{width:"100%",padding:"8px 10px",borderRadius:9,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
                  <option value="">— Seleccionar equipo —</option>
                  {allTeams.filter(t=>(t.uid||t.id)!==user.uid).sort((a,b)=>(a.teamName||"").localeCompare(b.teamName||"")).map(t=>(
                    <option key={t.uid||t.id} value={t.uid||t.id}>{t.teamName}</option>
                  ))}
                </select>
              </div>

              {newT.toUid&&(<>
                {/* Step 2 — jugadores ofrecidos */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>2. Lo que ofrecés</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                    {newT.offeredPlayers.map(p=>(
                      <span key={p.name} style={{padding:"3px 8px",borderRadius:20,background:"#ebf5fb",border:"1px solid #2980b9",color:"#2980b9",fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                        {p.name}<button onClick={()=>setNewT(n=>({...n,offeredPlayers:n.offeredPlayers.filter(x=>x.name!==p.name)}))} style={{background:"none",border:"none",color:"#2980b9",cursor:"pointer",fontSize:12,padding:0}}>×</button>
                      </span>
                    ))}
                    <button onClick={()=>{setPickerMode("offered");setPlayerSearch("");}} style={{padding:"3px 10px",borderRadius:20,border:"1px dashed #2980b9",background:"transparent",color:"#2980b9",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Jugador</button>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>+ Dinero:</span>
                    <input type="number" min={0} value={newT.offeredMoney>0?(newT.offeredMoney/1000000):""} onChange={e=>{const v=parseFloat(e.target.value);setNewT(n=>({...n,offeredMoney:isNaN(v)?0:v*1000000}));}}
                      placeholder="0" style={{width:80,padding:"5px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
                    <span style={{fontSize:10,color:C.textFaint,fontFamily:"monospace"}}>M</span>
                    <span style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Presupuesto: {teamData?.presupuesto||"—"}</span>
                  </div>
                </div>

                {/* Step 3 — lo que pedís */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>3. Lo que pedís a cambio</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                    {newT.requestedPlayers.map(p=>(
                      <span key={p.name} style={{padding:"3px 8px",borderRadius:20,background:"#fdf2e9",border:"1px solid #e67e22",color:"#e67e22",fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                        {p.name}<button onClick={()=>setNewT(n=>({...n,requestedPlayers:n.requestedPlayers.filter(x=>x.name!==p.name)}))} style={{background:"none",border:"none",color:"#e67e22",cursor:"pointer",fontSize:12,padding:0}}>×</button>
                      </span>
                    ))}
                    <button onClick={()=>{setPickerMode("requested");setPlayerSearch("");}} style={{padding:"3px 10px",borderRadius:20,border:"1px dashed #e67e22",background:"transparent",color:"#e67e22",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Jugador</button>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>+ Dinero:</span>
                    <input type="number" min={0} value={newT.requestedMoney>0?(newT.requestedMoney/1000000):""} onChange={e=>{const v=parseFloat(e.target.value);setNewT(n=>({...n,requestedMoney:isNaN(v)?0:v*1000000}));}}
                      placeholder="0" style={{width:80,padding:"5px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
                    <span style={{fontSize:10,color:C.textFaint,fontFamily:"monospace"}}>M</span>
                  </div>
                </div>

                {/* Nota */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>4. Nota (opcional)</div>
                  <input value={newT.note} onChange={e=>setNewT(n=>({...n,note:e.target.value}))} placeholder="Ej: Oferta válida hasta el viernes…"
                    style={{width:"100%",padding:"7px 10px",borderRadius:9,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}}/>
                </div>

                {/* Resumen */}
                <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Resumen de la propuesta</div>
                  <div style={{fontSize:11,color:C.text,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>
                    <strong>{teamData?.teamName}</strong> ofrece{newT.offeredPlayers.length>0?` a ${newT.offeredPlayers.map(p=>p.name).join(", ")}`:""}
                    {newT.offeredMoney>0?` + ${(newT.offeredMoney/1000000).toLocaleString()}M`:" (solo dinero o sin oferta)"} a cambio de{newT.requestedPlayers.length>0?` ${newT.requestedPlayers.map(p=>p.name).join(", ")}`:""}
                    {newT.requestedMoney>0?` + ${(Number(newT.requestedMoney)/1000000).toLocaleString()}M`:""} de <strong>{toTeam?.teamName}</strong>.
                  </div>
                </div>

                <button onClick={sendTransfer} disabled={sending||(!newT.offeredPlayers.length&&!newT.offeredMoney&&!newT.requestedPlayers.length&&!newT.requestedMoney)}
                  style={{width:"100%",padding:"10px",borderRadius:10,background:"#1a3a5c",color:"#fff",border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,opacity:sending?0.6:1}}>
                  {sending?"Enviando…":newT.editingId?"✏️ Actualizar oferta":"📤 Enviar propuesta"}
                </button>
              </>)}
            </div>
          )}
        </div>
      </>
  );

  if(embedded) return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      {InnerContent}
      {pickerMode&&<PickerModal mode={pickerMode} onClose={()=>setPickerMode(null)}/>}
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:2000,display:"flex",alignItems:"stretch",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.card,width:"100%",maxWidth:520,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 0 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"12px 16px",background:"#1a3a5c",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>🔄 MERCADO DE TRANSFERENCIAS</span>
          <button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {InnerContent}
        {pickerMode&&<PickerModal mode={pickerMode} onClose={()=>setPickerMode(null)}/>}
      </div>
    </div>
  );
}

// ─── AVISO BANNER ─────────────────────────────────────────────────────────────
// ─── MERCADO UNIFICADO ────────────────────────────────────────────────────────
function MercadoUnificado({onClose,user,isAdmin,teamData,saveTeam,allTeams,pool}){
  const[tab,setTab]=useState("fichajes"); // fichajes | ofertas | admin
  const[slotTeam,setSlotTeam]=useState(null);
  const[slotAltas,setSlotAltas]=useState("");
  const[slotBajas,setSlotBajas]=useState("");
  const[savingSlots,setSavingSlots]=useState(false);
  const[clearing,setClearing]=useState(false);

  const saveSlots=async()=>{
    if(!slotTeam) return;
    setSavingSlots(true);
    await updateDoc(doc(db,"teams",slotTeam.uid||slotTeam.id),{
      mercadoSlots:{altas:Number(slotAltas)||0,bajas:Number(slotBajas)||0}
    });
    setSavingSlots(false);
    setSlotTeam(null);
  };

  const clearMercado=async()=>{
    if(!window.confirm("¿Limpiar todo el mercado? Esto borra slots y ofertas pendientes.")) return;
    setClearing(true);
    // Limpiar slots de todos los equipos
    await Promise.all(allTeams.map(t=>updateDoc(doc(db,"teams",t.uid||t.id),{mercadoSlots:{altas:0,bajas:0},mercado:{bajas:Array(6).fill({name:"",price:"",team:""}),altas:Array(6).fill({name:"",price:"",team:""}),finalizado:false}})));
    setClearing(false);
  };

  const TABS=[
    {id:"fichajes",label:"🏷️ Fichajes"},
    {id:"ofertas",label:"🔄 Ofertas"},
    ...(isAdmin?[{id:"admin",label:"⚙️ Admin"}]:[]),
  ];

  return(
    <div style={{position:"fixed",inset:0,zIndex:500,background:C.bg,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"12px 16px",background:C.card,borderBottom:`2px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.textMid,fontSize:20,cursor:"pointer",padding:"0 4px"}}>←</button>
        <span style={{fontSize:16,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,flex:1}}>MERCADO</span>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.card,flexShrink:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"10px 4px",border:"none",background:"none",color:tab===t.id?C.accent:C.textFaint,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",borderBottom:`2px solid ${tab===t.id?C.accent:"transparent"}`,transition:"all 0.15s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto"}}>
        {tab==="fichajes"&&<MercadoModal onClose={onClose} teamData={teamData} saveTeam={saveTeam} allTeams={allTeams} embedded/>}
        {tab==="ofertas"&&<TransferCenter onClose={onClose} user={user} isAdmin={isAdmin} teamData={teamData} allTeams={allTeams} pool={pool} embedded/>}
        {tab==="admin"&&isAdmin&&(
          <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.8}}>Asignar slots por equipo</div>
            {allTeams.map(t=>{
              const slots=t.mercadoSlots||{altas:0,bajas:0};
              const isEditing=slotTeam&&(slotTeam.uid||slotTeam.id)===(t.uid||t.id);
              return(
                <div key={t.uid||t.id} style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:getTeamColor(t.teamColor||"blue").bg,flexShrink:0}}/>
                    <span style={{flex:1,fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{t.teamName}</span>
                    <span style={{fontSize:10,color:"#27ae60",fontFamily:"'DM Sans',sans-serif"}}>↑{slots.altas}</span>
                    <span style={{fontSize:10,color:"#e74c3c",fontFamily:"'DM Sans',sans-serif"}}>↓{slots.bajas}</span>
                    <button onClick={()=>{setSlotTeam(t);setSlotAltas(String(slots.altas));setSlotBajas(String(slots.bajas));}}
                      style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:"none",color:C.textMid,fontSize:10,cursor:"pointer"}}>✏️</button>
                  </div>
                  {isEditing&&(
                    <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                        <span style={{fontSize:10,color:"#27ae60",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>↑ Altas</span>
                        <input type="number" min="0" max="20" value={slotAltas} onChange={e=>setSlotAltas(e.target.value)}
                          style={{width:48,padding:"4px 6px",borderRadius:6,border:`1px solid #27ae60`,background:C.inputBg,color:C.text,fontSize:12,textAlign:"center"}}/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                        <span style={{fontSize:10,color:"#e74c3c",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>↓ Bajas</span>
                        <input type="number" min="0" max="20" value={slotBajas} onChange={e=>setSlotBajas(e.target.value)}
                          style={{width:48,padding:"4px 6px",borderRadius:6,border:`1px solid #e74c3c`,background:C.inputBg,color:C.text,fontSize:12,textAlign:"center"}}/>
                      </div>
                      <button onClick={saveSlots} disabled={savingSlots}
                        style={{padding:"5px 10px",borderRadius:7,background:C.accent,color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                        {savingSlots?"…":"✓"}
                      </button>
                      <button onClick={()=>setSlotTeam(null)}
                        style={{padding:"5px 8px",borderRadius:7,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer"}}>✕</button>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Gestión de ventana</div>
              <button onClick={clearMercado} disabled={clearing}
                style={{width:"100%",padding:"12px",borderRadius:10,background:"#fff5f5",border:"1px solid #ffcccc",color:"#c0392b",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                {clearing?"Limpiando…":"🗑️ Limpiar mercado para nueva ventana"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownTimer({endsAt}){
  const[remaining,setRemaining]=useState(Math.max(0,endsAt-Date.now()));
  useEffect(()=>{
    const id=setInterval(()=>setRemaining(Math.max(0,endsAt-Date.now())),1000);
    return()=>clearInterval(id);
  },[endsAt]);
  const totalSec=Math.floor(remaining/1000);
  const h=Math.floor(totalSec/3600);
  const m=Math.floor((totalSec%3600)/60);
  const s=totalSec%60;
  const str=remaining<=0?"¡Ya comenzó!":h>0?`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return <span style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:"monospace",background:"rgba(0,0,0,0.2)",padding:"2px 8px",borderRadius:7,flexShrink:0}}>{str}</span>;
}

function AvisoBanner({onOpen}){
  const[aviso,setAviso]=useState(null);
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"mundial","data"),snap=>{
      if(snap.exists()) setAviso(snap.data()?.aviso||null);
    });
    return unsub;
  },[]);
  if(!aviso?.activo) return null;
  return(
    <div onClick={onOpen} style={{position:"fixed",bottom:0,left:0,right:0,zIndex:1000,background:"#e74c3c",padding:"10px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",boxShadow:"0 -4px 20px rgba(231,76,60,0.4)"}}>
      <span style={{fontSize:14}}>🔴</span>
      <span style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'DM Sans',sans-serif",flex:1}}>{aviso.texto}</span>
      {aviso.endsAt&&<CountdownTimer endsAt={aviso.endsAt}/>}
      <span style={{fontSize:10,color:"rgba(255,255,255,0.85)",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Ver →</span>
    </div>
  );
}

const GRUPOS_FIJOS=["A","B","C","D","E","F","G","H"];
const JORNADAS=["1ra Jornada","2da Jornada","3ra Jornada"];
const FIXTURE_JORNADA=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]];

function GruposSetup({grupos,saveM,setAiMsg}){
  const gruposMap=Object.fromEntries(GRUPOS_FIJOS.map(g=>{
    const found=grupos.find(gr=>gr.nombre===`GRUPO ${g}`);
    return [g,found?.selecciones||["","","",""]];
  }));
  const[local,setLocal]=useState(gruposMap);
  const[saving,setSaving]=useState(null);
  const saveGrupo=async(letra)=>{
    setSaving(letra);
    const sels=local[letra].map(s=>s.trim().toUpperCase()).filter(Boolean);
    if(sels.length!==4){setAiMsg("❌ Necesitas 4 selecciones");setSaving(null);return;}
    const nombre=`GRUPO ${letra}`;
    const existing=grupos.filter(g=>g.nombre!==nombre);
    const found=grupos.find(g=>g.nombre===nombre);
    const tabla=found?.tabla||sels.map(s=>({sel:s,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0}));
    const newTabla=sels.map((s,i)=>({...(tabla[i]||{pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0}),sel:s}));
    await saveM({grupos:[...existing,{nombre,selecciones:sels,tabla:newTabla}]});
    setAiMsg(`✅ Grupo ${letra} guardado`);setSaving(null);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {GRUPOS_FIJOS.map(letra=>{
        const guardado=grupos.some(g=>g.nombre===`GRUPO ${letra}`&&(g.selecciones||[]).length===4);
        return(<div key={letra} style={{background:C.card,borderRadius:9,padding:"10px 12px",border:`1.5px solid ${guardado?"#7c3aed":C.border}`}}>
          <div style={{fontSize:10,fontWeight:800,color:"#7c3aed",fontFamily:"'DM Sans',sans-serif",marginBottom:6,display:"flex",justifyContent:"space-between"}}>
            <span>GRUPO {letra}</span>
            {guardado&&<span style={{fontSize:9,color:"#27ae60"}}>✓ Guardado</span>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {[0,1,2,3].map(i=>(
              <input key={i} value={local[letra][i]||""} onChange={e=>{const n={...local};n[letra]=[...n[letra]];n[letra][i]=e.target.value;setLocal(n);}}
                placeholder={`Selección ${i+1}`}
                style={{padding:"5px 9px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
            ))}
            <button onClick={()=>saveGrupo(letra)} disabled={saving===letra||local[letra].some(s=>!s.trim())}
              style={{padding:"6px",borderRadius:7,background:"#7c3aed",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:saving===letra||local[letra].some(s=>!s.trim())?0.5:1}}>
              {saving===letra?"Guardando…":"Guardar Grupo "+letra}
            </button>
          </div>
        </div>);
      })}
    </div>
  );
}

function FixtureSetup({grupos,mundial,saveM,setAiMsg}){
  // fixture structure: {grupoA: {j1:[{local,visitante},{local,visitante}], j2:..., j3:...}, ...}
  const fixtureBase=mundial?.fixture||{};
  const[fixture,setFixture]=useState(fixtureBase);
  const[saving,setSaving]=useState(false);

  const gruposConSels=GRUPOS_FIJOS.filter(g=>grupos.some(gr=>gr.nombre===`GRUPO ${g}`&&(gr.selecciones||[]).length===4));

  const getSels=g=>grupos.find(gr=>gr.nombre===`GRUPO ${g}`)?.selecciones||[];

  const setPartido=(grupo,jornada,partidoIdx,side,val)=>{
    setFixture(prev=>{
      const f={...prev};
      if(!f[grupo]) f[grupo]={};
      if(!f[grupo][jornada]) f[grupo][jornada]=[{local:"",visitante:""},{local:"",visitante:""}];
      const partidos=[...f[grupo][jornada]];
      partidos[partidoIdx]={...partidos[partidoIdx],[side]:val};
      f[grupo]={...f[grupo],[jornada]:partidos};
      return f;
    });
  };

  const saveFixture=async()=>{
    setSaving(true);
    await saveM({fixture});
    setAiMsg("✅ Fixture guardado");
    setSaving(false);
  };

  if(gruposConSels.length===0) return(
    <div style={{color:C.textFaint,fontSize:11,fontFamily:"'DM Sans',sans-serif",textAlign:"center",padding:8}}>Primero configura los grupos con sus selecciones</div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {gruposConSels.map(letra=>{
        const sels=getSels(letra);
        return(
          <div key={letra} style={{background:C.card,borderRadius:9,border:`1px solid ${C.border}`,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:800,color:"#e67e22",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>GRUPO {letra}</div>
            {JORNADAS.map(j=>{
              const jKey=j.replace(/ /g,"_");
              const p0=fixture[letra]?.[jKey]?.[0]||{local:"",visitante:""};
              const p1=fixture[letra]?.[jKey]?.[1]||{local:"",visitante:""};
              return(
                <div key={j} style={{marginBottom:8}}>
                  <div style={{fontSize:9,fontWeight:700,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginBottom:4,textTransform:"uppercase"}}>{j}</div>
                  {[{p:p0,i:0},{p:p1,i:1}].map(({p,i})=>(
                    <div key={i} style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:9,color:C.textFaint,fontFamily:"monospace",width:10,flexShrink:0}}>{i+1}.</span>
                      <select value={p.local} onChange={e=>setPartido(letra,jKey,i,"local",e.target.value)}
                        style={{flex:1,padding:"5px 6px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:p.local?C.text:C.textFaint,fontSize:10,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
                        <option value="">Local</option>
                        {sels.filter(s=>s!==p.visitante).map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                      <span style={{fontSize:9,color:C.textFaint,flexShrink:0}}>vs</span>
                      <select value={p.visitante} onChange={e=>setPartido(letra,jKey,i,"visitante",e.target.value)}
                        style={{flex:1,padding:"5px 6px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:p.visitante?C.text:C.textFaint,fontSize:10,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
                        <option value="">Visitante</option>
                        {sels.filter(s=>s!==p.local).map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
      <button onClick={saveFixture} disabled={saving}
        style={{padding:"10px",borderRadius:9,background:"#e67e22",color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:saving?0.6:1}}>
        {saving?"Guardando…":"💾 Guardar Fixture Completo"}
      </button>
    </div>
  );
}

function ManualResultadoForm({grupos,allSelPlayers,fuzzyMatch,mundial,saveM,setAiMsg}){
  const[jornada,setJornada]=useState("");
  const[grupoLetra,setGrupoLetra]=useState("");
  const[localNombre,setLocalNombre]=useState("");
  const[visitanteNombre,setVisitanteNombre]=useState("");
  const[golesLocal,setGolesLocal]=useState("");
  const[golesVisitante,setGolesVisitante]=useState("");
  const[goleadores,setGoleadores]=useState([{nombre:"",equipo:"",goles:1}]);
  const[asistencias,setAsistencias]=useState([{nombre:"",equipo:"",asistencias:1}]);
  const[saving,setSaving]=useState(false);
  const[editingMatchIdx,setEditingMatchIdx]=useState(null); // índice en mundial.partidos del partido que se está editando
  const grupoData=grupos.find(g=>g.nombre===`GRUPO ${grupoLetra}`);
  const sels=grupoData?.selecciones||[];

  // Get saved fixture for this grupo+jornada
  const jKey=jornada.replace(/ /g,"_");
  const fixturePartidos=mundial?.fixture?.[grupoLetra]?.[jKey]||[];
  const hasFixture=fixturePartidos.length>0&&fixturePartidos.some(p=>p.local&&p.visitante);

  // Busca si un partido del fixture ya tiene resultado guardado
  const findSavedMatch=(localN,visN)=>{
    const pts=mundial?.partidos||[];
    for(let i=pts.length-1;i>=0;i--){
      const p=pts[i];
      if(p.jornada===jornada&&p.grupo===`GRUPO ${grupoLetra}`&&p.local?.nombre===localN&&p.visitante?.nombre===visN) return{idx:i,partido:p};
    }
    return null;
  };

  const cargarPartido=(localN,visN)=>{
    setLocalNombre(localN);setVisitanteNombre(visN);
    const found=findSavedMatch(localN,visN);
    if(found){
      setEditingMatchIdx(found.idx);
      setGolesLocal(String(found.partido.local?.goles??""));
      setGolesVisitante(String(found.partido.visitante?.goles??""));
      setGoleadores(found.partido.goleadores?.length?found.partido.goleadores.map(g=>({...g})):[{nombre:"",equipo:"",goles:1}]);
      setAsistencias(found.partido.asistencias?.length?found.partido.asistencias.map(a=>({...a})):[{nombre:"",equipo:"",asistencias:1}]);
    }else{
      setEditingMatchIdx(null);
      setGolesLocal("");setGolesVisitante("");
      setGoleadores([{nombre:"",equipo:"",goles:1}]);setAsistencias([{nombre:"",equipo:"",asistencias:1}]);
    }
  };

  const save=async()=>{
    if(!localNombre||!visitanteNombre||golesLocal===""||golesVisitante==="") return;
    setSaving(true);
    const existing=mundial||{};
    const stats={...(existing.stats||{})};
    const pts=[...(existing.partidos||[])];
    let gs=[...(existing.grupos||[])];
    const gl=Number(golesLocal),gv=Number(golesVisitante);

    const mergePlayer=(arr,field,sign)=>{arr.filter(p=>p.nombre.trim()).forEach(p=>{
      const matched=fuzzyMatch(p.nombre,allSelPlayers);
      const key=matched?`${matched.selId}_${matched.name}`:p.nombre;
      if(!stats[key]) stats[key]={name:matched?.name||p.nombre,selName:matched?.selName||p.equipo,goles:0,asistencias:0,ratings:[],partidos:0};
      const cantidad=(field==="goles"?Number(p.goles):Number(p.asistencias))||1;
      stats[key][field]+=sign*cantidad;
      if(stats[key][field]<0) stats[key][field]=0;
    });};

    const updTabla=(sel,gf,gc,sign)=>{
      gs=gs.map(g=>{
        if(g.nombre!==`GRUPO ${grupoLetra}`) return g;
        const tabla=[...(g.tabla||sels.map(s=>({sel:s,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0})))];
        const idx=tabla.findIndex(r=>r.sel===sel);if(idx===-1)return g;
        const row={...tabla[idx]};
        row.pj+=sign*1;row.gf+=sign*gf;row.gc+=sign*gc;
        row.pg+=sign*(gf>gc?1:0);row.pe+=sign*(gf===gc?1:0);row.pp+=sign*(gf<gc?1:0);
        row.pts+=sign*(gf>gc?3:gf===gc?1:0);
        tabla[idx]=row;
        return{...g,tabla};
      });
    };

    if(editingMatchIdx!==null){
      // Revertir contribución del partido anterior
      const old=pts[editingMatchIdx];
      mergePlayer(old.goleadores||[],"goles",-1);
      mergePlayer(old.asistencias||[],"asistencias",-1);
      updTabla(old.local?.nombre,old.local?.goles||0,old.visitante?.goles||0,-1);
      updTabla(old.visitante?.nombre,old.visitante?.goles||0,old.local?.goles||0,-1);
      pts[editingMatchIdx]={local:{nombre:localNombre,goles:gl},visitante:{nombre:visitanteNombre,goles:gv},jornada,grupo:`GRUPO ${grupoLetra}`,fecha:old.fecha||new Date().toISOString(),goleadores,asistencias};
    }else{
      pts.push({local:{nombre:localNombre,goles:gl},visitante:{nombre:visitanteNombre,goles:gv},jornada,grupo:`GRUPO ${grupoLetra}`,fecha:new Date().toISOString(),goleadores,asistencias});
    }

    // Aplicar contribución nueva
    mergePlayer(goleadores,"goles",1);
    mergePlayer(asistencias,"asistencias",1);
    updTabla(localNombre,gl,gv,1);
    updTabla(visitanteNombre,gv,gl,1);

    await saveM({grupos:gs,partidos:pts,stats});
    setAiMsg(`✅ ${localNombre} ${gl} - ${gv} ${visitanteNombre}`);
    setGolesLocal("");setGolesVisitante("");setLocalNombre("");setVisitanteNombre("");setGoleadores([{nombre:"",equipo:"",goles:1}]);setAsistencias([{nombre:"",equipo:"",asistencias:1}]);setEditingMatchIdx(null);
    setSaving(false);
  };
  const inp=(val,onChange,placeholder)=>(<input value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{flex:1,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",gap:6}}>
        <select value={jornada} onChange={e=>{setJornada(e.target.value);setLocalNombre("");setVisitanteNombre("");setEditingMatchIdx(null);}} style={{flex:1,padding:"7px 8px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.card,color:jornada?C.text:C.textFaint,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
          <option value="">Jornada</option>
          {JORNADAS.map(j=><option key={j} value={j}>{j}</option>)}
        </select>
        <select value={grupoLetra} onChange={e=>{setGrupoLetra(e.target.value);setLocalNombre("");setVisitanteNombre("");setEditingMatchIdx(null);}} style={{flex:1,padding:"7px 8px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.card,color:grupoLetra?C.text:C.textFaint,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
          <option value="">Grupo</option>
          {GRUPOS_FIJOS.filter(g=>grupos.some(gr=>gr.nombre===`GRUPO ${g}`&&(gr.selecciones||[]).length===4)).map(g=><option key={g} value={g}>Grupo {g}</option>)}
        </select>
      </div>
      {jornada&&grupoLetra&&sels.length===4&&(
        hasFixture?(
          // Show saved fixture matchups as buttons
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>Elige el partido:</div>
            {fixturePartidos.filter(p=>p.local&&p.visitante).map((p,i)=>{
              const saved=findSavedMatch(p.local,p.visitante);
              const isActive=localNombre===p.local&&visitanteNombre===p.visitante;
              return(
                <button key={i} onClick={()=>cargarPartido(p.local,p.visitante)}
                  style={{padding:"8px 10px",borderRadius:8,border:`1.5px solid ${isActive?"#1a3a5c":C.borderDark}`,background:isActive?"#1a3a5c":C.card,color:isActive?"#fff":C.text,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                  <span style={{flex:1}}>{p.local} vs {p.visitante}</span>
                  {saved?(
                    <span style={{display:"flex",alignItems:"center",gap:5,fontSize:10}}>
                      <span style={{fontFamily:"monospace",fontWeight:800,color:isActive?"#fff":"#27ae60"}}>✅ {saved.partido.local?.goles}-{saved.partido.visitante?.goles}</span>
                      <span style={{fontSize:9,opacity:0.85}}>✏️ Editar</span>
                    </span>
                  ):(
                    <span style={{fontSize:9,color:isActive?"#fff":C.textFaint,opacity:0.8}}>Sin jugar</span>
                  )}
                </button>
              );
            })}
          </div>
        ):(
          // Manual fallback if no fixture configured
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <select value={localNombre} onChange={e=>{setLocalNombre(e.target.value);if(e.target.value===visitanteNombre)setVisitanteNombre("");}}
              style={{flex:1,padding:"7px 8px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.card,color:localNombre?C.text:C.textFaint,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
              <option value="">Local</option>
              {sels.filter(s=>s!==visitanteNombre).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{color:C.textFaint,fontWeight:800,fontSize:12,flexShrink:0}}>vs</span>
            <select value={visitanteNombre} onChange={e=>{setVisitanteNombre(e.target.value);if(e.target.value===localNombre)setLocalNombre("");}}
              style={{flex:1,padding:"7px 8px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.card,color:visitanteNombre?C.text:C.textFaint,fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"}}>
              <option value="">Visitante</option>
              {sels.filter(s=>s!==localNombre).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )
      )}
      {localNombre&&visitanteNombre&&(<>
        {editingMatchIdx!==null&&(
          <div style={{background:"#fff3cd",border:"1px solid #f0ad4e",borderRadius:8,padding:"6px 10px",fontSize:10,fontWeight:700,color:"#856404",fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>
            ✏️ Editando partido ya jugado — al guardar se recalculará la tabla y las estadísticas
          </div>
        )}
        <div style={{background:"#7c3aed11",borderRadius:9,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{flex:1,fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{localNombre}</span>
          <input type="number" min="0" value={golesLocal} onChange={e=>setGolesLocal(e.target.value)} placeholder="0" style={{width:40,padding:"6px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:14,fontFamily:"monospace",outline:"none",textAlign:"center",fontWeight:800}}/>
          <span style={{color:C.textFaint,fontWeight:800}}>-</span>
          <input type="number" min="0" value={golesVisitante} onChange={e=>setGolesVisitante(e.target.value)} placeholder="0" style={{width:40,padding:"6px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:14,fontFamily:"monospace",outline:"none",textAlign:"center",fontWeight:800}}/>
          <span style={{flex:1,fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{visitanteNombre}</span>
        </div>
        <div style={{fontSize:10,fontWeight:700,color:"#27ae60",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase"}}>⚽ Goleadores</div>
        {goleadores.map((g,i)=>(<div key={i} style={{display:"flex",gap:5,alignItems:"center"}}>
          {inp(g.nombre,v=>{const n=[...goleadores];n[i]={...n[i],nombre:v};setGoleadores(n);},"Nombre")}
          <select value={g.equipo} onChange={e=>{const n=[...goleadores];n[i]={...n[i],equipo:e.target.value};setGoleadores(n);}} style={{width:80,padding:"6px 4px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:g.equipo?C.text:C.textFaint,fontSize:9,fontFamily:"'DM Sans',sans-serif",outline:"none"}}><option value="">Equipo</option><option value={localNombre}>{localNombre}</option><option value={visitanteNombre}>{visitanteNombre}</option></select>
          <input type="number" min="1" value={g.goles} onChange={e=>{const n=[...goleadores];n[i]={...n[i],goles:e.target.value};setGoleadores(n);}} style={{width:38,padding:"6px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none",textAlign:"center"}}/>
          {goleadores.length>1&&<button onClick={()=>setGoleadores(goleadores.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:14,padding:0}}>×</button>}
        </div>))}
        <button onClick={()=>setGoleadores([...goleadores,{nombre:"",equipo:"",goles:1}])} style={{padding:"4px",borderRadius:7,border:`1px dashed #27ae60`,background:"transparent",color:"#27ae60",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Goleador</button>
        <div style={{fontSize:10,fontWeight:700,color:"#2980b9",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase"}}>🎯 Asistencias</div>
        {asistencias.map((a,i)=>(<div key={i} style={{display:"flex",gap:5,alignItems:"center"}}>
          {inp(a.nombre,v=>{const n=[...asistencias];n[i]={...n[i],nombre:v};setAsistencias(n);},"Nombre")}
          <select value={a.equipo} onChange={e=>{const n=[...asistencias];n[i]={...n[i],equipo:e.target.value};setAsistencias(n);}} style={{width:80,padding:"6px 4px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:a.equipo?C.text:C.textFaint,fontSize:9,fontFamily:"'DM Sans',sans-serif",outline:"none"}}><option value="">Equipo</option><option value={localNombre}>{localNombre}</option><option value={visitanteNombre}>{visitanteNombre}</option></select>
          <input type="number" min="1" value={a.asistencias} onChange={e=>{const n=[...asistencias];n[i]={...n[i],asistencias:e.target.value};setAsistencias(n);}} style={{width:38,padding:"6px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:11,fontFamily:"monospace",outline:"none",textAlign:"center"}}/>
          {asistencias.length>1&&<button onClick={()=>setAsistencias(asistencias.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:14,padding:0}}>×</button>}
        </div>))}

        <button onClick={save} disabled={saving||golesLocal===""||golesVisitante===""} style={{padding:"10px",borderRadius:9,background:"#1a3a5c",color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:saving?0.6:1}}>
          {saving?"Guardando…":editingMatchIdx!==null?"✏️ Actualizar Resultado":"✅ Guardar Resultado"}
        </button>
      </>)}
    </div>
  );
}

// ─── MUNDIAL ──────────────────────────────────────────────────────────────────
function MundialModal({onClose,user,isAdmin,allSels,pool,teamData,initialTab="misel"}){
  const[tab,setTab]=useState(initialTab);
  const[mundial,setMundial]=useState(null);
  const[uploading,setUploading]=useState(false);
  const[uploadType,setUploadType]=useState(null);
  const[aiMsg,setAiMsg]=useState("");
  const fileRef=useRef(null);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"mundial","data"),snap=>{
      if(snap.exists()) setMundial(snap.data());
      else setMundial(null);
    });
    return unsub;
  },[]);

  const saveM=async patch=>{
    await setDoc(doc(db,"mundial","data"),{...(mundial||{}),...patch},{merge:true});
  };

  // fuzzy match player name from OCR to convocatoria
  const fuzzyMatch=(ocrName,squad)=>{
    if(!squad||!ocrName) return null;
    const norm=s=>s.toLowerCase().replace(/[^a-z]/g,"");
    const parts=norm(ocrName).split(" ").filter(Boolean);
    let best=null,bestScore=0;
    squad.forEach(p=>{
      const pn=norm(p.name||"");
      const score=parts.reduce((s,part)=>s+(pn.includes(part)?part.length:0),0);
      if(score>bestScore){bestScore=score;best=p;}
    });
    return bestScore>2?best:null;
  };

  // get all players from all sels
  const allSelPlayers=allSels.reduce((acc,s)=>{
    (s.squad||[]).forEach(p=>acc.push({...p,selId:s.id,selName:s.country}));
    return acc;
  },[]);

  const processImage=async(file,type)=>{
    setUploading(true);
    setAiMsg("Leyendo imagen…");
    try{
      const b64=await new Promise((res,rej)=>{
        const r=new FileReader();
        r.onload=()=>res(r.result.split(",")[1]);
        r.onerror=e=>rej(new Error("FileReader error"));
        r.readAsDataURL(file);
      });
      setAiMsg("Conectando con Gemini…");
      const prompt=type==="grupos"
        ?`Analiza esta captura de FC26 y extrae los grupos del mundial. Responde SOLO con JSON sin markdown: {"grupos":[{"nombre":"Grupo A","selecciones":["NOMBRE1","NOMBRE2","NOMBRE3","NOMBRE4"]}]}`
        :`Analiza esta captura de resultado FC26. Responde SOLO con JSON sin markdown: {"local":{"nombre":"","goles":0},"visitante":{"nombre":"","goles":0},"goleadores":[{"nombre":"","equipo":"","goles":1}],"asistencias":[{"nombre":"","equipo":"","asistencias":1}],"calificaciones":[{"nombre":"","equipo":"","rating":0.0}]}`;
      const GEMINI_KEY="AIzaSyAGlxjD12k38Xu9L-8K165iJma1ZwR7tyY";
      const GEMINI_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
      const body=JSON.stringify({contents:[{parts:[{inline_data:{mime_type:file.type||"image/jpeg",data:b64}},{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:2000}});
      const resp=await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(GEMINI_URL)}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body
      });
      if(!resp.ok) throw new Error("HTTP "+resp.status);
      const data=await resp.json();
      if(data.error) throw new Error(data.error.message);
      const raw=data.candidates?.[0]?.content?.parts?.[0]?.text||"{}";
      setAiMsg("Gemini respondió: "+raw.slice(0,150));
      await new Promise(r=>setTimeout(r,3000));
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      if(type==="grupos"){
        await saveM({grupos:parsed.grupos||[],partidos:[],stats:{}});
        setAiMsg("✅ "+(parsed.grupos?.length||0)+" grupos importados");
      } else {
        const existing=mundial||{};
        const stats={...(existing.stats||{})};
        const partidos=[...(existing.partidos||[])];
        partidos.push({local:parsed.local,visitante:parsed.visitante,fecha:new Date().toISOString()});
        const mergePlayer=(arr,field)=>{
          (arr||[]).forEach(p=>{
            const matched=fuzzyMatch(p.nombre,allSelPlayers);
            const key=matched?`${matched.selId}_${matched.name}`:p.nombre;
            if(!stats[key]) stats[key]={name:matched?.name||p.nombre,selName:matched?.selName||p.equipo,goles:0,asistencias:0,ratings:[],partidos:0};
            if(field==="goles") stats[key].goles+=(p.goles||1);
            if(field==="asistencias") stats[key].asistencias+=(p.asistencias||1);
            if(field==="rating"&&p.rating){stats[key].ratings.push(p.rating);stats[key].partidos++;}
          });
        };
        mergePlayer(parsed.goleadores,"goles");
        mergePlayer(parsed.asistencias,"asistencias");
        mergePlayer(parsed.calificaciones,"rating");
        const grupos=(existing.grupos||[]).map(g=>{
          const sels=g.selecciones||[];
          const lname=sels.find(s=>s.toLowerCase().includes((parsed.local?.nombre||"").toLowerCase().slice(0,4)))||parsed.local?.nombre;
          const vname=sels.find(s=>s.toLowerCase().includes((parsed.visitante?.nombre||"").toLowerCase().slice(0,4)))||parsed.visitante?.nombre;
          if(!lname||!vname||!sels.includes(lname)&&!sels.includes(vname)) return g;
          const tabla=[...(g.tabla||sels.map(s=>({sel:s,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0})))];
          const gl=parsed.local?.goles||0,gv=parsed.visitante?.goles||0;
          const upd=(sel,gf,gc)=>{const idx=tabla.findIndex(r=>r.sel===sel);if(idx===-1)return;tabla[idx]={...tabla[idx],pj:tabla[idx].pj+1,gf:tabla[idx].gf+gf,gc:tabla[idx].gc+gc,pg:tabla[idx].pg+(gf>gc?1:0),pe:tabla[idx].pe+(gf===gc?1:0),pp:tabla[idx].pp+(gf<gc?1:0),pts:tabla[idx].pts+(gf>gc?3:gf===gc?1:0)};};
          upd(lname,gl,gv);upd(vname,gv,gl);
          return{...g,tabla};
        });
        await saveM({grupos,partidos,stats});
        setAiMsg("✅ "+parsed.local?.nombre+" "+parsed.local?.goles+" - "+parsed.visitante?.goles+" "+parsed.visitante?.nombre);
      }
    }catch(e){setAiMsg("❌ "+e.message);}
    setUploading(false);
  };

  const[convPreview,setConvPreview]=useState(null); // {filas:[{nombre,pos}]}
  const[convUploading,setConvUploading]=useState(false);
  const convFileRef=useRef(null);
  const convExcelRef=useRef(null);

  const processConvocatoriaExcel=async(file)=>{
    setConvUploading(true);
    setAiMsg("Leyendo Excel…");
    try{
      await new Promise((res,rej)=>{
        if(window.XLSX){res();return;}
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
      const buf=await file.arrayBuffer();
      const wb=window.XLSX.read(buf,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=window.XLSX.utils.sheet_to_json(ws,{header:1});
      const filas=[];
      for(const row of rows){
        if(!row||row.every(v=>!v&&v!==0)) continue;
        const nombre=row[0]?String(row[0]).trim():"";
        const pos=row[1]?String(row[1]).trim().toUpperCase():"";
        if(!nombre) continue;
        if(nombre.toUpperCase()==="NOMBRE"||nombre.toUpperCase()==="JUGADOR") continue; // skip header row
        filas.push({nombre,pos});
      }
      if(filas.length===0) throw new Error("No se encontraron filas válidas. Usa columna A = Nombre, columna B = Posición.");
      setConvPreview({filas});
      setAiMsg(`✅ ${filas.length} jugadores leídos del Excel — revisa y confirma abajo`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setConvUploading(false);
  };

  const callGeminiWithRetry=async(GEMINI_URL,body,onWaiting)=>{
    const attempt=async()=>{
      const resp=await fetch(GEMINI_URL,{method:"POST",headers:{"Content-Type":"application/json"},body});
      if(resp.status===429){
        const err=new Error("429");
        err.is429=true;
        throw err;
      }
      if(!resp.ok){
        const errTxt=await resp.text().catch(()=>"");
        throw new Error(`HTTP ${resp.status} ${errTxt.slice(0,200)}`);
      }
      return resp;
    };
    try{
      return await attempt();
    }catch(e){
      if(e.is429){
        onWaiting&&onWaiting();
        await new Promise(r=>setTimeout(r,10000));
        try{
          return await attempt();
        }catch(e2){
          if(e2.is429) throw new Error("Se alcanzó el límite de uso de Gemini (cuota agotada). Espera unos minutos e intenta de nuevo.");
          throw e2;
        }
      }
      throw e;
    }
  };

  const processConvocatoria=async(file)=>{
    setConvUploading(true);
    setAiMsg("Leyendo imagen…");
    try{
      const b64=await new Promise((res,rej)=>{
        const r=new FileReader();
        r.onload=()=>res(r.result.split(",")[1]);
        r.onerror=()=>rej(new Error("FileReader error"));
        r.readAsDataURL(file);
      });
      setAiMsg("Conectando con Gemini…");
      const prompt=`Analiza esta captura de la convocatoria/plantilla de un equipo en FC26. Para cada jugador extrae su nombre y su posición (usa códigos en inglés: GK, CB, RB, LB, CDM, CM, CAM, RM, LM, RW, LW, ST, CF). Responde SOLO con JSON sin markdown, sin texto adicional: {"jugadores":[{"nombre":"","pos":""}]}`;
      const GEMINI_KEY="AIzaSyAGlxjD12k38Xu9L-8K165iJma1ZwR7tyY";
      const GEMINI_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
      const body=JSON.stringify({contents:[{parts:[{inline_data:{mime_type:file.type||"image/jpeg",data:b64}},{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:2000}});
      const resp=await callGeminiWithRetry(GEMINI_URL,body,()=>setAiMsg("⏳ Límite alcanzado, reintentando en 10s…"));
      const respData=await resp.json();
      if(respData.error) throw new Error(respData.error.message);
      const raw=respData.candidates?.[0]?.content?.parts?.[0]?.text;
      if(!raw) throw new Error("Respuesta vacía de Gemini");
      const cleaned=raw.replace(/```json|```/g,"").trim();
      let parsed;
      try{ parsed=JSON.parse(cleaned); }
      catch{ throw new Error("No se pudo interpretar el JSON: "+cleaned.slice(0,150)); }
      const filas=(parsed.jugadores||[]).map(j=>({nombre:j.nombre||"",pos:(j.pos||"").toUpperCase()}));
      if(filas.length===0) throw new Error("No se detectaron jugadores en la imagen");
      setConvPreview({filas});
      setAiMsg(`✅ ${filas.length} jugadores leídos — revisa y confirma abajo`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setConvUploading(false);
  };

  const confirmConvocatoria=async()=>{
    if(!convPreview||!userSel) return;
    const newSquad=convPreview.filas.map(f=>({name:f.nombre,pos:f.pos,primaryPos:f.pos}));
    await setDoc(doc(db,"selecciones",userSel.id),{squad:newSquad},{merge:true});
    setAiMsg(`✅ Convocatoria de ${userSel.country} actualizada (${newSquad.length} jugadores)`);
    setConvPreview(null);
  };

  const updateConvCell=(fi,field,val)=>{
    const filas=[...convPreview.filas];
    filas[fi]={...filas[fi],[field]:field==="pos"?val.toUpperCase():val};
    setConvPreview({...convPreview,filas});
  };

  const addConvRow=()=>setConvPreview({...convPreview,filas:[...convPreview.filas,{nombre:"",pos:""}]});
  const removeConvRow=(fi)=>setConvPreview({...convPreview,filas:convPreview.filas.filter((_,i)=>i!==fi)});

  const grupos=mundial?.grupos||[];
  const partidos=mundial?.partidos||[];
  const stats=Object.values(mundial?.stats||{});

  // Find user's selección and next match
  const userSelId=teamData?.nationalTeam||"";
  const userSel=allSels.find(s=>s.id===userSelId);
  const userSelName=userSel?.country||"";
  const userGrupo=grupos.find(g=>(g.selecciones||[]).some(s=>s===userSelName));
  const userGrupoLetra=userGrupo?.nombre?.replace("GRUPO ","");

  // Find next unplayed match for user's selección
  const fixtureConfig=mundial?.fixture||{};
  let nextMatch=null;
  let groupFinished=false;
  if(userSelName&&userGrupoLetra){
    const totalPartidos=JORNADAS.flatMap(j=>{
      const jKey=j.replace(/ /g,"_");
      return (fixtureConfig[userGrupoLetra]?.[jKey]||[]).filter(p=>p.local&&p.visitante&&(p.local===userSelName||p.visitante===userSelName)).map(p=>({...p,jornada:j}));
    });
    const pending=totalPartidos.filter(p=>!partidos.find(r=>r.jornada===p.jornada&&r.grupo===`GRUPO ${userGrupoLetra}`&&r.local?.nombre===p.local&&r.visitante?.nombre===p.visitante));
    nextMatch=pending[0]||null;
    groupFinished=totalPartidos.length>0&&pending.length===0;
  }

  // Group position
  const userPos=groupFinished&&userGrupo?([...(userGrupo.tabla||[])].sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)).findIndex(r=>r.sel===userSelName)+1):null;
  const goleadoresStats=[...stats].sort((a,b)=>b.goles-a.goles).filter(p=>p.goles>0);
  const asistentesStats=[...stats].sort((a,b)=>b.asistencias-a.asistencias).filter(p=>p.asistencias>0);
  const ratings=[...stats].filter(p=>p.ratings?.length>0).sort((a,b)=>{
    const ra=a.ratings.reduce((s,r)=>s+r,0)/a.ratings.length;
    const rb=b.ratings.reduce((s,r)=>s+r,0)/b.ratings.length;
    return rb-ra;
  });

  const tabBtn=(id,label)=>(
    <button onClick={()=>setTab(id)} style={{padding:"5px 10px",borderRadius:7,border:`1.5px solid ${tab===id?"#7c3aed":C.borderDark}`,background:tab===id?"#7c3aed":C.inputBg,color:tab===id?"#fff":C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
      {label}
    </button>
  );

  const StatRow=({i,name,sel,val,label})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,background:i===0?"#7c3aed11":C.inputBg,border:`1px solid ${i===0?"#7c3aed":C.border}`,marginBottom:4}}>
      <span style={{fontSize:11,fontWeight:800,color:i===0?"#7c3aed":C.textFaint,fontFamily:"monospace",width:18}}>{i+1}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
        <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{sel}</div>
      </div>
      <span style={{fontSize:13,fontWeight:800,color:"#7c3aed",fontFamily:"'Bebas Neue',sans-serif"}}>{val} {label}</span>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:2000,display:"flex",alignItems:"stretch",justifyContent:"center",backdropFilter:"blur(10px)"}} onClick={onClose}>
      <div style={{background:C.card,width:"100%",maxWidth:520,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 0 80px rgba(124,58,237,0.3)"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{padding:"12px 16px",background:"linear-gradient(135deg,#4c1d95,#7c3aed)",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>🌍 MUNDIAL DE SELECCIONES</span>
          <button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {/* Siguiente partido del usuario */}
        {userSelName&&(nextMatch||groupFinished)&&(
          <div style={{padding:"8px 16px",background:groupFinished?"#1a3a5c":"#7c3aed",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            {groupFinished?(
              <>
                <span style={{fontSize:13}}>🏁</span>
                <span style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:"'DM Sans',sans-serif",flex:1}}>
                  {userSelName} — Fase de grupos completada
                </span>
                <span style={{fontSize:12,fontWeight:800,color:"#FFD700",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>
                  {userPos===1?"🥇":userPos===2?"🥈":userPos===3?"🥉":`${userPos}°`} del {userGrupo?.nombre}
                </span>
              </>
            ):(
              <>
                <span style={{fontSize:13}}>⚔️</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.7)",fontFamily:"'DM Sans',sans-serif"}}>{nextMatch.jornada} · {userGrupo?.nombre}</div>
                  <div style={{fontSize:12,fontWeight:800,color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>
                    {nextMatch.local===userSelName
                      ?<>{userSelName} <span style={{color:"#FFD700"}}>vs</span> {nextMatch.visitante}</>
                      :<>{nextMatch.local} <span style={{color:"#FFD700"}}>vs</span> {userSelName}</>
                    }
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{padding:"8px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:5,overflowX:"auto",flexShrink:0}}>
          {tabBtn("misel","🏴 Mi Sel.")}
          {tabBtn("tabla","📊 Tabla")}
          {tabBtn("goleadores","⚽ Goles")}
          {tabBtn("asistencias","🎯 Asist.")}
          {tabBtn("ratings","⭐ Ratings")}
          {tabBtn("fixture","📅 Partidos")}
          {isAdmin&&tabBtn("admin","⚙️ Admin")}
        </div>

        {aiMsg&&<div style={{padding:"6px 14px",background:"#f0fdf4",borderBottom:`1px solid #bbf7d0`,fontSize:11,color:"#166534",fontFamily:"'DM Sans',sans-serif"}}>{aiMsg}</div>}

        <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>

          {/* MI SELECCIÓN */}
          {tab==="misel"&&(
            !userSel
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:24,fontFamily:"'DM Sans',sans-serif"}}>
                ⚽ No tienes selección asignada. El admin te la asigna desde el panel.
              </div>
              :<div>
                {/* Header selección */}
                <div style={{background:"linear-gradient(135deg,#4c1d95,#7c3aed)",borderRadius:12,padding:"16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:36}}>{userSel.flag||"🏴"}</span>
                  <div>
                    <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{userSel.country}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontFamily:"'DM Sans',sans-serif"}}>{(userSel.squad||[]).length} jugadores convocados</div>
                    {userGrupo&&<div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontFamily:"'DM Sans',sans-serif"}}>Grupo {userGrupo.nombre}</div>}
                  </div>
                  {userGrupo&&userPos&&(
                    <div style={{marginLeft:"auto",fontSize:22,fontWeight:800,color:"#FFD700",fontFamily:"'Bebas Neue',sans-serif"}}>
                      {userPos===1?"🥇":userPos===2?"🥈":userPos===3?"🥉":`${userPos}°`}
                    </div>
                  )}
                </div>
                {/* Subir convocatoria por foto o Excel (admin o dueño) */}
                {(isAdmin||userSelId===teamData?.nationalTeam)&&(
                  <div style={{marginBottom:14,display:"flex",gap:8}}>
                    <input ref={convFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                      const f=e.target.files?.[0];
                      if(f) processConvocatoria(f);
                      e.target.value="";
                    }}/>
                    <input ref={convExcelRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{
                      const f=e.target.files?.[0];
                      if(f) processConvocatoriaExcel(f);
                      e.target.value="";
                    }}/>
                    <button onClick={()=>convFileRef.current?.click()} disabled={convUploading}
                      style={{flex:1,padding:"10px 8px",borderRadius:10,border:"1.5px dashed #7c3aed",background:"#7c3aed11",color:"#7c3aed",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:convUploading?"default":"pointer",opacity:convUploading?0.6:1}}>
                      {convUploading?"Leyendo…":"📷 Foto FC26"}
                    </button>
                    <button onClick={()=>convExcelRef.current?.click()} disabled={convUploading}
                      style={{flex:1,padding:"10px 8px",borderRadius:10,border:"1.5px dashed #27ae60",background:"#27ae6011",color:"#27ae60",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:convUploading?"default":"pointer",opacity:convUploading?0.6:1}}>
                      {convUploading?"Leyendo…":"📋 Excel"}
                    </button>
                  </div>
                )}
                {(isAdmin||userSelId===teamData?.nationalTeam)&&(
                  <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginTop:-8,marginBottom:14,textAlign:"center"}}>Excel: columna A = Nombre, columna B = Posición (GK, CB, RB, LB, CDM, CM, CAM, RM, LM, RW, LW, ST, CF)</div>
                )}
                {/* Preview editable */}
                {convPreview&&(
                  <div style={{background:C.card,borderRadius:10,padding:"10px 12px",border:"1.5px solid #7c3aed",marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:800,color:"#7c3aed",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Revisa antes de confirmar</div>
                    <div style={{maxHeight:240,overflowY:"auto",marginBottom:8}}>
                      {convPreview.filas.map((f,fi)=>(
                        <div key={fi} style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                          <input value={f.nombre} onChange={e=>updateConvCell(fi,"nombre",e.target.value)} placeholder="Nombre"
                            style={{flex:1,fontSize:11,padding:"5px 7px",borderRadius:6,border:`1px solid ${C.border}`,background:C.inputBg,color:C.text,fontFamily:"'DM Sans',sans-serif"}}/>
                          <input value={f.pos} onChange={e=>updateConvCell(fi,"pos",e.target.value)} placeholder="POS"
                            style={{width:54,fontSize:11,padding:"5px 7px",borderRadius:6,border:`1px solid ${C.border}`,background:C.inputBg,color:C.text,fontFamily:"monospace",textAlign:"center"}}/>
                          <button onClick={()=>removeConvRow(fi)} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:14,padding:"2px 4px"}}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={addConvRow} style={{flex:1,fontSize:11,padding:"7px 0",borderRadius:8,border:`1px solid ${C.border}`,background:C.inputBg,color:C.textMid,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>+ Agregar fila</button>
                      <button onClick={()=>setConvPreview(null)} style={{flex:1,fontSize:11,padding:"7px 0",borderRadius:8,border:`1px solid ${C.border}`,background:"none",color:C.textFaint,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>Cancelar</button>
                      <button onClick={confirmConvocatoria} style={{flex:1,fontSize:11,fontWeight:800,padding:"7px 0",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>✅ Confirmar</button>
                    </div>
                  </div>
                )}
                {/* Convocatoria */}
                <div style={{fontSize:11,fontWeight:700,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Convocatoria</div>
                {(userSel.squad||[]).length===0
                  ?<div style={{textAlign:"center",color:C.textFaint,fontSize:11,padding:16,fontFamily:"'DM Sans',sans-serif"}}>Sin jugadores convocados aún</div>
                  :(userSel.squad||[]).map((p,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:i%2===0?C.inputBg:"transparent",marginBottom:2}}>
                      <span style={{fontSize:9,fontWeight:700,color:"#7c3aed",background:"#7c3aed22",padding:"2px 5px",borderRadius:4,fontFamily:"monospace",minWidth:24,textAlign:"center"}}>{p.pos||p.primaryPos||"?"}</span>
                      <span style={{flex:1,fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{p.name}</span>
                      {p.overall&&<span style={{fontSize:12,fontWeight:800,color:"#7c3aed",fontFamily:"monospace"}}>{p.overall}</span>}
                    </div>
                  ))
                }
              </div>
          )}

          {/* TABLA POR GRUPOS */}
          {tab==="tabla"&&(
            grupos.length===0
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:24,fontFamily:"'DM Sans',sans-serif"}}>⏳ Esperando grupos del admin</div>
              :grupos.map((g,gi)=>(
                <div key={gi} style={{marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#7c3aed",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{g.nombre}</div>
                  <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 30px 30px 30px 30px 30px 30px 36px",gap:0,padding:"5px 8px",background:"#7c3aed11",borderBottom:`1px solid ${C.border}`}}>
                      {["Sel","PJ","PG","PE","PP","GF","GC","Pts"].map(h=><span key={h} style={{fontSize:9,fontWeight:800,color:"#7c3aed",fontFamily:"monospace",textAlign:"center"}}>{h}</span>)}
                    </div>
                    {[...(g.tabla||g.selecciones.map(s=>({sel:s,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0})))].sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)).map((r,ri)=>(
                      <div key={ri} style={{display:"grid",gridTemplateColumns:"1fr 30px 30px 30px 30px 30px 30px 36px",padding:"6px 8px",borderBottom:ri<g.selecciones.length-1?`1px solid ${C.border}`:"none",background:ri<2?"rgba(124,58,237,0.04)":"transparent"}}>
                        <span style={{fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sel}</span>
                        {[r.pj,r.pg,r.pe,r.pp,r.gf,r.gc].map((v,i)=><span key={i} style={{fontSize:11,color:C.textMid,fontFamily:"monospace",textAlign:"center"}}>{v}</span>)}
                        <span style={{fontSize:12,fontWeight:800,color:"#7c3aed",fontFamily:"monospace",textAlign:"center"}}>{r.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}

          {/* GOLEADORES */}
          {tab==="goleadores"&&(
            goleadoresStats.length===0
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:24,fontFamily:"'DM Sans',sans-serif"}}>Sin datos aún</div>
              :goleadoresStats.map((p,i)=><StatRow key={i} i={i} name={p.name} sel={p.selName} val={p.goles} label="⚽"/>)
          )}

          {/* ASISTENCIAS */}
          {tab==="asistencias"&&(
            asistentesStats.length===0
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:24,fontFamily:"'DM Sans',sans-serif"}}>Sin datos aún</div>
              :asistentesStats.map((p,i)=><StatRow key={i} i={i} name={p.name} sel={p.selName} val={p.asistencias} label="🎯"/>)
          )}

          {/* RATINGS */}
          {tab==="ratings"&&(
            ratings.length===0
              ?<div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:24,fontFamily:"'DM Sans',sans-serif"}}>Sin datos aún</div>
              :ratings.map((p,i)=>{
                const avg=(p.ratings.reduce((s,r)=>s+r,0)/p.ratings.length).toFixed(1);
                return <StatRow key={i} i={i} name={p.name} sel={p.selName} val={avg} label="⭐"/>;
              })
          )}

          {/* FIXTURE */}
          {tab==="fixture"&&(
            (()=>{
              // Build full fixture from saved fixture config + results
              const fixtureConfig=mundial?.fixture||{};
              const gruposConFixture=GRUPOS_FIJOS.filter(g=>fixtureConfig[g]&&JORNADAS.some(j=>fixtureConfig[g][j.replace(/ /g,"_")]?.some(p=>p.local&&p.visitante)));
              if(gruposConFixture.length===0) return <div style={{textAlign:"center",color:C.textFaint,fontSize:12,padding:24,fontFamily:"'DM Sans',sans-serif"}}>El admin aún no configuró el fixture</div>;
              return JORNADAS.map(jornada=>{
                const jKey=jornada.replace(/ /g,"_");
                const matchesThisJornada=[];
                gruposConFixture.forEach(g=>{
                  const ps=fixtureConfig[g][jKey]||[];
                  ps.filter(p=>p.local&&p.visitante).forEach(p=>{
                    const played=partidos.find(r=>r.jornada===jornada&&r.grupo===`GRUPO ${g}`&&r.local?.nombre===p.local&&r.visitante?.nombre===p.visitante);
                    matchesThisJornada.push({...p,grupo:`GRUPO ${g}`,jornada,played});
                  });
                });
                if(matchesThisJornada.length===0) return null;
                return(
                  <div key={jornada} style={{marginBottom:14}}>
                    <div style={{fontSize:10,fontWeight:800,color:"#7c3aed",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.5,marginBottom:6,padding:"4px 8px",background:"#7c3aed11",borderRadius:6}}>{jornada}</div>
                    {matchesThisJornada.map((p,i)=>(
                      <div key={i} style={{background:C.inputBg,border:`1px solid ${p.played?C.border:"#e67e2244"}`,borderRadius:10,padding:"8px 12px",marginBottom:5}}>
                        <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>{p.grupo}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{flex:1,fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif",textAlign:"right"}}>{p.local}</span>
                          {p.played
                            ?<span style={{fontSize:14,fontWeight:800,color:"#7c3aed",fontFamily:"'Bebas Neue',sans-serif",padding:"2px 10px",background:"#7c3aed11",borderRadius:6}}>{p.played.local?.goles} - {p.played.visitante?.goles}</span>
                            :<span style={{fontSize:11,fontWeight:700,color:"#e67e22",fontFamily:"monospace",padding:"2px 10px",background:"#e67e2211",borderRadius:6}}>vs</span>
                          }
                          <span style={{flex:1,fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{p.visitante}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });
            })()
          )}

          {/* ADMIN */}
          {tab==="admin"&&isAdmin&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* GRUPOS A-H */}
              <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#7c3aed",fontFamily:"'DM Sans',sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>🏳️ Selecciones por Grupo</div>
                <GruposSetup grupos={grupos} saveM={saveM} setAiMsg={setAiMsg}/>
              </div>

              {/* FIXTURE */}
              <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#e67e22",fontFamily:"'DM Sans',sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>📅 Configurar Fixture</div>
                <FixtureSetup grupos={grupos} mundial={mundial} saveM={saveM} setAiMsg={setAiMsg}/>
              </div>

              {/* RESULTADO POR JORNADA */}
              <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#1a3a5c",fontFamily:"'DM Sans',sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>⚽ Resultado por Jornada</div>
                <ManualResultadoForm grupos={grupos} allSelPlayers={allSelPlayers} fuzzyMatch={fuzzyMatch} mundial={mundial} saveM={saveM} setAiMsg={setAiMsg}/>
              </div>

              {/* Reset */}
              <button onClick={async()=>{if(!window.confirm("¿Resetear todo el Mundial?")) return;await setDoc(doc(db,"mundial","data"),{grupos:[],partidos:[],stats:{}});setAiMsg("✅ Mundial reseteado");}}
                style={{padding:"10px",borderRadius:10,background:"#fff5f5",color:"#e74c3c",border:"1px solid #e74c3c",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                🗑️ Resetear Mundial
              </button>

              <div style={{background:C.inputBg,borderRadius:10,padding:"10px 14px",fontSize:11,color:C.textMid,fontFamily:"'DM Sans',sans-serif"}}>
                📊 {grupos.length} grupos · {partidos.length} partidos · {stats.length} jugadores con stats
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPETENCIAS ─────────────────────────────────────────────────────────────
// ─── HELPERS: Noticias y Head-to-Head ────────────────────────────────────────
async function addNoticia(texto,icono="📰"){
  const ref=doc(db,"config","noticias");
  const snap=await getDoc(ref).catch(()=>null);
  const current=snap?.exists()?snap.data():{};
  const lista=current.lista||[];
  lista.push({texto,icono,fecha:new Date().toISOString()});
  // Mantener solo las últimas 100
  await setDoc(ref,{lista:lista.slice(-100)},{merge:true});
}

async function addH2H({local,golesLocal,visitante,golesVisitante,competencia,jornada}){
  const ref=doc(db,"config","h2hHistorial");
  const snap=await getDoc(ref).catch(()=>null);
  const current=snap?.exists()?snap.data():{};
  const lista=current.lista||[];
  lista.push({local,golesLocal,visitante,golesVisitante,competencia,jornada:jornada||"",fecha:new Date().toISOString()});
  await setDoc(ref,{lista},{merge:true});
}

const COMPETENCIAS_AVAILABLE=[
  {id:"liga1",    name:"Neo League",           icon:"🏆", color:"#1a3a5c", lineupName:"Liga", formato:"liga"},
  {id:"liga2",    name:"Europe Championship",  icon:"🌍", color:"#27ae60", lineupName:"Liga", formato:"liga"},
  {id:"copa",     name:"Copa",                 icon:"🏅", color:"#8e44ad", lineupName:"Copa", formato:"grupos"},
  {id:"champions",name:"Champions",            icon:"⭐", color:"#f39c12", lineupName:"Champions", formato:"grupos"},
  {id:"europa",   name:"Europa League",        icon:"🟠", color:"#e67e22", lineupName:"Europa League", formato:"grupos"},
  {id:"conference",name:"Conference",          icon:"🟣", color:"#9b59b6", lineupName:"Conference", formato:"grupos"},
  {id:"supercopa",name:"SuperCopa",            icon:"👑", color:"#c0392b", lineupName:"SuperCopa", formato:"final"},
];

function HomeScreen({teamData,onSelect,isAdmin,onOpenMundial}){
  const tc=getTeamColor(teamData?.teamColor||"blue");
  const comps=(teamData?.competencias||[]).map(id=>COMPETENCIAS_AVAILABLE.find(c=>c.id===id)).filter(Boolean);
  const teamInitials=(teamData?.teamName||"?").slice(0,2).toUpperCase();
  const[showNoticias,setShowNoticias]=useState(false);

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>

      <LiveAndAviso/>

      {/* Hero header */}
      <div style={{background:`linear-gradient(160deg,${tc.dark} 0%,${tc.bg} 100%)`,padding:"32px 20px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:12,position:"relative",overflow:"hidden"}}>
        {/* Fondo decorativo */}
        <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
        <div style={{position:"absolute",bottom:-20,left:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
        {/* Escudo */}
        <div style={{width:72,height:72,borderRadius:18,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.3)",zIndex:1}}>
          <span style={{fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{teamInitials}</span>
        </div>
        <div style={{textAlign:"center",zIndex:1}}>
          <div style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{teamData?.teamName}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>
            {comps.length>0?`${comps.length} competicion${comps.length>1?"es":""}  activa${comps.length>1?"s":""}`:""} · {teamData?.presupuesto?`💰 ${teamData.presupuesto}`:""}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{flex:1,padding:"20px 16px",display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>

        {comps.length===0&&(
          <div style={{textAlign:"center",color:C.textFaint,fontSize:12,fontFamily:"'DM Sans',sans-serif",padding:"40px 0"}}>
            ⚽ El admin aún no asignó tus competiciones
          </div>
        )}

        {comps.length>0&&(
          <div style={{fontSize:10,fontWeight:700,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.8,marginBottom:2}}>Mis Competiciones</div>
        )}

        {comps.map(comp=>(
          <button key={comp.id} onClick={()=>onSelect(comp)}
            style={{width:"100%",padding:"16px 18px",borderRadius:16,background:`linear-gradient(135deg,${comp.color}ee,${comp.color}88)`,border:`1px solid ${comp.color}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:`0 4px 24px ${comp.color}33`,textAlign:"left",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",right:-10,top:-10,fontSize:60,opacity:0.12,lineHeight:1}}>{comp.icon}</div>
            <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:22}}>{comp.icon}</span>
            </div>
            <div style={{flex:1,zIndex:1}}>
              <div style={{fontSize:17,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>{comp.name}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Ver mi alineación</div>
            </div>
            <span style={{fontSize:18,color:"rgba(255,255,255,0.6)",zIndex:1}}>›</span>
          </button>
        ))}

        <div style={{fontSize:10,fontWeight:700,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.8,marginTop:comps.length>0?8:0,marginBottom:2}}>Más</div>

        {/* Noticias */}
        <button onClick={()=>setShowNoticias(true)}
          style={{width:"100%",padding:"16px 18px",borderRadius:16,background:"linear-gradient(135deg,#1a1a2eee,#34345688)",border:"1px solid #555",cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:"0 4px 24px #00000033",textAlign:"left",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-10,top:-10,fontSize:60,opacity:0.12,lineHeight:1}}>📰</div>
          <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:22}}>📰</span>
          </div>
          <div style={{flex:1,zIndex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>Noticias</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Resultados y novedades</div>
          </div>
          <span style={{fontSize:18,color:"rgba(255,255,255,0.6)",zIndex:1}}>›</span>
        </button>

        {/* Mundial */}
        <button onClick={onOpenMundial}
          style={{width:"100%",padding:"16px 18px",borderRadius:16,background:"linear-gradient(135deg,#4c1d95ee,#7c3aed88)",border:"1px solid #7c3aed",cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:"0 4px 24px #7c3aed33",textAlign:"left",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-10,top:-10,fontSize:60,opacity:0.12,lineHeight:1}}>🌍</div>
          <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:22}}>🌍</span>
          </div>
          <div style={{flex:1,zIndex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>Mundial</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Selecciones nacionales</div>
          </div>
          <span style={{fontSize:18,color:"rgba(255,255,255,0.6)",zIndex:1}}>›</span>
        </button>

        {/* Mi Equipo */}
        <button onClick={()=>onSelect(null)}
          style={{width:"100%",padding:"16px 18px",borderRadius:16,background:`linear-gradient(135deg,${tc.dark}ee,${tc.bg}88)`,border:`1px solid ${tc.dark}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:`0 4px 24px ${tc.dark}33`,textAlign:"left",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-10,top:-10,fontSize:60,opacity:0.12,lineHeight:1}}>👕</div>
          <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:22}}>👕</span>
          </div>
          <div style={{flex:1,zIndex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>Mi Equipo</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Campo y plantilla</div>
          </div>
          <span style={{fontSize:18,color:"rgba(255,255,255,0.6)",zIndex:1}}>›</span>
        </button>

      </div>
      {showNoticias&&<NoticiasModal onClose={()=>setShowNoticias(false)}/>}
    </div>
  );
}

// ─── NOTICIAS ─────────────────────────────────────────────────────────────────
function NoticiasModal({onClose}){
  const[noticias,setNoticias]=useState([]);
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","noticias"),snap=>{
      const lista=snap.exists()?(snap.data().lista||[]):[];
      setNoticias([...lista].reverse()); // más reciente primero
    });
    return unsub;
  },[]);

  const formatFecha=(iso)=>{
    try{
      const d=new Date(iso);
      return d.toLocaleDateString("es-GT",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
    }catch{return "";}
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.7)",display:"flex",flexDirection:"column"}}>
      <div style={{background:C.card,flex:1,display:"flex",flexDirection:"column",maxHeight:"100vh",overflowY:"auto"}}>
        <div style={{padding:"12px 16px",background:"linear-gradient(135deg,#1a1a2e,#34345b)",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>📰 NOTICIAS</span>
          <button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",gap:8,overflowY:"auto"}}>
          {noticias.length===0&&(
            <div style={{textAlign:"center",color:C.textFaint,fontSize:12,fontFamily:"'DM Sans',sans-serif",padding:"40px 0"}}>
              📭 Sin noticias todavía
            </div>
          )}
          {noticias.map((n,i)=>(
            <div key={i} style={{background:C.cardAlt||C.inputBg,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0}}>{n.icono||"📰"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:C.text,fontFamily:"'DM Sans',sans-serif",fontWeight:600,lineHeight:1.4}}>{n.texto}</div>
                <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginTop:3}}>{formatFecha(n.fecha)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SUPERCOPA: Campeón Neo vs Campeón EC (un solo partido) ──────────────────
function SuperCopaSetup({compColor,setAiMsg}){
  const[allData,setAllData]=useState(null);
  const[local,setLocal]=useState(null); // {equipoA,equipoB,golesA,golesB,jugado}
  const[saving,setSaving]=useState(false);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","competenciaData"),snap=>{
      const all=snap.exists()?snap.data():{};
      setAllData(all);
      const campeonNeo=(all.liga1?.grupos?.[0]?.tabla||[]).slice().sort((a,b)=>b.pts-a.pts)[0]?.equipo||"";
      const campeonEC=(all.liga2?.grupos?.[0]?.tabla||[]).slice().sort((a,b)=>b.pts-a.pts)[0]?.equipo||"";
      const existing=all.supercopa?.partido;
      setLocal({
        equipoA:existing?.equipoA||campeonNeo,
        equipoB:existing?.equipoB||campeonEC,
        golesA:existing?.golesA??"",
        golesB:existing?.golesB??"",
        jugado:!!existing
      });
    });
    return unsub;
  },[]);

  const save=async()=>{
    if(!local.equipoA.trim()||!local.equipoB.trim()){setAiMsg("❌ Define ambos finalistas");return;}
    setSaving(true);
    const ref=doc(db,"config","competenciaData");
    const snap=await getDoc(ref).catch(()=>null);
    const current=snap?.exists()?snap.data():{};
    const eqA=local.equipoA.trim(),eqB=local.equipoB.trim();
    const gA=Number(local.golesA)||0,gB=Number(local.golesB)||0;
    await setDoc(ref,{...current,supercopa:{partido:{
      equipoA:eqA,equipoB:eqB,golesA:gA,golesB:gB
    }}},{merge:true});
    await addH2H({local:eqA,golesLocal:gA,visitante:eqB,golesVisitante:gB,competencia:"SuperCopa"});
    if(gA!==gB){
      const campeon=gA>gB?eqA:eqB;
      await addNoticia(`👑 ${campeon} es el campeón de la SuperCopa (${gA}-${gB})`,"👑");
    }else{
      await addNoticia(`👑 SuperCopa terminó en empate ${gA}-${gB} entre ${eqA} y ${eqB}`,"👑");
    }
    setSaving(false);
    setAiMsg("✅ SuperCopa guardada");
  };

  if(!local) return <div style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Cargando…</div>;

  const campeonNeo=(allData?.liga1?.grupos?.[0]?.tabla||[]).slice().sort((a,b)=>b.pts-a.pts)[0]?.equipo;
  const campeonEC=(allData?.liga2?.grupos?.[0]?.tabla||[]).slice().sort((a,b)=>b.pts-a.pts)[0]?.equipo;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>
        La SuperCopa enfrenta al campeón de Neo League contra el campeón de Europe Championship en un único partido.
        {campeonNeo&&campeonEC&&<div style={{marginTop:4}}>Sugerido: <b>{campeonNeo}</b> (Neo) vs <b>{campeonEC}</b> (EC)</div>}
      </div>
      <div style={{background:C.card,borderRadius:9,padding:"10px 12px",border:`1.5px solid ${compColor}`,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input value={local.equipoA} onChange={e=>setLocal({...local,equipoA:e.target.value})} placeholder="Campeón Neo League"
            style={{flex:1,padding:"7px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,fontFamily:"'DM Sans',sans-serif"}}/>
          <input type="number" value={local.golesA} onChange={e=>setLocal({...local,golesA:e.target.value})} placeholder="0"
            style={{width:48,padding:"7px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,fontWeight:800,textAlign:"center",fontFamily:"monospace"}}/>
        </div>
        <div style={{textAlign:"center",fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>VS</div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input value={local.equipoB} onChange={e=>setLocal({...local,equipoB:e.target.value})} placeholder="Campeón Europe Championship"
            style={{flex:1,padding:"7px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,fontFamily:"'DM Sans',sans-serif"}}/>
          <input type="number" value={local.golesB} onChange={e=>setLocal({...local,golesB:e.target.value})} placeholder="0"
            style={{width:48,padding:"7px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,fontWeight:800,textAlign:"center",fontFamily:"monospace"}}/>
        </div>
        <button onClick={save} disabled={saving}
          style={{padding:"8px",borderRadius:8,background:compColor,color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:saving?0.6:1}}>
          {saving?"Guardando…":"💾 Guardar resultado"}
        </button>
        {local.jugado&&<div style={{fontSize:10,color:"#27ae60",fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>
          🏆 {(Number(local.golesA)>Number(local.golesB))?local.equipoA:(Number(local.golesB)>Number(local.golesA))?local.equipoB:"Empate"}
        </div>}
      </div>
    </div>
  );
}

// ─── COMPETENCIA: GRUPOS Y TABLA (genérico, editable por temporada) ──────────
function CompetenciaGruposSetup({compId,compName,compColor,formato,allTeams,setAiMsg}){
  const[data,setData]=useState(null); // {grupos:[{nombre,equipos:[...],tabla:[...]}]}
  const[local,setLocal]=useState([]); // working copy
  const[saving,setSaving]=useState(false);
  const[uploadingIdx,setUploadingIdx]=useState(null);
  const[preview,setPreview]=useState(null); // {grupoIdx, filas:[{equipo,pj,pg,pe,pp,gf,gc,pts}]}
  const fileRef=useRef({});
  const excelRef=useRef({});

  const eligibles=allTeams.filter(t=>(t.competencias||[]).includes(compId));

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","competenciaData"),snap=>{
      const all=snap.exists()?snap.data():{};
      const d=all[compId]||{grupos:[]};
      setData(d);
      if(formato==="liga"){
        const eqNames=eligibles.map(t=>t.teamName);
        const existing=(d.grupos||[])[0];
        const tabla=eqNames.map(eq=>{
          const found=(existing?.tabla||[]).find(r=>r.equipo===eq);
          return found||{equipo:eq,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0};
        });
        setLocal([{nombre:"Tabla General",equipos:eqNames,tabla}]);
      }else{
        setLocal(d.grupos||[]);
      }
    });
    return unsub;
  },[compId,formato,eligibles.map(t=>t.teamName).join(",")]);

  const saveAll=async(grupos)=>{
    setSaving(true);
    const ref=doc(db,"config","competenciaData");
    const snap=await getDoc(ref).catch(()=>null);
    const current=snap?.exists()?snap.data():{};
    await setDoc(ref,{...current,[compId]:{grupos}},{merge:true});
    setSaving(false);
  };

  const addGrupo=()=>{
    const letra=String.fromCharCode(65+local.length);
    setLocal([...local,{nombre:`GRUPO ${letra}`,equipos:[],tabla:[]}]);
  };

  const removeGrupo=(gi)=>{
    setLocal(local.filter((_,i)=>i!==gi));
  };

  const toggleEquipoEnGrupo=(gi,teamName)=>{
    const g={...local[gi]};
    const equipos=[...(g.equipos||[])];
    const idx=equipos.indexOf(teamName);
    if(idx>=0) equipos.splice(idx,1);
    else equipos.push(teamName);
    g.equipos=equipos;
    g.tabla=equipos.map(e=>{
      const existing=(g.tabla||[]).find(r=>r.equipo===e);
      return existing||{equipo:e,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0};
    });
    const next=[...local];next[gi]=g;setLocal(next);
  };

  const saveGrupo=async(gi)=>{
    const g=local[gi];
    if(!g.equipos||g.equipos.length<2){setAiMsg("❌ El grupo necesita al menos 2 equipos");return;}
    const yaEstabaGuardado=(data.grupos||[])[gi]?.equipos?.length>=2;
    const nuevosLocal=[...local];
    await saveAll(nuevosLocal);
    if(!yaEstabaGuardado&&compName){
      await addNoticia(`🎲 Se sortearon los grupos de ${compName} — ${g.nombre}: ${g.equipos.join(", ")}`,"🎲");
    }
    setAiMsg(`✅ ${g.nombre} guardado (${g.equipos.length} equipos)`);
  };

  // ─── Procesar imagen de tabla de clasificación ──────────────────────────
  const processTableImage=async(file,gi)=>{
    setUploadingIdx(gi);
    setAiMsg("Leyendo imagen…");
    try{
      const b64=await new Promise((res,rej)=>{
        const r=new FileReader();
        r.onload=()=>res(r.result.split(",")[1]);
        r.onerror=()=>rej(new Error("FileReader error"));
        r.readAsDataURL(file);
      });
      setAiMsg("Conectando con Gemini…");
      const equiposGrupo=(local[gi]?.equipos||[]).join(", ");
      const prompt=`Analiza esta captura de una tabla de clasificación de FC26. Los equipos posibles son: ${equiposGrupo}. Para cada fila de la tabla, extrae el nombre del equipo (usa EXACTAMENTE uno de los nombres de la lista que mejor coincida) y sus estadísticas. Responde SOLO con JSON sin markdown, sin texto adicional: {"filas":[{"equipo":"NOMBRE_EXACTO_DE_LA_LISTA","pj":0,"pg":0,"pe":0,"pp":0,"gf":0,"gc":0,"pts":0}]}`;
      const GEMINI_KEY="AIzaSyAGlxjD12k38Xu9L-8K165iJma1ZwR7tyY";
      const GEMINI_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
      const body=JSON.stringify({contents:[{parts:[{inline_data:{mime_type:file.type||"image/jpeg",data:b64}},{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:2000}});
      const resp=await fetch(GEMINI_URL,{method:"POST",headers:{"Content-Type":"application/json"},body});
      if(!resp.ok){
        const errTxt=await resp.text().catch(()=>"");
        throw new Error(`HTTP ${resp.status} ${errTxt.slice(0,200)}`);
      }
      const data=await resp.json();
      if(data.error) throw new Error(data.error.message);
      const raw=data.candidates?.[0]?.content?.parts?.[0]?.text;
      if(!raw) throw new Error("Respuesta vacía de Gemini");
      const cleaned=raw.replace(/```json|```/g,"").trim();
      let parsed;
      try{ parsed=JSON.parse(cleaned); }
      catch{ throw new Error("No se pudo interpretar el JSON: "+cleaned.slice(0,150)); }
      const filas=(parsed.filas||[]).map(f=>({
        equipo:f.equipo||"",
        pj:Number(f.pj)||0,pg:Number(f.pg)||0,pe:Number(f.pe)||0,pp:Number(f.pp)||0,
        gf:Number(f.gf)||0,gc:Number(f.gc)||0,pts:Number(f.pts)||0
      }));
      if(filas.length===0) throw new Error("No se detectaron filas en la imagen");
      setPreview({grupoIdx:gi,filas});
      setAiMsg(`✅ ${filas.length} filas leídas — revisa y confirma abajo`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setUploadingIdx(null);
  };

  // ─── Procesar Excel de tabla de clasificación ──────────────────────────
  const processTableExcel=async(file,gi)=>{
    setUploadingIdx(gi);
    setAiMsg("Leyendo Excel…");
    try{
      await new Promise((res,rej)=>{
        if(window.XLSX){res();return;}
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
      const buf=await file.arrayBuffer();
      const wb=window.XLSX.read(buf,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=window.XLSX.utils.sheet_to_json(ws,{header:1});
      const filas=[];
      for(const row of rows){
        if(!row||row.every(v=>!v&&v!==0)) continue;
        const equipo=row[0]?String(row[0]).trim():"";
        if(!equipo) continue;
        if(equipo.toUpperCase()==="EQUIPO") continue; // skip header row
        filas.push({
          equipo,
          pj:Number(row[1])||0,pg:Number(row[2])||0,pe:Number(row[3])||0,pp:Number(row[4])||0,
          gf:Number(row[5])||0,gc:Number(row[6])||0,pts:Number(row[7])||0
        });
      }
      if(filas.length===0) throw new Error("No se encontraron filas válidas. Usa: A=Equipo, B=PJ, C=PG, D=PE, E=PP, F=GF, G=GC, H=Pts.");
      setPreview({grupoIdx:gi,filas});
      setAiMsg(`✅ ${filas.length} filas leídas del Excel — revisa y confirma abajo`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setUploadingIdx(null);
  };

  const confirmPreview=async()=>{
    if(!preview) return;
    const gi=preview.grupoIdx;
    const g={...local[gi]};
    // Actualiza tabla: solo equipos que coinciden con los del grupo
    const tabla=(g.equipos||[]).map(eq=>{
      const fila=preview.filas.find(f=>f.equipo===eq);
      return fila?{...fila}:(g.tabla||[]).find(r=>r.equipo===eq)||{equipo:eq,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0};
    });
    g.tabla=tabla;
    const next=[...local];next[gi]=g;
    setLocal(next);
    await saveAll(next);
    setAiMsg(`✅ Tabla de ${g.nombre} actualizada`);
    setPreview(null);
  };

  const updatePreviewCell=(fi,field,val)=>{
    const filas=[...preview.filas];
    filas[fi]={...filas[fi],[field]:field==="equipo"?val:Number(val)||0};
    setPreview({...preview,filas});
  };

  if(!data) return <div style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Cargando…</div>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>
        Define los grupos de esta temporada y asigna equipos. Luego puedes subir una foto de la tabla de FC26 para actualizar PJ/PG/PE/PP/GF/GC/Pts automáticamente.
      </div>
      {local.map((g,gi)=>(
        <div key={gi} style={{background:C.card,borderRadius:9,padding:"10px 12px",border:`1.5px solid ${(g.tabla||[]).length>0?compColor:C.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:11,fontWeight:800,color:compColor,fontFamily:"'DM Sans',sans-serif"}}>{g.nombre}</span>
            {formato!=="liga"&&<button onClick={()=>removeGrupo(gi)} style={{background:"transparent",border:"none",color:"#c0392b",fontSize:11,cursor:"pointer"}}>🗑️</button>}
          </div>
          {/* Selector de equipos (solo formato grupos) */}
          {formato!=="liga"&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
              {eligibles.map(t=>{
                const name=t.teamName;
                const active=(g.equipos||[]).includes(name);
                return(
                  <button key={t.uid||t.id} onClick={()=>toggleEquipoEnGrupo(gi,name)}
                    style={{padding:"4px 9px",borderRadius:20,border:`1.5px solid ${active?compColor:C.borderDark}`,background:active?compColor+"22":C.inputBg,color:active?compColor:C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    {name}
                  </button>
                );
              })}
            </div>
          )}
          {formato!=="liga"&&(
            <button onClick={()=>saveGrupo(gi)} disabled={saving}
              style={{width:"100%",padding:"6px",borderRadius:7,background:compColor,color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:saving?0.6:1,marginBottom:8}}>
              {saving?"Guardando…":`Guardar ${g.nombre} (${(g.equipos||[]).length} equipos)`}
            </button>
          )}
          {formato==="liga"&&(
            <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>
              {(g.equipos||[]).length} equipos inscritos (se actualiza automáticamente desde "Equipos")
            </div>
          )}
          {/* Tabla actual */}
          {(g.tabla||[]).length>0&&(
            <div style={{overflowX:"auto",marginBottom:8}}>
              <table style={{width:"100%",fontSize:9,fontFamily:"'DM Sans',sans-serif",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{color:C.textFaint}}>
                    <th style={{textAlign:"left",padding:"3px 4px"}}>Equipo</th>
                    <th style={{padding:"3px 4px"}}>PJ</th><th style={{padding:"3px 4px"}}>PG</th><th style={{padding:"3px 4px"}}>PE</th><th style={{padding:"3px 4px"}}>PP</th><th style={{padding:"3px 4px"}}>GF</th><th style={{padding:"3px 4px"}}>GC</th><th style={{padding:"3px 4px",fontWeight:800}}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {[...(g.tabla||[])].sort((a,b)=>b.pts-a.pts).map((r,ri)=>(
                    <Fragment key={ri}>
                      <tr style={{borderTop:`1px solid ${C.border}`,background:formato==="liga"&&ri<8?compColor+"0d":"transparent"}}>
                        <td style={{padding:"3px 4px",fontWeight:700,color:C.text}}>{formato==="liga"&&ri<8?"🟢 ":""}{r.equipo}</td>
                        <td style={{padding:"3px 4px",textAlign:"center"}}>{r.pj}</td>
                        <td style={{padding:"3px 4px",textAlign:"center"}}>{r.pg}</td>
                        <td style={{padding:"3px 4px",textAlign:"center"}}>{r.pe}</td>
                        <td style={{padding:"3px 4px",textAlign:"center"}}>{r.pp}</td>
                        <td style={{padding:"3px 4px",textAlign:"center"}}>{r.gf}</td>
                        <td style={{padding:"3px 4px",textAlign:"center"}}>{r.gc}</td>
                        <td style={{padding:"3px 4px",textAlign:"center",fontWeight:800,color:compColor}}>{r.pts}</td>
                      </tr>
                      {formato==="liga"&&ri===7&&(
                        <tr><td colSpan={8} style={{padding:"4px 0",textAlign:"center",fontSize:8,fontWeight:800,color:compColor,borderBottom:`2px dashed ${compColor}`}}>▲ Clasificados a Liguilla</td></tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Subir imagen o Excel */}
          {(g.equipos||[]).length>=2&&(
            <>
              <input ref={el=>{if(el)fileRef.current[gi]=el;}} type="file" accept="image/*" style={{display:"none"}}
                onChange={e=>{const f=e.target.files?.[0];if(f)processTableImage(f,gi);e.target.value="";}}/>
              <input ref={el=>{if(el)excelRef.current[gi]=el;}} type="file" accept=".xlsx,.xls" style={{display:"none"}}
                onChange={e=>{const f=e.target.files?.[0];if(f)processTableExcel(f,gi);e.target.value="";}}/>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>fileRef.current?.[gi]?.click()} disabled={uploadingIdx===gi}
                  style={{flex:1,padding:"6px",borderRadius:7,background:"transparent",border:`1px dashed ${compColor}`,color:compColor,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:uploadingIdx===gi?0.5:1}}>
                  {uploadingIdx===gi?"Leyendo…":"📷 Foto FC26"}
                </button>
                <button onClick={()=>excelRef.current?.[gi]?.click()} disabled={uploadingIdx===gi}
                  style={{flex:1,padding:"6px",borderRadius:7,background:"transparent",border:"1px dashed #27ae60",color:"#27ae60",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:uploadingIdx===gi?0.5:1}}>
                  {uploadingIdx===gi?"Leyendo…":"📋 Excel"}
                </button>
              </div>
              <div style={{fontSize:8,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginTop:4,textAlign:"center"}}>Formato Excel: A=Equipo, B=PJ, C=PG, D=PE, E=PP, F=GF, G=GC, H=Pts</div>
            </>
          )}
          {/* Vista previa editable */}
          {preview?.grupoIdx===gi&&(
            <div style={{marginTop:8,padding:8,borderRadius:8,border:`1.5px solid #f0ad4e`,background:"#fff3cd"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#856404",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>🔎 Vista previa — corrige si algo está mal antes de confirmar</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {preview.filas.map((f,fi)=>(
                  <div key={fi} style={{display:"flex",gap:4,alignItems:"center"}}>
                    <select value={f.equipo} onChange={e=>updatePreviewCell(fi,"equipo",e.target.value)}
                      style={{flex:2,padding:"3px 5px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:9,fontFamily:"'DM Sans',sans-serif"}}>
                      <option value="">—</option>
                      {(g.equipos||[]).map(eq=><option key={eq} value={eq}>{eq}</option>)}
                    </select>
                    {["pj","pg","pe","pp","gf","gc","pts"].map(field=>(
                      <input key={field} type="number" value={f[field]} onChange={e=>updatePreviewCell(fi,field,e.target.value)}
                        style={{width:32,padding:"3px 2px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:9,textAlign:"center",fontFamily:"monospace"}}/>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:6,marginTop:6}}>
                <button onClick={confirmPreview}
                  style={{flex:1,padding:"6px",borderRadius:7,background:"#27ae60",color:"#fff",border:"none",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  ✅ Confirmar y guardar
                </button>
                <button onClick={()=>setPreview(null)}
                  style={{padding:"6px 12px",borderRadius:7,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {formato!=="liga"&&(
        <button onClick={addGrupo}
          style={{padding:"8px",borderRadius:8,background:"transparent",border:`1.5px dashed ${compColor}`,color:compColor,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          + Agregar grupo
        </button>
      )}
    </div>
  );
}

// ─── COMPETENCIA: GOLEADORES Y ASISTENCIAS (tabla general por imagen) ────────
function CompetenciaGoleadoresSetup({compId,compName,compColor,setAiMsg}){
  const[data,setData]=useState(null); // {goleadores:[{nombre,equipo,goles}], asistencias:[{nombre,equipo,asistencias}]}
  const[uploading,setUploading]=useState(null); // "goleadores" | "asistencias" | null
  const[preview,setPreview]=useState(null); // {tipo, filas:[...]}
  const fileRefGol=useRef(null);
  const fileRefAsist=useRef(null);
  const excelRefGol=useRef(null);
  const excelRefAsist=useRef(null);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","competenciaData"),snap=>{
      const all=snap.exists()?snap.data():{};
      const d=all[compId]||{};
      setData({goleadores:d.goleadores||[],asistencias:d.asistencias||[]});
    });
    return unsub;
  },[compId]);

  const saveTabla=async(tipo,filas)=>{
    const ref=doc(db,"config","competenciaData");
    const snap=await getDoc(ref).catch(()=>null);
    const current=snap?.exists()?snap.data():{};
    const compData=current[compId]||{};
    await setDoc(ref,{...current,[compId]:{...compData,[tipo]:filas}},{merge:true});
  };

  const processImage=async(file,tipo)=>{
    setUploading(tipo);
    setAiMsg("Leyendo imagen…");
    try{
      const b64=await new Promise((res,rej)=>{
        const r=new FileReader();
        r.onload=()=>res(r.result.split(",")[1]);
        r.onerror=()=>rej(new Error("FileReader error"));
        r.readAsDataURL(file);
      });
      setAiMsg("Conectando con Gemini…");
      const campo=tipo==="goleadores"?"goles":"asistencias";
      const prompt=tipo==="goleadores"
        ?`Analiza esta captura de la tabla de máximos goleadores de FC26. Para cada fila extrae el nombre del jugador, el equipo y el número de goles. Responde SOLO con JSON sin markdown, sin texto adicional: {"filas":[{"nombre":"","equipo":"","goles":0}]}`
        :`Analiza esta captura de la tabla de máximos asistentes de FC26. Para cada fila extrae el nombre del jugador, el equipo y el número de asistencias. Responde SOLO con JSON sin markdown, sin texto adicional: {"filas":[{"nombre":"","equipo":"","asistencias":0}]}`;
      const GEMINI_KEY="AIzaSyAGlxjD12k38Xu9L-8K165iJma1ZwR7tyY";
      const GEMINI_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
      const body=JSON.stringify({contents:[{parts:[{inline_data:{mime_type:file.type||"image/jpeg",data:b64}},{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:2000}});
      const resp=await fetch(GEMINI_URL,{method:"POST",headers:{"Content-Type":"application/json"},body});
      if(!resp.ok){
        const errTxt=await resp.text().catch(()=>"");
        throw new Error(`HTTP ${resp.status} ${errTxt.slice(0,200)}`);
      }
      const respData=await resp.json();
      if(respData.error) throw new Error(respData.error.message);
      const raw=respData.candidates?.[0]?.content?.parts?.[0]?.text;
      if(!raw) throw new Error("Respuesta vacía de Gemini");
      const cleaned=raw.replace(/```json|```/g,"").trim();
      let parsed;
      try{ parsed=JSON.parse(cleaned); }
      catch{ throw new Error("No se pudo interpretar el JSON: "+cleaned.slice(0,150)); }
      const filas=(parsed.filas||[]).map(f=>({
        nombre:f.nombre||"",
        equipo:f.equipo||"",
        [campo]:Number(f[campo])||0
      }));
      if(filas.length===0) throw new Error("No se detectaron filas en la imagen");
      setPreview({tipo,filas});
      setAiMsg(`✅ ${filas.length} filas leídas — revisa y confirma abajo`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setUploading(null);
  };

  const processExcel=async(file,tipo)=>{
    setUploading(tipo);
    setAiMsg("Leyendo Excel…");
    try{
      await new Promise((res,rej)=>{
        if(window.XLSX){res();return;}
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
      const campo=tipo==="goleadores"?"goles":"asistencias";
      const buf=await file.arrayBuffer();
      const wb=window.XLSX.read(buf,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=window.XLSX.utils.sheet_to_json(ws,{header:1});
      const filas=[];
      for(const row of rows){
        if(!row||row.every(v=>!v&&v!==0)) continue;
        const nombre=row[0]?String(row[0]).trim():"";
        if(!nombre) continue;
        if(nombre.toUpperCase()==="JUGADOR"||nombre.toUpperCase()==="NOMBRE") continue; // skip header
        filas.push({nombre,equipo:row[1]?String(row[1]).trim():"",[campo]:Number(row[2])||0});
      }
      if(filas.length===0) throw new Error(`No se encontraron filas válidas. Usa: A=Jugador, B=Equipo, C=${campo==="goles"?"Goles":"Asistencias"}.`);
      setPreview({tipo,filas});
      setAiMsg(`✅ ${filas.length} filas leídas del Excel — revisa y confirma abajo`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setUploading(null);
  };

  const confirmPreview=async()=>{
    if(!preview) return;
    // Detectar líder anterior (solo para goleadores)
    let liderAntes=null;
    if(preview.tipo==="goleadores"){
      liderAntes=[...(data.goleadores||[])].sort((a,b)=>(b.goles||0)-(a.goles||0))[0]?.nombre||null;
    }
    await saveTabla(preview.tipo,preview.filas);
    if(preview.tipo==="goleadores"){
      const liderDespues=[...preview.filas].sort((a,b)=>(b.goles||0)-(a.goles||0))[0];
      if(liderDespues&&liderDespues.nombre!==liderAntes){
        await addNoticia(`${liderDespues.nombre} (${liderDespues.equipo}) es el nuevo goleador de ${compName} con ${liderDespues.goles} goles`,"⚽");
      }
    }
    setAiMsg(`✅ Tabla de ${preview.tipo} actualizada`);
    setPreview(null);
  };

  const updatePreviewCell=(fi,field,val)=>{
    const filas=[...preview.filas];
    const campo=preview.tipo==="goleadores"?"goles":"asistencias";
    filas[fi]={...filas[fi],[field]:field===campo?Number(val)||0:val};
    setPreview({...preview,filas});
  };

  const addPreviewRow=()=>{
    const campo=preview.tipo==="goleadores"?"goles":"asistencias";
    setPreview({...preview,filas:[...preview.filas,{nombre:"",equipo:"",[campo]:0}]});
  };

  const removePreviewRow=(fi)=>{
    setPreview({...preview,filas:preview.filas.filter((_,i)=>i!==fi)});
  };

  if(!data) return <div style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Cargando…</div>;

  const renderTabla=(tipo,titulo,emoji,filas,fileRef,excelRef)=>{
    const campo=tipo==="goleadores"?"goles":"asistencias";
    return(
      <div style={{background:C.card,borderRadius:9,padding:"10px 12px",border:`1.5px solid ${filas.length>0?compColor:C.border}`}}>
        <div style={{fontSize:11,fontWeight:800,color:compColor,fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>{emoji} {titulo}</div>
        {filas.length>0&&(
          <div style={{overflowX:"auto",marginBottom:8}}>
            <table style={{width:"100%",fontSize:9,fontFamily:"'DM Sans',sans-serif",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{color:C.textFaint}}>
                  <th style={{textAlign:"left",padding:"3px 4px"}}>Jugador</th>
                  <th style={{textAlign:"left",padding:"3px 4px"}}>Equipo</th>
                  <th style={{padding:"3px 4px",fontWeight:800}}>{campo==="goles"?"Goles":"Asist."}</th>
                </tr>
              </thead>
              <tbody>
                {[...filas].sort((a,b)=>(b[campo]||0)-(a[campo]||0)).map((r,ri)=>(
                  <tr key={ri} style={{borderTop:`1px solid ${C.border}`}}>
                    <td style={{padding:"3px 4px",fontWeight:700,color:C.text}}>{r.nombre}</td>
                    <td style={{padding:"3px 4px",color:C.textFaint}}>{r.equipo}</td>
                    <td style={{padding:"3px 4px",textAlign:"center",fontWeight:800,color:compColor}}>{r[campo]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{const f=e.target.files?.[0];if(f)processImage(f,tipo);e.target.value="";}}/>
        <input ref={excelRef} type="file" accept=".xlsx,.xls" style={{display:"none"}}
          onChange={e=>{const f=e.target.files?.[0];if(f)processExcel(f,tipo);e.target.value="";}}/>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>fileRef.current?.click()} disabled={uploading===tipo}
            style={{flex:1,padding:"6px",borderRadius:7,background:"transparent",border:`1px dashed ${compColor}`,color:compColor,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:uploading===tipo?0.5:1}}>
            {uploading===tipo?"Leyendo…":"📷 Foto FC26"}
          </button>
          <button onClick={()=>excelRef.current?.click()} disabled={uploading===tipo}
            style={{flex:1,padding:"6px",borderRadius:7,background:"transparent",border:"1px dashed #27ae60",color:"#27ae60",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:uploading===tipo?0.5:1}}>
            {uploading===tipo?"Leyendo…":"📋 Excel"}
          </button>
        </div>
        <div style={{fontSize:8,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginTop:4,textAlign:"center"}}>Formato Excel: A=Jugador, B=Equipo, C={campo==="goles"?"Goles":"Asistencias"}</div>
        {/* Vista previa editable */}
        {preview?.tipo===tipo&&(
          <div style={{marginTop:8,padding:8,borderRadius:8,border:`1.5px solid #f0ad4e`,background:"#fff3cd"}}>
            <div style={{fontSize:10,fontWeight:800,color:"#856404",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>🔎 Vista previa — corrige si algo está mal antes de confirmar</div>
            <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:240,overflowY:"auto"}}>
              {preview.filas.map((f,fi)=>(
                <div key={fi} style={{display:"flex",gap:4,alignItems:"center"}}>
                  <input value={f.nombre} onChange={e=>updatePreviewCell(fi,"nombre",e.target.value)} placeholder="Jugador"
                    style={{flex:2,padding:"3px 5px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:9,fontFamily:"'DM Sans',sans-serif"}}/>
                  <input value={f.equipo} onChange={e=>updatePreviewCell(fi,"equipo",e.target.value)} placeholder="Equipo"
                    style={{flex:2,padding:"3px 5px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:9,fontFamily:"'DM Sans',sans-serif"}}/>
                  <input type="number" value={f[campo]} onChange={e=>updatePreviewCell(fi,campo,e.target.value)}
                    style={{width:40,padding:"3px 2px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:9,textAlign:"center",fontFamily:"monospace"}}/>
                  <button onClick={()=>removePreviewRow(fi)} style={{background:"transparent",border:"none",color:"#c0392b",fontSize:11,cursor:"pointer"}}>✕</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginTop:6}}>
              <button onClick={addPreviewRow}
                style={{padding:"5px 10px",borderRadius:7,background:"transparent",border:`1px dashed ${compColor}`,color:compColor,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                + Fila
              </button>
              <button onClick={confirmPreview}
                style={{flex:1,padding:"6px",borderRadius:7,background:"#27ae60",color:"#fff",border:"none",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                ✅ Confirmar y guardar
              </button>
              <button onClick={()=>setPreview(null)}
                style={{padding:"6px 12px",borderRadius:7,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>
        Sube una foto de la tabla general de goleadores o asistencias de FC26 para esta competencia. La IA leerá los datos y podrás corregirlos antes de guardar.
      </div>
      {renderTabla("goleadores","Goleadores","⚽",data.goleadores,fileRefGol,excelRefGol)}
      {renderTabla("asistencias","Asistencias","🎯",data.asistencias,fileRefAsist,excelRefAsist)}
    </div>
  );
}

// ─── COMPETENCIA: RESULTADO DE PARTIDO (por imagen, actualiza tabla) ─────────
function CompetenciaResultadoSetup({compId,compName,compColor,formato,setAiMsg}){
  const[grupos,setGrupos]=useState([]);
  const[uploading,setUploading]=useState(false);
  const[preview,setPreview]=useState(null); // {local,golesLocal,visitante,golesVisitante}
  const fileRef=useRef(null);
  const excelRef=useRef(null);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","competenciaData"),snap=>{
      const all=snap.exists()?snap.data():{};
      const d=all[compId]||{grupos:[]};
      setGrupos(d.grupos||[]);
    });
    return unsub;
  },[compId]);

  // Lista de todos los equipos disponibles en esta competencia (de todos los grupos)
  const todosEquipos=[...new Set(grupos.flatMap(g=>g.equipos||[]))];

  const processImage=async(file)=>{
    setUploading(true);
    setAiMsg("Leyendo imagen…");
    try{
      const b64=await new Promise((res,rej)=>{
        const r=new FileReader();
        r.onload=()=>res(r.result.split(",")[1]);
        r.onerror=()=>rej(new Error("FileReader error"));
        r.readAsDataURL(file);
      });
      setAiMsg("Conectando con Gemini…");
      const listaEquipos=todosEquipos.join(", ");
      const prompt=`Analiza esta captura de un resultado de partido de FC26. Los equipos posibles son: ${listaEquipos}. Identifica el equipo local, el equipo visitante (usa EXACTAMENTE uno de los nombres de la lista que mejor coincida) y el marcador de cada uno. Responde SOLO con JSON sin markdown, sin texto adicional: {"local":"","golesLocal":0,"visitante":"","golesVisitante":0}`;
      const GEMINI_KEY="AIzaSyAGlxjD12k38Xu9L-8K165iJma1ZwR7tyY";
      const GEMINI_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
      const body=JSON.stringify({contents:[{parts:[{inline_data:{mime_type:file.type||"image/jpeg",data:b64}},{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:500}});
      const resp=await fetch(GEMINI_URL,{method:"POST",headers:{"Content-Type":"application/json"},body});
      if(!resp.ok){
        const errTxt=await resp.text().catch(()=>"");
        throw new Error(`HTTP ${resp.status} ${errTxt.slice(0,200)}`);
      }
      const respData=await resp.json();
      if(respData.error) throw new Error(respData.error.message);
      const raw=respData.candidates?.[0]?.content?.parts?.[0]?.text;
      if(!raw) throw new Error("Respuesta vacía de Gemini");
      const cleaned=raw.replace(/```json|```/g,"").trim();
      let parsed;
      try{ parsed=JSON.parse(cleaned); }
      catch{ throw new Error("No se pudo interpretar el JSON: "+cleaned.slice(0,150)); }
      setPreview({
        local:parsed.local||"",golesLocal:Number(parsed.golesLocal)||0,
        visitante:parsed.visitante||"",golesVisitante:Number(parsed.golesVisitante)||0
      });
      setAiMsg("✅ Resultado leído — revisa y confirma abajo");
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setUploading(false);
  };

  const confirmPreview=async()=>{
    if(!preview) return;
    if(!preview.local||!preview.visitante){setAiMsg("❌ Define ambos equipos");return;}
    if(preview.local===preview.visitante){setAiMsg("❌ Los equipos no pueden ser el mismo");return;}
    const gl=Number(preview.golesLocal)||0,gv=Number(preview.golesVisitante)||0;
    const updTabla=(g,sel,gf,gc)=>{
      const tabla=[...(g.tabla||[])];
      const idx=tabla.findIndex(r=>r.equipo===sel);
      if(idx===-1) return g;
      const row={...tabla[idx]};
      row.pj=(row.pj||0)+1;row.gf=(row.gf||0)+gf;row.gc=(row.gc||0)+gc;
      row.pg=(row.pg||0)+(gf>gc?1:0);row.pe=(row.pe||0)+(gf===gc?1:0);row.pp=(row.pp||0)+(gf<gc?1:0);
      row.pts=(row.pts||0)+(gf>gc?3:gf===gc?1:0);
      tabla[idx]=row;
      return {...g,tabla};
    };
    // Líder antes del cambio (en el grupo afectado)
    const grupoAfectado=grupos.find(g=>(g.equipos||[]).includes(preview.local)||(g.equipos||[]).includes(preview.visitante));
    const liderAntes=grupoAfectado?[...(grupoAfectado.tabla||[])].sort((a,b)=>b.pts-a.pts)[0]?.equipo:null;

    let nuevosGrupos=grupos.map(g=>{
      let ng=g;
      if((g.equipos||[]).includes(preview.local)) ng=updTabla(ng,preview.local,gl,gv);
      if((g.equipos||[]).includes(preview.visitante)) ng=updTabla(ng,preview.visitante,gv,gl);
      return ng;
    });
    const ref=doc(db,"config","competenciaData");
    const snap=await getDoc(ref).catch(()=>null);
    const current=snap?.exists()?snap.data():{};
    const compData=current[compId]||{};
    await setDoc(ref,{...current,[compId]:{...compData,grupos:nuevosGrupos}},{merge:true});

    // Historial H2H (permanente)
    await addH2H({local:preview.local,golesLocal:gl,visitante:preview.visitante,golesVisitante:gv,competencia:compName});

    // Noticia del resultado
    const resultadoTxt=gl>gv?`${preview.local} venció ${gl}-${gv} a ${preview.visitante}`
      :gv>gl?`${preview.visitante} venció ${gv}-${gl} a ${preview.local}`
      :`${preview.local} y ${preview.visitante} empataron ${gl}-${gv}`;
    await addNoticia(`${resultadoTxt} en ${compName}`,"⚽");

    // Noticia de cambio de líder
    const nuevoGrupoAfectado=nuevosGrupos.find(g=>(g.equipos||[]).includes(preview.local)||(g.equipos||[]).includes(preview.visitante));
    const liderDespues=nuevoGrupoAfectado?[...(nuevoGrupoAfectado.tabla||[])].sort((a,b)=>b.pts-a.pts)[0]?.equipo:null;
    if(liderDespues&&liderDespues!==liderAntes){
      await addNoticia(`Nuevo líder de ${compName}: ${liderDespues}`,"👑");
    }

    setAiMsg(`✅ ${preview.local} ${gl} - ${gv} ${preview.visitante} aplicado a la tabla`);
    setPreview(null);
  };

  const processExcelBulk=async(file)=>{
    setUploading(true);
    setAiMsg("Leyendo Excel…");
    try{
      await new Promise((res,rej)=>{
        if(window.XLSX){res();return;}
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
      const buf=await file.arrayBuffer();
      const wb=window.XLSX.read(buf,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=window.XLSX.utils.sheet_to_json(ws,{header:1});
      const partidos=[];
      for(const row of rows){
        if(!row||row.every(v=>!v&&v!==0)) continue;
        const local=row[0]?String(row[0]).trim():"";
        if(!local) continue;
        if(local.toUpperCase()==="LOCAL"||local.toUpperCase()==="EQUIPO") continue; // skip header
        const visitante=row[2]?String(row[2]).trim():"";
        const golesLocal=Number(row[1])||0;
        const golesVisitante=Number(row[3])||0;
        if(!visitante) continue;
        if(!todosEquipos.includes(local)||!todosEquipos.includes(visitante)){
          partidos.push({local,golesLocal,visitante,golesVisitante,error:"Equipo no reconocido"});
          continue;
        }
        partidos.push({local,golesLocal,visitante,golesVisitante});
      }
      const validos=partidos.filter(p=>!p.error);
      if(validos.length===0) throw new Error("No se encontraron partidos válidos. Usa: A=Local, B=Goles Local, C=Visitante, D=Goles Visitante.");

      const updTabla=(g,sel,gf,gc)=>{
        const tabla=[...(g.tabla||[])];
        const idx=tabla.findIndex(r=>r.equipo===sel);
        if(idx===-1) return g;
        const row={...tabla[idx]};
        row.pj=(row.pj||0)+1;row.gf=(row.gf||0)+gf;row.gc=(row.gc||0)+gc;
        row.pg=(row.pg||0)+(gf>gc?1:0);row.pe=(row.pe||0)+(gf===gc?1:0);row.pp=(row.pp||0)+(gf<gc?1:0);
        row.pts=(row.pts||0)+(gf>gc?3:gf===gc?1:0);
        tabla[idx]=row;
        return {...g,tabla};
      };

      let nuevosGrupos=[...grupos];
      for(const p of validos){
        const gl=p.golesLocal,gv=p.golesVisitante;
        nuevosGrupos=nuevosGrupos.map(g=>{
          let ng=g;
          if((g.equipos||[]).includes(p.local)) ng=updTabla(ng,p.local,gl,gv);
          if((g.equipos||[]).includes(p.visitante)) ng=updTabla(ng,p.visitante,gv,gl);
          return ng;
        });
        await addH2H({local:p.local,golesLocal:gl,visitante:p.visitante,golesVisitante:gv,competencia:compName});
        const resultadoTxt=gl>gv?`${p.local} venció ${gl}-${gv} a ${p.visitante}`
          :gv>gl?`${p.visitante} venció ${gv}-${gl} a ${p.local}`
          :`${p.local} y ${p.visitante} empataron ${gl}-${gv}`;
        await addNoticia(`${resultadoTxt} en ${compName}`,"⚽");
      }
      const ref=doc(db,"config","competenciaData");
      const snap=await getDoc(ref).catch(()=>null);
      const current=snap?.exists()?snap.data():{};
      const compData=current[compId]||{};
      await setDoc(ref,{...current,[compId]:{...compData,grupos:nuevosGrupos}},{merge:true});

      const conError=partidos.filter(p=>p.error);
      setAiMsg(`✅ ${validos.length} partidos aplicados a la tabla.${conError.length?` ⚠️ ${conError.length} omitidos por nombre no reconocido: ${conError.map(p=>`${p.local} vs ${p.visitante}`).join(", ")}`:""}`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setUploading(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>
        Sube una foto del resultado de un partido. La IA leerá el marcador y actualizará automáticamente PJ/PG/PE/PP/GF/GC/Pts de ambos equipos en la tabla.
      </div>
      <div style={{background:C.card,borderRadius:9,padding:"10px 12px",border:`1.5px solid ${C.border}`}}>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{const f=e.target.files?.[0];if(f)processImage(f);e.target.value="";}}/>
        <input ref={excelRef} type="file" accept=".xlsx,.xls" style={{display:"none"}}
          onChange={e=>{const f=e.target.files?.[0];if(f)processExcelBulk(f);e.target.value="";}}/>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>fileRef.current?.click()} disabled={uploading||todosEquipos.length===0}
            style={{flex:1,padding:"8px",borderRadius:7,background:"transparent",border:`1.5px dashed ${compColor}`,color:compColor,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:(uploading||todosEquipos.length===0)?0.5:1}}>
            {uploading?"Leyendo…":todosEquipos.length===0?"Primero configura equipos":"📷 Foto del resultado"}
          </button>
          <button onClick={()=>excelRef.current?.click()} disabled={uploading||todosEquipos.length===0}
            style={{flex:1,padding:"8px",borderRadius:7,background:"transparent",border:"1.5px dashed #27ae60",color:"#27ae60",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:(uploading||todosEquipos.length===0)?0.5:1}}>
            {uploading?"Leyendo…":todosEquipos.length===0?"Primero configura equipos":"📋 Excel (varios partidos)"}
          </button>
        </div>
        <div style={{fontSize:8,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginTop:4,textAlign:"center"}}>Formato Excel: A=Local, B=Goles Local, C=Visitante, D=Goles Visitante (una fila por partido, aplica directo sin vista previa)</div>
        {preview&&(
          <div style={{marginTop:8,padding:8,borderRadius:8,border:`1.5px solid #f0ad4e`,background:"#fff3cd"}}>
            <div style={{fontSize:10,fontWeight:800,color:"#856404",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>🔎 Vista previa — corrige si algo está mal antes de confirmar</div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <select value={preview.local} onChange={e=>setPreview({...preview,local:e.target.value})}
                style={{flex:1,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
                <option value="">— Local —</option>
                {todosEquipos.map(eq=><option key={eq} value={eq}>{eq}</option>)}
              </select>
              <input type="number" value={preview.golesLocal} onChange={e=>setPreview({...preview,golesLocal:Number(e.target.value)||0})}
                style={{width:48,padding:"6px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:13,fontWeight:800,textAlign:"center",fontFamily:"monospace"}}/>
            </div>
            <div style={{textAlign:"center",fontSize:9,color:C.textFaint,marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>VS</div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
              <select value={preview.visitante} onChange={e=>setPreview({...preview,visitante:e.target.value})}
                style={{flex:1,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
                <option value="">— Visitante —</option>
                {todosEquipos.map(eq=><option key={eq} value={eq}>{eq}</option>)}
              </select>
              <input type="number" value={preview.golesVisitante} onChange={e=>setPreview({...preview,golesVisitante:Number(e.target.value)||0})}
                style={{width:48,padding:"6px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:13,fontWeight:800,textAlign:"center",fontFamily:"monospace"}}/>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={confirmPreview}
                style={{flex:1,padding:"7px",borderRadius:7,background:"#27ae60",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                ✅ Confirmar y aplicar a la tabla
              </button>
              <button onClick={()=>setPreview(null)}
                style={{padding:"7px 12px",borderRadius:7,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPETENCIA: FIXTURE (calendario por imagen) ────────────────────────────
function CompetenciaFixtureSetup({compId,compColor,setAiMsg}){
  const[grupos,setGrupos]=useState([]);
  const[fixture,setFixture]=useState({}); // {jornadaKey:[{local,visitante}]}
  const[uploading,setUploading]=useState(false);
  const[preview,setPreview]=useState(null); // {jornada, partidos:[{local,visitante}]}
  const fileRef=useRef(null);
  const excelRef=useRef(null);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","competenciaData"),snap=>{
      const all=snap.exists()?snap.data():{};
      const d=all[compId]||{};
      setGrupos(d.grupos||[]);
      setFixture(d.fixture||{});
    });
    return unsub;
  },[compId]);

  const todosEquipos=[...new Set(grupos.flatMap(g=>g.equipos||[]))];

  const saveFixture=async(nuevo)=>{
    const ref=doc(db,"config","competenciaData");
    const snap=await getDoc(ref).catch(()=>null);
    const current=snap?.exists()?snap.data():{};
    const compData=current[compId]||{};
    await setDoc(ref,{...current,[compId]:{...compData,fixture:nuevo}},{merge:true});
  };

  const processImage=async(file)=>{
    setUploading(true);
    setAiMsg("Leyendo imagen…");
    try{
      const b64=await new Promise((res,rej)=>{
        const r=new FileReader();
        r.onload=()=>res(r.result.split(",")[1]);
        r.onerror=()=>rej(new Error("FileReader error"));
        r.readAsDataURL(file);
      });
      setAiMsg("Conectando con Gemini…");
      const listaEquipos=todosEquipos.join(", ");
      const prompt=`Analiza esta captura del fixture/calendario de partidos de FC26. Los equipos posibles son: ${listaEquipos}. Identifica el número o nombre de la jornada (ej "Jornada 1") y la lista de partidos (local vs visitante, usa EXACTAMENTE los nombres de la lista que mejor coincidan). Si hay varias jornadas en la imagen, incluye solo la primera. Responde SOLO con JSON sin markdown, sin texto adicional: {"jornada":"Jornada 1","partidos":[{"local":"","visitante":""}]}`;
      const GEMINI_KEY="AIzaSyAGlxjD12k38Xu9L-8K165iJma1ZwR7tyY";
      const GEMINI_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
      const body=JSON.stringify({contents:[{parts:[{inline_data:{mime_type:file.type||"image/jpeg",data:b64}},{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:1500}});
      const resp=await fetch(GEMINI_URL,{method:"POST",headers:{"Content-Type":"application/json"},body});
      if(!resp.ok){
        const errTxt=await resp.text().catch(()=>"");
        throw new Error(`HTTP ${resp.status} ${errTxt.slice(0,200)}`);
      }
      const respData=await resp.json();
      if(respData.error) throw new Error(respData.error.message);
      const raw=respData.candidates?.[0]?.content?.parts?.[0]?.text;
      if(!raw) throw new Error("Respuesta vacía de Gemini");
      const cleaned=raw.replace(/```json|```/g,"").trim();
      let parsed;
      try{ parsed=JSON.parse(cleaned); }
      catch{ throw new Error("No se pudo interpretar el JSON: "+cleaned.slice(0,150)); }
      const partidos=(parsed.partidos||[]).map(p=>({local:p.local||"",visitante:p.visitante||""}));
      if(partidos.length===0) throw new Error("No se detectaron partidos en la imagen");
      setPreview({jornada:parsed.jornada||"Jornada 1",partidos});
      setAiMsg(`✅ ${partidos.length} partidos leídos — revisa y confirma abajo`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setUploading(false);
  };

  const confirmPreview=async()=>{
    if(!preview) return;
    if(!preview.jornada.trim()){setAiMsg("❌ Define el nombre de la jornada");return;}
    const jKey=preview.jornada.trim().replace(/\s+/g,"_");
    const nuevo={...fixture,[jKey]:preview.partidos.filter(p=>p.local&&p.visitante)};
    await saveFixture(nuevo);
    setAiMsg(`✅ ${preview.jornada} guardada (${preview.partidos.length} partidos)`);
    setPreview(null);
  };

  const processExcelFixture=async(file)=>{
    setUploading(true);
    setAiMsg("Leyendo Excel…");
    try{
      await new Promise((res,rej)=>{
        if(window.XLSX){res();return;}
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
      const buf=await file.arrayBuffer();
      const wb=window.XLSX.read(buf,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=window.XLSX.utils.sheet_to_json(ws,{header:1});
      const porJornada={}; // {nombreJornada:[{local,visitante}]}
      for(const row of rows){
        if(!row||row.every(v=>!v&&v!==0)) continue;
        const jornada=row[0]?String(row[0]).trim():"";
        if(!jornada) continue;
        if(jornada.toUpperCase()==="JORNADA") continue; // skip header
        const local=row[1]?String(row[1]).trim():"";
        const visitante=row[2]?String(row[2]).trim():"";
        if(!local||!visitante) continue;
        if(!porJornada[jornada]) porJornada[jornada]=[];
        porJornada[jornada].push({local,visitante});
      }
      const nombresJornada=Object.keys(porJornada);
      if(nombresJornada.length===0) throw new Error("No se encontraron filas válidas. Usa: A=Jornada, B=Local, C=Visitante.");
      const nuevo={...fixture};
      nombresJornada.forEach(j=>{
        const jKey=j.replace(/\s+/g,"_");
        nuevo[jKey]=porJornada[j];
      });
      await saveFixture(nuevo);
      const totalPartidos=Object.values(porJornada).reduce((s,p)=>s+p.length,0);
      setAiMsg(`✅ ${nombresJornada.length} jornada(s) y ${totalPartidos} partidos guardados desde Excel`);
    }catch(e){
      setAiMsg("❌ "+e.message);
    }
    setUploading(false);
  };

  const updatePreviewPartido=(pi,field,val)=>{
    const partidos=[...preview.partidos];
    partidos[pi]={...partidos[pi],[field]:val};
    setPreview({...preview,partidos});
  };

  const addPreviewPartido=()=>{
    setPreview({...preview,partidos:[...preview.partidos,{local:"",visitante:""}]});
  };

  const removePreviewPartido=(pi)=>{
    setPreview({...preview,partidos:preview.partidos.filter((_,i)=>i!==pi)});
  };

  const removeJornada=async(jKey)=>{
    if(!window.confirm(`¿Eliminar ${jKey.replace(/_/g," ")} del fixture?`)) return;
    const nuevo={...fixture};
    delete nuevo[jKey];
    await saveFixture(nuevo);
    setAiMsg(`✅ Jornada eliminada`);
  };

  const jornadas=Object.keys(fixture).sort();

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>
        Sube una foto del fixture/calendario (una jornada a la vez). La IA detectará los enfrentamientos y podrás corregirlos antes de guardar.
      </div>

      {/* Jornadas guardadas */}
      {jornadas.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {jornadas.map(jKey=>(
            <div key={jKey} style={{background:C.card,borderRadius:9,padding:"8px 12px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,fontWeight:800,color:compColor,fontFamily:"'DM Sans',sans-serif"}}>{jKey.replace(/_/g," ")}</span>
                <button onClick={()=>removeJornada(jKey)} style={{background:"transparent",border:"none",color:"#c0392b",fontSize:11,cursor:"pointer"}}>🗑️</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {(fixture[jKey]||[]).map((p,pi)=>(
                  <div key={pi} style={{fontSize:10,color:C.textMid,fontFamily:"'DM Sans',sans-serif"}}>{p.local} <span style={{color:C.textFaint}}>vs</span> {p.visitante}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subir imagen */}
      <div style={{background:C.card,borderRadius:9,padding:"10px 12px",border:`1.5px solid ${C.border}`}}>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{const f=e.target.files?.[0];if(f)processImage(f);e.target.value="";}}/>
        <button onClick={()=>fileRef.current?.click()} disabled={uploading||todosEquipos.length===0}
          style={{width:"100%",padding:"8px",borderRadius:7,background:"transparent",border:`1.5px dashed ${compColor}`,color:compColor,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:(uploading||todosEquipos.length===0)?0.5:1}}>
          {uploading?"Leyendo…":todosEquipos.length===0?"Primero configura equipos en Tabla":"📷 Subir foto de jornada"}
        </button>

        {/* Vista previa editable */}
        {preview&&(
          <div style={{marginTop:8,padding:8,borderRadius:8,border:`1.5px solid #f0ad4e`,background:"#fff3cd"}}>
            <div style={{fontSize:10,fontWeight:800,color:"#856404",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>🔎 Vista previa — corrige si algo está mal antes de confirmar</div>
            <input value={preview.jornada} onChange={e=>setPreview({...preview,jornada:e.target.value})} placeholder="Nombre de la jornada"
              style={{width:"100%",padding:"6px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginBottom:6}}/>
            <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:240,overflowY:"auto"}}>
              {preview.partidos.map((p,pi)=>(
                <div key={pi} style={{display:"flex",gap:4,alignItems:"center"}}>
                  <select value={p.local} onChange={e=>updatePreviewPartido(pi,"local",e.target.value)}
                    style={{flex:1,padding:"4px 6px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:9,fontFamily:"'DM Sans',sans-serif"}}>
                    <option value="">— Local —</option>
                    {todosEquipos.map(eq=><option key={eq} value={eq}>{eq}</option>)}
                  </select>
                  <span style={{fontSize:9,color:C.textFaint}}>vs</span>
                  <select value={p.visitante} onChange={e=>updatePreviewPartido(pi,"visitante",e.target.value)}
                    style={{flex:1,padding:"4px 6px",borderRadius:6,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:9,fontFamily:"'DM Sans',sans-serif"}}>
                    <option value="">— Visitante —</option>
                    {todosEquipos.map(eq=><option key={eq} value={eq}>{eq}</option>)}
                  </select>
                  <button onClick={()=>removePreviewPartido(pi)} style={{background:"transparent",border:"none",color:"#c0392b",fontSize:11,cursor:"pointer"}}>✕</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginTop:6}}>
              <button onClick={addPreviewPartido}
                style={{padding:"5px 10px",borderRadius:7,background:"transparent",border:`1px dashed ${compColor}`,color:compColor,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                + Partido
              </button>
              <button onClick={confirmPreview}
                style={{flex:1,padding:"6px",borderRadius:7,background:"#27ae60",color:"#fff",border:"none",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                ✅ Confirmar y guardar
              </button>
              <button onClick={()=>setPreview(null)}
                style={{padding:"6px 12px",borderRadius:7,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPETENCIA: APUESTAS ENTRE EQUIPOS ──────────────────────────────────────
function CompetenciaApuestasSetup({compId,compName,compColor,allTeams,setAiMsg}){
  const[apuestas,setApuestas]=useState([]);
  const[creando,setCreando]=useState(false);
  const[form,setForm]=useState({equipoA:"",equipoB:"",condicion:"",metrica:"posicion"});
  const[saving,setSaving]=useState(false);

  const eligibles=allTeams.filter(t=>(t.competencias||[]).includes(compId));

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","apuestas"),snap=>{
      const all=snap.exists()?snap.data():{};
      setApuestas((all.lista||[]).filter(a=>a.compId===compId));
    });
    return unsub;
  },[compId]);

  const saveApuestas=async(nuevaLista)=>{
    const ref=doc(db,"config","apuestas");
    const snap=await getDoc(ref).catch(()=>null);
    const current=snap?.exists()?snap.data():{};
    const otras=(current.lista||[]).filter(a=>a.compId!==compId);
    await setDoc(ref,{lista:[...otras,...nuevaLista]},{merge:true});
  };

  const crearApuesta=async()=>{
    if(!form.equipoA||!form.equipoB){setAiMsg("❌ Selecciona ambos equipos");return;}
    if(form.equipoA===form.equipoB){setAiMsg("❌ Los equipos no pueden ser el mismo");return;}
    if(!form.condicion.trim()){setAiMsg("❌ Escribe la condición de la apuesta");return;}
    setSaving(true);
    const nueva={
      id:`bet_${Date.now()}`,compId,equipoA:form.equipoA,equipoB:form.equipoB,
      condicion:form.condicion.trim(),metrica:form.metrica,estado:"activa",ganador:null,
      fecha:new Date().toISOString()
    };
    await saveApuestas([...apuestas,nueva]);
    await addNoticia(`🎲 Nueva apuesta en ${compName}: ${form.equipoA} vs ${form.equipoB} — ${form.condicion.trim()}`,"🎲");
    setForm({equipoA:"",equipoB:"",condicion:"",metrica:"posicion"});
    setCreando(false);
    setAiMsg("✅ Apuesta creada");
    setSaving(false);
  };

  const marcarGanador=async(apId,ganador)=>{
    const ap=apuestas.find(a=>a.id===apId);
    if(!ap) return;
    const nuevaLista=apuestas.map(a=>a.id===apId?{...a,estado:"cerrada",ganador}:a);
    await saveApuestas(nuevaLista);
    if(ganador){
      await addNoticia(`🎲 ${ganador} ganó la apuesta contra ${ganador===ap.equipoA?ap.equipoB:ap.equipoA} en ${compName}: ${ap.condicion}`,"🏆");
    }else{
      await addNoticia(`🎲 Apuesta cerrada sin ganador en ${compName}: ${ap.condicion}`,"🎲");
    }
    setAiMsg("✅ Apuesta cerrada");
  };

  const eliminarApuesta=async(apId)=>{
    if(!window.confirm("¿Eliminar esta apuesta?")) return;
    await saveApuestas(apuestas.filter(a=>a.id!==apId));
    setAiMsg("✅ Apuesta eliminada");
  };

  const metricaLabel={posicion:"Posición en tabla",puntos:"Puntos",gd:"Diferencia de goles",h2h:"Resultado directo (H2H)"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>
        Crea apuestas entre equipos con la condición que pactaron. El progreso se muestra en vivo según la métrica elegida; tú decides manualmente quién ganó al cerrarla.
      </div>

      {!creando&&(
        <button onClick={()=>setCreando(true)}
          style={{padding:"9px",borderRadius:8,background:compColor,color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          + Nueva apuesta
        </button>
      )}

      {creando&&(
        <div style={{background:C.card,borderRadius:10,padding:"12px",border:`1.5px solid ${compColor}`,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",gap:6}}>
            <select value={form.equipoA} onChange={e=>setForm({...form,equipoA:e.target.value})}
              style={{flex:1,padding:"7px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
              <option value="">— Equipo A —</option>
              {eligibles.map(t=><option key={t.uid||t.id} value={t.teamName}>{t.teamName}</option>)}
            </select>
            <select value={form.equipoB} onChange={e=>setForm({...form,equipoB:e.target.value})}
              style={{flex:1,padding:"7px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
              <option value="">— Equipo B —</option>
              {eligibles.map(t=><option key={t.uid||t.id} value={t.teamName}>{t.teamName}</option>)}
            </select>
          </div>
          <textarea value={form.condicion} onChange={e=>setForm({...form,condicion:e.target.value})} placeholder='Condición de la apuesta (ej: "El que termine más abajo paga la cena")'
            style={{padding:"8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:11,fontFamily:"'DM Sans',sans-serif",minHeight:50,resize:"vertical"}}/>
          <div>
            <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>Métrica a mostrar en vivo:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {Object.entries(metricaLabel).map(([key,label])=>(
                <button key={key} onClick={()=>setForm({...form,metrica:key})}
                  style={{padding:"5px 10px",borderRadius:20,border:`1.5px solid ${form.metrica===key?compColor:C.borderDark}`,background:form.metrica===key?compColor+"22":C.inputBg,color:form.metrica===key?compColor:C.textMid,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={crearApuesta} disabled={saving}
              style={{flex:1,padding:"8px",borderRadius:7,background:"#27ae60",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:saving?0.6:1}}>
              {saving?"Guardando…":"✅ Crear apuesta"}
            </button>
            <button onClick={()=>{setCreando(false);setForm({equipoA:"",equipoB:"",condicion:"",metrica:"posicion"});}}
              style={{padding:"8px 14px",borderRadius:7,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {apuestas.length===0&&!creando&&(
        <div style={{textAlign:"center",color:C.textFaint,padding:20,fontFamily:"'DM Sans',sans-serif",fontSize:11}}>Sin apuestas todavía</div>
      )}

      {apuestas.map(ap=>(
        <div key={ap.id} style={{background:C.card,borderRadius:10,padding:"10px 12px",border:`1.5px solid ${ap.estado==="activa"?compColor:C.border}`,opacity:ap.estado==="cerrada"?0.7:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{ap.equipoA} 🆚 {ap.equipoB}</span>
            <button onClick={()=>eliminarApuesta(ap.id)} style={{background:"none",border:"none",color:"#c0392b",cursor:"pointer",fontSize:12}}>🗑️</button>
          </div>
          <div style={{fontSize:11,color:C.textMid,fontFamily:"'DM Sans',sans-serif",marginBottom:8,fontStyle:"italic"}}>"{ap.condicion}"</div>
          <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Métrica: {metricaLabel[ap.metrica]||ap.metrica}</div>
          {ap.estado==="cerrada"?(
            <div style={{fontSize:11,fontWeight:800,color:"#27ae60",fontFamily:"'DM Sans',sans-serif"}}>
              {ap.ganador?`🏆 Ganó: ${ap.ganador}`:"Cerrada sin ganador"}
            </div>
          ):(
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>marcarGanador(ap.id,ap.equipoA)}
                style={{flex:1,padding:"6px",borderRadius:7,background:"transparent",border:"1px solid #27ae60",color:"#27ae60",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                🏆 Ganó {ap.equipoA}
              </button>
              <button onClick={()=>marcarGanador(ap.id,ap.equipoB)}
                style={{flex:1,padding:"6px",borderRadius:7,background:"transparent",border:"1px solid #27ae60",color:"#27ae60",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                🏆 Ganó {ap.equipoB}
              </button>
              <button onClick={()=>marcarGanador(ap.id,null)}
                style={{padding:"6px 10px",borderRadius:7,background:"transparent",border:`1px solid ${C.border}`,color:C.textFaint,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                Cerrar sin ganador
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── COMPETENCIAS MODAL ───────────────────────────────────────────────────────
function CompetenciasModal({allTeams,onClose}){
  const[comps,setComps]=useState(()=>COMPETENCIAS_AVAILABLE.map(c=>({...c})));

  const[selected,setSelected]=useState(null); // id de la comp activa
  const[subTab,setSubTab]=useState("equipos"); // equipos | grupos
  const[editingName,setEditingName]=useState(null); // id de la que se está renombrando
  const[aiMsg,setAiMsg]=useState("");
  const[editValue,setEditValue]=useState("");
  const[saving,setSaving]=useState(false);

  const activeComp=comps.find(c=>c.id===selected);

  const toggleTeam=async(team)=>{
    const cur=team.competencias||[];
    const hasIt=cur.includes(selected);
    const next=hasIt?cur.filter(x=>x!==selected):[...cur,selected];
    await updateDoc(doc(db,"teams",team.uid||team.id),{competencias:next});
  };

  const saveCompName=async(id)=>{
    if(!editValue.trim()) return;
    setSaving(true);
    // Guardar en Firestore config
    const settingsRef=doc(db,"config","competencias");
    const snap=await getDoc(settingsRef).catch(()=>null);
    const current=snap?.exists()?snap.data():{};
    await setDoc(settingsRef,{...current,[id]:editValue.trim()},{merge:true});
    setComps(prev=>prev.map(c=>c.id===id?{...c,name:editValue.trim()}:c));
    setEditingName(null);
    setEditValue("");
    setSaving(false);
  };

  const finalizarTemporada=async(compId)=>{
    const comp=comps.find(c=>c.id===compId);
    if(!window.confirm(`⚠️ Esto guardará el historial de "${comp.name}" y reiniciará tabla, fixture, goleadores, asistencias y desinscribirá a todos los equipos.\n\nEsta acción NO se puede deshacer. ¿Continuar?`)) return;
    if(!window.confirm("Última confirmación: ¿FINALIZAR TEMPORADA de verdad?")) return;
    setSaving(true);
    const ref=doc(db,"config","competenciaData");
    const snap=await getDoc(ref).catch(()=>null);
    const current=snap?.exists()?snap.data():{};
    const compData=current[compId]||{};

    if(comp.formato==="final"){
      // SuperCopa: solo limpiar el partido, guardar en historial
      const histRef=doc(db,"config","competenciaHistorial");
      const histSnap=await getDoc(histRef).catch(()=>null);
      const histCurrent=histSnap?.exists()?histSnap.data():{};
      const histList=histCurrent[compId]||[];
      await setDoc(histRef,{...histCurrent,[compId]:[...histList,{fecha:new Date().toISOString(),...compData}]},{merge:true});
      await setDoc(ref,{...current,supercopa:{}},{merge:true});
      setAiMsg(`✅ ${comp.name} finalizada y guardada en historial`);
      setSaving(false);
      return;
    }

    // Guardar snapshot en historial
    const histRef=doc(db,"config","competenciaHistorial");
    const histSnap=await getDoc(histRef).catch(()=>null);
    const histCurrent=histSnap?.exists()?histSnap.data():{};
    const histList=histCurrent[compId]||[];
    await setDoc(histRef,{...histCurrent,[compId]:[...histList,{fecha:new Date().toISOString(),...compData}]},{merge:true});

    // Noticia de campeón(es) — líder de cada grupo/tabla
    const campeones=(compData.grupos||[]).map(g=>{
      const top=[...(g.tabla||[])].sort((a,b)=>b.pts-a.pts)[0];
      return top?{grupo:g.nombre,equipo:top.equipo}:null;
    }).filter(Boolean);
    if(campeones.length===1){
      await addNoticia(`🏁 Temporada de ${comp.name} finalizada — Campeón: ${campeones[0].equipo}`,"🏆");
    }else if(campeones.length>1){
      await addNoticia(`🏁 Temporada de ${comp.name} finalizada — Campeones por grupo: ${campeones.map(c=>`${c.grupo}: ${c.equipo}`).join(", ")}`,"🏆");
    }else{
      await addNoticia(`🏁 Temporada de ${comp.name} finalizada`,"🏁");
    }

    // Resetear tabla/fixture/goleadores/asistencias.
    // Liga (tabla única): mantiene la lista de equipos pero todo en 0.
    // Grupos: se vacían los grupos por completo (se reconfiguran cada temporada).
    let nuevoCompData;
    if(comp.formato==="liga"){
      const g=(compData.grupos||[])[0];
      const tablaReset=(g?.tabla||[]).map(r=>({equipo:r.equipo,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0}));
      nuevoCompData={grupos:g?[{...g,tabla:tablaReset}]:[],fixture:{},goleadores:[],asistencias:[]};
    }else{
      nuevoCompData={grupos:[],fixture:{},goleadores:[],asistencias:[]};
    }
    await setDoc(ref,{...current,[compId]:nuevoCompData},{merge:true});

    // Desinscribir todos los equipos de esta competencia
    for(const t of allTeams){
      const cur=t.competencias||[];
      if(cur.includes(compId)){
        await updateDoc(doc(db,"teams",t.uid||t.id),{competencias:cur.filter(x=>x!==compId)});
      }
    }

    setAiMsg(`✅ ${comp.name} finalizada: historial guardado, tabla/fixture/goleadores reiniciados, equipos desinscritos`);
    setSaving(false);
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.7)",display:"flex",flexDirection:"column"}}>
      <div style={{background:C.card,flex:1,display:"flex",flexDirection:"column",maxHeight:"100vh",overflowY:"auto"}}>
        {/* Header */}
        <div style={{padding:"14px 16px",background:`linear-gradient(135deg,#e67e22,#f39c12)`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {selected?(
            <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,padding:"4px 10px",color:"#fff",fontSize:13,cursor:"pointer"}}>←</button>
          ):(
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,padding:"4px 10px",color:"#fff",fontSize:13,cursor:"pointer"}}>←</button>
          )}
          <span style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,flex:1}}>
            {activeComp?activeComp.name:"🏆 COMPETENCIAS"}
          </span>
          {selected&&<span style={{fontSize:11,color:"rgba(255,255,255,0.8)",fontFamily:"'DM Sans',sans-serif"}}>
            {allTeams.filter(t=>(t.competencias||[]).includes(selected)).length} equipos
          </span>}
        </div>

        <div style={{padding:16,display:"flex",flexDirection:"column",gap:10}}>
          {/* Vista: lista de competencias */}
          {!selected&&comps.map(comp=>(
            <div key={comp.id} style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
              {editingName===comp.id?(
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input value={editValue} onChange={e=>setEditValue(e.target.value)}
                    style={{flex:1,padding:"6px 10px",borderRadius:8,border:`1px solid ${comp.color}`,background:C.card,color:C.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none"}}
                    autoFocus onKeyDown={e=>e.key==="Enter"&&saveCompName(comp.id)}/>
                  <button onClick={()=>saveCompName(comp.id)} disabled={saving}
                    style={{padding:"6px 12px",borderRadius:8,background:comp.color,color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    {saving?"…":"✓"}
                  </button>
                  <button onClick={()=>{setEditingName(null);setEditValue("");}}
                    style={{padding:"6px 10px",borderRadius:8,background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer"}}>
                    ✕
                  </button>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22,flexShrink:0}}>{comp.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{comp.name}</div>
                    <div style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>
                      {allTeams.filter(t=>(t.competencias||[]).includes(comp.id)).length} equipos asignados
                    </div>
                  </div>
                  <button onClick={()=>{setEditingName(comp.id);setEditValue(comp.name);}}
                    style={{padding:"4px 8px",borderRadius:7,background:"transparent",border:`1px solid ${C.borderDark}`,color:C.textMid,fontSize:11,cursor:"pointer"}}>
                    ✏️
                  </button>
                  <button onClick={()=>{setSelected(comp.id);setSubTab(comp.formato==="final"?"grupos":"equipos");}}
                    style={{padding:"6px 14px",borderRadius:8,background:comp.color,color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    Gestionar →
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Sub-tabs: Equipos / Grupos y Tabla / Goleadores */}
          {selected&&activeComp.formato!=="final"&&(
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <button onClick={()=>setSubTab("equipos")}
                style={{flex:1,padding:"7px",borderRadius:8,border:`1.5px solid ${subTab==="equipos"?activeComp.color:C.border}`,background:subTab==="equipos"?activeComp.color:C.inputBg,color:subTab==="equipos"?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                👥 Equipos
              </button>
              <button onClick={()=>setSubTab("grupos")}
                style={{flex:1,padding:"7px",borderRadius:8,border:`1.5px solid ${subTab==="grupos"?activeComp.color:C.border}`,background:subTab==="grupos"?activeComp.color:C.inputBg,color:subTab==="grupos"?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                📊 Tabla
              </button>
              <button onClick={()=>setSubTab("goleadores")}
                style={{flex:1,padding:"7px",borderRadius:8,border:`1.5px solid ${subTab==="goleadores"?activeComp.color:C.border}`,background:subTab==="goleadores"?activeComp.color:C.inputBg,color:subTab==="goleadores"?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                ⚽ Goles
              </button>
              <button onClick={()=>setSubTab("resultado")}
                style={{flex:1,padding:"7px",borderRadius:8,border:`1.5px solid ${subTab==="resultado"?activeComp.color:C.border}`,background:subTab==="resultado"?activeComp.color:C.inputBg,color:subTab==="resultado"?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                🎯 Resultado
              </button>
              <button onClick={()=>setSubTab("fixture")}
                style={{flex:1,padding:"7px",borderRadius:8,border:`1.5px solid ${subTab==="fixture"?activeComp.color:C.border}`,background:subTab==="fixture"?activeComp.color:C.inputBg,color:subTab==="fixture"?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                📅 Fixture
              </button>
              <button onClick={()=>setSubTab("apuestas")}
                style={{flex:1,padding:"7px",borderRadius:8,border:`1.5px solid ${subTab==="apuestas"?activeComp.color:C.border}`,background:subTab==="apuestas"?activeComp.color:C.inputBg,color:subTab==="apuestas"?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                🎲 Apuestas
              </button>
            </div>
          )}

          {selected&&(
            <button onClick={()=>finalizarTemporada(selected)} disabled={saving}
              style={{padding:"8px",borderRadius:8,background:"transparent",border:"1.5px solid #c0392b",color:"#c0392b",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:saving?0.6:1}}>
              🏁 Finalizar Temporada
            </button>
          )}

          {aiMsg&&<div style={{padding:"6px 10px",borderRadius:8,background:"#f0fdf4",border:"1px solid #bbf7d0",fontSize:10,color:"#166534",fontFamily:"'DM Sans',sans-serif"}}>{aiMsg}</div>}

          {/* Vista: equipos de una competencia */}
          {selected&&subTab==="equipos"&&(
            <button onClick={async()=>{
              const inscritos=allTeams.filter(t=>(t.competencias||[]).includes(selected)).map(t=>t.teamName);
              if(inscritos.length<2){setAiMsg("❌ Necesitas al menos 2 equipos inscritos para anunciar el sorteo");return;}
              await addNoticia(`🎲 Se sortearon los equipos de ${activeComp.name}: ${inscritos.join(", ")}`,"🎲");
              setAiMsg(`✅ Sorteo de ${activeComp.name} anunciado (${inscritos.length} equipos)`);
            }} style={{padding:"8px",borderRadius:8,background:"transparent",border:`1.5px solid ${activeComp.color}`,color:activeComp.color,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>
              📢 Anunciar sorteo / inscripción de equipos
            </button>
          )}
          {selected&&subTab==="equipos"&&allTeams.map(team=>{
            const active=(team.competencias||[]).includes(selected);
            return(
              <button key={team.uid||team.id} onClick={()=>toggleTeam(team)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:`2px solid ${active?activeComp.color:C.border}`,background:active?activeComp.color+"18":C.inputBg,cursor:"pointer",textAlign:"left",width:"100%"}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:getTeamColor(team.teamColor||"blue").bg,flexShrink:0,border:"1px solid rgba(0,0,0,0.15)"}}/>
                <span style={{flex:1,fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{team.teamName}</span>
                <span style={{fontSize:16}}>{active?"✅":"⬜"}</span>
              </button>
            );
          })}

          {/* Vista: grupos y tabla de clasificación */}
          {selected&&subTab==="grupos"&&(
            activeComp.formato==="final"
              ?<SuperCopaSetup compColor={activeComp.color} setAiMsg={setAiMsg}/>
              :<CompetenciaGruposSetup compId={selected} compName={activeComp.name} compColor={activeComp.color} formato={activeComp.formato} allTeams={allTeams} setAiMsg={setAiMsg}/>
          )}

          {/* Vista: goleadores y asistencias */}
          {selected&&subTab==="goleadores"&&(
            <CompetenciaGoleadoresSetup compId={selected} compName={activeComp.name} compColor={activeComp.color} setAiMsg={setAiMsg}/>
          )}

          {/* Vista: resultado de partido (actualiza tabla) */}
          {selected&&subTab==="resultado"&&(
            <CompetenciaResultadoSetup compId={selected} compName={activeComp.name} compColor={activeComp.color} formato={activeComp.formato} setAiMsg={setAiMsg}/>
          )}

          {/* Vista: fixture / calendario */}
          {selected&&subTab==="fixture"&&(
            <CompetenciaFixtureSetup compId={selected} compColor={activeComp.color} setAiMsg={setAiMsg}/>
          )}

          {/* Vista: apuestas entre equipos */}
          {selected&&subTab==="apuestas"&&(
            <CompetenciaApuestasSetup compId={selected} compName={activeComp.name} compColor={activeComp.color} allTeams={allTeams} setAiMsg={setAiMsg}/>
          )}
        </div>
      </div>
    </div>
  );
}

function MainApp({user,isAdmin,onLogout}){
  const[teamData,setTeamData]=useState(null);
  const[allTeams,setAllTeams]=useState([]);
  const[pool,setPool]=useState({});
  const[showPool,setShowPool]=useState(false);
  const[poolPlayer,setPoolPlayer]=useState(null);
  const[transferTeam,setTransferTeam]=useState(null);
  const[showCreateTeam,setShowCreateTeam]=useState(false);
  const[showAdminManager,setShowAdminManager]=useState(false);
  const[deleteTeamTarget,setDeleteTeamTarget]=useState(null);
  const[adminsList,setAdminsList]=useState([]);
  const[viewingTeam,setViewingTeam]=useState(null);
  const[showTeamsList,setShowTeamsList]=useState(false);
  const[showLiveAdmin,setShowLiveAdmin]=useState(false);
  const[showPresidents,setShowPresidents]=useState(false);
  const[showImport,setShowImport]=useState(false);
  const[showSelecciones,setShowSelecciones]=useState(false);
  const[showCompetencias,setShowCompetencias]=useState(false);
  const[showMiSeleccion,setShowMiSeleccion]=useState(false);
  const[allSels,setAllSels]=useState([]);
  const[selNacional,setSelNacional]=useState(null);
  const[transferBadge,setTransferBadge]=useState(0);
  const[showHamburger,setShowHamburger]=useState(false);
  const[showAdminMenu,setShowAdminMenu]=useState(false);
  const[showMercado,setShowMercado]=useState(false);
  const[mercadoAbierto,setMercadoAbierto]=useState(true);
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","settings"),snap=>{
      setMercadoAbierto(!(snap.exists()&&snap.data().mercadoAbierto===false));
    });
    return unsub;
  },[]);
  const[showMundial,setShowMundial]=useState(false);
  const[mundialInitialTab,setMundialInitialTab]=useState("tabla");
  const[showHome,setShowHome]=useState(true);
  const[compMenuComp,setCompMenuComp]=useState(null);
  const[showCompVista,setShowCompVista]=useState(null);
  const[competenciaData,setCompetenciaData]=useState({});
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","competenciaData"),snap=>{
      setCompetenciaData(snap.exists()?snap.data():{});
    });
    return unsub;
  },[]);
  const[activeComp,setActiveComp]=useState(null); // null = campo libre, comp obj = competencia // {formation, starters, subs, country}
  const[activeLineupId,setActiveLineupId]=useState("a");
  const[showLineupPanel,setShowLineupPanel]=useState(false);
  const[showRequisitos,setShowRequisitos]=useState(false);
  const[showFormations,setShowFormations]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
  const[showSquadManager,setShowSquadManager]=useState(false);
  const[showSquadList,setShowSquadList]=useState(false);
  const[editingPlayer,setEditingPlayer]=useState(null);
  const[showPublicPool,setShowPublicPool]=useState(false);
  const[shareLineup,setShareLineup]=useState(false);
  const[showAddPlayer,setShowAddPlayer]=useState(false);
  const[pickModal,setPickModal]=useState(null);
  const[dragOverPos,setDragOverPos]=useState(null);
  const[newLineupName,setNewLineupName]=useState("");
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const dragSubIdx=useRef(null);
  const dragFromPosId=useRef(null);

  useEffect(()=>{
    const ref=doc(db,"teams",user.uid);
    let saveScheduled=false;
    const unsub=onSnapshot(ref,snap=>{
      if(snap.exists()){
        const data=snap.data();
        const rawSquad=data.squad||[];
        // Deduplicate by name (primary) then by key
        const seenNames=new Set();
        const squad=rawSquad.map(normPlayer).filter(p=>{
          const name=(p.name||"").trim().toLowerCase();
          if(!name||seenNames.has(name)) return false;
          seenNames.add(name);
          return true;
        });
        // Normalize lineups - fix each starter/sub by looking up by NAME in squad
        const squadNames=new Set(squad.map(p=>(p.name||"").trim().toLowerCase()));
        const squadKeys=new Set(squad.flatMap(p=>[p.poolKey,p.id].filter(Boolean)));
        const isInSquad=p=>p&&(squadKeys.has(p.poolKey)||squadKeys.has(p.id)||squadNames.has((p.name||"").trim().toLowerCase()));
        const fixPlayer=p=>{
          if(!p) return null;
          const norm=s=>(s||"").trim().toLowerCase();
          // Find the canonical squad player by name
          const canonical=squad.find(s=>norm(s.name)===norm(p.name));
          if(canonical) return{...canonical}; // use fresh data from squad
          return isInSquad(p)?normPlayer(p):null;
        };
        const lineups=(data.lineups||[]).map(l=>({
          ...l,
          starters:Object.fromEntries(Object.entries(l.starters||{}).map(([k,v])=>[k,fixPlayer(v)]).filter(([,v])=>v)),
          subs:(l.subs||[]).map(s=>fixPlayer(s))
        }));
        // Only save back if duplicates were found or English positions detected
        const hadDupes=squad.length<rawSquad.length;
        const hadEnglish=rawSquad.some(p=>p.pos&&Object.keys(POS_EN_ES).some(en=>p.pos.split('/').includes(en)));
        if((hadDupes||hadEnglish)&&!saveScheduled){
          saveScheduled=true;
          setTimeout(()=>{updateDoc(ref,{squad,lineups}).catch(()=>{});saveScheduled=false;},500);
        }
        setTeamData({...data,squad,lineups});
      } else{
        const init={uid:user.uid,email:user.email,teamName:user.displayName||"Mi Equipo",squad:[],lineups:[{id:"a",name:"Liga",formation:"4-3-3",starters:{},subs:Array(7).fill(null)},{id:"b",name:"Copa",formation:"4-3-3",starters:{},subs:Array(7).fill(null)}],createdAt:new Date().toISOString()};
        setDoc(ref,init);setTeamData(init);
      }
    });
    return unsub;
  },[user.uid]);

  useEffect(()=>{
    if(!user) return;
    const unsub=onSnapshot(collection(db,"teams"),snap=>{setAllTeams(snap.docs.map(d=>({id:d.id,...d.data()})));});
    return unsub;
  },[user]);

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"admins"),snap=>{setAdminsList(snap.docs.map(d=>({id:d.id,...d.data()})));});
    return unsub;
  },[]);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"pool","players"),snap=>{
      if(snap.exists()) setPool(snap.data());
      else setPool({});
    });
    return unsub;
  },[]);

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"selecciones"),snap=>{
      setAllSels(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return unsub;
  },[]);

  // Cargar alineación de la selección nacional en tiempo real
  useEffect(()=>{
    const nat=teamData?.nationalTeam;
    if(!nat){setSelNacional(null);return;}
    const unsub=onSnapshot(doc(db,"selecciones",nat),snap=>{
      if(snap.exists()) setSelNacional({id:snap.id,...snap.data()});
      else setSelNacional({id:nat,country:nat,formation:"4-3-3",starters:{},subs:Array(7).fill(null),squad:[]});
    });
    return unsub;
  },[teamData?.nationalTeam]);

  // Badge transferencias
  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"transfers"),snap=>{
      const all=snap.docs.map(d=>({id:d.id,...d.data()}));
      const inbox=all.filter(t=>t.toUid===user.uid&&t.status==="pending_acceptance").length;
      const adminQ=isAdmin?all.filter(t=>t.status==="pending_admin").length:0;
      setTransferBadge(inbox+adminQ);
    });
    return unsub;
  },[user.uid,isAdmin]);

  const saveTeam=async patch=>{
    setSaving(true);
    await updateDoc(doc(db,"teams",user.uid),patch);
    if(patch.teamName){
      try{
        const pSnap=await getDoc(doc(db,"pool","players"));
        if(pSnap.exists()){
          const pd={...pSnap.data()};
          let changed=false;
          Object.keys(pd).forEach(k=>{
            if(pd[k].teamUid===user.uid){pd[k]={...pd[k],teamName:patch.teamName};changed=true;}
          });
          if(changed) await setDoc(doc(db,"pool","players"),pd);
        }
      }catch(e){}
    }
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);
  };

  const addToPool=async(player,tName)=>{
    if(!player.poolKey) return;
    const poolRef=doc(db,"pool","players");
    const snap=await getDoc(poolRef);
    const current=snap.exists()?snap.data():{};
    const uniqueKey=`${user.uid}_${player.poolKey}`;
    await setDoc(poolRef,{...current,[uniqueKey]:{name:player.name,pos:player.pos,country:player.country||null,overall:player.overall||null,age:player.age||null,price:player.price||null,teamName:tName,teamUid:user.uid,originalKey:player.poolKey}});
  };

  const removeFromPool=async(player)=>{
    if(!player.poolKey) return;
    const poolRef=doc(db,"pool","players");
    const snap=await getDoc(poolRef);
    if(!snap.exists()) return;
    const current={...snap.data()};
    // Try both old and new key formats
    const uniqueKey=`${user.uid}_${player.poolKey}`;
    delete current[uniqueKey];
    delete current[player.poolKey]; // backward compat
    await setDoc(poolRef,current);
  };

  // Update global C based on user's dark mode preference (before any early returns)
  C = getC(teamData?.darkMode);

  if(!teamData) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const lineups=teamData.lineups||[];
  const squad=teamData.squad||[];
  const isSel=activeLineupId==="sel_nacional";
  const activeLineup=isSel
    ? (selNacional?{id:"sel_nacional",name:selNacional.country||"Selección",formation:selNacional.formation||"4-3-3",starters:selNacional.starters||{},subs:selNacional.subs||Array(7).fill(null),locked:true}:{formation:"4-3-3",starters:{},subs:Array(7).fill(null),locked:true})
    : lineups.find(l=>l.id===activeLineupId)||lineups[0]||{formation:"4-3-3",starters:{},subs:Array(7).fill(null)};
  const positions=FORMATIONS[activeLineup?.formation]||FORMATIONS["4-3-3"];
  const filled=Object.values(activeLineup?.starters||{}).filter(Boolean).length;

  // ─── Validación de alineación (Liga / Copa) ──────────────────────────────
  // Devuelve array de requisitos: {texto, cumplido, detalle}
  const validarAlineacion=()=>{
    if(!activeLineup||isSel) return [];
    const lineupName=activeLineup.name;
    if(lineupName!=="Liga"&&lineupName!=="Copa") return [];
    const starters11=Object.values(activeLineup.starters||{}).filter(Boolean);
    if(starters11.length<11) return []; // aún no completa, no validar
    const teamPais=(teamData.pais||"").trim().toLowerCase();
    const getFullPlayer=base=>squad.find(s=>s.name===base?.name)||base||{};
    const apellido=full=>{
      const partes=(full.name||"").trim().split(/\s+/);
      return partes[partes.length-1]||full.name||"";
    };
    const reqs=[];

    const nacionales=starters11.filter(p=>{
      const full=getFullPlayer(p);
      return teamPais&&(full.country||"").trim().toLowerCase()===teamPais;
    });
    reqs.push({
      texto:`Jugadores nacionales (${teamData.pais||"país no configurado"})`,
      cumplido:nacionales.length>=2,
      detalle:`${nacionales.length}/2`
    });

    if(lineupName==="Copa"){
      const sub20=starters11.filter(p=>{
        const full=getFullPlayer(p);
        return full.age&&Number(full.age)<=20;
      });
      reqs.push({
        texto:"Jugadores Sub-20",
        cumplido:sub20.length>=2,
        detalle:`${sub20.length}/2`
      });

      // Top 10 por overall, de toda la convocatoria (titulares + banca)
      const banca=(activeLineup.subs||[]).filter(Boolean);
      const convocados=[...starters11,...banca];
      const top10Names=[...convocados].map(p=>getFullPlayer(p)).filter(p=>p.overall&&p.name)
        .sort((a,b)=>(b.overall||0)-(a.overall||0)).slice(0,10).map(p=>p.name);
      const enTitular=starters11.filter(p=>top10Names.includes(p.name));
      const cumpleTop10=enTitular.length<=2;
      let detalleTop10=`${enTitular.length}/2 máx`;
      if(enTitular.length>0){
        const nombres=enTitular.map(p=>apellido(getFullPlayer(p)));
        detalleTop10+=` — ${nombres.join(", ")}`;
      }
      reqs.push({
        texto:"Jugadores del Top 10 de tu plantilla en el 11 titular (máx. 2)",
        cumplido:cumpleTop10,
        detalle:detalleTop10
      });
    }

    return reqs;
  };
  const erroresAlineacion=validarAlineacion();

  const updateActive=async fn=>{
    const targetId=activeLineup?.id||activeLineupId;
    const nl=lineups.map(l=>l.id===targetId?{...l,...fn(l)}:l);
    if(!nl.some(l=>l.id===targetId)&&lineups.length>0){
      // fallback: update first lineup
      const nl2=[{...lineups[0],...fn(lineups[0])},...lineups.slice(1)];
      await saveTeam({lineups:nl2});
      return;
    }
    await saveTeam({lineups:nl});
  };

  const matchPlayer=(a,b)=>!!(a&&b&&a.name&&b.name&&
    a.name.trim().toLowerCase()===b.name.trim().toLowerCase());

  const handlePick=async player=>{
    if(!pickModal) return;
    if(pickModal.type==="starter"){
      await updateActive(l=>{
        const newStarters={...l.starters};
        const newSubs=[...l.subs];
        const currentInPos=newStarters[pickModal.posId]||null;
        // Find if player comes from bench
        const fromBenchIdx=newSubs.findIndex(s=>matchPlayer(s,player));
        // Remove player from wherever it was
        Object.keys(newStarters).forEach(k=>{if(matchPlayer(newStarters[k],player)) delete newStarters[k];});
        // Place old starter into bench slot if player came from bench
        if(fromBenchIdx>=0&&currentInPos) newSubs[fromBenchIdx]=currentInPos;
        else if(fromBenchIdx>=0) newSubs[fromBenchIdx]=null;
        else newSubs.forEach((s,i)=>{if(matchPlayer(s,player)) newSubs[i]=null;});
        newStarters[pickModal.posId]=player;
        return{starters:newStarters,subs:newSubs};
      });
    } else {
      await updateActive(l=>{
        const newStarters={...l.starters};
        const newSubs=[...l.subs];
        const currentInSlot=newSubs[pickModal.subIdx]||null;
        // Find if player comes from 11
        const fromStarterKey=Object.keys(newStarters).find(k=>matchPlayer(newStarters[k],player));
        if(fromStarterKey&&currentInSlot) newStarters[fromStarterKey]=currentInSlot;
        else if(fromStarterKey) delete newStarters[fromStarterKey];
        newSubs.forEach((s,i)=>{if(i!==pickModal.subIdx&&matchPlayer(s,player)) newSubs[i]=null;});
        newSubs[pickModal.subIdx]=player;
        return{starters:newStarters,subs:newSubs};
      });
    }
    setPickModal(null);
  };

  const handleDrop=async posId=>{
    // Field to field drag
    if(dragFromPosId.current!==null){
      const fromId=dragFromPosId.current;
      dragFromPosId.current=null;
      if(fromId===posId){setDragOverPos(null);return;}
      await updateActive(l=>{
        const fromPlayer=l.starters[fromId];
        const toPlayer=l.starters[posId]||null;
        const newStarters={...l.starters};
        newStarters[posId]=fromPlayer;
        if(toPlayer) newStarters[fromId]=toPlayer;
        else delete newStarters[fromId];
        return{starters:newStarters};
      });
      setDragOverPos(null);
      return;
    }
    // Bench to field drag
    if(dragSubIdx.current===null) return;
    const idx=dragSubIdx.current;
    await updateActive(l=>{
      const sub=l.subs[idx];if(!sub) return l;
      const evicted=l.starters[posId]||null;
      // Remove sub player from any starter slot
      const newStarters={...l.starters};
      Object.keys(newStarters).forEach(k=>{if(newStarters[k]?.id===sub.id) delete newStarters[k];});
      newStarters[posId]=sub;
      const newSubs=[...l.subs];
      newSubs[idx]=evicted;
      return{starters:newStarters,subs:newSubs};
    });
    dragSubIdx.current=null;setDragOverPos(null);
  };

  const handleRemovePos=async posId=>{
    await updateActive(l=>{const s={...l.starters};delete s[posId];return{starters:s};});
  };

  const addLineup=async()=>{
    const name=newLineupName.trim()||`Alineación ${lineups.length+1}`;
    const id=`l_${Date.now()}`;
    await saveTeam({lineups:[...lineups,{id,name,formation:"4-3-3",starters:{},subs:Array(7).fill(null)}]});
    setActiveLineupId(id);setNewLineupName("");setShowLineupPanel(false);
  };

  const btn=(active,onClick,label)=>(
    <button onClick={onClick}
      style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${active?C.accent:C.borderDark}`,background:active?C.accent:C.inputBg,color:active?"#fff":C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>
      {label}
    </button>
  );

  // ─ Team color theme ─────────────────────────────────────────────────────────
  const TC=getTeamColor(teamData?.teamColor);
  const TA={accent:TC.bg,accentDark:TC.dark,accentLight:TC.bg+"22",goldLight:TC.bg+"18"};

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Bebas Neue','DM Sans',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 40px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.borderDark};border-radius:4px}input::placeholder{color:${C.textFaint}}select option{background:${C.inputBg};color:${C.text}}body{background:${C.bg};color:${C.text}}`}</style>

      {/* HOME SCREEN */}
      {showHome&&!showMundial&&(
        <div style={{position:"fixed",inset:0,zIndex:150,overflowY:"auto",background:C.bg}}>
          <HomeScreen
            teamData={teamData}
            isAdmin={isAdmin}
            onOpenMundial={()=>{setShowHome(false);setMundialInitialTab("misel");setShowMundial(true);}}
            onSelect={comp=>{
              if(comp===null){setActiveComp(null);setShowHome(false);return;}
              setCompMenuComp(comp);
            }}
          />
        </div>
      )}

      {/* MENÚ: Ver equipo o Ver tabla */}
      {compMenuComp&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setCompMenuComp(null)}>
          <div style={{background:C.card,borderRadius:20,padding:"28px 24px",minWidth:280,maxWidth:340,boxShadow:"0 8px 40px rgba(0,0,0,0.25)",border:`1.5px solid ${C.border}`}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:11,fontWeight:700,color:C.textFaint,letterSpacing:1,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>Competición</div>
            <div style={{fontSize:17,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5,marginBottom:20}}>{compMenuComp.name}</div>
            {/* Opción 1: Ver mi equipo */}
            <button onClick={()=>{
              const comp=compMenuComp;
              setCompMenuComp(null);
              setShowHome(false);
              const lineupName=comp.lineupName;
              const matched=lineups.find(l=>l.name===lineupName);
              if(matched) setActiveLineupId(matched.id);
              else{
                const newId=`comp_${comp.id}_${Date.now()}`;
                const newLineup={id:newId,name:comp.lineupName,formation:"4-3-3",starters:{},subs:Array(7).fill(null),code:""};
                saveTeam({lineups:[...lineups,newLineup]});
                setActiveLineupId(newId);
              }
              setActiveComp(comp);
            }} style={{width:"100%",padding:"14px 16px",background:TA.accent,color:"#fff",border:"none",borderRadius:14,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:20}}>👕</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:14,fontWeight:800}}>Ver mi equipo</div>
                <div style={{fontSize:11,opacity:0.85,fontWeight:400}}>Editar alineación y formación</div>
              </div>
            </button>
            {/* Opción 2: Ver tabla/liga */}
            <button onClick={()=>{
              setShowCompVista({comp:compMenuComp});
              setCompMenuComp(null);
            }} style={{width:"100%",padding:"14px 16px",background:C.inputBg,color:C.text,border:`1.5px solid ${C.border}`,borderRadius:14,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>📊</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:14,fontWeight:800}}>Ver tabla / liga</div>
                <div style={{fontSize:11,opacity:0.6,fontWeight:400}}>Tabla, goleadores y fixture</div>
              </div>
            </button>
            <button onClick={()=>setCompMenuComp(null)} style={{width:"100%",marginTop:14,background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Cancelar</button>
          </div>
        </div>
      )}

      {/* VISTA PÚBLICA: Tabla / Goleadores / Fixture */}
      {showCompVista&&(()=>{
        const comp=showCompVista.comp;
        const compId=comp.id;
        const compData=competenciaData?.[compId]||{};
        const grupos=compData.grupos||[];
        const goleadores=compData.goleadores||[];
        const asistencias=compData.asistencias||[];
        const fixture=compData.fixture||{};
        const [vistaTab,setVistaTab]=useState("tabla");
        const [apuestasComp,setApuestasComp]=useState([]);
        const [h2hLista,setH2hLista]=useState([]);
        useEffect(()=>{
          const unsub1=onSnapshot(doc(db,"config","apuestas"),snap=>{
            const all=snap.exists()?snap.data():{};
            setApuestasComp((all.lista||[]).filter(a=>a.compId===compId));
          });
          const unsub2=onSnapshot(doc(db,"config","h2hHistorial"),snap=>{
            const all=snap.exists()?snap.data():{};
            setH2hLista(all.lista||[]);
          });
          return ()=>{unsub1();unsub2();};
        },[compId]);
        // Helper: obtiene fila de tabla de un equipo (busca en todos los grupos)
        const filaDeEquipo=(nombre)=>{
          for(const g of grupos){
            const fila=(g.tabla||[]).find(r=>r.equipo===nombre);
            if(fila) return fila;
          }
          return null;
        };
        const posicionDeEquipo=(nombre)=>{
          for(const g of grupos){
            const ordenada=[...(g.tabla||[])].sort((a,b)=>b.pts-a.pts);
            const idx=ordenada.findIndex(r=>r.equipo===nombre);
            if(idx>=0) return idx+1;
          }
          return null;
        };
        return(
          <div style={{position:"fixed",inset:0,zIndex:200,background:C.bg,overflowY:"auto"}}>
            {/* Header */}
            <div style={{background:comp.color||"#1a3a5c",padding:"16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
              <button onClick={()=>setShowCompVista(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:34,height:34,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
              <div>
                <div style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{comp.name}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontFamily:"'DM Sans',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>Vista pública</div>
              </div>
            </div>
            {/* Tabs */}
            <div style={{display:"flex",borderBottom:`2px solid ${C.border}`,background:C.card}}>
              {[["tabla","📊 Tabla"],["goles","⚽ Goles"],["fixture","📅 Fixture"],["apuestas","🎲 Apuestas"]].map(([id,label])=>(
                <button key={id} onClick={()=>setVistaTab(id)} style={{flex:1,padding:"11px 4px",background:"none",border:"none",borderBottom:vistaTab===id?`3px solid ${comp.color||TA.accent}`:"3px solid transparent",cursor:"pointer",fontSize:11,fontWeight:700,color:vistaTab===id?(comp.color||TA.accent):C.textFaint,fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>{label}</button>
              ))}
            </div>
            {/* Content */}
            <div style={{padding:"16px",maxWidth:600,margin:"0 auto"}}>
              {/* TABLA */}
              {vistaTab==="tabla"&&(
                grupos.length===0
                  ? <div style={{textAlign:"center",color:C.textFaint,padding:40,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Sin tabla disponible</div>
                  : grupos.map((g,gi)=>(
                    <div key={gi} style={{marginBottom:20}}>
                      {grupos.length>1&&<div style={{fontSize:12,fontWeight:800,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{g.nombre||`Grupo ${gi+1}`}</div>}
                      <div style={{background:C.card,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 32px 32px 32px 32px 32px 32px",gap:0,padding:"7px 10px",background:C.inputBg,fontSize:9,fontWeight:800,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:0.3}}>
                          <span>Equipo</span><span style={{textAlign:"center"}}>PJ</span><span style={{textAlign:"center"}}>G</span><span style={{textAlign:"center"}}>E</span><span style={{textAlign:"center"}}>P</span><span style={{textAlign:"center"}}>GD</span><span style={{textAlign:"center",fontWeight:900,color:TA.accent}}>Pts</span>
                        </div>
                        {(g.equipos||[]).sort((a,b)=>(b.pts||0)-(a.pts||0)||(b.gf-b.gc||0)-(a.gf-a.gc||0)).map((eq,ei)=>(
                          <Fragment key={ei}>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 32px 32px 32px 32px 32px 32px",gap:0,padding:"9px 10px",borderTop:`1px solid ${C.border}`,fontSize:12,fontFamily:"'DM Sans',sans-serif",alignItems:"center",background:comp.formato==="liga"&&ei<8?TA.accent+"0d":"transparent"}}>
                              <span style={{fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{comp.formato==="liga"&&ei<8?"🟢 ":""}{eq.nombre}</span>
                              <span style={{textAlign:"center",color:C.textLight}}>{(eq.g||0)+(eq.e||0)+(eq.p||0)}</span>
                              <span style={{textAlign:"center",color:"#27ae60",fontWeight:600}}>{eq.g||0}</span>
                              <span style={{textAlign:"center",color:C.textLight}}>{eq.e||0}</span>
                              <span style={{textAlign:"center",color:"#e74c3c"}}>{eq.p||0}</span>
                              <span style={{textAlign:"center",color:C.textLight}}>{(eq.gf||0)-(eq.gc||0)>=0?"+"+(eq.gf-eq.gc||0):(eq.gf-eq.gc||0)}</span>
                              <span style={{textAlign:"center",fontWeight:900,fontSize:14,color:TA.accent}}>{eq.pts||0}</span>
                            </div>
                            {comp.formato==="liga"&&ei===7&&(
                              <div style={{padding:"4px 0",textAlign:"center",fontSize:10,fontWeight:800,color:TA.accent,borderBottom:`2px dashed ${TA.accent}`}}>▲ Clasificados a Liguilla</div>
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  ))
              )}
              {/* GOLES */}
              {vistaTab==="goles"&&(
                <div>
                  {/* Goleadores */}
                  <div style={{fontSize:13,fontWeight:800,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>⚽ Goleadores</div>
                  {goleadores.length===0
                    ? <div style={{textAlign:"center",color:C.textFaint,padding:20,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Sin datos</div>
                    : <div style={{background:C.card,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`,marginBottom:20}}>
                        {goleadores.map((r,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
                            <span style={{fontWeight:900,fontSize:16,color:i===0?"#f39c12":i===1?"#95a5a6":i===2?"#cd7f32":C.textFaint,minWidth:22,textAlign:"center"}}>{i+1}</span>
                            <span style={{flex:1,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>{r.nombre||r.player||"—"}</span>
                            <span style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{r.equipo||r.team||""}</span>
                            <span style={{fontWeight:900,fontSize:16,color:TA.accent,minWidth:24,textAlign:"right"}}>{r.goles||r.goals||r.valor||0}</span>
                          </div>
                        ))}
                      </div>
                  }
                  {/* Asistencias */}
                  <div style={{fontSize:13,fontWeight:800,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>🎯 Asistencias</div>
                  {asistencias.length===0
                    ? <div style={{textAlign:"center",color:C.textFaint,padding:20,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Sin datos</div>
                    : <div style={{background:C.card,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
                        {asistencias.map((r,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
                            <span style={{fontWeight:900,fontSize:16,color:i===0?"#f39c12":i===1?"#95a5a6":i===2?"#cd7f32":C.textFaint,minWidth:22,textAlign:"center"}}>{i+1}</span>
                            <span style={{flex:1,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>{r.nombre||r.player||"—"}</span>
                            <span style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{r.equipo||r.team||""}</span>
                            <span style={{fontWeight:900,fontSize:16,color:"#8e44ad",minWidth:24,textAlign:"right"}}>{r.asistencias||r.assists||r.valor||0}</span>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              )}
              {/* FIXTURE */}
              {vistaTab==="fixture"&&(
                Object.keys(fixture).length===0
                  ? <div style={{textAlign:"center",color:C.textFaint,padding:40,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Sin fixture disponible</div>
                  : Object.entries(fixture).map(([jkey,jornada])=>(
                    <div key={jkey} style={{marginBottom:20}}>
                      <div style={{fontSize:12,fontWeight:800,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{jornada.nombre||jkey}</div>
                      <div style={{background:C.card,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
                        {(jornada.partidos||[]).map((p,pi)=>(
                          <div key={pi} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderTop:pi>0?`1px solid ${C.border}`:"none",fontFamily:"'DM Sans',sans-serif"}}>
                            <span style={{flex:1,fontSize:12,fontWeight:700,color:C.text,textAlign:"right"}}>{p.local||p.home||"—"}</span>
                            <span style={{background:C.inputBg,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:900,color:C.text,minWidth:50,textAlign:"center",border:`1px solid ${C.border}`}}>{p.marcador||"vs"}</span>
                            <span style={{flex:1,fontSize:12,fontWeight:700,color:C.text}}>{p.visitante||p.away||"—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
              {/* APUESTAS */}
              {vistaTab==="apuestas"&&(
                apuestasComp.length===0
                  ? <div style={{textAlign:"center",color:C.textFaint,padding:40,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Sin apuestas activas</div>
                  : apuestasComp.map(ap=>{
                    let progresoA="—",progresoB="—",etiqueta="";
                    if(ap.metrica==="posicion"){
                      etiqueta="Posición en tabla";
                      const pA=posicionDeEquipo(ap.equipoA),pB=posicionDeEquipo(ap.equipoB);
                      progresoA=pA?`#${pA}`:"—"; progresoB=pB?`#${pB}`:"—";
                    }else if(ap.metrica==="puntos"){
                      etiqueta="Puntos";
                      const fA=filaDeEquipo(ap.equipoA),fB=filaDeEquipo(ap.equipoB);
                      progresoA=fA?`${fA.pts||0} pts`:"—"; progresoB=fB?`${fB.pts||0} pts`:"—";
                    }else if(ap.metrica==="gd"){
                      etiqueta="Diferencia de goles";
                      const fA=filaDeEquipo(ap.equipoA),fB=filaDeEquipo(ap.equipoB);
                      const gdA=fA?(fA.gf||0)-(fA.gc||0):null, gdB=fB?(fB.gf||0)-(fB.gc||0):null;
                      progresoA=gdA!==null?(gdA>=0?"+"+gdA:gdA):"—"; progresoB=gdB!==null?(gdB>=0?"+"+gdB:gdB):"—";
                    }else if(ap.metrica==="h2h"){
                      etiqueta="Resultado directo (H2H)";
                      const partidos=h2hLista.filter(h=>(h.local===ap.equipoA&&h.visitante===ap.equipoB)||(h.local===ap.equipoB&&h.visitante===ap.equipoA));
                      if(partidos.length===0){progresoA="Sin partidos";progresoB="Sin partidos";}
                      else{
                        let winsA=0,winsB=0;
                        partidos.forEach(p=>{
                          const golesA=p.local===ap.equipoA?p.golesLocal:p.golesVisitante;
                          const golesB=p.local===ap.equipoB?p.golesLocal:p.golesVisitante;
                          if(golesA>golesB) winsA++; else if(golesB>golesA) winsB++;
                        });
                        progresoA=`${winsA} victoria${winsA!==1?"s":""}`; progresoB=`${winsB} victoria${winsB!==1?"s":""}`;
                      }
                    }
                    return(
                      <div key={ap.id} style={{background:C.card,borderRadius:12,padding:"14px",border:`1.5px solid ${ap.estado==="activa"?(comp.color||TA.accent):C.border}`,marginBottom:12,opacity:ap.estado==="cerrada"?0.7:1}}>
                        <div style={{fontSize:11,color:C.textMid,fontFamily:"'DM Sans',sans-serif",fontStyle:"italic",marginBottom:10}}>"{ap.condicion}"</div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                          <div style={{flex:1,textAlign:"center"}}>
                            <div style={{fontSize:12,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{ap.equipoA}</div>
                            <div style={{fontSize:16,fontWeight:900,color:comp.color||TA.accent,fontFamily:"'DM Sans',sans-serif"}}>{progresoA}</div>
                          </div>
                          <div style={{fontSize:11,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>VS</div>
                          <div style={{flex:1,textAlign:"center"}}>
                            <div style={{fontSize:12,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{ap.equipoB}</div>
                            <div style={{fontSize:16,fontWeight:900,color:comp.color||TA.accent,fontFamily:"'DM Sans',sans-serif"}}>{progresoB}</div>
                          </div>
                        </div>
                        <div style={{fontSize:8,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",textAlign:"center",marginTop:8}}>{etiqueta}</div>
                        {ap.estado==="cerrada"&&(
                          <div style={{marginTop:10,textAlign:"center",fontSize:11,fontWeight:800,color:"#27ae60",fontFamily:"'DM Sans',sans-serif"}}>
                            {ap.ganador?`🏆 Ganó: ${ap.ganador}`:"Cerrada sin ganador"}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        );
      })()}

      <LiveAndAviso/>
      {/* TOP BAR */}
      <div style={{width:"100%",background:C.card,borderBottom:`2px solid ${TA.accent}`,padding:"11px 16px",display:"flex",alignItems:"center",gap:8,position:"sticky",top:0,zIndex:100,boxShadow:C.dark?`0 2px 24px ${TA.accent}55, 0 0 2px ${TA.accent}33`:`0 2px 16px ${TA.accentLight}`}}>
        <button onClick={()=>setShowHome(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 6px",borderRadius:8,display:"flex",alignItems:"center",gap:4,color:C.textMid,fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:700,flexShrink:0}} title="Volver al inicio">
          ←
        </button>
        <img src="data:image/png;base64,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" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover"}}/>
        <h1 style={{fontSize:15,fontWeight:800,color:C.text,margin:0,letterSpacing:1,fontFamily:"'Bebas Neue',sans-serif"}}>{teamData.teamName}</h1>
        {isAdmin&&<span style={{fontSize:9,background:TA.accent,color:"#fff",padding:"2px 8px",borderRadius:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif",letterSpacing:0.5}}>ADMIN</span>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          {saving&&<span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>Guardando…</span>}
          {saved&&<span style={{fontSize:10,color:"#27ae60",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✓</span>}
          {teamData.presupuesto&&<span style={{fontSize:11,fontWeight:800,color:C.accent,background:C.goldLight,padding:"3px 8px",borderRadius:8,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5,border:`1px solid ${TA.accent}44`}}>💰 {teamData.presupuesto}</span>}
          <span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{filled}/11</span>
          {btn(showLineupPanel,()=>{setShowLineupPanel(v=>!v);setShowFormations(false);setShowSettings(false);setShowHamburger(false);},`${activeLineup?.name} ▾`)}
          <button onClick={()=>{if(!isSel){setShowFormations(v=>!v);setShowLineupPanel(false);setShowSettings(false);setShowHamburger(false);}}}
            style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${showFormations?TA.accent:C.borderDark}`,background:showFormations?TA.accent:isSel?"#f5f5f5":C.inputBg,color:showFormations?"#fff":isSel?C.textFaint:C.textMid,fontSize:12,fontWeight:800,cursor:isSel?"default":"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>
            {activeLineup?.formation}
          </button>
          {/* ☰ Hamburger */}
          <div style={{position:"relative"}}>
            <button onClick={()=>{setShowHamburger(v=>!v);setShowLineupPanel(false);setShowFormations(false);setShowSettings(false);}}
              style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${showHamburger?TA.accent:C.borderDark}`,background:showHamburger?TA.accent:C.inputBg,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:showHamburger?"#fff":C.textMid,flexShrink:0}}>
              ☰
            </button>
            {transferBadge>0&&!showHamburger&&<span style={{position:"absolute",top:-5,right:-5,background:"#e74c3c",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,pointerEvents:"none"}}>{transferBadge}</span>}
            {showHamburger&&(
              <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:500,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",minWidth:180,padding:"6px",display:"flex",flexDirection:"column",gap:2}}>
                <div onClick={()=>{setShowSettings(v=>!v);setShowHamburger(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,background:showSettings?TA.accentLight:"transparent",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.text}}>
                  ⚙️ <span>Ajustes</span>
                </div>
                <div onClick={()=>{setShowSquadList(v=>!v);setShowHamburger(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,background:showSquadList?TA.accentLight:"transparent",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.text}}>
                  📋 <span>Plantilla</span>
                </div>
                <div onClick={()=>{setShowPublicPool(true);setShowHamburger(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.text}}>
                  🌍 <span>Pool público</span>
                </div>
                {teamData?.nationalTeam&&<div onClick={()=>{setShowMiSeleccion(true);setShowHamburger(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#2980b9"}}>
                  🏳️ <span>Mi Selección</span>
                </div>}
                <div onClick={()=>{
                    if(!mercadoAbierto&&!isAdmin){alert("🔒 No es momento de mercado. El admin habilitará el acceso próximamente.");return;}
                    setShowMercado(true);setShowHamburger(false);
                  }} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:(!mercadoAbierto&&!isAdmin)?C.textFaint:C.text,position:"relative"}}>
                  {(!mercadoAbierto&&!isAdmin)?"🔒":"🔄"} <span>Mercado</span>
                  {!mercadoAbierto&&!isAdmin&&<span style={{marginLeft:"auto",fontSize:9,color:"#c0392b",fontWeight:700}}>Cerrado</span>}
                  {mercadoAbierto&&(transferBadge>0||teamData?.mercado?.finalizado)&&<span style={{marginLeft:"auto",background:transferBadge>0?"#e74c3c":"#27ae60",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:800}}>{transferBadge>0?transferBadge:"✓"}</span>}
                </div>
                <div onClick={()=>{setMundialInitialTab("tabla");setShowMundial(true);setShowHamburger(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#7c3aed"}}>
                  🌍 <span>Mundial</span>
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,margin:"4px 0"}}/>
                <div onClick={()=>{saveTeam({darkMode:!teamData?.darkMode});setShowHamburger(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.text}}>
                  {teamData?.darkMode?"☀️":"🌙"} <span>{teamData?.darkMode?"Modo claro":"Modo oscuro"}</span>
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,margin:"4px 0"}}/>
                <div onClick={onLogout} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#e74c3c"}}>
                  🚪 <span>Salir</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🏆 Requisitos del desafío (Liga/Copa) */}
      {erroresAlineacion.length>0&&(
        <div style={{position:"relative",borderBottom:`1px solid ${C.border}`,background:C.card}}>
          <button onClick={()=>setShowRequisitos(v=>!v)}
            style={{width:"100%",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            <span style={{fontSize:11,fontWeight:800,color:erroresAlineacion.every(r=>r.cumplido)?"#27ae60":"#e67e22"}}>
              {erroresAlineacion.every(r=>r.cumplido)?"✅":"⚠️"} Requisitos {activeLineup?.name} ({erroresAlineacion.filter(r=>r.cumplido).length}/{erroresAlineacion.length})
            </span>
            <span style={{fontSize:11,color:C.textLight}}>{showRequisitos?"▲":"▼"}</span>
          </button>
          {showRequisitos&&(
            <div style={{padding:"4px 16px 10px 16px",display:"flex",flexDirection:"column",gap:6}}>
              {erroresAlineacion.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  <span style={{fontSize:13,flexShrink:0,marginTop:1}}>{r.cumplido?"✅":"⬜"}</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{r.texto}</div>
                    <div style={{fontSize:10,color:r.cumplido?"#27ae60":"#e67e22",fontFamily:"'DM Sans',sans-serif"}}>{r.detalle}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAINTENANCE STRIP - admin only */}
      {isAdmin&&(
        <div style={{width:"100%",background:TA.accentLight,borderBottom:`1px solid ${TA.accent}33`,padding:"4px 16px",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8}}>
          <MercadoToggle/>
          <MaintenanceToggle/>
        </div>
      )}

      <div style={{width:"100%",maxWidth:1060,padding:"0 14px"}}>

        {/* ADMIN PANEL */}
        {isAdmin&&(
          <div style={{paddingTop:12}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
              {/* Header */}
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {/* Fila 1: título + menú admin */}
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>setShowTeamsList(v=>!v)}
                    style={{flex:1,display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:0}}>
                    <span style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>
                      Equipos ({allTeams.length}) {showTeamsList?"▲":"▼"}
                    </span>
                  </button>
                  {/* Hamburger admin */}
                  <div style={{position:"relative"}}>
                    <button onClick={()=>setShowAdminMenu(v=>!v)}
                      style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${showAdminMenu?TA.accent:C.borderDark}`,background:showAdminMenu?TA.accent:C.inputBg,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:showAdminMenu?"#fff":C.textMid}}>
                      ☰
                    </button>
                    {showAdminMenu&&(
                      <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:500,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",minWidth:190,padding:"6px",display:"flex",flexDirection:"column",gap:2}}>
                        <div onClick={()=>{setShowAdminManager(true);setShowAdminMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.text}}>
                          👑 <span>Admins</span>
                        </div>
                        <div onClick={()=>{setShowPresidents(true);setShowAdminMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.text}}>
                          👤 <span>Presidentes</span>
                        </div>
                        <div onClick={()=>{setShowPool(true);setShowAdminMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.text}}>
                          🌍 <span>Pool</span>
                        </div>
                        <div onClick={async()=>{
                          setShowAdminMenu(false);
                          if(!window.confirm(`¿Activar el Mundial para los ${allTeams.length} equipos?`)) return;
                          for(const t of allTeams){
                            await updateDoc(doc(db,"teams",t.uid||t.id),{betaAccess:true});
                          }
                          alert("✅ Mundial activado para todos");
                        }} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#9b59b6"}}>
                          🌍 <span>Activar Mundial para todos</span>
                        </div>
                        <div onClick={()=>{setShowSelecciones(true);setShowAdminMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#2980b9"}}>
                          🏳️ <span>Selecciones</span>
                        </div>
                        <div onClick={()=>{setShowCompetencias(true);setShowAdminMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#e67e22"}}>
                          🏆 <span>Competencias</span>
                        </div>
                        {/* Mercado progress */}
                        <div style={{padding:"8px 12px",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textLight,display:"flex",alignItems:"center",gap:8}}>
                          📊 <span>Mercado: <strong style={{color:C.text}}>{allTeams.filter(t=>t.mercado?.finalizado).length}/{allTeams.length}</strong> finalizados</span>
                        </div>
                        <div onClick={()=>{setShowCreateTeam(true);setShowAdminMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.accentDark}}>
                          ➕ <span>Nuevo equipo</span>
                        </div>
                        <div style={{borderTop:`1px solid ${C.border}`,margin:"4px 0"}}/>
                        <div onClick={()=>{setShowImport(true);setShowAdminMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#27ae60"}}>
                          📥 <span>Importar Excel</span>
                        </div>
                        <div onClick={async()=>{
                          setShowAdminMenu(false);
                          if(!window.confirm("¿Limpiar jugadores duplicados de todos los equipos?")) return;
                          let fixed=0;
                          for(const t of allTeams){
                            const raw=t.squad||[];const seen=new Set();
                            const clean=raw.filter(p=>{const name=(p.name||"").trim().toLowerCase();if(!name||seen.has(name)) return false;seen.add(name);return true;});
                            if(clean.length<raw.length){await updateDoc(doc(db,"teams",t.id||t.uid),{squad:clean});fixed++;}
                          }
                          alert(`✅ ${fixed} equipos limpiados.`);
                        }} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#e67e22"}}>
                          🧹 <span>Limpiar duplicados</span>
                        </div>
                        <div onClick={async()=>{
                          setShowAdminMenu(false);
                          if(!window.confirm("¿Renombrar 'Alineación A' → 'Liga' y crear 'Copa' para todos los equipos?")) return;
                          let count=0;
                          for(const t of allTeams){
                            const ref=doc(db,"teams",t.id||t.uid);let lineups=[...(t.lineups||[])];let changed=false;
                            lineups=lineups.map(l=>{if(l.name==="Alineación A"||l.name==="Alineacion A"){changed=true;return{...l,name:"Liga"};}return l;});
                            if(!lineups.some(l=>l.name==="Copa")){lineups.push({id:`copa_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,name:"Copa",formation:"4-3-3",starters:{},subs:Array(7).fill(null),code:""});changed=true;}
                            if(changed){await updateDoc(ref,{lineups});count++;}
                          }
                          alert(`✅ ${count} equipos actualizados.`);
                        }} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#9b59b6"}}>
                          ⚽ <span>Liga/Copa todos</span>
                        </div>
                        <div onClick={async()=>{
                          setShowAdminMenu(false);
                          const opciones={
                            jugadores:{label:"jugadores (plantillas + pool global)",patch:t=>({squad:[]})},
                            plantillas:{label:"plantillas (alineaciones: titulares, banca, código)",patch:t=>({lineups:(t.lineups||[]).map(l=>({...l,starters:{},subs:Array(7).fill(null),code:""}))})},
                            presupuestos:{label:"presupuestos",patch:t=>({presupuesto:""})},
                            todo:{label:"TODO (jugadores + plantillas + presupuestos + mercado)",patch:t=>({squad:[],lineups:(t.lineups||[]).map(l=>({...l,starters:{},subs:Array(7).fill(null),code:""})),presupuesto:"",mercado:deleteField(),pendingTransfers:deleteField()})}
                          };
                          const choice=window.prompt("¿Qué quieres limpiar?\n\n1 = Jugadores\n2 = Plantillas\n3 = Presupuestos\n4 = TODO\n\nEscribe el número:");
                          const map={1:"jugadores",2:"plantillas",3:"presupuestos",4:"todo"};
                          const tipo=map[choice?.trim()];
                          if(!tipo){if(choice!==null) alert("Opción inválida.");return;}
                          const opt=opciones[tipo];
                          if(!window.confirm(`⚠️ Esto borrará ${opt.label} de los ${allTeams.length} equipos${tipo==="jugadores"||tipo==="todo"?" y vaciará la pool global":""}.\n\nEsta acción NO se puede deshacer. ¿Continuar?`)) return;
                          if(!window.confirm(`Última confirmación: ¿BORRAR ${opt.label.toUpperCase()} de verdad?`)) return;
                          const pin=window.prompt("Ingresa el PIN de seguridad:");
                          if(pin!=="0253"){alert("❌ PIN incorrecto. Acción cancelada.");return;}
                          let count=0;
                          for(const t of allTeams){
                            const ref=doc(db,"teams",t.id||t.uid);
                            await updateDoc(ref,opt.patch(t));
                            count++;
                          }
                          if(tipo==="jugadores"||tipo==="todo") await setDoc(doc(db,"pool","players"),{});
                          alert(`✅ ${count} equipos limpiados (${opt.label}).`);
                        }} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#c0392b"}}>
                          🧨 <span>Limpiar TODO</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Collapsible Aviso/Twitch admin */}
              <div style={{marginTop:10}}>
                <button onClick={()=>setShowLiveAdmin(v=>!v)}
                  style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"none",border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5}}>📺 Transmisión / Avisos</span>
                  <span style={{fontSize:11,color:C.textLight}}>{showLiveAdmin?"▲":"▼"}</span>
                </button>
                {showLiveAdmin&&<div style={{marginTop:8}}><AvisoTwitchAdmin/></div>}
              </div>
              {/* Collapsible teams list */}
              {showTeamsList&&(
                <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:5}}>
                  {[...allTeams].sort((a,b)=>(a.teamName||"").localeCompare(b.teamName||"")).map(t=>{
                    const isTeamAdmin=adminsList.some(a=>a.id===t.uid);
                    const isMe=t.uid===user.uid;
                    const isSelected=viewingTeam&&(viewingTeam.id||viewingTeam.uid)===(t.id||t.uid);
                    return(
                      <div key={t.id||t.uid} style={{padding:"7px 10px",borderRadius:9,border:`1.5px solid ${isSelected?C.accent:C.border}`,background:isSelected?C.goldLight:C.inputBg}}>
                        {/* Fila principal */}
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:getTeamColor(t.teamColor).bg,flexShrink:0,border:"1px solid rgba(0,0,0,0.15)"}}/>
                        <span style={{fontSize:12,fontWeight:700,color:C.text,flex:1,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.teamName}</span>
                        <span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{(t.squad||[]).length}j</span>
                        {isTeamAdmin&&<span style={{fontSize:8,fontWeight:800,color:C.accent,background:C.goldLight,padding:"1px 5px",borderRadius:8,fontFamily:"'DM Sans',sans-serif",border:`1px solid ${C.accent}`,flexShrink:0}}>ADMIN</span>}
                        {/* Beta Access */}
                        <button onClick={async e=>{e.stopPropagation();await updateDoc(doc(db,"teams",t.uid||t.id),{betaAccess:!t.betaAccess});}}
                          title="Beta access (Mundial)"
                          style={{padding:"2px 6px",borderRadius:5,border:`1px solid ${t.betaAccess?"#9b59b6":C.borderDark}`,background:t.betaAccess?"#9b59b6":"transparent",color:t.betaAccess?"#fff":C.textFaint,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
                          β
                        </button>
                        </div>
                        {/* Segunda línea — selección y acciones */}
                        <div style={{display:"flex",gap:4,marginTop:5,alignItems:"center",flexWrap:"wrap"}}>
                        <NationalTeamPicker
                          teamId={t.uid||t.id}
                          current={t.nationalTeam||""}
                          allSels={allSels}
                        />
                        <input value={t.pais||""} placeholder="País"
                          onChange={e=>{const v=e.target.value;setAllTeams(prev=>prev.map(x=>(x.uid||x.id)===(t.uid||t.id)?{...x,pais:v}:x));}}
                          onBlur={async e=>{await updateDoc(doc(db,"teams",t.uid||t.id),{pais:e.target.value});}}
                          style={{width:70,padding:"4px 7px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:10,fontFamily:"'DM Sans',sans-serif",outline:"none",flexShrink:0}}/>
                        {!isMe?(
                          <>
                            <button onClick={()=>setViewingTeam(isSelected?null:t)}
                              style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${isSelected?C.accent:C.borderDark}`,background:isSelected?C.accent:C.card,color:isSelected?"#fff":C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
                              {isSelected?"✕":"Ver"}
                            </button>
                            <button onClick={()=>setTransferTeam(t)} style={{padding:"4px 7px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.card,color:C.textMid,fontSize:11,cursor:"pointer",flexShrink:0}}>🔄</button>
                            <button onClick={()=>setDeleteTeamTarget(t)} style={{padding:"4px 7px",borderRadius:7,border:"1px solid #ffcccc",background:"#fff5f5",color:"#c0392b",fontSize:11,cursor:"pointer",flexShrink:0}}>🗑️</button>
                          </>
                        ):<span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Tú</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {viewingTeam&&<AdminTeamEditor teamData={viewingTeam} pool={pool} allTeamsRef={allTeams}/>}
          </div>
        )}

        {/* LINEUP PANEL */}
        {showLineupPanel&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:13,marginTop:10,boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:9}}>
              {lineups.map(l=>(
                <div key={l.id} style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>{if(!l.locked){setActiveLineupId(l.id);setShowLineupPanel(false);}}}
                    style={{flex:1,padding:"8px 13px",borderRadius:9,border:`1.5px solid ${activeLineupId===l.id?TA.accent:C.borderDark}`,background:activeLineupId===l.id?TA.accent:C.inputBg,color:activeLineupId===l.id?"#fff":l.locked?C.textFaint:C.textMid,fontSize:12,fontWeight:700,cursor:l.locked?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left",display:"flex",alignItems:"center",gap:6}}>
                    {l.locked&&<span style={{fontSize:11}}>🔒</span>}
                    {l.name}
                  </button>
                  {!l.locked&&<>
                    <button onClick={()=>{
                      const newName=window.prompt("Nuevo nombre:",l.name);
                      if(newName&&newName.trim()){const nl=lineups.map(x=>x.id===l.id?{...x,name:newName.trim()}:x);saveTeam({lineups:nl});}
                    }} style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,fontSize:12,cursor:"pointer"}}>✏️</button>
                    {lineups.length>1&&(
                      <button onClick={async()=>{
                        if(!window.confirm(`¿Borrar "${l.name}"?`)) return;
                        const nl=lineups.filter(x=>x.id!==l.id);
                        await saveTeam({lineups:nl});
                        if(activeLineupId===l.id) setActiveLineupId(nl[0].id);
                      }} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #ffcccc",background:"#fff5f5",color:"#c0392b",fontSize:12,cursor:"pointer"}}>🗑️</button>
                    )}
                  </>}
                  {l.locked&&<span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Bloqueada</span>}
                </div>
              ))}
            </div>
            {/* Tab selección nacional */}
            {teamData?.nationalTeam&&(
              <div style={{marginBottom:6}}>
                <button onClick={()=>{setActiveLineupId("sel_nacional");setShowLineupPanel(false);}}
                  style={{width:"100%",padding:"8px 13px",borderRadius:9,border:`1.5px solid ${activeLineupId==="sel_nacional"?"#1a3a5c":C.borderDark}`,background:activeLineupId==="sel_nacional"?"#1a3a5c":C.inputBg,color:activeLineupId==="sel_nacional"?"#fff":C.textMid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left",display:"flex",alignItems:"center",gap:6}}>
                  🏳️ {selNacional?.country||teamData.nationalTeam} <span style={{fontSize:10,fontWeight:400,marginLeft:4,opacity:0.7}}>Solo lectura</span>
                </button>
              </div>
            )}
              );
            })()}
            <div style={{fontSize:10,color:C.textLight,marginBottom:9,fontFamily:"'DM Sans',sans-serif"}}>Todas usan los mismos {squad.length} jugadores de la plantilla.</div>
            <div style={{display:"flex",gap:8}}>
              <input value={newLineupName} onChange={e=>setNewLineupName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLineup()} placeholder="Nueva alineación…"
                style={{flex:1,padding:"8px 12px",borderRadius:9,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                onFocus={e=>e.target.style.borderColor=TA.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              <button onClick={addLineup} style={{padding:"8px 15px",borderRadius:9,background:TA.accent,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"'DM Sans',sans-serif"}}>+ Crear</button>
            </div>
          </div>
        )}

        {/* FORMATION PANEL */}
        {showFormations&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:12,marginTop:10,display:"flex",gap:5,flexWrap:"wrap",boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
            {Object.keys(FORMATIONS).map(f=>(
              <button key={f} onClick={()=>{
                // Preserve players when changing formation
                updateActive(l=>{
                  const oldPositions=FORMATIONS[l.formation]||FORMATIONS["4-3-3"];
                  const newPositions=FORMATIONS[f]||FORMATIONS["4-3-3"];
                  const oldStarters=l.starters||{};
                  // Collect all old players with their position labels
                  const oldPlayers=oldPositions.map(p=>({label:p.label,player:oldStarters[p.id]||null})).filter(p=>p.player);
                  // Try to map to new positions by label
                  const newStarters={};
                  const used=new Set();
                  newPositions.forEach(np=>{
                    const match=oldPlayers.find(op=>!used.has(op)&&op.label===np.label);
                    if(match){newStarters[np.id]=match.player;used.add(match);}
                  });
                  // Fill remaining new positions with leftover players (in order)
                  const leftover=oldPlayers.filter(op=>!used.has(op));
                  newPositions.forEach(np=>{
                    if(!newStarters[np.id]&&leftover.length>0) newStarters[np.id]=leftover.shift().player;
                  });
                  return{formation:f,starters:newStarters};
                });
                setShowFormations(false);
              }}
                style={{padding:"5px 11px",borderRadius:8,border:`1.5px solid ${activeLineup?.formation===f?TA.accent:C.borderDark}`,background:activeLineup?.formation===f?TA.accent:C.inputBg,color:activeLineup?.formation===f?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace"}}>
                {f}
              </button>
            ))}
          </div>
        )}

        {/* CODE FIELD */}
        {!viewingTeam&&!showSquadList&&activeLineup&&(
          <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>Código FC26:</span>
            <input value={activeLineup.code||""} maxLength={30} placeholder="Ej: 8A3F-9K2D"
              onChange={e=>{const v=e.target.value.slice(0,30);updateActive(()=>({code:v}));}}
              style={{flex:1,padding:"5px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"monospace",maxWidth:200}}
              onFocus={e=>e.target.style.borderColor=TA.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
            {activeLineup.code&&<span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{activeLineup.code.length}/30</span>}
            <button onClick={()=>setShareLineup(true)}
              style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${TA.accent}`,background:TA.accentLight,color:TA.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>
              📤 Compartir
            </button>
          </div>
        )}

        {/* SETTINGS PANEL */}
        {showSettings&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginTop:10,boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:16}}>✏️</span>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:600,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Nombre del equipo</div>
                <input value={teamData.teamName} onChange={e=>saveTeam({teamName:e.target.value})}
                  style={{width:"100%",background:C.inputBg,border:`1px solid ${C.borderDark}`,borderRadius:9,padding:"8px 12px",color:C.text,fontSize:14,fontWeight:700,outline:"none",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              </div>
            </div>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:600,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>🎨 Color del equipo</div>
              <ColorPicker selected={teamData.teamColor||"blue"} onChange={color=>saveTeam({teamColor:color})}/>
            </div>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:16}}>🌍</span>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:600,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>País del equipo</div>
                <div style={{width:"100%",background:C.inputBg,border:`1px solid ${C.borderDark}`,borderRadius:9,padding:"8px 12px",color:teamData.pais?C.text:C.textFaint,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
                  {teamData.pais||"No asignado"}
                </div>
                <div style={{fontSize:9,color:C.textFaint,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Asignado por el admin · se usa para validar jugadores "nacionales"</div>
              </div>
            </div>
            {/* Director Técnico */}
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:600,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>🧑‍💼 Director Técnico</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <input value={teamData.dt?.name||""} onChange={e=>saveTeam({dt:{...(teamData.dt||{}),name:e.target.value}})}
                  placeholder="Nombre del DT…"
                  style={{width:"100%",background:C.inputBg,border:`1px solid ${C.borderDark}`,borderRadius:9,padding:"7px 12px",color:C.text,fontSize:13,fontWeight:700,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
                <div style={{display:"flex",gap:6}}>
                  <input value={teamData.dt?.nationality||""} onChange={e=>saveTeam({dt:{...(teamData.dt||{}),nationality:e.target.value}})}
                    placeholder="Nacionalidad"
                    style={{flex:1,background:C.inputBg,border:`1px solid ${C.borderDark}`,borderRadius:9,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
                  <select value={teamData.dt?.style||""} onChange={e=>saveTeam({dt:{...(teamData.dt||{}),style:e.target.value}})}
                    style={{flex:1,background:C.inputBg,border:`1px solid ${C.borderDark}`,borderRadius:9,padding:"7px 10px",color:teamData.dt?.style?C.text:C.textFaint,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
                    <option value="">Estilo de juego</option>
                    <option value="Ofensivo">Ofensivo</option>
                    <option value="Defensivo">Defensivo</option>
                    <option value="Posesión">Posesión</option>
                    <option value="Contraataque">Contraataque</option>
                    <option value="Presión alta">Presión alta</option>
                    <option value="Directo">Directo</option>
                    <option value="Equilibrado">Equilibrado</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Budget display - visible to all, editable by admin */}
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.goldLight+"44"}}>
              <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>💰 Presupuesto</div>
              {isAdmin?(
                <input value={teamData.presupuesto||""} onChange={e=>saveTeam({presupuesto:e.target.value})}
                  placeholder="Ej: 500M · Créditos · Monedas…"
                  style={{width:"100%",background:C.inputBg,border:`1px solid ${C.borderDark}`,borderRadius:9,padding:"8px 12px",color:C.text,fontSize:13,fontWeight:700,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              ):(
                <div style={{fontSize:20,fontWeight:800,color:C.accent,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
                  {teamData.presupuesto||<span style={{fontSize:12,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",fontWeight:400}}>Sin definir</span>}
                </div>
              )}
            </div>
            {/* Squad management */}
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14}}>👥</span>
                <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Plantilla</div>
                <span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{squad.length}/26</span>
                <button onClick={()=>setShowSquadManager(true)}
                  style={{marginLeft:"auto",padding:"6px 13px",background:TA.accent,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Gestionar
                </button>
              </div>
            </div>
            {/* Squad import lock - admin only */}
            {isAdmin&&(
            <div style={{padding:"10px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14}}>{teamData.squadLocked?"🔒":"🔓"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Bloquear importación Excel</div>
                  <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>Si está bloqueado, el Excel no reemplazará esta plantilla</div>
                </div>
                <button onClick={()=>saveTeam({squadLocked:!teamData.squadLocked})}
                  style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${teamData.squadLocked?C.accent:C.borderDark}`,background:teamData.squadLocked?C.goldLight:C.inputBg,color:teamData.squadLocked?C.accent:C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  {teamData.squadLocked?"Bloqueado":"Bloquear"}
                </button>
              </div>
            </div>
            )}
          </div>
        )}

        {/* FIELD + BENCH + RESERVES — ocultar si admin está viendo otro equipo o si showSquadList */}
        {!viewingTeam&&!showSquadList&&<div style={{paddingTop:12,display:"flex",gap:14,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 260px",minWidth:240}}>
            <Field positions={positions} lineup={activeLineup} readOnly={!!activeLineup?.locked}
              onClickPos={(id,label)=>setPickModal({type:"starter",posId:id,posLabel:label})}
              onRemovePos={handleRemovePos}
              dragOverPos={dragOverPos} onDragOver={setDragOverPos} onDragLeave={()=>setDragOverPos(null)} onDrop={handleDrop}
              onDragStartPos={posId=>{dragFromPosId.current=posId;dragSubIdx.current=null;}}
              teamColor={teamData?.teamColor}/>
          </div>
          <div style={{width:"100%",order:3}}>
            <Bench subs={activeLineup?.subs} readOnly={!!activeLineup?.locked}
              onClickSub={i=>{
                const sub=activeLineup?.subs?.[i];
                if(sub) setPickModal({type:"subMenu",subIdx:i,posLabel:`Suplente ${i+1}`,currentPlayer:sub});
                else setPickModal({type:"sub",subIdx:i,posLabel:`Suplente ${i+1}`});
              }}
              onDragStart={i=>{dragSubIdx.current=i;dragFromPosId.current=null;}}
              teamColor={teamData?.teamColor}/>
          </div>
          {/* RESERVES */}
          {(()=>{
            const norm=s=>String(s||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
            const usedNames=new Set([
              ...Object.values(activeLineup?.starters||{}).filter(Boolean).map(p=>norm(p.name)),
              ...(activeLineup?.subs||[]).filter(Boolean).map(p=>norm(p.name))
            ]);
            const usedKeys=new Set([
              ...Object.values(activeLineup?.starters||{}).filter(Boolean).flatMap(p=>[p.poolKey,p.id].filter(Boolean)),
              ...(activeLineup?.subs||[]).filter(Boolean).flatMap(p=>[p.poolKey,p.id].filter(Boolean))
            ]);
            const reserves=squad.filter(p=>
              !usedKeys.has(p.poolKey)&&
              !usedKeys.has(p.id)&&
              !usedNames.has(norm(p.name))
            );
            if(reserves.length===0) return null;
            return(
              <div style={{width:"100%",order:4,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 14px",boxShadow:`0 2px 12px rgba(0,0,0,0.04)`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
                  <div style={{width:3,height:16,background:C.borderDark,borderRadius:2}}/>
                  <span style={{fontSize:13,fontWeight:800,color:C.textLight,letterSpacing:1.5,fontFamily:"'Bebas Neue',sans-serif"}}>RESERVAS</span>
                  <span style={{marginLeft:"auto",fontSize:10,color:C.textLight,background:C.inputBg,padding:"2px 8px",borderRadius:20,fontWeight:700,fontFamily:"'DM Sans',sans-serif",border:`1px solid ${C.border}`}}>{reserves.length}</span>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {reserves.map(p=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`}}>
                      <Avatar name={p.name} size={32}/>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:C.textMid,fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                        <div style={{fontSize:9,color:C.textLight,fontFamily:"monospace"}}>{p.pos}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>}
      </div>

      {showAddPlayer&&<AddPlayerModal currentCount={squad.length} pool={pool} teamName={teamData?.teamName} isAdmin={isAdmin}
        onAdd={async p=>{await saveTeam({squad:[...squad,p]});await addToPool(p,teamData?.teamName);setShowAddPlayer(false);}}
        onClose={()=>setShowAddPlayer(false)}/>}

      {editingPlayer&&<AddPlayerModal currentCount={squad.length} pool={pool} teamName={teamData?.teamName} isAdmin={isAdmin}
        editPlayer={editingPlayer}
        onSaveEdit={async updated=>{
          const ns=squad.map(p=>p.id===updated.id?updated:p);
          await saveTeam({squad:ns});
          setEditingPlayer(null);
        }}
        onAdd={()=>{}} onClose={()=>setEditingPlayer(null)}/>}
      {pickModal&&<PickFromSquad squad={squad} posLabel={pickModal.posLabel} onPick={handlePick} onClose={()=>setPickModal(null)}
        usedIds={pickModal.type==="starter"
          ? Object.entries(activeLineup?.starters||{}).filter(([k,p])=>p&&k!==pickModal.posId).map(([,p])=>p.poolKey||p.id)
          : [...Object.values(activeLineup?.starters||{}).filter(Boolean).map(p=>p.poolKey||p.id),...(activeLineup?.subs||[]).filter((p,i)=>p&&i!==pickModal.subIdx).map(p=>p.poolKey||p.id)]
        }
        posFilter={pickModal.type==="starter"?pickModal.posLabel:null} isBench={pickModal.type==="sub"}/>}

      {/* IMPORT MODAL */}
      {showImport&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setShowImport(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:400,boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>📥 IMPORTAR PLANTILLAS</div>
              <div style={{fontSize:11,color:C.textLight,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Liga Simulada EAFC26 · 32 equipos · 828 jugadores</div>
            </div>
            <div style={{padding:"16px 18px 20px"}}>
              <div style={{background:"#fffbf0",border:"1px solid #f0d060",borderRadius:10,padding:"10px 13px",marginBottom:16,fontSize:11,color:"#7a6000",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                ⚠️ <strong>Esto reemplazará la plantilla completa</strong> de cada equipo que coincida por nombre. Las alineaciones existentes se conservan.
              </div>
              <ImportButton allTeams={allTeams} pool={pool} user={user} onDone={()=>setShowImport(false)}/>
            </div>
          </div>
        </div>
      )}

      {/* PRESIDENTS MODAL */}
      {showPresidents&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setShowPresidents(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:440,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>👤 PRESIDENTES</span>
              <span style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{allTeams.filter(t=>t.uid).length} activos</span>
              <button onClick={()=>setShowPresidents(false)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"10px 14px 16px",display:"flex",flexDirection:"column",gap:6}}>
              {[...allTeams].sort((a,b)=>(a.teamName||"").localeCompare(b.teamName||"")).map(t=>{
                const isTeamAdmin=adminsList.some(a=>a.id===t.uid);
                const hasOwner=t.uid&&t.uid!=="";
                return(
                  <div key={t.id||t.uid} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:getTeamColor(t.teamColor).bg,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{t.teamName}</div>
                        {isTeamAdmin&&<span style={{fontSize:8,fontWeight:800,color:C.accent,background:C.goldLight,padding:"1px 5px",borderRadius:8,fontFamily:"'DM Sans',sans-serif",border:`1px solid ${C.accent}`,flexShrink:0}}>ADMIN</span>}
                      </div>
                      {hasOwner?(
                        <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.email}</div>
                      ):(
                        <div style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",fontStyle:"italic"}}>Sin presidente</div>
                      )}
                    </div>
                    {hasOwner&&t.uid!==user.uid&&(
                      <button onClick={async()=>{
                        if(!window.confirm(`¿Expulsar a ${t.email} de la liga?\n\nEl equipo "${t.teamName}" quedará sin dueño.`)) return;
                        await updateDoc(doc(db,"teams",t.id||t.uid),{uid:"",email:""});
                        // Remove admin if they were one
                        if(isTeamAdmin) await deleteDoc(doc(db,"admins",t.uid));
                        alert(`✅ ${t.email} fue expulsado. El equipo quedó disponible.`);
                      }} style={{padding:"5px 10px",borderRadius:8,border:"1px solid #ffcccc",background:"#fff5f5",color:"#c0392b",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>
                        Expulsar
                      </button>
                    )}
                    {t.uid===user.uid&&<span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Tú</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN MANAGER MODAL */}
      {showAdminManager&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setShowAdminManager(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:420,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>👑 ADMINISTRADORES</span>
              <button onClick={()=>setShowAdminManager(false)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"12px 16px 16px",display:"flex",flexDirection:"column",gap:8}}>
              {/* Add admin by email */}
              <div style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:4}}>
                <div style={{fontSize:11,fontWeight:600,color:C.textLight,marginBottom:8,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Agregar nuevo admin</div>
                <div style={{display:"flex",gap:8}}>
                  <input id="newAdminEmailInput" placeholder="correo@ejemplo.com"
                    style={{flex:1,padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.borderDark}`,background:C.card,color:C.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
                  <button onClick={async()=>{
                    const email=document.getElementById("newAdminEmailInput").value.trim();
                    if(!email) return;
                    const snap=await getDocs(collection(db,"teams"));
                    let foundUid=null;
                    snap.forEach(d=>{if(d.data().email===email) foundUid=d.id;});
                    if(!foundUid){alert("❌ Usuario no encontrado. Debe registrarse primero.");return;}
                    await setDoc(doc(db,"admins",foundUid),{email,uid:foundUid});
                    document.getElementById("newAdminEmailInput").value="";
                    alert("✅ Admin agregado.");
                  }} style={{padding:"8px 14px",borderRadius:9,background:C.accent,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"'DM Sans',sans-serif"}}>
                    + Admin
                  </button>
                </div>
              </div>
              {/* Current admins list */}
              {allTeams.filter(t=>t.uid).map(t=>{
                const isAdmin=adminsList?.some(a=>a.id===t.uid);
                return(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:isAdmin?C.goldLight:C.inputBg,border:`1px solid ${isAdmin?C.accent:C.border}`}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{t.teamName}</div>
                      <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{t.email}</div>
                    </div>
                    {isAdmin?(
                      t.uid!==user.uid?(
                        <button onClick={async()=>{
                          if(!window.confirm(`¿Quitar admin a ${t.teamName}?`)) return;
                          await deleteDoc(doc(db,"admins",t.uid));
                        }} style={{padding:"4px 10px",borderRadius:7,border:"1px solid #ffcccc",background:"#fff5f5",color:"#c0392b",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                          Quitar admin
                        </button>
                      ):<span style={{fontSize:10,color:C.accent,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Tú 👑</span>
                    ):(
                      <button onClick={async()=>{
                        await setDoc(doc(db,"admins",t.uid),{email:t.email,uid:t.uid});
                      }} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.accent}`,background:C.goldLight,color:C.accentDark,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                        + Admin
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DELETE TEAM MODAL */}
      {deleteTeamTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setDeleteTeamTarget(null)}>
          <div style={{background:C.card,border:"2px solid #c0392b",borderRadius:20,width:"100%",maxWidth:360,boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:14,fontWeight:800,color:"#c0392b",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>⚠️ ELIMINAR EQUIPO</div>
            </div>
            <div style={{padding:"16px 18px 20px"}}>
              <p style={{fontSize:13,color:C.text,fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>
                ¿Estás seguro de eliminar <strong>{deleteTeamTarget.teamName}</strong>?<br/>
                <span style={{color:"#c0392b",fontSize:11}}>Se borrarán plantilla, alineaciones y el equipo quedará eliminado permanentemente.</span>
              </p>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setDeleteTeamTarget(null)}
                  style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inputBg,color:C.textMid,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Cancelar
                </button>
                <button onClick={async()=>{
                  const t=deleteTeamTarget;
                  // Remove all pool entries for this team
                  const poolRef=doc(db,"pool","players");
                  const poolSnap=await getDoc(poolRef);
                  if(poolSnap.exists()){
                    const poolData={...poolSnap.data()};
                    Object.keys(poolData).forEach(k=>{if(poolData[k].teamUid===t.uid||poolData[k].teamName===t.teamName) delete poolData[k];});
                    await setDoc(poolRef,poolData);
                  }
                  // Delete team doc
                  await deleteDoc(doc(db,"teams",t.id||t.uid));
                  setDeleteTeamTarget(null);
                  if(viewingTeam&&(viewingTeam.id||viewingTeam.uid)===(t.id||t.uid)) setViewingTeam(null);
                }}
                  style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#c0392b",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
                  ELIMINAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER TEAM MODAL */}
      {transferTeam&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setTransferTeam(null)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:420,boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>🔄 TRANSFERIR EQUIPO</span>
              <button onClick={()=>setTransferTeam(null)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{padding:"16px 18px 20px"}}>
              <div style={{fontSize:12,color:C.textLight,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
                Equipo: <strong style={{color:C.text}}>{transferTeam.teamName}</strong><br/>
                Dueño actual: <strong style={{color:C.text}}>{transferTeam.email||"Sin dueño"}</strong>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:C.textLight,marginBottom:8,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Asignar a usuario registrado</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:260,overflowY:"auto",marginBottom:12}}>
                {allTeams.filter(t=>t.uid&&t.uid!==transferTeam.uid).map(t=>(
                  <div key={t.id||t.uid} onClick={async()=>{
                    if(!window.confirm(`¿Asignar "${transferTeam.teamName}" a ${t.email}?`)) return;
                    const teamDocId=transferTeam.id||transferTeam.uid;
                    // Quitar dueño del equipo anterior del nuevo presidente
                    const prevTeamSnap=await getDocs(collection(db,"teams"));
                    const prevTeamDoc=prevTeamSnap.docs.find(d=>d.data().uid===t.uid&&d.id!==teamDocId);
                    if(prevTeamDoc) await updateDoc(doc(db,"teams",prevTeamDoc.id),{uid:"",email:""});
                    // Asignar nuevo dueño
                    await updateDoc(doc(db,"teams",teamDocId),{uid:t.uid,email:t.email});
                    // Actualizar pool
                    const poolRef=doc(db,"pool","players");
                    const poolSnap=await getDoc(poolRef);
                    if(poolSnap.exists()){
                      const pd={...poolSnap.data()};
                      Object.keys(pd).forEach(k=>{if(pd[k].teamName===transferTeam.teamName){pd[k]={...pd[k],teamUid:t.uid};}});
                      await setDoc(poolRef,pd);
                    }
                    setTransferTeam(null);
                    alert(`✅ "${transferTeam.teamName}" asignado a ${t.email}`);
                  }}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`,cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <Avatar name={t.teamName} size={32} colorId={t.teamColor}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{t.teamName}</div>
                      <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{t.email||<em>Sin dueño</em>}</div>
                    </div>
                    {t.uid&&<span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{t.email}</span>}
                  </div>
                ))}
              </div>
              {/* Assign by email manually */}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:C.textLight,marginBottom:6,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>O asignar por correo</div>
                <div style={{display:"flex",gap:8}}>
                  <input id="transfer-email-input" type="email" placeholder="correo@ejemplo.com"
                    style={{flex:1,padding:"8px 12px",borderRadius:9,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
                  <button onClick={async()=>{
                    const emailInput=document.getElementById("transfer-email-input").value.trim().toLowerCase();
                    if(!emailInput){alert("Ingresa un correo");return;}
                    // Find user by email across all teams and admins
                    const teamsSnap=await getDocs(collection(db,"teams"));
                    const adminSnap=await getDocs(collection(db,"admins"));
                    let targetUid=null, targetEmail=emailInput;
                    // Check teams
                    const teamWithEmail=teamsSnap.docs.find(d=>d.data().email?.toLowerCase()===emailInput);
                    if(teamWithEmail){targetUid=teamWithEmail.data().uid;}
                    // Check admins
                    if(!targetUid){const adminDoc=adminSnap.docs.find(d=>d.data().email?.toLowerCase()===emailInput);if(adminDoc){targetUid=adminDoc.id;targetEmail=adminDoc.data().email;}}
                    if(!targetUid){alert(`No se encontró ningún usuario con el correo "${emailInput}"`);return;}
                    if(!window.confirm(`¿Asignar "${transferTeam.teamName}" a ${targetEmail}?`)) return;
                    const teamDocId=transferTeam.id||transferTeam.uid;
                    // Remove from previous team
                    const prevDoc=teamsSnap.docs.find(d=>d.data().uid===targetUid&&d.id!==teamDocId);
                    if(prevDoc) await updateDoc(doc(db,"teams",prevDoc.id),{uid:"",email:""});
                    await updateDoc(doc(db,"teams",teamDocId),{uid:targetUid,email:targetEmail});
                    setTransferTeam(null);
                    alert(`✅ "${transferTeam.teamName}" asignado a ${targetEmail}`);
                  }} style={{padding:"8px 14px",borderRadius:9,background:C.accent,color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    Asignar
                  </button>
                </div>
              </div>
              <button onClick={async()=>{
                if(!window.confirm(`¿Dejar "${transferTeam.teamName}" sin dueño?`)) return;
                await updateDoc(doc(db,"teams",transferTeam.id||transferTeam.uid),{uid:"",email:""});
                setTransferTeam(null);
              }} style={{width:"100%",padding:"10px",background:"#fff5f5",color:"#c0392b",border:"1px solid #ffcccc",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                Dejar sin dueño
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      {showCreateTeam&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setShowCreateTeam(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:380,boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>CREAR EQUIPO VACÍO</span>
              <button onClick={()=>setShowCreateTeam(false)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{padding:"16px 18px 20px"}}>
              <div style={{fontSize:11,color:C.textLight,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>El equipo quedará disponible para que un usuario lo tome al registrarse.</div>
              <input id="newTeamNameAdmin" placeholder="Nombre del equipo…"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",marginBottom:12}}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              <button onClick={async()=>{
                const name=document.getElementById("newTeamNameAdmin").value.trim();
                if(!name) return;
                const id=`team_${Date.now()}`;
                await setDoc(doc(db,"teams",id),{uid:"",email:"",teamName:name,squad:[],lineups:[{id:"a",name:"Liga",formation:"4-3-3",starters:{},subs:Array(7).fill(null)},{id:"b",name:"Copa",formation:"4-3-3",starters:{},subs:Array(7).fill(null)}],createdAt:new Date().toISOString()});
                setShowCreateTeam(false);
                alert(`✅ Equipo "${name}" creado`);
              }} style={{width:"100%",padding:"13px",background:C.accent,color:"#fff",border:"none",borderRadius:11,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>
                CREAR EQUIPO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POOL MODAL */}
      {showPool&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setShowPool(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:500,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>🌍 POOL GLOBAL DE JUGADORES</span>
              <span style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{Object.keys(pool).length} jugadores</span>
              <button onClick={()=>setShowPool(false)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:30,height:30,color:C.textMid,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            {/* Search bar */}
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
              <input id="pool-admin-search" autoFocus placeholder="🔍 Buscar jugador..." defaultValue=""
                onChange={e=>{const v=e.target.value;document.querySelectorAll('[data-pool-row]').forEach(el=>{const name=el.dataset.name||"";const team=el.dataset.team||"";el.style.display=(name+team).toLowerCase().includes(v.toLowerCase())?"":"none";});document.querySelectorAll('[data-pool-header]').forEach(el=>{const next=el.nextElementSibling;el.style.display=next&&next.style.display!=="none"?"":"none";});}}
                style={{width:"100%",padding:"8px 12px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"10px 14px 16px",display:"flex",flexDirection:"column",gap:5}}>
              {Object.keys(pool).length===0&&<div style={{textAlign:"center",color:C.textFaint,fontSize:13,padding:"32px 0",fontFamily:"'DM Sans',sans-serif"}}>No hay jugadores en el pool todavía.</div>}
              {(()=>{
                const POS_ORDER=["POR","DFC","DFD","DFI","MCD","MC","MCO","MD","MI","ED","EI","DC"];
                const sorted=Object.entries(pool).sort((a,b)=>{
                  const teamCmp=(a[1].teamName||"").localeCompare(b[1].teamName||"");
                  if(teamCmp!==0) return teamCmp;
                  const posA=POS_ORDER.indexOf(a[1].pos?.split("/")?.[0]);
                  const posB=POS_ORDER.indexOf(b[1].pos?.split("/")?.[0]);
                  return(posA===-1?99:posA)-(posB===-1?99:posB);
                });
                let lastTeam=null;
                return sorted.map(([key,p])=>{
                  const showTeamHeader=p.teamName!==lastTeam;
                  lastTeam=p.teamName;
                  return(
                    <div key={key}>
                      {showTeamHeader&&<div data-pool-header style={{padding:"8px 2px 3px",borderBottom:`1px solid ${C.border}`,marginBottom:3,marginTop:lastTeam?10:0}}>
                        <span style={{fontSize:10,fontWeight:800,color:C.textMid,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>⚽ {p.teamName}</span>
                      </div>}
                      <div data-pool-row data-name={(p.name||"").toLowerCase()} data-team={(p.teamName||"").toLowerCase()}
                        onClick={()=>setPoolPlayer({key,p})}
                        style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:8,background:C.inputBg,border:`1px solid ${C.border}`,marginBottom:3,cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:`linear-gradient(135deg,${C.accentDark},${C.accent})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontSize:9,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif"}}>{p.overall||p.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name} <span style={{fontWeight:400,color:C.textLight}}>· {p.teamName}</span></div>
                          {(p.country||p.overall||p.age)&&<div style={{fontSize:9,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{[p.country,p.age?`${p.age}a`:null,p.overall?`${p.overall}⭐`:null].filter(Boolean).join(" · ")}</div>}
                        </div>
                        <span style={{fontSize:8,fontWeight:700,color:C.accent,background:C.goldLight,padding:"2px 6px",borderRadius:5,fontFamily:"monospace",border:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>{p.pos?.split("/")?.[0]}</span>
                        <button onClick={async e=>{
                          e.stopPropagation();
                          if(!window.confirm(`¿Eliminar a ${p.name} del pool y de la plantilla de ${p.teamName}?`)) return;
                          // Remove from pool
                          const poolRef=doc(db,"pool","players");
                          const snap=await getDoc(poolRef);
                          if(snap.exists()){const d={...snap.data()};delete d[key];await setDoc(poolRef,d);}
                          // Remove from team squad
                          if(p.teamUid){
                            const teamRef=doc(db,"teams",p.teamUid);
                            const teamSnap=await getDoc(teamRef);
                            if(teamSnap.exists()){
                              const squad=teamSnap.data().squad||[];
                              const ns=squad.filter(s=>s.poolKey!==key&&s.id!==key);
                              await updateDoc(teamRef,{squad:ns});
                            }
                          }
                        }} style={{background:"none",border:"none",color:"#ffaaaa",cursor:"pointer",fontSize:12,padding:"2px 4px",flexShrink:0}}>✕</button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {showPublicPool&&<PublicPoolModal pool={pool} allTeams={allTeams} onClose={()=>setShowPublicPool(false)} setPoolPlayer={setPoolPlayer}/>}
      {/* POOL PLAYER DETAIL */}
      {poolPlayer&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setPoolPlayer(null)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:320,boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
              <Avatar name={poolPlayer.p?.name||poolPlayer.name} size={44} colorId={allTeams.find(t=>t.teamName===(poolPlayer.p?.teamName||poolPlayer.teamName))?.teamColor}/>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{poolPlayer.p?.name||poolPlayer.name}</div>
                <div style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>⚽ {poolPlayer.p?.teamName||poolPlayer.teamName}</div>
              </div>
              <button onClick={()=>setPoolPlayer(null)} style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:0}}>
              {[
                ["Posición",(poolPlayer.p?.pos||poolPlayer.pos)?.split("/")?.[0]],
                ["País",poolPlayer.p?.country||poolPlayer.country],
                ["Edad",(poolPlayer.p?.age||poolPlayer.age)?`${poolPlayer.p?.age||poolPlayer.age} años`:null],
                ["Media",(poolPlayer.p?.overall||poolPlayer.overall)?`${poolPlayer.p?.overall||poolPlayer.overall} ⭐`:null],
                ["Valor de mercado",(poolPlayer.p?.price||poolPlayer.price)?`💰 ${(poolPlayer.p?.price||poolPlayer.price)?.value}${(poolPlayer.p?.price||poolPlayer.price)?.unit}`:null],
              ].filter(([,v])=>v).map(([label,val])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{label}</span>
                  <span style={{fontSize:12,fontWeight:700,color:label==="Valor de mercado"?"#27ae60":C.text,fontFamily:"'DM Sans',sans-serif"}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* SHARE LINEUP MODAL */}
      {shareLineup&&activeLineup&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setShareLineup(false)}>
          <div style={{background:C.card,border:`2px solid ${TA.accent}`,borderRadius:22,width:"100%",maxWidth:380,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>📤 COMPARTIR ALINEACIÓN</span>
              <button onClick={()=>setShareLineup(false)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{padding:"16px 18px 20px",display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:12,color:C.textLight,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>
                Se generará una imagen con el campo, los jugadores y la banca.
              </div>
              <button onClick={async()=>{
                const lineup=activeLineup;
                const starters=lineup.starters||{};
                const subs=(lineup.subs||[]).filter(Boolean);
                const pos=positions;
                const tc=getTeamColor(teamData?.teamColor);

                // Canvas setup - draw at high res directly, no ctx.scale
                const S=2; // scale factor
                const W=800*S,H=1100*S;
                const canvas=document.createElement("canvas");
                canvas.width=W;canvas.height=H;
                const ctx=canvas.getContext("2d");
                ctx.imageSmoothingEnabled=true;
                ctx.imageSmoothingQuality="high";
                const sc=n=>n*S; // scale helper

                // Background
                const bg=ctx.createLinearGradient(0,0,0,H);
                bg.addColorStop(0,"#0f0f1e");bg.addColorStop(1,"#1a1a2e");
                ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

                // Header bar
                ctx.fillStyle=tc.bg;
                ctx.fillRect(0,0,W,sc(90));
                ctx.fillStyle="#fff";
                ctx.font=`bold ${sc(32)}px Arial,sans-serif`;
                ctx.textAlign="center";
                ctx.fillText((teamData?.teamName||"").toUpperCase(),W/2,sc(50));
                ctx.font=`${sc(16)}px Arial,sans-serif`;
                ctx.fillStyle="rgba(255,255,255,0.8)";
                ctx.fillText(`${lineup.name}  •  ${lineup.formation}${lineup.code?`  🔑 ${lineup.code}`:""}`,W/2,sc(76));

                // Field
                const FX=sc(30),FY=sc(100),FW=W-sc(60),FH=sc(620);
                const fg=ctx.createLinearGradient(FX,FY,FX,FY+FH);
                fg.addColorStop(0,"#1a5c2a");fg.addColorStop(0.5,"#1e6b30");fg.addColorStop(1,"#1a5c2a");
                ctx.fillStyle=fg;
                ctx.beginPath();ctx.roundRect(FX,FY,FW,FH,sc(14));ctx.fill();

                // Field lines
                ctx.strokeStyle="rgba(255,255,255,0.22)";ctx.lineWidth=sc(1.5);
                ctx.strokeRect(FX+sc(15),FY+sc(15),FW-sc(30),FH-sc(30));
                ctx.beginPath();ctx.moveTo(FX+sc(15),FY+FH/2);ctx.lineTo(FX+FW-sc(15),FY+FH/2);ctx.stroke();
                ctx.beginPath();ctx.arc(FX+FW/2,FY+FH/2,sc(55),0,Math.PI*2);ctx.stroke();
                ctx.beginPath();ctx.arc(FX+FW/2,FY+FH/2,sc(3),0,Math.PI*2);
                ctx.fillStyle="rgba(255,255,255,0.25)";ctx.fill();
                ctx.strokeRect(FX+sc(15)+FW*0.22,FY+sc(15),FW*0.56,FH*0.14);
                ctx.strokeRect(FX+sc(15)+FW*0.22,FY+FH-sc(15)-FH*0.14,FW*0.56,FH*0.14);
                ctx.strokeRect(FX+sc(15)+FW*0.36,FY+sc(15),FW*0.28,FH*0.06);
                ctx.strokeRect(FX+sc(15)+FW*0.36,FY+FH-sc(15)-FH*0.06,FW*0.28,FH*0.06);

                // Players
                const R=sc(28);
                pos.forEach(p=>{
                  const player=starters[p.id];
                  const px=FX+FW*(p.x/100);
                  const py=FY+FH*(p.y/100);
                  // Shadow
                  ctx.shadowColor="rgba(0,0,0,0.5)";ctx.shadowBlur=sc(10);
                  // Circle gradient
                  const cg=ctx.createRadialGradient(px-sc(6),py-sc(6),sc(2),px,py,R);
                  cg.addColorStop(0,tc.bg);cg.addColorStop(1,tc.dark);
                  ctx.fillStyle=cg;
                  ctx.beginPath();ctx.arc(px,py,R,0,Math.PI*2);ctx.fill();
                  ctx.shadowBlur=0;
                  // Border
                  ctx.strokeStyle="rgba(255,255,255,0.95)";ctx.lineWidth=sc(2.5);
                  ctx.beginPath();ctx.arc(px,py,R,0,Math.PI*2);ctx.stroke();
                  // Text inside circle
                  ctx.textAlign="center";
                  if(player&&player.overall){
                    ctx.fillStyle="#fff";ctx.font=`bold ${sc(18)}px Arial,sans-serif`;
                    ctx.fillText(String(player.overall),px,py+sc(6));
                  } else if(player){
                    ctx.fillStyle="#fff";ctx.font=`bold ${sc(14)}px Arial,sans-serif`;
                    ctx.fillText(player.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),px,py+sc(5));
                  } else {
                    ctx.fillStyle="rgba(255,255,255,0.35)";ctx.font=`bold ${sc(11)}px Arial,sans-serif`;
                    ctx.fillText(p.label,px,py+sc(4));
                  }
                  // Name label
                  if(player){
                    ctx.shadowColor="rgba(0,0,0,0.95)";ctx.shadowBlur=sc(6);
                    ctx.fillStyle="#fff";ctx.font=`bold ${sc(11)}px Arial,sans-serif`;
                    const ln=player.name.split(" ").slice(-1)[0].toUpperCase();
                    ctx.fillText(ln.length>10?ln.slice(0,10):ln,px,py+R+sc(14));
                    ctx.shadowBlur=0;
                    // Pos badge
                    const bw=sc(28),bh=sc(14);
                    ctx.fillStyle=tc.dark+"ee";
                    ctx.beginPath();ctx.roundRect(px-bw/2,py+R+sc(17),bw,bh,sc(4));ctx.fill();
                    ctx.fillStyle="#fff";ctx.font=`bold ${sc(9)}px Arial,sans-serif`;
                    ctx.fillText(p.label,px,py+R+sc(27));
                  }
                });

                // Bench section
                const BY=FY+FH+sc(16);
                ctx.fillStyle="rgba(255,255,255,0.06)";
                ctx.beginPath();ctx.roundRect(FX,BY,FW,sc(130),sc(10));ctx.fill();
                ctx.fillStyle="rgba(255,255,255,0.45)";
                ctx.textAlign="left";ctx.font=`bold ${sc(11)}px Arial,sans-serif`;
                ctx.fillText("BANCA",FX+sc(14),BY+sc(20));
                const maxSubs=Math.min(subs.length,7);
                const SR=sc(20);
                const subSpacing=Math.min(FW/(maxSubs+1),sc(90));
                const subStart=FX+FW/2-(maxSubs-1)*subSpacing/2;
                subs.slice(0,7).forEach((s,i)=>{
                  const sx=subStart+i*subSpacing;
                  const sy=BY+sc(65);
                  const sg=ctx.createRadialGradient(sx-sc(3),sy-sc(3),sc(1),sx,sy,SR);
                  sg.addColorStop(0,tc.bg);sg.addColorStop(1,tc.dark);
                  ctx.fillStyle=sg;ctx.shadowColor="rgba(0,0,0,0.3)";ctx.shadowBlur=sc(5);
                  ctx.beginPath();ctx.arc(sx,sy,SR,0,Math.PI*2);ctx.fill();
                  ctx.shadowBlur=0;
                  ctx.strokeStyle="rgba(255,255,255,0.75)";ctx.lineWidth=sc(1.5);
                  ctx.beginPath();ctx.arc(sx,sy,SR,0,Math.PI*2);ctx.stroke();
                  ctx.fillStyle="#fff";ctx.textAlign="center";
                  ctx.font=`bold ${sc(12)}px Arial,sans-serif`;
                  ctx.fillText(s.overall||s.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),sx,sy+sc(4));
                  ctx.font=`${sc(8)}px Arial,sans-serif`;ctx.fillStyle="rgba(255,255,255,0.75)";
                  const sn=s.name.split(" ").slice(-1)[0].toUpperCase();
                  ctx.fillText(sn.length>7?sn.slice(0,7):sn,sx,sy+SR+sc(11));
                });

                // Footer
                ctx.fillStyle="rgba(255,255,255,0.25)";ctx.textAlign="center";
                ctx.font=`${sc(11)}px Arial,sans-serif`;
                ctx.fillText("Federación Liga Simulada ⚽",W/2,H-sc(14));

                // Share
                canvas.toBlob(async blob=>{
                  const file=new File([blob],"alineacion.png",{type:"image/png"});
                  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
                    try{await navigator.share({files:[file],title:`${teamData?.teamName} — ${lineup.name}`});}
                    catch(e){if(e.name!=="AbortError"){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="alineacion.png";a.click();}}
                  } else {
                    const url=URL.createObjectURL(blob);
                    const a=document.createElement("a");a.href=url;a.download="alineacion.png";a.click();
                  }
                },"image/png",1.0);
              }} style={{width:"100%",padding:"13px",background:TA.accent,color:"#fff",border:"none",borderRadius:11,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
                📸 GENERAR Y COMPARTIR IMAGEN
              </button>
              <button onClick={async()=>{
                const starters=activeLineup.starters||{};
                const subs=(activeLineup.subs||[]).filter(Boolean);
                const lines=[`⚽ ${teamData?.teamName} — ${activeLineup.name}`,`📋 ${activeLineup.formation}${activeLineup.code?` | 🔑 ${activeLineup.code}`:""}`,""," 🔵 TITULARES",...positions.map(p=>`${p.label}: ${starters[p.id]?.name||"—"}`),""," 🪑 BANCA",...subs.map((s,i)=>`${i+1}. ${s.name} (${s.primaryPos||s.pos?.split("/")?.[0]||"—"})`),""," — Federación Liga Simulada ⚽"];
                await navigator.clipboard.writeText(lines.join("\n"));
                alert("✅ Copiado al portapapeles");
              }} style={{width:"100%",padding:"10px",background:C.inputBg,color:C.textMid,border:`1px solid ${C.border}`,borderRadius:11,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                📋 Copiar como texto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELECCIONES NACIONALES MODAL */}
      {showSelecciones&&<SeleccionesModal isAdmin={true} allSels={allSels} onClose={()=>setShowSelecciones(false)}/>}
      {showCompetencias&&<CompetenciasModal allTeams={allTeams} onClose={()=>setShowCompetencias(false)}/>}
      {showMiSeleccion&&<SeleccionesModal lockedCountry={teamData?.nationalTeam} allSels={allSels} onClose={()=>setShowMiSeleccion(false)}/>}
      {showMercado&&<MercadoUnificado onClose={()=>setShowMercado(false)} user={user} isAdmin={isAdmin} teamData={teamData} saveTeam={saveTeam} allTeams={allTeams} pool={pool}/>}
      {showMundial&&<MundialModal onClose={()=>setShowMundial(false)} user={user} isAdmin={isAdmin} allSels={allSels} pool={pool} teamData={teamData} initialTab={mundialInitialTab}/>}
      {!showMundial&&<AvisoBanner onOpen={()=>setShowMundial(true)}/>}

      {/* SUB MENU MODAL */}
      {pickModal?.type==="subMenu"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setPickModal(null)}>
          <div style={{background:C.card,border:`1.5px solid ${C.accent}`,borderRadius:16,overflow:"hidden",boxShadow:"0 16px 48px rgba(0,0,0,0.2)",minWidth:200}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,background:C.goldLight}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{pickModal.currentPlayer?.name}</div>
              <div style={{fontSize:10,color:C.textLight,fontFamily:"monospace"}}>{pickModal.currentPlayer?.pos}</div>
            </div>
            <div onClick={()=>{const m={...pickModal,type:"sub"};setPickModal(m);}}
              style={{padding:"13px 18px",fontSize:13,fontWeight:700,color:C.text,cursor:"pointer",borderBottom:`1px solid ${C.border}`,fontFamily:"'DM Sans',sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.inputBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              🔄 Cambiar
            </div>
            <div onClick={async()=>{
              await updateActive(l=>{const s=[...l.subs];s[pickModal.subIdx]=null;return{subs:s};});
              setPickModal(null);
            }}
              style={{padding:"13px 18px",fontSize:13,fontWeight:700,color:"#c0392b",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.background="#fff5f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              ✕ Quitar de banca
            </div>
          </div>
        </div>
      )}

      {/* SQUAD LIST VIEW */}
      {!viewingTeam&&showSquadList&&(()=>{
        const POS_ORDER=["POR","DFC","DFD","DFI","MCD","MC","MCO","MD","MI","ED","EI","DC"];
        const getPos=p=>(p.primaryPos||p.pos||"").split("/")?.[0]?.trim()||"";
        const sorted=[...squad].sort((a,b)=>{
          const ai=POS_ORDER.indexOf(getPos(a));
          const bi=POS_ORDER.indexOf(getPos(b));
          return(ai===-1?99:ai)-(bi===-1?99:bi);
        });
        return(
          <div style={{paddingTop:12}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:`0 2px 12px rgba(0,0,0,0.04)`}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:3,height:16,background:C.accent,borderRadius:2}}/>
                <span style={{fontSize:14,fontWeight:800,color:C.text,letterSpacing:1,fontFamily:"'Bebas Neue',sans-serif"}}>PLANTILLA GENERAL</span>
                <span style={{fontSize:10,color:C.textLight,background:C.inputBg,padding:"2px 8px",borderRadius:20,fontFamily:"'DM Sans',sans-serif",border:`1px solid ${C.border}`}}>{squad.length}/26</span>
              </div>
              {sorted.length===0&&<div style={{padding:"32px",textAlign:"center",color:C.textFaint,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>No hay jugadores en la plantilla.</div>}
              {sorted.map((p,i)=>{
                const prevPos=i>0?getPos(sorted[i-1]):null;
                const currPos=getPos(p);
                const showDivider=currPos!==prevPos;
                return(
                  <div key={p.id}>
                    {showDivider&&<div style={{padding:"6px 16px 4px",background:C.inputBg,borderBottom:`1px solid ${C.border}`,borderTop:i>0?`1px solid ${C.border}`:"none"}}>
                      <span style={{fontSize:10,fontWeight:800,color:C.accent,fontFamily:"monospace",letterSpacing:1}}>{currPos}</span>
                    </div>}
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:`1px solid ${C.border}`}}>
                      <Avatar name={p.name} size={36} overall={p.overall} colorId={teamData?.teamColor}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                        <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>
                          {p.country||"—"}
                          {p.price&&<span style={{color:"#27ae60",fontWeight:700}}> · 💰{p.price.value}{p.price.unit}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {p.age&&<span style={{fontSize:11,color:C.textLight,fontFamily:"monospace"}}>{p.age}a</span>}
                        <span style={{fontSize:10,fontWeight:700,color:C.accent,background:C.goldLight,padding:"2px 8px",borderRadius:6,fontFamily:"monospace",border:`1px solid ${C.border}`}}>{currPos}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* SQUAD MANAGER MODAL */}
      {showSquadManager&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setShowSquadManager(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:440,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(196,154,42,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>PLANTILLA</span>
              <span style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{squad.length}/26</span>
              <button onClick={()=>{setShowSquadManager(false);setShowAddPlayer(true);}}
                style={{marginLeft:"auto",padding:"7px 14px",background:C.accent,color:"#fff",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                + Agregar
              </button>
              <button onClick={()=>setShowSquadManager(false)}
                style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:30,height:30,color:C.textMid,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"10px 14px 16px",display:"flex",flexDirection:"column",gap:6}}>
              {squad.length===0&&<div style={{textAlign:"center",color:C.textFaint,fontSize:13,padding:"32px 0",fontFamily:"'DM Sans',sans-serif"}}>No hay jugadores todavía.</div>}
              {squad.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:10,background:p.locked?"#fffbf0":C.inputBg,border:`1px solid ${p.locked?C.accent:C.border}`}}>
                  <Avatar name={p.name} size={36} colorId={teamData?.teamColor}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                      {p.locked&&<span style={{fontSize:10,flexShrink:0}}>🔒</span>}
                    </div>
                    <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.country||"—"} · <span style={{fontFamily:"monospace",color:C.accent,fontWeight:700}}>{p.primaryPos||p.pos?.split("/")?.[0]}</span>{p.age?` · ${p.age}a`:""}{p.overall?` · ${p.overall}⭐`:""}{p.price?<span style={{color:"#27ae60",fontWeight:700}}> · 💰{p.price.value}{p.price.unit}</span>:""}</div>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    {!p.locked&&!p.poolKey?.startsWith("fc26_")&&(
                      <button onClick={e=>{e.stopPropagation();setEditingPlayer(p);setShowSquadManager(false);}}
                        style={{background:C.goldLight,border:`1px solid ${C.borderDark}`,borderRadius:8,color:C.textMid,cursor:"pointer",fontSize:13,padding:"6px 10px",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>✏️</button>
                    )}
                    {!p.locked&&(
                      <button onClick={async e=>{
                        e.stopPropagation();
                        const ns=squad.filter(s=>s.id!==p.id);
                        await saveTeam({squad:ns});
                        await removeFromPool(p);
                      }} style={{background:"#fff5f5",border:"1px solid #ffcccc",borderRadius:8,color:"#c0392b",cursor:"pointer",fontSize:13,padding:"6px 10px",flexShrink:0,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TEAM SELECTION SCREEN ────────────────────────────────────────────────────
function TeamSelectionScreen({user,onDone}){
  const[teams,setTeams]=useState([]);
  const[loading,setLoading]=useState(true);
  const[newTeamName,setNewTeamName]=useState("");
  const[newTeamColor,setNewTeamColor]=useState("blue");
  const[creating,setCreating]=useState(false);
  const[error,setError]=useState("");

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"teams"),snap=>{
      const all=snap.docs.map(d=>({id:d.id,...d.data()}));
      // Only show teams without owner or with no uid
      setTeams(all.filter(t=>!t.uid||t.uid===""));
      setLoading(false);
    });
    return unsub;
  },[]);

  const takeTeam=async(team)=>{
    setCreating(true);
    await updateDoc(doc(db,"teams",team.id),{uid:user.uid,email:user.email});
    await updateProfile(user,{displayName:team.teamName});
    onDone();
  };

  const createTeam=async()=>{
    if(!newTeamName.trim()){setError("Escribe el nombre de tu equipo.");return;}
    setCreating(true);
    const ref=doc(db,"teams",user.uid);
    await setDoc(ref,{uid:user.uid,email:user.email,teamName:newTeamName.trim(),teamColor:newTeamColor,squad:[],lineups:[{id:"a",name:"Liga",formation:"4-3-3",starters:{},subs:Array(7).fill(null)},{id:"b",name:"Copa",formation:"4-3-3",starters:{},subs:Array(7).fill(null)}],createdAt:new Date().toISOString()});
    await updateProfile(user,{displayName:newTeamName.trim()});
    onDone();
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box}input::placeholder{color:${C.textFaint}}`}</style>
      <div style={{width:"100%",maxWidth:480}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:13,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>Bienvenido, {user.email}</div>
          <h1 style={{fontSize:26,fontWeight:800,color:C.text,margin:"0 0 8px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>ELIGE TU EQUIPO</h1>
          <p style={{fontSize:12,color:C.textLight,margin:0,fontFamily:"'DM Sans',sans-serif"}}>Selecciona un equipo disponible o crea uno nuevo</p>
        </div>

        {/* Available teams */}
        {loading?(
          <div style={{textAlign:"center",padding:32,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Cargando equipos…</div>
        ):(
          <>
            {teams.length>0&&(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:16,boxShadow:`0 4px 20px rgba(0,0,0,0.04)`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Equipos disponibles</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {teams.map(t=>(
                    <div key={t.id} onClick={()=>!creating&&takeTeam(t)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:11,border:`1.5px solid ${C.border}`,background:C.inputBg,cursor:creating?"not-allowed":"pointer",transition:"all .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${C.accentDark},${C.accent})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif"}}>{t.teamName?.[0]||"?"}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{t.teamName}</div>
                        <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{(t.squad||[]).length} jugadores en plantilla</div>
                      </div>
                      <span style={{fontSize:11,color:C.accent,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Tomar →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create new team */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16,boxShadow:`0 4px 20px rgba(0,0,0,0.04)`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Crear nuevo equipo</div>
              <input value={newTeamName} onChange={e=>setNewTeamName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createTeam()}
                placeholder="Nombre de tu equipo…"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",marginBottom:10}}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              <div style={{fontSize:11,fontWeight:600,color:C.textLight,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Color del equipo</div>
              <div style={{marginBottom:12}}><ColorPicker selected={newTeamColor} onChange={setNewTeamColor}/></div>
              {error&&<p style={{color:"#c0392b",fontSize:12,margin:"0 0 8px",fontFamily:"'DM Sans',sans-serif"}}>⚠ {error}</p>}
              <button onClick={createTeam} disabled={creating}
                style={{width:"100%",padding:"13px",background:C.accent,color:"#fff",border:"none",borderRadius:11,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,opacity:creating?0.6:1}}>
                {creating?"CREANDO…":"CREAR EQUIPO"}
              </button>
            </div>
          </>
        )}
        <button onClick={()=>signOut(auth)} style={{marginTop:20,background:"none",border:"none",color:C.textFaint,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",textAlign:"center"}}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null);
  const[isAdmin,setIsAdmin]=useState(false);
  const[hasTeam,setHasTeam]=useState(false);
  const[loading,setLoading]=useState(true);
  const[maintenance,setMaintenance]=useState(false);

  // Listen to maintenance mode in real time
  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"config","settings"),snap=>{
      if(snap.exists()) setMaintenance(snap.data().maintenance===true);
      else setMaintenance(false);
    });
    return unsub;
  },[]);

  const checkUserState=async(u)=>{
    if(!u){setUser(null);setIsAdmin(false);setHasTeam(false);setLoading(false);return;}
    setUser(u);
    const adminSnap=await getDoc(doc(db,"admins",u.uid));
    if(adminSnap.exists()){
      setIsAdmin(true);
    } else {
      const allAdmins=await getDocs(collection(db,"admins"));
      if(allAdmins.empty){
        await setDoc(doc(db,"admins",u.uid),{email:u.email,uid:u.uid,superAdmin:true});
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    const teamSnap=await getDoc(doc(db,"teams",u.uid));
    if(teamSnap.exists()&&teamSnap.data().uid===u.uid){
      setHasTeam(true);
    } else {
      const teamsSnap=await getDocs(collection(db,"teams"));
      const myTeam=teamsSnap.docs.find(d=>d.data().uid===u.uid);
      setHasTeam(!!myTeam);
    }
    setLoading(false);
  };

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,checkUserState);
    return unsub;
  },[]);

  if(loading) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}`}</style>
    </div>
  );

  // Maintenance mode — only admins pass through
  if(maintenance&&!isAdmin) return(
    <div style={{minHeight:"100vh",background:"#1a1a1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;700;800&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{textAlign:"center",maxWidth:380}}>
        <div style={{fontSize:64,marginBottom:16}}>🔒</div>
        <h1 style={{fontSize:32,fontWeight:800,color:"#F5C518",margin:"0 0 10px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>LIGA CERRADA</h1>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.6)",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6,marginBottom:24}}>La Federación Liga Simulada está en mantenimiento. Vuelve pronto.</p>
        {user&&<button onClick={()=>signOut(auth)} style={{padding:"10px 24px",borderRadius:10,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cerrar sesión</button>}
      </div>
    </div>
  );

  if(!user) return <AuthScreen onAuth={u=>checkUserState(u)}/>;
  if(!hasTeam&&!isAdmin) return <TeamSelectionScreen user={user} onDone={()=>setHasTeam(true)}/>;
  return <MainApp user={user} isAdmin={isAdmin} onLogout={()=>signOut(auth)}/>;
}
