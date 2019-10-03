$('.slider').slider({range: 'min', value: 90, step: 10, min: 80, tooltip: true});

$('.slider-2').slider({range: 'max', tooltip: () => "$$$"});

$('.slider-3').slider({
    range: 'min',
    orientation: 'vertical',
    tooltip: (value) => value + '%'
});

$('.slider-4').slider({
    orientation: 'vertical',
    range: 'max',
    tooltip: (value) => value + "$"
});
