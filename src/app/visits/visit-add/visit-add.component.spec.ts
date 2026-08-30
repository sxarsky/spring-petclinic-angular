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
import { FormsModule, NgForm } from '@angular/forms';
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

    /**
     * The API caps visit descriptions at 30 characters (VisitFields.description,
     * maxLength: 30). The tests below lock the Add Visit form to that same limit so
     * a regression back to the old 255 cap fails here rather than at save time.
     */
    async function setDescription(value: string): Promise<NgForm> {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#description');
        input.value = value;
        input.dispatchEvent(new Event('input'));

        const form = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
        form.controls['description'].markAsDirty();

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        return form;
    }

    it('should cap the description input at 30 characters', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#description');

        expect(input.getAttribute('maxlength')).toBe('30');
    });

    it('should reject a 31 character description and accept a 30 character one', async () => {
        let form = await setDescription('y'.repeat(31));
        expect(form.controls['description'].hasError('maxlength')).toBe(true);

        form = await setDescription('y'.repeat(30));
        expect(form.controls['description'].hasError('maxlength')).toBe(false);
    });

    it('should report the 30 character limit in the maxlength feedback', async () => {
        await setDescription('y'.repeat(31));

        const text: string = fixture.nativeElement.textContent;
        expect(text).toContain('Description may be at most 30 characters long');
        expect(text).not.toContain('255');
    });
});
