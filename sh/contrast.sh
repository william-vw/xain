#!/bin/bash

rules=$1
goal=$2

`eye --nope --n3 ../n3/modules/aux.n3 ../n3/modules/proof/contrast/invert_rules.n3 $rules --pass-only-new --quantify http://eyereasoner.github.io/var# > ../n3/tmp/rules-inv.n3`
`eye --nope --n3 ../n3/modules/proof/query_heads.n3 ../n3/tmp/rules-inv.n3 --pass-only-new --quantify http://eyereasoner.github.io/var# > ../n3/tmp/rule-heads.n3`
`eye --n3 $goal ../n3/tmp/rules-inv.n3 --query ../n3/tmp/rule-heads.n3 > ../n3/tmp/proof.n3`
`eye --nope --n3 ../n3/tmp/proof.n3 ../n3/modules/proof/contrast/aux_inv.n3  --query ../n3/modules/proof/query_proof.n3 > ../n3/tmp/proof-annotated.n3`