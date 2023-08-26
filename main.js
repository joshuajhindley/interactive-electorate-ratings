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
var selected = 'close-race'
var results2020 = {}

async function handlePageLoad() {
  await fetch('./2020-results.json').then(resp => resp.json()).then(json => results2020 = json)
  var rowElements = document.getElementsByClassName("flex-row")
  for (var rowElem of rowElements) {
    for (var elem of rowElem.children) {
      var simpleName = elem.textContent.toLowerCase().replace(/[āīōū ]/g, match => letterMap[match])
      elem.id = simpleName
      elem.className = results2020[simpleName]
      elem.setAttribute("onclick", "updateElement(id)")
    }
  }

  var optionsElems = document.getElementsByClassName("options")
  for (var optionsElem of optionsElems) {
    for (var option of optionsElem.children) {
      if (option.className !== "help") {
        option.setAttribute("onclick", "updateSelected(id)")
      }
    }
  }

  if (isMobile.any) {
    var overlayElem = document.getElementsByClassName("overlay").item(0)
    overlayElem.style.display = "block"
  }
}

function load2020Results() {
  loadRatings(results2020)
}

function loadRatings(ratings) {
  var rowElements = document.getElementsByClassName("flex-row")
  backupRatings = {}

  for(var rowElem of rowElements) {
    for (var elem of rowElem.children) {
      backupRatings[elem.id] = elem.className
    }
  }

  for (var rowElem of rowElements) {
    for (var elem of rowElem.children) {
      if (!ratings[elem.id]) {
        alert(`Electorate with id "${elem.id}" missing from JSON file.`)
        loadRatings(backupRatings)
        return
      } else if (!validRatings.includes(ratings[elem.id])) {
        alert(`Invalid rating "${ratings[elem.id]}" for electorate with id "${elem.id}".\n\nThe valid ratings are "close-race", "safe-nat", "likely-nat", "lean-nat", `+
          `"safe-lab", "likely-lab", "lean-lab", "safe-act", "likely-act", "lean-act", "safe-grn", "likely-grn", "lean-grn", "safe-tpm", "likely-tpm", and "lean-tpm".`)
        loadRatings(backupRatings)
        return
      } else {
        elem.className = ratings[elem.id]
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
}

function importJson() {
  document.getElementById("import-json").click()
}

function exportJson() {
  var json = {}
  var rowElements = document.getElementsByClassName("flex-row")
  for(var rowElem of rowElements) {
    for (var elem of rowElem.children) {
      json[elem.id] = elem.className
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
  var elem = document.getElementById(id)
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