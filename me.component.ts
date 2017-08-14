import {Subscription} from 'rxjs/Subscription'
import {ProgressService} from '../services/progress.service';
import {
    Component, Inject, OnDestroy, OnInit, Output, EventEmitter, AfterViewInit, ViewChild, ChangeDetectorRef, NgZone,
    ElementRef
} from '@angular/core';
import {GMapsService} from '../../../services/gmaps/gmaps.service';
import {AddressSuggestion, AddressSuggestionDetails} from '../../../services/gmaps/gmaps.models';
import {AddressSuggestionsComponent} from '../../common/address/suggestions.component';
import {Address} from '../../../services/bingmaps/models';
import {AboutMe, AboutMePlaceHolderText} from './about-me.model';
import {AboutMeService} from './about-me.service';
import {Router, ActivatedRoute} from "@angular/router"
import {Rules} from "../../../services/rules/rules-about-me.model";
import {RulesService} from "../../../services/rules/rules.service"
import {SessionService} from '../../../services/webstorage/session.service';
import {DobComponent} from '../../../shared/dob/dob.component';
import {RoundPipe} from '../../../shared/pipes/round.pipe';
import {PhoneNumberPipe} from '../../../shared/pipes/phone-number.pipe';
import {CustomEventService} from '../../../services/tealium/custom-event.service';
import {isNullOrUndefined} from "util";
import {CommonService} from "../quote/common-service/common-service";
import {ContentRootModel} from "../quote/model/content.model";
import {URLSearchParams} from '@angular/http';
import {EventListenerService} from "../../../services/tealium/event-listener.service";
import {ZipAddressService} from "../../../services/zipcode/zipaddress.service";



/**
 * About Me Component handles the capture of user information to start the quote process.
 * First Name, Last Name, DOB, Address, and Email Address are all required fields to move to the next stage in the quote process.
 */
@Component({
    moduleId: module.id,
    selector: 'app-about-me',
    templateUrl: 'about-me.component.html',
    styleUrls: ['about-me.component.scss'],
    providers: [GMapsService]
})
export class AboutMeComponent implements OnDestroy, OnInit, AfterViewInit {

    private aboutMeContent: ContentRootModel;
    private contentCallSuccess: boolean = false;

    webstorage;
    userzipcode:string;
    StateFound:boolean;

    /** Subscription observable for tracking component progress*/
    _subscription: Subscription;

    /** Get State full name*/
    countAddressAttr: number;
    StatusOnHold: boolean;
    adressFound;
    params: URLSearchParams;


    addressSuggestionsStateFilter: string;

    /** Temp variable for testing the response */
    response: any;


  /*Image URL*/

  lockImage:string = "https://ts0.hfdstatic.com/plstatic/int/sales/img/payment/icon-lock.svg";
  crateDownImage:string = "https://ts0.hfdstatic.com/plstatic/int/sales/img/about/caret-down.png";


    /** A boolean variable to track if state specific messaging should be displayed */
    showState: boolean = false;

    /** String variable used to hold the state display text. */
    disclaimerTxt: string = "";

  /** String variable used to hold the default disclaimer text. */
    defaultDisclaimerText:string = "";

    addressContent:string = "";

    initialLoad: boolean = false;
    showModal: boolean = false;
    loadAddress: string = '';

    //First Name
    //
    /** A boolean variable to track label focus status. */
    firstNameLabelFocus: boolean;

    /** A boolean variable to track label blur status. */
    firstNameLabelBlur: boolean;

    /** A boolean variable to track input filled status. */
    firstNameFilled: boolean;

    /** A boolean variable to track error status. */
    firstNameError: boolean;
    //


    //Last Name
    //
    /** A boolean variable to track label focus status. */
    lastNameLabelFocus: boolean;

    /** A boolean variable to track label blur status. */
    lastNameLabelBlur: boolean;

    /** A boolean variable to track input filled status. */
    lastNameFilled: boolean;

    /** A boolean variable to track error status. */
    lastNameError: boolean;
    //


    //DOB
    //
    /** A boolean variable to track label focus status. */
    dobLabelFocus: boolean;

    /** A boolean variable to track label blur status. */
    dobLabelBlur: boolean;

    /** A boolean variable to track input filled status. */
    dobFilled: boolean;

    /** A boolean variable to track error status. */
    dobError: boolean;
    //

    //Phone Number
    //
    /** A boolean variable to track label focus status. */
    phoneNumberLabelFocus: boolean;

    /** A boolean variable to track label blur status. */
    phoneNumberLabelBlur: boolean;

    /** A boolean variable to track input filled status. */
    phoneNumberFilled: boolean;

    /** A boolean variable to track error status. */
    phoneNumberError: boolean;

    tempPhone: string;
    tempPhoneDeleteCount: number;
    //


    //Address
    //
    /** A boolean variable to track label focus status. */
    addressLabelFocus: boolean;

    /** A boolean variable to track label blur status. */
    addressLabelBlur: boolean;

    /** A boolean variable to track input filled status. */
    addressFilled: boolean;

    /** A boolean variable to track error status. */
    addressError: boolean = false;
    //

    addressNotFoundSelected: boolean = false;
    noFoundAddressError: boolean;
    noFoundPostfixError: boolean;
    noFoundCityError: boolean;
    noFoundStateError: boolean;
    noFoundZipCodeError: boolean;
    activeAddress: boolean;
    activePostfix: boolean;
    activeCity: boolean;
    activeZipCode: boolean;
    @ViewChild("noFoundAddress") noFoundAddress: ElementRef;
    @ViewChild("noFoundPostfix") noFoundPostfix: ElementRef;
    @ViewChild("noFoundCity") noFoundCity: ElementRef;
    @ViewChild("noFoundState") noFoundState: ElementRef;
    @ViewChild("noFoundZipCode") noFoundZipCode: ElementRef;
    noFoundAddressText: string;
    noFoundPostfixText: string;
    noFoundCityText: string;
    noFoundStateText: string;
    noFoundZipCodeText: string;
  lastNoFoundZipCodeText:string ="";
  selectionMade = false;

    //Post Fix
    //
    /** A boolean variable to track label focus status. */
    postFixLabelFocus: boolean;

    /** A boolean variable to track label blur status. */
    postFixLabelBlur: boolean;

    /** A boolean variable to track input filled status. */
    postFixFilled: boolean;

    /** A boolean variable to track error status. */
    postFixError: boolean;
    //


    //Email
    //
    /** A boolean variable to track label focus status. */
    emailLabelFocus: boolean;

    /** A boolean variable to track label blur status. */
    emailLabelBlur: boolean;

    /** A boolean variable to track input filled status. */
    emailFilled: boolean;

    /** A boolean variable to track error status. */
    emailError: boolean;
    //

    //Middle Initial
    //
    /** A boolean variable to track label focus status. */
    miLabelFocus: boolean;

    /** A boolean variable to track label blur status. */
    miLabelBlur: boolean;

    /** A boolean variable to track input filled status. */
    miFilled: boolean;
    //

    hideSuggestions: boolean = false;


    @ViewChild('addressSuggestion') addressSuggestion: AddressSuggestionsComponent;

    @ViewChild('dobDir') dobDir: DobComponent;

    /** Output event emitter for changes to the address field */
    @Output() addressChanged = new EventEmitter<Address>();

    /** ViewChild to access aboutMeForm */
    @ViewChild('aboutMeForm') aboutMeForm;

    //Conversational window//
    /** String variable for use in the conversational window - name */
    public name = '';

    /** String variable for use in the conversational window - title */
    public title = '';//'Welcome! ' + this.name + 'Tell us about yourself.';

    /** String variable for use in the conversational window - user */
    public user = this.title;

    /** String variable for use in the conversational window - message */
   // public message = "Tell us a little bit about yourself. Let’s start with the basics -- your name, address, birthdate and email – so you can proceed with ease through the quote process.";
    private message:string;

    /** Rules resolve - rules coming back from rules engine - JSON response */
    rules: Rules;

    /** Used to store key/value pairs in session storage */
    storage: SessionService = new SessionService();

    /** Object for tracking the name and surname from the entered in the about me component */
    private static aboutme: any = {
        name: '',
        surname: ''
    }

    /** Object for tracking the name and surname from the entered in the about me component */
    nonStaticAboutme: any = {
        name: '',
        surname: ''
    }

    /** AboutMe data model for storing and tracking values inside the component */
    private aboutMe: AboutMe;
    private aboutMePlaceHolderText: AboutMePlaceHolderText;

    /** Service for tracking the individual progress of components */
    progressService: ProgressService;

    /** Component constructor for proper instantiation */
    constructor(@Inject(ProgressService) progressService: ProgressService,
                private commonService: CommonService,
                private zipAddressService: ZipAddressService,
                private route: ActivatedRoute,
                private router: Router,
                private aboutMeService: AboutMeService,
                private cdRef: ChangeDetectorRef,
                private roundPipe: RoundPipe,
                private phoneNumberPipe: PhoneNumberPipe,
                private ngZone: NgZone,
                private rulesService: RulesService,
                private gmapsService: GMapsService,
                private customEventService: CustomEventService,
                private addressService: ZipAddressService) {

        this.aboutMe = new AboutMe();
        this.progressService = progressService;
        this.nonStaticAboutme = AboutMeComponent.aboutme;

        this.tempPhone = "";
        this.tempPhoneDeleteCount = 0;


        this._subscription = this.progressService.passingData$.subscribe(
            res => {
                AboutMeComponent.aboutme.name = res.name;
                AboutMeComponent.aboutme.surname = res.surname;
            }
        )
        commonService.getPageContent('About Me').subscribe(data => this.mapAboutMeData(data));

        this.addressSuggestionsStateFilter = this.storage.getSession('STATE_TEST');
    }

    mapAboutMeData(data) {

        this.aboutMeContent = new ContentRootModel(data);

        console.log(this.aboutMeContent);

        this.message = this.aboutMeContent.get("BC_ABOUTME_CONVERSATIONAL_WINDOW");

      console.log(this.message);

       this.defaultDisclaimerText = this.aboutMeContent.get("BC_ABOUTME_PRIVACY_DISCLAIMER");
      this.addressContent = this.aboutMeContent.get("ER_ABOUTME_ADDRESS_NOT_LISTED");
      console.log(this.aboutMe.firstName.valueOf(),this.aboutMe.firstName);
      this.addressContent = "sfsdf"+this.aboutMe.firstName.valueOf();



       this.contentCallSuccess = true;

    }

    getNoAddressContent()
    {
      if(this.aboutMeContent && this.aboutMeContent.get("ER_ABOUTME_ADDRESS_NOT_LISTED"))
      {
        return  this.aboutMeContent.get("ER_ABOUTME_ADDRESS_NOT_LISTED").toString().replace('[NAME]',this.aboutMe.firstName.valueOf());
      }
      return "";

    }



    /*
     * Handles the keyup Event of input boxes. These events are used to show/hide input labels and elements.
     *
     * @param {any} elm - HTML event element in.
     *
     * ```
     * <input type="text" (keyup)="onChangeLabel($event)"/>
     * ```
     *
     *
     *
     */
    onChangeLabel(elm) {
        let tempLengthJump = false;

        //Ignore tabs
        if (elm.keyCode !== 9 && elm.target.id) {
            //Check for validation error
            if (elm.target.id === "firstName") {
                this.firstNameError = false;
            }
            //Check for validation error
            else if (elm.target.id === "lastName") {
                this.lastNameError = false;
            }
            //Check for validation error
            else if (elm.target.id === "phoneNumber") {


                if (!this.isNullOrUndefinedOrEmpty(this.tempPhone)) {
                    if (this.tempPhone.length - elm.target.value.length > 4) {
                        //Check hold down keyboard
                        tempLengthJump = true;
                    }
                }


                //Check delete count - allows delete of holding down backspace
                if (elm.keyCode == 8 || elm.keyCode == 46) {
                    this.tempPhoneDeleteCount++;
                }
                else {
                    //Reset
                    this.tempPhoneDeleteCount = 0;
                }

                if (!this.isNullOrUndefinedOrEmpty(this.tempPhone) && (elm.keyCode == 8 || elm.keyCode == 46) && this.tempPhoneDeleteCount < 4) {
                    this.checkUndeletePhoneNumber(elm, this.tempPhone, tempLengthJump);
                }
                else if (elm.keyCode !== 37 && elm.keyCode !== 39 && elm.keyCode !== 8 && elm.keyCode !== 46  && elm.keyCode !== 17 && elm.keyCode !== 36) //Backspace and arrows handling
                {
                    //Format phone number value
                    this.formatPhoneNumber(elm);
                    this.tempPhone = elm.target.value;
                    if(elm.keyCode == 57)
                    {
                      this.aboutMe.phoneNumber = elm.target.value;
                    }
                }

                //Set temp phone value
                //this.tempPhone = elm.target.value;

                this.phoneNumberError = false;

                //Catch hold down of keyboard and re-check
                if (elm.target.value.length > 14) {
                    elm.target.value = elm.target.value.substring(0, 14);
                }
            }
            else if (elm.target.id === "aboutMeAddress") {
                console.log("On keyup of address field");

                //Enable address suggestions
                if (elm.keyCode !== 37 && elm.keyCode !== 39 && elm.keyCode !== 8 && elm.keyCode !== 46 && elm.keyCode !== 65 && elm.keyCode !== 17 && elm.keyCode !== 36)
                    this.hideSuggestions = false;

                //Check for address is valid
                if (this.aboutMeForm.form.controls.aboutMeAddress.valid) {

                    //Check filled
                    if (elm.target.value == '') {
                        this.addressFilled = false;
                        this.showState = false;
                    }
                    else {
                        this.showState = false;
                        let str = elm.target.value;
                        // Get State name from session Variable
                        let stateNameVal = this.storage.getSession('state');
                        // Get state short Name from Session variable
                        let StateShortNameVal = this.storage.getSession('state_short_name');
                        let res = str.split(',');
                        // Condition to check state value
                        if (res.length > 2) {
                            // search for State name using regular expression
                            let regex = new RegExp(stateNameVal + '|' + StateShortNameVal, 'gi');
                            let pos = res[2].search(regex);
                            // If State Name Matches with Regular expression Show State Message
                            if (pos != -1) {
                                this.showState = true;
                            } else {
                                this.showState = false;
                            }
                            this.addressFilled = true;
                        }
                    }
                }
            }
            else if (elm.target.id === "aboutMeAddressPostFix") {
                //Check for validation error
                if (this.aboutMeForm.form.controls.aboutMeAddressPostFix.valid) {
                    this.postFixError = false;

                    //Check filled
                    if (elm.target.value == '') {
                        this.postFixFilled = false;
                    }
                    else {
                        this.postFixFilled = true;
                    }

                }
                else {
                    this.postFixError = true;
                    // TODO: Replace second arg with Fatwire key when available
                    this.customEventService.formFieldValidationErrors([elm.target.id], ["Please enter a valid Apt/Suite"]);
                }
            }
            //Check for validation error
            else if (elm.target.id === "emailAddress") {
                this.emailError = false;
            }
            else if (elm.target.id === "middleInitial") {
                if (elm.target.value != '') {
                    this.miFilled = true;
                }
            }
        }
    }


    /**
     * Handles the onFocus Event of input boxes. These events are used to show/hide input labels and elements.
     *
     * @param {any} elm - HTML event element in.
     *
     * ```
     * <input type="text" (focus)="onFocusLabel($event.target.id)"/>
     * ```
     */
    onFocusLabel(elm) {
        if (elm && elm.target && elm.target.id) {
            if (elm.target.id === "firstName") {
                this.firstNameLabelFocus = true;
                this.firstNameLabelBlur = false;
                this.firstNameFilled = true;
                this.firstNameError = false;
            }
            else if (elm.target.id === "lastName") {
                this.lastNameLabelFocus = true;
                this.lastNameLabelBlur = false;
                this.lastNameFilled = true;
                this.lastNameError = false;
            }
            else if (elm.target.id === "phoneNumber") {
                //If first time and blank add '('
                if (elm.target.value == '') {
                    elm.target.value = '(';
                }

                this.phoneNumberLabelFocus = true;
                this.phoneNumberLabelBlur = false;
                this.phoneNumberFilled = true;
                this.phoneNumberError = false;
            }
            else if (elm.target.id === "dateOfBirth") {
                this.dobLabelFocus = true;
                this.dobLabelBlur = false;
                this.dobFilled = true;

                if (this.aboutMe.dateOfBirth.valueOf() != '') {
                    if (this.aboutMeForm.form.controls.dateOfBirth.valid) {
                        this.dobError = false;
                    } else {
                        this.dobError = true;
                    }
                }
            }
            else if (elm.target.id === "aboutMeAddress") {
                console.log("Focusing on address field");
                this.addressLabelFocus = true;
                this.addressLabelBlur = false;
                this.addressFilled = true;
                this.addressError = false;
            }
            else if (elm.target.id === "aboutMeAddressPostFix") {
                this.postFixLabelFocus = true;
                this.postFixLabelBlur = false;
                this.postFixFilled = true;
            }
            else if (elm.target.id === "emailAddress") {
                this.emailLabelFocus = true;
                this.emailLabelBlur = false;
                this.emailFilled = true;
                this.emailError = false;
            }
            else if (elm.target.id === "middleInitial") {
                this.miLabelFocus = true;
                this.miLabelBlur = false;
                this.miFilled = true;
            }
        }
    }

    /**
     * Handles the onBlur Event of input boxes. These events are used to show/hide input labels and elements.
     *
     * @param {any} elm - HTML event element in.
     *
     * ```
     * <input type="text" ((blur)="onBlurLabel($event.target.id)"/>
     * ```
     */

    //FirstName onblur Event.
    onFisrtNameBlur(elm) {
        //Check for FirstName not empty and valid.
        if (this.aboutMe.firstName.valueOf() != '' || this.aboutMeForm.form.controls.firstName.valid) {
            this.firstNameFilled = true;
        }
        else {
            this.firstNameFilled = false;
        }
        //check empty value
        if (!this.firstNameFilled) {
            this.firstNameLabelFocus = true;
            this.firstNameError = true;
            this.aboutMePlaceHolderText.FirstNamePlaceHolderText = '';
            this.firstNameLabelBlur = true;

        } else {
            //CheckforvalidfirstName
            if (this.aboutMeForm.form.controls.firstName.valid) {
                this.firstNameError = false;
            } else {
                this.firstNameError = true;
            }
        }

        // tag form error in Tealium
        if (this.firstNameError && elm) {
          this.customEventService.formFieldValidationErrors([elm], [this.aboutMeContent.get("ER_ABOUTME_INVALID_FIRST_NAME")]);
        }
        this.firstNameFilled = false;
        this.storage.setSession('firstName', this.aboutMe.firstName);

    }

    //lastName onblur Event.
    onlastNameBlur(elm) {
        //Check for lastName not empty and valid.
        if (this.aboutMe.lastName.valueOf() != '' || this.aboutMeForm.form.controls.lastName.valid) {
            this.lastNameFilled = true;
        }
        else {
            this.lastNameFilled = false;
        }
        //check empty value
        if (!this.lastNameFilled) {
            this.lastNameLabelFocus = true;
            this.lastNameError = true;
            this.aboutMePlaceHolderText.LastNamePlaceHolderText = '';
            this.lastNameLabelBlur = true;
        } else {
            // Check for valid firstName
            if (this.aboutMeForm.form.controls.lastName.valid) {
                this.lastNameError = false;
            } else {
                this.lastNameError = true;
            }
        }
        // tag form error in Tealium
        if (this.lastNameError && elm) {
          this.customEventService.formFieldValidationErrors([elm], [this.aboutMeContent.get("ER_ABOUTME_INVALID_LAST_NAME")]);
        }
        this.lastNameFilled = false;
        this.storage.setSession('lastName', this.aboutMe.lastName);
    }

    //Address onblur Event.
    onaboutMeAddress(elm) {
        this.addressError = false;
        if (this.aboutMe.aboutMeAddress.valueOf() != '' && this.selectionMade) {
            this.addressFilled = false;
            this.addressError = false;
        }
        else  {
            this.aboutMe.aboutMeAddress = "";
            this.selectionMade = false;
            this.addressFilled = false;
            this.addressError = true;
            if (elm) {
                this.customEventService.formFieldValidationErrors([elm], [this.aboutMeContent.get("ER_ABOUTME_INVALID_ADDRESS")]);
            }
        }
    }

    //AddressPostFix onblur Event.
    onaboutMeAddressPostFix(elm) {
//Check for AddressPostFix not empty.
        if (this.aboutMe.aboutMeAddressPostFix && this.aboutMe.aboutMeAddressPostFix.valueOf() != '') {
            this.postFixFilled = true;
        }
        else {
            this.postFixFilled = false;
        }
//check empty value.
        if (!this.postFixFilled) {
            this.postFixLabelFocus = false;
            this.postFixLabelBlur = true;
        }
        this.postFixFilled = false;
    }

    //email onblur Event.
    onemailAddressBlur(elm) {
        //Check for email not empty.
        if (this.aboutMe.emailAddress.valueOf() != '') {
            this.emailFilled = true;
        }
        else {
            this.emailFilled = false;
        }
        //check empty value.
        if (!this.emailFilled) {
            this.emailLabelFocus = false;
            this.emailLabelBlur = true;
        } else if (this.emailFilled) {
            // Check for valid emailAddress.
            if (this.aboutMeForm.form.controls.emailAddress.valid) {
                this.emailError = false;
            } else {
                this.emailError = true;
                if (elm) {
                    this.customEventService.formFieldValidationErrors([elm], [this.aboutMeContent.get("ER_ABOUTME_INVALID_EMAIL_ADDRESS")]);
                }
            }
        }
        this.emailFilled = false;
        this.storage.setSession('email', this.aboutMe.emailAddress);
    }

    //PhoneNumber onblur Event.
    onPhoneNumberBlur(elm) {
        if (elm.target.value == '(') {
            elm.target.value = '';
            this.aboutMe.phoneNumber = '';
            this.phoneNumberFilled = false;
            this.phoneNumberError = false;
            this.phoneNumberLabelBlur = true;
            this.phoneNumberLabelFocus = false;
        }
        else {
            //check PhoneNumber is not empty value
            if (this.aboutMe.phoneNumber.valueOf() != '') {
                this.phoneNumberFilled = true;
            }
            else {
                this.phoneNumberFilled = false;
            }
            //check empty value.
            if (!this.phoneNumberFilled) {
                this.phoneNumberLabelFocus = false;
                this.phoneNumberLabelBlur = true;
            } else if (this.phoneNumberFilled) {
                // Check for valid PhoneNumber.
                if (this.aboutMeForm.form.controls.phoneNumber.valid) {
                    this.phoneNumberError = false;
                } else {
                    this.phoneNumberError = true;
                    if (elm.target.id) {
                        this.customEventService.formFieldValidationErrors([elm.target.id], [this.aboutMeForm.form.controls.phoneNumber._errors.validatePhoneNumber.errors.errorMsg]);
                    }
                }
            }
            this.phoneNumberFilled = false;
        }
    }

    //MiddleInitial onblur Event.
    onmiddleInitialBlur(elm) {
        if (this.aboutMe.middleInitial.valueOf() != '') {
            this.miFilled = false;
        }
        else {
            this.miFilled = false;
            this.miLabelBlur = true;
            this.miLabelFocus = false;
        }
    }

    /**
     * Handles the dblclick Event of input boxes. These events are used to show/hide input labels and elements.
     *
     * @param {any} elm - HTML event element in.
     *
     * ```
     * <input type="text" (dblclick)="dblclickLabel($event.target.id)"/>
     * ```
     */
    dblclickLabel(elm) {
        if (elm === "firstName") {
            this.firstNameError = false;
        }
        else if (elm === "lastName") {
            this.lastNameError = false;
        }
        else if (elm === "dateOfBirth") {
            this.dobError = false;
        }
        else if (elm === "emailAddress") {
            this.emailError = false;
        }
    }


    /**
     * Lifecycle component for destroy and cleanup.
     *
     */
    ngOnDestroy() {
        // this._subscription.unsubscribe();
    }

    validState: any = {};

    dateChange(obj: any) {
        this.validState[obj.component] = obj.valid;
        this.aboutMe.dateOfBirth = obj.value;
    }



    /**
     * Handles form submission. Form is checked for validation status before submission. If form passes validation, then the form is saved and the next step in the process is fired.
     *
     */


    private submitAboutMeForm(event) {
        // for tealium tagging
        let errorIdArray = [];
        let errorMsgArray = [];
        if (this.addressNotFoundSelected) {
            this.noFoundAddressError = !this.isValidNoFoundAddress();
            this.noFoundPostfixError = !this.isValidNoFoundPostfix();
            this.noFoundCityError = !this.isValidNoFoundCity();
            this.noFoundZipCodeError = !this.isValidNoFoundZipCode();

            // check for form validation errors
            if (this.noFoundAddressError) {
                if (event.target["5"].id) {
                    errorIdArray.push(event.target["5"].id);
                    errorMsgArray.push(this.aboutMeContent.get("ER_ABOUTME_INVALID_ADDRESS"));
                }
            }
            if (this.noFoundPostfixError) {
              // TODO: Replace the second arg with the corresponding Fatwire key
                if (event.target["6"].id) {
                    errorIdArray.push(event.target["6"].id);
                    errorMsgArray.push("Please enter a valid Apt/Suite");
                }
            }
            if (this.noFoundCityError) {
              // TODO: Replace the second arg with the corresponding Fatwire key
                if (event.target["7"].id) {
                    errorIdArray.push(event.target["7"].id);
                    errorMsgArray.push("Please enter a valid city");
                }
            }
            if (this.noFoundZipCodeError) {
                if (event.target["9"].id) {
                    errorIdArray.push(event.target["9"].id);
                    errorMsgArray.push(this.aboutMeContent.get("ER_ABOUTME_INVALID_ZIP"));
                }
            }
        } else {
            if (this.aboutMe.aboutMeAddress.trim() == "") {
                this.addressError = true;
                if (event.target["5"].id) {
                    errorIdArray.push(event.target["5"].id);
                    errorMsgArray.push(this.aboutMeContent.get("ER_ABOUTME_INVALID_ADDRESS"));
                }
            } else {
                this.addressError = false;
            }
        }

        let emailAddressVal = true;
        if (this.aboutMe && this.aboutMe.emailAddress && this.aboutMe.emailAddress.valueOf() == '') {
            emailAddressVal = true;
        } else {
            if (this.aboutMeForm && this.aboutMeForm.controls &&
                this.aboutMeForm.controls.emailAddress && this.aboutMeForm.controls.emailAddress.valid) {
                emailAddressVal = true;
            }
        }
        let phoneNumberVal = true;
        if (this.aboutMe && this.aboutMe.phoneNumber && this.aboutMe.phoneNumber.valueOf() == '') {
            phoneNumberVal = true;
        } else {
            if (this.aboutMeForm && this.aboutMeForm.controls && this.aboutMeForm.controls.phoneNumber && this.aboutMeForm.controls.phoneNumber.valid) {
                phoneNumberVal = true;
            }
        }

        //Check status
        if (this.aboutMeForm.form.controls.firstName.valid && this.aboutMeForm.form.controls.lastName.valid && this.validState.dob && emailAddressVal && phoneNumberVal) {
            //Update phone number
            this.aboutMe.phoneNumber = this.phoneNumberPipe.transform(this.aboutMe.phoneNumber, 0);
            this.aboutMe.address2 = this.aboutMe.aboutMeAddressPostFix;
            //Check State OnHold status, do following actions based on condition
            console.log("Status on hold is" + this.StatusOnHold);
            if (this.StatusOnHold) {
                this.router.navigate(['/sales/thank-you']);
            } else if ((this.addressNotFoundSelected && (!this.isValidNoFoundAddress() || !this.isValidNoFoundPostfix() || !this.isValidNoFoundCity() || this.noFoundStateError || this.noFoundZipCodeError)) || this.addressError) {
                event.preventDefault();
            } else {
                if (this.addressNotFoundSelected) {
                    this.aboutMe.address1 = this.noFoundAddressText;
                    this.aboutMe.aboutMeAddressPostFix = this.noFoundPostfixText;
                    this.aboutMe.city = this.noFoundCityText;
                    this.aboutMe.state = this.noFoundStateText;
                    this.aboutMe.zipCode = this.noFoundZipCodeText;
                    this.aboutMe.aboutMeAddress = this.aboutMe['address1']+", "+this.aboutMe['state']+", "+this.aboutMe['zipCode'];
                }
                this.aboutMeService.saveModelToOrch(this.aboutMe);
                this.progressService.stepSubmitted(this.nonStaticAboutme);

            }
        }
        else {
            if (this.aboutMe.firstName.valueOf() == '') {
                this.firstNameError = true;
                this.firstNameLabelFocus = true;
                this.aboutMePlaceHolderText.FirstNamePlaceHolderText = '';
                if (event.target["0"].id) {
                    errorIdArray.push(event.target["0"].id);
                    errorMsgArray.push(this.aboutMeContent.get("ER_ABOUTME_INVALID_FIRST_NAME"));
                }
            }
            if (this.aboutMe.lastName.valueOf() == '') {
                this.lastNameError = true;
                this.lastNameLabelFocus = true;
                this.aboutMePlaceHolderText.LastNamePlaceHolderText = '';
                if (event.target["2"].id) {
                    errorIdArray.push(event.target["2"].id);
                    errorMsgArray.push(this.aboutMeContent.get("ER_ABOUTME_INVALID_LAST_NAME"));
                }
            }
            if (this.aboutMe.dateOfBirth.valueOf() == '') {
                this.dobError = true;
                this.dobLabelFocus = true;
                this.aboutMePlaceHolderText.dobPlaceHolderText = '';
                errorIdArray.push("dateOfBirth");
                errorMsgArray.push(this.aboutMeContent.get("ER_ABOUTME_DATE_OF_BIRTH_NOT_ENTERED"));
            }
            else if(!this.validState.dob) {
              errorIdArray.push("dateOfBirth");
              errorMsgArray.push(this.dobDir.dateForm.form.controls.dateOfBirth._errors.validateDOB.errors.errorMsg);
            }
        }
        this.customEventService.formFieldValidationErrors(errorIdArray, errorMsgArray);
    }

    /**
     * Lifecycle component for init. Called after the constructor.
     *
     */
    ngOnInit() {

        //Init About Me Model
        this.aboutMe = {
            firstName: '',
            middleInitial: '',
            lastName: '',
            dateOfBirth: '',
            emailAddress: '',
            aboutMeAddress: '',
            address1: '',
            address2: '',
            state: '',
            city: '',
            zipCode: '',
            county: '',
            aboutMeAddressPostFix: '',
            qcn: '',
            guid: '',
            phoneNumber: ''
        };

        //Init About Me Placeholder Model
        this.aboutMePlaceHolderText = {
            FirstNamePlaceHolderText: 'First Name',
            LastNamePlaceHolderText: 'Last Name',
            dobPlaceHolderText: 'Date of Birth (mm/dd/yyyy)',
            emailAddressPlaceHolderText: 'Email Address',
            phoneNumberPlaceHolderText: 'Phone Number (xxx) xxx-xxxx',
            middleInitialPlaceHolderText: 'MI'
        };


        //Page on-load
        this.aboutMeService.getPageLoadData().subscribe(aboutMe => {
            if (!this.isNullOrUndefinedOrEmpty(aboutMe)
                && !this.isNullOrUndefinedOrEmpty(aboutMe.data)) {
                this.aboutMe = aboutMe.data;
                console.log(aboutMe.data);
                this.initialLoad = true;
                this.aboutMe.aboutMeAddress = aboutMe.data['address1'] + ", " + aboutMe.data['city'] + ", " + aboutMe.data['stateCd'] + ", " + aboutMe.data['zipCode'];
                this.aboutMe.aboutMeAddressPostFix = aboutMe.data['address2'];
                this.noFoundAddressText = aboutMe.data['address1'];
                this.noFoundPostfixText = aboutMe.data['address2'];
                this.noFoundCityText = aboutMe.data['city'];
                this.noFoundStateText = aboutMe.data['stateCd'];
                this.noFoundZipCodeText = aboutMe.data['zipCode'];
                this.loadAddress = this.aboutMe.aboutMeAddress;
                if (aboutMe.data['phoneNumber'] != null) {
                    this.aboutMe.phoneNumber = this.phoneNumberPipe.transform(aboutMe.data['phoneNumber'], 1);
                } else {
                    this.aboutMe.phoneNumber = "";
                }
                console.log(this.aboutMe.phoneNumber);

                this.aboutMe.dateOfBirth = aboutMe.data['dateOfBirth'];
                if (this.aboutMe.dateOfBirth && this.aboutMe.dateOfBirth != '') {
                    this.validState.dob = true;
                }

                this.checkForLabels(aboutMe.data);
            } else {
                this.noFoundCityText = this.storage.getSession("CITY_TEST");
                this.noFoundStateText = this.storage.getSession("STATE_TEST");
                this.noFoundZipCodeText = this.storage.getSession("ZIPCODE_TEST");
            }
          this.stateDisclaimerHelper(this.noFoundStateText);
          this.lastNoFoundZipCodeText = this.noFoundZipCodeText;
        });


        //Rule integration
        this.route.data.subscribe((res: {rules: Rules}) => {
            this.rules = res.rules;
        });

        this.noFoundAddress.nativeElement.onfocus = (event) => {
            this.activeAddress = true;
            this.noFoundAddressError = false;
        };
        this.noFoundPostfix.nativeElement.onfocus = (event) => {
            this.activePostfix = true;
            this.noFoundPostfixError = false;
        };
        this.noFoundCity.nativeElement.onfocus = (event) => {
            this.activeCity = true;
            this.noFoundCityError = false;
        };
        this.noFoundZipCode.nativeElement.onfocus = (event) => {
            this.activeZipCode = true;
            this.noFoundZipCodeError = false;
            this.lastNoFoundZipCodeText = this.noFoundZipCodeText;
        };
        this.noFoundAddress.nativeElement.onblur = (event) => {
            this.activeAddress = false;
            this.noFoundAddressError = !this.isValidNoFoundAddress();
            if (this.noFoundAddressError && event.target.id) {
              this.customEventService.formFieldValidationErrors([event.target.id], [this.aboutMeContent.get("ER_ABOUTME_INVALID_ADDRESS")]);
            }
        };
        this.noFoundPostfix.nativeElement.onblur = (event) => {
            this.activePostfix = false;
            this.noFoundPostfixError = !this.isValidNoFoundPostfix();
            if (this.noFoundPostfixError && event.target.id) {
              // TODO: Replace second arg with Fatwire key once available
              this.customEventService.formFieldValidationErrors([event.target.id], ["Please enter a valid Apt/Suite"]);
            }
        };
        this.noFoundCity.nativeElement.onblur = (event) => {
            this.activeCity = false;
            this.noFoundCityError = !this.isValidNoFoundCity();
            if (this.noFoundCityError && event.target.id) {
              // TODO: Replace second arg with Fatwire key once available
              this.customEventService.formFieldValidationErrors([event.target.id], ["Please enter a valid city"]);
            }
        };
        this.noFoundZipCode.nativeElement.onblur = (event) => {
            this.activeZipCode = false;
            this.setNoFoundZipCodeError(event.target.id);
          this.noFoundZipCodeError = !this.isValidNoFoundZipCode();
          if (this.noFoundZipCodeError && event.target.id) {
            this.customEventService.formFieldValidationErrors([event.target.id], [this.aboutMeContent.get("ER_ABOUTME_INVALID_ZIP")]);
          }
        };
    }

  setNoFoundZipCodeError(eventId) {

    if (this.noFoundZipCodeText && /\d{5}$/.test(this.noFoundZipCodeText)) {
      this.addressService.getAddressService(this.noFoundZipCodeText)
        .subscribe((response) => {
            if (response){
              if (response.state) {
                if(response.state == this.noFoundStateText) {
                  this.noFoundStateError = false;
                  this.lastNoFoundZipCodeText = this.noFoundZipCodeText;
                } else {
                  this.noFoundZipCodeText = this.lastNoFoundZipCodeText;
                  this.showModal = true;
                  this.customEventService.formFieldValidationErrors([eventId], [this.aboutMeContent.get("ER_ABOUTME_RATING_STATE_ERROR")]);
                  return;
                }
              }
              else {
                this.noFoundZipCodeText = this.lastNoFoundZipCodeText;
                this.showModal = true;
                this.customEventService.formFieldValidationErrors([eventId], [this.aboutMeContent.get("ER_ABOUTME_RATING_STATE_ERROR")]);
                return;

              }

              if(response.city && response.city.trim().length > 0) {
                this.noFoundZipCodeError = false;
                this.noFoundCityError = false;
                this.noFoundCityText = response.city;
              }
            }
          }
        );
    }
  }


  isValidNoFoundZipCode() {
        return (this.noFoundZipCodeText && /\d{5}$/.test(this.noFoundZipCodeText));
    }

    isValidNoFoundCity() {
        return (this.noFoundCityText && this.noFoundCityText.trim().length > 0 && /^[A-Za-z'.\- ]{1,33}$/.test(this.noFoundCityText));
    }
    isValidNoFoundPostfix() {
        let flag:boolean = false;
        if ((this.noFoundPostfixText && this.noFoundPostfixText.length > 0 && /^[\w\- ]{1,5}$/.test(this.noFoundPostfixText)) || this.noFoundPostfixText == null || this.noFoundPostfixText.trim().length == 0) {
            flag = true;
        }
        return flag;
    }
    isValidNoFoundAddress() {
        return (this.noFoundAddressText && this.noFoundAddressText.length > 0 && /^[\w\,\'\.\- \#]{1,40}$/.test(this.noFoundAddressText));
    }

    //To display labels on the navigate back to about me page
    checkForLabels(aboutMe: AboutMe) {
        if (this.aboutMe.firstName != null && (this.aboutMe.firstName.valueOf() != '' || this.aboutMeForm.form.controls.firstName.valid)) {
            this.firstNameFilled = false;
            this.firstNameLabelFocus = true;
        }
        else {
            this.firstNameFilled = true;
            this.firstNameLabelFocus = false;
        }

        if (this.aboutMe.middleInitial != null && this.aboutMe.middleInitial.valueOf() != '') {
            this.miFilled = false;
            this.miLabelFocus = true;
        }
        else {

            this.miLabelFocus = false;
        }
        if (this.aboutMe.lastName != null && (this.aboutMe.lastName.valueOf() != '' || this.aboutMeForm.form.controls.lastName.valid)) {
            this.lastNameFilled = false;
            this.lastNameLabelFocus = true;
        }
        else {
            this.lastNameFilled = true;
            this.lastNameLabelFocus = false;
        }
        if (this.aboutMe.aboutMeAddress != null && (this.aboutMe.aboutMeAddress.valueOf() != '' || this.aboutMeForm.form.controls.aboutMeAddress.valid)) {
            this.addressFilled = false;
            this.addressLabelFocus = true;
        }
        else {
            this.addressFilled = true;
            this.addressLabelFocus = false;
        }
        if (this.aboutMe.aboutMeAddressPostFix != null && this.aboutMe.aboutMeAddressPostFix.valueOf() != '') {
            this.postFixFilled = false;
            this.postFixLabelFocus = true;
        }
        else {

            this.postFixLabelFocus = false;
        }
        if (this.aboutMe.emailAddress != null && (this.aboutMe.emailAddress.valueOf() != '' || this.aboutMeForm.form.controls.emailAddress.valid)) {
            this.emailFilled = true;
            this.emailLabelFocus = false;
        }

        if (this.aboutMe.phoneNumber && this.aboutMe.phoneNumber.valueOf() != '') {
            this.phoneNumberFilled = false;
            this.phoneNumberLabelFocus = true;
        }

        else {
            this.emailFilled = false;
            this.emailLabelFocus = true;
        }
        if (this.aboutMe.phoneNumber != null && this.aboutMe.phoneNumber.valueOf() != '') {
            this.phoneNumberFilled = true;
            this.phoneNumberLabelFocus = false;
        }
        else {
            this.phoneNumberFilled = false;
            this.phoneNumberLabelFocus = true;
        }
        if (this.aboutMe.dateOfBirth != null && (this.aboutMe.dateOfBirth.valueOf() != '' || this.aboutMeForm.form.controls.dateOfBirth.valid)) {
            this.dobFilled = false;
            this.dobLabelFocus = true;

        }
        else {
            this.dobFilled = true;
            this.dobLabelFocus = false;
        }
    }


    //Null Undefined and Empty Check
    isNullOrUndefinedOrEmpty(value: any) {
        if (isNullOrUndefined(value) || value == "") {
            return true
        }
        return false
    }

    /**
     * Lifecycle component for init after view. Called when the components view has been initialized.
     *
     */
    ngAfterViewInit(): void {
    }

    /**
     * Event handler for when user selects address not listed option
     * in suggestions dropdown.
     *
     * @param event Object containing MouseEvent and the typed input text if any
     */
    onAddressNotListedEvent(event: any) {
        // handle event
        this.selectionMade = true;
        this.noFoundAddressText = "";
        this.noFoundPostfixText = "";
        this.addressNotFoundSelected = true;
        this.addressError = false;
    }

    onAddressChanged(event: any): void {
        this.selectionMade = true;
        this.addressError = false;
        if (!this.isNullOrUndefinedOrEmpty(event)
            && !this.isNullOrUndefinedOrEmpty(event.data)
            && !this.isNullOrUndefinedOrEmpty(event.data.mapped.state)) {
            if(event.data.mapped.state == this.noFoundStateText) {
                this.noFoundStateError = false;
            } else {
                this.noFoundStateError = true;
                this.customEventService.formFieldValidationErrors(["noFoundZipCode"], [this.aboutMeContent.get("ER_ABOUTME_ZIP_IN_DIFFERENT_STATE")]);
            }
        }
        if ((this.isNullOrUndefinedOrEmpty(event)
            || this.isNullOrUndefinedOrEmpty(event.data)
            || this.isNullOrUndefinedOrEmpty(event.data.mapped.streetNumber)
            || this.isNullOrUndefinedOrEmpty(event.data.mapped.streetName)
            || this.isNullOrUndefinedOrEmpty(event.data.mapped.city)
            || this.isNullOrUndefinedOrEmpty(event.data.mapped.state)
            || this.isNullOrUndefinedOrEmpty(event.data.mapped.postalCode))
            || this.noFoundStateError) {
            this.addressNotFoundSelected = true;
            this.noFoundAddressText = "";
            this.noFoundPostfixText = "";
            if (!this.isNullOrUndefinedOrEmpty(event.data.mapped.city)) {
                this.noFoundCityText = event.data.mapped.city;
            }
            if (!this.isNullOrUndefinedOrEmpty(event.data.mapped.postalCode)) {
                this.noFoundZipCodeText = event.data.mapped.postalCode;
              this.lastNoFoundZipCodeText = this.noFoundZipCodeText;
            }
        }
        this.addressSelected(event['data']);

        //CALL STATE ON HOLD VALIDATION FUNCTION
        this.onHoldStates();
    }

    /**
     * Address changed event handlers.
     * Emits event to subscribed listeners.
     *
     * @param address
     */
    addressSelected(address: AddressSuggestionDetails): void {
        if (typeof address.mapped.streetAddress != 'undefined') {
            this.aboutMe.address1 = address.mapped.streetAddress;
        }
        else {
            this.aboutMe.address1 = address.mapped.streetNumber + " " + address.mapped.streetName;
        }

        if (this.initialLoad && this.aboutMe.state != address.mapped.state) {
            //show Modal when changed to different rating state
            this.ngZone.run(() => this.showModal = true);
            this.aboutMe.aboutMeAddress = this.loadAddress
        } else {
            this.aboutMe.city = address.mapped.city;
            this.aboutMe.state = address.mapped.state;
            this.aboutMe.zipCode = address.mapped.postalCode;

            //Update address
            this.aboutMe.aboutMeAddress = address.mapped.fullFormattedAddress;

            //Check state disclaimer
            this.stateDisclaimerHelper(this.aboutMe.state);
            this.storage.setSession('state', this.aboutMe.state);
            if(address.administrative_area_level_1) {
              this.storage.setSession('state_short_name', address.administrative_area_level_1.short_name);
            }
            if (address.mapped.postalCode) {
                this.storage.setSession('zipCode', address.mapped.postalCode);
            }

            if(address.administrative_area_level_2)
            {
              let county: string = address.administrative_area_level_2.short_name;
              this.storage.setSession('county', county.substring(0, county.lastIndexOf(" County")));
            }
        }
    }

    /**
     * Helper function to display state specific messaging from rules engine.
     *
     * @param {string} stateIn - Full state name passed in (Example: "Connecticut").
     *
     */


    stateDisclaimerHelper(stateIn: String): void {

        this.showState = false;

        // Loop through state rules from Blaze service, which returns full state names
        // display state specific message if state matches one from Blaze rule
        let stateRules = this.rules.State["attrRules"];
        this.disclaimerTxt = "";
        for (let state in stateRules) {
            if ((state === stateIn && stateIn == "Michigan") || stateIn == "MI") {
                stateRules[state] = this.aboutMeContent.get("BC_ABOUTME_STATE_SPECIFIC_MESSAGE_MI");
                this.disclaimerTxt = stateRules[state]
            }
            else if ((state === stateIn && stateIn == "New Jersey")  || stateIn == "NJ") {
                stateRules[state] = this.aboutMeContent.get("BC_ABOUTME_STATE_SPECIFIC_MESSAGE_NJ");
                this.disclaimerTxt = stateRules[state]
            }
            else if ((state === stateIn && stateIn == "Virginia")  || stateIn == "VA") {
                stateRules[state] = this.aboutMeContent.get("BC_ABOUTME_STATE_SPECIFIC_MESSAGE_VA");
                this.disclaimerTxt = stateRules[state]
            }
            this.showState = true;
        }
        this.cdRef.detectChanges();
    }


    /**
     * Function to provide the manipulation of the phone number field needed for undelete of special characters.
     *
     * @param {any} elm - HTML input tel value.
     *
     */
    checkUndeletePhoneNumber(elm, tempPhone, skipDelete) {
        let newPhone = elm.target.value.replace(/\d+/g, '');
        let oldPhone = tempPhone.replace(/\d+/g, '');

        if ((newPhone.length < oldPhone.length) && !skipDelete) {
            //Dont allow delete of special character ( space -
            elm.target.value = tempPhone;
        }
    }

    /**
     * Function to call rule service and validate onHold states.
     */

    onHoldStates() {
        //Call updated rule

        this.rulesService.getUIRules(this.getParams()).subscribe(
            (response) => {
                this.adressFound = response.data.rules.Address.attrRules;
                this.countAddressAttr = Object.getOwnPropertyNames(this.adressFound).length;
                if (this.countAddressAttr > 0) {
                    this.storage.setSession("errorType", "onHold");
                    this.storage.setSession("errorReason", "STATE NOT AVAILABLE IN QUOTE FLOW");
                    this.storage.setSession("errorCode", "QUOTE_STATE_NOT_AVAILABLE");
                    for (let i = 0; i < this.countAddressAttr; i++) {
                        let errorDisplay = ("errorMsgPart" + (i + 1));
                        let message = (this.adressFound[errorDisplay]);
                        this.storage.setSession(errorDisplay, message);
                    }
                    this.StatusOnHold = true;

                }
                else {
                    this.StatusOnHold = false;
                }
            },
            (err) => {
                console.log(err);
            },
            () => {
                console.log("Completed CAT validation after the address is selected");
            }
        );
    }

    /**
     * Function to Get parameters for rule service.
     *
     */
    getParams() {
        this.params = new URLSearchParams();
        this.params.set('pageID', 'aboutme_info');
        this.params.set('state', this.storage.getSession('state_short_name'));
        this.params.set('lob', 'Auto');
        this.params.set('businessUnit', this.storage.getSession('AffinityID'));
        this.params.set('zipCode', this.storage.getSession('zipCode'));
        this.params.set('county', this.storage.getSession('county'));
        return this.params;
    }


    /**
     * Function to provide the manipulation of the phone number field needed.
     *
     * @param {any} elm - HTML input tel value.
     *
     */
    formatPhoneNumber(elm) {

        let tempValue = elm.target.value;
        let endPosition = elm.target.selectionEnd;

        var numbers = tempValue.replace(/\D/g, ''), char = {0: '(', 3: ') ', 6: '-'};
        tempValue = '';

        for (var i = 0; i < numbers.length; i++) {
            tempValue += (char[i] || '') + numbers[i];

            //Fix for )
            if (i == 2 && numbers.length == 3) {
                tempValue += ') ';
            }
        }


        //Set formatted value
        elm.target.value = tempValue;

        let spaceOffset = 0;
        if ((this.tempPhone.length > elm.target.value.length) || (this.tempPhone.length == elm.target.value.length)) {
            //Set offset
            spaceOffset = 1;
        }
        else if (this.tempPhone.length == 12 && elm.target.value.length == 13 && endPosition == 8) {
            spaceOffset = 1;
        }

        if (endPosition == 1) {
            elm.target.setSelectionRange(2, 2);
        }
        else if (endPosition == 2) {
            elm.target.setSelectionRange(3 - spaceOffset, 3 - spaceOffset);
        }
        else if (endPosition == 3) {
            elm.target.setSelectionRange(4 - spaceOffset, 4 - spaceOffset);
        }
        else if (endPosition == 4) {
            elm.target.setSelectionRange(7, 7);
        }
        else if (endPosition == 5) {
            elm.target.setSelectionRange(7, 7);
        }
        else if (endPosition == 6) {
            elm.target.setSelectionRange(7, 7);
        }
        else if (endPosition == 7) {
            elm.target.setSelectionRange(8 - spaceOffset, 8 - spaceOffset);
        }
        else if (endPosition == 8) {
            elm.target.setSelectionRange(9 - spaceOffset, 9 - spaceOffset);
        }
        else if (endPosition == 9) {
            elm.target.setSelectionRange(11 - spaceOffset, 11 - spaceOffset);
        }
        else if (endPosition == 10) {
            elm.target.setSelectionRange(12, 12);
        }
        else if (endPosition == 11) {
            elm.target.setSelectionRange(12 - spaceOffset, 12 - spaceOffset);
        }
        else if (endPosition == 12) {
            elm.target.setSelectionRange(13 - spaceOffset, 13 - spaceOffset);
        }
        else if (endPosition == 13) {
            elm.target.setSelectionRange(14 - spaceOffset, 14 - spaceOffset);
        }
        else if (endPosition == 14) {
            elm.target.setSelectionRange(14, 14);
        }
    }

    dateOfBirthStatus: boolean;

    setDateOfBirthStatus(valid) {
        this.dateOfBirthStatus = valid;
    }
}
