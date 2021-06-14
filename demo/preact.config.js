const path = require('path');

export default (config, env, helpers) => {
    config.resolve.alias['@components'] = path.resolve(env.src, "components");
    config.resolve.alias['@routes'] = path.resolve(env.src, "routes");
};