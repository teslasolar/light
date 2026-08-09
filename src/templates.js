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

  spectrum:`; spectrum gate — params: hr, hrv, stress
🔵
🔻 4.0 {{hr}}
🔻 4.1 {{hrv}}
🔻 4.2 {{stress}}
🔻 4.3 0.01
🔍 4.4 4.2 4.3
🔻 4.5 -60
🌊 4.6 4.0 4.5
🔻 4.7 0.025
🔍 4.8 4.6 4.7
🔻 4.9 0.008
🔍 4.10 4.2 4.9
🔍 4.11 4.1 4.3
🔻 4.12 0.25
🔍 4.13 4.4 4.12
🔍 4.14 4.8 4.12
🔻 4.15 0.20
🔍 4.16 4.10 4.15
🔻 4.17 0.15
🔍 4.18 4.4 4.17
🔍 4.19 4.11 4.17
🌊 4.20 4.13 4.14
🌊 4.20 4.20 4.16
🌊 4.20 4.20 4.18
🪞 4.19
🌊 4.20 4.20 4.19
⚖️ 4.20 0.3
📈 :CRIT
⚖️ 4.20 0
📈 :STR
💡🧵 {gate:4.20,class:"calm"}
⚡ :END
:CRIT 💡🧵 {gate:4.20,class:"critical"} ⚡ :END
:STR 💡🧵 {gate:4.20,class:"stressed"}
:END 👁`,

  hsv_risk:`; HSV reactivation risk — params: hr, hrv, stress
🔵
🔻 4.0 {{hr}}
🔻 4.1 {{hrv}}
🔻 4.2 {{stress}}
🔻 4.3 0.004
🔍 4.4 4.2 4.3
🔻 4.5 -60
🌊 4.6 4.0 4.5
🔻 4.7 0.005
🔍 4.8 4.6 4.7
🔻 4.9 0.003
🔍 4.10 4.1 4.9
🌊 4.11 4.4 4.8
🪞 4.10
🌊 4.11 4.11 4.10
⚖️ 4.11 0
📈 :CHK
🔻 4.11 0
:CHK ⚖️ 4.11 1
📈 :CAP
⚡ :OUT
:CAP 🔻 4.11 1
:OUT 💡🧵 {risk:4.11}
👁`,

  thyroid:`; TSH estimate — params: hr, stress
🔵
🔻 4.0 {{hr}}
🔻 4.1 {{stress}}
🔻 4.2 -72
🌊 4.3 4.0 4.2
🔻 4.4 0.05
🔍 4.5 4.3 4.4
🔻 4.6 3.3
🔍 4.7 4.5 4.6
🔻 4.8 2.0
🌊 4.9 4.8 4.7
💡🧵 {tsh:4.9,push:4.5}
👁`,

  translate:`; translate word — params: word, from_lang, to_lang
🔵
🔻 4.0 {{word}}
🔻 4.1 {{from_lang}}
🔻 4.2 {{to_lang}}
⚖️ 4.0 "love"
🎵 :W0
⚖️ 4.0 "fear"
🎵 :W1
⚖️ 4.0 "plan"
🎵 :W2
⚖️ 4.0 "see"
🎵 :W3
⚖️ 4.0 "yes"
🎵 :W4
⚖️ 4.0 "observe"
🎵 :W5
⚖️ 4.0 "soul"
🎵 :W6
⚖️ 4.0 "light"
🎵 :W7
⚖️ 4.0 "star"
🎵 :W8
⚖️ 4.0 "dream"
🎵 :W9
💡🧵 {word:4.0,translation:"unknown",ring:-1}
⚡ :END
:W0 ⚖️ 4.2 "pl"
🎵 :W0P
⚖️ 4.2 "ja"
🎵 :W0J
💡🧵 {word:4.0,translation:"love",ring:5} ⚡ :END
:W0P 💡🧵 {word:4.0,translation:"milosc",ring:5} ⚡ :END
:W0J 💡🧵 {word:4.0,translation:"ai",ring:5} ⚡ :END
:W1 ⚖️ 4.2 "pl"
🎵 :W1P
⚖️ 4.2 "ja"
🎵 :W1J
💡🧵 {word:4.0,translation:"fear",ring:0} ⚡ :END
:W1P 💡🧵 {word:4.0,translation:"strach",ring:0} ⚡ :END
:W1J 💡🧵 {word:4.0,translation:"kyoufu",ring:0} ⚡ :END
:W2 ⚖️ 4.2 "pl"
🎵 :W2P
⚖️ 4.2 "ja"
🎵 :W2J
💡🧵 {word:4.0,translation:"plan",ring:4} ⚡ :END
:W2P 💡🧵 {word:4.0,translation:"plan",ring:4} ⚡ :END
:W2J 💡🧵 {word:4.0,translation:"keikaku",ring:4} ⚡ :END
:W3 ⚖️ 4.2 "pl"
🎵 :W3P
⚖️ 4.2 "ja"
🎵 :W3J
💡🧵 {word:4.0,translation:"see",ring:3} ⚡ :END
:W3P 💡🧵 {word:4.0,translation:"widziec",ring:3} ⚡ :END
:W3J 💡🧵 {word:4.0,translation:"miru",ring:3} ⚡ :END
:W4 ⚖️ 4.2 "pl"
🎵 :W4P
⚖️ 4.2 "ja"
🎵 :W4J
💡🧵 {word:4.0,translation:"yes",ring:1} ⚡ :END
:W4P 💡🧵 {word:4.0,translation:"tak",ring:1} ⚡ :END
:W4J 💡🧵 {word:4.0,translation:"hai",ring:1} ⚡ :END
:W5 ⚖️ 4.2 "pl"
🎵 :W5P
⚖️ 4.2 "ja"
🎵 :W5J
💡🧵 {word:4.0,translation:"observe",ring:3} ⚡ :END
:W5P 💡🧵 {word:4.0,translation:"obserwuj",ring:3} ⚡ :END
:W5J 💡🧵 {word:4.0,translation:"kansoku",ring:3} ⚡ :END
:W6 ⚖️ 4.2 "pl"
🎵 :W6P
⚖️ 4.2 "ja"
🎵 :W6J
💡🧵 {word:4.0,translation:"soul",ring:5} ⚡ :END
:W6P 💡🧵 {word:4.0,translation:"dusza",ring:5} ⚡ :END
:W6J 💡🧵 {word:4.0,translation:"tamashii",ring:5} ⚡ :END
:W7 ⚖️ 4.2 "pl"
🎵 :W7P
⚖️ 4.2 "ja"
🎵 :W7J
💡🧵 {word:4.0,translation:"light",ring:6} ⚡ :END
:W7P 💡🧵 {word:4.0,translation:"swiatlo",ring:6} ⚡ :END
:W7J 💡🧵 {word:4.0,translation:"hikari",ring:6} ⚡ :END
:W8 ⚖️ 4.2 "pl"
🎵 :W8P
⚖️ 4.2 "ja"
🎵 :W8J
💡🧵 {word:4.0,translation:"star",ring:6} ⚡ :END
:W8P 💡🧵 {word:4.0,translation:"gwiazda",ring:6} ⚡ :END
:W8J 💡🧵 {word:4.0,translation:"hoshi",ring:6} ⚡ :END
:W9 ⚖️ 4.2 "pl"
🎵 :W9P
⚖️ 4.2 "ja"
🎵 :W9J
💡🧵 {word:4.0,translation:"dream",ring:5} ⚡ :END
:W9P 💡🧵 {word:4.0,translation:"marzenie",ring:5} ⚡ :END
:W9J 💡🧵 {word:4.0,translation:"yume",ring:5}
:END 👁`,

  fibonacci:`; nth fibonacci — params: n
🔵
🔻 4.0 0
🔻 4.1 1
🔻 4.2 0
:FLOOP
⚖️ 4.2 {{n}}
🎵 :FDONE
🌊 4.3 4.0 4.1
🔮 4.0 4.1
🔮 4.1 4.3
🌊 4.2 4.2 1
⚡ :FLOOP
:FDONE 💡🧵 {fib:4.0}
👁`,

  factorial:`; n factorial — params: n
🔵
🔻 4.0 1
🔻 4.1 1
:FLOOP
⚖️ 4.1 {{n}}
📈 :FDONE
🔍 4.0 4.0 4.1
🌊 4.1 4.1 1
⚡ :FLOOP
:FDONE 💡🧵 {factorial:4.0}
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
