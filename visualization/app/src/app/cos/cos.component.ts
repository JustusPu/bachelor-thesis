import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { isNumber } from 'util';

@Component({
  selector: 'app-cos',
  templateUrl: './cos.component.html',
  styleUrls: ['./cos.component.scss']
})
export class CosComponent implements OnInit, AfterViewInit {
  @ViewChild('cos', { static: false }) canvas: ElementRef;
  @Input() canvasWidth;
  @Input() canvasHeight;
  lat: number = 52.455992;
  lon: number = 13.297124;
  zoom: number = 19;
  rotation: number = 34;
  width: number = 7804;
  length: number = 3712;
  outlines =
    [];
    // [{ url: 'http://page.mi.fu-berlin.de/justup98/bachelor-thesis/assets/img/untergeschoss.jpg', height: -3 },
    // { url: 'http://page.mi.fu-berlin.de/justup98/bachelor-thesis/assets/img/erdgeschoss.jpg', height: 0 },
    // { url: 'http://page.mi.fu-berlin.de/justup98/bachelor-thesis/assets/img/obergeschoss.jpg', height: 3 },
    // { url: 'http://page.mi.fu-berlin.de/justup98/bachelor-thesis/assets/img/dach.jpg', height: 6 }];
    // [{ url: 'assets/img/untergeschoss.jpg', height: -3 },
    // { url: 'assets/img/erdgeschoss.jpg', height: 0 },
    // { url: 'assets/img/obergeschoss.jpg', height: 3 },
    // { url: 'assets/img/dach.jpg', height: 6 }];

  pixelResolution = 512
  mapwidth = Math.floor(15654303.392 * ((Math.cos(this.lat * Math.PI / 180)) / Math.pow(2, this.zoom)) * this.pixelResolution);

  highestLayer = -1;
  layers: THREE.Mesh[] = [];
  sortedLayers: THREE.Mesh[] = [];
  nodes: THREE.Mesh[] = [];
  map: THREE.Mesh;
  wall: THREE.Mesh;
  tag: THREE.Mesh;

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;

  constructor() { }

  ngOnInit() {
    this.scene = new THREE.Scene();
    //this.addGrid();
    this.addMap();
    this.addWall();
    this.addLayers();
    this.addTag();
    this.moveTag(0, 500, 0);
  }
  ngAfterViewInit() {
    this.canvas.nativeElement.width = screen.width;//this.canvasWidth;//
    this.canvas.nativeElement.height = screen.height;//this.canvasHeight;//
    let width = this.canvas.nativeElement.clientWidth;
    let height = this.canvas.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(90, width / height, 10, this.mapwidth * 10);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement });
    this.renderer.localClippingEnabled = true;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //this.camera.position.set(2500, 4000, 4000);
    this.camera.position.set(0, this.mapwidth / 2, 0);
    this.controls.panSpeed = 30;
    this.controls.maxDistance = this.mapwidth;
    this.controls.minDistance = 200;
    // THREE.ImageUtils.crossOrigin = '';
    this.animate();
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.resizeCanvas();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  resizeCanvas() {
    let width = this.canvas.nativeElement.clientWidth;
    let height = this.canvas.nativeElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  addGrid() {
    let gridXY = new THREE.GridHelper(10000, 100);
    gridXY.position.set(0, 1, 0);
    this.scene.add(gridXY);
    let axes = new THREE.AxesHelper(500);
    axes.position.set(-5000, 1, -5000);
    this.scene.add(axes);
  }
  addMap() {
    let texture = new THREE.TextureLoader().load('https://maps.googleapis.com/maps/api/staticmap?center=' + this.lat + ',' + this.lon + '&zoom=' + this.zoom + '&size=' + this.pixelResolution + 'x' + this.pixelResolution + '&maptype=satellite&key=AIzaSyAlBReVsS3wF2aG381kNWJuKH3mA1fEGNk');
    let geometry = new THREE.PlaneGeometry(this.mapwidth, this.mapwidth);
    let angle = (this.rotation) * Math.PI / 180 + Math.PI / 2
    let localPlanes = [
      new THREE.Plane(new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)), -this.width / 2),
      new THREE.Plane(new THREE.Vector3(-Math.sin(angle), 0, -Math.cos(angle)), -this.width / 2),
      new THREE.Plane(new THREE.Vector3(Math.sin(angle + Math.PI / 2), 0, Math.cos(angle + Math.PI / 2)), -this.length / 2),
      new THREE.Plane(new THREE.Vector3(-Math.sin(angle + Math.PI / 2), 0, -Math.cos(angle + Math.PI / 2)), -this.length / 2)
    ];
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      clippingPlanes: localPlanes,
      clipIntersection: true
    })
    this.map = new THREE.Mesh(geometry, material);
    this.map.position.y = 0;
    this.map.rotation.x = -Math.PI / 2;
    this.scene.add(this.map);
  }
  updateMap() {
    this.mapwidth = Math.floor(15654303.392 * ((Math.cos(this.lat * Math.PI / 180)) / Math.pow(2, this.zoom)) * this.pixelResolution);
    this.camera.far = this.mapwidth * 10;
    this.controls.maxDistance = this.mapwidth;
    this.camera.position.set(0, this.mapwidth / 2, 0);
    this.scene.remove(this.map);
    this.addMap();
  }
  addWall() {
    let wall = new THREE.MeshBasicMaterial({ color: 0xc8c8c8, side: THREE.DoubleSide });
    let ground = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    let open = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide });
    let geometry = new THREE.BoxBufferGeometry(this.length, 1, this.width);
    let materials = [wall, wall, open, ground, wall, wall];//rechts,links,oben, unten, hinten,vorne
    this.wall = new THREE.Mesh(geometry, materials);
    this.wall.rotation.y = (this.rotation) * Math.PI / 180 + (Math.PI / 2);
    this.scene.add(this.wall);
  }
  updateWall() {
    this.scene.remove(this.wall);
    this.addWall();
  }
  addLayers() {
    this.layers.forEach(elem => {
      this.scene.remove(elem);
    })
    this.layers = [];
    this.sortedLayers = [];
    this.outlines.forEach((elem) => {
      this.addLayer(elem.url, elem.height);
    });
  }
  clearLayers() {
    while (this.layers.length > 0) {
      this.removeLayer(0);
    };
  }
  addLayer(url, height) {
    let layer = new THREE.Mesh(
      new THREE.PlaneGeometry(7804, 3712),
      new THREE.MeshBasicMaterial({
        // map: THREE.ImageUtils.loadTexture(elem.url),
        map: new THREE.TextureLoader().load(url),
        //side: THREE.DoubleSide,
        transparent: true
      })
    );
    layer.rotation.x = -Math.PI / 2;
    layer.rotation.z = this.rotation * Math.PI / 180;
    layer.position.y = Math.floor(height * 100);
    this.layers.push(layer);
    if (!this.tag || this.tag && this.layers[this.layers.length - 1].position.y <= this.tag.position.y) {
      this.scene.add(this.layers[this.layers.length - 1]);
    }
    if (this.sortedLayers.length == 0 || layer.position.y >= this.sortedLayers[this.sortedLayers.length - 1].position.y) {
      this.sortedLayers.push(layer);
      this.highestLayer = this.sortedLayers.length - 1;
    }
    else {
      for (let i = 0; i < this.sortedLayers.length; i++) {
        if (layer.position.y < this.sortedLayers[i].position.y) {
          this.sortedLayers.splice(i, 0, layer);
          break;
        }
      }
    }
    this.refreshWall();
  }
  updateLayer(outlineIndex, height) {
    if (!isNaN(height)) {
      this.layers[outlineIndex].position.y = Math.floor(height * 100);
      this.sortedLayers.sort((a, b) => a.position.y - b.position.y);
      if (this.tag && this.sortedLayers[this.highestLayer].position.y > this.tag.position.y) {//updatedLayer war vorher unter Tag und nun über Tag
        this.scene.remove(this.layers[outlineIndex]);
        this.highestLayer--;
      }
      else if (this.tag && this.highestLayer + 1 < this.sortedLayers.length && this.sortedLayers[this.highestLayer + 1].position.y <= this.tag.position.y) {//updatedLayer war über Tag und jetzt zwischen highestLayer und tag geschoben
        this.highestLayer++;
        this.scene.add(this.layers[outlineIndex]);
      }
      this.refreshWall();
    }
  }
  removeLayer(outlineIndex) {
    this.scene.remove(this.layers[outlineIndex])
    let index = this.sortedLayers.indexOf(this.layers[outlineIndex]);
    if (this.highestLayer >= 0 && this.layers[outlineIndex].position.y <= this.sortedLayers[this.highestLayer].position.y) { this.highestLayer--; }
    this.sortedLayers.splice(index, 1);
    this.layers.splice(outlineIndex, 1);
    this.outlines.splice(outlineIndex, 1);
    this.refreshWall();
  }
  refreshLayer() {
    if (this.sortedLayers.length > 0 && this.tag) {
      let changed = false;
      if (this.highestLayer >= 0 && this.sortedLayers[this.highestLayer].position.y > this.tag.position.y) {
        while (this.highestLayer >= 0 && this.sortedLayers[this.highestLayer].position.y > this.tag.position.y) {
          this.scene.remove(this.sortedLayers[this.highestLayer--]);
          console.log(this.highestLayer);
          changed = true;
        }
      }
      else {
        while (this.sortedLayers.length > this.highestLayer + 1 && this.sortedLayers[this.highestLayer + 1].position.y <= this.tag.position.y) {
          this.scene.add(this.sortedLayers[++this.highestLayer]);
          console.log(this.highestLayer);
          changed = true;
        }
      }
      if (changed && this.highestLayer >= 0) {
        this.refreshWall();
      }
    }
  }
  refreshWall() {
    if (this.sortedLayers.length > 1) {
      if (this.highestLayer + 1 < this.sortedLayers.length) {
        this.wall.scale.y = this.sortedLayers[this.highestLayer + 1].position.y - this.sortedLayers[0].position.y;
        this.wall.position.y = this.wall.scale.y / 2 + this.sortedLayers[0].position.y - 1;
        console.log("A");
      }
      else if (this.highestLayer + 1 == this.sortedLayers.length) {//Oberste Ebene anzeigen: Dach hat keine Außenmauern
        this.wall.scale.y = this.sortedLayers[this.highestLayer].position.y - this.sortedLayers[0].position.y;
        this.wall.position.y = this.wall.scale.y / 2 + this.sortedLayers[0].position.y - 1;
        console.log("B");
      }
    }
    else if (this.sortedLayers.length > 0) {
      this.wall.scale.y = Math.abs(this.sortedLayers[0].position.y);
      this.wall.position.y = this.wall.scale.y / 2 - 1;
      console.log("C");
    }
    else {
      this.wall.scale.y = 1;
      this.wall.position.y = 0;
      console.log("D");
    }
  }

  addNode() {
    this.nodes.push(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 })));
    this.scene.add(this.nodes[this.nodes.length - 1]);
  }
  setNodePosition(i, x, y, z) {
    this.nodes[i].position.x = x;
    this.nodes[i].position.y = y;
    this.nodes[i].position.z = z;
  }
  addTag() {
    this.tag = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    this.scene.add(this.tag);
    this.refreshLayer();
  }
  moveTag(x, y, z) {
    this.tag.position.x += x;
    this.tag.position.y += y;
    this.tag.position.z += z;
    this.refreshLayer();
    // console.log(this.tag.position.x, this.tag.position.y, this.tag.position.z)
  }
  onKey(event: any) { // without type info
    switch (event.keyCode) {
      case 33:
        this.camera.position.y += 30;
        break;
      case 34:
        this.camera.position.y -= 30;
        break;
      case 65:
        this.moveTag(-30, 0, 0);
        break;
      case 68:
        this.moveTag(30, 0, 0);
        break;
      case 87:
        this.moveTag(0, 0, -30);
        break;
      case 83:
        this.moveTag(0, 0, 30);
        break;
      case 89:
        this.moveTag(0, -30, 0);
        break;
      case 88:
        this.moveTag(0, 30, 0);
        break;
    }
  }
  set latVal(val) {
    this.lat = val;
    this.updateMap();
  }
  get latVal() {
    return this.lat;
  }
  set lonVal(val) {
    this.lon = val;
    this.updateMap();
  }
  get lonVal() {
    return this.lon;
  }
  set zoomVal(val) {
    this.zoom = val;
    this.updateMap();
  }
  get zoomVal() {
    return this.zoom;
  }
  set lengthVal(val) {
    this.length = Math.floor(val * 100);
    this.updateMap();
    this.updateWall();
  }
  get lengthVal() {
    return this.length / 100;
  }
  set widthVal(val) {
    this.width = Math.floor(val * 100);
    this.updateMap();
    this.updateWall();
  }
  get widthVal() {
    return this.width / 100;
  }
  set rotationVal(val) {
    this.rotation = val;
    this.updateMap();
    this.updateWall();
  }
  get rotationVal() {
    return this.rotation;
  }
}
