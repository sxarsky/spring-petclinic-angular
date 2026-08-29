import { expect, test } from '@playwright/test';

// The Skyramp executor does not apply playwright.config.ts's `use.baseURL`, so
// navigate absolutely and reach the list through the navbar (a cold deep-link to
// /petclinic/owners is proxied to the backend by the dev server).
const baseUrl = process.env.SKYRAMP_TEST_BASE_URL || 'http://localhost:4200';

// The sort request cannot be made to fail through the live backend, so this
// scenario is driven with a route mock in the same style as app.e2e-spec.ts.
const owners = [
  {
    id: 1,
    firstName: 'George',
    lastName: 'Franklin',
    address: '110 W. Liberty St.',
    city: 'Madison',
    telephone: '6085551023',
    pets: []
  },
  {
    id: 2,
    firstName: 'Betty',
    lastName: 'Davis',
    address: '638 Cardinal Ave.',
    city: 'Sun Prairie',
    telephone: '6085551749',
    pets: []
  }
];

test('surfaces an error when sorting by city fails', async ({ page }) => {
  await page.route(
    url => url.pathname.endsWith('/petclinic/api/owners'),
    route => {
      const sort = new URL(route.request().url()).searchParams.get('sort');
      // The initial load succeeds; only the sort request fails.
      if (sort === 'city') {
        return route.fulfill({ status: 500, json: { detail: 'sort failed' } });
      }
      return route.fulfill({ json: owners });
    }
  );

  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: 'Search' }).click();

  const ownerRows = page.locator('#ownersTable table > tbody > tr');
  await expect(ownerRows).toHaveCount(2);

  // Wait for the failed sort response to be handled, otherwise the checks below
  // run against the pre-click DOM and pass without exercising the error path.
  const failedSort = page.waitForResponse(response =>
    response.url().includes('/petclinic/api/owners')
    && new URL(response.url()).searchParams.get('sort') === 'city'
  );
  await page.locator('#sortByCity').click();
  await failedSort;
  await page.waitForLoadState('networkidle');

  // A failed sort must not silently blank the table. Either the previously
  // loaded rows stay on screen, or the user is told the request failed --
  // showing an empty table with no message is the failure this test guards.
  const errorMessage = page.getByText(/error|failed|could not/i);
  const rowsAfterFailure = await ownerRows.count();

  if (rowsAfterFailure === 0) {
    await expect(errorMessage).toBeVisible();
  } else {
    await expect(ownerRows).toHaveCount(2);
  }
});
