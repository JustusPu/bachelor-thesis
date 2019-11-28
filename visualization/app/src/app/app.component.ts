import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CosComponent } from './cos/cos.component';
import { knoten } from './api/knoten';
import { functions } from './api/functions'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  sidebarVisable = false;
  time: number;
  step: number = 2;
  generatedAnchorsCount = 0;
  filterNeighbours = true;
  //Setup 1
  @ViewChild('setupCOS', { static: false }) setupCOS: CosComponent;
  heights: number[] = [];
  //Setup 2
  anchors: any[] = [];

  selectedAnchor: any;
  selectedNeighbour: any;

  generateAnchors(totalCount, fixedCount, rangeUWB, rangeToleranceUWB, accuracyUWB) {
    let totalCountVal = parseFloat(totalCount.value);
    let fixedCountVal = parseFloat(fixedCount.value);
    let rangeUWBVal = parseFloat(rangeUWB.value);
    let rangeToleranceUWBVal = parseFloat(rangeToleranceUWB.value);
    let accuracyUWBVal = parseFloat(accuracyUWB.value);
    if (this.setupCOS.lat && this.setupCOS.lon && this.setupCOS.sortedLayers.length > 0 && this.setupCOS.length && this.setupCOS.width && this.setupCOS.rotation && totalCountVal > 0 && fixedCountVal >= 0 && rangeUWBVal > 0 && rangeToleranceUWBVal >= 0 && accuracyUWBVal >= 0) {
      let buildingOrigin = functions.altlatlon2ecef({ lat: this.setupCOS.lat, lon: this.setupCOS.lon, alt: 57 });
      //Für alle Anker die lat,lon,alt angebenen haben=>x,y,z bestimmen
      this.anchors.filter(elem => { elem.lla.lat && elem.lla.lon && elem.lla.alt }).forEach(elem => {
        elem.pos = functions.altlatlon2ecef(elem.lla);
        elem.pos.x = (elem.pos.x - buildingOrigin.x)
        elem.pos.y = (elem.pos.y - buildingOrigin.y)
        elem.pos.z = (elem.pos.z - buildingOrigin.z)
      });
      //Array mit neuen Anker erstellen(random x, y, z )
      for (let i = 0; i < totalCountVal; i++) {
        let x = functions.getRandom(-this.setupCOS.width / 2, this.setupCOS.width / 2);
        let y = functions.getRandom(-this.setupCOS.length / 2, this.setupCOS.length / 2);
        let pos = {
          x: (Math.cos(this.setupCOS.rotation) * x - Math.sin(this.setupCOS.rotation) * y) / 100,
          y: (Math.sin(this.setupCOS.rotation) * x + Math.cos(this.setupCOS.rotation) * y) / 100,
          z: functions.getRandom(this.setupCOS.sortedLayers[0].position.y, this.setupCOS.sortedLayers[this.setupCOS.sortedLayers.length - 1].position.y) / 100
        };
        let lla = { lat: null, lon: null, alt: null };
        if (i < fixedCountVal) {
          lla = functions.ecef2altlatlon(functions.test(buildingOrigin, pos))
          console.log(lla)
          console.log(pos.z)
        }
        this.anchors.push(
          {
            name: "#" + this.generatedAnchorsCount,
            lla: lla,
            pos: pos,
            neighbours: {}
          });
        this.generatedAnchorsCount++;
      }
      // console.log(this.anchors)
      //Zu Ankern die per Hand und ohne Angabe einer Position hinzugefügt wurden, können keine Abstände bestimmt werden
      this.anchors.filter(elem => { return elem.pos.x && elem.pos.y && elem.pos.z }).forEach((a) => {
        a.neighbours = {};
        this.anchors.filter(elem => { return elem.pos.x && elem.pos.y && elem.pos.z }).forEach((b, i) => {
          let dist = Math.sqrt(Math.pow(a.pos.x - b.pos.x, 2) + Math.pow(a.pos.y - b.pos.y, 2) + Math.pow(a.pos.z - b.pos.z, 2)) + functions.getRandom(-accuracyUWBVal, accuracyUWBVal);
          // if (dist < rangeUWB + functions.getRandom(-rangeToleranceUWB, rangeToleranceUWB) || ((!a.lla.lat || !a.lla.lon || !a.lla.alt) && (!b.lla.lat || !b.lla.lon || !b.lla.alt))) { // Abstände zwischen zwei RTK-Ankern sollen snicht bestimt werden
          if (dist < rangeUWBVal + functions.getRandom(-rangeToleranceUWBVal, rangeToleranceUWBVal) || (a.lla.lat && a.lla.lon && a.lla.alt && b.lla.lat && b.lla.lon && b.lla.alt)) {
            // console.log(a.name + "" + b.name);
            a.neighbours[b.name] = dist;
          }
        });
      });
      this.anchors = [...this.anchors];
      console.log(Object.keys(this.anchors[0].neighbours).length)
    }
    else {
      console.log("totalCount: " + totalCountVal);
      console.log("fixedCount: " + fixedCountVal);
      console.log("rangeUWB: " + rangeUWBVal);
      console.log("rangeToleranceUWB: " + rangeToleranceUWBVal);
      console.log("accuracyUWB: " + accuracyUWBVal);
      console.log("originLat: " + this.setupCOS.lat);
      console.log("originLon: " + this.setupCOS.lon);
      console.log("layerCount: " + this.setupCOS.sortedLayers.length);
      console.log("width: " + this.setupCOS.width);
      console.log("length: " + this.setupCOS.length);
      console.log("rotation: " + this.setupCOS.rotation);
    }
  }
  nameRegex(event) {
    this.selectedAnchor.name = event.target.value.replace('#', '');
  }
  neighboursCount(anchor) {
    return Object.keys(anchor.neighbours).length;
  }
  distChange(value) {
    let dist = parseFloat(value);
    if (dist) {
      this.selectedAnchor.neighbours[this.selectedNeighbour.name] = dist;
    }
    else {
      delete this.selectedAnchor.neighbours[this.selectedNeighbour.name];
    }
  }
  constructor() {

  }
  ngOnInit() {
    setInterval(() => {
      this.time = Date.now();
    }, 1000);
  }

  prevStep() {
    this.step--;
  }
  nextStep() {
    this.step++;
  }

  //Setup
  loadSetup(target) {
    let file = target.files[0];
    let fileReader: FileReader = new FileReader();
    let self = this;
    fileReader.onloadend = function (x) {
      let content = JSON.parse((fileReader.result).toString());
      if (content.lat) { self.setupCOS.lat = content.lat; }
      if (content.lon) { self.setupCOS.lon = content.lon; }
      if (content.zoom) { self.setupCOS.zoom = content.zoom; }
      if (content.width) { self.setupCOS.width = content.width; }
      if (content.length) { self.setupCOS.length = content.length; }
      if (content.rotation) { self.setupCOS.rotation = content.rotation; }
      self.setupCOS.updateMap();
      self.setupCOS.updateWall();
      if (content.outlines) {
        self.setupCOS.clearLayers();
        self.setupCOS.outlines = content.outlines;
        self.setupCOS.addLayers();
      }
      if (content.anchors) {
        self.anchors = [...content.anchors];
      }
    }
    fileReader.readAsText(file);
    target.value = "";
  }
  saveSetup() {
    let filename = prompt("Wie soll die Datei heißen?");
    if (filename) {
      let content = { lat: this.setupCOS.lat, lon: this.setupCOS.lon, zoom: this.setupCOS.zoom, width: this.setupCOS.width, length: this.setupCOS.length, rotation: this.setupCOS.rotation, outlines: this.setupCOS.outlines, anchors: this.anchors }
      var a = document.createElement("a");
      var file = new Blob([JSON.stringify(content)], { type: 'text/plain' });
      a.href = URL.createObjectURL(file);
      a.download = filename;
      a.click();
    }
  }

  //Setup 1
  onUpload(event) {
    event.originalEvent.body.okFiles.forEach(element => {
      this.addLayer(element.url, element.height);
    });
  }
  onError(event) {
    console.log(event)
  }
  onBeforeUpload(event) {
    event.formData.append("heights", this.heights.join(","));
  }
  addLayer(newURL, newHeight) {
    let newHeightVal = parseFloat(newHeight);
    this.setupCOS.outlines.push({ 'url': newURL, 'height': newHeightVal });
    this.setupCOS.addLayer(newURL, newHeightVal);
  }
  updateLayer(index, height) {
    this.setupCOS.updateLayer(index, parseFloat(height));
  }
  removeLayer(index) {
    this.setupCOS.removeLayer(index);
  }

  //Setup2
  addAnchor() {
    this.anchors = [...this.anchors, new knoten(this.anchors.length + 1, null)];
  }
  removeAnchor() {
    let index = this.anchors.indexOf(this.selectedAnchor);
    this.anchors = this.anchors.filter(elem => { return elem != this.selectedAnchor });
    if (this.selectedNeighbour == this.selectedAnchor) {
      this.selectedNeighbour = this.anchors[index] || this.anchors[index - 1] || null;
    }
    this.selectedAnchor = this.anchors[index] || this.anchors[index - 1] || null;
  }
}


