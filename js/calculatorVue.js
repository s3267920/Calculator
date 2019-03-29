(function() {
  new Vue({
    el: '#app',
    data() {
      return {
        storeNum: [],
        textNum: [],
        lastNum: [],
        newNum: [],
        total: 0,
        getTotal: false,
        keyValue: ''
      };
    },
    computed: {
      text() {
        if (this.textNum.length) {
          return this.currencyHandle(this.textNum.join(''));
        } else {
          return 0;
        }
      }
    },
    methods: {
      compareOperation(item) {
        return item === ' + ' || item === ' - ' || item === ' × ' || item === ' ÷ ';
      },
      compareOtherNum(num, status = false) {
        if (status) {
          return num === '0' || num === '00' || num === '.';
        } else {
          return num !== '0' || num !== '00' || num !== '.';
        }
      },
      calculatorNumHandle(num) {
        //轉換成運算用加減乘除
        let calculatorNum = [];
        num.forEach(i => {
          switch (i) {
            case ' + ':
              calculatorNum.push('+');
              break;
            case ' - ':
              calculatorNum.push('-');
              break;
            case ' × ':
              calculatorNum.push('*');
              break;
            case ' ÷ ':
              calculatorNum.push('/');
              break;
            default:
              calculatorNum.push(i);
              break;
          }
        });
        return calculatorNum;
      },
      itemFilter(arr, item) {
        let has = false;
        arr.forEach(el => {
          if (el === item) {
            has = true;
          }
        });
        return has;
      },
      addNum(i) {
        let vm = this;
        //初始
        vm.keyValue = i;
        if (!vm.storeNum.length && vm.compareOtherNum(i, true)) {
          //只有點時自動補零
          if (i === '.') {
            vm.textNum.push('0', i);
            vm.storeNum.push('0', i);
            vm.newNum.push('0', i);
          } else {
            vm.textNum.push('0');
            vm.storeNum.push('0');
            vm.newNum.push('0');
          }
        } else {
          //加減乘除
          if (i === '+' || i === '-' || i === '×' || i === '÷') {
            if (vm.getTotal) {
              if (i === '×' || i === '÷') {
                return;
              }
              vm.lastNum.splice(0, vm.lastNum.length, vm.total);
              vm.textNum.splice(0, vm.textNum.length, vm.total);
              vm.total = 0;
              vm.getTotal = false;
            } else if (vm.compareOperation(vm.storeNum[vm.storeNum.length - 1])) {
              vm.lastNum.pop();
              vm.textNum.pop();
              vm.storeNum.pop();
            }
            if (!vm.storeNum.length && (i === '×' || i === '÷')) return;
            else {
              vm.lastNum.push(vm.newNum.join(''));
              vm.textNum.push(` ${i} `);
              vm.storeNum.push(` ${i} `);
              vm.lastNum.push(` ${i} `);
              vm.newNum = [];
            }
          }
          //number 00
          else if (i === '00') {
            if (
              vm.compareOperation(vm.storeNum[vm.storeNum.length - 1]) ||
              (!vm.lastNum.length && vm.newNum[0] === '0' && vm.newNum[1] !== '.')
            ) {
              return;
            } else {
              vm.textNum.push('0', '0');
              vm.storeNum.push('0', '0');
              vm.newNum.push('0', '0');
            }
          }
          //number 0
          else if (i === '0') {
            if (vm.newNum[0] === '0' && vm.newNum[1] !== '.') {
              return;
            } else if (vm.newNum[0] === '0' && vm.newNum[1] !== '.' && vm.lastNum[0] == vm.textNum[0]) {
              return;
            } else {
              vm.textNum.push(i);
              vm.storeNum.push(i);
              vm.newNum.push(i);
            }
          }
          //'.'
          else if (i === '.') {
            if (vm.compareOperation(vm.storeNum[vm.storeNum.length - 1])) {
              vm.textNum.push('0', i);
              vm.storeNum.push('0', i);
              vm.newNum.push('0', i);
            } else if (
              (vm.getTotal && vm.lastNum[0] === vm.total && vm.storeNum[vm.storeNum.length - 1] === '.') ||
              (vm.getTotal && !vm.newNum.length) ||
              vm.storeNum[vm.storeNum.length - 1] === '.' ||
              vm.itemFilter(vm.newNum, '.')
            ) {
              return;
            } else {
              vm.textNum.push(i);
              vm.storeNum.push(i);
              vm.newNum.push(i);
            }
          }
          // number
          else {
            if (vm.getTotal) {
              vm.textNum = [];
              vm.storeNum = [];
              vm.lastNum = [];
              vm.total = 0;
              vm.getTotal = false;
              vm.lastNum.push(i);
              vm.textNum.push(i);
              vm.storeNum.push(i);
              vm.newNum.push(i);
            } else if (vm.newNum[0] === '0' && i !== '.') {
              if (vm.newNum[1] === '.') {
                vm.textNum.push(i);
                vm.storeNum.push(i);
                vm.newNum.push(i);
              } else {
                vm.textNum.splice(-1, 1, i);
                vm.storeNum.splice(-1, 1, i);
                vm.newNum.splice(-1, 1, i);
              }
            } else {
              vm.textNum.push(i);
              vm.storeNum.push(i);
              vm.newNum.push(i);
            }
          }
        }
      },
      calculatorHandle(way) {
        //在最後一個運算後按 = 會一直重複最後的運算
        const vm = this;
        switch (way) {
          case 'sum':
            if (!vm.storeNum.length || !vm.lastNum.length) {
              return;
            } else {
              //第一次按下 = 時
              if (!vm.getTotal && !vm.compareOperation(vm.storeNum[vm.storeNum.length - 1])) {
                vm.lastNum.push(vm.newNum.join(''));
                let calculatorNum = vm.calculatorNumHandle(vm.storeNum);
                //小數部分處理
                let calculatorTotal = vm.currencyHandle(
                  String(parseFloat(eval(calculatorNum.join('')).toPrecision(12)))
                );
                vm.total = calculatorTotal;
                vm.getTotal = true;
                vm.newNum = [];
              }
              //初始狀態時，只有一個數字跟加減乘除時，加減乘除數字
              else if (vm.compareOperation(vm.storeNum[vm.storeNum.length - 1])) {
                let newStoreNum = vm.storeNum.concat(vm.lastNum.slice(-2, -1));
                vm.textNum.push(vm.lastNum[vm.lastNum.length - 2]);
                vm.lastNum.push(vm.lastNum[vm.lastNum.length - 2]);
                let calculatorNum = vm.calculatorNumHandle(newStoreNum);
                let calculatorTotal = vm.currencyHandle(
                  String(parseFloat(eval(calculatorNum.join('')).toPrecision(12)))
                );
                vm.storeNum = newStoreNum;
                vm.total = calculatorTotal;
                vm.getTotal = true;
                vm.newNum = [];
              } else {
                //第二次開始按下 = 時
                let newStoreNum = vm.storeNum.concat(vm.lastNum.slice(-2));
                vm.textNum.splice(0, vm.textNum.length, vm.total);
                let newTextNum = vm.textNum.concat(vm.lastNum.slice(-2));
                let calculatorNum = vm.calculatorNumHandle(newStoreNum);
                let calculatorTotal = vm.currencyHandle(
                  String(parseFloat(eval(calculatorNum.join('')).toPrecision(12)))
                );
                vm.storeNum = newStoreNum;
                vm.textNum = newTextNum;
                vm.total = calculatorTotal;
                vm.getTotal = true;
                vm.newNum = [];
              }
            }
            break;
          case 'del':
            if (vm.getTotal) {
              return;
            } else {
              if (vm.storeNum.length) {
                if (vm.newNum.length) {
                  vm.newNum.pop();
                } else {
                  let splitLastName = vm.lastNum.join('').split('');
                  if (vm.compareOperation(vm.lastNum[vm.lastNum.length - 1])) {
                    splitLastName.splice(splitLastName.length - 3, 3);
                  } else {
                    splitLastName.pop();
                  }
                  vm.newNum = [];
                  vm.lastNum = splitLastName;
                }
                let splitTextNum = vm.textNum.join('').split('');
                if (vm.compareOperation(vm.textNum[vm.textNum.length - 1])) {
                  splitTextNum.splice(splitTextNum.length - 3, 3);
                  vm.textNum = splitTextNum;
                } else {
                  vm.textNum.pop();
                }
                let splitStoreNum = vm.storeNum.join('').split('');
                if (vm.compareOperation(vm.storeNum[vm.storeNum.length - 1])) {
                  splitStoreNum.splice(splitStoreNum.length - 3, 3);
                  vm.storeNum = splitStoreNum;
                } else {
                  vm.storeNum.pop();
                }
              } else {
                vm.storeNum = [];
                vm.textNum = [];
              }
            }
            break;
          case 'reset':
            vm.textNum = [];
            vm.lastNum = [];
            vm.newNum = [];
            vm.storeNum = [];
            vm.total = 0;
            vm.getTotal = false;
            break;
        }
      },
      currencyHandle(num) {
        //參考https://dotblogs.com.tw/alenwu_coding_blog/2017/08/11/js_number_to_currency_comma
        let parts = num.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
      }
    },
    mounted() {
      window.addEventListener('keydown', e => {
        switch (e.key) {
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
          case '0':
            this.addNum(e.key);
            break;
          case '.':
          case '+':
          case '-':
            this.addNum(e.key);
            break;
          case '*':
            this.addNum('×');
            break;
          case '/':
            this.addNum('÷');
            break;
          case 'Enter':
            this.keyValue = 'sum';
            this.calculatorHandle('sum');
            break;
          case 'Backspace':
            this.keyValue = 'del';
            this.calculatorHandle('del');
            break;
          case 'Delete':
            this.keyValue = 'reset';
            this.calculatorHandle('reset');
            break;
        }
      });
      window.addEventListener('keyup', e => {
        this.keyValue = '';
      });
      window.addEventListener('mouseup', e => {
        this.keyValue = '';
      });
    }
  });
})(Vue);
