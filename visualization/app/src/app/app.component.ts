import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CosComponent } from './cos/cos.component';
import { knoten } from './api/knoten';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  sidebarVisable = false;
  time: number;
  step: number = 1;

  //Setup 1
  @ViewChild('setupCOS', { static: false }) setupCOS: CosComponent;
  heights: number[] = [];
  //Setup 2
  anchors: knoten[] = [new knoten("1",null), new knoten("2",null),new knoten("3",null), new knoten("4",null),new knoten("5",null)];
  selectedAnchor: knoten = this.anchors[0];
  selectedNeighbour: knoten = this.anchors[1];

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
    }
    fileReader.readAsText(file);
    target.value="";
  }
  saveSetup() {
    let filename = prompt("Wie soll die Datei heißen?");
    if (filename) {
      let content = { lat: this.setupCOS.lat, lon: this.setupCOS.lon, zoom: this.setupCOS.zoom, width: this.setupCOS.width, length: this.setupCOS.length, rotation: this.setupCOS.rotation, outlines: this.setupCOS.outlines }
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
  addAnchor(){
    this.anchors = [...this.anchors, new knoten(this.anchors.length+1,null)];
  }
  removeAnchor(){
    let index=this.anchors.indexOf(this.selectedAnchor);
    this.anchors = this.anchors.filter(elem=>{return elem!=this.selectedAnchor});
    if(this.selectedNeighbour==this.selectedAnchor){
      this.selectedNeighbour=this.anchors[index]||this.anchors[index-1]||null;
    }
    this.selectedAnchor=this.anchors[index]||this.anchors[index-1]||null;
  }
}