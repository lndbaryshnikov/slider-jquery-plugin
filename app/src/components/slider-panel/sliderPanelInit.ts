import SliderPanel from './SliderPanel';

(() => {
  const $panels = $('.js-slider-panel');

  $panels.each((index, currentPanel) => {
    new SliderPanel(currentPanel as HTMLDivElement);
  });
})();
