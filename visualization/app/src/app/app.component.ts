import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  sidebarVisable = false;
  time:number;
  constructor() {

  }

  ngOnInit() {
    setInterval(() => {
      this.time=Date.now();
    },1000);
  }

  nextStep() {

  }

  loadSetup() {

  }

  // get time() {
  //   return Date.now();
  // }
}