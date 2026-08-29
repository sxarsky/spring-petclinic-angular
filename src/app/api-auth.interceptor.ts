import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';

/**
 * The API requires authentication, so every request to it carries the
 * configured credentials.
 */
@Injectable()
export class ApiAuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.includes(environment.REST_API_URL)) {
      return next.handle(req);
    }
    const authorized = req.clone({
      setHeaders: {
        Authorization: 'Basic ' + btoa(`${environment.API_USERNAME}:${environment.API_PASSWORD}`)
      }
    });
    return next.handle(authorized);
  }
}
