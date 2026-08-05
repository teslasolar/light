const {createVM}=require('./runtime')
const {resolve:resolveTemplate}=require('./templates')
const {resolve:resolveStdlib}=require('./stdlib')

const fns={}

function def(name,params,body){
  fns[name]={params:Array.isArray(params)?params:params.split(',').map(s=>s.trim()),body}
}

function call(name,args={},log=console.log){
  const fn=fns[name]
  if(!fn){
    const tpl=resolveTemplate(name,args)||resolveStdlib(name,args)
    if(tpl){const vm=createVM();const out=[];const r=vm.exec(vm.parse(tpl),{},m=>out.push(m));return{log:out,results:r}}
    return{error:`undefined function: ${name}`}
  }
  let src=fn.body
  for(const p of fn.params){if(args[p]!==undefined)src=src.replace(new RegExp(`\\{\\{${p}\\}\\}`,'g'),String(args[p]))}
  const vm=createVM()
  const out=[]
  const results=vm.exec(vm.parse(src),{},m=>out.push(m))
  return{log:out,results}
}

function pipe(steps,log=console.log){
  let carry=null
  const results=[]
  for(const step of steps){
    const args={...step.args}
    if(carry!==null)args.input=carry
    const r=call(step.fn,args,log)
    if(r.error)return{error:r.error,step:step.fn}
    const emits=(r.results||[]).filter(x=>x.emit)
    carry=emits.length?emits[emits.length-1].emit[0]:null
    results.push({fn:step.fn,log:r.log,carry})
  }
  return{results,final:carry}
}

function listFns(){return{defined:Object.keys(fns),templates:require('./templates').list(),stdlib:require('./stdlib').list()}}

module.exports={def,call,pipe,listFns,fns}
