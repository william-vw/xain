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

function nameFromPath(path) {
    var name = path;
    if (path.startsWith("http://"))
        name = path.substring(path.indexOf("/", "http://".length + 1) + 1);

    name = name.replaceAll("/", "_");
    return name;
}

class Module {

    constructor(path, reasoner) {
        this.path = path;
        this.reasoner = reasoner;
    }

    async init() {
        this.store = $rdf.graph();

        let fetcher = new $rdf.Fetcher(this.store, 5000);
        await fetcher.load(this.path)
    }

    async run(params) {
        let module = this.store.any(undefined, rdf("type"), mod("Module"));
        this.id = module.localName();
        console.log("module:", this.id);

        // bind given parameters to defined/formal parameters
        // (if needed, resolve paths)
        this.params = {};
        let defParams = this.store.any(module, mod("parameters")).elements;
        for (let i = 0; i < defParams.length; i++) {
            let defParam = defParams[i];
            let param = params[i];

            let entry = (param.path ? await this.resolvePath(param.path) : param);
            this.params[defParam.uri] = entry
        }

        this.outputs = {};

        let steps = this.store.any(module, mod("steps"));
        for (let step of steps.elements)
            await this.runStep(step);

        let returns = this.store.any(module, mod("returns")).uri;
        return this.outputs[returns];
    }

    async runStep(step) {
        let target = this.store.any(step, mod("target"));
        console.log(this.id, "target:", target);

        let resolvedInputs = [];
        let inputs = this.store.any(step, mod("input"));
        for (let input of inputs.elements)
            resolvedInputs.push(await this.resolve(input));

        let query = this.store.any(step, mod("query"));
        let resolvedQuery = (query ? await this.resolve(query) : undefined);

        let output = this.store.any(step, mod("output"));
        let result = await this.runTarget(target, resolvedInputs, resolvedQuery);
        let entry = {
            name: nameFromPath(this.store.any(output, mod("path")).value),
            data: result
        };
        console.log(this.id, "result:", entry.data);
        this.outputs[output.uri] = entry;
    }

    async runTarget(target, resolvedInputs, resolvedQuery) {
        if (target.termType == 'NamedNode') {
            let cmd = target.localName();
            return await this.reasoner.reason(cmd, resolvedInputs, resolvedQuery);

        } else if (this.store.any(target, rdf("type")).uri == mod("Module").uri) {
            let path = this.store.any(target, mod("path")).value;
            path = `http://localhost:8000/${path}`;

            let module2 = new Module(path, this.reasoner);
            await module2.init();

            let result = await module2.run(resolvedInputs);
            return result.data;

        } else
            throw `unsupported target: ${target}`;
    }

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

    async resolvePath(path) {
        let resolved = await (await fetch(path)).text();
        let name = nameFromPath(path);
        return { name: name, data: resolved };
    }
}

class Reasoner {

    async reason(target, inputs, query) {
        throw "'reason' not implemented";
    }
}

class EyeReasoner {

    async reason(target, inputs, query) {
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

            case 'proof':
                break;

            case 'strings':
                config.strings = true;
                break;
        }

        console.log("reason", config);
        let out = await eyeWithConfig(config);
        return out;
    }
}