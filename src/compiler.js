const {EMOJI_OPS,RING_PRE,BUS_GLY}=require('./ops')

const MNEM_TO_EMOJI={}
const EMOJI_TO_MNEM={}
for(const[emoji,[mnem]]of Object.entries(EMOJI_OPS)){MNEM_TO_EMOJI[mnem]=emoji;EMOJI_TO_MNEM[emoji]=mnem}
const RING_TO_EMOJI={};for(const[e,i]of Object.entries(RING_PRE))RING_TO_EMOJI['R'+i]=e
const BUS_TO_EMOJI={};for(const[e,b]of Object.entries(BUS_GLY))BUS_TO_EMOJI[b]=e

function prasmToLight(src){
  return src.split('\n').map(line=>{
    const trimmed=line.trim()
    if(!trimmed||trimmed.startsWith(';')||trimmed.startsWith(':'))return line
    const tokens=trimmed.split(/\s+/)
    return tokens.map(t=>{
      if(MNEM_TO_EMOJI[t])return MNEM_TO_EMOJI[t]
      if(RING_TO_EMOJI[t])return RING_TO_EMOJI[t]
      if(BUS_TO_EMOJI[t])return BUS_TO_EMOJI[t]
      return t
    }).join(' ')
  }).join('\n')
}

function lightToPrasm(src){
  return src.split('\n').map(line=>{
    const trimmed=line.trim()
    if(!trimmed||trimmed.startsWith(';')||trimmed.startsWith(':'))return line
    let out=trimmed
    for(const[emoji,mnem]of Object.entries(EMOJI_TO_MNEM))out=out.split(emoji).join(mnem+' ')
    for(const[emoji,i]of Object.entries(RING_PRE))out=out.split(emoji).join('R'+i+' ')
    for(const[emoji,b]of Object.entries(BUS_GLY))out=out.split(emoji).join('Bus'+b+' ')
    return out.replace(/\s+/g,' ').trim()
  }).join('\n')
}

function minify(src){
  return src.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith(';')).join('\n')
}

function tokenCount(src){
  return src.split(/\s+/).filter(Boolean).length
}

module.exports={prasmToLight,lightToPrasm,minify,tokenCount,MNEM_TO_EMOJI,EMOJI_TO_MNEM}
