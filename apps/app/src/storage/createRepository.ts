// Metro picks createRepository.native.ts on iOS/Android and createRepository.web.ts on web.
// This file only exists so TypeScript (which does not know platform extensions) has a module to resolve.
export { createRepository } from './createRepository.native';
