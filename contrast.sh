eye --nope --n3 aux/contrast/invert_rules.n3 test/yellow-rules.n3 --pass-only-new --quantify http://eyereasoner.github.io/var# > test/contrast/yellow-rules-inv.n3
eye --n3 aux/query_heads.n3 test/contrast/yellow-rules-inv.n3 --pass-only-new > test/contrast/yellow-rules-inv_heads.n3
eye --n3 test/contrast/yellow-goal.n3 test/contrast/yellow-rules-inv.n3 --query test/contrast/yellow-rules-inv_heads.n3 > test/contrast/yellow-goal-proof.n3
eye --nope --n3 test/contrast/yellow-goal-proof.n3 aux/contrast/aux_inv.n3 --pass-all > test/contrast/yellow-inv-interm.n3
eye --strings --n3 test/contrast/yellow-inv-interm.n3 print/simple/describe.n3 print/simple/collect.n3 --query print/simple/query.n3

time sleep 1