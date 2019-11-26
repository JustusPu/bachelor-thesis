import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CosComponent } from './cos/cos.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  sidebarVisable = false;
  @ViewChild('setupCOS', { static: false }) setupCOS: CosComponent;
  time: number;
  step: number = 1;
  heights: number[] = [];

  constructor() {

  }

  onUpload(event) {
    /*if (event.originalEvent.body.okFiles) {
      this.setupCOS.layers.forEach(element => {
        this.setupCOS.scene.remove(element);
      });
      this.setupCOS.layers = [];
      this.setupCOS.outlines = event.originalEvent.body.okFiles.sort((a, b) => parseFloat(a.height) - parseFloat(b.height));
      this.setupCOS.addLayers();
      this.setupCOS.updateLayer(this.setupCOS.nodes[0].position.y);
    }*/
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

  loadSetup(fileList: FileList) {
    let file = fileList[0];
    let fileReader: FileReader = new FileReader();
    let self = this;
    fileReader.onloadend = function (x) {
      let content = JSON.parse((fileReader.result).toString());
      if (content.lat) { self.setupCOS.lat = content.lat; }
      if (content.lon) { self.setupCOS.lon = content.lon; }
      if (content.zoom) { self.setupCOS.zoom = content.zoom; }
      self.setupCOS.updateMap();
      if (content.width) { self.setupCOS.width = content.width; }
      if (content.length) { self.setupCOS.length = content.length; }
      if (content.rotation) { self.setupCOS.rotation = content.rotation; }
      self.setupCOS.updateWall();
      if (content.outlines) {
        self.setupCOS.clearLayers();
        self.setupCOS.outlines = content.outlines;
        self.setupCOS.addLayers();
      }
    }
    fileReader.readAsText(file);
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
  addLayer(newURL, newHeight) {
    let newHeightVal = parseFloat(newHeight.value);
    this.setupCOS.outlines.push({ 'url': newURL.value, 'height': newHeightVal });
    this.setupCOS.addLayer(newURL.value, newHeightVal);
    newHeight.value = "";
    newURL.value = "";
  }
  updateLayer(index, height) {
    this.setupCOS.updateLayer(index, parseFloat(height));
  }
  removeLayer(index) {
    this.setupCOS.removeLayer(index);
  }
}