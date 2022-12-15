# Fast-Fourier-Transform

js实现的快速傅里叶变换，可以移植到其他语言

## 复杂度

* 时间复杂度 $O(nLog_2n)$
* 空间复杂度 $O(n)$

## 使用

```javascript
//需要两个数组，数组长度和采样长度一致
//两个用作额外计算，最后有一个数组承载最终结果
let samples = new Array(2048);
let read_from = new Array(samples.length);
let write_to = new Array(samples.length);

//生成随机信号采样
//...

//fft变换
//2048个采样在我电脑上的平均计算时间为12毫秒
//而使用dft在同样的情况下约为80ms
console.time("fft");
fft.fft(samples, read_from, write_to);
console.timeEnd("fft");
//此时write_to数组(级数数组)包含傅里叶级数
//[{real, image}, {real, image}, {real, image}...]
//real是振幅，image是相位
//最后的每个频率分量的函数可写为
//real * cos(2 * pi * freq * t + image)
//注意freq是遍历级数数组时的index
//END
```
