import { Component, Input, Output, EventEmitter, AfterViewInit, NgZone } from '@angular/core';
import { GMapsService } from '../../../services/gmaps/gmaps.service';
import { AddressSuggestionsReq, AddressSuggestion, LatLong } from '../../../services/gmaps/gmaps.models';
import {env} from "../../../../environments/environment-wrapper";

@Component({
    selector: 'app-address-suggestions',
    templateUrl: 'suggestions.component.html',
    providers: [GMapsService]
})
export class AddressSuggestionsComponent implements AfterViewInit {

    @Input() input: any;
    @Input() notListedText: string;
    @Input() scope: { zipcode?: string, state?: string };
    @Output() addressChanged = new EventEmitter<any>();
    @Output() addressNotListedEvent = new EventEmitter<any>();

    suggestions: AddressSuggestion[] = [];
    visible = false;
    suggestionTimeout: any;
    latLong: LatLong;


    constructor(private gmapsService: GMapsService,
                private zone: NgZone) {
     }


    ngAfterViewInit(): void {
        this.gmapsService.init(() => {
            this.gmapsService.geocodeAddress(this.scope, (ll: LatLong) => {
                console.log('LatLong', ll, this.scope);
                this.latLong = ll;
            });
        });

        this.input.addEventListener('keyup', (event: KeyboardEvent) => {
            switch (event.keyCode) {
                case 9: // skip tab focus event
                    return;
            }
            this.handleAddressSearch(event, this.input);
        });
    }


    handleNotListedSelection(event: Event) {
        this.addressNotListedEvent.emit({
            event: event,
            addressInputText: this.input.value
        });
    }


    handleAddressSelection(event: Event, address: AddressSuggestion): void {
        console.log('Address selection', address);
        this.zone.runOutsideAngular(() => {
            const rt = this.gmapsService.getPlaceDetails(address.predictionSource.place_id);
            rt.subscribe(data => {
                console.log('Suggestions details handler', data);
                this.addressChanged.emit({event: event, data: data});
            });
        });
    }


    handleAddressSearch(event: KeyboardEvent, address: HTMLInputElement): void {
        this.zone.runOutsideAngular(() => {
            if (!address.value) {
                this.suggestions = [];
            }

            if (this.suggestionTimeout) {
                clearTimeout(this.suggestionTimeout);
            }

            this.suggestionTimeout = setTimeout(() => {
                this.visible = true;
                this.gmapsService.getSuggestions(
                    <AddressSuggestionsReq>{
                        search: address.value,
                        scope: this.scope,
                        filter: this.latLong,
                        filterRadius: env.GOOGLE_MAPS_SCOPE_RADIUS_METERS
                    },
                    (data) => {
                        this.zone.run(() => {
                            this.suggestions = data;
                        });
                    });
            }, env.GOOGLE_MAPS_REQ_DELAY_MS);
        });
    }


    onShowSuggestions(event: Event): void {
        this.visible = (!!this.input.value || this.input.value.length !== 0);
    }


    onHideSuggestions(event: Event): void {
        this.visible = false;
    }


}
