import {Options} from "./SliderModel";
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

    private _handlePositionChangedSubject = new Observer();
    private _sliderAlreadyExistsSubject = new Observer();

    get html() {
        return this._html;
    }

    get handlePositionInPercents() {
        return this._handlePositionInPixels / this._getCoords().wrapper.width;
    }

    render(root: HTMLElement): void {
        this._root = root;

        this._root.append(this._html.wrapper);
    }

    setUp() {
        this._setSliderElements();
        this._setHandleMovingHandler();
    }

    whenSliderAlreadyExists(callback: () => void): void {
        this._sliderAlreadyExistsSubject.addObserver(() => {
            callback();
        });
    }

    destroy(): void {
        this._html = undefined;
        this._root = undefined;
        this._options = undefined;
        this._handlePositionInPixels = undefined;
    }

    cleanDom() {
        this._html.wrapper.remove();
    }

    setOptions(options: Options): void {
        this._options = options;

        this._setOptionsToSlider();
    }

    _setHandleMovingHandler() {
            //Drag'n'Drop code
            this._html.handle.onmousedown = (mouseDownEvent: MouseEvent) => {
                const handleShift = this._countHandleShift(mouseDownEvent);

                document.onmousemove = (mouseMoveEvent: MouseEvent) => {
                    const shiftX = handleShift.x;

                    let newLeft = mouseMoveEvent.pageX - shiftX - this._getCoords().wrapper.left;

                    if (newLeft < 0) newLeft = 0;

                    const rightEdge = this._getCoords().wrapper.width - this._getCoords().handle.width;

                    if (newLeft > rightEdge) newLeft = rightEdge;

                    this._html.handle.style.left = newLeft + 'px';

                    this._handlePositionInPixels = newLeft + this._getCoords().handle.width / 2;

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

    private _setOptionsToSlider() {
        this._setSliderClasses();
    }

    private _setSliderClasses() {
        const defaultClasses = Object.keys(this._options.classes);
        const wrapper = defaultClasses[0];
        const range = defaultClasses[1];
        const handle = defaultClasses[2];

        this._html.wrapper.setAttribute('class', wrapper);
        this._html.range.setAttribute('class', range);
        this._html.handle.setAttribute('class', handle);


        $(this._html.wrapper).addClass(this._options.classes[wrapper as "jquery-slider"]);
        $(this._html.range).addClass(this._options.classes[range as "jquery-slider-range"]);
        $(this._html.handle).addClass(this._options.classes[handle as "jquery-slider-handle"]);
    }

    private _setSliderElements() {
        this._html = {
            wrapper: document.createElement('div'),
            range: document.createElement('div'),
            handle: document.createElement('div')
        };

        this._html.wrapper.append(this._html.range);
        this._html.range.append(this._html.handle);
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





