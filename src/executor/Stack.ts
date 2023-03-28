export class Stack{
    private cachedStacks: string[][] = [[]];
    private stackValues: string[] = [];

    constructor(initialStack?: string[]){
        this.reset(initialStack);
    }

    public reset(initialStack?: string[]){
        this.stackValues = initialStack || [];
    }

    public cache(persistentCount?: number){
        let stackToCache = [...this.stackValues];
        this.stackValues = [];
        if(persistentCount !== undefined && persistentCount > 0){
            this.stackValues = this.stackValues.concat(
                stackToCache.slice(0, persistentCount)
            );
            this.cachedStacks.push(stackToCache.slice(persistentCount, stackToCache.length));
        }
        else{
            this.cachedStacks.push(stackToCache);
        }
    }

    public uncache(persistentCount?: number){
        if(this.cachedStacks.length > 0){
            const tempStack = this.stackValues;
            this.stackValues = [...this.cachedStacks[this.cachedStacks.length-1]];
            this.cachedStacks.pop();
            if(persistentCount !== undefined && persistentCount > 0){
                this.stackValues = tempStack.slice(0, persistentCount).concat(this.stackValues);
            }
        }
        else{
            this.stackValues = [];
        }
    }

    public push(value: string){
        this.stackValues.unshift(value);
    }

    public pop(){
        const popedVal = this.stackValues[0];
        this.stackValues.shift();
        return popedVal;
    }

    public dup(index: number){
        this.stackValues.unshift(
            this.stackValues[index - 1]
        );
    }

    public swap(index: number){
        const temp = this.stackValues[0];

        this.stackValues[0] = this.stackValues[index];
        this.stackValues[index] = temp;
    }

    public getStackComment(){        
        let tempStack = [...this.stackValues];
        tempStack = tempStack.map((value) => {
            value = value.replace(/[aA]{5,}/, "aa...a");
            value = value.replace(/[bB]{5,}/, "bb...b");
            value = value.replace(/[cC]{5,}/, "cc...c");
            value = value.replace(/[dD]{5,}/, "dd...d");
            value = value.replace(/[eE]{5,}/, "ee...e");
            value = value.replace(/[fF]{5,}/, "ff...f");
            value = value.replace(/[0]{5,}/, "00...0");
            value = value.replace(/[1]{5,}/, "11...1");
            value = value.replace(/[2]{5,}/, "22...2");
            value = value.replace(/[3]{5,}/, "33...3");
            value = value.replace(/[4]{5,}/, "44...4");
            value = value.replace(/[5]{5,}/, "55...5");
            value = value.replace(/[6]{5,}/, "66...6");
            value = value.replace(/[7]{5,}/, "77...7");
            value = value.replace(/[8]{5,}/, "88...8");
            value = value.replace(/[9]{5,}/, "99...9");

            return value;
        });
        
        return "[" + tempStack.join(", ") + "]";
    }
}