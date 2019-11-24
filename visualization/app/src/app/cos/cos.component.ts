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
  @Input() width;
  @Input() height;
    highestLayer = -1;
  layers: THREE.Mesh[] = [];
  wall: THREE.Mesh;
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
    this.addMap();
    this.addTag();
    this.addWall();
    this.setTagPosition(0, 1000, 0);
    window.addEventListener('resize', ()=>{
      let width=this.canvas.nativeElement.offsetWidth;
      let height = this.canvas.nativeElement.offsetHeight;
      // this.canvas.nativeElement.width=width;
      // this.canvas.nativeElement.height=height;
      //this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }, false);
  }
  ngAfterViewInit() {
    let width=this.canvas.nativeElement.offsetWidth;
    let height = this.canvas.nativeElement.offsetHeight;
    this.canvas.nativeElement.width=1517//screen.width;//=window.innerWidth;
    this.canvas.nativeElement.height=694//screen.height;//window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(90, width / height, 10, 100000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.camera.position.set(2500, 4000, 4000);
    this.camera.position.set(2750, 6000, 4200);
    this.controls.panSpeed = 30;
    this.controls.maxDistance = 10000;
    this.controls.minDistance = 200;
    //this.camera.lookAt(this.tag.position);
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
        //side: THREE.DoubleSide
      })
    );
    ug.rotation.x = -Math.PI / 2;
    ug.rotation.z = 33.9 * Math.PI / 180;
    ug.position.y = 0;

    let eg = new THREE.Mesh(
      new THREE.PlaneGeometry(7804, 3712),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/img/erdgeschoss.jpg"),
        side: THREE.DoubleSide
      })
    );
    eg.rotation.x = -Math.PI / 2;
    eg.rotation.z = 33.9 * Math.PI / 180;
    eg.position.y = 300;

    let og = new THREE.Mesh(
      new THREE.PlaneGeometry(7804, 3712),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/img/obergeschoss1.jpg"),
        side: THREE.DoubleSide
      })
    );
    og.rotation.x = -Math.PI / 2;
    og.rotation.z = 33.9 * Math.PI / 180;
    og.position.y = 600;

    let roof = new THREE.Mesh(
      new THREE.PlaneGeometry(7804, 3712),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/img/dach.jpg"),
        side: THREE.DoubleSide
      })
    );
    roof.rotation.x = -Math.PI / 2;
    roof.rotation.z = 33.9 * Math.PI / 180;
    roof.position.y = 900;

    this.layers.push(ug);
    this.layers.push(eg);
    this.layers.push(og);
    this.layers.push(roof);
  }

  addMap() {
    let texture = new THREE.TextureLoader().load('https://maps.googleapis.com/maps/api/staticmap?center=52.455994,13.297120&zoom=19&size=512x512&maptype=satellite&key=AIzaSyBpNirZm2qbLVg6wuhclvojHkkOabKOSTI');
    let geometry = new THREE.PlaneGeometry(9287, 9287);
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      //side: THREE.DoubleSide
    })
    let map = new THREE.Mesh(geometry, material);
    map.rotation.x = -Math.PI / 2;
    map.position.y = -30
    this.scene.add(map);
  }
  addWall() {
    var stone = new THREE.MeshBasicMaterial({ color: 0xc8c8c8, side: THREE.DoubleSide });
    var open = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide });
    var geometry = new THREE.BoxBufferGeometry(7804, 1, 3712);

    var materials = [stone, stone, open, stone, stone, stone]
    //[rechts,links,oben,unten,vorne,hinten]

    this.wall = new THREE.Mesh(geometry, materials);
    this.wall.position.y = 300;
    this.wall.rotation.y = 33.9 * Math.PI / 180;
    this.scene.add(this.wall);
  }

  updateLayer(z) {
    if (this.highestLayer > 0 && this.layers[this.highestLayer].position.y > z) {
      while (this.highestLayer > 0 && this.layers[this.highestLayer].position.y > z) {
        this.scene.remove(this.layers[this.highestLayer--]);
      }
    }
    else {
      while (this.layers.length> this.highestLayer + 1 && this.layers[this.highestLayer + 1].position.y <= z) {
        this.scene.add(this.layers[++this.highestLayer]);
      }
    }
    console.log(this.highestLayer)
    if(this.highestLayer+1<this.layers.length){
      this.wall.scale.y=this.layers[this.highestLayer].position.y+300;
      this.wall.position.y=(this.layers[this.highestLayer].position.y+300)/2-1;
    }
    else{
      this.wall.scale.y=this.layers[this.highestLayer].position.y;
      this.wall.position.y=this.layers[this.highestLayer].position.y/2-1;
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
        this.camera.position.y += 30;
        break;
      case 34:
        this.camera.position.y -= 30;
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
