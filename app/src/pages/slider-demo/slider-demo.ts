import '../../styles/base.scss';
import '../../plugin/main.scss';
import '../../assets/favicons/favicons';

function requireAll(r: __WebpackModuleApi.RequireContext): __WebpackModuleApi.RequireFunction[] {
  return r.keys().map(r) as __WebpackModuleApi.RequireFunction[];
}

requireAll(require.context('../../components', true, /\.(scss|ts)$/));
