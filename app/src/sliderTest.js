$('.slider').slider({
    range: 'min',
    value: 60,
    step: 10,
    min: 30,
    max: 120,
    tooltip: true,
    animate: "fast"
});

$('.slider-2').slider({
    range: 'max',
    tooltip: (value) => `(${value})`,
    animate: "slow"
});

$('.slider-3').slider({
    range: 'min',
    orientation: 'vertical',
    tooltip: (value) => value + '%',
    animate: false
});

$('.slider-4').slider({
    orientation: 'vertical',
    range: 'max',
    tooltip: (value) => value + "$",
    animate: 3000
});
