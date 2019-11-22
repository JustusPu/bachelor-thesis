import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

@Component({
  selector: 'app-cos',
  templateUrl: './cos.component.html',
  styleUrls: ['./cos.component.scss']
})
export class CosComponent implements OnInit, AfterViewInit {
  @ViewChild('cos', { static: false }) canvas: ElementRef;
  @Input() width: number;
  @Input() height: number;
  highestLayer = 0;
  layers: THREE.Mesh[] = [];
  tag: THREE.Mesh;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;

  constructor() { }

  ngOnInit() {
    this.scene = new THREE.Scene();
    this.addLayers();
    this.addGrid();
    this.addTag();
    this.setTagPosition(0, 700, 0);
  }
  ngAfterViewInit() {
    this.camera = new THREE.PerspectiveCamera(90, this.width / this.height, 10, 10000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.set(-2000, 3000, 4000);
    this.controls.panSpeed = 10;
    this.animate();
  }

  public animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  addGrid() {
    let gridXY = new THREE.GridHelper(10000, 100);
    gridXY.position.set(0, -20, 0);
    //gridXY.rotation.x = Math.PI/2;
    this.scene.add(gridXY);
    let axes = new THREE.AxesHelper(500);
    axes.position.set(-5000, -20, -5000);
    this.scene.add(axes);
  }

  addLayers() {
    let ug = new THREE.Mesh(
      new THREE.PlaneGeometry(7804, 3712),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/img/untergeschoss.jpg"),
        side: THREE.DoubleSide
      })
    );
    ug.rotation.x = -Math.PI / 2;
    ug.position.y = 0;

    let eg = new THREE.Mesh(
      new THREE.PlaneGeometry(7804, 3712),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/img/erdgeschoss.jpg"),
        side: THREE.DoubleSide
      })
    );
    eg.rotation.x = -Math.PI / 2;
    eg.position.y = 300;

    let og = new THREE.Mesh(
      new THREE.PlaneGeometry(7804, 3712),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/img/obergeschoss1.jpg"),
        side: THREE.DoubleSide
      })
    );
    og.rotation.x = -Math.PI / 2;
    og.position.y = 600;

    this.layers.push(ug);
    this.layers.push(eg);
    this.layers.push(og);
  }

  updateLayer(z) {
    if (this.layers[this.highestLayer].position.y <= z) {
      while (this.layers.length > this.highestLayer && this.layers[this.highestLayer].position.y <= z) {
        console.log(this.layers[this.highestLayer].position.y + "<=" + z)
        this.scene.add(this.layers[this.highestLayer]);
        this.highestLayer++;
      }
      this.highestLayer--;
    }
    else {
      while (this.highestLayer >= 0 && this.layers[this.highestLayer].position.y > z) {
        console.log(this.layers[this.highestLayer].position.y + ">" + z)
        this.scene.remove(this.layers[this.highestLayer]);
        this.highestLayer--;
      }
      this.highestLayer++;
    }
  }

  addTag() {
    this.tag = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    this.scene.add(this.tag);
  }

  setTagPosition(x, y, z, relativ?) {
    if (relativ) {
      this.tag.position.x += x;
      this.tag.position.y += y;
      this.tag.position.z += z;
    }
    else {
      this.tag.position.x = x;
      this.tag.position.y = y;
      this.tag.position.z = z;

    }
    this.updateLayer(this.tag.position.y);
  }

  onKey(event: any) { // without type info
    switch (event.keyCode) {
      case 33:
        this.camera.position.y += 10;
        break;
      case 34:
        this.camera.position.y -= 10;
        break;
      case 65:
          this.setTagPosition(-30, 0, 0, true);
        break;
      case 68:
          this.setTagPosition(30, 0, 0, true);
        break;
      case 87:
          this.setTagPosition(0, 0, -30, true);
        break;
      case 83:
          this.setTagPosition(0, 0, 30, true);
        break;
      case 67:
          this.setTagPosition(0, -30, 0, true);
        break;
      case 88:
          this.setTagPosition(0, 30, 0, true);
        break;
    }
  }
}
