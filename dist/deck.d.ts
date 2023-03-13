declare function Deck(jokers: any): any;
declare namespace Deck {
    export { animationFrames };
    export { ease };
    export namespace modules {
        export { bysuit };
        export { fan };
        export { intro };
        export { poker };
        export { shuffle };
        export { sort };
        export { flip };
    }
    export { Card };
    export { prefix };
    export { translate };
}
export default Deck;
import animationFrames from "./animationFrames";
import ease from "./ease";
import bysuit from "./modules/bysuit";
import fan from "./modules/fan";
import intro from "./modules/intro";
import poker from "./modules/poker";
import shuffle from "./modules/shuffle";
import sort from "./modules/sort";
import flip from "./modules/flip";
import Card from "./card";
import prefix from "./prefix";
import translate from "./translate";
//# sourceMappingURL=deck.d.ts.map