import SliderLabelsView from '../SliderLabelsView/SliderLabelsView';
import SliderTooltipView from '../SliderTooltipView/SliderTooltipView';

class SliderPluginsFactory {
  createView(plugin: string): SliderLabelsView | SliderTooltipView {
    if (plugin === 'labels') {
      return new SliderLabelsView();
    }

    if (plugin === 'tooltip') {
      return new SliderTooltipView();
    }

    throw new Error('plugin doesn\'t exist');
  }
}

export default SliderPluginsFactory;
