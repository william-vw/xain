#!/bin/bash

kg=$1
rules=$2

eye --nope --n3 $rules $kg ../n3/modules/check/rules_domain-kg.n3 --query ../n3/modules/query_check.n3 > ../n3/tmp/final.n3
# eye --nope --n3 $rules $kg ../n3/modules/check/rules_domain-kg.n3 --pass-only-new > ../n3/tmp/final.n3