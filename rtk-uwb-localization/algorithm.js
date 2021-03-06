class Cloud {
	constructor() {
		this.anchors = [];
		this.determinedAnchors = [];
	}

	addNode(name, pos) {
		if (this.getNodeByName(name) == null) {
			let node = new Node(name);
			node.pos = pos;
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
			delete this.getNodeByName(name);
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
		for (i = 0; i < this.anchors.length; i++) {
			result += this.anchors[i].getNeighboursString();
		}
		return result
	}

	getNodeByName(name) {
		return this.anchors.filter(function (element) { return element.name == name; })[0] || null;
	}

	randomAnchors(count, min, max) {
		for (i = 0; i < count; i++) {
			let node = new Node(i);
			node.pos = { "x": getRandom(min, max), "y": getRandom(min, max), "z": getRandom(min, max) };
			this.anchors.push(node);
		}
	}

	calcAllNeighbours(range, deviation) {
		for (i = 0; i < this.anchors.length; i++) {
			this.calcNeighbours(this.anchors[i].name, range, deviation)
		}
	}

	calcNeighbours(name, range, deviation) {
		let node = this.getNodeByName(name);
		if (node != null && node.pos != null) {
			node.neighbours = [];
			for (j = 0; j < this.anchors.length; j++) {
				if (node.name != this.anchors[j].name && this.anchors[j].pos != null) {
					let distance = 	Math.sqrt(Math.pow(node.pos.x - this.anchors[j].pos.x, 2) + 
									Math.pow(node.pos.y - this.anchors[j].pos.y, 2) + 
									Math.pow(node.pos.z - this.anchors[j].pos.z, 2));
					if (distance < range + getRandom(-deviation, deviation)) {
						node.addNeighbour(this.anchors[j], distance);
					}
				}
			}
		}
	}

	toString(accuracy) {
		let result = "";
		this.anchors.forEach(
			function (elem) { 
				if (elem.pos) { 
					pos = vec2Pos(roundV(pos2Vec(elem.pos), accuracy)); 
					result += elem.name + ":Punkt(" + pos.x + "," + pos.y + "," + pos.z + ")\n"; 
				} 
				else { 
					result += (elem.name + ":Position unbestimmt\n") 
				} 
			}
		);
		return result.slice(0, -1);
	}

	clearPositions() {
		for (i = 0; i < this.anchors.length; i++) {
			this.anchors[i].pos = null;
		}
	}

	calcPositions() {
		let clouds = this.getCompletedClouds();
		for (let i = 0; i < clouds.length; i++) {
			if (this.setGroundAnchors(clouds[0])) { break; }
			clouds.push(clouds.shift());
		}
		if (this.determinedAnchors.length > 3) {
			for (let i = 0; i < clouds.length; i++) {
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
			undefinedAnchors = this.anchors.filter(function (elem) { return elem.pos == null });
			if (undefinedAnchors.length > 0) {
				console.log("Es konnten NICHT alle Anker eindeutig bestimmt werden!");
			}
			else {
				console.log("Alle Anker konnten bestimmt werden!");
			}
		}
		else {
			console.log("Keine Ankerkombination steht sozu einander, dass eine eindeutige Positionsbestimmung möglich ist.")
		}

		for (i = 0; i < this.determinedAnchors.length; i++) {
			for (j = 0; j < this.determinedAnchors.length; j++) {
				if (i != j) {
					this.determinedAnchors[i].addNeighbour(
						this.determinedAnchors[j], 
						Math.sqrt(
							Math.pow(this.determinedAnchors[i].pos.x - this.determinedAnchors[j].pos.x, 2) + 
							Math.pow(this.determinedAnchors[i].pos.y - this.determinedAnchors[j].pos.y, 2) + 
							Math.pow(this.determinedAnchors[i].pos.z - this.determinedAnchors[j].pos.z, 2)
						)
					);
				}
			}
		}
	}

	adjustCOS(fixednodes) {
		let determinedFixedNodes = [];
		for (let i = 0; i < fixednodes.length; i++) {
			determinedFixedNodes.push([fixednodes[i].pos, this.getAbsolutePosition(fixednodes[i])])
		};
		if (determinedFixedNodes.length > 3) {
			let v = [	
					 [determinedFixedNodes[0][0].x - determinedFixedNodes[1][0].x, 
					  determinedFixedNodes[0][0].y - determinedFixedNodes[1][0].y, 
					  determinedFixedNodes[0][0].z - determinedFixedNodes[1][0].z],
					 [determinedFixedNodes[0][0].x - determinedFixedNodes[2][0].x, 
					  determinedFixedNodes[0][0].y - determinedFixedNodes[2][0].y, 
					  determinedFixedNodes[0][0].z - determinedFixedNodes[2][0].z],
					 [determinedFixedNodes[0][0].x - determinedFixedNodes[3][0].x, 
					  determinedFixedNodes[0][0].y - determinedFixedNodes[3][0].y, 
					  determinedFixedNodes[0][0].z - determinedFixedNodes[3][0].z]
					];
			let w = [
					 [determinedFixedNodes[0][1].x - determinedFixedNodes[1][1].x, 
					  determinedFixedNodes[0][1].y - determinedFixedNodes[1][1].y, 
					  determinedFixedNodes[0][1].z - determinedFixedNodes[1][1].z],
					 [determinedFixedNodes[0][1].x - determinedFixedNodes[2][1].x, 
					  determinedFixedNodes[0][1].y - determinedFixedNodes[2][1].y, 
					  determinedFixedNodes[0][1].z - determinedFixedNodes[2][1].z],
					 [determinedFixedNodes[0][1].x - determinedFixedNodes[3][1].x, 
					  determinedFixedNodes[0][1].y - determinedFixedNodes[3][1].y, 
					  determinedFixedNodes[0][1].z - determinedFixedNodes[3][1].z]
					];
			let u = multMatrix(v, invMatrix(w));
			let r = vec2Pos(multMatrix(u, pos2Vec(determinedFixedNodes[0][1])));
			let x = determinedFixedNodes[0][0].x - r.x;
			let y = determinedFixedNodes[0][0].y - r.y;
			let z = determinedFixedNodes[0][0].z - r.z;
			this.determinedAnchors.forEach(function (elem) {
				elem.pos = vec2Pos(addVector([x, y, z], multMatrix(u, pos2Vec(elem.pos))));
			});
		}
		else {
			console.log("Es konnten nicht genug RTK-Anker bestimmt werden!");
			console.log("Folgende Anker konnten nicht bestimmt werden:");
			fixednodes.filter(
				function (elem) { 
					return cloud.getNodeByName(elem.name) == null;
				}
			).forEach(
				function (elem) { 
					console.log(elem.name);
				}
			);
		}
	}

	getTagPosition(node, accuracy) {
		return vec2Pos(roundV(pos2Vec(this.getAbsolutePosition(node)), accuracy));
	}

	getAbsolutePosition(node) {
		let intersection = node.getNeighbours().filter(function (elem) { return this.indexOf(elem) > -1;},this.determinedAnchors);
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
		let x = unitV(a);
		let z = unitV(crossP(a, b));
		let mz = [-z[0], -z[1], -z[2]];
		let y = unitV(crossP(x, mz));
		let x1 = cos[0].getDist(cos[1]);
		let x2 = (Math.pow(cos[0].getDist(cos[2]), 2) - Math.pow(cos[1].getDist(cos[2]), 2) + Math.pow(x1, 2)) / (2 * x1);
		let y2 = Math.sqrt(Math.pow(cos[0].getDist(cos[2]), 2) - Math.pow(x2, 2));
		let d = [node.getDist(cos[0]), node.getDist(cos[1]), node.getDist(cos[2]), node.getDist(cos[3])]
		let x3 = (Math.pow(d[0], 2) - Math.pow(d[1], 2) + Math.pow(x1, 2)) / (2 * x1);
		let y3 = (Math.pow(d[0], 2) - Math.pow(x3, 2) - Math.pow(d[2], 2) + Math.pow(x2 - x3, 2) + Math.pow(y2, 2)) / (2 * y2);
		let z3 = Math.sqrt(Math.abs(Math.pow(d[0], 2) - Math.pow(x3, 2) - Math.pow(y3, 2)));
		let m1 = vec2Pos(addVector(pos2Vec(cos[0].pos), multMatrix([x, y, z], [x3, y3, z3])))
		let m2 = vec2Pos(addVector(pos2Vec(cos[0].pos), multMatrix([x, y, mz], [x3, y3, z3])))
		let r1 = Math.sqrt(Math.pow(cos[3].pos.x - m1.x, 2) + Math.pow(cos[3].pos.y - m1.y, 2) + Math.pow(cos[3].pos.z - m1.z, 2));
		let r2 = Math.sqrt(Math.pow(cos[3].pos.x - m2.x, 2) + Math.pow(cos[3].pos.y - m2.y, 2) + Math.pow(cos[3].pos.z - m2.z, 2));
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
								let x1 = d[0];				
								let x2 = (Math.pow(d[1], 2) - Math.pow(d[2], 2) + Math.pow(d[0], 2)) / (2 * d[0]);
								let y2 = Math.sqrt(Math.pow(d[1], 2) - Math.pow(x2, 2));
								for (let m = 0; m < cloud.length; m++) {
									if (m != i && m != j && m != k) {
										let d2 = [cloud[i].getDist(cloud[m]), cloud[j].getDist(cloud[m]), cloud[k].getDist(cloud[m])];
										let x3 = (Math.pow(d2[0], 2) - Math.pow(d2[1], 2) + Math.pow(d[0], 2)) / (2 * d[0]);
										let y3 = (Math.pow(d2[0], 2) - Math.pow(x3, 2) - Math.pow(d2[2], 2) + Math.pow(x2 - x3, 2) + Math.pow(y2, 2)) / (2 * y2)
										let z3 = Math.sqrt(Math.round(Math.pow(d2[0], 2)) - Math.round(Math.pow(x3, 2) + Math.pow(y3, 2)));
										if (z3 != 0) {
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
		return false;
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

class Node {
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

function ecef2altlatlon(pos) {
	let a = 6378137;		//Äquatrorradius nach WGS84
	let b = 6356752.314;	//Polradius nach WGS84
	let x = +pos.x;
	let y = +pos.y;
	let z = +pos.z;
	let c = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	let d = Math.atan2(a * z, b * c);
	let lat = Math.atan2((z + (Math.pow(a, 2) / Math.pow(b, 2) - 1) * b * Math.pow(Math.sin(d), 3)),
		(c - (1 - Math.pow(b, 2) / Math.pow(a, 2)) * a * Math.pow(Math.cos(d), 3)));
	let n = Math.pow(a, 2) / Math.sqrt(Math.pow(a, 2) * Math.pow(Math.cos(lat), 2) +
		Math.pow(b, 2) * Math.pow(Math.sin(lat), 2));
	let lon = Math.atan2(y, x) % (2 * Math.PI);
	let alt = c / Math.cos(lat) - n;
	return { "lat": lat * 180 / Math.PI, "lon": lon * 180 / Math.PI, "alt": alt }
}

function altlatlon2ecef(res) {
	let a = 6378137.0 		//Äquatrorradius nach WGS84
	let b = 6356752.314		//Polradius nach WGS84
	let lat = +res.lat * (Math.PI / 180);
	let lon = +res.lon * (Math.PI / 180);
	let alt = +res.alt;
	let n = Math.pow(a, 2) / Math.sqrt(Math.pow(a, 2) * Math.pow(Math.cos(lat), 2) +
		Math.pow(b, 2) * Math.pow(Math.sin(lat), 2));
	let x = (n + alt) * Math.cos(lat) * Math.cos(lon);
	let y = (n + alt) * Math.cos(lat) * Math.sin(lon);
	let z = (Math.pow(b, 2) / Math.pow(a, 2) * n + alt) * Math.sin(lat);
	return { "x": x, "y": y, "z": z }
}

function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function crossP(vecA, vecB) {
	return [vecA[1] * vecB[2] - vecA[2] * vecB[1], vecA[2] * vecB[0] - vecA[0] * vecB[2], vecA[0] * vecB[1] - vecA[1] * vecB[0]];
}

function vec2Pos(vec) {
	return { "x": vec[0], "y": vec[1], "z": vec[2] };
}

function pos2Vec(pos) {
	return [pos.x, pos.y, pos.z]
}

function unitV(vec) {
	u = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
	return [vec[0] / u, vec[1] / u, vec[2] / u]
}

function multMatrix(matA, matB) {
	if (matA.length > 0 && !Array.isArray(matA[0])) { matA = [matA]; }
	if (matB.length > 0 && !Array.isArray(matB[0])) { matB = [matB]; }
	result = [];
	for (b = 0; b < matB.length; b++) {
		result.push([])
		for (a = 0; a < matA.length; a++) {
			result[result.length - 1].push(0);
			for (i = 0; i < matA.length; i++) {
				result[result.length - 1][result[result.length - 1].length - 1] += matA[i][a] * matB[b][i]
			}
		}
	}
	if (result.length == 1) {
		return result[0];
	}
	return result;
}

function invMatrix(matA) {
	let res = [];
	let n = matA.length;
	//Generieren der Einheitsmatrix
	for (let i = 0; i < n; i++) {
		if (matA[i].length == n) { res.push(Array.from(new Array(n), (x, k) => { return k == i ? 1 : 0 })); } else { return null; }
	}
	//Gauß-Jordan forward
	for (let l = 0; l < n; l++) {
		if (matA[l][l] == 0) {//Zeilentausch
			for (let i = l + 1; i < n; i++) { 
				if (matA[l][i] != 0) { 
					for (let m = 0; m < n; m++) { 
						let temp = matA[m][i]; 
						matA[m][i] = matA[m][l]; 
						matA[m][l] = temp;
						temp = res[m][i]; 
						res[m][i] = res[m][l]; 
						res[m][l] = temp; 
					}
					break;
				} 
			}
		}
		if (matA[l][l] == 0) { return null; }//Siguläre Matrix
		for (let i = l + 1; i < n; i++) {
			let t = matA[l][i] / matA[l][l];
			for (let k = 0; k < n; k++) {
				matA[k][i] -= t * matA[k][l];
				res[k][i] -= t * res[k][l];
			}
		}
	}
	//Gauß-Jordan backward
	for (let l = n - 1; l >= 0; l--) {
		if (matA[l][l] == 0) {//Zeilentausch
			for (let i = l - 1; i >= 0; i--) { 
				if (matA[l][i] != 0) { 
					for (let m = 0; m < n; m++) { 
						let temp = matA[m][i]; 
						matA[m][i] = matA[m][l]; 
						matA[m][l] = temp; 
						temp = res[m][i]; 
						res[m][i] = res[m][l]; 
						res[m][l] = temp; 
					}
					break;
				} 
			}
		}
		if (matA[l][l] == 0) { return null; }//Siguläre Matrix
		for (let i = l - 1; i >= 0; i--) {
			let t = matA[l][i] / matA[l][l];
			for (let k = n - 1; k >= 0; k--) {
				matA[k][i] -= t * matA[k][l];
				res[k][i] -= t * res[k][l];
			}
		}
	}
	//Diagonale auf "1" setzen
	for (let l = 0; l < n; l++) {
		if (matA[l][l] != 0) { for (let i = 0; i < n; i++) { res[i][l] = res[i][l] / matA[l][l]; } } else { return null; }
	}
	return res;
}

function addVector(vecA, vecB) {
	return [vecA[0] + vecB[0], vecA[1] + vecB[1], vecA[2] + vecB[2]];
}

function roundV(vec, n) {
	a = Math.pow(10, n);
	return [Math.round(vec[0] * a / a), Math.round(vec[1] * a) / a, Math.round(vec[2] * a) / a];
}

cloud = new Cloud();
dataSet1(); //Anker werden unter Angabe von kartesischen Koordindaten eingefügt
dataSet2(); //Anker werden unter Angabe von Abständen eingefügt, RTK-Anker unter Angabe von geographischen Koordinaten 
dataSet3(); //Anker werden unter Angabe von Abständen eingefügt, RTK-Anker unter Angabe von kartesischen Koordindaten 

function dataSet1() {
	console.log("DataSet1");
	cloud.addNode("A", { x: 34, y: 15, z: 39 });
	cloud.addNode("B", { x: 16, y: -3, z: 18 });
	cloud.addNode("C", { x: 34, y: -29, z: 22 });
	cloud.addNode("D", { x: 38, y: 15, z: 33 });
	cloud.addNode("A", { x: 0, y: 0, z: 0 });
	cloud.addNode("B", { x: 16, y: 0, z: 0 });
	cloud.addNode("C", { x: 20, y: -10, z: 0 });
	cloud.addNode("D", { x: 38, y: 15, z: 0 });
	cloud.addNode("E", { x: -33, y: -20, z: -28 });
	cloud.addNode("F", { x: 17, y: 39, z: 28 });
	cloud.addNode("G", { x: 5, y: 8, z: 24 });
	cloud.addNode("H", { x: -18, y: 19, z: 33 });
	cloud.addNode("I", { x: 2, y: 9, z: -11 });
	cloud.addNode("J", { x: -33, y: -28, z: -13 });

	cloud.addNode("RTK1", { x: -30, y: -30, z: 0 });
	cloud.calcNeighbours("RTK1", 72, 0);
	rtk1 = cloud.getNodeByName("RTK1");
	cloud.removeNode("RTK1");
	cloud.addNode("RTK2", { x: -20, y: 20, z: -10 });
	cloud.calcNeighbours("RTK2", 72, 0);
	rtk2 = cloud.getNodeByName("RTK2");
	cloud.removeNode("RTK2");
	cloud.addNode("RTK3", { x: 40, y: 40, z: 15 });
	cloud.calcNeighbours("RTK3", 72, 0);
	rtk3 = cloud.getNodeByName("RTK3");
	cloud.removeNode("RTK3");
	cloud.addNode("RTK4", { x: 10, y: -30, z: 20 });
	cloud.calcNeighbours("RTK4", 72, 0);
	rtk4 = cloud.getNodeByName("RTK4");
	cloud.removeNode("RTK4");

	cloud.addNode("Tag", { x: 0, y: 7, z: 0 });
	cloud.calcNeighbours("Tag", 50, 0);
	tag = cloud.getNodeByName("Tag");
	cloud.removeNode("Tag");

	cloud.calcAllNeighbours(72, 0);
	cloud.clearPositions();

	cloud.calcPositions();
	console.log(cloud.toString(6));
	cloud.adjustCOS([rtk1, rtk2, rtk3, rtk4]);
	console.log(cloud.toString(6));

	console.log(cloud.getTagPosition(tag, 6));
}

function dataSet2() {
	console.log("DataSet2");
	cloud.addNode("A", null);
	cloud.addNode("B", null);
	cloud.addNode("C", null);
	cloud.addNode("D", null);
	cloud.addNode("E", null);
	cloud.addNode("F", null);
	cloud.addNode("G", null);
	cloud.addNode("H", null);
	cloud.addNode("I", null);
	cloud.addNode("J", null);
	cloud.addDist("A", "B", 33);
	cloud.addDist("A", "C", 47.16990566028302);
	cloud.addDist("A", "D", 7.211102550927978);
	cloud.addDist("A", "F", 31.400636936215164);
	cloud.addDist("A", "G", 33.391615714128);
	cloud.addDist("A", "H", 52.49761899362675);
	cloud.addDist("A", "I", 59.665735560705194);
	cloud.addDist("B", "A", 33);
	cloud.addDist("B", "C", 31.874754901018456);
	cloud.addDist("B", "D", 32.14031735997639);
	cloud.addDist("B", "E", 69.32532004974806);
	cloud.addDist("B", "F", 43.18564576337837);
	cloud.addDist("B", "G", 16.673332000533065);
	cloud.addDist("B", "H", 43.18564576337837);
	cloud.addDist("B", "I", 34.36568055487916);
	cloud.addDist("B", "J", 63.14269553954757);
	cloud.addDist("C", "A", 47.16990566028302);
	cloud.addDist("C", "B", 31.874754901018456);
	cloud.addDist("C", "D", 45.53020975132884);
	cloud.addDist("C", "F", 70.34912934784623);
	cloud.addDist("C", "G", 47.05316142407437);
	cloud.addDist("C", "H", 71.61703707917552);
	cloud.addDist("C", "I", 59.64059020499378);
	cloud.addDist("D", "A", 7.211102550927978);
	cloud.addDist("D", "B", 32.14031735997639);
	cloud.addDist("D", "C", 45.53020975132884);
	cloud.addDist("D", "F", 32.28002478313795);
	cloud.addDist("D", "G", 34.91418050019218);
	cloud.addDist("D", "H", 56.142675390472796);
	cloud.addDist("D", "I", 57.16642371182581);
	cloud.addDist("E", "B", 69.32532004974806);
	cloud.addDist("E", "G", 70.22819946431775);
	cloud.addDist("E", "I", 48.52834223420371);
	cloud.addDist("E", "J", 17);
	cloud.addDist("F", "A", 31.400636936215164);
	cloud.addDist("F", "B", 43.18564576337837);
	cloud.addDist("F", "C", 70.34912934784623);
	cloud.addDist("F", "D", 32.28002478313795);
	cloud.addDist("F", "G", 33.481338085566414);
	cloud.addDist("F", "H", 40.620192023179804);
	cloud.addDist("F", "I", 51.43928459844674);
	cloud.addDist("G", "A", 33.391615714128);
	cloud.addDist("G", "B", 16.673332000533065);
	cloud.addDist("G", "C", 47.05316142407437);
	cloud.addDist("G", "D", 34.91418050019218);
	cloud.addDist("G", "E", 70.22819946431775);
	cloud.addDist("G", "F", 33.481338085566414);
	cloud.addDist("G", "H", 27.03701166919155);
	cloud.addDist("G", "I", 35.14256678161116);
	cloud.addDist("G", "J", 64.10148204214939);
	cloud.addDist("H", "A", 52.49761899362675);
	cloud.addDist("H", "B", 43.18564576337837);
	cloud.addDist("H", "C", 71.61703707917552);
	cloud.addDist("H", "D", 56.142675390472796);
	cloud.addDist("H", "F", 40.620192023179804);
	cloud.addDist("H", "G", 27.03701166919155);
	cloud.addDist("H", "I", 49.35585071701227);
	cloud.addDist("H", "J", 67.45368781616021);
	cloud.addDist("I", "A", 59.665735560705194);
	cloud.addDist("I", "B", 34.36568055487916);
	cloud.addDist("I", "C", 59.64059020499378);
	cloud.addDist("I", "D", 57.16642371182581);
	cloud.addDist("I", "E", 48.52834223420371);
	cloud.addDist("I", "F", 51.43928459844674);
	cloud.addDist("I", "G", 35.14256678161116);
	cloud.addDist("I", "H", 49.35585071701227);
	cloud.addDist("I", "J", 50.97057974949863);
	cloud.addDist("J", "B", 63.14269553954757);
	cloud.addDist("J", "E", 17);
	cloud.addDist("J", "G", 64.10148204214939);
	cloud.addDist("J", "H", 67.45368781616021);
	cloud.addDist("J", "I", 50.97057974949863);
	cloud.calcPositions();
	console.log(cloud.toString(6));

	rtk1 = new Node("RTK1", altlatlon2ecef({ "lat": 52.42106878654074, "lon": 13.337160052192699, "alt": 62.18834827840328 }));
	rtk1.addNeighbour(cloud.getNodeByName("B"), 56.293871780150276);
	rtk1.addNeighbour(cloud.getNodeByName("C"), 67.68308503607086);
	rtk1.addNeighbour(cloud.getNodeByName("E"), 29.88310559496787);
	rtk1.addNeighbour(cloud.getNodeByName("G"), 56.96490147450446);
	rtk1.addNeighbour(cloud.getNodeByName("H"), 60.28266749240614);
	rtk1.addNeighbour(cloud.getNodeByName("I"), 51.633322573702344);
	rtk1.addNeighbour(cloud.getNodeByName("J"), 13.490737563232042);
	rtk2 = new Node("RTK2", altlatlon2ecef({ "lat": 52.42086253420369, "lon": 13.337841262602616, "alt": 67.23155479039997 }));
	rtk2.addNeighbour(cloud.getNodeByName("B"), 51.07837115648854);
	rtk2.addNeighbour(cloud.getNodeByName("E"), 45.749316934791494);
	rtk2.addNeighbour(cloud.getNodeByName("F"), 56.3382640840131);
	rtk2.addNeighbour(cloud.getNodeByName("G"), 43.87482193696061);
	rtk2.addNeighbour(cloud.getNodeByName("H"), 43.05810028322197);
	rtk2.addNeighbour(cloud.getNodeByName("I"), 24.61706725018234);
	rtk2.addNeighbour(cloud.getNodeByName("J"), 49.8196748283246);
	rtk3 = new Node("RTK3", altlatlon2ecef({ "lat": 52.42055089692998, "lon": 13.337923853594258, "alt": 125.46263982914388 }));
	rtk3.addNeighbour(cloud.getNodeByName("A"), 35.17101079013795);
	rtk3.addNeighbour(cloud.getNodeByName("B"), 49.33558553417604);
	rtk3.addNeighbour(cloud.getNodeByName("C"), 69.61321713582845);
	rtk3.addNeighbour(cloud.getNodeByName("D"), 30.870698080866262);
	rtk3.addNeighbour(cloud.getNodeByName("F"), 26.43860813280457);
	rtk3.addNeighbour(cloud.getNodeByName("G"), 48.27007354458868);
	rtk3.addNeighbour(cloud.getNodeByName("H"), 64.25729530566937);
	rtk3.addNeighbour(cloud.getNodeByName("I"), 55.50675634551167);
	rtk4 = new Node("RTK4", altlatlon2ecef({ "lat": 52.42090120032782, "lon": 13.337024423643811, "alt": 101.77488924656063 }));
	rtk4.addNeighbour(cloud.getNodeByName("A"), 54.42425929675111);
	rtk4.addNeighbour(cloud.getNodeByName("B"), 27.730849247724095);
	rtk4.addNeighbour(cloud.getNodeByName("C"), 24.1039415863879);
	rtk4.addNeighbour(cloud.getNodeByName("D"), 54.57105459856901);
	rtk4.addNeighbour(cloud.getNodeByName("E"), 65.21502894272147);
	rtk4.addNeighbour(cloud.getNodeByName("F"), 69.81403870282824);
	rtk4.addNeighbour(cloud.getNodeByName("G"), 38.535697735995385);
	rtk4.addNeighbour(cloud.getNodeByName("H"), 57.91372894228103);
	rtk4.addNeighbour(cloud.getNodeByName("I"), 50.457903246171455);
	rtk4.addNeighbour(cloud.getNodeByName("J"), 54.24020648928247);
	cloud.adjustCOS([rtk1, rtk2, rtk3, rtk4]);
	console.log(cloud.toString(6));

	tag = new Node("Tag", null);
	//while(1){
		tag.addNeighbour(cloud.getNodeByName("B"), 26.076809620810597);
		tag.addNeighbour(cloud.getNodeByName("F"), 45.79301256742124);
		tag.addNeighbour(cloud.getNodeByName("G"), 24.535688292770594);
		tag.addNeighbour(cloud.getNodeByName("H"), 39.45883931389772);
		tag.addNeighbour(cloud.getNodeByName("I"), 11.357816691600547);
		tag.addNeighbour(cloud.getNodeByName("J"), 49.82971001320397);
		console.log(ecef2altlatlon(cloud.getTagPosition(tag, 6)));
	//}
}

function dataSet3() {
	console.log("DataSet3");
	cloud.addNode("A", null);
	cloud.addNode("B", null);
	cloud.addNode("C", null);
	cloud.addNode("D", null);
	cloud.addNode("E", null);
	cloud.addNode("F", null);
	cloud.addNode("G", null);
	cloud.addNode("H", null);
	cloud.addNode("I", null);
	cloud.addNode("J", null);
	cloud.addDist("A", "B", 33);
	cloud.addDist("A", "C", 47.16990566028302);
	cloud.addDist("A", "D", 7.211102550927978);
	cloud.addDist("A", "F", 31.400636936215164);
	cloud.addDist("A", "G", 33.391615714128);
	cloud.addDist("A", "H", 52.49761899362675);
	cloud.addDist("A", "I", 59.665735560705194);
	cloud.addDist("B", "A", 33);
	cloud.addDist("B", "C", 31.874754901018456);
	cloud.addDist("B", "D", 32.14031735997639);
	cloud.addDist("B", "E", 69.32532004974806);
	cloud.addDist("B", "F", 43.18564576337837);
	cloud.addDist("B", "G", 16.673332000533065);
	cloud.addDist("B", "H", 43.18564576337837);
	cloud.addDist("B", "I", 34.36568055487916);
	cloud.addDist("B", "J", 63.14269553954757);
	cloud.addDist("C", "A", 47.16990566028302);
	cloud.addDist("C", "B", 31.874754901018456);
	cloud.addDist("C", "D", 45.53020975132884);
	cloud.addDist("C", "F", 70.34912934784623);
	cloud.addDist("C", "G", 47.05316142407437);
	cloud.addDist("C", "H", 71.61703707917552);
	cloud.addDist("C", "I", 59.64059020499378);
	cloud.addDist("D", "A", 7.211102550927978);
	cloud.addDist("D", "B", 32.14031735997639);
	cloud.addDist("D", "C", 45.53020975132884);
	cloud.addDist("D", "F", 32.28002478313795);
	cloud.addDist("D", "G", 34.91418050019218);
	cloud.addDist("D", "H", 56.142675390472796);
	cloud.addDist("D", "I", 57.16642371182581);
	cloud.addDist("E", "B", 69.32532004974806);
	cloud.addDist("E", "G", 70.22819946431775);
	cloud.addDist("E", "I", 48.52834223420371);
	cloud.addDist("E", "J", 17);
	cloud.addDist("F", "A", 31.400636936215164);
	cloud.addDist("F", "B", 43.18564576337837);
	cloud.addDist("F", "C", 70.34912934784623);
	cloud.addDist("F", "D", 32.28002478313795);
	cloud.addDist("F", "G", 33.481338085566414);
	cloud.addDist("F", "H", 40.620192023179804);
	cloud.addDist("F", "I", 51.43928459844674);
	cloud.addDist("G", "A", 33.391615714128);
	cloud.addDist("G", "B", 16.673332000533065);
	cloud.addDist("G", "C", 47.05316142407437);
	cloud.addDist("G", "D", 34.91418050019218);
	cloud.addDist("G", "E", 70.22819946431775);
	cloud.addDist("G", "F", 33.481338085566414);
	cloud.addDist("G", "H", 27.03701166919155);
	cloud.addDist("G", "I", 35.14256678161116);
	cloud.addDist("G", "J", 64.10148204214939);
	cloud.addDist("H", "A", 52.49761899362675);
	cloud.addDist("H", "B", 43.18564576337837);
	cloud.addDist("H", "C", 71.61703707917552);
	cloud.addDist("H", "D", 56.142675390472796);
	cloud.addDist("H", "F", 40.620192023179804);
	cloud.addDist("H", "G", 27.03701166919155);
	cloud.addDist("H", "I", 49.35585071701227);
	cloud.addDist("H", "J", 67.45368781616021);
	cloud.addDist("I", "A", 59.665735560705194);
	cloud.addDist("I", "B", 34.36568055487916);
	cloud.addDist("I", "C", 59.64059020499378);
	cloud.addDist("I", "D", 57.16642371182581);
	cloud.addDist("I", "E", 48.52834223420371);
	cloud.addDist("I", "F", 51.43928459844674);
	cloud.addDist("I", "G", 35.14256678161116);
	cloud.addDist("I", "H", 49.35585071701227);
	cloud.addDist("I", "J", 50.97057974949863);
	cloud.addDist("J", "B", 63.14269553954757);
	cloud.addDist("J", "E", 17);
	cloud.addDist("J", "G", 64.10148204214939);
	cloud.addDist("J", "H", 67.45368781616021);
	cloud.addDist("J", "I", 50.97057974949863);
	cloud.calcPositions();
	console.log(cloud.toString(6));

	rtk1 = new Node("RTK1", { "x": -30, "y": -30, "z": 0 });
	rtk1.addNeighbour(cloud.getNodeByName("B"), 56.293871780150276);
	rtk1.addNeighbour(cloud.getNodeByName("C"), 67.68308503607086);
	rtk1.addNeighbour(cloud.getNodeByName("E"), 29.88310559496787);
	rtk1.addNeighbour(cloud.getNodeByName("G"), 56.96490147450446);
	rtk1.addNeighbour(cloud.getNodeByName("H"), 60.28266749240614);
	rtk1.addNeighbour(cloud.getNodeByName("I"), 51.633322573702344);
	rtk1.addNeighbour(cloud.getNodeByName("J"), 13.490737563232042);
	rtk2 = new Node("RTK2", { "x": -20, "y": 20, "z": -10 });
	rtk2.addNeighbour(cloud.getNodeByName("B"), 51.07837115648854);
	rtk2.addNeighbour(cloud.getNodeByName("E"), 45.749316934791494);
	rtk2.addNeighbour(cloud.getNodeByName("F"), 56.3382640840131);
	rtk2.addNeighbour(cloud.getNodeByName("G"), 43.87482193696061);
	rtk2.addNeighbour(cloud.getNodeByName("H"), 43.05810028322197);
	rtk2.addNeighbour(cloud.getNodeByName("I"), 24.61706725018234);
	rtk2.addNeighbour(cloud.getNodeByName("J"), 49.8196748283246);
	rtk3 = new Node("RTK3", { x: 40, y: 40, z: 15 });
	rtk3.addNeighbour(cloud.getNodeByName("A"), 35.17101079013795);
	rtk3.addNeighbour(cloud.getNodeByName("B"), 49.33558553417604);
	rtk3.addNeighbour(cloud.getNodeByName("C"), 69.61321713582845);
	rtk3.addNeighbour(cloud.getNodeByName("D"), 30.870698080866262);
	rtk3.addNeighbour(cloud.getNodeByName("F"), 26.43860813280457);
	rtk3.addNeighbour(cloud.getNodeByName("G"), 48.27007354458868);
	rtk3.addNeighbour(cloud.getNodeByName("H"), 64.25729530566937);
	rtk3.addNeighbour(cloud.getNodeByName("I"), 55.50675634551167);
	rtk4 = new Node("RTK4", { "x": 10, "y": -30, "z": 20 });
	rtk4.addNeighbour(cloud.getNodeByName("A"), 54.42425929675111);
	rtk4.addNeighbour(cloud.getNodeByName("B"), 27.730849247724095);
	rtk4.addNeighbour(cloud.getNodeByName("C"), 24.1039415863879);
	rtk4.addNeighbour(cloud.getNodeByName("D"), 54.57105459856901);
	rtk4.addNeighbour(cloud.getNodeByName("E"), 65.21502894272147);
	rtk4.addNeighbour(cloud.getNodeByName("F"), 69.81403870282824);
	rtk4.addNeighbour(cloud.getNodeByName("G"), 38.535697735995385);
	rtk4.addNeighbour(cloud.getNodeByName("H"), 57.91372894228103);
	rtk4.addNeighbour(cloud.getNodeByName("I"), 50.457903246171455);
	rtk4.addNeighbour(cloud.getNodeByName("J"), 54.24020648928247);
	cloud.adjustCOS([rtk1, rtk2, rtk3, rtk4]);
	console.log(cloud.toString(6));

	tag = new Node("Tag", null);
	//while(1){
		tag.addNeighbour(cloud.getNodeByName("B"), 26.076809620810597);
		tag.addNeighbour(cloud.getNodeByName("F"), 45.79301256742124);
		tag.addNeighbour(cloud.getNodeByName("G"), 24.535688292770594);
		tag.addNeighbour(cloud.getNodeByName("H"), 39.45883931389772);
		tag.addNeighbour(cloud.getNodeByName("I"), 11.357816691600547);
		tag.addNeighbour(cloud.getNodeByName("J"), 49.82971001320397);
		console.log(cloud.getTagPosition(tag, 6));
	//}
}