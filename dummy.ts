import _ from 'lodash';

interface ExampleObject {
  [key: string]: any;
}

const changeNestedProperty = <T extends ExampleObject>(
  obj: T,
  path: string | string[],
  value: any
): T => {
  // Use lodash's `set` method to modify the deep property
  _.set(obj, path, value);
  return obj;
};

// Example usage
const obj = {
  level1: {
    level2: {
      level3: {
        target: 'old value',
      },
    },
  },
};

const updatedObj = changeNestedProperty(obj, ['level1', 'level2', 'level3', 'target'], 'new value');
console.log(updatedObj);

// Output:
// {
//   level1: {
//     level2: {
//       level3: {
//         target: 'new value',
//       },
//     },
//   },
// }