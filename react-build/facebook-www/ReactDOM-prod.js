/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @providesModule ReactDOM-prod
 * @preventMunge
 */
"use strict";

var react = require('React'), invariant = require("fbjs/lib/invariant"), emptyObject = require("fbjs/lib/emptyObject"), shallowEqual = require("fbjs/lib/shallowEqual"), ReactFeatureFlags = require("ReactFeatureFlags"), ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment"), emptyFunction = require("fbjs/lib/emptyFunction"), EventListener = require("fbjs/lib/EventListener"), containsNode = require("fbjs/lib/containsNode"), focusNode = require("fbjs/lib/focusNode"), getActiveElement = require("fbjs/lib/getActiveElement"), TouchEventUtils = require("fbjs/lib/TouchEventUtils");

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
invariant(react, "ReactDOM was loaded before React. Make sure you load " + "the React package before loading ReactDOM.");

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * `ReactInstanceMap` maintains a mapping from a public facing stateful
 * instance (key) and the internal representation (value). This allows public
 * methods to accept the user facing instance as an argument and map them back
 * to internal methods.
 *
 * Note that this module is currently shared and assumed to be stateless.
 * If this becomes an actual Map, that will break.
 */
var ReactInstanceMap = {
    /**
   * This API should be called `delete` but we'd have to make sure to always
   * transform these to strings for IE support. When this transform is fully
   * supported we can rename it.
   */
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
}, ReactInternals = react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ReactGlobalSharedState = {
    ReactCurrentOwner: ReactInternals.ReactCurrentOwner
}, ReactGlobalSharedState_1 = ReactGlobalSharedState;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
function getComponentName$1(fiber) {
    var type = fiber.type;
    return "string" == typeof type ? type : "function" == typeof type ? type.displayName || type.name : null;
}

var getComponentName_1 = getComponentName$1, ReactTypeOfSideEffect = {
    // Don't change these two values:
    NoEffect: 0,
    //           0b00000000
    PerformedWork: 1,
    //      0b00000001
    // You can change the rest (and add more).
    Placement: 2,
    //          0b00000010
    Update: 4,
    //             0b00000100
    PlacementAndUpdate: 6,
    // 0b00000110
    Deletion: 8,
    //           0b00001000
    ContentReset: 16,
    //      0b00010000
    Callback: 32,
    //          0b00100000
    Err: 64,
    //               0b01000000
    Ref: 128
}, HostComponent$1 = ReactTypeOfWork.HostComponent, HostRoot$1 = ReactTypeOfWork.HostRoot, HostPortal = ReactTypeOfWork.HostPortal, HostText = ReactTypeOfWork.HostText, NoEffect = ReactTypeOfSideEffect.NoEffect, Placement = ReactTypeOfSideEffect.Placement, MOUNTING = 1, MOUNTED = 2, UNMOUNTED = 3;

function isFiberMountedImpl(fiber) {
    var node = fiber;
    if (fiber.alternate) for (;node.return; ) node = node.return; else {
        // If there is no alternate, this might be a new tree that isn't inserted
        // yet. If it is, then it will have a pending insertion effect on it.
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
        // If there is no alternate, then we only need to check if it is mounted.
        var state = isFiberMountedImpl(fiber);
        return invariant(state !== UNMOUNTED, "Unable to find node on an unmounted component."), 
        state === MOUNTING ? null : fiber;
    }
    for (// If we have two possible branches, we'll walk backwards up to the root
    // to see what path the root points to. On the way we may hit one of the
    // special cases and we'll deal with them.
    var a = fiber, b = alternate; !0; ) {
        var parentA = a.return, parentB = parentA ? parentA.alternate : null;
        if (!parentA || !parentB) // We're at the root.
        break;
        // If both copies of the parent fiber point to the same child, we can
        // assume that the child is current. This happens when we bailout on low
        // priority: the bailed out fiber's child reuses the current child.
        if (parentA.child === parentB.child) {
            for (var child = parentA.child; child; ) {
                if (child === a) // We've determined that A is the current branch.
                return assertIsMounted(parentA), fiber;
                if (child === b) // We've determined that B is the current branch.
                return assertIsMounted(parentA), alternate;
                child = child.sibling;
            }
            // We should never have an alternate for any mounting node. So the only
            // way this could possibly happen is if this was unmounted, if at all.
            invariant(!1, "Unable to find node on an unmounted component.");
        }
        if (a.return !== b.return) // The return pointer of A and the return pointer of B point to different
        // fibers. We assume that return pointers never criss-cross, so A must
        // belong to the child set of A.return, and B must belong to the child
        // set of B.return.
        a = parentA, b = parentB; else {
            for (// The return pointers point to the same fiber. We'll have to use the
            // default, slow path: scan the child sets of each parent alternate to see
            // which child belongs to which set.
            //
            // Search parent A's child set
            var didFindChild = !1, _child = parentA.child; _child; ) {
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
                for (// Search parent B's child set
                _child = parentB.child; _child; ) {
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
    // If the root is not a host container, we're in a disconnected tree. I.e.
    // unmounted.
    return invariant(a.tag === HostRoot$1, "Unable to find node on an unmounted component."), 
    a.stateNode.current === a ? fiber : alternate;
}

var findCurrentFiberUsingSlowPath_1 = findCurrentFiberUsingSlowPath, findCurrentHostFiber$1 = function(parent) {
    var currentParent = findCurrentFiberUsingSlowPath(parent);
    if (!currentParent) return null;
    for (// Next we'll drill down this component to find the first HostComponent/Text.
    var node = currentParent; !0; ) {
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
    // Flow needs the return null here, but ESLint complains about it.
    // eslint-disable-next-line no-unreachable
    return null;
}, findCurrentHostFiberWithNoPortals$1 = function(parent) {
    var currentParent = findCurrentFiberUsingSlowPath(parent);
    if (!currentParent) return null;
    for (// Next we'll drill down this component to find the first HostComponent/Text.
    var node = currentParent; !0; ) {
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
    // Flow needs the return null here, but ESLint complains about it.
    // eslint-disable-next-line no-unreachable
    return null;
}, ReactFiberTreeReflection = {
    isFiberMounted: isFiberMounted$1,
    isMounted: isMounted,
    findCurrentFiberUsingSlowPath: findCurrentFiberUsingSlowPath_1,
    findCurrentHostFiber: findCurrentHostFiber$1,
    findCurrentHostFiberWithNoPortals: findCurrentHostFiberWithNoPortals$1
}, valueStack = [], index$2 = -1, createCursor$1 = function(defaultValue) {
    return {
        current: defaultValue
    };
}, isEmpty = function() {
    return -1 === index$2;
}, pop$1 = function(cursor, fiber) {
    index$2 < 0 || (cursor.current = valueStack[index$2], valueStack[index$2] = null, 
    index$2--);
}, push$1 = function(cursor, value, fiber) {
    index$2++, valueStack[index$2] = cursor.current, cursor.current = value;
}, reset = function() {
    for (;index$2 > -1; ) valueStack[index$2] = null, index$2--;
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
    // Avoid recreating masked context unless unmasked context has changed.
    // Failing to do this will result in unnecessary calls to componentWillReceiveProps.
    // This may trigger infinite loops if componentWillReceiveProps calls setState.
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
    // TODO (bvaughn) Replace this behavior with an invariant() in the future.
    // It has only been added in Fiber to match the (unintentional) behavior in Stack.
    if ("function" != typeof instance.getChildContext) return parentContext;
    var childContext = void 0;
    childContext = instance.getChildContext();
    for (var contextKey in childContext) invariant(contextKey in childContextTypes, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', getComponentName_1(fiber) || "Unknown", contextKey);
    return Object.assign({}, parentContext, childContext);
}

var processChildContext_1 = processChildContext$1, pushContextProvider = function(workInProgress) {
    if (!isContextProvider$1(workInProgress)) return !1;
    var instance = workInProgress.stateNode, memoizedMergedChildContext = instance && instance.__reactInternalMemoizedMergedChildContext || emptyObject;
    // Remember the parent context so we can merge with it later.
    // Inherit the parent's did-perform-work value to avoid inadvertently blocking updates.
    return previousContext = contextStackCursor.current, push(contextStackCursor, memoizedMergedChildContext, workInProgress), 
    push(didPerformWorkStackCursor, didPerformWorkStackCursor.current, workInProgress), 
    !0;
}, invalidateContextProvider = function(workInProgress, didChange) {
    var instance = workInProgress.stateNode;
    if (invariant(instance, "Expected to have an instance by this point. " + "This error is likely caused by a bug in React. Please file an issue."), 
    didChange) {
        // Merge parent and own context.
        // Skip this if we're not updating due to sCU.
        // This avoids unnecessarily recomputing memoized values.
        var mergedContext = processChildContext$1(workInProgress, previousContext);
        instance.__reactInternalMemoizedMergedChildContext = mergedContext, // Replace the old (or empty) context with the new one.
        // It is important to unwind the context in the reverse order.
        pop(didPerformWorkStackCursor, workInProgress), pop(contextStackCursor, workInProgress), 
        // Now push the new context and mark that it has changed.
        push(contextStackCursor, mergedContext, workInProgress), push(didPerformWorkStackCursor, didChange, workInProgress);
    } else pop(didPerformWorkStackCursor, workInProgress), push(didPerformWorkStackCursor, didChange, workInProgress);
}, resetContext = function() {
    previousContext = emptyObject, contextStackCursor.current = emptyObject, didPerformWorkStackCursor.current = !1;
}, findCurrentUnmaskedContext$1 = function(fiber) {
    // Currently this is only used with renderSubtreeIntoContainer; not sure if it
    // makes sense elsewhere
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

// 1 unit of expiration time represents 10ms.
function msToExpirationTime(ms) {
    // Always add an offset so that we don't clash with the magic number for NoWork.
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

// A Fiber is work on a Component that needs to be done or was done. There can
// be more than one per component.
function FiberNode(tag, key, internalContextTag) {
    // Instance
    this.tag = tag, this.key = key, this.type = null, this.stateNode = null, // Fiber
    this.return = null, this.child = null, this.sibling = null, this.index = 0, this.ref = null, 
    this.pendingProps = null, this.memoizedProps = null, this.updateQueue = null, this.memoizedState = null, 
    this.internalContextTag = internalContextTag, // Effects
    this.effectTag = NoEffect$1, this.nextEffect = null, this.firstEffect = null, this.lastEffect = null, 
    this.expirationTime = NoWork$1, this.alternate = null;
}

// This is a constructor function, rather than a POJO constructor, still
// please ensure we do the following:
// 1) Nobody should add any instance methods on this. Instance methods can be
//    more difficult to predict when they get optimized and they are almost
//    never inlined properly in static compilers.
// 2) Nobody should rely on `instanceof Fiber` for type testing. We should
//    always know when it is a fiber.
// 3) We might want to experiment with using numeric keys since they are easier
//    to optimize in a non-JIT environment.
// 4) We can easily go from a constructor to a createFiber object literal if that
//    is faster.
// 5) It should be easy to port this to a C struct and keep a C implementation
//    compatible.
var createFiber = function(tag, key, internalContextTag) {
    // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
    return new FiberNode(tag, key, internalContextTag);
};

function shouldConstruct(Component) {
    return !(!Component.prototype || !Component.prototype.isReactComponent);
}

// This is used to create an alternate fiber to do work on.
var createWorkInProgress = function(current, expirationTime) {
    var workInProgress = current.alternate;
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    // We already have an alternate.
    // Reset the effect tag.
    // The effect list is no longer valid.
    // pendingProps is set by the parent during reconciliation.
    // TODO: Pass this as an argument.
    // These will be overridden during the parent's reconciliation
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
    // TODO: Consider supporting keyed fragments. Technically, we accidentally
    // support that in the existing React.
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
    fiber.type = type; else if ("object" == typeof type && null !== type && "number" == typeof type.tag) // Currently assumed to be a continuation and therefore is a fiber already.
    // TODO: The yield system is currently broken for updates in some cases.
    // The reified yield stores a fiber, but we don't know which fiber that is;
    // the current or a workInProgress? When the continuation gets rendered here
    // we don't know if we can reuse that fiber or if we need to clone it.
    // There is probably a clever way to restructure this.
    fiber = type; else {
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
        // Used by persistent updates
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
    // Cyclic construction. This cheats the type system right now because
    // stateNode is any.
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

// This function can only be called with a work-in-progress fiber and
// only during begin or complete phase. Do not call it under any other
// circumstances.
function getStackAddendumByWorkInProgressFiber$1(workInProgress) {
    var info = "", node = workInProgress;
    do {
        info += describeFiber(node), // Otherwise this return pointer might point to the wrong tree:
        node = node.return;
    } while (node);
    return info;
}

var ReactFiberComponentTreeHook = {
    getStackAddendumByWorkInProgressFiber: getStackAddendumByWorkInProgressFiber$1
}, ReactErrorUtils = {
    // Used by Fiber to simulate a try-catch.
    _caughtError: null,
    _hasCaughtError: !1,
    // Used by event system to capture/rethrow the first error.
    _rethrowError: null,
    _hasRethrowError: !1,
    injection: {
        injectErrorUtils: function(injectedErrorUtils) {
            invariant("function" == typeof injectedErrorUtils.invokeGuardedCallback, "Injected invokeGuardedCallback() must be a function."), 
            invokeGuardedCallback$1 = injectedErrorUtils.invokeGuardedCallback;
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
        invokeGuardedCallback$1.apply(ReactErrorUtils, arguments);
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

// Callbacks are not validated until invocation
// Singly linked-list of updates. When an update is scheduled, it is added to
// the queue of the current fiber and the work-in-progress fiber. The two queues
// are separate but they share a persistent structure.
//
// During reconciliation, updates are removed from the work-in-progress fiber,
// but they remain on the current fiber. That ensures that if a work-in-progress
// is aborted, the aborted updates are recovered by cloning from current.
//
// The work-in-progress queue is always a subset of the current queue.
//
// When the tree is committed, the work-in-progress becomes the current.
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
    // Append the update to the end of the list.
    null === queue.last ? // Queue is empty
    queue.first = queue.last = update : (queue.last.next = update, queue.last = update), 
    (queue.expirationTime === NoWork$5 || queue.expirationTime > update.expirationTime) && (queue.expirationTime = update.expirationTime);
}

var insertUpdateIntoQueue_1 = insertUpdateIntoQueue;

function insertUpdateIntoFiber$2(fiber, update) {
    // We'll have at least one and at most two distinct update queues.
    var alternateFiber = fiber.alternate, queue1 = fiber.updateQueue;
    null === queue1 && (// TODO: We don't know what the base state will be until we begin work.
    // It depends on which fiber is the next current. Initialize with an empty
    // base state, then set to the memoizedState when rendering. Not super
    // happy with this approach.
    queue1 = fiber.updateQueue = createUpdateQueue(null));
    var queue2 = void 0;
    // Warn if an update is scheduled from inside an updater function.
    // Warn if an update is scheduled from inside an updater function.
    // If either queue is empty, we need to add to both queues.
    // If both lists are not empty, the last update is the same for both lists
    // because of structural sharing. So, we should only append to one of
    // the lists.
    // But we still need to update the `last` pointer of queue2.
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
        // We need to create a work-in-progress queue, by cloning the current queue.
        var currentQueue = queue;
        queue = workInProgress.updateQueue = {
            baseState: currentQueue.baseState,
            expirationTime: currentQueue.expirationTime,
            first: currentQueue.first,
            last: currentQueue.last,
            isInitialized: currentQueue.isInitialized,
            // These fields are no longer valid because they were already committed.
            // Reset them.
            callbackList: null,
            hasForceUpdate: !1
        };
    }
    queue.expirationTime = NoWork$5;
    // TODO: We don't know what the base state will be until we begin work.
    // It depends on which fiber is the next current. Initialize with an empty
    // base state, then set to the memoizedState when rendering. Not super
    // happy with this approach.
    var state = void 0;
    queue.isInitialized ? state = queue.baseState : (state = queue.baseState = workInProgress.memoizedState, 
    queue.isInitialized = !0);
    for (var dontMutatePrevState = !0, update = queue.first, didSkip = !1; null !== update; ) {
        var updateExpirationTime = update.expirationTime;
        if (updateExpirationTime > renderExpirationTime) {
            // This update does not have sufficient priority. Skip it.
            var remainingExpirationTime = queue.expirationTime;
            (remainingExpirationTime === NoWork$5 || remainingExpirationTime > updateExpirationTime) && (// Update the remaining expiration time.
            queue.expirationTime = updateExpirationTime), didSkip || (didSkip = !0, queue.baseState = state), 
            // Continue to the next update.
            update = update.next;
        } else {
            // This update does have sufficient priority.
            // If no previous updates were skipped, drop this update from the queue by
            // advancing the head of the list.
            didSkip || (queue.first = update.next, null === queue.first && (queue.last = null));
            // Process the update
            var _partialState = void 0;
            if (update.isReplace ? (state = getStateFromUpdate(update, instance, state, props), 
            dontMutatePrevState = !0) : (_partialState = getStateFromUpdate(update, instance, state, props)) && (// $FlowFixMe: Idk how to type this properly.
            state = dontMutatePrevState ? Object.assign({}, state, _partialState) : Object.assign(state, _partialState), 
            dontMutatePrevState = !1), update.isForced && (queue.hasForceUpdate = !0), null !== update.callback) {
                // Append to list of callbacks.
                var _callbackList = queue.callbackList;
                null === _callbackList && (_callbackList = queue.callbackList = []), _callbackList.push(update);
            }
            update = update.next;
        }
    }
    // The queue is empty. We can reset it.
    return null !== queue.callbackList ? workInProgress.effectTag |= CallbackEffect : null !== queue.first || queue.hasForceUpdate || (workInProgress.updateQueue = null), 
    didSkip || (didSkip = !0, queue.baseState = state), state;
}

var processUpdateQueue_1 = processUpdateQueue$2;

function commitCallbacks(queue, context) {
    var callbackList = queue.callbackList;
    if (null !== callbackList) {
        // Set the list to null to make sure they don't get called more than once.
        queue.callbackList = null;
        for (var i = 0; i < callbackList.length; i++) {
            var update = callbackList[i], _callback = update.callback;
            // This update might be processed again. Clear the callback so it's only
            // called once.
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
}, ReactFeatureFlagsWww = ReactFeatureFlags, Update$1 = ReactTypeOfSideEffect.Update, isMounted$1 = ReactFiberTreeReflection.isMounted, AsyncUpdates$1 = ReactTypeOfInternalContext.AsyncUpdates, cacheContext$1 = ReactFiberContext.cacheContext, getMaskedContext$2 = ReactFiberContext.getMaskedContext, getUnmaskedContext$2 = ReactFiberContext.getUnmaskedContext, isContextConsumer$1 = ReactFiberContext.isContextConsumer, insertUpdateIntoFiber$1 = ReactFiberUpdateQueue.insertUpdateIntoFiber, processUpdateQueue$1 = ReactFiberUpdateQueue.processUpdateQueue, _require6 = ReactFiberContext, hasContextChanged$2 = _require6.hasContextChanged, ReactFiberClassComponent = function(scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState) {
    // Class component state updater
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
        if (null === oldProps || null !== workInProgress.updateQueue && workInProgress.updateQueue.hasForceUpdate) // If the workInProgress already has an Update effect, return true
        return !0;
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
        instance.updater = updater, workInProgress.stateNode = instance, // The instance needs access to the fiber so that it can schedule updates
        ReactInstanceMap_1.set(instance, workInProgress);
    }
    function constructClassInstance(workInProgress, props) {
        var ctor = workInProgress.type, unmaskedContext = getUnmaskedContext$2(workInProgress), needsContext = isContextConsumer$1(workInProgress), context = needsContext ? getMaskedContext$2(workInProgress, unmaskedContext) : emptyObject, instance = new ctor(props, context);
        // Cache unmasked context so we can avoid recreating masked context unless necessary.
        // ReactFiberContext usually updates this cache but can't for newly-created instances.
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
    // Invokes the mount life-cycles on a previously never rendered instance.
    function mountClassInstance(workInProgress, renderExpirationTime) {
        var current = workInProgress.alternate, instance = workInProgress.stateNode, state = instance.state || null, props = workInProgress.pendingProps;
        invariant(props, "There must be pending props for an initial mount. This error is " + "likely caused by a bug in React. Please file an issue.");
        var unmaskedContext = getUnmaskedContext$2(workInProgress);
        if (instance.props = props, instance.state = workInProgress.memoizedState = state, 
        instance.refs = emptyObject, instance.context = getMaskedContext$2(workInProgress, unmaskedContext), 
        ReactFeatureFlagsWww.enableAsyncSubtreeAPI && null != workInProgress.type && null != workInProgress.type.prototype && !0 === workInProgress.type.prototype.unstable_isAsyncReactComponent && (workInProgress.internalContextTag |= AsyncUpdates$1), 
        "function" == typeof instance.componentWillMount) {
            callComponentWillMount(workInProgress, instance);
            // If we had additional state updates during this life-cycle, let's
            // process them now.
            var updateQueue = workInProgress.updateQueue;
            null !== updateQueue && (instance.state = processUpdateQueue$1(current, workInProgress, updateQueue, instance, props, renderExpirationTime));
        }
        "function" == typeof instance.componentDidMount && (workInProgress.effectTag |= Update$1);
    }
    // Called on a preexisting class instance. Returns false if a resumed render
    // could be reused.
    // function resumeMountClassInstance(
    //   workInProgress: Fiber,
    //   priorityLevel: PriorityLevel,
    // ): boolean {
    //   const instance = workInProgress.stateNode;
    //   resetInputPointers(workInProgress, instance);
    //   let newState = workInProgress.memoizedState;
    //   let newProps = workInProgress.pendingProps;
    //   if (!newProps) {
    //     // If there isn't any new props, then we'll reuse the memoized props.
    //     // This could be from already completed work.
    //     newProps = workInProgress.memoizedProps;
    //     invariant(
    //       newProps != null,
    //       'There should always be pending or memoized props. This error is ' +
    //         'likely caused by a bug in React. Please file an issue.',
    //     );
    //   }
    //   const newUnmaskedContext = getUnmaskedContext(workInProgress);
    //   const newContext = getMaskedContext(workInProgress, newUnmaskedContext);
    //   const oldContext = instance.context;
    //   const oldProps = workInProgress.memoizedProps;
    //   if (
    //     typeof instance.componentWillReceiveProps === 'function' &&
    //     (oldProps !== newProps || oldContext !== newContext)
    //   ) {
    //     callComponentWillReceiveProps(
    //       workInProgress,
    //       instance,
    //       newProps,
    //       newContext,
    //     );
    //   }
    //   // Process the update queue before calling shouldComponentUpdate
    //   const updateQueue = workInProgress.updateQueue;
    //   if (updateQueue !== null) {
    //     newState = processUpdateQueue(
    //       workInProgress,
    //       updateQueue,
    //       instance,
    //       newState,
    //       newProps,
    //       priorityLevel,
    //     );
    //   }
    //   // TODO: Should we deal with a setState that happened after the last
    //   // componentWillMount and before this componentWillMount? Probably
    //   // unsupported anyway.
    //   if (
    //     !checkShouldComponentUpdate(
    //       workInProgress,
    //       workInProgress.memoizedProps,
    //       newProps,
    //       workInProgress.memoizedState,
    //       newState,
    //       newContext,
    //     )
    //   ) {
    //     // Update the existing instance's state, props, and context pointers even
    //     // though we're bailing out.
    //     instance.props = newProps;
    //     instance.state = newState;
    //     instance.context = newContext;
    //     return false;
    //   }
    //   // Update the input pointers now so that they are correct when we call
    //   // componentWillMount
    //   instance.props = newProps;
    //   instance.state = newState;
    //   instance.context = newContext;
    //   if (typeof instance.componentWillMount === 'function') {
    //     callComponentWillMount(workInProgress, instance);
    //     // componentWillMount may have called setState. Process the update queue.
    //     const newUpdateQueue = workInProgress.updateQueue;
    //     if (newUpdateQueue !== null) {
    //       newState = processUpdateQueue(
    //         workInProgress,
    //         newUpdateQueue,
    //         instance,
    //         newState,
    //         newProps,
    //         priorityLevel,
    //       );
    //     }
    //   }
    //   if (typeof instance.componentDidMount === 'function') {
    //     workInProgress.effectTag |= Update;
    //   }
    //   instance.state = newState;
    //   return true;
    // }
    // Invokes the update life-cycles and returns false if it shouldn't rerender.
    function updateClassInstance(current, workInProgress, renderExpirationTime) {
        var instance = workInProgress.stateNode;
        resetInputPointers(workInProgress, instance);
        var oldProps = workInProgress.memoizedProps, newProps = workInProgress.pendingProps;
        newProps || (// If there aren't any new props, then we'll reuse the memoized props.
        // This could be from already completed work.
        newProps = oldProps, invariant(null != newProps, "There should always be pending or memoized props. This error is " + "likely caused by a bug in React. Please file an issue."));
        var oldContext = instance.context, newUnmaskedContext = getUnmaskedContext$2(workInProgress), newContext = getMaskedContext$2(workInProgress, newUnmaskedContext);
        // Note: During these life-cycles, instance.props/instance.state are what
        // ever the previously attempted to render - not the "current". However,
        // during componentDidUpdate we pass the "current" props.
        "function" != typeof instance.componentWillReceiveProps || oldProps === newProps && oldContext === newContext || callComponentWillReceiveProps(workInProgress, instance, newProps, newContext);
        // Compute the next state using the memoized state and the update queue.
        var oldState = workInProgress.memoizedState, newState = void 0;
        if (newState = null !== workInProgress.updateQueue ? processUpdateQueue$1(current, workInProgress, workInProgress.updateQueue, instance, newProps, renderExpirationTime) : oldState, 
        !(oldProps !== newProps || oldState !== newState || hasContextChanged$2() || null !== workInProgress.updateQueue && workInProgress.updateQueue.hasForceUpdate)) // If an update was already in progress, we should schedule an Update
        // effect even though we're bailing out, so that cWU/cDU are called.
        return "function" == typeof instance.componentDidUpdate && (oldProps === current.memoizedProps && oldState === current.memoizedState || (workInProgress.effectTag |= Update$1)), 
        !1;
        var shouldUpdate = checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext);
        // If an update was already in progress, we should schedule an Update
        // effect even though we're bailing out, so that cWU/cDU are called.
        // If shouldComponentUpdate returned false, we should still update the
        // memoized props/state to indicate that this work can be reused.
        // Update the existing instance's state, props, and context pointers even
        // if shouldComponentUpdate returns false.
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
        // resumeMountClassInstance,
        updateClassInstance: updateClassInstance
    };
}, REACT_PORTAL_TYPE$1 = "function" == typeof Symbol && Symbol.for && Symbol.for("react.portal") || 60106, createPortal$1 = function(children, containerInfo, // TODO: figure out the API for cross-renderer implementation.
implementation) {
    var key = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
    return {
        // This tag allow us to uniquely identify this as a React Portal
        $$typeof: REACT_PORTAL_TYPE$1,
        key: null == key ? null : "" + key,
        children: children,
        containerInfo: containerInfo,
        implementation: implementation
    };
}, REACT_PORTAL_TYPE_1 = REACT_PORTAL_TYPE$1, ReactPortal = {
    createPortal: createPortal$1,
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
            // Check if previous string ref matches new string ref
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

// This wrapper function exists because I expect to clone the code in each path
// to be able to optimize each path individually by branching early. This needs
// a compiler or we can do it manually. Helpers that don't need this branching
// live outside of this function.
function ChildReconciler(shouldClone, shouldTrackSideEffects) {
    function deleteChild(returnFiber, childToDelete) {
        if (shouldTrackSideEffects) {
            if (!shouldClone) {
                // When we're reconciling in place we have a work in progress copy. We
                // actually want the current copy. If there is no current copy, then we
                // don't need to track deletion side-effects.
                if (null === childToDelete.alternate) return;
                childToDelete = childToDelete.alternate;
            }
            // Deletions are added in reversed order so we add it to the front.
            // At this point, the return fiber's effect list is empty except for
            // deletions, so we can just append the deletion to the list. The remaining
            // effects aren't added until the complete phase. Once we implement
            // resuming, this may not be true.
            var last = returnFiber.lastEffect;
            null !== last ? (last.nextEffect = childToDelete, returnFiber.lastEffect = childToDelete) : returnFiber.firstEffect = returnFiber.lastEffect = childToDelete, 
            childToDelete.nextEffect = null, childToDelete.effectTag = Deletion$1;
        }
    }
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
        if (!shouldTrackSideEffects) // Noop.
        return null;
        for (// TODO: For the shouldClone case, this could be micro-optimized a bit by
        // assuming that after the first child we've already added everything.
        var childToDelete = currentFirstChild; null !== childToDelete; ) deleteChild(returnFiber, childToDelete), 
        childToDelete = childToDelete.sibling;
        return null;
    }
    function mapRemainingChildren(returnFiber, currentFirstChild) {
        for (// Add the remaining children to a temporary map so that we can find them by
        // keys quickly. Implicit (null) keys get added to this set with their index
        var existingChildren = new Map(), existingChild = currentFirstChild; null !== existingChild; ) null !== existingChild.key ? existingChildren.set(existingChild.key, existingChild) : existingChildren.set(existingChild.index, existingChild), 
        existingChild = existingChild.sibling;
        return existingChildren;
    }
    function useFiber(fiber, expirationTime) {
        // We currently set sibling to null and index to 0 here because it is easy
        // to forget to do before returning it. E.g. for the single child case.
        if (shouldClone) {
            var clone = createWorkInProgress$2(fiber, expirationTime);
            return clone.index = 0, clone.sibling = null, clone;
        }
        // We override the expiration time even if it is earlier, because if
        // we're reconciling at a later time that means that this was
        // down-prioritized.
        return fiber.expirationTime = expirationTime, fiber.effectTag = NoEffect$2, fiber.index = 0, 
        fiber.sibling = null, fiber;
    }
    function placeChild(newFiber, lastPlacedIndex, newIndex) {
        if (newFiber.index = newIndex, !shouldTrackSideEffects) // Noop.
        return lastPlacedIndex;
        var current = newFiber.alternate;
        if (null !== current) {
            var oldIndex = current.index;
            // This is a move.
            return oldIndex < lastPlacedIndex ? (newFiber.effectTag = Placement$3, lastPlacedIndex) : oldIndex;
        }
        // This is an insertion.
        return newFiber.effectTag = Placement$3, lastPlacedIndex;
    }
    function placeSingleChild(newFiber) {
        // This is simpler for the single child case. We only need to do a
        // placement for inserting new children.
        return shouldTrackSideEffects && null === newFiber.alternate && (newFiber.effectTag = Placement$3), 
        newFiber;
    }
    function updateTextNode(returnFiber, current, textContent, expirationTime) {
        if (null === current || current.tag !== HostText$3) {
            // Insert
            var created = createFiberFromText$1(textContent, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        // Update
        var existing = useFiber(current, expirationTime);
        return existing.pendingProps = textContent, existing.return = returnFiber, existing;
    }
    function updateElement(returnFiber, current, element, expirationTime) {
        if (null === current || current.type !== element.type) {
            // Insert
            var created = createFiberFromElement$1(element, returnFiber.internalContextTag, expirationTime);
            return created.ref = coerceRef(current, element), created.return = returnFiber, 
            created;
        }
        // Move based on index
        var existing = useFiber(current, expirationTime);
        return existing.ref = coerceRef(current, element), existing.pendingProps = element.props, 
        existing.return = returnFiber, existing;
    }
    function updateCall(returnFiber, current, call, expirationTime) {
        // TODO: Should this also compare handler to determine whether to reuse?
        if (null === current || current.tag !== CallComponent$2) {
            // Insert
            var created = createFiberFromCall$1(call, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        // Move based on index
        var existing = useFiber(current, expirationTime);
        return existing.pendingProps = call, existing.return = returnFiber, existing;
    }
    function updateReturn(returnFiber, current, returnNode, expirationTime) {
        if (null === current || current.tag !== ReturnComponent$2) {
            // Insert
            var created = createFiberFromReturn$1(returnNode, returnFiber.internalContextTag, expirationTime);
            return created.type = returnNode.value, created.return = returnFiber, created;
        }
        // Move based on index
        var existing = useFiber(current, expirationTime);
        return existing.type = returnNode.value, existing.return = returnFiber, existing;
    }
    function updatePortal(returnFiber, current, portal, expirationTime) {
        if (null === current || current.tag !== HostPortal$4 || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) {
            // Insert
            var created = createFiberFromPortal$1(portal, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        // Update
        var existing = useFiber(current, expirationTime);
        return existing.pendingProps = portal.children || [], existing.return = returnFiber, 
        existing;
    }
    function updateFragment(returnFiber, current, fragment, expirationTime) {
        if (null === current || current.tag !== Fragment$2) {
            // Insert
            var created = createFiberFromFragment$1(fragment, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        // Update
        var existing = useFiber(current, expirationTime);
        return existing.pendingProps = fragment, existing.return = returnFiber, existing;
    }
    function createChild(returnFiber, newChild, expirationTime) {
        if ("string" == typeof newChild || "number" == typeof newChild) {
            // Text nodes don't have keys. If the previous node is implicitly keyed
            // we can continue to replace it without aborting even if it is not a text
            // node.
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
        // Update the fiber if the keys match, otherwise return null.
        var key = null !== oldFiber ? oldFiber.key : null;
        if ("string" == typeof newChild || "number" == typeof newChild) // Text nodes don't have keys. If the previous node is implicitly keyed
        // we can continue to replace it without aborting even if it is not a text
        // node.
        // Text nodes don't have keys. If the previous node is implicitly keyed
        // we can continue to replace it without aborting even if it is not a text
        // node.
        return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, expirationTime);
        if ("object" == typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, expirationTime) : null;

              case REACT_CALL_TYPE:
                return newChild.key === key ? updateCall(returnFiber, oldFiber, newChild, expirationTime) : null;

              case REACT_RETURN_TYPE:
                // Returns don't have keys. If the previous node is implicitly keyed
                // we can continue to replace it without aborting even if it is not a
                // yield.
                // Returns don't have keys. If the previous node is implicitly keyed
                // we can continue to replace it without aborting even if it is not a
                // yield.
                return null === key ? updateReturn(returnFiber, oldFiber, newChild, expirationTime) : null;

              case REACT_PORTAL_TYPE:
                return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, expirationTime) : null;
            }
            if (isArray$1(newChild) || getIteratorFn(newChild)) // Fragments don't have keys so if the previous key is implicit we can
            // update it.
            // Fragments don't have keys so if the previous key is implicit we can
            // update it.
            return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, expirationTime);
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
    /**
   * Warns if there is a duplicate or missing key
   */
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, expirationTime) {
        for (// This algorithm can't optimize by searching from boths ends since we
        // don't have backpointers on fibers. I'm trying to see how far we can get
        // with that model. If it ends up not being worth the tradeoffs, we can
        // add it later.
        // Even with a two ended optimization, we'd want to optimize for the case
        // where there are few changes and brute force the comparison instead of
        // going for the Map. It'd like to explore hitting that path first in
        // forward-only mode and only go for the Map once we notice that we need
        // lots of look ahead. This doesn't handle reversal as well as two ended
        // search but that's unusual. Besides, for the two ended optimization to
        // work on Iterables, we'd need to copy the whole set.
        // In this first iteration, we'll just live with hitting the bad case
        // (adding everything to a Map) in for every insert/move.
        // If you change this code, also update reconcileChildrenIterator() which
        // uses the same algorithm.
        var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, lastPlacedIndex = 0, newIdx = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
            oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
            var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);
            if (null === newFiber) {
                // TODO: This breaks on empty slots like null children. That's
                // unfortunate because it triggers the slow path all the time. We need
                // a better way to communicate whether this was a miss or null,
                // boolean, undefined, etc.
                null === oldFiber && (oldFiber = nextOldFiber);
                break;
            }
            shouldTrackSideEffects && oldFiber && null === newFiber.alternate && // We matched the slot, but we didn't reuse the existing fiber, so we
            // need to delete the existing child.
            deleteChild(returnFiber, oldFiber), lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx), 
            null === previousNewFiber ? // TODO: Move out of the loop. This only happens for the first run.
            resultingFirstChild = newFiber : // TODO: Defer siblings if we're not at the right index for this slot.
            // I.e. if we had null values before, then we want to defer this
            // for each null value. However, we also don't want to call updateSlot
            // with the previous one.
            previousNewFiber.sibling = newFiber, previousNewFiber = newFiber, oldFiber = nextOldFiber;
        }
        if (newIdx === newChildren.length) // We've reached the end of the new children. We can delete the rest.
        return deleteRemainingChildren(returnFiber, oldFiber), resultingFirstChild;
        if (null === oldFiber) {
            // If we don't have any more existing children we can choose a fast path
            // since the rest will all be insertions.
            for (;newIdx < newChildren.length; newIdx++) {
                var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);
                _newFiber && (lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx), 
                null === previousNewFiber ? // TODO: Move out of the loop. This only happens for the first run.
                resultingFirstChild = _newFiber : previousNewFiber.sibling = _newFiber, previousNewFiber = _newFiber);
            }
            return resultingFirstChild;
        }
        // Keep scanning and use the map to restore deleted items as moves.
        for (// Add all children to a key map for quick lookups.
        var existingChildren = mapRemainingChildren(returnFiber, oldFiber); newIdx < newChildren.length; newIdx++) {
            var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], expirationTime);
            _newFiber2 && (shouldTrackSideEffects && null !== _newFiber2.alternate && // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren.delete(null === _newFiber2.key ? newIdx : _newFiber2.key), lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx), 
            null === previousNewFiber ? resultingFirstChild = _newFiber2 : previousNewFiber.sibling = _newFiber2, 
            previousNewFiber = _newFiber2);
        }
        // Any existing children that weren't consumed above were deleted. We need
        // to add them to the deletion list.
        return shouldTrackSideEffects && existingChildren.forEach(function(child) {
            return deleteChild(returnFiber, child);
        }), resultingFirstChild;
    }
    function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildrenIterable, expirationTime) {
        // This is the same implementation as reconcileChildrenArray(),
        // but using the iterator instead.
        var iteratorFn = getIteratorFn(newChildrenIterable);
        invariant("function" == typeof iteratorFn, "An object is not an iterable. This error is likely caused by a bug in " + "React. Please file an issue.");
        var newChildren = iteratorFn.call(newChildrenIterable);
        invariant(null != newChildren, "An iterable object provided no iterator.");
        for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, lastPlacedIndex = 0, newIdx = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, 
        step = newChildren.next()) {
            oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
            var newFiber = updateSlot(returnFiber, oldFiber, step.value, expirationTime);
            if (null === newFiber) {
                // TODO: This breaks on empty slots like null children. That's
                // unfortunate because it triggers the slow path all the time. We need
                // a better way to communicate whether this was a miss or null,
                // boolean, undefined, etc.
                oldFiber || (oldFiber = nextOldFiber);
                break;
            }
            shouldTrackSideEffects && oldFiber && null === newFiber.alternate && // We matched the slot, but we didn't reuse the existing fiber, so we
            // need to delete the existing child.
            deleteChild(returnFiber, oldFiber), lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx), 
            null === previousNewFiber ? // TODO: Move out of the loop. This only happens for the first run.
            resultingFirstChild = newFiber : // TODO: Defer siblings if we're not at the right index for this slot.
            // I.e. if we had null values before, then we want to defer this
            // for each null value. However, we also don't want to call updateSlot
            // with the previous one.
            previousNewFiber.sibling = newFiber, previousNewFiber = newFiber, oldFiber = nextOldFiber;
        }
        if (step.done) // We've reached the end of the new children. We can delete the rest.
        return deleteRemainingChildren(returnFiber, oldFiber), resultingFirstChild;
        if (null === oldFiber) {
            // If we don't have any more existing children we can choose a fast path
            // since the rest will all be insertions.
            for (;!step.done; newIdx++, step = newChildren.next()) {
                var _newFiber3 = createChild(returnFiber, step.value, expirationTime);
                null !== _newFiber3 && (lastPlacedIndex = placeChild(_newFiber3, lastPlacedIndex, newIdx), 
                null === previousNewFiber ? // TODO: Move out of the loop. This only happens for the first run.
                resultingFirstChild = _newFiber3 : previousNewFiber.sibling = _newFiber3, previousNewFiber = _newFiber3);
            }
            return resultingFirstChild;
        }
        // Keep scanning and use the map to restore deleted items as moves.
        for (// Add all children to a key map for quick lookups.
        var existingChildren = mapRemainingChildren(returnFiber, oldFiber); !step.done; newIdx++, 
        step = newChildren.next()) {
            var _newFiber4 = updateFromMap(existingChildren, returnFiber, newIdx, step.value, expirationTime);
            null !== _newFiber4 && (shouldTrackSideEffects && null !== _newFiber4.alternate && // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren.delete(null === _newFiber4.key ? newIdx : _newFiber4.key), lastPlacedIndex = placeChild(_newFiber4, lastPlacedIndex, newIdx), 
            null === previousNewFiber ? resultingFirstChild = _newFiber4 : previousNewFiber.sibling = _newFiber4, 
            previousNewFiber = _newFiber4);
        }
        // Any existing children that weren't consumed above were deleted. We need
        // to add them to the deletion list.
        return shouldTrackSideEffects && existingChildren.forEach(function(child) {
            return deleteChild(returnFiber, child);
        }), resultingFirstChild;
    }
    function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, expirationTime) {
        // There's no need to check for keys on text nodes since we don't have a
        // way to define them.
        if (null !== currentFirstChild && currentFirstChild.tag === HostText$3) {
            // We already have an existing node so let's just update it and delete
            // the rest.
            deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
            var existing = useFiber(currentFirstChild, expirationTime);
            return existing.pendingProps = textContent, existing.return = returnFiber, existing;
        }
        // The existing first child is not a text node so we need to create one
        // and delete the existing ones.
        deleteRemainingChildren(returnFiber, currentFirstChild);
        var created = createFiberFromText$1(textContent, returnFiber.internalContextTag, expirationTime);
        return created.return = returnFiber, created;
    }
    function reconcileSingleElement(returnFiber, currentFirstChild, element, expirationTime) {
        for (var key = element.key, child = currentFirstChild; null !== child; ) {
            // TODO: If key === null and child.key === null, then this only applies to
            // the first item in the list.
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
            // TODO: If key === null and child.key === null, then this only applies to
            // the first item in the list.
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
        // There's no need to check for keys on yields since they're stateless.
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
            // TODO: If key === null and child.key === null, then this only applies to
            // the first item in the list.
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
    // This API will tag the children with the side-effect of the reconciliation
    // itself. They will be added to the side-effect list as we pass through the
    // children and the parent.
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
        // This function is not recursive.
        // If the top level item is an array, we treat it as a set of children,
        // not as a fragment. Nested arrays on the other hand will be treated as
        // fragment nodes. Recursion happens at the normal flow.
        // Handle object types
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
        if (isObject && throwOnInvalidObjectType(returnFiber, newChild), void 0 === newChild) // If the new child is undefined, and the return fiber is a composite
        // component, throw an error. If Fiber return types are disabled,
        // we already threw above.
        switch (returnFiber.tag) {
          case ClassComponent$7:
          // Intentionally fall through to the next case, which handles both
            // functions and classes
            // eslint-disable-next-lined no-fallthrough
            case FunctionalComponent$2:
            var Component = returnFiber.type;
            invariant(!1, "%s(...): Nothing was returned from render. This usually means a " + "return statement is missing. Or, to render nothing, " + "return null.", Component.displayName || Component.name || "Component");
        }
        // Remaining cases are all treated as empty.
        return deleteRemainingChildren(returnFiber, currentFirstChild);
    }
    return reconcileChildFibers;
}

var reconcileChildFibers$1 = ChildReconciler(!0, !0), reconcileChildFibersInPlace$1 = ChildReconciler(!1, !0), mountChildFibersInPlace$1 = ChildReconciler(!1, !1), cloneChildFibers$1 = function(current, workInProgress) {
    if (invariant(null === current || workInProgress.child === current.child, "Resuming work not yet implemented."), 
    null !== workInProgress.child) {
        var currentChild = workInProgress.child, newChild = createWorkInProgress$2(currentChild, currentChild.expirationTime);
        for (// TODO: Pass this as an argument, since it's easy to forget.
        newChild.pendingProps = currentChild.pendingProps, workInProgress.child = newChild, 
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
}, IndeterminateComponent$2 = ReactTypeOfWork.IndeterminateComponent, FunctionalComponent$1 = ReactTypeOfWork.FunctionalComponent, ClassComponent$5 = ReactTypeOfWork.ClassComponent, HostRoot$4 = ReactTypeOfWork.HostRoot, HostComponent$5 = ReactTypeOfWork.HostComponent, HostText$2 = ReactTypeOfWork.HostText, HostPortal$3 = ReactTypeOfWork.HostPortal, CallComponent$1 = ReactTypeOfWork.CallComponent, CallHandlerPhase = ReactTypeOfWork.CallHandlerPhase, ReturnComponent$1 = ReactTypeOfWork.ReturnComponent, Fragment$1 = ReactTypeOfWork.Fragment, PerformedWork$1 = ReactTypeOfSideEffect.PerformedWork, Placement$2 = ReactTypeOfSideEffect.Placement, ContentReset$1 = ReactTypeOfSideEffect.ContentReset, Err$1 = ReactTypeOfSideEffect.Err, Ref$1 = ReactTypeOfSideEffect.Ref, ReactCurrentOwner$3 = ReactGlobalSharedState_1.ReactCurrentOwner, mountChildFibersInPlace = ReactChildFiber.mountChildFibersInPlace, reconcileChildFibers = ReactChildFiber.reconcileChildFibers, reconcileChildFibersInPlace = ReactChildFiber.reconcileChildFibersInPlace, cloneChildFibers = ReactChildFiber.cloneChildFibers, processUpdateQueue = ReactFiberUpdateQueue.processUpdateQueue, getMaskedContext$1 = ReactFiberContext.getMaskedContext, getUnmaskedContext$1 = ReactFiberContext.getUnmaskedContext, hasContextChanged$1 = ReactFiberContext.hasContextChanged, pushContextProvider$1 = ReactFiberContext.pushContextProvider, pushTopLevelContextObject$1 = ReactFiberContext.pushTopLevelContextObject, invalidateContextProvider$1 = ReactFiberContext.invalidateContextProvider, NoWork$4 = ReactFiberExpirationTime.NoWork, Never$2 = ReactFiberExpirationTime.Never, ReactFiberBeginWork = function(config, hostContext, hydrationContext, scheduleWork, computeExpirationForFiber) {
    var shouldSetTextContent = config.shouldSetTextContent, useSyncScheduling = config.useSyncScheduling, shouldDeprioritizeSubtree = config.shouldDeprioritizeSubtree, pushHostContext = hostContext.pushHostContext, pushHostContainer = hostContext.pushHostContainer, enterHydrationState = hydrationContext.enterHydrationState, resetHydrationState = hydrationContext.resetHydrationState, tryToClaimNextHydratableInstance = hydrationContext.tryToClaimNextHydratableInstance, _ReactFiberClassCompo = ReactFiberClassComponent(scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState), adoptClassInstance = _ReactFiberClassCompo.adoptClassInstance, constructClassInstance = _ReactFiberClassCompo.constructClassInstance, mountClassInstance = _ReactFiberClassCompo.mountClassInstance, updateClassInstance = _ReactFiberClassCompo.updateClassInstance;
    // TODO: Remove this and use reconcileChildrenAtExpirationTime directly.
    function reconcileChildren(current, workInProgress, nextChildren) {
        reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, workInProgress.expirationTime);
    }
    function reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, renderExpirationTime) {
        null === current ? // If this is a fresh new component that hasn't been rendered yet, we
        // won't update its child set by applying minimal side-effects. Instead,
        // we will add them all to the child before it gets rendered. That means
        // we can optimize this reconciliation pass by not tracking side-effects.
        workInProgress.child = mountChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime) : current.child === workInProgress.child ? // If the current child is the same as the work in progress, it means that
        // we haven't yet started any work on these children. Therefore, we use
        // the clone algorithm to create a copy of all the current children.
        // If we had any progressed work already, that is invalid at this point so
        // let's throw it out.
        workInProgress.child = reconcileChildFibers(workInProgress, workInProgress.child, nextChildren, renderExpirationTime) : // If, on the other hand, it is already using a clone, that means we've
        // already begun some work on this tree and we can continue where we left
        // off by reconciling against the existing children.
        workInProgress.child = reconcileChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime);
    }
    function updateFragment(current, workInProgress) {
        var nextChildren = workInProgress.pendingProps;
        if (hasContextChanged$1()) // Normally we can bail out on props equality but if context has changed
        // we don't do the bailout and we have to reuse existing props instead.
        null === nextChildren && (nextChildren = workInProgress.memoizedProps); else if (null === nextChildren || workInProgress.memoizedProps === nextChildren) return bailoutOnAlreadyFinishedWork(current, workInProgress);
        return reconcileChildren(current, workInProgress, nextChildren), memoizeProps(workInProgress, nextChildren), 
        workInProgress.child;
    }
    function markRef(current, workInProgress) {
        var ref = workInProgress.ref;
        null === ref || current && current.ref === ref || (// Schedule a Ref effect
        workInProgress.effectTag |= Ref$1);
    }
    function updateFunctionalComponent(current, workInProgress) {
        var fn = workInProgress.type, nextProps = workInProgress.pendingProps, memoizedProps = workInProgress.memoizedProps;
        if (hasContextChanged$1()) // Normally we can bail out on props equality but if context has changed
        // we don't do the bailout and we have to reuse existing props instead.
        null === nextProps && (nextProps = memoizedProps); else if (null === nextProps || memoizedProps === nextProps) return bailoutOnAlreadyFinishedWork(current, workInProgress);
        var nextChildren, unmaskedContext = getUnmaskedContext$1(workInProgress), context = getMaskedContext$1(workInProgress, unmaskedContext);
        // React DevTools reads this flag.
        return nextChildren = fn(nextProps, context), workInProgress.effectTag |= PerformedWork$1, 
        reconcileChildren(current, workInProgress, nextChildren), memoizeProps(workInProgress, nextProps), 
        workInProgress.child;
    }
    function updateClassComponent(current, workInProgress, renderExpirationTime) {
        // Push context providers early to prevent context stack mismatches.
        // During mounting we don't know the child context yet as the instance doesn't exist.
        // We will invalidate the child context in finishClassComponent() right after rendering.
        var hasContext = pushContextProvider$1(workInProgress), shouldUpdate = void 0;
        // In the initial pass we might need to construct the instance.
        return null === current ? workInProgress.stateNode ? invariant(!1, "Resuming work not yet implemented.") : (constructClassInstance(workInProgress, workInProgress.pendingProps), 
        mountClassInstance(workInProgress, renderExpirationTime), shouldUpdate = !0) : shouldUpdate = updateClassInstance(current, workInProgress, renderExpirationTime), 
        finishClassComponent(current, workInProgress, shouldUpdate, hasContext);
    }
    function finishClassComponent(current, workInProgress, shouldUpdate, hasContext) {
        if (// Refs should update even if shouldComponentUpdate returns false
        markRef(current, workInProgress), !shouldUpdate) // Context providers should defer to sCU for rendering
        return hasContext && invalidateContextProvider$1(workInProgress, !1), bailoutOnAlreadyFinishedWork(current, workInProgress);
        var instance = workInProgress.stateNode;
        // Rerender
        ReactCurrentOwner$3.current = workInProgress;
        var nextChildren = void 0;
        // React DevTools reads this flag.
        // Memoize props and state using the values we just used to render.
        // TODO: Restructure so we never read values from the instance.
        // The context might have changed so we need to recalculate it.
        return nextChildren = instance.render(), workInProgress.effectTag |= PerformedWork$1, 
        reconcileChildren(current, workInProgress, nextChildren), memoizeState(workInProgress, instance.state), 
        memoizeProps(workInProgress, instance.props), hasContext && invalidateContextProvider$1(workInProgress, !0), 
        workInProgress.child;
    }
    function pushHostRootContext(workInProgress) {
        var root = workInProgress.stateNode;
        root.pendingContext ? pushTopLevelContextObject$1(workInProgress, root.pendingContext, root.pendingContext !== root.context) : root.context && // Should always be set
        pushTopLevelContextObject$1(workInProgress, root.context, !1), pushHostContainer(workInProgress, root.containerInfo);
    }
    function updateHostRoot(current, workInProgress, renderExpirationTime) {
        pushHostRootContext(workInProgress);
        var updateQueue = workInProgress.updateQueue;
        if (null !== updateQueue) {
            var prevState = workInProgress.memoizedState, state = processUpdateQueue(current, workInProgress, updateQueue, null, null, renderExpirationTime);
            if (prevState === state) // If the state is the same as before, that's a bailout because we had
            // no work that expires at this time.
            return resetHydrationState(), bailoutOnAlreadyFinishedWork(current, workInProgress);
            var element = state.element, root = workInProgress.stateNode;
            // If we don't have any current children this might be the first pass.
            // We always try to hydrate. If this isn't a hydration pass there won't
            // be any children to hydrate which is effectively the same thing as
            // not hydrating.
            // This is a bit of a hack. We track the host root as a placement to
            // know that we're currently in a mounting state. That way isMounted
            // works as expected. We must reset this before committing.
            // TODO: Delete this when we delete isMounted and findDOMNode.
            // Ensure that children mount into this root without tracking
            // side-effects. This ensures that we don't store Placement effects on
            // nodes that will be hydrated.
            // Otherwise reset hydration state in case we aborted and resumed another
            // root.
            return (null === current || null === current.child) && root.hydrate && enterHydrationState(workInProgress) ? (workInProgress.effectTag |= Placement$2, 
            workInProgress.child = mountChildFibersInPlace(workInProgress, workInProgress.child, element, renderExpirationTime)) : (resetHydrationState(), 
            reconcileChildren(current, workInProgress, element)), memoizeState(workInProgress, state), 
            workInProgress.child;
        }
        // If there is no update queue, that's a bailout because the root has no props.
        return resetHydrationState(), bailoutOnAlreadyFinishedWork(current, workInProgress);
    }
    function updateHostComponent(current, workInProgress, renderExpirationTime) {
        pushHostContext(workInProgress), null === current && tryToClaimNextHydratableInstance(workInProgress);
        var type = workInProgress.type, memoizedProps = workInProgress.memoizedProps, nextProps = workInProgress.pendingProps;
        null === nextProps && (nextProps = memoizedProps, invariant(null !== nextProps, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue."));
        var prevProps = null !== current ? current.memoizedProps : null;
        if (hasContextChanged$1()) ; else if (null === nextProps || memoizedProps === nextProps) return bailoutOnAlreadyFinishedWork(current, workInProgress);
        var nextChildren = nextProps.children;
        // Check the host config to see if the children are offscreen/hidden.
        // We special case a direct text child of a host node. This is a common
        // case. We won't handle it as a reified child. We will instead handle
        // this in the host environment that also have access to this prop. That
        // avoids allocating another HostText fiber and traversing it.
        // If we're switching from a direct text child to a normal child, or to
        // empty, we need to schedule the text content to be reset.
        // Check the host config to see if the children are offscreen/hidden.
        // Down-prioritize the children.
        return shouldSetTextContent(type, nextProps) ? nextChildren = null : prevProps && shouldSetTextContent(type, prevProps) && (workInProgress.effectTag |= ContentReset$1), 
        markRef(current, workInProgress), renderExpirationTime !== Never$2 && !useSyncScheduling && shouldDeprioritizeSubtree(type, nextProps) ? (workInProgress.expirationTime = Never$2, 
        null) : (reconcileChildren(current, workInProgress, nextChildren), memoizeProps(workInProgress, nextProps), 
        workInProgress.child);
    }
    function updateHostText(current, workInProgress) {
        null === current && tryToClaimNextHydratableInstance(workInProgress);
        var nextProps = workInProgress.pendingProps;
        // Nothing to do here. This is terminal. We'll do the completion step
        // immediately after.
        return null === nextProps && (nextProps = workInProgress.memoizedProps), memoizeProps(workInProgress, nextProps), 
        null;
    }
    function mountIndeterminateComponent(current, workInProgress, renderExpirationTime) {
        invariant(null === current, "An indeterminate component should never have mounted. This error is " + "likely caused by a bug in React. Please file an issue.");
        var value, fn = workInProgress.type, props = workInProgress.pendingProps, unmaskedContext = getUnmaskedContext$1(workInProgress), context = getMaskedContext$1(workInProgress, unmaskedContext);
        if (value = fn(props, context), // React DevTools reads this flag.
        workInProgress.effectTag |= PerformedWork$1, "object" == typeof value && null !== value && "function" == typeof value.render) {
            // Proceed under the assumption that this is a class instance
            workInProgress.tag = ClassComponent$5;
            // Push context providers early to prevent context stack mismatches.
            // During mounting we don't know the child context yet as the instance doesn't exist.
            // We will invalidate the child context in finishClassComponent() right after rendering.
            var hasContext = pushContextProvider$1(workInProgress);
            return adoptClassInstance(workInProgress, value), mountClassInstance(workInProgress, renderExpirationTime), 
            finishClassComponent(current, workInProgress, !0, hasContext);
        }
        // Proceed under the assumption that this is a functional component
        return workInProgress.tag = FunctionalComponent$1, reconcileChildren(current, workInProgress, value), 
        memoizeProps(workInProgress, props), workInProgress.child;
    }
    function updateCallComponent(current, workInProgress, renderExpirationTime) {
        var nextCall = workInProgress.pendingProps;
        hasContextChanged$1() ? // Normally we can bail out on props equality but if context has changed
        // we don't do the bailout and we have to reuse existing props instead.
        null === nextCall && (nextCall = current && current.memoizedProps, invariant(null !== nextCall, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue.")) : null !== nextCall && workInProgress.memoizedProps !== nextCall || (nextCall = workInProgress.memoizedProps);
        var nextChildren = nextCall.children;
        // This doesn't take arbitrary time so we could synchronously just begin
        // eagerly do the work of workInProgress.child as an optimization.
        // The following is a fork of reconcileChildrenAtExpirationTime but using
        // stateNode to store the child.
        return null === current ? workInProgress.stateNode = mountChildFibersInPlace(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime) : current.child === workInProgress.child ? workInProgress.stateNode = reconcileChildFibers(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime) : workInProgress.stateNode = reconcileChildFibersInPlace(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime), 
        memoizeProps(workInProgress, nextCall), workInProgress.stateNode;
    }
    function updatePortalComponent(current, workInProgress, renderExpirationTime) {
        pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
        var nextChildren = workInProgress.pendingProps;
        if (hasContextChanged$1()) // Normally we can bail out on props equality but if context has changed
        // we don't do the bailout and we have to reuse existing props instead.
        null === nextChildren && (nextChildren = current && current.memoizedProps, invariant(null != nextChildren, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue.")); else if (null === nextChildren || workInProgress.memoizedProps === nextChildren) return bailoutOnAlreadyFinishedWork(current, workInProgress);
        // Portals are special because we don't append the children during mount
        // but at commit. Therefore we need to track insertions which the normal
        // flow doesn't do during mount. This doesn't happen at the root because
        // the root always starts with a "current" with a null child.
        // TODO: Consider unifying this with how the root works.
        return null === current ? (workInProgress.child = reconcileChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime), 
        memoizeProps(workInProgress, nextChildren)) : (reconcileChildren(current, workInProgress, nextChildren), 
        memoizeProps(workInProgress, nextChildren)), workInProgress.child;
    }
    /*
  function reuseChildrenEffects(returnFiber : Fiber, firstChild : Fiber) {
    let child = firstChild;
    do {
      // Ensure that the first and last effect of the parent corresponds
      // to the children's first and last effect.
      if (!returnFiber.firstEffect) {
        returnFiber.firstEffect = child.firstEffect;
      }
      if (child.lastEffect) {
        if (returnFiber.lastEffect) {
          returnFiber.lastEffect.nextEffect = child.firstEffect;
        }
        returnFiber.lastEffect = child.lastEffect;
      }
    } while (child = child.sibling);
  }
  */
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
        // TODO: What if this is currently in progress?
        // How can that happen? How is this not being cloned?
        return null;
    }
    // TODO: Delete memoizeProps/State and move to reconcile/bailout instead
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
            // This is a restart. Reset the tag to the initial phase.
            workInProgress.tag = CallComponent$1;

          // Intentionally fall through since this is now the same.
            case CallComponent$1:
            return updateCallComponent(current, workInProgress, renderExpirationTime);

          case ReturnComponent$1:
            // A return component is just a placeholder, we can just run through the
            // next one immediately.
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
        // Push context providers here to avoid a push/pop context mismatch.
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
        if (// Add an error effect so we can handle the error during the commit phase
        workInProgress.effectTag |= Err$1, // This is a weird case where we do "resume" work — work that failed on
        // our first attempt. Because we no longer have a notion of "progressed
        // deletions," reset the child to the current child to make sure we delete
        // it again. TODO: Find a better way to handle this, perhaps during a more
        // general overhaul of error handling.
        null === current ? workInProgress.child = null : workInProgress.child !== current.child && (workInProgress.child = current.child), 
        workInProgress.expirationTime === NoWork$4 || workInProgress.expirationTime > renderExpirationTime) return bailoutOnLowPriority(current, workInProgress);
        if (// If we don't bail out, we're going be recomputing our children so we need
        // to drop our effect list.
        workInProgress.firstEffect = null, workInProgress.lastEffect = null, reconcileChildrenAtExpirationTime(current, workInProgress, null, renderExpirationTime), 
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
        // Tag the fiber with an update effect. This turns a Placement into
        // an UpdateAndPlacement.
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
        // First step of the call has completed. Now we need to do the second.
        // TODO: It would be nice to have a multi stage call represented by a
        // single component, or at least tail call optimize nested ones. Currently
        // that requires additional fields that we don't want to add to the fiber.
        // So this requires nested handlers.
        // Note: This doesn't mutate the alternate node. I don't think it needs to
        // since this stage is reset for every pass.
        workInProgress.tag = CallHandlerPhase$1;
        // Build up the returns.
        // TODO: Compare this to a generator or opaque helpers like Children.
        var returns = [];
        appendAllReturns(returns, workInProgress);
        var fn = call.handler, props = call.props, nextChildren = fn(props, returns), currentFirstChild = null !== current ? current.child : null;
        return workInProgress.child = reconcileChildFibers$2(workInProgress, currentFirstChild, nextChildren, renderExpirationTime), 
        workInProgress.child;
    }
    function appendAllChildren(parent, workInProgress) {
        for (// We only have the top Fiber that was created but we need recurse down its
        // children to find all the terminal nodes.
        var node = workInProgress.child; null !== node; ) {
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
    if (mutation) ReactFeatureFlagsWww.enableMutatingReconciler ? (// Mutation mode
    updateHostContainer = function(workInProgress) {}, updateHostComponent = function(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
        // TODO: Type this specific to this type of component.
        workInProgress.updateQueue = updatePayload, // If the update payload indicates that there is a change or if there
        // is a new ref we mark this as an update. All the work is done in commitWork.
        updatePayload && markUpdate(workInProgress);
    }, updateHostText = function(current, workInProgress, oldText, newText) {
        // If the text differs, mark it as an update. All the work in done in commitWork.
        oldText !== newText && markUpdate(workInProgress);
    }) : invariant(!1, "Mutating reconciler is disabled."); else if (persistence) if (ReactFeatureFlagsWww.enablePersistentReconciler) {
        // Persistent host tree mode
        var cloneInstance = persistence.cloneInstance, createContainerChildSet = persistence.createContainerChildSet, appendChildToContainerChildSet = persistence.appendChildToContainerChildSet, finalizeContainerChildren = persistence.finalizeContainerChildren, appendAllChildrenToContainer = function(containerChildSet, workInProgress) {
            for (// We only have the top Fiber that was created but we need recurse down its
            // children to find all the terminal nodes.
            var node = workInProgress.child; null !== node; ) {
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
                portalOrRoot.pendingChildren = newChildSet, // If children might have changed, we have to add them all to the set.
                appendAllChildrenToContainer(newChildSet, workInProgress), // Schedule an update on the container to swap out the container.
                markUpdate(workInProgress);
            }
        }, updateHostComponent = function(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
            // If there are no effects associated with this node, then none of our children had any updates.
            // This guarantees that we can reuse all of them.
            var childrenUnchanged = null === workInProgress.firstEffect, currentInstance = current.stateNode;
            if (childrenUnchanged && null === updatePayload) // No changes, just reuse the existing instance.
            // Note that this might release a previous clone.
            workInProgress.stateNode = currentInstance; else {
                var recyclableInstance = workInProgress.stateNode, newInstance = cloneInstance(currentInstance, updatePayload, type, oldProps, newProps, workInProgress, childrenUnchanged, recyclableInstance);
                finalizeInitialChildren(newInstance, type, newProps, rootContainerInstance) && markUpdate(workInProgress), 
                workInProgress.stateNode = newInstance, childrenUnchanged ? // If there are no other effects in this tree, we need to flag this node as having one.
                // Even though we're not going to use it for anything.
                // Otherwise parents won't know that there are new children to propagate upwards.
                markUpdate(workInProgress) : // If children might have changed, we have to add them all to the set.
                appendAllChildren(newInstance, workInProgress);
            }
        }, updateHostText = function(current, workInProgress, oldText, newText) {
            if (oldText !== newText) {
                // If the text content differs, we'll create a new text instance for it.
                var rootContainerInstance = getRootHostContainer(), currentHostContext = getHostContext();
                workInProgress.stateNode = createTextInstance(newText, rootContainerInstance, currentHostContext, workInProgress), 
                // We'll have to mark it as having an effect, even though we won't use the effect for anything.
                // This lets the parents know that at least one of their children has changed.
                markUpdate(workInProgress);
            }
        };
    } else invariant(!1, "Persistent reconciler is disabled."); else ReactFeatureFlagsWww.enableNoopReconciler ? (// No host operations
    updateHostContainer = function(workInProgress) {}, updateHostComponent = function(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {}, 
    updateHostText = function(current, workInProgress, oldText, newText) {}) : invariant(!1, "Noop reconciler is disabled.");
    function completeWork(current, workInProgress, renderExpirationTime) {
        // Get the latest props.
        var newProps = workInProgress.pendingProps;
        switch (null === newProps ? newProps = workInProgress.memoizedProps : workInProgress.expirationTime === Never$3 && renderExpirationTime !== Never$3 || (// Reset the pending props, unless this was a down-prioritization.
        workInProgress.pendingProps = null), workInProgress.tag) {
          case FunctionalComponent$3:
            return null;

          case ClassComponent$8:
            // We are leaving this subtree, so pop context if any.
            return popContextProvider$2(workInProgress), null;

          case HostRoot$6:
            popHostContainer(workInProgress), popTopLevelContextObject$1(workInProgress);
            var fiberRoot = workInProgress.stateNode;
            // If we hydrated, pop so that we can delete any remaining children
            // that weren't hydrated.
            // This resets the hacky state to fix isMounted before committing.
            // TODO: Delete this when we delete isMounted and findDOMNode.
            return fiberRoot.pendingContext && (fiberRoot.context = fiberRoot.pendingContext, 
            fiberRoot.pendingContext = null), null !== current && null !== current.child || (popHydrationState(workInProgress), 
            workInProgress.effectTag &= ~Placement$4), updateHostContainer(workInProgress), 
            null;

          case HostComponent$6:
            popHostContext(workInProgress);
            var rootContainerInstance = getRootHostContainer(), type = workInProgress.type;
            if (null !== current && null != workInProgress.stateNode) {
                // If we have an alternate, that means this is an update and we need to
                // schedule a side-effect to do the updates.
                var oldProps = current.memoizedProps, instance = workInProgress.stateNode, currentHostContext = getHostContext(), updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);
                updateHostComponent(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance), 
                current.ref !== workInProgress.ref && markRef(workInProgress);
            } else {
                if (!newProps) // This can happen when we abort work.
                return invariant(null !== workInProgress.stateNode, "We must have new props for new mounts. This error is likely " + "caused by a bug in React. Please file an issue."), 
                null;
                var _currentHostContext = getHostContext();
                if (popHydrationState(workInProgress)) // TODO: Move this and createInstance step into the beginPhase
                // to consolidate.
                prepareToHydrateHostInstance(workInProgress, rootContainerInstance, _currentHostContext) && // If changes to the hydrated node needs to be applied at the
                // commit-phase we mark this as such.
                markUpdate(workInProgress); else {
                    var _instance = createInstance(type, newProps, rootContainerInstance, _currentHostContext, workInProgress);
                    appendAllChildren(_instance, workInProgress), // Certain renderers require commit-time effects for initial mount.
                    // (eg DOM renderer supports auto-focus for certain elements).
                    // Make sure such renderers get scheduled for later work.
                    finalizeInitialChildren(_instance, type, newProps, rootContainerInstance) && markUpdate(workInProgress), 
                    workInProgress.stateNode = _instance;
                }
                null !== workInProgress.ref && // If there is a ref on a host node we need to schedule a callback
                markRef(workInProgress);
            }
            return null;

          case HostText$4:
            var newText = newProps;
            if (current && null != workInProgress.stateNode) {
                var oldText = current.memoizedProps;
                // If we have an alternate, that means this is an update and we need
                // to schedule a side-effect to do the updates.
                updateHostText(current, workInProgress, oldText, newText);
            } else {
                if ("string" != typeof newText) // This can happen when we abort work.
                return invariant(null !== workInProgress.stateNode, "We must have new props for new mounts. This error is likely " + "caused by a bug in React. Please file an issue."), 
                null;
                var _rootContainerInstance = getRootHostContainer(), _currentHostContext2 = getHostContext();
                popHydrationState(workInProgress) ? prepareToHydrateHostTextInstance(workInProgress) && markUpdate(workInProgress) : workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext2, workInProgress);
            }
            return null;

          case CallComponent$3:
            return moveCallToHandlerPhase(current, workInProgress, renderExpirationTime);

          case CallHandlerPhase$1:
            // Reset the tag to now be a first phase call.
            return workInProgress.tag = CallComponent$3, null;

          case ReturnComponent$3:
          case Fragment$3:
            return null;

          case HostPortal$5:
            return popHostContainer(workInProgress), updateHostContainer(workInProgress), null;

          // Error cases
            case IndeterminateComponent$3:
            invariant(!1, "An indeterminate component should have become determinate before " + "completing. This error is likely caused by a bug in React. Please " + "file an issue.");

          // eslint-disable-next-line no-fallthrough
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
    if ("undefined" == typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) // No DevTools
    return !1;
    var hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook.supportsFiber) return !0;
    try {
        var rendererID = hook.inject(internals);
        // We have successfully injected, so now it is safe to set up hooks.
        onCommitFiberRoot = catchErrors(function(root) {
            return hook.onCommitFiberRoot(rendererID, root);
        }), onCommitFiberUnmount = catchErrors(function(fiber) {
            return hook.onCommitFiberUnmount(rendererID, fiber);
        });
    } catch (err) {}
    // DevTools exists
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
            // Renderers may schedule work to be done after host components are mounted
            // (eg DOM renderer may schedule auto-focus for inputs and form controls).
            // These effects should only be committed when components are first mounted,
            // aka when there is no current/alternate.
            if (null === current && finishedWork.effectTag & Update$3) {
                var type = finishedWork.type, props = finishedWork.memoizedProps;
                commitMount(_instance2, type, props, finishedWork);
            }
            return;

          case HostText$5:
          case HostPortal$6:
            // We have no life-cycles associated with portals.
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
    // User-originating errors (lifecycles and refs) should not interrupt
    // deletion, so don't let them throw. Host-originating errors should
    // interrupt deletion, so it's okay
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
            // TODO: this is recursive.
            // We are also not using this parent because
            // the portal will get pushed immediately.
            return void (ReactFeatureFlagsWww.enableMutatingReconciler && mutation ? unmountHostComponents(current) : ReactFeatureFlagsWww.enablePersistentReconciler && persistence && emptyPortalContainer(current));
        }
    }
    function commitNestedUnmounts(root) {
        for (// While we're inside a removed host node we don't want to call
        // removeChild on the inner nodes because they're removed by the top
        // call anyway. We also want to call componentWillUnmount on all
        // composites before this host node is removed from the tree. Therefore
        var node = root; !0; ) // Visit children because they may contain more composite or host nodes.
        // Skip portals because commitUnmount() currently visits them recursively.
        if (commitUnmount(node), null === node.child || mutation && node.tag === HostPortal$6) {
            if (node === root) return;
            for (;null === node.sibling; ) {
                if (null === node.return || node.return === root) return;
                node = node.return;
            }
            node.sibling.return = node.return, node = node.sibling;
        } else node.child.return = node, node = node.child;
    }
    function detachFiber(current) {
        // Cut off the return pointers to disconnect it from the tree. Ideally, we
        // should clear the child pointer of the parent alternate to let this
        // get GC:ed but we don't know which for sure which parent is the current
        // one so we'll settle for GC:ing the subtree of this child. This child
        // itself will be GC:ed when the parent updates the next time.
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
        if (ReactFeatureFlagsWww.enablePersistentReconciler || ReactFeatureFlagsWww.enableNoopReconciler) return {
            commitResetTextContent: function(finishedWork) {},
            commitPlacement: function(finishedWork) {},
            commitDeletion: function(current) {
                // Detach refs and call componentWillUnmount() on the whole subtree.
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
        // We're going to search forward into the tree until we find a sibling host
        // node. Unfortunately, if multiple insertions are done in a row we have to
        // search past them. This leads to exponential search for the next sibling.
        var node = fiber;
        siblings: for (;!0; ) {
            // If we didn't find anything, let's try the next sibling.
            for (;null === node.sibling; ) {
                if (null === node.return || isHostParent(node.return)) // If we pop out of the root or hit the parent the fiber we are the
                // last sibling.
                return null;
                node = node.return;
            }
            for (node.sibling.return = node.return, node = node.sibling; node.tag !== HostComponent$7 && node.tag !== HostText$5; ) {
                // If it is not host node and, we might have a host node inside it.
                // Try to search down until we find one.
                if (node.effectTag & Placement$5) // If we don't have a child, try the siblings instead.
                continue siblings;
                // If we don't have a child, try the siblings instead.
                // We also skip portals because they are not part of this host tree.
                if (null === node.child || node.tag === HostPortal$6) continue siblings;
                node.child.return = node, node = node.child;
            }
            // Check if this host node is stable or about to be placed.
            if (!(node.effectTag & Placement$5)) // Found it!
            return node.stateNode;
        }
    }
    function commitPlacement(finishedWork) {
        // Recursively insert all host nodes into the parent.
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
        parentFiber.effectTag & ContentReset$2 && (// Reset the text content of the parent before doing any insertions
        resetTextContent(parent), // Clear ContentReset from the effect tag
        parentFiber.effectTag &= ~ContentReset$2);
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
        for (// We only have the top Fiber that was inserted but we need recurse down its
        var node = current, currentParentIsValid = !1, currentParent = void 0, currentParentIsContainer = void 0; !0; ) {
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
            // After all the children have unmounted, it is now safe to remove the
            // node from the tree.
            currentParentIsContainer ? removeChildFromContainer(currentParent, node.stateNode) : removeChild(currentParent, node.stateNode); else if (node.tag === HostPortal$6) {
                // Visit children because portals might contain host components.
                if (// When we go into a portal, it becomes the parent to remove from.
                // We will reassign it back when we pop the portal on the way up.
                currentParent = node.stateNode.containerInfo, null !== node.child) {
                    node.child.return = node, node = node.child;
                    continue;
                }
            } else // Visit children because we may find more host components below.
            if (commitUnmount(node), null !== node.child) {
                node.child.return = node, node = node.child;
                continue;
            }
            if (node === current) return;
            for (;null === node.sibling; ) {
                if (null === node.return || node.return === current) return;
                node = node.return, node.tag === HostPortal$6 && (// When we go out of the portal, we need to restore the parent.
                // Since we don't keep a stack of them, we will search for it.
                currentParentIsValid = !1);
            }
            node.sibling.return = node.return, node = node.sibling;
        }
    }
    function commitDeletion(current) {
        // Recursively delete all host nodes from the parent.
        // Detach refs and call componentWillUnmount() on the whole subtree.
        unmountHostComponents(current), detachFiber(current);
    }
    function commitWork(current, finishedWork) {
        switch (finishedWork.tag) {
          case ClassComponent$9:
            return;

          case HostComponent$7:
            var instance = finishedWork.stateNode;
            if (null != instance) {
                // Commit the work prepared earlier.
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
    if (ReactFeatureFlagsWww.enableMutatingReconciler) return {
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
        // Push current root instance onto the stack;
        // This allows us to reset root when portals are popped.
        push$2(rootInstanceStackCursor, nextRootInstance, fiber);
        var nextRootContext = getRootHostContext(nextRootInstance);
        // Track the context and the Fiber that provided it.
        // This enables us to pop only Fibers that provide unique contexts.
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
        // Don't push this Fiber's context unless it's unique.
        context !== nextContext && (// Track the context and the Fiber that provided it.
        // This enables us to pop only Fibers that provide unique contexts.
        push$2(contextFiberStackCursor, fiber, fiber), push$2(contextStackCursor, nextContext, fiber));
    }
    function popHostContext(fiber) {
        // Do not pop unless this Fiber provided the current context.
        // pushHostContext() only pushes Fibers that provide unique contexts.
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
    // If this doesn't have hydration mode.
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
        // This might seem like it belongs on progressedFirstDeletion. However,
        // these children are not part of the reconciliation list of children.
        // Even if we abort and rereconcile the children, that will try to hydrate
        // again and the nodes are still in the host tree so these will be
        // recreated.
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
            if (!nextInstance) // Nothing to hydrate. Make it an insertion.
            return insertNonHydratedInstance(hydrationParentFiber, fiber), isHydrating = !1, 
            void (hydrationParentFiber = fiber);
            if (!canHydrate(fiber, nextInstance)) {
                if (!(// If we can't hydrate this instance let's try the next one.
                // We use this as a heuristic. It's based on intuition and not data so it
                // might be flawed or unnecessary.
                nextInstance = getNextHydratableSibling(nextInstance)) || !canHydrate(fiber, nextInstance)) // Nothing to hydrate. Make it an insertion.
                return insertNonHydratedInstance(hydrationParentFiber, fiber), isHydrating = !1, 
                void (hydrationParentFiber = fiber);
                // We matched the next one, we'll now assume that the first one was
                // superfluous and we'll delete it. Since we can't eagerly delete it
                // we'll have to schedule a deletion. To do that, this node needs a dummy
                // fiber associated with it.
                deleteHydratableInstance(hydrationParentFiber, nextHydratableInstance);
            }
            fiber.stateNode = nextInstance, hydrationParentFiber = fiber, nextHydratableInstance = getFirstHydratableChild(nextInstance);
        }
    }
    function prepareToHydrateHostInstance(fiber, rootContainerInstance, hostContext) {
        var instance = fiber.stateNode, updatePayload = hydrateInstance(instance, fiber.type, fiber.memoizedProps, rootContainerInstance, hostContext, fiber);
        // If the update payload indicates that there is a change or if there
        // is a new ref we mark this as an update.
        // TODO: Type this specific to this type of component.
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
        if (fiber !== hydrationParentFiber) // We're deeper than the current hydration context, inside an inserted
        // tree.
        return !1;
        if (!isHydrating) // If we're not currently hydrating but we're in a hydration context, then
        // we were an insertion and now need to pop up reenter hydration of our
        // siblings.
        return popToNextHostParent(fiber), isHydrating = !0, !1;
        var type = fiber.type;
        // If we have any remaining hydratable nodes, we need to delete them now.
        // We only do this deeper than head and body since they tend to have random
        // other nodes in them. We also ignore components with pure text content in
        // side of them.
        // TODO: Better heuristic.
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
    // Allow injected showDialog() to prevent default console.error logging.
    // This enables renderers like ReactNative to better manage redbox behavior.
    if (!1 !== showDialog(capturedError)) {
        var error = capturedError.error;
        // In production, we print the error directly.
        // This will include the message, the JS stack, and anything the browser wants to show.
        // We pass the error object instead of custom message so that the browser displays the error natively.
        console.error(error);
    }
}

var injection = {
    /**
   * Display custom dialog for lifecycle errors.
   * Return false to prevent default behavior of logging to console.error.
   */
    injectDialog: function(fn) {
        invariant(showDialog === defaultShowDialog, "The custom dialog was already injected."), 
        invariant("function" == typeof fn, "Injected showDialog() must be a function."), 
        showDialog = fn;
    }
}, logCapturedError_1 = logCapturedError$1, ReactFiberErrorLogger = {
    injection: injection,
    logCapturedError: logCapturedError_1
}, getStackAddendumByWorkInProgressFiber = ReactFiberComponentTreeHook.getStackAddendumByWorkInProgressFiber, ReactCurrentOwner$2 = ReactGlobalSharedState_1.ReactCurrentOwner, PerformedWork = ReactTypeOfSideEffect.PerformedWork, Placement$1 = ReactTypeOfSideEffect.Placement, Update = ReactTypeOfSideEffect.Update, PlacementAndUpdate = ReactTypeOfSideEffect.PlacementAndUpdate, Deletion = ReactTypeOfSideEffect.Deletion, ContentReset = ReactTypeOfSideEffect.ContentReset, Callback = ReactTypeOfSideEffect.Callback, Err = ReactTypeOfSideEffect.Err, Ref = ReactTypeOfSideEffect.Ref, HostRoot$3 = ReactTypeOfWork.HostRoot, HostComponent$3 = ReactTypeOfWork.HostComponent, HostPortal$2 = ReactTypeOfWork.HostPortal, ClassComponent$3 = ReactTypeOfWork.ClassComponent, popContextProvider$1 = ReactFiberContext.popContextProvider, reset$1 = ReactFiberStack.reset, logCapturedError = ReactFiberErrorLogger.logCapturedError, createWorkInProgress$1 = ReactFiber.createWorkInProgress, onCommitRoot = ReactFiberDevToolsHook.onCommitRoot, NoWork$3 = ReactFiberExpirationTime.NoWork, Sync$1 = ReactFiberExpirationTime.Sync, Never$1 = ReactFiberExpirationTime.Never, msToExpirationTime$1 = ReactFiberExpirationTime.msToExpirationTime, computeExpirationBucket$1 = ReactFiberExpirationTime.computeExpirationBucket, AsyncUpdates = ReactTypeOfInternalContext.AsyncUpdates, getUpdateExpirationTime = ReactFiberUpdateQueue.getUpdateExpirationTime, _require14 = ReactFiberContext, resetContext$1 = _require14.resetContext, ReactFiberInstrumentation$1, ReactFiberScheduler = function(config) {
    var hostContext = ReactFiberHostContext(config), hydrationContext = ReactFiberHydrationContext(config), popHostContainer = hostContext.popHostContainer, popHostContext = hostContext.popHostContext, resetHostContainer = hostContext.resetHostContainer, _ReactFiberBeginWork = ReactFiberBeginWork(config, hostContext, hydrationContext, scheduleWork, computeExpirationForFiber), beginWork = _ReactFiberBeginWork.beginWork, beginFailedWork = _ReactFiberBeginWork.beginFailedWork, _ReactFiberCompleteWo = ReactFiberCompleteWork(config, hostContext, hydrationContext), completeWork = _ReactFiberCompleteWo.completeWork, _ReactFiberCommitWork = ReactFiberCommitWork(config, captureError), commitResetTextContent = _ReactFiberCommitWork.commitResetTextContent, commitPlacement = _ReactFiberCommitWork.commitPlacement, commitDeletion = _ReactFiberCommitWork.commitDeletion, commitWork = _ReactFiberCommitWork.commitWork, commitLifeCycles = _ReactFiberCommitWork.commitLifeCycles, commitAttachRef = _ReactFiberCommitWork.commitAttachRef, commitDetachRef = _ReactFiberCommitWork.commitDetachRef, now = config.now, scheduleDeferredCallback = config.scheduleDeferredCallback, useSyncScheduling = config.useSyncScheduling, prepareForCommit = config.prepareForCommit, resetAfterCommit = config.resetAfterCommit, startTime = now(), mostRecentCurrentTime = msToExpirationTime$1(0), expirationContext = NoWork$3, isWorking = !1, nextUnitOfWork = null, nextRoot = null, nextRenderExpirationTime = NoWork$3, nextEffect = null, capturedErrors = null, failedBoundaries = null, commitPhaseBoundaries = null, firstUncaughtError = null, didFatal = !1, isCommitting = !1, isUnmounting = !1;
    function resetContextStack() {
        // Reset the stack
        reset$1(), // Reset the cursors
        resetContext$1(), resetHostContainer();
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
                commitPlacement(nextEffect), // Clear the "placement" from effect tag so that we know that this is inserted, before
                // any life-cycles like componentDidMount gets called.
                // TODO: findDOMNode doesn't rely on this any more but isMounted
                // does and isMounted is deprecated anyway so we should be able
                // to kill this.
                nextEffect.effectTag &= ~Placement$1;
                break;

              case PlacementAndUpdate:
                // Placement
                commitPlacement(nextEffect), // Clear the "placement" from effect tag so that we know that this is inserted, before
                // any life-cycles like componentDidMount gets called.
                nextEffect.effectTag &= ~Placement$1;
                // Update
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
            // Ensure that we clean these up so that we don't accidentally keep them.
            // I'm not actually sure this matters because we can't reset firstEffect
            // and lastEffect since they're on every node, not just the effectful
            // ones. So we have to clean everything as we reuse nodes anyway.
            nextEffect.nextEffect = null, // Ensure that we reset the effectTag here so that we can rely on effect
            // tags to reason about the current life-cycle.
            nextEffect = next;
        }
    }
    function commitRoot(finishedWork) {
        // We keep track of this so that captureError can collect any boundaries
        // that capture an error during the commit phase. The reason these aren't
        // local to this function is because errors that occur during cWU are
        // captured elsewhere, to prevent the unmount from being interrupted.
        isWorking = !0, isCommitting = !0;
        var root = finishedWork.stateNode;
        invariant(root.current !== finishedWork, "Cannot commit the same tree as before. This is probably a bug " + "related to the return field. This error is likely caused by a bug " + "in React. Please file an issue."), 
        root.isReadyForCommit = !1, // Reset this to null before calling lifecycles
        ReactCurrentOwner$2.current = null;
        var firstEffect = void 0;
        for (finishedWork.effectTag > PerformedWork ? // A fiber's effect list consists only of its children, not itself. So if
        // the root has an effect, we need to add it to the end of the list. The
        // resulting list is the set that would belong to the root's parent, if
        // it had one; that is, all the effects in the tree including the root.
        null !== finishedWork.lastEffect ? (finishedWork.lastEffect.nextEffect = finishedWork, 
        firstEffect = finishedWork.firstEffect) : firstEffect = finishedWork : // There is no effect on the root.
        firstEffect = finishedWork.firstEffect, prepareForCommit(), // Commit all the side-effects within a tree. We'll do this in two passes.
        // The first pass performs all the host insertions, updates, deletions and
        // ref unmounts.
        nextEffect = firstEffect; null !== nextEffect; ) {
            var didError = !1, _error = void 0;
            try {
                commitAllHostEffects();
            } catch (e) {
                didError = !0, _error = e;
            }
            didError && (invariant(null !== nextEffect, "Should have next effect. This error is likely caused by a bug " + "in React. Please file an issue."), 
            captureError(nextEffect, _error), // Clean-up
            null !== nextEffect && (nextEffect = nextEffect.nextEffect));
        }
        for (resetAfterCommit(), // The work-in-progress tree is now the current tree. This must come after
        // the first pass of the commit phase, so that the previous tree is still
        // current during componentWillUnmount, but before the second pass, so that
        // the finished work is current during componentDidMount/Update.
        root.current = finishedWork, // In the second pass we'll perform all life-cycles and ref callbacks.
        // Life-cycles happen as a separate pass so that all placements, updates,
        // and deletions in the entire tree have already been invoked.
        // This pass also triggers any renderer-specific initial effects.
        nextEffect = firstEffect; null !== nextEffect; ) {
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
        // If we caught any errors during this commit, schedule their boundaries
        // to update.
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
            for (// Check for pending updates.
            var newExpirationTime = getUpdateExpirationTime(workInProgress), child = workInProgress.child; null !== child; ) child.expirationTime !== NoWork$3 && (newExpirationTime === NoWork$3 || newExpirationTime > child.expirationTime) && (newExpirationTime = child.expirationTime), 
            child = child.sibling;
            workInProgress.expirationTime = newExpirationTime;
        }
    }
    function completeUnitOfWork(workInProgress) {
        for (;!0; ) {
            // The current, flushed, state of this fiber is the alternate.
            // Ideally nothing should rely on this, but relying on it here
            // means that we don't need an additional field on the work in
            // progress.
            var current = workInProgress.alternate, next = completeWork(current, workInProgress, nextRenderExpirationTime), returnFiber = workInProgress.return, siblingFiber = workInProgress.sibling;
            if (resetExpirationTime(workInProgress, nextRenderExpirationTime), null !== next) // If completing this work spawned new work, do that next. We'll come
            // back here again.
            return !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onCompleteWork(workInProgress), 
            next;
            if (null !== returnFiber) {
                // Append all the effects of the subtree and this fiber onto the effect
                // list of the parent. The completion order of the children affects the
                // side-effect order.
                null === returnFiber.firstEffect && (returnFiber.firstEffect = workInProgress.firstEffect), 
                null !== workInProgress.lastEffect && (null !== returnFiber.lastEffect && (returnFiber.lastEffect.nextEffect = workInProgress.firstEffect), 
                returnFiber.lastEffect = workInProgress.lastEffect);
                // Skip both NoWork and PerformedWork tags when creating the effect list.
                // PerformedWork effect is read by React DevTools but shouldn't be committed.
                workInProgress.effectTag > PerformedWork && (null !== returnFiber.lastEffect ? returnFiber.lastEffect.nextEffect = workInProgress : returnFiber.firstEffect = workInProgress, 
                returnFiber.lastEffect = workInProgress);
            }
            if (!1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onCompleteWork(workInProgress), 
            null !== siblingFiber) // If there is more work to do in this returnFiber, do that next.
            return siblingFiber;
            if (null === returnFiber) {
                return workInProgress.stateNode.isReadyForCommit = !0, null;
            }
            // If there's no more work in this returnFiber. Complete the returnFiber.
            workInProgress = returnFiber;
        }
        // Without this explicit null return Flow complains of invalid return type
        // TODO Remove the above while(true) loop
        // eslint-disable-next-line no-unreachable
        return null;
    }
    function performUnitOfWork(workInProgress) {
        // The current, flushed, state of this fiber is the alternate.
        // Ideally nothing should rely on this, but relying on it here
        // means that we don't need an additional field on the work in
        // progress.
        var current = workInProgress.alternate, next = beginWork(current, workInProgress, nextRenderExpirationTime);
        // If this doesn't spawn new work, complete the current work.
        return !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onBeginWork(workInProgress), 
        null === next && (next = completeUnitOfWork(workInProgress)), ReactCurrentOwner$2.current = null, 
        next;
    }
    function performFailedUnitOfWork(workInProgress) {
        // The current, flushed, state of this fiber is the alternate.
        // Ideally nothing should rely on this, but relying on it here
        // means that we don't need an additional field on the work in
        // progress.
        var current = workInProgress.alternate, next = beginFailedWork(current, workInProgress, nextRenderExpirationTime);
        // If this doesn't spawn new work, complete the current work.
        return !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onBeginWork(workInProgress), 
        null === next && (next = completeUnitOfWork(workInProgress)), ReactCurrentOwner$2.current = null, 
        next;
    }
    function workLoop(expirationTime) {
        if (null !== capturedErrors) // If there are unhandled errors, switch to the slow work loop.
        // TODO: How to avoid this check in the fast path? Maybe the renderer
        // could keep track of which roots have unhandled errors and call a
        // forked version of renderRoot.
        return void slowWorkLoopThatChecksForFailedWork(expirationTime);
        if (!(nextRenderExpirationTime === NoWork$3 || nextRenderExpirationTime > expirationTime)) if (nextRenderExpirationTime <= mostRecentCurrentTime) // Flush all expired work.
        for (;null !== nextUnitOfWork; ) nextUnitOfWork = performUnitOfWork(nextUnitOfWork); else // Flush asynchronous work until the deadline runs out of time.
        for (;null !== nextUnitOfWork && !shouldYield(); ) nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
    function slowWorkLoopThatChecksForFailedWork(expirationTime) {
        if (!(nextRenderExpirationTime === NoWork$3 || nextRenderExpirationTime > expirationTime)) if (nextRenderExpirationTime <= mostRecentCurrentTime) // Flush all expired work.
        for (;null !== nextUnitOfWork; ) // Use a forked version of performUnitOfWork
        nextUnitOfWork = hasCapturedError(nextUnitOfWork) ? performFailedUnitOfWork(nextUnitOfWork) : performUnitOfWork(nextUnitOfWork); else // Flush asynchronous work until the deadline runs out of time.
        for (;null !== nextUnitOfWork && !shouldYield(); ) // Use a forked version of performUnitOfWork
        nextUnitOfWork = hasCapturedError(nextUnitOfWork) ? performFailedUnitOfWork(nextUnitOfWork) : performUnitOfWork(nextUnitOfWork);
    }
    function renderRootCatchBlock(root, failedWork, boundary, expirationTime) {
        // We're going to restart the error boundary that captured the error.
        // Conceptually, we're unwinding the stack. We need to unwind the
        // context stack, too.
        unwindContexts(failedWork, boundary), // Restart the error boundary using a forked version of
        // performUnitOfWork that deletes the boundary's children. The entire
        // failed subree will be unmounted. During the commit phase, a special
        // lifecycle method is called on the error boundary, which triggers
        // a re-render.
        nextUnitOfWork = performFailedUnitOfWork(boundary), // Continue working.
        workLoop(expirationTime);
    }
    function renderRoot(root, expirationTime) {
        invariant(!isWorking, "renderRoot was called recursively. This error is likely caused " + "by a bug in React. Please file an issue."), 
        isWorking = !0, // We're about to mutate the work-in-progress tree. If the root was pending
        // commit, it no longer is: we'll need to complete it again.
        root.isReadyForCommit = !1, // Check if we're starting from a fresh stack, or if we're resuming from
        // previously yielded work.
        root === nextRoot && expirationTime === nextRenderExpirationTime && null !== nextUnitOfWork || (// This is a restart. Reset the stack.
        resetContextStack(), nextRoot = root, nextRenderExpirationTime = expirationTime, 
        nextUnitOfWork = createWorkInProgress$1(nextRoot.current, expirationTime));
        var didError = !1, error = null;
        try {
            workLoop(expirationTime);
        } catch (e) {
            didError = !0, error = e;
        }
        // An error was thrown during the render phase.
        for (;didError; ) {
            if (didFatal) {
                // This was a fatal error. Don't attempt to recover from it.
                firstUncaughtError = error;
                break;
            }
            var failedWork = nextUnitOfWork;
            if (null !== failedWork) {
                // "Capture" the error by finding the nearest boundary. If there is no
                // error boundary, we use the root.
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
                    // We're finished working. Exit the error loop.
                    break;
                }
            } else // An error was thrown but there's no current unit of work. This can
            // happen during the commit phase if there's a bug in the renderer.
            didFatal = !0;
        }
        var uncaughtError = firstUncaughtError;
        // We're done performing work. Time to clean up.
        return isWorking = !1, didFatal = !1, firstUncaughtError = null, null !== uncaughtError && onUncaughtError(uncaughtError), 
        root.isReadyForCommit ? root.current.alternate : null;
    }
    // Returns the boundary that captured the error, or null if the error is ignored
    function captureError(failedWork, error) {
        // It is no longer valid because we exited the user code.
        ReactCurrentOwner$2.current = null;
        var boundary = null, errorBoundaryFound = !1, willRetry = !1, errorBoundaryName = null;
        // Host containers are a special case. If the failed work itself is a host
        // container, then it acts as its own boundary. In all other cases, we
        // ignore the work itself and only search through the parents.
        if (failedWork.tag === HostRoot$3) boundary = failedWork, isFailedBoundary(failedWork) && (// If this root already failed, there must have been an error when
        // attempting to unmount it. This is a worst-case scenario and
        // should only be possible if there's a bug in the renderer.
        didFatal = !0); else for (var node = failedWork.return; null !== node && null === boundary; ) {
            if (node.tag === ClassComponent$3) {
                var instance = node.stateNode;
                "function" == typeof instance.componentDidCatch && (errorBoundaryFound = !0, errorBoundaryName = getComponentName_1(node), 
                // Found an error boundary!
                boundary = node, willRetry = !0);
            } else node.tag === HostRoot$3 && (// Treat the root like a no-op error boundary
            boundary = node);
            if (isFailedBoundary(node)) {
                // This boundary is already in a failed state.
                // If we're currently unmounting, that means this error was
                // thrown while unmounting a failed subtree. We should ignore
                // the error.
                if (isUnmounting) return null;
                // If we're in the commit phase, we should check to see if
                // this boundary already captured an error during this commit.
                // This case exists because multiple errors can be thrown during
                // a single commit without interruption.
                if (null !== commitPhaseBoundaries && (commitPhaseBoundaries.has(node) || null !== node.alternate && commitPhaseBoundaries.has(node.alternate))) // If so, we should ignore this error.
                return null;
                // The error should propagate to the next boundary -— we keep looking.
                boundary = null, willRetry = !1;
            }
            node = node.return;
        }
        if (null !== boundary) {
            // Add to the collection of failed boundaries. This lets us know that
            // subsequent errors in this subtree should propagate to the next boundary.
            null === failedBoundaries && (failedBoundaries = new Set()), failedBoundaries.add(boundary);
            // This method is unsafe outside of the begin and complete phases.
            // We might be in the commit phase when an error is captured.
            // The risk is that the return path from this Fiber may not be accurate.
            // That risk is acceptable given the benefit of providing users more context.
            var _componentStack = getStackAddendumByWorkInProgressFiber(failedWork), _componentName = getComponentName_1(failedWork);
            // Add to the collection of captured errors. This is stored as a global
            // map of errors and their component stack location keyed by the boundaries
            // that capture them. We mostly use this Map as a Set; it's a Map only to
            // avoid adding a field to Fiber to store the error.
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
                // Prevent cycle if logCapturedError() throws.
                // A cycle may still occur if logCapturedError renders a component that throws.
                console.error(e);
            }
            // If we're in the commit phase, defer scheduling an update on the
            // boundary until after the commit is complete
            // Otherwise, schedule an update now.
            // TODO: Is this actually necessary during the render phase? Is it
            // possible to unwind and continue rendering at the same priority,
            // without corrupting internal state?
            return isCommitting ? (null === commitPhaseBoundaries && (commitPhaseBoundaries = new Set()), 
            commitPhaseBoundaries.add(boundary)) : scheduleErrorRecovery(boundary), boundary;
        }
        // If no boundary is found, we'll need to throw the error
        return null === firstUncaughtError && (firstUncaughtError = error), null;
    }
    function hasCapturedError(fiber) {
        // TODO: capturedErrors should store the boundary instance, to avoid needing
        // to check the alternate.
        return null !== capturedErrors && (capturedErrors.has(fiber) || null !== fiber.alternate && capturedErrors.has(fiber.alternate));
    }
    function isFailedBoundary(fiber) {
        // TODO: failedBoundaries should store the boundary instance, to avoid
        // needing to check the alternate.
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
            // Allow the boundary to handle the error, usually by scheduling
            // an update to itself
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
        // Given the current clock time, returns an expiration time. We use rounding
        // to batch like updates together.
        // Should complete within ~1000ms. 1200ms max.
        var currentTime = recalculateCurrentTime();
        return computeExpirationBucket$1(currentTime, 1e3, 200);
    }
    function computeExpirationForFiber(fiber) {
        // No explicit expiration context was set, and we're not currently
        // performing work. Calculate a new expiration time.
        return expirationContext !== NoWork$3 ? expirationContext : isWorking ? isCommitting ? Sync$1 : nextRenderExpirationTime : !useSyncScheduling || fiber.internalContextTag & AsyncUpdates ? computeAsyncExpiration() : Sync$1;
    }
    function scheduleWork(fiber, expirationTime) {
        return scheduleWorkImpl(fiber, expirationTime, !1);
    }
    function scheduleWorkImpl(fiber, expirationTime, isErrorRecovery) {
        for (var node = fiber; null !== node; ) {
            if (// Walk the parent path to the root and update each node's
            // expiration time.
            (node.expirationTime === NoWork$3 || node.expirationTime > expirationTime) && (node.expirationTime = expirationTime), 
            null !== node.alternate && (node.alternate.expirationTime === NoWork$3 || node.alternate.expirationTime > expirationTime) && (node.alternate.expirationTime = expirationTime), 
            null === node.return) {
                if (node.tag !== HostRoot$3) return;
                var root = node.stateNode;
                !isWorking && root === nextRoot && expirationTime <= nextRenderExpirationTime && (// This is an interruption. Restart the root from the top.
                nextRoot = null, nextUnitOfWork = null, nextRenderExpirationTime = NoWork$3), requestWork(root, expirationTime);
            }
            node = node.return;
        }
    }
    function scheduleErrorRecovery(fiber) {
        scheduleWorkImpl(fiber, Sync$1, !0);
    }
    function recalculateCurrentTime() {
        // Subtract initial time so it fits inside 32bits
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
    // TODO: Everything below this is written as if it has been lifted to the
    // renderers. I'll do this in a follow-up.
    // Linked-list of roots
    var firstScheduledRoot = null, lastScheduledRoot = null, isCallbackScheduled = !1, isRendering = !1, nextFlushedRoot = null, nextFlushedExpirationTime = NoWork$3, deadlineDidExpire = !1, hasUnhandledError = !1, unhandledError = null, deadline = null, isBatchingUpdates = !1, isUnbatchingUpdates = !1, nestedUpdateCount = 0, timeHeuristicForUnitOfWork = 1;
    // requestWork is called by the scheduler whenever a root receives an update.
    // It's up to the renderer to call renderRoot at some point in the future.
    function requestWork(root, expirationTime) {
        // Add the root to the schedule.
        // Check if this root is already part of the schedule.
        if (nestedUpdateCount > 1e3 && invariant(!1, "Maximum update depth exceeded. This can happen when a " + "component repeatedly calls setState inside componentWillUpdate or " + "componentDidUpdate. React limits the number of nested updates to " + "prevent infinite loops."), 
        null === root.nextScheduledRoot) // This root is not already scheduled. Add it.
        root.remainingExpirationTime = expirationTime, null === lastScheduledRoot ? (firstScheduledRoot = lastScheduledRoot = root, 
        root.nextScheduledRoot = root) : (lastScheduledRoot.nextScheduledRoot = root, lastScheduledRoot = root, 
        lastScheduledRoot.nextScheduledRoot = firstScheduledRoot); else {
            // This root is already scheduled, but its priority may have increased.
            var remainingExpirationTime = root.remainingExpirationTime;
            (remainingExpirationTime === NoWork$3 || expirationTime < remainingExpirationTime) && (// Update the priority.
            root.remainingExpirationTime = expirationTime);
        }
        if (!isRendering) // Flush work at the end of the batch.
        // ...unless we're inside unbatchedUpdates, in which case we should
        // flush it now.
        // TODO: Get rid of Sync and use current time?
        return isBatchingUpdates ? void (isUnbatchingUpdates && performWorkOnRoot(root, Sync$1)) : void (expirationTime === Sync$1 ? performWork(Sync$1, null) : isCallbackScheduled || (isCallbackScheduled = !0, 
        scheduleDeferredCallback(performAsyncWork)));
    }
    function findHighestPriorityRoot() {
        var highestPriorityWork = NoWork$3, highestPriorityRoot = null;
        if (null !== lastScheduledRoot) for (var previousScheduledRoot = lastScheduledRoot, root = firstScheduledRoot; null !== root; ) {
            var remainingExpirationTime = root.remainingExpirationTime;
            if (remainingExpirationTime === NoWork$3) {
                if (// This root no longer has work. Remove it from the scheduler.
                // TODO: This check is redudant, but Flow is confused by the branch
                // below where we set lastScheduledRoot to null, even though we break
                // from the loop right after.
                invariant(null !== previousScheduledRoot && null !== lastScheduledRoot, "Should have a previous and last root. This error is likely " + "caused by a bug in React. Please file an issue."), 
                root === root.nextScheduledRoot) {
                    // This is the only root in the list.
                    root.nextScheduledRoot = null, firstScheduledRoot = lastScheduledRoot = null;
                    break;
                }
                if (root === firstScheduledRoot) {
                    // This is the first root in the list.
                    var next = root.nextScheduledRoot;
                    firstScheduledRoot = next, lastScheduledRoot.nextScheduledRoot = next, root.nextScheduledRoot = null;
                } else {
                    if (root === lastScheduledRoot) {
                        // This is the last root in the list.
                        lastScheduledRoot = previousScheduledRoot, lastScheduledRoot.nextScheduledRoot = firstScheduledRoot, 
                        root.nextScheduledRoot = null;
                        break;
                    }
                    previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot, root.nextScheduledRoot = null;
                }
                root = previousScheduledRoot.nextScheduledRoot;
            } else {
                if ((highestPriorityWork === NoWork$3 || remainingExpirationTime < highestPriorityWork) && (// Update the priority, if it's higher
                highestPriorityWork = remainingExpirationTime, highestPriorityRoot = root), root === lastScheduledRoot) break;
                previousScheduledRoot = root, root = root.nextScheduledRoot;
            }
        }
        // If the next root is the same as the previous root, this is a nested
        // update. To prevent an infinite loop, increment the nested update count.
        var previousFlushedRoot = nextFlushedRoot;
        null !== previousFlushedRoot && previousFlushedRoot === highestPriorityRoot ? nestedUpdateCount++ : // Reset whenever we switch roots.
        nestedUpdateCount = 0, nextFlushedRoot = highestPriorityRoot, nextFlushedExpirationTime = highestPriorityWork;
    }
    function performAsyncWork(dl) {
        performWork(NoWork$3, dl);
    }
    function performWork(minExpirationTime, dl) {
        for (deadline = dl, // Keep working on roots until there's no more work, or until the we reach
        // the deadlne.
        findHighestPriorityRoot(); null !== nextFlushedRoot && nextFlushedExpirationTime !== NoWork$3 && (minExpirationTime === NoWork$3 || nextFlushedExpirationTime <= minExpirationTime) && !deadlineDidExpire; ) performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime), 
        // Find the next highest priority work.
        findHighestPriorityRoot();
        if (// We're done flushing work. Either we ran out of time in this callback,
        // or there's no more work left with sufficient priority.
        // If we're inside a callback, set this to false since we just completed it.
        null !== deadline && (isCallbackScheduled = !1), // If there's work left over, schedule a new callback.
        null === nextFlushedRoot || isCallbackScheduled || (isCallbackScheduled = !0, scheduleDeferredCallback(performAsyncWork)), 
        // Clean-up.
        deadline = null, deadlineDidExpire = !1, nestedUpdateCount = 0, hasUnhandledError) {
            var _error4 = unhandledError;
            throw unhandledError = null, hasUnhandledError = !1, _error4;
        }
    }
    function performWorkOnRoot(root, expirationTime) {
        // Check if this is async work or sync/expired work.
        // TODO: Pass current time as argument to renderRoot, commitRoot
        if (invariant(!isRendering, "performWorkOnRoot was called recursively. This error is likely caused " + "by a bug in React. Please file an issue."), 
        isRendering = !0, expirationTime <= recalculateCurrentTime()) {
            // Flush sync work.
            var finishedWork = root.finishedWork;
            null !== finishedWork ? (// This root is already complete. We can commit it.
            root.finishedWork = null, root.remainingExpirationTime = commitRoot(finishedWork)) : (root.finishedWork = null, 
            null !== (finishedWork = renderRoot(root, expirationTime)) && (// We've completed the root. Commit it.
            root.remainingExpirationTime = commitRoot(finishedWork)));
        } else {
            // Flush async work.
            var _finishedWork = root.finishedWork;
            null !== _finishedWork ? (// This root is already complete. We can commit it.
            root.finishedWork = null, root.remainingExpirationTime = commitRoot(_finishedWork)) : (root.finishedWork = null, 
            null !== (_finishedWork = renderRoot(root, expirationTime)) && (// We've completed the root. Check the deadline one more time
            // before committing.
            shouldYield() ? // There's no time left. Mark this root as complete. We'll come
            // back and commit it later.
            root.finishedWork = _finishedWork : // Still time left. Commit the root.
            root.remainingExpirationTime = commitRoot(_finishedWork)));
        }
        isRendering = !1;
    }
    // When working on async work, the reconciler asks the renderer if it should
    // yield execution. For DOM, we implement this with requestIdleCallback.
    function shouldYield() {
        return null !== deadline && (!(deadline.timeRemaining() > timeHeuristicForUnitOfWork) && (deadlineDidExpire = !0, 
        !0));
    }
    // TODO: Not happy about this hook. Conceptually, renderRoot should return a
    // tuple of (isReadyForCommit, didError, error)
    function onUncaughtError(error) {
        invariant(null !== nextFlushedRoot, "Should be working on a root. This error is likely caused by a bug in " + "React. Please file an issue."), 
        // Unschedule this root so we don't work on it again until there's
        // another update.
        nextFlushedRoot.remainingExpirationTime = NoWork$3, hasUnhandledError || (hasUnhandledError = !0, 
        unhandledError = error);
    }
    // TODO: Batching should be implemented at the renderer level, not inside
    // the reconciler.
    function batchedUpdates(fn, a) {
        var previousIsBatchingUpdates = isBatchingUpdates;
        isBatchingUpdates = !0;
        try {
            return fn(a);
        } finally {
            isBatchingUpdates = previousIsBatchingUpdates, isBatchingUpdates || isRendering || performWork(Sync$1, null);
        }
    }
    // TODO: Batching should be implemented at the renderer level, not inside
    // the reconciler.
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
    // TODO: Batching should be implemented at the renderer level, not within
    // the reconciler.
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
        // Check if the top-level element is an async wrapper component. If so,
        // treat updates to the root as async. This is a bit weird but lets us
        // avoid a separate `renderAsync` API.
        expirationTime = ReactFeatureFlagsWww.enableAsyncSubtreeAPI && null != element && null != element.type && null != element.type.prototype && !0 === element.type.prototype.unstable_isAsyncReactComponent ? computeAsyncExpiration() : computeExpirationForFiber(current), 
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
            // TODO: If this is a nested container, this won't be the root.
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
}, index = ReactFiberReconciler, ComponentTree, injection$1 = {
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
    injection: injection$1
}, EventPluginUtils_1 = EventPluginUtils, fiberHostComponent = null, ReactControlledComponentInjection = {
    injectFiberControlledHostComponent: function(hostComponentImpl) {
        // The fiber implementation doesn't use dynamic dispatch so we need to
        // inject the implementation.
        fiberHostComponent = hostComponentImpl;
    }
}, restoreTarget = null, restoreQueue = null;

function restoreStateOfTarget(target) {
    // We perform this translation at the end of the event loop so that we
    // always receive the correct fiber here
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
    // If we have Fiber loaded, we need to wrap this in a batching call so that
    // Fiber can apply its default priority for this call.
    return fiberBatchedUpdates(fn, bookkeeping);
}

var isNestingBatched = !1;

function batchedUpdatesWithControlledComponents(fn, bookkeeping) {
    if (isNestingBatched) // If we are currently inside another batch, we need to wait until it
    // fully completes before restoring state. Therefore, we add the target to
    // a queue of work.
    return batchedUpdates(fn, bookkeeping);
    isNestingBatched = !0;
    try {
        return batchedUpdates(fn, bookkeeping);
    } finally {
        // Here we wait until all updates have propagated, which is important
        // when using controlled components within layers:
        // https://github.com/facebook/react/issues/1698
        // Then we restore state of any controlled component.
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
}, ReactGenericBatching_1 = ReactGenericBatching, ReactVersion = "16.0.0", hasNativePerformanceNow = "object" == typeof performance && "function" == typeof performance.now, now = void 0;

now = hasNativePerformanceNow ? function() {
    return performance.now();
} : function() {
    return Date.now();
};

// TODO: There's no way to cancel, because Fiber doesn't atm.
var rIC = void 0;

if (ExecutionEnvironment.canUseDOM) if ("function" != typeof requestIdleCallback) {
    // Polyfill requestIdleCallback.
    var scheduledRICCallback = null, isIdleScheduled = !1, isAnimationFrameScheduled = !1, frameDeadline = 0, previousFrameTime = 33, activeFrameTime = 33, frameDeadlineObject;
    frameDeadlineObject = hasNativePerformanceNow ? {
        timeRemaining: function() {
            // We assume that if we have a performance timer that the rAF callback
            // gets a performance timer value. Not sure if this is always true.
            return frameDeadline - performance.now();
        }
    } : {
        timeRemaining: function() {
            // Fallback to Date.now()
            return frameDeadline - Date.now();
        }
    };
    // We use the postMessage trick to defer idle work until after the repaint.
    var messageKey = "__reactIdleCallback$" + Math.random().toString(36).slice(2), idleTick = function(event) {
        if (event.source === window && event.data === messageKey) {
            isIdleScheduled = !1;
            var callback = scheduledRICCallback;
            scheduledRICCallback = null, null !== callback && callback(frameDeadlineObject);
        }
    };
    // Assumes that we have addEventListener in this environment. Might need
    // something better for old IE.
    window.addEventListener("message", idleTick, !1);
    var animationTick = function(rafTime) {
        isAnimationFrameScheduled = !1;
        var nextFrameTime = rafTime - frameDeadline + activeFrameTime;
        nextFrameTime < activeFrameTime && previousFrameTime < activeFrameTime ? (nextFrameTime < 8 && (// Defensive coding. We don't support higher frame rates than 120hz.
        // If we get lower than that, it is probably a bug.
        nextFrameTime = 8), // If one frame goes long, then the next one can be short to catch up.
        // If two frames are short in a row, then that's an indication that we
        // actually have a higher frame rate than what we're currently optimizing.
        // We adjust our heuristic dynamically accordingly. For example, if we're
        // running on 120hz display or 90hz VR display.
        // Take the max of the two in case one of them was an anomaly due to
        // missed frame deadlines.
        activeFrameTime = nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime) : previousFrameTime = nextFrameTime, 
        frameDeadline = rafTime + activeFrameTime, isIdleScheduled || (isIdleScheduled = !0, 
        window.postMessage(messageKey, "*"));
    };
    rIC = function(callback) {
        // This assumes that we only schedule one callback at a time because that's
        // how Fiber uses it.
        // If rAF didn't already schedule one, we need to schedule a frame.
        // TODO: If this rAF doesn't materialize because the browser throttles, we
        // might want to still have setTimeout trigger rIC as a backup to ensure
        // that we keep performing work.
        return scheduledRICCallback = callback, isAnimationFrameScheduled || (isAnimationFrameScheduled = !0, 
        requestAnimationFrame(animationTick)), 0;
    };
} else rIC = requestIdleCallback; else rIC = function(frameCallback) {
    return setTimeout(function() {
        frameCallback({
            timeRemaining: function() {
                return 1 / 0;
            }
        });
    }), 0;
};

var now_1 = now, rIC_1 = rIC, ReactDOMFrameScheduling = {
    now: now_1,
    rIC: rIC_1
}, HostComponent$9 = ReactTypeOfWork.HostComponent, HostText$7 = ReactTypeOfWork.HostText, randomKey = Math.random().toString(36).slice(2), internalInstanceKey = "__reactInternalInstance$" + randomKey, internalEventHandlersKey = "__reactEventHandlers$" + randomKey;

function precacheFiberNode$1(hostInst, node) {
    node[internalInstanceKey] = hostInst;
}

/**
 * Given a DOM node, return the closest ReactDOMComponent or
 * ReactDOMTextComponent instance ancestor.
 */
function getClosestInstanceFromNode(node) {
    if (node[internalInstanceKey]) return node[internalInstanceKey];
    for (// Walk up the tree until we find an ancestor whose instance we have cached.
    var parents = []; !node[internalInstanceKey]; ) {
        if (parents.push(node), !node.parentNode) // Top of the tree. This node must not be part of a React tree (or is
        // unmounted, potentially).
        return null;
        node = node.parentNode;
    }
    var closest, inst = node[internalInstanceKey];
    if (inst.tag === HostComponent$9 || inst.tag === HostText$7) // In Fiber, this will always be the deepest root.
    return inst;
    for (;node && (inst = node[internalInstanceKey]); node = parents.pop()) closest = inst;
    return closest;
}

/**
 * Given a DOM node, return the ReactDOMComponent or ReactDOMTextComponent
 * instance, or null if the node was not rendered by this React.
 */
function getInstanceFromNode(node) {
    var inst = node[internalInstanceKey];
    return inst && (inst.tag === HostComponent$9 || inst.tag === HostText$7) ? inst : null;
}

/**
 * Given a ReactDOMComponent or ReactDOMTextComponent, return the corresponding
 * DOM node.
 */
function getNodeFromInstance(inst) {
    if (inst.tag === HostComponent$9 || inst.tag === HostText$7) // In Fiber this, is just the state node right now. We assume it will be
    // a host component or host text.
    return inst.stateNode;
    // Without this first invariant, passing a non-DOM-component triggers the next
    // invariant for a missing parent, which is super confusing.
    invariant(!1, "getNodeFromInstance: Invalid argument.");
}

function getFiberCurrentPropsFromNode(node) {
    return node[internalEventHandlersKey] || null;
}

function updateFiberProps$1(node, props) {
    node[internalEventHandlersKey] = props;
}

var ReactDOMComponentTree = {
    getClosestInstanceFromNode: getClosestInstanceFromNode,
    getInstanceFromNode: getInstanceFromNode,
    getNodeFromInstance: getNodeFromInstance,
    precacheFiberNode: precacheFiberNode$1,
    getFiberCurrentPropsFromNode: getFiberCurrentPropsFromNode,
    updateFiberProps: updateFiberProps$1
}, ReactDOMComponentTree_1 = ReactDOMComponentTree, eventPluginOrder = null, namesToPlugins = {};

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
}, EventPluginRegistry_1 = EventPluginRegistry, RESERVED_PROPS = {
    children: !0,
    dangerouslySetInnerHTML: !0,
    defaultValue: !0,
    defaultChecked: !0,
    innerHTML: !0,
    suppressContentEditableWarning: !0,
    suppressHydrationWarning: !0,
    style: !0
};

function checkMask(value, bitmask) {
    return (value & bitmask) === bitmask;
}

var DOMPropertyInjection = {
    /**
   * Mapping from normalized, camelcased property names to a configuration that
   * specifies how the associated DOM property should be accessed or rendered.
   */
    MUST_USE_PROPERTY: 1,
    HAS_BOOLEAN_VALUE: 4,
    HAS_NUMERIC_VALUE: 8,
    HAS_POSITIVE_NUMERIC_VALUE: 16 | 8,
    HAS_OVERLOADED_BOOLEAN_VALUE: 32,
    HAS_STRING_BOOLEAN_VALUE: 64,
    /**
   * Inject some specialized knowledge about the DOM. This takes a config object
   * with the following properties:
   *
   * Properties: object mapping DOM property name to one of the
   * DOMPropertyInjection constants or null. If your attribute isn't in here,
   * it won't get written to the DOM.
   *
   * DOMAttributeNames: object mapping React attribute name to the DOM
   * attribute name. Attribute names not specified use the **lowercase**
   * normalized name.
   *
   * DOMAttributeNamespaces: object mapping React attribute name to the DOM
   * attribute namespace URL. (Attribute names not specified use no namespace.)
   *
   * DOMPropertyNames: similar to DOMAttributeNames but for DOM properties.
   * Property names not specified use the normalized name.
   *
   * DOMMutationMethods: Properties that require special mutation methods. If
   * `value` is undefined, the mutation method should unset the property.
   *
   * @param {object} domPropertyConfig the config as described above.
   */
    injectDOMPropertyConfig: function(domPropertyConfig) {
        var Injection = DOMPropertyInjection, Properties = domPropertyConfig.Properties || {}, DOMAttributeNamespaces = domPropertyConfig.DOMAttributeNamespaces || {}, DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {}, DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};
        for (var propName in Properties) {
            invariant(!DOMProperty.properties.hasOwnProperty(propName), "injectDOMPropertyConfig(...): You're trying to inject DOM property " + "'%s' which has already been injected. You may be accidentally " + "injecting the same DOM property config twice, or you may be " + "injecting two configs that have conflicting property names.", propName);
            var lowerCased = propName.toLowerCase(), propConfig = Properties[propName], propertyInfo = {
                attributeName: lowerCased,
                attributeNamespace: null,
                propertyName: propName,
                mutationMethod: null,
                mustUseProperty: checkMask(propConfig, Injection.MUST_USE_PROPERTY),
                hasBooleanValue: checkMask(propConfig, Injection.HAS_BOOLEAN_VALUE),
                hasNumericValue: checkMask(propConfig, Injection.HAS_NUMERIC_VALUE),
                hasPositiveNumericValue: checkMask(propConfig, Injection.HAS_POSITIVE_NUMERIC_VALUE),
                hasOverloadedBooleanValue: checkMask(propConfig, Injection.HAS_OVERLOADED_BOOLEAN_VALUE),
                hasStringBooleanValue: checkMask(propConfig, Injection.HAS_STRING_BOOLEAN_VALUE)
            };
            if (invariant(propertyInfo.hasBooleanValue + propertyInfo.hasNumericValue + propertyInfo.hasOverloadedBooleanValue <= 1, "DOMProperty: Value can be one of boolean, overloaded boolean, or " + "numeric value, but not a combination: %s", propName), 
            DOMAttributeNames.hasOwnProperty(propName)) {
                var attributeName = DOMAttributeNames[propName];
                propertyInfo.attributeName = attributeName;
            }
            DOMAttributeNamespaces.hasOwnProperty(propName) && (propertyInfo.attributeNamespace = DOMAttributeNamespaces[propName]), 
            DOMMutationMethods.hasOwnProperty(propName) && (propertyInfo.mutationMethod = DOMMutationMethods[propName]), 
            // Downcase references to whitelist properties to check for membership
            // without case-sensitivity. This allows the whitelist to pick up
            // `allowfullscreen`, which should be written using the property configuration
            // for `allowFullscreen`
            DOMProperty.properties[propName] = propertyInfo;
        }
    }
}, ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", DOMProperty = {
    ID_ATTRIBUTE_NAME: "data-reactid",
    ROOT_ATTRIBUTE_NAME: "data-reactroot",
    ATTRIBUTE_NAME_START_CHAR: ATTRIBUTE_NAME_START_CHAR,
    ATTRIBUTE_NAME_CHAR: ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
    /**
   * Map from property "standard name" to an object with info about how to set
   * the property in the DOM. Each object contains:
   *
   * attributeName:
   *   Used when rendering markup or with `*Attribute()`.
   * attributeNamespace
   * propertyName:
   *   Used on DOM node instances. (This includes properties that mutate due to
   *   external factors.)
   * mutationMethod:
   *   If non-null, used instead of the property or `setAttribute()` after
   *   initial render.
   * mustUseProperty:
   *   Whether the property must be accessed and mutated as an object property.
   * hasBooleanValue:
   *   Whether the property should be removed when set to a falsey value.
   * hasNumericValue:
   *   Whether the property must be numeric or parse as a numeric and should be
   *   removed when set to a falsey value.
   * hasPositiveNumericValue:
   *   Whether the property must be positive numeric or parse as a positive
   *   numeric and should be removed when set to a falsey value.
   * hasOverloadedBooleanValue:
   *   Whether the property can be used as a flag as well as with a value.
   *   Removed when strictly equal to false; present without a value when
   *   strictly equal to true; present with a value otherwise.
   */
    properties: {},
    /**
   * Checks whether a property name is a writeable attribute.
   * @method
   */
    shouldSetAttribute: function(name, value) {
        if (DOMProperty.isReservedProp(name)) return !1;
        if (("o" === name[0] || "O" === name[0]) && ("n" === name[1] || "N" === name[1]) && name.length > 2) return !1;
        if (null === value) return !0;
        switch (typeof value) {
          case "boolean":
            return DOMProperty.shouldAttributeAcceptBooleanValue(name);

          case "undefined":
          case "number":
          case "string":
          case "object":
            return !0;

          default:
            // function, symbol
            return !1;
        }
    },
    getPropertyInfo: function(name) {
        return DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
    },
    shouldAttributeAcceptBooleanValue: function(name) {
        if (DOMProperty.isReservedProp(name)) return !0;
        var propertyInfo = DOMProperty.getPropertyInfo(name);
        if (propertyInfo) return propertyInfo.hasBooleanValue || propertyInfo.hasStringBooleanValue || propertyInfo.hasOverloadedBooleanValue;
        var prefix = name.toLowerCase().slice(0, 5);
        return "data-" === prefix || "aria-" === prefix;
    },
    /**
   * Checks to see if a property name is within the list of properties
   * reserved for internal React operations. These properties should
   * not be set on an HTML element.
   *
   * @private
   * @param {string} name
   * @return {boolean} If the name is within reserved props
   */
    isReservedProp: function(name) {
        return RESERVED_PROPS.hasOwnProperty(name);
    },
    injection: DOMPropertyInjection
}, DOMProperty_1 = DOMProperty, VALID_ATTRIBUTE_NAME_REGEX = new RegExp("^[" + DOMProperty_1.ATTRIBUTE_NAME_START_CHAR + "][" + DOMProperty_1.ATTRIBUTE_NAME_CHAR + "]*$"), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};

function isAttributeNameSafe(attributeName) {
    return !!validatedAttributeNameCache.hasOwnProperty(attributeName) || !illegalAttributeNameCache.hasOwnProperty(attributeName) && (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName) ? (validatedAttributeNameCache[attributeName] = !0, 
    !0) : (illegalAttributeNameCache[attributeName] = !0, !1));
}

// shouldIgnoreValue() is currently duplicated in DOMMarkupOperations.
// TODO: Find a better place for this.
function shouldIgnoreValue(propertyInfo, value) {
    return null == value || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && !1 === value;
}

/**
 * Operations for dealing with DOM properties.
 */
var DOMPropertyOperations = {
    setAttributeForID: function(node, id) {
        node.setAttribute(DOMProperty_1.ID_ATTRIBUTE_NAME, id);
    },
    setAttributeForRoot: function(node) {
        node.setAttribute(DOMProperty_1.ROOT_ATTRIBUTE_NAME, "");
    },
    /**
   * Get the value for a property on a node. Only used in DEV for SSR validation.
   * The "expected" argument is used as a hint of what the expected value is.
   * Some properties have multiple equivalent values.
   */
    getValueForProperty: function(node, name, expected) {},
    /**
   * Get the value for a attribute on a node. Only used in DEV for SSR validation.
   * The third argument is used as a hint of what the expected value is. Some
   * attributes have multiple equivalent values.
   */
    getValueForAttribute: function(node, name, expected) {},
    /**
   * Sets the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   * @param {*} value
   */
    setValueForProperty: function(node, name, value) {
        var propertyInfo = DOMProperty_1.getPropertyInfo(name);
        if (!propertyInfo || !DOMProperty_1.shouldSetAttribute(name, value)) return void DOMPropertyOperations.setValueForAttribute(node, name, DOMProperty_1.shouldSetAttribute(name, value) ? value : null);
        var mutationMethod = propertyInfo.mutationMethod;
        if (mutationMethod) mutationMethod(node, value); else {
            if (shouldIgnoreValue(propertyInfo, value)) return void DOMPropertyOperations.deleteValueForProperty(node, name);
            if (propertyInfo.mustUseProperty) // Contrary to `setAttribute`, object properties are properly
            // `toString`ed by IE8/9.
            node[propertyInfo.propertyName] = value; else {
                var attributeName = propertyInfo.attributeName, namespace = propertyInfo.attributeNamespace;
                // `setAttribute` with objects becomes only `[object]` in IE8/9,
                // ('' + value) makes it output the correct toString()-value.
                namespace ? node.setAttributeNS(namespace, attributeName, "" + value) : propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && !0 === value ? node.setAttribute(attributeName, "") : node.setAttribute(attributeName, "" + value);
            }
        }
    },
    setValueForAttribute: function(node, name, value) {
        isAttributeNameSafe(name) && (null == value ? node.removeAttribute(name) : node.setAttribute(name, "" + value));
    },
    /**
   * Deletes an attributes from a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
    deleteValueForAttribute: function(node, name) {
        node.removeAttribute(name);
    },
    /**
   * Deletes the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
    deleteValueForProperty: function(node, name) {
        var propertyInfo = DOMProperty_1.getPropertyInfo(name);
        if (propertyInfo) {
            var mutationMethod = propertyInfo.mutationMethod;
            if (mutationMethod) mutationMethod(node, void 0); else if (propertyInfo.mustUseProperty) {
                var propName = propertyInfo.propertyName;
                propertyInfo.hasBooleanValue ? node[propName] = !1 : node[propName] = "";
            } else node.removeAttribute(propertyInfo.attributeName);
        } else node.removeAttribute(name);
    }
}, DOMPropertyOperations_1 = DOMPropertyOperations;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function isControlled(props) {
    return "checkbox" === props.type || "radio" === props.type ? null != props.checked : null != props.value;
}

/**
 * Implements an <input> host component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * See http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
var ReactDOMInput = {
    getHostProps: function(element, props) {
        var node = element, value = props.value, checked = props.checked;
        return Object.assign({
            // Make sure we set .type before any other properties (setting .value
            // before .type means .value is lost in IE11 and below)
            type: void 0,
            // Make sure we set .step before .value (setting .value before .step
            // means .value is rounded on mount, based upon step precision)
            step: void 0,
            // Make sure we set .min & .max before .value (to ensure proper order
            // in corner cases such as min or max deriving from value, e.g. Issue #7170)
            min: void 0,
            max: void 0
        }, props, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: null != value ? value : node._wrapperState.initialValue,
            checked: null != checked ? checked : node._wrapperState.initialChecked
        });
    },
    initWrapperState: function(element, props) {
        var defaultValue = props.defaultValue;
        element._wrapperState = {
            initialChecked: null != props.checked ? props.checked : props.defaultChecked,
            initialValue: null != props.value ? props.value : defaultValue,
            controlled: isControlled(props)
        };
    },
    updateWrapper: function(element, props) {
        var node = element, checked = props.checked;
        null != checked && DOMPropertyOperations_1.setValueForProperty(node, "checked", checked || !1);
        var value = props.value;
        if (null != value) if (0 === value && "" === node.value) node.value = "0"; else if ("number" === props.type) {
            // Simulate `input.valueAsNumber`. IE9 does not support it
            var valueAsNumber = parseFloat(node.value) || 0;
            (// eslint-disable-next-line
            value != valueAsNumber || // eslint-disable-next-line
            value == valueAsNumber && node.value != value) && (// Cast `value` to a string to ensure the value is set correctly. While
            // browsers typically do this as necessary, jsdom doesn't.
            node.value = "" + value);
        } else node.value !== "" + value && (// Cast `value` to a string to ensure the value is set correctly. While
        // browsers typically do this as necessary, jsdom doesn't.
        node.value = "" + value); else null == props.value && null != props.defaultValue && node.defaultValue !== "" + props.defaultValue && (node.defaultValue = "" + props.defaultValue), 
        null == props.checked && null != props.defaultChecked && (node.defaultChecked = !!props.defaultChecked);
    },
    postMountWrapper: function(element, props) {
        var node = element;
        // Detach value from defaultValue. We won't do anything if we're working on
        // submit or reset inputs as those values & defaultValues are linked. They
        // are not resetable nodes so this operation doesn't matter and actually
        // removes browser-default values (eg "Submit Query") when no value is
        // provided.
        switch (props.type) {
          case "submit":
          case "reset":
            break;

          case "color":
          case "date":
          case "datetime":
          case "datetime-local":
          case "month":
          case "time":
          case "week":
            // This fixes the no-show issue on iOS Safari and Android Chrome:
            // https://github.com/facebook/react/issues/7233
            node.value = "", node.value = node.defaultValue;
            break;

          default:
            node.value = node.value;
        }
        // Normally, we'd just do `node.checked = node.checked` upon initial mount, less this bug
        // this is needed to work around a chrome bug where setting defaultChecked
        // will sometimes influence the value of checked (even after detachment).
        // Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=608416
        // We need to temporarily unset name to avoid disrupting radio button groups.
        var name = node.name;
        "" !== name && (node.name = ""), node.defaultChecked = !node.defaultChecked, node.defaultChecked = !node.defaultChecked, 
        "" !== name && (node.name = name);
    },
    restoreControlledState: function(element, props) {
        var node = element;
        ReactDOMInput.updateWrapper(node, props), updateNamedCousins(node, props);
    }
};

function updateNamedCousins(rootNode, props) {
    var name = props.name;
    if ("radio" === props.type && null != name) {
        for (var queryRoot = rootNode; queryRoot.parentNode; ) queryRoot = queryRoot.parentNode;
        for (var group = queryRoot.querySelectorAll("input[name=" + JSON.stringify("" + name) + '][type="radio"]'), i = 0; i < group.length; i++) {
            var otherNode = group[i];
            if (otherNode !== rootNode && otherNode.form === rootNode.form) {
                // This will throw if radio buttons rendered by different copies of React
                // and the same name are rendered into the same form (same as #1939).
                // That's probably okay; we don't support it just as we don't support
                // mixing React radio buttons with non-React ones.
                var otherProps = ReactDOMComponentTree_1.getFiberCurrentPropsFromNode(otherNode);
                invariant(otherProps, "ReactDOMInput: Mixing React and non-React radio inputs with the " + "same `name` is not supported."), 
                // If this is a controlled radio button group, forcing the input that
                // was previously checked to update will cause it to be come re-checked
                // as appropriate.
                ReactDOMInput.updateWrapper(otherNode, otherProps);
            }
        }
    }
}

var ReactDOMFiberInput = ReactDOMInput;

function flattenChildren(children) {
    var content = "";
    // Flatten children and warn if they aren't strings or numbers;
    // invalid types are ignored.
    // We can silently skip them because invalid DOM nesting warning
    // catches these cases in Fiber.
    return react.Children.forEach(children, function(child) {
        null != child && ("string" != typeof child && "number" != typeof child || (content += child));
    }), content;
}

/**
 * Implements an <option> host component that warns when `selected` is set.
 */
var ReactDOMOption = {
    validateProps: function(element, props) {},
    postMountWrapper: function(element, props) {
        // value="" should make a value attribute (#6219)
        null != props.value && element.setAttribute("value", props.value);
    },
    getHostProps: function(element, props) {
        var hostProps = Object.assign({
            children: void 0
        }, props), content = flattenChildren(props.children);
        return content && (hostProps.children = content), hostProps;
    }
}, ReactDOMFiberOption = ReactDOMOption;

function updateOptions(node, multiple, propValue, setDefaultSelected) {
    var options = node.options;
    if (multiple) {
        for (var selectedValues = propValue, selectedValue = {}, i = 0; i < selectedValues.length; i++) // Prefix to avoid chaos with special keys.
        selectedValue["$" + selectedValues[i]] = !0;
        for (var _i = 0; _i < options.length; _i++) {
            var selected = selectedValue.hasOwnProperty("$" + options[_i].value);
            options[_i].selected !== selected && (options[_i].selected = selected), selected && setDefaultSelected && (options[_i].defaultSelected = !0);
        }
    } else {
        for (var _selectedValue = "" + propValue, defaultSelected = null, _i2 = 0; _i2 < options.length; _i2++) {
            if (options[_i2].value === _selectedValue) return options[_i2].selected = !0, void (setDefaultSelected && (options[_i2].defaultSelected = !0));
            null !== defaultSelected || options[_i2].disabled || (defaultSelected = options[_i2]);
        }
        null !== defaultSelected && (defaultSelected.selected = !0);
    }
}

/**
 * Implements a <select> host component that allows optionally setting the
 * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
 * stringable. If `multiple` is true, the prop must be an array of stringables.
 *
 * If `value` is not supplied (or null/undefined), user actions that change the
 * selected option will trigger updates to the rendered options.
 *
 * If it is supplied (and not null/undefined), the rendered options will not
 * update in response to user actions. Instead, the `value` prop must change in
 * order for the rendered options to update.
 *
 * If `defaultValue` is provided, any options with the supplied values will be
 * selected.
 */
var ReactDOMSelect = {
    getHostProps: function(element, props) {
        return Object.assign({}, props, {
            value: void 0
        });
    },
    initWrapperState: function(element, props) {
        var node = element, value = props.value;
        node._wrapperState = {
            initialValue: null != value ? value : props.defaultValue,
            wasMultiple: !!props.multiple
        };
    },
    postMountWrapper: function(element, props) {
        var node = element;
        node.multiple = !!props.multiple;
        var value = props.value;
        null != value ? updateOptions(node, !!props.multiple, value, !1) : null != props.defaultValue && updateOptions(node, !!props.multiple, props.defaultValue, !0);
    },
    postUpdateWrapper: function(element, props) {
        var node = element;
        // After the initial mount, we control selected-ness manually so don't pass
        // this value down
        node._wrapperState.initialValue = void 0;
        var wasMultiple = node._wrapperState.wasMultiple;
        node._wrapperState.wasMultiple = !!props.multiple;
        var value = props.value;
        null != value ? updateOptions(node, !!props.multiple, value, !1) : wasMultiple !== !!props.multiple && (// For simplicity, reapply `defaultValue` if `multiple` is toggled.
        null != props.defaultValue ? updateOptions(node, !!props.multiple, props.defaultValue, !0) : // Revert the select back to its default unselected state.
        updateOptions(node, !!props.multiple, props.multiple ? [] : "", !1));
    },
    restoreControlledState: function(element, props) {
        var node = element, value = props.value;
        null != value && updateOptions(node, !!props.multiple, value, !1);
    }
}, ReactDOMFiberSelect = ReactDOMSelect, ReactDOMTextarea = {
    getHostProps: function(element, props) {
        var node = element;
        return invariant(null == props.dangerouslySetInnerHTML, "`dangerouslySetInnerHTML` does not make sense on <textarea>."), 
        Object.assign({}, props, {
            value: void 0,
            defaultValue: void 0,
            children: "" + node._wrapperState.initialValue
        });
    },
    initWrapperState: function(element, props) {
        var node = element, value = props.value, initialValue = value;
        // Only bother fetching default value if we're going to use it
        if (null == value) {
            var defaultValue = props.defaultValue, children = props.children;
            null != children && (invariant(null == defaultValue, "If you supply `defaultValue` on a <textarea>, do not pass children."), 
            Array.isArray(children) && (invariant(children.length <= 1, "<textarea> can only have at most one child."), 
            children = children[0]), defaultValue = "" + children), null == defaultValue && (defaultValue = ""), 
            initialValue = defaultValue;
        }
        node._wrapperState = {
            initialValue: "" + initialValue
        };
    },
    updateWrapper: function(element, props) {
        var node = element, value = props.value;
        if (null != value) {
            // Cast `value` to a string to ensure the value is set correctly. While
            // browsers typically do this as necessary, jsdom doesn't.
            var newValue = "" + value;
            // To avoid side effects (such as losing text selection), only set value if changed
            newValue !== node.value && (node.value = newValue), null == props.defaultValue && (node.defaultValue = newValue);
        }
        null != props.defaultValue && (node.defaultValue = props.defaultValue);
    },
    postMountWrapper: function(element, props) {
        var node = element, textContent = node.textContent;
        // Only set node.value if textContent is equal to the expected
        // initial value. In IE10/IE11 there is a bug where the placeholder attribute
        // will populate textContent as well.
        // https://developer.microsoft.com/microsoft-edge/platform/issues/101525/
        textContent === node._wrapperState.initialValue && (node.value = textContent);
    },
    restoreControlledState: function(element, props) {
        // DOM component is still mounted; update
        ReactDOMTextarea.updateWrapper(element, props);
    }
}, ReactDOMFiberTextarea = ReactDOMTextarea;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
function isCheckable(elem) {
    var type = elem.type, nodeName = elem.nodeName;
    return nodeName && "input" === nodeName.toLowerCase() && ("checkbox" === type || "radio" === type);
}

function getTracker(node) {
    return node._valueTracker;
}

function detachTracker(node) {
    node._valueTracker = null;
}

function getValueFromNode(node) {
    var value = "";
    return node ? value = isCheckable(node) ? node.checked ? "true" : "false" : node.value : value;
}

function trackValueOnNode(node) {
    var valueField = isCheckable(node) ? "checked" : "value", descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField), currentValue = "" + node[valueField];
    // if someone has already defined a value or Safari, then bail
    // and don't track value will cause over reporting of changes,
    // but it's better then a hard failure
    // (needed for certain tests that spyOn input values and Safari)
    if (!node.hasOwnProperty(valueField) && "function" == typeof descriptor.get && "function" == typeof descriptor.set) {
        Object.defineProperty(node, valueField, {
            enumerable: descriptor.enumerable,
            configurable: !0,
            get: function() {
                return descriptor.get.call(this);
            },
            set: function(value) {
                currentValue = "" + value, descriptor.set.call(this, value);
            }
        });
        return {
            getValue: function() {
                return currentValue;
            },
            setValue: function(value) {
                currentValue = "" + value;
            },
            stopTracking: function() {
                detachTracker(node), delete node[valueField];
            }
        };
    }
}

var inputValueTracking = {
    // exposed for testing
    _getTrackerFromNode: getTracker,
    track: function(node) {
        getTracker(node) || (// TODO: Once it's just Fiber we can move this to node._wrapperState
        node._valueTracker = trackValueOnNode(node));
    },
    updateValueIfChanged: function(node) {
        if (!node) return !1;
        var tracker = getTracker(node);
        // if there is no tracker at this point it's unlikely
        // that trying again will succeed
        if (!tracker) return !0;
        var lastValue = tracker.getValue(), nextValue = getValueFromNode(node);
        return nextValue !== lastValue && (tracker.setValue(nextValue), !0);
    },
    stopTracking: function(node) {
        var tracker = getTracker(node);
        tracker && tracker.stopTracking();
    }
}, inputValueTracking_1 = inputValueTracking, HTML_NAMESPACE$1 = "http://www.w3.org/1999/xhtml", MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML", SVG_NAMESPACE = "http://www.w3.org/2000/svg", Namespaces$1 = {
    html: HTML_NAMESPACE$1,
    mathml: MATH_NAMESPACE,
    svg: SVG_NAMESPACE
};

// Assumes there is no parent namespace.
function getIntrinsicNamespace$1(type) {
    switch (type) {
      case "svg":
        return SVG_NAMESPACE;

      case "math":
        return MATH_NAMESPACE;

      default:
        return HTML_NAMESPACE$1;
    }
}

function getChildNamespace$1(parentNamespace, type) {
    return null == parentNamespace || parentNamespace === HTML_NAMESPACE$1 ? getIntrinsicNamespace$1(type) : parentNamespace === SVG_NAMESPACE && "foreignObject" === type ? HTML_NAMESPACE$1 : parentNamespace;
}

var Namespaces_1 = Namespaces$1, getIntrinsicNamespace_1 = getIntrinsicNamespace$1, getChildNamespace_1 = getChildNamespace$1, DOMNamespaces = {
    Namespaces: Namespaces_1,
    getIntrinsicNamespace: getIntrinsicNamespace_1,
    getChildNamespace: getChildNamespace_1
}, createMicrosoftUnsafeLocalFunction = function(func) {
    return "undefined" != typeof MSApp && MSApp.execUnsafeLocalFunction ? function(arg0, arg1, arg2, arg3) {
        MSApp.execUnsafeLocalFunction(function() {
            return func(arg0, arg1, arg2, arg3);
        });
    } : func;
}, createMicrosoftUnsafeLocalFunction_1 = createMicrosoftUnsafeLocalFunction, Namespaces = DOMNamespaces.Namespaces, reusableSVGContainer, setInnerHTML = createMicrosoftUnsafeLocalFunction_1(function(node, html) {
    // IE does not have innerHTML for SVG nodes, so instead we inject the
    // new markup in a temp node and then move the child nodes across into
    // the target node
    if (node.namespaceURI !== Namespaces.svg || "innerHTML" in node) node.innerHTML = html; else {
        reusableSVGContainer = reusableSVGContainer || document.createElement("div"), reusableSVGContainer.innerHTML = "<svg>" + html + "</svg>";
        for (var svgNode = reusableSVGContainer.firstChild; node.firstChild; ) node.removeChild(node.firstChild);
        for (;svgNode.firstChild; ) node.appendChild(svgNode.firstChild);
    }
}), setInnerHTML_1 = setInnerHTML, matchHtmlRegExp = /["'&<>]/;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */
function escapeHtml(string) {
    var str = "" + string, match = matchHtmlRegExp.exec(str);
    if (!match) return str;
    var escape, html = "", index = 0, lastIndex = 0;
    for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
          case 34:
            // "
            escape = "&quot;";
            break;

          case 38:
            // &
            escape = "&amp;";
            break;

          case 39:
            // '
            escape = "&#x27;";
            // modified from escape-html; used to be '&#39'
            break;

          case 60:
            // <
            escape = "&lt;";
            break;

          case 62:
            // >
            escape = "&gt;";
            break;

          default:
            continue;
        }
        lastIndex !== index && (html += str.substring(lastIndex, index)), lastIndex = index + 1, 
        html += escape;
    }
    return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}

// end code copied and modified from escape-html
/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
function escapeTextContentForBrowser(text) {
    return "boolean" == typeof text || "number" == typeof text ? "" + text : escapeHtml(text);
}

var escapeTextContentForBrowser_1 = escapeTextContentForBrowser, HTMLNodeType = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_FRAGMENT_NODE: 11
}, HTMLNodeType_1 = HTMLNodeType, TEXT_NODE$1 = HTMLNodeType_1.TEXT_NODE, setTextContent = function(node, text) {
    if (text) {
        var firstChild = node.firstChild;
        if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE$1) return void (firstChild.nodeValue = text);
    }
    node.textContent = text;
};

ExecutionEnvironment.canUseDOM && ("textContent" in document.documentElement || (setTextContent = function(node, text) {
    if (node.nodeType === TEXT_NODE$1) return void (node.nodeValue = text);
    setInnerHTML_1(node, escapeTextContentForBrowser_1(text));
}));

var setTextContent_1 = setTextContent;

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
}, EventPluginHub_1 = EventPluginHub;

function runEventQueueInBatch(events) {
    EventPluginHub_1.enqueueEvents(events), EventPluginHub_1.processEventQueue(!1);
}

var ReactEventEmitterMixin = {
    /**
   * Streams a fired top-level event to `EventPluginHub` where plugins have the
   * opportunity to create `ReactEvent`s to be dispatched.
   */
    handleTopLevel: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        runEventQueueInBatch(EventPluginHub_1.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget));
    }
}, ReactEventEmitterMixin_1 = ReactEventEmitterMixin, TEXT_NODE$2 = HTMLNodeType_1.TEXT_NODE;

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
    var target = nativeEvent.target || nativeEvent.srcElement || window;
    // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
    // @see http://www.quirksmode.org/js/events_properties.html
    // Normalize SVG <use> element events #4963
    return target.correspondingUseElement && (target = target.correspondingUseElement), 
    target.nodeType === TEXT_NODE$2 ? target.parentNode : target;
}

var getEventTarget_1 = getEventTarget, HostRoot$9 = ReactTypeOfWork.HostRoot, CALLBACK_BOOKKEEPING_POOL_SIZE = 10, callbackBookkeepingPool = [];

/**
 * Find the deepest React component completely containing the root of the
 * passed-in instance (for use when entire React trees are nested within each
 * other). If React trees are not nested, returns null.
 */
function findRootContainerNode(inst) {
    // TODO: It may be a good idea to cache this to prevent unnecessary DOM
    // traversal, but caching is difficult to do correctly without using a
    // mutation observer to listen for all DOM changes.
    for (;inst.return; ) inst = inst.return;
    return inst.tag !== HostRoot$9 ? null : inst.stateNode.containerInfo;
}

// Used to store ancestor hierarchy in top level callback
function getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst) {
    if (callbackBookkeepingPool.length) {
        var instance = callbackBookkeepingPool.pop();
        return instance.topLevelType = topLevelType, instance.nativeEvent = nativeEvent, 
        instance.targetInst = targetInst, instance;
    }
    return {
        topLevelType: topLevelType,
        nativeEvent: nativeEvent,
        targetInst: targetInst,
        ancestors: []
    };
}

function releaseTopLevelCallbackBookKeeping(instance) {
    instance.topLevelType = null, instance.nativeEvent = null, instance.targetInst = null, 
    instance.ancestors.length = 0, callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE && callbackBookkeepingPool.push(instance);
}

function handleTopLevelImpl(bookKeeping) {
    var targetInst = bookKeeping.targetInst, ancestor = targetInst;
    do {
        if (!ancestor) {
            bookKeeping.ancestors.push(ancestor);
            break;
        }
        var root = findRootContainerNode(ancestor);
        if (!root) break;
        bookKeeping.ancestors.push(ancestor), ancestor = ReactDOMComponentTree_1.getClosestInstanceFromNode(root);
    } while (ancestor);
    for (var i = 0; i < bookKeeping.ancestors.length; i++) targetInst = bookKeeping.ancestors[i], 
    ReactDOMEventListener._handleTopLevel(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget_1(bookKeeping.nativeEvent));
}

var ReactDOMEventListener = {
    _enabled: !0,
    _handleTopLevel: null,
    setHandleTopLevel: function(handleTopLevel) {
        ReactDOMEventListener._handleTopLevel = handleTopLevel;
    },
    setEnabled: function(enabled) {
        ReactDOMEventListener._enabled = !!enabled;
    },
    isEnabled: function() {
        return ReactDOMEventListener._enabled;
    },
    /**
   * Traps top-level events by using event bubbling.
   *
   * @param {string} topLevelType Record from `BrowserEventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} element Element on which to attach listener.
   * @return {?object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
    trapBubbledEvent: function(topLevelType, handlerBaseName, element) {
        return element ? EventListener.listen(element, handlerBaseName, ReactDOMEventListener.dispatchEvent.bind(null, topLevelType)) : null;
    },
    /**
   * Traps a top-level event by using event capturing.
   *
   * @param {string} topLevelType Record from `BrowserEventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} element Element on which to attach listener.
   * @return {?object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
    trapCapturedEvent: function(topLevelType, handlerBaseName, element) {
        return element ? EventListener.capture(element, handlerBaseName, ReactDOMEventListener.dispatchEvent.bind(null, topLevelType)) : null;
    },
    dispatchEvent: function(topLevelType, nativeEvent) {
        if (ReactDOMEventListener._enabled) {
            var nativeEventTarget = getEventTarget_1(nativeEvent), targetInst = ReactDOMComponentTree_1.getClosestInstanceFromNode(nativeEventTarget);
            null === targetInst || "number" != typeof targetInst.tag || ReactFiberTreeReflection.isFiberMounted(targetInst) || (// If we get an event (ex: img onload) before committing that
            // component's mount, ignore it for now (that is, treat it as if it was an
            // event on a non-React tree). We might also consider queueing events and
            // dispatching them after the mount.
            targetInst = null);
            var bookKeeping = getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst);
            try {
                // Event queue being processed in the same cycle allows
                // `preventDefault`.
                ReactGenericBatching_1.batchedUpdates(handleTopLevelImpl, bookKeeping);
            } finally {
                releaseTopLevelCallbackBookKeeping(bookKeeping);
            }
        }
    }
}, ReactDOMEventListener_1 = ReactDOMEventListener, useHasFeature;

ExecutionEnvironment.canUseDOM && (useHasFeature = document.implementation && document.implementation.hasFeature && // always returns true in newer browsers as per the standard.
// @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
!0 !== document.implementation.hasFeature("", ""));

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function isEventSupported(eventNameSuffix, capture) {
    if (!ExecutionEnvironment.canUseDOM || capture && !("addEventListener" in document)) return !1;
    var eventName = "on" + eventNameSuffix, isSupported = eventName in document;
    if (!isSupported) {
        var element = document.createElement("div");
        element.setAttribute(eventName, "return;"), isSupported = "function" == typeof element[eventName];
    }
    // This is the only way to test support for the `wheel` event in IE9+.
    return !isSupported && useHasFeature && "wheel" === eventNameSuffix && (isSupported = document.implementation.hasFeature("Events.wheel", "3.0")), 
    isSupported;
}

var isEventSupported_1 = isEventSupported;

/**
 * Generate a mapping of standard vendor prefixes using the defined style property and event name.
 *
 * @param {string} styleProp
 * @param {string} eventName
 * @returns {object}
 */
function makePrefixMap(styleProp, eventName) {
    var prefixes = {};
    return prefixes[styleProp.toLowerCase()] = eventName.toLowerCase(), prefixes["Webkit" + styleProp] = "webkit" + eventName, 
    prefixes["Moz" + styleProp] = "moz" + eventName, prefixes["ms" + styleProp] = "MS" + eventName, 
    prefixes["O" + styleProp] = "o" + eventName.toLowerCase(), prefixes;
}

/**
 * A list of event names to a configurable list of vendor prefixes.
 */
var vendorPrefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    animationiteration: makePrefixMap("Animation", "AnimationIteration"),
    animationstart: makePrefixMap("Animation", "AnimationStart"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
}, prefixedEventNames = {}, style = {};

/**
 * Bootstrap if a DOM exists.
 */
ExecutionEnvironment.canUseDOM && (style = document.createElement("div").style, 
// On some platforms, in particular some releases of Android 4.x,
// the un-prefixed "animation" and "transition" properties are defined on the
// style object but the events that fire will still be prefixed, so we need
// to check if the un-prefixed events are usable, and if not remove them from the map.
"AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, 
delete vendorPrefixes.animationstart.animation), // Same as above
"TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);

/**
 * Attempts to determine the correct vendor prefixed event name.
 *
 * @param {string} eventName
 * @returns {string}
 */
function getVendorPrefixedEventName(eventName) {
    if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
    if (!vendorPrefixes[eventName]) return eventName;
    var prefixMap = vendorPrefixes[eventName];
    for (var styleProp in prefixMap) if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) return prefixedEventNames[eventName] = prefixMap[styleProp];
    return "";
}

var getVendorPrefixedEventName_1 = getVendorPrefixedEventName, topLevelTypes$1 = {
    topAbort: "abort",
    topAnimationEnd: getVendorPrefixedEventName_1("animationend") || "animationend",
    topAnimationIteration: getVendorPrefixedEventName_1("animationiteration") || "animationiteration",
    topAnimationStart: getVendorPrefixedEventName_1("animationstart") || "animationstart",
    topBlur: "blur",
    topCancel: "cancel",
    topCanPlay: "canplay",
    topCanPlayThrough: "canplaythrough",
    topChange: "change",
    topClick: "click",
    topClose: "close",
    topCompositionEnd: "compositionend",
    topCompositionStart: "compositionstart",
    topCompositionUpdate: "compositionupdate",
    topContextMenu: "contextmenu",
    topCopy: "copy",
    topCut: "cut",
    topDoubleClick: "dblclick",
    topDrag: "drag",
    topDragEnd: "dragend",
    topDragEnter: "dragenter",
    topDragExit: "dragexit",
    topDragLeave: "dragleave",
    topDragOver: "dragover",
    topDragStart: "dragstart",
    topDrop: "drop",
    topDurationChange: "durationchange",
    topEmptied: "emptied",
    topEncrypted: "encrypted",
    topEnded: "ended",
    topError: "error",
    topFocus: "focus",
    topInput: "input",
    topKeyDown: "keydown",
    topKeyPress: "keypress",
    topKeyUp: "keyup",
    topLoadedData: "loadeddata",
    topLoad: "load",
    topLoadedMetadata: "loadedmetadata",
    topLoadStart: "loadstart",
    topMouseDown: "mousedown",
    topMouseMove: "mousemove",
    topMouseOut: "mouseout",
    topMouseOver: "mouseover",
    topMouseUp: "mouseup",
    topPaste: "paste",
    topPause: "pause",
    topPlay: "play",
    topPlaying: "playing",
    topProgress: "progress",
    topRateChange: "ratechange",
    topScroll: "scroll",
    topSeeked: "seeked",
    topSeeking: "seeking",
    topSelectionChange: "selectionchange",
    topStalled: "stalled",
    topSuspend: "suspend",
    topTextInput: "textInput",
    topTimeUpdate: "timeupdate",
    topToggle: "toggle",
    topTouchCancel: "touchcancel",
    topTouchEnd: "touchend",
    topTouchMove: "touchmove",
    topTouchStart: "touchstart",
    topTransitionEnd: getVendorPrefixedEventName_1("transitionend") || "transitionend",
    topVolumeChange: "volumechange",
    topWaiting: "waiting",
    topWheel: "wheel"
}, BrowserEventConstants = {
    topLevelTypes: topLevelTypes$1
}, BrowserEventConstants_1 = BrowserEventConstants, topLevelTypes = BrowserEventConstants_1.topLevelTypes, alreadyListeningTo = {}, reactTopListenersCounter = 0, topListenersIDKey = "_reactListenersID" + ("" + Math.random()).slice(2);

function getListeningForDocument(mountAt) {
    // In IE8, `mountAt` is a host object and doesn't have `hasOwnProperty`
    // directly.
    return Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey) || (mountAt[topListenersIDKey] = reactTopListenersCounter++, 
    alreadyListeningTo[mountAt[topListenersIDKey]] = {}), alreadyListeningTo[mountAt[topListenersIDKey]];
}

var ReactBrowserEventEmitter = Object.assign({}, ReactEventEmitterMixin_1, {
    /**
   * Sets whether or not any created callbacks should be enabled.
   *
   * @param {boolean} enabled True if callbacks should be enabled.
   */
    setEnabled: function(enabled) {
        ReactDOMEventListener_1 && ReactDOMEventListener_1.setEnabled(enabled);
    },
    /**
   * @return {boolean} True if callbacks are enabled.
   */
    isEnabled: function() {
        return !(!ReactDOMEventListener_1 || !ReactDOMEventListener_1.isEnabled());
    },
    /**
   * We listen for bubbled touch events on the document object.
   *
   * Firefox v8.01 (and possibly others) exhibited strange behavior when
   * mounting `onmousemove` events at some node that was not the document
   * element. The symptoms were that if your mouse is not moving over something
   * contained within that mount point (for example on the background) the
   * top-level listeners for `onmousemove` won't be called. However, if you
   * register the `mousemove` on the document object, then it will of course
   * catch all `mousemove`s. This along with iOS quirks, justifies restricting
   * top-level listeners to the document object only, at least for these
   * movement types of events and possibly all events.
   *
   * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   *
   * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
   * they bubble to document.
   *
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {object} contentDocumentHandle Document which owns the container
   */
    listenTo: function(registrationName, contentDocumentHandle) {
        for (var mountAt = contentDocumentHandle, isListening = getListeningForDocument(mountAt), dependencies = EventPluginRegistry_1.registrationNameDependencies[registrationName], i = 0; i < dependencies.length; i++) {
            var dependency = dependencies[i];
            isListening.hasOwnProperty(dependency) && isListening[dependency] || ("topWheel" === dependency ? isEventSupported_1("wheel") ? ReactDOMEventListener_1.trapBubbledEvent("topWheel", "wheel", mountAt) : isEventSupported_1("mousewheel") ? ReactDOMEventListener_1.trapBubbledEvent("topWheel", "mousewheel", mountAt) : // Firefox needs to capture a different mouse scroll event.
            // @see http://www.quirksmode.org/dom/events/tests/scroll.html
            ReactDOMEventListener_1.trapBubbledEvent("topWheel", "DOMMouseScroll", mountAt) : "topScroll" === dependency ? ReactDOMEventListener_1.trapCapturedEvent("topScroll", "scroll", mountAt) : "topFocus" === dependency || "topBlur" === dependency ? (ReactDOMEventListener_1.trapCapturedEvent("topFocus", "focus", mountAt), 
            ReactDOMEventListener_1.trapCapturedEvent("topBlur", "blur", mountAt), // to make sure blur and focus event listeners are only attached once
            isListening.topBlur = !0, isListening.topFocus = !0) : "topCancel" === dependency ? (isEventSupported_1("cancel", !0) && ReactDOMEventListener_1.trapCapturedEvent("topCancel", "cancel", mountAt), 
            isListening.topCancel = !0) : "topClose" === dependency ? (isEventSupported_1("close", !0) && ReactDOMEventListener_1.trapCapturedEvent("topClose", "close", mountAt), 
            isListening.topClose = !0) : topLevelTypes.hasOwnProperty(dependency) && ReactDOMEventListener_1.trapBubbledEvent(dependency, topLevelTypes[dependency], mountAt), 
            isListening[dependency] = !0);
        }
    },
    isListeningToAllDependencies: function(registrationName, mountAt) {
        for (var isListening = getListeningForDocument(mountAt), dependencies = EventPluginRegistry_1.registrationNameDependencies[registrationName], i = 0; i < dependencies.length; i++) {
            var dependency = dependencies[i];
            if (!isListening.hasOwnProperty(dependency) || !isListening[dependency]) return !1;
        }
        return !0;
    },
    trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
        return ReactDOMEventListener_1.trapBubbledEvent(topLevelType, handlerBaseName, handle);
    },
    trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
        return ReactDOMEventListener_1.trapCapturedEvent(topLevelType, handlerBaseName, handle);
    }
}), ReactBrowserEventEmitter_1 = ReactBrowserEventEmitter, isUnitlessNumber$1 = {
    animationIterationCount: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    // SVG-related properties
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
};

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
var prefixes = [ "Webkit", "ms", "Moz", "O" ];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
Object.keys(isUnitlessNumber$1).forEach(function(prop) {
    prefixes.forEach(function(prefix) {
        isUnitlessNumber$1[prefixKey(prefix, prop)] = isUnitlessNumber$1[prop];
    });
});

var CSSProperty = {
    isUnitlessNumber: isUnitlessNumber$1
}, CSSProperty_1 = CSSProperty, isUnitlessNumber = CSSProperty_1.isUnitlessNumber;

/**
 * Convert a value into the proper css writable value. The style name `name`
 * should be logical (no hyphens), as specified
 * in `CSSProperty.isUnitlessNumber`.
 *
 * @param {string} name CSS property name such as `topMargin`.
 * @param {*} value CSS property value such as `10px`.
 * @return {string} Normalized style value with dimensions applied.
 */
function dangerousStyleValue(name, value, isCustomProperty) {
    return null == value || "boolean" == typeof value || "" === value ? "" : isCustomProperty || "number" != typeof value || 0 === value || isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name] ? ("" + value).trim() : value + "px";
}

var dangerousStyleValue_1 = dangerousStyleValue, CSSPropertyOperations = {
    /**
   * This creates a string that is expected to be equivalent to the style
   * attribute generated by server-side rendering. It by-passes warnings and
   * security checks so it's not safe to use this value for anything other than
   * comparison. It is only used in DEV for SSR validation.
   */
    createDangerousStringForStyles: function(styles) {},
    /**
   * Sets the value for multiple styles on a node.  If a value is specified as
   * '' (empty string), the corresponding style property will be unset.
   *
   * @param {DOMElement} node
   * @param {object} styles
   */
    setValueForStyles: function(node, styles, getStack) {
        var style = node.style;
        for (var styleName in styles) if (styles.hasOwnProperty(styleName)) {
            var isCustomProperty = 0 === styleName.indexOf("--"), styleValue = dangerousStyleValue_1(styleName, styles[styleName], isCustomProperty);
            "float" === styleName && (styleName = "cssFloat"), isCustomProperty ? style.setProperty(styleName, styleValue) : style[styleName] = styleValue;
        }
    }
}, CSSPropertyOperations_1 = CSSPropertyOperations, omittedCloseTags = {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0
}, omittedCloseTags_1 = omittedCloseTags, voidElementTags = Object.assign({
    menuitem: !0
}, omittedCloseTags_1), voidElementTags_1 = voidElementTags, HTML$1 = "__html";

function assertValidProps(tag, props, getStack) {
    props && (// Note the use of `==` which checks for null or undefined.
    voidElementTags_1[tag] && invariant(null == props.children && null == props.dangerouslySetInnerHTML, "%s is a void element tag and must neither have `children` nor " + "use `dangerouslySetInnerHTML`.%s", tag, getStack()), 
    null != props.dangerouslySetInnerHTML && (invariant(null == props.children, "Can only set one of `children` or `props.dangerouslySetInnerHTML`."), 
    invariant("object" == typeof props.dangerouslySetInnerHTML && HTML$1 in props.dangerouslySetInnerHTML, "`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. " + "Please visit https://fb.me/react-invariant-dangerously-set-inner-html " + "for more information.")), 
    invariant(null == props.style || "object" == typeof props.style, "The `style` prop expects a mapping from style properties to values, " + "not a string. For example, style={{marginRight: spacing + 'em'}} when " + "using JSX.%s", getStack()));
}

var assertValidProps_1 = assertValidProps;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
function isCustomComponent(tagName, props) {
    if (-1 === tagName.indexOf("-")) return "string" == typeof props.is;
    switch (tagName) {
      // These are reserved SVG and MathML elements.
        // We don't mind this whitelist too much because we expect it to never grow.
        // The alternative is to track the namespace in a few places which is convoluted.
        // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
        case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;

      default:
        return !0;
    }
}

var isCustomComponent_1 = isCustomComponent, DOCUMENT_NODE$1 = HTMLNodeType_1.DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE$1 = HTMLNodeType_1.DOCUMENT_FRAGMENT_NODE, listenTo = ReactBrowserEventEmitter_1.listenTo, registrationNameModules = EventPluginRegistry_1.registrationNameModules, DANGEROUSLY_SET_INNER_HTML = "dangerouslySetInnerHTML", SUPPRESS_CONTENT_EDITABLE_WARNING = "suppressContentEditableWarning", SUPPRESS_HYDRATION_WARNING$1 = "suppressHydrationWarning", AUTOFOCUS = "autoFocus", CHILDREN = "children", STYLE = "style", HTML = "__html", HTML_NAMESPACE = DOMNamespaces.Namespaces.html, getIntrinsicNamespace = DOMNamespaces.getIntrinsicNamespace, getStack = emptyFunction.thatReturns(""), warnForTextDifference, warnForInvalidEventListener;

function ensureListeningTo(rootContainerElement, registrationName) {
    var isDocumentOrFragment = rootContainerElement.nodeType === DOCUMENT_NODE$1 || rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE$1, doc = isDocumentOrFragment ? rootContainerElement : rootContainerElement.ownerDocument;
    listenTo(registrationName, doc);
}

function getOwnerDocumentFromRootContainer(rootContainerElement) {
    return rootContainerElement.nodeType === DOCUMENT_NODE$1 ? rootContainerElement : rootContainerElement.ownerDocument;
}

// There are so many media events, it makes sense to just
// maintain a list rather than create a `trapBubbledEvent` for each
var mediaEvents = {
    topAbort: "abort",
    topCanPlay: "canplay",
    topCanPlayThrough: "canplaythrough",
    topDurationChange: "durationchange",
    topEmptied: "emptied",
    topEncrypted: "encrypted",
    topEnded: "ended",
    topError: "error",
    topLoadedData: "loadeddata",
    topLoadedMetadata: "loadedmetadata",
    topLoadStart: "loadstart",
    topPause: "pause",
    topPlay: "play",
    topPlaying: "playing",
    topProgress: "progress",
    topRateChange: "ratechange",
    topSeeked: "seeked",
    topSeeking: "seeking",
    topStalled: "stalled",
    topSuspend: "suspend",
    topTimeUpdate: "timeupdate",
    topVolumeChange: "volumechange",
    topWaiting: "waiting"
};

function trapClickOnNonInteractiveElement(node) {
    // Mobile Safari does not fire properly bubble click events on
    // non-interactive elements, which means delegated click listeners do not
    // fire. The workaround for this bug involves attaching an empty click
    // listener on the target node.
    // http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
    // Just set it using the onclick property so that we don't have to manage any
    // bookkeeping for it. Not sure if we need to clear it when the listener is
    // removed.
    // TODO: Only do this for the relevant Safaris maybe?
    node.onclick = emptyFunction;
}

function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps, isCustomComponentTag) {
    for (var propKey in nextProps) if (nextProps.hasOwnProperty(propKey)) {
        var nextProp = nextProps[propKey];
        if (propKey === STYLE) CSSPropertyOperations_1.setValueForStyles(domElement, nextProp, getStack); else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
            var nextHtml = nextProp ? nextProp[HTML] : void 0;
            null != nextHtml && setInnerHTML_1(domElement, nextHtml);
        } else if (propKey === CHILDREN) if ("string" == typeof nextProp) {
            // Avoid setting initial textContent when the text is empty. In IE11 setting
            // textContent on a <textarea> will cause the placeholder to not
            // show within the <textarea> until it has been focused and blurred again.
            // https://github.com/facebook/react/issues/6731#issuecomment-254874553
            var canSetTextContent = "textarea" !== tag || "" !== nextProp;
            canSetTextContent && setTextContent_1(domElement, nextProp);
        } else "number" == typeof nextProp && setTextContent_1(domElement, "" + nextProp); else propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1 || propKey === AUTOFOCUS || (registrationNameModules.hasOwnProperty(propKey) ? null != nextProp && (1 || "function" == typeof nextProp || warnForInvalidEventListener(propKey, nextProp), 
        ensureListeningTo(rootContainerElement, propKey)) : isCustomComponentTag ? DOMPropertyOperations_1.setValueForAttribute(domElement, propKey, nextProp) : null != nextProp && // If we're updating to null or undefined, we should remove the property
        // from the DOM node instead of inadvertently setting to a string. This
        // brings us in line with the same behavior we have on initial render.
        DOMPropertyOperations_1.setValueForProperty(domElement, propKey, nextProp));
    }
}

function updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag) {
    // TODO: Handle wasCustomComponentTag
    for (var i = 0; i < updatePayload.length; i += 2) {
        var propKey = updatePayload[i], propValue = updatePayload[i + 1];
        propKey === STYLE ? CSSPropertyOperations_1.setValueForStyles(domElement, propValue, getStack) : propKey === DANGEROUSLY_SET_INNER_HTML ? setInnerHTML_1(domElement, propValue) : propKey === CHILDREN ? setTextContent_1(domElement, propValue) : isCustomComponentTag ? null != propValue ? DOMPropertyOperations_1.setValueForAttribute(domElement, propKey, propValue) : DOMPropertyOperations_1.deleteValueForAttribute(domElement, propKey) : null != propValue ? DOMPropertyOperations_1.setValueForProperty(domElement, propKey, propValue) : // If we're updating to null or undefined, we should remove the property
        // from the DOM node instead of inadvertently setting to a string. This
        // brings us in line with the same behavior we have on initial render.
        DOMPropertyOperations_1.deleteValueForProperty(domElement, propKey);
    }
}

var ReactDOMFiberComponent = {
    createElement: function(type, props, rootContainerElement, parentNamespace) {
        // We create tags in the namespace of their parent container, except HTML
        var domElement, ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement), namespaceURI = parentNamespace;
        if (namespaceURI === HTML_NAMESPACE && (namespaceURI = getIntrinsicNamespace(type)), 
        namespaceURI === HTML_NAMESPACE) if ("script" === type) {
            // Create the script via .innerHTML so its "parser-inserted" flag is
            // set to true and it does not execute
            var div = ownerDocument.createElement("div");
            div.innerHTML = "<script><" + "/script>";
            // eslint-disable-line
            // This is guaranteed to yield a script element.
            var firstChild = div.firstChild;
            domElement = div.removeChild(firstChild);
        } else // $FlowIssue `createElement` should be updated for Web Components
        domElement = "string" == typeof props.is ? ownerDocument.createElement(type, {
            is: props.is
        }) : ownerDocument.createElement(type); else domElement = ownerDocument.createElementNS(namespaceURI, type);
        return domElement;
    },
    createTextNode: function(text, rootContainerElement) {
        return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(text);
    },
    setInitialProperties: function(domElement, tag, rawProps, rootContainerElement) {
        var props, isCustomComponentTag = isCustomComponent_1(tag, rawProps);
        switch (tag) {
          case "iframe":
          case "object":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topLoad", "load", domElement), props = rawProps;
            break;

          case "video":
          case "audio":
            // Create listener for each media event
            for (var event in mediaEvents) mediaEvents.hasOwnProperty(event) && ReactBrowserEventEmitter_1.trapBubbledEvent(event, mediaEvents[event], domElement);
            props = rawProps;
            break;

          case "source":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topError", "error", domElement), props = rawProps;
            break;

          case "img":
          case "image":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topError", "error", domElement), ReactBrowserEventEmitter_1.trapBubbledEvent("topLoad", "load", domElement), 
            props = rawProps;
            break;

          case "form":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topReset", "reset", domElement), ReactBrowserEventEmitter_1.trapBubbledEvent("topSubmit", "submit", domElement), 
            props = rawProps;
            break;

          case "details":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topToggle", "toggle", domElement), 
            props = rawProps;
            break;

          case "input":
            ReactDOMFiberInput.initWrapperState(domElement, rawProps), props = ReactDOMFiberInput.getHostProps(domElement, rawProps), 
            ReactBrowserEventEmitter_1.trapBubbledEvent("topInvalid", "invalid", domElement), 
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, "onChange");
            break;

          case "option":
            ReactDOMFiberOption.validateProps(domElement, rawProps), props = ReactDOMFiberOption.getHostProps(domElement, rawProps);
            break;

          case "select":
            ReactDOMFiberSelect.initWrapperState(domElement, rawProps), props = ReactDOMFiberSelect.getHostProps(domElement, rawProps), 
            ReactBrowserEventEmitter_1.trapBubbledEvent("topInvalid", "invalid", domElement), 
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, "onChange");
            break;

          case "textarea":
            ReactDOMFiberTextarea.initWrapperState(domElement, rawProps), props = ReactDOMFiberTextarea.getHostProps(domElement, rawProps), 
            ReactBrowserEventEmitter_1.trapBubbledEvent("topInvalid", "invalid", domElement), 
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, "onChange");
            break;

          default:
            props = rawProps;
        }
        switch (assertValidProps_1(tag, props, getStack), setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag), 
        tag) {
          case "input":
            // TODO: Make sure we check if this is still unmounted or do any clean
            // up necessary since we never stop tracking anymore.
            inputValueTracking_1.track(domElement), ReactDOMFiberInput.postMountWrapper(domElement, rawProps);
            break;

          case "textarea":
            // TODO: Make sure we check if this is still unmounted or do any clean
            // up necessary since we never stop tracking anymore.
            inputValueTracking_1.track(domElement), ReactDOMFiberTextarea.postMountWrapper(domElement, rawProps);
            break;

          case "option":
            ReactDOMFiberOption.postMountWrapper(domElement, rawProps);
            break;

          case "select":
            ReactDOMFiberSelect.postMountWrapper(domElement, rawProps);
            break;

          default:
            "function" == typeof props.onClick && // TODO: This cast may not be sound for SVG, MathML or custom elements.
            trapClickOnNonInteractiveElement(domElement);
        }
    },
    // Calculate the diff between the two objects.
    diffProperties: function(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
        var lastProps, nextProps, updatePayload = null;
        switch (tag) {
          case "input":
            lastProps = ReactDOMFiberInput.getHostProps(domElement, lastRawProps), nextProps = ReactDOMFiberInput.getHostProps(domElement, nextRawProps), 
            updatePayload = [];
            break;

          case "option":
            lastProps = ReactDOMFiberOption.getHostProps(domElement, lastRawProps), nextProps = ReactDOMFiberOption.getHostProps(domElement, nextRawProps), 
            updatePayload = [];
            break;

          case "select":
            lastProps = ReactDOMFiberSelect.getHostProps(domElement, lastRawProps), nextProps = ReactDOMFiberSelect.getHostProps(domElement, nextRawProps), 
            updatePayload = [];
            break;

          case "textarea":
            lastProps = ReactDOMFiberTextarea.getHostProps(domElement, lastRawProps), nextProps = ReactDOMFiberTextarea.getHostProps(domElement, nextRawProps), 
            updatePayload = [];
            break;

          default:
            lastProps = lastRawProps, nextProps = nextRawProps, "function" != typeof lastProps.onClick && "function" == typeof nextProps.onClick && // TODO: This cast may not be sound for SVG, MathML or custom elements.
            trapClickOnNonInteractiveElement(domElement);
        }
        assertValidProps_1(tag, nextProps, getStack);
        var propKey, styleName, styleUpdates = null;
        for (propKey in lastProps) if (!nextProps.hasOwnProperty(propKey) && lastProps.hasOwnProperty(propKey) && null != lastProps[propKey]) if (propKey === STYLE) {
            var lastStyle = lastProps[propKey];
            for (styleName in lastStyle) lastStyle.hasOwnProperty(styleName) && (styleUpdates || (styleUpdates = {}), 
            styleUpdates[styleName] = "");
        } else propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN || propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1 || propKey === AUTOFOCUS || (registrationNameModules.hasOwnProperty(propKey) ? // This is a special case. If any listener updates we need to ensure
        // that the "current" fiber pointer gets updated so we need a commit
        // to update this element.
        updatePayload || (updatePayload = []) : // For all other deleted properties we add it to the queue. We use
        // the whitelist in the commit phase instead.
        (updatePayload = updatePayload || []).push(propKey, null));
        for (propKey in nextProps) {
            var nextProp = nextProps[propKey], lastProp = null != lastProps ? lastProps[propKey] : void 0;
            if (nextProps.hasOwnProperty(propKey) && nextProp !== lastProp && (null != nextProp || null != lastProp)) if (propKey === STYLE) if (lastProp) {
                // Unset styles on `lastProp` but not on `nextProp`.
                for (styleName in lastProp) !lastProp.hasOwnProperty(styleName) || nextProp && nextProp.hasOwnProperty(styleName) || (styleUpdates || (styleUpdates = {}), 
                styleUpdates[styleName] = "");
                // Update styles that changed since `lastProp`.
                for (styleName in nextProp) nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName] && (styleUpdates || (styleUpdates = {}), 
                styleUpdates[styleName] = nextProp[styleName]);
            } else // Relies on `updateStylesByID` not mutating `styleUpdates`.
            styleUpdates || (updatePayload || (updatePayload = []), updatePayload.push(propKey, styleUpdates)), 
            styleUpdates = nextProp; else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
                var nextHtml = nextProp ? nextProp[HTML] : void 0, lastHtml = lastProp ? lastProp[HTML] : void 0;
                null != nextHtml && lastHtml !== nextHtml && (updatePayload = updatePayload || []).push(propKey, "" + nextHtml);
            } else propKey === CHILDREN ? lastProp === nextProp || "string" != typeof nextProp && "number" != typeof nextProp || (updatePayload = updatePayload || []).push(propKey, "" + nextProp) : propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1 || (registrationNameModules.hasOwnProperty(propKey) ? (null != nextProp && (// We eagerly listen to this even though we haven't committed yet.
            1 || "function" == typeof nextProp || warnForInvalidEventListener(propKey, nextProp), 
            ensureListeningTo(rootContainerElement, propKey)), updatePayload || lastProp === nextProp || (// This is a special case. If any listener updates we need to ensure
            // that the "current" props pointer gets updated so we need a commit
            // to update this element.
            updatePayload = [])) : // For any other property we always add it to the queue and then we
            // filter it out using the whitelist during the commit.
            (updatePayload = updatePayload || []).push(propKey, nextProp));
        }
        return styleUpdates && (updatePayload = updatePayload || []).push(STYLE, styleUpdates), 
        updatePayload;
    },
    // Apply the diff.
    updateProperties: function(domElement, updatePayload, tag, lastRawProps, nextRawProps) {
        // TODO: Ensure that an update gets scheduled if any of the special props
        // changed.
        switch (// Apply the diff.
        updateDOMProperties(domElement, updatePayload, isCustomComponent_1(tag, lastRawProps), isCustomComponent_1(tag, nextRawProps)), 
        tag) {
          case "input":
            // Update the wrapper around inputs *after* updating props. This has to
            // happen after `updateDOMProperties`. Otherwise HTML5 input validations
            // raise warnings and prevent the new value from being assigned.
            ReactDOMFiberInput.updateWrapper(domElement, nextRawProps), // We also check that we haven't missed a value update, such as a
            // Radio group shifting the checked value to another named radio input.
            inputValueTracking_1.updateValueIfChanged(domElement);
            break;

          case "textarea":
            ReactDOMFiberTextarea.updateWrapper(domElement, nextRawProps);
            break;

          case "select":
            // <select> value update needs to occur after <option> children
            // reconciliation
            ReactDOMFiberSelect.postUpdateWrapper(domElement, nextRawProps);
        }
    },
    diffHydratedProperties: function(domElement, tag, rawProps, parentNamespace, rootContainerElement) {
        var suppressHydrationWarning;
        switch (tag) {
          case "iframe":
          case "object":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topLoad", "load", domElement);
            break;

          case "video":
          case "audio":
            // Create listener for each media event
            for (var event in mediaEvents) mediaEvents.hasOwnProperty(event) && ReactBrowserEventEmitter_1.trapBubbledEvent(event, mediaEvents[event], domElement);
            break;

          case "source":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topError", "error", domElement);
            break;

          case "img":
          case "image":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topError", "error", domElement), ReactBrowserEventEmitter_1.trapBubbledEvent("topLoad", "load", domElement);
            break;

          case "form":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topReset", "reset", domElement), ReactBrowserEventEmitter_1.trapBubbledEvent("topSubmit", "submit", domElement);
            break;

          case "details":
            ReactBrowserEventEmitter_1.trapBubbledEvent("topToggle", "toggle", domElement);
            break;

          case "input":
            ReactDOMFiberInput.initWrapperState(domElement, rawProps), ReactBrowserEventEmitter_1.trapBubbledEvent("topInvalid", "invalid", domElement), 
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, "onChange");
            break;

          case "option":
            ReactDOMFiberOption.validateProps(domElement, rawProps);
            break;

          case "select":
            ReactDOMFiberSelect.initWrapperState(domElement, rawProps), ReactBrowserEventEmitter_1.trapBubbledEvent("topInvalid", "invalid", domElement), 
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, "onChange");
            break;

          case "textarea":
            ReactDOMFiberTextarea.initWrapperState(domElement, rawProps), ReactBrowserEventEmitter_1.trapBubbledEvent("topInvalid", "invalid", domElement), 
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, "onChange");
        }
        assertValidProps_1(tag, rawProps, getStack);
        var updatePayload = null;
        for (var propKey in rawProps) if (rawProps.hasOwnProperty(propKey)) {
            var nextProp = rawProps[propKey];
            propKey === CHILDREN ? // For text content children we compare against textContent. This
            // might match additional HTML that is hidden when we read it using
            // textContent. E.g. "foo" will match "f<span>oo</span>" but that still
            // satisfies our requirement. Our requirement is not to produce perfect
            // HTML and attributes. Ideally we should preserve structure but it's
            // ok not to if the visible content is still enough to indicate what
            // even listeners these nodes might be wired up to.
            // TODO: Warn if there is more than a single textNode as a child.
            // TODO: Should we use domElement.firstChild.nodeValue to compare?
            "string" == typeof nextProp ? domElement.textContent !== nextProp && (1 || suppressHydrationWarning || warnForTextDifference(domElement.textContent, nextProp), 
            updatePayload = [ CHILDREN, nextProp ]) : "number" == typeof nextProp && domElement.textContent !== "" + nextProp && (1 || suppressHydrationWarning || warnForTextDifference(domElement.textContent, nextProp), 
            updatePayload = [ CHILDREN, "" + nextProp ]) : registrationNameModules.hasOwnProperty(propKey) && null != nextProp && (1 || "function" == typeof nextProp || warnForInvalidEventListener(propKey, nextProp), 
            ensureListeningTo(rootContainerElement, propKey));
        }
        switch (tag) {
          case "input":
            // TODO: Make sure we check if this is still unmounted or do any clean
            // up necessary since we never stop tracking anymore.
            inputValueTracking_1.track(domElement), ReactDOMFiberInput.postMountWrapper(domElement, rawProps);
            break;

          case "textarea":
            // TODO: Make sure we check if this is still unmounted or do any clean
            // up necessary since we never stop tracking anymore.
            inputValueTracking_1.track(domElement), ReactDOMFiberTextarea.postMountWrapper(domElement, rawProps);
            break;

          case "select":
          case "option":
            // For input and textarea we current always set the value property at
            // post mount to force it to diverge from attributes. However, for
            // option and select we don't quite do the same thing and select
            // is not resilient to the DOM state changing so we don't do that here.
            // TODO: Consider not doing this for input and textarea.
            break;

          default:
            "function" == typeof rawProps.onClick && // TODO: This cast may not be sound for SVG, MathML or custom elements.
            trapClickOnNonInteractiveElement(domElement);
        }
        return updatePayload;
    },
    diffHydratedText: function(textNode, text) {
        return textNode.nodeValue !== text;
    },
    warnForUnmatchedText: function(textNode, text) {},
    warnForDeletedHydratableElement: function(parentNode, child) {},
    warnForDeletedHydratableText: function(parentNode, child) {},
    warnForInsertedHydratedElement: function(parentNode, tag, props) {},
    warnForInsertedHydratedText: function(parentNode, text) {},
    restoreControlledState: function(domElement, tag, props) {
        switch (tag) {
          case "input":
            return void ReactDOMFiberInput.restoreControlledState(domElement, props);

          case "textarea":
            return void ReactDOMFiberTextarea.restoreControlledState(domElement, props);

          case "select":
            return void ReactDOMFiberSelect.restoreControlledState(domElement, props);
        }
    }
}, ReactDOMFiberComponent_1 = ReactDOMFiberComponent, TEXT_NODE$4 = HTMLNodeType_1.TEXT_NODE;

/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */
function getLeafNode(node) {
    for (;node && node.firstChild; ) node = node.firstChild;
    return node;
}

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
function getSiblingNode(node) {
    for (;node; ) {
        if (node.nextSibling) return node.nextSibling;
        node = node.parentNode;
    }
}

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
function getNodeForCharacterOffset(root, offset) {
    for (var node = getLeafNode(root), nodeStart = 0, nodeEnd = 0; node; ) {
        if (node.nodeType === TEXT_NODE$4) {
            if (nodeEnd = nodeStart + node.textContent.length, nodeStart <= offset && nodeEnd >= offset) return {
                node: node,
                offset: offset - nodeStart
            };
            nodeStart = nodeEnd;
        }
        node = getLeafNode(getSiblingNode(node));
    }
}

var getNodeForCharacterOffset_1 = getNodeForCharacterOffset, contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
function getTextContentAccessor() {
    // Prefer textContent to innerText because many browsers support both but
    // SVG <text> elements don't support innerText even when <div> does.
    return !contentKey && ExecutionEnvironment.canUseDOM && (contentKey = "textContent" in document.documentElement ? "textContent" : "innerText"), 
    contentKey;
}

var getTextContentAccessor_1 = getTextContentAccessor, TEXT_NODE$3 = HTMLNodeType_1.TEXT_NODE;

/**
 * @param {DOMElement} outerNode
 * @return {?object}
 */
function getModernOffsets(outerNode) {
    var selection = window.getSelection && window.getSelection();
    if (!selection || 0 === selection.rangeCount) return null;
    var anchorNode = selection.anchorNode, anchorOffset = selection.anchorOffset, focusNode$$1 = selection.focusNode, focusOffset = selection.focusOffset;
    // In Firefox, anchorNode and focusNode can be "anonymous divs", e.g. the
    // up/down buttons on an <input type="number">. Anonymous divs do not seem to
    // expose properties, triggering a "Permission denied error" if any of its
    // properties are accessed. The only seemingly possible way to avoid erroring
    // is to access a property that typically works for non-anonymous divs and
    // catch any error that may otherwise arise. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=208427
    try {
        /* eslint-disable no-unused-expressions */
        anchorNode.nodeType, focusNode$$1.nodeType;
    } catch (e) {
        return null;
    }
    return getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode$$1, focusOffset);
}

/**
 * Returns {start, end} where `start` is the character/codepoint index of
 * (anchorNode, anchorOffset) within the textContent of `outerNode`, and
 * `end` is the index of (focusNode, focusOffset).
 *
 * Returns null if you pass in garbage input but we should probably just crash.
 */
function getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode$$1, focusOffset) {
    var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = outerNode, parentNode = null;
    outer: for (;!0; ) {
        for (var next = null; !0 && (node !== anchorNode || 0 !== anchorOffset && node.nodeType !== TEXT_NODE$3 || (start = length + anchorOffset), 
        node !== focusNode$$1 || 0 !== focusOffset && node.nodeType !== TEXT_NODE$3 || (end = length + focusOffset), 
        node.nodeType === TEXT_NODE$3 && (length += node.nodeValue.length), null !== (next = node.firstChild)); ) // Moving from `node` to its first child `next`.
        parentNode = node, node = next;
        for (;!0; ) {
            if (node === outerNode) // If `outerNode` has children, this is always the second time visiting
            // it. If it has no children, this is still the first loop, and the only
            // valid selection is anchorNode and focusNode both equal to this node
            // and both offsets 0, in which case we will have handled above.
            break outer;
            if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset && (start = length), 
            parentNode === focusNode$$1 && ++indexWithinFocus === focusOffset && (end = length), 
            null !== (next = node.nextSibling)) break;
            node = parentNode, parentNode = node.parentNode;
        }
        // Moving from `node` to its next sibling `next`.
        node = next;
    }
    return -1 === start || -1 === end ? null : {
        start: start,
        end: end
    };
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programmatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setModernOffsets(node, offsets) {
    if (window.getSelection) {
        var selection = window.getSelection(), length = node[getTextContentAccessor_1()].length, start = Math.min(offsets.start, length), end = void 0 === offsets.end ? start : Math.min(offsets.end, length);
        // IE 11 uses modern selection, but doesn't support the extend method.
        // Flip backward selections, so we can set with a single range.
        if (!selection.extend && start > end) {
            var temp = end;
            end = start, start = temp;
        }
        var startMarker = getNodeForCharacterOffset_1(node, start), endMarker = getNodeForCharacterOffset_1(node, end);
        if (startMarker && endMarker) {
            if (1 === selection.rangeCount && selection.anchorNode === startMarker.node && selection.anchorOffset === startMarker.offset && selection.focusNode === endMarker.node && selection.focusOffset === endMarker.offset) return;
            var range = document.createRange();
            range.setStart(startMarker.node, startMarker.offset), selection.removeAllRanges(), 
            start > end ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), 
            selection.addRange(range));
        }
    }
}

var ReactDOMSelection = {
    /**
   * @param {DOMElement} node
   */
    getOffsets: getModernOffsets,
    // For tests.
    getModernOffsetsFromPoints: getModernOffsetsFromPoints,
    /**
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */
    setOffsets: setModernOffsets
}, ReactDOMSelection_1 = ReactDOMSelection, ELEMENT_NODE$1 = HTMLNodeType_1.ELEMENT_NODE;

function isInDocument(node) {
    return containsNode(document.documentElement, node);
}

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */
var ReactInputSelection = {
    hasSelectionCapabilities: function(elem) {
        var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
        return nodeName && ("input" === nodeName && "text" === elem.type || "textarea" === nodeName || "true" === elem.contentEditable);
    },
    getSelectionInformation: function() {
        var focusedElem = getActiveElement();
        return {
            focusedElem: focusedElem,
            selectionRange: ReactInputSelection.hasSelectionCapabilities(focusedElem) ? ReactInputSelection.getSelection(focusedElem) : null
        };
    },
    /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */
    restoreSelection: function(priorSelectionInformation) {
        var curFocusedElem = getActiveElement(), priorFocusedElem = priorSelectionInformation.focusedElem, priorSelectionRange = priorSelectionInformation.selectionRange;
        if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
            ReactInputSelection.hasSelectionCapabilities(priorFocusedElem) && ReactInputSelection.setSelection(priorFocusedElem, priorSelectionRange);
            for (// Focusing a node can change the scroll position, which is undesirable
            var ancestors = [], ancestor = priorFocusedElem; ancestor = ancestor.parentNode; ) ancestor.nodeType === ELEMENT_NODE$1 && ancestors.push({
                element: ancestor,
                left: ancestor.scrollLeft,
                top: ancestor.scrollTop
            });
            focusNode(priorFocusedElem);
            for (var i = 0; i < ancestors.length; i++) {
                var info = ancestors[i];
                info.element.scrollLeft = info.left, info.element.scrollTop = info.top;
            }
        }
    },
    /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */
    getSelection: function(input) {
        return ("selectionStart" in input ? {
            start: input.selectionStart,
            end: input.selectionEnd
        } : ReactDOMSelection_1.getOffsets(input)) || {
            start: 0,
            end: 0
        };
    },
    /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */
    setSelection: function(input, offsets) {
        var start = offsets.start, end = offsets.end;
        void 0 === end && (end = start), "selectionStart" in input ? (input.selectionStart = start, 
        input.selectionEnd = Math.min(end, input.value.length)) : ReactDOMSelection_1.setOffsets(input, offsets);
    }
}, ReactInputSelection_1 = ReactInputSelection, HostComponent$10 = ReactTypeOfWork.HostComponent;

function getParent(inst) {
    do {
        inst = inst.return;
    } while (inst && inst.tag !== HostComponent$10);
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
}, getListener = EventPluginHub_1.getListener;

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
}, EventPropagators_1 = EventPropagators, compositionState = {
    _root: null,
    _startText: null,
    _fallbackText: null
}, FallbackCompositionState = {
    initialize: function(nativeEventTarget) {
        return compositionState._root = nativeEventTarget, compositionState._startText = FallbackCompositionState.getText(), 
        !0;
    },
    reset: function() {
        compositionState._root = null, compositionState._startText = null, compositionState._fallbackText = null;
    },
    getData: function() {
        if (compositionState._fallbackText) return compositionState._fallbackText;
        var start, end, startValue = compositionState._startText, startLength = startValue.length, endValue = FallbackCompositionState.getText(), endLength = endValue.length;
        for (start = 0; start < startLength && startValue[start] === endValue[start]; start++) ;
        var minEnd = startLength - start;
        for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++) ;
        var sliceTail = end > 1 ? 1 - end : void 0;
        return compositionState._fallbackText = endValue.slice(start, sliceTail), compositionState._fallbackText;
    },
    getText: function() {
        return "value" in compositionState._root ? compositionState._root.value : compositionState._root[getTextContentAccessor_1()];
    }
}, FallbackCompositionState_1 = FallbackCompositionState, EVENT_POOL_SIZE = 10, shouldBeReleasedProperties = [ "dispatchConfig", "_targetInst", "nativeEvent", "isDefaultPrevented", "isPropagationStopped", "_dispatchListeners", "_dispatchInstances" ], EventInterface = {
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
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
 */
var CompositionEventInterface = {
    data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticCompositionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent_1.augmentClass(SyntheticCompositionEvent, CompositionEventInterface);

var SyntheticCompositionEvent_1 = SyntheticCompositionEvent, InputEventInterface = {
    data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticInputEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent_1.augmentClass(SyntheticInputEvent, InputEventInterface);

var SyntheticInputEvent_1 = SyntheticInputEvent, END_KEYCODES = [ 9, 13, 27, 32 ], START_KEYCODE = 229, canUseCompositionEvent = ExecutionEnvironment.canUseDOM && "CompositionEvent" in window, documentMode = null;

ExecutionEnvironment.canUseDOM && "documentMode" in document && (documentMode = document.documentMode);

// Webkit offers a very useful `textInput` event that can be used to
// directly represent `beforeInput`. The IE `textinput` event is not as
// useful, so we don't use it.
var canUseTextInputEvent = ExecutionEnvironment.canUseDOM && "TextEvent" in window && !documentMode && !isPresto(), useFallbackCompositionData = ExecutionEnvironment.canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);

/**
 * Opera <= 12 includes TextEvent in window, but does not fire
 * text input events. Rely on keypress instead.
 */
function isPresto() {
    var opera = window.opera;
    return "object" == typeof opera && "function" == typeof opera.version && parseInt(opera.version(), 10) <= 12;
}

var SPACEBAR_CODE = 32, SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE), eventTypes = {
    beforeInput: {
        phasedRegistrationNames: {
            bubbled: "onBeforeInput",
            captured: "onBeforeInputCapture"
        },
        dependencies: [ "topCompositionEnd", "topKeyPress", "topTextInput", "topPaste" ]
    },
    compositionEnd: {
        phasedRegistrationNames: {
            bubbled: "onCompositionEnd",
            captured: "onCompositionEndCapture"
        },
        dependencies: [ "topBlur", "topCompositionEnd", "topKeyDown", "topKeyPress", "topKeyUp", "topMouseDown" ]
    },
    compositionStart: {
        phasedRegistrationNames: {
            bubbled: "onCompositionStart",
            captured: "onCompositionStartCapture"
        },
        dependencies: [ "topBlur", "topCompositionStart", "topKeyDown", "topKeyPress", "topKeyUp", "topMouseDown" ]
    },
    compositionUpdate: {
        phasedRegistrationNames: {
            bubbled: "onCompositionUpdate",
            captured: "onCompositionUpdateCapture"
        },
        dependencies: [ "topBlur", "topCompositionUpdate", "topKeyDown", "topKeyPress", "topKeyUp", "topMouseDown" ]
    }
}, hasSpaceKeypress = !1;

/**
 * Return whether a native keypress event is assumed to be a command.
 * This is required because Firefox fires `keypress` events for key commands
 * (cut, copy, select-all, etc.) even though no character is inserted.
 */
function isKeypressCommand(nativeEvent) {
    // ctrlKey && altKey is equivalent to AltGr, and is not a command.
    return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) && !(nativeEvent.ctrlKey && nativeEvent.altKey);
}

/**
 * Translate native top level events into event types.
 *
 * @param {string} topLevelType
 * @return {object}
 */
function getCompositionEventType(topLevelType) {
    switch (topLevelType) {
      case "topCompositionStart":
        return eventTypes.compositionStart;

      case "topCompositionEnd":
        return eventTypes.compositionEnd;

      case "topCompositionUpdate":
        return eventTypes.compositionUpdate;
    }
}

/**
 * Does our fallback best-guess model think this event signifies that
 * composition has begun?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackCompositionStart(topLevelType, nativeEvent) {
    return "topKeyDown" === topLevelType && nativeEvent.keyCode === START_KEYCODE;
}

/**
 * Does our fallback mode think that this event is the end of composition?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackCompositionEnd(topLevelType, nativeEvent) {
    switch (topLevelType) {
      case "topKeyUp":
        // Command keys insert or clear IME input.
        return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);

      case "topKeyDown":
        // Expect IME keyCode on each keydown. If we get any other
        // code we must have exited earlier.
        return nativeEvent.keyCode !== START_KEYCODE;

      case "topKeyPress":
      case "topMouseDown":
      case "topBlur":
        // Events are not possible without cancelling IME.
        return !0;

      default:
        return !1;
    }
}

/**
 * Google Input Tools provides composition data via a CustomEvent,
 * with the `data` property populated in the `detail` object. If this
 * is available on the event object, use it. If not, this is a plain
 * composition event and we have nothing special to extract.
 *
 * @param {object} nativeEvent
 * @return {?string}
 */
function getDataFromCustomEvent(nativeEvent) {
    var detail = nativeEvent.detail;
    return "object" == typeof detail && "data" in detail ? detail.data : null;
}

// Track the current IME composition status, if any.
var isComposing = !1;

/**
 * @return {?object} A SyntheticCompositionEvent.
 */
function extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var eventType, fallbackData;
    if (canUseCompositionEvent ? eventType = getCompositionEventType(topLevelType) : isComposing ? isFallbackCompositionEnd(topLevelType, nativeEvent) && (eventType = eventTypes.compositionEnd) : isFallbackCompositionStart(topLevelType, nativeEvent) && (eventType = eventTypes.compositionStart), 
    !eventType) return null;
    useFallbackCompositionData && (// The current composition is stored statically and must not be
    // overwritten while composition continues.
    isComposing || eventType !== eventTypes.compositionStart ? eventType === eventTypes.compositionEnd && isComposing && (fallbackData = FallbackCompositionState_1.getData()) : isComposing = FallbackCompositionState_1.initialize(nativeEventTarget));
    var event = SyntheticCompositionEvent_1.getPooled(eventType, targetInst, nativeEvent, nativeEventTarget);
    if (fallbackData) // Inject data generated from fallback path into the synthetic event.
    // This matches the property of native CompositionEventInterface.
    event.data = fallbackData; else {
        var customData = getDataFromCustomEvent(nativeEvent);
        null !== customData && (event.data = customData);
    }
    return EventPropagators_1.accumulateTwoPhaseDispatches(event), event;
}

/**
 * @param {TopLevelTypes} topLevelType Record from `BrowserEventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The string corresponding to this `beforeInput` event.
 */
function getNativeBeforeInputChars(topLevelType, nativeEvent) {
    switch (topLevelType) {
      case "topCompositionEnd":
        return getDataFromCustomEvent(nativeEvent);

      case "topKeyPress":
        return nativeEvent.which !== SPACEBAR_CODE ? null : (hasSpaceKeypress = !0, SPACEBAR_CHAR);

      case "topTextInput":
        // Record the characters to be added to the DOM.
        var chars = nativeEvent.data;
        // If it's a spacebar character, assume that we have already handled
        // it at the keypress level and bail immediately. Android Chrome
        // doesn't give us keycodes, so we need to blacklist it.
        // If it's a spacebar character, assume that we have already handled
        // it at the keypress level and bail immediately. Android Chrome
        // doesn't give us keycodes, so we need to blacklist it.
        return chars === SPACEBAR_CHAR && hasSpaceKeypress ? null : chars;

      default:
        // For other native event types, do nothing.
        return null;
    }
}

/**
 * For browsers that do not provide the `textInput` event, extract the
 * appropriate string to use for SyntheticInputEvent.
 *
 * @param {string} topLevelType Record from `BrowserEventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The fallback string for this `beforeInput` event.
 */
function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
    // If we are currently composing (IME) and using a fallback to do so,
    // try to extract the composed characters from the fallback object.
    // If composition event is available, we extract a string only at
    // compositionevent, otherwise extract it at fallback events.
    if (isComposing) {
        if ("topCompositionEnd" === topLevelType || !canUseCompositionEvent && isFallbackCompositionEnd(topLevelType, nativeEvent)) {
            var chars = FallbackCompositionState_1.getData();
            return FallbackCompositionState_1.reset(), isComposing = !1, chars;
        }
        return null;
    }
    switch (topLevelType) {
      case "topPaste":
        // If a paste event occurs after a keypress, throw out the input
        // chars. Paste events should not lead to BeforeInput events.
        return null;

      case "topKeyPress":
        /**
       * As of v27, Firefox may fire keypress events even when no character
       * will be inserted. A few possibilities:
       *
       * - `which` is `0`. Arrow keys, Esc key, etc.
       *
       * - `which` is the pressed key code, but no char is available.
       *   Ex: 'AltGr + d` in Polish. There is no modified character for
       *   this key combination and no character is inserted into the
       *   document, but FF fires the keypress for char code `100` anyway.
       *   No `input` event will occur.
       *
       * - `which` is the pressed key code, but a command combination is
       *   being used. Ex: `Cmd+C`. No character is inserted, and no
       *   `input` event will occur.
       */
        if (!isKeypressCommand(nativeEvent)) {
            // IE fires the `keypress` event when a user types an emoji via
            // Touch keyboard of Windows.  In such a case, the `char` property
            // holds an emoji character like `\uD83D\uDE0A`.  Because its length
            // is 2, the property `which` does not represent an emoji correctly.
            // In such a case, we directly return the `char` property instead of
            // using `which`.
            if (nativeEvent.char && nativeEvent.char.length > 1) return nativeEvent.char;
            if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
        }
        return null;

      case "topCompositionEnd":
        return useFallbackCompositionData ? null : nativeEvent.data;

      default:
        return null;
    }
}

/**
 * Extract a SyntheticInputEvent for `beforeInput`, based on either native
 * `textInput` or fallback behavior.
 *
 * @return {?object} A SyntheticInputEvent.
 */
function extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var chars;
    // If no characters are being inserted, no BeforeInput event should
    // be fired.
    if (!(chars = canUseTextInputEvent ? getNativeBeforeInputChars(topLevelType, nativeEvent) : getFallbackBeforeInputChars(topLevelType, nativeEvent))) return null;
    var event = SyntheticInputEvent_1.getPooled(eventTypes.beforeInput, targetInst, nativeEvent, nativeEventTarget);
    return event.data = chars, EventPropagators_1.accumulateTwoPhaseDispatches(event), 
    event;
}

/**
 * Create an `onBeforeInput` event to match
 * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
 *
 * This event plugin is based on the native `textInput` event
 * available in Chrome, Safari, Opera, and IE. This event fires after
 * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
 *
 * `beforeInput` is spec'd but not implemented in any browsers, and
 * the `input` event does not provide any useful information about what has
 * actually been added, contrary to the spec. Thus, `textInput` is the best
 * available event to identify the characters that have actually been inserted
 * into the target node.
 *
 * This plugin is also responsible for emitting `composition` events, thus
 * allowing us to share composition fallback code for both `beforeInput` and
 * `composition` event types.
 */
var BeforeInputEventPlugin = {
    eventTypes: eventTypes,
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        return [ extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget), extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) ];
    }
}, BeforeInputEventPlugin_1 = BeforeInputEventPlugin, supportedInputTypes = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
};

function isTextInputElement(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName;
}

var isTextInputElement_1 = isTextInputElement, eventTypes$1 = {
    change: {
        phasedRegistrationNames: {
            bubbled: "onChange",
            captured: "onChangeCapture"
        },
        dependencies: [ "topBlur", "topChange", "topClick", "topFocus", "topInput", "topKeyDown", "topKeyUp", "topSelectionChange" ]
    }
};

function createAndAccumulateChangeEvent(inst, nativeEvent, target) {
    var event = SyntheticEvent_1.getPooled(eventTypes$1.change, inst, nativeEvent, target);
    // Flag this event loop as needing state restore.
    return event.type = "change", ReactControlledComponent_1.enqueueStateRestore(target), 
    EventPropagators_1.accumulateTwoPhaseDispatches(event), event;
}

/**
 * For IE shims
 */
var activeElement = null, activeElementInst = null;

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
    var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
    return "select" === nodeName || "input" === nodeName && "file" === elem.type;
}

function manualDispatchChangeEvent(nativeEvent) {
    var event = createAndAccumulateChangeEvent(activeElementInst, nativeEvent, getEventTarget_1(nativeEvent));
    // If change and propertychange bubbled, we'd just bind to it like all the
    // other events and have it go through ReactBrowserEventEmitter. Since it
    // doesn't, we manually listen for the events and so we have to enqueue and
    // process the abstract event manually.
    //
    // Batching is necessary here in order to ensure that all event handlers run
    // before the next rerender (including event handlers attached to ancestor
    // elements instead of directly on the input). Without this, controlled
    // components don't work properly in conjunction with event bubbling because
    // the component is rerendered and the value reverted before all the event
    // handlers can run. See https://github.com/facebook/react/issues/708.
    ReactGenericBatching_1.batchedUpdates(runEventInBatch, event);
}

function runEventInBatch(event) {
    EventPluginHub_1.enqueueEvents(event), EventPluginHub_1.processEventQueue(!1);
}

function getInstIfValueChanged(targetInst) {
    var targetNode = ReactDOMComponentTree_1.getNodeFromInstance(targetInst);
    if (inputValueTracking_1.updateValueIfChanged(targetNode)) return targetInst;
}

function getTargetInstForChangeEvent(topLevelType, targetInst) {
    if ("topChange" === topLevelType) return targetInst;
}

/**
 * SECTION: handle `input` event
 */
var isInputEventSupported = !1;

ExecutionEnvironment.canUseDOM && (// IE9 claims to support the input event but fails to trigger it when
// deleting text, so we ignore its input events.
isInputEventSupported = isEventSupported_1("input") && (!document.documentMode || document.documentMode > 9));

/**
 * (For IE <=9) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
function startWatchingForValueChange(target, targetInst) {
    activeElement = target, activeElementInst = targetInst, activeElement.attachEvent("onpropertychange", handlePropertyChange);
}

/**
 * (For IE <=9) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
function stopWatchingForValueChange() {
    activeElement && (activeElement.detachEvent("onpropertychange", handlePropertyChange), 
    activeElement = null, activeElementInst = null);
}

/**
 * (For IE <=9) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
function handlePropertyChange(nativeEvent) {
    "value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst) && manualDispatchChangeEvent(nativeEvent);
}

function handleEventsForInputEventPolyfill(topLevelType, target, targetInst) {
    "topFocus" === topLevelType ? (// In IE9, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForValueChange(), startWatchingForValueChange(target, targetInst)) : "topBlur" === topLevelType && stopWatchingForValueChange();
}

// For IE8 and IE9.
function getTargetInstForInputEventPolyfill(topLevelType, targetInst) {
    if ("topSelectionChange" === topLevelType || "topKeyUp" === topLevelType || "topKeyDown" === topLevelType) // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
    return getInstIfValueChanged(activeElementInst);
}

/**
 * SECTION: handle `click` event
 */
function shouldUseClickEvent(elem) {
    // Use the `click` event to detect changes to checkbox and radio inputs.
    // This approach works across all browsers, whereas `change` does not fire
    // until `blur` in IE8.
    var nodeName = elem.nodeName;
    return nodeName && "input" === nodeName.toLowerCase() && ("checkbox" === elem.type || "radio" === elem.type);
}

function getTargetInstForClickEvent(topLevelType, targetInst) {
    if ("topClick" === topLevelType) return getInstIfValueChanged(targetInst);
}

function getTargetInstForInputOrChangeEvent(topLevelType, targetInst) {
    if ("topInput" === topLevelType || "topChange" === topLevelType) return getInstIfValueChanged(targetInst);
}

function handleControlledInputBlur(inst, node) {
    // TODO: In IE, inst is occasionally null. Why?
    if (null != inst) {
        // Fiber and ReactDOM keep wrapper state in separate places
        var state = inst._wrapperState || node._wrapperState;
        if (state && state.controlled && "number" === node.type) {
            // If controlled, assign the value attribute to the current value on blur
            var value = "" + node.value;
            node.getAttribute("value") !== value && node.setAttribute("value", value);
        }
    }
}

/**
 * This plugin creates an `onChange` event that normalizes change events
 * across form elements. This event fires at a time when it's possible to
 * change the element's value without seeing a flicker.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - select
 */
var ChangeEventPlugin = {
    eventTypes: eventTypes$1,
    _isInputEventSupported: isInputEventSupported,
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        var getTargetInstFunc, handleEventFunc, targetNode = targetInst ? ReactDOMComponentTree_1.getNodeFromInstance(targetInst) : window;
        if (shouldUseChangeEvent(targetNode) ? getTargetInstFunc = getTargetInstForChangeEvent : isTextInputElement_1(targetNode) ? isInputEventSupported ? getTargetInstFunc = getTargetInstForInputOrChangeEvent : (getTargetInstFunc = getTargetInstForInputEventPolyfill, 
        handleEventFunc = handleEventsForInputEventPolyfill) : shouldUseClickEvent(targetNode) && (getTargetInstFunc = getTargetInstForClickEvent), 
        getTargetInstFunc) {
            var inst = getTargetInstFunc(topLevelType, targetInst);
            if (inst) {
                return createAndAccumulateChangeEvent(inst, nativeEvent, nativeEventTarget);
            }
        }
        handleEventFunc && handleEventFunc(topLevelType, targetNode, targetInst), // When blurring, set the value attribute for number inputs
        "topBlur" === topLevelType && handleControlledInputBlur(targetInst, targetNode);
    }
}, ChangeEventPlugin_1 = ChangeEventPlugin, DOMEventPluginOrder = [ "ResponderEventPlugin", "SimpleEventPlugin", "TapEventPlugin", "EnterLeaveEventPlugin", "ChangeEventPlugin", "SelectEventPlugin", "BeforeInputEventPlugin" ], DOMEventPluginOrder_1 = DOMEventPluginOrder, UIEventInterface = {
    view: null,
    detail: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent_1.augmentClass(SyntheticUIEvent, UIEventInterface);

var SyntheticUIEvent_1 = SyntheticUIEvent, modifierKeyToProp = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
};

// IE8 does not implement getModifierState so we simply map it to the only
// modifier keys exposed by the event itself, does not support Lock-keys.
// Currently, all major browsers except Chrome seems to support Lock-keys.
function modifierStateGetter(keyArg) {
    var syntheticEvent = this, nativeEvent = syntheticEvent.nativeEvent;
    if (nativeEvent.getModifierState) return nativeEvent.getModifierState(keyArg);
    var keyProp = modifierKeyToProp[keyArg];
    return !!keyProp && !!nativeEvent[keyProp];
}

function getEventModifierState(nativeEvent) {
    return modifierStateGetter;
}

var getEventModifierState_1 = getEventModifierState, MouseEventInterface = {
    screenX: null,
    screenY: null,
    clientX: null,
    clientY: null,
    pageX: null,
    pageY: null,
    ctrlKey: null,
    shiftKey: null,
    altKey: null,
    metaKey: null,
    getModifierState: getEventModifierState_1,
    button: null,
    buttons: null,
    relatedTarget: function(event) {
        return event.relatedTarget || (event.fromElement === event.srcElement ? event.toElement : event.fromElement);
    }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticUIEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticUIEvent_1.augmentClass(SyntheticMouseEvent, MouseEventInterface);

var SyntheticMouseEvent_1 = SyntheticMouseEvent, eventTypes$2 = {
    mouseEnter: {
        registrationName: "onMouseEnter",
        dependencies: [ "topMouseOut", "topMouseOver" ]
    },
    mouseLeave: {
        registrationName: "onMouseLeave",
        dependencies: [ "topMouseOut", "topMouseOver" ]
    }
}, EnterLeaveEventPlugin = {
    eventTypes: eventTypes$2,
    /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   */
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        if ("topMouseOver" === topLevelType && (nativeEvent.relatedTarget || nativeEvent.fromElement)) return null;
        if ("topMouseOut" !== topLevelType && "topMouseOver" !== topLevelType) // Must not be a mouse in or mouse out - ignoring.
        return null;
        var win;
        if (nativeEventTarget.window === nativeEventTarget) // `nativeEventTarget` is probably a window object.
        win = nativeEventTarget; else {
            // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
            var doc = nativeEventTarget.ownerDocument;
            win = doc ? doc.defaultView || doc.parentWindow : window;
        }
        var from, to;
        if ("topMouseOut" === topLevelType) {
            from = targetInst;
            var related = nativeEvent.relatedTarget || nativeEvent.toElement;
            to = related ? ReactDOMComponentTree_1.getClosestInstanceFromNode(related) : null;
        } else // Moving to a node from outside the window.
        from = null, to = targetInst;
        if (from === to) // Nothing pertains to our managed components.
        return null;
        var fromNode = null == from ? win : ReactDOMComponentTree_1.getNodeFromInstance(from), toNode = null == to ? win : ReactDOMComponentTree_1.getNodeFromInstance(to), leave = SyntheticMouseEvent_1.getPooled(eventTypes$2.mouseLeave, from, nativeEvent, nativeEventTarget);
        leave.type = "mouseleave", leave.target = fromNode, leave.relatedTarget = toNode;
        var enter = SyntheticMouseEvent_1.getPooled(eventTypes$2.mouseEnter, to, nativeEvent, nativeEventTarget);
        return enter.type = "mouseenter", enter.target = toNode, enter.relatedTarget = fromNode, 
        EventPropagators_1.accumulateEnterLeaveDispatches(leave, enter, from, to), [ leave, enter ];
    }
}, EnterLeaveEventPlugin_1 = EnterLeaveEventPlugin, DOCUMENT_NODE$2 = HTMLNodeType_1.DOCUMENT_NODE, skipSelectionChangeEvent = ExecutionEnvironment.canUseDOM && "documentMode" in document && document.documentMode <= 11, eventTypes$3 = {
    select: {
        phasedRegistrationNames: {
            bubbled: "onSelect",
            captured: "onSelectCapture"
        },
        dependencies: [ "topBlur", "topContextMenu", "topFocus", "topKeyDown", "topKeyUp", "topMouseDown", "topMouseUp", "topSelectionChange" ]
    }
}, activeElement$1 = null, activeElementInst$1 = null, lastSelection = null, mouseDown = !1, isListeningToAllDependencies = ReactBrowserEventEmitter_1.isListeningToAllDependencies;

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getSelection(node) {
    if ("selectionStart" in node && ReactInputSelection_1.hasSelectionCapabilities(node)) return {
        start: node.selectionStart,
        end: node.selectionEnd
    };
    if (window.getSelection) {
        var selection = window.getSelection();
        return {
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode,
            focusOffset: selection.focusOffset
        };
    }
}

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
function constructSelectEvent(nativeEvent, nativeEventTarget) {
    // Ensure we have the right element, and that the user is not dragging a
    // selection (this matches native `select` event behavior). In HTML5, select
    // fires only on input and textarea thus if there's no focused element we
    // won't dispatch.
    if (mouseDown || null == activeElement$1 || activeElement$1 !== getActiveElement()) return null;
    // Only fire when selection has actually changed.
    var currentSelection = getSelection(activeElement$1);
    if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
        lastSelection = currentSelection;
        var syntheticEvent = SyntheticEvent_1.getPooled(eventTypes$3.select, activeElementInst$1, nativeEvent, nativeEventTarget);
        return syntheticEvent.type = "select", syntheticEvent.target = activeElement$1, 
        EventPropagators_1.accumulateTwoPhaseDispatches(syntheticEvent), syntheticEvent;
    }
    return null;
}

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
var SelectEventPlugin = {
    eventTypes: eventTypes$3,
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : nativeEventTarget.nodeType === DOCUMENT_NODE$2 ? nativeEventTarget : nativeEventTarget.ownerDocument;
        if (!doc || !isListeningToAllDependencies("onSelect", doc)) return null;
        var targetNode = targetInst ? ReactDOMComponentTree_1.getNodeFromInstance(targetInst) : window;
        switch (topLevelType) {
          // Track the input node that has focus.
            case "topFocus":
            (isTextInputElement_1(targetNode) || "true" === targetNode.contentEditable) && (activeElement$1 = targetNode, 
            activeElementInst$1 = targetInst, lastSelection = null);
            break;

          case "topBlur":
            activeElement$1 = null, activeElementInst$1 = null, lastSelection = null;
            break;

          // Don't fire the event while the user is dragging. This matches the
            // semantics of the native select event.
            case "topMouseDown":
            mouseDown = !0;
            break;

          case "topContextMenu":
          case "topMouseUp":
            return mouseDown = !1, constructSelectEvent(nativeEvent, nativeEventTarget);

          // Chrome and IE fire non-standard event when selection is changed (and
            // sometimes when it hasn't). IE's event fires out of order with respect
            // to key and input events on deletion, so we discard it.
            //
            // Firefox doesn't support selectionchange, so check selection status
            // after each key entry. The selection changes after keydown and before
            // keyup, but we check on keydown as well in the case of holding down a
            // key, when multiple keydown events are fired but only one keyup is.
            // This is also our approach for IE handling, for the reason above.
            case "topSelectionChange":
            if (skipSelectionChangeEvent) break;

          // falls through
            case "topKeyDown":
          case "topKeyUp":
            return constructSelectEvent(nativeEvent, nativeEventTarget);
        }
        return null;
    }
}, SelectEventPlugin_1 = SelectEventPlugin, AnimationEventInterface = {
    animationName: null,
    elapsedTime: null,
    pseudoElement: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticAnimationEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent_1.augmentClass(SyntheticAnimationEvent, AnimationEventInterface);

var SyntheticAnimationEvent_1 = SyntheticAnimationEvent, ClipboardEventInterface = {
    clipboardData: function(event) {
        return "clipboardData" in event ? event.clipboardData : window.clipboardData;
    }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent_1.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);

var SyntheticClipboardEvent_1 = SyntheticClipboardEvent, FocusEventInterface = {
    relatedTarget: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticUIEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticUIEvent_1.augmentClass(SyntheticFocusEvent, FocusEventInterface);

var SyntheticFocusEvent_1 = SyntheticFocusEvent;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * `charCode` represents the actual "character code" and is safe to use with
 * `String.fromCharCode`. As such, only keys that correspond to printable
 * characters produce a valid `charCode`, the only exception to this is Enter.
 * The Tab-key is considered non-printable and does not have a `charCode`,
 * presumably because it does not produce a tab-character in browsers.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {number} Normalized `charCode` property.
 */
function getEventCharCode(nativeEvent) {
    var charCode, keyCode = nativeEvent.keyCode;
    // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
    // Must not discard the (non-)printable Enter-key.
    // FF does not set `charCode` for the Enter-key, check against `keyCode`.
    // IE8 does not implement `charCode`, but `keyCode` has the correct value.
    // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
    // Must not discard the (non-)printable Enter-key.
    return "charCode" in nativeEvent ? 0 === (charCode = nativeEvent.charCode) && 13 === keyCode && (charCode = 13) : charCode = keyCode, 
    charCode >= 32 || 13 === charCode ? charCode : 0;
}

var getEventCharCode_1 = getEventCharCode, normalizeKey = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
}, translateToKey = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
};

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
function getEventKey(nativeEvent) {
    if (nativeEvent.key) {
        // Normalize inconsistent values reported by browsers due to
        // implementations of a working draft specification.
        // FireFox implements `key` but returns `MozPrintableKey` for all
        // printable characters (normalized to `Unidentified`), ignore it.
        var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
        if ("Unidentified" !== key) return key;
    }
    // Browser does not implement `key`, polyfill as much of it as we can.
    if ("keypress" === nativeEvent.type) {
        var charCode = getEventCharCode_1(nativeEvent);
        // The enter-key is technically both printable and non-printable and can
        // thus be captured by `keypress`, no other non-printable key should.
        return 13 === charCode ? "Enter" : String.fromCharCode(charCode);
    }
    return "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
}

var getEventKey_1 = getEventKey, KeyboardEventInterface = {
    key: getEventKey_1,
    location: null,
    ctrlKey: null,
    shiftKey: null,
    altKey: null,
    metaKey: null,
    repeat: null,
    locale: null,
    getModifierState: getEventModifierState_1,
    // Legacy Interface
    charCode: function(event) {
        // `charCode` is the result of a KeyPress event and represents the value of
        // the actual printable character.
        // KeyPress is deprecated, but its replacement is not yet final and not
        // implemented in any major browser. Only KeyPress has charCode.
        // `charCode` is the result of a KeyPress event and represents the value of
        // the actual printable character.
        // KeyPress is deprecated, but its replacement is not yet final and not
        // implemented in any major browser. Only KeyPress has charCode.
        return "keypress" === event.type ? getEventCharCode_1(event) : 0;
    },
    keyCode: function(event) {
        // `keyCode` is the result of a KeyDown/Up event and represents the value of
        // physical keyboard key.
        // The actual meaning of the value depends on the users' keyboard layout
        // which cannot be detected. Assuming that it is a US keyboard layout
        // provides a surprisingly accurate mapping for US and European users.
        // Due to this, it is left to the user to implement at this time.
        // `keyCode` is the result of a KeyDown/Up event and represents the value of
        // physical keyboard key.
        // The actual meaning of the value depends on the users' keyboard layout
        // which cannot be detected. Assuming that it is a US keyboard layout
        // provides a surprisingly accurate mapping for US and European users.
        // Due to this, it is left to the user to implement at this time.
        return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
    },
    which: function(event) {
        // `which` is an alias for either `keyCode` or `charCode` depending on the
        // type of the event.
        // `which` is an alias for either `keyCode` or `charCode` depending on the
        // type of the event.
        return "keypress" === event.type ? getEventCharCode_1(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
    }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticUIEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticUIEvent_1.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

var SyntheticKeyboardEvent_1 = SyntheticKeyboardEvent, DragEventInterface = {
    dataTransfer: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticMouseEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticMouseEvent_1.augmentClass(SyntheticDragEvent, DragEventInterface);

var SyntheticDragEvent_1 = SyntheticDragEvent, TouchEventInterface = {
    touches: null,
    targetTouches: null,
    changedTouches: null,
    altKey: null,
    metaKey: null,
    ctrlKey: null,
    shiftKey: null,
    getModifierState: getEventModifierState_1
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticUIEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticUIEvent_1.augmentClass(SyntheticTouchEvent, TouchEventInterface);

var SyntheticTouchEvent_1 = SyntheticTouchEvent, TransitionEventInterface = {
    propertyName: null,
    elapsedTime: null,
    pseudoElement: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticTransitionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticEvent_1.augmentClass(SyntheticTransitionEvent, TransitionEventInterface);

var SyntheticTransitionEvent_1 = SyntheticTransitionEvent, WheelEventInterface = {
    deltaX: function(event) {
        // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
        return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
    },
    deltaY: function(event) {
        // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
        // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
        return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
    },
    deltaZ: null,
    // Browsers without "deltaMode" is reporting in raw wheel delta where one
    // notch on the scroll is always +/- 120, roughly equivalent to pixels.
    // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
    // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
    deltaMode: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
    return SyntheticMouseEvent_1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}

SyntheticMouseEvent_1.augmentClass(SyntheticWheelEvent, WheelEventInterface);

var SyntheticWheelEvent_1 = SyntheticWheelEvent, eventTypes$4 = {}, topLevelEventsToDispatchConfig = {};

[ "abort", "animationEnd", "animationIteration", "animationStart", "blur", "cancel", "canPlay", "canPlayThrough", "click", "close", "contextMenu", "copy", "cut", "doubleClick", "drag", "dragEnd", "dragEnter", "dragExit", "dragLeave", "dragOver", "dragStart", "drop", "durationChange", "emptied", "encrypted", "ended", "error", "focus", "input", "invalid", "keyDown", "keyPress", "keyUp", "load", "loadedData", "loadedMetadata", "loadStart", "mouseDown", "mouseMove", "mouseOut", "mouseOver", "mouseUp", "paste", "pause", "play", "playing", "progress", "rateChange", "reset", "scroll", "seeked", "seeking", "stalled", "submit", "suspend", "timeUpdate", "toggle", "touchCancel", "touchEnd", "touchMove", "touchStart", "transitionEnd", "volumeChange", "waiting", "wheel" ].forEach(function(event) {
    var capitalizedEvent = event[0].toUpperCase() + event.slice(1), onEvent = "on" + capitalizedEvent, topEvent = "top" + capitalizedEvent, type = {
        phasedRegistrationNames: {
            bubbled: onEvent,
            captured: onEvent + "Capture"
        },
        dependencies: [ topEvent ]
    };
    eventTypes$4[event] = type, topLevelEventsToDispatchConfig[topEvent] = type;
});

var SimpleEventPlugin = {
    eventTypes: eventTypes$4,
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
        if (!dispatchConfig) return null;
        var EventConstructor;
        switch (topLevelType) {
          case "topKeyPress":
            // Firefox creates a keypress event for function keys too. This removes
            // the unwanted keypress events. Enter is however both printable and
            // non-printable. One would expect Tab to be as well (but it isn't).
            if (0 === getEventCharCode_1(nativeEvent)) return null;

          /* falls through */
            case "topKeyDown":
          case "topKeyUp":
            EventConstructor = SyntheticKeyboardEvent_1;
            break;

          case "topBlur":
          case "topFocus":
            EventConstructor = SyntheticFocusEvent_1;
            break;

          case "topClick":
            // Firefox creates a click event on right mouse clicks. This removes the
            // unwanted click events.
            if (2 === nativeEvent.button) return null;

          /* falls through */
            case "topDoubleClick":
          case "topMouseDown":
          case "topMouseMove":
          case "topMouseUp":
          // TODO: Disabled elements should not respond to mouse events
            /* falls through */
            case "topMouseOut":
          case "topMouseOver":
          case "topContextMenu":
            EventConstructor = SyntheticMouseEvent_1;
            break;

          case "topDrag":
          case "topDragEnd":
          case "topDragEnter":
          case "topDragExit":
          case "topDragLeave":
          case "topDragOver":
          case "topDragStart":
          case "topDrop":
            EventConstructor = SyntheticDragEvent_1;
            break;

          case "topTouchCancel":
          case "topTouchEnd":
          case "topTouchMove":
          case "topTouchStart":
            EventConstructor = SyntheticTouchEvent_1;
            break;

          case "topAnimationEnd":
          case "topAnimationIteration":
          case "topAnimationStart":
            EventConstructor = SyntheticAnimationEvent_1;
            break;

          case "topTransitionEnd":
            EventConstructor = SyntheticTransitionEvent_1;
            break;

          case "topScroll":
            EventConstructor = SyntheticUIEvent_1;
            break;

          case "topWheel":
            EventConstructor = SyntheticWheelEvent_1;
            break;

          case "topCopy":
          case "topCut":
          case "topPaste":
            EventConstructor = SyntheticClipboardEvent_1;
            break;

          default:
            // HTML Events
            // @see http://www.w3.org/TR/html5/index.html#events-0
            EventConstructor = SyntheticEvent_1;
        }
        var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
        return EventPropagators_1.accumulateTwoPhaseDispatches(event), event;
    }
}, SimpleEventPlugin_1 = SimpleEventPlugin;

ReactDOMEventListener_1.setHandleTopLevel(ReactBrowserEventEmitter_1.handleTopLevel), 
/**
 * Inject modules for resolving DOM hierarchy and plugin ordering.
 */
EventPluginHub_1.injection.injectEventPluginOrder(DOMEventPluginOrder_1), EventPluginUtils_1.injection.injectComponentTree(ReactDOMComponentTree_1), 
/**
 * Some important event plugins included by default (without having to require
 * them).
 */
EventPluginHub_1.injection.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin_1,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin_1,
    ChangeEventPlugin: ChangeEventPlugin_1,
    SelectEventPlugin: SelectEventPlugin_1,
    BeforeInputEventPlugin: BeforeInputEventPlugin_1
});

var MUST_USE_PROPERTY = DOMProperty_1.injection.MUST_USE_PROPERTY, HAS_BOOLEAN_VALUE = DOMProperty_1.injection.HAS_BOOLEAN_VALUE, HAS_NUMERIC_VALUE = DOMProperty_1.injection.HAS_NUMERIC_VALUE, HAS_POSITIVE_NUMERIC_VALUE = DOMProperty_1.injection.HAS_POSITIVE_NUMERIC_VALUE, HAS_OVERLOADED_BOOLEAN_VALUE = DOMProperty_1.injection.HAS_OVERLOADED_BOOLEAN_VALUE, HAS_STRING_BOOLEAN_VALUE = DOMProperty_1.injection.HAS_STRING_BOOLEAN_VALUE, HTMLDOMPropertyConfig = {
    // When adding attributes to this list, be sure to also add them to
    // the `possibleStandardNames` module to ensure casing and incorrect
    // name warnings.
    Properties: {
        allowFullScreen: HAS_BOOLEAN_VALUE,
        autoFocus: HAS_STRING_BOOLEAN_VALUE,
        // specifies target context for links with `preload` type
        async: HAS_BOOLEAN_VALUE,
        // autoFocus is polyfilled/normalized by AutoFocusUtils
        // autoFocus: HAS_BOOLEAN_VALUE,
        autoPlay: HAS_BOOLEAN_VALUE,
        capture: HAS_BOOLEAN_VALUE,
        checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        cols: HAS_POSITIVE_NUMERIC_VALUE,
        contentEditable: HAS_STRING_BOOLEAN_VALUE,
        controls: HAS_BOOLEAN_VALUE,
        default: HAS_BOOLEAN_VALUE,
        defer: HAS_BOOLEAN_VALUE,
        disabled: HAS_BOOLEAN_VALUE,
        download: HAS_OVERLOADED_BOOLEAN_VALUE,
        draggable: HAS_STRING_BOOLEAN_VALUE,
        formNoValidate: HAS_BOOLEAN_VALUE,
        hidden: HAS_BOOLEAN_VALUE,
        loop: HAS_BOOLEAN_VALUE,
        // Caution; `option.selected` is not updated if `select.multiple` is
        // disabled with `removeAttribute`.
        multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        noValidate: HAS_BOOLEAN_VALUE,
        open: HAS_BOOLEAN_VALUE,
        playsInline: HAS_BOOLEAN_VALUE,
        readOnly: HAS_BOOLEAN_VALUE,
        required: HAS_BOOLEAN_VALUE,
        reversed: HAS_BOOLEAN_VALUE,
        rows: HAS_POSITIVE_NUMERIC_VALUE,
        rowSpan: HAS_NUMERIC_VALUE,
        scoped: HAS_BOOLEAN_VALUE,
        seamless: HAS_BOOLEAN_VALUE,
        selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        size: HAS_POSITIVE_NUMERIC_VALUE,
        start: HAS_NUMERIC_VALUE,
        // support for projecting regular DOM Elements via V1 named slots ( shadow dom )
        span: HAS_POSITIVE_NUMERIC_VALUE,
        spellCheck: HAS_STRING_BOOLEAN_VALUE,
        // Style must be explicitly set in the attribute list. React components
        // expect a style object
        style: 0,
        // Keep it in the whitelist because it is case-sensitive for SVG.
        tabIndex: 0,
        // itemScope is for for Microdata support.
        // See http://schema.org/docs/gs.html
        itemScope: HAS_BOOLEAN_VALUE,
        // These attributes must stay in the white-list because they have
        // different attribute names (see DOMAttributeNames below)
        acceptCharset: 0,
        className: 0,
        htmlFor: 0,
        httpEquiv: 0,
        // Attributes with mutation methods must be specified in the whitelist
        // Set the string boolean flag to allow the behavior
        value: HAS_STRING_BOOLEAN_VALUE
    },
    DOMAttributeNames: {
        acceptCharset: "accept-charset",
        className: "class",
        htmlFor: "for",
        httpEquiv: "http-equiv"
    },
    DOMMutationMethods: {
        value: function(node, value) {
            if (null == value) return node.removeAttribute("value");
            // Number inputs get special treatment due to some edge cases in
            // Chrome. Let everything else assign the value attribute as normal.
            // https://github.com/facebook/react/issues/7253#issuecomment-236074326
            "number" !== node.type || !1 === node.hasAttribute("value") ? node.setAttribute("value", "" + value) : node.validity && !node.validity.badInput && node.ownerDocument.activeElement !== node && // Don't assign an attribute if validation reports bad
            // input. Chrome will clear the value. Additionally, don't
            // operate on inputs that have focus, otherwise Chrome might
            // strip off trailing decimal places and cause the user's
            // cursor position to jump to the beginning of the input.
            //
            // In ReactDOMInput, we have an onBlur event that will trigger
            // this function again when focus is lost.
            node.setAttribute("value", "" + value);
        }
    }
}, HTMLDOMPropertyConfig_1 = HTMLDOMPropertyConfig, HAS_STRING_BOOLEAN_VALUE$1 = DOMProperty_1.injection.HAS_STRING_BOOLEAN_VALUE, NS = {
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace"
}, ATTRS = [ "accent-height", "alignment-baseline", "arabic-form", "baseline-shift", "cap-height", "clip-path", "clip-rule", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "dominant-baseline", "enable-background", "fill-opacity", "fill-rule", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-name", "glyph-orientation-horizontal", "glyph-orientation-vertical", "horiz-adv-x", "horiz-origin-x", "image-rendering", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "overline-position", "overline-thickness", "paint-order", "panose-1", "pointer-events", "rendering-intent", "shape-rendering", "stop-color", "stop-opacity", "strikethrough-position", "strikethrough-thickness", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-anchor", "text-decoration", "text-rendering", "underline-position", "underline-thickness", "unicode-bidi", "unicode-range", "units-per-em", "v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "vector-effect", "vert-adv-y", "vert-origin-x", "vert-origin-y", "word-spacing", "writing-mode", "x-height", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xmlns:xlink", "xml:lang", "xml:space" ], SVGDOMPropertyConfig = {
    Properties: {
        autoReverse: HAS_STRING_BOOLEAN_VALUE$1,
        externalResourcesRequired: HAS_STRING_BOOLEAN_VALUE$1,
        preserveAlpha: HAS_STRING_BOOLEAN_VALUE$1
    },
    DOMAttributeNames: {
        autoReverse: "autoReverse",
        externalResourcesRequired: "externalResourcesRequired",
        preserveAlpha: "preserveAlpha"
    },
    DOMAttributeNamespaces: {
        xlinkActuate: NS.xlink,
        xlinkArcrole: NS.xlink,
        xlinkHref: NS.xlink,
        xlinkRole: NS.xlink,
        xlinkShow: NS.xlink,
        xlinkTitle: NS.xlink,
        xlinkType: NS.xlink,
        xmlBase: NS.xml,
        xmlLang: NS.xml,
        xmlSpace: NS.xml
    }
}, CAMELIZE = /[\-\:]([a-z])/g, capitalize = function(token) {
    return token[1].toUpperCase();
};

ATTRS.forEach(function(original) {
    var reactName = original.replace(CAMELIZE, capitalize);
    SVGDOMPropertyConfig.Properties[reactName] = 0, SVGDOMPropertyConfig.DOMAttributeNames[reactName] = original;
});

var SVGDOMPropertyConfig_1 = SVGDOMPropertyConfig;

DOMProperty_1.injection.injectDOMPropertyConfig(HTMLDOMPropertyConfig_1), DOMProperty_1.injection.injectDOMPropertyConfig(SVGDOMPropertyConfig_1);

// TODO: direct imports like some-package/src/* are bad. Fix me.
// TODO: direct imports like some-package/src/* are bad. Fix me.
var injectInternals = ReactFiberDevToolsHook.injectInternals, ELEMENT_NODE = HTMLNodeType_1.ELEMENT_NODE, TEXT_NODE = HTMLNodeType_1.TEXT_NODE, COMMENT_NODE = HTMLNodeType_1.COMMENT_NODE, DOCUMENT_NODE = HTMLNodeType_1.DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE = HTMLNodeType_1.DOCUMENT_FRAGMENT_NODE, ROOT_ATTRIBUTE_NAME = DOMProperty_1.ROOT_ATTRIBUTE_NAME, getChildNamespace = DOMNamespaces.getChildNamespace, createElement = ReactDOMFiberComponent_1.createElement, createTextNode = ReactDOMFiberComponent_1.createTextNode, setInitialProperties = ReactDOMFiberComponent_1.setInitialProperties, diffProperties = ReactDOMFiberComponent_1.diffProperties, updateProperties = ReactDOMFiberComponent_1.updateProperties, diffHydratedProperties = ReactDOMFiberComponent_1.diffHydratedProperties, diffHydratedText = ReactDOMFiberComponent_1.diffHydratedText, warnForUnmatchedText = ReactDOMFiberComponent_1.warnForUnmatchedText, warnForDeletedHydratableElement = ReactDOMFiberComponent_1.warnForDeletedHydratableElement, warnForDeletedHydratableText = ReactDOMFiberComponent_1.warnForDeletedHydratableText, warnForInsertedHydratedElement = ReactDOMFiberComponent_1.warnForInsertedHydratedElement, warnForInsertedHydratedText = ReactDOMFiberComponent_1.warnForInsertedHydratedText, precacheFiberNode = ReactDOMComponentTree_1.precacheFiberNode, updateFiberProps = ReactDOMComponentTree_1.updateFiberProps, SUPPRESS_HYDRATION_WARNING;

ReactControlledComponent_1.injection.injectFiberControlledHostComponent(ReactDOMFiberComponent_1);

var eventsEnabled = null, selectionInformation = null;

/**
 * True if the supplied DOM node is a valid node element.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM is a valid DOM node.
 * @internal
 */
function isValidContainer(node) {
    return !(!node || node.nodeType !== ELEMENT_NODE && node.nodeType !== DOCUMENT_NODE && node.nodeType !== DOCUMENT_FRAGMENT_NODE && (node.nodeType !== COMMENT_NODE || " react-mount-point-unstable " !== node.nodeValue));
}

function getReactRootElementInContainer(container) {
    return container ? container.nodeType === DOCUMENT_NODE ? container.documentElement : container.firstChild : null;
}

function shouldHydrateDueToLegacyHeuristic(container) {
    var rootElement = getReactRootElementInContainer(container);
    return !(!rootElement || rootElement.nodeType !== ELEMENT_NODE || !rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME));
}

function shouldAutoFocusHostComponent(type, props) {
    switch (type) {
      case "button":
      case "input":
      case "select":
      case "textarea":
        return !!props.autoFocus;
    }
    return !1;
}

var DOMRenderer = index({
    getRootHostContext: function(rootContainerInstance) {
        var type = void 0, namespace = void 0, nodeType = rootContainerInstance.nodeType;
        switch (nodeType) {
          case DOCUMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            type = nodeType === DOCUMENT_NODE ? "#document" : "#fragment";
            var root = rootContainerInstance.documentElement;
            namespace = root ? root.namespaceURI : getChildNamespace(null, "");
            break;

          default:
            var container = nodeType === COMMENT_NODE ? rootContainerInstance.parentNode : rootContainerInstance, ownNamespace = container.namespaceURI || null;
            type = container.tagName, namespace = getChildNamespace(ownNamespace, type);
        }
        return namespace;
    },
    getChildHostContext: function(parentHostContext, type) {
        return getChildNamespace(parentHostContext, type);
    },
    getPublicInstance: function(instance) {
        return instance;
    },
    prepareForCommit: function() {
        eventsEnabled = ReactBrowserEventEmitter_1.isEnabled(), selectionInformation = ReactInputSelection_1.getSelectionInformation(), 
        ReactBrowserEventEmitter_1.setEnabled(!1);
    },
    resetAfterCommit: function() {
        ReactInputSelection_1.restoreSelection(selectionInformation), selectionInformation = null, 
        ReactBrowserEventEmitter_1.setEnabled(eventsEnabled), eventsEnabled = null;
    },
    createInstance: function(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
        var parentNamespace = void 0;
        parentNamespace = hostContext;
        var domElement = createElement(type, props, rootContainerInstance, parentNamespace);
        return precacheFiberNode(internalInstanceHandle, domElement), updateFiberProps(domElement, props), 
        domElement;
    },
    appendInitialChild: function(parentInstance, child) {
        parentInstance.appendChild(child);
    },
    finalizeInitialChildren: function(domElement, type, props, rootContainerInstance) {
        return setInitialProperties(domElement, type, props, rootContainerInstance), shouldAutoFocusHostComponent(type, props);
    },
    prepareUpdate: function(domElement, type, oldProps, newProps, rootContainerInstance, hostContext) {
        return diffProperties(domElement, type, oldProps, newProps, rootContainerInstance);
    },
    shouldSetTextContent: function(type, props) {
        return "textarea" === type || "string" == typeof props.children || "number" == typeof props.children || "object" == typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && "string" == typeof props.dangerouslySetInnerHTML.__html;
    },
    shouldDeprioritizeSubtree: function(type, props) {
        return !!props.hidden;
    },
    createTextInstance: function(text, rootContainerInstance, hostContext, internalInstanceHandle) {
        var textNode = createTextNode(text, rootContainerInstance);
        return precacheFiberNode(internalInstanceHandle, textNode), textNode;
    },
    now: ReactDOMFrameScheduling.now,
    mutation: {
        commitMount: function(domElement, type, newProps, internalInstanceHandle) {
            domElement.focus();
        },
        commitUpdate: function(domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
            // Update the props handle so that we know which props are the ones with
            // with current event handlers.
            updateFiberProps(domElement, newProps), // Apply the diff to the DOM node.
            updateProperties(domElement, updatePayload, type, oldProps, newProps);
        },
        resetTextContent: function(domElement) {
            domElement.textContent = "";
        },
        commitTextUpdate: function(textInstance, oldText, newText) {
            textInstance.nodeValue = newText;
        },
        appendChild: function(parentInstance, child) {
            parentInstance.appendChild(child);
        },
        appendChildToContainer: function(container, child) {
            container.nodeType === COMMENT_NODE ? container.parentNode.insertBefore(child, container) : container.appendChild(child);
        },
        insertBefore: function(parentInstance, child, beforeChild) {
            parentInstance.insertBefore(child, beforeChild);
        },
        insertInContainerBefore: function(container, child, beforeChild) {
            container.nodeType === COMMENT_NODE ? container.parentNode.insertBefore(child, beforeChild) : container.insertBefore(child, beforeChild);
        },
        removeChild: function(parentInstance, child) {
            parentInstance.removeChild(child);
        },
        removeChildFromContainer: function(container, child) {
            container.nodeType === COMMENT_NODE ? container.parentNode.removeChild(child) : container.removeChild(child);
        }
    },
    hydration: {
        canHydrateInstance: function(instance, type, props) {
            return instance.nodeType === ELEMENT_NODE && type.toLowerCase() === instance.nodeName.toLowerCase();
        },
        canHydrateTextInstance: function(instance, text) {
            return "" !== text && instance.nodeType === TEXT_NODE;
        },
        getNextHydratableSibling: function(instance) {
            // Skip non-hydratable nodes.
            for (var node = instance.nextSibling; node && node.nodeType !== ELEMENT_NODE && node.nodeType !== TEXT_NODE; ) node = node.nextSibling;
            return node;
        },
        getFirstHydratableChild: function(parentInstance) {
            // Skip non-hydratable nodes.
            for (var next = parentInstance.firstChild; next && next.nodeType !== ELEMENT_NODE && next.nodeType !== TEXT_NODE; ) next = next.nextSibling;
            return next;
        },
        hydrateInstance: function(instance, type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
            precacheFiberNode(internalInstanceHandle, instance), // TODO: Possibly defer this until the commit phase where all the events
            // get attached.
            updateFiberProps(instance, props);
            var parentNamespace = void 0;
            return parentNamespace = hostContext, diffHydratedProperties(instance, type, props, parentNamespace, rootContainerInstance);
        },
        hydrateTextInstance: function(textInstance, text, internalInstanceHandle) {
            return precacheFiberNode(internalInstanceHandle, textInstance), diffHydratedText(textInstance, text);
        },
        didNotMatchHydratedContainerTextInstance: function(parentContainer, textInstance, text) {},
        didNotMatchHydratedTextInstance: function(parentType, parentProps, parentInstance, textInstance, text) {
            1 || !0 === parentProps[SUPPRESS_HYDRATION_WARNING] || warnForUnmatchedText(textInstance, text);
        },
        didNotHydrateContainerInstance: function(parentContainer, instance) {},
        didNotHydrateInstance: function(parentType, parentProps, parentInstance, instance) {
            1 || !0 === parentProps[SUPPRESS_HYDRATION_WARNING] || (1 === instance.nodeType ? warnForDeletedHydratableElement(parentInstance, instance) : warnForDeletedHydratableText(parentInstance, instance));
        },
        didNotFindHydratableContainerInstance: function(parentContainer, type, props) {},
        didNotFindHydratableContainerTextInstance: function(parentContainer, text) {},
        didNotFindHydratableInstance: function(parentType, parentProps, parentInstance, type, props) {
            1 || !0 === parentProps[SUPPRESS_HYDRATION_WARNING] || warnForInsertedHydratedElement(parentInstance, type, props);
        },
        didNotFindHydratableTextInstance: function(parentType, parentProps, parentInstance, text) {
            1 || !0 === parentProps[SUPPRESS_HYDRATION_WARNING] || warnForInsertedHydratedText(parentInstance, text);
        }
    },
    scheduleDeferredCallback: ReactDOMFrameScheduling.rIC,
    useSyncScheduling: !ReactFeatureFlagsWww.enableAsyncSchedulingByDefaultInReactDOM
});

ReactGenericBatching_1.injection.injectFiberBatchedUpdates(DOMRenderer.batchedUpdates);

function renderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
    invariant(isValidContainer(container), "Target container is not a DOM element.");
    var root = container._reactRootContainer;
    if (root) DOMRenderer.updateContainer(children, root, parentComponent, callback); else {
        var shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
        // First clear any existing content.
        if (!shouldHydrate) for (var rootSibling = void 0; rootSibling = container.lastChild; ) container.removeChild(rootSibling);
        var newRoot = DOMRenderer.createContainer(container, shouldHydrate);
        root = container._reactRootContainer = newRoot, // Initial mount should not be batched.
        DOMRenderer.unbatchedUpdates(function() {
            DOMRenderer.updateContainer(children, newRoot, parentComponent, callback);
        });
    }
    return DOMRenderer.getPublicRootInstance(root);
}

function createPortal(children, container) {
    var key = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
    // TODO: pass ReactDOM portal implementation as third argument
    return invariant(isValidContainer(container), "Target container is not a DOM element."), 
    ReactPortal.createPortal(children, container, null, key);
}

function ReactRoot(container, hydrate) {
    var root = DOMRenderer.createContainer(container, hydrate);
    this._reactRootContainer = root;
}

ReactRoot.prototype.render = function(children, callback) {
    var root = this._reactRootContainer;
    DOMRenderer.updateContainer(children, root, null, callback);
}, ReactRoot.prototype.unmount = function(callback) {
    var root = this._reactRootContainer;
    DOMRenderer.updateContainer(null, root, null, callback);
};

var ReactDOM = {
    createRoot: function(container, options) {
        return new ReactRoot(container, null != options && !0 === options.hydrate);
    },
    createPortal: createPortal,
    findDOMNode: function(componentOrElement) {
        if (null == componentOrElement) return null;
        if (componentOrElement.nodeType === ELEMENT_NODE) return componentOrElement;
        var inst = ReactInstanceMap_1.get(componentOrElement);
        if (inst) return DOMRenderer.findHostInstance(inst);
        "function" == typeof componentOrElement.render ? invariant(!1, "Unable to find node on an unmounted component.") : invariant(!1, "Element appears to be neither ReactComponent nor DOMNode. Keys: %s", Object.keys(componentOrElement));
    },
    hydrate: function(element, container, callback) {
        // TODO: throw or warn if we couldn't hydrate?
        return renderSubtreeIntoContainer(null, element, container, !0, callback);
    },
    render: function(element, container, callback) {
        return renderSubtreeIntoContainer(null, element, container, !1, callback);
    },
    unstable_renderSubtreeIntoContainer: function(parentComponent, element, containerNode, callback) {
        return invariant(null != parentComponent && ReactInstanceMap_1.has(parentComponent), "parentComponent must be a valid React Component"), 
        renderSubtreeIntoContainer(parentComponent, element, containerNode, !1, callback);
    },
    unmountComponentAtNode: function(container) {
        return invariant(isValidContainer(container), "unmountComponentAtNode(...): Target container is not a DOM element."), 
        !!container._reactRootContainer && (DOMRenderer.unbatchedUpdates(function() {
            renderSubtreeIntoContainer(null, null, container, !1, function() {
                container._reactRootContainer = null;
            });
        }), !0);
    },
    // Temporary alias since we already shipped React 16 RC with it.
    // TODO: remove in React 17.
    unstable_createPortal: createPortal,
    unstable_batchedUpdates: ReactGenericBatching_1.batchedUpdates,
    unstable_deferredUpdates: DOMRenderer.deferredUpdates,
    flushSync: DOMRenderer.flushSync,
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
        // For TapEventPlugin which is popular in open source
        EventPluginHub: EventPluginHub_1,
        // Used by test-utils
        EventPluginRegistry: EventPluginRegistry_1,
        EventPropagators: EventPropagators_1,
        ReactControlledComponent: ReactControlledComponent_1,
        ReactDOMComponentTree: ReactDOMComponentTree_1,
        ReactDOMEventListener: ReactDOMEventListener_1
    }
}, foundDevTools = injectInternals({
    findFiberByHostInstance: ReactDOMComponentTree_1.getClosestInstanceFromNode,
    findHostInstanceByFiber: DOMRenderer.findHostInstance,
    // This is an enum because we may add more (e.g. profiler build)
    bundleType: 0,
    version: ReactVersion,
    rendererPackageName: "react-dom"
}), ReactDOM_1 = ReactDOM, isStartish$1 = EventPluginUtils_1.isStartish, isEndish$1 = EventPluginUtils_1.isEndish, tapMoveThreshold = 10, startCoords = {
    x: 0,
    y: 0
}, Axis = {
    x: {
        page: "pageX",
        client: "clientX",
        envScroll: "currentPageScrollLeft"
    },
    y: {
        page: "pageY",
        client: "clientY",
        envScroll: "currentPageScrollTop"
    }
};

function getAxisCoordOfEvent(axis, nativeEvent) {
    var singleTouch = TouchEventUtils.extractSingleTouch(nativeEvent);
    return singleTouch ? singleTouch[axis.page] : nativeEvent[axis.page];
}

function getDistance(coords, nativeEvent) {
    var pageX = getAxisCoordOfEvent(Axis.x, nativeEvent), pageY = getAxisCoordOfEvent(Axis.y, nativeEvent);
    return Math.pow(Math.pow(pageX - coords.x, 2) + Math.pow(pageY - coords.y, 2), .5);
}

var touchEvents = [ "topTouchStart", "topTouchCancel", "topTouchEnd", "topTouchMove" ], dependencies = [ "topMouseDown", "topMouseMove", "topMouseUp" ].concat(touchEvents), eventTypes$5 = {
    touchTap: {
        phasedRegistrationNames: {
            bubbled: "onTouchTap",
            captured: "onTouchTapCapture"
        },
        dependencies: dependencies
    }
}, usedTouch = !1, usedTouchTime = 0, TOUCH_DELAY = 1e3, TapEventPlugin = {
    tapMoveThreshold: tapMoveThreshold,
    eventTypes: eventTypes$5,
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        if (!isStartish$1(topLevelType) && !isEndish$1(topLevelType)) return null;
        // on ios, there is a delay after touch event and synthetic
        // mouse events, so that user can perform double tap
        // solution: ignore mouse events following touchevent within small timeframe
        if (-1 !== touchEvents.indexOf(topLevelType)) usedTouch = !0, usedTouchTime = Date.now(); else if (usedTouch && Date.now() - usedTouchTime < TOUCH_DELAY) return null;
        var event = null, distance = getDistance(startCoords, nativeEvent);
        return isEndish$1(topLevelType) && distance < tapMoveThreshold && (event = SyntheticUIEvent_1.getPooled(eventTypes$5.touchTap, targetInst, nativeEvent, nativeEventTarget)), 
        isStartish$1(topLevelType) ? (startCoords.x = getAxisCoordOfEvent(Axis.x, nativeEvent), 
        startCoords.y = getAxisCoordOfEvent(Axis.y, nativeEvent)) : isEndish$1(topLevelType) && (startCoords.x = 0, 
        startCoords.y = 0), EventPropagators_1.accumulateTwoPhaseDispatches(event), event;
    }
}, TapEventPlugin_1 = TapEventPlugin;

Object.assign(ReactDOM_1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, {
    // These are real internal dependencies that are trickier to remove:
    ReactBrowserEventEmitter: ReactBrowserEventEmitter_1,
    ReactErrorUtils: ReactErrorUtils_1,
    // TODO: direct imports like some-package/src/* are bad. Fix me.
    ReactFiberErrorLogger: ReactFiberErrorLogger,
    ReactFiberTreeReflection: ReactFiberTreeReflection,
    ReactDOMComponentTree: ReactDOMComponentTree_1,
    ReactInstanceMap: ReactInstanceMap_1,
    // Used by www msite:
    TapEventPlugin: TapEventPlugin_1
});

var index_fb = ReactDOM_1;

module.exports = index_fb;
