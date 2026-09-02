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

class VetServiceStub {
  vets: Vet[] = [];

  getVets(): Observable<Vet[]> {
    return of(this.vets);
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

  it('renders multiple specialties inline and shows "No specialties" when a vet has none', () => {
    const stub = TestBed.inject(VetService) as unknown as VetServiceStub;
    stub.vets = [
      {
        id: 1, firstName: 'Linda', lastName: 'Douglas',
        specialties: [{id: 1, name: 'dentistry'}, {id: 2, name: 'surgery'}]
      },
      {id: 2, firstName: 'James', lastName: 'Carter', specialties: []}
    ];

    const seededFixture = TestBed.createComponent(VetListComponent);
    seededFixture.detectChanges();

    const rows = seededFixture.nativeElement.querySelectorAll('#vets tbody tr');
    expect(rows.length).toBe(2);

    const normalize = (node: Element) => node.textContent.replace(/\s+/g, ' ').trim();

    const multiSpecialtyCell = rows[0].querySelectorAll('td')[1];
    const inlineSpecialties = multiSpecialtyCell.querySelectorAll('div.d-inline');
    expect(multiSpecialtyCell.querySelectorAll('div.d-inline').length).toBe(2);
    expect(normalize(inlineSpecialties[0])).toBe('dentistry');
    expect(normalize(inlineSpecialties[1])).toBe('surgery');
    expect(multiSpecialtyCell.textContent).toContain('dentistry');
    expect(multiSpecialtyCell.textContent).toContain('surgery');
    expect(multiSpecialtyCell.textContent).not.toContain('No specialties');
    expect(normalize(multiSpecialtyCell)).toBe('dentistry surgery');

    const noSpecialtyCell = rows[1].querySelectorAll('td')[1];
    expect(noSpecialtyCell.querySelectorAll('div.d-inline').length).toBe(0);
    expect(noSpecialtyCell.textContent).toContain('No specialties');
    expect(normalize(noSpecialtyCell)).toBe('No specialties');
    expect(noSpecialtyCell.querySelector('span.text-muted')).not.toBeNull();
  });
});
