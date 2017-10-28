/** @license React v16.0.0
 * react-call-return.development.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';


if (process.env.NODE_ENV !== "production") {
(function() {

'use strict';

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

// The Symbol used to tag the special React types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_CALL_TYPE;
var REACT_RETURN_TYPE;
if (typeof Symbol === 'function' && Symbol['for']) {
  REACT_CALL_TYPE = Symbol['for']('react.call');
  REACT_RETURN_TYPE = Symbol['for']('react.return');
} else {
  REACT_CALL_TYPE = 0xeac8;
  REACT_RETURN_TYPE = 0xeac9;
}

var unstable_createCall = function (children, handler, props) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var call = {
    // This tag allow us to uniquely identify this as a React Call
    $$typeof: REACT_CALL_TYPE,
    key: key == null ? null : '' + key,
    children: children,
    handler: handler,
    props: props
  };

  {
    // TODO: Add _store property for marking this as validated.
    if (Object.freeze) {
      Object.freeze(call.props);
      Object.freeze(call);
    }
  }

  return call;
};

var unstable_createReturn = function (value) {
  var returnNode = {
    // This tag allow us to uniquely identify this as a React Return
    $$typeof: REACT_RETURN_TYPE,
    value: value
  };

  {
    // TODO: Add _store property for marking this as validated.
    if (Object.freeze) {
      Object.freeze(returnNode);
    }
  }

  return returnNode;
};

/**
 * Verifies the object is a call object.
 */
var unstable_isCall = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_CALL_TYPE;
};

/**
 * Verifies the object is a return object.
 */
var unstable_isReturn = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_RETURN_TYPE;
};

var unstable_REACT_RETURN_TYPE = REACT_RETURN_TYPE;
var unstable_REACT_CALL_TYPE = REACT_CALL_TYPE;

var ReactCallReturn = {
	unstable_createCall: unstable_createCall,
	unstable_createReturn: unstable_createReturn,
	unstable_isCall: unstable_isCall,
	unstable_isReturn: unstable_isReturn,
	unstable_REACT_RETURN_TYPE: unstable_REACT_RETURN_TYPE,
	unstable_REACT_CALL_TYPE: unstable_REACT_CALL_TYPE
};

var index = ReactCallReturn;

module.exports = index;

})();
}
