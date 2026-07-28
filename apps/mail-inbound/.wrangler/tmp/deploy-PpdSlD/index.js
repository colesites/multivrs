var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/applicationIn.js
var require_applicationIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/applicationIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationInSerializer = void 0;
    exports.ApplicationInSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/applicationOut.js
var require_applicationOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/applicationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationOutSerializer = void 0;
    exports.ApplicationOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          id: self.id,
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/applicationPatch.js
var require_applicationPatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/applicationPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationPatchSerializer = void 0;
    exports.ApplicationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseApplicationOut.js
var require_listResponseApplicationOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseApplicationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseApplicationOutSerializer = void 0;
    var applicationOut_1 = require_applicationOut();
    exports.ListResponseApplicationOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => applicationOut_1.ApplicationOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => applicationOut_1.ApplicationOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/util.js
var require_util = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApiException = void 0;
    var ApiException = class extends Error {
      static {
        __name(this, "ApiException");
      }
      constructor(code, body, headers) {
        super(`HTTP-Code: ${code}
Headers: ${JSON.stringify(headers)}`);
        this.code = code;
        this.body = body;
        this.headers = {};
        headers.forEach((value, name) => {
          this.headers[name] = value;
        });
      }
    };
    exports.ApiException = ApiException;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/request.js
var require_request = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/request.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SvixRequest = exports.HttpMethod = exports.LIB_VERSION = void 0;
    var util_1 = require_util();
    exports.LIB_VERSION = "1.99.1";
    function getUserAgent() {
      var fields = [`svix-libs/${exports.LIB_VERSION}/javascript`];
      if (process !== void 0) {
        if (process.version !== void 0) {
          fields.push(`node/${process.version}`);
        }
        if (process.platform !== void 0 && process.arch !== void 0) {
          fields.push(`${process.platform}/${process.arch}`);
        }
      } else if ((navigator === null || navigator === void 0 ? void 0 : "Cloudflare-Workers") !== void 0) {
        fields.push("Cloudflare-Workers");
      }
      return fields.join(" ");
    }
    __name(getUserAgent, "getUserAgent");
    var HttpMethod;
    (function(HttpMethod2) {
      HttpMethod2["GET"] = "GET";
      HttpMethod2["HEAD"] = "HEAD";
      HttpMethod2["POST"] = "POST";
      HttpMethod2["PUT"] = "PUT";
      HttpMethod2["DELETE"] = "DELETE";
      HttpMethod2["CONNECT"] = "CONNECT";
      HttpMethod2["OPTIONS"] = "OPTIONS";
      HttpMethod2["TRACE"] = "TRACE";
      HttpMethod2["PATCH"] = "PATCH";
    })(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
    var SvixRequest = class {
      static {
        __name(this, "SvixRequest");
      }
      constructor(method, path) {
        this.method = method;
        this.path = path;
        this.queryParams = {};
        this.headerParams = {};
      }
      setPathParam(name, value) {
        const newPath = this.path.replace(`{${name}}`, encodeURIComponent(value));
        if (this.path === newPath) {
          throw new Error(`path parameter ${name} not found`);
        }
        this.path = newPath;
      }
      setQueryParams(params) {
        for (const [name, value] of Object.entries(params)) {
          this.setQueryParam(name, value);
        }
      }
      setQueryParam(name, value) {
        if (value === void 0 || value === null) {
          return;
        }
        if (typeof value === "string") {
          this.queryParams[name] = value;
        } else if (typeof value === "boolean" || typeof value === "number") {
          this.queryParams[name] = value.toString();
        } else if (value instanceof Date) {
          this.queryParams[name] = value.toISOString();
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            this.queryParams[name] = value.join(",");
          }
        } else {
          const _assert_unreachable = value;
          throw new Error(`query parameter ${name} has unsupported type`);
        }
      }
      setHeaderParam(name, value) {
        if (value === void 0) {
          return;
        }
        this.headerParams[name] = value;
      }
      setBody(value) {
        this.body = JSON.stringify(value);
      }
      send(ctx, parseResponseBody) {
        return __awaiter(this, void 0, void 0, function* () {
          const response = yield this.sendInner(ctx);
          if (response.status === 204) {
            return null;
          }
          const responseBody = yield response.text();
          return parseResponseBody(JSON.parse(responseBody));
        });
      }
      sendNoResponseBody(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.sendInner(ctx);
        });
      }
      sendInner(ctx) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
          const url = new URL(ctx.baseUrl + this.path);
          for (const [name, value] of Object.entries(this.queryParams)) {
            url.searchParams.set(name, value);
          }
          if (this.headerParams["idempotency-key"] === void 0 && this.method.toUpperCase() === "POST") {
            this.headerParams["idempotency-key"] = `auto_${crypto.randomUUID()}`;
          }
          const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
          if (this.body != null) {
            this.headerParams["content-type"] = "application/json";
          }
          const isCredentialsSupported = "credentials" in Request.prototype;
          const response = yield sendWithRetry(url, {
            method: this.method.toString(),
            body: this.body,
            headers: Object.assign({ accept: "application/json, */*;q=0.8", authorization: `Bearer ${ctx.token}`, "user-agent": getUserAgent(), "svix-req-id": randomId.toString() }, this.headerParams),
            credentials: isCredentialsSupported ? "same-origin" : void 0,
            signal: ctx.timeout !== void 0 ? AbortSignal.timeout(ctx.timeout) : void 0
          }, ctx.retryScheduleInMs, (_a = ctx.retryScheduleInMs) === null || _a === void 0 ? void 0 : _a[0], (_c = (_b = ctx.retryScheduleInMs) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : ctx.numRetries, ctx.fetch);
          return filterResponseForErrors(response);
        });
      }
    };
    exports.SvixRequest = SvixRequest;
    function filterResponseForErrors(response) {
      return __awaiter(this, void 0, void 0, function* () {
        if (response.status < 300) {
          return response;
        }
        const responseBody = yield response.text();
        if (response.status === 422) {
          throw new util_1.ApiException(response.status, JSON.parse(responseBody), response.headers);
        }
        if (response.status >= 400 && response.status <= 499) {
          throw new util_1.ApiException(response.status, JSON.parse(responseBody), response.headers);
        }
        throw new util_1.ApiException(response.status, responseBody, response.headers);
      });
    }
    __name(filterResponseForErrors, "filterResponseForErrors");
    function sendWithRetry(url, init, retryScheduleInMs, nextInterval = 50, triesLeft = 2, fetchImpl = fetch, retryCount = 1) {
      var _a;
      return __awaiter(this, void 0, void 0, function* () {
        const sleep = /* @__PURE__ */ __name((interval) => new Promise((resolve) => setTimeout(resolve, interval)), "sleep");
        try {
          const response = yield fetchImpl(url, init);
          if (triesLeft <= 0 || response.status < 500) {
            return response;
          }
        } catch (e) {
          if (triesLeft <= 0) {
            throw e;
          }
        }
        yield sleep(nextInterval);
        init.headers["svix-retry-count"] = retryCount.toString();
        nextInterval = (_a = retryScheduleInMs === null || retryScheduleInMs === void 0 ? void 0 : retryScheduleInMs[retryCount]) !== null && _a !== void 0 ? _a : nextInterval * 2;
        return yield sendWithRetry(url, init, retryScheduleInMs, nextInterval, --triesLeft, fetchImpl, ++retryCount);
      });
    }
    __name(sendWithRetry, "sendWithRetry");
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/application.js
var require_application = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/application.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Application = void 0;
    var applicationIn_1 = require_applicationIn();
    var applicationOut_1 = require_applicationOut();
    var applicationPatch_1 = require_applicationPatch();
    var listResponseApplicationOut_1 = require_listResponseApplicationOut();
    var request_1 = require_request();
    var Application = class {
      static {
        __name(this, "Application");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app");
          request.setQueryParams({
            exclude_apps_with_no_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithNoEndpoints,
            exclude_apps_with_disabled_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithDisabledEndpoints,
            exclude_apps_with_svix_play_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithSvixPlayEndpoints,
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseApplicationOut_1.ListResponseApplicationOutSerializer._fromJsonObject);
        });
      }
      create(applicationIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
          return yield request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
        });
      }
      getOrCreate(applicationIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app");
        request.setQueryParam("get_if_exists", true);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      get(appId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}");
          request.setPathParam("app_id", appId);
          return yield request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
        });
      }
      update(appId, applicationIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}");
          request.setPathParam("app_id", appId);
          request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
          return yield request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
        });
      }
      delete(appId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}");
          request.setPathParam("app_id", appId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      patch(appId, applicationPatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}");
          request.setPathParam("app_id", appId);
          request.setBody(applicationPatch_1.ApplicationPatchSerializer._toJsonObject(applicationPatch));
          return yield request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
        });
      }
    };
    exports.Application = Application;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/apiTokenOut.js
var require_apiTokenOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/apiTokenOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApiTokenOutSerializer = void 0;
    exports.ApiTokenOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          expiresAt: object["expiresAt"] ? new Date(object["expiresAt"]) : null,
          id: object["id"],
          name: object["name"],
          scopes: object["scopes"],
          token: object["token"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          expiresAt: self.expiresAt,
          id: self.id,
          name: self.name,
          scopes: self.scopes,
          token: self.token
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appPortalCapability.js
var require_appPortalCapability = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appPortalCapability.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppPortalCapabilitySerializer = exports.AppPortalCapability = void 0;
    var AppPortalCapability;
    (function(AppPortalCapability2) {
      AppPortalCapability2["ViewBase"] = "ViewBase";
      AppPortalCapability2["ViewEndpointSecret"] = "ViewEndpointSecret";
      AppPortalCapability2["ManageEndpointSecret"] = "ManageEndpointSecret";
      AppPortalCapability2["ManageTransformations"] = "ManageTransformations";
      AppPortalCapability2["CreateAttempts"] = "CreateAttempts";
      AppPortalCapability2["ManageEndpoint"] = "ManageEndpoint";
    })(AppPortalCapability = exports.AppPortalCapability || (exports.AppPortalCapability = {}));
    exports.AppPortalCapabilitySerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appPortalAccessIn.js
var require_appPortalAccessIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appPortalAccessIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppPortalAccessInSerializer = void 0;
    var appPortalCapability_1 = require_appPortalCapability();
    var applicationIn_1 = require_applicationIn();
    exports.AppPortalAccessInSerializer = {
      _fromJsonObject(object) {
        var _a;
        return {
          application: object["application"] != null ? applicationIn_1.ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
          capabilities: (_a = object["capabilities"]) === null || _a === void 0 ? void 0 : _a.map((item) => appPortalCapability_1.AppPortalCapabilitySerializer._fromJsonObject(item)),
          expiry: object["expiry"],
          featureFlags: object["featureFlags"],
          readOnly: object["readOnly"],
          sessionId: object["sessionId"]
        };
      },
      _toJsonObject(self) {
        var _a;
        return {
          application: self.application != null ? applicationIn_1.ApplicationInSerializer._toJsonObject(self.application) : void 0,
          capabilities: (_a = self.capabilities) === null || _a === void 0 ? void 0 : _a.map((item) => appPortalCapability_1.AppPortalCapabilitySerializer._toJsonObject(item)),
          expiry: self.expiry,
          featureFlags: self.featureFlags,
          readOnly: self.readOnly,
          sessionId: self.sessionId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appPortalAccessOut.js
var require_appPortalAccessOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appPortalAccessOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppPortalAccessOutSerializer = void 0;
    exports.AppPortalAccessOutSerializer = {
      _fromJsonObject(object) {
        return {
          token: object["token"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          token: self.token,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/applicationTokenExpireIn.js
var require_applicationTokenExpireIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/applicationTokenExpireIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationTokenExpireInSerializer = void 0;
    exports.ApplicationTokenExpireInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          sessionIds: object["sessionIds"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          sessionIds: self.sessionIds
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rotatePollerTokenIn.js
var require_rotatePollerTokenIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rotatePollerTokenIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RotatePollerTokenInSerializer = void 0;
    exports.RotatePollerTokenInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          oldTokenExpiry: object["oldTokenExpiry"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          oldTokenExpiry: self.oldTokenExpiry
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamPortalAccessIn.js
var require_streamPortalAccessIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamPortalAccessIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamPortalAccessInSerializer = void 0;
    exports.StreamPortalAccessInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          featureFlags: object["featureFlags"],
          sessionId: object["sessionId"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          featureFlags: self.featureFlags,
          sessionId: self.sessionId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamTokenExpireIn.js
var require_streamTokenExpireIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamTokenExpireIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamTokenExpireInSerializer = void 0;
    exports.StreamTokenExpireInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          sessionIds: object["sessionIds"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          sessionIds: self.sessionIds
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/dashboardAccessOut.js
var require_dashboardAccessOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/dashboardAccessOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DashboardAccessOutSerializer = void 0;
    exports.DashboardAccessOutSerializer = {
      _fromJsonObject(object) {
        return {
          token: object["token"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          token: self.token,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/authentication.js
var require_authentication = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/authentication.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Authentication = void 0;
    var apiTokenOut_1 = require_apiTokenOut();
    var appPortalAccessIn_1 = require_appPortalAccessIn();
    var appPortalAccessOut_1 = require_appPortalAccessOut();
    var applicationTokenExpireIn_1 = require_applicationTokenExpireIn();
    var rotatePollerTokenIn_1 = require_rotatePollerTokenIn();
    var streamPortalAccessIn_1 = require_streamPortalAccessIn();
    var streamTokenExpireIn_1 = require_streamTokenExpireIn();
    var dashboardAccessOut_1 = require_dashboardAccessOut();
    var request_1 = require_request();
    var Authentication = class {
      static {
        __name(this, "Authentication");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      appPortalAccess(appId, appPortalAccessIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/app-portal-access/{app_id}");
          request.setPathParam("app_id", appId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(appPortalAccessIn_1.AppPortalAccessInSerializer._toJsonObject(appPortalAccessIn));
          return yield request.send(this.requestCtx, appPortalAccessOut_1.AppPortalAccessOutSerializer._fromJsonObject);
        });
      }
      logout(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/logout");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      expireAll(appId, applicationTokenExpireIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/app/{app_id}/expire-all");
          request.setPathParam("app_id", appId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(applicationTokenExpireIn_1.ApplicationTokenExpireInSerializer._toJsonObject(applicationTokenExpireIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      dashboardAccess(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/dashboard-access/{app_id}");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, dashboardAccessOut_1.DashboardAccessOutSerializer._fromJsonObject);
      }
      streamPortalAccess(streamId, streamPortalAccessIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream-portal-access/{stream_id}");
          request.setPathParam("stream_id", streamId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(streamPortalAccessIn_1.StreamPortalAccessInSerializer._toJsonObject(streamPortalAccessIn));
          return yield request.send(this.requestCtx, appPortalAccessOut_1.AppPortalAccessOutSerializer._fromJsonObject);
        });
      }
      streamLogout(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream-logout");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      streamExpireAll(streamId, streamTokenExpireIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream/{stream_id}/expire-all");
          request.setPathParam("stream_id", streamId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(streamTokenExpireIn_1.StreamTokenExpireInSerializer._toJsonObject(streamTokenExpireIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      rotateStreamPollerToken(streamId, sinkId, rotatePollerTokenIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token/rotate");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(rotatePollerTokenIn_1.RotatePollerTokenInSerializer._toJsonObject(rotatePollerTokenIn));
          return yield request.send(this.requestCtx, apiTokenOut_1.ApiTokenOutSerializer._fromJsonObject);
        });
      }
      getStreamPollerToken(streamId, sinkId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          return yield request.send(this.requestCtx, apiTokenOut_1.ApiTokenOutSerializer._fromJsonObject);
        });
      }
    };
    exports.Authentication = Authentication;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/backgroundTaskStatus.js
var require_backgroundTaskStatus = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/backgroundTaskStatus.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTaskStatusSerializer = exports.BackgroundTaskStatus = void 0;
    var BackgroundTaskStatus;
    (function(BackgroundTaskStatus2) {
      BackgroundTaskStatus2["Running"] = "running";
      BackgroundTaskStatus2["Finished"] = "finished";
      BackgroundTaskStatus2["Failed"] = "failed";
    })(BackgroundTaskStatus = exports.BackgroundTaskStatus || (exports.BackgroundTaskStatus = {}));
    exports.BackgroundTaskStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/backgroundTaskType.js
var require_backgroundTaskType = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/backgroundTaskType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTaskTypeSerializer = exports.BackgroundTaskType = void 0;
    var BackgroundTaskType;
    (function(BackgroundTaskType2) {
      BackgroundTaskType2["EndpointReplay"] = "endpoint.replay";
      BackgroundTaskType2["EndpointRecover"] = "endpoint.recover";
      BackgroundTaskType2["ApplicationStats"] = "application.stats";
      BackgroundTaskType2["MessageBroadcast"] = "message.broadcast";
      BackgroundTaskType2["SdkGenerate"] = "sdk.generate";
      BackgroundTaskType2["EventTypeAggregate"] = "event-type.aggregate";
      BackgroundTaskType2["ApplicationPurgeContent"] = "application.purge_content";
      BackgroundTaskType2["EndpointBulkReplay"] = "endpoint.bulk-replay";
    })(BackgroundTaskType = exports.BackgroundTaskType || (exports.BackgroundTaskType = {}));
    exports.BackgroundTaskTypeSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/backgroundTaskOut.js
var require_backgroundTaskOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/backgroundTaskOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTaskOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.BackgroundTaskOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"],
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data,
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseBackgroundTaskOut.js
var require_listResponseBackgroundTaskOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseBackgroundTaskOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseBackgroundTaskOutSerializer = void 0;
    var backgroundTaskOut_1 = require_backgroundTaskOut();
    exports.ListResponseBackgroundTaskOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => backgroundTaskOut_1.BackgroundTaskOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => backgroundTaskOut_1.BackgroundTaskOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/backgroundTask.js
var require_backgroundTask = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/backgroundTask.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTask = void 0;
    var backgroundTaskOut_1 = require_backgroundTaskOut();
    var listResponseBackgroundTaskOut_1 = require_listResponseBackgroundTaskOut();
    var request_1 = require_request();
    var BackgroundTask = class {
      static {
        __name(this, "BackgroundTask");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/background-task");
          request.setQueryParams({
            status: options === null || options === void 0 ? void 0 : options.status,
            task: options === null || options === void 0 ? void 0 : options.task,
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseBackgroundTaskOut_1.ListResponseBackgroundTaskOutSerializer._fromJsonObject);
        });
      }
      listByEndpoint(options) {
        return this.list(options);
      }
      get(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/background-task/{task_id}");
          request.setPathParam("task_id", taskId);
          return yield request.send(this.requestCtx, backgroundTaskOut_1.BackgroundTaskOutSerializer._fromJsonObject);
        });
      }
    };
    exports.BackgroundTask = BackgroundTask;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorKind.js
var require_connectorKind = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorKind.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorKindSerializer = exports.ConnectorKind = void 0;
    var ConnectorKind;
    (function(ConnectorKind2) {
      ConnectorKind2["Custom"] = "Custom";
      ConnectorKind2["AgenticCommerceProtocol"] = "AgenticCommerceProtocol";
      ConnectorKind2["CloseCrm"] = "CloseCRM";
      ConnectorKind2["CustomerIo"] = "CustomerIO";
      ConnectorKind2["Discord"] = "Discord";
      ConnectorKind2["Hubspot"] = "Hubspot";
      ConnectorKind2["Inngest"] = "Inngest";
      ConnectorKind2["Loops"] = "Loops";
      ConnectorKind2["Otel"] = "Otel";
      ConnectorKind2["Resend"] = "Resend";
      ConnectorKind2["Salesforce"] = "Salesforce";
      ConnectorKind2["Segment"] = "Segment";
      ConnectorKind2["Sendgrid"] = "Sendgrid";
      ConnectorKind2["Slack"] = "Slack";
      ConnectorKind2["Teams"] = "Teams";
      ConnectorKind2["TriggerDev"] = "TriggerDev";
      ConnectorKind2["Windmill"] = "Windmill";
      ConnectorKind2["Zapier"] = "Zapier";
    })(ConnectorKind = exports.ConnectorKind || (exports.ConnectorKind = {}));
    exports.ConnectorKindSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorProduct.js
var require_connectorProduct = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorProduct.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorProductSerializer = exports.ConnectorProduct = void 0;
    var ConnectorProduct;
    (function(ConnectorProduct2) {
      ConnectorProduct2["Dispatch"] = "Dispatch";
      ConnectorProduct2["Stream"] = "Stream";
    })(ConnectorProduct = exports.ConnectorProduct || (exports.ConnectorProduct = {}));
    exports.ConnectorProductSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorIn.js
var require_connectorIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorInSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    var connectorProduct_1 = require_connectorProduct();
    exports.ConnectorInSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          productType: object["productType"] != null ? connectorProduct_1.ConnectorProductSerializer._fromJsonObject(object["productType"]) : void 0,
          transformation: object["transformation"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          productType: self.productType != null ? connectorProduct_1.ConnectorProductSerializer._toJsonObject(self.productType) : void 0,
          transformation: self.transformation,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorOut.js
var require_connectorOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorOutSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    var connectorProduct_1 = require_connectorProduct();
    exports.ConnectorOutSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          featureFlags: object["featureFlags"],
          id: object["id"],
          instructions: object["instructions"],
          kind: connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]),
          logo: object["logo"],
          name: object["name"],
          orgId: object["orgId"],
          productType: connectorProduct_1.ConnectorProductSerializer._fromJsonObject(object["productType"]),
          transformation: object["transformation"],
          transformationUpdatedAt: new Date(object["transformationUpdatedAt"]),
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          createdAt: self.createdAt,
          description: self.description,
          featureFlags: self.featureFlags,
          id: self.id,
          instructions: self.instructions,
          kind: connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind),
          logo: self.logo,
          name: self.name,
          orgId: self.orgId,
          productType: connectorProduct_1.ConnectorProductSerializer._toJsonObject(self.productType),
          transformation: self.transformation,
          transformationUpdatedAt: self.transformationUpdatedAt,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorPatch.js
var require_connectorPatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorPatchSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    exports.ConnectorPatchSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          transformation: object["transformation"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          transformation: self.transformation
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorUpdate.js
var require_connectorUpdate = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/connectorUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorUpdateSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    exports.ConnectorUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          transformation: object["transformation"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          transformation: self.transformation
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseConnectorOut.js
var require_listResponseConnectorOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseConnectorOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseConnectorOutSerializer = void 0;
    var connectorOut_1 = require_connectorOut();
    exports.ListResponseConnectorOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => connectorOut_1.ConnectorOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => connectorOut_1.ConnectorOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/connector.js
var require_connector = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/connector.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Connector = void 0;
    var connectorIn_1 = require_connectorIn();
    var connectorOut_1 = require_connectorOut();
    var connectorPatch_1 = require_connectorPatch();
    var connectorUpdate_1 = require_connectorUpdate();
    var listResponseConnectorOut_1 = require_listResponseConnectorOut();
    var request_1 = require_request();
    var Connector = class {
      static {
        __name(this, "Connector");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/connector");
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order,
            product_type: options === null || options === void 0 ? void 0 : options.productType
          });
          return yield request.send(this.requestCtx, listResponseConnectorOut_1.ListResponseConnectorOutSerializer._fromJsonObject);
        });
      }
      create(connectorIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/connector");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(connectorIn_1.ConnectorInSerializer._toJsonObject(connectorIn));
          return yield request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
        });
      }
      get(connectorId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/connector/{connector_id}");
          request.setPathParam("connector_id", connectorId);
          return yield request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
        });
      }
      update(connectorId, connectorUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/connector/{connector_id}");
          request.setPathParam("connector_id", connectorId);
          request.setBody(connectorUpdate_1.ConnectorUpdateSerializer._toJsonObject(connectorUpdate));
          return yield request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
        });
      }
      delete(connectorId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/connector/{connector_id}");
          request.setPathParam("connector_id", connectorId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      patch(connectorId, connectorPatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/connector/{connector_id}");
          request.setPathParam("connector_id", connectorId);
          request.setBody(connectorPatch_1.ConnectorPatchSerializer._toJsonObject(connectorPatch));
          return yield request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
        });
      }
    };
    exports.Connector = Connector;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageStatus.js
var require_messageStatus = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageStatus.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageStatusSerializer = exports.MessageStatus = void 0;
    var MessageStatus;
    (function(MessageStatus2) {
      MessageStatus2[MessageStatus2["Success"] = 0] = "Success";
      MessageStatus2[MessageStatus2["Pending"] = 1] = "Pending";
      MessageStatus2[MessageStatus2["Fail"] = 2] = "Fail";
      MessageStatus2[MessageStatus2["Sending"] = 3] = "Sending";
      MessageStatus2[MessageStatus2["Canceled"] = 4] = "Canceled";
    })(MessageStatus = exports.MessageStatus || (exports.MessageStatus = {}));
    exports.MessageStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/statusCodeClass.js
var require_statusCodeClass = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/statusCodeClass.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusCodeClassSerializer = exports.StatusCodeClass = void 0;
    var StatusCodeClass;
    (function(StatusCodeClass2) {
      StatusCodeClass2[StatusCodeClass2["CodeNone"] = 0] = "CodeNone";
      StatusCodeClass2[StatusCodeClass2["Code1xx"] = 100] = "Code1xx";
      StatusCodeClass2[StatusCodeClass2["Code2xx"] = 200] = "Code2xx";
      StatusCodeClass2[StatusCodeClass2["Code3xx"] = 300] = "Code3xx";
      StatusCodeClass2[StatusCodeClass2["Code4xx"] = 400] = "Code4xx";
      StatusCodeClass2[StatusCodeClass2["Code5xx"] = 500] = "Code5xx";
    })(StatusCodeClass = exports.StatusCodeClass || (exports.StatusCodeClass = {}));
    exports.StatusCodeClassSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/bulkReplayIn.js
var require_bulkReplayIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/bulkReplayIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkReplayInSerializer = void 0;
    var messageStatus_1 = require_messageStatus();
    var statusCodeClass_1 = require_statusCodeClass();
    exports.BulkReplayInSerializer = {
      _fromJsonObject(object) {
        return {
          channel: object["channel"],
          eventTypes: object["eventTypes"],
          since: new Date(object["since"]),
          status: object["status"] != null ? messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]) : void 0,
          statusCodeClass: object["statusCodeClass"] != null ? statusCodeClass_1.StatusCodeClassSerializer._fromJsonObject(object["statusCodeClass"]) : void 0,
          tag: object["tag"],
          until: object["until"] ? new Date(object["until"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          channel: self.channel,
          eventTypes: self.eventTypes,
          since: self.since,
          status: self.status != null ? messageStatus_1.MessageStatusSerializer._toJsonObject(self.status) : void 0,
          statusCodeClass: self.statusCodeClass != null ? statusCodeClass_1.StatusCodeClassSerializer._toJsonObject(self.statusCodeClass) : void 0,
          tag: self.tag,
          until: self.until
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointHeadersIn.js
var require_endpointHeadersIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointHeadersIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointHeadersInSerializer = void 0;
    exports.EndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointHeadersOut.js
var require_endpointHeadersOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointHeadersOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointHeadersOutSerializer = void 0;
    exports.EndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointHeadersPatchIn.js
var require_endpointHeadersPatchIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointHeadersPatchIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointHeadersPatchInSerializer = void 0;
    exports.EndpointHeadersPatchInSerializer = {
      _fromJsonObject(object) {
        return {
          deleteHeaders: object["deleteHeaders"],
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          deleteHeaders: self.deleteHeaders,
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointIn.js
var require_endpointIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointInSerializer = void 0;
    exports.EndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          headers: object["headers"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          headers: self.headers,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          throttleRate: self.throttleRate,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointOut.js
var require_endpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointOutSerializer = void 0;
    exports.EndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointPatch.js
var require_endpointPatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointPatchSerializer = void 0;
    exports.EndpointPatchSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          throttleRate: self.throttleRate,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointSecretOut.js
var require_endpointSecretOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointSecretOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointSecretOutSerializer = void 0;
    exports.EndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointSecretRotateIn.js
var require_endpointSecretRotateIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointSecretRotateIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointSecretRotateInSerializer = void 0;
    exports.EndpointSecretRotateInSerializer = {
      _fromJsonObject(object) {
        return {
          gracePeriodSeconds: object["gracePeriodSeconds"],
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          gracePeriodSeconds: self.gracePeriodSeconds,
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointStats.js
var require_endpointStats = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointStats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointStatsSerializer = void 0;
    exports.EndpointStatsSerializer = {
      _fromJsonObject(object) {
        return {
          canceled: object["canceled"],
          fail: object["fail"],
          pending: object["pending"],
          sending: object["sending"],
          success: object["success"]
        };
      },
      _toJsonObject(self) {
        return {
          canceled: self.canceled,
          fail: self.fail,
          pending: self.pending,
          sending: self.sending,
          success: self.success
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointTransformationIn.js
var require_endpointTransformationIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointTransformationIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointTransformationInSerializer = void 0;
    exports.EndpointTransformationInSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointTransformationOut.js
var require_endpointTransformationOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointTransformationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointTransformationOutSerializer = void 0;
    exports.EndpointTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"],
          updatedAt: object["updatedAt"] ? new Date(object["updatedAt"]) : null,
          variables: object["variables"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled,
          updatedAt: self.updatedAt,
          variables: self.variables
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointTransformationPatch.js
var require_endpointTransformationPatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointTransformationPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointTransformationPatchSerializer = void 0;
    exports.EndpointTransformationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"],
          variables: object["variables"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled,
          variables: self.variables
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointUpdate.js
var require_endpointUpdate = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointUpdateSerializer = void 0;
    exports.EndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventExampleIn.js
var require_eventExampleIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventExampleIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventExampleInSerializer = void 0;
    exports.EventExampleInSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          exampleIndex: object["exampleIndex"]
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          exampleIndex: self.exampleIndex
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseEndpointOut.js
var require_listResponseEndpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseEndpointOutSerializer = void 0;
    var endpointOut_1 = require_endpointOut();
    exports.ListResponseEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => endpointOut_1.EndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => endpointOut_1.EndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageOut.js
var require_messageOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageOutSerializer = void 0;
    exports.MessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          id: object["id"],
          payload: object["payload"],
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          id: self.id,
          payload: self.payload,
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/recoverIn.js
var require_recoverIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/recoverIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RecoverInSerializer = void 0;
    exports.RecoverInSerializer = {
      _fromJsonObject(object) {
        return {
          since: new Date(object["since"]),
          until: object["until"] ? new Date(object["until"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/recoverOut.js
var require_recoverOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/recoverOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RecoverOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.RecoverOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/replayIn.js
var require_replayIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/replayIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplayInSerializer = void 0;
    exports.ReplayInSerializer = {
      _fromJsonObject(object) {
        return {
          since: new Date(object["since"]),
          until: object["until"] ? new Date(object["until"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/replayOut.js
var require_replayOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/replayOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplayOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.ReplayOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/endpoint.js
var require_endpoint = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/endpoint.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Endpoint = void 0;
    var bulkReplayIn_1 = require_bulkReplayIn();
    var endpointHeadersIn_1 = require_endpointHeadersIn();
    var endpointHeadersOut_1 = require_endpointHeadersOut();
    var endpointHeadersPatchIn_1 = require_endpointHeadersPatchIn();
    var endpointIn_1 = require_endpointIn();
    var endpointOut_1 = require_endpointOut();
    var endpointPatch_1 = require_endpointPatch();
    var endpointSecretOut_1 = require_endpointSecretOut();
    var endpointSecretRotateIn_1 = require_endpointSecretRotateIn();
    var endpointStats_1 = require_endpointStats();
    var endpointTransformationIn_1 = require_endpointTransformationIn();
    var endpointTransformationOut_1 = require_endpointTransformationOut();
    var endpointTransformationPatch_1 = require_endpointTransformationPatch();
    var endpointUpdate_1 = require_endpointUpdate();
    var eventExampleIn_1 = require_eventExampleIn();
    var listResponseEndpointOut_1 = require_listResponseEndpointOut();
    var messageOut_1 = require_messageOut();
    var recoverIn_1 = require_recoverIn();
    var recoverOut_1 = require_recoverOut();
    var replayIn_1 = require_replayIn();
    var replayOut_1 = require_replayOut();
    var request_1 = require_request();
    var Endpoint = class {
      static {
        __name(this, "Endpoint");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(appId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint");
          request.setPathParam("app_id", appId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseEndpointOut_1.ListResponseEndpointOutSerializer._fromJsonObject);
        });
      }
      create(appId, endpointIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint");
          request.setPathParam("app_id", appId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(endpointIn_1.EndpointInSerializer._toJsonObject(endpointIn));
          return yield request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
        });
      }
      get(appId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
        });
      }
      update(appId, endpointId, endpointUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(endpointUpdate_1.EndpointUpdateSerializer._toJsonObject(endpointUpdate));
          return yield request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
        });
      }
      delete(appId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      patch(appId, endpointId, endpointPatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(endpointPatch_1.EndpointPatchSerializer._toJsonObject(endpointPatch));
          return yield request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
        });
      }
      getSecret(appId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, endpointSecretOut_1.EndpointSecretOutSerializer._fromJsonObject);
        });
      }
      rotateSecret(appId, endpointId, endpointSecretRotateIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret/rotate");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(endpointSecretRotateIn_1.EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      getHeaders(appId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
        });
      }
      updateHeaders(appId, endpointId, endpointHeadersIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(endpointHeadersIn_1.EndpointHeadersInSerializer._toJsonObject(endpointHeadersIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      headersUpdate(appId, endpointId, endpointHeadersIn) {
        return this.updateHeaders(appId, endpointId, endpointHeadersIn);
      }
      patchHeaders(appId, endpointId, endpointHeadersPatchIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(endpointHeadersPatchIn_1.EndpointHeadersPatchInSerializer._toJsonObject(endpointHeadersPatchIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      headersPatch(appId, endpointId, endpointHeadersPatchIn) {
        return this.patchHeaders(appId, endpointId, endpointHeadersPatchIn);
      }
      transformationGet(appId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, endpointTransformationOut_1.EndpointTransformationOutSerializer._fromJsonObject);
        });
      }
      patchTransformation(appId, endpointId, endpointTransformationPatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(endpointTransformationPatch_1.EndpointTransformationPatchSerializer._toJsonObject(endpointTransformationPatch));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      replayMissing(appId, endpointId, replayIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/replay-missing");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(replayIn_1.ReplayInSerializer._toJsonObject(replayIn));
          return yield request.send(this.requestCtx, replayOut_1.ReplayOutSerializer._fromJsonObject);
        });
      }
      bulkReplay(appId, endpointId, bulkReplayIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/bulk-replay");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(bulkReplayIn_1.BulkReplayInSerializer._toJsonObject(bulkReplayIn));
          return yield request.send(this.requestCtx, replayOut_1.ReplayOutSerializer._fromJsonObject);
        });
      }
      getStats(appId, endpointId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/stats");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setQueryParams({
            since: options === null || options === void 0 ? void 0 : options.since,
            until: options === null || options === void 0 ? void 0 : options.until
          });
          return yield request.send(this.requestCtx, endpointStats_1.EndpointStatsSerializer._fromJsonObject);
        });
      }
      recover(appId, endpointId, recoverIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/recover");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(recoverIn_1.RecoverInSerializer._toJsonObject(recoverIn));
          return yield request.send(this.requestCtx, recoverOut_1.RecoverOutSerializer._fromJsonObject);
        });
      }
      sendExample(appId, endpointId, eventExampleIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/send-example");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(eventExampleIn_1.EventExampleInSerializer._toJsonObject(eventExampleIn));
          return yield request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
        });
      }
      transformationPartialUpdate(appId, endpointId, endpointTransformationIn = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(endpointTransformationIn_1.EndpointTransformationInSerializer._toJsonObject(endpointTransformationIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
    };
    exports.Endpoint = Endpoint;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeIn.js
var require_eventTypeIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeInSerializer = void 0;
    exports.EventTypeInSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/environmentIn.js
var require_environmentIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/environmentIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentInSerializer = void 0;
    var connectorIn_1 = require_connectorIn();
    var eventTypeIn_1 = require_eventTypeIn();
    exports.EnvironmentInSerializer = {
      _fromJsonObject(object) {
        var _a, _b;
        return {
          connectors: (_a = object["connectors"]) === null || _a === void 0 ? void 0 : _a.map((item) => connectorIn_1.ConnectorInSerializer._fromJsonObject(item)),
          eventTypes: (_b = object["eventTypes"]) === null || _b === void 0 ? void 0 : _b.map((item) => eventTypeIn_1.EventTypeInSerializer._fromJsonObject(item)),
          settings: object["settings"]
        };
      },
      _toJsonObject(self) {
        var _a, _b;
        return {
          connectors: (_a = self.connectors) === null || _a === void 0 ? void 0 : _a.map((item) => connectorIn_1.ConnectorInSerializer._toJsonObject(item)),
          eventTypes: (_b = self.eventTypes) === null || _b === void 0 ? void 0 : _b.map((item) => eventTypeIn_1.EventTypeInSerializer._toJsonObject(item)),
          settings: self.settings
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeOut.js
var require_eventTypeOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeOutSerializer = void 0;
    exports.EventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          createdAt: new Date(object["createdAt"]),
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          createdAt: self.createdAt,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/environmentOut.js
var require_environmentOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/environmentOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentOutSerializer = void 0;
    var connectorOut_1 = require_connectorOut();
    var eventTypeOut_1 = require_eventTypeOut();
    exports.EnvironmentOutSerializer = {
      _fromJsonObject(object) {
        return {
          connectors: object["connectors"].map((item) => connectorOut_1.ConnectorOutSerializer._fromJsonObject(item)),
          createdAt: new Date(object["createdAt"]),
          eventTypes: object["eventTypes"].map((item) => eventTypeOut_1.EventTypeOutSerializer._fromJsonObject(item)),
          settings: object["settings"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          connectors: self.connectors.map((item) => connectorOut_1.ConnectorOutSerializer._toJsonObject(item)),
          createdAt: self.createdAt,
          eventTypes: self.eventTypes.map((item) => eventTypeOut_1.EventTypeOutSerializer._toJsonObject(item)),
          settings: self.settings,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/environment.js
var require_environment = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/environment.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Environment = void 0;
    var environmentIn_1 = require_environmentIn();
    var environmentOut_1 = require_environmentOut();
    var request_1 = require_request();
    var Environment = class {
      static {
        __name(this, "Environment");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      export(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/environment/export");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          return yield request.send(this.requestCtx, environmentOut_1.EnvironmentOutSerializer._fromJsonObject);
        });
      }
      import(environmentIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/environment/import");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(environmentIn_1.EnvironmentInSerializer._toJsonObject(environmentIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
    };
    exports.Environment = Environment;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeImportOpenApiIn.js
var require_eventTypeImportOpenApiIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeImportOpenApiIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeImportOpenApiInSerializer = void 0;
    exports.EventTypeImportOpenApiInSerializer = {
      _fromJsonObject(object) {
        return {
          dryRun: object["dryRun"],
          replaceAll: object["replaceAll"],
          spec: object["spec"],
          specRaw: object["specRaw"]
        };
      },
      _toJsonObject(self) {
        return {
          dryRun: self.dryRun,
          replaceAll: self.replaceAll,
          spec: self.spec,
          specRaw: self.specRaw
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeFromOpenApi.js
var require_eventTypeFromOpenApi = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeFromOpenApi.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeFromOpenApiSerializer = void 0;
    exports.EventTypeFromOpenApiSerializer = {
      _fromJsonObject(object) {
        return {
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeImportOpenApiOutData.js
var require_eventTypeImportOpenApiOutData = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeImportOpenApiOutData.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeImportOpenApiOutDataSerializer = void 0;
    var eventTypeFromOpenApi_1 = require_eventTypeFromOpenApi();
    exports.EventTypeImportOpenApiOutDataSerializer = {
      _fromJsonObject(object) {
        var _a;
        return {
          modified: object["modified"],
          toModify: (_a = object["to_modify"]) === null || _a === void 0 ? void 0 : _a.map((item) => eventTypeFromOpenApi_1.EventTypeFromOpenApiSerializer._fromJsonObject(item))
        };
      },
      _toJsonObject(self) {
        var _a;
        return {
          modified: self.modified,
          to_modify: (_a = self.toModify) === null || _a === void 0 ? void 0 : _a.map((item) => eventTypeFromOpenApi_1.EventTypeFromOpenApiSerializer._toJsonObject(item))
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeImportOpenApiOut.js
var require_eventTypeImportOpenApiOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeImportOpenApiOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeImportOpenApiOutSerializer = void 0;
    var eventTypeImportOpenApiOutData_1 = require_eventTypeImportOpenApiOutData();
    exports.EventTypeImportOpenApiOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: eventTypeImportOpenApiOutData_1.EventTypeImportOpenApiOutDataSerializer._fromJsonObject(object["data"])
        };
      },
      _toJsonObject(self) {
        return {
          data: eventTypeImportOpenApiOutData_1.EventTypeImportOpenApiOutDataSerializer._toJsonObject(self.data)
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypePatch.js
var require_eventTypePatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypePatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypePatchSerializer = void 0;
    exports.EventTypePatchSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          schemas: self.schemas
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeUpdate.js
var require_eventTypeUpdate = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventTypeUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeUpdateSerializer = void 0;
    exports.EventTypeUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          schemas: self.schemas
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseEventTypeOut.js
var require_listResponseEventTypeOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseEventTypeOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseEventTypeOutSerializer = void 0;
    var eventTypeOut_1 = require_eventTypeOut();
    exports.ListResponseEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => eventTypeOut_1.EventTypeOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => eventTypeOut_1.EventTypeOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/eventType.js
var require_eventType = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/eventType.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventType = void 0;
    var eventTypeImportOpenApiIn_1 = require_eventTypeImportOpenApiIn();
    var eventTypeImportOpenApiOut_1 = require_eventTypeImportOpenApiOut();
    var eventTypeIn_1 = require_eventTypeIn();
    var eventTypeOut_1 = require_eventTypeOut();
    var eventTypePatch_1 = require_eventTypePatch();
    var eventTypeUpdate_1 = require_eventTypeUpdate();
    var listResponseEventTypeOut_1 = require_listResponseEventTypeOut();
    var request_1 = require_request();
    var EventType = class {
      static {
        __name(this, "EventType");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/event-type");
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order,
            include_archived: options === null || options === void 0 ? void 0 : options.includeArchived,
            with_content: options === null || options === void 0 ? void 0 : options.withContent
          });
          return yield request.send(this.requestCtx, listResponseEventTypeOut_1.ListResponseEventTypeOutSerializer._fromJsonObject);
        });
      }
      create(eventTypeIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/event-type");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(eventTypeIn_1.EventTypeInSerializer._toJsonObject(eventTypeIn));
          return yield request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
        });
      }
      importOpenapi(eventTypeImportOpenApiIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/event-type/import/openapi");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(eventTypeImportOpenApiIn_1.EventTypeImportOpenApiInSerializer._toJsonObject(eventTypeImportOpenApiIn));
          return yield request.send(this.requestCtx, eventTypeImportOpenApiOut_1.EventTypeImportOpenApiOutSerializer._fromJsonObject);
        });
      }
      get(eventTypeName) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/event-type/{event_type_name}");
          request.setPathParam("event_type_name", eventTypeName);
          return yield request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
        });
      }
      update(eventTypeName, eventTypeUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/event-type/{event_type_name}");
          request.setPathParam("event_type_name", eventTypeName);
          request.setBody(eventTypeUpdate_1.EventTypeUpdateSerializer._toJsonObject(eventTypeUpdate));
          return yield request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
        });
      }
      delete(eventTypeName, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/event-type/{event_type_name}");
          request.setPathParam("event_type_name", eventTypeName);
          request.setQueryParams({
            expunge: options === null || options === void 0 ? void 0 : options.expunge
          });
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      patch(eventTypeName, eventTypePatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/event-type/{event_type_name}");
          request.setPathParam("event_type_name", eventTypeName);
          request.setBody(eventTypePatch_1.EventTypePatchSerializer._toJsonObject(eventTypePatch));
          return yield request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
        });
      }
    };
    exports.EventType = EventType;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/health.js
var require_health = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/health.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Health = void 0;
    var request_1 = require_request();
    var Health = class {
      static {
        __name(this, "Health");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get() {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/health");
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
    };
    exports.Health = Health;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestSourceConsumerPortalAccessIn.js
var require_ingestSourceConsumerPortalAccessIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestSourceConsumerPortalAccessIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestSourceConsumerPortalAccessInSerializer = void 0;
    exports.IngestSourceConsumerPortalAccessInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          readOnly: object["readOnly"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          readOnly: self.readOnly
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointHeadersIn.js
var require_ingestEndpointHeadersIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointHeadersIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointHeadersInSerializer = void 0;
    exports.IngestEndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointHeadersOut.js
var require_ingestEndpointHeadersOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointHeadersOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointHeadersOutSerializer = void 0;
    exports.IngestEndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointIn.js
var require_ingestEndpointIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointInSerializer = void 0;
    exports.IngestEndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          throttleRate: self.throttleRate,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointOut.js
var require_ingestEndpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointOutSerializer = void 0;
    exports.IngestEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointSecretIn.js
var require_ingestEndpointSecretIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointSecretIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointSecretInSerializer = void 0;
    exports.IngestEndpointSecretInSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointSecretOut.js
var require_ingestEndpointSecretOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointSecretOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointSecretOutSerializer = void 0;
    exports.IngestEndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointTransformationOut.js
var require_ingestEndpointTransformationOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointTransformationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointTransformationOutSerializer = void 0;
    exports.IngestEndpointTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointTransformationPatch.js
var require_ingestEndpointTransformationPatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointTransformationPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointTransformationPatchSerializer = void 0;
    exports.IngestEndpointTransformationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointUpdate.js
var require_ingestEndpointUpdate = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestEndpointUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointUpdateSerializer = void 0;
    exports.IngestEndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseIngestEndpointOut.js
var require_listResponseIngestEndpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseIngestEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseIngestEndpointOutSerializer = void 0;
    var ingestEndpointOut_1 = require_ingestEndpointOut();
    exports.ListResponseIngestEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => ingestEndpointOut_1.IngestEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/ingestEndpoint.js
var require_ingestEndpoint = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/ingestEndpoint.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpoint = void 0;
    var ingestEndpointHeadersIn_1 = require_ingestEndpointHeadersIn();
    var ingestEndpointHeadersOut_1 = require_ingestEndpointHeadersOut();
    var ingestEndpointIn_1 = require_ingestEndpointIn();
    var ingestEndpointOut_1 = require_ingestEndpointOut();
    var ingestEndpointSecretIn_1 = require_ingestEndpointSecretIn();
    var ingestEndpointSecretOut_1 = require_ingestEndpointSecretOut();
    var ingestEndpointTransformationOut_1 = require_ingestEndpointTransformationOut();
    var ingestEndpointTransformationPatch_1 = require_ingestEndpointTransformationPatch();
    var ingestEndpointUpdate_1 = require_ingestEndpointUpdate();
    var listResponseIngestEndpointOut_1 = require_listResponseIngestEndpointOut();
    var request_1 = require_request();
    var IngestEndpoint = class {
      static {
        __name(this, "IngestEndpoint");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(sourceId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint");
          request.setPathParam("source_id", sourceId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseIngestEndpointOut_1.ListResponseIngestEndpointOutSerializer._fromJsonObject);
        });
      }
      create(sourceId, ingestEndpointIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/endpoint");
          request.setPathParam("source_id", sourceId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(ingestEndpointIn_1.IngestEndpointInSerializer._toJsonObject(ingestEndpointIn));
          return yield request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
        });
      }
      get(sourceId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
        });
      }
      update(sourceId, endpointId, ingestEndpointUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(ingestEndpointUpdate_1.IngestEndpointUpdateSerializer._toJsonObject(ingestEndpointUpdate));
          return yield request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
        });
      }
      delete(sourceId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      getSecret(sourceId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, ingestEndpointSecretOut_1.IngestEndpointSecretOutSerializer._fromJsonObject);
        });
      }
      rotateSecret(sourceId, endpointId, ingestEndpointSecretIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret/rotate");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(ingestEndpointSecretIn_1.IngestEndpointSecretInSerializer._toJsonObject(ingestEndpointSecretIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      getHeaders(sourceId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, ingestEndpointHeadersOut_1.IngestEndpointHeadersOutSerializer._fromJsonObject);
        });
      }
      updateHeaders(sourceId, endpointId, ingestEndpointHeadersIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(ingestEndpointHeadersIn_1.IngestEndpointHeadersInSerializer._toJsonObject(ingestEndpointHeadersIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      getTransformation(sourceId, endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, ingestEndpointTransformationOut_1.IngestEndpointTransformationOutSerializer._fromJsonObject);
        });
      }
      setTransformation(sourceId, endpointId, ingestEndpointTransformationPatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
          request.setPathParam("source_id", sourceId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(ingestEndpointTransformationPatch_1.IngestEndpointTransformationPatchSerializer._toJsonObject(ingestEndpointTransformationPatch));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
    };
    exports.IngestEndpoint = IngestEndpoint;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/adobeSignConfig.js
var require_adobeSignConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/adobeSignConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdobeSignConfigSerializer = void 0;
    exports.AdobeSignConfigSerializer = {
      _fromJsonObject(object) {
        return {
          clientId: object["clientId"]
        };
      },
      _toJsonObject(self) {
        return {
          clientId: self.clientId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/airwallexConfig.js
var require_airwallexConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/airwallexConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AirwallexConfigSerializer = void 0;
    exports.AirwallexConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/checkbookConfig.js
var require_checkbookConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/checkbookConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckbookConfigSerializer = void 0;
    exports.CheckbookConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/cronConfig.js
var require_cronConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/cronConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronConfigSerializer = void 0;
    exports.CronConfigSerializer = {
      _fromJsonObject(object) {
        return {
          contentType: object["contentType"],
          payload: object["payload"],
          schedule: object["schedule"]
        };
      },
      _toJsonObject(self) {
        return {
          contentType: self.contentType,
          payload: self.payload,
          schedule: self.schedule
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/docusignConfig.js
var require_docusignConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/docusignConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocusignConfigSerializer = void 0;
    exports.DocusignConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/easypostConfig.js
var require_easypostConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/easypostConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EasypostConfigSerializer = void 0;
    exports.EasypostConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/githubConfig.js
var require_githubConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/githubConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GithubConfigSerializer = void 0;
    exports.GithubConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/hubspotConfig.js
var require_hubspotConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/hubspotConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HubspotConfigSerializer = void 0;
    exports.HubspotConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/metaConfig.js
var require_metaConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/metaConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MetaConfigSerializer = void 0;
    exports.MetaConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"],
          verifyToken: object["verifyToken"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret,
          verifyToken: self.verifyToken
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/nangoConfig.js
var require_nangoConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/nangoConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NangoConfigSerializer = void 0;
    exports.NangoConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/openClawConfig.js
var require_openClawConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/openClawConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenClawConfigSerializer = void 0;
    exports.OpenClawConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/orumIoConfig.js
var require_orumIoConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/orumIoConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OrumIoConfigSerializer = void 0;
    exports.OrumIoConfigSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pandaDocConfig.js
var require_pandaDocConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pandaDocConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PandaDocConfigSerializer = void 0;
    exports.PandaDocConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/portIoConfig.js
var require_portIoConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/portIoConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PortIoConfigSerializer = void 0;
    exports.PortIoConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rutterConfig.js
var require_rutterConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rutterConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RutterConfigSerializer = void 0;
    exports.RutterConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/segmentConfig.js
var require_segmentConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/segmentConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SegmentConfigSerializer = void 0;
    exports.SegmentConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/shopifyConfig.js
var require_shopifyConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/shopifyConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShopifyConfigSerializer = void 0;
    exports.ShopifyConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/slackConfig.js
var require_slackConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/slackConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlackConfigSerializer = void 0;
    exports.SlackConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/stripeConfig.js
var require_stripeConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/stripeConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StripeConfigSerializer = void 0;
    exports.StripeConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/svixConfig.js
var require_svixConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/svixConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SvixConfigSerializer = void 0;
    exports.SvixConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/tailscaleConfig.js
var require_tailscaleConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/tailscaleConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TailscaleConfigSerializer = void 0;
    exports.TailscaleConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"],
          timestampGraceSeconds: object["timestampGraceSeconds"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret,
          timestampGraceSeconds: self.timestampGraceSeconds
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/telnyxConfig.js
var require_telnyxConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/telnyxConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelnyxConfigSerializer = void 0;
    exports.TelnyxConfigSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/vapiConfig.js
var require_vapiConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/vapiConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VapiConfigSerializer = void 0;
    exports.VapiConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/veriffConfig.js
var require_veriffConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/veriffConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VeriffConfigSerializer = void 0;
    exports.VeriffConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/vgsConfig.js
var require_vgsConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/vgsConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VgsConfigSerializer = void 0;
    exports.VgsConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/zoomConfig.js
var require_zoomConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/zoomConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ZoomConfigSerializer = void 0;
    exports.ZoomConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestSourceIn.js
var require_ingestSourceIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestSourceIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestSourceInSerializer = void 0;
    var adobeSignConfig_1 = require_adobeSignConfig();
    var airwallexConfig_1 = require_airwallexConfig();
    var checkbookConfig_1 = require_checkbookConfig();
    var cronConfig_1 = require_cronConfig();
    var docusignConfig_1 = require_docusignConfig();
    var easypostConfig_1 = require_easypostConfig();
    var githubConfig_1 = require_githubConfig();
    var hubspotConfig_1 = require_hubspotConfig();
    var metaConfig_1 = require_metaConfig();
    var nangoConfig_1 = require_nangoConfig();
    var openClawConfig_1 = require_openClawConfig();
    var orumIoConfig_1 = require_orumIoConfig();
    var pandaDocConfig_1 = require_pandaDocConfig();
    var portIoConfig_1 = require_portIoConfig();
    var rutterConfig_1 = require_rutterConfig();
    var segmentConfig_1 = require_segmentConfig();
    var shopifyConfig_1 = require_shopifyConfig();
    var slackConfig_1 = require_slackConfig();
    var stripeConfig_1 = require_stripeConfig();
    var svixConfig_1 = require_svixConfig();
    var tailscaleConfig_1 = require_tailscaleConfig();
    var telnyxConfig_1 = require_telnyxConfig();
    var vapiConfig_1 = require_vapiConfig();
    var veriffConfig_1 = require_veriffConfig();
    var vgsConfig_1 = require_vgsConfig();
    var zoomConfig_1 = require_zoomConfig();
    exports.IngestSourceInSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "generic-webhook":
              return {};
            case "cron":
              return cronConfig_1.CronConfigSerializer._fromJsonObject(object["config"]);
            case "adobe-sign":
              return adobeSignConfig_1.AdobeSignConfigSerializer._fromJsonObject(object["config"]);
            case "beehiiv":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "brex":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "checkbook":
              return checkbookConfig_1.CheckbookConfigSerializer._fromJsonObject(object["config"]);
            case "clerk":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "docusign":
              return docusignConfig_1.DocusignConfigSerializer._fromJsonObject(object["config"]);
            case "easypost":
              return easypostConfig_1.EasypostConfigSerializer._fromJsonObject(object["config"]);
            case "github":
              return githubConfig_1.GithubConfigSerializer._fromJsonObject(object["config"]);
            case "guesty":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "hubspot":
              return hubspotConfig_1.HubspotConfigSerializer._fromJsonObject(object["config"]);
            case "incident-io":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "lithic":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "meta":
              return metaConfig_1.MetaConfigSerializer._fromJsonObject(object["config"]);
            case "nango":
              return nangoConfig_1.NangoConfigSerializer._fromJsonObject(object["config"]);
            case "nash":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "openclaw":
              return openClawConfig_1.OpenClawConfigSerializer._fromJsonObject(object["config"]);
            case "orum-io":
              return orumIoConfig_1.OrumIoConfigSerializer._fromJsonObject(object["config"]);
            case "panda-doc":
              return pandaDocConfig_1.PandaDocConfigSerializer._fromJsonObject(object["config"]);
            case "port-io":
              return portIoConfig_1.PortIoConfigSerializer._fromJsonObject(object["config"]);
            case "pleo":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "psi-fi":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "replicate":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "resend":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "rutter":
              return rutterConfig_1.RutterConfigSerializer._fromJsonObject(object["config"]);
            case "safebase":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "sardine":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "segment":
              return segmentConfig_1.SegmentConfigSerializer._fromJsonObject(object["config"]);
            case "shopify":
              return shopifyConfig_1.ShopifyConfigSerializer._fromJsonObject(object["config"]);
            case "slack":
              return slackConfig_1.SlackConfigSerializer._fromJsonObject(object["config"]);
            case "stripe":
              return stripeConfig_1.StripeConfigSerializer._fromJsonObject(object["config"]);
            case "stych":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "svix":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "zoom":
              return zoomConfig_1.ZoomConfigSerializer._fromJsonObject(object["config"]);
            case "tailscale":
              return tailscaleConfig_1.TailscaleConfigSerializer._fromJsonObject(object["config"]);
            case "telnyx":
              return telnyxConfig_1.TelnyxConfigSerializer._fromJsonObject(object["config"]);
            case "vapi":
              return vapiConfig_1.VapiConfigSerializer._fromJsonObject(object["config"]);
            case "open-ai":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "render":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "veriff":
              return veriffConfig_1.VeriffConfigSerializer._fromJsonObject(object["config"]);
            case "airwallex":
              return airwallexConfig_1.AirwallexConfigSerializer._fromJsonObject(object["config"]);
            case "vgs":
              return vgsConfig_1.VgsConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        __name(getConfig, "getConfig");
        return {
          type,
          config: getConfig(type),
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "generic-webhook":
            config = {};
            break;
          case "cron":
            config = cronConfig_1.CronConfigSerializer._toJsonObject(self.config);
            break;
          case "adobe-sign":
            config = adobeSignConfig_1.AdobeSignConfigSerializer._toJsonObject(self.config);
            break;
          case "beehiiv":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "brex":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "checkbook":
            config = checkbookConfig_1.CheckbookConfigSerializer._toJsonObject(self.config);
            break;
          case "clerk":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "docusign":
            config = docusignConfig_1.DocusignConfigSerializer._toJsonObject(self.config);
            break;
          case "easypost":
            config = easypostConfig_1.EasypostConfigSerializer._toJsonObject(self.config);
            break;
          case "github":
            config = githubConfig_1.GithubConfigSerializer._toJsonObject(self.config);
            break;
          case "guesty":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "hubspot":
            config = hubspotConfig_1.HubspotConfigSerializer._toJsonObject(self.config);
            break;
          case "incident-io":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "lithic":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "meta":
            config = metaConfig_1.MetaConfigSerializer._toJsonObject(self.config);
            break;
          case "nango":
            config = nangoConfig_1.NangoConfigSerializer._toJsonObject(self.config);
            break;
          case "nash":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "openclaw":
            config = openClawConfig_1.OpenClawConfigSerializer._toJsonObject(self.config);
            break;
          case "orum-io":
            config = orumIoConfig_1.OrumIoConfigSerializer._toJsonObject(self.config);
            break;
          case "panda-doc":
            config = pandaDocConfig_1.PandaDocConfigSerializer._toJsonObject(self.config);
            break;
          case "port-io":
            config = portIoConfig_1.PortIoConfigSerializer._toJsonObject(self.config);
            break;
          case "pleo":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "psi-fi":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "replicate":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "resend":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "rutter":
            config = rutterConfig_1.RutterConfigSerializer._toJsonObject(self.config);
            break;
          case "safebase":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "sardine":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "segment":
            config = segmentConfig_1.SegmentConfigSerializer._toJsonObject(self.config);
            break;
          case "shopify":
            config = shopifyConfig_1.ShopifyConfigSerializer._toJsonObject(self.config);
            break;
          case "slack":
            config = slackConfig_1.SlackConfigSerializer._toJsonObject(self.config);
            break;
          case "stripe":
            config = stripeConfig_1.StripeConfigSerializer._toJsonObject(self.config);
            break;
          case "stych":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "svix":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "zoom":
            config = zoomConfig_1.ZoomConfigSerializer._toJsonObject(self.config);
            break;
          case "tailscale":
            config = tailscaleConfig_1.TailscaleConfigSerializer._toJsonObject(self.config);
            break;
          case "telnyx":
            config = telnyxConfig_1.TelnyxConfigSerializer._toJsonObject(self.config);
            break;
          case "vapi":
            config = vapiConfig_1.VapiConfigSerializer._toJsonObject(self.config);
            break;
          case "open-ai":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "render":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "veriff":
            config = veriffConfig_1.VeriffConfigSerializer._toJsonObject(self.config);
            break;
          case "airwallex":
            config = airwallexConfig_1.AirwallexConfigSerializer._toJsonObject(self.config);
            break;
          case "vgs":
            config = vgsConfig_1.VgsConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/adobeSignConfigOut.js
var require_adobeSignConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/adobeSignConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdobeSignConfigOutSerializer = void 0;
    exports.AdobeSignConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/airwallexConfigOut.js
var require_airwallexConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/airwallexConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AirwallexConfigOutSerializer = void 0;
    exports.AirwallexConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/checkbookConfigOut.js
var require_checkbookConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/checkbookConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckbookConfigOutSerializer = void 0;
    exports.CheckbookConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/docusignConfigOut.js
var require_docusignConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/docusignConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocusignConfigOutSerializer = void 0;
    exports.DocusignConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/easypostConfigOut.js
var require_easypostConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/easypostConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EasypostConfigOutSerializer = void 0;
    exports.EasypostConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/githubConfigOut.js
var require_githubConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/githubConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GithubConfigOutSerializer = void 0;
    exports.GithubConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/hubspotConfigOut.js
var require_hubspotConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/hubspotConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HubspotConfigOutSerializer = void 0;
    exports.HubspotConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/metaConfigOut.js
var require_metaConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/metaConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MetaConfigOutSerializer = void 0;
    exports.MetaConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/nangoConfigOut.js
var require_nangoConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/nangoConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NangoConfigOutSerializer = void 0;
    exports.NangoConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/openClawConfigOut.js
var require_openClawConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/openClawConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenClawConfigOutSerializer = void 0;
    exports.OpenClawConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/orumIoConfigOut.js
var require_orumIoConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/orumIoConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OrumIoConfigOutSerializer = void 0;
    exports.OrumIoConfigOutSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pandaDocConfigOut.js
var require_pandaDocConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pandaDocConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PandaDocConfigOutSerializer = void 0;
    exports.PandaDocConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/portIoConfigOut.js
var require_portIoConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/portIoConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PortIoConfigOutSerializer = void 0;
    exports.PortIoConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rutterConfigOut.js
var require_rutterConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rutterConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RutterConfigOutSerializer = void 0;
    exports.RutterConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/segmentConfigOut.js
var require_segmentConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/segmentConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SegmentConfigOutSerializer = void 0;
    exports.SegmentConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/shopifyConfigOut.js
var require_shopifyConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/shopifyConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShopifyConfigOutSerializer = void 0;
    exports.ShopifyConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/slackConfigOut.js
var require_slackConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/slackConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlackConfigOutSerializer = void 0;
    exports.SlackConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/stripeConfigOut.js
var require_stripeConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/stripeConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StripeConfigOutSerializer = void 0;
    exports.StripeConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/svixConfigOut.js
var require_svixConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/svixConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SvixConfigOutSerializer = void 0;
    exports.SvixConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/tailscaleConfigOut.js
var require_tailscaleConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/tailscaleConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TailscaleConfigOutSerializer = void 0;
    exports.TailscaleConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/telnyxConfigOut.js
var require_telnyxConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/telnyxConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelnyxConfigOutSerializer = void 0;
    exports.TelnyxConfigOutSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/vapiConfigOut.js
var require_vapiConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/vapiConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VapiConfigOutSerializer = void 0;
    exports.VapiConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/veriffConfigOut.js
var require_veriffConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/veriffConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VeriffConfigOutSerializer = void 0;
    exports.VeriffConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/vgsConfigOut.js
var require_vgsConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/vgsConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VgsConfigOutSerializer = void 0;
    exports.VgsConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/zoomConfigOut.js
var require_zoomConfigOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/zoomConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ZoomConfigOutSerializer = void 0;
    exports.ZoomConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestSourceOut.js
var require_ingestSourceOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ingestSourceOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestSourceOutSerializer = void 0;
    var adobeSignConfigOut_1 = require_adobeSignConfigOut();
    var airwallexConfigOut_1 = require_airwallexConfigOut();
    var checkbookConfigOut_1 = require_checkbookConfigOut();
    var cronConfig_1 = require_cronConfig();
    var docusignConfigOut_1 = require_docusignConfigOut();
    var easypostConfigOut_1 = require_easypostConfigOut();
    var githubConfigOut_1 = require_githubConfigOut();
    var hubspotConfigOut_1 = require_hubspotConfigOut();
    var metaConfigOut_1 = require_metaConfigOut();
    var nangoConfigOut_1 = require_nangoConfigOut();
    var openClawConfigOut_1 = require_openClawConfigOut();
    var orumIoConfigOut_1 = require_orumIoConfigOut();
    var pandaDocConfigOut_1 = require_pandaDocConfigOut();
    var portIoConfigOut_1 = require_portIoConfigOut();
    var rutterConfigOut_1 = require_rutterConfigOut();
    var segmentConfigOut_1 = require_segmentConfigOut();
    var shopifyConfigOut_1 = require_shopifyConfigOut();
    var slackConfigOut_1 = require_slackConfigOut();
    var stripeConfigOut_1 = require_stripeConfigOut();
    var svixConfigOut_1 = require_svixConfigOut();
    var tailscaleConfigOut_1 = require_tailscaleConfigOut();
    var telnyxConfigOut_1 = require_telnyxConfigOut();
    var vapiConfigOut_1 = require_vapiConfigOut();
    var veriffConfigOut_1 = require_veriffConfigOut();
    var vgsConfigOut_1 = require_vgsConfigOut();
    var zoomConfigOut_1 = require_zoomConfigOut();
    exports.IngestSourceOutSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "generic-webhook":
              return {};
            case "cron":
              return cronConfig_1.CronConfigSerializer._fromJsonObject(object["config"]);
            case "adobe-sign":
              return adobeSignConfigOut_1.AdobeSignConfigOutSerializer._fromJsonObject(object["config"]);
            case "beehiiv":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "brex":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "checkbook":
              return checkbookConfigOut_1.CheckbookConfigOutSerializer._fromJsonObject(object["config"]);
            case "clerk":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "docusign":
              return docusignConfigOut_1.DocusignConfigOutSerializer._fromJsonObject(object["config"]);
            case "easypost":
              return easypostConfigOut_1.EasypostConfigOutSerializer._fromJsonObject(object["config"]);
            case "github":
              return githubConfigOut_1.GithubConfigOutSerializer._fromJsonObject(object["config"]);
            case "guesty":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "hubspot":
              return hubspotConfigOut_1.HubspotConfigOutSerializer._fromJsonObject(object["config"]);
            case "incident-io":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "lithic":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "meta":
              return metaConfigOut_1.MetaConfigOutSerializer._fromJsonObject(object["config"]);
            case "nango":
              return nangoConfigOut_1.NangoConfigOutSerializer._fromJsonObject(object["config"]);
            case "nash":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "openclaw":
              return openClawConfigOut_1.OpenClawConfigOutSerializer._fromJsonObject(object["config"]);
            case "orum-io":
              return orumIoConfigOut_1.OrumIoConfigOutSerializer._fromJsonObject(object["config"]);
            case "panda-doc":
              return pandaDocConfigOut_1.PandaDocConfigOutSerializer._fromJsonObject(object["config"]);
            case "port-io":
              return portIoConfigOut_1.PortIoConfigOutSerializer._fromJsonObject(object["config"]);
            case "psi-fi":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "pleo":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "replicate":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "resend":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "rutter":
              return rutterConfigOut_1.RutterConfigOutSerializer._fromJsonObject(object["config"]);
            case "safebase":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "sardine":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "segment":
              return segmentConfigOut_1.SegmentConfigOutSerializer._fromJsonObject(object["config"]);
            case "shopify":
              return shopifyConfigOut_1.ShopifyConfigOutSerializer._fromJsonObject(object["config"]);
            case "slack":
              return slackConfigOut_1.SlackConfigOutSerializer._fromJsonObject(object["config"]);
            case "stripe":
              return stripeConfigOut_1.StripeConfigOutSerializer._fromJsonObject(object["config"]);
            case "stych":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "svix":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "zoom":
              return zoomConfigOut_1.ZoomConfigOutSerializer._fromJsonObject(object["config"]);
            case "tailscale":
              return tailscaleConfigOut_1.TailscaleConfigOutSerializer._fromJsonObject(object["config"]);
            case "telnyx":
              return telnyxConfigOut_1.TelnyxConfigOutSerializer._fromJsonObject(object["config"]);
            case "vapi":
              return vapiConfigOut_1.VapiConfigOutSerializer._fromJsonObject(object["config"]);
            case "open-ai":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "render":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "veriff":
              return veriffConfigOut_1.VeriffConfigOutSerializer._fromJsonObject(object["config"]);
            case "airwallex":
              return airwallexConfigOut_1.AirwallexConfigOutSerializer._fromJsonObject(object["config"]);
            case "vgs":
              return vgsConfigOut_1.VgsConfigOutSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        __name(getConfig, "getConfig");
        return {
          type,
          config: getConfig(type),
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          ingestUrl: object["ingestUrl"],
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "generic-webhook":
            config = {};
            break;
          case "cron":
            config = cronConfig_1.CronConfigSerializer._toJsonObject(self.config);
            break;
          case "adobe-sign":
            config = adobeSignConfigOut_1.AdobeSignConfigOutSerializer._toJsonObject(self.config);
            break;
          case "beehiiv":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "brex":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "checkbook":
            config = checkbookConfigOut_1.CheckbookConfigOutSerializer._toJsonObject(self.config);
            break;
          case "clerk":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "docusign":
            config = docusignConfigOut_1.DocusignConfigOutSerializer._toJsonObject(self.config);
            break;
          case "easypost":
            config = easypostConfigOut_1.EasypostConfigOutSerializer._toJsonObject(self.config);
            break;
          case "github":
            config = githubConfigOut_1.GithubConfigOutSerializer._toJsonObject(self.config);
            break;
          case "guesty":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "hubspot":
            config = hubspotConfigOut_1.HubspotConfigOutSerializer._toJsonObject(self.config);
            break;
          case "incident-io":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "lithic":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "meta":
            config = metaConfigOut_1.MetaConfigOutSerializer._toJsonObject(self.config);
            break;
          case "nango":
            config = nangoConfigOut_1.NangoConfigOutSerializer._toJsonObject(self.config);
            break;
          case "nash":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "openclaw":
            config = openClawConfigOut_1.OpenClawConfigOutSerializer._toJsonObject(self.config);
            break;
          case "orum-io":
            config = orumIoConfigOut_1.OrumIoConfigOutSerializer._toJsonObject(self.config);
            break;
          case "panda-doc":
            config = pandaDocConfigOut_1.PandaDocConfigOutSerializer._toJsonObject(self.config);
            break;
          case "port-io":
            config = portIoConfigOut_1.PortIoConfigOutSerializer._toJsonObject(self.config);
            break;
          case "psi-fi":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "pleo":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "replicate":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "resend":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "rutter":
            config = rutterConfigOut_1.RutterConfigOutSerializer._toJsonObject(self.config);
            break;
          case "safebase":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "sardine":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "segment":
            config = segmentConfigOut_1.SegmentConfigOutSerializer._toJsonObject(self.config);
            break;
          case "shopify":
            config = shopifyConfigOut_1.ShopifyConfigOutSerializer._toJsonObject(self.config);
            break;
          case "slack":
            config = slackConfigOut_1.SlackConfigOutSerializer._toJsonObject(self.config);
            break;
          case "stripe":
            config = stripeConfigOut_1.StripeConfigOutSerializer._toJsonObject(self.config);
            break;
          case "stych":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "svix":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "zoom":
            config = zoomConfigOut_1.ZoomConfigOutSerializer._toJsonObject(self.config);
            break;
          case "tailscale":
            config = tailscaleConfigOut_1.TailscaleConfigOutSerializer._toJsonObject(self.config);
            break;
          case "telnyx":
            config = telnyxConfigOut_1.TelnyxConfigOutSerializer._toJsonObject(self.config);
            break;
          case "vapi":
            config = vapiConfigOut_1.VapiConfigOutSerializer._toJsonObject(self.config);
            break;
          case "open-ai":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "render":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "veriff":
            config = veriffConfigOut_1.VeriffConfigOutSerializer._toJsonObject(self.config);
            break;
          case "airwallex":
            config = airwallexConfigOut_1.AirwallexConfigOutSerializer._toJsonObject(self.config);
            break;
          case "vgs":
            config = vgsConfigOut_1.VgsConfigOutSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          createdAt: self.createdAt,
          id: self.id,
          ingestUrl: self.ingestUrl,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseIngestSourceOut.js
var require_listResponseIngestSourceOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseIngestSourceOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseIngestSourceOutSerializer = void 0;
    var ingestSourceOut_1 = require_ingestSourceOut();
    exports.ListResponseIngestSourceOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => ingestSourceOut_1.IngestSourceOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rotateTokenOut.js
var require_rotateTokenOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rotateTokenOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RotateTokenOutSerializer = void 0;
    exports.RotateTokenOutSerializer = {
      _fromJsonObject(object) {
        return {
          ingestUrl: object["ingestUrl"]
        };
      },
      _toJsonObject(self) {
        return {
          ingestUrl: self.ingestUrl
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/ingestSource.js
var require_ingestSource = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/ingestSource.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestSource = void 0;
    var ingestSourceIn_1 = require_ingestSourceIn();
    var ingestSourceOut_1 = require_ingestSourceOut();
    var listResponseIngestSourceOut_1 = require_listResponseIngestSourceOut();
    var rotateTokenOut_1 = require_rotateTokenOut();
    var request_1 = require_request();
    var IngestSource = class {
      static {
        __name(this, "IngestSource");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source");
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseIngestSourceOut_1.ListResponseIngestSourceOutSerializer._fromJsonObject);
        });
      }
      create(ingestSourceIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(ingestSourceIn_1.IngestSourceInSerializer._toJsonObject(ingestSourceIn));
          return yield request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
        });
      }
      get(sourceId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}");
          request.setPathParam("source_id", sourceId);
          return yield request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
        });
      }
      update(sourceId, ingestSourceIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}");
          request.setPathParam("source_id", sourceId);
          request.setBody(ingestSourceIn_1.IngestSourceInSerializer._toJsonObject(ingestSourceIn));
          return yield request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
        });
      }
      delete(sourceId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/ingest/api/v1/source/{source_id}");
          request.setPathParam("source_id", sourceId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      rotateToken(sourceId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/token/rotate");
          request.setPathParam("source_id", sourceId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          return yield request.send(this.requestCtx, rotateTokenOut_1.RotateTokenOutSerializer._fromJsonObject);
        });
      }
    };
    exports.IngestSource = IngestSource;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/ingest.js
var require_ingest = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/ingest.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Ingest = void 0;
    var dashboardAccessOut_1 = require_dashboardAccessOut();
    var ingestSourceConsumerPortalAccessIn_1 = require_ingestSourceConsumerPortalAccessIn();
    var ingestEndpoint_1 = require_ingestEndpoint();
    var ingestSource_1 = require_ingestSource();
    var request_1 = require_request();
    var Ingest = class {
      static {
        __name(this, "Ingest");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get endpoint() {
        return new ingestEndpoint_1.IngestEndpoint(this.requestCtx);
      }
      get source() {
        return new ingestSource_1.IngestSource(this.requestCtx);
      }
      dashboard(sourceId, ingestSourceConsumerPortalAccessIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/dashboard");
          request.setPathParam("source_id", sourceId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(ingestSourceConsumerPortalAccessIn_1.IngestSourceConsumerPortalAccessInSerializer._toJsonObject(ingestSourceConsumerPortalAccessIn));
          return yield request.send(this.requestCtx, dashboardAccessOut_1.DashboardAccessOutSerializer._fromJsonObject);
        });
      }
    };
    exports.Ingest = Ingest;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/integrationIn.js
var require_integrationIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/integrationIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrationInSerializer = void 0;
    exports.IntegrationInSerializer = {
      _fromJsonObject(object) {
        return {
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/integrationKeyOut.js
var require_integrationKeyOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/integrationKeyOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrationKeyOutSerializer = void 0;
    exports.IntegrationKeyOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/integrationOut.js
var require_integrationOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/integrationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrationOutSerializer = void 0;
    exports.IntegrationOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          featureFlags: object["featureFlags"],
          id: object["id"],
          name: object["name"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          featureFlags: self.featureFlags,
          id: self.id,
          name: self.name,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/integrationUpdate.js
var require_integrationUpdate = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/integrationUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrationUpdateSerializer = void 0;
    exports.IntegrationUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseIntegrationOut.js
var require_listResponseIntegrationOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseIntegrationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseIntegrationOutSerializer = void 0;
    var integrationOut_1 = require_integrationOut();
    exports.ListResponseIntegrationOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => integrationOut_1.IntegrationOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => integrationOut_1.IntegrationOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/integration.js
var require_integration = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/integration.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Integration = void 0;
    var integrationIn_1 = require_integrationIn();
    var integrationKeyOut_1 = require_integrationKeyOut();
    var integrationOut_1 = require_integrationOut();
    var integrationUpdate_1 = require_integrationUpdate();
    var listResponseIntegrationOut_1 = require_listResponseIntegrationOut();
    var request_1 = require_request();
    var Integration = class {
      static {
        __name(this, "Integration");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(appId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration");
          request.setPathParam("app_id", appId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseIntegrationOut_1.ListResponseIntegrationOutSerializer._fromJsonObject);
        });
      }
      create(appId, integrationIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/integration");
          request.setPathParam("app_id", appId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(integrationIn_1.IntegrationInSerializer._toJsonObject(integrationIn));
          return yield request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
        });
      }
      get(appId, integId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration/{integ_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("integ_id", integId);
          return yield request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
        });
      }
      update(appId, integId, integrationUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/integration/{integ_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("integ_id", integId);
          request.setBody(integrationUpdate_1.IntegrationUpdateSerializer._toJsonObject(integrationUpdate));
          return yield request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
        });
      }
      delete(appId, integId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/integration/{integ_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("integ_id", integId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      rotateKey(appId, integId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/integration/{integ_id}/key/rotate");
          request.setPathParam("app_id", appId);
          request.setPathParam("integ_id", integId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          return yield request.send(this.requestCtx, integrationKeyOut_1.IntegrationKeyOutSerializer._fromJsonObject);
        });
      }
      getKey(appId, integId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration/{integ_id}/key");
          request.setPathParam("app_id", appId);
          request.setPathParam("integ_id", integId);
          return yield request.send(this.requestCtx, integrationKeyOut_1.IntegrationKeyOutSerializer._fromJsonObject);
        });
      }
    };
    exports.Integration = Integration;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/expungeAllContentsOut.js
var require_expungeAllContentsOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/expungeAllContentsOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExpungeAllContentsOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.ExpungeAllContentsOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseMessageOut.js
var require_listResponseMessageOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseMessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseMessageOutSerializer = void 0;
    var messageOut_1 = require_messageOut();
    exports.ListResponseMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageOut_1.MessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageOut_1.MessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messagePrecheckIn.js
var require_messagePrecheckIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messagePrecheckIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessagePrecheckInSerializer = void 0;
    exports.MessagePrecheckInSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          eventType: object["eventType"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          eventType: self.eventType
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messagePrecheckOut.js
var require_messagePrecheckOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messagePrecheckOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessagePrecheckOutSerializer = void 0;
    exports.MessagePrecheckOutSerializer = {
      _fromJsonObject(object) {
        return {
          active: object["active"]
        };
      },
      _toJsonObject(self) {
        return {
          active: self.active
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollingEndpointConsumerSeekIn.js
var require_pollingEndpointConsumerSeekIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollingEndpointConsumerSeekIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollingEndpointConsumerSeekInSerializer = void 0;
    exports.PollingEndpointConsumerSeekInSerializer = {
      _fromJsonObject(object) {
        return {
          after: new Date(object["after"])
        };
      },
      _toJsonObject(self) {
        return {
          after: self.after
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollingEndpointConsumerSeekOut.js
var require_pollingEndpointConsumerSeekOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollingEndpointConsumerSeekOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollingEndpointConsumerSeekOutSerializer = void 0;
    exports.PollingEndpointConsumerSeekOutSerializer = {
      _fromJsonObject(object) {
        return {
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          iterator: self.iterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollingEndpointMessageOut.js
var require_pollingEndpointMessageOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollingEndpointMessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollingEndpointMessageOutSerializer = void 0;
    exports.PollingEndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          headers: object["headers"],
          id: object["id"],
          payload: object["payload"],
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          headers: self.headers,
          id: self.id,
          payload: self.payload,
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollingEndpointOut.js
var require_pollingEndpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollingEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollingEndpointOutSerializer = void 0;
    var pollingEndpointMessageOut_1 = require_pollingEndpointMessageOut();
    exports.PollingEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => pollingEndpointMessageOut_1.PollingEndpointMessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => pollingEndpointMessageOut_1.PollingEndpointMessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/messagePoller.js
var require_messagePoller = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/messagePoller.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessagePoller = void 0;
    var pollingEndpointConsumerSeekIn_1 = require_pollingEndpointConsumerSeekIn();
    var pollingEndpointConsumerSeekOut_1 = require_pollingEndpointConsumerSeekOut();
    var pollingEndpointOut_1 = require_pollingEndpointOut();
    var request_1 = require_request();
    var MessagePoller = class {
      static {
        __name(this, "MessagePoller");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      poll(appId, sinkId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/poller/{sink_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("sink_id", sinkId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            event_type: options === null || options === void 0 ? void 0 : options.eventType,
            channel: options === null || options === void 0 ? void 0 : options.channel,
            after: options === null || options === void 0 ? void 0 : options.after
          });
          return yield request.send(this.requestCtx, pollingEndpointOut_1.PollingEndpointOutSerializer._fromJsonObject);
        });
      }
      consumerSeek(appId, sinkId, consumerId, pollingEndpointConsumerSeekIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}/seek");
          request.setPathParam("app_id", appId);
          request.setPathParam("sink_id", sinkId);
          request.setPathParam("consumer_id", consumerId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(pollingEndpointConsumerSeekIn_1.PollingEndpointConsumerSeekInSerializer._toJsonObject(pollingEndpointConsumerSeekIn));
          return yield request.send(this.requestCtx, pollingEndpointConsumerSeekOut_1.PollingEndpointConsumerSeekOutSerializer._fromJsonObject);
        });
      }
      consumerPoll(appId, sinkId, consumerId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("sink_id", sinkId);
          request.setPathParam("consumer_id", consumerId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator
          });
          return yield request.send(this.requestCtx, pollingEndpointOut_1.PollingEndpointOutSerializer._fromJsonObject);
        });
      }
    };
    exports.MessagePoller = MessagePoller;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageIn.js
var require_messageIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageInSerializer = void 0;
    var applicationIn_1 = require_applicationIn();
    exports.MessageInSerializer = {
      _fromJsonObject(object) {
        return {
          application: object["application"] != null ? applicationIn_1.ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          payload: object["payload"],
          payloadRetentionHours: object["payloadRetentionHours"],
          payloadRetentionPeriod: object["payloadRetentionPeriod"],
          tags: object["tags"],
          transformationsParams: object["transformationsParams"]
        };
      },
      _toJsonObject(self) {
        return {
          application: self.application != null ? applicationIn_1.ApplicationInSerializer._toJsonObject(self.application) : void 0,
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          payload: self.payload,
          payloadRetentionHours: self.payloadRetentionHours,
          payloadRetentionPeriod: self.payloadRetentionPeriod,
          tags: self.tags,
          transformationsParams: self.transformationsParams
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/message.js
var require_message = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/message.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.messageInRaw = exports.Message = void 0;
    var expungeAllContentsOut_1 = require_expungeAllContentsOut();
    var listResponseMessageOut_1 = require_listResponseMessageOut();
    var messageOut_1 = require_messageOut();
    var messagePrecheckIn_1 = require_messagePrecheckIn();
    var messagePrecheckOut_1 = require_messagePrecheckOut();
    var messagePoller_1 = require_messagePoller();
    var request_1 = require_request();
    var messageIn_1 = require_messageIn();
    var Message = class {
      static {
        __name(this, "Message");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get poller() {
        return new messagePoller_1.MessagePoller(this.requestCtx);
      }
      list(appId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg");
          request.setPathParam("app_id", appId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            channel: options === null || options === void 0 ? void 0 : options.channel,
            before: options === null || options === void 0 ? void 0 : options.before,
            after: options === null || options === void 0 ? void 0 : options.after,
            with_content: options === null || options === void 0 ? void 0 : options.withContent,
            tag: options === null || options === void 0 ? void 0 : options.tag,
            event_types: options === null || options === void 0 ? void 0 : options.eventTypes
          });
          return yield request.send(this.requestCtx, listResponseMessageOut_1.ListResponseMessageOutSerializer._fromJsonObject);
        });
      }
      create(appId, messageIn, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg");
          request.setPathParam("app_id", appId);
          request.setQueryParams({
            with_content: false
          });
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(messageIn_1.MessageInSerializer._toJsonObject(messageIn));
          const response = yield request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
          if ((_a = options === null || options === void 0 ? void 0 : options.withContent) !== null && _a !== void 0 ? _a : true) {
            response.payload = messageIn.payload;
          }
          return response;
        });
      }
      precheck(appId, messagePrecheckIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/precheck/active");
          request.setPathParam("app_id", appId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(messagePrecheckIn_1.MessagePrecheckInSerializer._toJsonObject(messagePrecheckIn));
          return yield request.send(this.requestCtx, messagePrecheckOut_1.MessagePrecheckOutSerializer._fromJsonObject);
        });
      }
      get(appId, msgId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("msg_id", msgId);
          request.setQueryParams({
            with_content: options === null || options === void 0 ? void 0 : options.withContent
          });
          return yield request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
        });
      }
      expungeContent(appId, msgId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/msg/{msg_id}/content");
          request.setPathParam("app_id", appId);
          request.setPathParam("msg_id", msgId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      expungeAllContents(appId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/expunge-all-contents");
          request.setPathParam("app_id", appId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          return yield request.send(this.requestCtx, expungeAllContentsOut_1.ExpungeAllContentsOutSerializer._fromJsonObject);
        });
      }
    };
    exports.Message = Message;
    function messageInRaw(eventType, payload, contentType) {
      const headers = contentType ? { "content-type": contentType } : void 0;
      return {
        eventType,
        payload: {},
        transformationsParams: {
          rawPayload: payload,
          headers
        }
      };
    }
    __name(messageInRaw, "messageInRaw");
    exports.messageInRaw = messageInRaw;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/emptyResponse.js
var require_emptyResponse = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/emptyResponse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmptyResponseSerializer = void 0;
    exports.EmptyResponseSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageStatusText.js
var require_messageStatusText = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageStatusText.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageStatusTextSerializer = exports.MessageStatusText = void 0;
    var MessageStatusText;
    (function(MessageStatusText2) {
      MessageStatusText2["Success"] = "success";
      MessageStatusText2["Pending"] = "pending";
      MessageStatusText2["Fail"] = "fail";
      MessageStatusText2["Sending"] = "sending";
      MessageStatusText2["Canceled"] = "canceled";
    })(MessageStatusText = exports.MessageStatusText || (exports.MessageStatusText = {}));
    exports.MessageStatusTextSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointMessageOut.js
var require_endpointMessageOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointMessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointMessageOutSerializer = void 0;
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports.EndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          id: object["id"],
          nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
          payload: object["payload"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          id: self.id,
          nextAttempt: self.nextAttempt,
          payload: self.payload,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseEndpointMessageOut.js
var require_listResponseEndpointMessageOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseEndpointMessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseEndpointMessageOutSerializer = void 0;
    var endpointMessageOut_1 = require_endpointMessageOut();
    exports.ListResponseEndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => endpointMessageOut_1.EndpointMessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => endpointMessageOut_1.EndpointMessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageAttemptTriggerType.js
var require_messageAttemptTriggerType = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageAttemptTriggerType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageAttemptTriggerTypeSerializer = exports.MessageAttemptTriggerType = void 0;
    var MessageAttemptTriggerType;
    (function(MessageAttemptTriggerType2) {
      MessageAttemptTriggerType2[MessageAttemptTriggerType2["Scheduled"] = 0] = "Scheduled";
      MessageAttemptTriggerType2[MessageAttemptTriggerType2["Manual"] = 1] = "Manual";
    })(MessageAttemptTriggerType = exports.MessageAttemptTriggerType || (exports.MessageAttemptTriggerType = {}));
    exports.MessageAttemptTriggerTypeSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageAttemptOut.js
var require_messageAttemptOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageAttemptOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageAttemptOutSerializer = void 0;
    var messageAttemptTriggerType_1 = require_messageAttemptTriggerType();
    var messageOut_1 = require_messageOut();
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports.MessageAttemptOutSerializer = {
      _fromJsonObject(object) {
        return {
          endpointId: object["endpointId"],
          id: object["id"],
          msg: object["msg"] != null ? messageOut_1.MessageOutSerializer._fromJsonObject(object["msg"]) : void 0,
          msgId: object["msgId"],
          response: object["response"],
          responseDurationMs: object["responseDurationMs"],
          responseStatusCode: object["responseStatusCode"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          timestamp: new Date(object["timestamp"]),
          triggerType: messageAttemptTriggerType_1.MessageAttemptTriggerTypeSerializer._fromJsonObject(object["triggerType"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          endpointId: self.endpointId,
          id: self.id,
          msg: self.msg != null ? messageOut_1.MessageOutSerializer._toJsonObject(self.msg) : void 0,
          msgId: self.msgId,
          response: self.response,
          responseDurationMs: self.responseDurationMs,
          responseStatusCode: self.responseStatusCode,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          timestamp: self.timestamp,
          triggerType: messageAttemptTriggerType_1.MessageAttemptTriggerTypeSerializer._toJsonObject(self.triggerType),
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseMessageAttemptOut.js
var require_listResponseMessageAttemptOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseMessageAttemptOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseMessageAttemptOutSerializer = void 0;
    var messageAttemptOut_1 = require_messageAttemptOut();
    exports.ListResponseMessageAttemptOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageAttemptOut_1.MessageAttemptOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageAttemptOut_1.MessageAttemptOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageEndpointOut.js
var require_messageEndpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/messageEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageEndpointOutSerializer = void 0;
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports.MessageEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
          rateLimit: object["rateLimit"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          nextAttempt: self.nextAttempt,
          rateLimit: self.rateLimit,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          throttleRate: self.throttleRate,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseMessageEndpointOut.js
var require_listResponseMessageEndpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseMessageEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseMessageEndpointOutSerializer = void 0;
    var messageEndpointOut_1 = require_messageEndpointOut();
    exports.ListResponseMessageEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageEndpointOut_1.MessageEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageEndpointOut_1.MessageEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/messageAttempt.js
var require_messageAttempt = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/messageAttempt.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageAttempt = void 0;
    var emptyResponse_1 = require_emptyResponse();
    var listResponseEndpointMessageOut_1 = require_listResponseEndpointMessageOut();
    var listResponseMessageAttemptOut_1 = require_listResponseMessageAttemptOut();
    var listResponseMessageEndpointOut_1 = require_listResponseMessageEndpointOut();
    var messageAttemptOut_1 = require_messageAttemptOut();
    var request_1 = require_request();
    var MessageAttempt = class {
      static {
        __name(this, "MessageAttempt");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      listByEndpoint(appId, endpointId, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/attempt/endpoint/{endpoint_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            status: options === null || options === void 0 ? void 0 : options.status,
            status_code_class: options === null || options === void 0 ? void 0 : options.statusCodeClass,
            channel: options === null || options === void 0 ? void 0 : options.channel,
            tag: options === null || options === void 0 ? void 0 : options.tag,
            before: options === null || options === void 0 ? void 0 : options.before,
            after: options === null || options === void 0 ? void 0 : options.after,
            with_content: options === null || options === void 0 ? void 0 : options.withContent,
            with_msg: options === null || options === void 0 ? void 0 : options.withMsg,
            expanded_statuses: (_a = options === null || options === void 0 ? void 0 : options.expandedStatuses) !== null && _a !== void 0 ? _a : true,
            event_types: options === null || options === void 0 ? void 0 : options.eventTypes
          });
          return yield request.send(this.requestCtx, listResponseMessageAttemptOut_1.ListResponseMessageAttemptOutSerializer._fromJsonObject);
        });
      }
      listByMsg(appId, msgId, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/attempt/msg/{msg_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("msg_id", msgId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            status: options === null || options === void 0 ? void 0 : options.status,
            status_code_class: options === null || options === void 0 ? void 0 : options.statusCodeClass,
            channel: options === null || options === void 0 ? void 0 : options.channel,
            tag: options === null || options === void 0 ? void 0 : options.tag,
            endpoint_id: options === null || options === void 0 ? void 0 : options.endpointId,
            before: options === null || options === void 0 ? void 0 : options.before,
            after: options === null || options === void 0 ? void 0 : options.after,
            with_content: options === null || options === void 0 ? void 0 : options.withContent,
            expanded_statuses: (_a = options === null || options === void 0 ? void 0 : options.expandedStatuses) !== null && _a !== void 0 ? _a : true,
            event_types: options === null || options === void 0 ? void 0 : options.eventTypes
          });
          return yield request.send(this.requestCtx, listResponseMessageAttemptOut_1.ListResponseMessageAttemptOutSerializer._fromJsonObject);
        });
      }
      listAttemptedMessages(appId, endpointId, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/msg");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            channel: options === null || options === void 0 ? void 0 : options.channel,
            tag: options === null || options === void 0 ? void 0 : options.tag,
            status: options === null || options === void 0 ? void 0 : options.status,
            before: options === null || options === void 0 ? void 0 : options.before,
            after: options === null || options === void 0 ? void 0 : options.after,
            with_content: options === null || options === void 0 ? void 0 : options.withContent,
            expanded_statuses: (_a = options === null || options === void 0 ? void 0 : options.expandedStatuses) !== null && _a !== void 0 ? _a : true,
            event_types: options === null || options === void 0 ? void 0 : options.eventTypes
          });
          return yield request.send(this.requestCtx, listResponseEndpointMessageOut_1.ListResponseEndpointMessageOutSerializer._fromJsonObject);
        });
      }
      listAttemptedDestinations(appId, msgId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}/endpoint");
          request.setPathParam("app_id", appId);
          request.setPathParam("msg_id", msgId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator
          });
          return yield request.send(this.requestCtx, listResponseMessageEndpointOut_1.ListResponseMessageEndpointOutSerializer._fromJsonObject);
        });
      }
      get(appId, msgId, attemptId, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("msg_id", msgId);
          request.setPathParam("attempt_id", attemptId);
          request.setQueryParams({
            expanded_statuses: (_a = options === null || options === void 0 ? void 0 : options.expandedStatuses) !== null && _a !== void 0 ? _a : true
          });
          return yield request.send(this.requestCtx, messageAttemptOut_1.MessageAttemptOutSerializer._fromJsonObject);
        });
      }
      expungeContent(appId, msgId, attemptId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}/content");
          request.setPathParam("app_id", appId);
          request.setPathParam("msg_id", msgId);
          request.setPathParam("attempt_id", attemptId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      resend(appId, msgId, endpointId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/{msg_id}/endpoint/{endpoint_id}/resend");
          request.setPathParam("app_id", appId);
          request.setPathParam("msg_id", msgId);
          request.setPathParam("endpoint_id", endpointId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          return yield request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
        });
      }
    };
    exports.MessageAttempt = MessageAttempt;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointOut.js
var require_operationalWebhookEndpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointOutSerializer = void 0;
    exports.OperationalWebhookEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseOperationalWebhookEndpointOut.js
var require_listResponseOperationalWebhookEndpointOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseOperationalWebhookEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseOperationalWebhookEndpointOutSerializer = void 0;
    var operationalWebhookEndpointOut_1 = require_operationalWebhookEndpointOut();
    exports.ListResponseOperationalWebhookEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointHeadersIn.js
var require_operationalWebhookEndpointHeadersIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointHeadersIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointHeadersInSerializer = void 0;
    exports.OperationalWebhookEndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointHeadersOut.js
var require_operationalWebhookEndpointHeadersOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointHeadersOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointHeadersOutSerializer = void 0;
    exports.OperationalWebhookEndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointIn.js
var require_operationalWebhookEndpointIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointInSerializer = void 0;
    exports.OperationalWebhookEndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          throttleRate: self.throttleRate,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointSecretIn.js
var require_operationalWebhookEndpointSecretIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointSecretIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointSecretInSerializer = void 0;
    exports.OperationalWebhookEndpointSecretInSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointSecretOut.js
var require_operationalWebhookEndpointSecretOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointSecretOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointSecretOutSerializer = void 0;
    exports.OperationalWebhookEndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointUpdate.js
var require_operationalWebhookEndpointUpdate = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/operationalWebhookEndpointUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointUpdateSerializer = void 0;
    exports.OperationalWebhookEndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          throttleRate: object["throttleRate"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          throttleRate: self.throttleRate,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/operationalWebhookEndpoint.js
var require_operationalWebhookEndpoint = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/operationalWebhookEndpoint.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpoint = void 0;
    var listResponseOperationalWebhookEndpointOut_1 = require_listResponseOperationalWebhookEndpointOut();
    var operationalWebhookEndpointHeadersIn_1 = require_operationalWebhookEndpointHeadersIn();
    var operationalWebhookEndpointHeadersOut_1 = require_operationalWebhookEndpointHeadersOut();
    var operationalWebhookEndpointIn_1 = require_operationalWebhookEndpointIn();
    var operationalWebhookEndpointOut_1 = require_operationalWebhookEndpointOut();
    var operationalWebhookEndpointSecretIn_1 = require_operationalWebhookEndpointSecretIn();
    var operationalWebhookEndpointSecretOut_1 = require_operationalWebhookEndpointSecretOut();
    var operationalWebhookEndpointUpdate_1 = require_operationalWebhookEndpointUpdate();
    var request_1 = require_request();
    var OperationalWebhookEndpoint = class {
      static {
        __name(this, "OperationalWebhookEndpoint");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint");
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseOperationalWebhookEndpointOut_1.ListResponseOperationalWebhookEndpointOutSerializer._fromJsonObject);
        });
      }
      create(operationalWebhookEndpointIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/operational-webhook/endpoint");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(operationalWebhookEndpointIn_1.OperationalWebhookEndpointInSerializer._toJsonObject(operationalWebhookEndpointIn));
          return yield request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
        });
      }
      get(endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
        });
      }
      update(endpointId, operationalWebhookEndpointUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(operationalWebhookEndpointUpdate_1.OperationalWebhookEndpointUpdateSerializer._toJsonObject(operationalWebhookEndpointUpdate));
          return yield request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
        });
      }
      delete(endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
          request.setPathParam("endpoint_id", endpointId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      getSecret(endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret");
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, operationalWebhookEndpointSecretOut_1.OperationalWebhookEndpointSecretOutSerializer._fromJsonObject);
        });
      }
      rotateSecret(endpointId, operationalWebhookEndpointSecretIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret/rotate");
          request.setPathParam("endpoint_id", endpointId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(operationalWebhookEndpointSecretIn_1.OperationalWebhookEndpointSecretInSerializer._toJsonObject(operationalWebhookEndpointSecretIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      getHeaders(endpointId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
          request.setPathParam("endpoint_id", endpointId);
          return yield request.send(this.requestCtx, operationalWebhookEndpointHeadersOut_1.OperationalWebhookEndpointHeadersOutSerializer._fromJsonObject);
        });
      }
      updateHeaders(endpointId, operationalWebhookEndpointHeadersIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(operationalWebhookEndpointHeadersIn_1.OperationalWebhookEndpointHeadersInSerializer._toJsonObject(operationalWebhookEndpointHeadersIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
    };
    exports.OperationalWebhookEndpoint = OperationalWebhookEndpoint;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/operationalWebhook.js
var require_operationalWebhook = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/operationalWebhook.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhook = void 0;
    var operationalWebhookEndpoint_1 = require_operationalWebhookEndpoint();
    var OperationalWebhook = class {
      static {
        __name(this, "OperationalWebhook");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get endpoint() {
        return new operationalWebhookEndpoint_1.OperationalWebhookEndpoint(this.requestCtx);
      }
    };
    exports.OperationalWebhook = OperationalWebhook;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/aggregateEventTypesOut.js
var require_aggregateEventTypesOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/aggregateEventTypesOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AggregateEventTypesOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.AggregateEventTypesOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appUsageStatsIn.js
var require_appUsageStatsIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appUsageStatsIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppUsageStatsInSerializer = void 0;
    exports.AppUsageStatsInSerializer = {
      _fromJsonObject(object) {
        return {
          appIds: object["appIds"],
          since: new Date(object["since"]),
          until: new Date(object["until"])
        };
      },
      _toJsonObject(self) {
        return {
          appIds: self.appIds,
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appUsageStatsOut.js
var require_appUsageStatsOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/appUsageStatsOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppUsageStatsOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.AppUsageStatsOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
          unresolvedAppIds: object["unresolvedAppIds"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
          unresolvedAppIds: self.unresolvedAppIds,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/statistics.js
var require_statistics = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/statistics.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Statistics = void 0;
    var aggregateEventTypesOut_1 = require_aggregateEventTypesOut();
    var appUsageStatsIn_1 = require_appUsageStatsIn();
    var appUsageStatsOut_1 = require_appUsageStatsOut();
    var request_1 = require_request();
    var Statistics = class {
      static {
        __name(this, "Statistics");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      aggregateEventTypes() {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stats/usage/event-types");
          return yield request.send(this.requestCtx, aggregateEventTypesOut_1.AggregateEventTypesOutSerializer._fromJsonObject);
        });
      }
      aggregateAppStats(appUsageStatsIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stats/usage/app");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(appUsageStatsIn_1.AppUsageStatsInSerializer._toJsonObject(appUsageStatsIn));
          return yield request.send(this.requestCtx, appUsageStatsOut_1.AppUsageStatsOutSerializer._fromJsonObject);
        });
      }
    };
    exports.Statistics = Statistics;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/httpSinkHeadersPatchIn.js
var require_httpSinkHeadersPatchIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/httpSinkHeadersPatchIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpSinkHeadersPatchInSerializer = void 0;
    exports.HttpSinkHeadersPatchInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkTransformationOut.js
var require_sinkTransformationOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkTransformationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkTransformationOutSerializer = void 0;
    exports.SinkTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamEventTypeOut.js
var require_streamEventTypeOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamEventTypeOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamEventTypeOutSerializer = void 0;
    exports.StreamEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          createdAt: new Date(object["createdAt"]),
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          name: object["name"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          createdAt: self.createdAt,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags,
          name: self.name,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseStreamEventTypeOut.js
var require_listResponseStreamEventTypeOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseStreamEventTypeOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseStreamEventTypeOutSerializer = void 0;
    var streamEventTypeOut_1 = require_streamEventTypeOut();
    exports.ListResponseStreamEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamEventTypeOut_1.StreamEventTypeOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamEventTypeIn.js
var require_streamEventTypeIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamEventTypeIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamEventTypeInSerializer = void 0;
    exports.StreamEventTypeInSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamEventTypePatch.js
var require_streamEventTypePatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamEventTypePatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamEventTypePatchSerializer = void 0;
    exports.StreamEventTypePatchSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streamingEventType.js
var require_streamingEventType = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streamingEventType.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamingEventType = void 0;
    var listResponseStreamEventTypeOut_1 = require_listResponseStreamEventTypeOut();
    var streamEventTypeIn_1 = require_streamEventTypeIn();
    var streamEventTypeOut_1 = require_streamEventTypeOut();
    var streamEventTypePatch_1 = require_streamEventTypePatch();
    var request_1 = require_request();
    var StreamingEventType = class {
      static {
        __name(this, "StreamingEventType");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/event-type");
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order,
            include_archived: options === null || options === void 0 ? void 0 : options.includeArchived
          });
          return yield request.send(this.requestCtx, listResponseStreamEventTypeOut_1.ListResponseStreamEventTypeOutSerializer._fromJsonObject);
        });
      }
      create(streamEventTypeIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/event-type");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(streamEventTypeIn_1.StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn));
          return yield request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
        });
      }
      get(name) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/event-type/{name}");
          request.setPathParam("name", name);
          return yield request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
        });
      }
      update(name, streamEventTypeIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/event-type/{name}");
          request.setPathParam("name", name);
          request.setBody(streamEventTypeIn_1.StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn));
          return yield request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
        });
      }
      delete(name, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/event-type/{name}");
          request.setPathParam("name", name);
          request.setQueryParams({
            expunge: options === null || options === void 0 ? void 0 : options.expunge
          });
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      patch(name, streamEventTypePatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/event-type/{name}");
          request.setPathParam("name", name);
          request.setBody(streamEventTypePatch_1.StreamEventTypePatchSerializer._toJsonObject(streamEventTypePatch));
          return yield request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
        });
      }
    };
    exports.StreamingEventType = StreamingEventType;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventIn.js
var require_eventIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventInSerializer = void 0;
    exports.EventInSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          payload: object["payload"]
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          payload: self.payload
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamIn.js
var require_streamIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamInSerializer = void 0;
    exports.StreamInSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/createStreamEventsIn.js
var require_createStreamEventsIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/createStreamEventsIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CreateStreamEventsInSerializer = void 0;
    var eventIn_1 = require_eventIn();
    var streamIn_1 = require_streamIn();
    exports.CreateStreamEventsInSerializer = {
      _fromJsonObject(object) {
        return {
          events: object["events"].map((item) => eventIn_1.EventInSerializer._fromJsonObject(item)),
          stream: object["stream"] != null ? streamIn_1.StreamInSerializer._fromJsonObject(object["stream"]) : void 0
        };
      },
      _toJsonObject(self) {
        return {
          events: self.events.map((item) => eventIn_1.EventInSerializer._toJsonObject(item)),
          stream: self.stream != null ? streamIn_1.StreamInSerializer._toJsonObject(self.stream) : void 0
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/createStreamEventsOut.js
var require_createStreamEventsOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/createStreamEventsOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CreateStreamEventsOutSerializer = void 0;
    exports.CreateStreamEventsOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventOut.js
var require_eventOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventOutSerializer = void 0;
    exports.EventOutSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          payload: object["payload"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          payload: self.payload,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventStreamOut.js
var require_eventStreamOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventStreamOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventStreamOutSerializer = void 0;
    var eventOut_1 = require_eventOut();
    exports.EventStreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => eventOut_1.EventOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => eventOut_1.EventOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streamingEvents.js
var require_streamingEvents = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streamingEvents.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamingEvents = void 0;
    var createStreamEventsIn_1 = require_createStreamEventsIn();
    var createStreamEventsOut_1 = require_createStreamEventsOut();
    var eventStreamOut_1 = require_eventStreamOut();
    var request_1 = require_request();
    var StreamingEvents = class {
      static {
        __name(this, "StreamingEvents");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get(streamId, sinkId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/events");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            after: options === null || options === void 0 ? void 0 : options.after
          });
          return yield request.send(this.requestCtx, eventStreamOut_1.EventStreamOutSerializer._fromJsonObject);
        });
      }
      create(streamId, createStreamEventsIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/events");
          request.setPathParam("stream_id", streamId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(createStreamEventsIn_1.CreateStreamEventsInSerializer._toJsonObject(createStreamEventsIn));
          return yield request.send(this.requestCtx, createStreamEventsOut_1.CreateStreamEventsOutSerializer._fromJsonObject);
        });
      }
    };
    exports.StreamingEvents = StreamingEvents;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/azureBlobStorageConfig.js
var require_azureBlobStorageConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/azureBlobStorageConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AzureBlobStorageConfigSerializer = void 0;
    exports.AzureBlobStorageConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKey: object["accessKey"],
          account: object["account"],
          container: object["container"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKey: self.accessKey,
          account: self.account,
          container: self.container
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/bigQueryConfig.js
var require_bigQueryConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/bigQueryConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BigQueryConfigSerializer = void 0;
    exports.BigQueryConfigSerializer = {
      _fromJsonObject(object) {
        return {
          credentials: object["credentials"],
          datasetId: object["datasetId"],
          projectId: object["projectId"],
          tableId: object["tableId"]
        };
      },
      _toJsonObject(self) {
        return {
          credentials: self.credentials,
          datasetId: self.datasetId,
          projectId: self.projectId,
          tableId: self.tableId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/clickhouseConfig.js
var require_clickhouseConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/clickhouseConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClickhouseConfigSerializer = void 0;
    exports.ClickhouseConfigSerializer = {
      _fromJsonObject(object) {
        return {
          database: object["database"],
          password: object["password"],
          tableName: object["tableName"],
          url: object["url"],
          username: object["username"]
        };
      },
      _toJsonObject(self) {
        return {
          database: self.database,
          password: self.password,
          tableName: self.tableName,
          url: self.url,
          username: self.username
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventBridgeConfig.js
var require_eventBridgeConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventBridgeConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventBridgeConfigSerializer = void 0;
    exports.EventBridgeConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          detailType: object["detailType"],
          eventBusName: object["eventBusName"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          detailType: self.detailType,
          eventBusName: self.eventBusName,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/googleCloudPubSubConfig.js
var require_googleCloudPubSubConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/googleCloudPubSubConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoogleCloudPubSubConfigSerializer = void 0;
    exports.GoogleCloudPubSubConfigSerializer = {
      _fromJsonObject(object) {
        return {
          credentials: object["credentials"],
          projectId: object["projectId"],
          topicId: object["topicId"]
        };
      },
      _toJsonObject(self) {
        return {
          credentials: self.credentials,
          projectId: self.projectId,
          topicId: self.topicId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/googleCloudStorageConfig.js
var require_googleCloudStorageConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/googleCloudStorageConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoogleCloudStorageConfigSerializer = void 0;
    exports.GoogleCloudStorageConfigSerializer = {
      _fromJsonObject(object) {
        return {
          bucket: object["bucket"],
          credentials: object["credentials"]
        };
      },
      _toJsonObject(self) {
        return {
          bucket: self.bucket,
          credentials: self.credentials
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rabbitMqConfig.js
var require_rabbitMqConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rabbitMqConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RabbitMqConfigSerializer = void 0;
    exports.RabbitMqConfigSerializer = {
      _fromJsonObject(object) {
        return {
          routingKey: object["routingKey"],
          uri: object["uri"]
        };
      },
      _toJsonObject(self) {
        return {
          routingKey: self.routingKey,
          uri: self.uri
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/redshiftConfig.js
var require_redshiftConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/redshiftConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RedshiftConfigSerializer = void 0;
    exports.RedshiftConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          clusterIdentifier: object["clusterIdentifier"],
          dbName: object["dbName"],
          dbUser: object["dbUser"],
          region: object["region"],
          schemaName: object["schemaName"],
          secretAccessKey: object["secretAccessKey"],
          tableName: object["tableName"],
          workgroupName: object["workgroupName"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          clusterIdentifier: self.clusterIdentifier,
          dbName: self.dbName,
          dbUser: self.dbUser,
          region: self.region,
          schemaName: self.schemaName,
          secretAccessKey: self.secretAccessKey,
          tableName: self.tableName,
          workgroupName: self.workgroupName
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/s3Config.js
var require_s3Config = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/s3Config.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.S3ConfigSerializer = void 0;
    exports.S3ConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          bucket: object["bucket"],
          endpointUrl: object["endpointUrl"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          bucket: self.bucket,
          endpointUrl: self.endpointUrl,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkHttpConfig.js
var require_sinkHttpConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkHttpConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkHttpConfigSerializer = void 0;
    exports.SinkHttpConfigSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          key: object["key"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          key: self.key,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkOtelV1Config.js
var require_sinkOtelV1Config = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkOtelV1Config.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkOtelV1ConfigSerializer = void 0;
    exports.SinkOtelV1ConfigSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkStatus.js
var require_sinkStatus = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkStatus.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkStatusSerializer = exports.SinkStatus = void 0;
    var SinkStatus;
    (function(SinkStatus2) {
      SinkStatus2["Enabled"] = "enabled";
      SinkStatus2["Paused"] = "paused";
      SinkStatus2["Disabled"] = "disabled";
      SinkStatus2["Retrying"] = "retrying";
    })(SinkStatus = exports.SinkStatus || (exports.SinkStatus = {}));
    exports.SinkStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/snowflakeConfig.js
var require_snowflakeConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/snowflakeConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnowflakeConfigSerializer = void 0;
    exports.SnowflakeConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accountIdentifier: object["accountIdentifier"],
          dbName: object["dbName"],
          privateKey: object["privateKey"],
          schemaName: object["schemaName"],
          tableName: object["tableName"],
          userId: object["userId"]
        };
      },
      _toJsonObject(self) {
        return {
          accountIdentifier: self.accountIdentifier,
          dbName: self.dbName,
          privateKey: self.privateKey,
          schemaName: self.schemaName,
          tableName: self.tableName,
          userId: self.userId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/snsConfig.js
var require_snsConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/snsConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnsConfigSerializer = void 0;
    exports.SnsConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          endpointUrl: object["endpointUrl"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"],
          topicArn: object["topicArn"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          endpointUrl: self.endpointUrl,
          region: self.region,
          secretAccessKey: self.secretAccessKey,
          topicArn: self.topicArn
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sqsConfig.js
var require_sqsConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sqsConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SqsConfigSerializer = void 0;
    exports.SqsConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          endpointUrl: object["endpointUrl"],
          queueUrl: object["queueUrl"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          endpointUrl: self.endpointUrl,
          queueUrl: self.queueUrl,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamSinkOut.js
var require_streamSinkOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamSinkOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamSinkOutSerializer = void 0;
    var azureBlobStorageConfig_1 = require_azureBlobStorageConfig();
    var bigQueryConfig_1 = require_bigQueryConfig();
    var clickhouseConfig_1 = require_clickhouseConfig();
    var eventBridgeConfig_1 = require_eventBridgeConfig();
    var googleCloudPubSubConfig_1 = require_googleCloudPubSubConfig();
    var googleCloudStorageConfig_1 = require_googleCloudStorageConfig();
    var rabbitMqConfig_1 = require_rabbitMqConfig();
    var redshiftConfig_1 = require_redshiftConfig();
    var s3Config_1 = require_s3Config();
    var sinkHttpConfig_1 = require_sinkHttpConfig();
    var sinkOtelV1Config_1 = require_sinkOtelV1Config();
    var sinkStatus_1 = require_sinkStatus();
    var snowflakeConfig_1 = require_snowflakeConfig();
    var snsConfig_1 = require_snsConfig();
    var sqsConfig_1 = require_sqsConfig();
    exports.StreamSinkOutSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return sinkHttpConfig_1.SinkHttpConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return s3Config_1.S3ConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudPubSub":
              return googleCloudPubSubConfig_1.GoogleCloudPubSubConfigSerializer._fromJsonObject(object["config"]);
            case "sqs":
              return sqsConfig_1.SqsConfigSerializer._fromJsonObject(object["config"]);
            case "sns":
              return snsConfig_1.SnsConfigSerializer._fromJsonObject(object["config"]);
            case "bigQuery":
              return bigQueryConfig_1.BigQueryConfigSerializer._fromJsonObject(object["config"]);
            case "clickhouse":
              return clickhouseConfig_1.ClickhouseConfigSerializer._fromJsonObject(object["config"]);
            case "eventBridge":
              return eventBridgeConfig_1.EventBridgeConfigSerializer._fromJsonObject(object["config"]);
            case "snowflake":
              return snowflakeConfig_1.SnowflakeConfigSerializer._fromJsonObject(object["config"]);
            case "rabbitMq":
              return rabbitMqConfig_1.RabbitMqConfigSerializer._fromJsonObject(object["config"]);
            case "redshift":
              return redshiftConfig_1.RedshiftConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        __name(getConfig, "getConfig");
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          createdAt: new Date(object["createdAt"]),
          currentIterator: object["currentIterator"],
          eventTypes: object["eventTypes"],
          failureReason: object["failureReason"],
          id: object["id"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          nextRetryAt: object["nextRetryAt"] ? new Date(object["nextRetryAt"]) : null,
          status: sinkStatus_1.SinkStatusSerializer._fromJsonObject(object["status"]),
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = sinkHttpConfig_1.SinkHttpConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = s3Config_1.S3ConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudPubSub":
            config = googleCloudPubSubConfig_1.GoogleCloudPubSubConfigSerializer._toJsonObject(self.config);
            break;
          case "sqs":
            config = sqsConfig_1.SqsConfigSerializer._toJsonObject(self.config);
            break;
          case "sns":
            config = snsConfig_1.SnsConfigSerializer._toJsonObject(self.config);
            break;
          case "bigQuery":
            config = bigQueryConfig_1.BigQueryConfigSerializer._toJsonObject(self.config);
            break;
          case "clickhouse":
            config = clickhouseConfig_1.ClickhouseConfigSerializer._toJsonObject(self.config);
            break;
          case "eventBridge":
            config = eventBridgeConfig_1.EventBridgeConfigSerializer._toJsonObject(self.config);
            break;
          case "snowflake":
            config = snowflakeConfig_1.SnowflakeConfigSerializer._toJsonObject(self.config);
            break;
          case "rabbitMq":
            config = rabbitMqConfig_1.RabbitMqConfigSerializer._toJsonObject(self.config);
            break;
          case "redshift":
            config = redshiftConfig_1.RedshiftConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          createdAt: self.createdAt,
          currentIterator: self.currentIterator,
          eventTypes: self.eventTypes,
          failureReason: self.failureReason,
          id: self.id,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          nextRetryAt: self.nextRetryAt,
          status: sinkStatus_1.SinkStatusSerializer._toJsonObject(self.status),
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseStreamSinkOut.js
var require_listResponseStreamSinkOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseStreamSinkOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseStreamSinkOutSerializer = void 0;
    var streamSinkOut_1 = require_streamSinkOut();
    exports.ListResponseStreamSinkOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamSinkOut_1.StreamSinkOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkSecretOut.js
var require_sinkSecretOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkSecretOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkSecretOutSerializer = void 0;
    exports.SinkSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkTransformIn.js
var require_sinkTransformIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkTransformIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkTransformInSerializer = void 0;
    exports.SinkTransformInSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkStatusIn.js
var require_sinkStatusIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkStatusIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkStatusInSerializer = exports.SinkStatusIn = void 0;
    var SinkStatusIn;
    (function(SinkStatusIn2) {
      SinkStatusIn2["Enabled"] = "enabled";
      SinkStatusIn2["Disabled"] = "disabled";
    })(SinkStatusIn = exports.SinkStatusIn || (exports.SinkStatusIn = {}));
    exports.SinkStatusInSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamSinkIn.js
var require_streamSinkIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamSinkIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamSinkInSerializer = void 0;
    var azureBlobStorageConfig_1 = require_azureBlobStorageConfig();
    var bigQueryConfig_1 = require_bigQueryConfig();
    var clickhouseConfig_1 = require_clickhouseConfig();
    var eventBridgeConfig_1 = require_eventBridgeConfig();
    var googleCloudPubSubConfig_1 = require_googleCloudPubSubConfig();
    var googleCloudStorageConfig_1 = require_googleCloudStorageConfig();
    var rabbitMqConfig_1 = require_rabbitMqConfig();
    var redshiftConfig_1 = require_redshiftConfig();
    var s3Config_1 = require_s3Config();
    var sinkHttpConfig_1 = require_sinkHttpConfig();
    var sinkOtelV1Config_1 = require_sinkOtelV1Config();
    var sinkStatusIn_1 = require_sinkStatusIn();
    var snowflakeConfig_1 = require_snowflakeConfig();
    var snsConfig_1 = require_snsConfig();
    var sqsConfig_1 = require_sqsConfig();
    exports.StreamSinkInSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return sinkHttpConfig_1.SinkHttpConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return s3Config_1.S3ConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudPubSub":
              return googleCloudPubSubConfig_1.GoogleCloudPubSubConfigSerializer._fromJsonObject(object["config"]);
            case "sqs":
              return sqsConfig_1.SqsConfigSerializer._fromJsonObject(object["config"]);
            case "sns":
              return snsConfig_1.SnsConfigSerializer._fromJsonObject(object["config"]);
            case "bigQuery":
              return bigQueryConfig_1.BigQueryConfigSerializer._fromJsonObject(object["config"]);
            case "clickhouse":
              return clickhouseConfig_1.ClickhouseConfigSerializer._fromJsonObject(object["config"]);
            case "eventBridge":
              return eventBridgeConfig_1.EventBridgeConfigSerializer._fromJsonObject(object["config"]);
            case "snowflake":
              return snowflakeConfig_1.SnowflakeConfigSerializer._fromJsonObject(object["config"]);
            case "rabbitMq":
              return rabbitMqConfig_1.RabbitMqConfigSerializer._fromJsonObject(object["config"]);
            case "redshift":
              return redshiftConfig_1.RedshiftConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        __name(getConfig, "getConfig");
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          eventTypes: object["eventTypes"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          status: object["status"] != null ? sinkStatusIn_1.SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = sinkHttpConfig_1.SinkHttpConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = s3Config_1.S3ConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudPubSub":
            config = googleCloudPubSubConfig_1.GoogleCloudPubSubConfigSerializer._toJsonObject(self.config);
            break;
          case "sqs":
            config = sqsConfig_1.SqsConfigSerializer._toJsonObject(self.config);
            break;
          case "sns":
            config = snsConfig_1.SnsConfigSerializer._toJsonObject(self.config);
            break;
          case "bigQuery":
            config = bigQueryConfig_1.BigQueryConfigSerializer._toJsonObject(self.config);
            break;
          case "clickhouse":
            config = clickhouseConfig_1.ClickhouseConfigSerializer._toJsonObject(self.config);
            break;
          case "eventBridge":
            config = eventBridgeConfig_1.EventBridgeConfigSerializer._toJsonObject(self.config);
            break;
          case "snowflake":
            config = snowflakeConfig_1.SnowflakeConfigSerializer._toJsonObject(self.config);
            break;
          case "rabbitMq":
            config = rabbitMqConfig_1.RabbitMqConfigSerializer._toJsonObject(self.config);
            break;
          case "redshift":
            config = redshiftConfig_1.RedshiftConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          eventTypes: self.eventTypes,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          status: self.status != null ? sinkStatusIn_1.SinkStatusInSerializer._toJsonObject(self.status) : void 0,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/amazonS3PatchConfig.js
var require_amazonS3PatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/amazonS3PatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AmazonS3PatchConfigSerializer = void 0;
    exports.AmazonS3PatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          bucket: object["bucket"],
          endpointUrl: object["endpointUrl"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          bucket: self.bucket,
          endpointUrl: self.endpointUrl,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/azureBlobStoragePatchConfig.js
var require_azureBlobStoragePatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/azureBlobStoragePatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AzureBlobStoragePatchConfigSerializer = void 0;
    exports.AzureBlobStoragePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKey: object["accessKey"],
          account: object["account"],
          container: object["container"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKey: self.accessKey,
          account: self.account,
          container: self.container
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/bigQueryPatchConfig.js
var require_bigQueryPatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/bigQueryPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BigQueryPatchConfigSerializer = void 0;
    exports.BigQueryPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          credentials: object["credentials"],
          datasetId: object["datasetId"],
          projectId: object["projectId"],
          tableId: object["tableId"]
        };
      },
      _toJsonObject(self) {
        return {
          credentials: self.credentials,
          datasetId: self.datasetId,
          projectId: self.projectId,
          tableId: self.tableId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/clickhousePatchConfig.js
var require_clickhousePatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/clickhousePatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClickhousePatchConfigSerializer = void 0;
    exports.ClickhousePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          database: object["database"],
          password: object["password"],
          tableName: object["tableName"],
          url: object["url"],
          username: object["username"]
        };
      },
      _toJsonObject(self) {
        return {
          database: self.database,
          password: self.password,
          tableName: self.tableName,
          url: self.url,
          username: self.username
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventBridgePatchConfig.js
var require_eventBridgePatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/eventBridgePatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventBridgePatchConfigSerializer = void 0;
    exports.EventBridgePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          detailType: object["detailType"],
          eventBusName: object["eventBusName"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          detailType: self.detailType,
          eventBusName: self.eventBusName,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/googleCloudPubSubPatchConfig.js
var require_googleCloudPubSubPatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/googleCloudPubSubPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoogleCloudPubSubPatchConfigSerializer = void 0;
    exports.GoogleCloudPubSubPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          credentials: object["credentials"],
          projectId: object["projectId"],
          topicId: object["topicId"]
        };
      },
      _toJsonObject(self) {
        return {
          credentials: self.credentials,
          projectId: self.projectId,
          topicId: self.topicId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/googleCloudStoragePatchConfig.js
var require_googleCloudStoragePatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/googleCloudStoragePatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoogleCloudStoragePatchConfigSerializer = void 0;
    exports.GoogleCloudStoragePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          bucket: object["bucket"],
          credentials: object["credentials"]
        };
      },
      _toJsonObject(self) {
        return {
          bucket: self.bucket,
          credentials: self.credentials
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/httpPatchConfig.js
var require_httpPatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/httpPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpPatchConfigSerializer = void 0;
    exports.HttpPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/otelTracingPatchConfig.js
var require_otelTracingPatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/otelTracingPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OtelTracingPatchConfigSerializer = void 0;
    exports.OtelTracingPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rabbitMqPatchConfig.js
var require_rabbitMqPatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/rabbitMqPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RabbitMqPatchConfigSerializer = void 0;
    exports.RabbitMqPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          routingKey: object["routingKey"],
          uri: object["uri"]
        };
      },
      _toJsonObject(self) {
        return {
          routingKey: self.routingKey,
          uri: self.uri
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/redshiftPatchConfig.js
var require_redshiftPatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/redshiftPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RedshiftPatchConfigSerializer = void 0;
    exports.RedshiftPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          dbName: object["dbName"],
          region: object["region"],
          schemaName: object["schemaName"],
          secretAccessKey: object["secretAccessKey"],
          tableName: object["tableName"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          dbName: self.dbName,
          region: self.region,
          schemaName: self.schemaName,
          secretAccessKey: self.secretAccessKey,
          tableName: self.tableName
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/snowflakePatchConfig.js
var require_snowflakePatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/snowflakePatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnowflakePatchConfigSerializer = void 0;
    exports.SnowflakePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accountIdentifier: object["accountIdentifier"],
          dbName: object["dbName"],
          privateKey: object["privateKey"],
          schemaName: object["schemaName"],
          tableName: object["tableName"],
          userId: object["userId"]
        };
      },
      _toJsonObject(self) {
        return {
          accountIdentifier: self.accountIdentifier,
          dbName: self.dbName,
          privateKey: self.privateKey,
          schemaName: self.schemaName,
          tableName: self.tableName,
          userId: self.userId
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/snsPatchConfig.js
var require_snsPatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/snsPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnsPatchConfigSerializer = void 0;
    exports.SnsPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          endpointUrl: object["endpointUrl"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"],
          topicArn: object["topicArn"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          endpointUrl: self.endpointUrl,
          region: self.region,
          secretAccessKey: self.secretAccessKey,
          topicArn: self.topicArn
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sqsPatchConfig.js
var require_sqsPatchConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sqsPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SqsPatchConfigSerializer = void 0;
    exports.SqsPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          endpointUrl: object["endpointUrl"],
          queueUrl: object["queueUrl"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          endpointUrl: self.endpointUrl,
          queueUrl: self.queueUrl,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamSinkPatch.js
var require_streamSinkPatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamSinkPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamSinkPatchSerializer = void 0;
    var amazonS3PatchConfig_1 = require_amazonS3PatchConfig();
    var azureBlobStoragePatchConfig_1 = require_azureBlobStoragePatchConfig();
    var bigQueryPatchConfig_1 = require_bigQueryPatchConfig();
    var clickhousePatchConfig_1 = require_clickhousePatchConfig();
    var eventBridgePatchConfig_1 = require_eventBridgePatchConfig();
    var googleCloudPubSubPatchConfig_1 = require_googleCloudPubSubPatchConfig();
    var googleCloudStoragePatchConfig_1 = require_googleCloudStoragePatchConfig();
    var httpPatchConfig_1 = require_httpPatchConfig();
    var otelTracingPatchConfig_1 = require_otelTracingPatchConfig();
    var rabbitMqPatchConfig_1 = require_rabbitMqPatchConfig();
    var redshiftPatchConfig_1 = require_redshiftPatchConfig();
    var sinkStatusIn_1 = require_sinkStatusIn();
    var snowflakePatchConfig_1 = require_snowflakePatchConfig();
    var snsPatchConfig_1 = require_snsPatchConfig();
    var sqsPatchConfig_1 = require_sqsPatchConfig();
    exports.StreamSinkPatchSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStoragePatchConfig_1.AzureBlobStoragePatchConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return otelTracingPatchConfig_1.OtelTracingPatchConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return httpPatchConfig_1.HttpPatchConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return amazonS3PatchConfig_1.AmazonS3PatchConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStoragePatchConfig_1.GoogleCloudStoragePatchConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudPubSub":
              return googleCloudPubSubPatchConfig_1.GoogleCloudPubSubPatchConfigSerializer._fromJsonObject(object["config"]);
            case "sqs":
              return sqsPatchConfig_1.SqsPatchConfigSerializer._fromJsonObject(object["config"]);
            case "sns":
              return snsPatchConfig_1.SnsPatchConfigSerializer._fromJsonObject(object["config"]);
            case "bigQuery":
              return bigQueryPatchConfig_1.BigQueryPatchConfigSerializer._fromJsonObject(object["config"]);
            case "clickhouse":
              return clickhousePatchConfig_1.ClickhousePatchConfigSerializer._fromJsonObject(object["config"]);
            case "eventBridge":
              return eventBridgePatchConfig_1.EventBridgePatchConfigSerializer._fromJsonObject(object["config"]);
            case "snowflake":
              return snowflakePatchConfig_1.SnowflakePatchConfigSerializer._fromJsonObject(object["config"]);
            case "rabbitMq":
              return rabbitMqPatchConfig_1.RabbitMqPatchConfigSerializer._fromJsonObject(object["config"]);
            case "redshift":
              return redshiftPatchConfig_1.RedshiftPatchConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        __name(getConfig, "getConfig");
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          eventTypes: object["eventTypes"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          status: object["status"] != null ? sinkStatusIn_1.SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStoragePatchConfig_1.AzureBlobStoragePatchConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = otelTracingPatchConfig_1.OtelTracingPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = httpPatchConfig_1.HttpPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = amazonS3PatchConfig_1.AmazonS3PatchConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStoragePatchConfig_1.GoogleCloudStoragePatchConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudPubSub":
            config = googleCloudPubSubPatchConfig_1.GoogleCloudPubSubPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "sqs":
            config = sqsPatchConfig_1.SqsPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "sns":
            config = snsPatchConfig_1.SnsPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "bigQuery":
            config = bigQueryPatchConfig_1.BigQueryPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "clickhouse":
            config = clickhousePatchConfig_1.ClickhousePatchConfigSerializer._toJsonObject(self.config);
            break;
          case "eventBridge":
            config = eventBridgePatchConfig_1.EventBridgePatchConfigSerializer._toJsonObject(self.config);
            break;
          case "snowflake":
            config = snowflakePatchConfig_1.SnowflakePatchConfigSerializer._toJsonObject(self.config);
            break;
          case "rabbitMq":
            config = rabbitMqPatchConfig_1.RabbitMqPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "redshift":
            config = redshiftPatchConfig_1.RedshiftPatchConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          eventTypes: self.eventTypes,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          status: self.status != null ? sinkStatusIn_1.SinkStatusInSerializer._toJsonObject(self.status) : void 0,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streamingSink.js
var require_streamingSink = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streamingSink.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamingSink = void 0;
    var emptyResponse_1 = require_emptyResponse();
    var endpointSecretRotateIn_1 = require_endpointSecretRotateIn();
    var listResponseStreamSinkOut_1 = require_listResponseStreamSinkOut();
    var sinkSecretOut_1 = require_sinkSecretOut();
    var sinkTransformIn_1 = require_sinkTransformIn();
    var streamSinkIn_1 = require_streamSinkIn();
    var streamSinkOut_1 = require_streamSinkOut();
    var streamSinkPatch_1 = require_streamSinkPatch();
    var request_1 = require_request();
    var StreamingSink = class {
      static {
        __name(this, "StreamingSink");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(streamId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink");
          request.setPathParam("stream_id", streamId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseStreamSinkOut_1.ListResponseStreamSinkOutSerializer._fromJsonObject);
        });
      }
      create(streamId, streamSinkIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/sink");
          request.setPathParam("stream_id", streamId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(streamSinkIn_1.StreamSinkInSerializer._toJsonObject(streamSinkIn));
          return yield request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
        });
      }
      get(streamId, sinkId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          return yield request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
        });
      }
      update(streamId, sinkId, streamSinkIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/{stream_id}/sink/{sink_id}");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          request.setBody(streamSinkIn_1.StreamSinkInSerializer._toJsonObject(streamSinkIn));
          return yield request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
        });
      }
      delete(streamId, sinkId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/{stream_id}/sink/{sink_id}");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      patch(streamId, sinkId, streamSinkPatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          request.setBody(streamSinkPatch_1.StreamSinkPatchSerializer._toJsonObject(streamSinkPatch));
          return yield request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
        });
      }
      transformationPartialUpdate(streamId, sinkId, sinkTransformIn = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          request.setBody(sinkTransformIn_1.SinkTransformInSerializer._toJsonObject(sinkTransformIn));
          return yield request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
        });
      }
      getSecret(streamId, sinkId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/secret");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          return yield request.send(this.requestCtx, sinkSecretOut_1.SinkSecretOutSerializer._fromJsonObject);
        });
      }
      rotateSecret(streamId, sinkId, endpointSecretRotateIn = {}, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/sink/{sink_id}/secret/rotate");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(endpointSecretRotateIn_1.EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));
          return yield request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
        });
      }
    };
    exports.StreamingSink = StreamingSink;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamOut.js
var require_streamOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamOutSerializer = void 0;
    exports.StreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          id: self.id,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseStreamOut.js
var require_listResponseStreamOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/listResponseStreamOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseStreamOutSerializer = void 0;
    var streamOut_1 = require_streamOut();
    exports.ListResponseStreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamOut_1.StreamOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamOut_1.StreamOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamPatch.js
var require_streamPatch = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/streamPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamPatchSerializer = void 0;
    exports.StreamPatchSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          metadata: object["metadata"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          metadata: self.metadata,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streamingStream.js
var require_streamingStream = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streamingStream.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamingStream = void 0;
    var listResponseStreamOut_1 = require_listResponseStreamOut();
    var streamIn_1 = require_streamIn();
    var streamOut_1 = require_streamOut();
    var streamPatch_1 = require_streamPatch();
    var request_1 = require_request();
    var StreamingStream = class {
      static {
        __name(this, "StreamingStream");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream");
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            iterator: options === null || options === void 0 ? void 0 : options.iterator,
            order: options === null || options === void 0 ? void 0 : options.order
          });
          return yield request.send(this.requestCtx, listResponseStreamOut_1.ListResponseStreamOutSerializer._fromJsonObject);
        });
      }
      create(streamIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream");
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(streamIn_1.StreamInSerializer._toJsonObject(streamIn));
          return yield request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
        });
      }
      get(streamId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}");
          request.setPathParam("stream_id", streamId);
          return yield request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
        });
      }
      update(streamId, streamIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/{stream_id}");
          request.setPathParam("stream_id", streamId);
          request.setBody(streamIn_1.StreamInSerializer._toJsonObject(streamIn));
          return yield request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
        });
      }
      delete(streamId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/{stream_id}");
          request.setPathParam("stream_id", streamId);
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
      patch(streamId, streamPatch) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}");
          request.setPathParam("stream_id", streamId);
          request.setBody(streamPatch_1.StreamPatchSerializer._toJsonObject(streamPatch));
          return yield request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
        });
      }
    };
    exports.StreamingStream = StreamingStream;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streaming.js
var require_streaming = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api/streaming.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Streaming = void 0;
    var endpointHeadersOut_1 = require_endpointHeadersOut();
    var httpSinkHeadersPatchIn_1 = require_httpSinkHeadersPatchIn();
    var sinkTransformationOut_1 = require_sinkTransformationOut();
    var streamingEventType_1 = require_streamingEventType();
    var streamingEvents_1 = require_streamingEvents();
    var streamingSink_1 = require_streamingSink();
    var streamingStream_1 = require_streamingStream();
    var request_1 = require_request();
    var Streaming = class {
      static {
        __name(this, "Streaming");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get event_type() {
        return new streamingEventType_1.StreamingEventType(this.requestCtx);
      }
      get events() {
        return new streamingEvents_1.StreamingEvents(this.requestCtx);
      }
      get sink() {
        return new streamingSink_1.StreamingSink(this.requestCtx);
      }
      get stream() {
        return new streamingStream_1.StreamingStream(this.requestCtx);
      }
      sinkTransformationGet(streamId, sinkId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          return yield request.send(this.requestCtx, sinkTransformationOut_1.SinkTransformationOutSerializer._fromJsonObject);
        });
      }
      sinkHeadersGet(streamId, sinkId) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          return yield request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
        });
      }
      sinkHeadersPatch(streamId, sinkId, httpSinkHeadersPatchIn) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
          request.setPathParam("stream_id", streamId);
          request.setPathParam("sink_id", sinkId);
          request.setBody(httpSinkHeadersPatchIn_1.HttpSinkHeadersPatchInSerializer._toJsonObject(httpSinkHeadersPatchIn));
          return yield request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
        });
      }
    };
    exports.Streaming = Streaming;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/HttpErrors.js
var require_HttpErrors = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/HttpErrors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTTPValidationError = exports.ValidationError = exports.HttpErrorOut = void 0;
    var HttpErrorOut = class _HttpErrorOut {
      static {
        __name(this, "HttpErrorOut");
      }
      static getAttributeTypeMap() {
        return _HttpErrorOut.attributeTypeMap;
      }
    };
    exports.HttpErrorOut = HttpErrorOut;
    HttpErrorOut.discriminator = void 0;
    HttpErrorOut.mapping = void 0;
    HttpErrorOut.attributeTypeMap = [
      {
        name: "code",
        baseName: "code",
        type: "string",
        format: ""
      },
      {
        name: "detail",
        baseName: "detail",
        type: "string",
        format: ""
      }
    ];
    var ValidationError = class _ValidationError {
      static {
        __name(this, "ValidationError");
      }
      static getAttributeTypeMap() {
        return _ValidationError.attributeTypeMap;
      }
    };
    exports.ValidationError = ValidationError;
    ValidationError.discriminator = void 0;
    ValidationError.mapping = void 0;
    ValidationError.attributeTypeMap = [
      {
        name: "loc",
        baseName: "loc",
        type: "Array<string>",
        format: ""
      },
      {
        name: "msg",
        baseName: "msg",
        type: "string",
        format: ""
      },
      {
        name: "type",
        baseName: "type",
        type: "string",
        format: ""
      }
    ];
    var HTTPValidationError = class _HTTPValidationError {
      static {
        __name(this, "HTTPValidationError");
      }
      static getAttributeTypeMap() {
        return _HTTPValidationError.attributeTypeMap;
      }
    };
    exports.HTTPValidationError = HTTPValidationError;
    HTTPValidationError.discriminator = void 0;
    HTTPValidationError.mapping = void 0;
    HTTPValidationError.attributeTypeMap = [
      {
        name: "detail",
        baseName: "detail",
        type: "Array<ValidationError>",
        format: ""
      }
    ];
  }
});

// ../../node_modules/.bun/standardwebhooks@1.0.0/node_modules/standardwebhooks/dist/timing_safe_equal.js
var require_timing_safe_equal = __commonJS({
  "../../node_modules/.bun/standardwebhooks@1.0.0/node_modules/standardwebhooks/dist/timing_safe_equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.timingSafeEqual = void 0;
    function assert(expr, msg = "") {
      if (!expr) {
        throw new Error(msg);
      }
    }
    __name(assert, "assert");
    function timingSafeEqual(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      if (!(a instanceof DataView)) {
        a = new DataView(ArrayBuffer.isView(a) ? a.buffer : a);
      }
      if (!(b instanceof DataView)) {
        b = new DataView(ArrayBuffer.isView(b) ? b.buffer : b);
      }
      assert(a instanceof DataView);
      assert(b instanceof DataView);
      const length = a.byteLength;
      let out = 0;
      let i = -1;
      while (++i < length) {
        out |= a.getUint8(i) ^ b.getUint8(i);
      }
      return out === 0;
    }
    __name(timingSafeEqual, "timingSafeEqual");
    exports.timingSafeEqual = timingSafeEqual;
  }
});

// ../../node_modules/.bun/@stablelib+base64@1.0.1/node_modules/@stablelib/base64/lib/base64.js
var require_base64 = __commonJS({
  "../../node_modules/.bun/@stablelib+base64@1.0.1/node_modules/@stablelib/base64/lib/base64.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = /* @__PURE__ */ __name(function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      }, "extendStatics");
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        __name(__, "__");
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var INVALID_BYTE = 256;
    var Coder = (
      /** @class */
      (function() {
        function Coder2(_paddingCharacter) {
          if (_paddingCharacter === void 0) {
            _paddingCharacter = "=";
          }
          this._paddingCharacter = _paddingCharacter;
        }
        __name(Coder2, "Coder");
        Coder2.prototype.encodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 8 + 5) / 6 | 0;
          }
          return (length + 2) / 3 * 4 | 0;
        };
        Coder2.prototype.encode = function(data) {
          var out = "";
          var i = 0;
          for (; i < data.length - 2; i += 3) {
            var c = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            out += this._encodeByte(c >>> 1 * 6 & 63);
            out += this._encodeByte(c >>> 0 * 6 & 63);
          }
          var left = data.length - i;
          if (left > 0) {
            var c = data[i] << 16 | (left === 2 ? data[i + 1] << 8 : 0);
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            if (left === 2) {
              out += this._encodeByte(c >>> 1 * 6 & 63);
            } else {
              out += this._paddingCharacter || "";
            }
            out += this._paddingCharacter || "";
          }
          return out;
        };
        Coder2.prototype.maxDecodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 6 + 7) / 8 | 0;
          }
          return length / 4 * 3 | 0;
        };
        Coder2.prototype.decodedLength = function(s) {
          return this.maxDecodedLength(s.length - this._getPaddingLength(s));
        };
        Coder2.prototype.decode = function(s) {
          if (s.length === 0) {
            return new Uint8Array(0);
          }
          var paddingLength = this._getPaddingLength(s);
          var length = s.length - paddingLength;
          var out = new Uint8Array(this.maxDecodedLength(length));
          var op = 0;
          var i = 0;
          var haveBad = 0;
          var v0 = 0, v1 = 0, v2 = 0, v3 = 0;
          for (; i < length - 4; i += 4) {
            v0 = this._decodeChar(s.charCodeAt(i + 0));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v0 << 2 | v1 >>> 4;
            out[op++] = v1 << 4 | v2 >>> 2;
            out[op++] = v2 << 6 | v3;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
            haveBad |= v2 & INVALID_BYTE;
            haveBad |= v3 & INVALID_BYTE;
          }
          if (i < length - 1) {
            v0 = this._decodeChar(s.charCodeAt(i));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            out[op++] = v0 << 2 | v1 >>> 4;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
          }
          if (i < length - 2) {
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            out[op++] = v1 << 4 | v2 >>> 2;
            haveBad |= v2 & INVALID_BYTE;
          }
          if (i < length - 3) {
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v2 << 6 | v3;
            haveBad |= v3 & INVALID_BYTE;
          }
          if (haveBad !== 0) {
            throw new Error("Base64Coder: incorrect characters for decoding");
          }
          return out;
        };
        Coder2.prototype._encodeByte = function(b) {
          var result = b;
          result += 65;
          result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b >>> 8 & 52 - 48 - 62 + 43;
          result += 62 - b >>> 8 & 62 - 43 - 63 + 47;
          return String.fromCharCode(result);
        };
        Coder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (42 - c & c - 44) >>> 8 & -INVALID_BYTE + c - 43 + 62;
          result += (46 - c & c - 48) >>> 8 & -INVALID_BYTE + c - 47 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        Coder2.prototype._getPaddingLength = function(s) {
          var paddingLength = 0;
          if (this._paddingCharacter) {
            for (var i = s.length - 1; i >= 0; i--) {
              if (s[i] !== this._paddingCharacter) {
                break;
              }
              paddingLength++;
            }
            if (s.length < 4 || paddingLength > 2) {
              throw new Error("Base64Coder: incorrect padding");
            }
          }
          return paddingLength;
        };
        return Coder2;
      })()
    );
    exports.Coder = Coder;
    var stdCoder = new Coder();
    function encode(data) {
      return stdCoder.encode(data);
    }
    __name(encode, "encode");
    exports.encode = encode;
    function decode(s) {
      return stdCoder.decode(s);
    }
    __name(decode, "decode");
    exports.decode = decode;
    var URLSafeCoder = (
      /** @class */
      (function(_super) {
        __extends(URLSafeCoder2, _super);
        function URLSafeCoder2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        __name(URLSafeCoder2, "URLSafeCoder");
        URLSafeCoder2.prototype._encodeByte = function(b) {
          var result = b;
          result += 65;
          result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b >>> 8 & 52 - 48 - 62 + 45;
          result += 62 - b >>> 8 & 62 - 45 - 63 + 95;
          return String.fromCharCode(result);
        };
        URLSafeCoder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (44 - c & c - 46) >>> 8 & -INVALID_BYTE + c - 45 + 62;
          result += (94 - c & c - 96) >>> 8 & -INVALID_BYTE + c - 95 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        return URLSafeCoder2;
      })(Coder)
    );
    exports.URLSafeCoder = URLSafeCoder;
    var urlSafeCoder = new URLSafeCoder();
    function encodeURLSafe(data) {
      return urlSafeCoder.encode(data);
    }
    __name(encodeURLSafe, "encodeURLSafe");
    exports.encodeURLSafe = encodeURLSafe;
    function decodeURLSafe(s) {
      return urlSafeCoder.decode(s);
    }
    __name(decodeURLSafe, "decodeURLSafe");
    exports.decodeURLSafe = decodeURLSafe;
    exports.encodedLength = function(length) {
      return stdCoder.encodedLength(length);
    };
    exports.maxDecodedLength = function(length) {
      return stdCoder.maxDecodedLength(length);
    };
    exports.decodedLength = function(s) {
      return stdCoder.decodedLength(s);
    };
  }
});

// ../../node_modules/.bun/fast-sha256@1.3.0/node_modules/fast-sha256/sha256.js
var require_sha256 = __commonJS({
  "../../node_modules/.bun/fast-sha256@1.3.0/node_modules/fast-sha256/sha256.js"(exports, module) {
    (function(root, factory) {
      var exports2 = {};
      factory(exports2);
      var sha256 = exports2["default"];
      for (var k in exports2) {
        sha256[k] = exports2[k];
      }
      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = sha256;
      } else if (typeof define === "function" && define.amd) {
        define(function() {
          return sha256;
        });
      } else {
        root.sha256 = sha256;
      }
    })(exports, function(exports2) {
      "use strict";
      exports2.__esModule = true;
      exports2.digestLength = 32;
      exports2.blockSize = 64;
      var K = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      function hashBlocks(w, v, p, pos, len) {
        var a, b, c, d, e, f, g, h, u, i, j, t1, t2;
        while (len >= 64) {
          a = v[0];
          b = v[1];
          c = v[2];
          d = v[3];
          e = v[4];
          f = v[5];
          g = v[6];
          h = v[7];
          for (i = 0; i < 16; i++) {
            j = pos + i * 4;
            w[i] = (p[j] & 255) << 24 | (p[j + 1] & 255) << 16 | (p[j + 2] & 255) << 8 | p[j + 3] & 255;
          }
          for (i = 16; i < 64; i++) {
            u = w[i - 2];
            t1 = (u >>> 17 | u << 32 - 17) ^ (u >>> 19 | u << 32 - 19) ^ u >>> 10;
            u = w[i - 15];
            t2 = (u >>> 7 | u << 32 - 7) ^ (u >>> 18 | u << 32 - 18) ^ u >>> 3;
            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
          }
          for (i = 0; i < 64; i++) {
            t1 = (((e >>> 6 | e << 32 - 6) ^ (e >>> 11 | e << 32 - 11) ^ (e >>> 25 | e << 32 - 25)) + (e & f ^ ~e & g) | 0) + (h + (K[i] + w[i] | 0) | 0) | 0;
            t2 = ((a >>> 2 | a << 32 - 2) ^ (a >>> 13 | a << 32 - 13) ^ (a >>> 22 | a << 32 - 22)) + (a & b ^ a & c ^ b & c) | 0;
            h = g;
            g = f;
            f = e;
            e = d + t1 | 0;
            d = c;
            c = b;
            b = a;
            a = t1 + t2 | 0;
          }
          v[0] += a;
          v[1] += b;
          v[2] += c;
          v[3] += d;
          v[4] += e;
          v[5] += f;
          v[6] += g;
          v[7] += h;
          pos += 64;
          len -= 64;
        }
        return pos;
      }
      __name(hashBlocks, "hashBlocks");
      var Hash = (
        /** @class */
        (function() {
          function Hash2() {
            this.digestLength = exports2.digestLength;
            this.blockSize = exports2.blockSize;
            this.state = new Int32Array(8);
            this.temp = new Int32Array(64);
            this.buffer = new Uint8Array(128);
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            this.reset();
          }
          __name(Hash2, "Hash");
          Hash2.prototype.reset = function() {
            this.state[0] = 1779033703;
            this.state[1] = 3144134277;
            this.state[2] = 1013904242;
            this.state[3] = 2773480762;
            this.state[4] = 1359893119;
            this.state[5] = 2600822924;
            this.state[6] = 528734635;
            this.state[7] = 1541459225;
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            return this;
          };
          Hash2.prototype.clean = function() {
            for (var i = 0; i < this.buffer.length; i++) {
              this.buffer[i] = 0;
            }
            for (var i = 0; i < this.temp.length; i++) {
              this.temp[i] = 0;
            }
            this.reset();
          };
          Hash2.prototype.update = function(data, dataLength) {
            if (dataLength === void 0) {
              dataLength = data.length;
            }
            if (this.finished) {
              throw new Error("SHA256: can't update because hash was finished.");
            }
            var dataPos = 0;
            this.bytesHashed += dataLength;
            if (this.bufferLength > 0) {
              while (this.bufferLength < 64 && dataLength > 0) {
                this.buffer[this.bufferLength++] = data[dataPos++];
                dataLength--;
              }
              if (this.bufferLength === 64) {
                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                this.bufferLength = 0;
              }
            }
            if (dataLength >= 64) {
              dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
              dataLength %= 64;
            }
            while (dataLength > 0) {
              this.buffer[this.bufferLength++] = data[dataPos++];
              dataLength--;
            }
            return this;
          };
          Hash2.prototype.finish = function(out) {
            if (!this.finished) {
              var bytesHashed = this.bytesHashed;
              var left = this.bufferLength;
              var bitLenHi = bytesHashed / 536870912 | 0;
              var bitLenLo = bytesHashed << 3;
              var padLength = bytesHashed % 64 < 56 ? 64 : 128;
              this.buffer[left] = 128;
              for (var i = left + 1; i < padLength - 8; i++) {
                this.buffer[i] = 0;
              }
              this.buffer[padLength - 8] = bitLenHi >>> 24 & 255;
              this.buffer[padLength - 7] = bitLenHi >>> 16 & 255;
              this.buffer[padLength - 6] = bitLenHi >>> 8 & 255;
              this.buffer[padLength - 5] = bitLenHi >>> 0 & 255;
              this.buffer[padLength - 4] = bitLenLo >>> 24 & 255;
              this.buffer[padLength - 3] = bitLenLo >>> 16 & 255;
              this.buffer[padLength - 2] = bitLenLo >>> 8 & 255;
              this.buffer[padLength - 1] = bitLenLo >>> 0 & 255;
              hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
              this.finished = true;
            }
            for (var i = 0; i < 8; i++) {
              out[i * 4 + 0] = this.state[i] >>> 24 & 255;
              out[i * 4 + 1] = this.state[i] >>> 16 & 255;
              out[i * 4 + 2] = this.state[i] >>> 8 & 255;
              out[i * 4 + 3] = this.state[i] >>> 0 & 255;
            }
            return this;
          };
          Hash2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          Hash2.prototype._saveState = function(out) {
            for (var i = 0; i < this.state.length; i++) {
              out[i] = this.state[i];
            }
          };
          Hash2.prototype._restoreState = function(from, bytesHashed) {
            for (var i = 0; i < this.state.length; i++) {
              this.state[i] = from[i];
            }
            this.bytesHashed = bytesHashed;
            this.finished = false;
            this.bufferLength = 0;
          };
          return Hash2;
        })()
      );
      exports2.Hash = Hash;
      var HMAC = (
        /** @class */
        (function() {
          function HMAC2(key) {
            this.inner = new Hash();
            this.outer = new Hash();
            this.blockSize = this.inner.blockSize;
            this.digestLength = this.inner.digestLength;
            var pad = new Uint8Array(this.blockSize);
            if (key.length > this.blockSize) {
              new Hash().update(key).finish(pad).clean();
            } else {
              for (var i = 0; i < key.length; i++) {
                pad[i] = key[i];
              }
            }
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54;
            }
            this.inner.update(pad);
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54 ^ 92;
            }
            this.outer.update(pad);
            this.istate = new Uint32Array(8);
            this.ostate = new Uint32Array(8);
            this.inner._saveState(this.istate);
            this.outer._saveState(this.ostate);
            for (var i = 0; i < pad.length; i++) {
              pad[i] = 0;
            }
          }
          __name(HMAC2, "HMAC");
          HMAC2.prototype.reset = function() {
            this.inner._restoreState(this.istate, this.inner.blockSize);
            this.outer._restoreState(this.ostate, this.outer.blockSize);
            return this;
          };
          HMAC2.prototype.clean = function() {
            for (var i = 0; i < this.istate.length; i++) {
              this.ostate[i] = this.istate[i] = 0;
            }
            this.inner.clean();
            this.outer.clean();
          };
          HMAC2.prototype.update = function(data) {
            this.inner.update(data);
            return this;
          };
          HMAC2.prototype.finish = function(out) {
            if (this.outer.finished) {
              this.outer.finish(out);
            } else {
              this.inner.finish(out);
              this.outer.update(out, this.digestLength).finish(out);
            }
            return this;
          };
          HMAC2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          return HMAC2;
        })()
      );
      exports2.HMAC = HMAC;
      function hash(data) {
        var h = new Hash().update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      __name(hash, "hash");
      exports2.hash = hash;
      exports2["default"] = hash;
      function hmac(key, data) {
        var h = new HMAC(key).update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      __name(hmac, "hmac");
      exports2.hmac = hmac;
      function fillBuffer(buffer, hmac2, info, counter) {
        var num = counter[0];
        if (num === 0) {
          throw new Error("hkdf: cannot expand more");
        }
        hmac2.reset();
        if (num > 1) {
          hmac2.update(buffer);
        }
        if (info) {
          hmac2.update(info);
        }
        hmac2.update(counter);
        hmac2.finish(buffer);
        counter[0]++;
      }
      __name(fillBuffer, "fillBuffer");
      var hkdfSalt = new Uint8Array(exports2.digestLength);
      function hkdf(key, salt, info, length) {
        if (salt === void 0) {
          salt = hkdfSalt;
        }
        if (length === void 0) {
          length = 32;
        }
        var counter = new Uint8Array([1]);
        var okm = hmac(salt, key);
        var hmac_ = new HMAC(okm);
        var buffer = new Uint8Array(hmac_.digestLength);
        var bufpos = buffer.length;
        var out = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
          if (bufpos === buffer.length) {
            fillBuffer(buffer, hmac_, info, counter);
            bufpos = 0;
          }
          out[i] = buffer[bufpos++];
        }
        hmac_.clean();
        buffer.fill(0);
        counter.fill(0);
        return out;
      }
      __name(hkdf, "hkdf");
      exports2.hkdf = hkdf;
      function pbkdf2(password, salt, iterations, dkLen) {
        var prf = new HMAC(password);
        var len = prf.digestLength;
        var ctr = new Uint8Array(4);
        var t = new Uint8Array(len);
        var u = new Uint8Array(len);
        var dk = new Uint8Array(dkLen);
        for (var i = 0; i * len < dkLen; i++) {
          var c = i + 1;
          ctr[0] = c >>> 24 & 255;
          ctr[1] = c >>> 16 & 255;
          ctr[2] = c >>> 8 & 255;
          ctr[3] = c >>> 0 & 255;
          prf.reset();
          prf.update(salt);
          prf.update(ctr);
          prf.finish(u);
          for (var j = 0; j < len; j++) {
            t[j] = u[j];
          }
          for (var j = 2; j <= iterations; j++) {
            prf.reset();
            prf.update(u).finish(u);
            for (var k = 0; k < len; k++) {
              t[k] ^= u[k];
            }
          }
          for (var j = 0; j < len && i * len + j < dkLen; j++) {
            dk[i * len + j] = t[j];
          }
        }
        for (var i = 0; i < len; i++) {
          t[i] = u[i] = 0;
        }
        for (var i = 0; i < 4; i++) {
          ctr[i] = 0;
        }
        prf.clean();
        return dk;
      }
      __name(pbkdf2, "pbkdf2");
      exports2.pbkdf2 = pbkdf2;
    });
  }
});

// ../../node_modules/.bun/standardwebhooks@1.0.0/node_modules/standardwebhooks/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/.bun/standardwebhooks@1.0.0/node_modules/standardwebhooks/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Webhook = exports.WebhookVerificationError = void 0;
    var timing_safe_equal_1 = require_timing_safe_equal();
    var base64 = require_base64();
    var sha256 = require_sha256();
    var WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;
    var ExtendableError = class _ExtendableError extends Error {
      static {
        __name(this, "ExtendableError");
      }
      constructor(message) {
        super(message);
        Object.setPrototypeOf(this, _ExtendableError.prototype);
        this.name = "ExtendableError";
        this.stack = new Error(message).stack;
      }
    };
    var WebhookVerificationError = class _WebhookVerificationError extends ExtendableError {
      static {
        __name(this, "WebhookVerificationError");
      }
      constructor(message) {
        super(message);
        Object.setPrototypeOf(this, _WebhookVerificationError.prototype);
        this.name = "WebhookVerificationError";
      }
    };
    exports.WebhookVerificationError = WebhookVerificationError;
    var Webhook2 = class _Webhook {
      static {
        __name(this, "Webhook");
      }
      constructor(secret, options) {
        if (!secret) {
          throw new Error("Secret can't be empty.");
        }
        if ((options === null || options === void 0 ? void 0 : options.format) === "raw") {
          if (secret instanceof Uint8Array) {
            this.key = secret;
          } else {
            this.key = Uint8Array.from(secret, (c) => c.charCodeAt(0));
          }
        } else {
          if (typeof secret !== "string") {
            throw new Error("Expected secret to be of type string");
          }
          if (secret.startsWith(_Webhook.prefix)) {
            secret = secret.substring(_Webhook.prefix.length);
          }
          this.key = base64.decode(secret);
        }
      }
      verify(payload, headers_) {
        const headers = {};
        for (const key of Object.keys(headers_)) {
          headers[key.toLowerCase()] = headers_[key];
        }
        const msgId = headers["webhook-id"];
        const msgSignature = headers["webhook-signature"];
        const msgTimestamp = headers["webhook-timestamp"];
        if (!msgSignature || !msgId || !msgTimestamp) {
          throw new WebhookVerificationError("Missing required headers");
        }
        const timestamp = this.verifyTimestamp(msgTimestamp);
        const computedSignature = this.sign(msgId, timestamp, payload);
        const expectedSignature = computedSignature.split(",")[1];
        const passedSignatures = msgSignature.split(" ");
        const encoder = new globalThis.TextEncoder();
        for (const versionedSignature of passedSignatures) {
          const [version, signature] = versionedSignature.split(",");
          if (version !== "v1") {
            continue;
          }
          if ((0, timing_safe_equal_1.timingSafeEqual)(encoder.encode(signature), encoder.encode(expectedSignature))) {
            return JSON.parse(payload.toString());
          }
        }
        throw new WebhookVerificationError("No matching signature found");
      }
      sign(msgId, timestamp, payload) {
        if (typeof payload === "string") {
        } else if (payload.constructor.name === "Buffer") {
          payload = payload.toString();
        } else {
          throw new Error("Expected payload to be of type string or Buffer.");
        }
        const encoder = new TextEncoder();
        const timestampNumber = Math.floor(timestamp.getTime() / 1e3);
        const toSign = encoder.encode(`${msgId}.${timestampNumber}.${payload}`);
        const expectedSignature = base64.encode(sha256.hmac(this.key, toSign));
        return `v1,${expectedSignature}`;
      }
      verifyTimestamp(timestampHeader) {
        const now = Math.floor(Date.now() / 1e3);
        const timestamp = parseInt(timestampHeader, 10);
        if (isNaN(timestamp)) {
          throw new WebhookVerificationError("Invalid Signature Headers");
        }
        if (now - timestamp > WEBHOOK_TOLERANCE_IN_SECONDS) {
          throw new WebhookVerificationError("Message timestamp too old");
        }
        if (timestamp > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
          throw new WebhookVerificationError("Message timestamp too new");
        }
        return new Date(timestamp * 1e3);
      }
    };
    exports.Webhook = Webhook2;
    Webhook2.prefix = "whsec_";
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/webhook.js
var require_webhook = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/webhook.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Webhook = exports.WebhookVerificationError = void 0;
    var standardwebhooks_1 = require_dist();
    var standardwebhooks_2 = require_dist();
    Object.defineProperty(exports, "WebhookVerificationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return standardwebhooks_2.WebhookVerificationError;
    }, "get") });
    var Webhook2 = class {
      static {
        __name(this, "Webhook");
      }
      constructor(secret, options) {
        this.inner = new standardwebhooks_1.Webhook(secret, options);
      }
      verify(payload, headers_) {
        var _a, _b, _c, _d, _e, _f;
        const headers = {};
        for (const key of Object.keys(headers_)) {
          headers[key.toLowerCase()] = headers_[key];
        }
        headers["webhook-id"] = (_b = (_a = headers["svix-id"]) !== null && _a !== void 0 ? _a : headers["webhook-id"]) !== null && _b !== void 0 ? _b : "";
        headers["webhook-signature"] = (_d = (_c = headers["svix-signature"]) !== null && _c !== void 0 ? _c : headers["webhook-signature"]) !== null && _d !== void 0 ? _d : "";
        headers["webhook-timestamp"] = (_f = (_e = headers["svix-timestamp"]) !== null && _e !== void 0 ? _e : headers["webhook-timestamp"]) !== null && _f !== void 0 ? _f : "";
        return this.inner.verify(payload, headers);
      }
      sign(msgId, timestamp, payload) {
        return this.inner.sign(msgId, timestamp, payload);
      }
    };
    exports.Webhook = Webhook2;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointDisabledTrigger.js
var require_endpointDisabledTrigger = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/endpointDisabledTrigger.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointDisabledTriggerSerializer = exports.EndpointDisabledTrigger = void 0;
    var EndpointDisabledTrigger;
    (function(EndpointDisabledTrigger2) {
      EndpointDisabledTrigger2["Manual"] = "manual";
      EndpointDisabledTrigger2["Automatic"] = "automatic";
    })(EndpointDisabledTrigger = exports.EndpointDisabledTrigger || (exports.EndpointDisabledTrigger = {}));
    exports.EndpointDisabledTriggerSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ordering.js
var require_ordering = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/ordering.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OrderingSerializer = exports.Ordering = void 0;
    var Ordering;
    (function(Ordering2) {
      Ordering2["Ascending"] = "ascending";
      Ordering2["Descending"] = "descending";
    })(Ordering = exports.Ordering || (exports.Ordering = {}));
    exports.OrderingSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/index.js
var require_models = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusCodeClass = exports.SinkStatusIn = exports.SinkStatus = exports.Ordering = exports.MessageStatusText = exports.MessageStatus = exports.MessageAttemptTriggerType = exports.EndpointDisabledTrigger = exports.ConnectorProduct = exports.ConnectorKind = exports.BackgroundTaskType = exports.BackgroundTaskStatus = exports.AppPortalCapability = void 0;
    var appPortalCapability_1 = require_appPortalCapability();
    Object.defineProperty(exports, "AppPortalCapability", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return appPortalCapability_1.AppPortalCapability;
    }, "get") });
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    Object.defineProperty(exports, "BackgroundTaskStatus", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return backgroundTaskStatus_1.BackgroundTaskStatus;
    }, "get") });
    var backgroundTaskType_1 = require_backgroundTaskType();
    Object.defineProperty(exports, "BackgroundTaskType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return backgroundTaskType_1.BackgroundTaskType;
    }, "get") });
    var connectorKind_1 = require_connectorKind();
    Object.defineProperty(exports, "ConnectorKind", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return connectorKind_1.ConnectorKind;
    }, "get") });
    var connectorProduct_1 = require_connectorProduct();
    Object.defineProperty(exports, "ConnectorProduct", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return connectorProduct_1.ConnectorProduct;
    }, "get") });
    var endpointDisabledTrigger_1 = require_endpointDisabledTrigger();
    Object.defineProperty(exports, "EndpointDisabledTrigger", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return endpointDisabledTrigger_1.EndpointDisabledTrigger;
    }, "get") });
    var messageAttemptTriggerType_1 = require_messageAttemptTriggerType();
    Object.defineProperty(exports, "MessageAttemptTriggerType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return messageAttemptTriggerType_1.MessageAttemptTriggerType;
    }, "get") });
    var messageStatus_1 = require_messageStatus();
    Object.defineProperty(exports, "MessageStatus", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return messageStatus_1.MessageStatus;
    }, "get") });
    var messageStatusText_1 = require_messageStatusText();
    Object.defineProperty(exports, "MessageStatusText", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return messageStatusText_1.MessageStatusText;
    }, "get") });
    var ordering_1 = require_ordering();
    Object.defineProperty(exports, "Ordering", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ordering_1.Ordering;
    }, "get") });
    var sinkStatus_1 = require_sinkStatus();
    Object.defineProperty(exports, "SinkStatus", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return sinkStatus_1.SinkStatus;
    }, "get") });
    var sinkStatusIn_1 = require_sinkStatusIn();
    Object.defineProperty(exports, "SinkStatusIn", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return sinkStatusIn_1.SinkStatusIn;
    }, "get") });
    var statusCodeClass_1 = require_statusCodeClass();
    Object.defineProperty(exports, "StatusCodeClass", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return statusCodeClass_1.StatusCodeClass;
    }, "get") });
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api_internal/index.js
var require_api_internal = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api_internal/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SvixInternal = void 0;
    var __1 = require_dist2();
    var SvixInternal = class extends __1.Svix {
      static {
        __name(this, "SvixInternal");
      }
      getRequestCtx() {
        return this.requestCtx;
      }
    };
    exports.SvixInternal = SvixInternal;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkInCommon.js
var require_sinkInCommon = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/sinkInCommon.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkInCommonSerializer = void 0;
    exports.SinkInCommonSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          throttleRate: object["throttleRate"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          throttleRate: self.throttleRate,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/autoConfigSinkType.js
var require_autoConfigSinkType = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/autoConfigSinkType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoConfigSinkTypeSerializer = void 0;
    var endpointIn_1 = require_endpointIn();
    var sinkInCommon_1 = require_sinkInCommon();
    exports.AutoConfigSinkTypeSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return sinkInCommon_1.SinkInCommonSerializer._fromJsonObject(object["config"]);
            case "http":
              return endpointIn_1.EndpointInSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        __name(getConfig, "getConfig");
        return {
          type,
          config: getConfig(type)
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = sinkInCommon_1.SinkInCommonSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = endpointIn_1.EndpointInSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/subscribeIn.js
var require_subscribeIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/subscribeIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SubscribeInSerializer = void 0;
    var autoConfigSinkType_1 = require_autoConfigSinkType();
    var endpointIn_1 = require_endpointIn();
    exports.SubscribeInSerializer = {
      _fromJsonObject(object) {
        return {
          endpoint: object["endpoint"] != null ? endpointIn_1.EndpointInSerializer._fromJsonObject(object["endpoint"]) : void 0,
          sink: object["sink"] != null ? autoConfigSinkType_1.AutoConfigSinkTypeSerializer._fromJsonObject(object["sink"]) : void 0
        };
      },
      _toJsonObject(self) {
        return {
          endpoint: self.endpoint != null ? endpointIn_1.EndpointInSerializer._toJsonObject(self.endpoint) : void 0,
          sink: self.sink != null ? autoConfigSinkType_1.AutoConfigSinkTypeSerializer._toJsonObject(self.sink) : void 0
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api_internal/endpointAutoConfig.js
var require_endpointAutoConfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api_internal/endpointAutoConfig.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointAutoConfig = void 0;
    var endpointOut_1 = require_endpointOut();
    var subscribeIn_1 = require_subscribeIn();
    var request_1 = require_request();
    var EndpointAutoConfig = class {
      static {
        __name(this, "EndpointAutoConfig");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      update(appId, endpointId, subscribeIn = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/auto-config");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(subscribeIn_1.SubscribeInSerializer._toJsonObject(subscribeIn));
          return yield request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
        });
      }
    };
    exports.EndpointAutoConfig = EndpointAutoConfig;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api_internal/endpoint.js
var require_endpoint2 = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api_internal/endpoint.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Endpoint = void 0;
    var endpointTransformationIn_1 = require_endpointTransformationIn();
    var endpointAutoConfig_1 = require_endpointAutoConfig();
    var request_1 = require_request();
    var Endpoint = class {
      static {
        __name(this, "Endpoint");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get auto_config() {
        return new endpointAutoConfig_1.EndpointAutoConfig(this.requestCtx);
      }
      transformationPartialUpdate(appId, endpointId, endpointTransformationIn = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
          request.setPathParam("app_id", appId);
          request.setPathParam("endpoint_id", endpointId);
          request.setBody(endpointTransformationIn_1.EndpointTransformationInSerializer._toJsonObject(endpointTransformationIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
    };
    exports.Endpoint = Endpoint;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/autoconfig.js
var require_autoconfig = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/autoconfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoConfig = exports.decodeAutoconfigTokenV1 = exports.isAutoConfigTokenContentV1 = exports.AutoConfigError = void 0;
    var api_internal_1 = require_api_internal();
    var endpoint_1 = require_endpoint2();
    var webhook_1 = require_webhook();
    var AUTOCONFIG_TOKEN_PREFIX_V1 = "auto_v1_";
    var AutoConfigError = class extends Error {
      static {
        __name(this, "AutoConfigError");
      }
      constructor(message = "invalid token") {
        super(message);
        this.name = "AutoConfigError";
      }
    };
    exports.AutoConfigError = AutoConfigError;
    function isAutoConfigTokenContentV1(value) {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      const { aid, eid, surl, esec, tok } = value;
      return typeof aid === "string" && typeof eid === "string" && typeof surl === "string" && typeof esec === "string" && typeof tok === "string";
    }
    __name(isAutoConfigTokenContentV1, "isAutoConfigTokenContentV1");
    exports.isAutoConfigTokenContentV1 = isAutoConfigTokenContentV1;
    function decodeAutoconfigTokenV1(token) {
      if (!token.startsWith(AUTOCONFIG_TOKEN_PREFIX_V1)) {
        throw new AutoConfigError();
      }
      const b64 = token.slice(AUTOCONFIG_TOKEN_PREFIX_V1.length);
      let json;
      try {
        json = Buffer.from(b64, "base64").toString("utf8");
      } catch (_a) {
        throw new AutoConfigError();
      }
      let parsed;
      try {
        parsed = JSON.parse(json);
      } catch (_b) {
        throw new AutoConfigError();
      }
      if (!isAutoConfigTokenContentV1(parsed)) {
        throw new AutoConfigError();
      }
      return parsed;
    }
    __name(decodeAutoconfigTokenV1, "decodeAutoconfigTokenV1");
    exports.decodeAutoconfigTokenV1 = decodeAutoconfigTokenV1;
    var AutoConfig = class {
      static {
        __name(this, "AutoConfig");
      }
      constructor(token, endpoint) {
        const content = decodeAutoconfigTokenV1(token);
        let webhook;
        try {
          webhook = new webhook_1.Webhook(content.esec);
        } catch (_a) {
          throw new AutoConfigError();
        }
        this.appId = content.aid;
        this.endpointId = content.eid;
        this.endpointIn = endpoint;
        this.webhook = webhook;
        const svix = new api_internal_1.SvixInternal(content.tok, { serverUrl: content.surl });
        this.requestCtx = svix.getRequestCtx();
      }
      subscribe() {
        return new endpoint_1.Endpoint(this.requestCtx).auto_config.update(this.appId, this.endpointId, {
          endpoint: this.endpointIn
        });
      }
      verify(payload, headers) {
        return this.webhook.verify(payload, headers);
      }
    };
    exports.AutoConfig = AutoConfig;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollerV2CommitIn.js
var require_pollerV2CommitIn = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollerV2CommitIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollerV2CommitInSerializer = void 0;
    exports.PollerV2CommitInSerializer = {
      _fromJsonObject(object) {
        return {
          offset: object["offset"]
        };
      },
      _toJsonObject(self) {
        return {
          offset: self.offset
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollerV2MessageOut.js
var require_pollerV2MessageOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollerV2MessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollerV2MessageOutSerializer = void 0;
    exports.PollerV2MessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          headers: object["headers"],
          id: object["id"],
          offset: object["offset"],
          payload: object["payload"],
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          headers: self.headers,
          id: self.id,
          offset: self.offset,
          payload: self.payload,
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollerV2PollOut.js
var require_pollerV2PollOut = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/models/pollerV2PollOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollerV2PollOutSerializer = void 0;
    var pollerV2MessageOut_1 = require_pollerV2MessageOut();
    exports.PollerV2PollOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => pollerV2MessageOut_1.PollerV2MessageOutSerializer._fromJsonObject(item)),
          done: object["done"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => pollerV2MessageOut_1.PollerV2MessageOutSerializer._toJsonObject(item)),
          done: self.done
        };
      }
    };
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api_internal/messagePollerv2.js
var require_messagePollerv2 = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/api_internal/messagePollerv2.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessagePollerv2 = void 0;
    var pollerV2CommitIn_1 = require_pollerV2CommitIn();
    var pollerV2PollOut_1 = require_pollerV2PollOut();
    var request_1 = require_request();
    var MessagePollerv2 = class {
      static {
        __name(this, "MessagePollerv2");
      }
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      consumerPoll(appId, sinkId, consumerId, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/polling-endpoint/{sink_id}/consumer/{consumer_id}");
          request.setPathParam("app_id", appId);
          request.setPathParam("sink_id", sinkId);
          request.setPathParam("consumer_id", consumerId);
          request.setQueryParams({
            limit: options === null || options === void 0 ? void 0 : options.limit,
            lease_duration_ms: options === null || options === void 0 ? void 0 : options.leaseDurationMs,
            starting_position: options === null || options === void 0 ? void 0 : options.startingPosition
          });
          return yield request.send(this.requestCtx, pollerV2PollOut_1.PollerV2PollOutSerializer._fromJsonObject);
        });
      }
      consumerCommit(appId, sinkId, consumerId, pollerV2CommitIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/polling-endpoint/{sink_id}/consumer/{consumer_id}/commit");
          request.setPathParam("app_id", appId);
          request.setPathParam("sink_id", sinkId);
          request.setPathParam("consumer_id", consumerId);
          request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
          request.setBody(pollerV2CommitIn_1.PollerV2CommitInSerializer._toJsonObject(pollerV2CommitIn));
          return yield request.sendNoResponseBody(this.requestCtx);
        });
      }
    };
    exports.MessagePollerv2 = MessagePollerv2;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/autoconfigConsumer.js
var require_autoconfigConsumer = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/autoconfigConsumer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoConfigConsumer = void 0;
    var api_internal_1 = require_api_internal();
    var endpoint_1 = require_endpoint2();
    var messagePollerv2_1 = require_messagePollerv2();
    var autoconfig_1 = require_autoconfig();
    var AutoConfigConsumer = class {
      static {
        __name(this, "AutoConfigConsumer");
      }
      constructor(token, sinkIn) {
        const content = (0, autoconfig_1.decodeAutoconfigTokenV1)(token);
        this.appId = content.aid;
        this.sinkId = content.eid;
        this.sinkIn = sinkIn;
        const svix = new api_internal_1.SvixInternal(content.tok, { serverUrl: content.surl });
        this.requestCtx = svix.getRequestCtx();
      }
      subscribe() {
        return new endpoint_1.Endpoint(this.requestCtx).auto_config.update(this.appId, this.sinkId, {
          sink: {
            type: "poller",
            config: this.sinkIn
          }
        });
      }
      receive(consumerId, options) {
        return new messagePollerv2_1.MessagePollerv2(this.requestCtx).consumerPoll(this.appId, this.sinkId, consumerId, options);
      }
      commit(consumerId, offset, options) {
        return new messagePollerv2_1.MessagePollerv2(this.requestCtx).consumerCommit(this.appId, this.sinkId, consumerId, {
          offset
        }, options);
      }
    };
    exports.AutoConfigConsumer = AutoConfigConsumer;
  }
});

// ../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/index.js
var require_dist2 = __commonJS({
  "../../node_modules/.bun/svix@1.99.1/node_modules/svix/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoConfigConsumer = exports.AutoConfigError = exports.AutoConfig = exports.Svix = exports.messageInRaw = exports.ValidationError = exports.HttpErrorOut = exports.HTTPValidationError = exports.ApiException = void 0;
    var application_1 = require_application();
    var authentication_1 = require_authentication();
    var backgroundTask_1 = require_backgroundTask();
    var connector_1 = require_connector();
    var endpoint_1 = require_endpoint();
    var environment_1 = require_environment();
    var eventType_1 = require_eventType();
    var health_1 = require_health();
    var ingest_1 = require_ingest();
    var integration_1 = require_integration();
    var message_1 = require_message();
    var messageAttempt_1 = require_messageAttempt();
    var operationalWebhook_1 = require_operationalWebhook();
    var statistics_1 = require_statistics();
    var streaming_1 = require_streaming();
    var operationalWebhookEndpoint_1 = require_operationalWebhookEndpoint();
    var util_1 = require_util();
    Object.defineProperty(exports, "ApiException", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.ApiException;
    }, "get") });
    var HttpErrors_1 = require_HttpErrors();
    Object.defineProperty(exports, "HTTPValidationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return HttpErrors_1.HTTPValidationError;
    }, "get") });
    Object.defineProperty(exports, "HttpErrorOut", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return HttpErrors_1.HttpErrorOut;
    }, "get") });
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return HttpErrors_1.ValidationError;
    }, "get") });
    __exportStar(require_webhook(), exports);
    __exportStar(require_models(), exports);
    var message_2 = require_message();
    Object.defineProperty(exports, "messageInRaw", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return message_2.messageInRaw;
    }, "get") });
    var REGIONS = [
      { region: "us", url: "https://api.us.svix.com" },
      { region: "eu", url: "https://api.eu.svix.com" },
      { region: "in", url: "https://api.in.svix.com" },
      { region: "ca", url: "https://api.ca.svix.com" },
      { region: "au", url: "https://api.au.svix.com" }
    ];
    var Svix = class {
      static {
        __name(this, "Svix");
      }
      constructor(token, options = {}) {
        var _a, _b, _c;
        const regionalUrl = (_a = REGIONS.find((x) => x.region === token.split(".")[1])) === null || _a === void 0 ? void 0 : _a.url;
        const baseUrl = (_c = (_b = options.serverUrl) !== null && _b !== void 0 ? _b : regionalUrl) !== null && _c !== void 0 ? _c : "https://api.svix.com";
        if (options.retryScheduleInMs) {
          this.requestCtx = {
            baseUrl,
            token,
            timeout: options.requestTimeout,
            retryScheduleInMs: options.retryScheduleInMs,
            fetch: options.fetch
          };
          return;
        }
        if (options.numRetries) {
          this.requestCtx = {
            baseUrl,
            token,
            timeout: options.requestTimeout,
            numRetries: options.numRetries,
            fetch: options.fetch
          };
          return;
        }
        this.requestCtx = {
          baseUrl,
          token,
          timeout: options.requestTimeout,
          fetch: options.fetch
        };
      }
      get application() {
        return new application_1.Application(this.requestCtx);
      }
      get authentication() {
        return new authentication_1.Authentication(this.requestCtx);
      }
      get backgroundTask() {
        return new backgroundTask_1.BackgroundTask(this.requestCtx);
      }
      get connector() {
        return new connector_1.Connector(this.requestCtx);
      }
      get endpoint() {
        return new endpoint_1.Endpoint(this.requestCtx);
      }
      get environment() {
        return new environment_1.Environment(this.requestCtx);
      }
      get eventType() {
        return new eventType_1.EventType(this.requestCtx);
      }
      get health() {
        return new health_1.Health(this.requestCtx);
      }
      get ingest() {
        return new ingest_1.Ingest(this.requestCtx);
      }
      get integration() {
        return new integration_1.Integration(this.requestCtx);
      }
      get message() {
        return new message_1.Message(this.requestCtx);
      }
      get messageAttempt() {
        return new messageAttempt_1.MessageAttempt(this.requestCtx);
      }
      get operationalWebhook() {
        return new operationalWebhook_1.OperationalWebhook(this.requestCtx);
      }
      get statistics() {
        return new statistics_1.Statistics(this.requestCtx);
      }
      get streaming() {
        return new streaming_1.Streaming(this.requestCtx);
      }
      get operationalWebhookEndpoint() {
        return new operationalWebhookEndpoint_1.OperationalWebhookEndpoint(this.requestCtx);
      }
    };
    exports.Svix = Svix;
    var autoconfig_1 = require_autoconfig();
    Object.defineProperty(exports, "AutoConfig", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return autoconfig_1.AutoConfig;
    }, "get") });
    Object.defineProperty(exports, "AutoConfigError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return autoconfig_1.AutoConfigError;
    }, "get") });
    var autoconfigConsumer_1 = require_autoconfigConsumer();
    Object.defineProperty(exports, "AutoConfigConsumer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return autoconfigConsumer_1.AutoConfigConsumer;
    }, "get") });
  }
});

// src/index.ts
var import_svix = __toESM(require_dist2(), 1);
function parseEmail(str) {
  const match = str.match(/(?:(.*?)<)?([^>]+)>?/);
  if (match) {
    const name = match[1]?.trim().replace(/^["']|["']$/g, "");
    const address = match[2]?.trim() ?? str.trim();
    return { name: name || void 0, address };
  }
  return { address: str.trim() };
}
__name(parseEmail, "parseEmail");
function extractEmailAddresses(arr) {
  return arr.map((a) => parseEmail(a).address);
}
__name(extractEmailAddresses, "extractEmailAddresses");
var index_default = {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    if (!env.RESEND_WEBHOOK_SECRET || !env.MAIL_INBOUND_WEBHOOK_SECRET) {
      return new Response("Worker missing secrets", { status: 500 });
    }
    const wh = new import_svix.Webhook(env.RESEND_WEBHOOK_SECRET);
    let event;
    try {
      event = wh.verify(payload, headers);
    } catch (err) {
      return new Response("Invalid signature", { status: 401 });
    }
    if (event.type !== "email.received") {
      return new Response("Event not supported", { status: 200 });
    }
    const data = event.data;
    const resendEmailId = data.email_id || data.id;
    let textBody = data.text || "";
    let htmlBody = data.html || "";
    if (env.RESEND_API_KEY && resendEmailId) {
      try {
        const res = await fetch(`https://api.resend.com/emails/${resendEmailId}`, {
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const emailData = await res.json();
          textBody = emailData.text || textBody;
          htmlBody = emailData.html || htmlBody;
        } else {
          console.error("Failed to fetch full email:", await res.text());
        }
      } catch (err) {
        console.error("Error fetching full email:", err);
      }
    }
    const fromParsed = parseEmail(data.from || "");
    const inboundBody = JSON.stringify({
      providerEventId: resendEmailId || `resend_${data.created_at}`,
      mailbox: extractEmailAddresses(data.to || [])[0],
      messageId: data.headers?.["Message-Id"] || data.headers?.["message-id"] || crypto.randomUUID(),
      inReplyTo: data.headers?.["In-Reply-To"] || data.headers?.["in-reply-to"],
      references: [data.headers?.["References"] || data.headers?.["references"]].filter(Boolean),
      from: fromParsed.address,
      fromName: fromParsed.name,
      to: extractEmailAddresses(data.to || []),
      cc: extractEmailAddresses(data.cc || []),
      subject: data.subject || "(no subject)",
      text: textBody,
      html: htmlBody,
      headers: data.headers || {}
    });
    const timestamp = Math.floor(Date.now() / 1e3).toString();
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(env.MAIL_INBOUND_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${timestamp}.${inboundBody}`)
    );
    const signatureHex = Array.from(new Uint8Array(signatureBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const response = await fetch(`${env.CONTROL_PLANE_URL}/api/mail/inbound`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-multivrs-timestamp": timestamp,
        "x-multivrs-signature": signatureHex
      },
      body: inboundBody
    });
    if (!response.ok) {
      const err = await response.text();
      console.error("Control plane rejected webhook:", err);
      return new Response(`Control plane failed: ${err}`, { status: response.status });
    }
    return new Response("OK", { status: 202 });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
