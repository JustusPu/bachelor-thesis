export class functions {
    static ecef2local(origin, pos) {    //Umrechnung der Pos von dem "senkrecht auf der Erdoberfläche stehenden"-COS ins ECEF-COS
        let y = [origin.x, origin.y, (-Math.pow(origin.x, 2) + Math.pow(origin.y, 2)) / origin.z];
        let x =
            [
                ((Math.pow(origin.x, 2) + Math.pow(origin.y, 2) + Math.pow(origin.z, 2)) * -origin.y) / origin.z,
                ((Math.pow(origin.x, 2) + Math.pow(origin.y, 2) + Math.pow(origin.z, 2)) * origin.x) / origin.z,
                0
            ];
        let z = [origin.x, origin.y, origin.z];
        return this.vec2Pos(this.multMatrix(this.invMatrix([this.unitV(x), this.unitV(y), this.unitV(z)]), this.addVector(this.pos2Vec(pos), [-origin.x, -origin.y, -origin.z])));
    }
    static local2ecef(origin, pos) {    //Umrechnung der Pos von dem "senkrecht auf der Erdoberfläche stehenden"-COS ins ECEF-COS

        let y = [origin.x, origin.y, (-Math.pow(origin.x, 2) + Math.pow(origin.y, 2)) / origin.z];
        let x =
            [
                ((Math.pow(origin.x, 2) + Math.pow(origin.y, 2) + Math.pow(origin.z, 2)) * -origin.y) / origin.z,
                ((Math.pow(origin.x, 2) + Math.pow(origin.y, 2) + Math.pow(origin.z, 2)) * origin.x) / origin.z,
                0
            ];
        let z = [origin.x, origin.y, origin.z];
        return this.vec2Pos(this.addVector(this.pos2Vec(origin), this.multMatrix([this.unitV(x), this.unitV(y), this.unitV(z)], this.pos2Vec(pos))));
    }

    static ecef2altlatlon(pos) {
        let a = 6378137;		//Äquatrorradius nach WGS84
        let b = 6356752.314;	//Polradius nach WGS84
        let x = +pos.x;
        let y = +pos.y;
        let z = +pos.z;
        let c = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let d = Math.atan2(a * z, b * c);
        let lat = Math.atan2((z + (Math.pow(a, 2) / Math.pow(b, 2) - 1) * b * Math.pow(Math.sin(d), 3)),
            (c - (1 - Math.pow(b, 2) / Math.pow(a, 2)) * a * Math.pow(Math.cos(d), 3)));
        //let n = a/Math.sqrt(1-(1-Math.pow(b,2)/Math.pow(a,2))*Math.pow(Math.sin(lat),2))
        let n = Math.pow(a, 2) / Math.sqrt(Math.pow(a, 2) * Math.pow(Math.cos(lat), 2) +
            Math.pow(b, 2) * Math.pow(Math.sin(lat), 2));
        let lon = Math.atan2(y, x) % (2 * Math.PI);
        let alt = c / Math.cos(lat) - n;
        return { "lat": lat * 180 / Math.PI, "lon": lon * 180 / Math.PI, "alt": alt }
    }

    static altlatlon2ecef(res) {
        let a = 6378137.0 		//Äquatrorradius nach WGS84
        let b = 6356752.314		//Polradius nach WGS84
        let lat = +res.lat * (Math.PI / 180);
        let lon = +res.lon * (Math.PI / 180);
        let alt = +res.alt;
        //let n = a / Math.sqrt(1-(1-Math.pow(b,2)/Math.pow(a,2))*Math.pow(Math.sin(lat),2))
        let n = Math.pow(a, 2) / Math.sqrt(Math.pow(a, 2) * Math.pow(Math.cos(lat), 2) +
            Math.pow(b, 2) * Math.pow(Math.sin(lat), 2));
        let x = (n + alt) * Math.cos(lat) * Math.cos(lon);
        let y = (n + alt) * Math.cos(lat) * Math.sin(lon);
        let z = (Math.pow(b, 2) / Math.pow(a, 2) * n + alt) * Math.sin(lat);
        return { "x": x, "y": y, "z": z }
    }

    static getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    static crossP(vecA, vecB) {
        return [vecA[1] * vecB[2] - vecA[2] * vecB[1], vecA[2] * vecB[0] - vecA[0] * vecB[2], vecA[0] * vecB[1] - vecA[1] * vecB[0]];
    }

    static vec2Pos(vec) {
        return { "x": vec[0], "y": vec[1], "z": vec[2] };
    }

    static pos2Vec(pos) {
        return [pos.x, pos.y, pos.z]
    }

    static unitV(vec) {
        let u = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
        return [vec[0] / u, vec[1] / u, vec[2] / u]
    }

    static multMatrix(matA, matB) {
        if (matA.length > 0 && !Array.isArray(matA[0])) { matA = [matA]; }
        if (matB.length > 0 && !Array.isArray(matB[0])) { matB = [matB]; }
        let result = [];
        for (let b = 0; b < matB.length; b++) {
            result.push([])
            for (let a = 0; a < matA.length; a++) {
                result[result.length - 1].push(0);
                for (let i = 0; i < matA.length; i++) {
                    result[result.length - 1][result[result.length - 1].length - 1] += matA[i][a] * matB[b][i]
                }
            }
        }
        if (result.length == 1) {
            return result[0];
        }
        return result;
    }

    static addVector(vecA, vecB) {
        return [vecA[0] + vecB[0], vecA[1] + vecB[1], vecA[2] + vecB[2]];
    }

    static roundV(vec, n) {
        let a = Math.pow(10, n);
        return [Math.round(vec[0] * a / a), Math.round(vec[1] * a) / a, Math.round(vec[2] * a) / a];
    }

    static invMatrix(matA) {
        let res = [];
        let n = matA.length;
        //Generieren der Einheitsmatrix
        for (let i = 0; i < n; i++) {
            if (matA[i].length == n) { res.push(Array.from(new Array(n), (x, k) => { return k == i ? 1 : 0 })); } else { return null; }
        }
        //Gauß-Jordan forward
        for (let l = 0; l < n; l++) {
            if (matA[l][l] == 0) {
                for (let i = l + 1; i < n; i++) { if (matA[l][i] != 0) { for (let m = 0; m < n; m++) { let temp = matA[m][i]; matA[m][i] = matA[m][l]; matA[m][l] = temp; temp = res[m][i]; res[m][i] = res[m][l]; res[m][l] = temp; } break; } }//Zeilentausch
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
            if (matA[l][l] == 0) {
                for (let i = l - 1; i >= 0; i--) { if (matA[l][i] != 0) { for (let m = 0; m < n; m++) { let temp = matA[m][i]; matA[m][i] = matA[m][l]; matA[m][l] = temp; temp = res[m][i]; res[m][i] = res[m][l]; res[m][l] = temp; } break; } }//Zeilentausch
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
}