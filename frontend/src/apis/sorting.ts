export function oldToNew<
  // Given a type with any fields...
  T,
  // We let `K` be all possible keys of that field.
  K extends keyof T,
>(
  // The argument we pass the function has to be one of those keys
  field: K &
    //  but it also has to intersect with this type:
    {
      //  this goes through all properties of T (again!)
      [P in keyof T]: // checks if a given property extends Date,..if not make it 'never' and then index again.
      T[P] extends Date ? P : never;
    }[keyof T],
) {
  // as such, only properties with `Date` type are left for `field`
  return (left: T, right: T): number => {
    return (left[field] as Date).getTime() - (right[field] as Date).getTime();
  };
}

export function newToOld<T, K extends keyof T>(
  field: K & { [P in keyof T]: T[P] extends Date ? P : never }[keyof T],
) {
  return (left: T, right: T): number => {
    return (right[field] as Date).getTime() - (left[field] as Date).getTime();
  };
}
