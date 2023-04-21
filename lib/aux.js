async function eyeWithConfig(config) {
    let files = [];
    let flags = [];

    let n3Flags = [];
    for (let entry of config.n3) {
        files.push(await load(entry));
        n3Flags.push(`./${entry.name}`);
    }

    if (config.strings)
        flags.push('--strings');
    if (config.nope)
        flags.push('--nope');

    flags.push('--n3');
    flags.push(...n3Flags);

    if (config.query) {
        files.push(await load(config.query));
        flags.push('--query', `./${config.query.name}`);

    } else if (config.passOnlyNew)
        flags.push('--pass-only-new');

    else if (config.passAll)
        flags.push('--pass-all');

    if (config.quantify)
        flags.push('--quantify', config.quantify);

    // console.log(flags);

    return eyeWithFlags(files, flags);
}

async function eyeWithFlags(files, flags) {
    let output = "";
    const Module = await eyereasoner.SwiplEye({ print: (str) => { output += str + "\n" }, arguments: ['-q'] });

    for (let file of files)
        Module.FS.writeFile(file.name, file.data);

    eyereasoner.queryOnce(Module, 'main', flags);
    return output;
}

async function load(entry) {
    if (entry.path)
        entry.data = await get(entry.path);

    return entry;
}

function get(path) {
    return new Promise((resolve, reject) => {
        $.get(path, resolve);
    });
}