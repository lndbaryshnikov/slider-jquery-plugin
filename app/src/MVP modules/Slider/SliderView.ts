import {HorizontalClasses, Options, VerticalClasses} from "./SliderModel";
import {countShift} from "../../functions/common/countShift";
import getCoords from "../../functions/common/getCoords";
import Observer from "../Observer";
import SliderTooltipView from "../SliderTooltipView";
import SliderLabelsView from "../SliderLabelsView";

interface Html {
    wrapper: HTMLDivElement | null;
    range: HTMLDivElement | null;
    firstHandle: HTMLDivElement | null;
    secondHandle: HTMLDivElement | null;
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

    private _eventListeners = {
        handleMoving: {
            handleMouseDown: (mouseDownEvent: MouseEvent) => {
                const handleShift = this._countHandleShift(mouseDownEvent);

                const mouseMoveHandler = (mouseMoveEvent: MouseEvent) => {
                    if ( this._options.orientation === 'horizontal' ) {
                        const shiftX = handleShift.x;

                        let newLeft = mouseMoveEvent.pageX - shiftX - this._getCoords().wrapper.left;

                        if (newLeft < 0 - this._getCoords().handle.width / 2) {
                            newLeft = 0 - this._getCoords().handle.width / 2;
                        }

                        const rightEdge = this._getCoords().wrapper.width - this._getCoords().handle.width;

                        if (newLeft > rightEdge + this._getCoords().handle.width / 2) {
                            newLeft = rightEdge + this._getCoords().handle.width / 2;
                        }

                        const currentHandleXInPixels = this._getCoords().wrapper.left +
                            newLeft + this._getCoords().handle.width / 2;

                        this.refreshValue(currentHandleXInPixels);
                    }

                    if ( this._options.orientation === 'vertical' ) {
                        const shiftY = handleShift.y;

                        let newTop = mouseMoveEvent.pageY - shiftY - this._getCoords().wrapper.top;

                        if (newTop < 0 - this._getCoords().handle.height / 2) {
                            newTop = 0 - this._getCoords().handle.height / 2;
                        }

                        const rightEdge = this._getCoords().wrapper.height - this._getCoords().handle.height;

                        if (newTop > rightEdge + this._getCoords().handle.height / 2) {
                            newTop = rightEdge + this._getCoords().handle.height / 2;
                        }

                        const currentHandleYInPixels = newTop + this._getCoords().handle.height / 2
                            + this._getCoords().wrapper.top;

                        this.refreshValue(currentHandleYInPixels);
                    }
                };

                document.addEventListener("mousemove", mouseMoveHandler);

                const mouseUpHandler = () => {
                    document.removeEventListener("mousemove", mouseMoveHandler);
                    document.removeEventListener("mousemove", mouseUpHandler);
                };

                document.addEventListener("mouseup", mouseUpHandler);

                return false;
            },
            handleOnDragStart: () => {
                return false;
            }
        },
        sliderClick: (clickEvent: MouseEvent) => {
            if ( clickEvent.target === this._html.firstHandle ) return;
            let coordinateToMove: number;

            if ( this._options.orientation === "horizontal" ) {
                coordinateToMove = clickEvent.pageX;
            }

            if ( this._options.orientation === "vertical" ) {
                coordinateToMove = clickEvent.pageY;
            }

            this.refreshValue(coordinateToMove);
        }
    };

    private _valueChangedSubject = new Observer();

    whenValueChanged(callback: (value: Options["value"]) => void): void {
        this._valueChangedSubject.addObserver((value: Options["value"]) => {
            callback(value);
        })
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

        const wasRendered = this._data.rendered;

        let rootSnapshot: null | HTMLElement = null;

        if ( wasRendered ) {
            rootSnapshot = this._root;

            this.cleanDom();
        }

        this._setSliderElements();
        this._setHandleMovingHandler();
        this._setSliderClickHandler();

        this._setSliderClasses();
        this._setTransition();
        this._setHandlePositionInPixels();

        if ( wasRendered ) {
            this.render(rootSnapshot);
        }
    }

    updateHandlePosition(value: Options["value"]) {
        this._options.value = value;

        this._setHandlePositionInPixels();
        this._renderHandlePosition();
        this._renderRange();
    }

    private _renderOptions() {
        if ( !this._data.rendered ) return;

        this._renderHandlePosition();

        this._renderRange();
    }

    private _setHandleMovingHandler() {
        this._html.firstHandle.addEventListener("mousedown", this._eventListeners.handleMoving.handleMouseDown);

        this._html.firstHandle.ondragstart = this._eventListeners.handleMoving.handleOnDragStart;
    }

    private _setSliderClickHandler() {
        this._html.wrapper.addEventListener("click", this._eventListeners.sliderClick);
    }

    private _renderHandlePosition() {
        if ( this._options.orientation === 'horizontal' ) {
            this._html.firstHandle.style.left = this._handlePositionInPixels - this._getCoords().handle.width / 2 + 'px';
        }
        if ( this._options.orientation === 'vertical' ) {
            this._html.firstHandle.style.bottom = this._handlePositionInPixels - this._getCoords().handle.height / 2 + 'px';
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
        // if ( this._classesHash && !this._hasClassesChanged() ) return;

        const defaultClasses = Object.keys(this._options.classes) as
            (keyof (VerticalClasses | HorizontalClasses))[];
        const wrapper = defaultClasses[0];
        const range = defaultClasses[1];
        const handle = defaultClasses[2];

        this._html.wrapper.setAttribute('class', wrapper);
        this._html.range.setAttribute('class', range);
        this._html.firstHandle.setAttribute('class', handle);

        this._html.wrapper.style.position = 'relative';
        this._html.range.style.position = 'absolute';
        this._html.firstHandle.style.position = 'absolute';

        $(this._html.wrapper).addClass(this._options.classes[wrapper]);
        $(this._html.range).addClass(this._options.classes[range]);
        $(this._html.firstHandle).addClass(this._options.classes[handle]);

        if ( this._html.secondHandle ) {
            this._html.secondHandle.setAttribute('class', handle);
            this._html.secondHandle.style.position = 'absolute';
            $(this._html.secondHandle).addClass(this._options.classes[handle]);
        }

        // this._classesHash = $.extend({}, this._options.classes);
    }

    private _setTransition() {
        const animate = this._options.animate;

        const handleProp = this._options.orientation === "horizontal" ? "left" : "bottom";
        const rangeProp = this._options.orientation === "horizontal" ? "width" : "height";

        let transitionMs: number = animate === "fast" ? 300 :
            animate === "slow" ? 700 : typeof animate === "number" ? animate : 0;

        this._html.firstHandle.style.transition = `${handleProp} ${transitionMs}ms`;
        this._html.range.style.transition = `${rangeProp} ${transitionMs}ms`;

        this._html.firstHandle.addEventListener("mousedown", () => {
            this._html.firstHandle.style.transition = "0ms";
            this._html.range.style.transition = "0ms";
        });

        document.addEventListener("mouseup", () => {
            this._html.firstHandle.style.transition = `${handleProp} ${transitionMs}ms`;
            this._html.range.style.transition = `${rangeProp} ${transitionMs}ms`;
        });
    }

    private _setHandlePositionInPixels() {
        if ( !this._data.rendered ) return;

        const range = this._options.max - this._options.min;
        const valueInPercents = (this._options.value - this._options.min) / range;

        this._handlePositionInPixels = this._options.orientation === "horizontal" ?
            this._getCoords().wrapper.width * valueInPercents :
            this._getCoords().wrapper.height * valueInPercents;
    }

    refreshValue(currentHandleCoordinate: number) {
        const range = this._options.max - this._options.min;
        const orientation = this._options.orientation;
        const wrapperCoords = this._getCoords().wrapper;

        const isHorizontal = orientation === "horizontal";

        const wrapperStart =  isHorizontal ? wrapperCoords.left : wrapperCoords.top;
        const wrapperEnd =  isHorizontal ? wrapperCoords.right : wrapperCoords.bottom;

        if ( currentHandleCoordinate > wrapperEnd ) {
            this._valueChangedSubject
                .notifyObservers(isHorizontal ? this._options.max : this._options.min);

            return;
        }

        if ( currentHandleCoordinate < wrapperStart ) {
            this._valueChangedSubject
                .notifyObservers(isHorizontal ? this._options.min : this._options.max);

            return;
        }

        const currentHandlePosition = orientation === "horizontal" ?
            currentHandleCoordinate - wrapperCoords.left :
            wrapperCoords.height - (currentHandleCoordinate - wrapperCoords.top);

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
            currentHandlePosition / this._getCoords().wrapper.width :
            currentHandlePosition / this._getCoords().wrapper.height;

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

        this._valueChangedSubject.notifyObservers(value);
    }

    private _setSliderElements() {
        const secondHandle = this._options.range === true ? document.createElement('div') : null;

        this._html = {
            wrapper: document.createElement('div'),
            range: document.createElement('div'),
            firstHandle: document.createElement('div'),
            secondHandle: secondHandle
        };

        this._html.wrapper.append(this._html.range);
        this._html.wrapper.append(this._html.firstHandle);

        if ( this._options.range === true ) this._html.wrapper.append(this._html.secondHandle);
    }

    private _countHandleShift(mouseDownEvent: MouseEvent) {
        return countShift(mouseDownEvent, this._html.firstHandle);
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

    private _getCoords() {
        return {
            wrapper: getCoords(this._html.wrapper),
            range: getCoords(this._html.range),
            handle: getCoords(this._html.firstHandle)
        }
    }

    renderPlugin(plugin: string, pluginView: SliderLabelsView | SliderTooltipView) {
        if ( plugin === "labels" ) {
            pluginView.render(this._html.wrapper);
        }

        if ( plugin === "tooltip" ) {
            if ( !this._html.firstHandle.contains((pluginView as SliderTooltipView).html) ) {
                pluginView.render(this._html.firstHandle);
            }
        }
    }

    destroyPlugin(plugin: "labels" | "tooltip", pluginView: SliderLabelsView | SliderTooltipView) {
        if ( plugin === "labels" || plugin === "tooltip" ) {
            pluginView.destroy();
        }
    }
}





