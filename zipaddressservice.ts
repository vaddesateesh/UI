import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import  { ZipAddressModel } from './zipaddress.model';
import {env} from "../../../environments/environment-wrapper";
import Env = jasmine.Env;

@Injectable()
export class ZipAddressService {
  constructor(private http:Http,){
  }

  /**
   * get address object and return the http get response
   */
  getAddressService(UserZipCode) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let body = JSON.stringify(UserZipCode);
    let options = new RequestOptions({ search: new URLSearchParams(body) });


    return this.http.get(env.GET_ADDRESS_BY_ZIPCODE+UserZipCode)
      .map(this.extractData)
      .catch(this.handleError);
  }

  /**
   * Extract the response object
   */
  public extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }


  /**
   * Handle error.
   */
  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
