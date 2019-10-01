export default class SliderTooltipView {
    private _text: string | number | null = null;
    private _html: HTMLDivElement;
    private _orientation: "horizontal" | "vertical" | null = null;
    private _root: HTMLElement | null = null;

    constructor() {
        this._create();
    }

    get html() {
        return this._html;
    }

    get text() {
        return this._text;
    }

    init(text: string | number, orientation: "horizontal" | "vertical" ) {
        this.setText(text);
        this.setOrientation(orientation);
    }

    render(root: HTMLElement) {
        this._root = root;

        this._root.append(this._html);
    }

    setText(text: string | number) {
        this._text = text;

        this._html.innerHTML = String(text);
    }

    setOrientation(orientation: "horizontal" | "vertical") {
        this._orientation = orientation;

        this._setOrientationClass();
    }

    cleanTextField() {
        this._text = null;

        this._html.innerHTML = "";
    }

    remove() {
        this._root.removeChild(this._html);
    }

    destroy() {
        this.remove();
        this.cleanTextField();
        this._orientation = null;
        this._root = null;

        this._html.className = "jquery-slider-tooltip";
    }

    private _create() {
        const tooltip = document.createElement("div");
        tooltip.setAttribute("class", "jquery-slider-tooltip");

        this._html = tooltip;
    }

    private _setOrientationClass() {
        this._html.setAttribute("class", "jquery-slider-tooltip");

        if ( this._orientation === "horizontal" ) {
            this._html.classList.add("jquery-slider-tooltip-horizontal");
        } else if ( this._orientation === "vertical" ) {
            this._html.classList.add("jquery-slider-tooltip-vertical");
        }
    }
}