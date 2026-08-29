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

    it('should surface the API per-field validation message on a 400', () => {
        const owner = {
            id: 1,
            firstName: 'George',
            lastName: 'Franklin',
            address: '110 W. Liberty St.',
            city: 'Madison',
            telephone: 'abc',
            pets: []
        } as Owner;

        // Shape captured from the live API: PUT /petclinic/api/owners/1 with an
        // invalid telephone returns application/problem+json with per-field entries.
        const problem = {
            detail: 'The request contains invalid or missing parameters',
            instance: '/petclinic/api/owners/1',
            status: 400,
            title: 'MethodArgumentNotValidException',
            timestamp: '2026-08-29T05:04:56.350255085Z',
            validationErrors: [
                {
                    message: 'Field \'telephone\' must match "^[0-9]*$" (rejected value: abc)',
                    field: 'telephone',
                    defaultMessage: 'must match "^[0-9]*$"',
                    rejectedValue: 'abc',
                },
            ],
        };

        let surfaced: string | undefined;
        let succeeded = false;
        ownerService.updateOwner('1', owner).subscribe({
            next: () => (succeeded = true),
            error: (error) => (surfaced = error),
        });

        const req = httpTestingController.expectOne({
            method: 'PUT',
            url: ownerService.entityUrl + '/1',
        });
        req.flush(problem, {status: 400, statusText: 'Bad Request'});

        expect(succeeded, 'should have failed with a 400 error').toBe(false);
        expect(surfaced).toEqual(
            'Field \'telephone\' must match "^[0-9]*$" (rejected value: abc)'
        );
    });

    it('should fall back to the problem detail when no field errors are present', () => {
        const problem = {
            detail: 'The requested resource could not be processed due to a data constraint violation',
            status: 404,
            validationErrors: [],
        };

        let surfaced: string | undefined;
        let succeeded = false;
        ownerService.getOwnerById(9999).subscribe({
            next: () => (succeeded = true),
            error: (error) => (surfaced = error),
        });

        const req = httpTestingController.expectOne({
            method: 'GET',
            url: ownerService.entityUrl + '/9999',
        });
        req.flush(problem, {status: 404, statusText: 'Not Found'});

        expect(succeeded, 'should have failed with a 404 error').toBe(false);
        expect(surfaced).toEqual(
            'The requested resource could not be processed due to a data constraint violation'
        );
    });
});
