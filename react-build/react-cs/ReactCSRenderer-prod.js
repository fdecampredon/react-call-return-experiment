/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @providesModule ReactCSRenderer-prod
 * @preventMunge
 */
"use strict";

var emptyObject = require("fbjs/lib/emptyObject"), invariant = require("fbjs/lib/invariant"), react = require("react"), shallowEqual = require("fbjs/lib/shallowEqual"), commonjsGlobal = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {}, ReactInstanceMap = {
    remove: function(key) {
        key._reactInternalFiber = void 0;
    },
    get: function(key) {
        return key._reactInternalFiber;
    },
    has: function(key) {
        return void 0 !== key._reactInternalFiber;
    },
    set: function(key, value) {
        key._reactInternalFiber = value;
    }
}, ReactInstanceMap_1 = ReactInstanceMap, ReactTypeOfWork = {
    IndeterminateComponent: 0,
    FunctionalComponent: 1,
    ClassComponent: 2,
    HostRoot: 3,
    HostPortal: 4,
    HostComponent: 5,
    HostText: 6,
    CallComponent: 7,
    CallHandlerPhase: 8,
    ReturnComponent: 9,
    Fragment: 10
}, ReactInternals = react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ReactGlobalSharedState = {
    ReactCurrentOwner: ReactInternals.ReactCurrentOwner
}, ReactGlobalSharedState_1 = ReactGlobalSharedState;

function getComponentName$1(fiber) {
    var type = fiber.type;
    return "string" == typeof type ? type : "function" == typeof type ? type.displayName || type.name : null;
}

var getComponentName_1 = getComponentName$1, ReactTypeOfSideEffect = {
    NoEffect: 0,
    PerformedWork: 1,
    Placement: 2,
    Update: 4,
    PlacementAndUpdate: 6,
    Deletion: 8,
    ContentReset: 16,
    Callback: 32,
    Err: 64,
    Ref: 128
}, HostComponent$1 = ReactTypeOfWork.HostComponent, HostRoot$1 = ReactTypeOfWork.HostRoot, HostPortal = ReactTypeOfWork.HostPortal, HostText = ReactTypeOfWork.HostText, NoEffect = ReactTypeOfSideEffect.NoEffect, Placement = ReactTypeOfSideEffect.Placement, MOUNTING = 1, MOUNTED = 2, UNMOUNTED = 3;

function isFiberMountedImpl(fiber) {
    var node = fiber;
    if (fiber.alternate) for (;node.return; ) node = node.return; else {
        if ((node.effectTag & Placement) !== NoEffect) return MOUNTING;
        for (;node.return; ) if (node = node.return, (node.effectTag & Placement) !== NoEffect) return MOUNTING;
    }
    return node.tag === HostRoot$1 ? MOUNTED : UNMOUNTED;
}

var isFiberMounted$1 = function(fiber) {
    return isFiberMountedImpl(fiber) === MOUNTED;
}, isMounted = function(component) {
    var fiber = ReactInstanceMap_1.get(component);
    return !!fiber && isFiberMountedImpl(fiber) === MOUNTED;
};

function assertIsMounted(fiber) {
    invariant(isFiberMountedImpl(fiber) === MOUNTED, "Unable to find node on an unmounted component.");
}

function findCurrentFiberUsingSlowPath(fiber) {
    var alternate = fiber.alternate;
    if (!alternate) {
        var state = isFiberMountedImpl(fiber);
        return invariant(state !== UNMOUNTED, "Unable to find node on an unmounted component."), 
        state === MOUNTING ? null : fiber;
    }
    for (var a = fiber, b = alternate; !0; ) {
        var parentA = a.return, parentB = parentA ? parentA.alternate : null;
        if (!parentA || !parentB) break;
        if (parentA.child === parentB.child) {
            for (var child = parentA.child; child; ) {
                if (child === a) return assertIsMounted(parentA), fiber;
                if (child === b) return assertIsMounted(parentA), alternate;
                child = child.sibling;
            }
            invariant(!1, "Unable to find node on an unmounted component.");
        }
        if (a.return !== b.return) a = parentA, b = parentB; else {
            for (var didFindChild = !1, _child = parentA.child; _child; ) {
                if (_child === a) {
                    didFindChild = !0, a = parentA, b = parentB;
                    break;
                }
                if (_child === b) {
                    didFindChild = !0, b = parentA, a = parentB;
                    break;
                }
                _child = _child.sibling;
            }
            if (!didFindChild) {
                for (_child = parentB.child; _child; ) {
                    if (_child === a) {
                        didFindChild = !0, a = parentB, b = parentA;
                        break;
                    }
                    if (_child === b) {
                        didFindChild = !0, b = parentB, a = parentA;
                        break;
                    }
                    _child = _child.sibling;
                }
                invariant(didFindChild, "Child was not found in either parent set. This indicates a bug " + "in React related to the return pointer. Please file an issue.");
            }
        }
        invariant(a.alternate === b, "Return fibers should always be each others' alternates. " + "This error is likely caused by a bug in React. Please file an issue.");
    }
    return invariant(a.tag === HostRoot$1, "Unable to find node on an unmounted component."), 
    a.stateNode.current === a ? fiber : alternate;
}

var findCurrentFiberUsingSlowPath_1 = findCurrentFiberUsingSlowPath, findCurrentHostFiber$1 = function(parent) {
    var currentParent = findCurrentFiberUsingSlowPath(parent);
    if (!currentParent) return null;
    for (var node = currentParent; !0; ) {
        if (node.tag === HostComponent$1 || node.tag === HostText) return node;
        if (node.child) node.child.return = node, node = node.child; else {
            if (node === currentParent) return null;
            for (;!node.sibling; ) {
                if (!node.return || node.return === currentParent) return null;
                node = node.return;
            }
            node.sibling.return = node.return, node = node.sibling;
        }
    }
    return null;
}, findCurrentHostFiberWithNoPortals$1 = function(parent) {
    var currentParent = findCurrentFiberUsingSlowPath(parent);
    if (!currentParent) return null;
    for (var node = currentParent; !0; ) {
        if (node.tag === HostComponent$1 || node.tag === HostText) return node;
        if (node.child && node.tag !== HostPortal) node.child.return = node, node = node.child; else {
            if (node === currentParent) return null;
            for (;!node.sibling; ) {
                if (!node.return || node.return === currentParent) return null;
                node = node.return;
            }
            node.sibling.return = node.return, node = node.sibling;
        }
    }
    return null;
}, ReactFiberTreeReflection = {
    isFiberMounted: isFiberMounted$1,
    isMounted: isMounted,
    findCurrentFiberUsingSlowPath: findCurrentFiberUsingSlowPath_1,
    findCurrentHostFiber: findCurrentHostFiber$1,
    findCurrentHostFiberWithNoPortals: findCurrentHostFiberWithNoPortals$1
}, valueStack = [], index$4 = -1, createCursor$1 = function(defaultValue) {
    return {
        current: defaultValue
    };
}, isEmpty = function() {
    return -1 === index$4;
}, pop$1 = function(cursor, fiber) {
    index$4 < 0 || (cursor.current = valueStack[index$4], valueStack[index$4] = null, 
    index$4--);
}, push$1 = function(cursor, value, fiber) {
    index$4++, valueStack[index$4] = cursor.current, cursor.current = value;
}, reset = function() {
    for (;index$4 > -1; ) valueStack[index$4] = null, index$4--;
}, ReactFiberStack = {
    createCursor: createCursor$1,
    isEmpty: isEmpty,
    pop: pop$1,
    push: push$1,
    reset: reset
}, isFiberMounted = ReactFiberTreeReflection.isFiberMounted, ClassComponent = ReactTypeOfWork.ClassComponent, HostRoot = ReactTypeOfWork.HostRoot, createCursor = ReactFiberStack.createCursor, pop = ReactFiberStack.pop, push = ReactFiberStack.push, contextStackCursor = createCursor(emptyObject), didPerformWorkStackCursor = createCursor(!1), previousContext = emptyObject;

function getUnmaskedContext(workInProgress) {
    return isContextProvider$1(workInProgress) ? previousContext : contextStackCursor.current;
}

var getUnmaskedContext_1 = getUnmaskedContext;

function cacheContext(workInProgress, unmaskedContext, maskedContext) {
    var instance = workInProgress.stateNode;
    instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext, instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
}

var cacheContext_1 = cacheContext, getMaskedContext = function(workInProgress, unmaskedContext) {
    var type = workInProgress.type, contextTypes = type.contextTypes;
    if (!contextTypes) return emptyObject;
    var instance = workInProgress.stateNode;
    if (instance && instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext) return instance.__reactInternalMemoizedMaskedChildContext;
    var context = {};
    for (var key in contextTypes) context[key] = unmaskedContext[key];
    return instance && cacheContext(workInProgress, unmaskedContext, context), context;
}, hasContextChanged = function() {
    return didPerformWorkStackCursor.current;
};

function isContextConsumer(fiber) {
    return fiber.tag === ClassComponent && null != fiber.type.contextTypes;
}

var isContextConsumer_1 = isContextConsumer;

function isContextProvider$1(fiber) {
    return fiber.tag === ClassComponent && null != fiber.type.childContextTypes;
}

var isContextProvider_1 = isContextProvider$1;

function popContextProvider(fiber) {
    isContextProvider$1(fiber) && (pop(didPerformWorkStackCursor, fiber), pop(contextStackCursor, fiber));
}

var popContextProvider_1 = popContextProvider, popTopLevelContextObject = function(fiber) {
    pop(didPerformWorkStackCursor, fiber), pop(contextStackCursor, fiber);
}, pushTopLevelContextObject = function(fiber, context, didChange) {
    invariant(null == contextStackCursor.cursor, "Unexpected context found on stack. " + "This error is likely caused by a bug in React. Please file an issue."), 
    push(contextStackCursor, context, fiber), push(didPerformWorkStackCursor, didChange, fiber);
};

function processChildContext$1(fiber, parentContext) {
    var instance = fiber.stateNode, childContextTypes = fiber.type.childContextTypes;
    if ("function" != typeof instance.getChildContext) return parentContext;
    var childContext = void 0;
    childContext = instance.getChildContext();
    for (var contextKey in childContext) invariant(contextKey in childContextTypes, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', getComponentName_1(fiber) || "Unknown", contextKey);
    return Object.assign({}, parentContext, childContext);
}

var processChildContext_1 = processChildContext$1, pushContextProvider = function(workInProgress) {
    if (!isContextProvider$1(workInProgress)) return !1;
    var instance = workInProgress.stateNode, memoizedMergedChildContext = instance && instance.__reactInternalMemoizedMergedChildContext || emptyObject;
    return previousContext = contextStackCursor.current, push(contextStackCursor, memoizedMergedChildContext, workInProgress), 
    push(didPerformWorkStackCursor, didPerformWorkStackCursor.current, workInProgress), 
    !0;
}, invalidateContextProvider = function(workInProgress, didChange) {
    var instance = workInProgress.stateNode;
    if (invariant(instance, "Expected to have an instance by this point. " + "This error is likely caused by a bug in React. Please file an issue."), 
    didChange) {
        var mergedContext = processChildContext$1(workInProgress, previousContext);
        instance.__reactInternalMemoizedMergedChildContext = mergedContext, pop(didPerformWorkStackCursor, workInProgress), 
        pop(contextStackCursor, workInProgress), push(contextStackCursor, mergedContext, workInProgress), 
        push(didPerformWorkStackCursor, didChange, workInProgress);
    } else pop(didPerformWorkStackCursor, workInProgress), push(didPerformWorkStackCursor, didChange, workInProgress);
}, resetContext = function() {
    previousContext = emptyObject, contextStackCursor.current = emptyObject, didPerformWorkStackCursor.current = !1;
}, findCurrentUnmaskedContext$1 = function(fiber) {
    invariant(isFiberMounted(fiber) && fiber.tag === ClassComponent, "Expected subtree parent to be a mounted class component. " + "This error is likely caused by a bug in React. Please file an issue.");
    for (var node = fiber; node.tag !== HostRoot; ) {
        if (isContextProvider$1(node)) return node.stateNode.__reactInternalMemoizedMergedChildContext;
        var parent = node.return;
        invariant(parent, "Found unexpected detached subtree parent. " + "This error is likely caused by a bug in React. Please file an issue."), 
        node = parent;
    }
    return node.stateNode.context;
}, ReactFiberContext = {
    getUnmaskedContext: getUnmaskedContext_1,
    cacheContext: cacheContext_1,
    getMaskedContext: getMaskedContext,
    hasContextChanged: hasContextChanged,
    isContextConsumer: isContextConsumer_1,
    isContextProvider: isContextProvider_1,
    popContextProvider: popContextProvider_1,
    popTopLevelContextObject: popTopLevelContextObject,
    pushTopLevelContextObject: pushTopLevelContextObject,
    processChildContext: processChildContext_1,
    pushContextProvider: pushContextProvider,
    invalidateContextProvider: invalidateContextProvider,
    resetContext: resetContext,
    findCurrentUnmaskedContext: findCurrentUnmaskedContext$1
}, NoWork$2 = 0, Sync = 1, Never = 2147483647, UNIT_SIZE = 10, MAGIC_NUMBER_OFFSET = 2, Sync_1 = Sync, NoWork_1 = NoWork$2, Never_1 = Never;

function msToExpirationTime(ms) {
    return (ms / UNIT_SIZE | 0) + MAGIC_NUMBER_OFFSET;
}

var msToExpirationTime_1 = msToExpirationTime;

function ceiling(num, precision) {
    return ((num / precision | 0) + 1) * precision;
}

function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs) {
    return ceiling(currentTime + expirationInMs / UNIT_SIZE, bucketSizeMs / UNIT_SIZE);
}

var computeExpirationBucket_1 = computeExpirationBucket, ReactFiberExpirationTime = {
    Sync: Sync_1,
    NoWork: NoWork_1,
    Never: Never_1,
    msToExpirationTime: msToExpirationTime_1,
    computeExpirationBucket: computeExpirationBucket_1
}, ReactTypeOfInternalContext = {
    NoContext: 0,
    AsyncUpdates: 1
}, NoEffect$1 = ReactTypeOfSideEffect.NoEffect, IndeterminateComponent = ReactTypeOfWork.IndeterminateComponent, ClassComponent$2 = ReactTypeOfWork.ClassComponent, HostRoot$2 = ReactTypeOfWork.HostRoot, HostComponent$2 = ReactTypeOfWork.HostComponent, HostText$1 = ReactTypeOfWork.HostText, HostPortal$1 = ReactTypeOfWork.HostPortal, CallComponent = ReactTypeOfWork.CallComponent, ReturnComponent = ReactTypeOfWork.ReturnComponent, Fragment = ReactTypeOfWork.Fragment, NoWork$1 = ReactFiberExpirationTime.NoWork, NoContext = ReactTypeOfInternalContext.NoContext;

function FiberNode(tag, key, internalContextTag) {
    this.tag = tag, this.key = key, this.type = null, this.stateNode = null, this.return = null, 
    this.child = null, this.sibling = null, this.index = 0, this.ref = null, this.pendingProps = null, 
    this.memoizedProps = null, this.updateQueue = null, this.memoizedState = null, this.internalContextTag = internalContextTag, 
    this.effectTag = NoEffect$1, this.nextEffect = null, this.firstEffect = null, this.lastEffect = null, 
    this.expirationTime = NoWork$1, this.alternate = null;
}

var createFiber = function(tag, key, internalContextTag) {
    return new FiberNode(tag, key, internalContextTag);
};

function shouldConstruct(Component) {
    return !(!Component.prototype || !Component.prototype.isReactComponent);
}

var createWorkInProgress = function(current, expirationTime) {
    var workInProgress = current.alternate;
    return null === workInProgress ? (workInProgress = createFiber(current.tag, current.key, current.internalContextTag), 
    workInProgress.type = current.type, workInProgress.stateNode = current.stateNode, 
    workInProgress.alternate = current, current.alternate = workInProgress) : (workInProgress.effectTag = NoEffect$1, 
    workInProgress.nextEffect = null, workInProgress.firstEffect = null, workInProgress.lastEffect = null), 
    workInProgress.expirationTime = expirationTime, workInProgress.child = current.child, 
    workInProgress.memoizedProps = current.memoizedProps, workInProgress.memoizedState = current.memoizedState, 
    workInProgress.updateQueue = current.updateQueue, workInProgress.sibling = current.sibling, 
    workInProgress.index = current.index, workInProgress.ref = current.ref, workInProgress;
}, createHostRootFiber$1 = function() {
    return createFiber(HostRoot$2, null, NoContext);
}, createFiberFromElement = function(element, internalContextTag, expirationTime) {
    var owner = null, fiber = createFiberFromElementType(element.type, element.key, internalContextTag, owner);
    return fiber.pendingProps = element.props, fiber.expirationTime = expirationTime, 
    fiber;
}, createFiberFromFragment = function(elements, internalContextTag, expirationTime) {
    var fiber = createFiber(Fragment, null, internalContextTag);
    return fiber.pendingProps = elements, fiber.expirationTime = expirationTime, fiber;
}, createFiberFromText = function(content, internalContextTag, expirationTime) {
    var fiber = createFiber(HostText$1, null, internalContextTag);
    return fiber.pendingProps = content, fiber.expirationTime = expirationTime, fiber;
};

function createFiberFromElementType(type, key, internalContextTag, debugOwner) {
    var fiber = void 0;
    if ("function" == typeof type) fiber = shouldConstruct(type) ? createFiber(ClassComponent$2, key, internalContextTag) : createFiber(IndeterminateComponent, key, internalContextTag), 
    fiber.type = type; else if ("string" == typeof type) fiber = createFiber(HostComponent$2, key, internalContextTag), 
    fiber.type = type; else if ("object" == typeof type && null !== type && "number" == typeof type.tag) fiber = type; else {
        var info = "";
        invariant(!1, "Element type is invalid: expected a string (for built-in components) " + "or a class/function (for composite components) but got: %s.%s", null == type ? type : typeof type, info);
    }
    return fiber;
}

var createFiberFromElementType_1 = createFiberFromElementType, createFiberFromHostInstanceForDeletion = function() {
    var fiber = createFiber(HostComponent$2, null, NoContext);
    return fiber.type = "DELETED", fiber;
}, createFiberFromCall = function(call, internalContextTag, expirationTime) {
    var fiber = createFiber(CallComponent, call.key, internalContextTag);
    return fiber.type = call.handler, fiber.pendingProps = call, fiber.expirationTime = expirationTime, 
    fiber;
}, createFiberFromReturn = function(returnNode, internalContextTag, expirationTime) {
    var fiber = createFiber(ReturnComponent, null, internalContextTag);
    return fiber.expirationTime = expirationTime, fiber;
}, createFiberFromPortal = function(portal, internalContextTag, expirationTime) {
    var fiber = createFiber(HostPortal$1, portal.key, internalContextTag);
    return fiber.pendingProps = portal.children || [], fiber.expirationTime = expirationTime, 
    fiber.stateNode = {
        containerInfo: portal.containerInfo,
        pendingChildren: null,
        implementation: portal.implementation
    }, fiber;
}, ReactFiber = {
    createWorkInProgress: createWorkInProgress,
    createHostRootFiber: createHostRootFiber$1,
    createFiberFromElement: createFiberFromElement,
    createFiberFromFragment: createFiberFromFragment,
    createFiberFromText: createFiberFromText,
    createFiberFromElementType: createFiberFromElementType_1,
    createFiberFromHostInstanceForDeletion: createFiberFromHostInstanceForDeletion,
    createFiberFromCall: createFiberFromCall,
    createFiberFromReturn: createFiberFromReturn,
    createFiberFromPortal: createFiberFromPortal
}, createHostRootFiber = ReactFiber.createHostRootFiber, NoWork = ReactFiberExpirationTime.NoWork, createFiberRoot$1 = function(containerInfo, hydrate) {
    var uninitializedFiber = createHostRootFiber(), root = {
        current: uninitializedFiber,
        containerInfo: containerInfo,
        pendingChildren: null,
        remainingExpirationTime: NoWork,
        isReadyForCommit: !1,
        finishedWork: null,
        context: null,
        pendingContext: null,
        hydrate: hydrate,
        nextScheduledRoot: null
    };
    return uninitializedFiber.stateNode = root, root;
}, ReactFiberRoot = {
    createFiberRoot: createFiberRoot$1
}, describeComponentFrame = function(name, source, ownerName) {
    return "\n    in " + (name || "Unknown") + (source ? " (at " + source.fileName.replace(/^.*[\\\/]/, "") + ":" + source.lineNumber + ")" : ownerName ? " (created by " + ownerName + ")" : "");
}, IndeterminateComponent$1 = ReactTypeOfWork.IndeterminateComponent, FunctionalComponent = ReactTypeOfWork.FunctionalComponent, ClassComponent$4 = ReactTypeOfWork.ClassComponent, HostComponent$4 = ReactTypeOfWork.HostComponent;

function describeFiber(fiber) {
    switch (fiber.tag) {
      case IndeterminateComponent$1:
      case FunctionalComponent:
      case ClassComponent$4:
      case HostComponent$4:
        var owner = fiber._debugOwner, source = fiber._debugSource, name = getComponentName_1(fiber), ownerName = null;
        return owner && (ownerName = getComponentName_1(owner)), describeComponentFrame(name, source, ownerName);

      default:
        return "";
    }
}

function getStackAddendumByWorkInProgressFiber$1(workInProgress) {
    var info = "", node = workInProgress;
    do {
        info += describeFiber(node), node = node.return;
    } while (node);
    return info;
}

var ReactFiberComponentTreeHook = {
    getStackAddendumByWorkInProgressFiber: getStackAddendumByWorkInProgressFiber$1
}, ReactErrorUtils = {
    _caughtError: null,
    _hasCaughtError: !1,
    _rethrowError: null,
    _hasRethrowError: !1,
    injection: {
        injectErrorUtils: function(injectedErrorUtils) {
            invariant("function" == typeof injectedErrorUtils.invokeGuardedCallback, "Injected invokeGuardedCallback() must be a function."), 
            invokeGuardedCallback$1 = injectedErrorUtils.invokeGuardedCallback;
        }
    },
    invokeGuardedCallback: function(name, func, context, a, b, c, d, e, f) {
        invokeGuardedCallback$1.apply(ReactErrorUtils, arguments);
    },
    invokeGuardedCallbackAndCatchFirstError: function(name, func, context, a, b, c, d, e, f) {
        if (ReactErrorUtils.invokeGuardedCallback.apply(this, arguments), ReactErrorUtils.hasCaughtError()) {
            var error = ReactErrorUtils.clearCaughtError();
            ReactErrorUtils._hasRethrowError || (ReactErrorUtils._hasRethrowError = !0, ReactErrorUtils._rethrowError = error);
        }
    },
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
}, invokeGuardedCallback$1 = function(name, func, context, a, b, c, d, e, f) {
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
}, ReactErrorUtils_1 = ReactErrorUtils, CallbackEffect = ReactTypeOfSideEffect.Callback, ClassComponent$6 = ReactTypeOfWork.ClassComponent, HostRoot$5 = ReactTypeOfWork.HostRoot, NoWork$5 = ReactFiberExpirationTime.NoWork;

function createUpdateQueue(baseState) {
    return {
        baseState: baseState,
        expirationTime: NoWork$5,
        first: null,
        last: null,
        callbackList: null,
        hasForceUpdate: !1,
        isInitialized: !1
    };
}

function insertUpdateIntoQueue(queue, update) {
    null === queue.last ? queue.first = queue.last = update : (queue.last.next = update, 
    queue.last = update), (queue.expirationTime === NoWork$5 || queue.expirationTime > update.expirationTime) && (queue.expirationTime = update.expirationTime);
}

var insertUpdateIntoQueue_1 = insertUpdateIntoQueue;

function insertUpdateIntoFiber$2(fiber, update) {
    var alternateFiber = fiber.alternate, queue1 = fiber.updateQueue;
    null === queue1 && (queue1 = fiber.updateQueue = createUpdateQueue(null));
    var queue2 = void 0;
    return null !== alternateFiber ? null === (queue2 = alternateFiber.updateQueue) && (queue2 = alternateFiber.updateQueue = createUpdateQueue(null)) : queue2 = null, 
    null === (queue2 = queue2 !== queue1 ? queue2 : null) ? void insertUpdateIntoQueue(queue1, update) : null === queue1.last || null === queue2.last ? (insertUpdateIntoQueue(queue1, update), 
    void insertUpdateIntoQueue(queue2, update)) : (insertUpdateIntoQueue(queue1, update), 
    void (queue2.last = update));
}

var insertUpdateIntoFiber_1 = insertUpdateIntoFiber$2;

function getUpdateExpirationTime$1(fiber) {
    if (fiber.tag !== ClassComponent$6 && fiber.tag !== HostRoot$5) return NoWork$5;
    var updateQueue = fiber.updateQueue;
    return null === updateQueue ? NoWork$5 : updateQueue.expirationTime;
}

var getUpdateExpirationTime_1 = getUpdateExpirationTime$1;

function getStateFromUpdate(update, instance, prevState, props) {
    var partialState = update.partialState;
    if ("function" == typeof partialState) {
        return partialState.call(instance, prevState, props);
    }
    return partialState;
}

function processUpdateQueue$2(current, workInProgress, queue, instance, props, renderExpirationTime) {
    if (null !== current && current.updateQueue === queue) {
        var currentQueue = queue;
        queue = workInProgress.updateQueue = {
            baseState: currentQueue.baseState,
            expirationTime: currentQueue.expirationTime,
            first: currentQueue.first,
            last: currentQueue.last,
            isInitialized: currentQueue.isInitialized,
            callbackList: null,
            hasForceUpdate: !1
        };
    }
    queue.expirationTime = NoWork$5;
    var state = void 0;
    queue.isInitialized ? state = queue.baseState : (state = queue.baseState = workInProgress.memoizedState, 
    queue.isInitialized = !0);
    for (var dontMutatePrevState = !0, update = queue.first, didSkip = !1; null !== update; ) {
        var updateExpirationTime = update.expirationTime;
        if (updateExpirationTime > renderExpirationTime) {
            var remainingExpirationTime = queue.expirationTime;
            (remainingExpirationTime === NoWork$5 || remainingExpirationTime > updateExpirationTime) && (queue.expirationTime = updateExpirationTime), 
            didSkip || (didSkip = !0, queue.baseState = state), update = update.next;
        } else {
            didSkip || (queue.first = update.next, null === queue.first && (queue.last = null));
            var _partialState = void 0;
            if (update.isReplace ? (state = getStateFromUpdate(update, instance, state, props), 
            dontMutatePrevState = !0) : (_partialState = getStateFromUpdate(update, instance, state, props)) && (state = dontMutatePrevState ? Object.assign({}, state, _partialState) : Object.assign(state, _partialState), 
            dontMutatePrevState = !1), update.isForced && (queue.hasForceUpdate = !0), null !== update.callback) {
                var _callbackList = queue.callbackList;
                null === _callbackList && (_callbackList = queue.callbackList = []), _callbackList.push(update);
            }
            update = update.next;
        }
    }
    return null !== queue.callbackList ? workInProgress.effectTag |= CallbackEffect : null !== queue.first || queue.hasForceUpdate || (workInProgress.updateQueue = null), 
    didSkip || (didSkip = !0, queue.baseState = state), state;
}

var processUpdateQueue_1 = processUpdateQueue$2;

function commitCallbacks(queue, context) {
    var callbackList = queue.callbackList;
    if (null !== callbackList) {
        queue.callbackList = null;
        for (var i = 0; i < callbackList.length; i++) {
            var update = callbackList[i], _callback = update.callback;
            update.callback = null, invariant("function" == typeof _callback, "Invalid argument passed as callback. Expected a function. Instead " + "received: %s", _callback), 
            _callback.call(context);
        }
    }
}

var commitCallbacks_1 = commitCallbacks, ReactFiberUpdateQueue = {
    insertUpdateIntoQueue: insertUpdateIntoQueue_1,
    insertUpdateIntoFiber: insertUpdateIntoFiber_1,
    getUpdateExpirationTime: getUpdateExpirationTime_1,
    processUpdateQueue: processUpdateQueue_1,
    commitCallbacks: commitCallbacks_1
}, ReactNativeCSFeatureFlags = {
    enableAsyncSubtreeAPI: !0,
    enableAsyncSchedulingByDefaultInReactDOM: !1,
    enableMutatingReconciler: !1,
    enableNoopReconciler: !1,
    enablePersistentReconciler: !0
}, ReactNativeCSFeatureFlags_1 = ReactNativeCSFeatureFlags, Update$1 = ReactTypeOfSideEffect.Update, isMounted$1 = ReactFiberTreeReflection.isMounted, AsyncUpdates$1 = ReactTypeOfInternalContext.AsyncUpdates, cacheContext$1 = ReactFiberContext.cacheContext, getMaskedContext$2 = ReactFiberContext.getMaskedContext, getUnmaskedContext$2 = ReactFiberContext.getUnmaskedContext, isContextConsumer$1 = ReactFiberContext.isContextConsumer, insertUpdateIntoFiber$1 = ReactFiberUpdateQueue.insertUpdateIntoFiber, processUpdateQueue$1 = ReactFiberUpdateQueue.processUpdateQueue, _require6 = ReactFiberContext, hasContextChanged$2 = _require6.hasContextChanged, ReactFiberClassComponent = function(scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState) {
    var updater = {
        isMounted: isMounted$1,
        enqueueSetState: function(instance, partialState, callback) {
            var fiber = ReactInstanceMap_1.get(instance);
            callback = void 0 === callback ? null : callback;
            var expirationTime = computeExpirationForFiber(fiber);
            insertUpdateIntoFiber$1(fiber, {
                expirationTime: expirationTime,
                partialState: partialState,
                callback: callback,
                isReplace: !1,
                isForced: !1,
                nextCallback: null,
                next: null
            }), scheduleWork(fiber, expirationTime);
        },
        enqueueReplaceState: function(instance, state, callback) {
            var fiber = ReactInstanceMap_1.get(instance);
            callback = void 0 === callback ? null : callback;
            var expirationTime = computeExpirationForFiber(fiber);
            insertUpdateIntoFiber$1(fiber, {
                expirationTime: expirationTime,
                partialState: state,
                callback: callback,
                isReplace: !0,
                isForced: !1,
                nextCallback: null,
                next: null
            }), scheduleWork(fiber, expirationTime);
        },
        enqueueForceUpdate: function(instance, callback) {
            var fiber = ReactInstanceMap_1.get(instance);
            callback = void 0 === callback ? null : callback;
            var expirationTime = computeExpirationForFiber(fiber);
            insertUpdateIntoFiber$1(fiber, {
                expirationTime: expirationTime,
                partialState: null,
                callback: callback,
                isReplace: !1,
                isForced: !0,
                nextCallback: null,
                next: null
            }), scheduleWork(fiber, expirationTime);
        }
    };
    function checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext) {
        if (null === oldProps || null !== workInProgress.updateQueue && workInProgress.updateQueue.hasForceUpdate) return !0;
        var instance = workInProgress.stateNode, type = workInProgress.type;
        if ("function" == typeof instance.shouldComponentUpdate) {
            return instance.shouldComponentUpdate(newProps, newState, newContext);
        }
        return !type.prototype || !type.prototype.isPureReactComponent || (!shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState));
    }
    function resetInputPointers(workInProgress, instance) {
        instance.props = workInProgress.memoizedProps, instance.state = workInProgress.memoizedState;
    }
    function adoptClassInstance(workInProgress, instance) {
        instance.updater = updater, workInProgress.stateNode = instance, ReactInstanceMap_1.set(instance, workInProgress);
    }
    function constructClassInstance(workInProgress, props) {
        var ctor = workInProgress.type, unmaskedContext = getUnmaskedContext$2(workInProgress), needsContext = isContextConsumer$1(workInProgress), context = needsContext ? getMaskedContext$2(workInProgress, unmaskedContext) : emptyObject, instance = new ctor(props, context);
        return adoptClassInstance(workInProgress, instance), needsContext && cacheContext$1(workInProgress, unmaskedContext, context), 
        instance;
    }
    function callComponentWillMount(workInProgress, instance) {
        var oldState = instance.state;
        instance.componentWillMount(), oldState !== instance.state && updater.enqueueReplaceState(instance, instance.state, null);
    }
    function callComponentWillReceiveProps(workInProgress, instance, newProps, newContext) {
        var oldState = instance.state;
        instance.componentWillReceiveProps(newProps, newContext), instance.state !== oldState && updater.enqueueReplaceState(instance, instance.state, null);
    }
    function mountClassInstance(workInProgress, renderExpirationTime) {
        var current = workInProgress.alternate, instance = workInProgress.stateNode, state = instance.state || null, props = workInProgress.pendingProps;
        invariant(props, "There must be pending props for an initial mount. This error is " + "likely caused by a bug in React. Please file an issue.");
        var unmaskedContext = getUnmaskedContext$2(workInProgress);
        if (instance.props = props, instance.state = workInProgress.memoizedState = state, 
        instance.refs = emptyObject, instance.context = getMaskedContext$2(workInProgress, unmaskedContext), 
        ReactNativeCSFeatureFlags_1.enableAsyncSubtreeAPI && null != workInProgress.type && null != workInProgress.type.prototype && !0 === workInProgress.type.prototype.unstable_isAsyncReactComponent && (workInProgress.internalContextTag |= AsyncUpdates$1), 
        "function" == typeof instance.componentWillMount) {
            callComponentWillMount(workInProgress, instance);
            var updateQueue = workInProgress.updateQueue;
            null !== updateQueue && (instance.state = processUpdateQueue$1(current, workInProgress, updateQueue, instance, props, renderExpirationTime));
        }
        "function" == typeof instance.componentDidMount && (workInProgress.effectTag |= Update$1);
    }
    function updateClassInstance(current, workInProgress, renderExpirationTime) {
        var instance = workInProgress.stateNode;
        resetInputPointers(workInProgress, instance);
        var oldProps = workInProgress.memoizedProps, newProps = workInProgress.pendingProps;
        newProps || (newProps = oldProps, invariant(null != newProps, "There should always be pending or memoized props. This error is " + "likely caused by a bug in React. Please file an issue."));
        var oldContext = instance.context, newUnmaskedContext = getUnmaskedContext$2(workInProgress), newContext = getMaskedContext$2(workInProgress, newUnmaskedContext);
        "function" != typeof instance.componentWillReceiveProps || oldProps === newProps && oldContext === newContext || callComponentWillReceiveProps(workInProgress, instance, newProps, newContext);
        var oldState = workInProgress.memoizedState, newState = void 0;
        if (newState = null !== workInProgress.updateQueue ? processUpdateQueue$1(current, workInProgress, workInProgress.updateQueue, instance, newProps, renderExpirationTime) : oldState, 
        !(oldProps !== newProps || oldState !== newState || hasContextChanged$2() || null !== workInProgress.updateQueue && workInProgress.updateQueue.hasForceUpdate)) return "function" == typeof instance.componentDidUpdate && (oldProps === current.memoizedProps && oldState === current.memoizedState || (workInProgress.effectTag |= Update$1)), 
        !1;
        var shouldUpdate = checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext);
        return shouldUpdate ? ("function" == typeof instance.componentWillUpdate && instance.componentWillUpdate(newProps, newState, newContext), 
        "function" == typeof instance.componentDidUpdate && (workInProgress.effectTag |= Update$1)) : ("function" == typeof instance.componentDidUpdate && (oldProps === current.memoizedProps && oldState === current.memoizedState || (workInProgress.effectTag |= Update$1)), 
        memoizeProps(workInProgress, newProps), memoizeState(workInProgress, newState)), 
        instance.props = newProps, instance.state = newState, instance.context = newContext, 
        shouldUpdate;
    }
    return {
        adoptClassInstance: adoptClassInstance,
        constructClassInstance: constructClassInstance,
        mountClassInstance: mountClassInstance,
        updateClassInstance: updateClassInstance
    };
}, REACT_PORTAL_TYPE$1 = "function" == typeof Symbol && Symbol.for && Symbol.for("react.portal") || 60106, createPortal = function(children, containerInfo, implementation) {
    var key = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
    return {
        $$typeof: REACT_PORTAL_TYPE$1,
        key: null == key ? null : "" + key,
        children: children,
        containerInfo: containerInfo,
        implementation: implementation
    };
}, REACT_PORTAL_TYPE_1 = REACT_PORTAL_TYPE$1, ReactPortal = {
    createPortal: createPortal,
    REACT_PORTAL_TYPE: REACT_PORTAL_TYPE_1
}, REACT_PORTAL_TYPE = ReactPortal.REACT_PORTAL_TYPE, createWorkInProgress$2 = ReactFiber.createWorkInProgress, createFiberFromElement$1 = ReactFiber.createFiberFromElement, createFiberFromFragment$1 = ReactFiber.createFiberFromFragment, createFiberFromText$1 = ReactFiber.createFiberFromText, createFiberFromCall$1 = ReactFiber.createFiberFromCall, createFiberFromReturn$1 = ReactFiber.createFiberFromReturn, createFiberFromPortal$1 = ReactFiber.createFiberFromPortal, isArray$1 = Array.isArray, FunctionalComponent$2 = ReactTypeOfWork.FunctionalComponent, ClassComponent$7 = ReactTypeOfWork.ClassComponent, HostText$3 = ReactTypeOfWork.HostText, HostPortal$4 = ReactTypeOfWork.HostPortal, CallComponent$2 = ReactTypeOfWork.CallComponent, ReturnComponent$2 = ReactTypeOfWork.ReturnComponent, Fragment$2 = ReactTypeOfWork.Fragment, NoEffect$2 = ReactTypeOfSideEffect.NoEffect, Placement$3 = ReactTypeOfSideEffect.Placement, Deletion$1 = ReactTypeOfSideEffect.Deletion, ITERATOR_SYMBOL = "function" == typeof Symbol && Symbol.iterator, FAUX_ITERATOR_SYMBOL = "@@iterator", REACT_ELEMENT_TYPE, REACT_CALL_TYPE, REACT_RETURN_TYPE;

"function" == typeof Symbol && Symbol.for ? (REACT_ELEMENT_TYPE = Symbol.for("react.element"), 
REACT_CALL_TYPE = Symbol.for("react.call"), REACT_RETURN_TYPE = Symbol.for("react.return")) : (REACT_ELEMENT_TYPE = 60103, 
REACT_CALL_TYPE = 60104, REACT_RETURN_TYPE = 60105);

function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || void 0 === maybeIterable) return null;
    var iteratorFn = ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
    return "function" == typeof iteratorFn ? iteratorFn : null;
}

function coerceRef(current, element) {
    var mixedRef = element.ref;
    if (null !== mixedRef && "function" != typeof mixedRef) {
        if (element._owner) {
            var owner = element._owner, inst = void 0;
            if (owner) {
                var ownerFiber = owner;
                invariant(ownerFiber.tag === ClassComponent$7, "Stateless function components cannot have refs."), 
                inst = ownerFiber.stateNode;
            }
            invariant(inst, "Missing owner for string ref %s. This error is likely caused by a " + "bug in React. Please file an issue.", mixedRef);
            var stringRef = "" + mixedRef;
            if (null !== current && null !== current.ref && current.ref._stringRef === stringRef) return current.ref;
            var ref = function(value) {
                var refs = inst.refs === emptyObject ? inst.refs = {} : inst.refs;
                null === value ? delete refs[stringRef] : refs[stringRef] = value;
            };
            return ref._stringRef = stringRef, ref;
        }
        invariant("string" == typeof mixedRef, "Expected ref to be a function or a string."), 
        invariant(element._owner, "Element ref was specified as a string (%s) but no owner was " + "set. You may have multiple copies of React loaded. " + "(details: https://fb.me/react-refs-must-have-owner).", mixedRef);
    }
    return mixedRef;
}

function throwOnInvalidObjectType(returnFiber, newChild) {
    if ("textarea" !== returnFiber.type) {
        invariant(!1, "Objects are not valid as a React child (found: %s).%s", "[object Object]" === Object.prototype.toString.call(newChild) ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : newChild, "");
    }
}

function ChildReconciler(shouldClone, shouldTrackSideEffects) {
    function deleteChild(returnFiber, childToDelete) {
        if (shouldTrackSideEffects) {
            if (!shouldClone) {
                if (null === childToDelete.alternate) return;
                childToDelete = childToDelete.alternate;
            }
            var last = returnFiber.lastEffect;
            null !== last ? (last.nextEffect = childToDelete, returnFiber.lastEffect = childToDelete) : returnFiber.firstEffect = returnFiber.lastEffect = childToDelete, 
            childToDelete.nextEffect = null, childToDelete.effectTag = Deletion$1;
        }
    }
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
        if (!shouldTrackSideEffects) return null;
        for (var childToDelete = currentFirstChild; null !== childToDelete; ) deleteChild(returnFiber, childToDelete), 
        childToDelete = childToDelete.sibling;
        return null;
    }
    function mapRemainingChildren(returnFiber, currentFirstChild) {
        for (var existingChildren = new Map(), existingChild = currentFirstChild; null !== existingChild; ) null !== existingChild.key ? existingChildren.set(existingChild.key, existingChild) : existingChildren.set(existingChild.index, existingChild), 
        existingChild = existingChild.sibling;
        return existingChildren;
    }
    function useFiber(fiber, expirationTime) {
        if (shouldClone) {
            var clone = createWorkInProgress$2(fiber, expirationTime);
            return clone.index = 0, clone.sibling = null, clone;
        }
        return fiber.expirationTime = expirationTime, fiber.effectTag = NoEffect$2, fiber.index = 0, 
        fiber.sibling = null, fiber;
    }
    function placeChild(newFiber, lastPlacedIndex, newIndex) {
        if (newFiber.index = newIndex, !shouldTrackSideEffects) return lastPlacedIndex;
        var current = newFiber.alternate;
        if (null !== current) {
            var oldIndex = current.index;
            return oldIndex < lastPlacedIndex ? (newFiber.effectTag = Placement$3, lastPlacedIndex) : oldIndex;
        }
        return newFiber.effectTag = Placement$3, lastPlacedIndex;
    }
    function placeSingleChild(newFiber) {
        return shouldTrackSideEffects && null === newFiber.alternate && (newFiber.effectTag = Placement$3), 
        newFiber;
    }
    function updateTextNode(returnFiber, current, textContent, expirationTime) {
        if (null === current || current.tag !== HostText$3) {
            var created = createFiberFromText$1(textContent, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        var existing = useFiber(current, expirationTime);
        return existing.pendingProps = textContent, existing.return = returnFiber, existing;
    }
    function updateElement(returnFiber, current, element, expirationTime) {
        if (null === current || current.type !== element.type) {
            var created = createFiberFromElement$1(element, returnFiber.internalContextTag, expirationTime);
            return created.ref = coerceRef(current, element), created.return = returnFiber, 
            created;
        }
        var existing = useFiber(current, expirationTime);
        return existing.ref = coerceRef(current, element), existing.pendingProps = element.props, 
        existing.return = returnFiber, existing;
    }
    function updateCall(returnFiber, current, call, expirationTime) {
        if (null === current || current.tag !== CallComponent$2) {
            var created = createFiberFromCall$1(call, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        var existing = useFiber(current, expirationTime);
        return existing.pendingProps = call, existing.return = returnFiber, existing;
    }
    function updateReturn(returnFiber, current, returnNode, expirationTime) {
        if (null === current || current.tag !== ReturnComponent$2) {
            var created = createFiberFromReturn$1(returnNode, returnFiber.internalContextTag, expirationTime);
            return created.type = returnNode.value, created.return = returnFiber, created;
        }
        var existing = useFiber(current, expirationTime);
        return existing.type = returnNode.value, existing.return = returnFiber, existing;
    }
    function updatePortal(returnFiber, current, portal, expirationTime) {
        if (null === current || current.tag !== HostPortal$4 || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) {
            var created = createFiberFromPortal$1(portal, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        var existing = useFiber(current, expirationTime);
        return existing.pendingProps = portal.children || [], existing.return = returnFiber, 
        existing;
    }
    function updateFragment(returnFiber, current, fragment, expirationTime) {
        if (null === current || current.tag !== Fragment$2) {
            var created = createFiberFromFragment$1(fragment, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        var existing = useFiber(current, expirationTime);
        return existing.pendingProps = fragment, existing.return = returnFiber, existing;
    }
    function createChild(returnFiber, newChild, expirationTime) {
        if ("string" == typeof newChild || "number" == typeof newChild) {
            var created = createFiberFromText$1("" + newChild, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        if ("object" == typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                var _created = createFiberFromElement$1(newChild, returnFiber.internalContextTag, expirationTime);
                return _created.ref = coerceRef(null, newChild), _created.return = returnFiber, 
                _created;

              case REACT_CALL_TYPE:
                var _created2 = createFiberFromCall$1(newChild, returnFiber.internalContextTag, expirationTime);
                return _created2.return = returnFiber, _created2;

              case REACT_RETURN_TYPE:
                var _created3 = createFiberFromReturn$1(newChild, returnFiber.internalContextTag, expirationTime);
                return _created3.type = newChild.value, _created3.return = returnFiber, _created3;

              case REACT_PORTAL_TYPE:
                var _created4 = createFiberFromPortal$1(newChild, returnFiber.internalContextTag, expirationTime);
                return _created4.return = returnFiber, _created4;
            }
            if (isArray$1(newChild) || getIteratorFn(newChild)) {
                var _created5 = createFiberFromFragment$1(newChild, returnFiber.internalContextTag, expirationTime);
                return _created5.return = returnFiber, _created5;
            }
            throwOnInvalidObjectType(returnFiber, newChild);
        }
        return null;
    }
    function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {
        var key = null !== oldFiber ? oldFiber.key : null;
        if ("string" == typeof newChild || "number" == typeof newChild) return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, expirationTime);
        if ("object" == typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, expirationTime) : null;

              case REACT_CALL_TYPE:
                return newChild.key === key ? updateCall(returnFiber, oldFiber, newChild, expirationTime) : null;

              case REACT_RETURN_TYPE:
                return null === key ? updateReturn(returnFiber, oldFiber, newChild, expirationTime) : null;

              case REACT_PORTAL_TYPE:
                return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, expirationTime) : null;
            }
            if (isArray$1(newChild) || getIteratorFn(newChild)) return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, expirationTime);
            throwOnInvalidObjectType(returnFiber, newChild);
        }
        return null;
    }
    function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {
        if ("string" == typeof newChild || "number" == typeof newChild) {
            return updateTextNode(returnFiber, existingChildren.get(newIdx) || null, "" + newChild, expirationTime);
        }
        if ("object" == typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return updateElement(returnFiber, existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, newChild, expirationTime);

              case REACT_CALL_TYPE:
                return updateCall(returnFiber, existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, newChild, expirationTime);

              case REACT_RETURN_TYPE:
                return updateReturn(returnFiber, existingChildren.get(newIdx) || null, newChild, expirationTime);

              case REACT_PORTAL_TYPE:
                return updatePortal(returnFiber, existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, newChild, expirationTime);
            }
            if (isArray$1(newChild) || getIteratorFn(newChild)) {
                return updateFragment(returnFiber, existingChildren.get(newIdx) || null, newChild, expirationTime);
            }
            throwOnInvalidObjectType(returnFiber, newChild);
        }
        return null;
    }
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, expirationTime) {
        for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, lastPlacedIndex = 0, newIdx = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
            oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
            var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);
            if (null === newFiber) {
                null === oldFiber && (oldFiber = nextOldFiber);
                break;
            }
            shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber), 
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx), null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber, 
            previousNewFiber = newFiber, oldFiber = nextOldFiber;
        }
        if (newIdx === newChildren.length) return deleteRemainingChildren(returnFiber, oldFiber), 
        resultingFirstChild;
        if (null === oldFiber) {
            for (;newIdx < newChildren.length; newIdx++) {
                var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);
                _newFiber && (lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx), 
                null === previousNewFiber ? resultingFirstChild = _newFiber : previousNewFiber.sibling = _newFiber, 
                previousNewFiber = _newFiber);
            }
            return resultingFirstChild;
        }
        for (var existingChildren = mapRemainingChildren(returnFiber, oldFiber); newIdx < newChildren.length; newIdx++) {
            var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], expirationTime);
            _newFiber2 && (shouldTrackSideEffects && null !== _newFiber2.alternate && existingChildren.delete(null === _newFiber2.key ? newIdx : _newFiber2.key), 
            lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx), null === previousNewFiber ? resultingFirstChild = _newFiber2 : previousNewFiber.sibling = _newFiber2, 
            previousNewFiber = _newFiber2);
        }
        return shouldTrackSideEffects && existingChildren.forEach(function(child) {
            return deleteChild(returnFiber, child);
        }), resultingFirstChild;
    }
    function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildrenIterable, expirationTime) {
        var iteratorFn = getIteratorFn(newChildrenIterable);
        invariant("function" == typeof iteratorFn, "An object is not an iterable. This error is likely caused by a bug in " + "React. Please file an issue.");
        var newChildren = iteratorFn.call(newChildrenIterable);
        invariant(null != newChildren, "An iterable object provided no iterator.");
        for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, lastPlacedIndex = 0, newIdx = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, 
        step = newChildren.next()) {
            oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
            var newFiber = updateSlot(returnFiber, oldFiber, step.value, expirationTime);
            if (null === newFiber) {
                oldFiber || (oldFiber = nextOldFiber);
                break;
            }
            shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber), 
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx), null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber, 
            previousNewFiber = newFiber, oldFiber = nextOldFiber;
        }
        if (step.done) return deleteRemainingChildren(returnFiber, oldFiber), resultingFirstChild;
        if (null === oldFiber) {
            for (;!step.done; newIdx++, step = newChildren.next()) {
                var _newFiber3 = createChild(returnFiber, step.value, expirationTime);
                null !== _newFiber3 && (lastPlacedIndex = placeChild(_newFiber3, lastPlacedIndex, newIdx), 
                null === previousNewFiber ? resultingFirstChild = _newFiber3 : previousNewFiber.sibling = _newFiber3, 
                previousNewFiber = _newFiber3);
            }
            return resultingFirstChild;
        }
        for (var existingChildren = mapRemainingChildren(returnFiber, oldFiber); !step.done; newIdx++, 
        step = newChildren.next()) {
            var _newFiber4 = updateFromMap(existingChildren, returnFiber, newIdx, step.value, expirationTime);
            null !== _newFiber4 && (shouldTrackSideEffects && null !== _newFiber4.alternate && existingChildren.delete(null === _newFiber4.key ? newIdx : _newFiber4.key), 
            lastPlacedIndex = placeChild(_newFiber4, lastPlacedIndex, newIdx), null === previousNewFiber ? resultingFirstChild = _newFiber4 : previousNewFiber.sibling = _newFiber4, 
            previousNewFiber = _newFiber4);
        }
        return shouldTrackSideEffects && existingChildren.forEach(function(child) {
            return deleteChild(returnFiber, child);
        }), resultingFirstChild;
    }
    function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, expirationTime) {
        if (null !== currentFirstChild && currentFirstChild.tag === HostText$3) {
            deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
            var existing = useFiber(currentFirstChild, expirationTime);
            return existing.pendingProps = textContent, existing.return = returnFiber, existing;
        }
        deleteRemainingChildren(returnFiber, currentFirstChild);
        var created = createFiberFromText$1(textContent, returnFiber.internalContextTag, expirationTime);
        return created.return = returnFiber, created;
    }
    function reconcileSingleElement(returnFiber, currentFirstChild, element, expirationTime) {
        for (var key = element.key, child = currentFirstChild; null !== child; ) {
            if (child.key === key) {
                if (child.type === element.type) {
                    deleteRemainingChildren(returnFiber, child.sibling);
                    var existing = useFiber(child, expirationTime);
                    return existing.ref = coerceRef(child, element), existing.pendingProps = element.props, 
                    existing.return = returnFiber, existing;
                }
                deleteRemainingChildren(returnFiber, child);
                break;
            }
            deleteChild(returnFiber, child), child = child.sibling;
        }
        var created = createFiberFromElement$1(element, returnFiber.internalContextTag, expirationTime);
        return created.ref = coerceRef(currentFirstChild, element), created.return = returnFiber, 
        created;
    }
    function reconcileSingleCall(returnFiber, currentFirstChild, call, expirationTime) {
        for (var key = call.key, child = currentFirstChild; null !== child; ) {
            if (child.key === key) {
                if (child.tag === CallComponent$2) {
                    deleteRemainingChildren(returnFiber, child.sibling);
                    var existing = useFiber(child, expirationTime);
                    return existing.pendingProps = call, existing.return = returnFiber, existing;
                }
                deleteRemainingChildren(returnFiber, child);
                break;
            }
            deleteChild(returnFiber, child), child = child.sibling;
        }
        var created = createFiberFromCall$1(call, returnFiber.internalContextTag, expirationTime);
        return created.return = returnFiber, created;
    }
    function reconcileSingleReturn(returnFiber, currentFirstChild, returnNode, expirationTime) {
        var child = currentFirstChild;
        if (null !== child) {
            if (child.tag === ReturnComponent$2) {
                deleteRemainingChildren(returnFiber, child.sibling);
                var existing = useFiber(child, expirationTime);
                return existing.type = returnNode.value, existing.return = returnFiber, existing;
            }
            deleteRemainingChildren(returnFiber, child);
        }
        var created = createFiberFromReturn$1(returnNode, returnFiber.internalContextTag, expirationTime);
        return created.type = returnNode.value, created.return = returnFiber, created;
    }
    function reconcileSinglePortal(returnFiber, currentFirstChild, portal, expirationTime) {
        for (var key = portal.key, child = currentFirstChild; null !== child; ) {
            if (child.key === key) {
                if (child.tag === HostPortal$4 && child.stateNode.containerInfo === portal.containerInfo && child.stateNode.implementation === portal.implementation) {
                    deleteRemainingChildren(returnFiber, child.sibling);
                    var existing = useFiber(child, expirationTime);
                    return existing.pendingProps = portal.children || [], existing.return = returnFiber, 
                    existing;
                }
                deleteRemainingChildren(returnFiber, child);
                break;
            }
            deleteChild(returnFiber, child), child = child.sibling;
        }
        var created = createFiberFromPortal$1(portal, returnFiber.internalContextTag, expirationTime);
        return created.return = returnFiber, created;
    }
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
        var isObject = "object" == typeof newChild && null !== newChild;
        if (isObject) switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, expirationTime));

          case REACT_CALL_TYPE:
            return placeSingleChild(reconcileSingleCall(returnFiber, currentFirstChild, newChild, expirationTime));

          case REACT_RETURN_TYPE:
            return placeSingleChild(reconcileSingleReturn(returnFiber, currentFirstChild, newChild, expirationTime));

          case REACT_PORTAL_TYPE:
            return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, expirationTime));
        }
        if ("string" == typeof newChild || "number" == typeof newChild) return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, "" + newChild, expirationTime));
        if (isArray$1(newChild)) return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime);
        if (getIteratorFn(newChild)) return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, expirationTime);
        if (isObject && throwOnInvalidObjectType(returnFiber, newChild), void 0 === newChild) switch (returnFiber.tag) {
          case ClassComponent$7:
          case FunctionalComponent$2:
            var Component = returnFiber.type;
            invariant(!1, "%s(...): Nothing was returned from render. This usually means a " + "return statement is missing. Or, to render nothing, " + "return null.", Component.displayName || Component.name || "Component");
        }
        return deleteRemainingChildren(returnFiber, currentFirstChild);
    }
    return reconcileChildFibers;
}

var reconcileChildFibers$1 = ChildReconciler(!0, !0), reconcileChildFibersInPlace$1 = ChildReconciler(!1, !0), mountChildFibersInPlace$1 = ChildReconciler(!1, !1), cloneChildFibers$1 = function(current, workInProgress) {
    if (invariant(null === current || workInProgress.child === current.child, "Resuming work not yet implemented."), 
    null !== workInProgress.child) {
        var currentChild = workInProgress.child, newChild = createWorkInProgress$2(currentChild, currentChild.expirationTime);
        for (newChild.pendingProps = currentChild.pendingProps, workInProgress.child = newChild, 
        newChild.return = workInProgress; null !== currentChild.sibling; ) currentChild = currentChild.sibling, 
        newChild = newChild.sibling = createWorkInProgress$2(currentChild, currentChild.expirationTime), 
        newChild.pendingProps = currentChild.pendingProps, newChild.return = workInProgress;
        newChild.sibling = null;
    }
}, ReactChildFiber = {
    reconcileChildFibers: reconcileChildFibers$1,
    reconcileChildFibersInPlace: reconcileChildFibersInPlace$1,
    mountChildFibersInPlace: mountChildFibersInPlace$1,
    cloneChildFibers: cloneChildFibers$1
}, IndeterminateComponent$2 = ReactTypeOfWork.IndeterminateComponent, FunctionalComponent$1 = ReactTypeOfWork.FunctionalComponent, ClassComponent$5 = ReactTypeOfWork.ClassComponent, HostRoot$4 = ReactTypeOfWork.HostRoot, HostComponent$5 = ReactTypeOfWork.HostComponent, HostText$2 = ReactTypeOfWork.HostText, HostPortal$3 = ReactTypeOfWork.HostPortal, CallComponent$1 = ReactTypeOfWork.CallComponent, CallHandlerPhase = ReactTypeOfWork.CallHandlerPhase, ReturnComponent$1 = ReactTypeOfWork.ReturnComponent, Fragment$1 = ReactTypeOfWork.Fragment, PerformedWork$1 = ReactTypeOfSideEffect.PerformedWork, Placement$2 = ReactTypeOfSideEffect.Placement, ContentReset$1 = ReactTypeOfSideEffect.ContentReset, Err$1 = ReactTypeOfSideEffect.Err, Ref$1 = ReactTypeOfSideEffect.Ref, ReactCurrentOwner$2 = ReactGlobalSharedState_1.ReactCurrentOwner, mountChildFibersInPlace = ReactChildFiber.mountChildFibersInPlace, reconcileChildFibers = ReactChildFiber.reconcileChildFibers, reconcileChildFibersInPlace = ReactChildFiber.reconcileChildFibersInPlace, cloneChildFibers = ReactChildFiber.cloneChildFibers, processUpdateQueue = ReactFiberUpdateQueue.processUpdateQueue, getMaskedContext$1 = ReactFiberContext.getMaskedContext, getUnmaskedContext$1 = ReactFiberContext.getUnmaskedContext, hasContextChanged$1 = ReactFiberContext.hasContextChanged, pushContextProvider$1 = ReactFiberContext.pushContextProvider, pushTopLevelContextObject$1 = ReactFiberContext.pushTopLevelContextObject, invalidateContextProvider$1 = ReactFiberContext.invalidateContextProvider, NoWork$4 = ReactFiberExpirationTime.NoWork, Never$2 = ReactFiberExpirationTime.Never, ReactFiberBeginWork = function(config, hostContext, hydrationContext, scheduleWork, computeExpirationForFiber) {
    var shouldSetTextContent = config.shouldSetTextContent, useSyncScheduling = config.useSyncScheduling, shouldDeprioritizeSubtree = config.shouldDeprioritizeSubtree, pushHostContext = hostContext.pushHostContext, pushHostContainer = hostContext.pushHostContainer, enterHydrationState = hydrationContext.enterHydrationState, resetHydrationState = hydrationContext.resetHydrationState, tryToClaimNextHydratableInstance = hydrationContext.tryToClaimNextHydratableInstance, _ReactFiberClassCompo = ReactFiberClassComponent(scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState), adoptClassInstance = _ReactFiberClassCompo.adoptClassInstance, constructClassInstance = _ReactFiberClassCompo.constructClassInstance, mountClassInstance = _ReactFiberClassCompo.mountClassInstance, updateClassInstance = _ReactFiberClassCompo.updateClassInstance;
    function reconcileChildren(current, workInProgress, nextChildren) {
        reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, workInProgress.expirationTime);
    }
    function reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, renderExpirationTime) {
        null === current ? workInProgress.child = mountChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime) : current.child === workInProgress.child ? workInProgress.child = reconcileChildFibers(workInProgress, workInProgress.child, nextChildren, renderExpirationTime) : workInProgress.child = reconcileChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime);
    }
    function updateFragment(current, workInProgress) {
        var nextChildren = workInProgress.pendingProps;
        if (hasContextChanged$1()) null === nextChildren && (nextChildren = workInProgress.memoizedProps); else if (null === nextChildren || workInProgress.memoizedProps === nextChildren) return bailoutOnAlreadyFinishedWork(current, workInProgress);
        return reconcileChildren(current, workInProgress, nextChildren), memoizeProps(workInProgress, nextChildren), 
        workInProgress.child;
    }
    function markRef(current, workInProgress) {
        var ref = workInProgress.ref;
        null === ref || current && current.ref === ref || (workInProgress.effectTag |= Ref$1);
    }
    function updateFunctionalComponent(current, workInProgress) {
        var fn = workInProgress.type, nextProps = workInProgress.pendingProps, memoizedProps = workInProgress.memoizedProps;
        if (hasContextChanged$1()) null === nextProps && (nextProps = memoizedProps); else if (null === nextProps || memoizedProps === nextProps) return bailoutOnAlreadyFinishedWork(current, workInProgress);
        var nextChildren, unmaskedContext = getUnmaskedContext$1(workInProgress), context = getMaskedContext$1(workInProgress, unmaskedContext);
        return nextChildren = fn(nextProps, context), workInProgress.effectTag |= PerformedWork$1, 
        reconcileChildren(current, workInProgress, nextChildren), memoizeProps(workInProgress, nextProps), 
        workInProgress.child;
    }
    function updateClassComponent(current, workInProgress, renderExpirationTime) {
        var hasContext = pushContextProvider$1(workInProgress), shouldUpdate = void 0;
        return null === current ? workInProgress.stateNode ? invariant(!1, "Resuming work not yet implemented.") : (constructClassInstance(workInProgress, workInProgress.pendingProps), 
        mountClassInstance(workInProgress, renderExpirationTime), shouldUpdate = !0) : shouldUpdate = updateClassInstance(current, workInProgress, renderExpirationTime), 
        finishClassComponent(current, workInProgress, shouldUpdate, hasContext);
    }
    function finishClassComponent(current, workInProgress, shouldUpdate, hasContext) {
        if (markRef(current, workInProgress), !shouldUpdate) return hasContext && invalidateContextProvider$1(workInProgress, !1), 
        bailoutOnAlreadyFinishedWork(current, workInProgress);
        var instance = workInProgress.stateNode;
        ReactCurrentOwner$2.current = workInProgress;
        var nextChildren = void 0;
        return nextChildren = instance.render(), workInProgress.effectTag |= PerformedWork$1, 
        reconcileChildren(current, workInProgress, nextChildren), memoizeState(workInProgress, instance.state), 
        memoizeProps(workInProgress, instance.props), hasContext && invalidateContextProvider$1(workInProgress, !0), 
        workInProgress.child;
    }
    function pushHostRootContext(workInProgress) {
        var root = workInProgress.stateNode;
        root.pendingContext ? pushTopLevelContextObject$1(workInProgress, root.pendingContext, root.pendingContext !== root.context) : root.context && pushTopLevelContextObject$1(workInProgress, root.context, !1), 
        pushHostContainer(workInProgress, root.containerInfo);
    }
    function updateHostRoot(current, workInProgress, renderExpirationTime) {
        pushHostRootContext(workInProgress);
        var updateQueue = workInProgress.updateQueue;
        if (null !== updateQueue) {
            var prevState = workInProgress.memoizedState, state = processUpdateQueue(current, workInProgress, updateQueue, null, null, renderExpirationTime);
            if (prevState === state) return resetHydrationState(), bailoutOnAlreadyFinishedWork(current, workInProgress);
            var element = state.element, root = workInProgress.stateNode;
            return (null === current || null === current.child) && root.hydrate && enterHydrationState(workInProgress) ? (workInProgress.effectTag |= Placement$2, 
            workInProgress.child = mountChildFibersInPlace(workInProgress, workInProgress.child, element, renderExpirationTime)) : (resetHydrationState(), 
            reconcileChildren(current, workInProgress, element)), memoizeState(workInProgress, state), 
            workInProgress.child;
        }
        return resetHydrationState(), bailoutOnAlreadyFinishedWork(current, workInProgress);
    }
    function updateHostComponent(current, workInProgress, renderExpirationTime) {
        pushHostContext(workInProgress), null === current && tryToClaimNextHydratableInstance(workInProgress);
        var type = workInProgress.type, memoizedProps = workInProgress.memoizedProps, nextProps = workInProgress.pendingProps;
        null === nextProps && (nextProps = memoizedProps, invariant(null !== nextProps, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue."));
        var prevProps = null !== current ? current.memoizedProps : null;
        if (hasContextChanged$1()) ; else if (null === nextProps || memoizedProps === nextProps) return bailoutOnAlreadyFinishedWork(current, workInProgress);
        var nextChildren = nextProps.children;
        return shouldSetTextContent(type, nextProps) ? nextChildren = null : prevProps && shouldSetTextContent(type, prevProps) && (workInProgress.effectTag |= ContentReset$1), 
        markRef(current, workInProgress), renderExpirationTime !== Never$2 && !useSyncScheduling && shouldDeprioritizeSubtree(type, nextProps) ? (workInProgress.expirationTime = Never$2, 
        null) : (reconcileChildren(current, workInProgress, nextChildren), memoizeProps(workInProgress, nextProps), 
        workInProgress.child);
    }
    function updateHostText(current, workInProgress) {
        null === current && tryToClaimNextHydratableInstance(workInProgress);
        var nextProps = workInProgress.pendingProps;
        return null === nextProps && (nextProps = workInProgress.memoizedProps), memoizeProps(workInProgress, nextProps), 
        null;
    }
    function mountIndeterminateComponent(current, workInProgress, renderExpirationTime) {
        invariant(null === current, "An indeterminate component should never have mounted. This error is " + "likely caused by a bug in React. Please file an issue.");
        var value, fn = workInProgress.type, props = workInProgress.pendingProps, unmaskedContext = getUnmaskedContext$1(workInProgress), context = getMaskedContext$1(workInProgress, unmaskedContext);
        if (value = fn(props, context), workInProgress.effectTag |= PerformedWork$1, "object" == typeof value && null !== value && "function" == typeof value.render) {
            workInProgress.tag = ClassComponent$5;
            var hasContext = pushContextProvider$1(workInProgress);
            return adoptClassInstance(workInProgress, value), mountClassInstance(workInProgress, renderExpirationTime), 
            finishClassComponent(current, workInProgress, !0, hasContext);
        }
        return workInProgress.tag = FunctionalComponent$1, reconcileChildren(current, workInProgress, value), 
        memoizeProps(workInProgress, props), workInProgress.child;
    }
    function updateCallComponent(current, workInProgress, renderExpirationTime) {
        var nextCall = workInProgress.pendingProps;
        hasContextChanged$1() ? null === nextCall && (nextCall = current && current.memoizedProps, 
        invariant(null !== nextCall, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue.")) : null !== nextCall && workInProgress.memoizedProps !== nextCall || (nextCall = workInProgress.memoizedProps);
        var nextChildren = nextCall.children;
        return null === current ? workInProgress.stateNode = mountChildFibersInPlace(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime) : current.child === workInProgress.child ? workInProgress.stateNode = reconcileChildFibers(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime) : workInProgress.stateNode = reconcileChildFibersInPlace(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime), 
        memoizeProps(workInProgress, nextCall), workInProgress.stateNode;
    }
    function updatePortalComponent(current, workInProgress, renderExpirationTime) {
        pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
        var nextChildren = workInProgress.pendingProps;
        if (hasContextChanged$1()) null === nextChildren && (nextChildren = current && current.memoizedProps, 
        invariant(null != nextChildren, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue.")); else if (null === nextChildren || workInProgress.memoizedProps === nextChildren) return bailoutOnAlreadyFinishedWork(current, workInProgress);
        return null === current ? (workInProgress.child = reconcileChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime), 
        memoizeProps(workInProgress, nextChildren)) : (reconcileChildren(current, workInProgress, nextChildren), 
        memoizeProps(workInProgress, nextChildren)), workInProgress.child;
    }
    function bailoutOnAlreadyFinishedWork(current, workInProgress) {
        return cloneChildFibers(current, workInProgress), workInProgress.child;
    }
    function bailoutOnLowPriority(current, workInProgress) {
        switch (workInProgress.tag) {
          case HostRoot$4:
            pushHostRootContext(workInProgress);
            break;

          case ClassComponent$5:
            pushContextProvider$1(workInProgress);
            break;

          case HostPortal$3:
            pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
        }
        return null;
    }
    function memoizeProps(workInProgress, nextProps) {
        workInProgress.memoizedProps = nextProps;
    }
    function memoizeState(workInProgress, nextState) {
        workInProgress.memoizedState = nextState;
    }
    function beginWork(current, workInProgress, renderExpirationTime) {
        if (workInProgress.expirationTime === NoWork$4 || workInProgress.expirationTime > renderExpirationTime) return bailoutOnLowPriority(current, workInProgress);
        switch (workInProgress.tag) {
          case IndeterminateComponent$2:
            return mountIndeterminateComponent(current, workInProgress, renderExpirationTime);

          case FunctionalComponent$1:
            return updateFunctionalComponent(current, workInProgress);

          case ClassComponent$5:
            return updateClassComponent(current, workInProgress, renderExpirationTime);

          case HostRoot$4:
            return updateHostRoot(current, workInProgress, renderExpirationTime);

          case HostComponent$5:
            return updateHostComponent(current, workInProgress, renderExpirationTime);

          case HostText$2:
            return updateHostText(current, workInProgress);

          case CallHandlerPhase:
            workInProgress.tag = CallComponent$1;

          case CallComponent$1:
            return updateCallComponent(current, workInProgress, renderExpirationTime);

          case ReturnComponent$1:
            return null;

          case HostPortal$3:
            return updatePortalComponent(current, workInProgress, renderExpirationTime);

          case Fragment$1:
            return updateFragment(current, workInProgress);

          default:
            invariant(!1, "Unknown unit of work tag. This error is likely caused by a bug in " + "React. Please file an issue.");
        }
    }
    function beginFailedWork(current, workInProgress, renderExpirationTime) {
        switch (workInProgress.tag) {
          case ClassComponent$5:
            pushContextProvider$1(workInProgress);
            break;

          case HostRoot$4:
            pushHostRootContext(workInProgress);
            break;

          default:
            invariant(!1, "Invalid type of work. This error is likely caused by a bug in React. " + "Please file an issue.");
        }
        if (workInProgress.effectTag |= Err$1, null === current ? workInProgress.child = null : workInProgress.child !== current.child && (workInProgress.child = current.child), 
        workInProgress.expirationTime === NoWork$4 || workInProgress.expirationTime > renderExpirationTime) return bailoutOnLowPriority(current, workInProgress);
        if (workInProgress.firstEffect = null, workInProgress.lastEffect = null, reconcileChildrenAtExpirationTime(current, workInProgress, null, renderExpirationTime), 
        workInProgress.tag === ClassComponent$5) {
            var instance = workInProgress.stateNode;
            workInProgress.memoizedProps = instance.props, workInProgress.memoizedState = instance.state;
        }
        return workInProgress.child;
    }
    return {
        beginWork: beginWork,
        beginFailedWork: beginFailedWork
    };
}, IndeterminateComponent$3 = ReactTypeOfWork.IndeterminateComponent, FunctionalComponent$3 = ReactTypeOfWork.FunctionalComponent, ClassComponent$8 = ReactTypeOfWork.ClassComponent, HostRoot$6 = ReactTypeOfWork.HostRoot, HostComponent$6 = ReactTypeOfWork.HostComponent, HostText$4 = ReactTypeOfWork.HostText, HostPortal$5 = ReactTypeOfWork.HostPortal, CallComponent$3 = ReactTypeOfWork.CallComponent, CallHandlerPhase$1 = ReactTypeOfWork.CallHandlerPhase, ReturnComponent$3 = ReactTypeOfWork.ReturnComponent, Fragment$3 = ReactTypeOfWork.Fragment, Placement$4 = ReactTypeOfSideEffect.Placement, Ref$2 = ReactTypeOfSideEffect.Ref, Update$2 = ReactTypeOfSideEffect.Update, reconcileChildFibers$2 = ReactChildFiber.reconcileChildFibers, popContextProvider$2 = ReactFiberContext.popContextProvider, popTopLevelContextObject$1 = ReactFiberContext.popTopLevelContextObject, Never$3 = ReactFiberExpirationTime.Never, ReactFiberCompleteWork = function(config, hostContext, hydrationContext) {
    var createInstance = config.createInstance, createTextInstance = config.createTextInstance, appendInitialChild = config.appendInitialChild, finalizeInitialChildren = config.finalizeInitialChildren, prepareUpdate = config.prepareUpdate, mutation = config.mutation, persistence = config.persistence, getRootHostContainer = hostContext.getRootHostContainer, popHostContext = hostContext.popHostContext, getHostContext = hostContext.getHostContext, popHostContainer = hostContext.popHostContainer, prepareToHydrateHostInstance = hydrationContext.prepareToHydrateHostInstance, prepareToHydrateHostTextInstance = hydrationContext.prepareToHydrateHostTextInstance, popHydrationState = hydrationContext.popHydrationState;
    function markUpdate(workInProgress) {
        workInProgress.effectTag |= Update$2;
    }
    function markRef(workInProgress) {
        workInProgress.effectTag |= Ref$2;
    }
    function appendAllReturns(returns, workInProgress) {
        var node = workInProgress.stateNode;
        for (node && (node.return = workInProgress); null !== node; ) {
            if (node.tag === HostComponent$6 || node.tag === HostText$4 || node.tag === HostPortal$5) invariant(!1, "A call cannot have host component children."); else if (node.tag === ReturnComponent$3) returns.push(node.type); else if (null !== node.child) {
                node.child.return = node, node = node.child;
                continue;
            }
            for (;null === node.sibling; ) {
                if (null === node.return || node.return === workInProgress) return;
                node = node.return;
            }
            node.sibling.return = node.return, node = node.sibling;
        }
    }
    function moveCallToHandlerPhase(current, workInProgress, renderExpirationTime) {
        var call = workInProgress.memoizedProps;
        invariant(call, "Should be resolved by now. This error is likely caused by a bug in " + "React. Please file an issue."), 
        workInProgress.tag = CallHandlerPhase$1;
        var returns = [];
        appendAllReturns(returns, workInProgress);
        var fn = call.handler, props = call.props, nextChildren = fn(props, returns), currentFirstChild = null !== current ? current.child : null;
        return workInProgress.child = reconcileChildFibers$2(workInProgress, currentFirstChild, nextChildren, renderExpirationTime), 
        workInProgress.child;
    }
    function appendAllChildren(parent, workInProgress) {
        for (var node = workInProgress.child; null !== node; ) {
            if (node.tag === HostComponent$6 || node.tag === HostText$4) appendInitialChild(parent, node.stateNode); else if (node.tag === HostPortal$5) ; else if (null !== node.child) {
                node.child.return = node, node = node.child;
                continue;
            }
            if (node === workInProgress) return;
            for (;null === node.sibling; ) {
                if (null === node.return || node.return === workInProgress) return;
                node = node.return;
            }
            node.sibling.return = node.return, node = node.sibling;
        }
    }
    var updateHostContainer = void 0, updateHostComponent = void 0, updateHostText = void 0;
    if (mutation) ReactNativeCSFeatureFlags_1.enableMutatingReconciler ? (updateHostContainer = function(workInProgress) {}, 
    updateHostComponent = function(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
        workInProgress.updateQueue = updatePayload, updatePayload && markUpdate(workInProgress);
    }, updateHostText = function(current, workInProgress, oldText, newText) {
        oldText !== newText && markUpdate(workInProgress);
    }) : invariant(!1, "Mutating reconciler is disabled."); else if (persistence) if (ReactNativeCSFeatureFlags_1.enablePersistentReconciler) {
        var cloneInstance = persistence.cloneInstance, createContainerChildSet = persistence.createContainerChildSet, appendChildToContainerChildSet = persistence.appendChildToContainerChildSet, finalizeContainerChildren = persistence.finalizeContainerChildren, appendAllChildrenToContainer = function(containerChildSet, workInProgress) {
            for (var node = workInProgress.child; null !== node; ) {
                if (node.tag === HostComponent$6 || node.tag === HostText$4) appendChildToContainerChildSet(containerChildSet, node.stateNode); else if (node.tag === HostPortal$5) ; else if (null !== node.child) {
                    node.child.return = node, node = node.child;
                    continue;
                }
                if (node === workInProgress) return;
                for (;null === node.sibling; ) {
                    if (null === node.return || node.return === workInProgress) return;
                    node = node.return;
                }
                node.sibling.return = node.return, node = node.sibling;
            }
        };
        updateHostContainer = function(workInProgress) {
            var portalOrRoot = workInProgress.stateNode;
            if (null === workInProgress.firstEffect) ; else {
                var container = portalOrRoot.containerInfo, newChildSet = createContainerChildSet(container);
                finalizeContainerChildren(container, newChildSet) && markUpdate(workInProgress), 
                portalOrRoot.pendingChildren = newChildSet, appendAllChildrenToContainer(newChildSet, workInProgress), 
                markUpdate(workInProgress);
            }
        }, updateHostComponent = function(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
            var childrenUnchanged = null === workInProgress.firstEffect, currentInstance = current.stateNode;
            if (childrenUnchanged && null === updatePayload) workInProgress.stateNode = currentInstance; else {
                var recyclableInstance = workInProgress.stateNode, newInstance = cloneInstance(currentInstance, updatePayload, type, oldProps, newProps, workInProgress, childrenUnchanged, recyclableInstance);
                finalizeInitialChildren(newInstance, type, newProps, rootContainerInstance) && markUpdate(workInProgress), 
                workInProgress.stateNode = newInstance, childrenUnchanged ? markUpdate(workInProgress) : appendAllChildren(newInstance, workInProgress);
            }
        }, updateHostText = function(current, workInProgress, oldText, newText) {
            if (oldText !== newText) {
                var rootContainerInstance = getRootHostContainer(), currentHostContext = getHostContext();
                workInProgress.stateNode = createTextInstance(newText, rootContainerInstance, currentHostContext, workInProgress), 
                markUpdate(workInProgress);
            }
        };
    } else invariant(!1, "Persistent reconciler is disabled."); else ReactNativeCSFeatureFlags_1.enableNoopReconciler ? (updateHostContainer = function(workInProgress) {}, 
    updateHostComponent = function(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {}, 
    updateHostText = function(current, workInProgress, oldText, newText) {}) : invariant(!1, "Noop reconciler is disabled.");
    function completeWork(current, workInProgress, renderExpirationTime) {
        var newProps = workInProgress.pendingProps;
        switch (null === newProps ? newProps = workInProgress.memoizedProps : workInProgress.expirationTime === Never$3 && renderExpirationTime !== Never$3 || (workInProgress.pendingProps = null), 
        workInProgress.tag) {
          case FunctionalComponent$3:
            return null;

          case ClassComponent$8:
            return popContextProvider$2(workInProgress), null;

          case HostRoot$6:
            popHostContainer(workInProgress), popTopLevelContextObject$1(workInProgress);
            var fiberRoot = workInProgress.stateNode;
            return fiberRoot.pendingContext && (fiberRoot.context = fiberRoot.pendingContext, 
            fiberRoot.pendingContext = null), null !== current && null !== current.child || (popHydrationState(workInProgress), 
            workInProgress.effectTag &= ~Placement$4), updateHostContainer(workInProgress), 
            null;

          case HostComponent$6:
            popHostContext(workInProgress);
            var rootContainerInstance = getRootHostContainer(), type = workInProgress.type;
            if (null !== current && null != workInProgress.stateNode) {
                var oldProps = current.memoizedProps, instance = workInProgress.stateNode, currentHostContext = getHostContext(), updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);
                updateHostComponent(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance), 
                current.ref !== workInProgress.ref && markRef(workInProgress);
            } else {
                if (!newProps) return invariant(null !== workInProgress.stateNode, "We must have new props for new mounts. This error is likely " + "caused by a bug in React. Please file an issue."), 
                null;
                var _currentHostContext = getHostContext();
                if (popHydrationState(workInProgress)) prepareToHydrateHostInstance(workInProgress, rootContainerInstance, _currentHostContext) && markUpdate(workInProgress); else {
                    var _instance = createInstance(type, newProps, rootContainerInstance, _currentHostContext, workInProgress);
                    appendAllChildren(_instance, workInProgress), finalizeInitialChildren(_instance, type, newProps, rootContainerInstance) && markUpdate(workInProgress), 
                    workInProgress.stateNode = _instance;
                }
                null !== workInProgress.ref && markRef(workInProgress);
            }
            return null;

          case HostText$4:
            var newText = newProps;
            if (current && null != workInProgress.stateNode) {
                var oldText = current.memoizedProps;
                updateHostText(current, workInProgress, oldText, newText);
            } else {
                if ("string" != typeof newText) return invariant(null !== workInProgress.stateNode, "We must have new props for new mounts. This error is likely " + "caused by a bug in React. Please file an issue."), 
                null;
                var _rootContainerInstance = getRootHostContainer(), _currentHostContext2 = getHostContext();
                popHydrationState(workInProgress) ? prepareToHydrateHostTextInstance(workInProgress) && markUpdate(workInProgress) : workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext2, workInProgress);
            }
            return null;

          case CallComponent$3:
            return moveCallToHandlerPhase(current, workInProgress, renderExpirationTime);

          case CallHandlerPhase$1:
            return workInProgress.tag = CallComponent$3, null;

          case ReturnComponent$3:
          case Fragment$3:
            return null;

          case HostPortal$5:
            return popHostContainer(workInProgress), updateHostContainer(workInProgress), null;

          case IndeterminateComponent$3:
            invariant(!1, "An indeterminate component should have become determinate before " + "completing. This error is likely caused by a bug in React. Please " + "file an issue.");

          default:
            invariant(!1, "Unknown unit of work tag. This error is likely caused by a bug in " + "React. Please file an issue.");
        }
    }
    return {
        completeWork: completeWork
    };
}, onCommitFiberRoot = null, onCommitFiberUnmount = null, hasLoggedError = !1;

function catchErrors(fn) {
    return function(arg) {
        try {
            return fn(arg);
        } catch (err) {
            1 || hasLoggedError || (hasLoggedError = !0);
        }
    };
}

function injectInternals$1(internals) {
    if ("undefined" == typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) return !1;
    var hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook.supportsFiber) return !0;
    try {
        var rendererID = hook.inject(internals);
        onCommitFiberRoot = catchErrors(function(root) {
            return hook.onCommitFiberRoot(rendererID, root);
        }), onCommitFiberUnmount = catchErrors(function(fiber) {
            return hook.onCommitFiberUnmount(rendererID, fiber);
        });
    } catch (err) {}
    return !0;
}

function onCommitRoot$1(root) {
    "function" == typeof onCommitFiberRoot && onCommitFiberRoot(root);
}

function onCommitUnmount$1(fiber) {
    "function" == typeof onCommitFiberUnmount && onCommitFiberUnmount(fiber);
}

var injectInternals_1 = injectInternals$1, onCommitRoot_1 = onCommitRoot$1, onCommitUnmount_1 = onCommitUnmount$1, ReactFiberDevToolsHook = {
    injectInternals: injectInternals_1,
    onCommitRoot: onCommitRoot_1,
    onCommitUnmount: onCommitUnmount_1
}, ClassComponent$9 = ReactTypeOfWork.ClassComponent, HostRoot$7 = ReactTypeOfWork.HostRoot, HostComponent$7 = ReactTypeOfWork.HostComponent, HostText$5 = ReactTypeOfWork.HostText, HostPortal$6 = ReactTypeOfWork.HostPortal, CallComponent$4 = ReactTypeOfWork.CallComponent, Placement$5 = ReactTypeOfSideEffect.Placement, Update$3 = ReactTypeOfSideEffect.Update, ContentReset$2 = ReactTypeOfSideEffect.ContentReset, commitCallbacks$1 = ReactFiberUpdateQueue.commitCallbacks, onCommitUnmount = ReactFiberDevToolsHook.onCommitUnmount, ReactFiberCommitWork = function(config, captureError) {
    var getPublicInstance = config.getPublicInstance, mutation = config.mutation, persistence = config.persistence;
    function safelyCallComponentWillUnmount(current, instance) {
        try {
            instance.props = current.memoizedProps, instance.state = current.memoizedState, 
            instance.componentWillUnmount();
        } catch (unmountError) {
            captureError(current, unmountError);
        }
    }
    function safelyDetachRef(current) {
        var ref = current.ref;
        if (null !== ref) {
            try {
                ref(null);
            } catch (refError) {
                captureError(current, refError);
            }
        }
    }
    function commitLifeCycles(current, finishedWork) {
        switch (finishedWork.tag) {
          case ClassComponent$9:
            var instance = finishedWork.stateNode;
            if (finishedWork.effectTag & Update$3) if (null === current) instance.props = finishedWork.memoizedProps, 
            instance.state = finishedWork.memoizedState, instance.componentDidMount(); else {
                var prevProps = current.memoizedProps, prevState = current.memoizedState;
                instance.props = finishedWork.memoizedProps, instance.state = finishedWork.memoizedState, 
                instance.componentDidUpdate(prevProps, prevState);
            }
            var updateQueue = finishedWork.updateQueue;
            return void (null !== updateQueue && commitCallbacks$1(updateQueue, instance));

          case HostRoot$7:
            var _updateQueue = finishedWork.updateQueue;
            if (null !== _updateQueue) {
                var _instance = null !== finishedWork.child ? finishedWork.child.stateNode : null;
                commitCallbacks$1(_updateQueue, _instance);
            }
            return;

          case HostComponent$7:
            var _instance2 = finishedWork.stateNode;
            if (null === current && finishedWork.effectTag & Update$3) {
                var type = finishedWork.type, props = finishedWork.memoizedProps;
                commitMount(_instance2, type, props, finishedWork);
            }
            return;

          case HostText$5:
          case HostPortal$6:
            return;

          default:
            invariant(!1, "This unit of work tag should not have side-effects. This error is " + "likely caused by a bug in React. Please file an issue.");
        }
    }
    function commitAttachRef(finishedWork) {
        var ref = finishedWork.ref;
        if (null !== ref) {
            var instance = finishedWork.stateNode;
            switch (finishedWork.tag) {
              case HostComponent$7:
                ref(getPublicInstance(instance));
                break;

              default:
                ref(instance);
            }
        }
    }
    function commitDetachRef(current) {
        var currentRef = current.ref;
        null !== currentRef && currentRef(null);
    }
    function commitUnmount(current) {
        switch ("function" == typeof onCommitUnmount && onCommitUnmount(current), current.tag) {
          case ClassComponent$9:
            safelyDetachRef(current);
            var instance = current.stateNode;
            return void ("function" == typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(current, instance));

          case HostComponent$7:
            return void safelyDetachRef(current);

          case CallComponent$4:
            return void commitNestedUnmounts(current.stateNode);

          case HostPortal$6:
            return void (ReactNativeCSFeatureFlags_1.enableMutatingReconciler && mutation ? unmountHostComponents(current) : ReactNativeCSFeatureFlags_1.enablePersistentReconciler && persistence && emptyPortalContainer(current));
        }
    }
    function commitNestedUnmounts(root) {
        for (var node = root; !0; ) if (commitUnmount(node), null === node.child || mutation && node.tag === HostPortal$6) {
            if (node === root) return;
            for (;null === node.sibling; ) {
                if (null === node.return || node.return === root) return;
                node = node.return;
            }
            node.sibling.return = node.return, node = node.sibling;
        } else node.child.return = node, node = node.child;
    }
    function detachFiber(current) {
        current.return = null, current.child = null, current.alternate && (current.alternate.child = null, 
        current.alternate.return = null);
    }
    if (!mutation) {
        var commitContainer = void 0;
        if (persistence) {
            var replaceContainerChildren = persistence.replaceContainerChildren, createContainerChildSet = persistence.createContainerChildSet, emptyPortalContainer = function(current) {
                var portal = current.stateNode, containerInfo = portal.containerInfo, emptyChildSet = createContainerChildSet(containerInfo);
                replaceContainerChildren(containerInfo, emptyChildSet);
            };
            commitContainer = function(finishedWork) {
                switch (finishedWork.tag) {
                  case ClassComponent$9:
                  case HostComponent$7:
                  case HostText$5:
                    return;

                  case HostRoot$7:
                  case HostPortal$6:
                    var portalOrRoot = finishedWork.stateNode, containerInfo = portalOrRoot.containerInfo, _pendingChildren = portalOrRoot.pendingChildren;
                    return void replaceContainerChildren(containerInfo, _pendingChildren);

                  default:
                    invariant(!1, "This unit of work tag should not have side-effects. This error is " + "likely caused by a bug in React. Please file an issue.");
                }
            };
        } else commitContainer = function(finishedWork) {};
        if (ReactNativeCSFeatureFlags_1.enablePersistentReconciler || ReactNativeCSFeatureFlags_1.enableNoopReconciler) return {
            commitResetTextContent: function(finishedWork) {},
            commitPlacement: function(finishedWork) {},
            commitDeletion: function(current) {
                commitNestedUnmounts(current), detachFiber(current);
            },
            commitWork: function(current, finishedWork) {
                commitContainer(finishedWork);
            },
            commitLifeCycles: commitLifeCycles,
            commitAttachRef: commitAttachRef,
            commitDetachRef: commitDetachRef
        };
        persistence ? invariant(!1, "Persistent reconciler is disabled.") : invariant(!1, "Noop reconciler is disabled.");
    }
    var commitMount = mutation.commitMount, commitUpdate = mutation.commitUpdate, resetTextContent = mutation.resetTextContent, commitTextUpdate = mutation.commitTextUpdate, appendChild = mutation.appendChild, appendChildToContainer = mutation.appendChildToContainer, insertBefore = mutation.insertBefore, insertInContainerBefore = mutation.insertInContainerBefore, removeChild = mutation.removeChild, removeChildFromContainer = mutation.removeChildFromContainer;
    function getHostParentFiber(fiber) {
        for (var parent = fiber.return; null !== parent; ) {
            if (isHostParent(parent)) return parent;
            parent = parent.return;
        }
        invariant(!1, "Expected to find a host parent. This error is likely caused by a bug " + "in React. Please file an issue.");
    }
    function isHostParent(fiber) {
        return fiber.tag === HostComponent$7 || fiber.tag === HostRoot$7 || fiber.tag === HostPortal$6;
    }
    function getHostSibling(fiber) {
        var node = fiber;
        siblings: for (;!0; ) {
            for (;null === node.sibling; ) {
                if (null === node.return || isHostParent(node.return)) return null;
                node = node.return;
            }
            for (node.sibling.return = node.return, node = node.sibling; node.tag !== HostComponent$7 && node.tag !== HostText$5; ) {
                if (node.effectTag & Placement$5) continue siblings;
                if (null === node.child || node.tag === HostPortal$6) continue siblings;
                node.child.return = node, node = node.child;
            }
            if (!(node.effectTag & Placement$5)) return node.stateNode;
        }
    }
    function commitPlacement(finishedWork) {
        var parentFiber = getHostParentFiber(finishedWork), parent = void 0, isContainer = void 0;
        switch (parentFiber.tag) {
          case HostComponent$7:
            parent = parentFiber.stateNode, isContainer = !1;
            break;

          case HostRoot$7:
          case HostPortal$6:
            parent = parentFiber.stateNode.containerInfo, isContainer = !0;
            break;

          default:
            invariant(!1, "Invalid host parent fiber. This error is likely caused by a bug " + "in React. Please file an issue.");
        }
        parentFiber.effectTag & ContentReset$2 && (resetTextContent(parent), parentFiber.effectTag &= ~ContentReset$2);
        for (var before = getHostSibling(finishedWork), node = finishedWork; !0; ) {
            if (node.tag === HostComponent$7 || node.tag === HostText$5) before ? isContainer ? insertInContainerBefore(parent, node.stateNode, before) : insertBefore(parent, node.stateNode, before) : isContainer ? appendChildToContainer(parent, node.stateNode) : appendChild(parent, node.stateNode); else if (node.tag === HostPortal$6) ; else if (null !== node.child) {
                node.child.return = node, node = node.child;
                continue;
            }
            if (node === finishedWork) return;
            for (;null === node.sibling; ) {
                if (null === node.return || node.return === finishedWork) return;
                node = node.return;
            }
            node.sibling.return = node.return, node = node.sibling;
        }
    }
    function unmountHostComponents(current) {
        for (var node = current, currentParentIsValid = !1, currentParent = void 0, currentParentIsContainer = void 0; !0; ) {
            if (!currentParentIsValid) {
                var parent = node.return;
                findParent: for (;!0; ) {
                    switch (invariant(null !== parent, "Expected to find a host parent. This error is likely caused by " + "a bug in React. Please file an issue."), 
                    parent.tag) {
                      case HostComponent$7:
                        currentParent = parent.stateNode, currentParentIsContainer = !1;
                        break findParent;

                      case HostRoot$7:
                      case HostPortal$6:
                        currentParent = parent.stateNode.containerInfo, currentParentIsContainer = !0;
                        break findParent;
                    }
                    parent = parent.return;
                }
                currentParentIsValid = !0;
            }
            if (node.tag === HostComponent$7 || node.tag === HostText$5) commitNestedUnmounts(node), 
            currentParentIsContainer ? removeChildFromContainer(currentParent, node.stateNode) : removeChild(currentParent, node.stateNode); else if (node.tag === HostPortal$6) {
                if (currentParent = node.stateNode.containerInfo, null !== node.child) {
                    node.child.return = node, node = node.child;
                    continue;
                }
            } else if (commitUnmount(node), null !== node.child) {
                node.child.return = node, node = node.child;
                continue;
            }
            if (node === current) return;
            for (;null === node.sibling; ) {
                if (null === node.return || node.return === current) return;
                node = node.return, node.tag === HostPortal$6 && (currentParentIsValid = !1);
            }
            node.sibling.return = node.return, node = node.sibling;
        }
    }
    function commitDeletion(current) {
        unmountHostComponents(current), detachFiber(current);
    }
    function commitWork(current, finishedWork) {
        switch (finishedWork.tag) {
          case ClassComponent$9:
            return;

          case HostComponent$7:
            var instance = finishedWork.stateNode;
            if (null != instance) {
                var newProps = finishedWork.memoizedProps, oldProps = null !== current ? current.memoizedProps : newProps, type = finishedWork.type, updatePayload = finishedWork.updateQueue;
                finishedWork.updateQueue = null, null !== updatePayload && commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork);
            }
            return;

          case HostText$5:
            invariant(null !== finishedWork.stateNode, "This should have a text node initialized. This error is likely " + "caused by a bug in React. Please file an issue.");
            var textInstance = finishedWork.stateNode, newText = finishedWork.memoizedProps, oldText = null !== current ? current.memoizedProps : newText;
            return void commitTextUpdate(textInstance, oldText, newText);

          case HostRoot$7:
            return;

          default:
            invariant(!1, "This unit of work tag should not have side-effects. This error is " + "likely caused by a bug in React. Please file an issue.");
        }
    }
    function commitResetTextContent(current) {
        resetTextContent(current.stateNode);
    }
    if (ReactNativeCSFeatureFlags_1.enableMutatingReconciler) return {
        commitResetTextContent: commitResetTextContent,
        commitPlacement: commitPlacement,
        commitDeletion: commitDeletion,
        commitWork: commitWork,
        commitLifeCycles: commitLifeCycles,
        commitAttachRef: commitAttachRef,
        commitDetachRef: commitDetachRef
    };
    invariant(!1, "Mutating reconciler is disabled.");
}, createCursor$2 = ReactFiberStack.createCursor, pop$2 = ReactFiberStack.pop, push$2 = ReactFiberStack.push, NO_CONTEXT = {}, ReactFiberHostContext = function(config) {
    var getChildHostContext = config.getChildHostContext, getRootHostContext = config.getRootHostContext, contextStackCursor = createCursor$2(NO_CONTEXT), contextFiberStackCursor = createCursor$2(NO_CONTEXT), rootInstanceStackCursor = createCursor$2(NO_CONTEXT);
    function requiredContext(c) {
        return invariant(c !== NO_CONTEXT, "Expected host context to exist. This error is likely caused by a bug " + "in React. Please file an issue."), 
        c;
    }
    function getRootHostContainer() {
        return requiredContext(rootInstanceStackCursor.current);
    }
    function pushHostContainer(fiber, nextRootInstance) {
        push$2(rootInstanceStackCursor, nextRootInstance, fiber);
        var nextRootContext = getRootHostContext(nextRootInstance);
        push$2(contextFiberStackCursor, fiber, fiber), push$2(contextStackCursor, nextRootContext, fiber);
    }
    function popHostContainer(fiber) {
        pop$2(contextStackCursor, fiber), pop$2(contextFiberStackCursor, fiber), pop$2(rootInstanceStackCursor, fiber);
    }
    function getHostContext() {
        return requiredContext(contextStackCursor.current);
    }
    function pushHostContext(fiber) {
        var rootInstance = requiredContext(rootInstanceStackCursor.current), context = requiredContext(contextStackCursor.current), nextContext = getChildHostContext(context, fiber.type, rootInstance);
        context !== nextContext && (push$2(contextFiberStackCursor, fiber, fiber), push$2(contextStackCursor, nextContext, fiber));
    }
    function popHostContext(fiber) {
        contextFiberStackCursor.current === fiber && (pop$2(contextStackCursor, fiber), 
        pop$2(contextFiberStackCursor, fiber));
    }
    function resetHostContainer() {
        contextStackCursor.current = NO_CONTEXT, rootInstanceStackCursor.current = NO_CONTEXT;
    }
    return {
        getHostContext: getHostContext,
        getRootHostContainer: getRootHostContainer,
        popHostContainer: popHostContainer,
        popHostContext: popHostContext,
        pushHostContainer: pushHostContainer,
        pushHostContext: pushHostContext,
        resetHostContainer: resetHostContainer
    };
}, HostComponent$8 = ReactTypeOfWork.HostComponent, HostText$6 = ReactTypeOfWork.HostText, HostRoot$8 = ReactTypeOfWork.HostRoot, Deletion$2 = ReactTypeOfSideEffect.Deletion, Placement$6 = ReactTypeOfSideEffect.Placement, createFiberFromHostInstanceForDeletion$1 = ReactFiber.createFiberFromHostInstanceForDeletion, ReactFiberHydrationContext = function(config) {
    var shouldSetTextContent = config.shouldSetTextContent, hydration = config.hydration;
    if (!hydration) return {
        enterHydrationState: function() {
            return !1;
        },
        resetHydrationState: function() {},
        tryToClaimNextHydratableInstance: function() {},
        prepareToHydrateHostInstance: function() {
            invariant(!1, "Expected prepareToHydrateHostInstance() to never be called. " + "This error is likely caused by a bug in React. Please file an issue.");
        },
        prepareToHydrateHostTextInstance: function() {
            invariant(!1, "Expected prepareToHydrateHostTextInstance() to never be called. " + "This error is likely caused by a bug in React. Please file an issue.");
        },
        popHydrationState: function(fiber) {
            return !1;
        }
    };
    var canHydrateInstance = hydration.canHydrateInstance, canHydrateTextInstance = hydration.canHydrateTextInstance, getNextHydratableSibling = hydration.getNextHydratableSibling, getFirstHydratableChild = hydration.getFirstHydratableChild, hydrateInstance = hydration.hydrateInstance, hydrateTextInstance = hydration.hydrateTextInstance, hydrationParentFiber = (hydration.didNotMatchHydratedContainerTextInstance, 
    hydration.didNotMatchHydratedTextInstance, hydration.didNotHydrateContainerInstance, 
    hydration.didNotHydrateInstance, hydration.didNotFindHydratableContainerInstance, 
    hydration.didNotFindHydratableContainerTextInstance, hydration.didNotFindHydratableInstance, 
    hydration.didNotFindHydratableTextInstance, null), nextHydratableInstance = null, isHydrating = !1;
    function enterHydrationState(fiber) {
        var parentInstance = fiber.stateNode.containerInfo;
        return nextHydratableInstance = getFirstHydratableChild(parentInstance), hydrationParentFiber = fiber, 
        isHydrating = !0, !0;
    }
    function deleteHydratableInstance(returnFiber, instance) {
        var childToDelete = createFiberFromHostInstanceForDeletion$1();
        childToDelete.stateNode = instance, childToDelete.return = returnFiber, childToDelete.effectTag = Deletion$2, 
        null !== returnFiber.lastEffect ? (returnFiber.lastEffect.nextEffect = childToDelete, 
        returnFiber.lastEffect = childToDelete) : returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
    function insertNonHydratedInstance(returnFiber, fiber) {
        fiber.effectTag |= Placement$6;
    }
    function canHydrate(fiber, nextInstance) {
        switch (fiber.tag) {
          case HostComponent$8:
            var type = fiber.type, props = fiber.pendingProps;
            return canHydrateInstance(nextInstance, type, props);

          case HostText$6:
            var text = fiber.pendingProps;
            return canHydrateTextInstance(nextInstance, text);

          default:
            return !1;
        }
    }
    function tryToClaimNextHydratableInstance(fiber) {
        if (isHydrating) {
            var nextInstance = nextHydratableInstance;
            if (!nextInstance) return insertNonHydratedInstance(hydrationParentFiber, fiber), 
            isHydrating = !1, void (hydrationParentFiber = fiber);
            if (!canHydrate(fiber, nextInstance)) {
                if (!(nextInstance = getNextHydratableSibling(nextInstance)) || !canHydrate(fiber, nextInstance)) return insertNonHydratedInstance(hydrationParentFiber, fiber), 
                isHydrating = !1, void (hydrationParentFiber = fiber);
                deleteHydratableInstance(hydrationParentFiber, nextHydratableInstance);
            }
            fiber.stateNode = nextInstance, hydrationParentFiber = fiber, nextHydratableInstance = getFirstHydratableChild(nextInstance);
        }
    }
    function prepareToHydrateHostInstance(fiber, rootContainerInstance, hostContext) {
        var instance = fiber.stateNode, updatePayload = hydrateInstance(instance, fiber.type, fiber.memoizedProps, rootContainerInstance, hostContext, fiber);
        return fiber.updateQueue = updatePayload, null !== updatePayload;
    }
    function prepareToHydrateHostTextInstance(fiber) {
        var textInstance = fiber.stateNode, textContent = fiber.memoizedProps;
        return hydrateTextInstance(textInstance, textContent, fiber);
    }
    function popToNextHostParent(fiber) {
        for (var parent = fiber.return; null !== parent && parent.tag !== HostComponent$8 && parent.tag !== HostRoot$8; ) parent = parent.return;
        hydrationParentFiber = parent;
    }
    function popHydrationState(fiber) {
        if (fiber !== hydrationParentFiber) return !1;
        if (!isHydrating) return popToNextHostParent(fiber), isHydrating = !0, !1;
        var type = fiber.type;
        if (fiber.tag !== HostComponent$8 || "head" !== type && "body" !== type && !shouldSetTextContent(type, fiber.memoizedProps)) for (var nextInstance = nextHydratableInstance; nextInstance; ) deleteHydratableInstance(fiber, nextInstance), 
        nextInstance = getNextHydratableSibling(nextInstance);
        return popToNextHostParent(fiber), nextHydratableInstance = hydrationParentFiber ? getNextHydratableSibling(fiber.stateNode) : null, 
        !0;
    }
    function resetHydrationState() {
        hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = !1;
    }
    return {
        enterHydrationState: enterHydrationState,
        resetHydrationState: resetHydrationState,
        tryToClaimNextHydratableInstance: tryToClaimNextHydratableInstance,
        prepareToHydrateHostInstance: prepareToHydrateHostInstance,
        prepareToHydrateHostTextInstance: prepareToHydrateHostTextInstance,
        popHydrationState: popHydrationState
    };
}, defaultShowDialog = function(capturedError) {
    return !0;
}, showDialog = defaultShowDialog;

function logCapturedError$1(capturedError) {
    if (!1 !== showDialog(capturedError)) {
        var error = capturedError.error;
        console.error(error);
    }
}

var injection = {
    injectDialog: function(fn) {
        invariant(showDialog === defaultShowDialog, "The custom dialog was already injected."), 
        invariant("function" == typeof fn, "Injected showDialog() must be a function."), 
        showDialog = fn;
    }
}, logCapturedError_1 = logCapturedError$1, ReactFiberErrorLogger = {
    injection: injection,
    logCapturedError: logCapturedError_1
}, getStackAddendumByWorkInProgressFiber = ReactFiberComponentTreeHook.getStackAddendumByWorkInProgressFiber, ReactCurrentOwner$1 = ReactGlobalSharedState_1.ReactCurrentOwner, PerformedWork = ReactTypeOfSideEffect.PerformedWork, Placement$1 = ReactTypeOfSideEffect.Placement, Update = ReactTypeOfSideEffect.Update, PlacementAndUpdate = ReactTypeOfSideEffect.PlacementAndUpdate, Deletion = ReactTypeOfSideEffect.Deletion, ContentReset = ReactTypeOfSideEffect.ContentReset, Callback = ReactTypeOfSideEffect.Callback, Err = ReactTypeOfSideEffect.Err, Ref = ReactTypeOfSideEffect.Ref, HostRoot$3 = ReactTypeOfWork.HostRoot, HostComponent$3 = ReactTypeOfWork.HostComponent, HostPortal$2 = ReactTypeOfWork.HostPortal, ClassComponent$3 = ReactTypeOfWork.ClassComponent, popContextProvider$1 = ReactFiberContext.popContextProvider, reset$1 = ReactFiberStack.reset, logCapturedError = ReactFiberErrorLogger.logCapturedError, createWorkInProgress$1 = ReactFiber.createWorkInProgress, onCommitRoot = ReactFiberDevToolsHook.onCommitRoot, NoWork$3 = ReactFiberExpirationTime.NoWork, Sync$1 = ReactFiberExpirationTime.Sync, Never$1 = ReactFiberExpirationTime.Never, msToExpirationTime$1 = ReactFiberExpirationTime.msToExpirationTime, computeExpirationBucket$1 = ReactFiberExpirationTime.computeExpirationBucket, AsyncUpdates = ReactTypeOfInternalContext.AsyncUpdates, getUpdateExpirationTime = ReactFiberUpdateQueue.getUpdateExpirationTime, _require14 = ReactFiberContext, resetContext$1 = _require14.resetContext, ReactFiberInstrumentation$1, ReactFiberScheduler = function(config) {
    var hostContext = ReactFiberHostContext(config), hydrationContext = ReactFiberHydrationContext(config), popHostContainer = hostContext.popHostContainer, popHostContext = hostContext.popHostContext, resetHostContainer = hostContext.resetHostContainer, _ReactFiberBeginWork = ReactFiberBeginWork(config, hostContext, hydrationContext, scheduleWork, computeExpirationForFiber), beginWork = _ReactFiberBeginWork.beginWork, beginFailedWork = _ReactFiberBeginWork.beginFailedWork, _ReactFiberCompleteWo = ReactFiberCompleteWork(config, hostContext, hydrationContext), completeWork = _ReactFiberCompleteWo.completeWork, _ReactFiberCommitWork = ReactFiberCommitWork(config, captureError), commitResetTextContent = _ReactFiberCommitWork.commitResetTextContent, commitPlacement = _ReactFiberCommitWork.commitPlacement, commitDeletion = _ReactFiberCommitWork.commitDeletion, commitWork = _ReactFiberCommitWork.commitWork, commitLifeCycles = _ReactFiberCommitWork.commitLifeCycles, commitAttachRef = _ReactFiberCommitWork.commitAttachRef, commitDetachRef = _ReactFiberCommitWork.commitDetachRef, now = config.now, scheduleDeferredCallback = config.scheduleDeferredCallback, useSyncScheduling = config.useSyncScheduling, prepareForCommit = config.prepareForCommit, resetAfterCommit = config.resetAfterCommit, startTime = now(), mostRecentCurrentTime = msToExpirationTime$1(0), expirationContext = NoWork$3, isWorking = !1, nextUnitOfWork = null, nextRoot = null, nextRenderExpirationTime = NoWork$3, nextEffect = null, capturedErrors = null, failedBoundaries = null, commitPhaseBoundaries = null, firstUncaughtError = null, didFatal = !1, isCommitting = !1, isUnmounting = !1;
    function resetContextStack() {
        reset$1(), resetContext$1(), resetHostContainer();
    }
    function commitAllHostEffects() {
        for (;null !== nextEffect; ) {
            var effectTag = nextEffect.effectTag;
            if (effectTag & ContentReset && commitResetTextContent(nextEffect), effectTag & Ref) {
                var current = nextEffect.alternate;
                null !== current && commitDetachRef(current);
            }
            switch (effectTag & ~(Callback | Err | ContentReset | Ref | PerformedWork)) {
              case Placement$1:
                commitPlacement(nextEffect), nextEffect.effectTag &= ~Placement$1;
                break;

              case PlacementAndUpdate:
                commitPlacement(nextEffect), nextEffect.effectTag &= ~Placement$1;
                var _current = nextEffect.alternate;
                commitWork(_current, nextEffect);
                break;

              case Update:
                var _current2 = nextEffect.alternate;
                commitWork(_current2, nextEffect);
                break;

              case Deletion:
                isUnmounting = !0, commitDeletion(nextEffect), isUnmounting = !1;
            }
            nextEffect = nextEffect.nextEffect;
        }
    }
    function commitAllLifeCycles() {
        for (;null !== nextEffect; ) {
            var effectTag = nextEffect.effectTag;
            if (effectTag & (Update | Callback)) {
                var current = nextEffect.alternate;
                commitLifeCycles(current, nextEffect);
            }
            effectTag & Ref && commitAttachRef(nextEffect), effectTag & Err && commitErrorHandling(nextEffect);
            var next = nextEffect.nextEffect;
            nextEffect.nextEffect = null, nextEffect = next;
        }
    }
    function commitRoot(finishedWork) {
        isWorking = !0, isCommitting = !0;
        var root = finishedWork.stateNode;
        invariant(root.current !== finishedWork, "Cannot commit the same tree as before. This is probably a bug " + "related to the return field. This error is likely caused by a bug " + "in React. Please file an issue."), 
        root.isReadyForCommit = !1, ReactCurrentOwner$1.current = null;
        var firstEffect = void 0;
        for (finishedWork.effectTag > PerformedWork ? null !== finishedWork.lastEffect ? (finishedWork.lastEffect.nextEffect = finishedWork, 
        firstEffect = finishedWork.firstEffect) : firstEffect = finishedWork : firstEffect = finishedWork.firstEffect, 
        prepareForCommit(), nextEffect = firstEffect; null !== nextEffect; ) {
            var didError = !1, _error = void 0;
            try {
                commitAllHostEffects();
            } catch (e) {
                didError = !0, _error = e;
            }
            didError && (invariant(null !== nextEffect, "Should have next effect. This error is likely caused by a bug " + "in React. Please file an issue."), 
            captureError(nextEffect, _error), null !== nextEffect && (nextEffect = nextEffect.nextEffect));
        }
        for (resetAfterCommit(), root.current = finishedWork, nextEffect = firstEffect; null !== nextEffect; ) {
            var _didError = !1, _error2 = void 0;
            try {
                commitAllLifeCycles();
            } catch (e) {
                _didError = !0, _error2 = e;
            }
            _didError && (invariant(null !== nextEffect, "Should have next effect. This error is likely caused by a bug " + "in React. Please file an issue."), 
            captureError(nextEffect, _error2), null !== nextEffect && (nextEffect = nextEffect.nextEffect));
        }
        if (isCommitting = !1, isWorking = !1, "function" == typeof onCommitRoot && onCommitRoot(finishedWork.stateNode), 
        !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onCommitWork(finishedWork), 
        commitPhaseBoundaries && (commitPhaseBoundaries.forEach(scheduleErrorRecovery), 
        commitPhaseBoundaries = null), null !== firstUncaughtError) {
            var _error3 = firstUncaughtError;
            firstUncaughtError = null, onUncaughtError(_error3);
        }
        var remainingTime = root.current.expirationTime;
        return remainingTime === NoWork$3 && (capturedErrors = null, failedBoundaries = null), 
        remainingTime;
    }
    function resetExpirationTime(workInProgress, renderTime) {
        if (renderTime === Never$1 || workInProgress.expirationTime !== Never$1) {
            for (var newExpirationTime = getUpdateExpirationTime(workInProgress), child = workInProgress.child; null !== child; ) child.expirationTime !== NoWork$3 && (newExpirationTime === NoWork$3 || newExpirationTime > child.expirationTime) && (newExpirationTime = child.expirationTime), 
            child = child.sibling;
            workInProgress.expirationTime = newExpirationTime;
        }
    }
    function completeUnitOfWork(workInProgress) {
        for (;!0; ) {
            var current = workInProgress.alternate, next = completeWork(current, workInProgress, nextRenderExpirationTime), returnFiber = workInProgress.return, siblingFiber = workInProgress.sibling;
            if (resetExpirationTime(workInProgress, nextRenderExpirationTime), null !== next) return !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onCompleteWork(workInProgress), 
            next;
            if (null !== returnFiber) {
                null === returnFiber.firstEffect && (returnFiber.firstEffect = workInProgress.firstEffect), 
                null !== workInProgress.lastEffect && (null !== returnFiber.lastEffect && (returnFiber.lastEffect.nextEffect = workInProgress.firstEffect), 
                returnFiber.lastEffect = workInProgress.lastEffect);
                workInProgress.effectTag > PerformedWork && (null !== returnFiber.lastEffect ? returnFiber.lastEffect.nextEffect = workInProgress : returnFiber.firstEffect = workInProgress, 
                returnFiber.lastEffect = workInProgress);
            }
            if (!1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onCompleteWork(workInProgress), 
            null !== siblingFiber) return siblingFiber;
            if (null === returnFiber) {
                return workInProgress.stateNode.isReadyForCommit = !0, null;
            }
            workInProgress = returnFiber;
        }
        return null;
    }
    function performUnitOfWork(workInProgress) {
        var current = workInProgress.alternate, next = beginWork(current, workInProgress, nextRenderExpirationTime);
        return !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onBeginWork(workInProgress), 
        null === next && (next = completeUnitOfWork(workInProgress)), ReactCurrentOwner$1.current = null, 
        next;
    }
    function performFailedUnitOfWork(workInProgress) {
        var current = workInProgress.alternate, next = beginFailedWork(current, workInProgress, nextRenderExpirationTime);
        return !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onBeginWork(workInProgress), 
        null === next && (next = completeUnitOfWork(workInProgress)), ReactCurrentOwner$1.current = null, 
        next;
    }
    function workLoop(expirationTime) {
        if (null !== capturedErrors) return void slowWorkLoopThatChecksForFailedWork(expirationTime);
        if (!(nextRenderExpirationTime === NoWork$3 || nextRenderExpirationTime > expirationTime)) if (nextRenderExpirationTime <= mostRecentCurrentTime) for (;null !== nextUnitOfWork; ) nextUnitOfWork = performUnitOfWork(nextUnitOfWork); else for (;null !== nextUnitOfWork && !shouldYield(); ) nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
    function slowWorkLoopThatChecksForFailedWork(expirationTime) {
        if (!(nextRenderExpirationTime === NoWork$3 || nextRenderExpirationTime > expirationTime)) if (nextRenderExpirationTime <= mostRecentCurrentTime) for (;null !== nextUnitOfWork; ) nextUnitOfWork = hasCapturedError(nextUnitOfWork) ? performFailedUnitOfWork(nextUnitOfWork) : performUnitOfWork(nextUnitOfWork); else for (;null !== nextUnitOfWork && !shouldYield(); ) nextUnitOfWork = hasCapturedError(nextUnitOfWork) ? performFailedUnitOfWork(nextUnitOfWork) : performUnitOfWork(nextUnitOfWork);
    }
    function renderRootCatchBlock(root, failedWork, boundary, expirationTime) {
        unwindContexts(failedWork, boundary), nextUnitOfWork = performFailedUnitOfWork(boundary), 
        workLoop(expirationTime);
    }
    function renderRoot(root, expirationTime) {
        invariant(!isWorking, "renderRoot was called recursively. This error is likely caused " + "by a bug in React. Please file an issue."), 
        isWorking = !0, root.isReadyForCommit = !1, root === nextRoot && expirationTime === nextRenderExpirationTime && null !== nextUnitOfWork || (resetContextStack(), 
        nextRoot = root, nextRenderExpirationTime = expirationTime, nextUnitOfWork = createWorkInProgress$1(nextRoot.current, expirationTime));
        var didError = !1, error = null;
        try {
            workLoop(expirationTime);
        } catch (e) {
            didError = !0, error = e;
        }
        for (;didError; ) {
            if (didFatal) {
                firstUncaughtError = error;
                break;
            }
            var failedWork = nextUnitOfWork;
            if (null !== failedWork) {
                var boundary = captureError(failedWork, error);
                if (invariant(null !== boundary, "Should have found an error boundary. This error is likely " + "caused by a bug in React. Please file an issue."), 
                !didFatal) {
                    didError = !1, error = null;
                    try {
                        renderRootCatchBlock(root, failedWork, boundary, expirationTime), error = null;
                    } catch (e) {
                        didError = !0, error = e;
                        continue;
                    }
                    break;
                }
            } else didFatal = !0;
        }
        var uncaughtError = firstUncaughtError;
        return isWorking = !1, didFatal = !1, firstUncaughtError = null, null !== uncaughtError && onUncaughtError(uncaughtError), 
        root.isReadyForCommit ? root.current.alternate : null;
    }
    function captureError(failedWork, error) {
        ReactCurrentOwner$1.current = null;
        var boundary = null, errorBoundaryFound = !1, willRetry = !1, errorBoundaryName = null;
        if (failedWork.tag === HostRoot$3) boundary = failedWork, isFailedBoundary(failedWork) && (didFatal = !0); else for (var node = failedWork.return; null !== node && null === boundary; ) {
            if (node.tag === ClassComponent$3) {
                var instance = node.stateNode;
                "function" == typeof instance.componentDidCatch && (errorBoundaryFound = !0, errorBoundaryName = getComponentName_1(node), 
                boundary = node, willRetry = !0);
            } else node.tag === HostRoot$3 && (boundary = node);
            if (isFailedBoundary(node)) {
                if (isUnmounting) return null;
                if (null !== commitPhaseBoundaries && (commitPhaseBoundaries.has(node) || null !== node.alternate && commitPhaseBoundaries.has(node.alternate))) return null;
                boundary = null, willRetry = !1;
            }
            node = node.return;
        }
        if (null !== boundary) {
            null === failedBoundaries && (failedBoundaries = new Set()), failedBoundaries.add(boundary);
            var _componentStack = getStackAddendumByWorkInProgressFiber(failedWork), _componentName = getComponentName_1(failedWork);
            null === capturedErrors && (capturedErrors = new Map());
            var capturedError = {
                componentName: _componentName,
                componentStack: _componentStack,
                error: error,
                errorBoundary: errorBoundaryFound ? boundary.stateNode : null,
                errorBoundaryFound: errorBoundaryFound,
                errorBoundaryName: errorBoundaryName,
                willRetry: willRetry
            };
            capturedErrors.set(boundary, capturedError);
            try {
                logCapturedError(capturedError);
            } catch (e) {
                console.error(e);
            }
            return isCommitting ? (null === commitPhaseBoundaries && (commitPhaseBoundaries = new Set()), 
            commitPhaseBoundaries.add(boundary)) : scheduleErrorRecovery(boundary), boundary;
        }
        return null === firstUncaughtError && (firstUncaughtError = error), null;
    }
    function hasCapturedError(fiber) {
        return null !== capturedErrors && (capturedErrors.has(fiber) || null !== fiber.alternate && capturedErrors.has(fiber.alternate));
    }
    function isFailedBoundary(fiber) {
        return null !== failedBoundaries && (failedBoundaries.has(fiber) || null !== fiber.alternate && failedBoundaries.has(fiber.alternate));
    }
    function commitErrorHandling(effectfulFiber) {
        var capturedError = void 0;
        switch (null !== capturedErrors && (capturedError = capturedErrors.get(effectfulFiber), 
        capturedErrors.delete(effectfulFiber), null == capturedError && null !== effectfulFiber.alternate && (effectfulFiber = effectfulFiber.alternate, 
        capturedError = capturedErrors.get(effectfulFiber), capturedErrors.delete(effectfulFiber))), 
        invariant(null != capturedError, "No error for given unit of work. This error is likely caused by a " + "bug in React. Please file an issue."), 
        effectfulFiber.tag) {
          case ClassComponent$3:
            var instance = effectfulFiber.stateNode, info = {
                componentStack: capturedError.componentStack
            };
            return void instance.componentDidCatch(capturedError.error, info);

          case HostRoot$3:
            return void (null === firstUncaughtError && (firstUncaughtError = capturedError.error));

          default:
            invariant(!1, "Invalid type of work. This error is likely caused by a bug in " + "React. Please file an issue.");
        }
    }
    function unwindContexts(from, to) {
        for (var node = from; null !== node; ) {
            switch (node.tag) {
              case ClassComponent$3:
                popContextProvider$1(node);
                break;

              case HostComponent$3:
                popHostContext(node);
                break;

              case HostRoot$3:
              case HostPortal$2:
                popHostContainer(node);
            }
            if (node === to || node.alternate === to) break;
            node = node.return;
        }
    }
    function computeAsyncExpiration() {
        var currentTime = recalculateCurrentTime();
        return computeExpirationBucket$1(currentTime, 1e3, 200);
    }
    function computeExpirationForFiber(fiber) {
        return expirationContext !== NoWork$3 ? expirationContext : isWorking ? isCommitting ? Sync$1 : nextRenderExpirationTime : !useSyncScheduling || fiber.internalContextTag & AsyncUpdates ? computeAsyncExpiration() : Sync$1;
    }
    function scheduleWork(fiber, expirationTime) {
        return scheduleWorkImpl(fiber, expirationTime, !1);
    }
    function scheduleWorkImpl(fiber, expirationTime, isErrorRecovery) {
        for (var node = fiber; null !== node; ) {
            if ((node.expirationTime === NoWork$3 || node.expirationTime > expirationTime) && (node.expirationTime = expirationTime), 
            null !== node.alternate && (node.alternate.expirationTime === NoWork$3 || node.alternate.expirationTime > expirationTime) && (node.alternate.expirationTime = expirationTime), 
            null === node.return) {
                if (node.tag !== HostRoot$3) return;
                var root = node.stateNode;
                !isWorking && root === nextRoot && expirationTime <= nextRenderExpirationTime && (nextRoot = null, 
                nextUnitOfWork = null, nextRenderExpirationTime = NoWork$3), requestWork(root, expirationTime);
            }
            node = node.return;
        }
    }
    function scheduleErrorRecovery(fiber) {
        scheduleWorkImpl(fiber, Sync$1, !0);
    }
    function recalculateCurrentTime() {
        var ms = now() - startTime;
        return mostRecentCurrentTime = msToExpirationTime$1(ms);
    }
    function deferredUpdates(fn) {
        var previousExpirationContext = expirationContext;
        expirationContext = computeAsyncExpiration();
        try {
            return fn();
        } finally {
            expirationContext = previousExpirationContext;
        }
    }
    function syncUpdates(fn) {
        var previousExpirationContext = expirationContext;
        expirationContext = Sync$1;
        try {
            return fn();
        } finally {
            expirationContext = previousExpirationContext;
        }
    }
    var firstScheduledRoot = null, lastScheduledRoot = null, isCallbackScheduled = !1, isRendering = !1, nextFlushedRoot = null, nextFlushedExpirationTime = NoWork$3, deadlineDidExpire = !1, hasUnhandledError = !1, unhandledError = null, deadline = null, isBatchingUpdates = !1, isUnbatchingUpdates = !1, nestedUpdateCount = 0, timeHeuristicForUnitOfWork = 1;
    function requestWork(root, expirationTime) {
        if (nestedUpdateCount > 1e3 && invariant(!1, "Maximum update depth exceeded. This can happen when a " + "component repeatedly calls setState inside componentWillUpdate or " + "componentDidUpdate. React limits the number of nested updates to " + "prevent infinite loops."), 
        null === root.nextScheduledRoot) root.remainingExpirationTime = expirationTime, 
        null === lastScheduledRoot ? (firstScheduledRoot = lastScheduledRoot = root, root.nextScheduledRoot = root) : (lastScheduledRoot.nextScheduledRoot = root, 
        lastScheduledRoot = root, lastScheduledRoot.nextScheduledRoot = firstScheduledRoot); else {
            var remainingExpirationTime = root.remainingExpirationTime;
            (remainingExpirationTime === NoWork$3 || expirationTime < remainingExpirationTime) && (root.remainingExpirationTime = expirationTime);
        }
        if (!isRendering) return isBatchingUpdates ? void (isUnbatchingUpdates && performWorkOnRoot(root, Sync$1)) : void (expirationTime === Sync$1 ? performWork(Sync$1, null) : isCallbackScheduled || (isCallbackScheduled = !0, 
        scheduleDeferredCallback(performAsyncWork)));
    }
    function findHighestPriorityRoot() {
        var highestPriorityWork = NoWork$3, highestPriorityRoot = null;
        if (null !== lastScheduledRoot) for (var previousScheduledRoot = lastScheduledRoot, root = firstScheduledRoot; null !== root; ) {
            var remainingExpirationTime = root.remainingExpirationTime;
            if (remainingExpirationTime === NoWork$3) {
                if (invariant(null !== previousScheduledRoot && null !== lastScheduledRoot, "Should have a previous and last root. This error is likely " + "caused by a bug in React. Please file an issue."), 
                root === root.nextScheduledRoot) {
                    root.nextScheduledRoot = null, firstScheduledRoot = lastScheduledRoot = null;
                    break;
                }
                if (root === firstScheduledRoot) {
                    var next = root.nextScheduledRoot;
                    firstScheduledRoot = next, lastScheduledRoot.nextScheduledRoot = next, root.nextScheduledRoot = null;
                } else {
                    if (root === lastScheduledRoot) {
                        lastScheduledRoot = previousScheduledRoot, lastScheduledRoot.nextScheduledRoot = firstScheduledRoot, 
                        root.nextScheduledRoot = null;
                        break;
                    }
                    previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot, root.nextScheduledRoot = null;
                }
                root = previousScheduledRoot.nextScheduledRoot;
            } else {
                if ((highestPriorityWork === NoWork$3 || remainingExpirationTime < highestPriorityWork) && (highestPriorityWork = remainingExpirationTime, 
                highestPriorityRoot = root), root === lastScheduledRoot) break;
                previousScheduledRoot = root, root = root.nextScheduledRoot;
            }
        }
        var previousFlushedRoot = nextFlushedRoot;
        null !== previousFlushedRoot && previousFlushedRoot === highestPriorityRoot ? nestedUpdateCount++ : nestedUpdateCount = 0, 
        nextFlushedRoot = highestPriorityRoot, nextFlushedExpirationTime = highestPriorityWork;
    }
    function performAsyncWork(dl) {
        performWork(NoWork$3, dl);
    }
    function performWork(minExpirationTime, dl) {
        for (deadline = dl, findHighestPriorityRoot(); null !== nextFlushedRoot && nextFlushedExpirationTime !== NoWork$3 && (minExpirationTime === NoWork$3 || nextFlushedExpirationTime <= minExpirationTime) && !deadlineDidExpire; ) performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime), 
        findHighestPriorityRoot();
        if (null !== deadline && (isCallbackScheduled = !1), null === nextFlushedRoot || isCallbackScheduled || (isCallbackScheduled = !0, 
        scheduleDeferredCallback(performAsyncWork)), deadline = null, deadlineDidExpire = !1, 
        nestedUpdateCount = 0, hasUnhandledError) {
            var _error4 = unhandledError;
            throw unhandledError = null, hasUnhandledError = !1, _error4;
        }
    }
    function performWorkOnRoot(root, expirationTime) {
        if (invariant(!isRendering, "performWorkOnRoot was called recursively. This error is likely caused " + "by a bug in React. Please file an issue."), 
        isRendering = !0, expirationTime <= recalculateCurrentTime()) {
            var finishedWork = root.finishedWork;
            null !== finishedWork ? (root.finishedWork = null, root.remainingExpirationTime = commitRoot(finishedWork)) : (root.finishedWork = null, 
            null !== (finishedWork = renderRoot(root, expirationTime)) && (root.remainingExpirationTime = commitRoot(finishedWork)));
        } else {
            var _finishedWork = root.finishedWork;
            null !== _finishedWork ? (root.finishedWork = null, root.remainingExpirationTime = commitRoot(_finishedWork)) : (root.finishedWork = null, 
            null !== (_finishedWork = renderRoot(root, expirationTime)) && (shouldYield() ? root.finishedWork = _finishedWork : root.remainingExpirationTime = commitRoot(_finishedWork)));
        }
        isRendering = !1;
    }
    function shouldYield() {
        return null !== deadline && (!(deadline.timeRemaining() > timeHeuristicForUnitOfWork) && (deadlineDidExpire = !0, 
        !0));
    }
    function onUncaughtError(error) {
        invariant(null !== nextFlushedRoot, "Should be working on a root. This error is likely caused by a bug in " + "React. Please file an issue."), 
        nextFlushedRoot.remainingExpirationTime = NoWork$3, hasUnhandledError || (hasUnhandledError = !0, 
        unhandledError = error);
    }
    function batchedUpdates(fn, a) {
        var previousIsBatchingUpdates = isBatchingUpdates;
        isBatchingUpdates = !0;
        try {
            return fn(a);
        } finally {
            isBatchingUpdates = previousIsBatchingUpdates, isBatchingUpdates || isRendering || performWork(Sync$1, null);
        }
    }
    function unbatchedUpdates(fn) {
        if (isBatchingUpdates && !isUnbatchingUpdates) {
            isUnbatchingUpdates = !0;
            try {
                return fn();
            } finally {
                isUnbatchingUpdates = !1;
            }
        }
        return fn();
    }
    function flushSync(fn) {
        var previousIsBatchingUpdates = isBatchingUpdates;
        isBatchingUpdates = !0;
        try {
            return syncUpdates(fn);
        } finally {
            isBatchingUpdates = previousIsBatchingUpdates, invariant(!isRendering, "flushSync was called from inside a lifecycle method. It cannot be " + "called when React is already rendering."), 
            performWork(Sync$1, null);
        }
    }
    return {
        computeAsyncExpiration: computeAsyncExpiration,
        computeExpirationForFiber: computeExpirationForFiber,
        scheduleWork: scheduleWork,
        batchedUpdates: batchedUpdates,
        unbatchedUpdates: unbatchedUpdates,
        flushSync: flushSync,
        deferredUpdates: deferredUpdates
    };
}, HostComponent = ReactTypeOfWork.HostComponent, findCurrentUnmaskedContext = ReactFiberContext.findCurrentUnmaskedContext, isContextProvider = ReactFiberContext.isContextProvider, processChildContext = ReactFiberContext.processChildContext, createFiberRoot = ReactFiberRoot.createFiberRoot, insertUpdateIntoFiber = ReactFiberUpdateQueue.insertUpdateIntoFiber, findCurrentHostFiber = ReactFiberTreeReflection.findCurrentHostFiber, findCurrentHostFiberWithNoPortals = ReactFiberTreeReflection.findCurrentHostFiberWithNoPortals;

function getContextForSubtree(parentComponent) {
    if (!parentComponent) return emptyObject;
    var fiber = ReactInstanceMap_1.get(parentComponent), parentContext = findCurrentUnmaskedContext(fiber);
    return isContextProvider(fiber) ? processChildContext(fiber, parentContext) : parentContext;
}

var ReactFiberReconciler = function(config) {
    var getPublicInstance = config.getPublicInstance, _ReactFiberScheduler = ReactFiberScheduler(config), computeAsyncExpiration = _ReactFiberScheduler.computeAsyncExpiration, computeExpirationForFiber = _ReactFiberScheduler.computeExpirationForFiber, scheduleWork = _ReactFiberScheduler.scheduleWork, batchedUpdates = _ReactFiberScheduler.batchedUpdates, unbatchedUpdates = _ReactFiberScheduler.unbatchedUpdates, flushSync = _ReactFiberScheduler.flushSync, deferredUpdates = _ReactFiberScheduler.deferredUpdates;
    function scheduleTopLevelUpdate(current, element, callback) {
        callback = void 0 === callback ? null : callback;
        var expirationTime = void 0;
        expirationTime = ReactNativeCSFeatureFlags_1.enableAsyncSubtreeAPI && null != element && null != element.type && null != element.type.prototype && !0 === element.type.prototype.unstable_isAsyncReactComponent ? computeAsyncExpiration() : computeExpirationForFiber(current), 
        insertUpdateIntoFiber(current, {
            expirationTime: expirationTime,
            partialState: {
                element: element
            },
            callback: callback,
            isReplace: !1,
            isForced: !1,
            nextCallback: null,
            next: null
        }), scheduleWork(current, expirationTime);
    }
    return {
        createContainer: function(containerInfo, hydrate) {
            return createFiberRoot(containerInfo, hydrate);
        },
        updateContainer: function(element, container, parentComponent, callback) {
            var current = container.current, context = getContextForSubtree(parentComponent);
            null === container.context ? container.context = context : container.pendingContext = context, 
            scheduleTopLevelUpdate(current, element, callback);
        },
        batchedUpdates: batchedUpdates,
        unbatchedUpdates: unbatchedUpdates,
        deferredUpdates: deferredUpdates,
        flushSync: flushSync,
        getPublicRootInstance: function(container) {
            var containerFiber = container.current;
            if (!containerFiber.child) return null;
            switch (containerFiber.child.tag) {
              case HostComponent:
                return getPublicInstance(containerFiber.child.stateNode);

              default:
                return containerFiber.child.stateNode;
            }
        },
        findHostInstance: function(fiber) {
            var hostFiber = findCurrentHostFiber(fiber);
            return null === hostFiber ? null : hostFiber.stateNode;
        },
        findHostInstanceWithNoPortals: function(fiber) {
            var hostFiber = findCurrentHostFiberWithNoPortals(fiber);
            return null === hostFiber ? null : hostFiber.stateNode;
        }
    };
}, index$2 = ReactFiberReconciler, ComponentTree, injection$1 = {
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

function executeDispatch(event, simulated, listener, inst) {
    var type = event.type || "unknown-event";
    event.currentTarget = EventPluginUtils.getNodeFromInstance(inst), ReactErrorUtils_1.invokeGuardedCallbackAndCatchFirstError(type, listener, void 0, event), 
    event.currentTarget = null;
}

function executeDispatchesInOrder(event, simulated) {
    var dispatchListeners = event._dispatchListeners, dispatchInstances = event._dispatchInstances;
    if (Array.isArray(dispatchListeners)) for (var i = 0; i < dispatchListeners.length && !event.isPropagationStopped(); i++) executeDispatch(event, simulated, dispatchListeners[i], dispatchInstances[i]); else dispatchListeners && executeDispatch(event, simulated, dispatchListeners, dispatchInstances);
    event._dispatchListeners = null, event._dispatchInstances = null;
}

function executeDispatchesInOrderStopAtTrueImpl(event) {
    var dispatchListeners = event._dispatchListeners, dispatchInstances = event._dispatchInstances;
    if (Array.isArray(dispatchListeners)) {
        for (var i = 0; i < dispatchListeners.length && !event.isPropagationStopped(); i++) if (dispatchListeners[i](event, dispatchInstances[i])) return dispatchInstances[i];
    } else if (dispatchListeners && dispatchListeners(event, dispatchInstances)) return dispatchInstances;
    return null;
}

function executeDispatchesInOrderStopAtTrue(event) {
    var ret = executeDispatchesInOrderStopAtTrueImpl(event);
    return event._dispatchInstances = null, event._dispatchListeners = null, ret;
}

function executeDirectDispatch(event) {
    var dispatchListener = event._dispatchListeners, dispatchInstance = event._dispatchInstances;
    invariant(!Array.isArray(dispatchListener), "executeDirectDispatch(...): Invalid `event`."), 
    event.currentTarget = dispatchListener ? EventPluginUtils.getNodeFromInstance(dispatchInstance) : null;
    var res = dispatchListener ? dispatchListener(event) : null;
    return event.currentTarget = null, event._dispatchListeners = null, event._dispatchInstances = null, 
    res;
}

function hasDispatches(event) {
    return !!event._dispatchListeners;
}

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
    injection: injection$1
}, EventPluginUtils_1 = EventPluginUtils, fiberHostComponent = null, ReactControlledComponentInjection = {
    injectFiberControlledHostComponent: function(hostComponentImpl) {
        fiberHostComponent = hostComponentImpl;
    }
}, restoreTarget = null, restoreQueue = null;

function restoreStateOfTarget(target) {
    var internalInstance = EventPluginUtils_1.getInstanceFromNode(target);
    if (internalInstance) {
        invariant(fiberHostComponent && "function" == typeof fiberHostComponent.restoreControlledState, "Fiber needs to be injected to handle a fiber target for controlled " + "events. This error is likely caused by a bug in React. Please file an issue.");
        var props = EventPluginUtils_1.getFiberCurrentPropsFromNode(internalInstance.stateNode);
        fiberHostComponent.restoreControlledState(internalInstance.stateNode, internalInstance.type, props);
    }
}

var ReactControlledComponent = {
    injection: ReactControlledComponentInjection,
    enqueueStateRestore: function(target) {
        restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [ target ] : restoreTarget = target;
    },
    restoreStateIfNeeded: function() {
        if (restoreTarget) {
            var target = restoreTarget, queuedTargets = restoreQueue;
            if (restoreTarget = null, restoreQueue = null, restoreStateOfTarget(target), queuedTargets) for (var i = 0; i < queuedTargets.length; i++) restoreStateOfTarget(queuedTargets[i]);
        }
    }
}, ReactControlledComponent_1 = ReactControlledComponent, fiberBatchedUpdates = function(fn, bookkeeping) {
    return fn(bookkeeping);
};

function batchedUpdates(fn, bookkeeping) {
    return fiberBatchedUpdates(fn, bookkeeping);
}

var isNestingBatched = !1;

function batchedUpdatesWithControlledComponents(fn, bookkeeping) {
    if (isNestingBatched) return batchedUpdates(fn, bookkeeping);
    isNestingBatched = !0;
    try {
        return batchedUpdates(fn, bookkeeping);
    } finally {
        isNestingBatched = !1, ReactControlledComponent_1.restoreStateIfNeeded();
    }
}

var ReactGenericBatchingInjection = {
    injectFiberBatchedUpdates: function(_batchedUpdates) {
        fiberBatchedUpdates = _batchedUpdates;
    }
}, ReactGenericBatching = {
    batchedUpdates: batchedUpdatesWithControlledComponents,
    injection: ReactGenericBatchingInjection
}, ReactGenericBatching_1 = ReactGenericBatching, ReactVersion = "16.0.0", injectInternals = ReactFiberDevToolsHook.injectInternals;

function processProps(instance, props) {
    var propsPayload = {};
    for (var key in props) if ("children" !== key) {
        var value = props[key];
        "function" == typeof value && (value = {
            style: "rt-event",
            event: key,
            tag: instance
        }), propsPayload[key] = value;
    }
    return propsPayload;
}

function arePropsEqual(oldProps, newProps) {
    var key;
    for (key in newProps) if ("children" !== key && newProps[key] !== oldProps[key]) return !1;
    for (key in oldProps) if ("children" !== key && !(key in newProps)) return !1;
    return !0;
}

var ReactNativeCSFiberRenderer = index$2({
    appendInitialChild: function(parentInstance, child) {},
    createInstance: function(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
        return 0;
    },
    createTextInstance: function(text, rootContainerInstance, hostContext, internalInstanceHandle) {
        return 0;
    },
    finalizeInitialChildren: function(parentInstance, type, props, rootContainerInstance) {
        return !1;
    },
    getRootHostContext: function() {
        return emptyObject;
    },
    getChildHostContext: function() {
        return emptyObject;
    },
    getPublicInstance: function(instance) {
        return instance;
    },
    prepareForCommit: function() {},
    prepareUpdate: function(instance, type, oldProps, newProps, rootContainerInstance, hostContext) {
        return arePropsEqual(oldProps, newProps) ? null : processProps(instance, newProps);
    },
    resetAfterCommit: function() {},
    shouldDeprioritizeSubtree: function(type, props) {
        return !1;
    },
    scheduleDeferredCallback: commonjsGlobal.requestIdleCallback,
    shouldSetTextContent: function(type, props) {
        return !1;
    },
    useSyncScheduling: !0,
    now: function() {
        return 0;
    },
    persistence: {
        cloneInstance: function(instance, updatePayload, type, oldProps, newProps, internalInstanceHandle, keepChildren, recyclableInstance) {
            return 0;
        },
        createContainerChildSet: function(container) {
            return [];
        },
        appendChildToContainerChildSet: function(childSet, child) {},
        finalizeContainerChildren: function(container, newChildren) {},
        replaceContainerChildren: function(container, newChildren) {}
    }
}), roots = new Map(), ReactNativeCSFiber = {
    render: function(element, containerTag, callback) {
        var root = roots.get(containerTag);
        return root || (root = ReactNativeCSFiberRenderer.createContainer(containerTag, !1), 
        roots.set(containerTag, root)), ReactNativeCSFiberRenderer.updateContainer(element, root, null, callback), 
        ReactNativeCSFiberRenderer.getPublicRootInstance(root);
    },
    unmountComponentAtNode: function(containerTag) {
        var root = roots.get(containerTag);
        root && ReactNativeCSFiberRenderer.updateContainer(null, root, null, function() {
            roots.delete(containerTag);
        });
    },
    unstable_batchedUpdates: ReactGenericBatching_1.batchedUpdates,
    flushSync: ReactNativeCSFiberRenderer.flushSync
};

injectInternals({
    findHostInstanceByFiber: ReactNativeCSFiberRenderer.findHostInstance,
    bundleType: 0,
    version: ReactVersion,
    rendererPackageName: "react-cs-renderer"
});

var ReactNativeCS = ReactNativeCSFiber, index = ReactNativeCS;

module.exports = index;
