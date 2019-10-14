import getCoords from "../functions/common/getCoords";
import Observer from "./Observer";

export interface LabelOptions {
    labels: boolean,
    pips: boolean,
    orientation: "horizontal" | "vertical",
    min: number,
    max: number,
    step: number,
    valueFunc?: (value?: number) => string | number
}

export default class SliderLabelsView {
    private _labels: HTMLDivElement[];
    private _options: LabelOptions;
    private _root: HTMLElement | null = null;
    private _html: HTMLDivElement | null = null;

    private _labelClickedSubject = new Observer();

    get state() {
        return {
            isRendered: !!(this._root && this._html),
            isSet: !!(this._options && this._labels)
        };
    }

    get labels() {
        return this._labels;
    }

    setOptions(options: LabelOptions) {
        if ( !options.labels && !options.pips ) return;

        let rootSnapshot: HTMLElement;

        if ( this.state.isRendered ) {
            rootSnapshot = this._root;
            this.destroy();
        }

        this._options = options;

        this._createLabels();
        this._setClasses();
        if ( this._options.labels ) this._setText();
        this._setClickHandler();

        if ( rootSnapshot ) {
            this.render(rootSnapshot);
        }
    }

    render(root: HTMLElement) {
        this._root = root;

        const orientation = this._options.orientation;
        const scaleProperty = orientation === "horizontal" ? "width" : "height";
        const labelProperty = orientation === "horizontal" ? "left" : "bottom";

        const sliderPropertyValue = getCoords(root)[scaleProperty];

        const scale = document.createElement("div");
        scale.setAttribute("class",
            `jquery-slider-labels-scale jquery-slider-labels-scale-${orientation}`);
        scale.style.position = "absolute";
        scale.style[scaleProperty] = sliderPropertyValue + "px";

        const interval = this._countInterval(sliderPropertyValue);

        let currentSize = 0;

        this._root.append(scale);

        for ( let label of this._labels ) {
            scale.append(label);

            const labelPropertyValue = getCoords(label)[scaleProperty];
            label.style[labelProperty] = currentSize - labelPropertyValue / 2 + "px";

            if ( this._options.pips ) {
                const pip = label.children[0] as HTMLElement;
                const pipPropertyValue = getCoords(pip)[scaleProperty];

                pip.style[labelProperty] = labelPropertyValue / 2 - pipPropertyValue / 2 + "px";
            }

            currentSize += interval;
        }

        this._html = scale;
    }

    remove() {
        this._root.removeChild(this._html);

        this._root = null;
        this._html = null;
    }

    destroy() {
        if ( this.state.isRendered ) this.remove();
        this._labels = null;
        this._options = null;
    }

    whenUserClicksOnLabel(callback: (middleCoordinate: number) => void) {
        this._labelClickedSubject.addObserver((_middleCoordinate: number) => {
            callback(_middleCoordinate);
        });
    }

    private _createLabels() {
        const labels: HTMLDivElement[] = [];

        for ( let value = this._options.min; value <= this._options.max; value += this._options.step ) {
            labels.push(this._createLabel());
        }

        this._labels = labels;
    }

    private _createLabel() {
        const label = document.createElement("div");
        const pip = document.createElement("div");

        label.setAttribute("class", "jquery-slider-label");
        pip.setAttribute("class", "jquery-slider-pip");

        label.style.position = "absolute";
        pip.style.position = "absolute";

        if ( this._options.pips ) label.append(pip);

        return label;
    }

    private _setClasses() {
        const orientation = this._options.orientation;

        if ( !(this._options.labels) && !(this._options.pips) ) return;

        for (let label of this._labels) {
            label.setAttribute("class", "jquery-slider-label");
            label.classList.add(`jquery-slider-label-${orientation}`);

            if ( this._options.pips ) {
                const pip = label.children[0];

                pip.setAttribute("class", "jquery-slider-pip");
                pip.classList.add(`jquery-slider-pip-${orientation}`);
            }
        }
    }

    private _setText() {
        if ( !this._options.labels ) return;

        const func = this._options.valueFunc;

        for ( let i = 0, value = this._options.min; i < this._labels.length; i++, value +=this._options.step ) {
            const label = this._labels[i];

            if ( func ) {
                label.innerHTML += String(func(value));
            } else label.innerHTML += String(value);
        }
    }

    private _countInterval(scaleSize: number) {
        const range = this._options.max - this._options.min;
        const amount = range / this._options.step;

        return scaleSize / amount;
    }

    private _setClickHandler() {
        for (let label of this._labels) {
            label.addEventListener("click", () => {
                const labelCoords = getCoords(label);

                const middle = this._options.orientation === "horizontal" ?
                    labelCoords.left + labelCoords.width / 2 :
                    labelCoords.top + labelCoords.height / 2;

                this._labelClickedSubject.notifyObservers(middle);
            });
        }
    }
}