// FIXME Need the `unstable_native_nodejs_ts_config` flag to use `eslint.config.ts`
// https://github.com/eslint/eslint/issues/19985

import eslintConfig from '@jstnmcbrd/eslint-config';

export default eslintConfig({ typescript: true });
