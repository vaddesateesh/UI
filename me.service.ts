import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import {AboutMe} from './about-me.model';
import {SessionService} from '../../../services/webstorage/session.service';
import {ServiceUtils} from "../../common/utils/service-utils";
import {HttpInterceptor} from '../../../services/http-interceptor/http-interceptor';
import {env} from "../../../../environments/environment-wrapper";


@Injectable()
export class AboutMeService {
  constructor(private http:HttpInterceptor,
              private sessionService:SessionService){
    }

    public static callToOrchSuccess:boolean = false;
    public static callToOrch:boolean = false;


    saveModelToOrch(aboutMe: AboutMe){
        AboutMeService.callToOrch = true;

    //console.log("saving to org and about me is ");
    //console.log(aboutMe);

      aboutMe.qcn = this.sessionService.getSession('QCN');
      aboutMe.guid = this.sessionService.getSession('GUID');
        this.http.post(env.ABOUT_ME.SAVE, aboutMe).subscribe(
            response => {
                console.log(response);
                AboutMeService.callToOrchSuccess = true;
            }
        );
    }
  getPageLoadData(){
    let guid= this.sessionService.getSession('GUID');
    console.log("GUID Value used i s "+guid);
    console.log("GUID Value used i s "+env.ABOUT_ME.REACCESS);
    let headers = new Headers({ 'Accept': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.get(env.ABOUT_ME.REACCESS+"?guid="+guid, options).map(response=> { return response.json()}).catch(ServiceUtils.handleError);
  }
}
