import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  // Set our map properties
  mapCenter = [-116.1118, 33.17233];
  basemapType = 'gray-vector';
  mapZoomLevel = 8;
  public layerRadioBTN = "dPoint";

  // See app.component.html
  mapLoadedEvent(status: boolean) {
    console.log('The map loaded: ' + status);
  }
}

