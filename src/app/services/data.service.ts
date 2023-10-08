import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiBasePath = 'http://localhost:4200/api';

  constructor(private http: HttpClient) { }

  getDiagnosesICPC2(search: string): Observable<any> {
    const options = {
      params: {
        IsPublic: true,
        Search: search
      }
    }

    return this.http.get(`${this.apiBasePath}/Dictionaries/icpc2`, options)
  }

  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
