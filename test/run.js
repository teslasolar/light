const {createVM}=require('../src/runtime')
const {resolve,list}=require('../src/templates')
const {createMCP}=require('../src/mcp')

let pass=0,fail=0
function test(name,fn){
  try{fn();pass++;console.log(`  ✓ ${name}`)}
  catch(e){fail++;console.error(`  ✗ ${name}: ${e.message}`)}
}
function eq(a,b){if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(`${JSON.stringify(a)} !== ${JSON.stringify(b)}`)}

console.log('\nLIGHT test suite\n')

const vm=createVM()

test('parse + exec hello',()=>{
  const r=vm.exec(vm.parse('🔵\n🔻 4.0 "hello"\n💡🧵 4.0\n👁'))
  eq(r.filter(x=>x.emit).length,1)
})

test('ADD',()=>{
  vm.reset()
  vm.exec(vm.parse('🔻 4.0 10\n🔻 4.1 32\n🌊 4.2 4.0 4.1'))
  eq(vm.REG[4][2],42)
})

test('MUL',()=>{
  vm.reset()
  vm.exec(vm.parse('🔻 4.0 6\n🔻 4.1 7\n🔍 4.2 4.0 4.1'))
  eq(vm.REG[4][2],42)
})

test('CMP + JEQ branch taken',()=>{
  vm.reset()
  const out=[];vm.exec(vm.parse('🔻 4.0 10\n⚖️ 4.0 10\n🎵 :YES\n💡🧵 "no"\n⚡ :END\n:YES 💡🧵 "yes"\n:END 👁'),{},m=>out.push(m))
  eq(out[0].includes('yes'),true)
})

test('CMP + JGT branch',()=>{
  vm.reset()
  const out=[];vm.exec(vm.parse('🔻 4.0 20\n⚖️ 4.0 10\n📈 :BIG\n💡🧵 "small"\n⚡ :E\n:BIG 💡🧵 "big"\n:E 👁'),{},m=>out.push(m))
  eq(out[0].includes('big'),true)
})

test('REC/UNR depth',()=>{
  vm.reset()
  const out=[];vm.exec(vm.parse('🔽\n🔽\n👁\n🔼\n🔼\n👁'),{},m=>out.push(m))
  eq(out[0].includes('depth=2'),true)
  eq(out[1].includes('depth=0'),true)
})

test('PHI computes kappa',()=>{
  vm.reset()
  vm.exec(vm.parse('🌀 5.0'))
  const k=vm.REG[5][0]
  eq(Math.abs(k-0.618)<0.001,true)
})

test('SLP/WAK checkpoint',()=>{
  vm.reset()
  vm.exec(vm.parse('🔻 4.0 "saved"\n🌑\n🔻 4.0 "overwritten"\n☀️'))
  eq(vm.REG[4][0],'saved')
})

test('DIE halts',()=>{
  vm.reset()
  const out=[];vm.exec(vm.parse('🔻 0.0 1\n☠️\n💡🧵 0.0'),{},m=>out.push(m))
  eq(out.filter(m=>m.includes('emit')).length,0)
})

test('VAL tags with wavelength',()=>{
  vm.reset()
  vm.exec(vm.parse('🟢\n🔻 3.0 77\n🌈 3.1 3.0'))
  eq(vm.REG[3][1].λ,520)
})

test('chained label instructions',()=>{
  vm.reset()
  const out=[];vm.exec(vm.parse('🔻 4.0 "web"\n⚖️ 4.0 "web"\n🎵 :W\n⚡ :C\n:W 🔻 4.1 "web_ok" ⚡ :D\n:C 🔻 4.1 "cpu_ok"\n:D 💡🧵 4.1\n👁'),{},m=>out.push(m))
  eq(out[0].includes('web_ok'),true)
})

test('template resolve',()=>{
  const src=resolve('add',{a:10,b:32})
  eq(src.includes('10'),true)
  eq(src.includes('32'),true)
})

test('template list',()=>{
  eq(list().includes('hello'),true)
  eq(list().includes('invoice'),true)
})

test('MCP run tool',()=>{
  const mcp=createMCP()
  const r=mcp.handle('run',{src:'🔻 4.0 42\n💡🧵 4.0\n👁'})
  eq(r.results.filter(x=>x.emit).length,1)
})

test('MCP template tool',()=>{
  const mcp=createMCP()
  const r=mcp.handle('template',{name:'add',params:{a:5,b:3}})
  eq(!!r.src,true)
})

test('MCP pipe tool',()=>{
  const mcp=createMCP()
  const r=mcp.handle('pipe',{chain:[{template:'phi',params:{}},{template:'hello',params:{}}]})
  eq(r.chain.length,2)
})

test('MCP eval tool',()=>{
  const mcp=createMCP()
  const r=mcp.handle('eval',{expr:'🌀 5.0 | 💡🧵 5.0 | 👁'})
  eq(r.log.length>0,true)
})

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail)
