import '../plugin/main.scss';
import './assets/favicons/favicons';
import './styles/base.scss';

const requireAll = (r: __WebpackModuleApi.RequireContext): __WebpackModuleApi.RequireFunction[] => (
  r.keys().map(r) as __WebpackModuleApi.RequireFunction[]
);

requireAll(require.context('./components', true, /\.(scss|ts)$/));
