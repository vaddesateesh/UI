import { Component, OnInit, Renderer,OnDestroy, ElementRef, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {ProgressService} from "../../sales/auto/services/progress.service";
import {SessionService} from "../../services/webstorage/session.service";
import {StageModel} from "../../sales/auto/model/stage.model";
import { RouterModule, Router } from "@angular/router";

@Component({
  selector: 'ss-global-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss']
})
export class HeaderComponent implements OnInit,OnDestroy {
  componentName: string;
  expanded: boolean = false;
  currentStep: number;
  selectedAffinityID:string;

  //stage nodes
  aboutme: StageModel;
  vehicle: StageModel;
  drivers: StageModel;
  coverage: StageModel;
  confirm_pay: StageModel;
  contain;
  routePaths:any=["/sales/auto/about-me","/sales/thank-you","/sales/auto/payment"];
  currentPath:string='';


  stagesArray: StageModel[] = [];

  constructor(private rd: Renderer,private sessionService:SessionService,private router:Router, private progressService: ProgressService, private _router: Router) {
    this.componentName = "header";
    router.events.subscribe((route:any) => {
      console.log(route.url +" current active url");
      this.currentPath = route.url;
    })

    this.currentStep = 0;
    this.stagesArray = progressService.stages;
    this.aboutme = this.stagesArray[0];
    this.vehicle = this.stagesArray[1];
    this.drivers = this.stagesArray[2];
    this.coverage = this.stagesArray[3];
    this.confirm_pay = this.stagesArray[4];
  }

  toggleMenu() { //Show/hide menu
    let body = document.getElementsByTagName('body')[0];
    if (body.clientWidth > 0) {
      this.expanded = !this.expanded;
      var menuWrapper = document.getElementById('mobileMenu');

      if (this.expanded) {
        body.style.marginLeft = "100px"; //change a body push here
        body.style.overflowX = "hidden";
        menuWrapper.className += " expanded";
      } else {
        menuWrapper.className = menuWrapper.className.replace(" expanded", "");
        body.style.marginLeft = "0";
        setTimeout(() => {
          body.style.overflowX = "auto";
          this.hideAllSubmenu()
        }, 300);
      }
    }
  }

  toggleSubmenu(event: any) { //Show/hide submenu
    var target = event.target
      , submenu;

    let expanded: boolean;
    if (target.nodeName == "I") {
      expanded = this.hasClass(target.classList, "fa-angle-down"); //Is Expanded?
    }
    else {
      if (target.lastElementChild) {
        expanded = this.hasClass(target.lastElementChild.classList, "fa-angle-down")  //Is Expanded?
      }
    }

    if (expanded === undefined) return;
    this.hideAllSubmenu();  //clear all menu changes

    if (target.nodeName == "I") {

      target.className =
        expanded ?
          target.className.replace("down", "up")
          : target.className.replace("up", "down");  //Set icon up\down

      target = target.offsetParent; //select icon parent
      target.className += expanded ? " active-section" : ""; //add active class to section header
      submenu = target.nextElementSibling; //get submenu
    }
    else if (target.nodeName == "DIV") {

      if (target.lastElementChild) {
        target.lastElementChild.className =
          expanded ?
            target.lastElementChild.className.replace("down", "up")
            : target.lastElementChild.className.replace("up", "down");  //Set icon up\down
      }


      target.className += expanded ? " active-section" : ""; //add active class to section header
      submenu = target.nextElementSibling; //get submenu
    }
    if (submenu) {
      submenu.style.display = expanded ? "block" : "none";
    }
    else {
      this.hideAllSubmenu();  //clear all menu changes
    }
  }

  hasClass(array: string[], element: string): boolean {
    if (array.length) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] == element) {
          return true;
        }
      }
    }
    return false;
  }

  hideAllSubmenu() { //clear all menu changes
    var sections = document.getElementsByClassName("section-header");
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      section.className = section.className.replace(" active-section", ""); //remove all active classes
      var icon = section.lastElementChild;
      if (icon) {
        icon.className = icon.className.replace("up", "down"); //set all icons down
      }

      let submenu: any = section.nextElementSibling;
      if (submenu) {
        submenu.style.display = "none"; //hide all submenu
      }
    }
  }

  setSessionId() {
    let selectedAffinityID = this.sessionService.getSession('AffinityID');
    if(null != selectedAffinityID) {
      this.selectedAffinityID = selectedAffinityID;
    } else {
      this.selectedAffinityID = "46";
    }
  }

  ngOnInit() {
    this.setSessionId();
  }

  ngOnDestroy() {

  }

  getLogoType():string {
    this.setSessionId();
    if (this.selectedAffinityID === "46") {
      return 'aarp-logo';
    } else if (this.selectedAffinityID == "42") {
      return 'direct-logo';
    } else {
      return 'aarp-logo';
    }
  }

  isAffinityIDDirect():boolean {
    this.setSessionId();
    if(this.selectedAffinityID === "46"){
      return false;
    } else if((this.selectedAffinityID == "42") && (this.routePaths.indexOf(this.currentPath) == -1)){
      return true;
    } else {
      return false;
    }


    /*
     *This will show save and return button when the affinity type is AARP or Direct and the currnt page is not one of about me, thank you
     */

    // if((selectedAffinityID == "42" || selectedAffinityID === "46") && (this.routePaths.indexOf(this.currentPath) == -1)){
    //   return true;
    // } else {
    //   return false;
    // }

  }

  //EVENTS
  goToStage(selectedStage: StageModel) {

    if (!this.progressService.checkStageAvailability(selectedStage)) return;

    var selectedStageIndex = this.progressService.getSelectedStageIndex(selectedStage);
    this.stagesArray[selectedStageIndex].isactive = true;
    selectedStage.isactive = true;

    var navigateTo: string = "";

    this._router.navigateByUrl("/sales/auto/" + this.stagesArray[selectedStageIndex].componentPath);
    this.progressService.currentStep = selectedStageIndex;
    this.stagesArray[selectedStageIndex].iscompleted = false;

    for (var i = selectedStageIndex + 1; i < this.stagesArray.length; i++) {
      this.stagesArray[i].iscompleted = false;
      this.stagesArray[i].isactive = false;
    }

    if (selectedStage.stepData) {
      this.progressService.passDataToStepForm(selectedStage.stepData);
    }
    this.toggleMenu();
  }

}

