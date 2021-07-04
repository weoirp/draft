const handler = {
  get(target, property, receiver) {
    try {
      return new Proxy(target[property], handler);
    } catch (err) {
      return Reflect.get(target, property, receiver);
    }
  },
  defineProperty(target, property, descriptor) {
    console.log("target=%o, property=%s, descriptor=%o", target, property, descriptor);
    return Reflect.defineProperty(target, property, descriptor);
  },
  deleteProperty(target, property) {
    console.log("target=%o, property=%s", target, property);
    return Reflect.deleteProperty(target, property);
  }
};

function trackClass(cls) {
  if (typeof cls !== 'function') {
    return;
  }

  return new Proxy(cls, {
    construct: function (target, ...argArray) {
      const obj = Reflect.construct(target, ...argArray);

      // proxy obj property
      return new Proxy(obj, handler);
    }
  })
}


class Player {

  version = 1.0;
  constructor() {
    this.lv = 1;
    this.nickname = "abc";
    this.bag = [];
    this.task = {};
    this.a = { a: 1, b: { a: "no", b: "yes" }, c: { a: "green", b: { a: "blue", b: "orange" } }, d: [] };
  }

  addLevel(lv) {
    this.lv += lv;
  }

  updateName(nickname) {
    this.nickname = nickname;
  }
}

WrapPlayer = trackClass(Player);

let player = new WrapPlayer();

player.addLevel(10);
player.updateName("zone");
player.bag.push(1, 2, 3, 4);
player.bag.pop();
delete player.bag[1];
player.task[0] = 1;

player.a.b.a = "yes";
let player_a_c_b = player.a.c.b;
player_a_c_b.b = "apple";
player.a.b = {};
player.a.b["new_key"] = "new"


console.log(player);