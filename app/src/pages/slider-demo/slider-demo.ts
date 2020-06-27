import '../../plugin/main.scss';
import '../../assets/favicons/favicons';
import './slider-demo.scss';

function requireAll(r: __WebpackModuleApi.RequireContext): __WebpackModuleApi.RequireFunction[] {
  return r.keys().map(r) as __WebpackModuleApi.RequireFunction[];
}

requireAll(require.context('../../components', true, /\.(scss|ts)$/));
