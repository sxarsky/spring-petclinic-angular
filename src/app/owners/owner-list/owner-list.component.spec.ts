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
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { OwnerListComponent } from './owner-list.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { OwnerService } from '../owner.service';
import { Owner } from '../owner';
import { Observable, of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PartsModule } from '../../parts/parts.module';
import { ActivatedRouteStub } from '../../testing/router-stubs';
import { OwnerDetailComponent } from '../owner-detail/owner-detail.component';
import { OwnersModule } from '../owners.module';
import { DummyComponent } from '../../testing/dummy.component';
import { OwnerAddComponent } from '../owner-add/owner-add.component';
import { OwnerEditComponent } from '../owner-edit/owner-edit.component';
type Spy = Mock;


class OwnerServiceStub {
    getOwners(): Observable<Owner[]> {
        return of();
    }

    searchOwners(lastName: string): Observable<Owner[]> {
        return of([]);
    }
}

describe('OwnerListComponent', () => {

    let component: OwnerListComponent;
    let fixture: ComponentFixture<OwnerListComponent>;
    let ownerService = new OwnerServiceStub();
    let spy: Spy;
    let de: DebugElement;
    let el: HTMLElement;


    const testOwner: Owner = {
        id: 1,
        firstName: 'George',
        lastName: 'Franklin',
        address: '110 W. Liberty St.',
        city: 'Madison',
        telephone: '6085551023',
        pets: null
    };
    let testOwners: Owner[];

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DummyComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [CommonModule, FormsModule, PartsModule, OwnersModule],
            providers: [
                provideRouter([{ path: 'owners', component: OwnerListComponent },
                    { path: 'owners/add', component: OwnerAddComponent },
                    { path: 'owners/:id', component: OwnerDetailComponent },
                    { path: 'owners/:id/edit', component: OwnerEditComponent }
                ]),
                { provide: OwnerService, useValue: ownerService },
                { provide: ActivatedRoute, useClass: ActivatedRouteStub }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        testOwners = [{
                id: 1,
                firstName: 'George',
                lastName: 'Franklin',
                address: '110 W. Liberty St.',
                city: 'Madison',
                telephone: '6085551023',
                pets: [{
                        id: 1,
                        name: 'Leo',
                        birthDate: '2010-09-07',
                        type: { id: 1, name: 'cat' },
                        ownerId: null,
                        owner: null,
                        visits: null
                    }]
            }];

        fixture = TestBed.createComponent(OwnerListComponent);
        component = fixture.componentInstance;
        ownerService = fixture.debugElement.injector.get(OwnerService);
        spy = vi.spyOn(ownerService, 'getOwners').mockReturnValue(of(testOwners));

    });

    it('should create OwnerListComponent', () => {
        expect(component).toBeTruthy();
    });

    it('should call ngOnInit() method', () => {
        fixture.detectChanges();
        expect(vi.mocked(spy).mock.calls.length > 0, 'getOwners called').toBe(true);
    });


    it(' should show full name after getOwners observable (async) ', waitForAsync(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            fixture.detectChanges(); // update view with name
            de = fixture.debugElement.query(By.css('.ownerFullName'));
            el = de.nativeElement;
            expect(el.textContent).toBe((testOwner.firstName.toString() + ' ' + testOwner.lastName.toString()));
        });
    }));

    it('should show the empty-search alert and hide the table when no owner matches', () => {
        // The backend returns 404 for a no-match lastName search
        // (OwnerRestControllerV1.listOwners -> HttpStatus.NOT_FOUND when the result set is empty),
        // and HttpErrorHandler.handleError re-throws, so searchByLastName's error
        // callback sets owners = null and the *ngIf="!owners" alert renders.
        vi.spyOn(ownerService, 'searchOwners').mockReturnValue(throwError(() => 'not found'));

        fixture.detectChanges();
        component.lastName = 'Zzzznotanowner';
        component.searchByLastName('Zzzznotanowner');
        fixture.detectChanges();

        const alert = fixture.debugElement.query(By.css('.alert.alert-info'));
        expect(alert).toBeTruthy();
        expect(alert.nativeElement.textContent).toContain('No owners found with a last name starting with');
        expect(alert.nativeElement.textContent).toContain('Zzzznotanowner');

        expect(fixture.debugElement.query(By.css('#ownersTable'))).toBeNull();
    });

});
