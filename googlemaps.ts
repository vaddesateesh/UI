/// <reference path="../../../../node_modules/@types/googlemaps/index.d.ts" />

import { Injectable } from '@angular/core';
import { AddressSuggestionsReq, AddressSuggestion, AddressSuggestionDetails, GeocodedAddress, LatLong } from './gmaps.models';
import { URLSearchParams, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import {env} from "../../../environments/environment-wrapper";

import {} from '@types/googlemaps';


@Injectable()
export class GMapsService {

    private GMAPS_SCRIPT_ID = 'gmaps-script-loader';
    private suggestionsService: google.maps.places.AutocompleteService;
    private geocoderService: google.maps.Geocoder;


    constructor() { }


    /**
     * Initialize the gmaps service api.
     *
     * @param containerId container id to use when injecting the script element
     * @param callback onload callback handler
     */
    public init(callback?: Function): void {
        const existingContainer = document.getElementById(this.GMAPS_SCRIPT_ID);

        if (!existingContainer) {
            const scriptContainer = document.createElement('script');
            scriptContainer.id = this.GMAPS_SCRIPT_ID;

            scriptContainer.src = env.GOOGLE_MAPS_API_URI +
                '?key=' +
              env.GOOGLE_MAPS_API_KEY +
                '&libraries=places';

            document.head.appendChild(Object.assign(scriptContainer, {
                onload: () => this.initApi.apply(this, [callback])
            }));
        } else {
            console.log('Existing gmaps api script loader already exists');
            this.initApi(callback);
        }

    }

    /**
     * Initialize the service objects.
     *
     * @param containerId container id to use when injecting the script element
     * @param callback onload callback handler
     */
    private initApi(callback?: Function): void {
        this.suggestionsService = new google.maps.places.AutocompleteService();
        this.geocoderService = new google.maps.Geocoder();

        if (callback) {
            callback();
        }
    }


    /**
     * Uses the gmaps service api to get address suggestions based on the criteria given.
     * Filtering can be used to further refine suggestion results - by zip, city, or state.
     *
     * @param addressReq
     * @param search
     * @param callback
     */
    public getSuggestions(addressReq: AddressSuggestionsReq, callback?: (data: any) => void): void {
        const suggestions: AddressSuggestion[] = [];

        if (!addressReq.search) {
            return;
        }

        this.suggestionsService.getPlacePredictions({
            input: addressReq.search,
            types: ['address'],
            location: new google.maps.LatLng(addressReq.filter.lat, addressReq.filter.long),
            radius: addressReq.filterRadius,
            componentRestrictions: {
                country: 'us'
            }
        },
        (resp, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                if (callback) {
                    callback(this.stateRestrictFilter(addressReq.scope.state, this.extractResults(resp)));
                }
            } else {
                if (callback) {
                    callback([]);
                }
                console.error('Place suggestions status code', status);
            }
        });
    }


    /**
     * Filters the given suggestion results to those only matching
     * the state provided. Comparison uses the abbreviated state.
     *
     * @param state abbreviated state string
     * @param data suggestions results provided by the api
     */
    private stateRestrictFilter(state: string, data: any[]): any[] {
        return data.filter(i => {
            return i.predictionSource.terms.some(t =>
                t.value.toUpperCase() === state.toUpperCase());
        });
    }


    /**
     * Extracts the address prediction details from the suggestions response.
     *
     * @param data
     */
    private extractResults(data: google.maps.places.AutocompletePrediction[]): any {
        const curated: any[] = [];

        if (!data) {
            return curated;
        }

        for (let i = 0; i < data.length; i++) {
            const prediction: google.maps.places.AutocompletePrediction = data[i];
            const result = prediction.terms;

            if (result) {
                const addressType = data[i]['types'][0];
                const model: AddressSuggestion = {};
                const addressStructure = data[i]['structured_formatting'];

                // Only curate matches with defined city, state, country
                if ((addressStructure['secondary_text'].split(',').length - 1) > 1) {
                    const displayAddress = [addressStructure['main_text'], addressStructure['secondary_text']].filter(o => !!o).join(', ');

                    model.fullFormattedAddress = this.formatDisplayAddress(displayAddress);
                    model.predictionSource = data[i];

                    curated.push(model);
                }
            }
        }

        return curated;
    }

    /**
     * Formats the address for display purposes.
     * In this particular case, strips the last component of the provided
     * google display text - e.g 'United States'.
     *
     * @param address
     */
    public formatDisplayAddress(address: string): string {
        if (!address) {
            return address;
        }

        const parts = address.split(',');

        return parts.splice(0, parts.length - 1).join(',');
    }


    /**
     * Extracts Lat and Long for an address.
     * Address can be zip, city or state.
     *
     * @param zipcode
     * @param callback
     */
    public geocodeAddress(scope: any, callback?: (ll: LatLong) => void): void {
        this.geocoderService.geocode(
            { address: ['state', scope.state].join(':')},
            (response, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (response && response.length !== 0) {
                        const location = response[0].geometry.location;
                        if (callback) {
                            callback(<LatLong>{
                                lat: location.lat(),
                                long: location.lng(),
                                scope: scope
                            });
                        }
                    }
                } else {
                    console.error('Geocode error status:', status);
                    callback(<LatLong>{});
                }
            });
    }


    /**
     * Gets address details using the provided placeId
     * and extracts the individual address components.
     *
     * @param placeId address suggestion placeId
     */
    public getPlaceDetails(placeId: string): Observable<any> {
        let observer: Observer<any>;
        const req = new Observable<any>(obs => {
            observer = obs;
        });

        this.geocoderService.geocode(
            { placeId: placeId },
            (response, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (response && response.length !== 0) {
                        observer.next(response[0]);
                    }
                } else {
                    console.error('Geocode error status:', status);
                    observer.error('Geocode error: ' + status);
                }
                observer.complete();
            });
            return req.map((data: any) => this.extractPlaceDetails(data))
                      .catch(this.handleRequestError);
    }


    /**
     * Extracts the address components from the details response.
     *
     * @param response
     */
    private extractPlaceDetails(response: google.maps.GeocoderResult): any {
        console.log('Extracting req details', response);

        if ('address_components' in response) {
            const data: google.maps.GeocoderResult = response;
            const result: AddressSuggestionDetails =
                <AddressSuggestionDetails>{ mapped: <AddressSuggestion>{} };

            data.address_components.forEach(element => {
                result[element.types[0]] = element;

                switch(element.types[0]) {
                    case 'postal_code':
                        result.mapped.postalCode = element.long_name;
                        break;
                    case 'locality':
                        result.mapped.city = element.long_name;
                        break;
                    case 'administrative_area_level_1':
                        result.mapped.state = element.short_name;
                        break;
                    case 'administrative_area_level_2':
                        result.mapped.county = element.long_name;
                        break;
                    case 'street_number':
                        result.mapped.streetNumber = element.long_name;
                        break;
                    case 'route':
                        result.mapped.streetName = element.long_name;
                        break;
                }
            });

            result.mapped.streetAddress =
                [result.mapped.streetNumber, result.mapped.streetName]
                .filter(o => !!o)
                .join(' ');

            result.mapped.fullFormattedAddress = this.formatDisplayAddress(data.formatted_address);

           return result;
        }

        console.warn('No place details found');

        return <AddressSuggestionDetails>{};
    }


    /**
     * Handle http request errors.
     *
     * @param error
     */
    private handleRequestError(error: Response | any): Observable<Response> {
        console.error('Gmaps web request error', error);
        return Observable.throw(error);
    }
}
