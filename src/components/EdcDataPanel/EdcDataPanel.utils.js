export const groupBy = (arr, groupByProperty) => {
  const keys = Array.from(new Set(arr.map((element) => element[groupByProperty])));
  let obj = {};
  for (let key of keys) {
    obj[key] = arr.filter((element) => element[groupByProperty] === key);
  }
  return obj;
};
