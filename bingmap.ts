// vim: set ts=4 sw=4 et:
/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts" />

import { Injectable } from '@angular/core';
import { BingMapsApiConfig, BingMapsSuggestionsConfig, BingMapsApiLoader, Address } from './models';



// TODO: Replace console logging

@Injectable()
export class BingMapsService implements BingMapsApiLoader {

    private bingMapManager: Microsoft.Maps.AutosuggestManager;


    constructor() { }

    /**
     * Initializes initial map container to obtain a session key
     * for the REST APIs.
     */
    initApi(callback?: () => void): void {
        console.debug('Initializing bing maps injector script...');

        const apiLoaderCallback = 'bingMapCallback';

        // API will use this callback when loaded
        window[apiLoaderCallback] = callback || (() => {});

        const scriptContainer = document.createElement('script');
        scriptContainer.async = BingMapsApiConfig.async;
        scriptContainer.defer = BingMapsApiConfig.defer;
        scriptContainer.src = BingMapsApiConfig.mapUri + '?' + 'callback=' + apiLoaderCallback;

        document.head.appendChild(scriptContainer);
   }


   /**
    * Bootstrap bing maps ap Bootstrap bing maps api.

    * @param inputId address input id to read user input from
    * @param resultsId container id where suggestions are to be placed
    * @param callback address selection callback handler
    */
   initSuggestionsApi(inputId: string, resultsId: string, callback: (results) => void): void {
        this.initApi(this.initAddressSugggestions.bind(this, inputId, resultsId, callback));
   }



    /**
     * Initialize bing maps autosuggestion module.
     *
     * @param inputId
     * @param resultsId
     * @param callback
     */
    private initAddressSugggestions(inputId: string, resultsId: string, callback: (results) => void): void {
        console.debug('Initializing bing maps autosuggestions...');

        Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
            callback: () => {
                this.bingMapManager = new Microsoft.Maps.AutosuggestManager(BingMapsSuggestionsConfig);
                this.bingMapManager.attachAutosuggest(inputId, resultsId, callback);
            },
            credentials: BingMapsApiConfig.key,
            errorCallback: () => {
                console.error('Error getting address autosugesstions');
            }
        });
    }

}
