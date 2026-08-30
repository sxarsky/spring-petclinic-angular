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

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
// Other imports
import { TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';

import { HttpErrorHandler } from '../error.service';

import { OwnerService } from './owner.service';
import { Owner } from './owner';
import { OwnerPage } from './owner-page';
import { environment } from '../../environments/environment';

describe('OwnerService', () => {
    let httpTestingController: HttpTestingController;
    let ownerService: OwnerService;
    let expectedOwners: Owner[];
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                OwnerService,
                HttpErrorHandler,
            ],
        });

        httpTestingController = TestBed.inject(HttpTestingController);
        ownerService = TestBed.inject(OwnerService);
        expectedOwners = [
            { id: 1, firstName: 'A' },
            { id: 2, firstName: 'B' },
        ] as Owner[];
        // Inject the http, test controller, and service-under-test
        // as they will be referenced by each test.
    });

    afterEach(() => {
        // After every test, assert that there are no more pending requests.
        httpTestingController.verify();
    });

    it('should return expected owners (called once)', () => {
        ownerService
            .getOwners()
            .subscribe({
                next: (owners) => expect(owners, 'should return expected owners').toEqual(expectedOwners),
                error: (error) => expect.fail(`Unexpected error: ${error}`),
            });

        // OwnerService should have made one request to GET owners from expected URL
        const req = httpTestingController.expectOne(ownerService.entityUrl);
        expect(req.request.method).toEqual('GET');

        // Respond with the mock owners
        req.flush(expectedOwners);
    });

    it('search the owner by id', () => {
        ownerService.getOwnerById(1).subscribe((owners) => {
            expect(owners).toEqual(expectedOwners[0]);
        });
        const id = '1';
        const req = httpTestingController.expectOne(ownerService.entityUrl + '/' + id);
        expect(req.request.method).toEqual('GET');
        req.flush(expectedOwners[0]);
    });

    it('add owner', () => {
        let owner = {
            id: 0,
            firstName: 'Mary',
            lastName: 'John',
            address: '110 W. Church St.',
            city: 'Madison',
            telephone: '6085551023',
            pets: []

        };

        ownerService
            .addOwner(owner)
            .subscribe({
                next: (data) => expect(data, 'should return new owner').toEqual(owner),
                error: (error) => expect.fail(`Unexpected error: ${error}`),
            });

        const req = httpTestingController.expectOne(ownerService.entityUrl);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(owner);

        //expect the server to return the owner after POST
        const expectedResponse = new HttpResponse({
            status: 201,
            statusText: 'Created',
            body: owner,
        });
        req.event(expectedResponse);
    });

    it('updateOwner', () => {
        let owner = {
            id: 1,
            firstName: 'George',
            lastName: 'Franklin',
            address: '110 W. Church St.',
            city: 'Madison',
            telephone: '6085551023',
            pets: []
        };

        ownerService
            .updateOwner(owner.id.toString(), owner)
            .subscribe({
                next: (data) => expect(data, 'updated owner').toEqual(owner),
                error: (error) => expect.fail(`Unexpected error: ${error}`),
            });

        const req = httpTestingController.expectOne(ownerService.entityUrl + '/' + owner.id);
        expect(req.request.method).toEqual('PUT');
        expect(req.request.body).toEqual(owner);
        const expectedResponse = new HttpResponse({
            status: 204,
            statusText: 'No Content',
            body: owner,
        });
        req.event(expectedResponse);
    });

    it('delete Owner', () => {
        console.log('Inside Delete Owner');
        ownerService.deleteOwner('1').subscribe();
        const req = httpTestingController.expectOne(ownerService.entityUrl + '/1');
        expect(req.request.method).toEqual('DELETE');
        expect(req.request.body).toEqual(null);
    });

    it('should report a 404 response', () => {
        ownerService.getOwnerById(1).subscribe({
            next: () => expect.fail('Should have failed with a 404 error'),
            error: (error) => expect(error).toContain('server returned code 404'),
        });

        const req = httpTestingController.expectOne({
            method: 'GET',
            url: ownerService.entityUrl + '/1',
        });
        req.flush('404 error', {status: 404, statusText: 'Not Found'});
    });

    it('getOwnersPage returns the page envelope from v2/owners with no query params', () => {
        const expectedPage: OwnerPage = {
            content: [expectedOwners[0]],
            page: 0,
            size: 5,
            totalElements: 10,
            totalPages: 2,
        };

        ownerService
            .getOwnersPage()
            .subscribe({
                next: (page) => {
                    expect(page.content.length, 'should return the page content').toEqual(1);
                    expect(page.page).toEqual(0);
                    expect(page.size).toEqual(5);
                    expect(page.totalElements).toEqual(10);
                    expect(page.totalPages).toEqual(2);
                },
                error: (error) => expect.fail(`Unexpected error: ${error}`),
            });

        const req = httpTestingController.expectOne(environment.REST_API_URL + 'v2/owners');
        expect(req.request.method).toEqual('GET');
        expect(req.request.params.keys().length, 'should send no query params').toEqual(0);

        req.flush(expectedPage);
    });

    it('getOwnersPage forwards lastName as a query param', () => {
        ownerService.getOwnersPage('Davis').subscribe();

        const req = httpTestingController.expectOne(
            (request) => request.url === environment.REST_API_URL + 'v2/owners'
        );
        expect(req.request.method).toEqual('GET');
        expect(req.request.params.get('lastName')).toEqual('Davis');

        req.flush({content: [], page: 0, size: 5, totalElements: 0, totalPages: 0} as OwnerPage);
    });

    // Documents a real defect: getOwnersPage declares a fallback page via
    // catchError(this.handlerError('getOwnersPage', {content: [], ...})), but
    // HttpErrorHandler.handleError (src/app/error.service.ts:46) ignores its
    // `result` argument and always returns throwError(message). The declared
    // fallback is therefore dead code and the observable errors instead.
    // This test is EXPECTED TO FAIL until handleError honours `result`.
    it('getOwnersPage falls back to an empty page on a server error', () => {
        let emitted: OwnerPage | undefined;
        let errored: unknown;

        ownerService.getOwnersPage().subscribe({
            next: (page) => emitted = page,
            error: (error) => errored = error,
        });

        const req = httpTestingController.expectOne(environment.REST_API_URL + 'v2/owners');
        req.flush('500 error', {status: 500, statusText: 'Server Error'});

        expect(errored, 'getOwnersPage should not surface an error to subscribers').toBeUndefined();
        expect(emitted, 'getOwnersPage should emit its declared empty-page fallback').toEqual({
            content: [], page: 0, size: 0, totalElements: 0, totalPages: 0
        });
    });
});
