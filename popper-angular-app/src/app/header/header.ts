import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { createPopper, Instance } from '@popperjs/core';

interface MenuItem {
  label: string;
  action?: () => void;
  submenu?: MenuItem[];
  popperInstance?: Instance | null;
  submenuInstance?: Instance | null;
  isSubmenuVisible?: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('menuTrigger') menuTriggers!: QueryList<ElementRef>;
  @ViewChildren('menuElement') menuElements!: QueryList<ElementRef>; // To host app-menu

  headerMenus: MenuItem[][] = [
    [ // File Menu
      { label: 'Open', action: () => console.log('Open action') },
      { label: 'Save', action: () => console.log('Save action') },
      { label: 'Export As...', submenu: [
        { label: 'PDF', action: () => console.log('Export PDF') },
        { label: 'Word Document', action: () => console.log('Export Word') },
        { label: 'Text File', action: () => console.log('Export Text') }
      ]},
      { label: 'Exit', action: () => console.log('Exit action') }
    ],
    [ // Edit Menu
      { label: 'Cut', action: () => console.log('Cut action') },
      { label: 'Copy', action: () => console.log('Copy action') },
      { label: 'Paste', action: () => console.log('Paste action') }
    ],
    [ // View Menu
      { label: 'Zoom In', action: () => console.log('Zoom In') },
      { label: 'Zoom Out', action: () => console.log('Zoom Out') }
    ],
    [ // Help Menu
      { label: 'About', action: () => console.log('About action') }
    ]
  ];

  activeMenuPopper: Instance | null = null;
  activeMenuTrigger: HTMLElement | null = null;

  ngAfterViewInit() {
    this.menuTriggers.forEach((triggerElRef, index) => {
      const trigger = triggerElRef.nativeElement;
      const menuContainer = this.menuElements.toArray()[index]?.nativeElement.querySelector('.menu-container');

      if (trigger && menuContainer) {
        const popperInstance = createPopper(trigger, menuContainer, {
          placement: 'bottom-start',
          modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
        });
        // Store instance or manage it if needed, for now, just creating
        // We'll control display via hover
        menuContainer.style.display = 'none'; // Ensure hidden initially

        trigger.addEventListener('mouseenter', () => {
          if (this.activeMenuPopper && this.activeMenuTrigger !== trigger) {
            (this.activeMenuPopper.state.elements.popper as HTMLElement).style.display = 'none';
          }
          menuContainer.style.display = 'block';
          popperInstance.update();
          this.activeMenuPopper = popperInstance;
          this.activeMenuTrigger = trigger;
        });

        // Clicking outside or on another element should hide
        document.addEventListener('click', (event) => {
          if (!trigger.contains(event.target as Node) && !menuContainer.contains(event.target as Node)) {
             if(menuContainer.style.display === 'block') {
                menuContainer.style.display = 'none';
                if (this.activeMenuTrigger === trigger) {
                    this.activeMenuPopper = null;
                    this.activeMenuTrigger = null;
                }
             }
          }
        });

         // Hide when mouse leaves trigger AND menu (with a small delay for usability)
        let leaveTimeout: any;
        const combinedLeaveListener = () => {
          clearTimeout(leaveTimeout);
          leaveTimeout = setTimeout(() => {
            if (menuContainer.style.display === 'block' && !trigger.matches(':hover') && !menuContainer.matches(':hover')) {
                 menuContainer.style.display = 'none';
                 if (this.activeMenuTrigger === trigger) {
                    this.activeMenuPopper = null;
                    this.activeMenuTrigger = null;
                }
            }
          }, 100); // 100ms delay
        };
        trigger.addEventListener('mouseleave', combinedLeaveListener);
        menuContainer.addEventListener('mouseleave', combinedLeaveListener);

      }
    });
  }

  ngOnDestroy() {
    // Cleanup popper instances if stored and event listeners
    // For simplicity, not fully implemented here but important for real apps
    if (this.activeMenuPopper) {
      this.activeMenuPopper.destroy();
    }
    document.removeEventListener('click', () => {}); // This is a simplified removal
  }

  getMenuItemsForIndex(index: number): MenuItem[] {
    return this.headerMenus[index] || [];
  }
}
