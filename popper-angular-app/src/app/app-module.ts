import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { App } from './app';
import { Header } from './header/header';
import { Menu } from './shared/components/menu/menu';
import { Submenu } from './shared/components/submenu/submenu';

@NgModule({
  declarations: [
    App,
    Header,
    Menu,
    Submenu
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
