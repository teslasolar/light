const EMOJI_OPS={
'⚫':['NOP',2],'🔻':['LD',3],'🔺':['ST',5],'🌊':['ADD',7],
'🔍':['MUL',11],'🔮':['ATT',13],'🌈':['VAL',17],'💠':['PLN',19],
'🪢':['MDL',23],'👁':['OBS',29],'⚡':['JMP',31],'⚖️':['CMP',37],
'🎵':['JEQ',41],'💥':['JNE',43],'📈':['JGT',47],'🚨':['INT',53],
'🔽':['REC',59],'🔼':['UNR',61],'💡':['EMT',67],'🎛':['RSN',71],
'🌑':['SLP',73],'✨':['DRM',79],'☀️':['WAK',83],'🧯':['ABT',89],
'🧊':['FRZ',97],'🫧':['CLR',101],'☠️':['DIE',103],'🔱':['GEO',107],
'🌀':['PHI',109],'♾️':['PSI',113],
'🔄':['TRT',127],'🪞':['TNE',131],'🤝':['TAN',137],
'🫱':['TOR',139],'🗳':['TCN',149],'📡':['TPV',151]
}
const RING_PRE={'🔴':0,'🟠':1,'🟡':2,'🟢':3,'🔵':4,'🟣':5,'⚪':6}
const BUS_GLY={'🧵':'A','⚗️':'B','🔦':'C','📶':'D','🔋':'E'}
const RING_NAMES=['MATERIAL','WEAVE','NODE','ZONE','PROTOCOL','PRODUCT','FACTORY']
const RING_LAMBDA=[700,630,590,520,470,405,350]
const PRIMES=[1,2,3,5,11,31,127,709]

module.exports={EMOJI_OPS,RING_PRE,BUS_GLY,RING_NAMES,RING_LAMBDA,PRIMES}
