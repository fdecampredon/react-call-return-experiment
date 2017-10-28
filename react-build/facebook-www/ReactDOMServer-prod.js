/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @providesModule ReactDOMServer-prod
 * @preventMunge
 */
"use strict";

var invariant = require("fbjs/lib/invariant"), react = require('React'), emptyFunction = require("fbjs/lib/emptyFunction"), emptyObject = require("fbjs/lib/emptyObject"), hyphenateStyleName = require("fbjs/lib/hyphenateStyleName"), memoizeStringOnly = require("fbjs/lib/memoizeStringOnly"), RESERVED_PROPS = {
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
}, DOMProperty_1 = DOMProperty, MUST_USE_PROPERTY = DOMProperty_1.injection.MUST_USE_PROPERTY, HAS_BOOLEAN_VALUE = DOMProperty_1.injection.HAS_BOOLEAN_VALUE, HAS_NUMERIC_VALUE = DOMProperty_1.injection.HAS_NUMERIC_VALUE, HAS_POSITIVE_NUMERIC_VALUE = DOMProperty_1.injection.HAS_POSITIVE_NUMERIC_VALUE, HAS_OVERLOADED_BOOLEAN_VALUE = DOMProperty_1.injection.HAS_OVERLOADED_BOOLEAN_VALUE, HAS_STRING_BOOLEAN_VALUE = DOMProperty_1.injection.HAS_STRING_BOOLEAN_VALUE, HTMLDOMPropertyConfig = {
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

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ReactVersion = "16.0.0", matchHtmlRegExp = /["'&<>]/;

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

var escapeTextContentForBrowser_1 = escapeTextContentForBrowser;

/**
 * Escapes attribute value to prevent scripting attacks.
 *
 * @param {*} value Value to escape.
 * @return {string} An escaped string.
 */
function quoteAttributeValueForBrowser(value) {
    return '"' + escapeTextContentForBrowser_1(value) + '"';
}

var quoteAttributeValueForBrowser_1 = quoteAttributeValueForBrowser, VALID_ATTRIBUTE_NAME_REGEX = new RegExp("^[" + DOMProperty_1.ATTRIBUTE_NAME_START_CHAR + "][" + DOMProperty_1.ATTRIBUTE_NAME_CHAR + "]*$"), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};

function isAttributeNameSafe(attributeName) {
    return !!validatedAttributeNameCache.hasOwnProperty(attributeName) || !illegalAttributeNameCache.hasOwnProperty(attributeName) && (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName) ? (validatedAttributeNameCache[attributeName] = !0, 
    !0) : (illegalAttributeNameCache[attributeName] = !0, !1));
}

// shouldIgnoreValue() is currently duplicated in DOMPropertyOperations.
// TODO: Find a better place for this.
function shouldIgnoreValue(propertyInfo, value) {
    return null == value || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && !1 === value;
}

/**
 * Operations for dealing with DOM properties.
 */
var DOMMarkupOperations = {
    /**
   * Creates markup for the ID property.
   *
   * @param {string} id Unescaped ID.
   * @return {string} Markup string.
   */
    createMarkupForID: function(id) {
        return DOMProperty_1.ID_ATTRIBUTE_NAME + "=" + quoteAttributeValueForBrowser_1(id);
    },
    createMarkupForRoot: function() {
        return DOMProperty_1.ROOT_ATTRIBUTE_NAME + '=""';
    },
    /**
   * Creates markup for a property.
   *
   * @param {string} name
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
    createMarkupForProperty: function(name, value) {
        var propertyInfo = DOMProperty_1.getPropertyInfo(name);
        if (propertyInfo) {
            if (shouldIgnoreValue(propertyInfo, value)) return "";
            var attributeName = propertyInfo.attributeName;
            if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && !0 === value) return attributeName + '=""';
            if ("boolean" != typeof value || DOMProperty_1.shouldAttributeAcceptBooleanValue(name)) return attributeName + "=" + quoteAttributeValueForBrowser_1(value);
        } else if (DOMProperty_1.shouldSetAttribute(name, value)) return null == value ? "" : name + "=" + quoteAttributeValueForBrowser_1(value);
        return null;
    },
    /**
   * Creates markup for a custom property.
   *
   * @param {string} name
   * @param {*} value
   * @return {string} Markup string, or empty string if the property was invalid.
   */
    createMarkupForCustomAttribute: function(name, value) {
        return isAttributeNameSafe(name) && null != value ? name + "=" + quoteAttributeValueForBrowser_1(value) : "";
    }
}, DOMMarkupOperations_1 = DOMMarkupOperations, HTML_NAMESPACE = "http://www.w3.org/1999/xhtml", MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML", SVG_NAMESPACE = "http://www.w3.org/2000/svg", Namespaces$1 = {
    html: HTML_NAMESPACE,
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
        return HTML_NAMESPACE;
    }
}

function getChildNamespace$1(parentNamespace, type) {
    return null == parentNamespace || parentNamespace === HTML_NAMESPACE ? getIntrinsicNamespace$1(type) : parentNamespace === SVG_NAMESPACE && "foreignObject" === type ? HTML_NAMESPACE : parentNamespace;
}

var Namespaces_1 = Namespaces$1, getIntrinsicNamespace_1 = getIntrinsicNamespace$1, getChildNamespace_1 = getChildNamespace$1, DOMNamespaces = {
    Namespaces: Namespaces_1,
    getIntrinsicNamespace: getIntrinsicNamespace_1,
    getChildNamespace: getChildNamespace_1
}, omittedCloseTags = {
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
}, omittedCloseTags_1), voidElementTags_1 = voidElementTags, HTML = "__html";

function assertValidProps(tag, props, getStack) {
    props && (// Note the use of `==` which checks for null or undefined.
    voidElementTags_1[tag] && invariant(null == props.children && null == props.dangerouslySetInnerHTML, "%s is a void element tag and must neither have `children` nor " + "use `dangerouslySetInnerHTML`.%s", tag, getStack()), 
    null != props.dangerouslySetInnerHTML && (invariant(null == props.children, "Can only set one of `children` or `props.dangerouslySetInnerHTML`."), 
    invariant("object" == typeof props.dangerouslySetInnerHTML && HTML in props.dangerouslySetInnerHTML, "`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. " + "Please visit https://fb.me/react-invariant-dangerously-set-inner-html " + "for more information.")), 
    invariant(null == props.style || "object" == typeof props.style, "The `style` prop expects a mapping from style properties to values, " + "not a string. For example, style={{marginRight: spacing + 'em'}} when " + "using JSX.%s", getStack()));
}

var assertValidProps_1 = assertValidProps, isUnitlessNumber$1 = {
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

var dangerousStyleValue_1 = dangerousStyleValue;

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

var isCustomComponent_1 = isCustomComponent;

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}

var Namespaces = DOMNamespaces.Namespaces, getIntrinsicNamespace = DOMNamespaces.getIntrinsicNamespace, getChildNamespace = DOMNamespaces.getChildNamespace, toArray = react.Children.toArray, getStackAddendum = emptyFunction.thatReturns(""), newlineEatingTags = {
    listing: !0,
    pre: !0,
    textarea: !0
};

function getComponentName(type) {
    return "string" == typeof type ? type : "function" == typeof type ? type.displayName || type.name : null;
}

// We accept any tag to be rendered but since this gets injected into arbitrary
// HTML, we want to make sure that it's a safe tag.
// http://www.w3.org/TR/REC-xml/#NT-Name
var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, validatedTagCache = {};

function validateDangerousTag(tag) {
    validatedTagCache.hasOwnProperty(tag) || (invariant(VALID_TAG_REGEX.test(tag), "Invalid tag: %s", tag), 
    validatedTagCache[tag] = !0);
}

var processStyleName = memoizeStringOnly(function(styleName) {
    return hyphenateStyleName(styleName);
});

function createMarkupForStyles(styles) {
    var serialized = "", delimiter = "";
    for (var styleName in styles) if (styles.hasOwnProperty(styleName)) {
        var isCustomProperty = 0 === styleName.indexOf("--"), styleValue = styles[styleName];
        null != styleValue && (serialized += delimiter + processStyleName(styleName) + ":", 
        serialized += dangerousStyleValue_1(styleName, styleValue, isCustomProperty), delimiter = ";");
    }
    return serialized || null;
}

function warnNoop(publicInstance, callerName) {}

function shouldConstruct(Component) {
    return Component.prototype && Component.prototype.isReactComponent;
}

function getNonChildrenInnerMarkup(props) {
    var innerHTML = props.dangerouslySetInnerHTML;
    if (null != innerHTML) {
        if (null != innerHTML.__html) return innerHTML.__html;
    } else {
        var content = props.children;
        if ("string" == typeof content || "number" == typeof content) return escapeTextContentForBrowser_1(content);
    }
    return null;
}

function flattenOptionChildren(children) {
    var content = "";
    // Flatten children and warn if they aren't strings or numbers;
    // invalid types are ignored.
    return react.Children.forEach(children, function(child) {
        null != child && ("string" != typeof child && "number" != typeof child || (content += child));
    }), content;
}

function maskContext(type, context) {
    var contextTypes = type.contextTypes;
    if (!contextTypes) return emptyObject;
    var maskedContext = {};
    for (var contextName in contextTypes) maskedContext[contextName] = context[contextName];
    return maskedContext;
}

function processContext(type, context) {
    return maskContext(type, context);
}

var STYLE = "style", RESERVED_PROPS$1 = {
    children: null,
    dangerouslySetInnerHTML: null,
    suppressContentEditableWarning: null,
    suppressHydrationWarning: null
};

function createOpenTagMarkup(tagVerbatim, tagLowercase, props, namespace, makeStaticMarkup, isRootElement) {
    var ret = "<" + tagVerbatim;
    for (var propKey in props) if (props.hasOwnProperty(propKey)) {
        var propValue = props[propKey];
        if (null != propValue) {
            propKey === STYLE && (propValue = createMarkupForStyles(propValue));
            var markup = null;
            isCustomComponent_1(tagLowercase, props) ? RESERVED_PROPS$1.hasOwnProperty(propKey) || (markup = DOMMarkupOperations_1.createMarkupForCustomAttribute(propKey, propValue)) : markup = DOMMarkupOperations_1.createMarkupForProperty(propKey, propValue), 
            markup && (ret += " " + markup);
        }
    }
    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
    return makeStaticMarkup ? ret : (isRootElement && (ret += " " + DOMMarkupOperations_1.createMarkupForRoot()), 
    ret);
}

function validateRenderResult(child, type) {
    void 0 === child && invariant(!1, "%s(...): Nothing was returned from render. This usually means a " + "return statement is missing. Or, to render nothing, " + "return null.", getComponentName(type) || "Component");
}

function resolve(child, context) {
    for (;react.isValidElement(child); ) {
        // Safe because we just checked it's an element.
        var element = child, Component = element.type;
        if ("function" != typeof Component) break;
        var inst, publicContext = processContext(Component, context), queue = [], replace = !1, updater = {
            isMounted: function(publicInstance) {
                return !1;
            },
            enqueueForceUpdate: function(publicInstance) {
                if (null === queue) return warnNoop(publicInstance, "forceUpdate"), null;
            },
            enqueueReplaceState: function(publicInstance, completeState) {
                replace = !0, queue = [ completeState ];
            },
            enqueueSetState: function(publicInstance, partialState) {
                if (null === queue) return warnNoop(publicInstance, "setState"), null;
                queue.push(partialState);
            }
        };
        if (shouldConstruct(Component)) inst = new Component(element.props, publicContext, updater); else if (null == (inst = Component(element.props, publicContext, updater)) || null == inst.render) {
            child = inst, validateRenderResult(child, Component);
            continue;
        }
        inst.props = element.props, inst.context = publicContext, inst.updater = updater;
        var initialState = inst.state;
        if (void 0 === initialState && (inst.state = initialState = null), inst.componentWillMount) if (inst.componentWillMount(), 
        queue.length) {
            var oldQueue = queue, oldReplace = replace;
            if (queue = null, replace = !1, oldReplace && 1 === oldQueue.length) inst.state = oldQueue[0]; else {
                for (var nextState = oldReplace ? oldQueue[0] : inst.state, dontMutate = !0, i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
                    var partial = oldQueue[i], partialState = "function" == typeof partial ? partial.call(inst, nextState, element.props, publicContext) : partial;
                    partialState && (dontMutate ? (dontMutate = !1, nextState = Object.assign({}, nextState, partialState)) : Object.assign(nextState, partialState));
                }
                inst.state = nextState;
            }
        } else queue = null;
        child = inst.render(), validateRenderResult(child, Component);
        var childContext;
        if ("function" == typeof inst.getChildContext) {
            var childContextTypes = Component.childContextTypes;
            invariant("object" == typeof childContextTypes, "%s.getChildContext(): childContextTypes must be defined in order to " + "use getChildContext().", getComponentName(Component) || "Unknown"), 
            childContext = inst.getChildContext();
            for (var contextKey in childContext) invariant(contextKey in childContextTypes, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', getComponentName(Component) || "Unknown", contextKey);
        }
        childContext && (context = Object.assign({}, context, childContext));
    }
    return {
        child: child,
        context: context
    };
}

var ReactDOMServerRenderer = function() {
    function ReactDOMServerRenderer(children, makeStaticMarkup) {
        _classCallCheck(this, ReactDOMServerRenderer);
        var flatChildren;
        if (react.isValidElement(children)) {
            flatChildren = [ children ];
        } else flatChildren = toArray(children);
        var topFrame = {
            // Assume all trees start in the HTML namespace (not totally true, but
            // this is what we did historically)
            domNamespace: Namespaces.html,
            children: flatChildren,
            childIndex: 0,
            context: emptyObject,
            footer: ""
        };
        this.stack = [ topFrame ], this.exhausted = !1, this.currentSelectValue = null, 
        this.previousWasTextNode = !1, this.makeStaticMarkup = makeStaticMarkup;
    }
    // TODO: type this more strictly:
    return ReactDOMServerRenderer.prototype.read = function(bytes) {
        if (this.exhausted) return null;
        for (var out = ""; out.length < bytes; ) {
            if (0 === this.stack.length) {
                this.exhausted = !0;
                break;
            }
            var frame = this.stack[this.stack.length - 1];
            if (frame.childIndex >= frame.children.length) {
                var footer = frame.footer;
                out += footer, "" !== footer && (this.previousWasTextNode = !1), this.stack.pop(), 
                "select" === frame.tag && (this.currentSelectValue = null);
            } else {
                var child = frame.children[frame.childIndex++];
                out += this.render(child, frame.context, frame.domNamespace);
            }
        }
        return out;
    }, ReactDOMServerRenderer.prototype.render = function(child, context, parentNamespace) {
        if ("string" == typeof child || "number" == typeof child) {
            var text = "" + child;
            return "" === text ? "" : this.makeStaticMarkup ? escapeTextContentForBrowser_1(text) : this.previousWasTextNode ? "\x3c!-- --\x3e" + escapeTextContentForBrowser_1(text) : (this.previousWasTextNode = !0, 
            escapeTextContentForBrowser_1(text));
        }
        var nextChild, _resolve = resolve(child, context);
        if (nextChild = _resolve.child, context = _resolve.context, null === nextChild || !1 === nextChild) return "";
        if (react.isValidElement(nextChild)) {
            // Safe because we just checked it's an element.
            var nextElement = nextChild;
            return this.renderDOM(nextElement, context, parentNamespace);
        }
        var nextChildren = toArray(nextChild), frame = {
            domNamespace: parentNamespace,
            children: nextChildren,
            childIndex: 0,
            context: context,
            footer: ""
        };
        return this.stack.push(frame), "";
    }, ReactDOMServerRenderer.prototype.renderDOM = function(element, context, parentNamespace) {
        var tag = element.type.toLowerCase(), namespace = parentNamespace;
        parentNamespace === Namespaces.html && (namespace = getIntrinsicNamespace(tag)), 
        validateDangerousTag(tag);
        var props = element.props;
        if ("input" === tag) props = Object.assign({
            type: void 0
        }, props, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: null != props.value ? props.value : props.defaultValue,
            checked: null != props.checked ? props.checked : props.defaultChecked
        }); else if ("textarea" === tag) {
            var initialValue = props.value;
            if (null == initialValue) {
                var defaultValue = props.defaultValue, textareaChildren = props.children;
                null != textareaChildren && (invariant(null == defaultValue, "If you supply `defaultValue` on a <textarea>, do not pass children."), 
                Array.isArray(textareaChildren) && (invariant(textareaChildren.length <= 1, "<textarea> can only have at most one child."), 
                textareaChildren = textareaChildren[0]), defaultValue = "" + textareaChildren), 
                null == defaultValue && (defaultValue = ""), initialValue = defaultValue;
            }
            props = Object.assign({}, props, {
                value: void 0,
                children: "" + initialValue
            });
        } else if ("select" === tag) this.currentSelectValue = null != props.value ? props.value : props.defaultValue, 
        props = Object.assign({}, props, {
            value: void 0
        }); else if ("option" === tag) {
            var selected = null, selectValue = this.currentSelectValue, optionChildren = flattenOptionChildren(props.children);
            if (null != selectValue) {
                var value;
                if (value = null != props.value ? props.value + "" : optionChildren, selected = !1, 
                Array.isArray(selectValue)) {
                    // multiple
                    for (var j = 0; j < selectValue.length; j++) if ("" + selectValue[j] === value) {
                        selected = !0;
                        break;
                    }
                } else selected = "" + selectValue === value;
                props = Object.assign({
                    selected: void 0,
                    children: void 0
                }, props, {
                    selected: selected,
                    children: optionChildren
                });
            }
        }
        assertValidProps_1(tag, props, getStackAddendum);
        var out = createOpenTagMarkup(element.type, tag, props, namespace, this.makeStaticMarkup, 1 === this.stack.length), footer = "";
        omittedCloseTags_1.hasOwnProperty(tag) ? out += "/>" : (out += ">", footer = "</" + element.type + ">");
        var children, innerMarkup = getNonChildrenInnerMarkup(props);
        null != innerMarkup ? (children = [], newlineEatingTags[tag] && "\n" === innerMarkup.charAt(0) && (// text/html ignores the first character in these tags if it's a newline
        // Prefer to break application/xml over text/html (for now) by adding
        // a newline specifically to get eaten by the parser. (Alternately for
        // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
        // \r is normalized out by HTMLTextAreaElement#value.)
        // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
        // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
        // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
        // See: Parsing of "textarea" "listing" and "pre" elements
        //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
        out += "\n"), out += innerMarkup) : children = toArray(props.children);
        var frame = {
            domNamespace: getChildNamespace(parentNamespace, element.type),
            tag: tag,
            children: children,
            childIndex: 0,
            context: context,
            footer: footer
        };
        return this.stack.push(frame), this.previousWasTextNode = !1, out;
    }, ReactDOMServerRenderer;
}(), ReactPartialRenderer = ReactDOMServerRenderer;

/**
 * Render a ReactElement to its initial HTML. This should only be used on the
 * server.
 * See https://reactjs.org/docs/react-dom-server.html#rendertostring
 */
function renderToString(element) {
    return new ReactPartialRenderer(element, !1).read(1 / 0);
}

/**
 * Similar to renderToString, except this doesn't create extra DOM attributes
 * such as data-react-id that React uses internally.
 * See https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup
 */
function renderToStaticMarkup(element) {
    return new ReactPartialRenderer(element, !0).read(1 / 0);
}

var ReactDOMStringRenderer = {
    renderToString: renderToString,
    renderToStaticMarkup: renderToStaticMarkup
}, ReactDOMServerBrowser = {
    renderToString: ReactDOMStringRenderer.renderToString,
    renderToStaticMarkup: ReactDOMStringRenderer.renderToStaticMarkup,
    renderToNodeStream: function() {
        invariant(!1, "ReactDOMServer.renderToNodeStream(): The streaming API is not available " + "in the browser. Use ReactDOMServer.renderToString() instead.");
    },
    renderToStaticNodeStream: function() {
        invariant(!1, "ReactDOMServer.renderToStaticNodeStream(): The streaming API is not available " + "in the browser. Use ReactDOMServer.renderToStaticMarkup() instead.");
    },
    version: ReactVersion
}, server_browser = ReactDOMServerBrowser;

module.exports = server_browser;
