(function() {
  let calculatorText = document.querySelector('#calculator_text');
  let totalText = document.querySelector('.total');
  let calculatorBody = document.querySelector('.calculator_body');
  let calculatorNumberLiList = document.querySelectorAll('.calculator_number>li');
  let calculatorHandleLiList = document.querySelectorAll('.calculator_bottom>li');
  let data = {
    storeNum: [],
    textNum: [],
    lastNum: [],
    newNum: [],
    total: 0,
    getTotal: false,
    keyValue: ''
  };
  let { storeNum, textNum, lastNum, newNum, total, getTotal, keyValue } = data;

  function compareOperation(item) {
    return item === ' + ' || item === ' - ' || item === ' × ' || item === ' ÷ ';
  }
  function compareOtherNum(num, status = false) {
    if (status) {
      return num === '0' || num === '00' || num === '.';
    } else {
      return num !== '0' || num !== '00' || num !== '.';
    }
  }
  function calculatorNumHandle(num) {
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
  }
  function itemFilter(arr, item) {
    let has = false;
    arr.forEach(el => {
      if (el === item) {
        has = true;
      }
    });
    return has;
  }
  function currencyHandle(num) {
    //參考https://dotblogs.com.tw/alenwu_coding_blog/2017/08/11/js_number_to_currency_comma
    let parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  let watch = () => {
    //監控textNum
    let textNumHandle = 0;
    textNum.length ? (textNumHandle = currencyHandle(textNum.join(''))) : (textNumHandle = 0);
    calculatorText.setAttribute('value', textNumHandle);

    if (getTotal) {
      totalText.style.display = 'inline-flex';
      calculatorText.classList.add('get_total');
      calculatorText.classList.remove('calculator_text');
    } else {
      totalText.style.display = 'none';
      calculatorText.classList.remove('get_total');
      calculatorText.classList.add('calculator_text');
    }
  };
  function addNum(i) {
    //初始
    keyValue = i;
    if (!storeNum.length && compareOtherNum(i, true)) {
      //只有點時自動補零
      if (i === '.') {
        textNum.push('0', i);
        storeNum.push('0', i);
        newNum.push('0', i);
      } else {
        textNum.push('0');
        storeNum.push('0');
        newNum.push('0');
      }
    } else {
      //加減乘除
      if (i === '+' || i === '-' || i === '×' || i === '÷') {
        if (getTotal) {
          if (i === '×' || i === '÷') {
            return;
          }
          lastNum.splice(0, lastNum.length, total);
          textNum.splice(0, textNum.length, total);
          total = 0;
          getTotal = false;
        } else if (compareOperation(storeNum[storeNum.length - 1])) {
          lastNum.pop();
          textNum.pop();
          storeNum.pop();
        }
        if (!storeNum.length && (i === '×' || i === '÷')) return;
        else {
          lastNum.push(newNum.join(''));
          textNum.push(` ${i} `);
          storeNum.push(` ${i} `);
          lastNum.push(` ${i} `);
          newNum = [];
        }
      }
      //number 00
      else if (i === '00') {
        if (
          compareOperation(storeNum[storeNum.length - 1]) ||
          (!lastNum.length && newNum[0] === '0' && newNum[1] !== '.')
        ) {
          return;
        } else {
          textNum.push('0', '0');
          storeNum.push('0', '0');
          newNum.push('0', '0');
        }
      }
      //number 0
      else if (i === '0') {
        if (newNum[0] === '0' && newNum[1] !== '.') {
          return;
        } else if (newNum[0] === '0' && newNum[1] !== '.' && lastNum[0] == textNum[0]) {
          return;
        } else {
          textNum.push(i);
          storeNum.push(i);
          newNum.push(i);
        }
      }
      //'.'
      else if (i === '.') {
        if (compareOperation(storeNum[storeNum.length - 1])) {
          textNum.push('0', i);
          storeNum.push('0', i);
          newNum.push('0', i);
        } else if (
          (getTotal && lastNum[0] === total && storeNum[storeNum.length - 1] === '.') ||
          (getTotal && !newNum.length) ||
          storeNum[storeNum.length - 1] === '.' ||
          itemFilter(newNum, '.')
        ) {
          return;
        } else {
          textNum.push(i);
          storeNum.push(i);
          newNum.push(i);
        }
      }
      // number
      else {
        if (getTotal) {
          textNum = [];
          storeNum = [];
          lastNum = [];
          total = 0;
          getTotal = false;
          lastNum.push(i);
          textNum.push(i);
          storeNum.push(i);
          newNum.push(i);
        } else if (newNum[0] === '0' && i !== '.') {
          if (newNum[1] === '.') {
            textNum.push(i);
            storeNum.push(i);
            newNum.push(i);
          } else {
            textNum.splice(-1, 1, i);
            storeNum.splice(-1, 1, i);
            newNum.splice(-1, 1, i);
          }
        } else {
          textNum.push(i);
          storeNum.push(i);
          newNum.push(i);
        }
      }
    }
  }
  function calculatorHandle(way) {
    //在最後一個運算後按 = 會一直重複最後的運算
    switch (way) {
      case 'sum':
        if (!storeNum.length) {
          return;
        } else {
          //第一次按下 = 時
          if (!getTotal && !compareOperation(storeNum[storeNum.length - 1])) {
            lastNum.push(newNum.join(''));
            let calculatorNum = calculatorNumHandle(storeNum);
            //小數部分處理
            let calculatorTotal = currencyHandle(String(parseFloat(eval(calculatorNum.join('')).toPrecision(12))));
            total = calculatorTotal;
            getTotal = true;
            newNum = [];
          }
          //初始狀態時，只有一個數字跟加減乘除時，加減乘除數字
          else if (compareOperation(storeNum[storeNum.length - 1])) {
            let newStoreNum = storeNum.concat(lastNum.slice(-2, -1));
            textNum.push(lastNum[lastNum.length - 2]);
            lastNum.push(lastNum[lastNum.length - 2]);
            let calculatorNum = calculatorNumHandle(newStoreNum);
            let calculatorTotal = currencyHandle(String(parseFloat(eval(calculatorNum.join('')).toPrecision(12))));
            storeNum = newStoreNum;
            total = calculatorTotal;
            getTotal = true;
            newNum = [];
          } else {
            //第二次開始按下 = 時
            let newStoreNum = storeNum.concat(lastNum.slice(-2));
            textNum.splice(0, textNum.length, total);
            let newTextNum = textNum.concat(lastNum.slice(-2));
            let calculatorNum = calculatorNumHandle(newStoreNum);
            let calculatorTotal = currencyHandle(String(parseFloat(eval(calculatorNum.join('')).toPrecision(12))));
            storeNum = newStoreNum;
            textNum = newTextNum;
            total = calculatorTotal;
            getTotal = true;
            newNum = [];
          }
        }
        break;
      case 'del':
        if (getTotal) {
          return;
        } else {
          if (storeNum.length) {
            if (newNum.length) {
              newNum.pop();
            } else {
              let splitLastName = lastNum.join('').split('');
              if (compareOperation(lastNum[lastNum.length - 1])) {
                splitLastName.splice(splitLastName.length - 3, 3);
              } else {
                splitLastName.pop();
              }
              newNum = [];
              lastNum = splitLastName;
            }
            let splitTextNum = textNum.join('').split('');
            if (compareOperation(textNum[textNum.length - 1])) {
              splitTextNum.splice(splitTextNum.length - 3, 3);
              textNum = splitTextNum;
            } else {
              textNum.pop();
            }
            let splitStoreNum = storeNum.join('').split('');
            if (compareOperation(storeNum[storeNum.length - 1])) {
              splitStoreNum.splice(splitStoreNum.length - 3, 3);
              storeNum = splitStoreNum;
            } else {
              storeNum.pop();
            }
          } else {
            storeNum = [];
            textNum = [];
          }
        }
        break;
      case 'reset':
        textNum = [];
        lastNum = [];
        newNum = [];
        storeNum = [];
        total = 0;
        getTotal = false;
        break;
    }
  }
  function domListen() {
    calculatorBody.addEventListener('mousedown', e => {
      let text = e.target.textContent;
      if (
        e.target &&
        e.target.nodeName === 'LI' &&
        e.target.id !== 'reset_btn' &&
        e.target.id !== 'delete_btn' &&
        e.target.id !== 'sum_btn'
      ) {
        addNum(text);
      } else {
        switch (e.target.id) {
          case 'sum_btn':
            calculatorHandle('sum');
            getTotal = true;
            break;
          case 'delete_btn':
            calculatorHandle('del');
            break;
          case 'reset_btn':
            calculatorHandle('reset');
            break;
        }
        totalText.setAttribute('value', total);
      }
      watch();
    });
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
          addNum(e.key);
          break;
        case '.':
        case '+':
        case '-':
          addNum(e.key);
          break;
        case '*':
          addNum('×');
          break;
        case '/':
          addNum('÷');
          break;
        case 'Enter':
          keyValue = 'sum';
          calculatorHandle('sum');
          break;
        case 'Backspace':
          keyValue = 'del';
          calculatorHandle('del');
          break;
        case 'Delete':
          keyValue = 'reset';
          calculatorHandle('reset');
          break;
      }
      calculatorNumberLiList.forEach(li => {
        if (li.textContent === keyValue) li.classList.add('has_key_down');
        else if (keyValue === '') li.classList.remove('has_key_down');
      });
      calculatorHandleLiList.forEach(li => {
        let liValue = '';
        switch (li.id) {
          case 'sum_btn':
            liValue = 'sum';
            break;
          case 'delete_btn':
            liValue = 'del';
            break;
          case 'reset_btn':
            liValue = 'reset';
            break;
        }
        if (liValue === keyValue) {
          li.classList.add('has_key_down');
        } else if (keyValue === '') {
          li.classList.remove('has_key_down');
        }
      });
      totalText.setAttribute('value', total);
      watch();
    });
    window.addEventListener('keyup', e => {
      keyValue = '';
      calculatorNumberLiList.forEach(li => {
        if (li.textContent === keyValue) li.classList.add('has_key_down');
        else if (keyValue === '') li.classList.remove('has_key_down');
      });
      calculatorHandleLiList.forEach(li => {
        let liValue = '';
        switch (li.id) {
          case 'sum_btn':
            liValue = 'sum';
            break;
          case 'delete_btn':
            liValue = 'del';
            break;
          case 'reset_btn':
            liValue = 'reset';
            break;
        }
        if (liValue === keyValue) {
          li.classList.add('has_key_down');
        } else if (keyValue === '') {
          li.classList.remove('has_key_down');
        }
      });
    });

    watch();
  }
  domListen();
})();
