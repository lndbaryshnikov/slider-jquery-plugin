import SliderModel from "../../src/MVP modules/Slider/SliderModel";

test('Model\'s setOptions deletes whitespaces from classes', () => {
    const model = new SliderModel();

    model.setOptions({
        classes: {
            'jquery-slider': '  my-class       another-class',
            'jquery-slider-handle': '  my-handle-class       another-handle-class'
        }
    });

    expect(model.getOptions().classes).toEqual({
        'jquery-slider jquery-slider-horizontal': 'my-class another-class',
        'jquery-slider-range': '',
        'jquery-slider-handle': 'my-handle-class another-handle-class'
    })
});