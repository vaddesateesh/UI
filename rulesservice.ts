import {Injectable} from "@angular/core";
import {RequestOptions, URLSearchParams, Http, Response} from "@angular/http";
import {Observable} from "rxjs";
import {UrlConstants} from "../../sales/common/constants/url-constants";
import {env} from "../../../environments/environment-wrapper";

/*Rest service to make rules service call*/
@Injectable()
export class RulesService {

  private options = new RequestOptions();
  constructor(private http:Http) {

  }

  /*getting data from rules service*/
  getUIRules(params:URLSearchParams) {

    this.options.search = params;
    return this.http.get(env.UI_RULES_URI, this.options)
      .map(this.extractData).catch(this.handleError);
  }

  getMockUIRules(params?:URLSearchParams){
    return this.http.get(UrlConstants.mockrulesresp)
      .map(this.extractData).catch(this.handleError);
  }

  getMockQuoteUIRules(params?:URLSearchParams){
    return this.http.get(UrlConstants.mockrulesquoteresp)
      .map(this.extractData).catch(this.handleError);
  }

  /* Parsing Json */
  private extractData(res: Response | any) {
    let body = res.json();
    return body;
  }

 /* Exception handler */
  private handleError(error: Response | any) {
    console.error(error);
    return Observable.throw(error);
  }

}
