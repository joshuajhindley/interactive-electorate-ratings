const levels = ["safe", "likely", "lean"]
const validRatings = [
  "close-race",
  "safe-nat",
  "likely-nat",
  "lean-nat",
  "safe-lab",
  "likely-lab",
  "lean-lab",
  "safe-act",
  "likely-act",
  "lean-act",
  "safe-grn",
  "likely-grn",
  "lean-grn",
  "safe-tpm",
  "likely-tpm",
  "lean-tpm"
]
const letterMap = { "ā": "a", "ī": "i", "ō": "o", "ū": "u", " ": "-" }
const MOBILE_BREAKPOINT = 768
var selected = 'close-race'
var results2020 = {}

window.addEventListener('resize', event => {
  const width = event.currentTarget.innerWidth
  if (width < MOBILE_BREAKPOINT && document.getElementsByClassName("desktop-header").length) {
    updateHeaderToMobileView()
  } else if (width >= MOBILE_BREAKPOINT && document.getElementsByClassName("mobile-header").length) {
    updateHeaderToDesktopView()
  }
}, true)

async function handlePageLoad() {
  await fetch('./2020-results.json').then(resp => resp.json()).then(json => results2020 = json)
  var rowElements = document.getElementsByClassName("flex-row")
  var index = 1
  for (var rowElem of rowElements) {
    for (var elem of rowElem.children) {
      var simpleName = elem.textContent.toLowerCase().replace(/[āīōū ]/g, match => letterMap[match])
      elem.id = `${simpleName}-${index}`
      elem.className = results2020[simpleName]
      elem.setAttribute("onclick", "updateElement(id)")
      index++
    }
  }

  if (window.innerWidth < MOBILE_BREAKPOINT) {
    updateHeaderToMobileView()
  }

  var optionsElems = document.getElementsByClassName("options")
  for (var optionsElem of optionsElems) {
    for (var option of optionsElem.children) {
      if (option.className !== "help") {
        option.setAttribute("onclick", "updateSelected(id)")
      }
    }
  }
}

function updateHeaderToMobileView() {
  const rootElem = document.getElementsByClassName("desktop-header").item(0)
  const buttonElems = rootElem.getElementsByClassName("button")

  var buttons = document.createElement("div")
  buttons.className = "buttons"

  for (var buttonElem of Array.from(buttonElems)) {
    rootElem.removeChild(buttonElem)
    buttons.appendChild(buttonElem)
  }

  rootElem.insertAdjacentElement("afterbegin", buttons)
  rootElem.className = "mobile-header"
}

function updateHeaderToDesktopView() {
  const rootElem = document.getElementsByClassName("mobile-header").item(0)
  const buttons = rootElem.getElementsByClassName("buttons").item(0)

  const buttonElems = Array.from(buttons.children)

  rootElem.removeChild(buttons)
  rootElem.insertAdjacentElement("afterbegin", buttonElems[1])
  rootElem.insertAdjacentElement("afterbegin", buttonElems[0])
  rootElem.insertAdjacentElement("beforeend", buttonElems[2])
  rootElem.insertAdjacentElement("beforeend", buttonElems[3])
  rootElem.className = "desktop-header"
}

function load2020Results() {
  loadRatings(results2020)
}

function loadRatings(ratings) {
  var rowElements = document.getElementsByClassName("flex-row")
  backupRatings = {}

  for(var rowElem of rowElements) {
    for (var elem of rowElem.children) {
      const id = elem.id.slice(0, elem.id.lastIndexOf("-"))
      backupRatings[id] = elem.className
    }
  }

  for (var rowElem of rowElements) {
    for (var elem of rowElem.children) {
      const id = elem.id.slice(0, elem.id.lastIndexOf("-"))
      if (!ratings[id]) {
        alert(`Electorate with id "${id}" missing from JSON file.`)
        loadRatings(backupRatings)
        return
      } else if (!validRatings.includes(ratings[id])) {
        alert(`Invalid rating "${ratings[id]}" for electorate with id "${id}".\n\nThe valid ratings are "close-race", "safe-nat", "likely-nat", "lean-nat", `+
          `"safe-lab", "likely-lab", "lean-lab", "safe-act", "likely-act", "lean-act", "safe-grn", "likely-grn", "lean-grn", "safe-tpm", "likely-tpm", and "lean-tpm".`)
        loadRatings(backupRatings)
        return
      } else {
        elem.className = ratings[id]
      }
    }
  }
}

function onChooseFile(event) {
  const files = event.target?.files

  if (!files || typeof window.FileReader !== 'function') {
    alert("Sorry, your browser does not support this functionality.")
    const elem = document.getElementById("import-ratings")
    elem.className = "button disabled"
    elem.onclick = null
  } else if (files[0]) {
    const fr = new FileReader()
    fr.onload = val => {
      loadRatings(JSON.parse(val.target.result))
    }
    fr.readAsText(files[0])
  } else {
    return undefined
  }

  // reset the file to null so the same file can be selected again
  document.getElementById("import-json").value = null
}

function importJson() {
  document.getElementById("import-json").click()
}

function exportJson() {
  var json = {}
  var rowElements = document.getElementsByClassName("flex-row")
  for(var rowElem of rowElements) {
    for (var elem of rowElem.children) {
      const id = elem.id.slice(0, elem.id.lastIndexOf("-"))
      json[id] = elem.className
    }
  }

  const dict = JSON.stringify(json)
  const blob = new Blob([dict], { type: "application/json"})
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "electorate-ratings.json"
  a.click()
}

function updateSelected(value) {
  selected = value
  var elements = document.getElementsByClassName("selected")
  for (var elem of elements) {
      elem.className = elem.classList[0]
  }
  var selectedElem = document.getElementById(value)
  selectedElem.classList.add("selected")
}

function updateElement(id) {
  var mainId = id.slice(0, id.lastIndexOf('-'))
  var elems = document.querySelectorAll(`[id^=${mainId}]`)
  elems = Array.prototype.slice.call(elems).filter(el => el.id.match(`${mainId}-[0-9]+`))
  for (var elem of elems) {
    var currClass = elem.getAttribute('class')
    if (selected === 'close-race') {
      elem.className = 'close-race'
    } else if (currClass.includes(selected)) {
      var nextIndex = (levels.findIndex((val) => val === currClass.split('-')[0]) + 1) % 3
      elem.className = `${levels[nextIndex]}-${currClass.split('-')[1]}`
    } else {
      elem.className = `safe-${selected}`
    }
  }
}

function showHelpModal() {
  const container = document.getElementsByClassName("modal-container").item(0)
  container.style.display = 'block'

  const closeButton = document.getElementsByClassName("close-modal").item(0)

  closeButton.onclick = function() {
    container.style.display = 'none'
    window.onclick = null
  }

  window.onclick = function(event) {
    if (event.target == container) {
      container.style.display = 'none'
      window.onclick = null
    }
  }
}

function capture() {
  var element = document.querySelector("#to-capture")
  const newNodes = []

  var textNode = document.createElement("div")
  textNode.className = "text-to-export"

  var newNode = document.createElement("div")
  newNode.textContent = "Inspired by @120Aotearoa & @Overhang_AoNZ"
  newNode.className = "text"
  textNode.insertAdjacentElement("afterbegin", newNode)

  newNode = document.createElement("div")
  newNode.textContent = "Tool created by Joshua Hindley (@jhindleynz)"
  newNode.className = "text"
  textNode.insertAdjacentElement("afterbegin", newNode)
  element.insertAdjacentElement("afterbegin", textNode)
  newNodes.push(textNode)

  newNode = document.createElement("div")
  newNode.textContent = "Electoral Ratings"
  newNode.className = "title-to-export"
  element.insertAdjacentElement("afterbegin", newNode)
  newNodes.push(newNode)

  // TODO add total number of seats by party

  element.className = "to-capture"

  html2canvas(element, {backgroundColor: '#EEE', height: 780, width: 1470, x: -10, scale: 2}).then(canvas => {
      canvas.toDataURL('image/png')
      var a = document.createElement("a")
      a.href = canvas.toDataURL("image/png")
      a.download = "electorate-ratings.png"
      a.click()
  })

  element.className = null
  for(var childNode of newNodes) {
    element.removeChild(childNode)
  }
}
