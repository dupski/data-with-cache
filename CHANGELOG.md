# data-with-cache Changelog

## 1.0.0

* Initial release with `api_first` strategy and demo tool

## 1.0.1

* Errors when calling `cache.set()` no longer prevent data from being returned
* Strategies should only throw their own errors. Errors from API and Cache should just be logged.

## 1.1.0

* Added `cache_first` strategy implementation
* Added `cacheTimeout` for cache functions