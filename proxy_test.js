function trapFunction(obj) {
  return new Proxy(obj, {
    apply: function (target, thisArg, ...argArrary) {
      let ret = Reflect.apply(target, thisArg, ...argArrary);
      console.log("function apply", thisArg);
      return ret;
    }
  })
}


// const ArrayModifyInterface = new Set([
//   'push', 'fill', 'pop', 'reverse', 'shift', 'splice', 'unshift'
// ])

// function trapArray(obj, cb) {
//   let proxy = new Proxy(obj, {
//     get: function(target, property, receiver) {
//       let ret = Reflect.get(target, property, receiver);
//       if (typeof ret === 'function' && ArrayModifyInterface.has(property)) {
//         // 代理方法，获取方法调用后的值
//         return new Proxy(ret, {
//           apply: function(target1, thisArg1, ...argArray1) {
//             let ret1 = Reflect.apply(target1, thisArg1, ...argArray1);
//             cb && cb(property, target);
//             return ret1;
//           }
//         })
//       }
//       return ret;
//     }
//   });
//   return proxy;
// }

// function trapArray(obj, cb) {
//   let proxy = new Proxy(obj, {
//     set: function(target, property, value, receiver) {
//       let ret = Reflect.set(target, property, value, receiver);
//       if (property !== 'length') {
//         cb && cb(property, target);
//       }
//       return ret;
//     }
//   });
//   return proxy;
// }



// function trapObject(obj, cb) {
//   let proxy = new Proxy(obj, {
//     set: function(target, property, value, receiver) {
//       let ret = Reflect.set(target, property, value, receiver);
//       cb && cb(property, target);
//       return ret;
//     }
//   });
//   return proxy;
// }



function trapObject(obj, path) {
  path = path || [];
  let proxy = new Proxy(obj, {
    construct: function (target, argArrary, newTarget) {
      console.log("new constructor");
      return Reflect.construct(target, argArrary, newTarget);
    },
    get: function (target, property, receiver) {
      let temp = Reflect.get(target, property, receiver);
      if (typeof temp === 'function' && (temp.name === '__load__' || temp.name === '__save__')) {
        return temp.bind(target);
      } else if (typeof temp === 'object') {
        let newPath = path.concat(property);
        return trapObject(temp, newPath);
      }
      let newPath = path.concat(property);
      console.log("path ===>", newPath);
      return temp;
    },
    set: function (target, property, value, receiver) {
      if (Object.hasOwnProperty.call(target, property)) {
        let newPath = path.concat(property);
        target.__binlog__.push(newPath.join(':'));
        // console.log("set ===>", newPath, "value", value);
      }
      return Reflect.set(target, property, value, receiver);
    }
  });

  return proxy;
}



// class SaveObj {

//     constructor() {
//         // emm. 不用私有变量吧
//         this.__binlog__ = [];
//         return trapObject(this);
//     }

//     /**
//      * 初始化该对象时调用，
//      * 该方法的操作不会被trap
//      * @param {*} data 
//      */
//     __load__(data) {

//     }

//     /**
//      * 保存当前对象的时候调用，刷新当前的指令集
//      * 返回旧的指令集
//      * 该方法的操作不会被trap
//      */
//     __save__() {
//         let binlog = this.__binlog__;
//         this.__binlog__ = [];
//         return binlog;
//     }

// }

// class Player extends SaveObj {

//     a = 1;
//     constructor() {
//         super();
//         this.b = "2";
//         this.c = {'cc': 4};
//         this.d = [];
//     }

//     __load__(data) {
//         this.a = data.a;
//         this.b = data.b;
//     }

//     __save__() {
//         let res = super.__save__();
//         console.log(res);
//     }

// }

// let ch = new Player();

// ch.__load__({
//     a: 11,
//     b: 22
// });

// console.log(ch);

// ch.a = 1;
// ch.b = 2;

// ch.__save__();

// console.log(ch);








// let a = { a: 1, b: { a: "no", b: "yes" }, c: { a: "green", b: { a: "blue", b: "orange" } }, d: [] };

// let proxy_a = trapObject(a);
// console.log("================");
// proxy_a.aa = 123;
// console.log("================");
// proxy_a.a = 111;
// console.log("================");
// proxy_a.b.a = "yes";
// console.log("================");
// proxy_a.b.b = "no";
// console.log("================");
// // proxy_a.c.b;
// // console.log("================");
// proxy_a.c.b.a = {};
// console.log("================");
// proxy_a.c.b.b = [];
// console.log("================");
// proxy_a.d.push(222);
// console.log("================");



// TODO: 尝试构造代理类， 由代理类构造代理对象
// track 每次对属性的修改操作, 保存当前操作的redis指令