/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { loadModules } from "esri-loader";
import esri = __esri; // Esri TypeScript Types

@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"]
})
export class EsriMapComponent implements OnInit, OnDestroy {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  // The <div> where we will place the map
  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  /**
   * _zoom sets map zoom
   * _center sets map center
   * _basemap sets type of map
   * _loaded provides map loaded status
   */
  private _zoom = 10;
  private _center: Array<number> = [0.1278, 51.5074];
  private _basemap = "streets";
  private _loaded = false;
  private _view: esri.MapView = null;
  public paDamageFeatureLayer;
  public paDamagePtHeatVal = {
    type: "heatmap",
    blurRadius: 5,
    colorStops: [
      { color: "rgba(63, 40, 102, 0)", ratio: 0 },
      { color: "#472b77", ratio: 0.083 },
      { color: "#4e2d87", ratio: 0.166 },
      { color: "#563098", ratio: 0.249 },
      { color: "#5d32a8", ratio: 0.332 },
      { color: "#6735be", ratio: 0.415 },
      { color: "#7139d4", ratio: 0.498 },
      { color: "#7b3ce9", ratio: 0.581 },
      { color: "#853fff", ratio: 0.664 },
      { color: "#a46fbf", ratio: 0.747 },
      { color: "#c29f80", ratio: 0.83 },
      { color: "#ffff00", ratio: 0.913 },
      { color: "#fab300", ratio: 1 } 
    ],
        maxPixelIntensity: 55,
        minPixelIntensity: 0
  };
  public uniqueSitesRender = {
    type: "unique-value",
    field: "project_status",
    defaultSymbol: { 
      type: "simple-marker",
      style: "circle",
      color: [108, 199, 43],
      size: 10, 
      outline: {
        color: [255, 255, 255],
        width: 1
      }
    },
    uniqueValueInfos: [{
      value: "0", //project formulation
      symbol:{
        type: "simple-marker",
        style: "circle",
        //color: [25, 113, 255],
        color: "#56CCF2",
        size: 10, 
        outline: {
          color: [255, 255, 255],
          width: 1
        }
      }
    }, {
      value: "1", //obligated 
      symbol:{
        type: "simple-marker",
        style: "circle",
        color: [108, 199, 43],
        size: 10, 
        outline: {
          color: [255, 255, 255],
          width: 1
        }
      }
    }]
  };

  get mapLoaded(): boolean {
    return this._loaded;
  }

  @Input()
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  @Input()
  set center(center: Array<number>) {
    this._center = center;
  }

  get center(): Array<number> {
    return this._center;
  }

  @Input()
  set basemap(basemap: string) {
    this._basemap = basemap;
  }

  get basemap(): string {
    return this._basemap;
  }

  constructor() {}

  async initializeMap() {
    try {
      // Load the modules for the ArcGIS API for JavaScript
      const [EsriMap, EsriMapView, FeatureLayer] = await loadModules([
        "esri/Map",
        "esri/views/MapView",
        'esri/layers/FeatureLayer'
      ]);
      this.paDamageFeatureLayer = new FeatureLayer({
        url: "https://uatgis.recovery.pr/webgisdev/rest/services/pa_damage_dev/MapServer/0",
        outFields: ["*"],
        renderer: this.paDamagePtHeatVal
      })

      // Configure the Map
      const mapProperties: esri.MapProperties = {
        basemap: this._basemap
      };

      const map: esri.Map = new EsriMap(mapProperties);

      // Initialize the MapView
      const mapViewProperties: esri.MapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this._center,
        zoom: this._zoom,
        map: map
      };

      this._view = new EsriMapView(mapViewProperties);
      this._view.map.add(this.paDamageFeatureLayer);
      await this._view.when();
      return this._view;
    } catch (error) {
      console.log("EsriLoader: ", error);
    }
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(mapView => {
      // The map has been initialized
      console.log("mapView ready: ", this._view.ready);
      this._loaded = this._view.ready;
      this.mapLoadedEvent.emit(true);
    });
  }

  ngOnDestroy() {
    if (this._view) {
      // destroy the map view
      this._view.container = null;
    }
  }
}
