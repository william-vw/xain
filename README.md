# XAIN

## Online Demos*:
- [Counterfactual demo](https://projects.cs.dal.ca/niche/xain/counterfactual.html)
- [Contrastive demo](https://projects.cs.dal.ca/niche/xain/contrastive.html)

**Note**: there is no separate demo for trace-based explanations (as these are the same as counterfactual but with a fixed set of facts). 
  
  
  
\* _Generating the explanation may take a few seconds depending on your machine. The [eye-js](https://github.com/eyereasoner/eye-js) library, relying on the [SWIPL WASM](https://www.swi-prolog.org/pldoc/man?section=wasm) implementation, is not quite yet as performant as the desktop version._

## Modules

The repo contains the N3 code for the [pre-processing module](https://github.com/william-vw/xain/tree/main/n3/modules/proof), [describe & collect modules](https://github.com/william-vw/xain/tree/main/n3/modules/print/visual).

## COPD Use Case

Recommendation rules, a domain KG, and example input for the COPD use case can be found [here](https://github.com/william-vw/xain/tree/main/n3/test/copd).

## XAI Questionnaire

You can find our designed XAI Questionnaire [here](https://github.com/william-vw/xain/blob/main/xai%20questionnaire.docx).
