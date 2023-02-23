var Deck = function () {
  'use strict';

  function createElement(type) {
    return document.createElement(type);
  }

  var ticking;
  var animations = [];

  function animationFrames(delay, duration) {
    var now = Date.now();

    // calculate animation start/end times
    var start = now + delay;
    var end = start + duration;

    var animation = {
      start: start,
      end: end
    };

    // add animation
    animations.push(animation);

    if (!ticking) {
      // start ticking
      ticking = true;
      requestAnimationFrame(tick);
    }
    var self = {
      start: function (cb) {
        // add start callback (just one)
        animation.startcb = cb;
        return self;
      },
      progress: function (cb) {
        // add progress callback (just one)
        animation.progresscb = cb;
        return self;
      },
      end: function (cb) {
        // add end callback (just one)
        animation.endcb = cb;
        return self;
      }
    };
    return self;
  }

  function tick() {
    var now = Date.now();

    if (!animations.length) {
      // stop ticking
      ticking = false;
      return;
    }

    for (var i = 0, animation; i < animations.length; i++) {
      animation = animations[i];
      if (now < animation.start) {
        // animation not yet started..
        continue;
      }
      if (!animation.started) {
        // animation starts
        animation.started = true;
        animation.startcb && animation.startcb();
      }
      // animation progress
      var t = (now - animation.start) / (animation.end - animation.start);
      animation.progresscb && animation.progresscb(t < 1 ? t : 1);
      if (now > animation.end) {
        // animation ended
        animation.endcb && animation.endcb();
        animations.splice(i--, 1);
        continue;
      }
    }
    requestAnimationFrame(tick);
  }

  // fallback
  window.requestAnimationFrame || (window.requestAnimationFrame = function (cb) {
    setTimeout(cb, 0);
  });

  var ease = {
    linear: function (t) {
      return t;
    },
    quadIn: function (t) {
      return t * t;
    },
    quadOut: function (t) {
      return t * (2 - t);
    },
    quadInOut: function (t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    cubicIn: function (t) {
      return t * t * t;
    },
    cubicOut: function (t) {
      return --t * t * t + 1;
    },
    cubicInOut: function (t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    quartIn: function (t) {
      return t * t * t * t;
    },
    quartOut: function (t) {
      return 1 - --t * t * t * t;
    },
    quartInOut: function (t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    },
    quintIn: function (t) {
      return t * t * t * t * t;
    },
    quintOut: function (t) {
      return 1 + --t * t * t * t * t;
    },
    quintInOut: function (t) {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    }
  };

  function getFontSize() {
    return window.getComputedStyle(document.body).getPropertyValue('font-size').slice(0, -2);
  }

  var fontSize$3;

  var bysuit = {
    deck: function (deck) {
      deck.bysuit = deck.queued(bysuit);

      function bysuit(next) {
        var cards = deck.cards;

        fontSize$3 = getFontSize();

        cards.forEach(function (card) {
          card.bysuit(function (i) {
            if (i === cards.length - 1) {
              next();
            }
          });
        });
      }
    },
    card: function (card) {
      var rank = card.rank;
      var suit = card.suit;

      card.bysuit = function (cb) {
        var i = card.i;
        var delay = i * 10;

        card.animateTo({
          delay: delay,
          duration: 400,

          x: -Math.round((6.75 - rank) * 8 * fontSize$3 / 16),
          y: -Math.round((1.5 - suit) * 92 * fontSize$3 / 16),
          rot: 0,

          onComplete: function () {
            cb(i);
          }
        });
      };
    }
  };

  var fontSize$2;

  var fan = {
    deck: function (deck) {
      deck.fan = deck.queued(fan);

      function fan(next) {
        var cards = deck.cards;
        var len = cards.length;

        fontSize$2 = getFontSize();

        cards.forEach(function (card, i) {
          card.fan(i, len, function (i) {
            if (i === cards.length - 1) {
              next();
            }
          });
        });
      }
    },
    card: function (card) {
      var $el = card.$el;

      card.fan = function (i, len, cb) {
        var z = i / 4;
        var delay = i * 10;
        var rot = i / (len - 1) * 260 - 130;

        card.animateTo({
          delay: delay,
          duration: 300,

          x: -z,
          y: -z,
          rot: 0
        });
        card.animateTo({
          delay: 300 + delay,
          duration: 300,

          x: Math.cos(deg2rad(rot - 90)) * 55 * fontSize$2 / 16,
          y: Math.sin(deg2rad(rot - 90)) * 55 * fontSize$2 / 16,
          rot: rot,

          onStart: function () {
            $el.style.zIndex = i;
          },

          onComplete: function () {
            cb(i);
          }
        });
      };
    }
  };

  function deg2rad(degrees) {
    return degrees * Math.PI / 180;
  }

  var style = document.createElement('p').style;
  var memoized = {};

  function prefix(param) {
    if (typeof memoized[param] !== 'undefined') {
      return memoized[param];
    }

    if (typeof style[param] !== 'undefined') {
      memoized[param] = param;
      return param;
    }

    var camelCase = param[0].toUpperCase() + param.slice(1);
    var prefixes = ['webkit', 'moz', 'Moz', 'ms', 'o'];
    var test;

    for (var i = 0, len = prefixes.length; i < len; i++) {
      test = prefixes[i] + camelCase;
      if (typeof style[test] !== 'undefined') {
        memoized[param] = test;
        return test;
      }
    }
  }

  var has3d;

  function translate(a, b, c) {
    typeof has3d !== 'undefined' || (has3d = check3d());

    c = c || 0;

    if (has3d) {
      return 'translate3d(' + a + ', ' + b + ', ' + c + ')';
    } else {
      return 'translate(' + a + ', ' + b + ')';
    }
  }

  function check3d() {
    // I admit, this line is stealed from the great Velocity.js!
    // http://julian.com/research/velocity/
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      return false;
    }

    var transform = prefix('transform');
    var $p = document.createElement('p');

    document.body.appendChild($p);
    $p.style[transform] = 'translate3d(1px,1px,1px)';

    has3d = $p.style[transform];
    has3d = has3d != null && has3d.length && has3d !== 'none';

    document.body.removeChild($p);

    return has3d;
  }

  var intro = {
    deck: function (deck) {
      deck.intro = deck.queued(intro);

      function intro(next) {
        var cards = deck.cards;

        cards.forEach(function (card, i) {
          card.setSide('front');
          card.intro(i, function (i) {
            animationFrames(250, 0).start(function () {
              card.setSide('back');
            });
            if (i === cards.length - 1) {
              next();
            }
          });
        });
      }
    },
    card: function (card) {
      var transform = prefix('transform');

      var $el = card.$el;

      card.intro = function (i, cb) {
        var delay = 500 + i * 10;
        var z = i / 4;

        $el.style[transform] = translate(-z + 'px', '-250px');
        $el.style.opacity = 0;

        card.x = -z;
        card.y = -250 - z;
        card.rot = 0;

        card.animateTo({
          delay: delay,
          duration: 1000,

          x: -z,
          y: -z,

          onStart: function () {
            $el.style.zIndex = i;
          },
          onProgress: function (t) {
            $el.style.opacity = t;
          },
          onComplete: function () {
            $el.style.opacity = '';
            cb && cb(i);
          }
        });
      };
    }
  };

  var fontSize$1;

  var poker = {
    deck: function (deck) {
      deck.poker = deck.queued(poker);

      function poker(next) {
        var cards = deck.cards;
        var len = cards.length;

        fontSize$1 = getFontSize();

        cards.slice(-5).reverse().forEach(function (card, i) {
          card.poker(i, len, function (i) {
            card.setSide('front');
            if (i === 4) {
              next();
            }
          });
        });
      }
    },
    card: function (card) {
      var $el = card.$el;

      card.poker = function (i, len, cb) {
        var delay = i * 250;

        card.animateTo({
          delay: delay,
          duration: 250,

          x: Math.round((i - 2.05) * 70 * fontSize$1 / 16),
          y: Math.round(-110 * fontSize$1 / 16),
          rot: 0,

          onStart: function () {
            $el.style.zIndex = len - 1 + i;
          },
          onComplete: function () {
            cb(i);
          }
        });
      };
    }
  };

  function fisherYates(array) {
    var rnd, temp;

    for (var i = array.length - 1; i; i--) {
      rnd = Math.floor(Math.random() * (i + 1));
      temp = array[i];
      array[i] = array[rnd];
      array[rnd] = temp;
    }

    return array;
  }

  function plusMinus(value) {
    var plusminus = Math.round(Math.random()) ? -1 : 1;

    return plusminus * value;
  }

  var fontSize;

  var shuffle = {
    deck: function (deck) {
      deck.shuffle = deck.queued(shuffle);

      function shuffle(next) {
        var cards = deck.cards;

        fontSize = getFontSize();

        fisherYates(cards);

        cards.forEach(function (card, i) {
          card.pos = i;

          card.shuffle(function (i) {
            if (i === cards.length - 1) {
              next();
            }
          });
        });
        return;
      }
    },

    card: function (card) {
      var $el = card.$el;

      card.shuffle = function (cb) {
        var i = card.pos;
        var z = i / 4;
        var delay = i * 2;

        card.animateTo({
          delay: delay,
          duration: 200,

          x: plusMinus(Math.random() * 40 + 20) * fontSize / 16,
          y: -z,
          rot: 0
        });
        card.animateTo({
          delay: 200 + delay,
          duration: 200,

          x: -z,
          y: -z,
          rot: 0,

          onStart: function () {
            $el.style.zIndex = i;
          },

          onComplete: function () {
            cb(i);
          }
        });
      };
    }
  };

  var sort = {
    deck: function (deck) {
      deck.sort = deck.queued(sort);

      function sort(next, reverse) {
        var cards = deck.cards;

        cards.sort(function (a, b) {
          if (reverse) {
            return a.i - b.i;
          } else {
            return b.i - a.i;
          }
        });

        cards.forEach(function (card, i) {
          card.sort(i, cards.length, function (i) {
            if (i === cards.length - 1) {
              next();
            }
          }, reverse);
        });
      }
    },
    card: function (card) {
      var $el = card.$el;

      card.sort = function (i, len, cb, reverse) {
        var z = i / 4;
        var delay = i * 10;

        card.animateTo({
          delay: delay,
          duration: 400,

          x: -z,
          y: -150,
          rot: 0,

          onComplete: function () {
            $el.style.zIndex = i;
          }
        });

        card.animateTo({
          delay: delay + 500,
          duration: 400,

          x: -z,
          y: -z,
          rot: 0,

          onComplete: function () {
            cb(i);
          }
        });
      };
    }
  };

  var flip = {
    deck: function (deck) {
      deck.flip = deck.queued(flip);

      function flip(next, side) {
        var flipped = deck.cards.filter(function (card) {
          return card.side === 'front';
        }).length / deck.cards.length;

        deck.cards.forEach(function (card, i) {
          card.setSide(side ? side : flipped > 0.5 ? 'back' : 'front');
        });
        next();
      }
    }
  };

  function observable(target) {
    target || (target = {});
    var listeners = {};

    target.on = on;
    target.one = one;
    target.off = off;
    target.trigger = trigger;

    return target;

    function on(name, cb, ctx) {
      listeners[name] || (listeners[name] = []);
      listeners[name].push({ cb, ctx });
    }

    function one(name, cb, ctx) {
      listeners[name] || (listeners[name] = []);
      listeners[name].push({
        cb, ctx, once: true
      });
    }

    function trigger(name) {
      var self = this;
      var args = Array.prototype.slice(arguments, 1);

      var currentListeners = listeners[name] || [];

      currentListeners.filter(function (listener) {
        listener.cb.apply(self, args);

        return !listener.once;
      });
    }

    function off(name, cb) {
      if (!name) {
        listeners = {};
        return;
      }

      if (!cb) {
        listeners[name] = [];
        return;
      }

      listeners[name] = listeners[name].filter(function (listener) {
        return listener.cb !== cb;
      });
    }
  }

  function queue(target) {
    var array = Array.prototype;

    var queueing = [];

    target.queue = queue;
    target.queued = queued;

    return target;

    function queued(action) {
      return function () {
        var self = this;
        var args = arguments;

        queue(function (next) {
          action.apply(self, array.concat.apply(next, args));
        });
      };
    }

    function queue(action) {
      if (!action) {
        return;
      }

      queueing.push(action);

      if (queueing.length === 1) {
        next();
      }
    }
    function next() {
      queueing[0](function (err) {
        if (err) {
          throw err;
        }

        queueing = queueing.slice(1);

        if (queueing.length) {
          next();
        }
      });
    }
  }

  var maxZ = 52;

  function Card(i, start_x = 0, start_y = 0, hidden = false) {
    var transform = prefix('transform');

    // calculate rank/suit, etc..
    var rank = i % 13 + 1;
    var suit = i / 13 | 0;
    var z = (52 - i) / 4;

    // create elements
    var $el = createElement('div');
    var $face = createElement('div');
    var $back = createElement('div');

    // states
    var isDraggable = false;
    var isFlippable = false;

    var isClickable = false; // click the card will move upDistance or move back
    var isUp = false;
    var upDistance = 30; // default 30px
    var clickCallback = null;

    // self = card
    var self = { i, rank, suit, pos: i, $el, mount, unmount, setSide };

    var modules = Deck.modules;
    var module;

    // add classes
    $face.classList.add('face');
    $back.classList.add('back');

    // add default transform
    $el.style[transform] = translate(-z + 'px', -z + 'px');

    if (hidden) {
      $el.style.visibility = "hidden";
    }

    // add default values
    self.x = start_x;
    self.y = start_y;
    self.z = z;
    self.rot = 0;

    // set default side to back
    self.setSide('back');

    // add drag/click listeners
    addListener($el, 'mousedown', onMousedown);
    addListener($el, 'touchstart', onMousedown);

    // load modules
    for (module in modules) {
      addModule(modules[module]);
    }

    self.animateTo = function (params) {
      var { delay, duration, x = self.x, y = self.y, rot = self.rot, ease: ease$1, onStart, onProgress, onComplete } = params;
      var startX, startY, startRot;
      var diffX, diffY, diffRot;

      animationFrames(delay, duration).start(function () {
        startX = self.x || 0;
        startY = self.y || 0;
        startRot = self.rot || 0;
        $el.style.visibility = "visible";
        onStart && onStart();
      }).progress(function (t) {
        var et = ease[ease$1 || 'cubicInOut'](t);

        diffX = x - startX;
        diffY = y - startY;
        diffRot = rot - startRot;

        onProgress && onProgress(t, et);

        self.x = startX + diffX * et;
        self.y = startY + diffY * et;
        self.rot = startRot + diffRot * et;

        $el.style[transform] = translate(self.x + 'px', self.y + 'px') + (diffRot ? 'rotate(' + self.rot + 'deg)' : '');
        $el.style.zIndex = maxZ++;
      }).end(function () {
        onComplete && onComplete();
      });
    };

    self.moveUp = function (duration = 200, delay = 0) {
      if (isUp) {
        return;
      }

      isUp = true;
      self.animateTo({
        x: self.x,
        y: self.y - upDistance,
        duration,
        delay,
        ease: 'quartOut'
      });
    };

    self.moveDown = function (duration = 200, delay = 0) {
      if (!isUp) {
        return;
      }
      isUp = false;
      self.animateTo({
        x: self.x,
        y: self.y + upDistance,
        duration,
        delay,
        ease: 'quartOut'
      });
    };

    // set rank & suit
    self.setRankSuit = function (rank, suit) {
      var suitName = SuitName(suit);
      $el.setAttribute('class', 'card ' + suitName + ' rank' + rank);
    };

    self.setRankSuit(rank, suit);

    self.getCardIndex = function () {
      return suit * 13 + (rank - 1);
    };

    self.enableDragging = function () {
      // this activates dragging
      if (isDraggable) {
        // already is draggable, do nothing
        return;
      }
      isDraggable = true;
      $el.style.cursor = 'move';
    };

    self.enableFlipping = function () {
      if (isFlippable) {
        // already is flippable, do nothing
        return;
      }
      isFlippable = true;
    };

    self.enableClicking = function (callback) {
      if (isClickable) {
        return;
      }
      clickCallback = callback;
      isClickable = true;
      if (isUp) {
        moveUpOrDown();
      }
    };

    self.disableFlipping = function () {
      if (!isFlippable) {
        // already disabled flipping, do nothing
        return;
      }
      isFlippable = false;
    };

    self.disableDragging = function () {
      if (!isDraggable) {
        // already disabled dragging, do nothing
        return;
      }
      isDraggable = false;
      $el.style.cursor = '';
    };

    self.disableClicking = function () {
      if (!isClickable) {
        return;
      }
      isClickable = false;
      if (isUp) {
        moveUpOrDown();
      }
      clickCallback = null;
    };

    self.isUp = function () {
      return isUp;
    };

    self.setUpDistance = function (d) {
      upDistance = d;
    };

    return self;

    function addModule(module) {
      // add card module
      module.card && module.card(self);
    }

    function onMousedown(e) {
      var startPos = {};
      var pos = {};
      var starttime = Date.now();

      e.preventDefault();

      // get start coordinates and start listening window events
      if (e.type === 'mousedown') {
        startPos.x = pos.x = e.clientX;
        startPos.y = pos.y = e.clientY;
        addListener(window, 'mousemove', onMousemove);
        addListener(window, 'mouseup', onMouseup);
      } else {
        startPos.x = pos.x = e.touches[0].clientX;
        startPos.y = pos.y = e.touches[0].clientY;
        addListener(window, 'touchmove', onMousemove);
        addListener(window, 'touchend', onMouseup);
      }

      if (!isDraggable) {
        // is not draggable, do nothing
        return;
      }

      // move card
      $el.style[transform] = translate(self.x + 'px', self.y + 'px') + (self.rot ? ' rotate(' + self.rot + 'deg)' : '');
      $el.style.zIndex = maxZ++;

      function onMousemove(e) {
        if (!isDraggable) {
          // is not draggable, do nothing
          return;
        }
        if (e.type === 'mousemove') {
          pos.x = e.clientX;
          pos.y = e.clientY;
        } else {
          pos.x = e.touches[0].clientX;
          pos.y = e.touches[0].clientY;
        }

        // move card
        $el.style[transform] = translate(Math.round(self.x + pos.x - startPos.x) + 'px', Math.round(self.y + pos.y - startPos.y) + 'px') + (self.rot ? ' rotate(' + self.rot + 'deg)' : '');
      }

      function onMouseup(e) {
        if (isFlippable && Date.now() - starttime < 200) {
          // flip sides
          self.setSide(self.side === 'front' ? 'back' : 'front');
        }

        if (e.type === 'mouseup') {
          removeListener(window, 'mousemove', onMousemove);
          removeListener(window, 'mouseup', onMouseup);
        } else {
          removeListener(window, 'touchmove', onMousemove);
          removeListener(window, 'touchend', onMouseup);
        }

        if (isClickable && Date.now() - starttime < 200) {
          moveUpOrDown();
          // clickable will disable drag
          return;
        }

        if (!isDraggable) {
          // is not draggable, do nothing
          return;
        }

        // set current position
        self.x = self.x + pos.x - startPos.x;
        self.y = self.y + pos.y - startPos.y;
      }
    }

    function moveUpOrDown() {
      self.y += isUp ? upDistance : -upDistance;
      $el.style[transform] = translate(self.x + 'px', self.y + 'px');
      $el.style.zIndex = isUp ? --maxZ : maxZ++;
      isUp = !isUp;
      clickCallback(isUp);
    }

    function mount(target) {
      // mount card to target (deck)
      target.appendChild($el);

      self.$root = target;
    }

    function unmount() {
      // unmount from root (deck)
      self.$root && self.$root.removeChild($el);
      self.$root = null;
    }

    function setSide(newSide) {
      // flip sides
      if (newSide === 'front') {
        if (self.side === 'back') {
          $el.removeChild($back);
        }
        self.side = 'front';
        $el.appendChild($face);
        self.setRankSuit(self.rank, self.suit);
      } else {
        if (self.side === 'front') {
          $el.removeChild($face);
        }
        self.side = 'back';
        $el.appendChild($back);
        $el.setAttribute('class', 'card');
      }
    }
  }

  function SuitName(suit) {
    // return suit name from suit value
    return suit === 0 ? 'spades' : suit === 1 ? 'hearts' : suit === 2 ? 'clubs' : suit === 3 ? 'diamonds' : 'joker';
  }

  function addListener(target, name, listener) {
    target.addEventListener(name, listener);
  }

  function removeListener(target, name, listener) {
    target.removeEventListener(name, listener);
  }

  function Deck(jokers) {
    // init cards array
    var cards = new Array(jokers ? 54 : 52);

    var $el = createElement('div');
    var self = observable({ mount, unmount, cards, $el });
    var $root;

    var modules = Deck.modules;
    var module;

    // make queueable
    queue(self);

    // load modules
    for (module in modules) {
      addModule(modules[module]);
    }

    // add class
    $el.classList.add('deck');

    var card;

    // create cards
    for (var i = cards.length; i; i--) {
      card = cards[i - 1] = Card(i - 1);
      card.setSide('back');
      card.mount($el);
    }

    return self;

    function mount(root) {
      // mount deck to root
      $root = root;
      $root.appendChild($el);
    }

    function unmount() {
      // unmount deck from root
      $root.removeChild($el);
    }

    function addModule(module) {
      module.deck && module.deck(self);
    }
  }
  Deck.animationFrames = animationFrames;
  Deck.ease = ease;
  Deck.modules = { bysuit, fan, intro, poker, shuffle, sort, flip };
  Deck.Card = Card;
  Deck.prefix = prefix;
  Deck.translate = translate;

  return Deck;
}();
