function requireAll(r) {
  return r.keys().map(r);
}

requireAll(require.context('../../components', true, /\.(scss|ts)$/));
