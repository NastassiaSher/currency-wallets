import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {interval} from 'rxjs';
import {CurrencyService} from './currency.service';
import {log} from 'util';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'revolut-currency';
  public pockets = [
    {code: 'GBP', amount: 58, symbol: '£'},
    {code: 'EUR', amount: 116, symbol: '€'},
    {code: 'USD', amount: 25, symbol: '$'},
  ];
  public inputTop = '';
  @ViewChild('tInput', {static: false}) input: ElementRef;
  public inputBottom = '';
  public timer;
  public currencyTop = 2;
  public currencyBottom = 1;
  public bottomSymbol;
  public topSymbol;
  public rates = [];
  public topRate;
  public bottomRate;
  public showError = false;

  constructor(public service: CurrencyService) {}

  ngOnInit(): void {
    this.service.selectedRates.subscribe((arr) => {
      this.rates = arr;
      this.calculate();
    });
    this.getRates();
    this.timer = interval(10000);
    this.timer.subscribe((t) => this.getRates());
  }

  public getRates(): void {
    this.service.getData();
  }

// input's functions
  public inputChanged(input): void {
    this.inputTop = input.target.value;
    this.showError = false;
    if (input.target.value === '') {
      this.inputBottom = '';
    } else {
      this.checkInput(this.inputTop);
      if (this.inputTop !== '') {
        this.calculateExchangeResult();
      }
    }
  }

  checkInput(value): void {
    if (!this.validate(value)) {
      this.inputTop = value.slice(0, -1);
      this.input.nativeElement.value = this.inputTop;
    }
  }

  private validate(s) {
    const rgx = /^[0-9]*\.?[0-9]*$/;
    return s.match(rgx);
  }

  // slider
  public onActiveSlideChange(event, flag): void {
    this.showError = false;
    switch (flag) {
      case 'top': {
        this.currencyTop = event.relatedTarget;
        this.calculate();
        break;
      }
      case 'bottom': {
        this.currencyBottom = event.relatedTarget;
        this.calculate();
        break;
      }
    }
  }

  // calculations
  public calculate(): void {
    if (this.rates.length > 0) {
      const fromCurrCode = this.pockets[this.currencyTop].code;
      const fromCurr = this.rates.find(item => item.code === fromCurrCode);
      const fromCurrAmount = fromCurr.rate;
      this.topSymbol = this.pockets[this.currencyTop].symbol;

      const toCurrCode = this.pockets[this.currencyBottom].code;
      const toCurr = this.rates.find(item => item.code === toCurrCode);
      const toCurrAmount = toCurr.rate;
      this.bottomSymbol = this.pockets[this.currencyBottom].symbol;

      // calculate rate for 1 cu
      this.topRate = (1 / fromCurrAmount * toCurrAmount).toFixed(2);
      this.bottomRate = (1 / toCurrAmount * fromCurrAmount).toFixed(2);

      // calculate exchange result
      if (this.inputTop !== '') {
        this.calculateExchangeResult();
      }
    }
  }

  calculateExchangeResult() {
    this.inputBottom = (parseFloat(this.inputTop) * this.topRate).toFixed(2);
    // remove '00' after coma
    const strArr = this.inputBottom.split('.');
    if (strArr[1] === '00') {
      this.inputBottom = strArr[0];
    }
  }

  // exchange btn function
  transferMoney(): void {
    const toPocket = this.pockets[this.currencyBottom].amount;
    const fromPocket = this.pockets[this.currencyTop].amount;
    if (fromPocket <= 0 || fromPocket < parseFloat(this.inputTop)) {
      this.showError = true;
    } else {
      this.pockets[this.currencyTop].amount = fromPocket - parseFloat(this.inputTop);
      this.pockets[this.currencyBottom].amount = toPocket + parseFloat(this.inputBottom);
      this.inputTop = '';
      this.inputBottom = '';
    }
  }

  // clear btn function
  clearInput(): void {
    this.inputTop = '';
    this.inputBottom = '';
    this.showError = false;
  }

}
