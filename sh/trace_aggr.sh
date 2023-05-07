#!/bin/bash

rules=$1
data=$2

`eye --nope --n3 $rules ../n3/modules/proof/trace/aggr/distinguish_rules.n3 --pass-only-new > ../n3/tmp/rules-disting.n3`
`eye --n3 ../n3/modules/proof/query_heads.n3 ../n3/tmp/rules-disting.n3 --pass-only-new > ../n3/tmp/rule-heads.n3`
`eye --n3 ../n3/tmp/rules-disting.n3 $data --query ../n3/tmp/rule-heads.n3 > ../n3/tmp/proof.n3`
`eye --nope --n3 ../n3/tmp/proof.n3 ../n3/modules/proof/trace/aggr/aggregate_evidence.n3 ../n3/modules/aux.n3 ../n3/modules/proof/trace/aux_trace.n3 ../n3/modules/proof/trace/aggr/aux_aggr.n3 --query ../n3/modules/proof/query_proof.n3 > ../n3/tmp/proof-annotated.n3`