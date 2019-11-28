export class knoten {
    name: string;
    neighbours: any[];
    pos: any;
    hasNeighbour(node) {
        return false;
    }
    constructor(name, pos) {
        this.name = name
        this.neighbours = [];
        this.pos = pos;
    }

    addNeighbour(node, dist) {
        let s = this.neighbours.filter(function (elem) { return elem.node == node; })
        if (s.length > 0) {
            s[0].dist = (s[0].dist + dist) / 2;
        }
        else {
            this.neighbours.push({ "node": node, "dist": dist });
        }
    }

    deleteNeighbour(node) {
        this.neighbours = this.neighbours.filter(function (elem) { return elem.node != this }, node);
    }

    setPosition(x, y, z) {
        this.pos = { "x": x, "y": y, "z": z };
    }

    getNeighboursString() {
        let result = ""
        this.neighbours.forEach(function (elem) { result += this + ";" + elem.node.name + ";" + elem.dist + "\n" }, this.name);
        //this.neighbours.forEach(function(elem){result+="cloud.addDist(\""+this+"\",\""+elem.node.name+"\","+elem.dist+");\n"},this.name);
        //this.neighbours.forEach(function(elem){result+="cloud.getNodeByName(\""+this+"\").addNeighbour(cloud.getNodeByName(\""+elem.node.name+"\"),"+elem.dist+");\n"},this.name);
        //this.neighbours.forEach(function(elem){result+=this+".addNeighbour(cloud.getNodeByName(\""+elem.node.name+"\"),"+elem.dist+");\n"},this.name);
        return result;
    }
    getNeighbours() {
        let result = [];
        this.neighbours.forEach(function (elem) { result.push(elem.node); });
        return result;
    }

    getDist(node) {
        return this.neighbours.filter(function (element) { return element.node == node; })[0].dist || null;
    }

    haveAllNeighbours(searchFor) {
        return this.neighbours.filter(function (elem) { return this.indexOf(elem.node) > -1 }, searchFor).length >= searchFor.length;
    }
}
