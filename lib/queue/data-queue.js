
/**
 *
 * 数据队列
 *
 * 分两张消费方式
 *
 *  1. 被动消费, 客户端提供消费的方法, 队列自行按照指定策略去消费
 *  2. 主动消费, 暴露类似于pop之类的方法, 由客户端主动去调
 *
 * 可以有两种被动消费的策略
 *
 *  1. 只要有数据, 就不停地消费出去(允许指定每下一次消费延迟的时间)
 *  2. 按照指定频率消费出去
 *
 */
function DataQueue() {

}