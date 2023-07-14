import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare global {
  // @see https://github.com/testing-library/jest-dom/issues/427#issuecomment-1110985202
  namespace jest {
    type Matchers<R> = TestingLibraryMatchers<
      typeof expect.stringContaining,
      R
    >;
  }
}
