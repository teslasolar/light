#!/usr/bin/env node
const fs=require('fs')
const {createVM}=require('../src/runtime')
const {resolve,list}=require('../src/templates')
const {createMCP}=require('../src/mcp')
const {EMOJI_OPS,RING_NAMES,BUS_GLY}=require('../src/ops')

const args=process.argv.slice(2)
const cmd=args[0]||'repl'

const vm=createVM()
const mcp=createMCP()

function run(src){
  vm.reset()
  const prog=vm.parse(src)
  return vm.exec(prog)
}

switch(cmd){
  case'run':{
    const file=args[1]
    if(!file){console.error('usage: light run <file.light>');process.exit(1)}
    const src=fs.readFileSync(file,'utf-8')
    run(src);break}

  case'eval':{
    const expr=args.slice(1).join(' ')
    if(!expr){console.error('usage: light eval "🔻 4.0 42 💡🧵 4.0 👁"');process.exit(1)}
    run(expr.replace(/\s*\|\s*/g,'\n'));break}

  case'template':case't':{
    const name=args[1]
    if(!name||name==='list'){console.log('Templates:',list().join(', '));break}
    const params={}
    for(let i=2;i<args.length;i++){const[k,v]=args[i].split('=');if(k&&v)params[k]=isNaN(v)?v:+v}
    const src=resolve(name,params)
    if(!src){console.error(`Unknown template: ${name}\nAvailable: ${list().join(', ')}`);process.exit(1)}
    console.log(`\n; template: ${name}`)
    console.log(src)
    console.log(`\n; output:`)
    run(src);break}

  case'pipe':case'p':{
    const chain=args.slice(1).map(a=>{const[name,...kvs]=a.split(':');const params={};kvs.forEach(kv=>{const[k,v]=kv.split('=');if(k&&v)params[k]=isNaN(v)?v:+v});return{template:name,params}})
    const r=mcp.handle('pipe',{chain})
    if(r.error){console.error(r.error);break}
    r.chain.forEach(s=>{console.log(`\n─── ${s.template} ───`);s.log.forEach(l=>console.log(l))});break}

  case'mcp':{
    const tool=args[1]||'sys'
    const params={}
    for(let i=2;i<args.length;i++){const[k,...v]=args[i].split('=');if(k)params[k]=v.join('=')}
    if(tool==='help'){console.log('MCP Tools:');Object.entries(mcp.tools).forEach(([n,t])=>console.log(`  ${n.padEnd(18)} ${t.desc}`));break}
    const r=mcp.handle(tool,params)
    console.log(JSON.stringify(r,null,2));break}

  case'ops':{
    console.log('\n  LIGHT Emoji Opcodes\n')
    console.log('  Emoji  PRASM  Prime  Description')
    console.log('  ─────  ─────  ─────  ───────────')
    const descs={NOP:'dark/noop',LD:'absorb/load',ST:'emit/store',ADD:'interfere/add',MUL:'lens/multiply',ATT:'filter/attend',VAL:'spectrum/tag',PLN:'cavity/plan',MDL:'entangle/model',OBS:'reflect/observe',JMP:'redirect/jump',CMP:'compare λ',JEQ:'resonate/if=',JNE:'scatter/if≠',JGT:'amplify/if>',INT:'alarm/interrupt',REC:'nest/recurse',UNR:'unnest/return',EMT:'radiate/emit',RSN:'tune/resonate',SLP:'dim/sleep',DRM:'fluoresce/dream',WAK:'excite/wake',ABT:'quench/abort',FRZ:'freeze/dorsal',CLR:'bleach/clear',DIE:'annihilate/halt',GEO:'diffract/geometry',PHI:'cohere/golden',PSI:'self-ref/loop',TRT:'trit rotate',TNE:'trit negate',TAN:'trit AND',TOR:'trit OR',TCN:'trit consensus',TPV:'PVDF read'}
    for(const[e,[mn,p]]of Object.entries(EMOJI_OPS))console.log(`  ${e.padEnd(5)}  ${mn.padEnd(5)}  ${String(p).padEnd(5)}  ${descs[mn]||''}`)
    console.log(`\n  Rings: ${Object.entries(require('../src/ops').RING_PRE).map(([e,i])=>`${e} R${i}`).join('  ')}`)
    console.log(`  Buses: ${Object.entries(BUS_GLY).map(([e,b])=>`${e} ${b}`).join('  ')}\n`);break}

  case'repl':{
    const readline=require('readline')
    const rl=readline.createInterface({input:process.stdin,output:process.stdout,prompt:'light> '})
    console.log('LIGHT REPL · 38 opcodes · 888 registers · type "help" or emoji')
    rl.prompt()
    rl.on('line',line=>{
      line=line.trim()
      if(!line){rl.prompt();return}
      if(line==='help'){console.log('  run <file>     run a .light file\n  eval <expr>    run inline emoji\n  t <name> k=v   run template\n  p t1:k=v t2    pipe templates\n  ops            opcode table\n  mcp <tool>     call MCP tool\n  exit           quit');rl.prompt();return}
      if(line==='exit'||line==='quit'){rl.close();return}
      if(line==='ops'){process.argv=['','','ops'];require('./light.js');rl.prompt();return}
      try{run(line.replace(/\s*\|\s*/g,'\n'))}catch(e){console.error(e.message)}
      rl.prompt()
    });break}

  default:
    console.log(`LIGHT — the photonic programming language

  light run <file.light>          run a file
  light eval "🔻 4.0 42 👁"       eval inline
  light template <name> k=v       run template with params
  light pipe t1:k=v t2:k=v       chain templates
  light mcp <tool> k=v            call MCP tool
  light ops                       opcode table
  light repl                      interactive REPL
  light help                      this message`)
}
