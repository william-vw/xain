async function explain(type, usecase) {
    let dataName = null;
    let path = "n3/modules/proof/";

    switch (type) {
        case 'trace':
        case 'trace/aggr':
            dataName = 'data';
            path += "trace/aggr/module.n3";
            break;

        case 'trace/default':
            dataName = 'data';
            path += "trace/default/module.n3";
            break;

        case 'contrast':
            dataName = 'goal';
            path += "contrast/module.n3";
            break;
    }

    let inputs = [
        { path: `n3/test/${usecase}/rules.n3` },
        { path: `n3/test/${usecase}/${dataName}.n3` }
    ];

    let module = new Module(path, new EyeReasoner());
    let output = await module.run(inputs);
    
    return output.data;
}