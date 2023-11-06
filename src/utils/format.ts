/*
export default function format(str) {
  for (
    let _len = arguments.length,
      args = new Array(_len > 1 ? _len - 1 : 0),
      _key = 1;
    _key < _len;
    _key++
  ) {
    args[_key - 1] = arguments[_key];
  }

  return [].concat(args).reduce(function (p, c) {
    return p.replace(/%s/, c);
  }, str);
}
*/
export default function format(str: string, ...args: Array<string>) {
  return [...args].reduce((p, c) => p.replace(/%s/, c), str)
}
