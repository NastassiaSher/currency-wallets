import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Rate} from './models/rate.model';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class CurrencyService {

  selectedRates: BehaviorSubject<Array<Rate>> = new BehaviorSubject([]);

  constructor(private http: HttpClient) {}

  public getData() {
    this.callGetLatestRates().subscribe(responseData => {
      if (responseData.rates) {
        const rates: Array<Rate> = [
          {code: 'GBP', rate: responseData.rates['GBP']},
          {code: 'EUR', rate: responseData.rates['EUR']},
          {code: 'USD', rate: responseData.rates['USD']}
        ];
        this.selectedRates.next(rates);
      }
    });
  }

  private callGetLatestRates() {
    const urlLatest = 'https://openexchangerates.org/api/latest.json';
    const appId = '6efaf4e2371245f0ae716da15066956c';
    const url = urlLatest + '?app_id=' + appId;
    return this.http.get<any>(url);
  }

}
