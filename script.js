'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-05-03T17:01:17.194Z',
    '2022-05-09T23:36:17.929Z',
    '2022-05-07T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
/////////////////////////////////////////////////////////////////////////////////////////////////////
// applying different functionality to our code

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)); // converting these milliseconds in days.

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = `${date.getFullYear()}`;
    // return `${day}/${month}/${year} `;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

// number formatter with Intl API
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// countdown timer
// global variable so that we can persist data and can access by other callback func
let timer;

const startLogOutTimer = function () {
  let time = 1000000000000;
  const tick = function () {
    const min = Math.trunc(time / 60);
    const sec = time % 60;
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = '';
      containerApp.style.opacity = '0';
    }
    time--;
  };
  // rightaway calling the func then after that every 1 sec with setInterval function
  tick(); // to get the timer's starting time correct
  const timer = setInterval(tick, 1000);
  return timer; // so that we can call clearInterval in other func using this id.
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//display movements in application with forEach method AND sorting the movements , toFixed()
// displaying dates along with movements

const displayMovements = function (acc, sort = false) {
  // optional paramter 'sort'(default paramter)

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  containerMovements.innerHTML = ''; // removing the already contained html in container

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // first converting the date string to date object to apply methods in it.
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // format the movements with currency
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    // using toFixed() to limit decimals on movements.
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div> 
    </div>`;

    // adding html on webpage through javascript.
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// compute usernames  with map and forEach methods
// passing data in function rather than using it directly global variables(V.imp)
const username = function (account) {
  account.forEach(function (acc) {
    acc.username = acc['owner']
      .toLowerCase()
      .split(' ')
      .map(val => val[0])
      .join('');
  });
};
username(accounts); // persist the data in our app

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// calculate total balance with reduce method and using textContent property , toFIxed()
const totalBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (sum, val) {
    return sum + val;
  }, 0);
  const formattedBal = formatCur(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = `${formattedBal} `;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// calculate account summary with method chaining , toFixed()
const displaySummary = function (account) {
  const depositSum = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(
    depositSum,
    account.locale,
    account.currency
  );

  const outgoingMoney = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(
    Math.abs(outgoingMoney),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * account.interestRate)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(
    interest,
    account.locale,
    account.currency
  );
};

//so these array methods gives us huge advantage over traditional looping
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// implementing login feature with event handlers, find method, blur(),optional chaining
let currentUser; // this will not be the copy of object, this is a variable which points to the same object in heap. They are the exact same object as in accounts array but they have different name.

// displaying date and time of login

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // to prevent the default behaviour of event
  currentUser = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentUser?.pin === Number(inputLoginPin.value)) {
    // display name
    labelWelcome.textContent = `Welcome back ${currentUser.owner}`;

    // create current date and time
    // experimenting with internationalising API, options object, date time format
    const now = new Date();
    // defining the options object
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    };
    // defining the locale/ language from user's browser
    // const locale = navigator.language;
    // displaying the formatted date with current user's locale
    labelDate.textContent = new Intl.DateTimeFormat(
      currentUser.locale,
      options
    ).format(now);

    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = now.getHours();
    // const min = now.getMinutes();
    // labelDate.textContent = `${day}/${month}/${year} , ${hour}:${min}`;

    // countdown timer, timer is global variable so the data will be persisting
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentUser);

    containerApp.style.opacity = '100'; // we should do thid with classes
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// updating the UI
const updateUI = function (acc) {
  // diaplay movements
  displayMovements(acc);
  // find total balance
  totalBalance(acc);
  // display account summary
  displaySummary(acc);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// implementing transfer money feature with displaying transfer date

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAccount &&
    currentUser.balance >= amount &&
    receiverAccount?.username !== currentUser.username // notes
  ) {
    // transfer money
    currentUser.movements.push(-amount);
    receiverAccount.movements.push(amount);

    //add transfer date by simply creating the current date
    currentUser.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    // update timer, use of global variable
    clearInterval(timer);
    timer = startLogOutTimer();

    // updtae UI
    updateUI(currentUser);
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// deleting the account with findIndex method
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentUser.username === inputCloseUsername.value &&
    currentUser.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.username === inputCloseUsername.value
    );
    // deleting the account
    accounts.splice(index, 1);
    // hiding the UI
    containerApp.style.opacity = '0';
  }
  // cannot do this before if statement, because then the condition will always be false. First we will check and then empty it. ( JS reads code from top to bottom)
  inputClosePin = inputCloseUsername = '';
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// implementing the loan feature with some method , Math.floor() and displaying loan date

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  // don't need to convert to number first, because it will do type coercion.
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentUser.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // add movement
      currentUser.movements.push(amount);

      //add loan date by simply creating the current date
      currentUser.movementsDates.push(new Date().toISOString());

      //update UI
      updateUI(currentUser);
    }, 3000);

    // reset timer, use of gloabal variable
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// sorting the movements -->> VV.important
let sorted = false; // state variable to persist and tell the state of application sorting feature
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  // flipping the variable with NOT operator so that everytime it is opposite
  displayMovements(currentUser, !sorted);
  // each time we click we change the sorted variable, if this is not there then everytime sorted in false.
  sorted = !sorted;
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
