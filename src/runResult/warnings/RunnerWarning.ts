export class RunnerWarning {
    constructor(
        public readonly message: string
    ) {
    }

    toString(): string {
        return this.message
    }
}

export class ActionConfigWarning extends RunnerWarning {

}

export class CommandWarning extends RunnerWarning {
    constructor(
        message: string,
        public readonly command: string
    ) {
        super(message);
    }
}