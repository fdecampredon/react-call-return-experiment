/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @providesModule ReactDOMUnstableNativeDependencies-prod
 * @preventMunge
 */
"use strict";

var invariant = require("fbjs/lib/invariant"), emptyFunction = require("fbjs/lib/emptyFunction"), reactDom = require("react-dom"), ReactErrorUtils = {
    // Used by Fiber to simulate a try-catch.
    _caughtError: null,
    _hasCaughtError: !1,
    // Used by event system to capture/rethrow the first error.
    _rethrowError: null,
    _hasRethrowError: !1,
    injection: {
        injectErrorUtils: function(injectedErrorUtils) {
            invariant("function" == typeof injectedErrorUtils.invokeGuardedCallback, "Injected invokeGuardedCallback() must be a function."), 
            invokeGuardedCallback = injectedErrorUtils.invokeGuardedCallback;
        }
    },
    /**
   * Call a function while guarding against errors that happens within it.
   * Returns an error if it throws, otherwise null.
   *
   * In production, this is implemented using a try-catch. The reason we don't
   * use a try-catch directly is so that we can swap out a different
   * implementation in DEV mode.
   *
   * @param {String} name of the guard to use for logging or debugging
   * @param {Function} func The function to invoke
   * @param {*} context The context to use when calling the function
   * @param {...*} args Arguments for function
   */
    invokeGuardedCallback: function(name, func, context, a, b, c, d, e, f) {
        invokeGuardedCallback.apply(ReactErrorUtils, arguments);
    },
    /**
   * Same as invokeGuardedCallback, but instead of returning an error, it stores
   * it in a global so it can be rethrown by `rethrowCaughtError` later.
   * TODO: See if _caughtError and _rethrowError can be unified.
   *
   * @param {String} name of the guard to use for logging or debugging
   * @param {Function} func The function to invoke
   * @param {*} context The context to use when calling the function
   * @param {...*} args Arguments for function
   */
    invokeGuardedCallbackAndCatchFirstError: function(name, func, context, a, b, c, d, e, f) {
        if (ReactErrorUtils.invokeGuardedCallback.apply(this, arguments), ReactErrorUtils.hasCaughtError()) {
            var error = ReactErrorUtils.clearCaughtError();
            ReactErrorUtils._hasRethrowError || (ReactErrorUtils._hasRethrowError = !0, ReactErrorUtils._rethrowError = error);
        }
    },
    /**
   * During execution of guarded functions we will capture the first error which
   * we will rethrow to be handled by the top level error handler.
   */
    rethrowCaughtError: function() {
        return rethrowCaughtError.apply(ReactErrorUtils, arguments);
    },
    hasCaughtError: function() {
        return ReactErrorUtils._hasCaughtError;
    },
    clearCaughtError: function() {
        if (ReactErrorUtils._hasCaughtError) {
            var error = ReactErrorUtils._caughtError;
            return ReactErrorUtils._caughtError = null, ReactErrorUtils._hasCaughtError = !1, 
            error;
        }
        invariant(!1, "clearCaughtError was called but no error was captured. This error " + "is likely caused by a bug in React. Please file an issue.");
    }
}, invokeGuardedCallback = function(name, func, context, a, b, c, d, e, f) {
    ReactErrorUtils._hasCaughtError = !1, ReactErrorUtils._caughtError = null;
    var funcArgs = Array.prototype.slice.call(arguments, 3);
    try {
        func.apply(context, funcArgs);
    } catch (error) {
        ReactErrorUtils._caughtError = error, ReactErrorUtils._hasCaughtError = !0;
    }
}, rethrowCaughtError = function() {
    if (ReactErrorUtils._hasRethrowError) {
        var error = ReactErrorUtils._rethrowError;
        throw ReactErrorUtils._rethrowError = null, ReactErrorUtils._hasRethrowError = !1, 
        error;
    }
}, ReactErrorUtils_1 = ReactErrorUtils, ComponentTree, injection = {
    injectComponentTree: function(Injected) {
        ComponentTree = Injected;
    }
};

function isEndish(topLevelType) {
    return "topMouseUp" === topLevelType || "topTouchEnd" === topLevelType || "topTouchCancel" === topLevelType;
}

function isMoveish(topLevelType) {
    return "topMouseMove" === topLevelType || "topTouchMove" === topLevelType;
}

function isStartish(topLevelType) {
    return "topMouseDown" === topLevelType || "topTouchStart" === topLevelType;
}

/**
 * Dispatch the event to the listener.
 * @param {SyntheticEvent} event SyntheticEvent to handle
 * @param {boolean} simulated If the event is simulated (changes exn behavior)
 * @param {function} listener Application-level callback
 * @param {*} inst Internal component instance
 */
function executeDispatch(event, simulated, listener, inst) {
    var type = event.type || "unknown-event";
    event.currentTarget = EventPluginUtils.getNodeFromInstance(inst), ReactErrorUtils_1.invokeGuardedCallbackAndCatchFirstError(type, listener, void 0, event), 
    event.currentTarget = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches.
 */
function executeDispatchesInOrder(event, simulated) {
    var dispatchListeners = event._dispatchListeners, dispatchInstances = event._dispatchInstances;
    if (Array.isArray(dispatchListeners)) for (var i = 0; i < dispatchListeners.length && !event.isPropagationStopped(); i++) // Listeners and Instances are two parallel arrays that are always in sync.
    executeDispatch(event, simulated, dispatchListeners[i], dispatchInstances[i]); else dispatchListeners && executeDispatch(event, simulated, dispatchListeners, dispatchInstances);
    event._dispatchListeners = null, event._dispatchInstances = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches, but stops
 * at the first dispatch execution returning true, and returns that id.
 *
 * @return {?string} id of the first dispatch execution who's listener returns
 * true, or null if no listener returned true.
 */
function executeDispatchesInOrderStopAtTrueImpl(event) {
    var dispatchListeners = event._dispatchListeners, dispatchInstances = event._dispatchInstances;
    if (Array.isArray(dispatchListeners)) {
        for (var i = 0; i < dispatchListeners.length && !event.isPropagationStopped(); i++) // Listeners and Instances are two parallel arrays that are always in sync.
        if (dispatchListeners[i](event, dispatchInstances[i])) return dispatchInstances[i];
    } else if (dispatchListeners && dispatchListeners(event, dispatchInstances)) return dispatchInstances;
    return null;
}

/**
 * @see executeDispatchesInOrderStopAtTrueImpl
 */
function executeDispatchesInOrderStopAtTrue(event) {
    var ret = executeDispatchesInOrderStopAtTrueImpl(event);
    return event._dispatchInstances = null, event._dispatchListeners = null, ret;
}

/**
 * Execution of a "direct" dispatch - there must be at most one dispatch
 * accumulated on the event or it is considered an error. It doesn't really make
 * sense for an event with multiple dispatches (bubbled) to keep track of the
 * return values at each dispatch execution, but it does tend to make sense when
 * dealing with "direct" dispatches.
 *
 * @return {*} The return value of executing the single dispatch.
 */
function executeDirectDispatch(event) {
    var dispatchListener = event._dispatchListeners, dispatchInstance = event._dispatchInstances;
    invariant(!Array.isArray(dispatchListener), "executeDirectDispatch(...): Invalid `event`."), 
    event.currentTarget = dispatchListener ? EventPluginUtils.getNodeFromInstance(dispatchInstance) : null;
    var res = dispatchListener ? dispatchListener(event) : null;
    return event.currentTarget = null, event._dispatchListeners = null, event._dispatchInstances = null, 
    res;
}

/**
 * @param {SyntheticEvent} event
 * @return {boolean} True iff number of dispatches accumulated is greater than 0.
 */
function hasDispatches(event) {
    return !!event._dispatchListeners;
}

/**
 * General utilities that are useful in creating custom Event Plugins.
 */
var EventPluginUtils = {
    isEndish: isEndish,
    isMoveish: isMoveish,
    isStartish: isStartish,
    executeDirectDispatch: executeDirectDispatch,
    executeDispatchesInOrder: executeDispatchesInOrder,
    executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
    hasDispatches: hasDispatches,
    getFiberCurrentPropsFromNode: function(node) {
        return ComponentTree.getFiberCurrentPropsFromNode(node);
    },
    getInstanceFromNode: function(node) {
        return ComponentTree.getInstanceFromNode(node);
    },
    getNodeFromInstance: function(node) {
        return ComponentTree.getNodeFromInstance(node);
    },
    injection: injection
}, EventPluginUtils_1 = EventPluginUtils, ReactTypeOfWork = {
    IndeterminateComponent: 0,
    // Before we know whether it is functional or class
    FunctionalComponent: 1,
    ClassComponent: 2,
    HostRoot: 3,
    // Root of a host tree. Could be nested inside another node.
    HostPortal: 4,
    // A subtree. Could be an entry point to a different renderer.
    HostComponent: 5,
    HostText: 6,
    CallComponent: 7,
    CallHandlerPhase: 8,
    ReturnComponent: 9,
    Fragment: 10
}, HostComponent = ReactTypeOfWork.HostComponent;

function getParent(inst) {
    do {
        inst = inst.return;
    } while (inst && inst.tag !== HostComponent);
    return inst || null;
}

/**
 * Return the lowest common ancestor of A and B, or null if they are in
 * different trees.
 */
function getLowestCommonAncestor(instA, instB) {
    for (var depthA = 0, tempA = instA; tempA; tempA = getParent(tempA)) depthA++;
    for (var depthB = 0, tempB = instB; tempB; tempB = getParent(tempB)) depthB++;
    // If A is deeper, crawl up.
    for (;depthA - depthB > 0; ) instA = getParent(instA), depthA--;
    // If B is deeper, crawl up.
    for (;depthB - depthA > 0; ) instB = getParent(instB), depthB--;
    for (// Walk in lockstep until we find a match.
    var depth = depthA; depth--; ) {
        if (instA === instB || instA === instB.alternate) return instA;
        instA = getParent(instA), instB = getParent(instB);
    }
    return null;
}

/**
 * Return if A is an ancestor of B.
 */
function isAncestor(instA, instB) {
    for (;instB; ) {
        if (instA === instB || instA === instB.alternate) return !0;
        instB = getParent(instB);
    }
    return !1;
}

/**
 * Return the parent instance of the passed-in instance.
 */
function getParentInstance(inst) {
    return getParent(inst);
}

/**
 * Simulates the traversal of a two-phase, capture/bubble event dispatch.
 */
function traverseTwoPhase(inst, fn, arg) {
    for (var path = []; inst; ) path.push(inst), inst = getParent(inst);
    var i;
    for (i = path.length; i-- > 0; ) fn(path[i], "captured", arg);
    for (i = 0; i < path.length; i++) fn(path[i], "bubbled", arg);
}

/**
 * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
 * should would receive a `mouseEnter` or `mouseLeave` event.
 *
 * Does not invoke the callback on the nearest common ancestor because nothing
 * "entered" or "left" that element.
 */
function traverseEnterLeave(from, to, fn, argFrom, argTo) {
    for (var common = from && to ? getLowestCommonAncestor(from, to) : null, pathFrom = []; !0 && from && from !== common; ) {
        var alternate = from.alternate;
        if (null !== alternate && alternate === common) break;
        pathFrom.push(from), from = getParent(from);
    }
    for (var pathTo = []; !0 && to && to !== common; ) {
        var _alternate = to.alternate;
        if (null !== _alternate && _alternate === common) break;
        pathTo.push(to), to = getParent(to);
    }
    for (var i = 0; i < pathFrom.length; i++) fn(pathFrom[i], "bubbled", argFrom);
    for (var _i = pathTo.length; _i-- > 0; ) fn(pathTo[_i], "captured", argTo);
}

var ReactTreeTraversal = {
    isAncestor: isAncestor,
    getLowestCommonAncestor: getLowestCommonAncestor,
    getParentInstance: getParentInstance,
    traverseTwoPhase: traverseTwoPhase,
    traverseEnterLeave: traverseEnterLeave
}, eventPluginOrder = null, namesToPlugins = {};

/**
 * Recomputes the plugin list using the injected plugins and plugin ordering.
 *
 * @private
 */
function recomputePluginOrdering() {
    if (eventPluginOrder) for (var pluginName in namesToPlugins) {
        var pluginModule = namesToPlugins[pluginName], pluginIndex = eventPluginOrder.indexOf(pluginName);
        if (invariant(pluginIndex > -1, "EventPluginRegistry: Cannot inject event plugins that do not exist in " + "the plugin ordering, `%s`.", pluginName), 
        !EventPluginRegistry.plugins[pluginIndex]) {
            invariant(pluginModule.extractEvents, "EventPluginRegistry: Event plugins must implement an `extractEvents` " + "method, but `%s` does not.", pluginName), 
            EventPluginRegistry.plugins[pluginIndex] = pluginModule;
            var publishedEvents = pluginModule.eventTypes;
            for (var eventName in publishedEvents) invariant(publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName), "EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.", eventName, pluginName);
        }
    }
}

/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
    invariant(!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName), "EventPluginHub: More than one plugin attempted to publish the same " + "event name, `%s`.", eventName), 
    EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;
    var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
    if (phasedRegistrationNames) {
        for (var phaseName in phasedRegistrationNames) if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
            var phasedRegistrationName = phasedRegistrationNames[phaseName];
            publishRegistrationName(phasedRegistrationName, pluginModule, eventName);
        }
        return !0;
    }
    return !!dispatchConfig.registrationName && (publishRegistrationName(dispatchConfig.registrationName, pluginModule, eventName), 
    !0);
}

/**
 * Publishes a registration name that is used to identify dispatched events.
 *
 * @param {string} registrationName Registration name to add.
 * @param {object} PluginModule Plugin publishing the event.
 * @private
 */
function publishRegistrationName(registrationName, pluginModule, eventName) {
    invariant(!EventPluginRegistry.registrationNameModules[registrationName], "EventPluginHub: More than one plugin attempted to publish the same " + "registration name, `%s`.", registrationName), 
    EventPluginRegistry.registrationNameModules[registrationName] = pluginModule, EventPluginRegistry.registrationNameDependencies[registrationName] = pluginModule.eventTypes[eventName].dependencies;
}

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */
var EventPluginRegistry = {
    /**
   * Ordered list of injected plugins.
   */
    plugins: [],
    /**
   * Mapping from event name to dispatch config
   */
    eventNameDispatchConfigs: {},
    /**
   * Mapping from registration name to plugin module
   */
    registrationNameModules: {},
    /**
   * Mapping from registration name to event name
   */
    registrationNameDependencies: {},
    /**
   * Mapping from lowercase registration names to the properly cased version,
   * used to warn in the case of missing event handlers. Available
   * only in false.
   * @type {Object}
   */
    possibleRegistrationNames: null,
    // Trust the developer to only use possibleRegistrationNames in false
    /**
   * Injects an ordering of plugins (by plugin name). This allows the ordering
   * to be decoupled from injection of the actual plugins so that ordering is
   * always deterministic regardless of packaging, on-the-fly injection, etc.
   *
   * @param {array} InjectedEventPluginOrder
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginOrder}
   */
    injectEventPluginOrder: function(injectedEventPluginOrder) {
        invariant(!eventPluginOrder, "EventPluginRegistry: Cannot inject event plugin ordering more than " + "once. You are likely trying to load more than one copy of React."), 
        // Clone the ordering so it cannot be dynamically mutated.
        eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder), recomputePluginOrdering();
    },
    /**
   * Injects plugins to be used by `EventPluginHub`. The plugin names must be
   * in the ordering injected by `injectEventPluginOrder`.
   *
   * Plugins can be injected as part of page initialization or on-the-fly.
   *
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginsByName}
   */
    injectEventPluginsByName: function(injectedNamesToPlugins) {
        var isOrderingDirty = !1;
        for (var pluginName in injectedNamesToPlugins) if (injectedNamesToPlugins.hasOwnProperty(pluginName)) {
            var pluginModule = injectedNamesToPlugins[pluginName];
            namesToPlugins.hasOwnProperty(pluginName) && namesToPlugins[pluginName] === pluginModule || (invariant(!namesToPlugins[pluginName], "EventPluginRegistry: Cannot inject two different event plugins " + "using the same name, `%s`.", pluginName), 
            namesToPlugins[pluginName] = pluginModule, isOrderingDirty = !0);
        }
        isOrderingDirty && recomputePluginOrdering();
    }
}, EventPluginRegistry_1 = EventPluginRegistry;

/**
 * Accumulates items that must not be null or undefined into the first one. This
 * is used to conserve memory by avoiding array allocations, and thus sacrifices
 * API cleanness. Since `current` can be null before being passed in and not
 * null after this function, make sure to assign it back to `current`:
 *
 * `a = accumulateInto(a, b);`
 *
 * This API should be sparingly used. Try `accumulate` for something cleaner.
 *
 * @return {*|array<*>} An accumulation of items.
 */
function accumulateInto(current, next) {
    // Both are not empty. Warning: Never call x.concat(y) when you are not
    // certain that x is an Array (x could be a string with concat method).
    return invariant(null != next, "accumulateInto(...): Accumulated items must not be null or undefined."), 
    null == current ? next : Array.isArray(current) ? Array.isArray(next) ? (current.push.apply(current, next), 
    current) : (current.push(next), current) : Array.isArray(next) ? [ current ].concat(next) : [ current, next ];
}

var accumulateInto_1 = accumulateInto;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
/**
 * @param {array} arr an "accumulation" of items which is either an Array or
 * a single item. Useful when paired with the `accumulate` module. This is a
 * simple utility that allows us to reason about a collection of items, but
 * handling the case when there is exactly one item (and we do not need to
 * allocate an array).
 * @param {function} cb Callback invoked with each element or a collection.
 * @param {?} [scope] Scope used as `this` in a callback.
 */
function forEachAccumulated(arr, cb, scope) {
    Array.isArray(arr) ? arr.forEach(cb, scope) : arr && cb.call(scope, arr);
}

var forEachAccumulated_1 = forEachAccumulated, eventQueue = null, executeDispatchesAndRelease = function(event, simulated) {
    event && (EventPluginUtils_1.executeDispatchesInOrder(event, simulated), event.isPersistent() || event.constructor.release(event));
}, executeDispatchesAndReleaseSimulated = function(e) {
    return executeDispatchesAndRelease(e, !0);
}, executeDispatchesAndReleaseTopLevel = function(e) {
    return executeDispatchesAndRelease(e, !1);
};

function isInteractive(tag) {
    return "button" === tag || "input" === tag || "select" === tag || "textarea" === tag;
}

function shouldPreventMouseEvent(name, type, props) {
    switch (name) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
        return !(!props.disabled || !isInteractive(type));

      default:
        return !1;
    }
}

/**
 * This is a unified interface for event plugins to be installed and configured.
 *
 * Event plugins can implement the following properties:
 *
 *   `extractEvents` {function(string, DOMEventTarget, string, object): *}
 *     Required. When a top-level event is fired, this method is expected to
 *     extract synthetic events that will in turn be queued and dispatched.
 *
 *   `eventTypes` {object}
 *     Optional, plugins that fire events must publish a mapping of registration
 *     names that are used to register listeners. Values of this mapping must
 *     be objects that contain `registrationName` or `phasedRegistrationNames`.
 *
 *   `executeDispatch` {function(object, function, string)}
 *     Optional, allows plugins to override how an event gets dispatched. By
 *     default, the listener is simply invoked.
 *
 * Each plugin that is injected into `EventsPluginHub` is immediately operable.
 *
 * @public
 */
var EventPluginHub = {
    /**
   * Methods for injecting dependencies.
   */
    injection: {
        /**
     * @param {array} InjectedEventPluginOrder
     * @public
     */
        injectEventPluginOrder: EventPluginRegistry_1.injectEventPluginOrder,
        /**
     * @param {object} injectedNamesToPlugins Map from names to plugin modules.
     */
        injectEventPluginsByName: EventPluginRegistry_1.injectEventPluginsByName
    },
    /**
   * @param {object} inst The instance, which is the source of events.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @return {?function} The stored callback.
   */
    getListener: function(inst, registrationName) {
        var listener, stateNode = inst.stateNode;
        if (!stateNode) // Work in progress (ex: onload events in incremental mode).
        return null;
        var props = EventPluginUtils_1.getFiberCurrentPropsFromNode(stateNode);
        return props ? (listener = props[registrationName], shouldPreventMouseEvent(registrationName, inst.type, props) ? null : (invariant(!listener || "function" == typeof listener, "Expected `%s` listener to be a function, instead got a value of `%s` type.", registrationName, typeof listener), 
        listener)) : null;
    },
    /**
   * Allows registered plugins an opportunity to extract events from top-level
   * native browser events.
   *
   * @return {*} An accumulation of synthetic events.
   * @internal
   */
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        for (var events, plugins = EventPluginRegistry_1.plugins, i = 0; i < plugins.length; i++) {
            // Not every plugin in the ordering may be loaded at runtime.
            var possiblePlugin = plugins[i];
            if (possiblePlugin) {
                var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
                extractedEvents && (events = accumulateInto_1(events, extractedEvents));
            }
        }
        return events;
    },
    /**
   * Enqueues a synthetic event that should be dispatched when
   * `processEventQueue` is invoked.
   *
   * @param {*} events An accumulation of synthetic events.
   * @internal
   */
    enqueueEvents: function(events) {
        events && (eventQueue = accumulateInto_1(eventQueue, events));
    },
    /**
   * Dispatches all synthetic events on the event queue.
   *
   * @internal
   */
    processEventQueue: function(simulated) {
        // Set `eventQueue` to null before processing it so that we can tell if more
        // events get enqueued while processing.
        var processingEventQueue = eventQueue;
        eventQueue = null, simulated ? forEachAccumulated_1(processingEventQueue, executeDispatchesAndReleaseSimulated) : forEachAccumulated_1(processingEventQueue, executeDispatchesAndReleaseTopLevel), 
        invariant(!eventQueue, "processEventQueue(): Additional events were enqueued while processing " + "an event queue. Support for this has not yet been implemented."), 
        // This would be a good time to rethrow if any of the event handlers threw.
        ReactErrorUtils_1.rethrowCaughtError();
    }
}, EventPluginHub_1 = EventPluginHub, getListener = EventPluginHub_1.getListener;

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(inst, event, propagationPhase) {
    var registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];
    return getListener(inst, registrationName);
}

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
function accumulateDirectionalDispatches(inst, phase, event) {
    var listener = listenerAtPhase(inst, event, phase);
    listener && (event._dispatchListeners = accumulateInto_1(event._dispatchListeners, listener), 
    event._dispatchInstances = accumulateInto_1(event._dispatchInstances, inst));
}

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We cannot perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
function accumulateTwoPhaseDispatchesSingle(event) {
    event && event.dispatchConfig.phasedRegistrationNames && ReactTreeTraversal.traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
}

/**
 * Same as `accumulateTwoPhaseDispatchesSingle`, but skips over the targetID.
 */
function accumulateTwoPhaseDispatchesSingleSkipTarget(event) {
    if (event && event.dispatchConfig.phasedRegistrationNames) {
        var targetInst = event._targetInst, parentInst = targetInst ? ReactTreeTraversal.getParentInstance(targetInst) : null;
        ReactTreeTraversal.traverseTwoPhase(parentInst, accumulateDirectionalDispatches, event);
    }
}

/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
function accumulateDispatches(inst, ignoredDirection, event) {
    if (inst && event && event.dispatchConfig.registrationName) {
        var registrationName = event.dispatchConfig.registrationName, listener = getListener(inst, registrationName);
        listener && (event._dispatchListeners = accumulateInto_1(event._dispatchListeners, listener), 
        event._dispatchInstances = accumulateInto_1(event._dispatchInstances, inst));
    }
}

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
function accumulateDirectDispatchesSingle(event) {
    event && event.dispatchConfig.registrationName && accumulateDispatches(event._targetInst, null, event);
}

function accumulateTwoPhaseDispatches(events) {
    forEachAccumulated_1(events, accumulateTwoPhaseDispatchesSingle);
}

function accumulateTwoPhaseDispatchesSkipTarget(events) {
    forEachAccumulated_1(events, accumulateTwoPhaseDispatchesSingleSkipTarget);
}

function accumulateEnterLeaveDispatches(leave, enter, from, to) {
    ReactTreeTraversal.traverseEnterLeave(from, to, accumulateDispatches, leave, enter);
}

function accumulateDirectDispatches(events) {
    forEachAccumulated_1(events, accumulateDirectDispatchesSingle);
}

/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing even a
 * single one.
 *
 * @constructor EventPropagators
 */
var EventPropagators = {
    accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
    accumulateTwoPhaseDispatchesSkipTarget: accumulateTwoPhaseDispatchesSkipTarget,
    accumulateDirectDispatches: accumulateDirectDispatches,
    accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches
}, EventPropagators_1 = EventPropagators, EVENT_POOL_SIZE = 10, shouldBeReleasedProperties = [ "dispatchConfig", "_targetInst", "nativeEvent", "isDefaultPrevented", "isPropagationStopped", "_dispatchListeners", "_dispatchInstances" ], EventInterface = {
    type: null,
    target: null,
    // currentTarget is set when dispatching; no use in copying it here
    currentTarget: emptyFunction.thatReturnsNull,
    eventPhase: null,
    bubbles: null,
    cancelable: null,
    timeStamp: function(event) {
        return event.timeStamp || Date.now();
    },
    defaultPrevented: null,
    isTrusted: null
};

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {*} targetInst Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @param {DOMEventTarget} nativeEventTarget Target node.
 */
function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {
    this.dispatchConfig = dispatchConfig, this._targetInst = targetInst, this.nativeEvent = nativeEvent;
    var Interface = this.constructor.Interface;
    for (var propName in Interface) if (Interface.hasOwnProperty(propName)) {
        var normalize = Interface[propName];
        normalize ? this[propName] = normalize(nativeEvent) : "target" === propName ? this.target = nativeEventTarget : this[propName] = nativeEvent[propName];
    }
    var defaultPrevented = null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : !1 === nativeEvent.returnValue;
    return this.isDefaultPrevented = defaultPrevented ? emptyFunction.thatReturnsTrue : emptyFunction.thatReturnsFalse, 
    this.isPropagationStopped = emptyFunction.thatReturnsFalse, this;
}

Object.assign(SyntheticEvent.prototype, {
    preventDefault: function() {
        this.defaultPrevented = !0;
        var event = this.nativeEvent;
        event && (event.preventDefault ? event.preventDefault() : "unknown" != typeof event.returnValue && (event.returnValue = !1), 
        this.isDefaultPrevented = emptyFunction.thatReturnsTrue);
    },
    stopPropagation: function() {
        var event = this.nativeEvent;
        event && (event.stopPropagation ? event.stopPropagation() : "unknown" != typeof event.cancelBubble && (// The ChangeEventPlugin registers a "propertychange" event for
        // IE. This event does not support bubbling or cancelling, and
        // any references to cancelBubble throw "Member not found".  A
        // typeof check of "unknown" circumvents this issue (and is also
        // IE specific).
        event.cancelBubble = !0), this.isPropagationStopped = emptyFunction.thatReturnsTrue);
    },
    /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
    persist: function() {
        this.isPersistent = emptyFunction.thatReturnsTrue;
    },
    /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
    isPersistent: emptyFunction.thatReturnsFalse,
    /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
    destructor: function() {
        var Interface = this.constructor.Interface;
        for (var propName in Interface) this[propName] = null;
        for (var i = 0; i < shouldBeReleasedProperties.length; i++) this[shouldBeReleasedProperties[i]] = null;
    }
}), SyntheticEvent.Interface = EventInterface, /**
 * Helper to reduce boilerplate when creating subclasses.
 *
 * @param {function} Class
 * @param {?object} Interface
 */
SyntheticEvent.augmentClass = function(Class, Interface) {
    var Super = this, E = function() {};
    E.prototype = Super.prototype;
    var prototype = new E();
    Object.assign(prototype, Class.prototype), Class.prototype = prototype, Class.prototype.constructor = Class, 
    Class.Interface = Object.assign({}, Super.Interface, Interface), Class.augmentClass = Super.augmentClass, 
    addEventPoolingTo(Class);
}, /** Proxying after everything set on SyntheticEvent
  * to resolve Proxy issue on some WebKit browsers
  * in which some Event properties are set to undefined (GH#10010)
  */
addEventPoolingTo(SyntheticEvent);

var SyntheticEvent_1 = SyntheticEvent;

function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
    var EventConstructor = this;
    if (EventConstructor.eventPool.length) {
        var instance = EventConstructor.eventPool.pop();
        return EventConstructor.call(instance, dispatchConfig, targetInst, nativeEvent, nativeInst), 
        instance;
    }
    return new EventConstructor(dispatchConfig, targetInst, nativeEvent, nativeInst);
}

function releasePooledEvent(event) {
    var EventConstructor = this;
    invariant(event instanceof EventConstructor, "Trying to release an event instance  into a pool of a different type."), 
    event.destructor(), EventConstructor.eventPool.length < EVENT_POOL_SIZE && EventConstructor.eventPool.push(event);
}

function addEventPoolingTo(EventConstructor) {
    EventConstructor.eventPool = [], EventConstructor.getPooled = getPooledEvent, EventConstructor.release = releasePooledEvent;
}

/**
 * `touchHistory` isn't actually on the native event, but putting it in the
 * interface will ensure that it is cleaned up when pooled/destroyed. The
 * `ResponderEventPlugin` will populate it appropriately.
 */
var ResponderEventInterface = {
    touchHistory: function(nativeEvent) {
        return null;
    }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native event.
 * @extends {SyntheticEvent}
 */
function ResponderSyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent_1.augmentClass(ResponderSyntheticEvent, ResponderEventInterface);

var ResponderSyntheticEvent_1 = ResponderSyntheticEvent, isEndish$2 = EventPluginUtils_1.isEndish, isMoveish$2 = EventPluginUtils_1.isMoveish, isStartish$2 = EventPluginUtils_1.isStartish, MAX_TOUCH_BANK = 20, touchBank = [], touchHistory = {
    touchBank: touchBank,
    numberActiveTouches: 0,
    // If there is only one active touch, we remember its location. This prevents
    // us having to loop through all of the touches all the time in the most
    // common case.
    indexOfSingleActiveTouch: -1,
    mostRecentTimeStamp: 0
};

function timestampForTouch(touch) {
    // The legacy internal implementation provides "timeStamp", which has been
    // renamed to "timestamp". Let both work for now while we iron it out
    // TODO (evv): rename timeStamp to timestamp in internal code
    return touch.timeStamp || touch.timestamp;
}

/**
 * TODO: Instead of making gestures recompute filtered velocity, we could
 * include a built in velocity computation that can be reused globally.
 */
function createTouchRecord(touch) {
    return {
        touchActive: !0,
        startPageX: touch.pageX,
        startPageY: touch.pageY,
        startTimeStamp: timestampForTouch(touch),
        currentPageX: touch.pageX,
        currentPageY: touch.pageY,
        currentTimeStamp: timestampForTouch(touch),
        previousPageX: touch.pageX,
        previousPageY: touch.pageY,
        previousTimeStamp: timestampForTouch(touch)
    };
}

function resetTouchRecord(touchRecord, touch) {
    touchRecord.touchActive = !0, touchRecord.startPageX = touch.pageX, touchRecord.startPageY = touch.pageY, 
    touchRecord.startTimeStamp = timestampForTouch(touch), touchRecord.currentPageX = touch.pageX, 
    touchRecord.currentPageY = touch.pageY, touchRecord.currentTimeStamp = timestampForTouch(touch), 
    touchRecord.previousPageX = touch.pageX, touchRecord.previousPageY = touch.pageY, 
    touchRecord.previousTimeStamp = timestampForTouch(touch);
}

function getTouchIdentifier(_ref) {
    var identifier = _ref.identifier;
    return invariant(null != identifier, "Touch object is missing identifier."), identifier;
}

function recordTouchStart(touch) {
    var identifier = getTouchIdentifier(touch), touchRecord = touchBank[identifier];
    touchRecord ? resetTouchRecord(touchRecord, touch) : touchBank[identifier] = createTouchRecord(touch), 
    touchHistory.mostRecentTimeStamp = timestampForTouch(touch);
}

function recordTouchMove(touch) {
    var touchRecord = touchBank[getTouchIdentifier(touch)];
    touchRecord ? (touchRecord.touchActive = !0, touchRecord.previousPageX = touchRecord.currentPageX, 
    touchRecord.previousPageY = touchRecord.currentPageY, touchRecord.previousTimeStamp = touchRecord.currentTimeStamp, 
    touchRecord.currentPageX = touch.pageX, touchRecord.currentPageY = touch.pageY, 
    touchRecord.currentTimeStamp = timestampForTouch(touch), touchHistory.mostRecentTimeStamp = timestampForTouch(touch)) : console.error("Cannot record touch move without a touch start.\n" + "Touch Move: %s\n", "Touch Bank: %s", printTouch(touch), printTouchBank());
}

function recordTouchEnd(touch) {
    var touchRecord = touchBank[getTouchIdentifier(touch)];
    touchRecord ? (touchRecord.touchActive = !1, touchRecord.previousPageX = touchRecord.currentPageX, 
    touchRecord.previousPageY = touchRecord.currentPageY, touchRecord.previousTimeStamp = touchRecord.currentTimeStamp, 
    touchRecord.currentPageX = touch.pageX, touchRecord.currentPageY = touch.pageY, 
    touchRecord.currentTimeStamp = timestampForTouch(touch), touchHistory.mostRecentTimeStamp = timestampForTouch(touch)) : console.error("Cannot record touch end without a touch start.\n" + "Touch End: %s\n", "Touch Bank: %s", printTouch(touch), printTouchBank());
}

function printTouch(touch) {
    return JSON.stringify({
        identifier: touch.identifier,
        pageX: touch.pageX,
        pageY: touch.pageY,
        timestamp: timestampForTouch(touch)
    });
}

function printTouchBank() {
    var printed = JSON.stringify(touchBank.slice(0, MAX_TOUCH_BANK));
    return touchBank.length > MAX_TOUCH_BANK && (printed += " (original size: " + touchBank.length + ")"), 
    printed;
}

var ResponderTouchHistoryStore = {
    recordTouchTrack: function(topLevelType, nativeEvent) {
        if (isMoveish$2(topLevelType)) nativeEvent.changedTouches.forEach(recordTouchMove); else if (isStartish$2(topLevelType)) nativeEvent.changedTouches.forEach(recordTouchStart), 
        touchHistory.numberActiveTouches = nativeEvent.touches.length, 1 === touchHistory.numberActiveTouches && (touchHistory.indexOfSingleActiveTouch = nativeEvent.touches[0].identifier); else if (isEndish$2(topLevelType) && (nativeEvent.changedTouches.forEach(recordTouchEnd), 
        touchHistory.numberActiveTouches = nativeEvent.touches.length, 1 === touchHistory.numberActiveTouches)) for (var i = 0; i < touchBank.length; i++) {
            var touchTrackToCheck = touchBank[i];
            if (null != touchTrackToCheck && touchTrackToCheck.touchActive) {
                touchHistory.indexOfSingleActiveTouch = i;
                break;
            }
        }
    },
    touchHistory: touchHistory
}, ResponderTouchHistoryStore_1 = ResponderTouchHistoryStore;

/**
 * Accumulates items that must not be null or undefined.
 *
 * This is used to conserve memory by avoiding array allocations.
 *
 * @return {*|array<*>} An accumulation of items.
 */
function accumulate(current, next) {
    // Both are not empty. Warning: Never call x.concat(y) when you are not
    // certain that x is an Array (x could be a string with concat method).
    return invariant(null != next, "accumulate(...): Accumulated items must be not be null or undefined."), 
    null == current ? next : Array.isArray(current) ? current.concat(next) : Array.isArray(next) ? [ current ].concat(next) : [ current, next ];
}

var accumulate_1 = accumulate, isStartish$1 = EventPluginUtils_1.isStartish, isMoveish$1 = EventPluginUtils_1.isMoveish, isEndish$1 = EventPluginUtils_1.isEndish, executeDirectDispatch$1 = EventPluginUtils_1.executeDirectDispatch, hasDispatches$1 = EventPluginUtils_1.hasDispatches, executeDispatchesInOrderStopAtTrue$1 = EventPluginUtils_1.executeDispatchesInOrderStopAtTrue, responderInst = null, trackedTouchCount = 0, previousActiveTouches = 0, changeResponder = function(nextResponderInst, blockHostResponder) {
    var oldResponderInst = responderInst;
    responderInst = nextResponderInst, null !== ResponderEventPlugin.GlobalResponderHandler && ResponderEventPlugin.GlobalResponderHandler.onChange(oldResponderInst, nextResponderInst, blockHostResponder);
}, eventTypes = {
    /**
   * On a `touchStart`/`mouseDown`, is it desired that this element become the
   * responder?
   */
    startShouldSetResponder: {
        phasedRegistrationNames: {
            bubbled: "onStartShouldSetResponder",
            captured: "onStartShouldSetResponderCapture"
        }
    },
    /**
   * On a `scroll`, is it desired that this element become the responder? This
   * is usually not needed, but should be used to retroactively infer that a
   * `touchStart` had occurred during momentum scroll. During a momentum scroll,
   * a touch start will be immediately followed by a scroll event if the view is
   * currently scrolling.
   *
   * TODO: This shouldn't bubble.
   */
    scrollShouldSetResponder: {
        phasedRegistrationNames: {
            bubbled: "onScrollShouldSetResponder",
            captured: "onScrollShouldSetResponderCapture"
        }
    },
    /**
   * On text selection change, should this element become the responder? This
   * is needed for text inputs or other views with native selection, so the
   * JS view can claim the responder.
   *
   * TODO: This shouldn't bubble.
   */
    selectionChangeShouldSetResponder: {
        phasedRegistrationNames: {
            bubbled: "onSelectionChangeShouldSetResponder",
            captured: "onSelectionChangeShouldSetResponderCapture"
        }
    },
    /**
   * On a `touchMove`/`mouseMove`, is it desired that this element become the
   * responder?
   */
    moveShouldSetResponder: {
        phasedRegistrationNames: {
            bubbled: "onMoveShouldSetResponder",
            captured: "onMoveShouldSetResponderCapture"
        }
    },
    /**
   * Direct responder events dispatched directly to responder. Do not bubble.
   */
    responderStart: {
        registrationName: "onResponderStart"
    },
    responderMove: {
        registrationName: "onResponderMove"
    },
    responderEnd: {
        registrationName: "onResponderEnd"
    },
    responderRelease: {
        registrationName: "onResponderRelease"
    },
    responderTerminationRequest: {
        registrationName: "onResponderTerminationRequest"
    },
    responderGrant: {
        registrationName: "onResponderGrant"
    },
    responderReject: {
        registrationName: "onResponderReject"
    },
    responderTerminate: {
        registrationName: "onResponderTerminate"
    }
};

/**
 *
 * Responder System:
 * ----------------
 *
 * - A global, solitary "interaction lock" on a view.
 * - If a node becomes the responder, it should convey visual feedback
 *   immediately to indicate so, either by highlighting or moving accordingly.
 * - To be the responder means, that touches are exclusively important to that
 *   responder view, and no other view.
 * - While touches are still occurring, the responder lock can be transferred to
 *   a new view, but only to increasingly "higher" views (meaning ancestors of
 *   the current responder).
 *
 * Responder being granted:
 * ------------------------
 *
 * - Touch starts, moves, and scrolls can cause an ID to become the responder.
 * - We capture/bubble `startShouldSetResponder`/`moveShouldSetResponder` to
 *   the "appropriate place".
 * - If nothing is currently the responder, the "appropriate place" is the
 *   initiating event's `targetID`.
 * - If something *is* already the responder, the "appropriate place" is the
 *   first common ancestor of the event target and the current `responderInst`.
 * - Some negotiation happens: See the timing diagram below.
 * - Scrolled views automatically become responder. The reasoning is that a
 *   platform scroll view that isn't built on top of the responder system has
 *   began scrolling, and the active responder must now be notified that the
 *   interaction is no longer locked to it - the system has taken over.
 *
 * - Responder being released:
 *   As soon as no more touches that *started* inside of descendants of the
 *   *current* responderInst, an `onResponderRelease` event is dispatched to the
 *   current responder, and the responder lock is released.
 *
 * TODO:
 * - on "end", a callback hook for `onResponderEndShouldRemainResponder` that
 *   determines if the responder lock should remain.
 * - If a view shouldn't "remain" the responder, any active touches should by
 *   default be considered "dead" and do not influence future negotiations or
 *   bubble paths. It should be as if those touches do not exist.
 * -- For multitouch: Usually a translate-z will choose to "remain" responder
 *  after one out of many touches ended. For translate-y, usually the view
 *  doesn't wish to "remain" responder after one of many touches end.
 * - Consider building this on top of a `stopPropagation` model similar to
 *   `W3C` events.
 * - Ensure that `onResponderTerminate` is called on touch cancels, whether or
 *   not `onResponderTerminationRequest` returns `true` or `false`.
 *
 */
/*                                             Negotiation Performed
                                             +-----------------------+
                                            /                         \
Process low level events to    +     Current Responder      +   wantsResponderID
determine who to perform negot-|   (if any exists at all)   |
iation/transition              | Otherwise just pass through|
-------------------------------+----------------------------+------------------+
Bubble to find first ID        |                            |
to return true:wantsResponderID|                            |
                               |                            |
     +-------------+           |                            |
     | onTouchStart|           |                            |
     +------+------+     none  |                            |
            |            return|                            |
+-----------v-------------+true| +------------------------+ |
|onStartShouldSetResponder|----->|onResponderStart (cur)  |<-----------+
+-----------+-------------+    | +------------------------+ |          |
            |                  |                            | +--------+-------+
            | returned true for|       false:REJECT +-------->|onResponderReject
            | wantsResponderID |                    |       | +----------------+
            | (now attempt     | +------------------+-----+ |
            |  handoff)        | |   onResponder          | |
            +------------------->|      TerminationRequest| |
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |         true:GRANT +-------->|onResponderGrant|
                               |                            | +--------+-------+
                               | +------------------------+ |          |
                               | |   onResponderTerminate |<-----------+
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |                    +-------->|onResponderStart|
                               |                            | +----------------+
Bubble to find first ID        |                            |
to return true:wantsResponderID|                            |
                               |                            |
     +-------------+           |                            |
     | onTouchMove |           |                            |
     +------+------+     none  |                            |
            |            return|                            |
+-----------v-------------+true| +------------------------+ |
|onMoveShouldSetResponder |----->|onResponderMove (cur)   |<-----------+
+-----------+-------------+    | +------------------------+ |          |
            |                  |                            | +--------+-------+
            | returned true for|       false:REJECT +-------->|onResponderRejec|
            | wantsResponderID |                    |       | +----------------+
            | (now attempt     | +------------------+-----+ |
            |  handoff)        | |   onResponder          | |
            +------------------->|      TerminationRequest| |
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |         true:GRANT +-------->|onResponderGrant|
                               |                            | +--------+-------+
                               | +------------------------+ |          |
                               | |   onResponderTerminate |<-----------+
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |                    +-------->|onResponderMove |
                               |                            | +----------------+
                               |                            |
                               |                            |
      Some active touch started|                            |
      inside current responder | +------------------------+ |
      +------------------------->|      onResponderEnd    | |
      |                        | +------------------------+ |
  +---+---------+              |                            |
  | onTouchEnd  |              |                            |
  +---+---------+              |                            |
      |                        | +------------------------+ |
      +------------------------->|     onResponderEnd     | |
      No active touches started| +-----------+------------+ |
      inside current responder |             |              |
                               |             v              |
                               | +------------------------+ |
                               | |    onResponderRelease  | |
                               | +------------------------+ |
                               |                            |
                               +                            + */
/**
 * A note about event ordering in the `EventPluginHub`.
 *
 * Suppose plugins are injected in the following order:
 *
 * `[R, S, C]`
 *
 * To help illustrate the example, assume `S` is `SimpleEventPlugin` (for
 * `onClick` etc) and `R` is `ResponderEventPlugin`.
 *
 * "Deferred-Dispatched Events":
 *
 * - The current event plugin system will traverse the list of injected plugins,
 *   in order, and extract events by collecting the plugin's return value of
 *   `extractEvents()`.
 * - These events that are returned from `extractEvents` are "deferred
 *   dispatched events".
 * - When returned from `extractEvents`, deferred-dispatched events contain an
 *   "accumulation" of deferred dispatches.
 * - These deferred dispatches are accumulated/collected before they are
 *   returned, but processed at a later time by the `EventPluginHub` (hence the
 *   name deferred).
 *
 * In the process of returning their deferred-dispatched events, event plugins
 * themselves can dispatch events on-demand without returning them from
 * `extractEvents`. Plugins might want to do this, so that they can use event
 * dispatching as a tool that helps them decide which events should be extracted
 * in the first place.
 *
 * "On-Demand-Dispatched Events":
 *
 * - On-demand-dispatched events are not returned from `extractEvents`.
 * - On-demand-dispatched events are dispatched during the process of returning
 *   the deferred-dispatched events.
 * - They should not have side effects.
 * - They should be avoided, and/or eventually be replaced with another
 *   abstraction that allows event plugins to perform multiple "rounds" of event
 *   extraction.
 *
 * Therefore, the sequence of event dispatches becomes:
 *
 * - `R`s on-demand events (if any)   (dispatched by `R` on-demand)
 * - `S`s on-demand events (if any)   (dispatched by `S` on-demand)
 * - `C`s on-demand events (if any)   (dispatched by `C` on-demand)
 * - `R`s extracted events (if any)   (dispatched by `EventPluginHub`)
 * - `S`s extracted events (if any)   (dispatched by `EventPluginHub`)
 * - `C`s extracted events (if any)   (dispatched by `EventPluginHub`)
 *
 * In the case of `ResponderEventPlugin`: If the `startShouldSetResponder`
 * on-demand dispatch returns `true` (and some other details are satisfied) the
 * `onResponderGrant` deferred dispatched event is returned from
 * `extractEvents`. The sequence of dispatch executions in this case
 * will appear as follows:
 *
 * - `startShouldSetResponder` (`ResponderEventPlugin` dispatches on-demand)
 * - `touchStartCapture`       (`EventPluginHub` dispatches as usual)
 * - `touchStart`              (`EventPluginHub` dispatches as usual)
 * - `responderGrant/Reject`   (`EventPluginHub` dispatches as usual)
 */
function setResponderAndExtractTransfer(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var shouldSetEventType = isStartish$1(topLevelType) ? eventTypes.startShouldSetResponder : isMoveish$1(topLevelType) ? eventTypes.moveShouldSetResponder : "topSelectionChange" === topLevelType ? eventTypes.selectionChangeShouldSetResponder : eventTypes.scrollShouldSetResponder, bubbleShouldSetFrom = responderInst ? ReactTreeTraversal.getLowestCommonAncestor(responderInst, targetInst) : targetInst, skipOverBubbleShouldSetFrom = bubbleShouldSetFrom === responderInst, shouldSetEvent = ResponderSyntheticEvent_1.getPooled(shouldSetEventType, bubbleShouldSetFrom, nativeEvent, nativeEventTarget);
    shouldSetEvent.touchHistory = ResponderTouchHistoryStore_1.touchHistory, skipOverBubbleShouldSetFrom ? EventPropagators_1.accumulateTwoPhaseDispatchesSkipTarget(shouldSetEvent) : EventPropagators_1.accumulateTwoPhaseDispatches(shouldSetEvent);
    var wantsResponderInst = executeDispatchesInOrderStopAtTrue$1(shouldSetEvent);
    if (shouldSetEvent.isPersistent() || shouldSetEvent.constructor.release(shouldSetEvent), 
    !wantsResponderInst || wantsResponderInst === responderInst) return null;
    var extracted, grantEvent = ResponderSyntheticEvent_1.getPooled(eventTypes.responderGrant, wantsResponderInst, nativeEvent, nativeEventTarget);
    grantEvent.touchHistory = ResponderTouchHistoryStore_1.touchHistory, EventPropagators_1.accumulateDirectDispatches(grantEvent);
    var blockHostResponder = !0 === executeDirectDispatch$1(grantEvent);
    if (responderInst) {
        var terminationRequestEvent = ResponderSyntheticEvent_1.getPooled(eventTypes.responderTerminationRequest, responderInst, nativeEvent, nativeEventTarget);
        terminationRequestEvent.touchHistory = ResponderTouchHistoryStore_1.touchHistory, 
        EventPropagators_1.accumulateDirectDispatches(terminationRequestEvent);
        var shouldSwitch = !hasDispatches$1(terminationRequestEvent) || executeDirectDispatch$1(terminationRequestEvent);
        if (terminationRequestEvent.isPersistent() || terminationRequestEvent.constructor.release(terminationRequestEvent), 
        shouldSwitch) {
            var terminateEvent = ResponderSyntheticEvent_1.getPooled(eventTypes.responderTerminate, responderInst, nativeEvent, nativeEventTarget);
            terminateEvent.touchHistory = ResponderTouchHistoryStore_1.touchHistory, EventPropagators_1.accumulateDirectDispatches(terminateEvent), 
            extracted = accumulate_1(extracted, [ grantEvent, terminateEvent ]), changeResponder(wantsResponderInst, blockHostResponder);
        } else {
            var rejectEvent = ResponderSyntheticEvent_1.getPooled(eventTypes.responderReject, wantsResponderInst, nativeEvent, nativeEventTarget);
            rejectEvent.touchHistory = ResponderTouchHistoryStore_1.touchHistory, EventPropagators_1.accumulateDirectDispatches(rejectEvent), 
            extracted = accumulate_1(extracted, rejectEvent);
        }
    } else extracted = accumulate_1(extracted, grantEvent), changeResponder(wantsResponderInst, blockHostResponder);
    return extracted;
}

/**
 * A transfer is a negotiation between a currently set responder and the next
 * element to claim responder status. Any start event could trigger a transfer
 * of responderInst. Any move event could trigger a transfer.
 *
 * @param {string} topLevelType Record from `BrowserEventConstants`.
 * @return {boolean} True if a transfer of responder could possibly occur.
 */
function canTriggerTransfer(topLevelType, topLevelInst, nativeEvent) {
    // responderIgnoreScroll: We are trying to migrate away from specifically
    // tracking native scroll events here and responderIgnoreScroll indicates we
    // will send topTouchCancel to handle canceling touch events instead
    return topLevelInst && ("topScroll" === topLevelType && !nativeEvent.responderIgnoreScroll || trackedTouchCount > 0 && "topSelectionChange" === topLevelType || isStartish$1(topLevelType) || isMoveish$1(topLevelType));
}

/**
 * Returns whether or not this touch end event makes it such that there are no
 * longer any touches that started inside of the current `responderInst`.
 *
 * @param {NativeEvent} nativeEvent Native touch end event.
 * @return {boolean} Whether or not this touch end event ends the responder.
 */
function noResponderTouches(nativeEvent) {
    var touches = nativeEvent.touches;
    if (!touches || 0 === touches.length) return !0;
    for (var i = 0; i < touches.length; i++) {
        var activeTouch = touches[i], target = activeTouch.target;
        if (null !== target && void 0 !== target && 0 !== target) {
            // Is the original touch location inside of the current responder?
            var targetInst = EventPluginUtils_1.getInstanceFromNode(target);
            if (ReactTreeTraversal.isAncestor(responderInst, targetInst)) return !1;
        }
    }
    return !0;
}

var ResponderEventPlugin = {
    /* For unit testing only */
    _getResponder: function() {
        return responderInst;
    },
    eventTypes: eventTypes,
    /**
   * We must be resilient to `targetInst` being `null` on `touchMove` or
   * `touchEnd`. On certain platforms, this means that a native scroll has
   * assumed control and the original touch targets are destroyed.
   */
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        if (isStartish$1(topLevelType)) trackedTouchCount += 1; else if (isEndish$1(topLevelType)) {
            if (!(trackedTouchCount >= 0)) return console.error("Ended a touch event which was not counted in `trackedTouchCount`."), 
            null;
            trackedTouchCount -= 1;
        }
        ResponderTouchHistoryStore_1.recordTouchTrack(topLevelType, nativeEvent);
        var extracted = canTriggerTransfer(topLevelType, targetInst, nativeEvent) ? setResponderAndExtractTransfer(topLevelType, targetInst, nativeEvent, nativeEventTarget) : null, isResponderTouchStart = responderInst && isStartish$1(topLevelType), isResponderTouchMove = responderInst && isMoveish$1(topLevelType), isResponderTouchEnd = responderInst && isEndish$1(topLevelType), incrementalTouch = isResponderTouchStart ? eventTypes.responderStart : isResponderTouchMove ? eventTypes.responderMove : isResponderTouchEnd ? eventTypes.responderEnd : null;
        if (incrementalTouch) {
            var gesture = ResponderSyntheticEvent_1.getPooled(incrementalTouch, responderInst, nativeEvent, nativeEventTarget);
            gesture.touchHistory = ResponderTouchHistoryStore_1.touchHistory, EventPropagators_1.accumulateDirectDispatches(gesture), 
            extracted = accumulate_1(extracted, gesture);
        }
        var isResponderTerminate = responderInst && "topTouchCancel" === topLevelType, isResponderRelease = responderInst && !isResponderTerminate && isEndish$1(topLevelType) && noResponderTouches(nativeEvent), finalTouch = isResponderTerminate ? eventTypes.responderTerminate : isResponderRelease ? eventTypes.responderRelease : null;
        if (finalTouch) {
            var finalEvent = ResponderSyntheticEvent_1.getPooled(finalTouch, responderInst, nativeEvent, nativeEventTarget);
            finalEvent.touchHistory = ResponderTouchHistoryStore_1.touchHistory, EventPropagators_1.accumulateDirectDispatches(finalEvent), 
            extracted = accumulate_1(extracted, finalEvent), changeResponder(null);
        }
        var numberActiveTouches = ResponderTouchHistoryStore_1.touchHistory.numberActiveTouches;
        return ResponderEventPlugin.GlobalInteractionHandler && numberActiveTouches !== previousActiveTouches && ResponderEventPlugin.GlobalInteractionHandler.onChange(numberActiveTouches), 
        previousActiveTouches = numberActiveTouches, extracted;
    },
    GlobalResponderHandler: null,
    GlobalInteractionHandler: null,
    injection: {
        /**
     * @param {{onChange: (ReactID, ReactID) => void} GlobalResponderHandler
     * Object that handles any change in responder. Use this to inject
     * integration with an existing touch handling system etc.
     */
        injectGlobalResponderHandler: function(GlobalResponderHandler) {
            ResponderEventPlugin.GlobalResponderHandler = GlobalResponderHandler;
        },
        /**
     * @param {{onChange: (numberActiveTouches) => void} GlobalInteractionHandler
     * Object that handles any change in the number of active touches.
     */
        injectGlobalInteractionHandler: function(GlobalInteractionHandler) {
            ResponderEventPlugin.GlobalInteractionHandler = GlobalInteractionHandler;
        }
    }
}, ResponderEventPlugin_1 = ResponderEventPlugin, ReactDOMUnstableNativeDependencies = {
    injectComponentTree: EventPluginUtils_1.injection.injectComponentTree,
    ResponderEventPlugin: ResponderEventPlugin_1,
    ResponderTouchHistoryStore: ResponderTouchHistoryStore_1
}, ReactDOMComponentTree = reactDom.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactDOMComponentTree;

ReactDOMUnstableNativeDependencies.injectComponentTree(ReactDOMComponentTree);

var ReactDOMUnstableNativeDependencies_1 = ReactDOMUnstableNativeDependencies, unstableNativeDependencies = ReactDOMUnstableNativeDependencies_1;

module.exports = unstableNativeDependencies;
