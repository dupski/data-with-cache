# data-with-cache Changelog

## 1.2.0

* Added `IndexedDBCache` backend
* Added API documentation and examples

## 1.1.2

* Fix npm github link

## 1.1.1

* Added `onRefreshing()` and `onRefreshed()` events.
* Updated demo with better `cache_first` debug messages.
* Demo UI now updates when data is refreshed.

## 1.1.0

* Added `cache_first` strategy implementation
* Added `cacheTimeout` for cache functions

## 1.0.1

* Errors when calling `cache.set()` no longer prevent data from being returned
* Strategies should only throw their own errors. Errors from API and Cache should just be logged.

## 1.0.0

* Initial release with `api_first` strategy and demo tool
