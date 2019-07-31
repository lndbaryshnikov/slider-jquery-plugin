import getCoords from '../../functions/common/getCoords'


export default function Presenter(_view) {

    this.view = _view;

    const init = () => {

        const view = _view;
        view.movingHandler = (handle, horizontalArea, event) => {
            const handleCoords = getCoords(handle);
            const areaCoords = getCoords(horizontalArea);

            const shift = (event, elemCoords) => {

                return {
                    x: event.pageX - elemCoords.left,
                    y: event.pageY - elemCoords.top
                };
            };

            const shiftX = shift(event, handleCoords).x;

            $(document).mousemove((event) => {
                let newLeft = event.pageX - shiftX - areaCoords.left;

                if (newLeft < 0) newLeft = 0;

                const rightEdge = areaCoords.width - handleCoords.width;

                if (newLeft > rightEdge) newLeft = rightEdge;

                $(handle).css('left', newLeft + 'px');

            });

            $(document).mouseup(() => {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');

            });

            return false;
        };
    };

    init();
}

Object.defineProperties(Presenter.prototype, {

    model : {
        set : function(model) {
           this.view.modelOptions = model.options;
        },
        enumerable : false
    }

});
