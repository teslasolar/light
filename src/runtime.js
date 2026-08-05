const {EMOJI_OPS,RING_PRE,BUS_GLY,RING_LAMBDA}=require('./ops')

const REG_COUNTS=[2,3,5,11,31,127,709]
const PHI=1.618033988749895,KS=1/PHI

function createVM(){
  const REG=Array.from({length:7},(_,i)=>Array(REG_COUNTS[i]).fill(0))
  const SPEC={RD:0,PC:0,BS:0,AR:0,SR:0,GM:0,FQ:7.83,VA:0,CF:1,KP:KS}
  const labels={},stack=[]
  let depth=0,halted=false

  function rget(s){
    if(typeof s==='number')return s
    const m=String(s).match(/^(\d)\.(\d+)$/)
    if(!m)return s
    const ring=+m[1],idx=+m[2]
    if(ring>=7||!REG[ring]||idx>=REG[ring].length)return parseFloat(s)||s
    return REG[ring][idx]
  }
  function rset(s,v){const m=s.match(/^(\d)\.(\d+)$/);if(m)REG[+m[1]][+m[2]]=v}
  function tryJSON(s){try{return JSON.parse(s)}catch{return s}}

  function parseLine(l,prog){
    const ring=Object.keys(RING_PRE).find(e=>l.startsWith(e))
    if(ring){l=l.slice(ring.length).trim();SPEC.RD=RING_PRE[ring]}
    const op=Object.keys(EMOJI_OPS).find(e=>l.startsWith(e))
    if(!op){prog.push({op:'RAW',args:[l]});return}
    let rest=l.slice(op.length).trim()
    let bus=null
    const busStart=Object.keys(BUS_GLY).find(e=>rest.startsWith(e))
    if(busStart){bus=BUS_GLY[busStart];rest=rest.slice(busStart.length).trim()}
    if(!bus){const busEnd=Object.keys(BUS_GLY).find(e=>rest.endsWith(e));if(busEnd){bus=BUS_GLY[busEnd];rest=rest.slice(0,-busEnd.length).trim()}}
    let tail=null
    for(const oe of Object.keys(EMOJI_OPS)){const idx=rest.indexOf(oe);if(idx>0){tail=rest.slice(idx);rest=rest.slice(0,idx).trim();break}}
    const args=rest.match(/(?:[^\s"]+|"[^"]*"|{[^}]*}|\[[^\]]*\])+/g)||[]
    prog.push({op:EMOJI_OPS[op][0],prime:EMOJI_OPS[op][1],args,bus,raw:l})
    if(tail)parseLine(tail,prog)
  }

  function parse(src){
    const lines=src.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith(';'))
    const prog=[]
    lines.forEach(l=>{
      if(l.startsWith(':')){const label=l.split(/\s/)[0];labels[label]=prog.length;if(l.split(/\s/).length>1)l=l.split(/\s/).slice(1).join(' ');else return}
      parseLine(l,prog)
    })
    return prog
  }

  function exec(prog,env={},log=console.log){
    SPEC.PC=0;halted=false;depth=0
    const out=[]
    let steps=0
    while(SPEC.PC<prog.length&&!halted&&steps++<5000){
      const ins=prog[SPEC.PC],a=ins.args
      switch(ins.op){
        case'NOP':break
        case'LD':rset(a[0],a.length>2?{ref:a[1],arg:tryJSON(a.slice(2).join(' '))}:env[a[1]]??tryJSON(a[1]??'0'));break
        case'ST':env[a[1]]=rget(a[0]);break
        case'ADD':rset(a[0],(+rget(a[1])||0)+(+rget(a[2])||0));break
        case'MUL':rset(a[0],(+rget(a[1])||0)*(+rget(a[2])||0));break
        case'ATT':rset(a[0],rget(a[1]));break
        case'VAL':rset(a[0],{val:rget(a[1]),λ:RING_LAMBDA[SPEC.RD]});break
        case'PLN':stack.push(tryJSON(a[0]));break
        case'MDL':rset(a[0],a.length>2?{op:a[1],args:a.slice(2).map(rget)}:rget(a[0]));break
        case'OBS':out.push({snap:REG.map(r=>[...r]),depth,spec:{...SPEC}});log(`👁 depth=${depth} κ=${SPEC.KP.toFixed(3)}`);break
        case'JMP':SPEC.PC=labels[a[0]]??SPEC.PC;continue
        case'CMP':SPEC.SR=rget(a[0])===tryJSON(a[1])?0:rget(a[0])>tryJSON(a[1])?1:-1;break
        case'JEQ':if(SPEC.SR===0){SPEC.PC=labels[a[0]]??SPEC.PC;continue}break
        case'JNE':if(SPEC.SR!==0){SPEC.PC=labels[a[0]]??SPEC.PC;continue}break
        case'JGT':if(SPEC.SR>0){SPEC.PC=labels[a[0]]??SPEC.PC;continue}break
        case'INT':SPEC.AR=Math.min(5,(SPEC.AR||0)+1);log(`🚨 alarm=${SPEC.AR} ${a.join(' ')}`);break
        case'REC':depth++;SPEC.RD=Math.min(6,SPEC.RD+1);break
        case'UNR':depth=Math.max(0,depth-1);SPEC.RD=Math.max(0,SPEC.RD-1);break
        case'EMT':{const v=a.map(x=>{const s=String(x);if(s.startsWith('{')&&s.includes(':')){return s.replace(/(\w+\.\w+)/g,m=>{const r=rget(m);return typeof r==='number'||typeof r==='object'?JSON.stringify(r):r===m?m:String(r)})}return rget(x)??tryJSON(x)});out.push({emit:v,bus:ins.bus||'A'});log(`💡 emit on Bus ${ins.bus||'A'}: ${JSON.stringify(v).slice(0,120)}`);break}
        case'RSN':SPEC.FQ=+(a[0]?.match(/^\d+\.\d+$/)?rget(a[0]):a[0])||SPEC.FQ;break
        case'SLP':env.__checkpoint={reg:REG.map(r=>[...r]),spec:{...SPEC}};log('🌑 checkpoint saved');break
        case'DRM':log('✨ dream cycle...');break
        case'WAK':{if(env.__checkpoint){const cp=env.__checkpoint;REG.forEach((r,i)=>r.forEach((_,j)=>r[j]=cp.reg[i][j]));const pc=SPEC.PC;Object.assign(SPEC,cp.spec);SPEC.PC=pc}log('☀️ restored');break}
        case'ABT':halted=true;log('🧯 aborted');break
        case'FRZ':log('🧊 frozen');break
        case'CLR':REG.forEach(r=>r.fill(0));SPEC.AR=0;SPEC.VA=0;log('🫧 cleared');break
        case'DIE':halted=true;log('☠️ halted');break
        case'GEO':SPEC.GM=+a[0]||0;log(`🔱 geo mode=${SPEC.GM}`);break
        case'PHI':SPEC.KP=KS;rset(a[0],SPEC.KP);break
        case'PSI':rset(a[0],rget(a[0]));log(`♾️ self-ref R${a[0]}`);break
        case'TRT':{const v=rget(a[0]);rset(a[0],v===1?0:v===0?-1:1)}break
        case'TNE':rset(a[0],-rget(a[0]));break
        case'TAN':rset(a[0],Math.min(rget(a[1]),rget(a[2])));break
        case'TOR':rset(a[0],Math.max(rget(a[1]),rget(a[2])));break
        case'TCN':{const vals=[rget(a[0]),rget(a[1]),rget(a[2])];rset(a[0],vals.sort()[1])}break
        case'TPV':log(`📡 PVDF read → ${a[0]}`);break
      }
      SPEC.PC++
    }
    return out
  }

  return{parse,exec,REG,SPEC,rget,rset,labels,reset(){REG.forEach(r=>r.fill(0));Object.assign(SPEC,{RD:0,PC:0,BS:0,AR:0,SR:0,GM:0,FQ:7.83,VA:0,CF:1,KP:KS});depth=0;halted=false;Object.keys(labels).forEach(k=>delete labels[k])}}
}

module.exports={createVM,PHI,KS}
