let util = require('util');

// 对象属性修改hook
const objHandler = {
    defineProperty(target, property, descriptor) {
        console.log("11property=%s, descriptor=%o", property, descriptor);
        let oldValue = descriptor.value;
        if (typeof oldValue === 'object') {
            descriptor.value = proxyObject(oldValue);
        }
        return Reflect.defineProperty(target, property, descriptor);
    }
}

/**
 * 返回obj 的代理object
 * 只对原生数据类型有效
 * @param {*} obj 
 */
function proxyObject(obj) {

    // 已经是proxy对象了
    if (util.types.isProxy(obj)) {
        return obj;
    }

    if (Array.isArray(obj)) {
        for (const it of obj) {
            let oldValue = obj[it];
            if (typeof oldValue === 'object' && !util.types.isProxy(oldValue)) {
                obj[it] = proxyObject(oldValue);
            }
        }
    } else {
        
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                let oldValue = obj[key];
                if (typeof oldValue === 'object') {
                    obj[key] = proxyObject(oldValue);
                }
            }
        }
    }

    return new Proxy(obj, objHandler);
}




const propertyHandler = {
    // 对属性进行赋值操作, 代理对象
    defineProperty(target, property, descriptor) {
        if (target.hasOwnProperty(property)) {
            console.log("00property=%s, descriptor=%o", property, descriptor);
            let oldValue = descriptor.value;
            // is object and is not Proxy
            if (typeof oldValue === 'object' && !util.types.isProxy(oldValue)) {
                descriptor.value = proxyObject(oldValue);
            }
        }
        return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
        console.log("delete property=%s", property);
        return Reflect.deleteProperty(target, property);
    },
}


function callback() {
    console.log(this.dirty);
}

function trackClass(cls) {
    if (typeof cls !== 'function') {
        return;
    }

    return new Proxy(cls, {
        construct: function(target, ...argArray) {
            const obj = Reflect.construct(target, ...argArray);

            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    // TODO: 判断是否 标记sync
                    let oldValue = obj[key];
                    if (typeof oldValue === 'object' && !util.types.isProxy(oldValue)) {
                        obj[key] = proxyObject(oldValue, callback.bind(obj));
                    }
                }
            }
            // proxy obj property
            return new Proxy(obj, propertyHandler);
        }
    });
}




// testcase

class Player {

    dirty = false;
    version = 1.0;
    constructor() {
        this.lv = 1;
        this.nickname = "abc";
        this.bag = [];
        this.task = {};
        this.a = { 
            a: 1, 
            b: { a: "no", b: "yes" }, 
            c: { 
                a: "green", b: { a: "blue", b: "orange" } 
            }, 
            d: [] 
        };
    }
  
    addLevel(lv) {
      this.lv += lv;
    }
  
    updateName(nickname) {
      this.nickname = nickname;
    }
}

class SuperMan extends Player {
    constructor() {
        super();
        this.lv = 10;
        this.cc = 11;
    }
}

WrapPlayer = trackClass(SuperMan);
let player = new WrapPlayer();

player.lv = 11;
player.updateName("nickname");
player.addLevel(100);

player.task = {};
let task = player.task;
task[1] = 2;
task[2] = {};

let c = player.a.c;
c.a = "yellow"

let b = player.a.c.b;
b = {};
player.a.c.b.a = "apple";


player.addLevel(10);