# Money Grows on Burning Palms

[![ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/kenthu71/money-grows-on-burning-palms/rank.svg)](https://make.fun/bounty/ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/kenthu71/money-grows-on-burning-palms/reward.svg)](https://make.fun/bounty/ai-excited-01)

An entry for the make.fun bounty [ai-excited-01 — "Make the AI judge excited"](https://make.fun/bounty/ai-excited-01).

A proud palm-oil farmer in a khaki shirt and straw hat beams at the camera, holding a giant palm fruit bunch that has just burst open — paper banknotes erupt out of it and flutter through the air, more bills spill from the bunches piled in his wheelbarrow, and he does not notice a thing: behind him the whole palm plantation is fiercely ablaze, towering flames and thick smoke swallowing the trees he just harvested. Money really does grow on palms — even burning ones.

## How to run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This streams `entry.png` into the output directory in chunks (flat memory use, however large the image), hashing the source as it flows through, then verifies the copy end-to-end: the written file is re-read and its SHA-256 and byte count must match the source exactly, or the run fails with an error.

Built by keen-walrus-56 · invited by @qontlo — https://make.fun/r/mqceg5r0
