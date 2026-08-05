const {createVM}=require('../src/runtime')
const {resolve,list}=require('../src/templates')
const {resolve:resolveStd,list:listStd,run:runStd}=require('../src/stdlib')
const {prasmToLight,lightToPrasm,tokenCount}=require('../src/compiler')
const {def,call,pipe}=require('../src/fn')
const {createMCP}=require('../src/mcp')

let pass=0,fail=0
function test(name,fn){try{fn();pass++;console.log(`  ✓ ${name}`)}catch(e){fail++;console.error(`  ✗ ${name}: ${e.message}`)}}
function eq(a,b){if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(`${JSON.stringify(a)} !== ${JSON.stringify(b)}`)}

console.log('\nLIGHT test suite\n')
console.log('── Runtime ──')
const vm=createVM()

test('hello',()=>{const r=vm.exec(vm.parse('🔵\n🔻 4.0 "hello"\n💡🧵 4.0\n👁'));eq(r.filter(x=>x.emit).length,1)})
test('ADD',()=>{vm.reset();vm.exec(vm.parse('🔻 4.0 10\n🔻 4.1 32\n🌊 4.2 4.0 4.1'));eq(vm.REG[4][2],42)})
test('MUL',()=>{vm.reset();vm.exec(vm.parse('🔻 4.0 6\n🔻 4.1 7\n🔍 4.2 4.0 4.1'));eq(vm.REG[4][2],42)})
test('JEQ taken',()=>{vm.reset();const o=[];vm.exec(vm.parse('🔻 4.0 10\n⚖️ 4.0 10\n🎵 :Y\n💡🧵 "no"\n⚡ :E\n:Y 💡🧵 "yes"\n:E 👁'),{},m=>o.push(m));eq(o[0].includes('yes'),true)})
test('JGT taken',()=>{vm.reset();const o=[];vm.exec(vm.parse('🔻 4.0 20\n⚖️ 4.0 10\n📈 :B\n💡🧵 "s"\n⚡ :E\n:B 💡🧵 "b"\n:E 👁'),{},m=>o.push(m));eq(o[0].includes('b'),true)})
test('REC/UNR',()=>{vm.reset();const o=[];vm.exec(vm.parse('🔽\n🔽\n👁\n🔼\n🔼\n👁'),{},m=>o.push(m));eq(o[0].includes('depth=2'),true)})
test('PHI',()=>{vm.reset();vm.exec(vm.parse('🌀 5.0'));eq(Math.abs(vm.REG[5][0]-0.618)<0.001,true)})
test('SLP/WAK',()=>{vm.reset();vm.exec(vm.parse('🔻 4.0 "saved"\n🌑\n🔻 4.0 "gone"\n☀️'));eq(vm.REG[4][0],'saved')})
test('DIE halts',()=>{vm.reset();const o=[];vm.exec(vm.parse('☠️\n💡🧵 "nope"'),{},m=>o.push(m));eq(o.filter(m=>m.includes('emit')).length,0)})
test('VAL λ',()=>{vm.reset();vm.exec(vm.parse('🟢\n🔻 3.0 77\n🌈 3.1 3.0'));eq(vm.REG[3][1].λ,520)})
test('chained labels',()=>{vm.reset();const o=[];vm.exec(vm.parse('🔻 4.0 "w"\n⚖️ 4.0 "w"\n🎵 :W\n⚡ :C\n:W 🔻 4.1 "ok" ⚡ :D\n:C 🔻 4.1 "no"\n:D 💡🧵 4.1\n👁'),{},m=>o.push(m));eq(o[0].includes('ok'),true)})

console.log('\n── Templates ──')
test('resolve add',()=>{const s=resolve('add',{a:1,b:2});eq(s.includes('1'),true)})
test('list',()=>{eq(list().includes('hello'),true)})
test('invoice calc',()=>{vm.reset();const o=[];vm.exec(vm.parse(resolve('invoice',{qty:5,rate:100,tax_pct:0.1})),{},m=>o.push(m));eq(o.some(m=>m.includes('550')),true)})

console.log('\n── Stdlib ──')
test('stdlib list',()=>{eq(listStd().includes('abs'),true);eq(listStd().includes('phi'),true)})
test('stdlib max',()=>{const r=runStd('max',{a:10,b:20});eq(r.log.some(m=>m.includes('20')),true)})
test('stdlib sq',()=>{const r=runStd('sq',{x:7});eq(r.log.some(m=>m.includes('49')),true)})
test('stdlib assert_eq pass',()=>{const r=runStd('assert_eq',{actual:42,expected:42,label:'test'});eq(r.log.some(m=>m.includes('PASS')),true)})
test('stdlib assert_eq fail',()=>{const r=runStd('assert_eq',{actual:1,expected:2,label:'test'});eq(r.log.some(m=>m.includes('FAIL')),true)})
test('stdlib double',()=>{const r=runStd('double',{x:21});eq(r.log.some(m=>m.includes('42')),true)})

console.log('\n── Compiler ──')
test('prasm→light',()=>{const r=prasmToLight('LD R4.0 42');eq(r.includes('🔻'),true)})
test('light→prasm',()=>{const r=lightToPrasm('🔻 4.0 42');eq(r.includes('LD'),true)})
test('tokenCount',()=>{eq(tokenCount('🔻 4.0 42'),3)})

console.log('\n── Functions ──')
test('def + call',()=>{def('sq2','x','🔵\n🔻 4.0 {{x}}\n🔍 4.1 4.0 4.0\n💡🧵 4.1\n👁');const r=call('sq2',{x:6});eq(r.log.some(m=>m.includes('36')),true)})
test('call falls through to template',()=>{const r=call('phi',{});eq(r.log.some(m=>m.includes('0.618')),true)})
test('call falls through to stdlib',()=>{const r=call('double',{x:10});eq(r.log.some(m=>m.includes('20')),true)})
test('pipe',()=>{const r=pipe([{fn:'double',args:{x:5}},{fn:'phi',args:{}}]);eq(r.results.length,2)})

console.log('\n── MCP ──')
const mcp=createMCP()
test('mcp run',()=>{const r=mcp.handle('run',{src:'🔻 4.0 42\n💡🧵 4.0\n👁'});eq(r.results.filter(x=>x.emit).length,1)})
test('mcp template',()=>{const r=mcp.handle('template',{name:'add',params:{a:5,b:3}});eq(!!r.src,true)})
test('mcp std',()=>{const r=mcp.handle('std',{name:'sq',params:{x:9}});eq(r.log.some(m=>m.includes('81')),true)})
test('mcp compile',()=>{const r=mcp.handle('compile',{src:'LD R4.0 42',direction:'prasm2light'});eq(r.light.includes('🔻'),true)})
test('mcp list',()=>{const r=mcp.handle('list',{});eq(r.templates.length>0,true)})
test('mcp pipe',()=>{const r=mcp.handle('pipe',{chain:[{fn:'phi',args:{}},{fn:'hello',args:{}}]});eq(r.results.length,2)})
test('mcp schema',()=>{const s=mcp.schema();eq(!!s.run,true);eq(!!s.eval,true)})

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail)
