const {createVM}=require('./runtime')
const {resolve,list}=require('./templates')
const {EMOJI_OPS,RING_PRE,BUS_GLY,RING_NAMES}=require('./ops')

function createMCP(){
  const vm=createVM()

  const tools={
    run:{desc:'Run a LIGHT program',params:{src:'string — emoji LIGHT source code'},fn:({src})=>{const out=[];const prog=vm.parse(src);const results=vm.exec(prog,{},m=>out.push(m));return{log:out,results}}},

    template:{desc:'Run a parameterized template',params:{name:'string — template name',params:'object — {{key}}:value pairs'},fn:({name,params:p})=>{const src=resolve(name,p||{});if(!src)return{error:`unknown template: ${name}`,available:list()};vm.reset();const out=[];const prog=vm.parse(src);const results=vm.exec(prog,{},m=>out.push(m));return{template:name,src,log:out,results}}},

    list_templates:{desc:'List available templates',params:{},fn:()=>({templates:list()})},

    ops:{desc:'List all emoji opcodes',params:{},fn:()=>{const out={};for(const[e,[mn,prime]]of Object.entries(EMOJI_OPS))out[e]={mnemonic:mn,prime};return{opcodes:out,rings:RING_PRE,buses:BUS_GLY}}},

    pipe:{desc:'Chain multiple templates: t1 | t2 | t3',params:{chain:'array of {template, params}'},fn:({chain})=>{const results=[];let carry=null;for(const step of chain){const p={...step.params};if(carry!==null)p.input=carry;const src=resolve(step.template,p);if(!src)return{error:`unknown template: ${step.template}`};vm.reset();const out=[];const prog=vm.parse(src);const r=vm.exec(prog,{},m=>out.push(m));const emits=r.filter(x=>x.emit);carry=emits.length?JSON.stringify(emits[emits.length-1].emit):null;results.push({template:step.template,log:out,emits})}return{chain:results}}},

    sys:{desc:'System info — registers, rings, state',params:{},fn:()=>({registers:{total:888,per_ring:[2,3,5,11,31,127,709]},rings:RING_NAMES,special:vm.SPEC,depth:vm.SPEC.RD,kappa:vm.SPEC.KP})},

    eval:{desc:'Quick eval — one-liner LIGHT',params:{expr:'string — e.g. "🔻 4.0 42 🌊 4.1 4.0 4.0 💡🧵 4.1 👁"'},fn:({expr})=>{vm.reset();const out=[];vm.exec(vm.parse(expr.replace(/\s*\|\s*/g,'\n')),{},m=>out.push(m));return{log:out}}},
  }

  return{tools,vm,handle(toolName,args){const t=tools[toolName];if(!t)return{error:`unknown tool: ${toolName}`,available:Object.keys(tools)};return t.fn(args||{})}}
}

module.exports={createMCP}
