#!/bin/bash

kg=$1

eye --nope --n3 ../n3/tmp/proof-annotated.n3 ../n3/modules/aux.n3 ../n3/modules/print/describe.n3 ../n3/modules/print/visual/describe.n3 ../n3/modules/print/visual/collect.n3 ../n3/modules/print/visual/html/collect.n3 $kg ../n3/modules/print/visual/query.n3 ../n3/modules/print/visual/html/query.n3 ../n3/modules/check/print_visual.n3 --query ../n3/modules/query_check.n3 > ../n3/tmp/final.n3