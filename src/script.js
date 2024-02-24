//
var tour;
const vscode = acquireVsCodeApi();
var selected;
var index = 1
//
//
//
document.addEventListener("DOMContentLoaded", function () {
  var collapsibleBtns = document.querySelectorAll(".collapsible-btn");

  collapsibleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var content = this.nextElementSibling;
      content.classList.toggle("active");
      var arrow = this.querySelector(".arrow");
      arrow.classList.toggle("rotate");
    });
  });

  // Add the "active" class to the content of the first collapsible on page load
  var firstCollapsibleContent = document.querySelector(
    ".collapsible:first-of-type .content"
  );
  var firstCollapsibleArrow = document.querySelector(
    ".collapsible:first-of-type .arrow"
  );
  firstCollapsibleContent.classList.add("active");
  firstCollapsibleArrow.classList.add("rotate");

  var addFirstStepBtn = document.getElementById("addFirstStepBtn");
  var bottomForm = document.getElementById("bottomForm");
  var topForm = document.getElementById("topForm");

  bottomForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // Add an event listener to the "Create Walkthrough" button in the first collapsible
  topForm.addEventListener("submit", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Hide the first collapsible
    var firstCollapsible = topForm.closest(".collapsible");
    firstCollapsible.querySelector(".content").classList.remove("active");
    var firstArrow = firstCollapsible.querySelector(".arrow");
    firstArrow.classList.remove("rotate");


    // Show the second collapsible
    var secondCollapsible = bottomForm.closest(".collapsible");
    var secondContent = secondCollapsible.querySelector(".content");
    secondContent.classList.add("active");
    var secondArrow = secondCollapsible.querySelector(".arrow");
    secondArrow.classList.add("rotate");
  });
  addFirstStepBtn.addEventListener("click", function () {
    vscode.postMessage({
      command: "selectText",
    });
    bottomForm.style.display = "block"; // Show the bottom form
  });

  // Adding Steps To Preview
  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case "testJson":
        tour = message.data;
        if (message.data) {
          displayInfo(message.data)
          message.data.steps.map((item, index) => {
            var stepDiv = document.createElement("div");
            preSteps(stepDiv, index + 1, item.description);
            document.getElementById("allStepsDiv").appendChild(stepDiv);
          });
          const step1 = document.getElementById(index).nextElementSibling
          step1.style.display = "block";
          console.log("-----Steps------", tour);
          console.log(message.data.steps);
        }

        break;
      case "select":
        console.log("INSIDE Webview");
        console.log(message);
        selected = message.data
        break;
    }
  });
});

function submitForm() {

  const form = document.getElementById("topForm");
  // saveTourName(form.name.value)
  const topFormData = {
    title: form.name.value,
    description: form.description.value,
    steps: []
  };
  tour = topFormData
}
function addStep() {
  var bottomForm = document.getElementById("bottomForm");
  var addFirstStepBtn = document.getElementById("addFirstStepBtn");
  bottomForm.style.display = "none"; // Show the bottom form
  //--------------------
  var bottomForm = document.getElementById("bottomForm");
  console.log("-----clicked------");
  const bottomFormData = {
    data: selected,
    description: bottomForm.description.value,
  };
  tour.steps.push(bottomFormData);
  var stepDiv = document.createElement("div");
  console.log(tour, "++++++++++++++++");
  bottomForm.description.value = ""
  preSteps(stepDiv, tour.steps.length, bottomFormData.description);
  document.getElementById("allStepsDiv").appendChild(stepDiv);
  vscode.postMessage({
    command: "addStep",
    data: bottomFormData,
  });
}
function endStep() {
  var bottomForm = document.getElementById("bottomForm");
  var addFirstStepBtn = document.getElementById("addFirstStepBtn");
  bottomForm.style.display = "none"; // Show the bottom form
  vscode.postMessage({
    command: "endTour",
    data: tour,
  });
}

function displayInfo(data) {

  var topForm = document.getElementById("topForm");
  const walkThroughIfo = document.getElementById('walkThroughIfo')
  const waltTitle = document.getElementById('waltTitle');
  const walkDesc = document.getElementById('walkDesc');
  walkThroughIfo.style.display = "block";
  topForm.style.display = "none";
  waltTitle.textContent = data.title;
  walkDesc.innerHTML = `<p>${marked.parse(data.description)}</p>`;

  // ----------------------------------------
  // Hide the first collapsible
  var firstCollapsible = topForm.closest(".collapsible");
  firstCollapsible.querySelector(".content").classList.remove("active");
  var firstArrow = firstCollapsible.querySelector(".arrow");
  firstArrow.classList.remove("rotate");
  // Show the second collapsible
  var secondCollapsible = bottomForm.closest(".collapsible");
  var secondContent = secondCollapsible.querySelector(".content");
  secondContent.classList.add("active");
  var secondArrow = secondCollapsible.querySelector(".arrow");
  secondArrow.classList.add("rotate");
  var contBtns = document.getElementById("controllBtn")
  var addStepDiv = document.getElementById("addStepsDiv");
  addStepDiv.style.display = "none"
  contBtns.style.display = "flex"
  // const step1 = document.getElementById(index)
  // step1.style.display = "block";

}

function preSteps(parentElement, step, description) {
  const accordion = document.createElement("div");
  accordion.id = "accordion";
  accordion.className = "perStepsDiv";
  const stepDiv = document.createElement("div");
  stepDiv.className = "step";
  const stepTitle = document.createElement("button");
  stepTitle.className = "step-title";
  stepTitle.id = step
  stepTitle.innerHTML = `Step: ${step}<i class="fas fa-chevron-down"></i>`;
  stepTitle.onclick = function () {
    var stepContent = this.nextElementSibling;
    var chevron = this.querySelector("i");
    if (stepContent.style.display === "block") {
      stepContent.style.display = "none";
      chevron.classList.remove("fa-chevron-up");
      chevron.classList.add("fa-chevron-down");
    } else {
      stepContent.style.display = "block";
      chevron.classList.remove("fa-chevron-down");
      chevron.classList.add("fa-chevron-up");
    }
  };
  const stepContent = document.createElement("div");
  stepContent.className = "step-content";
  const desLable = document.createElement("label");
  desLable.className = "desLable";
  desLable.setAttribute("for", "description");
  desLable.innerHTML = "Description:";
  const descriptionDiv = document.createElement("div");
  descriptionDiv.className = "Description";
  const mdDiv = document.createElement("div");
  mdDiv.className = "mdDiv";
  const desContent = document.createElement("div");
  desContent.className = "desContent";
  desContent.innerHTML = marked.parse(description);
  mdDiv.appendChild(desContent);
  descriptionDiv.appendChild(mdDiv);
  stepContent.appendChild(desLable);
  stepContent.appendChild(descriptionDiv);
  stepDiv.appendChild(stepTitle);
  stepDiv.appendChild(stepContent);
  accordion.appendChild(stepDiv);
  parentElement.appendChild(accordion);
}

// document.addEventListener("visibilitychange", () => {
//   if (document.visibilityState === "hidden") {
//     console.log("***************************************");
//     try {
//       vscode.postMessage({
//         command: "addStep",
//         data: "test",
//       });
//     } catch (error) {
//       console.error("Error posting message:", error);
//     }
//   }
// });


function next() {

  if (index == tour.steps.length) {
    vscode.postMessage({
      command: "next",
    });
    return
  }
  const step = document.getElementById(index).nextElementSibling
  easeIn(step)
  // step.style.display = "none";
  index++;

  const step1 = document.getElementById(index).nextElementSibling
  // step1.style.display = "block";
  easeOut(step1)
  console.log('clicked')
  vscode.postMessage({
    command: "next",
  });
}
function stop() {
  console.log('clicked')
  vscode.postMessage({
    command: "stop",
  });
}
function previous() {
  console.log(index)
  if (index == 1) {
    return;
  }
  const step = document.getElementById(index).nextElementSibling
  // step.style.display = "none";
  easeIn(step)
  index--;
  const step1 = document.getElementById(index).nextElementSibling
  easeOut(step1)

  console.log('clicked')
  vscode.postMessage({
    command: "previous",

  });
}

// function saveTourName(tourName) {
//   localStorage.setItem('myTourName', tourName);
//   sessionStorage.setItem('myTourName', tourName);
// }

// // Loading the tour name from localStorage
// function loadTourName() {
//   const savedName = localStorage.getItem('myTourName');
//   if (savedName) {
//     // Update your webview's UI to display the saved name
//     document.getElementById('tourTitle').textContent = savedName;
//   }
// }

// // Example usage when the user updates the name:
// function onTourNameChange(newName) {
//   saveTourName(newName);
// }

// // Load on webview initialization
// loadTourName(); 


function easeOut(step1) {
  step1.style.display = "block";
  step1.style.transition = "opacity 0.5s ease-in-out";
  step1.style.opacity = "0"; // Set initial opacity to 0
  step1.style.display = "block"; // Display the element

  // Force a reflow to ensure the transition will be applied
  step1.offsetWidth;

  // After reflow, set opacity to 1 to trigger the fade-in animation
  step1.style.opacity = "1";
}

function easeIn(step) {
  step.style.transition = "opacity 0.5s ease-in"; // Apply transition for opacity with "ease-in" timing function
  step.style.opacity = "1"; // Set initial opacity to 1 (assuming the element is visible)

  // Force a reflow to ensure the transition will be applied
  step.offsetWidth;

  // After reflow, set opacity to 0 to trigger the fade-out animation
  step.style.opacity = "0";
  step.style.display = "none";
  // After the fade-out animation completes, set display to none
  // setTimeout(() => {

  // }, 500); // Assuming transition duration is 0.5 seconds (500 milliseconds)
}