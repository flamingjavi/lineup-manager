import { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs,
} from "firebase/firestore";

// ─── CONSTANTS & DATA ─────────────────────────────────────────────────────────
const FORMATIONS = {
  "4-3-3":     [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:70},{id:"cb1",label:"CB",x:62,y:71},{id:"cb2",label:"CB",x:38,y:71},{id:"lb",label:"LB",x:20,y:70},{id:"cm1",label:"CM",x:74,y:50},{id:"cm2",label:"CM",x:50,y:47},{id:"cm3",label:"CM",x:26,y:50},{id:"rw",label:"RW",x:80,y:26},{id:"st",label:"ST",x:50,y:17},{id:"lw",label:"LW",x:20,y:26}],
  "4-4-2":     [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:70},{id:"cb1",label:"CB",x:62,y:71},{id:"cb2",label:"CB",x:38,y:71},{id:"lb",label:"LB",x:20,y:70},{id:"rm",label:"RM",x:80,y:50},{id:"cm1",label:"CM",x:60,y:50},{id:"cm2",label:"CM",x:40,y:50},{id:"lm",label:"LM",x:20,y:50},{id:"st1",label:"ST",x:63,y:22},{id:"st2",label:"ST",x:37,y:22}],
  "4-2-3-1":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:72},{id:"cb2",label:"CB",x:38,y:72},{id:"lb",label:"LB",x:20,y:72},{id:"cdm1",label:"CDM",x:62,y:57},{id:"cdm2",label:"CDM",x:38,y:57},{id:"ram",label:"RAM",x:76,y:36},{id:"cam",label:"CAM",x:50,y:34},{id:"lam",label:"LAM",x:24,y:36},{id:"st",label:"ST",x:50,y:16}],
  "3-4-3":     [{id:"gk",label:"GK",x:50,y:88},{id:"cb1",label:"CB",x:70,y:72},{id:"cb2",label:"CB",x:50,y:73},{id:"cb3",label:"CB",x:30,y:72},{id:"rm",label:"RM",x:82,y:52},{id:"cm1",label:"CM",x:62,y:52},{id:"cm2",label:"CM",x:38,y:52},{id:"lm",label:"LM",x:18,y:52},{id:"rw",label:"RW",x:78,y:24},{id:"st",label:"ST",x:50,y:17},{id:"lw",label:"LW",x:22,y:24}],
  "5-3-2":     [{id:"gk",label:"GK",x:50,y:88},{id:"rwb",label:"RWB",x:86,y:68},{id:"cb1",label:"CB",x:68,y:73},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:32,y:73},{id:"lwb",label:"LWB",x:14,y:68},{id:"cm1",label:"CM",x:70,y:49},{id:"cm2",label:"CM",x:50,y:47},{id:"cm3",label:"CM",x:30,y:49},{id:"st1",label:"ST",x:63,y:22},{id:"st2",label:"ST",x:37,y:22}],
  "4-2-3-1":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:72},{id:"cb2",label:"CB",x:38,y:72},{id:"lb",label:"LB",x:20,y:72},{id:"cdm1",label:"CDM",x:62,y:57},{id:"cdm2",label:"CDM",x:38,y:57},{id:"ram",label:"RAM",x:76,y:36},{id:"cam",label:"CAM",x:50,y:34},{id:"lam",label:"LAM",x:24,y:36},{id:"st",label:"ST",x:50,y:16}],
  "4-5-1":     [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"rm",label:"RM",x:85,y:50},{id:"cm1",label:"CM",x:67,y:50},{id:"cm2",label:"CM",x:50,y:48},{id:"cm3",label:"CM",x:33,y:50},{id:"lm",label:"LM",x:15,y:50},{id:"st",label:"ST",x:50,y:18}],
  "3-5-2":     [{id:"gk",label:"GK",x:50,y:88},{id:"cb1",label:"CB",x:70,y:73},{id:"cb2",label:"CB",x:50,y:74},{id:"cb3",label:"CB",x:30,y:73},{id:"rwb",label:"RWB",x:85,y:52},{id:"cm1",label:"CM",x:67,y:50},{id:"cm2",label:"CM",x:50,y:47},{id:"cm3",label:"CM",x:33,y:50},{id:"lwb",label:"LWB",x:15,y:52},{id:"st1",label:"ST",x:63,y:21},{id:"st2",label:"ST",x:37,y:21}],
  "4-4-2 DM":  [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"rm",label:"RM",x:82,y:53},{id:"cdm1",label:"CDM",x:62,y:60},{id:"cdm2",label:"CDM",x:38,y:60},{id:"lm",label:"LM",x:18,y:53},{id:"st1",label:"ST",x:63,y:21},{id:"st2",label:"ST",x:37,y:21}],
  "4-1-2-1-2": [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm",label:"CDM",x:50,y:60},{id:"cm1",label:"CM",x:72,y:48},{id:"cm2",label:"CM",x:28,y:48},{id:"cam",label:"CAM",x:50,y:36},{id:"st1",label:"ST",x:63,y:20},{id:"st2",label:"ST",x:37,y:20}],
};

const FC26_ROLES = {
  GK:["Goalkeeper","Sweeper Keeper","Ball-Playing Keeper"],
  RB:["Fullback","Falseback","Wingback","Attacking Wingback"],
  LB:["Fullback","Falseback","Wingback","Attacking Wingback"],
  CB:["Defender","Stopper","Ball-Playing Defender","Libero"],
  CDM:["Holding","Deep-Lying Playmaker","Wide Half"],
  CM:["Box-to-Box","Deep-Lying Playmaker","Playmaker","Half-Winger"],
  CAM:["Playmaker","Shadow Striker","Half-Winger","Advanced Playmaker"],
  RM:["Winger","Wide Midfielder","Inside Forward","Half-Winger"],
  LM:["Winger","Wide Midfielder","Inside Forward","Half-Winger"],
  RW:["Winger","Inside Forward","Wide Playmaker"],
  LW:["Winger","Inside Forward","Wide Playmaker"],
  ST:["Advanced Forward","Pressing Forward","False Nine","Target Forward","Poacher"],
  CF:["Advanced Forward","Pressing Forward","False Nine","Target Forward"],
  WB:["Fullback","Wingback","Attacking Wingback"],
  DM:["Holding","Deep-Lying Playmaker"],
};

const POSITIONS_LIST = ["GK","CB","RB","LB","CDM","CM","CAM","RM","LM","RW","LW","ST","CF","WB","DM"];
const FLAG_OPTIONS = ["🇦🇷","🇧🇷","🇫🇷","🇩🇪","🇪🇸","🇵🇹","🇮🇹","🇧🇪","🇳🇱","🇭🇷","🇸🇳","🇨🇮","🇲🇦","🇲🇽","🏴󠁧󠁢󠁥󠁮󠁧󠁿","🏴󠁧󠁢󠁳󠁣󠁴󠁿","🏴󠁧󠁢󠁷󠁬󠁳󠁿","🇺🇸","🇯🇵","🇰🇷","🇳🇬","🇬🇭","🇪🇬","🇨🇴","🇺🇾","🇸🇪","🇩🇰","🇵🇱","🇸🇮","🇷🇸","🇹🇷","🌍"];

const FC26_DB = [
  {id:1,name:"T. Courtois",pos:"GK",team:"Real Madrid",nat:"🇧🇪",age:32,role:"Sweeper Keeper"},
  {id:2,name:"M. ter Stegen",pos:"GK",team:"FC Barcelona",nat:"🇩🇪",age:32,role:"Sweeper Keeper"},
  {id:3,name:"G. Donnarumma",pos:"GK",team:"PSG",nat:"🇮🇹",age:26,role:"Goalkeeper"},
  {id:4,name:"E. Martínez",pos:"GK",team:"Aston Villa",nat:"🇦🇷",age:32,role:"Sweeper Keeper"},
  {id:5,name:"M. Maignan",pos:"GK",team:"AC Milan",nat:"🇫🇷",age:29,role:"Sweeper Keeper"},
  {id:6,name:"V. van Dijk",pos:"CB",team:"Liverpool",nat:"🇳🇱",age:33,role:"Defender"},
  {id:7,name:"W. Saliba",pos:"CB",team:"Arsenal",nat:"🇫🇷",age:23,role:"Ball-Playing Defender"},
  {id:8,name:"A. Bastoni",pos:"CB",team:"Inter Milan",nat:"🇮🇹",age:25,role:"Ball-Playing Defender"},
  {id:9,name:"A. Rüdiger",pos:"CB",team:"Real Madrid",nat:"🇩🇪",age:31,role:"Stopper"},
  {id:10,name:"C. Romero",pos:"CB",team:"Tottenham",nat:"🇦🇷",age:26,role:"Stopper"},
  {id:11,name:"T. Alexander-Arnold",pos:"RB",team:"Liverpool",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",age:25,role:"Attacking Wingback"},
  {id:12,name:"D. Carvajal",pos:"RB",team:"Real Madrid",nat:"🇪🇸",age:32,role:"Wingback"},
  {id:13,name:"A. Robertson",pos:"LB",team:"Liverpool",nat:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",age:30,role:"Wingback"},
  {id:14,name:"Theo Hernández",pos:"LB",team:"AC Milan",nat:"🇫🇷",age:26,role:"Attacking Wingback"},
  {id:15,name:"R. Grimaldo",pos:"LB",team:"Leverkusen",nat:"🇪🇸",age:28,role:"Attacking Wingback"},
  {id:16,name:"Rodri",pos:"CDM",team:"Man City",nat:"🇪🇸",age:28,role:"Holding"},
  {id:17,name:"Casemiro",pos:"CDM",team:"Man United",nat:"🇧🇷",age:32,role:"Holding"},
  {id:18,name:"A. Tchouaméni",pos:"CDM",team:"Real Madrid",nat:"🇫🇷",age:24,role:"Holding"},
  {id:19,name:"J. Bellingham",pos:"CM",team:"Real Madrid",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",age:20,role:"Box-to-Box"},
  {id:20,name:"T. Kroos",pos:"CM",team:"Real Madrid",nat:"🇩🇪",age:34,role:"Deep-Lying Playmaker"},
  {id:21,name:"K. De Bruyne",pos:"CM",team:"Man City",nat:"🇧🇪",age:33,role:"Playmaker"},
  {id:22,name:"Pedri",pos:"CM",team:"FC Barcelona",nat:"🇪🇸",age:22,role:"Playmaker"},
  {id:23,name:"F. de Jong",pos:"CM",team:"FC Barcelona",nat:"🇳🇱",age:26,role:"Box-to-Box"},
  {id:24,name:"D. Rice",pos:"CM",team:"Arsenal",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",age:25,role:"Box-to-Box"},
  {id:25,name:"M. Ødegaard",pos:"CAM",team:"Arsenal",nat:"🇳🇴",age:25,role:"Playmaker"},
  {id:26,name:"B. Silva",pos:"CAM",team:"Man City",nat:"🇵🇹",age:29,role:"Playmaker"},
  {id:27,name:"Vinícius Jr.",pos:"LW",team:"Real Madrid",nat:"🇧🇷",age:23,role:"Winger"},
  {id:28,name:"K. Mbappé",pos:"LW",team:"Real Madrid",nat:"🇫🇷",age:25,role:"Winger"},
  {id:29,name:"R. Leão",pos:"LW",team:"AC Milan",nat:"🇵🇹",age:24,role:"Winger"},
  {id:30,name:"L. Díaz",pos:"LW",team:"Liverpool",nat:"🇨🇴",age:27,role:"Winger"},
  {id:31,name:"M. Salah",pos:"RW",team:"Liverpool",nat:"🇪🇬",age:31,role:"Inside Forward"},
  {id:32,name:"B. Saka",pos:"RW",team:"Arsenal",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",age:22,role:"Inside Forward"},
  {id:33,name:"Lamine Yamal",pos:"RW",team:"FC Barcelona",nat:"🇪🇸",age:17,role:"Winger"},
  {id:34,name:"Raphinha",pos:"RW",team:"FC Barcelona",nat:"🇧🇷",age:27,role:"Inside Forward"},
  {id:35,name:"E. Haaland",pos:"ST",team:"Man City",nat:"🇳🇴",age:24,role:"Advanced Forward"},
  {id:36,name:"H. Kane",pos:"ST",team:"Bayern Munich",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",age:30,role:"Advanced Forward"},
  {id:37,name:"R. Lewandowski",pos:"ST",team:"FC Barcelona",nat:"🇵🇱",age:35,role:"Advanced Forward"},
  {id:38,name:"V. Osimhen",pos:"ST",team:"Napoli",nat:"🇳🇬",age:25,role:"Pressing Forward"},
  {id:39,name:"O. Watkins",pos:"ST",team:"Aston Villa",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",age:28,role:"Pressing Forward"},
  {id:40,name:"A. Isak",pos:"ST",team:"Newcastle",nat:"🇸🇪",age:24,role:"Advanced Forward"},
];

function searchPlayers(q) {
  const low = q.toLowerCase().trim();
  if (!low) return FC26_DB.slice(0, 20);
  const posMap = {"portero":"GK","gk":"GK","defensa":"CB","cb":"CB","lateral":"RB","rb":"RB","lb":"LB","pivote":"CDM","cdm":"CDM","medio":"CM","cm":"CM","mediapunta":"CAM","cam":"CAM","extremo":"RW","rw":"RW","lw":"LW","delantero":"ST","st":"ST","porteros":"GK","defensas":"CB","extremos":"RW","delanteros":"ST","medios":"CM"};
  const posFilter = posMap[low];
  return FC26_DB.filter(p =>
    p.name.toLowerCase().includes(low) || p.team.toLowerCase().includes(low) ||
    p.pos.toLowerCase() === low || p.role.toLowerCase().includes(low) ||
    (posFilter && p.pos === posFilter) ||
    (low.includes("barca") && p.team.includes("Barcelona")) ||
    (low.includes("barça") && p.team.includes("Barcelona")) ||
    (low.includes("madrid") && p.team.includes("Real Madrid")) ||
    (low.includes("liverpool") && p.team.includes("Liverpool")) ||
    (low.includes("arsenal") && p.team.includes("Arsenal")) ||
    (low.includes("city") && p.team.includes("Man City"))
  ).slice(0, 20);
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#f0ebe0", card: "#f5f0e8", border: "#ddd0b8", borderDark: "#c8b898",
  accent: "#7a5c38", accentLight: "rgba(122,92,56,0.12)",
  text: "#2c1f0e", textMid: "#5c4028", textLight: "#9a8060", textFaint: "#b8a080",
  inputBg: "#ede8de",
};

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "register") {
        if (!teamName.trim()) { setError("Escribe el nombre de tu equipo."); setLoading(false); return; }
        if (password !== confirmPw) { setError("Las contraseñas no coinciden."); setLoading(false); return; }
        if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); setLoading(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: teamName.trim() });
        onAuth(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        onAuth(cred.user);
      }
    } catch (e) {
      const msgs = {
        "auth/email-already-in-use": "Este email ya está registrado.",
        "auth/invalid-email": "Email inválido.",
        "auth/user-not-found": "Usuario no encontrado.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/invalid-credential": "Email o contraseña incorrectos.",
        "auth/weak-password": "La contraseña es muy débil.",
      };
      setError(msgs[e.code] || "Error: " + e.message);
    }
    setLoading(false);
  };

  const inp = { width:"100%", padding:"10px 13px", borderRadius:9, border:`1.5px solid ${C.borderDark}`, background:C.inputBg, color:C.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", marginBottom:10 };
  const lbl = { fontSize:10, fontWeight:700, color:C.textLight, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:0.5, fontFamily:"'DM Sans',sans-serif" };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700;800&display=swap'); *{box-sizing:border-box} input::placeholder{color:${C.textFaint}}`}</style>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"32px 28px", width:"100%", maxWidth:380, boxShadow:"0 8px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⚽</div>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.text, margin:"0 0 6px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>LINEUP MANAGER</h1>
          <p style={{ fontSize:12, color:C.textLight, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
            {mode === "login" ? "Inicia sesión para gestionar tu equipo" : "Crea tu cuenta y equipo"}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:C.inputBg, borderRadius:10, padding:3, marginBottom:22 }}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none", background:mode===m?C.accent:"transparent", color:mode===m?"#fff":C.textMid, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" }}>
              {m === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <>
            <label style={lbl}>Nombre de tu equipo</label>
            <input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="Ej. FC Javier, Los Cracks…" style={inp}
              onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
          </>
        )}

        <label style={lbl}>Correo electrónico</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={inp}
          onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}
          onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>

        <label style={lbl}>Contraseña</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp}
          onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}
          onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>

        {mode === "register" && (
          <>
            <label style={lbl}>Confirmar contraseña</label>
            <input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="Repite la contraseña" style={{...inp, marginBottom:0}}
              onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
          </>
        )}

        {error && <p style={{ color:"#c0392b", fontSize:12, margin:"8px 0 0", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>⚠ {error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:"13px", background:C.accent, color:"#fff", border:"none", borderRadius:11, fontSize:14, fontWeight:800, cursor:"pointer", marginTop:16, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, opacity:loading?0.6:1 }}>
          {loading ? "..." : mode === "login" ? "ENTRAR" : "CREAR CUENTA"}
        </button>
      </div>
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ name, nat, size=50 }) {
  const initials = name ? name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : "?";
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,#5c3d1e,#3a2010)`, border:"2.5px solid rgba(255,255,255,0.9)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 10px rgba(0,0,0,0.2)", flexShrink:0 }}>
      <span style={{ fontSize:size*0.28, fontWeight:800, color:"#fff", lineHeight:1, fontFamily:"'Bebas Neue',sans-serif" }}>{initials}</span>
      <span style={{ fontSize:size*0.22, lineHeight:1, marginTop:1 }}>{nat}</span>
    </div>
  );
}

// ─── ADD PLAYER MODAL ─────────────────────────────────────────────────────────
function AddPlayerModal({ onAdd, onClose, currentCount }) {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(FC26_DB.slice(0,20));
  const [mName,setMName]=useState(""); const [mPos,setMPos]=useState("ST");
  const [mTeam,setMTeam]=useState(""); const [mNat,setMNat]=useState("🌍");
  const [mAge,setMAge]=useState(""); const [mRole,setMRole]=useState("Advanced Forward");
  const [mErr,setMErr]=useState("");
  const remaining = 26 - currentCount;
  const TS = a => ({ flex:1, padding:"8px 0", border:"none", background:"none", cursor:"pointer", fontSize:12, fontWeight:700, color:a?C.text:C.textFaint, borderBottom:a?`2px solid ${C.accent}`:"2px solid transparent", fontFamily:"'DM Sans',sans-serif" });

  const handleManual = () => {
    if(!mName.trim()){setMErr("Nombre obligatorio.");return;}
    setMErr("");
    onAdd({id:`p_${Date.now()}`,name:mName.trim(),pos:mPos,team:mTeam.trim()||"—",nat:mNat,age:mAge?parseInt(mAge):null,role:mRole});
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,width:"100%",maxWidth:440,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"15px 20px 0",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
            <div>
              <span style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Agregar a plantilla</span>
              <div style={{fontSize:10,color:remaining>0?C.accent:"#c0392b",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{remaining>0?`${remaining} lugares disponibles`:"Plantilla completa (26/26)"}</div>
            </div>
            <button onClick={onClose} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          <div style={{display:"flex"}}>
            <button style={TS(tab==="search")} onClick={()=>setTab("search")}>🔍 Buscar FC26</button>
            <button style={TS(tab==="manual")} onClick={()=>setTab("manual")}>✏️ Manual</button>
          </div>
        </div>

        {tab==="search"&&(<>
          <div style={{padding:"11px 16px 8px",flexShrink:0}}>
            <input value={query} onChange={e=>{setQuery(e.target.value);setResults(searchPlayers(e.target.value));}}
              placeholder="Nombre, equipo, posición…"
              style={{width:"100%",padding:"9px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
              onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
            <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
              {["Porteros","Defensas","Medios","Extremos","Delanteros","Barça","Real Madrid"].map(t=>(
                <button key={t} onClick={()=>{setQuery(t);setResults(searchPlayers(t));}}
                  style={{fontSize:10,padding:"3px 8px",borderRadius:20,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{overflowY:"auto",flex:1}}>
            {results.map((p,i)=>(
              <div key={p.id} onClick={()=>remaining>0&&onAdd({...p,id:`p_${Date.now()}_${i}`})}
                style={{display:"flex",alignItems:"center",gap:11,padding:"9px 16px",cursor:remaining>0?"pointer":"not-allowed",borderBottom:`1px solid ${C.border}`,transition:"background .1s",opacity:remaining>0?1:0.4}}
                onMouseEnter={e=>remaining>0&&(e.currentTarget.style.background=C.inputBg)}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Avatar name={p.name} nat={p.nat} size={38}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                  <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.team} · {p.age}a</div>
                  <span style={{fontSize:9,background:C.accentLight,color:C.accent,padding:"1px 6px",borderRadius:10,fontWeight:600,display:"inline-block",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{p.role}</span>
                </div>
                <span style={{fontSize:10,fontWeight:700,color:C.textLight,background:C.inputBg,padding:"3px 7px",borderRadius:6,fontFamily:"monospace"}}>{p.pos}</span>
              </div>
            ))}
          </div>
        </>)}

        {tab==="manual"&&(
          <div style={{overflowY:"auto",flex:1,padding:"13px 16px 20px"}}>
            {[["Nombre *",mName,setMName,"Ej. Carlos Ruiz"],["Equipo",mTeam,setMTeam,"Ej. Municipal"]].map(([label,val,setter,ph])=>(
              <div key={label} style={{marginBottom:10}}>
                <label style={{fontSize:10,fontWeight:700,color:C.textLight,display:"block",marginBottom:3,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
                <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              </div>
            ))}
            <div style={{display:"flex",gap:9,marginBottom:11}}>
              <div style={{flex:1.5}}>
                <label style={{fontSize:10,fontWeight:700,color:C.textLight,display:"block",marginBottom:3,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Posición *</label>
                <select value={mPos} onChange={e=>{setMPos(e.target.value);setMRole((FC26_ROLES[e.target.value]||[""])[0]);}}
                  style={{width:"100%",padding:"9px 8px",borderRadius:9,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"monospace"}}>
                  {POSITIONS_LIST.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={{fontSize:10,fontWeight:700,color:C.textLight,display:"block",marginBottom:3,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Edad</label>
                <input value={mAge} onChange={e=>setMAge(e.target.value)} type="number" min="14" max="50" placeholder="25"
                  style={{width:"100%",padding:"9px 8px",borderRadius:9,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"monospace"}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              </div>
            </div>
            <label style={{fontSize:10,fontWeight:700,color:C.textLight,display:"block",marginBottom:5,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Rol FC26</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:11}}>
              {(FC26_ROLES[mPos]||[]).map(r=>(
                <button key={r} onClick={()=>setMRole(r)}
                  style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${mRole===r?C.accent:C.borderDark}`,background:mRole===r?C.accentLight:C.inputBg,color:mRole===r?C.accent:C.textMid,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  {r}
                </button>
              ))}
            </div>
            <label style={{fontSize:10,fontWeight:700,color:C.textLight,display:"block",marginBottom:5,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Bandera</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:13,maxHeight:72,overflowY:"auto"}}>
              {FLAG_OPTIONS.map(f=>(
                <button key={f} onClick={()=>setMNat(f)} style={{width:30,height:30,borderRadius:6,border:`2px solid ${mNat===f?C.accent:C.border}`,background:mNat===f?C.accentLight:C.inputBg,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{f}</button>
              ))}
            </div>
            {mErr&&<p style={{color:"#c0392b",fontSize:12,margin:"0 0 8px",fontFamily:"'DM Sans',sans-serif"}}>⚠ {mErr}</p>}
            <button onClick={handleManual} disabled={remaining<=0}
              style={{width:"100%",padding:"11px",background:remaining>0?C.accent:"#ccc",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:800,cursor:remaining>0?"pointer":"not-allowed",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
              AGREGAR A PLANTILLA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PICK FROM SQUAD ──────────────────────────────────────────────────────────
function PickFromSquad({ squad, posLabel, onPick, onClose }) {
  const [filter,setFilter]=useState("");
  const filtered=squad.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase())||p.pos.toLowerCase().includes(filter.toLowerCase())||(p.role||"").toLowerCase().includes(filter.toLowerCase()));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,width:"100%",maxWidth:400,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.12)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"13px 20px 10px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Asignar <span style={{color:C.accent,fontFamily:"monospace"}}>{posLabel}</span></span>
            <button onClick={onClose} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:26,height:26,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          <input autoFocus value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar plantilla…"
            style={{width:"100%",padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {squad.length===0&&<div style={{padding:"28px",textAlign:"center",color:C.textFaint,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Plantilla vacía. Agrega jugadores desde ⚙️</div>}
          {filtered.map(p=>(
            <div key={p.id} onClick={()=>onPick(p)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,transition:"background .1s"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.inputBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar name={p.name} nat={p.nat} size={36}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.team}{p.age?` · ${p.age}a`:""}</div>
                {p.role&&<span style={{fontSize:8,background:C.accentLight,color:C.accent,padding:"1px 5px",borderRadius:8,fontWeight:600,display:"inline-block",marginTop:1,fontFamily:"'DM Sans',sans-serif"}}>{p.role}</span>}
              </div>
              <span style={{fontSize:9,fontWeight:700,color:C.textLight,background:C.inputBg,padding:"2px 6px",borderRadius:5,fontFamily:"monospace"}}>{p.pos}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PLAYER SPOT ──────────────────────────────────────────────────────────────
function PlayerSpot({ pos, player, onClick, isDragOver, onDragOver, onDragLeave, onDrop }) {
  return (
    <div style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,transform:"translate(-50%,-50%)",zIndex:10,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}
      onDragOver={e=>{e.preventDefault();onDragOver(pos.id);}} onDragLeave={onDragLeave}
      onDrop={e=>{e.preventDefault();onDrop(pos.id);}} onClick={()=>onClick(pos.id,pos.label)}>
      {player ? (
        <>
          <div style={{position:"relative"}}>
            <Avatar name={player.name} nat={player.nat} size={50}/>
            {isDragOver&&<div style={{position:"absolute",inset:-2,borderRadius:"50%",border:"2px dashed #7a5c38",pointerEvents:"none"}}/>}
          </div>
          <div style={{background:"rgba(44,31,14,0.75)",backdropFilter:"blur(4px)",borderRadius:6,padding:"2px 8px",textAlign:"center",maxWidth:80}}>
            <div style={{color:"#fff",fontSize:9,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:0.3,fontFamily:"'Bebas Neue',sans-serif"}}>{player.name.split(" ").slice(-1)[0].toUpperCase()}</div>
            <div style={{color:"#e8c87a",fontSize:7.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:"'DM Sans',sans-serif"}}>{player.role}</div>
          </div>
        </>
      ) : (
        <>
          <div style={{width:50,height:50,borderRadius:"50%",border:"2px dashed rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.1)",transition:"all .2s",transform:isDragOver?"scale(1.1)":"scale(1)"}}>
            <span style={{color:"rgba(255,255,255,0.6)",fontSize:20}}>+</span>
          </div>
          <span style={{color:"rgba(255,255,255,0.5)",fontSize:9,fontWeight:700,letterSpacing:0.5,fontFamily:"'Bebas Neue',sans-serif"}}>{pos.label}</span>
        </>
      )}
    </div>
  );
}

// ─── MAIN APP (after login) ───────────────────────────────────────────────────
function MainApp({ user, isAdmin, onLogout }) {
  const [teamData, setTeamData] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [viewingTeam, setViewingTeam] = useState(null); // admin: team being viewed
  const [activeLineupId, setActiveLineupId] = useState("a");
  const [allFormations, setAllFormations] = useState(FORMATIONS);
  const [showLineupPanel, setShowLineupPanel] = useState(false);
  const [showFormations, setShowFormations] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [pickModal, setPickModal] = useState(null);
  const [dragOverPos, setDragOverPos] = useState(null);
  const [newLineupName, setNewLineupName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dragSubIdx = useRef(null);

  // Load own team data
  useEffect(() => {
    const ref = doc(db, "teams", user.uid);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setTeamData(snap.data());
      } else {
        // Create initial team doc
        const initial = {
          uid: user.uid,
          teamName: user.displayName || "Mi Equipo",
          squad: [],
          lineups: [{ id:"a", name:"Alineación A", formation:"4-3-3", starters:{}, subs:Array(7).fill(null) }],
          createdAt: new Date().toISOString(),
        };
        setDoc(ref, initial);
        setTeamData(initial);
      }
    });
    return unsub;
  }, [user.uid]);

  // Admin: load all teams
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, "teams"), snap => {
      setAllTeams(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
    return unsub;
  }, [isAdmin]);

  const saveTeam = async (patch) => {
    setSaving(true);
    await updateDoc(doc(db, "teams", user.uid), patch);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!teamData) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin .7s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const lineups = teamData.lineups || [];
  const squad = teamData.squad || [];
  const activeLineup = lineups.find(l => l.id === activeLineupId) || lineups[0];
  const positions = allFormations[activeLineup?.formation] || [];
  const filled = Object.values(activeLineup?.starters || {}).filter(Boolean).length;

  const updateLineups = async (newLineups) => {
    await saveTeam({ lineups: newLineups });
  };

  const updateActive = async (fn) => {
    const newLineups = lineups.map(l => l.id === activeLineupId ? { ...l, ...fn(l) } : l);
    await updateLineups(newLineups);
  };

  const handlePick = async (player) => {
    if (!pickModal) return;
    if (pickModal.type === "starter") {
      await updateActive(l => ({ starters: { ...l.starters, [pickModal.posId]: player } }));
    } else {
      await updateActive(l => { const s=[...l.subs]; s[pickModal.subIdx]=player; return {subs:s}; });
    }
    setPickModal(null);
  };

  const handleDrop = async (posId) => {
    if (dragSubIdx.current === null) return;
    const idx = dragSubIdx.current;
    await updateActive(l => {
      const sub=l.subs[idx]; if(!sub) return l;
      const evicted=l.starters[posId]||null;
      const s=[...l.subs]; s[idx]=evicted;
      return {starters:{...l.starters,[posId]:sub},subs:s};
    });
    dragSubIdx.current=null; setDragOverPos(null);
  };

  const addLineup = async () => {
    const name = newLineupName.trim() || `Alineación ${lineups.length+1}`;
    const id = `l_${Date.now()}`;
    const newLineups = [...lineups, {id,name,formation:"4-3-3",starters:{},subs:Array(7).fill(null)}];
    await updateLineups(newLineups);
    setActiveLineupId(id); setNewLineupName(""); setShowLineupPanel(false);
  };

  // Display: if admin is viewing another team, show read-only
  const displayTeam = viewingTeam || { ...teamData, lineups, squad };
  const displayLineup = viewingTeam
    ? (viewingTeam.lineups?.[0] || { formation:"4-3-3", starters:{}, subs:Array(7).fill(null) })
    : activeLineup;
  const displayPositions = allFormations[displayLineup?.formation] || [];
  const readOnly = !!viewingTeam;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Bebas Neue','DM Sans',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", padding:"0 0 40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${C.borderDark};border-radius:4px}
        input::placeholder{color:${C.textFaint}} select option{background:${C.inputBg}}
      `}</style>

      {/* TOP BAR */}
      <div style={{ width:"100%", background:C.card, borderBottom:`1px solid ${C.border}`, padding:"11px 16px", display:"flex", alignItems:"center", gap:8, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
        <span style={{ fontSize:20 }}>⚽</span>
        {viewingTeam ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => setViewingTeam(null)} style={{ background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:7, padding:"4px 10px", color:C.textMid, fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Volver</button>
            <h1 style={{ fontSize:15, fontWeight:800, color:C.text, margin:0, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>{viewingTeam.teamName}</h1>
            <span style={{ fontSize:10, background:C.accentLight, color:C.accent, padding:"2px 7px", borderRadius:10, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Solo lectura</span>
          </div>
        ) : (
          <h1 style={{ fontSize:17, fontWeight:800, color:C.text, margin:0, letterSpacing:1, fontFamily:"'Bebas Neue',sans-serif" }}>
            {teamData.teamName}
          </h1>
        )}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
          {isAdmin && !viewingTeam && <span style={{ fontSize:9, background:C.accent, color:"#fff", padding:"2px 8px", borderRadius:10, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>ADMIN</span>}
          {saving && <span style={{ fontSize:10, color:C.textLight, fontFamily:"'DM Sans',sans-serif" }}>Guardando…</span>}
          {saved && <span style={{ fontSize:10, color:"#27ae60", fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>✓ Guardado</span>}
          {!viewingTeam && (
            <>
              <span style={{ fontSize:10, color:C.textLight, fontFamily:"'DM Sans',sans-serif" }}>{filled}/11</span>
              <button onClick={() => { setShowLineupPanel(v=>!v); setShowFormations(false); setShowSettings(false); }}
                style={{ padding:"5px 10px", borderRadius:7, border:`1.5px solid ${showLineupPanel?C.accent:C.borderDark}`, background:showLineupPanel?C.accent:C.inputBg, color:showLineupPanel?"#fff":C.textMid, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                {activeLineup?.name} ▾
              </button>
              <button onClick={() => { setShowFormations(v=>!v); setShowLineupPanel(false); setShowSettings(false); }}
                style={{ padding:"5px 11px", borderRadius:7, border:`1.5px solid ${showFormations?C.accent:C.borderDark}`, background:showFormations?C.accent:C.inputBg, color:showFormations?"#fff":C.textMid, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:0.5 }}>
                {activeLineup?.formation}
              </button>
              <button onClick={() => { setShowSettings(v=>!v); setShowLineupPanel(false); setShowFormations(false); }}
                style={{ width:30, height:30, borderRadius:7, border:`1.5px solid ${showSettings?C.accent:C.borderDark}`, background:showSettings?C.accent:C.inputBg, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
                ⚙️
              </button>
            </>
          )}
          <button onClick={onLogout} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${C.border}`, background:C.inputBg, color:C.textMid, fontSize:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Salir</button>
        </div>
      </div>

      {/* ADMIN: team list */}
      {isAdmin && !viewingTeam && (
        <div style={{ width:"100%", maxWidth:680, padding:"10px 16px 0" }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.textLight, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>
              Todos los equipos ({allTeams.length})
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              {allTeams.filter(t=>t.uid!==user.uid).map(t=>(
                <button key={t.id} onClick={()=>setViewingTeam(t)}
                  style={{ padding:"6px 13px", borderRadius:8, border:`1px solid ${C.borderDark}`, background:C.inputBg, color:C.textMid, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                  ⚽ {t.teamName}
                  <span style={{ fontSize:9, color:C.textFaint }}>{(t.squad||[]).length} jug.</span>
                </button>
              ))}
              {allTeams.filter(t=>t.uid!==user.uid).length===0&&<span style={{ fontSize:12, color:C.textFaint, fontFamily:"'DM Sans',sans-serif" }}>Aún no hay otros equipos registrados.</span>}
            </div>
          </div>
        </div>
      )}

      {/* LINEUP PANEL */}
      {showLineupPanel && (
        <div style={{ width:"100%", maxWidth:680, padding:"8px 16px 0" }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:12 }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
              {lineups.map(l=>(
                <button key={l.id} onClick={()=>{setActiveLineupId(l.id);setShowLineupPanel(false);}}
                  style={{ padding:"6px 13px", borderRadius:8, border:`1.5px solid ${activeLineupId===l.id?C.accent:C.borderDark}`, background:activeLineupId===l.id?C.accent:C.inputBg, color:activeLineupId===l.id?"#fff":C.textMid, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  {l.name}
                </button>
              ))}
            </div>
            <div style={{ fontSize:10, color:C.textLight, marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
              Todas las alineaciones usan los mismos {squad.length} jugadores.
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={newLineupName} onChange={e=>setNewLineupName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLineup()}
                placeholder="Nueva alineación…"
                style={{ flex:1, padding:"7px 12px", borderRadius:8, border:`1px solid ${C.borderDark}`, background:C.inputBg, color:C.text, fontSize:12, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              <button onClick={addLineup} style={{ padding:"7px 15px", borderRadius:8, background:C.accent, color:"#fff", border:"none", cursor:"pointer", fontSize:12, fontWeight:800, fontFamily:"'DM Sans',sans-serif" }}>+ Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* FORMATION PANEL */}
      {showFormations && (
        <div style={{ width:"100%", maxWidth:680, padding:"8px 16px 0" }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:12, display:"flex", gap:5, flexWrap:"wrap" }}>
            {Object.keys(allFormations).map(f=>(
              <button key={f} onClick={()=>{updateActive(()=>({formation:f,starters:{}}));setShowFormations(false);}}
                style={{ padding:"5px 12px", borderRadius:8, border:`1.5px solid ${activeLineup?.formation===f?C.accent:C.borderDark}`, background:activeLineup?.formation===f?C.accent:C.inputBg, color:activeLineup?.formation===f?"#fff":C.textMid, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"monospace" }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div style={{ width:"100%", maxWidth:680, padding:"8px 16px 0" }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:16 }}>✏️</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.textLight, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Nombre del equipo</div>
                <input value={teamData.teamName} onChange={e=>saveTeam({teamName:e.target.value})}
                  style={{ width:"100%", background:C.inputBg, border:`1px solid ${C.borderDark}`, borderRadius:8, padding:"7px 12px", color:C.text, fontSize:14, fontWeight:700, outline:"none", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              </div>
            </div>
            <div onClick={()=>{setShowAddPlayer(true);setShowSettings(false);}}
              style={{ padding:"13px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.background=C.inputBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{ fontSize:16 }}>👥</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:"'DM Sans',sans-serif" }}>Gestionar plantilla</div>
                <div style={{ fontSize:11, color:C.textLight, fontFamily:"'DM Sans',sans-serif" }}>{squad.length}/26 jugadores</div>
              </div>
              <span style={{ color:C.textFaint, fontSize:16 }}>›</span>
            </div>
          </div>
        </div>
      )}

      {/* FIELD */}
      <div style={{ width:"100%", maxWidth:680, padding:"10px 16px 0" }}>
        <div style={{ position:"relative", width:"100%", paddingBottom:"133%", borderRadius:16, overflow:"hidden", boxShadow:"0 16px 48px rgba(0,0,0,0.18)" }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#1a5c2a 0%,#1e6b30 25%,#1a5c2a 50%,#1e6b30 75%,#1a5c2a 100%)" }}/>
          <svg style={{ position:"absolute",top:0,left:0,width:"100%",height:"100%" }} viewBox="0 0 100 133" preserveAspectRatio="none">
            {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=><rect key={i} x="0" y={i*10.25} width="100" height="10.25" fill={i%2===0?"rgba(0,0,0,0.06)":"rgba(255,255,255,0.03)"}/>)}
            <rect x="4" y="2.5" width="92" height="128" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
            <line x1="4" y1="66" x2="96" y2="66" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
            <circle cx="50" cy="66" r="13" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
            <circle cx="50" cy="66" r="1" fill="rgba(255,255,255,0.6)"/>
            <rect x="22" y="2.5" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6"/>
            <rect x="36" y="2.5" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            <circle cx="50" cy="16" r="1" fill="rgba(255,255,255,0.5)"/>
            <rect x="22" y="110.5" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6"/>
            <rect x="36" y="122.5" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            <circle cx="50" cy="117" r="1" fill="rgba(255,255,255,0.5)"/>
          </svg>
          {displayPositions.map(pos=>(
            <PlayerSpot key={pos.id} pos={pos} player={displayLineup?.starters?.[pos.id]}
              onClick={readOnly?()=>{}:(id,label)=>setPickModal({type:"starter",posId:id,posLabel:label})}
              isDragOver={!readOnly&&dragOverPos===pos.id}
              onDragOver={readOnly?()=>{}:setDragOverPos}
              onDragLeave={readOnly?()=>{}:()=>setDragOverPos(null)}
              onDrop={readOnly?()=>{}:handleDrop}/>
          ))}
          {readOnly&&<div style={{position:"absolute",top:8,right:8,background:"rgba(44,31,14,0.7)",color:"#e8c87a",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:8,fontFamily:"'DM Sans',sans-serif"}}>👁 Solo lectura</div>}
        </div>
      </div>

      {/* BENCH */}
      <div style={{ width:"100%", maxWidth:680, padding:"10px 16px 0" }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"13px 12px 15px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", marginBottom:11 }}>
            <div style={{ width:3, height:15, background:C.accent, borderRadius:2, marginRight:8 }}/>
            <span style={{ fontSize:13, fontWeight:800, color:C.text, letterSpacing:1.5, fontFamily:"'Bebas Neue',sans-serif" }}>BANCA</span>
            <span style={{ marginLeft:8, fontSize:10, color:C.accent, background:C.accentLight, padding:"2px 7px", borderRadius:20, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{(displayLineup?.subs||[]).filter(Boolean).length}/7</span>
            {!readOnly&&<span style={{ marginLeft:"auto", fontSize:9, color:C.textFaint, fontFamily:"'DM Sans',sans-serif" }}>Toca · Arrastra al campo</span>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
            {(displayLineup?.subs||Array(7).fill(null)).map((sub,i)=>(
              <div key={i} draggable={!!sub&&!readOnly} onDragStart={()=>{dragSubIdx.current=i;}}
                onClick={readOnly?undefined:()=>setPickModal({type:"sub",subIdx:i,posLabel:`Suplente ${i+1}`})}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", background:sub?C.inputBg:C.bg, border:`1px solid ${sub?C.borderDark:C.border}`, borderRadius:10, padding:"8px 2px 7px", cursor:readOnly?"default":"pointer", transition:"all .15s", userSelect:"none", gap:4 }}
                onMouseEnter={e=>{if(!readOnly){e.currentTarget.style.background="#e8e0d0";e.currentTarget.style.borderColor=C.accent;}}}
                onMouseLeave={e=>{e.currentTarget.style.background=sub?C.inputBg:C.bg;e.currentTarget.style.borderColor=sub?C.borderDark:C.border;}}>
                {sub?(
                  <>
                    <div style={{ position:"relative", display:"flex", justifyContent:"center", width:"100%" }}>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#3a2010)`,border:"2.5px solid rgba(255,255,255,0.9)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
                        <span style={{ fontSize:9,fontWeight:800,color:"#fff",lineHeight:1,fontFamily:"'Bebas Neue',sans-serif" }}>{sub.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
                        <span style={{ fontSize:8,lineHeight:1,marginTop:1 }}>{sub.nat}</span>
                      </div>
                      <div style={{ position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",background:C.accent,borderRadius:4,padding:"0 4px" }}>
                        <span style={{ fontSize:6,fontWeight:900,color:"#fff",fontFamily:"monospace" }}>{sub.pos}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"center",width:"100%",paddingTop:5 }}>
                      <div style={{ fontSize:7.5,fontWeight:800,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Bebas Neue',sans-serif",padding:"0 2px" }}>{sub.name.split(" ").slice(-1)[0].toUpperCase()}</div>
                      <div style={{ fontSize:6,color:C.accent,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1,padding:"0 2px",fontFamily:"'DM Sans',sans-serif" }}>{sub.role}</div>
                    </div>
                  </>
                ):(
                  <>
                    <div style={{ width:36,height:36,borderRadius:"50%",border:`1.5px dashed ${C.borderDark}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <span style={{ color:C.borderDark,fontSize:17 }}>+</span>
                    </div>
                    <div style={{ fontSize:7,color:C.textFaint,fontWeight:700,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5,marginTop:3 }}>SUB {i+1}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RESERVAS */}
      {(displayTeam.squad||[]).length > (displayLineup?.subs||[]).filter(Boolean).length + filled && (
        <div style={{ width:"100%", maxWidth:680, padding:"10px 16px 0" }}>
          <div style={{ background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:13, padding:"11px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", marginBottom:9 }}>
              <div style={{ width:3,height:13,background:C.borderDark,borderRadius:2,marginRight:8 }}/>
              <span style={{ fontSize:11,fontWeight:800,color:C.textLight,letterSpacing:1.5,fontFamily:"'Bebas Neue',sans-serif" }}>RESERVAS</span>
              <span style={{ marginLeft:"auto",fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif" }}>{(displayTeam.squad||[]).length}/26</span>
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              {(displayTeam.squad||[]).map(p=>{
                const inS=Object.values(displayLineup?.starters||{}).some(s=>s?.id===p.id);
                const inB=(displayLineup?.subs||[]).some(s=>s?.id===p.id);
                if(inS||inB) return null;
                return (
                  <div key={p.id} style={{ display:"flex",alignItems:"center",gap:5,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 8px" }}>
                    <span style={{ fontSize:11 }}>{p.nat}</span>
                    <div>
                      <div style={{ fontSize:8.5,fontWeight:700,color:C.textMid,fontFamily:"'Bebas Neue',sans-serif" }}>{p.name.split(" ").slice(-1)[0].toUpperCase()}</div>
                      <div style={{ fontSize:7,color:C.textLight,fontFamily:"monospace" }}>{p.pos}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showAddPlayer&&<AddPlayerModal currentCount={squad.length} onAdd={async p=>{await saveTeam({squad:[...squad,p]});setShowAddPlayer(false);}} onClose={()=>setShowAddPlayer(false)}/>}
      {pickModal&&<PickFromSquad squad={squad} posLabel={pickModal.posLabel} onPick={handlePick} onClose={()=>setPickModal(null)}/>}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        // Check / auto-assign admin
        const adminRef = doc(db, "admins", u.uid);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          setIsAdmin(true);
        } else {
          const allAdmins = await getDocs(collection(db, "admins"));
          if (allAdmins.empty) {
            await setDoc(adminRef, { email: u.email, uid: u.uid, superAdmin: true });
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin .7s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
    </div>
  );

  if (!user) return <AuthScreen onAuth={u => setUser(u)}/>;

  return <MainApp user={user} isAdmin={isAdmin} onLogout={() => signOut(auth)}/>;
}
