import SliderLabelsView from "./SliderLabelsView";
import SliderTooltipView from "./SliderTooltipView";

export default class SliderPluginsFactory {
    createView(plugin: string) {
        if ( plugin === "labels" ) {
            return new SliderLabelsView();
        }

        if ( plugin === "tooltip" ) {
            return new SliderTooltipView();
        }
    }
}