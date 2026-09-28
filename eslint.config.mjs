import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [...nextVitals, ...nextTypescript, { ignores: ['public/sw.js'] }];

export default config;
