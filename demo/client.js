var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
System.register("types", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("backends/InMemoryCache", [], function (exports_2, context_2) {
    "use strict";
    var InMemoryCache;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            InMemoryCache = class InMemoryCache {
                constructor() {
                    this.__cache = {};
                }
                get(objectType, objectId) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (objectType in this.__cache
                            && objectId in this.__cache[objectType]) {
                            return this.__cache[objectType][objectId];
                        }
                        return null;
                    });
                }
                set(objectType, objectId, data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!(objectType in this.__cache)) {
                            this.__cache[objectType] = {};
                        }
                        this.__cache[objectType][objectId] = data;
                    });
                }
            };
            exports_2("InMemoryCache", InMemoryCache);
        }
    };
});
System.register("backends/IndexedDBCache", [], function (exports_3, context_3) {
    "use strict";
    var IndexdDBCache;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            IndexdDBCache = class IndexdDBCache {
                constructor(dbName, storeName = 'dataWithCacheStore') {
                    this.dbName = dbName;
                    this.storeName = storeName;
                    this.db = null;
                    const idb = indexedDB.open(dbName, 1);
                    idb.onupgradeneeded = () => {
                        idb.result.createObjectStore(storeName);
                    };
                    idb.onsuccess = () => {
                        this.db = idb.result;
                    };
                }
                get(objectType, objectId) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return new Promise((resolve, reject) => {
                            const tx = this.db.transaction(this.storeName, 'readonly');
                            const store = tx.objectStore(this.storeName);
                            const req = store.get(this.getKey(objectType, objectId));
                            req.onsuccess = () => {
                                resolve(req.result || null);
                            };
                            req.onerror = (err) => {
                                reject(req.error);
                            };
                        });
                    });
                }
                set(objectType, objectId, data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return new Promise((resolve, reject) => {
                            const tx = this.db.transaction(this.storeName, 'readwrite');
                            const store = tx.objectStore(this.storeName);
                            const req = store.put(data, this.getKey(objectType, objectId));
                            req.onsuccess = () => {
                                resolve();
                            };
                            req.onerror = (err) => {
                                reject(req.error);
                            };
                        });
                    });
                }
                getKey(objectType, objectId) {
                    return objectType + '__' + objectId;
                }
            };
            exports_3("IndexdDBCache", IndexdDBCache);
        }
    };
});
System.register("backends/index", ["backends/InMemoryCache", "backends/IndexedDBCache"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_4(exports);
    }
    return {
        setters: [
            function (InMemoryCache_1_1) {
                exportStar_1(InMemoryCache_1_1);
            },
            function (IndexedDBCache_1_1) {
                exportStar_1(IndexedDBCache_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("utils", [], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    function withTimeout(timeout, promise, error) {
        return Promise.race([
            promise,
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(error || new Error(`timed out after ${timeout}ms`));
                }, timeout);
            }),
        ]);
    }
    exports_5("withTimeout", withTimeout);
    function sleep(timeout) {
        return new Promise((resolve) => {
            setTimeout(resolve, timeout);
        });
    }
    exports_5("sleep", sleep);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("DataWithCache", ["utils"], function (exports_6, context_6) {
    "use strict";
    var utils_1, requiredParams, DEFAULT_API_TIMEOUT, DEFAULT_CACHE_TIMEOUT, DataWithCache;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {
            requiredParams = [
                'strategy', 'cache', 'objectType', 'objectId', 'getData',
            ];
            DEFAULT_API_TIMEOUT = 5000;
            DEFAULT_CACHE_TIMEOUT = 1000;
            DataWithCache = class DataWithCache {
                constructor(params) {
                    this.params = params;
                    this.loading = false;
                    requiredParams.forEach((param) => {
                        if (!this.params[param]) {
                            throw new Error(`Required parameter "${param}" is missing.`);
                        }
                    });
                }
                getData() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const p = this.params;
                        if (this.loading) {
                            throw new Error('getData() has already been called on this object.');
                        }
                        this.loading = true;
                        switch (this.params.strategy) {
                            case 'api_first':
                                return this.apiFirst();
                            case 'cache_first':
                                return this.cacheFirst();
                            default:
                                throw new Error(`Unknown strategy "${this.params.strategy}".`);
                        }
                    });
                }
                apiFirst() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const p = this.params;
                        let apiResult = null;
                        this.debug('api_first: making getData() request.');
                        try {
                            apiResult = yield this.callGetData();
                        }
                        catch (e) {
                            this.logError(e, 'warning');
                        }
                        if (apiResult) {
                            this.debug('api_first: getData() succeeded. Adding data to cache and returning it.');
                            this.setCache(apiResult);
                            return apiResult;
                        }
                        else {
                            let cacheResult = null;
                            try {
                                cacheResult = yield this.getFromCache();
                            }
                            catch (e) {
                                this.logError(e, 'error');
                            }
                            if (cacheResult) {
                                this.debug('api_first: getData() failed. Value exists in cache. Returning it.');
                                return cacheResult.value;
                            }
                            else {
                                throw new Error(`getData() failed and no cache match for object "${p.objectType}", id: "${p.objectId}"`);
                            }
                        }
                    });
                }
                cacheFirst() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const p = this.params;
                        let cacheResult = null;
                        this.debug('cache_first: trying to get value from cache.');
                        try {
                            cacheResult = yield this.getFromCache();
                        }
                        catch (e) {
                            this.logError(e, 'warning');
                        }
                        if (cacheResult) {
                            const now = Date.now();
                            if (typeof p.cacheExpires != 'undefined'
                                && (now - cacheResult.timestamp) > p.cacheExpires) {
                                // Refresh cache in a seperate event
                                utils_1.sleep(10)
                                    .then(() => {
                                    this.debug('cache_first: cached value has expired. Calling getData()..');
                                    if (this.onRefreshing) {
                                        this.onRefreshing();
                                    }
                                    return this.callGetData();
                                })
                                    .then((res) => {
                                    if (res) {
                                        this.debug('cache_first: getDate() returned a result. Updating cached value.');
                                        this.setCache(res);
                                        if (this.onRefreshed) {
                                            this.onRefreshed(res);
                                        }
                                    }
                                })
                                    .catch((e) => {
                                    this.logError(e, 'warning');
                                });
                            }
                            this.debug('cache_first: matched cached value. Returning it.');
                            return cacheResult.value;
                        }
                        else {
                            let apiResult = null;
                            this.debug('cache_first: did not match a cached value. Calling getData()...');
                            try {
                                apiResult = yield this.callGetData();
                            }
                            catch (e) {
                                this.logError(e, 'error');
                            }
                            if (apiResult) {
                                this.debug('cache_first: getData() succeeded. Adding data to cache and returning it.');
                                this.setCache(apiResult);
                                return apiResult;
                            }
                            else {
                                throw new Error(`No cache match and getData() failed for object "${p.objectType}", id: "${p.objectId}"`);
                            }
                        }
                    });
                }
                callGetData() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return utils_1.withTimeout(this.params.apiTimeout || DEFAULT_API_TIMEOUT, this.params.getData());
                    });
                }
                getFromCache() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const p = this.params;
                        return utils_1.withTimeout(p.cacheTimeout || DEFAULT_CACHE_TIMEOUT, p.cache.get(p.objectType, p.objectId));
                    });
                }
                setCache(data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            const p = this.params;
                            const cacheValue = {
                                value: data,
                                timestamp: Date.now(),
                            };
                            yield utils_1.withTimeout(p.cacheTimeout || DEFAULT_CACHE_TIMEOUT, p.cache.set(p.objectType, p.objectId, cacheValue));
                        }
                        catch (e) {
                            this.logError(e, 'warning');
                        }
                    });
                }
                logError(error, level) {
                    if (this.params.onError) {
                        this.params.onError(error, level);
                    }
                    if (this.params.debug) {
                        level == 'error'
                            ? console.error(error)
                            : console.warn(error);
                    }
                }
                debug(message) {
                    if (this.params.debug) {
                        console.log('DataWithCache: ' + message
                            + ' (object "' + this.params.objectType
                            + '", id: "' + this.params.objectId + '")');
                    }
                }
            };
            exports_6("DataWithCache", DataWithCache);
        }
    };
});
System.register("index", ["backends/index", "DataWithCache"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    function exportStar_2(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_7(exports);
    }
    return {
        setters: [
            function (index_1_1) {
                exportStar_2(index_1_1);
            },
            function (DataWithCache_1_1) {
                exportStar_2(DataWithCache_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("demo/api", ["utils"], function (exports_8, context_8) {
    "use strict";
    var utils_2, params, currentOffset, DATA;
    var __moduleName = context_8 && context_8.id;
    function getSeminarAttendees(seminarId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield utils_2.sleep(50);
            console.log('API: Request received.');
            yield utils_2.sleep(params.apiResponseTime);
            if (params.throwError) {
                console.log('API: Error reponse.');
                throw new Error('API: Had an error :( ...');
            }
            else {
                const data = DATA.slice(currentOffset, currentOffset + 6);
                if (currentOffset >= 94) {
                    currentOffset = 0;
                }
                else {
                    currentOffset++;
                }
                console.log('API: Response sent.');
                return data;
            }
        });
    }
    exports_8("getSeminarAttendees", getSeminarAttendees);
    return {
        setters: [
            function (utils_2_1) {
                utils_2 = utils_2_1;
            }
        ],
        execute: function () {
            exports_8("params", params = {
                apiResponseTime: 1000,
                throwError: false,
            });
            currentOffset = 0;
            // tslint:disable
            DATA = [
                { attendeeId: 1, name: 'Jack Maddox', city: 'Keswick' }, { attendeeId: 2, name: 'Carl Bolton', city: 'Montague' }, { attendeeId: 3, name: 'Chastity Petty', city: 'Holywell' }, { attendeeId: 4, name: 'Zachary Noel', city: 'Fiumara' }, { attendeeId: 5, name: 'Kay Luna', city: 'Glendon' }, { attendeeId: 6, name: 'Hasad Marshall', city: 'Kollam' }, { attendeeId: 7, name: 'Buffy Young', city: 'Chillán' }, { attendeeId: 8, name: 'Eliana Stephenson', city: 'Schriek' }, { attendeeId: 9, name: 'Brenna Miller', city: 'Bihar Sharif' }, { attendeeId: 10, name: 'Adara Curtis', city: 'Roccanova' },
                { attendeeId: 11, name: 'Felix Powers', city: 'Cheltenham' }, { attendeeId: 12, name: 'Brittany Jones', city: 'Concepción' }, { attendeeId: 13, name: 'Oliver Christian', city: 'GrivegnŽe' }, { attendeeId: 14, name: 'James Pate', city: 'Kelowna' }, { attendeeId: 15, name: 'Hamish Horton', city: 'Milnathort' }, { attendeeId: 16, name: 'Cain Cantu', city: 'Hantes-WihŽries' }, { attendeeId: 17, name: 'Brody Mercado', city: 'Oswestry' }, { attendeeId: 18, name: 'Amy Henry', city: 'Bowling Green' }, { attendeeId: 19, name: 'Barrett Osborn', city: 'Pucón' }, { attendeeId: 20, name: 'Drew Bright', city: 'Hengelo' },
                { attendeeId: 21, name: 'Giacomo Mann', city: 'Montpellier' }, { attendeeId: 22, name: 'Jane Stewart', city: 'Täby' }, { attendeeId: 23, name: 'Jerry Walton', city: 'Falun' }, { attendeeId: 24, name: 'Darius Crawford', city: 'Piegaro' }, { attendeeId: 25, name: 'Robin Hodge', city: 'Iquique' }, { attendeeId: 26, name: 'Chester Battle', city: 'Los Andes' }, { attendeeId: 27, name: 'Evelyn Vinson', city: 'Kallo' }, { attendeeId: 28, name: 'Tallulah Bennett', city: 'Manoppello' }, { attendeeId: 29, name: 'Ariel Meyers', city: 'Almelo' }, { attendeeId: 30, name: 'Adria Todd', city: 'Goulburn' },
                { attendeeId: 31, name: 'Fulton Mitchell', city: 'Río Claro' }, { attendeeId: 32, name: 'Keefe Stewart', city: 'MalŽves-Sainte-Marie-Wastines' }, { attendeeId: 33, name: 'Armando Gonzales', city: 'Exeter' }, { attendeeId: 34, name: 'Lydia Hays', city: 'Winnipeg' }, { attendeeId: 35, name: 'Lenore Craig', city: 'Cumnock' }, { attendeeId: 36, name: 'Lani Levy', city: 'Mold' }, { attendeeId: 37, name: 'Shay Aguirre', city: 'Markkleeberg' }, { attendeeId: 38, name: 'Bradley Mckay', city: 'Develi' }, { attendeeId: 39, name: 'Cody Weeks', city: 'San Venanzo' }, { attendeeId: 40, name: 'Kaye Sheppard', city: 'Shepparton' },
                { attendeeId: 41, name: 'Luke Gardner', city: 'Forchies-la-Marche' }, { attendeeId: 42, name: 'Noelle Wade', city: 'Bilbo' }, { attendeeId: 43, name: 'Dale Wheeler', city: 'Langford' }, { attendeeId: 44, name: 'Karleigh Benton', city: 'Rotello' }, { attendeeId: 45, name: 'Jermaine King', city: 'Salles' }, { attendeeId: 46, name: 'Catherine Browning', city: 'Ville-en-Hesbaye' }, { attendeeId: 47, name: 'Evan Parsons', city: 'Gravelbourg' }, { attendeeId: 48, name: 'Ingrid Sloan', city: 'Palencia' }, { attendeeId: 49, name: 'Lionel Mckay', city: 'Meetkerke' }, { attendeeId: 50, name: 'Perry Franks', city: 'Orangeville' },
                { attendeeId: 51, name: 'Oliver Schroeder', city: 'Dessel' }, { attendeeId: 52, name: 'Sasha Hughes', city: 'Mount Pearl' }, { attendeeId: 53, name: 'Signe Lott', city: 'Hoeilaart' }, { attendeeId: 54, name: 'Byron Shannon', city: 'Los Andes' }, { attendeeId: 55, name: 'Porter Walter', city: 'Bloxham' }, { attendeeId: 56, name: 'Drake Walters', city: 'Gravilias' }, { attendeeId: 57, name: 'Marny Stephens', city: 'Rothes' }, { attendeeId: 58, name: 'Maite Holt', city: 'College' }, { attendeeId: 59, name: 'Giacomo Payne', city: 'Sooke' }, { attendeeId: 60, name: 'Lysandra Hill', city: 'Mondolfo' },
                { attendeeId: 61, name: 'Shad Stuart', city: 'Monte Santa Maria Tiberina' }, { attendeeId: 62, name: 'Jescie Oneal', city: 'Arauco' }, { attendeeId: 63, name: 'Kiara Perez', city: 'Balurghat' }, { attendeeId: 64, name: 'Coby Christensen', city: 'Inverbervie' }, { attendeeId: 65, name: 'Elaine Ayers', city: 'Södertälje' }, { attendeeId: 66, name: 'Madeline Singleton', city: 'Etalle' }, { attendeeId: 67, name: 'Emi Acosta', city: 'Aylmer' }, { attendeeId: 68, name: 'Barbara Whitaker', city: 'GŽrouville' }, { attendeeId: 69, name: 'Kibo Rocha', city: 'Aulnay-sous-Bois' }, { attendeeId: 70, name: 'Ebony Morris', city: 'Hilo' },
                { attendeeId: 71, name: 'Yvette Sheppard', city: 'San Rosendo' }, { attendeeId: 72, name: 'John Duran', city: 'Owen Sound' }, { attendeeId: 73, name: 'Devin Banks', city: 'Rouyn-Noranda' }, { attendeeId: 74, name: 'Baker Hancock', city: 'Reims' }, { attendeeId: 75, name: 'Julie Travis', city: 'Shimoga' }, { attendeeId: 76, name: 'Darius Vance', city: 'Eisenstadt' }, { attendeeId: 77, name: 'Ezekiel Dean', city: 'Vaux-lez-Rosieres' }, { attendeeId: 78, name: 'Ashely Donovan', city: 'South Bend' }, { attendeeId: 79, name: 'Tucker Newman', city: 'La Cruz' }, { attendeeId: 80, name: 'Elaine Key', city: 'Gujranwala' },
                { attendeeId: 81, name: 'Judah Lang', city: 'Heist-op-den-Berg' }, { attendeeId: 82, name: 'Jesse Kline', city: 'Gent' }, { attendeeId: 83, name: 'Gail Calhoun', city: 'Helena' }, { attendeeId: 84, name: 'Allegra Mathews', city: 'Sunshine Coast Regional District' }, { attendeeId: 85, name: 'Mari Joyner', city: 'Valcourt' }, { attendeeId: 86, name: 'Gloria Wolf', city: 'Bonn' }, { attendeeId: 87, name: 'Donovan Harmon', city: 'Richmond' }, { attendeeId: 88, name: 'Ruth Bridges', city: 'Fontaine-Valmont' }, { attendeeId: 89, name: 'Daryl Avery', city: 'Gatineau' }, { attendeeId: 90, name: 'Abbot Nieves', city: 'Moulins' },
                { attendeeId: 91, name: 'Ryder Colon', city: 'Ragogna' }, { attendeeId: 92, name: 'Dylan Cooke', city: 'Missoula' }, { attendeeId: 93, name: 'Kelly Greer', city: 'Gaasbeek' }, { attendeeId: 94, name: 'Isabella Simon', city: 'Amlwch' }, { attendeeId: 95, name: 'Hu Carlson', city: 'Thurso' }, { attendeeId: 96, name: 'Wallace Hayes', city: 'Bornival' }, { attendeeId: 97, name: 'Bertha Lester', city: 'Annapolis County' }, { attendeeId: 98, name: 'Kennan Arnold', city: 'South Portland' }, { attendeeId: 99, name: 'Gillian Barry', city: 'Drancy' }, { attendeeId: 100, name: 'Heidi Sanford', city: 'Indianapolis' }
            ];
        }
    };
});
System.register("demo/ui", [], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    function getUIHandles() {
        return {
            strategy: document.getElementById('strategy'),
            apiTimeout: document.getElementById('apiTimeout'),
            cacheExpires: document.getElementById('cacheExpires'),
            apiResponseTime: document.getElementById('apiResponseTime'),
            apiError: document.getElementById('apiError'),
            goButton: document.getElementById('goButton'),
            status: document.getElementById('status'),
            loader: document.getElementById('loader'),
            dataTable: document.getElementById('dataTable'),
            dataBody: document.getElementById('dataBody'),
            showLoader(show) {
                this.loader.style.display = show ? 'block' : 'none';
            },
            setStatus(status) {
                this.status.innerText = status;
            },
            showResult(result) {
                if (!result) {
                    this.dataTable.style.display = 'none';
                }
                else {
                    while (this.dataBody.firstChild) {
                        this.dataBody.removeChild(this.dataBody.firstChild);
                    }
                    result.forEach((row) => {
                        const tr = this.dataBody.insertRow();
                        tr.insertCell().innerText = String(row.attendeeId);
                        tr.insertCell().innerText = String(row.name);
                        tr.insertCell().innerText = String(row.city);
                    });
                    this.dataTable.style.display = 'table';
                }
            },
        };
    }
    exports_9("getUIHandles", getUIHandles);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("demo/client", ["index", "utils", "demo/api", "demo/ui"], function (exports_10, context_10) {
    "use strict";
    var index_2, utils_3, api, ui_1, ui, cache;
    var __moduleName = context_10 && context_10.id;
    function getSeminarAttendees(seminarId) {
        return new index_2.DataWithCache({
            strategy: ui.strategy.value,
            cache,
            objectType: 'seminarAttendees',
            objectId: String(seminarId),
            cacheExpires: Number(ui.cacheExpires.value),
            apiTimeout: Number(ui.apiTimeout.value),
            getData: () => api.getSeminarAttendees(seminarId),
            debug: true
        });
    }
    return {
        setters: [
            function (index_2_1) {
                index_2 = index_2_1;
            },
            function (utils_3_1) {
                utils_3 = utils_3_1;
            },
            function (api_1) {
                api = api_1;
            },
            function (ui_1_1) {
                ui_1 = ui_1_1;
            }
        ],
        execute: function () {
            ui = ui_1.getUIHandles();
            // const cache = new IndexdDBCache('app_cache');
            cache = new index_2.InMemoryCache();
            ui.goButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
                console.log('Requesting data using strategy:', ui.strategy.value);
                // Configure API
                api.params.apiResponseTime = Number(ui.apiResponseTime.value);
                api.params.throwError = ui.apiError.checked;
                // Configure UI
                ui.showLoader(true);
                ui.showResult(null);
                ui.setStatus('Loading...');
                // Artificial delay so the user can see something has happened in cache_first mode
                yield utils_3.sleep(100);
                // Request data via DataWithCache
                const data = getSeminarAttendees(123);
                // Set up listeners for data refreshes
                data.onRefreshing = () => {
                    ui.setStatus('Loaded. Refreshing...');
                };
                data.onRefreshed = (result) => {
                    ui.setStatus('Loaded.');
                    ui.showResult(result);
                };
                try {
                    const result = yield data.getData();
                    // Success! Update UI
                    ui.showLoader(false);
                    ui.showResult(result);
                    ui.setStatus('Loaded.');
                }
                catch (e) {
                    // Failure. Log error to console
                    console.error(e);
                    ui.showLoader(false);
                    ui.setStatus('Error Returned. See console.');
                }
            });
        }
    };
});
