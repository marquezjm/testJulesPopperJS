import { Component, Input, ElementRef, Renderer2 } from '@angular/core';

// Re-define or import MenuItem interface
interface MenuItem {
  label: string;
  action?: () => void;
  submenu?: MenuItem[]; // For nested submenus, though current Popper setup is for one level
  // We might need a recursive approach for deeper submenus with Popper.
  // For now, this structure supports one level of submenu within a menu.
}

@Component({
  selector: 'app-submenu',
  templateUrl: './submenu.html',
  styleUrls: ['./submenu.css']
})
export class SubmenuComponent {
  @Input() items: MenuItem[] = [];

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  onItemClick(item: MenuItem, event: MouseEvent) {
    if (item.action) {
      item.action();
    }
    // Hide all menus up the chain
    let currentElement = this.el.nativeElement;
    while(currentElement) {
      if (currentElement.classList.contains('menu-container') || currentElement.classList.contains('submenu-container')) {
        this.renderer.setStyle(currentElement, 'display', 'none');
      }
      if (currentElement.parentElement?.classList.contains('menu-container')) {
         this.renderer.setStyle(currentElement.parentElement, 'display', 'none');
      }
       if (currentElement.parentElement?.classList.contains('submenu-container')) {
         this.renderer.setStyle(currentElement.parentElement, 'display', 'none');
      }
      // try to find the main popper-managed element in header
      let mainPopperMenu = document.querySelector('.menu-container[style*="display: block"]')
      if(mainPopperMenu) this.renderer.setStyle(mainPopperMenu, 'display', 'none');


      currentElement = currentElement.parentElement;
      if(currentElement && currentElement.tagName === 'APP-HEADER') break; // Stop at header
    }
    event.stopPropagation();
  }
}
