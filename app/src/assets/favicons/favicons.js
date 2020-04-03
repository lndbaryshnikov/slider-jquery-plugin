const faviconsContext = require.context(
  './files',
  true,
  /\.(svg|png|ico|xml|json|webmanifest)$/,
);

faviconsContext.keys().forEach(faviconsContext);
