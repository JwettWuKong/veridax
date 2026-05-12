import { useState, useEffect, useRef } from "react";

const C = {
  soil:"#04050a", earth:"#07080e", bark:"#0d0e18", wood:"#111220",
  canopy:"#0e1518", card:"#0f1018", border:"#1a1b2e", shadow:"#181828",
  amber:"#e8a830", amberD:"#e8a83014", sun:"#f5d060", sunD:"#f5d06010",
  copper:"#c87941", vine:"#3a7a28", vineD:"#3a7a2810",
  sprout:"#72c44a", sproutD:"#72c44a0e", sky:"#5aabaa", skyD:"#5aabaa10",
  bloom:"#c85a45", parch:"#e0d8c0", tan:"#a09070", dust:"#585040",
};

const INITIAL_POSTS = [
  { id:"p1", cat:"Project Save Humanity", icon:"💧", color:"#f5d060", flagship:true,
    title:"Open-Source Desalination Unit: $40/Family, 48hr Deploy",
    summary:"Modular solar-powered desalination for disaster zones. Full schematics, BOM, and deployment protocol. Field-tested on 3 continents.",
    author:"Dr. Amara Osei", field:"Humanitarian Engineering", verified:true, substack:false,
    up:18203, cite:341, tokenData:{sym:"H2OPEN", supply:5400, col:"#f5d060", change:18.4, commission:8} },
  { id:"p2", cat:"Artificial Intelligence", icon:"⚙", color:"#5aabaa",
    title:"Bias Detection Framework for LLM Governance",
    summary:"Open standard for auditing AI systems for systemic bias and corporate capture. Community-run audit protocol included.",
    author:"Prof. Yuki Tanaka", field:"AI Ethics", verified:true, substack:true,
    up:12401, cite:289, tokenData:{sym:"AISAFE", supply:3900, col:"#e8a830", change:7.1, commission:5} },
  { id:"p3", cat:"Medicine", icon:"🌿", color:"#88d068",
    title:"mRNA Reprogramming for Cellular Senescence Reversal",
    summary:"3-year independent study: modified mRNA vectors reduce inflammatory markers in aged tissue by 40%. No pharma funding. All data open.",
    author:"Dr. Fatima Al-Rashid", field:"Molecular Biology", verified:true, substack:true,
    up:21890, cite:512, tokenData:{sym:"LONGEVX", supply:7400, col:"#88d068", change:31.2, commission:8} },
  { id:"p4", cat:"Climate Science", icon:"🌦", color:"#72c44a",
    title:"Biochar Distributed Grid: Scalable Carbon Sequestration",
    summary:"Protocol for distributed biochar production. 10-12x more efficient per hectare than reforestation. Tested in 14 communities.",
    author:"Marcus Velde", field:"Climate Systems", verified:true, substack:false,
    up:9840, cite:198, tokenData:{sym:"BIOCARB", supply:3100, col:"#72c44a", change:12.8, commission:7.5} },
  { id:"p5", cat:"Neuroscience", icon:"🍄", color:"#d0a068",
    title:"Psychedelic-Assisted PTSD Treatment: Open-Source Protocol",
    summary:"Peer-reviewed protocol for psilocybin-assisted PTSD therapy. Tested across 847 veterans — 76% remission rate at 12 months. No pharma funding. All data open.",
    author:"Dr. Kenji Morales", field:"Clinical Neuroscience", verified:true, substack:false,
    up:14820, cite:267 },
  { id:"p6", cat:"Engineering", icon:"📡", color:"#5aabaa",
    title:"Decentralized Mesh Internet Protocol",
    summary:"Open-source protocol for building censorship-resistant mesh networks. Deployed in 12 countries. 340,000+ nodes active. No central authority.",
    author:"Dr. Priya Nair", field:"Network Engineering", verified:true, substack:false,
    up:15430, cite:298, tokenData:{sym:"MESHNET", supply:6400, col:"#5aabaa", change:22.6, commission:5.5} },
  { id:"p7", cat:"Physics", icon:"⚛", color:"#c87941",
    title:"Quantum Error Correction: Universal Framework",
    summary:"A universal framework for fault-tolerant quantum computation. Open-source implementation across 3 hardware platforms. No government or defense funding.",
    author:"Dr. Kai Lindström", field:"Quantum Computing", verified:true, substack:false,
    up:32100, cite:687, tokenData:{sym:"QUANTM", supply:9600, col:"#c87941", change:44.1, commission:5.5} },
];

const CATS = [
  {id:"psh",name:"Project Save Humanity",icon:"🌍",color:"#f5d060",flagship:true},
  {id:"med",name:"Medicine",icon:"🌿",color:"#88d068"},
  {id:"ai",name:"Artificial Intelligence",icon:"⚙",color:"#5aabaa"},
  {id:"clim",name:"Climate Science",icon:"🌦",color:"#72c44a"},
  {id:"eng",name:"Engineering",icon:"🔩",color:"#c87941"},
  {id:"phys",name:"Physics",icon:"⚛",color:"#5aabaa"},
  {id:"phil",name:"Philosophy",icon:"🪴",color:"#a09070"},
  {id:"agri",name:"Agriculture",icon:"🌾",color:"#a0c860"},
  {id:"edu",name:"Education",icon:"📜",color:"#a09070"},
  {id:"econ",name:"Economics",icon:"⚖",color:"#c87941"},
  {id:"energy",name:"Energy",icon:"☀",color:"#e8a830"},
  {id:"space",name:"Space Exploration",icon:"🌒",color:"#8090d0"},
  {id:"cyber",name:"Cybersecurity",icon:"🔐",color:"#c85a45"},
  {id:"neuro",name:"Neuroscience",icon:"🍄",color:"#d0a068"},
  {id:"psych",name:"Psychology",icon:"🧠",color:"#c090c0"},
  {id:"soc",name:"Social Innovation",icon:"🤝",color:"#5aabaa"},
  {id:"law",name:"Law & Governance",icon:"🏛",color:"#e8a830"},
  {id:"bio",name:"Biology",icon:"🦋",color:"#72c44a"},
  {id:"ethics",name:"Ethics",icon:"🌱",color:"#3a7a28"},
  {id:"robo",name:"Robotics",icon:"🦾",color:"#5aabaa"},
];

const nf = n => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:`${n}`;

const INITIAL_VOTES = {
  p1: { scientific:1240, civil:890,  independent:1500, tech:670,  grassroots:430, academic:980,  journalism:340, legal:210 },
  p2: { scientific:680,  civil:420,  independent:980,  tech:1840, grassroots:210, academic:560,  journalism:290, legal:140 },
  p3: { scientific:2100, civil:580,  independent:1200, tech:890,  grassroots:340, academic:1760, journalism:420, legal:310 },
  p4: { scientific:280,  civil:320,  independent:240,  tech:170,  grassroots:295, academic:220,  journalism:130, legal:85  },
  p5: { scientific:780,  civil:560,  independent:940,  tech:420,  grassroots:610, academic:880,  journalism:380, legal:330 },
  p6: { scientific:680,  civil:540,  independent:820,  tech:1240, grassroots:380, academic:590,  journalism:420, legal:310 },
  p7: { scientific:1890, civil:420,  independent:680,  tech:1540, grassroots:210, academic:1680, journalism:310, legal:280 },
};
const INITIAL_DISPUTES = {
  p1: { scientific:45,  civil:120, independent:200, tech:30,  grassroots:80,  academic:15,  journalism:60,  legal:25  },
  p2: { scientific:28,  civil:65,  independent:140, tech:90,  grassroots:30,  academic:42,  journalism:110, legal:35  },
  p3: { scientific:85,  civil:210, independent:310, tech:120, grassroots:90,  academic:45,  journalism:180, legal:70  },
  p4: { scientific:40,  civil:58,  independent:80,  tech:28,  grassroots:45,  academic:36,  journalism:18,  legal:12  },
  p5: { scientific:40,  civil:85,  independent:120, tech:55,  grassroots:70,  academic:30,  journalism:90,  legal:45  },
  p6: { scientific:22,  civil:45,  independent:80,  tech:60,  grassroots:18,  academic:30,  journalism:55,  legal:20  },
  p7: { scientific:60,  civil:165, independent:200, tech:100, grassroots:40,  academic:75,  journalism:130, legal:70  },
};

function shannonDiversity(counts) {
  const vals = Object.values(counts);
  const total = vals.reduce((s,v) => s+v, 0);
  if (total === 0) return 0;
  const H = vals.filter(v => v > 0).reduce((s,v) => { const p = v/total; return s - p * Math.log2(p); }, 0);
  return H / Math.log2(8);
}

function calcTrustScore(ups, disps) {
  const totalUp = Object.values(ups).reduce((s,v) => s+v, 0);
  const totalDisp = Object.values(disps).reduce((s,v) => s+v, 0);
  const total = totalUp + totalDisp;
  if (total === 0) return 0;
  return 0.65 * (totalUp / total) + 0.35 * shannonDiversity(ups);
}

const TOKEN_GATES = { upvotes:10000, citations:200, validations:2500, diversity:0.72, trustScore:0.88 };

function checkGates(post, votes, disputes) {
  const trust      = calcTrustScore(votes, disputes);
  const diversity  = shannonDiversity(votes);
  const validCount = Object.values(votes).reduce((s, v) => s + v, 0);
  const items = [
    { key:"upvotes",     label:"UPVOTES",                    val:post.up,    req:TOKEN_GATES.upvotes,     fmt:v => nf(v) },
    { key:"citations",   label:"PEER CITATIONS",             val:post.cite,  req:TOKEN_GATES.citations,   fmt:v => v.toLocaleString() },
    { key:"validations", label:"CROSS-CLUSTER VALIDATIONS",  val:validCount, req:TOKEN_GATES.validations, fmt:v => nf(v) },
    { key:"diversity",   label:"DIVERSITY INDEX",            val:diversity,  req:TOKEN_GATES.diversity,   fmt:v => `${(v*100).toFixed(1)}%` },
    { key:"trustScore",  label:"TRUST SCORE",                val:trust,      req:TOKEN_GATES.trustScore,  fmt:v => `${(v*100).toFixed(1)}%` },
  ];
  const metCount = items.filter(g => g.val >= g.req).length;
  return { items, metCount, allMet: metCount === 5 };
}

function bondingPrice(supply) {
  return 0.001 * Math.pow(Math.max(supply, 0), 1.38);
}

function bondingCost(s1, s2) {
  return (0.001 / 2.38) * (Math.pow(s2, 2.38) - Math.pow(s1, 2.38));
}

const COMMISSION_RATES = {
  "Project Save Humanity": 8,
  "Medicine":              8,
  "Neuroscience":          7,
  "Biology":               7,
  "Climate Science":       7.5,
  "Energy":                6.5,
  "Agriculture":           6,
  "Engineering":           5.5,
  "Physics":               5.5,
  "Robotics":              5.5,
  "Artificial Intelligence": 5,
  "Space Exploration":     5,
  "Cybersecurity":         5,
  "Economics":             4,
  "Social Innovation":     4,
  "Psychology":            4,
  "Law & Governance":      3.5,
  "Philosophy":            2.5,
  "Education":             2.5,
  "Ethics":                2.5,
};

function commissionRate(cat) {
  return COMMISSION_RATES[cat] ?? 5;
}

function Ticker({ tokens }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0;
    const id = setInterval(() => {
      x -= 0.5;
      if (x < -el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(${x}px)`;
    }, 16);
    return () => clearInterval(id);
  }, []);
  const items = [...tokens, ...tokens];
  return (
    <div style={{overflow:"hidden",background:C.wood,borderBottom:`1px solid ${C.shadow}`,padding:"7px 0"}}>
      <div ref={ref} style={{display:"flex",gap:44,whiteSpace:"nowrap",willChange:"transform"}}>
        {items.map((t, i) => (
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:"monospace",fontSize:10}}>
            <span style={{color:t.col,fontWeight:700}}>⬡ {t.sym}</span>
            <span style={{color:C.tan}}>${t.price.toFixed(2)}</span>
            <span style={{color:t.ch>0?C.sprout:C.bloom}}>{t.ch>0?"+":""}{t.ch}%</span>
            <span style={{color:C.dust}}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function NetCanvas({ h = 130 }) {
  const ref = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const colors = [C.amber, C.sprout, C.copper, C.sky, "#88d068"];
    const nodes = Array.from({ length: 26 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: Math.random() * 2 + 1.2, phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const pulses = [];
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (Math.random() < .018) {
        const n = nodes[Math.floor(Math.random() * nodes.length)];
        pulses.push({ x: n.x, y: n.y, r: 0, a: .4, col: n.color });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 1.3; p.a -= .007;
        if (p.a <= 0) { pulses.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = p.col + Math.floor(Math.max(0, p.a) * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = .7; ctx.stroke();
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(200,160,80,${(1 - d / 100) * .1})`; ctx.lineWidth = .5; ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.phase += .025;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
        g.addColorStop(0, n.color + "2a"); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color; ctx.globalAlpha = .55 + Math.sin(n.phase) * .4; ctx.fill(); ctx.globalAlpha = 1;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);
  return <canvas ref={ref} width={880} height={h} style={{width:"100%",height:h,borderRadius:12,display:"block"}}/>;
}

function PostCard({ post, user, votes, disputes, onValidate, onTokenize }) {
  const [hov, setHov] = useState(false);
  const score = votes && disputes ? calcTrustScore(votes, disputes) : null;
  const scoreColor = score === null ? C.amber : score >= 0.8 ? C.sprout : score >= 0.6 ? C.amber : C.bloom;
  const gateInfo = votes && disputes ? checkGates(post, votes, disputes) : null;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{background:`linear-gradient(160deg,${C.card},${C.earth})`,border:`1px solid ${hov ? post.color + "55" : C.border}`,borderRadius:16,overflow:"hidden",cursor:"pointer",transition:"border-color .3s,transform .22s,box-shadow .3s",transform:hov?"translateY(-3px)":"none",boxShadow:hov?`0 14px 40px ${post.color}12`:"none"}}>
      <div style={{height:2,background:`linear-gradient(90deg,${post.color}88,${post.color}22,transparent)`}}/>
      <div style={{padding:"17px 19px"}}>
        {post.flagship && (
          <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#f5d06010",border:"1px solid #f5d06040",borderRadius:20,padding:"2px 9px",marginBottom:8,fontSize:7,fontFamily:"monospace",color:"#f5d060",letterSpacing:2}}>
            ★ SAVE HUMANITY
          </div>
        )}
        <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:17}}>{post.icon}</span>
          <span style={{fontSize:8,fontFamily:"monospace",color:post.color,letterSpacing:2}}>{post.cat.toUpperCase()}</span>
          {post.substack && (
            <span style={{fontSize:7,color:C.amber,background:C.amberD,border:`1px solid ${C.amber}30`,padding:"1px 6px",borderRadius:20,fontFamily:"monospace",marginLeft:"auto"}}>
              📰 SUBSTACK
            </span>
          )}
        </div>
        <h3 style={{margin:"0 0 9px",color:C.parch,fontFamily:"'Palatino Linotype',serif",fontSize:14,lineHeight:1.45,fontWeight:700}}>{post.title}</h3>
        <p style={{margin:"0 0 12px",color:C.dust,fontSize:11,lineHeight:1.7,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.summary}</p>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:C.wood,borderRadius:7,marginBottom:10,border:`1px solid ${C.shadow}`}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:`${post.color}22`,border:`1px solid ${post.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:post.color,fontWeight:700,flexShrink:0}}>
            {post.author[0]}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:10,color:C.tan,fontFamily:"monospace",fontWeight:700}}>{post.author}</span>
              {post.verified && <span style={{fontSize:6,color:C.sprout,background:C.sproutD,padding:"1px 4px",borderRadius:10}}>✓</span>}
            </div>
            <span style={{fontSize:9,color:C.dust}}>{post.field}</span>
          </div>
        </div>
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <div style={{display:"flex",gap:10}}>
              <span style={{fontSize:9,fontFamily:"monospace",color:C.sprout}}>▲ {nf(post.up)}</span>
              <span style={{fontSize:9,fontFamily:"monospace",color:C.sky}}>◎ {post.cite}</span>
            </div>
            {score !== null && (
              <span key={Math.round(score*1000)} style={{fontSize:8,fontFamily:"monospace",color:scoreColor,fontWeight:700,animation:"numtick .25s ease"}}>
                TRUST {(score*100).toFixed(0)}%
              </span>
            )}
          </div>
          {score !== null && (
            <div style={{height:3,background:C.shadow,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${score*100}%`,background:`linear-gradient(90deg,${C.sky},${scoreColor})`,borderRadius:2,transition:"width .6s ease"}}/>
            </div>
          )}
        </div>
        {gateInfo && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",background:gateInfo.allMet?`${C.amber}0a`:C.wood,border:`1px solid ${gateInfo.allMet?C.amber+"33":C.shadow}`,borderRadius:7,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:7,fontFamily:"monospace",color:gateInfo.allMet?C.amber:C.dust,letterSpacing:.5}}>TOKEN GATE</span>
              <div style={{display:"flex",gap:2}}>
                {gateInfo.items.map(g => (
                  <div key={g.key} style={{width:5,height:5,borderRadius:"50%",background:g.val>=g.req?C.sprout:C.shadow,boxShadow:g.val>=g.req?`0 0 4px ${C.sprout}88`:undefined}}/>
                ))}
              </div>
              <span style={{fontSize:7,fontFamily:"monospace",color:gateInfo.allMet?C.amber:C.dust}}>{gateInfo.metCount}/5</span>
            </div>
            {gateInfo.allMet && post.tokenData && <span style={{fontSize:7,fontFamily:"monospace",color:C.sprout}}>✓ TOKENIZED</span>}
            {gateInfo.allMet && !post.tokenData && user && onTokenize && (
              <button onClick={e=>{e.stopPropagation();onTokenize(post);}}
                style={{background:`${C.amber}18`,border:`1px solid ${C.amber}44`,color:C.amber,borderRadius:5,padding:"2px 7px",fontSize:7,fontFamily:"monospace",cursor:"pointer",letterSpacing:1}}>
                ★ VOTE
              </button>
            )}
          </div>
        )}
        {post.tokenData && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",background:`${post.tokenData.col}0a`,border:`1px solid ${post.tokenData.col}22`,borderRadius:7}}>
            <span style={{fontSize:11,fontFamily:"monospace",color:post.tokenData.col,fontWeight:700}}>⬡ {post.tokenData.sym}</span>
            <span style={{fontSize:11,color:C.parch,fontFamily:"monospace"}}>${bondingPrice(post.tokenData.supply).toFixed(2)}</span>
            <span style={{fontSize:9,color:C.sprout,fontFamily:"monospace"}}>+{post.tokenData.change}%</span>
          </div>
        )}
        {user && votes && onValidate && (
          <button
            onClick={e => { e.stopPropagation(); onValidate(post); }}
            style={{width:"100%",marginTop:9,background:`${C.sky}0a`,border:`1px solid ${C.sky}33`,color:C.sky,borderRadius:7,padding:"7px",fontFamily:"monospace",fontSize:8,cursor:"pointer",letterSpacing:2,transition:"all .2s"}}
            onMouseEnter={e => { e.currentTarget.style.background=`${C.sky}18`; e.currentTarget.style.borderColor=`${C.sky}55`; }}
            onMouseLeave={e => { e.currentTarget.style.background=`${C.sky}0a`; e.currentTarget.style.borderColor=`${C.sky}33`; }}>
            ◈ VALIDATE THIS POST
          </button>
        )}
      </div>
    </div>
  );
}

function DonateSection() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(null);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState(false);
  const [hov, setHov] = useState(false);
  const final = amount || parseFloat(custom) || 0;

  const handleGive = async () => {
    if (!final) return;
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); setAmount(null); setCustom(""); }, 3000);
  };

  if (!open) {
    return (
      <div style={{textAlign:"center",padding:"30px 24px 34px"}}>
        <p style={{fontSize:11,color:C.dust,fontFamily:"monospace",maxWidth:340,margin:"0 auto 12px",lineHeight:1.8}}>
          This platform is built by one person who believes the world can be better. If it moved you, a small contribution goes directly back into keeping it alive and free.
        </p>
        <button
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          onClick={() => setOpen(true)}
          style={{background:"transparent",border:`1px solid ${hov ? C.amber + "55" : C.dust + "33"}`,color:hov?C.amber:C.dust,borderRadius:30,padding:"8px 22px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,transition:"all .3s",display:"inline-flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:13,opacity:hov?1:.5,transition:"opacity .3s"}}>🌱</span>
          support this work
        </button>
        <p style={{fontSize:8,color:"#1e1828",fontFamily:"monospace",letterSpacing:1,marginTop:8}}>
          entirely optional · no pressure · thank you either way
        </p>
      </div>
    );
  }

  return (
    <div style={{padding:"24px",display:"flex",justifyContent:"center"}}>
      <div style={{background:`linear-gradient(160deg,${C.bark},${C.earth})`,border:`1px solid ${C.amber}30`,borderRadius:18,padding:"26px",maxWidth:390,width:"100%",position:"relative",boxShadow:`0 0 40px ${C.amber}08`}}>
        <button onClick={() => setOpen(false)}
          style={{position:"absolute",top:14,right:14,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10}}>
          ✕
        </button>
        {!done ? (
          <>
            <div style={{marginBottom:18,paddingRight:36}}>
              <div style={{fontSize:22,marginBottom:8}}>🌍</div>
              <h3 style={{fontFamily:"'Palatino Linotype',serif",fontSize:17,color:C.parch,fontWeight:700,margin:"0 0 7px"}}>Thank you for being here.</h3>
              <p style={{fontSize:11,color:C.dust,lineHeight:1.8,margin:0}}>Every dollar goes back into hosting, development, and keeping this platform free, open, and independent. Nothing more.</p>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:11}}>
              {[5, 10, 20, 50].map(n => (
                <button key={n} onClick={() => { setAmount(n); setCustom(""); }}
                  style={{flex:1,background:amount===n?`${C.amber}22`:C.wood,border:`1px solid ${amount===n?C.amber:C.shadow}`,color:amount===n?C.amber:C.dust,borderRadius:9,padding:"9px 0",fontFamily:"monospace",fontSize:12,cursor:"pointer",transition:"all .2s",fontWeight:amount===n?"700":"400"}}>
                  ${n}
                </button>
              ))}
            </div>
            <div style={{position:"relative",marginBottom:14}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.dust,fontFamily:"monospace",fontSize:13}}>$</span>
              <input type="number" min="1" placeholder="other amount" value={custom}
                onChange={e => { setCustom(e.target.value); setAmount(null); }}
                style={{width:"100%",background:C.wood,border:`1px solid ${custom ? C.amber + "44" : C.shadow}`,borderRadius:9,padding:"10px 14px 10px 26px",color:C.parch,fontFamily:"monospace",fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
            </div>
            <div style={{background:C.sproutD,border:`1px solid ${C.sprout}20`,borderRadius:9,padding:"10px 14px",marginBottom:14,fontSize:10,fontFamily:"monospace",color:C.dust,lineHeight:1.9}}>
              <div style={{color:C.sprout,marginBottom:2,letterSpacing:1}}>100% goes toward:</div>
              {["Node infrastructure & hosting","Security audits & improvements","Open-source development","Keeping VERIDAX free for everyone"].map(s => (
                <div key={s} style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:C.sprout}}>✦</span>{s}</div>
              ))}
            </div>
            <button onClick={handleGive} disabled={!final}
              style={{width:"100%",background:final?`linear-gradient(135deg,${C.amber}22,${C.copper}12)`:"transparent",border:`1px solid ${final ? C.amber + "55" : C.shadow}`,color:final?C.amber:C.dust,borderRadius:11,padding:"12px",fontFamily:"monospace",fontSize:11,cursor:final?"pointer":"not-allowed",letterSpacing:2,transition:"all .2s"}}>
              {final ? `contribute $${final} →` : "choose an amount"}
            </button>
            <p style={{fontSize:8,color:"#1e1828",fontFamily:"monospace",marginTop:10,letterSpacing:1,textAlign:"center"}}>no account required · no recurring charges · one-time only</p>
          </>
        ) : (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:36,marginBottom:12,display:"inline-block",animation:"sway 1.5s ease-in-out infinite"}}>🌱</div>
            <h3 style={{fontFamily:"'Palatino Linotype',serif",fontSize:18,color:C.parch,marginBottom:8}}>Growing.</h3>
            <p style={{fontSize:12,color:C.dust,lineHeight:1.7}}>Your contribution is planting something real.<br/>Thank you — genuinely.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CLUSTERS = [
  { id:"scientific",  label:"Scientific",    icon:"⚗", desc:"Researchers, scientists, peer-reviewed" },
  { id:"civil",       label:"Civil Society", icon:"🤝", desc:"NGOs, activists, community orgs" },
  { id:"independent", label:"Independent",   icon:"🌐", desc:"Unaffiliated truth-seekers" },
  { id:"tech",        label:"Tech",          icon:"⚙", desc:"Engineers, developers, builders" },
  { id:"grassroots",  label:"Grassroots",    icon:"🌱", desc:"Local communities, ground-level" },
  { id:"academic",    label:"Academic",      icon:"📜", desc:"Universities, institutional research" },
  { id:"journalism",  label:"Journalism",    icon:"📰", desc:"Journalists, investigative reporters" },
  { id:"legal",       label:"Legal",         icon:"⚖", desc:"Lawyers, policy experts, governance" },
];

const CRED_TYPES = ["Academic Degree","Published Paper (DOI)","Patent","Certification","Institutional Affiliation","Project Portfolio"];

function JoinModal({ onClose, onJoin, onSwitchToLogin, accounts }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pohMethod, setPohMethod] = useState(null);
  const [pohVerifying, setPohVerifying] = useState(false);
  const [pohDone, setPohDone] = useState(false);
  const [cluster, setCluster] = useState("");
  const [field, setField] = useState("");
  const [credType, setCredType] = useState("Academic Degree");
  const [credValue, setCredValue] = useState("");
  const [creds, setCreds] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!pohVerifying) return;
    const t = setTimeout(() => { setPohVerifying(false); setPohDone(true); }, 2400);
    return () => clearTimeout(t);
  }, [pohVerifying]);

  const inputStyle = (valid, hasError) => ({
    width:"100%", background:C.wood,
    border:`1px solid ${hasError ? C.bloom+"88" : valid ? C.sprout+"44" : C.shadow}`,
    borderRadius:8, padding:"10px 13px", color:C.parch, fontSize:12, fontFamily:"monospace",
    outline:"none", boxSizing:"border-box", transition:"border-color .2s",
  });

  const FieldError = ({ msg }) => msg ? (
    <div style={{fontSize:9,fontFamily:"monospace",color:C.bloom,marginTop:4,marginBottom:8}}>✕ {msg}</div>
  ) : <div style={{marginBottom:10}}/>;

  const pwStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const pwColors = ["transparent", C.bloom, C.amber, C.sprout];
  const pwLabels = ["", "Weak", "Good", "Strong"];

  const validateStep1 = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = "Letters, numbers, and underscores only.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    else if (accounts.some(a => a.email === email.trim())) e.email = "An account with this email already exists.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!confirmPw) e.confirmPw = "Please confirm your password.";
    else if (password !== confirmPw) e.confirmPw = "Passwords do not match.";
    return e;
  };

  const handleStep1 = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleStep3 = () => {
    if (!cluster) { setErrors({ cluster: "Please select a cluster." }); return; }
    setErrors({});
    setStep(4);
  };

  const addCred = () => {
    if (!credValue.trim()) return;
    setCreds(prev => [...prev, { type: credType, value: credValue.trim() }]);
    setCredValue("");
  };

  const handleFinish = () => {
    const profile = {
      username: username.trim(), email: email.trim(), password,
      cluster, field: field.trim() || cluster,
      pohMethod, credentials: creds,
      joined: new Date().toLocaleDateString("en-US", { month:"short", year:"numeric" }),
    };
    onJoin(profile);
    setStep(5);
  };

  const Steps = () => (
    <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:20}}>
      {[1,2,3,4,5].map(n => (
        <div key={n} style={{display:"flex",alignItems:"center",gap:3}}>
          <div style={{width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontFamily:"monospace",fontWeight:700,
            background: step>n ? C.sprout : step===n ? C.amber : "transparent",
            border:`1px solid ${step>n ? C.sprout : step===n ? C.amber : C.shadow}`,
            color: step>=n ? C.bark : C.dust,
          }}>{step>n?"✓":n}</div>
          {n<5 && <div style={{width:12,height:1,background:step>n?C.sprout:C.shadow}}/>}
        </div>
      ))}
      <span style={{fontSize:7,fontFamily:"monospace",color:C.dust,marginLeft:6}}>
        {step===1?"ACCOUNT":step===2?"PROOF OF HUMANITY":step===3?"CLUSTER":step===4?"CREDENTIALS":"COMPLETE"}
      </span>
    </div>
  );

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000cc",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.amber}44`,borderRadius:20,padding:28,maxWidth:430,width:"100%",position:"relative",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${C.amber},${C.vine})`,borderRadius:2,marginBottom:18}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10,zIndex:1}}>✕</button>

        <Steps/>

        {/* STEP 1 — Account */}
        {step === 1 && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Create your account</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.7,marginBottom:18}}>Join a network of experts, researchers, journalists, scientists, and truth-seekers publishing freely — without gatekeepers, censorship, or corporate interference.</p>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>USERNAME</label>
            <input value={username} onChange={e => { setUsername(e.target.value); setErrors(v=>({...v,username:""})); }}
              placeholder="Letters, numbers, underscores"
              style={inputStyle(username.trim(), errors.username)}/>
            <FieldError msg={errors.username}/>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>EMAIL</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(v=>({...v,email:""})); }}
              placeholder="you@example.com"
              style={inputStyle(email.includes("@") && email.includes("."), errors.email)}/>
            <FieldError msg={errors.email}/>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>PASSWORD</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={password}
                onChange={e => { setPassword(e.target.value); setErrors(v=>({...v,password:""})); }}
                placeholder="Min. 8 characters"
                style={{...inputStyle(password.length>=8, errors.password), paddingRight:50}}/>
              <button onClick={() => setShowPw(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.dust,cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>{showPw?"HIDE":"SHOW"}</button>
            </div>
            {password.length > 0 && (
              <div style={{display:"flex",gap:3,marginTop:6,marginBottom:4}}>
                {[1,2,3].map(i => <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=pwStrength?pwColors[pwStrength]:C.shadow}}/>)}
                <span style={{fontSize:8,fontFamily:"monospace",color:pwColors[pwStrength],marginLeft:6,minWidth:40}}>{pwLabels[pwStrength]}</span>
              </div>
            )}
            <FieldError msg={errors.password}/>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>CONFIRM PASSWORD</label>
            <div style={{position:"relative"}}>
              <input type={showConfirm?"text":"password"} value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setErrors(v=>({...v,confirmPw:""})); }}
                onKeyDown={e => { if(e.key==="Enter") handleStep1(); }}
                placeholder="Repeat your password"
                style={{...inputStyle(confirmPw && confirmPw===password, errors.confirmPw), paddingRight:50}}/>
              <button onClick={() => setShowConfirm(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.dust,cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>{showConfirm?"HIDE":"SHOW"}</button>
            </div>
            <FieldError msg={errors.confirmPw}/>

            <button onClick={handleStep1}
              style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,transition:"all .2s",marginBottom:14}}>
              CONTINUE →
            </button>
            <div style={{textAlign:"center",fontSize:9,fontFamily:"monospace",color:C.dust}}>
              Already have an account?{" "}
              <span onClick={() => { onClose(); onSwitchToLogin(); }} style={{color:C.amber,cursor:"pointer",textDecoration:"underline"}}>Sign in →</span>
            </div>
          </>
        )}

        {/* STEP 2 — Proof of Humanity */}
        {step === 2 && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Prove you're human</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:18}}>
              Zero-knowledge verification proves you are a unique, real human being — <span style={{color:C.parch}}>without revealing who you are.</span> One person, one identity. No bots. No duplicate accounts.
            </p>

            {!pohDone ? (
              pohVerifying ? (
                <div style={{textAlign:"center",padding:"28px 0"}}>
                  <div style={{fontSize:38,marginBottom:12,animation:"pulse 1s infinite"}}>{pohMethod==="worldid"?"🌐":"🛡"}</div>
                  <div style={{fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:6}}>VERIFYING…</div>
                  <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:16}}>Generating zero-knowledge proof</div>
                  <div style={{height:2,background:C.shadow,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:"100%",background:`linear-gradient(90deg,${C.amber},${C.vine})`,animation:"fadein 2.4s linear forwards"}}/>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                    {[{id:"worldid",icon:"🌐",name:"World ID",sub:"via Worldcoin",desc:"Biometric orb verification. Proves you are a unique human globally — no data stored on VERIDAX."},
                      {id:"gitcoin",icon:"🛡",name:"Gitcoin Passport",sub:"via Gitcoin",desc:"Social graph verification. Aggregates on-chain trust signals from multiple web3 sources."}].map(m => (
                      <button key={m.id} onClick={() => { setPohMethod(m.id); setPohVerifying(true); }}
                        style={{background:C.wood,border:`1px solid ${C.shadow}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",transition:"all .2s",display:"flex",gap:14,alignItems:"center"}}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=`${C.sky}55`; e.currentTarget.style.background=`${C.sky}0a`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor=C.shadow; e.currentTarget.style.background=C.wood; }}>
                        <span style={{fontSize:26,flexShrink:0}}>{m.icon}</span>
                        <div>
                          <div style={{fontSize:10,fontFamily:"monospace",color:C.sky,letterSpacing:1,marginBottom:2}}>{m.name}</div>
                          <div style={{fontSize:10,color:C.dust,lineHeight:1.65,marginBottom:3}}>{m.desc}</div>
                          <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,opacity:.55}}>{m.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:9,padding:"10px 13px",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
                    <span style={{color:C.sprout}}>✦</span> Your cryptographic proof is recorded on-chain. VERIDAX never stores biometric data — only the proof of uniqueness.
                  </div>
                </>
              )
            ) : (
              <div style={{textAlign:"center",padding:"8px 0"}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:C.sproutD,border:`2px solid ${C.sprout}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 14px",color:C.sprout,fontWeight:700}}>✓</div>
                <div style={{fontSize:11,fontFamily:"monospace",color:C.sprout,letterSpacing:2,marginBottom:8}}>HUMANITY VERIFIED</div>
                <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:20}}>
                  Your zero-knowledge proof has been recorded on-chain. You are recognized as a unique real human on this network.
                </p>
                <button onClick={() => setStep(3)}
                  style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
                  CONTINUE →
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 3 — Cluster */}
        {step === 3 && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Your perspective cluster</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:16}}>
              Select one lens that best describes your background. This is not a rigid identity — it lets the system track <span style={{color:C.parch}}>who is agreeing with what</span> across diverse networks so no single group can dominate consensus.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
              {CLUSTERS.map(cl => (
                <button key={cl.id} onClick={() => { setCluster(cl.id); setErrors({}); }}
                  style={{background:cluster===cl.id?`${C.amber}18`:C.wood,border:`1px solid ${cluster===cl.id?C.amber+"55":C.shadow}`,borderRadius:10,padding:"11px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <span style={{fontSize:13}}>{cl.icon}</span>
                    <span style={{fontSize:9,fontFamily:"monospace",color:cluster===cl.id?C.amber:C.tan,letterSpacing:.5,flex:1}}>{cl.label}</span>
                    {cluster===cl.id && <span style={{fontSize:9,color:C.amber}}>✓</span>}
                  </div>
                  <div style={{fontSize:8,color:C.dust,lineHeight:1.5}}>{cl.desc}</div>
                </button>
              ))}
            </div>
            <FieldError msg={errors.cluster}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setStep(2)} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>← BACK</button>
              <button onClick={handleStep3} style={{flex:2,background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>CONTINUE →</button>
            </div>
          </>
        )}

        {/* STEP 4 — Expert Credentials (optional) */}
        {step === 4 && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,margin:0}}>Expert credentials</h2>
              <span style={{fontSize:7,fontFamily:"monospace",color:C.dust,background:C.wood,border:`1px solid ${C.shadow}`,borderRadius:20,padding:"2px 8px",letterSpacing:1,flexShrink:0}}>OPTIONAL</span>
            </div>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:14}}>
              Credentials are cryptographically verified by the issuing institution's public key — you cannot fake a Harvard PhD without Harvard's private key. False submissions result in a permanent wallet ban and retroactive removal of all past validations.
            </p>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>PRIMARY FIELD / DISCIPLINE</label>
            <input value={field} onChange={e => setField(e.target.value)}
              placeholder="e.g. Molecular Biology, Investigative Journalism…"
              style={{...inputStyle(field.trim(), false), marginBottom:14}}/>

            <div style={{fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:7}}>ADD CREDENTIAL</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {CRED_TYPES.map(t => (
                <button key={t} onClick={() => setCredType(t)}
                  style={{background:credType===t?`${C.sky}18`:C.wood,border:`1px solid ${credType===t?C.sky+"55":C.shadow}`,color:credType===t?C.sky:C.dust,borderRadius:20,padding:"3px 9px",fontSize:7,fontFamily:"monospace",cursor:"pointer",transition:"all .2s"}}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <input value={credValue} onChange={e => setCredValue(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter") addCred(); }}
                placeholder={credType==="Published Paper (DOI)"?"10.1234/doi":credType==="Patent"?"US10,123,456":"Identifier or URL"}
                style={{flex:1,background:C.wood,border:`1px solid ${C.shadow}`,borderRadius:8,padding:"9px 12px",color:C.parch,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
              <button onClick={addCred} disabled={!credValue.trim()}
                style={{background:credValue?`${C.sky}18`:"transparent",border:`1px solid ${credValue?C.sky+"55":C.shadow}`,color:credValue?C.sky:C.dust,borderRadius:8,padding:"9px 14px",fontFamily:"monospace",fontSize:9,cursor:credValue?"pointer":"not-allowed",letterSpacing:1,flexShrink:0}}>
                ADD
              </button>
            </div>

            {creds.length > 0 && (
              <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:9,padding:"10px 13px",marginBottom:10}}>
                {creds.map((c, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",borderBottom:i<creds.length-1?`1px solid ${C.shadow}`:undefined}}>
                    <span style={{fontSize:7,fontFamily:"monospace",color:C.sky,minWidth:100,flexShrink:0}}>{c.type}</span>
                    <span style={{fontSize:9,fontFamily:"monospace",color:C.dust,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.value}</span>
                    <button onClick={() => setCreds(p => p.filter((_,j) => j!==i))} style={{background:"transparent",border:"none",color:C.dust,cursor:"pointer",fontSize:11,padding:"0 2px",flexShrink:0}}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{background:C.amberD,border:`1px solid ${C.amber}25`,borderRadius:9,padding:"9px 13px",marginBottom:16,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.amber}}>⬡</span> Credentials are signed by the issuing institution. They cannot be forged. Fraudulent submissions result in a permanent ban.
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setStep(3)} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>← BACK</button>
              <button onClick={handleFinish}
                style={{flex:2,background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:9,cursor:"pointer",letterSpacing:1}}>
                {creds.length || field.trim() ? "SUBMIT →" : "SKIP FOR NOW →"}
              </button>
            </div>
          </>
        )}

        {/* STEP 5 — Done */}
        {step === 5 && (
          <div style={{textAlign:"center",padding:"10px 0 6px"}}>
            <div style={{fontSize:44,marginBottom:14}}>🌱</div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:21,color:C.parch,marginBottom:8}}>Welcome, {username}.</h2>
            <p style={{color:C.dust,fontSize:12,lineHeight:1.8,marginBottom:16}}>You are now a verified node on the VERIDAX network. Your proof of humanity is recorded on-chain.</p>
            <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1,textAlign:"left"}}>
              <div style={{color:C.tan,marginBottom:4,letterSpacing:1}}>IDENTITY SUMMARY</div>
              <div>⬡ <span style={{color:C.tan}}>@</span>{username}</div>
              <div>⬡ <span style={{color:C.tan}}>Cluster:</span> {CLUSTERS.find(c=>c.id===cluster)?.icon} {CLUSTERS.find(c=>c.id===cluster)?.label}</div>
              {field && <div>⬡ <span style={{color:C.tan}}>Field:</span> {field}</div>}
              <div>⬡ <span style={{color:C.tan}}>Proof of Humanity:</span> <span style={{color:C.sprout}}>✓ {pohMethod==="worldid"?"World ID":"Gitcoin Passport"}</span></div>
              {creds.length > 0 && <div>⬡ <span style={{color:C.tan}}>Credentials:</span> {creds.length} submitted for review</div>}
            </div>
            <button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              ENTER VERIDAX →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubModal({ onClose }) {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [previewed, setPreviewed] = useState(false);
  const [selected, setSelected] = useState([0, 1]);
  const MOCK = [
    { title:"Three Patents That Could End Energy Poverty — And Why You've Never Heard of Them", date:"Apr 2025", reads:12034 },
    { title:"My Year Documenting Water Contamination in Rural Communities", date:"Mar 2025", reads:7890 },
    { title:"The Hidden Costs of Industrial Agriculture Nobody Talks About", date:"Feb 2025", reads:4821 },
  ];
  const doFetch = async () => {
    if (!url.trim()) return;
    setFetching(true);
    await new Promise(r => setTimeout(r, 1800));
    setFetching(false);
    setPreviewed(true);
  };
  const toggle = i => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.amber}44`,borderRadius:20,padding:26,maxWidth:480,width:"100%",maxHeight:"88vh",overflowY:"auto",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10,zIndex:1}}>✕</button>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{fontSize:24}}>📰</span>
          <div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:17,color:C.parch,margin:0}}>Import from Substack</h2>
            <p style={{margin:0,fontSize:9,fontFamily:"monospace",color:C.dust}}>Preserve your research permanently on the chain.</p>
          </div>
        </div>
        {!previewed ? (
          <>
            <div style={{background:C.canopy,border:`1px solid ${C.shadow}`,borderRadius:9,padding:"11px 13px",marginBottom:14,fontSize:10,fontFamily:"monospace",color:C.tan,lineHeight:1.8}}>
              Your Substack stays live. This creates an <span style={{color:C.amber}}>immutable backup</span> across 19,000+ nodes. No corporation or government can erase it.
            </div>
            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>YOUR SUBSTACK URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="yourname.substack.com"
              style={{width:"100%",background:C.wood,border:`1px solid ${C.shadow}`,borderRadius:8,padding:"10px 13px",color:C.parch,fontSize:13,fontFamily:"monospace",outline:"none",boxSizing:"border-box",marginBottom:14,transition:"border-color .2s"}}/>
            <button onClick={doFetch} disabled={!url.trim() || fetching}
              style={{width:"100%",background:url?`${C.amber}18`:"transparent",border:`1px solid ${url ? C.amber + "44" : C.shadow}`,color:url?C.amber:C.dust,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:url?"pointer":"not-allowed",letterSpacing:2}}>
              {fetching ? "FETCHING POSTS…" : "FETCH & PREVIEW POSTS →"}
            </button>
          </>
        ) : (
          <>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:10}}>SELECT POSTS TO IMPORT</div>
            {MOCK.map((p, i) => (
              <div key={i} onClick={() => toggle(i)}
                style={{background:selected.includes(i)?`${C.amber}0f`:C.bark,border:`1px solid ${selected.includes(i)?C.amber+"55":C.shadow}`,borderRadius:10,padding:"12px",marginBottom:8,cursor:"pointer",transition:"all .2s"}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${selected.includes(i)?C.amber:C.dust}`,background:selected.includes(i)?C.amber:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                    {selected.includes(i) && <span style={{fontSize:9,color:C.bark,fontWeight:700}}>✓</span>}
                  </div>
                  <div>
                    <div style={{fontSize:12,fontFamily:"'Palatino Linotype',serif",color:C.parch,lineHeight:1.4,marginBottom:4}}>{p.title}</div>
                    <div style={{fontSize:9,fontFamily:"monospace",color:C.dust}}>{p.date} · {p.reads.toLocaleString()} reads</div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={onClose}
              style={{width:"100%",marginTop:8,background:`${C.sprout}18`,border:`1px solid ${C.sprout}44`,color:C.sprout,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              PUBLISH {selected.length} POST{selected.length !== 1 ? "S" : ""} TO CHAIN →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function LoginModal({ onClose, onLogin, onSwitchToJoin, accounts }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inputStyle = (valid) => ({
    width:"100%", background:C.wood,
    border:`1px solid ${error ? C.bloom+"55" : valid ? C.sprout+"44" : C.shadow}`,
    borderRadius:8, padding:"10px 13px", color:C.parch, fontSize:12, fontFamily:"monospace",
    outline:"none", boxSizing:"border-box", transition:"border-color .2s",
  });

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    const match = accounts.find(a => a.email === email.trim() && a.password === password);
    if (!match) {
      setError(accounts.some(a => a.email === email.trim()) ? "Incorrect password." : "No account found with that email.");
      return;
    }
    onLogin(match);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000cc",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.amber}44`,borderRadius:20,padding:28,maxWidth:400,width:"100%",position:"relative"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${C.amber},${C.vine})`,borderRadius:2,marginBottom:18}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10,zIndex:1}}>✕</button>
        <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Welcome back.</h2>
        <p style={{color:C.dust,fontSize:11,lineHeight:1.7,marginBottom:20}}>Sign in to your VERIDAX account.</p>

        <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>EMAIL</label>
        <input type="email" value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => { if(e.key==="Enter") handleLogin(); }}
          placeholder="you@example.com"
          style={{...inputStyle(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)), marginBottom:14}}/>

        <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>PASSWORD</label>
        <div style={{position:"relative",marginBottom:18}}>
          <input type={showPw?"text":"password"} value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => { if(e.key==="Enter") handleLogin(); }}
            placeholder="Your password"
            style={{...inputStyle(password.length>0), paddingRight:50}}/>
          <button onClick={() => setShowPw(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.dust,cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>
            {showPw?"HIDE":"SHOW"}
          </button>
        </div>

        {error && (
          <div style={{background:`${C.bloom}12`,border:`1px solid ${C.bloom}44`,borderRadius:8,padding:"9px 13px",marginBottom:14,fontSize:10,fontFamily:"monospace",color:C.bloom}}>
            ✕ {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,marginBottom:14,transition:"all .2s"}}>
          {loading ? "SIGNING IN…" : "SIGN IN →"}
        </button>
        <div style={{textAlign:"center",fontSize:9,fontFamily:"monospace",color:C.dust}}>
          No account?{" "}
          <span onClick={() => { onClose(); onSwitchToJoin(); }} style={{color:C.amber,cursor:"pointer",textDecoration:"underline"}}>Create one →</span>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ user, onClose, onLogout }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000cc",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.amber}44`,borderRadius:20,padding:28,maxWidth:400,width:"100%",position:"relative"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${C.amber},${C.vine})`,borderRadius:2,marginBottom:20}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10}}>✕</button>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${C.amber}33,${C.vine}22)`,border:`2px solid ${C.amber}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:C.amber,fontWeight:700,flexShrink:0}}>
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <div style={{fontSize:16,fontFamily:"'Palatino Linotype',serif",color:C.parch,fontWeight:700}}>@{user.username}</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:2}}>Member</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.dust}}>{user.field}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[{l:"POSTS",v:"0"},{l:"VALIDATED",v:"0"},{l:"TOKENS",v:"0"}].map(({l,v}) => (
            <div key={l} style={{background:C.wood,border:`1px solid ${C.shadow}`,borderRadius:8,padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:15,fontFamily:"monospace",fontWeight:700,color:C.amber}}>{v}</div>
              <div style={{fontSize:6,fontFamily:"monospace",color:C.dust,letterSpacing:1,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:9,padding:"11px 14px",marginBottom:16,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2}}>
          <div>⬡ <span style={{color:C.tan}}>Email:</span> {user.email}</div>
          {user.field && <div>⬡ <span style={{color:C.tan}}>Field:</span> {user.field}</div>}
          {user.cluster && <div>⬡ <span style={{color:C.tan}}>Cluster:</span> {CLUSTERS.find(c=>c.id===user.cluster)?.icon} {CLUSTERS.find(c=>c.id===user.cluster)?.label}</div>}
          {user.pohMethod && <div>⬡ <span style={{color:C.tan}}>Proof of Humanity:</span> <span style={{color:C.sprout}}>✓ {user.pohMethod==="worldid"?"World ID":"Gitcoin Passport"}</span></div>}
          {user.credentials?.length > 0 && <div>⬡ <span style={{color:C.tan}}>Credentials:</span> {user.credentials.length} on-chain</div>}
          <div>⬡ <span style={{color:C.tan}}>Member since:</span> {user.joined}</div>
        </div>
        <button onClick={() => { onLogout(); onClose(); }}
          style={{width:"100%",background:"transparent",border:`1px solid ${C.bloom}44`,color:C.bloom,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,transition:"all .2s"}}>
          LOG OUT
        </button>
      </div>
    </div>
  );
}

const EVIDENCE_TYPES = ["DOI Reference","IPFS Hash","Archived Page","External Source"];

function PublishModal({ user, onClose, onPublish }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [body, setBody] = useState("");
  const [evidenceType, setEvidenceType] = useState("DOI Reference");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceLinks, setEvidenceLinks] = useState([]);
  const [signing, setSigning] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!signing) return;
    const t = setTimeout(() => {
      setSigning(false);
      const h = "0x" + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      setTxHash(h);
      setStep(4);
      if (onPublish) onPublish({
        id: `pub_${Date.now()}`,
        cat: category,
        icon: CATS.find(c => c.name === category)?.icon || "📄",
        color: CATS.find(c => c.name === category)?.color || C.amber,
        title,
        summary: body.slice(0, 200) + (body.length > 200 ? "…" : ""),
        author: user.username,
        field: user.field || user.cluster,
        verified: !!user.pohMethod,
        substack: false,
        up: 1,
        cite: 0,
      });
    }, 2800);
    return () => clearTimeout(t);
  }, [signing]);

  const inputStyle = {
    width:"100%", background:C.wood, border:`1px solid ${C.shadow}`,
    borderRadius:8, padding:"10px 13px", color:C.parch, fontSize:12, fontFamily:"monospace",
    outline:"none", boxSizing:"border-box", transition:"border-color .2s",
  };

  const FieldError = ({ msg }) => msg ? (
    <div style={{fontSize:9,fontFamily:"monospace",color:C.bloom,marginTop:4,marginBottom:8}}>✕ {msg}</div>
  ) : <div style={{marginBottom:10}}/>;

  const addEvidence = () => {
    if (!evidenceUrl.trim()) return;
    setEvidenceLinks(prev => [...prev, { type: evidenceType, url: evidenceUrl.trim() }]);
    setEvidenceUrl("");
  };

  const handleStep1 = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!category) e.category = "Please select a category.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleStep2 = () => {
    if (body.trim().length < 80) { setErrors({ body: "Content must be at least 80 characters." }); return; }
    setErrors({});
    setStep(3);
  };

  const filteredCats = catSearch.trim()
    ? CATS.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    : CATS;

  const walletAddr = "0x" + (user.username + "veridax").split("").map(c => c.charCodeAt(0).toString(16)).join("").padEnd(40,"0").slice(0,40);

  const Steps = () => (
    <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:20}}>
      {[1,2,3,4].map(n => (
        <div key={n} style={{display:"flex",alignItems:"center",gap:3}}>
          <div style={{width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontFamily:"monospace",fontWeight:700,
            background: step>n ? C.sprout : step===n ? C.amber : "transparent",
            border:`1px solid ${step>n ? C.sprout : step===n ? C.amber : C.shadow}`,
            color: step>=n ? C.bark : C.dust,
          }}>{step>n?"✓":n}</div>
          {n<4 && <div style={{width:14,height:1,background:step>n?C.sprout:C.shadow}}/>}
        </div>
      ))}
      <span style={{fontSize:7,fontFamily:"monospace",color:C.dust,marginLeft:6}}>
        {step===1?"METADATA":step===2?"CONTENT":step===3?"REVIEW & SIGN":"PUBLISHED"}
      </span>
    </div>
  );

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000cc",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.amber}44`,borderRadius:20,padding:28,maxWidth:520,width:"100%",position:"relative",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${C.amber},${C.vine})`,borderRadius:2,marginBottom:18}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10,zIndex:1}}>✕</button>

        <Steps/>

        {/* STEP 1 — Metadata */}
        {step === 1 && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Publish to VERIDAX</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:18}}>
              Once submitted, this post is <span style={{color:C.parch}}>permanent and immutable</span>. It cannot be edited or deleted. Immutability is what makes suppression impossible.
            </p>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>TITLE</label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErrors(v=>({...v,title:""})); }}
              placeholder="A clear, specific title for your discovery or information"
              style={{...inputStyle, border:`1px solid ${errors.title ? C.bloom+"88" : title.trim() ? C.sprout+"44" : C.shadow}`}}/>
            <FieldError msg={errors.title}/>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>CATEGORY</label>
            <input value={catSearch} onChange={e => { setCatSearch(e.target.value); setErrors(v=>({...v,category:""})); }}
              placeholder="Search 90+ domains…"
              style={{...inputStyle, border:`1px solid ${errors.category ? C.bloom+"88" : C.shadow}`, marginBottom:8}}/>
            <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:5,marginBottom:4,padding:"2px 0"}}>
              {filteredCats.map(c => (
                <button key={c.id} onClick={() => { setCategory(c.name); setCatSearch(c.name); setErrors(v=>({...v,category:""})); }}
                  style={{background:category===c.name?`${c.color}22`:C.wood,border:`1px solid ${category===c.name?c.color+"55":C.shadow}`,color:category===c.name?c.color:C.dust,borderRadius:20,padding:"3px 10px",fontSize:8,fontFamily:"monospace",cursor:"pointer",transition:"all .15s",whiteSpace:"nowrap"}}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            <FieldError msg={errors.category}/>

            <button onClick={handleStep1}
              style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,marginTop:6}}>
              CONTINUE →
            </button>
          </>
        )}

        {/* STEP 2 — Content + Evidence */}
        {step === 2 && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Content & evidence</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:16}}>
              Write the full content of your discovery or information. Attach evidence links — IPFS hashes, DOI references, archived pages, or any external source.
            </p>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>FULL CONTENT</label>
            <textarea value={body} onChange={e => { setBody(e.target.value); setErrors({}); }}
              placeholder="Write your full discovery, report, or information here. Be thorough — this record is permanent."
              rows={9}
              style={{...inputStyle, resize:"vertical", lineHeight:1.7, border:`1px solid ${errors.body ? C.bloom+"88" : body.trim().length>=80 ? C.sprout+"44" : C.shadow}`}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <FieldError msg={errors.body}/>
              <span style={{fontSize:8,fontFamily:"monospace",color:body.trim().length>=80?C.sprout:C.dust,marginLeft:"auto"}}>{body.trim().length} chars</span>
            </div>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:7}}>EVIDENCE LINKS</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {EVIDENCE_TYPES.map(t => (
                <button key={t} onClick={() => setEvidenceType(t)}
                  style={{background:evidenceType===t?`${C.sky}18`:C.wood,border:`1px solid ${evidenceType===t?C.sky+"55":C.shadow}`,color:evidenceType===t?C.sky:C.dust,borderRadius:20,padding:"3px 9px",fontSize:7,fontFamily:"monospace",cursor:"pointer",transition:"all .2s"}}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <input value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter") addEvidence(); }}
                placeholder={evidenceType==="DOI Reference"?"10.1038/example.doi":evidenceType==="IPFS Hash"?"ipfs://QmHash…":evidenceType==="Archived Page"?"https://web.archive.org/…":"https://source-url.com"}
                style={{flex:1, background:C.wood, border:`1px solid ${C.shadow}`, borderRadius:8, padding:"9px 12px", color:C.parch, fontSize:10, fontFamily:"monospace", outline:"none"}}/>
              <button onClick={addEvidence} disabled={!evidenceUrl.trim()}
                style={{background:evidenceUrl?`${C.sky}18`:"transparent",border:`1px solid ${evidenceUrl?C.sky+"55":C.shadow}`,color:evidenceUrl?C.sky:C.dust,borderRadius:8,padding:"9px 14px",fontFamily:"monospace",fontSize:9,cursor:evidenceUrl?"pointer":"not-allowed",letterSpacing:1,flexShrink:0}}>
                ADD
              </button>
            </div>

            {evidenceLinks.length > 0 && (
              <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:9,padding:"10px 13px",marginBottom:12}}>
                {evidenceLinks.map((e, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",borderBottom:i<evidenceLinks.length-1?`1px solid ${C.shadow}`:undefined}}>
                    <span style={{fontSize:7,fontFamily:"monospace",color:C.sky,minWidth:90,flexShrink:0}}>{e.type}</span>
                    <span style={{fontSize:9,fontFamily:"monospace",color:C.dust,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.url}</span>
                    <button onClick={() => setEvidenceLinks(p=>p.filter((_,j)=>j!==i))} style={{background:"transparent",border:"none",color:C.dust,cursor:"pointer",fontSize:11,padding:"0 2px",flexShrink:0}}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:"flex",gap:8,marginTop:6}}>
              <button onClick={() => setStep(1)} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>← BACK</button>
              <button onClick={handleStep2} style={{flex:2,background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>REVIEW →</button>
            </div>
          </>
        )}

        {/* STEP 3 — Review & Sign */}
        {step === 3 && !signing && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Review & sign</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:16}}>
              Your wallet address will be cryptographically signed to this post — permanently establishing who published what and when. This creates an immutable record of intellectual priority.
            </p>

            <div style={{background:C.card,border:`1px solid ${C.shadow}`,borderRadius:12,padding:"16px",marginBottom:12}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:8}}>POST PREVIEW</div>
              <div style={{fontSize:13,fontFamily:"'Palatino Linotype',serif",color:C.parch,marginBottom:6,fontWeight:700,lineHeight:1.4}}>{title}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${CATS.find(c=>c.name===category)?.color||C.amber}14`,border:`1px solid ${CATS.find(c=>c.name===category)?.color||C.amber}33`,borderRadius:20,padding:"2px 9px",marginBottom:10}}>
                <span style={{fontSize:9}}>{CATS.find(c=>c.name===category)?.icon}</span>
                <span style={{fontSize:7,fontFamily:"monospace",color:CATS.find(c=>c.name===category)?.color||C.amber,letterSpacing:1}}>{category.toUpperCase()}</span>
              </div>
              <p style={{fontSize:10,color:C.dust,lineHeight:1.7,marginBottom:10,display:"-webkit-box",WebkitLineClamp:4,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{body}</p>
              {evidenceLinks.length > 0 && (
                <div style={{fontSize:8,fontFamily:"monospace",color:C.sky}}>{evidenceLinks.length} evidence link{evidenceLinks.length>1?"s":""} attached</div>
              )}
            </div>

            <div style={{background:C.wood,border:`1px solid ${C.shadow}`,borderRadius:10,padding:"12px 14px",marginBottom:12,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2}}>
              <div style={{color:C.tan,marginBottom:4,letterSpacing:1,fontSize:7}}>SIGNING AS</div>
              <div>⬡ <span style={{color:C.tan}}>Author:</span> @{user.username}</div>
              <div>⬡ <span style={{color:C.tan}}>Cluster:</span> {CLUSTERS.find(c=>c.id===user.cluster)?.label || "—"}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span>⬡ <span style={{color:C.tan}}>Wallet:</span></span>
                <span style={{color:C.amber,fontSize:8}}>{walletAddr.slice(0,10)}…{walletAddr.slice(-6)}</span>
              </div>
              {user.pohMethod && <div>⬡ <span style={{color:C.tan}}>Humanity proof:</span> <span style={{color:C.sprout}}>✓ on-chain</span></div>}
            </div>

            <div style={{background:`${C.bloom}0c`,border:`1px solid ${C.bloom}33`,borderRadius:9,padding:"10px 13px",marginBottom:16,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.bloom}}>⬡</span> Once submitted, this post <span style={{color:C.parch}}>cannot be edited or deleted</span>. This is not a limitation — it is the protection. If you later believe you made an error, submit a new block addressing it. The original record remains permanent.
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setStep(2)} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>← BACK</button>
              <button onClick={() => setSigning(true)} style={{flex:2,background:`linear-gradient(135deg,${C.amber}28,${C.vine}18)`,border:`1px solid ${C.amber}66`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,fontWeight:700}}>SIGN & PUBLISH →</button>
            </div>
          </>
        )}

        {/* Signing overlay */}
        {step === 3 && signing && (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:38,marginBottom:14,animation:"pulse 1s infinite"}}>⛓</div>
            <div style={{fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:6}}>SIGNING & BROADCASTING…</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:18}}>Cryptographically signing to your wallet · broadcasting to 19,203 nodes</div>
            <div style={{height:2,background:C.shadow,borderRadius:2,overflow:"hidden",maxWidth:300,margin:"0 auto"}}>
              <div style={{height:"100%",width:"100%",background:`linear-gradient(90deg,${C.amber},${C.vine})`,animation:"fadein 2.8s linear forwards"}}/>
            </div>
          </div>
        )}

        {/* STEP 4 — On-chain confirmation */}
        {step === 4 && (
          <div style={{textAlign:"center",padding:"6px 0"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:C.sproutD,border:`2px solid ${C.sprout}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px",color:C.sprout,fontWeight:700}}>✓</div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:21,color:C.parch,marginBottom:8}}>Published to the chain.</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:20}}>Your post is now permanently recorded across 19,203 nodes worldwide. It cannot be edited, deleted, or suppressed — by anyone.</p>

            <div style={{background:C.card,border:`1px solid ${C.sprout}28`,borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"left",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1}}>
              <div style={{color:C.tan,marginBottom:4,letterSpacing:1,fontSize:7}}>ON-CHAIN RECORD</div>
              <div>⬡ <span style={{color:C.tan}}>Post:</span> {title.slice(0,48)}{title.length>48?"…":""}</div>
              <div>⬡ <span style={{color:C.tan}}>Author:</span> @{user.username} · {walletAddr.slice(0,10)}…</div>
              <div>⬡ <span style={{color:C.tan}}>Tx hash:</span> <span style={{color:C.amber,fontSize:8}}>{txHash.slice(0,22)}…</span></div>
              <div>⬡ <span style={{color:C.tan}}>Block:</span> #{(89403 + Math.floor(Math.random()*10)).toLocaleString()}</div>
              <div>⬡ <span style={{color:C.tan}}>Nodes confirmed:</span> <span style={{color:C.sprout}}>19,203</span></div>
              {evidenceLinks.length > 0 && <div>⬡ <span style={{color:C.tan}}>Evidence:</span> {evidenceLinks.length} link{evidenceLinks.length>1?"s":""} on-chain</div>}
            </div>

            <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:9,padding:"10px 13px",marginBottom:18,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8,textAlign:"left"}}>
              <span style={{color:C.sprout}}>✦</span> The record is immutable. The intellectual priority timestamp is permanently established. No corporation, government, or court order can change what was published here and when.
            </div>

            <button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              BACK TO VERIDAX →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TokenizeModal({ post, votes, disputes, user, onClose, onTokenized }) {
  const [yesVotes, setYesVotes] = useState(1316);
  const [noVotes,  setNoVotes]  = useState(684);
  const [voted, setVoted] = useState(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { items: gateItems, allMet } = checkGates(post, votes, disputes);
  const total = yesVotes + noVotes;
  const yesPct = total === 0 ? 0 : yesVotes / total;
  const passed = yesPct >= 0.66;

  const handleVote = type => {
    if (voted || !user) return;
    if (type === "yes") { setYesVotes(y => y + 1); } else { setNoVotes(n => n + 1); }
    setVoted(type);
    if (type === "yes") {
      setTimeout(() => { setCreating(true); }, 600);
      setTimeout(() => { setCreating(false); setCreated(true); if (onTokenized) onTokenized(post.id, suggestedSymbol); }, 3400);
    }
  };

  const suggestedSymbol = post.title.split(" ").slice(0,2).map(w => w[0]).join("") + "X";

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000d0",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.amber}44`,borderRadius:20,padding:28,maxWidth:500,width:"100%",position:"relative",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${C.amber},${C.copper})`,borderRadius:2,marginBottom:18}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10}}>✕</button>

        {created ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:14,animation:"sway 2s ease-in-out infinite"}}>⬡</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.amber,letterSpacing:3,marginBottom:8}}>TOKEN CREATED</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.parch,marginBottom:12}}>⬡ {suggestedSymbol}</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:20}}>The community has voted to tokenize this discovery. A bonding curve token has been created. The author will earn a commission on every future purchase — automatically and forever.</p>
            <div style={{background:C.card,border:`1px solid ${C.amber}28`,borderRadius:10,padding:"12px 14px",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1,textAlign:"left",marginBottom:20}}>
              <div>⬡ <span style={{color:C.tan}}>Symbol:</span> <span style={{color:C.amber}}>⬡ {suggestedSymbol}</span></div>
              <div>⬡ <span style={{color:C.tan}}>Author commission:</span> <span style={{color:C.sprout}}>{commissionRate(post.cat)}% per purchase · locked forever</span></div>
              <div>⬡ <span style={{color:C.tan}}>Pricing:</span> Bonding curve · rises with demand</div>
              <div>⬡ <span style={{color:C.tan}}>Community YES vote:</span> {yesVotes.toLocaleString()} ({(yesVotes/(yesVotes+noVotes)*100).toFixed(0)}%)</div>
            </div>
            <button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              VIEW IN MARKET →
            </button>
          </div>
        ) : creating ? (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:38,marginBottom:14,animation:"pulse 1s infinite"}}>⬡</div>
            <div style={{fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:6}}>CREATING TOKEN…</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:18}}>Deploying bonding curve · Locking author commission · Broadcasting to nodes</div>
            <div style={{height:2,background:C.shadow,borderRadius:2,overflow:"hidden",maxWidth:280,margin:"0 auto"}}>
              <div style={{height:"100%",width:"100%",background:`linear-gradient(90deg,${C.amber},${C.copper})`,animation:"fadein 2.8s linear forwards"}}/>
            </div>
          </div>
        ) : (
          <>
            <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:4}}>TOKENIZATION VOTE</div>
            <div style={{fontSize:13,fontFamily:"'Palatino Linotype',serif",color:C.parch,marginBottom:18,lineHeight:1.4,fontWeight:700,paddingRight:30}}>{post.title}</div>

            {/* Five gates */}
            <div style={{background:C.card,border:`1px solid ${C.amber}22`,borderRadius:12,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:10}}>ALL 5 GATES MUST BE MET SIMULTANEOUSLY</div>
              {gateItems.map(g => {
                const met = g.val >= g.req;
                const pct = Math.min((g.val / g.req) * 100, 100);
                return (
                  <div key={g.key} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:met?C.sprout:C.dust,width:12}}>{met?"✓":"·"}</span>
                        <span style={{fontSize:7,fontFamily:"monospace",color:met?C.sprout:C.dust,letterSpacing:.5}}>{g.label}</span>
                      </div>
                      <div style={{fontSize:8,fontFamily:"monospace",color:met?C.sprout:C.dust}}>
                        {g.fmt(g.val)} <span style={{color:C.shadow}}>/ {g.fmt(g.req)}</span>
                      </div>
                    </div>
                    <div style={{height:4,background:C.shadow,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:met?C.sprout:C.amber,borderRadius:2,transition:"width .5s ease"}}/>
                    </div>
                  </div>
                );
              })}
              {allMet && (
                <div style={{marginTop:10,padding:"8px 10px",background:C.sproutD,border:`1px solid ${C.sprout}30`,borderRadius:7,fontSize:8,fontFamily:"monospace",color:C.sprout,letterSpacing:1}}>
                  ✓ ALL 5 GATES CLEARED — ELIGIBLE FOR TOKENIZATION
                </div>
              )}
            </div>

            {/* AND-gate warning */}
            <div style={{background:C.amberD,border:`1px solid ${C.amber}25`,borderRadius:9,padding:"10px 13px",marginBottom:14,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.amber}}>⬡</span> Meeting four out of five gates does nothing. All five must be met <span style={{color:C.parch}}>simultaneously</span>. You cannot game any single metric in isolation.
            </div>

            {/* Community vote */}
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2}}>COMMUNITY TOKENIZATION VOTE</span>
                <span style={{fontSize:9,fontFamily:"monospace",color:C.dust}}>{(yesVotes+noVotes).toLocaleString()} votes cast</span>
              </div>
              <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                <div style={{width:`${yesPct*100}%`,background:C.sprout,transition:"width .4s ease"}}/>
                <div style={{flex:1,background:C.bloom}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:8,fontFamily:"monospace",color:C.sprout}}>YES {(yesPct*100).toFixed(0)}% · {yesVotes.toLocaleString()}</span>
                <span style={{fontSize:7,fontFamily:"monospace",color:C.dust}}>Threshold: 66% YES</span>
                <span style={{fontSize:8,fontFamily:"monospace",color:C.bloom}}>NO {((1-yesPct)*100).toFixed(0)}% · {noVotes.toLocaleString()}</span>
              </div>
            </div>

            {voted ? (
              <div style={{textAlign:"center",padding:"11px",background:voted==="yes"?C.sproutD:`${C.bloom}0c`,border:`1px solid ${voted==="yes"?C.sprout+"33":C.bloom+"33"}`,borderRadius:9,fontSize:9,fontFamily:"monospace",color:voted==="yes"?C.sprout:C.bloom}}>
                {voted==="yes" ? "✓ Voted YES — processing token creation…" : "✗ Voted NO — recorded on-chain"}
              </div>
            ) : user ? (
              <div style={{display:"flex",gap:8}}>
                <button onClick={() => handleVote("yes")}
                  style={{flex:2,background:`${C.sprout}14`,border:`1px solid ${C.sprout}44`,color:C.sprout,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
                  ★ YES — TOKENIZE
                </button>
                <button onClick={() => handleVote("no")}
                  style={{flex:1,background:`${C.bloom}0c`,border:`1px solid ${C.bloom}33`,color:C.bloom,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
                  NO
                </button>
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"12px",border:`1px solid ${C.shadow}`,borderRadius:9,fontSize:9,fontFamily:"monospace",color:C.dust}}>
                Sign in to vote on tokenization.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ValidationModal({ post, votes, disputes, user, hasVoted, onClose, onVote }) {
  const [localVotes, setLocalVotes] = useState({ ...votes });
  const [localDisp,  setLocalDisp]  = useState({ ...disputes });
  const [voted, setVoted] = useState(hasVoted || null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const score      = calcTrustScore(localVotes, localDisp);
  const totalUp    = Object.values(localVotes).reduce((s,v) => s+v, 0);
  const totalDisp  = Object.values(localDisp).reduce((s,v) => s+v, 0);
  const total      = totalUp + totalDisp;
  const rawRatio   = total === 0 ? 0 : totalUp / total;
  const diversity  = shannonDiversity(localVotes);
  const maxCluster = Math.max(...Object.values(localVotes));
  const scoreColor = score >= 0.8 ? C.sprout : score >= 0.6 ? C.amber : C.bloom;

  const handleVote = type => {
    if (voted || animating || !user) return;
    const cluster = user.cluster || "independent";
    setAnimating(true);
    setTimeout(() => {
      if (type === "up") {
        setLocalVotes(prev => ({ ...prev, [cluster]: (prev[cluster]||0) + 1 }));
      } else {
        setLocalDisp(prev => ({ ...prev, [cluster]: (prev[cluster]||0) + 1 }));
      }
      setVoted(type);
      setAnimating(false);
      onVote(type);
    }, 700);
  };

  const repWeight = user?.credentials?.length > 0 ? "0.4×" : user ? "0.05×" : null;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000d0",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.sky}44`,borderRadius:20,padding:28,maxWidth:500,width:"100%",position:"relative",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${C.sky},${C.sprout})`,borderRadius:2,marginBottom:18}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10}}>✕</button>

        <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:4}}>VALIDATION & CONSENSUS</div>
        <div style={{fontSize:13,fontFamily:"'Palatino Linotype',serif",color:C.parch,marginBottom:18,lineHeight:1.4,fontWeight:700,paddingRight:30}}>{post.title}</div>

        {/* Trust score card */}
        <div style={{background:C.card,border:`1px solid ${scoreColor}28`,borderRadius:12,padding:"16px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2}}>TRUST SCORE</span>
            <span key={Math.round(score*1000)} style={{fontSize:22,fontFamily:"monospace",fontWeight:700,color:scoreColor,animation:"numtick .3s ease"}}>{(score*100).toFixed(1)}%</span>
          </div>
          <div style={{height:6,background:C.shadow,borderRadius:3,overflow:"hidden",marginBottom:12}}>
            <div style={{height:"100%",width:`${score*100}%`,background:`linear-gradient(90deg,${C.sky},${scoreColor})`,borderRadius:3,transition:"width .6s ease"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:C.wood,borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:1,marginBottom:4}}>RAW RATIO · 65%</div>
              <div style={{fontSize:16,fontFamily:"monospace",fontWeight:700,color:C.amber}}>{(rawRatio*100).toFixed(1)}%</div>
              <div style={{fontSize:8,fontFamily:"monospace",color:C.dust,marginTop:2}}>{totalUp.toLocaleString()} validations</div>
            </div>
            <div style={{background:C.wood,borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:1,marginBottom:4}}>DIVERSITY INDEX · 35%</div>
              <div style={{fontSize:16,fontFamily:"monospace",fontWeight:700,color:C.sky}}>{(diversity*100).toFixed(1)}%</div>
              <div style={{fontSize:8,fontFamily:"monospace",color:C.dust,marginTop:2}}>Shannon entropy</div>
            </div>
          </div>
        </div>

        {/* Cluster distribution */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:8}}>CLUSTER DISTRIBUTION</div>
          {CLUSTERS.map(cl => {
            const v = localVotes[cl.id] || 0;
            const d = localDisp[cl.id] || 0;
            const isUser = user?.cluster === cl.id;
            const barPct = maxCluster > 0 ? (v / maxCluster) * 100 : 0;
            const disputePct = (v + d) > 0 ? (d / (v + d)) * 100 : 0;
            return (
              <div key={cl.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,width:18,flexShrink:0,textAlign:"center"}}>{cl.icon}</span>
                <span style={{fontSize:7,fontFamily:"monospace",color:isUser?C.amber:C.dust,width:64,flexShrink:0,letterSpacing:.5}}>{cl.label.toUpperCase()}</span>
                <div style={{flex:1,position:"relative"}}>
                  <div style={{height:5,background:C.shadow,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${barPct}%`,background:isUser?`linear-gradient(90deg,${C.amber},${C.copper})`:C.sky,borderRadius:2,transition:"width .5s ease"}}/>
                  </div>
                  {d > 0 && (
                    <div style={{height:2,background:C.shadow,borderRadius:1,overflow:"hidden",marginTop:1}}>
                      <div style={{height:"100%",width:`${disputePct}%`,background:C.bloom,borderRadius:1}}/>
                    </div>
                  )}
                </div>
                <span style={{fontSize:8,fontFamily:"monospace",color:isUser?C.amber:C.dust,minWidth:38,textAlign:"right"}}>{v.toLocaleString()}</span>
                {d > 0 && <span style={{fontSize:7,fontFamily:"monospace",color:C.bloom,minWidth:28,textAlign:"right"}}>-{d}</span>}
              </div>
            );
          })}
          <div style={{display:"flex",gap:10,marginTop:6}}>
            <span style={{fontSize:7,fontFamily:"monospace",color:C.sky}}>█ validates</span>
            <span style={{fontSize:7,fontFamily:"monospace",color:C.bloom}}>█ disputes</span>
            {user && <span style={{fontSize:7,fontFamily:"monospace",color:C.amber}}>█ your cluster</span>}
          </div>
        </div>

        {/* Key mechanic callout */}
        <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:9,padding:"10px 13px",marginBottom:14,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
          <span style={{color:C.sprout}}>✦</span> 500 validations spread evenly across all 8 clusters scores <span style={{color:C.parch}}>higher</span> than 50,000 validations from a single cluster. Coordination campaigns <span style={{color:C.parch}}>lower</span> the trust score — the math punishes them.
        </div>

        {/* Vote buttons or result */}
        {animating ? (
          <div style={{textAlign:"center",padding:"16px",fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2,animation:"pulse 1s infinite"}}>RECORDING ON-CHAIN…</div>
        ) : voted ? (
          <div style={{textAlign:"center",padding:"13px",background:voted==="up"?C.sproutD:`${C.bloom}0c`,border:`1px solid ${voted==="up"?C.sprout+"33":C.bloom+"33"}`,borderRadius:9}}>
            <div style={{fontSize:11,fontFamily:"monospace",color:voted==="up"?C.sprout:C.bloom,marginBottom:5}}>
              {voted==="up" ? "✓ Validated from your cluster" : "✗ Disputed from your cluster"}
            </div>
            {repWeight && (
              <div style={{fontSize:8,fontFamily:"monospace",color:C.dust}}>
                Reputation weight: {repWeight} · grows with each accurate validation
              </div>
            )}
          </div>
        ) : user ? (
          <>
            <div style={{fontSize:8,fontFamily:"monospace",color:C.dust,marginBottom:8,textAlign:"center"}}>
              Your vote is cast from the <span style={{color:C.amber}}>{CLUSTERS.find(c=>c.id===user.cluster)?.label || "Independent"}</span> cluster
              {repWeight && <span style={{color:C.dust}}> · weight {repWeight}</span>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={() => handleVote("up")}
                style={{flex:1,background:`${C.sprout}14`,border:`1px solid ${C.sprout}44`,color:C.sprout,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
                ✓ VALIDATE
              </button>
              <button onClick={() => handleVote("dispute")}
                style={{flex:1,background:`${C.bloom}0c`,border:`1px solid ${C.bloom}33`,color:C.bloom,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
                ✗ DISPUTE
              </button>
            </div>
          </>
        ) : (
          <div style={{textAlign:"center",padding:"12px",border:`1px solid ${C.shadow}`,borderRadius:9,fontSize:9,fontFamily:"monospace",color:C.dust}}>
            Sign in to validate or dispute this post.
          </div>
        )}
      </div>
    </div>
  );
}

function BuyModal({ token, user, onClose, onBought }) {
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const curPrice  = bondingPrice(token.supply);
  const newSupply = token.supply + qty;
  const newPrice  = bondingPrice(newSupply);
  const totalCost = bondingCost(token.supply, newSupply);

  // SVG bonding curve
  const W = 320, H = 80;
  const maxS = Math.max(token.supply * 1.65, newSupply * 1.1);
  const maxP = bondingPrice(maxS);
  const toX  = s => 10 + (s / maxS) * (W - 20);
  const toY  = p => (H - 10) - (p / maxP) * (H - 20);

  const curvePts = [];
  for (let i = 0; i <= 80; i++) {
    const s = (i / 80) * maxS;
    curvePts.push(`${toX(s).toFixed(1)},${toY(bondingPrice(s)).toFixed(1)}`);
  }
  const curveD = "M" + curvePts.join(" L");
  const cx = toX(token.supply), cy = toY(curPrice);
  const nx = toX(newSupply),    ny = toY(newPrice);

  const fillPts = [];
  for (let i = 0; i <= 30; i++) {
    const s = token.supply + (i / 30) * qty;
    fillPts.push(`${toX(s).toFixed(1)},${toY(bondingPrice(s)).toFixed(1)}`);
  }
  fillPts.push(`${nx.toFixed(1)},${(H - 10).toFixed(1)}`);
  fillPts.push(`${cx.toFixed(1)},${(H - 10).toFixed(1)}`);
  const fillD = `M${fillPts[0]} L${fillPts.slice(1).join(" L")} Z`;

  const handleBuy = () => {
    if (!user || buying || bought) return;
    const rec = { qty, cost: bondingCost(token.supply, token.supply + qty), newSupply: token.supply + qty, newPrice: bondingPrice(token.supply + qty) };
    setBuying(true);
    setTimeout(() => { setBuying(false); setBought(true); setRecord(rec); if (onBought) onBought(token.sym, qty); }, 2000);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000d0",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${token.col}44`,borderRadius:20,padding:28,maxWidth:460,width:"100%",position:"relative",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${token.col},${C.copper})`,borderRadius:2,marginBottom:18}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10}}>✕</button>

        {bought && record ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:38,marginBottom:12,color:token.col,animation:"sway 2s ease-in-out infinite"}}>⬡</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:token.col,letterSpacing:3,marginBottom:8}}>PURCHASE CONFIRMED</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:C.parch,marginBottom:10}}>+{record.qty} {token.sym}</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:16}}>Recorded on-chain. New token price: <span style={{color:token.col,fontFamily:"monospace",fontWeight:700}}>${record.newPrice.toFixed(2)}</span></p>
            <div style={{background:C.card,border:`1px solid ${C.amber}28`,borderRadius:10,padding:"11px 14px",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1,textAlign:"left",marginBottom:14}}>
              <div>⬡ <span style={{color:C.tan}}>Token:</span> <span style={{color:token.col}}>{token.sym}</span></div>
              <div>⬡ <span style={{color:C.tan}}>Quantity:</span> {record.qty.toLocaleString()}</div>
              <div>⬡ <span style={{color:C.tan}}>Total paid:</span> <span style={{color:C.amber}}>${record.cost.toFixed(2)}</span></div>
              <div>⬡ <span style={{color:C.tan}}>New supply:</span> {record.newSupply.toLocaleString()}</div>
              <div>⬡ <span style={{color:C.tan}}>Author commission:</span> <span style={{color:C.sprout}}>{token.commission}% · ${(record.cost * token.commission / 100).toFixed(2)} auto-routed</span></div>
            </div>
            <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:9,padding:"9px 13px",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8,marginBottom:16,textAlign:"left"}}>
              <span style={{color:C.sprout}}>✦</span> This token's price has <span style={{color:C.parch}}>zero effect</span> on the post's trust score. Price movements cannot discredit the research.
            </div>
            <button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${token.col}22,${C.vine}12)`,border:`1px solid ${token.col}55`,color:token.col,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              BACK TO MARKET →
            </button>
          </div>
        ) : buying ? (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:38,marginBottom:14,animation:"pulse 1s infinite",color:token.col}}>⬡</div>
            <div style={{fontSize:10,fontFamily:"monospace",color:token.col,letterSpacing:2,marginBottom:6}}>PROCESSING…</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:18}}>Updating bonding curve · Routing author commission · Broadcasting to nodes</div>
            <div style={{height:2,background:C.shadow,borderRadius:2,overflow:"hidden",maxWidth:280,margin:"0 auto"}}>
              <div style={{height:"100%",width:"100%",background:`linear-gradient(90deg,${token.col},${C.copper})`,animation:"fadein 2s linear forwards"}}/>
            </div>
          </div>
        ) : (
          <>
            <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:4}}>KNOWLEDGE TOKEN</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:token.col,boxShadow:`0 0 8px ${token.col}`,flexShrink:0}}/>
              <span style={{fontSize:20,fontFamily:"monospace",fontWeight:700,color:token.col}}>⬡ {token.sym}</span>
            </div>
            <div style={{fontSize:10,color:C.dust,marginBottom:20}}>{token.name}</div>

            {/* Bonding curve SVG */}
            <div style={{background:C.card,border:`1px solid ${C.shadow}`,borderRadius:12,padding:"14px",marginBottom:14}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:1,marginBottom:8}}>BONDING CURVE · P = 0.001 × S^1.38</div>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",overflow:"visible"}}>
                <path d={fillD} fill={`${token.col}25`}/>
                <path d={curveD} fill="none" stroke={`${token.col}99`} strokeWidth="1.5"/>
                <circle cx={cx} cy={cy} r="4" fill={C.amber} stroke={C.bark} strokeWidth="1"/>
                <circle cx={nx} cy={ny} r="3.5" fill={token.col} stroke={C.parch} strokeWidth="1"/>
                <text x={cx} y={Math.max(cy - 7, 8)} textAnchor="middle" fontSize="7" fill={C.amber} fontFamily="monospace">${curPrice.toFixed(0)}</text>
                {nx - cx > 24 && <text x={nx} y={Math.max(ny - 7, 8)} textAnchor="middle" fontSize="7" fill={token.col} fontFamily="monospace">${newPrice.toFixed(0)}</text>}
                <line x1="10" y1={H - 10} x2={W - 10} y2={H - 10} stroke={`${C.shadow}99`} strokeWidth="0.5"/>
              </svg>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:7,fontFamily:"monospace",color:C.dust,marginTop:4}}>
                <span>S = 0</span>
                <span style={{color:C.amber}}>● now: {token.supply.toLocaleString()}</span>
                <span style={{color:token.col}}>● after: {newSupply.toLocaleString()}</span>
              </div>
            </div>

            {/* Price grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[
                {l:"ENTRY PRICE",    v:`$${curPrice.toFixed(2)}`,  c:C.amber},
                {l:"CURRENT SUPPLY", v:token.supply.toLocaleString(), c:C.tan},
                {l:"PRICE AFTER",    v:`$${newPrice.toFixed(2)}`,  c:token.col},
              ].map(({l,v,c}) => (
                <div key={l} style={{background:C.wood,borderRadius:8,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:6,fontFamily:"monospace",color:C.dust,letterSpacing:.5,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:13,fontFamily:"monospace",fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:6}}>QUANTITY</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{width:32,height:32,borderRadius:7,background:C.wood,border:`1px solid ${C.shadow}`,color:C.dust,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                <input type="number" value={qty} min={1} max={500}
                  onChange={e => setQty(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                  style={{flex:1,background:C.wood,border:`1px solid ${token.col}44`,borderRadius:7,padding:"8px",color:C.parch,fontFamily:"monospace",fontSize:15,textAlign:"center",outline:"none"}}/>
                <button onClick={() => setQty(q => Math.min(500, q + 1))}
                  style={{width:32,height:32,borderRadius:7,background:C.wood,border:`1px solid ${C.shadow}`,color:C.dust,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
              </div>
            </div>

            {/* Total cost */}
            <div style={{background:C.card,border:`1px solid ${token.col}28`,borderRadius:9,padding:"12px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:1,marginBottom:3}}>TOTAL COST</div>
                <div style={{fontSize:20,fontFamily:"monospace",fontWeight:700,color:token.col}}>${totalCost.toFixed(2)}</div>
              </div>
              <div style={{textAlign:"right",fontSize:8,fontFamily:"monospace",color:C.dust,lineHeight:1.7}}>
                <div>Author commission</div>
                <div style={{color:C.sprout,fontWeight:700}}>{token.commission}% auto-routed</div>
              </div>
            </div>

            {/* Critical principle */}
            <div style={{background:C.amberD,border:`1px solid ${C.amber}33`,borderRadius:9,padding:"10px 13px",marginBottom:14,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.amber}}>⬡</span> Token price has <span style={{color:C.parch}}>zero effect</span> on this post's trust score or content integrity. A crashed price cannot discredit the research. Financial manipulation cannot touch the consensus record.
            </div>

            {user ? (
              <button onClick={handleBuy}
                style={{width:"100%",background:`linear-gradient(135deg,${token.col}22,${C.vine}12)`,border:`1px solid ${token.col}55`,color:token.col,borderRadius:9,padding:"13px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,fontWeight:700}}>
                BUY {qty} {token.sym} — ${totalCost.toFixed(2)} →
              </button>
            ) : (
              <div style={{textAlign:"center",padding:"12px",border:`1px solid ${C.shadow}`,borderRadius:9,fontSize:9,fontFamily:"monospace",color:C.dust}}>
                Sign in to buy knowledge tokens.
              </div>
            )}

            <div style={{marginTop:10,fontSize:7,fontFamily:"monospace",color:C.dust,textAlign:"center",lineHeight:1.9,letterSpacing:.5}}>
              No pre-mine · No VC allocation · No privileged early access<br/>
              The math determines every price transparently and automatically
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  {id:"home",label:"Home"},
  {id:"discover",label:"Discover"},
  {id:"psh",label:"★ Save Humanity"},
  {id:"market",label:"Knowledge Market"},
  {id:"consensus",label:"Consensus"},
  {id:"security",label:"Security"},
  {id:"network",label:"Network"},
];

export default function Veridax() {
  const [section, setSection] = useState("home");
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showJoin, setShowJoin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [postVotes,    setPostVotes]    = useState(INITIAL_VOTES);
  const [postDisputes, setPostDisputes] = useState(INITIAL_DISPUTES);
  const [userVotes,    setUserVotes]    = useState({});
  const [validatingPost, setValidatingPost] = useState(null);
  const [tokenizePost,   setTokenizePost]   = useState(null);
  const [buyTokenSym,    setBuyTokenSym]    = useState(null);

  const tokens = posts
    .filter(p => p.tokenData)
    .map(p => ({ sym:p.tokenData.sym, name:p.title, price:bondingPrice(p.tokenData.supply), ch:p.tokenData.change, col:p.tokenData.col, supply:p.tokenData.supply, commission:p.tokenData.commission ?? commissionRate(p.cat) }));
  const buyToken = buyTokenSym ? tokens.find(t => t.sym === buyTokenSym) : null;
  const [gossip, setGossip] = useState("19,203 nodes syncing · Chain height #89,403");

  const handleVote = (postId, type) => {
    if (!user || userVotes[postId]) return;
    const cluster = user.cluster || "independent";
    if (type === "up") {
      setPostVotes(prev => ({ ...prev, [postId]: { ...prev[postId], [cluster]: (prev[postId]?.[cluster]||0) + 1 } }));
    } else {
      setPostDisputes(prev => ({ ...prev, [postId]: { ...prev[postId], [cluster]: (prev[postId]?.[cluster]||0) + 1 } }));
    }
    setUserVotes(prev => ({ ...prev, [postId]: type }));
  };

  const handleTokenized = (postId, sym) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, tokenData: { sym, supply: 1000, col: p.color, change: 0, commission: commissionRate(p.cat) } } : p
    ));
    setPostVotes(prev => ({ ...prev, [postId]: prev[postId] || {} }));
    setPostDisputes(prev => ({ ...prev, [postId]: prev[postId] || {} }));
    setTokenizePost(null);
  };

  const handleBought = (sym, qty) => {
    setPosts(prev => prev.map(p =>
      p.tokenData?.sym === sym ? { ...p, tokenData: { ...p.tokenData, supply: p.tokenData.supply + qty } } : p
    ));
  };

  const handlePublish = (newPost) => {
    setPosts(prev => [...prev, newPost]);
    const empty = { scientific:0, civil:0, independent:0, tech:0, grassroots:0, academic:0, journalism:0, legal:0 };
    setPostVotes(prev => ({ ...prev, [newPost.id]: { ...empty } }));
    setPostDisputes(prev => ({ ...prev, [newPost.id]: { ...empty } }));
  };

  const [liveStats, setLiveStats] = useState({ experts:24182, works:89403, nodes:19203, imports:3841, tokens:3401 });

  const GOSSIPS = [
    "📰 Substack import: 'Three Patents That Could End Energy Poverty' — preserved on 19,200+ nodes",
    "🌍 19,203 nodes active across 7 global regions — no central server",
    "⬡ LONGEVX +31.2% · author earned $1,240 this week",
    "🛡 Sybil cluster quarantined: 847 coordinated wallets blocked before affecting consensus",
    "★ Project Save Humanity: new proposal — 'Universal Clean Water Grid' — 4,200 upvotes",
    "⚖ Legal takedown attempt blocked — recorded as suppression evidence on-chain",
  ];

  useEffect(() => {
    const id = setInterval(() => setGossip(GOSSIPS[Math.floor(Math.random() * GOSSIPS.length)]), 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveStats(prev => {
        const next = { ...prev };
        if (Math.random() < 0.40) next.experts++;
        if (Math.random() < 0.60) next.works++;
        if (Math.random() < 0.20) next.nodes++;
        if (Math.random() < 0.30) next.imports++;
        if (Math.random() < 0.05) next.tokens++;
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{minHeight:"100vh",background:C.soil,color:C.parch,fontFamily:"'Palatino Linotype',Palatino,Georgia,serif",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#04050a}
        ::-webkit-scrollbar-thumb{background:#111220;border-radius:3px}
        input:focus{border-color:#e8a83055!important;outline:none}
        @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes numtick{0%{opacity:.4;transform:translateY(-3px)}100%{opacity:1;transform:none}}
        button{transition:all .2s}
      `}</style>

      {/* GOSSIP */}
      <div style={{background:C.canopy,borderBottom:`1px solid ${C.shadow}`,padding:"5px 24px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <span style={{fontSize:7,fontFamily:"monospace",color:C.sprout,letterSpacing:3,flexShrink:0,animation:"pulse 2s infinite"}}>● LIVE</span>
        <span style={{fontSize:9,fontFamily:"monospace",color:C.dust,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{gossip}</span>
        <span style={{marginLeft:"auto",fontSize:9,fontFamily:"monospace",color:"#181828",flexShrink:0,animation:"blink 1s infinite"}}>█</span>
      </div>

      <Ticker tokens={tokens}/>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:`${C.earth}f8`,borderBottom:`1px solid ${C.shadow}`,backdropFilter:"blur(20px)",flexShrink:0}}>
        <div style={{maxWidth:1160,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",height:54,gap:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginRight:24,flexShrink:0}}>
            <div style={{position:"relative",width:30,height:30}}>
              <div style={{width:30,height:30,borderRadius:7,background:`linear-gradient(135deg,${C.amber}28,${C.copper}18)`,border:`1px solid ${C.amber}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⛓</div>
              <span style={{position:"absolute",top:-5,right:-5,fontSize:10,animation:"sway 4s ease-in-out infinite"}}>🌿</span>
            </div>
            <div>
              <div style={{fontSize:14,fontFamily:"'Playfair Display',serif",fontWeight:900,color:C.parch,letterSpacing:-.5,lineHeight:1}}>VERIDAX</div>
              <div style={{fontSize:6,fontFamily:"monospace",color:C.dust,letterSpacing:3}}>KNOWLEDGE · TRUTH · PROGRESS</div>
            </div>
          </div>
          <div style={{display:"flex",flex:1,overflowX:"auto"}}>
            {NAV_ITEMS.map(n => (
              <button key={n.id} onClick={() => setSection(n.id)}
                style={{background:"transparent",border:"none",borderBottom:`2px solid ${section===n.id?C.amber:"transparent"}`,color:section===n.id?C.amber:C.dust,padding:"0 12px",height:54,fontSize:9,fontFamily:"monospace",cursor:"pointer",letterSpacing:1,whiteSpace:"nowrap",transition:"color .2s,border-color .2s"}}>
                {n.label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:7,marginLeft:10,flexShrink:0}}>
            <button onClick={() => setShowSub(true)}
              style={{display:"flex",alignItems:"center",gap:5,background:C.amberD,border:`1px solid ${C.amber}40`,color:C.amber,borderRadius:7,padding:"6px 10px",fontSize:8,fontFamily:"monospace",cursor:"pointer",letterSpacing:1}}>
              📰 IMPORT
            </button>
            {user ? (
              <>
                <button onClick={() => setShowPublish(true)}
                  style={{display:"flex",alignItems:"center",gap:5,background:`${C.sky}14`,border:`1px solid ${C.sky}40`,color:C.sky,borderRadius:7,padding:"6px 11px",fontSize:8,fontFamily:"monospace",cursor:"pointer",letterSpacing:1}}>
                  ✦ PUBLISH
                </button>
                <div onClick={() => setShowProfile(true)} style={{display:"flex",alignItems:"center",gap:5,background:C.vineD,border:`1px solid ${C.vine}30`,borderRadius:7,padding:"6px 10px",cursor:"pointer"}}>
                  <span style={{fontSize:6,color:C.sprout,animation:"pulse 2s infinite"}}>●</span>
                  <span style={{fontSize:9,fontFamily:"monospace",color:C.tan,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{user.username}</span>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)}
                  style={{background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"6px 13px",fontSize:9,fontFamily:"monospace",cursor:"pointer",letterSpacing:1}}>
                  LOG IN
                </button>
                <button onClick={() => setShowJoin(true)}
                  style={{background:`linear-gradient(135deg,${C.amber}20,${C.vine}10)`,border:`1px solid ${C.amber}44`,color:C.amber,borderRadius:7,padding:"6px 13px",fontSize:9,fontFamily:"monospace",cursor:"pointer",letterSpacing:1}}>
                  JOIN →
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* PAGES */}
      <div style={{flex:1}}>

        {section === "home" && (
          <div>
            {/* Hero */}
            <div style={{position:"relative",overflow:"hidden",padding:"62px 24px 50px",borderBottom:`1px solid ${C.shadow}`}}>
              <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(ellipse at 15% 70%,${C.vine}10,transparent 44%),radial-gradient(ellipse at 85% 20%,${C.amber}09,transparent 44%)`}}/>
              <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 59px,${C.shadow}66 59px,${C.shadow}66 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,${C.shadow}66 59px,${C.shadow}66 60px)`,opacity:.15}}/>
              <div style={{maxWidth:700,margin:"0 auto",textAlign:"center",position:"relative",animation:"fadein .5s ease both"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#f5d06010",border:"1px solid #f5d06044",borderRadius:20,padding:"5px 18px",marginBottom:20}}>
                  <span style={{fontSize:11}}>🌍</span>
                  <span style={{fontSize:7,fontFamily:"monospace",color:"#f5d060",letterSpacing:3}}>PROJECT SAVE HUMANITY — LIVE</span>
                </div>
                <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5.5vw,50px)",fontWeight:900,lineHeight:1.15,marginBottom:18,color:C.parch,letterSpacing:-.5}}>
                  Truth verified by the many<br/>cannot be <span style={{color:C.amber,fontStyle:"italic"}}>buried</span> by the few.
                </h1>
                <p style={{color:C.dust,fontSize:13,lineHeight:1.9,maxWidth:540,margin:"0 auto 14px"}}>
                  A decentralized, peer-to-peer platform where <span style={{color:C.parch}}>experts, researchers, independent journalists, engineers, scientists, philosophers,</span> and everyday truth-seekers can publish freely — without being silenced, suppressed, or bought out by corporations, governments, or institutions.
                </p>
                <p style={{color:C.dust,fontSize:12,lineHeight:1.85,maxWidth:480,margin:"0 auto 28px"}}>
                  Part <span style={{color:C.amber}}>knowledge marketplace</span>, part <span style={{color:C.sky}}>credibility system</span>, part <span style={{color:C.sprout}}>decentralized social network</span>, and part <span style={{color:C.copper}}>blockchain-backed archive</span> of human progress.
                </p>
                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:38}}>
                  <button onClick={() => setShowSub(true)}
                    style={{background:`linear-gradient(135deg,${C.amber},${C.copper})`,border:"none",borderRadius:10,padding:"13px 22px",color:C.bark,fontWeight:700,fontSize:11,fontFamily:"monospace",cursor:"pointer",letterSpacing:2,boxShadow:`0 0 26px ${C.amber}28`}}>
                    📰 IMPORT FROM SUBSTACK
                  </button>
                  <button onClick={() => setSection("psh")}
                    style={{background:"#f5d06010",border:"1px solid #f5d06044",borderRadius:10,padding:"13px 16px",color:"#f5d060",fontSize:11,fontFamily:"monospace",cursor:"pointer",letterSpacing:1}}>
                    ★ SAVE HUMANITY
                  </button>
                  <button onClick={() => setShowJoin(true)}
                    style={{background:"transparent",border:`1px solid ${C.shadow}`,borderRadius:10,padding:"13px 14px",color:C.dust,fontSize:11,fontFamily:"monospace",cursor:"pointer",letterSpacing:1}}>
                    JOIN AS EXPERT →
                  </button>
                </div>
                <div style={{display:"flex",gap:0,justifyContent:"center",flexWrap:"wrap",background:C.bark,border:`1px solid ${C.shadow}`,borderRadius:14,padding:"15px",maxWidth:600,margin:"0 auto",position:"relative"}}>
                  <div style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",background:C.bark,padding:"0 8px",display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:6,color:C.sprout,animation:"pulse 2s infinite"}}>●</span>
                    <span style={{fontSize:6,fontFamily:"monospace",color:C.dust,letterSpacing:2}}>LIVE</span>
                  </div>
                  {[{l:"EXPERTS",v:liveStats.experts,c:C.amber},{l:"WORKS",v:liveStats.works,c:C.vine},{l:"NODES",v:liveStats.nodes,c:C.sky},{l:"IMPORTS",v:liveStats.imports,c:C.copper},{l:"TOKENS",v:liveStats.tokens,c:"#f5d060"}].map(({l,v,c},i,arr) => (
                    <div key={l} style={{flex:"1 1 80px",textAlign:"center",padding:"0 10px",borderRight:i<arr.length-1?`1px solid ${C.shadow}`:"none"}}>
                      <div key={v} style={{fontSize:16,fontFamily:"monospace",fontWeight:700,color:c,marginBottom:2,animation:"numtick .25s ease"}}>{v.toLocaleString()}</div>
                      <div style={{fontSize:6,fontFamily:"monospace",color:C.dust,letterSpacing:1.5}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Network */}
            <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.shadow}`,background:C.earth}}>
              <div style={{maxWidth:1100,margin:"0 auto"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2}}>LIVE P2P MESH — NO CENTRAL SERVER — NO KILL SWITCH</span>
                  <span style={{fontSize:8,fontFamily:"monospace",color:C.sprout,animation:"pulse 2s infinite"}}>● 19,203 NODES</span>
                </div>
                <NetCanvas h={120}/>
              </div>
            </div>

            {/* Posts */}
            <div style={{maxWidth:1160,margin:"0 auto",padding:"34px 24px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
                <div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.parch,marginBottom:3}}>Featured Discoveries</h2>
                  <p style={{fontSize:9,fontFamily:"monospace",color:C.dust}}>Most validated · Highest consensus · Trending</p>
                </div>
                <button onClick={() => setSection("discover")} style={{background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"6px 12px",fontSize:9,fontFamily:"monospace",cursor:"pointer"}}>VIEW ALL →</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:14}}>
                {posts.map((p, i) => <div key={p.id} style={{animation:`fadein .4s ease ${i*.07}s both`}}><PostCard post={p} user={user} votes={postVotes[p.id]} disputes={postDisputes[p.id]} onValidate={setValidatingPost} onTokenize={setTokenizePost}/></div>)}
              </div>
            </div>

            {/* Four Pillars */}
            <div style={{borderTop:`1px solid ${C.shadow}`,background:C.bark,padding:"40px 24px"}}>
              <div style={{maxWidth:1160,margin:"0 auto"}}>
                <div style={{textAlign:"center",marginBottom:28}}>
                  <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:4,marginBottom:8}}>WHAT IS VERIDAX</div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.parch,fontWeight:700}}>Four systems. One mission.</h2>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
                  {[
                    {icon:"⬡",color:C.amber,title:"Knowledge Marketplace",body:"Publish discoveries that earn. Every validated work becomes a tokenized asset — authors earn automatically on every engagement, forever. No publisher takes a cut."},
                    {icon:"◈",color:C.sky,title:"Credibility System",body:"Trust is built through consensus across diverse, independent networks — not handed down by institutions. No authority decides what is true. The many decide together."},
                    {icon:"🤝",color:C.sprout,title:"Decentralized Social Network",body:"Connect with researchers, journalists, engineers, scientists, and philosophers across every field. No algorithm, no feed manipulation, no corporate agenda shaping what you see."},
                    {icon:"⛓",color:C.copper,title:"Blockchain-Backed Archive",body:"Every post is permanently recorded across 19,000+ independent nodes. Tamper-proof. Immutable. No corporation, government, or court order can erase what has been published here."},
                  ].map(({icon,color,title,body}) => (
                    <div key={title} style={{background:C.earth,border:`1px solid ${color}22`,borderRadius:14,padding:"20px",transition:"border-color .2s"}}
                      onMouseEnter={e => e.currentTarget.style.borderColor=`${color}55`}
                      onMouseLeave={e => e.currentTarget.style.borderColor=`${color}22`}>
                      <div style={{fontSize:22,color,marginBottom:10}}>{icon}</div>
                      <div style={{fontSize:10,fontFamily:"monospace",color,letterSpacing:1,marginBottom:8}}>{title.toUpperCase()}</div>
                      <p style={{fontSize:11,color:C.dust,lineHeight:1.75}}>{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div style={{borderTop:`1px solid ${C.shadow}`,background:C.earth,padding:"34px 24px"}}>
              <div style={{maxWidth:1160,margin:"0 auto"}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:C.parch,marginBottom:3}}>90+ Knowledge Domains</h2>
                <p style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:18}}>From medicine to philosophy to engineering — every field, open, censor-proof, permanently archived</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7}}>
                  {CATS.map(cat => (
                    <button key={cat.id} onClick={() => setSection("discover")}
                      style={{background:cat.flagship?"#f5d06008":C.bark,border:`1px solid ${cat.flagship?"#f5d06033":C.shadow}`,borderRadius:10,padding:"10px 9px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}
                      onMouseEnter={e => { e.currentTarget.style.background=`${cat.color}10`; e.currentTarget.style.borderColor=`${cat.color}44`; }}
                      onMouseLeave={e => { e.currentTarget.style.background=cat.flagship?"#f5d06008":C.bark; e.currentTarget.style.borderColor=cat.flagship?"#f5d06033":C.shadow; }}>
                      <div style={{fontSize:16,marginBottom:3}}>{cat.icon}</div>
                      <div style={{fontSize:8,fontFamily:"monospace",color:cat.color,lineHeight:1.3,letterSpacing:.4}}>{cat.name}</div>
                    </button>
                  ))}
                  <button style={{background:"transparent",border:`2px dashed ${C.shadow}`,borderRadius:10,padding:"10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                    <div style={{fontSize:16,color:C.dust}}>✦</div>
                    <div style={{fontSize:7,fontFamily:"monospace",color:C.dust}}>NEW CATEGORY</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div style={{padding:"60px 24px",textAlign:"center",background:C.soil}}>
              <div style={{maxWidth:620,margin:"0 auto"}}>
                <div style={{fontSize:42,marginBottom:14}}>🌍</div>
                <div style={{fontSize:7,fontFamily:"monospace",color:C.vine,letterSpacing:4,marginBottom:18}}>THE CORE PROMISE</div>
                <blockquote style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(17px,3vw,26px)",fontWeight:700,fontStyle:"italic",color:C.parch,lineHeight:1.45,marginBottom:22}}>
                  "Truth that is verified by the many cannot be buried by the few."
                </blockquote>
                <p style={{color:C.dust,fontSize:13,lineHeight:1.9,marginBottom:16}}>
                  VERIDAX exists because the most important ideas in human history have been silenced, bought, buried, and discredited — not because they were wrong, but because they were <span style={{color:C.parch}}>inconvenient to those in power.</span>
                </p>
                <p style={{color:C.dust,fontSize:12,lineHeight:1.85}}>
                  Here, knowledge lives permanently. <span style={{color:C.amber}}>Publish freely.</span> Earn what your ideas are worth. Leave a record that no corporation, government, or institution can erase. The <span style={{color:C.sprout}}>breakthrough</span> belongs to humanity — not to whoever owns the server.
                </p>
              </div>
            </div>
          </div>
        )}

        {section === "discover" && (
          <div style={{maxWidth:1100,margin:"0 auto",padding:"36px 24px"}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:C.parch,marginBottom:6}}>Discover</h1>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              {CATS.slice(0, 10).map(c => (
                <button key={c.id}
                  style={{background:C.bark,border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:20,padding:"4px 11px",fontSize:8,fontFamily:"monospace",cursor:"pointer",letterSpacing:1,transition:"all .2s"}}
                  onMouseEnter={e => { e.currentTarget.style.color=c.color; e.currentTarget.style.borderColor=`${c.color}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.color=C.dust; e.currentTarget.style.borderColor=C.shadow; }}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:14}}>
              {posts.map((p, i) => <div key={p.id} style={{animation:`fadein .35s ease ${i*.07}s both`}}><PostCard post={p} user={user} votes={postVotes[p.id]} disputes={postDisputes[p.id]} onValidate={setValidatingPost} onTokenize={setTokenizePost}/></div>)}
            </div>
          </div>
        )}

        {section === "psh" && (
          <div style={{maxWidth:920,margin:"0 auto",padding:"46px 24px"}}>
            <div style={{textAlign:"center",marginBottom:36}}>
              <div style={{fontSize:40,marginBottom:12}}>🌍</div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,5vw,38px)",fontWeight:900,color:"#f5d060",marginBottom:12,fontStyle:"italic"}}>Project Save Humanity</h1>
              <p style={{color:C.dust,fontSize:13,lineHeight:1.85,maxWidth:480,margin:"0 auto 24px"}}>The flagship open collaboration category. A global space for inventions and systems that could move civilization toward a healthier, freer, more advanced future.</p>
              <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
                {[{l:"PROPOSALS",v:"4,821",c:"#f5d060"},{l:"CONTRIBUTORS",v:"18,203",c:C.sprout},{l:"NATIONS",v:"94",c:C.sky},{l:"TOKENS",v:"341",c:C.copper}].map(({l,v,c}) => (
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontSize:19,fontFamily:"monospace",fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:8,marginBottom:30}}>
              {[["💧","Water & Sanitation","#60a5fa"],["☀","Clean Energy","#f5d060"],["🌿","Healthcare for All","#72c44a"],["📜","Education Reform","#a09070"],["🌾","Food Security","#a0c860"],["🔩","Humanitarian Engineering","#c87941"],["🛡","Anti-Corruption","#c85a45"],["⚙","Ethical AI","#5aabaa"],["🌱","Sustainability","#3a7a28"],["⚖","Justice Systems","#e8a830"],["🧠","Mental Health","#c090c0"],["🌒","Civilization Tech","#8090d0"]].map(([i,n,c]) => (
                <button key={n} style={{background:C.bark,border:`1px solid ${C.shadow}`,borderRadius:10,padding:"12px 10px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}
                  onMouseEnter={e => { e.currentTarget.style.background=`${c}10`; e.currentTarget.style.borderColor=`${c}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.background=C.bark; e.currentTarget.style.borderColor=C.shadow; }}>
                  <div style={{fontSize:19,marginBottom:5}}>{i}</div>
                  <div style={{fontSize:9,fontFamily:"monospace",color:c,letterSpacing:.5,lineHeight:1.4}}>{n}</div>
                </button>
              ))}
            </div>
            {(() => { const fp = posts.find(p => p.flagship); return fp && <PostCard post={fp} user={user} votes={postVotes[fp.id]} disputes={postDisputes[fp.id]} onValidate={setValidatingPost} onTokenize={setTokenizePost}/>; })()}

          </div>
        )}

        {section === "market" && (
          <div style={{maxWidth:940,margin:"0 auto",padding:"40px 24px"}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:C.parch,marginBottom:6}}>Knowledge Market</h1>
            <p style={{color:C.dust,fontSize:12,fontFamily:"monospace",marginBottom:24}}>Tokenized discoveries. Bonding curve pricing. Author earns a commission on every buy — automatically, forever.</p>
            <div style={{background:C.bark,border:`1px solid ${C.shadow}`,borderRadius:12,overflow:"hidden",marginBottom:22}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"10px 16px",borderBottom:`1px solid ${C.shadow}`,fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2}}>
                {["KNOWLEDGE ASSET","PRICE","24H","AUTHOR RATE","ACTION"].map(h => <div key={h}>{h}</div>)}
              </div>
              {tokens.map((t, i) => (
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"13px 16px",borderBottom:`1px solid ${C.shadow}`,alignItems:"center",transition:"background .2s",cursor:"pointer"}}
                  onMouseEnter={e => e.currentTarget.style.background=C.wood}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:t.col,boxShadow:`0 0 7px ${t.col}`,flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:t.col,fontWeight:700}}>⬡ {t.sym}</div>
                      <div style={{fontSize:9,color:C.dust}}>{t.name.length>38?t.name.slice(0,38)+"…":t.name}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,fontFamily:"monospace",color:C.parch,fontWeight:700}}>${t.price.toFixed(2)}</div>
                  <div style={{fontSize:11,fontFamily:"monospace",color:t.ch>0?C.sprout:C.bloom}}>{t.ch>0?"+":""}{t.ch}%</div>
                  <div style={{fontSize:9,fontFamily:"monospace",color:C.amber}}>{t.commission}%</div>
                  <button onClick={() => setBuyTokenSym(t.sym)} style={{fontSize:8,fontFamily:"monospace",color:C.amber,background:C.amberD,border:`1px solid ${C.amber}30`,borderRadius:6,padding:"4px 9px",cursor:"pointer",letterSpacing:1}}>BUY</button>
                </div>
              ))}
            </div>
            {/* Bonding Curve Mechanics */}
            <div style={{background:C.bark,border:`1px solid ${C.sky}28`,borderRadius:14,padding:"22px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontSize:7,fontFamily:"monospace",color:C.sky,letterSpacing:3}}>BONDING CURVE MECHANICS</span>
                <div style={{flex:1,height:1,background:`${C.sky}22`}}/>
              </div>
              <div style={{background:C.earth,border:`1px solid ${C.sky}22`,borderRadius:10,padding:"16px",marginBottom:14,textAlign:"center"}}>
                <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:3,marginBottom:8}}>PRICING FORMULA</div>
                <div style={{fontFamily:"monospace",fontSize:19,color:C.parch,fontWeight:700,letterSpacing:-0.5}}>
                  Price = 0.001 × Supply<sup style={{fontSize:11}}>1.38</sup>
                </div>
                <div style={{fontSize:10,color:C.dust,marginTop:10,lineHeight:1.75}}>
                  Price rises automatically as more people buy in. Falls as people sell.<br/>
                  No human decides the price — the math does, at every moment, transparently.
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:8,marginBottom:14}}>
                {[
                  {icon:"⬡",color:C.amber,title:"No Pre-Mine",body:"Zero tokens are created at launch for founders, VCs, or insiders. The very first buyer pays the same mathematical price as everyone else. No privileged early access."},
                  {icon:"📈",color:C.sky,title:"Early Believers Win",body:"The first people to recognize a discovery's importance get in cheapest. Price automatically rewards conviction before the mainstream catches on. No backdoor allocations."},
                  {icon:"🔗",color:C.sprout,title:"Author Earns Forever",body:"Every purchase automatically routes a category-locked commission directly to the original author's wallet. No invoices. No platform intermediary. No negotiations. The contract handles it, on every transaction, forever."},
                ].map(({icon,color,title,body}) => (
                  <div key={title} style={{background:C.earth,border:`1px solid ${color}18`,borderRadius:9,padding:"13px"}}>
                    <div style={{fontSize:18,marginBottom:6}}>{icon}</div>
                    <div style={{fontSize:8,fontFamily:"monospace",color,letterSpacing:.5,marginBottom:5}}>{title.toUpperCase()}</div>
                    <div style={{fontSize:10,color:C.dust,lineHeight:1.65}}>{body}</div>
                  </div>
                ))}
              </div>
              <div style={{background:`${C.bloom}0a`,border:`1px solid ${C.bloom}30`,borderRadius:9,padding:"13px 15px",fontSize:10,fontFamily:"monospace",color:C.dust,lineHeight:1.85}}>
                <div style={{color:C.bloom,marginBottom:6,letterSpacing:1,fontSize:8}}>CRITICAL DESIGN PRINCIPLE</div>
                Token price has <span style={{color:C.parch}}>absolutely zero effect</span> on the truth score or content integrity of the underlying post. If a well-funded actor tried to buy up all tokens and dump them to crash the price — the chain's consensus record remains <span style={{color:C.parch}}>completely unchanged</span>. A crashed token does not discredit the research. This severs the link between <span style={{color:C.bloom}}>financial manipulation</span> and <span style={{color:C.parch}}>reputational damage</span>.
              </div>
            </div>

            {/* Commission Rate Table */}
            <div style={{background:C.bark,border:`1px solid ${C.sprout}28`,borderRadius:14,padding:"22px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <span style={{fontSize:7,fontFamily:"monospace",color:C.sprout,letterSpacing:3}}>AUTHOR COMMISSION RATES BY CATEGORY</span>
                <div style={{flex:1,height:1,background:`${C.sprout}22`}}/>
              </div>
              <p style={{fontSize:11,color:C.dust,lineHeight:1.8,marginBottom:14}}>
                Commission rates are <span style={{color:C.parch}}>locked permanently at the moment of tokenization</span>. They reflect proximity to human survival — the more directly a field impacts life, the higher the rate. No platform can change them. No contract can renegotiate them.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:7,marginBottom:14}}>
                {[
                  {cat:"Medicine",          rate:8,    icon:"🌿", color:"#88d068"},
                  {cat:"Project Save Humanity", rate:8, icon:"🌍", color:"#f5d060"},
                  {cat:"Climate Science",   rate:7.5,  icon:"🌦", color:"#72c44a"},
                  {cat:"Neuroscience",      rate:7,    icon:"🍄", color:"#d0a068"},
                  {cat:"Biology",           rate:7,    icon:"🦋", color:"#72c44a"},
                  {cat:"Energy",            rate:6.5,  icon:"☀",  color:"#e8a830"},
                  {cat:"Agriculture",       rate:6,    icon:"🌾", color:"#a0c860"},
                  {cat:"Engineering",       rate:5.5,  icon:"🔩", color:"#c87941"},
                  {cat:"Physics",           rate:5.5,  icon:"⚛",  color:"#5aabaa"},
                  {cat:"Artificial Intelligence", rate:5, icon:"⚙", color:"#5aabaa"},
                  {cat:"Economics",         rate:4,    icon:"⚖",  color:"#c87941"},
                  {cat:"Law & Governance",  rate:3.5,  icon:"🏛", color:"#e8a830"},
                  {cat:"Philosophy",        rate:2.5,  icon:"🪴", color:"#a09070"},
                  {cat:"Education",         rate:2.5,  icon:"📜", color:"#a09070"},
                ].map(({cat,rate,icon,color}) => (
                  <div key={cat} style={{background:C.earth,border:`1px solid ${color}18`,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:13}}>{icon}</span>
                      <span style={{fontSize:9,color:C.dust,fontFamily:"monospace"}}>{cat}</span>
                    </div>
                    <span style={{fontSize:13,fontFamily:"monospace",fontWeight:700,color,flexShrink:0}}>{rate}%</span>
                  </div>
                ))}
              </div>
              <div style={{background:C.sproutD,border:`1px solid ${C.sprout}22`,borderRadius:9,padding:"10px 14px",fontSize:10,fontFamily:"monospace",color:C.dust,lineHeight:1.85}}>
                <span style={{color:C.sprout}}>✦</span> A medical researcher whose discovery generates $1M in token volume automatically receives <span style={{color:C.parch}}>$80,000</span> — directly to their wallet, with no middlemen, no invoices, no delay. At $10M volume over a decade: <span style={{color:C.parch}}>$800,000</span>. The idea earns what it deserves, at the scale of its impact.
              </div>
            </div>

            {/* AND-gate section */}
            <div style={{background:C.bark,border:`1px solid ${C.amber}33`,borderRadius:14,padding:"22px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <span style={{fontSize:7,fontFamily:"monospace",color:C.amber,letterSpacing:3}}>THE FIVE TOKENIZATION GATES</span>
                <div style={{flex:1,height:1,background:`${C.amber}22`}}/>
              </div>
              <p style={{fontSize:11,color:C.dust,lineHeight:1.8,marginBottom:16}}>
                When a post climbs high enough in community trust it becomes eligible for tokenization. But it cannot be tokenized by clearing just one or two metrics — it must simultaneously clear <span style={{color:C.parch}}>all five of these gates at the same time.</span>
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
                {[
                  {label:"10,000 upvotes",     icon:"▲", color:C.sprout,  sub:"minimum community endorsement"},
                  {label:"200 peer citations",  icon:"◎", color:C.sky,     sub:"other published works referencing this one"},
                  {label:"2,500 validations",   icon:"✓", color:C.amber,   sub:"cross-cluster, reputation-weighted"},
                  {label:"72% diversity index", icon:"◈", color:C.copper,  sub:"Shannon entropy across all 8 clusters"},
                  {label:"88% trust score",     icon:"⬡", color:"#d0a068", sub:"65% raw ratio + 35% diversity"},
                ].map(g => (
                  <div key={g.label} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.earth,border:`1px solid ${g.color}22`,borderRadius:8}}>
                    <span style={{fontSize:12,color:g.color,flexShrink:0}}>{g.icon}</span>
                    <span style={{fontSize:11,fontFamily:"monospace",color:C.parch,fontWeight:700,minWidth:160}}>{g.label}</span>
                    <span style={{fontSize:9,color:C.dust}}>{g.sub}</span>
                  </div>
                ))}
              </div>
              <div style={{background:`${C.bloom}08`,border:`1px solid ${C.bloom}28`,borderRadius:9,padding:"11px 14px",fontSize:10,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
                <span style={{color:C.bloom}}>⬡</span> Meeting four out of five gates does nothing. <span style={{color:C.parch}}>All five must be met simultaneously.</span> This AND-gate design means you cannot game any single metric in isolation. Once a post crosses all five thresholds simultaneously, the community votes on whether to launch a knowledge token for it.
              </div>
            </div>

            <div style={{background:C.bark,border:`1px solid ${C.shadow}`,borderRadius:12,padding:"18px"}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:12}}>HOW IT PLAYS OUT</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
                {[{n:"01",t:"All Five Gates Clear",c:C.sky,d:"The post has simultaneously cleared all five thresholds. No shortcuts, no workarounds. The AND-gate design makes gaming any single metric futile."},
                  {n:"02",t:"Community Votes",c:C.amber,d:"Verified humans vote YES or NO to launch a token. Threshold: 66% YES. Symbol assigned. Author commission rate locked in by category."},
                  {n:"03",t:"Bonding Curve Launch",c:C.copper,d:"Price rises as more people buy in. Early recognizers of important discoveries get in cheapest. No fixed supply."},
                  {n:"04",t:"Author Earns Forever",c:C.sprout,d:"Every purchase automatically routes commission to the author's wallet. No invoices. No negotiations. No platform taking a cut."}].map(s => (
                  <div key={s.n} style={{background:C.earth,border:`1px solid ${C.shadow}`,borderRadius:9,padding:"13px"}}>
                    <div style={{fontSize:9,fontFamily:"monospace",color:s.c,letterSpacing:1,marginBottom:5}}>{s.n} · {s.t.toUpperCase()}</div>
                    <div style={{fontSize:11,color:C.dust,lineHeight:1.65}}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === "consensus" && (
          <div style={{maxWidth:960,margin:"0 auto",padding:"40px 24px"}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:C.parch,marginBottom:6}}>Validation & Consensus</h1>
            <p style={{color:C.dust,fontSize:12,fontFamily:"monospace",marginBottom:28}}>The most original mechanic in VERIDAX — where diversity of agreement matters more than volume.</p>

            {/* Formula hero */}
            <div style={{background:`linear-gradient(135deg,${C.card},${C.bark})`,border:`1px solid ${C.sky}33`,borderRadius:16,padding:"26px",marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:4,marginBottom:14}}>THE TRUST SCORE FORMULA</div>
              <div style={{fontFamily:"monospace",fontSize:"clamp(13px,3vw,18px)",color:C.parch,fontWeight:700,marginBottom:8}}>
                Trust Score = <span style={{color:C.amber}}>65%</span> × Raw Ratio + <span style={{color:C.sky}}>35%</span> × Diversity Index
              </div>
              <div style={{fontSize:10,color:C.dust,lineHeight:1.7,maxWidth:520,margin:"10px auto 0"}}>
                The Diversity Index is calculated using <span style={{color:C.parch}}>Shannon entropy</span> — a mathematical measure of how evenly spread validations are across all 8 independent clusters.
              </div>
            </div>

            {/* Two-column breakdown */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              <div style={{background:C.card,border:`1px solid ${C.amber}28`,borderRadius:12,padding:"18px"}}>
                <div style={{fontSize:9,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:8}}>RAW RATIO · 65%</div>
                <p style={{fontSize:11,color:C.dust,lineHeight:1.75}}>The simple approval percentage. What fraction of all validators chose to validate (versus dispute). Weighted by each validator's reputation score.</p>
              </div>
              <div style={{background:C.card,border:`1px solid ${C.sky}28`,borderRadius:12,padding:"18px"}}>
                <div style={{fontSize:9,fontFamily:"monospace",color:C.sky,letterSpacing:2,marginBottom:8}}>DIVERSITY INDEX · 35%</div>
                <p style={{fontSize:11,color:C.dust,lineHeight:1.75}}>Shannon entropy normalized across 8 clusters. Maximum score requires agreement spread evenly across <span style={{color:C.parch}}>all eight</span> — Scientific, Civil, Independent, Tech, Grassroots, Academic, Journalism, and Legal.</p>
              </div>
            </div>

            {/* Anti-coordination callout */}
            <div style={{background:`${C.bloom}08`,border:`1px solid ${C.bloom}30`,borderRadius:12,padding:"20px 22px",marginBottom:20}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:C.bloom,letterSpacing:2,marginBottom:8}}>WHY COORDINATION CAMPAIGNS BACKFIRE</div>
              <p style={{fontSize:12,color:C.dust,lineHeight:1.8,marginBottom:10}}>
                A corporation that deploys a bot army all tagged to one cluster would actually <span style={{color:C.parch}}>lower</span> the trust score of posts they target, not raise it. The math punishes coordination. 50,000 validations from one cluster scores <span style={{color:C.parch}}>lower</span> than 500 validations spread evenly across eight.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{background:C.earth,borderRadius:9,padding:"12px"}}>
                  <div style={{fontSize:9,fontFamily:"monospace",color:C.bloom,marginBottom:6}}>✗ COORDINATED ATTACK</div>
                  <div style={{fontSize:10,fontFamily:"monospace",color:C.dust,marginBottom:3}}>50,000 votes · 1 cluster</div>
                  <div style={{fontSize:12,fontFamily:"monospace",fontWeight:700,color:C.bloom}}>Trust: ~65%</div>
                  <div style={{height:4,background:C.shadow,borderRadius:2,marginTop:6,overflow:"hidden"}}>
                    <div style={{height:"100%",width:"65%",background:C.bloom,borderRadius:2}}/>
                  </div>
                </div>
                <div style={{background:C.earth,borderRadius:9,padding:"12px"}}>
                  <div style={{fontSize:9,fontFamily:"monospace",color:C.sprout,marginBottom:6}}>✓ ORGANIC CONSENSUS</div>
                  <div style={{fontSize:10,fontFamily:"monospace",color:C.dust,marginBottom:3}}>500 votes · 8 clusters</div>
                  <div style={{fontSize:12,fontFamily:"monospace",fontWeight:700,color:C.sprout}}>Trust: ~92%</div>
                  <div style={{height:4,background:C.shadow,borderRadius:2,marginTop:6,overflow:"hidden"}}>
                    <div style={{height:"100%",width:"92%",background:C.sprout,borderRadius:2}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Reputation weighting */}
            <div style={{background:C.card,border:`1px solid ${C.amber}22`,borderRadius:12,padding:"18px",marginBottom:20}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:8}}>REPUTATION WEIGHTING</div>
              <p style={{fontSize:11,color:C.dust,lineHeight:1.75,marginBottom:12}}>
                Each vote is weighted by the validator's reputation — earned over time through a track record of accurate validations. New accounts carry near-zero vote weight. You cannot buy reputation. You cannot transfer it. You cannot fake it with new wallets.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
                {[{label:"New wallet",weight:"0.01×",color:C.dust},{label:"6 months",weight:"0.1×",color:C.tan},{label:"1 year",weight:"0.4×",color:C.amber},{label:"2+ years",weight:"1.0×",color:C.sprout}].map(({label,weight,color}) => (
                  <div key={label} style={{background:C.wood,borderRadius:8,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:14,fontFamily:"monospace",fontWeight:700,color}}>{weight}</div>
                    <div style={{fontSize:8,fontFamily:"monospace",color:C.dust,marginTop:3}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,fontSize:10,fontFamily:"monospace",color:C.dust,lineHeight:1.7}}>
                A wallet maintained for 2 years with consistently accurate validations carries enormously more weight than one created yesterday. Sybil attacks — thousands of fake identities — are <span style={{color:C.parch}}>economically irrational</span>: those accounts would need years of accurate validations before meaningfully moving any trust score.
              </div>
            </div>

            {/* Live validation queue */}
            <div>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:4,marginBottom:14}}>LIVE VALIDATION QUEUE</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
                {posts.map((p, i) => (
                  <div key={p.id} style={{animation:`fadein .35s ease ${i*.07}s both`}}>
                    <PostCard post={p} user={user} votes={postVotes[p.id]} disputes={postDisputes[p.id]} onValidate={setValidatingPost} onTokenize={setTokenizePost}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === "security" && (
          <div style={{maxWidth:880,margin:"0 auto",padding:"40px 24px"}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:C.parch,marginBottom:6}}>Security Protocol</h1>
            <p style={{color:C.dust,fontSize:12,fontFamily:"monospace",marginBottom:26}}>Built to resist well-funded, organized, legally empowered adversaries — not just hackers.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:12,marginBottom:24}}>
              {[{icon:"🧬",t:"Proof of Humanity",c:C.sky,d:"ZK biometric verification. One human = one vote. Bot farms cannot scale. Corporate Sybil attacks are physically blocked at the identity layer."},
                {icon:"◈",t:"Diversity Consensus",c:C.sprout,d:"Trust scores require agreement across 8 independent ideological clusters. One-cluster flooding actually lowers the trust score."},
                {icon:"⛓",t:"Cryptographic Chain",c:C.amber,d:"Every block is hash-linked to the previous. Altering any record breaks every record after it. History is mathematically sealed."},
                {icon:"📡",t:"P2P Mesh Network",c:C.copper,d:"No server. No domain. No kill switch. 19,000+ independent nodes. No court order reaches them all simultaneously."},
                {icon:"🛡",t:"Suppression Vault",c:C.bloom,d:"Every takedown attempt and legal threat is permanently recorded as evidence. Suppression becomes public accountability."},
                {icon:"👁",t:"Full Transparency",c:C.tan,d:"Funding relationships, validation histories, and whale purchases are all publicly on-chain. Corruption has nowhere to hide."}].map(({icon,t,c,d}) => (
                <div key={t} style={{background:C.card,border:`1px solid ${c}28`,borderRadius:12,padding:"16px",transition:"border-color .2s"}}
                  onMouseEnter={e => e.currentTarget.style.borderColor=`${c}55`}
                  onMouseLeave={e => e.currentTarget.style.borderColor=`${c}28`}>
                  <div style={{fontSize:24,marginBottom:7}}>{icon}</div>
                  <div style={{fontSize:9,fontFamily:"monospace",color:c,letterSpacing:1,marginBottom:5}}>{t.toUpperCase()}</div>
                  <div style={{fontSize:11,color:C.dust,lineHeight:1.65}}>{d}</div>
                </div>
              ))}
            </div>
            <div style={{background:`linear-gradient(135deg,${C.canopy},${C.bark})`,border:`1px solid ${C.shadow}`,borderRadius:14,padding:"22px",textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:17,color:C.parch,lineHeight:1.5,marginBottom:10}}>
                "The platform doesn't fight censorship. It makes censorship mathematically impossible."
              </div>
              <p style={{color:C.dust,fontSize:12,lineHeight:1.7}}>No server to raid. No domain to seize. No check to write. No single lever to pull.</p>
            </div>
          </div>
        )}

        {section === "network" && (
          <div style={{maxWidth:880,margin:"0 auto",padding:"40px 24px"}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:C.parch,marginBottom:6}}>The Network</h1>
            <p style={{color:C.dust,fontSize:12,fontFamily:"monospace",marginBottom:20}}>Every installation is a node. No central server. No kill switch. The chain lives as long as one person runs it.</p>
            <NetCanvas h={160}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10,marginTop:20}}>
              {[{i:"📡",t:"Gossip Protocol",c:C.sky,d:"Blocks propagate P2P in seconds. No broadcast server required."},
                {i:"🌿",t:"No Kill Switch",c:C.sprout,d:"No domain to seize, no company to pressure. 19,000+ nodes."},
                {i:"⚡",t:"Light Node",c:C.amber,d:"Runs on a phone, Raspberry Pi, or old laptop."},
                {i:"🔒",t:"Tor Ready",c:C.copper,d:"Nodes can route through anonymizing networks."},
                {i:"🔗",t:"Immutable Chain",c:C.sprout,d:"Altering one block breaks every block after it."},
                {i:"🌍",t:"7 Regions",c:"#f5d060",d:"No single jurisdiction controls the truth."}].map(({i,t,c,d}) => (
                <div key={t} style={{background:C.card,border:`1px solid ${C.shadow}`,borderRadius:11,padding:"14px",transition:"border-color .2s"}}
                  onMouseEnter={e => e.currentTarget.style.borderColor=`${c}44`}
                  onMouseLeave={e => e.currentTarget.style.borderColor=C.shadow}>
                  <div style={{fontSize:22,marginBottom:5}}>{i}</div>
                  <div style={{fontSize:9,fontFamily:"monospace",color:c,letterSpacing:1,marginBottom:4}}>{t.toUpperCase()}</div>
                  <div style={{fontSize:11,color:C.dust,lineHeight:1.6}}>{d}</div>
                </div>
              ))}
            </div>

            {/* How the Network Works */}
            <div style={{marginTop:40}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:4,marginBottom:14}}>HOW THE NETWORK WORKS</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  {icon:"📡",color:C.sky,title:"You Are the Network",body:"Every person who installs or runs VERIDAX becomes a node on a peer-to-peer mesh network. There is no central server. There is no company that owns the data. There is no single domain that can be seized. When you open VERIDAX, your device is literally part of the network itself. If a corporation tried to shut it down, they would need to simultaneously delete it from every single device running it worldwide — which is mathematically and logistically impossible."},
                  {icon:"🗄",color:C.copper,title:"IPFS — Data Lives Everywhere",body:"Content is stored on IPFS — a decentralized file system where data lives across thousands of machines at once. Every piece of published information is cryptographically linked to the one before it in a blockchain, meaning no single block of information can be altered or deleted without breaking the entire chain and making the tampering immediately visible to every node."},
                  {icon:"🔊",color:C.sprout,title:"Gossip Protocol — Instant Global Spread",body:"New information spreads across the network automatically through a gossip protocol — one node tells a few peers, those peers tell a few more, and within seconds the entire global network has a copy. There is no broadcast server. There is no publisher. The truth moves on its own."},
                ].map(({icon,color,title,body}) => (
                  <div key={title} style={{background:C.card,border:`1px solid ${color}22`,borderRadius:14,padding:"22px 24px",display:"flex",gap:18,alignItems:"flex-start",transition:"border-color .2s"}}
                    onMouseEnter={e => e.currentTarget.style.borderColor=`${color}55`}
                    onMouseLeave={e => e.currentTarget.style.borderColor=`${color}22`}>
                    <div style={{fontSize:26,flexShrink:0,marginTop:2}}>{icon}</div>
                    <div>
                      <div style={{fontSize:9,fontFamily:"monospace",color,letterSpacing:1,marginBottom:8}}>{title.toUpperCase()}</div>
                      <p style={{fontSize:12,color:C.dust,lineHeight:1.85}}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{marginTop:20,background:`linear-gradient(135deg,${C.canopy},${C.bark})`,border:`1px solid ${C.shadow}`,borderRadius:14,padding:"22px",textAlign:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:16,color:C.parch,lineHeight:1.5,marginBottom:10}}>
                  "The chain lives as long as one person runs it."
                </div>
                <p style={{color:C.dust,fontSize:11,lineHeight:1.7}}>No server to raid. No domain to seize. No company to pressure. No single lever to pull. If a corporation tried to shut it down, they would need to simultaneously delete it from every device worldwide — which is mathematically and logistically impossible.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{borderTop:`1px solid ${C.shadow}`,background:C.earth,flexShrink:0}}>
        <div style={{maxWidth:1160,margin:"0 auto",padding:"30px 24px 22px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:20}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:24,height:24,borderRadius:6,background:`linear-gradient(135deg,${C.amber}28,${C.copper}18)`,border:`1px solid ${C.amber}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>⛓</div>
              <span style={{fontFamily:"'Palatino Linotype',serif",fontSize:13,fontWeight:700,color:C.parch}}>VERIDAX</span>
            </div>
            <p style={{fontSize:9,color:C.dust,fontFamily:"monospace",lineHeight:1.7}}>A decentralized, peer-to-peer knowledge platform. Publish freely. Earn what your ideas are worth. Leave a record that cannot be erased.</p>
          </div>
          {[{h:"Platform",ls:["Discover","★ Save Humanity","Knowledge Market","Import Substack","Submit Research"]},
            {h:"Security",ls:["Proof of Humanity","Defense Layers","Suppression Vault","Open Source","Run a Node"]},
            {h:"Network",ls:["19,203 Nodes Live","P2P Protocol","IPFS Storage","Tor Support","Light Node"]},
            {h:"Mission",ls:["About","Manifesto","Roadmap","Community","Contact"]}].map(col => (
            <div key={col.h}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:8}}>{col.h.toUpperCase()}</div>
              {col.ls.map(l => (
                <div key={l} style={{fontSize:10,fontFamily:"monospace",color:C.dust,padding:"2px 0",cursor:"pointer",transition:"color .2s"}}
                  onMouseEnter={e => e.currentTarget.style.color=C.tan}
                  onMouseLeave={e => e.currentTarget.style.color=C.dust}>{l}</div>
              ))}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{borderTop:`1px solid ${C.shadow}`,borderBottom:`1px solid ${C.shadow}`,padding:"11px 24px"}}>
          <div style={{maxWidth:1160,margin:"0 auto",display:"flex",gap:0,flexWrap:"wrap",justifyContent:"center"}}>
            {[{l:"NODES",v:liveStats.nodes,c:C.sprout},{l:"EXPERTS",v:liveStats.experts,c:C.amber},{l:"WORKS",v:liveStats.works,c:C.sky},{l:"BLOCKED",v:4821,c:C.sprout},{l:"TOKENS",v:liveStats.tokens,c:C.copper},{l:"AUTHOR EARNINGS",v:"$284K",c:"#f5d060"}].map(({l,v,c},i,arr) => (
              <div key={l} style={{textAlign:"center",padding:"0 16px",borderRight:i<arr.length-1?`1px solid ${C.shadow}`:"none"}}>
                <div key={v} style={{fontSize:13,fontFamily:"monospace",fontWeight:700,color:c,lineHeight:1,animation:"numtick .25s ease"}}>{typeof v === "number" ? v.toLocaleString() : v}</div>
                <div style={{fontSize:6,fontFamily:"monospace",color:C.dust,letterSpacing:1,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation — quiet, at the very bottom */}
        <DonateSection/>

        <div style={{borderTop:`1px solid ${C.shadow}`,padding:"11px 24px",textAlign:"center"}}>
          <div style={{fontSize:7,fontFamily:"monospace",color:"#181828",letterSpacing:3}}>
            VERIDAX PROTOCOL · OPEN SOURCE · DECENTRALIZED · P2P · NO KILL SWITCH · NO ADS · NO CORPORATE FUNDING
          </div>
        </div>
      </footer>

      {showJoin && <JoinModal accounts={accounts} onClose={() => setShowJoin(false)} onJoin={v => { setAccounts(prev => [...prev, v]); setUser(v); setShowJoin(false); }} onSwitchToLogin={() => setShowLogin(true)}/>}
      {showLogin && <LoginModal accounts={accounts} onClose={() => setShowLogin(false)} onLogin={v => { setUser(v); setShowLogin(false); }} onSwitchToJoin={() => setShowJoin(true)}/>}
      {showProfile && user && <ProfileModal user={user} onClose={() => setShowProfile(false)} onLogout={() => setUser(null)}/>}
      {showSub && <SubModal onClose={() => setShowSub(false)}/>}
      {showPublish && user && <PublishModal user={user} onClose={() => setShowPublish(false)} onPublish={handlePublish}/>}
      {tokenizePost && postVotes[tokenizePost.id] && (
        <TokenizeModal
          post={tokenizePost}
          votes={postVotes[tokenizePost.id]}
          disputes={postDisputes[tokenizePost.id]}
          user={user}
          onClose={() => setTokenizePost(null)}
          onTokenized={handleTokenized}
        />
      )}
      {buyToken && <BuyModal token={buyToken} user={user} onClose={() => setBuyTokenSym(null)} onBought={handleBought}/>}
      {validatingPost && postVotes[validatingPost.id] && (
        <ValidationModal
          post={validatingPost}
          votes={postVotes[validatingPost.id]}
          disputes={postDisputes[validatingPost.id]}
          user={user}
          hasVoted={userVotes[validatingPost.id] || null}
          onClose={() => setValidatingPost(null)}
          onVote={type => handleVote(validatingPost.id, type)}
        />
      )}
    </div>
  );
}
