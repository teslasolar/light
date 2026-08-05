const TEMPLATES={
  hello:`; hello world
🔵
🔻 4.0 "hello_light"
💡🧵 4.0
👁`,

  add:`; add two numbers — params: a, b
🔵
🔻 4.0 {{a}}
🔻 4.1 {{b}}
🌊 4.2 4.0 4.1
💡🧵 {a:4.0,b:4.1,sum:4.2}
👁`,

  branch:`; branch on value — params: val, threshold
🔵
🔻 4.0 {{val}}
⚖️ 4.0 {{threshold}}
📈 :ABOVE
💡🧵 {result:"below",val:4.0}
⚡ :END
:ABOVE 💡🧵 {result:"above",val:4.0}
:END 👁`,

  loop:`; count loop — params: n
🔵
🔻 4.0 0
🔻 4.1 {{n}}
:LOOP
💡🧵 {i:4.0}
🌊 4.0 4.0 1
⚖️ 4.0 4.1
📈 :DONE
⚡ :LOOP
:DONE 👁`,

  phi:`; compute golden ratio
🟣
🌀 5.0
💡🧵 {kappa:5.0}
👁`,

  binding:`; shekinah binding check — params: hr, hrv, stress
🟣
🔻 5.0 {{hr}}
🔻 5.1 {{hrv}}
🔻 5.2 {{stress}}
🌀 5.3
💡🧵 {hr:5.0,hrv:5.1,stress:5.2,kappa:5.3}
👁`,

  invoice:`; invoice calc — params: qty, rate, tax_pct
🔵
🔻 4.0 {{qty}}
🔻 4.1 {{rate}}
🔍 4.2 4.0 4.1
🔻 4.3 {{tax_pct}}
🔍 4.4 4.2 4.3
🌊 4.5 4.2 4.4
💡🧵 {qty:4.0,rate:4.1,subtotal:4.2,tax:4.4,total:4.5}
👁`,

  gate:`; R2 gate spectrum — params: hr, stress
🟡
🔻 2.0 {{hr}}
🔻 2.1 {{stress}}
🔍 2.2 2.1 2.0
🌀 2.3
💡🧵 {hr:2.0,stress:2.1,cortisol_idx:2.2,kappa:2.3}
👁`,

  pipe:`; pipe pattern — chain template outputs
🔵
🔻 4.0 {{input}}
🔽
  🔻 4.1 4.0
  🌊 4.1 4.1 4.1
🔼
💡🧵 {input:4.0,piped:4.1}
👁`,
}

function resolve(templateName, params={}){
  let src=TEMPLATES[templateName]
  if(!src)return null
  for(const[k,v]of Object.entries(params)){
    src=src.replace(new RegExp(`\\{\\{${k}\\}\\}`,'g'),String(v))
  }
  return src
}

function list(){return Object.keys(TEMPLATES)}

module.exports={TEMPLATES,resolve,list}
