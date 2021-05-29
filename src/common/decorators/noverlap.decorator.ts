const ACTIVELY_RUNNING = Symbol('ACTIVELY_RUNNING');

export function NoOverlap(): MethodDecorator {
  return function (target, key?, descriptor?: TypedPropertyDescriptor<any>) {
    const origFn = descriptor.value;
    if (!Reflect.hasMetadata(ACTIVELY_RUNNING, target, key)) {
      Reflect.defineMetadata(ACTIVELY_RUNNING, false, target, key);
    }
    descriptor.value = async function (...args) {
      const isRunningNow = Reflect.getMetadata(ACTIVELY_RUNNING, target, key);
      if (isRunningNow) {
        return;
      }
      Reflect.defineMetadata(ACTIVELY_RUNNING, true, target, key);
      let err;
      let result;
      try {
        result = await origFn.bind(this)(...args);
      } catch (e) {
        err = e;
      }
      Reflect.defineMetadata(ACTIVELY_RUNNING, false, target, key);
      if (err) {
        throw err;
      }
      return result;
    };
  };
}
