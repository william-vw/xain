#!/bin/bash

kg=$1

eye --nope --n3 ../n3/tmp/proof-annotated.n3 $kg ../n3/modules/check/domain-kg.n3 --query ../n3/modules/query_check.n3 > ../n3/tmp/final.n3