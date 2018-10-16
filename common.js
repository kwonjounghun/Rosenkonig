function clone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  var copy = obj.constructor();

  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = clone(obj[attr]);
    }
  }

  return copy;
}

function config() {
  this.board = document.querySelector(".game-board");
  this.crown = document.createElement("div");
  this.crown.classList.add("crown");
  this.player1 = document.querySelector(".player1");
  this.player2 = document.querySelector(".player2");
  this.cardDeck = document.querySelector(".card-deck .card-list");
  this.useCardDeck = document.querySelector(".use-card-deck");
  this.cardDeckBtn = document.querySelector(".card-deck .card-get");
  // 블록 한 칸의 크기
  this.blockSize = 11.1111;
  // 사용할 수 있는 토큰의 수
  this.token = 52;
  // turn이 true면 player1 false면 player2
  this.turn = false;
  // 왕관의 위치
  this.crownPosition = 41;
  // 방향
  this.direction = [-9, -8, 1, 10, 9, 8, -1, -10];
  // 간격
  this.interval = [1, 2, 3];
  // 가져올 수 있는 카드들
  this.cards = [];
  // 사용한 카드들
  this.useCards = [];
  // 내 패
  this.player1Cards = [null, null, null, null, null];
  this.player2Cards = [null, null, null, null, null];
  // 영웅카드
  this.player1Hero = 4;
  this.player2Hero = 4;
  this.player1UsedCardCount = 0;
  this.player2UsedCardCount = 0;

  this.player1Block = [];
  this.player2Block = [];

  this.player1Cost = 0;
  this.player2Cost = 0;

  this.gameEnd = () => {
    let winer = "빨강";
    if(this.player1Cost < this.player2Cost){
      winer = "파랑";
    }
    setTimeout(() => {
      alert(`${winer} 승리!`);
      location.reload();
    }, 500);
  };
}

function rosenKonig() {
  const Config = new config();

  ////////////////////////////////////////////////////////////
  //                       공용 함수                          //
  ////////////////////////////////////////////////////////////

  // 점수를 등록하는 함수
  function getCost(arr) {
    let cost = 0;
    for (let i of arr) {
      if (i.constructor.name === "Array") {
        let length = i.length;
        if (length === 1) continue;
        cost += length * length;
      }
    }
    return cost;
  }

  // 배열이 중복된건지 확인하는 함수
  function overlapCheck(num, arr) {
    for (let i of arr) {
      if (i === num) {
        return false;
      }
    }
    return true;
  }

  // 기준 영토 주변 영토를 반환하는 함수
  function sideBlock(num) {
    let arr = [];
    let up = num - 9;
    let right = num - 1;
    let down = num + 9;
    let left = num + 1;
    if (num > 9) {
      arr.push(up);
    }
    if (num % 9 !== 1) {
      arr.push(right);
    }
    if (num % 9) {
      arr.push(left);
    }
    if (num < 73) {
      arr.push(down);
    }
    return arr;
  }

  // 점수 계산하는 함수
  function HowManyPoints(user) {
    let playerBlock = "player1Block";
    let coust = "player1Cost";
    if (!user) {
      playerBlock = "player2Block";
      coust = "player2Cost";
    }
    function checkBlock(num, arr, root) {
      arr.splice(arr.indexOf(num), 1);
      let basic = sideBlock(num);
      let check = [];

      for (let item of basic) {
        for (let i of arr) {
          if (item === i) check.push(item);
        }
      }
      if (check.length > 0) {
        check.map(item => {
          checkBlock(item, arr, root);
        });
      }
      if (overlapCheck(num, root)) {
        root.push(num);
      }
    }
    let costArr = [];
    let copyArr = Config[playerBlock].slice();
    for (let i = 0; i < copyArr.length; i = 0) {
      let root = [];
      checkBlock(copyArr[i], copyArr, root);
      costArr.push(root);
    }
    Config[coust] = getCost(costArr);
    console.log(Config.player1Cost, Config.player2Cost);
  }

  // 렌덤하게 카드를 섞는 함수
  function shuffle(a) {
    let newCards = [];
    // copyCard = Array.from(copyCard);
    for (i = 0; i < a.length; i) {
      let j = Math.floor(Math.random() * a.length);
      newCards.push(clone(a[j]));
      a.splice(j, 1);
    }
    return newCards;
  }

  // 카드 객체 정보를 토대로 카드 Element를 만드는 함수
  function createCard() {
    Config.cards.map((item, index) => {
      let card = document.createElement("div");
      let content = document.createElement("div");
      let interval = item.name.split("_")[0];
      let direction = item.name.split("_")[1];
      content.classList.add("content");
      card.classList.add("card");
      card.classList.add(item.name);
      card.classList.add(interval);
      card.classList.add(direction);
      card.classList.add("deck");
      card.setAttribute("style", `transform: translateX(${index * 5}px)`);
      card.appendChild(content);
      Config.cardDeck.appendChild(card);
    });
  }

  // 넘겨받은 숫자의 위치값을 계산하여 top, left 값으로 반환
  function whereAreYou(num) {
    let row = 0;
    let block = 0;
    row = Math.ceil(num / 9) - 1;
    block = num - row * 9 - 1;
    return `top: ${row * Config.blockSize}%; left: ${block *
      Config.blockSize}%`;
  }

  // 움직이고자 하는 위치가 적절한지 확인하는 함수
  function isMove(crown, interval, direction) {
    let row = Math.ceil(crown / 9);
    let block = crown - (row - 1) * 9;
    switch (String(direction)) {
      case "-10":
        return row - interval > 0 && block - interval > 0;
        break;
      case "8":
        return row + interval < 10 && block - interval > 0;
        break;
      case "-9":
        return row - interval > 0;
        break;
      case "9":
        return row + interval < 10;
        break;
      case "1":
        return block + interval < 10;
        break;
      case "-1":
        return block - interval > 0;
        break;
      case "10":
        return row + interval < 10 && block + interval < 10;
        break;
      case "-8":
        return row - interval > 0 && block + interval < 10;
        break;
    }
  }

  // 차례를 넘기는 함수
  function turnEnd() {
    Config.turn = !Config.turn;
    let currentPlayer = Config.player1;
    let nextPlayer = Config.player2;
    if (!Config.turn) {
      currentPlayer = Config.player2;
      nextPlayer = Config.player1;
    }
    currentPlayer.classList.remove("not-my-turn");
    nextPlayer.classList.add("not-my-turn");
    document.querySelector(".header .p1hero").textContent = Config.player1Hero;
    document.querySelector(".header .p2hero").textContent = Config.player2Hero;
    document.querySelector(".header .token").textContent = Config.token;
    document.querySelector(".header .p1cost").textContent = Config.player1Cost;
    document.querySelector(".header .p2cost").textContent = Config.player2Cost;
    availableCard();
  }

  // 움직일 수 있는 카드인지 확인하는 함수
  function availableCard() {
    let player = "player1Cards";
    let playerColor = "red";
    let enemyColor = "blue";
    let playerHero = "player1Hero";
    let userCount = "player1UsedCardCount";
    let count = 5;
    if (!Config.turn) {
      player = "player2Cards";
      playerColor = "blue";
      enemyColor = "red";
      playerHero = "player2Hero";
      userCount = "player2UsedCardCount";
    }
    Config[player].map((item, i) => {
      if (item == null) return;

      let card = document.querySelector(`.${item.name}`);
      let nextPostion = `.block${Config.crownPosition +
        item.interval * item.direction}`;

      if (
        !isMove(Config.crownPosition, item.interval, item.direction) ||
        document.querySelector(nextPostion).classList.contains(playerColor) ||
        (document.querySelector(nextPostion).classList.contains(enemyColor) &&
          !Config[playerHero])
      ) {
        count -= 1;
        card.classList.add("not-used");
        return;
      }

      card.classList.remove("not-used");
    });

    Config[userCount] = count;

    if (!Config.player1UsedCardCount && !Config.player2UsedCardCount) {
      Config.gameEnd();
      init();
    }
    if (!Config[userCount]) turnEnd();
  }

  // 게임이 끝났는지 확인하는 함수
  function isGameEnd(num) {
    return num === 0;
  }

  ////////////////////////////////////////////////////////////
  //                       공용 함수                          //
  ////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////
  //                       게임 로직                          //
  ////////////////////////////////////////////////////////////

  // deck에서 카드를 가져오는 함수
  function getFromDeck() {
    let player = "player1";
    let playerCards = "player1Cards";
    let index = null;
    if (!Config.turn) {
      player = "player2";
      playerCards = "player2Cards";
    }
    for (let i = 0; i < Config[playerCards].length; i++) {
      if (Config[playerCards][i] == null) {
        index = i;
        break;
      }
    }
    if (index == null) {
      return;
    } else {
      addEvent(Config[playerCards], Config[player], index);
      turnEnd();
    }
  }

  // 카드한장을 가져오는 함수
  function getCard(user, num) {
    if (Config.cards.length === 0) {
      Config.cards = shuffle(Config.useCards);
      document.querySelector(".shufflSound").play();
      createCard();
      Config.useCards = [];
      Array.from(Config.useCardDeck.childNodes).map((item, i) => {
        Config.useCardDeck.removeChild(item);
      });
    }
    let deckSound = document.querySelector(".deckSound");
    deckSound.pause();
    deckSound.currentTime = 0;
    setTimeout(() => {
      deckSound.play();
    }, 100);
    return (user[num] = Config.cards.pop());
  }

  // 손에 든 카드를 사용했을 때 손에있는 카드를 제거하는 함수
  function removeHandCard(card, index) {
    let currentUser = "player1Cards";
    card.parentNode.removeChild(card);
    Config.useCardDeck.appendChild(card);
    if (!Config.turn) {
      currentUser = "player2Cards";
    }
    Config.useCards.push(clone(Config[currentUser][index]));
    Config[currentUser].splice(index, 1, null);
  }

  // 플레이어의 영토가 빈영토인지 확인하여 block배열에 추가하는 함수
  function addBlocks(block) {
    let blockArr = "player1Block";
    let enemyArr = "player2Block";
    if (!Config.turn) {
      blockArr = "player2Block";
      enemyArr = "player1Block";
    }
    let indexof = Config[enemyArr].indexOf(block);
    if (indexof > -1) {
      Config[enemyArr].splice(indexof, 1);
    }
    Config[blockArr].push(block);
    Config[blockArr] = Config[blockArr].sort((a, b) => {
      return a - b;
    });
  }

  // 토큰을 배치하는 함수
  function insertToken(card, cardDom, index) {
    let current = "blue";
    let change = "red";
    let target = null;
    if (!Config.turn) {
      current = "red";
      change = "blue";
    }
    Config.crownPosition =
      Config.crownPosition + card.direction * card.interval;
    target = document.querySelector(`.block${Config.crownPosition}`);
    Config.crown.setAttribute("style", whereAreYou(Config.crownPosition));
    target.classList.remove(current);
    target.classList.add(change);
    addBlocks(Config.crownPosition);
    HowManyPoints(true);
    HowManyPoints(false);
    removeHandCard(cardDom, index);
  }

  // 손에 든 카드를 사용할때의 로직
  function behavior(card, cardDom, currentTarget, index) {
    let current = "blue";
    let next = "red";
    let currentPlayerHero = "player1Hero";
    if (!Config.turn) {
      current = "red";
      next = "blue";
      currentPlayerHero = "player2Hero";
    }

    if (currentTarget.classList.contains(current)) {
      if (Config[currentPlayerHero]) {
        if (confirm("영웅을 사용하시겠습니까?")) {
          Config[currentPlayerHero] -= 1;
          insertToken(card, cardDom, index);
          return true;
        } else {
          return false;
        }
      }
      return false;
    } else if (currentTarget.classList.contains(next)) {
      return false;
    } else {
      insertToken(card, cardDom, index);
      if (isGameEnd(Config.token - 1)) {
        Config.gameEnd();
        init();
      } else {
        Config.token -= 1;
      }
    }
    return true;
  }

  // 손으로 가져운 카드에 이벤트를 걸어주는 함수
  function addEvent(userCards, user, i) {
    let card = getCard(userCards, i);
    let cardDom = document.querySelector(`.${card.name}`);
    cardDom.removeAttribute("style");
    cardDom.setAttribute("tabindex", 1);
    cardDom.classList.remove("deck");
    cardDom.classList.add(`card${i + 1}`);
    // 손패로 가져온 카드에 click이벤트를 걸어준다.
    function cardHandle() {
      if (cardDom.classList.contains("not-used")) return;
      let currentTarget = document.querySelector(
        `.block${Config.crownPosition + card.direction * card.interval}`
      );
      let index = i;
      if (this.classList.contains("preview")) {
        this.classList.remove("preview");
        // 미리보기로 확인 후 왕관을 옮기기로 마음먹었을때
        currentTarget.classList.remove("preview");
        if (isMove(Config.crownPosition, card.interval, card.direction)) {
          let turn = behavior(card, cardDom, currentTarget, index);
          if (turn) {
            let clickSound = document.querySelector(".clickSound");
            clickSound.pause();
            clickSound.currentTime = 0;
            setTimeout(() => {
              clickSound.play();
            }, 100);
            cardDom.removeEventListener("click", cardHandle, false);
            cardDom.removeEventListener("blur", blreHandle, false);
            turnEnd();
          }
        }
      } else {
        // 왕관을 움직이기 전 미리보기
        if (isMove(Config.crownPosition, card.interval, card.direction)) {
          this.classList.add("preview");
          currentTarget.classList.add("preview");
        }
      }
    }

    function blreHandle(e) {
      if (this.classList.contains("preview")) {
        this.classList.remove("preview");
        // 미리보기로 확인 후 왕관을 옮기기로 마음먹었을때
        document
          .querySelector(
            `.block${Config.crownPosition + card.direction * card.interval}`
          )
          .classList.remove("preview");
      }
    }
    cardDom.addEventListener("click", cardHandle, false);
    // 손패로 가져온 카드에 blur이벤트를 걸어준다.
    cardDom.addEventListener("blur", blreHandle, false);
    user.appendChild(cardDom);
  }

  ////////////////////////////////////////////////////////////
  //                       게임 로직                          //
  ////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////
  //                         INIT                           //
  ////////////////////////////////////////////////////////////

  // 24개의 card를 만들어주는 함수
  function initCards() {
    for (let i = 0; i < Config.interval.length; i++) {
      for (let j = 0; j < Config.direction.length; j++) {
        let name = `i${Config.interval[i]}_d${Config.direction[j]}`;
        Config.cards.push({
          name,
          interval: Config.interval[i],
          direction: Config.direction[j]
        });
      }
    }
    Config.cards = shuffle(Config.cards);
    createCard();
  }

  // 초기에 플레이어에게 5장의 카드를 분배하는 함수
  function initGetCard(userCards, user) {
    for (let i = 0; i < 5; i++) {
      addEvent(userCards, user, i);
    }
  }

  // 플레이어의 빈 카드 페를 만들어주는 함수
  this.playerGetCardBtns = user => {
    Config.player1Cards.map((item, i) => {
      let btn = document.createElement("button");
      btn.classList.add("card-null");
      btn.addEventListener("click", function() {
        let index = i;
        let userCards = "player1Cards";
        let user = "player1";
        if (!Config.turn) {
          userCards = "player2Cards";
          user = "player2";
        }
        addEvent(Config[userCards], Config[user], index);
        turnEnd();
      });
      user.appendChild(btn);
    });
  };

  // 게임 판을 만드는 함수
  function createBoard() {
    let num = 1;
    for (let i = 1; i < 10; i++) {
      let row = document.createElement("div");
      row.classList.add(`row`);
      let boardRow = document.createElement("div");
      boardRow.classList.add(`board-row`);
      boardRow.classList.add(`clearFix`);

      for (let j = 1; j < 10; j++) {
        let boardBlock = document.createElement("div");
        boardBlock.classList.add(`board-block`);
        boardBlock.classList.add(`block${num}`);
        boardRow.appendChild(boardBlock);
        num++;
      }
      row.appendChild(boardRow);
      Config.board.appendChild(row);
    }
  }

  function init() {
    // 게임 판을 만든다.
    createBoard();
    // 와관 Element를 board의 중앙에 배치한다.
    Config.crown.setAttribute("style", whereAreYou(Config.crownPosition));
    Config.board.insertBefore(Config.crown, Config.board.childNodes[0]);

    // 플레이어에게 각각 5장의 카드를 받을 수 있는 button을 만들어 준다.
    this.playerGetCardBtns(Config.player1);
    this.playerGetCardBtns(Config.player2);

    // 24장의 카드를 생성한다.
    initCards();

    // 각 플레이어에게 5장씩 카드를 분배한다.
    initGetCard(Config.player1Cards, Config.player1);
    initGetCard(Config.player2Cards, Config.player2);

    // 카드 deckdmf 클릭시 해당 차례의 플레이어의 손패에 카드를 전달하는 이벤트를 걸어준다.
    Config.cardDeckBtn.addEventListener("click", getFromDeck);
    turnEnd();
  }

  this.init = init;

  ////////////////////////////////////////////////////////////
  //                         INIT                           //
  ////////////////////////////////////////////////////////////
}
