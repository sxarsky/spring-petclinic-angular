/*
 *
 *  * Copyright 2016-2017 the original author or authors.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

/* tslint:disable:no-unused-variable */

/**
 * @author Vitaliy Fedoriv
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

import {VetListComponent} from './vet-list.component';
import {FormsModule} from '@angular/forms';
import {VetService} from '../vet.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ActivatedRouteStub, RouterStub} from '../../testing/router-stubs';
import {Vet} from '../vet';
import {Observable, of} from 'rxjs';

const VETS_FIXTURE: Vet[] = [
  {id: 1, firstName: 'James', lastName: 'Carter', specialties: []},
  {id: 2, firstName: 'Helen', lastName: 'Leary', specialties: [{id: 1, name: 'radiology'}]},
  {id: 3, firstName: 'Linda', lastName: 'Douglas', specialties: [{id: 3, name: 'dentistry'}, {id: 2, name: 'surgery'}]}
] as Vet[];

class VetServiceStub {
  getVets(): Observable<Vet[]> {
    return of(VETS_FIXTURE);
  }
}

describe('VetListComponent', () => {
  let component: VetListComponent;
  let fixture: ComponentFixture<VetListComponent>;
  let vetService: VetService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VetListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {provide: VetService, useClass: VetServiceStub},
        {provide: Router, useClass: RouterStub},
        {provide: ActivatedRoute, useClass: ActivatedRouteStub}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VetListComponent);
    component = fixture.componentInstance;
    vetService = fixture.debugElement.injector.get(VetService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function specialtiesCell(lastName: string): HTMLTableCellElement {
    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('#vets tbody tr')
    ) as HTMLTableRowElement[];
    const row = rows.find(current => current.cells[0].textContent.includes(lastName));
    expect(row).toBeTruthy();
    return row.cells[1];
  }

  it('shows the "No specialties" placeholder for a vet with no specialties', () => {
    fixture.detectChanges();

    const cell = specialtiesCell('Carter');
    const placeholder = cell.querySelector('span.text-muted');

    expect(placeholder).toBeTruthy();
    expect(placeholder.textContent.trim()).toBe('No specialties');
  });

  it('does not show the placeholder for a vet that has specialties', () => {
    fixture.detectChanges();

    const cell = specialtiesCell('Douglas');

    expect(cell.querySelector('span.text-muted')).toBeNull();
    expect(cell.textContent).not.toContain('No specialties');
  });

  it('renders every specialty of a vet inline in a single cell', () => {
    fixture.detectChanges();

    const cell = specialtiesCell('Douglas');
    const inlineSpecialties = Array.from(
      cell.querySelectorAll('div.d-inline')
    ) as HTMLElement[];

    expect(inlineSpecialties.length).toBe(2);
    expect(inlineSpecialties.map(element => element.textContent.trim()))
      .toEqual(['dentistry', 'surgery']);
  });
});
