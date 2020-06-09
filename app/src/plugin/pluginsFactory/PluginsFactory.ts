import LabelsView from '../View/LabelsView';
import TooltipView from '../View/TooltipView';

const pluginsFactory = {
  createTooltipView: (): TooltipView => new TooltipView(),
  createLabelsView: (): LabelsView => new LabelsView(),
};

export default pluginsFactory;
