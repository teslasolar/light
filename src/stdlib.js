const {createVM}=require('./runtime')

const STDLIB={
  // Math
  abs:`🔵\n🔻 4.0 {{x}}\n⚖️ 4.0 0\n📈 :POS\n🔻 4.1 -1\n🔍 4.0 4.0 4.1\n:POS 💡🧵 4.0\n👁`,
  max:`🔵\n🔻 4.0 {{a}}\n🔻 4.1 {{b}}\n⚖️ 4.0 {{b}}\n📈 :A\n💡🧵 4.1\n⚡ :E\n:A 💡🧵 4.0\n:E 👁`,
  min:`🔵\n🔻 4.0 {{a}}\n🔻 4.1 {{b}}\n⚖️ 4.0 {{b}}\n📈 :A\n💡🧵 4.1\n⚡ :E\n:A 💡🧵 4.0\n:E 👁`,
  clamp:`🔵\n🔻 4.0 {{x}}\n🔻 4.1 {{lo}}\n🔻 4.2 {{hi}}\n⚖️ 4.0 4.1\n📈 :CHK_HI\n💡🧵 4.1\n⚡ :E\n:CHK_HI ⚖️ 4.0 4.2\n📈 :E\n💡🧵 4.2\n⚡ :E\n:E 💡🧵 4.0\n👁`,
  lerp:`🔵\n🔻 4.0 {{a}}\n🔻 4.1 {{b}}\n🔻 4.2 {{t}}\n🔻 4.3 1\n🌊 4.3 4.3 4.2\n🔍 4.4 4.0 4.3\n🔍 4.5 4.1 4.2\n🌊 4.6 4.4 4.5\n💡🧵 4.6\n👁`,
  sq:`🔵\n🔻 4.0 {{x}}\n🔍 4.1 4.0 4.0\n💡🧵 4.1\n👁`,

  // Logic
  and:`🔵\n🔻 4.0 {{a}}\n🔻 4.1 {{b}}\n⚖️ 4.0 0\n🎵 :F\n⚖️ 4.1 0\n🎵 :F\n💡🧵 1\n⚡ :E\n:F 💡🧵 0\n:E 👁`,
  or:`🔵\n🔻 4.0 {{a}}\n🔻 4.1 {{b}}\n⚖️ 4.0 0\n💥 :T\n⚖️ 4.1 0\n💥 :T\n💡🧵 0\n⚡ :E\n:T 💡🧵 1\n:E 👁`,
  not:`🔵\n🔻 4.0 {{x}}\n⚖️ 4.0 0\n🎵 :T\n💡🧵 0\n⚡ :E\n:T 💡🧵 1\n:E 👁`,

  // Ring ops
  ring_classify:`🔵\n🔻 4.0 {{val}}\n⚖️ 4.0 100\n📈 :R5\n⚖️ 4.0 50\n📈 :R4\n⚖️ 4.0 20\n📈 :R3\n⚖️ 4.0 5\n📈 :R2\n⚖️ 4.0 1\n📈 :R1\n💡🧵 {ring:0,val:4.0}\n⚡ :E\n:R1 💡🧵 {ring:1,val:4.0} ⚡ :E\n:R2 💡🧵 {ring:2,val:4.0} ⚡ :E\n:R3 💡🧵 {ring:3,val:4.0} ⚡ :E\n:R4 💡🧵 {ring:4,val:4.0} ⚡ :E\n:R5 💡🧵 {ring:5,val:4.0}\n:E 👁`,

  // Constants
  phi:`🟣\n🌀 5.0\n💡🧵 5.0\n👁`,
  kappa_sq:`🟣\n🌀 5.0\n🔍 5.1 5.0 5.0\n💡🧵 5.1\n👁`,
  primes:`🔵\n🔻 4.0 2\n🔻 4.1 3\n🔻 4.2 5\n🔻 4.3 7\n🔻 4.4 11\n🔻 4.5 13\n🔻 4.6 17\n💡🧵 {p:[4.0,4.1,4.2,4.3,4.4,4.5,4.6]}\n👁`,

  // Assertions
  assert_eq:`🔵\n🔻 4.0 {{actual}}\n🔻 4.1 {{expected}}\n⚖️ 4.0 {{expected}}\n🎵 :PASS\n🚨⚗️ "FAIL:{{label}}"\n💡🧵 "FAIL:{{label}}"\n⚡ :E\n:PASS 💡🧵 "PASS:{{label}}"\n:E 👁`,
  assert_gt:`🔵\n🔻 4.0 {{actual}}\n⚖️ 4.0 {{threshold}}\n📈 :PASS\n🚨⚗️ "FAIL:{{label}}"\n💡🧵 "FAIL:{{label}}"\n⚡ :E\n:PASS 💡🧵 "PASS:{{label}}"\n:E 👁`,

  // Composition
  noop:`⚫\n👁`,
  identity:`🔵\n🔻 4.0 {{x}}\n💡🧵 4.0\n👁`,
  double:`🔵\n🔻 4.0 {{x}}\n🌊 4.1 4.0 4.0\n💡🧵 4.1\n👁`,
  triple:`🔵\n🔻 4.0 {{x}}\n🌊 4.1 4.0 4.0\n🌊 4.1 4.1 4.0\n💡🧵 4.1\n👁`,
}

function resolve(name,params={}){
  let src=STDLIB[name]
  if(!src)return null
  for(const[k,v]of Object.entries(params))src=src.replace(new RegExp(`\\{\\{${k}\\}\\}`,'g'),String(v))
  return src
}

function list(){return Object.keys(STDLIB)}

function run(name,params={}){
  const src=resolve(name,params)
  if(!src)return null
  const vm=createVM()
  const out=[]
  const results=vm.exec(vm.parse(src),{},m=>out.push(m))
  return{log:out,results,emits:results.filter(r=>r.emit)}
}

module.exports={STDLIB,resolve,list,run}
