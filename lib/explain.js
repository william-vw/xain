async function trace(rules, data, options) {
    let start = performance.now();

    // - aggregate evidences (if needed)
    if (options.aggregate) {
        // (distinguish rules with same heads)
        rules = await eyereasoner.n3reasoner(rules, await get("aux/trace/aggr/distinguish_rules.n3"));
        // console.log("aggr evidences\n", rules);
    }

    let end = performance.now();
    console.log("distinguish:", (end - start));

    // - get proof for rules
    let proof = await prove(rules, data);
    // let proof = await get("test/yellow1-proof.n3");

    // - setup config for main reasoning run
    let config =
    {
        nope: true,
        passAll: true,
        n3: [
            { name: 'proof.n3', data: proof },
            { name: 'aux_trace.n3', path: "aux/trace/aux_trace.n3" }
        ]
    };

    if (options.aggregate)
        config.n3.push(
            { name: 'aux_aggr.n3', path: "aux/trace/aggr/aux_aggr.n3" },
            { name: 'aggregate_evidence.n3', path: "aux/trace/aggr/aggregate_evidence.n3" });
    else
        config.n3.push({ name: 'aux_default', path: 'aux/trace/default/aux_default.n3' });

    // reason!
    start = performance.now();

    let out = await eyeWithConfig(config);

    end = performance.now();
    console.log("aux:", (end - start));

    return out;
}

async function contrast(rules, goal, options) {
    let start = performance.now();

    // - invert rules first
    rules = await eyeWithConfig({
        nope: true,
        passOnlyNew: true,
        quantify: "http://eyereasoner.github.io/var#",
        n3: [
            { name: 'rules.n3', data: rules },
            { name: 'invert_rules.n3', path: "aux/contrast/invert_rules.n3" }
        ],
    });
    // console.log("inverted rules:\n", rules);

    let end = performance.now();
    console.log("invert:", (end - start));

    // - get proof for rules
    let proof = await prove(rules, goal);

    start = performance.now();
    // - setup config for main reasoning run
    let config =
    {
        nope: true,
        passAll: true,
        n3: [
            { name: 'proof.n3', data: proof },
            { name: 'aux_inv.n3', path: "aux/contrast/aux_inv.n3" }
        ]
    };

    // reason!
    let out = await eyeWithConfig(config);

    end = performance.now();
    console.log("aux:", (end - start));

    return out;
}

async function prove(rules, data) {
    let start = performance.now();

    // - collect rule heads (use as query later)
    let heads = await eyereasoner.n3reasoner(rules, await get("aux/query_heads.n3"));
    // console.log("heads (original rules)\n", heads);

    // - generate proof for these inferences
    let proof = await eyeWithConfig({
        n3: [
            { name: 'data.n3', data: data },
            { name: 'rules.n3', data: rules }
        ],
        query: { name: 'heads.n3', data: heads }
    });
    // console.log("proof\n", proof);

    let end = performance.now();
    console.log("prove:", (end - start));

    return proof;
}

class CorePrinter {

    constructor() {
        this.config =
        {
            strings: true,
            nope: true,

            n3: [
                { name: 'describe_core.n3', path: "print/describe.n3" }
            ]
        }
    }

    async print(input, ontology) {
        this.config.n3.splice(0, 0, { name: "input.n3", data: input });
        if (ontology)
            this.config.n3.splice(1, 0, { name: "ontology.n3", path: ontology });

        let start = performance.now();

        console.log(this.config);
        let out = await eyeWithConfig(this.config);

        let end = performance.now();
        console.log("print:", (end - start));

        return out;
    }
}

class SimplePrinter extends CorePrinter {
    constructor() {
        super();

        this.config.n3.push(
            { name: 'describe.n3', path: "print/simple/describe.n3" },
            { name: 'collect.n3', path: "print/simple/collect.n3" });
        this.config.query = { name: 'query.n3', path: "print/simple/query.n3" };
    }
}

class VisualPrinter extends CorePrinter {
    constructor() {
        super();

        this.config.n3.push(
            { name: 'describe.n3', path: "print/visual/describe.n3" },
            { name: 'collect.n3', path: "print/visual/collect.n3" });
        this.config.query = { name: 'query.n3', path: "print/visual/query.n3" };
    }
}

class CopdPrinter extends VisualPrinter {
    constructor() {
        super();

        this.config.n3.push(
            { name: 'collect_copd.n3', path: "print/visual/copd/collect.n3" },
            { name: 'query_default.n3', path: "print/visual/copd/query.n3" });
    }
}