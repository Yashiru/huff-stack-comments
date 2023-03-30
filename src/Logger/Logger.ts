export class Logger{
    private level = 10;

    constructor(){}

    public setLevel(level: number){
        this.level = level;
    }

    public log(val: any, level: number){
        if(level <= this.level){
            console.log(val);
        }
    }

}