//Angular Module
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from '@angular/forms';
//Eigene Module
import { AppRoutingModule } from './app-routing.module';
//Eigene Componenten
import { AppComponent } from './app.component';
import { CosComponent } from './cos/cos.component';
//PrimeNG
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { ListboxModule } from 'primeng/listbox';
import { FieldsetModule } from 'primeng/fieldset';
import { CheckboxModule } from 'primeng/checkbox';
@NgModule({
  declarations: [
    AppComponent,
    CosComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    //PrimeNG
    SidebarModule,
    ButtonModule,
    TooltipModule,
    FileUploadModule,
    ListboxModule,
    FieldsetModule,
    CheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
