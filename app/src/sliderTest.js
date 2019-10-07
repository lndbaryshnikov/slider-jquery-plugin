$('.slider').slider({
    range: 'min',
    value: 60,
    step: 10,
    min: 30,
    max: 90,
    tooltip: true,
    animate: "fast",
    pips: true,
    labels: (value) => `${value}$`
});

$('.slider-2').slider({
    range: 'max',
    tooltip: (value) => `${value}%`,
    animate: "slow",
    step: 5,
    labels: false,
    pips: true
});

$('.slider-3').slider({
    range: 'min',
    orientation: 'vertical',
    tooltip: (value) => value + '%',
    animate: false,
    labels: true,
    pips: true,
    step: 20
});

$('.slider-4').slider({
    orientation: 'vertical',
    range: 'max',
    tooltip: (value) => value + "$",
    animate: 300,
    labels: true,
    pips: false,
    step: 25
});
