import { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, deleteDoc } from "firebase/firestore";

// ─── COLORES ──────────────────────────────────────────────────────────────────
const C = {
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
function AddPlayerModal({onAdd,onClose,currentCount,pool,teamName,editPlayer,onSaveEdit}){
  const isEdit=!!editPlayer;
  const[tab,setTab]=useState(isEdit?"manual":"search");
  const[query,setQuery]=useState("");
  const[results,setResults]=useState(FC26_DB.slice(0,20));
  const[mName,setMName]=useState(editPlayer?.name||"");
  const[mPos,setMPos]=useState(editPlayer?.pos?.split("/")||[]);
  const[mCountry,setMCountry]=useState(editPlayer?.country||"");
  const[mAge,setMAge]=useState(editPlayer?.age||"");
  const[mOverall,setMOverall]=useState(editPlayer?.overall||"");
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
    const playerData={name:mName.trim(),pos:mPos.join("/"),primaryPos,secondaryPos:secondaryPos||null,country:mCountry.trim()||null,age:mAge?parseInt(mAge):null,overall:mOverall?parseInt(mOverall):null,poolKey};
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

  const available=squad.filter(p=>!usedIds?.includes(p.poolKey||p.id));
  const inPosition=posFilter?available.filter(p=>(p.pos?.split("/")||[]).includes(posFilter)||(p.primaryPos===posFilter)):available;
  const list=showAll?available.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase())||p.pos?.toLowerCase().includes(filter.toLowerCase())):inPosition.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase()));

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
            const playerAllPos=p.pos?.split("/")||[];
            const isOutOfPos=posFilter&&!playerAllPos.includes(posFilter)&&p.primaryPos!==posFilter;
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
                <span style={{fontSize:10,fontWeight:700,color:isOutOfPos?"#e67e22":C.accent,background:isOutOfPos?"rgba(230,126,34,0.1)":C.goldLight,padding:"3px 8px",borderRadius:6,fontFamily:"monospace",border:`1px solid ${isOutOfPos?"#e67e22":C.border}`}}>{p.primaryPos||p.pos?.split("/")?.[0]}</span>
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
            <div onClick={readOnly?undefined:e=>{e.stopPropagation();setShowMenu(v=>!v);}}>
              <Avatar name={player.name} size={50}/>
              {isDragOver&&<div style={{position:"absolute",inset:-2,borderRadius:"50%",border:`2px dashed ${C.accent}`,pointerEvents:"none"}}/>}
            </div>
            {showMenu&&!readOnly&&(
              <div style={{position:"absolute",top:"110%",left:"50%",transform:"translateX(-50%)",background:C.card,border:`1.5px solid ${C.accent}`,borderRadius:10,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:50,minWidth:120}}>
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
          <div style={{background:"rgba(26,20,8,0.78)",backdropFilter:"blur(4px)",borderRadius:7,padding:"3px 9px",textAlign:"center",maxWidth:84}}
            onClick={readOnly?undefined:e=>{e.stopPropagation();setShowMenu(v=>!v);}}>
            <div style={{color:"#fff",fontSize:9,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:0.3,fontFamily:"'Bebas Neue',sans-serif"}}>{player.name.split(" ").slice(-1)[0].toUpperCase()}</div>
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
function AdminTeamEditor({teamData,pool}){
  const[showAddPlayer,setShowAddPlayer]=useState(false);
  const[pickModal,setPickModal]=useState(null);
  const[saving,setSaving]=useState(false);
  const[localData,setLocalData]=useState(teamData);
  const[showReserves,setShowReserves]=useState(false);
  const[activeAdminLineupId,setActiveAdminLineupId]=useState(null);
  const[newLineupName,setNewLineupName]=useState("");
  const dragSubIdx=useRef(null);
  const[dragOverPos,setDragOverPos]=useState(null);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"teams",teamData.uid),snap=>{
      if(snap.exists()) setLocalData({uid:snap.id,...snap.data()});
    });
    return unsub;
  },[teamData.uid]);

  const save=async patch=>{setSaving(true);await updateDoc(doc(db,"teams",localData.uid),patch);setSaving(false);};
  const allLineups=localData.lineups||[{formation:"4-3-3",starters:{},subs:Array(7).fill(null)}];
  const lineup=allLineups.find(l=>l.id===activeAdminLineupId)||allLineups[0]||{formation:"4-3-3",starters:{},subs:Array(7).fill(null)};
  const squad=localData.squad||[];
  const positions=FORMATIONS[lineup.formation]||FORMATIONS["4-3-3"];

  const updateLineup=async fn=>{
    const nl=allLineups.map(l=>l.id===lineup.id?{...l,...fn(l)}:l);
    if(!nl.length) nl.push({id:"a",name:"Alineación A",formation:"4-3-3",starters:{},subs:Array(7).fill(null)});
    await save({lineups:nl});
  };

  const matchPlayer=(a,b)=>(a?.poolKey&&a?.poolKey===b?.poolKey)||(a?.id===b?.id);

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
        {/* Lineup selector + create */}
        {allLineups.map(l=>(
          <button key={l.id} onClick={()=>setActiveAdminLineupId(l.id)}
            style={{padding:"3px 9px",borderRadius:7,border:`1.5px solid ${lineup.id===l.id?C.accent:C.borderDark}`,background:lineup.id===l.id?C.accent:C.inputBg,color:lineup.id===l.id?"#fff":C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            {l.name}
          </button>
        ))}
        <input value={newLineupName} onChange={e=>setNewLineupName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAdminLineup()}
          placeholder="+ Nueva…"
          style={{padding:"3px 8px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.text,fontSize:10,outline:"none",fontFamily:"'DM Sans',sans-serif",width:80}}
          onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.borderDark}/>
        <button onClick={addAdminLineup} style={{padding:"3px 8px",borderRadius:7,background:C.accent,color:"#fff",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>+ Crear</button>
        <button onClick={()=>setShowReserves(true)}
          style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          Ver reservas
        </button>
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
            onRemovePos={async posId=>{await updateLineup(l=>{const s={...l.starters};delete s[posId];return{starters:s};});}}
            dragOverPos={dragOverPos} onDragOver={setDragOverPos} onDragLeave={()=>setDragOverPos(null)} onDrop={handleDrop}
            onDragStartPos={posId=>{dragSubIdx.current=null;setDragOverPos(null);handleDrop._fromPos=posId;}}/>
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
      {showAddPlayer&&<AddPlayerModal currentCount={squad.length} pool={pool} teamName={localData.teamName}
        onAdd={async p=>{
          await save({squad:[...squad,p]});
          // Add to pool
          if(p.poolKey){
            const poolRef=doc(db,"pool","players");
            const snap=await getDoc(poolRef);
            const current=snap.exists()?snap.data():{};
            await setDoc(poolRef,{...current,[p.poolKey]:{name:p.name,pos:p.pos,teamName:localData.teamName,teamUid:localData.uid}});
          }
          setShowAddPlayer(false);
        }} onClose={()=>setShowAddPlayer(false)}/>}
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
                const usedIds=[...Object.values(lineup.starters||{}).filter(Boolean).map(p=>p.poolKey||p.id),...(lineup.subs||[]).filter(Boolean).map(p=>p.poolKey||p.id)];
                const reserves=squad.filter(p=>!usedIds.includes(p.poolKey||p.id));
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
function MainApp({user,isAdmin,onLogout}){
  const[teamData,setTeamData]=useState(null);
  const[allTeams,setAllTeams]=useState([]);
  const[pool,setPool]=useState({});
  const[showPool,setShowPool]=useState(false);
  const[transferTeam,setTransferTeam]=useState(null);
  const[showCreateTeam,setShowCreateTeam]=useState(false);
  const[viewingTeam,setViewingTeam]=useState(null);
  const[activeLineupId,setActiveLineupId]=useState("a");
  const[showLineupPanel,setShowLineupPanel]=useState(false);
  const[showFormations,setShowFormations]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
  const[showSquadManager,setShowSquadManager]=useState(false);
  const[showSquadList,setShowSquadList]=useState(false);
  const[editingPlayer,setEditingPlayer]=useState(null);
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

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"pool","players"),snap=>{
      if(snap.exists()) setPool(snap.data());
      else setPool({});
    });
    return unsub;
  },[]);

  const saveTeam=async patch=>{setSaving(true);await updateDoc(doc(db,"teams",user.uid),patch);setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);};

  const addToPool=async(player,tName)=>{
    if(!player.poolKey) return;
    const poolRef=doc(db,"pool","players");
    const snap=await getDoc(poolRef);
    const current=snap.exists()?snap.data():{};
    await setDoc(poolRef,{...current,[player.poolKey]:{name:player.name,pos:player.pos,country:player.country||null,overall:player.overall||null,teamName:tName,teamUid:user.uid}});
  };

  const removeFromPool=async(player)=>{
    if(!player.poolKey) return;
    const poolRef=doc(db,"pool","players");
    const snap=await getDoc(poolRef);
    if(!snap.exists()) return;
    const current={...snap.data()};
    delete current[player.poolKey];
    await setDoc(poolRef,current);
  };

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

  const matchPlayer=(a,b)=>a&&b&&((a.poolKey&&a.poolKey===b.poolKey)||(a.id===b.id));

  const handlePick=async player=>{
    if(!pickModal) return;
    if(pickModal.type==="starter"){
      await updateActive(l=>{
        const newStarters={...l.starters};
        Object.keys(newStarters).forEach(k=>{if(matchPlayer(newStarters[k],player)) delete newStarters[k];});
        const newSubs=l.subs.map(s=>matchPlayer(s,player)?null:s);
        newStarters[pickModal.posId]=player;
        return{starters:newStarters,subs:newSubs};
      });
    } else {
      await updateActive(l=>{
        const newStarters={...l.starters};
        Object.keys(newStarters).forEach(k=>{if(matchPlayer(newStarters[k],player)) delete newStarters[k];});
        const newSubs=l.subs.map((s,i)=>i===pickModal.subIdx?player:(matchPlayer(s,player)?null:s));
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
        <img src="data:image/png;base64,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" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover"}}/>
        <h1 style={{fontSize:15,fontWeight:800,color:C.text,margin:0,letterSpacing:1,fontFamily:"'Bebas Neue',sans-serif"}}>{teamData.teamName}</h1>
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
          <button onClick={()=>setShowSquadList(v=>!v)}
            style={{padding:"5px 9px",borderRadius:8,border:`1.5px solid ${showSquadList?C.accent:C.borderDark}`,background:showSquadList?C.accent:C.inputBg,color:showSquadList?"#fff":C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            📋
          </button>
          <button onClick={onLogout} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:C.inputBg,color:C.textMid,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Salir</button>
        </div>
      </div>

      <div style={{width:"100%",maxWidth:1060,padding:"0 14px"}}>

        {/* ADMIN PANEL */}
        {isAdmin&&(
          <div style={{paddingTop:12}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif"}}>
                  Todos los equipos ({allTeams.length})
                </div>
                <button onClick={()=>setShowPool(true)} style={{marginLeft:"auto",padding:"5px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  🌍 Pool global
                </button>
                <button onClick={()=>setShowCreateTeam(true)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${C.accent}`,background:C.goldLight,color:C.accentDark,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  + Crear equipo
                </button>
              </div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {allTeams.filter(t=>t.uid!==user.uid).map(t=>(
                  <div key={t.id} style={{display:"flex",gap:4,alignItems:"center"}}>
                    <button onClick={()=>setViewingTeam(viewingTeam?.uid===t.uid?null:t)}
                      style={{padding:"6px 13px",borderRadius:9,border:`1.5px solid ${viewingTeam?.uid===t.uid?C.accent:C.borderDark}`,background:viewingTeam?.uid===t.uid?C.accent:C.inputBg,color:viewingTeam?.uid===t.uid?"#fff":C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
                      ⚽ {t.teamName}
                      <span style={{fontSize:9,color:viewingTeam?.uid===t.uid?"rgba(255,255,255,0.7)":C.textFaint}}>{(t.squad||[]).length} jug.</span>
                    </button>
                    <button onClick={()=>setTransferTeam(t)}
                      style={{padding:"5px 7px",borderRadius:7,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,fontSize:11,cursor:"pointer"}} title="Transferir equipo">
                      🔄
                    </button>
                  </div>
                ))}
                {allTeams.filter(t=>t.uid!==user.uid).length===0&&<span style={{fontSize:12,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>Aún no hay otros equipos registrados.</span>}
              </div>
            </div>
            {viewingTeam&&<AdminTeamEditor teamData={viewingTeam} pool={pool}/>}
          </div>
        )}

        {/* LINEUP PANEL */}
        {showLineupPanel&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:13,marginTop:10,boxShadow:`0 2px 12px rgba(196,154,42,0.06)`}}>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:9}}>
              {lineups.map(l=>(
                <div key={l.id} style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>{setActiveLineupId(l.id);setShowLineupPanel(false);}}
                    style={{flex:1,padding:"8px 13px",borderRadius:9,border:`1.5px solid ${activeLineupId===l.id?C.accent:C.borderDark}`,background:activeLineupId===l.id?C.accent:C.inputBg,color:activeLineupId===l.id?"#fff":C.textMid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
                    {l.name}
                  </button>
                  {/* Rename */}
                  <button onClick={()=>{
                    const newName=window.prompt("Nuevo nombre:",l.name);
                    if(newName&&newName.trim()){
                      const nl=lineups.map(x=>x.id===l.id?{...x,name:newName.trim()}:x);
                      saveTeam({lineups:nl});
                    }
                  }} style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${C.borderDark}`,background:C.inputBg,color:C.textMid,fontSize:12,cursor:"pointer"}}>✏️</button>
                  {/* Delete — only if more than 1 lineup */}
                  {lineups.length>1&&(
                    <button onClick={async()=>{
                      if(!window.confirm(`¿Borrar "${l.name}"?`)) return;
                      const nl=lineups.filter(x=>x.id!==l.id);
                      await saveTeam({lineups:nl});
                      if(activeLineupId===l.id) setActiveLineupId(nl[0].id);
                    }} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #ffcccc",background:"#fff5f5",color:"#c0392b",fontSize:12,cursor:"pointer"}}>🗑️</button>
                  )}
                </div>
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
            {/* Squad management */}
            <div style={{padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14}}>👥</span>
                <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Plantilla</div>
                <span style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{squad.length}/26</span>
                <button onClick={()=>setShowSquadManager(true)}
                  style={{marginLeft:"auto",padding:"6px 13px",background:C.accent,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Gestionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FIELD + BENCH + RESERVES — ocultar si admin está viendo otro equipo o si showSquadList */}
        {!viewingTeam&&!showSquadList&&<div style={{paddingTop:12,display:"flex",gap:14,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 260px",minWidth:240}}>
            <Field positions={positions} lineup={activeLineup} readOnly={false}
              onClickPos={(id,label)=>setPickModal({type:"starter",posId:id,posLabel:label})}
              onRemovePos={handleRemovePos}
              dragOverPos={dragOverPos} onDragOver={setDragOverPos} onDragLeave={()=>setDragOverPos(null)} onDrop={handleDrop}
              onDragStartPos={posId=>{dragFromPosId.current=posId;dragSubIdx.current=null;}}/>
          </div>
          <div style={{width:"100%",order:3}}>
            <Bench subs={activeLineup?.subs} readOnly={false}
              onClickSub={i=>{
                const sub=activeLineup?.subs?.[i];
                if(sub) setPickModal({type:"subMenu",subIdx:i,posLabel:`Suplente ${i+1}`,currentPlayer:sub});
                else setPickModal({type:"sub",subIdx:i,posLabel:`Suplente ${i+1}`});
              }}
              onDragStart={i=>{dragSubIdx.current=i;dragFromPosId.current=null;}}/>
          </div>
          {/* RESERVES */}
          {(()=>{
            const usedIds=[
              ...Object.values(activeLineup?.starters||{}).filter(Boolean).map(p=>p.poolKey||p.id),
              ...(activeLineup?.subs||[]).filter(Boolean).map(p=>p.poolKey||p.id)
            ];
            const reserves=squad.filter(p=>!usedIds.includes(p.poolKey||p.id));
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

      {showAddPlayer&&<AddPlayerModal currentCount={squad.length} pool={pool} teamName={teamData?.teamName}
        onAdd={async p=>{await saveTeam({squad:[...squad,p]});await addToPool(p,teamData?.teamName);setShowAddPlayer(false);}}
        onClose={()=>setShowAddPlayer(false)}/>}

      {editingPlayer&&<AddPlayerModal currentCount={squad.length} pool={pool} teamName={teamData?.teamName}
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

      {/* TRANSFER TEAM MODAL */}
      {transferTeam&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={()=>setTransferTeam(null)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:"100%",maxWidth:420,boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>TRANSFERIR EQUIPO</span>
              <button onClick={()=>setTransferTeam(null)} style={{marginLeft:"auto",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:"50%",width:28,height:28,color:C.textMid,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{padding:"16px 18px 20px"}}>
              <div style={{fontSize:12,color:C.textLight,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
                Equipo: <strong style={{color:C.text}}>{transferTeam.teamName}</strong><br/>
                Dueño actual: <strong style={{color:C.text}}>{transferTeam.email||"Sin dueño"}</strong>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:C.textLight,marginBottom:8,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Asignar a usuario registrado</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:250,overflowY:"auto",marginBottom:12}}>
                {allTeams.filter(t=>t.uid&&t.uid!==transferTeam.uid&&t.uid!==user.uid).map(t=>(
                  <div key={t.id} onClick={async()=>{
                    if(!window.confirm(`¿Transferir ${transferTeam.teamName} a ${t.teamName} (${t.email})?`)) return;
                    // Remove uid from old team
                    await updateDoc(doc(db,"teams",transferTeam.id||transferTeam.uid),{uid:"",email:""});
                    // Assign to new user — create new team doc with new uid
                    const newRef=doc(db,"teams",t.uid);
                    const newSnap=await getDoc(newRef);
                    if(!newSnap.exists()||newSnap.data().uid!==t.uid){
                      // Move team data to new uid doc
                      await setDoc(newRef,{...transferTeam,uid:t.uid,email:t.email,id:t.uid});
                    }
                    setTransferTeam(null);
                    alert(`✅ Equipo transferido a ${t.teamName}`);
                  }}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`,cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <Avatar name={t.teamName} size={32}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{t.teamName}</div>
                      <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{t.email}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={async()=>{
                if(!window.confirm(`¿Quitar dueño de ${transferTeam.teamName}? El equipo quedará disponible para nuevos usuarios.`)) return;
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
                await setDoc(doc(db,"teams",id),{uid:"",email:"",teamName:name,squad:[],lineups:[{id:"a",name:"Alineación A",formation:"4-3-3",starters:{},subs:Array(7).fill(null)}],createdAt:new Date().toISOString()});
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
            <div style={{overflowY:"auto",flex:1,padding:"10px 14px 16px",display:"flex",flexDirection:"column",gap:5}}>
              {Object.keys(pool).length===0&&<div style={{textAlign:"center",color:C.textFaint,fontSize:13,padding:"32px 0",fontFamily:"'DM Sans',sans-serif"}}>No hay jugadores en el pool todavía.</div>}
              {(()=>{
                const sorted=Object.entries(pool).sort((a,b)=>(a[1].teamName||"").localeCompare(b[1].teamName||"")||(a[1].name||"").localeCompare(b[1].name||""));
                let lastTeam=null;
                return sorted.map(([key,p])=>{
                  const showTeamHeader=p.teamName!==lastTeam;
                  lastTeam=p.teamName;
                  return(
                    <div key={key}>
                      {showTeamHeader&&<div style={{padding:"6px 0 4px",borderBottom:`1px solid ${C.border}`,marginBottom:4,marginTop:lastTeam?8:0}}>
                        <span style={{fontSize:11,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>⚽ {p.teamName}</span>
                      </div>}
                      <div style={{display:"flex",alignItems:"center",gap:10,padding:"7px 8px",borderRadius:9,background:C.inputBg,border:`1px solid ${C.border}`,marginBottom:4}}>
                        <Avatar name={p.name} size={30}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                          {(p.country||p.overall)&&<div style={{fontSize:9,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.country||""}{p.overall?` · ${p.overall}⭐`:""}</div>}
                        </div>
                        <span style={{fontSize:9,fontWeight:700,color:C.accent,background:C.goldLight,padding:"2px 7px",borderRadius:6,fontFamily:"monospace",border:`1px solid ${C.border}`}}>{p.pos}</span>
                        <button onClick={async e=>{
                          e.stopPropagation();
                          if(!window.confirm(`¿Eliminar a ${p.name} del pool? Esto lo liberará para otros equipos.`)) return;
                          const poolRef=doc(db,"pool","players");
                          const snap=await getDoc(poolRef);
                          if(snap.exists()){const d={...snap.data()};delete d[key];await setDoc(poolRef,d);}
                        }} style={{background:"#fff5f5",border:"1px solid #ffcccc",borderRadius:7,color:"#c0392b",cursor:"pointer",fontSize:11,padding:"4px 8px",flexShrink:0,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✕</button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

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
        const POS_ORDER=["GK","SW","CB","RB","LB","RWB","LWB","CDM","DM","CM","RM","LM","CAM","RAM","LAM","RW","LW","CF","ST"];
        const sorted=[...squad].sort((a,b)=>{
          const ai=POS_ORDER.indexOf(a.primaryPos||a.pos?.split("/")?.[0]);
          const bi=POS_ORDER.indexOf(b.primaryPos||b.pos?.split("/")?.[0]);
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
                const prevPos=i>0?(sorted[i-1].primaryPos||sorted[i-1].pos?.split("/")?.[0]):null;
                const currPos=p.primaryPos||p.pos?.split("/")?.[0];
                const showDivider=currPos!==prevPos;
                return(
                  <div key={p.id}>
                    {showDivider&&<div style={{padding:"6px 16px 4px",background:C.inputBg,borderBottom:`1px solid ${C.border}`,borderTop:i>0?`1px solid ${C.border}`:"none"}}>
                      <span style={{fontSize:10,fontWeight:800,color:C.accent,fontFamily:"monospace",letterSpacing:1}}>{currPos}</span>
                    </div>}
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:`1px solid ${C.border}`}}>
                      <Avatar name={p.name} size={36}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                        <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>
                          {p.team||"—"}
                          {p.secondaryPos&&<span style={{color:C.textFaint}}> · {p.secondaryPos}</span>}
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
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:10,background:C.inputBg,border:`1px solid ${C.border}`}}>
                  <Avatar name={p.name} size={36}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{p.name}</div>
                    <div style={{fontSize:10,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{p.country||"—"} · <span style={{fontFamily:"monospace",color:C.accent,fontWeight:700}}>{p.primaryPos||p.pos?.split("/")?.[0]}</span>{p.age?` · ${p.age}a`:""}{p.overall?` · ${p.overall}⭐`:""}</div>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    {!p.poolKey?.startsWith("fc26_")&&(
                      <button onClick={e=>{e.stopPropagation();setEditingPlayer(p);setShowSquadManager(false);}}
                        style={{background:C.goldLight,border:`1px solid ${C.borderDark}`,borderRadius:8,color:C.textMid,cursor:"pointer",fontSize:13,padding:"6px 10px",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>✏️</button>
                    )}
                    <button onClick={async e=>{
                      e.stopPropagation();
                      const ns=squad.filter(s=>s.id!==p.id);
                      await saveTeam({squad:ns});
                      await removeFromPool(p);
                    }} style={{background:"#fff5f5",border:"1px solid #ffcccc",borderRadius:8,color:"#c0392b",cursor:"pointer",fontSize:13,padding:"6px 10px",flexShrink:0,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✕</button>
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
    await setDoc(ref,{uid:user.uid,email:user.email,teamName:newTeamName.trim(),squad:[],lineups:[{id:"a",name:"Alineación A",formation:"4-3-3",starters:{},subs:Array(7).fill(null)}],createdAt:new Date().toISOString()});
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

  const checkUserState=async(u)=>{
    if(!u){setUser(null);setIsAdmin(false);setHasTeam(false);setLoading(false);return;}
    setUser(u);
    // Check admin
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
    // Check if user has a team assigned
    const teamSnap=await getDoc(doc(db,"teams",u.uid));
    if(teamSnap.exists()&&teamSnap.data().uid===u.uid){
      setHasTeam(true);
    } else {
      // Also check if any team has this uid
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

  if(!user) return <AuthScreen onAuth={u=>checkUserState(u)}/>;
  if(!hasTeam&&!isAdmin) return <TeamSelectionScreen user={user} onDone={()=>setHasTeam(true)}/>;
  return <MainApp user={user} isAdmin={isAdmin} onLogout={()=>signOut(auth)}/>;
}
