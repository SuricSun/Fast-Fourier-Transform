/**
 * Fast Fourier Transform
 * 快速傅里叶变换
 * 总结：傅里叶变换出傅里叶级数数组[{amp, phase}, {amp, phase}, {amp, phase}...]
 * 每个数组元素可以唯一的表示一个正弦函数: amp, phase, freq(就是这个数组元素所在的索引index)
 * 无论传入进来的信号采样是多少秒的，对于FFT来言没有意义
 * 变幻出的傅里叶级数如果转换为原先的信号的话，你会发现变换出来的图像在0-1部分和传入进来的信号图像是一致的
 * 而每隔一个0-1部分，比如1-2，2-3，3-4部分的图像都是一样的，意味着FFT变换出来的东西只能还原出你传进来的信号
 * 而这正是我们需要的
 */

(function () {

    let FFT = {

        Complex_number: class {

            real = 0;
            image = 0;

            constructor(_real, _image) {

                if (arguments.length >= 1) {
                    this.real = _real;
                    if (arguments.length >= 2) {
                        this.image = _image;
                    }
                }
            }

            magnitude() {

                return Math.sqrt(Math.pow(this.real, 2) + Math.pow(this.image, 2));
            }

            atan2_image_real() {

                return Math.atan2(this.image, this.real);
            }

            transfer_self() {

                let real = this.magnitude();
                let image = this.atan2_image_real();
                this.real = real;
                this.image = image;
            }

            set_0() {

                this.real = this.image = 0;
                return this;
            }

            add_complex(c1) {

                this.real += c1.real;
                this.image += c1.image;
                return this;
            }

            c_min(c1) {

                this.real -= c1.real;
                this.image -= c1.image;
                return this;
            }

            c_mul(c1) {

                //(a+bi) * (c+di) = (ac - bd) + (ad + bc)i
                this.real = this.real * c1.real - this.image * c1.image;
                this.image = this.real * c1.image + this.image * c1.real;
                return this;
            }

            div_by_num(num) {

                this.real /= num;
                this.image /= num;
                return this;
            }
        },

        c_add: function (c0, c1) {

            return new this.Complex_number(c0.real + c1.real, c0.image + c1.image);
        },

        c_min: function (c0, c1) {

            return new this.Complex_number(c0.real - c1.real, c0.image - c1.image);
        },

        mul_2_complex: function (c0, c1) {

            //(a+bi) * (c+di) = (ac - bd) + (ad + bc)i
            return new this.Complex_number(c0.real * c1.real - c0.image * c1.image, c0.real * c1.image + c0.image * c1.real);
        },

        c_div: function (c0, c1) {

            return undefined;
        },

        /**
         * e^(-i*2*pi**x)
         */
        euler_formula: function (x) {

            return new this.Complex_number(Math.cos(-2 * Math.PI * x), Math.sin(-2 * Math.PI * x));
        },

        /**
         *
         * @param samples sample.length must be power of 2
         * @param  any float value that is positive, zero or negative numbers are not allowed
         * @param sample_start
         * @param sample_step
         * @param sample_cnt
         * @param read_from
         * @param write_to
         */
        fft_inner: function (samples, sample_start, sample_step, sample_cnt, read_from, write_to) {

            if (samples.length % 2 !== 0) {
                console.error("sample.length is not power of 2");
            }

            if (sample_cnt === 1) {
                write_to[sample_start] = new this.Complex_number(samples[sample_start]);
                return;
            }

            //even
            this.fft_inner(samples, sample_start, sample_step * 2, sample_cnt / 2, write_to, read_from);
            //odd
            this.fft_inner(samples, sample_start + sample_step, sample_step * 2, sample_cnt / 2, write_to, read_from);
            //给上级计算数据
            //两两sample一对
            let sample_start_to_end_mid = sample_start + sample_step * sample_cnt / 2;
            for (let i = 0; i < sample_cnt / 2; i++) {
                let v = new this.Complex_number();
                write_to[sample_start + sample_step * i] = v;
                v.set_0()
                    .add_complex(read_from[sample_start + sample_step * 2 * i])
                    .add_complex(
                        this.mul_2_complex(
                            this.euler_formula(i / sample_cnt),
                            read_from[sample_start + sample_step * (2 * i + 1)]
                        )
                    );
                v.div_by_num(2);

                // another
                v = new this.Complex_number();
                write_to[sample_start_to_end_mid + sample_step * i] = v;
                v.set_0()
                    .add_complex(read_from[sample_start + sample_step * 2 * i])
                    .add_complex(
                        this.mul_2_complex(
                            this.euler_formula((sample_cnt / 2 + i) / sample_cnt),
                            read_from[sample_start + sample_step * (2 * i + 1)]
                        )
                    );
                v.div_by_num(2);
            }
        },

        fft(samples, read_from, write_to) {

            this.fft_inner(samples, 0, 1, samples.length, read_from, write_to);
            write_to.forEach((elem) => {

                elem.transfer_self();
            });
        }
    }

    window.fft = FFT;
})(window);