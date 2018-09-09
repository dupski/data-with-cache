# data-with-cache

Implementing data caching in JS applications can make them more
responsive for users, and also more resilient against a poor network
connection or API problems.

The goal of this library is to provide a configurable wrapper for API
calls that provides caching logic, to save you writing this yourself :)

Example below, and check out the
[demo page](http://russellbriggs.co/data-with-cache/demo/).

```ts
function getCompany(companyId: number) {
    return new DataWithCache<Company>({
        strategy: 'cache_first',
        cache: appCache,
        objectType: 'company',
        objectId: String(companyId),
        cacheExpires: 60000,  // 1 minute
        getData: () => api.getCompany(companyId)
    });
}

const company = await getCompany(123).getData();
```

## Currently Included Strategies

### API First

  - Try the API first and wait until `apiTimeout`, or until an error occurs
  - Return API data if successful, and add it to the cache
  - If API throws an error or times out, then return the data from the cache (if present)
  - If no matching data in the cache then throw an error

This strategy is good for when displaying up-to-date information is critical,
but you want your app to keep working offline or with an unreliable / slow network

### Cache First - (stale-while-revalidate)

  - Return the data from the cache first (if present)
  - If there is no matching data in the cache, try the API
  - If the API call is successful, return the data and add it to the cache
  - If the cached data is older than `cacheExpires` ms, contact the API
    asynchronously and get the most up-to-date data

This strategy is best if you want to ensure your UI is rendered as quickly as possible, and
you are OK with your users occasionally seeing slightly out-of-date information.

With this strategy, you can still update your UI as soon as the updated information is
received from your API, via the `onRefreshed()` event handler.

## Supported Backends

* [In Memory](https://github.com/dupski/data-with-cache/blob/master/src/backends/InMemoryCache.ts)
* [IndexedDB](https://github.com/dupski/data-with-cache/blob/master/src/backends/IndexedDBCache.ts)
* Any cache that can be accessed via the
  [ICacheBacked interface](https://github.com/dupski/data-with-cache/blob/master/src/types.ts)

# Recent Changes

See the [CHANGELOG](https://github.com/dupski/data-with-cache/blob/master/CHANGELOG.md)

# Examples

## API First

In the example below, we create a utility function that can be called from anywhere
in our application to fetch data. Behind the scenes it will automatically return the data from
cache if the API does not respond within `apiTimeout` milliseconds or if the API
responds with an error.

```ts
import { DataWithCache, IndexdDBCache } from 'data-with-cache';
import * as api from './api';

const cache = new IndexdDBCache('app_cache');

export function getSeminarAttendees(seminarId: number) {
    return new DataWithCache<api.IAttendee[]>({
        strategy: 'api_first',
        cache,
        objectType: 'seminarAttendees',
        objectId: String(seminarId),
        apiTimeout: 5000,
        getData: () => api.getSeminarAttendees(seminarId)
    });
}

// Somwehere else in your application, you can get the data like this:

(async () => {

    const seminarId = 123;
    const attendees = await getSeminarAttendees(seminarId).getData();

    console.log('Attendees:', attendees);

})();
```

## Cache First

In the example below, we create a utility function that can be called from anywhere
in our application to fetch data. If there is matching data in the cache, it will
be returned immediately and displayed to the user.

If the cached data is older than `cacheExpires` milliseconds then DataWithCache will
fetch the most up-to-date data asynchronously. When this happens, the
`onRefreshing()` callback will be called, which you can use to show a "refreshing"
spinner to the user to indicate the displayed data may be updated shortly.

When the refresh is completed the `onRefreshed()` callback will be called with the
most recent data, which is then displayed in the UI.

```ts
import { DataWithCache, IndexdDBCache } from 'data-with-cache';
import * as api from './api';

const cache = new IndexdDBCache('app_cache');

export function getSeminarAttendees(seminarId: number) {
    return new DataWithCache<api.IAttendee[]>({
        strategy: 'cache_first',
        cache,
        objectType: 'seminarAttendees',
        objectId: String(seminarId),
        cacheExpires: 300000,  // 5 minutes
        getData: () => api.getSeminarAttendees(seminarId)
    });
}

// Somwehere else in your application, you can get the data like this:

(async () => {

    const seminarId = 123;
    const attendeesQuery = getSeminarAttendees(seminarId);

    // Register event handlers so we can update our UI if data
    // is being refreshed asynchronously.
    attendeesQuery.onRefreshing = () => {
        ui.showRefreshingIndicator(true);
    }
    attendeesQuery.onRefreshed = (data: api.IAttendees[]) => {
        ui.showRefreshingIndicator(false);
        ui.showAttendeeData(data);
    }

    // getData() will return immediately if there is a cache match
    attendeesData = await attendeesQuery.getData();
    ui.showAttendeeData(attendeesData);

})();
```

# API

## `DataWithCache` parameters

```ts
const dataWithCache = new DataWithCache({ ...parameters });
```

Required Parameters:

* **`strategy:`** - either `api_first` or `cache_first`
* **`cache:`** - a JavaScript object that implements the 
  [ICacheBacked interface](https://github.com/dupski/data-with-cache/blob/master/src/types.ts)
* **`objectType:`** - a string representing the type of data you are caching (e.g. `company` or `region`)
* **`objectId:`** - a unique ID for the data being cached. Used in combination with `objectType` to query the cache
* **`getData:`** - a JavaScript `function` that returns a `Promise` that either resolves with the
   required data from your data source, or rejects with an error.

Optional Parameters:

* **`apiTimeout:`** - Time (in milliseconds) to wait for the `getData()` function to resolve. Default is 5 seconds.
* **`cacheTimeout:`** - Time (in milliseconds) to wait for the cache to return a result. Default is 1 second.
* **`cacheExpires:`** - Max age (in milliseconds) of a cached record, before it needs to be refreshed. If it is
  not set, cache entries never expire. Set to `0` to expire the cache immediately. Default is not set.
* **`onError:`** - A function with the signature `(error: Error, level: 'warning' | 'error') => void` which
  is called with the details of any errors returned by the `getData()` function and the `cache`.
* **`debug:`** - Set to `true` to enable verbose console output from the cache functions.

## `DataWithCache` properties & methods

```ts
const dataWithCache = new DataWithCache({ ...parameters });

// These event handlers need to be set before calling getData()
dataWithCache.onRefreshing = () => {
    console.log('A refresh is happening asynchronously...');
}
dataWithCache.onRefreshed = (data) => {
    console.log('A refresh completed. The new data is:', data);
}

const data = await dataWithCache.getData();  // Returns data (either from cache or API)
```

# Contributing

PRs welcome!

# License

MIT