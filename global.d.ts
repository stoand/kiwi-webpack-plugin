export const a: any;

declare global {
  export const describe: (moduleName: string, moduleRun: () => void) => void
  export const it: (testName: string, testRun: () => void | Promise<any>) => void
}
