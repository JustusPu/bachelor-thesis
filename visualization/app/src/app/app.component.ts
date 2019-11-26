import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CosComponent } from './cos/cos.component';
import { browser } from 'protractor';

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
    if (event.originalEvent.body.okFiles) {
      this.setupCOS.layers.forEach(element => {
        this.setupCOS.scene.remove(element);
      });
      this.setupCOS.layers = [];
      this.setupCOS.outlines = event.originalEvent.body.okFiles.sort((a, b) => parseFloat(a.height) - parseFloat(b.height));
      this.setupCOS.addLayers();
      this.setupCOS.updateLayer(this.setupCOS.nodes[0].position.y);
    }
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
        self.setupCOS.layers = [];
        self.setupCOS.outlines = content.outlines.sort((a, b) => parseFloat(a.height) - parseFloat(b.height));
        self.setupCOS.addLayers();
        self.setupCOS.updateLayer(self.setupCOS.nodes[0].position.y);
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

  // get time() {
  //   return Date.now();
  // }
}