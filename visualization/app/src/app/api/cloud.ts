import { Anchor } from "./anchor";
import { functions } from './functions';
import { MessageService } from 'primeng/components/common/messageservice';

export class Cloud {
    anchors: Anchor[];
    determinedAnchors: Anchor[];

    constructor(private messageService: MessageService) {
        this.anchors = [];
        this.determinedAnchors = [];
    }

    addNode(name, pos) {
        if (this.getNodeByName(name) == null) {
            let node = new Anchor(name, pos);
            this.anchors.push(node);
            return node;
        }
        return null;
    }

    removeNode(name) {
        let node = this.getNodeByName(name)
        if (node != null) {
            this.anchors.forEach(function (elem) { elem.deleteNeighbour(this) }, node);
            this.anchors = this.anchors.filter(function (elem) { return elem != node });
            return true;
        }
        return false;
    }

    addDist(nameA, nameB, dist) {
        let nodeA = this.getNodeByName(nameA);
        let nodeB = this.getNodeByName(nameB);
        if (nodeA && nodeB) {
            nodeA.addNeighbour(nodeB, dist);
            nodeB.addNeighbour(nodeA, dist);
            return true;
        }
        return false;
    }

    getDist(range, deviation) {
        let result = "";
        for (let i = 0; i < this.anchors.length; i++) {
            result += this.anchors[i].getNeighboursString();
			/*for(j=0;j<this.anchors.length;j++){
                if(i!=j){
					let distance = Math.sqrt(Math.pow(this.anchors[i].pos.x - this.anchors[j].pos.x, 2) + Math.pow(this.anchors[i].pos.y - this.anchors[j].pos.y, 2) + Math.pow(this.anchors[i].pos.z - this.anchors[j].pos.z, 2));
					if(distance<range+getRandom(-deviation,deviation)){
						result+=this.anchors[i].name+";"+this.anchors[j].name+";"+distance+"\n";
					}				
				}
			}*/
        }
        return result
    }

    getNodeByName(name) {
        return this.anchors.filter(function (element) { return element.name == name; })[0] || null;
    }

    randomAnchors(count, min, max) {
        for (let i = 0; i < count; i++) {
            let node = new Anchor(i, { "x": functions.getRandom(min, max), "y": functions.getRandom(min, max), "z": functions.getRandom(min, max) });
            this.anchors.push(node);
        }
    }

    calcAllNeighbours(range, deviation) {
        for (let i = 0; i < this.anchors.length; i++) {
            this.calcNeighbours(this.anchors[i].name, range, deviation)
        }
    }

    calcNeighbours(name, range, deviation) {
        let node = this.getNodeByName(name);
        if (node != null && node.pos != null) {
            node.neighbours = [];
            for (let j = 0; j < this.anchors.length; j++) {
                if (node.name != this.anchors[j].name && this.anchors[j].pos != null) {
                    let distance = Math.sqrt(Math.pow(node.pos.x - this.anchors[j].pos.x, 2) + Math.pow(node.pos.y - this.anchors[j].pos.y, 2) + Math.pow(node.pos.z - this.anchors[j].pos.z, 2));
                    if (distance < range + functions.getRandom(-deviation, deviation)) {
                        node.addNeighbour(this.anchors[j], distance);
                    }
                }
            }
        }
    }

    toString(accuracy) {
        //this.anchors.forEach(function(elem){if(elem.pos){pos=roundV(elem.pos,2);console.log(elem.name+":{x:"+pos.x+",y:"+pos.y+",z:"+pos.z+"}")}else{console.log(elem.name+":Position unbestimmt")}});
        let result = "";
        this.anchors.forEach(elem => {
            if (elem.pos) {
                let pos = functions.vec2Pos(functions.roundV(functions.pos2Vec(elem.pos), accuracy));
                result += elem.name + ":Punkt(" + pos.x + "," + pos.y + "," + pos.z + ")\n";
            }
            else {
                result += (elem.name + ":Position unbestimmt\n")
            }
        });
        return result.slice(0, -1);
    }

    clearPositions() {
        for (let i = 0; i < this.anchors.length; i++) {
            this.anchors[i].pos = null;
        }
    }

    async calcPositions() {
        console.log("Berechnung gestartet");
        let clouds = this.getCompletedClouds();
        console.log("Vollständige Ankerwolken bestimmt");
        // this.messageService.add({sticky:true,severity:'success', summary: 'Vollständige Ankerwolken bestimmt', detail:'Für mehr Details bitte die Konsole öffnen'});
        // console.log(clouds);
        for (let i = 0; i < clouds.length; i++) {
            if (this.setGroundAnchors(clouds[0])) { break; }
            clouds.push(clouds.shift());
        }
        if (this.determinedAnchors.length > 3) {
            for (let i = 0; i < clouds.length; i++) {
                //let intersection = clouds[i].filter(function(elem) { return this.indexOf(elem) >-1; },this.determinedAnchors);
                let intersection = this.determinedAnchors.filter(function (elem) { return this.indexOf(elem) > -1; }, clouds[i]);
                let s = this.getFourIndependentAnchors(intersection, false)
                if (s.length > 3) {
                    let difference = clouds[i].filter(function (elem) { return this.indexOf(elem) < 0; }, this.determinedAnchors);
                    for (let k = 0; k < difference.length; k++) {
                        this.setAbsolutePosition(s, difference[k]);
                    };
                    clouds.splice(i, 1);
                    i = -1;
                }
            }
            let undefinedAnchors = this.anchors.filter(function (elem) { return elem.pos == null });
            if (undefinedAnchors.length > 0) {
                console.log("Es konnten NICHT alle Anker eindeutig bestimmt werden!");
                this.messageService.add({sticky:true,severity:'info', summary: 'Nicht alle Anker konnten bestimmt werden!', detail:'Für mehr Details bitte die Konsole öffnen'});
                console.log("Gegebenenfalls müssen mehr Anker im Gebäude plaziert werden.");
                // console.log("Folgende Anker konnten nicht bestimmt werden:");
                // undefinedAnchors.forEach(function(elem){console.log(elem.name)});
            }
            else {
                console.log("Alle Anker konnten bestimmt werden!");
                this.messageService.add({sticky:true,severity:'success', summary: 'Alle Anker bestimmt', detail:''});
            }
            //console.log("Folgende Ankerpositionen konnten bestimmt werden:");
            //this.determinedAnchors.forEach(function(elem){console.log(elem.name+":{x:"+elem.pos.x+",y:"+elem.pos.y+",z:"+elem.pos.z+"}")});
            //this.determinedAnchors.forEach(function(elem){pos=roundV(elem.pos,2);console.log(elem.name+":"+pos.x+",y:"+pos.y+",z:"+pos.z+"}")});
        }
        else {
            console.log("Keine Ankerkombination steht sozu einander, dass eine eindeutige Positionsbestimmung möglich ist.");
            this.messageService.add({sticky:true,severity:'error', summary: 'Positionsbestimmung nicht möglich', detail:'Keine Ankerkombination steht sozu einander, dass eine eindeutige Positionsbestimmung möglich ist.'});
        }
        for (let i = 0; i < this.determinedAnchors.length; i++) {
            for (let j = 0; j < this.determinedAnchors.length; j++) {
                if (i != j) {
                    this.determinedAnchors[i].addNeighbour(this.determinedAnchors[j], Math.sqrt(Math.pow(this.determinedAnchors[i].pos.x - this.determinedAnchors[j].pos.x, 2) + Math.pow(this.determinedAnchors[i].pos.y - this.determinedAnchors[j].pos.y, 2) + Math.pow(this.determinedAnchors[i].pos.z - this.determinedAnchors[j].pos.z, 2)));
                }
            }
        }
    }

    adjustCOS(fixednodes) {
        this.messageService.add({sticky:true,severity:'info', summary: 'Ausrichtung des Koordinatensystem gestartet', detail:'Die bestimmten Anker werden nun anhand von fixen Ankern im Erdkoordinatensystem ausgerichtet'});
        fixednodes.forEach(a => {
            if (a.pos && a.pos.x && a.pos.y && a.pos.z) {
                fixednodes.forEach(b => {
                    if (b.pos && b.pos.x && b.pos.y && b.pos.z) {
                        a.addNeighbour(b, Math.sqrt(Math.pow(a.pos.x - b.pos.x, 2) + Math.pow(a.pos.y - b.pos.y, 2) + Math.pow(a.pos.z - b.pos.z, 2)));
                    }
                });
            }
        });
        // console.log(fixednodes);
        let adjustAnchor = this.getFourIndependentAnchors(fixednodes, false);
        let determinedFixedNodes = [];
        adjustAnchor.forEach(elem => {
            let pos = this.getAbsolutePosition(elem);
            if (pos) {
                determinedFixedNodes.push([elem.pos, pos]);
            }
        });
        // console.log(determinedFixedNodes);
        if (determinedFixedNodes.length > 3) {
            let v = [[determinedFixedNodes[0][0].x - determinedFixedNodes[1][0].x, determinedFixedNodes[0][0].y - determinedFixedNodes[1][0].y, determinedFixedNodes[0][0].z - determinedFixedNodes[1][0].z],
            [determinedFixedNodes[0][0].x - determinedFixedNodes[2][0].x, determinedFixedNodes[0][0].y - determinedFixedNodes[2][0].y, determinedFixedNodes[0][0].z - determinedFixedNodes[2][0].z],
            [determinedFixedNodes[0][0].x - determinedFixedNodes[3][0].x, determinedFixedNodes[0][0].y - determinedFixedNodes[3][0].y, determinedFixedNodes[0][0].z - determinedFixedNodes[3][0].z]];
            let w = [[determinedFixedNodes[0][1].x - determinedFixedNodes[1][1].x, determinedFixedNodes[0][1].y - determinedFixedNodes[1][1].y, determinedFixedNodes[0][1].z - determinedFixedNodes[1][1].z],
            [determinedFixedNodes[0][1].x - determinedFixedNodes[2][1].x, determinedFixedNodes[0][1].y - determinedFixedNodes[2][1].y, determinedFixedNodes[0][1].z - determinedFixedNodes[2][1].z],
            [determinedFixedNodes[0][1].x - determinedFixedNodes[3][1].x, determinedFixedNodes[0][1].y - determinedFixedNodes[3][1].y, determinedFixedNodes[0][1].z - determinedFixedNodes[3][1].z]];
            // console.log(w);
            let u = functions.multMatrix(v, functions.matrix_invert(w));
            let r = functions.vec2Pos(functions.multMatrix(u, functions.pos2Vec(determinedFixedNodes[0][1])));
            let x = determinedFixedNodes[0][0].x - r.x;
            let y = determinedFixedNodes[0][0].y - r.y;
            let z = determinedFixedNodes[0][0].z - r.z;
            this.determinedAnchors.forEach(function (elem) {
                elem.pos = functions.vec2Pos(functions.addVector([x, y, z], functions.multMatrix(u, functions.pos2Vec(elem.pos))));
            });
            this.messageService.add({sticky:true,severity:'success', summary: 'Ausrichtung des Koordinatensystem erfolgreich', detail:''});
            return true;
        }
        else {
            console.log("Es konnten nicht genug RTK-Anker bestimmt werden!");
            this.messageService.add({sticky:true,severity:'error', summary: 'Ausrichtung des Koordinatensystem fehlgeschlagen', detail:'Für mehr Details bitte die Konsole öffnen'});
            console.log("Entweder stehen keine vier fixen Anker linear unabhängig zu einander oder die fixen Anker haben keine ausreichende Bestimmung zu den Gebäude-Ankern. Es kann helfen mehr fixe Ankerpunkte einzufügen.")
            // console.log("Folgende Anker konnten nicht bestimmt werden:");
            // fixednodes.filter(function (elem) { return this.getNodeByName(elem.name) == null; }).forEach(function (elem) { console.log(elem.name) });
        }
        return false;
    }

    getTagPosition(node, accuracy?) {
        return this.getAbsolutePosition(node);
        return functions.vec2Pos(functions.roundV(functions.pos2Vec(this.getAbsolutePosition(node)), accuracy));
    }

    getAbsolutePosition(node) {
        let intersection = node.getNeighbours().filter(function (elem) { return this.indexOf(elem) > -1 }, this.determinedAnchors);
        //let intersection = this.determinedAnchors.filter(function(elem){console.log(this.indexOf(elem));return this.indexOf(elem) > -1},node.getNeighbours());
        let s = this.getFourIndependentAnchors(intersection, false);
        if (s.length > 3) {
            return this.calcAbsolutePosition(s, node);
        }
        return null;
    }

    setAbsolutePosition(cos, node) {
        node.pos = this.calcAbsolutePosition(cos, node);
        this.determinedAnchors.push(node);
    }

    calcAbsolutePosition(cos, node) {
        let a = [cos[1].pos.x - cos[0].pos.x,
        cos[1].pos.y - cos[0].pos.y,
        cos[1].pos.z - cos[0].pos.z];
        let b = [cos[2].pos.x - cos[0].pos.x,
        cos[2].pos.y - cos[0].pos.y,
        cos[2].pos.z - cos[0].pos.z];
        let x = functions.unitV(a);
        let z = functions.unitV(functions.crossP(a, b));
        let mz = [-z[0], -z[1], -z[2]];
        let y = functions.unitV(functions.crossP(x, mz));
        let x1 = cos[0].getDist(cos[1]);
        let x2 = (Math.pow(cos[0].getDist(cos[2]), 2) - Math.pow(cos[1].getDist(cos[2]), 2) + Math.pow(x1, 2)) / (2 * x1);
        let y2 = Math.sqrt(Math.pow(cos[0].getDist(cos[2]), 2) - Math.pow(x2, 2));
        let d = [node.getDist(cos[0]), node.getDist(cos[1]), node.getDist(cos[2]), node.getDist(cos[3])]
        let x3 = (Math.pow(d[0], 2) - Math.pow(d[1], 2) + Math.pow(x1, 2)) / (2 * x1);
        let y3 = (Math.pow(d[0], 2) - Math.pow(x3, 2) - Math.pow(d[2], 2) + Math.pow(x2 - x3, 2) + Math.pow(y2, 2)) / (2 * y2);
        //let z3=Math.sqrt(Math.pow(d[0],2)-Math.pow(x3,2)-Math.pow(y3,2));
        //let z3 = Math.sqrt(Math.round(Math.pow(d[0],2))-Math.round(Math.pow(x3,2)-Math.pow(y3,2)));
        let z3 = Math.sqrt(Math.abs(Math.pow(d[0], 2) - Math.pow(x3, 2) - Math.pow(y3, 2)));
        let m1 = functions.vec2Pos(functions.addVector(functions.pos2Vec(cos[0].pos), functions.multMatrix([x, y, z], [x3, y3, z3])))
        let m2 = functions.vec2Pos(functions.addVector(functions.pos2Vec(cos[0].pos), functions.multMatrix([x, y, mz], [x3, y3, z3])))
        let r1 = Math.sqrt(Math.pow(cos[3].pos.x - m1.x, 2) + Math.pow(cos[3].pos.y - m1.y, 2) + Math.pow(cos[3].pos.z - m1.z, 2));
        let r2 = Math.sqrt(Math.pow(cos[3].pos.x - m2.x, 2) + Math.pow(cos[3].pos.y - m2.y, 2) + Math.pow(cos[3].pos.z - m2.z, 2));
        // console.log(Math.abs(d[3] - r1),Math.abs(d[3] - r2))
        if (Math.abs(d[3] - r1) < Math.abs(d[3] - r2)) {
            return m1
        }
        else {
            return m2
        }
    }
    getFourIndependentAnchors(cloud, setValues) {
        for (let i = 0; i < cloud.length; i++) {
            for (let j = i + 1; j < cloud.length; j++) {
                if (cloud[i].getDist(cloud[j]) > 0) {
                    for (let k = 0; k < cloud.length; k++) {
                        if (k != i && k != j) {
                            let d = [cloud[i].getDist(cloud[j]), cloud[i].getDist(cloud[k]), cloud[j].getDist(cloud[k])].sort();
                            if (d[0] + d[1] != d[2]) {
                                d = [cloud[i].getDist(cloud[j]), cloud[i].getDist(cloud[k]), cloud[j].getDist(cloud[k])];
                                //d[0]:ab;d[1]:ac;d[2]:bc
                                let x1 = d[0];																					//ab
                                let x2 = (Math.pow(d[1], 2) - Math.pow(d[2], 2) + Math.pow(d[0], 2)) / (2 * d[0]);							//(ac^2-bc^2+ab^2)/(2*ab)
                                let y2 = Math.sqrt(Math.pow(d[1], 2) - Math.pow(x2, 2));												//√(ac^2-xc^2
                                for (let m = 0; m < cloud.length; m++) {
                                    if (m != i && m != j && m != k) {
                                        //d2[0]:ad;d2[1]:bd;d2[2]:cd
                                        let d2 = [cloud[i].getDist(cloud[m]), cloud[j].getDist(cloud[m]), cloud[k].getDist(cloud[m])];
                                        let x3 = (Math.pow(d2[0], 2) - Math.pow(d2[1], 2) + Math.pow(d[0], 2)) / (2 * d[0]);
                                        let y3 = (Math.pow(d2[0], 2) - Math.pow(x3, 2) - Math.pow(d2[2], 2) + Math.pow(x2 - x3, 2) + Math.pow(y2, 2)) / (2 * y2)
                                        let z3 = Math.sqrt(Math.round(Math.pow(d2[0], 2)) - Math.round(Math.pow(x3, 2) + Math.pow(y3, 2)));
                                        //let z3=Math.sqrt(Math.pow(d2[0],2)-Math.pow(x3,2)-Math.pow(y3,2));
                                        if (z3 != 0) {
                                            //if(Math.round(Math.pow(d2[0],2))-Math.round(Math.pow(x3,2)+Math.pow(y3,2))!=0){
                                            if (setValues) {
                                                cloud[i].setPosition(0, 0, 0);
                                                cloud[j].setPosition(x1, 0, 0);
                                                cloud[k].setPosition(x2, y2, 0);
                                                cloud[m].setPosition(x3, y3, z3);
                                                this.determinedAnchors.push(cloud[i]);
                                                this.determinedAnchors.push(cloud[j]);
                                                this.determinedAnchors.push(cloud[k]);
                                                this.determinedAnchors.push(cloud[m]);
                                            }
                                            //console.log([cloud[i],cloud[j],cloud[k],cloud[m]])
                                            return [cloud[i], cloud[j], cloud[k], cloud[m]];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    }

    setGroundAnchors(cloud) {
        return !!this.getFourIndependentAnchors(cloud, true);
    }

    getCompletedClouds() {
        let temp1 = [], temp2 = [];
        for (let i = 0; i < this.anchors.length; i++) {
            for (let j = 0; j < this.anchors[i].neighbours.length; j++) {
                if (this.anchors[i].name < this.anchors[i].neighbours[j].node.name) {
                    temp1.push([this.anchors[i], this.anchors[i].neighbours[j].node]);
                }
            }
        }
        while (1) {
            for (let i = 0; i < temp1.length; i++) {
                for (let j = 0; j < this.anchors.length; j++) {
                    if (temp1[i].slice(-1)[0].name < this.anchors[j].name && this.anchors[j].haveAllNeighbours(temp1[i])) {
                        temp2.push(temp1[i].concat(this.anchors[j]));
                    }
                }
            }
            if (temp2.length == 0) {
                return temp1.reverse();
            }
            temp1 = temp1.filter(function (shotelem) {
                return temp2.filter(function (longelem) {
                    return shotelem.filter(function (node) {
                        return longelem.indexOf(node) > -1
                    }).length == shotelem.length
                }).length == 0
            }).concat(temp2);
            temp2 = [];
        }
    }
}
