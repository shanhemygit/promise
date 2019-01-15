class myPromise {
    constructor(Fn) {
        this.status = "pending";
        this.value = "undefined";
        this.resolveCb = [];
        this.rejectedCb = [];
        let resolve = (data) => {
            if (this.status == "pending") {
                setTimeout(() => { //setTimeout的作用  时间队列 放到最后执行
                    this.status = "resolve";
                    this.value = `${data}`;
                    this.resolveCb.forEach((fn) => { fn() })
                }, 0);
            }
        }
        let reject = (data) => {
            if (this.status == "pending") {
                setTimeout(() => {
                    this.status = "rejected";
                    this.value = `${data}`;
                    this.rejectedCb.forEach((fn) => { fn() })
                }, 0);
            }
        }
        if (typeof Fn !== "function") {
            throw TypeError(`${Fn} is not a function`);
        } else {
            Fn(resolve, reject);
        }
    }
    then(resolveFn, rejectFn) {
        if (this.status === "resolve") {
            let res = resolveFn(this.value);
            if (res instanceof myPromise) {
                return res;
            } else {
                return myPromise.resolve(res)
            }
        }
        if (this.status === "rejected") {
            let res = rejectFn(this.value);
            if (res instanceof myPromise) {
                return res;
            } else {
                return myPromise.resolve(res)
            }
        }
        if (this.status === "pending") {
            return new myPromise((resolve, rejected) => {
                this.resolveCb.push(((resolveFn) => {
                    return () => {
                        var res = resolveFn(this.value);
                        if (res instanceof myPromise) {
                            res.then(resolve, rejected);  //then的状态和 new myPromise() 相互映射
                        } else {
                            resolve(res)
                        }
                    }
                })(resolveFn));
                this.rejectedCb.push(((rejectFn) => {
                    return () => {
                        let res = rejectFn(this.value);
                        if (res instanceof myPromise) {
                            res.then(resolve, rejected)
                        } else {
                            rejected(res)
                        }
                    }
                })(rejectFn));
            })
        }
    }
    static resolve(data) {//生成带有明确状态的promise对象
        return new Promise((resolve, rejected) => { resolve(data) });
    }
    static rejected(data) {//生成带有明确状态的promise对象
        return new Promise((resolve, rejected) => { rejected(data) })
    }
}