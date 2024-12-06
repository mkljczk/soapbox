// import MockAdapter from 'axios-mock-adapter';
import { vi } from 'vitest';

const api = await vi.importActual('../index') as Record<string, Function>;
let mocks: Array<Function> = [];

const __stub = (func: (mock: any) => void) => mocks.push(func);
const __clear = (): Function[] => mocks = [];

// const setupMock = (axios: AxiosInstance) => {
//   const mock = new MockAdapter(axios, { onNoMatch: 'throwException' });
//   mocks.map(func => func(mock));
// };

const staticClient = api.staticClient;

const baseClient = (...params: any[]) => {
  const axios = api.baseClient(...params);
  // setupMock(axios);
  return axios;
};

export default (...params: any[]) => {
  const axios = api.default(...params);
  // setupMock(axios);
  return axios;
};

export { __stub, __clear, staticClient, baseClient };
