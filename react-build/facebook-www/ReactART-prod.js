/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @providesModule ReactART-prod
 * @preventMunge
 */
"use strict";

var current = require("art/modes/current"), fastNoSideEffects = require("art/modes/fast-noSideEffects"), react = require('React'), emptyObject = require("fbjs/lib/emptyObject"), invariant = require("fbjs/lib/invariant"), shallowEqual = require("fbjs/lib/shallowEqual"), ReactFeatureFlags = require("ReactFeatureFlags"), ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment"), transform$1 = require("art/core/transform"), ReactInstanceMap = {
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
var createWorkInProgress = function(current$$1, expirationTime) {
    var workInProgress = current$$1.alternate;
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
    return null === workInProgress ? (workInProgress = createFiber(current$$1.tag, current$$1.key, current$$1.internalContextTag), 
    workInProgress.type = current$$1.type, workInProgress.stateNode = current$$1.stateNode, 
    workInProgress.alternate = current$$1, current$$1.alternate = workInProgress) : (workInProgress.effectTag = NoEffect$1, 
    workInProgress.nextEffect = null, workInProgress.firstEffect = null, workInProgress.lastEffect = null), 
    workInProgress.expirationTime = expirationTime, workInProgress.child = current$$1.child, 
    workInProgress.memoizedProps = current$$1.memoizedProps, workInProgress.memoizedState = current$$1.memoizedState, 
    workInProgress.updateQueue = current$$1.updateQueue, workInProgress.sibling = current$$1.sibling, 
    workInProgress.index = current$$1.index, workInProgress.ref = current$$1.ref, workInProgress;
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
}, CallbackEffect = ReactTypeOfSideEffect.Callback, ClassComponent$6 = ReactTypeOfWork.ClassComponent, HostRoot$5 = ReactTypeOfWork.HostRoot, NoWork$5 = ReactFiberExpirationTime.NoWork;

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

function processUpdateQueue$2(current$$1, workInProgress, queue, instance, props, renderExpirationTime) {
    if (null !== current$$1 && current$$1.updateQueue === queue) {
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
        var current$$1 = workInProgress.alternate, instance = workInProgress.stateNode, state = instance.state || null, props = workInProgress.pendingProps;
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
            null !== updateQueue && (instance.state = processUpdateQueue$1(current$$1, workInProgress, updateQueue, instance, props, renderExpirationTime));
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
    function updateClassInstance(current$$1, workInProgress, renderExpirationTime) {
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
        if (newState = null !== workInProgress.updateQueue ? processUpdateQueue$1(current$$1, workInProgress, workInProgress.updateQueue, instance, newProps, renderExpirationTime) : oldState, 
        !(oldProps !== newProps || oldState !== newState || hasContextChanged$2() || null !== workInProgress.updateQueue && workInProgress.updateQueue.hasForceUpdate)) // If an update was already in progress, we should schedule an Update
        // effect even though we're bailing out, so that cWU/cDU are called.
        return "function" == typeof instance.componentDidUpdate && (oldProps === current$$1.memoizedProps && oldState === current$$1.memoizedState || (workInProgress.effectTag |= Update$1)), 
        !1;
        var shouldUpdate = checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext);
        // If an update was already in progress, we should schedule an Update
        // effect even though we're bailing out, so that cWU/cDU are called.
        // If shouldComponentUpdate returned false, we should still update the
        // memoized props/state to indicate that this work can be reused.
        // Update the existing instance's state, props, and context pointers even
        // if shouldComponentUpdate returns false.
        return shouldUpdate ? ("function" == typeof instance.componentWillUpdate && instance.componentWillUpdate(newProps, newState, newContext), 
        "function" == typeof instance.componentDidUpdate && (workInProgress.effectTag |= Update$1)) : ("function" == typeof instance.componentDidUpdate && (oldProps === current$$1.memoizedProps && oldState === current$$1.memoizedState || (workInProgress.effectTag |= Update$1)), 
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
}, REACT_PORTAL_TYPE$1 = "function" == typeof Symbol && Symbol.for && Symbol.for("react.portal") || 60106, createPortal = function(children, containerInfo, // TODO: figure out the API for cross-renderer implementation.
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

function coerceRef(current$$1, element) {
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
            if (null !== current$$1 && null !== current$$1.ref && current$$1.ref._stringRef === stringRef) return current$$1.ref;
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
        var current$$1 = newFiber.alternate;
        if (null !== current$$1) {
            var oldIndex = current$$1.index;
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
    function updateTextNode(returnFiber, current$$1, textContent, expirationTime) {
        if (null === current$$1 || current$$1.tag !== HostText$3) {
            // Insert
            var created = createFiberFromText$1(textContent, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        // Update
        var existing = useFiber(current$$1, expirationTime);
        return existing.pendingProps = textContent, existing.return = returnFiber, existing;
    }
    function updateElement(returnFiber, current$$1, element, expirationTime) {
        if (null === current$$1 || current$$1.type !== element.type) {
            // Insert
            var created = createFiberFromElement$1(element, returnFiber.internalContextTag, expirationTime);
            return created.ref = coerceRef(current$$1, element), created.return = returnFiber, 
            created;
        }
        // Move based on index
        var existing = useFiber(current$$1, expirationTime);
        return existing.ref = coerceRef(current$$1, element), existing.pendingProps = element.props, 
        existing.return = returnFiber, existing;
    }
    function updateCall(returnFiber, current$$1, call, expirationTime) {
        // TODO: Should this also compare handler to determine whether to reuse?
        if (null === current$$1 || current$$1.tag !== CallComponent$2) {
            // Insert
            var created = createFiberFromCall$1(call, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        // Move based on index
        var existing = useFiber(current$$1, expirationTime);
        return existing.pendingProps = call, existing.return = returnFiber, existing;
    }
    function updateReturn(returnFiber, current$$1, returnNode, expirationTime) {
        if (null === current$$1 || current$$1.tag !== ReturnComponent$2) {
            // Insert
            var created = createFiberFromReturn$1(returnNode, returnFiber.internalContextTag, expirationTime);
            return created.type = returnNode.value, created.return = returnFiber, created;
        }
        // Move based on index
        var existing = useFiber(current$$1, expirationTime);
        return existing.type = returnNode.value, existing.return = returnFiber, existing;
    }
    function updatePortal(returnFiber, current$$1, portal, expirationTime) {
        if (null === current$$1 || current$$1.tag !== HostPortal$4 || current$$1.stateNode.containerInfo !== portal.containerInfo || current$$1.stateNode.implementation !== portal.implementation) {
            // Insert
            var created = createFiberFromPortal$1(portal, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        // Update
        var existing = useFiber(current$$1, expirationTime);
        return existing.pendingProps = portal.children || [], existing.return = returnFiber, 
        existing;
    }
    function updateFragment(returnFiber, current$$1, fragment, expirationTime) {
        if (null === current$$1 || current$$1.tag !== Fragment$2) {
            // Insert
            var created = createFiberFromFragment$1(fragment, returnFiber.internalContextTag, expirationTime);
            return created.return = returnFiber, created;
        }
        // Update
        var existing = useFiber(current$$1, expirationTime);
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

var reconcileChildFibers$1 = ChildReconciler(!0, !0), reconcileChildFibersInPlace$1 = ChildReconciler(!1, !0), mountChildFibersInPlace$1 = ChildReconciler(!1, !1), cloneChildFibers$1 = function(current$$1, workInProgress) {
    if (invariant(null === current$$1 || workInProgress.child === current$$1.child, "Resuming work not yet implemented."), 
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
}, IndeterminateComponent$2 = ReactTypeOfWork.IndeterminateComponent, FunctionalComponent$1 = ReactTypeOfWork.FunctionalComponent, ClassComponent$5 = ReactTypeOfWork.ClassComponent, HostRoot$4 = ReactTypeOfWork.HostRoot, HostComponent$5 = ReactTypeOfWork.HostComponent, HostText$2 = ReactTypeOfWork.HostText, HostPortal$3 = ReactTypeOfWork.HostPortal, CallComponent$1 = ReactTypeOfWork.CallComponent, CallHandlerPhase = ReactTypeOfWork.CallHandlerPhase, ReturnComponent$1 = ReactTypeOfWork.ReturnComponent, Fragment$1 = ReactTypeOfWork.Fragment, PerformedWork$1 = ReactTypeOfSideEffect.PerformedWork, Placement$2 = ReactTypeOfSideEffect.Placement, ContentReset$1 = ReactTypeOfSideEffect.ContentReset, Err$1 = ReactTypeOfSideEffect.Err, Ref$1 = ReactTypeOfSideEffect.Ref, ReactCurrentOwner$2 = ReactGlobalSharedState_1.ReactCurrentOwner, mountChildFibersInPlace = ReactChildFiber.mountChildFibersInPlace, reconcileChildFibers = ReactChildFiber.reconcileChildFibers, reconcileChildFibersInPlace = ReactChildFiber.reconcileChildFibersInPlace, cloneChildFibers = ReactChildFiber.cloneChildFibers, processUpdateQueue = ReactFiberUpdateQueue.processUpdateQueue, getMaskedContext$1 = ReactFiberContext.getMaskedContext, getUnmaskedContext$1 = ReactFiberContext.getUnmaskedContext, hasContextChanged$1 = ReactFiberContext.hasContextChanged, pushContextProvider$1 = ReactFiberContext.pushContextProvider, pushTopLevelContextObject$1 = ReactFiberContext.pushTopLevelContextObject, invalidateContextProvider$1 = ReactFiberContext.invalidateContextProvider, NoWork$4 = ReactFiberExpirationTime.NoWork, Never$2 = ReactFiberExpirationTime.Never, ReactFiberBeginWork = function(config, hostContext, hydrationContext, scheduleWork, computeExpirationForFiber) {
    var shouldSetTextContent = config.shouldSetTextContent, useSyncScheduling = config.useSyncScheduling, shouldDeprioritizeSubtree = config.shouldDeprioritizeSubtree, pushHostContext = hostContext.pushHostContext, pushHostContainer = hostContext.pushHostContainer, enterHydrationState = hydrationContext.enterHydrationState, resetHydrationState = hydrationContext.resetHydrationState, tryToClaimNextHydratableInstance = hydrationContext.tryToClaimNextHydratableInstance, _ReactFiberClassCompo = ReactFiberClassComponent(scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState), adoptClassInstance = _ReactFiberClassCompo.adoptClassInstance, constructClassInstance = _ReactFiberClassCompo.constructClassInstance, mountClassInstance = _ReactFiberClassCompo.mountClassInstance, updateClassInstance = _ReactFiberClassCompo.updateClassInstance;
    // TODO: Remove this and use reconcileChildrenAtExpirationTime directly.
    function reconcileChildren(current$$1, workInProgress, nextChildren) {
        reconcileChildrenAtExpirationTime(current$$1, workInProgress, nextChildren, workInProgress.expirationTime);
    }
    function reconcileChildrenAtExpirationTime(current$$1, workInProgress, nextChildren, renderExpirationTime) {
        null === current$$1 ? // If this is a fresh new component that hasn't been rendered yet, we
        // won't update its child set by applying minimal side-effects. Instead,
        // we will add them all to the child before it gets rendered. That means
        // we can optimize this reconciliation pass by not tracking side-effects.
        workInProgress.child = mountChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime) : current$$1.child === workInProgress.child ? // If the current child is the same as the work in progress, it means that
        // we haven't yet started any work on these children. Therefore, we use
        // the clone algorithm to create a copy of all the current children.
        // If we had any progressed work already, that is invalid at this point so
        // let's throw it out.
        workInProgress.child = reconcileChildFibers(workInProgress, workInProgress.child, nextChildren, renderExpirationTime) : // If, on the other hand, it is already using a clone, that means we've
        // already begun some work on this tree and we can continue where we left
        // off by reconciling against the existing children.
        workInProgress.child = reconcileChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime);
    }
    function updateFragment(current$$1, workInProgress) {
        var nextChildren = workInProgress.pendingProps;
        if (hasContextChanged$1()) // Normally we can bail out on props equality but if context has changed
        // we don't do the bailout and we have to reuse existing props instead.
        null === nextChildren && (nextChildren = workInProgress.memoizedProps); else if (null === nextChildren || workInProgress.memoizedProps === nextChildren) return bailoutOnAlreadyFinishedWork(current$$1, workInProgress);
        return reconcileChildren(current$$1, workInProgress, nextChildren), memoizeProps(workInProgress, nextChildren), 
        workInProgress.child;
    }
    function markRef(current$$1, workInProgress) {
        var ref = workInProgress.ref;
        null === ref || current$$1 && current$$1.ref === ref || (// Schedule a Ref effect
        workInProgress.effectTag |= Ref$1);
    }
    function updateFunctionalComponent(current$$1, workInProgress) {
        var fn = workInProgress.type, nextProps = workInProgress.pendingProps, memoizedProps = workInProgress.memoizedProps;
        if (hasContextChanged$1()) // Normally we can bail out on props equality but if context has changed
        // we don't do the bailout and we have to reuse existing props instead.
        null === nextProps && (nextProps = memoizedProps); else if (null === nextProps || memoizedProps === nextProps) return bailoutOnAlreadyFinishedWork(current$$1, workInProgress);
        var nextChildren, unmaskedContext = getUnmaskedContext$1(workInProgress), context = getMaskedContext$1(workInProgress, unmaskedContext);
        // React DevTools reads this flag.
        return nextChildren = fn(nextProps, context), workInProgress.effectTag |= PerformedWork$1, 
        reconcileChildren(current$$1, workInProgress, nextChildren), memoizeProps(workInProgress, nextProps), 
        workInProgress.child;
    }
    function updateClassComponent(current$$1, workInProgress, renderExpirationTime) {
        // Push context providers early to prevent context stack mismatches.
        // During mounting we don't know the child context yet as the instance doesn't exist.
        // We will invalidate the child context in finishClassComponent() right after rendering.
        var hasContext = pushContextProvider$1(workInProgress), shouldUpdate = void 0;
        // In the initial pass we might need to construct the instance.
        return null === current$$1 ? workInProgress.stateNode ? invariant(!1, "Resuming work not yet implemented.") : (constructClassInstance(workInProgress, workInProgress.pendingProps), 
        mountClassInstance(workInProgress, renderExpirationTime), shouldUpdate = !0) : shouldUpdate = updateClassInstance(current$$1, workInProgress, renderExpirationTime), 
        finishClassComponent(current$$1, workInProgress, shouldUpdate, hasContext);
    }
    function finishClassComponent(current$$1, workInProgress, shouldUpdate, hasContext) {
        if (// Refs should update even if shouldComponentUpdate returns false
        markRef(current$$1, workInProgress), !shouldUpdate) // Context providers should defer to sCU for rendering
        return hasContext && invalidateContextProvider$1(workInProgress, !1), bailoutOnAlreadyFinishedWork(current$$1, workInProgress);
        var instance = workInProgress.stateNode;
        // Rerender
        ReactCurrentOwner$2.current = workInProgress;
        var nextChildren = void 0;
        // React DevTools reads this flag.
        // Memoize props and state using the values we just used to render.
        // TODO: Restructure so we never read values from the instance.
        // The context might have changed so we need to recalculate it.
        return nextChildren = instance.render(), workInProgress.effectTag |= PerformedWork$1, 
        reconcileChildren(current$$1, workInProgress, nextChildren), memoizeState(workInProgress, instance.state), 
        memoizeProps(workInProgress, instance.props), hasContext && invalidateContextProvider$1(workInProgress, !0), 
        workInProgress.child;
    }
    function pushHostRootContext(workInProgress) {
        var root = workInProgress.stateNode;
        root.pendingContext ? pushTopLevelContextObject$1(workInProgress, root.pendingContext, root.pendingContext !== root.context) : root.context && // Should always be set
        pushTopLevelContextObject$1(workInProgress, root.context, !1), pushHostContainer(workInProgress, root.containerInfo);
    }
    function updateHostRoot(current$$1, workInProgress, renderExpirationTime) {
        pushHostRootContext(workInProgress);
        var updateQueue = workInProgress.updateQueue;
        if (null !== updateQueue) {
            var prevState = workInProgress.memoizedState, state = processUpdateQueue(current$$1, workInProgress, updateQueue, null, null, renderExpirationTime);
            if (prevState === state) // If the state is the same as before, that's a bailout because we had
            // no work that expires at this time.
            return resetHydrationState(), bailoutOnAlreadyFinishedWork(current$$1, workInProgress);
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
            return (null === current$$1 || null === current$$1.child) && root.hydrate && enterHydrationState(workInProgress) ? (workInProgress.effectTag |= Placement$2, 
            workInProgress.child = mountChildFibersInPlace(workInProgress, workInProgress.child, element, renderExpirationTime)) : (resetHydrationState(), 
            reconcileChildren(current$$1, workInProgress, element)), memoizeState(workInProgress, state), 
            workInProgress.child;
        }
        // If there is no update queue, that's a bailout because the root has no props.
        return resetHydrationState(), bailoutOnAlreadyFinishedWork(current$$1, workInProgress);
    }
    function updateHostComponent(current$$1, workInProgress, renderExpirationTime) {
        pushHostContext(workInProgress), null === current$$1 && tryToClaimNextHydratableInstance(workInProgress);
        var type = workInProgress.type, memoizedProps = workInProgress.memoizedProps, nextProps = workInProgress.pendingProps;
        null === nextProps && (nextProps = memoizedProps, invariant(null !== nextProps, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue."));
        var prevProps = null !== current$$1 ? current$$1.memoizedProps : null;
        if (hasContextChanged$1()) ; else if (null === nextProps || memoizedProps === nextProps) return bailoutOnAlreadyFinishedWork(current$$1, workInProgress);
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
        markRef(current$$1, workInProgress), renderExpirationTime !== Never$2 && !useSyncScheduling && shouldDeprioritizeSubtree(type, nextProps) ? (workInProgress.expirationTime = Never$2, 
        null) : (reconcileChildren(current$$1, workInProgress, nextChildren), memoizeProps(workInProgress, nextProps), 
        workInProgress.child);
    }
    function updateHostText(current$$1, workInProgress) {
        null === current$$1 && tryToClaimNextHydratableInstance(workInProgress);
        var nextProps = workInProgress.pendingProps;
        // Nothing to do here. This is terminal. We'll do the completion step
        // immediately after.
        return null === nextProps && (nextProps = workInProgress.memoizedProps), memoizeProps(workInProgress, nextProps), 
        null;
    }
    function mountIndeterminateComponent(current$$1, workInProgress, renderExpirationTime) {
        invariant(null === current$$1, "An indeterminate component should never have mounted. This error is " + "likely caused by a bug in React. Please file an issue.");
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
            finishClassComponent(current$$1, workInProgress, !0, hasContext);
        }
        // Proceed under the assumption that this is a functional component
        return workInProgress.tag = FunctionalComponent$1, reconcileChildren(current$$1, workInProgress, value), 
        memoizeProps(workInProgress, props), workInProgress.child;
    }
    function updateCallComponent(current$$1, workInProgress, renderExpirationTime) {
        var nextCall = workInProgress.pendingProps;
        hasContextChanged$1() ? // Normally we can bail out on props equality but if context has changed
        // we don't do the bailout and we have to reuse existing props instead.
        null === nextCall && (nextCall = current$$1 && current$$1.memoizedProps, invariant(null !== nextCall, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue.")) : null !== nextCall && workInProgress.memoizedProps !== nextCall || (nextCall = workInProgress.memoizedProps);
        var nextChildren = nextCall.children;
        // This doesn't take arbitrary time so we could synchronously just begin
        // eagerly do the work of workInProgress.child as an optimization.
        // The following is a fork of reconcileChildrenAtExpirationTime but using
        // stateNode to store the child.
        return null === current$$1 ? workInProgress.stateNode = mountChildFibersInPlace(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime) : current$$1.child === workInProgress.child ? workInProgress.stateNode = reconcileChildFibers(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime) : workInProgress.stateNode = reconcileChildFibersInPlace(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime), 
        memoizeProps(workInProgress, nextCall), workInProgress.stateNode;
    }
    function updatePortalComponent(current$$1, workInProgress, renderExpirationTime) {
        pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
        var nextChildren = workInProgress.pendingProps;
        if (hasContextChanged$1()) // Normally we can bail out on props equality but if context has changed
        // we don't do the bailout and we have to reuse existing props instead.
        null === nextChildren && (nextChildren = current$$1 && current$$1.memoizedProps, 
        invariant(null != nextChildren, "We should always have pending or current props. This error is " + "likely caused by a bug in React. Please file an issue.")); else if (null === nextChildren || workInProgress.memoizedProps === nextChildren) return bailoutOnAlreadyFinishedWork(current$$1, workInProgress);
        // Portals are special because we don't append the children during mount
        // but at commit. Therefore we need to track insertions which the normal
        // flow doesn't do during mount. This doesn't happen at the root because
        // the root always starts with a "current" with a null child.
        // TODO: Consider unifying this with how the root works.
        return null === current$$1 ? (workInProgress.child = reconcileChildFibersInPlace(workInProgress, workInProgress.child, nextChildren, renderExpirationTime), 
        memoizeProps(workInProgress, nextChildren)) : (reconcileChildren(current$$1, workInProgress, nextChildren), 
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
    function bailoutOnAlreadyFinishedWork(current$$1, workInProgress) {
        return cloneChildFibers(current$$1, workInProgress), workInProgress.child;
    }
    function bailoutOnLowPriority(current$$1, workInProgress) {
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
    function beginWork(current$$1, workInProgress, renderExpirationTime) {
        if (workInProgress.expirationTime === NoWork$4 || workInProgress.expirationTime > renderExpirationTime) return bailoutOnLowPriority(current$$1, workInProgress);
        switch (workInProgress.tag) {
          case IndeterminateComponent$2:
            return mountIndeterminateComponent(current$$1, workInProgress, renderExpirationTime);

          case FunctionalComponent$1:
            return updateFunctionalComponent(current$$1, workInProgress);

          case ClassComponent$5:
            return updateClassComponent(current$$1, workInProgress, renderExpirationTime);

          case HostRoot$4:
            return updateHostRoot(current$$1, workInProgress, renderExpirationTime);

          case HostComponent$5:
            return updateHostComponent(current$$1, workInProgress, renderExpirationTime);

          case HostText$2:
            return updateHostText(current$$1, workInProgress);

          case CallHandlerPhase:
            // This is a restart. Reset the tag to the initial phase.
            workInProgress.tag = CallComponent$1;

          // Intentionally fall through since this is now the same.
            case CallComponent$1:
            return updateCallComponent(current$$1, workInProgress, renderExpirationTime);

          case ReturnComponent$1:
            // A return component is just a placeholder, we can just run through the
            // next one immediately.
            return null;

          case HostPortal$3:
            return updatePortalComponent(current$$1, workInProgress, renderExpirationTime);

          case Fragment$1:
            return updateFragment(current$$1, workInProgress);

          default:
            invariant(!1, "Unknown unit of work tag. This error is likely caused by a bug in " + "React. Please file an issue.");
        }
    }
    function beginFailedWork(current$$1, workInProgress, renderExpirationTime) {
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
        null === current$$1 ? workInProgress.child = null : workInProgress.child !== current$$1.child && (workInProgress.child = current$$1.child), 
        workInProgress.expirationTime === NoWork$4 || workInProgress.expirationTime > renderExpirationTime) return bailoutOnLowPriority(current$$1, workInProgress);
        if (// If we don't bail out, we're going be recomputing our children so we need
        // to drop our effect list.
        workInProgress.firstEffect = null, workInProgress.lastEffect = null, reconcileChildrenAtExpirationTime(current$$1, workInProgress, null, renderExpirationTime), 
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
    function moveCallToHandlerPhase(current$$1, workInProgress, renderExpirationTime) {
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
        var fn = call.handler, props = call.props, nextChildren = fn(props, returns), currentFirstChild = null !== current$$1 ? current$$1.child : null;
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
    updateHostContainer = function(workInProgress) {}, updateHostComponent = function(current$$1, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
        // TODO: Type this specific to this type of component.
        workInProgress.updateQueue = updatePayload, // If the update payload indicates that there is a change or if there
        // is a new ref we mark this as an update. All the work is done in commitWork.
        updatePayload && markUpdate(workInProgress);
    }, updateHostText = function(current$$1, workInProgress, oldText, newText) {
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
        }, updateHostComponent = function(current$$1, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
            // If there are no effects associated with this node, then none of our children had any updates.
            // This guarantees that we can reuse all of them.
            var childrenUnchanged = null === workInProgress.firstEffect, currentInstance = current$$1.stateNode;
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
        }, updateHostText = function(current$$1, workInProgress, oldText, newText) {
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
    updateHostContainer = function(workInProgress) {}, updateHostComponent = function(current$$1, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {}, 
    updateHostText = function(current$$1, workInProgress, oldText, newText) {}) : invariant(!1, "Noop reconciler is disabled.");
    function completeWork(current$$1, workInProgress, renderExpirationTime) {
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
            fiberRoot.pendingContext = null), null !== current$$1 && null !== current$$1.child || (popHydrationState(workInProgress), 
            workInProgress.effectTag &= ~Placement$4), updateHostContainer(workInProgress), 
            null;

          case HostComponent$6:
            popHostContext(workInProgress);
            var rootContainerInstance = getRootHostContainer(), type = workInProgress.type;
            if (null !== current$$1 && null != workInProgress.stateNode) {
                // If we have an alternate, that means this is an update and we need to
                // schedule a side-effect to do the updates.
                var oldProps = current$$1.memoizedProps, instance = workInProgress.stateNode, currentHostContext = getHostContext(), updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);
                updateHostComponent(current$$1, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance), 
                current$$1.ref !== workInProgress.ref && markRef(workInProgress);
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
            if (current$$1 && null != workInProgress.stateNode) {
                var oldText = current$$1.memoizedProps;
                // If we have an alternate, that means this is an update and we need
                // to schedule a side-effect to do the updates.
                updateHostText(current$$1, workInProgress, oldText, newText);
            } else {
                if ("string" != typeof newText) // This can happen when we abort work.
                return invariant(null !== workInProgress.stateNode, "We must have new props for new mounts. This error is likely " + "caused by a bug in React. Please file an issue."), 
                null;
                var _rootContainerInstance = getRootHostContainer(), _currentHostContext2 = getHostContext();
                popHydrationState(workInProgress) ? prepareToHydrateHostTextInstance(workInProgress) && markUpdate(workInProgress) : workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext2, workInProgress);
            }
            return null;

          case CallComponent$3:
            return moveCallToHandlerPhase(current$$1, workInProgress, renderExpirationTime);

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

function injectInternals(internals) {
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

var injectInternals_1 = injectInternals, onCommitRoot_1 = onCommitRoot$1, onCommitUnmount_1 = onCommitUnmount$1, ReactFiberDevToolsHook = {
    injectInternals: injectInternals_1,
    onCommitRoot: onCommitRoot_1,
    onCommitUnmount: onCommitUnmount_1
}, ClassComponent$9 = ReactTypeOfWork.ClassComponent, HostRoot$7 = ReactTypeOfWork.HostRoot, HostComponent$7 = ReactTypeOfWork.HostComponent, HostText$5 = ReactTypeOfWork.HostText, HostPortal$6 = ReactTypeOfWork.HostPortal, CallComponent$4 = ReactTypeOfWork.CallComponent, Placement$5 = ReactTypeOfSideEffect.Placement, Update$3 = ReactTypeOfSideEffect.Update, ContentReset$2 = ReactTypeOfSideEffect.ContentReset, commitCallbacks$1 = ReactFiberUpdateQueue.commitCallbacks, onCommitUnmount = ReactFiberDevToolsHook.onCommitUnmount, ReactFiberCommitWork = function(config, captureError) {
    var getPublicInstance = config.getPublicInstance, mutation = config.mutation, persistence = config.persistence;
    function safelyCallComponentWillUnmount(current$$1, instance) {
        try {
            instance.props = current$$1.memoizedProps, instance.state = current$$1.memoizedState, 
            instance.componentWillUnmount();
        } catch (unmountError) {
            captureError(current$$1, unmountError);
        }
    }
    function safelyDetachRef(current$$1) {
        var ref = current$$1.ref;
        if (null !== ref) {
            try {
                ref(null);
            } catch (refError) {
                captureError(current$$1, refError);
            }
        }
    }
    function commitLifeCycles(current$$1, finishedWork) {
        switch (finishedWork.tag) {
          case ClassComponent$9:
            var instance = finishedWork.stateNode;
            if (finishedWork.effectTag & Update$3) if (null === current$$1) instance.props = finishedWork.memoizedProps, 
            instance.state = finishedWork.memoizedState, instance.componentDidMount(); else {
                var prevProps = current$$1.memoizedProps, prevState = current$$1.memoizedState;
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
            if (null === current$$1 && finishedWork.effectTag & Update$3) {
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
    function commitDetachRef(current$$1) {
        var currentRef = current$$1.ref;
        null !== currentRef && currentRef(null);
    }
    // User-originating errors (lifecycles and refs) should not interrupt
    // deletion, so don't let them throw. Host-originating errors should
    // interrupt deletion, so it's okay
    function commitUnmount(current$$1) {
        switch ("function" == typeof onCommitUnmount && onCommitUnmount(current$$1), current$$1.tag) {
          case ClassComponent$9:
            safelyDetachRef(current$$1);
            var instance = current$$1.stateNode;
            return void ("function" == typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(current$$1, instance));

          case HostComponent$7:
            return void safelyDetachRef(current$$1);

          case CallComponent$4:
            return void commitNestedUnmounts(current$$1.stateNode);

          case HostPortal$6:
            // TODO: this is recursive.
            // We are also not using this parent because
            // the portal will get pushed immediately.
            return void (ReactFeatureFlagsWww.enableMutatingReconciler && mutation ? unmountHostComponents(current$$1) : ReactFeatureFlagsWww.enablePersistentReconciler && persistence && emptyPortalContainer(current$$1));
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
    function detachFiber(current$$1) {
        // Cut off the return pointers to disconnect it from the tree. Ideally, we
        // should clear the child pointer of the parent alternate to let this
        // get GC:ed but we don't know which for sure which parent is the current
        // one so we'll settle for GC:ing the subtree of this child. This child
        // itself will be GC:ed when the parent updates the next time.
        current$$1.return = null, current$$1.child = null, current$$1.alternate && (current$$1.alternate.child = null, 
        current$$1.alternate.return = null);
    }
    if (!mutation) {
        var commitContainer = void 0;
        if (persistence) {
            var replaceContainerChildren = persistence.replaceContainerChildren, createContainerChildSet = persistence.createContainerChildSet, emptyPortalContainer = function(current$$1) {
                var portal = current$$1.stateNode, containerInfo = portal.containerInfo, emptyChildSet = createContainerChildSet(containerInfo);
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
            commitDeletion: function(current$$1) {
                // Detach refs and call componentWillUnmount() on the whole subtree.
                commitNestedUnmounts(current$$1), detachFiber(current$$1);
            },
            commitWork: function(current$$1, finishedWork) {
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
    function unmountHostComponents(current$$1) {
        for (// We only have the top Fiber that was inserted but we need recurse down its
        var node = current$$1, currentParentIsValid = !1, currentParent = void 0, currentParentIsContainer = void 0; !0; ) {
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
            if (node === current$$1) return;
            for (;null === node.sibling; ) {
                if (null === node.return || node.return === current$$1) return;
                node = node.return, node.tag === HostPortal$6 && (// When we go out of the portal, we need to restore the parent.
                // Since we don't keep a stack of them, we will search for it.
                currentParentIsValid = !1);
            }
            node.sibling.return = node.return, node = node.sibling;
        }
    }
    function commitDeletion(current$$1) {
        // Recursively delete all host nodes from the parent.
        // Detach refs and call componentWillUnmount() on the whole subtree.
        unmountHostComponents(current$$1), detachFiber(current$$1);
    }
    function commitWork(current$$1, finishedWork) {
        switch (finishedWork.tag) {
          case ClassComponent$9:
            return;

          case HostComponent$7:
            var instance = finishedWork.stateNode;
            if (null != instance) {
                // Commit the work prepared earlier.
                var newProps = finishedWork.memoizedProps, oldProps = null !== current$$1 ? current$$1.memoizedProps : newProps, type = finishedWork.type, updatePayload = finishedWork.updateQueue;
                finishedWork.updateQueue = null, null !== updatePayload && commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork);
            }
            return;

          case HostText$5:
            invariant(null !== finishedWork.stateNode, "This should have a text node initialized. This error is likely " + "caused by a bug in React. Please file an issue.");
            var textInstance = finishedWork.stateNode, newText = finishedWork.memoizedProps, oldText = null !== current$$1 ? current$$1.memoizedProps : newText;
            return void commitTextUpdate(textInstance, oldText, newText);

          case HostRoot$7:
            return;

          default:
            invariant(!1, "This unit of work tag should not have side-effects. This error is " + "likely caused by a bug in React. Please file an issue.");
        }
    }
    function commitResetTextContent(current$$1) {
        resetTextContent(current$$1.stateNode);
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
}, getStackAddendumByWorkInProgressFiber = ReactFiberComponentTreeHook.getStackAddendumByWorkInProgressFiber, ReactCurrentOwner$1 = ReactGlobalSharedState_1.ReactCurrentOwner, PerformedWork = ReactTypeOfSideEffect.PerformedWork, Placement$1 = ReactTypeOfSideEffect.Placement, Update = ReactTypeOfSideEffect.Update, PlacementAndUpdate = ReactTypeOfSideEffect.PlacementAndUpdate, Deletion = ReactTypeOfSideEffect.Deletion, ContentReset = ReactTypeOfSideEffect.ContentReset, Callback = ReactTypeOfSideEffect.Callback, Err = ReactTypeOfSideEffect.Err, Ref = ReactTypeOfSideEffect.Ref, HostRoot$3 = ReactTypeOfWork.HostRoot, HostComponent$3 = ReactTypeOfWork.HostComponent, HostPortal$2 = ReactTypeOfWork.HostPortal, ClassComponent$3 = ReactTypeOfWork.ClassComponent, popContextProvider$1 = ReactFiberContext.popContextProvider, reset$1 = ReactFiberStack.reset, logCapturedError = ReactFiberErrorLogger.logCapturedError, createWorkInProgress$1 = ReactFiber.createWorkInProgress, onCommitRoot = ReactFiberDevToolsHook.onCommitRoot, NoWork$3 = ReactFiberExpirationTime.NoWork, Sync$1 = ReactFiberExpirationTime.Sync, Never$1 = ReactFiberExpirationTime.Never, msToExpirationTime$1 = ReactFiberExpirationTime.msToExpirationTime, computeExpirationBucket$1 = ReactFiberExpirationTime.computeExpirationBucket, AsyncUpdates = ReactTypeOfInternalContext.AsyncUpdates, getUpdateExpirationTime = ReactFiberUpdateQueue.getUpdateExpirationTime, _require14 = ReactFiberContext, resetContext$1 = _require14.resetContext, ReactFiberInstrumentation$1, ReactFiberScheduler = function(config) {
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
                var current$$1 = nextEffect.alternate;
                null !== current$$1 && commitDetachRef(current$$1);
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
                var current$$1 = nextEffect.alternate;
                commitLifeCycles(current$$1, nextEffect);
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
        ReactCurrentOwner$1.current = null;
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
            var current$$1 = workInProgress.alternate, next = completeWork(current$$1, workInProgress, nextRenderExpirationTime), returnFiber = workInProgress.return, siblingFiber = workInProgress.sibling;
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
        var current$$1 = workInProgress.alternate, next = beginWork(current$$1, workInProgress, nextRenderExpirationTime);
        // If this doesn't spawn new work, complete the current work.
        return !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onBeginWork(workInProgress), 
        null === next && (next = completeUnitOfWork(workInProgress)), ReactCurrentOwner$1.current = null, 
        next;
    }
    function performFailedUnitOfWork(workInProgress) {
        // The current, flushed, state of this fiber is the alternate.
        // Ideally nothing should rely on this, but relying on it here
        // means that we don't need an additional field on the work in
        // progress.
        var current$$1 = workInProgress.alternate, next = beginFailedWork(current$$1, workInProgress, nextRenderExpirationTime);
        // If this doesn't spawn new work, complete the current work.
        return !1 && ReactFiberInstrumentation$1.debugTool && ReactFiberInstrumentation$1.debugTool.onBeginWork(workInProgress), 
        null === next && (next = completeUnitOfWork(workInProgress)), ReactCurrentOwner$1.current = null, 
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
        ReactCurrentOwner$1.current = null;
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
    function scheduleTopLevelUpdate(current$$1, element, callback) {
        callback = void 0 === callback ? null : callback;
        var expirationTime = void 0;
        // Check if the top-level element is an async wrapper component. If so,
        // treat updates to the root as async. This is a bit weird but lets us
        // avoid a separate `renderAsync` API.
        expirationTime = ReactFeatureFlagsWww.enableAsyncSubtreeAPI && null != element && null != element.type && null != element.type.prototype && !0 === element.type.prototype.unstable_isAsyncReactComponent ? computeAsyncExpiration() : computeExpirationForFiber(current$$1), 
        insertUpdateIntoFiber(current$$1, {
            expirationTime: expirationTime,
            partialState: {
                element: element
            },
            callback: callback,
            isReplace: !1,
            isForced: !1,
            nextCallback: null,
            next: null
        }), scheduleWork(current$$1, expirationTime);
    }
    return {
        createContainer: function(containerInfo, hydrate) {
            return createFiberRoot(containerInfo, hydrate);
        },
        updateContainer: function(element, container, parentComponent, callback) {
            // TODO: If this is a nested container, this won't be the root.
            var current$$1 = container.current, context = getContextForSubtree(parentComponent);
            null === container.context ? container.context = context : container.pendingContext = context, 
            scheduleTopLevelUpdate(current$$1, element, callback);
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
}, index$2 = ReactFiberReconciler, hasNativePerformanceNow = "object" == typeof performance && "function" == typeof performance.now, now = void 0;

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
}, _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
    }
    return target;
};

function _possibleConstructorReturn(self, call) {
    if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return !call || "object" != typeof call && "function" != typeof call ? self : call;
}

function _inherits(subClass, superClass) {
    if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: !1,
            writable: !0,
            configurable: !0
        }
    }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass);
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}

current.setCurrent(// Change to 'art/modes/dom' for easier debugging via SVG
fastNoSideEffects);

var Mode = current, Component = react.Component, pooledTransform = new transform$1(), EVENT_TYPES = {
    onClick: "click",
    onMouseMove: "mousemove",
    onMouseOver: "mouseover",
    onMouseOut: "mouseout",
    onMouseUp: "mouseup",
    onMouseDown: "mousedown"
}, TYPES = {
    CLIPPING_RECTANGLE: "ClippingRectangle",
    GROUP: "Group",
    SHAPE: "Shape",
    TEXT: "Text"
}, UPDATE_SIGNAL = {};

/** Helper Methods */
function addEventListeners(instance, type, listener) {
    // We need to explicitly unregister before unmount.
    // For this reason we need to track subscriptions.
    instance._listeners || (instance._listeners = {}, instance._subscriptions = {}), 
    instance._listeners[type] = listener, listener ? instance._subscriptions[type] || (instance._subscriptions[type] = instance.subscribe(type, createEventHandler(instance), instance)) : instance._subscriptions[type] && (instance._subscriptions[type](), 
    delete instance._subscriptions[type]);
}

function childrenAsString(children) {
    return children ? "string" == typeof children ? children : children.length ? children.join("") : "" : "";
}

function createEventHandler(instance) {
    return function(event) {
        var listener = instance._listeners[event.type];
        listener && ("function" == typeof listener ? listener.call(instance, event) : listener.handleEvent && listener.handleEvent(event));
    };
}

function destroyEventListeners(instance) {
    if (instance._subscriptions) for (var type in instance._subscriptions) instance._subscriptions[type]();
    instance._subscriptions = null, instance._listeners = null;
}

function getScaleX(props) {
    return null != props.scaleX ? props.scaleX : null != props.scale ? props.scale : 1;
}

function getScaleY(props) {
    return null != props.scaleY ? props.scaleY : null != props.scale ? props.scale : 1;
}

function isSameFont(oldFont, newFont) {
    return oldFont === newFont || "string" != typeof newFont && "string" != typeof oldFont && (newFont.fontSize === oldFont.fontSize && newFont.fontStyle === oldFont.fontStyle && newFont.fontVariant === oldFont.fontVariant && newFont.fontWeight === oldFont.fontWeight && newFont.fontFamily === oldFont.fontFamily);
}

/** Render Methods */
function applyClippingRectangleProps(instance, props) {
    applyNodeProps(instance, props, arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}), 
    instance.width = props.width, instance.height = props.height;
}

function applyGroupProps(instance, props) {
    applyNodeProps(instance, props, arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}), 
    instance.width = props.width, instance.height = props.height;
}

function applyNodeProps(instance, props) {
    var prevProps = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, scaleX = getScaleX(props), scaleY = getScaleY(props);
    pooledTransform.transformTo(1, 0, 0, 1, 0, 0).move(props.x || 0, props.y || 0).rotate(props.rotation || 0, props.originX, props.originY).scale(scaleX, scaleY, props.originX, props.originY), 
    null != props.transform && pooledTransform.transform(props.transform), instance.xx === pooledTransform.xx && instance.yx === pooledTransform.yx && instance.xy === pooledTransform.xy && instance.yy === pooledTransform.yy && instance.x === pooledTransform.x && instance.y === pooledTransform.y || instance.transformTo(pooledTransform), 
    props.cursor === prevProps.cursor && props.title === prevProps.title || instance.indicate(props.cursor, props.title), 
    instance.blend && props.opacity !== prevProps.opacity && instance.blend(null == props.opacity ? 1 : props.opacity), 
    props.visible !== prevProps.visible && (null == props.visible || props.visible ? instance.show() : instance.hide());
    for (var type in EVENT_TYPES) addEventListeners(instance, EVENT_TYPES[type], props[type]);
}

function applyRenderableNodeProps(instance, props) {
    var prevProps = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    applyNodeProps(instance, props, prevProps), prevProps.fill !== props.fill && (props.fill && props.fill.applyFill ? props.fill.applyFill(instance) : instance.fill(props.fill)), 
    prevProps.stroke === props.stroke && prevProps.strokeWidth === props.strokeWidth && prevProps.strokeCap === props.strokeCap && prevProps.strokeJoin === props.strokeJoin && // TODO: Consider deep check of stokeDash; may benefit VML in IE.
    prevProps.strokeDash === props.strokeDash || instance.stroke(props.stroke, props.strokeWidth, props.strokeCap, props.strokeJoin, props.strokeDash);
}

function applyShapeProps(instance, props) {
    var prevProps = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    applyRenderableNodeProps(instance, props, prevProps);
    var path = props.d || childrenAsString(props.children), prevDelta = instance._prevDelta;
    path === instance._prevPath && path.delta === prevDelta && prevProps.height === props.height && prevProps.width === props.width || (instance.draw(path, props.width, props.height), 
    instance._prevDelta = path.delta, instance._prevPath = path);
}

function applyTextProps(instance, props) {
    var prevProps = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    applyRenderableNodeProps(instance, props, prevProps);
    var string = props.children;
    instance._currentString === string && isSameFont(props.font, prevProps.font) && props.alignment === prevProps.alignment && props.path === prevProps.path || (instance.draw(string, props.font, props.alignment, props.path), 
    instance._currentString = string);
}

/** Declarative fill-type objects; API design not finalized */
var slice = Array.prototype.slice, LinearGradient = function() {
    function LinearGradient(stops, x1, y1, x2, y2) {
        _classCallCheck(this, LinearGradient), this._args = slice.call(arguments);
    }
    return LinearGradient.prototype.applyFill = function(node) {
        node.fillLinear.apply(node, this._args);
    }, LinearGradient;
}(), RadialGradient = function() {
    function RadialGradient(stops, fx, fy, rx, ry, cx, cy) {
        _classCallCheck(this, RadialGradient), this._args = slice.call(arguments);
    }
    return RadialGradient.prototype.applyFill = function(node) {
        node.fillRadial.apply(node, this._args);
    }, RadialGradient;
}(), Pattern = function() {
    function Pattern(url, width, height, left, top) {
        _classCallCheck(this, Pattern), this._args = slice.call(arguments);
    }
    return Pattern.prototype.applyFill = function(node) {
        node.fillImage.apply(node, this._args);
    }, Pattern;
}(), Surface = function(_Component) {
    _inherits(Surface, _Component);
    function Surface() {
        return _classCallCheck(this, Surface), _possibleConstructorReturn(this, _Component.apply(this, arguments));
    }
    return Surface.prototype.componentDidMount = function() {
        var _props = this.props, height = _props.height, width = _props.width;
        this._surface = Mode.Surface(+width, +height, this._tagRef), this._mountNode = ARTRenderer.createContainer(this._surface), 
        ARTRenderer.updateContainer(this.props.children, this._mountNode, this);
    }, Surface.prototype.componentDidUpdate = function(prevProps, prevState) {
        var props = this.props;
        props.height === prevProps.height && props.width === prevProps.width || this._surface.resize(+props.width, +props.height), 
        ARTRenderer.updateContainer(this.props.children, this._mountNode, this), this._surface.render && this._surface.render();
    }, Surface.prototype.componentWillUnmount = function() {
        ARTRenderer.updateContainer(null, this._mountNode, this);
    }, Surface.prototype.render = function() {
        var _this2 = this, props = this.props, Tag = Mode.Surface.tagName;
        return react.createElement(Tag, {
            ref: function(ref) {
                return _this2._tagRef = ref;
            },
            accessKey: props.accessKey,
            className: props.className,
            draggable: props.draggable,
            role: props.role,
            style: props.style,
            tabIndex: props.tabIndex,
            title: props.title
        });
    }, Surface;
}(Component), Text = function(_React$Component) {
    _inherits(Text, _React$Component);
    function Text(props) {
        _classCallCheck(this, Text);
        // We allow reading these props. Ideally we could expose the Text node as
        // ref directly.
        var _this3 = _possibleConstructorReturn(this, _React$Component.call(this, props));
        return [ "height", "width", "x", "y" ].forEach(function(key) {
            Object.defineProperty(_this3, key, {
                get: function() {
                    return this._text ? this._text[key] : void 0;
                }
            });
        }), _this3;
    }
    return Text.prototype.render = function() {
        var _this4 = this, T = TYPES.TEXT;
        return react.createElement(T, _extends({}, this.props, {
            ref: function(t) {
                return _this4._text = t;
            }
        }), childrenAsString(this.props.children));
    }, Text;
}(react.Component), ARTRenderer = index$2({
    appendInitialChild: function(parentInstance, child) {
        if ("string" == typeof child) // Noop for string children of Text (eg <Text>{'foo'}{'bar'}</Text>)
        return void invariant(!1, "Text children should already be flattened.");
        child.inject(parentInstance);
    },
    createInstance: function(type, props, internalInstanceHandle) {
        var instance = void 0;
        switch (type) {
          case TYPES.CLIPPING_RECTANGLE:
            instance = Mode.ClippingRectangle(), instance._applyProps = applyClippingRectangleProps;
            break;

          case TYPES.GROUP:
            instance = Mode.Group(), instance._applyProps = applyGroupProps;
            break;

          case TYPES.SHAPE:
            instance = Mode.Shape(), instance._applyProps = applyShapeProps;
            break;

          case TYPES.TEXT:
            instance = Mode.Text(props.children, props.font, props.alignment, props.path), instance._applyProps = applyTextProps;
        }
        return invariant(instance, 'ReactART does not support the type "%s"', type), instance._applyProps(instance, props), 
        instance;
    },
    createTextInstance: function(text, rootContainerInstance, internalInstanceHandle) {
        return text;
    },
    finalizeInitialChildren: function(domElement, type, props) {
        return !1;
    },
    getPublicInstance: function(instance) {
        return instance;
    },
    prepareForCommit: function() {},
    prepareUpdate: function(domElement, type, oldProps, newProps) {
        return UPDATE_SIGNAL;
    },
    resetAfterCommit: function() {},
    resetTextContent: function(domElement) {},
    shouldDeprioritizeSubtree: function(type, props) {
        return !1;
    },
    getRootHostContext: function() {
        return emptyObject;
    },
    getChildHostContext: function() {
        return emptyObject;
    },
    scheduleDeferredCallback: ReactDOMFrameScheduling.rIC,
    shouldSetTextContent: function(type, props) {
        return "string" == typeof props.children || "number" == typeof props.children;
    },
    now: ReactDOMFrameScheduling.now,
    useSyncScheduling: !0,
    mutation: {
        appendChild: function(parentInstance, child) {
            child.parentNode === parentInstance && child.eject(), child.inject(parentInstance);
        },
        appendChildToContainer: function(parentInstance, child) {
            child.parentNode === parentInstance && child.eject(), child.inject(parentInstance);
        },
        insertBefore: function(parentInstance, child, beforeChild) {
            invariant(child !== beforeChild, "ReactART: Can not insert node before itself"), 
            child.injectBefore(beforeChild);
        },
        insertInContainerBefore: function(parentInstance, child, beforeChild) {
            invariant(child !== beforeChild, "ReactART: Can not insert node before itself"), 
            child.injectBefore(beforeChild);
        },
        removeChild: function(parentInstance, child) {
            destroyEventListeners(child), child.eject();
        },
        removeChildFromContainer: function(parentInstance, child) {
            destroyEventListeners(child), child.eject();
        },
        commitTextUpdate: function(textInstance, oldText, newText) {},
        commitMount: function(instance, type, newProps) {},
        commitUpdate: function(instance, updatePayload, type, oldProps, newProps) {
            instance._applyProps(instance, newProps, oldProps);
        }
    }
}), ReactART = {
    ClippingRectangle: TYPES.CLIPPING_RECTANGLE,
    Group: TYPES.GROUP,
    LinearGradient: LinearGradient,
    Path: Mode.Path,
    Pattern: Pattern,
    RadialGradient: RadialGradient,
    Shape: TYPES.SHAPE,
    Surface: Surface,
    Text: Text,
    Transform: transform$1
}, index = ReactART;

module.exports = index;
