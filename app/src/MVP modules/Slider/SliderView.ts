import * as $ from 'jquery';

import {OptionsDefault} from './SliderModel'
import {Options} from "./SliderModel";
import {countShift} from "../../functions/common/countShift";
import getCoords from "../../functions/common/getCoords";
import Observer from "../Observer";

export default class SliderView implements SliderView {
    private _options: Options;
    private _defaultClasses: OptionsDefault["classes"];
    private _handlePositionChangedSubject = new Observer();
    private _handlePositionInPixels: number;

    private _html = {
        wrapper: HTMLDivElement,
        range: HTMLDivElement,
        handle: HTMLDivElement
    };

    constructor() {
        this._setSliderElements();
    }

    render(root: HTMLElement): void {
        root.append(this._html.wrapper);

        this._setHandleMovingHandler();
    }

    get html() {
        return this._html;
    }

    setOptions(options: Options, defaultClasses: OptionsDefault["classes"]): void {
        this._options = options;
        this._defaultClasses = defaultClasses;

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

            this._html.handle.ondragstart = () =>{
                return false;
            };
    }



    whenHandlePositionChanged(callback: () => void): void {
        this._handlePositionChangedSubject.addObserver(() => {
            callback();
        })
    }

    get handlePositionInPercents() {
        return this._handlePositionInPixels / this._getCoords().wrapper.width;
    }

    private _setOptionsToSlider() {
        this._setSliderClasses();
    }

    private _setSliderClasses() {
        const defaultClasses = Object.keys(this._defaultClasses);
        const wrapper = defaultClasses[0];
        const range = defaultClasses[1];
        const handle = defaultClasses[2];

        this._html.wrapper.setAttribute('class', `${wrapper}`);
        this._html.range.setAttribute('class', `${range}`);
        this._html.handle.setAttribute('class', `${handle}`);

        this._html.wrapper.classList.add(this._options.classes[wrapper as "jquery-slider"].trim());
        this._html.range.classList.add(this._options.classes[range as "jquery-slider-range"].trim());
        this._html.range.classList.add(this._options.classes[handle as "jquery-slider-handle"].trim());
    }

    private _setSliderElements() {
        const getDiv = (): HTMLDivElement => {
            return document.createElement('div');
        };

        this._html.wrapper = getDiv();
        this._html.range = getDiv();
        this._html.handle = getDiv();

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





