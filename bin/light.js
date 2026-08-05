#!/usr/bin/env node
const fs=require('fs')
const {createVM}=require('../src/runtime')
const {resolve,list}=require('../src/templates')
const {resolve:resolveStd,list:listStd,run:runStd}=require('../src/stdlib')
const {prasmToLight,lightToPrasm,minify,tokenCount}=require('../src/compiler')
const {def,call,pipe:fnPipe,listFns}=require('../src/fn')
const {createMCP}=require('../src/mcp')
const {EMOJI_OPS,RING_NAMES,BUS_GLY}=require('../src/ops')

const args=process.argv.slice(2)
const cmd=args[0]||'repl'
const vm=createVM()
const mcp=createMCP()

function run(src){vm.reset();return vm.exec(vm.parse(src))}

switch(cmd){
  case'run':{
    const file=args[1];if(!file){console.error('usage: light run <file.light>');process.exit(1)}
    run(fs.readFileSync(file,'utf-8'));break}

  case'eval':case'e':{
    const expr=args.slice(1).join(' ');if(!expr){console.error('usage: light eval "🔻 4.0 42 👁"');process.exit(1)}
    run(expr.replace(/\s*\|\s*/g,'\n'));break}

  case'template':case't':{
    const name=args[1]
    if(!name||name==='list'){console.log('Templates:',list().join(', '));break}
    const params={};for(let i=2;i<args.length;i++){const[k,v]=args[i].split('=');if(k&&v)params[k]=isNaN(v)?v:+v}
    const src=resolve(name,params);if(!src){console.error(`Unknown: ${name}\nAvailable: ${list().join(', ')}`);process.exit(1)}
    console.log(src+'\n');run(src);break}

  case'std':case's':{
    const name=args[1]
    if(!name||name==='list'){console.log('Stdlib:',listStd().join(', '));break}
    const params={};for(let i=2;i<args.length;i++){const[k,v]=args[i].split('=');if(k&&v)params[k]=isNaN(v)?v:+v}
    runStd(name,params);break}

  case'def':case'd':{
    const name=args[1],params=args[2],body=args.slice(3).join(' ')
    if(!name||!body){console.error('usage: light def <name> <params> <body>');break}
    def(name,params,body);console.log(`Defined: ${name}(${params})`);break}

  case'call':case'c':{
    const name=args[1];if(!name){console.error('usage: light call <name> k=v...');break}
    const a={};for(let i=2;i<args.length;i++){const[k,v]=args[i].split('=');if(k&&v)a[k]=isNaN(v)?v:+v}
    const r=call(name,a);if(r.error)console.error(r.error);break}

  case'pipe':case'p':{
    const chain=args.slice(1).map(a=>{const[name,...kvs]=a.split(':');const p={};kvs.forEach(kv=>{const[k,v]=kv.split('=');if(k&&v)p[k]=isNaN(v)?v:+v});return{fn:name,args:p}})
    const r=fnPipe(chain);if(r.error){console.error(r.error);break}
    r.results.forEach(s=>{console.log(`─── ${s.fn} ───`);s.log.forEach(l=>console.log(l))})
    if(r.final!=null)console.log(`\n═══ final: ${r.final}`);break}

  case'compile':{
    const file=args[1],dir=args[2]||'prasm2light'
    if(!file){console.error('usage: light compile <file> [prasm2light|light2prasm]');break}
    const src=fs.readFileSync(file,'utf-8')
    console.log(dir==='light2prasm'?lightToPrasm(src):prasmToLight(src))
    console.log(`\n; ${tokenCount(src)} tokens`);break}

  case'minify':case'm':{
    const file=args[1];if(!file){console.error('usage: light minify <file>');break}
    const src=fs.readFileSync(file,'utf-8'),min=minify(src)
    console.log(min);console.log(`\n; ${tokenCount(src)} → ${tokenCount(min)} tokens (${Math.round((1-tokenCount(min)/tokenCount(src))*100)}% reduction)`);break}

  case'mcp':{
    const tool=args[1]||'sys'
    if(tool==='help'||tool==='schema'){const s=mcp.schema();Object.entries(s).forEach(([n,t])=>console.log(`  ${n.padEnd(14)} ${t.description}`));break}
    const params={};for(let i=2;i<args.length;i++){const[k,...v]=args[i].split('=');if(k)params[k]=v.join('=')}
    console.log(JSON.stringify(mcp.handle(tool,params),null,2));break}

  case'ops':case'o':{
    console.log('\n  LIGHT Emoji Opcodes\n')
    const descs={NOP:'dark',LD:'absorb',ST:'emit',ADD:'interfere',MUL:'lens',ATT:'filter',VAL:'spectrum',PLN:'cavity',MDL:'entangle',OBS:'reflect',JMP:'redirect',CMP:'compare λ',JEQ:'resonate',JNE:'scatter',JGT:'amplify',INT:'alarm',REC:'nest',UNR:'unnest',EMT:'radiate',RSN:'tune',SLP:'dim',DRM:'fluoresce',WAK:'excite',ABT:'quench',FRZ:'freeze',CLR:'bleach',DIE:'annihilate',GEO:'diffract',PHI:'cohere',PSI:'self-ref',TRT:'trit rotate',TNE:'trit negate',TAN:'trit AND',TOR:'trit OR',TCN:'trit consensus',TPV:'PVDF read'}
    for(const[e,[mn,p]]of Object.entries(EMOJI_OPS))console.log(`  ${e.padEnd(5)} ${mn.padEnd(5)} p=${String(p).padEnd(4)} ${descs[mn]||''}`)
    break}

  case'list':case'l':{
    const all=listFns()
    console.log('Templates:',list().join(', '))
    console.log('Stdlib:',listStd().join(', '))
    if(all.defined.length)console.log('Defined:',all.defined.join(', '))
    break}

  case'repl':case'r':{
    const readline=require('readline')
    const rl=readline.createInterface({input:process.stdin,output:process.stdout,prompt:'light> '})
    console.log('LIGHT REPL · 38 ops · 888 regs · help for commands')
    rl.prompt()
    rl.on('line',line=>{
      line=line.trim();if(!line){rl.prompt();return}
      if(line==='exit'||line==='quit'){rl.close();return}
      if(line==='help'){console.log(`  run <file>        eval "emoji"       template <name> k=v
  std <name> k=v    pipe t1:k=v t2     compile <file>
  minify <file>     ops                list
  mcp <tool>        def/call           exit`);rl.prompt();return}
      if(line.startsWith('t ')){const p=line.slice(2).split(/\s+/),n=p[0],a={};p.slice(1).forEach(x=>{const[k,v]=x.split('=');a[k]=isNaN(v)?v:+v});const s=resolve(n,a)||resolveStd(n,a);if(s)run(s);else console.log('unknown:',n);rl.prompt();return}
      if(line.startsWith('s ')){const p=line.slice(2).split(/\s+/),n=p[0],a={};p.slice(1).forEach(x=>{const[k,v]=x.split('=');a[k]=isNaN(v)?v:+v});runStd(n,a);rl.prompt();return}
      try{run(line.replace(/\s*\|\s*/g,'\n'))}catch(e){console.error(e.message)}
      rl.prompt()
    });break}

  default:
    console.log(`LIGHT — the photonic programming language

  light run <file>              run .light file
  light eval "emoji"            eval inline (| = newline)
  light template <name> k=v     parameterized template
  light std <name> k=v          stdlib function
  light pipe t1:k=v t2:k=v     chain functions
  light compile <file> [dir]    PRASM↔LIGHT transpile
  light minify <file>           strip comments, count tokens
  light def <name> <params> <body>  define function
  light call <name> k=v         call function
  light mcp <tool> k=v          MCP tool interface
  light ops                     opcode table
  light list                    all available functions
  light repl                    interactive REPL`)
}
