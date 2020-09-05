import SliderPanel from './SliderPanel';

((): void => {
  const $panels = $('.js-slider-panel');

  $panels.each((index, currentPanel) => {
    new SliderPanel(currentPanel as HTMLDivElement);
  });
})();
