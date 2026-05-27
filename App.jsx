import { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, deleteDoc } from "firebase/firestore";

// ─── COLORES ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#faf7f0",
  card:"#fff9ef",
  border:"#e8d9b5",
  borderDark:"#d4b87a",
  accent:"#c49a2a",
  accentDark:"#a07c1a",
  accentLight:"rgba(196,154,42,0.1)",
  text:"#1a1408",
  textMid:"#4a3a10",
  textLight:"#8a7040",
  textFaint:"#b89a50",
  inputBg:"#f5edd8",
  gold:"#d4a82a",
  goldLight:"rgba(212,168,42,0.15)",
};

// ─── FORMACIONES FC26 ─────────────────────────────────────────────────────────
const FORMATIONS = {
  "3-1-4-2":   [{id:"gk",label:"GK",x:50,y:88},{id:"cb1",label:"CB",x:68,y:74},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:32,y:74},{id:"cdm",label:"CDM",x:50,y:63},{id:"rm",label:"RM",x:82,y:50},{id:"cm1",label:"CM",x:62,y:50},{id:"cm2",label:"CM",x:38,y:50},{id:"lm",label:"LM",x:18,y:50},{id:"st1",label:"ST",x:63,y:22},{id:"st2",label:"ST",x:37,y:22}],
  "3-4-1-2":   [{id:"gk",label:"GK",x:50,y:88},{id:"cb1",label:"CB",x:68,y:74},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:32,y:74},{id:"rm",label:"RM",x:82,y:56},{id:"cm1",label:"CM",x:62,y:56},{id:"cm2",label:"CM",x:38,y:56},{id:"lm",label:"LM",x:18,y:56},{id:"cam",label:"CAM",x:50,y:38},{id:"st1",label:"ST",x:63,y:22},{id:"st2",label:"ST",x:37,y:22}],
  "3-4-2-1":   [{id:"gk",label:"GK",x:50,y:88},{id:"cb1",label:"CB",x:68,y:74},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:32,y:74},{id:"rm",label:"RM",x:82,y:56},{id:"cm1",label:"CM",x:62,y:56},{id:"cm2",label:"CM",x:38,y:56},{id:"lm",label:"LM",x:18,y:56},{id:"rf",label:"RF",x:65,y:34},{id:"lf",label:"LF",x:35,y:34},{id:"st",label:"ST",x:50,y:16}],
  "3-4-3":     [{id:"gk",label:"GK",x:50,y:88},{id:"cb1",label:"CB",x:68,y:74},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:32,y:74},{id:"rm",label:"RM",x:82,y:52},{id:"cm1",label:"CM",x:62,y:52},{id:"cm2",label:"CM",x:38,y:52},{id:"lm",label:"LM",x:18,y:52},{id:"rw",label:"RW",x:78,y:24},{id:"st",label:"ST",x:50,y:17},{id:"lw",label:"LW",x:22,y:24}],
  "3-5-2":     [{id:"gk",label:"GK",x:50,y:88},{id:"cb1",label:"CB",x:68,y:74},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:32,y:74},{id:"rwb",label:"RWB",x:85,y:52},{id:"cm1",label:"CM",x:67,y:50},{id:"cm2",label:"CM",x:50,y:47},{id:"cm3",label:"CM",x:33,y:50},{id:"lwb",label:"LWB",x:15,y:52},{id:"st1",label:"ST",x:63,y:21},{id:"st2",label:"ST",x:37,y:21}],
  "4-1-2-1-2": [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm",label:"CDM",x:50,y:60},{id:"cm1",label:"CM",x:72,y:48},{id:"cm2",label:"CM",x:28,y:48},{id:"cam",label:"CAM",x:50,y:36},{id:"st1",label:"ST",x:63,y:20},{id:"st2",label:"ST",x:37,y:20}],
  "4-1-2-1-2(2)":[{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm",label:"CDM",x:50,y:61},{id:"rm",label:"RM",x:78,y:46},{id:"lm",label:"LM",x:22,y:46},{id:"cam",label:"CAM",x:50,y:34},{id:"st1",label:"ST",x:63,y:20},{id:"st2",label:"ST",x:37,y:20}],
  "4-1-3-2":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm",label:"CDM",x:50,y:61},{id:"rm",label:"RM",x:75,y:47},{id:"cm",label:"CM",x:50,y:47},{id:"lm",label:"LM",x:25,y:47},{id:"st1",label:"ST",x:63,y:22},{id:"st2",label:"ST",x:37,y:22}],
  "4-1-4-1":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm",label:"CDM",x:50,y:61},{id:"rm",label:"RM",x:82,y:46},{id:"cm1",label:"CM",x:63,y:47},{id:"cm2",label:"CM",x:37,y:47},{id:"lm",label:"LM",x:18,y:46},{id:"st",label:"ST",x:50,y:17}],
  "4-2-1-3":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm1",label:"CDM",x:65,y:59},{id:"cdm2",label:"CDM",x:35,y:59},{id:"cam",label:"CAM",x:50,y:42},{id:"rw",label:"RW",x:78,y:23},{id:"st",label:"ST",x:50,y:17},{id:"lw",label:"LW",x:22,y:23}],
  "4-2-2-2":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm1",label:"CDM",x:65,y:59},{id:"cdm2",label:"CDM",x:35,y:59},{id:"ram",label:"RAM",x:70,y:40},{id:"lam",label:"LAM",x:30,y:40},{id:"st1",label:"ST",x:63,y:21},{id:"st2",label:"ST",x:37,y:21}],
  "4-2-3-1":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:72},{id:"cb2",label:"CB",x:38,y:72},{id:"lb",label:"LB",x:20,y:72},{id:"cdm1",label:"CDM",x:62,y:57},{id:"cdm2",label:"CDM",x:38,y:57},{id:"ram",label:"RAM",x:76,y:36},{id:"cam",label:"CAM",x:50,y:34},{id:"lam",label:"LAM",x:24,y:36},{id:"st",label:"ST",x:50,y:16}],
  "4-2-3-1(2)":[{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:72},{id:"cb2",label:"CB",x:38,y:72},{id:"lb",label:"LB",x:20,y:72},{id:"cdm1",label:"CDM",x:65,y:59},{id:"cdm2",label:"CDM",x:35,y:59},{id:"rw",label:"RW",x:78,y:36},{id:"cam",label:"CAM",x:50,y:34},{id:"lw",label:"LW",x:22,y:36},{id:"st",label:"ST",x:50,y:16}],
  "4-2-4":     [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm1",label:"CDM",x:63,y:58},{id:"cdm2",label:"CDM",x:37,y:58},{id:"rw",label:"RW",x:82,y:24},{id:"rf",label:"RF",x:60,y:20},{id:"lf",label:"LF",x:40,y:20},{id:"lw",label:"LW",x:18,y:24}],
  "4-3-1-2":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cm1",label:"CM",x:72,y:54},{id:"cm2",label:"CM",x:50,y:54},{id:"cm3",label:"CM",x:28,y:54},{id:"cam",label:"CAM",x:50,y:38},{id:"st1",label:"ST",x:63,y:21},{id:"st2",label:"ST",x:37,y:21}],
  "4-3-2-1":   [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cm1",label:"CM",x:72,y:54},{id:"cm2",label:"CM",x:50,y:54},{id:"cm3",label:"CM",x:28,y:54},{id:"rf",label:"RF",x:65,y:33},{id:"lf",label:"LF",x:35,y:33},{id:"st",label:"ST",x:50,y:16}],
  "4-3-3":     [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:70},{id:"cb1",label:"CB",x:62,y:71},{id:"cb2",label:"CB",x:38,y:71},{id:"lb",label:"LB",x:20,y:70},{id:"cm1",label:"CM",x:74,y:50},{id:"cm2",label:"CM",x:50,y:47},{id:"cm3",label:"CM",x:26,y:50},{id:"rw",label:"RW",x:80,y:26},{id:"st",label:"ST",x:50,y:17},{id:"lw",label:"LW",x:20,y:26}],
  "4-3-3(2)":  [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cm1",label:"CM",x:72,y:53},{id:"cam",label:"CAM",x:50,y:44},{id:"cm2",label:"CM",x:28,y:53},{id:"rw",label:"RW",x:78,y:24},{id:"st",label:"ST",x:50,y:15},{id:"lw",label:"LW",x:22,y:24}],
  "4-3-3(3)":  [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm",label:"CDM",x:50,y:62},{id:"cm1",label:"CM",x:70,y:49},{id:"cm2",label:"CM",x:30,y:49},{id:"rw",label:"RW",x:78,y:24},{id:"st",label:"ST",x:50,y:15},{id:"lw",label:"LW",x:22,y:24}],
  "4-3-3(4)":  [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"cdm1",label:"CDM",x:65,y:60},{id:"cdm2",label:"CDM",x:35,y:60},{id:"cm",label:"CM",x:50,y:48},{id:"rw",label:"RW",x:78,y:24},{id:"st",label:"ST",x:50,y:15},{id:"lw",label:"LW",x:22,y:24}],
  "4-4-1-1(2)":[{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"rm",label:"RM",x:82,y:52},{id:"cm1",label:"CM",x:62,y:52},{id:"cm2",label:"CM",x:38,y:52},{id:"lm",label:"LM",x:18,y:52},{id:"cam",label:"CAM",x:50,y:35},{id:"st",label:"ST",x:50,y:18}],
  "4-4-2":     [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:70},{id:"cb1",label:"CB",x:62,y:71},{id:"cb2",label:"CB",x:38,y:71},{id:"lb",label:"LB",x:20,y:70},{id:"rm",label:"RM",x:80,y:50},{id:"cm1",label:"CM",x:60,y:50},{id:"cm2",label:"CM",x:40,y:50},{id:"lm",label:"LM",x:20,y:50},{id:"st1",label:"ST",x:63,y:22},{id:"st2",label:"ST",x:37,y:22}],
  "4-4-2(2)":  [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"rm",label:"RM",x:82,y:53},{id:"cdm1",label:"CDM",x:62,y:60},{id:"cdm2",label:"CDM",x:38,y:60},{id:"lm",label:"LM",x:18,y:53},{id:"st1",label:"ST",x:63,y:21},{id:"st2",label:"ST",x:37,y:21}],
  "4-5-1":     [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"rm",label:"RM",x:85,y:50},{id:"cm1",label:"CM",x:67,y:50},{id:"cm2",label:"CM",x:50,y:48},{id:"cm3",label:"CM",x:33,y:50},{id:"lm",label:"LM",x:15,y:50},{id:"st",label:"ST",x:50,y:18}],
  "4-5-1(2)":  [{id:"gk",label:"GK",x:50,y:88},{id:"rb",label:"RB",x:80,y:72},{id:"cb1",label:"CB",x:62,y:73},{id:"cb2",label:"CB",x:38,y:73},{id:"lb",label:"LB",x:20,y:72},{id:"rm",label:"RM",x:85,y:50},{id:"cm1",label:"CM",x:67,y:50},{id:"cam",label:"CAM",x:50,y:38},{id:"cm2",label:"CM",x:33,y:50},{id:"lm",label:"LM",x:15,y:50},{id:"st",label:"ST",x:50,y:18}],
  "5-2-1-2":   [{id:"gk",label:"GK",x:50,y:88},{id:"rwb",label:"RWB",x:86,y:68},{id:"cb1",label:"CB",x:70,y:74},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:30,y:74},{id:"lwb",label:"LWB",x:14,y:68},{id:"cm1",label:"CM",x:65,y:54},{id:"cm2",label:"CM",x:35,y:54},{id:"cam",label:"CAM",x:50,y:40},{id:"st1",label:"ST",x:63,y:22},{id:"st2",label:"ST",x:37,y:22}],
  "5-2-3":     [{id:"gk",label:"GK",x:50,y:88},{id:"rwb",label:"RWB",x:86,y:68},{id:"cb1",label:"CB",x:70,y:74},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:30,y:74},{id:"lwb",label:"LWB",x:14,y:68},{id:"cm1",label:"CM",x:65,y:52},{id:"cm2",label:"CM",x:35,y:52},{id:"rw",label:"RW",x:78,y:24},{id:"st",label:"ST",x:50,y:17},{id:"lw",label:"LW",x:22,y:24}],
  "5-3-2":     [{id:"gk",label:"GK",x:50,y:88},{id:"rwb",label:"RWB",x:86,y:68},{id:"cb1",label:"CB",x:68,y:73},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:32,y:73},{id:"lwb",label:"LWB",x:14,y:68},{id:"cm1",label:"CM",x:70,y:49},{id:"cm2",label:"CM",x:50,y:47},{id:"cm3",label:"CM",x:30,y:49},{id:"st1",label:"ST",x:63,y:22},{id:"st2",label:"ST",x:37,y:22}],
  "5-4-1":     [{id:"gk",label:"GK",x:50,y:88},{id:"rwb",label:"RWB",x:86,y:69},{id:"cb1",label:"CB",x:68,y:74},{id:"cb2",label:"CB",x:50,y:75},{id:"cb3",label:"CB",x:32,y:74},{id:"lwb",label:"LWB",x:14,y:69},{id:"rm",label:"RM",x:80,y:50},{id:"cm1",label:"CM",x:60,y:50},{id:"cm2",label:"CM",x:40,y:50},{id:"lm",label:"LM",x:20,y:50},{id:"st",label:"ST",x:50,y:18}],
};

const POSITIONS_LIST = ["GK","SW","CB","RB","LB","RWB","LWB","CDM","DM","CM","RM","LM","CAM","RAM","LAM","RW","LW","CF","ST"];

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
          <div style={{fontSize:44,marginBottom:14}}>⚽</div>
          <h1 style={{fontSize:26,fontWeight:800,color:C.text,margin:"0 0 8px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>LINEUP MANAGER</h1>
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
          <input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="Ej. FC Javier…" style={inp} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/></>
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
function Avatar({name,size=50}){
  const i=name?name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():"?";
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${C.accentDark},${C.accent})`,border:"2.5px solid rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 10px rgba(0,0,0,0.15)",flexShrink:0}}>
      <span style={{fontSize:size*0.32,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>{i}</span>
    </div>
  );
}

// ─── ADD PLAYER MODAL ─────────────────────────────────────────────────────────
function AddPlayerModal({onAdd,onClose,currentCount}){
  const[tab,setTab]=useState("search");
  const[query,setQuery]=useState("");
  const[results,setResults]=useState(FC26_DB.slice(0,20));
  const[mName,setMName]=useState("");
  const[mPos,setMPos]=useState([]);
  const[mTeam,setMTeam]=useState("");
  const[mAge,setMAge]=useState("");
  const[mErr,setMErr]=useState("");
  const remaining=26-currentCount;

  const TS=a=>({flex:1,padding:"9px 0",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:a?C.text:C.textFaint,borderBottom:a?`2px solid ${C.accent}`:"2px solid transparent",fontFamily:"'DM Sans',sans-serif"});

  const togglePos=(p)=>setMPos(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p]);

  const handleManual=()=>{
    if(!mName.trim()){setMErr("Nombre obligatorio.");return;}
    if(mPos.length===0){setMErr("Selecciona al menos una posición.");return;}
    setMErr("");
    onAdd({id:`p_${Date.now()}`,name:mName.trim(),pos:mPos.join("/"),team:mTeam.trim()||"—",age:mAge?parseInt(mAge):null});
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
          <div style={{display:"flex"}}><button style={TS(tab==="search")} onClick={()=>setTab("search")}>🔍 Buscar FC26</button><button style={TS(tab==="manual")} onClick={()=>setTab("manual")}>✏️ Manual</button></div>
        </div>

        {tab==="search"&&(
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
              {results.map((p,i)=>(
                <div key={p.id} onClick={()=>remaining>0&&onAdd({...p,id:`p_${Date.now()}_${i}`})}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",cursor:remaining>0?"pointer":"not-allowed",borderBottom:`1px solid ${C.border}`,transition:"background .1s",opacity:remaining>0?1:0.4}}
                  onMouseEnter={e=>remaining>0&&(e.currentTarget.style.background=C.inputBg)} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Avatar name={p.name} size={38}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                    <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.team} · {p.age}a</div>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:C.textLight,background:C.inputBg,padding:"3px 8px",borderRadius:6,fontFamily:"monospace",border:`1px solid ${C.border}`}}>{p.pos}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==="manual"&&(
          <div style={{overflowY:"auto",flex:1,padding:"14px 18px 22px"}}>
            {[["Nombre *",mName,setMName,"Ej. Carlos Ruiz"],["Equipo",mTeam,setMTeam,"Ej. Municipal"]].map(([label,val,setter,ph])=>(
              <div key={label} style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
                <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                  style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Edad</label>
              <input value={mAge} onChange={e=>setMAge(e.target.value)} type="number" min="14" max="50" placeholder="25"
                style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:13,outline:"none",fontFamily:"monospace"}}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
            </div>
            <label style={{fontSize:11,fontWeight:600,color:C.textLight,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>Posiciones * <span style={{fontSize:9,color:C.textFaint,textTransform:"none"}}>(puedes seleccionar varias)</span></label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:16}}>
              {POSITIONS_LIST.map(p=>(
                <button key={p} onClick={()=>togglePos(p)}
                  style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${mPos.includes(p)?C.accent:C.borderDark}`,background:mPos.includes(p)?C.accent:C.inputBg,color:mPos.includes(p)?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace",transition:"all .15s"}}>
                  {p}
                </button>
              ))}
            </div>
            {mErr&&<p style={{color:"#c0392b",fontSize:12,margin:"0 0 10px",fontFamily:"'DM Sans',sans-serif"}}>⚠ {mErr}</p>}
            <button onClick={handleManual} disabled={remaining<=0}
              style={{width:"100%",padding:"12px",background:remaining>0?C.accent:"#ccc",color:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:800,cursor:remaining>0?"pointer":"not-allowed",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
              AGREGAR A PLANTILLA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PICK FROM SQUAD ──────────────────────────────────────────────────────────
function PickFromSquad({squad,posLabel,onPick,onClose,usedIds}){
  const[filter,setFilter]=useState("");
  const filtered=squad.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase())||p.pos.toLowerCase().includes(filter.toLowerCase()));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:400,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(196,154,42,0.12)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"14px 20px 11px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:9}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Asignar <span style={{color:C.accent,fontFamily:"monospace",background:C.goldLight,padding:"1px 7px",borderRadius:6}}>{posLabel}</span></span>
            <button onClick={onClose} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          <input autoFocus value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar plantilla…"
            style={{width:"100%",padding:"9px 13px",borderRadius:10,border:`1.5px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {squad.length===0&&<div style={{padding:"32px",textAlign:"center",color:C.textFaint,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Plantilla vacía. Agrega jugadores desde ⚙️</div>}
          {filtered.map(p=>{
            const isUsed=usedIds?.includes(p.id);
            return(
              <div key={p.id} onClick={()=>!isUsed&&onPick(p)}
                style={{display:"flex",alignItems:"center",gap:11,padding:"10px 18px",cursor:isUsed?"not-allowed":"pointer",borderBottom:`1px solid ${C.border}`,transition:"background .1s",opacity:isUsed?0.35:1}}
                onMouseEnter={e=>{if(!isUsed) e.currentTarget.style.background=C.inputBg;}} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Avatar name={p.name} size={38}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                  <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.team||"—"}{p.age?` · ${p.age}a`:""}</div>
                  {isUsed&&<span style={{fontSize:9,color:C.accent,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Ya en la alineación</span>}
                </div>
                <span style={{fontSize:10,fontWeight:700,color:C.accent,background:C.goldLight,padding:"3px 8px",borderRadius:6,fontFamily:"monospace",border:`1px solid ${C.border}`}}>{p.pos}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PLAYER SPOT ──────────────────────────────────────────────────────────────
function PlayerSpot({pos,player,readOnly,onClick,onRemove,isDragOver,onDragOver,onDragLeave,onDrop,onDragStart}){
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
            <div onClick={readOnly?undefined:()=>setShowMenu(v=>!v)}>
              <Avatar name={player.name} size={50}/>
              {isDragOver&&<div style={{position:"absolute",inset:-2,borderRadius:"50%",border:`2px dashed ${C.accent}`,pointerEvents:"none"}}/>}
            </div>
            {showMenu&&!readOnly&&(
              <div style={{position:"absolute",top:"110%",left:"50%",transform:"translateX(-50%)",background:C.card,border:`1.5px solid ${C.accent}`,borderRadius:10,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:50,minWidth:110}}>
                <div onClick={()=>{setShowMenu(false);onClick(pos.id,pos.label);}}
                  style={{padding:"9px 14px",fontSize:12,fontWeight:700,color:C.text,cursor:"pointer",borderBottom:`1px solid ${C.border}`,fontFamily:"'DM Sans',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.inputBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  🔄 Cambiar
                </div>
                <div onClick={()=>{setShowMenu(false);onRemove(pos.id);}}
                  style={{padding:"9px 14px",fontSize:12,fontWeight:700,color:"#c0392b",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#fff5f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  ✕ Quitar
                </div>
              </div>
            )}
          </div>
          <div style={{background:"rgba(26,20,8,0.78)",backdropFilter:"blur(4px)",borderRadius:7,padding:"3px 9px",textAlign:"center",maxWidth:84}}
            onClick={readOnly?undefined:()=>setShowMenu(v=>!v)}>
            <div style={{color:"#fff",fontSize:9,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:0.3,fontFamily:"'Bebas Neue',sans-serif"}}>{player.name.split(" ").slice(-1)[0].toUpperCase()}</div>
            <div style={{color:C.gold,fontSize:7.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:"'DM Sans',sans-serif"}}>{player.pos}</div>
          </div>
        </>
      ):(
        <>
          <div onClick={readOnly?undefined:()=>onClick(pos.id,pos.label)}
            style={{width:50,height:50,borderRadius:"50%",border:`2px dashed ${readOnly?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.55)"}`,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.08)",transition:"all .2s",transform:isDragOver?"scale(1.12)":"scale(1)"}}>
            {!readOnly&&<span style={{color:"rgba(255,255,255,0.65)",fontSize:20}}>+</span>}
          </div>
          <span style={{color:"rgba(255,255,255,0.55)",fontSize:9,fontWeight:700,letterSpacing:0.5,fontFamily:"'Bebas Neue',sans-serif"}}>{pos.label}</span>
        </>
      )}
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
function Field({positions,lineup,readOnly,onClickPos,onRemovePos,dragOverPos,onDragOver,onDragLeave,onDrop,onDragStartPos}){
  return(
    <div style={{position:"relative",width:"100%",paddingBottom:"133%",borderRadius:16,overflow:"hidden",boxShadow:"0 16px 48px rgba(0,0,0,0.18)"}}>
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
          onDragStart={onDragStartPos||(() =>{})}/>
      ))}
      {readOnly&&<div style={{position:"absolute",top:8,right:8,background:"rgba(26,20,8,0.72)",color:C.gold,fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:8,fontFamily:"'DM Sans',sans-serif"}}>👁 Solo lectura</div>}
    </div>
  );
}

// ─── BENCH ────────────────────────────────────────────────────────────────────
function Bench({subs,readOnly,onClickSub,onDragStart}){
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 12px 15px",boxShadow:"0 2px 12px rgba(196,154,42,0.08)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{width:3,height:16,background:C.accent,borderRadius:2}}/>
        <span style={{fontSize:13,fontWeight:800,color:C.text,letterSpacing:1.5,fontFamily:"'Bebas Neue',sans-serif"}}>BANCA</span>
        <span style={{marginLeft:"auto",fontSize:10,color:C.accent,background:C.goldLight,padding:"2px 8px",borderRadius:20,fontWeight:700,fontFamily:"'DM Sans',sans-serif",border:`1px solid ${C.border}`}}>{(subs||[]).filter(Boolean).length}/7</span>
        {!readOnly&&<span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Toca · Arrastra al campo</span>}
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
                <div style={{position:"relative",display:"flex",justifyContent:"center",width:"100%"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.accentDark},${C.accent})`,border:"2.5px solid rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>
                    <span style={{fontSize:10,fontWeight:800,color:"#fff",fontFamily:"'Bebas Neue',sans-serif"}}>{sub.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
                  </div>
                  <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",background:C.accent,borderRadius:4,padding:"0 4px",minWidth:22,textAlign:"center"}}>
                    <span style={{fontSize:6,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{sub.pos.split("/")[0]}</span>
                  </div>
                </div>
                <div style={{textAlign:"center",width:"100%",paddingTop:5}}>
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
function AdminTeamEditor({teamData}){
  const[showAddPlayer,setShowAddPlayer]=useState(false);
  const[pickModal,setPickModal]=useState(null);
  const[saving,setSaving]=useState(false);
  const[localData,setLocalData]=useState(teamData);
  const dragSubIdx=useRef(null);
  const[dragOverPos,setDragOverPos]=useState(null);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"teams",teamData.uid),snap=>{
      if(snap.exists()) setLocalData({uid:snap.id,...snap.data()});
    });
    return unsub;
  },[teamData.uid]);

  const save=async patch=>{setSaving(true);await updateDoc(doc(db,"teams",localData.uid),patch);setSaving(false);};
  const lineup=localData.lineups?.[0]||{formation:"4-3-3",starters:{},subs:Array(7).fill(null)};
  const squad=localData.squad||[];
  const positions=FORMATIONS[lineup.formation]||FORMATIONS["4-3-3"];

  const updateLineup=async fn=>{
    const nl=(localData.lineups||[]).map((l,i)=>i===0?{...l,...fn(l)}:l);
    if(!nl.length) nl.push({id:"a",name:"Alineación A",formation:"4-3-3",starters:{},subs:Array(7).fill(null)});
    await save({lineups:nl});
  };

  const handlePick=async player=>{
    if(!pickModal) return;
    if(pickModal.type==="starter") await updateLineup(l=>({starters:{...l.starters,[pickModal.posId]:player}}));
    else await updateLineup(l=>{const s=[...l.subs];s[pickModal.subIdx]=player;return{subs:s};});
    setPickModal(null);
  };

  const handleDrop=async posId=>{
    if(dragSubIdx.current===null) return;
    const idx=dragSubIdx.current;
    await updateLineup(l=>{const sub=l.subs[idx];if(!sub) return l;const evicted=l.starters[posId]||null;const s=[...l.subs];s[idx]=evicted;return{starters:{...l.starters,[posId]:sub},subs:s};});
    dragSubIdx.current=null;setDragOverPos(null);
  };

  return(
    <div style={{marginTop:12,background:C.card,border:`2px solid ${C.accent}`,borderRadius:16,overflow:"hidden",boxShadow:`0 8px 32px ${C.goldLight}`}}>
      <div style={{padding:"11px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,background:C.goldLight,flexWrap:"wrap"}}>
        <div style={{width:3,height:16,background:C.accent,borderRadius:2}}/>
        <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{localData.teamName}</span>
        {saving&&<span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>Guardando…</span>}
        <div style={{marginLeft:"auto",display:"flex",gap:4,flexWrap:"wrap"}}>
          {Object.keys(FORMATIONS).map(f=>(
            <button key={f} onClick={()=>updateLineup(()=>({formation:f,starters:{}}))}
              style={{padding:"3px 7px",borderRadius:6,border:`1.5px solid ${lineup.formation===f?C.accent:C.borderDark}`,background:lineup.formation===f?C.accent:C.inputBg,color:lineup.formation===f?"#fff":C.textMid,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"monospace"}}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 14px 14px",display:"flex",gap:14,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 220px"}}>
          <Field positions={positions} lineup={lineup} readOnly={false}
            onClickPos={(id,label)=>setPickModal({type:"starter",posId:id,posLabel:label})}
            dragOverPos={dragOverPos} onDragOver={setDragOverPos} onDragLeave={()=>setDragOverPos(null)} onDrop={handleDrop}/>
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
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 7px",borderRadius:7,background:C.inputBg,border:`1px solid ${C.border}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                    <div style={{fontSize:8,color:C.textLight,fontFamily:"monospace"}}>{p.pos}</div>
                  </div>
                  <button onClick={async()=>{const ns=squad.filter(s=>s.id!==p.id);await save({squad:ns});}}
                    style={{background:"none",border:"none",color:"#d4846a",cursor:"pointer",fontSize:13,padding:0,flexShrink:0}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showAddPlayer&&<AddPlayerModal currentCount={squad.length} onAdd={async p=>{await save({squad:[...squad,p]});setShowAddPlayer(false);}} onClose={()=>setShowAddPlayer(false)}/>}
      {pickModal&&<PickFromSquad squad={squad} posLabel={pickModal.posLabel} onPick={handlePick} onClose={()=>setPickModal(null)}/>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp({user,isAdmin,onLogout}){
  const[teamData,setTeamData]=useState(null);
  const[allTeams,setAllTeams]=useState([]);
  const[viewingTeam,setViewingTeam]=useState(null);
  const[activeLineupId,setActiveLineupId]=useState("a");
  const[showLineupPanel,setShowLineupPanel]=useState(false);
  const[showFormations,setShowFormations]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
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
    const unsub=onSnapshot(ref,snap=>{
      if(snap.exists()) setTeamData(snap.data());
      else{
        const init={uid:user.uid,email:user.email,teamName:user.displayName||"Mi Equipo",squad:[],lineups:[{id:"a",name:"Alineación A",formation:"4-3-3",starters:{},subs:Array(7).fill(null)}],createdAt:new Date().toISOString()};
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

  const saveTeam=async patch=>{setSaving(true);await updateDoc(doc(db,"teams",user.uid),patch);setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);};

  if(!teamData) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const lineups=teamData.lineups||[];
  const squad=teamData.squad||[];
  const activeLineup=lineups.find(l=>l.id===activeLineupId)||lineups[0]||{formation:"4-3-3",starters:{},subs:Array(7).fill(null)};
  const positions=FORMATIONS[activeLineup?.formation]||FORMATIONS["4-3-3"];
  const filled=Object.values(activeLineup?.starters||{}).filter(Boolean).length;

  const updateActive=async fn=>{const nl=lineups.map(l=>l.id===activeLineupId?{...l,...fn(l)}:l);await saveTeam({lineups:nl});};

  const handlePick=async player=>{
    if(!pickModal) return;
    if(pickModal.type==="starter"){
      await updateActive(l=>{
        // Remove player from any other position first
        const newStarters={...l.starters};
        Object.keys(newStarters).forEach(k=>{
          if(newStarters[k]?.id===player.id) delete newStarters[k];
        });
        // Also remove from subs if present
        const newSubs=l.subs.map(s=>s?.id===player.id?null:s);
        newStarters[pickModal.posId]=player;
        return{starters:newStarters,subs:newSubs};
      });
    } else {
      await updateActive(l=>{
        // Remove from starters if present
        const newStarters={...l.starters};
        Object.keys(newStarters).forEach(k=>{
          if(newStarters[k]?.id===player.id) delete newStarters[k];
        });
        // Remove from other sub slots
        const newSubs=l.subs.map((s,i)=>i===pickModal.subIdx?player:(s?.id===player.id?null:s));
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

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Bebas Neue','DM Sans',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 40px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.borderDark};border-radius:4px}input::placeholder{color:${C.textFaint}}select option{background:${C.inputBg}}`}</style>

      {/* TOP BAR */}
      <div style={{width:"100%",background:C.card,borderBottom:`1px solid ${C.border}`,padding:"11px 16px",display:"flex",alignItems:"center",gap:8,position:"sticky",top:0,zIndex:100,boxShadow:`0 2px 16px rgba(196,154,42,0.08)`}}>
        <span style={{fontSize:20}}>⚽</span>
        <h1 style={{fontSize:17,fontWeight:800,color:C.text,margin:0,letterSpacing:1,fontFamily:"'Bebas Neue',sans-serif"}}>{teamData.teamName}</h1>
        {isAdmin&&<span style={{fontSize:9,background:C.accent,color:"#fff",padding:"2px 8px",borderRadius:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif",letterSpacing:0.5}}>ADMIN</span>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          {saving&&<span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>Guardando…</span>}
          {saved&&<span style={{fontSize:10,color:"#27ae60",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✓</span>}
          <span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{filled}/11</span>
          {btn(showLineupPanel,()=>{setShowLineupPanel(v=>!v);setShowFormations(false);setShowSettings(false);},`${activeLineup?.name} ▾`)}
          <button onClick={()=>{setShowFormations(v=>!v);setShowLineupPanel(false);setShowSettings(false);}}
            style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${showFormations?C.accent:C.borderDark}`,background:showFormations?C.accent:C.inputBg,color:showFormations?"#fff":C.textMid,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:0.5}}>
            {activeLineup?.formation}
          </button>
          <button onClick={()=>{setShowSettings(v=>!v);setShowLineupPanel(false);setShowFormations(false);}}
            style={{width:30,height:30,borderRadius:8,border:`1.5px solid ${showSettings?C.accent:C.borderDark}`,background:showSettings?C.accent:C.inputBg,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>⚙️</button>
          <button onClick={onLogout} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:C.inputBg,color:C.textMid,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Salir</button>
        </div>
      </div>

      <div style={{width:"100%",maxWidth:1060,padding:"0 14px"}}>

        {/* ADMIN PANEL */}
        {isAdmin&&(
          <div style={{paddingTop:12}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>
                Todos los equipos ({allTeams.length})
              </div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {allTeams.filter(t=>t.uid!==user.uid).map(t=>(
                  <button key={t.id} onClick={()=>setViewingTeam(viewingTeam?.uid===t.uid?null:t)}
                    style={{padding:"6px 13px",borderRadius:9,border:`1.5px solid ${viewingTeam?.uid===t.uid?C.accent:C.borderDark}`,background:viewingTeam?.uid===t.uid?C.accent:C.inputBg,color:viewingTeam?.uid===t.uid?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
                    ⚽ {t.teamName}
                    <span style={{fontSize:9,color:viewingTeam?.uid===t.uid?"rgba(255,255,255,0.7)":C.textFaint}}>{(t.squad||[]).length} jug.</span>
                  </button>
                ))}
                {allTeams.filter(t=>t.uid!==user.uid).length===0&&<span style={{fontSize:12,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Aún no hay otros equipos registrados.</span>}
              </div>
            </div>
            {viewingTeam&&<AdminTeamEditor teamData={viewingTeam}/>}
          </div>
        )}

        {/* LINEUP PANEL */}
        {showLineupPanel&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:13,marginTop:10,boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
              {lineups.map(l=>(
                <button key={l.id} onClick={()=>{setActiveLineupId(l.id);setShowLineupPanel(false);}}
                  style={{padding:"6px 13px",borderRadius:9,border:`1.5px solid ${activeLineupId===l.id?C.accent:C.borderDark}`,background:activeLineupId===l.id?C.accent:C.inputBg,color:activeLineupId===l.id?"#fff":C.textMid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  {l.name}
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:C.textLight,marginBottom:9,fontFamily:"'DM Sans',sans-serif"}}>Todas usan los mismos {squad.length} jugadores de la plantilla.</div>
            <div style={{display:"flex",gap:8}}>
              <input value={newLineupName} onChange={e=>setNewLineupName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLineup()} placeholder="Nueva alineación…"
                style={{flex:1,padding:"8px 12px",borderRadius:9,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
              <button onClick={addLineup} style={{padding:"8px 15px",borderRadius:9,background:C.accent,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"'DM Sans',sans-serif"}}>+ Crear</button>
            </div>
          </div>
        )}

        {/* FORMATION PANEL */}
        {showFormations&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:12,marginTop:10,display:"flex",gap:5,flexWrap:"wrap",boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
            {Object.keys(FORMATIONS).map(f=>(
              <button key={f} onClick={()=>{updateActive(()=>({formation:f,starters:{}}));setShowFormations(false);}}
                style={{padding:"5px 11px",borderRadius:8,border:`1.5px solid ${activeLineup?.formation===f?C.accent:C.borderDark}`,background:activeLineup?.formation===f?C.accent:C.inputBg,color:activeLineup?.formation===f?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace"}}>
                {f}
              </button>
            ))}
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
            <div onClick={()=>{setShowAddPlayer(true);setShowSettings(false);}}
              style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.inputBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontSize:16}}>👥</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Gestionar plantilla</div>
                <div style={{fontSize:11,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{squad.length}/26 jugadores</div>
              </div>
              <span style={{color:C.textFaint,fontSize:16}}>›</span>
            </div>
          </div>
        )}

        {/* FIELD + BENCH */}
        <div style={{paddingTop:12,display:"flex",gap:14,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 250px"}}>
            <Field positions={positions} lineup={activeLineup} readOnly={false}
              onClickPos={(id,label)=>setPickModal({type:"starter",posId:id,posLabel:label})}
              onRemovePos={handleRemovePos}
              dragOverPos={dragOverPos} onDragOver={setDragOverPos} onDragLeave={()=>setDragOverPos(null)} onDrop={handleDrop}
              onDragStartPos={posId=>{dragFromPosId.current=posId;dragSubIdx.current=null;}}/>
          </div>
          <div style={{flex:"0 0 175px",minWidth:160}}>
            <Bench subs={activeLineup?.subs} readOnly={false}
              onClickSub={i=>setPickModal({type:"sub",subIdx:i,posLabel:`Suplente ${i+1}`})}
              onDragStart={i=>{dragSubIdx.current=i;dragFromPosId.current=null;}}/>
          </div>
        </div>
      </div>

      {showAddPlayer&&<AddPlayerModal currentCount={squad.length} onAdd={async p=>{await saveTeam({squad:[...squad,p]});setShowAddPlayer(false);}} onClose={()=>setShowAddPlayer(false)}/>}
      {pickModal&&<PickFromSquad squad={squad} posLabel={pickModal.posLabel} onPick={handlePick} onClose={()=>setPickModal(null)}
        usedIds={[...Object.values(activeLineup?.starters||{}).filter(Boolean).map(p=>p.id),...(activeLineup?.subs||[]).filter(Boolean).map(p=>p.id)]}/>}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null);
  const[isAdmin,setIsAdmin]=useState(false);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async u=>{
      setUser(u);
      if(u){
        const adminSnap=await getDoc(doc(db,"admins",u.uid));
        if(adminSnap.exists()){setIsAdmin(true);}
        else{
          const allAdmins=await getDocs(collection(db,"admins"));
          if(allAdmins.empty){await setDoc(doc(db,"admins",u.uid),{email:u.email,uid:u.uid,superAdmin:true});setIsAdmin(true);}
          else setIsAdmin(false);
        }
      }else setIsAdmin(false);
      setLoading(false);
    });
    return unsub;
  },[]);

  if(loading) return(
    <div style={{minHeight:"100vh",background:"#faf7f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:36,height:36,border:"3px solid #e8d9b5",borderTopColor:"#c49a2a",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}`}</style>
    </div>
  );

  if(!user) return <AuthScreen onAuth={u=>setUser(u)}/>;
  return <MainApp user={user} isAdmin={isAdmin} onLogout={()=>signOut(auth)}/>;
}
