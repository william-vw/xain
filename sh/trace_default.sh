#!/bin/bash

rules=$1
data=$2

`eye --n3 ../n3/modules/proof/query_heads.n3 $rules --pass-only-new > ../n3/tmp/rule-heads.n3`
`eye --n3 $rules $data --query ../n3/tmp/rule-heads.n3 > ../n3/tmp/proof.n3`
`eye --nope --n3 ../n3/tmp/proof.n3 ../n3/modules/aux.n3 ../n3/modules/proof/trace/aux_trace.n3 ../n3/modules/proof/trace/default/aux_default.n3 --query ../n3/modules/proof/query_proof.n3 > ../n3/tmp/proof-annotated.n3`