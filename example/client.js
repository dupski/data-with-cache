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
System.register("backends/index", ["backends/InMemoryCache"], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_3(exports);
    }
    return {
        setters: [
            function (InMemoryCache_1_1) {
                exportStar_1(InMemoryCache_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("DataWithCache", [], function (exports_4, context_4) {
    "use strict";
    var DataWithCache;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
            DataWithCache = class DataWithCache {
                constructor(params) {
                    this.params = params;
                }
                getData() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return this.params.getData();
                    });
                }
            };
            exports_4("DataWithCache", DataWithCache);
        }
    };
});
System.register("index", ["backends/index", "DataWithCache"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    function exportStar_2(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_5(exports);
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
System.register("example/api", [], function (exports_6, context_6) {
    "use strict";
    var API_PARAMS, API, currentOffset, DATA;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            exports_6("API_PARAMS", API_PARAMS = {
                apiResponseTime: 1000,
                throwError: false,
            });
            exports_6("API", API = {
                getSeminarAttendees(seminarId) {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            if (API_PARAMS.throwError) {
                                reject(new Error('Got an error from the API :( ...'));
                            }
                            else {
                                resolve(DATA.slice(currentOffset, currentOffset + 10));
                                if (currentOffset >= 90) {
                                    currentOffset = 0;
                                }
                                else {
                                    currentOffset++;
                                }
                            }
                        }, API_PARAMS.apiResponseTime);
                    });
                },
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
System.register("example/ui", [], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    function getUIHandles() {
        return {
            strategy: document.getElementById('strategy'),
            apiTimeout: document.getElementById('apiTimeout'),
            cacheExpires: document.getElementById('cacheExpires'),
            apiResponseTime: document.getElementById('apiResponseTime'),
            apiError: document.getElementById('apiError'),
            goButton: document.getElementById('goButton'),
        };
    }
    exports_7("getUIHandles", getUIHandles);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("example/client", ["index", "example/api", "example/ui"], function (exports_8, context_8) {
    "use strict";
    var index_2, api_1, ui_1, ui, cache;
    var __moduleName = context_8 && context_8.id;
    function getSeminarAttendees(seminarId) {
        return new index_2.DataWithCache({
            strategy: ui.strategy.value,
            cache,
            objectType: 'seminarAttendees',
            objectId: String(seminarId),
            getData: () => api_1.API.getSeminarAttendees(seminarId),
        });
    }
    return {
        setters: [
            function (index_2_1) {
                index_2 = index_2_1;
            },
            function (api_1_1) {
                api_1 = api_1_1;
            },
            function (ui_1_1) {
                ui_1 = ui_1_1;
            }
        ],
        execute: function () {
            ui = ui_1.getUIHandles();
            cache = new index_2.InMemoryCache();
            ui.goButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
                console.log('Requesting data using strategy:', ui.strategy.value);
                const data = getSeminarAttendees(123);
                const result = yield data.getData();
                console.log('result', result);
            });
        }
    };
});
