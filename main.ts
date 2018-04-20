class FormItem{
    constructor(public type: string, public field: string, public label: string, public id: string){};
}
class Control{
    constructor(public template: string){};
    replaceAll(input: string, search: string, replacement: string) {
        return input.replace(new RegExp(search, 'g'), replacement);
    };
    public render(input: FormItem) : Element{
        var newElement = document.createElement("div");
        let itemTemplate = this.template;
        itemTemplate = this.replaceAll(itemTemplate, "#id#", input.id);
        itemTemplate = this.replaceAll(itemTemplate, "#label#", input.label);
        newElement.innerHTML = itemTemplate;
        return newElement;
    }
}
class Mapping{
    constructor(public field: string, public control: string, public id: string){};
}
class Engine{
    private target: Element;
    private data: {[id:string] : any};
    public controls: {[id:string] : Control};
    public mapping : Array<FormItem>;
    private controlMapping: {[id:string] : Element};
    constructor(element: string){
        var target = document.querySelector(element);
        if (target == null){
            throw "Unable to find element: " + element;
        }
        this.target = <Element>document.querySelector(element);
        this.target.addEventListener("change", (event: Event) => { this.updateModel(event, this.data)});
        this.data = {};
        this.controls = {};
        this.controlMapping = {};
        this.mapping = new Array<FormItem>();
        this.render();
    }
    public render(): void{
        console.log("Rendering");
        this.mapping.forEach((item) => {
            if (this.controlMapping[item.id] === undefined){
                let element = this.controls[item.type].render(item);
                this.controlMapping[item.id] = element;
                this.target.appendChild(element);
            }
        });
        this.bindData();
    }
    private updateModel(input: Event, data :{[id:string] : any}){
        console.log("updated model");
        var element =(<HTMLInputElement>input.target);
        if (element.hasAttribute("fdb-data-reverse")){
            data[<string>element.getAttribute("fdb-data-reverse")] = element.value;
        }
        this.bindData();
    }
    public bindData(): void{
        console.log("Binding");
        this.mapping.forEach((item) => {
            if (this.controlMapping[item.id] !== undefined){
                let element = this.controlMapping[item.id];
                let childElements = element.querySelectorAll("[fdb]");
                for (let i = 0; i < childElements.length; i++){
                    switch(childElements[i].nodeName){
                        case "LABEL":
                        case "DIV":
                        case "SPAN":
                            if (childElements[i].hasAttribute("fdb-label")){
                                childElements[i].textContent = item.label;
                            }
                            break;
                        case "INPUT":
                            if (childElements[i].hasAttribute("fdb-data")){
                                (<HTMLInputElement>childElements[i]).value = this.data[item.field];
                                childElements[i].setAttribute("fdb-data-reverse", item.field);
                            }
                            break;
                    }
                }
            }
        });
    }
    public addField(item: FormItem){
        this.mapping.push(item);
        this.render();
    }
    public setData(item: string, value: any){
        this.data[item] = value;
        this.bindData();
    }
    public getData(item: any){
        return this.data[item];
    }
}

let e = new Engine("#target");
e.controls["text"] = new Control('<div class="form-group"><label for="#id#" fdb fdb-label></label><input id="#id#" type="text" class="form-control" fdb fdb-data /></div>');
e.controls["number"] = new Control('<div class="form-group"><label for="#id#" fdb fdb-label></label><input class="form-control" id="#id#" type="number" fdb fdb-data /></div>');
e.controls["label"] = new Control('<div fdb fdb-data></div>');
e.setData("id", "1");
e.setData("count", 1);
e.addField(new FormItem("text", "id", "Random Label", "id_field"));
e.addField(new FormItem("label", "id", "Random Label", "label_field"));
e.addField(new FormItem("text", "count", "Other field", "other_field"));
e.addField(new FormItem("number", "count", "Count Field", "count_field"));
function testLoad(){
    let ns = document.createElement("script");
    ns.setAttribute("src", "test.js");
    let body = document.querySelector("body");
    (<Element>body).appendChild(ns);
}