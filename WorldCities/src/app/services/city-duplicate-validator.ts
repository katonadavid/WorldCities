import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { AsyncValidator, AbstractControl, ValidationErrors } from "@angular/forms";
import { Observable, map, catchError, of } from "rxjs";
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CityDuplicateValidator implements AsyncValidator {
  constructor(private http: HttpClient) {}

  validate(
    form: AbstractControl
  ): Observable<ValidationErrors | null> {
    const url = environment.baseUrl + 'api/Cities/';
    return this.http.post<boolean>(url + 'Validate', form.value).pipe(
        map(isDuplicate => {
            console.log(isDuplicate);
            setTimeout(() => {
                console.log(form.valid);
                
            }, 2000);
            return isDuplicate ? { uniqueCity: true } : null
        }),
        catchError(() => of(null))
    );
  }
}