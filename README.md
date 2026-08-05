# LIGHT

The photonic programming language. 38 emoji opcodes. 888 registers. 7 rings. 5 buses.

```
🔵
🔻 4.0 "hello"
🔻 4.1 42
🌊 4.2 4.1 4.1
💡🧵 {msg:4.0,answer:4.2}
👁
```

## Install

```bash
npm install -g light-lang
```

## CLI

```bash
light run program.light        # run a file
light eval "🔻 4.0 42 👁"      # eval inline
light template add a=10 b=32   # run template with params
light pipe add:a=5:b=3 phi     # chain templates
light mcp sys                   # MCP tool call
light ops                       # opcode table
light repl                      # interactive REPL
```

## Templates

Parameterized programs — `{{key}}` replaced at call time:

```bash
light template invoice qty=10 rate=149 tax_pct=0.23
light template binding hr=97 hrv=10.5 stress=0.79
light template gate hr=106 stress=0.88
```

Available: `hello`, `add`, `branch`, `loop`, `phi`, `binding`, `invoice`, `gate`, `pipe`

## MCP API

```js
const {createMCP} = require('light-lang/src/mcp')
const mcp = createMCP()

mcp.handle('run', {src: '🔻 4.0 42\n💡🧵 4.0\n👁'})
mcp.handle('template', {name: 'add', params: {a: 10, b: 32}})
mcp.handle('pipe', {chain: [{template: 'add', params: {a: 5, b: 3}}, {template: 'phi', params: {}}]})
mcp.handle('eval', {expr: '🌀 5.0 | 💡🧵 5.0 | 👁'})
mcp.handle('ops', {})
mcp.handle('sys', {})
```

## Opcodes

| Emoji | PRASM | Prime | LIGHT physics |
|-------|-------|-------|---------------|
| ⚫ | NOP | 2 | dark |
| 🔻 | LD | 3 | absorb |
| 🔺 | ST | 5 | emit |
| 🌊 | ADD | 7 | interfere |
| 🔍 | MUL | 11 | lens |
| 🔮 | ATT | 13 | filter |
| 🌈 | VAL | 17 | spectrum |
| 💠 | PLN | 19 | cavity |
| 🪢 | MDL | 23 | entangle |
| 👁 | OBS | 29 | reflect |
| ⚡ | JMP | 31 | redirect |
| ⚖️ | CMP | 37 | compare λ |
| 🎵 | JEQ | 41 | resonate |
| 💥 | JNE | 43 | scatter |
| 📈 | JGT | 47 | amplify |
| 🚨 | INT | 53 | alarm |
| 🔽 | REC | 59 | nest |
| 🔼 | UNR | 61 | unnest |
| 💡 | EMT | 67 | radiate |
| 🎛 | RSN | 71 | tune |
| 🌑 | SLP | 73 | dim |
| ✨ | DRM | 79 | fluoresce |
| ☀️ | WAK | 83 | excite |
| 🧯 | ABT | 89 | quench |
| 🧊 | FRZ | 97 | freeze |
| 🫧 | CLR | 101 | bleach |
| ☠️ | DIE | 103 | annihilate |
| 🔱 | GEO | 107 | diffract |
| 🌀 | PHI | 109 | cohere |
| ♾️ | PSI | 113 | self-ref |

## Rings

| Ring | Emoji | λ nm | Function |
|------|-------|------|----------|
| R0 | 🔴 | 700 | MATERIAL |
| R1 | 🟠 | 630 | WEAVE |
| R2 | 🟡 | 590 | NODE |
| R3 | 🟢 | 520 | ZONE |
| R4 | 🔵 | 470 | PROTOCOL |
| R5 | 🟣 | 405 | PRODUCT |
| R6 | ⚪ | 350 | FACTORY |

Total registers: 2 + 3 + 5 + 11 + 31 + 127 + 709 = **888**

## Architecture

```
mcp(            — tool interface (run/template/pipe/eval/ops/sys)
  api(          — programmatic access (createMCP, createVM)
    cli(        — command line (light run/eval/template/pipe/mcp/ops/repl)
      cmd(      — command dispatch
        sys(    — runtime (parse, exec, 888 registers, 7 rings)
          params( — template resolution ({{key}} → value)
            light — the photonic instruction set
          )
        )
      )
    )
  )
)
```

## License

MIT
