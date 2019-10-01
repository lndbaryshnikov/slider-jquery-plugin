export default class SliderTooltipView {
    private _text: string | number | null = null;
    private _html: HTMLDivElement | null = null;
    private _orientation: "horizontal" | "vertical" | null = null;
    private _root: HTMLElement | null = null;

    get html() {
        return this._html;
    }

    get text() {
        return this._text;
    }

    init( text: string | number, orientation: "horizontal" | "vertical" ) {
        this._text = text;
        this._orientation = orientation;
    }

    render(root: HTMLElement) {
        this._root = root;
    }

    setText(text: string | number) {
        this._text = text;
    }

    cleanTextField() {
        this._text = null;
    }

    remove() {
        this._root.removeChild(this._html);
    }

    destroy() {
        this.remove();
        this.cleanTextField();
        this._html = null;
        this._orientation = null;
        this._root = null;
    }
}