import LabelsView from '../View/LabelsView';
import TooltipView from '../View/TooltipView';

class PluginsFactory {
  createView(plugin: string): LabelsView | TooltipView {
    if (plugin === 'labels') {
      return new LabelsView();
    }

    if (plugin === 'tooltip') {
      return new TooltipView();
    }

    throw new Error('plugin doesn\'t exist');
  }
}

export default PluginsFactory;
