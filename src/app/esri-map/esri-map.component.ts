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

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy, OnChanges} from "@angular/core";
import { loadModules } from "esri-loader";
import esri = __esri; // Esri TypeScript Types

@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"]
})
export class EsriMapComponent implements OnInit, OnDestroy, OnChanges {
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
  public streetVector: any; 
  public fuelStationLayer: any;
  public esriSampleURL: any; 
  public ppdrGraphicPT = [];
  public graphicPointFeature: any; 
  public cfLayer;
  public sfLayer;
  public pointHeat = {
    type: "heatmap",
    blurRadius: 5,
    colorStops: [
      { color: "rgba(63, 40, 102, 0)", ratio: 0 },
      { color: "#472b77", ratio: 0.083 },
      { color: "#4e2d87", ratio: 0.166 },
      { color: "#563098", ratio: 0.249 },
      { color: "#6735be", ratio: 0.415 },
      { color: "#853fff", ratio: 0.664 },
      { color: "#c29f80", ratio: 0.83 },
      { color: "#ffff00", ratio: 0.913 },
      { color: "#fab300", ratio: 1 } 
    ],
        maxPixelIntensity: 75,
        minPixelIntensity: 0
  };
  public simpleMarkerSymbol = {
    type: "simple",
    symbol:{
      type: "simple-marker",
      style: "circle",
      color: [108, 99, 43],
      size: 9, 
      outline: {
        color: [255, 255, 255],
        width: 0.8
      }
    } 
  };

  @Input() layerType: string;
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
      const [EsriMap, EsriMapView, FeatureLayer, VectorTileLayer, Basemap, Graphic] = await loadModules([
        "esri/Map",
        "esri/views/MapView",
        'esri/layers/FeatureLayer',
        'esri/layers/VectorTileLayer',
        'esri/Basemap',
        'esri/Graphic'
      ]);
       this.streetVector = new VectorTileLayer({
        portalItem: {
          id: "63c47b7177f946b49902c24129b87252" 
        }
      });

      let basemap = new Basemap({
        baseLayers: [
          new VectorTileLayer({
            //url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer",
            portalItem: {
              id: "8a2cba3b0ebf4140b7c0dc5ee149549a" 
            },
            title: "Basemap"
          })
        ],
        title: "basemap",
        id: "basemap"
      });
      this.fuelStationLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Alternative_Fuel_Stations/FeatureServer/0",
        outFields: ["*"],
        renderer: this.simpleMarkerSymbol
      })
      this.esriSampleURL = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/BreweriesCA/FeatureServer/0",
        outFields: ["*"],
        renderer: this.simpleMarkerSymbol
      })
      this.cfLayer = new FeatureLayer({
        url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2",
        outFields: ["*"],
      })
      this.sfLayer = new FeatureLayer({
        url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3",
        outFields: ["*"],
      })
      // Configure the Map
      const mapProperties: esri.MapProperties = {
        basemap: basemap
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
      const LocaData = [{"rowID": 1,"name":"AA","lat":"33.2011667","long":"-116.7396667"},
				{"rowID": 2,"name":"BA","lat":"33.1711667","long":"-116.4185"},
				{"rowID": 3,"name":"CA","lat":"33.1863333","long":"-115.6725"},
				{"rowID": 4,"name":"ZZ","lat":"33.183","long":"-115.6006667"},
				{"rowID": 5,"name":"ZA","lat":"33.181","long":"-115.603"},
				{"rowID": 6,"name":"VA","lat":"33.1785","long":"-115.6071667"},
				{"rowID": 7,"name":"VC","lat":"33.1948333","long":"-116.7335"},
				{"rowID": 8,"name":"VB","lat":"33.1948333","long":"-116.728"},
				{"rowID": 9,"name":"EE","lat":"33.2196667","long":"-116.735"},
				{"rowID": 10,"name":"DC","lat":"33.2215","long":"-116.076"},
				{"rowID": 11,"name":"DA","lat":"33.1775","long":"-115.6072667"},
				{"rowID": 12,"name":"DD","lat":"33.1988333","long":"-116.7345"},
				{"rowID": 13,"name":"BC","lat":"33.1848333","long":"-116.727"},
				{"rowID": 14,"name":"BB","lat":"33.2146667","long":"-116.739"},
				{"rowID": 15,"name":"AZ","lat":"33.2225","long":"-116.075"},
				{"rowID": 16,"name":"AB","lat":"33.1723333","long":"-116.1118333"}];
      for(let i = 0; i< LocaData.length; i++){
        const point = {
          type: "point",
          longitude: LocaData[i].long,
          latitude: LocaData[i].lat
        };
        const attributes = {
          row_ID: LocaData[i].rowID,
          place_name: LocaData[i].name
        }
        const pointGraphic = new Graphic({
          geometry: point,
          symbol: this.simpleMarkerSymbol.symbol,
          attributes: attributes
        });
        //graphicsLayer.add(pointGraphic);
        this.ppdrGraphicPT.push(pointGraphic);
      }
      
      this.graphicPointFeature = new FeatureLayer({
        fields: [
        {
          name: "id", 
          alias: "id",
          type: "oid"
        },
        {
          name: "row_ID" ,
          type: "long"
        },
        {
          name: "place_name" ,
          type: "string"
        }],
        objectIdField: "id",
        geometryType: "point",
        spatialReference: { wkid: 4326 },
        source: this.ppdrGraphicPT,
        renderer: this.simpleMarkerSymbol
      });
      await this._view.when();
      return this._view;
    } catch (error) {
      console.log("EsriLoader: ", error);
    }
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(mapView => {
      this._view.map.add(this.fuelStationLayer);
      // this._view.watch("scale", newValue => {
      //   this.fuelStationLayer.renderer = newValue <= 100000 ? this.simpleMarkerSymbol : this.pointHeat;
      // })
      this._view.on('click', event => {
        this._view.hitTest(event).then(response => {
          if (response.results.length) {
            console.log("Result: ",response);
            const graphic = response.results.filter(result => {
              return result.graphic.layer === this.fuelStationLayer;
            })[0].graphic;
            console.log("Name: " + graphic.attributes.Station_Name);
          }
        });
      });
      // The map has been initialized
      console.log("mapView ready: ", this._view.ready);
      this._loaded = this._view.ready;
      this.mapLoadedEvent.emit(true);
    });
  }
  ngOnChanges(){
    if(this.layerType === 'state'){
      this._view.map.removeAll();
      this._view.map.basemap.baseLayers.forEach((baseLayer) => {
        baseLayer.visible = false;
      })
      //this._view.map.removeAll();
      this._view.map.add(this.sfLayer)
    }
    if(this.layerType === 'county'){
      this._view.map.removeAll();
      this._view.map.basemap.baseLayers.forEach((baseLayer) => {
        baseLayer.visible = false;
      })
      this._view.map.add(this.streetVector);
      this._view.map.add(this.graphicPointFeature);
      // this._view.watch("scale", newValue =>
      // {
      //   this.graphicPointFeature.renderer = newValue <= 300000 ? this.simpleMarkerSymbol : this.pointHeat;
      // });
      this._view.on('click', event => {
        this._view.hitTest(event).then(response => {
          if (response.results.length) {
            console.log("Result: ",response);
            const graphic = response.results.filter(result => {
              return result.graphic.layer === this.graphicPointFeature;
            })[0].graphic;
            console.log("Name: " + graphic.attributes.place_name);
          }
        });
      });
    }
    if(this.layerType === 'dPoint'){ 
      this._view.map.removeAll();
      this._view.map.basemap.baseLayers.forEach((baseLayer) => {
        baseLayer.visible = false;
      })
      this._view.map.add(this.streetVector);
      this._view.map.add(this.fuelStationLayer)
    }
  }
  ngOnDestroy() {
    if (this._view) {
      // destroy the map view
      this._view.container = null;
    }
  }
}
