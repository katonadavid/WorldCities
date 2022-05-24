import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from './../../environments/environment';
import { City } from './city';
import { Country } from '../countries/country';
import { Observable } from 'rxjs';
import { CityDuplicateValidator } from '../services/city-duplicate-validator';
@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.scss'],
})
export class CityEditComponent implements OnInit {
  // the view title
  title?: string;
  // the form model
  form!: FormGroup;
  // the city object to edit or create
  city: City;

  id?: number;

  countries: Country[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cityDuplicateValidator: CityDuplicateValidator
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      lat: new FormControl('', Validators.required),
      lon: new FormControl('', Validators.required),
      countryId: new FormControl('', Validators.required),
    }, null, this.cityDuplicateValidator.validate.bind(this.cityDuplicateValidator));
    this.loadData();
  }

  loadData() {
    this.loadCountries();

    // retrieve the ID from the 'id' parameter
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : 0;

    if (this.id) {
      // fetch the city from the server
      const url = environment.baseUrl + 'api/Cities/' + this.id;
      this.http.get<City>(url).subscribe({
          next: (result) => {
            this.city = result;
            this.title = 'Edit - ' + this.city.name;
            // update the form with the city value
            this.form.patchValue(this.city);
          },
          error: (error) => console.error(error)
        }
      );
    } else {
      this.title = 'Create a new City';
    }
  }

  loadCountries() {
    // fetch all the countries from the server
    const url = environment.baseUrl + 'api/Countries';
    const params = new HttpParams()
      .set('pageIndex', '0')
      .set('pageSize', '9999')
      .set('sortColumn', 'name')
      .set('sortOrder', 'asc');
    this.http.get<any>(url, { params }).subscribe({
      next: (result) => {
        this.countries = result.data;
      },
      error: (error) => console.error(error),
    });
  }

  isDuplicateCity(): Observable<boolean> {
    const city = this.createCityModel();
    const url = environment.baseUrl + 'api/Cities/';
    return this.http.post<boolean>(url + 'Validate', city)
  }

  createCityModel(): City {
    const city = this.id ? this.city : {} as City;
    if (city) {
      city.name = this.form.controls['name'].value;
      city.lat = +this.form.controls['lat'].value;
      city.lon = +this.form.controls['lon'].value;
      city.countryId = +this.form.controls['countryId'].value;
    }
    return city;
  }

  onSubmit() {
    // That's called Type Assertion or casting.

    // These are the same:

    // let square = <Square>{};
    // let square = {} as Square;

    const city = this.id ? this.city : <City>{};
    if (city) {
      city.name = this.form.controls['name'].value;
      city.lat = +this.form.controls['lat'].value;
      city.lon = +this.form.controls['lon'].value;
      city.countryId = +this.form.controls['countryId'].value;

      if (this.id) {
        // EDIT mode
        const url = environment.baseUrl + 'api/Cities/' + city.id;
        this.http.put<City>(url, city).subscribe({
          next: (r) => {
            console.log('City ' + city!.id + ' has been updated.');
            // go back to cities view
            this.router.navigate(['/cities']);
          },
          error: (error) => console.error(error),
        });
      } else {
        // ADD NEW mode
        const url = environment.baseUrl + 'api/Cities';
        this.http.post<City>(url, city).subscribe({
          next: (result) => {
            console.log('City ' + result.id + ' has been created.');
            // go back to cities view
            this.router.navigate(['/cities']);
          },
          error: (error) => console.error(error),
        });
      }
    }
  }
}
