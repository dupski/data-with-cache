# data-with-cache

I couldn't seem to find a good backend-agnostic library that implements standard
caching strategies for JS applications, so I've made one :)

## Overview

Implementing data caching in your JavaScript application can make it far more
responsive for users, and also more resilient against a poor network
connection.

The goal of this library is allow you to implement caching for application data,
without having to add lots of specific caching logic to your application.

Implementing caching should be as simple as:

```ts
function getCompany(companyId: number) {
    const data = new DataWithCache<Company>({
        strategy: 'cache_first',
        cache: appCache,
        objectType: 'company',
        objectId: String(companyId),
        cacheExpires: 60000,  // 1 minute
        getData: () => api.getCompany(companyId)
    });
    return data;
}

const company = await getCompany(123).getDate();
```

## Currently Included Strategies
or when displaying up-to-date information is critical,
but you want your app to keep working offline or with an unreliable / slow network

### Cache First

  - Return the data from the cache (if present)
  - If there is no matching data in the cache, try the API
  - If the API call is successful, return the data and add it to the cache
  - If the cached data is older than `cacheExpires` ms, contact the API
    asynchronously and get the most up-to-date data

This strategy is best if you want to ensure your UI is rendered as quickly as possible, and
you are OK with your users occasionally seeing slightly out-of-date information.

With this strategy, you can still update your UI as soon as the updated information is
received from your API, via the `onRefreshed()` event handler.

# Examples

// TODO

# License

MIT