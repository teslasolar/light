const {createVM}=require('./runtime')
const {resolve,list}=require('./templates')
const {resolve:resolveStd,list:listStd,run:runStd}=require('./stdlib')
const {prasmToLight,lightToPrasm,minify,tokenCount}=require('./compiler')
const {def,call,pipe:fnPipe,listFns}=require('./fn')
const {EMOJI_OPS,RING_PRE,BUS_GLY,RING_NAMES}=require('./ops')

function createMCP(){
  const vm=createVM()

  const tools={
    run:{desc:'Run a LIGHT program',params:{src:'string'},
      fn:({src})=>{vm.reset();const out=[];const r=vm.exec(vm.parse(src),{},m=>out.push(m));return{log:out,results:r}}},

    eval:{desc:'Quick eval — pipe-separated one-liner',params:{expr:'string'},
      fn:({expr})=>{vm.reset();const out=[];vm.exec(vm.parse(expr.replace(/\s*\|\s*/g,'\n')),{},m=>out.push(m));return{log:out}}},

    template:{desc:'Run a parameterized template',params:{name:'string',params:'object'},
      fn:({name,params:p})=>{const src=resolve(name,p||{});if(!src)return{error:`unknown: ${name}`,available:list()};vm.reset();const out=[];const r=vm.exec(vm.parse(src),{},m=>out.push(m));return{template:name,src,log:out,results:r}}},

    std:{desc:'Run a stdlib function',params:{name:'string',params:'object'},
      fn:({name,params:p})=>{const r=runStd(name,p||{});if(!r)return{error:`unknown: ${name}`,available:listStd()};return r}},

    def:{desc:'Define a function',params:{name:'string',params:'string (comma-sep)',body:'string'},
      fn:({name,params:p,body})=>{def(name,p,body);return{defined:name,params:p}}},

    call:{desc:'Call a defined/template/stdlib function',params:{name:'string',args:'object'},
      fn:({name,args})=>call(name,args||{})},

    pipe:{desc:'Chain functions: [{fn,args}]',params:{chain:'array'},
      fn:({chain})=>fnPipe(chain)},

    compile:{desc:'Transpile PRASM↔LIGHT',params:{src:'string',direction:'prasm2light|light2prasm'},
      fn:({src,direction})=>{
        if(direction==='light2prasm')return{prasm:lightToPrasm(src),tokens:tokenCount(src)}
        return{light:prasmToLight(src),tokens:tokenCount(prasmToLight(src))}
      }},

    minify:{desc:'Minify LIGHT source (strip comments/blanks)',params:{src:'string'},
      fn:({src})=>({minified:minify(src),tokens:tokenCount(minify(src))})},

    list:{desc:'List all available functions',params:{},
      fn:()=>({templates:list(),stdlib:listStd(),...listFns()})},

    ops:{desc:'List all emoji opcodes',params:{},
      fn:()=>{const out={};for(const[e,[mn,prime]]of Object.entries(EMOJI_OPS))out[e]={mnemonic:mn,prime};return{opcodes:out,rings:RING_PRE,buses:BUS_GLY}}},

    sys:{desc:'System info',params:{},
      fn:()=>({registers:{total:888,per_ring:[2,3,5,11,31,127,709]},rings:RING_NAMES,special:{...vm.SPEC}})},
  }

  return{
    tools,vm,
    handle(toolName,args){const t=tools[toolName];if(!t)return{error:`unknown tool: ${toolName}`,available:Object.keys(tools)};return t.fn(args||{})},
    schema(){return Object.fromEntries(Object.entries(tools).map(([k,v])=>[k,{description:v.desc,parameters:v.params}]))}
  }
}

module.exports={createMCP}
