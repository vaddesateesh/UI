/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.d.ts" />

import { ENVIRONMENT } from '../../../../environments/environment';

export let BingMapsApiConfig = {
    mapUri: ENVIRONMENT.BING_MAPS_MAPCONTROL_URI,
    locationUri: ENVIRONMENT.BING_MAPS_LOCATIONS_URI,
    key: ENVIRONMENT.BING_MAPS_API_KEY,
    async: true,
    defer: true,
    requestTimeoutMs: 150
};


export let BingMapsSuggestionsConfig = {
    autoDetectLocation: true,
    placeSuggestions: false,
    maxResults: 5,
    showBingLogo: false
};





export interface Address {
    addressLine?: string;
    adminDistrict?: string;
    adminDistrict2?: string;
    countryRegion?: string;
    formattedAddress?: string;
    locality?: string;
    postalCode?: string;
};


export interface BingMapsApiLoader {
    initApi(callback?: () => void): void;
    initSuggestionsApi(inputId: string, resultsId: string, callback: (d) => void): void;
};
