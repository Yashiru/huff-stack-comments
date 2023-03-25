export class Stack{
    private stackValues: string[] = []

    constructor(initialStack?: string[]){
        this.reset(initialStack)
    }

    public reset(initialStack?: string[]){
        this.stackValues = initialStack || []
    }
    public push(value: string){
        this.stackValues.push(value)
    }

    public pop(){
        const popedVal = this.stackValues[
            this.stackValues.length-1
        ]
        this.stackValues.pop()
        return popedVal
    }

    public dup(index: number){
        this.push(
            this.stackValues[index]
        )
    }

    public swap(index: number){
        const index1 = this.stackValues.length-1
        const temp = this.stackValues[index1];
        this.stackValues[index1] = this.stackValues[index];
        this.stackValues[index] = temp;
    }

    public getStackComment(){
        let tempStack = [...this.stackValues]
        tempStack = tempStack.map((value) => {
            value = value.replace(/[aA]{5,}/, "AA...A")
            value = value.replace(/[bB]{5,}/, "BB...B")
            value = value.replace(/[cC]{5,}/, "CC...C")
            value = value.replace(/[dD]{5,}/, "DD...D")
            value = value.replace(/[eE]{5,}/, "EE...E")
            value = value.replace(/[fF]{5,}/, "FF...F")
            value = value.replace(/[0]{5,}/, "00...0")
            value = value.replace(/[1]{5,}/, "11...1")
            value = value.replace(/[2]{5,}/, "22...2")
            value = value.replace(/[3]{5,}/, "33...3")
            value = value.replace(/[4]{5,}/, "44...4")
            value = value.replace(/[5]{5,}/, "55...5")
            value = value.replace(/[6]{5,}/, "66...6")
            value = value.replace(/[7]{5,}/, "77...7")
            value = value.replace(/[8]{5,}/, "88...8")
            value = value.replace(/[9]{5,}/, "99...9")

            return value
        })
        
        return "[" + tempStack.reverse().join(", ") + "]"
    }
}