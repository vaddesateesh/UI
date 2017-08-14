/// <reference path="../../../../node_modules/@types/googlemaps/index.d.ts" />

import {} from '@types/googlemaps';

export interface AddressSuggestion {
    streetAddress?: string;
    streetNumber?: string;
    streetName?: string;
    city?: string;
    state?: string;
    county?: string;
    postalCode?: string;
    fullFormattedAddress?: string;
    predictionSource?: google.maps.places.AutocompletePrediction;
    geoSource?: GeocodedAddress;
};

export interface GeocodedAddress {
    street_number?: any;
    route?: any;
    locality?: any;
    country?: any;
    postal_code?: any;
    administrative_area_level_1?: any;
    administrative_area_level_2?: any;
};

export interface LatLong {
    lat?: number;
    long?: number;
    zipcode?: string;
};

export interface AddressSuggestionsReq {
    search?: string;
    scope?: any;
    filter?: LatLong;
    filterRadius?: number;
};


export interface AddressSuggestionDetails extends GeocodedAddress {
    mapped?: AddressSuggestion;
};
