import '../../styles/base.scss';

function requireAll(r) {
  return r.keys().map(r);
}

requireAll(require.context('../../styles/demo-page-components', true, /\.scss$/));
