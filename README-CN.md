
#### 项目介绍
轻量级JS任务队列，支持并行数控制，任务超时，任务失败重试，错误抓取，任务运行情况统计等。

#### 软件架构
队列如何实现任务的及时消化？抓住两个重要时机：put任务和任务执行完成。假设队列的并行量被设置为n，初始化的时候正在执行中任务为m：

1. put任务的时候，顺带检测一下执行中的任务数距离并发量上限还有多少，一次性加载n-m个任务放入执行中队列。
2. 每个执行完成的任务，处理完事务之后，顺带，尝试加载一个任务来补充执行。


队列仅依赖于Promise，不管是使用原生ES6的Promise对象还是使用bluebird库，都可以正常运行。


#### 使用说明

1. 创建默认队列

    按照需要创建一个队列对象（队列对象之间互不影响, 所以可以多种场景使用多个队列对象，甚至可以通过多个队列组合从而应对一些复杂场景）

    ```javascript
    let q = new Queue();
    ```
2. put单个任务

    由于Promise的执行代码在创建的时刻就已经被执行（then和catch内的代码则通过回调执行），所以简单把Promise扔进队列是不可行的

    ```javascript
    // 下面的打印序是 1 2 3
    new Promise(resolve => {
        console.log(1);
        resolve(3)
    }).then(res => {
        console.log(res);
    })
    console.log(2)
    ```
    通过将Promise扔进一个function可以达到延期执行的效果
    ```javascript
    function p() {
        // 返回promise任务
        return new Promise(resolve => {
            console.log(1);
            resolve(3)
        }).then(res => {
            console.log(res);
        })
    }
    console.log(2);
    ```
    此时p必须等待调用才会执行内部的Promise代码，且p返回的是该Promise，值便可以继续传递。 每个放置到QueueTask的Promise任务都应该以这种方式封装
    ```javascript
    function p() {
        return new Promise(resolve => {
            console.log(1);
            resolve(2)
        }).then(res => {
            console.log(res);
            return 3;
        })
    }
    // 由于队列很空闲, 可以立即调度本任务,
    // 所以很快就成功打印出了1, 之后的then则需要等待合适的时机回调,
    // 如果Promise及其上面的所有then都执行完了, 最终会传递到put.then
    q.put(p).then(task => {
        // 打印最终值3
        console.log(task.res)
    });
    ```
    当然，如果在put的时候，队列执行中的任务数已经到达最大并行量，则需要等待有任务执行完成时腾出空间，并且排在当前任务之前的任务已经都被调度完了才会得到执行。

3. put一组任务

    QueueTask允许同时put多个任务，且put.then会在该组任务都被执行完毕时才被调用
    ```javascript
    function getP(flag) {
        return function p() {
            return new Promise(resolve => {
                resolve(flag)
            });
        }
    }
    q.put([getP(1), getP(2), getP(3)]).then(tasks => {
        // 打印每个任务的返回值, 按放入顺序一一对应
        for (let i = 0; i < tasks.length; i++) {
            console.log(tasks[i].res);
        }
    })
    ```

4. 配置

     目前支持的参数如下：
     ```javascript
     let q = new Queue({
        // 最大并行数，最小为1
        concurrency: 5,
        // 任务超时时间ms，0不超时
        timeout: 15000,
        // 任务失败重试次数，0不重试
        retry: 0,
        // 是否优先处理失败重试的任务，为true则失败的任务会被放置到队列头
        retryPrior: false,
        // 是否优先处理新任务，为true则新任务会被放置到队列头
        newPrior: false,
        // 任务失败的handler函数，如果设置了重试，同个任务失败多次会执行catch多次
        catch: (err) => {

        }
     });
     ```
     参数可以在运行期更改, 对后续生效
     ```javascript
     q.setOptions({
        concurrency: 5,
        timeout: 15000,
        retry: 0,
        retryPrior: false,
        newPrior: false,
        catch: null
     });
     ```

5. 任务运行状态

    使用QueueTask执行的Promise任务所有错误会被catch并包装，所以只存在put.then而不存在put.catch（除非put.then自身出错）。任务执行之后获取到的响应有一些有用的值可以用于服务统计
    ```javascript
    taskRes = {
        // 执行是否遇到错误, 判断任务是否执行成功的判断依据是err === undefined, err为任何其它值都代表了运行失败。
        // 任务出错时, 如果不重试, 那么catch到的错误会直接放入err, 超时时err为'queue_timeout'
        // 如果重试, 且在最大重试次数之后依然错误的话, 会将最后一次的错误放入err
        // 如果重试, 且在重试期间成功的话, 被认为是成功的, 所以err为空
        err: undefined,
        // 执行Promise返回的结果
        res: Object,
        // 从任务放入队列到该任务最后一次被调度, 所经过的时间(ms)
        waittingTime: 20,
        // 该任务最后一次运行的时间(ms)
        runTime: 1,
        // 该任务出错重试的次数
        retry: 2
    }
    ```
6. 插队

    除了队列控制参数newPrior和retryPrior之外，也允许在put的时候指定当前任务是否优先处理
    ```
    put(tasks, prior)
    ```
    默认情况下，任务是放入队尾的，但如果指定了prior为true，则会被放置到队头，put任务组时会维持组任务原本的顺序，并整个放入队头。
        
7. 更多

    + q.options：获取当前队列的配置。
    + q.queueTaskSize：获取队列排队中的任务数。
    + q.runningTaskCount：获取队列执行中的任务数。

    另外，也提供了demo.js，可以评估运行状况是否符合预期。

#### 参与贡献

1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request