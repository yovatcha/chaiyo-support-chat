"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("middleware",{

/***/ "(middleware)/./middleware.js":
/*!***********************!*\
  !*** ./middleware.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   middleware: () => (/* binding */ middleware)\n/* harmony export */ });\n/* harmony import */ var _lib_supabase_middleware__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/supabase/middleware */ \"(middleware)/./lib/supabase/middleware.js\");\n\nasync function middleware(request) {\n    return await (0,_lib_supabase_middleware__WEBPACK_IMPORTED_MODULE_0__.updateSession)(request);\n}\nconst config = {\n    // Run on all app routes EXCEPT static assets, the embeddable widget, and the\n    // public chat API (which must stay open to cross-origin embeds).\n    matcher: [\n        '/((?!_next/static|_next/image|favicon.ico|yo-bot.js|api).*)'\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbWlkZGxld2FyZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMEQ7QUFFbkQsZUFBZUMsV0FBV0MsT0FBTztJQUN0QyxPQUFPLE1BQU1GLHVFQUFhQSxDQUFDRTtBQUM3QjtBQUVPLE1BQU1DLFNBQVM7SUFDcEIsNkVBQTZFO0lBQzdFLGlFQUFpRTtJQUNqRUMsU0FBUztRQUFDO0tBQThEO0FBQzFFLEVBQUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy92YXRjaGFyYW1haS9teS1wcm9qZWN0cy95by1haS1zdXBwb3J0LWNoYXQvbWlkZGxld2FyZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1cGRhdGVTZXNzaW9uIH0gZnJvbSAnLi9saWIvc3VwYWJhc2UvbWlkZGxld2FyZSc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtaWRkbGV3YXJlKHJlcXVlc3QpIHtcbiAgcmV0dXJuIGF3YWl0IHVwZGF0ZVNlc3Npb24ocmVxdWVzdCk7XG59XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIC8vIFJ1biBvbiBhbGwgYXBwIHJvdXRlcyBFWENFUFQgc3RhdGljIGFzc2V0cywgdGhlIGVtYmVkZGFibGUgd2lkZ2V0LCBhbmQgdGhlXG4gIC8vIHB1YmxpYyBjaGF0IEFQSSAod2hpY2ggbXVzdCBzdGF5IG9wZW4gdG8gY3Jvc3Mtb3JpZ2luIGVtYmVkcykuXG4gIG1hdGNoZXI6IFsnLygoPyFfbmV4dC9zdGF0aWN8X25leHQvaW1hZ2V8ZmF2aWNvbi5pY298eW8tYm90LmpzfGFwaSkuKiknXSxcbn07XG4iXSwibmFtZXMiOlsidXBkYXRlU2Vzc2lvbiIsIm1pZGRsZXdhcmUiLCJyZXF1ZXN0IiwiY29uZmlnIiwibWF0Y2hlciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./middleware.js\n");

/***/ })

});