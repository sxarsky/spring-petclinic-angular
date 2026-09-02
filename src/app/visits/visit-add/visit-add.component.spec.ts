import type { Mock } from 'vitest';
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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { VisitAddComponent } from './visit-add.component';
import { FormsModule, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { VisitService } from '../visit.service';
import { PetService } from '../../pets/pet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub, RouterStub } from '../../testing/router-stubs';
import { Pet } from '../../pets/pet';
import { Observable, of } from 'rxjs';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
type Spy = Mock;
import { OwnerService } from '../../owners/owner.service';

class PetServiceStub {
    addPet(pet: Pet): Observable<Pet> {
        return of();
    }
    getPetById(petId: string): Observable<Pet> {
        return of();
    }
}

class OwnerServiceStub {
}

class VisitServiceStub {
}

describe('VisitAddComponent', () => {
    let component: VisitAddComponent;
    let fixture: ComponentFixture<VisitAddComponent>;
    let petService: PetService;
    let visitService: VisitService;
    let testPet: Pet;
    let spy: Spy;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [VisitAddComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, MatDatepickerModule, MatMomentDateModule],
            providers: [
                { provide: PetService, useClass: PetServiceStub },
                { provide: VisitService, useClass: VisitServiceStub },
                { provide: OwnerService, useClass: OwnerServiceStub },
                { provide: Router, useClass: RouterStub },
                { provide: ActivatedRoute, useClass: ActivatedRouteStub }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VisitAddComponent);
        component = fixture.componentInstance;
        testPet = {
            id: 1,
            name: 'Leo',
            birthDate: '2010-09-07',
            type: { id: 1, name: 'cat' },
            ownerId: 1,
            owner: {
                id: 1,
                firstName: 'George',
                lastName: 'Franklin',
                address: '110 W. Liberty St.',
                city: 'Madison',
                telephone: '6085551023',
                pets: null
            },
            visits: null
        };
        petService = fixture.debugElement.injector.get(PetService);
        visitService = fixture.debugElement.injector.get(VisitService);
        spy = vi.spyOn(petService, 'addPet').mockReturnValue(of(testPet));

        fixture.detectChanges();
    });

    it('should create VisitAddComponent', () => {
        expect(component).toBeTruthy();
    });

    it('should offer a duration input bounded to 5-240 minutes', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const durationInput: HTMLInputElement =
            fixture.nativeElement.querySelector('#durationMinutes');
        expect(durationInput).toBeTruthy();
        expect(durationInput.type).toBe('number');
        expect(durationInput.getAttribute('min')).toBe('5');
        expect(durationInput.getAttribute('max')).toBe('240');
    });

    it('should reject a duration below the 5 minute minimum', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const durationDebugEl = fixture.debugElement.query(By.css('#durationMinutes'));
        const durationInput: HTMLInputElement = durationDebugEl.nativeElement;
        durationInput.value = '4';
        durationInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        await fixture.whenStable();

        const control = durationDebugEl.injector.get(NgControl);
        expect(control.invalid).toBe(true);
        expect(control.hasError('min')).toBe(true);
    });
});
