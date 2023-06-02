//誤タップでページ消えるのを防止
window.addEventListener("beforeunload", function(event) {
  event.returnValue = null;
});

let roomTable,
    mousePressed,
    xgrid,
    ygrid,
    customArray = [],
    roomBox = document.getElementById("roomBox"),
    inputX = document.getElementById("xgrid"),
    inputY = document.getElementById("ygrid"),
    selectName = document.getElementById("selectName"),
    inputName = document.getElementById("roomName"),
    result = document.getElementById("outputText");

document.addEventListener("mousedown", e => {
  mousePressed = true;
});

document.addEventListener("mouseup", e => {
  mousePressed = false;
});

function onLoad() {//起動時実行
  inputX.value = 10;
  inputY.value = 10;
  inputName.value = "norm";
  selectName.value = "norm";
  createRoom();
  output();
}

function createRoom(){//部屋を作る
  if (inputX.value<1||inputY.value<1||inputX.value>50||inputY.value>50) {//値チェック
    alert("エラー: 横と縦のマス数は、それぞれ1~50にしてください。");
    return;
  }
  xgrid = inputX.value;
  ygrid = inputY.value;
  if (roomTable) roomTable.remove();
  
  roomTable = document.createElement("table");
  roomTable.id = "roomTable";
  let cellSize;
  if (xgrid>20||ygrid>20) {//20のときより小さくするのはダメ
    cellSize = 29
  } else {
    cellSize = 580 / Math.max(xgrid, ygrid)
  }
  roomTable.style.width = cellSize * xgrid + "px";
  roomTable.style.height = cellSize * ygrid + "px";
  roomBox.appendChild(roomTable);
  for (let i = 0; i < ygrid; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < xgrid; j++) {
      const td = document.createElement("td");
      td.textContent = inputName.value;
      td.style.background = bgColor(inputName.value);
      td.style.fontSize = adjustFontSize(inputName.value.length);
      td.addEventListener("click", e => {
        e.target.textContent = selectName.value ? selectName.value : "ㅤ";
        e.target.style.background = bgColor(selectName.value);
        e.target.style.fontSize = adjustFontSize(selectName.value.length);
      });
      td.addEventListener("mousemove", e => {
        if (mousePressed) {
          e.target.textContent = selectName.value ? selectName.value : "ㅤ";
          e.target.style.background = bgColor(selectName.value);
          e.target.style.fontSize = adjustFontSize(selectName.value.length);
        }
      });
      td.id = "td" + i + "-" + j;//id(出力とかに使う)
      tr.appendChild(td);
    }
    roomTable.appendChild(tr)
  }
  
  if (document.getElementById("surround").checked) {//wallでかこむ
    for (let i = 0; i < ygrid; i++) {
      for (let j = 0; j < xgrid; j++) {
        if (!i || !j || i + 1 == ygrid || j + 1 == xgrid) {
          const targ = document.getElementById("td" + i + "-" + j);
          targ.textContent = "wall";
          targ.style.backgroundColor = "#A7A7AF";
          targ.style.fontSize = 150 / Math.max(xgrid, ygrid) + "px";
        }
      }
    }
  }
}

function replaceRoom() {//部屋の置き換え
  const before = document.getElementById("beforeReplace"),
        after = document.getElementById("afterReplace");
  before.value = before.value ? before.value : "ㅤ";
  after.value = after.value ? after.value : "ㅤ";
  
  for (let i = 0; i < ygrid; i++) {
    for (let j = 0; j < xgrid; j++) {
      const targ = document.getElementById("td" + i + "-" + j);
      if (targ.textContent == before.value) {
        targ.textContent = after.value;
        targ.style.background = bgColor(after.value);
        targ.style.fontSize = adjustFontSize(after.value.length);
      }
    }
  }
  
  before.value = "";
  after.value = "";
}

function addCustomRoom() {
  let name  = document.getElementById("customName").value
  const color = document.getElementById("customColor").value;
  name = name ? name : "ㅤ"
  
  if (notNew(name)) {
    alert("エラー: その名前の部屋の色は、デフォルトで設定されています。");
    return;
  }
  
  if (!color||color<0||color>41) {
    alert("エラー: 色は、0~41を指定してください。");
    return;
  }
  
  if (document.getElementById("tr" + name)) {
    document.getElementById("tr" + name).remove()
    customArray = customArray.filter(function(arr){
      return arr[0] != name;
    });
  }
  
  const tr = document.createElement("tr");
  for (let i = 0; i < 3; i++) {
    const td = document.createElement("td");
    if (!i) {
      td.textContent = name
    } else if (i == 1){
      const div = document.createElement("div")
      div.style.display = "inline-block"
      div.textContent = color
      const colBox = document.createElement("div")
      colBox.className = "colorBox"
      colBox.style.background = boxColor(color);
      div.appendChild(colBox)
      td.appendChild(div)
    } else {
      const button = document.createElement("button")
      button.className = "deletebtn"
      button.textContent = "削除"
      button.addEventListener("click", e => {
        document.getElementById(tr.id).remove()
        customArray = customArray.filter(function(arr){
          return arr[0] != name;
        });
        for (let i = 0; i < ygrid; i++) {
          for (let j = 0; j < xgrid; j++) {
            const targ = document.getElementById("td" + i + "-" + j)
            if (targ.textContent == name) {
              targ.style.background = "#FFFFFF"
            }
          }
        }
      })
      td.appendChild(button)
    }
    tr.appendChild(td)
  }
  tr.id = "tr" + name
  customArray.push([name,boxColor(color)])
  for (let i = 0; i < ygrid; i++) {
    for (let j = 0; j < xgrid; j++) {
      const targ = document.getElementById("td" + i + "-" + j)
      if (targ.textContent == name) {
        targ.style.background = boxColor(color)
      }
    }
  }
  document.getElementById("customTable").appendChild(tr)
}

function output() {//出力
  let str = '"ROOM_SETUP": ['
  for (let i = 0; i < ygrid; i++) {
    str += '<br>&nbsp;&nbsp;[ '
    for (let j = 0; j < xgrid; j++) {
      str += '"'+document.getElementById("td" + i + "-" + j).textContent+'", '
    }
    str = str.slice(0,-2);
    str += ' ],'
    if (ygrid == i+1) str = str.slice(0,-1);
  }
  str += '<br>]'
  result.innerHTML = str
  result.style = "border-left: 5px solid #1598d1;"
}

function importRoom() {
  try {
    let room = document.getElementById("import").value;
    room = room.replace(/[\n\r]/g,""); //改行削除
    room = room.substring(room.indexOf("["),room.lastIndexOf("]")+1); //[]の間の文字列を取得
    room = JSON.parse(room); //文字列を変換
    
    const row = room[0].length;
    for (let i = 0; i < room.length; i++) {
      if (row !== room[i].length){
        alert("エラー: 横の長さはすべて同じにしてください。");
        return;
      }
    }  
    if (room[0].length<1||room.length<1||room[0].length>50||room.length>50) {//値チェック
      alert("エラー: 横と縦のマス数は、それぞれ1~50にしてください。");
      return;
    }
    
    xgrid = room[0].length;
    ygrid = room.length;
    
    if (roomTable) roomTable.remove();

    roomTable = document.createElement("table");
    roomTable.id = "roomTable";
    let cellSize;
    if (xgrid>20||ygrid>20) {//20のときより小さくするのはダメ
      cellSize = 29;
    } else {
      cellSize = 580 / Math.max(xgrid, ygrid);
    }
    roomTable.style.width = cellSize * xgrid + "px";
    roomTable.style.height = cellSize * ygrid + "px";
    roomBox.appendChild(roomTable);
    for (let i = 0; i < ygrid; i++) {
      const tr = document.createElement("tr");
      for (let j = 0; j < xgrid; j++) {
        const td = document.createElement("td"),
              roomName = room[i][j];
        td.textContent = roomName;
        td.style.background = bgColor(roomName)
        td.addEventListener("click", e => {
          e.target.textContent = selectName.value ? selectName.value : "ㅤ";
          e.target.style.background = bgColor(selectName.value);
          e.target.style.fontSize = adjustFontSize(selectName.value.length)
        })
        td.addEventListener("mousemove", e => {
          if (mousePressed) {
            e.target.textContent = selectName.value ? selectName.value : "ㅤ"
            e.target.style.background = bgColor(selectName.value)
            e.target.style.fontSize = adjustFontSize(selectName.value.length)
          }
        })
        if (roomName.length>4) {
          td.style.fontSize = 600 / roomName.length / Math.max(xgrid, ygrid) + "px";
        }
        else {
          td.style.fontSize = 150 / Math.max(xgrid, ygrid) + "px";
        }
        td.id = "td" + i + "-" + j//id(出力とかに使う)
        tr.appendChild(td)
      }
      roomTable.appendChild(tr)
    }
    alert("インポートに成功しました！横"+xgrid+"、縦"+ygrid+"マス")
    document.getElementById("import").value = "";
  } catch(err) {
    alert("エラー: インポート可能な文字列として認識できません。");
  }
}

function bgColor(room) {//部屋の色決め
  switch(room) {
    case "norm":
      return "#DBDBDB";
    case "nest":
      return "#C4B9DC";
    case "roid":
      return "radial-gradient(at left top, #A7A7AF 50%, rgba(255,255,255,0) 50%),radial-gradient(at right bottom, #A7A7AF 30%, #DBDBDB 30%)";
    case "rock":
      return "radial-gradient(at right bottom, #A7A7AF 30%, #DBDBDB 30%)";
    case "bas1":
    case "bap1":
    case "dom1":
    case "dbc1":
    case "bad1":
    case "spw1":
      return "#ABCBD6";
    case "bas2":
    case "bap2":
    case "dom2":
    case "dbc2":
    case "bad2":
    case "spw2":
      return "#C3D2AC";
    case "bas3":
    case "bap3":
    case "dom3":
    case "dbc3":
    case "bad3":
    case "spw3":
      return "#DDACAD"
      break;
    case "bas4":
    case "bap4":
    case "dom4":
    case "dbc4":
    case "bad4":
    case "spw4":
      return "#D7B8C8";
    case "domx":
    case "dom0":
    case "dbc0":
    case "spw0":
      return "#E5E2C0";
    case "port":
      return "#484848";
    case "por1":
      return "#3CA4CB";
    case "por2":
      return "#8ABC3F";
    case "por3":
      return "#E03E41";
    case "por4":
      return "#CC669C";
    case "edge":
      return "#C5C5C5";
    case "dor1":
      return "#DFE0E4";
    case "wall":
      return "#A7A7AF";
    default:
      for (let i = 0; i < customArray.length; i++) {
        if (room == customArray[i][0]) {
          return customArray[i][1];
        }
      }
      return "#FFFFFF";
  }
}

function boxColor(n) {//色決め
  switch (n) {
    case "0":
      return "#7ADBBC";
    case "1":
      return "#B9E87E";
    case "2":
      return "#E7896D";
    case "3":
      return "#FDF380";
    case "4":
      return "#B58EFD";
    case "5":
      return "#EF99C3";
    case "6":
      return "#E8EBF7";
    case "7":
      return "#AA9F9E";
    case "8":
      return "#FFFFFF";
    case "9":
      return "#484848";
    case "10":
      return "#3CA4CB";
    case "11":
      return "#8ABC3F";
    case "12":
      return "#E03E41";
    case "13":
      return "#EFC74B";
    case "14":
      return "#8D6ADF";
    case "15":
      return "#CC669C";
    case "16":
      return "#A7A7AF";
    case "17":
      return "#726F6F";
    case "18":
      return "#DBDBDB";
    case "19":
      return "#000000";
    case "20":
      return "linear-gradient(90deg, #3CA4CB 50%, #E03E41 50%)";
    case "21":
      return "linear-gradient(90deg, #3CA4CB 50%, #A7A7AF 50%)";
    case "22":
      return "linear-gradient(270deg, #3CA4CB 50%, #A7A7AF 50%)";
    case "23":
      return "linear-gradient(90deg, #E03E41 50%, #A7A7AF 50%)";
    case "24":
      return "linear-gradient(270deg, #E03E41 50%, #A7A7AF 50%)";
    case "30":
      return "#A913CF";
    case "31":
      return "#226EF6";
    case "32":
      return "#FF1000";
    case "33":
      return "#FF9000";
    case "34":
      return "#00E00B";
    case "35":
      return "#FFD300";
    case "36":
      return "linear-gradient(to right,#e60000,#f39800,#fff100,#009944,#0068b7,#1d2088,#920783)";
    case "37":
      return "linear-gradient(90deg, #55CDFC 0% 33%, #FFFFFF 33% 66%, #F7A8B8 66% 100%)";
    case "39":
      return "#654321";
    case "40":
      return "#E58100";
    case "41":
      return "#267524";
    default:
      return "linear-gradient(0deg, #000000 15%, transparent 15%),"+
      "linear-gradient(90deg, #000000 15%, transparent 15%),"+
      "linear-gradient(180deg, #000000 15%, transparent 15%),"+
      "linear-gradient(270deg, #000000 15%, transparent 15%)";
  }
}

function notNew(room) {//デフォルトで設定されてるかチェック
  switch(room) {
    case "norm":
    case "nest":
    case "roid":
    case "rock":
    case "bas1":
    case "bap1":
    case "dom1":
    case "dbc1":
    case "bad1":
    case "spw1":
    case "bas2":
    case "bap2":
    case "dom2":
    case "dbc2":
    case "bad2":
    case "spw2":
    case "bas3":
    case "bap3":
    case "dom3":
    case "dbc3":
    case "bad3":
    case "spw3":
    case "bas4":
    case "bap4":
    case "dom4":
    case "dbc4":
    case "bad4":
    case "spw4":
    case "domx":
    case "dom0":
    case "dbc0":
    case "spw0":
    case "port":
    case "por1":
    case "por2":
    case "por3":
    case "por4":
    case "edge":
    case "dor1":
    case "wall":
      return true;
    default:
      return false;
  }
}

function adjustFontSize(length) {//文字の大きさ調整
  if (length > 4) {
    return 600 / length / Math.max(xgrid, ygrid) + "px";
  }
  else {
    return 150 / Math.max(xgrid, ygrid) + "px";
  }
}

function copyToClipboard() {//コピー
  let r = document.createRange();
  r.selectNode(result);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(r);
  try {
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert("コピーしました!");
    result.style = "border-left: 5px solid #8cbc46;";
  } catch (err) {
    alert("コピーに失敗しました");
  }
}
