import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet],
  template: `
    <div class="layout-container">
      <router-outlet></router-outlet>
    </div>
  `
})
export class LayoutComponent {}