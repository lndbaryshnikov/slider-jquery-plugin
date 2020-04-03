!function(t){var e={};function s(i){if(e[i])return e[i].exports;var n=e[i]={i:i,l:!1,exports:{}};return t[i].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=t,s.c=e,s.d=function(t,e,i){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},s.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(s.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)s.d(i,n,function(e){return t[e]}.bind(null,n));return i},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="",s(s.s=12)}([function(t,e,s){"use strict";e.a=class{constructor(){this.observers=[]}addObserver(t){if("function"!=typeof t)throw new Error("Observer must be a function");for(let e=0;e<this.observers.length;e+=1)if(this.observers[e].toString()===t.toString())throw new Error("Observer already in the list");this.observers.push(t)}removeObserver(t){for(let e=0;e<this.observers.length;e+=1)if(this.observers[e].toString()===t.toString())return void this.observers.splice(e,1);throw new Error("Could not find observer in list of observers")}notifyObservers(t){const e=this.observers.slice(0);for(let s=0;s<e.length;s+=1)e[s](t)}}},function(t,e,s){"use strict";e.a=t=>{const e=t.getBoundingClientRect();return{top:e.top+window.pageYOffset,bottom:e.bottom+window.pageYOffset,left:e.left+window.pageXOffset,right:e.right+window.pageXOffset,width:e.width,height:e.height}}},function(t,e){t.exports=jQuery},function(t,e,s){"use strict";(function(t){var i=s(8),n=s(0);class o{constructor(){this.incorrectOptionsReceivedSubject=new n.a,this.optionsSetSubject=new n.a,this.valueUpdatedSubject=new n.a,this.options=null,this.classes={slider:{main:"jquery-slider",orientation:t=>`jquery-slider-${t}`,complete:t=>`jquery-slider jquery-slider-${t}`,horizontal:"jquery-slider-horizontal",vertical:"jquery-slider-vertical"},range:"jquery-slider-range",firstHandle:"jquery-slider-handle"}}whenOptionsAreIncorrect(t){this.incorrectOptionsReceivedSubject.addObserver(e=>{t(e)})}whenOptionsSet(t){this.optionsSetSubject.addObserver(()=>{t()})}whenValueUpdated(t){this.valueUpdatedSubject.addObserver(()=>{t()})}static get optionsErrors(){return o.errors}static getDefaultOptions(t){const e=t||"horizontal";let s;return"horizontal"===e&&(s={"jquery-slider jquery-slider-horizontal":"","jquery-slider-range":"","jquery-slider-handle":""}),"vertical"===e&&(s={"jquery-slider jquery-slider-vertical":"","jquery-slider-range":"","jquery-slider-handle":""}),{min:0,max:100,step:1,value:0,orientation:e,range:!1,tooltip:!1,animate:"fast",pips:!1,labels:!1,change:!1,classes:s}}refreshValue(t){let e=t[0];const s=t[1];if(e<this.options.min&&(e=this.options.min),e>this.options.max&&(e=this.options.max),"number"==typeof this.options.value&&!0!==this.options.range&&(this.options.value=e),Array.isArray(this.options.value)&&!0===this.options.range){const t="first"===s?1:0,i=this.options.value;if(e===i[t]){e+=("first"===s?-1:1)*this.options.step}i["first"===s?0:1]=e}this.valueUpdatedSubject.notifyObservers()}destroy(){this.options||this._throw(o.errors.notSet),this.options=null}getOptions(t,e){const{errors:s}=o;if(!this.options)this._throw(o.errors.notSet);else{if(!t&&!e)return this.options;if(t){if(!(t in this.options))return void this._throw(s.options.notExisting(t));const i=[this.classes.slider.main,this.classes.range,this.classes.firstHandle];if(e&&!i.includes(e))return void this._throw(s.classes.notExisting(e));const n="classes"===t;if(t&&!!e&&!n)return void this._throw(s.classes.contains);if(t&&!e)return this.options[t];const o=e===this.classes.slider.main?this.classes.slider.complete(this.options.orientation):e;return this.options.classes[o]}}}setOptions(t,...e){const{errors:s}=o,i=0!==e.length,n="string"==typeof t,r="object"==typeof t&&0===e.length,l=!t&&0===e.length;if(i&&n){if(!!!this.options)return void this._throw(o.errors.notSet);if(1===e.length||2===e.length){const s=this._extendBySingleOption(t,...e);if(!s.result)return!1;this.options=s.options,s.options=null,this._deleteWSFromUserCLasses()}}else if(r){const e=this._extendByOptionsObject(t);if(!e.result)return;this.options=e.options,this._deleteWSFromUserCLasses()}else{if(!l)return this._throw(s.incorrectOptions);if(!!this.options)return void this._throw(s.alreadySet);this.options=o.getDefaultOptions("horizontal")}this.optionsSetSubject.notifyObservers()}_extendByOptionsObject(e){let s;if(this.options){s=t.extend(!0,{},this.options);const i=!!e.orientation,n=e.orientation!==this.options.orientation;if(i&&n){const t=this._changeOrientationClass(s,"result",e.orientation);if(t.options=null,!t.result)return{result:!1}}const o=this._changeOrientationClass(e,"user",e.orientation?e.orientation:this.options.orientation);if(o.options=null,!o.result)return{result:!1}}else{s=o.getDefaultOptions(e.orientation);const t=this._changeOrientationClass(e,"user",e.orientation);if(t.options=null,!t.result)return{result:!1}}let i=t.extend(!0,{},s);const n=t.extend(!0,i,e);return i=null,this._checkOptions(n)?{options:n,result:!0}:{result:!1}}_extendBySingleOption(e,...s){const i=o.optionsErrors;if(!(e in this.options))return this._throw(i.options.notExisting(e)),{result:!1};const n=t.extend(!0,{},this.options);if(1===s.length){if("classes"===e&&"object"==typeof s[0]){const e=s[0];this.classes.slider.main in e&&(e[this.classes.slider.complete(this.options.orientation)]=e[this.classes.slider.main],delete e[this.classes.slider.main]),t.extend(n.classes,e)}else if("orientation"===e)s[0]!==n.orientation&&(this._changeOrientationClass(n,"result",s[0]),n[e]=s[0]);else if("min"===e||"max"===e){if("number"!=typeof s[0])return this._throw(i.options.incorrectType(e,"number")),{result:!1};if("number"==typeof this.options.value){const t="min"===e&&s[0]>this.options.value,n="max"===e&&s[0]<this.options.value;if(t||n)return this._throw(i.minAndMax.lessOrMore(e,"min"===e?"more":"less")),{result:!1}}if(Array.isArray(this.options.value)){const t="min"===e&&(s[0]>this.options.value[0]||s[0]>this.options.value[1]),n="max"===e&&(s[0]<this.options.value[0]||s[0]<this.options.value[1]);if(t||n)return this._throw(i.minAndMax.lessOrMore(e,"min"===e?"more":"less")),{result:!1}}[n[e]]=s}else{const i={};[i[e]]=s,t.extend(n,i)}return this._checkOptions(n)?{result:!0,options:n}:{result:!1}}if(2===s.length){if("classes"!==e)return this._throw(i.classes.twoExtra),{result:!1};const t=[this.classes.slider.main,this.classes.range,this.classes.firstHandle];if("string"!=typeof s[0]||!t.includes(s[0]))return this._throw(i.classes.notExisting(s[0])),{result:!1};let o;return o=s[0]===this.classes.slider.main?this.classes.slider.complete(this.options.orientation):s[0],"string"!=typeof s[1]?(this._throw(i.classes.customIsNotString),{result:!1}):(n[e][o]=s[1],this._checkOptions(n)?{result:!0,options:n}:{result:!1})}return{result:!1}}_checkOptions(t){const e=o.getDefaultOptions(t.orientation),{errors:s}=o,n=Object.keys(t),r=Object.keys(e);if(!Object(i.a)(n,r))return this._throw(s.incorrectOptionsObject),!1;let l;for(l in t.classes)if(Object.prototype.hasOwnProperty.call(t.classes,l)&&l.trim()!==l)return this._throw(s.classes.extraWs),!1;const a=Object.keys(t.classes),h=Object.keys(e.classes);if(!Object(i.a)(a,h))return this._throw(s.classes.incorrectType),!1;for(l in t.classes)if(Object.prototype.hasOwnProperty.call(t.classes,l)&&"string"!=typeof t.classes[l])return this._throw(s.options.incorrectType("classes","string")),!1;if(!((t,e,...i)=>{for(const n of i)if(typeof e[n]!==t)return this._throw(s.options.incorrectType(n,t)),!1;return!0})("number",t,"min","max","step"))return!1;if("number"!=typeof t.value&&!Array.isArray(t.value))return this._throw(s.value.incorrectType),!1;if("horizontal"!==t.orientation&&"vertical"!==t.orientation)return this._throw(s.orientation.incorrect),!1;if("min"!==t.range&&"max"!==t.range&&"boolean"!=typeof t.range)return this._throw(s.range.incorrect),!1;if(!0!==t.range&&Array.isArray(t.value)&&this._throw(s.value.rangeNotTrue),!0!==t.range||Array.isArray(t.value)||this._throw(s.value.rangeTrue),Array.isArray(t.value))for(const e of t.value){if(!(t.min<=e&&t.max>=e))return this._throw(s.value.beyond),!1}else{if(!(t.min<=t.value&&t.max>=t.value))return this._throw(s.value.beyond),!1}if(t.step>t.max-t.min||t.step<=0)return this._throw(s.step.incorrect),!1;if("boolean"!=typeof t.tooltip&&"function"!=typeof t.tooltip)return this._throw(s.tooltip.incorrect),!1;if("function"==typeof t.tooltip){const e=t.tooltip(t.value);if("number"!=typeof e&&"string"!=typeof e)return this._throw(s.tooltip.incorrectFunction),!1}if(!1!==t.animate&&"slow"!==t.animate&&"fast"!==t.animate&&"number"!=typeof t.animate)return this._throw(s.animate.incorrect),!1;if("boolean"!=typeof t.pips)return this._throw(s.pips.incorrect),!1;if("function"!=typeof t.labels&&"boolean"!=typeof t.labels)return this._throw(s.labels.incorrect),!1;if("function"==typeof t.labels){const e=t.labels(t.value);if("string"!=typeof e&&"number"!=typeof e)return this._throw(s.labels.incorrectFunction),!1}if("function"!=typeof t.change&&!1!==t.change)return this._throw(s.change.incorrect),!1;if("function"==typeof t.change){if(void 0!==(0,t.change)(t.value))return void this._throw(s.change.incorrectFunction)}return!0}_changeOrientationClass(t,e,s){const i={};if(Object.entries(t).forEach(([t,e])=>{i[t]=e}),void 0!==s&&"horizontal"!==s&&"vertical"!==s)return this._throw(o.errors.orientation.incorrect),{result:!1};const n=void 0===s?"horizontal":s,r="user"===e,l=!!i.classes&&!!i.classes[this.classes.slider.main];if(r&&l&&(i.classes[this.classes.slider.complete(n)]=i.classes[this.classes.slider.main],delete i.classes[this.classes.slider.main]),"result"===e){let t;const e=[];for(t in i.classes)Object.prototype.hasOwnProperty.call(i.classes,t)&&(e.push(i.classes[t]),delete i.classes[t]);[i.classes[this.classes.slider.complete(n)],i.classes[this.classes.range],i.classes[this.classes.firstHandle]]=e}return{result:!0,options:i}}_deleteWSFromUserCLasses(){const{classes:t}=this.options;Object.keys(this.options.classes).forEach(t=>{Object.prototype.hasOwnProperty.call(this.options.classes,t)&&""!==this.options.classes[t]&&(this.options.classes[t]=this.options.classes[t].trim().replace(/\s+/g," "))})}_throw(t){this.incorrectOptionsReceivedSubject.notifyObservers(t)}}o.errors={notSet:"Options are not set (to set options pass options object)",alreadySet:"Options are already set (to change - provide options)",incorrectOptions:"Incorrect options (should be object or key - value pairs)",incorrectOptionsObject:"Options are incorrect (should correspond the required format)",options:{notExisting:t=>`Option "${t}" doesn't exist`,incorrectType:(t,e)=>`Options are incorrect (option '${t}' should be of type '${e}')`},classes:{notExisting:t=>`Class "${t}" does not exist`,contains:"Only option 'classes' contains classes",twoExtra:"Only option 'classes' can have two extra arguments",customIsNotString:"Class is incorrect (should be a string)",extraWs:"Options are incorrect (main classes shouldn't have extra whitespaces)",incorrectType:"Options are incorrect (classes should correspond the required format)"},value:{beyond:"Options are incorrect ('value' cannot go beyond 'min' and 'max')",incorrectType:"Options are incorrect ('value' can only be of type 'number' or 'array')",incorrectArray:"Options are incorrect ('value' array should contain two numbers)",rangeNotTrue:"Options are incorrect (array is allowed for 'value' when 'range' is true)",rangeTrue:"Options are incorrect ('value' should be array when 'range' is true)"},minAndMax:{lessOrMore:(t,e)=>`Options are incorrect (option '${t}' cannot be ${e} than 'value')`},orientation:{incorrect:"Options are incorrect (for orientation only 'vertical' and 'horizontal' values are allowed)"},range:{incorrect:"Options are incorrect (option 'range' can only be 'min', 'max' or typeof 'boolean')"},step:{incorrect:"Options are incorrect (option 'step' value should be between 'min' and 'max')"},tooltip:{incorrect:"Options are incorrect (option 'tooltip' should be boolean true or false, or function)",incorrectFunction:"Options are incorrect ('tooltip's function should return string or number)"},animate:{incorrect:"Options are incorrect (option 'animate' should be 'false', 'slow', 'fast' or number)"},labels:{incorrect:"Options are incorrect (option 'labels' can only be true false, or function returning string or number)",incorrectFunction:"Options are incorrect ('labels' function should return string or number)"},pips:{incorrect:"Options are incorrect (option 'pips' should be true or false)"},change:{incorrect:"Options are incorrect (option 'change' can be only function or false)",incorrectFunction:"Options are incorrect ('change' function has two arguments and return undefined)"}},e.a=o}).call(this,s(2))},function(t,e,s){},,,,function(t,e,s){"use strict";const i=(t,e)=>{if(!t||!e)return!1;if(t.length!==e.length)return!1;for(let s=0;s<t.length;s+=1)if(t[s]instanceof Array&&e[s]instanceof Array){if(!i(t[s],e[s]))return!1}else if(t[s]!==e[s])return!1;return!0};e.a=i},function(t,e,s){"use strict";(function(t){s.d(e,"a",(function(){return r}));var i=s(10),n=s(1),o=s(0);class r{constructor(){this.sliderHtml=null,this.root=null,this.options=null,this.classesHash=null,this.handlesPositionInPixels=null,this.data={rendered:!1},this.eventListeners={handleMoving:{handleMouseDown:t=>{let e;const s=t.target,{orientation:i}=this.options,n=!0===this.options.range,o=s===this.sliderHtml.firstHandle,r=s===this.sliderHtml.secondHandle;if(!n&&o&&(e=this._getCoords().wrapper),n){e=this._getCoords().wrapper;const t=this._getCoords().firstHandle,s=this._getCoords().secondHandle;o&&("horizontal"===i&&(e.right=s.left-t.width/2,e.width=e.right-e.left),"vertical"===i&&(e.top=s.bottom+t.height/2,e.height=e.bottom-e.top)),r&&("horizontal"===i&&(e.left=t.right+s.width/2,e.width=e.right-e.left),"vertical"===i&&(e.bottom=t.top-s.height/2,e.height=e.bottom-e.top))}let l;o&&(l="first"),r&&(l="second");const a=this._countHandleShift(t,l),h=t=>{if("horizontal"===this.options.orientation){const s=a.x;let i=t.pageX-s-e.left;i<0-this._getCoords().firstHandle.width/2&&(i=0-this._getCoords().firstHandle.width/2);const n=e.width-this._getCoords().firstHandle.width;i>n+this._getCoords().firstHandle.width/2&&(i=n+this._getCoords().firstHandle.width/2);const o=e.left+i+this._getCoords().firstHandle.width/2;this.refreshValue(o,l)}if("vertical"===this.options.orientation){const s=a.y;let i=t.pageY-s-e.top;i<0-this._getCoords().firstHandle.height/2&&(i=0-this._getCoords().firstHandle.height/2);const n=e.height-this._getCoords().firstHandle.height;i>n+this._getCoords().firstHandle.height/2&&(i=n+this._getCoords().firstHandle.height/2);const o=i+this._getCoords().firstHandle.height/2+e.top;this.refreshValue(o,l)}};document.addEventListener("mousemove",h);const c=()=>{document.removeEventListener("mousemove",h),document.removeEventListener("mouseup",c)};return document.addEventListener("mouseup",c),!1},handleOnDragStart:()=>!1},sliderClick:t=>{if(t.target===this.sliderHtml.firstHandle||t.target===this.sliderHtml.secondHandle)return;let e,s="first";"horizontal"===this.options.orientation&&(e=t.pageX),"vertical"===this.options.orientation&&(e=t.pageY),!0===this.options.range&&(s=this._getClosestHandleNumber(e)),this.refreshValue(e,s)}},this.valueChangedSubject=new o.a}whenValueChanged(t){this.valueChangedSubject.addObserver(e=>{t(e)})}get html(){return this.sliderHtml}get value(){return this.options.value}render(t){this.root=t,this.root.append(this.sliderHtml.wrapper),this.data.rendered=!0,this._setHandlePositionInPixels(),this._renderOptions()}destroy(){this.sliderHtml=void 0,this.root=void 0,this.options=void 0,this.handlesPositionInPixels=void 0,this.data.rendered=!1}cleanDom(){(!!this.root||this.root.contains(this.sliderHtml.wrapper))&&this.sliderHtml.wrapper.remove(),this.data.rendered=!1}setOptions(t){this.options=t;const e=this.data.rendered;let s=null;e&&(s=this.root,this.cleanDom()),this._setSliderElements(),this._setHandleMovingHandler(),this._setSliderClickHandler(),this._setSliderClasses(),this._setTransition(),this._setHandlePositionInPixels(),e&&this.render(s)}updateHandlePosition(t){this.options.value=t,this._setHandlePositionInPixels(),this._renderHandlePositions(),this._renderRange()}renderPlugin(t,e,s){if("labels"===t&&e.render(this.sliderHtml.wrapper),"tooltip"===t){const t=s||"first",i=this.sliderHtml.firstHandle.contains(e.html);"first"===t&&(i||e.render(this.sliderHtml.firstHandle)),"second"===t&&this.sliderHtml.secondHandle&&!i&&e.render(this.sliderHtml.secondHandle)}}destroyPlugin(t,e){"labels"!==t&&"tooltip"!==t||e.destroy()}refreshValue(t,e){let s;s=e||(!0!==this.options.range?"first":this._getClosestHandleNumber(t));const i=this.options.max-this.options.min,{orientation:n}=this.options,o=this._getCoords().wrapper,r="horizontal"===n,l=r?o.left:o.top;if(t>(r?o.right:o.bottom))return void this.valueChangedSubject.notifyObservers([r?this.options.max:this.options.min,s]);if(t<l)return void this.valueChangedSubject.notifyObservers([r?this.options.min:this.options.max,s]);const a="horizontal"===n?t-o.left:o.height-(t-o.top),h=(()=>{const t=[];for(let e=this.options.min;e<=this.options.max;e+=this.options.step)t.push(e);return t})(),c=("horizontal"===this.options.orientation?a/this._getCoords().wrapper.width:a/this._getCoords().wrapper.height)*i+this.options.min;let d;for(let t=0;t<h.length;t+=1)if(c>=h[t]&&c<=h[t+1]){d=c-h[t]<h[t+1]-c?h[t]:h[t+1];break}this.valueChangedSubject.notifyObservers([d,s])}_renderOptions(){this.data.rendered&&(this._renderHandlePositions(),this._renderRange())}_setHandleMovingHandler(){const t=t=>{t.addEventListener("mousedown",this.eventListeners.handleMoving.handleMouseDown),t.ondragstart=this.eventListeners.handleMoving.handleOnDragStart};t(this.sliderHtml.firstHandle),!0===this.options.range&&t(this.sliderHtml.secondHandle)}_setSliderClickHandler(){this.sliderHtml.wrapper.addEventListener("click",this.eventListeners.sliderClick)}_renderHandlePositions(){const t=t=>{const e="first"===t?this.sliderHtml.firstHandle:this.sliderHtml.secondHandle,s="first"===t?this._getCoords().firstHandle:this._getCoords().secondHandle,i=this.handlesPositionInPixels["first"===t?0:1];"horizontal"===this.options.orientation&&(e.style.left=`${i-s.width/2}px`),"vertical"===this.options.orientation&&(e.style.bottom=`${i-s.height/2}px`)};t("first"),!0===this.options.range&&t("second")}_renderRange(){const t=this.handlesPositionInPixels,e=this._getCoords().wrapper;"horizontal"===this.options.orientation&&("min"===this.options.range&&(this.sliderHtml.range.style.left="0px",this.sliderHtml.range.style.width=`${t[0]}px`),"max"===this.options.range&&(this.sliderHtml.range.style.right="0px",this.sliderHtml.range.style.width=`${e.width-t[0]}px`),!0===this.options.range&&(this.sliderHtml.range.style.left=`${t[0]}px`,this.sliderHtml.range.style.right=`${t[1]}px`,this.sliderHtml.range.style.width=`${t[1]-t[0]}px`)),"vertical"===this.options.orientation&&("min"===this.options.range&&(this.sliderHtml.range.style.bottom="0px",this.sliderHtml.range.style.height=`${t[0]}px`),"max"===this.options.range&&(this.sliderHtml.range.style.top="0px",this.sliderHtml.range.style.height=`${e.height-t[0]}px`),!0===this.options.range&&(this.sliderHtml.range.style.top=`${e.height-t[1]}px`,this.sliderHtml.range.style.bottom=`${t[0]}px`,this.sliderHtml.range.style.height=`${t[0]-t[1]}px`))}_setSliderClasses(){const e=Object.keys(this.options.classes),s=e[0],i=e[1],n=e[2];this.sliderHtml.wrapper.setAttribute("class",s),this.sliderHtml.range.setAttribute("class",i),this.sliderHtml.firstHandle.setAttribute("class",n),this.sliderHtml.wrapper.style.position="relative",this.sliderHtml.range.style.position="absolute",this.sliderHtml.firstHandle.style.position="absolute",t(this.sliderHtml.wrapper).addClass(this.options.classes[s]),t(this.sliderHtml.range).addClass(this.options.classes[i]),t(this.sliderHtml.firstHandle).addClass(this.options.classes[n]),this.sliderHtml.secondHandle&&(this.sliderHtml.secondHandle.setAttribute("class",n),this.sliderHtml.secondHandle.style.position="absolute",t(this.sliderHtml.secondHandle).addClass(this.options.classes[n]))}_setTransition(){const{animate:t}=this.options,e="horizontal"===this.options.orientation?"left":"bottom",s="fast"===t?300:"slow"===t?700:"number"==typeof t?t:0;this.sliderHtml.firstHandle.style.transition=`${e} ${s}ms`,this.sliderHtml.range.style.transition=`${s}ms`;const i=t=>{t.addEventListener("mousedown",()=>{t.style.transition="0ms",this.sliderHtml.range.style.transition="0ms"}),document.addEventListener("mouseup",()=>{t.style.transition=`${e} ${s}ms`,this.sliderHtml.range.style.transition=`${s}ms`})};i(this.sliderHtml.firstHandle),!0===this.options.range&&i(this.sliderHtml.secondHandle)}_setHandlePositionInPixels(){if(!this.data.rendered)return;this.handlesPositionInPixels=null,this.handlesPositionInPixels=[];const t=this.options.max-this.options.min,e=t=>{this.handlesPositionInPixels.push("horizontal"===this.options.orientation?this._getCoords().wrapper.width*t:this._getCoords().wrapper.height*t)};if(e(((!0===this.options.range?this.options.value[0]:this.options.value)-this.options.min)/t),!0===this.options.range){e((this.options.value[1]-this.options.min)/t)}}_setSliderElements(){const t=!0===this.options.range?document.createElement("div"):null;this.sliderHtml={wrapper:document.createElement("div"),range:document.createElement("div"),firstHandle:document.createElement("div"),secondHandle:t},this.sliderHtml.wrapper.append(this.sliderHtml.range),this.sliderHtml.wrapper.append(this.sliderHtml.firstHandle),!0===this.options.range&&this.sliderHtml.wrapper.append(this.sliderHtml.secondHandle)}_countHandleShift(t,e){const s="first"===e?this.sliderHtml.firstHandle:this.sliderHtml.secondHandle;return Object(i.a)(t,s)}_hasClassesChanged(){if(!this.classesHash)return!0;const{classes:t}=this.options,e=this.classesHash;return Object.keys(this.options.classes).forEach(s=>{if(Object.prototype.hasOwnProperty.call(this.options.classes,s)&&(!(s in e)||t[s]!==e[s]))return!0}),!1}_getCoords(){return{wrapper:Object(n.a)(this.sliderHtml.wrapper),range:Object(n.a)(this.sliderHtml.range),firstHandle:Object(n.a)(this.sliderHtml.firstHandle),secondHandle:!0===this.options.range?Object(n.a)(this.sliderHtml.secondHandle):null}}_getClosestHandleNumber(t){let e;if(!0===this.options.range){if("horizontal"===this.options.orientation){const s=this._getCoords().firstHandle.right,i=this._getCoords().secondHandle.left;if(t<i&&t>s){e=t-s>i-t?"second":"first"}t<s&&(e="first"),t>i&&(e="second")}if("vertical"===this.options.orientation){const s=this._getCoords().firstHandle.top,i=this._getCoords().secondHandle.bottom;if(t>i&&t<s){e=s-t>t-i?"second":"first"}t>s&&(e="first"),t<i&&(e="second")}return e}}}}).call(this,s(2))},function(t,e,s){"use strict";s.d(e,"a",(function(){return n}));var i=s(1);const n=(t,e)=>{const s=Object(i.a)(e);return{x:t.pageX-s.left,y:t.pageY-s.top}}},function(t,e,s){"use strict";var i=s(1),n=s(0);class o{constructor(){this.root=null,this.labelHtml=null,this.labelClickedSubject=new n.a}get state(){return{isRendered:!(!this.root||!this.labelHtml),isSet:!(!this.options||!this.sliderLabels)}}get labels(){return this.sliderLabels}setOptions(t){if(!t.labels&&!t.pips)return;let e;this.state.isRendered&&(e=this.root,this.destroy()),this.options=t,this._createLabels(),this._setClasses(),this.options.labels&&this._setText(),this._setClickHandler(),e&&this.render(e)}render(t){this.root=t;const{orientation:e}=this.options,s="horizontal"===e?"width":"height",n="horizontal"===e?"left":"bottom",o=Object(i.a)(t)[s],r=document.createElement("div");r.setAttribute("class",`jquery-slider-labels-scale jquery-slider-labels-scale-${e}`),r.style.position="absolute",r.style[s]=`${o}px`;const l=this._getInterval(o);let a=0;this.root.append(r),this.sliderLabels.forEach(t=>{r.append(t);const e=Object(i.a)(t)[s];if(t.style[n]=`${a-e/2}px`,this.options.pips){const o=t.children[0],r=Object(i.a)(o)[s];o.style[n]=`${e/2-r/2}px`}a+=l}),this.labelHtml=r}remove(){this.root.removeChild(this.labelHtml),this.root=null,this.labelHtml=null}destroy(){this.state.isRendered&&this.remove(),this.sliderLabels=null,this.options=null}whenUserClicksOnLabel(t){this.labelClickedSubject.addObserver(e=>{t(e)})}_createLabels(){const t=[];for(let e=this.options.min;e<=this.options.max;e+=this.options.step)t.push(this._getLabel());this.sliderLabels=t}_getLabel(){const t=document.createElement("div"),e=document.createElement("div");return t.setAttribute("class","jquery-slider-label"),e.setAttribute("class","jquery-slider-pip"),t.style.position="absolute",e.style.position="absolute",this.options.pips&&t.append(e),t}_setClasses(){const{orientation:t}=this.options;(this.options.labels||this.options.pips)&&this.sliderLabels.forEach(e=>{if(e.setAttribute("class","jquery-slider-label"),e.classList.add(`jquery-slider-label-${t}`),this.options.pips){const s=e.children[0];s.setAttribute("class","jquery-slider-pip"),s.classList.add(`jquery-slider-pip-${t}`)}})}_setText(){if(!this.options.labels)return;const t=this.options.valueFunc;for(let e=0,s=this.options.min;e<this.sliderLabels.length;e+=1,s+=this.options.step){const i=this.sliderLabels[e];i.innerHTML+=String(t?t(s):s)}}_getInterval(t){return t/((this.options.max-this.options.min)/this.options.step)}_setClickHandler(){this.sliderLabels.forEach(t=>{t.addEventListener("click",()=>{const e=Object(i.a)(t),s="horizontal"===this.options.orientation?e.left+e.width/2:e.top+e.height/2;this.labelClickedSubject.notifyObservers(s)})})}}class r{constructor(){this.tooltipText=null,this.orientation=null,this.root=null,this._create()}get html(){return this.tooltipHtml}get text(){return this.tooltipText}get state(){return{isRendered:!!this.root,isSet:!(!this.orientation||!this.tooltipText)}}setOptions(t,e,s){this.setText(t,s),this.setOrientation(e)}render(t){this.root=t,this.root.append(this.tooltipHtml)}setText(t,e){this.tooltipText=e?e(t):t,this.tooltipHtml.innerHTML=String(this.tooltipText)}setOrientation(t){this.orientation=t,this._setOrientationClass()}cleanTextField(){this.tooltipText=null,this.tooltipHtml.innerHTML=""}remove(){this.root.removeChild(this.tooltipHtml),this.root=null}destroy(){this.state.isRendered&&this.remove(),this.cleanTextField(),this.orientation=null,this.root=null,this.tooltipHtml.className="jquery-slider-tooltip"}_create(){const t=document.createElement("div");t.setAttribute("class","jquery-slider-tooltip"),t.style.position="absolute",this.tooltipHtml=t}_setOrientationClass(){this.tooltipHtml.setAttribute("class","jquery-slider-tooltip"),"horizontal"===this.orientation?this.tooltipHtml.classList.add("jquery-slider-tooltip-horizontal"):"vertical"===this.orientation&&this.tooltipHtml.classList.add("jquery-slider-tooltip-vertical")}}class l{createView(t){if("labels"===t)return new o;if("tooltip"===t)return new r;throw new Error("plugin doesn't exist")}}var a=s(3);class h{constructor(t,e){this.viewInstance=t,this.modelInstance=e,this.data={setUp:!1,rendered:!1},this.pluginsFactory=new l,this.plugins={tooltipView:{first:this.pluginsFactory.createView("tooltip"),second:this.pluginsFactory.createView("tooltip")},labelsView:this.pluginsFactory.createView("labels")},this.modelInstance.whenOptionsSet(this.makeSetOptionsToViewCallback()),this.modelInstance.whenOptionsAreIncorrect(h.makeShowErrorMessageCallback()),this.viewInstance.whenValueChanged(this.makeValidateValueCallback()),this.modelInstance.whenValueUpdated(this.makeRenderHandlePositionCallback()),this.plugins.labelsView.whenUserClicksOnLabel(t=>{this.viewInstance.refreshValue(t)})}get view(){return this.viewInstance}get model(){return this.modelInstance}initialize(t,e){if(this.data.rendered)throw new Error("Slider is already initialized");this.data.setUp||this.setOptions(e),this.data.rendered||this.render(t)}setOptions(t,...e){this.modelInstance.setOptions(t,...e),this.data.setUp=!0}getOptions(t,e){if(!this.data.setUp)throw new Error(a.a.optionsErrors.notSet);return this.modelInstance.getOptions(t,e)}render(t){if(!this.data.setUp)throw new Error("Slider isn't setUp");if(this.data.rendered)throw new Error("Slider is already rendered");this.viewInstance.render(t);const e=this.plugins.tooltipView.first,s=this.plugins.tooltipView.second,{labelsView:i}=this.plugins;i.state.isSet&&this.viewInstance.renderPlugin("labels",i),e.state.isSet&&this.viewInstance.renderPlugin("tooltip",e,"first"),s.state.isSet&&this.viewInstance.renderPlugin("tooltip",s,"second"),this.data.rendered=!0}destroy(){if(!this.data.setUp)throw new Error("Slider isn't initialized yet");!1!==this.data.rendered&&this.viewInstance.cleanDom(),this.viewInstance.destroy(),this.modelInstance.destroy(),this.data.setUp=!1,this.data.rendered=!1}off(){if(!this.data.rendered)throw new Error("Slider isn't rendered");this.viewInstance.cleanDom(),this.data.rendered=!1}makeSetOptionsToViewCallback(){return()=>{const t=this.modelInstance.getOptions();this.viewInstance.setOptions(t),this._toggleTooltip(t),this._toggleLabels(t)}}static makeShowErrorMessageCallback(){return t=>{throw new Error(t)}}makeValidateValueCallback(){return t=>{this.modelInstance.refreshValue(t)}}makeRenderHandlePositionCallback(){return()=>{const t=this.modelInstance.getOptions(),{value:e}=t,{tooltip:s}=t,{range:i}=t,{change:n}=t,o=this.plugins.tooltipView.first,r=this.plugins.tooltipView.second;this.viewInstance.updateHandlePosition(e),o.state.isRendered&&o.setText(!0!==i?e:e[0],"function"==typeof s?s:null),r.state.isRendered&&r.setText(!0!==i?e:e[1],"function"==typeof s?s:null),n&&"function"==typeof n&&n(t.value)}}_toggleTooltip(t){const e=this.plugins.tooltipView.first,s=this.plugins.tooltipView.second;t.tooltip?(!0!==t.range?e.setOptions(t.value,t.orientation,"function"==typeof t.tooltip?t.tooltip:null):(e.setOptions(t.value[0],t.orientation,"function"==typeof t.tooltip?t.tooltip:null),s.setOptions(t.value[1],t.orientation,"function"==typeof t.tooltip?t.tooltip:null)),this.data.rendered&&(this.viewInstance.renderPlugin("tooltip",e,"first"),!0===t.range&&this.viewInstance.renderPlugin("tooltip",s,"second"))):e.state.isRendered&&(this.viewInstance.destroyPlugin("tooltip",e),!0===t.range&&s.state.isRendered&&this.viewInstance.destroyPlugin("tooltip",s))}_toggleLabels(t){const{labelsView:e}=this.plugins;if(t.labels||t.pips){const s={labels:"function"==typeof t.labels||t.labels,pips:t.pips,orientation:t.orientation,min:t.min,max:t.max,step:t.step};"function"==typeof t.labels&&(s.valueFunc=t.labels),e.setOptions(s),this.data.rendered&&this.viewInstance.renderPlugin("labels",e)}else e.state.isRendered&&this.viewInstance.destroyPlugin("labels",e)}}e.a=h},function(t,e,s){"use strict";s.r(e),function(t){var e=s(3),i=s(9),n=s(11);s(4);(t=>{const s=t=>t.data("slider"),o=t=>{if(t)throw new Error("jQuery.slider already exists on this DOM element");if(!t)throw new Error("jQuery.slider doesn't exist on this DOM element");throw new Error("Incorrect argument")},r={init(t){const r=this.eq(0);if(!s(r)){const s=new n.a(new i.a,new e.a);return s.initialize(r[0],t),((t,e)=>{t.data("slider",{root:t,slider:e})})(r,s),r}o(!0)},destroy(){const t=this.eq(0),e=s(t);e?(e.slider.destroy(),t.removeData("slider")):o(!1)},options(...t){const e=this.eq(0),i=s(e);if(i){const{slider:s}=i;if(0===t.length)return s.getOptions();if(1===t.length&&"object"==typeof t[0])return s.setOptions(t[0]),e;const n=1===t.length,o=2===t.length,r=3===t.length,l="string"==typeof t[0],a="string"==typeof t[1],h="classes"===t[0],c=r&&h,d=o&&h,p=d&&a;if((o||c)&&l){if(p)return s.getOptions(t[0],t[1]);const i=t.slice(1);return s.setOptions(t[0],...i),e}if((d||n)&&l)return s.getOptions(t[0],t[1]);throw new Error("Passed options are incorrect")}o(!1)}};t.fn.slider=function(e,...s){if(r[e])return r[e].apply(this,s);const i="object"==typeof e,n=!e&&0===s.length;if(i||n)return r.init.call(this,e);t.error(`Method '${e}' doesn't exist for jQuery.slider`)}})(t)}.call(this,s(2))}]);
//# sourceMappingURL=jquery-slider.js.map