import {Injectable, Input}     from '@angular/core';
import {Response, URLSearchParams} from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Resolve, ActivatedRouteSnapshot} from "@angular/router";
import { SessionService } from '../webstorage/session.service';
import {RulesService} from "./rules.service";
import {Rules} from "./rules-about-me.model";



/*
* Resolver will get data from rules service before page load
* */
@Injectable()
export class RulesResolve implements Resolve<any>{

   rules:Rules;
   params:URLSearchParams;
   constructor(private rulesService:RulesService){}

//return this.rulesService.getUIRules(this.searchParams(route.url[0].path)).map(
  resolve(route: ActivatedRouteSnapshot) {
    return this.rulesService.getUIRules(this.searchParams(route.url[0].path)).map(
         res=> {
         return  this.rules = res.data.rules;
         }
       ).first().catch(this.handleError);
  }

 /*Exception handler */
  private handleError(error: Response | any): Observable<any> {
    return Observable.throw(error);
  }

   /* Constructing request to the service */
  private searchParams(path:string) {
    this.params = new URLSearchParams();
    let storage:SessionService = new SessionService();
    let state:string = storage.getSession('state_short_name') ? storage.getSession('state_short_name') : 'CW';
    let businessID = storage.getSession('AffinityID')? storage.getSession('AffinityID') : '46';
    let zip:string = storage.getSession('zipCode');
    let county:string = storage.getSession('county');
    let pageMap:Object = {
      'about-me': 'aboutme_info',
      'drivers': 'driver_Rules',
      'payment': 'aboutme_info'
    };

    this.params.set('pageID', pageMap[path]);
    this.params.set('state', state);
    this.params.set('lob', 'Auto');
    this.params.set('businessUnit', businessID);

    if (zip) {
      this.params.set("zipCode", zip);
    }

    if (county) {
      this.params.set("county", county);
    }

    return this.params;
  }
}
