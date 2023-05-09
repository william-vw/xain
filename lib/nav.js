// Data Structures

class Stack {

    constructor(initial) {
        this.stack = [];
        if (initial)
            this.push(initial);
    }

    current() {
        return this.stack[this.stack.length - 1];
    }

    push(el) {
        this.stack.push(el);
    }

    pop() {
        return this.stack.pop();
    }

    popAll(until) {
        this.stack.splice(until, Infinity);
        if (until > 0)
            return this.current();
    }

    size() {
        return this.stack.length;
    }
}

class CircularList {

    constructor(list) {
        this.idx = 0;
        this.list = list;
    }

    cur() {
        return this.list[this.idx];
    }

    next() {
        this.idx = (this.idx == this.list.length - 1 ? 0 : ++this.idx);
        return this.cur();
    }

    prior() {
        this.idx = (this.idx == 0 ? this.list.length - 1 : --this.idx);
        return this.cur();
    }
}


// Nav

class NavStack {

    constructor(home) {
        this.navStack = new Stack(home);
    }

    goto(id) {
        $(this.navStack.current()).hide();

        this.navStack.push(`#${id}`);
        $(this.navStack.current()).show();
    }

    goback() {
        if (this.navStack.size() > 1) {
            $(this.navStack.pop()).hide();
            $(this.navStack.current()).show();
        }
    }

    gohome() {
        if (this.navStack.size() > 1) {
            $(this.navStack.current()).hide();
            $(this.navStack.popAll(1)).show();
        }
    }

    hide() {
        $(this.navStack.current()).hide();
    }
}

class NavList {

    constructor(list) {
        this.alts = new CircularList(list);
    }

    show() {
        $(this.alts.cur()).show();
    }

    next() {
        this.hideCur();

        $(this.alts.next()).show();
    }

    prior() {
        this.hideCur();

        $(this.alts.prior()).show();
    }

    hideCur() {
        if (this.curStack !== undefined) {
            this.curStack.hide();
            this.curStack = undefined;
        } else
            $(this.alts.cur()).hide();
    }

    goto(id) {
        if (this.curStack === undefined) {
            this.curStack = new NavStack(this.alts.cur());
        }

        this.curStack.goto(id);
    }

    goback() {
        if (this.curStack !== undefined) {
            this.curStack.goback();
        }
    }

    gohome() {
        if (this.curStack !== undefined) {
            this.curStack.gohome();
        }
    }
}

class NavListOnCls extends NavList {

    constructor() {
        super($('.level_0').toArray());
    }
}