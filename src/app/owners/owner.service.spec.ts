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

    it('should return an owner page from the v2 endpoint', () => {
        const expectedPage: OwnerPage = {
            content: expectedOwners,
            page: 0,
            size: 5,
            totalElements: 10,
            totalPages: 2,
        };

        ownerService
            .getOwnersPage()
            .subscribe({
                next: (page) => {
                    expect(page.content, 'should return expected owners').toEqual(expectedOwners);
                    expect(page.content.length, 'page holds one page of owners').toEqual(2);
                    expect(page.content[0].id, 'first owner id').toEqual(1);
                    expect(page.content[0].firstName, 'first owner firstName').toEqual('A');
                    expect(page.content[2], 'no item past the last index').toBeUndefined();
                    expect(page.page, 'zero-based page index').toEqual(0);
                    expect(page.size, 'page size').toEqual(5);
                    expect(page.totalElements, 'should return total element count').toEqual(10);
                    expect(page.totalPages, 'should return total page count').toEqual(2);
                },
                error: (error) => expect.fail(`Unexpected error: ${error}`),
            });

        const req = httpTestingController.expectOne(environment.REST_API_URL + 'v2/owners');
        expect(req.request.method).toEqual('GET');

        req.flush(expectedPage);
    });

    it('should pass lastName as a query param to the v2 endpoint', () => {
        const filtered = [expectedOwners[0]];
        const expectedPage: OwnerPage = {
            content: filtered,
            page: 0,
            size: 5,
            totalElements: 1,
            totalPages: 1,
        };

        ownerService
            .getOwnersPage('Davis')
            .subscribe({
                next: (page) => {
                    expect(page.content, 'should return the filtered owners').toEqual(filtered);
                    expect(page.content.length, 'filtered page holds one owner').toEqual(1);
                    expect(page.content[0].id, 'filtered owner id').toEqual(1);
                    expect(page.content[1], 'no item past the last index').toBeUndefined();
                    expect(page.totalElements, 'should return the filtered total').toEqual(1);
                    expect(page.totalElements, 'totalElements matches content length')
                        .toEqual(page.content.length);
                    expect(page.totalPages, 'a single page of results').toEqual(1);
                },
                error: (error) => expect.fail(`Unexpected error: ${error}`),
            });

        const req = httpTestingController.expectOne(
            (request) => request.url === environment.REST_API_URL + 'v2/owners'
                && request.params.get('lastName') === 'Davis'
        );
        expect(req.request.method).toEqual('GET');

        req.flush(expectedPage);
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
});
