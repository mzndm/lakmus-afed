import {Component} from '@angular/core';
import {DataService} from "./services/data.service";
import {FormArray, FormBuilder, FormControl} from "@angular/forms";
import {debounceTime, mergeMap, Observable, startWith} from "rxjs";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from "@angular/material-moment-adapter";

export const CUSTOM_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_FORMATS }
  ]
})
export class AppComponent {

  form = this.fb.group({
    encounter: this.fb.group({
      date: ['']
    }),
    conditions: this.fb.array([])
  });

  get conditions() {
    return this.form.get('conditions') as FormArray;
  }

  get encounterDate() {
    return this.form.get('encounter')?.get('date') as FormControl;
  }

  filteredDiagnoses: Observable<any[]>[] = [];
  output: any;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.getFirstDayOfWeek = () => { return 1; }
  }

  addCondition(e: Event): void {
    e.preventDefault();

    const condition = this.fb.group({
      id: [''],
      context: [],
      name: [''],
      code: [],
      notes: [''],
      onset_date: []
    });

    this.conditions.push(condition);
    this.manageCondition(this.conditions.length - 1)
  }

  manageCondition(index: number): void {
    const nameControl = this.conditions.at(index).get('name');

    if (nameControl) {
      this.filteredDiagnoses[index] = nameControl.valueChanges
        .pipe(
          startWith(''),
          debounceTime(500),
          mergeMap(value => this.dataService.getDiagnosesICPC2(value))
        );
    }
  }

  selectOption(condition: any, index: number) {
    const newDiagnose = {
      id: this.dataService.generateGuid(),
      context: {
        identifier: {
          type: {
            coding: [
              {
                system: "eHealth/resources",
                code: "encounter"
              }
            ]
          },
          value: condition.id.toString()
        }
      },
      code: {
        coding: [
          {
            system: "eHealth/ICPC2/condition_codes",
            code: condition.code
          }
        ]
      },
      onset_date: new Date().toISOString()
    }

    this.conditions.at(index).patchValue(newDiagnose);
  }

  generateData(e: Event): void {
    e.preventDefault();
    this.output = this.form.value;

    if (this.output.conditions?.length) {
      this.output.conditions.map((c: any) => delete c.name);
    } else {
      delete this.output.conditions;
    }
  }
}
