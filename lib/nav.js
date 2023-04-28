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
}