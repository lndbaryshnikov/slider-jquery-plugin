import {HorizontalClasses, Options, VerticalClasses} from "./SliderModel";
import {countShift} from "../../functions/common/countShift";
import getCoords from "../../functions/common/getCoords";
import Observer from "../Observer";

interface Html {
    wrapper: HTMLDivElement | undefined;
    range: HTMLDivElement | undefined;
    handle: HTMLDivElement | undefined;
}
export default class SliderView {
    private _html: Html | undefined = undefined;

    private _root: HTMLElement | undefined;
    private _options: Options | undefined;
    private _handlePositionInPixels: number | undefined;
    private _data = {
        rendered: false
    };

    private _handlePositionChangedSubject = new Observer();

    constructor() {
        this._setSliderElements();
        this._setHandleMovingHandler();
    }

    get html() {
        return this._html;
    }

    get handlePositionInPercents() {
        return this._handlePositionInPixels / this._getCoords().wrapper.width * 100;
    }

    render(root: HTMLElement): void {
        this._root = root;
        this._root.append(this._html.wrapper);

        this._data.rendered = true;

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

        this._handlePositionInPixels = 0;

        this._setSliderClasses();

        if ( this._data.rendered ) {
            this._renderOptions();
        }
    }

    private _renderOptions() {
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

                            this._handlePositionInPixels = newLeft + this._getCoords().handle.width / 2;
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

                            this._handlePositionInPixels = this._getCoords().wrapper.height
                                - newTop - this._getCoords().handle.height / 2;
                        }

                        this._renderHandlePosition();

                        this._renderRange();

                        this._handlePositionChangedSubject.notifyObservers();
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

    whenHandlePositionChanged(callback: () => void): void {
        this._handlePositionChangedSubject.addObserver(() => {
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





