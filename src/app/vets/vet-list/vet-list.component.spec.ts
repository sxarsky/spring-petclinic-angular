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

const VETS: Vet[] = [
  {id: 1, firstName: 'James', lastName: 'Carter', specialties: []},
  {id: 3, firstName: 'Linda', lastName: 'Douglas', specialties: [{id: 3, name: 'dentistry'}, {id: 2, name: 'surgery'}]}
];

class VetServiceStub {
  getVets(): Observable<Vet[]> {
    return of(VETS);
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

  it('renders all specialties for a vet inline in a single cell', () => {
    const rows = fixture.nativeElement.querySelectorAll('#vets tbody tr');
    const specialtyCell = rows[1].querySelectorAll('td')[1];

    expect(specialtyCell.textContent).toContain('dentistry');
    expect(specialtyCell.textContent).toContain('surgery');
    expect(specialtyCell.querySelectorAll('div.d-inline').length).toBe(2);
    expect(specialtyCell.textContent).not.toContain('No specialties');
  });

  it('shows the No specialties placeholder for a vet with no specialties', () => {
    const rows = fixture.nativeElement.querySelectorAll('#vets tbody tr');
    const specialtyCell = rows[0].querySelectorAll('td')[1];

    expect(specialtyCell.textContent).toContain('No specialties');
    expect(specialtyCell.querySelector('span.text-muted')).toBeTruthy();
    expect(specialtyCell.querySelectorAll('div.d-inline').length).toBe(0);
  });
});
