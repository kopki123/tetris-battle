/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
function useDebounce<Params extends any[]> (
  fn: (...args: Params) => any,
  delay = 0.5,
): (...args: Params) => void {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay * 1000);
  };
}

export default useDebounce;
