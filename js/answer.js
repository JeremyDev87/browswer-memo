//Question
// 바탕화면(쪽지가 아닌 회색부분)에 마우스 우클릭시 마우스 위치가 top, left값을 가지는 새로운 쪽지를 생성합니다. answer.html 참고(기본 크기 div.textarea : width:200px, height:100px;)
// 쪽지의 헤더 부분 드래그시 쪽지를 바탕화면 내에서 이동이 가능해야합니다.(Drag & Drop 플러그인 사용금지, 직접구현해야 함)
// 드래그 드랍 또는 내용 수정시에 해당하는 쪽지는 겹쳐진 쪽지 중 최상단으로 나와야합니다.
// X 버튼 클릭시 삭제 되어야합니다.
// 쪽지 우 하단 드래그시 크기가 변경되어야 합니다. 크기 변경은 div.textarea의 width, height가 변경되어야 합니다.
// 모든 쪽지 내용, 위치, 크기, 쌓이는 순서는 localStorage에 저장되어야 하며, 리로드시 모든 쪽지가 그대로 나와야합니다.

//To-do 
//1. 우클릭 시 신규 쪽지 생성(기본 크기 div.textarea : width:200px, height:100px;)
//2. 헤더 드래그 시 이동, 드래그 사용 금지
//3. 포커스온 이나 마우스다운 시 쪽지 최상단 노출
//4. X 클릭 시 쪽지 삭제 
//5. 쪽지 우 하단 드래그 시 크기 변경
//6. 쪽지 내용, 위치, 크기, 순서 localStorage 저장, 리로드시 쪽지 노출

//Readme 
//메모의 재사용성을 고려하여 class 활용하였습니다.
//메모 객체에 대한 기능(생성, 삭제, 수정, 저장)은 prototype으로 활용하였습니다. 
//메모 순서는 별도로 저장하지 않고, localStorage의 배열 index를 순서로 사용합니다.
//update prototype에서 새로 localstorage로 delete , insert과정을 통해 새로 마지막 index에 저장하므로
//생성, 수정 순으로 브라우저에 제공할 수 있습니다. 
//다만 mousedown, focus의 경우, update가 돌지 않으므로 z-index로 처리하였습니다. 
//focus만 있을 경우 수정이 없으므로 새로고침 시 최상단 처리하지 않았습니다.
//저장된 메모가 없을 시 1개는 기본으로 생성하게 했습니다.

//Memo Object
class Memo {
    constructor(id, position, size, contents) {
        this.position = position;
        this.size = size;
        this.contents = contents;
        this.id = id !== null ? id : 1;
    }
    html = () => {
        let html = '';
        html += `<div class="memo" id='memo_${this.id}' style="top:${this.position.top}px;left:${this.position.left}px;">`;
        html += '<div class="header">';
        html += '<h1 class="blind">메모장</h1>';
        html += `<button class="btn_close"><span class="blind">닫기</span></button>`;
        html += '</div>';
        html += '<div class="content">';
        html += `<div class="textarea" contenteditable="true" style="width:${this.size.width}px; height:${this.size.height}px;">`;
        html += `${this.contents}`;
        html += '</div>';
        html += '<button class="btn_size"><span class="blind">메모장 크기 조절</span></button>';
        html += '</div>';
        html += '</div>';
        return html;
    }
    saveStorage = () => {
        let existMemo = localStorage?.getItem("memo") ? JSON.parse(localStorage?.getItem("memo")) : [];
        let inputVal = JSON.stringify({
            id: this.id,
            position: { top: this.position.top, left: this.position.left },
            size: { width: this.size.width, height: this.size.height },
            contents: this.contents,
        })
        let setVal = existMemo.length > 0 ? [...existMemo, JSON.parse(inputVal)] : [JSON.parse(inputVal)]
        localStorage.setItem("memo", JSON.stringify(setVal))
    }
    remove = () => {
        if (this.id) document.querySelector(`#memo_${this.id}`)?.remove();
        let existMemo = localStorage?.getItem("memo") ? JSON.parse(localStorage?.getItem("memo")) : [];
        let setVal = existMemo.filter(memo => memo.id !== this.id)
        localStorage.setItem("memo", JSON.stringify(setVal));
    }
    update = (key, value) => {
        this[key] = value;
        let inputVal = JSON.stringify({
            id: this.id,
            position: { top: this.position.top, left: this.position.left },
            size: { width: this.size.width, height: this.size.height },
            contents: this.contents,
        })
        let existMemo = localStorage?.getItem("memo") ? JSON.parse(localStorage?.getItem("memo")) : [];
        let leftMemo = existMemo.filter(memo => memo.id !== this.id);
        let setVal = leftMemo.length > 0 ? [...leftMemo, JSON.parse(inputVal)] : [JSON.parse(inputVal)];
        localStorage.setItem("memo", JSON.stringify(setVal))
    }
}
//global
let memoList = [];
//Init Setting 
setArrInit();
//Create default when have not Memo 
if (!memoList.length > 0) {
    createMemo(null, { top: 100, left: 100 }, { width: 200, height: 100 }, "");
}
setHTML();
existMemoEvents();
//Get Data from localStorage
function setArrInit() {
    let getStorage = JSON.parse(localStorage.getItem("memo"));
    memoList = [];
    if (getStorage) {
        for (let i = 0; i < getStorage.length; i++) {
            let memo = new Memo(getStorage[i].id, getStorage[i].position, getStorage[i].size, getStorage[i].contents)
            memoList.push(memo);
        }
    }
}
//Make HTML
function setHTML() {
    document.querySelector('.wrap').innerHTML = "";
    memoList?.forEach(memo => {
        document.querySelector('.wrap').innerHTML += memo.html();
    })
}
//Make Event
function existMemoEvents() {
    memoList?.forEach(memo => {
        createEvent(memo, "remove");
        createEvent(memo, "changeSize");
        createEvent(memo, "move");
        createEvent(memo, "write");
        createEvent(memo, "focus");
    })
}

//DOM event for Create New Memo 
document.addEventListener("contextmenu", e => {
    createMemo(null, { top: 100, left: 100 }, { width: 200, height: 100 }, "");
    e.preventDefault();
})
//Create dependency Event 
function createEvent(obj, event) {
    if (event === "remove") {
        let closeBtn = document.querySelector(`.wrap > #memo_${obj.id}>.header>.btn_close`);
        closeBtn?.addEventListener('click', () => {
            obj.remove()
            setArrInit();
        })
    } else if (event === "changeSize") {
        let sizeInfo = {
            id: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }
        let memoDiv = document.querySelector(`.wrap > #memo_${obj.id}`);
        let sizeBtn = document.querySelector(`.wrap > #memo_${obj.id}>.content>.btn_size`);
        let changeSizeTarget = document.querySelector(`.wrap > #memo_${obj.id}>.content>.textarea`);
        sizeBtn?.addEventListener('mousedown', (e) => {
            let styles = window.getComputedStyle(changeSizeTarget);
            sizeInfo.id = obj.id;
            sizeInfo.x = e.clientX;
            sizeInfo.y = e.clientY;
            sizeInfo.width = parseInt(styles.width);
            sizeInfo.height = parseInt(styles.height);
            indexingMemo(obj.id);
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        })
        const mouseMoveHandler = (e) => {
            memoDiv.style.opacity = 0.7;
            let dx = e.clientX - sizeInfo.x;
            let dy = e.clientY - sizeInfo.y;
            changeSizeTarget.style.width = `${sizeInfo.width + dx}px`;
            changeSizeTarget.style.height = `${sizeInfo.height + dy}px`;
        }
        const mouseUpHandler = function () {
            memoDiv.style.opacity = 1;
            let updateObj = {
                width: Number(changeSizeTarget.style.width.replace('px', '')),
                height: Number(changeSizeTarget.style.height.replace('px', ''))
            }
            updateMemo(sizeInfo.id, "size", updateObj)
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    } else if (event === "move") {
        let positionInfo = {
            id: 0,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
        }
        let memoDiv = document.querySelector(`.wrap > #memo_${obj.id}`);
        let headerDiv = document.querySelector(`.wrap > #memo_${obj.id}>.header`);
        headerDiv?.addEventListener("mousedown", (e) => {
            let styles = window.getComputedStyle(memoDiv);
            positionInfo.id = obj.id;
            positionInfo.x = e.clientX;
            positionInfo.y = e.clientY;
            positionInfo.left = parseInt(styles.left);
            positionInfo.top = parseInt(styles.top);
            indexingMemo(obj.id);
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        })
        const mouseMoveHandler = (e) => {
            memoDiv.style.opacity = 0.7;
            let dx = e.clientX - positionInfo.x;
            let dy = e.clientY - positionInfo.y;
            memoDiv.style.left = `${positionInfo.left + dx}px`;
            memoDiv.style.top = `${positionInfo.top + dy}px`;
        }
        const mouseUpHandler = function () {
            memoDiv.style.opacity = 1;
            let updateObj = {
                top: Number(memoDiv.style.top.replace('px', '')),
                left: Number(memoDiv.style.left.replace('px', ''))
            }
            updateMemo(positionInfo.id, "position", updateObj)
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    } else if (event === "write") {
        let textDiv = document.querySelector(`.wrap > #memo_${obj.id}>.content>.textarea`);
        textDiv.addEventListener('input', () => {
            updateMemo(obj.id, "contents", textDiv.innerHTML)
        })
    } else if (event === "focus") {
        let textDiv = document.querySelector(`.wrap > #memo_${obj.id}>.content>.textarea`);
        textDiv.addEventListener('focus', () => {
            indexingMemo(obj.id);
        })
    }
}
//Create New Memo Object
function createMemo(id, position, size, contents) {
    id = id !== null ? id : memoList.length > 0 ? memoList.length + 1 : 1;
    const memo = new Memo(id, position, size, contents);
    memo.saveStorage();
    memoList.push(memo);
    document.querySelector('.wrap').innerHTML += memo.html();
    indexingMemo(memo.id)
    existMemoEvents()
}
//Update about Memo
function updateMemo(id, key, value) {
    const index = memoList.findIndex(memo => memo.id === id);
    memoList[index]?.update(key, value);
    indexingMemo(id)
    setArrInit();
}
//Indexing Memo
function indexingMemo(id) {
    let allMemo = document.querySelectorAll('.memo');
    allMemo.forEach(each => each.style.zIndex = 0)
    let memo = document.querySelector(`.wrap > #memo_${id}`);
    memo.style.zIndex = 1;
}
