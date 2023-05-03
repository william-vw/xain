const rdf = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const rdfs = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
const mod = $rdf.Namespace("http://www.w3.org/2000/10/swap/module#");
const x = $rdf.Namespace("http://wvw.org/xai");

$rdf.NamedNode.prototype.localName = function () {
    let uri = this.uri;
    let idx = uri.indexOf('#');
    if (idx == -1)
        idx = uri.indexOf('/');
    return uri.slice(idx + 1);
}

class Module {

    constructor(path, reasoner) {
        this.path = `${window.location.origin}/${path}`;
        this.reasoner = reasoner;
    }

    async init() {
        this.store = $rdf.graph();

        // fetch module n3 & load into store
        let fetcher = new $rdf.Fetcher(this.store, 5000);
        await fetcher.load(this.path);

        this.initialized = true;
    }

    // run the module
    // returns: { name: <path name>, data: <n3 data> }
    async run(concreteParams) {
        if (!this.initialized)
            await this.init();

        let module = this.store.any(undefined, rdf("type"), mod("Module"));
        this.id = module.localName();
        console.log("module:", this.id);

        // structure: { <uri>: { name: <path name>, data: <n3 data> } }
        this.params = {};

        // bind concrete parameters to formal parameters
        // (if needed, resolve paths)        
        let formalParams = this.store.any(module, mod("parameters")).elements;
        if (formalParams.length != concreteParams.length)
            throw "concrete parameters do not match formal parameters";

        for (let i = 0; i < formalParams.length; i++) {
            let formalParam = formalParams[i];
            let concreteParam = concreteParams[i];

            let param = (concreteParam.path ? await this.resolvePath(concreteParam.path) : concreteParam);
            this.params[formalParam.uri] = param
        }

        // structure: { <uri>: { name: <path name>, data: <n3 data> } }
        this.outputs = {};

        // run each step sequentially
        let steps = this.store.any(module, mod("steps"));
        for (let step of steps.elements)
            await this.runStep(step);

        // get the "returns" parameter from the collected outputs
        let returns = this.store.any(module, mod("returns")).uri;
        return this.outputs[returns];
    }

    // run an individual step
    async runStep(step) {
        // target: concrete command (e.g., deductions) or sub-module
        let target = this.store.any(step, mod("target"));
        let label = this.targetToString(target);
        console.log(this.id, "target:", label);

        // get step inputs from concrete params or prior step outputs
        let resolvedInputs = [];
        let inputs = this.store.any(step, mod("input"));
        for (let input of inputs.elements)
            resolvedInputs.push(await this.resolve(input));

        // get step query (if any) from concrete params or prior step outputs
        let query = this.store.any(step, mod("query"));
        let resolvedQuery = (query ? await this.resolve(query) : undefined);

        let options = this.getOptions(step);
        if (options.length > 0)
            console.log("(", "options", options, ")");

        // run the command or sub-module
        let result = await this.runTarget(target, resolvedInputs, resolvedQuery, options);

        // add new entry to output array with step's results
        // (may be used by subsequent step or returned by module)
        let output = this.store.any(step, mod("output"));
        let entry = {
            name: this.nameFromPath(this.store.any(output, mod("path")).value),
            data: result
        };
        // console.log(this.id, "target:", label, "result:\n", entry.data);
        this.outputs[output.uri] = entry;
    }

    // get options (if any) of step
    // returns: [ { name: <option name (e.g., quantify)>, value: <option value> } ]
    getOptions(step) {
        let options = this.store.any(step, mod("options"));
        if (!options)
            return [];

        let ret = [];
        for (let option of options.elements) {
            for (let stmt of this.store.statementsMatching(option, undefined, undefined)) {
                let name = stmt.predicate.localName();
                let value = stmt.object.value;

                ret.push({ name: name, value: value });
            }
        }

        return ret;
    }

    // run the target (command or sub-module)
    // returns: <n3 data>
    async runTarget(target, resolvedInputs, resolvedQuery, options) {
        if (target.termType == 'NamedNode') {
            let cmd = target.localName();
            return await this.reasoner.reason(cmd, resolvedInputs, resolvedQuery, options);

        } else if (this.store.any(target, rdf("type")).uri == mod("Module").uri) {
            let path = this.store.any(target, mod("path")).value;

            let module2 = new Module(path, this.reasoner);
            await module2.init();

            // run the module, giving the resolved inputs as concrete params
            let result = await module2.run(resolvedInputs);
            return result.data;

        } else
            throw `unsupported target: ${target}`;
    }

    // resolve reference from concrete params or prior step outputs
    // returns: { name: <path name>, data: <n3 data> }
    async resolve(ref) {
        if (ref.uri in this.params)
            return this.params[ref.uri];
        else if (ref.uri in this.outputs)
            return this.outputs[ref.uri];
        else {
            let path = this.store.any(ref, mod("path"));
            if (!path || path.termType != 'Literal')
                throw `cannot resolve: ${ref}`;
            else
                return await this.resolvePath(path.value);
        }
    }

    // fetch n3 data corresponding to the given path
    // returns: { name: <path name>, data: <n3 data> }
    async resolvePath(path) {
        let resolved = await (await fetch(path)).text();
        let name = this.nameFromPath(path);
        return { name: name, data: resolved };
    }

    // auxilliary methods

    targetToString(target) {
        if (target.termType == 'NamedNode')
            return target.localName();
        else if (this.store.any(target, rdf("type")).uri == mod("Module").uri)
            return this.nameFromPath(this.store.any(target, mod("path")).value);
        else
            return undefined;
    }

    nameFromPath(path) {
        var name = path;
        if (path.startsWith("http://"))
            name = path.substring(path.indexOf("/", "http://".length + 1) + 1);

        name = name.replaceAll("/", "_");
        return name;
    }
}

class Reasoner {

    async reason(target, inputs, query, options) {
        throw "'reason' not implemented";
    }
}

class EyeReasoner {

    // run command (target) with given inputs and optional query
    async reason(target, inputs, query, options) {
        let config = {
            n3: inputs,
            query: query
        };
        switch (target) {
            case 'deductions':
                config.nope = true;
                config.passOnlyNew = true;
                break;

            case 'closure':
                config.nope = true;
                config.passAll = true;
                break;
            
            case 'query':
                config.nope = true;
                break;

            case 'proof':
                break;

            case 'strings':
                config.strings = true;
                break;
        }

        for (let option of options) {
            config[option.name] = option.value
        }
        console.log("reason", config);

        let out = await eyeWithConfig(config);
        return out;
    }
}