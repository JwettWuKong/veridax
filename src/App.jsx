import { useState, useEffect, useRef } from "react";

const C = {
  soil:"#04050a", earth:"#07080e", bark:"#0d0e18", wood:"#111220",
  canopy:"#0e1518", card:"#0f1018", border:"#1a1b2e", shadow:"#181828",
  amber:"#e8a830", amberD:"#e8a83014", sun:"#f5d060", sunD:"#f5d06010",
  copper:"#c87941", vine:"#3a7a28", vineD:"#3a7a2810",
  sprout:"#72c44a", sproutD:"#72c44a0e", sky:"#5aabaa", skyD:"#5aabaa10",
  bloom:"#c85a45", parch:"#e0d8c0", tan:"#a09070", dust:"#585040",
};

const POSTS = [
  { id:"p1", cat:"Project Save Humanity", icon:"💧", color:"#f5d060", flagship:true,
    title:"Open-Source Desalination Unit: $40/Family, 48hr Deploy",
    summary:"Modular solar-powered desalination for disaster zones. Full schematics, BOM, and deployment protocol. Field-tested on 3 continents.",
    author:"Dr. Amara Osei", field:"Humanitarian Engineering", verified:true, substack:false,
    token:"H2OPEN", price:142.80, change:18.4, up:18203, cite:341, valid:4821 },
  { id:"p2", cat:"Artificial Intelligence", icon:"⚙", color:"#5aabaa",
    title:"Bias Detection Framework for LLM Governance",
    summary:"Open standard for auditing AI systems for systemic bias and corporate capture. Community-run audit protocol included.",
    author:"Prof. Yuki Tanaka", field:"AI Ethics", verified:true, substack:true,
    token:"AISAFE", price:89.20, change:7.1, up:12401, cite:289, valid:3102 },
  { id:"p3", cat:"Medicine", icon:"🌿", color:"#88d068",
    title:"mRNA Reprogramming for Cellular Senescence Reversal",
    summary:"3-year independent study: modified mRNA vectors reduce inflammatory markers in aged tissue by 40%. No pharma funding. All data open.",
    author:"Dr. Fatima Al-Rashid", field:"Molecular Biology", verified:true, substack:true,
    token:"LONGEVX", price:218.50, change:31.2, up:21890, cite:512, valid:6210 },
  { id:"p4", cat:"Climate Science", icon:"🌦", color:"#72c44a",
    title:"Biochar Distributed Grid: Scalable Carbon Sequestration",
    summary:"Protocol for distributed biochar production. 10-12x more efficient per hectare than reforestation. Tested in 14 communities.",
    author:"Marcus Velde", field:"Climate Systems", verified:true, substack:false,
    token:"BIOCARB", price:67.40, change:12.8, up:9840, cite:198, valid:2340 },
];

const TOKENS = [
  { sym:"LONGEVX", name:"Cellular Senescence Reversal", price:218.50, ch:31.2, col:"#88d068" },
  { sym:"H2OPEN",  name:"Open Desalination Protocol",   price:142.80, ch:18.4, col:"#f5d060" },
  { sym:"MESHNET", name:"Decentralized Mesh Internet",  price:178.90, ch:22.6, col:"#5aabaa" },
  { sym:"QUANTM",  name:"Quantum Error Correction",     price:312.40, ch:44.1, col:"#c87941" },
  { sym:"AISAFE",  name:"AI Governance Framework",      price:89.20,  ch:7.1,  col:"#e8a830" },
  { sym:"BIOCARB", name:"Biochar Carbon Protocol",      price:67.40,  ch:12.8, col:"#72c44a" },
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

function Ticker() {
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
  const items = [...TOKENS, ...TOKENS];
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

function PostCard({ post }) {
  const [hov, setHov] = useState(false);
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
        <div style={{display:"flex",gap:12,marginBottom:10}}>
          <span style={{fontSize:9,fontFamily:"monospace",color:C.sprout}}>▲ {nf(post.up)}</span>
          <span style={{fontSize:9,fontFamily:"monospace",color:C.sky}}>◎ {post.cite}</span>
          <span style={{fontSize:9,fontFamily:"monospace",color:C.amber}}>✓ {nf(post.valid)}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",background:`${post.color}0a`,border:`1px solid ${post.color}22`,borderRadius:7}}>
          <span style={{fontSize:11,fontFamily:"monospace",color:post.color,fontWeight:700}}>⬡ {post.token}</span>
          <span style={{fontSize:11,color:C.parch,fontFamily:"monospace"}}>${post.price.toFixed(2)}</span>
          <span style={{fontSize:9,color:C.sprout,fontFamily:"monospace"}}>+{post.change}%</span>
        </div>
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

function JoinModal({ onClose, onJoin, onSwitchToLogin, accounts }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [field, setField] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const handleStep2 = () => {
    if (!field.trim()) { setErrors({ field: "Please select or enter your field." }); return; }
    setErrors({});
    const profile = { username: username.trim(), email: email.trim(), password, field: field.trim(), joined: new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}) };
    onJoin(profile);
    setStep(3);
  };

  const Steps = () => (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:20}}>
      {[1,2,3].map(n => (
        <div key={n} style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"monospace",fontWeight:700,
            background: step>n ? C.sprout : step===n ? C.amber : "transparent",
            border:`1px solid ${step>n ? C.sprout : step===n ? C.amber : C.shadow}`,
            color: step>=n ? C.bark : C.dust,
          }}>{step>n?"✓":n}</div>
          {n<3 && <div style={{width:24,height:1,background:step>n?C.sprout:C.shadow}}/>}
        </div>
      ))}
      <span style={{fontSize:8,fontFamily:"monospace",color:C.dust,marginLeft:4}}>
        {step===1?"ACCOUNT":step===2?"EXPERTISE":"DONE"}
      </span>
    </div>
  );

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000cc",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.amber}44`,borderRadius:20,padding:28,maxWidth:420,width:"100%",position:"relative",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${C.amber},${C.vine})`,borderRadius:2,marginBottom:18}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10,zIndex:1}}>✕</button>

        <Steps/>

        {step === 1 && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Create your account</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.7,marginBottom:18}}>Join a network of experts, researchers, journalists, scientists, and truth-seekers publishing freely — without gatekeepers, censorship, or corporate interference.</p>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>USERNAME</label>
            <input value={username} onChange={e => { setUsername(e.target.value); setErrors(v=>({...v,username:""})); }}
              placeholder="Letters, numbers, underscores"
              style={{...inputStyle(username.trim(), errors.username)}}/>
            <FieldError msg={errors.username}/>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>EMAIL</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(v=>({...v,email:""})); }}
              placeholder="you@example.com"
              style={{...inputStyle(email.includes("@") && email.includes("."), errors.email)}}/>
            <FieldError msg={errors.email}/>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>PASSWORD</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={password}
                onChange={e => { setPassword(e.target.value); setErrors(v=>({...v,password:""})); }}
                placeholder="Min. 8 characters"
                style={{...inputStyle(password.length>=8, errors.password), paddingRight:50}}/>
              <button onClick={() => setShowPw(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.dust,cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>
                {showPw?"HIDE":"SHOW"}
              </button>
            </div>
            {password.length > 0 && (
              <div style={{display:"flex",gap:3,marginTop:6,marginBottom:4}}>
                {[1,2,3].map(i => <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=pwStrength?pwColors[pwStrength]:`${C.shadow}`}}/>)}
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
              <button onClick={() => setShowConfirm(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.dust,cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>
                {showConfirm?"HIDE":"SHOW"}
              </button>
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

        {step === 2 && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Your expertise</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.7,marginBottom:18}}>This shapes how your profile is shown and which discoveries you're invited to validate.</p>

            <label style={{display:"block",fontSize:8,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:5}}>YOUR FIELD</label>
            <input value={field} onChange={e => { setField(e.target.value); setErrors({}); }}
              placeholder="e.g. Climate Engineering, Molecular Biology…"
              style={{...inputStyle(field.trim(), errors.field), marginBottom:8}}/>
            <FieldError msg={errors.field}/>

            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:18}}>
              {["Medicine","Climate Science","AI & Ethics","Physics","Biology","Economics","Engineering","Law"].map(f => (
                <button key={f} onClick={() => { setField(f); setErrors({}); }}
                  style={{background:field===f?`${C.amber}18`:C.wood,border:`1px solid ${field===f?C.amber+"55":C.shadow}`,color:field===f?C.amber:C.dust,borderRadius:20,padding:"4px 10px",fontSize:8,fontFamily:"monospace",cursor:"pointer",transition:"all .2s"}}>
                  {f}
                </button>
              ))}
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setStep(1)} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>
                ← BACK
              </button>
              <button onClick={handleStep2} style={{flex:2,background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,transition:"all .2s"}}>
                CREATE ACCOUNT →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{textAlign:"center",padding:"10px 0 6px"}}>
            <div style={{fontSize:44,marginBottom:14}}>🌱</div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:21,color:C.parch,marginBottom:8}}>Welcome, {username}.</h2>
            <p style={{color:C.dust,fontSize:12,lineHeight:1.8,marginBottom:16}}>Your account has been created. You're now part of the network.</p>
            <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2,textAlign:"left"}}>
              <div style={{color:C.tan,marginBottom:4,letterSpacing:1}}>ACCOUNT SUMMARY</div>
              <div>⬡ <span style={{color:C.tan}}>Username:</span> @{username}</div>
              <div>⬡ <span style={{color:C.tan}}>Email:</span> {email}</div>
              <div>⬡ <span style={{color:C.tan}}>Field:</span> {field}</div>
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
          <div>⬡ <span style={{color:C.tan}}>Field:</span> {user.field}</div>
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

const NAV_ITEMS = [
  {id:"home",label:"Home"},
  {id:"discover",label:"Discover"},
  {id:"psh",label:"★ Save Humanity"},
  {id:"market",label:"Knowledge Market"},
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
  const [gossip, setGossip] = useState("19,203 nodes syncing · Chain height #89,403");

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
        button{transition:all .2s}
      `}</style>

      {/* GOSSIP */}
      <div style={{background:C.canopy,borderBottom:`1px solid ${C.shadow}`,padding:"5px 24px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <span style={{fontSize:7,fontFamily:"monospace",color:C.sprout,letterSpacing:3,flexShrink:0,animation:"pulse 2s infinite"}}>● LIVE</span>
        <span style={{fontSize:9,fontFamily:"monospace",color:C.dust,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{gossip}</span>
        <span style={{marginLeft:"auto",fontSize:9,fontFamily:"monospace",color:"#181828",flexShrink:0,animation:"blink 1s infinite"}}>█</span>
      </div>

      <Ticker/>

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
              <div onClick={() => setShowProfile(true)} style={{display:"flex",alignItems:"center",gap:5,background:C.vineD,border:`1px solid ${C.vine}30`,borderRadius:7,padding:"6px 10px",cursor:"pointer"}}>
                <span style={{fontSize:6,color:C.sprout,animation:"pulse 2s infinite"}}>●</span>
                <span style={{fontSize:9,fontFamily:"monospace",color:C.tan,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{user.username}</span>
              </div>
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
                <div style={{display:"flex",gap:0,justifyContent:"center",flexWrap:"wrap",background:C.bark,border:`1px solid ${C.shadow}`,borderRadius:14,padding:"15px",maxWidth:600,margin:"0 auto"}}>
                  {[{l:"EXPERTS",v:"24,182",c:C.amber},{l:"WORKS",v:"89,403",c:C.vine},{l:"NODES",v:"19,203",c:C.sky},{l:"IMPORTS",v:"3,841",c:C.copper},{l:"TOKENS",v:"3,401",c:"#f5d060"}].map(({l,v,c},i,arr) => (
                    <div key={l} style={{flex:"1 1 80px",textAlign:"center",padding:"0 10px",borderRight:i<arr.length-1?`1px solid ${C.shadow}`:"none"}}>
                      <div style={{fontSize:16,fontFamily:"monospace",fontWeight:700,color:c,marginBottom:2}}>{v}</div>
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
                {POSTS.map((p, i) => <div key={p.id} style={{animation:`fadein .4s ease ${i*.07}s both`}}><PostCard post={p}/></div>)}
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
              {POSTS.map((p, i) => <div key={p.id} style={{animation:`fadein .35s ease ${i*.07}s both`}}><PostCard post={p}/></div>)}
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
            <PostCard post={POSTS[0]}/>
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
              {TOKENS.map((t, i) => (
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"13px 16px",borderBottom:`1px solid ${C.shadow}`,alignItems:"center",transition:"background .2s",cursor:"pointer"}}
                  onMouseEnter={e => e.currentTarget.style.background=C.wood}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:t.col,boxShadow:`0 0 7px ${t.col}`,flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:t.col,fontWeight:700}}>⬡ {t.sym}</div>
                      <div style={{fontSize:9,color:C.dust}}>{t.name}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,fontFamily:"monospace",color:C.parch,fontWeight:700}}>${t.price.toFixed(2)}</div>
                  <div style={{fontSize:11,fontFamily:"monospace",color:t.ch>0?C.sprout:C.bloom}}>{t.ch>0?"+":""}{t.ch}%</div>
                  <div style={{fontSize:9,fontFamily:"monospace",color:C.amber}}>5–8%</div>
                  <button style={{fontSize:8,fontFamily:"monospace",color:C.amber,background:C.amberD,border:`1px solid ${C.amber}30`,borderRadius:6,padding:"4px 9px",cursor:"pointer",letterSpacing:1}}>BUY</button>
                </div>
              ))}
            </div>
            <div style={{background:C.bark,border:`1px solid ${C.shadow}`,borderRadius:12,padding:"18px"}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:12}}>HOW TOKENIZATION WORKS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
                {[{n:"01",t:"Cross Indisputable Threshold",c:C.sky,d:"10K upvotes · 200 citations · 2,500 validations · 72% diversity · 88% trust. All five must be met simultaneously."},
                  {n:"02",t:"Community Votes to Tokenize",c:C.amber,d:"Verified humans vote to launch a token. Symbol assigned. Author commission rate locked by category."},
                  {n:"03",t:"Bonding Curve Pricing",c:C.copper,d:"Price rises as more people buy in. Early recognizers of important discoveries get in cheapest."},
                  {n:"04",t:"Author Earns Forever",c:C.sprout,d:"Every purchase automatically routes commission to the author's wallet. No invoices. No negotiations."}].map(s => (
                  <div key={s.n} style={{background:C.earth,border:`1px solid ${C.shadow}`,borderRadius:9,padding:"13px"}}>
                    <div style={{fontSize:9,fontFamily:"monospace",color:s.c,letterSpacing:1,marginBottom:5}}>{s.n} · {s.t.toUpperCase()}</div>
                    <div style={{fontSize:11,color:C.dust,lineHeight:1.65}}>{s.d}</div>
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
            {[{l:"NODES",v:"19,203",c:C.sprout},{l:"EXPERTS",v:"24,182",c:C.amber},{l:"WORKS",v:"89,403",c:C.sky},{l:"BLOCKED",v:"4,821",c:C.sprout},{l:"TOKENS",v:"3,401",c:C.copper},{l:"AUTHOR EARNINGS",v:"$284K",c:"#f5d060"}].map(({l,v,c},i,arr) => (
              <div key={l} style={{textAlign:"center",padding:"0 16px",borderRight:i<arr.length-1?`1px solid ${C.shadow}`:"none"}}>
                <div style={{fontSize:13,fontFamily:"monospace",fontWeight:700,color:c,lineHeight:1}}>{v}</div>
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
    </div>
  );
}
