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
        return this.vec2Pos(this.multMatrix(this.matrix_invert([this.unitV(x), this.unitV(y), this.unitV(z)]), this.addVector(this.pos2Vec(pos), [-origin.x, -origin.y, -origin.z])));
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

    static matrix_invert(M) {
        if (M.length !== M[0].length) { return; }
        let i = 0, ii = 0, j = 0, dim = M.length, e = 0, t = 0;
        let I = [], C = [];
        for (i = 0; i < dim; i += 1) {
            I[I.length] = [];
            C[C.length] = [];
            for (j = 0; j < dim; j += 1) {
                if (i == j) { I[i][j] = 1; }
                else { I[i][j] = 0; }
                C[i][j] = M[i][j];
            }
        }

        for (i = 0; i < dim; i += 1) {
            e = C[i][i];
            if (e == 0) {
                for (ii = i + 1; ii < dim; ii += 1) {
                    if (C[ii][i] != 0) {
                        for (j = 0; j < dim; j++) {
                            e = C[i][j];       //temp store i'th row
                            C[i][j] = C[ii][j];//replace i'th row by ii'th
                            C[ii][j] = e;      //repace ii'th by temp
                            e = I[i][j];       //temp store i'th row
                            I[i][j] = I[ii][j];//replace i'th row by ii'th
                            I[ii][j] = e;      //repace ii'th by temp
                        }
                        break;
                    }
                }
                e = C[i][i];
                if (e == 0) { return }
            }
            for (j = 0; j < dim; j++) {
                C[i][j] = C[i][j] / e; //apply to original matrix
                I[i][j] = I[i][j] / e; //apply to identity
            }
            for (ii = 0; ii < dim; ii++) {
                if (ii == i) { continue; }
                e = C[ii][i];
                for (j = 0; j < dim; j++) {
                    C[ii][j] -= e * C[i][j]; //apply to original matrix
                    I[ii][j] -= e * I[i][j]; //apply to identity
                }
            }
        }
        return I;
    }
}