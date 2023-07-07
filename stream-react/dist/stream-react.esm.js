import React, { useState, useEffect, useMemo, useRef } from 'react';
import moment from 'moment';
import io from 'socket.io-client';

var sdkScriptLocation = "https://embed.cloudflarestream.com/embed/sdk.latest.js";
// This needs to be wrapped as such for two reasons:
// - Stream is a function, and useState invokes functions immediately and uses the return value.
// - We need to check typeof on window to ensure safety for server side rendering.
var safelyAccessStreamSDK = function safelyAccessStreamSDK() {
  if (typeof window === "undefined") return undefined;
  return window.Stream;
};
function useStreamSDK() {
  var _useState = useState(safelyAccessStreamSDK),
    streamSdk = _useState[0],
    setStreamSdk = _useState[1];
  useEffect(function () {
    if (!streamSdk) {
      var existingScript = document.querySelector("script[src='" + sdkScriptLocation + "']");
      var script = existingScript != null ? existingScript : document.createElement("script");
      script.addEventListener("load", function () {
        setStreamSdk(safelyAccessStreamSDK);
      });
      if (!existingScript) {
        script.src = sdkScriptLocation;
        document.head.appendChild(script);
      }
    }
  }, [streamSdk]);
  return streamSdk;
}

function useIframeSrc(src, _ref) {
  var muted = _ref.muted,
    preload = _ref.preload,
    loop = _ref.loop,
    autoplay = _ref.autoplay,
    controls = _ref.controls,
    poster = _ref.poster,
    primaryColor = _ref.primaryColor,
    letterboxColor = _ref.letterboxColor,
    adUrl = _ref.adUrl,
    startTime = _ref.startTime,
    defaultTextTrack = _ref.defaultTextTrack,
    customerCode = _ref.customerCode;
  var paramString = [poster && "poster=" + encodeURIComponent(poster), adUrl && "ad-url=" + encodeURIComponent(adUrl), defaultTextTrack && "defaultTextTrack=" + encodeURIComponent(defaultTextTrack), primaryColor && "primaryColor=" + encodeURIComponent(primaryColor), letterboxColor && "letterboxColor=" + encodeURIComponent(letterboxColor), startTime && "startTime=" + startTime, muted && "muted=true", preload && "preload=" + preload, loop && "loop=true", autoplay && "autoplay=true", !controls && "controls=false"].filter(Boolean).join("&");
  var iframeSrc = useMemo(function () {
    return customerCode ? "https://customer-" + customerCode + ".cloudflarestream.com/" + src + "?" + paramString : "https://iframe.cloudflarestream.com/" + src + "?" + paramString;
  },
  // we intentionally do NOT include paramString here because we want
  // to avoid changing the URL when these options change. Changes to
  // these options will instead be handled separately via the SDK.
  []);
  return iframeSrc;
}

function validSrcUrl(str) {
  try {
    var url = new URL(str);
    return url.hostname.endsWith("videodelivery.net") || url.hostname.endsWith("cloudflarestream.com");
  } catch (_unused) {
    return false;
  }
}

/**
 * Hook for syncing properties to the SDK api when they change
 */
function useProperty(name, ref, value) {
  useEffect(function () {
    if (!ref.current) return;
    var el = ref.current;
    el[name] = value;
  }, [name, value, ref]);
}
/**
 * Hook for binding event listeners to the player.
 */
function useEvent(event, ref, callback) {
  if (callback === void 0) {
    callback = noop;
  }
  useEffect(function () {
    if (!ref.current) return;
    var el = ref.current;
    el.addEventListener(event, callback);
    // clean up
    return function () {
      return el.removeEventListener(event, callback);
    };
  }, [callback, event, ref]);
}
// Declaring a single noop function that will retain object
// identity across renders and prevent unnecessary rebinding
// when no callback is provided
var noop = function noop() {};
var Stream = function Stream(props) {
  var streamSdk = useStreamSDK();
  return streamSdk ? /*#__PURE__*/React.createElement(StreamEmbed, Object.assign({}, props)) : null;
};
var responsiveIframeStyles = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  height: "100%",
  width: "100%"
};
var Container = function Container(_ref) {
  var children = _ref.children,
    responsive = _ref.responsive,
    className = _ref.className,
    videoDimensions = _ref.videoDimensions;
  var videoHeight = videoDimensions.videoHeight,
    videoWidth = videoDimensions.videoWidth;
  var responsiveStyles = useMemo(function () {
    return {
      position: "relative",
      paddingTop: videoWidth > 0 ? videoHeight / videoWidth * 100 + "%" : undefined
    };
  }, [videoWidth, videoHeight]);
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: responsive ? responsiveStyles : undefined
  }, children);
};
var StreamEmbed = function StreamEmbed(_ref2) {
  var src = _ref2.src,
    customerCode = _ref2.customerCode,
    adUrl = _ref2.adUrl,
    _ref2$controls = _ref2.controls,
    controls = _ref2$controls === void 0 ? false : _ref2$controls,
    _ref2$muted = _ref2.muted,
    muted = _ref2$muted === void 0 ? false : _ref2$muted,
    _ref2$autoplay = _ref2.autoplay,
    autoplay = _ref2$autoplay === void 0 ? false : _ref2$autoplay,
    _ref2$loop = _ref2.loop,
    loop = _ref2$loop === void 0 ? false : _ref2$loop,
    _ref2$preload = _ref2.preload,
    preload = _ref2$preload === void 0 ? "metadata" : _ref2$preload,
    primaryColor = _ref2.primaryColor,
    letterboxColor = _ref2.letterboxColor,
    defaultTextTrack = _ref2.defaultTextTrack,
    height = _ref2.height,
    width = _ref2.width,
    poster = _ref2.poster,
    _ref2$currentTime = _ref2.currentTime,
    currentTime = _ref2$currentTime === void 0 ? 0 : _ref2$currentTime,
    _ref2$volume = _ref2.volume,
    volume = _ref2$volume === void 0 ? 1 : _ref2$volume,
    startTime = _ref2.startTime,
    streamRef = _ref2.streamRef,
    _ref2$responsive = _ref2.responsive,
    responsive = _ref2$responsive === void 0 ? true : _ref2$responsive,
    className = _ref2.className,
    title = _ref2.title,
    onAbort = _ref2.onAbort,
    onCanPlay = _ref2.onCanPlay,
    onCanPlayThrough = _ref2.onCanPlayThrough,
    onDurationChange = _ref2.onDurationChange,
    onEnded = _ref2.onEnded,
    onError = _ref2.onError,
    onLoadedData = _ref2.onLoadedData,
    onLoadedMetaData = _ref2.onLoadedMetaData,
    onLoadStart = _ref2.onLoadStart,
    onPause = _ref2.onPause,
    onPlay = _ref2.onPlay,
    onPlaying = _ref2.onPlaying,
    onProgress = _ref2.onProgress,
    onRateChange = _ref2.onRateChange,
    onResize = _ref2.onResize,
    onSeeked = _ref2.onSeeked,
    onSeeking = _ref2.onSeeking,
    onStalled = _ref2.onStalled,
    onSuspend = _ref2.onSuspend,
    onTimeUpdate = _ref2.onTimeUpdate,
    onVolumeChange = _ref2.onVolumeChange,
    onWaiting = _ref2.onWaiting,
    onStreamAdStart = _ref2.onStreamAdStart,
    onStreamAdEnd = _ref2.onStreamAdEnd,
    onStreamAdTimeout = _ref2.onStreamAdTimeout;
  var internalRef = useRef();
  var ref = streamRef != null ? streamRef : internalRef;
  var _useState = useState({
      videoHeight: 0,
      videoWidth: 0
    }),
    videoDimensions = _useState[0],
    setVideoDimensions = _useState[1];
  var iframeRef = useRef(null);
  var computedSrc = useIframeSrc(src, {
    customerCode: customerCode,
    muted: muted,
    preload: preload,
    loop: loop,
    autoplay: autoplay,
    controls: controls,
    poster: poster,
    primaryColor: primaryColor,
    letterboxColor: letterboxColor,
    adUrl: adUrl,
    defaultTextTrack: defaultTextTrack,
    startTime: startTime
  });
  // While it's easier for most consumers to simply provide the video id
  // or signed URL and have us compute the iframe's src for them, some
  // consumers may need to manually specify the iframe's src.
  var iframeSrc = validSrcUrl(src) ? src : computedSrc;
  useProperty("muted", ref, muted);
  useProperty("controls", ref, controls);
  useProperty("src", ref, src);
  useProperty("autoplay", ref, autoplay);
  useProperty("currentTime", ref, currentTime);
  useProperty("loop", ref, loop);
  useProperty("preload", ref, preload);
  useProperty("primaryColor", ref, primaryColor);
  useProperty("letterboxColor", ref, letterboxColor);
  useProperty("volume", ref, volume);
  // instantiate API after properties are bound because we want undefined
  // values to be set before defining the properties
  useEffect(function () {
    var Stream = safelyAccessStreamSDK();
    if (iframeRef.current && Stream) {
      var api = Stream(iframeRef.current);
      ref.current = api;
      var videoHeight = api.videoHeight,
        videoWidth = api.videoWidth;
      if (videoHeight && videoWidth) setVideoDimensions({
        videoHeight: videoHeight,
        videoWidth: videoWidth
      });
    }
  }, []);
  // bind events
  useEvent("abort", ref, onAbort);
  useEvent("canplay", ref, onCanPlay);
  useEvent("canplaythrough", ref, onCanPlayThrough);
  useEvent("durationchange", ref, onDurationChange);
  useEvent("ended", ref, onEnded);
  useEvent("error", ref, onError);
  useEvent("loadeddata", ref, onLoadedData);
  useEvent("loadedmetadata", ref, onLoadedMetaData);
  useEvent("loadstart", ref, onLoadStart);
  useEvent("pause", ref, onPause);
  useEvent("play", ref, onPlay);
  useEvent("playing", ref, onPlaying);
  useEvent("progress", ref, onProgress);
  useEvent("ratechange", ref, onRateChange);
  useEvent("seeked", ref, onSeeked);
  useEvent("seeking", ref, onSeeking);
  useEvent("stalled", ref, onStalled);
  useEvent("suspend", ref, onSuspend);
  useEvent("timeupdate", ref, onTimeUpdate);
  useEvent("volumechange", ref, onVolumeChange);
  useEvent("waiting", ref, onWaiting);
  useEvent("stream-adstart", ref, onStreamAdStart);
  useEvent("stream-adend", ref, onStreamAdEnd);
  useEvent("stream-adtimeout", ref, onStreamAdTimeout);
  useEvent("resize", ref, function (e) {
    if (ref.current) {
      var _ref$current = ref.current,
        videoHeight = _ref$current.videoHeight,
        videoWidth = _ref$current.videoWidth;
      setVideoDimensions({
        videoHeight: videoHeight,
        videoWidth: videoWidth
      });
      onResize && onResize(e);
    }
  });
  return /*#__PURE__*/React.createElement(Container, {
    className: className,
    responsive: responsive,
    videoDimensions: videoDimensions
  }, /*#__PURE__*/React.createElement("iframe", {
    ref: iframeRef,
    src: iframeSrc,
    title: title,
    style: responsive ? responsiveIframeStyles : undefined,
    frameBorder: 0,
    height: height,
    width: width,
    allow: "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;",
    allowFullScreen: true
  }));
};

function _regeneratorRuntime() {
  _regeneratorRuntime = function () {
    return exports;
  };
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function (method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method,
      method = delegate.iterator[methodName];
    if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) keys.push(key);
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
    },
    stop: function () {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function (record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    catch: function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

// Socket.IO Endpoint
var SocketEndpoint = "ws://localhost:3000";
if (window && window.location && window.location.hostname) {
  var hostname = window.location.hostname;
  if (hostname === "stage.cafeteria.gg" || hostname === "node-stage.cafeteria.gg") {
    SocketEndpoint = "wss://node-stage.cafeteria.gg";
  } else if (hostname === "cafeteria.gg" || hostname === "main.cafeteria.gg" || hostname === "node-main.cafeteria.gg") {
    SocketEndpoint = "wss://node-main.cafeteria.gg";
  }
}
// Returns API URL depending on hostname
var getApiUrl = function getApiUrl() {
  var url = "http://localhost:3000/v1";
  if (window && window.location && window.location.hostname) {
    var _hostname = window.location.hostname;
    if (_hostname === "stage.cafeteria.gg" || _hostname === "node-stage.cafeteria.gg") {
      url = "https://node-stage.cafeteria.gg/v1";
    } else if (_hostname === "cafeteria.gg" || _hostname === "main.cafeteria.gg" || _hostname === "node-main.cafeteria.gg") {
      url = "https://node-main.cafeteria.gg/v1";
    }
  }
  return url;
};
// Functional Component
var StreamView = function StreamView(props) {
  var containerStyle = {
    backgroundColor: 'rgba(26, 26, 26, 1.0)',
    height: '100%',
    width: '100%',
    position: 'absolute',
    margin: 0,
    padding: 0
  };
  var countdownBadgeTitle = {
    fontFamily: 'Inter',
    fontWeight: 900,
    color: 'white',
    margin: 0
  };
  var countdownBadgeStyle = {
    backgroundColor: 'rgba(21, 21, 21, 1.0)',
    padding: '5px 15px 5px 10px',
    borderRadius: '10px',
    margin: 0
  };
  var countdownStyle = {
    color: 'white',
    fontSize: '4rem',
    fontWeight: 900,
    marginBottom: '3rem'
  };
  var cardStyle = {
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    border: '0px',
    borderColor: 'rgba(26, 26, 26, 1.0)'
  };
  var cardRatioStyle = {
    background: 'linear-gradient(60deg,#09d8a2,#4532a0)',
    borderRadius: '0.5rem 0.5rem 0 0'
  };
  var cardRatioImageStyle = {
    borderRadius: '0.5rem 0.5rem 0 0'
  };
  var cardTitleStyle = {
    fontSize: "1.6rem",
    marginTop: '1rem',
    fontFamily: 'Inter',
    fontWeight: 900,
    color: 'rgba(72, 72, 72, 1.0)'
  };
  var cardTextStyle = {
    fontSize: "1.4rem",
    fontFamily: 'Inter',
    fontWeight: 500,
    color: 'rgba(100, 100, 120, 1.0)'
  };
  var cardCategoryStyle = {
    position: 'absolute',
    bottom: '25px',
    marginLeft: '10px',
    backgroundColor: 'white',
    padding: '10px 20px 10px 15px',
    fontWeight: 600,
    fontSize: '1.2rem',
    boxShadow: '0 0 10px rgb(0 0 0 / 15%)'
  };
  var cardCategoryTextStyle = {
    color: 'rgba(106, 106, 106, 1.0)'
  };
  var cardFooterStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: 'rgba(26, 26, 26, 1.0)'
  };
  var cardFooterBadgeLeftStyle = {
    backgroundColor: 'rgb(21, 21, 21)',
    padding: '0.75rem',
    marginRight: '2rem',
    fontWeight: 900,
    fontSize: '1.2rem'
  };
  var cardFooterBadgeRightStyle = {
    backgroundColor: 'rgb(21, 21, 21)',
    padding: '0.75rem',
    fontWeight: 900,
    fontSize: '1.2rem'
  };
  var cardFooterBadgeImageStyle = {
    marginRight: '0.5rem'
  };
  // Socket.IO
  var _useState = useState(false),
    setIsConnected = _useState[1];
  // UI State
  var _useState2 = useState(true),
    isLoading = _useState2[0],
    setIsLoading = _useState2[1];
  var _useState3 = useState(false),
    isStreamReady = _useState3[0],
    setIsStreamReady = _useState3[1];
  var _useState4 = useState('00:00:00'),
    countdownText = _useState4[0],
    setCountdownText = _useState4[1];
  var _useState5 = useState(0);
  var _useState6 = useState('rgba(0, 0, 0, 0)'),
    controlBackgroundColor = _useState6[0];
  var _useState7 = useState(false),
    isMuteButtonShowing = _useState7[0],
    setIsMuteButtonShowing = _useState7[1];
  // UI Ref
  var streamRef = useRef(undefined);
  // Required stream meta data
  var _useState8 = useState(undefined),
    streamData = _useState8[0],
    setStreamData = _useState8[1];
  var _useState9 = useState(true),
    streamMuted = _useState9[0],
    setStreamMuted = _useState9[1];
  var _useState10 = useState(false),
    streamLoop = _useState10[0],
    setStreamLoop = _useState10[1];
  var _useState11 = useState(''),
    streamImageSrc = _useState11[0],
    setStreamImageSrc = _useState11[1];
  var _useState12 = useState(''),
    streamVideoId = _useState12[0],
    setStreamVideoId = _useState12[1];
  var _useState13 = useState(''),
    streamTitle = _useState13[0],
    setStreamTitle = _useState13[1];
  var _useState14 = useState(''),
    streamText = _useState14[0],
    setStreamText = _useState14[1];
  var _useState15 = useState(''),
    streamCategory = _useState15[0],
    setStreamCategory = _useState15[1];
  var _useState16 = useState(1),
    streamStartTime = _useState16[0],
    setStreamStartTime = _useState16[1];
  var _useState17 = useState(0),
    streamViewers = _useState17[0],
    setStreamViewers = _useState17[1];
  var _useState18 = useState(''),
    streamScheduleText = _useState18[0],
    setStreamScheduleText = _useState18[1];
  // Optional stream meta data
  var _useState19 = useState(undefined),
    streamAdUrl = _useState19[0];
  // Get stream start time 
  var getStreamStartTime = function getStreamStartTime(data) {
    var currentTime = +new Date();
    var startTime = new Date(data.startDate).getTime();
    var secondsElapsed = (currentTime - startTime) / 1000;
    secondsElapsed = parseInt(secondsElapsed.toString());
    // Check if we are playing this stream on a loop and substract number of plays in seconds
    if (data.loop && secondsElapsed > data.duration) {
      var numberOfLoops = parseInt((secondsElapsed / data.duration).toString());
      secondsElapsed = parseInt((secondsElapsed - data.duration * numberOfLoops).toString());
    }
    return secondsElapsed;
  };
  // hasStreamExpired (to set today or tomorrow's date)
  var hasStreamExpired = function hasStreamExpired(endDateTime) {
    var currentTime = +new Date();
    if (currentTime > endDateTime) {
      return true;
    } else {
      return false;
    }
  };
  // Player event
  var onLoadedData = function onLoadedData(e) {
    var time = getStreamStartTime(streamData);
    setStreamStartTime(time);
    console.log('StreamView : onLoadedData : seek', time);
  };
  // Player event
  var onSeeked = function onSeeked(e) {
    console.log('StreamView : onSeeked');
    // @ts-ignore: Unreachable code error
    if (streamRef && streamRef.current && streamRef.current.paused) {
      // @ts-ignore: Unreachable code error
      streamRef.current.play();
      setIsLoading(false);
    }
  };
  // Countdown interval or playback
  var countdownInterval = 0;
  var startCountdownOrPlayback = function startCountdownOrPlayback(data) {
    // Set startDate based on current date @ startTime
    var times = data.startTime.split(':');
    var startDate = new Date();
    startDate.setUTCHours(times[0]);
    startDate.setUTCMinutes(times[1]);
    startDate.setUTCSeconds(times[2]);
    data.startDate = startDate;
    // Set endDate based on startTime + number of repeats in milliseconds
    var durationMs = data.duration * 1000;
    var playbackTime = durationMs * data.repeat;
    var endDateTime = startDate.valueOf() + playbackTime;
    var endDate = new Date(endDateTime);
    data.endDate = endDate;
    // Add 1 day to dates if stream has ended
    if (hasStreamExpired(endDateTime)) {
      var startDateTomorrow = moment(startDate).add(1, 'days');
      var endDateTomorrow = moment(endDate).add(1, 'days');
      data.startDate = startDateTomorrow.toDate();
      data.endDate = endDateTomorrow.toDate();
    }
    // Update local stream data
    setStreamData(data);
    // Get dates
    var currentTime = +new Date();
    var startTime = new Date(data.startDate).getTime();
    var endTime = new Date(data.endDate).getTime();
    console.log("StreamView : startCountdownOrPlayback : startTime " + startTime + " : endTime " + endTime + " : currentTime :", +new Date());
    // Toggle UI
    if (!countdownInterval) {
      countdownInterval = window.setInterval(function () {
        currentTime = +new Date();
        if (currentTime > startTime && currentTime < endTime) {
          clearInterval(countdownInterval);
          var time = getStreamStartTime(data);
          // Update UI
          console.log('StreamView : startCountdownOrPlayback : start @ ', time);
          setStreamStartTime(time);
          setIsStreamReady(true);
        } else {
          var countTime = startTime - currentTime;
          var duration = moment.duration(countTime, 'milliseconds');
          var countdown = moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
          console.log('StreamView : startCountdownOrPlayback : wait');
          // Update UI
          if (currentTime > endTime) {
            setCountdownText('Ended');
            clearInterval(countdownInterval);
          } else {
            setCountdownText(countdown);
          }
          setIsStreamReady(false);
          setIsLoading(false);
        }
      }, 1000);
    }
  };
  // Player event
  var onPlaying = function onPlaying(e) {
    // @ts-ignore: Unreachable code error
    if (streamData && streamData.endDate) {
      // @ts-ignore: Unreachable code error
      var expired = hasStreamExpired(streamData.endDate.valueOf());
      console.log('StreamView : onPlaying : expired :', expired);
      if (expired) {
        // @ts-ignore: Unreachable code error
        if (streamRef && streamRef.current) {
          // @ts-ignore: Unreachable code error
          streamRef.current.pause();
          startCountdownOrPlayback(streamData);
        }
      }
    }
  };
  // Fetch latest stream data
  var fetchStreamData = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var API_URL, res, data;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              API_URL = getApiUrl() + "/streams/latest/room/" + encodeURIComponent(props.roomId);
              _context.next = 4;
              return fetch(API_URL, {
                method: "GET"
              });
            case 4:
              res = _context.sent;
              _context.next = 7;
              return res.json();
            case 7:
              data = _context.sent;
              console.log('StreamView : data', data);
              // Set data
              setStreamData(data);
              setStreamVideoId(data.id);
              setStreamTitle(data.title);
              setStreamText(data.text);
              setStreamImageSrc(data.image);
              setStreamCategory(data.category);
              setStreamScheduleText(data.schedule);
              setStreamLoop(data.loop);
              // Continue
              startCountdownOrPlayback(data);
              _context.next = 23;
              break;
            case 20:
              _context.prev = 20;
              _context.t0 = _context["catch"](0);
              console.log('StreamView : err', _context.t0);
              // TODO set error flag and show error UI 
            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 20]]);
    }));
    return function fetchStreamData() {
      return _ref.apply(this, arguments);
    };
  }();
  useEffect(function () {
    console.log('StreamView:onMount', props);
    // Enable Socket.IO with websocket-only transport
    var socket = io(SocketEndpoint, {
      transports: ['websocket']
    });
    // Socket Listener
    socket.on('connect', function () {
      console.log('StreamView: socket: connect');
      setIsConnected(true);
    });
    // Socket Listener
    socket.on('disconnect', function () {
      console.log('StreamView: socket: disconnect');
      setIsConnected(false);
    });
    // Socket Listener
    socket.on('clientsCount', function (count) {
      setStreamViewers(count);
    });
    // Fetch Data
    fetchStreamData();
    // Unmount
    return function () {
      console.log('StreamView:onUnmount');
      // Remove Socket Listeners
      socket.off('connect');
      socket.off('disconnect');
      // Clear intervals
      clearInterval(countdownInterval);
    };
  }, []);
  /** Bottom Control Section */
  var controlContainerStyle = {
    height: "100%",
    maxHeight: "100%",
    backgroundColor: controlBackgroundColor,
    bottom: 0,
    position: 'absolute'
  };
  var muteButtonStyle = {
    bottom: 0,
    right: "30px",
    position: 'absolute',
    width: '62px',
    height: '62px',
    marginTop: '4rem',
    marginBottom: '4rem',
    borderRadius: '62px',
    boxShadow: '0 0 10px rgb(0 0 0 / 50%)'
  };
  var controlFadeOpacity = 0;
  var onMouseEnterControl = function onMouseEnterControl(e) {
    var fadeInterval = window.setInterval(function () {
      if (controlFadeOpacity < 0.66) {
        controlFadeOpacity += 0.03;
        // setControlOpacity(controlFadeOpacity);
        // setControlBackgroundColor(`rgba(0, 0, 0, ${controlFadeOpacity})`);
        setIsMuteButtonShowing(true);
      } else {
        window.clearInterval(fadeInterval);
      }
    }, 15);
  };
  var onMouseLeaveControl = function onMouseLeaveControl(e) {
    // setControlOpacity(0);
    // setControlBackgroundColor(`rgba(0, 0, 0, ${controlFadeOpacity})`);
    setIsMuteButtonShowing(false);
  };
  var onToggleMuteButton = function onToggleMuteButton(e) {
    setStreamMuted(!streamMuted);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: props.className + " container-fluid",
    style: containerStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "row align-items-center justify-content-center gx-0 h-100 " + (isLoading ? "" : "d-none")
  }, /*#__PURE__*/React.createElement("div", {
    className: "spinner-border text-light",
    role: "status"
  })), isStreamReady ? /*#__PURE__*/React.createElement("div", {
    className: "row gx-0 h-100 position-relative " + (isStreamReady && !isLoading ? "" : "d-none")
  }, /*#__PURE__*/React.createElement(Stream, {
    preload: "metadata",
    streamRef: streamRef,
    onLoadedData: onLoadedData,
    onSeeked: onSeeked,
    adUrl: streamAdUrl,
    src: streamVideoId,
    startTime: streamStartTime,
    currentTime: streamStartTime,
    loop: streamLoop,
    muted: streamMuted,
    autoplay: false,
    onPlaying: onPlaying
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid",
    style: controlContainerStyle,
    onMouseEnter: onMouseEnterControl,
    onMouseLeave: onMouseLeaveControl
  }, /*#__PURE__*/React.createElement("div", {
    className: "row align-items-center justify-content-center"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-circle btn-light mr-3 d-flex justify-content-center align-items-center " + (isMuteButtonShowing ? "" : "d-none"),
    style: muteButtonStyle,
    onClick: onToggleMuteButton
  }, /*#__PURE__*/React.createElement("img", {
    width: "64",
    height: "64",
    className: !streamMuted ? "" : "d-none",
    alt: "Mute",
    src: "data:image/png;base64,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"
  }), /*#__PURE__*/React.createElement("img", {
    width: "64",
    height: "64",
    className: streamMuted ? "" : "d-none",
    alt: "Unmute",
    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsSAAALEgHS3X78AAAEoklEQVR4nO2bS0gVURjHP29KmOajsrIGFCrcNQrtChxbuUoXuarFLTcFgboJWxTSA9ypq9pYdxttNAjcNS5c6yylgitNEAj5yoKMbnzjmWHuufM4Z+bM3DPiD4bZzJxz/v857/NNTalUgrQwNbUFALpJdp3kQorkQlYU3dhMq0yJGmBqqgYA9tXL+foiAOh4KbqhJ1RE8QYQ0XkAGASAZkHJbgHAHAAURJshzABTU1H0BAB0CEnQnzXMR9GNgojEYhuQonAaIUZENsDUVOzMpiO0bdFgXzGq6MZKlHRzUV4yNXUUAJYlEA+kDMukTNxw1QAyjGGVG0hKTUzmsQPmGUaZDSDisQdWq6ONGQOHXVYTmJpAhsQDKaNOyhxKqAEZE2/DbEKgARkVb8NkQlgNKGRUvI1KNPjiawAZVmTt7XkYCBoiPUcBMslZlkSAKHq8Jkt+NWA6E5L48NRUYQCZ2yc+w8s1NCadBU0v0VZeDo8HJ5IsBQpvHX8K5z4sWfeUqdBWZgBxKLFVXd2FLmibeQ0N/ft9q31PkQ66FtA1ILGvf6z/BrTNzELdxa60RdOUaXQMIDs5wr++XeVPjD+DXONx0clHoYNo3S+fK4GKDiIudJWXCEdrratMgyLL13jzFjTl78vy1WkcrVYNIFVCyAYmVvmTz6eg5cFDWcUjzXYzsJuAFvw8G1jlT8++g/pr1yOn0ZS/B/VX+7jewefxPU4szXYTiG0AVnn86nHBZoP8mHwMvxbeh6aGowt2sMh24RVP7mUGBM78MJOgjgyruqjhDYWjIFtUkAlu8fgeJ5bmmq+9l3G9vOH37pEz7dD+dkGIOC9MrXK1TQvzMoHlGQZac66zOk9qz55PRnkAKMb+oigSxboRJB7pjrQtngZ+JggUb1HrOqGV0gQgBuB1tPuK0xeJEI/aczIbAFRNECwe6ZS2CaRFzhWYICXuNr+7MG/dvTrGiBSlNoDu8DYmnwSODhEoStsE/Hr7sCGSFzQg8Fj57/dviQgMImyoE2jCirUtbmpq4AkpLjYah24HpoRDVBTomSDPOB93TqDoRo1tgB53JxhNan3Ev+tDG6DohnWPshjymlYHsKjohmYvhmIb8HvpI/wZHoJTL2ZiLYy2Cy9h79OqlR4LaFJpZwfqLnHnaQVb2TUAl4ZsOTKAe4Cs22CcX00kfRhx5hyNmZq6KTCszaqaLLtCVTJgS9EN69TYPQzOicwBq+b6yDDsfV4VmawoHK1uA4TE3bnZ+7IK6yN3nRmcRDhay06HTU0tJnUy5NckqtAE1hTdcBaAqZ0MSdQkvE+GYH8MLpAIzESgm0QVmsYaHVlaESBBDg/fJF0SPD/4t/sz6Wxo7oQaAPsmxJ4YSYg186OL5bcajBR2KjmemjwNILE0YwdI/JhfMHVgqKypqXMHIFJsXtEN34PfsA2RPIm9zSpG2LF/oAEk4FjLqAlMQdOhW2IZNYE5YpxpTzBjJogPl4dyE6Rb2biY5xGPRPpniMTeTkUrY2LgUMcd4RppW5xk1EN+WKo2iyQOOFJ47+Fvc4c/Th7+Oivlz9Nb5MQqez9PByHd7/MA8B9VriFwSHb+UQAAAABJRU5ErkJggg=="
  }))))) : null, /*#__PURE__*/React.createElement("div", {
    className: "row align-items-center justify-content-center gx-0 h-100 " + (isStreamReady || isLoading ? "d-none" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-8 col-md-6 col-lg-5 col-xl-4 py-8 py-md-11",
    style: {
      maxWidth: "500px",
      minWidth: "300px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-center",
    style: countdownBadgeTitle
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: countdownBadgeStyle
  }, /*#__PURE__*/React.createElement("img", {
    alt: "Countdown",
    width: "50",
    height: "50",
    src: "data:image/png;base64,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"
  }), "Countdown")), /*#__PURE__*/React.createElement("h1", {
    className: "mb-6 text-center",
    style: countdownStyle
  }, countdownText)), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "ratio ratio-16x9",
    style: cardRatioStyle
  }, /*#__PURE__*/React.createElement("img", {
    alt: "Stream Poster",
    style: cardRatioImageStyle,
    src: streamImageSrc
  })), /*#__PURE__*/React.createElement("div", {
    className: "ratio ratio-16x9"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "card-title",
    style: cardTitleStyle
  }, streamTitle), /*#__PURE__*/React.createElement("p", {
    className: "card-text",
    style: cardTextStyle
  }, streamText), /*#__PURE__*/React.createElement("span", {
    className: "badge rounded-pill text-dark",
    style: cardCategoryStyle
  }, /*#__PURE__*/React.createElement("span", {
    style: cardCategoryTextStyle
  }, streamCategory))))), /*#__PURE__*/React.createElement("div", {
    style: cardFooterStyle
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-pill",
    style: cardFooterBadgeLeftStyle
  }, /*#__PURE__*/React.createElement("img", {
    alt: "Viewer Count",
    style: cardFooterBadgeImageStyle,
    width: "25",
    height: "25",
    src: "data:image/png;base64,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"
  }), "Viewers: ", streamViewers), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-pill",
    style: cardFooterBadgeRightStyle
  }, /*#__PURE__*/React.createElement("img", {
    alt: "Stream Schedule",
    style: cardFooterBadgeImageStyle,
    width: "25",
    height: "25",
    src: "data:image/png;base64,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"
  }), streamScheduleText)))));
};

export { Stream, StreamView, useStreamSDK };
//# sourceMappingURL=stream-react.esm.js.map
