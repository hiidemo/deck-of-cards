export default function (target) {
  var cards = target.cards;

  target.findOne = findOne;
  target.filter = filter;

  return cards;

  // filter by card id
  function findOne(o) {
    return cards.find(({ i }) => i === Number(o));
  }

  // filter by array of card ids. Eg: filter([20, 21])
  function filter(a) {
    return cards.filter(({ i }) => {
      return a.includes(i);
    });
  }
}
