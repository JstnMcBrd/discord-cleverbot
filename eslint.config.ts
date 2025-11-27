/**
 * TODO Remove jiti dependency as soon as strip-types is no longer experimental in Node LTS
 * @see https://eslint.org/docs/latest/use/configure/configuration-files#native-typescript-support
 */

import eslintConfig from '@jstnmcbrd/eslint-config';

export default eslintConfig({ typescript: true });
