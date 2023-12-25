try {
  // const stallionConfig = require('../../example/stallion.config.js'); // testing import
  const stallionConfig = require('../../../../stallion.config.js'); // prod import
  console.log(stallionConfig?.stallionEnabled);
} catch (_) {
  console.log(false);
}
