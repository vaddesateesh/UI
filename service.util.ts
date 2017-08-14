import {Response} from "@angular/http";
import {Observable} from "rxjs";

export class ServiceUtils {

  public static extractData(res: Response) {
    let body = res.json();
    return body;
  }

  public static handleError(error: Response | any) {

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
