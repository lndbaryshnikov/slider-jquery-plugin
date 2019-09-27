$('.slider').slider({range: 'min', value: 90, step: 10, min: 80});

$('.slider-2').slider({range: 'max'});

$('.slider-3').slider({
    // range: 'min',
    orientation: 'vertical',

});

$('.slider-3').slider('options', {
    range: 'min',
});

$('.slider-4').slider({
    orientation: 'vertical',
    range: 'max'
});
