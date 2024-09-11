import { SlashCommandScope } from '../../../../slash-commands/SlashCommandScope.js';
import { resolveVariable } from '../../../../variables.js';

export class BoolParser {
    /**@type {SlashCommandScope}*/ scope;
    /**@type {boolean}*/ verify = true;
    /**@type {string}*/ text;
    /**@type {number}*/ index;
    /**@type {number}*/ depth = -1;
    /**@type {boolean}*/ jumpedEscapeSequence = false;

    get ahead() {
        return this.text.slice(this.index + 1);
    }
    get behind() {
        return this.text.slice(0, this.index);
    }
    get char() {
        return this.text[this.index];
    }
    get charAhead() {
        return this.text.slice(this.index);
    }
    get endOfText() {
        return this.index >= this.text.length || (/\s/.test(this.char) && /^\s+$/.test(this.ahead));
    }




    /**
     *
     * @param {SlashCommandScope} scope
     * @param {import('../../../../slash-commands/SlashCommand.js').NamedArguments} args
     */
    constructor(scope, args) {
        this.scope = new SlashCommandScope(scope);
        for (const [k, v] of Object.entries(args)) {
            if (k[0] == '_') continue;
            if (this.scope.existsVariableInScope(k)) this.scope.setVariable(k, v);
            else this.scope.letVariable(k, v);
        }
    }




    /**
     * Moves the index <length> number of characters forward and returns the last character taken.
     * @param {number} length Number of characters to take.
     * @returns The last character taken.
     */
    take(length = 1) {
        this.jumpedEscapeSequence = false;
        let content = this.char;
        this.index++;
        if (length > 1) {
            content = this.take(length - 1);
        }
        return content;
    }
    discardWhitespace() {
        while (/\s/.test(this.char)) {
            this.take(); // discard whitespace
            this.jumpedEscapeSequence = false;
        }
    }
    /**
     * Tests if the next characters match a symbol.
     * Moves the index forward if the next characters are backslashes directly followed by the symbol.
     * Expects that the current char is taken after testing.
     * @param {string|RegExp} sequence Sequence of chars or regex character group that is the symbol.
     * @param {number} offset Offset from the current index (won't move the index if offset != 0).
     * @returns Whether the next characters are the indicated symbol.
     */
    testSymbol(sequence, offset = 0) {
        const escapeOffset = this.jumpedEscapeSequence ? -1 : 0;
        const escapes = this.text.slice(this.index + offset + escapeOffset).replace(/^(\\*).*$/s, '$1').length;
        const test = (sequence instanceof RegExp) ?
            (text) => new RegExp(`^(${sequence.source})`, sequence.flags).test(text) :
            (text) => text.startsWith(sequence)
        ;
        if (test(this.text.slice(this.index + offset + escapeOffset + escapes))) {
            // no backslashes before sequence
            //   -> sequence found
            if (escapes == 0) return true;
            // uneven number of backslashes before sequence
            //   = the final backslash escapes the sequence
            //   = every preceding pair is one literal backslash
            //    -> move index forward to skip the backslash escaping the first backslash or the symbol
            // even number of backslashes before sequence
            //   = every pair is one literal backslash
            //    -> move index forward to skip the backslash escaping the first backslash
            if (!this.jumpedEscapeSequence && offset == 0) {
                this.index++;
                this.jumpedEscapeSequence = true;
            }
            return false;
        }
    }


    parse(text, verify = true) {
        this.verify = verify;
        this.text = text;
        this.index = 0;
        this.depth = -1;
        return this.parseExpression();
    }


    testExpression() {
        return this.testSymbol('(');
    }
    testExpressionEnd() {
        if (this.endOfText) {
            if (this.depth == 0 || !this.verify) return true;
            throw new Error('Unexpected end of expression');
        }
        return this.testSymbol(')');
    }
    parseExpression() {
        this.depth++;
        if (this.depth != 0) this.take(); // take openig "("
        this.discardWhitespace();
        // expression can start with:
        // - expression: (...)
        // - flip: !...
        // - literal: var/string/number/bool
        let value;
        if (this.testExpression()) {
            value = this.parseExpression();
        } else if (this.testFlip()) {
            value = this.parseFlip();
        } else if (this.testLiteral()) {
            value = this.parseLiteral();
        } else if (this.verify) {
            throw new Error('What?');
        }
        this.discardWhitespace();
        if (this.testExpressionEnd()) {
            if (this.depth != 0) this.take(); // take closing ")"
            this.depth--;
            this.discardWhitespace();
            // expression can be followed by:
            // - comparison
            // - operator
            // - math operator
            if (this.testComparison()) {
                value = this.parseComparison(value);
            } else if (this.testOperator()) {
                value = this.parseOperator(value);
            } else if (this.testMath()) {
                value = this.parseMath(value);
            }
        } else {
            throw new Error('Unexpected end of expression');
        }
        return value;
    }


    testFlip() {
        return this.testSymbol('!');
    }
    parseFlip() {
        this.take(); // take "!"
        // flip must be followed by one of:
        // - expression: (...)
        // - literal: var/string/number/bool
        let value;
        if (this.testExpression()) {
            const v = this.parseExpression();
            value = ()=>!v();
        } else if (this.testLiteral()) {
            const v = this.parseLiteral(false);
            value = ()=>!v();
        } else if (this.verify) {
            throw new Error('What?');
        }
        this.discardWhitespace();
        // flipped value must be directly followed by one of:
        // - end of expression
        // - comparison
        // - operator
        let op;
        if (this.testExpressionEnd()) {
            // ok
        } else if (this.testComparison()) {
            op = this.parseComparison(value);
        } else if (this.testOperator()) {
            op = this.parseOperator(value);
        } else if (this.verify) {
            throw new Error('What?');
        }
        return op ?? value;
    }


    testLiteral() {
        return this.testBool() || this.testVar() || this.testString() || this.testNumber() || this.testList();
    }
    parseLiteral(open = true) {
        let value;
        let isOpen = false;
        if (this.testBool()) {
            value = this.parseBool();
            isOpen = open;
        } else if (this.testVar()) {
            value = this.parseVar();
            isOpen = open;
        } else if (this.testString()) {
            value = this.parseString();
            isOpen = open;
        } else if (this.testNumber()) {
            value = this.parseNumber();
            isOpen = open;
        } else if (this.testList()) {
            value = this.parseList();
            isOpen = open;
        } else if (this.verify) {
            throw new Error('What?');
        }
        if (isOpen) {
            this.discardWhitespace();
            // value can be followed by:
            // - comparison
            // - operator
            // - math operator
            if (this.testComparison()) {
                value = this.parseComparison(value);
            } else if (this.testOperator()) {
                value = this.parseOperator(value);
            } else if (this.testMath()) {
                value = this.parseMath(value);
            }
        }
        return value;
    }

    testBool() {
        return this.testSymbol('true') || this.testSymbol('false');
    }
    parseBool() {
        if (this.charAhead.startsWith('true')) {
            this.take(4);
            return ()=>true;
        } else if (this.charAhead.startsWith('false')) {
            this.take(5);
            return ()=>false;
        }
    }

    testVar() {
        return this.testSymbol(/[a-z_][a-z_0-9]*/i);
    }
    parseVar() {
        const name = /^[a-z_][a-z_0-9]*/i.exec(this.charAhead)[0];
        this.take(name.length);
        return ()=>{
            const val = resolveVariable(name, this.scope);
            try {
                return JSON.parse(val);
            } catch { /* empty */ }
            return val;
        };
    }

    testString() {
        return this.testSymbol('"');
    }
    testStringEnd() {
        if (this.endOfText) {
            if (this.verify) throw new Error('Unexpected end of string');
            return true;
        }
        return this.testSymbol('"');
    }
    parseString() {
        this.take(); // discard opening quote
        let value = '';
        while (!this.testStringEnd()) value += this.take();
        this.take(); // discard closing quote
        return ()=>value;
    }

    testList() {
        return this.testSymbol('[');
    }
    testListEnd() {
        if (this.endOfText) {
            if (this.verify) throw new Error('Unexpected end of list');
            return true;
        }
        return this.testSymbol(']');
    }
    parseList() {
        let text = this.take(); // take opening "["
        let stack = 0;
        while (stack > 0 || !this.testListEnd()) {
            if (this.testList()) stack++;
            else if (this.testListEnd()) stack--;
            text += this.take();
        }
        text += this.take(); // take cloing "]"
        const value = JSON.parse(text);
        return ()=>value;
    }

    testNumber() {
        return this.testSymbol(/-?(\d+(\.\d+)?|\.\d+)/);
    }
    parseNumber() {
        const match = /^-?(\d+(\.\d+)?|\.\d+)/.exec(this.charAhead)[0];
        this.take(match.length);
        const value = Number(match);
        return ()=>value;
    }


    testComparison() {
        return this.testSymbol(/==|!=|<=?|>=?|in |not in |starts with |ends with /);
    }
    parseComparison(a) {
        const op = /^(==|!=|<=?|>=?|in |not in |starts with |ends with )/.exec(this.charAhead)[0];
        this.take(op.length);
        this.discardWhitespace();
        // comparison operation must be followed by:
        // - expression
        // - literal
        // - flip
        let b;
        if (this.testExpression()) {
            b = this.parseExpression();
        } else if (this.testLiteral()) {
            b = this.parseLiteral();
        } else if (this.testFlip()) {
            b = this.parseFlip();
        } else if (this.verify) {
            throw new Error('What?');
        }
        switch (op.trim()) {
            case '==': return ()=>a() == b();
            case '!=': return ()=>a() != b();
            case '<': return ()=>a() < b();
            case '<=': return ()=>a() <= b();
            case '>': return ()=>a() > b();
            case '>=': return ()=>a() >= b();
            case 'in': return ()=>b().includes(a());
            case 'not in': return ()=>!b().includes(a());
            case 'starts with': return ()=>a().startsWith(b());
            case 'ends with': return ()=>a().endsWith(b());
            default: {
                throw new Error('What?');
            }
        }
    }

    testMath() {
        return this.testSymbol(/\+|-|\*{1,2}|\/|%/);
    }
    parseMathPair() {
        const op = /^(\+|-|\*{1,2}|\/|%)/.exec(this.charAhead)[0];
        this.take(op.length);
        this.discardWhitespace();
        // math operator must be followed by:
        // - expression
        // - literal
        let value;
        if (this.testExpression()) {
            value = this.parseExpression();
        } else if (this.testLiteral()) {
            value = this.parseLiteral(false);
        } else if (this.verify) {
            throw new Error('What?');
        }
        this.discardWhitespace();
        return { op, value };
    }
    parseMath(a) {
        let values = [a];
        let ops = [];
        while (this.testMath()) {
            const { op, value } = this.parseMathPair();
            values.push(value);
            ops.push(op);
        }
        const opsDict = {
            '+': (a, b)=>a() + b(),
            '-': (a, b)=>a() - b(),
            '*': (a, b)=>a() * b(),
            '/': (a, b)=>a() / b(),
            '%': (a, b)=>a() % b(),
            '**': (a, b)=>a() ** b(),
        };
        // make sub-expressions
        const ooo = ['**', '*', '/', '-', '+', '%'];
        for (const o of ooo) {
            for (let i = 0; i < ops.length; i++) {
                if (ops[i] == o) {
                    const a = values[i];
                    const b = values[i + 1];
                    values[i] = ()=>opsDict[o](a, b);
                    values.splice(i + 1, 1);
                    ops.splice(i, 1);
                    i--;
                }
            }
        }
        return values[0];
    }

    testOperator() {
        return this.testSymbol(/(and|or) /i);
    }
    parseOperatorPair() {
        let op = /^(and|or) /i.exec(this.charAhead)[0];
        this.take(op.length);
        op = op.trim();
        this.discardWhitespace();
        // math operator must be followed by:
        // - expression
        // - literal
        let value;
        if (this.testFlip()) {
            value = this.parseFlip();
        } else if (this.testExpression()) {
            value = this.parseExpression();
        } else if (this.testLiteral()) {
            value = this.parseLiteral(false);
        } else if (this.verify) {
            throw new Error('What?');
        }
        this.discardWhitespace();
        return { op, value };
    }
    parseOperator(a) {
        let values = [a];
        let ops = [];
        while (this.testOperator()) {
            const { op, value } = this.parseOperatorPair();
            values.push(value);
            ops.push(op);
        }
        const opsDict = {
            'and': (a,b)=>a() && b(),
            'or': (a,b)=>a() || b(),
        };
        // make sub-expressions
        const ooo = ['and', 'or'];
        for (const o of ooo) {
            for (let i = 0; i < ops.length; i++) {
                if (ops[i] == o) {
                    const a = values[i];
                    const b = values[i + 1];
                    values[i] = ()=>opsDict[o](a, b);
                    values.splice(i + 1, 1);
                    ops.splice(i, 1);
                    i--;
                }
            }
        }
        return values[0];
    }
}
