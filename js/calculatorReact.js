(function() {
  class Head extends React.Component {
    render(props) {
      let displayControl = {
        display: this.props.getTotal ? 'inline-flex' : 'none'
      };
      return (
        <div className="calculator_head">
          <input
            type="text"
            className={this.props.getTotal ? 'get_total' : 'calculator_text'}
            value={this.props.num}
            readOnly
          />
          <input type="text" className="total" value={this.props.total} readOnly style={displayControl} />
        </div>
      );
    }
  }
  function Num(props) {
    let status = '';
    props.value === props.status ? (status = 'has_key_down') : '';
    return (
      <li
        className={`${props.className} ${status}`}
        onMouseDown={() => {
          props.onMouseDown();
        }}
        onMouseUp={() => props.onMouseUp()}
      >
        {props.value}
      </li>
    );
  }
  class Number extends React.Component {
    renderNum(i, className = '') {
      return (
        <Num
          value={i}
          status={this.props.status}
          className={className}
          onMouseDown={() => {
            this.props.onMouseDown(i);
          }}
          onMouseUp={() => this.props.onMouseUp('')}
        >
          {i}
        </Num>
      );
    }
    render() {
      return (
        <ul className="calculator_number">
          {this.renderNum('7')}
          {this.renderNum('8')}
          {this.renderNum('9')}
          {this.renderNum('÷', 'operation')}
          {this.renderNum('4')}
          {this.renderNum('5')}
          {this.renderNum('6')}
          {this.renderNum('×', 'operation')}
          {this.renderNum('1')}
          {this.renderNum('2')}
          {this.renderNum('3')}
          {this.renderNum('+', 'operation')}
          {this.renderNum('0')}
          {this.renderNum('00')}
          {this.renderNum('.')}
          {this.renderNum('-', 'operation')}
        </ul>
      );
    }
  }
  class CalculatorOperation extends React.Component {
    renderOperation(way, id, value) {
      let className = '';
      way === this.props.status ? (className = 'has_key_down') : (className = '');
      return (
        <li
          id={id}
          value={way}
          status={this.props.status}
          className={className}
          onMouseDown={() => {
            this.props.onMouseDown(way);
          }}
          onMouseUp={() => this.props.onMouseUp()}
        >
          {value}
        </li>
      );
    }
    render(props) {
      return (
        <ul className="calculator_bottom">
          {this.renderOperation('reset', 'reset_btn', 'AC')}
          {this.renderOperation('del', 'delete_btn', '⌫')}
          {this.renderOperation('sum', 'sum_btn', '=')}
        </ul>
      );
    }
  }

  //父組件
  class Calculator extends React.Component {
    //storeNum儲存所有輸入數字跟原符號
    //textNum 顯示出來的數值
    //lastNum 儲存最後運算的值
    //total 計算結果
    //getTotal判斷得到結果沒
    constructor(props) {
      super(props);
      this.state = {
        storeNum: [],
        textNum: [],
        lastNum: [],
        newNum: [],
        total: 0,
        keyValue: '',
        getTotal: false
      };
    }
    add(i) {
      let storeNum = this.state.storeNum.slice(0);
      let textNum = this.state.textNum.slice(0);
      let lastNum = this.state.lastNum.slice(0);
      let newNum = this.state.newNum.slice(0);
      let total = this.state.total;
      let getTotal = this.state.getTotal;
      //初始
      if (!storeNum.length && this.compareOtherNum(i, true)) {
        //只有點時自動補零
        if (i === '.') {
          textNum.push('0', i), storeNum.push('0', i), newNum.push('0', i);
        } else {
          textNum.push('0');
          storeNum.push('0');
          newNum.push('0');
        }
      } else {
        //加減乘除
        if (i === '+' || i === '-' || i === '×' || i === '÷') {
          if (getTotal) {
            lastNum.splice(0, lastNum.length, total);
            textNum.splice(0, textNum.length, total);
            total = 0;
            getTotal = false;
          } else if (this.compareOperation(storeNum[storeNum.length - 1])) {
            lastNum.pop();
            textNum.pop();
            storeNum.pop();
          }
          lastNum.push(newNum.join(''));
          textNum.push(` ${i} `);
          storeNum.push(` ${i} `);
          lastNum.push(` ${i} `);
          newNum = [];
        }
        //number 00
        else if (i === '00') {
          if (
            this.compareOperation(storeNum[storeNum.length - 1]) ||
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
          if (this.compareOperation(storeNum[storeNum.length - 1])) {
            textNum.push('0', i);
            storeNum.push('0', i);
            newNum.push('0', i);
          } else if (
            (getTotal && lastNum[0] === total && storeNum[storeNum.length - 1] === '.') ||
            (getTotal && !newNum.length) ||
            storeNum[storeNum.length - 1] === '.' ||
            this.dotFilter(newNum)
          ) {
            return;
          } else {
            textNum.push(i);
            storeNum.push(i);
            newNum.push(i);
          }
          this.setState({
            storeNum: storeNum,
            textNum: textNum,
            lastNum: lastNum,
            newNum: newNum,
            total: total,
            getTotal: getTotal
          });
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
      this.setState({
        storeNum: storeNum,
        textNum: textNum,
        lastNum: lastNum,
        newNum: newNum,
        total: total,
        getTotal: getTotal,
        keyValue: i
      });
    }
    calculatorHandle(way) {
      //在最後一個運算後按 = 會一直重複最後的運算
      let storeNum = this.state.storeNum.slice(0);
      let textNum = this.state.textNum.slice(0);
      let lastNum = this.state.lastNum.slice(0);
      let newNum = this.state.newNum.slice(0);
      let total = this.state.total;
      let getTotal = this.state.getTotal;
      let keyValue = this.state.keyValue;
      switch (way) {
        case 'sum':
          if (!storeNum.length || !lastNum.length) {
            return;
          } else {
            //第一次按下 = 時
            if (!getTotal && !this.compareOperation(storeNum[storeNum.length - 1])) {
              lastNum.push(newNum.join(''));
              let calculatorNum = this.calculatorNumHandle(storeNum);
              //小數部分處理
              let calculatorTotal = this.currencyHandle(
                String(parseFloat(eval(calculatorNum.join('')).toPrecision(12)))
              );
              total = calculatorTotal;
              getTotal = true;
              newNum = [];
            } //初始狀態時，只有一個數字跟加減乘除時，加減乘除數字
            else if (this.compareOperation(storeNum[storeNum.length - 1])) {
              let newStoreNum = storeNum.concat(lastNum.slice(-2, -1));
              textNum.push(lastNum[lastNum.length - 2]);
              lastNum.push(lastNum[lastNum.length - 2]);
              let calculatorNum = this.calculatorNumHandle(newStoreNum);
              let calculatorTotal = this.currencyHandle(
                String(parseFloat(eval(calculatorNum.join('')).toPrecision(12)))
              );
              storeNum = newStoreNum;
              total = calculatorTotal;
              getTotal = true;
              newNum = [];
            } else {
              //第二次開始按下 = 時
              let newStoreNum = storeNum.concat(lastNum.slice(-2));
              textNum.splice(0, textNum.length, total);
              let newTextNum = textNum.concat(lastNum.slice(-2));
              let calculatorNum = this.calculatorNumHandle(newStoreNum);
              let calculatorTotal = this.currencyHandle(
                String(parseFloat(eval(calculatorNum.join('')).toPrecision(12)))
              );
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
                if (this.compareOperation(lastNum[lastNum.length - 1])) {
                  splitLastName.splice(splitLastName.length - 3, 3);
                } else {
                  splitLastName.pop();
                }
                newNum = [];
                lastNum = splitLastName;
              }
              let splitTextNum = textNum.join('').split('');
              if (this.compareOperation(textNum[textNum.length - 1])) {
                splitTextNum.splice(splitTextNum.length - 3, 3);
                textNum = splitTextNum;
              } else {
                textNum.pop();
              }
              let splitStoreNum = storeNum.join('').split('');
              if (this.compareOperation(storeNum[storeNum.length - 1])) {
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
      this.setState({
        storeNum: storeNum,
        textNum: textNum,
        lastNum: lastNum,
        newNum: newNum,
        total: total,
        getTotal: getTotal,
        keyValue: way
      });
    }

    currencyHandle(num) {
      //參考https://dotblogs.com.tw/alenwu_coding_blog/2017/08/11/js_number_to_currency_comma
      let parts = num.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    compareOperation(item) {
      return item === ' + ' || item === ' - ' || item === ' × ' || item === ' ÷ ';
    }
    compareOtherNum(num, status = false) {
      if (status) {
        return num === '0' || num === '00' || num === '.';
      } else {
        return num !== '0' || num !== '00' || num !== '.';
      }
    }
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
    }
    dotFilter(arr) {
      let hasDot = false;
      arr.forEach(el => {
        if (el === '.') {
          hasDot = true;
        }
      });
      return hasDot;
    }
    text() {
      this.setState({ keyValue: '' });
    }
    componentDidMount() {
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
            this.add(e.key);
            break;
          case '.':
          case '+':
          case '-':
            this.add(e.key);
            break;
          case '*':
            this.add('×');
            break;
          case '/':
            this.add('÷');
            break;
          case 'Enter':
            this.calculatorHandle('sum');
            break;
          case 'Backspace':
            this.calculatorHandle('del');
            break;
          case 'Delete':
            this.calculatorHandle('reset');
            break;
        }
      });
      window.addEventListener('keyup', e => {
        this.setState({ keyValue: '' });
      });
    }
    render() {
      return (
        <div className="calculator">
          <Head
            num={this.state.textNum.length ? this.currencyHandle(this.state.textNum.join('')) : '0'}
            total={this.state.total}
            getTotal={this.state.getTotal}
          />
          <div className="calculator_body">
            <Number status={this.state.keyValue} onMouseDown={i => this.add(i)} onMouseUp={e => this.text()} />
            <CalculatorOperation
              status={this.state.keyValue}
              onMouseDown={way => this.calculatorHandle(way)}
              onMouseUp={() => this.setState({ keyValue: '' })}
            />
          </div>
        </div>
      );
    }
  }

  const app = document.getElementById('app');
  ReactDOM.render(<Calculator />, app);
})(React);
