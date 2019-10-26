$('.slider').slider({
    range: false,
    value: 60,
    step: 10,
    min: 30,
    max: 90,
    tooltip: true,
    animate: "fast",
    pips: true,
    labels: (value) => `${value}$`
});

$('.slider').slider("options", {
    range: true,
    value: [30, 80]
});

$('.slider-2').slider({
    range: true,
    value: [10,70],
    tooltip: (value) => `${value}%`,
    animate: "slow",
    step: 5,
    labels: false,
    pips: true
});

$('.slider-3').slider({
    range: 'min',
    orientation: 'vertical',
    value: [20, 60],
    range: true,
    tooltip: (value) => value + '%',
    animate: false,
    labels: true,
    pips: true,
    step: 20
});

$('.slider-4').slider({
    orientation: 'vertical',
    range: 'min',
    tooltip: (value) => value + "$",
    animate: 300,
    labels: true,
    pips: false,
    step: 25
});

$('.slider-5').slider({
    animate: false,
    range: true,
    value: [0, 100]
});

$('.slider-5').slider("options", {
    step: 20
});
