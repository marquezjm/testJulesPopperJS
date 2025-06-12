import { Component, Input, ElementRef, ViewChildren, QueryList, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { createPopper, Instance } from '@popperjs/core';

// Re-define or import MenuItem interface if not globally available
interface MenuItem {
  label: string;
  action?: () => void;
  submenu?: MenuItem[];
  submenuInstance?: Instance | null; // For Popper
  isSubmenuVisible?: boolean; // To control display of submenu component
  submenuElement?: HTMLElement; // Reference to the submenu DOM element
  submenuTriggerElement?: HTMLElement; // Reference to the item that triggers submenu
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class MenuComponent implements AfterViewInit, OnDestroy {
  @Input() items: MenuItem[] = [];
  @ViewChildren('submenuTrigger') submenuTriggers!: QueryList<ElementRef>;
  @ViewChildren('submenuContainer') submenuContainers!: QueryList<ElementRef>; // To host app-submenu

  private popperInstances: Instance[] = [];

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngAfterViewInit() {
    this.items.forEach((item, index) => {
      if (item.submenu) {
        const triggerElement = this.submenuTriggers.toArray()[index]?.nativeElement;
        // The submenu container is the next sibling div that holds <app-submenu>
        const submenuElement = triggerElement?.nextElementSibling?.querySelector('.submenu-container');


        if (triggerElement && submenuElement) {
          item.submenuElement = submenuElement; // Store ref
          item.submenuTriggerElement = triggerElement; // Store ref

          const popperInstance = createPopper(triggerElement, submenuElement, {
            placement: 'right-start',
            modifiers: [{ name: 'offset', options: { offset: [0, 2] } }]
          });
          this.popperInstances.push(popperInstance);
          item.submenuInstance = popperInstance;
          this.renderer.setStyle(submenuElement, 'display', 'none'); // Initially hidden

          this.renderer.listen(triggerElement, 'mouseenter', () => {
            this.showSubmenu(item);
          });

          // Hide submenu if mouse leaves trigger AND submenu content (with delay)
          let leaveTimeout: any;
          const combinedLeaveListener = () => {
            clearTimeout(leaveTimeout);
            leaveTimeout = setTimeout(() => {
              if (item.isSubmenuVisible && !triggerElement.matches(':hover') && !submenuElement.matches(':hover')) {
                 this.hideSubmenu(item);
              }
            }, 100);
          };
          this.renderer.listen(triggerElement, 'mouseleave', combinedLeaveListener);
          this.renderer.listen(submenuElement, 'mouseleave', combinedLeaveListener);
        }
      }
    });
  }

  showSubmenu(item: MenuItem) {
    if (item.submenuElement && item.submenuInstance) {
      // Hide other open submenus at the same level
      this.items.forEach(i => {
        if (i !== item && i.isSubmenuVisible) {
          this.hideSubmenu(i);
        }
      });
      this.renderer.setStyle(item.submenuElement, 'display', 'block');
      item.submenuInstance.update();
      item.isSubmenuVisible = true;
    }
  }

  hideSubmenu(item: MenuItem) {
    if (item.submenuElement) {
      this.renderer.setStyle(item.submenuElement, 'display', 'none');
      item.isSubmenuVisible = false;
    }
  }

  onItemClick(item: MenuItem, event: MouseEvent) {
    if (item.action) {
      item.action();
    }
    if (!item.submenu) { // If it's a direct action item, hide the main menu
      // Find parent menu container and hide it
      const parentMenu = (this.el.nativeElement as HTMLElement).closest('.menu-container');
      if (parentMenu) {
        this.renderer.setStyle(parentMenu, 'display', 'none');
      }
    }
    event.stopPropagation(); // Prevent click from bubbling to document listener in header
  }

  ngOnDestroy() {
    this.popperInstances.forEach(instance => instance.destroy());
    // Additional cleanup for listeners if not handled by Angular/Renderer2 automatically
  }
}
