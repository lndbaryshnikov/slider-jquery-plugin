import {HorizontalClasses, Options, VerticalClasses} from "./SliderModel";
import {countShift} from "../../functions/common/countShift";
import getCoords from "../../functions/common/getCoords";
import Observer from "../Observer";

interface Html {
    wrapper: HTMLDivElement | null;
    range: HTMLDivElement | null;
    handle: HTMLDivElement | null;
}
export default class SliderView {
    private _html: Html | null = null;

    private _root: HTMLElement | null = null;
    private _options: Options | null = null;
    private _classesHash: Options["classes"] | null = null;
    private _handlePositionInPixels: number | null = null;

    private _data = {
        rendered: false
    };

    private _valueChangedSubject = new Observer();

    constructor() {
        this._setSliderElements();
        this._setHandleMovingHandler();
    }

    get html() {
        return this._html;
    }

    get value() {
        return this._options.value;
    }

    render(root: HTMLElement): void {
        this._root = root;
        this._root.append(this._html.wrapper);

        this._data.rendered = true;

        this._setHandlePositionInPixels();

        this._renderOptions();
    }

    destroy(): void {
        this._html = undefined;
        this._root = undefined;
        this._options = undefined;
        this._handlePositionInPixels = undefined;

        this._data.rendered = false;
    }  

    cleanDom() {
        if ( !!this._root || this._root.contains(this._html.wrapper) ) {
            this._html.wrapper.remove();
        }

        this._data.rendered = false;
    }

    setOptions(options: Options): void {
        this._options = options;

        this._setSliderClasses();
        this._setHandlePositionInPixels();

        this._renderOptions();
    }

    private _renderOptions() {
        if ( !this._data.rendered ) return;

        this._renderHandlePosition();

        this._renderRange();
    }

    private _setHandleMovingHandler() {
            //Drag'n'Drop code
            this._html.handle.onmousedown = (mouseDownEvent: MouseEvent) => {
                const handleShift = this._countHandleShift(mouseDownEvent);

                    document.onmousemove = (mouseMoveEvent: MouseEvent) => {
                        if ( this._options.orientation === 'horizontal' ) {
                            const shiftX = handleShift.x;

                            let newLeft = mouseMoveEvent.pageX - shiftX - this._getCoords().wrapper.left;
                            // + this._getCoords().handle.width / 2;

                            if (newLeft < 0 - this._getCoords().handle.width / 2) {
                                newLeft = 0 - this._getCoords().handle.width / 2;
                            }

                            const rightEdge = this._getCoords().wrapper.width - this._getCoords().handle.width;
                            // + this._getCoords().handle.width / 2;

                            if (newLeft > rightEdge + this._getCoords().handle.width / 2) {
                                newLeft = rightEdge + this._getCoords().handle.width / 2;
                            }

                            const currentHandlePositionInPercents = newLeft + this._getCoords().handle.width / 2;

                            this._refreshValue(currentHandlePositionInPercents);

                            this._setHandlePositionInPixels();

                            // this._handlePositionInPixels = newLeft + this._getCoords().handle.width / 2;
                        }

                        if ( this._options.orientation === 'vertical' ) {
                            const shiftY = handleShift.y;

                            let newTop = mouseMoveEvent.pageY - shiftY - this._getCoords().wrapper.top;
                            // + this._getCoords().handle.width / 2;

                            if (newTop < 0 - this._getCoords().handle.height / 2) {
                                newTop = 0 - this._getCoords().handle.height / 2;
                            }

                            const rightEdge = this._getCoords().wrapper.height - this._getCoords().handle.height;
                            // + this._getCoords().handle.width / 2;

                            if (newTop > rightEdge + this._getCoords().handle.height / 2) {
                                newTop = rightEdge + this._getCoords().handle.height / 2;
                            }

                            const currentHandlePositionInPercents = this._getCoords().wrapper.height
                                - newTop - this._getCoords().handle.height / 2;

                            this._refreshValue(currentHandlePositionInPercents);

                            this._setHandlePositionInPixels();

                            // this._handlePositionInPixels = this._getCoords().wrapper.height
                            //     - newTop - this._getCoords().handle.height / 2;
                        }

                        this._renderHandlePosition();

                        this._renderRange();

                        this._valueChangedSubject.notifyObservers();
                    };

                document.onmouseup = () => {
                    document.onmousemove = document.onmouseup = null;
                };

                return false;
            };

            this._html.handle.ondragstart = () => {
                return false;
            };

    }

    whenValueChanged(callback: () => void): void {
        this._valueChangedSubject.addObserver(() => {
            callback();
        })
    }

    private _renderHandlePosition() {
        if ( this._options.orientation === 'horizontal' ) {
            this._html.handle.style.left = this._handlePositionInPixels - this._getCoords().handle.width / 2 + 'px';
        }
        if ( this._options.orientation === 'vertical' ) {
            this._html.handle.style.bottom = this._handlePositionInPixels - this._getCoords().handle.height / 2 + 'px';
        }
    }

    private _renderRange() {
        if ( this._options.orientation === 'horizontal' ) {
            if (this._options.range === 'min') {
                this._html.range.style.left = 0 + 'px';
                this._html.range.style.width = this._handlePositionInPixels + 'px';
            }

            if (this._options.range === 'max') {
                this._html.range.style.right = 0 + 'px';
                this._html.range.style.width = this._getCoords().wrapper.width -
                    this._handlePositionInPixels + 'px';
            }
        }
        if ( this._options.orientation === 'vertical' ) {
            if (this._options.range === 'min') {
                this._html.range.style.bottom = 0 + 'px';
                this._html.range.style.height = this._handlePositionInPixels + 'px';
            }

            if (this._options.range === 'max') {
                this._html.range.style.top = 0 + 'px';
                this._html.range.style.height = this._getCoords().wrapper.height -
                    this._handlePositionInPixels + 'px';
            }
        }
    }

    private _setSliderClasses() {
        if ( this._classesHash && !this._hasClassesChanged() ) return;

        const defaultClasses = Object.keys(this._options.classes) as
            (keyof (VerticalClasses | HorizontalClasses))[];
        const wrapper = defaultClasses[0];
        const range = defaultClasses[1];
        const handle = defaultClasses[2];

        this._html.wrapper.setAttribute('class', wrapper);
        this._html.range.setAttribute('class', range);
        this._html.handle.setAttribute('class', handle);

        this._html.wrapper.style.position = 'relative';
        this._html.range.style.position = 'absolute';
        this._html.handle.style.position = 'absolute';

        $(this._html.wrapper).addClass(this._options.classes[wrapper]);
        $(this._html.range).addClass(this._options.classes[range]);
        $(this._html.handle).addClass(this._options.classes[handle]);

        this._classesHash = $.extend({}, this._options.classes);
    }

    private _hasClassesChanged() {
        if ( !this._classesHash ) return true;

        const classes = this._options.classes;
        const hash = this._classesHash;

        let mainClass: keyof Options["classes"];

        for (mainClass in this._options.classes ) {
            if ( !( mainClass in hash && classes[mainClass] === hash[mainClass] ) ) {
                return true;
            }
        }

        return false;
    }

    private _setHandlePositionInPixels() {
        if ( !this._data.rendered ) return;

        const range = this._options.max - this._options.min;
        const valueInPercents = (this._options.value - this._options.min) / range;

        this._handlePositionInPixels = this._options.orientation === "horizontal" ?
            this._getCoords().wrapper.width * valueInPercents :
            this._getCoords().wrapper.height * valueInPercents;
    }

    private _refreshValue(currentsHandlePositionInPixels: number) {
        const range = this._options.max - this._options.min;

        const getValuesArray = () => {
            const valuesArray: number[] = [];

            for ( let currentValue = this._options.min;
                  currentValue <= this._options.max; currentValue += this._options.step ) {

                valuesArray.push(currentValue);
            }

            return valuesArray;
        };

        const valuesArray = getValuesArray();

        const valueInPercents = this._options.orientation === "horizontal" ?
            currentsHandlePositionInPixels / this._getCoords().wrapper.width :
            currentsHandlePositionInPixels / this._getCoords().wrapper.height;

        const approximateValue = valueInPercents * range + this._options.min;

        let value: number;

        for (let i = 0; i < valuesArray.length; i++ ) {
            if ( approximateValue >= valuesArray[i] && approximateValue <= valuesArray[i + 1] ) {
                const rangeFromFirst = approximateValue - valuesArray[i];
                const rangeFromSecond = valuesArray[i + 1] - approximateValue;

                value = rangeFromFirst < rangeFromSecond ?
                    valuesArray[i] : valuesArray[i + 1];

                break;
            }
        }

        console.log(value);

        this._options.value = value;

        // this._valueChangedSubject.notifyObservers();
    }

    private _setSliderElements() {
        this._html = {
            wrapper: document.createElement('div'),
            range: document.createElement('div'),
            handle: document.createElement('div')
        };

        this._html.wrapper.append(this._html.range);
        this._html.wrapper.append(this._html.handle);
    }

    private _countHandleShift(mouseDownEvent: MouseEvent) {
        return countShift(mouseDownEvent, this._html.handle);
    }

    private _getCoords() {
        return {
            wrapper: getCoords(this._html.wrapper),
            range: getCoords(this._html.range),
            handle: getCoords(this._html.handle)
        }
    }
}





